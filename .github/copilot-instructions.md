# Copilot Instructions for M4hub

## Project Overview
M4hub is a multi-platform application integrating Music, Messages, Money, and News services. It consists of three main apps:
- **backend/**: Spring Boot REST API (Java 17, Maven, PostgreSQL)
- **frontend/**: Next.js web app (React, TypeScript, MUI)
- **mobile/**: React Native (Expo) mobile app
- **infra/**: Docker Compose for local orchestration
- **docs/**: Centralized documentation for all platforms

## Architecture & Data Flow
- **Backend** exposes REST APIs for all domains (music, auth, messaging, payments, news).
- **Frontend** and **mobile** apps consume backend APIs directly.
- **Database**: PostgreSQL, managed via Docker Compose for local/dev.
- **Authentication**: OTP-based login (console, Twilio, or Firebase as SMS provider).
- **State Management**: Redux Toolkit (web/mobile), centralized theme system.

## Developer Workflows
- **Start all services**: `./start-dev.ps1` (Windows PowerShell)
- **Stop all services**: `./stop-dev.ps1`
- **Backend only**: See `docs/backend/BACKEND_TESTING.md` for environment setup and test flows.
- **Frontend**: `cd frontend && npm run dev`
- **Mobile**: `cd mobile && npm start` (see `docs/mobile/README.md`)
- **Database**: `cd infra && docker-compose up -d`
- **Build backend**: `cd backend && mvn clean install -DskipTests`
- **Run backend**: `java -jar target/backend-0.0.1-SNAPSHOT.jar`

## Project Conventions
- **Centralized styling**: Use `styles/theme.ts` and `commonStyles.ts` (web/mobile)
- **Component structure**: One component per file, colocate styles
- **Naming**: PascalCase for components/folders, camelCase for files/functions, SCREAMING_SNAKE_CASE for constants
- **Barrel exports**: Use `index.ts` for cleaner imports
- **API services**: Place in `services/` directory (web/mobile)
- **Redux slices**: Place in `store/slices/`
- **Environment variables**: See `infra/SETUP_GUIDE.md` and `backend/src/main/resources/application.yml`

## Integration & External Dependencies
- **SMS**: Console, Twilio, or Firebase (switch via `SMS_PROVIDER` env var)
- **Database**: PostgreSQL (Dockerized, port 5433 external)
- **Frontend**: Next.js 16, React 19, MUI
- **Mobile**: Expo 54, React Native 0.81, Expo Router 6

## Key Files & References
- `README.md`: Project overview, quick start, and documentation links
- `docs/`: All platform and workflow documentation
- `infra/docker-compose.yml`: Service orchestration
- `backend/Dockerfile`: Spring Boot build and run
- `frontend/Dockerfile`: Next.js build and run
- `docs/FOLDER_STRUCTURE.md`: Detailed folder and naming conventions
- `docs/backend/BACKEND_TESTING.md`: Backend test and run flows
- `docs/mobile/README.md`: Mobile setup and commands

## Examples
- **Add a new API**: Implement in `backend/src/main/java/com/m4hub/controller/`, document in `docs/backend/`
- **Add a new page (web)**: Create in `frontend/src/app/`, use centralized theme and Redux store
- **Add a new screen (mobile)**: Create in `mobile/app/`, use Expo Router and centralized styles

## Tips for AI Agents
- Always check `docs/` for up-to-date platform and workflow details
- Follow naming and structure conventions strictly
- Use Docker Compose for local dev environment
- Reference `infra/SETUP_GUIDE.md` for environment variables and troubleshooting
- Prefer updating documentation if you introduce new patterns or workflows
