# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Docker Development
```bash
# Build and start all services (recommended for development)
docker compose -f docker/docker-compose.yaml up --build

# Start in background
docker compose -f docker/docker-compose.yaml up -d

# View logs for all services
docker compose -f docker/docker-compose.yaml logs -f

# View logs for specific service
docker compose -f docker/docker-compose.yaml logs -f backend
docker compose -f docker/docker-compose.yaml logs -f frontend
docker compose -f docker/docker-compose.yaml logs -f db

# Stop all services
docker compose -f docker/docker-compose.yaml down

# Stop and remove all data (fresh start)
docker compose -f docker/docker-compose.yaml down -v

# Check service status
docker compose -f docker/docker-compose.yaml ps

# Execute commands in containers
docker compose -f docker/docker-compose.yaml exec backend alembic upgrade head
docker compose -f docker/docker-compose.yaml exec backend python -m pytest
docker compose -f docker/docker-compose.yaml exec frontend nginx -t
```

### Local Development (without Docker)
```bash
# Backend
pip install -r src/requirements.txt
alembic upgrade head
uvicorn src.main:app --reload

# Frontend
cd client
npm install
npm run dev
npm run build  # Production build
```

### Database Management
```bash
# Run migrations (automatic in Docker)
alembic upgrade head

# Create new migration
alembic revision --autogenerate -m "description"

# Check migration history
alembic history

# Downgrade database
alembic downgrade -1
```

## Architecture Overview

This is a full-stack task scheduler application with a three-tier architecture:

### Core Components
- **Frontend**: Vue.js 3 + Tailwind CSS + Vite, served by Nginx on port 8080
- **Backend**: FastAPI with Python 3.10, running on port 8000
- **Database**: PostgreSQL 15, internal container only (port 5432)

### Key Architectural Pattern: CORS-Free via Nginx Reverse Proxy

The application uses Nginx as a reverse proxy to avoid CORS issues. Instead of direct cross-origin API calls:
1. Frontend makes requests to `/api/*` endpoints (same origin)
2. Nginx proxies these to `http://backend:8000/*`
3. From browser perspective, all requests are same-origin

Frontend API calls use relative URLs (e.g., `/tasks`, `/auth/login`) configured via `axios.defaults.baseURL = '/api'` in `client/src/main.js`.

### Backend Structure
- `src/main.py`: FastAPI application entry point with CORS middleware
- `backend/tasks/`: Core task management module
  - `router.py`: FastAPI route definitions (CRUD operations)
  - `schema.py`: Pydantic models for request/response
  - `model.py`: SQLAlchemy ORM models
  - `services.py`: Business logic layer
- `backend/db.py`: Database connection and session management
- `alembic/`: Database migration scripts

### Frontend Structure
- `client/src/`: Vue.js application source
  - `pages/`: Route components (AddTask, TaskList, Scheduler, etc.)
  - `components/`: Reusable UI components (Header, Footer, Loader)
  - `routes.js`: Vue Router configuration
- `client/nginx.conf`: Nginx reverse proxy configuration
- Multi-stage Dockerfile builds with Node.js builder and Nginx runner

## Database Schema

The application uses PostgreSQL with SQLAlchemy ORM. Migrations are managed through Alembic and run automatically when the backend container starts.

## Environment Configuration

### Docker Environment Variables
Database credentials are configured in `docker/docker-compose.yaml`:
- `DATABASE_USERNAME: scheduler`
- `DATABASE_PASSWORD: scheduler`
- `DATABASE_HOST: db`
- `DATABASE_NAME: scheduler`

### Frontend Build Configuration
- `VITE_BASE_URL` build argument configurable in docker compose -f docker/docker-compose.yaml.yaml
- Static assets served with aggressive caching (1 year)
- All API requests routed through `/api/` prefix

## Development Guidelines

### Backend Development
- All endpoints are async/await
- Use SQLAlchemy sessions via dependency injection
- Pydantic schemas for request/response validation
- Auto-generated OpenAPI docs at `/docs`

### Frontend Development
- Vue 3 Composition API preferred
- Tailwind CSS for styling (no custom CSS files)
- Axios for HTTP requests with base URL configured globally
- FontAwesome icons via vue-fontawesome package
- Dayjs for date handling in calendar views

### Testing
- Backend tests can be run with: `docker compose -f docker/docker-compose.yaml exec backend python -m pytest`
- Frontend development server runs with hot reload on file changes

## Common Troubleshooting

### Port Conflicts
- Frontend: 8080, Backend: 8000
- If ports are in use, modify mappings in `docker compose -f docker/docker-compose.yaml.yaml`

### Database Issues
- Check `docker compose -f docker/docker-compose.yaml logs db` for PostgreSQL errors
- Verify database service shows "(healthy)" in `docker compose -f docker/docker-compose.yaml ps`
- Run `docker compose -f docker/docker-compose.yaml exec db psql -U scheduler -d scheduler` for direct DB access

### API Connection Issues
- Verify nginx configuration: `docker compose -f docker/docker-compose.yaml exec frontend nginx -t`
- Test backend directly: `curl http://localhost:8000/docs`
- Check service connectivity: `docker compose -f docker/docker-compose.yaml exec frontend ping backend`