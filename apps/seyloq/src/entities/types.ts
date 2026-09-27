export type PrimarySection = "chats" | "updates" | "calls";
export type ThemeMode = "light" | "dark";
export type Presence = "online" | "away" | "offline";
export type Uuid = string;
export type UserId = Uuid;
export type DeviceId = Uuid;
export type SessionId = Uuid;
export type ConversationId = Uuid | string;
export type MessageId = Uuid | string;
export type OperationId = Uuid;
export type AttachmentId = Uuid | string;
export type LiveObjectId = Uuid | string;
export type DeviceStatus = "active" | "inactive" | "revoked";
export type SessionStatus = "active" | "expired" | "revoked";

export type User = {
  id: UserId | string;
  name: string;
  initials: string;
  color: string;
  presence: Presence;
  createdAt?: string;
};

export type Device = {
  id: DeviceId;
  userId: UserId;
  label: string;
  status: DeviceStatus;
  enrolledAt: string;
  notificationRegistrationState?: "unknown" | "registered" | "unregistered";
};

export type Session = {
  id: SessionId;
  userId: UserId;
  deviceId: DeviceId;
  status: SessionStatus;
  issuedAt: string;
  expiresAt?: string;
  revokedAt?: string;
};

export type RuntimeConnection = {
  connectionId: string;
  sessionId: SessionId;
  connectedAt: string;
};

export interface SecureCredentialStore {
  getSecret(key: string): Promise<string | undefined>;
  setSecret(key: string, value: string): Promise<void>;
  deleteSecret(key: string): Promise<void>;
}

export type Conversation = {
  id: ConversationId;
  title: string;
  subtitle: string;
  avatarColor: string;
  unreadCount: number;
  muted: boolean;
  pinned: boolean;
  lastMessage: string;
  lastActivity: string;
  participants: Array<UserId | string>;
  draftPreview?: string;
  pendingCount?: number;
};

export type LiveObjectType = "event" | "live-location" | "expense" | "checklist" | "poll" | "decision" | "location";

export type LiveObject = {
  id: LiveObjectId;
  type: LiveObjectType;
  title: string;
  summary: string;
  meta: string;
  status: string;
  items: string[];
  syncState?: "fresh" | "locally-modified" | "syncing" | "stale" | "unavailable";
  sourceMessageId?: MessageId;
};

export type MessageKind = "text" | "image" | "video" | "file" | "voice" | "live-object" | "system";
export type DeliveryState = "pending" | "sent" | "delivered" | "read" | "failed";
export type SyncState = "local" | "queued" | "sending" | "acknowledged" | "failed";

export type MessageReference = {
  messageId: MessageId;
  senderId: UserId | string;
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
  id: AttachmentId;
  type: "image" | "video" | "file";
  name: string;
  meta: string;
  gradient?: string;
  state?: "loading" | "ready" | "failed";
};

export type VoiceAttachment = {
  id: AttachmentId;
  durationSeconds: number;
  waveform: number[];
};

export type Message = {
  id: MessageId;
  conversationId: ConversationId;
  senderId: UserId | string;
  authorUserId?: UserId | string;
  originDeviceId?: DeviceId;
  kind: MessageKind;
  text?: string;
  createdAt: string;
  mine?: boolean;
  edited?: boolean;
  replyTo?: MessageReference;
  reactions?: Reaction[];
  deliveryState: DeliveryState;
  syncState?: SyncState;
  serverSequence?: number;
  serverAcknowledgedAt?: string;
  attachments?: Attachment[];
  voice?: VoiceAttachment;
  liveObject?: LiveObject;
};
