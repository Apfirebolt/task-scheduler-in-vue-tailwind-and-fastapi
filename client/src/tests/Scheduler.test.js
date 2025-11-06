import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import dayjs from 'dayjs'
import Scheduler from '../pages/Scheduler.vue'
import Loader from '../components/Loader.vue'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

// Mock AOS
vi.mock('aos', () => ({
    default: {
        init: vi.fn()
    }
}))

describe('Scheduler.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders loader when isLoading is true', () => {
        const wrapper = mount(Scheduler)
        wrapper.vm.isLoading = true
        expect(wrapper.findComponent(Loader).exists()).toBe(true)
    })

    it('renders calendar when not loading', async () => {
        mockedAxios.get.mockResolvedValue({ data: [] })
        const wrapper = mount(Scheduler)
        await wrapper.vm.$nextTick()
        
        expect(wrapper.find('.min-h-screen').exists()).toBe(true)
        expect(wrapper.text()).toContain('Task Scheduler')
    })

    it('displays error message when errorMessage is set', async () => {
        const wrapper = mount(Scheduler)
        wrapper.vm.errorMessage = 'Test error message'
        await wrapper.vm.$nextTick()
        
        expect(wrapper.find('.bg-red-50').exists()).toBe(true)
        expect(wrapper.text()).toContain('Test error message')
    })

    it('navigates to next month when next button is clicked', async () => {
        mockedAxios.get.mockResolvedValue({ data: [] })
        const wrapper = mount(Scheduler)
        const currentMonth = wrapper.vm.startDate
        
        await wrapper.find('button:last-child').trigger('click')
        
        expect(wrapper.vm.startDate.isAfter(currentMonth)).toBe(true)
    })

    it('navigates to previous month when previous button is clicked', async () => {
        mockedAxios.get.mockResolvedValue({ data: [] })
        const wrapper = mount(Scheduler)
        const currentMonth = wrapper.vm.startDate
        
        await wrapper.find('button:first-child').trigger('click')
        
        expect(wrapper.vm.startDate.isBefore(currentMonth)).toBe(true)
    })

    it('displays current month and year correctly', async () => {
        const wrapper = mount(Scheduler)
        const expectedText = dayjs().format('MMMM YYYY')
        
        expect(wrapper.vm.currentMonthAndYear).toBe(expectedText)
    })

    it('fetches tasks from API on mount', async () => {
        const mockTasks = [
            { id: 1, title: 'Test Task', description: 'Test Description', dueDate: dayjs().format() }
        ]
        mockedAxios.get.mockResolvedValue({ data: mockTasks })
        
        mount(Scheduler)
        
        expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8000/tasks')
    })

    it('handles API error correctly', async () => {
        mockedAxios.get.mockRejectedValue(new Error('API Error'))
        const wrapper = mount(Scheduler)
        
        await wrapper.vm.$nextTick()
        
        expect(wrapper.vm.errorMessage).toBe('Some error occurred')
    })

    it('updates task data correctly', async () => {
        const mockTasks = [
            { 
                id: 1, 
                title: 'Test Task', 
                description: 'Test Description', 
                dueDate: dayjs().format('YYYY-MM-DD')
            }
        ]
        mockedAxios.get.mockResolvedValue({ data: mockTasks })
        const wrapper = mount(Scheduler)
        
        wrapper.vm.tasks = mockTasks
        wrapper.vm.updateTaskData(dayjs())
        
        const dayWithTask = wrapper.vm.monthDays.find(day => day.tasks.length > 0)
        expect(dayWithTask).toBeDefined()
        expect(dayWithTask.tasks[0].title).toBe('Test Task')
    })

    it('displays "No tasks scheduled" when day has no tasks', async () => {
        mockedAxios.get.mockResolvedValue({ data: [] })
        const wrapper = mount(Scheduler)
        await wrapper.vm.$nextTick()
        
        expect(wrapper.text()).toContain('No tasks scheduled')
    })

    it('renders correct number of days for current month', async () => {
        mockedAxios.get.mockResolvedValue({ data: [] })
        const wrapper = mount(Scheduler)
        await wrapper.vm.$nextTick()
        
        const expectedDays = dayjs().daysInMonth()
        expect(wrapper.vm.monthDays).toHaveLength(expectedDays)
    })

    it('displays task details correctly', async () => {
        const mockTasks = [
            { 
                id: 1, 
                title: 'Important Task', 
                description: 'Task description here', 
                dueDate: dayjs().format('YYYY-MM-DD')
            }
        ]
        mockedAxios.get.mockResolvedValue({ data: mockTasks })
        const wrapper = mount(Scheduler)
        
        wrapper.vm.tasks = mockTasks
        wrapper.vm.updateTaskData(dayjs())
        await wrapper.vm.$nextTick()
        
        expect(wrapper.text()).toContain('Important Task')
        expect(wrapper.text()).toContain('Task description here')
    })

    it('applies correct CSS classes for task styling', async () => {
        const mockTasks = [
            { 
                id: 1, 
                title: 'Test Task', 
                description: 'Test Description', 
                dueDate: dayjs().format('YYYY-MM-DD')
            }
        ]
        mockedAxios.get.mockResolvedValue({ data: mockTasks })
        const wrapper = mount(Scheduler)
        
        wrapper.vm.tasks = mockTasks
        wrapper.vm.updateTaskData(dayjs())
        await wrapper.vm.$nextTick()
        
        expect(wrapper.find('.bg-gradient-to-r.from-blue-50.to-indigo-50').exists()).toBe(true)
    })
})
