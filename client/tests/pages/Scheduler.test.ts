import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mountWithDefaults, waitForUpdate, createMockResponse, createMockError } from '../utils/test-utils'
import { createMockTask, createMockTasks } from '../utils/factories'
import axios from 'axios'
import dayjs from 'dayjs'

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

// Mock dayjs - we'll use real dayjs but control the date
vi.mock('dayjs', async () => {
  const actualDayjs = await vi.importActual('dayjs')
  return {
    default: actualDayjs.default
  }
})

// Lazy load the component to avoid import issues
const loadSchedulerComponent = async () => {
  const component = await import('../../src/pages/Scheduler.vue')
  return component.default
}

describe('Scheduler Component', () => {
  let Scheduler
  let mockAxiosGet

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()

    mockAxiosGet = vi.mocked(axios.get)
    Scheduler = await loadSchedulerComponent()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should mount successfully', () => {
    const wrapper = mountWithDefaults(Scheduler)
    expect(wrapper.exists()).toBe(true)
  })

  it('should initialize AOS on mount', () => {
    const AOS = require('aos').default
    mountWithDefaults(Scheduler)

    expect(AOS.init).toHaveBeenCalledTimes(1)
  })

  it('should display scheduler title', () => {
    const wrapper = mountWithDefaults(Scheduler)
    expect(wrapper.text()).toContain('SCHEDULER')
  })

  it('should show loader initially when loading tasks', () => {
    const wrapper = mountWithDefaults(Scheduler)
    const loader = wrapper.findComponent({ name: 'Loader' })

    expect(loader.exists()).toBe(true)
  })

  it('should hide loader when tasks are loaded', async () => {
    const mockTasks = createMockTasks(3)
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(Scheduler)
    await waitForUpdate(wrapper)

    const loader = wrapper.findComponent({ name: 'Loader' })
    expect(loader.exists()).toBe(false)
  })

  it('should fetch tasks on component mount', async () => {
    const mockTasks = createMockTasks(5)
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(Scheduler)
    await waitForUpdate(wrapper)

    expect(mockAxiosGet).toHaveBeenCalledWith('/tasks/')
    expect(wrapper.vm.tasks).toEqual(mockTasks)
  })

  it('should display current month and year', () => {
    const wrapper = mountWithDefaults(Scheduler)
    const currentMonth = dayjs().format('MMMM')
    const currentYear = dayjs().format('YYYY')

    expect(wrapper.text()).toContain(`${currentMonth} ${currentYear}`)
  })

  it('should display navigation buttons', () => {
    const wrapper = mountWithDefaults(Scheduler)
    const previousButton = wrapper.find('button')
    const nextButton = wrapper.findAll('button')[1]

    expect(previousButton.exists()).toBe(true)
    expect(nextButton.exists()).toBe(true)
    expect(previousButton.text()).toContain('Previous Month')
    expect(nextButton.text()).toContain('Next Month')
  })

  it('should generate correct number of days for current month', async () => {
    const mockTasks = []
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(Scheduler)
    await waitForUpdate(wrapper)

    const daysInMonth = dayjs().daysInMonth()
    const dayCards = wrapper.findAll('.shadow-lg.rounded-md')

    expect(dayCards.length).toBe(daysInMonth)
  })

  it('should navigate to next month when next button is clicked', async () => {
    const mockTasks = []
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(Scheduler)
    await waitForUpdate(wrapper)

    const currentMonth = wrapper.vm.currentMonthAndYear
    const nextButton = wrapper.findAll('button')[1]

    await nextButton.trigger('click')

    const nextMonth = dayjs().add(1, 'month').format('MMMM YYYY')
    expect(wrapper.vm.currentMonthAndYear).toBe(nextMonth)
    expect(wrapper.vm.currentMonthAndYear).not.toBe(currentMonth)
  })

  it('should navigate to previous month when previous button is clicked', async () => {
    const mockTasks = []
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(Scheduler)
    await waitForUpdate(wrapper)

    const currentMonth = wrapper.vm.currentMonthAndYear
    const previousButton = wrapper.find('button')

    await previousButton.trigger('click')

    const previousMonth = dayjs().add(-1, 'month').format('MMMM YYYY')
    expect(wrapper.vm.currentMonthAndYear).toBe(previousMonth)
    expect(wrapper.vm.currentMonthAndYear).not.toBe(currentMonth)
  })

  it('should display tasks on their due dates', async () => {
    const today = dayjs()
    const tomorrow = today.add(1, 'day')
    const mockTasks = [
      createMockTask({
        title: 'Today Task',
        description: 'Task for today',
        dueDate: today.format('YYYY-MM-DD')
      }),
      createMockTask({
        title: 'Tomorrow Task',
        description: 'Task for tomorrow',
        dueDate: tomorrow.format('YYYY-MM-DD')
      })
    ]
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(Scheduler)
    await waitForUpdate(wrapper)

    expect(wrapper.text()).toContain('Today Task')
    expect(wrapper.text()).toContain('Task for today')
    expect(wrapper.text()).toContain('Tomorrow Task')
    expect(wrapper.text()).toContain('Task for tomorrow')
  })

  it('should group tasks by date correctly', async () => {
    const today = dayjs()
    const mockTasks = [
      createMockTask({
        title: 'Task 1',
        dueDate: today.format('YYYY-MM-DD')
      }),
      createMockTask({
        title: 'Task 2',
        dueDate: today.format('YYYY-MM-DD')
      })
    ]
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(Scheduler)
    await waitForUpdate(wrapper)

    // Should find both tasks in the monthDays array
    const todayFormatted = today.format('MMMM D, YYYY')
    const todayEntry = wrapper.vm.monthDays.find(day => day.date === todayFormatted)

    expect(todayEntry).toBeDefined()
    expect(todayEntry.tasks.length).toBe(2)
    expect(todayEntry.tasks[0].title).toBe('Task 1')
    expect(todayEntry.tasks[1].title).toBe('Task 2')
  })

  it('should handle API error and show error message', async () => {
    mockAxiosGet.mockRejectedValue(createMockError('Network Error', 500))

    const wrapper = mountWithDefaults(Scheduler)
    await waitForUpdate(wrapper)

    expect(wrapper.vm.errorMessage).toBe('Some error occurred')

    const errorDiv = wrapper.find('.bg-tertiary.text-bold')
    expect(errorDiv.exists()).toBe(true)
    expect(errorDiv.text()).toContain('Some error occurred')
  })

  it('should hide loader after error', async () => {
    mockAxiosGet.mockRejectedValue(createMockError('Error', 500))

    const wrapper = mountWithDefaults(Scheduler)
    await waitForUpdate(wrapper)

    const loader = wrapper.findComponent({ name: 'Loader' })
    expect(loader.exists()).toBe(false)
  })

  it('should display dates in correct format', async () => {
    const mockTasks = []
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(Scheduler)
    await waitForUpdate(wrapper)

    const firstDay = wrapper.vm.monthDays[0]
    expect(firstDay.date).toMatch(/^[A-Z][a-z]+ \d{1,2}, \d{4}$/)
  })

  it('should update task data when month changes', async () => {
    const mockTasks = [
      createMockTask({
        title: 'Test Task',
        dueDate: dayjs().add(1, 'month').format('YYYY-MM-DD')
      })
    ]
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(Scheduler)
    await waitForUpdate(wrapper)

    const nextButton = wrapper.findAll('button')[1]
    await nextButton.trigger('click')

    // Should regenerate monthDays for the new month
    expect(wrapper.vm.monthDays.length).toBeGreaterThan(0)
  })

  it('should have correct styling for day cards', async () => {
    const mockTasks = []
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(Scheduler)
    await waitForUpdate(wrapper)

    const dayCard = wrapper.find('.shadow-lg.rounded-md')
    expect(dayCard.classes()).toContain('shadow-lg')
    expect(dayCard.classes()).toContain('rounded-md')
    expect(dayCard.classes()).toContain('px-4')
    expect(dayCard.classes()).toContain('py-2')
    expect(dayCard.classes()).toContain('bg-primary')
    expect(dayCard.classes()).toContain('text-light')
    expect(dayCard.classes()).toContain('text-semibold')
    expect(dayCard.classes()).toContain('text-lg')
  })

  it('should have correct styling for task cards within days', async () => {
    const today = dayjs()
    const mockTasks = [createMockTask({
      title: 'Test Task',
      dueDate: today.format('YYYY-MM-DD')
    })]
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(Scheduler)
    await waitForUpdate(wrapper)

    const taskCard = wrapper.find('.max-w-sm.rounded.overflow-hidden')
    expect(taskCard.classes()).toContain('max-w-sm')
    expect(taskCard.classes()).toContain('rounded')
    expect(taskCard.classes()).toContain('overflow-hidden')
    expect(taskCard.classes()).toContain('shadow-lg')
    expect(taskCard.classes()).toContain('bg-gray-800')
    expect(taskCard.classes()).toContain('my-2')
  })

  it('should display task title and description', async () => {
    const today = dayjs()
    const mockTasks = [createMockTask({
      title: 'Important Task',
      description: 'This is important',
      dueDate: today.format('YYYY-MM-DD')
    })]
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(Scheduler)
    await waitForUpdate(wrapper)

    expect(wrapper.text()).toContain('Important Task')
    expect(wrapper.text()).toContain('This is important')
  })

  it('should have AOS attributes on main container', () => {
    const wrapper = mountWithDefaults(Scheduler)
    const mainContainer = wrapper.find('.container.bg-light')

    expect(mainContainer.attributes('data-aos')).toBe('zoom-in')
  })

  it('should apply background image styling', () => {
    const wrapper = mountWithDefaults(Scheduler)
    const container = wrapper.find('.container.bg-light')

    expect(container.classes()).toContain('bg-light')
    expect(container.attributes('style')).toContain('background-image')
  })

  it('should handle empty task list', async () => {
    const mockTasks = []
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(Scheduler)
    await waitForUpdate(wrapper)

    const taskCards = wrapper.findAll('.max-w-sm.rounded.overflow-hidden')
    expect(taskCards.length).toBe(0)
  })

  it('should use computed property for current month and year', () => {
    const wrapper = mountWithDefaults(Scheduler)
    const expectedMonth = dayjs().format('MMMM YYYY')

    expect(wrapper.vm.currentMonthAndYear).toBe(expectedMonth)
  })

  it('should regenerate days when updating task data', async () => {
    const mockTasks = []
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(Scheduler)
    await waitForUpdate(wrapper)

    const initialDaysCount = wrapper.vm.monthDays.length

    // Navigate to next month
    const nextButton = wrapper.findAll('button')[1]
    await nextButton.trigger('click')

    // Should still have the correct number of days for the new month
    const nextMonth = dayjs().add(1, 'month')
    const expectedDays = nextMonth.daysInMonth()
    expect(wrapper.vm.monthDays.length).toBe(expectedDays)
    expect(wrapper.vm.monthDays.length).not.toBe(initialDaysCount)
  })

  it('should handle tasks without due dates gracefully', async () => {
    const mockTasks = [
      createMockTask({ dueDate: null }),
      createMockTask({ dueDate: undefined })
    ]
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(Scheduler)
    await waitForUpdate(wrapper)

    // Should not crash and should still display calendar
    expect(wrapper.find('.shadow-lg.rounded-md').exists()).toBe(true)
  })

  it('should have responsive grid layout', async () => {
    const mockTasks = []
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(Scheduler)
    await waitForUpdate(wrapper)

    const gridContainer = wrapper.find('.grid.sm\\:grid-cols-2')
    expect(gridContainer.exists()).toBe(true)
  })

  it('should style navigation buttons correctly', () => {
    const wrapper = mountWithDefaults(Scheduler)
    const buttons = wrapper.findAll('button')

    buttons.forEach(button => {
      expect(button.classes()).toContain('bg-secondary')
      expect(button.classes()).toContain('hover:bg-gray-900')
      expect(button.classes()).toContain('text-white')
      expect(button.classes()).toContain('font-bold')
      expect(button.classes()).toContain('py-2')
      expect(button.classes()).toContain('px-4')
      expect(button.classes()).toContain('rounded')
    })
  })

  it('should display month title in correct color and size', () => {
    const wrapper = mountWithDefaults(Scheduler)
    const monthTitle = wrapper.find('.font-bold.text-2xl')

    expect(monthTitle.exists()).toBe(true)
    expect(monthTitle.classes()).toContain('font-bold')
    expect(monthTitle.classes()).toContain('text-2xl')
    expect(monthTitle.classes()).toContain('text-red-400')
  })
})