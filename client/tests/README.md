# Frontend Testing Setup

This directory contains the comprehensive testing setup for the Vue.js task scheduler application using Vitest and Vue Test Utils.

## Overview

The testing environment is configured with:
- **Vitest** - Modern, fast unit testing framework
- **Vue Test Utils** - Official testing library for Vue.js
- **Happy DOM** - Lightweight DOM implementation for testing
- **Coverage reporting** - Code coverage with v8 provider
- **Mocking utilities** - Pre-configured mocks for external dependencies

## Directory Structure

```
tests/
├── setup.ts              # Global test setup and mocks
├── utils/
│   ├── test-utils.ts     # Custom testing utilities
│   └── factories.ts      # Test data factories
├── unit/                 # Unit tests
├── components/           # Component tests
└── e2e/                  # End-to-end tests (Playwright)
```

## Available Scripts

```bash
# Run all tests in watch mode
npm run test

# Run all tests once
npm run test:run

# Run only unit tests
npm run test:unit

# Run tests with UI
npm run test:ui

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

## Global Configuration

### Test Environment (`tests/setup.ts`)

The global setup file provides:

1. **Axios Mocking** - Complete HTTP client mocking
2. **Vue Router Mocking** - Router and navigation mocking
3. **External Library Mocks** - dayjs, vue-cookies, AOS, animate.css
4. **Global Stubs** - FontAwesome icons and router components
5. **Console Management** - Optional console warning/error suppression

### Vitest Configuration (`vitest.config.ts`)

Key features:
- **happy-dom** environment for realistic DOM testing
- **Path aliases** (@, ~, @@) for cleaner imports
- **Coverage thresholds** (70% for all metrics)
- **Test isolation** and proper cleanup
- **TypeScript support** out of the box
- **E2E test exclusion** from unit test runs

## Testing Utilities

### Test Utils (`tests/utils/test-utils.ts`)

Common testing patterns and utilities:

```typescript
import { mountWithDefaults, createMockResponse, testComponentWithProps } from '../utils/test-utils'

// Mount component with default configuration
const wrapper = mountWithDefaults(MyComponent)

// Create mock API responses
const mockResponse = createMockResponse({ id: 1, title: 'Test' })

// Test component with standard patterns
testComponentWithProps('MyComponent', MyComponent, defaultProps)
```

Available utilities:
- `mountWithDefaults()` - Mount with common test configuration
- `waitForUpdate()` - Wait for DOM updates
- `createMockResponse()` - Create successful API responses
- `createMockError()` - Create error responses
- `mockConsole()` - Suppress console noise in tests
- `testComponentWithProps()` - Standard component testing pattern
- `testComponentWithSlots()` - Slot testing pattern
- `testComponentEvents()` - Event testing pattern

### Data Factories (`tests/utils/factories.ts`)

Test data generation for consistent tests:

```typescript
import { createMockTask, createMockTasks, testData } from '../utils/factories'

// Create single task
const task = createMockTask({ title: 'Custom Task' })

// Create multiple tasks
const tasks = createMockTasks(5)

// Use predefined test data sets
const { tasksWithPriorities, mixedCompletionTasks } = testData
```

Available factories:
- `createMockTask()` - Create task objects with overrides
- `createMockTasks()` - Create multiple tasks
- `createMockUser()` - Create user objects
- `createMockApiResponse()` - Create API response format
- `createMockPaginatedResponse()` - Create paginated responses
- `createMockErrorResponse()` - Create error responses
- Predefined test data sets for common scenarios

## Component Testing Patterns

### Basic Component Test

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { mountWithDefaults } from '../utils/test-utils'

import MyComponent from '@/components/MyComponent.vue'

describe('MyComponent', () => {
  it('should mount successfully', () => {
    const wrapper = mountWithDefaults(MyComponent)
    expect(wrapper.exists()).toBe(true)
  })

  it('should render with props', () => {
    const wrapper = mountWithDefaults(MyComponent, {
      props: { title: 'Test Title' }
    })
    expect(wrapper.text()).toContain('Test Title')
  })
})
```

### Testing Events

```typescript
it('should emit click event', async () => {
  const wrapper = mountWithDefaults(MyComponent)
  await wrapper.find('button').trigger('click')

  expect(wrapper.emitted('click')).toBeTruthy()
  expect(wrapper.emitted('click')[0]).toEqual(['click-data'])
})
```

### Testing Async Behavior

```typescript
it('should load data asynchronously', async () => {
  const mockData = { id: 1, title: 'Test' }
  vi.mocked(axios.get).mockResolvedValue(createMockResponse(mockData))

  const wrapper = mountWithDefaults(MyComponent)
  await wrapper.vm.$nextTick()

  expect(wrapper.text()).toContain('Test')
})
```

## Mocking External Dependencies

### Axios HTTP Calls

```typescript
import { vi } from 'vitest'
import axios from 'axios'

// Mock successful GET request
vi.mocked(axios.get).mockResolvedValue(createMockResponse(data))

// Mock failed request
vi.mocked(axios.post).mockRejectedValue(createMockError('Request failed'))

// Mock with specific response
vi.mocked(axios.put).mockResolvedValue({
  data: { id: 1, updated: true },
  status: 200
})
```

### Vue Router

```typescript
import { useRouter, useRoute } from 'vue-router'

// Router is automatically mocked in setup.ts
// You can test navigation in components

it('should navigate when button clicked', async () => {
  const mockPush = vi.fn()
  vi.mocked(useRouter).mockReturnValue({
    push: mockPush,
    // ... other router methods
  } as any)

  const wrapper = mountWithDefaults(MyComponent)
  await wrapper.find('button').trigger('click')

  expect(mockPush).toHaveBeenCalledWith('/target-route')
})
```

## Best Practices

### 1. Test Organization
- Group related tests with `describe()`
- Use descriptive test names
- Test one behavior per test
- Arrange-Act-Assert pattern

### 2. Component Testing
- Test user behavior, not implementation details
- Use meaningful test data
- Test edge cases and error states
- Mock external dependencies

### 3. Mocking
- Mock at the appropriate level
- Don't over-mock
- Reset mocks between tests
- Use factories for consistent test data

### 4. Async Testing
- Use `await` for async operations
- Wait for DOM updates with `$nextTick()`
- Handle loading and error states
- Test both success and failure cases

### 5. Coverage
- Aim for meaningful coverage, not just numbers
- Focus on critical paths and edge cases
- Use coverage reports to identify gaps
- Set appropriate thresholds

## Running Tests in Development

```bash
# Watch mode for active development
npm run test

# Run specific test file
npx vitest tests/unit/MyComponent.test.ts

# Run tests matching pattern
npx vitest --grep "should render"

# Run tests with coverage
npm run test:coverage
```

## Troubleshooting

### Common Issues

1. **"Cannot access before initialization" errors**
   - Ensure mocks are defined before imports
   - Use `vi.hoisted()` for complex mocks

2. **Component not rendering**
   - Check if required props are provided
   - Verify component imports are correct
   - Ensure proper alias configuration

3. **Mock not working**
   - Check if mock is set up before test runs
   - Verify mock path matches import
   - Use `vi.clearAllMocks()` in beforeEach

4. **Async test timing**
   - Use `waitForUpdate()` helper
   - Add proper async/await handling
   - Check for DOM updates with `$nextTick()`

## Next Steps

With this setup complete, you can now:

1. **Write Component Tests** - Test individual components in isolation
2. **Integration Tests** - Test component interactions
3. **Mock API Calls** - Test data loading and error handling
4. **User Interaction Tests** - Test user flows and events
5. **Add Coverage Reports** - Monitor test coverage in CI/CD

The testing environment is fully configured and ready for comprehensive testing of your Vue.js task scheduler application.