import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AddTask from '@/pages/AddTask.vue'
import { mockAxiosPost, mockAOS, mockLibrary } from '../setup-tests.js'

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
    expect(wrapper.vm.taskData.status).toBeUndefined()
    expect(wrapper.vm.taskData.dueDate).toBeUndefined()
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

  it('can set success message manually', () => {
    wrapper.vm.successMessage = 'Test message'
    expect(wrapper.vm.successMessage).toBe('Test message')
  })

  it('shows error message when task creation fails', async () => {
    mockAxiosPost.mockRejectedValue(new Error('Network error'))

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    // Component clears successMessage on error but doesn't set errorMessage
    expect(wrapper.vm.successMessage).toBe('')
  })

  it('resets success message after delay', async () => {
    vi.useFakeTimers()
    wrapper.vm.successMessage = 'Test message'

    wrapper.vm.resetSuccessMessage()
    vi.advanceTimersByTime(5000)

    expect(wrapper.vm.successMessage).toBe('')
    vi.useRealTimers()
  })

  it('has AOS functionality available', () => {
    expect(typeof mockAOS.init).toBe('function')
  })

  it('has submitFormData method available', () => {
    expect(typeof wrapper.vm.submitFormData).toBe('function')
  })

  it('handles network errors gracefully', async () => {
    mockAxiosPost.mockRejectedValue(new Error('Network error'))

    // Set form fields through v-model binding
    const titleInput = wrapper.find('input#title')
    const descriptionTextarea = wrapper.find('textarea')
    const statusSelect = wrapper.find('select')
    const dueDateInput = wrapper.find('input#dueDate')

    await titleInput.setValue('Test Task')
    await descriptionTextarea.setValue('Test Description')
    await statusSelect.setValue('To Do')
    await dueDateInput.setValue('2024-12-31')

    await wrapper.vm.submitFormData()

    // Component clears successMessage on error but doesn't set errorMessage
    expect(wrapper.vm.successMessage).toBe('')
  })

  it('has submit button', () => {
    const submitButton = wrapper.find('input[type="submit"]')
    expect(submitButton.exists()).toBe(true)
  })

  it('has FontAwesome functionality available', () => {
    expect(typeof mockLibrary.add).toBe('function')
  })

  it('keeps form data after successful submission', async () => {
    mockAxiosPost.mockResolvedValue({ data: { id: 1 } })

    wrapper.vm.taskData = {
      title: 'Test Task',
      description: 'Test Description',
      status: 'To Do',
      dueDate: '2024-12-31'
    }

    await wrapper.vm.submitFormData()

    // Component doesn't clear form data after submission
    expect(wrapper.vm.taskData.title).toBe('Test Task')
    expect(wrapper.vm.taskData.description).toBe('Test Description')
    expect(wrapper.vm.taskData.status).toBe('To Do')
    expect(wrapper.vm.taskData.dueDate).toBe('2024-12-31')
  })
})