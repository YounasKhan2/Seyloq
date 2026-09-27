mod application;
mod commands;
mod domain;
mod local_store;

use std::sync::Mutex;

use domain::errors::{CommandError, CommandResult, ErrorCategory};
use local_store::LocalStore;
use tauri::Manager;

pub struct AppState {
    store: Mutex<Option<LocalStore>>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            store: Mutex::new(None),
        }
    }
}

#[tauri::command]
fn platform_summary() -> &'static str {
    "Seyloq Tauri platform boundary exposes typed local use cases with no generic SQL IPC."
}

fn with_store<T>(
    app: &tauri::AppHandle,
    state: &tauri::State<'_, AppState>,
    work: impl FnOnce(&mut LocalStore) -> CommandResult<T>,
) -> CommandResult<T> {
    let mut guard = state.store.lock().map_err(|_| {
        CommandError::new(
            ErrorCategory::Internal,
            "state_lock_failed",
            "Native store state lock failed.",
        )
    })?;

    if guard.is_none() {
        let dir = app.path().app_data_dir().map_err(|error| {
            CommandError::new(
                ErrorCategory::Unavailable,
                "app_data_dir_unavailable",
                error.to_string(),
            )
        })?;
        std::fs::create_dir_all(&dir).map_err(|error| {
            CommandError::new(
                ErrorCategory::Storage,
                "app_data_dir_create_failed",
                error.to_string(),
            )
        })?;
        let db_path = dir.join("seyloq.local.sqlite3");
        *guard = Some(LocalStore::open(&db_path)?);
    }

    work(guard.as_mut().expect("store initialized"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            platform_summary,
            commands::local_state::initialize_local_store,
            commands::local_state::load_conversation,
            commands::local_state::load_messages,
            commands::messaging::send_message,
            commands::messaging::retry_operation,
            commands::messaging::edit_message,
            commands::messaging::delete_message,
            commands::messaging::toggle_reaction,
            commands::local_state::save_draft,
            commands::local_state::load_draft,
            commands::local_state::mark_read,
            commands::local_state::load_sync_status,
            commands::messaging::apply_fake_acknowledgement
        ])
        .run(tauri::generate_context!())
        .expect("error while running Seyloq");
}

#[cfg(test)]
mod tests {
    use super::platform_summary;

    #[test]
    fn platform_summary_describes_boundary() {
        assert!(platform_summary().contains("no generic SQL IPC"));
    }
}
