import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup-tests.js'],
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx,vue}'],
    exclude: [
      'node_modules',
      'dist',
      'playwright',
      'coverage',
      'tests/e2e/**' // Exclude e2e tests from unit test runs
    ],
    coverage: {
      provider: 'v8', // Use v8 provider for better coverage
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.test.{js,ts}',
        '**/*.spec.{js,ts}',
        '**/*.config.{js,ts}',
        'dist/',
        'coverage/',
      ],
      thresholds: {
        global: {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100
        },
        // Per-file thresholds for critical components
        './src/pages/': {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100
        },
        './src/components/': {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100
        }
      }
    },
    maxWorkers: 4,
    minWorkers: 1,
    testTimeout: 10000,
    hookTimeout: 10000,
    slowTestThreshold: 5000,
    isolate: true,
    mockReset: true,
    unstubGlobals: false,
    clearMocks: true,
    restoreMocks: true,
    // Additional watch options for development
    watchExclude: [
      'node_modules/**',
      'dist/**',
      'coverage/**'
    ],
    // Enable transform mode for Vue SFC files
    transformMode: {
      web: [/\.[jt]sx?$/],
      ssr: [/\.vue$/]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '~': resolve(__dirname, 'src'),
      '@@': resolve(__dirname, 'src')
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
  // Optimize dependencies for testing
  optimizeDeps: {
    include: ['vue', 'vue-router', '@vue/test-utils']
  }
})