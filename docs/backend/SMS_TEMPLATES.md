# SMS Message Templates for M4Hub

This document defines all SMS message templates used in the application for OTP authentication.

---

## 📋 Template Guidelines

### Message Requirements:
- **Max Length:** 160 characters (single SMS)
- **Language:** English (support for regional languages can be added)
- **Tone:** Professional yet friendly
- **Brand:** Include "M4Hub" branding
- **Action:** Clear call-to-action

### Cost Optimization:
- Keep messages under 160 characters
- Avoid special characters that increase SMS segments
- Use simple, clear language

---

## 🔐 OTP Templates

### Template 1: Default OTP (Current)
```
Your M4Hub verification code is: {OTP_CODE}

Valid for 5 minutes.
```

**Character Count:** 55 + 6 (OTP) = 61 characters  
**Variables:** `{OTP_CODE}`  
**Expiry:** 5 minutes

---

### Template 2: With Security Warning
```
Your M4Hub OTP: {OTP_CODE}

Do not share this code. Valid for 5 minutes.
```

**Character Count:** 66 characters  
**Variables:** `{OTP_CODE}`  
**Expiry:** 5 minutes  
**Security:** Includes warning

---

### Template 3: With App Name
```
M4Hub: Your verification code is {OTP_CODE}

Expires in 5 min. Never share this code.
```

**Character Count:** 83 characters  
**Variables:** `{OTP_CODE}`  
**Expiry:** 5 minutes

---

### Template 4: Minimal (Cost-Effective)
```
M4Hub code: {OTP_CODE}
Valid 5 min.
```

**Character Count:** 32 characters  
**Variables:** `{OTP_CODE}`  
**Expiry:** 5 minutes  
**Cost:** Lowest (shortest message)

---

### Template 5: With Support Contact
```
Your M4Hub OTP: {OTP_CODE}

Valid for 5 minutes.
Need help? Visit m4hub.com/support
```

**Character Count:** 84 characters  
**Variables:** `{OTP_CODE}`  
**Support:** Includes help link

---

## 🌍 Regional Language Templates (Future)

### Hindi Template
```
आपका M4Hub OTP: {OTP_CODE}

5 मिनट के लिए मान्य। कोड साझा न करें।
```

### Spanish Template
```
Tu código M4Hub: {OTP_CODE}

Válido por 5 minutos. No compartas este código.
```

### French Template
```
Votre code M4Hub: {OTP_CODE}

Valable 5 minutes. Ne partagez pas ce code.
```

---

## 🔧 Implementation in Backend

### Current Implementation Location:
```
backend/src/main/java/com/m4hub/backend/service/SmsService.java
```

### Update SMS Template Method:

```java
private String buildOtpMessage(String otpCode) {
    return String.format(
        "Your M4Hub verification code is: %s\n\nValid for 5 minutes.",
        otpCode
    );
}
```

### Recommended Template (Best Balance):
```java
private String buildOtpMessage(String otpCode) {
    return String.format(
        "M4Hub: Your verification code is %s\n\nExpires in 5 min. Never share this code.",
        otpCode
    );
}
```

---

## 📊 Template Comparison

| Template | Length | Security | Branding | Cost | Recommended For |
|----------|--------|----------|----------|------|-----------------|
| Template 1 | 61 chars | Medium | Yes | Low | General use |
| Template 2 | 66 chars | High | Yes | Low | Security-focused |
| Template 3 | 83 chars | High | Strong | Medium | Production |
| Template 4 | 32 chars | Low | Minimal | Lowest | Cost-sensitive |
| Template 5 | 84 chars | Medium | Strong | Medium | Support-heavy |

---

## 🎨 Customization Options

### Add User Name (Personalization):
```
Hi {USER_NAME}! Your M4Hub code: {OTP_CODE}

Valid 5 min.
```

### Add Transaction ID (Tracking):
```
M4Hub OTP: {OTP_CODE}
ID: {TRANSACTION_ID}
Valid 5 min.
```

### Add Device Info (Security):
```
M4Hub login code: {OTP_CODE}

Device: {DEVICE_TYPE}
Valid 5 min.
```

---

## 🔐 Security Best Practices

### ✅ DO Include:
- OTP code clearly displayed
- Expiry time (5 minutes)
- Brand name (M4Hub)
- Security warning (optional but recommended)

### ❌ DON'T Include:
- URLs with query parameters (phishing risk)
- Personal information
- Multiple codes in one message
- Confusing formatting

---

## 📱 Testing Templates

### Test SMS Template:
```bash
# Update SmsService.java with new template
# Restart backend
./mvnw spring-boot:run

# Test API
curl -X POST http://localhost:8080/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+919876543210"}'

# Check your phone for SMS
```

### Console Mode Testing (Dev):
When `sms.provider=console`, messages print to console:
```
==============================================
SMS TO: +919876543210
MESSAGE: Your M4Hub verification code is: 123456

Valid for 5 minutes.
==============================================
```

---

## 🌟 Recommended Production Template

```
M4Hub: Your verification code is {OTP_CODE}

Expires in 5 min. Never share this code.
```

**Why this template?**
- ✅ Clear branding (M4Hub)
- ✅ Security warning included
- ✅ Expiry time stated
- ✅ Professional tone
- ✅ Under 160 characters (single SMS)
- ✅ Cost-effective

---

## 🔄 Future Enhancements

### Dynamic Templates Based on Context:

#### Login OTP:
```
M4Hub Login: {OTP_CODE}
Expires 5 min.
```

#### Registration OTP:
```
Welcome to M4Hub!
Your verification code: {OTP_CODE}
Valid 5 min.
```

#### Password Reset OTP:
```
M4Hub Password Reset: {OTP_CODE}
Didn't request? Contact support.
Valid 5 min.
```

#### Transaction OTP:
```
M4Hub Transaction: {OTP_CODE}
Amount: {AMOUNT}
Valid 5 min.
```

---

## 📝 Implementation Steps

1. **Choose Template:**
   - Select template based on use case
   - Consider character count vs. clarity

2. **Update Code:**
   ```java
   // In SmsService.java
   private String buildOtpMessage(String otpCode) {
       return "Your chosen template with " + otpCode;
   }
   ```

3. **Test Locally:**
   - Use `console` mode first
   - Verify formatting looks correct

4. **Test with Firebase:**
   - Use test phone numbers
   - Check SMS delivery
   - Verify character count

5. **Monitor Costs:**
   - Check Firebase Console usage
   - Adjust template if costs too high

---

## 📊 Cost Impact

### Single Segment SMS (< 160 chars):
- **Cost:** $0.008-0.01 per SMS (India)
- **All templates above:** Single segment ✅

### Multi-Segment SMS (> 160 chars):
- **Cost:** 2-3x more expensive
- **Avoid:** Keep templates under 160 chars

### Monthly Cost Estimates (1000 users):
- **Login OTPs (2/user):** 2000 SMS = $16-20
- **Registration (1/user):** 1000 SMS = $8-10
- **Total:** ~$25-30/month for 1000 active users

---

## 🎯 Quick Template Selector

**Choose Template Based On:**

- **Budget-Conscious:** Template 4 (32 chars)
- **Security-Focused:** Template 2 or 3
- **General Production:** Template 3 (Recommended)
- **Need Support Link:** Template 5
- **Simplest:** Template 1

---

**📌 Current Implementation:**
Template 1 is currently implemented. Update `SmsService.java` to change template.

**🔄 Next Steps:**
1. Review templates
2. Choose best for your use case
3. Update `SmsService.java`
4. Test in console mode
5. Test with Firebase
6. Deploy to production
