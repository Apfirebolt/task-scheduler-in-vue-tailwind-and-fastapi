# Testing Troubleshooting Guide

This guide provides solutions to common issues encountered when running tests for the Task Scheduler application.

## Table of Contents

- [Backend Testing Issues](#backend-testing-issues)
- [Frontend Testing Issues](#frontend-testing-issues)
- [E2E Testing Issues](#e2e-testing-issues)
- [CI/CD Pipeline Issues](#cicd-pipeline-issues)
- [Docker-Related Issues](#docker-related-issues)
- [Database Issues](#database-issues)
- [Environment Configuration Issues](#environment-configuration-issues)
- [Performance Issues](#performance-issues)
- [Coverage Issues](#coverage-issues)
- [Mocking Issues](#mocking-issues)
- [Debugging Techniques](#debugging-techniques)

## Backend Testing Issues

### Database Connection Errors

#### Problem
```
sqlalchemy.exc.OperationalError: (sqlite3.OperationalError) unable to open database file
```

#### Solutions

**1. Check Database File Permissions**
```bash
# Check if test.db exists and has proper permissions
ls -la test.db

# Remove corrupted test database
rm test.db

# Run tests again (will create fresh database)
pytest
```

**2. Verify Database URL Configuration**
```bash
# Check current database URL
echo $DATABASE_URL
echo $TEST_DATABASE_URL

# Set correct database URL for testing
export TEST_DATABASE_URL="sqlite:///./test.db"
pytest --tb=short
```

**3. Fix SQLite Lock Issues**
```python
# In tests/conftest.py, ensure proper cleanup
@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test"""
    engine = create_engine(
        "sqlite:///./test.db",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    model.Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()

    try:
        yield session
    finally:
        session.close()
        model.Base.metadata.drop_all(bind=engine)
```

### Import and Module Path Issues

#### Problem
```
ModuleNotFoundError: No module named 'backend.tasks'
```

#### Solutions

**1. Check PYTHONPATH**
```bash
# Add project root to Python path
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Or add to test file
import sys
from pathlib import Path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))
```

**2. Verify Project Structure**
```bash
# Check if backend module exists
ls -la backend/
ls -la backend/tasks/

# Verify __init__.py files exist
ls -la backend/__init__.py
ls -la backend/tasks/__init__.py
```

**3. Run from Project Root**
```bash
# Always run tests from project root
pytest tests/
# NOT: cd tests && pytest
```

### Async Function Testing Issues

#### Problem
```
RuntimeError: asyncio.run() cannot be called from a running event loop
```

#### Solutions

**1. Use Proper Async Test Decorator**
```python
import pytest
import asyncio

@pytest.mark.asyncio
async def test_async_function():
    result = await some_async_function()
    assert result.success is True
```

**2. Configure Pytest for Async**
```ini
# pytest.ini
[tool:pytest]
asyncio_mode = auto
```

**3. Use Async Test Client**
```python
from httpx import AsyncClient
import pytest

@pytest.mark.asyncio
async def test_async_endpoint():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/tasks/", json=task_data)
    assert response.status_code == 201
```

### Test Isolation Issues

#### Problem
Tests are sharing state or data between runs.

#### Solutions

**1. Ensure Proper Test Isolation**
```python
@pytest.fixture(autouse=True)
def cleanup_database():
    """Automatic cleanup after each test"""
    yield
    # Cleanup code here

@pytest.fixture(scope="function")
def fresh_db_session():
    """Create fresh database for each test"""
    # Create and return fresh session
    pass
```

**2. Clear Mocks Between Tests**
```python
import pytest
from unittest.mock import patch

@pytest.fixture(autouse=True)
def cleanup_mocks():
    """Cleanup mocks after each test"""
    yield
    patch.stopall()
```

### Missing Dependencies

#### Problem
```
ImportError: No module named 'pytest_asyncio'
```

#### Solutions

**1. Install Missing Dependencies**
```bash
pip install pytest-asyncio pytest-cov factory-boy

# Or install all requirements
pip install -r requirements.txt
```

**2. Update requirements.txt**
```txt
# Add to requirements.txt
pytest-asyncio>=0.21.0
pytest-cov>=4.0.0
factory-boy>=3.2.0
httpx>=0.24.0
```

## Frontend Testing Issues

### Component Mounting Failures

#### Problem
```
ReferenceError: window is not defined
```

#### Solutions

**1. Check Test Environment Configuration**
```typescript
// client/vitest.config.ts
export default defineConfig({
  test: {
    environment: 'happy-dom', // or 'jsdom'
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  }
})
```

**2. Ensure Proper Global Setup**
```typescript
// client/tests/setup.ts
import { vi } from 'vitest'

// Mock browser APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
```

### Vue Router Issues

#### Problem
```
TypeError: Cannot read properties of undefined (reading 'params')
```

#### Solutions

**1. Mock Vue Router Properly**
```typescript
// client/tests/setup.ts
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  useRoute: () => ({
    params: { id: '123' },
    query: { filter: 'active' },
    path: '/tasks/123',
    fullPath: '/tasks/123?filter=active',
    name: 'TaskDetail',
  }),
}))
```

**2. Create Test Router Instance**
```typescript
import { createRouter, createWebHistory } from 'vue-router'

const testRouter = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Home' },
    { path: '/tasks/:id', name: 'TaskDetail' }
  ]
})

// Use in tests
const wrapper = mount(TaskDetail, {
  global: {
    plugins: [testRouter]
  }
})
```

### Mock Configuration Issues

#### Problem
Mocks are not working or not being applied correctly.

#### Solutions

**1. Clear Mocks Before Each Test**
```typescript
import { vi } from 'vitest'

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})
```

**2. Verify Mock Setup**
```typescript
import axios from 'axios'
const mockedAxios = axios as any

test('axios mock is working', async () => {
  mockedAxios.get.mockResolvedValue({ data: [] })

  const result = await mockedAxios.get('/api/tasks')
  expect(result.data).toEqual([])
  expect(mockedAxios.get).toHaveBeenCalledWith('/api/tasks')
})
```

**3. Mock Module at Top Level**
```typescript
// Mock at top level of test file
vi.mock('axios')

// Then configure in test
test('specific test', () => {
  const mockedAxios = axios as any
  mockedAxios.get.mockResolvedValue({ data: [] })
})
```

### CSS and Styling Issues

#### Problem
Tests fail due to missing CSS or styling issues.

#### Solutions

**1. Configure CSS Processing**
```typescript
// client/vitest.config.ts
export default defineConfig({
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
})
```

**2. Mock CSS Imports**
```typescript
// client/tests/setup.ts
vi.mock('@/assets/main.css', () => ({}))
vi.mock('tailwindcss/base.css', () => ({}))
vi.mock('tailwindcss/components.css', () => ({}))
vi.mock('tailwindcss/utilities.css', () => ({}))
```

**3. Ignore CSS in Tests**
```bash
# Run tests ignoring CSS files
npx vitest run --exclude "**/*.css"
```

### Timeout Issues

#### Problem
Tests are timing out after 10 seconds.

#### Solutions

**1. Increase Test Timeout**
```typescript
// Increase timeout for specific test
test('slow operation', async () => {
  // test code
}, 30000) // 30 seconds

// Or globally in vitest.config.ts
export default defineConfig({
  test: {
    testTimeout: 30000,
    hookTimeout: 30000,
  }
})
```

**2. Optimize Test Performance**
```typescript
// Use fake timers
import { vi } from 'vitest'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

test('timer-based operation', async () => {
  const promise = someAsyncOperation()
  vi.advanceTimersByTime(1000)
  await promise
})
```

## E2E Testing Issues

### Browser Installation Issues

#### Problem
```
Error: Executable doesn't exist: /path/to/playwright/chromium
```

#### Solutions

**1. Install Playwright Browsers**
```bash
cd client
npx playwright install

# Install specific browsers
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit

# Install with dependencies
npx playwright install-deps
```

**2. Check Browser Installation**
```bash
# Verify installation
npx playwright install --dry-run

# Check installed browsers
npx playwright install --list
```

**3. Reinstall Browsers**
```bash
# Force reinstall
rm -rf ~/.cache/ms-playwright
npx playwright install
```

### Timeout and Wait Issues

#### Problem
Tests fail with timeout errors waiting for elements.

#### Solutions

**1. Increase Timeouts**
```typescript
// Increase global timeout in playwright.config.ts
export default defineConfig({
  timeout: 60000, // 60 seconds
  expect: {
    timeout: 10000, // 10 seconds for assertions
  },
})

// Or increase for specific test
test.setTimeout(60000)
```

**2. Use Proper Wait Strategies**
```typescript
// Wait for specific element
await page.waitForSelector('.task-card', { timeout: 10000 })

// Wait for network idle
await page.waitForLoadState('networkidle')

// Wait for specific condition
await page.waitForFunction(() => {
  return document.querySelectorAll('.task-card').length > 0
})
```

**3. Add Explicit Waits**
```typescript
// Wait for API response
const response = await page.waitForResponse('**/api/tasks/**')

// Wait for navigation
await page.waitForURL('/tasks')

// Wait for element to be visible
await expect(page.locator('.task-card')).toBeVisible()
```

### Selector Issues

#### Problem
Selectors are not finding elements on the page.

#### Solutions

**1. Use Stable Selectors**
```typescript
// Good: Use data-testid attributes
await page.locator('[data-testid="submit-button"]').click()

// Good: Use text-based selectors
await page.locator('text=Submit').click()

// Good: Use role-based selectors
await page.locator('button[name="submit"]').click()

// Avoid: Fragile CSS selectors
await page.locator('.container > div:nth-child(2) > button').click()
```

**2. Debug Selectors**
```typescript
// Find all matching elements
const elements = await page.locator('button').all()
console.log(`Found ${elements.length} buttons`)

// Check if element exists
const exists = await page.locator('.nonexistent').isVisible()
console.log(`Element exists: ${exists}`)

// Take screenshot for debugging
await page.screenshot({ path: 'debug.png' })
```

**3. Use Multiple Selector Strategies**
```typescript
// Try different selectors
const submitButton = page.locator([
  'button[type="submit"]',
  '[data-testid="submit"]',
  'text=Submit',
  'button:has-text("Submit")'
])

await expect(submitButton.first()).toBeVisible()
```

### Application Startup Issues

#### Problem
E2E tests fail because the application isn't ready.

#### Solutions

**1. Add Application Health Check**
```typescript
// client/tests/e2e/setup/global-setup.ts
async function globalSetup() {
  // Wait for application to be ready
  const maxRetries = 30
  const retryDelay = 1000

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch('http://localhost:8080/api/health')
      if (response.ok) {
        console.log('Application is ready')
        return
      }
    } catch (error) {
      console.log(`Application not ready, retrying... (${i + 1}/${maxRetries})`)
      await new Promise(resolve => setTimeout(resolve, retryDelay))
    }
  }

  throw new Error('Application failed to start within expected time')
}
```

**2. Configure Playwright WebServer**
```typescript
// playwright.config.ts
export default defineConfig({
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
```

**3. Manual Application Management**
```bash
# Start application manually
docker compose up -d --build

# Wait for services to be ready
sleep 30

# Run E2E tests
npm run test:e2e

# Cleanup
docker compose down
```

### Docker and Network Issues

#### Problem
E2E tests can't connect to the application running in Docker.

#### Solutions

**1. Check Docker Services**
```bash
# Verify services are running
docker compose ps

# Check service logs
docker compose logs backend
docker compose logs frontend

# Check network connectivity
docker compose exec frontend ping backend
```

**2. Configure Correct Base URL**
```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:8080',
  },
})

// Run with correct URL
BASE_URL=http://localhost:8080 npm run test:e2e
```

**3. Use Docker Network**
```bash
# Run tests inside Docker network
docker compose exec frontend npm run test:e2e

# Or run tests with Docker host
docker run --network task-scheduler_default -it \
  -v $(pwd)/client:/app \
  -w /app \
  node:18 npm run test:e2e
```

## CI/CD Pipeline Issues

### GitHub Actions Failures

#### Problem
Tests are failing in GitHub Actions but passing locally.

#### Solutions

**1. Check Environment Differences**
```yaml
# Add debugging step
- name: Debug environment
  run: |
    echo "Python version: $(python --version)"
    echo "Node version: $(node --version)"
    echo "Working directory: $(pwd)"
    echo "Environment variables:"
    env | sort
```

**2. Verify Dependencies**
```yaml
# Ensure proper dependency installation
- name: Cache pip dependencies
  uses: actions/cache@v3
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
    restore-keys: |
      ${{ runner.os }}-pip-

- name: Install dependencies
  run: |
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    pip list
```

**3. Check Database Setup**
```yaml
# Verify database is ready
- name: Wait for database
  run: |
    timeout 60 bash -c 'until pg_isready -h localhost -p 5432; do sleep 1; done'
    PGPASSWORD=test_password psql -h localhost -U test_user -d test_db -c "SELECT 1;"
```

### Permission Issues

#### Problem
```
Permission denied: ./run_tests.sh
```

#### Solutions

**1. Fix File Permissions**
```bash
# Make script executable
chmod +x run_tests.sh

# Fix all script permissions
find . -name "*.sh" -exec chmod +x {} \;

# Check current permissions
ls -la run_tests.sh
```

**2. Use Direct Commands**
```yaml
# Instead of calling script, use direct commands
- name: Run tests
  run: |
    pytest tests/unit/ -v
    pytest tests/integration/ -v
```

### Artifact Upload Failures

#### Problem
Test artifacts are not being uploaded correctly.

#### Solutions

**1. Check Artifact Paths**
```yaml
# Use absolute paths
- name: Upload test results
  uses: actions/upload-artifact@v3
  if: failure()
  with:
    name: playwright-report
    path: ${{ github.workspace }}/client/playwright-report/
    retention-days: 30
```

**2. Create Artifacts Directory**
```bash
# Ensure directory exists
mkdir -p client/playwright-report

# Run tests
npm run test:e2e

# Check if files exist
ls -la client/playwright-report/
```

## Docker-Related Issues

### Container Build Failures

#### Problem
```
ERROR: Service 'backend' failed to build
```

#### Solutions

**1. Check Dockerfile**
```dockerfile
# Ensure proper base image and working directory
FROM python:3.10-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose correct port
EXPOSE 8000

# Use proper command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**2. Build with Debug Output**
```bash
# Build with verbose output
docker compose build --no-cache --progress=plain

# Check build logs
docker compose build backend
```

**3. Check Dependencies**
```bash
# Verify requirements.txt
cat requirements.txt

# Test installation locally
pip install -r requirements.txt
```

### Container Runtime Issues

#### Problem
Containers start but immediately exit.

#### Solutions

**1. Check Container Logs**
```bash
# Check service logs
docker compose logs backend
docker compose logs frontend

# Follow logs in real-time
docker compose logs -f backend
```

**2. Run Container Interactively**
```bash
# Run backend container interactively
docker compose run backend bash

# Check if application starts manually
cd /app && python -c "import main; print('Import successful')"
```

**3. Check Health Checks**
```yaml
# Add health check to docker compose.yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/docs"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Port Conflicts

#### Problem
```
ERROR: for backend  Cannot start service backend: driver failed programming external connectivity on endpoint
```

#### Solutions

**1. Check Port Usage**
```bash
# Check which ports are in use
netstat -tulpn | grep :8000
lsof -i :8000

# Kill processes using ports
sudo kill -9 $(lsof -t -i:8000)
```

**2. Change Port Mapping**
```yaml
# docker compose.yaml
services:
  backend:
    ports:
      - "8001:8000"  # Use different host port
  frontend:
    ports:
      - "8081:8080"  # Use different host port
```

**3. Stop Conflicting Services**
```bash
# Stop existing containers
docker compose down

# Stop all Docker containers
docker stop $(docker ps -aq)

# Remove all containers
docker rm $(docker ps -aq)
```

## Database Issues

### PostgreSQL Connection Issues

#### Problem
```
psycopg2.OperationalError: could not connect to server: Connection refused
```

#### Solutions

**1. Check Database Service**
```bash
# Check if database is running
docker compose ps db

# Check database logs
docker compose logs db

# Connect to database manually
docker compose exec db psql -U scheduler -d scheduler
```

**2. Verify Database Configuration**
```yaml
# docker compose.yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: scheduler
      POSTGRES_USER: scheduler
      POSTGRES_DB: scheduler
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U scheduler"]
      interval: 10s
      timeout: 5s
      retries: 5
```

**3. Check Environment Variables**
```bash
# Verify database URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

### Migration Issues

#### Problem
Database schema is out of sync with models.

#### Solutions

**1. Run Database Migrations**
```bash
# Run migrations in Docker
docker compose exec backend alembic upgrade head

# Run migrations locally
alembic upgrade head

# Check migration status
alembic current
alembic history
```

**2. Create New Migration**
```bash
# Generate migration
alembic revision --autogenerate -m "description"

# Review generated migration
cat alembic/versions/*.py

# Apply migration
alembic upgrade head
```

**3. Reset Database**
```bash
# Reset database (DESTRUCTIVE)
docker compose exec backend alembic downgrade base
docker compose exec backend alembic upgrade head

# Or recreate database
docker compose down -v
docker compose up -d
docker compose exec backend alembic upgrade head
```

## Environment Configuration Issues

### Missing Environment Variables

#### Problem
Tests fail due to missing environment variables.

#### Solutions

**1. Set Environment Variables**
```bash
# For backend
export DATABASE_URL="postgresql://scheduler:scheduler@localhost:5432/scheduler"
export TEST_DATABASE_URL="sqlite:///./test.db"

# For frontend
export VITE_API_BASE_URL="http://localhost:8000"
export NODE_ENV="test"
```

**2. Use .env Files**
```bash
# Create .env.test file
cp .env.example .env.test

# Edit .env.test with test values
echo "DATABASE_URL=sqlite:///./test.db" >> .env.test

# Load .env.test in tests
import pytest
from dotenv import load_dotenv

load_dotenv('.env.test')
```

**3. Configure in CI/CD**
```yaml
# GitHub Actions
env:
  DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_db
  NODE_ENV: test
```

### Python Path Issues

#### Problem
```
ModuleNotFoundError: No module named 'backend'
```

#### Solutions

**1. Set PYTHONPATH**
```bash
# Add project root to Python path
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Add to pytest.ini
[tool:pytest]
pythonpath = .
```

**2. Use Relative Imports**
```python
# Instead of: from backend.tasks import services
# Use: from ..tasks import services (if in tests/)
# Or adjust sys.path in tests
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
```

**3. Install Package in Development Mode**
```bash
# Install project in development mode
pip install -e .

# This makes the project importable
```

## Performance Issues

### Slow Test Execution

#### Problem
Tests are taking too long to run.

#### Solutions

**1. Run Tests in Parallel**
```bash
# Install pytest-xdist
pip install pytest-xdist

# Run tests in parallel
pytest -n auto

# Use specific number of workers
pytest -n 4
```

**2. Use In-Memory Database**
```python
# Use SQLite in-memory for faster tests
@pytest.fixture(scope="function")
def fast_db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
    )
    # ... rest of fixture
```

**3. Skip Slow Tests**
```bash
# Skip slow tests in CI
pytest -m "not slow"

# Mark slow tests
@pytest.mark.slow
def test_slow_operation():
    pass
```

### Memory Issues

#### Problem
Tests are using too much memory or causing memory leaks.

#### Solutions

**1. Enable Garbage Collection**
```python
import gc

@pytest.fixture(autouse=True)
def cleanup_memory():
    """Force garbage collection between tests"""
    yield
    gc.collect()
```

**2. Use Generators for Large Datasets**
```python
def generate_test_data(count):
    for i in range(count):
        yield {"title": f"Task {i}", "status": "pending"}

# Use in tests
for task_data in generate_test_data(1000):
    # Process task
    pass
```

**3. Monitor Memory Usage**
```python
import psutil
import pytest

@pytest.mark.slow
def test_memory_usage():
    process = psutil.Process()
    initial_memory = process.memory_info().rss

    # Run operation
    # ...

    final_memory = process.memory_info().rss
    memory_increase = final_memory - initial_memory

    assert memory_increase < 100 * 1024 * 1024  # Less than 100MB
```

## Coverage Issues

### Low Coverage Reports

#### Problem
Coverage reports show unexpectedly low coverage.

#### Solutions

**1. Check Coverage Configuration**
```ini
# pytest.ini or setup.cfg
[tool:pytest]
addopts = --cov=backend --cov-report=html --cov-report=term

# Make sure correct module is specified
addopts = --cov=backend.tasks --cov-report=html
```

**2. Verify Test Discovery**
```bash
# Check which tests are being discovered
pytest --collect-only

# Check specific test files
pytest --collect-only tests/unit/test_services.py
```

**3. Exclude Test Files from Coverage**
```python
# pytest.ini
[tool:pytest]
addopts = --cov=backend --cov-report=html --cov-fail-under=90
# Ensure tests/ directory is excluded
```

### Coverage Upload Failures

#### Problem
Coverage reports are not being uploaded to Codecov.

#### Solutions

**1. Check Codecov Configuration**
```yaml
# GitHub Actions
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage.xml
    flags: backend
    name: backend-coverage
    fail_ci_if_error: false
```

**2. Generate Correct Coverage Format**
```bash
# Generate XML coverage for Codecov
pytest --cov=backend --cov-report=xml --cov-report=html

# Check if file exists
ls -la coverage.xml
```

**3. Set Codecov Token**
```bash
# Set Codecov token in GitHub Secrets
# Repository Settings > Secrets > Actions > New repository secret
# Name: CODECOV_TOKEN
```

## Mocking Issues

### Mocks Not Working

#### Problem
Mocked functions are still calling real implementations.

#### Solutions

**1. Check Mock Import Order**
```python
# Import before mocking
from unittest.mock import patch

# Mock before importing the module that uses it
with patch('module.function'):
    from module import another_function
```

**2. Use Correct Mock Path**
```python
# Mock where the function is used, not where it's defined
# WRONG: patch('module.function')
# CORRECT: patch('using_module.function')

with patch('backend.tasks.services.create_task'):
    # Test code that calls services.create_task
```

**3. Verify Mock Setup**
```python
from unittest.mock import MagicMock, patch

def test_mock_verification():
    with patch('module.function') as mock_function:
        mock_function.return_value = "mocked_value"

        result = some_function_that_uses_module_function()

        assert result == "mocked_value"
        mock_function.assert_called_once()
```

### Async Function Mocking

#### Problem
Async functions are not being mocked correctly.

#### Solutions

**1. Use AsyncMock**
```python
from unittest.mock import AsyncMock, patch

@patch('module.async_function')
async def test_async_mock(mock_async_function):
    mock_async_function.return_value = "async_result"

    result = await module.async_function()

    assert result == "async_result"
    mock_async_function.assert_called_once()
```

**2. Mock Async Context Managers**
```python
@patch('module.async_context_manager')
async def test_async_context_manager(mock_context_manager):
    mock_context_manager.return_value.__aenter__.return_value = "context_value"
    mock_context_manager.return_value.__aexit__ = AsyncMock(return_value=None)

    async with module.async_context_manager() as context:
        assert context == "context_value"
```

## Debugging Techniques

### Backend Debugging

**1. Use Pytest Debugger**
```bash
# Run tests with pdb
pytest --pdb

# Stop on first failure and open debugger
pytest -x --pdb

# Show local variables on failure
pytest -l

# Run with verbose output
pytest -v -s
```

**2. Add Debug Prints**
```python
def test_with_debug():
    print("Debug: Starting test")
    result = some_function()
    print(f"Debug: Result = {result}")
    assert result.success
```

**3. Use Logging**
```python
import logging

logging.basicConfig(level=logging.DEBUG)

def test_with_logging():
    logging.debug("Starting test")
    # Test code
    logging.info("Test completed")
```

### Frontend Debugging

**1. Use Browser DevTools**
```typescript
// Add debugger statement
test('component test', () => {
  debugger  // Browser will stop here
  const wrapper = mount(MyComponent)
  // Test code
})
```

**2. Use Console Logging**
```typescript
test('component test', () => {
  console.log('Debug: Starting test')
  const wrapper = mount(MyComponent)
  console.log('Debug: Wrapper HTML:', wrapper.html())
  // Test code
})
```

**3. Run Tests in Watch Mode**
```bash
# Run tests with UI
npm run test:ui

# Run in watch mode
npm run test:watch
```

### E2E Debugging

**1. Run with Headed Browser**
```bash
# Run tests with visible browser
npm run test:e2e:headed

# Run with specific browser
npm run test:e2e:chrome -- --headed
```

**2. Use Playwright Debugger**
```bash
# Run with debugger
npm run test:e2e:debug

# Enable trace files
npm run test:e2e -- --trace on
```

**3. Take Screenshots**
```typescript
// Take screenshot on failure
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await page.screenshot({
      path: `failure-${testInfo.title}.png`,
      fullPage: true
    })
  }
})
```

**4. Generate HTML Reports**
```bash
# Generate detailed HTML report
npm run test:e2e:report

# View report
open playwright-report/index.html
```

## Getting Help

### Community Resources

1. **GitHub Issues**: Report bugs and ask questions
2. **Documentation**: Check main documentation files
3. **Test Framework Docs**:
   - [Pytest Documentation](https://docs.pytest.org/)
   - [Vitest Documentation](https://vitest.dev/)
   - [Playwright Documentation](https://playwright.dev/)

### Creating Bug Reports

When reporting issues, include:

1. **Environment**: OS, Python/Node versions, Docker version
2. **Error Messages**: Full error stack traces
3. **Steps to Reproduce**: Detailed reproduction steps
4. **Expected vs Actual**: What you expected vs what happened
5. **Minimal Example**: Smallest code that reproduces the issue

### Debug Checklist

- [ ] Check error messages and stack traces
- [ ] Verify environment variables and configuration
- [ ] Run tests locally vs CI environment
- [ ] Check dependency versions
- [ ] Verify file permissions and paths
- [ ] Use debugging tools and breakpoints
- [ ] Check logs for additional context
- [ ] Try minimal reproduction case

This troubleshooting guide should help resolve most common testing issues. For additional help, refer to the main documentation or create an issue in the project repository.