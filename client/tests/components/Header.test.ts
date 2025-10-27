import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountWithDefaults, waitForUpdate } from '../utils/test-utils'

// Mock Vue Router
vi.mock('vue-router', () => ({
  default: {
    resolve: vi.fn(() => ({ href: '/' })),
    push: vi.fn(),
    currentRoute: { value: { name: 'home' } }
  }
}))

// Lazy load the component to avoid import issues
const loadHeaderComponent = async () => {
  const component = await import('../../src/components/Header.vue')
  return component.default
}

describe('Header Component', () => {
  let Header

  beforeEach(async () => {
    // Reset modules before each test
    vi.clearAllMocks()
    vi.unstubAllGlobals()

    Header = await loadHeaderComponent()
  })

  it('should mount successfully', () => {
    const wrapper = mountWithDefaults(Header)
    expect(wrapper.exists()).toBe(true)
  })

  it('should render the application title', () => {
    const wrapper = mountWithDefaults(Header)
    expect(wrapper.text()).toContain('Task Scheduler')
  })

  it('should render desktop navigation links', () => {
    const wrapper = mountWithDefaults(Header)
    const desktopNav = wrapper.find('nav ul')

    expect(desktopNav.exists()).toBe(true)
    expect(wrapper.text()).toContain('Home')
    expect(wrapper.text()).toContain('Scheduler')
    expect(wrapper.text()).toContain('Add Task')
    expect(wrapper.text()).toContain('Tasks')
    expect(wrapper.text()).toContain('Task Table')
  })

  it('should render mobile menu toggle button', () => {
    const wrapper = mountWithDefaults(Header)
    const mobileToggleButton = wrapper.find('li.p-4.md\\:hidden')

    expect(mobileToggleButton.exists()).toBe(true)
    expect(mobileToggleButton.find('svg').exists()).toBe(true)
  })

  it('should not show sidebar initially', () => {
    const wrapper = mountWithDefaults(Header)
    const sidebar = wrapper.find('[aria-label="Sidebar"]')

    expect(sidebar.exists()).toBe(false)
  })

  it('should toggle sidebar when mobile menu button is clicked', async () => {
    const wrapper = mountWithDefaults(Header)
    const mobileToggleButton = wrapper.find('li.p-4.md\\:hidden')

    // Initially sidebar should not be visible
    expect(wrapper.find('[aria-label="Sidebar"]').exists()).toBe(false)

    // Click the toggle button
    await mobileToggleButton.trigger('click')

    // Sidebar should now be visible
    const sidebar = wrapper.find('[aria-label="Sidebar"]')
    expect(sidebar.exists()).toBe(true)
    expect(sidebar.isVisible()).toBe(true)
  })

  it('should hide sidebar when toggle button is clicked twice', async () => {
    const wrapper = mountWithDefaults(Header)
    const mobileToggleButton = wrapper.find('li.p-4.md\\:hidden')

    // Click to show sidebar
    await mobileToggleButton.trigger('click')
    expect(wrapper.find('[aria-label="Sidebar"]').exists()).toBe(true)

    // Click again to hide sidebar
    await mobileToggleButton.trigger('click')
    expect(wrapper.find('[aria-label="Sidebar"]').exists()).toBe(false)
  })

  it('should render mobile sidebar with navigation links when visible', async () => {
    const wrapper = mountWithDefaults(Header)
    const mobileToggleButton = wrapper.find('li.p-4.md\\:hidden')

    // Show sidebar
    await mobileToggleButton.trigger('click')

    const sidebar = wrapper.find('[aria-label="Sidebar"]')
    expect(sidebar.exists()).toBe(true)
    expect(sidebar.text()).toContain('Dashboard')
    expect(sidebar.text()).toContain('Scheduler')
    expect(sidebar.text()).toContain('Add Task')
    expect(sidebar.text()).toContain('Tasks')
  })

  it('should apply correct CSS classes for styling', () => {
    const wrapper = mountWithDefaults(Header)
    const header = wrapper.find('header')

    expect(header.classes()).toContain('header')
    expect(header.classes()).toContain('bg-gradient-to-r')
    expect(header.classes()).toContain('from-primary')
    expect(header.classes()).toContain('to-secondary')
  })

  it('should have proper accessibility attributes', async () => {
    const wrapper = mountWithDefaults(Header)
    const mobileToggleButton = wrapper.find('li.p-4.md\\:hidden')

    // Show sidebar
    await mobileToggleButton.trigger('click')

    const sidebar = wrapper.find('[aria-label="Sidebar"]')
    expect(sidebar.attributes('aria-label')).toBe('Sidebar')
  })

  it('should render router-link components for navigation', () => {
    const wrapper = mountWithDefaults(Header)
    const routerLinks = wrapper.findAllComponents({ name: 'RouterLink' })

    // Should have router links for both desktop and mobile navigation
    expect(routerLinks.length).toBeGreaterThan(0)
  })

  it('should apply hover states to navigation items', () => {
    const wrapper = mountWithDefaults(Header)

    // Check that component has hover functionality available
    // Using pragmatic approach - verify hover classes exist in component HTML
    expect(wrapper.html()).toContain('hover:')

    // Component has navigation items with interactive styling
    const mobileToggleButton = wrapper.find('li.p-4.md\\:hidden')
    expect(mobileToggleButton.exists()).toBe(true)

    // Verify the component has interactive navigation functionality
    // The toggle button triggers sidebar functionality
    expect(typeof wrapper.vm.toggleSidebar).toBe('function')
  })

  it('should have responsive design classes', () => {
    const wrapper = mountWithDefaults(Header)
    const desktopNav = wrapper.find('nav ul.md\\:flex')
    const mobileToggleButton = wrapper.find('li.p-4.md\\:hidden')

    expect(desktopNav.exists()).toBe(true)
    expect(mobileToggleButton.exists()).toBe(true)
  })

  it('should render transition component for sidebar animation', async () => {
    const wrapper = mountWithDefaults(Header)
    const transition = wrapper.findComponent({ name: 'Transition' })

    expect(transition.exists()).toBe(true)
  })

  it('should use SVG icons for navigation items', async () => {
    const wrapper = mountWithDefaults(Header)

    // Show sidebar to access navigation icons
    const mobileToggleButton = wrapper.find('li.p-4.md\\:hidden')
    await mobileToggleButton.trigger('click')

    const icons = wrapper.findAll('svg')

    // Component has SVG icons for navigation
    expect(icons.length).toBeGreaterThan(0)
    // Icons are present in the mobile menu button and sidebar navigation
    expect(icons.length).toBeGreaterThanOrEqual(1)
  })
})