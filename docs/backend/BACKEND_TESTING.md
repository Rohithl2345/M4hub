# Backend Testing Guide - M4Hub

## Prerequisites
1. ✅ Java 17 installed
2. ✅ Maven installed
3. ⚠️ Docker Desktop must be running
4. ⚠️ PostgreSQL database (via Docker)

---

## Step 1: Start Docker Desktop
**IMPORTANT**: Open Docker Desktop application first!

Then start PostgreSQL:
```powershell
cd D:\ROHITH_PERSONAL\Personal_Project\M4hub\infra
docker-compose up -d
```

Wait 10 seconds for database to be ready.

---

## Step 2: Start Backend

### Option A: Console Mode (Current - FREE)
OTP will be printed to console:
```powershell
cd D:\ROHITH_PERSONAL\Personal_Project\M4hub\backend
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

Backend will start on: http://localhost:8080

### Option B: Twilio Mode (FREE Trial)
```powershell
cd D:\ROHITH_PERSONAL\Personal_Project\M4hub\backend
$env:SMS_PROVIDER="twilio"
$env:SMS_ENABLED="true"
$env:TWILIO_ACCOUNT_SID="your_twilio_sid"
$env:TWILIO_AUTH_TOKEN="your_twilio_token"
$env:TWILIO_PHONE_NUMBER="+1234567890"
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

### Option C: Firebase Mode (FREE - 10k/month)
```powershell
cd D:\ROHITH_PERSONAL\Personal_Project\M4hub\backend
$env:SMS_PROVIDER="firebase"
$env:FIREBASE_CREDENTIALS_PATH="D:/path/to/firebase-adminsdk.json"
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

---

## Step 3: Test the API

### Test 1: Send OTP
```powershell
curl -X POST http://localhost:8080/api/auth/send-otp `
  -H "Content-Type: application/json" `
  -d '{\"phoneNumber\": \"+919876543210\"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to +919876543210"
}
```

**Check Backend Console for OTP:**
```
📱 SMS [CONSOLE] - OTP for +919876543210: 123456
```

### Test 2: Verify OTP
Use the OTP from console:
```powershell
curl -X POST http://localhost:8080/api/auth/verify-otp `
  -H "Content-Type: application/json" `
  -d '{\"phoneNumber\": \"+919876543210\", \"otpCode\": \"123456\"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "abc-123-xyz-789",
  "user": {
    "id": 1,
    "phoneNumber": "+919876543210",
    "isVerified": true
  }
}
```

---

## Step 4: Test with Mobile App

1. Start Android emulator (if not running):
```powershell
cd D:\ROHITH_PERSONAL\Personal_Project\M4hub\mobile
npm run android
```

2. In mobile app:
   - Navigate to phone login screen
   - Enter phone number: +919876543210
   - Tap "Send OTP"
   - Check backend console for OTP
   - Enter the OTP in mobile app
   - Should login successfully

---

## Current SMS Provider Configuration

**Default**: `console` (FREE - logs OTP to terminal)

To change provider, set environment variable:
```powershell
# Console logging (current)
$env:SMS_PROVIDER="console"

# Twilio
$env:SMS_PROVIDER="twilio"

# Firebase
$env:SMS_PROVIDER="firebase"
```

---

## Troubleshooting

### Error: "Connection refused to localhost:5433"
**Solution**: Start Docker Desktop, then run:
```powershell
cd D:\ROHITH_PERSONAL\Personal_Project\M4hub\infra
docker-compose up -d
```

### Error: "Unable to connect to database"
**Check if PostgreSQL is running:**
```powershell
docker ps
```
Should see `infra-db-1` running.

### Backend not starting
**Rebuild:**
```powershell
cd D:\ROHITH_PERSONAL\Personal_Project\M4hub\backend
mvn clean install -DskipTests
```

### OTP not showing in console
**Check SMS_PROVIDER:**
```powershell
echo $env:SMS_PROVIDER
# Should be: console
```

---

## Quick Start (Current Setup)

1. **Start Docker Desktop** (manually open the app)
2. **Start Database:**
   ```powershell
   cd D:\ROHITH_PERSONAL\Personal_Project\M4hub\infra
   docker-compose up -d
   ```
3. **Start Backend:**
   ```powershell
   cd D:\ROHITH_PERSONAL\Personal_Project\M4hub\backend
   java -jar target/backend-0.0.1-SNAPSHOT.jar
   ```
4. **Test API:**
   ```powershell
   curl -X POST http://localhost:8080/api/auth/send-otp `
     -H "Content-Type: application/json" `
     -d '{\"phoneNumber\": \"+919876543210\"}'
   ```
5. **Check console for OTP** - will show: `📱 SMS [CONSOLE] - OTP for +919876543210: 123456`

---

## SMS Provider Status

✅ **Console Logging** - Working (current)
✅ **Twilio** - Code ready, needs credentials
✅ **Firebase** - Code ready, needs setup

All three options are implemented and ready to use!
