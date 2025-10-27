import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountWithDefaults } from '../utils/test-utils'

// Lazy load the component to avoid import issues
const loadHomeComponent = async () => {
  const component = await import('../../src/pages/Home.vue')
  return component.default
}

describe('Home Component', () => {
  let Home

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()

    Home = await loadHomeComponent()
  })

  it('should mount successfully', () => {
    const wrapper = mountWithDefaults(Home)
    expect(wrapper.exists()).toBe(true)
  })

  it('should render welcome message', () => {
    const wrapper = mountWithDefaults(Home)
    const welcomeText = wrapper.find('p.text-3xl')

    expect(welcomeText.exists()).toBe(true)
    expect(welcomeText.text()).toContain('Welcome!')
  })

  it('should render subtitle text', () => {
    const wrapper = mountWithDefaults(Home)
    const subtitleText = wrapper.find('p.text-gray-500')

    expect(subtitleText.exists()).toBe(true)
    expect(subtitleText.text()).toContain('Vue and Tailwind CSS in action')
  })

  it('should have correct container styling', () => {
    const wrapper = mountWithDefaults(Home)
    const container = wrapper.find('.container')

    expect(container.classes()).toContain('container')
    expect(container.classes()).toContain('mx-auto')
    expect(container.classes()).toContain('bg-gray-200')
    expect(container.classes()).toContain('rounded-xl')
    expect(container.classes()).toContain('shadow')
    expect(container.classes()).toContain('border')
    expect(container.classes()).toContain('p-8')
    expect(container.classes()).toContain('m-10')
  })

  it('should apply correct typography styling to welcome message', () => {
    const wrapper = mountWithDefaults(Home)
    const welcomeText = wrapper.find('p.text-3xl')

    expect(welcomeText.classes()).toContain('text-3xl')
    expect(welcomeText.classes()).toContain('text-gray-700')
    expect(welcomeText.classes()).toContain('font-bold')
    expect(welcomeText.classes()).toContain('mb-5')
  })

  it('should apply correct typography styling to subtitle', () => {
    const wrapper = mountWithDefaults(Home)
    const subtitleText = wrapper.find('p.text-gray-500')

    expect(subtitleText.classes()).toContain('text-gray-500')
    expect(subtitleText.classes()).toContain('text-lg')
  })

  it('should have proper text color contrast', () => {
    const wrapper = mountWithDefaults(Home)
    const welcomeText = wrapper.find('p.text-3xl')
    const subtitleText = wrapper.find('p.text-gray-500')

    expect(welcomeText.classes()).toContain('text-gray-700')
    expect(subtitleText.classes()).toContain('text-gray-500')
  })

  it('should have semantic HTML structure', () => {
    const wrapper = mountWithDefaults(Home)

    // Should use paragraph tags for text content
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(2)
  })

  it('should be responsive with mx-auto class', () => {
    const wrapper = mountWithDefaults(Home)
    const container = wrapper.find('.container')

    expect(container.classes()).toContain('mx-auto')
  })

  it('should have visual styling with shadow and border', () => {
    const wrapper = mountWithDefaults(Home)
    const container = wrapper.find('.container')

    expect(container.classes()).toContain('shadow')
    expect(container.classes()).toContain('border')
  })

  it('should have rounded corners', () => {
    const wrapper = mountWithDefaults(Home)
    const container = wrapper.find('.container')

    expect(container.classes()).toContain('rounded-xl')
  })

  it('should have proper spacing with padding and margin', () => {
    const wrapper = mountWithDefaults(Home)
    const container = wrapper.find('.container')
    const welcomeText = wrapper.find('p.text-3xl')

    expect(container.classes()).toContain('p-8')
    expect(container.classes()).toContain('m-10')
    expect(welcomeText.classes()).toContain('mb-5')
  })

  it('should have background color', () => {
    const wrapper = mountWithDefaults(Home)
    const container = wrapper.find('.container')

    expect(container.classes()).toContain('bg-gray-200')
  })

  it('should contain meaningful content', () => {
    const wrapper = mountWithDefaults(Home)

    expect(wrapper.text()).toContain('Welcome!')
    expect(wrapper.text()).toContain('Vue and Tailwind CSS')
  })

  it('should have appropriate font sizes for hierarchy', () => {
    const wrapper = mountWithDefaults(Home)
    const welcomeText = wrapper.find('p.text-3xl')
    const subtitleText = wrapper.find('p.text-gray-500')

    expect(welcomeText.classes()).toContain('text-3xl')
    expect(subtitleText.classes()).toContain('text-lg')
  })

  it('should be a simple presentational component', () => {
    const wrapper = mountWithDefaults(Home)

    // Component should have no complex logic or external dependencies
    expect(wrapper.vm).toBeDefined()
    expect(wrapper.text()).toContain('Welcome!')
    expect(wrapper.text()).toContain('Vue and Tailwind CSS')
  })

  it('should have no props or external dependencies', () => {
    // Component should work without any props
    const wrapper = mountWithDefaults(Home)
    expect(wrapper.exists()).toBe(true)
  })

  it('should have accessible text content', () => {
    const wrapper = mountWithDefaults(Home)

    // Should have clear, readable text content
    expect(wrapper.text().length).toBeGreaterThan(0)
    expect(wrapper.text()).toContain('Welcome!')
  })

  it('should use modern CSS features (rounded-xl)', () => {
    const wrapper = mountWithDefaults(Home)
    const container = wrapper.find('.container')

    expect(container.classes()).toContain('rounded-xl')
  })

  it('should have consistent design language', () => {
    const wrapper = mountWithDefaults(Home)

    // Should use consistent gray color scheme
    const container = wrapper.find('.container')
    const welcomeText = wrapper.find('p.text-3xl')
    const subtitleText = wrapper.find('p.text-gray-500')

    expect(container.classes()).toContain('bg-gray-200')
    expect(welcomeText.classes()).toContain('text-gray-700')
    expect(subtitleText.classes()).toContain('text-gray-500')
  })
})