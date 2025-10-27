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

// Mock Loader component
vi.mock('../../src/components/Loader.vue', () => ({
  default: {
    name: 'Loader',
    template: '<div>Loading...</div>'
  }
}))

// Lazy load the component to avoid import issues
const loadSchedulerHeaderComponent = async () => {
  const component = await import('../../src/components/SchedulerHeader.vue')
  return component.default
}

describe('SchedulerHeader Component', () => {
  let SchedulerHeader
  let mockAxiosGet

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()

    mockAxiosGet = vi.mocked(axios.get)
    SchedulerHeader = await loadSchedulerHeaderComponent()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should mount successfully', () => {
    const wrapper = mountWithDefaults(SchedulerHeader)
    expect(wrapper.exists()).toBe(true)
  })

  it('should initialize AOS on mount', () => {
    const AOS = require('aos').default
    mountWithDefaults(SchedulerHeader)

    expect(AOS.init).toHaveBeenCalledTimes(1)
  })

  it('should display current month and year', () => {
    const wrapper = mountWithDefaults(SchedulerHeader)
    const currentMonth = dayjs().format('MMMM')
    const currentYear = dayjs().format('YYYY')

    expect(wrapper.text()).toContain(`${currentMonth} ${currentYear}`)
  })

  it('should render navigation buttons', () => {
    const wrapper = mountWithDefaults(SchedulerHeader)
    const buttons = wrapper.findAll('button')

    expect(buttons.length).toBe(2)
    expect(buttons[0].text()).toContain('Previous Month')
    expect(buttons[1].text()).toContain('Next Month')
  })

  it('should fetch tasks on component mount', async () => {
    const mockTasks = createMockTasks(5)
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(SchedulerHeader)
    await waitForUpdate(wrapper)

    expect(mockAxiosGet).toHaveBeenCalledWith('/tasks/')
    expect(wrapper.vm.tasks).toEqual(mockTasks)
  })

  it('should navigate to next month when next button is clicked', async () => {
    const wrapper = mountWithDefaults(SchedulerHeader)

    const currentMonth = wrapper.vm.currentMonthAndYear
    const nextButton = wrapper.findAll('button')[1]

    await nextButton.trigger('click')

    const nextMonth = dayjs().add(1, 'month').format('MMMM YYYY')
    expect(wrapper.vm.currentMonthAndYear).toBe(nextMonth)
    expect(wrapper.vm.currentMonthAndYear).not.toBe(currentMonth)
  })

  it('should navigate to previous month when previous button is clicked', async () => {
    const wrapper = mountWithDefaults(SchedulerHeader)

    const currentMonth = wrapper.vm.currentMonthAndYear
    const previousButton = wrapper.find('button')

    await previousButton.trigger('click')

    const previousMonth = dayjs().add(-1, 'month').format('MMMM YYYY')
    expect(wrapper.vm.currentMonthAndYear).toBe(previousMonth)
    expect(wrapper.vm.currentMonthAndYear).not.toBe(currentMonth)
  })

  it('should handle API error gracefully', async () => {
    mockAxiosGet.mockRejectedValue(createMockError('Network Error', 500))
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const wrapper = mountWithDefaults(SchedulerHeader)
    await waitForUpdate(wrapper)

    expect(wrapper.vm.errorMessage).toBe('Some error occurred')
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('should have correct layout structure', () => {
    const wrapper = mountWithDefaults(SchedulerHeader)
    const flexContainer = wrapper.find('.flex.items-center.justify-between')

    expect(flexContainer.exists()).toBe(true)
    expect(flexContainer.classes()).toContain('flex')
    expect(flexContainer.classes()).toContain('items-center')
    expect(flexContainer.classes()).toContain('justify-between')
  })

  it('should have correct button styling', () => {
    const wrapper = mountWithDefaults(SchedulerHeader)
    const buttons = wrapper.findAll('button')

    buttons.forEach(button => {
      expect(button.classes()).toContain('bg-gray-500')
      expect(button.classes()).toContain('hover:bg-gray-900')
      expect(button.classes()).toContain('text-white')
      expect(button.classes()).toContain('font-bold')
      expect(button.classes()).toContain('py-2')
      expect(button.classes()).toContain('px-4')
      expect(button.classes()).toContain('rounded')
    })
  })

  it('should have correct month title styling', () => {
    const wrapper = mountWithDefaults(SchedulerHeader)
    const monthTitle = wrapper.find('p.font-bold.text-2xl')

    expect(monthTitle.exists()).toBe(true)
    expect(monthTitle.classes()).toContain('font-bold')
    expect(monthTitle.classes()).toContain('text-2xl')
    expect(monthTitle.classes()).toContain('text-red-400')
  })

  it('should use computed property for current month and year', () => {
    const wrapper = mountWithDefaults(SchedulerHeader)
    const expectedMonth = dayjs().format('MMMM YYYY')

    expect(wrapper.vm.currentMonthAndYear).toBe(expectedMonth)
  })

  it('should generate month days correctly on mount', () => {
    const wrapper = mountWithDefaults(SchedulerHeader)
    const daysInMonth = dayjs().daysInMonth()

    expect(wrapper.vm.monthDays.length).toBe(daysInMonth)
  })

  it('should have proper month day structure', () => {
    const wrapper = mountWithDefaults(SchedulerHeader)
    const firstDay = wrapper.vm.monthDays[0]

    expect(firstDay).toHaveProperty('date')
    expect(firstDay).toHaveProperty('tasks')
    expect(Array.isArray(firstDay.tasks)).toBe(true)
    expect(firstDay.date).toMatch(/^[A-Z][a-z]+ \d{1,2}, \d{4}$/)
  })

  it('should format dates correctly', () => {
    const wrapper = mountWithDefaults(SchedulerHeader)
    const monthDays = wrapper.vm.monthDays

    monthDays.forEach(day => {
      expect(day.date).toMatch(/^[A-Z][a-z]+ \d{1,2}, \d{4}$/)
    })
  })

  it('should update month days when month changes', async () => {
    const wrapper = mountWithDefaults(SchedulerHeader)
    const initialDaysCount = wrapper.vm.monthDays.length

    // Navigate to next month
    const nextButton = wrapper.findAll('button')[1]
    await nextButton.trigger('click')

    const nextMonth = dayjs().add(1, 'month')
    const expectedDays = nextMonth.daysInMonth()

    expect(wrapper.vm.monthDays.length).toBe(expectedDays)
    expect(wrapper.vm.monthDays.length).not.toBe(initialDaysCount)
  })

  it('should handle tasks without crashing', async () => {
    const mockTasks = [
      createMockTask({
        title: 'Test Task',
        dueDate: dayjs().format('YYYY-MM-DD')
      })
    ]
    mockAxiosGet.mockResolvedValue(createMockResponse(mockTasks))

    const wrapper = mountWithDefaults(SchedulerHeader)
    await waitForUpdate(wrapper)

    expect(wrapper.vm.tasks.length).toBeGreaterThan(0)
    expect(wrapper.vm.monthDays.length).toBeGreaterThan(0)
  })

  it('should have proper reactivity for startDate', async () => {
    const wrapper = mountWithDefaults(SchedulerHeader)
    const initialDate = wrapper.vm.startDate

    // Change the month
    const nextButton = wrapper.findAll('button')[1]
    await nextButton.trigger('click')

    expect(wrapper.vm.startDate).not.toBe(initialDate)
  })

  it('should handle empty tasks array', async () => {
    mockAxiosGet.mockResolvedValue(createMockResponse([]))

    const wrapper = mountWithDefaults(SchedulerHeader)
    await waitForUpdate(wrapper)

    expect(wrapper.vm.tasks).toEqual([])
    expect(wrapper.vm.monthDays.length).toBe(dayjs().daysInMonth())
  })

  it('should have proper default state values', () => {
    const wrapper = mountWithDefaults(SchedulerHeader)

    expect(wrapper.vm.monthDays).toBeDefined()
    expect(wrapper.vm.tasks).toBeDefined()
    expect(wrapper.vm.startDate).toBeDefined()
    expect(wrapper.vm.errorMessage).toBe('')
    expect(wrapper.vm.isLoading).toBe(false)
    expect(wrapper.vm.showInfo).toBe(false)
  })

  it('should handle loading state correctly', async () => {
    let resolvePromise: any
    const mockPromise = new Promise(resolve => {
      resolvePromise = resolve
    })
    mockAxiosGet.mockReturnValue(mockPromise)

    const wrapper = mountWithDefaults(SchedulerHeader)

    expect(wrapper.vm.isLoading).toBe(true)

    // Resolve the promise
    resolvePromise(createMockResponse([]))
    await waitForUpdate(wrapper)

    expect(wrapper.vm.isLoading).toBe(false)
  })

  it('should have semantic HTML structure', () => {
    const wrapper = mountWithDefaults(SchedulerHeader)

    // Should have proper button elements
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBe(2)

    // Should have proper paragraph for month display
    const monthDisplay = wrapper.find('p.font-bold.text-2xl')
    expect(monthDisplay.exists()).toBe(true)
  })

  it('should have accessible button text', () => {
    const wrapper = mountWithDefaults(SchedulerHeader)
    const buttons = wrapper.findAll('button')

    expect(buttons[0].text()).toContain('Previous Month')
    expect(buttons[1].text()).toContain('Next Month')
  })

  it('should have consistent spacing and layout', () => {
    const wrapper = mountWithDefaults(SchedulerHeader)
    const flexContainer = wrapper.find('.flex.items-center.justify-between')

    // Should have proper flex layout
    expect(flexContainer.exists()).toBe(true)

    // Should have three main elements: previous button, month display, next button
    const children = flexContainer.findAll('button, p')
    expect(children.length).toBe(3)
  })

  it('should be responsive with flexbox', () => {
    const wrapper = mountWithDefaults(SchedulerHeader)
    const flexContainer = wrapper.find('.flex.items-center.justify-between')

    expect(flexContainer.classes()).toContain('flex')
    expect(flexContainer.classes()).toContain('items-center')
    expect(flexContainer.classes()).toContain('justify-between')
  })

  it('should handle date formatting edge cases', () => {
    const wrapper = mountWithDefaults(SchedulerHeader)
    const monthDays = wrapper.vm.monthDays

    // Check that all dates are properly formatted
    monthDays.forEach((day, index) => {
      expect(day.date).toMatch(/^[A-Z][a-z]+ \d{1,2}, \d{4}$/)
      expect(typeof day.date).toBe('string')
      expect(day.date.length).toBeGreaterThan(0)
    })
  })

  it('should initialize with current month correctly', () => {
    const wrapper = mountWithDefaults(SchedulerHeader)
    const now = dayjs()
    const expectedStartOfMonth = now.startOf('month')

    expect(wrapper.vm.startDate.isSame(expectedStartOfMonth, 'day')).toBe(true)
  })
})