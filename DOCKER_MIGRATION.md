# Docker Migration Documentation

## Overview

This document details the changes made to containerize the Task Scheduler application using Docker and Docker Compose. The application now runs in isolated containers for the database, backend, and frontend services.

**Related Documentation:**
- See [CORS_FIX_DOCUMENTATION.md](./CORS_FIX_DOCUMENTATION.md) for details on how CORS issues are avoided using Nginx reverse proxy

## Date of Migration
October 19, 2025

## Changes Made

### 1. Backend Configuration (`backend/config.py`)

**New File Created**

This file centralizes environment variable configuration for database connections:

```python
import os

DATABASE_USERNAME = os.getenv("DATABASE_USERNAME", "scheduler")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD", "scheduler")
DATABASE_HOST = os.getenv("DATABASE_HOST", "db")
DATABASE_NAME = os.getenv("DATABASE_NAME", "scheduler")
```

**Purpose:**
- Allows flexible configuration via environment variables
- Provides sensible defaults for local development
- Enables different configurations for different environments (dev, staging, production)

### 2. Python Package Structure

**Files Created:**
- `backend/__init__.py` (empty)
- `backend/tasks/__init__.py` (empty)

**Purpose:**
- Makes `backend` a proper Python package
- Allows importing modules using `backend.config` syntax
- Required for the modular structure used in the Docker container

### 3. Database Configuration (`backend/db.py`)

**Modified**

The database connection now uses the centralized config module:

```python
import backend.config as config

DATABASE_USERNAME = config.DATABASE_USERNAME
DATABASE_PASSWORD = config.DATABASE_PASSWORD
DATABASE_HOST = config.DATABASE_HOST
DATABASE_NAME = config.DATABASE_NAME
```

**Benefits:**
- Single source of truth for database configuration
- Easy to switch between local and containerized databases
- Supports different database hosts (localhost vs. Docker service name)

### 4. Backend Dockerfile (`backend/Dockerfile`)

**New File Created**

Multi-layer Dockerfile for the FastAPI backend:

```dockerfile
FROM python:3.10-slim AS base
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy application code
COPY ./backend ./backend
COPY main.py .
COPY alembic.ini .
COPY alembic ./alembic

ENV PYTHONUNBUFFERED=1

CMD ["sh", "-c", "alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port 8000"]
```

**Key Features:**
- Uses Python 3.10 slim image for smaller size
- Installs dependencies first (better layer caching)
- Runs Alembic migrations automatically on startup
- Unbuffered Python output for better logging
- Exposes FastAPI on port 8000

### 5. Frontend Dockerfile (`client/Dockerfile`)

**New File Created**

Multi-stage build for optimized Vue.js frontend:

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve stage
FROM nginxinc/nginx-unprivileged:1.25-alpine AS runner
USER nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx --from=builder /app/dist /usr/share/nginx/html
EXPOSE 8080
```

**Key Features:**
- Multi-stage build: smaller final image (only contains built assets)
- Uses npm ci for reproducible builds
- Runs as unprivileged nginx user (better security)
- Serves static files via nginx
- Custom nginx configuration for SPA routing and API proxying

### 6. Nginx Configuration (`client/nginx.conf`)

**New File Created**

Custom nginx configuration for the frontend:

```nginx
location /api/ {
    proxy_pass http://backend:8000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

**Key Features:**
- Proxies `/api/*` requests to backend service
- SPA routing support (all routes serve index.html)
- Aggressive caching for static assets (1 year)
- Proper HTTP headers for proxying

### 7. Docker Compose (`docker-compose.yaml`)

**New File Created**

Orchestrates all services:

```yaml
services:
  db:
    image: postgres:15-alpine
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "scheduler"]
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "8000:8000"

  frontend:
    build:
      context: client
      dockerfile: Dockerfile
    depends_on:
      - backend
    ports:
      - "8080:8080"

volumes:
  postgres_data:
```

**Key Features:**
- Three services: database, backend, frontend
- Health checks ensure proper startup order
- Persistent volume for database data
- Environment variable injection
- Service-to-service communication via service names

### 8. Documentation (`README.md`)

**Updated**

Added comprehensive Docker deployment section:
- Prerequisites
- Architecture overview
- Quick start guide
- Common Docker Compose commands
- Environment variable configuration
- Container details for each service
- Troubleshooting guide

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│           User Browser                          │
└──────────────────┬──────────────────────────────┘
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

## Benefits of Docker Migration

### Development
1. **Consistent Environment**: Same environment across all developer machines
2. **Easy Setup**: Single command to start entire stack
3. **Isolation**: No conflicts with other projects or system packages
4. **No Local Dependencies**: Don't need to install Python, Node.js, or PostgreSQL locally

### Deployment
1. **Portability**: Runs the same on any system with Docker
2. **Scalability**: Easy to scale individual services
3. **Version Control**: Infrastructure as code (Dockerfiles and docker-compose.yaml)
4. **Rollback**: Easy to revert to previous container versions

### Operations
1. **Health Checks**: Automatic service health monitoring
2. **Logging**: Centralized logging via `docker-compose logs`
3. **Resource Management**: Container resource limits can be set
4. **Security**: Isolated services with minimal attack surface

## Migration Checklist

- [x] Created backend configuration module
- [x] Added Python package init files
- [x] Updated database configuration to use environment variables
- [x] Created backend Dockerfile
- [x] Created frontend Dockerfile with multi-stage build
- [x] Created nginx configuration for SPA and API proxying
- [x] Created docker-compose.yaml for service orchestration
- [x] Updated README with Docker deployment instructions
- [x] Fixed CORS issues by configuring frontend to use nginx proxy
- [x] Updated all Vue components to use relative API URLs
- [x] Created migration documentation
- [x] Created CORS fix documentation

## Testing the Migration

### 1. Build and Start Services
```bash
docker-compose up --build
```

### 2. Verify Services
- Check service status: `docker-compose ps`
- Check logs: `docker-compose logs -f`
- Test frontend: http://localhost:8080
- Test backend API: http://localhost:8000/docs

### 3. Test Database Persistence
```bash
# Add some tasks via the UI
docker-compose down
docker-compose up
# Verify tasks are still present
```

## Future Improvements

### Recommended Enhancements
1. **Environment Files**: Use `.env` file for sensitive configuration
2. **Production Build**: Separate `docker-compose.prod.yaml` for production
3. **Secrets Management**: Use Docker secrets for passwords
4. **CI/CD Integration**: Automated builds and deployments
5. **Container Registry**: Push images to Docker Hub or private registry
6. **Monitoring**: Add Prometheus and Grafana for monitoring
7. **Backup Strategy**: Automated database backups
8. **SSL/TLS**: Add reverse proxy with SSL certificates (e.g., Traefik)

### Security Enhancements
1. Non-root user in backend container
2. Read-only root filesystem where possible
3. Resource limits (CPU, memory)
4. Network isolation with custom Docker networks
5. Vulnerability scanning of container images

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find and kill process using port 8000 or 8080
# Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process
```

**Database Connection Refused**
- Wait for database health check to pass
- Check `docker-compose logs db`
- Verify DATABASE_HOST is set to "db" (service name)

**Frontend Cannot Reach Backend**
- Verify nginx.conf proxy_pass uses service name "backend"
- Check `docker-compose logs frontend`
- Ensure backend service is running

**Alembic Migration Fails**
- Check database is ready: `docker-compose logs db`
- Verify database credentials in docker-compose.yaml
- Manually run migrations: `docker-compose exec backend alembic upgrade head`

## Conclusion

The Task Scheduler application is now fully containerized and can be deployed with a single command. The Docker setup provides consistency across development and production environments while maintaining flexibility for different deployment scenarios.
