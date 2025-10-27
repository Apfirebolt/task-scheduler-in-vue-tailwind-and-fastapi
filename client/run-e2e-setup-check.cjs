#!/usr/bin/env node

/**
 * Simple setup verification script for Playwright E2E testing
 * This script checks the setup without requiring browser installation
 */

const fs = require('fs')
const path = require('path')

console.log('🚀 Playwright E2E Setup Verification\n')

// Check if we're in the correct directory
const packageJsonPath = path.join(process.cwd(), 'package.json')
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Error: package.json not found. Please run this from the client directory.')
  process.exit(1)
}

// Check package.json scripts
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
const requiredScripts = [
  'test:e2e',
  'test:e2e:ui',
  'test:e2e:install',
  'test:e2e:debug',
  'test:e2e:headed'
]

console.log('📦 Checking package.json scripts...')
const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script])
if (missingScripts.length > 0) {
  console.error('❌ Missing scripts:', missingScripts.join(', '))
  process.exit(1)
}
console.log('✅ All required scripts are present')

// Check Playwright dependency
if (!packageJson.devDependencies['@playwright/test']) {
  console.error('❌ @playwright/test dependency not found')
  process.exit(1)
}
console.log('✅ Playwright dependency found')

// Check configuration file
const configPath = path.join(process.cwd(), 'playwright.config.ts')
if (!fs.existsSync(configPath)) {
  console.error('❌ playwright.config.ts not found')
  process.exit(1)
}
console.log('✅ Playwright config file found')

// Check test directory structure
const testDirs = [
  'tests/e2e',
  'tests/e2e/helpers',
  'tests/e2e/setup'
]

console.log('\n📁 Checking test directory structure...')
testDirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir)
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${dir}/ exists`)
  } else {
    console.log(`⚠️  ${dir}/ not found (will be created if needed)`)
  }
})

// Check for existing test files
const testFiles = [
  'tests/e2e/setup.spec.ts',
  'tests/e2e/helpers/page-helpers.ts',
  'tests/e2e/helpers/test-data.ts',
  'tests/e2e/task-management.spec.ts'
]

console.log('\n📄 Checking test files...')
testFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file)
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file} exists`)
  } else {
    console.log(`⚠️  ${file} not found`)
  }
})

// Check Docker setup
const dockerComposePath = path.join(process.cwd(), '..', 'docker compose.yaml')
if (fs.existsSync(dockerComposePath)) {
  console.log('\n🐳 Docker setup found at ../docker compose.yaml')
  console.log('✅ You can run Docker-based tests with: npm run test:e2e:docker')
} else {
  console.log('\n⚠️  Docker setup not found. You can only run local dev server tests.')
}

// Node modules check
const nodeModulesPath = path.join(process.cwd(), 'node_modules', '@playwright')
if (fs.existsSync(nodeModulesPath)) {
  console.log('\n✅ Playwright node modules are installed')
} else {
  console.log('\n⚠️  Playwright node modules not found. Run: npm install')
}

// Browser installation check (basic)
const cachePath = path.join(process.cwd(), '..', '..', '.cache', 'ms-playwright')
console.log('\n🌐 Browser Installation:')
if (fs.existsSync(cachePath)) {
  console.log('✅ Playwright browser cache directory exists')
  try {
    const browsers = fs.readdirSync(cachePath)
    console.log(`✅ Found browsers: ${browsers.join(', ')}`)
  } catch (error) {
    console.log('⚠️  Cannot read browser cache contents')
  }
} else {
  console.log('⚠️  Playwright browsers not installed')
  console.log('   To install browsers, run:')
  console.log('   npm run test:e2e:install')
  console.log('   Or manually: npx playwright install chromium firefox webkit')
}

console.log('\n📋 Quick Start Commands:')
console.log('  Install browsers:      npm run test:e2e:install')
console.log('  Run all tests:         npm run test:e2e')
console.log('  Run with UI:           npm run test:e2e:ui')
console.log('  Run with visible:      npm run test:e2e:headed')
console.log('  Run Docker tests:      npm run test:e2e:docker')
console.log('  View test report:      npm run test:e2e:report')
console.log('  Run specific browser:  npm run test:e2e:chrome')

console.log('\n📚 Documentation: docs/E2E_TESTING.md')
console.log('\n✨ Setup verification complete!')