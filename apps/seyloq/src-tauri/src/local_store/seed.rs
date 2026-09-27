use rusqlite::{params, Connection};

use crate::domain::models::{
    CURRENT_DEVICE_ID, CURRENT_SESSION_ID, CURRENT_USER_ID, SEED_CONVERSATION_ID,
};

pub fn seed_native_identity(connection: &Connection) -> rusqlite::Result<()> {
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

pub fn seed_native_conversations(connection: &Connection) -> rusqlite::Result<()> {
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
