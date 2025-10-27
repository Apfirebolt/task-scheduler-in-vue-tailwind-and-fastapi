import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/postcss';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.js',
        '**/*.config.ts',
        'dist/',
        'coverage/',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    reporters: ['verbose', 'json'],
    outputFile: {
      json: './test-results/vitest-report.json',
    },
  },
});