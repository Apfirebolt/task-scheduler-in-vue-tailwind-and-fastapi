import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Playwright global setup...')

  // Install browsers if not already installed
  const { execSync } = require('child_process')
  try {
    console.log('📦 Checking browser installation...')
    execSync('npx playwright install --with-deps', { stdio: 'inherit' })
    console.log('✅ Browsers installed successfully')
  } catch (error) {
    console.warn('⚠️ Browser installation failed:', error)
  }

  // If using Docker, wait for services to be ready
  if (process.env.USE_DOCKER === 'true') {
    console.log('🐳 Waiting for Docker services...')
    await waitForDockerServices()
  }

  console.log('✅ Global setup completed')
}

async function waitForDockerServices() {
  const { chromium } = require('playwright')
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  const maxRetries = 30
  const retryDelay = 2000

  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`🔄 Checking Docker services (attempt ${i + 1}/${maxRetries})...`)

      // Check if frontend is ready
      const frontendResponse = await page.goto('http://localhost:8080', {
        timeout: 5000,
        waitUntil: 'domcontentloaded'
      })

      if (frontendResponse && frontendResponse.ok()) {
        console.log('✅ Frontend service is ready')

        // Check if backend API is ready
        const apiResponse = await page.evaluate(async () => {
          try {
            const response = await fetch('/api/tasks')
            return response.ok || response.status < 500
          } catch {
            return false
          }
        })

        if (apiResponse) {
          console.log('✅ Backend API service is ready')
          break
        } else {
          console.log('⚠️ Backend API not ready yet, retrying...')
        }
      }
    } catch (error) {
      console.log(`⚠️ Services not ready yet, retrying... (${error.message})`)
    }

    if (i === maxRetries - 1) {
      console.error('❌ Docker services failed to start within timeout')
      throw new Error('Docker services failed to start')
    }

    await new Promise(resolve => setTimeout(resolve, retryDelay))
  }

  await browser.close()
}

export default globalSetup