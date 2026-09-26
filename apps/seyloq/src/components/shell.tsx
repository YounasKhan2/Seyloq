import {
  Bell,
  Check,
  MessageCircle,
  Mic,
  Moon,
  MoreHorizontal,
  PanelRightClose,
  PanelRightOpen,
  Phone,
  Plus,
  Search,
  Send,
  Sun,
  Users,
  Video,
} from "lucide-react";
import type { Conversation, Message, PrimarySection, ThemeMode, User } from "../entities/types";
import { contextMedia, users } from "../data/seed";
import { Avatar, Badge, Divider, IconButton, SearchField } from "./primitives";
import { LiveObjectCard } from "./live-objects";

const userById = new Map(users.map((user) => [user.id, user]));

export function AppShell({
  section,
  onSectionChange,
  conversations,
  activeConversation,
  onConversationChange,
  messages,
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
  contextOpen: boolean;
  onContextToggle: () => void;
  theme: ThemeMode;
  onThemeToggle: () => void;
}) {
  return (
    <div className={`app-shell ${contextOpen ? "context-open" : "context-closed"}`}>
      <NavigationRail
        section={section}
        onSectionChange={onSectionChange}
        theme={theme}
        onThemeToggle={onThemeToggle}
      />
      <ChatList
        conversations={conversations}
        activeConversationId={activeConversation.id}
        onConversationChange={onConversationChange}
      />
      <ConversationPane
        conversation={activeConversation}
        messages={messages}
        contextOpen={contextOpen}
        onContextToggle={onContextToggle}
      />
      {contextOpen ? <ContextPanel conversation={activeConversation} onClose={onContextToggle} /> : null}
      <PrimaryNavigation section={section} onSectionChange={onSectionChange} />
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
        <div>
          <h1>Seyloq</h1>
          <p>Chats</p>
        </div>
        <IconButton label="New chat">
          <Plus size={17} />
        </IconButton>
      </div>
      <SearchField aria-label="Search conversations" placeholder="Search" />
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
              <span className="chat-item-preview">{conversation.lastMessage}</span>
            </span>
            {conversation.unreadCount > 0 ? <Badge tone="accent">{conversation.unreadCount}</Badge> : null}
          </button>
        ))}
      </div>
    </aside>
  );
}

function ConversationPane({
  conversation,
  messages,
  contextOpen,
  onContextToggle,
}: {
  conversation: Conversation;
  messages: Message[];
  contextOpen: boolean;
  onContextToggle: () => void;
}) {
  return (
    <main className="conversation-pane" aria-label={`${conversation.title} conversation`}>
      <ConversationHeader conversation={conversation} contextOpen={contextOpen} onContextToggle={onContextToggle} />
      <MessageList messages={messages} />
      <MessageComposer />
    </main>
  );
}

function ConversationHeader({
  conversation,
  contextOpen,
  onContextToggle,
}: {
  conversation: Conversation;
  contextOpen: boolean;
  onContextToggle: () => void;
}) {
  return (
    <header className="conversation-header">
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

function MessageList({ messages }: { messages: Message[] }) {
  return (
    <section className="message-list" aria-label="Messages">
      <div className="date-chip">Today</div>
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} sender={userById.get(message.senderId)} />
      ))}
    </section>
  );
}

function MessageBubble({ message, sender }: { message: Message; sender?: User }) {
  return (
    <article className={message.mine ? "message-row mine" : "message-row"}>
      {!message.mine && sender ? <Avatar name={sender.name} initials={sender.initials} color={sender.color} size="sm" /> : null}
      <div className="message-stack">
        {!message.mine && sender ? <span className="sender-name">{sender.name}</span> : null}
        {message.attachment ? (
          <div className="image-attachment" style={{ background: message.attachment.gradient }}>
            <span>{message.attachment.label}</span>
          </div>
        ) : null}
        {message.liveObject ? <LiveObjectCard object={message.liveObject} /> : null}
        {message.body ? <div className="message-bubble">{message.body}</div> : null}
        <footer className="message-meta">
          <time>{message.timestamp}</time>
          {message.delivery ? <span>{message.delivery}</span> : null}
          {message.reactions?.map((reaction) => <span key={reaction}>{reaction}</span>)}
        </footer>
      </div>
    </article>
  );
}

function MessageComposer() {
  return (
    <form className="composer" aria-label="Message composer" onSubmit={(event) => event.preventDefault()}>
      <IconButton label="Add attachment">
        <Plus size={18} />
      </IconButton>
      <textarea aria-label="Message" placeholder="Message..." rows={1} />
      <IconButton label="Record voice note">
        <Mic size={18} />
      </IconButton>
      <IconButton label="Send message" className="send-button">
        <Send size={18} />
      </IconButton>
    </form>
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
        <h3>Structured items</h3>
        <button><Check size={14} /> Altit Fort checklist</button>
        <button><Users size={14} /> Fuel + snacks split</button>
        <button><Bell size={14} /> Golden-hour reminder</button>
      </section>
      <section className="context-section compact-list">
        <h3>Settings</h3>
        <button><Bell size={14} /> Notifications</button>
        <button><MoreHorizontal size={14} /> Privacy and safety</button>
      </section>
    </aside>
  );
}

function PrimaryNavigation({
  section,
  onSectionChange,
}: {
  section: PrimarySection;
  onSectionChange: (section: PrimarySection) => void;
}) {
  const items: Array<[PrimarySection, string]> = [
    ["chats", "Chats"],
    ["updates", "Updates"],
    ["calls", "Calls"],
  ];

  return (
    <nav className="mobile-nav" aria-label="Primary mobile">
      {items.map(([key, label]) => (
        <button key={key} className={section === key ? "active" : ""} onClick={() => onSectionChange(key)}>
          {label}
        </button>
      ))}
    </nav>
  );
}
