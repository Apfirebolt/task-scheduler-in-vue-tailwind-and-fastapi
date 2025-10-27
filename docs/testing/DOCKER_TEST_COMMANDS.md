# 🐳 Docker Test Commands Reference

## Overview

This guide provides comprehensive documentation for running tests using Docker containers in the Task Scheduler application. All test commands use Docker to ensure consistent, reproducible test environments.

## 🏗️ Architecture

### Test Infrastructure Components

1. **Frontend Test Container**: Built from `client/Dockerfile.test`
2. **Backend Test Container**: Uses production backend with test configuration
3. **Test Database**: Separate PostgreSQL instance for testing
4. **Test Networks**: Isolated Docker networks for test isolation

### Docker Images

```bash
# Build frontend test image (run from project root)
docker build -f client/Dockerfile.test -t frontend-test .

# Backend uses production image with test environment
docker compose -f docker/docker-compose.yaml build backend
```

> **Important**: Always run the build command from the project root directory (where `docker-compose.yaml` is located). The `-f client/Dockerfile.test` flag tells Docker where to find the Dockerfile, while the `.` at the end specifies the build context (project root).

## 📋 Quick Reference

### Frontend Tests

```bash
# Run all frontend tests (non-interactive)
docker run --rm \
  -v "$(pwd)/client/tests:/app/tests" \
  -v "$(pwd)/client/src:/app/src" \
  frontend-test npm run test -- --run

# Run specific test file
docker run --rm \
  -v "$(pwd)/client/tests:/app/tests" \
  -v "$(pwd)/client/src:/app/src" \
  frontend-test npm test -- tests/pages/TaskTable.test.ts --run

# Run with JSON reporter (for CI/CD)
docker run --rm \
  -v "$(pwd)/client/tests:/app/tests" \
  -v "$(pwd)/client/src:/app/src" \
  frontend-test npm test -- --reporter=json --run

# Run tests matching pattern
docker run --rm \
  -v "$(pwd)/client/tests:/app/tests" \
  -v "$(pwd)/client/src:/app/src" \
  frontend-test npm test -- -t "AOS functionality" --run

# Run with coverage report
docker run --rm \
  -v "$(pwd)/client/tests:/app/tests" \
  -v "$(pwd)/client/src:/app/src" \
  frontend-test npm run test -- --run --coverage
```

### Backend Tests

```bash
# Run all backend tests
docker compose -f docker/docker-compose.yaml exec backend python -m pytest

# Run specific test file
docker compose -f docker/docker-compose.yaml exec backend \
  python -m pytest tests/unit/test_models.py

# Run with verbose output
docker compose -f docker/docker-compose.yaml exec backend \
  python -m pytest -v

# Run with coverage report
docker compose -f docker/docker-compose.yaml exec backend \
  python -m pytest --cov=backend --cov-report=term-missing

# Run specific test by name
docker compose -f docker/docker-compose.yaml exec backend \
  python -m pytest -k "test_create_task"
```

## 🔍 Detailed Command Breakdown

### Volume Mounts Explained

Frontend test commands use volume mounts to share code between host and container:

```bash
-v "$(pwd)/client/tests:/app/tests"  # Mount test files
-v "$(pwd)/client/src:/app/src"      # Mount source code
```

**Why this approach?**
- ✅ Tests run in consistent Docker environment
- ✅ Source code changes reflected immediately
- ✅ No need to rebuild image for every test run
- ✅ Test results available on host machine

### Test Command Patterns

#### Vitest Commands (Frontend)

```bash
# Pattern: npm test -- [vitest-args]
npm test -- tests/path/to/file.test.ts --run

# Common Vitest Arguments:
# --run          : Run once without watch mode
# --reporter     : Output format (json, verbose, default)
# -t "pattern"   : Run tests matching pattern
# --coverage     : Generate coverage report
# --ui           : Open Vitest UI (requires interactive mode)
```

#### Pytest Commands (Backend)

```bash
# Pattern: python -m pytest [pytest-args] [file/directory]
python -m pytest tests/unit/test_models.py

# Common Pytest Arguments:
# -v             : Verbose output
# -k "pattern"   : Run tests matching pattern
# --cov=module   : Coverage for specific module
# --tb=short     : Shorter traceback format
# -x             : Stop on first failure
# --maxfail=n    : Stop after n failures
```

## 🎯 Test Scenarios

### Scenario 1: Quick Smoke Test

Test a specific component after making changes:

```bash
# Test single component
docker run --rm \
  -v "$(pwd)/client/tests:/app/tests" \
  -v "$(pwd)/client/src:/app/src" \
  frontend-test npm test -- tests/components/Header.test.ts --run
```

### Scenario 2: Pre-Commit Validation

Run all tests before committing:

```bash
# Backend tests
docker compose -f docker/docker-compose.yaml exec backend \
  python -m pytest --tb=short

# Frontend tests
docker run --rm \
  -v "$(pwd)/client/tests:/app/tests" \
  -v "$(pwd)/client/src:/app/src" \
  frontend-test npm run test -- --run
```

### Scenario 3: CI/CD Pipeline

Automated testing with detailed reports:

```bash
# Backend with coverage
docker compose -f docker/docker-compose.yaml exec backend \
  python -m pytest --cov=backend --cov-report=html --cov-report=xml

# Frontend with JSON output
docker run --rm \
  -v "$(pwd)/client/tests:/app/tests" \
  -v "$(pwd)/client/src:/app/src" \
  frontend-test npm test -- --reporter=json --run > test-results.json
```

### Scenario 4: Debugging Failed Tests

Get detailed output for failing tests:

```bash
# Backend with full traceback
docker compose -f docker/docker-compose.yaml exec backend \
  python -m pytest tests/unit/test_models.py -vv --tb=long

# Frontend with verbose reporter
docker run --rm \
  -v "$(pwd)/client/tests:/app/tests" \
  -v "$(pwd)/client/src:/app/src" \
  frontend-test npm test -- tests/pages/Login.test.ts --run --reporter=verbose
```

### Scenario 5: Test Development Workflow

Interactive test development (watch mode):

```bash
# Frontend watch mode (re-runs tests on file changes)
docker run --rm -it \
  -v "$(pwd)/client/tests:/app/tests" \
  -v "$(pwd)/client/src:/app/src" \
  frontend-test npm run test

# Note: Use Ctrl+C to exit watch mode
```

## 🔧 Advanced Usage

### Testing Specific Features

```bash
# Test all authentication-related tests
docker run --rm \
  -v "$(pwd)/client/tests:/app/tests" \
  -v "$(pwd)/client/src:/app/src" \
  frontend-test npm test -- -t "authentication" --run

# Test all API calls
docker run --rm \
  -v "$(pwd)/client/tests:/app/tests" \
  -v "$(pwd)/client/src:/app/src" \
  frontend-test npm test -- -t "API" --run

# Backend database tests only
docker compose -f docker/docker-compose.yaml exec backend \
  python -m pytest tests/integration/test_database.py
```

### Coverage Reports

```bash
# Generate HTML coverage report (frontend)
docker run --rm \
  -v "$(pwd)/client/tests:/app/tests" \
  -v "$(pwd)/client/src:/app/src" \
  -v "$(pwd)/client/coverage:/app/coverage" \
  frontend-test npm run test -- --run --coverage

# View coverage report
# Open client/coverage/index.html in browser

# Generate HTML coverage report (backend)
docker compose -f docker/docker-compose.yaml exec backend \
  python -m pytest --cov=backend --cov-report=html

# Copy coverage report from container
docker compose -f docker/docker-compose.yaml cp \
  backend:/app/htmlcov ./backend-coverage-report
```

### Parallel Test Execution

```bash
# Frontend with multiple workers (faster)
docker run --rm \
  -v "$(pwd)/client/tests:/app/tests" \
  -v "$(pwd)/client/src:/app/src" \
  frontend-test npm run test -- --run --maxWorkers=4

# Backend with multiple workers
docker compose -f docker/docker-compose.yaml exec backend \
  python -m pytest -n 4  # Requires pytest-xdist
```

## 🐛 Troubleshooting

### Common Issues

#### Issue: "frontend-test image not found"

**Solution:**
```bash
# Build the frontend test image from project root
docker build -f client/Dockerfile.test -t frontend-test .

# Verify the image was created
docker images | grep frontend-test
```

**Common mistake**: Running the build command from the wrong directory. Always run from the project root where `docker-compose.yaml` is located.

#### Issue: "Cannot connect to backend service"

**Solution:**
```bash
# Start services first
docker compose -f docker/docker-compose.yaml up -d

# Then run tests
docker compose -f docker/docker-compose.yaml exec backend python -m pytest
```

#### Issue: "Permission denied" on volumes

**Solution:**
```bash
# Fix permissions (Linux/Mac)
sudo chown -R $USER:$USER client/tests client/src

# Or run with appropriate user
docker run --rm --user $(id -u):$(id -g) \
  -v "$(pwd)/client/tests:/app/tests" \
  -v "$(pwd)/client/src:/app/src" \
  frontend-test npm run test -- --run
```

#### Issue: "Tests passing locally but failing in Docker"

**Possible causes:**
1. Environment variables not set
2. Different Node.js/Python versions
3. Missing dependencies

**Debug steps:**
```bash
# Check Node version in container
docker run --rm frontend-test node --version

# Check installed packages
docker run --rm frontend-test npm list

# Interactive shell for debugging
docker run --rm -it \
  -v "$(pwd)/client/tests:/app/tests" \
  -v "$(pwd)/client/src:/app/src" \
  frontend-test sh
```

#### Issue: "Out of memory" errors

**Solution:**
```bash
# Increase Docker memory limit (Docker Desktop settings)
# Or run tests sequentially
docker run --rm \
  -v "$(pwd)/client/tests:/app/tests" \
  -v "$(pwd)/client/src:/app/src" \
  frontend-test npm run test -- --run --maxWorkers=1
```

## 📊 Output Formats

### JSON Output (for CI/CD)

```bash
# Frontend
docker run --rm \
  -v "$(pwd)/client/tests:/app/tests" \
  -v "$(pwd)/client/src:/app/src" \
  frontend-test npm test -- --reporter=json --run > frontend-results.json

# Backend
docker compose -f docker/docker-compose.yaml exec backend \
  python -m pytest --json-report --json-report-file=backend-results.json
```

### HTML Reports

```bash
# Frontend coverage
docker run --rm \
  -v "$(pwd)/client/tests:/app/tests" \
  -v "$(pwd)/client/src:/app/src" \
  -v "$(pwd)/client/coverage:/app/coverage" \
  frontend-test npm run test -- --run --coverage

# Backend coverage
docker compose -f docker/docker-compose.yaml exec backend \
  python -m pytest --cov=backend --cov-report=html
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build test image
        run: docker build -f client/Dockerfile.test -t frontend-test .
      
      - name: Run frontend tests
        run: |
          docker run --rm \
            -v "${{ github.workspace }}/client/tests:/app/tests" \
            -v "${{ github.workspace }}/client/src:/app/src" \
            frontend-test npm test -- --reporter=json --run

  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Start services
        run: docker compose -f docker/docker-compose.yaml up -d
      
      - name: Wait for services
        run: sleep 30
      
      - name: Run backend tests
        run: |
          docker compose -f docker/docker-compose.yaml exec -T backend \
            python -m pytest --cov=backend --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
```

## 📚 Additional Resources

### Package Scripts Reference

See `client/package.json` for all available npm test scripts:
- `npm run test` - Run Vitest in watch mode
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Run with coverage
- `npm run test:ui` - Open Vitest UI

### Configuration Files

- `client/vitest.config.ts` - Vitest configuration
- `config/pytest.ini` - Pytest configuration
- `client/Dockerfile.test` - Frontend test container
- `docker-compose.test.yaml` - Test environment setup

### Related Documentation

- [Testing Guide](./TESTING_GUIDE.md) - Overview of testing strategy
- [E2E Testing](./E2E_TESTING.md) - End-to-end testing with Playwright
- [Testing Best Practices](./TESTING_BEST_PRACTICES.md) - Guidelines and patterns

## 🎯 Summary

### Frontend Testing Pattern

```bash
docker run --rm \
  -v "$(pwd)/client/tests:/app/tests" \
  -v "$(pwd)/client/src:/app/src" \
  frontend-test npm test -- [test-file] [options]
```

### Backend Testing Pattern

```bash
docker compose -f docker/docker-compose.yaml exec backend \
  python -m pytest [test-file] [options]
```

### Key Points

1. ✅ Always use Docker for consistency
2. ✅ Volume mount for live code updates
3. ✅ Use `--run` flag to prevent watch mode in CI
4. ✅ Leverage reporters for structured output
5. ✅ Generate coverage reports for quality tracking

---

**Last Updated**: October 2025  
**Maintained By**: Development Team
