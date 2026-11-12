package routes

import (
	"context"
	"crypto/rand"
	"fmt"
	"math/big"
	"net/http"
	"time"

	"github.com/fs-management/backend-go/internal/errors"
	"github.com/fs-management/backend-go/internal/middleware"
	"github.com/fs-management/backend-go/internal/state"
	"github.com/fs-management/backend-go/internal/utils"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	surrealdb "github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/pkg/models"
)

type SigninPayload struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type SignupPayload struct {
	Email    string  `json:"email" binding:"required"`
	Password string  `json:"password" binding:"required"`
	FullName *string `json:"fullName"`
	Phone    *string `json:"phone"`
}

type VerifyOtpPayload struct {
	Email string `json:"email" binding:"required"`
	OTP   string `json:"otp" binding:"required"`
}

type ForgotPasswordPayload struct {
	Email string `json:"email" binding:"required"`
}

type ResetPasswordPayload struct {
	Token    string `json:"token" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type ChangePasswordPayload struct {
	CurrentPassword string `json:"currentPassword" binding:"required"`
	NewPassword     string `json:"newPassword" binding:"required"`
}

type UserRecord struct {
	ID        *models.RecordID `json:"id,omitempty"`
	Email     string           `json:"email"`
	Password  string           `json:"-"`
	FullName  *string          `json:"fullName,omitempty"`
	Phone     *string          `json:"phone,omitempty"`
	Roles     []string         `json:"roles,omitempty"`
	CreatedAt string           `json:"created_at,omitempty"`
	UpdatedAt string           `json:"updated_at,omitempty"`
}

func randomOTP() string {
	n, err := rand.Int(rand.Reader, big.NewInt(900000))
	if err != nil {
		return "000000"
	}
	return fmt.Sprintf("%06d", n.Int64()+100000)
}

func userIDString(u *UserRecord) string {
	if u.ID != nil {
		return u.ID.String()
	}
	return u.Email
}

func queryUsers(ctx context.Context, st *state.AppState, sql string, vars map[string]any) ([]UserRecord, error) {
	if st.DB == nil {
		return nil, fmt.Errorf("database not connected")
	}
	results, err := surrealdb.Query[[]UserRecord](ctx, st.DB, sql, vars)
	if err != nil {
		return nil, err
	}
	if results == nil || len(*results) == 0 {
		return nil, nil
	}
	return (*results)[0].Result, nil
}

// TASK-13: Signup
func signup(st *state.AppState) gin.HandlerFunc {
	return func(c *gin.Context) {
		var payload SignupPayload
		if err := c.ShouldBindJSON(&payload); err != nil {
			errors.Abort(c, errors.BadRequest("Email and password required"))
			return
		}

		ctx := c.Request.Context()
		if st.DB == nil {
			errors.Abort(c, errors.DatabaseError("database not connected"))
			return
		}
		existing, err := queryUsers(ctx, st, "SELECT * FROM user WHERE email = $email", map[string]any{"email": payload.Email})
		if err != nil {
			errors.Abort(c, errors.DatabaseError(err.Error()))
			return
		}
		if len(existing) > 0 {
			errors.Abort(c, errors.EmailAlreadyExists())
			return
		}

		now := time.Now().UTC().Format(time.RFC3339)
		data := map[string]any{
			"email":      payload.Email,
			"password":   payload.Password,
			"fullName":   payload.FullName,
			"phone":      payload.Phone,
			"roles":      []string{"user"},
			"created_at": now,
			"updated_at": now,
		}

		created, err := surrealdb.Create[UserRecord](ctx, st.DB, "user", data)
		if err != nil {
			errors.Abort(c, errors.DatabaseError(err.Error()))
			return
		}

		otp := randomOTP()
		_ = st.Redis.SetOTP(ctx, payload.Email, otp)
		_ = st.Email.SendOTP(payload.Email, otp)

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "User registered successfully",
			"email":   payload.Email,
			"user":    created,
		})
	}
}

// TASK-14: Signin
func signin(st *state.AppState) gin.HandlerFunc {
	return func(c *gin.Context) {
		var payload SigninPayload
		if err := c.ShouldBindJSON(&payload); err != nil {
			errors.Abort(c, errors.BadRequest("Email and password required"))
			return
		}

		ctx := c.Request.Context()

		failedAttempts, _ := st.Redis.GetFailedLoginAttempts(ctx, payload.Email)
		if failedAttempts >= 5 {
			errors.Abort(c, errors.AccountLocked())
			return
		}

		users, err := queryUsers(ctx, st,
			"SELECT * FROM user WHERE email = $email AND password = $password",
			map[string]any{"email": payload.Email, "password": payload.Password})
		if err != nil {
			errors.Abort(c, errors.DatabaseError(err.Error()))
			return
		}
		if len(users) == 0 {
			_, _ = st.Redis.IncrementFailedLoginAttempts(ctx, payload.Email)
			errors.Abort(c, errors.InvalidCredentials())
			return
		}
		user := users[0]

		_ = st.Redis.ResetFailedLoginAttempts(ctx, payload.Email)

		userID := userIDString(&user)
		jti := uuid.NewString()

		accessToken, err := utils.GenerateToken(userID, user.Email, jti, "access",
			st.Config.JWTExpirationMinutes*60, st.Config.JWTSecret)
		if err != nil {
			errors.Abort(c, errors.Internal(err.Error()))
			return
		}

		refreshToken, err := utils.GenerateToken(userID, user.Email, uuid.NewString(), "refresh",
			st.Config.RefreshTokenExpirationDays*86400, st.Config.JWTSecret)
		if err != nil {
			errors.Abort(c, errors.Internal(err.Error()))
			return
		}

		_ = st.Redis.AddUserToken(ctx, userID, jti, 3)

		accessMaxAge := int(st.Config.JWTExpirationMinutes) * 60
		refreshMaxAge := int(st.Config.RefreshTokenExpirationDays) * 86400

		http.SetCookie(c.Writer, &http.Cookie{
			Name:     "access_token",
			Value:    accessToken,
			Path:     "/",
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
			MaxAge:   accessMaxAge,
		})
		http.SetCookie(c.Writer, &http.Cookie{
			Name:     "refresh_token",
			Value:    refreshToken,
			Path:     "/api/v1/auth/refresh",
			HttpOnly: true,
			SameSite: http.SameSiteStrictMode,
			MaxAge:   refreshMaxAge,
		})

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"tokens": gin.H{
				"accessToken":  accessToken,
				"refreshToken": refreshToken,
				"expiresAt":    time.Now().UnixMilli() + st.Config.JWTExpirationMinutes*60*1000,
			},
			"user": gin.H{
				"id":       userID,
				"email":    user.Email,
				"fullName": user.FullName,
				"phone":    user.Phone,
			},
		})
	}
}

// Verify OTP
func verifyOTP(st *state.AppState) gin.HandlerFunc {
	return func(c *gin.Context) {
		var payload VerifyOtpPayload
		if err := c.ShouldBindJSON(&payload); err != nil {
			errors.Abort(c, errors.BadRequest("Email and OTP required"))
			return
		}

		ctx := c.Request.Context()
		storedOTP, err := st.Redis.GetOTP(ctx, payload.Email)
		if err != nil {
			errors.Abort(c, errors.Internal(err.Error()))
			return
		}
		if storedOTP == "" || storedOTP != payload.OTP {
			errors.Abort(c, errors.BadRequest("Invalid OTP"))
			return
		}

		_ = st.Redis.DeleteOTP(ctx, payload.Email)
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "OTP verified successfully"})
	}
}

// Forgot Password
func forgotPassword(st *state.AppState) gin.HandlerFunc {
	return func(c *gin.Context) {
		var payload ForgotPasswordPayload
		if err := c.ShouldBindJSON(&payload); err != nil {
			errors.Abort(c, errors.BadRequest("Email required"))
			return
		}

		ctx := c.Request.Context()
		existing, err := queryUsers(ctx, st, "SELECT * FROM user WHERE email = $email LIMIT 1",
			map[string]any{"email": payload.Email})
		if err != nil {
			errors.Abort(c, errors.DatabaseError(err.Error()))
			return
		}
		if len(existing) == 0 {
			errors.Abort(c, errors.InvalidCredentials())
			return
		}

		resetToken := uuid.NewString()
		_ = st.Redis.SetResetToken(ctx, resetToken, payload.Email, 3600)
		_ = st.Email.SendPasswordReset(payload.Email, resetToken)

		c.JSON(http.StatusOK, gin.H{"success": true, "message": "Password reset email sent"})
	}
}

// Reset Password
func resetPassword(st *state.AppState) gin.HandlerFunc {
	return func(c *gin.Context) {
		var payload ResetPasswordPayload
		if err := c.ShouldBindJSON(&payload); err != nil {
			errors.Abort(c, errors.BadRequest("Token and password required"))
			return
		}

		ctx := c.Request.Context()
		if st.DB == nil {
			errors.Abort(c, errors.DatabaseError("database not connected"))
			return
		}
		email, err := st.Redis.GetResetTokenEmail(ctx, payload.Token)
		if err != nil {
			errors.Abort(c, errors.Internal(err.Error()))
			return
		}
		if email == "" {
			errors.Abort(c, errors.BadRequest("Invalid or expired reset token"))
			return
		}

		now := time.Now().UTC().Format(time.RFC3339)
		_, err = surrealdb.Query[[]UserRecord](ctx, st.DB,
			"UPDATE user SET password = $password, updated_at = $now WHERE email = $email",
			map[string]any{"password": payload.Password, "now": now, "email": email})
		if err != nil {
			errors.Abort(c, errors.DatabaseError(err.Error()))
			return
		}

		_ = st.Redis.DeleteResetToken(ctx, payload.Token)
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "Password reset successfully"})
	}
}

// Change Password
func changePassword(st *state.AppState) gin.HandlerFunc {
	return func(c *gin.Context) {
		claims := middleware.GetClaims(c)
		if claims == nil {
			errors.Abort(c, errors.Unauthorized("Missing authentication token"))
			return
		}

		var payload ChangePasswordPayload
		if err := c.ShouldBindJSON(&payload); err != nil {
			errors.Abort(c, errors.BadRequest("Current and new password required"))
			return
		}

		ctx := c.Request.Context()
		if st.DB == nil {
			errors.Abort(c, errors.DatabaseError("database not connected"))
			return
		}
		users, err := queryUsers(ctx, st,
			"SELECT * FROM user WHERE email = $email AND password = $password",
			map[string]any{"email": claims.Email, "password": payload.CurrentPassword})
		if err != nil {
			errors.Abort(c, errors.DatabaseError(err.Error()))
			return
		}
		if len(users) == 0 {
			errors.Abort(c, errors.InvalidCredentials())
			return
		}

		now := time.Now().UTC().Format(time.RFC3339)
		_, err = surrealdb.Query[[]UserRecord](ctx, st.DB,
			"UPDATE user SET password = $password, updated_at = $now WHERE email = $email",
			map[string]any{"password": payload.NewPassword, "now": now, "email": claims.Email})
		if err != nil {
			errors.Abort(c, errors.DatabaseError(err.Error()))
			return
		}

		c.JSON(http.StatusOK, gin.H{"success": true, "message": "Password updated successfully"})
	}
}

// TASK-15: Refresh
func refreshToken(st *state.AppState) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		refreshToken, err := c.Cookie("refresh_token")
		if err != nil || refreshToken == "" {
			errors.Abort(c, errors.Unauthorized("Refresh token missing"))
			return
		}

		claims, err := utils.ValidateToken(refreshToken, st.Config.JWTSecret)
		if err != nil {
			errors.Abort(c, errors.Unauthorized("Invalid refresh token"))
			return
		}

		newJTI := uuid.NewString()
		newAccessToken, err := utils.GenerateToken(claims.Subject, claims.Email, newJTI, "access",
			st.Config.JWTExpirationMinutes*60, st.Config.JWTSecret)
		if err != nil {
			errors.Abort(c, errors.Internal(err.Error()))
			return
		}

		_ = st.Redis.AddUserToken(ctx, claims.Subject, newJTI, 3)

		http.SetCookie(c.Writer, &http.Cookie{
			Name:     "access_token",
			Value:    newAccessToken,
			Path:     "/",
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
			MaxAge:   int(st.Config.JWTExpirationMinutes) * 60,
		})

		c.JSON(http.StatusOK, gin.H{
			"success":     true,
			"accessToken": newAccessToken,
		})
	}
}

// TASK-16: Signout
func signout(st *state.AppState) gin.HandlerFunc {
	return func(c *gin.Context) {
		claims := middleware.GetClaims(c)
		if claims == nil {
			errors.Abort(c, errors.Unauthorized("Missing authentication token"))
			return
		}

		ctx := c.Request.Context()
		_ = st.Redis.AddTokenToBlacklist(ctx, claims.JTI, 86400)
		_ = st.Redis.RemoveUserToken(ctx, claims.Subject, claims.JTI)

		http.SetCookie(c.Writer, &http.Cookie{
			Name:     "access_token",
			Value:    "",
			Path:     "/",
			HttpOnly: true,
			MaxAge:   -1,
		})
		http.SetCookie(c.Writer, &http.Cookie{
			Name:     "refresh_token",
			Value:    "",
			Path:     "/api/v1/auth/refresh",
			HttpOnly: true,
			MaxAge:   -1,
		})

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Signed out successfully",
		})
	}
}

// TASK-17: Me
func getMe(st *state.AppState) gin.HandlerFunc {
	return func(c *gin.Context) {
		claims := middleware.GetClaims(c)
		if claims == nil {
			errors.Abort(c, errors.Unauthorized("Missing authentication token"))
			return
		}

		ctx := c.Request.Context()
		if st.DB == nil {
			errors.Abort(c, errors.DatabaseError("database not connected"))
			return
		}
		var users []map[string]any
		results, err := surrealdb.Query[[]map[string]any](ctx, st.DB,
			"SELECT id, email, fullName, phone, roles, created_at FROM user WHERE email = $email",
			map[string]any{"email": claims.Email})
		if err != nil {
			errors.Abort(c, errors.DatabaseError(err.Error()))
			return
		}
		if results != nil && len(*results) > 0 {
			users = (*results)[0].Result
		}

		var user any
		if len(users) > 0 {
			user = users[0]
		} else {
			user = gin.H{"id": claims.Subject, "email": claims.Email}
		}

		c.JSON(http.StatusOK, gin.H{"user": user})
	}
}

func RegisterRoutes(rg *gin.RouterGroup, st *state.AppState) {
	rg.POST("/signup", signup(st))
	rg.POST("/signin", signin(st))
	rg.POST("/verify-otp", verifyOTP(st))
	rg.POST("/forgot-password", forgotPassword(st))
	rg.POST("/reset-password", resetPassword(st))
	rg.POST("/change-password", middleware.RequireAuth(st), changePassword(st))
	rg.POST("/refresh", refreshToken(st))
	rg.POST("/signout", middleware.RequireAuth(st), signout(st))
	rg.GET("/me", middleware.RequireAuth(st), getMe(st))
}

