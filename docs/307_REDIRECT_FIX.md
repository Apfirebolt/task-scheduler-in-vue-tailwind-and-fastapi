# Understanding and Fixing 307 Redirect Issues

## The Problem

You were getting **307 Temporary Redirect** responses when making API requests:

```
backend-1   | INFO:     172.19.0.4:45526 - "GET /tasks HTTP/1.0" 307 Temporary Redirect
frontend-1  | 172.19.0.1 - - [19/Oct/2025:15:21:33 +0000] "GET /api/tasks HTTP/1.1" 307 0
```

## Why This Happens

### FastAPI Router Configuration

In `backend/tasks/router.py`, the router is configured as:

```python
router = APIRouter(
    tags=["Task"],
    prefix='/tasks'
)

@router.get('/', status_code=status.HTTP_200_OK)
async def task_list(database: Session = Depends(db.get_db)):
    # ...
```

This creates routes like:
- `GET /tasks/` (with trailing slash)
- `POST /tasks/` (with trailing slash)
- `GET /tasks/{task_id}` (no trailing slash needed for parameterized routes)

### The URL Flow

1. **Frontend** → Makes request to: `/api/tasks` (no trailing slash)
2. **Nginx** → Proxies to backend: `/tasks` (no trailing slash)
3. **FastAPI** → Expected route: `/tasks/` (with trailing slash)
4. **Result** → 307 Redirect from `/tasks` to `/tasks/`

### Why 307 Causes Issues

1. **Performance**: Extra round-trip for every API call
2. **CORS Problems**: Redirects can cause CORS errors if not properly configured
3. **Browser Behavior**: Some browsers handle redirects differently for POST/PATCH/DELETE

## The Solution

We added trailing slashes to **all axios API calls** in the Vue.js frontend:

### Files Updated

1. **client/src/pages/AddTask.vue**
   ```javascript
   // Before
   await axios.post('/tasks', taskData.value)
   
   // After
   await axios.post('/tasks/', taskData.value)
   ```

2. **client/src/pages/TaskTable.vue**
   ```javascript
   // Before
   await axios.get("/tasks")
   
   // After
   await axios.get("/tasks/")
   ```

3. **client/src/pages/TaskList.vue**
   ```javascript
   // Before
   await axios.get("/tasks")
   
   // After
   await axios.get("/tasks/")
   ```

4. **client/src/pages/Scheduler.vue**
   ```javascript
   // Before
   await axios.get("/tasks")
   
   // After
   await axios.get("/tasks/")
   ```

5. **client/src/components/SchedulerHeader.vue**
   ```javascript
   // Before
   await axios.get("/tasks")
   
   // After
   await axios.get("/tasks/")
   ```

### PowerShell Testing

When testing with PowerShell, ensure you include the trailing slash:

```powershell
# Correct - with trailing slash
Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:8080/api/tasks/" `
-WebSession $session

# Incorrect - without trailing slash (causes 307 redirect)
Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:8080/api/tasks" `
-WebSession $session
```

## Alternative Solutions

If you prefer not to add trailing slashes everywhere, you could:

### Option 1: Change Router Definitions

Modify `backend/tasks/router.py`:

```python
router = APIRouter(
    tags=["Task"],
    prefix='/tasks'
)

# Change from '/' to ''
@router.get('', status_code=status.HTTP_200_OK)  # Now /tasks
@router.post('', status_code=status.HTTP_201_CREATED)  # Now /tasks
```

**Pros**: No trailing slashes needed in frontend
**Cons**: Routes become `/tasks` instead of `/tasks/`, which is less RESTful

### Option 2: Configure Both Routes

Use FastAPI to accept both with and without trailing slash:

```python
@router.get('', status_code=status.HTTP_200_OK)
@router.get('/', status_code=status.HTTP_200_OK)
async def task_list(database: Session = Depends(db.get_db)):
    # ...
```

**Pros**: Maximum flexibility
**Cons**: Code duplication, not recommended

## Best Practices

1. **Be Consistent**: Always use trailing slashes for collection endpoints (`/tasks/`)
2. **Follow REST Conventions**: 
   - Collection: `/tasks/` (with slash)
   - Resource: `/tasks/123` (no slash)
3. **Test with cURL or PowerShell**: Verify endpoints before integrating with frontend

## Verification

After the fix, you should see successful requests:

```
backend-1   | INFO:     172.19.0.4:45526 - "GET /tasks/ HTTP/1.0" 200 OK
frontend-1  | 172.19.0.1 - - [19/Oct/2025:15:23:53 +0000] "GET /api/tasks/ HTTP/1.1" 200
```

No more 307 redirects! ✅
