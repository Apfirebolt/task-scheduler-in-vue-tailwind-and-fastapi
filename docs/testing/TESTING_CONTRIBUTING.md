# Testing Contributing Guidelines

This guide provides comprehensive guidelines for contributing to the testing infrastructure and test suite of the Task Scheduler application.

## Table of Contents

- [Getting Started](#getting-started)
- [Setting Up Development Environment](#setting-up-development-environment)
- [Writing New Tests](#writing-new-tests)
- [Test Categories and When to Use Them](#test-categories-and-when-to-use-them)
- [Test Structure and Naming Conventions](#test-structure-and-naming-conventions)
- [Code Review Process](#code-review-process)
- [Test Maintenance](#test-maintenance)
- [Coverage Requirements](#coverage-requirements)
- [Common Patterns and Examples](#common-patterns-and-examples)
- [Resources and Learning](#resources-and-learning)

## Getting Started

### Prerequisites

Before contributing tests, ensure you have:

- **Python 3.10+** installed
- **Node.js 18+** installed
- **Docker & Docker Compose** installed
- **Git** configured
- **IDE** with testing support (VS Code, PyCharm, etc.)

### Initial Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd task-scheduler-in-vue-tailwind-and-fastapi
   ```

2. **Set Up Python Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Set Up Node Environment**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Run Initial Tests**
   ```bash
   # Backend tests
   pytest

   # Frontend tests
   cd client
   npm run test:run

   # E2E tests (requires running application)
   docker compose up -d --build
   sleep 30
   npm run test:e2e
   ```

## Setting Up Development Environment

### IDE Configuration

#### VS Code Setup

Install these extensions:
- **Python** (Microsoft)
- **Vitest** (Zixuan Chen)
- **Playwright Test for VSCode** (Microsoft)
- **GitLens** (GitKraken)
- **Pylance** (Microsoft)

Configure workspace settings (`.vscode/settings.json`):
```json
{
  "python.defaultInterpreterPath": "./venv/bin/python",
  "python.testing.pytestEnabled": true,
  "python.testing.pytestArgs": ["tests"],
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

#### PyCharm Setup

1. **Configure Python Interpreter**
   - Go to `File > Settings > Project > Python Interpreter`
   - Select your virtual environment

2. **Configure Test Runner**
   - Go to `File > Settings > Tools > Python Integrated Tools`
   - Set Default test runner to **pytest**

3. **Configure Run/Debug Configurations**
   - Create pytest configurations for different test categories
   - Create npm configurations for frontend tests

### Git Hooks Setup

Install pre-commit hooks for code quality:
```bash
pip install pre-commit
pre-commit install
```

Example `.pre-commit-config.yaml`:
```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files

  - repo: https://github.com/psf/black
    rev: 23.1.0
    hooks:
      - id: black
        language_version: python3.10

  - repo: https://github.com/pycqa/isort
    rev: 5.12.0
    hooks:
      - id: isort
```

## Writing New Tests

### Test First Development

When adding new features, follow Test-Driven Development (TDD):

1. **Write Failing Tests**
   ```python
   # tests/unit/test_new_feature.py
   def test_new_feature_returns_expected_result():
       # This test will fail initially
       result = new_feature()
       assert result == "expected_output"
   ```

2. **Implement Minimum Code to Pass**
   ```python
   # backend/new_feature.py
   def new_feature():
       return "expected_output"  # Minimum implementation
   ```

3. **Refactor and Improve**
   ```python
   # backend/new_feature.py
   def new_feature():
       """Improved implementation with proper logic"""
       # Add proper implementation here
       return "expected_output"
   ```

### Test Structure Template

#### Backend Test Template
```python
# tests/unit/test_<module_name>.py
import pytest
from unittest.mock import patch, AsyncMock
from backend.<module> import <function_or_class>

class Test<FeatureName>:
    """Test suite for <feature description>"""

    def test_<scenario>_returns_<expected_result>(self):
        """
        Test <specific scenario>.

        Given:
        - <precondition 1>
        - <precondition 2>

        When:
        - <action performed>

        Then:
        - <expected outcome 1>
        - <expected outcome 2>

        Related requirements: <requirement-id>
        """
        # Arrange
        input_data = {}
        expected_result = {}

        # Act
        result = <function_or_class>(input_data)

        # Assert
        assert result == expected_result

    @pytest.mark.parametrize("input_data,expected", [
        ({"case": 1}, "result1"),
        ({"case": 2}, "result2"),
    ])
    def test_<feature>_with_various_inputs(self, input_data, expected):
        """Test <feature> with different input scenarios"""
        # Arrange
        # Setup based on parametrized inputs

        # Act
        result = <function_or_class>(input_data)

        # Assert
        assert result == expected

    def test_<feature>_handles_error_case(self):
        """Test <feature> handles error conditions properly"""
        # Arrange
        invalid_input = {}

        # Act & Assert
        with pytest.raises(<ExpectedException>) as exc_info:
            <function_or_class>(invalid_input)

        assert "<error message>" in str(exc_info.value)
```

#### Frontend Test Template
```typescript
// client/tests/unit/components/<ComponentName>.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import <ComponentName> from '@/components/<ComponentName>.vue'

describe('<ComponentName>', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders correctly with default props', () => {
      wrapper = mount(<ComponentName>)

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.<css-class>').exists()).toBe(true)
    })

    it('displays correct content based on props', () => {
      const props = { /* prop definitions */ }
      wrapper = mount(<ComponentName>, { props })

      expect(wrapper.find('.<element>').text()).toContain('expected text')
    })
  })

  describe('User Interactions', () => {
    it('emits correct event when user clicks button', async () => {
      wrapper = mount(<ComponentName>)

      await wrapper.find('button').trigger('click')

      expect(wrapper.emitted('<event-name>')).toBeTruthy()
      expect(wrapper.emitted('<event-name>')[0]).toEqual([<expected_payload>])
    })

    it('updates internal state when user interacts', async () => {
      wrapper = mount(<ComponentName>)

      await wrapper.find('input').setValue('test value')

      expect(wrapper.vm.<state_property>).toBe('test value')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty data gracefully', () => {
      wrapper = mount(<ComponentName>, {
        props: { data: [] }
      })

      expect(wrapper.find('.empty-state').exists()).toBe(true)
    })

    it('displays loading state correctly', async () => {
      wrapper = mount(<ComponentName>, {
        props: { loading: true }
      })

      expect(wrapper.find('.loading-spinner').exists()).toBe(true)
    })
  })
})
```

#### E2E Test Template
```typescript
// client/tests/e2e/<feature-name>.spec.ts
import { test, expect } from '@playwright/test'

test.describe('<Feature Name> E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('<user story description>', async ({ page }) => {
    // Given
    // User is on the home page
    // And there are existing tasks

    // When
    // User performs action to achieve goal

    // Then
    // Expected outcome occurs
  })

  test('<another user story>', async ({ page }) => {
    // Test implementation
  })
})
```

## Test Categories and When to Use Them

### Unit Tests (70% of tests)

**Purpose**: Test individual functions, methods, and components in isolation.

**When to Write Unit Tests**:
- Business logic functions
- Utility functions
- Individual component behavior
- Data transformations
- Validation functions

**Example**:
```python
# Testing business logic
def test_task_status_transition():
    """Test task status follows valid transitions"""
    task = Task(status="pending")

    task.transition_to("in_progress")
    assert task.status == "in_progress"

    # Invalid transition should raise error
    with pytest.raises(InvalidTransitionError):
        task.transition_to("pending")  # Can't go back to pending
```

### Integration Tests (20% of tests)

**Purpose**: Test interactions between components, modules, and systems.

**When to Write Integration Tests**:
- API endpoints with database
- Component interactions
- Service layer with dependencies
- Database operations
- External API integrations

**Example**:
```python
# Testing API endpoint with database
def test_create_task_endpoint_persists_data(client, db_session):
    """Test API endpoint creates and persists task in database"""
    task_data = {"title": "Integration Test Task", "status": "pending"}

    response = client.post("/tasks/", json=task_data)

    assert response.status_code == 201

    # Verify data was persisted
    saved_task = db_session.query(Task).filter_by(title="Integration Test Task").first()
    assert saved_task is not None
    assert saved_task.status == "pending"
```

### End-to-End Tests (10% of tests)

**Purpose**: Test complete user workflows from start to finish.

**When to Write E2E Tests**:
- Critical user journeys
- Multi-step workflows
- Cross-browser compatibility
- Responsive design verification
- Accessibility testing

**Example**:
```typescript
// Testing complete user workflow
test('user can create, edit, and delete a task', async ({ page }) => {
  await page.goto('/')

  // Create task
  await page.click('text=Add Task')
  await page.fill('input[placeholder="title"]', 'E2E Test Task')
  await page.click('button[type="submit"]')
  await expect(page.locator('text=Task created successfully')).toBeVisible()

  // Edit task
  await page.locator('.task-card').filter({ hasText: 'E2E Test Task' })
    .locator('button[aria-label="Edit"]').click()
  await page.fill('input[placeholder="title"]', 'Updated E2E Task')
  await page.click('button[type="submit"]')
  await expect(page.locator('text=Task updated successfully')).toBeVisible()

  // Delete task
  await page.locator('.task-card').filter({ hasText: 'Updated E2E Task' })
    .locator('button[aria-label="Delete"]').click()
  await page.click('text=Confirm')
  await expect(page.locator('text=Task deleted successfully')).toBeVisible()
})
```

### Performance Tests (As needed)

**Purpose**: Test performance characteristics and identify bottlenecks.

**When to Write Performance Tests**:
- Critical path operations
- Database query performance
- API response times
- Memory usage monitoring
- Load testing scenarios

**Example**:
```python
@pytest.mark.slow
def test_api_response_time_under_load():
    """Test API responds within acceptable time under load"""
    import time
    from concurrent.futures import ThreadPoolExecutor

    def make_request():
        start_time = time.time()
        response = client.get("/tasks/")
        end_time = time.time()
        return end_time - start_time, response.status_code

    # Run 50 concurrent requests
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(make_request) for _ in range(50)]
        results = [future.result() for future in futures]

    # Assert performance requirements
    response_times = [r[0] for r in results if r[1] == 200]
    success_rate = len(response_times) / len(results)

    assert success_rate >= 0.95  # 95% success rate
    assert max(response_times) < 1.0  # Max response time < 1 second
```

## Test Structure and Naming Conventions

### File Naming Conventions

#### Backend Tests
```
tests/
├── unit/
│   ├── test_<module_name>.py          # Unit tests for specific module
│   ├── test_<feature_name>.py         # Feature-specific tests
│   └── test_<integration_point>.py    # Integration point tests
├── integration/
│   ├── test_api_<resource>.py         # API endpoint tests
│   ├── test_database_<feature>.py     # Database integration tests
│   └── test_external_<service>.py     # External service integration
└── e2e/                              # E2E tests (if any backend E2E)
    └── test_<user_journey>.py
```

#### Frontend Tests
```
client/tests/
├── unit/
│   ├── components/
│   │   ├── <ComponentName>.test.ts    # Component tests
│   │   └── <FeatureComponent>.test.ts
│   ├── composables/
│   │   ├── use<ComposableName>.test.ts
│   │   └── use<Feature>.test.ts
│   ├── utils/
│   │   └── <utilName>.test.ts
│   └── pages/
│       ├── <PageName>.test.ts
│       └── <FeaturePage>.test.ts
├── integration/
│   └── <feature>.test.ts              # Integration tests
└── e2e/
    ├── <user-journey>.spec.ts         # E2E test specifications
    └── <feature>.spec.ts
```

### Test Function Naming

#### Backend Test Names
```python
# Format: test_<scenario>_<expected_result>
def test_create_task_with_valid_data_returns_201():
    """Test creating task with valid data returns 201 status"""
    pass

def test_get_task_by_invalid_id_returns_404():
    """Test retrieving non-existent task returns 404 status"""
    pass

def test_task_service_handles_database_connection_error_gracefully():
    """Test service handles database errors appropriately"""
    pass
```

#### Frontend Test Names
```typescript
// Format: <description of what is being tested>
it('renders correctly with default props', () => {
  // Test implementation
})

it('emits submit event when form is submitted', () => {
  // Test implementation
})

it('displays loading state while fetching data', () => {
  // Test implementation
})

it('validates required fields and shows error messages', () => {
  // Test implementation
})
```

#### E2E Test Names
```typescript
// Format: <user story description>
test('user can create a new task', async ({ page }) => {
  // Test implementation
})

test('user can filter tasks by status', async ({ page }) => {
  // Test implementation
})

test('application is responsive on mobile devices', async ({ page }) => {
  // Test implementation
})
```

### Class and Group Organization

#### Backend Test Classes
```python
class TestTaskCreation:
    """All tests related to task creation functionality"""

    def test_create_task_with_minimum_data(self):
        pass

    def test_create_task_with_all_fields(self):
        pass

    def test_create_task_validates_required_fields(self):
        pass

class TestTaskRetrieval:
    """All tests related to task retrieval functionality"""

    def test_get_single_task(self):
        pass

    def test_get_tasks_list(self):
        pass

    def test_get_tasks_with_filters(self):
        pass
```

#### Frontend Test Groups
```typescript
describe('TaskCard Component', () => {
  describe('Rendering', () => {
    it('displays task information correctly', () => {})
    it('applies correct CSS classes based on status', () => {})
  })

  describe('User Interactions', () => {
    it('emits edit event when edit button is clicked', () => {})
    it('emits delete event when delete button is clicked', () => {})
  })

  describe('Edge Cases', () => {
    it('handles missing task data gracefully', () => {})
    it('displays loading state when task is loading', () => {})
  })
})
```

## Code Review Process

### Pull Request Guidelines

#### PR Title and Description

**Title Format**:
```
feat: add task creation tests
fix: resolve flaky E2E tests
refactor: improve test data factories
docs: update testing documentation
```

**PR Description Template**:
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] All tests pass locally
- [ ] Coverage requirements met

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated if necessary
- [ ] Tests added for new functionality
- [ ] No breaking changes without proper version bump
```

#### Review Checklist

**For Test Code Reviewers**:

**Test Quality**
- [ ] Tests have descriptive names that explain what is being tested
- [ ] Tests follow the AAA pattern (Arrange-Act-Assert)
- [ ] Tests are independent and don't rely on shared state
- [ ] Tests cover both success and failure scenarios
- [ ] Tests use appropriate fixtures and mocks

**Test Coverage**
- [ ] New features have corresponding tests
- [ ] Edge cases are covered
- [ ] Error handling is tested
- [ ] Boundary conditions are tested

**Test Implementation**
- [ ] Mocks are used appropriately (not for the code being tested)
- [ ] Test data is minimal and focused
- [ ] Assertions are specific and meaningful
- [ ] Tests are maintainable and readable

**Performance**
- [ ] Tests run quickly (unit tests)
- [ ] Tests don't use unnecessary resources
- [ ] Database cleanup is handled properly

**Frontend Specific**
- [ ] Component tests verify both rendering and behavior
- [ ] User interactions are tested
- [ ] API calls are mocked properly
- [ ] State changes are tested

### Review Process

#### 1. Self-Review Checklist

Before submitting a PR, authors should:

- [ ] Run all tests locally (`pytest`, `npm run test:run`, `npm run test:e2e`)
- [ ] Check code coverage (`pytest --cov=backend`, `npm run test:coverage`)
- [ ] Format code (`black .`, `isort .`, `npm run format`)
- [ ] Run linting (`flake8 backend/`, `npm run lint`)
- [ ] Test on different browsers if E2E tests are affected
- [ ] Verify test data cleanup

#### 2. Peer Review Guidelines

**Reviewers should focus on**:

1. **Test Design**
   - Are we testing the right things?
   - Is the test strategy appropriate?
   - Are there missing test cases?

2. **Test Quality**
   - Are tests readable and maintainable?
   - Are assertions specific and meaningful?
   - Is test data appropriate?

3. **Edge Cases**
   - Have we considered error conditions?
   - Are boundary cases tested?
   - Are integration points covered?

4. **Best Practices**
   - Are we following testing best practices?
   - Is the test pyramid balanced?
   - Are mocks used correctly?

#### 3. Approval Requirements

- **At least one approval** from a team member
- **All tests must pass** in CI/CD pipeline
- **Coverage requirements** must be met
- **No critical feedback** unresolved

## Test Maintenance

### Keeping Tests Updated

#### When Code Changes

1. **API Changes**
   ```python
   # When API response format changes
   def test_updated_api_response():
       response = client.get("/tasks/")
       data = response.json()

       # Update assertions to match new format
       assert "results" in data  # New pagination
       assert "count" in data     # Total count
       assert isinstance(data["results"], list)
   ```

2. **Component Changes**
   ```typescript
   // When component props change
   it('renders with new prop structure', () => {
     const wrapper = mount(TaskCard, {
       props: {
         task: newTaskStructure,
         newFeature: true
       }
     })

     expect(wrapper.find('.new-feature').exists()).toBe(true)
   })
   ```

3. **Database Schema Changes**
   ```python
   # When database schema changes
   @pytest.fixture
   def updated_task_data():
       return {
           "title": "Test Task",
           "status": "pending",
           "new_field": "new_value"  # Added field
       }
   ```

#### Test Refactoring

**Extract Common Test Logic**:
```python
# Before: Duplicate code in multiple tests
def test_task_creation_1():
    task_data = {"title": "Task 1", "status": "pending"}
    response = client.post("/tasks/", json=task_data)
    assert response.status_code == 201

def test_task_creation_2():
    task_data = {"title": "Task 2", "status": "pending"}
    response = client.post("/tasks/", json=task_data)
    assert response.status_code == 201

# After: Extract common logic
class TaskTestHelper:
    @staticmethod
    def create_task_via_api(client, **overrides):
        task_data = {
            "title": "Test Task",
            "status": "pending"
        }
        task_data.update(overrides)
        return client.post("/tasks/", json=task_data)

def test_task_creation_1():
    response = TaskTestHelper.create_task_via_api(client, title="Task 1")
    assert response.status_code == 201
```

**Parameterize Similar Tests**:
```python
# Before: Multiple similar tests
def test_validation_missing_title():
    with pytest.raises(ValidationError):
        TaskSchema(title="", status="pending")

def test_validation_missing_status():
    with pytest.raises(ValidationError):
        TaskSchema(title="Task", status="")

# After: Parameterized test
@pytest.mark.parametrize("field,value,expected_error", [
    ("title", "", "Title is required"),
    ("status", "", "Status is required"),
    ("status", "invalid", "Invalid status value"),
])
def test_validation_errors(field, value, expected_error):
    data = {"title": "Task", "status": "pending"}
    data[field] = value

    with pytest.raises(ValidationError) as exc_info:
        TaskSchema(**data)

    assert expected_error in str(exc_info.value)
```

### Test Deprecation

#### Marking Deprecated Tests
```python
@pytest.mark.deprecated(reason="Replaced by new API endpoint tests")
def test_legacy_endpoint():
    """Test old endpoint for backward compatibility"""
    pass

@pytest.mark.skip(reason="Feature removed in v2.0")
def test_removed_feature():
    """Test for feature that was removed"""
    pass
```

#### Removing Obsolete Tests
1. **Identify obsolete tests**
   - Tests for removed features
   - Tests for deprecated APIs
   - Duplicate or redundant tests

2. **Document removal**
   - Add to PR description which tests are being removed
   - Explain why they're no longer needed
   - Confirm coverage is still maintained

3. **Clean up**
   - Remove test files
   - Remove test data fixtures
   - Update documentation

## Coverage Requirements

### Coverage Targets

#### Backend Coverage Requirements
- **Overall Coverage**: >90%
- **Line Coverage**: >90%
- **Branch Coverage**: >85%
- **Function Coverage**: >90%

#### Frontend Coverage Requirements
- **Overall Coverage**: >85%
- **Line Coverage**: >85%
- **Branch Coverage**: >80%
- **Function Coverage**: >85%

### Coverage Reports

#### Generating Coverage Reports
```bash
# Backend coverage
pytest --cov=backend --cov-report=html --cov-report=term

# Frontend coverage
cd client
npm run test:coverage

# View HTML reports
open htmlcov/index.html          # Backend
open client/coverage/index.html  # Frontend
```

#### Coverage Configuration

**Backend (pytest.ini or setup.cfg)**:
```ini
[tool:pytest]
addopts = --cov=backend --cov-report=html --cov-report=term --cov-fail-under=90
```

**Frontend (vitest.config.ts)**:
```typescript
export default defineConfig({
  test: {
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
      },
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.test.{js,ts}',
        '**/*.spec.{js,ts}',
        '**/*.config.{js,ts}',
        'dist/',
        'coverage/',
      ]
    }
  }
})
```

### Interpreting Coverage Reports

#### What to Cover
- **Business logic**: Core application logic
- **API endpoints**: Request/response handling
- **Data validation**: Input validation functions
- **Error handling**: Exception handling paths
- **Component logic**: Component methods and computed properties

#### What May Not Need Coverage
- **Configuration files**: Static configuration
- **Type definitions**: TypeScript interfaces/types
- **Test utilities**: Helper functions for testing
- **Boilerplate code**: Simple getters/setters
- **Generated code**: Auto-generated files

#### Coverage Quality Guidelines
```python
# Good: Meaningful coverage
def test_complex_business_logic():
    """Test complex algorithm with multiple branches"""
    result = complex_algorithm(input_data)
    assert result.has_expected_properties

# Bad: Pointless coverage
def test_getter_method():
    """Simple getter doesn't need separate test"""
    task = Task(title="Test")
    assert task.title == "Test"  # This adds no value
```

## Common Patterns and Examples

### Backend Testing Patterns

#### Service Layer Testing
```python
class TestTaskService:
    def test_create_task_with_dependencies(self):
        """Test task creation with dependency injection"""
        # Arrange
        mock_db = create_mock_db_session()
        mock_notification = AsyncMock()

        task_data = {"title": "Test Task", "status": "pending"}

        # Act
        result = await task_service.create_task(
            task_data,
            db=mock_db,
            notification_service=mock_notification
        )

        # Assert
        assert result.title == "Test Task"
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_notification.send.assert_called_once()
```

#### API Testing with Authentication
```python
class TestAuthenticatedAPI:
    def test_protected_endpoint_requires_auth(self, client):
        """Test protected endpoint returns 401 without auth"""
        response = client.get("/protected-endpoint")
        assert response.status_code == 401

    def test_protected_endpoint_accepts_valid_token(self, client, auth_headers):
        """Test protected endpoint accepts valid authentication"""
        response = client.get("/protected-endpoint", headers=auth_headers)
        assert response.status_code == 200

    @pytest.fixture
    def auth_headers(self):
        """Create authentication headers for testing"""
        token = create_test_jwt_token()
        return {"Authorization": f"Bearer {token}"}
```

### Frontend Testing Patterns

#### Component with API Integration
```typescript
describe('TaskList with API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads tasks on mount', async () => {
    const mockTasks = [createMockTask(), createMockTask()]
    mockedAxios.get.mockResolvedValue({ data: mockTasks })

    const wrapper = mount(TaskList)
    await wrapper.vm.$nextTick()

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/tasks/')
    expect(wrapper.findAll('.task-card')).toHaveLength(2)
  })

  it('shows error message when API fails', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network error'))

    const wrapper = mount(TaskList)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.error-message').exists()).toBe(true)
    expect(wrapper.find('.error-message').text()).toContain('Failed to load')
  })

  it('retries failed API calls', async () => {
    mockedAxios.get
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ data: [createMockTask()] })

    const wrapper = mount(TaskList)
    await wrapper.vm.$nextTick()

    // Wait for retry
    await new Promise(resolve => setTimeout(resolve, 1000))
    await wrapper.vm.$nextTick()

    expect(mockedAxios.get).toHaveBeenCalledTimes(2)
    expect(wrapper.findAll('.task-card')).toHaveLength(1)
  })
})
```

#### Form Validation Testing
```typescript
describe('TaskForm Validation', () => {
  it('validates required fields on submit', async () => {
    const wrapper = mount(TaskForm)

    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('.title-error').exists()).toBe(true)
    expect(wrapper.find('.title-error').text()).toContain('Title is required')
    expect(wrapper.find('.status-error').exists()).toBe(true)
    expect(wrapper.emitted('submit')).toBeFalsy()
  })

  it('clears errors when user starts typing', async () => {
    const wrapper = mount(TaskForm)

    // Trigger validation error
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('.title-error').exists()).toBe(true)

    // Start typing
    await wrapper.find('input[name="title"]').setValue('New Task')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.title-error').exists()).toBe(false)
  })

  it('shows custom validation messages', async () => {
    const wrapper = mount(TaskForm)

    await wrapper.find('input[name="title"]').setValue('A' * 201) // Too long
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('.title-error').text()).toContain('Title must be less than 200 characters')
  })
})
```

### E2E Testing Patterns

#### Multi-Step Workflow Testing
```typescript
test('complete task management workflow', async ({ page }) => {
  // Step 1: Create task
  await page.goto('/')
  await page.click('text=Add Task')
  await page.fill('input[placeholder="title"]', 'Workflow Test Task')
  await page.selectOption('select[name="status"]', 'pending')
  await page.click('button[type="submit"]')
  await expect(page.locator('text=Task created successfully')).toBeVisible()

  // Step 2: Edit task
  const taskCard = page.locator('.task-card').filter({ hasText: 'Workflow Test Task' })
  await taskCard.locator('button[aria-label="Edit"]').click()
  await page.fill('input[placeholder="title"]', 'Updated Workflow Task')
  await page.selectOption('select[name="status"]', 'in_progress')
  await page.click('button[type="submit"]')
  await expect(page.locator('text=Task updated successfully')).toBeVisible()

  // Step 3: Verify task appears in filtered view
  await page.selectOption('select[name="statusFilter"]', 'in_progress')
  await expect(page.locator('text=Updated Workflow Task')).toBeVisible()

  // Step 4: Delete task
  await page.locator('.task-card').filter({ hasText: 'Updated Workflow Task' })
    .locator('button[aria-label="Delete"]').click()
  await page.click('text=Confirm Delete')
  await expect(page.locator('text=Task deleted successfully')).toBeVisible()
})
```

#### Responsive Design Testing
```typescript
['Desktop', 'Tablet', 'Mobile'].forEach(device => {
  test(`${device} layout works correctly`, async ({ page }) => {
    const viewports = {
      'Desktop': { width: 1280, height: 720 },
      'Tablet': { width: 768, height: 1024 },
      'Mobile': { width: 375, height: 667 }
    }

    await page.setViewportSize(viewports[device])
    await page.goto('/')

    if (device === 'Mobile') {
      await expect(page.locator('.mobile-menu-toggle')).toBeVisible()
      await page.click('.mobile-menu-toggle')
      await expect(page.locator('.mobile-menu')).toBeVisible()
    } else {
      await expect(page.locator('.desktop-nav')).toBeVisible()
      await expect(page.locator('.mobile-menu-toggle')).not.toBeVisible()
    }
  })
})
```

## Resources and Learning

### Documentation

- **[Main Testing Guide](TESTING_GUIDE.md)**: Comprehensive testing documentation
- **[Testing Best Practices](TESTING_BEST_PRACTICES.md)**: Detailed best practices
- **[Troubleshooting Guide](../troubleshooting/TROUBLESHOOTING.md)**: Common issues and solutions
- **[CI/CD Pipeline Documentation](../deployment/CICD_PIPELINE.md)**: Pipeline setup and debugging

### Testing Frameworks

#### Backend
- **[Pytest Documentation](https://docs.pytest.org/)**: Comprehensive pytest guide
- **[Factory Boy](https://factoryboy.readthedocs.io/)**: Test data factories
- **[FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)**: FastAPI testing guide

#### Frontend
- **[Vitest Documentation](https://vitest.dev/)**: Modern JavaScript testing framework
- **[Vue Test Utils](https://test-utils.vuejs.org/)**: Vue.js testing utilities
- **[Playwright Documentation](https://playwright.dev/)**: E2E testing framework

### Learning Resources

#### Books
- **"Working Effectively with Legacy Code"** by Michael Feathers
- **"Test-Driven Development"** by Kent Beck
- **"The Art of Unit Testing"** by Roy Osherove

#### Online Courses
- **[Test-Driven Development with Python](https://www.pluralsight.com/courses/test-driven-development-python)**
- **[Vue.js Testing](https://www.vuemastery.com/courses/testing-vue)**
- **[Playwright Testing](https://playwright.dev/docs/intro)**

#### Blogs and Articles
- **[Martin Fowler's Testing Articles](https://martinfowler.com/articles/)**
- **[Testing JavaScript](https://frontendmasters.com/courses/javascript-testing/)**
- **[Modern Testing Practices](https://kentcdodds.com/blog/)**

### Community Support

- **GitHub Issues**: Report bugs and ask questions
- **Stack Overflow**: Tag questions with relevant tags
- **Discord/Slack**: Join our community channels
- **Code Reviews**: Participate in peer review process

### Contributing Workflow

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Write tests first** (TDD approach)
4. **Implement the feature**
5. **Run all tests**: Ensure everything passes
6. **Check coverage**: Meet coverage requirements
7. **Submit pull request**: Follow PR template
8. **Address feedback**: Respond to review comments
9. **Merge**: Once approved and all checks pass

Remember: **Good tests are as important as good code**. They enable safe refactoring, catch regressions, and serve as documentation for how the system should work.

Happy testing! 🚀