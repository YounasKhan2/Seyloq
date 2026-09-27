use crate::domain::errors::CommandResult;
use crate::domain::models::{
    AcknowledgementInput, Conversation, DraftInput, LocalStateSnapshot, Message, SendMessageInput,
};
use crate::local_store::repository;
use crate::local_store::LocalStore;

pub fn initialize_local_store(store: &LocalStore) -> CommandResult<LocalStateSnapshot> {
    repository::snapshot(store.connection())
}

pub fn load_conversation(
    store: &LocalStore,
    conversation_id: &str,
) -> CommandResult<Option<Conversation>> {
    repository::load_conversation_row(store.connection(), conversation_id)
}

pub fn load_messages(store: &LocalStore, conversation_id: &str) -> CommandResult<Vec<Message>> {
    repository::load_messages_for_conversation(store.connection(), conversation_id)
}

pub fn send_message(
    store: &mut LocalStore,
    input: SendMessageInput,
) -> CommandResult<LocalStateSnapshot> {
    repository::send_message_transaction(store.connection_mut(), input)?;
    repository::snapshot(store.connection())
}

pub fn retry_operation(
    store: &mut LocalStore,
    message_id: &str,
) -> CommandResult<LocalStateSnapshot> {
    repository::retry_operation_transaction(store.connection_mut(), message_id)?;
    repository::snapshot(store.connection())
}

pub fn edit_message(
    store: &LocalStore,
    message_id: &str,
    text: &str,
) -> CommandResult<LocalStateSnapshot> {
    repository::edit_message(store.connection(), message_id, text)?;
    repository::snapshot(store.connection())
}

pub fn delete_message(store: &LocalStore, message_id: &str) -> CommandResult<LocalStateSnapshot> {
    repository::delete_message(store.connection(), message_id)?;
    repository::snapshot(store.connection())
}

pub fn toggle_reaction(
    store: &LocalStore,
    message_id: &str,
    emoji: &str,
) -> CommandResult<LocalStateSnapshot> {
    repository::toggle_reaction(store.connection(), message_id, emoji)?;
    repository::snapshot(store.connection())
}

pub fn save_draft(store: &LocalStore, input: DraftInput) -> CommandResult<LocalStateSnapshot> {
    repository::save_draft(store.connection(), &input.conversation_id, &input.text)?;
    repository::snapshot(store.connection())
}

pub fn load_draft(store: &LocalStore, conversation_id: &str) -> CommandResult<String> {
    repository::load_draft(store.connection(), conversation_id)
}

pub fn mark_read(
    store: &LocalStore,
    conversation_id: &str,
    message_id: Option<String>,
) -> CommandResult<LocalStateSnapshot> {
    repository::mark_read(store.connection(), conversation_id, message_id)?;
    repository::snapshot(store.connection())
}

pub fn load_sync_status(store: &LocalStore) -> CommandResult<LocalStateSnapshot> {
    repository::snapshot(store.connection())
}

pub fn apply_fake_acknowledgement(
    store: &mut LocalStore,
    input: AcknowledgementInput,
) -> CommandResult<LocalStateSnapshot> {
    repository::acknowledge_message(
        store.connection_mut(),
        &input.message_id,
        &input.operation_id,
        input.server_sequence,
        &input.acknowledged_at,
    )?;
    repository::snapshot(store.connection())
}
