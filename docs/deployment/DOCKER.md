# Docker Configuration & Deployment

This document details the Docker setup, containerization, and deployment of the Task Scheduler application.

**Date**: October 19, 2025

## Overview

The Task Scheduler is fully containerized using Docker and Docker Compose. The application runs as three microservices:
- PostgreSQL database
- FastAPI backend
- Vue.js + Nginx frontend

This setup provides consistency across development, staging, and production environments.

## Architecture

### System Components

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

## Configuration Files

### 1. Backend Configuration (`backend/config.py`)

Centralizes environment variable configuration for database connections.

```python
import os

DATABASE_USERNAME = os.getenv("DATABASE_USERNAME", "scheduler")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD", "scheduler")
DATABASE_HOST = os.getenv("DATABASE_HOST", "db")
DATABASE_NAME = os.getenv("DATABASE_NAME", "scheduler")
```

**Purpose:**
- Flexible configuration via environment variables
- Sensible defaults for local development
- Different configurations for different environments (dev, staging, prod)

**Benefits:**
- Single source of truth for database configuration
- Easy to switch between local and containerized databases
- Supports different database hosts (localhost vs. Docker service name)

### 2. Python Package Structure

**Files Created:**
- `backend/__init__.py` - Empty package marker
- `backend/tasks/__init__.py` - Tasks module marker

**Purpose:**
- Makes `backend` a proper Python package
- Allows importing modules using `backend.config` syntax
- Required for modular structure in Docker container

### 3. Database Configuration (`backend/db.py`)

Updated to use centralized config:

```python
import backend.config as config

DATABASE_USERNAME = config.DATABASE_USERNAME
DATABASE_PASSWORD = config.DATABASE_PASSWORD
DATABASE_HOST = config.DATABASE_HOST
DATABASE_NAME = config.DATABASE_NAME

SQLALCHEMY_DATABASE_URL = f"postgresql://{DATABASE_USERNAME}:{DATABASE_PASSWORD}@{DATABASE_HOST}/{DATABASE_NAME}"
```

## Docker Images

### 1. Backend Dockerfile (`backend/Dockerfile`)

```dockerfile
# syntax=docker/dockerfile:1
FROM python:3.10-slim AS base

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy application code
COPY ./backend ./backend
COPY main.py .
COPY alembic.ini .
COPY alembic ./alembic

# Environment variables for database connection
ENV PYTHONUNBUFFERED=1

CMD ["sh", "-c", "alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port 8000"]
```

**Key Features:**
- Python 3.10 slim base image (smaller size)
- Dependencies installed before source code (better layer caching)
- Automatic Alembic migrations on startup
- Unbuffered Python output for better logging
- Listens on port 8000 for API requests

### 2. Frontend Dockerfile (`client/Dockerfile`)

```dockerfile
# syntax=docker/dockerfile:1
ARG NODE_VERSION=20-alpine
ARG NGINX_VERSION=1.25-alpine

# ----- Build stage -----
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
RUN npm run build

# ----- Serve stage -----
FROM nginxinc/nginx-unprivileged:${NGINX_VERSION} AS runner
USER nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx --from=builder /app/dist /usr/share/nginx/html
EXPOSE 8080
ENTRYPOINT ["nginx", "-c", "/etc/nginx/nginx.conf"]
CMD ["-g", "daemon off;"]
```

**Key Features:**
- Multi-stage build: smaller final image (only contains built assets)
- Node.js 20 Alpine for building (lighter than full Node.js)
- npm ci for reproducible builds
- Runs as unprivileged nginx user (security best practice)
- Serves static files via Nginx
- Custom Nginx configuration for SPA routing and API proxying
- Exposes port 8080 for web traffic

## Docker Compose Configuration

### docker compose.yaml

```yaml
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: scheduler
      POSTGRES_PASSWORD: scheduler
      POSTGRES_DB: scheduler
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "scheduler"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    environment:
      DATABASE_USERNAME: scheduler
      DATABASE_PASSWORD: scheduler
      DATABASE_HOST: db
      DATABASE_NAME: scheduler
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
- Environment variables for configuration
- Persistent volume for database data
- Service-to-service communication via service names
- Port mappings for external access

### Service Details

#### PostgreSQL (db)
- **Image**: postgres:15-alpine
- **Port**: 5432 (internal only)
- **Volume**: postgres_data (persistent)
- **Health Check**: pg_isready every 5 seconds
- **Environment**: Default database and credentials

#### FastAPI Backend (backend)
- **Build**: Uses backend/Dockerfile
- **Port**: 8000 (exposed)
- **Depends On**: Database (must be healthy)
- **Environment**: Database connection credentials
- **Startup**: Auto-runs Alembic migrations

#### Vue.js + Nginx Frontend (frontend)
- **Build**: Uses client/Dockerfile
- **Port**: 8080 (exposed)
- **Depends On**: Backend service
- **Functionality**: Serves static files and proxies /api/* calls

## Nginx Configuration

### client/nginx.conf

The Nginx reverse proxy configuration:

```nginx
worker_processes  1;
pid /tmp/nginx.pid;
events { worker_connections  1024; }

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;

    server {
        listen       8080;
        server_name  localhost;

        root   /usr/share/nginx/html;
        index  index.html;

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

        # Cache static assets aggressively
        location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg|map)$ {
            expires 1y;
            access_log off;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

**Key Features:**
- Listens on port 8080
- Proxies /api/* requests to backend:8000
- SPA routing: all non-file requests serve index.html
- Aggressive caching for static assets (1 year)
- Proper proxy headers for backend

## Quick Start

### Build and Start Services

```powershell
docker compose up --build
```

This command:
1. Builds the backend image
2. Builds the frontend image
3. Pulls the PostgreSQL image
4. Starts all three services
5. Runs database migrations
6. Displays logs in the terminal

### Start in Background

```powershell
docker compose up -d --build
```

### Access the Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **API Interactive Testing**: http://localhost:8000/redoc

## Common Commands

| Command | Description |
|---------|-------------|
| `docker compose up --build` | Build and start services |
| `docker compose up -d` | Start in background |
| `docker compose down` | Stop services |
| `docker compose logs -f` | View real-time logs |
| `docker compose logs <service>` | View specific service logs |
| `docker compose ps` | Check service status |
| `docker compose exec backend bash` | Shell into backend |
| `docker compose exec frontend bash` | Shell into frontend |
| `docker compose down -v` | Stop and remove data |
| `docker compose build` | Build images without starting |

## Environment Variables

### Database Configuration

The following environment variables control database connection:

```yaml
DATABASE_USERNAME: scheduler
DATABASE_PASSWORD: scheduler
DATABASE_HOST: db
DATABASE_NAME: scheduler
```

**For Production:**
- Use `.env` files for sensitive data
- Don't commit credentials to version control
- Use Docker secrets or environment management systems

### Python Configuration

- `PYTHONUNBUFFERED=1` - Real-time output from Python

## Benefits of Docker Setup

### Development
- ✅ Consistent environment across developer machines
- ✅ Single command to start the entire stack
- ✅ No conflicts with other projects or system packages
- ✅ No need to install Python, Node.js, or PostgreSQL locally

### Deployment
- ✅ Runs identically on any system with Docker
- ✅ Easy to scale individual services
- ✅ Infrastructure as code (Dockerfiles and docker compose.yaml)
- ✅ Easy to revert to previous versions

### Operations
- ✅ Automatic health checks
- ✅ Centralized logging via docker compose logs
- ✅ Resource limits can be set per container
- ✅ Isolated services with minimal attack surface

## Database Persistence

Data is persisted using Docker volumes:

```yaml
volumes:
  postgres_data:
```

The `postgres_data` volume is automatically created and persists data between container restarts.

**To preserve data:**
```powershell
docker compose down
# Data persists in the volume
docker compose up
# Same data is loaded
```

**To delete data:**
```powershell
docker compose down -v
# This removes the volume and all data
```

## Troubleshooting

### Port Already in Use

```powershell
# Windows: Kill process using port 8000
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process

# Or modify ports in docker compose.yaml
ports:
  - "9000:8000"  # Map external 9000 to container 8000
```

### Database Connection Refused

```powershell
# Check database logs
docker compose logs db

# Verify database is healthy
docker compose ps db
# Should show: "db ... Up (healthy)"

# Restart database
docker compose restart db
```

### Frontend Cannot Reach Backend

```powershell
# Check nginx configuration
docker compose exec frontend nginx -t

# Check backend is running
docker compose ps backend

# Test connectivity from frontend
docker compose exec frontend ping backend
```

### Alembic Migration Fails

```powershell
# Check database logs
docker compose logs db

# Check if database is ready
docker compose logs backend | grep "alembic"

# Manually run migrations
docker compose exec backend alembic upgrade head
```

### Container Exits Immediately

```powershell
# Check logs
docker compose logs <service-name>

# Common issues:
# - Port already in use
# - Missing dependencies
# - Database not ready
# - Configuration error
```

## Production Considerations

### Environment-Specific Configuration

Create separate docker compose files:

```powershell
docker compose -f docker compose.yml -f docker compose.prod.yml up
```

### SSL/TLS

Add reverse proxy like Traefik for HTTPS:

```yaml
services:
  traefik:
    image: traefik:latest
    # SSL configuration here
```

### Monitoring and Logging

Add logging drivers:

```yaml
services:
  backend:
    logging:
      driver: "awslogs"
      options:
        awslogs-group: "/ecs/task-scheduler"
```

### Resource Limits

Limit container resources:

```yaml
services:
  backend:
    mem_limit: 512m
    cpus: 0.5
```

## Image Size Optimization

- Frontend: ~50MB (multi-stage build)
- Backend: ~500MB (Python 3.10-slim)
- Database: ~100MB (PostgreSQL Alpine)

**Total**: ~650MB for all images

## Security Best Practices

1. ✅ Run Nginx as unprivileged user
2. ✅ Don't commit secrets to Git
3. ✅ Use .env files for sensitive data
4. ✅ Implement resource limits
5. ✅ Keep base images updated
6. ✅ Scan images for vulnerabilities
7. ✅ Use read-only volumes where possible
8. ✅ Implement network policies

## Related Documentation

- See [docs/CORS.md](./CORS.md) for API proxy and CORS configuration
- See [docs/DOCUMENTATION.md](./DOCUMENTATION.md) for complete documentation index

---

**Last Updated**: October 19, 2025
