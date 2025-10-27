# E2E Testing with Playwright

This document covers end-to-end testing setup and execution for the Vue.js Task Scheduler application using Playwright.

## Overview

The E2E testing suite uses Playwright to test the application from a user's perspective across multiple browsers (Chrome, Firefox, Safari) and devices (desktop, mobile). The tests are configured to work with both local development and Docker environments.

## Setup

### Prerequisites

1. **Node.js 18+** installed
2. **Docker and Docker Compose** (for Docker-based testing)
3. **Browsers** installed via Playwright

### Initial Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Install Playwright browsers (run once)
npm run test:e2e:install

# Or install specific browsers
npx playwright install chromium firefox webkit
```

## Configuration

### playwright.config.ts

The configuration supports multiple environments:

- **Local Development**: Tests run against Vite dev server (localhost:5173)
- **Docker Environment**: Tests run against Docker setup (localhost:8080)
- **CI/CD**: Optimized for GitHub Actions

Key features:
- Multi-browser testing (Chrome, Firefox, Safari, Mobile)
- Automatic retries and timeouts
- Screenshot/video capture on failures
- HTML reports and JSON output
- Responsive design testing

### Environment Variables

- `USE_DOCKER=true`: Use Docker setup instead of local dev server
- `BASE_URL`: Override the base URL for tests
- `CI=true`: Enable CI-specific optimizations

## Running Tests

### Development Mode

```bash
# Run all E2E tests
npm run test:e2e

# Run with visible browser (useful for debugging)
npm run test:e2e:headed

# Run with Playwright UI (interactive mode)
npm run test:e2e:ui

# Run with debugger
npm run test:e2e:debug

# Run specific browser
npm run test:e2e:chrome
npm run test:e2e:firefox
npm run test:e2e:safari
npm run test:e2e:mobile
```

### Docker Mode

```bash
# Run tests against Docker setup
npm run test:e2e:docker

# Run with visible browser against Docker
npm run test:e2e:docker:headed
```

### Test Reporting

```bash
# View HTML report
npm run test:e2e:report

# Update visual snapshots
npm run test:e2e:update
```

## Test Structure

```
tests/e2e/
├── helpers/
│   ├── page-helpers.ts     # Common page utilities
│   └── test-data.ts        # Test data and constants
├── setup/
│   └── global-setup.ts     # Global test setup
├── setup.spec.ts           # Playwright verification tests
└── task-management.spec.ts # Main E2E test suite
```

## Test Categories

### 1. Setup Verification (`setup.spec.ts`)

- Verifies Playwright configuration
- Checks browser support
- Tests environment variables
- Validates API connectivity
- Checks mobile viewport handling

### 2. Task Management (`task-management.spec.ts`)

- Navigation testing
- Form interactions
- Task CRUD operations
- Responsive design
- Loading states
- Error handling
- Accessibility basics
- Scheduler functionality

## Writing New Tests

### Test File Template

```typescript
import { test, expect } from '@playwright/test'
import { PageHelpers } from '../helpers/page-helpers'
import { TestData } from '../helpers/test-data'

test.describe('Feature Name', () => {
  let pageHelpers: PageHelpers

  test.beforeEach(async ({ page }) => {
    pageHelpers = new PageHelpers(page)
    await pageHelpers.navigateToRoute(TestData.routes.home)
    await pageHelpers.waitForAppLoad()
  })

  test('should do something', async ({ page }) => {
    // Test implementation
    await pageHelpers.clickNavLink('Some Link')
    await expect(page).toHaveURL(/.*expected-route/)
  })
})
```

### Best Practices

1. **Use Page Helpers**: Leverage the `PageHelpers` class for common operations
2. **Test Data**: Use `TestData` constants instead of hardcoded values
3. **Wait Strategy**: Use proper wait methods (`waitForAppLoad`, `waitForLoadState`)
4. **Responsive Testing**: Test on multiple viewport sizes
5. **Error Handling**: Test both success and failure scenarios
6. **Accessibility**: Include basic accessibility checks
7. **Network**: Verify API connectivity where relevant

### Common Patterns

#### Navigation Tests
```typescript
test('should navigate correctly', async ({ page }) => {
  await pageHelpers.clickNavLink('Add Task')
  await expect(page).toHaveURL(/.*add/)
  await expect(page.locator('h1')).toContainText('Add Task')
})
```

#### Form Tests
```typescript
test('should submit form', async ({ page }) => {
  await pageHelpers.fillForm(TestData.tasks.valid)
  await page.click(TestData.selectors.submitButton)
  await pageHelpers.waitForToast()
  await expect(page.locator('text=Success')).toBeVisible()
})
```

#### Responsive Tests
```typescript
test('should work on mobile', async ({ page }) => {
  await pageHelpers.checkResponsiveLayout(TestData.viewports.mobile)
  await expect(page.locator(TestData.selectors.mobileMenu)).toBeVisible()
})
```

## Debugging

### Visual Debugging

```bash
# Run with visible browser
npm run test:e2e:headed

# Run with Playwright UI
npm run test:e2e:ui

# Run with debugger
npm run test:e2e:debug
```

### Screenshots and Videos

- Screenshots are automatically taken on test failures
- Videos are recorded for failed tests
- Manual screenshots: `await page.screenshot({ path: 'debug.png' })`

### Console Logs

```typescript
// Log browser console
page.on('console', msg => console.log(msg.text()))

// Check for console errors
await pageHelpers.checkConsoleErrors()
```

## CI/CD Integration

The GitHub Actions workflow (`.github/workflows/e2e-tests.yml`) automatically:

1. Sets up Node.js and Playwright
2. Installs dependencies and browsers
3. Starts Docker services
4. Runs tests across multiple browsers and Node.js versions
5. Uploads test results and reports
6. Cleans up Docker services

### Running Tests Locally Before CI

```bash
# Simulate CI environment
CI=true npm run test:e2e:docker

# Run specific browser tests
CI=true npx playwright test --project=chromium
```

## Troubleshooting

### Common Issues

1. **Browser Installation Fails**
   ```bash
   # Try installing without system dependencies
   npx playwright install chromium
   # Or run with elevated permissions outside sandbox
   ```

2. **Docker Services Not Ready**
   - Check `docker compose ps` status
   - Verify all services show "healthy"
   - Check logs: `docker compose logs -f`

3. **API Connection Issues**
   - Verify backend is running on port 8000
   - Check CORS configuration
   - Test API manually: `curl http://localhost:8000/docs`

4. **Test Timeouts**
   - Increase timeouts in `playwright.config.ts`
   - Check for slow network operations
   - Verify wait strategies are appropriate

### Debug Steps

1. Check service status: `docker compose ps`
2. View logs: `docker compose logs -f [service]`
3. Run single test: `npx playwright test [test-file] --debug`
4. Check browser console for errors
5. Verify test data and selectors

## Performance Considerations

- Tests run in parallel when possible
- Use `test.describe.configure({ mode: 'parallel' })` for independent tests
- Limit unnecessary page loads and network requests
- Use appropriate wait strategies to avoid race conditions

## Security Testing

While not specifically security-focused, E2E tests can catch common security issues:

- Authentication flow testing
- Authorization verification
- CORS behavior validation
- Input validation testing
- XSS prevention (basic checks)

## Maintenance

- Regular test review and updates
- Keep test data current with application changes
- Update selectors when UI changes
- Review flaky tests and fix timeout issues
- Monitor test execution time and optimize where needed

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Vue.js Testing Guidelines](https://vuejs.org/guide/scaling-up/testing.html)
- [Best Practices for E2E Testing](https://playwright.dev/docs/best-practices)
- [Playwright vs Other Tools](https://playwright.dev/docs/intro)