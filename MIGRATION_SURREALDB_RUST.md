# Migration Plan: SurrealDB Cloud Migration to Rust Backend Service

## 1. Executive Summary
Rencana migrasi koneksi langsung React Native dari **SurrealDB Cloud**, **Upstash**, dan **Gmail API** menuju **Rust Backend Service** di `crates/server`.

Fitur Utama:
- **Dual Authentication**: `httpOnly` cookie untuk Web frontend & Bearer JWT untuk React Native.
- **Server-side Security**: Isolasi total kredensial SurrealDB, Upstash, dan Mailer di server.
- **Micro-tasks breakdown**: Setiap task berukuran kecil, fokus pada 1 tujuan spesifik, dan memiliki kriteria pengujian mandiri.

---

## 2. Target Architecture (Alur Koneksi)

```text
[Web Frontend]    --> (httpOnly Cookie) -\
                                          +--> [Rust Backend (Axum)] ---> [SurrealDB Cloud]
[React Native]    --> (Bearer JWT)     -/          |
                                                   +---> [Upstash Redis]
                                                   |
                                                   +---> [Email Service]
```

---

## 3. Breakdown Task Kecil (Total: 20 Micro-Tasks)

### **Bagian 1: Inisialisasi Project Rust (crates/server)**
- [x] **TASK-01: Inisialisasi Crate & Cargo Setup**
  - Buat folder `crates/server` dan `Cargo.toml`.
  - Daftarkan crate ke root workspace jika diperlukan.
  - Setup dependensi dasar: `tokio`, `serde`, `serde_json`, `tracing`, `tracing-subscriber`.
- [x] **TASK-02: Konfigurasi Environment & Config Loader**
  - Buat file `.env.example` di `crates/server`.
  - Buat struct `AppConfig` dengan crate `dotenvy` / `envy` untuk memuat URL SurrealDB, credentials, Upstash URL/token, JWT secrets, dan port.
- [x] **TASK-03: Setup Axum Skeleton & Healthcheck Endpoint**
  - Setup `main.rs` dan router Axum dasar.
  - Implementasikan endpoint `GET /health` yang mengembalikan status `200 OK` (JSON: `{"status": "ok"}`).

---

### **Bagian 2: Database & Third-party Services di Rust**
- [x] **TASK-04: Koneksi SurrealDB Cloud Service**
  - Tambahkan dependensi `surrealdb` dengan fitur WebSocket (`protocol-ws`).
  - Buat modul `db::surreal` yang menginisialisasi koneksi pool dan login namespace/database.
  - Simpan instance connection ke dalam `AppState`.
- [x] **TASK-05: Upstash Redis Client (Account Lockout Tracker)**
  - Buat module `services::redis_service`.
  - Implementasikan fungsi `increment_failed_login_attempts(email)` dan `reset_failed_login_attempts(email)` dengan TTL 1 jam.
- [x] **TASK-06: Upstash Redis Client (Token Blacklisting)**
  - Implementasikan fungsi `add_token_to_blacklist(jti, ttl)` dan `is_token_blacklisted(jti)`.
- [x] **TASK-07: Upstash Redis Client (Multi-Device Active Sessions)**
  - Implementasikan fungsi `add_user_token(user_id, jti, max_tokens)` (maksimal 3 device) dengan auto-revoking session tertua, dan `remove_all_user_tokens(user_id)`.
- [x] **TASK-08: Upstash Redis Client (OTP & Password Reset Token)**
  - Implementasikan fungsi `set_otp(email, otp)`, `get_otp(email)`, `delete_otp(email)` (TTL 5 menit).
  - Implementasikan fungsi `set_reset_token(token, email, ttl)` dan `get_reset_token_email(token)`.
- [x] **TASK-09: Mailer Service (Email Dispatcher)**
  - Buat module `services::email_service` menggunakan crate `lettre`.
  - Implementasikan fungsi helper untuk mengirim email kode OTP dan tautan reset password.

---

### **Bagian 3: Core Auth Logic, JWT & Cookie Middleware**
- [x] **TASK-10: Token Utility (JWT Generator & Validator)**
  - Buat module `utils::jwt` menggunakan crate `jsonwebtoken`.
  - Implementasikan pembuatan `Claims` (sub/user_id, jti, exp) untuk:
    - Access Token (umur 15 menit).
    - Refresh Token (umur 7-30 hari).
- [x] **TASK-11: Standardisasi Error Handling & Response Codes**
  - Buat enum `AppError` di Rust yang memetakan status HTTP dan error JSON.
  - Samakan kode error dengan [packages/auth/src/utils/errorCodes.ts](file:///Users/achdi-gli-macbook/Documents/project/fs-management/packages/auth/src/utils/errorCodes.ts) (misal: `AUTH_ACCOUNT_LOCKED`, `AUTH_INVALID_CREDENTIALS`).
- [x] **TASK-12: Middleware Auth Extractor (Bearer Header + httpOnly Cookie)**
  - Implementasikan Axum Extractor untuk membaca token:
    1. Cek Header `Authorization: Bearer <token>` (prioritas untuk Mobile).
    2. Fallback cek Cookie `access_token` (untuk Web Browser).
  - Validasi signature token dan periksa apakah token ada di blacklist Upstash.

---

### **Bagian 4: Implementasi Endpoint REST Auth**
- [x] **TASK-13: Endpoint Register (`POST /api/v1/auth/signup`)**
  - Validasi email dan password format.
  - Cek email unik di SurrealDB dan buat record user.
  - Trigger pengiriman email verifikasi.
- [x] **TASK-14: Endpoint Login (`POST /api/v1/auth/signin`)**
  - Cek counter gagal login di Upstash (blokir jika >= 5).
  - Verifikasi credentials ke SurrealDB.
  - Reset failed attempts jika sukses.
  - Response: Set `httpOnly` cookie untuk web DAN sertakan token di body JSON untuk mobile.
- [x] **TASK-15: Endpoint Refresh Token (`POST /api/v1/auth/refresh`)**
  - Ekstrak refresh token dari Cookie atau JSON payload.
  - Validasi token dan generate access token baru (set cookie baru + return JSON).
- [x] **TASK-16: Endpoint Signout (`POST /api/v1/auth/signout`)**
  - Ambil JTI token saat ini dan masukkan ke blacklist Upstash Redis.
  - Hapus cookie (`Max-Age=0`).
- [x] **TASK-17: Endpoint Profile (`GET /api/v1/auth/me`)**
  - Protected endpoint menggunakan Auth Extractor (TASK-12).
  - Ambil dan kembalikan data user terbaru dari SurrealDB.

---

### **Bagian 5: Client Refactoring & Pembersihan Kredensial**
- [x] **TASK-18: Buat HTTP ApiClient di `@fs-management/auth`**
  - Buat `packages/auth/src/services/api.client.ts` menggunakan native `fetch`.
  - Handle penyisipan otomatis header `Authorization: Bearer <token>` dari storage dan deteksi network error.
- [x] **TASK-19: Refactor `useAuth.ts` Hook**
  - Alihkan pemanggilan `db.signin()`, `db.signup()`, `upstash.*` ke method baru di `ApiClient`.
  - Pastikan return type dan store state tetap kompatibel dengan UI React Native (`apps/mobile`).
- [x] **TASK-20: Hapus Dependencies & Secrets dari Frontend Bundle**
  - Hapus dependensi `surrealdb.js` dan `@upstash/redis` dari `packages/auth/package.json`.
  - Hapus file `surrealdb.client.ts`, `upstash.client.ts`, dan `gmail.client.ts`.
  - Hapus environment variable sensitif (`SURREALDB_PASSWORD`, `UPSTASH_REST_TOKEN`, `GMAIL_*`) dari file `.env` mobile.

---

## 4. Rangkuman Progress Checklist

| Kategori | Jumlah Task | Status | Fokus Utama |
|---|:---:|:---:|---|
| **Inisialisasi Server** | 3 Task |  Selesai | Setup crate, config, skeleton Axum |
| **Integrasi DB & Services** | 6 Task |  Selesai | SurrealDB pool, Redis Upstash, Mailer |
| **Core Auth & Security** | 3 Task |  Selesai | JWT, Error codes, Dual Auth Extractor |
| **REST Endpoints** | 5 Task |  Selesai | Register, Login, Refresh, Logout, Me |
| **Client Refactor & Cleanup** | 3 Task |  Selesai | ApiClient, update hook, bundle cleanup |
| **TOTAL** | **20 Micro-Tasks** | **20 / 20 Selesai (100%)** | **Semua Task Tuntas** |
