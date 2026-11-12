package services

import (
	"context"
	"fmt"
	"log"

	"github.com/fs-management/backend-go/internal/config"
	"github.com/wneessen/go-mail"
)

type EmailService struct {
	client     *mail.Client
	fromEmail  string
	configured bool
}

func NewEmailService(cfg *config.AppConfig) *EmailService {
	svc := &EmailService{fromEmail: cfg.SMTPFromEmail}
	if cfg.SMTPHost == "" || cfg.SMTPUsername == "" {
		return svc
	}

	client, err := mail.NewClient(
		cfg.SMTPHost,
		mail.WithPort(cfg.SMTPPort),
		mail.WithSMTPAuth(mail.SMTPAuthPlain),
		mail.WithUsername(cfg.SMTPUsername),
		mail.WithPassword(cfg.SMTPPassword),
	)
	if err != nil {
		log.Printf("⚠️ Failed to create SMTP client: %v", err)
		return svc
	}

	svc.client = client
	svc.configured = true
	return svc
}

func (e *EmailService) send(toEmail, subject, body string) error {
	if !e.configured || e.client == nil {
		log.Printf("[DEV-MODE] Email not configured. To: %s | Subject: %s | Body: %s", toEmail, subject, body)
		return nil
	}

	msg := mail.NewMsg()
	if err := msg.From(e.fromEmail); err != nil {
		return err
	}
	if err := msg.To(toEmail); err != nil {
		return err
	}
	msg.Subject(subject)
	msg.SetBodyString(mail.TypeTextPlain, body)

	return e.client.DialAndSendWithContext(context.Background(), msg)
}

func (e *EmailService) SendOTP(toEmail, otp string) error {
	log.Printf("Sending OTP %s to email %s", otp, toEmail)
	body := fmt.Sprintf("Kode verifikasi/OTP Anda adalah: %s\nKode berlaku selama 5 menit.", otp)
	return e.send(toEmail, "Kode Verifikasi Anda", body)
}

func (e *EmailService) SendPasswordReset(toEmail, resetToken string) error {
	log.Printf("Sending password reset link to %s", toEmail)
	body := fmt.Sprintf("Klik tautan berikut untuk mereset kata sandi Anda:\nToken: %s", resetToken)
	return e.send(toEmail, "Permintaan Reset Password", body)
}
