# Comprehensive Testing Guide

This document provides complete testing guidelines for the Task Scheduler application, covering all testing layers from unit to end-to-end testing.

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Backend Testing](#backend-testing)
- [Frontend Testing](#frontend-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Test Coverage](#test-coverage)
- [CI/CD Pipeline](#cicd-pipeline)
- [Environment Configuration](#environment-configuration)
- [Test Data Management](#test-data-management)
- [Mocking Strategies](#mocking-strategies)
- [Performance Testing](#performance-testing)
- [Security Testing](#security-testing)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Contributing Guidelines](#contributing-guidelines)

## Overview

The testing strategy employs a comprehensive multi-layer approach:

### Testing Pyramid

```
    ┌─────────────────────┐
    │   E2E Tests (10%)   │ ← Critical user workflows
    │    Playwright       │
    └─────────────────────┘
  ┌─────────────────────────┐
  │  Integration Tests (20%)│ ← API endpoints, component
  │   FastAPI + Vitest      │   interactions
  └─────────────────────────┘
┌─────────────────────────────────┐
│   Unit Tests (70%)               │ ← Business logic, utilities,
│  pytest + Vitest                │   individual functions
└─────────────────────────────────┘
```

### Testing Categories

1. **Unit Tests** (70%)
   - Test individual functions, methods, and components
   - Fast execution, isolated testing
   - Framework: pytest (backend), Vitest (frontend)

2. **Integration Tests** (20%)
   - Test API endpoints and component interactions
   - Database integration testing
   - Framework: FastAPI TestClient, Vue Test Utils

3. **End-to-End Tests** (10%)
   - Test complete user workflows
   - Cross-browser testing
   - Framework: Playwright

4. **Security & Quality Tests**
   - Code vulnerability scanning
   - Linting and formatting checks
   - Performance monitoring

## Project Structure

```
task-scheduler/
├── .github/workflows/
│   └── test.yml                  # CI/CD pipeline configuration
├── tests/                        # Backend testing
│   ├── conftest.py               # Pytest configuration and fixtures
│   ├── database.py               # Database testing utilities
│   ├── mocks.py                  # Mock objects and utilities
│   ├── unit/                     # Backend unit tests
│   │   ├── test_services.py      # Service layer tests
│   │   └── test_schemas.py       # Pydantic schema tests
│   └── integration/              # Backend integration tests
│       └── test_api.py           # API endpoint tests
├── client/
│   ├── tests/                    # Frontend testing
│   │   ├── setup.ts              # Vitest global setup
│   │   ├── utils/                # Testing utilities
│   │   │   ├── test-utils.ts     # Helper functions
│   │   │   └── factories.ts      # Test data factories
│   │   ├── unit/                 # Unit and component tests
│   │   │   ├── test-utils.test.ts
│   │   │   ├── setup.test.ts
│   │   │   └── components/       # Component tests
│   │   │       ├── Header.test.ts
│   │   │       ├── Footer.test.ts
│   │   │       ├── Loader.test.ts
│   │   │       └── SchedulerHeader.test.ts
│   │   │   └── pages/            # Page component tests
│   │   │       ├── AddTask.test.ts
│   │   │       ├── TaskList.test.ts
│   │   │       ├── Scheduler.test.ts
│   │   │       ├── Login.test.ts
│   │   │       └── ...
│   │   └── e2e/                  # End-to-end tests
│   │       ├── setup/            # E2E setup utilities
│   │       │   ├── global-setup.ts
│   │       │   └── setup.spec.ts
│   │       ├── helpers/          # E2E helper functions
│   │       │   ├── page-helpers.ts
│   │       │   ├── test-data.ts
│   │       │   └── test-utilities.ts
│   │       └── specs/            # E2E test specifications
│   │           ├── home-page.spec.ts
│   │           ├── task-management.spec.ts
│   │           ├── scheduler.spec.ts
│   │           ├── responsive-design.spec.ts
│   │           ├── error-handling.spec.ts
│   │           └── accessibility.spec.ts
│   ├── vitest.config.ts          # Vitest configuration
│   ├── playwright.config.ts      # Playwright configuration
│   └── package.json              # Test scripts and dependencies
├── pytest.ini                    # Pytest configuration
├── requirements.txt              # Python test dependencies
└── docker-compose.yaml           # Test environment setup
```

## Quick Start

### Prerequisites

- **Docker & Docker Compose** (recommended)
- **Python 3.10+**
- **Node.js 18+**
- **Git**

### Running All Tests (Docker)

```bash
# Build and start services
docker-compose up --build

# Run all backend tests
docker-compose exec backend python -m pytest

# Run all frontend tests
docker-compose exec frontend npm run test:run

# Run E2E tests
docker-compose exec frontend npm run test:e2e
```

### Running Tests Locally

```bash
# Backend Tests
pip install -r requirements.txt
pytest --cov=backend

# Frontend Tests
cd client
npm install
npm run test:coverage

# E2E Tests
npm run test:e2e:install
npm run test:e2e
```

### Quick Test Commands

```bash
# Backend - Run only unit tests
pytest tests/unit/ -v

# Backend - Run only integration tests
pytest tests/integration/ -v

# Frontend - Run component tests
npm run test:unit

# E2E - Run only Chrome tests
npm run test:e2e:chrome

# Run with coverage reports
pytest --cov=backend --cov-report=html
npm run test:coverage
```

## Backend Testing

### Running Tests

#### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run all tests with coverage
pytest --cov=backend --cov-report=html --cov-report=term

# Run specific test categories
pytest tests/unit/                    # Unit tests only
pytest tests/integration/             # Integration tests only

# Run with verbose output
pytest -v

# Run tests with specific markers
pytest -m unit                        # Unit tests
pytest -m integration                 # Integration tests
pytest -m database                    # Database tests
pytest -m slow                        # Slow tests

# Run specific test file
pytest tests/unit/test_services.py -v

# Run with specific test function
pytest tests/unit/test_services.py::test_create_task_service -v

# Stop on first failure
pytest -x

# Run failed tests only
pytest --lf

# Show local variables on failure
pytest -l

# Run in parallel (if pytest-xdist installed)
pytest -n auto
```

#### Docker Environment

```bash
# Run backend tests in Docker container
docker-compose exec backend python -m pytest

# Run with coverage in Docker
docker-compose exec backend python -m pytest --cov=backend --cov-report=html

# Run specific test categories in Docker
docker-compose exec backend python -m pytest tests/unit/ -v
```

### Test Configuration

#### Pytest Configuration (pytest.ini)

```ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short --strict-markers --disable-warnings
asyncio_mode = auto
markers =
    unit: Unit tests
    integration: Integration tests
    slow: Slow tests
    database: Tests that require database
```

#### Database Configuration

The test suite uses SQLite in-memory database for fast testing:
- **SQLite**: Used for unit tests (fast, in-memory)
- **PostgreSQL**: Used for integration tests in CI
- **Automatic setup/teardown**: Each test gets a fresh database
- **Dependency injection**: Database sessions injected via fixtures

### Fixtures and Test Data

#### Core Fixtures (tests/conftest.py)

```python
@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test"""
    # Creates tables, yields session, cleans up after test

@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database override"""
    # FastAPI test client with database dependency overridden

@pytest.fixture
def sample_task_data():
    """Sample task data for testing"""
    # Returns dictionary with test task data

@pytest.fixture
def sample_task(db_session):
    """Create a sample task in the database"""
    # Creates and returns actual task model instance
```

### Writing Backend Tests

#### Unit Tests

Unit tests should test business logic in isolation:

```python
import pytest
from datetime import datetime, date
from backend.tasks import services, schema

@pytest.mark.unit
async def test_create_task_service():
    """Test creating a task through service layer"""
    # Arrange
    task_data = schema.TaskBase(
        title="Test Task",
        description="Test Description",
        status="pending",
        dueDate="2024-12-31T00:00:00"
    )

    # Mock database session
    mock_db = AsyncMock()
    mock_db.add.return_value = None
    mock_db.commit.return_value = None
    mock_db.refresh.return_value = None

    # Act
    result = await services.create_new_task(task_data, mock_db)

    # Assert
    assert result.title == "Test Task"
    assert result.status == "pending"
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()

@pytest.mark.unit
async def test_task_validation():
    """Test task schema validation"""
    # Test valid data
    valid_data = {
        "title": "Valid Task",
        "description": "Valid Description",
        "status": "pending",
        "dueDate": "2024-12-31T00:00:00"
    }
    task = schema.TaskCreate(**valid_data)
    assert task.title == "Valid Task"

    # Test invalid data
    invalid_data = {"title": "", "status": "invalid_status"}
    with pytest.raises(ValidationError):
        schema.TaskCreate(**invalid_data)
```

#### Integration Tests

Integration tests test API endpoints with real database:

```python
import pytest
from fastapi.testclient import TestClient

@pytest.mark.integration
def test_create_task_endpoint(client, sample_task_data):
    """Test creating a task via API"""
    # Act
    response = client.post("/tasks/", json=sample_task_data)

    # Assert
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == sample_task_data["title"]
    assert data["id"] is not None
    assert "createdDate" in data

@pytest.mark.integration
def test_get_tasks_endpoint(client, sample_task):
    """Test retrieving tasks via API"""
    # Act
    response = client.get("/tasks/")

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(task["id"] == sample_task.id for task in data)

@pytest.mark.integration
def test_update_task_endpoint(client, sample_task):
    """Test updating a task via API"""
    # Arrange
    update_data = {"title": "Updated Task Title"}

    # Act
    response = client.put(f"/tasks/{sample_task.id}", json=update_data)

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Task Title"

@pytest.mark.integration
def test_delete_task_endpoint(client, sample_task):
    """Test deleting a task via API"""
    # Act
    response = client.delete(f"/tasks/{sample_task.id}")

    # Assert
    assert response.status_code == 204

    # Verify deletion
    get_response = client.get(f"/tasks/{sample_task.id}")
    assert get_response.status_code == 404
```

#### Database Testing

```python
import pytest
from sqlalchemy.orm import Session
from backend.tasks import model

@pytest.mark.database
def test_task_model_creation(db_session: Session):
    """Test Task model creation and database operations"""
    # Arrange
    task = model.Task(
        title="Database Test Task",
        description="Testing database operations",
        status="pending",
        dueDate=datetime(2024, 12, 31)
    )

    # Act
    db_session.add(task)
    db_session.commit()
    db_session.refresh(task)

    # Assert
    assert task.id is not None
    assert task.createdDate is not None

    # Test retrieval
    retrieved = db_session.query(model.Task).filter_by(id=task.id).first()
    assert retrieved is not None
    assert retrieved.title == "Database Test Task"

@pytest.mark.database
def test_task_relationships(db_session: Session):
    """Test task relationships and constraints"""
    # Test creating multiple tasks with different statuses
    tasks = [
        model.Task(title="Task 1", status="pending"),
        model.Task(title="Task 2", status="completed"),
        model.Task(title="Task 3", status="in_progress")
    ]

    for task in tasks:
        db_session.add(task)

    db_session.commit()

    # Test filtering by status
    pending_tasks = db_session.query(model.Task).filter_by(status="pending").all()
    assert len(pending_tasks) == 1
    assert pending_tasks[0].title == "Task 1"
```

### Test Markers

Use pytest markers to categorize tests:

```python
@pytest.mark.unit
def test_business_logic_function():
    """Fast test, no external dependencies"""
    pass

@pytest.mark.integration
def test_api_endpoint():
    """Test API with database"""
    pass

@pytest.mark.database
def test_database_operation():
    """Test requires database setup"""
    pass

@pytest.mark.slow
def test_performance_intensive_operation():
    """Test takes longer to run"""
    pass
```

### Async Testing

For async functions, use proper async test syntax:

```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_async_endpoint():
    """Test async FastAPI endpoint"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/tasks/", json=task_data)
    assert response.status_code == 201

@pytest.mark.asyncio
async def test_async_service_function():
    """Test async service function"""
    result = await services.process_async_task(task_data)
    assert result.success is True
```

## Frontend Testing

### Running Tests

#### Local Development

```bash
cd client

# Install dependencies
npm install

# Run unit tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with UI interface
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run specific test file
npm run test:run -- Header.test.ts

# Run tests matching pattern
npm run test:run -- --grep "Header"
```

#### Docker Environment

```bash
# Run frontend tests in Docker container
docker-compose exec frontend npm run test:run

# Run with coverage in Docker
docker-compose exec frontend npm run test:coverage

# Run specific test files in Docker
docker-compose exec frontend npm run test:run -- Header.test.ts
```

### Test Configuration

#### Vitest Configuration (client/vitest.config.ts)

```typescript
export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx,vue}'],
    exclude: ['node_modules', 'dist', 'tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    }
  }
})
```

#### Global Test Setup (client/tests/setup.ts)

Global setup includes:
- **Axios mocking**: Mock all HTTP requests
- **Vue Router mocking**: Mock navigation and route state
- **Component stubs**: Mock common components like FontAwesome
- **Vue-cookies mocking**: Mock cookie management
- **Dayjs mocking**: Mock date/time utilities

### Component Testing

Component tests use Vue Test Utils with Vitest:

#### Basic Component Testing

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import HeaderComponent from '@/components/Header.vue'

describe('HeaderComponent', () => {
  let wrapper: any
  let router: any

  beforeEach(() => {
    // Create test router
    router = createRouter({
      history: createWebHistory(),
      routes: [{ path: '/', name: 'Home' }]
    })

    wrapper = mount(HeaderComponent, {
      global: {
        plugins: [router]
      }
    })
  })

  it('renders correctly with default props', () => {
    expect(wrapper.find('header').exists()).toBe(true)
    expect(wrapper.find('.navbar-brand').text()).toContain('Task Scheduler')
  })

  it('displays navigation links', () => {
    const navLinks = wrapper.findAll('a')
    expect(navLinks.length).toBeGreaterThan(0)
  })

  it('emits events when links are clicked', async () => {
    const homeLink = wrapper.find('[data-testid="home-link"]')
    await homeLink.trigger('click')

    expect(wrapper.emitted()).toHaveProperty('navigate')
  })
})
```

#### Testing Component with Props and Events

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskCard from '@/components/TaskCard.vue'

describe('TaskCard', () => {
  const mockTask = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    status: 'pending',
    dueDate: '2024-12-31T00:00:00',
    createdDate: '2024-01-01T00:00:00'
  }

  it('renders task information correctly', () => {
    const wrapper = mount(TaskCard, {
      props: { task: mockTask }
    })

    expect(wrapper.find('.task-title').text()).toBe('Test Task')
    expect(wrapper.find('.task-description').text()).toBe('Test Description')
    expect(wrapper.find('.task-status').text()).toBe('pending')
  })

  it('emits edit event when edit button is clicked', async () => {
    const wrapper = mount(TaskCard, {
      props: { task: mockTask }
    })

    await wrapper.find('[data-testid="edit-button"]').trigger('click')

    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('edit')[0]).toEqual([mockTask.id])
  })

  it('emits delete event when delete button is clicked', async () => {
    const wrapper = mount(TaskCard, {
      props: { task: mockTask }
    })

    await wrapper.find('[data-testid="delete-button"]').trigger('click')

    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')[0]).toEqual([mockTask.id])
  })

  it('applies correct CSS classes based on status', () => {
    const wrapper = mount(TaskCard, {
      props: { task: { ...mockTask, status: 'completed' } }
    })

    expect(wrapper.find('.task-card').classes()).toContain('status-completed')
  })
})
```

#### Testing with Mocked API Calls

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import axios from 'axios'
import TaskList from '@/pages/TaskList.vue'

// Mock axios
vi.mock('axios')
const mockedAxios = axios as any

describe('TaskList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads and displays tasks from API', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', status: 'pending' },
      { id: 2, title: 'Task 2', status: 'completed' }
    ]

    mockedAxios.get.mockResolvedValue({ data: mockTasks })

    const wrapper = mount(TaskList)
    await wrapper.vm.$nextTick() // Wait for API call

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/tasks/')
    expect(wrapper.findAll('.task-item')).toHaveLength(2)
  })

  it('handles API errors gracefully', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network error'))

    const wrapper = mount(TaskList)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.error-message').exists()).toBe(true)
    expect(wrapper.find('.error-message').text()).toContain('Failed to load tasks')
  })

  it('shows loading state while fetching tasks', async () => {
    mockedAxios.get.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    const wrapper = mount(TaskList)

    expect(wrapper.find('.loading-spinner').exists()).toBe(true)

    await new Promise(resolve => setTimeout(resolve, 150))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.loading-spinner').exists()).toBe(false)
  })
})
```

### Page Component Testing

Testing page components that use Vue Router and API calls:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import AddTask from '@/pages/AddTask.vue'
import axios from 'axios'

vi.mock('axios')
const mockedAxios = axios as any

describe('AddTask Page', () => {
  let router: any
  let wrapper: any

  beforeEach(async () => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: 'Home' },
        { path: '/add', name: 'AddTask', component: AddTask }
      ]
    })

    await router.push('/add')
    await router.isReady()

    wrapper = mount(AddTask, {
      global: {
        plugins: [router]
      }
    })
  })

  it('renders form fields correctly', () => {
    expect(wrapper.find('input[type="text"][placeholder="title"]').exists()).toBe(true)
    expect(wrapper.find('textarea[placeholder="description"]').exists()).toBe(true)
    expect(wrapper.find('select').exists()).toBe(true)
    expect(wrapper.find('input[type="datetime-local"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('submits form with valid data', async () => {
    const mockResponse = { id: 1, title: 'New Task' }
    mockedAxios.post.mockResolvedValue({ data: mockResponse })

    await wrapper.find('input[type="text"]').setValue('New Task')
    await wrapper.find('textarea').setValue('Task description')
    await wrapper.find('select').setValue('pending')
    await wrapper.find('form').trigger('submit')

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/tasks/', {
      title: 'New Task',
      description: 'Task description',
      status: 'pending',
      dueDate: expect.any(String)
    })
  })

  it('validates form fields', async () => {
    // Submit without title
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('.error-message').exists()).toBe(true)
    expect(wrapper.find('.error-message').text()).toContain('Title is required')
  })

  it('redirects to task list on successful submission', async () => {
    const mockResponse = { id: 1, title: 'New Task' }
    mockedAxios.post.mockResolvedValue({ data: mockResponse })

    await wrapper.find('input[type="text"]').setValue('New Task')
    await wrapper.find('form').trigger('submit')

    await wrapper.vm.$nextTick()
    expect(router.currentRoute.value.name).toBe('Home')
  })
})
```

### Test Utilities and Factories

#### Test Data Factories (client/tests/utils/factories.ts)

```typescript
export const createMockTask = (overrides = {}) => ({
  id: 1,
  title: 'Test Task',
  description: 'Test Description',
  status: 'pending',
  dueDate: '2024-12-31T00:00:00',
  createdDate: '2024-01-01T00:00:00',
  ...overrides
})

export const createMockTasks = (count: number, overrides = {}) =>
  Array.from({ length: count }, (_, i) =>
    createMockTask({ id: i + 1, title: `Task ${i + 1}`, ...overrides })
  )

export const createMockApiResponse = (data: any, status = 200) => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {}
})
```

#### Test Helpers (client/tests/utils/test-utils.ts)

```typescript
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'

export const createMockRouter = () => {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', name: 'Home' },
      { path: '/tasks/:id', name: 'TaskDetail' }
    ]
  })
  return router
}

export const mountWithRouter = (component, options = {}) => {
  const router = createMockRouter()
  return mount(component, {
    global: {
      plugins: [router],
      ...options.global
    },
    ...options
  })
}

export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const flushPromises = () => new Promise(resolve => setImmediate(resolve))
```

## End-to-End Testing

### Running E2E Tests

#### Local Development

```bash
cd client

# Install Playwright browsers
npm run test:e2e:install

# Run all E2E tests
npm run test:e2e

# Run with UI (watch mode)
npm run test:e2e:ui

# Run in headed mode (show browser)
npm run test:e2e:headed

# Run with debugger
npm run test:e2e:debug

# Run specific browser
npm run test:e2e:chrome
npm run test:e2e:firefox
npm run test:e2e:safari

# Run mobile tests
npm run test:e2e:mobile

# Update snapshots
npm run test:e2e:update

# Generate HTML report
npm run test:e2e:report
```

#### Docker Environment

```bash
# Run E2E tests with Docker application
docker-compose up -d --build
sleep 30  # Wait for services to be ready

docker-compose exec frontend npm run test:e2e

# Run with Docker flag (auto-starts services)
npm run test:e2e:docker
```

### Playwright Configuration

#### Test Browser Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ]
})
```

### E2E Test Examples

#### Basic Page Interaction

```typescript
import { test, expect } from '@playwright/test'

test.describe('Task Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('user can view the home page', async ({ page }) => {
    await expect(page).toHaveTitle(/Task Scheduler/)
    await expect(page.locator('h1')).toContainText('Task Scheduler')
    await expect(page.locator('nav')).toBeVisible()
  })

  test('user can navigate to add task page', async ({ page }) => {
    await page.click('text=Add Task')
    await expect(page).toHaveURL('/add')
    await expect(page.locator('h1')).toContainText('Add New Task')
  })

  test('user can create a new task', async ({ page }) => {
    // Navigate to add task page
    await page.click('text=Add Task')

    // Fill out form
    await page.fill('input[placeholder="title"]', 'Test Task from E2E')
    await page.fill('textarea[placeholder="description"]', 'This is a test task created by Playwright')
    await page.selectOption('select[name="status"]', 'pending')

    // Submit form
    await page.click('button[type="submit"]')

    // Verify task was created
    await expect(page.locator('text=Task created successfully')).toBeVisible()
    await expect(page).toHaveURL('/')

    // Verify task appears in list
    await expect(page.locator('text=Test Task from E2E')).toBeVisible()
  })

  test('user can edit an existing task', async ({ page }) => {
    // First create a task
    await page.click('text=Add Task')
    await page.fill('input[placeholder="title"]', 'Original Task Title')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Task created successfully')).toBeVisible()

    // Find and click edit button
    const taskCard = page.locator('.task-card').filter({ hasText: 'Original Task Title' })
    await taskCard.locator('button[aria-label="Edit"]').click()

    // Edit task
    await page.fill('input[placeholder="title"]', 'Updated Task Title')
    await page.click('button[type="submit"]')

    // Verify update
    await expect(page.locator('text=Task updated successfully')).toBeVisible()
    await expect(page.locator('text=Updated Task Title')).toBeVisible()
  })
})
```

#### Advanced E2E Testing Patterns

```typescript
import { test, expect } from '@playwright/test'

test.describe('Advanced Task Features', () => {
  test('user can filter tasks by status', async ({ page }) => {
    await page.goto('/')

    // Create tasks with different statuses
    const tasks = [
      { title: 'Pending Task 1', status: 'pending' },
      { title: 'Completed Task 1', status: 'completed' },
      { title: 'Pending Task 2', status: 'pending' }
    ]

    for (const task of tasks) {
      await page.click('text=Add Task')
      await page.fill('input[placeholder="title"]', task.title)
      await page.selectOption('select[name="status"]', task.status)
      await page.click('button[type="submit"]')
      await expect(page.locator('text=Task created successfully')).toBeVisible()
      await page.goto('/') // Return to home
    }

    // Test filter functionality
    await page.selectOption('select[name="statusFilter"]', 'pending')
    await expect(page.locator('.task-card')).toHaveCount(2)
    await expect(page.locator('text=Pending Task 1')).toBeVisible()
    await expect(page.locator('text=Pending Task 2')).toBeVisible()
    await expect(page.locator('text=Completed Task 1')).not.toBeVisible()

    await page.selectOption('select[name="statusFilter"]', 'completed')
    await expect(page.locator('.task-card')).toHaveCount(1)
    await expect(page.locator('text=Completed Task 1')).toBeVisible()
  })

  test('user can search tasks by title', async ({ page }) => {
    await page.goto('/')

    // Create test tasks
    const taskTitles = ['Important Meeting', 'Code Review', 'Documentation']

    for (const title of taskTitles) {
      await page.click('text=Add Task')
      await page.fill('input[placeholder="title"]', title)
      await page.click('button[type="submit"]')
      await expect(page.locator('text=Task created successfully')).toBeVisible()
      await page.goto('/')
    }

    // Test search functionality
    await page.fill('input[placeholder="Search tasks..."]', 'Code')
    await expect(page.locator('.task-card')).toHaveCount(1)
    await expect(page.locator('text=Code Review')).toBeVisible()

    await page.fill('input[placeholder="Search tasks..."]', 'Meeting')
    await expect(page.locator('.task-card')).toHaveCount(1)
    await expect(page.locator('text=Important Meeting')).toBeVisible()

    await page.fill('input[placeholder="Search tasks..."]', '')
    await expect(page.locator('.task-card')).toHaveCount(3)
  })

  test('handles form validation correctly', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Add Task')

    // Try to submit empty form
    await page.click('button[type="submit"]')

    // Check validation messages
    await expect(page.locator('text=Title is required')).toBeVisible()
    await expect(page.locator('text=Status is required')).toBeVisible()

    // Fill only title
    await page.fill('input[placeholder="title"]', 'Test Task')
    await page.click('button[type="submit"]')

    // Should still show status error
    await expect(page.locator('text=Title is required')).not.toBeVisible()
    await expect(page.locator('text=Status is required')).toBeVisible()

    // Fill valid form
    await page.selectOption('select[name="status"]', 'pending')
    await page.click('button[type="submit"]')

    // Should succeed
    await expect(page.locator('text=Task created successfully')).toBeVisible()
  })

  test('handles API errors gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/tasks/**', route => {
      route.fulfill({ status: 500, contentType: 'application/json', body: '{"error": "Server error"}' })
    })

    await page.goto('/')
    await page.click('text=Add Task')

    await page.fill('input[placeholder="title"]', 'Test Task')
    await page.selectOption('select[name="status"]', 'pending')
    await page.click('button[type="submit"]')

    // Should show error message
    await expect(page.locator('text=Failed to create task')).toBeVisible()
    await expect(page.locator('.error-message')).toBeVisible()
  })
})
```

#### Responsive Design Testing

```typescript
import { test, expect, devices } from '@playwright/test'

test.describe('Responsive Design', () => {
  const viewports = [
    { name: 'Desktop', width: 1280, height: 720 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 }
  ]

  viewports.forEach(({ name, width, height }) => {
    test(`${name} layout works correctly`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await page.goto('/')

      // Check main navigation
      const nav = page.locator('nav')
      await expect(nav).toBeVisible()

      if (width < 768) {
        // Mobile: Check hamburger menu
        await expect(page.locator('.mobile-menu-toggle')).toBeVisible()
        await page.click('.mobile-menu-toggle')
        await expect(page.locator('.mobile-menu')).toBeVisible()
      } else {
        // Desktop/Tablet: Check regular navigation
        await expect(page.locator('.nav-links')).toBeVisible()
        await expect(page.locator('.mobile-menu-toggle')).not.toBeVisible()
      }

      // Check task cards layout
      await page.click('text=Add Task')
      await page.fill('input[placeholder="title"]', 'Responsive Test Task')
      await page.selectOption('select[name="status"]', 'pending')
      await page.click('button[type="submit"]')
      await page.goto('/')

      const taskCard = page.locator('.task-card')
      await expect(taskCard).toBeVisible()

      if (width < 768) {
        // Mobile: Check stacked layout
        await expect(taskCard.locator('.task-actions')).toBeVisible()
      } else {
        // Desktop/Tablet: Check inline layout
        await expect(taskCard.locator('.task-content')).toBeVisible()
      }
    })
  })
})
```

#### Accessibility Testing

```typescript
import { test, expect } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'

test.describe('Accessibility', () => {
  test('home page meets accessibility standards', async ({ page }) => {
    await page.goto('/')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('form inputs have proper labels', async ({ page }) => {
    await page.goto('/add')

    // Check all form inputs have associated labels
    const inputs = page.locator('input, select, textarea')
    const count = await inputs.count()

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i)
      const id = await input.getAttribute('id')

      if (id) {
        const label = page.locator(`label[for="${id}"]`)
        await expect(label).toBeVisible()
      }
    }
  })

  test('navigation is keyboard accessible', async ({ page }) => {
    await page.goto('/')

    // Test tab navigation
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()

    // Test navigation through menu items
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
      const focused = page.locator(':focus')
      await expect(focused).toBeVisible()

      // Test Enter key on focused elements
      if (await focused.isVisible()) {
        await page.keyboard.press('Enter')
        await page.waitForTimeout(100) // Small delay for navigation
      }
    }
  })

  test('color contrast meets WCAG standards', async ({ page }) => {
    await page.goto('/')

    // Check that text has sufficient contrast
    const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, a, button')
    const count = await textElements.count()

    for (let i = 0; i < Math.min(count, 10); i++) { // Check first 10 elements
      const element = textElements.nth(i)
      await expect(element).toBeVisible()

      // In a real test, you'd use axe-core or a similar tool
      // to check contrast ratios
    }
  })
})
```

### E2E Page Object Model

```typescript
// tests/e2e/page-objects/TasksPage.ts
import { Page, Locator } from '@playwright/test'

export class TasksPage {
  readonly page: Page
  readonly addTaskButton: Locator
  readonly taskList: Locator
  readonly searchInput: Locator
  readonly statusFilter: Locator
  readonly emptyState: Locator

  constructor(page: Page) {
    this.page = page
    this.addTaskButton = page.locator('button:has-text("Add Task")')
    this.taskList = page.locator('.task-list')
    this.searchInput = page.locator('input[placeholder="Search tasks..."]')
    this.statusFilter = page.locator('select[name="statusFilter"]')
    this.emptyState = page.locator('.empty-state')
  }

  async goto() {
    await this.page.goto('/')
  }

  async clickAddTask() {
    await this.addTaskButton.click()
  }

  async searchTasks(query: string) {
    await this.searchInput.fill(query)
  }

  async filterByStatus(status: string) {
    await this.statusFilter.selectOption(status)
  }

  async getTaskCount() {
    return await this.taskList.locator('.task-card').count()
  }

  async getTaskByTitle(title: string) {
    return this.taskList.locator('.task-card').filter({ hasText: title })
  }

  async waitForTaskToAppear(title: string) {
    await this.page.locator(`text=${title}`).waitFor({ state: 'visible' })
  }

  async isTaskVisible(title: string) {
    const task = await this.getTaskByTitle(title)
    return await task.isVisible()
  }
}

// tests/e2e/page-objects/AddTaskPage.ts
export class AddTaskPage {
  readonly page: Page
  readonly titleInput: Locator
  readonly descriptionInput: Locator
  readonly statusSelect: Locator
  readonly dueDateInput: Locator
  readonly submitButton: Locator
  readonly cancelButton: Locator

  constructor(page: Page) {
    this.page = page
    this.titleInput = page.locator('input[placeholder="title"]')
    this.descriptionInput = page.locator('textarea[placeholder="description"]')
    this.statusSelect = page.locator('select[name="status"]')
    this.dueDateInput = page.locator('input[type="datetime-local"]')
    this.submitButton = page.locator('button[type="submit"]')
    this.cancelButton = page.locator('button:has-text("Cancel")')
  }

  async fillTaskForm(task: {
    title: string
    description?: string
    status?: string
    dueDate?: string
  }) {
    await this.titleInput.fill(task.title)
    if (task.description) {
      await this.descriptionInput.fill(task.description)
    }
    if (task.status) {
      await this.statusSelect.selectOption(task.status)
    }
    if (task.dueDate) {
      await this.dueDateInput.fill(task.dueDate)
    }
  }

  async submitForm() {
    await this.submitButton.click()
  }

  async cancelForm() {
    await this.cancelButton.click()
  }

  async createTask(task: {
    title: string
    description?: string
    status?: string
    dueDate?: string
  }) {
    await this.fillTaskForm(task)
    await this.submitForm()
  }
}

// Usage in tests
import { test, expect } from '@playwright/test'
import { TasksPage, AddTaskPage } from '../page-objects'

test('user can create and manage tasks using page objects', async ({ page }) => {
  const tasksPage = new TasksPage(page)
  const addTaskPage = new AddTaskPage(page)

  await tasksPage.goto()
  await tasksPage.clickAddTask()

  await addTaskPage.createTask({
    title: 'Page Object Test Task',
    description: 'This task was created using page objects',
    status: 'pending'
  })

  await expect(page.locator('text=Task created successfully')).toBeVisible()
  await expect(page.locator('text=Page Object Test Task')).toBeVisible()
})
```

## Test Coverage

### Coverage Goals and Thresholds

#### Backend Coverage Targets
- **Overall Coverage**: >90%
- **Line Coverage**: >90%
- **Branch Coverage**: >85%
- **Function Coverage**: >90%
- **Statement Coverage**: >90%

#### Frontend Coverage Targets
- **Overall Coverage**: >85%
- **Line Coverage**: >85%
- **Branch Coverage**: >80%
- **Function Coverage**: >85%
- **Statement Coverage**: >85%

### Running Coverage Reports

#### Backend Coverage

```bash
# Generate HTML coverage report
pytest --cov=backend --cov-report=html

# Generate terminal coverage report
pytest --cov=backend --cov-report=term-missing

# Generate XML coverage report (for CI)
pytest --cov=backend --cov-report=xml

# Coverage for specific module
pytest --cov=backend.tasks --cov-report=html

# Coverage with minimum threshold enforcement
pytest --cov=backend --cov-fail-under=90
```

#### Frontend Coverage

```bash
cd client

# Generate coverage report
npm run test:coverage

# Generate coverage with HTML report
npm run test:coverage

# Coverage in watch mode
npm run test -- --coverage

# Coverage with specific reporter
npm run test:run -- --coverage --reporter=html
```

### Coverage Report Analysis

#### Interpreting Coverage Reports

1. **Line Coverage**: Percentage of executable lines that were executed
2. **Branch Coverage**: Percentage of decision points (if/else) that were tested
3. **Function Coverage**: Percentage of functions that were called
4. **Statement Coverage**: Percentage of statements that were executed

#### Coverage Best Practices

- **Focus on critical paths**: Prioritize coverage for business logic
- **Don't chase 100%**: Accept reasonable thresholds for boilerplate code
- **Review uncovered code**: Understand why certain lines aren't covered
- **Use coverage wisely**: High coverage ≠ good tests, focus on test quality

### Coverage Configuration

#### Backend Coverage (requirements.txt)

```txt
# Add these dependencies for coverage
pytest-cov>=4.0.0
coverage>=7.0.0
```

#### Frontend Coverage (client/vitest.config.ts)

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.test.{js,ts}',
        '**/*.spec.{js,ts}',
        '**/*.config.{js,ts}',
        'dist/',
        'coverage/',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    }
  }
})
```

## CI/CD Pipeline

### GitHub Actions Workflow Overview

The testing pipeline is automated via GitHub Actions with the following jobs:

1. **Backend Tests**: Unit and integration tests with PostgreSQL
2. **Frontend Tests**: Component tests with coverage
3. **E2E Tests**: Full application testing with Playwright
4. **Security Scanning**: Bandit security analysis
5. **Code Quality**: Linting and formatting checks

### Pipeline Configuration

#### Workflow Triggers

```yaml
on:
  push:
    branches: [ main, develop ]    # Run on push to main/develop
  pull_request:
    branches: [ main ]             # Run on PRs to main
```

#### Job Dependencies

```yaml
jobs:
  backend-tests:    # Runs first
  frontend-tests:   # Runs in parallel with backend
  e2e-tests:        # Depends on: [backend-tests, frontend-tests]
  security-scan:    # Runs in parallel
  lint-and-format:  # Runs in parallel
```

### Environment Configuration

#### CI/CD Environment Variables

| Variable | Purpose | Source |
|----------|---------|--------|
| `CI` | Indicates CI environment | GitHub Actions (auto) |
| `TEST_DATABASE_URL` | PostgreSQL connection for tests | GitHub Actions config |
| `NODE_ENV` | Node environment | Set to 'test' |
| `PYTHONPATH` | Python path configuration | GitHub Actions config |

#### Database Setup in CI

```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_PASSWORD: test_password
      POSTGRES_USER: test_user
      POSTGRES_DB: test_db
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

### Pipeline Steps

#### Backend Test Job

```yaml
backend-tests:
  runs-on: ubuntu-latest
  services:
    postgres:
      # ... postgres configuration
  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.10'

    - name: Cache dependencies
      uses: actions/cache@v3
      with:
        path: ~/.cache/pip
        key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}

    - name: Install dependencies
      run: pip install -r requirements.txt

    - name: Run unit tests
      run: pytest tests/unit/ -v --tb=short

    - name: Run integration tests
      run: pytest tests/integration/ -v --tb=short

    - name: Generate coverage
      run: pytest --cov=backend --cov-report=xml

    - name: Upload coverage
      uses: codecov/codecov-action@v3
```

#### Frontend Test Job

```yaml
frontend-tests:
  runs-on: ubuntu-latest
  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: client/package-lock.json

    - name: Install dependencies
      working-directory: ./client
      run: npm ci

    - name: Run tests
      working-directory: ./client
      run: npm run test:run

    - name: Generate coverage
      working-directory: ./client
      run: npm run test:coverage

    - name: Upload coverage
      uses: codecov/codecov-action@v3
```

#### E2E Test Job

```yaml
e2e-tests:
  runs-on: ubuntu-latest
  needs: [backend-tests, frontend-tests]
  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js and Python
      # ... setup steps

    - name: Install dependencies
      # ... dependency installation

    - name: Install Playwright browsers
      working-directory: ./client
      run: npm run test:e2e:install

    - name: Start application
      run: |
        docker-compose up -d --build
        sleep 30  # Wait for services

    - name: Run E2E tests
      working-directory: ./client
      run: npm run test:e2e
      env:
        BASE_URL: http://localhost:8080

    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: playwright-report
        path: client/playwright-report/

    - name: Cleanup
      if: always()
      run: docker-compose down
```

### Pipeline Debugging

#### Viewing Pipeline Logs

```bash
# View GitHub Actions logs
# Navigate to: https://github.com/[owner]/[repo]/actions

# Download artifacts
# GitHub Actions UI -> Workflow run -> Artifacts
```

#### Local Pipeline Testing

```bash
# Test backend pipeline locally
docker-compose -f docker-compose.test.yml up --build

# Test frontend pipeline locally
docker-compose exec frontend npm run test:coverage

# Test E2E pipeline locally
docker-compose up -d --build
npm run test:e2e
```

#### Common Pipeline Issues

1. **Database Connection Failures**
   - Check PostgreSQL service health
   - Verify environment variables
   - Review connection strings

2. **Dependency Installation Failures**
   - Clear caches and retry
   - Check dependency versions
   - Verify lock files are up to date

3. **E2E Test Timeouts**
   - Increase wait times for service startup
   - Check service health endpoints
   - Review test timeouts

4. **Coverage Upload Failures**
   - Verify Codecov token configuration
   - Check coverage report generation
   - Review upload permissions

## Environment Configuration

### Development Environment

#### Local Development Setup

```bash
# Backend Environment
export DATABASE_URL="sqlite:///./test.db"
export TEST_DATABASE_URL="sqlite:///./test.db"
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Frontend Environment
export VITE_API_BASE_URL="http://localhost:8000"
export NODE_ENV="development"

# E2E Testing Environment
export BASE_URL="http://localhost:8080"
export USE_DOCKER="false"
```

#### Docker Development Setup

```yaml
# docker-compose.yaml (excerpt)
services:
  backend:
    environment:
      - DATABASE_URL=postgresql://scheduler:scheduler@db:5432/scheduler
      - PYTHONPATH=/app
    volumes:
      - ./backend:/app
      - ./tests:/app/tests

  frontend:
    environment:
      - VITE_API_BASE_URL=/api
      - NODE_ENV=development
    volumes:
      - ./client:/app
      - /app/node_modules
```

### Test Environment

#### Backend Test Environment

```python
# tests/conftest.py (excerpt)
import os
import tempfile

# Test database configuration
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

# Override for CI
if os.getenv("CI"):
    SQLALCHEMY_DATABASE_URL = os.getenv("TEST_DATABASE_URL")
```

#### Frontend Test Environment

```typescript
// client/tests/setup.ts (excerpt)
import { vi } from 'vitest'

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.VITE_API_BASE_URL = 'http://localhost:8000'
```

### Production Environment

#### CI/CD Environment Variables

```yaml
# GitHub Actions environment
env:
  CI: true
  NODE_ENV: test
  TEST_DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_db
```

#### Security Considerations

- **Secrets Management**: Use GitHub Secrets for sensitive data
- **Environment Isolation**: Separate test and production environments
- **Data Sanitization**: Use test data that doesn't expose real user data

## Test Data Management

### Test Data Factories

#### Backend Factories

```python
# tests/factories.py
import factory
from datetime import datetime, timedelta
from backend.tasks import model

class TaskFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = model.Task
        sqlalchemy_session_persistence = "flush"

    id = factory.Sequence(lambda n: n + 1)
    title = factory.Faker("sentence", nb_words=4)
    description = factory.Faker("paragraph")
    status = factory.Iterator(["pending", "in_progress", "completed"])
    createdDate = factory.LazyFunction(datetime.now)
    dueDate = factory.LazyFunction(
        lambda: datetime.now() + timedelta(days=7)
    )

    class Params:
        pending = factory.Trait(status="pending")
        completed = factory.Trait(status="completed")
        overdue = factory.Trait(
            dueDate=factory.LazyFunction(
                lambda: datetime.now() - timedelta(days=1)
            )
        )
```

#### Frontend Factories

```typescript
// client/tests/utils/factories.ts
export const createMockTask = (overrides = {}) => ({
  id: faker.datatype.number({ min: 1 }),
  title: faker.lorem.sentence(4),
  description: faker.lorem.paragraph(),
  status: faker.helpers.arrayElement(['pending', 'in_progress', 'completed']),
  dueDate: faker.date.soon(7).toISOString(),
  createdDate: faker.date.recent().toISOString(),
  ...overrides
})

export const createMockUser = (overrides = {}) => ({
  id: faker.datatype.number({ min: 1 }),
  email: faker.internet.email(),
  name: faker.name.fullName(),
  ...overrides
})
```

### Test Database Setup

#### Database Fixtures

```python
# tests/conftest.py
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

@pytest.fixture
def sample_tasks(db_session):
    """Create sample tasks for testing"""
    tasks = TaskFactory.create_batch(5, db_session)
    db_session.commit()
    return tasks
```

#### Test Data Cleanup

```python
# tests/conftest.py
@pytest.fixture(autouse=True)
def cleanup_database():
    """Automatic cleanup after each test"""
    yield
    # Cleanup is handled by db_session fixture
    pass

@pytest.fixture
def cleanup_uploads(tmp_path):
    """Cleanup uploaded files"""
    yield tmp_path
    # Cleanup files after test
    import shutil
    shutil.rmtree(tmp_path, ignore_errors=True)
```

### Data Management Best Practices

#### Test Data Principles

1. **Isolation**: Each test gets fresh data
2. **Determinism**: Tests use predictable data
3. **Minimalism**: Create only necessary data
4. **Cleanup**: Automatic cleanup after tests
5. **Realism**: Data should reflect production structure

#### Data Seeding Strategies

```python
# tests/seed.py
def seed_database(db_session):
    """Seed database with initial test data"""
    # Create test users
    users = UserFactory.create_batch(3, db_session)

    # Create test tasks for each user
    for user in users:
        TaskFactory.create_batch(5, db_session, user_id=user.id)

    db_session.commit()
    return users

@pytest.fixture
def seeded_db(db_session):
    """Database with seeded data"""
    return seed_database(db_session)
```

## Mocking Strategies

### Backend Mocking

#### Database Mocking

```python
# tests/mocks.py
from unittest.mock import AsyncMock, MagicMock
from sqlalchemy.orm import Session

def create_mock_db_session():
    """Create a mock database session"""
    mock_db = AsyncMock(spec=Session)
    mock_db.add = MagicMock()
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()
    mock_db.delete = MagicMock()
    mock_db.query = MagicMock()
    return mock_db

def mock_task_object(overrides=None):
    """Create a mock task object"""
    task_data = {
        'id': 1,
        'title': 'Mock Task',
        'description': 'Mock Description',
        'status': 'pending',
        'createdDate': datetime.now(),
        'dueDate': datetime.now() + timedelta(days=7)
    }

    if overrides:
        task_data.update(overrides)

    mock_task = MagicMock()
    for key, value in task_data.items():
        setattr(mock_task, key, value)

    return mock_task
```

#### Service Mocking

```python
# tests/test_services.py
import pytest
from unittest.mock import patch, AsyncMock

@pytest.mark.unit
@patch('backend.tasks.services.db.get_db')
async def test_service_with_mock_db(mock_get_db):
    """Test service with mocked database"""
    # Setup mock
    mock_db = create_mock_db_session()
    mock_get_db.return_value = mock_db

    # Test service
    task_data = schema.TaskCreate(
        title="Test Task",
        description="Test Description",
        status="pending"
    )

    result = await services.create_new_task(task_data)

    # Assertions
    assert result.title == "Test Task"
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()
```

#### External API Mocking

```python
# tests/test_external_api.py
import pytest
from unittest.mock import patch, AsyncMock

@pytest.mark.unit
@patch('backend.external_api.client.httpx.AsyncClient.get')
async def test_external_api_call(mock_get):
    """Test external API integration with mock"""
    # Setup mock response
    mock_response = AsyncMock()
    mock_response.json.return_value = {"data": "test_data"}
    mock_response.status_code = 200
    mock_get.return_value = mock_response

    # Test API call
    result = await external_api.fetch_data()

    # Assertions
    assert result == {"data": "test_data"}
    mock_get.assert_called_once_with("https://api.example.com/data")
```

### Frontend Mocking

#### HTTP Request Mocking

```typescript
// client/tests/setup.ts (excerpt)
import { vi } from 'vitest'

// Mock axios globally
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
    defaults: {
      baseURL: '/api',
      headers: { 'Content-Type': 'application/json' },
    },
  },
}))

// Mock implementation in tests
import axios from 'axios'
const mockedAxios = axios as any

beforeEach(() => {
  vi.clearAllMocks()
})

test('component with mocked API', async () => {
  const mockTasks = [
    { id: 1, title: 'Task 1', status: 'pending' }
  ]

  mockedAxios.get.mockResolvedValue({ data: mockTasks })

  // Test component
  const wrapper = mount(TaskList)
  await wrapper.vm.$nextTick()

  expect(mockedAxios.get).toHaveBeenCalledWith('/api/tasks/')
  expect(wrapper.findAll('.task-item')).toHaveLength(1)
})
```

#### Component Mocking

```typescript
// Mock child components
vi.mock('@/components/ChildComponent.vue', () => ({
  default: {
    name: 'ChildComponent',
    template: '<div><slot /></div>',
    props: ['title']
  }
}))

// Mock Vue Router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
  }),
  useRoute: () => ({
    params: { id: '123' },
    query: { filter: 'active' },
    path: '/tasks/123',
  }),
}))

// Mock third-party libraries
vi.mock('dayjs', () => ({
  default: vi.fn(() => ({
    format: vi.fn(() => '2024-01-01'),
    startOfDay: vi.fn(() => ({ format: vi.fn(() => '2024-01-01T00:00:00Z') })),
    endOfDay: vi.fn(() => ({ format: vi.fn(() => '2024-01-01T23:59:59Z') })),
  })),
}))
```

### Mocking Best Practices

#### When to Mock

1. **External Dependencies**: APIs, databases, file systems
2. **Slow Operations**: Network calls, complex computations
3. **Non-Deterministic**: Random values, current time
4. **Unavailable Services**: Third-party APIs, hardware

#### When NOT to Mock

1. **Core Business Logic**: Test actual implementation
2. **Simple Utilities**: Overhead of mocking exceeds benefits
3. **Integration Points**: Test real interactions
4. **Performance Critical**: Mocking might hide performance issues

#### Mock Management

```python
# tests/conftest.py
@pytest.fixture(autouse=True)
def cleanup_mocks():
    """Cleanup mocks after each test"""
    yield
    # Reset all mocks
    patch.stopall()

# In test files
def test_with_mocks():
    with patch('module.function') as mock_func:
        mock_func.return_value = "mocked_value"
        # Test code
        assert function() == "mocked_value"
        mock_func.assert_called_once()
    # Patch automatically cleaned up
```

## Performance Testing

### Load Testing

#### Backend Load Testing

```python
# tests/performance/test_load.py
import pytest
import asyncio
from concurrent.futures import ThreadPoolExecutor
from fastapi.testclient import TestClient

@pytest.mark.slow
def test_api_load_performance(client):
    """Test API performance under load"""
    import time

    def make_request():
        start_time = time.time()
        response = client.get("/tasks/")
        end_time = time.time()
        return end_time - start_time, response.status_code

    # Run 100 concurrent requests
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(make_request) for _ in range(100)]
        results = [future.result() for future in futures]

    # Assert performance requirements
    response_times = [r[0] for r in results if r[1] == 200]
    success_rate = len(response_times) / len(results)

    assert success_rate >= 0.95  # 95% success rate
    assert max(response_times) < 1.0  # Max response time < 1 second
    assert sum(response_times) / len(response_times) < 0.5  # Average < 500ms
```

#### Frontend Performance Testing

```typescript
// client/tests/performance/component-rendering.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { performance } from 'perf_hooks'

describe('Component Performance', () => {
  it('renders large task list efficiently', async () => {
    const tasks = Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      title: `Task ${i + 1}`,
      status: 'pending'
    }))

    const startTime = performance.now()

    const wrapper = mount(TaskList, {
      props: { tasks }
    })

    await wrapper.vm.$nextTick()
    const endTime = performance.now()

    const renderTime = endTime - startTime

    // Should render within reasonable time
    expect(renderTime).toBeLessThan(100) // 100ms
    expect(wrapper.findAll('.task-item')).toHaveLength(1000)
  })
})
```

### Memory Testing

#### Backend Memory Testing

```python
# tests/performance/test_memory.py
import pytest
import psutil
import gc
from backend.tasks import services

@pytest.mark.slow
def test_memory_usage_does_not_leak():
    """Test that repeated operations don't leak memory"""
    process = psutil.Process()
    initial_memory = process.memory_info().rss

    # Perform many operations
    for _ in range(1000):
        task_data = {
            "title": f"Task {_}",
            "status": "pending"
        }
        # Simulate operation
        del task_data

    gc.collect()  # Force garbage collection
    final_memory = process.memory_info().rss
    memory_increase = final_memory - initial_memory

    # Memory increase should be minimal (< 10MB)
    assert memory_increase < 10 * 1024 * 1024
```

#### Frontend Memory Testing

```typescript
// client/tests/performance/memory.test.ts
import { describe, it, expect, beforeEach } from 'vitest'

describe('Memory Management', () => {
  beforeEach(() => {
    // Clear any existing memory
    vi.clearAllMocks()
  })

  it('cleans up event listeners on unmount', () => {
    const wrapper = mount(TaskScheduler)

    // Simulate component lifecycle
    wrapper.unmount()

    // Verify cleanup occurred
    expect(wrapper.exists()).toBe(false)
  })

  it('does not retain references to large data sets', () => {
    const largeDataSet = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      data: 'x'.repeat(1000) // 1KB per item
    }))

    const wrapper = mount(ComponentWithData, {
      props: { data: largeDataSet }
    })

    wrapper.unmount()

    // In a real test, you'd use WeakRef or similar to check
    // that large data sets are properly garbage collected
  })
})
```

### Performance Monitoring

#### Test Performance Metrics

```bash
# Backend performance testing
pytest --benchmark-only tests/performance/

# Frontend bundle size analysis
npm run build -- --analyze

# E2E performance testing
npx lighthouse http://localhost:8080 --output=json --output-path=./lighthouse-report.json
```

#### Performance Benchmarks

```python
# tests/performance/benchmarks.py
import pytest
import time
from backend.tasks import services

@pytest.mark.benchmark
def test_task_creation_performance():
    """Benchmark task creation performance"""
    times = []

    for _ in range(100):
        start_time = time.perf_counter()

        # Perform operation
        task_data = {"title": "Benchmark Task", "status": "pending"}
        # Simulate task creation

        end_time = time.perf_counter()
        times.append(end_time - start_time)

    avg_time = sum(times) / len(times)
    p95_time = sorted(times)[94]  # 95th percentile

    assert avg_time < 0.01  # Average < 10ms
    assert p95_time < 0.05  # 95th percentile < 50ms
```

## Security Testing

### Backend Security Testing

#### Input Validation Testing

```python
# tests/security/test_input_validation.py
import pytest
from fastapi.testclient import TestClient

def test_sql_injection_protection(client):
    """Test SQL injection protection"""
    malicious_inputs = [
        "'; DROP TABLE tasks; --",
        "' OR '1'='1",
        "admin'--",
        "' UNION SELECT * FROM users --"
    ]

    for malicious_input in malicious_inputs:
        response = client.get(f"/tasks/?search={malicious_input}")

        # Should not crash or expose sensitive data
        assert response.status_code in [200, 400]
        assert "error" not in response.text.lower()
        assert "DROP TABLE" not in response.text

def test_xss_protection(client):
    """Test XSS protection"""
    xss_payloads = [
        "<script>alert('xss')</script>",
        "javascript:alert('xss')",
        "<img src=x onerror=alert('xss')>",
        "';alert('xss');//"
    ]

    for payload in xss_payloads:
        task_data = {
            "title": payload,
            "description": payload,
            "status": "pending"
        }

        response = client.post("/tasks/", json=task_data)

        if response.status_code == 201:
            # Verify XSS payload is sanitized in response
            assert "<script>" not in response.json()["title"]
            assert "javascript:" not in response.json()["title"]
```

#### Authentication Testing

```python
# tests/security/test_authentication.py
import pytest
from fastapi.testclient import TestClient

def test_unauthorized_access(client):
    """Test that protected endpoints require authentication"""
    protected_endpoints = [
        "/tasks/",
        "/tasks/1",
        "/tasks/1/update"
    ]

    for endpoint in protected_endpoints:
        response = client.get(endpoint)
        assert response.status_code == 401

def test_token_validation(client):
    """Test JWT token validation"""
    # Test invalid token
    response = client.get("/tasks/", headers={
        "Authorization": "Bearer invalid_token"
    })
    assert response.status_code == 401

    # Test expired token
    expired_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired.token"
    response = client.get("/tasks/", headers={
        "Authorization": f"Bearer {expired_token}"
    })
    assert response.status_code == 401
```

### Frontend Security Testing

#### XSS Prevention Testing

```typescript
// client/tests/security/xss.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

describe('XSS Prevention', () => {
  it('sanitizes user input in task titles', () => {
    const xssPayload = '<script>alert("xss")</script>'

    const wrapper = mount(TaskCard, {
      props: {
        task: {
          id: 1,
          title: xssPayload,
          status: 'pending'
        }
      }
    })

    // Title should be escaped, not executed
    const titleElement = wrapper.find('.task-title')
    expect(titleElement.text()).not.toContain('<script>')
    expect(titleElement.element.innerHTML).not.toContain('<script>')
  })

  it('prevents script injection via v-html', () => {
    const wrapper = mount(ComponentWithVHtml, {
      props: {
        content: '<img src=x onerror=alert("xss")>'
      }
    })

    // Component should not execute scripts
    expect(wrapper.element.querySelector('img')).toBeFalsy()
  })
})
```

### Security Scanning Tools

#### Bandit Security Scanner

```bash
# Run Bandit security scan
bandit -r backend/ -f json -o bandit-report.json

# Exclude test files
bandit -r backend/ --exclude tests/ -f text

# Check specific security issues
bandit -r backend/ -t B101,B102,B201 -f text
```

#### npm Audit

```bash
# Check for vulnerable dependencies
cd client
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Generate security report
npm audit --json > npm-audit-report.json
```

#### OWASP ZAP Integration

```bash
# Run OWASP ZAP security scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:8080 \
  -J gl-sast-report.json
```

### Security Best Practices

#### Backend Security

1. **Input Validation**: Validate all user inputs
2. **SQL Injection Prevention**: Use parameterized queries
3. **XSS Prevention**: Sanitize outputs
4. **Authentication**: Secure JWT implementation
5. **Authorization**: Proper role-based access control
6. **HTTPS**: Enforce secure connections
7. **CORS**: Configure proper CORS policies

#### Frontend Security

1. **Content Security Policy**: Implement CSP headers
2. **X-Frame-Options**: Prevent clickjacking
3. **Input Sanitization**: Clean user inputs
4. **Secure Storage**: Use httpOnly cookies for tokens
5. **Dependency Management**: Regular security updates
6. **Bundle Analysis**: Check for malicious packages

## Best Practices

### Backend Testing Best Practices

#### Test Organization

```python
# tests/unit/test_task_services.py
import pytest
from backend.tasks import services

class TestTaskCreation:
    """Test task creation functionality"""

    def test_create_task_with_valid_data(self):
        """Test creating task with valid input"""
        pass

    def test_create_task_with_invalid_title(self):
        """Test creating task with invalid title"""
        pass

    def test_create_task_with_invalid_status(self):
        """Test creating task with invalid status"""
        pass

class TestTaskRetrieval:
    """Test task retrieval functionality"""

    def test_get_task_by_id(self):
        """Test retrieving task by ID"""
        pass

    def test_get_nonexistent_task(self):
        """Test retrieving non-existent task"""
        pass

    def test_get_tasks_with_filters(self):
        """Test retrieving tasks with filters"""
        pass
```

#### Test Naming Conventions

```python
# Good test names
def test_create_task_with_valid_data_returns_task_object():
    """Clear description of what is being tested"""
    pass

def test_get_task_by_invalid_id_returns_404():
    """Includes expected outcome"""
    pass

def test_task_service_handles_database_connection_error():
    """Describes error handling scenario"""
    pass

# Bad test names
def test_task_1():
    """Too generic"""
    pass

def test_creation():
    """Unclear what is being created"""
    pass
```

#### Test Data Management

```python
# Use fixtures for test data
@pytest.fixture
def valid_task_data():
    return {
        "title": "Test Task",
        "description": "Test Description",
        "status": "pending",
        "dueDate": "2024-12-31T00:00:00"
    }

@pytest.fixture
def invalid_task_data():
    return {
        "title": "",  # Invalid empty title
        "status": "invalid_status"
    }

def test_create_task_success(valid_task_data):
    """Test with valid data fixture"""
    pass

def test_create_task_failure(invalid_task_data):
    """Test with invalid data fixture"""
    pass
```

### Frontend Testing Best Practices

#### Component Testing Patterns

```typescript
// Test component rendering
describe('TaskCard Component', () => {
  it('renders task information correctly', () => {
    const task = createMockTask()
    const wrapper = mount(TaskCard, { props: { task } })

    expect(wrapper.find('.task-title').text()).toBe(task.title)
    expect(wrapper.find('.task-status').text()).toBe(task.status)
  })

  it('applies correct CSS classes based on props', () => {
    const task = createMockTask({ status: 'completed' })
    const wrapper = mount(TaskCard, { props: { task } })

    expect(wrapper.find('.task-card').classes()).toContain('status-completed')
  })
})
```

#### Event Testing

```typescript
// Test user interactions
describe('TaskForm Component', () => {
  it('emits submit event with form data', async () => {
    const wrapper = mount(TaskForm)

    await wrapper.find('input[type="text"]').setValue('New Task')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted('submit')[0]).toEqual([{
      title: 'New Task'
    }])
  })

  it('validates required fields', async () => {
    const wrapper = mount(TaskForm)

    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('.error-message').exists()).toBe(true)
    expect(wrapper.emitted('submit')).toBeFalsy()
  })
})
```

### E2E Testing Best Practices

#### Page Object Pattern

```typescript
// Organize page interactions into page objects
export class TasksPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/')
  }

  async createTask(task: TaskData): Promise<void> {
    await this.page.click('text=Add Task')
    await this.page.fill('input[placeholder="title"]', task.title)
    await this.page.selectOption('select[name="status"]', task.status)
    await this.page.click('button[type="submit"]')
  }

  async getTaskByTitle(title: string): Promise<Locator> {
    return this.page.locator('.task-card').filter({ hasText: title })
  }
}

// Use page objects in tests
test('user can create and view tasks', async ({ page }) => {
  const tasksPage = new TasksPage(page)

  await tasksPage.goto()
  await tasksPage.createTask({
    title: 'E2E Test Task',
    status: 'pending'
  })

  const taskCard = await tasksPage.getTaskByTitle('E2E Test Task')
  await expect(taskCard).toBeVisible()
})
```

#### Test Organization

```typescript
// Group related tests
test.describe('Task Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Task Creation', () => {
    test('creates task with valid data', async ({ page }) => {
      // Test creation logic
    })

    test('validates required fields', async ({ page }) => {
      // Test validation logic
    })

    test('handles API errors gracefully', async ({ page }) => {
      // Test error handling
    })
  })

  test.describe('Task Updates', () => {
    test('updates task title', async ({ page }) => {
      // Test update logic
    })

    test('updates task status', async ({ page }) => {
      // Test status update
    })
  })
})
```

### General Testing Principles

#### Test Independence

```python
# Each test should be independent
def test_task_creation():
    # Don't rely on other tests' state
    pass

def test_task_deletion():
    # Don't rely on tasks created in other tests
    pass
```

#### Test Coverage Strategy

```python
# Test happy path
def test_successful_task_creation():
    pass

# Test edge cases
def test_task_creation_with_minimal_data():
    pass

def test_task_creation_with_maximum_data():
    pass

# Test error conditions
def test_task_creation_with_invalid_data():
    pass

def test_task_creation_when_database_unavailable():
    pass
```

#### Test Maintenance

```python
# Use descriptive assertions
assert response.status_code == 200  # Good
assert response.status_code != 404  # Bad - too generic

# Use helper methods for common operations
def create_test_task(client, **overrides):
    task_data = {
        "title": "Test Task",
        "status": "pending"
    }
    task_data.update(overrides)
    return client.post("/tasks/", json=task_data)

def test_task_filtering():
    response = create_test_task(client, status="completed")
    # Test filtering logic
```

## Troubleshooting

### Common Backend Issues

#### Database Connection Issues

```bash
# Check database connection
pytest tests/integration/test_db_connection.py -v

# Reset test database
pytest tests/conftest.py::db_session -v

# Check database URL
echo $TEST_DATABASE_URL
```

#### Import and Path Issues

```python
# Add project root to Python path
import sys
from pathlib import Path

project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Check imports
python -c "from backend.tasks import services; print('Import successful')"
```

#### Async Test Issues

```python
# Ensure proper async/await syntax
@pytest.mark.asyncio
async def test_async_function():
    result = await some_async_function()
    assert result.success is True

# Use proper test client for async endpoints
from httpx import AsyncClient

async def test_async_endpoint():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/tasks/", json=task_data)
    assert response.status_code == 201
```

### Common Frontend Issues

#### Component Mounting Issues

```typescript
// Ensure proper component imports
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from '@/components/MyComponent.vue'

// Check component setup
test('component mounts successfully', () => {
  const wrapper = mount(MyComponent)
  expect(wrapper.exists()).toBe(true)
})
```

#### Mock Configuration Issues

```typescript
// Clear mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})

// Verify mock setup
test('axios is properly mocked', async () => {
  const mockedAxios = axios as any
  mockedAxios.get.mockResolvedValue({ data: [] })

  // Test component that uses axios
  expect(mockedAxios.get).toHaveBeenCalled()
})
```

#### Test Environment Issues

```typescript
// Check test environment setup
import { config } from '@vue/test-utils'

config.global.stubs = {
  'font-awesome-icon': { template: '<i></i>' },
  'router-link': { template: '<a><slot /></a>' }
}

// Ensure proper global setup
test('global configuration is working', () => {
  expect(config.global.stubs).toBeDefined()
})
```

### Common E2E Issues

#### Browser Installation Issues

```bash
# Install Playwright browsers
npx playwright install

# Install specific browsers
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit

# Check browser installation
npx playwright install --dry-run
```

#### Timeout Issues

```typescript
// Increase timeouts for slow operations
test.setTimeout(60000) // 60 seconds

// Use explicit waits
await page.waitForSelector('.task-card', { timeout: 10000 })

// Wait for network idle
await page.waitForLoadState('networkidle')
```

#### Selector Issues

```typescript
// Use stable selectors
await page.locator('[data-testid="submit-button"]').click()

// Use text-based selectors
await page.locator('text=Submit').click()

// Use CSS selectors with fallback
await page.locator('button[type="submit"], .submit-btn').click()
```

### CI/CD Pipeline Issues

#### Docker Build Issues

```bash
# Check Docker build logs
docker-compose up --build

# Check service health
docker-compose ps

# Check service logs
docker-compose logs backend
docker-compose logs frontend
```

#### Environment Variable Issues

```yaml
# Verify environment variables in GitHub Actions
- name: Debug environment
  run: |
    echo "DATABASE_URL: $DATABASE_URL"
    echo "NODE_ENV: $NODE_ENV"
    python -c "import os; print('Env vars:', dict(os.environ))"

# Set required environment variables
env:
  DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_db
  NODE_ENV: test
```

#### Permission Issues

```bash
# Fix file permissions
chmod +x run_tests.sh

# Check Docker permissions
docker-compose exec backend whoami
docker-compose exec frontend whoami

# Fix npm permission issues
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### Debugging Techniques

#### Backend Debugging

```bash
# Run tests with debugger
pytest --pdb

# Run specific test with debugger
pytest tests/unit/test_services.py::test_create_task --pdb

# Show local variables on failure
pytest -l

# Run tests with verbose output
pytest -v -s

# Stop on first failure
pytest -x
```

#### Frontend Debugging

```bash
# Run tests with Node.js inspector
node --inspect-brk node_modules/.bin/vitest run

# Run tests in debug mode
npm run test:run -- --debug

# Generate test coverage with debugging
npm run test:coverage -- --reporter=verbose
```

#### E2E Debugging

```bash
# Run E2E tests with browser UI
npm run test:e2e:headed

# Run with debugger
npm run test:e2e:debug

# Generate trace files for debugging
npm run test:e2e -- --trace on

# Take screenshots on failure
npm run test:e2e -- --screenshot=only-on-failure

# Generate HTML report
npm run test:e2e:report
```

### Performance Issues

#### Slow Test Execution

```bash
# Run tests in parallel
pytest -n auto

# Use SQLite for faster database tests
export TEST_DATABASE_URL="sqlite:///./test.db"

# Skip slow tests in CI
pytest -m "not slow"

# Use test discovery to run only changed tests
pytest --testmon
```

#### Memory Issues

```python
# Enable garbage collection
import gc
gc.collect()

# Use generators for large datasets
def generate_test_data(count):
    for i in range(count):
        yield {"title": f"Task {i}", "status": "pending"}

# Clear fixtures after use
@pytest.fixture
def large_dataset():
    data = create_large_dataset()
    yield data
    # Cleanup
    data.clear()
```

## Contributing Guidelines

### Adding New Tests

#### Test Structure

```
tests/
├── unit/                    # Unit tests for individual functions
├── integration/             # Integration tests for API endpoints
├── e2e/                     # End-to-end tests
├── fixtures/                # Test data fixtures
├── mocks/                   # Mock objects and utilities
└── conftest.py             # Global test configuration
```

#### Test Naming Conventions

1. **File Names**: `test_<module_name>.py`
2. **Class Names**: `Test<FeatureName>`
3. **Test Methods**: `test_<scenario>_<expected_result>`

```python
# Example structure
class TestTaskCreation:
    def test_create_task_with_valid_data_returns_201(self):
        pass

    def test_create_task_with_invalid_title_returns_400(self):
        pass

    def test_create_task_when_database_unavailable_returns_500(self):
        pass
```

#### Test Categories

1. **Unit Tests**: Test individual functions and methods
2. **Integration Tests**: Test API endpoints and database interactions
3. **E2E Tests**: Test complete user workflows
4. **Performance Tests**: Test performance characteristics
5. **Security Tests**: Test security features

### Test Writing Guidelines

#### Arrange-Act-Assert Pattern

```python
def test_update_task_status():
    # Arrange
    task = create_test_task(status="pending")
    update_data = {"status": "completed"}

    # Act
    response = client.put(f"/tasks/{task.id}", json=update_data)

    # Assert
    assert response.status_code == 200
    updated_task = response.json()
    assert updated_task["status"] == "completed"
```

#### Test Data Management

```python
# Use factories for test data
@pytest.fixture
def task_factory():
    def create_task(**overrides):
        task_data = {
            "title": "Test Task",
            "status": "pending"
        }
        task_data.update(overrides)
        return task_data
    return create_task

# Use fixtures for common setup
@pytest.fixture
def authenticated_client(client):
    # Setup authentication
    client.headers.update({"Authorization": "Bearer valid_token"})
    return client
```

#### Error Testing

```python
def test_handle_validation_errors():
    """Test that validation errors are properly handled"""
    invalid_data = {"title": "", "status": "invalid"}

    response = client.post("/tasks/", json=invalid_data)

    assert response.status_code == 422
    assert "detail" in response.json()
    assert any("title" in error["loc"] for error in response.json()["detail"])
```

### Code Review Checklist

#### Test Quality

- [ ] Tests have descriptive names
- [ ] Tests follow AAA pattern (Arrange-Act-Assert)
- [ ] Tests are independent and isolated
- [ ] Tests cover both success and failure scenarios
- [ ] Tests use appropriate fixtures and mocks
- [ ] Tests have proper assertions
- [ ] Tests are maintainable and readable

#### Test Coverage

- [ ] New features have corresponding tests
- [ ] Edge cases are covered
- [ ] Error handling is tested
- [ ] Performance considerations are tested
- [ ] Security aspects are tested

#### Test Organization

- [ ] Tests are placed in appropriate directories
- [ ] Test files follow naming conventions
- [ ] Test classes and methods are well-organized
- [ ] Fixtures are properly scoped
- [ ] Mocks are correctly configured

### Test Maintenance

#### Keeping Tests Updated

```python
# Update tests when API changes
def test_updated_endpoint_format():
    # Update to match new API response format
    response = client.get("/tasks/")
    data = response.json()

    assert "results" in data  # New pagination format
    assert "count" in data   # Total count field
    assert isinstance(data["results"], list)
```

#### Refactoring Tests

```python
# Extract common test logic into helpers
class TaskTestHelper:
    @staticmethod
    def create_test_task(client, **overrides):
        task_data = {
            "title": "Test Task",
            "status": "pending"
        }
        task_data.update(overrides)
        return client.post("/tasks/", json=task_data)

    @staticmethod
    def assert_task_response(response, expected_data):
        assert response.status_code == 200
        task = response.json()
        for key, value in expected_data.items():
            assert task[key] == value

# Use helper in tests
def test_task_creation_with_helper():
    response = TaskTestHelper.create_test_task(client, title="Helper Test")
    TaskTestHelper.assert_task_response(response, {"title": "Helper Test"})
```

#### Deprecating Tests

```python
# Mark deprecated tests
@pytest.mark.deprecated(reason="Replaced by new API endpoint")
def test_legacy_endpoint():
    pass

# Remove old tests after migration period
# Delete file: tests/legacy/test_old_api.py
```

### Documentation Requirements

#### Test Documentation

```python
def test_complex_business_logic():
    """
    Test complex business logic for task scheduling.

    This test verifies that:
    1. Tasks are scheduled based on priority
    2. Due dates are respected
    3. Resource conflicts are resolved
    4. Notifications are sent appropriately

    Edge cases tested:
    - Tasks with same due date
    - Tasks requiring same resources
    - Tasks with dependencies

    Related requirements: REQ-001, REQ-002
    """
    pass
```

#### API Documentation for Tests

```python
# Document test API usage
class TaskAPITests:
    """
    Tests for Task API endpoints.

    Base URL: http://localhost:8000/api/tasks/
    Authentication: Bearer token required
    Content-Type: application/json

    Endpoints:
    - GET /api/tasks/ - List all tasks
    - POST /api/tasks/ - Create new task
    - GET /api/tasks/{id} - Get specific task
    - PUT /api/tasks/{id} - Update task
    - DELETE /api/tasks/{id} - Delete task
    """
    pass
```

This comprehensive testing documentation provides complete guidance for testing the Task Scheduler application across all testing layers, from unit tests to E2E tests, including troubleshooting, best practices, and contributing guidelines.
```