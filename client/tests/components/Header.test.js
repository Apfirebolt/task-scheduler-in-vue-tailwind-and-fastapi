import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Header from '@/components/Header.vue'

describe('Header Component', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(Header)
  })

  it('renders the component correctly', () => {
    expect(wrapper.find('.header').exists()).toBe(true)
    expect(wrapper.find('h1').text()).toBe('Task Scheduler')
  })

  it('has correct navigation links', () => {
    const navLinks = wrapper.findAll('nav ul li a')
    expect(navLinks.length).toBe(5) // Home, Scheduler, Add Task, Tasks, Task Table

    const homeLink = navLinks[0]
    expect(homeLink.text()).toBe('Home')
    expect(homeLink.attributes('to')).toBe('/')
  })

  it('has mobile menu toggle button', () => {
    const mobileToggle = wrapper.find('nav ul:last-child li')
    expect(mobileToggle.exists()).toBe(true)
    expect(mobileToggle.classes()).toContain('md:hidden')
  })

  it('toggles sidebar when mobile menu is clicked', async () => {
    const mobileToggle = wrapper.find('nav ul:last-child li')

    // Initially sidebar should be hidden
    expect(wrapper.vm.showSidebar).toBe(false)
    expect(wrapper.find('[v-if="showSidebar"]').exists()).toBe(false)

    // Click to show sidebar
    await mobileToggle.trigger('click')
    expect(wrapper.vm.showSidebar).toBe(true)

    // Click again to hide sidebar
    await mobileToggle.trigger('click')
    expect(wrapper.vm.showSidebar).toBe(false)
  })

  it('shows sidebar when showSidebar is true', async () => {
    wrapper.vm.showSidebar = true
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[v-if="showSidebar"]').exists()).toBe(true)
    expect(wrapper.find('#default-sidebar').exists()).toBe(true)
  })

  it('sidebar contains navigation links', async () => {
    wrapper.vm.showSidebar = true
    await wrapper.vm.$nextTick()

    const sidebarLinks = wrapper.findAll('#default-sidebar ul li')
    expect(sidebarLinks.length).toBe(4) // Dashboard, Scheduler, Add Task, Tasks

    const dashboardLink = sidebarLinks[0].find('router-link')
    expect(dashboardLink.attributes('to')).toBe('/')
    expect(dashboardLink.text()).toContain('Dashboard')
  })

  it('applies correct CSS classes', () => {
    const header = wrapper.find('.header')
    expect(header.classes()).toContain('bg-gradient-to-r')
    expect(header.classes()).toContain('from-primary')
    expect(header.classes()).toContain('to-secondary')
  })

  it('logo has correct text content', () => {
    const logo = wrapper.find('h1')
    expect(logo.text()).toBe('Task Scheduler')
    expect(logo.classes()).toContain('text-light')
  })
})