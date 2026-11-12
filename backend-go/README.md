# FS Management Backend (Go)

Backend auth service — porting dari `crates/server` (Rust/Axum). Kontrak API identik.

## Stack

- **Gin** — HTTP framework
- **SurrealDB Go SDK** (`surrealdb.go`) — database via WebSocket
- **go-redis** — Upstash Redis (lockout, blacklist, sessions, OTP, reset token)
- **golang-jwt/v5** — JWT (HS256)
- **go-mail** — SMTP email (OTP & password reset)

## Menjalankan

```bash
cp .env.example .env   # isi credentials
cp .env ../../crates/server/.env  # atau copy dari Rust env

go run ./cmd/server
```

Server jalan di `http://localhost:8080` (default `SERVER_PORT`).

## Endpoints

| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| GET | `/health` | - | Health check |
| POST | `/api/v1/auth/signup` | - | Register + kirim OTP |
| POST | `/api/v1/auth/signin` | - | Login, set cookie + return tokens |
| POST | `/api/v1/auth/verify-otp` | - | Verifikasi OTP |
| POST | `/api/v1/auth/forgot-password` | - | Kirim reset token |
| POST | `/api/v1/auth/reset-password` | - | Reset password via token |
| POST | `/api/v1/auth/change-password` | Bearer/cookie | Ganti password |
| POST | `/api/v1/auth/refresh` | refresh cookie | Rotate access token |
| POST | `/api/v1/auth/signout` | Bearer/cookie | Logout + blacklist JTI |
| GET | `/api/v1/auth/me` | Bearer/cookie | Profil user |

## Struktur

```
cmd/server/main.go       # entrypoint, CORS, graceful shutdown
internal/
  config/                # env loader
  db/surreal.go          # SurrealDB connect + signin + use ns/db
  middleware/auth.go     # RequireAuth: Bearer → cookie fallback + blacklist
  routes/auth.go         # semua handler auth
  services/redis.go      # lockout, blacklist, sessions, OTP, reset
  services/email.go      # SMTP OTP + reset
  state/state.go         # AppState
  utils/jwt.go           # Claims + generate/validate
  errors/errors.go       # AppError → JSON response
```

## Catatan

- Dual auth: `Authorization: Bearer` (mobile) prioritas, fallback cookie `access_token` (web)
- Cookie `refresh_token` path: `/api/v1/auth/refresh`, SameSite=Strict
- Kalau SurrealDB gagal connect, server tetap jalan (warning log)
- Kalau SMTP kosong, email di-log ke console (dev-mode)
