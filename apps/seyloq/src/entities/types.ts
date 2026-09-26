export type PrimarySection = "chats" | "updates" | "calls";
export type ThemeMode = "light" | "dark";
export type Presence = "online" | "away" | "offline";

export type User = {
  id: string;
  name: string;
  initials: string;
  color: string;
  presence: Presence;
};

export type Conversation = {
  id: string;
  title: string;
  subtitle: string;
  avatarColor: string;
  unreadCount: number;
  muted: boolean;
  pinned: boolean;
  lastMessage: string;
  lastActivity: string;
  participants: string[];
};

export type LiveObjectType = "event" | "live-location" | "expense" | "checklist";

export type LiveObject = {
  id: string;
  type: LiveObjectType;
  title: string;
  summary: string;
  meta: string;
  status: string;
  items: string[];
};

export type MessageKind = "text" | "image" | "video" | "file" | "voice" | "live-object" | "system";
export type DeliveryState = "pending" | "sent" | "delivered" | "read" | "failed";

export type MessageReference = {
  messageId: string;
  senderId: string;
  label: string;
  excerpt: string;
  attachmentType?: Attachment["type"];
};

export type Reaction = {
  emoji: string;
  label: string;
  count: number;
  reactedByMe?: boolean;
};

export type Attachment = {
  id: string;
  type: "image" | "video" | "file";
  name: string;
  meta: string;
  gradient?: string;
  state?: "loading" | "ready" | "failed";
};

export type VoiceAttachment = {
  id: string;
  durationSeconds: number;
  waveform: number[];
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  kind: MessageKind;
  text?: string;
  createdAt: string;
  mine?: boolean;
  edited?: boolean;
  replyTo?: MessageReference;
  reactions?: Reaction[];
  deliveryState: DeliveryState;
  attachments?: Attachment[];
  voice?: VoiceAttachment;
  liveObject?: LiveObject;
};
