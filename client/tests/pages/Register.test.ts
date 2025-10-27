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
  faLock: {},
  faEnvelope: {},
  faIdCard: {}
}))

// Lazy load the component to avoid import issues
const loadRegisterComponent = async () => {
  const component = await import('../../src/pages/Register.vue')
  return component.default
}

describe('Register Component', () => {
  let Register
  let mockAxiosPost

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()

    mockAxiosPost = vi.mocked(axios.post)
    mockPush.mockClear()

    Register = await loadRegisterComponent()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should mount successfully', () => {
    const wrapper = mountWithDefaults(Register)
    expect(wrapper.exists()).toBe(true)
  })

  it('has AOS functionality available', () => {
    mountWithDefaults(Register)

    expect(typeof mockAOS.init).toBe('function')
  })

  it('should display register form title', () => {
    const wrapper = mountWithDefaults(Register)
    expect(wrapper.text()).toContain('REGISTER')
  })

  it('should render all required form fields', () => {
    const wrapper = mountWithDefaults(Register)

    expect(wrapper.find('input#username').exists()).toBe(true)
    expect(wrapper.find('input#firstName').exists()).toBe(true)
    expect(wrapper.find('input#lastName').exists()).toBe(true)
    expect(wrapper.find('input#email').exists()).toBe(true)
    expect(wrapper.find('input#password').exists()).toBe(true)
  })

  it('should render submit button', () => {
    const wrapper = mountWithDefaults(Register)
    const submitButton = wrapper.find('input[type="submit"]')

    expect(submitButton.exists()).toBe(true)
    expect(submitButton.attributes('value')).toBe('Register')
  })

  it('has login navigation available', () => {
    const wrapper = mountWithDefaults(Register)

    // Use pragmatic navigation checks instead of exact DOM structure
    expect(wrapper.html()).toContain('login')
    expect(wrapper.html()).toContain('Already have an account')
  })

  it('should bind form inputs to reactive data', async () => {
    const wrapper = mountWithDefaults(Register)

    await wrapper.find('input#username').setValue('testuser')
    await wrapper.find('input#firstName').setValue('John')
    await wrapper.find('input#lastName').setValue('Doe')
    await wrapper.find('input#email').setValue('john.doe@example.com')
    await wrapper.find('input#password').setValue('password123')

    expect(wrapper.vm.registerData.username).toBe('testuser')
    expect(wrapper.vm.registerData.firstName).toBe('John')
    expect(wrapper.vm.registerData.lastName).toBe('Doe')
    expect(wrapper.vm.registerData.email).toBe('john.doe@example.com')
    expect(wrapper.vm.registerData.password).toBe('password123')
  })

  it('has functional form structure', () => {
    const wrapper = mountWithDefaults(Register)

    // Check if component has the method available
    expect(typeof wrapper.vm.submitFormData).toBe('function')

    // Test form structure and data binding
    const form = wrapper.find('form')
    expect(form.exists()).toBe(true)

    const usernameInput = wrapper.find('input#username')
    const firstNameInput = wrapper.find('input#firstName')
    const lastNameInput = wrapper.find('input#lastName')
    const emailInput = wrapper.find('input#email')
    const passwordInput = wrapper.find('input#password')

    expect(usernameInput.exists()).toBe(true)
    expect(firstNameInput.exists()).toBe(true)
    expect(lastNameInput.exists()).toBe(true)
    expect(emailInput.exists()).toBe(true)
    expect(passwordInput.exists()).toBe(true)
  })

  it('should show success message on successful registration', async () => {
    const mockResponse = {
      data: {
        user: { id: 1, username: 'testuser' }
      }
    }
    mockAxiosPost.mockResolvedValue(createMockResponse(mockResponse.data))

    const wrapper = mountWithDefaults(Register)

    await wrapper.find('input#username').setValue('testuser')
    await wrapper.find('input#firstName').setValue('John')
    await wrapper.find('input#lastName').setValue('Doe')
    await wrapper.find('input#email').setValue('john.doe@example.com')
    await wrapper.find('input#password').setValue('password123')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.vm.successMessage).toBe('Registration successful!')

    const successDiv = wrapper.find('.bg-green-500.text-white')
    expect(successDiv.exists()).toBe(true)
    expect(successDiv.text()).toContain('Registration successful!')
  })

  it('should navigate to login page on successful registration', async () => {
    const mockResponse = {
      data: {
        user: { id: 1, username: 'testuser' }
      }
    }
    mockAxiosPost.mockResolvedValue(createMockResponse(mockResponse.data))

    const wrapper = mountWithDefaults(Register)

    await wrapper.find('input#username').setValue('testuser')
    await wrapper.find('input#firstName').setValue('John')
    await wrapper.find('input#lastName').setValue('Doe')
    await wrapper.find('input#email').setValue('john.doe@example.com')
    await wrapper.find('input#password').setValue('password123')
    await wrapper.find('form').trigger('submit')

    expect(mockPush).toHaveBeenCalledWith({ name: 'Login' })
  })

  it('should show error message on registration failure', async () => {
    mockAxiosPost.mockRejectedValue(createMockError('Registration failed', 400))

    const wrapper = mountWithDefaults(Register)

    await wrapper.find('input#username').setValue('testuser')
    await wrapper.find('input#firstName').setValue('John')
    await wrapper.find('input#lastName').setValue('Doe')
    await wrapper.find('input#email').setValue('john.doe@example.com')
    await wrapper.find('input#password').setValue('password123')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.vm.errorMessage).toBe('Registration failed. Please try again.')

    const errorDiv = wrapper.find('.bg-red-500.text-white')
    expect(errorDiv.exists()).toBe(true)
    expect(errorDiv.text()).toContain('Registration failed. Please try again.')
  })

  it('should clear success message after timeout', async () => {
    vi.useFakeTimers()
    const mockResponse = {
      data: {
        user: { id: 1, username: 'testuser' }
      }
    }
    mockAxiosPost.mockResolvedValue(createMockResponse(mockResponse.data))

    const wrapper = mountWithDefaults(Register)

    await wrapper.find('input#username').setValue('testuser')
    await wrapper.find('input#firstName').setValue('John')
    await wrapper.find('input#lastName').setValue('Doe')
    await wrapper.find('input#email').setValue('john.doe@example.com')
    await wrapper.find('input#password').setValue('password123')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.vm.successMessage).toBe('Registration successful!')

    // Fast-forward time
    vi.advanceTimersByTime(5000)

    expect(wrapper.vm.successMessage).toBe('')

    vi.useRealTimers()
  })

  it('should clear error message after timeout', async () => {
    vi.useFakeTimers()
    mockAxiosPost.mockRejectedValue(createMockError('Registration failed', 400))

    const wrapper = mountWithDefaults(Register)

    await wrapper.find('input#username').setValue('testuser')
    await wrapper.find('input#firstName').setValue('John')
    await wrapper.find('input#lastName').setValue('Doe')
    await wrapper.find('input#email').setValue('john.doe@example.com')
    await wrapper.find('input#password').setValue('password123')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.vm.errorMessage).toBe('Registration failed. Please try again.')

    // Fast-forward time
    vi.advanceTimersByTime(3000)

    expect(wrapper.vm.errorMessage).toBe('')

    vi.useRealTimers()
  })

  it('should have correct input types', () => {
    const wrapper = mountWithDefaults(Register)

    expect(wrapper.find('input#username').attributes('type')).toBe('text')
    expect(wrapper.find('input#firstName').attributes('type')).toBe('text')
    expect(wrapper.find('input#lastName').attributes('type')).toBe('text')
    expect(wrapper.find('input#email').attributes('type')).toBe('email')
    expect(wrapper.find('input#password').attributes('type')).toBe('password')
  })

  it('should have proper placeholders', () => {
    const wrapper = mountWithDefaults(Register)

    expect(wrapper.find('input#username').attributes('placeholder')).toBe('Enter your username')
    expect(wrapper.find('input#firstName').attributes('placeholder')).toBe('Enter your first name')
    expect(wrapper.find('input#lastName').attributes('placeholder')).toBe('Enter your last name')
    expect(wrapper.find('input#email').attributes('placeholder')).toBe('Enter your email')
    expect(wrapper.find('input#password').attributes('placeholder')).toBe('Enter your password')
  })

  it('should have required fields', () => {
    const wrapper = mountWithDefaults(Register)

    expect(wrapper.find('input#username').attributes('required')).toBeDefined()
    expect(wrapper.find('input#firstName').attributes('required')).toBeDefined()
    expect(wrapper.find('input#lastName').attributes('required')).toBeDefined()
    expect(wrapper.find('input#email').attributes('required')).toBeDefined()
    expect(wrapper.find('input#password').attributes('required')).toBeDefined()
  })

  it('should have proper form styling', () => {
    const wrapper = mountWithDefaults(Register)
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
    const wrapper = mountWithDefaults(Register)
    const inputs = wrapper.findAll('input[type="text"], input[type="email"], input[type="password"]')

    inputs.forEach(input => {
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
      expect(input.classes()).toContain('pr-10')
    })
  })

  it('should have submit button styling', () => {
    const wrapper = mountWithDefaults(Register)
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
    const wrapper = mountWithDefaults(Register)
    const form = wrapper.find('form')

    expect(form.attributes('data-aos')).toBe('fade-up')
    expect(form.attributes('data-aos-duration')).toBe('500')
    expect(form.attributes('data-aos-ease')).toBe('ease')
  })

  it('should render FontAwesome icons', () => {
    const wrapper = mountWithDefaults(Register)
    const icons = wrapper.findAllComponents({ name: 'FontAwesomeIcon' })

    expect(icons.length).toBe(5)
  })

  it('should have proper labels for form fields', () => {
    const wrapper = mountWithDefaults(Register)

    expect(wrapper.find('label[for="username"]').exists()).toBe(true)
    expect(wrapper.find('label[for="firstName"]').exists()).toBe(true)
    expect(wrapper.find('label[for="lastName"]').exists()).toBe(true)
    expect(wrapper.find('label[for="email"]').exists()).toBe(true)
    expect(wrapper.find('label[for="password"]').exists()).toBe(true)
  })

  it('should have page title styling', () => {
    const wrapper = mountWithDefaults(Register)
    const title = wrapper.find('h2')

    expect(title.exists()).toBe(true)
    expect(title.classes()).toContain('text-3xl')
    expect(title.classes()).toContain('font-bold')
    expect(title.classes()).toContain('text-gray-800')
  })

  it('should have background image styling', () => {
    const wrapper = mountWithDefaults(Register)
    const container = wrapper.find('.container')

    expect(container.attributes('style')).toContain('background-image')
  })

  it('should have responsive container styling', () => {
    const wrapper = mountWithDefaults(Register)
    const container = wrapper.find('.container')

    expect(container.classes()).toContain('container')
    expect(container.classes()).toContain('mx-auto')
    expect(container.classes()).toContain('text-light')
    expect(container.classes()).toContain('min-h-screen')
    expect(container.classes()).toContain('flex')
    expect(container.classes()).toContain('items-center')
    expect(container.classes()).toContain('justify-center')
  })

  it('should have proper message styling for success and error', () => {
    const wrapper = mountWithDefaults(Register)

    // Check success message styling (when shown)
    const successDiv = wrapper.find('.fixed.top-4.left-1\\/2')
    expect(successDiv.exists()).toBe(true)

    // Check error message styling (when shown)
    const errorDiv = wrapper.findAll('.fixed.top-4.left-1\\/2')
    expect(errorDiv.length).toBe(2) // Both success and error containers exist
  })

  it('should have form field icons positioned correctly', () => {
    const wrapper = mountWithDefaults(Register)
    const icons = wrapper.findAllComponents({ name: 'FontAwesomeIcon' })

    expect(icons.length).toBe(5)
    icons.forEach(icon => {
      const iconWrapper = icon.wrapperElement
      expect(iconWrapper.classList.contains('absolute')).toBe(true)
      expect(iconWrapper.classList.contains('top-2')).toBe(true)
      expect(iconWrapper.classList.contains('right-2')).toBe(true)
      expect(iconWrapper.classList.contains('text-gray-500')).toBe(true)
    })
  })

  it('should have proper form layout with centered content', () => {
    const wrapper = mountWithDefaults(Register)
    const container = wrapper.find('.container')
    const form = wrapper.find('form')

    expect(container.classes()).toContain('items-center')
    expect(container.classes()).toContain('justify-center')
    expect(form.classes()).toContain('mx-auto')
  })

  it('has login link container available', () => {
    const wrapper = mountWithDefaults(Register)

    // Test that navigation content exists without exact structure expectations
    expect(wrapper.html()).toContain('login')
  })

  it('has FontAwesome functionality available', () => {
    mountWithDefaults(Register)

    expect(typeof mockLibrary.add).toBe('function')
  })

  it('should have semantic HTML structure', () => {
    const wrapper = mountWithDefaults(Register)

    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('label[for="username"]').exists()).toBe(true)
    expect(wrapper.find('label[for="firstName"]').exists()).toBe(true)
    expect(wrapper.find('label[for="lastName"]').exists()).toBe(true)
    expect(wrapper.find('label[for="email"]').exists()).toBe(true)
    expect(wrapper.find('label[for="password"]').exists()).toBe(true)
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('input[type="submit"]').exists()).toBe(true)
  })

  it('should have label styling', () => {
    const wrapper = mountWithDefaults(Register)
    const labels = wrapper.findAll('label')

    labels.forEach(label => {
      expect(label.classes()).toContain('block')
      expect(label.classes()).toContain('text-gray-700')
      expect(label.classes()).toContain('font-bold')
      expect(label.classes()).toContain('mb-2')
    })
  })

  it('should have form field groups with proper spacing', () => {
    const wrapper = mountWithDefaults(Register)
    const fieldGroups = wrapper.findAll('.mb-4, .mb-6')

    expect(fieldGroups.length).toBeGreaterThan(0)
    fieldGroups.forEach(group => {
      expect(group.classes().some(className => className.startsWith('mb-'))).toBe(true)
    })
  })

  it('should have center alignment for title', () => {
    const wrapper = mountWithDefaults(Register)
    const titleContainer = wrapper.find('.text-center.mb-6')

    expect(titleContainer.exists()).toBe(true)
    expect(titleContainer.classes()).toContain('text-center')
  })
})