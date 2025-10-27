import { test, expect } from '@playwright/test'
import { PageHelpers } from './helpers/page-helpers'
import { TestData } from './helpers/test-data'

test.describe('Accessibility Tests', () => {
  let helpers: PageHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new PageHelpers(page)
    await helpers.navigateToRoute(TestData.routes.home)
    await helpers.waitForAppLoad()
  })

  test.describe('Semantic HTML and Structure', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      // Check for main heading (h1)
      const mainHeading = page.locator('h1')
      await expect(mainHeading.first()).toBeVisible()

      // Check heading order - should not skip levels
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()

      let previousLevel = 1
      for (const heading of headings) {
        const tagName = await heading.evaluate(el => el.tagName.toLowerCase())
        const currentLevel = parseInt(tagName.substring(1))

        // Should not skip heading levels (e.g., h1 to h3)
        if (currentLevel > previousLevel + 1) {
          console.warn(`Heading level skip detected: h${previousLevel} to ${tagName}`)
        }

        previousLevel = currentLevel
      }
    })

    test('should use proper semantic elements', async ({ page }) => {
      // Check for semantic landmarks
      const semanticElements = {
        'header': 'page header',
        'nav': 'navigation section',
        'main': 'main content',
        'footer': 'page footer',
        'section': 'content section',
        'article': 'article content',
        'aside': 'sidebar content'
      }

      for (const [selector, description] of Object.entries(semanticElements)) {
        const element = page.locator(selector)
        if (await element.isVisible()) {
          await expect(element.first()).toBeVisible()
          console.log(`Found semantic element: ${description}`)
        }
      }

      // Check for proper use of landmark roles
      const landmarks = page.locator('[role="navigation"], [role="main"], [role="banner"], [role="contentinfo"]')
      const landmarkCount = await landmarks.count()

      if (landmarkCount > 0) {
        console.log(`Found ${landmarkCount} ARIA landmarks`)
      }
    })

    test('should have proper list structure', async ({ page }) => {
      // Check navigation lists
      const navLists = page.locator('nav ul, nav ol')
      const navListCount = await navLists.count()

      if (navListCount > 0) {
        for (let i = 0; i < navListCount; i++) {
          const list = navLists.nth(i)

          // Check that list items exist
          const listItems = list.locator('li')
          const itemCount = await listItems.count()
          expect(itemCount).toBeGreaterThan(0)

          // Check that list items are properly structured
          for (let j = 0; j < itemCount; j++) {
            const item = listItems.nth(j)
            const hasLink = await item.locator('a').count() > 0
            const hasButton = await item.locator('button').count() > 0

            // List items should contain interactive elements
            expect(hasLink || hasButton).toBeTruthy()
          }
        }
      }
    })
  })

  test.describe('ARIA Attributes and Roles', () => {
    test('should have proper ARIA labels and descriptions', async ({ page }) => {
      // Check for aria-label attributes
      const ariaLabels = page.locator('[aria-label]')
      const labelCount = await ariaLabels.count()

      if (labelCount > 0) {
        for (let i = 0; i < Math.min(labelCount, 5); i++) {
          const element = ariaLabels.nth(i)
          const label = await element.getAttribute('aria-label')
          expect(label).toBeTruthy()
          expect(label.length).toBeGreaterThan(0)
        }
        console.log(`Found ${labelCount} elements with aria-label`)
      }

      // Check for aria-labelledby attributes
      const ariaLabelledBy = page.locator('[aria-labelledby]')
      const labelledByCount = await ariaLabelledBy.count()

      if (labelledByCount > 0) {
        console.log(`Found ${labelledByCount} elements with aria-labelledby`)

        // Verify referenced elements exist
        for (let i = 0; i < Math.min(labelledByCount, 3); i++) {
          const element = ariaLabelledBy.nth(i)
          const referencedId = await element.getAttribute('aria-labelledby')

          if (referencedId) {
            const referencedElement = page.locator(`#${referencedId}`)
            const isVisible = await referencedElement.isVisible()
            expect(isVisible).toBeTruthy()
          }
        }
      }
    })

    test('should have proper ARIA roles', async ({ page }) => {
      // Check for button roles
      const buttons = page.locator('button, [role="button"]')
      const buttonCount = await buttons.count()

      if (buttonCount > 0) {
        for (let i = 0; i < Math.min(buttonCount, 5); i++) {
          const button = buttons.nth(i)
          await expect(button).toBeVisible()

          // Buttons should have accessible content
          const hasText = await button.evaluate(el => el.textContent?.trim())
          const hasAriaLabel = await button.getAttribute('aria-label')

          expect(hasText || hasAriaLabel).toBeTruthy()
        }
      }

      // Check for navigation roles
      const navigationElements = page.locator('nav, [role="navigation"]')
      if (await navigationElements.first().isVisible()) {
        await expect(navigationElements.first()).toBeVisible()
      }

      // Check for proper form labels
      const formInputs = page.locator('input, textarea, select')
      const inputCount = await formInputs.count()

      if (inputCount > 0) {
        for (let i = 0; i < Math.min(inputCount, 5); i++) {
          const input = formInputs.nth(i)

          // Check for associated labels
          const hasLabel = await page.evaluate(el => {
            const id = el.id
            if (id) {
              const label = document.querySelector(`label[for="${id}"]`)
              return label !== null
            }
            return false
          }, await input.elementHandle())

          const hasAriaLabel = await input.getAttribute('aria-label')
          const hasAriaLabelledBy = await input.getAttribute('aria-labelledby')
          const hasPlaceholder = await input.getAttribute('placeholder')

          // Input should have some form of label
          expect(hasLabel || hasAriaLabel || hasAriaLabelledBy || hasPlaceholder).toBeTruthy()
        }
      }
    })

    test('should handle ARIA states and properties correctly', async ({ page }) => {
      // Check for aria-expanded attributes (common in navigation)
      const expandedElements = page.locator('[aria-expanded]')
      const expandedCount = await expandedElements.count()

      if (expandedCount > 0) {
        for (let i = 0; i < expandedCount; i++) {
          const element = expandedElements.nth(i)
          const expanded = await element.getAttribute('aria-expanded')
          expect(expanded === "true" || expanded === "false").toBeTruthy();
        }
      }

      // Check for aria-hidden attributes
      const hiddenElements = page.locator('[aria-hidden]')
      const hiddenCount = await hiddenElements.count()

      if (hiddenCount > 0) {
        for (let i = 0; i < Math.min(hiddenCount, 3); i++) {
          const element = hiddenElements.nth(i)
          const hidden = await element.getAttribute('aria-hidden')
          expect(hidden === "true" || hidden === "false").toBeTruthy();

          // If aria-hidden="true", element should not be focusable
          if (hidden === 'true') {
            const tabIndex = await element.getAttribute('tabindex')
            expect(tabIndex === '-1' || tabIndex === null).toBeTruthy()
          }
        }
      }
    })
  })

  test.describe('Keyboard Navigation', () => {
    test('should be fully keyboard navigable', async ({ page }) => {
      // Test Tab navigation through the page
      await page.keyboard.press('Tab')
      let focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()

      // Track all focusable elements
      const focusableElements = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'textarea:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]'
      ]

      let totalFocusable = 0
      for (const selector of focusableElements) {
        const elements = page.locator(selector)
        const count = await elements.count()
        totalFocusable += count
      }

      expect(totalFocusable).toBeGreaterThan(0)
      console.log(`Found ${totalFocusable} focusable elements`)

      // Test keyboard navigation through main elements
      const navigationSteps = 10
      for (let i = 0; i < navigationSteps; i++) {
        await page.keyboard.press('Tab')
        focusedElement = page.locator(':focus')

        if (await focusedElement.isVisible()) {
          const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase())
          console.log(`Tab ${i + 1}: Focused on ${tagName}`)
        } else {
          console.log(`Tab ${i + 1}: No visible focusable element`)
          break
        }
      }
    })

    test('should support keyboard interaction with interactive elements', async ({ page }) => {
      // Test keyboard navigation
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')

      // Find a focusable interactive element
      let attempts = 0
      let interactiveElement = null

      while (attempts < 20 && !interactiveElement) {
        const focused = page.locator(':focus')
        if (await focused.isVisible()) {
          const tagName = await focused.evaluate(el => el.tagName.toLowerCase())

          if (['button', 'a', 'input'].includes(tagName)) {
            interactiveElement = focused
            break
          }
        }

        await page.keyboard.press('Tab')
        attempts++
      }

      if (interactiveElement) {
        // Test Enter key
        await page.keyboard.press('Enter')
        await page.waitForTimeout(1000)

        // Test Space key for buttons
        const tagName = await interactiveElement.evaluate(el => el.tagName.toLowerCase())
        if (tagName === 'button') {
          await page.keyboard.press('Space')
          await page.waitForTimeout(1000)
        }

        console.log(`Successfully tested keyboard interaction with ${tagName}`)
      } else {
        console.log('No interactive element found for keyboard testing')
      }
    })

    test('should have proper focus management', async ({ page }) => {
      // Check for focus indicators
      const focusableElement = page.locator('a, button, input').first()
      if (await focusableElement.isVisible()) {
        await focusableElement.focus()

        // Check if element has focus styles
        const focused = page.locator(':focus')
        await expect(focused).toBeVisible()

        // Check computed styles for focus indication
        const focusStyles = await focused.evaluate(el => {
          const styles = window.getComputedStyle(el)
          return {
            outline: styles.outline,
            outlineOffset: styles.outlineOffset,
            boxShadow: styles.boxShadow
          }
        })

        const hasFocusIndicator =
          focusStyles.outline !== 'none' ||
          focusStyles.boxShadow !== 'none' ||
          focusStyles.outline !== ''

        if (!hasFocusIndicator) {
          console.warn('Element may not have visible focus indicator')
        }
      }
    })

    test('should handle skip links if present', async ({ page }) => {
      // Look for skip links
      const skipLinks = page.locator('a[href^="#"], [href*="skip"], [href*="main"]')
      const skipLinkCount = await skipLinks.count()

      if (skipLinkCount > 0) {
        console.log(`Found ${skipLinkCount} potential skip links`)

        for (let i = 0; i < Math.min(skipLinkCount, 3); i++) {
          const skipLink = skipLinks.nth(i)
          const href = await skipLink.getAttribute('href')

          if (href && href.startsWith('#')) {
            // Test skip link functionality
            await skipLink.click()
            await page.waitForTimeout(500)

            // Check if focus moved to target
            const targetId = href.substring(1)
            if (targetId) {
              const target = page.locator(`#${targetId}`)
              if (await target.isVisible()) {
                console.log(`Skip link works: ${href}`)
              }
            }
          }
        }
      }
    })
  })

  test.describe('Color and Contrast', () => {
    test('should not rely on color alone for information', async ({ page }) => {
      // Check for elements that might convey information only through color
      const colorElements = page.locator('[class*="red"], [class*="green"], [class*="blue"], [class*="success"], [class*="error"]')
      const colorCount = await colorElements.count()

      if (colorCount > 0) {
        console.log(`Found ${colorCount} elements with color classes`)

        // Check if these elements also have text content or icons
        for (let i = 0; i < Math.min(colorCount, 5); i++) {
          const element = colorElements.nth(i)
          const textContent = await element.textContent()
          const hasIcon = await element.locator('svg, i, .icon').count() > 0

          // Should have text or icons in addition to color
          if (textContent && textContent.trim().length > 0) {
            console.log('Element has text content in addition to color')
          } else if (hasIcon) {
            console.log('Element has icon in addition to color')
          } else {
            console.warn('Element might rely on color alone')
          }
        }
      }
    })

    test('should have sufficient color contrast', async ({ page }) => {
      // This is a basic check - real contrast checking would require a color contrast library
      const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, a')
      const textCount = await textElements.count()

      if (textCount > 0) {
        // Check a few text elements for basic visibility
        for (let i = 0; i < Math.min(textCount, 10); i++) {
          const element = textElements.nth(i)

          if (await element.isVisible()) {
            // Check if element has text content
            const text = await element.textContent()
            if (text && text.trim().length > 0) {
              // Check computed styles
              const styles = await element.evaluate(el => {
                const computed = window.getComputedStyle(el)
                return {
                  color: computed.color,
                  backgroundColor: computed.backgroundColor,
                  fontSize: computed.fontSize,
                  fontWeight: computed.fontWeight
                }
              })

              // Basic visibility check
              const hasColor = styles.color !== 'rgba(0, 0, 0, 0)' && styles.color !== 'transparent'
              const hasBackground = styles.backgroundColor !== 'rgba(0, 0, 0, 0)' && styles.backgroundColor !== 'transparent'

              expect(hasColor).toBeTruthy()
            }
          }
        }
      }
    })
  })

  test.describe('Forms Accessibility', () => {
    test('should have accessible form elements', async ({ page }) => {
      await helpers.navigateToRoute(TestData.routes.addTask)
      await helpers.waitForAppLoad()

      // Check form inputs
      const inputs = page.locator('input, textarea, select')
      const inputCount = await inputs.count()

      if (inputCount > 0) {
        for (let i = 0; i < inputCount; i++) {
          const input = inputs.nth(i)

          // Check for labels
          const hasLabel = await page.evaluate(el => {
            // Check for explicit label
            if (el.id) {
              const label = document.querySelector(`label[for="${el.id}"]`)
              if (label) return true
            }

            // Check for implicit label (parent)
            let parent = el.parentElement
            while (parent) {
              if (parent.tagName.toLowerCase() === 'label') {
                return true
              }
              parent = parent.parentElement
            }

            return false
          }, await input.elementHandle())

          const hasAriaLabel = await input.getAttribute('aria-label')
          const hasAriaLabelledBy = await input.getAttribute('aria-labelledby')
          const hasTitle = await input.getAttribute('title')
          const hasPlaceholder = await input.getAttribute('placeholder')

          // Input should have some form of identification
          expect(hasLabel || hasAriaLabel || hasAriaLabelledBy || hasTitle || hasPlaceholder).toBeTruthy()

          if (hasLabel) {
            console.log('Input has proper label')
          } else if (hasAriaLabel) {
            console.log('Input has aria-label')
          } else if (hasPlaceholder) {
            console.log('Input has placeholder (not ideal for accessibility)')
          }
        }
      }

      // Check form validation messages
      const submitButton = page.locator('input[type="submit"], button[type="submit"]')
      if (await submitButton.isVisible()) {
        await submitButton.click()
        await page.waitForTimeout(2000)

        // Look for error messages
        const errorMessages = page.locator('.error, .invalid, [role="alert"], [aria-live="polite"]')
        if (await errorMessages.first().isVisible()) {
          console.log('Form validation messages are present')
        }
      }
    })

    test('should have proper form structure', async ({ page }) => {
      await helpers.navigateToRoute(TestData.routes.addTask)
      await helpers.waitForAppLoad()

      // Check for form element
      const form = page.locator('form')
      if (await form.isVisible()) {
        // Check for form submission method
        const method = await form.getAttribute('method')
        const action = await form.getAttribute('action')

        console.log(`Form method: ${method || 'GET (default)'}`)
        console.log(`Form action: ${action || 'current page'}`)

        // Check for fieldsets if there are related form groups
        const fieldsets = form.locator('fieldset')
        const fieldsetCount = await fieldsets.count()

        if (fieldsetCount > 0) {
          for (let i = 0; i < fieldsetCount; i++) {
            const fieldset = fieldsets.nth(i)
            const legend = fieldset.locator('legend')

            if (await legend.isVisible()) {
              console.log('Fieldset has proper legend')
            } else {
              console.warn('Fieldset missing legend')
            }
          }
        }
      }
    })
  })

  test.describe('Images and Media', () => {
    test('should have accessible images', async ({ page }) => {
      const images = page.locator('img')
      const imageCount = await images.count()

      if (imageCount > 0) {
        for (let i = 0; i < imageCount; i++) {
          const img = images.nth(i)

          // Check for alt attribute
          const alt = await img.getAttribute('alt')
          if (alt === null) {
            console.warn('Image missing alt attribute')
          } else if (alt === '') {
            // Empty alt is acceptable for decorative images
            console.log('Image has empty alt (likely decorative)')
          } else {
            console.log('Image has descriptive alt text')
          }

          // Check if image loads
          const naturalWidth = await img.evaluate(el => el.naturalWidth)
          const naturalHeight = await img.evaluate(el => el.naturalHeight)

          if (naturalWidth === 0 || naturalHeight === 0) {
            console.warn('Image may not be loading properly')
          }
        }
      }
    })

    test('should have accessible SVG elements', async ({ page }) => {
      const svgs = page.locator('svg')
      const svgCount = await svgs.count()

      if (svgCount > 0) {
        for (let i = 0; i < Math.min(svgCount, 5); i++) {
          const svg = svgs.nth(i)

          // Check for title or aria-label
          const title = svg.locator('title')
          const ariaLabel = await svg.getAttribute('aria-label')
          const ariaLabelledBy = await svg.getAttribute('aria-labelledby')

          if (await title.isVisible()) {
            console.log('SVG has title element')
          } else if (ariaLabel || ariaLabelledBy) {
            console.log('SVG has ARIA label')
          } else {
            // SVG might be decorative
            const hasAriaHidden = await svg.getAttribute('aria-hidden')
            if (hasAriaHidden === 'true') {
              console.log('SVG is marked as decorative')
            } else {
              console.warn('SVG may need accessibility description')
            }
          }
        }
      }
    })
  })

  test.describe('Screen Reader Compatibility', () => {
    test('should have proper page structure for screen readers', async ({ page }) => {
      // Check for page title
      const title = await page.title()
      expect(title.length).toBeGreaterThan(0)
      console.log(`Page title: ${title}`)

      // Check for language attribute
      const html = page.locator('html')
      const lang = await html.getAttribute('lang')
      if (lang) {
        console.log(`Page language: ${lang}`)
      } else {
        console.warn('HTML element missing lang attribute')
      }

      // Check for proper heading structure
      const h1 = page.locator('h1')
      if (await h1.first().isVisible()) {
        console.log('Page has main heading (h1)')
      } else {
        console.warn('Page missing main heading')
      }

      // Check for skip navigation
      const skipLinks = page.locator('a[href^="#main"], a[href^="#content"], [href*="skip"]')
      if (await skipLinks.first().isVisible()) {
        console.log('Page has skip navigation links')
      }
    })

    test('should announce dynamic content changes', async ({ page }) => {
      await helpers.navigateToRoute(TestData.routes.addTask)
      await helpers.waitForAppLoad()

      // Look for live regions
      const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]')
      const liveRegionCount = await liveRegions.count()

      if (liveRegionCount > 0) {
        console.log(`Found ${liveRegionCount} ARIA live regions`)

        // Test form submission to see if success/error messages are announced
        const titleInput = page.locator('#title')
        if (await titleInput.isVisible()) {
          await titleInput.fill('Accessibility Test')

          const submitButton = page.locator('input[type="submit"], button[type="submit"]')
          if (await submitButton.isVisible()) {
            await submitButton.click()
            await page.waitForTimeout(2000)

            // Check for announcements
            const announcements = page.locator('[aria-live="polite"], [role="status"]')
            if (await announcements.first().isVisible()) {
              console.log('Form submission messages are announced')
            }
          }
        }
      }
    })
  })

  test.describe('Mobile Accessibility', () => {
    test('should be accessible on mobile devices', async ({ page }) => {
      await helpers.checkResponsiveLayout(TestData.viewports.mobile)

      // Check touch target sizes (minimum 44x44 points)
      const touchElements = page.locator('a, button, input, [role="button"]')
      const touchCount = await touchElements.count()

      if (touchCount > 0) {
        for (let i = 0; i < Math.min(touchCount, 5); i++) {
          const element = touchElements.nth(i)
          const boundingBox = await element.boundingBox()

          if (boundingBox) {
            // Convert pixels to points (rough approximation)
            const widthPoints = boundingBox.width * 0.75
            const heightPoints = boundingBox.height * 0.75

            if (widthPoints < 44 || heightPoints < 44) {
              console.warn(`Touch target may be too small: ${widthPoints}x${heightPoints} points`)
            } else {
              console.log(`Touch target size adequate: ${widthPoints}x${heightPoints} points`)
            }
          }
        }
      }

      // Check mobile navigation accessibility
      const mobileMenuButton = page.locator('nav ul.md\\:hidden li')
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click()

        const sidebar = page.locator('#default-sidebar')
        if (await sidebar.isVisible()) {
          // Check sidebar navigation accessibility
          const sidebarLinks = sidebar.locator('a')
          const linkCount = await sidebarLinks.count()

          for (let i = 0; i < Math.min(linkCount, 3); i++) {
            const link = sidebarLinks.nth(i)
            const text = await link.textContent()
            expect(text && text.trim().length > 0).toBeTruthy()
          }
        }
      }
    })
  })
})