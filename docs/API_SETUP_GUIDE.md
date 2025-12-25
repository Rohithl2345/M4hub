# Quick API Setup Guide

**Time Required**: 15 minutes  
**Cost**: $0 (All free tiers)

---

## 1. NewsAPI.org (5 minutes) ⭐

### Sign Up
1. Go to: https://newsapi.org/register
2. Fill in:
   - Name: Your Name
   - Email: your-email@example.com
   - Password: (create strong password)
3. Click "Submit"
4. Check email for verification link
5. Click verification link

### Get API Key
1. Login to: https://newsapi.org/account
2. Copy your API key (format: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
3. Save it securely

### Add to Backend
**File**: `backend/src/main/resources/application.yml`

```yaml
news:
  api:
    key: YOUR_API_KEY_HERE
    url: https://newsapi.org/v2
```

### Test API
```bash
# Test in browser or curl
curl "https://newsapi.org/v2/top-headlines?country=us&apiKey=YOUR_API_KEY"
```

**Free Tier**: 100 requests/day (enough for testing)

---

## 2. SendGrid (Email OTP) (5 minutes)

### Sign Up
1. Go to: https://signup.sendgrid.com/
2. Fill in:
   - Email: your-email@example.com
   - Password: (create strong password)
3. Complete the questionnaire:
   - Company: M4Hub (or your name)
   - Website: localhost (for testing)
   - Role: Developer
   - Purpose: Transactional emails
4. Verify email

### Get API Key
1. Login to SendGrid
2. Go to: Settings > API Keys
3. Click "Create API Key"
4. Name: "M4Hub OTP Service"
5. Permissions: "Full Access" (or Restricted Access > Mail Send)
6. Click "Create & View"
7. **IMPORTANT**: Copy the API key NOW (you won't see it again!)
   - Format: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Add to Backend
**File**: `backend/src/main/resources/application.yml`

```yaml
sendgrid:
  api:
    key: YOUR_SENDGRID_API_KEY
  from:
    email: noreply@m4hub.com  # Or use your verified sender
    name: M4Hub
```

### Verify Sender (Important!)
1. Go to: Settings > Sender Authentication
2. Click "Verify a Single Sender"
3. Fill in:
   - From Name: M4Hub
   - From Email: your-email@example.com (use real email you own)
   - Reply To: same as above
   - Company: M4Hub
   - Address: Your address (can be anything for testing)
4. Check your email for verification link
5. Click verification link

### Test Email
```bash
curl --request POST \
  --url https://api.sendgrid.com/v3/mail/send \
  --header 'Authorization: Bearer YOUR_SENDGRID_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "personalizations": [{"to": [{"email": "test@example.com"}]}],
    "from": {"email": "your-verified-email@example.com"},
    "subject": "Test Email",
    "content": [{"type": "text/plain", "value": "This is a test!"}]
  }'
```

**Free Tier**: 100 emails/day (perfect for testing)

---

## 3. Razorpay (Future - Payment Gateway) (5 minutes)

**Note**: Only for payment feature (Phase 5). Can skip for now.

### Sign Up (When Ready)
1. Go to: https://razorpay.com/
2. Click "Sign Up"
3. Fill in business details
4. Verify email and phone

### Get Test API Keys
1. Login to Dashboard
2. Go to: Settings > API Keys
3. Switch to "Test Mode"
4. Generate Test Keys:
   - Key ID: `rzp_test_xxxxxxxxxxxxx`
   - Key Secret: `xxxxxxxxxxxxxxxxxxxxxxxx`

### Add to Backend
**File**: `backend/src/main/resources/application.yml`

```yaml
razorpay:
  key:
    id: rzp_test_xxxxxxxxxxxxx
    secret: xxxxxxxxxxxxxxxxxxxxxxxx
  mode: test  # Change to 'live' in production
```

**Free Tier**: Unlimited test transactions (no live payments)

---

## 4. Alternative: GNews API (Backup for NewsAPI)

If NewsAPI limit is too low, use GNews:

### Sign Up
1. Go to: https://gnews.io/register
2. Create account
3. Get API key

### Update Backend
```yaml
gnews:
  api:
    key: YOUR_GNEWS_KEY
    url: https://gnews.io/api/v4
```

**Free Tier**: 100 requests/day

---

## Environment Variables Setup

### Option 1: application.yml (Development)
**File**: `backend/src/main/resources/application.yml`

```yaml
# News API
news:
  api:
    key: ${NEWS_API_KEY:your_default_key_here}
    url: https://newsapi.org/v2

# SendGrid Email
sendgrid:
  api:
    key: ${SENDGRID_API_KEY:your_default_key_here}
  from:
    email: ${SENDGRID_FROM_EMAIL:noreply@m4hub.com}
    name: M4Hub

# Razorpay (Future)
razorpay:
  key:
    id: ${RAZORPAY_KEY_ID:}
    secret: ${RAZORPAY_KEY_SECRET:}
  mode: test
```

### Option 2: Environment Variables (Production)
**Windows PowerShell**:
```powershell
$env:NEWS_API_KEY="your_news_api_key"
$env:SENDGRID_API_KEY="your_sendgrid_key"
$env:SENDGRID_FROM_EMAIL="your-verified-email@example.com"
```

**Linux/Mac**:
```bash
export NEWS_API_KEY="your_news_api_key"
export SENDGRID_API_KEY="your_sendgrid_key"
export SENDGRID_FROM_EMAIL="your-verified-email@example.com"
```

### Option 3: .env file (Development)
**File**: `backend/.env` (create new, add to .gitignore!)

```env
NEWS_API_KEY=your_news_api_key_here
SENDGRID_API_KEY=SG.your_sendgrid_key_here
SENDGRID_FROM_EMAIL=your-verified-email@example.com
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
```

**Important**: Add `.env` to `.gitignore`!

---

## Security Best Practices ⚠️

### ✅ DO:
- Use environment variables for API keys
- Keep test keys separate from production keys
- Rotate API keys regularly
- Add `.env` to `.gitignore`
- Use HTTPS in production
- Validate API responses

### ❌ DON'T:
- Commit API keys to Git
- Share API keys in screenshots
- Use production keys in development
- Hardcode API keys in source code
- Expose keys in client-side code (mobile/frontend)

---

## Testing Your Setup

### 1. Test NewsAPI
```bash
# Test endpoint
curl "https://newsapi.org/v2/top-headlines?country=us&category=technology&apiKey=YOUR_KEY"

# Should return JSON with articles
```

### 2. Test SendGrid
```java
// In Spring Boot
@Autowired
private EmailService emailService;

emailService.sendOtp("test@example.com", "123456");
// Check inbox for OTP email
```

### 3. Test Backend Configuration
```bash
# Start backend
cd backend
mvn spring-boot:run

# Check if properties loaded
curl http://localhost:8080/actuator/configprops | grep -i news
```

---

## Troubleshooting

### NewsAPI Issues
**Problem**: "apiKey parameter is missing"
- **Fix**: Check API key is in application.yml correctly
- **Fix**: Restart backend after adding key

**Problem**: "You have made too many requests"
- **Fix**: Free tier is 100/day - wait 24 hours or upgrade
- **Fix**: Use GNews as alternative

### SendGrid Issues
**Problem**: "Sender email not verified"
- **Fix**: Verify sender email in SendGrid dashboard
- **Fix**: Use the exact verified email in config

**Problem**: "API key invalid"
- **Fix**: Regenerate API key in SendGrid
- **Fix**: Make sure no extra spaces in config

**Problem**: "Daily sending limit exceeded"
- **Fix**: Free tier is 100/day - wait or upgrade

### General Issues
**Problem**: "Environment variable not found"
- **Fix**: Set environment variables before starting backend
- **Fix**: Use default values in application.yml

**Problem**: "Connection timeout"
- **Fix**: Check internet connection
- **Fix**: Verify API endpoint URLs

---

## Verification Checklist

Before starting development tomorrow:

- [ ] NewsAPI account created
- [ ] NewsAPI key obtained and working
- [ ] NewsAPI key added to application.yml
- [ ] Tested NewsAPI with curl/browser
- [ ] SendGrid account created
- [ ] SendGrid API key obtained
- [ ] Sender email verified in SendGrid
- [ ] SendGrid key added to application.yml
- [ ] Test email sent successfully
- [ ] Backend restarts without errors
- [ ] API keys NOT committed to Git
- [ ] .env file added to .gitignore

---

## Quick Reference

### NewsAPI Endpoints
```
Top Headlines: GET /v2/top-headlines?country={country}&category={category}
Search: GET /v2/everything?q={query}
Sources: GET /v2/sources?category={category}
```

### SendGrid Endpoint
```
Send Email: POST /v3/mail/send
```

### Backend Endpoints (After Implementation)
```
News Headlines: GET /api/news/headlines?category=technology
News Search: GET /api/news/search?query=ai
Send Email OTP: POST /api/auth/send-email-otp
Verify Email OTP: POST /api/auth/verify-email-otp
```

---

## Support Links

- **NewsAPI Docs**: https://newsapi.org/docs
- **SendGrid Docs**: https://docs.sendgrid.com/
- **Razorpay Docs**: https://razorpay.com/docs/
- **Spring Boot**: https://spring.io/guides/gs/spring-boot/

---

**Setup Time**: ~15 minutes  
**Cost**: $0  
**Next Step**: See [TOMORROW_CHECKLIST.md](TOMORROW_CHECKLIST.md)

Good luck! 🚀
