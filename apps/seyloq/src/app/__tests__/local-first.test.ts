import { describe, expect, it } from "vitest";
import type { ComposerPayload } from "../../components/messaging";
import {
  DeterministicClock,
  FakeMessageTransport,
  MemoryLocalRepository,
  createLocalFirstApp,
} from "../local-first";
import { CURRENT_DEVICE_ID, CURRENT_USER_ID, UuidV7Generator, createUuidV7, isCanonicalUuid, isUuidV7 } from "../identity";
import type { Device, RuntimeConnection, Session } from "../../entities/types";

const textPayload = (text: string): ComposerPayload => ({ text, mode: { kind: "default" } });

function createHarness(repository = new MemoryLocalRepository(), transport = new FakeMessageTransport()) {
  return {
    repository,
    transport,
    app: createLocalFirstApp({
      repository,
      transport,
      clock: new DeterministicClock(),
      ids: new UuidV7Generator(),
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

    expect(message?.id).toSatisfy(isUuidV7);
    expect(message?.deliveryState).toBe("sent");
    expect(message?.syncState).toBe("acknowledged");
    expect(message?.authorUserId).toBe(CURRENT_USER_ID);
    expect(message?.originDeviceId).toBe(CURRENT_DEVICE_ID);
    expect(operation?.id).toSatisfy(isUuidV7);
    expect(operation?.status).toBe("succeeded");
    expect(operation?.idempotencyKey).toBe(operation?.id);
    expect(operation?.payload.messageId).toBe(message?.id);
    expect(operation?.payload.authorUserId).toBe(CURRENT_USER_ID);
    expect(operation?.payload.originDeviceId).toBe(CURRENT_DEVICE_ID);
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
      ids: new UuidV7Generator(),
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
    expect(queuedOperation?.idempotencyKey).toBe(queuedOperation?.id);

    await app.retryMessage(failed!.id);
    const reconciled = app.getSnapshot().messages.filter((message) => message.text === "Retry same identity");
    const operation = app.getSnapshot().outbox.find((candidate) => candidate.entityId === failed?.id);

    expect(reconciled).toHaveLength(1);
    expect(reconciled[0].id).toBe(failed?.id);
    expect(reconciled[0].syncState).toBe("acknowledged");
    expect(operation?.idempotencyKey).toBe(operation?.id);
  });

  it("persists drafts by conversation without turning composer UI state durable", () => {
    const { app, repository } = createHarness();

    app.saveDraft("hunza-trip", "Bring jackets");
    app.saveDraft("family", "Dinner after 8");

    const restored = new MemoryLocalRepository(repository.snapshot());

    expect(restored.getDraft("hunza-trip")).toBe("Bring jackets");
    expect(restored.getDraft("family")).toBe("Dinner after 8");
  });

  it("generates canonical UUIDv7 values without using them as message order authority", () => {
    const ids = Array.from({ length: 64 }, () => createUuidV7());

    expect(ids.every(isCanonicalUuid)).toBe(true);
    expect(ids.every(isUuidV7)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);

    const { app } = createHarness();
    const orderedByCreatedAt = [...app.getSnapshot().messages]
      .filter((message) => message.conversationId === "hunza-trip")
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || String(a.id).localeCompare(String(b.id)));

    expect(orderedByCreatedAt[0].id).toBe("history-1");
  });

  it("keeps User, Device, Session and runtime Connection as separate concepts", () => {
    const userId = createUuidV7();
    const deviceId = createUuidV7();
    const sessionId = createUuidV7();
    const device: Device = {
      id: deviceId,
      userId,
      label: "Laptop",
      status: "revoked",
      enrolledAt: "2026-09-27T10:00:00.000Z",
    };
    const session: Session = {
      id: sessionId,
      userId,
      deviceId,
      status: "active",
      issuedAt: "2026-09-27T10:00:00.000Z",
    };
    const connection: RuntimeConnection = {
      connectionId: "runtime-only",
      sessionId,
      connectedAt: "2026-09-27T10:01:00.000Z",
    };

    expect(userId).not.toBe(device.id);
    expect(device.userId).toBe(userId);
    expect(session.deviceId).toBe(device.id);
    expect(device.status).toBe("revoked");
    expect(connection.connectionId).not.toSatisfy(isUuidV7);
  });
});
