use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;

#[derive(Debug)]
pub enum AppError {
    InvalidCredentials,
    AccountLocked,
    Unauthorized(String),
    EmailAlreadyExists,
    DatabaseError(String),
    Internal(String),
    BadRequest(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_code, message) = match self {
            AppError::InvalidCredentials => (
                StatusCode::UNAUTHORIZED,
                "AUTH_INVALID_CREDENTIALS".to_string(),
                "Invalid email or password".to_string(),
            ),
            AppError::AccountLocked => (
                StatusCode::FORBIDDEN,
                "AUTH_ACCOUNT_LOCKED".to_string(),
                "Account locked. Too many failed attempts. Please try again later.".to_string(),
            ),
            AppError::Unauthorized(msg) => (
                StatusCode::UNAUTHORIZED,
                "AUTH_SESSION_EXPIRED".to_string(),
                msg,
            ),
            AppError::EmailAlreadyExists => (
                StatusCode::CONFLICT,
                "AUTH_EMAIL_ALREADY_EXISTS".to_string(),
                "Email is already registered".to_string(),
            ),
            AppError::DatabaseError(err) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "ED001".to_string(),
                err,
            ),
            AppError::BadRequest(msg) => (
                StatusCode::BAD_REQUEST,
                "BAD_REQUEST".to_string(),
                msg,
            ),
            AppError::Internal(err) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "INTERNAL_ERROR".to_string(),
                err,
            ),
        };

        let body = Json(json!({
            "error": {
                "code": error_code,
                "message": message
            }
        }));

        (status, body).into_response()
    }
}
