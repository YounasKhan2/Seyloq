import { useEffect, useMemo, useState } from "react";
import { conversations, messages } from "./data/seed";
import type { PrimarySection, ThemeMode } from "./entities/types";
import { AppShell } from "./components/shell";

export function App() {
  const [section, setSection] = useState<PrimarySection>("chats");
  const [activeConversationId, setActiveConversationId] = useState("hunza-trip");
  const [contextOpen, setContextOpen] = useState(() =>
    typeof window === "undefined" ? true : window.innerWidth > 1180,
  );
  const [theme, setTheme] = useState<ThemeMode>("light");

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? conversations[0],
    [activeConversationId],
  );

  const activeMessages = useMemo(
    () => messages.filter((message) => message.conversationId === activeConversation.id),
    [activeConversation.id],
  );

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
      contextOpen={contextOpen}
      onContextToggle={() => setContextOpen((open) => !open)}
      theme={theme}
      onThemeToggle={() => setTheme((mode) => (mode === "light" ? "dark" : "light"))}
    />
  );
}
