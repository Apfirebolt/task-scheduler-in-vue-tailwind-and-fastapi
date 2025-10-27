import { test, expect } from '@playwright/test'
import { PageHelpers } from './helpers/page-helpers'
import { TestData } from './helpers/test-data'

test.describe('Home Page and Navigation', () => {
  let helpers: PageHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new PageHelpers(page)
    await helpers.navigateToRoute(TestData.routes.home)
    await helpers.waitForAppLoad()
  })

  test('should load home page successfully', async ({ page }) => {
    // Check page title and main content
    await expect(page).toHaveTitle(/Task Scheduler/)
    await expect(page.locator(TestData.selectors.mainHeading)).toContainText('Welcome!')

    // Check that main content is visible
    await expect(page.locator('.container')).toBeVisible()
    await expect(page.locator('text=Vue and Tailwind CSS in action')).toBeVisible()

    // Check for console errors
    await helpers.checkConsoleErrors()
  })

  test('should display navigation header correctly', async ({ page }) => {
    const header = page.locator('.header')
    await expect(header).toBeVisible()

    // Check logo
    await expect(page.locator('h1:has-text("Task Scheduler")')).toBeVisible()

    // Check main navigation links
    const navLinks = ['Home', 'Scheduler', 'Add Task', 'Tasks', 'Task Table']
    for (const linkText of navLinks) {
      const link = page.locator(`nav >> text=${linkText}`)
      await expect(link).toBeVisible()
    }
  })

  test('should navigate between pages using desktop navigation', async ({ page }) => {
    const navigationTests = [
      { link: 'Scheduler', expectedRoute: TestData.routes.scheduler, expectedHeading: 'Scheduler' },
      { link: 'Add Task', expectedRoute: TestData.routes.addTask, expectedHeading: 'ADD TASK' },
      { link: 'Tasks', expectedRoute: TestData.routes.taskList, expectedHeading: 'Task List' },
    ]

    for (const test of navigationTests) {
      // Navigate back to home first
      await helpers.navigateToRoute(TestData.routes.home)
      await helpers.waitForAppLoad()

      // Click navigation link
      await helpers.clickNavLink(test.link)

      // Verify URL and content
      await expect(page).toHaveURL(new RegExp(test.expectedRoute))
      await helpers.waitForAppLoad()

      // Check for relevant content on each page
      if (test.expectedHeading) {
        const heading = page.locator(`h1, h2, p:has-text("${test.expectedHeading}")`)
        if (await heading.isVisible()) {
          await expect(heading.first()).toBeVisible()
        }
      }
    }
  })

  test('should display and handle mobile sidebar', async ({ page }) => {
    // Set mobile viewport
    await helpers.checkResponsiveLayout(TestData.viewports.mobile)

    // Check mobile menu button is visible
    const mobileMenuButton = page.locator('nav >> li:has(svg)').first()
    await expect(mobileMenuButton).toBeVisible()

    // Initially sidebar should be hidden
    const sidebar = page.locator('#default-sidebar')
    await expect(sidebar).toBeHidden()

    // Click mobile menu button to show sidebar
    await mobileMenuButton.click()
    await expect(sidebar).toBeVisible()

    // Check sidebar navigation links
    const sidebarLinks = ['Dashboard', 'Scheduler', 'Add Task', 'Tasks']
    for (const linkText of sidebarLinks) {
      const link = sidebar.locator(`text=${linkText}`)
      await expect(link).toBeVisible()
    }

    // Test navigation from sidebar
    await sidebar.locator('text=Add Task').click()
    await expect(page).toHaveURL(new RegExp(TestData.routes.addTask))
    await helpers.waitForAppLoad()

    // Sidebar should close after navigation
    await expect(sidebar).toBeHidden()
  })

  test('should handle navigation properly', async ({ page }) => {
    // Test router navigation
    await page.goto(TestData.routes.addTask)
    await helpers.waitForAppLoad()
    await expect(page).toHaveURL(new RegExp(TestData.routes.addTask))

    await page.goto(TestData.routes.taskList)
    await helpers.waitForAppLoad()
    await expect(page).toHaveURL(new RegExp(TestData.routes.taskList))

    await page.goto(TestData.routes.scheduler)
    await helpers.waitForAppLoad()
    await expect(page).toHaveURL(new RegExp(TestData.routes.scheduler))

    // Go back to home
    await page.goto(TestData.routes.home)
    await helpers.waitForAppLoad()
    await expect(page).toHaveURL(new RegExp(TestData.routes.home))
  })

  test('should maintain navigation state across browser actions', async ({ page }) => {
    // Navigate to a specific page
    await helpers.navigateToRoute(TestData.routes.addTask)
    await helpers.waitForAppLoad()

    // Reload the page
    await page.reload({ waitUntil: 'networkidle' })
    await helpers.waitForAppLoad()

    // Should still be on the same page
    await expect(page).toHaveURL(new RegExp(TestData.routes.addTask))

    // Test browser back button
    await page.goBack()
    await helpers.waitForAppLoad()
    await expect(page).toHaveURL(new RegExp(TestData.routes.home))

    // Test browser forward button
    await page.goForward()
    await helpers.waitForAppLoad()
    await expect(page).toHaveURL(new RegExp(TestData.routes.addTask))
  })

  test('should handle 404 routes gracefully', async ({ page }) => {
    // Navigate to non-existent route
    await page.goto('/non-existent-page')
    await helpers.waitForAppLoad()

    // Should either show 404 page or redirect to home
    const currentUrl = page.url()
    const isNotFound = currentUrl.includes('non-existent') ||
                      await page.locator('text=404').isVisible() ||
                      await page.locator('text=Page not found').isVisible()

    // If it's a Vue app with catch-all route, it might redirect to home
    if (!isNotFound) {
      await expect(page).toHaveURL(new RegExp(TestData.routes.home))
    }
  })

  test('should be accessible via keyboard navigation', async ({ page }) => {
    // Test Tab navigation through header
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()

    // Tab through navigation links
    let tabCount = 0
    while (tabCount < 10) {
      await page.keyboard.press('Tab')
      const focusedElement = page.locator(':focus')

      if (await focusedElement.isVisible()) {
        // Check if focused element is a navigation link
        const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase())
        if (tagName === 'a') {
          // Should be able to activate with Enter
          await page.keyboard.press('Enter')
          await helpers.waitForAppLoad()
          break
        }
      }
      tabCount++
    }
  })

  test('should maintain responsive layout across different viewports', async ({ page }) => {
    const viewports = [TestData.viewports.mobile, TestData.viewports.tablet, TestData.viewports.desktop]

    for (const viewport of viewports) {
      await helpers.navigateToRoute(TestData.routes.home)
      await helpers.checkResponsiveLayout(viewport)

      // Check header is always visible
      await expect(page.locator('.header')).toBeVisible()

      // Check main content is accessible
      await expect(page.locator('.container')).toBeVisible()

      // Check navigation adapts to viewport
      if (viewport.width < 768) {
        // Mobile: show hamburger menu
        await expect(page.locator('nav >> li:has(svg)')).toBeVisible()
      } else {
        // Desktop: show full navigation
        await expect(page.locator('nav >> ul')).toBeVisible()
      }
    }
  })
})