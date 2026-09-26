import { useEffect, useMemo, useState } from "react";
import { conversations, messages } from "./data/seed";
import type { Message, PrimarySection, Reaction, ThemeMode } from "./entities/types";
import { AppShell } from "./components/shell";
import type { ComposerMode, ComposerPayload } from "./components/messaging";

export function App() {
  const [section, setSection] = useState<PrimarySection>("chats");
  const [activeConversationId, setActiveConversationId] = useState("hunza-trip");
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [composerMode, setComposerMode] = useState<ComposerMode>({ kind: "default" });
  const [contextOpen, setContextOpen] = useState(() =>
    typeof window === "undefined" ? true : window.innerWidth > 1180,
  );
  const [theme, setTheme] = useState<ThemeMode>("light");

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? conversations[0],
    [activeConversationId],
  );

  const activeMessages = useMemo(
    () => localMessages.filter((message) => message.conversationId === activeConversation.id),
    [activeConversation.id, localMessages],
  );

  const sendMessage = (payload: ComposerPayload) => {
    const now = new Date("2026-09-26T09:48:00+05:00");
    const replyTo = payload.mode.kind === "reply" ? payload.mode.message : undefined;

    setLocalMessages((current) => [
      ...current,
      {
        id: `local-${current.length + 1}`,
        conversationId: activeConversation.id,
        senderId: "me",
        kind: "text",
        text: payload.text,
        replyTo,
        createdAt: now.toISOString(),
        mine: true,
        deliveryState: "sent",
      },
    ]);
  };

  const editMessage = (messageId: string, text: string) => {
    setLocalMessages((current) =>
      current.map((message) => (message.id === messageId ? { ...message, text, edited: true } : message)),
    );
  };

  const deleteMessage = (messageId: string) => {
    setLocalMessages((current) => current.filter((message) => message.id !== messageId));
    setSelectedIds((current) => {
      const next = new Set(current);
      next.delete(messageId);
      return next;
    });
  };

  const retryMessage = (messageId: string) => {
    setLocalMessages((current) =>
      current.map((message) => (message.id === messageId ? { ...message, deliveryState: "sent" } : message)),
    );
  };

  const toggleSelection = (messageId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  };

  const toggleReaction = (messageId: string, emoji: string) => {
    setLocalMessages((current) =>
      current.map((message) => {
        if (message.id !== messageId) return message;

        const reactions = message.reactions ?? [];
        const existing = reactions.find((reaction) => reaction.emoji === emoji);
        const nextReaction: Reaction = existing
          ? { ...existing, count: existing.reactedByMe ? existing.count - 1 : existing.count + 1, reactedByMe: !existing.reactedByMe }
          : { emoji, label: emoji, count: 1, reactedByMe: true };

        return {
          ...message,
          reactions: existing
            ? reactions.map((reaction) => (reaction.emoji === emoji ? nextReaction : reaction)).filter((reaction) => reaction.count > 0)
            : [...reactions, nextReaction],
        };
      }),
    );
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const controller = () => {
      if (window.innerWidth <= 1180) {
        setContextOpen(false);
      }
    };

    controller();
    window.addEventListener("resize", controller);
    return () => window.removeEventListener("resize", controller);
  }, []);

  return (
    <AppShell
      section={section}
      onSectionChange={setSection}
      conversations={conversations}
      activeConversation={activeConversation}
      onConversationChange={setActiveConversationId}
      messages={activeMessages}
      selectedIds={selectedIds}
      composerMode={composerMode}
      onComposerModeChange={setComposerMode}
      onSend={sendMessage}
      onEdit={editMessage}
      onDelete={deleteMessage}
      onRetry={retryMessage}
      onToggleSelection={toggleSelection}
      onClearSelection={() => setSelectedIds(new Set())}
      onToggleReaction={toggleReaction}
      contextOpen={contextOpen}
      onContextToggle={() => setContextOpen((open) => !open)}
      theme={theme}
      onThemeToggle={() => setTheme((mode) => (mode === "light" ? "dark" : "light"))}
    />
  );
}
