import { useMemo, useSyncExternalStore } from "react";
import { conversations as seedConversations, messages as seedMessages } from "../data/seed";
import type { Conversation, Message, MessageReference, Reaction } from "../entities/types";
import type { ComposerPayload } from "../components/messaging";

export type SyncState = "local" | "queued" | "sending" | "acknowledged" | "failed";
export type ConnectivityState = "unknown" | "offline" | "connecting" | "online" | "degraded";
export type OutboxStatus = "queued" | "sending" | "succeeded" | "failed" | "dead";
export type OutboxOperationType = "message.send" | "message.retry";
export type TransportFailureKind = "offline" | "retryable" | "fatal";

export type Clock = {
  now(): Date;
};

export type IdGenerator = {
  next(prefix: string, at?: Date): string;
};

export type OutboxOperation = {
  id: string;
  operationType: OutboxOperationType;
  entityType: "message";
  entityId: string;
  conversationId: string;
  payload: SendMessageOperationPayload;
  idempotencyKey: string;
  attemptCount: number;
  nextAttemptAt: string;
  createdAt: string;
  updatedAt: string;
  status: OutboxStatus;
  lastError?: string;
};

export type SendMessageOperationPayload = {
  messageId: string;
  conversationId: string;
  senderId: string;
  text: string;
  replyTo?: MessageReference;
  createdAt: string;
};

export type Draft = {
  conversationId: string;
  text: string;
  updatedAt: string;
};

export type LocalStateSnapshot = {
  conversations: Conversation[];
  messages: Message[];
  outbox: OutboxOperation[];
  drafts: Draft[];
  connectivity: ConnectivityState;
  lastError?: string;
};

export interface ConversationRepository {
  listConversations(): Conversation[];
}

export interface MessageRepository {
  loadLatest(conversationId: string, limit: number): Message[];
  loadBefore(conversationId: string, cursor: string, limit: number): Message[];
  getMessage(messageId: string): Message | undefined;
  upsertMessage(message: Message): void;
  updateMessage(messageId: string, patch: Partial<Message>): void;
  deleteMessage(messageId: string): void;
}

export interface OutboxRepository {
  enqueue(operation: OutboxOperation): void;
  nextEligible(nowIso: string): OutboxOperation | undefined;
  update(operationId: string, patch: Partial<OutboxOperation>): void;
  list(): OutboxOperation[];
}

export interface DraftRepository {
  getDraft(conversationId: string): string;
  saveDraft(conversationId: string, text: string, updatedAt: string): void;
}

export interface LocalTransactionRepository extends ConversationRepository, MessageRepository, OutboxRepository, DraftRepository {
  transaction<T>(work: () => T): T;
  snapshot(): LocalStateSnapshot;
  replaceSnapshot(snapshot: LocalStateSnapshot): void;
}

export type TransportResult =
  | { ok: true; serverMessageId: string; acknowledgedAt: string; serverSequence: number }
  | { ok: false; retryable: boolean; failureKind: TransportFailureKind; message: string };

export interface MessageTransport {
  sendMessage(operation: OutboxOperation): Promise<TransportResult>;
}

export type LocalFirstApp = {
  subscribe(listener: () => void): () => void;
  getSnapshot(): LocalStateSnapshot;
  sendMessage(conversationId: string, payload: ComposerPayload): Promise<void>;
  editMessage(messageId: string, text: string): void;
  deleteMessage(messageId: string): void;
  retryMessage(messageId: string): Promise<void>;
  toggleReaction(messageId: string, emoji: string): void;
  saveDraft(conversationId: string, text: string): void;
  processOutbox(): Promise<void>;
  setConnectivity(state: ConnectivityState): void;
};

export class SystemClock implements Clock {
  now() {
    return new Date();
  }
}

export class DeterministicClock implements Clock {
  private current: Date;

  constructor(start = "2026-09-26T09:48:00+05:00") {
    this.current = new Date(start);
  }

  now() {
    const value = new Date(this.current);
    this.current = new Date(this.current.getTime() + 1000);
    return value;
  }
}

export class MonotonicIdGenerator implements IdGenerator {
  private lastMs = 0;
  private sequence = 0;

  next(prefix: string, at = new Date()) {
    const ms = at.getTime();
    this.sequence = ms === this.lastMs ? this.sequence + 1 : 0;
    this.lastMs = ms;
    const time = ms.toString(36).padStart(10, "0");
    const counter = this.sequence.toString(36).padStart(3, "0");
    const random = randomToken();
    return `${prefix}_${time}${counter}${random}`;
  }
}

export class MemoryLocalRepository implements LocalTransactionRepository {
  private state: LocalStateSnapshot;

  constructor(seed = createSeedSnapshot()) {
    this.state = structuredCloneSafe(seed);
  }

  transaction<T>(work: () => T): T {
    const previous = structuredCloneSafe(this.state);
    try {
      return work();
    } catch (error) {
      this.state = previous;
      throw error;
    }
  }

  listConversations() {
    return [...this.state.conversations];
  }

  loadLatest(conversationId: string, limit: number) {
    return this.state.messages.filter((message) => message.conversationId === conversationId).slice(-limit);
  }

  loadBefore(conversationId: string, cursor: string, limit: number) {
    const conversationMessages = this.state.messages.filter((message) => message.conversationId === conversationId);
    const cursorIndex = conversationMessages.findIndex((message) => message.id === cursor);
    const end = cursorIndex < 0 ? conversationMessages.length : cursorIndex;
    return conversationMessages.slice(Math.max(0, end - limit), end);
  }

  getMessage(messageId: string) {
    return this.state.messages.find((message) => message.id === messageId);
  }

  upsertMessage(message: Message) {
    const index = this.state.messages.findIndex((candidate) => candidate.id === message.id);
    if (index >= 0) {
      this.state.messages[index] = message;
    } else {
      this.state.messages.push(message);
    }
  }

  updateMessage(messageId: string, patch: Partial<Message>) {
    this.state.messages = this.state.messages.map((message) => (message.id === messageId ? { ...message, ...patch } : message));
  }

  deleteMessage(messageId: string) {
    this.state.messages = this.state.messages.filter((message) => message.id !== messageId);
  }

  enqueue(operation: OutboxOperation) {
    this.state.outbox.push(operation);
  }

  nextEligible(nowIso: string) {
    return this.state.outbox.find((operation) => operation.status === "queued" && operation.nextAttemptAt <= nowIso);
  }

  update(operationId: string, patch: Partial<OutboxOperation>) {
    this.state.outbox = this.state.outbox.map((operation) => (operation.id === operationId ? { ...operation, ...patch } : operation));
  }

  list() {
    return [...this.state.outbox];
  }

  getDraft(conversationId: string) {
    return this.state.drafts.find((draft) => draft.conversationId === conversationId)?.text ?? "";
  }

  saveDraft(conversationId: string, text: string, updatedAt: string) {
    const next = { conversationId, text, updatedAt };
    const index = this.state.drafts.findIndex((draft) => draft.conversationId === conversationId);
    if (index >= 0) {
      this.state.drafts[index] = next;
    } else {
      this.state.drafts.push(next);
    }
  }

  snapshot() {
    return structuredCloneSafe(this.state);
  }

  replaceSnapshot(snapshot: LocalStateSnapshot) {
    this.state = structuredCloneSafe(snapshot);
  }
}

export class BrowserStorageLocalRepository extends MemoryLocalRepository {
  constructor(private readonly key = "seyloq.local.v1") {
    super(readBrowserSnapshot(key));
  }

  override transaction<T>(work: () => T): T {
    const result = super.transaction(work);
    this.persist();
    return result;
  }

  override replaceSnapshot(snapshot: LocalStateSnapshot) {
    super.replaceSnapshot(snapshot);
    this.persist();
  }

  private persist() {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(this.key, JSON.stringify(this.snapshot()));
  }
}

export class FakeMessageTransport implements MessageTransport {
  private available = true;
  private failNext: TransportResult | null = null;
  private sequence = 1000;

  setAvailable(value: boolean) {
    this.available = value;
  }

  failOnce(result: TransportResult) {
    this.failNext = result;
  }

  async sendMessage(operation: OutboxOperation): Promise<TransportResult> {
    if (!this.available) {
      return { ok: false, retryable: true, failureKind: "offline", message: "Transport unavailable" };
    }

    if (this.failNext) {
      const result = this.failNext;
      this.failNext = null;
      return result;
    }

    this.sequence += 1;
    return {
      ok: true,
      serverMessageId: operation.entityId,
      acknowledgedAt: new Date(operation.updatedAt).toISOString(),
      serverSequence: this.sequence,
    };
  }
}

export function createLocalFirstApp({
  repository,
  transport,
  clock = new SystemClock(),
  ids = new MonotonicIdGenerator(),
}: {
  repository: LocalTransactionRepository;
  transport: MessageTransport;
  clock?: Clock;
  ids?: IdGenerator;
}): LocalFirstApp {
  const listeners = new Set<() => void>();
  let connectivity: ConnectivityState = "unknown";
  let lastError: string | undefined;
  let currentSnapshot: LocalStateSnapshot = { ...repository.snapshot(), connectivity, lastError };

  const emit = () => {
    currentSnapshot = { ...repository.snapshot(), connectivity, lastError };
    listeners.forEach((listener) => listener());
  };
  const nowIso = () => clock.now().toISOString();

  const app: LocalFirstApp = {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    getSnapshot() {
      return currentSnapshot;
    },

    async sendMessage(conversationId, payload) {
      const createdAt = nowIso();
      const messageId = ids.next("msg", new Date(createdAt));
      const operationId = ids.next("op", new Date(createdAt));
      const replyTo = payload.mode.kind === "reply" ? payload.mode.message : undefined;

      repository.transaction(() => {
        repository.upsertMessage({
          id: messageId,
          conversationId,
          senderId: "me",
          kind: "text",
          text: payload.text,
          replyTo,
          createdAt,
          mine: true,
          deliveryState: "pending",
          syncState: "queued",
        });
        repository.enqueue({
          id: operationId,
          operationType: "message.send",
          entityType: "message",
          entityId: messageId,
          conversationId,
          payload: {
            messageId,
            conversationId,
            senderId: "me",
            text: payload.text,
            replyTo,
            createdAt,
          },
          idempotencyKey: messageId,
          attemptCount: 0,
          nextAttemptAt: createdAt,
          createdAt,
          updatedAt: createdAt,
          status: "queued",
        });
        repository.saveDraft(conversationId, "", createdAt);
      });

      emit();
      await app.processOutbox();
    },

    editMessage(messageId, text) {
      repository.transaction(() => repository.updateMessage(messageId, { text, edited: true }));
      emit();
    },

    deleteMessage(messageId) {
      repository.transaction(() => repository.deleteMessage(messageId));
      emit();
    },

    async retryMessage(messageId) {
      const operation = repository.list().find((candidate) => candidate.entityId === messageId && candidate.status !== "succeeded");
      const updatedAt = nowIso();
      repository.transaction(() => {
        repository.updateMessage(messageId, { deliveryState: "pending", syncState: "queued" });
        if (operation) {
          repository.update(operation.id, {
            operationType: "message.retry",
            status: "queued",
            nextAttemptAt: updatedAt,
            updatedAt,
          });
        }
      });
      emit();
      await app.processOutbox();
    },

    toggleReaction(messageId, emoji) {
      const message = repository.getMessage(messageId);
      if (!message) return;
      repository.transaction(() => repository.updateMessage(messageId, { reactions: toggleReaction(message.reactions ?? [], emoji) }));
      emit();
    },

    saveDraft(conversationId, text) {
      repository.transaction(() => repository.saveDraft(conversationId, text, nowIso()));
      emit();
    },

    async processOutbox() {
      const operation = repository.nextEligible(nowIso());
      if (!operation) return;

      const startedAt = nowIso();
      repository.transaction(() => {
        repository.update(operation.id, {
          status: "sending",
          attemptCount: operation.attemptCount + 1,
          updatedAt: startedAt,
          lastError: undefined,
        });
        repository.updateMessage(operation.entityId, { syncState: "sending", deliveryState: "pending" });
      });
      emit();

      const result = await transport.sendMessage({ ...operation, updatedAt: startedAt, status: "sending" });
      const completedAt = nowIso();

      repository.transaction(() => {
        if (result.ok) {
          repository.update(operation.id, { status: "succeeded", updatedAt: completedAt });
          repository.updateMessage(operation.entityId, {
            syncState: "acknowledged",
            deliveryState: "sent",
            serverSequence: result.serverSequence,
            serverAcknowledgedAt: result.acknowledgedAt,
          });
          connectivity = "online";
          lastError = undefined;
        } else {
          const nextStatus: OutboxStatus = result.retryable ? "queued" : "dead";
          repository.update(operation.id, {
            status: nextStatus,
            updatedAt: completedAt,
            nextAttemptAt: nextRetryAt(result.retryable, operation.attemptCount + 1, new Date(completedAt)),
            lastError: result.message,
          });
          repository.updateMessage(operation.entityId, {
            syncState: result.retryable ? "queued" : "failed",
            deliveryState: result.retryable ? "pending" : "failed",
          });
          connectivity = result.failureKind === "offline" ? "offline" : "degraded";
          lastError = result.message;
        }
      });
      emit();
    },

    setConnectivity(state) {
      connectivity = state;
      if (transport instanceof FakeMessageTransport) {
        transport.setAvailable(state !== "offline");
      }
      emit();
    },
  };

  return app;
}

export function useLocalFirstSnapshot(app: LocalFirstApp) {
  return useSyncExternalStore(app.subscribe, app.getSnapshot, app.getSnapshot);
}

export function useConversationDraft(app: LocalFirstApp, conversationId: string) {
  const snapshot = useLocalFirstSnapshot(app);
  return useMemo(() => snapshot.drafts.find((draft) => draft.conversationId === conversationId)?.text ?? "", [conversationId, snapshot.drafts]);
}

export function createSeedSnapshot(): LocalStateSnapshot {
  return {
    conversations: seedConversations,
    messages: seedMessages.map((message) => ({
      ...message,
      syncState: message.mine ? "acknowledged" : undefined,
    })),
    outbox: [],
    drafts: [],
    connectivity: "unknown",
  };
}

function readBrowserSnapshot(key: string) {
  if (typeof window === "undefined") return createSeedSnapshot();

  const raw = window.localStorage.getItem(key);
  if (!raw) return createSeedSnapshot();

  try {
    return { ...createSeedSnapshot(), ...JSON.parse(raw) } as LocalStateSnapshot;
  } catch {
    return createSeedSnapshot();
  }
}

function structuredCloneSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function randomToken() {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(36).padStart(2, "0")).join("");
  }

  return Math.random().toString(36).slice(2, 14).padEnd(12, "0");
}

function toggleReaction(reactions: Reaction[], emoji: string) {
  const existing = reactions.find((reaction) => reaction.emoji === emoji);
  const nextReaction: Reaction = existing
    ? { ...existing, count: existing.reactedByMe ? existing.count - 1 : existing.count + 1, reactedByMe: !existing.reactedByMe }
    : { emoji, label: emoji, count: 1, reactedByMe: true };

  return existing
    ? reactions.map((reaction) => (reaction.emoji === emoji ? nextReaction : reaction)).filter((reaction) => reaction.count > 0)
    : [...reactions, nextReaction];
}

function nextRetryAt(retryable: boolean, attemptCount: number, at: Date) {
  if (!retryable) return at.toISOString();

  const boundedSeconds = Math.min(60, 2 ** Math.max(0, attemptCount - 1));
  return new Date(at.getTime() + boundedSeconds * 1000).toISOString();
}
