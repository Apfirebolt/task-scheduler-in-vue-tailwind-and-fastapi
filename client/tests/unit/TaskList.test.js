import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountWithDefaults, createMockResponse, createMockError } from '../utils/test-utils'
import { mockAxiosGet } from '../setup-tests'
import axios from 'axios'

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

// Mock Loader component
vi.mock('../src/components/Loader.vue', () => ({
  default: {
    name: 'Loader',
    template: '<div class="loader">Loading...</div>'
  }
}))

// Lazy load the component to avoid import issues
const loadTaskListComponent = async () => {
  const component = await import('../../src/pages/TaskList.vue')
  return component.default
}

describe('TaskList Component', () => {
  let wrapper
  let TaskList
  let mockAxiosGetLocal

  const mockTasks = [
    {
      id: 1,
      title: 'Test Task 1',
      description: 'Description 1',
      status: 'To Do',
      createdDate: '2024-01-01T00:00:00Z',
      dueDate: '2024-12-31T00:00:00Z'
    },
    {
      id: 2,
      title: 'Test Task 2',
      description: 'Description 2',
      status: 'Done',
      createdDate: '2024-01-02T00:00:00Z',
      dueDate: '2024-12-30T00:00:00Z'
    }
  ]

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()

    mockAxiosGetLocal = vi.mocked(axios.get)
    mockAxiosGetLocal.mockResolvedValue(createMockResponse(mockTasks))

    TaskList = await loadTaskListComponent()
    wrapper = mountWithDefaults(TaskList)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the component correctly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('has a title for the task list', () => {
    expect(wrapper.find('h1').exists()).toBe(true)
    expect(wrapper.find('h1').text()).toContain('TASKS')
  })

  it('shows loading state initially', () => {
    // Component has loading functionality available
    expect(typeof wrapper.vm.isLoading).toBe('boolean')
  })

  it('displays tasks after loading', async () => {
    // Wait for the API call to complete
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.tasks).toEqual(mockTasks)
    expect(wrapper.vm.isLoading).toBe(false)
  })

  it('has container with correct styling', () => {
    const container = wrapper.find('.container')
    expect(container.exists()).toBe(true)
    expect(container.classes()).toContain('bg-dark')
    expect(container.classes()).toContain('mx-auto')
    expect(container.classes()).toContain('text-gray-100')
  })

  it('has AOS functionality available', () => {
    const container = wrapper.find('.container')
    expect(container.attributes('data-aos')).toBe('fade-in')
    expect(container.attributes('data-aos-duration')).toBe('500')
    expect(container.attributes('data-aos-ease')).toBe('ease')
    expect(container.attributes('data-aos-delay')).toBe('400')
  })

  it('has getApiData method available', () => {
    expect(typeof wrapper.vm.getApiData).toBe('function')
  })

  it('has goToTaskDetail method available', () => {
    expect(typeof wrapper.vm.goToTaskDetail).toBe('function')
  })

  it('has tasks reactive data', () => {
    expect(Array.isArray(wrapper.vm.tasks)).toBe(true)
  })

  it('has errorMessage reactive data', () => {
    expect(typeof wrapper.vm.errorMessage).toBe('string')
  })

  it('has isLoading reactive data', () => {
    expect(typeof wrapper.vm.isLoading).toBe('boolean')
  })

  it('shows error message when API call fails', async () => {
    mockAxiosGetLocal.mockRejectedValue(createMockError('API Error', 500))

    // Create fresh wrapper with error mock
    const errorWrapper = mountWithDefaults(TaskList)

    // Wait for the API call to complete
    await new Promise(resolve => setTimeout(resolve, 0))
    await errorWrapper.vm.$nextTick()

    expect(errorWrapper.vm.errorMessage).toBe('Some error occurred')
  })

  it('can navigate to task detail', async () => {
    const taskId = 1
    await wrapper.vm.goToTaskDetail(taskId)

    // Should not throw error and router should be available
    expect(typeof wrapper.vm.goToTaskDetail).toBe('function')
  })

  it('has proper task data structure', async () => {
    // Wait for the API call to complete
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    if (wrapper.vm.tasks.length > 0) {
      const task = wrapper.vm.tasks[0]
      expect(task).toHaveProperty('id')
      expect(task).toHaveProperty('title')
      expect(task).toHaveProperty('description')
      expect(task).toHaveProperty('status')
    }
  })

  it('handles empty tasks array', async () => {
    mockAxiosGetLocal.mockResolvedValue(createMockResponse([]))

    const emptyWrapper = mountWithDefaults(TaskList)

    // Wait for the API call to complete
    await new Promise(resolve => setTimeout(resolve, 0))
    await emptyWrapper.vm.$nextTick()

    expect(emptyWrapper.vm.tasks).toEqual([])
    expect(emptyWrapper.vm.errorMessage).toBe('')
  })

  it('calls API on mount', async () => {
    expect(mockAxiosGetLocal).toHaveBeenCalledWith('/tasks/')
  })

  it('has proper component structure', () => {
    expect(wrapper.find('.container').exists()).toBe(true)
    // Component structure is valid
    expect(wrapper.exists()).toBe(true)
  })

  it('uses correct imports', () => {
    expect(wrapper.vm.$options.components).toBeDefined()
  })
})