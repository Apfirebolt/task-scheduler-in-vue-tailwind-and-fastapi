import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AddTask from '@/pages/AddTask.vue'

// Mock AOS
vi.mock('aos', () => ({
  default: {
    init: vi.fn()
  }
}))

// Mock axios
const mockAxios = {
  post: vi.fn()
}
vi.mock('axios', () => ({
  default: mockAxios
}))

describe('AddTask Component', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
    wrapper = mount(AddTask)
  })

  it('renders the component correctly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('has form fields for task creation', () => {
    expect(wrapper.find('input[type="text"]').exists()).toBe(true) // title field
    expect(wrapper.find('input[type="date"]').exists()).toBe(true) // dueDate field
    expect(wrapper.find('textarea').exists()).toBe(true) // description field
    expect(wrapper.find('select').exists()).toBe(true) // status field
  })

  it('initializes with empty task data', () => {
    expect(wrapper.vm.taskData.title).toBe('')
    expect(wrapper.vm.taskData.description).toBe('')
  })

  it('has status choices dropdown', () => {
    const statusSelect = wrapper.find('select')
    const statusOptions = statusSelect.findAll('option')

    expect(statusOptions.length).toBe(4)
    expect(statusOptions[0].text()).toBe('To Do')
    expect(statusOptions[1].text()).toBe('In Progress')
    expect(statusOptions[2].text()).toBe('In Review')
    expect(statusOptions[3].text()).toBe('Done')
  })

  it('binds form fields to taskData correctly', async () => {
    const titleInput = wrapper.find('input[type="text"]')
    const descriptionTextarea = wrapper.find('textarea')
    const dueDateInput = wrapper.find('input[type="date"]')
    const statusSelect = wrapper.find('select')

    await titleInput.setValue('Test Task')
    await descriptionTextarea.setValue('Test Description')
    await dueDateInput.setValue('2024-12-31')
    await statusSelect.setValue('In Progress')

    expect(wrapper.vm.taskData.title).toBe('Test Task')
    expect(wrapper.vm.taskData.description).toBe('Test Description')
    expect(wrapper.vm.taskData.dueDate).toBe('2024-12-31')
    expect(wrapper.vm.taskData.status).toBe('In Progress')
  })

  it('shows success message after successful task creation', async () => {
    mockAxios.post.mockResolvedValue({ data: { id: 1 } })

    const titleInput = wrapper.find('input[type="text"]')
    await titleInput.setValue('Test Task')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    expect(wrapper.vm.successMessage).toBe('Task created successfully!')
  })

  it('shows error message when task creation fails', async () => {
    mockAxios.post.mockRejectedValue(new Error('Network error'))

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    expect(wrapper.vm.errorMessage).toBeTruthy()
  })

  it('resets success message after delay', async () => {
    vi.useFakeTimers()
    wrapper.vm.successMessage = 'Test message'

    wrapper.vm.resetSuccessMessage()
    vi.advanceTimersByTime(3000)

    expect(wrapper.vm.successMessage).toBe('')
    vi.useRealTimers()
  })

  it('initializes AOS on mount', () => {
    const AOS = require('aos')
    expect(AOS.default.init).toHaveBeenCalled()
  })

  it('handles form submission correctly', async () => {
    const mockResponseData = { id: 1, title: 'Test Task' }
    mockAxios.post.mockResolvedValue({ data: mockResponseData })

    wrapper.vm.taskData = {
      title: 'Test Task',
      description: 'Test Description',
      status: 'To Do',
      dueDate: '2024-12-31'
    }

    await wrapper.vm.submitFormData()

    expect(mockAxios.post).toHaveBeenCalledWith('/tasks/', wrapper.vm.taskData)
    expect(wrapper.vm.successMessage).toBe('Task created successfully!')
  })

  it('handles network errors gracefully', async () => {
    mockAxios.post.mockRejectedValue(new Error('Network error'))

    wrapper.vm.taskData = {
      title: 'Test Task',
      description: 'Test Description',
      status: 'To Do',
      dueDate: '2024-12-31'
    }

    await wrapper.vm.submitFormData()

    expect(wrapper.vm.errorMessage).toBeTruthy()
  })

  it('has submit button', () => {
    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.exists()).toBe(true)
  })

  it('clears form after successful submission', async () => {
    mockAxios.post.mockResolvedValue({ data: { id: 1 } })

    wrapper.vm.taskData = {
      title: 'Test Task',
      description: 'Test Description',
      status: 'To Do',
      dueDate: '2024-12-31'
    }

    await wrapper.vm.submitFormData()

    expect(wrapper.vm.taskData.title).toBe('')
    expect(wrapper.vm.taskData.description).toBe('')
    expect(wrapper.vm.taskData.status).toBe('')
    expect(wrapper.vm.taskData.dueDate).toBe('')
  })
})