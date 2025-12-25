# Firebase Setup Guide for M4Hub

## Prerequisites
- Google account
- Firebase project created

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Enter project name: `m4hub` or `m4hub-prod`
4. Follow the setup wizard

## Step 2: Enable Phone Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Phone** authentication provider
3. Note: Firebase provides **10,000 free verifications/month**

## Step 3: Generate Service Account Key

1. Go to **Project Settings** (gear icon) > **Service Accounts**
2. Click **Generate New Private Key**
3. Download the JSON file
4. **Important**: Keep this file secure and never commit to Git

## Step 4: Configure Backend

### Option A: Development (using file path)

1. Save the downloaded JSON file to:
   ```
   backend/src/main/resources/firebase-service-account.json
   ```

2. Add to `.gitignore`:
   ```
   **/firebase-service-account.json
   ```

3. Update `application-dev.yml`:
   ```yaml
   sms:
     provider: firebase
   
   firebase:
     credentials:
       path: classpath:firebase-service-account.json
   ```

### Option B: Production (using environment variable)

1. Store the JSON file securely (Azure Key Vault, AWS Secrets Manager, etc.)

2. Set environment variable:
   ```bash
   export FIREBASE_CREDENTIALS_PATH=/secure/path/to/firebase-service-account.json
   # OR
   export SMS_PROVIDER=firebase
   export FIREBASE_CREDENTIALS_PATH=/path/to/credentials.json
   ```

3. The `application-prod.yml` already configured:
   ```yaml
   sms:
     provider: ${SMS_PROVIDER:firebase}
   
   firebase:
     credentials:
       path: ${FIREBASE_CREDENTIALS_PATH}
   ```

## Step 5: Test Firebase Integration

1. Start backend with Firebase enabled:
   ```bash
   export SPRING_PROFILES_ACTIVE=dev
   mvn spring-boot:run
   ```

2. Check logs for successful initialization:
   ```
   Firebase initialized successfully
   ```

3. Test OTP send:
   ```bash
   curl -X POST http://localhost:8080/api/auth/send-otp \
     -H "Content-Type: application/json" \
     -d '{"phoneNumber":"+919876543210"}'
   ```

## Step 6: Firebase Phone Auth Flow

### How it works:
1. **Client sends phone number** → Backend
2. **Backend validates format** (E.164: +[country code][number])
3. **Backend generates 6-digit OTP** → Stores in database
4. **Backend calls Firebase** → Firebase sends SMS
5. **User receives SMS** → Enters OTP in app
6. **Client sends OTP** → Backend
7. **Backend verifies OTP** → Returns JWT token

### Important Notes:
- Firebase handles SMS delivery globally
- No need to configure Twilio for basic SMS
- Firebase provides better international coverage
- 10k free verifications/month (see pricing below)

## Firebase Pricing (Free Tier)

| Feature | Free Tier | Paid (Blaze) |
|---------|-----------|--------------|
| Phone Auth | 10,000/month | $0.01 per verification after free tier |
| SMS Delivery | Included | Based on carrier rates |
| Database | 1GB storage | Pay as you go |

## Security Best Practices

### 1. Protect Service Account Key
```gitignore
# .gitignore
firebase-service-account.json
**/firebase-*.json
.env
.env.local
```

### 2. Restrict API Keys
In Firebase Console:
- Go to **Project Settings** > **Cloud Messaging**
- Add application restrictions
- Limit to your backend server IP

### 3. Environment Variables
Never hardcode credentials:
```yaml
# ❌ BAD
firebase:
  credentials:
    path: /Users/john/firebase-key.json

# ✅ GOOD
firebase:
  credentials:
    path: ${FIREBASE_CREDENTIALS_PATH}
```

## Troubleshooting

### Issue: "Failed to initialize Firebase"
**Solution**: Check file path and permissions
```bash
# Verify file exists
ls -la backend/src/main/resources/firebase-service-account.json

# Check file permissions
chmod 600 firebase-service-account.json
```

### Issue: "Invalid phone number"
**Solution**: Use E.164 format
```
❌ 9876543210
❌ 09876543210
✅ +919876543210
```

### Issue: "Firebase SMS not sending"
**Solution**: 
1. Check Firebase Console > Authentication > Usage
2. Verify phone number is not blocked
3. Check billing account (if exceeded free tier)
4. Review Firebase logs in console

## Alternative: Console Logger (Development)

For development without Firebase:
```yaml
# application-dev.yml
sms:
  provider: console  # Logs OTP to console instead
```

This will print OTP to console:
```
SMS DISABLED - OTP for +919876543210: 123456
```

## Current Configuration Status

- ✅ Firebase Admin SDK dependency added (pom.xml)
- ✅ FirebaseSmsService implemented
- ✅ Console logger for development
- ✅ Production config ready
- ✅ Phone number validation (E.164 format)
- ⚠️ Firebase credentials file needed

## Next Steps

1. **Get Firebase credentials** (follow steps above)
2. **Save JSON file** to `backend/src/main/resources/`
3. **Update .gitignore** to exclude credentials
4. **Test with real phone number**
5. **Monitor usage** in Firebase Console
