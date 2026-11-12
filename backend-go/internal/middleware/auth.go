package middleware

import (
	"strings"

	"github.com/fs-management/backend-go/internal/errors"
	"github.com/fs-management/backend-go/internal/state"
	"github.com/fs-management/backend-go/internal/utils"
	"github.com/gin-gonic/gin"
)

const ClaimsKey = "auth_claims"

// RequireAuth extracts the JWT from Authorization: Bearer header (mobile)
// or falls back to the access_token cookie (web), validates it, and checks
// the Redis blacklist.
func RequireAuth(st *state.AppState) gin.HandlerFunc {
	return func(c *gin.Context) {
		var token string

		if authHeader := c.GetHeader("Authorization"); strings.HasPrefix(authHeader, "Bearer ") {
			token = strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))
		} else if cookie, err := c.Cookie("access_token"); err == nil && cookie != "" {
			token = cookie
		}

		if token == "" {
			errors.Abort(c, errors.Unauthorized("Missing authentication token"))
			return
		}

		claims, err := utils.ValidateToken(token, st.Config.JWTSecret)
		if err != nil {
			errors.Abort(c, errors.Unauthorized("Invalid or expired token"))
			return
		}

		blacklisted, err := st.Redis.IsTokenBlacklisted(c.Request.Context(), claims.JTI)
		if err == nil && blacklisted {
			errors.Abort(c, errors.Unauthorized("Token has been revoked"))
			return
		}

		c.Set(ClaimsKey, claims)
		c.Next()
	}
}

func GetClaims(c *gin.Context) *utils.Claims {
	if v, ok := c.Get(ClaimsKey); ok {
		if claims, ok := v.(*utils.Claims); ok {
			return claims
		}
	}
	return nil
}

