# Task Scheduler Documentation

Welcome to the Task Scheduler documentation. This file provides an overview of all documentation and guides you to the relevant resources.

## Table of Contents

1. **[Getting Started](#getting-started)**
2. **[Architecture](#architecture)**
3. **[Docker Deployment](#docker-deployment)**
4. **[CORS & API Configuration](#cors--api-configuration)**
5. **[Development Guide](#development-guide)**
6. **[Troubleshooting](#troubleshooting)**
7. **[Additional Resources](#additional-resources)**

---

## Getting Started

### Quick Start

```powershell
# Clone the repository
git clone <repository-url>
cd task-scheduler-in-vue-tailwind-and-fastapi

# Start the application with Docker
docker compose up --build

# Access the application
# Frontend: http://localhost:8080
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose (included with Docker Desktop)
- Git

### Project Structure

```
task-scheduler-in-vue-tailwind-and-fastapi/
├── backend/                 # FastAPI backend
│   ├── config.py           # Environment configuration
│   ├── db.py              # Database connection
│   └── tasks/             # Tasks module
├── client/                 # Vue.js frontend
│   ├── src/               # Vue components and pages
│   ├── Dockerfile         # Frontend container definition
│   └── nginx.conf         # Nginx reverse proxy config
├── alembic/               # Database migrations
├── docs/                  # Documentation (this folder)
├── docker compose.yaml    # Service orchestration
└── main.py               # FastAPI application entry
```

---

## Architecture

### System Overview

The Task Scheduler is a full-stack application with:

- **Frontend**: Vue.js 3 with Tailwind CSS, served by Nginx
- **Backend**: FastAPI with Python 3.10
- **Database**: PostgreSQL 15
- **Orchestration**: Docker Compose

### Container Architecture

```
┌─────────────────────────────────────────────────────────┐
│           User Browser                                  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │   Frontend (8080)    │
        │   Nginx + Vue.js     │
        │   ┌──────────────┐   │
        │   │ Static Files │   │
        │   └──────────────┘   │
        │   ┌──────────────┐   │
        │   │ /api/ proxy  │───┼───┐
        │   └──────────────┘   │   │
        └──────────────────────┘   │
                                   ▼
                        ┌──────────────────────┐
                        │  Backend (8000)      │
                        │  FastAPI + Uvicorn   │
                        │  ┌───────────────┐   │
                        │  │ REST API      │   │
                        │  └───────────────┘   │
                        │  ┌───────────────┐   │
                        │  │ Alembic       │───┼───┐
                        │  └───────────────┘   │   │
                        └──────────────────────┘   │
                                                   ▼
                                        ┌──────────────────┐
                                        │  Database (5432) │
                                        │  PostgreSQL 15   │
                                        │  ┌────────────┐  │
                                        │  │ scheduler  │  │
                                        │  └────────────┘  │
                                        └──────────────────┘
```

---

## Docker Deployment

### Overview

The application is fully containerized using Docker and Docker Compose. See **[docs/deployment/DOCKER.md](./deployment/DOCKER.md)** for complete Docker documentation.

### Key Features

- ✅ Multi-container orchestration
- ✅ Automatic database migrations
- ✅ Health checks for service dependencies
- ✅ Persistent data storage
- ✅ Production-ready configuration

### Quick Commands

| Command | Description |
|---------|-------------|
| `docker compose up --build` | Build and start all services |
| `docker compose up -d` | Start in background |
| `docker compose down` | Stop all services |
| `docker compose logs -f` | View logs |
| `docker compose ps` | Check service status |
| `docker compose down -v` | Stop and remove data |

### Services

1. **PostgreSQL Database** (`db`)
   - Port: Internal only
   - Persistent storage via Docker volume
   - Health check enabled

2. **FastAPI Backend** (`backend`)
   - Port: 8000
   - Auto-runs Alembic migrations
   - Depends on: Database (healthy)

3. **Vue.js + Nginx Frontend** (`frontend`)
   - Port: 8080
   - Nginx reverse proxy for API calls
   - Depends on: Backend

### Environment Configuration

Database credentials are configured in `docker compose.yaml`:

```yaml
environment:
  DATABASE_USERNAME: scheduler
  DATABASE_PASSWORD: scheduler
  DATABASE_HOST: db
  DATABASE_NAME: scheduler
```

For production, use `.env` files or Docker secrets.

---

## CORS & API Configuration

### Overview

The application uses Nginx as a reverse proxy to avoid CORS issues. See **[docs/CORS.md](./CORS.md)** for complete CORS documentation.

### How It Works

Instead of direct cross-origin API calls, all frontend requests go through Nginx:

```
Browser Request → http://localhost:8080/api/tasks
     ↓
Nginx Proxy (strips /api prefix)
     ↓
Backend → http://backend:8000/tasks
     ↓
Same-origin request from browser perspective = No CORS errors
```

### Frontend Configuration

**In `client/src/main.js`:**
```javascript
import axios from "axios";
axios.defaults.baseURL = '/api';
```

This configures all axios requests to use the `/api` prefix, which is:
- Intercepted by Nginx
- Proxied to the backend
- Avoiding CORS issues

### API Endpoints

All API calls use relative URLs:

| Component | Old URL | New URL |
|-----------|---------|---------|
| AddTask | `http://localhost:8000/tasks` | `/tasks` |
| TaskTable | `http://localhost:8000/tasks` | `/tasks` |
| TaskList | `http://localhost:8000/tasks` | `/tasks` |
| UpdateTask | `http://localhost:8000/tasks/:id` | `/tasks/:id` |
| Login | `http://localhost:8000/auth/login` | `/auth/login` |
| Register | `http://localhost:8000/auth/register` | `/auth/register` |

---

## Development Guide

### Local Development without Docker

While Docker is recommended, you can run locally:

1. **Backend Setup**
   ```powershell
   pip install -r requirements.txt
   alembic upgrade head
   uvicorn main:app --reload
   ```

2. **Frontend Setup**
   ```powershell
   cd client
   npm install
   npm run dev
   ```

### Database Migrations

Migrations are automatically run when the backend container starts. To manually run:

```powershell
# Inside backend container
docker compose exec backend alembic upgrade head

# Or locally
alembic upgrade head
```

### Building Frontend

```powershell
cd client
npm run build
```

Output goes to `client/dist/` for production use.

---

## Troubleshooting

### Common Issues

#### Port Already in Use

```powershell
# Windows: Kill process using port 8000
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process

# Or change ports in docker compose.yaml
```

#### Database Connection Refused

```powershell
# Check database logs
docker compose logs db

# Verify database is healthy
docker compose ps db

# The db service must show "(healthy)"
```

#### Frontend Cannot Reach Backend

```powershell
# Check nginx configuration
docker compose exec frontend nginx -t

# Check backend is running
docker compose ps backend

# View frontend logs
docker compose logs frontend
```

#### API Returns 404

```powershell
# Ensure nginx proxy_pass is correct
docker compose exec frontend cat /etc/nginx/nginx.conf

# Check backend API is working
curl http://localhost:8000/docs
```

### Troubleshooting Steps

1. Check service status: `docker compose ps`
2. View logs: `docker compose logs <service-name>`
3. Verify environment: `docker compose exec <service> env`
4. Test connectivity: `docker compose exec frontend ping backend`
5. Restart services: `docker compose restart`

---

## Additional Resources

### Detailed Documentation

- **[Docker Configuration & Migration](./deployment/DOCKER.md)**
  - Complete Docker setup details
  - Dockerfiles and configuration
  - Architecture diagrams
  - Troubleshooting guide

- **[CORS & Reverse Proxy Configuration](./CORS.md)**
  - CORS issues and solutions
  - Nginx proxy setup
  - API endpoint configuration
  - Request flow diagrams

### Technology Stack

- **Frontend**: Vue.js 3, Tailwind CSS, Vite, Axios
- **Backend**: FastAPI, Python 3.10, SQLAlchemy, Alembic
- **Database**: PostgreSQL 15
- **DevOps**: Docker, Docker Compose, Nginx
- **Web Server**: Nginx (unprivileged), Uvicorn

### External Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Vue.js Documentation](https://vuejs.org/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Key Files

| File | Purpose |
|------|---------|
| `docker compose.yaml` | Service orchestration |
| `backend/Dockerfile` | Backend container definition |
| `client/Dockerfile` | Frontend container definition |
| `client/nginx.conf` | Nginx reverse proxy configuration |
| `backend/config.py` | Environment variable configuration |
| `main.py` | FastAPI application entry point |
| `alembic/` | Database migration scripts |

---

## Getting Help

### Common Commands

```powershell
# Build images without starting
docker compose build

# Run a command in a container
docker compose exec backend python -m pytest

# View real-time logs
docker compose logs -f backend

# Stop and remove everything
docker compose down -v

# Rebuild and start fresh
docker compose down -v && docker compose up --build
```

### Testing the Application

1. **Frontend**: http://localhost:8080
   - Add tasks
   - View scheduler
   - List tasks

2. **Backend API Docs**: http://localhost:8000/docs
   - Explore API endpoints
   - Test manually

3. **Database**: PostgreSQL on port 5432 (internal only)

---

## Summary

The Task Scheduler is a modern, containerized full-stack application with:
- ✅ Complete Docker support
- ✅ CORS-free architecture via Nginx proxy
- ✅ Production-ready deployment
- ✅ Comprehensive documentation
- ✅ Easy development setup

**Ready to get started?** Run `docker compose up --build` and navigate to http://localhost:8080!

---

**Last Updated**: October 19, 2025

For detailed information, see the individual documentation files in this folder.
