import { mount, VueWrapper } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createApp } from 'vue'

/**
 * Custom test utilities for Vue components
 */

/**
 * Mount a component with default test configuration
 */
export function mountWithDefaults(component: any, options: any = {}) {
  return mount(component, {
    global: {
      stubs: {
        'font-awesome-icon': {
          name: 'FontAwesomeIcon',
          template: '<i class="fa-icon"><slot /></i>',
          props: ['icon', 'class', 'style'],
        },
        'router-link': {
          name: 'RouterLink',
          template: '<a :href="to"><slot /></a>',
          props: ['to', 'replace', 'exact', 'active-class', 'exact-active-class'],
        },
        'router-view': {
          name: 'RouterView',
          template: '<div><slot /></div>',
        },
      }
    },
    ...options
  })
}

/**
 * Wait for next tick and DOM update
 */
export async function waitForUpdate(wrapper: VueWrapper) {
  await wrapper.vm.$nextTick()
  await new Promise(resolve => setTimeout(resolve, 0))
}

/**
 * Create mock response for axios
 */
export function createMockResponse(data: any, status = 200) {
  return Promise.resolve({
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {}
  })
}

/**
 * Create mock error for axios
 */
export function createMockError(message: string, status = 500) {
  const error = new Error(message) as any
  error.response = {
    status,
    statusText: 'Internal Server Error',
    data: { message }
  }
  return Promise.reject(error)
}

/**
 * Mock console methods to reduce noise in tests
 */
export function mockConsole() {
  const originalConsole = { ...console }

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    console.warn = originalConsole.warn
    console.error = originalConsole.error
  })
}

/**
 * Test component with props
 */
export function testComponentWithProps(componentName: string, component: any, defaultPropValues: any = {}) {
  describe(`${componentName} Component`, () => {
    it('should mount successfully', () => {
      const wrapper = mountWithDefaults(component)
      expect(wrapper.exists()).toBe(true)
    })

    it('should render with default props', () => {
      const wrapper = mountWithDefaults(component, {
        props: defaultPropValues
      })
      expect(wrapper.exists()).toBe(true)
    })
  })
}

/**
 * Test component with slots
 */
export function testComponentWithSlots(componentName: string, component: any, slotContent = 'Default Slot Content') {
  describe(`${componentName} Slots`, () => {
    it('should render default slot', () => {
      const wrapper = mountWithDefaults(component, {
        slots: {
          default: slotContent
        }
      })
      expect(wrapper.text()).toContain(slotContent)
    })
  })
}

/**
 * Test component events
 */
export function testComponentEvents(componentName: string, component: any, events: string[]) {
  describe(`${componentName} Events`, () => {
    events.forEach(eventName => {
      it(`should emit ${eventName} event`, async () => {
        const wrapper = mountWithDefaults(component)
        await wrapper.trigger(eventName)
        expect(wrapper.emitted(eventName)).toBeTruthy()
      })
    })
  })
}

/**
 * Common test patterns for Vue components
 */
export const commonTests = {
  testComponentWithProps,
  testComponentWithSlots,
  testComponentEvents,
  mountWithDefaults,
  waitForUpdate,
  createMockResponse,
  createMockError,
  mockConsole
}