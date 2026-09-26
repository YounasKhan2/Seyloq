import { describe, expect, it } from "vitest";
import type { ComposerPayload } from "../../components/messaging";
import {
  DeterministicClock,
  FakeMessageTransport,
  MemoryLocalRepository,
  MonotonicIdGenerator,
  createLocalFirstApp,
} from "../local-first";

const textPayload = (text: string): ComposerPayload => ({ text, mode: { kind: "default" } });

function createHarness(repository = new MemoryLocalRepository(), transport = new FakeMessageTransport()) {
  return {
    repository,
    transport,
    app: createLocalFirstApp({
      repository,
      transport,
      clock: new DeterministicClock(),
      ids: new MonotonicIdGenerator(),
    }),
  };
}

describe("local-first application engine", () => {
  it("loads latest messages and history before a cursor without exposing array slicing to React", () => {
    const { repository } = createHarness();

    const latest = repository.loadLatest("hunza-trip", 3);
    const before = repository.loadBefore("hunza-trip", latest[0].id, 2);

    expect(latest).toHaveLength(3);
    expect(latest.at(-1)?.text).toContain("visible when useful");
    expect(before).toHaveLength(2);
    expect(before[0].conversationId).toBe("hunza-trip");
  });

  it("creates a local message and outbox operation atomically", async () => {
    const { app } = createHarness();

    await app.sendMessage("hunza-trip", textPayload("Atomic local-first send"));
    const snapshot = app.getSnapshot();
    const message = snapshot.messages.find((candidate) => candidate.text === "Atomic local-first send");
    const operation = snapshot.outbox.find((candidate) => candidate.entityId === message?.id);

    expect(message?.id).toMatch(/^msg_/);
    expect(message?.deliveryState).toBe("sent");
    expect(message?.syncState).toBe("acknowledged");
    expect(operation?.id).toMatch(/^op_/);
    expect(operation?.status).toBe("succeeded");
    expect(operation?.idempotencyKey).toBe(message?.id);
  });

  it("keeps pending outbox durable across repository recreation", async () => {
    const { app, repository, transport } = createHarness();
    transport.setAvailable(false);

    await app.sendMessage("hunza-trip", textPayload("Offline durable message"));
    const saved = repository.snapshot();
    const restoredRepository = new MemoryLocalRepository(saved);
    const restored = createLocalFirstApp({
      repository: restoredRepository,
      transport: new FakeMessageTransport(),
      clock: new DeterministicClock("2026-09-26T09:49:00+05:00"),
      ids: new MonotonicIdGenerator(),
    });

    expect(restored.getSnapshot().messages.find((message) => message.text === "Offline durable message")?.syncState).toBe("queued");
    expect(restored.getSnapshot().outbox.find((operation) => operation.payload.text === "Offline durable message")?.status).toBe("queued");

    await restored.processOutbox();
    const reconciled = restored.getSnapshot().messages.filter((message) => message.text === "Offline durable message");

    expect(reconciled).toHaveLength(1);
    expect(reconciled[0].syncState).toBe("acknowledged");
    expect(reconciled[0].serverSequence).toBeGreaterThan(1000);
  });

  it("retry preserves message identity and idempotency key", async () => {
    const { app, transport } = createHarness();
    transport.failOnce({ ok: false, retryable: true, failureKind: "retryable", message: "temporary failure" });

    await app.sendMessage("hunza-trip", textPayload("Retry same identity"));
    const failed = app.getSnapshot().messages.find((message) => message.text === "Retry same identity");
    const queuedOperation = app.getSnapshot().outbox.find((operation) => operation.entityId === failed?.id);

    expect(failed?.syncState).toBe("queued");
    expect(queuedOperation?.idempotencyKey).toBe(failed?.id);

    await app.retryMessage(failed!.id);
    const reconciled = app.getSnapshot().messages.filter((message) => message.text === "Retry same identity");
    const operation = app.getSnapshot().outbox.find((candidate) => candidate.entityId === failed?.id);

    expect(reconciled).toHaveLength(1);
    expect(reconciled[0].id).toBe(failed?.id);
    expect(reconciled[0].syncState).toBe("acknowledged");
    expect(operation?.idempotencyKey).toBe(failed?.id);
  });

  it("persists drafts by conversation without turning composer UI state durable", () => {
    const { app, repository } = createHarness();

    app.saveDraft("hunza-trip", "Bring jackets");
    app.saveDraft("family", "Dinner after 8");

    const restored = new MemoryLocalRepository(repository.snapshot());

    expect(restored.getDraft("hunza-trip")).toBe("Bring jackets");
    expect(restored.getDraft("family")).toBe("Dinner after 8");
  });
});
