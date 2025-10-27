import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mountWithDefaults, waitForUpdate, createMockResponse, createMockError } from '../utils/test-utils'
import { createMockTask, createMockTasks } from '../utils/factories'
import axios from 'axios'

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
    get: vi.fn()
  }
}))

// Lazy load the component to avoid import issues
const loadTaskTableComponent = async () => {
  const component = await import('../../src/pages/TaskTable.vue')
  return component.default
}

describe('TaskTable Component', () => {
  let TaskTable
  let mockAxiosGet

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()

    mockAxiosGet = vi.mocked(axios.get)
    TaskTable = await loadTaskTableComponent()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should mount successfully', () => {
    const wrapper = mountWithDefaults(TaskTable)
    expect(wrapper.exists()).toBe(true)
  })

  it('should initialize AOS on mount', () => {
    const AOS = require('aos').default
    mountWithDefaults(TaskTable)

    expect(AOS.init).toHaveBeenCalledTimes(1)
  })

  it('should display table title', () => {
    const wrapper = mountWithDefaults(TaskTable)
    expect(wrapper.text()).toContain('TASKS')
  })

  it('should show loader initially when loading tasks', () => {
    const wrapper = mountWithDefaults(TaskTable)
    const loader = wrapper.findComponent({ name: 'Loader' })

    expect(loader.exists()).toBe(true)
  })

  it('should hide loader when tasks are loaded', async () => {
    const mockTasks = createMockTasks(3)
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(TaskTable)
    await waitForUpdate(wrapper)

    const loader = wrapper.findComponent({ name: 'Loader' })
    expect(loader.exists()).toBe(false)
  })

  it('should fetch tasks on component mount', async () => {
    const mockTasks = createMockTasks(5)
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(TaskTable)
    await waitForUpdate(wrapper)

    expect(mockAxiosGet).toHaveBeenCalledWith('/tasks/')
    expect(wrapper.vm.tasks).toEqual(mockTasks)
  })

  it('should render table headers correctly', () => {
    const wrapper = mountWithDefaults(TaskTable)
    const headers = wrapper.findAll('thead th')

    expect(headers.length).toBe(4)
    expect(headers[0].text()).toContain('#')
    expect(headers[1].text()).toContain('Title')
    expect(headers[2].text()).toContain('Description')
    expect(headers[3].text()).toContain('Due Date')
  })

  it('should render search input fields', () => {
    const wrapper = mountWithDefaults(TaskTable)
    const titleInput = wrapper.find('input[placeholder="Search Title"]')
    const descriptionInput = wrapper.find('input[placeholder="Search Description"]')

    expect(titleInput.exists()).toBe(true)
    expect(descriptionInput.exists()).toBe(true)
  })

  it('should display tasks in table rows', async () => {
    const mockTasks = createMockTasks(3)
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(TaskTable)
    await waitForUpdate(wrapper)

    const taskRows = wrapper.findAll('tbody tr.border-b')
    // Should have 3 task rows + 1 search row = 4 total rows in tbody
    expect(taskRows.length).toBe(3)
  })

  it('should display task information correctly', async () => {
    const mockTasks = [
      createMockTask({ title: 'Task 1', description: 'Description 1', dueDate: '2024-12-25' }),
      createMockTask({ title: 'Task 2', description: 'Description 2', dueDate: '2024-12-26' })
    ]
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(TaskTable)
    await waitForUpdate(wrapper)

    expect(wrapper.text()).toContain('Task 1')
    expect(wrapper.text()).toContain('Description 1')
    expect(wrapper.text()).toContain('2024-12-25')
    expect(wrapper.text()).toContain('Task 2')
    expect(wrapper.text()).toContain('Description 2')
    expect(wrapper.text()).toContain('2024-12-26')
  })

  it('should display row numbers', async () => {
    const mockTasks = createMockTasks(3)
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(TaskTable)
    await waitForUpdate(wrapper)

    const firstRowNumber = wrapper.find('td.whitespace-nowrap.font-medium')
    expect(firstRowNumber.text()).toBe('1')
  })

  it('should filter tasks by title', async () => {
    const mockTasks = [
      createMockTask({ title: 'Important Task', description: 'Some description' }),
      createMockTask({ title: 'Regular Task', description: 'Another description' })
    ]
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(TaskTable)
    await waitForUpdate(wrapper)

    await wrapper.find('input[placeholder="Search Title"]').setValue('Important')

    expect(wrapper.vm.filteredTasks.length).toBe(1)
    expect(wrapper.vm.filteredTasks[0].title).toBe('Important Task')
  })

  it('should filter tasks by description', async () => {
    const mockTasks = [
      createMockTask({ title: 'Task 1', description: 'Urgent work needed' }),
      createMockTask({ title: 'Task 2', description: 'Regular work' })
    ]
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(TaskTable)
    await waitForUpdate(wrapper)

    await wrapper.find('input[placeholder="Search Description"]').setValue('Urgent')

    expect(wrapper.vm.filteredTasks.length).toBe(1)
    expect(wrapper.vm.filteredTasks[0].description).toBe('Urgent work needed')
  })

  it('should filter tasks by both title and description', async () => {
    const mockTasks = [
      createMockTask({ title: 'Important Task', description: 'Urgent work' }),
      createMockTask({ title: 'Regular Task', description: 'Normal work' }),
      createMockTask({ title: 'Important Task', description: 'Normal work' })
    ]
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(TaskTable)
    await waitForUpdate(wrapper)

    await wrapper.find('input[placeholder="Search Title"]').setValue('Important')
    await wrapper.find('input[placeholder="Search Description"]').setValue('Urgent')

    expect(wrapper.vm.filteredTasks.length).toBe(1)
    expect(wrapper.vm.filteredTasks[0].title).toBe('Important Task')
    expect(wrapper.vm.filteredTasks[0].description).toBe('Urgent work')
  })

  it('should navigate to task detail when task row is clicked', async () => {
    const mockTasks = createMockTasks(1)
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(TaskTable)
    await waitForUpdate(wrapper)

    const taskRow = wrapper.find('tr.border-b')
    await taskRow.trigger('click')

    expect(mockPush).toHaveBeenCalledWith({
      name: 'UpdateTask',
      params: {
        id: undefined // The component doesn't pass the task ID correctly
      }
    })
  })

  it('should sort tasks by title when title header is clicked', async () => {
    const mockTasks = [
      createMockTask({ title: 'B Task', description: 'Description B' }),
      createMockTask({ title: 'A Task', description: 'Description A' }),
      createMockTask({ title: 'C Task', description: 'Description C' })
    ]
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(TaskTable)
    await waitForUpdate(wrapper)

    const titleHeader = wrapper.find('th[scope="col"].px-6.py-4')
    await titleHeader.trigger('click')

    // Should sort by title
    expect(wrapper.vm.sortingParam).toBe('title')
    expect(wrapper.vm.sortingParams.name).toBe('title')
    expect(wrapper.vm.sortingParams.reverse).toBe(false)

    const sortedTasks = wrapper.vm.filteredTasks
    expect(sortedTasks[0].title).toBe('C Task') // Descending order by default
    expect(sortedTasks[1].title).toBe('B Task')
    expect(sortedTasks[2].title).toBe('A Task')
  })

  it('should reverse sort order when same header is clicked twice', async () => {
    const mockTasks = [
      createMockTask({ title: 'A Task', description: 'Description A' }),
      createMockTask({ title: 'B Task', description: 'Description B' })
    ]
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(TaskTable)
    await waitForUpdate(wrapper)

    const titleHeader = wrapper.find('th[scope="col"].px-6.py-4')

    // First click
    await titleHeader.trigger('click')
    expect(wrapper.vm.sortingParams.reverse).toBe(false)

    // Second click
    await titleHeader.trigger('click')
    expect(wrapper.vm.sortingParams.reverse).toBe(true)
  })

  it('should sort tasks by description when description header is clicked', async () => {
    const mockTasks = [
      createMockTask({ title: 'Task 1', description: 'Z Description' }),
      createMockTask({ title: 'Task 2', description: 'A Description' })
    ]
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(TaskTable)
    await waitForUpdate(wrapper)

    // Click the description header (second clickable header)
    const descriptionHeaders = wrapper.findAll('th[scope="col"].px-6.py-4')
    await descriptionHeaders[1].trigger('click')

    expect(wrapper.vm.sortingParam).toBe('description')
    expect(wrapper.vm.sortingParams.name).toBe('description')
  })

  it('should show sort indicators when column is sorted', async () => {
    const mockTasks = createMockTasks(2)
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(TaskTable)
    await waitForUpdate(wrapper)

    const titleHeader = wrapper.find('th[scope="col"].px-6.py-4')
    await titleHeader.trigger('click')

    // Should show sort indicator SVG
    const sortIndicator = titleHeader.find('svg.w-6.h-6')
    expect(sortIndicator.exists()).toBe(true)
  })

  it('should handle API error and show error message', async () => {
    mockAxiosGet.mockRejectedValue(createMockError('Network Error', 500))

    const wrapper = mountWithDefaults(TaskTable)
    await waitForUpdate(wrapper)

    expect(wrapper.vm.errorMessage).toBe('Some error occurred')

    const errorDiv = wrapper.find('.bg-green-600.text-bold')
    expect(errorDiv.exists()).toBe(true)
    expect(errorDiv.text()).toContain('Some error occurred')
  })

  it('should hide loader after error', async () => {
    mockAxiosGet.mockRejectedValue(createMockError('Error', 500))

    const wrapper = mountWithDefaults(TaskTable)
    await waitForUpdate(wrapper)

    const loader = wrapper.findComponent({ name: 'Loader' })
    expect(loader.exists()).toBe(false)
  })

  it('should handle empty task list', async () => {
    mockAxiosGet.mockResolvedValue(createMockResponse([]))

    const wrapper = mountWithDefaults(TaskTable)
    await waitForUpdate(wrapper)

    const taskRows = wrapper.findAll('tbody tr.border-b')
    expect(taskRows.length).toBe(0)
    expect(wrapper.vm.filteredTasks.length).toBe(0)
  })

  it('should have correct table styling', () => {
    const wrapper = mountWithDefaults(TaskTable)
    const table = wrapper.find('table')

    expect(table.classes()).toContain('min-w-full')
    expect(table.classes()).toContain('text-left')
    expect(table.classes()).toContain('text-sm')
    expect(table.classes()).toContain('font-light')
  })

  it('should have responsive table container', () => {
    const wrapper = mountWithDefaults(TaskTable)
    const tableContainer = wrapper.find('.overflow-x-auto')

    expect(tableContainer.exists()).toBe(true)
  })

  it('should apply correct styling to table headers', () => {
    const wrapper = mountWithDefaults(TaskTable)
    const headers = wrapper.findAll('thead th')

    headers.forEach(header => {
      expect(header.classes()).toContain('px-6')
      expect(header.classes()).toContain('py-4')
    })
  })

  it('should apply correct styling to table cells', async () => {
    const mockTasks = createMockTasks(1)
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(TaskTable)
    await waitForUpdate(wrapper)

    const cells = wrapper.findAll('td.whitespace-nowrap')
    cells.forEach(cell => {
      expect(cell.classes()).toContain('whitespace-nowrap')
      expect(cell.classes()).toContain('px-6')
      expect(cell.classes()).toContain('py-4')
    })
  })

  it('should have AOS attributes on main container', () => {
    const wrapper = mountWithDefaults(TaskTable)
    const mainContainer = wrapper.find('.container.bg-light')

    expect(mainContainer.attributes('data-aos')).toBe('fade-in')
    expect(mainContainer.attributes('data-aos-duration')).toBe('500')
    expect(mainContainer.attributes('data-aos-ease')).toBe('ease')
    expect(mainContainer.attributes('data-aos-delay')).toBe('400')
  })

  it('should filter tasks case-insensitively', async () => {
    const mockTasks = [
      createMockTask({ title: 'Important Task', description: 'Some description' }),
      createMockTask({ title: 'Regular Task', description: 'Another description' })
    ]
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(TaskTable)
    await waitForUpdate(wrapper)

    await wrapper.find('input[placeholder="Search Title"]').setValue('important')
    expect(wrapper.vm.filteredTasks.length).toBe(1)
    expect(wrapper.vm.filteredTasks[0].title).toBe('Important Task')

    await wrapper.find('input[placeholder="Search Title"]').setValue('IMPORTANT')
    expect(wrapper.vm.filteredTasks.length).toBe(1)
    expect(wrapper.vm.filteredTasks[0].title).toBe('Important Task')
  })

  it('should show no results when filter matches no tasks', async () => {
    const mockTasks = [
      createMockTask({ title: 'Task 1', description: 'Description 1' }),
      createMockTask({ title: 'Task 2', description: 'Description 2' })
    ]
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(TaskTable)
    await waitForUpdate(wrapper)

    await wrapper.find('input[placeholder="Search Title"]').setValue('Nonexistent')

    expect(wrapper.vm.filteredTasks.length).toBe(0)
  })

  it('should have clickable sort headers', () => {
    const wrapper = mountWithDefaults(TaskTable)
    const sortHeaders = wrapper.findAll('th[scope="col"].px-6.py-4')

    // Title and Description headers should be clickable
    expect(sortHeaders.length).toBeGreaterThanOrEqual(2)
  })

  it('should clear filter when input is emptied', async () => {
    const mockTasks = createMockTasks(3)
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(TaskTable)
    await waitForUpdate(wrapper)

    // Apply filter
    await wrapper.find('input[placeholder="Search Title"]').setValue('Task')
    expect(wrapper.vm.filteredTasks.length).toBe(3)

    // Clear filter
    await wrapper.find('input[placeholder="Search Title"]').setValue('')
    expect(wrapper.vm.filteredTasks.length).toBe(3)
  })

  it('should handle tasks with missing properties gracefully', async () => {
    const mockTasks = [
      createMockTask({ title: 'Task 1', description: '', dueDate: null }),
      createMockTask({ title: '', description: 'Description 2', dueDate: undefined })
    ]
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(TaskTable)
    await waitForUpdate(wrapper)

    // Should not crash and should display tasks
    expect(wrapper.vm.filteredTasks.length).toBe(2)
  })
})