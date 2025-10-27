import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Mock axios globally
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
    defaults: {
      baseURL: '/api',
      headers: { 'Content-Type': 'application/json' },
    },
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    route: { params: {}, query: {}, path: '/', fullPath: '/', name: 'Home' },
    currentRoute: { value: { params: {}, query: {}, path: '/', fullPath: '/', name: 'Home' } },
  }),
  useRoute: () => ({
    params: {},
    query: {},
    path: '/',
    fullPath: '/',
    name: 'Home',
    hash: '',
    matched: [],
    meta: {},
  }),
  createRouter: vi.fn(),
  createWebHistory: vi.fn(),
  RouterView: { template: '<div><slot /></div>' },
  RouterLink: { template: '<a><slot /></a>' },
}))

// Mock vue-cookies
vi.mock('vue-cookies', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    isKey: vi.fn(),
    keys: vi.fn(),
  },
}))

// Mock dayjs
vi.mock('dayjs', () => ({
  default: vi.fn(() => ({
    format: vi.fn(() => '2024-01-01'),
    startOfDay: vi.fn(() => ({ format: vi.fn(() => '2024-01-01T00:00:00Z') })),
    endOfDay: vi.fn(() => ({ format: vi.fn(() => '2024-01-01T23:59:59Z') })),
    add: vi.fn(),
    subtract: vi.fn(),
    isBefore: vi.fn(() => false),
    isAfter: vi.fn(() => false),
    isSame: vi.fn(() => true),
    diff: vi.fn(() => 0),
    toDate: vi.fn(() => new Date()),
    isValid: vi.fn(() => true),
  })),
}))

// Mock AOS (Animate On Scroll)
vi.mock('aos', () => ({
  init: vi.fn(),
  refresh: vi.fn(),
}))

// Mock animate.css
vi.mock('animate.css', () => ({
  default: {},
}))

// Mock aos CSS
vi.mock('aos/dist/aos.css', () => ({}))

// Global test configuration
config.global.stubs = {
  'font-awesome-icon': { template: '<i></i>' },
  'router-link': { template: '<a><slot /></a>' },
  'router-view': { template: '<div><slot /></div>' },
}

config.global.mocks = {
  $cookies: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    isKey: vi.fn(),
    keys: vi.fn(),
  },
}

// Global console suppressions
global.console = {
  ...console,
  // Uncomment to suppress specific console warnings/errors in tests
  // warn: vi.fn(),
  // error: vi.fn(),
}