import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import {
  mountWithDefaults,
  createMockResponse,
  createMockError,
  testComponentWithProps
} from '../utils/test-utils'
import { createMockTask, createMockTasks, testData } from '../utils/factories'

// Simple test component for utilities verification
const TestComponent = {
  template: `
    <div class="test-component">
      <h1>{{ title }}</h1>
      <p v-if="showMessage">{{ message }}</p>
      <button @click="handleClick">Click me</button>
    </div>
  `,
  props: {
    title: {
      type: String,
      default: 'Test Title'
    },
    showMessage: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: 'Default message'
    }
  },
  emits: ['click'],
  methods: {
    handleClick() {
      this.$emit('click', 'button clicked')
    }
  }
}

describe('Test Utils Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should mount component with defaults using mountWithDefaults', () => {
    const wrapper = mountWithDefaults(TestComponent)
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.test-component').exists()).toBe(true)
    expect(wrapper.text()).toContain('Test Title')
  })

  it('should mount component with custom props', () => {
    const wrapper = mountWithDefaults(TestComponent, {
      props: {
        title: 'Custom Title',
        showMessage: true,
        message: 'Custom Message'
      }
    })
    expect(wrapper.text()).toContain('Custom Title')
    expect(wrapper.text()).toContain('Custom Message')
  })

  it('should create mock response correctly', () => {
    const mockData = { id: 1, title: 'Test Task' }
    const response = createMockResponse(mockData)

    return response.then((result) => {
      expect(result.data).toEqual(mockData)
      expect(result.status).toBe(200)
    })
  })

  it('should create mock error correctly', () => {
    const error = createMockError('Test error message', 400)

    return error.catch((result) => {
      expect(result.message).toBe('Test error message')
      expect(result.response.status).toBe(400)
    })
  })

  it('should test component with common test pattern', () => {
    testComponentWithProps('TestComponent', TestComponent, {
      title: 'Default Test Title'
    })
  })
})

describe('Factories Verification', () => {
  it('should create mock task with defaults', () => {
    const task = createMockTask()
    expect(task.id).toBe(1)
    expect(task.title).toBe('Test Task')
    expect(task.completed).toBe(false)
    expect(task.priority).toBe('medium')
  })

  it('should create mock task with overrides', () => {
    const task = createMockTask({
      title: 'Custom Task',
      priority: 'high' as const,
      completed: true
    })
    expect(task.title).toBe('Custom Task')
    expect(task.priority).toBe('high')
    expect(task.completed).toBe(true)
  })

  it('should create multiple mock tasks', () => {
    const tasks = createMockTasks(3)
    expect(tasks).toHaveLength(3)
    expect(tasks[0].id).toBe(1)
    expect(tasks[1].id).toBe(2)
    expect(tasks[2].id).toBe(3)
  })

  it('should provide common test data', () => {
    expect(testData.singleTask).toBeDefined()
    expect(testData.multipleTasks).toHaveLength(5)
    expect(testData.user).toBeDefined()
    expect(testData.tasksWithPriorities).toHaveLength(3)
    expect(testData.mixedCompletionTasks).toHaveLength(4)
    expect(testData.paginatedTasks.items).toHaveLength(15)
  })

  it('should create tasks with different priorities', () => {
    const { tasksWithPriorities } = testData
    const priorities = tasksWithPriorities.map(task => task.priority)
    expect(priorities).toContain('low')
    expect(priorities).toContain('medium')
    expect(priorities).toContain('high')
  })

  it('should create mixed completion tasks', () => {
    const { mixedCompletionTasks } = testData
    const completedCount = mixedCompletionTasks.filter(task => task.completed).length
    const incompleteCount = mixedCompletionTasks.filter(task => !task.completed).length

    expect(completedCount).toBe(2)
    expect(incompleteCount).toBe(2)
  })
})

describe('Component Event Testing', () => {
  it('should emit click event when button is clicked', async () => {
    const wrapper = mountWithDefaults(TestComponent)
    const button = wrapper.find('button')

    await button.trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')[0]).toEqual(['button clicked'])
  })
})