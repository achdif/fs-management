use axum::{
    async_trait,
    extract::{FromRequestParts, State},
    http::request::Parts,
};
use axum_extra::extract::CookieJar;

use crate::error::AppError;
use crate::state::AppState;
use crate::utils::jwt::{validate_token, Claims};

pub struct AuthUser(pub Claims);

#[async_trait]
impl FromRequestParts<AppState> for AuthUser {
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, state: &AppState) -> Result<Self, Self::Rejection> {
        // 1. Cek Header Authorization: Bearer <token> (prioritas untuk Mobile)
        let token = if let Some(auth_header) = parts.headers.get("authorization") {
            if let Ok(header_str) = auth_header.to_str() {
                if header_str.starts_with("Bearer ") {
                    Some(header_str.trim_start_matches("Bearer ").to_string())
                } else {
                    None
                }
            } else {
                None
            }
        } else {
            // 2. Fallback cek Cookie: access_token (untuk Web Browser)
            let jar = CookieJar::from_headers(&parts.headers);
            jar.get("access_token").map(|c| c.value().to_string())
        };

        let token = token.ok_or_else(|| AppError::Unauthorized("Missing authentication token".to_string()))?;

        // Validasi signature & expiry
        let claims = validate_token(&token, &state.config.jwt_secret)
            .map_err(|_| AppError::Unauthorized("Invalid or expired token".to_string()))?;

        // Periksa apakah token di-blacklist di Redis
        if state.redis.is_token_blacklisted(&claims.jti).await.unwrap_or(false) {
            return Err(AppError::Unauthorized("Token has been revoked".to_string()));
        }

        Ok(AuthUser(claims))
    }
}
