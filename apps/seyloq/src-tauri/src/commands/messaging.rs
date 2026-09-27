use serde::Deserialize;

use crate::application::messaging as app;
use crate::domain::errors::{validate_non_empty, CommandResult};
use crate::domain::models::{AcknowledgementInput, LocalStateSnapshot, SendMessageInput};
use crate::{with_store, AppState};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EditMessageInput {
    pub message_id: String,
    pub text: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ToggleReactionInput {
    pub message_id: String,
    pub emoji: String,
}

#[tauri::command]
pub fn send_message(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
    input: SendMessageInput,
) -> CommandResult<LocalStateSnapshot> {
    validate_non_empty("conversation_id", &input.conversation_id)?;
    validate_non_empty("text", &input.text)?;
    with_store(&app_handle, &state, |store| app::send_message(store, input))
}

#[tauri::command]
pub fn retry_operation(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
    message_id: String,
) -> CommandResult<LocalStateSnapshot> {
    validate_non_empty("message_id", &message_id)?;
    with_store(&app_handle, &state, |store| {
        app::retry_operation(store, &message_id)
    })
}

#[tauri::command]
pub fn edit_message(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
    input: EditMessageInput,
) -> CommandResult<LocalStateSnapshot> {
    validate_non_empty("message_id", &input.message_id)?;
    validate_non_empty("text", &input.text)?;
    with_store(&app_handle, &state, |store| {
        app::edit_message(store, &input.message_id, &input.text)
    })
}

#[tauri::command]
pub fn delete_message(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
    message_id: String,
) -> CommandResult<LocalStateSnapshot> {
    validate_non_empty("message_id", &message_id)?;
    with_store(&app_handle, &state, |store| {
        app::delete_message(store, &message_id)
    })
}

#[tauri::command]
pub fn toggle_reaction(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
    input: ToggleReactionInput,
) -> CommandResult<LocalStateSnapshot> {
    validate_non_empty("message_id", &input.message_id)?;
    validate_non_empty("emoji", &input.emoji)?;
    with_store(&app_handle, &state, |store| {
        app::toggle_reaction(store, &input.message_id, &input.emoji)
    })
}

#[tauri::command]
pub fn apply_fake_acknowledgement(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
    input: AcknowledgementInput,
) -> CommandResult<LocalStateSnapshot> {
    validate_non_empty("message_id", &input.message_id)?;
    validate_non_empty("operation_id", &input.operation_id)?;
    with_store(&app_handle, &state, |store| {
        app::apply_fake_acknowledgement(store, input)
    })
}
