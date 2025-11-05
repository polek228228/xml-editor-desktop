/**
 * @file playwright.config.js
 * @description Playwright configuration for Electron E2E testing
 * @version 1.0.0
 * @date 2025-10-06
 */

const { defineConfig } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  // Test directory
  testDir: './e2e',

  // Timeout per test (5 minutes for Electron startup)
  timeout: 5 * 60 * 1000,

  // Global setup/teardown timeout
  globalTimeout: 10 * 60 * 1000,

  // Expect timeout
  expect: {
    timeout: 10000,
  },

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Number of parallel workers
  workers: 1, // Electron apps should run sequentially

  // Reporter to use
  reporter: [
    // Не открывать/не держать сервер отчёта после прогонов
    ['html', { outputFolder: 'test-results/html-report', open: 'never' }],
    ['json', { outputFile: 'test-results/test-results.json' }],
    ['list'],
  ],

  // Shared settings for all tests
  use: {
    // Base URL for API requests
    baseURL: 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Viewport
    viewport: { width: 1280, height: 720 },
  },

  // Folder for test artifacts such as screenshots, videos, traces, etc.
  outputDir: 'test-results/artifacts',

  // Projects (different test suites)
  projects: [
    {
      name: 'electron-e2e',
      testMatch: /.*\.e2e\.js/,
    },
  ],
});
