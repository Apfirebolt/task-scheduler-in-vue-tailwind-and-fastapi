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
  create: vi.fn(() => mockAxios),
  defaults: {
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
  },
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
}

// Mock axios before any imports that might use it
vi.mock('axios', () => ({
  default: mockAxios,
  ...mockAxios
}))

// Create mock functions for AOS
const mockAOSInit = vi.fn()
const mockAOSRefresh = vi.fn()
const mockAOSRefreshHard = vi.fn()

const mockAOS = {
  init: mockAOSInit,
  refresh: mockAOSRefresh,
  refreshHard: mockAOSRefreshHard,
}

// Mock AOS
vi.mock('aos', () => ({
  default: mockAOS,
  init: mockAOSInit,
  refresh: mockAOSRefresh,
  refreshHard: mockAOSRefreshHard,
  __esModule: true,
}))

// Create mock functions for FontAwesome
const mockLibraryAdd = vi.fn()
const mockLibraryReset = vi.fn()
const mockDomWatch = vi.fn()
const mockDomI2svg = vi.fn()
const mockConfigAutoAddCss = vi.fn()

const mockFontAwesomeLibrary = {
  add: mockLibraryAdd,
  reset: mockLibraryReset,
}

const mockFontAwesomeDom = {
  watch: mockDomWatch,
  i2svg: mockDomI2svg,
}

const mockFontAwesomeConfig = {
  autoAddCss: mockConfigAutoAddCss,
}

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
  library: mockFontAwesomeLibrary,
  dom: mockFontAwesomeDom,
  config: mockFontAwesomeConfig,
  __esModule: true,
}))

// Mock FontAwesome icons
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
  __esModule: true,
}))

vi.mock('@fortawesome/free-regular-svg-icons', () => ({
  faUser: { prefix: 'far', iconName: 'user', icon: [0, 0, 0, 0] },
  faEnvelope: { prefix: 'far', iconName: 'envelope', icon: [0, 0, 0, 0] },
  faCalendar: { prefix: 'far', iconName: 'calendar', icon: [0, 0, 0, 0] },
  faEdit: { prefix: 'far', iconName: 'edit', icon: [0, 0, 0, 0] },
  faTrashAlt: { prefix: 'far', iconName: 'trash-alt', icon: [0, 0, 0, 0] },
  __esModule: true,
}))

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
  __esModule: true,
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
  __esModule: true,
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
  __esModule: true,
}))

// Mock animate.css
vi.mock('animate.css', () => ({
  default: {},
  __esModule: true,
}))

// Mock aos CSS
vi.mock('aos/dist/aos.css', () => ({}))

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

// Make FontAwesome library.add a spy
vi.spyOn(mockFontAwesomeLibrary, 'add').mockImplementation(mockLibraryAdd)

config.global.mocks = {
  $cookies: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    isKey: vi.fn(),
    keys: vi.fn(),
  },
  AOS: mockAOS,
  library: mockFontAwesomeLibrary,
  axios: mockAxios,
}

// Export mocks for use in tests
export {
  // Axios mocks
  mockAxiosGet,
  mockAxiosPost,
  mockAxiosPut,
  mockAxiosDelete,
  mockAxiosPatch,
  mockAxios,

  // AOS mocks
  mockAOSInit,
  mockAOSRefresh,
  mockAOSRefreshHard,
  mockAOS,

  // FontAwesome mocks
  mockLibraryAdd,
  mockLibraryReset,
  mockFontAwesomeLibrary,

  // Router mocks
  mockPush,
  mockReplace,
  mockGo,
  mockBack,
  mockForward,
}