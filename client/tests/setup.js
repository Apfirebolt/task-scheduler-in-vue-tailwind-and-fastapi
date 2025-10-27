import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Mock AOS
vi.mock('aos', () => ({
  default: {
    init: vi.fn(),
    refresh: vi.fn(),
    refreshHard: vi.fn(),
  },
}))

// Mock Vue Router
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => ({
    path: '/',
    params: {},
    query: {},
    name: 'home',
  }),
  createRouter: vi.fn(),
  createWebHistory: vi.fn(),
  RouterView: { template: '<div><slot /></div>' },
  RouterLink: { template: '<a><slot /></a>' },
}))

// Mock Vue Cookies
vi.mock('vue-cookies', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    isKey: vi.fn(),
    keys: vi.fn(),
  },
}))

// Mock Axios
const mockAxios = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  create: vi.fn(() => mockAxios),
  defaults: {
    baseURL: '/api',
    headers: {
      common: {},
    },
  },
}

vi.mock('axios', () => ({
  default: mockAxios,
}))

// Mock FontAwesome
vi.mock('@fortawesome/vue-fontawesome', () => ({
  FontAwesomeIcon: {
    name: 'FontAwesomeIcon',
    template: '<i class="fa"></i>',
    props: ['icon', 'size', 'class'],
  },
}))

vi.mock('@fortawesome/fontawesome-svg-core', () => ({
  library: {
    add: vi.fn(),
  },
  dom: {
    watch: vi.fn(),
  },
}))

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faUser: 'fa-user',
  faCalendar: 'fa-calendar',
  faTasks: 'fa-tasks',
  faPlus: 'fa-plus',
  faEdit: 'fa-edit',
  faTrash: 'fa-trash',
  faCheck: 'fa-check',
  faClock: 'fa-clock',
}))

// Mock vue3-scroll-spy
vi.mock('vue3-scroll-spy', () => ({
  default: {
    ScrollSpy: {
      name: 'ScrollSpy',
      template: '<div><slot /></div>',
    },
    ScrollSection: {
      name: 'ScrollSection',
      template: '<div><slot /></div>',
    },
  },
}))

// Global test configuration
config.global.mocks = {
  $axios: mockAxios,
  $router: mockRouter,
}

// Global stubs
config.global.stubs = {
  'router-link': true,
  'router-view': true,
  'font-awesome-icon': true,
  'scroll-spy': true,
  'scroll-section': true,
}

// Silence console warnings in tests unless debugging
if (!process.env.VITEST_DEBUG) {
  console.warn = vi.fn()
  console.error = vi.fn()
}

// Add custom matchers if needed
expect.extend({
  toBeInTheDocument(received) {
    const pass = received && received.element && document.body.contains(received.element)
    return {
      message: () =>
        `expected ${received} ${pass ? 'not ' : ''}to be in the document`,
      pass,
    }
  },
})

// Global test cleanup
afterEach(() => {
  vi.clearAllMocks()
})