use redis::aio::ConnectionManager;
use redis::AsyncCommands;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Clone)]
pub struct RedisService {
    manager: Option<Arc<RwLock<ConnectionManager>>>,
}

impl RedisService {
    pub async fn new(redis_url: &str) -> Self {
        match redis::Client::open(redis_url) {
            Ok(client) => match ConnectionManager::new(client).await {
                Ok(manager) => Self {
                    manager: Some(Arc::new(RwLock::new(manager))),
                },
                Err(_) => Self { manager: None },
            },
            Err(_) => Self { manager: None },
        }
    }

    // TASK-05: Account Lockout Tracker
    pub async fn increment_failed_login_attempts(&self, email: &str) -> Result<i64, redis::RedisError> {
        if let Some(ref m) = self.manager {
            let mut conn = m.write().await;
            let key = format!("login:failed:{}", email);
            let count: i64 = conn.incr(&key, 1).await?;
            let _: () = conn.expire(&key, 3600).await?;
            Ok(count)
        } else {
            Ok(0)
        }
    }

    pub async fn get_failed_login_attempts(&self, email: &str) -> Result<i64, redis::RedisError> {
        if let Some(ref m) = self.manager {
            let mut conn = m.write().await;
            let key = format!("login:failed:{}", email);
            let count: Option<i64> = conn.get(&key).await?;
            Ok(count.unwrap_or(0))
        } else {
            Ok(0)
        }
    }

    pub async fn reset_failed_login_attempts(&self, email: &str) -> Result<(), redis::RedisError> {
        if let Some(ref m) = self.manager {
            let mut conn = m.write().await;
            let key = format!("login:failed:{}", email);
            let _: () = conn.del(&key).await?;
        }
        Ok(())
    }

    // TASK-06: Token Blacklist
    pub async fn add_token_to_blacklist(&self, jti: &str, ttl_seconds: u64) -> Result<(), redis::RedisError> {
        if let Some(ref m) = self.manager {
            let mut conn = m.write().await;
            let key = format!("blacklist:{}", jti);
            let _: () = conn.set_ex(&key, "blacklisted", ttl_seconds).await?;
        }
        Ok(())
    }

    pub async fn is_token_blacklisted(&self, jti: &str) -> Result<bool, redis::RedisError> {
        if let Some(ref m) = self.manager {
            let mut conn = m.write().await;
            let key = format!("blacklist:{}", jti);
            let exists: bool = conn.exists(&key).await?;
            Ok(exists)
        } else {
            Ok(false)
        }
    }

    // TASK-07: Multi-Device Active Sessions (Maks 3 device)
    pub async fn add_user_token(&self, user_id: &str, jti: &str, max_tokens: usize) -> Result<(), redis::RedisError> {
        if let Some(ref m) = self.manager {
            let mut conn = m.write().await;
            let key = format!("user:{}:tokens", user_id);
            let tokens: Vec<String> = conn.smembers(&key).await?;

            if tokens.len() >= max_tokens {
                if let Some(oldest) = tokens.first() {
                    let _: () = conn.srem(&key, oldest).await?;
                    let blacklist_key = format!("blacklist:{}", oldest);
                    let _: () = conn.set_ex(&blacklist_key, "blacklisted", 86400).await?;
                }
            }

            let _: () = conn.sadd(&key, jti).await?;
        }
        Ok(())
    }

    pub async fn remove_user_token(&self, user_id: &str, jti: &str) -> Result<(), redis::RedisError> {
        if let Some(ref m) = self.manager {
            let mut conn = m.write().await;
            let key = format!("user:{}:tokens", user_id);
            let _: () = conn.srem(&key, jti).await?;
            let blacklist_key = format!("blacklist:{}", jti);
            let _: () = conn.set_ex(&blacklist_key, "blacklisted", 86400).await?;
        }
        Ok(())
    }

    pub async fn remove_all_user_tokens(&self, user_id: &str) -> Result<(), redis::RedisError> {
        if let Some(ref m) = self.manager {
            let mut conn = m.write().await;
            let key = format!("user:{}:tokens", user_id);
            let tokens: Vec<String> = conn.smembers(&key).await?;
            for jti in tokens {
                let blacklist_key = format!("blacklist:{}", jti);
                let _: () = conn.set_ex(&blacklist_key, "blacklisted", 86400).await?;
            }
            let _: () = conn.del(&key).await?;
        }
        Ok(())
    }

    // TASK-08: OTP & Password Reset Token
    pub async fn set_otp(&self, email: &str, otp: &str) -> Result<(), redis::RedisError> {
        if let Some(ref m) = self.manager {
            let mut conn = m.write().await;
            let key = format!("otp:{}", email);
            let _: () = conn.set_ex(&key, otp, 300).await?;
        }
        Ok(())
    }

    pub async fn get_otp(&self, email: &str) -> Result<Option<String>, redis::RedisError> {
        if let Some(ref m) = self.manager {
            let mut conn = m.write().await;
            let key = format!("otp:{}", email);
            conn.get(&key).await
        } else {
            Ok(None)
        }
    }

    pub async fn delete_otp(&self, email: &str) -> Result<(), redis::RedisError> {
        if let Some(ref m) = self.manager {
            let mut conn = m.write().await;
            let key = format!("otp:{}", email);
            let _: () = conn.del(&key).await?;
        }
        Ok(())
    }

    pub async fn set_reset_token(&self, token: &str, email: &str, ttl_seconds: u64) -> Result<(), redis::RedisError> {
        if let Some(ref m) = self.manager {
            let mut conn = m.write().await;
            let key = format!("reset:{}", token);
            let _: () = conn.set_ex(&key, email, ttl_seconds).await?;
        }
        Ok(())
    }

    pub async fn get_reset_token_email(&self, token: &str) -> Result<Option<String>, redis::RedisError> {
        if let Some(ref m) = self.manager {
            let mut conn = m.write().await;
            let key = format!("reset:{}", token);
            conn.get(&key).await
        } else {
            Ok(None)
        }
    }

    pub async fn delete_reset_token(&self, token: &str) -> Result<(), redis::RedisError> {
        if let Some(ref m) = self.manager {
            let mut conn = m.write().await;
            let key = format!("reset:{}", token);
            let _: () = conn.del(&key).await?;
        }
        Ok(())
    }
}
