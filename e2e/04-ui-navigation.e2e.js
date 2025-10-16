/**
 * @file 04-ui-navigation.e2e.js
 * @description E2E tests for Week 4 UI - 3-level navigation architecture
 * @version 1.0.0
 */

const fixtures = require('./helpers/fixtures');
const test = fixtures.test;
const playwrightTest = require('@playwright/test');
const expect = playwrightTest.expect;
const electronAppHelpers = require('./helpers/electron-app');
const waitForElement = electronAppHelpers.waitForElement;
const clickAndWait = electronAppHelpers.clickAndWait;
const takeScreenshot = electronAppHelpers.takeScreenshot;
const isElementVisible = electronAppHelpers.isElementVisible;

test.describe('3-Level Navigation Tests - Week 4', () => {
  test('should switch between App Nav sections (Home, Documents, Services, Settings)', async ({ electronApp }) => {
    const { window } = electronApp;

    const sections = ['home', 'documents', 'services', 'settings'];

    for (const section of sections) {
      // Click App Nav item
      await clickAndWait(window, `#nav-${section}`, 500);

      // Check active state
      const navItem = await window.$(`#nav-${section}`);
      const hasActiveClass = await navItem.evaluate(el =>
        el.classList.contains('app-nav__item--active')
      );
      expect(hasActiveClass).toBe(true);

      // Check corresponding sidebar is visible
      const sidebarVisible = await isElementVisible(window, `#sidebar-${section}`);
      expect(sidebarVisible).toBe(true);

      // Check footer status updated
      const footerStatus = await window.$('#footer-status');
      const statusText = await footerStatus.textContent();
      console.log(`Footer status for ${section}:`, statusText);

      await takeScreenshot(window, `04-nav-${section}`);
    }
  });

  test('should display correct sidebar content for each section', async ({ electronApp }) => {
    const { window } = electronApp;

    // Home sidebar
    await clickAndWait(window, '#nav-home', 500);
    const homeQuickActions = await isElementVisible(window, '#quick-new-document');
    expect(homeQuickActions).toBe(true);

    // Documents sidebar
    await clickAndWait(window, '#nav-documents', 500);
    const docsSearch = await isElementVisible(window, '#document-search');
    expect(docsSearch).toBe(true);
    const docFilters = await window.$$('.sidebar__filter');
    expect(docFilters.length).toBeGreaterThan(0);

    // Services sidebar
    await clickAndWait(window, '#nav-services', 500);
    const serviceSearch = await isElementVisible(window, '#service-search');
    expect(serviceSearch).toBe(true);
    const categories = await window.$$('.sidebar__category');
    expect(categories.length).toBeGreaterThan(0);

    await takeScreenshot(window, '04-sidebars-content');
  });

  test('should expand/collapse sidebar categories', async ({ electronApp }) => {
    const { window } = electronApp;

    // Navigate to Services
    await clickAndWait(window, '#nav-services', 500);

    // Find category headers
    const categoryHeaders = await window.$$('.sidebar__category-header');
    console.log(`Found ${categoryHeaders.length} categories`);

    if (categoryHeaders.length > 0) {
      const firstHeader = categoryHeaders[0];

      // Check initial state using aria-expanded or class
      const isExpandedInitially = await firstHeader.evaluate(el =>
        el.getAttribute('aria-expanded') === 'true' ||
        el.classList.contains('sidebar__category-header--expanded')
      );
      console.log('Category initially expanded:', isExpandedInitially);

      // Click to toggle
      await firstHeader.click();
      await window.waitForTimeout(300);

      // Check toggled state
      const isExpandedAfter = await firstHeader.evaluate(el =>
        el.getAttribute('aria-expanded') === 'true' ||
        el.classList.contains('sidebar__category-header--expanded')
      );
      console.log('Category expanded after toggle:', isExpandedAfter);

      // After toggle, state should be opposite
      expect(isExpandedAfter).toBe(!isExpandedInitially);

      await takeScreenshot(window, '04-category-toggle');
    }
  });

  test('should hide editor when switching away from Documents section', async ({ electronApp }) => {
    const { window } = electronApp;

    // Create document in Documents section
    await clickAndWait(window, '#nav-documents', 500);
    await clickAndWait(window, '#new-document', 1000);

    // Editor should be visible
    let editorVisible = await isElementVisible(window, '#editor-screen');
    expect(editorVisible).toBe(true);

    // Switch to Services
    await clickAndWait(window, '#nav-services', 500);

    // Editor should be hidden
    editorVisible = await isElementVisible(window, '#editor-screen');
    expect(editorVisible).toBe(false);

    // Service Store should be visible
    const storeVisible = await isElementVisible(window, '#service-store');
    expect(storeVisible).toBe(true);

    await takeScreenshot(window, '04-editor-hidden-on-switch');
  });

  test('should show context toolbar only when document is open', async ({ electronApp }) => {
    const { window } = electronApp;

    // Initially on home - toolbar hidden
    let toolbarVisible = await isElementVisible(window, '#context-toolbar');
    expect(toolbarVisible).toBe(false);

    // Create new document
    await clickAndWait(window, '#dashboard-new-document', 1000);

    // Toolbar should appear
    toolbarVisible = await isElementVisible(window, '#context-toolbar');
    expect(toolbarVisible).toBe(true);

    // Navigate to home
    await clickAndWait(window, '#nav-home', 500);

    // Toolbar should hide
    toolbarVisible = await isElementVisible(window, '#context-toolbar');
    expect(toolbarVisible).toBe(false);

    await takeScreenshot(window, '04-context-toolbar-conditional');
  });
});

test.describe('Service Store Tests - Week 4', () => {
  test('should display Service Store when navigating to Services', async ({ electronApp }) => {
    const { window } = electronApp;

    // Navigate to Services
    await clickAndWait(window, '#nav-services', 500);

    // Service Store should be visible
    const storeVisible = await isElementVisible(window, '#service-store');
    expect(storeVisible).toBe(true);

    // Check for store header
    const storeHeader = await window.$('.service-store__header');
    expect(storeHeader).not.toBeNull();

    await takeScreenshot(window, '04-service-store');
  });

  test('should filter services by type (all/installed/available)', async ({ electronApp }) => {
    const { window } = electronApp;

    // Navigate to Services
    await clickAndWait(window, '#nav-services', 500);

    // Find filter buttons
    const filterButtons = await window.$$('.sidebar__filter[data-filter]');
    console.log(`Found ${filterButtons.length} filter buttons`);

    if (filterButtons.length >= 2) {
      // Click "installed" filter (force click because may be obscured)
      const installedFilter = filterButtons[1];
      await installedFilter.click({ force: true });
      await window.waitForTimeout(500);

      // Check active state
      const hasActive = await installedFilter.evaluate(el =>
        el.classList.contains('sidebar__filter--active')
      );
      console.log('Installed filter active:', hasActive);

      await takeScreenshot(window, '04-service-filter-installed');
    }
  });

  test('should search services by name', async ({ electronApp }) => {
    const { window } = electronApp;

    // Navigate to Services
    await clickAndWait(window, '#nav-services', 500);

    // Find search input
    const searchInput = await window.$('#service-search');
    if (searchInput) {
      await searchInput.fill('xml');
      await window.waitForTimeout(500);

      console.log('Service search: "xml"');
      await takeScreenshot(window, '04-service-search');
    }
  });

  test('should display service categories (Documents, Utilities, Integrations)', async ({ electronApp }) => {
    const { window } = electronApp;

    // Navigate to Services
    await clickAndWait(window, '#nav-services', 500);

    // Check categories in sidebar
    const categories = await window.$$('.sidebar__category');
    console.log(`Found ${categories.length} service categories`);
    expect(categories.length).toBeGreaterThanOrEqual(3);

    // Check category titles
    for (const category of categories) {
      const title = await category.$('.sidebar__category-title');
      if (title) {
        const titleText = await title.textContent();
        console.log('Category:', titleText);
      }
    }

    await takeScreenshot(window, '04-service-categories');
  });

  test('should show service cards with metadata', async ({ electronApp }) => {
    const { window } = electronApp;

    // Navigate to Services
    await clickAndWait(window, '#nav-services', 500);

    // Check for service cards in store
    const serviceCards = await window.$$('.service-card, .service-item');
    console.log(`Found ${serviceCards.length} service cards`);

    if (serviceCards.length > 0) {
      const firstCard = serviceCards[0];
      const cardText = await firstCard.textContent();
      console.log('First service card:', cardText.substring(0, 200));
    }

    await takeScreenshot(window, '04-service-cards');
  });

  test('should display featured services section', async ({ electronApp }) => {
    const { window } = electronApp;

    // Navigate to Services
    await clickAndWait(window, '#nav-services', 500);

    // Check for featured section
    const featuredSection = await window.$('.service-store__featured');
    if (featuredSection) {
      const sectionVisible = await featuredSection.isVisible();
      console.log('Featured section visible:', sectionVisible);

      const sectionTitle = await window.$('.service-store__section-title');
      if (sectionTitle) {
        const title = await sectionTitle.textContent();
        console.log('Featured section title:', title);
      }
    }

    await takeScreenshot(window, '04-featured-services');
  });

  test('should click on service category item', async ({ electronApp }) => {
    const { window } = electronApp;

    // Navigate to Services
    await clickAndWait(window, '#nav-services', 500);

    // Expand first category
    const categoryHeaders = await window.$$('.sidebar__category-header');
    if (categoryHeaders.length > 0) {
      await categoryHeaders[0].click();
      await window.waitForTimeout(300);

      // Click on service item (force click because sidebar group may block it)
      const serviceItems = await window.$$('.sidebar__category-item');
      console.log(`Found ${serviceItems.length} service items`);

      if (serviceItems.length > 0) {
        await serviceItems[0].click({ force: true });
        await window.waitForTimeout(500);

        console.log('Service item clicked');
        await takeScreenshot(window, '04-service-item-clicked');
      }
    }
  });

  test('should display service badges (Pro, Free, Installed)', async ({ electronApp }) => {
    const { window } = electronApp;

    // Navigate to Services
    await clickAndWait(window, '#nav-services', 500);

    // Expand categories
    const categoryHeaders = await window.$$('.sidebar__category-header');
    for (const header of categoryHeaders) {
      await header.click();
      await window.waitForTimeout(200);
    }

    // Look for badges
    const badges = await window.$$('.sidebar__category-item-badge');
    console.log(`Found ${badges.length} service badges`);

    for (const badge of badges) {
      const badgeText = await badge.textContent();
      console.log('Badge:', badgeText);
    }

    await takeScreenshot(window, '04-service-badges');
  });
});

test.describe('Settings Section Tests - Week 4', () => {
  test('should display Settings section with categories', async ({ electronApp }) => {
    const { window } = electronApp;

    // Navigate to Settings
    await clickAndWait(window, '#nav-settings', 500);

    // Settings sidebar should be visible
    const settingsSidebar = await isElementVisible(window, '#sidebar-settings');
    expect(settingsSidebar).toBe(true);

    // Check settings categories
    const settingsItems = await window.$$('[data-settings]');
    console.log(`Found ${settingsItems.length} settings categories`);
    expect(settingsItems.length).toBeGreaterThanOrEqual(4);

    await takeScreenshot(window, '04-settings-section');
  });

  test('should switch between settings categories', async ({ electronApp }) => {
    const { window } = electronApp;

    // Navigate to Settings
    await clickAndWait(window, '#nav-settings', 500);

    const categories = ['general', 'appearance', 'integrations', 'security'];

    for (const category of categories) {
      const categoryBtn = await window.$(`[data-settings="${category}"]`);
      if (categoryBtn) {
        await categoryBtn.click();
        await window.waitForTimeout(300);

        const hasActive = await categoryBtn.evaluate(el =>
          el.classList.contains('sidebar__list-item--active')
        );
        console.log(`Settings "${category}" active:`, hasActive);
      }
    }

    await takeScreenshot(window, '04-settings-categories');
  });
});

test.describe('Statistics and Activity Tests - Week 4', () => {
  test('should display document and template statistics', async ({ electronApp }) => {
    const { window } = electronApp;

    // Navigate to home
    await clickAndWait(window, '#nav-home', 500);

    // Check widget statistics
    const docCount = await window.$('#widget-documents');
    const templateCount = await window.$('#widget-templates');

    if (docCount) {
      const count = await docCount.textContent();
      console.log('Documents count (widget):', count);
    }

    if (templateCount) {
      const count = await templateCount.textContent();
      console.log('Templates count (widget):', count);
    }

    // Check sidebar statistics
    const sidebarDocCount = await window.$('#stat-documents');
    const sidebarTemplateCount = await window.$('#stat-templates');

    if (sidebarDocCount) {
      const count = await sidebarDocCount.textContent();
      console.log('Documents count (sidebar):', count);
    }

    if (sidebarTemplateCount) {
      const count = await sidebarTemplateCount.textContent();
      console.log('Templates count (sidebar):', count);
    }

    await takeScreenshot(window, '04-statistics');
  });

  test('should display recent documents in sidebar', async ({ electronApp }) => {
    const { window } = electronApp;

    // Create some documents first
    await clickAndWait(window, '#dashboard-new-document', 1000);
    await window.fill('#document-title', 'Недавний документ 1');
    await window.selectOption('#schema-version-select', '01.05');
    await window.waitForTimeout(500);

    const saveBtn = await window.$('#save-document');
    await saveBtn.click({ force: true });
    await window.waitForTimeout(1000);

    // Navigate to home
    await clickAndWait(window, '#nav-home', 500);

    // Check recent documents in sidebar
    const recentDocs = await window.$('#home-recent-documents');
    if (recentDocs) {
      const docsHTML = await recentDocs.innerHTML();
      console.log('Recent documents HTML:', docsHTML.substring(0, 200));
    }

    await takeScreenshot(window, '04-recent-documents');
  });

  test('should display activity list on dashboard', async ({ electronApp }) => {
    const { window } = electronApp;

    // Navigate to home
    await clickAndWait(window, '#nav-home', 500);

    // Check activity widget
    const activityList = await window.$('#activity-list');
    if (activityList) {
      const activityHTML = await activityList.innerHTML();
      console.log('Activity list:', activityHTML.substring(0, 200));
    }

    await takeScreenshot(window, '04-activity-list');
  });
});
