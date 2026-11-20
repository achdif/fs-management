use tracing::info;

use crate::db::surreal::DbConnection;

// Flow 1 — Pre-Book & Follow-up (Database_Flow_1_v2.0)
// Idempotent: aman dijalankan berulang di setiap startup.
pub async fn run_flow1_migration(db: &DbConnection) -> Result<(), surrealdb::Error> {
    let mut migration = db
        .query(
            "DEFINE TABLE IF NOT EXISTS pre_book_opportunity SCHEMALESS;
             DEFINE INDEX IF NOT EXISTS pre_book_uuid_idx ON TABLE pre_book_opportunity FIELDS uuid UNIQUE;
             DEFINE INDEX IF NOT EXISTS pre_book_customer_idx ON TABLE pre_book_opportunity FIELDS customer_id;
             DEFINE INDEX IF NOT EXISTS pre_book_created_by_idx ON TABLE pre_book_opportunity FIELDS created_by;
             DEFINE INDEX IF NOT EXISTS pre_book_created_at_idx ON TABLE pre_book_opportunity FIELDS created_at;

             DEFINE TABLE IF NOT EXISTS follow_up_activity SCHEMALESS;
             DEFINE INDEX IF NOT EXISTS follow_up_uuid_idx ON TABLE follow_up_activity FIELDS uuid UNIQUE;
             DEFINE INDEX IF NOT EXISTS follow_up_prebook_idx ON TABLE follow_up_activity FIELDS pre_book_id;
             DEFINE INDEX IF NOT EXISTS follow_up_scheduled_idx ON TABLE follow_up_activity FIELDS scheduled_at;
             DEFINE INDEX IF NOT EXISTS follow_up_activity_at_idx ON TABLE follow_up_activity FIELDS activity_at;",
        )
        .await?;
    let _: surrealdb::types::Value = migration.take(0)?;
    info!("Flow 1 schema migration applied (pre_book_opportunity + follow_up_activity)");
    Ok(())
}
