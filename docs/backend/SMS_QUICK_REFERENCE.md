# Firebase & SMS Quick Reference

## 📱 Current SMS Configuration

### Development Mode (Default)
```yaml
sms:
  enabled: false
  provider: console
```
- ✅ No Firebase needed
- ✅ No costs
- ✅ OTP prints to console
- Perfect for testing

### Production Mode
```yaml
sms:
  enabled: true
  provider: firebase  # or twilio
```
- ⚠️ Firebase credentials required
- ⚠️ Costs apply (~₹0.60-0.80 per SMS)
- Real SMS sent to phones

---

## 🚀 Quick Setup Guide

### Option 1: Stay in Dev Mode (No Firebase)
**Current Setup - No Action Needed**
```bash
# Already configured in application-dev.yml
sms.provider=console
sms.enabled=false
```

### Option 2: Enable Real SMS
**Follow These Steps:**
1. Read: `docs/backend/FIREBASE_SETUP.md`
2. Create Firebase project
3. Enable Phone Authentication
4. Upgrade to Blaze plan (pay-as-you-go)
5. Download `firebase-credentials.json`
6. Place in `backend/src/main/resources/`
7. Update config:
   ```yaml
   sms:
     enabled: true
     provider: firebase
   firebase:
     credentials:
       path: classpath:firebase-credentials.json
   ```

---

## 💬 SMS Template

### Production Template (Recommended)
```
M4Hub: Your verification code is 123456

Expires in 5 min. Never share this code.
```

**Specifications:**
- Length: 83 characters
- Single SMS segment
- Cost: ₹0.60-0.80 per message (India)
- Professional & secure

### Alternative Templates
See: `docs/backend/SMS_TEMPLATES.md`
- 5 different templates
- Cost comparison
- Customization options

---

## 💰 Cost Calculator

### India (₹)
| Users | SMS per User | Total SMS | Monthly Cost |
|-------|--------------|-----------|--------------|
| 100   | 2 (login)    | 200       | ₹120-160     |
| 1,000 | 2 (login)    | 2,000     | ₹1,200-1,600 |
| 10,000| 2 (login)    | 20,000    | ₹12,000-16,000|

### USA ($)
| Users | SMS per User | Total SMS | Monthly Cost |
|-------|--------------|-----------|--------------|
| 100   | 2 (login)    | 200       | $2-4         |
| 1,000 | 2 (login)    | 2,000     | $20-40       |
| 10,000| 2 (login)    | 20,000    | $200-400     |

---

## 🧪 Testing

### Test Without Firebase (Console Mode)
```bash
# Start backend
cd backend
./mvnw spring-boot:run

# Send OTP request
curl -X POST http://localhost:8080/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+919876543210"}'

# Check console output:
# ================================================================================
# 📱 SMS [CONSOLE MODE] - OTP SENT
# ================================================================================
# 📞 MOBILE NUMBER: +919876543210
# 🔑 OTP CODE:      123456
# ⏱️  VALID FOR:     5 minutes
# ================================================================================
```

### Test With Firebase (Real SMS)
1. Complete Firebase setup
2. Update `application-dev.yml`:
   ```yaml
   sms:
     enabled: true
     provider: firebase
   ```
3. Restart backend
4. Send OTP request (same as above)
5. Check your phone for SMS

---

## 📚 Documentation

| Document | Purpose | Location |
|----------|---------|----------|
| FIREBASE_SETUP.md | Complete Firebase setup guide | `docs/backend/` |
| SMS_TEMPLATES.md | SMS message templates | `docs/backend/` |
| SMS_QUICK_REFERENCE.md | This document | `docs/backend/` |

---

## ⚡ Quick Commands

### Check Current Configuration
```bash
# View SMS config
cat backend/src/main/resources/application-dev.yml | grep -A 3 "sms:"
```

### Switch to Console Mode
```yaml
# application-dev.yml
sms:
  enabled: false
  provider: console
```

### Switch to Firebase Mode
```yaml
# application-dev.yml
sms:
  enabled: true
  provider: firebase
```

### View SMS Logs
```bash
# Backend console will show SMS output
# Look for: 📱 SMS [MODE] - OTP SENT
```

---

## 🔐 Security Checklist

- [ ] Never commit `firebase-credentials.json` to Git
- [ ] Add credentials to `.gitignore`
- [ ] Set budget alerts in Firebase Console
- [ ] Use test phone numbers during development
- [ ] Monitor Firebase usage regularly
- [ ] Rotate credentials periodically
- [ ] Restrict API keys to your domains

---

## 🆘 Troubleshooting

### OTP not appearing in console
**Solution:** Check `sms.provider=console` in application-dev.yml

### Firebase error: "Credentials not found"
**Solution:** 
1. Check file path in application.yml
2. Verify file exists
3. Ensure file is readable

### SMS not received on phone
**Solution:**
1. Verify `sms.enabled=true`
2. Check Firebase Console for errors
3. Verify phone number format (+91...)
4. Check Firebase quota/balance

### High SMS costs
**Solution:**
1. Use console mode for development
2. Add test phone numbers in Firebase
3. Set budget alerts
4. Monitor Firebase Console usage

---

## 📞 Support

- **Firebase Docs:** https://firebase.google.com/docs/auth/admin
- **SMS Templates:** See `SMS_TEMPLATES.md`
- **Setup Guide:** See `FIREBASE_SETUP.md`

---

**✅ Current Status:**
- SMS works in console mode (dev)
- Professional templates implemented
- Ready for Firebase when needed
- Documentation complete
