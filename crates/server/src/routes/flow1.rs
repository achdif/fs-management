use axum::{
    extract::{Path, Query, State},
    response::Json,
    routing::{get, patch, post},
    Router,
};
use serde::Deserialize;
use serde_json::Value;

use crate::error::AppError;
use crate::middleware::auth::AuthUser;
use crate::services::flow1_service::{
    self, CreatePreBookPayload, FollowUpPayload,
};
use crate::state::AppState;

#[derive(Debug, Deserialize)]
pub struct ListPreBooksQuery {
    pub status: Option<String>,
    pub limit: Option<usize>,
    pub offset: Option<usize>,
}

// SR-F1-004: Create Pre-Book / Opportunity
pub async fn create_pre_book(
    State(state): State<AppState>,
    AuthUser(claims): AuthUser,
    Json(payload): Json<CreatePreBookPayload>,
) -> Result<Json<Value>, AppError> {
    let result = flow1_service::create_pre_book(&state.db, payload, &claims.sub).await?;
    Ok(Json(result))
}

// SR-F1-016, SR-F1-022: List opportunities (scope: milik sales yang login)
pub async fn list_pre_books(
    State(state): State<AppState>,
    AuthUser(claims): AuthUser,
    Query(query): Query<ListPreBooksQuery>,
) -> Result<Json<Value>, AppError> {
    let limit = query.limit.unwrap_or(20).min(100);
    let offset = query.offset.unwrap_or(0);
    let result = flow1_service::list_pre_books(
        &state.db,
        &claims.sub,
        query.status.as_deref(),
        limit,
        offset,
    )
    .await?;
    Ok(Json(result))
}

// SR-F1-016, SR-F1-018: Detail opportunity + derived state + follow-ups
pub async fn get_pre_book_detail(
    State(state): State<AppState>,
    AuthUser(claims): AuthUser,
    Path(uuid): Path<String>,
) -> Result<Json<Value>, AppError> {
    let result = flow1_service::get_pre_book_detail(&state.db, &uuid, &claims.sub).await?;
    Ok(Json(result))
}

// SR-F1-018: Full follow-up history
pub async fn get_follow_up_history(
    State(state): State<AppState>,
    AuthUser(claims): AuthUser,
    Path(uuid): Path<String>,
) -> Result<Json<Value>, AppError> {
    let result = flow1_service::get_follow_up_history(&state.db, &uuid, &claims.sub).await?;
    Ok(Json(result))
}

// SR-F1-007 s/d SR-F1-009: Create follow-up (schedule rencana atau log aktual)
pub async fn create_follow_up(
    State(state): State<AppState>,
    AuthUser(claims): AuthUser,
    Path(uuid): Path<String>,
    Json(payload): Json<FollowUpPayload>,
) -> Result<Json<Value>, AppError> {
    let result = flow1_service::create_follow_up(&state.db, &uuid, payload, &claims.sub).await?;
    Ok(Json(result))
}

// SR-F1-010, SR-F1-011, SR-F1-014: Complete/edit latest scheduled follow-up
pub async fn update_follow_up(
    State(state): State<AppState>,
    AuthUser(claims): AuthUser,
    Path(uuid): Path<String>,
    Json(payload): Json<FollowUpPayload>,
) -> Result<Json<Value>, AppError> {
    let result = flow1_service::update_follow_up(&state.db, &uuid, payload, &claims.sub).await?;
    Ok(Json(result))
}

pub fn flow1_routes() -> Router<AppState> {
    Router::new()
        .route("/api/v1/pre-books", post(create_pre_book).get(list_pre_books))
        .route("/api/v1/pre-books/:id", get(get_pre_book_detail))
        .route(
            "/api/v1/pre-books/:id/follow-ups",
            get(get_follow_up_history).post(create_follow_up),
        )
        .route("/api/v1/follow-ups/:id", patch(update_follow_up))
}
