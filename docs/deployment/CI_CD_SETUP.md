# CI/CD Setup and Testing Guide

## Overview

This document provides comprehensive guidance for setting up, configuring, and maintaining the CI/CD pipeline for the Task Scheduler application using GitHub Actions.

## 🚀 Quick Setup

### 1. Repository Configuration

Ensure your repository has the following structure:
```
.github/
├── workflows/
│   ├── backend-tests.yml
│   ├── frontend-tests.yml
│   ├── e2e-tests.yml
│   ├── security-quality.yml
│   ├── ci.yml
│   ├── test-reporting.yml
│   └── deploy.yml
└── README.md

tests/
├── unit/
├── integration/
└── conftest.py

client/tests/
├── unit/
├── e2e/
└── components/
```

### 2. Required Secrets

Configure these secrets in your GitHub repository settings:

#### Security and Integration Secrets
```yaml
# Code scanning and security
SEMGREP_APP_TOKEN: "your-semgrep-app-token"
SNYK_TOKEN: "your-snyk-token"
LHCI_GITHUB_APP_TOKEN: "your-lighthouse-ci-token"

# Notifications (optional)
SLACK_WEBHOOK_URL: "your-slack-webhook-url"
TEAMS_WEBHOOK_URL: "your-teams-webhook-url"

# Deployment (if using deploy.yml)
DOCKER_REGISTRY_TOKEN: "your-registry-token"
KUBECONFIG: "your-kubernetes-config-base64"
```

#### Getting the Tokens

**Semgrep:**
1. Go to [Semgrep App](https://semgrep.dev/manage)
2. Create a new app token
3. Add as repository secret: `SEMGREP_APP_TOKEN`

**Snyk:**
1. Sign up at [Snyk](https://snyk.io/)
2. Go to Account Settings > API Token
3. Generate new token
4. Add as repository secret: `SNYK_TOKEN`

**Lighthouse CI:**
1. Install [Lighthouse CI GitHub App](https://github.com/apps/lighthouse-ci)
2. Follow setup instructions
3. Token will be automatically provided

### 3. Environment Setup

#### Testing Database Configuration
The workflows use PostgreSQL for testing. The database configuration:

```yaml
services:
  postgres:
    image: postgres:15-alpine
    env:
      POSTGRES_USER: scheduler
      POSTGRES_PASSWORD: scheduler
      POSTGRES_DB: scheduler_test
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "scheduler"]
```

#### Node.js and Python Versions
- **Python**: 3.9, 3.10, 3.11 (primary: 3.10)
- **Node.js**: 18, 20, 22 (primary: 20)

## 🧪 Test Configuration

### Backend Testing (pytest)

#### Configuration Files
- `pytest.ini`: Main pytest configuration
- `conftest.py`: Test fixtures and setup
- `requirements-test.txt`: Testing dependencies

#### Test Structure
```
tests/
├── unit/                 # Fast unit tests
│   ├── test_models.py
│   ├── test_services.py
│   └── test_schemas.py
├── integration/          # Integration tests
│   └── test_api.py
└── conftest.py          # Shared fixtures
```

#### Running Tests Locally
```bash
# Install test dependencies
pip install -r requirements-test.txt

# Run all tests
pytest

# Run with coverage
pytest --cov=backend --cov-report=html

# Run specific test types
pytest tests/unit/
pytest tests/integration/

# Run with markers
pytest -m "not slow"
pytest -m "database"
```

### Frontend Testing (Vitest + Playwright)

#### Configuration Files
- `client/vitest.config.ts`: Vitest configuration
- `client/playwright.config.ts`: Playwright E2E configuration

#### Test Structure
```
client/tests/
├── unit/                 # Vitest unit tests
│   ├── components/
│   ├── pages/
│   └── utils/
├── e2e/                  # Playwright E2E tests
│   ├── setup/
│   ├── smoke/
│   ├── regression/
│   └── accessibility/
└── components/           # Component tests
```

#### Running Tests Locally
```bash
cd client

# Unit tests
npm run test              # Watch mode
npm run test:run         # Single run
npm run test:coverage    # With coverage

# E2E tests
npm run test:e2e         # All browsers
npm run test:e2e:chrome  # Chrome only
npm run test:e2e:docker  # With Docker stack

# Install Playwright browsers
npx playwright install
```

## 🔄 Workflow Triggers

### Automatic Triggers
- **Push to main/develop**: All workflows execute
- **Pull Request**: All workflows except deploy
- **Scheduled**: Security scans (weekly), E2E tests (daily)
- **Tag creation**: Release workflow triggers

### Manual Triggers
```bash
# Via GitHub CLI
gh workflow run ci.yml
gh workflow run e2e-tests.yml

# Via GitHub web interface
Actions -> Select workflow -> "Run workflow" button
```

### Path-Based Triggers
Workflows use path filters to optimize execution:

```yaml
on:
  push:
    paths:
      - 'backend/**'     # Triggers backend workflows
      - 'client/**'      # Triggers frontend workflows
      - 'docker compose.yaml'  # Triggers E2E workflows
```

## 📊 Test Results and Reporting

### Accessing Test Results

#### GitHub Actions UI
1. Go to Actions tab in your repository
2. Select workflow run
3. View individual job results and artifacts

#### Downloading Artifacts
```bash
# Using GitHub CLI
gh run download RUN_ID

# List available artifacts
gh run view RUN_ID --json artifacts
```

#### Coverage Reports
- **Backend**: `htmlcov/index.html` in backend-test-results artifact
- **Frontend**: `client/coverage/index.html` in frontend-test-results artifact
- **Codecov**: Automatic upload for combined coverage

### Analytics Dashboard
- Generated automatically by test-reporting workflow
- Available at: `https://[username].github.io/[repo]/test-analytics/`
- Includes trends, historical data, and performance metrics

## 🔧 Configuration Customization

### Modifying Test Suites

#### Adding New Test Types
1. Create test files in appropriate directories
2. Update workflow paths if needed
3. Add new test commands to package.json or Makefile

#### Changing Python/Node Versions
Update in workflow files:
```yaml
strategy:
  matrix:
    python-version: ['3.9', '3.10', '3.11']
    node-version: [18, 20, 22]
```

#### Customizing Security Scans
```yaml
# In security-quality.yml
- name: Run Bandit
  run: |
    bandit -r backend/ -f json -o security/bandit.json \
      --exclude tests/ --confidence-level high
```

### Environment-Specific Configuration

#### Development
```yaml
# Use local database
DATABASE_URL: "postgresql://scheduler:scheduler@localhost:5432/scheduler_dev"
```

#### Staging
```yaml
# Use staging database
DATABASE_URL: "${{ secrets.STAGING_DATABASE_URL }}"
BASE_URL: "https://staging.your-domain.com"
```

#### Production
```yaml
# Use production database
DATABASE_URL: "${{ secrets.PRODUCTION_DATABASE_URL }}"
BASE_URL: "https://your-domain.com"
```

## 🚨 Troubleshooting

### Common Issues and Solutions

#### 1. PostgreSQL Connection Failures
```bash
# Error: "could not connect to server"
# Solution: Increase health check timeout
services:
  postgres:
    options: >-
      --health-interval 10s
      --health-timeout 30s
      --health-retries 10
```

#### 2. Playwright Browser Installation
```bash
# Error: "Executable doesn't exist"
# Solution: Install browsers explicitly
- name: Install Playwright browsers
  run: npx playwright install --with-deps
```

#### 3. Docker Compose Timeouts
```bash
# Error: "timeout waiting for services"
# Solution: Increase wait times and add health checks
- name: Wait for services
  timeout-minutes: 10
  run: |
    timeout 300 bash -c '
      until docker compose ps | grep -q "Up (healthy)"; do
        sleep 10
      done
    '
```

#### 4. npm Audit Failures
```bash
# Error: "moderate vulnerabilities found"
# Solution: Update dependencies or adjust audit level
npm audit --audit-level=high
# OR
npm audit fix
```

#### 5. Cache Issues
```bash
# Solution: Clear caches
gh api repos/:owner/:repo/actions/caches --jq '.actions_caches[] | .id' | \
  xargs -I {} gh api --method DELETE repos/:owner/:repo/actions/caches/{}
```

### Debugging Workflow Failures

#### Enable Debug Logging
```yaml
- name: Debug step
  env:
    ACTIONS_STEP_DEBUG: true
    ACTIONS_RUNNER_DEBUG: true
  run: |
    set -x  # Enable command tracing
    your-command-here
```

#### Download Workflow Logs
```bash
# Using GitHub CLI
gh run download RUN_ID --log

# View specific job logs
gh run view RUN_ID --log --job=JOB_ID
```

#### Test Workflows Locally
```bash
# Install act for local GitHub Actions testing
# https://github.com/nektos/act

# Run workflow locally
act -j backend-tests
act -j frontend-tests
```

## 📈 Performance Optimization

### Reducing Workflow Runtime

#### 1. Parallel Execution
```yaml
strategy:
  matrix:
    browser: [chromium, firefox, webkit]
  fail-fast: false  # Continue on failures
```

#### 2. Smart Caching
```yaml
- name: Cache pip dependencies
  uses: actions/cache@v4
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements*.txt') }}
```

#### 3. Conditional Execution
```yaml
- name: Run expensive tests
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  run: expensive-test-suite
```

### Resource Management

#### Timeout Configuration
```yaml
jobs:
  expensive-tests:
    timeout-minutes: 30  # Prevent hanging jobs
```

#### Runner Selection
```yaml
jobs:
  tests:
    runs-on: ubuntu-latest  # Use larger runners if needed
    # runs-on: ubuntu-latest-4-cores  # More CPU/Memory
```

## 🔐 Security Best Practices

### 1. Secret Management
- Never commit secrets to repository
- Use environment-specific secrets
- Rotate secrets regularly
- Use least-privilege access

### 2. Container Security
```yaml
- name: Run Trivy security scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'your-image:tag'
    format: 'sarif'
```

### 3. Dependency Security
- Regular security scans
- Dependabot configuration
- Automated dependency updates

## 📚 Advanced Configuration

### Custom Test Runners
```yaml
- name: Custom test runner
  run: |
    python -m pytest \
      --cov=backend \
      --cov-report=xml \
      --junitxml=test-results.xml \
      --html=test-report.html \
      tests/
```

### Multi-Environment Testing
```yaml
strategy:
  matrix:
    env: [dev, staging, prod]
  include:
    - env: dev
      database_url: ${{ secrets.DEV_DB_URL }}
    - env: staging
      database_url: ${{ secrets.STAGING_DB_URL }}
```

### Integration with External Tools

#### SonarQube Integration
```yaml
- name: SonarCloud Scan
  uses: SonarSource/sonarcloud-github-action@master
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

#### Codecov Integration
```yaml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v4
  with:
    file: ./coverage.xml
    flags: unittests
    name: codecov-umbrella
```

## 📋 Maintenance Checklist

### Weekly Tasks
- [ ] Review workflow performance
- [ ] Check for Actions updates
- [ ] Review security scan results
- [ ] Update dependencies

### Monthly Tasks
- [ ] Update GitHub Actions versions
- [ ] Review and optimize caching strategies
- [ ] Clean up old artifacts and logs
- [ ] Update documentation

### Quarterly Tasks
- [ ] Comprehensive security audit
- [ ] Performance optimization review
- [ ] Cost analysis and optimization
- [ ] Workflow architecture review

## 🆘 Getting Help

### Resources
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Playwright Documentation](https://playwright.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [pytest Documentation](https://docs.pytest.org/)

### Support Channels
- GitHub Issues for repository-specific problems
- Stack Overflow for general questions
- Official tool documentation for specific issues

### Troubleshooting Template
When creating issues, include:
1. Workflow name and run ID
2. Complete error messages
3. Relevant configuration snippets
4. Steps to reproduce
5. Expected vs actual behavior

---

*Last updated: $(date)*
*Generated for Task Scheduler application*