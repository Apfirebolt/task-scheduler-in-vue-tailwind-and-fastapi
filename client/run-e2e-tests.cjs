#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read test configuration
const testConfig = JSON.parse(fs.readFileSync('./tests/e2e/config/test-config.json', 'utf8'));

// Parse command line arguments
const args = process.argv.slice(2);
const command = {
  suite: 'all',
  environment: 'development',
  headed: false,
  debug: false,
  update: false,
  grep: null,
  project: null
};

// Parse arguments
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  switch (arg) {
    case '--suite':
      command.suite = args[++i];
      break;
    case '--env':
    case '--environment':
      command.environment = args[++i];
      break;
    case '--headed':
      command.headed = true;
      break;
    case '--debug':
      command.debug = true;
      break;
    case '--update':
      command.update = true;
      break;
    case '--grep':
      command.grep = args[++i];
      break;
    case '--project':
      command.project = args[++i];
      break;
    case '--help':
    case '-h':
      showHelp();
      process.exit(0);
      break;
    default:
      if (arg.startsWith('--')) {
        console.error(`Unknown option: ${arg}`);
        console.error('Use --help for available options');
        process.exit(1);
      }
  }
}

function showHelp() {
  console.log(`
E2E Test Runner for Task Scheduler

Usage: node run-e2e-tests.js [options]

Options:
  --suite <name>        Test suite to run (smoke, regression, accessibility, responsive, error-handling, all)
  --env <environment>    Test environment (development, staging, production)
  --headed              Run tests in headed mode (show browser)
  --debug               Run tests in debug mode
  --update              Update snapshots and baselines
  --grep <pattern>      Run tests matching the pattern
  --project <name>      Run tests for specific project (chromium, firefox, webkit, Mobile Chrome, Mobile Safari)
  --help, -h            Show this help message

Examples:
  node run-e2e-tests.js                           # Run all tests in development
  node run-e2e-tests.js --suite smoke             # Run smoke tests
  node run-e2e-tests.js --env staging --headed    # Run staging tests with browser visible
  node run-e2e-tests.js --grep "should create"    # Run tests matching pattern
  node run-e2e-tests.js --project chromium        # Run tests only in Chrome
`);
}

function buildPlaywrightCommand() {
  const config = testConfig.environments[command.environment];
  const suite = testConfig.testSuites[command.suite];

  if (!suite) {
    console.error(`Unknown test suite: ${command.suite}`);
    console.error('Available suites:', Object.keys(testConfig.testSuites).join(', '));
    process.exit(1);
  }

  if (!config) {
    console.error(`Unknown environment: ${command.environment}`);
    console.error('Available environments:', Object.keys(testConfig.environments).join(', '));
    process.exit(1);
  }

  // Build npx playwright test command
  let playwrightCommand = 'npx playwright test';

  // Add test files
  if (Array.isArray(suite)) {
    if (command.suite === 'all') {
      playwrightCommand += ' tests/e2e/';
    } else {
      playwrightCommand += ' ' + suite.map(file => `tests/e2e/${file}`).join(' ');
    }
  }

  // Add configuration options
  const configArgs = [
    `--timeout=${config.timeout}`,
    `--retries=${config.retries}`,
    `--workers=${config.workers}`
  ];

  // Add command line options
  if (command.headed) {
    configArgs.push('--headed');
  }

  if (command.debug) {
    configArgs.push('--debug');
  }

  if (command.update) {
    configArgs.push('--update-snapshots');
  }

  if (command.grep) {
    configArgs.push(`--grep="${command.grep}"`);
  }

  if (command.project) {
    configArgs.push(`--project="${command.project}"`);
  }

  // Add environment variables
  const envVars = {
    ...process.env,
    BASE_URL: config.baseUrl,
    TEST_ENVIRONMENT: command.environment,
    TEST_SUITE: command.suite,
    CI: process.env.CI || 'false'
  };

  // Add Docker environment if needed
  if (command.environment !== 'development') {
    envVars.USE_DOCKER = 'true';
  }

  return {
    command: playwrightCommand,
    args: configArgs,
    env: envVars
  };
}

function runTests() {
  const { command: playwrightCommand, args: configArgs, env: envVars } = buildPlaywrightCommand();

  console.log(`🚀 Running E2E tests...`);
  console.log(`📋 Suite: ${command.suite}`);
  console.log(`🌍 Environment: ${command.environment}`);
  console.log(`🔗 Base URL: ${envVars.BASE_URL}`);
  console.log(`📝 Command: ${playwrightCommand} ${configArgs.join(' ')}`);
  console.log('');

  // Set up environment variables
  Object.entries(envVars).forEach(([key, value]) => {
    process.env[key] = value;
  });

  // Ensure test results directories exist
  const dirs = [
    'test-results',
    'test-results/screenshots',
    'test-results/videos',
    'test-results/traces',
    'playwright-report'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Run Playwright tests
  const child = spawn(playwrightCommand, configArgs, {
    stdio: 'inherit',
    shell: true,
    env: envVars
  });

  child.on('close', (code) => {
    console.log('');
    if (code === 0) {
      console.log('✅ All tests passed!');

      // Show report location if HTML reports are enabled
      if (testConfig.reporting.html.enabled) {
        console.log(`📊 HTML report: file://${path.resolve(testConfig.reporting.html.outputFolder, 'index.html')}`);
      }
    } else {
      console.log(`❌ Tests failed with exit code ${code}`);

      // Show troubleshooting tips
      console.log('');
      console.log('💡 Troubleshooting tips:');
      console.log('   • Run with --headed to see the browser');
      console.log('   • Run with --debug to pause execution');
      console.log('   • Check test results in test-results/ directory');
      console.log('   • Ensure the application is running at the specified URL');
    }

    process.exit(code);
  });

  child.on('error', (error) => {
    console.error('❌ Failed to start tests:', error.message);
    console.error('');
    console.log('💡 Make sure Playwright is installed:');
    console.log('   npm install @playwright/test');
    console.log('   npx playwright install');

    process.exit(1);
  });
}

// Check if Playwright is installed
function checkPlaywrightInstallation() {
  try {
    require.resolve('@playwright/test');
  } catch (error) {
    console.error('❌ Playwright not found. Please install it first:');
    console.error('   npm install @playwright/test');
    console.error('   npx playwright install');
    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  checkPlaywrightInstallation();
  runTests();
}

module.exports = { buildPlaywrightCommand, testConfig };