package com.m4hub.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender javaMailSender;

    @Value("${email.provider:console}")
    private String emailProvider;

    @Value("${spring.mail.username:noreply@m4hub.com}")
    private String fromAddress;

    @Value("${email.from.name:M4Hub}")
    private String fromName;

    /**
     * Send OTP to email address
     */
    public void sendOtp(String email, String otpCode) {
        try {
            if ("console".equals(emailProvider)) {
                sendOtpConsole(email, otpCode);
            } else if ("gmail".equals(emailProvider)) {
                sendOtpViaGmail(email, otpCode);
            } else {
                // Default fallback
                logger.warn("Unknown email provider: {}, falling back to console", emailProvider);
                sendOtpConsole(email, otpCode);
            }

            logger.info("✅ OTP email sent successfully to: {}", email);

        } catch (Exception e) {
            logger.error("❌ Failed to send OTP email to: {}", email, e);
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    private void sendOtpConsole(String email, String otpCode) {
        logger.info("=".repeat(60));
        logger.info("📧 EMAIL OTP FOR: {}", email);
        logger.info("🔐 OTP CODE: {}", otpCode);
        logger.info("⏰ Valid for: 5 minutes");
        logger.info("=".repeat(60));
    }

    private void sendOtpViaGmail(String email, String otpCode) {
        if (javaMailSender == null) {
            logger.error("JavaMailSender is null. Check mail configuration.");
            throw new RuntimeException("Email configuration error");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(email);
        message.setSubject("M4Hub Verification Code");
        message.setText("Hello,\n\nYour M4Hub verification code is: " + otpCode
                + "\n\nThis code is valid for 5 minutes.\n\nBest regards,\nM4Hub Team");

        javaMailSender.send(message);
    }

    /**
     * Send welcome email after successful registration
     */
    public void sendWelcomeEmail(String email, String userName) {
        try {
            logger.info("📧 Sending welcome email to: {} ({})", email, userName);
            // Implement similar to sendOtp with welcome template
        } catch (Exception e) {
            logger.error("Failed to send welcome email to: {}", email, e);
            // Don't throw exception for welcome email failure
        }
    }
}
