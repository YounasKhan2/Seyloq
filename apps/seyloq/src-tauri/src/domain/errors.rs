use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all = "snake_case")]
#[allow(dead_code)]
pub enum ErrorCategory {
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
pub struct CommandError {
    pub category: ErrorCategory,
    pub code: &'static str,
    pub message: String,
}

impl CommandError {
    pub fn new(category: ErrorCategory, code: &'static str, message: impl Into<String>) -> Self {
        Self {
            category,
            code,
            message: message.into(),
        }
    }

    pub fn storage(error: rusqlite::Error) -> Self {
        Self::new(
            ErrorCategory::Storage,
            "storage_error",
            format!("Local persistence failed: {error}"),
        )
    }
}

pub type CommandResult<T> = Result<T, CommandError>;

pub fn validate_non_empty(field: &'static str, value: &str) -> CommandResult<()> {
    if value.trim().is_empty() {
        return Err(CommandError::new(
            ErrorCategory::Validation,
            "validation_failed",
            format!("{field} is required."),
        ));
    }
    Ok(())
}
