# FS-Management Monorepo

Sistem manajemen full-stack berbasis monorepo dengan **Rust Backend Service (Axum)** dan **Mobile Client (React Native / Expo)**.

---

## 🏗️ Arsitektur Proyek

```text
fs-management/
├── apps/
│   └── mobile/           # Aplikasi React Native (Expo SDK 58, React Native 0.88)
├── crates/
│   └── server/           # Rust Backend (Axum, SurrealDB Cloud, Upstash Redis, JWT)
├── packages/
│   ├── auth/             # Shared Auth Package (Zustand, ApiClient, storage mechanism)
│   ├── booking/          # Shared Booking Package
│   └── shared/           # Common utilities & types
└── pnpm-workspace.yaml   # Monorepo configuration
```

---

## 📋 Prasyarat Sistem

Pastikan tools berikut sudah terpasang di komputer Anda:
- **Node.js**: v20+ atau v22+
- **pnpm**: v9+ (`corepack enable && corepack prepare pnpm@latest --activate`)
- **Rust & Cargo**: v1.75+ (`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`)
- **Expo Go App** (di smartphone Android/iOS) atau Emulator/Simulator.

---

## ⚙️ Langkah Instalasi & Konfigurasi

### 1. Install Prerequisites

#### 1.1 Install Rust & Cargo
```bash
# macOS/Linux
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Verify installation
rustc --version
cargo --version
```

#### 1.2 Install Node.js & pnpm
```bash
# Install Node.js (v20+ or v22+)
# macOS
brew install node

# Linux
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js
node --version

# Enable and install pnpm
corepack enable
corepack prepare pnpm@latest --activate

# Verify pnpm
pnpm --version
```

#### 1.3 Install Expo CLI
```bash
pnpm add -g expo-cli

# Verify
expo --version
```

#### 1.4 Install Expo Go App
- Download **Expo Go** app dari App Store (iOS) atau Google Play Store (Android)
- Ini diperlukan untuk menjalankan mobile app di device fisik

---

### 2. Clone & Install Dependencies Monorepo
```bash
# Clone repository (jika belum)
git clone <your-repo-url>
cd fs-management

# Install seluruh dependensi JavaScript/TypeScript
pnpm install
```

---

### 3. Setup SurrealDB Cloud

#### 3.1 Create SurrealDB Account & Database
1. Go to [cloud.surrealdb.com](https://cloud.surrealdb.com)
2. Sign up or login
3. Create new project
4. Create database with namespace `fs_management` and database `production`

#### 3.2 Define Auth Scope
Login to SurrealDB Cloud Console and run this query:

```sql
-- Define auth scope for user authentication
DEFINE SCOPE user_auth SIGNIN (
    SELECT * FROM user WHERE email = $email AND password = crypto::argon2::compare($password, password)
) SIGNUP (
    CREATE user SET 
        email = $email, 
        password = crypto::argon2::generate($password),
        fullName = $fullName,
        phone = $phone,
        roles = ['user'],
        createdAt = time::now(),
        updatedAt = time::now()
);
```

#### 3.3 Create Database User
```sql
DEFINE USER admin ON DATABASE PASSWORD 'your_strong_password' ROLES OWNER;
```

#### 3.4 Get Connection Details
- Copy the WebSocket URL (format: `wss://<id>.surrealdb.cloud/rpc`)
- Note the namespace and database name

---

### 4. Setup Upstash Redis

#### 4.1 Create Upstash Account
1. Go to [console.upstash.com](https://console.upstash.com)
2. Sign up with GitHub/Google

#### 4.2 Create Redis Database
1. Click "Create Database"
2. Choose region (closest to your server)
3. Set database name: "fs-management-auth"
4. Click "Create"

#### 4.3 Get Connection Details
- Go to database details
- Copy "REST API URL" or "Redis URL"
- Format: `redis://<host>:<port>` or `rediss://<token>@<host>:<port>`

---

### 5. Konfigurasi Environment Backend (Rust)
Salin contoh environment file untuk server:
```bash
cp crates/server/.env.example crates/server/.env
```

Buka `crates/server/.env` dan isi sesuai kredensial Anda:
```env
SERVER_PORT=8080
SERVER_HOST=0.0.0.0
CORS_ORIGIN=*

# SurrealDB Cloud
SURREALDB_URL=wss://<your-id>.surrealdb.cloud/rpc
SURREALDB_NAMESPACE=fs_management
SURREALDB_DATABASE=production
SURREALDB_USERNAME=admin
SURREALDB_PASSWORD=your_strong_password

# Upstash Redis
UPSTASH_REDIS_URL=redis://<host>:<port>

# JWT
JWT_SECRET=generate_with_openssl_rand_base64_32
JWT_EXPIRATION_MINUTES=15
REFRESH_TOKEN_EXPIRATION_DAYS=30

# SMTP (Pengiriman OTP / Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=email_anda@gmail.com
SMTP_PASSWORD=app_password_gmail
SMTP_FROM_EMAIL=email_anda@gmail.com
```

#### 5.1 Generate Secure JWT Secret
```bash
openssl rand -base64 32
```

---

### 6. Setup Email (Gmail)
1. Enable 2FA di Google Account
2. Buat App Password di Google Account Settings
3. Gunakan App Password sebagai `SMTP_PASSWORD` di environment variables

---

---

## 🚀 Cara Menjalankan

Buka 2 tab/jendela terminal terpisah untuk menjalankan Backend dan Mobile:

### Terminal 1: Jalankan Backend Server (Rust)
```bash
# Dari root monorepo
cargo run --bin server

# Atau dari dalam direktori crates/server
cd crates/server && cargo run
```
*Server akan berjalan di `http://0.0.0.0:8080`.*

---

### Terminal 2: Jalankan Mobile App (Expo)
```bash
# Dari root monorepo
cd apps/mobile

# Jalankan Expo Metro bundler
npx expo start
```

**Opsi Menjalankan di Device:**
- **Device Fisik (Expo Go)**: Scan QR Code yang muncul di terminal menggunakan kamera (iOS) atau aplikasi Expo Go (Android). Pastikan smartphone dan laptop terhubung ke jaringan Wi-Fi yang sama.
- **iOS Simulator**: Tekan `i` di terminal.
- **Android Emulator**: Tekan `a` di terminal.
- **Web Browser**: Tekan `w` di terminal.

> **Catatan Koneksi API Mobile ke Backend**:
> `apps/mobile/App.tsx` secara otomatis mendeteksi alamat IP komputer host dari Expo (`Constants.expoConfig.hostUri`), sehingga device fisik langsung dapat terhubung ke `http://<IP-Laptop>:8080` tanpa perlu konfigurasi manual.
> Jika ingin override URL backend secara manual, buat file `apps/mobile/.env`:
> ```env
> EXPO_PUBLIC_API_URL=http://192.168.x.x:8080
> ```

---

## 🛑 Cara Menghentikan Layanan

- **Rust Server**: Tekan `Ctrl + C` di terminal server, atau jika berjalan di background:
  ```bash
  kill $(lsof -t -i:8080)
  ```
- **Mobile Bundler (Metro)**: Tekan `Ctrl + C` di terminal Expo.

---

## 🧪 Validasi & Testing

- **Cek Status Server**:
  ```bash
  curl http://localhost:8080/health
  ```
- **Type Check Mobile**:
  ```bash
  cd apps/mobile && npx tsc --noEmit
  ```

---

## 🌐 Production Deployment

### Free Tier + Pay-As-You-Go Options

#### Option 1: Fly.io (Recommended)
- **Free Tier**: 3 VMs with 256MB RAM each, 3GB bandwidth/month
- **Pay-As-You-Go**: $0.00016/second for CPU, $0.10/GB storage

**Setup Steps:**
```bash
# Install Fly.io CLI
brew install flyctl  # macOS
# or
curl -L https://fly.io/api/install | sh  # Linux

# Login
flyctl auth login

# Initialize and deploy
flyctl launch
flyctl deploy

# Set environment variables
flyctl secrets set SURREALDB_URL=wss://<id>.surrealdb.cloud/rpc
flyctl secrets set SURREALDB_NAMESPACE=fs_management
flyctl secrets set SURREALDB_DATABASE=production
flyctl secrets set SURREALDB_USERNAME=admin
flyctl secrets set SURREALDB_PASSWORD=<password>
flyctl secrets set UPSTASH_REDIS_URL=redis://<host>:<port>
flyctl secrets set JWT_SECRET=<secret>
flyctl secrets set SMTP_HOST=smtp.gmail.com
flyctl secrets set SMTP_PORT=587
flyctl secrets set SMTP_USERNAME=<email>
flyctl secrets set SMTP_PASSWORD=<app_password>
flyctl secrets set SMTP_FROM_EMAIL=<email>
flyctl secrets set CORS_ORIGIN=https://yourdomain.com
```

#### Option 2: Render
- **Free Tier**: 750 hours/month, 512MB RAM
- **Pay-As-You-Go**: $7/month for 512MB RAM (always-on)

**Setup Steps:**
1. Go to [render.com](https://render.com) and sign up with GitHub
2. Create new Web Service
3. Connect your GitHub repository
4. Configure build settings:
   - Build Command: `cd crates/server && cargo build --release`
   - Start Command: `./target/release/server`
5. Add environment variables in Render dashboard
6. Deploy - Render will auto-deploy on every push to main branch

#### Option 3: Railway
- **Free Tier**: $5 credit/month (500 hours of usage)
- **Pay-As-You-Go**: Usage-based pricing after credits

**Setup Steps:**
1. Go to [railway.app](https://railway.app) and sign up with GitHub
2. Create new project
3. Select "Deploy from GitHub repo"
4. Railway will auto-detect Rust project
5. Add environment variables in Railway dashboard
6. Deploy - Railway will auto-deploy on every push to main branch

### Production Environment Variables Checklist
- [ ] `SURREALDB_URL` - SurrealDB Cloud WebSocket URL
- [ ] `SURREALDB_NAMESPACE` - Database namespace
- [ ] `SURREALDB_DATABASE` - Database name
- [ ] `SURREALDB_USERNAME` - Database username
- [ ] `SURREALDB_PASSWORD` - Strong password
- [ ] `UPSTASH_REDIS_URL` - Redis connection URL
- [ ] `JWT_SECRET` - Secure random string (32+ chars)
- [ ] `SMTP_HOST` - SMTP server
- [ ] `SMTP_PORT` - SMTP port
- [ ] `SMTP_USERNAME` - Email username
- [ ] `SMTP_PASSWORD` - App password (not regular password)
- [ ] `SMTP_FROM_EMAIL` - Sender email
- [ ] `CORS_ORIGIN` - Frontend domain (production)

---

## 📚 API Endpoints

### Auth Endpoints
- `POST /api/v1/auth/signin` - Login
- `POST /api/v1/auth/signup` - Register
- `POST /api/v1/auth/verify-otp` - Verify OTP
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token
- `POST /api/v1/auth/change-password` - Change password (authenticated)
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/signout` - Logout
- `GET /api/v1/auth/me` - Get current user profile (authenticated)

### Health Check
- `GET /health` - Server health status

---

## 🔒 Security Best Practices

1. **Never commit `.env` files to git**
2. **Use strong passwords** (minimum 16 characters for database)
3. **Generate secure JWT secret** with `openssl rand -base64 32`
4. **Enable SSL/TLS** for all connections in production
5. **Use App Passwords** for Gmail SMTP (not regular passwords)
6. **Set proper file permissions**: `chmod 600 .env`
7. **Regular backups** - SurrealDB Cloud has built-in backups

---

## 🐛 Troubleshooting

### Server Won't Start
- Check logs: `cargo run` or `docker-compose logs server`
- Verify environment variables are set correctly
- Check port 8080 is not in use

### Database Connection Failed
- Verify SurrealDB URL format (wss:// for cloud)
- Check firewall allows outbound connections
- Test connection from server: `curl <surrealdb-url>`

### Redis Connection Failed
- Verify Redis URL format
- Check Upstash database is active
- Test connection: `redis-cli -u <url> PING`

### Email Not Sending
- Verify SMTP credentials
- Check App Password (not regular password)
- Test SMTP connection manually

### Mobile App Can't Connect to Backend
- Check backend is running: `curl http://localhost:8080/health`
- Verify IP address in `App.tsx` auto-detection
- Manual override: Set `EXPO_PUBLIC_API_URL` in `apps/mobile/.env`

---

## 📖 Additional Documentation

- [Rust Backend Production Deployment Guide](.windsurf/plans/rust-backend-setup-f94bb5.md)
- [SurrealDB Migration to Rust Backend](MIGRATION_SURREALDB_RUST.md)

