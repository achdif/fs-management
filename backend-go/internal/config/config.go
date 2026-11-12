package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type AppConfig struct {
	ServerHost string
	ServerPort int
	CorsOrigin string

	SurrealDBURL         string
	SurrealDBNamespace   string
	SurrealDBDatabase    string
	SurrealDBUsername    string
	SurrealDBPassword    string

	UpstashRedisURL string

	JWTSecret                  string
	JWTExpirationMinutes       int64
	RefreshTokenExpirationDays int64

	SMTPHost      string
	SMTPPort      int
	SMTPUsername  string
	SMTPPassword  string
	SMTPFromEmail string
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func envInt(key string, fallback int64) int64 {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.ParseInt(v, 10, 64); err == nil {
			return n
		}
	}
	return fallback
}

func Load() (*AppConfig, error) {
	_ = godotenv.Load()

	port := envInt("SERVER_PORT", 8080)
	if port < 1 || port > 65535 {
		return nil, fmt.Errorf("invalid SERVER_PORT: %d", port)
	}

	return &AppConfig{
		ServerHost: envOr("SERVER_HOST", "0.0.0.0"),
		ServerPort: int(port),
		CorsOrigin: envOr("CORS_ORIGIN", "http://localhost:3000"),

		SurrealDBURL:       envOr("SURREALDB_URL", "wss://127.0.0.1:8000/rpc"),
		SurrealDBNamespace: envOr("SURREALDB_NAMESPACE", "test"),
		SurrealDBDatabase:  envOr("SURREALDB_DATABASE", "test"),
		SurrealDBUsername:  os.Getenv("SURREALDB_USERNAME"),
		SurrealDBPassword:  os.Getenv("SURREALDB_PASSWORD"),

		UpstashRedisURL: envOr("UPSTASH_REDIS_URL", "redis://127.0.0.1:6379"),

		JWTSecret:                  envOr("JWT_SECRET", "default_jwt_secret_change_me_in_production"),
		JWTExpirationMinutes:       envInt("JWT_EXPIRATION_MINUTES", 15),
		RefreshTokenExpirationDays: envInt("REFRESH_TOKEN_EXPIRATION_DAYS", 30),

		SMTPHost:      os.Getenv("SMTP_HOST"),
		SMTPPort:      int(envInt("SMTP_PORT", 587)),
		SMTPUsername:  os.Getenv("SMTP_USERNAME"),
		SMTPPassword:  os.Getenv("SMTP_PASSWORD"),
		SMTPFromEmail: os.Getenv("SMTP_FROM_EMAIL"),
	}, nil
}
