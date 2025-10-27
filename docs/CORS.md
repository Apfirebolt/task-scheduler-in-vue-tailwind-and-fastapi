# CORS & API Reverse Proxy Configuration

This document explains how CORS (Cross-Origin Resource Sharing) issues are avoided in the Task Scheduler application through the use of Nginx as a reverse proxy.

## Overview

CORS is a mechanism that restricts HTTP requests made from one origin to another. In the Task Scheduler, the frontend and backend run on different ports, which would normally cause CORS errors. This document explains how Nginx eliminates CORS issues.

## The Problem

### Separate Origins

When running the application with separate services:
- **Frontend URL**: `http://localhost:8080`
- **Backend API**: `http://localhost:8000`

### Direct API Calls (CORS Error)

If the frontend made direct API calls:

```javascript
// ❌ This causes CORS errors
await axios.get("http://localhost:8000/tasks");
```

**Why CORS Error Occurs:**
1. Browser detects request to different origin (different port)
2. Browser sends CORS preflight request (OPTIONS)
3. Backend must allow CORS headers
4. If not configured, browser blocks the response
5. Users see "CORS error" in console

## The Solution: Nginx Reverse Proxy

### How It Works

Instead of direct cross-origin requests, all API calls are routed through Nginx:

```
Browser Request → http://localhost:8080/api/tasks
     ↓
Nginx Gateway (Port 8080)
- Recognizes /api/ path
- Strips /api prefix
- Proxies to backend
     ↓
Backend Service → http://backend:8000/tasks
     ↓
Response returns to browser
From same origin (localhost:8080)
No CORS errors! ✅
```

### Configuration

#### Nginx Reverse Proxy (`client/nginx.conf`)

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

**How Each Part Works:**

| Part | Purpose |
|------|---------|
| `location /api/` | Matches all requests starting with /api/ |
| `proxy_pass http://backend:8000/;` | Forwards request to backend, strips /api/ prefix |
| `proxy_set_header Host` | Preserves original host header |
| `proxy_set_header X-Real-IP` | Tells backend the real client IP |
| `proxy_set_header X-Forwarded-For` | Preserves client IP in chain |
| `proxy_set_header X-Forwarded-Proto` | Tells backend about original protocol |

#### Frontend Configuration (`client/src/main.js`)

```javascript
import axios from "axios";

// Set default base URL for all axios requests
axios.defaults.baseURL = '/api';
```

**What This Does:**
- All axios requests automatically prepend `/api`
- Example: `axios.get('/tasks')` becomes `/api/tasks`
- Nginx intercepts and proxies to backend

## Request Flow Diagrams

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Browser                                                │
│  Makes request to: http://localhost:8080/api/tasks     │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  Nginx (Frontend Container) :8080                       │
│  - Receives request to /api/tasks                       │
│  - Matches location /api/ pattern                       │
│  - Strips /api prefix (leaves /tasks)                   │
│  - Proxies to: http://backend:8000/tasks               │
│  - Adds proxy headers                                   │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  FastAPI Backend Container :8000                        │
│  - Receives request to /tasks                           │
│  - Processes request                                    │
│  - Queries database                                     │
│  - Returns response                                     │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
                    (Response flows back through Nginx)
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  Browser                                                │
│  Receives response from same origin                     │
│  No CORS errors!                                        │
└─────────────────────────────────────────────────────────┘
```

### Comparison: With vs Without Proxy

#### ❌ Without Reverse Proxy (CORS Issues)

```
Browser                  Frontend            Backend
  │                         │                  │
  │─── GET /tasks ──────────│                  │
  │                         │──GET /tasks─────>│
  │                         │                  │
  │                    Cross-Origin            │
  │                    Request!                │
  │                    (CORS Error)            │
  │                         │<─ CORS Check ────│
  │                         │                  │
  │<─ Blocked Response ─────│                  │
  │  (Browser blocks)       │                  │
```

#### ✅ With Reverse Proxy (No CORS)

```
Browser              Nginx               Backend
  │                   │                    │
  │─GET /api/tasks ──>│                    │
  │                   │ (strips /api)      │
  │                   │─GET /tasks────────>│
  │                   │                    │
  │                   │                 (Process)
  │                   │<─ Response ────────│
  │<─ Response ───────│                    │
  │ (Same Origin!)    │                    │
  │ (No CORS error)   │                    │
```

## Files Modified for CORS Fix

### 1. Frontend Configuration

**`client/src/main.js`**
```javascript
import axios from "axios";

axios.defaults.baseURL = '/api';
```

### 2. Vue Components (Updated from absolute to relative URLs)

All components updated to use relative URLs instead of `http://localhost:8000`:

| Component | Old URL Pattern | New URL Pattern |
|-----------|-----------------|-----------------|
| `AddTask.vue` | `http://localhost:8000/tasks` | `/tasks` |
| `TaskTable.vue` | `http://localhost:8000/tasks` | `/tasks` |
| `TaskList.vue` | `http://localhost:8000/tasks` | `/tasks` |
| `Scheduler.vue` | `http://localhost:8000/tasks` | `/tasks` |
| `SchedulerHeader.vue` | `http://localhost:8000/tasks` | `/tasks` |
| `UpdateTask.vue` | `http://localhost:8000/tasks/:id` | `/tasks/:id` |
| `Login.vue` | `http://localhost:8000/auth/login` | `/auth/login` |
| `Register.vue` | `http://localhost:8000/auth/register` | `/auth/register` |

### 3. Nginx Configuration

**`client/nginx.conf`** (already created during Docker setup)
- Includes proxy configuration
- SPA routing support
- Static asset caching

## API Endpoint Examples

### Original (Direct Calls)
```javascript
// Before - causes CORS errors
axios.get("http://localhost:8000/tasks")
axios.post("http://localhost:8000/tasks", data)
axios.get("http://localhost:8000/tasks/123")
axios.patch("http://localhost:8000/tasks/123", data)
axios.delete("http://localhost:8000/tasks/123")
```

### Updated (Through Proxy)
```javascript
// After - no CORS issues
axios.get("/tasks")
axios.post("/tasks", data)
axios.get("/tasks/123")
axios.patch("/tasks/123", data)
axios.delete("/tasks/123")

// With baseURL set, these become:
// GET http://localhost:8080/api/tasks
// POST http://localhost:8080/api/tasks
// etc.
```

## Benefits of Reverse Proxy Approach

### 1. No CORS Issues
- ✅ All requests appear same-origin
- ✅ No CORS headers needed
- ✅ No browser preflight requests
- ✅ Simplified security configuration

### 2. Better Security
- ✅ Backend not directly exposed to browser
- ✅ All API requests go through single gateway
- ✅ Easy to add authentication/rate limiting
- ✅ Can hide internal architecture

### 3. Flexibility
- ✅ Change backend URL without modifying frontend
- ✅ Add caching/load balancing at proxy
- ✅ Route to different backends
- ✅ Implement request logging/monitoring

### 4. Production Ready
- ✅ Same architecture works everywhere
- ✅ No environment-specific CORS config
- ✅ Industry best practice
- ✅ Scalable architecture

## Testing the CORS Fix

### 1. Start the Application

```powershell
docker compose up --build
```

### 2. Open Browser DevTools

- Navigate to http://localhost:8080
- Open DevTools (F12)
- Go to Network tab

### 3. Test API Calls

- Add a new task
- View the task list
- Edit a task
- Delete a task

### 4. Observe Requests

In Network tab, you should see:

| Column | Value |
|--------|-------|
| URL | `http://localhost:8080/api/tasks` |
| Method | GET, POST, PATCH, DELETE |
| Status | 200, 201, etc. (success codes) |
| Type | xhr (XMLHttpRequest) |

### 5. Check for Errors

- ✅ No CORS errors in Console
- ✅ Requests show as `http://localhost:8080/api/*`
- ✅ Responses load successfully
- ✅ Application functions normally

### 6. Verify Proxy Headers

In Network tab, click on a request:
- Go to Request Headers section
- Look for headers added by Nginx:

```
X-Real-IP: 127.0.0.1
X-Forwarded-For: 127.0.0.1
X-Forwarded-Proto: http
```

## Troubleshooting

### Issue: 404 Not Found on API Calls

**Symptoms:**
- Network tab shows 404 responses
- API calls fail

**Possible Causes:**
1. Nginx configuration not loaded
2. Backend service not running
3. Endpoint doesn't exist

**Solutions:**
```powershell
# Check nginx config syntax
docker compose exec frontend nginx -t

# Check backend is running
docker compose ps backend

# View nginx config
docker compose exec frontend cat /etc/nginx/nginx.conf

# Check backend API
curl http://localhost:8000/docs
```

### Issue: 502 Bad Gateway

**Symptoms:**
- Network tab shows 502 responses
- Requests fail immediately

**Possible Causes:**
- Nginx can't reach backend
- Backend not started
- Wrong service name

**Solutions:**
```powershell
# Check backend health
docker compose exec backend curl http://localhost:8000/docs

# Check docker network
docker compose exec frontend ping backend

# View backend logs
docker compose logs backend

# Restart services
docker compose restart
```

### Issue: Changes Not Reflected

**Symptoms:**
- Code changes don't appear in browser
- Old behavior persists

**Possible Causes:**
- Browser cache
- Old container images

**Solutions:**
```powershell
# Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

# Rebuild containers
docker compose down
docker compose up --build

# View fresh logs
docker compose logs -f frontend
```

### Issue: CORS Errors Still Appear

**Symptoms:**
- Console shows CORS errors
- Requests fail with CORS message

**Check:**
1. Is axios baseURL set in main.js? `axios.defaults.baseURL = '/api'`
2. Are all components using relative URLs?
3. Is Nginx proxy_pass configured?

**Solutions:**
```powershell
# Check frontend config
docker compose exec frontend grep -r "localhost:8000" /usr/share/nginx/html

# Verify nginx config
docker compose exec frontend nginx -T | grep "proxy_pass"

# Rebuild frontend
docker compose rebuild frontend
docker compose up frontend
```

## Why Not Use CORS Headers?

### Alternative Approach (Not Used)

You could configure CORS headers in FastAPI:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Why We Don't Use This Approach

1. **Requires Backend Changes** - Every environment needs different origin URLs
2. **Less Secure** - Backend is directly exposed to browser
3. **More Complex** - Multiple origin configurations needed
4. **Not Production Pattern** - Real-world uses reverse proxy
5. **Browser Overhead** - Preflight requests for every complex operation

## Docker Service Names

In Docker Compose, services can reference each other by name:

```yaml
services:
  backend:
    # This service is called "backend"
    
  frontend:
    # Can access backend at: http://backend:8000
    # Docker's internal DNS resolves this
```

**How It Works:**
- Docker Compose creates an internal network
- Each service is registered as a DNS name
- Services can communicate using service names
- Not accessible from host machine directly (internal only)

## Production Deployment

### Nginx Reverse Proxy (Recommended)

```nginx
location /api/ {
    proxy_pass http://backend:8000/;
    # ... proxy headers ...
}
```

### Rate Limiting

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

location /api/ {
    limit_req zone=api_limit burst=20;
    proxy_pass http://backend:8000/;
}
```

### Caching

```nginx
location /api/tasks {
    proxy_cache_valid 200 1m;
    proxy_pass http://backend:8000/;
}
```

### SSL/TLS

Use a reverse proxy like Traefik:

```yaml
services:
  traefik:
    image: traefik:latest
    # SSL configuration
    
  frontend:
    labels:
      - "traefik.http.routers.frontend.rule=Host(`example.com`)"
```

## Related Documentation

- See [docs/deployment/DOCKER.md](./deployment/DOCKER.md) for Docker configuration
- See [docs/DOCUMENTATION.md](./DOCUMENTATION.md) for complete documentation index

## Summary

The Task Scheduler uses Nginx as a reverse proxy to:
- ✅ Eliminate CORS issues
- ✅ Provide better security
- ✅ Enable flexible scaling
- ✅ Follow industry best practices
- ✅ Simplify deployment

All API requests go through `/api/*` paths, which Nginx proxies to the backend without exposing it directly to the browser.

---

**Last Updated**: October 19, 2025
