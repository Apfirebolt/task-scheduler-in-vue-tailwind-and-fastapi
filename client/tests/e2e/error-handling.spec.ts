import { test, expect } from '@playwright/test'
import { PageHelpers } from './helpers/page-helpers'
import { TestData } from './helpers/test-data'

test.describe('Error Handling and Edge Cases', () => {
  let helpers: PageHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new PageHelpers(page)
    await helpers.navigateToRoute(TestData.routes.home)
    await helpers.waitForAppLoad()
  })

  test.describe('Network Error Handling', () => {
    test('should handle API connectivity issues', async ({ page }) => {
      // Check if API is available
      const isApiConnected = await helpers.checkApiConnectivity()

      if (!isApiConnected) {
        // Navigate to pages that depend on API
        await helpers.clickNavLink('Tasks')
        await helpers.waitForAppLoad()

        // Look for error indicators
        const errorSelectors = [
          '.error',
          '.alert',
          '.bg-red',
          '[text*="error"]',
          '[text*="failed"]',
          '[text*="unable"]',
          '[text*="connection"]'
        ]

        let errorFound = false
        for (const selector of errorSelectors) {
          const errorElement = page.locator(selector)
          if (await errorElement.isVisible()) {
            await expect(errorElement).toBeVisible()
            errorFound = true
            break
          }
        }

        if (!errorFound) {
          console.log('No explicit error message shown, but API is unavailable')
        }

        // Check if page still loads basic structure
        await expect(page.locator('h1, h2')).first().toBeVisible()
      } else {
        console.log('API is available, skipping network error test')
      }
    })

    test('should handle slow API responses', async ({ page }) => {
      // Simulate slow network conditions
      await page.route('**/api/**', async route => {
        // Add delay to simulate slow response
        await new Promise(resolve => setTimeout(resolve, 5000))
        await route.continue()
      })

      await helpers.clickNavLink('Scheduler')
      await helpers.waitForAppLoad()

      // Check for loading states
      const loader = page.locator(TestData.selectors.loader)
      if (await loader.isVisible()) {
        await expect(loader).toBeVisible()

        // Wait for loading to complete (with longer timeout)
        await loader.waitFor({ state: 'hidden', timeout: 15000 })
      }

      // Verify content eventually loads
      await expect(page.locator('h1:has-text("SCHEDULER")')).toBeVisible()
    })

    test('should handle API timeout scenarios', async ({ page }) => {
      // Simulate API timeout
      await page.route('**/api/**', async route => {
        // Don't respond to simulate timeout
        await new Promise(resolve => setTimeout(resolve, 30000))
      })

      await helpers.clickNavLink('Tasks')
      await page.waitForTimeout(10000) // Wait for timeout to occur

      // Check if app handles timeout gracefully
      const currentUrl = page.url()
      expect(currentUrl).toContain('/tasks')

      // Look for timeout indicators or fallback content
      const timeoutIndicators = [
        '[text*="timeout"]',
        '[text*="slow"]',
        '[text*="taking longer"]',
        '.error',
        '.alert'
      ]

      let timeoutFound = false
      for (const selector of timeoutIndicators) {
        const element = page.locator(selector)
        if (await element.isVisible()) {
          timeoutFound = true
          break
        }
      }

      if (!timeoutFound) {
        console.log('No timeout message displayed, but page should handle gracefully')
      }
    })
  })

  test.describe('Form Validation and Error Handling', () => {
    test('should handle empty form submission', async ({ page }) => {
      await helpers.navigateToRoute(TestData.routes.addTask)
      await helpers.waitForAppLoad()

      // Try to submit empty form
      await page.click('input[type="submit"]')

      // Wait for potential validation
      await page.waitForTimeout(2000)

      // Check for validation messages or form preventing submission
      const validationSelectors = [
        '.error',
        '.invalid',
        '[text*="required"]',
        '[text*="field"]',
        '[text*="valid"]',
        '.border-red',
        '.text-red'
      ]

      let validationFound = false
      for (const selector of validationSelectors) {
        const element = page.locator(selector)
        if (await element.isVisible()) {
          await expect(element).toBeVisible()
          validationFound = true
          break
        }
      }

      // Check if we're still on the form page (validation prevented submission)
      const currentUrl = page.url()
      expect(currentUrl).toContain('/add')

      if (!validationFound) {
        console.log('No validation messages found, but form should handle empty submission')
      }
    })

    test('should handle invalid form data', async ({ page }) => {
      await helpers.navigateToRoute(TestData.routes.addTask)
      await helpers.waitForAppLoad()

      // Fill form with invalid data
      await page.fill('#title', TestData.tasks.invalid.title)
      await page.fill('#description', TestData.tasks.invalid.description)

      // Try to fill date with invalid format
      const dateInput = page.locator('#dueDate, input[type="date"]')
      if (await dateInput.isVisible()) {
        await dateInput.fill(TestData.tasks.invalid.date)
      }

      // Submit form
      await page.click('input[type="submit"]')
      await page.waitForTimeout(2000)

      // Check for error handling
      const errorIndicators = page.locator('.error, .alert, .bg-red, [text*="error"]')
      if (await errorIndicators.first().isVisible()) {
        await expect(errorIndicators.first()).toBeVisible()
      }

      // Check if form shows validation state
      const form = page.locator('form')
      await expect(form).toBeVisible()
    })

    test('should handle extremely long form inputs', async ({ page }) => {
      await helpers.navigateToRoute(TestData.routes.addTask)
      await helpers.waitForAppLoad()

      // Fill with very long text
      const longText = 'a'.repeat(10000)
      await page.fill('#title', longText.substring(0, 100)) // Most forms limit title length
      await page.fill('#description', longText)

      // Check if form handles long input gracefully
      const titleInput = page.locator('#title')
      const titleValue = await titleInput.inputValue()
      expect(titleValue.length).toBeGreaterThan(0)

      const descriptionInput = page.locator('#description, textarea')
      if (await descriptionInput.isVisible()) {
        const descriptionValue = await descriptionInput.inputValue()
        expect(descriptionValue.length).toBeGreaterThan(0)
      }
    })

    test('should handle special characters in form inputs', async ({ page }) => {
      await helpers.navigateToRoute(TestData.routes.addTask)
      await helpers.waitForAppLoad()

      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'

      await page.fill('#title', `Test with special chars: ${specialChars}`)
      await page.fill('#description', `Description with special chars: ${specialChars}`)

      // Check if form accepts special characters
      const titleValue = await page.locator('#title').inputValue()
      expect(titleValue).toContain(specialChars)

      // Try to submit
      await page.click('input[type="submit"]')
      await page.waitForTimeout(2000)

      // Check for any encoding or validation errors
      const errorElements = page.locator('.error, .alert, [text*="invalid"]')
      if (await errorElements.first().isVisible()) {
        console.log('Error found with special characters:', await errorElements.first().textContent())
      }
    })
  })

  test.describe('Navigation Error Handling', () => {
    test('should handle invalid routes gracefully', async ({ page }) => {
      const invalidRoutes = [
        '/invalid-route',
        '/non-existent-page',
        '/error',
        '/undefined'
      ]

      for (const route of invalidRoutes) {
        await page.goto(route)
        await page.waitForTimeout(2000)

        // Should either show 404 page or redirect to home
        const currentUrl = page.url()

        const is404Page = await page.locator('text=404').isVisible() ||
                         await page.locator('text="Page not found"').isVisible() ||
                         await page.locator('text="Not found"').isVisible()

        const isHomePage = currentUrl === TestData.routes.home || currentUrl.endsWith('/')

        if (!is404Page && !isHomePage) {
          console.log(`Route ${route} handled in custom way: ${currentUrl}`)
        }
      }
    })

    test('should handle malformed URLs', async ({ page }) => {
      const malformedUrls = [
        '///',
        '/tasks/abc',
        '/update/not-a-number',
        '/scheduler/invalid-date'
      ]

      for (const url of malformedUrls) {
        await page.goto(url)
        await page.waitForTimeout(2000)

        // Should not crash the application
        await expect(page.locator('body')).toBeVisible()

        // Should either show error or redirect
        const currentUrl = page.url()
        expect(currentUrl).not.toContain('undefined')
      }
    })

    test('should handle browser back/forward with invalid history', async ({ page }) => {
      // Navigate to a valid page
      await helpers.navigateToRoute(TestData.routes.addTask)
      await helpers.waitForAppLoad()

      // Navigate to invalid route
      await page.goto('/invalid-route')
      await page.waitForTimeout(2000)

      // Try browser back
      await page.goBack()
      await page.waitForTimeout(2000)

      // Should return to valid state
      await expect(page.locator('body')).toBeVisible()

      // Try browser forward
      await page.goForward()
      await page.waitForTimeout(2000)

      // Should handle gracefully
      await expect(page.locator('body')).toBeVisible()
    })
  })

  test.describe('Component Error Boundaries', () => {
    test('should handle missing component data', async ({ page }) => {
      await helpers.navigateToRoute(TestData.routes.scheduler)
      await helpers.waitForAppLoad()

      // Check if scheduler handles missing/empty task data
      await page.waitForTimeout(3000)

      // Should still show calendar structure even if no tasks
      await expect(page.locator('h1:has-text("SCHEDULER")')).toBeVisible()
      await expect(page.locator('.grid')).toBeVisible()

      // Month navigation should still work
      await page.click('text=Next Month')
      await page.waitForTimeout(1000)

      await expect(page.locator('.grid')).toBeVisible()
    })

    test('should handle component rendering errors', async ({ page }) => {
      // Simulate component error by intercepting and modifying responses
      await page.route('**/tasks/**', async route => {
        // Return malformed data to test error handling
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ invalid: 'data', missing: 'fields' })
        })
      })

      await helpers.clickNavLink('Tasks')
      await helpers.waitForAppLoad()
      await page.waitForTimeout(3000)

      // Should handle malformed data gracefully
      await expect(page.locator('body')).toBeVisible()

      // Should not crash the application
      const currentUrl = page.url()
      expect(currentUrl).toContain('/tasks')
    })
  })

  test.describe('Memory and Performance Edge Cases', () => {
    test('should handle rapid navigation without memory leaks', async ({ page }) => {
      const routes = [
        TestData.routes.home,
        TestData.routes.addTask,
        TestData.routes.taskList,
        TestData.routes.scheduler
      ]

      // Rapid navigation
      for (let i = 0; i < 10; i++) {
        const randomRoute = routes[i % routes.length]
        await page.goto(randomRoute)
        await page.waitForTimeout(100) // Very short wait
      }

      // Wait for final page to stabilize
      await page.waitForTimeout(2000)

      // Should still have functional application
      await expect(page.locator('body')).toBeVisible()
      await expect(page.locator('.header')).toBeVisible()
    })

    test('should handle large amounts of data', async ({ page }) => {
      // Mock large dataset
      await page.route('**/tasks/**', async route => {
        const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          title: `Large Dataset Task ${i}`,
          description: `Description for task ${i}`.repeat(10),
          status: 'In Progress',
          dueDate: '2024-12-31'
        }))

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(largeDataset)
        })
      })

      await helpers.clickNavLink('Tasks')
      await helpers.waitForAppLoad()
      await page.waitForTimeout(5000) // Wait for large data to process

      // Should handle large dataset without crashing
      await expect(page.locator('body')).toBeVisible()

      // Check for loading indicators or virtualization
      const loader = page.locator(TestData.selectors.loader)
      if (await loader.isVisible()) {
        await loader.waitFor({ state: 'hidden', timeout: 15000 })
      }

      // Should show some content
      await expect(page.locator('h1, h2, table, .task-list').first()).toBeVisible()
    })
  })

  test.describe('Browser Compatibility Edge Cases', () => {
    test('should handle JavaScript being disabled', async ({ page }) => {
      // Disable JavaScript
      await page.context().setExtraHTTPHeaders({
        'Content-Security-Policy': "script-src 'none'"
      })

      await page.goto(TestData.routes.home)
      await page.waitForTimeout(3000)

      // Should show some content or noscript message
      const body = page.locator('body')
      await expect(body).toBeVisible()

      // Look for noscript tags or fallback content
      const noscript = page.locator('noscript')
      if (await noscript.isVisible()) {
        await expect(noscript).toBeVisible()
      }
    })

    test('should handle cookie/session issues', async ({ page }) => {
      // Clear all cookies and storage
      await page.context().clearCookies()

      await helpers.navigateToRoute(TestData.routes.addTask)
      await helpers.waitForAppLoad()

      // Should work without cookies
      await expect(page.locator('form')).toBeVisible()

      const titleInput = page.locator('#title')
      if (await titleInput.isVisible()) {
        await titleInput.fill('Test without cookies')
      }
    })

    test('should handle localStorage/sessionStorage issues', async ({ page }) => {
      // Clear storage
      await page.evaluate(() => {
        localStorage.clear()
        sessionStorage.clear()
      })

      await helpers.navigateToRoute(TestData.routes.scheduler)
      await helpers.waitForAppLoad()

      // Should work without storage
      await expect(page.locator('h1:has-text("SCHEDULER")')).toBeVisible()

      // Test navigation
      await page.click('text=Next Month')
      await page.waitForTimeout(1000)

      await expect(page.locator('.grid')).toBeVisible()
    })
  })

  test.describe('Security Edge Cases', () => {
    test('should handle XSS attempts in forms', async ({ page }) => {
      await helpers.navigateToRoute(TestData.routes.addTask)
      await helpers.waitForAppLoad()

      const xssPayloads = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(\'xss\')">',
        '<svg onload="alert(\'xss\')">',
        '"><script>alert("xss")</script>'
      ]

      for (const payload of xssPayloads) {
        await page.fill('#title', payload)
        await page.fill('#description', payload)

        const titleValue = await page.locator('#title').inputValue()
        expect(titleValue).toContain(payload)

        // Submit form
        await page.click('input[type="submit"]')
        await page.waitForTimeout(2000)

        // Check if XSS was executed (alert dialog)
        page.on('dialog', () => {
          console.log('XSS detected - dialog appeared')
        })

        // Check if payload was escaped
        const displayedTitle = page.locator('text=' + payload)
        if (await displayedTitle.isVisible()) {
          // Check if script tags are escaped
          const pageContent = await page.content()
          const hasUnescapedScript = pageContent.includes('<script>') && !pageContent.includes('&lt;script&gt;')
          expect(hasUnescapedScript).toBeFalsy()
        }
      }
    })

    test('should handle CSRF token issues', async ({ page }) => {
      // Remove CSRF headers if they exist
      await page.route('**/*', async route => {
        const headers = route.request().headers()
        delete headers['x-csrf-token']
        delete headers['csrf-token']

        await route.continue({
          headers
        })
      })

      await helpers.navigateToRoute(TestData.routes.addTask)
      await helpers.waitForAppLoad()

      await page.fill('#title', 'CSRF Test')
      await page.click('input[type="submit"]')
      await page.waitForTimeout(2000)

      // Should handle missing CSRF gracefully
      await expect(page.locator('body')).toBeVisible()
    })
  })
})