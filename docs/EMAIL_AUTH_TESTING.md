# Quick Test Script for Email OTP Authentication

## Test 1: Send Email OTP

### PowerShell Command:
```powershell
$body = @{
    email = "test@example.com"
    password = "test123"
} | ConvertTo-Json

Invoke-RestMethod -Method POST `
    -Uri "http://localhost:8080/api/auth/send-email-otp" `
    -ContentType "application/json" `
    -Body $body
```

### Expected Output:
```json
{
  "success": true,
  "message": "OTP sent successfully to test@example.com",
  "token": null,
  "user": null
}
```

### Check Backend Console:
Look for:
```
============================================================
📧 EMAIL OTP FOR: test@example.com
🔐 OTP CODE: 123456  <-- COPY THIS CODE
⏰ Valid for: 5 minutes
============================================================
```

---

## Test 2: Verify Email OTP

### PowerShell Command:
Replace `123456` with the actual OTP from backend console:

```powershell
$body = @{
    email = "test@example.com"
    password = "test123"
    otpCode = "123456"
} | ConvertTo-Json

Invoke-RestMethod -Method POST `
    -Uri "http://localhost:8080/api/auth/verify-email-otp" `
    -ContentType "application/json" `
    -Body $body
```

### Expected Output:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "user": {
    "id": 1,
    "phoneNumber": "",
    "email": "test@example.com",
    "name": null,
    "firstName": null,
    "lastName": null,
    "dateOfBirth": null,
    "gender": null,
    "isVerified": true,
    "isActive": true
  }
}
```

---

## Test 3: Invalid OTP

```powershell
$body = @{
    email = "test@example.com"
    password = "test123"
    otpCode = "999999"
} | ConvertTo-Json

Invoke-RestMethod -Method POST `
    -Uri "http://localhost:8080/api/auth/verify-email-otp" `
    -ContentType "application/json" `
    -Body $body
```

### Expected Output:
```json
{
  "success": false,
  "message": "Invalid or expired OTP",
  "token": null,
  "user": null
}
```

---

## Test 4: Check Database

### Connect to PostgreSQL:
```bash
psql -h localhost -p 5433 -U m4hub_user -d m4hub_dev
```

### Query OTPs:
```sql
-- View all OTPs
SELECT id, email, otp_code, expires_at, is_used, created_at 
FROM email_otp_verifications 
ORDER BY created_at DESC;

-- View users created via email
SELECT id, email, phone_number, is_verified, created_at 
FROM users 
WHERE email IS NOT NULL;
```

---

## Mobile App Testing

1. **Start Mobile App**:
```bash
cd mobile
npm start
```

2. **Open in Expo Go**:
   - Scan QR code with Expo Go app
   - Or press `a` for Android emulator
   - Or press `i` for iOS simulator

3. **Test Flow**:
   - Navigate to login
   - See "Email & Password" option
   - Enter email: `test@example.com`
   - Enter password: `test123`
   - Tap "Send OTP"
   - Check backend console for OTP
   - Enter 6-digit OTP
   - Should navigate to profile setup

---

## Troubleshooting

### Backend not responding?
```powershell
# Check if backend is running
Test-NetConnection -ComputerName localhost -Port 8080

# Check backend process
Get-Process | Where-Object {$_.Name -like "*java*"}

# Restart backend
cd backend
java "-Duser.timezone=UTC" -jar target\backend-0.0.1-SNAPSHOT.jar
```

### Mobile can't connect to backend?

**For Android Emulator**:
Update `mobile/constants/index.ts`:
```typescript
export const APP_CONFIG = {
  API_URL: 'http://10.0.2.2:8080',  // Android emulator
  WS_URL: 'ws://10.0.2.2:8080'
};
```

**For iOS Simulator**:
```typescript
export const APP_CONFIG = {
  API_URL: 'http://localhost:8080',
  WS_URL: 'ws://localhost:8080'
};
```

**For Physical Device**:
Find your computer's IP address:
```powershell
# Get local IP
(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like "*Wi-Fi*" -or $_.InterfaceAlias -like "*Ethernet*"}).IPAddress
```

Then update:
```typescript
export const APP_CONFIG = {
  API_URL: 'http://192.168.x.x:8080',  // Your computer's IP
  WS_URL: 'ws://192.168.x.x:8080'
};
```

---

## Quick Status Check

### Is everything running?

```powershell
# Check backend (should return "Started M4hubApplication")
curl http://localhost:8080/actuator/health -UseBasicParsing

# Check PostgreSQL (should connect)
Test-NetConnection -ComputerName localhost -Port 5433

# Check frontend (if needed)
Test-NetConnection -ComputerName localhost -Port 3000
```

---

## Success Indicators ✅

- [ ] Backend running on port 8080
- [ ] Database connection successful
- [ ] Send OTP returns success
- [ ] OTP code appears in backend console
- [ ] Verify OTP returns token and user
- [ ] User created in database
- [ ] Mobile app connects to backend
- [ ] Mobile app shows email login option
- [ ] Mobile sends OTP successfully
- [ ] Mobile verifies OTP successfully
- [ ] Mobile navigates to profile setup

**All checked? You're ready to go! 🎉**
