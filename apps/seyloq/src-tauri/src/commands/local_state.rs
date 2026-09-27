use crate::application::messaging as app;
use crate::domain::errors::{validate_non_empty, CommandResult};
use crate::domain::models::{Conversation, DraftInput, LocalStateSnapshot, Message};
use crate::{with_store, AppState};

#[tauri::command]
pub fn initialize_local_store(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
) -> CommandResult<LocalStateSnapshot> {
    with_store(&app_handle, &state, |store| {
        app::initialize_local_store(store)
    })
}

#[tauri::command]
pub fn load_conversation(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
    conversation_id: String,
) -> CommandResult<Option<Conversation>> {
    validate_non_empty("conversation_id", &conversation_id)?;
    with_store(&app_handle, &state, |store| {
        app::load_conversation(store, &conversation_id)
    })
}

#[tauri::command]
pub fn load_messages(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
    conversation_id: String,
) -> CommandResult<Vec<Message>> {
    validate_non_empty("conversation_id", &conversation_id)?;
    with_store(&app_handle, &state, |store| {
        app::load_messages(store, &conversation_id)
    })
}

#[tauri::command]
pub fn save_draft(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
    input: DraftInput,
) -> CommandResult<LocalStateSnapshot> {
    validate_non_empty("conversation_id", &input.conversation_id)?;
    with_store(&app_handle, &state, |store| app::save_draft(store, input))
}

#[tauri::command]
pub fn load_draft(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
    conversation_id: String,
) -> CommandResult<String> {
    validate_non_empty("conversation_id", &conversation_id)?;
    with_store(&app_handle, &state, |store| {
        app::load_draft(store, &conversation_id)
    })
}

#[tauri::command]
pub fn mark_read(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
    conversation_id: String,
    message_id: Option<String>,
) -> CommandResult<LocalStateSnapshot> {
    validate_non_empty("conversation_id", &conversation_id)?;
    with_store(&app_handle, &state, |store| {
        app::mark_read(store, &conversation_id, message_id)
    })
}

#[tauri::command]
pub fn load_sync_status(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
) -> CommandResult<LocalStateSnapshot> {
    with_store(&app_handle, &state, |store| app::load_sync_status(store))
}
