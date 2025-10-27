import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mountWithDefaults, waitForUpdate, createMockResponse, createMockError } from '../utils/test-utils'
import { createMockTask, createMockTasks, testData } from '../utils/factories'
import { mockAxiosGet, mockAOS } from '../setup-tests'

// Mock Vue Router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

// Lazy load the component to avoid import issues
const loadTaskListComponent = async () => {
  const component = await import('../../src/pages/TaskList.vue')
  return component.default
}

describe('TaskList Component', () => {
  let TaskList

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()

    TaskList = await loadTaskListComponent()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should mount successfully', () => {
    const wrapper = mountWithDefaults(TaskList)
    expect(wrapper.exists()).toBe(true)
  })

  it('has AOS functionality available', () => {
    mountWithDefaults(TaskList)

    expect(typeof mockAOS.init).toBe('function')
  })

  it('should show loader initially when loading tasks', () => {
    const wrapper = mountWithDefaults(TaskList)
    const loader = wrapper.findComponent({ name: 'Loader' })

    expect(loader.exists()).toBe(true)
  })

  it('should hide loader when tasks are loaded', async () => {
    const mockTasks = createMockTasks(3)
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(TaskList)
    await waitForUpdate(wrapper)

    const loader = wrapper.findComponent({ name: 'Loader' })
    expect(loader.exists()).toBe(false)
  })

  it('should fetch tasks on component mount', async () => {
    const mockTasks = createMockTasks(5)
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(TaskList)
    await waitForUpdate(wrapper)

    expect(mockAxiosGet).toHaveBeenCalledWith('/tasks/')
    expect(wrapper.vm.tasks).toEqual(mockTasks)
  })

  it('should display tasks when they are loaded', async () => {
    const mockTasks = createMockTasks(3)
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(TaskList)
    await waitForUpdate(wrapper)

    const taskCards = wrapper.findAll('.shadow-lg.text-center')
    expect(taskCards.length).toBe(3)
  })

  it('should display task information correctly', async () => {
    const mockTasks = [
      createMockTask({ title: 'Test Task 1', description: 'Description 1', dueDate: '2024-12-25' }),
      createMockTask({ title: 'Test Task 2', description: 'Description 2', dueDate: '2024-12-26' })
    ]
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(TaskList)
    await waitForUpdate(wrapper)

    expect(wrapper.text()).toContain('Test Task 1')
    expect(wrapper.text()).toContain('Description 1')
    expect(wrapper.text()).toContain('Due on 2024-12-25')
    expect(wrapper.text()).toContain('Test Task 2')
    expect(wrapper.text()).toContain('Description 2')
    expect(wrapper.text()).toContain('Due on 2024-12-26')
  })

  it('should display page title', () => {
    const wrapper = mountWithDefaults(TaskList)
    expect(wrapper.text()).toContain('TASKS')
  })

  it('should navigate to task detail when task is clicked', async () => {
    const mockTasks = createMockTasks(1)
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(TaskList)
    await waitForUpdate(wrapper)

    const taskCard = wrapper.find('.shadow-lg.text-center')
    await taskCard.trigger('click')

    expect(mockPush).toHaveBeenCalledWith({
      name: 'UpdateTask',
      params: {
        id: 1
      }
    })
  })

  it('should handle API error and show error message', async () => {
    mockAxiosGet.mockRejectedValue(createMockError('Network Error', 500))

    const wrapper = mountWithDefaults(TaskList)
    await waitForUpdate(wrapper)

    expect(wrapper.vm.errorMessage).toBe('Some error occurred')
    expect(wrapper.vm.isLoading).toBe(false)

    const errorDiv = wrapper.find('.bg-success.text-light')
    expect(errorDiv.exists()).toBe(true)
    expect(errorDiv.text()).toContain('Some error occurred')
  })

  it('should hide loader after error', async () => {
    mockAxiosGet.mockRejectedValue(createMockError('Error', 500))

    const wrapper = mountWithDefaults(TaskList)
    await waitForUpdate(wrapper)

    const loader = wrapper.findComponent({ name: 'Loader' })
    expect(loader.exists()).toBe(false)
  })

  it('should clear error message on successful data load', async () => {
    // First load with error
    mockAxiosGet.mockRejectedValueOnce(createMockError('Error', 500))
    const wrapper = mountWithDefaults(TaskList)
    await waitForUpdate(wrapper)

    expect(wrapper.vm.errorMessage).toBe('Some error occurred')

    // Second load successful
    const mockTasks = createMockTasks(2)
    mockAxiosGet.mockResolvedValueOnce(createMockResponse(mockTasks))
    await wrapper.vm.getApiData()

    expect(wrapper.vm.errorMessage).toBe('')
  })

  it('should display tasks in grid layout', async () => {
    const mockTasks = createMockTasks(4)
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(TaskList)
    await waitForUpdate(wrapper)

    const gridContainer = wrapper.find('.grid.sm\\:grid-cols-2.md\\:grid-cols-4.lg\\:grid-cols-6')
    expect(gridContainer.exists()).toBe(true)
  })

  it('should apply correct styling to task cards', async () => {
    const mockTasks = createMockTasks(1)
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(TaskList)
    await waitForUpdate(wrapper)

    const taskCard = wrapper.find('.shadow-lg.text-center')
    expect(taskCard.classes()).toContain('shadow-lg')
    expect(taskCard.classes()).toContain('text-center')
    expect(taskCard.classes()).toContain('rounded-md')
    expect(taskCard.classes()).toContain('px-4')
    expect(taskCard.classes()).toContain('py-2')
    expect(taskCard.classes()).toContain('bg-secondary')
    expect(taskCard.classes()).toContain('hover:cursor-pointer')
    expect(taskCard.classes()).toContain('text-light')
    expect(taskCard.classes()).toContain('text-semibold')
    expect(taskCard.classes()).toContain('text-lg')
  })

  it('should handle empty task list', async () => {
    mockAxiosGet.mockResolvedValue(createMockResponse([]))

    const wrapper = mountWithDefaults(TaskList)
    await waitForUpdate(wrapper)

    const taskCards = wrapper.findAll('.shadow-lg.text-center')
    expect(taskCards.length).toBe(0)
    expect(wrapper.vm.tasks).toEqual([])
  })

  it('should use correct API endpoint', async () => {
    mockAxiosGet.mockResolvedValue(createMockResponse([]))

    const wrapper = mountWithDefaults(TaskList)
    await waitForUpdate(wrapper)

    expect(mockAxiosGet).toHaveBeenCalledWith('/tasks/')
  })

  it('should have AOS attributes on main container', () => {
    const wrapper = mountWithDefaults(TaskList)
    const mainContainer = wrapper.find('.container.bg-dark')

    expect(mainContainer.attributes('data-aos')).toBe('fade-in')
    expect(mainContainer.attributes('data-aos-duration')).toBe('500')
    expect(mainContainer.attributes('data-aos-ease')).toBe('ease')
    expect(mainContainer.attributes('data-aos-delay')).toBe('400')
  })

  it('should apply correct background and text colors', () => {
    const wrapper = mountWithDefaults(TaskList)
    const container = wrapper.find('.container.bg-dark')

    expect(container.classes()).toContain('bg-dark')
    expect(container.classes()).toContain('text-gray-100')
  })

  it('should make task cards clickable', async () => {
    const mockTasks = createMockTasks(1)
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(TaskList)
    await waitForUpdate(wrapper)

    const taskCard = wrapper.find('.shadow-lg.text-center')
    expect(taskCard.classes()).toContain('hover:cursor-pointer')
  })

  it('should render task title in bold', async () => {
    const mockTasks = [createMockTask({ title: 'Bold Task Title' })]
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(TaskList)
    await waitForUpdate(wrapper)

    const titleElement = wrapper.find('.my-2.font-bold')
    expect(titleElement.exists()).toBe(true)
    expect(titleElement.text()).toBe('Bold Task Title')
  })

  it('should show loading state during API call', async () => {
    let resolvePromise: any
    const mockPromise = new Promise(resolve => {
      resolvePromise = resolve
    })
    mockAxiosGet.mockReturnValue(mockPromise)

    const wrapper = mountWithDefaults(TaskList)

    // Should show loader initially
    expect(wrapper.vm.isLoading).toBe(true)
    const loader = wrapper.findComponent({ name: 'Loader' })
    expect(loader.exists()).toBe(true)

    // Resolve the promise
    resolvePromise(createMockResponse([]))
    await waitForUpdate(wrapper)

    expect(wrapper.vm.isLoading).toBe(false)
    const loaderAfter = wrapper.findComponent({ name: 'Loader' })
    expect(loaderAfter.exists()).toBe(false)
  })

  it('should handle navigation with correct task ID', async () => {
    const mockTasks = createMockTasks(3)
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(TaskList)
    await waitForUpdate(wrapper)

    // Click on second task (ID 2)
    const taskCards = wrapper.findAll('.shadow-lg.text-center')
    await taskCards[1].trigger('click')

    expect(mockPush).toHaveBeenCalledWith({
      name: 'UpdateTask',
      params: {
        id: 2
      }
    })
  })
})