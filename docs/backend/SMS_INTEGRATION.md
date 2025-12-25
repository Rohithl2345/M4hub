# M4Hub Backend - SMS Integration Guide

## Development Mode (Current Setup)
By default, SMS is **disabled** and OTPs are logged to console:
```
SMS DISABLED - OTP for +919876543210: 123456
```

## Production Setup with Twilio

### 1. Sign Up for Twilio
1. Go to https://www.twilio.com/try-twilio
2. Sign up for free account (gets $15 credit)
3. Verify your phone number

### 2. Get Your Credentials
From Twilio Console (https://console.twilio.com):
- **Account SID**: AC********************************
- **Auth Token**: ********************************
- **Phone Number**: Get a Twilio number that supports SMS

### 3. Configure Environment Variables

**Option A: Using Environment Variables (Recommended for Production)**
```bash
export SMS_ENABLED=true
export TWILIO_ACCOUNT_SID=AC********************************
export TWILIO_AUTH_TOKEN=********************************
export TWILIO_PHONE_NUMBER=+1234567890
```

**Option B: Update application.yml (For Local Testing)**
```yaml
sms:
  enabled: true

twilio:
  account:
    sid: AC********************************
  auth:
    token: ********************************
  phone:
    number: +1234567890
```

### 4. Pricing (Twilio)
- India SMS: ₹0.60 - ₹1.50 per message
- USA SMS: $0.0075 per message
- Free trial credit: $15 (enough for ~200 SMS in India)

---

## Alternative: MSG91 (India-Focused)

If you prefer an Indian SMS provider:

### 1. Sign Up for MSG91
- Go to https://msg91.com/
- Much cheaper: ₹0.15-0.30 per SMS
- Better delivery rates in India

### 2. Implementation
Create `Msg91Service.java`:
```java
@Service
public class Msg91Service {
    @Value("${msg91.auth.key}")
    private String authKey;
    
    @Value("${msg91.sender.id}")
    private String senderId;
    
    public void sendOtp(String phoneNumber, String otpCode) {
        String url = "https://api.msg91.com/api/v5/otp";
        // MSG91 REST API implementation
    }
}
```

---

## Alternative: AWS SNS

If you're using AWS:

### 1. Add AWS SDK Dependency
```xml
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>sns</artifactId>
    <version>2.20.0</version>
</dependency>
```

### 2. Configure AWS Credentials
- Create IAM user with SNS permissions
- Configure AWS credentials in `~/.aws/credentials`

### 3. Pricing
- India: ₹0.50 per SMS
- Reliable delivery

---

## Testing

### Development Testing (SMS Disabled)
```bash
# Start backend
cd backend
mvn spring-boot:run

# Send OTP request
curl -X POST http://localhost:8080/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+919876543210"}'

# Check console for OTP
# SMS DISABLED - OTP for +919876543210: 123456
```

### Production Testing (SMS Enabled)
```bash
# Set environment variables
export SMS_ENABLED=true
export TWILIO_ACCOUNT_SID=your_sid
export TWILIO_AUTH_TOKEN=your_token
export TWILIO_PHONE_NUMBER=+1234567890

# Start backend
mvn spring-boot:run

# Send OTP - will receive actual SMS
curl -X POST http://localhost:8080/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+919876543210"}'
```

---

## Recommendation

**For Your Use Case (India-focused mobile app):**
1. **Development**: Use current setup (SMS disabled, console logging)
2. **Production**: 
   - **Option 1**: MSG91 (cheapest, India-optimized) - **Recommended**
   - **Option 2**: Twilio (most reliable, global)
   - **Option 3**: AWS SNS (if already using AWS)

**Next Steps:**
1. For now, keep `SMS_ENABLED=false` for development
2. When ready for production, sign up for MSG91 or Twilio
3. Update environment variables
4. Set `SMS_ENABLED=true`

The current code is production-ready - just flip the switch when you have credentials!
