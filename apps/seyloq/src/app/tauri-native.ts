import { invoke } from "@tauri-apps/api/core";
import type { ComposerPayload } from "../components/messaging";
import type { MessageReference } from "../entities/types";
import type { ConnectivityState, LocalFirstApp, LocalStateSnapshot } from "./local-first";

type NativeSendMessageInput = {
  conversationId: string;
  text: string;
  replyTo?: MessageReference;
};

type NativeAckInput = {
  messageId: string;
  operationId: string;
  serverSequence: number;
  acknowledgedAt: string;
};

export function isTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export function createTauriNativeLocalFirstApp(): LocalFirstApp {
  const listeners = new Set<() => void>();
  let snapshot: LocalStateSnapshot = emptySnapshot();

  const emit = () => listeners.forEach((listener) => listener());

  const refresh = async () => {
    snapshot = await invoke<LocalStateSnapshot>("initialize_local_store");
    emit();
  };

  void refresh();

  const app: LocalFirstApp = {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    getSnapshot() {
      return snapshot;
    },

    async sendMessage(conversationId: string, payload: ComposerPayload) {
      const input: NativeSendMessageInput = {
        conversationId,
        text: payload.text,
        replyTo: payload.mode.kind === "reply" ? payload.mode.message : undefined,
      };
      snapshot = await invoke<LocalStateSnapshot>("send_message", { input });
      emit();
    },

    editMessage() {
      // Message editing remains a browser-development interaction until a native use case is approved.
    },

    deleteMessage() {
      // Message deletion remains a browser-development interaction until a native use case is approved.
    },

    async retryMessage(messageId: string) {
      snapshot = await invoke<LocalStateSnapshot>("retry_operation", { messageId });
      emit();
    },

    toggleReaction() {
      // Reactions are still UI-only in SEY-005; durable reaction protocol belongs to a later milestone.
    },

    saveDraft(conversationId: string, text: string) {
      void invoke<LocalStateSnapshot>("save_draft", { input: { conversationId, text } }).then((next) => {
        snapshot = next;
        emit();
      });
    },

    async processOutbox() {
      snapshot = await invoke<LocalStateSnapshot>("load_sync_status");
      emit();
    },

    setConnectivity(state: ConnectivityState) {
      snapshot = { ...snapshot, connectivity: state };
      emit();
    },
  };

  return app;
}

export async function applyNativeFakeAcknowledgement(input: NativeAckInput) {
  return invoke<LocalStateSnapshot>("apply_fake_acknowledgement", { input });
}

function emptySnapshot(): LocalStateSnapshot {
  return {
    conversations: [],
    messages: [],
    outbox: [],
    drafts: [],
    connectivity: "unknown",
  };
}
