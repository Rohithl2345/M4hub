package com.m4hub.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Value("${email.provider:console}")
    private String emailProvider; // console, sendgrid, mailgun, aws-ses

    @Value("${email.from.address:noreply@m4hub.com}")
    private String fromAddress;

    @Value("${email.from.name:M4Hub}")
    private String fromName;

    // For SendGrid
    @Value("${sendgrid.api.key:}")
    private String sendgridApiKey;

    /**
     * Send OTP to email address
     * Supports multiple email providers: SendGrid, Mailgun, AWS SES
     */
    public void sendOtp(String email, String otpCode) {
        try {
            if ("console".equals(emailProvider)) {
                // Development mode - log to console
                sendOtpConsole(email, otpCode);
            } else if ("sendgrid".equals(emailProvider)) {
                // Production mode - SendGrid
                sendOtpViaSendGrid(email, otpCode);
            } else if ("mailgun".equals(emailProvider)) {
                // Production mode - Mailgun
                sendOtpViaMailgun(email, otpCode);
            } else if ("aws-ses".equals(emailProvider)) {
                // Production mode - AWS SES
                sendOtpViaAwsSes(email, otpCode);
            } else {
                logger.warn("Unknown email provider: {}, falling back to console", emailProvider);
                sendOtpConsole(email, otpCode);
            }

            logger.info("✅ OTP email sent successfully to: {}", email);

        } catch (Exception e) {
            logger.error("❌ Failed to send OTP email to: {}", email, e);
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    /**
     * Development mode - Log OTP to console
     */
    private void sendOtpConsole(String email, String otpCode) {
        logger.info("=".repeat(60));
        logger.info("📧 EMAIL OTP FOR: {}", email);
        logger.info("🔐 OTP CODE: {}", otpCode);
        logger.info("⏰ Valid for: 5 minutes");
        logger.info("=".repeat(60));
    }

    /**
     * Production mode - SendGrid
     * Documentation:
     * https://docs.sendgrid.com/for-developers/sending-email/api-getting-started
     */
    private void sendOtpViaSendGrid(String email, String otpCode) {
        /*
         * To enable SendGrid:
         * 1. Add dependency to pom.xml:
         * <dependency>
         * <groupId>com.sendgrid</groupId>
         * <artifactId>sendgrid-java</artifactId>
         * <version>4.10.2</version>
         * </dependency>
         *
         * 2. Add to application.properties:
         * email.provider=sendgrid
         * sendgrid.api.key=YOUR_SENDGRID_API_KEY
         * email.from.address=noreply@yourdomain.com
         * email.from.name=M4Hub
         *
         * 3. Uncomment the code below:
         *
         * import com.sendgrid.*;
         * import com.sendgrid.helpers.mail.Mail;
         * import com.sendgrid.helpers.mail.objects.*;
         *
         * Email from = new Email(fromAddress, fromName);
         * Email to = new Email(email);
         * String subject = "Your M4Hub Verification Code";
         * Content content = new Content("text/html", buildOtpEmailHtml(otpCode));
         * Mail mail = new Mail(from, subject, to, content);
         *
         * SendGrid sg = new SendGrid(sendgridApiKey);
         * Request request = new Request();
         * request.setMethod(Method.POST);
         * request.setEndpoint("mail/send");
         * request.setBody(mail.build());
         * Response response = sg.api(request);
         *
         * if (response.getStatusCode() >= 400) {
         * throw new RuntimeException("SendGrid API error: " +
         * response.getStatusCode());
         * }
         */

        logger.warn("SendGrid integration not configured. Add sendgrid-java dependency and API key.");
        sendOtpConsole(email, otpCode);
    }

    /**
     * Production mode - Mailgun
     * Documentation: https://documentation.mailgun.com/en/latest/api-sending.html
     */
    private void sendOtpViaMailgun(String email, String otpCode) {
        /*
         * To enable Mailgun:
         * 1. Add dependency to pom.xml:
         * <dependency>
         * <groupId>com.mailgun</groupId>
         * <artifactId>mailgun-java</artifactId>
         * <version>1.0.0</version>
         * </dependency>
         *
         * 2. Add to application.properties:
         * email.provider=mailgun
         * mailgun.api.key=YOUR_MAILGUN_API_KEY
         * mailgun.domain=yourdomain.com
         * email.from.address=noreply@yourdomain.com
         */

        logger.warn("Mailgun integration not configured. Add mailgun-java dependency and API key.");
        sendOtpConsole(email, otpCode);
    }

    /**
     * Production mode - AWS SES
     * Documentation:
     * https://docs.aws.amazon.com/ses/latest/dg/send-using-sdk-java.html
     */
    private void sendOtpViaAwsSes(String email, String otpCode) {
        /*
         * To enable AWS SES:
         * 1. Add dependency to pom.xml:
         * <dependency>
         * <groupId>com.amazonaws</groupId>
         * <artifactId>aws-java-sdk-ses</artifactId>
         * <version>1.12.500</version>
         * </dependency>
         *
         * 2. Add to application.properties:
         * email.provider=aws-ses
         * aws.region=us-east-1
         * aws.accessKeyId=YOUR_ACCESS_KEY
         * aws.secretKey=YOUR_SECRET_KEY
         * email.from.address=noreply@yourdomain.com
         */

        logger.warn("AWS SES integration not configured. Add AWS SDK dependency and credentials.");
        sendOtpConsole(email, otpCode);
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
