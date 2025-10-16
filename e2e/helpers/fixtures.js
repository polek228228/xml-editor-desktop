/**
 * @file fixtures.js
 * @description Playwright fixtures for Electron tests
 * @version 1.0.0
 */

const playwrightTest = require('@playwright/test');
const base = playwrightTest.test;
const electronAppHelpers = require('./electron-app');
const launchElectronApp = electronAppHelpers.launchElectronApp;
const closeElectronApp = electronAppHelpers.closeElectronApp;

/**
 * Extended test fixture with Electron app
 */
const test = base.extend({
  /**
   * Electron app fixture
   * Automatically launches app before each test and closes after
   */
  electronApp: async ({}, use) => {
    const result = await launchElectronApp();
    const app = result.app;
    const window = result.window;

    // Provide app and window to test
    await use({ app: app, window: window });

    // Wait for any pending operations to complete before cleanup
    await window.waitForTimeout(500);

    // Cleanup after test
    await closeElectronApp(app);
  },
});

module.exports = { test: test };
