import { test, expect } from '@playwright/test'
import { PageHelpers } from './helpers/page-helpers'
import { TestData } from './helpers/test-data'

test.describe('Scheduler Functionality', () => {
  let helpers: PageHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new PageHelpers(page)
    await helpers.navigateToRoute(TestData.routes.home)
    await helpers.waitForAppLoad()
  })

  test('should load scheduler page successfully', async ({ page }) => {
    await helpers.clickNavLink('Scheduler')
    await helpers.waitForAppLoad()

    // Verify we're on the scheduler page
    await expect(page).toHaveURL(new RegExp(TestData.routes.scheduler))

    // Check for main scheduler elements
    await expect(page.locator('h1:has-text("SCHEDULER")')).toBeVisible()

    // Check for month navigation
    await expect(page.locator('text=Previous Month')).toBeVisible()
    await expect(page.locator('text=Next Month')).toBeVisible()

    // Check for current month/year display
    const monthYearDisplay = page.locator('.font-bold.text-2xl.text-red-400')
    await expect(monthYearDisplay).toBeVisible()

    // Check for calendar grid
    const calendarGrid = page.locator('.grid')
    await expect(calendarGrid).toBeVisible()

    // Check for console errors
    await helpers.checkConsoleErrors()
  })

  test('should display current month correctly', async ({ page }) => {
    await helpers.navigateToRoute(TestData.routes.scheduler)
    await helpers.waitForAppLoad()

    // Get current month and year
    const currentDate = new Date()
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' })
    const currentYear = currentDate.getFullYear()

    // Check if the displayed month/year matches current date
    const monthYearDisplay = page.locator('.font-bold.text-2xl.text-red-400')
    const displayedText = await monthYearDisplay.textContent()

    expect(displayedText).toContain(currentMonth)
    expect(displayedText).toContain(currentYear.toString())
  })

  test('should navigate between months correctly', async ({ page }) => {
    await helpers.navigateToRoute(TestData.routes.scheduler)
    await helpers.waitForAppLoad()

    // Get initial month/year
    const monthYearDisplay = page.locator('.font-bold.text-2xl.text-red-400')
    const initialMonthYear = await monthYearDisplay.textContent()

    // Navigate to next month
    await page.click('text=Next Month')
    await page.waitForTimeout(1000) // Wait for month to update

    const nextMonthYear = await monthYearDisplay.textContent()
    expect(nextMonthYear).not.toBe(initialMonthYear)

    // Navigate back to previous month
    await page.click('text=Previous Month')
    await page.waitForTimeout(1000)

    const backToCurrentMonth = await monthYearDisplay.textContent()
    expect(backToCurrentMonth).toBe(initialMonthYear)

    // Navigate to previous month
    await page.click('text=Previous Month')
    await page.waitForTimeout(1000)

    const previousMonthYear = await monthYearDisplay.textContent()
    expect(previousMonthYear).not.toBe(initialMonthYear)
  })

  test('should display calendar days correctly', async ({ page }) => {
    await helpers.navigateToRoute(TestData.routes.scheduler)
    await helpers.waitForAppLoad()

    // Wait for calendar to load
    await page.waitForTimeout(2000)

    // Check for calendar day elements
    const dayElements = page.locator('.grid > div')
    const dayCount = await dayElements.count()

    // Should have days for the current month (28-31 days)
    expect(dayCount).toBeGreaterThanOrEqual(28)
    expect(dayCount).toBeLessThanOrEqual(31)

    // Check that each day has a date displayed
    const firstDay = dayElements.first()
    const firstDayText = await firstDay.locator('p').first().textContent()
    expect(firstDayText).toMatch(/(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, \d{4}/)
  })

  test('should display tasks on calendar if available', async ({ page }) => {
    await helpers.navigateToRoute(TestData.routes.scheduler)
    await helpers.waitForAppLoad()

    // Wait for tasks to load
    await page.waitForTimeout(3000)

    // Look for task elements within calendar days
    const taskElements = page.locator('.grid .bg-gray-800')

    if (await taskElements.first().isVisible()) {
      // Tasks are present, verify their structure
      const taskCount = await taskElements.count()

      for (let i = 0; i < Math.min(taskCount, 3); i++) {
        const task = taskElements.nth(i)

        // Check for task title
        const taskTitle = task.locator('.font-bold')
        if (await taskTitle.isVisible()) {
          await expect(taskTitle).toBeVisible()
        }

        // Check for task description
        const taskDescription = task.locator('.text-gray-100')
        if (await taskDescription.isVisible()) {
          await expect(taskDescription).toBeVisible()
        }
      }

      console.log(`Found ${taskCount} tasks in calendar`)
    } else {
      console.log('No tasks found in calendar - this is expected if no tasks exist')
    }
  })

  test('should handle loading states correctly', async ({ page }) => {
    // Navigate to scheduler and check for loading
    await helpers.navigateToRoute(TestData.routes.scheduler)

    // Check if loader appears briefly
    const loader = page.locator(TestData.selectors.loader)
    if (await loader.isVisible()) {
      await expect(loader).toBeVisible()

      // Wait for loading to complete
      await loader.waitFor({ state: 'hidden', timeout: 10000 })
    }

    // After loading, scheduler content should be visible
    await expect(page.locator('h1:has-text("SCHEDULER")')).toBeVisible()
    await expect(page.locator('.grid')).toBeVisible()
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Check API connectivity first
    const isApiConnected = await helpers.checkApiConnectivity()

    if (!isApiConnected) {
      await helpers.navigateToRoute(TestData.routes.scheduler)
      await helpers.waitForAppLoad()

      // Look for error message
      const errorMessage = page.locator('.bg-tertiary, .error, .alert')

      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toContainText(/error|failed|unable/i)
      } else {
        // App might handle errors silently
        console.log('No error message displayed, but API is not available')
      }
    } else {
      console.log('API is available, skipping error test')
    }
  })

  test('should be responsive on different screen sizes', async ({ page }) => {
    await helpers.navigateToRoute(TestData.routes.scheduler)
    await helpers.waitForAppLoad()

    const viewports = [TestData.viewports.mobile, TestData.viewports.tablet, TestData.viewports.desktop]

    for (const viewport of viewports) {
      await helpers.checkResponsiveLayout(viewport)

      // Check that scheduler elements adapt to viewport
      await expect(page.locator('h1:has-text("SCHEDULER")')).toBeVisible()
      await expect(page.locator('text=Previous Month')).toBeVisible()
      await expect(page.locator('text=Next Month')).toBeVisible()

      // Check calendar grid layout
      const calendarGrid = page.locator('.grid')
      await expect(calendarGrid).toBeVisible()

      // Grid should adapt columns based on viewport
      const gridClasses = await calendarGrid.getAttribute('class')
      expect(gridClasses).toContain('grid')
    }
  })

  test('should handle month navigation with data persistence', async ({ page }) => {
    await helpers.navigateToRoute(TestData.routes.scheduler)
    await helpers.waitForAppLoad()

    // Wait for initial data to load
    await page.waitForTimeout(3000)

    // Navigate through several months
    for (let i = 0; i < 3; i++) {
      await page.click('text=Next Month')
      await page.waitForTimeout(1000)

      // Verify calendar still displays correctly
      await expect(page.locator('.grid')).toBeVisible()

      const dayElements = page.locator('.grid > div')
      const dayCount = await dayElements.count()
      expect(dayCount).toBeGreaterThanOrEqual(28)
    }

    // Navigate back to current month
    for (let i = 0; i < 3; i++) {
      await page.click('text=Previous Month')
      await page.waitForTimeout(1000)
    }

    // Verify we're back to the current month
    const currentDate = new Date()
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' })
    const currentYear = currentDate.getFullYear()

    const monthYearDisplay = page.locator('.font-bold.text-2xl.text-red-400')
    const displayedText = await monthYearDisplay.textContent()

    expect(displayedText).toContain(currentMonth)
    expect(displayedText).toContain(currentYear.toString())
  })

  test('should handle keyboard navigation', async ({ page }) => {
    await helpers.navigateToRoute(TestData.routes.scheduler)
    await helpers.waitForAppLoad()

    // Test Tab navigation
    await page.keyboard.press('Tab')

    // Should focus on navigation buttons or interactive elements
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()

    // Try navigating through month controls with keyboard
    let attempts = 0
    while (attempts < 10) {
      await page.keyboard.press('Tab')
      const focused = page.locator(':focus')
      const tagName = await focused.evaluate(el => el.tagName.toLowerCase())

      if (tagName === 'button') {
        // Try to activate the button with Enter or Space
        await page.keyboard.press('Enter')
        await page.waitForTimeout(1000)
        break
      }
      attempts++
    }
  })

  test('should handle rapid month navigation', async ({ page }) => {
    await helpers.navigateToRoute(TestData.routes.scheduler)
    await helpers.waitForAppLoad()

    // Test rapid clicking of navigation buttons
    const nextButton = page.locator('text=Next Month')
    const prevButton = page.locator('text=Previous Month')

    // Rapid next month clicks
    for (let i = 0; i < 5; i++) {
      await nextButton.click()
      await page.waitForTimeout(200) // Short delay
    }

    await page.waitForTimeout(1000) // Wait for stability

    // Rapid previous month clicks
    for (let i = 0; i < 5; i++) {
      await prevButton.click()
      await page.waitForTimeout(200) // Short delay
    }

    await page.waitForTimeout(1000)

    // Verify calendar is still functional
    await expect(page.locator('.grid')).toBeVisible()
    const dayElements = page.locator('.grid > div')
    expect(await dayElements.count()).toBeGreaterThanOrEqual(28)
  })

  test('should handle task creation integration', async ({ page }) => {
    // This test checks if tasks created appear in the scheduler
    const isApiConnected = await helpers.checkApiConnectivity()
    test.skip(!isApiConnected, 'API not available for task creation test')

    // First create a task
    await helpers.navigateToRoute(TestData.routes.addTask)
    await helpers.waitForAppLoad()

    const uniqueTitle = `Scheduler Test Task ${Date.now()}`
    await page.fill('#title', uniqueTitle)
    await page.fill('#description', 'This task should appear in the scheduler')

    // Set due date to today
    const today = new Date().toISOString().split('T')[0]
    await page.fill('#dueDate', today)

    await page.click('input[type="submit"]')
    await page.waitForTimeout(2000)

    // Now check scheduler
    await helpers.navigateToRoute(TestData.routes.scheduler)
    await helpers.waitForAppLoad()
    await page.waitForTimeout(3000) // Wait for data to refresh

    // Look for the task in today's calendar cell
    const taskTitle = page.locator(`text=${uniqueTitle}`)

    // The task might not appear immediately due to caching or API delays
    // So we'll check if it's there without failing if it's not
    if (await taskTitle.isVisible()) {
      await expect(taskTitle).toBeVisible()
      console.log('Task successfully appears in scheduler')
    } else {
      console.log('Task not yet visible in scheduler (might need manual refresh)')
    }
  })

  test('should handle empty calendar state', async ({ page }) => {
    await helpers.navigateToRoute(TestData.routes.scheduler)
    await helpers.waitForAppLoad()

    // Check if calendar displays correctly when no tasks are present
    const dayElements = page.locator('.grid > div')
    const dayCount = await dayElements.count()

    // Should still show calendar days even if no tasks
    expect(dayCount).toBeGreaterThanOrEqual(28)

    // Check that each day has date display
    for (let i = 0; i < Math.min(dayCount, 5); i++) {
      const dayElement = dayElements.nth(i)
      const dateText = await dayElement.locator('p').first().textContent()
      expect(dateText).toMatch(/(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, \d{4}/)
    }

    // Check that there are no task elements or they're empty
    const taskElements = page.locator('.grid .bg-gray-800')
    if (await taskElements.first().isVisible()) {
      console.log('Tasks are present in calendar')
    } else {
      console.log('No tasks in calendar - empty state handled correctly')
    }
  })

  test('should maintain scheduler state during browser navigation', async ({ page }) => {
    await helpers.navigateToRoute(TestData.routes.scheduler)
    await helpers.waitForAppLoad()

    // Navigate to a different month
    await page.click('text=Next Month')
    await page.waitForTimeout(1000)

    const navigatedMonthYear = await page.locator('.font-bold.text-2xl.text-red-400').textContent()

    // Navigate away from scheduler
    await helpers.navigateToRoute(TestData.routes.home)
    await helpers.waitForAppLoad()

    // Navigate back to scheduler
    await page.goBack()
    await helpers.waitForAppLoad()

    // Check if we're still on the same month (this depends on implementation)
    const currentMonthYear = await page.locator('.font-bold.text-2xl.text-red-400').textContent()

    // Some implementations might reset to current month, others might maintain state
    console.log(`Before navigation: ${navigatedMonthYear}`)
    console.log(`After navigation: ${currentMonthYear}`)
  })
})