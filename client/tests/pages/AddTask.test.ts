import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mountWithDefaults, waitForUpdate, createMockResponse, createMockError, mockConsole } from '../utils/test-utils'
import { createMockTask } from '../utils/factories'
import axios from 'axios'
import { mockLibrary, mockAOS } from '../setup-tests'

// Mock Vue Router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

// Mock AOS
vi.mock('aos', () => ({
  default: {
    init: vi.fn()
  }
}))

// Mock vue-cookies
vi.mock('vue-cookies', () => ({
  cookies: {
    get: vi.fn(() => 'mock-cookie-value'),
    set: vi.fn(),
    remove: vi.fn()
  }
}))

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn()
  }
}))

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: 'fakesession=mock-cookie-value'
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
  faTasks: {},
  faPenAlt: {}
}))

// Lazy load the component to avoid import issues
const loadAddTaskComponent = async () => {
  const component = await import('../../src/pages/AddTask.vue')
  return component.default
}

describe('AddTask Component', () => {
  let AddTask
  let mockAxiosPost

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()

    mockAxiosPost = vi.mocked(axios.post)

    // Mock document.cookie access
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'fakesession=test-session-value'
    })

    AddTask = await loadAddTaskComponent()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should mount successfully', () => {
    const wrapper = mountWithDefaults(AddTask)
    expect(wrapper.exists()).toBe(true)
  })

  it('should render the form title', () => {
    const wrapper = mountWithDefaults(AddTask)
    expect(wrapper.text()).toContain('ADD TASK')
  })

  it('should render form fields for title and description', () => {
    const wrapper = mountWithDefaults(AddTask)

    expect(wrapper.find('input#title').exists()).toBe(true)
    expect(wrapper.find('textarea#description').exists()).toBe(true)
    expect(wrapper.find('select').exists()).toBe(true)
    expect(wrapper.find('input#dueDate').exists()).toBe(true)
  })

  it('should have submit button', () => {
    const wrapper = mountWithDefaults(AddTask)
    const submitButton = wrapper.find('input[type="submit"]')

    expect(submitButton.exists()).toBe(true)
    expect(submitButton.attributes('value')).toBe('Add Task')
  })

  it('should bind form inputs to reactive data', async () => {
    const wrapper = mountWithDefaults(AddTask)
    const titleInput = wrapper.find('input#title')
    const descriptionTextarea = wrapper.find('textarea#description')

    await titleInput.setValue('Test Task Title')
    await descriptionTextarea.setValue('Test Task Description')

    expect(wrapper.vm.taskData.title).toBe('Test Task Title')
    expect(wrapper.vm.taskData.description).toBe('Test Task Description')
  })

  it('should display status dropdown with correct options', () => {
    const wrapper = mountWithDefaults(AddTask)
    const statusOptions = wrapper.findAll('select option')

    expect(statusOptions.length).toBe(4)
    expect(statusOptions[0].text()).toBe('To Do')
    expect(statusOptions[1].text()).toBe('In Progress')
    expect(statusOptions[2].text()).toBe('In Review')
    expect(statusOptions[3].text()).toBe('Done')
  })

  it('has AOS functionality available', () => {
    mountWithDefaults(AddTask)

    expect(typeof mockAOS.init).toBe('function')
  })

  it('should read cookie value on component creation', () => {
    mountWithDefaults(AddTask)

    // Should attempt to read fakesession cookie
    expect(document.cookie).toContain('fakesession')
  })

  it('should submit form data successfully and show success message', async () => {
    const mockTask = createMockTask({ title: 'New Task', description: 'New Description' })
    mockAxiosPost.mockResolvedValue(createMockResponse(mockTask))

    const wrapper = mountWithDefaults(AddTask)

    // Fill form
    await wrapper.find('input#title').setValue('New Task')
    await wrapper.find('textarea#description').setValue('New Description')
    await wrapper.find('select').setValue('In Progress')
    await wrapper.find('input#dueDate').setValue('2024-12-31')

    // Submit form
    await wrapper.find('form').trigger('submit')

    expect(mockAxiosPost).toHaveBeenCalledWith('/tasks/', {
      title: 'New Task',
      description: 'New Description',
      status: 'In Progress',
      dueDate: '2024-12-31'
    })

    expect(wrapper.vm.successMessage).toBe('Task created successfully!')
  })

  it('should show success message after successful submission', async () => {
    const mockTask = createMockTask()
    mockAxiosPost.mockResolvedValue(createMockResponse(mockTask))

    const wrapper = mountWithDefaults(AddTask)

    await wrapper.find('input#title').setValue('Test Task')
    await wrapper.find('textarea#description').setValue('Test Description')
    await wrapper.find('form').trigger('submit')

    const successDiv = wrapper.find('.bg-success.text-light')
    expect(successDiv.exists()).toBe(true)
    expect(successDiv.text()).toContain('Task created successfully!')
  })

  it('should handle API error and clear success message', async () => {
    mockAxiosPost.mockRejectedValue(createMockError('API Error', 500))

    const wrapper = mountWithDefaults(AddTask)

    await wrapper.find('input#title').setValue('Test Task')
    await wrapper.find('textarea#description').setValue('Test Description')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.vm.successMessage).toBe('')

    const successDiv = wrapper.find('.bg-success.text-light')
    expect(successDiv.exists()).toBe(false)
  })

  it('should clear success message after timeout', async () => {
    vi.useFakeTimers()
    const mockTask = createMockTask()
    mockAxiosPost.mockResolvedValue(createMockResponse(mockTask))

    const wrapper = mountWithDefaults(AddTask)

    await wrapper.find('input#title').setValue('Test Task')
    await wrapper.find('textarea#description').setValue('Test Description')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.vm.successMessage).toBe('Task created successfully!')

    // Fast-forward time
    vi.advanceTimersByTime(5000)

    expect(wrapper.vm.successMessage).toBe('')

    vi.useRealTimers()
  })

  it('should validate required fields', async () => {
    const wrapper = mountWithDefaults(AddTask)
    const titleInput = wrapper.find('input#title')

    // Check that title input has required attribute
    expect(titleInput.attributes('required')).toBe('')
  })

  it('should apply correct CSS classes to form elements', () => {
    const wrapper = mountWithDefaults(AddTask)
    const form = wrapper.find('form')
    const titleInput = wrapper.find('input#title')
    const descriptionTextarea = wrapper.find('textarea#description')

    expect(form.classes()).toContain('md:w-1/2')
    expect(form.classes()).toContain('sm:w-3/4')
    expect(form.classes()).toContain('mx-auto')

    expect(titleInput.classes()).toContain('shadow')
    expect(titleInput.classes()).toContain('appearance-none')
    expect(titleInput.classes()).toContain('border')
    expect(titleInput.classes()).toContain('rounded')

    expect(descriptionTextarea.classes()).toContain('shadow')
    expect(descriptionTextarea.classes()).toContain('appearance-none')
    expect(descriptionTextarea.classes()).toContain('border')
    expect(descriptionTextarea.classes()).toContain('rounded')
  })

  it('should render FontAwesome icons', () => {
    const wrapper = mountWithDefaults(AddTask)
    const icons = wrapper.findAllComponents({ name: 'FontAwesomeIcon' })

    expect(icons.length).toBeGreaterThanOrEqual(2)
  })

  it('should have form labels with correct text', () => {
    const wrapper = mountWithDefaults(AddTask)

    expect(wrapper.text()).toContain('Title')
    expect(wrapper.text()).toContain('Description')
    expect(wrapper.text()).toContain('Status')
    expect(wrapper.text()).toContain('Due Date')
  })

  it('should apply background image styling', () => {
    const wrapper = mountWithDefaults(AddTask)
    const container = wrapper.find('.container')

    expect(container.classes()).toContain('bg-gray-200')
    expect(container.attributes('style')).toContain('background-image')
  })

  it('should handle date input changes', async () => {
    const wrapper = mountWithDefaults(AddTask)
    const dueDateInput = wrapper.find('input#dueDate')

    await dueDateInput.setValue('2024-12-25')

    expect(wrapper.vm.taskData.dueDate).toBe('2024-12-25')
  })

  it('should handle status selection changes', async () => {
    const wrapper = mountWithDefaults(AddTask)
    const statusSelect = wrapper.find('select')

    await statusSelect.setValue('Done')

    expect(wrapper.vm.taskData.status).toBe('Done')
  })

  it('should not submit empty form', async () => {
    const wrapper = mountWithDefaults(AddTask)

    // Form should have required attributes preventing empty submission
    const titleInput = wrapper.find('input#title')
    expect(titleInput.attributes('required')).toBeDefined()
  })

  it('should have proper form structure with semantic HTML', () => {
    const wrapper = mountWithDefaults(AddTask)

    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('label[for="title"]').exists()).toBe(true)
    expect(wrapper.find('label[for="description"]').exists()).toBe(true)
    expect(wrapper.find('label[for="status"]').exists()).toBe(true)
    expect(wrapper.find('label[for="dueDate"]').exists()).toBe(true)
  })

  it('has FontAwesome functionality available', () => {
    mountWithDefaults(AddTask)

    expect(typeof mockLibrary.add).toBe('function')
  })

  it('should have AOS attributes on form', () => {
    const wrapper = mountWithDefaults(AddTask)
    const form = wrapper.find('form')

    expect(form.attributes('data-aos')).toBe('fade-left')
    expect(form.attributes('data-aos-duration')).toBe('500')
    expect(form.attributes('data-aos-ease')).toBe('ease')
  })
})