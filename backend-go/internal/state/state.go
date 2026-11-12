package state

import (
	"github.com/fs-management/backend-go/internal/config"
	"github.com/fs-management/backend-go/internal/services"
	surrealdb "github.com/surrealdb/surrealdb.go"
)

type AppState struct {
	Config *config.AppConfig
	DB     *surrealdb.DB
	Redis  *services.RedisService
	Email  *services.EmailService
}
