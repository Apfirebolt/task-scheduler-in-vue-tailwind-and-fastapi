import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Create simple mock functions
const mockAxiosGet = vi.fn()
const mockAxiosPost = vi.fn()
const mockAxiosPut = vi.fn()
const mockAxiosDelete = vi.fn()
const mockAxiosPatch = vi.fn()

// Mock axios
vi.mock('axios', () => ({
  default: {
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
    })),
    defaults: {
      baseURL: '/api',
      headers: { 'Content-Type': 'application/json' },
    },
  },
  get: mockAxiosGet,
  post: mockAxiosPost,
  put: mockAxiosPut,
  delete: mockAxiosDelete,
  patch: mockAxiosPatch,
}))

// Mock AOS
const mockAOS = {
  init: vi.fn(),
  refresh: vi.fn(),
  refreshHard: vi.fn(),
}

vi.mock('aos', () => ({
  default: mockAOS,
  init: mockAOS.init,
  refresh: mockAOS.refresh,
  refreshHard: mockAOS.refreshHard,
}))

// Mock FontAwesome
const mockLibrary = {
  add: vi.fn(),
  reset: vi.fn(),
}

const mockDom = {
  watch: vi.fn(),
  i2svg: vi.fn(),
}

const mockConfig = {
  autoAddCss: vi.fn(),
}

vi.mock('@fortawesome/vue-fontawesome', () => ({
  FontAwesomeIcon: {
    name: 'FontAwesomeIcon',
    template: '<i class="fa-icon"><slot /></i>',
    props: ['icon', 'class', 'style'],
  },
}))

vi.mock('@fortawesome/fontawesome-svg-core', () => ({
  library: mockLibrary,
  dom: mockDom,
  config: mockConfig,
}))

// Mock all FontAwesome icon packages
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
  faIdCard: { prefix: 'fas', iconName: 'id-card', icon: [0, 0, 0, 0] },
}))

vi.mock('@fortawesome/free-regular-svg-icons', () => ({
  faUser: { prefix: 'far', iconName: 'user', icon: [0, 0, 0, 0] },
  faEnvelope: { prefix: 'far', iconName: 'envelope', icon: [0, 0, 0, 0] },
  faCalendar: { prefix: 'far', iconName: 'calendar', icon: [0, 0, 0, 0] },
  faEdit: { prefix: 'far', iconName: 'edit', icon: [0, 0, 0, 0] },
  faTrashAlt: { prefix: 'far', iconName: 'trash-alt', icon: [0, 0, 0, 0] },
}))

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
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

// Mock dayjs with proper method chaining
const createDayjsMock = (date) => ({
  format: vi.fn((fmt) => {
    if (fmt === 'MMMM YYYY') return 'January 2024'
    if (fmt === 'YYYY-MM-DD') return '2024-01-01'
    if (fmt === 'MMMM D, YYYY') return 'January 1, 2024'
    return '2024-01-01'
  }),
  startOfDay: vi.fn(() => createDayjsMock(date)),
  endOfDay: vi.fn(() => createDayjsMock(date)),
  startOf: vi.fn(() => createDayjsMock(date)),
  add: vi.fn(() => createDayjsMock(date)),
  subtract: vi.fn(() => createDayjsMock(date)),
  isBefore: vi.fn(() => false),
  isAfter: vi.fn(() => false),
  isSame: vi.fn(() => true),
  diff: vi.fn(() => 0),
  daysInMonth: vi.fn(() => 31),
  toDate: vi.fn(() => new Date()),
  isValid: vi.fn(() => true),
})

vi.mock('dayjs', () => ({
  default: vi.fn(createDayjsMock)
}))

// Mock CSS files
vi.mock('aos/dist/aos.css', () => ({}))
vi.mock('animate.css', () => ({}))

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
  AOS: mockAOS,
  library: mockLibrary,
  axios: {
    get: mockAxiosGet,
    post: mockAxiosPost,
    put: mockAxiosPut,
    delete: mockAxiosDelete,
    patch: mockAxiosPatch,
  },
}

// Export mocks for use in tests
export {
  mockAxiosGet,
  mockAxiosPost,
  mockAxiosPut,
  mockAxiosDelete,
  mockAxiosPatch,
  mockAOS,
  mockLibrary,
  mockDom,
  mockConfig,
}