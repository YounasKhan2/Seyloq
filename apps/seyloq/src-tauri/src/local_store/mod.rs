pub mod database;
pub mod migrations;
pub mod repository;
pub mod seed;

use rusqlite::Connection;
use std::path::Path;

use crate::domain::errors::{CommandError, CommandResult, ErrorCategory};

pub struct LocalStore {
    connection: Connection,
}

impl LocalStore {
    pub fn open(path: &Path) -> CommandResult<Self> {
        let mut connection = database::open_database(path).map_err(CommandError::storage)?;
        migrations::migrate(&mut connection).map_err(|error| {
            CommandError::new(
                ErrorCategory::Migration,
                "migration_failed",
                error.to_string(),
            )
        })?;
        seed::seed_native_identity(&connection).map_err(CommandError::storage)?;
        seed::seed_native_conversations(&connection).map_err(CommandError::storage)?;
        Ok(Self { connection })
    }

    #[cfg(test)]
    pub fn memory() -> CommandResult<Self> {
        let mut connection = database::open_memory().map_err(CommandError::storage)?;
        migrations::migrate(&mut connection).map_err(CommandError::storage)?;
        seed::seed_native_identity(&connection).map_err(CommandError::storage)?;
        seed::seed_native_conversations(&connection).map_err(CommandError::storage)?;
        Ok(Self { connection })
    }

    pub fn connection(&self) -> &Connection {
        &self.connection
    }

    pub fn connection_mut(&mut self) -> &mut Connection {
        &mut self.connection
    }
}
