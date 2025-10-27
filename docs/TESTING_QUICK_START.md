# Testing Quick Start Guide

Get up and running with testing the Task Scheduler application in minutes! This guide provides the fastest path to running tests and understanding the testing setup.

## 🚀 Quick Start (5 Minutes)

### Prerequisites Checklist

- [ ] **Docker & Docker Compose** installed
- [ ] **Git** installed
- [ ] **Code editor** (VS Code recommended)

### 1. Clone and Run Tests

```bash
# Clone the repository
git clone <repository-url>
cd task-scheduler-in-vue-tailwind-and-fastapi

# Run all tests with Docker (easiest method)
docker-compose up --build

# Run backend tests
docker-compose exec backend python -m pytest

# Run frontend tests
docker-compose exec frontend npm run test:run

# Run E2E tests
docker-compose exec frontend npm run test:e2e

# Stop services when done
docker-compose down
```

That's it! 🎉 All tests should now be running. Continue reading for more detailed instructions and local development setup.

## 📋 What You'll Be Testing

### Test Categories Overview

```
    ┌─────────────────────┐
    │   E2E Tests (10%)   │ ← Complete user workflows
    │    Playwright       │
    └─────────────────────┘
  ┌─────────────────────────┐
  │  Integration Tests (20%)│ ← API endpoints, database
  │   FastAPI + Vitest      │
  └─────────────────────────┘
┌─────────────────────────────────┐
│   Unit Tests (70%)               │ ← Business logic, components
│  pytest + Vitest                │
└─────────────────────────────────┘
```

### What Each Test Type Covers

- **Unit Tests**: Individual functions and components
- **Integration Tests**: API endpoints and database interactions
- **E2E Tests**: Complete user workflows in browsers

## 🛠️ Local Development Setup

### Option 1: Docker (Recommended)

**Pros**: Isolated environment, no local dependencies required
**Cons**: Slightly slower startup time

```bash
# Start all services
docker-compose up --build

# Services available at:
# Backend API: http://localhost:8000
# Frontend App: http://localhost:8080
# API Docs: http://localhost:8000/docs
```

### Option 2: Local Development

**Pros**: Faster iteration, better debugging
**Cons**: Requires local Python and Node.js setup

#### Backend Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start backend server
uvicorn main:app --reload

# Run tests
pytest
```

#### Frontend Setup
```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test:run
```

## 🧪 Running Tests

### Backend Tests

#### Quick Commands
```bash
# Run all backend tests
pytest

# Run with coverage
pytest --cov=backend

# Run specific test file
pytest tests/unit/test_services.py

# Run with verbose output
pytest -v

# Run only unit tests
pytest tests/unit/

# Run only integration tests
pytest tests/integration/
```

#### Test Results
```
============================= test session starts ==============================
collected 35 items

tests/unit/test_services.py::TestTaskService::test_create_task_with_valid_data PASSED [  2%]
tests/unit/test_services.py::TestTaskService::test_create_task_validation_errors PASSED [  5%]
...

============================== 35 passed in 2.34s ==============================
```

### Frontend Tests

#### Quick Commands
```bash
cd client

# Run all frontend tests
npm run test:run

# Run tests in watch mode
npm run test

# Run with UI interface
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run specific test file
npm run test:run -- Header.test.ts
```

#### Test Results
```
 ✓ src/components/Header.test.ts (2)
 ✓ src/components/TaskCard.test.ts (3)
 ✓ src/pages/AddTask.test.ts (4)

 Test Files  7 passed (7)
      Tests  14 passed (14)
   Start at  12:34:56
   Duration  2.45s
```

### E2E Tests

#### Quick Commands
```bash
cd client

# Install Playwright browsers (first time only)
npm run test:e2e:install

# Run all E2E tests
npm run test:e2e

# Run with visible browser
npm run test:e2e:headed

# Run specific browser
npm run test:e2e:chrome
npm run test:e2e:firefox
npm run test:e2e:safari

# Generate HTML report
npm run test:e2e:report
```

#### Test Results
```
Running 8 tests using 5 workers

  ✓ [chromium] › home-page.spec.ts:3:1 › Home page loads correctly
  ✓ [chromium] › task-management.spec.ts:5:1 › Create, edit, and delete task
  ✓ [firefox] › home-page.spec.ts:3:1 › Home page loads correctly
  ✓ [firefox] › task-management.spec.ts:5:1 › Create, edit, and delete task
  ✓ [webkit] › home-page.spec.ts:3:1 › Home page loads correctly
  ✓ [webkit] › task-management.spec.ts:5:1 › Create, edit, and delete task

  8 passed (15.3s)
```

## 🔍 Test Structure Overview

### Backend Test Structure
```
tests/
├── conftest.py              # Test configuration and fixtures
├── unit/                    # Unit tests
│   ├── test_services.py     # Service layer tests
│   └── test_schemas.py      # Data validation tests
└── integration/             # Integration tests
    └── test_api.py          # API endpoint tests
```

### Frontend Test Structure
```
client/tests/
├── setup.ts                 # Global test setup
├── unit/                    # Unit and component tests
│   ├── components/          # Component tests
│   └── pages/               # Page component tests
└── e2e/                     # End-to-end tests
    └── specs/               # Test specifications
```

## 📊 Understanding Test Results

### Coverage Reports

#### Backend Coverage
```bash
pytest --cov=backend --cov-report=html

# View report
open htmlcov/index.html
```

**Sample Coverage Report:**
```
Name                           Stmts   Miss  Cover
--------------------------------------------------
backend/__init__.py               1      0   100%
backend/main.py                  45      5    89%
backend/tasks/model.py           78      8    90%
backend/tasks/services.py        92     12    87%
--------------------------------------------------
TOTAL                          216     25    88%
```

#### Frontend Coverage
```bash
cd client
npm run test:coverage

# View report
open coverage/index.html
```

**Sample Coverage Report:**
```
---------- Coverage Report ----------
File                        % Stmts  % Branch  % Funcs  % Lines
-------------------------------------------------------
src/components/Header.vue     85.71    66.67   80      85.71
src/pages/AddTask.vue         92.31    83.33   90      92.31
-------------------------------------------------------
All files                    88.24    78.95   85      88.24
```

### Test Status Indicators

- ✅ **PASSED**: Test succeeded
- ❌ **FAILED**: Test failed (fix needed)
- ⏭️ **SKIPPED**: Test was skipped (intentional)
- 🔄 **PENDING**: Test is running

## 🐛 Common Issues & Quick Fixes

### Database Connection Issues
```bash
# Error: sqlalchemy.exc.OperationalError
# Fix: Reset test database
rm test.db
pytest
```

### Port Conflicts
```bash
# Error: Port 8000 is already in use
# Fix: Kill processes using ports
lsof -ti:8000 | xargs kill -9
lsof -ti:8080 | xargs kill -9
```

### Missing Dependencies
```bash
# Error: ModuleNotFoundError: No module named 'pytest'
# Fix: Install dependencies
pip install -r requirements.txt

# Error: npm ERR! Cannot find module
# Fix: Install node dependencies
cd client && npm install
```

### Browser Installation (E2E)
```bash
# Error: Executable doesn't exist: chromium
# Fix: Install Playwright browsers
cd client
npx playwright install
```

### Docker Issues
```bash
# Error: Service 'backend' failed to build
# Fix: Rebuild without cache
docker-compose build --no-cache

# Error: Container keeps restarting
# Fix: Check logs
docker-compose logs backend
```

## 🎯 Next Steps

### For Beginners
1. **Read the main testing guide**: [TESTING.md](TESTING.md)
2. **Explore the codebase**: Look at existing tests
3. **Try writing a simple test**: Add a test for a new feature

### For Intermediate Developers
1. **Study best practices**: [TESTING_BEST_PRACTICES.md](TESTING_BEST_PRACTICES.md)
2. **Learn about mocking**: Understand when and how to mock
3. **Practice TDD**: Try test-driven development

### For Advanced Developers
1. **Contribute to test infrastructure**: [TESTING_CONTRIBUTING.md](TESTING_CONTRIBUTING.md)
2. **Optimize test performance**: Improve test speed and efficiency
3. **Set up advanced CI/CD**: [CICD_PIPELINE.md](CICD_PIPELINE.md)

## 📚 Additional Resources

### Essential Reading
- [**Main Testing Guide**](TESTING.md) - Comprehensive testing documentation
- [**Best Practices Guide**](TESTING_BEST_PRACTICES.md) - How to write good tests
- [**Troubleshooting Guide**](TROUBLESHOOTING.md) - Solutions to common issues

### Quick Reference

#### Test Commands Cheat Sheet
```bash
# Backend
pytest                          # All tests
pytest -v                        # Verbose output
pytest --cov=backend             # With coverage
pytest tests/unit/               # Unit tests only
pytest -x                        # Stop on first failure

# Frontend
cd client
npm run test:run                 # All tests once
npm run test                     # Watch mode
npm run test:coverage            # Coverage report
npm run test:ui                  # UI interface

# E2E
npm run test:e2e                 # All E2E tests
npm run test:e2e:headed          # Show browser
npm run test:e2e:debug           # Debug mode
```

#### File Locations
```
Backend tests:          tests/
Frontend tests:         client/tests/
Coverage reports:       htmlcov/, client/coverage/
E2E reports:           client/playwright-report/
Test configuration:     pytest.ini, client/vitest.config.ts
```

### Getting Help

#### Debug Mode
```bash
# Backend debugging
pytest --pdb                    # Debug on failure
pytest -s                       # Show print statements

# Frontend debugging
npm run test:run -- --reporter=verbose

# E2E debugging
npm run test:e2e:debug          # Step through tests
npm run test:e2e -- --trace on  # Generate trace files
```

#### Community Support
- **GitHub Issues**: Report bugs and ask questions
- **Discussions**: Share ideas and get help
- **Documentation**: Check all docs in the `docs/` folder

## 🎉 You're Ready!

You now have:
- ✅ All tests running successfully
- ✅ Understanding of test structure
- ✅ Knowledge of common commands
- ✅ Resources for learning more

**Happy testing!** 🚀

Remember: Tests are your safety net. They enable confident refactoring, catch regressions, and serve as living documentation for how your code should work.