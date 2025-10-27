import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Create mock functions for axios
const mockAxiosGet = vi.fn()
const mockAxiosPost = vi.fn()
const mockAxiosPut = vi.fn()
const mockAxiosDelete = vi.fn()
const mockAxiosPatch = vi.fn()

// Mock axios globally with proper export structure
const mockAxios = {
  get: mockAxiosGet,
  post: mockAxiosPost,
  put: mockAxiosPut,
  delete: mockAxiosDelete,
  patch: mockAxiosPatch,
  create: vi.fn(() => ({
    get: mockAxiosGet,
    post: mockAxiosPost,
    put: mockAxiosPut,
    delete: mockAxiosDelete,
    patch: mockAxiosPatch,
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
}

vi.mock('axios', () => ({
  default: mockAxios,
  __esModule: true,
}))

// Export mock functions for test usage
export { mockAxiosGet, mockAxiosPost, mockAxiosPut, mockAxiosDelete, mockAxiosPatch, mockAxios }

// Mock vue-router
const mockPush = vi.fn()
const mockReplace = vi.fn()
const mockGo = vi.fn()
const mockBack = vi.fn()
const mockForward = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    go: mockGo,
    back: mockBack,
    forward: mockForward,
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
  RouterView: {
    name: 'RouterView',
    template: '<div><slot /></div>'
  },
  RouterLink: {
    name: 'RouterLink',
    template: '<a :href="to"><slot /></a>',
    props: ['to', 'replace', 'exact', 'active-class', 'exact-active-class'],
  },
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

// Create mock functions for AOS
const mockAOSInit = vi.fn()
const mockAOSRefresh = vi.fn()
const mockAOSRefreshHard = vi.fn()

// Mock AOS (Animate On Scroll) with proper structure
vi.mock('aos', () => ({
  default: {
    init: mockAOSInit,
    refresh: mockAOSRefresh,
    refreshHard: mockAOSRefreshHard,
  },
  init: mockAOSInit,
  refresh: mockAOSRefresh,
  refreshHard: mockAOSRefreshHard,
  __esModule: true,
}))

// Mock animate.css
vi.mock('animate.css', () => ({
  default: {},
}))

// Mock aos CSS
vi.mock('aos/dist/aos.css', () => ({}))

// Create mock functions for FontAwesome
const mockLibraryAdd = vi.fn()
const mockLibraryReset = vi.fn()
const mockDomWatch = vi.fn()
const mockDomI2svg = vi.fn()
const mockConfigAutoAddCss = vi.fn()

// Mock FontAwesome
vi.mock('@fortawesome/vue-fontawesome', () => ({
  FontAwesomeIcon: {
    name: 'FontAwesomeIcon',
    template: '<i class="fa-icon"><slot /></i>',
    props: ['icon', 'class', 'style'],
  },
  __esModule: true,
}))

vi.mock('@fortawesome/fontawesome-svg-core', () => ({
  library: {
    add: mockLibraryAdd,
    reset: mockLibraryReset,
  },
  dom: {
    watch: mockDomWatch,
    i2svg: mockDomI2svg,
  },
  config: {
    autoAddCss: mockConfigAutoAddCss,
  },
  __esModule: true,
}))

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faTasks: { prefix: 'fas', iconName: 'tasks', icon: [0, 0, 0, 0] },
  faPenAlt: { prefix: 'fas', iconName: 'pen-alt', icon: [0, 0, 0, 0] },
  faUser: { prefix: 'fas', iconName: 'user', icon: [0, 0, 0, 0] },
  faLock: { prefix: 'fas', iconName: 'lock', icon: [0, 0, 0, 0] },
  faEnvelope: { prefix: 'fas', iconName: 'envelope', icon: [0, 0, 0, 0] },
  faPlus: { prefix: 'fas', iconName: 'plus', icon: [0, 0, 0, 0] },
  faEdit: { prefix: 'fas', iconName: 'edit', icon: [0, 0, 0, 0] },
  faTrash: { prefix: 'fas', iconName: 'trash', icon: [0, 0, 0, 0] },
  faSort: { prefix: 'fas', iconName: 'sort', icon: [0, 0, 0, 0] },
  faSortUp: { prefix: 'fas', iconName: 'sort-up', icon: [0, 0, 0, 0] },
  faSortDown: { prefix: 'fas', iconName: 'sort-down', icon: [0, 0, 0, 0] },
  faBars: { prefix: 'fas', iconName: 'bars', icon: [0, 0, 0, 0] },
  faTimes: { prefix: 'fas', iconName: 'times', icon: [0, 0, 0, 0] },
  faArrowLeft: { prefix: 'fas', iconName: 'arrow-left', icon: [0, 0, 0, 0] },
  faArrowRight: { prefix: 'fas', iconName: 'arrow-right', icon: [0, 0, 0, 0] },
  faCalendar: { prefix: 'fas', iconName: 'calendar', icon: [0, 0, 0, 0] },
  faClock: { prefix: 'fas', iconName: 'clock', icon: [0, 0, 0, 0] },
  faCheck: { prefix: 'fas', iconName: 'check', icon: [0, 0, 0, 0] },
  faExclamationTriangle: { prefix: 'fas', iconName: 'exclamation-triangle', icon: [0, 0, 0, 0] },
}))

vi.mock('@fortawesome/free-regular-svg-icons', () => ({
  faUser: { prefix: 'far', iconName: 'user', icon: [0, 0, 0, 0] },
  faEnvelope: { prefix: 'far', iconName: 'envelope', icon: [0, 0, 0, 0] },
  faCalendar: { prefix: 'far', iconName: 'calendar', icon: [0, 0, 0, 0] },
  faEdit: { prefix: 'far', iconName: 'edit', icon: [0, 0, 0, 0] },
  faTrashAlt: { prefix: 'far', iconName: 'trash-alt', icon: [0, 0, 0, 0] },
}))

// Global test configuration
config.global.stubs = {
  'font-awesome-icon': {
    name: 'FontAwesomeIcon',
    template: '<i class="fa-icon"><slot /></i>',
    props: ['icon', 'class', 'style'],
  },
  'router-link': {
    name: 'RouterLink',
    template: '<a :href="to"><slot /></a>',
    props: ['to', 'replace', 'exact', 'active-class', 'exact-active-class'],
  },
  'router-view': {
    name: 'RouterView',
    template: '<div><slot /></div>',
  },
}

config.global.mocks = {
  $cookies: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    isKey: vi.fn(),
    keys: vi.fn(),
  },
  AOS: {
    init: mockAOSInit,
    refresh: mockAOSRefresh,
    refreshHard: mockAOSRefreshHard,
  },
  library: {
    add: mockLibraryAdd,
    reset: mockLibraryReset,
  },
  axios: mockAxios,
}

// Global console suppressions
global.console = {
  ...console,
  // Uncomment to suppress specific console warnings/errors in tests
  // warn: vi.fn(),
  // error: vi.fn(),
}