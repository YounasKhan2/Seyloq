use serde::{Deserialize, Serialize};

pub const CURRENT_USER_ID: &str = "019990f2-9970-74b1-88fb-43bd0e609568";
pub const CURRENT_DEVICE_ID: &str = "019990f2-9970-7a8b-8a4b-fd9ed2c43f91";
pub const CURRENT_SESSION_ID: &str = "019990f2-9970-7d5e-bd1a-4cb24060c7f2";
pub const SEED_CONVERSATION_ID: &str = "hunza-trip";

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Conversation {
    pub id: String,
    pub title: String,
    pub subtitle: String,
    pub avatar_color: String,
    pub unread_count: i64,
    pub muted: bool,
    pub pinned: bool,
    pub last_message: String,
    pub last_activity: String,
    pub participants: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MessageReference {
    pub message_id: String,
    pub sender_id: String,
    pub label: String,
    pub excerpt: String,
    pub attachment_type: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Reaction {
    pub emoji: String,
    pub label: String,
    pub count: i64,
    pub reacted_by_me: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Message {
    pub id: String,
    pub conversation_id: String,
    pub sender_id: String,
    pub author_user_id: Option<String>,
    pub origin_device_id: Option<String>,
    pub kind: String,
    pub text: Option<String>,
    pub created_at: String,
    pub mine: bool,
    pub edited: bool,
    pub reply_to: Option<MessageReference>,
    pub reactions: Option<Vec<Reaction>>,
    pub delivery_state: String,
    pub sync_state: Option<String>,
    pub server_sequence: Option<i64>,
    pub server_acknowledged_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OutboxOperation {
    pub id: String,
    pub operation_type: String,
    pub entity_type: String,
    pub entity_id: String,
    pub conversation_id: String,
    pub payload: SendMessageOperationPayload,
    pub idempotency_key: String,
    pub attempt_count: i64,
    pub next_attempt_at: String,
    pub created_at: String,
    pub updated_at: String,
    pub status: String,
    pub last_error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SendMessageOperationPayload {
    pub message_id: String,
    pub conversation_id: String,
    pub sender_id: String,
    pub author_user_id: String,
    pub origin_device_id: String,
    pub text: String,
    pub reply_to: Option<MessageReference>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Draft {
    pub conversation_id: String,
    pub text: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LocalStateSnapshot {
    pub conversations: Vec<Conversation>,
    pub messages: Vec<Message>,
    pub outbox: Vec<OutboxOperation>,
    pub drafts: Vec<Draft>,
    pub connectivity: String,
    pub last_error: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SendMessageInput {
    pub conversation_id: String,
    pub text: String,
    pub reply_to: Option<MessageReference>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DraftInput {
    pub conversation_id: String,
    pub text: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AcknowledgementInput {
    pub message_id: String,
    pub operation_id: String,
    pub server_sequence: i64,
    pub acknowledged_at: String,
}
