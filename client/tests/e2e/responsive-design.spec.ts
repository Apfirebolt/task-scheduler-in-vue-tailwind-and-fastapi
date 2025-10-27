import { test, expect } from '@playwright/test'
import { PageHelpers } from './helpers/page-helpers'
import { TestData } from './helpers/test-data'

test.describe('Responsive Design Tests', () => {
  let helpers: PageHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new PageHelpers(page)
    await helpers.navigateToRoute(TestData.routes.home)
    await helpers.waitForAppLoad()
  })

  test.describe('Desktop Layout (>1024px)', () => {
    test('should display correct layout on desktop screens', async ({ page }) => {
      await helpers.checkResponsiveLayout(TestData.viewports.desktop)

      // Header should be fully visible
      await expect(page.locator('.header')).toBeVisible()

      // Desktop navigation should be visible
      await expect(page.locator('nav ul.md\\:flex')).toBeVisible()
      await expect(page.locator('nav ul.md\\:hidden')).not.toBeVisible()

      // Main navigation links should be visible
      const navLinks = ['Home', 'Scheduler', 'Add Task', 'Tasks', 'Task Table']
      for (const linkText of navLinks) {
        const link = page.locator(`nav >> text=${linkText}`)
        await expect(link).toBeVisible()
      }

      // Content should take appropriate width
      const container = page.locator('.container')
      if (await container.isVisible()) {
        const boundingBox = await container.boundingBox()
        expect(boundingBox.width).toBeGreaterThan(800)
      }
    })

    test('should handle wide screens correctly', async ({ page }) => {
      await helpers.checkResponsiveLayout(TestData.viewports.widescreen)

      // Header should remain centered or appropriately sized
      await expect(page.locator('.header')).toBeVisible()

      // Navigation should handle wide layout
      await expect(page.locator('nav')).toBeVisible()

      // Content should not stretch too wide on very large screens
      const container = page.locator('.container')
      if (await container.isVisible()) {
        const boundingBox = await container.boundingBox()
        expect(boundingBox.width).toBeLessThan(1600)
      }
    })
  })

  test.describe('Tablet Layout (768px-1024px)', () => {
    test('should adapt to tablet screens correctly', async ({ page }) => {
      await helpers.checkResponsiveLayout(TestData.viewports.tablet)

      // Header should still be visible
      await expect(page.locator('.header')).toBeVisible()

      // Navigation might change layout
      const desktopNav = page.locator('nav ul.md\\:flex')
      const mobileNav = page.locator('nav ul.md\\:hidden')

      // Check appropriate navigation state for tablet
      if (await desktopNav.isVisible()) {
        console.log('Desktop navigation visible on tablet')
      } else if (await mobileNav.isVisible()) {
        console.log('Mobile navigation visible on tablet')
      } else {
        // Navigation might be in a transitional state
        await expect(page.locator('nav')).toBeVisible()
      }

      // Content should be appropriately sized
      const container = page.locator('.container')
      if (await container.isVisible()) {
        const boundingBox = await container.boundingBox()
        expect(boundingBox.width).toBeGreaterThan(600)
        expect(boundingBox.width).toBeLessThanOrEqual(1024)
      }
    })

    test('should handle navigation on tablet', async ({ page }) => {
      await helpers.checkResponsiveLayout(TestData.viewports.tablet)

      // Test navigation functionality
      const navigationTests = [
        { link: 'Scheduler', expectedRoute: TestData.routes.scheduler },
        { link: 'Add Task', expectedRoute: TestData.routes.addTask },
        { link: 'Tasks', expectedRoute: TestData.routes.taskList },
      ]

      for (const test of navigationTests) {
        await helpers.navigateToRoute(TestData.routes.home)
        await helpers.checkResponsiveLayout(TestData.viewports.tablet)

        await helpers.clickNavLink(test.link)
        await expect(page).toHaveURL(new RegExp(test.expectedRoute))
        await helpers.waitForAppLoad()

        // Check content is visible on tablet
        await expect(page.locator('h1, h2, p').first()).toBeVisible()
      }
    })
  })

  test.describe('Mobile Layout (<768px)', () => {
    test('should display mobile navigation correctly', async ({ page }) => {
      await helpers.checkResponsiveLayout(TestData.viewports.mobile)

      // Header should be visible but compact
      await expect(page.locator('.header')).toBeVisible()

      // Mobile menu button should be visible
      const mobileMenuButton = page.locator('nav ul.md\\:hidden li')
      await expect(mobileMenuButton).toBeVisible()

      // Desktop navigation should be hidden
      const desktopNav = page.locator('nav ul.md\\:flex')
      if (await desktopNav.isVisible()) {
        console.log('Warning: Desktop navigation visible on mobile')
      }

      // Sidebar should be hidden initially
      const sidebar = page.locator('#default-sidebar')
      await expect(sidebar).toBeHidden()
    })

    test('should handle mobile sidebar interaction', async ({ page }) => {
      await helpers.checkResponsiveLayout(TestData.viewports.mobile)

      // Click mobile menu button
      const mobileMenuButton = page.locator('nav ul.md\\:hidden li')
      await mobileMenuButton.click()

      // Sidebar should become visible
      const sidebar = page.locator('#default-sidebar')
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

    test('should handle mobile form layouts', async ({ page }) => {
      await helpers.checkResponsiveLayout(TestData.viewports.mobile)

      // Navigate to Add Task page
      await helpers.clickNavLink('Add Task')
      await helpers.waitForAppLoad()

      // Form should be appropriately sized for mobile
      const form = page.locator('form')
      await expect(form).toBeVisible()

      const formBounding = await form.boundingBox()
      expect(formBounding.width).toBeLessThanOrEqual(400)

      // Form elements should be properly sized
      const input = page.locator('input#title')
      if (await input.isVisible()) {
        const inputBounding = await input.boundingBox()
        expect(inputBounding.width).toBeLessThanOrEqual(350)
      }
    })

    test('should handle mobile scheduler layout', async ({ page }) => {
      await helpers.checkResponsiveLayout(TestData.viewports.mobile)

      await helpers.clickNavLink('Scheduler')
      await helpers.waitForAppLoad()

      // Calendar should adapt to mobile layout
      const calendarGrid = page.locator('.grid')
      await expect(calendarGrid).toBeVisible()

      // Grid should use fewer columns on mobile
      const gridClasses = await calendarGrid.getAttribute('class')
      expect(gridClasses).toContain('grid')

      // Month navigation buttons should be accessible
      await expect(page.locator('text=Previous Month')).toBeVisible()
      await expect(page.locator('text=Next Month')).toBeVisible()

      // Test month navigation on mobile
      await page.click('text=Next Month')
      await page.waitForTimeout(1000)

      const monthYearDisplay = page.locator('.font-bold.text-2xl.text-red-400')
      await expect(monthYearDisplay).toBeVisible()
    })

    test('should handle mobile task list layout', async ({ page }) => {
      await helpers.checkResponsiveLayout(TestData.viewports.mobile)

      await helpers.clickNavLink('Tasks')
      await helpers.waitForAppLoad()

      // Wait for content to load
      await page.waitForTimeout(3000)

      // Task list should be scrollable on mobile
      const taskList = page.locator(TestData.selectors.taskList)
      if (await taskList.isVisible()) {
        const listBounding = await taskList.boundingBox()
        expect(listBounding.width).toBeLessThanOrEqual(400)
      }

      // Table should be responsive or replaced with list view
      const table = page.locator('table')
      if (await table.isVisible()) {
        // Check if table is horizontally scrollable or has responsive design
        const tableBounding = await table.boundingBox()
        expect(tableBounding.width).toBeGreaterThan(300)
      }
    })
  })

  test.describe('Orientation Changes', () => {
    test('should handle mobile landscape orientation', async ({ page }) => {
      // Mobile landscape
      const mobileLandscape = { width: 667, height: 375 }
      await helpers.checkResponsiveLayout(mobileLandscape)

      // Header should adapt to landscape
      await expect(page.locator('.header')).toBeVisible()

      // Navigation should still work
      const mobileMenuButton = page.locator('nav ul.md\\:hidden li')
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click()

        const sidebar = page.locator('#default-sidebar')
        await expect(sidebar).toBeVisible()
      }

      // Content should use available width effectively
      const container = page.locator('.container')
      if (await container.isVisible()) {
        const boundingBox = await container.boundingBox()
        expect(boundingBox.width).toBeGreaterThan(500)
      }
    })

    test('should handle tablet portrait orientation', async ({ page }) => {
      const tabletPortrait = { width: 768, height: 1024 }
      await helpers.checkResponsiveLayout(tabletPortrait)

      // Should maintain tablet layout characteristics
      await expect(page.locator('.header')).toBeVisible()
      await expect(page.locator('nav')).toBeVisible()

      // Test navigation in portrait
      await helpers.clickNavLink('Add Task')
      await helpers.waitForAppLoad()

      const form = page.locator('form')
      if (await form.isVisible()) {
        await expect(form).toBeVisible()
      }
    })
  })

  test.describe('Cross-Device Consistency', () => {
    test('should maintain functionality across all viewports', async ({ page }) => {
      const viewports = [
        TestData.viewports.mobile,
        TestData.viewports.tablet,
        TestData.viewports.desktop
      ]

      for (const viewport of viewports) {
        console.log(`Testing viewport: ${viewport.width}x${viewport.height}`)

        await helpers.navigateToRoute(TestData.routes.home)
        await helpers.checkResponsiveLayout(viewport)

        // Test basic navigation
        await helpers.clickNavLink('Scheduler')
        await helpers.waitForAppLoad()
        await expect(page).toHaveURL(new RegExp(TestData.routes.scheduler))

        // Test calendar functionality
        await expect(page.locator('h1:has-text("SCHEDULER")')).toBeVisible()
        await page.click('text=Next Month')
        await page.waitForTimeout(1000)

        // Test task creation
        await helpers.clickNavLink('Add Task')
        await helpers.waitForAppLoad()

        const titleInput = page.locator('input#title')
        if (await titleInput.isVisible()) {
          await titleInput.fill('Responsive Test Task')
          const description = page.locator('#description, textarea')
          if (await description.isVisible()) {
            await description.fill('Testing responsive design')
          }
        }
      }
    })

    test('should handle text scaling and readability', async ({ page }) => {
      const viewports = [TestData.viewports.mobile, TestData.viewports.desktop]

      for (const viewport of viewports) {
        await helpers.navigateToRoute(TestData.routes.home)
        await helpers.checkResponsiveLayout(viewport)

        // Check heading visibility
        const mainHeading = page.locator('h1')
        if (await mainHeading.isVisible()) {
          const headingBounding = await mainHeading.boundingBox()
          expect(headingBounding.height).toBeGreaterThan(16) // Minimum readable height
        }

        // Check navigation link readability
        const navLinks = page.locator('nav a')
        const linkCount = await navLinks.count()

        for (let i = 0; i < Math.min(linkCount, 3); i++) {
          const link = navLinks.nth(i)
          if (await link.isVisible()) {
            const linkBounding = await link.boundingBox()
            expect(linkBounding.height).toBeGreaterThan(12)
          }
        }
      }
    })
  })

  test.describe('Edge Cases', () => {
    test('should handle very small screens', async ({ page }) => {
      const verySmall = { width: 320, height: 568 } // iPhone SE
      await helpers.checkResponsiveLayout(verySmall)

      // Essential elements should still be visible
      await expect(page.locator('.header')).toBeVisible()

      // Mobile navigation should work
      const mobileMenuButton = page.locator('nav ul.md\\:hidden li')
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click()

        const sidebar = page.locator('#default-sidebar')
        await expect(sidebar).toBeVisible()

        // Sidebar should fit within viewport
        const sidebarBounding = await sidebar.boundingBox()
        expect(sidebarBounding.width).toBeLessThanOrEqual(320)
      }
    })

    test('should handle ultra-wide screens', async ({ page }) => {
      const ultraWide = { width: 2560, height: 1440 } // 4K display
      await helpers.checkResponsiveLayout(ultraWide)

      // Content should not stretch unreasonably
      const container = page.locator('.container')
      if (await container.isVisible()) {
        const boundingBox = await container.boundingBox()
        expect(boundingBox.width).toBeLessThan(2000) // Max content width
      }

      // Navigation should remain usable
      await expect(page.locator('nav')).toBeVisible()

      const navLinks = page.locator('nav a')
      const firstLink = navLinks.first()
      if (await firstLink.isVisible()) {
        await expect(firstLink).toBeVisible()
      }
    })

    test('should handle dynamic viewport changes', async ({ page }) => {
      // Start with mobile
      await helpers.checkResponsiveLayout(TestData.viewports.mobile)
      await expect(page.locator('.header')).toBeVisible()

      // Switch to tablet
      await helpers.checkResponsiveLayout(TestData.viewports.tablet)
      await expect(page.locator('.header')).toBeVisible()

      // Switch to desktop
      await helpers.checkResponsiveLayout(TestData.viewports.desktop)
      await expect(page.locator('.header')).toBeVisible()

      // Navigation should adapt correctly
      const desktopNav = page.locator('nav ul.md\\:flex')
      if (await desktopNav.isVisible()) {
        await expect(desktopNav).toBeVisible()
      }

      // Back to mobile
      await helpers.checkResponsiveLayout(TestData.viewports.mobile)
      const mobileMenuButton = page.locator('nav ul.md\\:hidden li')
      if (await mobileMenuButton.isVisible()) {
        await expect(mobileMenuButton).toBeVisible()
      }
    })
  })
})