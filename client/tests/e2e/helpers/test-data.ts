export const TestData = {
  users: {
    valid: {
      email: 'test@example.com',
      password: 'Test123456!',
      username: 'testuser'
    },
    invalid: {
      email: 'invalid-email',
      password: '123',
      username: ''
    }
  },

  tasks: {
    valid: {
      title: 'Test Task Title',
      description: 'This is a test task description for E2E testing',
      date: '2024-12-31',
      status: 'In Progress',
      priority: 'Medium'
    },
    minimal: {
      title: 'Minimal Task',
      description: 'Short description',
      date: '2024-12-25',
      status: 'Pending'
    },
    invalid: {
      title: '',
      description: '',
      date: 'invalid-date',
      status: 'Invalid Status'
    }
  },

  routes: {
    home: '/',
    addTask: '/add',
    taskList: '/tasks',
    scheduler: '/scheduler',
    login: '/login',
    register: '/register',
    updateTask: (id: number) => `/update/${id}`
  },

  apiEndpoints: {
    tasks: '/api/tasks',
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      logout: '/api/auth/logout'
    }
  },

  timeouts: {
    short: 3000,
    medium: 10000,
      long: 30000,
      networkIdle: 5000
  },

  viewports: {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1280, height: 720 },
    widescreen: { width: 1920, height: 1080 }
  },

  selectors: {
    // Navigation
    navLinks: 'nav a, nav button',
    mobileMenu: 'nav ul.md\\:hidden',
    sidebar: '#default-sidebar, .sidebar',

    // Forms
    formInputs: 'input, textarea, select',
    submitButton: 'button[type="submit"], button:has-text("Submit")',
    formErrors: '.error, .invalid, [text*="required"], [text*="field"]',

    // Task related
    taskList: '[data-testid="task-list"], .task-list, table',
    taskItem: '[data-testid="task-item"], .task-item, tr',
    loader: '.loader, [text*="Loading"], [text*="loading"]',
    toast: '.toast, .notification, [role="alert"]',

    // Common elements
    mainHeading: 'h1',
    pageTitle: 'title',
    mainContent: 'main, #app'
  }
}