package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/fs-management/backend-go/internal/config"
	"github.com/fs-management/backend-go/internal/db"
	"github.com/fs-management/backend-go/internal/routes"
	"github.com/fs-management/backend-go/internal/services"
	"github.com/fs-management/backend-go/internal/state"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	ctx := context.Background()

	// SurrealDB — jangan gagalkan startup jika koneksi cloud belum valid
	surrealDB, err := db.Connect(ctx, cfg)
	if err != nil {
		log.Printf("⚠️ Gagal konek ke SurrealDB (%s): %v. Server tetap berjalan.", cfg.SurrealDBURL, err)
		// db tetap nil — handler akan error saat dipakai; sama seperti perilaku Rust dummy
	}

	redisSvc := services.NewRedisService(cfg.UpstashRedisURL)
	emailSvc := services.NewEmailService(cfg)

	st := &state.AppState{
		Config: cfg,
		DB:     surrealDB,
		Redis:  redisSvc,
		Email:  emailSvc,
	}

	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())

	// CORS — comma-separated origins, credentials allowed
	origins := strings.Split(cfg.CorsOrigin, ",")
	r.Use(func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		for _, o := range origins {
			if strings.TrimSpace(o) == origin {
				c.Header("Access-Control-Allow-Origin", origin)
				break
			}
		}
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"service": "fs-management-server",
		})
	})

	authGroup := r.Group("/api/v1/auth")
	routes.RegisterRoutes(authGroup, st)

	addr := fmt.Sprintf("%s:%d", cfg.ServerHost, cfg.ServerPort)
	srv := &http.Server{
		Addr:    addr,
		Handler: r,
	}

	go func() {
		log.Printf("🚀 Server running at http://%s", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}
	_ = redisSvc.Close()
	if surrealDB != nil {
		_ = surrealDB.Close(context.Background())
	}
	log.Println("Server exited")
}
