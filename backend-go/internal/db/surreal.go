package db

import (
	"context"
	"fmt"

	"github.com/fs-management/backend-go/internal/config"
	surrealdb "github.com/surrealdb/surrealdb.go"
)

func Connect(ctx context.Context, cfg *config.AppConfig) (*surrealdb.DB, error) {
	db, err := surrealdb.FromEndpointURLString(ctx, cfg.SurrealDBURL)
	if err != nil {
		return nil, fmt.Errorf("connect surrealdb: %w", err)
	}

	if cfg.SurrealDBUsername != "" && cfg.SurrealDBPassword != "" {
		if _, err := db.SignIn(ctx, surrealdb.Auth{
			Username: cfg.SurrealDBUsername,
			Password: cfg.SurrealDBPassword,
		}); err != nil {
			_ = db.Close(ctx)
			return nil, fmt.Errorf("surrealdb signin: %w", err)
		}
	}

	if err := db.Use(ctx, cfg.SurrealDBNamespace, cfg.SurrealDBDatabase); err != nil {
		_ = db.Close(ctx)
		return nil, fmt.Errorf("surrealdb use ns/db: %w", err)
	}

	return db, nil
}
