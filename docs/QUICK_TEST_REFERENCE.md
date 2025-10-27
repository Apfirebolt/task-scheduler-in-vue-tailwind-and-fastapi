# ⚡ Quick Test Reference

One-page reference for common testing commands. For detailed explanations, see [Docker Test Commands](testing/DOCKER_TEST_COMMANDS.md).

## 🏗️ Setup (First Time)

```bash
# Build frontend test image (run from project root!)
docker build -f client/Dockerfile.test -t frontend-test .

# Verify image was created
docker images | grep frontend-test

# Start application services
docker compose -f docker/docker-compose.yaml up -d
```

> **Important**: Always run these commands from the project root directory (where `docker-compose.yaml` is located).

## 🚀 Quick Commands

### Frontend Tests

```bash
# Run all frontend tests
docker run --rm \
  -v "$(pwd)/client/tests:/app/tests" \
  -v "$(pwd)/client/src:/app/src" \
  frontend-test npm run test -- --run

# Run specific test file
docker run --rm \
  -v "$(pwd)/client/tests:/app/tests" \
  -v "$(pwd)/client/src:/app/src" \
  frontend-test npm test -- tests/pages/TaskTable.test.ts --run

# Run tests matching pattern
docker run --rm \
  -v "$(pwd)/client/tests:/app/tests" \
  -v "$(pwd)/client/src:/app/src" \
  frontend-test npm test -- -t "form submission" --run

# Run with coverage
docker run --rm \
  -v "$(pwd)/client/tests:/app/tests" \
  -v "$(pwd)/client/src:/app/src" \
  -v "$(pwd)/client/coverage:/app/coverage" \
  frontend-test npm run test -- --run --coverage
```

### Backend Tests

```bash
# Run all backend tests
docker compose -f docker/docker-compose.yaml exec backend python -m pytest

# Run specific test file
docker compose -f docker/docker-compose.yaml exec backend \
  python -m pytest tests/unit/test_models.py

# Run tests matching pattern
docker compose -f docker/docker-compose.yaml exec backend \
  python -m pytest -k "test_create_task"

# Run with coverage
docker compose -f docker/docker-compose.yaml exec backend \
  python -m pytest --cov=backend --cov-report=term-missing
```

## 🔍 Common Scenarios

### Smoke Test After Changes

```bash
# Frontend component test
docker run --rm \
  -v "$(pwd)/client/tests:/app/tests" \
  -v "$(pwd)/client/src:/app/src" \
  frontend-test npm test -- tests/components/Header.test.ts --run

# Backend unit test
docker compose -f docker/docker-compose.yaml exec backend \
  python -m pytest tests/unit/test_models.py -v
```

### Pre-Commit Full Test

```bash
# Backend
docker compose -f docker/docker-compose.yaml exec backend \
  python -m pytest --tb=short

# Frontend
docker run --rm \
  -v "$(pwd)/client/tests:/app/tests" \
  -v "$(pwd)/client/src:/app/src" \
  frontend-test npm run test -- --run
```

### Debug Failing Test

```bash
# Frontend (verbose output)
docker run --rm \
  -v "$(pwd)/client/tests:/app/tests" \
  -v "$(pwd)/client/src:/app/src" \
  frontend-test npm test -- tests/pages/Login.test.ts --run --reporter=verbose

# Backend (full traceback)
docker compose -f docker/docker-compose.yaml exec backend \
  python -m pytest tests/unit/test_models.py -vv --tb=long
```

## 📊 Test Shortcuts

### Frontend Test Aliases

Add to your `.bashrc` or `.zshrc`:

```bash
# Frontend test aliases
alias ft-test='docker run --rm -v "$(pwd)/client/tests:/app/tests" -v "$(pwd)/client/src:/app/src" frontend-test npm run test -- --run'
alias ft-test-file='docker run --rm -v "$(pwd)/client/tests:/app/tests" -v "$(pwd)/client/src:/app/src" frontend-test npm test -- --run'
alias ft-test-cov='docker run --rm -v "$(pwd)/client/tests:/app/tests" -v "$(pwd)/client/src:/app/src" -v "$(pwd)/client/coverage:/app/coverage" frontend-test npm run test -- --run --coverage'
alias ft-watch='docker run --rm -it -v "$(pwd)/client/tests:/app/tests" -v "$(pwd)/client/src:/app/src" frontend-test npm run test'
```

### Backend Test Aliases

```bash
# Backend test aliases
alias bt-test='docker compose -f docker/docker-compose.yaml exec backend python -m pytest'
alias bt-test-cov='docker compose -f docker/docker-compose.yaml exec backend python -m pytest --cov=backend --cov-report=term-missing'
alias bt-test-v='docker compose -f docker/docker-compose.yaml exec backend python -m pytest -v'
```

### Usage After Adding Aliases

```bash
# Run all frontend tests
ft-test

# Run specific file
ft-test-file tests/pages/TaskTable.test.ts

# Run with coverage
ft-test-cov

# Watch mode
ft-watch

# Backend tests
bt-test
bt-test-cov
bt-test-v
```

## 🐛 Quick Troubleshooting

```bash
# Rebuild frontend test image (run from project root!)
docker build -f client/Dockerfile.test --no-cache -t frontend-test .

# If you get "package.json not found" error:
# 1. Ensure you're in the project root directory
# 2. Run: pwd  # Should show .../task-scheduler-in-vue-tailwind-and-fastapi
# 3. Then retry the build command

# Restart services
docker compose -f docker/docker-compose.yaml restart

# Check service status
docker compose -f docker/docker-compose.yaml ps

# View logs
docker compose -f docker/docker-compose.yaml logs backend
docker compose -f docker/docker-compose.yaml logs frontend

# Clean restart
docker compose -f docker/docker-compose.yaml down
docker compose -f docker/docker-compose.yaml up -d
```

## 📖 Full Documentation

- [Docker Test Commands](testing/DOCKER_TEST_COMMANDS.md) - Comprehensive guide
- [Testing Guide](TESTING_GUIDE.md) - Full testing overview
- [E2E Testing](testing/E2E_TESTING.md) - Playwright tests
- [Testing Best Practices](testing/TESTING_BEST_PRACTICES.md) - Guidelines

---

**Last Updated**: October 2025
