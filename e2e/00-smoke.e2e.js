/**
 * @file 00-smoke.e2e.js
 * @description Smoke tests - verify app launches and basic UI is present
 * @version 1.0.0
 */

const fixtures = require('./helpers/fixtures');
const test = fixtures.test;
const playwrightTest = require('@playwright/test');
const expect = playwrightTest.expect;
const electronAppHelpers = require('./helpers/electron-app');
const waitForElement = electronAppHelpers.waitForElement;
const takeScreenshot = electronAppHelpers.takeScreenshot;
const isElementVisible = electronAppHelpers.isElementVisible;
const getAppInfo = electronAppHelpers.getAppInfo;

test.describe('Smoke Tests - App Launch', () => {
  test('should launch Electron app successfully', async ({ electronApp }) => {
    const { app, window } = electronApp;

    // App should be defined
    expect(app).toBeDefined();
    expect(window).toBeDefined();

    // Get app info
    const appInfo = await getAppInfo(app);
    console.log('App Info:', appInfo);

    // Note: app.getName() returns 'Electron' in dev mode
    expect(appInfo.name).toBe('Electron');
  });

  test('should display main window with correct title', async ({ electronApp }) => {
    const { window } = electronApp;

    // Check window title
    const title = await window.title();
    expect(title).toContain('XML Editor Desktop');
  });

  test('should display App Navigation bar', async ({ electronApp }) => {
    const { window } = electronApp;

    // Wait for App Nav to load
    await waitForElement(window, '.app-nav');

    // Check App Nav is visible
    const appNavVisible = await isElementVisible(window, '.app-nav');
    expect(appNavVisible).toBe(true);

    // Take screenshot
    await takeScreenshot(window, '00-app-nav-loaded');
  });

  test('should have 4 App Nav items (Home, Documents, Services, Settings)', async ({ electronApp }) => {
    const { window } = electronApp;

    await waitForElement(window, '.app-nav');

    // Count App Nav items
    const navItems = await window.$$('.app-nav__item');
    expect(navItems.length).toBe(4);

    // Check text content
    const homeItem = await window.textContent('.app-nav__item:nth-child(1)');
    expect(homeItem).toContain('Главная');

    const docsItem = await window.textContent('.app-nav__item:nth-child(2)');
    expect(docsItem).toContain('Документы');

    const servicesItem = await window.textContent('.app-nav__item:nth-child(3)');
    expect(servicesItem).toContain('Сервисы');

    const settingsItem = await window.textContent('.app-nav__item:nth-child(4)');
    expect(settingsItem).toContain('Настройки');
  });

  test('should display Home Dashboard by default', async ({ electronApp }) => {
    const { window } = electronApp;

    // Home Dashboard should be visible
    await waitForElement(window, '.home-dashboard');

    const dashboardVisible = await isElementVisible(window, '.home-dashboard');
    expect(dashboardVisible).toBe(true);

    // Take screenshot of home dashboard
    await takeScreenshot(window, '00-home-dashboard');
  });

  test('should display Sidebar', async ({ electronApp }) => {
    const { window } = electronApp;

    // Sidebar should be visible
    await waitForElement(window, '.sidebar');

    const sidebarVisible = await isElementVisible(window, '.sidebar');
    expect(sidebarVisible).toBe(true);
  });

  test('should have Quick Actions on Home Dashboard', async ({ electronApp }) => {
    const { window } = electronApp;

    await waitForElement(window, '.dashboard__quick-actions');

    // Check quick action cards exist
    const quickActions = await window.$$('.quick-action-card');
    expect(quickActions.length).toBeGreaterThanOrEqual(3);
  });

  test('should not display editor screen initially', async ({ electronApp }) => {
    const { window } = electronApp;

    // Editor should be hidden
    const editorVisible = await isElementVisible(window, '#editor-screen');
    expect(editorVisible).toBe(false);
  });

  test('should not display context toolbar initially', async ({ electronApp }) => {
    const { window } = electronApp;

    // Context toolbar should be hidden
    const toolbarVisible = await isElementVisible(window, '#context-toolbar');
    expect(toolbarVisible).toBe(false);
  });
});
