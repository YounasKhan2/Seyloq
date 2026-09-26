import { useEffect, useMemo, useState } from "react";
import type { PrimarySection, ThemeMode } from "./entities/types";
import { AppShell } from "./components/shell";
import type { ComposerMode } from "./components/messaging";
import {
  BrowserStorageLocalRepository,
  FakeMessageTransport,
  createLocalFirstApp,
  useLocalFirstSnapshot,
} from "./app/local-first";

const localFirstApp = createLocalFirstApp({
  repository: new BrowserStorageLocalRepository(),
  transport: new FakeMessageTransport(),
});

export function App() {
  const [section, setSection] = useState<PrimarySection>("chats");
  const [activeConversationId, setActiveConversationId] = useState("hunza-trip");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [composerMode, setComposerMode] = useState<ComposerMode>({ kind: "default" });
  const [contextOpen, setContextOpen] = useState(() =>
    typeof window === "undefined" ? true : window.innerWidth > 1180,
  );
  const [theme, setTheme] = useState<ThemeMode>("light");
  const snapshot = useLocalFirstSnapshot(localFirstApp);

  const activeConversation = useMemo(
    () => snapshot.conversations.find((conversation) => conversation.id === activeConversationId) ?? snapshot.conversations[0],
    [activeConversationId, snapshot.conversations],
  );

  const activeMessages = useMemo(
    () => snapshot.messages.filter((message) => message.conversationId === activeConversation.id),
    [activeConversation.id, snapshot.messages],
  );

  const editMessage = (messageId: string, text: string) => {
    localFirstApp.editMessage(messageId, text);
  };

  const deleteMessage = (messageId: string) => {
    localFirstApp.deleteMessage(messageId);
    setSelectedIds((current) => {
      const next = new Set(current);
      next.delete(messageId);
      return next;
    });
  };

  const retryMessage = (messageId: string) => {
    void localFirstApp.retryMessage(messageId);
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
    localFirstApp.toggleReaction(messageId, emoji);
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
      conversations={snapshot.conversations}
      activeConversation={activeConversation}
      onConversationChange={setActiveConversationId}
      messages={activeMessages}
      selectedIds={selectedIds}
      composerMode={composerMode}
      onComposerModeChange={setComposerMode}
      onSend={(payload) => void localFirstApp.sendMessage(activeConversation.id, payload)}
      onEdit={editMessage}
      onDelete={deleteMessage}
      onRetry={retryMessage}
      onToggleSelection={toggleSelection}
      onClearSelection={() => setSelectedIds(new Set())}
      onToggleReaction={toggleReaction}
      draftText={snapshot.drafts.find((draft) => draft.conversationId === activeConversation.id)?.text ?? ""}
      onDraftChange={(text) => localFirstApp.saveDraft(activeConversation.id, text)}
      contextOpen={contextOpen}
      onContextToggle={() => setContextOpen((open) => !open)}
      theme={theme}
      onThemeToggle={() => setTheme((mode) => (mode === "light" ? "dark" : "light"))}
    />
  );
}
