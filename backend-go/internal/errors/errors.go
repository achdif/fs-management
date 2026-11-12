package errors

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type AppError struct {
	Status  int
	Code    string
	Message string
}

func (e *AppError) Error() string { return e.Message }

func InvalidCredentials() *AppError {
	return &AppError{http.StatusUnauthorized, "AUTH_INVALID_CREDENTIALS", "Invalid email or password"}
}

func AccountLocked() *AppError {
	return &AppError{http.StatusForbidden, "AUTH_ACCOUNT_LOCKED", "Account locked. Too many failed attempts. Please try again later."}
}

func Unauthorized(msg string) *AppError {
	return &AppError{http.StatusUnauthorized, "AUTH_SESSION_EXPIRED", msg}
}

func EmailAlreadyExists() *AppError {
	return &AppError{http.StatusConflict, "AUTH_EMAIL_ALREADY_EXISTS", "Email is already registered"}
}

func DatabaseError(msg string) *AppError {
	return &AppError{http.StatusInternalServerError, "ED001", msg}
}

func BadRequest(msg string) *AppError {
	return &AppError{http.StatusBadRequest, "BAD_REQUEST", msg}
}

func Internal(msg string) *AppError {
	return &AppError{http.StatusInternalServerError, "INTERNAL_ERROR", msg}
}

// Abort writes the error response and aborts the request.
func Abort(c *gin.Context, err *AppError) {
	c.AbortWithStatusJSON(err.Status, gin.H{
		"error": gin.H{
			"code":    err.Code,
			"message": err.Message,
		},
	})
}
