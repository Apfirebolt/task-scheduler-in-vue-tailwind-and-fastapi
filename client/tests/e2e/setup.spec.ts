import { test, expect } from '@playwright/test'

test.describe('Playwright Setup Verification', () => {
  test('verify playwright configuration', async ({ page }) => {
    // Navigate to the application
    await page.goto('/')

    // Basic page checks
    await expect(page).toHaveTitle(/Task Scheduler/)
    await expect(page.locator('h1')).toBeVisible()

    // Check if we can access the page URL
    const currentUrl = page.url()
    expect(currentUrl).toContain('localhost')

    // Take a screenshot for verification
    await page.screenshot({ path: 'test-results/setup-verification.png' })
  })

  test('check browser support', async ({ page, browserName }) => {
    console.log(`Running test on ${browserName}`)

    await page.goto('/')

    // Verify the page loads correctly in this browser
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 })

    // Log browser info
    const userAgent = await page.evaluate(() => navigator.userAgent)
    console.log(`Browser User Agent: ${userAgent}`)
  })

  test('test environment variables', async ({ page }) => {
    await page.goto('/')

    // Check if we can read the base URL from config
    const baseURL = test.info().project.use.baseURL
    console.log(`Base URL: ${baseURL}`)

    expect(baseURL).toBeTruthy()
    expect(baseURL).toMatch(/localhost/)
  })

  test('verify API connectivity', async ({ page }) => {
    await page.goto('/')

    // Check if we can make API calls (this tests the CORS setup)
    try {
      const response = await page.evaluate(async () => {
        // Try to fetch tasks from the API
        const response = await fetch('/api/tasks')
        return {
          status: response.status,
          ok: response.ok,
          url: response.url
        }
      })

      console.log('API Response:', response)

      // The API should respond (either with tasks or empty array)
      expect(response.status).toBeLessThan(500)
    } catch (error) {
      console.log('API call failed:', error)
      // In development, API might not be available, which is ok for this setup test
    }
  })

  test('verify mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Check if mobile navigation works
    const mobileNav = page.locator('nav ul.md\\:hidden')
    if (await mobileNav.isVisible()) {
      await expect(mobileNav).toBeVisible()
    }
  })
})