# GitHub Actions Workflows

This directory contains the comprehensive CI/CD pipeline for the Task Scheduler application using GitHub Actions.

## 📋 Workflow Overview

### 1. **Backend Tests** (`backend-tests.yml`)
- **Purpose**: Backend unit and integration testing
- **Triggers**: Push/PR to main/develop branches
- **Features**:
  - PostgreSQL database setup
  - pytest execution with coverage
  - Multi-Python version matrix testing
  - Security scanning with Bandit and Safety
  - Artifact upload for test results

### 2. **Frontend Tests** (`frontend-tests.yml`)
- **Purpose**: Frontend unit testing and quality checks
- **Triggers**: Push/PR to main/develop branches
- **Features**:
  - Vitest unit test execution
  - Multi-Node.js version matrix testing
  - Bundle size analysis
  - npm audit security scanning
  - TypeScript type checking

### 3. **E2E Tests** (`e2e-tests.yml`)
- **Purpose**: End-to-end testing with real browsers
- **Triggers**: Push/PR to main/develop branches, schedule, manual
- **Features**:
  - Docker Compose full stack setup
  - Cross-browser testing (Chrome, Firefox, Safari)
  - Mobile responsive testing
  - Visual regression testing
  - Performance testing with Lighthouse

### 4. **Security & Code Quality** (`security-quality.yml`)
- **Purpose**: Security scanning and code quality analysis
- **Triggers**: Push/PR to main/develop branches, weekly schedule
- **Features**:
  - Bandit (Python) and npm audit (Node.js) security scanning
  - Semgrep static analysis
  - Container vulnerability scanning with Trivy
  - Code quality checks with Black, Flake8, Pylint
  - Quality gates and PR commenting

### 5. **Continuous Integration** (`ci.yml`)
- **Purpose**: Comprehensive integration testing and deployment readiness
- **Triggers**: Push/PR to main/develop branches
- **Features**:
  - Multi-environment matrix testing
  - Health checks and syntax validation
  - Integration testing with live services
  - Performance benchmarking
  - Deployment readiness validation

### 6. **Test Reporting & Analytics** (`test-reporting.yml`)
- **Purpose**: Test result aggregation and analytics
- **Triggers**: Completion of other workflows, weekly schedule
- **Features**:
  - Test result aggregation from all workflows
  - Interactive analytics dashboard
  - Trend analysis and historical data
  - Automated test badges
  - Weekly test reports

## 🚀 Quick Start

### Prerequisites
1. GitHub repository with appropriate secrets configured
2. Docker and Docker Compose setup for E2E tests
3. Proper test structure following the existing patterns

### Required Secrets

Configure these repository secrets in GitHub Settings:

```yaml
# Security scanning
SEMGREP_APP_TOKEN: "your-semgrep-token"
SNYK_TOKEN: "your-snyk-token"
LHCI_GITHUB_APP_TOKEN: "your-lighthouse-ci-token"

# Optional: Custom integrations
SLACK_WEBHOOK_URL: "your-slack-webhook"
TEAMS_WEBHOOK_URL: "your-teams-webhook"
```

### Environment Variables

Workflows use these environment variables:

```yaml
PYTHON_VERSION: "3.10"
NODE_VERSION: "20"
POSTGRES_VERSION: "15"
```

## 📊 Test Structure

### Backend Tests
```
tests/
├── unit/           # Unit tests (fast, isolated)
├── integration/    # Integration tests (database required)
├── e2e/           # End-to-end tests (full stack)
└── conftest.py    # pytest configuration
```

### Frontend Tests
```
client/tests/
├── unit/          # Unit tests for components and utilities
├── e2e/           # Playwright end-to-end tests
└── components/    # Component-specific tests
```

## 🎯 Triggering Workflows

### Automatic Triggers
- **Push to main/develop**: All workflows run
- **Pull Request**: All workflows except deployment
- **Schedule**: Security scans weekly, E2E tests daily

### Manual Triggers
- **Workflow Dispatch**: Manual execution from GitHub Actions tab
- **API**: Programmatically trigger workflows

### Selective Execution
Use path filters to run workflows only when relevant files change:

```yaml
on:
  push:
    paths:
      - 'backend/**'      # Triggers backend workflows
      - 'client/**'       # Triggers frontend workflows
      - 'docker compose.yaml'  # Triggers E2E workflows
```

## 📈 Performance and Optimization

### Parallel Execution
- Matrix jobs run in parallel across environments
- Browser tests run independently
- Security scans operate concurrently

### Caching
- npm dependencies cached by package-lock.json
- pip dependencies cached by requirements.txt
- Docker layers cached for faster builds
- Playwright browsers cached between runs

### Resource Management
- Jobs have appropriate timeout values
- Fail-fast disabled for matrix testing
- Conditional execution to save resources

## 🔧 Configuration

### Database Testing
PostgreSQL service configured for testing:

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

### Browser Testing
Playwright configuration supports:

```yaml
projects:
  - name: chromium
  - name: firefox
  - name: webkit
  - name: Mobile Chrome
  - name: Mobile Safari
```

## 📋 Test Results and Artifacts

### Available Artifacts
- `backend-test-results`: pytest results and coverage
- `frontend-test-results`: Vitest results and coverage
- `e2e-results-{browser}`: Playwright test results
- `security-scan-results`: Security vulnerability reports
- `code-quality-results`: Linting and quality metrics
- `test-analytics-report`: Aggregated test analytics

### Coverage Reports
- Backend: HTML coverage report in `htmlcov/`
- Frontend: Coverage in `client/coverage/`
- Combined coverage uploaded to Codecov

### Test Analytics
- Interactive dashboard at `/test-analytics/`
- Historical trend analysis
- Performance metrics over time

## 🚨 Troubleshooting

### Common Issues

1. **Docker Compose Timeouts**
   - Increase health check timeouts
   - Check service logs in workflow run
   - Verify database connection strings

2. **Playwright Browser Installation**
   - Browsers cached between runs
   - Use `npx playwright install-deps` for system dependencies

3. **PostgreSQL Connection Issues**
   - Ensure health checks pass
   - Verify database credentials
   - Check for port conflicts

4. **npm Audit Failures**
   - Review audit report for severity
   - Update dependencies as needed
   - Use `--audit-level` to adjust sensitivity

### Debugging Tips

1. **Enable Debug Logging**:
   ```yaml
   - name: Debug step
     run: |
       set -x  # Enable command tracing
       your-command-here
   ```

2. **Download Artifacts Locally**:
   ```bash
   gh run download RUN_ID
   ```

3. **Test Locally**:
   ```bash
   # Backend
   docker compose up -d
   pytest tests/

   # Frontend
   cd client && npm test

   # E2E
   npx playwright test
   ```

## 📚 Best Practices

1. **Test Organization**:
   - Keep tests focused and independent
   - Use descriptive test names
   - Group related tests logically

2. **Performance**:
   - Use appropriate test timeouts
   - Cache dependencies effectively
   - Run only necessary tests on PR

3. **Security**:
   - Regularly update dependencies
   - Monitor security scan results
   - Fix high-priority vulnerabilities promptly

4. **Quality**:
   - Maintain high code coverage
   - Address quality gate failures
   - Review test analytics regularly

## 🔄 Maintenance

### Regular Tasks
- Update GitHub Actions versions monthly
- Review and update dependency versions
- Monitor workflow performance and costs
- Archive old test artifacts

### Scaling Considerations
- Add more matrix combinations as needed
- Implement test result caching for large suites
- Consider self-hosted runners for specific needs
- Optimize Docker image sizes and build times

## 📞 Support

For issues with the CI/CD pipeline:

1. Check workflow run logs for detailed error messages
2. Review this documentation for configuration guidance
3. Consult individual workflow files for specific implementation details
4. Create GitHub issues for persistent problems

---

*Last updated: $(date)*
*Generated for Task Scheduler application*