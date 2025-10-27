# Development Setup Guide

This document explains the development environment setup for the Task Scheduler application, including separate configurations for development and production containers.

## Overview

The project now includes two separate Docker setups:

1. **Production Environment** (`docker-compose.yaml`) - Optimized for production deployment
2. **Development Environment** (`docker/docker-compose.dev.yaml`) - Includes testing tools and development features

## Architecture

### Production Containers
- **Frontend**: Multi-stage build (Node.js + Nginx)
- **Backend**: Minimal Python runtime with only production dependencies
- **Database**: PostgreSQL 15

### Development Containers
- **Frontend-dev**: Node.js with hot reload, testing tools, and development dependencies
- **Backend-dev**: Python with testing tools, code quality checkers, and development dependencies
- **Test-runner**: Dedicated container for running tests
- **Performance-test**: Dedicated container for Locust performance testing
- **Database**: Shared PostgreSQL instance

## Quick Start

### 1. Start Development Environment

```bash
# Start all development services
./run-dev-tests.sh setup

# Or manually
docker compose -f docker/docker-compose.dev.yaml up --build -d
```

### 2. Access Services

- **Frontend**: http://localhost:3001 (with hot reload)
- **Backend API**: http://localhost:8001 (with auto-reload)
- **API Documentation**: http://localhost:8001/docs
- **Database**: localhost:5432

### 3. Run Tests

```bash
# Run all backend tests
./run-dev-tests.sh backend

# Run backend unit tests only
./run-dev-tests.sh backend unit

# Run frontend tests with coverage
./run-dev-tests.sh frontend coverage

# Run E2E tests on Chrome
./run-dev-tests.sh e2e chrome

# Run performance tests
./run-dev-tests.sh performance
```

## Available Commands

### Backend Testing

```bash
# Unit tests only
./run-dev-tests.sh backend unit

# Integration tests only
./run-dev-tests.sh backend integration

# All tests with coverage
./run-dev-tests.sh backend coverage

# All tests (default)
./run-dev-tests.sh backend
```

### Frontend Testing

```bash
# Unit tests only
./run-dev-tests.sh frontend unit

# All tests with coverage
./run-dev-tests.sh frontend coverage

# All tests (default)
./run-dev-tests.sh frontend
```

### E2E Testing

```bash
# All browsers
./run-dev-tests.sh e2e

# Chrome only
./run-dev-tests.sh e2e chrome

# Firefox only
./run-dev-tests.sh e2e firefox

# Safari (webkit) only
./run-dev-tests.sh e2e webkit

# Mobile devices
./run-dev-tests.sh e2e mobile
```

### Other Commands

```bash
# Generate comprehensive coverage reports
./run-dev-tests.sh coverage

# Run linting and code quality checks
./run-dev-tests.sh lint

# Show logs for all services
./run-dev-tests.sh logs

# Show logs for specific service
./run-dev-tests.sh logs backend-dev

# Stop and clean development environment
./run-dev-tests.sh clean
```

## Development Tools Included

### Backend Development Container
- **Testing**: pytest, pytest-cov, pytest-mock, pytest-xdist, pytest-html, pytest-benchmark
- **Performance**: locust
- **Code Quality**: black, isort, flake8, mypy, bandit, safety
- **Development**: uvicorn with auto-reload

### Frontend Development Container
- **Testing**: vitest, @playwright/test, @testing-library/vue
- **Coverage**: @vitest/coverage-v8
- **Development**: Vite with hot reload
- **Browsers**: Playwright browsers for E2E testing

## Manual Test Execution

### Backend Tests

```bash
# Enter backend container
docker compose -f docker/docker-compose.dev.yaml exec backend-dev bash

# Run specific test file
python -m pytest tests/unit/test_models.py -v

# Run tests with specific markers
python -m pytest -m unit -v
python -m pytest -m integration -v
python -m pytest -m database -v

# Run tests with coverage
python -m pytest tests/ --cov=backend --cov-report=html

# Run performance tests
locust -f tests/performance/locustfile.py --headless --host http://backend-dev:8000 --users 10 --spawn-rate 2 --run-time 30s
```

### Frontend Tests

```bash
# Enter frontend container
docker compose -f docker/docker-compose.dev.yaml exec frontend-dev bash

# Run unit tests in watch mode
npm run test:watch

# Run unit tests with UI
npm run test:ui

# Run E2E tests
npm run test:e2e

# Run E2E tests on specific browser
npm run test:e2e:chrome
npm run test:e2e:firefox

# Generate coverage
npm run test:coverage
```

## Code Quality Checks

### Backend
```bash
# Format code
black .
isort .

# Check formatting
black --check .
isort --check-only .

# Lint code
flake8 .

# Type checking
mypy .

# Security checks
bandit -r .
safety check
```

### Frontend
```bash
# Run linting (if configured)
npm run lint

# Check formatting
npm run format:check

# Format code
npm run format
```

## Coverage Reports

After running tests with coverage, reports are available at:

- **Backend Coverage**: `docker compose -f docker/docker-compose.dev.yaml exec backend-dev ls htmlcov/`
- **Frontend Coverage**: `docker compose -f docker/docker-compose.dev.yaml exec frontend-dev ls coverage/`

To copy reports to host:
```bash
# Backend coverage
docker compose -f docker/docker-compose.dev.yaml cp backend-dev:/app/htmlcov ./backend-coverage

# Frontend coverage
docker compose -f docker/docker-compose.dev.yaml cp frontend-dev:/app/coverage ./frontend-coverage
```

## Performance Testing

### Running Performance Tests

```bash
# Quick performance test
./run-dev-tests.sh performance

# Manual performance testing
docker compose -f docker/docker-compose.dev.yaml --profile performance up performance-test
```

### Performance Test Configuration

Performance tests are configured in `tests/performance/locustfile.py`:
- **Default users**: 10 concurrent users
- **Spawn rate**: 2 users per second
- **Duration**: 60 seconds
- **Target**: Backend development API

### Custom Performance Tests

```bash
# Custom performance test parameters
docker compose -f docker/docker-compose.dev.yaml exec backend-dev locust \
  -f tests/performance/locustfile.py \
  --headless \
  --host http://backend-dev:8000 \
  --users 20 \
  --spawn-rate 5 \
  --run-time 120s \
  --html /app/performance-reports/custom-report.html
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Development services use different ports
   - Frontend: 3001 (vs 8080 in production)
   - Backend: 8001 (vs 8000 in production)

2. **Database Connection**: Ensure database is healthy before running tests
   ```bash
   docker compose -f docker/docker-compose.dev.yaml exec db pg_isready -U scheduler
   ```

3. **Test Failures**: Check service logs
   ```bash
   ./run-dev-tests.sh logs backend-dev
   ./run-dev-tests.sh logs frontend-dev
   ```

4. **Performance Tests**: Ensure backend is running before starting performance tests

### Development vs Production

| Feature | Development | Production |
|---------|-------------|-------------|
| Hot Reload | ✅ | ❌ |
| Testing Tools | ✅ | ❌ |
| Debugging | ✅ | ❌ |
| Minification | ❌ | ✅ |
| Optimization | ❌ | ✅ |
| Security Hardening | ❌ | ✅ |

## Environment Variables

### Development
- `NODE_ENV=development`
- `VITE_API_URL=http://localhost:8001`
- Database uses `test_scheduler` for isolated testing

### Production
- `NODE_ENV=production`
- API requests go through Nginx reverse proxy
- Database uses `scheduler` database

## Best Practices

1. **Always run tests before committing**: `./run-dev-tests.sh lint && ./run-dev-tests.sh backend && ./run-dev-tests.sh frontend`
2. **Use development environment for new features**: Don't test in production
3. **Run performance tests regularly**: Monitor API performance
4. **Check coverage reports**: Maintain high test coverage
5. **Use E2E tests for critical user flows**: Ensure end-to-end functionality

## Next Steps

1. Set up your local development environment
2. Run `./run-dev-tests.sh setup` to start containers
3. Explore the codebase and run tests
4. Make changes and see hot reload in action
5. Run comprehensive tests before committing changes