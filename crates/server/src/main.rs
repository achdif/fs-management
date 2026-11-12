use axum::{
    response::Json,
    routing::get,
    Router,
};
use serde_json::{json, Value};
use std::net::SocketAddr;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use tracing::{info, warn};

mod config;
mod db;
mod error;
mod middleware;
mod routes;
mod services;
mod state;
mod utils;

use state::AppState;

async fn health_check() -> Json<Value> {
    Json(json!({
        "status": "ok",
        "service": "fs-management-server"
    }))
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt::init();

    let cfg = config::AppConfig::from_env().expect("Failed to load server configuration");
    let addr: SocketAddr = format!("{}:{}", cfg.server_host, cfg.server_port).parse()?;

    // Inisialisasi DB (Jangan gagalkan startup server jika koneksi cloud belum valid)
    let db = match db::surreal::create_surreal_connection(&cfg).await {
        Ok(conn) => {
            info!("✅ SurrealDB connected successfully");
            Arc::new(conn)
        }
        Err(e) => {
            warn!("⚠️ Gagal konek ke SurrealDB ({}): {}. Server tetap berjalan.", cfg.surrealdb_url, e);
            let dummy = surrealdb::Surreal::init();
            Arc::new(dummy)
        }
    };

    // Inisialisasi Redis (toleran jika belum aktif)
    let redis = Arc::new(services::redis_service::RedisService::new(&cfg.upstash_redis_url).await);

    // Inisialisasi Email Service
    let email = Arc::new(services::email_service::EmailService::new(&cfg));

    let app_state = AppState {
        config: Arc::new(cfg.clone()),
        db,
        redis,
        email,
    };

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/health", get(health_check))
        .nest("/api/v1/auth", routes::auth::auth_routes())
        .with_state(app_state)
        .layer(cors);

    info!("🚀 Server running at http://{}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
