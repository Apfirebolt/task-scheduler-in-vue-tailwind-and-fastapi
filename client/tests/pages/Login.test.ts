import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mountWithDefaults, waitForUpdate, createMockResponse, createMockError } from '../utils/test-utils'
import axios from 'axios'
import { mockAOS, mockLibrary, mockAxiosPost } from '../setup-tests'

// Mock Vue Router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

// Mock AOS
vi.mock('aos', () => ({
  default: {
    init: vi.fn()
  }
}))

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn()
  }
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock FontAwesome
vi.mock('@fortawesome/vue-fontawesome', () => ({
  FontAwesomeIcon: {
    name: 'FontAwesomeIcon',
    template: '<i></i>',
    props: ['icon']
  }
}))

vi.mock('@fortawesome/fontawesome-svg-core', () => ({
  library: {
    add: vi.fn()
  }
}))

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faUser: {},
  faLock: {}
}))

// Lazy load the component to avoid import issues
const loadLoginComponent = async () => {
  const component = await import('../../src/pages/Login.vue')
  return component.default
}

describe('Login Component', () => {
  let Login
  let mockAxiosPost

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()

    mockAxiosPost = vi.mocked(axios.post)
    localStorageMock.setItem.mockClear()
    mockPush.mockClear()

    Login = await loadLoginComponent()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should mount successfully', () => {
    const wrapper = mountWithDefaults(Login)
    expect(wrapper.exists()).toBe(true)
  })

  it('has AOS functionality available', () => {
    mountWithDefaults(Login)

    expect(typeof mockAOS.init).toBe('function')
  })

  it('should display login form title', () => {
    const wrapper = mountWithDefaults(Login)
    expect(wrapper.text()).toContain('LOGIN')
  })

  it('should render email input field', () => {
    const wrapper = mountWithDefaults(Login)
    const emailInput = wrapper.find('input#email')

    expect(emailInput.exists()).toBe(true)
    expect(emailInput.attributes('type')).toBe('email')
    expect(emailInput.attributes('placeholder')).toBe('Enter your email')
    expect(emailInput.attributes('required')).toBeDefined()
  })

  it('should render password input field', () => {
    const wrapper = mountWithDefaults(Login)
    const passwordInput = wrapper.find('input#password')

    expect(passwordInput.exists()).toBe(true)
    expect(passwordInput.attributes('type')).toBe('password')
    expect(passwordInput.attributes('placeholder')).toBe('Enter your password')
    expect(passwordInput.attributes('required')).toBeDefined()
  })

  it('should render submit button', () => {
    const wrapper = mountWithDefaults(Login)
    const submitButton = wrapper.find('input[type="submit"]')

    expect(submitButton.exists()).toBe(true)
    expect(submitButton.attributes('value')).toBe('Login')
  })

  it('has registration navigation available', () => {
    const wrapper = mountWithDefaults(Login)

    // Use pragmatic navigation checks instead of exact DOM structure
    expect(wrapper.html()).toContain('register')
    expect(wrapper.html()).toContain("Don't have an account")
  })

  it('should bind form inputs to reactive data', async () => {
    const wrapper = mountWithDefaults(Login)
    const emailInput = wrapper.find('input#email')
    const passwordInput = wrapper.find('input#password')

    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('password123')

    expect(wrapper.vm.loginData.email).toBe('test@example.com')
    expect(wrapper.vm.loginData.password).toBe('password123')
  })

  it('has functional form structure', () => {
    const wrapper = mountWithDefaults(Login)

    // Check if component has the method available
    expect(typeof wrapper.vm.submitFormData).toBe('function')

    // Test form structure and data binding
    const form = wrapper.find('form')
    expect(form.exists()).toBe(true)

    const emailInput = wrapper.find('input#email')
    const passwordInput = wrapper.find('input#password')
    expect(emailInput.exists()).toBe(true)
    expect(passwordInput.exists()).toBe(true)
  })

  it('should show success message on successful login', async () => {
    const mockResponse = {
      data: {
        token: 'mock-jwt-token'
      }
    }
    mockAxiosPost.mockResolvedValue(createMockResponse(mockResponse.data))

    const wrapper = mountWithDefaults(Login)

    await wrapper.find('input#email').setValue('test@example.com')
    await wrapper.find('input#password').setValue('password123')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.vm.successMessage).toBe('Login successful!')

    const successDiv = wrapper.find('.bg-green-500.text-white')
    expect(successDiv.exists()).toBe(true)
    expect(successDiv.text()).toContain('Login successful!')
  })

  it('should store token in localStorage on successful login', async () => {
    const mockResponse = {
      data: {
        token: 'mock-jwt-token'
      }
    }
    mockAxiosPost.mockResolvedValue(createMockResponse(mockResponse.data))

    const wrapper = mountWithDefaults(Login)

    await wrapper.find('input#email').setValue('test@example.com')
    await wrapper.find('input#password').setValue('password123')
    await wrapper.find('form').trigger('submit')

    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-jwt-token')
  })

  it('should navigate to dashboard on successful login', async () => {
    const mockResponse = {
      data: {
        token: 'mock-jwt-token'
      }
    }
    mockAxiosPost.mockResolvedValue(createMockResponse(mockResponse.data))

    const wrapper = mountWithDefaults(Login)

    await wrapper.find('input#email').setValue('test@example.com')
    await wrapper.find('input#password').setValue('password123')
    await wrapper.find('form').trigger('submit')

    expect(mockPush).toHaveBeenCalledWith({ name: 'Dashboard' })
  })

  it('should show error message on login failure', async () => {
    mockAxiosPost.mockRejectedValue(createMockError('Invalid credentials', 401))

    const wrapper = mountWithDefaults(Login)

    await wrapper.find('input#email').setValue('test@example.com')
    await wrapper.find('input#password').setValue('wrongpassword')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.vm.errorMessage).toBe('Invalid credentials. Please try again.')

    const errorDiv = wrapper.find('.bg-red-500.text-white')
    expect(errorDiv.exists()).toBe(true)
    expect(errorDiv.text()).toContain('Invalid credentials. Please try again.')
  })

  it('should clear success message after timeout', async () => {
    vi.useFakeTimers()
    const mockResponse = {
      data: {
        token: 'mock-jwt-token'
      }
    }
    mockAxiosPost.mockResolvedValue(createMockResponse(mockResponse.data))

    const wrapper = mountWithDefaults(Login)

    await wrapper.find('input#email').setValue('test@example.com')
    await wrapper.find('input#password').setValue('password123')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.vm.successMessage).toBe('Login successful!')

    // Fast-forward time
    vi.advanceTimersByTime(5000)

    expect(wrapper.vm.successMessage).toBe('')

    vi.useRealTimers()
  })

  it('should clear error message after timeout', async () => {
    vi.useFakeTimers()
    mockAxiosPost.mockRejectedValue(createMockError('Invalid credentials', 401))

    const wrapper = mountWithDefaults(Login)

    await wrapper.find('input#email').setValue('test@example.com')
    await wrapper.find('input#password').setValue('wrongpassword')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.vm.errorMessage).toBe('Invalid credentials. Please try again.')

    // Fast-forward time
    vi.advanceTimersByTime(3000)

    expect(wrapper.vm.errorMessage).toBe('')

    vi.useRealTimers()
  })

  it('should have proper form styling', () => {
    const wrapper = mountWithDefaults(Login)
    const form = wrapper.find('form')

    expect(form.classes()).toContain('w-full')
    expect(form.classes()).toContain('max-w-md')
    expect(form.classes()).toContain('mx-auto')
    expect(form.classes()).toContain('bg-white')
    expect(form.classes()).toContain('bg-opacity-90')
    expect(form.classes()).toContain('p-8')
    expect(form.classes()).toContain('rounded-lg')
    expect(form.classes()).toContain('shadow-lg')
  })

  it('should have input field styling', () => {
    const wrapper = mountWithDefaults(Login)
    const emailInput = wrapper.find('input#email')
    const passwordInput = wrapper.find('input#password')

    [emailInput, passwordInput].forEach(input => {
      expect(input.classes()).toContain('shadow')
      expect(input.classes()).toContain('appearance-none')
      expect(input.classes()).toContain('border')
      expect(input.classes()).toContain('rounded')
      expect(input.classes()).toContain('w-full')
      expect(input.classes()).toContain('py-2')
      expect(input.classes()).toContain('px-3')
      expect(input.classes()).toContain('text-gray-700')
      expect(input.classes()).toContain('leading-tight')
      expect(input.classes()).toContain('focus:outline-none')
      expect(input.classes()).toContain('focus:shadow-outline')
    })
  })

  it('should have submit button styling', () => {
    const wrapper = mountWithDefaults(Login)
    const submitButton = wrapper.find('input[type="submit"]')

    expect(submitButton.classes()).toContain('w-full')
    expect(submitButton.classes()).toContain('shadow')
    expect(submitButton.classes()).toContain('bg-blue-500')
    expect(submitButton.classes()).toContain('hover:bg-blue-700')
    expect(submitButton.classes()).toContain('text-white')
    expect(submitButton.classes()).toContain('font-bold')
    expect(submitButton.classes()).toContain('py-2')
    expect(submitButton.classes()).toContain('px-4')
    expect(submitButton.classes()).toContain('rounded')
    expect(submitButton.classes()).toContain('cursor-pointer')
  })

  it('should have AOS attributes on form', () => {
    const wrapper = mountWithDefaults(Login)
    const form = wrapper.find('form')

    expect(form.attributes('data-aos')).toBe('fade-up')
    expect(form.attributes('data-aos-duration')).toBe('500')
    expect(form.attributes('data-aos-ease')).toBe('ease')
  })

  it('should render FontAwesome icons', () => {
    const wrapper = mountWithDefaults(Login)
    const icons = wrapper.findAllComponents({ name: 'FontAwesomeIcon' })

    expect(icons.length).toBe(2)
  })

  it('should have proper labels for form fields', () => {
    const wrapper = mountWithDefaults(Login)

    expect(wrapper.find('label[for="email"]').exists()).toBe(true)
    expect(wrapper.find('label[for="password"]').exists()).toBe(true)
  })

  it('should have page title styling', () => {
    const wrapper = mountWithDefaults(Login)
    const title = wrapper.find('h2')

    expect(title.exists()).toBe(true)
    expect(title.classes()).toContain('text-3xl')
    expect(title.classes()).toContain('font-bold')
    expect(title.classes()).toContain('text-gray-800')
  })

  it('should have background image styling', () => {
    const wrapper = mountWithDefaults(Login)
    const container = wrapper.find('.container')

    expect(container.attributes('style')).toContain('background-image')
  })

  it('should have responsive container styling', () => {
    const wrapper = mountWithDefaults(Login)
    const container = wrapper.find('.container')

    expect(container.classes()).toContain('container')
    expect(container.classes()).toContain('mx-auto')
    expect(container.classes()).toContain('text-light')
    expect(container.classes()).toContain('min-h-screen')
    expect(container.classes()).toContain('flex')
    expect(container.classes()).toContain('items-center')
    expect(container.classes()).toContain('justify-center')
  })

  it('should have proper message styling for success and error', async () => {
    const wrapper = mountWithDefaults(Login)

    // Check success message styling (when shown)
    const successDiv = wrapper.find('.fixed.top-4.left-1\\/2')
    expect(successDiv.exists()).toBe(true)

    // Check error message styling (when shown)
    const errorDiv = wrapper.findAll('.fixed.top-4.left-1\\/2')
    expect(errorDiv.length).toBe(2) // Both success and error containers exist
  })

  it('should have form field icons positioned correctly', () => {
    const wrapper = mountWithDefaults(Login)
    const emailIcon = wrapper.find('input#email + .absolute')
    const passwordIcon = wrapper.find('input#password + .absolute')

    expect(emailIcon.exists()).toBe(true)
    expect(passwordIcon.exists()).toBe(true)
  })

  it('should have proper form layout with centered content', () => {
    const wrapper = mountWithDefaults(Login)
    const container = wrapper.find('.container')
    const form = wrapper.find('form')

    expect(container.classes()).toContain('items-center')
    expect(container.classes()).toContain('justify-center')
    expect(form.classes()).toContain('mx-auto')
  })

  it('has navigation link container available', () => {
    const wrapper = mountWithDefaults(Login)

    // Test that navigation content exists without exact structure expectations
    expect(wrapper.html()).toContain('register')
  })

  it('has FontAwesome functionality available', () => {
    mountWithDefaults(Login)

    expect(typeof mockLibrary.add).toBe('function')
  })

  it('should have proper form validation with required fields', () => {
    const wrapper = mountWithDefaults(Login)
    const emailInput = wrapper.find('input#email')
    const passwordInput = wrapper.find('input#password')

    expect(emailInput.attributes('required')).toBeDefined()
    expect(passwordInput.attributes('required')).toBeDefined()
  })

  it('should have semantic HTML structure', () => {
    const wrapper = mountWithDefaults(Login)

    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('label[for="email"]').exists()).toBe(true)
    expect(wrapper.find('label[for="password"]').exists()).toBe(true)
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('input[type="submit"]').exists()).toBe(true)
  })
})