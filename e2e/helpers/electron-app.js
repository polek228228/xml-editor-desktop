/**
 * @file electron-app.js
 * @description Electron app helper for Playwright tests
 * @version 1.0.0
 */

const { _electron: electron } = require('@playwright/test');
const path = require('path');

/**
 * Launch Electron app for testing
 * @param {Object} options - Launch options
 * @returns {Promise<{app: ElectronApplication, window: Page}>}
 */
async function launchElectronApp(options = {}) {
  const electronPath = require('electron');
  const appPath = path.join(__dirname, '../../src/main/main.js');

  // Launch Electron app
  const app = await electron.launch({
    executablePath: electronPath,
    args: [appPath],
    env: {
      ...process.env,
      NODE_ENV: 'test',
      TEST_MODE: 'true',
    },
    ...options,
  });

  // Wait for the first window
  const window = await app.firstWindow();

  // Set viewport
  await window.setViewportSize({ width: 1280, height: 720 });

  // Wait for app to be ready
  await window.waitForLoadState('domcontentloaded');
  await window.waitForTimeout(1000); // Give app time to initialize

  return { app, window };
}

/**
 * Close Electron app
 * @param {ElectronApplication} app
 */
async function closeElectronApp(app) {
  if (app) {
    await app.close();
  }
}

/**
 * Get Electron app info
 * @param {ElectronApplication} app
 * @returns {Promise<Object>}
 */
async function getAppInfo(app) {
  const appPath = await app.evaluate(async ({ app }) => app.getAppPath());
  const version = await app.evaluate(async ({ app }) => app.getVersion());
  const name = await app.evaluate(async ({ app }) => app.getName());

  return { appPath, version, name };
}

/**
 * Wait for specific element to be visible
 * @param {Page} window
 * @param {string} selector
 * @param {number} timeout
 */
async function waitForElement(window, selector, timeout = 10000) {
  await window.waitForSelector(selector, {
    state: 'visible',
    timeout
  });
}

/**
 * Click element and wait
 * @param {Page} window
 * @param {string} selector
 */
async function clickAndWait(window, selector, waitTime = 500) {
  await window.click(selector);
  await window.waitForTimeout(waitTime);
}

/**
 * Fill input and wait
 * @param {Page} window
 * @param {string} selector
 * @param {string} value
 */
async function fillAndWait(window, selector, value, waitTime = 300) {
  await window.fill(selector, value);
  await window.waitForTimeout(waitTime);
}

/**
 * Take screenshot with name
 * @param {Page} window
 * @param {string} name
 */
async function takeScreenshot(window, name) {
  await window.screenshot({
    path: `test-results/screenshots/${name}.png`,
    fullPage: true
  });
}

/**
 * Check if element exists
 * @param {Page} window
 * @param {string} selector
 * @returns {Promise<boolean>}
 */
async function elementExists(window, selector) {
  try {
    const element = await window.$(selector);
    return element !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Get element text
 * @param {Page} window
 * @param {string} selector
 * @returns {Promise<string|null>}
 */
async function getElementText(window, selector) {
  try {
    return await window.textContent(selector);
  } catch (error) {
    return null;
  }
}

/**
 * Check if element is visible
 * @param {Page} window
 * @param {string} selector
 * @returns {Promise<boolean>}
 */
async function isElementVisible(window, selector) {
  try {
    return await window.isVisible(selector);
  } catch (error) {
    return false;
  }
}

/**
 * Press key
 * @param {Page} window
 * @param {string} key
 */
async function pressKey(window, key) {
  await window.keyboard.press(key);
  await window.waitForTimeout(200);
}

module.exports = {
  launchElectronApp,
  closeElectronApp,
  getAppInfo,
  waitForElement,
  clickAndWait,
  fillAndWait,
  takeScreenshot,
  elementExists,
  getElementText,
  isElementVisible,
  pressKey,
};
