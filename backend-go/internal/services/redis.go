package services

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisService struct {
	client *redis.Client
}

func NewRedisService(redisURL string) *RedisService {
	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		return &RedisService{client: nil}
	}
	client := redis.NewClient(opt)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := client.Ping(ctx).Err(); err != nil {
		_ = client.Close()
		return &RedisService{client: nil}
	}
	return &RedisService{client: client}
}

func (r *RedisService) key(parts ...string) string {
	out := ""
	for i, p := range parts {
		if i > 0 {
			out += ":"
		}
		out += p
	}
	return out
}

// TASK-05: Account Lockout Tracker
func (r *RedisService) IncrementFailedLoginAttempts(ctx context.Context, email string) (int64, error) {
	if r.client == nil {
		return 0, nil
	}
	key := r.key("login", "failed", email)
	count, err := r.client.Incr(ctx, key).Result()
	if err != nil {
		return 0, err
	}
	_ = r.client.Expire(ctx, key, time.Hour).Err()
	return count, nil
}

func (r *RedisService) GetFailedLoginAttempts(ctx context.Context, email string) (int64, error) {
	if r.client == nil {
		return 0, nil
	}
	val, err := r.client.Get(ctx, r.key("login", "failed", email)).Int64()
	if err == redis.Nil {
		return 0, nil
	}
	return val, err
}

func (r *RedisService) ResetFailedLoginAttempts(ctx context.Context, email string) error {
	if r.client == nil {
		return nil
	}
	return r.client.Del(ctx, r.key("login", "failed", email)).Err()
}

// TASK-06: Token Blacklist
func (r *RedisService) AddTokenToBlacklist(ctx context.Context, jti string, ttlSeconds int64) error {
	if r.client == nil {
		return nil
	}
	return r.client.Set(ctx, r.key("blacklist", jti), "blacklisted", time.Duration(ttlSeconds)*time.Second).Err()
}

func (r *RedisService) IsTokenBlacklisted(ctx context.Context, jti string) (bool, error) {
	if r.client == nil {
		return false, nil
	}
	n, err := r.client.Exists(ctx, r.key("blacklist", jti)).Result()
	return n > 0, err
}

// TASK-07: Multi-Device Active Sessions (max tokens)
func (r *RedisService) AddUserToken(ctx context.Context, userID, jti string, maxTokens int) error {
	if r.client == nil {
		return nil
	}
	key := r.key("user", userID, "tokens")
	tokens, err := r.client.SMembers(ctx, key).Result()
	if err != nil {
		return err
	}
	if len(tokens) >= maxTokens && len(tokens) > 0 {
		oldest := tokens[0]
		_ = r.client.SRem(ctx, key, oldest).Err()
		_ = r.client.Set(ctx, r.key("blacklist", oldest), "blacklisted", 24*time.Hour).Err()
	}
	return r.client.SAdd(ctx, key, jti).Err()
}

func (r *RedisService) RemoveUserToken(ctx context.Context, userID, jti string) error {
	if r.client == nil {
		return nil
	}
	key := r.key("user", userID, "tokens")
	_ = r.client.SRem(ctx, key, jti).Err()
	return r.client.Set(ctx, r.key("blacklist", jti), "blacklisted", 24*time.Hour).Err()
}

func (r *RedisService) RemoveAllUserTokens(ctx context.Context, userID string) error {
	if r.client == nil {
		return nil
	}
	key := r.key("user", userID, "tokens")
	tokens, err := r.client.SMembers(ctx, key).Result()
	if err != nil {
		return err
	}
	for _, jti := range tokens {
		_ = r.client.Set(ctx, r.key("blacklist", jti), "blacklisted", 24*time.Hour).Err()
	}
	return r.client.Del(ctx, key).Err()
}

// TASK-08: OTP & Password Reset Token
func (r *RedisService) SetOTP(ctx context.Context, email, otp string) error {
	if r.client == nil {
		return nil
	}
	return r.client.Set(ctx, r.key("otp", email), otp, 5*time.Minute).Err()
}

func (r *RedisService) GetOTP(ctx context.Context, email string) (string, error) {
	if r.client == nil {
		return "", nil
	}
	val, err := r.client.Get(ctx, r.key("otp", email)).Result()
	if err == redis.Nil {
		return "", nil
	}
	return val, err
}

func (r *RedisService) DeleteOTP(ctx context.Context, email string) error {
	if r.client == nil {
		return nil
	}
	return r.client.Del(ctx, r.key("otp", email)).Err()
}

func (r *RedisService) SetResetToken(ctx context.Context, token, email string, ttlSeconds int64) error {
	if r.client == nil {
		return nil
	}
	return r.client.Set(ctx, r.key("reset", token), email, time.Duration(ttlSeconds)*time.Second).Err()
}

func (r *RedisService) GetResetTokenEmail(ctx context.Context, token string) (string, error) {
	if r.client == nil {
		return "", nil
	}
	val, err := r.client.Get(ctx, r.key("reset", token)).Result()
	if err == redis.Nil {
		return "", nil
	}
	return val, err
}

func (r *RedisService) DeleteResetToken(ctx context.Context, token string) error {
	if r.client == nil {
		return nil
	}
	return r.client.Del(ctx, r.key("reset", token)).Err()
}

func (r *RedisService) Close() error {
	if r.client == nil {
		return nil
	}
	return r.client.Close()
}
