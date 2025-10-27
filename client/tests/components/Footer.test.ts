import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountWithDefaults, waitForUpdate } from '../utils/test-utils'

// Lazy load the component to avoid import issues
const loadFooterComponent = async () => {
  const component = await import('../../src/components/Footer.vue')
  return component.default
}

describe('Footer Component', () => {
  let Footer

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()

    Footer = await loadFooterComponent()
  })

  it('should mount successfully', () => {
    const wrapper = mountWithDefaults(Footer)
    expect(wrapper.exists()).toBe(true)
  })

  it('should render footer element with correct classes', () => {
    const wrapper = mountWithDefaults(Footer)
    const footer = wrapper.find('footer')

    expect(footer.exists()).toBe(true)
    expect(footer.classes()).toContain('bg-gradient-to-r')
    expect(footer.classes()).toContain('from-primary')
    expect(footer.classes()).toContain('to-secondary')
    expect(footer.classes()).toContain('text-center')
    expect(footer.classes()).toContain('text-white')
  })

  it('should display current year in copyright', () => {
    const wrapper = mountWithDefaults(Footer)
    const currentYear = new Date().getFullYear()

    expect(wrapper.text()).toContain(`© ${currentYear} Copyright:`)
  })

  it('should display application name in copyright section', () => {
    const wrapper = mountWithDefaults(Footer)
    expect(wrapper.text()).toContain('Fast Scheduler')
  })

  it('should have a link to the application website', () => {
    const wrapper = mountWithDefaults(Footer)
    const appLink = wrapper.find('a[href="https://tailwind-elements.com/"]')

    expect(appLink.exists()).toBe(true)
    expect(appLink.text()).toContain('Fast Scheduler')
  })

  it('should render social media icons container', () => {
    const wrapper = mountWithDefaults(Footer)
    const socialContainer = wrapper.find('.flex.justify-center')

    expect(socialContainer.exists()).toBe(true)
  })

  it('should render all expected social media links', () => {
    const wrapper = mountWithDefaults(Footer)
    const socialLinks = wrapper.findAll('.flex.justify-center a')

    // Count actual social media links in the component
    expect(socialLinks.length).toBe(7) // All links found in social media container
  })

  it('should render Facebook icon with correct attributes', () => {
    const wrapper = mountWithDefaults(Footer)
    const facebookLink = wrapper.find('a[href="#!"]')

    expect(facebookLink.exists()).toBe(true)
    expect(facebookLink.find('svg').exists()).toBe(true)
    expect(facebookLink.find('svg').attributes('fill')).toBe('currentColor')
    expect(facebookLink.find('svg').attributes('viewBox')).toBe('0 0 24 24')
  })

  it('should have responsive design classes', () => {
    const wrapper = mountWithDefaults(Footer)
    const footer = wrapper.find('footer')
    const copyrightSection = wrapper.find('.mr-12.hidden.lg\\:block')

    expect(footer.classes()).toContain('lg:text-left')
    expect(copyrightSection.exists()).toBe(true)
  })

  it('should apply dark mode classes', () => {
    const wrapper = mountWithDefaults(Footer)
    const footer = wrapper.find('footer')

    expect(footer.classes()).toContain('dark:bg-neutral-600')
    expect(footer.classes()).toContain('dark:text-neutral-200')
  })

  it('should have social links with correct styling classes', () => {
    const wrapper = mountWithDefaults(Footer)
    const socialLinks = wrapper.findAll('.flex.justify-center a')

    socialLinks.forEach(link => {
      expect(link.classes()).toContain('text-light')
      // Check that link has either light or dark mode styling
      const hasDarkMode = link.classes().some(c => c.startsWith('dark:text-'))
      expect(hasDarkMode).toBe(true)
    })
  })

  it('should have proper spacing between social links', () => {
    const wrapper = mountWithDefaults(Footer)
    const socialLinks = wrapper.findAll('.flex.justify-center a.mr-6')

    // All but the last link should have mr-6 class
    expect(socialLinks.length).toBe(5) // 5 out of 6 should have mr-6
  })

  it('should have SVG icons with correct dimensions', () => {
    const wrapper = mountWithDefaults(Footer)
    const svgIcons = wrapper.findAll('svg')

    svgIcons.forEach(icon => {
      const classes = icon.classes()
      // Icons should have h-6 or h-5 for height and w-6 or w-5 for width
      const hasHeight = classes.some(c => c.startsWith('h-'))
      const hasWidth = classes.some(c => c.startsWith('w-'))
      expect(hasHeight).toBe(true)
      expect(hasWidth).toBe(true)
    })
  })

  it('should render flex container for main content', () => {
    const wrapper = mountWithDefaults(Footer)
    const flexContainer = wrapper.find('.flex.items-center.justify-center.p-6')

    expect(flexContainer.exists()).toBe(true)
    expect(flexContainer.classes()).toContain('items-center')
    expect(flexContainer.classes()).toContain('justify-center')
    expect(flexContainer.classes()).toContain('lg:justify-between')
  })

  it('should have accessibility attributes for social links', () => {
    const wrapper = mountWithDefaults(Footer)
    const socialLinks = wrapper.findAll('.flex.justify-center a')

    socialLinks.forEach(link => {
      // Social links should have proper href attributes (either #! or valid URLs)
      const href = link.attributes('href')
      expect(href).toBeDefined()
      expect(href).toMatch(/^(#!|https?:\/\/)/)
      // Most social links should have SVG icons (flexible check)
      const hasIcon = link.find('svg').exists() || link.text().trim() !== ''
      expect(hasIcon).toBe(true)
    })
  })

  it('should have proper margin and padding classes', () => {
    const wrapper = mountWithDefaults(Footer)
    const footer = wrapper.find('footer')
    const contentContainer = wrapper.find('.flex.items-center.justify-center.p-6')

    expect(footer.classes()).toContain('mt-3')
    expect(footer.classes()).toContain('py-8')
    expect(contentContainer.classes()).toContain('p-6')
  })

  it('should use currentYear computed property correctly', () => {
    // Mock the current year to ensure consistency in tests
    const mockYear = 2024
    const mockDate = new Date()
    mockDate.setFullYear(mockYear)

    vi.spyOn(global, 'Date').mockImplementation(() => mockDate)

    const wrapper = mountWithDefaults(Footer)
    expect(wrapper.text()).toContain(`© ${mockYear} Copyright:`)

    vi.restoreAllMocks()
  })
})