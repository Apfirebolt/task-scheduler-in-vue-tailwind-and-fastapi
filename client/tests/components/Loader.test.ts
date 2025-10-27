import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountWithDefaults, waitForUpdate } from '../utils/test-utils'

// Lazy load the component to avoid import issues
const loadLoaderComponent = async () => {
  const component = await import('../../src/components/Loader.vue')
  return component.default
}

describe('Loader Component', () => {
  let Loader

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()

    Loader = await loadLoaderComponent()
  })

  it('should mount successfully', () => {
    const wrapper = mountWithDefaults(Loader)
    expect(wrapper.exists()).toBe(true)
  })

  it('should render a container div with correct positioning classes', () => {
    const wrapper = mountWithDefaults(Loader)
    const container = wrapper.find('div')

    expect(container.exists()).toBe(true)
    expect(container.classes()).toContain('absolute')
    expect(container.classes()).toContain('top-1/2')
    expect(container.classes()).toContain('left-1/2')
    expect(container.classes()).toContain('transform')
    expect(container.classes()).toContain('-translate-x-1/2')
    expect(container.classes()).toContain('-translate-y-1/2')
  })

  it('should display loading text', () => {
    const wrapper = mountWithDefaults(Loader)
    expect(wrapper.text()).toContain('Loading ...')
  })

  it('should render a paragraph element for the loading text', () => {
    const wrapper = mountWithDefaults(Loader)
    const paragraph = wrapper.find('p')

    expect(paragraph.exists()).toBe(true)
    expect(paragraph.text()).toBe('Loading ...')
  })

  it('should apply correct text styling classes', () => {
    const wrapper = mountWithDefaults(Loader)
    const paragraph = wrapper.find('p')

    expect(paragraph.classes()).toContain('text-4xl')
    expect(paragraph.classes()).toContain('text-bold')
  })

  it('should center the loading indicator both horizontally and vertically', () => {
    const wrapper = mountWithDefaults(Loader)
    const container = wrapper.find('div')

    // Check positioning classes for centering
    expect(container.classes()).toContain('absolute')
    expect(container.classes()).toContain('top-1/2')
    expect(container.classes()).toContain('left-1/2')
    expect(container.classes()).toContain('-translate-x-1/2')
    expect(container.classes()).toContain('-translate-y-1/2')
  })

  it('should have accessible text content', () => {
    const wrapper = mountWithDefaults(Loader)
    const paragraph = wrapper.find('p')

    // The loading text should be clear and descriptive
    expect(paragraph.text()).toBe('Loading ...')
    expect(paragraph.text().length).toBeGreaterThan(0)
  })

  it('should use CSS transform for positioning', () => {
    const wrapper = mountWithDefaults(Loader)
    const container = wrapper.find('div')

    expect(container.classes()).toContain('transform')
    expect(container.classes()).toContain('-translate-x-1/2')
    expect(container.classes()).toContain('-translate-y-1/2')
  })

  it('should have no props or data requirements', () => {
    // Component should work without any props
    const wrapper = mountWithDefaults(Loader)
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading ...')
  })

  it('should be a presentational component with no logic', () => {
    const wrapper = mountWithDefaults(Loader)

    // Component should just display static content
    expect(wrapper.vm).toBeDefined()
    expect(wrapper.text()).toBe('Loading ...')
  })

  it('should maintain consistent text size and weight', () => {
    const wrapper = mountWithDefaults(Loader)
    const paragraph = wrapper.find('p')

    expect(paragraph.classes()).toContain('text-4xl')
    expect(paragraph.classes()).toContain('text-bold')
  })

  it('should use absolute positioning for overlay behavior', () => {
    const wrapper = mountWithDefaults(Loader)
    const container = wrapper.find('div')

    expect(container.classes()).toContain('absolute')
    // This allows the loader to overlay other content
  })

  it('should have simple DOM structure', () => {
    const wrapper = mountWithDefaults(Loader)

    // Should have a simple structure: div > p
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.find('div > p').exists()).toBe(true)
    expect(wrapper.element.children.length).toBe(1)
  })
})