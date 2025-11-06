import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AddTask from '../pages/AddTask.vue'
import axios from 'axios'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

// Mock AOS
vi.mock('aos', () => ({
    default: {
        init: vi.fn()
    }
}))

describe('AddTask', () => {
    let wrapper

    beforeEach(() => {
        vi.clearAllMocks()
        wrapper = mount(AddTask)
    })

    it('renders the component correctly', () => {
        expect(wrapper.find('h1').text()).toBe('Create New Task')
        expect(wrapper.find('input[id="title"]').exists()).toBe(true)
        expect(wrapper.find('textarea[id="description"]').exists()).toBe(true)
        expect(wrapper.find('select').exists()).toBe(true)
        expect(wrapper.find('input[type="date"]').exists()).toBe(true)
    })

    it('updates task data when form inputs change', async () => {
        await wrapper.find('input[id="title"]').setValue('Test Task')
        await wrapper.find('textarea[id="description"]').setValue('Test Description')
        await wrapper.find('select').setValue('To Do')
        await wrapper.find('input[type="date"]').setValue('2024-12-31')

        expect(wrapper.vm.taskData.title).toBe('Test Task')
        expect(wrapper.vm.taskData.description).toBe('Test Description')
        expect(wrapper.vm.taskData.status).toBe('To Do')
        expect(wrapper.vm.taskData.dueDate).toBe('2024-12-31')
    })

    it('renders all status choices in select dropdown', () => {
        const options = wrapper.find('select').findAll('option')
        const statusChoices = ["To Do", "In Progress", "In Review", "Done"]
        
        expect(options).toHaveLength(statusChoices.length + 1) // +1 for disabled option
        statusChoices.forEach((status, index) => {
            expect(options[index + 1].text()).toBe(status)
        })
    })

    it('submits form data successfully', async () => {
        mockedAxios.post.mockResolvedValue({ data: { id: 1 } })

        await wrapper.find('input[id="title"]').setValue('Test Task')
        await wrapper.find('textarea[id="description"]').setValue('Test Description')
        await wrapper.find('form').trigger('submit.prevent')

        expect(mockedAxios.post).toHaveBeenCalledWith(
            'http://localhost:8000/tasks',
            {
                title: 'Test Task',
                description: 'Test Description',
                status: undefined,
                dueDate: undefined
            }
        )
    })

    it('displays success message after successful form submission', async () => {
        mockedAxios.post.mockResolvedValue({ data: { id: 1 } })

        await wrapper.find('form').trigger('submit.prevent')
        await wrapper.vm.$nextTick()

        expect(wrapper.vm.successMessage).toBe('Task created successfully!')
        expect(wrapper.find('.bg-green-100').exists()).toBe(true)
    })

    it('handles form submission error', async () => {
        mockedAxios.post.mockRejectedValue(new Error('Network Error'))

        await wrapper.find('form').trigger('submit.prevent')
        await wrapper.vm.$nextTick()

        expect(wrapper.vm.successMessage).toBe('')
        expect(wrapper.find('.bg-green-100').exists()).toBe(false)
    })

    it('clears success message after 5 seconds', async () => {
        vi.useFakeTimers()
        mockedAxios.post.mockResolvedValue({ data: { id: 1 } })

        await wrapper.find('form').trigger('submit.prevent')
        await wrapper.vm.$nextTick()

        expect(wrapper.vm.successMessage).toBe('Task created successfully!')

        vi.advanceTimersByTime(5000)
        await wrapper.vm.$nextTick()

        expect(wrapper.vm.successMessage).toBe('')
        vi.useRealTimers()
    })

    it('has correct form input attributes', () => {
        const titleInput = wrapper.find('input[id="title"]')
        const descriptionTextarea = wrapper.find('textarea[id="description"]')
        const dueDateInput = wrapper.find('input[type="date"]')

        expect(titleInput.attributes('placeholder')).toBe('Enter task title...')
        expect(descriptionTextarea.attributes('placeholder')).toBe('Describe your task...')
        expect(descriptionTextarea.attributes('rows')).toBe('4')
        expect(dueDateInput.attributes('type')).toBe('date')
    })

    it('renders FontAwesome icons', () => {
        const icons = wrapper.findAllComponents({ name: 'FontAwesomeIcon' })
        expect(icons).toHaveLength(2)
        expect(icons[0].props('icon')).toBe('tasks')
        expect(icons[1].props('icon')).toBe('pen-alt')
    })

    it('initializes with empty task data', () => {
        expect(wrapper.vm.taskData).toEqual({
            title: '',
            description: '',
            status: undefined,
            dueDate: undefined
        })
    })
})
