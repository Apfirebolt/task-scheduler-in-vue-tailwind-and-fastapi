import { defineConfig, devices } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  globalSetup: path.resolve(__dirname, './tests/e2e/setup/global-setup.ts'),
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: './reports/playwright' }],
    ['json', { outputFile: './reports/playwright-report.json' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
      },
    },
  ],

  // webServer temporarily disabled for testing
  // webServer: {
  //   command: process.env.USE_DOCKER === 'true' ? 'cd .. && docker compose up -d --build' : 'npm run dev',
  //   port: process.env.USE_DOCKER === 'true' ? 8080 : 5173,
  //   url: process.env.USE_DOCKER === 'true' ? 'http://localhost:8080' : 'http://localhost:5173',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: process.env.USE_DOCKER === 'true' ? 180000 : 120000,
  // },

  outputDir: './test-results/e2e',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
})