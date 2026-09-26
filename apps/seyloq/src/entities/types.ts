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

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  body?: string;
  timestamp: string;
  mine?: boolean;
  reactions?: string[];
  delivery?: "sent" | "delivered" | "read";
  attachment?: {
    type: "image";
    label: string;
    gradient: string;
  };
  liveObject?: LiveObject;
};
