# Production Email Setup Guide

## Overview

The M4Hub email system is designed to work in both development and production environments. By default, it logs OTPs to the console for easy testing. In production, it can send real emails using professional email service providers.

---

## Current Setup (Development)

**Mode**: Console Logging  
**Configuration**: `email.provider=console` (default)

OTPs are logged to the backend console like this:
```
============================================================
📧 EMAIL OTP FOR: user@example.com
🔐 OTP CODE: 123456
⏰ Valid for: 5 minutes
============================================================
```

**Perfect for**: Local development and testing without email service setup.

---

## Production Email Providers

Choose one of these professional email services for production:

### 1. SendGrid (Recommended) ⭐

**Why SendGrid?**
- ✅ Free tier: 100 emails/day (perfect for small apps)
- ✅ Easy setup with API key
- ✅ Beautiful email templates
- ✅ Excellent deliverability
- ✅ Detailed analytics

**Setup Steps:**

1. **Sign up**: https://sendgrid.com/
2. **Get API Key**: Settings → API Keys → Create API Key
3. **Add Maven dependency** to `backend/pom.xml`:
```xml
<dependency>
    <groupId>com.sendgrid</groupId>
    <artifactId>sendgrid-java</artifactId>
    <version>4.10.2</version>
</dependency>
```

4. **Update `application.properties`**:
```properties
# Email Configuration
email.provider=sendgrid
sendgrid.api.key=YOUR_SENDGRID_API_KEY_HERE
email.from.address=noreply@yourdomain.com
email.from.name=M4Hub
```

5. **Uncomment SendGrid code** in `EmailService.java` (lines ~95-115)

6. **Rebuild backend**: `mvn clean package`

**Cost**: 
- Free: 100 emails/day
- Essentials: $19.95/month (40,000 emails)

---

### 2. Mailgun

**Why Mailgun?**
- ✅ Free tier: 5,000 emails/month for 3 months
- ✅ Simple REST API
- ✅ Good documentation
- ✅ Email validation included

**Setup Steps:**

1. **Sign up**: https://www.mailgun.com/
2. **Get API Key**: Settings → API Keys
3. **Add Maven dependency**:
```xml
<dependency>
    <groupId>com.mailgun</groupId>
    <artifactId>mailgun-java</artifactId>
    <version>1.0.0</version>
</dependency>
```

4. **Update `application.properties`**:
```properties
email.provider=mailgun
mailgun.api.key=YOUR_MAILGUN_API_KEY
mailgun.domain=yourdomain.com
email.from.address=noreply@yourdomain.com
```

**Cost**:
- Pay as you go: $0.80 per 1,000 emails

---

### 3. AWS SES (Scalable)

**Why AWS SES?**
- ✅ Extremely cheap: $0.10 per 1,000 emails
- ✅ Unlimited scale
- ✅ Integrated with AWS ecosystem
- ✅ High deliverability

**Setup Steps:**

1. **AWS Account**: https://aws.amazon.com/ses/
2. **Verify domain/email** in SES Console
3. **Get credentials**: IAM → Create User → Programmatic access
4. **Add Maven dependency**:
```xml
<dependency>
    <groupId>com.amazonaws</groupId>
    <artifactId>aws-java-sdk-ses</artifactId>
    <version>1.12.500</version>
</dependency>
```

5. **Update `application.properties`**:
```properties
email.provider=aws-ses
aws.region=us-east-1
aws.accessKeyId=YOUR_ACCESS_KEY
aws.secretKey=YOUR_SECRET_KEY
email.from.address=noreply@yourdomain.com
```

**Cost**:
- $0.10 per 1,000 emails
- Free: 62,000 emails/month if sent from EC2

---

## Email Template

The service includes a professional HTML email template with:

✅ **Responsive design** - Works on mobile and desktop  
✅ **Beautiful gradient header** - Matches M4Hub branding  
✅ **Highlighted OTP code** - Easy to read and copy  
✅ **5-minute expiration notice** - Clear user guidance  
✅ **Professional footer** - Builds trust

**Preview**:
```
┌──────────────────────────────────┐
│   M4Hub (gradient header)        │
│   Your All-in-One Platform       │
├──────────────────────────────────┤
│                                  │
│   Verify Your Email              │
│                                  │
│   ╔════════════════════╗         │
│   ║  YOUR VERIFICATION CODE  ║   │
│   ║      1 2 3 4 5 6      ║     │
│   ╚════════════════════╝         │
│                                  │
│   This code expires in 5 minutes │
│                                  │
├──────────────────────────────────┤
│   © 2025 M4Hub                   │
└──────────────────────────────────┘
```

---

## Configuration Reference

### Development (Current)
```properties
# backend/src/main/resources/application.properties
email.provider=console
```

### Production (SendGrid Example)
```properties
# backend/src/main/resources/application.properties
email.provider=sendgrid
sendgrid.api.key=SG.your_api_key_here
email.from.address=noreply@m4hub.com
email.from.name=M4Hub
```

### Environment Variables (Recommended for Production)
```bash
# Set in your deployment environment
export EMAIL_PROVIDER=sendgrid
export SENDGRID_API_KEY=SG.your_api_key_here
export EMAIL_FROM_ADDRESS=noreply@m4hub.com
export EMAIL_FROM_NAME=M4Hub
```

Then reference in `application.properties`:
```properties
email.provider=${EMAIL_PROVIDER:console}
sendgrid.api.key=${SENDGRID_API_KEY:}
email.from.address=${EMAIL_FROM_ADDRESS:noreply@m4hub.com}
email.from.name=${EMAIL_FROM_NAME:M4Hub}
```

---

## Testing Email Sending

### 1. Test in Development (Console)
```bash
# Default - OTP printed to console
mvn spring-boot:run
```

### 2. Test with SendGrid in Development
```bash
# Update application.properties with your SendGrid API key
mvn clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

### 3. Test API Endpoint
```bash
curl -X POST http://localhost:8080/api/auth/send-email-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

---

## Recommendation for M4Hub

**Phase 1: Development** ✅ (Current)
- Use console logging
- No email service needed
- Fast testing

**Phase 2: Production MVP** 🎯 (Next Step)
- **Use SendGrid Free Tier**
- 100 emails/day is enough for initial users
- Easy setup (just API key)
- Professional email delivery

**Phase 3: Scale** 🚀 (Future)
- Switch to AWS SES for cost efficiency
- $0.10 per 1,000 emails
- Unlimited scale as you grow

---

## Quick Start: Enable SendGrid

**Total time: 5 minutes**

1. **Get SendGrid API Key**: https://sendgrid.com/ → Settings → API Keys → Create
2. **Copy your key**: `SG.xxxxxxxxxxxxxxxxxx`
3. **Update `application.properties`**:
   ```properties
   email.provider=sendgrid
   sendgrid.api.key=SG.your_key_here
   email.from.address=noreply@yourdomain.com
   ```
4. **Add dependency** to `pom.xml`:
   ```xml
   <dependency>
       <groupId>com.sendgrid</groupId>
       <artifactId>sendgrid-java</artifactId>
       <version>4.10.2</version>
   </dependency>
   ```
5. **Uncomment code** in `EmailService.java` method `sendOtpViaSendGrid()`
6. **Rebuild**: `mvn clean package`
7. **Restart backend**
8. **Test**: Send OTP to your real email!

---

## Security Best Practices

✅ **Never commit API keys** to Git  
✅ **Use environment variables** for production  
✅ **Rotate keys regularly** (every 90 days)  
✅ **Enable API key restrictions** (IP whitelist)  
✅ **Monitor email usage** to detect abuse  
✅ **Implement rate limiting** (max 3 OTP requests per hour per email)  
✅ **Use HTTPS only** for production  

---

## Troubleshooting

### OTP not received?

1. **Check spam folder**
2. **Verify email provider is set**: Check logs for "Using email provider: sendgrid"
3. **Check API key**: Ensure it's valid and not expired
4. **Check SendGrid dashboard**: Look for bounce/spam reports
5. **Verify sender email**: Must be verified in SendGrid
6. **Check rate limits**: SendGrid free tier = 100/day

### Email goes to spam?

1. **Verify your domain** in SendGrid
2. **Set up SPF/DKIM records**
3. **Use a professional "from" address** (noreply@yourdomain.com)
4. **Avoid spam trigger words** in subject/body

---

## Support

- **SendGrid Docs**: https://docs.sendgrid.com/
- **Mailgun Docs**: https://documentation.mailgun.com/
- **AWS SES Docs**: https://docs.aws.amazon.com/ses/

---

**Ready for production?** Just follow the SendGrid Quick Start above! 🚀
