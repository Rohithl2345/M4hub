# M4hub - Docker Compose Setup Guide

## Overview

This docker-compose configuration sets up a complete M4hub application stack with:
- **PostgreSQL 15** database with health checks
- **Spring Boot Backend** with UTC time zone configuration
- **Next.js Frontend** (run separately with npm package manager)

## Features

### Database (PostgreSQL)
- **Image**: postgres:15
- **Container**: m4hub-db (database)
- **Port**: 5433 (external) → 5432 (internal)
- **Health Check**: Uses `pg_isready` to verify database readiness
  - Interval: 5 seconds
  - Timeout: 5 seconds
  - Retries: 5
  - Start period: 10 seconds (grace period before first check)

### Backend (Spring Boot)
- **Docker file**: Multi-stage build for optimized image size
- **Container**: m4hub-backend
- **Port**: 8080
- **JVM Time zone**: UTC (set in Docker file entry point)
- **Startup**: Only starts after database is healthy (`condition: service_healthy`)

### Wait-for Script
- **File**: `wait-for-db.sh`
- **Purpose**: Alternative to health check for manual database readiness checks
- **Usage**: `./wait-for-db.sh localhost 5432 30`

## Quick Start

### Start All Services (Docker)
```bash
cd infra
docker-compose up -d
```

The backend will automatically wait for the database to be ready before starting.

### Start Only Database
```bash
cd infra
docker-compose up -d db
```

### Stop All Services
```bash
cd infra
docker-compose down
```

### View Logs
```bash
cd infra
docker-compose logs -f backend
docker-compose logs -f db
```

## Manual Backend Start (Without Docker)

If you prefer to run the backend directly on your machine:

```bash
cd backend
java -Duser.timezone=UTC -jar target/backend-0.0.1-SNAPSHOT.jar
```

**Requirements**:
- Java 17+
- PostgreSQL running on localhost:5433
- Database: m4hub_db (database)
- User: m4hub
- Password: m4hub_pass

## Configuration

### Database Environment Variables
```yaml
POSTGRES_USER: m4hub
POSTGRES_PASSWORD: m4hub_pass
POSTGRES_DB: m4hub_db
TZ: Asia/Kolkata  # PostgreSQL time zone
```

### Backend Environment Variables
```yaml
SPRING_DATASOURCE_HOST: db        # Docker hostname
SPRING_DATASOURCE_PORT: 5432
SPRING_DATASOURCE_DB: m4hub_db
SPRING_DATASOURCE_USERNAME: m4hub
SPRING_DATASOURCE_PASSWORD: m4hub_pass
SERVER_PORT: 8080
```

### Backend Application Configuration
See `backend/src/main/resources/application.yml` for Spring Boot configuration.

## Troubleshooting

### Backend won't start
1. Check if PostgreSQL is running: `docker-compose ps`
2. Check database health: `docker-compose logs db` (database)
3. Wait 10+ seconds after starting for health check to pass

### Connection refused on port 8080
- Another service is using port 8080
- Stop conflicting process: `netstat -ano | findstr "8080"`

### Time zone issues
- The Docker file sets `-Duser.timezone=UTC` in the JVM entry point
- Database uses `TZ: Asia/Kolkata` environment variable
- Both are synchronized to prevent time zone mismatches

## Files

- `docker-compose.yml` - Complete service configuration with health checks
- `wait-for-db.sh` - Optional wait script for database readiness
- `../backend/Dockerfile` - Multi-stage build for Spring Boot application
- `../backend/src/main/resources/application.yml` - Spring Boot configuration

## Architecture

```
┌─────────────────────────┐
│   docker-compose        │
├─────────────────────────┤
│  ┌──────────────────┐   │
│  │   PostgreSQL 15  │   │
│  │   (m4hub-db)     │   │
│  │   Health Check   │   │
│  └────────┬─────────┘   │
│           │ (wait for)  │
│  ┌────────▼─────────┐   │
│  │ Spring Boot 3.2  │   │
│  │  (m4hub-backend) │   │
│  │  Port: 8080      │   │
│  │  TZ: UTC         │   │
│  └──────────────────┘   │
└─────────────────────────┘
```

## Next Steps

1. Start services: `docker-compose up -d`
2. Wait for backend to be healthy
3. Test API: `curl http://localhost:8080`
4. Start frontend: `cd frontend && npm run dev`
5. Access: http://localhost:3000

