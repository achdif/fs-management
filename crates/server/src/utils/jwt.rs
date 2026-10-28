use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: String,       // user_id
    pub email: String,     // user email
    pub jti: String,       // token id (for revocation / blacklist)
    pub token_type: String,// "access" or "refresh"
    pub exp: usize,        // expiry timestamp
    pub iat: usize,        // issued at
}

pub fn generate_token(
    user_id: &str,
    email: &str,
    jti: &str,
    token_type: &str,
    duration_seconds: i64,
    secret: &str,
) -> Result<String, jsonwebtoken::errors::Error> {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as usize;

    let claims = Claims {
        sub: user_id.to_string(),
        email: email.to_string(),
        jti: jti.to_string(),
        token_type: token_type.to_string(),
        iat: now,
        exp: now + (duration_seconds as usize),
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
}

pub fn validate_token(token: &str, secret: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )?;
    Ok(token_data.claims)
}
