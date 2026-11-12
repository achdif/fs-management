use axum::{
    extract::State,
    response::Json,
    routing::{get, post},
    Router,
};
use axum_extra::extract::cookie::{Cookie, CookieJar, SameSite};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use surrealdb::sql::Thing;

use crate::error::AppError;
use crate::middleware::auth::AuthUser;
use crate::state::AppState;
use crate::utils::jwt::generate_token;

#[derive(Debug, Deserialize)]
pub struct SigninPayload {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct SignupPayload {
    pub email: String,
    pub password: String,
    #[serde(rename = "fullName")]
    pub full_name: Option<String>,
    pub phone: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct VerifyOtpPayload {
    pub email: String,
    pub otp: String,
}

#[derive(Debug, Deserialize)]
pub struct ForgotPasswordPayload {
    pub email: String,
}

#[derive(Debug, Deserialize)]
pub struct ResetPasswordPayload {
    pub token: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct ChangePasswordPayload {
    #[serde(rename = "currentPassword")]
    pub current_password: String,
    #[serde(rename = "newPassword")]
    pub new_password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserRecord {
    pub id: Option<Thing>,
    pub email: String,
    #[serde(skip_serializing)]
    pub password: Option<String>,
    #[serde(rename = "fullName")]
    pub full_name: Option<String>,
    pub phone: Option<String>,
}

// TASK-13: Signup
pub async fn signup(
    State(state): State<AppState>,
    Json(payload): Json<SignupPayload>,
) -> Result<Json<Value>, AppError> {
    if payload.email.is_empty() || payload.password.is_empty() {
        return Err(AppError::BadRequest("Email and password required".to_string()));
    }

    let mut response = state.db.query("SELECT * FROM user WHERE email = $email")
        .bind(("email".to_string(), payload.email.clone()))
        .await
        .map_err(|e| AppError::DatabaseError(e.to_string()))?;

    let existing: Vec<UserRecord> = response.take(0).map_err(|e| AppError::DatabaseError(e.to_string()))?;
    if !existing.is_empty() {
        return Err(AppError::EmailAlreadyExists);
    }

    let created: Option<UserRecord> = state.db
        .create("user")
        .content(json!({
            "email": payload.email,
            "password": payload.password,
            "fullName": payload.full_name,
            "phone": payload.phone,
            "roles": ["user"],
            "created_at": chrono::Utc::now().to_rfc3339(),
            "updated_at": chrono::Utc::now().to_rfc3339(),
        }))
        .await
        .map_err(|e| AppError::DatabaseError(e.to_string()))?;

    // Generate & send OTP
    let otp = format!("{:06}", fastrand::u32(100000..999999));
    let _ = state.redis.set_otp(&payload.email, &otp).await;
    let _ = state.email.send_otp(&payload.email, &otp).await;

    Ok(Json(json!({
        "success": true,
        "message": "User registered successfully",
        "email": payload.email,
        "user": created
    })))
}

// TASK-14: Signin
pub async fn signin(
    State(state): State<AppState>,
    jar: CookieJar,
    Json(payload): Json<SigninPayload>,
) -> Result<(CookieJar, Json<Value>), AppError> {
    // 1. Cek lockout di Redis
    let failed_attempts = state.redis.get_failed_login_attempts(&payload.email).await.unwrap_or(0);
    if failed_attempts >= 5 {
        return Err(AppError::AccountLocked);
    }

    // 2. Query user ke SurrealDB
    let mut response = state.db.query("SELECT * FROM user WHERE email = $email AND password = $password")
        .bind(("email".to_string(), payload.email.clone()))
        .bind(("password".to_string(), payload.password.clone()))
        .await
        .map_err(|e| AppError::DatabaseError(e.to_string()))?;

    let users: Vec<UserRecord> = response.take(0).map_err(|e| AppError::DatabaseError(e.to_string()))?;
    let user = match users.first() {
        Some(u) => u,
        None => {
            let _ = state.redis.increment_failed_login_attempts(&payload.email).await;
            return Err(AppError::InvalidCredentials);
        }
    };

    // 3. Reset failed login attempts
    let _ = state.redis.reset_failed_login_attempts(&payload.email).await;

    // 4. Generate tokens
    let user_id = user.id.as_ref().map(|t| t.to_raw()).unwrap_or_else(|| user.email.clone());
    let jti = uuid::Uuid::new_v4().to_string();

    let access_token = generate_token(
        &user_id,
        &user.email,
        &jti,
        "access",
        state.config.jwt_expiration_minutes * 60,
        &state.config.jwt_secret,
    ).map_err(|e| AppError::Internal(e.to_string()))?;

    let refresh_token = generate_token(
        &user_id,
        &user.email,
        &uuid::Uuid::new_v4().to_string(),
        "refresh",
        state.config.refresh_token_expiration_days * 86400,
        &state.config.jwt_secret,
    ).map_err(|e| AppError::Internal(e.to_string()))?;

    // 5. Catat session ke Redis
    let _ = state.redis.add_user_token(&user_id, &jti, 3).await;

    // 6. Set httpOnly Cookie untuk Web
    let access_cookie = Cookie::build(("access_token", access_token.clone()))
        .path("/")
        .http_only(true)
        .same_site(SameSite::Lax)
        .max_age(time::Duration::minutes(state.config.jwt_expiration_minutes))
        .build();

    let refresh_cookie = Cookie::build(("refresh_token", refresh_token.clone()))
        .path("/api/v1/auth/refresh")
        .http_only(true)
        .same_site(SameSite::Strict)
        .max_age(time::Duration::days(state.config.refresh_token_expiration_days))
        .build();

    let updated_jar = jar.add(access_cookie).add(refresh_cookie);

    // 7. Kembalikan response JSON (untuk Mobile dan Web)
    let body = Json(json!({
        "success": true,
        "tokens": {
            "accessToken": access_token,
            "refreshToken": refresh_token,
            "expiresAt": (chrono::Utc::now().timestamp_millis() + (state.config.jwt_expiration_minutes * 60 * 1000))
        },
        "user": {
            "id": user_id,
            "email": user.email,
            "fullName": user.full_name,
            "phone": user.phone
        }
    }));

    Ok((updated_jar, body))
}

// Verify OTP
pub async fn verify_otp(
    State(state): State<AppState>,
    Json(payload): Json<VerifyOtpPayload>,
) -> Result<Json<Value>, AppError> {
    let stored_otp = state.redis.get_otp(&payload.email).await.unwrap_or(None);
    match stored_otp {
        Some(otp) if otp == payload.otp => {
            let _ = state.redis.delete_otp(&payload.email).await;
            Ok(Json(json!({ "success": true, "message": "OTP verified successfully" })))
        }
        _ => Err(AppError::BadRequest("Invalid OTP".to_string())),
    }
}

// Forgot Password
pub async fn forgot_password(
    State(state): State<AppState>,
    Json(payload): Json<ForgotPasswordPayload>,
) -> Result<Json<Value>, AppError> {
    let mut response = state.db.query("SELECT * FROM user WHERE email = $email LIMIT 1")
        .bind(("email".to_string(), payload.email.clone()))
        .await
        .map_err(|e| AppError::DatabaseError(e.to_string()))?;

    let existing: Vec<UserRecord> = response.take(0).map_err(|e| AppError::DatabaseError(e.to_string()))?;
    if existing.is_empty() {
        return Err(AppError::InvalidCredentials);
    }

    let reset_token = uuid::Uuid::new_v4().to_string();
    let _ = state.redis.set_reset_token(&reset_token, &payload.email, 3600).await;
    let _ = state.email.send_password_reset(&payload.email, &reset_token).await;

    Ok(Json(json!({ "success": true, "message": "Password reset email sent" })))
}

// Reset Password
pub async fn reset_password(
    State(state): State<AppState>,
    Json(payload): Json<ResetPasswordPayload>,
) -> Result<Json<Value>, AppError> {
    let email = state.redis.get_reset_token_email(&payload.token).await.unwrap_or(None)
        .ok_or_else(|| AppError::BadRequest("Invalid or expired reset token".to_string()))?;

    let mut response = state.db.query("UPDATE user SET password = $password, updated_at = $now WHERE email = $email")
        .bind(("password".to_string(), payload.password.clone()))
        .bind(("now".to_string(), chrono::Utc::now().to_rfc3339()))
        .bind(("email".to_string(), email))
        .await
        .map_err(|e| AppError::DatabaseError(e.to_string()))?;

    let _: Vec<UserRecord> = response.take(0).map_err(|e| AppError::DatabaseError(e.to_string()))?;
    let _ = state.redis.delete_reset_token(&payload.token).await;

    Ok(Json(json!({ "success": true, "message": "Password reset successfully" })))
}

// Change Password
pub async fn change_password(
    State(state): State<AppState>,
    AuthUser(claims): AuthUser,
    Json(payload): Json<ChangePasswordPayload>,
) -> Result<Json<Value>, AppError> {
    let mut response = state.db.query("SELECT * FROM user WHERE email = $email AND password = $password")
        .bind(("email".to_string(), claims.email.clone()))
        .bind(("password".to_string(), payload.current_password.clone()))
        .await
        .map_err(|e| AppError::DatabaseError(e.to_string()))?;

    let users: Vec<UserRecord> = response.take(0).map_err(|e| AppError::DatabaseError(e.to_string()))?;
    if users.is_empty() {
        return Err(AppError::InvalidCredentials);
    }

    let mut update_resp = state.db.query("UPDATE user SET password = $password, updated_at = $now WHERE email = $email")
        .bind(("password".to_string(), payload.new_password.clone()))
        .bind(("now".to_string(), chrono::Utc::now().to_rfc3339()))
        .bind(("email".to_string(), claims.email.clone()))
        .await
        .map_err(|e| AppError::DatabaseError(e.to_string()))?;

    let _: Vec<UserRecord> = update_resp.take(0).map_err(|e| AppError::DatabaseError(e.to_string()))?;

    Ok(Json(json!({ "success": true, "message": "Password updated successfully" })))
}

// TASK-15: Refresh
pub async fn refresh_token(
    State(state): State<AppState>,
    jar: CookieJar,
) -> Result<(CookieJar, Json<Value>), AppError> {
    let refresh_str = jar.get("refresh_token")
        .map(|c| c.value().to_string())
        .ok_or_else(|| AppError::Unauthorized("Refresh token missing".to_string()))?;

    let claims = crate::utils::jwt::validate_token(&refresh_str, &state.config.jwt_secret)
        .map_err(|_| AppError::Unauthorized("Invalid refresh token".to_string()))?;

    let new_jti = uuid::Uuid::new_v4().to_string();
    let new_access_token = generate_token(
        &claims.sub,
        &claims.email,
        &new_jti,
        "access",
        state.config.jwt_expiration_minutes * 60,
        &state.config.jwt_secret,
    ).map_err(|e| AppError::Internal(e.to_string()))?;

    let _ = state.redis.add_user_token(&claims.sub, &new_jti, 3).await;

    let access_cookie = Cookie::build(("access_token", new_access_token.clone()))
        .path("/")
        .http_only(true)
        .same_site(SameSite::Lax)
        .max_age(time::Duration::minutes(state.config.jwt_expiration_minutes))
        .build();

    let updated_jar = jar.add(access_cookie);

    Ok((updated_jar, Json(json!({
        "success": true,
        "accessToken": new_access_token
    }))))
}

// TASK-16: Signout
pub async fn signout(
    State(state): State<AppState>,
    jar: CookieJar,
    AuthUser(claims): AuthUser,
) -> Result<(CookieJar, Json<Value>), AppError> {
    let _ = state.redis.add_token_to_blacklist(&claims.jti, 86400).await;
    let _ = state.redis.remove_user_token(&claims.sub, &claims.jti).await;

    let clear_access = Cookie::build(("access_token", "")).path("/").max_age(time::Duration::seconds(0)).build();
    let clear_refresh = Cookie::build(("refresh_token", "")).path("/api/v1/auth/refresh").max_age(time::Duration::seconds(0)).build();

    let updated_jar = jar.add(clear_access).add(clear_refresh);

    Ok((updated_jar, Json(json!({
        "success": true,
        "message": "Signed out successfully"
    }))))
}

// TASK-17: Me
pub async fn get_me(
    State(state): State<AppState>,
    AuthUser(claims): AuthUser,
) -> Result<Json<Value>, AppError> {
    let mut response = state.db.query("SELECT id, email, fullName, phone, roles, created_at FROM user WHERE email = $email")
        .bind(("email".to_string(), claims.email.clone()))
        .await
        .map_err(|e| AppError::DatabaseError(e.to_string()))?;

    let users: Vec<Value> = response.take(0).map_err(|e| AppError::DatabaseError(e.to_string()))?;
    let user = users.first().cloned().unwrap_or(json!({
        "id": claims.sub,
        "email": claims.email
    }));

    Ok(Json(json!({
        "user": user
    })))
}

pub fn auth_routes() -> Router<AppState> {
    Router::new()
        .route("/signup", post(signup))
        .route("/signin", post(signin))
        .route("/verify-otp", post(verify_otp))
        .route("/forgot-password", post(forgot_password))
        .route("/reset-password", post(reset_password))
        .route("/change-password", post(change_password))
        .route("/refresh", post(refresh_token))
        .route("/signout", post(signout))
        .route("/me", get(get_me))
}
