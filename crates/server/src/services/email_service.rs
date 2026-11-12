use lettre::transport::smtp::authentication::Credentials;
use lettre::{AsyncSmtpTransport, AsyncTransport, Message, Tokio1Executor};
use tracing::{error, info};

use crate::config::AppConfig;

#[derive(Clone)]
pub struct EmailService {
    mailer: Option<AsyncSmtpTransport<Tokio1Executor>>,
    from_email: String,
}

impl EmailService {
    pub fn new(config: &AppConfig) -> Self {
        if config.smtp_host.is_empty() || config.smtp_username.is_empty() {
            return Self {
                mailer: None,
                from_email: config.smtp_from_email.clone(),
            };
        }

        let creds = Credentials::new(config.smtp_username.clone(), config.smtp_password.clone());
        let transport = AsyncSmtpTransport::<Tokio1Executor>::relay(&config.smtp_host)
            .expect("Failed to create SMTP transport")
            .port(config.smtp_port)
            .credentials(creds)
            .build();

        Self {
            mailer: Some(transport),
            from_email: config.smtp_from_email.clone(),
        }
    }

    pub async fn send_otp(&self, to_email: &str, otp: &str) -> Result<(), String> {
        info!("Sending OTP {} to email {}", otp, to_email);
        if let Some(ref mailer) = self.mailer {
            let email = Message::builder()
                .from(self.from_email.parse().map_err(|e| format!("{}", e))?)
                .to(to_email.parse().map_err(|e| format!("{}", e))?)
                .subject("Kode Verifikasi Anda")
                .body(format!("Kode verifikasi/OTP Anda adalah: {}\nKode berlaku selama 5 menit.", otp))
                .map_err(|e| format!("{}", e))?;

            mailer.send(email).await.map_err(|e| format!("{}", e))?;
        } else {
            info!("[DEV-MODE] Email not configured. OTP for {}: {}", to_email, otp);
        }
        Ok(())
    }

    pub async fn send_password_reset(&self, to_email: &str, reset_token: &str) -> Result<(), String> {
        info!("Sending password reset link to {}", to_email);
        if let Some(ref mailer) = self.mailer {
            let email = Message::builder()
                .from(self.from_email.parse().map_err(|e| format!("{}", e))?)
                .to(to_email.parse().map_err(|e| format!("{}", e))?)
                .subject("Permintaan Reset Password")
                .body(format!("Klik tautan berikut untuk mereset kata sandi Anda:\nToken: {}", reset_token))
                .map_err(|e| format!("{}", e))?;

            mailer.send(email).await.map_err(|e| format!("{}", e))?;
        } else {
            info!("[DEV-MODE] Email not configured. Reset token for {}: {}", to_email, reset_token);
        }
        Ok(())
    }
}
