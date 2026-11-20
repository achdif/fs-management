use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::collections::HashMap;
use surrealdb::types::{RecordId, SurrealValue};
use uuid::Uuid;

use crate::db::surreal::DbConnection;
use crate::error::AppError;

const VALID_FOLLOW_UP_RESULTS: [&str; 4] = ["not_ready", "interested", "meeting", "ready_to_book"];
const VALID_LIST_STATUSES: [&str; 6] = ["all", "overdue", "not_ready", "interested", "meeting", "ready_to_book"];

// ---------- DB records ----------

#[derive(Debug, Clone, Serialize, Deserialize, SurrealValue)]
#[surreal(crate = "surrealdb::types")]
pub struct PreBookOpportunity {
    pub id: Option<RecordId>,
    pub uuid: String,
    pub customer_id: String,
    pub created_by: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, SurrealValue)]
#[surreal(crate = "surrealdb::types")]
pub struct FollowUpActivity {
    pub id: Option<RecordId>,
    pub uuid: String,
    pub pre_book_id: String,
    pub scheduled_at: Option<String>,
    pub activity_at: Option<String>,
    pub customer_information: Option<String>,
    pub customer_intent: Option<String>,
    pub estimated_booking_year: Option<i64>,
    pub estimated_booking_month: Option<i64>,
    pub estimated_booking_date: Option<i64>,
    pub follow_up_result: Option<String>,
    pub created_by: String,
    pub created_at: String,
    pub updated_at: String,
}

// ---------- Payloads ----------

#[derive(Debug, Deserialize)]
pub struct CreatePreBookPayload {
    pub customer_id: String,
}

#[derive(Debug, Deserialize)]
pub struct FollowUpPayload {
    pub scheduled_at: Option<String>,
    pub activity_at: Option<String>,
    pub customer_information: Option<String>,
    pub customer_intent: Option<String>,
    pub estimated_booking_year: Option<i64>,
    pub estimated_booking_month: Option<i64>,
    pub estimated_booking_date: Option<i64>,
    pub follow_up_result: Option<String>,
}

// ---------- Helpers ----------

fn now_rfc3339() -> String {
    Utc::now().to_rfc3339()
}

fn normalize_datetime(value: &str) -> Result<String, AppError> {
    let dt = DateTime::parse_from_rfc3339(value).map_err(|_| {
        AppError::BadRequest(format!("Invalid datetime '{}', use RFC3339 format", value))
    })?;
    Ok(dt.with_timezone(&Utc).to_rfc3339())
}

fn parse_dt(value: &str) -> Option<DateTime<Utc>> {
    DateTime::parse_from_rfc3339(value)
        .ok()
        .map(|d| d.with_timezone(&Utc))
}

fn parse_dt_opt(value: &Option<String>) -> Option<DateTime<Utc>> {
    value.as_deref().and_then(parse_dt)
}

fn sort_key(fu: &FollowUpActivity) -> DateTime<Utc> {
    parse_dt_opt(&fu.activity_at)
        .or_else(|| parse_dt_opt(&fu.scheduled_at))
        .or_else(|| parse_dt(&fu.created_at))
        .unwrap_or(DateTime::<Utc>::UNIX_EPOCH)
}

fn validate_follow_up_result(result: &Option<String>) -> Result<(), AppError> {
    if let Some(r) = result {
        if !VALID_FOLLOW_UP_RESULTS.contains(&r.as_str()) {
            return Err(AppError::BadRequest(format!(
                "Invalid follow_up_result '{}'. Allowed: {}",
                r,
                VALID_FOLLOW_UP_RESULTS.join(", ")
            )));
        }
    }
    Ok(())
}

fn validate_estimated_booking(
    month: &Option<i64>,
    date: &Option<i64>,
) -> Result<(), AppError> {
    if let Some(m) = month {
        if !(1..=12).contains(m) {
            return Err(AppError::BadRequest(
                "estimated_booking_month must be between 1 and 12".into(),
            ));
        }
    }
    if let Some(d) = date {
        if !(1..=31).contains(d) {
            return Err(AppError::BadRequest(
                "estimated_booking_date must be between 1 and 31".into(),
            ));
        }
    }
    Ok(())
}

fn validate_payload(payload: &FollowUpPayload) -> Result<(), AppError> {
    validate_follow_up_result(&payload.follow_up_result)?;
    validate_estimated_booking(
        &payload.estimated_booking_month,
        &payload.estimated_booking_date,
    )?;
    Ok(())
}

fn compact_json(mut content: Value) -> Value {
    if let Some(obj) = content.as_object_mut() {
        obj.retain(|_, v| !v.is_null());
    }
    content
}

fn is_overdue(fu: &FollowUpActivity, now: DateTime<Utc>) -> bool {
    fu.scheduled_at.is_some()
        && fu.activity_at.is_none()
        && parse_dt_opt(&fu.scheduled_at).map(|t| t < now).unwrap_or(false)
}

// ---------- Derived state (tidak disimpan di DB) ----------

struct DerivedState {
    latest_follow_up_result: Option<String>,
    estimated_booking_year: Option<i64>,
    estimated_booking_month: Option<i64>,
    estimated_booking_date: Option<i64>,
    customer_intent: Option<String>,
    next_follow_up: Option<FollowUpActivity>,
    last_contact_at: Option<String>,
    overdue: bool,
}

fn compute_derived_state(follow_ups: &[FollowUpActivity], now: DateTime<Utc>) -> DerivedState {
    let mut sorted = follow_ups.to_vec();
    sorted.sort_by(|a, b| sort_key(b).cmp(&sort_key(a)));

    let mut state = DerivedState {
        latest_follow_up_result: None,
        estimated_booking_year: None,
        estimated_booking_month: None,
        estimated_booking_date: None,
        customer_intent: None,
        next_follow_up: None,
        last_contact_at: None,
        overdue: false,
    };

    // Latest available value per field (carry-forward)
    for fu in &sorted {
        if state.latest_follow_up_result.is_none() {
            state.latest_follow_up_result = fu.follow_up_result.clone();
        }
        if state.estimated_booking_year.is_none() {
            state.estimated_booking_year = fu.estimated_booking_year;
        }
        if state.estimated_booking_month.is_none() {
            state.estimated_booking_month = fu.estimated_booking_month;
        }
        if state.estimated_booking_date.is_none() {
            state.estimated_booking_date = fu.estimated_booking_date;
        }
        if state.customer_intent.is_none() {
            state.customer_intent = fu.customer_intent.clone();
        }
    }

    // last_contact_at = activity_at paling akhir
    state.last_contact_at = follow_ups
        .iter()
        .filter_map(|fu| {
            parse_dt_opt(&fu.activity_at)
                .map(|t| (t, fu.activity_at.clone().unwrap_or_default()))
        })
        .max_by_key(|(t, _)| *t)
        .map(|(_, s)| s);

    // next_follow_up = follow-up terbaru (created_at) yang scheduled & belum aktual
    let latest_scheduled = follow_ups
        .iter()
        .filter(|fu| fu.scheduled_at.is_some() && fu.activity_at.is_none())
        .max_by(|a, b| parse_dt(&a.created_at).cmp(&parse_dt(&b.created_at)));

    if let Some(nf) = latest_scheduled {
        state.overdue = is_overdue(nf, now);
        state.next_follow_up = Some(nf.clone());
    }

    state
}

fn status_matches(state: &DerivedState, status: &str) -> bool {
    match status {
        "all" => true,
        "overdue" => state.overdue,
        other => state.latest_follow_up_result.as_deref() == Some(other),
    }
}

// ---------- JSON builders ----------

fn follow_up_json(fu: &FollowUpActivity, now: DateTime<Utc>) -> Value {
    json!({
        "id": fu.uuid,
        "pre_book_id": fu.pre_book_id,
        "scheduled_at": fu.scheduled_at,
        "activity_at": fu.activity_at,
        "customer_information": fu.customer_information,
        "customer_intent": fu.customer_intent,
        "estimated_booking_year": fu.estimated_booking_year,
        "estimated_booking_month": fu.estimated_booking_month,
        "estimated_booking_date": fu.estimated_booking_date,
        "follow_up_result": fu.follow_up_result,
        "created_by": fu.created_by,
        "created_at": fu.created_at,
        "updated_at": fu.updated_at,
        "overdue": is_overdue(fu, now),
    })
}

fn pre_book_state_json(pb: &PreBookOpportunity, follow_ups: &[FollowUpActivity]) -> Value {
    let now = Utc::now();
    let d = compute_derived_state(follow_ups, now);
    json!({
        "id": pb.uuid,
        "customer_id": pb.customer_id,
        "created_by": pb.created_by,
        "created_at": pb.created_at,
        "updated_at": pb.updated_at,
        "latest_follow_up_result": d.latest_follow_up_result,
        "estimated_booking": {
            "year": d.estimated_booking_year,
            "month": d.estimated_booking_month,
            "date": d.estimated_booking_date,
        },
        "customer_intent": d.customer_intent,
        "next_follow_up": d.next_follow_up.as_ref().map(|fu| json!({
            "id": fu.uuid,
            "scheduled_at": fu.scheduled_at,
            "overdue": is_overdue(fu, now),
        })),
        "last_contact_at": d.last_contact_at,
        "overdue": d.overdue,
        "follow_up_count": follow_ups.len(),
    })
}

// ---------- DB fetch helpers ----------

async fn fetch_pre_book(
    db: &DbConnection,
    uuid: &str,
    created_by: &str,
) -> Result<PreBookOpportunity, AppError> {
    let mut res = db
        .query("SELECT * FROM pre_book_opportunity WHERE uuid = $uuid AND created_by = $cb LIMIT 1")
        .bind(("uuid".to_string(), uuid.to_string()))
        .bind(("cb".to_string(), created_by.to_string()))
        .await
        .map_err(|e| AppError::DatabaseError(e.to_string()))?;
    let rows: Vec<PreBookOpportunity> = res
        .take(0)
        .map_err(|e| AppError::DatabaseError(e.to_string()))?;
    rows.into_iter()
        .next()
        .ok_or_else(|| AppError::NotFound("Pre-book not found".into()))
}

async fn fetch_follow_up(
    db: &DbConnection,
    uuid: &str,
) -> Result<FollowUpActivity, AppError> {
    let mut res = db
        .query("SELECT * FROM follow_up_activity WHERE uuid = $uuid LIMIT 1")
        .bind(("uuid".to_string(), uuid.to_string()))
        .await
        .map_err(|e| AppError::DatabaseError(e.to_string()))?;
    let rows: Vec<FollowUpActivity> = res
        .take(0)
        .map_err(|e| AppError::DatabaseError(e.to_string()))?;
    rows.into_iter()
        .next()
        .ok_or_else(|| AppError::NotFound("Follow-up not found".into()))
}

async fn fetch_follow_ups_for_pre_book(
    db: &DbConnection,
    pre_book_uuid: &str,
) -> Result<Vec<FollowUpActivity>, AppError> {
    let mut res = db
        .query("SELECT * FROM follow_up_activity WHERE pre_book_id = $pid")
        .bind(("pid".to_string(), pre_book_uuid.to_string()))
        .await
        .map_err(|e| AppError::DatabaseError(e.to_string()))?;
    res.take(0)
        .map_err(|e| AppError::DatabaseError(e.to_string()))
}

// ---------- Service functions ----------

// SR-F1-004: Create Pre-Book / Opportunity
pub async fn create_pre_book(
    db: &DbConnection,
    payload: CreatePreBookPayload,
    created_by: &str,
) -> Result<Value, AppError> {
    if payload.customer_id.trim().is_empty() {
        return Err(AppError::BadRequest("customer_id is required".into()));
    }

    let now = now_rfc3339();
    let content = json!({
        "uuid": Uuid::new_v4().to_string(),
        "customer_id": payload.customer_id,
        "created_by": created_by,
        "created_at": now,
        "updated_at": now,
    });

    let created: Option<PreBookOpportunity> = db
        .create("pre_book_opportunity")
        .content(content)
        .await
        .map_err(|e| AppError::DatabaseError(e.to_string()))?;

    let pb = created.ok_or_else(|| AppError::Internal("Failed to create pre-book".into()))?;
    Ok(json!({ "pre_book": pre_book_state_json(&pb, &[]) }))
}

// SR-F1-016, SR-F1-022: List opportunities dengan derived current state
pub async fn list_pre_books(
    db: &DbConnection,
    created_by: &str,
    status: Option<&str>,
    limit: usize,
    offset: usize,
) -> Result<Value, AppError> {
    if let Some(s) = status {
        if !VALID_LIST_STATUSES.contains(&s) {
            return Err(AppError::BadRequest(format!(
                "Invalid status '{}'. Allowed: {}",
                s,
                VALID_LIST_STATUSES.join(", ")
            )));
        }
    }

    let mut res = db
        .query("SELECT * FROM pre_book_opportunity WHERE created_by = $cb ORDER BY created_at DESC")
        .bind(("cb".to_string(), created_by.to_string()))
        .await
        .map_err(|e| AppError::DatabaseError(e.to_string()))?;
    let pre_books: Vec<PreBookOpportunity> = res
        .take(0)
        .map_err(|e| AppError::DatabaseError(e.to_string()))?;

    if pre_books.is_empty() {
        return Ok(json!({ "items": [], "total": 0, "limit": limit, "offset": offset }));
    }

    let uuids: Vec<String> = pre_books.iter().map(|p| p.uuid.clone()).collect();
    let mut fu_res = db
        .query("SELECT * FROM follow_up_activity WHERE pre_book_id IN $ids")
        .bind(("ids".to_string(), uuids))
        .await
        .map_err(|e| AppError::DatabaseError(e.to_string()))?;
    let follow_ups: Vec<FollowUpActivity> = fu_res
        .take(0)
        .map_err(|e| AppError::DatabaseError(e.to_string()))?;

    let mut by_pre_book: HashMap<String, Vec<FollowUpActivity>> = HashMap::new();
    for fu in follow_ups {
        by_pre_book
            .entry(fu.pre_book_id.clone())
            .or_default()
            .push(fu);
    }

    let now = Utc::now();
    let mut items: Vec<Value> = Vec::new();
    for pb in &pre_books {
        let fus = by_pre_book.get(&pb.uuid).cloned().unwrap_or_default();
        let derived = compute_derived_state(&fus, now);
        if let Some(s) = status {
            if !status_matches(&derived, s) {
                continue;
            }
        }
        items.push(pre_book_state_json(pb, &fus));
    }

    let total = items.len();
    let page: Vec<Value> = items.into_iter().skip(offset).take(limit).collect();

    Ok(json!({
        "items": page,
        "total": total,
        "limit": limit,
        "offset": offset,
    }))
}

// SR-F1-016, SR-F1-018: Detail + follow-up history
pub async fn get_pre_book_detail(
    db: &DbConnection,
    uuid: &str,
    created_by: &str,
) -> Result<Value, AppError> {
    let pb = fetch_pre_book(db, uuid, created_by).await?;
    let mut follow_ups = fetch_follow_ups_for_pre_book(db, &pb.uuid).await?;
    follow_ups.sort_by(|a, b| sort_key(b).cmp(&sort_key(a)));

    let now = Utc::now();
    let mut detail = pre_book_state_json(&pb, &follow_ups);
    detail["follow_ups"] = json!(
        follow_ups
            .iter()
            .map(|fu| follow_up_json(fu, now))
            .collect::<Vec<_>>()
    );

    Ok(json!({ "pre_book": detail }))
}

// SR-F1-018: Full follow-up history
pub async fn get_follow_up_history(
    db: &DbConnection,
    pre_book_uuid: &str,
    created_by: &str,
) -> Result<Value, AppError> {
    let pb = fetch_pre_book(db, pre_book_uuid, created_by).await?;
    let mut follow_ups = fetch_follow_ups_for_pre_book(db, &pb.uuid).await?;
    follow_ups.sort_by(|a, b| sort_key(b).cmp(&sort_key(a)));

    let now = Utc::now();
    Ok(json!({
        "pre_book_id": pb.uuid,
        "follow_ups": follow_ups
            .iter()
            .map(|fu| follow_up_json(fu, now))
            .collect::<Vec<_>>(),
    }))
}

// SR-F1-007, SR-F1-008, SR-F1-009: Create follow-up (scheduled plan atau actual log)
pub async fn create_follow_up(
    db: &DbConnection,
    pre_book_uuid: &str,
    payload: FollowUpPayload,
    created_by: &str,
) -> Result<Value, AppError> {
    let pb = fetch_pre_book(db, pre_book_uuid, created_by).await?;

    if payload.scheduled_at.is_none() && payload.activity_at.is_none() {
        return Err(AppError::BadRequest(
            "scheduled_at or activity_at is required".into(),
        ));
    }
    validate_payload(&payload)?;

    let scheduled_at = match &payload.scheduled_at {
        Some(s) => Some(normalize_datetime(s)?),
        None => None,
    };
    let activity_at = match &payload.activity_at {
        Some(s) => Some(normalize_datetime(s)?),
        None => None,
    };

    let now = now_rfc3339();
    let content = compact_json(json!({
        "uuid": Uuid::new_v4().to_string(),
        "pre_book_id": pb.uuid,
        "scheduled_at": scheduled_at,
        "activity_at": activity_at,
        "customer_information": payload.customer_information,
        "customer_intent": payload.customer_intent,
        "estimated_booking_year": payload.estimated_booking_year,
        "estimated_booking_month": payload.estimated_booking_month,
        "estimated_booking_date": payload.estimated_booking_date,
        "follow_up_result": payload.follow_up_result,
        "created_by": created_by,
        "created_at": now,
        "updated_at": now,
    }));

    let created: Option<FollowUpActivity> = db
        .create("follow_up_activity")
        .content(content)
        .await
        .map_err(|e| AppError::DatabaseError(e.to_string()))?;

    let fu = created.ok_or_else(|| AppError::Internal("Failed to create follow-up".into()))?;
    Ok(json!({ "follow_up": follow_up_json(&fu, Utc::now()) }))
}

// SR-F1-010, SR-F1-011, SR-F1-014: Complete/edit latest scheduled follow-up
pub async fn update_follow_up(
    db: &DbConnection,
    follow_up_uuid: &str,
    payload: FollowUpPayload,
    created_by: &str,
) -> Result<Value, AppError> {
    let fu = fetch_follow_up(db, follow_up_uuid).await?;

    if fu.created_by != created_by {
        return Err(AppError::NotFound("Follow-up not found".into()));
    }

    if payload.scheduled_at.is_some() {
        return Err(AppError::BadRequest(
            "scheduled_at cannot be updated; create a new follow-up to reschedule".into(),
        ));
    }
    validate_payload(&payload)?;

    // Hanya follow-up terbaru yang memiliki jadwal yang boleh diedit (SR-F1-011)
    let siblings = fetch_follow_ups_for_pre_book(db, &fu.pre_book_id).await?;
    let latest = siblings
        .iter()
        .max_by(|a, b| parse_dt(&a.created_at).cmp(&parse_dt(&b.created_at)));
    let can_edit = matches!(
        latest,
        Some(l) if l.uuid == fu.uuid && l.scheduled_at.is_some() && l.activity_at.is_none()
    );
    if !can_edit {
        return Err(AppError::Conflict(
            "Only the latest scheduled follow-up can be edited".into(),
        ));
    }

    // PATCH semantics: field None = pertahankan nilai lama
    let activity_at = match &payload.activity_at {
        Some(s) => Some(normalize_datetime(s)?),
        None => fu.activity_at.clone(),
    };
    let customer_information = payload
        .customer_information
        .or_else(|| fu.customer_information.clone());
    let customer_intent = payload.customer_intent.or_else(|| fu.customer_intent.clone());
    let estimated_booking_year = payload
        .estimated_booking_year
        .or(fu.estimated_booking_year);
    let estimated_booking_month = payload
        .estimated_booking_month
        .or(fu.estimated_booking_month);
    let estimated_booking_date = payload
        .estimated_booking_date
        .or(fu.estimated_booking_date);
    let follow_up_result = payload
        .follow_up_result
        .or_else(|| fu.follow_up_result.clone());
    let now = now_rfc3339();
    let fu_uuid = fu.uuid.clone();
    let content = compact_json(json!({
        "uuid": fu_uuid,
        "pre_book_id": fu.pre_book_id,
        "scheduled_at": fu.scheduled_at,
        "activity_at": activity_at,
        "customer_information": customer_information,
        "customer_intent": customer_intent,
        "estimated_booking_year": estimated_booking_year,
        "estimated_booking_month": estimated_booking_month,
        "estimated_booking_date": estimated_booking_date,
        "follow_up_result": follow_up_result,
        "created_by": fu.created_by,
        "created_at": fu.created_at,
        "updated_at": now,
    }));

    let mut res = db
        .query("UPDATE follow_up_activity CONTENT $content WHERE uuid = $uuid")
        .bind(("content".to_string(), content))
        .bind(("uuid".to_string(), fu_uuid.clone()))
        .await
        .map_err(|e| AppError::DatabaseError(e.to_string()))?;
    let _: Vec<FollowUpActivity> = res
        .take(0)
        .map_err(|e| AppError::DatabaseError(e.to_string()))?;

    let updated = fetch_follow_up(db, &fu_uuid).await?;
    Ok(json!({ "follow_up": follow_up_json(&updated, Utc::now()) }))
}
