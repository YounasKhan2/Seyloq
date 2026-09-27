import {
  Check,
  CheckCheck,
  Copy,
  CalendarDays,
  Download,
  Edit3,
  FileText,
  Forward,
  MoreHorizontal,
  Mic,
  Paperclip,
  Pause,
  Play,
  RefreshCcw,
  Reply,
  Send,
  Smile,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import type { Attachment, DeliveryState, Message, MessageReference, Reaction, User } from "../entities/types";
import { LiveObjectCard } from "./live-objects";
import { Avatar, IconButton } from "./primitives";

export type MessageGroupPosition = "solo" | "first" | "middle" | "last";

export type RenderableMessage = {
  message: Message;
  groupPosition: MessageGroupPosition;
  showAvatar: boolean;
  showSender: boolean;
  showMeta: boolean;
};

export type ComposerMode =
  | { kind: "default" }
  | { kind: "reply"; message: MessageReference }
  | { kind: "edit"; messageId: string; text: string };

export type ComposerPayload = {
  text: string;
  mode: ComposerMode;
};

export function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function buildMessageReference(message: Message, sender?: User): MessageReference {
  const attachment = message.attachments?.[0];

  return {
    messageId: message.id,
    senderId: message.senderId,
    label: message.mine ? "You" : sender?.name ?? "Unknown",
    excerpt: message.text ?? attachment?.name ?? message.liveObject?.title ?? message.kind,
    attachmentType: attachment?.type,
  };
}

export function groupMessages(messages: Message[]): RenderableMessage[] {
  return messages.map((message, index) => {
    if (message.kind === "system") {
      return { message, groupPosition: "solo", showAvatar: false, showSender: false, showMeta: false };
    }

    const previous = messages[index - 1];
    const next = messages[index + 1];
    const canGroupWithPrevious = isGrouped(message, previous);
    const canGroupWithNext = isGrouped(message, next);
    const groupPosition: MessageGroupPosition =
      canGroupWithPrevious && canGroupWithNext
        ? "middle"
        : canGroupWithPrevious
          ? "last"
          : canGroupWithNext
            ? "first"
            : "solo";

    return {
      message,
      groupPosition,
      showAvatar: !message.mine && !canGroupWithNext,
      showSender: !message.mine && !canGroupWithPrevious,
      showMeta: !canGroupWithNext,
    };
  });
}

function isGrouped(message: Message, candidate?: Message) {
  if (!candidate || candidate.kind === "system" || message.kind === "system") {
    return false;
  }

  const windowMs = 5 * 60 * 1000;
  return (
    candidate.senderId === message.senderId &&
    Boolean(candidate.mine) === Boolean(message.mine) &&
    Math.abs(new Date(message.createdAt).getTime() - new Date(candidate.createdAt).getTime()) <= windowMs
  );
}

export function ConversationPane({
  conversationTitle,
  messages,
  users,
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
}: {
  conversationTitle: string;
  messages: Message[];
  users: User[];
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
}) {
  const userById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);
  const listRef = useRef<HTMLDivElement>(null);
  const initializedScrollRef = useRef(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [turnIntoCandidate, setTurnIntoCandidate] = useState<Message | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [showNewMessages, setShowNewMessages] = useState(false);
  const renderables = useMemo(() => groupMessages(messages), [messages]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const scrollToBottom = () => {
      list.scrollTop = list.scrollHeight;
    };
    const scheduleScrollToBottom = () => {
      scrollToBottom();
      const frame = window.requestAnimationFrame(() => {
        scrollToBottom();
        window.requestAnimationFrame(scrollToBottom);
      });
      const timeout = window.setTimeout(scrollToBottom, 120);

      return () => {
        window.cancelAnimationFrame(frame);
        window.clearTimeout(timeout);
      };
    };

    if (!initializedScrollRef.current) {
      initializedScrollRef.current = true;
      setShowNewMessages(false);
      return scheduleScrollToBottom();
    }

    const nearBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 120;
    if (nearBottom) {
      setShowNewMessages(false);
      return scheduleScrollToBottom();
    } else {
      setShowNewMessages(true);
    }
  }, [messages.length]);

  useEffect(() => {
    const close = (event: KeyboardEvent | globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveMenuId(null);
        onComposerModeChange({ kind: "default" });
        onClearSelection();
      }
    };

    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClearSelection, onComposerModeChange]);

  const jumpToMessage = (messageId: string) => {
    const node = document.querySelector<HTMLElement>(`[data-message-id="${messageId}"]`);
    if (!node) return;
    node.scrollIntoView({ block: "center" });
    setHighlightedId(messageId);
    window.setTimeout(() => setHighlightedId(null), 1000);
  };

  return (
    <>
      {selectedIds.size > 0 ? <SelectionToolbar count={selectedIds.size} onClear={onClearSelection} /> : null}
      <section className="message-list" aria-label={`${conversationTitle} messages`} ref={listRef}>
        {renderables.map((item) => (
          <MessageItem
            key={item.message.id}
            item={item}
            sender={userById.get(item.message.senderId)}
            selected={selectedIds.has(item.message.id)}
            highlighted={highlightedId === item.message.id}
            menuOpen={activeMenuId === item.message.id}
            onMenuOpen={() => setActiveMenuId((id) => (id === item.message.id ? null : item.message.id))}
            onReply={(message) => onComposerModeChange({ kind: "reply", message: buildMessageReference(message, userById.get(message.senderId)) })}
            onEdit={(message) => onComposerModeChange({ kind: "edit", messageId: message.id, text: message.text ?? "" })}
            onDelete={onDelete}
            onRetry={onRetry}
            onToggleSelection={onToggleSelection}
            onToggleReaction={onToggleReaction}
            onTurnInto={() => setTurnIntoCandidate(item.message)}
            onJumpToMessage={jumpToMessage}
          />
        ))}
        <TypingIndicator name="Sana" />
      </section>
      {turnIntoCandidate ? (
        <TurnIntoDialog
          message={turnIntoCandidate}
          onCancel={() => setTurnIntoCandidate(null)}
          onConfirm={() => {
            onTurnIntoEvent(turnIntoCandidate);
            setTurnIntoCandidate(null);
          }}
        />
      ) : null}
      {showNewMessages ? (
        <button className="new-messages-button" onClick={() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight })}>
          New messages
        </button>
      ) : null}
      <MessageComposer mode={composerMode} draftText={draftText} onDraftChange={onDraftChange} onModeChange={onComposerModeChange} onSubmit={onSend} onEdit={onEdit} />
    </>
  );
}

function SelectionToolbar({ count, onClear }: { count: number; onClear: () => void }) {
  return (
    <div className="selection-toolbar" role="toolbar" aria-label="Selected message actions">
      <strong>{count} selected</strong>
      <button type="button">
        <Forward size={14} /> Forward
      </button>
      <button type="button">
        <Copy size={14} /> Copy
      </button>
      <button type="button" onClick={onClear}>
        <X size={14} /> Clear
      </button>
    </div>
  );
}

function MessageItem({
  item,
  sender,
  selected,
  highlighted,
  menuOpen,
  onMenuOpen,
  onReply,
  onEdit,
  onDelete,
  onRetry,
  onToggleSelection,
  onToggleReaction,
  onTurnInto,
  onJumpToMessage,
}: {
  item: RenderableMessage;
  sender?: User;
  selected: boolean;
  highlighted: boolean;
  menuOpen: boolean;
  onMenuOpen: () => void;
  onReply: (message: Message) => void;
  onEdit: (message: Message) => void;
  onDelete: (messageId: string) => void;
  onRetry: (messageId: string) => void;
  onToggleSelection: (messageId: string) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
  onTurnInto: () => void;
  onJumpToMessage: (messageId: string) => void;
}) {
  const { message } = item;
  const longPressRef = useRef<number | null>(null);

  const clearLongPress = () => {
    if (longPressRef.current) {
      window.clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  };

  if (message.kind === "system") {
    return (
      <div className={message.text?.includes("unread") ? "unread-separator" : "date-chip"} data-message-id={message.id}>
        {message.text}
      </div>
    );
  }

  return (
    <article
      className={[
        "message-row",
        message.mine ? "mine" : "",
        `group-${item.groupPosition}`,
        selected ? "selected" : "",
        highlighted ? "highlighted" : "",
      ].join(" ")}
      data-message-id={message.id}
      aria-selected={selected}
      onContextMenu={(event) => {
        event.preventDefault();
        onMenuOpen();
      }}
      onPointerDown={(event) => {
        if (event.pointerType !== "touch") return;
        longPressRef.current = window.setTimeout(onMenuOpen, 520);
      }}
      onPointerUp={clearLongPress}
      onPointerCancel={clearLongPress}
    >
      <div className="message-avatar-slot">
        {item.showAvatar && sender ? <Avatar name={sender.name} initials={sender.initials} color={sender.color} size="sm" /> : null}
      </div>
      <div className="message-stack">
        {item.showSender && sender ? <span className="sender-name">{sender.name}</span> : null}
        <div className="message-surface">
          {message.replyTo ? <ReplyPreview reference={message.replyTo} onJump={onJumpToMessage} /> : null}
          <MessageContent message={message} onRetry={onRetry} />
        </div>
        {message.reactions?.length ? <ReactionBar reactions={message.reactions} onToggle={(emoji) => onToggleReaction(message.id, emoji)} /> : null}
        {item.showMeta ? <MessageMeta message={message} /> : null}
      </div>
      <div className="message-actions">
        <IconButton label={`More actions for message ${message.id}`} onClick={onMenuOpen}>
          <MoreHorizontal size={15} />
        </IconButton>
        {menuOpen ? (
          <MessageMenu
            own={Boolean(message.mine)}
            onReply={() => onReply(message)}
            onReact={() => onToggleReaction(message.id, "👍")}
            onEdit={() => onEdit(message)}
            onDelete={() => onDelete(message.id)}
            onSelect={() => onToggleSelection(message.id)}
            onTurnInto={onTurnInto}
          />
        ) : null}
      </div>
    </article>
  );
}

function MessageContent({ message, onRetry }: { message: Message; onRetry: (messageId: string) => void }) {
  return (
    <>
      {message.attachments?.map((attachment) => <AttachmentView key={attachment.id} attachment={attachment} />)}
      {message.voice ? <VoiceMessage voice={message.voice} /> : null}
      {message.liveObject ? <LiveObjectCard object={message.liveObject} /> : null}
      {message.text && message.kind !== "voice" ? <div className="message-bubble">{message.text}</div> : null}
      {message.deliveryState === "failed" ? (
        <button className="retry-button" type="button" onClick={() => onRetry(message.id)}>
          <RefreshCcw size={13} /> Retry
        </button>
      ) : null}
      {message.syncState === "queued" && message.deliveryState === "pending" ? (
        <span className="pending-note">Waiting for connection</span>
      ) : null}
    </>
  );
}

function ReplyPreview({ reference, onJump }: { reference: MessageReference; onJump: (messageId: string) => void }) {
  return (
    <button className="reply-preview" type="button" onClick={() => onJump(reference.messageId)}>
      <Reply size={13} />
      <span>
        <strong>{reference.label}</strong>
        <small>{reference.excerpt}</small>
      </span>
    </button>
  );
}

function AttachmentView({ attachment }: { attachment: Attachment }) {
  if (attachment.type === "file") {
    return (
      <div className="file-attachment" tabIndex={0} aria-label={`${attachment.name}, ${attachment.meta}`}>
        <FileText size={18} />
        <span>
          <strong>{attachment.name}</strong>
          <small>{attachment.meta}</small>
        </span>
        <button type="button">
          <Download size={14} /> Save
        </button>
      </div>
    );
  }

  return (
    <button className={`media-attachment media-${attachment.type}`} style={{ "--media-gradient": attachment.gradient } as CSSProperties}>
      <span>{attachment.type === "video" ? "Play preview" : attachment.name}</span>
      <small>{attachment.meta}</small>
    </button>
  );
}

function VoiceMessage({ voice }: { voice: NonNullable<Message["voice"]> }) {
  const [playing, setPlaying] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(0);
  const speeds = ["1x", "1.5x", "2x"];
  const position = playing ? Math.round(voice.durationSeconds * 0.42) : 0;

  return (
    <div className="voice-message">
      <button type="button" aria-label={playing ? "Pause voice message" : "Play voice message"} onClick={() => setPlaying((value) => !value)}>
        {playing ? <Pause size={15} /> : <Play size={15} />}
      </button>
      <div className="waveform" aria-hidden="true">
        {voice.waveform.map((height, index) => (
          <i key={`${voice.id}-${index}`} style={{ height }} />
        ))}
      </div>
      <time>{formatDuration(position || voice.durationSeconds)}</time>
      <button type="button" className="speed-button" onClick={() => setSpeedIndex((index) => (index + 1) % speeds.length)}>
        {speeds[speedIndex]}
      </button>
    </div>
  );
}

function ReactionBar({ reactions, onToggle }: { reactions: Reaction[]; onToggle: (emoji: string) => void }) {
  return (
    <div className="reaction-bar" aria-label="Message reactions">
      {reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          type="button"
          className={reaction.reactedByMe ? "active" : ""}
          aria-label={`${reaction.label}, ${reaction.count}`}
          onClick={() => onToggle(reaction.emoji)}
        >
          {reaction.emoji} {reaction.count}
        </button>
      ))}
      <button type="button" aria-label="React with thumbs up" onClick={() => onToggle("👍")}>
        <Smile size={13} />
      </button>
    </div>
  );
}

function MessageMeta({ message }: { message: Message }) {
  const waitingForConnection = message.syncState === "queued" && message.deliveryState === "pending";

  if (waitingForConnection) {
    return null;
  }

  return (
    <footer className="message-meta">
      <time>{formatMessageTime(message.createdAt)}</time>
      {message.edited ? <span>edited</span> : null}
      {!waitingForConnection && message.syncState === "sending" ? <span>sending</span> : null}
      {message.mine && !waitingForConnection ? <DeliveryIndicator state={message.deliveryState} /> : null}
    </footer>
  );
}

function DeliveryIndicator({ state }: { state: DeliveryState }) {
  const label = {
    pending: "Pending",
    sent: "Sent",
    delivered: "Delivered",
    read: "Read",
    failed: "Failed to send",
  }[state];

  return (
    <span className={`delivery-state ${state}`} aria-label={label} title={label}>
      {state === "read" || state === "delivered" ? <CheckCheck size={13} /> : state === "failed" ? "!" : <Check size={13} />}
    </span>
  );
}

function MessageMenu({
  own,
  onReply,
  onReact,
  onEdit,
  onDelete,
  onSelect,
  onTurnInto,
}: {
  own: boolean;
  onReply: () => void;
  onReact: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSelect: () => void;
  onTurnInto: () => void;
}) {
  return (
    <div className="message-menu" role="menu">
      <button type="button" role="menuitem" onClick={onReply}>
        <Reply size={14} /> Reply
      </button>
      <button type="button" role="menuitem" onClick={onReact}>
        <Smile size={14} /> React
      </button>
      <button type="button" role="menuitem">
        <Copy size={14} /> Copy
      </button>
      <button type="button" role="menuitem">
        <Forward size={14} /> Forward
      </button>
      <button type="button" role="menuitem" onClick={onSelect}>
        <Check size={14} /> Select
      </button>
      {own ? (
        <button type="button" role="menuitem" onClick={onEdit}>
          <Edit3 size={14} /> Edit
        </button>
      ) : null}
      <button type="button" role="menuitem" onClick={onDelete}>
        <Trash2 size={14} /> Delete
      </button>
      <button type="button" role="menuitem" onClick={onTurnInto}>
        <CalendarDays size={14} /> Turn Into
      </button>
      <div className="turn-into" aria-label="Turn into options">
        <span>Event · Poll · Checklist · Expense · Decision</span>
      </div>
    </div>
  );
}

function TurnIntoDialog({
  message,
  onCancel,
  onConfirm,
}: {
  message: Message;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onCancel}>
      <section
        className="turn-into-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="turn-into-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <span className="live-object-icon">
            <CalendarDays size={15} />
          </span>
          <div>
            <h2 id="turn-into-title">Turn Into Event</h2>
            <p>Review the candidate before it becomes a shared item.</p>
          </div>
        </header>
        <blockquote>{message.text}</blockquote>
        <label>
          Title
          <input value="Hunza weekend trip" readOnly />
        </label>
        <label>
          When
          <input value="Friday morning - Monday" readOnly />
        </label>
        <label>
          Source
          <input value="Keep original message in chat" readOnly />
        </label>
        <footer>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="confirm-button" onClick={onConfirm}>
            Create Event
          </button>
        </footer>
      </section>
    </div>
  );
}

function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="typing-indicator" aria-live="polite">
      <span>{name} is typing</span>
      <i />
      <i />
      <i />
    </div>
  );
}

function MessageComposer({
  mode,
  draftText,
  onDraftChange,
  onModeChange,
  onSubmit,
  onEdit,
}: {
  mode: ComposerMode;
  draftText: string;
  onDraftChange: (text: string) => void;
  onModeChange: (mode: ComposerMode) => void;
  onSubmit: (payload: ComposerPayload) => void;
  onEdit: (messageId: string, text: string) => void;
}) {
  const [text, setText] = useState("");
  const [attachmentOpen, setAttachmentOpen] = useState(false);

  useEffect(() => {
    setText(mode.kind === "edit" ? mode.text : draftText);
  }, [draftText, mode]);

  useEffect(() => {
    if (mode.kind === "default" || mode.kind === "reply") {
      const timeout = window.setTimeout(() => onDraftChange(text), 250);
      return () => window.clearTimeout(timeout);
    }
  }, [mode.kind, onDraftChange, text]);

  const submit = () => {
    const next = text.trim();
    if (!next) return;

    if (mode.kind === "edit") {
      onEdit(mode.messageId, next);
    } else {
      onSubmit({ text: next, mode });
    }

    setText("");
    onDraftChange("");
    onModeChange({ kind: "default" });
  };

  const keyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form className="composer" aria-label="Message composer" onSubmit={(event) => event.preventDefault()}>
      <div className="composer-menu-wrap">
        <IconButton label="Add attachment" onClick={() => setAttachmentOpen((open) => !open)} type="button">
          <Paperclip size={18} />
        </IconButton>
        {attachmentOpen ? <AttachmentMenu /> : null}
      </div>
      <div className="composer-main">
        {mode.kind !== "default" ? (
          <div className="composer-context">
            <span>{mode.kind === "reply" ? `Replying to ${mode.message.label}` : "Editing message"}</span>
            <button type="button" onClick={() => onModeChange({ kind: "default" })} aria-label="Cancel composer mode">
              <X size={13} />
            </button>
          </div>
        ) : null}
        <textarea
          aria-label="Message"
          placeholder="Message..."
          rows={1}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={keyDown}
        />
      </div>
      <IconButton label="Open emoji picker" type="button">
        <Smile size={18} />
      </IconButton>
      <IconButton label={text.trim() ? "Send message" : "Record voice note"} className={text.trim() ? "send-button" : ""} type="button" onClick={submit}>
        {text.trim() ? <Send size={18} /> : <Mic size={18} />}
      </IconButton>
    </form>
  );
}

function AttachmentMenu() {
  return (
    <div className="attachment-menu" role="menu">
      {["Photos & Video", "Camera", "Document", "Location", "Contact", "Poll", "Event"].map((item) => (
        <button type="button" key={item} role="menuitem">
          {item}
        </button>
      ))}
    </div>
  );
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}
