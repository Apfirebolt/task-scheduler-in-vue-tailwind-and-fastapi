module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:8080'],
      startServerCommand: 'docker compose up -d --build',
      startServerReadyPattern: 'Server ready',
      startServerReadyTimeout: 180000, // 3 minutes
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --headless',
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        }
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'categories:pwa': 'off',

        // Specific performance budgets
        'performance-budget:script-size': ['warn', { maxSize: 250000, units: 'bytes' }],
        'performance-budget:total-byte-weight': ['warn', { maxSize: 1500000, units: 'bytes' }],

        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000, units: 'milliseconds' }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500, units: 'milliseconds' }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300, units: 'milliseconds' }],

        // Accessibility
        'color-contrast': 'off', // May be addressed in separate accessibility audits
        'meta-viewport': 'error',
        'html-has-lang': 'error',
        'image-alt': 'warn',
        'link-name': 'error',

        // Best practices
        'uses-http2': 'off', // Nginx configuration may handle this
        'uses-text-compression': 'error',
        'uses-responsive-images': 'warn',
        'efficiency-image-size': 'warn',
        'document-title': 'error',
        'tap-targets': 'warn'
      }
    },
    upload: {
      target: 'temporary-public-storage',
      reportFilenamePattern: '%%PATHNAME%%-%%DATETIME%%-report.%%EXTENSION%%'
    }
  }
};