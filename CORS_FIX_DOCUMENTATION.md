# CORS Fix Documentation

## Overview

This document explains how CORS (Cross-Origin Resource Sharing) issues are avoided in the Task Scheduler application through the use of Nginx as a reverse proxy.

## The Problem

When running the frontend and backend as separate services:
- Frontend runs on `http://localhost:8080`
- Backend API runs on `http://localhost:8000`

Making direct API calls from the frontend to the backend would result in CORS errors because they are on different origins (different ports).

## The Solution

Instead of making direct cross-origin requests, all API calls are routed through the Nginx server that serves the frontend. This is accomplished through:

### 1. Nginx Reverse Proxy Configuration

The `client/nginx.conf` file includes a proxy configuration:

```nginx
location /api/ {
    proxy_pass http://backend:8000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

**How it works:**
- Any request to `http://localhost:8080/api/*` is proxied to `http://backend:8000/*`
- The `/api/` prefix is stripped when forwarding to the backend
- All requests appear to come from the same origin (localhost:8080)
- No CORS headers are needed

### 2. Frontend Configuration

The Vue.js application is configured to use relative URLs:

**In `client/src/main.js`:**
```javascript
import axios from "axios";

axios.defaults.baseURL = '/api';
```

This sets the default base URL for all axios requests to `/api`, which will be:
- Intercepted by Nginx
- Proxied to the backend service
- Avoiding any CORS issues

### 3. API Call Examples

**Before (CORS issues):**
```javascript
// ❌ Direct call to backend - causes CORS error
await axios.get("http://localhost:8000/tasks");
```

**After (No CORS issues):**
```javascript
// ✅ Relative call through nginx proxy - no CORS
await axios.get("/tasks");
// Becomes: http://localhost:8080/api/tasks
// Proxied to: http://backend:8000/tasks
```

## Request Flow Diagram

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
│  - Strips /api prefix                                   │
│  - Proxies to: http://backend:8000/tasks               │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  FastAPI Backend Container :8000                        │
│  - Receives request to /tasks                           │
│  - Processes request                                    │
│  - Returns response                                     │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
                    (Response flows back)
```

## Files Modified for CORS Fix

### 1. Frontend JavaScript Files

All Vue component files were updated to use relative URLs:

- ✅ `client/src/main.js` - Added axios baseURL configuration
- ✅ `client/src/pages/AddTask.vue` - `/tasks` instead of `http://localhost:8000/tasks`
- ✅ `client/src/pages/TaskTable.vue` - `/tasks` instead of `http://localhost:8000/tasks`
- ✅ `client/src/pages/TaskList.vue` - `/tasks` instead of `http://localhost:8000/tasks`
- ✅ `client/src/pages/Scheduler.vue` - `/tasks` instead of `http://localhost:8000/tasks`
- ✅ `client/src/pages/UpdateTask.vue` - `/tasks/:id` instead of `http://localhost:8000/tasks/:id`
- ✅ `client/src/components/SchedulerHeader.vue` - `/tasks` instead of `http://localhost:8000/tasks`
- ✅ `client/src/pages/Login.vue` - `/auth/login` instead of `http://localhost:8000/auth/login`
- ✅ `client/src/pages/Register.vue` - `/auth/register` instead of `http://localhost:8000/auth/register`

### 2. Nginx Configuration

Already configured in `client/nginx.conf` (created during Docker migration).

## Benefits of This Approach

### 1. **No CORS Issues**
- All requests appear to come from the same origin
- No need for CORS headers in the backend
- Simplified security configuration

### 2. **Better Security**
- Backend is not directly exposed to the browser
- All API requests go through a single gateway
- Easy to add authentication, rate limiting, etc.

### 3. **Flexibility**
- Easy to change backend URL without modifying frontend code
- Can add caching, load balancing at the proxy level
- Can route to different backends based on URL patterns

### 4. **Production Ready**
- Same architecture works in development and production
- No environment-specific CORS configuration needed
- Follows industry best practices

## Testing the Fix

### 1. Start the Application
```powershell
docker-compose up --build
```

### 2. Open Browser DevTools
- Navigate to http://localhost:8080
- Open the Network tab

### 3. Test an API Call
- Add a new task or view the task list
- Observe the request in Network tab:
  - Request URL: `http://localhost:8080/api/tasks`
  - No CORS errors in console
  - Successful response

### 4. Verify Proxy Headers
Check the request headers to see the proxy headers added by Nginx:
```
X-Real-IP: <client IP>
X-Forwarded-For: <client IP>
X-Forwarded-Proto: http
```

## Troubleshooting

### Issue: 404 Not Found on API Calls

**Possible Causes:**
1. Nginx configuration not loaded
2. Backend service not running

**Solution:**
```powershell
# Check nginx config syntax
docker-compose exec frontend nginx -t

# Check backend is running
docker-compose ps backend

# View logs
docker-compose logs frontend
docker-compose logs backend
```

### Issue: 502 Bad Gateway

**Cause:** Nginx can't reach the backend service

**Solution:**
```powershell
# Check backend health
docker-compose exec backend curl http://localhost:8000/docs

# Check docker network
docker-compose exec frontend ping backend

# Restart services
docker-compose restart
```

### Issue: Changes Not Reflected

**Cause:** Browser cache or old container images

**Solution:**
```powershell
# Clear browser cache and hard refresh (Ctrl+Shift+R)

# Rebuild containers
docker-compose down
docker-compose up --build
```

## Additional Notes

### Why Not Use CORS Headers?

While you could configure CORS headers in the FastAPI backend:

```python
# This approach is NOT used in this project
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**We use Nginx proxy instead because:**
1. ✅ More secure (backend not directly exposed)
2. ✅ Production-ready architecture
3. ✅ No environment-specific configuration
4. ✅ Industry best practice
5. ✅ Easy to add more features (caching, rate limiting, etc.)

### Docker Service Names

In Docker Compose, services can reference each other by name:
- `backend` - The backend service name
- Nginx uses `http://backend:8000` to connect
- Docker's internal DNS resolves this to the backend container's IP

### Production Considerations

For production deployment:

1. **Use HTTPS:** Add SSL/TLS termination at the Nginx level
2. **Environment Variables:** Use different backend URLs per environment
3. **Rate Limiting:** Add rate limiting in nginx configuration
4. **Caching:** Enable caching for GET requests
5. **Compression:** Enable gzip compression for responses

## Conclusion

The Task Scheduler application now uses a proper reverse proxy architecture to avoid CORS issues. All API requests are routed through Nginx, which proxies them to the backend service. This approach is secure, scalable, and production-ready.
