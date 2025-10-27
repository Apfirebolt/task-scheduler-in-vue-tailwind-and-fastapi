# E2E Test Suite for Task Scheduler Application

This directory contains comprehensive end-to-end tests for the Vue.js Task Scheduler application using Playwright.

## 📋 Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Test Suites](#test-suites)
- [Configuration](#configuration)
- [Writing New Tests](#writing-new-tests)
- [Debugging](#debugging)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The E2E test suite covers critical user workflows and ensures the application works correctly across different browsers, devices, and network conditions. Tests are organized by functionality and include:

- ✅ Navigation and routing
- ✅ Task management (CRUD operations)
- ✅ Scheduler functionality
- ✅ Responsive design
- ✅ Accessibility compliance
- ✅ Error handling and edge cases
- ✅ Cross-browser compatibility

## 📁 Test Structure

```
tests/e2e/
├── config/
│   └── test-config.json          # Test configuration and thresholds
├── helpers/
│   ├── page-helpers.ts           # Common page interaction utilities
│   ├── test-data.ts              # Test data and constants
│   └── test-utilities.ts         # Advanced testing utilities
├── setup/
│   └── global-setup.ts           # Global test setup and environment checks
├── *.spec.ts                     # Test files (organized by functionality)
├── README.md                     # This file
└── run-e2e-tests.js              # Custom test runner script
```

### Test Files

| Test File | Description | Key Scenarios |
|-----------|-------------|---------------|
| `home-page.spec.ts` | Home page and navigation tests | Page loading, navigation, responsive layout, keyboard navigation |
| `task-management.spec.ts` | Task CRUD operations | Task creation, editing, deletion, form validation, full lifecycle |
| `scheduler.spec.ts` | Calendar functionality | Month navigation, task display, responsive behavior, integration |
| `responsive-design.spec.ts` | Responsive design tests | Mobile/tablet/desktop layouts, orientation changes, edge cases |
| `accessibility.spec.ts` | Accessibility compliance | ARIA attributes, keyboard navigation, screen reader support, color contrast |
| `error-handling.spec.ts` | Error scenarios | Network errors, form validation, edge cases, security testing |

## 🚀 Running Tests

### Quick Start

```bash
# Install dependencies
npm install

# Install browsers (first time only)
npx playwright install

# Run all tests
npm run test:e2e
```

### Using the Custom Test Runner

The `run-e2e-tests.js` script provides a convenient interface for running tests:

```bash
# Run all tests in development
node run-e2e-tests.js

# Run specific test suite
node run-e2e-tests.js --suite smoke
node run-e2e-tests.js --suite accessibility
node run-e2e-tests.js --suite responsive

# Run in different environments
node run-e2e-tests.js --env staging
node run-e2e-tests.js --env production

# Run with browser visible
node run-e2e-tests.js --headed

# Debug mode (pauses execution)
node run-e2e-tests.js --debug

# Run tests matching pattern
node run-e2e-tests.js --grep "should create"

# Run in specific browser
node run-e2e-tests.js --project chromium
node run-e2e-tests.js --project "Mobile Chrome"
```

### Direct Playwright Commands

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test home-page.spec.ts

# Run tests in specific browser
npx playwright test --project chromium

# Run with UI mode
npx playwright test --ui

# Run tests with trace
npx playwright test --trace on

# Generate HTML report
npx playwright show-report
```

## 📦 Test Suites

### Smoke Tests (`smoke`)
Quick tests that verify core functionality:
- Home page loads
- Basic navigation works
- Task creation works
- No critical errors

### Regression Tests (`regression`)
Comprehensive tests covering all major features:
- All smoke test scenarios
- Scheduler functionality
- Responsive design
- Basic accessibility

### Accessibility Tests (`accessibility`)
Focused on accessibility compliance:
- Semantic HTML structure
- ARIA attributes and roles
- Keyboard navigation
- Screen reader compatibility
- Color contrast

### Responsive Tests (`responsive`)
Cross-device compatibility:
- Mobile layout (< 768px)
- Tablet layout (768px - 1024px)
- Desktop layout (> 1024px)
- Orientation changes
- Edge cases

### Error Handling Tests (`error-handling`)
Edge cases and error scenarios:
- Network failures
- Form validation
- Security testing
- Memory issues
- Browser compatibility

## ⚙️ Configuration

### Environment Configuration

Tests can be run in different environments:

| Environment | Base URL | Timeout | Retries | Use Case |
|-------------|----------|---------|---------|----------|
| `development` | http://localhost:5173 | 30s | 0 | Local development |
| `staging` | http://localhost:8080 | 60s | 2 | Docker environment |
| `production` | https://your-app.com | 60s | 3 | Production testing |

### Performance Thresholds

Configure performance expectations in `config/test-config.json`:

```json
{
  "thresholds": {
    "performance": {
      "domContentLoaded": 3000,
      "loadComplete": 5000,
      "firstContentfulPaint": 2000
    }
  }
}
```

### Browser Configuration

Tests run across multiple browsers:

- **Desktop**: Chromium, Firefox, WebKit (Safari)
- **Mobile**: Chrome (Pixel 5), Safari (iPhone 12)

## ✍️ Writing New Tests

### Test Template

```typescript
import { test, expect } from '@playwright/test'
import { PageHelpers } from '../helpers/page-helpers'
import { TestData } from '../helpers/test-data'

test.describe('Feature Name', () => {
  let helpers: PageHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new PageHelpers(page)
    await helpers.navigateToRoute(TestData.routes.home)
    await helpers.waitForAppLoad()
  })

  test('should do something specific', async ({ page }) => {
    // 1. Arrange - Set up test conditions
    await helpers.navigateToRoute('/some-page')

    // 2. Act - Perform the action
    await page.click('button')

    // 3. Assert - Verify the outcome
    await expect(page.locator('.result')).toBeVisible()
  })
})
```

### Best Practices for New Tests

1. **Use PageHelpers**: Leverage existing utilities for common operations
2. **Test User Scenarios**: Focus on real user workflows, not implementation details
3. **Use Test Data**: Reference `TestData` for consistent test data
4. **Wait Properly**: Use appropriate wait strategies (`waitForAppLoad`, `waitForSelector`)
5. **Check Console Errors**: Always verify no console errors occurred
6. **Test Responsiveness**: Include responsive testing where relevant
7. **Add Assertions**: Verify both positive and negative scenarios
8. **Use Descriptive Names**: Make test names descriptive and clear

### PageHelpers Usage

```typescript
// Navigation
await helpers.navigateToRoute('/add-task')
await helpers.clickNavLink('Tasks')

// Waiting
await helpers.waitForAppLoad()
await helpers.waitForToast()

// API checks
const isApiConnected = await helpers.checkApiConnectivity()
if (isApiConnected) {
  // Run API-dependent tests
}

// Form filling
await helpers.fillForm({
  '#title': 'Test Task',
  '#description': 'Test Description'
})

// Accessibility
await helpers.checkAccessibility()

// Console errors
await helpers.checkConsoleErrors()
```

## 🐛 Debugging

### Debug Mode

```bash
# Run with browser visible and pause on failure
node run-e2e-tests.js --debug

# Or use Playwright UI mode
npx playwright test --ui
```

### Trace Viewer

```bash
# Run tests with trace
npx playwright test --trace on

# View trace
npx playwright show-trace test-results/trace/trace.zip
```

### Screenshots and Videos

Tests automatically capture:
- Screenshots on failure
- Videos of test execution
- Trace files for debugging

View them in the `test-results/` directory.

### Common Debugging Techniques

1. **Add Console Logs**: Use `console.log` in tests
2. **Pause Execution**: Use `await page.pause()` to inspect state
3. **Take Screenshots**: `await page.screenshot({ path: 'debug.png' })`
4. **Inspect Page State**: `await page.content()` to see current HTML
5. **Check Network**: Use browser dev tools to inspect API calls

## 📏 Best Practices

### Test Organization

- **Group Related Tests**: Use `test.describe` for logical grouping
- **Use Descriptive Names**: Test names should describe what is being tested
- **Arrange-Act-Assert**: Structure tests clearly
- **Avoid Test Dependencies**: Tests should run independently

### Test Data

- **Use Test Constants**: Reference `TestData` for consistent values
- **Generate Unique Data**: Use timestamps for unique test data
- **Clean Up After Tests**: Remove created test data when possible
- **Avoid Hardcoded Values**: Use configuration for environment-specific values

### Performance

- **Use Appropriate Waits**: Avoid fixed timeouts when possible
- **Run Tests in Parallel**: Configure appropriate worker count
- **Reuse Page State**: Use `beforeEach` efficiently
- **Limit Resource Usage**: Clean up resources after tests

### Reliability

- **Handle Timing Issues**: Use proper wait strategies
- **Check Element Visibility**: Verify elements are visible before interaction
- **Handle Network Variability**: Account for slow network conditions
- **Retry Failed Tests**: Configure appropriate retry counts

## 🔧 Troubleshooting

### Common Issues

#### Tests Fail with "No element found"
- **Cause**: Element not loaded or selector incorrect
- **Solution**: Use `waitForSelector` or check element visibility

#### Tests Time Out
- **Cause**: Network slow or element not appearing
- **Solution**: Increase timeout or check network conditions

#### Docker Tests Fail
- **Cause**: Services not ready or port conflicts
- **Solution**: Check Docker logs and ensure ports are available

#### API Tests Fail
- **Cause**: Backend not running or API changed
- **Solution**: Verify API connectivity and check endpoints

### Environment Issues

#### Local Development
```bash
# Ensure Vue dev server is running
npm run dev

# Run tests against local server
node run-e2e-tests.js --env development
```

#### Docker Environment
```bash
# Ensure Docker services are running
docker compose up -d

# Wait for services to be ready
docker compose ps

# Run tests against Docker
node run-e2e-tests.js --env staging
```

#### Browser Issues
```bash
# Reinstall browsers
npx playwright install

# Update browsers
npx playwright install --with-deps

# Check browser versions
npx playwright --version
```

### Test Failures

1. **Check Test Results**: View HTML report for detailed failure information
2. **Examine Screenshots**: Look at failure screenshots
3. **Review Trace Files**: Use trace viewer to understand execution flow
4. **Check Console Logs**: Look for JavaScript errors or warnings
5. **Verify API Responses**: Ensure backend is responding correctly

## 📊 Reports

### HTML Report
```bash
# View comprehensive HTML report
npx playwright show-report
```

### JSON Report
Results are saved to `test-results/results.json` for CI/CD integration.

### JUnit Report
Can be enabled in configuration for CI systems that support JUnit format.

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Start application
        run: docker compose up -d

      - name: Run E2E tests
        run: node run-e2e-tests.js --env staging

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Accessibility Testing Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Responsive Design Testing](https://web.dev/responsive-web-design-basics/)
- [Vue.js Testing Best Practices](https://vuejs.org/guide/scaling-up/testing.html)

## 🤝 Contributing

When adding new tests:

1. Follow the existing test structure and patterns
2. Use PageHelpers and TestUtilities where appropriate
3. Add test data to TestData constants if needed
4. Update this README if adding new test suites
5. Run tests locally before submitting

## 📞 Support

For questions or issues with the E2E test suite:

1. Check this README for troubleshooting steps
2. Review test logs and error messages
3. Examine the Playwright documentation
4. Check the application logs for backend issues
6. Create an issue with detailed error information and steps to reproduce