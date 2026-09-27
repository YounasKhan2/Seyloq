import {
  Bell,
  Check,
  ChevronLeft,
  MessageCircle,
  Moon,
  MoreHorizontal,
  PanelRightClose,
  PanelRightOpen,
  Phone,
  Plus,
  Search,
  Sun,
  Users,
  Video,
} from "lucide-react";
import { useState } from "react";
import type { ComposerMode, ComposerPayload } from "./messaging";
import { ConversationPane } from "./messaging";
import { contextMedia, users } from "../data/seed";
import type { ConnectivityState } from "../app/local-first";
import type { Conversation, Message, PrimarySection, ThemeMode, User } from "../entities/types";
import { Avatar, Badge, Divider, IconButton, SearchField } from "./primitives";

const userById = new Map(users.map((user) => [user.id, user]));

export function AppShell({
  section,
  onSectionChange,
  conversations,
  activeConversation,
  onConversationChange,
  messages,
  connectivity,
  lastError,
  selectedIds,
  composerMode,
  onComposerModeChange,
  onSend,
  onEdit,
  onDelete,
  onRetry,
  onToggleSelection,
  onClearSelection,
  onToggleReaction,
  onTurnIntoEvent,
  draftText,
  onDraftChange,
  onSetOffline,
  onReconnect,
  contextOpen,
  onContextToggle,
  theme,
  onThemeToggle,
}: {
  section: PrimarySection;
  onSectionChange: (section: PrimarySection) => void;
  conversations: Conversation[];
  activeConversation: Conversation;
  onConversationChange: (id: string) => void;
  messages: Message[];
  connectivity: ConnectivityState;
  lastError?: string;
  selectedIds: Set<string>;
  composerMode: ComposerMode;
  onComposerModeChange: (mode: ComposerMode) => void;
  onSend: (payload: ComposerPayload) => void;
  onEdit: (messageId: string, text: string) => void;
  onDelete: (messageId: string) => void;
  onRetry: (messageId: string) => void;
  onToggleSelection: (messageId: string) => void;
  onClearSelection: () => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
  onTurnIntoEvent: (message: Message) => void;
  draftText: string;
  onDraftChange: (text: string) => void;
  onSetOffline: () => void;
  onReconnect: () => void;
  contextOpen: boolean;
  onContextToggle: () => void;
  theme: ThemeMode;
  onThemeToggle: () => void;
}) {
  const [mobileRoute, setMobileRoute] = useState<"list" | "conversation">(() => {
    if (typeof window === "undefined") return "conversation";
    if (new URLSearchParams(window.location.search).get("screen") === "conversation") return "conversation";
    return window.innerWidth <= 640 ? "list" : "conversation";
  });

  return (
    <div className={`app-shell ${contextOpen ? "context-open" : "context-closed"} mobile-${mobileRoute}`}>
      <NavigationRail
        section={section}
        onSectionChange={onSectionChange}
        theme={theme}
        onThemeToggle={onThemeToggle}
      />
      <ChatList
        conversations={conversations}
        activeConversationId={activeConversation.id}
        onConversationChange={(id) => {
          onConversationChange(id);
          setMobileRoute("conversation");
        }}
      />
      <main className="conversation-pane" aria-label={`${activeConversation.title} conversation`}>
        <ConversationHeader
          conversation={activeConversation}
          contextOpen={contextOpen}
          onContextToggle={onContextToggle}
          onBack={() => setMobileRoute("list")}
        />
        <ConnectionBanner connectivity={connectivity} lastError={lastError} onSetOffline={onSetOffline} onReconnect={onReconnect} />
        <ConversationPane
          conversationTitle={activeConversation.title}
          messages={messages}
          users={users}
          selectedIds={selectedIds}
          composerMode={composerMode}
          onComposerModeChange={onComposerModeChange}
          onSend={onSend}
          onEdit={onEdit}
          onDelete={onDelete}
          onRetry={onRetry}
          onToggleSelection={onToggleSelection}
          onClearSelection={onClearSelection}
          onToggleReaction={onToggleReaction}
          onTurnIntoEvent={onTurnIntoEvent}
          draftText={draftText}
          onDraftChange={onDraftChange}
        />
      </main>
      {contextOpen ? <ContextPanel conversation={activeConversation} onClose={onContextToggle} /> : null}
      <PrimaryNavigation section={section} onSectionChange={onSectionChange} conversationOpen={mobileRoute === "conversation"} />
    </div>
  );
}

function NavigationRail({
  section,
  onSectionChange,
  theme,
  onThemeToggle,
}: {
  section: PrimarySection;
  onSectionChange: (section: PrimarySection) => void;
  theme: ThemeMode;
  onThemeToggle: () => void;
}) {
  return (
    <aside className="nav-rail" aria-label="Primary">
      <Avatar name="Youna" initials="Y" color="#216bff" size="sm" />
      <button
        className={section === "chats" ? "rail-item active" : "rail-item"}
        onClick={() => onSectionChange("chats")}
        aria-label="Chats"
      >
        <MessageCircle size={18} />
      </button>
      <button
        className={section === "updates" ? "rail-item active" : "rail-item"}
        onClick={() => onSectionChange("updates")}
        aria-label="Updates"
      >
        <Bell size={18} />
      </button>
      <button
        className={section === "calls" ? "rail-item active" : "rail-item"}
        onClick={() => onSectionChange("calls")}
        aria-label="Calls"
      >
        <Phone size={18} />
      </button>
      <span className="rail-spacer" />
      <IconButton label={`Switch to ${theme === "light" ? "dark" : "light"} theme`} onClick={onThemeToggle}>
        {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
      </IconButton>
    </aside>
  );
}

function ChatList({
  conversations,
  activeConversationId,
  onConversationChange,
}: {
  conversations: Conversation[];
  activeConversationId: string;
  onConversationChange: (id: string) => void;
}) {
  return (
    <aside className="chat-list" aria-label="Chats">
      <div className="pane-header compact">
        <Avatar name="Youna" initials="Y" color="#216bff" size="sm" />
        <div>
          <h1>Chats</h1>
        </div>
        <IconButton label="New chat">
          <Plus size={17} />
        </IconButton>
      </div>
      <SearchField aria-label="Search conversations" placeholder="Search" />
      <div className="chat-filters" role="tablist" aria-label="Chat filters">
        {["All", "Unread", "Groups"].map((filter, index) => (
          <button key={filter} type="button" className={index === 0 ? "active" : ""} role="tab" aria-selected={index === 0}>
            {filter}
          </button>
        ))}
      </div>
      <div className="chat-list-items">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            className={conversation.id === activeConversationId ? "chat-item active" : "chat-item"}
            onClick={() => onConversationChange(conversation.id)}
          >
            <Avatar name={conversation.title} initials={conversation.title.slice(0, 1)} color={conversation.avatarColor} />
            <span className="chat-item-main">
              <span className="chat-item-title">
                <strong>{conversation.title}</strong>
                <time>{conversation.lastActivity}</time>
              </span>
              <span className="chat-item-preview">
                {conversation.pinned ? "Pinned · " : ""}
                {conversation.muted ? "Muted · " : ""}
                {conversation.draftPreview ?? conversation.lastMessage}
              </span>
            </span>
            <span className="chat-state-stack">
              {conversation.pendingCount ? <span className="pending-dot" aria-label={`${conversation.pendingCount} pending`} /> : null}
              {conversation.unreadCount > 0 ? <Badge tone="accent">{conversation.unreadCount}</Badge> : null}
            </span>
          </button>
        ))}
      </div>
      <button className="archived-link" type="button">
        Archived
      </button>
    </aside>
  );
}

function ConversationHeader({
  conversation,
  contextOpen,
  onContextToggle,
  onBack,
}: {
  conversation: Conversation;
  contextOpen: boolean;
  onContextToggle: () => void;
  onBack: () => void;
}) {
  return (
    <header className="conversation-header">
      <IconButton className="mobile-back" label="Back to chats" onClick={onBack}>
        <ChevronLeft size={18} />
      </IconButton>
      <Avatar name={conversation.title} initials={conversation.title.slice(0, 1)} color={conversation.avatarColor} />
      <div className="conversation-title">
        <strong>{conversation.title}</strong>
        <span>{conversation.subtitle}</span>
      </div>
      <div className="header-actions" role="toolbar" aria-label="Conversation actions">
        <IconButton label="Search in conversation">
          <Search size={17} />
        </IconButton>
        <IconButton label="Start audio call">
          <Phone size={17} />
        </IconButton>
        <IconButton label="Start video call">
          <Video size={17} />
        </IconButton>
        <IconButton label={contextOpen ? "Hide conversation info" : "Show conversation info"} onClick={onContextToggle}>
          {contextOpen ? <PanelRightClose size={17} /> : <PanelRightOpen size={17} />}
        </IconButton>
      </div>
    </header>
  );
}

function ConnectionBanner({
  connectivity,
  lastError,
  onSetOffline,
  onReconnect,
}: {
  connectivity: ConnectivityState;
  lastError?: string;
  onSetOffline: () => void;
  onReconnect: () => void;
}) {
  const offline = connectivity === "offline";

  return (
    <div className={offline ? "connection-banner offline" : "connection-banner"} role="status">
      <span>{offline ? "Waiting for connection. New messages will send when you are back online." : "Online"}</span>
      {lastError ? <small>{lastError}</small> : null}
      <button type="button" onClick={offline ? onReconnect : onSetOffline}>
        {offline ? "Reconnect" : "Simulate offline"}
      </button>
    </div>
  );
}

function ContextPanel({ conversation, onClose }: { conversation: Conversation; onClose: () => void }) {
  const participants = conversation.participants.map((id) => userById.get(id)).filter(Boolean) as User[];

  return (
    <aside className="context-panel" aria-label="Conversation info">
      <div className="pane-header">
        <div>
          <h2>{conversation.title}</h2>
          <p>{conversation.subtitle}</p>
        </div>
        <IconButton label="Close conversation info" onClick={onClose}>
          <PanelRightClose size={17} />
        </IconButton>
      </div>
      <section className="context-section">
        <h3>Participants</h3>
        <div className="participants">
          {participants.map((participant) => (
            <div key={participant.id} className="participant">
              <Avatar name={participant.name} initials={participant.initials} color={participant.color} size="sm" />
              <span>{participant.name}</span>
              <i className={`presence-dot ${participant.presence}`} aria-label={participant.presence} />
            </div>
          ))}
        </div>
      </section>
      <Divider />
      <section className="context-section plan-teaser">
        <strong>Organize this trip?</strong>
        <span>Keep events, lists, places, and money together when the chat gets busy.</span>
        <button type="button">Not now</button>
      </section>
      <section className="context-section compact-list">
        <h3>Upcoming</h3>
        <button>
          <Check size={14} /> Hunza weekend trip
        </button>
        <button>
          <Bell size={14} /> Altit Fort golden-hour walk
        </button>
      </section>
      <section className="context-section compact-list">
        <h3>Lists</h3>
        <button>
          <Check size={14} /> Altit Fort quick checklist
        </button>
      </section>
      <section className="context-section compact-list">
        <h3>Money</h3>
        <button>
          <Users size={14} /> Fuel + snacks split
        </button>
      </section>
      <section className="context-section compact-list">
        <h3>Places</h3>
        <button>
          <Bell size={14} /> Rakaposhi viewpoint
        </button>
      </section>
      <section className="context-section">
        <h3>Shared media</h3>
        <div className="media-grid">
          {contextMedia.map((item) => (
            <div key={item.id} className="media-tile" style={{ background: item.gradient }}>
              {item.label}
            </div>
          ))}
        </div>
      </section>
      <section className="context-section compact-list">
        <h3>Files and links</h3>
        <button>
          <Check size={14} /> trip-itinerary.pdf
        </button>
      </section>
      <section className="context-section compact-list">
        <h3>Settings</h3>
        <button>
          <Bell size={14} /> Notifications
        </button>
        <button>
          <MoreHorizontal size={14} /> Privacy and safety
        </button>
      </section>
    </aside>
  );
}

function PrimaryNavigation({
  section,
  onSectionChange,
  conversationOpen,
}: {
  section: PrimarySection;
  onSectionChange: (section: PrimarySection) => void;
  conversationOpen?: boolean;
}) {
  const items: Array<[PrimarySection, string]> = [
    ["chats", "Chats"],
    ["updates", "Updates"],
    ["calls", "Calls"],
  ];

  return (
    <nav className={conversationOpen ? "mobile-nav conversation-open" : "mobile-nav"} aria-label="Primary mobile">
      {items.map(([key, label]) => (
        <button key={key} className={section === key ? "active" : ""} onClick={() => onSectionChange(key)}>
          {label}
        </button>
      ))}
    </nav>
  );
}
