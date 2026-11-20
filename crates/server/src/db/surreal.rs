use surrealdb::engine::remote::ws::{Client, Ws, Wss};
use surrealdb::opt::auth::Root;
use surrealdb::Surreal;
use tracing::info;

use crate::config::AppConfig;

pub type DbConnection = Surreal<Client>;

pub async fn create_surreal_connection(config: &AppConfig) -> Result<DbConnection, Box<dyn std::error::Error + Send + Sync>> {
    info!("Connecting to SurrealDB at {}", config.surrealdb_url);
    // surrealdb v4 client prepends the ws:// scheme itself and expects a bare host:port
    // (e.g. "127.0.0.1:8000"), so strip any scheme/path from the configured URL.
    let endpoint = config
        .surrealdb_url
        .split("://")
        .nth(1)
        .unwrap_or(&config.surrealdb_url)
        .split('/')
        .next()
        .unwrap_or_default()
        .to_string();
    // surrealdb 4.x: Ws dan Wss adalah engine berbeda — scheme tidak di-parse
    // dari string, jadi harus dipilih berdasarkan prefix URL.
    let db = if config.surrealdb_url.starts_with("wss://") {
        Surreal::new::<Wss>(&endpoint).await?
    } else {
        Surreal::new::<Ws>(&endpoint).await?
    };

    if let (Some(user), Some(pass)) = (&config.surrealdb_username, &config.surrealdb_password) {
        db.signin(Root {
            username: user.clone(),
            password: pass.clone(),
        }).await?;
    }

    db.use_ns(&config.surrealdb_namespace).use_db(&config.surrealdb_database).await?;
    info!("Connected to SurrealDB NS: {}, DB: {}", config.surrealdb_namespace, config.surrealdb_database);

    // Idempotent schema bootstrap — SurrealDB 4.x tidak auto-create tabel.
    // Aman dijalankan berulang (IF NOT EXISTS) di setiap startup.
    let mut migration = db
        .query(
            "DEFINE TABLE IF NOT EXISTS user SCHEMALESS;
             DEFINE INDEX IF NOT EXISTS user_email_idx ON TABLE user FIELDS email;",
        )
        .await?;
    let _: surrealdb::types::Value = migration.take(0)?;
    info!("Schema migration applied (user table + email index)");

    // Flow 1 — Pre-Book & Follow-up schema
    crate::db::migrations::run_flow1_migration(&db).await?;

    Ok(db)
}
