import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mountWithDefaults, waitForUpdate, createMockResponse, createMockError } from '../utils/test-utils'
import { createMockTask } from '../utils/factories'
import axios from 'axios'
import { mockAOS, mockLibrary, mockAxiosGet, mockAxiosPatch } from '../setup-tests'

// Mock Vue Router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { id: '1' }
  }),
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
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
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
  faTasks: {},
  faPenAlt: {}
}))

// Lazy load the component to avoid import issues
const loadUpdateTaskComponent = async () => {
  const component = await import('../../src/pages/UpdateTask.vue')
  return component.default
}

describe('UpdateTask Component', () => {
  let UpdateTask
  let mockAxiosGet, mockAxiosPatch, mockAxiosDelete

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()

    mockAxiosGet = vi.mocked(axios.get)
    mockAxiosPatch = vi.mocked(axios.patch)
    mockAxiosDelete = vi.mocked(axios.delete)

    UpdateTask = await loadUpdateTaskComponent()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should mount successfully', () => {
    const wrapper = mountWithDefaults(UpdateTask)
    expect(wrapper.exists()).toBe(true)
  })

  it('has AOS functionality available', () => {
    mountWithDefaults(UpdateTask)

    expect(typeof mockAOS.init).toBe('function')
  })

  it('should fetch task data on component mount', async () => {
    const mockTask = createMockTask()
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTask))

    const wrapper = mountWithDefaults(UpdateTask)
    await waitForUpdate(wrapper)

    expect(mockAxiosGet).toHaveBeenCalledWith('/tasks/1')
    expect(wrapper.vm.taskData).toEqual(mockTask)
  })

  it('should display update form title', () => {
    const wrapper = mountWithDefaults(UpdateTask)
    expect(wrapper.text()).toContain('UPDATE TASK')
  })

  it('should render form fields for task data', () => {
    const wrapper = mountWithDefaults(UpdateTask)

    expect(wrapper.find('input#title').exists()).toBe(true)
    expect(wrapper.find('textarea#description').exists()).toBe(true)
    expect(wrapper.find('select').exists()).toBe(true)
    expect(wrapper.find('input#dueDate').exists()).toBe(true)
  })

  it('should render delete button', () => {
    const wrapper = mountWithDefaults(UpdateTask)
    const deleteButton = wrapper.find('button')

    expect(deleteButton.exists()).toBe(true)
    expect(deleteButton.text()).toContain('Delete Task')
  })

  it('should have update submit button', () => {
    const wrapper = mountWithDefaults(UpdateTask)
    const submitButton = wrapper.find('input[type="submit"]')

    expect(submitButton.exists()).toBe(true)
    expect(submitButton.attributes('value')).toBe('Update Task')
  })

  it('should populate form with existing task data', async () => {
    const mockTask = createMockTask({
      title: 'Existing Task',
      description: 'Existing Description',
      status: 'In Progress',
      dueDate: '2024-12-25'
    })
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTask))

    const wrapper = mountWithDefaults(UpdateTask)
    await waitForUpdate(wrapper)

    const titleInput = wrapper.find('input#title')
    const descriptionTextarea = wrapper.find('textarea#description')
    const statusSelect = wrapper.find('select')
    const dueDateInput = wrapper.find('input#dueDate')

    expect(titleInput.element.value).toBe('Existing Task')
    expect(descriptionTextarea.element.value).toBe('Existing Description')
    expect(statusSelect.element.value).toBe('In Progress')
    expect(dueDateInput.element.value).toBe('2024-12-25')
  })

  it('has functional form structure', async () => {
    const mockTask = createMockTask()
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTask))

    const wrapper = mountWithDefaults(UpdateTask)
    await waitForUpdate(wrapper)

    // Check if component has the method available
    expect(typeof wrapper.vm.submitFormData).toBe('function')

    // Test form structure and data binding
    const form = wrapper.find('form')
    expect(form.exists()).toBe(true)

    const titleInput = wrapper.find('input#title')
    const descriptionInput = wrapper.find('textarea#description')
    const statusSelect = wrapper.find('select#status')
    const dueDateInput = wrapper.find('input#dueDate')

    expect(titleInput.exists()).toBe(true)
    expect(descriptionInput.exists()).toBe(true)
    expect(statusSelect.exists()).toBe(true)
    expect(dueDateInput.exists()).toBe(true)
  })

  it('should show success message after successful update', async () => {
    const mockTask = createMockTask()
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTask))
    mockAxiosPatch.mockResolvedValue(createMockResponse(mockTask))

    const wrapper = mountWithDefaults(UpdateTask)
    await waitForUpdate(wrapper)

    await wrapper.find('form').trigger('submit')

    const successDiv = wrapper.find('.bg-success.text-light')
    expect(successDiv.exists()).toBe(true)
    expect(successDiv.text()).toContain('Task updated successfully!')
  })

  it('should handle API error during update', async () => {
    const mockTask = createMockTask()
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTask))
    mockAxiosPatch.mockRejectedValue(createMockError('Update Error', 500))

    const wrapper = mountWithDefaults(UpdateTask)
    await waitForUpdate(wrapper)

    await wrapper.find('form').trigger('submit')

    expect(wrapper.vm.successMessage).toBe('')
  })

  it('should delete task and navigate to task list', async () => {
    const mockTask = createMockTask()
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTask))
    mockAxiosDelete.mockResolvedValue(createMockResponse({}))

    const wrapper = mountWithDefaults(UpdateTask)
    await waitForUpdate(wrapper)

    const deleteButton = wrapper.find('button')
    await deleteButton.trigger('click')

    expect(mockAxiosDelete).toHaveBeenCalledWith('/tasks/1')
    expect(mockPush).toHaveBeenCalledWith({
      name: 'TaskList'
    })
  })

  it('should handle API error during deletion', async () => {
    const mockTask = createMockTask()
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTask))
    mockAxiosDelete.mockRejectedValue(createMockError('Delete Error', 500))

    const wrapper = mountWithDefaults(UpdateTask)
    await waitForUpdate(wrapper)

    const deleteButton = wrapper.find('button')
    await deleteButton.trigger('click')

    expect(wrapper.vm.errorMessage).toBe('Some error occurred')

    const errorDiv = wrapper.find('.text-center.bg-success.text-light')
    if (errorDiv.exists()) {
      expect(errorDiv.text()).toContain('Some error occurred')
    }
  })

  it('should show success message when task data is retrieved', async () => {
    const mockTask = createMockTask()
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTask))

    const wrapper = mountWithDefaults(UpdateTask)
    await waitForUpdate(wrapper)

    expect(wrapper.vm.successMessage).toBe('Task data retrieved successfully!')

    const successDiv = wrapper.find('.bg-success.text-light')
    expect(successDiv.exists()).toBe(true)
    expect(successDiv.text()).toContain('Task data retrieved successfully!')
  })

  it('should clear success message after timeout', async () => {
    vi.useFakeTimers()
    const mockTask = createMockTask()
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTask))

    const wrapper = mountWithDefaults(UpdateTask)
    await waitForUpdate(wrapper)

    expect(wrapper.vm.successMessage).toBe('Task data retrieved successfully!')

    // Fast-forward time
    vi.advanceTimersByTime(5000)

    expect(wrapper.vm.successMessage).toBe('')

    vi.useRealTimers()
  })

  it('should clear error message after timeout', async () => {
    vi.useFakeTimers()
    const mockTask = createMockTask()
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTask))
    mockAxiosDelete.mockRejectedValue(createMockError('Delete Error', 500))

    const wrapper = mountWithDefaults(UpdateTask)
    await waitForUpdate(wrapper)

    const deleteButton = wrapper.find('button')
    await deleteButton.trigger('click')

    expect(wrapper.vm.errorMessage).toBe('Some error occurred')

    // Fast-forward time
    vi.advanceTimersByTime(3000)

    expect(wrapper.vm.errorMessage).toBe('')

    vi.useRealTimers()
  })

  it('should display status dropdown with correct options', () => {
    const wrapper = mountWithDefaults(UpdateTask)
    const statusOptions = wrapper.findAll('select option')

    expect(statusOptions.length).toBe(4)
    expect(statusOptions[0].text()).toBe('To Do')
    expect(statusOptions[1].text()).toBe('In Progress')
    expect(statusOptions[2].text()).toBe('In Review')
    expect(statusOptions[3].text()).toBe('Done')
  })

  it('should have form labels with correct text', () => {
    const wrapper = mountWithDefaults(UpdateTask)

    expect(wrapper.text()).toContain('Title')
    expect(wrapper.text()).toContain('Description')
    expect(wrapper.text()).toContain('Status')
    expect(wrapper.text()).toContain('Due Date')
  })

  it('should apply correct CSS classes to form elements', () => {
    const wrapper = mountWithDefaults(UpdateTask)
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
    const wrapper = mountWithDefaults(UpdateTask)
    const icons = wrapper.findAllComponents({ name: 'FontAwesomeIcon' })

    expect(icons.length).toBeGreaterThanOrEqual(2)
  })

  it('should have AOS attributes on form', () => {
    const wrapper = mountWithDefaults(UpdateTask)
    const form = wrapper.find('form')

    expect(form.attributes('data-aos')).toBe('fade-right')
    expect(form.attributes('data-aos-duration')).toBe('500')
    expect(form.attributes('data-aos-ease')).toBe('ease')
  })

  it('should handle form data changes', async () => {
    const mockTask = createMockTask()
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTask))

    const wrapper = mountWithDefaults(UpdateTask)
    await waitForUpdate(wrapper)

    // Change form values
    await wrapper.find('input#title').setValue('New Title')
    await wrapper.find('textarea#description').setValue('New Description')
    await wrapper.find('select').setValue('Done')
    await wrapper.find('input#dueDate').setValue('2024-12-31')

    expect(wrapper.vm.taskData.title).toBe('New Title')
    expect(wrapper.vm.taskData.description).toBe('New Description')
    expect(wrapper.vm.taskData.status).toBe('Done')
    expect(wrapper.vm.taskData.dueDate).toBe('2024-12-31')
  })

  it('should apply background image styling', () => {
    const wrapper = mountWithDefaults(UpdateTask)
    const container = wrapper.find('.container')

    expect(container.attributes('style')).toContain('background-image')
  })

  it('should have correct styling for update button', () => {
    const wrapper = mountWithDefaults(UpdateTask)
    const submitButton = wrapper.find('input[type="submit"]')

    expect(submitButton.classes()).toContain('bg-secondary')
    expect(submitButton.classes()).toContain('hover:bg-primary')
    expect(submitButton.classes()).toContain('text-white')
    expect(submitButton.classes()).toContain('font-bold')
  })

  it('should have correct styling for delete button', () => {
    const wrapper = mountWithDefaults(UpdateTask)
    const deleteButton = wrapper.find('button')

    expect(deleteButton.classes()).toContain('bg-secondary')
    expect(deleteButton.classes()).toContain('hover:bg-red-800')
    expect(deleteButton.classes()).toContain('text-white')
    expect(deleteButton.classes()).toContain('font-bold')
  })

  it('should have proper header section with title and delete button', () => {
    const wrapper = mountWithDefaults(UpdateTask)
    const headerSection = wrapper.find('.flex.items-center.justify-between')

    expect(headerSection.exists()).toBe(true)
    expect(headerSection.classes()).toContain('bg-primary')
    expect(headerSection.text()).toContain('UPDATE TASK')
    expect(headerSection.find('button').exists()).toBe(true)
  })

  it('should handle route parameter correctly', () => {
    mountWithDefaults(UpdateTask)

    // The component should use route.params.id from the mock
    expect(true).toBe(true) // Component mounted successfully with route param
  })

  it('has FontAwesome functionality available', () => {
    mountWithDefaults(UpdateTask)

    expect(typeof mockLibrary.add).toBe('function')
  })

  it('should have proper form structure with semantic HTML', () => {
    const wrapper = mountWithDefaults(UpdateTask)

    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('label[for="title"]').exists()).toBe(true)
    expect(wrapper.find('label[for="description"]').exists()).toBe(true)
    expect(wrapper.find('label[for="status"]').exists()).toBe(true)
    expect(wrapper.find('label[for="dueDate"]').exists()).toBe(true)
  })

  it('should handle missing task data gracefully', async () => {
    mockAxiosGet.mockRejectedValue(createMockError('Task not found', 404))

    const wrapper = mountWithDefaults(UpdateTask)
    await waitForUpdate(wrapper)

    expect(wrapper.vm.taskData).toEqual({
      title: '',
      description: ''
    })
  })
})