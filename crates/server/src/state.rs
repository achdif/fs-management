use std::sync::Arc;
use crate::config::AppConfig;
use crate::db::surreal::DbConnection;
use crate::services::email_service::EmailService;
use crate::services::redis_service::RedisService;

#[derive(Clone)]
pub struct AppState {
    pub config: Arc<AppConfig>,
    pub db: Arc<DbConnection>,
    pub redis: Arc<RedisService>,
    pub email: Arc<EmailService>,
}
