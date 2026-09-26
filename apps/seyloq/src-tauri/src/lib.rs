use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::sync::Mutex;
use tauri::Manager;
use uuid::Uuid;

const CURRENT_USER_ID: &str = "019990f2-9970-74b1-88fb-43bd0e609568";
const CURRENT_DEVICE_ID: &str = "019990f2-9970-7a8b-8a4b-fd9ed2c43f91";
const CURRENT_SESSION_ID: &str = "019990f2-9970-7d5e-bd1a-4cb24060c7f2";
const SEED_CONVERSATION_ID: &str = "hunza-trip";

#[derive(Default)]
struct AppState {
    connection: Mutex<Option<Connection>>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "snake_case")]
#[allow(dead_code)]
enum ErrorCategory {
    Validation,
    NotFound,
    Conflict,
    Storage,
    Migration,
    Unavailable,
    Internal,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct CommandError {
    category: ErrorCategory,
    code: &'static str,
    message: String,
}

impl CommandError {
    fn new(category: ErrorCategory, code: &'static str, message: impl Into<String>) -> Self {
        Self {
            category,
            code,
            message: message.into(),
        }
    }

    fn storage(error: rusqlite::Error) -> Self {
        Self::new(
            ErrorCategory::Storage,
            "storage_error",
            format!("Local persistence failed: {error}"),
        )
    }
}

type CommandResult<T> = Result<T, CommandError>;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Conversation {
    id: String,
    title: String,
    subtitle: String,
    avatar_color: String,
    unread_count: i64,
    muted: bool,
    pinned: bool,
    last_message: String,
    last_activity: String,
    participants: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct MessageReference {
    message_id: String,
    sender_id: String,
    label: String,
    excerpt: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Message {
    id: String,
    conversation_id: String,
    sender_id: String,
    author_user_id: Option<String>,
    origin_device_id: Option<String>,
    kind: String,
    text: Option<String>,
    created_at: String,
    mine: bool,
    edited: bool,
    reply_to: Option<MessageReference>,
    delivery_state: String,
    sync_state: Option<String>,
    server_sequence: Option<i64>,
    server_acknowledged_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct OutboxOperation {
    id: String,
    operation_type: String,
    entity_type: String,
    entity_id: String,
    conversation_id: String,
    payload: SendMessageOperationPayload,
    idempotency_key: String,
    attempt_count: i64,
    next_attempt_at: String,
    created_at: String,
    updated_at: String,
    status: String,
    last_error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SendMessageOperationPayload {
    message_id: String,
    conversation_id: String,
    sender_id: String,
    author_user_id: String,
    origin_device_id: String,
    text: String,
    reply_to: Option<MessageReference>,
    created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Draft {
    conversation_id: String,
    text: String,
    updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct LocalStateSnapshot {
    conversations: Vec<Conversation>,
    messages: Vec<Message>,
    outbox: Vec<OutboxOperation>,
    drafts: Vec<Draft>,
    connectivity: String,
    last_error: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SendMessageInput {
    conversation_id: String,
    text: String,
    reply_to: Option<MessageReference>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct DraftInput {
    conversation_id: String,
    text: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AcknowledgementInput {
    message_id: String,
    operation_id: String,
    server_sequence: i64,
    acknowledged_at: String,
}

#[tauri::command]
fn platform_summary() -> &'static str {
    "Seyloq Tauri platform boundary exposes typed local use cases with no generic SQL IPC."
}

#[tauri::command]
fn initialize_local_store(
    app: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
) -> CommandResult<LocalStateSnapshot> {
    with_initialized_connection(&app, &state, |connection| snapshot(connection))
}

#[tauri::command]
fn load_conversation(
    app: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
    conversation_id: String,
) -> CommandResult<Option<Conversation>> {
    validate_non_empty("conversation_id", &conversation_id)?;
    with_initialized_connection(&app, &state, |connection| {
        load_conversation_row(connection, &conversation_id)
    })
}

#[tauri::command]
fn load_messages(
    app: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
    conversation_id: String,
) -> CommandResult<Vec<Message>> {
    validate_non_empty("conversation_id", &conversation_id)?;
    with_initialized_connection(&app, &state, |connection| {
        load_messages_for_conversation(connection, &conversation_id)
    })
}

#[tauri::command]
fn send_message(
    app: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
    input: SendMessageInput,
) -> CommandResult<LocalStateSnapshot> {
    validate_non_empty("conversation_id", &input.conversation_id)?;
    validate_non_empty("text", &input.text)?;

    with_initialized_connection(&app, &state, |connection| {
        let created_at = now_iso();
        let message_id = new_uuid_v7();
        let operation_id = new_uuid_v7();
        let payload = SendMessageOperationPayload {
            message_id: message_id.clone(),
            conversation_id: input.conversation_id.clone(),
            sender_id: CURRENT_USER_ID.to_string(),
            author_user_id: CURRENT_USER_ID.to_string(),
            origin_device_id: CURRENT_DEVICE_ID.to_string(),
            text: input.text.clone(),
            reply_to: input.reply_to.clone(),
            created_at: created_at.clone(),
        };

        let tx = connection.transaction().map_err(CommandError::storage)?;
        tx.execute(
            "INSERT INTO messages(
                id, conversation_id, sender_id, author_user_id, origin_device_id, kind, body_text,
                reply_to_json, created_at, mine, edited, delivery_state, sync_state
            ) VALUES (?1, ?2, ?3, ?4, ?5, 'text', ?6, ?7, ?8, 1, 0, 'pending', 'queued')",
            params![
                message_id,
                input.conversation_id,
                CURRENT_USER_ID,
                CURRENT_USER_ID,
                CURRENT_DEVICE_ID,
                input.text,
                json_string(&input.reply_to)?,
                created_at
            ],
        )
        .map_err(CommandError::storage)?;
        tx.execute(
            "INSERT INTO outbox_operations(
                id, operation_type, entity_type, entity_id, conversation_id, payload_json,
                idempotency_key, attempt_count, next_attempt_at, created_at, updated_at, status
            ) VALUES (?1, 'message.send', 'message', ?2, ?3, ?4, ?1, 0, ?5, ?5, ?5, 'queued')",
            params![
                operation_id,
                payload.message_id,
                payload.conversation_id,
                json_string(&payload)?,
                payload.created_at
            ],
        )
        .map_err(CommandError::storage)?;
        tx.execute(
            "INSERT INTO drafts(conversation_id, body_text, updated_at) VALUES (?1, '', ?2)
             ON CONFLICT(conversation_id) DO UPDATE SET body_text = excluded.body_text, updated_at = excluded.updated_at",
            params![payload.conversation_id, payload.created_at],
        )
        .map_err(CommandError::storage)?;
        tx.commit().map_err(CommandError::storage)?;

        snapshot(connection)
    })
}

#[tauri::command]
fn retry_operation(
    app: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
    message_id: String,
) -> CommandResult<LocalStateSnapshot> {
    validate_non_empty("message_id", &message_id)?;

    with_initialized_connection(&app, &state, |connection| {
        let updated_at = now_iso();
        let tx = connection.transaction().map_err(CommandError::storage)?;
        let outbox_rows = tx
            .execute(
                "UPDATE outbox_operations
                 SET operation_type = 'message.retry', status = 'queued', next_attempt_at = ?1, updated_at = ?1, last_error = NULL
                 WHERE entity_id = ?2 AND status <> 'succeeded'",
                params![updated_at, message_id],
            )
            .map_err(CommandError::storage)?;
        if outbox_rows != 1 {
            return Err(CommandError::new(
                ErrorCategory::NotFound,
                "operation_not_found",
                "No retryable outbox operation exists for this message.",
            ));
        }
        tx.execute(
            "UPDATE messages SET sync_state = 'queued', delivery_state = 'pending' WHERE id = ?1",
            params![message_id],
        )
        .map_err(CommandError::storage)?;
        tx.commit().map_err(CommandError::storage)?;
        snapshot(connection)
    })
}

#[tauri::command]
fn save_draft(
    app: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
    input: DraftInput,
) -> CommandResult<LocalStateSnapshot> {
    validate_non_empty("conversation_id", &input.conversation_id)?;

    with_initialized_connection(&app, &state, |connection| {
        connection
            .execute(
                "INSERT INTO drafts(conversation_id, body_text, updated_at) VALUES (?1, ?2, ?3)
                 ON CONFLICT(conversation_id) DO UPDATE SET body_text = excluded.body_text, updated_at = excluded.updated_at",
                params![input.conversation_id, input.text, now_iso()],
            )
            .map_err(CommandError::storage)?;
        snapshot(connection)
    })
}

#[tauri::command]
fn load_draft(
    app: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
    conversation_id: String,
) -> CommandResult<String> {
    validate_non_empty("conversation_id", &conversation_id)?;
    with_initialized_connection(&app, &state, |connection| {
        connection
            .query_row(
                "SELECT body_text FROM drafts WHERE conversation_id = ?1",
                params![conversation_id],
                |row| row.get::<_, String>(0),
            )
            .optional()
            .map(|value| value.unwrap_or_default())
            .map_err(CommandError::storage)
    })
}

#[tauri::command]
fn mark_read(
    app: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
    conversation_id: String,
    message_id: Option<String>,
) -> CommandResult<LocalStateSnapshot> {
    validate_non_empty("conversation_id", &conversation_id)?;

    with_initialized_connection(&app, &state, |connection| {
        connection
            .execute(
                "INSERT INTO conversation_local_state(conversation_id, last_read_message_id, updated_at) VALUES (?1, ?2, ?3)
                 ON CONFLICT(conversation_id) DO UPDATE SET last_read_message_id = excluded.last_read_message_id, updated_at = excluded.updated_at",
                params![conversation_id, message_id, now_iso()],
            )
            .map_err(CommandError::storage)?;
        snapshot(connection)
    })
}

#[tauri::command]
fn load_sync_status(
    app: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
) -> CommandResult<LocalStateSnapshot> {
    with_initialized_connection(&app, &state, |connection| snapshot(connection))
}

#[tauri::command]
fn apply_fake_acknowledgement(
    app: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
    input: AcknowledgementInput,
) -> CommandResult<LocalStateSnapshot> {
    validate_non_empty("message_id", &input.message_id)?;
    validate_non_empty("operation_id", &input.operation_id)?;

    with_initialized_connection(&app, &state, |connection| {
        acknowledge_message(
            connection,
            &input.message_id,
            &input.operation_id,
            input.server_sequence,
            &input.acknowledged_at,
        )?;
        snapshot(connection)
    })
}

fn with_initialized_connection<T>(
    app: &tauri::AppHandle,
    state: &tauri::State<'_, AppState>,
    work: impl FnOnce(&mut Connection) -> CommandResult<T>,
) -> CommandResult<T> {
    let mut guard = state.connection.lock().map_err(|_| {
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
        let mut connection = open_database(&db_path).map_err(CommandError::storage)?;
        migrate(&mut connection).map_err(|error| {
            CommandError::new(
                ErrorCategory::Migration,
                "migration_failed",
                error.to_string(),
            )
        })?;
        seed_native_identity(&connection).map_err(CommandError::storage)?;
        seed_native_conversations(&connection).map_err(CommandError::storage)?;
        *guard = Some(connection);
    }

    work(guard.as_mut().expect("connection initialized"))
}

fn open_database(path: &Path) -> rusqlite::Result<Connection> {
    let connection = Connection::open(path)?;
    configure(&connection)?;
    Ok(connection)
}

#[cfg(test)]
fn open_memory() -> rusqlite::Result<Connection> {
    let connection = Connection::open_in_memory()?;
    configure(&connection)?;
    Ok(connection)
}

fn configure(connection: &Connection) -> rusqlite::Result<()> {
    connection.pragma_update(None, "foreign_keys", "ON")?;
    connection.pragma_update(None, "journal_mode", "WAL")?;
    connection.pragma_update(None, "synchronous", "NORMAL")?;
    connection.busy_timeout(std::time::Duration::from_millis(5000))?;
    Ok(())
}

fn migrate(connection: &mut Connection) -> rusqlite::Result<Vec<i64>> {
    connection.execute(
        "CREATE TABLE IF NOT EXISTS schema_migrations (
            version INTEGER PRIMARY KEY,
            applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    let mut applied = Vec::new();
    for (version, sql) in migrations() {
        let exists: Option<i64> = connection
            .query_row(
                "SELECT version FROM schema_migrations WHERE version = ?1",
                params![version],
                |row| row.get(0),
            )
            .optional()?;
        if exists.is_some() {
            continue;
        }

        let tx = connection.transaction()?;
        tx.execute_batch(sql)?;
        tx.execute(
            "INSERT INTO schema_migrations(version) VALUES (?1)",
            params![version],
        )?;
        tx.commit()?;
        applied.push(version);
    }

    Ok(applied)
}

fn migrations() -> [(i64, &'static str); 1] {
    [(
        1,
        r#"
        CREATE TABLE users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE devices (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            label TEXT NOT NULL,
            status TEXT NOT NULL,
            enrolled_at TEXT NOT NULL
        );

        CREATE TABLE sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
            status TEXT NOT NULL,
            issued_at TEXT NOT NULL,
            expires_at TEXT,
            revoked_at TEXT
        );

        CREATE TABLE conversations (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            subtitle TEXT NOT NULL,
            avatar_color TEXT NOT NULL,
            unread_count INTEGER NOT NULL DEFAULT 0,
            muted INTEGER NOT NULL DEFAULT 0,
            pinned INTEGER NOT NULL DEFAULT 0,
            last_message TEXT NOT NULL,
            last_activity TEXT NOT NULL,
            participants_json TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE messages (
            id TEXT PRIMARY KEY,
            conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
            sender_id TEXT NOT NULL,
            author_user_id TEXT,
            origin_device_id TEXT,
            kind TEXT NOT NULL,
            body_text TEXT,
            reply_to_json TEXT,
            created_at TEXT NOT NULL,
            mine INTEGER NOT NULL DEFAULT 0,
            edited INTEGER NOT NULL DEFAULT 0,
            delivery_state TEXT NOT NULL,
            sync_state TEXT,
            server_sequence INTEGER,
            server_acknowledged_at TEXT
        );

        CREATE TABLE outbox_operations (
            id TEXT PRIMARY KEY,
            operation_type TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            entity_id TEXT NOT NULL,
            conversation_id TEXT NOT NULL,
            payload_json TEXT NOT NULL,
            idempotency_key TEXT NOT NULL UNIQUE,
            attempt_count INTEGER NOT NULL DEFAULT 0,
            next_attempt_at TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            status TEXT NOT NULL,
            last_error TEXT,
            FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
            FOREIGN KEY(entity_id) REFERENCES messages(id) ON DELETE CASCADE
        );

        CREATE TABLE drafts (
            conversation_id TEXT PRIMARY KEY REFERENCES conversations(id) ON DELETE CASCADE,
            body_text TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE conversation_local_state (
            conversation_id TEXT PRIMARY KEY REFERENCES conversations(id) ON DELETE CASCADE,
            last_read_message_id TEXT,
            updated_at TEXT NOT NULL
        );

        CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at, id);
        CREATE INDEX idx_outbox_status_next_attempt ON outbox_operations(status, next_attempt_at);
        "#,
    )]
}

fn seed_native_identity(connection: &Connection) -> rusqlite::Result<()> {
    connection.execute(
        "INSERT OR IGNORE INTO users(id, name, created_at) VALUES (?1, 'Youna', '2026-09-27T00:00:00.000Z')",
        params![CURRENT_USER_ID],
    )?;
    connection.execute(
        "INSERT OR IGNORE INTO devices(id, user_id, label, status, enrolled_at) VALUES (?1, ?2, 'Local development device', 'active', '2026-09-27T00:00:00.000Z')",
        params![CURRENT_DEVICE_ID, CURRENT_USER_ID],
    )?;
    connection.execute(
        "INSERT OR IGNORE INTO sessions(id, user_id, device_id, status, issued_at) VALUES (?1, ?2, ?3, 'active', '2026-09-27T00:00:00.000Z')",
        params![CURRENT_SESSION_ID, CURRENT_USER_ID, CURRENT_DEVICE_ID],
    )?;
    Ok(())
}

fn seed_native_conversations(connection: &Connection) -> rusqlite::Result<()> {
    connection.execute(
        "INSERT OR IGNORE INTO conversations(
            id, title, subtitle, avatar_color, unread_count, muted, pinned, last_message, last_activity, participants_json, created_at
        ) VALUES (?1, 'Hunza Trip', '5 people · active now', '#216bff', 0, 0, 1, 'Native local store ready', 'now', ?2, '2026-09-26T09:00:00.000Z')",
        params![
            SEED_CONVERSATION_ID,
            serde_json::to_string(&vec![CURRENT_USER_ID]).unwrap()
        ],
    )?;
    Ok(())
}

fn load_conversation_row(
    connection: &Connection,
    conversation_id: &str,
) -> CommandResult<Option<Conversation>> {
    connection
        .query_row(
            "SELECT id, title, subtitle, avatar_color, unread_count, muted, pinned, last_message, last_activity, participants_json
             FROM conversations WHERE id = ?1",
            params![conversation_id],
            map_conversation,
        )
        .optional()
        .map_err(CommandError::storage)
}

fn load_messages_for_conversation(
    connection: &Connection,
    conversation_id: &str,
) -> CommandResult<Vec<Message>> {
    let mut statement = connection
        .prepare(
            "SELECT id, conversation_id, sender_id, author_user_id, origin_device_id, kind, body_text, reply_to_json,
                    created_at, mine, edited, delivery_state, sync_state, server_sequence, server_acknowledged_at
             FROM messages WHERE conversation_id = ?1
             ORDER BY COALESCE(server_sequence, 9223372036854775807), created_at, id",
        )
        .map_err(CommandError::storage)?;

    let rows = statement
        .query_map(params![conversation_id], map_message)
        .map_err(CommandError::storage)?;
    rows.collect::<rusqlite::Result<Vec<_>>>()
        .map_err(CommandError::storage)
}

fn snapshot(connection: &Connection) -> CommandResult<LocalStateSnapshot> {
    Ok(LocalStateSnapshot {
        conversations: load_conversations(connection)?,
        messages: load_all_messages(connection)?,
        outbox: load_outbox(connection)?,
        drafts: load_drafts(connection)?,
        connectivity: "unknown".to_string(),
        last_error: None,
    })
}

fn load_conversations(connection: &Connection) -> CommandResult<Vec<Conversation>> {
    let mut statement = connection
        .prepare(
            "SELECT id, title, subtitle, avatar_color, unread_count, muted, pinned, last_message, last_activity, participants_json
             FROM conversations ORDER BY pinned DESC, last_activity DESC, title",
        )
        .map_err(CommandError::storage)?;
    let rows = statement
        .query_map([], map_conversation)
        .map_err(CommandError::storage)?;
    rows.collect::<rusqlite::Result<Vec<_>>>()
        .map_err(CommandError::storage)
}

fn load_all_messages(connection: &Connection) -> CommandResult<Vec<Message>> {
    let mut statement = connection
        .prepare(
            "SELECT id, conversation_id, sender_id, author_user_id, origin_device_id, kind, body_text, reply_to_json,
                    created_at, mine, edited, delivery_state, sync_state, server_sequence, server_acknowledged_at
             FROM messages ORDER BY conversation_id, COALESCE(server_sequence, 9223372036854775807), created_at, id",
        )
        .map_err(CommandError::storage)?;
    let rows = statement
        .query_map([], map_message)
        .map_err(CommandError::storage)?;
    rows.collect::<rusqlite::Result<Vec<_>>>()
        .map_err(CommandError::storage)
}

fn load_outbox(connection: &Connection) -> CommandResult<Vec<OutboxOperation>> {
    let mut statement = connection
        .prepare(
            "SELECT id, operation_type, entity_type, entity_id, conversation_id, payload_json, idempotency_key,
                    attempt_count, next_attempt_at, created_at, updated_at, status, last_error
             FROM outbox_operations ORDER BY created_at, id",
        )
        .map_err(CommandError::storage)?;
    let rows = statement
        .query_map([], |row| {
            let payload_json: String = row.get(5)?;
            Ok(OutboxOperation {
                id: row.get(0)?,
                operation_type: row.get(1)?,
                entity_type: row.get(2)?,
                entity_id: row.get(3)?,
                conversation_id: row.get(4)?,
                payload: serde_json::from_str(&payload_json).map_err(|error| {
                    rusqlite::Error::FromSqlConversionFailure(
                        5,
                        rusqlite::types::Type::Text,
                        Box::new(error),
                    )
                })?,
                idempotency_key: row.get(6)?,
                attempt_count: row.get(7)?,
                next_attempt_at: row.get(8)?,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
                status: row.get(11)?,
                last_error: row.get(12)?,
            })
        })
        .map_err(CommandError::storage)?;
    rows.collect::<rusqlite::Result<Vec<_>>>()
        .map_err(CommandError::storage)
}

fn load_drafts(connection: &Connection) -> CommandResult<Vec<Draft>> {
    let mut statement = connection
        .prepare(
            "SELECT conversation_id, body_text, updated_at FROM drafts ORDER BY updated_at DESC",
        )
        .map_err(CommandError::storage)?;
    let rows = statement
        .query_map([], |row| {
            Ok(Draft {
                conversation_id: row.get(0)?,
                text: row.get(1)?,
                updated_at: row.get(2)?,
            })
        })
        .map_err(CommandError::storage)?;
    rows.collect::<rusqlite::Result<Vec<_>>>()
        .map_err(CommandError::storage)
}

fn acknowledge_message(
    connection: &mut Connection,
    message_id: &str,
    operation_id: &str,
    server_sequence: i64,
    acknowledged_at: &str,
) -> CommandResult<()> {
    let tx = connection.transaction().map_err(CommandError::storage)?;
    let message_rows = tx
        .execute(
            "UPDATE messages
             SET sync_state = 'acknowledged', delivery_state = 'sent', server_sequence = ?1, server_acknowledged_at = ?2
             WHERE id = ?3",
            params![server_sequence, acknowledged_at, message_id],
        )
        .map_err(CommandError::storage)?;
    if message_rows != 1 {
        return Err(CommandError::new(
            ErrorCategory::NotFound,
            "message_not_found",
            "Cannot acknowledge a missing message.",
        ));
    }

    let outbox_rows = tx
        .execute(
            "UPDATE outbox_operations SET status = 'succeeded', updated_at = ?1 WHERE id = ?2",
            params![acknowledged_at, operation_id],
        )
        .map_err(CommandError::storage)?;
    if outbox_rows != 1 {
        return Err(CommandError::new(
            ErrorCategory::NotFound,
            "operation_not_found",
            "Cannot complete a missing outbox operation.",
        ));
    }

    tx.commit().map_err(CommandError::storage)
}

fn map_conversation(row: &rusqlite::Row<'_>) -> rusqlite::Result<Conversation> {
    let participants_json: String = row.get(9)?;
    let participants = serde_json::from_str(&participants_json).unwrap_or_default();
    Ok(Conversation {
        id: row.get(0)?,
        title: row.get(1)?,
        subtitle: row.get(2)?,
        avatar_color: row.get(3)?,
        unread_count: row.get(4)?,
        muted: row.get::<_, i64>(5)? != 0,
        pinned: row.get::<_, i64>(6)? != 0,
        last_message: row.get(7)?,
        last_activity: row.get(8)?,
        participants,
    })
}

fn map_message(row: &rusqlite::Row<'_>) -> rusqlite::Result<Message> {
    let reply_to_json: Option<String> = row.get(7)?;
    Ok(Message {
        id: row.get(0)?,
        conversation_id: row.get(1)?,
        sender_id: row.get(2)?,
        author_user_id: row.get(3)?,
        origin_device_id: row.get(4)?,
        kind: row.get(5)?,
        text: row.get(6)?,
        reply_to: reply_to_json.and_then(|value| serde_json::from_str(&value).ok()),
        created_at: row.get(8)?,
        mine: row.get::<_, i64>(9)? != 0,
        edited: row.get::<_, i64>(10)? != 0,
        delivery_state: row.get(11)?,
        sync_state: row.get(12)?,
        server_sequence: row.get(13)?,
        server_acknowledged_at: row.get(14)?,
    })
}

fn validate_non_empty(field: &'static str, value: &str) -> CommandResult<()> {
    if value.trim().is_empty() {
        return Err(CommandError::new(
            ErrorCategory::Validation,
            "validation_failed",
            format!("{field} is required."),
        ));
    }
    Ok(())
}

fn json_string<T: Serialize>(value: &T) -> CommandResult<String> {
    serde_json::to_string(value).map_err(|error| {
        CommandError::new(
            ErrorCategory::Internal,
            "json_encode_failed",
            error.to_string(),
        )
    })
}

fn new_uuid_v7() -> String {
    Uuid::now_v7().to_string()
}

fn now_iso() -> String {
    chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Millis, true)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            platform_summary,
            initialize_local_store,
            load_conversation,
            load_messages,
            send_message,
            retry_operation,
            save_draft,
            load_draft,
            mark_read,
            load_sync_status,
            apply_fake_acknowledgement
        ])
        .run(tauri::generate_context!())
        .expect("error while running Seyloq");
}

#[cfg(test)]
mod tests {
    use super::*;

    fn initialized_memory() -> Connection {
        let mut connection = open_memory().unwrap();
        migrate(&mut connection).unwrap();
        seed_native_identity(&connection).unwrap();
        seed_native_conversations(&connection).unwrap();
        connection
    }

    #[test]
    fn platform_summary_describes_boundary() {
        assert!(platform_summary().contains("no generic SQL IPC"));
    }

    #[test]
    fn migrations_apply_once_on_empty_database() {
        let mut connection = open_memory().unwrap();

        let first = migrate(&mut connection).unwrap();
        let second = migrate(&mut connection).unwrap();

        assert_eq!(first, vec![1]);
        assert!(second.is_empty());
    }

    #[test]
    fn rust_uuid_v7_is_canonical_and_parseable() {
        let id = new_uuid_v7();
        let parsed = Uuid::parse_str(&id).unwrap();

        assert_eq!(id, id.to_lowercase());
        assert_eq!(parsed.get_version_num(), 7);
    }

    #[test]
    fn identity_contracts_keep_user_device_session_distinct() {
        let connection = initialized_memory();

        let row: (String, String, String, String) = connection
            .query_row(
                "SELECT users.id, devices.id, sessions.id, devices.status
                 FROM users
                 JOIN devices ON devices.user_id = users.id
                 JOIN sessions ON sessions.device_id = devices.id
                 WHERE users.id = ?1",
                params![CURRENT_USER_ID],
                |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?)),
            )
            .unwrap();

        assert_ne!(row.0, row.1);
        assert_ne!(row.1, row.2);
        assert_eq!(row.3, "active");

        connection
            .execute(
                "UPDATE devices SET status = 'revoked' WHERE id = ?1",
                params![CURRENT_DEVICE_ID],
            )
            .unwrap();
        let status: String = connection
            .query_row(
                "SELECT status FROM devices WHERE id = ?1",
                params![CURRENT_DEVICE_ID],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(status, "revoked");
    }

    #[test]
    fn send_transaction_persists_message_and_outbox_atomically() {
        let mut connection = initialized_memory();
        let input = SendMessageInput {
            conversation_id: SEED_CONVERSATION_ID.to_string(),
            text: "Durable native send".to_string(),
            reply_to: None,
        };

        send_message_inner(&mut connection, input).unwrap();

        let snapshot = snapshot(&connection).unwrap();
        let message = snapshot
            .messages
            .iter()
            .find(|message| message.text.as_deref() == Some("Durable native send"))
            .unwrap();
        let operation = snapshot
            .outbox
            .iter()
            .find(|operation| operation.entity_id == message.id)
            .unwrap();

        assert_eq!(message.sync_state.as_deref(), Some("queued"));
        assert_eq!(operation.status, "queued");
        assert_eq!(operation.idempotency_key, operation.id);
        assert_eq!(operation.payload.message_id, message.id);
    }

    #[test]
    fn file_database_survives_restart_and_ack_reconciliation() {
        let temp = tempfile::tempdir().unwrap();
        let db_path = temp.path().join("seyloq.sqlite3");
        let (sent_message_id, sent_operation_id) = {
            let mut connection = open_database(&db_path).unwrap();
            migrate(&mut connection).unwrap();
            seed_native_identity(&connection).unwrap();
            seed_native_conversations(&connection).unwrap();
            send_message_inner(
                &mut connection,
                SendMessageInput {
                    conversation_id: SEED_CONVERSATION_ID.to_string(),
                    text: "Restart durable message".to_string(),
                    reply_to: None,
                },
            )
            .unwrap();

            let current = snapshot(&connection).unwrap();
            let message = current
                .messages
                .iter()
                .find(|message| message.text.as_deref() == Some("Restart durable message"))
                .unwrap();
            let operation = current
                .outbox
                .iter()
                .find(|operation| operation.entity_id == message.id)
                .unwrap();
            (message.id.clone(), operation.id.clone())
        };

        {
            let mut connection = open_database(&db_path).unwrap();
            migrate(&mut connection).unwrap();
            let current = snapshot(&connection).unwrap();
            assert_eq!(
                current
                    .messages
                    .iter()
                    .filter(|message| message.id == sent_message_id)
                    .count(),
                1
            );
            assert_eq!(
                current
                    .outbox
                    .iter()
                    .find(|operation| operation.id == sent_operation_id)
                    .unwrap()
                    .status,
                "queued"
            );

            acknowledge_message(
                &mut connection,
                &sent_message_id,
                &sent_operation_id,
                42,
                "2026-09-27T10:00:00.000Z",
            )
            .unwrap();
        }

        {
            let mut connection = open_database(&db_path).unwrap();
            migrate(&mut connection).unwrap();
            let current = snapshot(&connection).unwrap();
            let messages: Vec<_> = current
                .messages
                .iter()
                .filter(|message| message.id == sent_message_id)
                .collect();
            let operation = current
                .outbox
                .iter()
                .find(|operation| operation.id == sent_operation_id)
                .unwrap();

            assert_eq!(messages.len(), 1);
            assert_eq!(messages[0].sync_state.as_deref(), Some("acknowledged"));
            assert_eq!(messages[0].delivery_state, "sent");
            assert_eq!(messages[0].server_sequence, Some(42));
            assert_eq!(operation.status, "succeeded");
        }
    }

    #[test]
    fn failed_acknowledgement_rolls_back_message_update() {
        let mut connection = initialized_memory();
        send_message_inner(
            &mut connection,
            SendMessageInput {
                conversation_id: SEED_CONVERSATION_ID.to_string(),
                text: "Rollback me".to_string(),
                reply_to: None,
            },
        )
        .unwrap();
        let current = snapshot(&connection).unwrap();
        let message = current
            .messages
            .iter()
            .find(|message| message.text.as_deref() == Some("Rollback me"))
            .unwrap();

        let result = acknowledge_message(
            &mut connection,
            &message.id,
            "019990f2-9970-7d5e-bd1a-4cb24060c7f2",
            99,
            "2026-09-27T10:00:00.000Z",
        );

        let after = snapshot(&connection).unwrap();
        let rolled_back = after
            .messages
            .iter()
            .find(|candidate| candidate.id == message.id)
            .unwrap();
        let operation = after
            .outbox
            .iter()
            .find(|operation| operation.entity_id == message.id)
            .unwrap();

        assert!(result.is_err());
        assert_eq!(rolled_back.sync_state.as_deref(), Some("queued"));
        assert_eq!(rolled_back.delivery_state, "pending");
        assert_eq!(rolled_back.server_sequence, None);
        assert_eq!(operation.status, "queued");
    }

    #[test]
    fn draft_persistence_uses_native_store() {
        let connection = initialized_memory();
        connection
            .execute(
                "INSERT INTO drafts(conversation_id, body_text, updated_at) VALUES (?1, ?2, ?3)",
                params![
                    SEED_CONVERSATION_ID,
                    "Bring jackets",
                    "2026-09-27T10:00:00.000Z"
                ],
            )
            .unwrap();

        assert_eq!(load_drafts(&connection).unwrap()[0].text, "Bring jackets");
    }

    fn send_message_inner(
        connection: &mut Connection,
        input: SendMessageInput,
    ) -> CommandResult<()> {
        let created_at = now_iso();
        let message_id = new_uuid_v7();
        let operation_id = new_uuid_v7();
        let payload = SendMessageOperationPayload {
            message_id: message_id.clone(),
            conversation_id: input.conversation_id.clone(),
            sender_id: CURRENT_USER_ID.to_string(),
            author_user_id: CURRENT_USER_ID.to_string(),
            origin_device_id: CURRENT_DEVICE_ID.to_string(),
            text: input.text.clone(),
            reply_to: input.reply_to.clone(),
            created_at: created_at.clone(),
        };
        let tx = connection.transaction().map_err(CommandError::storage)?;
        tx.execute(
            "INSERT INTO messages(
                id, conversation_id, sender_id, author_user_id, origin_device_id, kind, body_text,
                reply_to_json, created_at, mine, edited, delivery_state, sync_state
            ) VALUES (?1, ?2, ?3, ?4, ?5, 'text', ?6, ?7, ?8, 1, 0, 'pending', 'queued')",
            params![
                message_id,
                input.conversation_id,
                CURRENT_USER_ID,
                CURRENT_USER_ID,
                CURRENT_DEVICE_ID,
                input.text,
                json_string(&input.reply_to)?,
                created_at
            ],
        )
        .map_err(CommandError::storage)?;
        tx.execute(
            "INSERT INTO outbox_operations(
                id, operation_type, entity_type, entity_id, conversation_id, payload_json,
                idempotency_key, attempt_count, next_attempt_at, created_at, updated_at, status
            ) VALUES (?1, 'message.send', 'message', ?2, ?3, ?4, ?1, 0, ?5, ?5, ?5, 'queued')",
            params![
                operation_id,
                payload.message_id,
                payload.conversation_id,
                json_string(&payload)?,
                payload.created_at
            ],
        )
        .map_err(CommandError::storage)?;
        tx.commit().map_err(CommandError::storage)
    }
}
