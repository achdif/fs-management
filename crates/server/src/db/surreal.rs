use surrealdb::engine::remote::ws::{Client, Ws};
use surrealdb::opt::auth::Root;
use surrealdb::Surreal;
use tracing::info;

use crate::config::AppConfig;

pub type DbConnection = Surreal<Client>;

pub async fn create_surreal_connection(config: &AppConfig) -> Result<DbConnection, Box<dyn std::error::Error + Send + Sync>> {
    info!("Connecting to SurrealDB at {}", config.surrealdb_url);
    let db = Surreal::new::<Ws>(&config.surrealdb_url).await?;

    if let (Some(user), Some(pass)) = (&config.surrealdb_username, &config.surrealdb_password) {
        db.signin(Root {
            username: user,
            password: pass,
        }).await?;
    }

    db.use_ns(&config.surrealdb_namespace).use_db(&config.surrealdb_database).await?;
    info!("Connected to SurrealDB NS: {}, DB: {}", config.surrealdb_namespace, config.surrealdb_database);

    Ok(db)
}
