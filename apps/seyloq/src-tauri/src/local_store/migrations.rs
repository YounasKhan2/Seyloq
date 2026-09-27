use rusqlite::{params, Connection, OptionalExtension};

pub fn migrate(connection: &mut Connection) -> rusqlite::Result<Vec<i64>> {
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

fn migrations() -> [(i64, &'static str); 2] {
    [
        (
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
        ),
        (
            2,
            r#"
            ALTER TABLE messages ADD COLUMN reactions_json TEXT;
            "#,
        ),
    ]
}
