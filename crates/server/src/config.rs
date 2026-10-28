use std::env;

#[derive(Clone, Debug)]
pub struct AppConfig {
    pub server_host: String,
    pub server_port: u16,
    pub cors_origin: String,

    pub surrealdb_url: String,
    pub surrealdb_namespace: String,
    pub surrealdb_database: String,
    pub surrealdb_username: Option<String>,
    pub surrealdb_password: Option<String>,

    pub upstash_redis_url: String,

    pub jwt_secret: String,
    pub jwt_expiration_minutes: i64,
    pub refresh_token_expiration_days: i64,

    pub smtp_host: String,
    pub smtp_port: u16,
    pub smtp_username: String,
    pub smtp_password: String,
    pub smtp_from_email: String,
}

impl AppConfig {
    pub fn from_env() -> Result<Self, String> {
        dotenvy::dotenv().ok();

        let server_host = env::var("SERVER_HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
        let server_port = env::var("SERVER_PORT")
            .unwrap_or_else(|_| "8080".to_string())
            .parse::<u16>()
            .map_err(|e| format!("Invalid SERVER_PORT: {}", e))?;
        let cors_origin = env::var("CORS_ORIGIN").unwrap_or_else(|_| "http://localhost:3000".to_string());

        let surrealdb_url = env::var("SURREALDB_URL").unwrap_or_else(|_| "wss://127.0.0.1:8000/rpc".to_string());
        let surrealdb_namespace = env::var("SURREALDB_NAMESPACE").unwrap_or_else(|_| "test".to_string());
        let surrealdb_database = env::var("SURREALDB_DATABASE").unwrap_or_else(|_| "test".to_string());
        let surrealdb_username = env::var("SURREALDB_USERNAME").ok();
        let surrealdb_password = env::var("SURREALDB_PASSWORD").ok();

        let upstash_redis_url = env::var("UPSTASH_REDIS_URL")
            .unwrap_or_else(|_| "redis://127.0.0.1:6379".to_string());

        let jwt_secret = env::var("JWT_SECRET").unwrap_or_else(|_| "default_jwt_secret_change_me_in_production".to_string());
        let jwt_expiration_minutes = env::var("JWT_EXPIRATION_MINUTES")
            .unwrap_or_else(|_| "15".to_string())
            .parse::<i64>()
            .unwrap_or(15);
        let refresh_token_expiration_days = env::var("REFRESH_TOKEN_EXPIRATION_DAYS")
            .unwrap_or_else(|_| "30".to_string())
            .parse::<i64>()
            .unwrap_or(30);

        let smtp_host = env::var("SMTP_HOST").unwrap_or_default();
        let smtp_port = env::var("SMTP_PORT")
            .unwrap_or_else(|_| "587".to_string())
            .parse::<u16>()
            .unwrap_or(587);
        let smtp_username = env::var("SMTP_USERNAME").unwrap_or_default();
        let smtp_password = env::var("SMTP_PASSWORD").unwrap_or_default();
        let smtp_from_email = env::var("SMTP_FROM_EMAIL").unwrap_or_default();

        Ok(Self {
            server_host,
            server_port,
            cors_origin,
            surrealdb_url,
            surrealdb_namespace,
            surrealdb_database,
            surrealdb_username,
            surrealdb_password,
            upstash_redis_url,
            jwt_secret,
            jwt_expiration_minutes,
            refresh_token_expiration_days,
            smtp_host,
            smtp_port,
            smtp_username,
            smtp_password,
            smtp_from_email,
        })
    }
}
