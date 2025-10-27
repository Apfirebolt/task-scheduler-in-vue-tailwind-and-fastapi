/**
 * Factory functions for creating test data
 */

export interface Task {
  id: number
  title: string
  description: string
  completed: boolean
  due_date: string
  created_at: string
  updated_at: string
  priority: 'low' | 'medium' | 'high'
}

export interface User {
  id: number
  username: string
  email: string
  created_at: string
}

/**
 * Create a mock task with default or provided values
 */
export function createMockTask(overrides: Partial<Task> = {}): Task {
  const defaultTask: Task = {
    id: 1,
    title: 'Test Task',
    description: 'This is a test task description',
    completed: false,
    due_date: '2024-01-15T10:00:00Z',
    created_at: '2024-01-01T09:00:00Z',
    updated_at: '2024-01-01T09:00:00Z',
    priority: 'medium'
  }

  return { ...defaultTask, ...overrides }
}

/**
 * Create multiple mock tasks
 */
export function createMockTasks(count: number, overrides: Partial<Task> = {}): Task[] {
  return Array.from({ length: count }, (_, index) =>
    createMockTask({
      id: index + 1,
      title: `Test Task ${index + 1}`,
      ...overrides
    })
  )
}

/**
 * Create a mock user with default or provided values
 */
export function createMockUser(overrides: Partial<User> = {}): User {
  const defaultUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    created_at: '2024-01-01T09:00:00Z'
  }

  return { ...defaultUser, ...overrides }
}

/**
 * Create mock API response
 */
export function createMockApiResponse<T>(data: T, message = 'Success') {
  return {
    data,
    message,
    status: 'success'
  }
}

/**
 * Create mock paginated response
 */
export function createMockPaginatedResponse<T>(
  items: T[],
  page = 1,
  limit = 10,
  total: number | null = null
) {
  const actualTotal = total !== null ? total : items.length

  return {
    items,
    pagination: {
      page,
      limit,
      total: actualTotal,
      pages: Math.ceil(actualTotal / limit),
      hasNext: page * limit < actualTotal,
      hasPrev: page > 1
    }
  }
}

/**
 * Create mock error response
 */
export function createMockErrorResponse(message: string, status = 400) {
  return {
    error: true,
    message,
    status,
    timestamp: new Date().toISOString()
  }
}

/**
 * Task priorities for testing
 */
export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const

/**
 * Create tasks with different priorities
 */
export function createTasksWithDifferentPriorities(): Task[] {
  return TASK_PRIORITIES.map((priority, index) =>
    createMockTask({
      id: index + 1,
      title: `${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority Task`,
      priority
    })
  )
}

/**
 * Create completed and incomplete tasks
 */
export function createMixedCompletionTasks(): Task[] {
  return [
    createMockTask({ id: 1, title: 'Completed Task', completed: true }),
    createMockTask({ id: 2, title: 'Incomplete Task', completed: false }),
    createMockTask({ id: 3, title: 'Another Completed Task', completed: true }),
    createMockTask({ id: 4, title: 'Another Incomplete Task', completed: false })
  ]
}

/**
 * Common test data sets
 */
export const testData = {
  singleTask: createMockTask(),
  multipleTasks: createMockTasks(5),
  user: createMockUser(),
  tasksWithPriorities: createTasksWithDifferentPriorities(),
  mixedCompletionTasks: createMixedCompletionTasks(),
  paginatedTasks: createMockPaginatedResponse(createMockTasks(15), 1, 5, 15)
}