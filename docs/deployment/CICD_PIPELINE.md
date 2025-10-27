# CI/CD Pipeline Documentation

This document provides comprehensive documentation for the continuous integration and continuous deployment (CI/CD) pipeline used in the Task Scheduler application.

## Table of Contents

- [Overview](#overview)
- [Pipeline Architecture](#pipeline-architecture)
- [GitHub Actions Workflow](#github-actions-workflow)
- [Pipeline Jobs](#pipeline-jobs)
- [Environment Configuration](#environment-configuration)
- [Security and Secrets](#security-and-secrets)
- [Pipeline Monitoring](#pipeline-monitoring)
- [Troubleshooting](#troubleshooting)
- [Maintenance and Updates](#maintenance-and-updates)
- [Local Development with CI](#local-development-with-ci)

## Overview

### Pipeline Purpose

The CI/CD pipeline automates the following processes:
- **Code Quality Checks**: Linting, formatting, and static analysis
- **Automated Testing**: Unit, integration, and end-to-end tests
- **Security Scanning**: Vulnerability assessment and dependency checking
- **Build and Deployment**: Docker image creation and deployment
- **Coverage Reporting**: Code coverage tracking and reporting
- **Artifact Management**: Test results and build artifacts

### Pipeline Benefits

1. **Quality Assurance**: Automated checks ensure code quality
2. **Fast Feedback**: Immediate feedback on code changes
3. **Consistency**: Standardized testing and deployment processes
4. **Security**: Automated security scanning and vulnerability detection
5. **Traceability**: Complete audit trail of changes and deployments

### CI/CD Tools Used

- **GitHub Actions**: Primary CI/CD platform
- **Docker**: Containerization and deployment
- **Codecov**: Code coverage reporting
- **Bandit**: Python security scanning
- **npm audit**: Node.js vulnerability scanning
- **Playwright**: E2E testing framework

## Pipeline Architecture

### Workflow Triggers

```yaml
on:
  push:
    branches: [ main, develop ]        # Run on push to main/develop
  pull_request:
    branches: [ main ]                 # Run on PRs to main
  schedule:
    - cron: '0 2 * * *'               # Daily at 2 AM UTC
  workflow_dispatch:                   # Manual triggers
```

### Job Dependencies

```
┌─────────────────┐    ┌─────────────────┐
│  backend-tests  │    │ frontend-tests  │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          └──────────┬───────────┘
                     │
          ┌─────────────────┐
          │   e2e-tests     │
          └─────────┬───────┘
                    │
          ┌─────────────────┐
          │ security-scan  │
          └─────────┬───────┘
                    │
          ┌─────────────────┐
          │ lint-and-format │
          └─────────────────┘
```

### Parallel Execution

```yaml
jobs:
  backend-tests:    # Runs in parallel with frontend-tests
  frontend-tests:   # Runs in parallel with backend-tests
  security-scan:    # Runs in parallel with other jobs
  lint-and-format:  # Runs in parallel with other jobs
  e2e-tests:        # Depends on: [backend-tests, frontend-tests]
```

## GitHub Actions Workflow

### Complete Workflow File

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 2 * * *'  # Daily security scan
  workflow_dispatch:

env:
  NODE_VERSION: '18'
  PYTHON_VERSION: '3.10'
  POSTGRES_VERSION: '15'

jobs:
  backend-tests:
    name: Backend Tests
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:${{ env.POSTGRES_VERSION }}
        env:
          POSTGRES_PASSWORD: test_password
          POSTGRES_USER: test_user
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: ${{ env.PYTHON_VERSION }}

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

    - name: Run linting
      run: |
        pip install flake8 black isort
        flake8 backend/ --max-line-length=88 --ignore=E203,W503
        black --check backend/
        isort --check-only backend/

    - name: Run unit tests
      run: |
        pytest tests/unit/ -v --tb=short --cov=backend --cov-report=xml
      env:
        TEST_DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_db

    - name: Run integration tests
      run: |
        pytest tests/integration/ -v --tb=short --cov=backend --cov-report=xml --cov-append
      env:
        TEST_DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_db

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml
        flags: backend
        name: backend-coverage

  frontend-tests:
    name: Frontend Tests
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        cache-dependency-path: client/package-lock.json

    - name: Install dependencies
      working-directory: ./client
      run: npm ci

    - name: Run linting
      working-directory: ./client
      run: |
        npm run lint
        npm run format:check

    - name: Run type checking
      working-directory: ./client
      run: npm run type-check

    - name: Run unit tests
      working-directory: ./client
      run: npm run test:run

    - name: Generate coverage report
      working-directory: ./client
      run: npm run test:coverage

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./client/coverage/lcov.info
        flags: frontend
        name: frontend-coverage

  e2e-tests:
    name: End-to-End Tests
    runs-on: ubuntu-latest
    needs: [backend-tests, frontend-tests]

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        cache-dependency-path: client/package-lock.json

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: ${{ env.PYTHON_VERSION }}

    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt

    - name: Install frontend dependencies
      working-directory: ./client
      run: npm ci

    - name: Install Playwright browsers
      working-directory: ./client
      run: npm run test:e2e:install

    - name: Start application
      run: |
        docker compose up -d --build
        sleep 30

    - name: Wait for services to be ready
      run: |
        timeout 60 bash -c 'until curl -f http://localhost:8080/api/health; do sleep 1; done'

    - name: Run E2E tests
      working-directory: ./client
      run: npm run test:e2e
      env:
        BASE_URL: http://localhost:8080

    - name: Upload E2E test results
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: playwright-report
        path: client/playwright-report/
        retention-days: 30

    - name: Upload test videos
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: playwright-videos
        path: client/test-results/
        retention-days: 7

    - name: Stop application
      if: always()
      run: docker compose down

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: ${{ env.PYTHON_VERSION }}

    - name: Run Bandit security scan
      run: |
        pip install bandit
        bandit -r backend/ -f json -o bandit-report.json || true

    - name: Upload security scan results
      uses: actions/upload-artifact@v3
      with:
        name: security-scan-results
        path: bandit-report.json
        retention-days: 30

    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        cache-dependency-path: client/package-lock.json

    - name: Install frontend dependencies
      working-directory: ./client
      run: npm ci

    - name: Run npm audit
      working-directory: ./client
      run: npm audit --json > npm-audit-report.json || true

    - name: Upload npm audit results
      uses: actions/upload-artifact@v3
      with:
        name: npm-audit-results
        path: client/npm-audit-report.json
        retention-days: 30

  build-and-deploy:
    name: Build and Deploy
    runs-on: ubuntu-latest
    needs: [backend-tests, frontend-tests, e2e-tests]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}

    - name: Build and push backend image
      uses: docker/build-push-action@v4
      with:
        context: ./backend
        push: true
        tags: |
          ${{ secrets.DOCKER_USERNAME }}/task-scheduler-backend:latest
          ${{ secrets.DOCKER_USERNAME }}/task-scheduler-backend:${{ github.sha }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

    - name: Build and push frontend image
      uses: docker/build-push-action@v4
      with:
        context: ./client
        push: true
        tags: |
          ${{ secrets.DOCKER_USERNAME }}/task-scheduler-frontend:latest
          ${{ secrets.DOCKER_USERNAME }}/task-scheduler-frontend:${{ github.sha }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

    - name: Deploy to production
      run: |
        echo "Deployment step would go here"
        # Add actual deployment commands
```

## Pipeline Jobs

### Backend Tests Job

#### Purpose
- Run Python unit and integration tests
- Perform code quality checks (linting, formatting)
- Generate and upload coverage reports

#### Key Features
```yaml
backend-tests:
  # Database service for integration tests
  services:
    postgres:
      image: postgres:15
      # Health check configuration
      # Environment variables

  # Steps include:
  # 1. Code checkout
  # 2. Python setup
  # 3. Dependency caching
  # 4. Linting and formatting checks
  # 5. Unit tests with coverage
  # 6. Integration tests with coverage
  # 7. Coverage upload
```

#### Test Categories
```bash
# Unit tests
pytest tests/unit/ -v --tb=short --cov=backend

# Integration tests
pytest tests/integration/ -v --tb=short --cov=backend --cov-append

# Combined coverage report
pytest --cov=backend --cov-report=xml
```

### Frontend Tests Job

#### Purpose
- Run JavaScript/TypeScript unit tests
- Perform code quality checks
- Generate coverage reports

#### Key Features
```yaml
frontend-tests:
  # Steps include:
  # 1. Code checkout
  # 2. Node.js setup with caching
  # 3. Dependency installation
  # 4. Linting and formatting checks
  # 5. Type checking
  # 6. Unit tests
  # 7. Coverage generation and upload
```

#### Test Commands
```bash
# Linting
npm run lint

# Formatting check
npm run format:check

# Type checking
npm run type-check

# Unit tests
npm run test:run

# Coverage
npm run test:coverage
```

### E2E Tests Job

#### Purpose
- Run end-to-end tests with Playwright
- Test complete user workflows
- Validate application deployment

#### Key Features
```yaml
e2e-tests:
  # Dependencies: backend-tests, frontend-tests
  # Steps include:
  # 1. Code checkout
  # 2. Environment setup
  # 3. Application startup with Docker
  # 4. Playwright browser installation
  # 5. Health check wait
  # 6. E2E test execution
  # 7. Artifact upload on failure
  # 8. Cleanup
```

#### Test Execution
```bash
# Install browsers
npm run test:e2e:install

# Run E2E tests
npm run test:e2e

# Run with specific browser
npm run test:e2e:chrome
```

### Security Scan Job

#### Purpose
- Perform automated security scanning
- Check for known vulnerabilities
- Generate security reports

#### Security Tools
```bash
# Python security scanning
bandit -r backend/ -f json -o bandit-report.json

# Node.js vulnerability scanning
npm audit --json > npm-audit-report.json
```

### Build and Deploy Job

#### Purpose
- Build Docker images
- Push to container registry
- Deploy to production environment

#### Build Process
```yaml
build-and-deploy:
  # Conditions: main branch, push event
  # Steps include:
  # 1. Docker Buildx setup
  # 2. Registry authentication
  # 3. Backend image build and push
  # 4. Frontend image build and push
  # 5. Production deployment
```

## Environment Configuration

### Environment Variables

#### Global Environment Variables
```yaml
env:
  NODE_VERSION: '18'
  PYTHON_VERSION: '3.10'
  POSTGRES_VERSION: '15'
```

#### Job-Specific Environment Variables
```yaml
# Backend tests
env:
  TEST_DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_db

# E2E tests
env:
  BASE_URL: http://localhost:8080
  CI: true
```

### Database Configuration

#### Test Database Setup
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
    ports:
      - 5432:5432
```

#### Health Check Implementation
```python
# backend/health.py
from fastapi import APIRouter
from sqlalchemy.orm import Session
from backend.db import get_db

router = APIRouter()

@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    try:
        # Test database connection
        db.execute("SELECT 1")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}
```

### Docker Configuration

#### Multi-stage Dockerfiles
```dockerfile
# backend/Dockerfile
FROM python:3.10-slim as builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.10-slim as runtime

WORKDIR /app
COPY --from=builder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Docker Compose for Testing
```yaml
# docker compose.test.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.test
    environment:
      - TEST_DATABASE_URL=postgresql://test_user:test_password@db:5432/test_db
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./tests:/app/tests

  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: test_password
      POSTGRES_USER: test_user
      POSTGRES_DB: test_db
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U test_user"]
      interval: 10s
      timeout: 5s
      retries: 5
```

## Security and Secrets

### GitHub Secrets Configuration

#### Required Secrets
```bash
# GitHub Repository Settings > Secrets > Actions
DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-password
CODECOV_TOKEN=your-codecov-token
```

#### Secret Usage in Workflow
```yaml
- name: Login to Docker Hub
  uses: docker/login-action@v2
  with:
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_PASSWORD }}

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
```

### Security Best Practices

#### Minimal Permissions
```yaml
# Use least privilege principle
permissions:
  contents: read
  packages: write
  pull-requests: write
```

#### Environment Isolation
```yaml
# Different environments for different branches
- name: Deploy to staging
  if: github.ref == 'refs/heads/develop'
  run: deploy-staging.sh

- name: Deploy to production
  if: github.ref == 'refs/heads/main'
  run: deploy-production.sh
```

## Pipeline Monitoring

### Status Badges

Add status badges to README.md:
```markdown
![CI/CD Pipeline](https://github.com/username/repo/workflows/CI%2FCD%20Pipeline/badge.svg)
![Backend Tests](https://github.com/username/repo/workflows/Backend%20Tests/badge.svg)
![Frontend Tests](https://github.com/username/repo/workflows/Frontend%20Tests/badge.svg)
![Coverage](https://codecov.io/gh/username/repo/branch/main/graph/badge.svg)
```

### Notification Setup

#### Slack Notifications
```yaml
- name: Notify Slack on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: failure
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

#### Email Notifications
```yaml
- name: Send email notification
  if: failure()
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 587
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: "Pipeline Failed: ${{ github.repository }}"
    body: |
      Pipeline failed for commit ${{ github.sha }}
      Repository: ${{ github.repository }}
      Branch: ${{ github.ref }}
      Author: ${{ github.actor }}
```

### Metrics and Analytics

#### Coverage Tracking
```yaml
- name: Coverage comment
  if: github.event_name == 'pull_request'
  uses: romeovs/lcov-reporter-action@v0.3.3
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    delete-old-comments: true
```

#### Performance Metrics
```yaml
- name: Performance metrics
  run: |
    # Extract timing information
    echo "Backend tests took: ${{ steps.backend-tests.outputs.duration }}"
    echo "Frontend tests took: ${{ steps.frontend-tests.outputs.duration }}"
    echo "E2E tests took: ${{ steps.e2e-tests.outputs.duration }}"
```

## Troubleshooting

### Common Pipeline Issues

#### Database Connection Failures
```yaml
# Add debugging step
- name: Debug database connection
  run: |
    echo "Testing database connection..."
    timeout 30 bash -c 'until pg_isready -h localhost -p 5432; do sleep 1; done'
    PGPASSWORD=test_password psql -h localhost -U test_user -d test_db -c "SELECT 1;"
```

#### Dependency Installation Failures
```yaml
# Clear cache and retry
- name: Clear pip cache
  run: pip cache purge

- name: Force reinstall dependencies
  run: |
    pip install --force-reinstall -r requirements.txt
```

#### E2E Test Timeouts
```yaml
# Increase timeout and add health checks
- name: Wait for application
  run: |
    timeout 120 bash -c 'until curl -f http://localhost:8080/api/health; do sleep 2; done'
    echo "Application is ready"
```

### Debug Mode

#### Enable Debug Logging
```yaml
- name: Enable debug mode
  if: github.event_name == 'workflow_dispatch'
  run: |
    echo "DEBUG=true" >> $GITHUB_ENV
    echo "CI_DEBUG=true" >> $GITHUB_ENV
```

#### Artifact Collection
```yaml
# Collect logs on failure
- name: Collect logs
  if: failure()
  run: |
    mkdir -p logs
    docker compose logs > logs/docker compose.log
    tar -czf logs.tar.gz logs/

- name: Upload logs
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: debug-logs
    path: logs.tar.gz
```

### Performance Optimization

#### Caching Strategies
```yaml
# Dependency caching
- name: Cache pip dependencies
  uses: actions/cache@v3
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
    restore-keys: |
      ${{ runner.os }}-pip-

# Docker layer caching
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v2

- name: Cache Docker layers
  uses: actions/cache@v3
  with:
    path: /tmp/.buildx-cache
    key: ${{ runner.os }}-buildx-${{ github.sha }}
    restore-keys: |
      ${{ runner.os }}-buildx-
```

#### Parallel Execution
```yaml
# Run tests in parallel
- name: Run tests in parallel
  run: |
    pytest -n auto tests/

# Split E2E tests by browser
strategy:
  matrix:
    browser: [chromium, firefox, webkit]
```

## Maintenance and Updates

### Regular Maintenance Tasks

#### Update Dependencies
```yaml
# Scheduled dependency update
- name: Update dependencies
  if: github.event_name == 'schedule'
  run: |
    # Update Python dependencies
    pip-review --auto
    # Update Node dependencies
    npm update
```

#### Clean Up Old Artifacts
```yaml
# Clean up old artifacts
- name: Clean up old artifacts
  if: github.event_name == 'schedule'
  run: |
    # Delete artifacts older than 30 days
    gh api repos/:owner/:repo/actions/artifacts \
      --jq '.artifacts[] | select(.created_at < (now - 30*24*60*60 | strftime("%Y-%m-%dT%H:%M:%SZ"))) | .id' \
      | xargs -I {} gh api --method DELETE repos/:owner/:repo/actions/artifacts/{}
```

### Version Management

#### Semantic Versioning
```yaml
# Auto-version on merge
- name: Auto-version
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  run: |
    # Extract version from package.json or setup.py
    # Create git tag
    # Update version files
```

#### Release Management
```yaml
# Create GitHub release
- name: Create release
  if: startsWith(github.ref, 'refs/tags/')
  uses: actions/create-release@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    tag_name: ${{ github.ref }}
    release_name: Release ${{ github.ref }}
    draft: false
    prerelease: false
```

## Local Development with CI

### Running Pipeline Locally

#### Docker Compose Local CI
```yaml
# docker compose.ci.yml
version: '3.8'

services:
  backend-test:
    build:
      context: ./backend
      dockerfile: Dockerfile.test
    environment:
      - TEST_DATABASE_URL=postgresql://test_user:test_password@db:5432/test_db
    command: pytest tests/
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./tests:/app/tests

  frontend-test:
    build:
      context: ./client
      dockerfile: Dockerfile.test
    command: npm run test:run
    volumes:
      - ./client:/app
      - /app/node_modules

  e2e-test:
    build:
      context: ./client
      dockerfile: Dockerfile.e2e
    environment:
      - BASE_URL=http://backend:8000
    command: npm run test:e2e
    depends_on:
      - backend-test
      - frontend-test
```

#### Local CI Scripts
```bash
#!/bin/bash
# run-local-ci.sh

echo "Running local CI pipeline..."

# Backend tests
echo "Running backend tests..."
docker compose -f docker compose.ci.yml run --rm backend-test

# Frontend tests
echo "Running frontend tests..."
docker compose -f docker compose.ci.yml run --rm frontend-test

# E2E tests
echo "Running E2E tests..."
docker compose -f docker compose.ci.yml run --rm e2e-test

echo "Local CI pipeline completed!"
```

### Pre-commit Hooks Integration

#### Pre-commit Configuration
```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: backend-tests
        name: backend tests
        entry: pytest tests/unit/
        language: system
        pass_filenames: false
        always_run: true

      - id: frontend-tests
        name: frontend tests
        entry: npm run test:run
        language: system
        pass_filenames: false
        always_run: true
        files: ^client/
```

### Development Workflow Integration

#### GitHub Actions Local Runner
```bash
# Install act for local GitHub Actions
# https://github.com/nektos/act

# Install act
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run workflow locally
act -j backend-tests
act -j frontend-tests
act -j e2e-tests
```

#### IDE Integration
```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Run Backend Tests",
      "type": "shell",
      "command": "pytest",
      "args": ["tests/unit/", "-v"],
      "group": "test",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    },
    {
      "label": "Run Frontend Tests",
      "type": "shell",
      "command": "npm",
      "args": ["run", "test:run"],
      "options": {
        "cwd": "${workspaceFolder}/client"
      },
      "group": "test"
    }
  ]
}
```

This comprehensive CI/CD pipeline documentation provides all the information needed to understand, maintain, and extend the automated testing and deployment processes for the Task Scheduler application.