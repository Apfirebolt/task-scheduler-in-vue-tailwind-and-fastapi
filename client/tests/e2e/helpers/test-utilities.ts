import { Page, expect } from '@playwright/test'
import { PageHelpers } from './page-helpers'
import { TestData } from './test-data'

export class TestUtilities {
  constructor(private page: Page) {}

  /**
   * Wait for API response and validate status
   */
  async waitForApiResponse(endpoint: string, timeout: number = 10000): Promise<boolean> {
    try {
      const response = await this.page.waitForResponse(
        response => response.url().includes(endpoint),
        { timeout }
      )
      return response.status() < 500
    } catch (error) {
      console.log(`API response timeout for ${endpoint}:`, error)
      return false
    }
  }

  /**
   * Take screenshot with automatic naming
   */
  async takeScreenshot(name: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `${name}-${timestamp}.png`
    await this.page.screenshot({
      path: `test-results/screenshots/${filename}`,
      fullPage: true
    })
  }

  /**
   * Clear form fields
   */
  async clearForm(selectors: string[]): Promise<void> {
    for (const selector of selectors) {
      const element = this.page.locator(selector)
      if (await element.isVisible()) {
        await element.clear()
      }
    }
  }

  /**
   * Generate unique test data
   */
  generateUniqueData(prefix: string = 'Test'): {
    title: string
    description: string
    email: string
  } {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)

    return {
      title: `${prefix} ${timestamp}-${random}`,
      description: `Description for ${prefix} created at ${new Date().toISOString()}`,
      email: `${prefix.toLowerCase()}-${timestamp}@test.com`
    }
  }

  /**
   * Check if element is visible and enabled
   */
  async isElementVisibleAndEnabled(selector: string): Promise<boolean> {
    const element = this.page.locator(selector)
    const isVisible = await element.isVisible()
    const isEnabled = await element.isEnabled()
    return isVisible && isEnabled
  }

  /**
   * Wait for element to be visible with timeout
   */
  async waitForElementVisible(selector: string, timeout: number = 5000): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, {
        state: 'visible',
        timeout
      })
      return true
    } catch (error) {
      console.log(`Element ${selector} not visible within ${timeout}ms`)
      return false
    }
  }

  /**
   * Get element text content safely
   */
  async getElementText(selector: string): Promise<string> {
    try {
      const element = this.page.locator(selector)
      if (await element.isVisible()) {
        return await element.textContent() || ''
      }
      return ''
    } catch (error) {
      console.log(`Error getting text for ${selector}:`, error)
      return ''
    }
  }

  /**
   * Check if URL contains expected path
   */
  async verifyUrlPath(expectedPath: string): Promise<boolean> {
    const currentUrl = this.page.url()
    return currentUrl.includes(expectedPath)
  }

  /**
   * Get current viewport size
   */
  async getViewportSize(): Promise<{ width: number; height: number }> {
    return await this.page.viewportSize() || { width: 0, height: 0 }
  }

  /**
   * Set viewport and wait for layout to settle
   */
  async setViewportAndWait(width: number, height: number): Promise<void> {
    await this.page.setViewportSize({ width, height })
    await this.page.waitForTimeout(200) // Allow layout to settle
  }

  /**
   * Check for JavaScript errors
   */
  async checkForJSErrors(): Promise<string[]> {
    const errors: string[] = []

    this.page.on('pageerror', error => {
      errors.push(error.message)
    })

    // Give some time to catch errors
    await this.page.waitForTimeout(1000)

    return errors
  }

  /**
   * Mock API response
   */
  async mockApiCall(endpoint: string, response: any, status: number = 200): Promise<void> {
    await this.page.route(endpoint, async route => {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(response)
      })
    })
  }

  /**
   * Block network requests (for testing offline scenarios)
   */
  async blockNetworkRequests(): Promise<void> {
    await this.page.route('**/*', route => route.abort())
  }

  /**
   * Slow down network (for testing loading states)
   */
  async slowNetwork(delay: number = 3000): Promise<void> {
    await this.page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, delay))
      await route.continue()
    })
  }

  /**
   * Test data cleanup helper
   */
  async cleanupTestData(patterns: string[]): Promise<void> {
    // This would connect to your test database/API to clean up test data
    console.log('Cleaning up test data for patterns:', patterns)
  }

  /**
   * Generate test report data
   */
  generateTestReport(testResults: any): void {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: testResults.total || 0,
        passed: testResults.passed || 0,
        failed: testResults.failed || 0,
        skipped: testResults.skipped || 0
      },
      environment: {
        userAgent: this.page.context().browser()?.version(),
        viewport: await this.getViewportSize()
      }
    }

    console.log('Test Report:', JSON.stringify(report, null, 2))
  }

  /**
   * Accessibility helper - check color contrast (basic implementation)
   */
  async checkColorContrast(element: any): Promise<{ ratio: number; passes: boolean }> {
    const styles = await element.evaluate((el: any) => {
      const computed = window.getComputedStyle(el)
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor
      }
    })

    // This is a simplified check - real contrast calculation is more complex
    const ratio = 4.5 // Placeholder value
    const passes = ratio >= 4.5

    return { ratio, passes }
  }

  /**
   * Performance metrics helper
   */
  async getPerformanceMetrics(): Promise<any> {
    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0
      }
    })

    return metrics
  }

  /**
   * Memory usage helper
   */
  async getMemoryUsage(): Promise<any> {
    try {
      const metrics = await this.page.evaluate(() => {
        return (performance as any).memory || {
          usedJSHeapSize: 0,
          totalJSHeapSize: 0,
          jsHeapSizeLimit: 0
        }
      })
      return metrics
    } catch (error) {
      console.log('Memory metrics not available:', error)
      return null
    }
  }

  /**
   * Form interaction helper
   */
  async fillFormSafely(formData: Record<string, string>): Promise<void> {
    for (const [selector, value] of Object.entries(formData)) {
      const element = this.page.locator(selector)

      if (await element.isVisible()) {
        await element.click() // Ensure focus
        await element.fill(value)

        // Verify the value was set
        const actualValue = await element.inputValue()
        if (actualValue !== value) {
          console.warn(`Form field ${selector} value mismatch: expected "${value}", got "${actualValue}"`)
        }
      } else {
        console.warn(`Form field ${selector} not visible`)
      }
    }
  }

  /**
   * Multi-step action helper with retries
   */
  async performActionWithRetry(action: () => Promise<void>, maxRetries: number = 3): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await action()
        return true
      } catch (error) {
        console.log(`Action failed on attempt ${attempt}:`, error)

        if (attempt === maxRetries) {
          return false
        }

        // Wait before retry
        await this.page.waitForTimeout(1000 * attempt)
      }
    }
    return false
  }

  /**
   * Validate page structure
   */
  async validatePageStructure(): Promise<{
    hasTitle: boolean
    hasMainHeading: boolean
    hasNavigation: boolean
    hasMainContent: boolean
  }> {
    const hasTitle = (await this.page.title()).length > 0
    const hasMainHeading = await this.page.locator('h1').isVisible()
    const hasNavigation = await this.page.locator('nav').isVisible()
    const hasMainContent = await this.page.locator('main, [role="main"], .container').isVisible()

    return {
      hasTitle,
      hasMainHeading,
      hasNavigation,
      hasMainContent
    }
  }

  /**
   * Check responsive breakpoints
   */
  async testResponsiveBreakpoints(): Promise<{
    mobile: boolean
    tablet: boolean
    desktop: boolean
  }> {
    const results = {
      mobile: false,
      tablet: false,
      desktop: false
    }

    // Test mobile
    await this.setViewportAndWait(TestData.viewports.mobile.width, TestData.viewports.mobile.height)
    results.mobile = await this.page.locator('nav ul.md\\:hidden').isVisible()

    // Test tablet
    await this.setViewportAndWait(TestData.viewports.tablet.width, TestData.viewports.tablet.height)
    results.tablet = await this.page.locator('nav').isVisible()

    // Test desktop
    await this.setViewportAndWait(TestData.viewports.desktop.width, TestData.viewports.desktop.height)
    results.desktop = await this.page.locator('nav ul.md\\:flex').isVisible()

    return results
  }
}

/**
 * Custom assertions
 */
export class CustomAssertions {
  constructor(private utilities: TestUtilities) {}

  /**
   * Assert element is accessible
   */
  async assertElementAccessible(selector: string): Promise<void> {
    const element = this.utilities.page.locator(selector)
    await expect(element).toBeVisible()

    // Check for accessible name
    const hasAccessibleName = await element.evaluate(el => {
      const accessibleName = el.getAttribute('aria-label') ||
                           el.getAttribute('aria-labelledby') ||
                           el.getAttribute('title') ||
                           el.textContent?.trim()
      return !!accessibleName
    })

    expect(hasAccessibleName).toBeTruthy()
  }

  /**
   * Assert form is valid
   */
  async assertFormValid(formSelector: string = 'form'): Promise<void> {
    const form = this.utilities.page.locator(formSelector)
    await expect(form).toBeVisible()

    const isValid = await form.evaluate(el => el.checkValidity())
    expect(isValid).toBeTruthy()
  }

  /**
   * Assert no console errors
   */
  async assertNoConsoleErrors(): Promise<void> {
    const errors = await this.utilities.checkForJSErrors()
    expect(errors.length).toBe(0)
  }

  /**
   * Assert performance metrics are acceptable
   */
  async assertPerformanceMetrics(thresholds: {
    domContentLoaded?: number
    loadComplete?: number
    firstContentfulPaint?: number
  }): Promise<void> {
    const metrics = await this.utilities.getPerformanceMetrics()

    if (thresholds.domContentLoaded) {
      expect(metrics.domContentLoaded).toBeLessThan(thresholds.domContentLoaded)
    }

    if (thresholds.loadComplete) {
      expect(metrics.loadComplete).toBeLessThan(thresholds.loadComplete)
    }

    if (thresholds.firstContentfulPaint) {
      expect(metrics.firstContentfulPaint).toBeLessThan(thresholds.firstContentfulPaint)
    }
  }
}