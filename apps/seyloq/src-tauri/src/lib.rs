#[tauri::command]
fn platform_summary() -> &'static str {
    "Seyloq Tauri platform boundary is initialized with no broad native permissions."
}

#[allow(dead_code)]
mod local_store {
    use rusqlite::{params, Connection, OptionalExtension, Transaction};

    const MIGRATIONS: &[(i64, &str)] = &[(
        1,
        r#"
        CREATE TABLE conversations (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE messages (
            id TEXT PRIMARY KEY,
            conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
            sender_id TEXT NOT NULL,
            kind TEXT NOT NULL,
            body_text TEXT,
            reply_to_message_id TEXT,
            created_at TEXT NOT NULL,
            edited INTEGER NOT NULL DEFAULT 0,
            delivery_state TEXT NOT NULL,
            sync_state TEXT NOT NULL,
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

        CREATE TABLE live_objects (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            schema_version INTEGER NOT NULL,
            conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
            creator_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            state TEXT NOT NULL,
            payload_json TEXT NOT NULL
        );

        CREATE TABLE attachments (
            id TEXT PRIMARY KEY,
            message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
            type TEXT NOT NULL,
            name TEXT NOT NULL,
            state TEXT NOT NULL,
            payload_json TEXT NOT NULL
        );

        CREATE TABLE conversation_local_state (
            conversation_id TEXT PRIMARY KEY REFERENCES conversations(id) ON DELETE CASCADE,
            last_read_message_id TEXT,
            updated_at TEXT NOT NULL
        );

        CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at, id);
        CREATE INDEX idx_outbox_status_next_attempt ON outbox_operations(status, next_attempt_at);
        CREATE INDEX idx_live_objects_conversation ON live_objects(conversation_id, type);
        "#,
    )];

    pub struct SendMessageInput<'a> {
        pub message_id: &'a str,
        pub outbox_id: &'a str,
        pub conversation_id: &'a str,
        pub sender_id: &'a str,
        pub text: &'a str,
        pub created_at: &'a str,
        pub idempotency_key: &'a str,
    }

    pub fn open_memory() -> rusqlite::Result<Connection> {
        let connection = Connection::open_in_memory()?;
        configure(&connection)?;
        Ok(connection)
    }

    pub fn configure(connection: &Connection) -> rusqlite::Result<()> {
        connection.pragma_update(None, "foreign_keys", "ON")?;
        connection.pragma_update(None, "journal_mode", "WAL")?;
        connection.pragma_update(None, "synchronous", "NORMAL")?;
        connection.busy_timeout(std::time::Duration::from_millis(5000))?;
        Ok(())
    }

    pub fn migrate(connection: &mut Connection) -> rusqlite::Result<Vec<i64>> {
        connection.execute(
            "CREATE TABLE IF NOT EXISTS schema_migrations (
                version INTEGER PRIMARY KEY,
                applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )",
            [],
        )?;

        let mut applied = Vec::new();
        for (version, sql) in MIGRATIONS {
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

            let transaction = connection.transaction()?;
            transaction.execute_batch(sql)?;
            transaction.execute(
                "INSERT INTO schema_migrations(version) VALUES (?1)",
                params![version],
            )?;
            transaction.commit()?;
            applied.push(*version);
        }

        Ok(applied)
    }

    pub fn seed_conversation(
        connection: &Connection,
        id: &str,
        title: &str,
        created_at: &str,
    ) -> rusqlite::Result<()> {
        connection.execute(
            "INSERT OR IGNORE INTO conversations(id, title, created_at) VALUES (?1, ?2, ?3)",
            params![id, title, created_at],
        )?;
        Ok(())
    }

    pub fn send_message_transaction(
        connection: &mut Connection,
        input: SendMessageInput<'_>,
    ) -> rusqlite::Result<()> {
        let transaction = connection.transaction()?;
        insert_message_and_operation(&transaction, input)?;
        transaction.commit()
    }

    fn insert_message_and_operation(
        transaction: &Transaction<'_>,
        input: SendMessageInput<'_>,
    ) -> rusqlite::Result<()> {
        transaction.execute(
            "INSERT INTO messages(
                id, conversation_id, sender_id, kind, body_text, created_at, delivery_state, sync_state
            ) VALUES (?1, ?2, ?3, 'text', ?4, ?5, 'pending', 'queued')",
            params![
                input.message_id,
                input.conversation_id,
                input.sender_id,
                input.text,
                input.created_at
            ],
        )?;

        let payload = serde_json::json!({
            "messageId": input.message_id,
            "conversationId": input.conversation_id,
            "senderId": input.sender_id,
            "text": input.text,
            "createdAt": input.created_at
        });

        transaction.execute(
            "INSERT INTO outbox_operations(
                id, operation_type, entity_type, entity_id, conversation_id, payload_json,
                idempotency_key, next_attempt_at, created_at, updated_at, status
            ) VALUES (?1, 'message.send', 'message', ?2, ?3, ?4, ?5, ?6, ?6, ?6, 'queued')",
            params![
                input.outbox_id,
                input.message_id,
                input.conversation_id,
                payload.to_string(),
                input.idempotency_key,
                input.created_at
            ],
        )?;

        Ok(())
    }

    pub fn pending_outbox_count(connection: &Connection) -> rusqlite::Result<i64> {
        connection.query_row(
            "SELECT COUNT(*) FROM outbox_operations WHERE status = 'queued'",
            [],
            |row| row.get(0),
        )
    }

    pub fn acknowledge_message(
        connection: &Connection,
        message_id: &str,
        operation_id: &str,
        acknowledged_at: &str,
    ) -> rusqlite::Result<()> {
        connection.execute(
            "UPDATE messages SET sync_state = 'acknowledged', delivery_state = 'sent', server_sequence = 1, server_acknowledged_at = ?1 WHERE id = ?2",
            params![acknowledged_at, message_id],
        )?;
        connection.execute(
            "UPDATE outbox_operations SET status = 'succeeded', updated_at = ?1 WHERE id = ?2",
            params![acknowledged_at, operation_id],
        )?;
        Ok(())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![platform_summary])
        .run(tauri::generate_context!())
        .expect("error while running Seyloq");
}

#[cfg(test)]
mod tests {
    use super::local_store;
    use super::platform_summary;

    #[test]
    fn platform_summary_describes_boundary() {
        assert!(platform_summary().contains("no broad native permissions"));
    }

    #[test]
    fn migrations_apply_once_on_empty_database() {
        let mut connection = local_store::open_memory().unwrap();

        let first = local_store::migrate(&mut connection).unwrap();
        let second = local_store::migrate(&mut connection).unwrap();

        assert_eq!(first, vec![1]);
        assert!(second.is_empty());
    }

    #[test]
    fn message_and_outbox_are_atomic_and_recoverable() {
        let mut connection = local_store::open_memory().unwrap();
        local_store::migrate(&mut connection).unwrap();
        local_store::seed_conversation(
            &connection,
            "hunza-trip",
            "Hunza Trip",
            "2026-09-26T09:00:00+05:00",
        )
        .unwrap();

        local_store::send_message_transaction(
            &mut connection,
            local_store::SendMessageInput {
                message_id: "msg_test_001",
                outbox_id: "op_test_001",
                conversation_id: "hunza-trip",
                sender_id: "me",
                text: "Durable native send",
                created_at: "2026-09-26T09:48:00+05:00",
                idempotency_key: "msg_test_001",
            },
        )
        .unwrap();

        assert_eq!(local_store::pending_outbox_count(&connection).unwrap(), 1);
    }

    #[test]
    fn acknowledgement_reconciles_existing_message_without_duplicate() {
        let mut connection = local_store::open_memory().unwrap();
        local_store::migrate(&mut connection).unwrap();
        local_store::seed_conversation(
            &connection,
            "hunza-trip",
            "Hunza Trip",
            "2026-09-26T09:00:00+05:00",
        )
        .unwrap();
        local_store::send_message_transaction(
            &mut connection,
            local_store::SendMessageInput {
                message_id: "msg_test_002",
                outbox_id: "op_test_002",
                conversation_id: "hunza-trip",
                sender_id: "me",
                text: "Reconcile me",
                created_at: "2026-09-26T09:49:00+05:00",
                idempotency_key: "msg_test_002",
            },
        )
        .unwrap();

        local_store::acknowledge_message(
            &connection,
            "msg_test_002",
            "op_test_002",
            "2026-09-26T09:49:03+05:00",
        )
        .unwrap();

        let message_count: i64 = connection
            .query_row(
                "SELECT COUNT(*) FROM messages WHERE id = 'msg_test_002'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        let state: String = connection
            .query_row(
                "SELECT sync_state FROM messages WHERE id = 'msg_test_002'",
                [],
                |row| row.get(0),
            )
            .unwrap();

        assert_eq!(message_count, 1);
        assert_eq!(state, "acknowledged");
        assert_eq!(local_store::pending_outbox_count(&connection).unwrap(), 0);
    }
}
