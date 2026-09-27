use rusqlite::{params, Connection, OptionalExtension};
use serde::Serialize;
use uuid::Uuid;

use crate::domain::errors::{CommandError, CommandResult, ErrorCategory};
use crate::domain::models::{
    Conversation, Draft, LocalStateSnapshot, Message, OutboxOperation, Reaction, SendMessageInput,
    SendMessageOperationPayload, CURRENT_DEVICE_ID, CURRENT_USER_ID,
};

pub fn snapshot(connection: &Connection) -> CommandResult<LocalStateSnapshot> {
    Ok(LocalStateSnapshot {
        conversations: load_conversations(connection)?,
        messages: load_all_messages(connection)?,
        outbox: load_outbox(connection)?,
        drafts: load_drafts(connection)?,
        connectivity: "unknown".to_string(),
        last_error: None,
    })
}

pub fn load_conversation_row(
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

pub fn load_messages_for_conversation(
    connection: &Connection,
    conversation_id: &str,
) -> CommandResult<Vec<Message>> {
    let mut statement = connection
        .prepare(
            "SELECT id, conversation_id, sender_id, author_user_id, origin_device_id, kind, body_text, reply_to_json,
                    reactions_json, created_at, mine, edited, delivery_state, sync_state, server_sequence, server_acknowledged_at
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

pub fn send_message_transaction(
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
            reply_to_json, reactions_json, created_at, mine, edited, delivery_state, sync_state
        ) VALUES (?1, ?2, ?3, ?4, ?5, 'text', ?6, ?7, NULL, ?8, 1, 0, 'pending', 'queued')",
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
    tx.commit().map_err(CommandError::storage)
}

pub fn retry_operation_transaction(
    connection: &mut Connection,
    message_id: &str,
) -> CommandResult<()> {
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
    tx.commit().map_err(CommandError::storage)
}

pub fn edit_message(connection: &Connection, message_id: &str, text: &str) -> CommandResult<()> {
    let rows = connection
        .execute(
            "UPDATE messages SET body_text = ?1, edited = 1 WHERE id = ?2 AND mine = 1",
            params![text, message_id],
        )
        .map_err(CommandError::storage)?;
    if rows != 1 {
        return Err(CommandError::new(
            ErrorCategory::NotFound,
            "message_not_found",
            "No editable local message exists for this ID.",
        ));
    }
    Ok(())
}

pub fn delete_message(connection: &Connection, message_id: &str) -> CommandResult<()> {
    let rows = connection
        .execute("DELETE FROM messages WHERE id = ?1", params![message_id])
        .map_err(CommandError::storage)?;
    if rows != 1 {
        return Err(CommandError::new(
            ErrorCategory::NotFound,
            "message_not_found",
            "No local message exists for this ID.",
        ));
    }
    Ok(())
}

pub fn toggle_reaction(
    connection: &Connection,
    message_id: &str,
    emoji: &str,
) -> CommandResult<()> {
    let raw: Option<String> = connection
        .query_row(
            "SELECT reactions_json FROM messages WHERE id = ?1",
            params![message_id],
            |row| row.get(0),
        )
        .optional()
        .map_err(CommandError::storage)?
        .ok_or_else(|| {
            CommandError::new(
                ErrorCategory::NotFound,
                "message_not_found",
                "No local message exists for this ID.",
            )
        })?;
    let current = raw
        .as_deref()
        .map(|value| serde_json::from_str::<Vec<Reaction>>(value))
        .transpose()
        .map_err(|error| {
            CommandError::new(
                ErrorCategory::Storage,
                "reaction_decode_failed",
                error.to_string(),
            )
        })?
        .unwrap_or_default();
    let next = toggle_reaction_state(current, emoji);
    let next_json = if next.is_empty() {
        None
    } else {
        Some(json_string(&next)?)
    };

    connection
        .execute(
            "UPDATE messages SET reactions_json = ?1 WHERE id = ?2",
            params![next_json, message_id],
        )
        .map_err(CommandError::storage)?;
    Ok(())
}

pub fn save_draft(connection: &Connection, conversation_id: &str, text: &str) -> CommandResult<()> {
    connection
        .execute(
            "INSERT INTO drafts(conversation_id, body_text, updated_at) VALUES (?1, ?2, ?3)
             ON CONFLICT(conversation_id) DO UPDATE SET body_text = excluded.body_text, updated_at = excluded.updated_at",
            params![conversation_id, text, now_iso()],
        )
        .map_err(CommandError::storage)?;
    Ok(())
}

pub fn load_draft(connection: &Connection, conversation_id: &str) -> CommandResult<String> {
    connection
        .query_row(
            "SELECT body_text FROM drafts WHERE conversation_id = ?1",
            params![conversation_id],
            |row| row.get::<_, String>(0),
        )
        .optional()
        .map(|value| value.unwrap_or_default())
        .map_err(CommandError::storage)
}

pub fn mark_read(
    connection: &Connection,
    conversation_id: &str,
    message_id: Option<String>,
) -> CommandResult<()> {
    connection
        .execute(
            "INSERT INTO conversation_local_state(conversation_id, last_read_message_id, updated_at) VALUES (?1, ?2, ?3)
             ON CONFLICT(conversation_id) DO UPDATE SET last_read_message_id = excluded.last_read_message_id, updated_at = excluded.updated_at",
            params![conversation_id, message_id, now_iso()],
        )
        .map_err(CommandError::storage)?;
    Ok(())
}

pub fn acknowledge_message(
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
                    reactions_json, created_at, mine, edited, delivery_state, sync_state, server_sequence, server_acknowledged_at
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

pub fn load_drafts(connection: &Connection) -> CommandResult<Vec<Draft>> {
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
    let reactions_json: Option<String> = row.get(8)?;
    Ok(Message {
        id: row.get(0)?,
        conversation_id: row.get(1)?,
        sender_id: row.get(2)?,
        author_user_id: row.get(3)?,
        origin_device_id: row.get(4)?,
        kind: row.get(5)?,
        text: row.get(6)?,
        reply_to: reply_to_json.and_then(|value| serde_json::from_str(&value).ok()),
        reactions: reactions_json.and_then(|value| serde_json::from_str(&value).ok()),
        created_at: row.get(9)?,
        mine: row.get::<_, i64>(10)? != 0,
        edited: row.get::<_, i64>(11)? != 0,
        delivery_state: row.get(12)?,
        sync_state: row.get(13)?,
        server_sequence: row.get(14)?,
        server_acknowledged_at: row.get(15)?,
    })
}

fn toggle_reaction_state(reactions: Vec<Reaction>, emoji: &str) -> Vec<Reaction> {
    let mut found = false;
    let mut next = Vec::new();

    for reaction in reactions {
        if reaction.emoji == emoji {
            found = true;
            let reacted = reaction.reacted_by_me.unwrap_or(false);
            let count = if reacted {
                reaction.count - 1
            } else {
                reaction.count + 1
            };
            if count > 0 {
                next.push(Reaction {
                    count,
                    reacted_by_me: Some(!reacted),
                    ..reaction
                });
            }
        } else {
            next.push(reaction);
        }
    }

    if !found {
        next.push(Reaction {
            emoji: emoji.to_string(),
            label: emoji.to_string(),
            count: 1,
            reacted_by_me: Some(true),
        });
    }

    next
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

pub fn new_uuid_v7() -> String {
    Uuid::now_v7().to_string()
}

pub fn now_iso() -> String {
    chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Millis, true)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::models::SEED_CONVERSATION_ID;
    use crate::local_store::database::open_database;
    use crate::local_store::migrations::migrate;
    use crate::local_store::LocalStore;

    fn initialized_store() -> LocalStore {
        LocalStore::memory().unwrap()
    }

    fn send_test_message(store: &mut LocalStore, text: &str) -> (String, String) {
        send_message_transaction(
            store.connection_mut(),
            SendMessageInput {
                conversation_id: SEED_CONVERSATION_ID.to_string(),
                text: text.to_string(),
                reply_to: None,
            },
        )
        .unwrap();
        let current = snapshot(store.connection()).unwrap();
        let message = current
            .messages
            .iter()
            .find(|message| message.text.as_deref() == Some(text))
            .unwrap();
        let operation = current
            .outbox
            .iter()
            .find(|operation| operation.entity_id == message.id)
            .unwrap();
        (message.id.clone(), operation.id.clone())
    }

    #[test]
    fn migrations_apply_once_on_empty_database() {
        let mut store = LocalStore::memory().unwrap();

        let second = migrate(store.connection_mut()).unwrap();

        assert!(second.is_empty());
    }

    #[test]
    fn migration_two_opens_existing_v1_database() {
        let temp = tempfile::tempdir().unwrap();
        let db_path = temp.path().join("seyloq-v1.sqlite3");
        {
            let connection = open_database(&db_path).unwrap();
            connection
                .execute(
                    "CREATE TABLE schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
                    [],
                )
                .unwrap();
            connection
                .execute("INSERT INTO schema_migrations(version) VALUES (1)", [])
                .unwrap();
            connection.execute_batch(
                "
                CREATE TABLE users (id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at TEXT NOT NULL);
                CREATE TABLE devices (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, label TEXT NOT NULL, status TEXT NOT NULL, enrolled_at TEXT NOT NULL);
                CREATE TABLE sessions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE, status TEXT NOT NULL, issued_at TEXT NOT NULL, expires_at TEXT, revoked_at TEXT);
                CREATE TABLE conversations (id TEXT PRIMARY KEY, title TEXT NOT NULL, subtitle TEXT NOT NULL, avatar_color TEXT NOT NULL, unread_count INTEGER NOT NULL DEFAULT 0, muted INTEGER NOT NULL DEFAULT 0, pinned INTEGER NOT NULL DEFAULT 0, last_message TEXT NOT NULL, last_activity TEXT NOT NULL, participants_json TEXT NOT NULL, created_at TEXT NOT NULL);
                CREATE TABLE messages (id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE, sender_id TEXT NOT NULL, author_user_id TEXT, origin_device_id TEXT, kind TEXT NOT NULL, body_text TEXT, reply_to_json TEXT, created_at TEXT NOT NULL, mine INTEGER NOT NULL DEFAULT 0, edited INTEGER NOT NULL DEFAULT 0, delivery_state TEXT NOT NULL, sync_state TEXT, server_sequence INTEGER, server_acknowledged_at TEXT);
                CREATE TABLE outbox_operations (id TEXT PRIMARY KEY, operation_type TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, conversation_id TEXT NOT NULL, payload_json TEXT NOT NULL, idempotency_key TEXT NOT NULL UNIQUE, attempt_count INTEGER NOT NULL DEFAULT 0, next_attempt_at TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, status TEXT NOT NULL, last_error TEXT, FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE CASCADE, FOREIGN KEY(entity_id) REFERENCES messages(id) ON DELETE CASCADE);
                CREATE TABLE drafts (conversation_id TEXT PRIMARY KEY REFERENCES conversations(id) ON DELETE CASCADE, body_text TEXT NOT NULL, updated_at TEXT NOT NULL);
                CREATE TABLE conversation_local_state (conversation_id TEXT PRIMARY KEY REFERENCES conversations(id) ON DELETE CASCADE, last_read_message_id TEXT, updated_at TEXT NOT NULL);
                CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at, id);
                CREATE INDEX idx_outbox_status_next_attempt ON outbox_operations(status, next_attempt_at);
                ",
            )
            .unwrap();
        }

        let mut connection = open_database(&db_path).unwrap();
        let applied = migrate(&mut connection).unwrap();
        let reactions_column: String = connection
            .query_row(
                "SELECT name FROM pragma_table_info('messages') WHERE name = 'reactions_json'",
                [],
                |row| row.get(0),
            )
            .unwrap();

        assert_eq!(applied, vec![2]);
        assert_eq!(reactions_column, "reactions_json");
    }

    #[test]
    fn rust_uuid_v7_is_canonical_and_parseable() {
        let id = new_uuid_v7();
        let parsed = uuid::Uuid::parse_str(&id).unwrap();

        assert_eq!(id, id.to_lowercase());
        assert_eq!(parsed.get_version_num(), 7);
    }

    #[test]
    fn identity_contracts_keep_user_device_session_distinct() {
        let store = initialized_store();

        let row: (String, String, String, String) = store
            .connection()
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
    }

    #[test]
    fn send_transaction_persists_message_and_outbox_atomically() {
        let mut store = initialized_store();
        let (message_id, operation_id) = send_test_message(&mut store, "Durable native send");
        let current = snapshot(store.connection()).unwrap();
        let message = current
            .messages
            .iter()
            .find(|message| message.id == message_id)
            .unwrap();
        let operation = current
            .outbox
            .iter()
            .find(|operation| operation.id == operation_id)
            .unwrap();

        assert_eq!(message.sync_state.as_deref(), Some("queued"));
        assert_eq!(message.author_user_id.as_deref(), Some(CURRENT_USER_ID));
        assert_eq!(message.origin_device_id.as_deref(), Some(CURRENT_DEVICE_ID));
        assert_eq!(operation.status, "queued");
        assert_eq!(operation.idempotency_key, operation.id);
        assert_eq!(operation.payload.message_id, message.id);
    }

    #[test]
    fn edit_delete_and_reaction_mutations_are_observable() {
        let mut store = initialized_store();
        let (message_id, _) = send_test_message(&mut store, "Mutable native message");

        edit_message(store.connection(), &message_id, "Edited native message").unwrap();
        toggle_reaction(store.connection(), &message_id, "👍").unwrap();
        let edited = snapshot(store.connection())
            .unwrap()
            .messages
            .into_iter()
            .find(|message| message.id == message_id)
            .unwrap();

        assert_eq!(edited.text.as_deref(), Some("Edited native message"));
        assert!(edited.edited);
        assert_eq!(edited.reactions.unwrap()[0].emoji, "👍");

        delete_message(store.connection(), &message_id).unwrap();
        assert!(!snapshot(store.connection())
            .unwrap()
            .messages
            .iter()
            .any(|message| message.id == message_id));
    }

    #[test]
    fn missing_message_mutations_fail_explicitly() {
        let store = initialized_store();

        assert!(edit_message(store.connection(), "missing", "nope").is_err());
        assert!(delete_message(store.connection(), "missing").is_err());
        assert!(toggle_reaction(store.connection(), "missing", "👍").is_err());
    }

    #[test]
    fn file_database_survives_restart_ack_and_mutations() {
        let temp = tempfile::tempdir().unwrap();
        let db_path = temp.path().join("seyloq.sqlite3");
        let (sent_message_id, sent_operation_id) = {
            let mut store = LocalStore::open(&db_path).unwrap();
            send_test_message(&mut store, "Restart durable message")
        };

        {
            let mut store = LocalStore::open(&db_path).unwrap();
            let current = snapshot(store.connection()).unwrap();
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

            edit_message(store.connection(), &sent_message_id, "Edited after restart").unwrap();
            toggle_reaction(store.connection(), &sent_message_id, "👍").unwrap();
            acknowledge_message(
                store.connection_mut(),
                &sent_message_id,
                &sent_operation_id,
                42,
                "2026-09-27T10:00:00.000Z",
            )
            .unwrap();
        }

        {
            let store = LocalStore::open(&db_path).unwrap();
            let current = snapshot(store.connection()).unwrap();
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
            assert_eq!(messages[0].text.as_deref(), Some("Edited after restart"));
            assert!(messages[0].edited);
            assert_eq!(messages[0].reactions.as_ref().unwrap()[0].emoji, "👍");
            assert_eq!(messages[0].sync_state.as_deref(), Some("acknowledged"));
            assert_eq!(messages[0].delivery_state, "sent");
            assert_eq!(messages[0].server_sequence, Some(42));
            assert_eq!(operation.status, "succeeded");
        }
    }

    #[test]
    fn failed_acknowledgement_rolls_back_message_update() {
        let mut store = initialized_store();
        let (message_id, _) = send_test_message(&mut store, "Rollback me");

        let result = acknowledge_message(
            store.connection_mut(),
            &message_id,
            "019990f2-9970-7d5e-bd1a-4cb24060c7f2",
            99,
            "2026-09-27T10:00:00.000Z",
        );

        let after = snapshot(store.connection()).unwrap();
        let rolled_back = after
            .messages
            .iter()
            .find(|candidate| candidate.id == message_id)
            .unwrap();
        let operation = after
            .outbox
            .iter()
            .find(|operation| operation.entity_id == message_id)
            .unwrap();

        assert!(result.is_err());
        assert_eq!(rolled_back.sync_state.as_deref(), Some("queued"));
        assert_eq!(rolled_back.delivery_state, "pending");
        assert_eq!(rolled_back.server_sequence, None);
        assert_eq!(operation.status, "queued");
    }

    #[test]
    fn draft_persistence_uses_native_store() {
        let store = initialized_store();
        save_draft(store.connection(), SEED_CONVERSATION_ID, "Bring jackets").unwrap();

        assert_eq!(
            load_drafts(store.connection()).unwrap()[0].text,
            "Bring jackets"
        );
    }
}
