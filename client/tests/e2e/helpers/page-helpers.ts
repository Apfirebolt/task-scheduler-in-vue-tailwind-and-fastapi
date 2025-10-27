import { Page, expect } from '@playwright/test'

export class PageHelpers {
  constructor(private page: Page) {}

  /**
   * Navigate to a specific route and wait for navigation to complete
   */
  async navigateToRoute(route: string): Promise<void> {
    await this.page.goto(route)
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Wait for the Vue.js app to be fully loaded
   */
  async waitForAppLoad(): Promise<void> {
    // Wait for the main Vue app to be mounted
    await this.page.waitForSelector('#app', { state: 'attached' })

    // Wait for any loading indicators to disappear
    const loader = this.page.locator('.loader, [text*="Loading"], [text*="loading"]')
    if (await loader.isVisible()) {
      await loader.waitFor({ state: 'hidden' })
    }

    // Wait for network to be idle
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Check if the page is responsive at the given viewport
   */
  async checkResponsiveLayout(viewport: { width: number; height: number }): Promise<void> {
    await this.page.setViewportSize(viewport)

    // Wait for any layout shifts
    await this.page.waitForTimeout(100)

    // Take a screenshot for debugging
    await this.page.screenshot({
      path: `test-results/responsive-${viewport.width}x${viewport.height}.png`
    })
  }

  /**
   * Check for console errors
   */
  async checkConsoleErrors(): Promise<void> {
    const logs: string[] = []

    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text())
      }
    })

    // Wait a bit to catch any errors
    await this.page.waitForTimeout(1000)

    if (logs.length > 0) {
      console.error('Console errors found:', logs)
      throw new Error(`Console errors detected: ${logs.join(', ')}`)
    }
  }

  /**
   * Check if API calls are working
   */
  async checkApiConnectivity(endpoint: string = '/api/tasks'): Promise<boolean> {
    try {
      const response = await this.page.evaluate(async (url) => {
        const res = await fetch(url)
        return {
          status: res.status,
          ok: res.ok,
          statusText: res.statusText
        }
      }, endpoint)

      console.log(`API ${endpoint} response:`, response)
      return response.ok || response.status < 500
    } catch (error) {
      console.log(`API ${endpoint} failed:`, error)
      return false
    }
  }

  /**
   * Wait for toast notifications to appear and disappear
   */
  async waitForToast(): Promise<void> {
    const toast = this.page.locator('.toast, .notification, [role="alert"]')
    if (await toast.isVisible()) {
      await expect(toast).toBeVisible()
      await toast.waitFor({ state: 'hidden', timeout: 5000 })
    }
  }

  /**
   * Fill form fields with common patterns
   */
  async fillForm(formData: Record<string, string>): Promise<void> {
    for (const [selector, value] of Object.entries(formData)) {
      const element = this.page.locator(selector)
      if (await element.isVisible()) {
        await element.fill(value)
      }
    }
  }

  /**
   * Click navigation links by text
   */
  async clickNavLink(linkText: string): Promise<void> {
    const link = this.page.locator(`a:has-text("${linkText}"), button:has-text("${linkText}")`)
    await expect(link).toBeVisible()
    await link.click()
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Check accessibility basics
   */
  async checkAccessibility(): Promise<void> {
    // Check for proper heading structure
    const mainHeading = this.page.locator('h1')
    await expect(mainHeading).toBeVisible()

    // Check for navigation landmarks
    const nav = this.page.locator('nav')
    await expect(nav).toBeVisible()

    // Check for proper link text
    const links = this.page.locator('a[href]')
    await expect(links.first()).toBeVisible()

    // Log any accessibility issues
    const accessibilityIssues = await this.page.checkA11y ?
      await this.page.checkA11y() : null

    if (accessibilityIssues) {
      console.warn('Accessibility issues found:', accessibilityIssues)
    }
  }
}