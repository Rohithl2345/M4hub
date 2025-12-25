# M4Hub Development Guide

## Quick Start (Recommended)

### Start All Services
Simply run the startup script:
```powershell
.\start-dev.ps1
```

This will:
1. ✅ Start Docker Desktop (if not running)
2. ✅ Start PostgreSQL Database (Docker)
3. ✅ Start Backend Server (Spring Boot on port 8080)
4. ✅ Start Frontend App (Next.js on port 3000)

Each service runs in its own terminal window so you can see logs separately!

### Stop All Services
```powershell
.\stop-dev.ps1
```

---

## Manual Start (Alternative)

If you prefer to start services manually:

### 1. Start Database
```powershell
docker-compose -f infra/docker-compose.dev.yml up -d
```

### 2. Start Backend (in new terminal)
```powershell
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### 3. Start Frontend (in new terminal)
```powershell
cd frontend
npm run dev
```

---

## Access URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080
- **Database:** localhost:5433 (PostgreSQL)

---

## Testing the App

1. Open http://localhost:3000
2. Click "Get Started"
3. Enter phone number with country code (e.g., `+919876543210`)
4. Check backend terminal for OTP code
5. Enter OTP and complete profile setup

---

## Troubleshooting

### Port Already in Use
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process by PID
Stop-Process -Id <PID> -Force
```

### Database Connection Failed
```powershell
# Restart database
docker-compose -f infra/docker-compose.dev.yml restart
```

### Clear Cache
```powershell
# Frontend
cd frontend
Remove-Item -Recurse -Force .next
npm run dev

# Backend
cd backend
mvn clean install
```

---

## Development Tips

- **Hot Reload:** Both frontend and backend support hot reload
- **OTP in Dev Mode:** Check backend terminal for OTP codes
- **Redux DevTools:** Install Redux DevTools extension in browser
- **Database GUI:** Use TablePlus, DBeaver, or pgAdmin to view database
