# Testing Best Practices Guide

This guide outlines the best practices for writing high-quality, maintainable tests for the Task Scheduler application.

## Table of Contents

- [General Testing Principles](#general-testing-principles)
- [Backend Testing Best Practices](#backend-testing-best-practices)
- [Frontend Testing Best Practices](#frontend-testing-best-practices)
- [E2E Testing Best Practices](#e2e-testing-best-practices)
- [Test Organization and Structure](#test-organization-and-structure)
- [Test Data Management](#test-data-management)
- [Mocking and Stubbing](#mocking-and-stubbing)
- [Assertion Best Practices](#assertion-best-practices)
- [Performance and Optimization](#performance-and-optimization)
- [Documentation and Maintenance](#documentation-and-maintenance)

## General Testing Principles

### The Testing Pyramid

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

Follow the testing pyramid:
- **70% Unit Tests**: Fast, isolated tests of individual functions
- **20% Integration Tests**: Tests of component interactions
- **10% E2E Tests**: Critical user workflows

### FIRST Principles

- **Fast**: Tests should run quickly
- **Independent**: Tests should not depend on each other
- **Repeatable**: Tests should produce the same results every time
- **Self-Validating**: Tests should have a clear pass/fail result
- **Timely**: Tests should be written at the appropriate time

### AAA Pattern (Arrange-Act-Assert)

```python
def test_create_task_with_valid_data():
    # Arrange
    task_data = {
        "title": "Test Task",
        "description": "Test Description",
        "status": "pending"
    }

    # Act
    response = client.post("/tasks/", json=task_data)

    # Assert
    assert response.status_code == 201
    assert response.json()["title"] == "Test Task"
```

## Backend Testing Best Practices

### Test Organization

#### File Structure
```
tests/
├── unit/
│   ├── test_services.py
│   ├── test_schemas.py
│   └── test_utils.py
├── integration/
│   ├── test_api.py
│   └── test_database.py
├── fixtures.py          # Shared test data
├── conftest.py         # Pytest configuration
└── factories.py        # Test data factories
```

#### Test Naming Conventions
```python
# Good: Descriptive and specific
def test_create_task_with_valid_data_returns_201():
    """Test creating a task with valid data returns 201 status"""
    pass

def test_get_task_by_invalid_id_returns_404():
    """Test retrieving non-existent task returns 404 status"""
    pass

def test_task_service_handles_database_connection_error_gracefully():
    """Test service handles database errors appropriately"""
    pass

# Bad: Vague or generic
def test_task_1():
    pass

def test_creation():
    pass
```

### Database Testing

#### Use Fixtures for Database Setup
```python
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
def sample_task(db_session):
    """Create a sample task in the database"""
    task = model.Task(
        title="Sample Task",
        description="Sample Description",
        status="pending"
    )
    db_session.add(task)
    db_session.commit()
    db_session.refresh(task)
    return task
```

#### Test Database Operations
```python
class TestTaskRepository:
    def test_create_task_persists_data_correctly(self, db_session):
        """Test that task creation persists data correctly"""
        # Arrange
        task_data = {
            "title": "New Task",
            "description": "Task Description",
            "status": "pending"
        }

        # Act
        task = repository.create_task(task_data, db_session)

        # Assert
        assert task.id is not None
        assert task.title == "New Task"

        # Verify persistence
        retrieved_task = db_session.query(model.Task).filter_by(id=task.id).first()
        assert retrieved_task is not None
        assert retrieved_task.title == "New Task"

    def test_update_task_modifies_existing_record(self, db_session, sample_task):
        """Test that task update modifies existing record"""
        # Arrange
        update_data = {"title": "Updated Task"}

        # Act
        updated_task = repository.update_task(sample_task.id, update_data, db_session)

        # Assert
        assert updated_task.title == "Updated Task"

        # Verify persistence
        retrieved_task = db_session.query(model.Task).filter_by(id=sample_task.id).first()
        assert retrieved_task.title == "Updated Task"
```

### Service Layer Testing

#### Test Business Logic
```python
class TestTaskService:
    def test_create_task_validates_required_fields(self):
        """Test service validates required fields"""
        # Test missing title
        with pytest.raises(ValidationError, match="Title is required"):
            service.create_task({"description": "Task description"})

        # Test missing status
        with pytest.raises(ValidationError, match="Status is required"):
            service.create_task({"title": "Task title"})

    def test_create_task_sets_default_values(self):
        """Test service sets appropriate default values"""
        task_data = {"title": "Test Task", "status": "pending"}

        task = service.create_task(task_data)

        assert task.created_date is not None
        assert task.status == "pending"

    def test_create_task_rejects_invalid_status(self):
        """Test service rejects invalid status values"""
        with pytest.raises(ValidationError):
            service.create_task({"title": "Test", "status": "invalid_status"})
```

#### Test Error Handling
```python
def test_service_handles_database_errors():
    """Test service handles database errors gracefully"""
    # Mock database to raise an exception
    with patch('backend.db.get_db') as mock_get_db:
        mock_db = MagicMock()
        mock_db.commit.side_effect = Exception("Database error")
        mock_get_db.return_value = mock_db

        # Act & Assert
        with pytest.raises(DatabaseError, match="Failed to create task"):
            service.create_task({"title": "Test", "status": "pending"})
```

### API Testing

#### Test Happy Path
```python
def test_create_task_endpoint_returns_201(client, sample_task_data):
    """Test successful task creation returns 201"""
    response = client.post("/tasks/", json=sample_task_data)

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == sample_task_data["title"]
    assert data["id"] is not None
    assert "created_date" in data
```

#### Test Validation Errors
```python
def test_create_task_validation_errors(client):
    """Test API returns appropriate validation errors"""
    # Test missing required fields
    response = client.post("/tasks/", json={})

    assert response.status_code == 422
    errors = response.json()["detail"]

    assert any(error["loc"] == ["body", "title"] for error in errors)
    assert any(error["loc"] == ["body", "status"] for error in errors)

def test_create_task_invalid_status(client):
    """Test API rejects invalid status values"""
    invalid_data = {
        "title": "Test Task",
        "status": "invalid_status"
    }

    response = client.post("/tasks/", json=invalid_data)
    assert response.status_code == 422
```

#### Test Error Responses
```python
def test_get_nonexistent_task_returns_404(client):
    """Test getting non-existent task returns 404"""
    response = client.get("/tasks/99999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found"
```

### Async Testing

#### Test Async Functions
```python
@pytest.mark.asyncio
async def test_async_task_service():
    """Test async service functions"""
    task_data = {"title": "Async Task", "status": "pending"}

    result = await async_service.create_task_async(task_data)

    assert result.success is True
    assert result.data.title == "Async Task"

@pytest.mark.asyncio
async def test_async_error_handling():
    """Test async error handling"""
    with pytest.raises(AsyncTaskError):
        await async_service.process_invalid_data({})
```

#### Mock Async Functions
```python
@pytest.mark.asyncio
@patch('backend.external_api.fetch_data')
async def test_service_with_async_mock(mock_fetch):
    """Test service with mocked async function"""
    mock_fetch.return_value = {"data": "test_data"}

    result = await service.process_external_data()

    assert result == {"processed": "test_data"}
    mock_fetch.assert_called_once()
```

## Frontend Testing Best Practices

### Component Testing

#### Test Component Rendering
```typescript
describe('TaskCard Component', () => {
  it('renders task information correctly', () => {
    const task = createMockTask({
      title: 'Test Task',
      status: 'pending',
      description: 'Test Description'
    })

    const wrapper = mount(TaskCard, {
      props: { task }
    })

    expect(wrapper.find('.task-title').text()).toBe('Test Task')
    expect(wrapper.find('.task-status').text()).toBe('pending')
    expect(wrapper.find('.task-description').text()).toBe('Test Description')
  })

  it('applies correct CSS classes based on status', () => {
    const completedTask = createMockTask({ status: 'completed' })
    const wrapper = mount(TaskCard, {
      props: { task: completedTask }
    })

    expect(wrapper.find('.task-card').classes()).toContain('status-completed')
    expect(wrapper.find('.task-card').classes()).not.toContain('status-pending')
  })
})
```

#### Test User Interactions
```typescript
describe('TaskForm Component', () => {
  it('emits submit event with correct data', async () => {
    const wrapper = mount(TaskForm)

    await wrapper.find('input[placeholder="title"]').setValue('New Task')
    await wrapper.find('textarea').setValue('Task Description')
    await wrapper.find('select').setValue('pending')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted('submit')[0]).toEqual([{
      title: 'New Task',
      description: 'Task Description',
      status: 'pending'
    }])
  })

  it('validates required fields', async () => {
    const wrapper = mount(TaskForm)

    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('.error-message').exists()).toBe(true)
    expect(wrapper.find('.error-message').text()).toContain('Title is required')
    expect(wrapper.emitted('submit')).toBeFalsy()
  })
})
```

#### Test Component Props
```typescript
describe('TaskList Component', () => {
  it('displays loading state when loading prop is true', () => {
    const wrapper = mount(TaskList, {
      props: { loading: true, tasks: [] }
    })

    expect(wrapper.find('.loading-spinner').exists()).toBe(true)
    expect(wrapper.find('.task-list').exists()).toBe(false)
  })

  it('displays tasks when provided', () => {
    const tasks = createMockTasks(3)
    const wrapper = mount(TaskList, {
      props: { loading: false, tasks }
    })

    expect(wrapper.find('.loading-spinner').exists()).toBe(false)
    expect(wrapper.findAll('.task-card')).toHaveLength(3)
  })

  it('displays empty state when no tasks', () => {
    const wrapper = mount(TaskList, {
      props: { loading: false, tasks: [] }
    })

    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.find('.empty-state').text()).toContain('No tasks found')
  })
})
```

### API Integration Testing

#### Test API Calls
```typescript
describe('TaskList API Integration', () => {
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
    await wrapper.vm.$nextTick()

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/tasks/')
    expect(wrapper.findAll('.task-card')).toHaveLength(2)
  })

  it('handles API errors gracefully', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network error'))

    const wrapper = mount(TaskList)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.error-message').exists()).toBe(true)
    expect(wrapper.find('.error-message').text()).toContain('Failed to load tasks')
  })
})
```

#### Test Loading States
```typescript
describe('Loading States', () => {
  it('shows loading spinner during API call', async () => {
    mockedAxios.get.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({ data: [] }), 100))
    )

    const wrapper = mount(TaskList)

    // Initially shows loading
    expect(wrapper.find('.loading-spinner').exists()).toBe(true)

    // Wait for API call to complete
    await new Promise(resolve => setTimeout(resolve, 150))
    await wrapper.vm.$nextTick()

    // Loading state is gone
    expect(wrapper.find('.loading-spinner').exists()).toBe(false)
  })
})
```

### Vue Router Testing

#### Test Navigation
```typescript
describe('TaskDetail Component', () => {
  it('loads task based on route parameter', async () => {
    const mockTask = createMockTask({ id: 123, title: 'Test Task' })
    mockedAxios.get.mockResolvedValue({ data: mockTask })

    const wrapper = mount(TaskDetail, {
      global: {
        mocks: {
          $route: {
            params: { id: '123' }
          }
        }
      }
    })

    await wrapper.vm.$nextTick()

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/tasks/123')
    expect(wrapper.find('.task-title').text()).toBe('Test Task')
  })

  it('navigates back to task list on back button click', async () => {
    const mockPush = vi.fn()
    const wrapper = mount(TaskDetail, {
      global: {
        mocks: {
          $router: {
            push: mockPush
          }
        }
      }
    })

    await wrapper.find('[data-testid="back-button"]').trigger('click')

    expect(mockPush).toHaveBeenCalledWith('/')
  })
})
```

### Testing Composables

#### Test Composable Logic
```typescript
import { useTaskManager } from '@/composables/useTaskManager'

describe('useTaskManager Composable', () => {
  it('manages task state correctly', () => {
    const { tasks, addTask, removeTask } = useTaskManager()

    expect(tasks.value).toEqual([])

    const newTask = createMockTask()
    addTask(newTask)

    expect(tasks.value).toHaveLength(1)
    expect(tasks.value[0]).toEqual(newTask)

    removeTask(newTask.id)
    expect(tasks.value).toEqual([])
  })

  it('filters tasks by status', () => {
    const { tasks, addTask, filteredTasks, setFilter } = useTaskManager()

    const pendingTask = createMockTask({ status: 'pending' })
    const completedTask = createMockTask({ status: 'completed' })

    addTask(pendingTask)
    addTask(completedTask)

    expect(filteredTasks.value).toHaveLength(2)

    setFilter('pending')
    expect(filteredTasks.value).toHaveLength(1)
    expect(filteredTasks.value[0].status).toBe('pending')
  })
})
```

## E2E Testing Best Practices

### Page Object Model

#### Create Page Objects
```typescript
// tests/e2e/page-objects/TasksPage.ts
export class TasksPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/')
  }

  async createTask(task: TaskData): Promise<void> {
    await this.page.click('text=Add Task')
    await this.page.fill('input[placeholder="title"]', task.title)
    if (task.description) {
      await this.page.fill('textarea[placeholder="description"]', task.description)
    }
    await this.page.selectOption('select[name="status"]', task.status)
    await this.page.click('button[type="submit"]')
  }

  async getTaskCount(): Promise<number> {
    return await this.page.locator('.task-card').count()
  }

  async getTaskByTitle(title: string): Promise<Locator> {
    return this.page.locator('.task-card').filter({ hasText: title })
  }

  async waitForTaskToAppear(title: string): Promise<void> {
    await this.page.locator(`text=${title}`).waitFor({ state: 'visible' })
  }
}
```

#### Use Page Objects in Tests
```typescript
test.describe('Task Management E2E', () => {
  let tasksPage: TasksPage

  test.beforeEach(async ({ page }) => {
    tasksPage = new TasksPage(page)
    await tasksPage.goto()
  })

  test('user can create and view tasks', async ({ page }) => {
    await tasksPage.createTask({
      title: 'E2E Test Task',
      description: 'This is an E2E test task',
      status: 'pending'
    })

    await tasksPage.waitForTaskToAppear('E2E Test Task')
    const taskCount = await tasksPage.getTaskCount()
    expect(taskCount).toBeGreaterThan(0)

    const taskCard = await tasksPage.getTaskByTitle('E2E Test Task')
    await expect(taskCard).toBeVisible()
  })
})
```

### Test Organization

#### Group Related Tests
```typescript
test.describe('Task Creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('creates task with minimal data', async ({ page }) => {
    // Test minimal task creation
  })

  test('creates task with all data', async ({ page }) => {
    // Test complete task creation
  })

  test('validates required fields', async ({ page }) => {
    // Test validation
  })
})

test.describe('Task Updates', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Create a task to update
  })

  test('updates task title', async ({ page }) => {
    // Test title update
  })

  test('updates task status', async ({ page }) => {
    // Test status update
  })
})
```

### Data Management in E2E Tests

#### Create Test Data Helpers
```typescript
// tests/e2e/helpers/test-data.ts
export class TestDataHelper {
  static createTaskData(overrides: Partial<TaskData> = {}): TaskData {
    return {
      title: `Test Task ${Date.now()}`,
      description: 'Test description',
      status: 'pending',
      ...overrides
    }
  }

  static async createTaskViaAPI(page: Page, taskData: TaskData): Promise<void> {
    await page.request.post('/api/tasks/', {
      data: taskData
    })
  }

  static async cleanupTasks(page: Page): Promise<void> {
    const response = await page.request.get('/api/tasks/')
    const tasks = await response.json()

    for (const task of tasks) {
      await page.request.delete(`/api/tasks/${task.id}`)
    }
  }
}
```

#### Use Test Data in Tests
```typescript
test.describe('Task Management with Test Data', () => {
  test.beforeEach(async ({ page }) => {
    await TestDataHelper.cleanupTasks(page)
  })

  test.afterEach(async ({ page }) => {
    await TestDataHelper.cleanupTasks(page)
  })

  test('creates task with generated data', async ({ page }) => {
    const taskData = TestDataHelper.createTaskData({
      status: 'in_progress'
    })

    // Use taskData in test
    const tasksPage = new TasksPage(page)
    await tasksPage.goto()
    await tasksPage.createTask(taskData)
  })
})
```

### Wait Strategies

#### Use Appropriate Waits
```typescript
test('wait strategies', async ({ page }) => {
  // Wait for specific element
  await page.waitForSelector('.task-card', { state: 'visible' })

  // Wait for network response
  const response = await page.waitForResponse('**/api/tasks/**')
  expect(response.status()).toBe(200)

  // Wait for navigation
  await page.waitForURL('/tasks')

  // Wait for condition
  await page.waitForFunction(() => {
    return document.querySelectorAll('.task-card').length > 0
  })

  // Wait for text
  await page.waitForText('Task created successfully')
})
```

#### Avoid Fixed Waits
```typescript
// Bad: Fixed wait
test('bad example', async ({ page }) => {
  await page.click('button')
  await page.waitForTimeout(3000) // Bad practice
  expect(page.locator('.success')).toBeVisible()
})

// Good: Wait for condition
test('good example', async ({ page }) => {
  await page.click('button')
  await page.waitForSelector('.success', { state: 'visible' })
  expect(page.locator('.success')).toBeVisible()
})
```

### Accessibility Testing

#### Include Accessibility Checks
```typescript
test('page is accessible', async ({ page }) => {
  await page.goto('/')

  // Basic accessibility checks
  await expect(page.locator('h1')).toBeVisible()
  await expect(page.locator('nav')).toBeVisible()

  // Check keyboard navigation
  await page.keyboard.press('Tab')
  expect(await page.locator(':focus')).toBeVisible()

  // Check ARIA labels
  const buttons = page.locator('button')
  const count = await buttons.count()
  for (let i = 0; i < count; i++) {
    const button = buttons.nth(i)
    const ariaLabel = await button.getAttribute('aria-label')
    if (await button.isVisible() && !ariaLabel) {
      const text = await button.textContent()
      expect(text.trim()).not.toBe('')
    }
  }
})
```

## Test Organization and Structure

### File Organization

#### Backend Test Structure
```
tests/
├── unit/                    # Unit tests
│   ├── services/           # Service layer tests
│   │   ├── test_task_service.py
│   │   └── test_user_service.py
│   ├── schemas/            # Schema validation tests
│   │   └── test_task_schema.py
│   └── utils/              # Utility function tests
│       └── test_date_utils.py
├── integration/            # Integration tests
│   ├── api/               # API endpoint tests
│   │   ├── test_tasks_api.py
│   │   └── test_auth_api.py
│   └── database/          # Database integration tests
│       └── test_task_repository.py
├── fixtures/              # Test data fixtures
│   ├── __init__.py
│   └── task_fixtures.py
├── factories/             # Test data factories
│   ├── __init__.py
│   └── task_factory.py
├── conftest.py           # Pytest configuration
└── helpers.py            # Test helper functions
```

#### Frontend Test Structure
```
client/tests/
├── unit/                  # Unit tests
│   ├── components/        # Component tests
│   │   ├── TaskCard.test.ts
│   │   └── TaskForm.test.ts
│   ├── composables/       # Composable tests
│   │   └── useTaskManager.test.ts
│   └── utils/            # Utility function tests
│       └── dateUtils.test.ts
├── integration/           # Integration tests
│   └── api/              # API integration tests
│       └── taskApi.test.ts
├── e2e/                  # E2E tests
│   ├── page-objects/     # Page objects
│   ├── helpers/          # E2E helpers
│   └── specs/            # E2E test specifications
├── fixtures/             # Test fixtures
├── factories.ts          # Test data factories
├── setup.ts              # Test setup
└── utils.ts              # Test utilities
```

### Test Class Organization

#### Group Related Tests
```python
class TestTaskCreation:
    """All tests related to task creation"""

    def test_create_task_with_valid_data(self):
        """Test successful task creation"""
        pass

    def test_create_task_with_missing_title(self):
        """Test creation with missing required field"""
        pass

    def test_create_task_with_invalid_status(self):
        """Test creation with invalid status"""
        pass

class TestTaskRetrieval:
    """All tests related to task retrieval"""

    def test_get_existing_task(self):
        """Test retrieving existing task"""
        pass

    def test_get_nonexistent_task(self):
        """Test retrieving non-existent task"""
        pass

    def test_get_tasks_with_filter(self):
        """Test retrieving tasks with filters"""
        pass
```

### Test Documentation

#### Document Complex Tests
```python
def test_task_scheduling_algorithm():
    """
    Test complex task scheduling algorithm.

    This test verifies that:
    1. Tasks are scheduled based on priority and due date
    2. Resource conflicts are resolved correctly
    3. Dependencies are respected
    4. Notification scheduling works properly

    Edge cases covered:
    - Tasks with same priority and due date
    - Circular dependencies
    - Insufficient resources
    - Overdue tasks

    Related requirements: REQ-001, REQ-002, REQ-005
    """
    # Test implementation
    pass
```

## Test Data Management

### Test Data Factories

#### Backend Factories
```python
# tests/factories/task_factory.py
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
    created_date = factory.LazyFunction(datetime.now)
    due_date = factory.LazyFunction(
        lambda: datetime.now() + timedelta(days=7)
    )

    class Params:
        pending = factory.Trait(status="pending")
        completed = factory.Trait(status="completed")
        overdue = factory.Trait(
            due_date=factory.LazyFunction(
                lambda: datetime.now() - timedelta(days=1)
            )
        )
        high_priority = factory.Trait(
            title="High Priority Task",
            priority="high"
        )
```

#### Frontend Factories
```typescript
// client/tests/factories/taskFactory.ts
import { faker } from '@faker-js/faker'

export interface TaskData {
  id: number
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  dueDate: string
  createdDate: string
}

export class TaskFactory {
  static create(overrides: Partial<TaskData> = {}): TaskData {
    return {
      id: faker.datatype.number({ min: 1 }),
      title: faker.lorem.sentence(4),
      description: faker.lorem.paragraph(),
      status: faker.helpers.arrayElement(['pending', 'in_progress', 'completed']),
      dueDate: faker.date.soon(7).toISOString(),
      createdDate: faker.date.recent().toISOString(),
      ...overrides
    }
  }

  static createBatch(count: number, overrides: Partial<TaskData> = {}): TaskData[] {
    return Array.from({ length: count }, () => this.create(overrides))
  }

  static createPending(overrides: Partial<TaskData> = {}): TaskData {
    return this.create({ status: 'pending', ...overrides })
  }

  static createCompleted(overrides: Partial<TaskData> = {}): TaskData {
    return this.create({ status: 'completed', ...overrides })
  }
}
```

### Test Fixtures

#### Reusable Fixtures
```python
# tests/fixtures/task_fixtures.py
import pytest
from tests.factories.task_factory import TaskFactory

@pytest.fixture
def sample_task_data():
    """Sample valid task data for testing"""
    return {
        "title": "Sample Task",
        "description": "Sample task description",
        "status": "pending",
        "due_date": "2024-12-31T00:00:00"
    }

@pytest.fixture
def invalid_task_data():
    """Sample invalid task data for testing"""
    return {
        "title": "",  # Empty title
        "status": "invalid_status",  # Invalid status
        "due_date": "invalid_date"  # Invalid date format
    }

@pytest.fixture
def multiple_tasks(db_session):
    """Create multiple tasks for testing"""
    return TaskFactory.create_batch(5, sqlalchemy_session=db_session)
```

### Test Data Cleanup

#### Automatic Cleanup
```python
@pytest.fixture(autouse=True)
def cleanup_test_data():
    """Automatically cleanup test data after each test"""
    yield
    # Cleanup code here
    pass

@pytest.fixture
def temp_upload_dir(tmp_path):
    """Create temporary upload directory"""
    upload_dir = tmp_path / "uploads"
    upload_dir.mkdir()
    yield upload_dir
    # Cleanup is automatic with tmp_path
```

## Mocking and Stubbing

### When to Mock

#### Mock External Dependencies
```python
# Good: Mock external API calls
@patch('backend.external_api.payment_gateway.process_payment')
def test_payment_processing(mock_payment):
    mock_payment.return_value = {"status": "success", "transaction_id": "12345"}

    result = service.process_payment({"amount": 100, "currency": "USD"})

    assert result["status"] == "success"
    mock_payment.assert_called_once_with({"amount": 100, "currency": "USD"})

# Good: Mock file system operations
@patch('builtins.open', new_callable=mock_open, read_data="test data")
def test_file_processing(mock_file):
    result = service.process_file("test.txt")

    assert result == "processed: test data"
    mock_file.assert_called_once_with("test.txt", "r")
```

#### Don't Mock Business Logic
```python
# Bad: Mocking the function being tested
@patch('backend.tasks.service.create_task')
def test_create_task(mock_create):
    # This doesn't test the actual function!
    pass

# Good: Test actual business logic
def test_create_task_business_logic():
    # Test the real implementation
    pass
```

### Mock Configuration

#### Proper Mock Setup
```python
# Use context managers for mocks
def test_with_context_manager():
    with patch('module.function') as mock_function:
        mock_function.return_value = "mocked_value"
        result = some_function()
        assert result == "mocked_value"
    # Mock automatically restored

# Use fixtures for common mocks
@pytest.fixture
def mock_external_api():
    with patch('backend.external_api.client.get') as mock_get:
        mock_get.return_value = {"data": "test_data"}
        yield mock_get

def test_with_fixture(mock_external_api):
    result = service.fetch_external_data()
    assert result == {"data": "test_data"}
```

### Frontend Mocking

#### Mock API Calls
```typescript
// client/tests/setup.ts
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}))

// In test files
import axios from 'axios'
const mockedAxios = axios as any

beforeEach(() => {
  vi.clearAllMocks()
})

test('component with mocked API', async () => {
  const mockTasks = [createMockTask()]
  mockedAxios.get.mockResolvedValue({ data: mockTasks })

  const wrapper = mount(TaskList)
  await wrapper.vm.$nextTick()

  expect(mockedAxios.get).toHaveBeenCalledWith('/api/tasks/')
  expect(wrapper.findAll('.task-card')).toHaveLength(1)
})
```

## Assertion Best Practices

### Specific Assertions

#### Use Precise Assertions
```python
# Good: Specific assertions
def test_task_creation():
    response = client.post("/tasks/", json=task_data)

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == task_data["title"]
    assert data["status"] == task_data["status"]
    assert "id" in data
    assert "created_date" in data

# Bad: Generic assertions
def test_task_creation_bad():
    response = client.post("/tasks/", json=task_data)
    assert response.status_code == 200  # Too generic
    assert response.json() is not None  # Not specific enough
```

#### Assert Behavior, Not Implementation
```python
# Good: Assert behavior
def test_task_sorting():
    tasks = service.get_sorted_tasks("by_date")
    dates = [task.created_date for task in tasks]
    assert dates == sorted(dates)

# Bad: Assert implementation details
def test_task_sorting_bad():
    # This depends on internal implementation
    assert service._sort_method == "quicksort"
```

### Error Assertions

#### Test Error Conditions
```python
def test_validation_error():
    with pytest.raises(ValidationError) as exc_info:
        service.create_task({"title": "", "status": "invalid"})

    # Assert specific error details
    errors = exc_info.value.errors
    assert any(error["field"] == "title" for error in errors)
    assert any(error["message"] == "Title is required" for error in errors)

def test_database_error():
    with patch('backend.db.session.commit') as mock_commit:
        mock_commit.side_effect = Exception("Database error")

        with pytest.raises(DatabaseError) as exc_info:
            service.create_task(valid_task_data)

        assert "Failed to create task" in str(exc_info.value)
```

### Frontend Assertions

#### Test Component State
```typescript
test('component state updates correctly', async () => {
  const wrapper = mount(TaskCounter)

  expect(wrapper.vm.taskCount).toBe(0)

  await wrapper.vm.addTask()

  expect(wrapper.vm.taskCount).toBe(1)
  expect(wrapper.find('.task-count').text()).toBe('1 task')
})
```

#### Test DOM Updates
```typescript
test('DOM updates after data change', async () => {
  const wrapper = mount(TaskList, {
    props: { tasks: [] }
  })

  expect(wrapper.find('.empty-state').exists()).toBe(true)

  await wrapper.setProps({ tasks: [createMockTask()] })
  await wrapper.vm.$nextTick()

  expect(wrapper.find('.empty-state').exists()).toBe(false)
  expect(wrapper.findAll('.task-card')).toHaveLength(1)
})
```

## Performance and Optimization

### Fast Unit Tests

#### Keep Tests Fast
```python
# Good: Fast unit test
def test_task_validation():
    validator = TaskValidator()

    result = validator.validate({"title": "Valid Title"})
    assert result.is_valid is True

# Bad: Slow test with unnecessary setup
def test_task_validation_slow():
    # Don't set up database for unit test
    db_session = create_test_database()  # Unnecessary
    validator = TaskValidator(db_session)  # Unneeded dependency

    result = validator.validate({"title": "Valid Title"})
    assert result.is_valid is True
```

#### Use Efficient Test Data
```python
# Good: Minimal test data
def test_task_title_validation():
    task = Task(title="Valid Title")
    assert task.is_valid() is True

# Bad: Excessive test data
def test_task_title_validation_slow():
    task = Task(
        title="Valid Title",
        description="Long description that's not needed",
        status="pending",
        priority="high",
        due_date=datetime.now(),
        assignee=User(name="User", email="user@example.com"),
        tags=["tag1", "tag2", "tag3"],
        attachments=[Attachment(...)]
    )
    assert task.is_valid() is True
```

### Parallel Testing

#### Configure Parallel Execution
```bash
# Install pytest-xdist
pip install pytest-xdist

# Run tests in parallel
pytest -n auto

# Use specific number of workers
pytest -n 4

# Run only specific tests in parallel
pytest tests/unit/ -n auto
```

#### Ensure Test Isolation
```python
# Good: Tests are isolated
@pytest.fixture(scope="function")
def isolated_db():
    # Create fresh database for each test
    pass

# Bad: Tests share state
@pytest.fixture(scope="session")
def shared_db():
    # All tests share the same database - can cause issues
    pass
```

### Memory Optimization

#### Clean Up Resources
```python
@pytest.fixture
def large_dataset():
    data = create_large_dataset(10000)
    try:
        yield data
    finally:
        # Explicit cleanup
        data.clear()
        gc.collect()

# Or use generators for large data
def generate_test_data(count):
    for i in range(count):
        yield {"title": f"Task {i}", "status": "pending"}
```

## Documentation and Maintenance

### Test Documentation

#### Document Complex Scenarios
```python
def test_complex_scheduling_logic():
    """
    Test task scheduling with multiple constraints.

    Scenario: Schedule tasks considering:
    1. Task dependencies
    2. Resource availability
    3. Priority levels
    4. Due dates

    Expected behavior:
    - Tasks are scheduled in dependency order
    - Resource conflicts are resolved by priority
    - Due dates are respected when possible
    - Overdue tasks get highest priority

    Test data setup:
    - Task A depends on Task B
    - Task C requires same resource as Task B
    - Task D has highest priority but latest due date
    """
    # Complex test implementation
    pass
```

### Test Maintenance

#### Keep Tests Updated
```python
# When API changes, update tests accordingly
def test_updated_api_response_format():
    response = client.get("/tasks/")

    # Updated to match new API format
    assert "results" in response.json()  # New pagination format
    assert "count" in response.json()     # Total count field
    assert "next" in response.json()     # Pagination links
```

#### Refactor Test Code
```python
# Extract common test logic
class TaskTestHelper:
    @staticmethod
    def create_valid_task_data(**overrides):
        data = {
            "title": "Test Task",
            "status": "pending"
        }
        data.update(overrides)
        return data

    @staticmethod
    def assert_task_response(response, expected_data):
        assert response.status_code == 200
        task = response.json()
        for key, value in expected_data.items():
            assert task[key] == value

# Use helper in tests
def test_task_creation_with_helper():
    task_data = TaskTestHelper.create_valid_task_data(title="Helper Test")
    response = client.post("/tasks/", json=task_data)

    TaskTestHelper.assert_task_response(response, {"title": "Helper Test"})
```

### Code Review Guidelines

#### Review Checklist for Tests

**Test Quality**
- [ ] Test has descriptive name
- [ ] Test follows AAA pattern
- [ ] Test is independent and isolated
- [ ] Test covers both success and failure scenarios
- [ ] Test uses appropriate fixtures

**Assertions**
- [ ] Assertions are specific and meaningful
- [ ] Assertions test behavior, not implementation
- [ ] Error conditions are properly tested

**Mocking**
- [ ] External dependencies are properly mocked
- [ ] Mocks are configured correctly
- [ ] Mocks are cleaned up after tests

**Performance**
- [ ] Test runs quickly
- [ ] Test doesn't use unnecessary resources
- [ ] Test data is minimal and focused

This comprehensive best practices guide should help maintain high-quality, maintainable tests across the entire testing stack.