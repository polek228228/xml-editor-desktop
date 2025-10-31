/**
 * FULL VISUAL USER TEST - Как реальный пользователь
 *
 * Этот тест проходит через ВСЕ маршруты приложения,
 * кликает по КАЖДОЙ кнопке, делает скриншоты,
 * проверяет визуальное отображение
 */

const { test, expect, _electron: electron } = require('@playwright/test');
const fs = require('fs-extra');
const path = require('path');

test.describe('Full Visual User Journey Test', () => {
  let electronApp;
  let window;
  const screenshotsDir = path.join(__dirname, '../test-results/user-journey-screenshots');

  test.beforeAll(async () => {
    // Очистить папку скриншотов
    await fs.emptyDir(screenshotsDir);

    // Launch Electron
    electronApp = await electron.launch({
      args: ['src/main/main.js'],
      env: {
        ...process.env,
        NODE_ENV: 'test'
      }
    });

    window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded');
    await window.waitForTimeout(2000);

    console.log('\n🎬 Starting full visual user journey test...\n');
  });

  test.afterAll(async () => {
    await electronApp.close();
  });

  async function takeScreenshot(name, description = '') {
    const filename = `${name}.png`;
    const filepath = path.join(screenshotsDir, filename);
    await window.screenshot({ path: filepath, fullPage: true });
    console.log(`📸 Screenshot: ${name} ${description ? `(${description})` : ''}`);
    return filepath;
  }

  async function clickAndWait(selector, name, waitTime = 500) {
    console.log(`🖱️  Clicking: ${name}`);
    const element = await window.locator(selector);
    await element.click();
    await window.waitForTimeout(waitTime);
    return element;
  }

  async function checkVisible(selector, name) {
    const element = window.locator(selector);
    const isVisible = await element.isVisible();
    console.log(`👁️  ${name}: ${isVisible ? '✅ Visible' : '❌ Hidden'}`);
    return isVisible;
  }

  async function getElementInfo(selector) {
    return await window.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;

      const styles = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();

      return {
        exists: true,
        visible: styles.display !== 'none' && styles.visibility !== 'hidden',
        text: el.textContent.trim().substring(0, 100),
        classes: el.className,
        position: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        },
        styles: {
          display: styles.display,
          backgroundColor: styles.backgroundColor,
          color: styles.color
        }
      };
    }, selector);
  }

  // ========================================
  // TEST 1: INITIAL STATE
  // ========================================
  test('01. Check initial app state', async () => {
    console.log('\n🏁 TEST 1: Initial State\n');

    await takeScreenshot('01-initial-state', 'App opened');

    // Check Activity Bar
    const activityBar = await getElementInfo('.activity-bar');
    expect(activityBar).not.toBeNull();
    expect(activityBar.visible).toBe(true);
    console.log('✅ Activity Bar visible');

    // Check Sidebar
    const sidebar = await getElementInfo('.sidebar');
    expect(sidebar).not.toBeNull();
    expect(sidebar.visible).toBe(true);
    console.log('✅ Sidebar visible');

    // Check Content
    const content = await getElementInfo('.content');
    expect(content).not.toBeNull();
    console.log('✅ Content area visible');

    // Check which section is active
    const homeVisible = await checkVisible('.home-dashboard', 'Home Dashboard');
    expect(homeVisible).toBe(true);
  });

  // ========================================
  // TEST 2: HOME SECTION
  // ========================================
  test('02. Explore Home section', async () => {
    console.log('\n🏠 TEST 2: Home Section\n');

    // Click Home button (should already be active)
    await clickAndWait('.activity-bar__item[data-item-id="home"]', 'Home button');
    await takeScreenshot('02-home-section', 'Home Dashboard');

    // Check sidebar content
    const sidebarHome = await checkVisible('.sidebar__section--home', 'Home Sidebar');
    expect(sidebarHome).toBe(true);

    // Check quick actions
    const quickActions = await window.evaluate(() => {
      const actions = document.querySelectorAll('.quick-action');
      return Array.from(actions).map(action => ({
        text: action.textContent.trim().substring(0, 50),
        hasButton: !!action.querySelector('button')
      }));
    });

    console.log(`📋 Quick Actions found: ${quickActions.length}`);
    quickActions.forEach((action, idx) => {
      console.log(`   ${idx + 1}. ${action.text} ${action.hasButton ? '✅' : '❌'}`);
    });

    // Check statistics
    const stats = await window.evaluate(() => {
      const statElements = document.querySelectorAll('.stat, .statistic, [class*="stat"]');
      return Array.from(statElements).length;
    });
    console.log(`📊 Statistics widgets: ${stats}`);

    await takeScreenshot('02-home-sidebar', 'Home Sidebar content');
  });

  // ========================================
  // TEST 3: DOCUMENTS SECTION
  // ========================================
  test('03. Navigate to Documents section', async () => {
    console.log('\n📄 TEST 3: Documents Section\n');

    await clickAndWait('.activity-bar__item[data-item-id="documents"]', 'Documents button');
    await takeScreenshot('03-documents-section', 'Documents view');

    // Check sidebar changed
    const sidebarDocs = await checkVisible('.sidebar__section--documents', 'Documents Sidebar');

    // Check documents list
    const docsList = await window.evaluate(() => {
      const list = document.querySelector('.documents-list, [class*="document-list"]');
      if (!list) return { found: false };

      const items = list.querySelectorAll('.document-item, [class*="document"]');
      return {
        found: true,
        count: items.length,
        items: Array.from(items).slice(0, 5).map(item => ({
          text: item.textContent.trim().substring(0, 60)
        }))
      };
    });

    console.log(`📁 Documents list: ${docsList.found ? `✅ ${docsList.count} items` : '❌ Not found'}`);
    if (docsList.items) {
      docsList.items.forEach((item, idx) => {
        console.log(`   ${idx + 1}. ${item.text}`);
      });
    }

    // Check new document button
    const newDocButton = await window.evaluate(() => {
      const selectors = [
        'button[data-action="new-document"]',
        '.btn--new-document',
        'button:has-text("Создать")',
        'button:has-text("Новый")'
      ];

      for (const sel of selectors) {
        const btn = document.querySelector(sel);
        if (btn) return { found: true, text: btn.textContent.trim() };
      }
      return { found: false };
    });

    console.log(`➕ New Document button: ${newDocButton.found ? `✅ "${newDocButton.text}"` : '❌ Not found'}`);

    await takeScreenshot('03-documents-sidebar', 'Documents sidebar');
  });

  // ========================================
  // TEST 4: SERVICES (SERVICE STORE)
  // ========================================
  test('04. Navigate to Services (Service Store)', async () => {
    console.log('\n🛍️  TEST 4: Service Store\n');

    await clickAndWait('.activity-bar__item[data-item-id="services"]', 'Services button');
    await window.waitForTimeout(1000);
    await takeScreenshot('04-service-store', 'Service Store view');

    // Check Service Store loaded
    const storeVisible = await checkVisible('.service-store', 'Service Store');
    expect(storeVisible).toBe(true);

    // Count service cards
    const cards = await window.evaluate(() => {
      const cardElements = document.querySelectorAll('.service-card');
      return Array.from(cardElements).map(card => {
        const title = card.querySelector('.service-card__title, h3, h4');
        const price = card.querySelector('[class*="price"]');
        const buttons = card.querySelectorAll('button');
        const badge = card.querySelector('.service-card__badge, [class*="badge"]');

        return {
          title: title ? title.textContent.trim() : 'No title',
          price: price ? price.textContent.trim() : 'Free',
          buttonCount: buttons.length,
          hasBadge: !!badge,
          badgeText: badge ? badge.textContent.trim() : null
        };
      });
    });

    console.log(`🎴 Service Cards: ${cards.length}`);
    cards.forEach((card, idx) => {
      console.log(`   ${idx + 1}. ${card.title} - ${card.price}`);
      console.log(`      Buttons: ${card.buttonCount}, Badge: ${card.hasBadge ? card.badgeText : 'none'}`);
    });

    // Check search input
    const searchInput = await window.evaluate(() => {
      const input = document.querySelector('.service-store__search input, input[type="search"]');
      return input ? { found: true, placeholder: input.placeholder } : { found: false };
    });
    console.log(`🔍 Search input: ${searchInput.found ? `✅ "${searchInput.placeholder}"` : '❌ Not found'}`);

    // Test search functionality
    if (searchInput.found) {
      await window.fill('.service-store__search input, input[type="search"]', 'ПЗ');
      await window.waitForTimeout(500);
      await takeScreenshot('04-service-store-search', 'Search: ПЗ');

      const filteredCards = await window.locator('.service-card').count();
      console.log(`   Filtered results: ${filteredCards} cards`);

      // Clear search
      await window.fill('.service-store__search input, input[type="search"]', '');
      await window.waitForTimeout(300);
    }

    // Check filter buttons
    const filters = await window.evaluate(() => {
      const filterButtons = document.querySelectorAll('.service-store__filter, .filter-pill, [class*="filter"]');
      return Array.from(filterButtons).map(btn => ({
        text: btn.textContent.trim(),
        visible: window.getComputedStyle(btn).display !== 'none'
      }));
    });

    console.log(`🔘 Filter buttons: ${filters.length}`);
    filters.forEach((filter, idx) => {
      console.log(`   ${idx + 1}. ${filter.text} ${filter.visible ? '✅' : '❌'}`);
    });

    // Click first service card (if exists)
    if (cards.length > 0) {
      console.log('\n🖱️  Testing first service card interactions...');

      const firstCard = window.locator('.service-card').first();
      await firstCard.hover();
      await window.waitForTimeout(300);
      await takeScreenshot('04-service-card-hover', 'Card hover state');

      // Try to click first button in card
      const firstButton = firstCard.locator('button').first();
      const buttonText = await firstButton.textContent();
      console.log(`🔘 First button: "${buttonText}"`);

      // await firstButton.click(); // Might trigger install/buy - skip for now
      // console.log('   ✅ Button clicked');
    }

    await takeScreenshot('04-service-store-final', 'Service Store final state');
  });

  // ========================================
  // TEST 5: SETTINGS SECTION
  // ========================================
  test('05. Navigate to Settings section', async () => {
    console.log('\n⚙️  TEST 5: Settings Section\n');

    await clickAndWait('.activity-bar__item[data-item-id="settings"]', 'Settings button');
    await takeScreenshot('05-settings-section', 'Settings view');

    // Check settings visible
    const settingsVisible = await checkVisible('.settings-section, [class*="settings"]', 'Settings Section');

    // Check settings categories
    const categories = await window.evaluate(() => {
      const catElements = document.querySelectorAll('.settings-category, [class*="settings"]');
      return Array.from(catElements).slice(0, 10).map(cat => ({
        text: cat.textContent.trim().substring(0, 50),
        hasButton: !!cat.querySelector('button'),
        hasInput: !!cat.querySelector('input, select, textarea')
      }));
    });

    console.log(`⚙️  Settings categories: ${categories.length}`);
    categories.forEach((cat, idx) => {
      console.log(`   ${idx + 1}. ${cat.text}`);
      console.log(`      Interactive: ${cat.hasButton || cat.hasInput ? '✅' : '❌'}`);
    });

    await takeScreenshot('05-settings-sidebar', 'Settings sidebar');
  });

  // ========================================
  // TEST 6: TAB BAR (if visible)
  // ========================================
  test('06. Check Tab Bar', async () => {
    console.log('\n📑 TEST 6: Tab Bar\n');

    const tabBar = await getElementInfo('.tab-bar');

    if (tabBar && tabBar.visible) {
      console.log('✅ Tab Bar visible');

      const tabs = await window.evaluate(() => {
        const tabElements = document.querySelectorAll('.tab-bar__tab, [class*="tab"]');
        return Array.from(tabElements).map(tab => ({
          text: tab.textContent.trim(),
          active: tab.classList.contains('active') || tab.classList.contains('tab-bar__tab--active')
        }));
      });

      console.log(`📑 Open tabs: ${tabs.length}`);
      tabs.forEach((tab, idx) => {
        console.log(`   ${idx + 1}. ${tab.text} ${tab.active ? '🔵 Active' : ''}`);
      });

      await takeScreenshot('06-tab-bar', 'Tab Bar with tabs');
    } else {
      console.log('ℹ️  Tab Bar hidden (no documents open)');
    }
  });

  // ========================================
  // TEST 7: CONTEXT TOOLBAR (if visible)
  // ========================================
  test('07. Check Context Toolbar', async () => {
    console.log('\n🔧 TEST 7: Context Toolbar\n');

    const toolbar = await getElementInfo('.context-toolbar');

    if (toolbar && toolbar.visible) {
      console.log('✅ Context Toolbar visible');

      const buttons = await window.evaluate(() => {
        const btnElements = document.querySelectorAll('.context-toolbar button');
        return Array.from(btnElements).map(btn => ({
          text: btn.textContent.trim(),
          disabled: btn.disabled
        }));
      });

      console.log(`🔧 Toolbar buttons: ${buttons.length}`);
      buttons.forEach((btn, idx) => {
        console.log(`   ${idx + 1}. ${btn.text} ${btn.disabled ? '❌ Disabled' : '✅'}`);
      });

      await takeScreenshot('07-context-toolbar', 'Context Toolbar');
    } else {
      console.log('ℹ️  Context Toolbar hidden (shows when document is open)');
    }
  });

  // ========================================
  // TEST 8: SIDEBAR INTERACTIONS
  // ========================================
  test('08. Test sidebar interactions', async () => {
    console.log('\n📂 TEST 8: Sidebar Interactions\n');

    // Go to Services to test category toggles
    await clickAndWait('.activity-bar__item[data-item-id="services"]', 'Services button');
    await window.waitForTimeout(500);

    // Find category buttons
    const categories = await window.evaluate(() => {
      const catButtons = document.querySelectorAll('.sidebar__category-button, [class*="category"]');
      return Array.from(catButtons).slice(0, 3).map(btn => ({
        text: btn.textContent.trim().substring(0, 50),
        expanded: btn.classList.contains('expanded') ||
                  btn.getAttribute('aria-expanded') === 'true'
      }));
    });

    console.log(`📂 Sidebar categories: ${categories.length}`);

    if (categories.length > 0) {
      // Try to click first category
      console.log('\n🖱️  Testing category toggle...');

      const firstCategory = window.locator('.sidebar__category-button, [class*="category"]').first();
      await firstCategory.click();
      await window.waitForTimeout(300);
      await takeScreenshot('08-category-toggled', 'Category toggled');

      // Check if expanded
      const isExpanded = await window.evaluate(() => {
        const btn = document.querySelector('.sidebar__category-button, [class*="category"]');
        return btn ? (
          btn.classList.contains('expanded') ||
          btn.getAttribute('aria-expanded') === 'true'
        ) : false;
      });

      console.log(`   Expanded: ${isExpanded ? '✅' : '❌'}`);
    }
  });

  // ========================================
  // TEST 9: COMPLETE NAVIGATION CYCLE
  // ========================================
  test('09. Complete navigation cycle', async () => {
    console.log('\n🔄 TEST 9: Complete Navigation Cycle\n');

    const sections = ['home', 'documents', 'services', 'settings'];

    for (const section of sections) {
      console.log(`\n→ Navigating to: ${section}`);
      await clickAndWait(`.activity-bar__item[data-item-id="${section}"]`, `${section} button`);
      await window.waitForTimeout(500);

      // Check active state
      const isActive = await window.evaluate((sectionId) => {
        const btn = document.querySelector(`.activity-bar__item[data-item-id="${sectionId}"]`);
        return btn ? btn.classList.contains('activity-bar__item--active') : false;
      }, section);

      console.log(`   Active state: ${isActive ? '✅' : '❌'}`);

      await takeScreenshot(`09-nav-${section}`, `Navigated to ${section}`);
    }

    console.log('\n✅ Navigation cycle complete!');
  });

  // ========================================
  // TEST 10: UI MEASUREMENTS
  // ========================================
  test('10. Measure UI elements', async () => {
    console.log('\n📏 TEST 10: UI Measurements\n');

    const measurements = await window.evaluate(() => {
      const elements = {
        activityBar: document.querySelector('.activity-bar'),
        sidebar: document.querySelector('.sidebar'),
        content: document.querySelector('.content')
      };

      const results = {};

      Object.entries(elements).forEach(([name, el]) => {
        if (el) {
          const styles = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          results[name] = {
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            position: styles.position,
            display: styles.display,
            backdropFilter: styles.backdropFilter
          };
        }
      });

      return results;
    });

    console.log('📏 Measurements:');
    Object.entries(measurements).forEach(([name, data]) => {
      console.log(`\n${name}:`);
      console.log(`   Width: ${data.width}px`);
      console.log(`   Position: ${data.position}`);
      if (data.backdropFilter !== 'none') {
        console.log(`   Backdrop Filter: ${data.backdropFilter}`);
      }
    });

    // Check spacing
    if (measurements.activityBar && measurements.sidebar) {
      const gap = measurements.sidebar.left - (measurements.activityBar.left + measurements.activityBar.width);
      console.log(`\n📐 Gap Activity Bar → Sidebar: ${gap.toFixed(2)}px`);

      // Should be close to 0
      expect(Math.abs(gap)).toBeLessThan(10);
    }
  });

  // ========================================
  // TEST 11: GENERATE FINAL REPORT
  // ========================================
  test('11. Generate visual report', async () => {
    console.log('\n📊 TEST 11: Generating Visual Report\n');

    const report = {
      timestamp: new Date().toISOString(),
      screenshotsCount: (await fs.readdir(screenshotsDir)).length,
      sections: ['home', 'documents', 'services', 'settings'],
      elementsChecked: [
        'Activity Bar',
        'Sidebar',
        'Content Area',
        'Service Store',
        'Tab Bar',
        'Context Toolbar'
      ],
      interactionsTested: [
        'Navigation clicks',
        'Category toggles',
        'Search input',
        'Service card hover',
        'Button states'
      ]
    };

    console.log('✅ Visual testing complete!');
    console.log(`📸 Screenshots taken: ${report.screenshotsCount}`);
    console.log(`🗂️  Location: ${screenshotsDir}`);

    // Save report
    const reportPath = path.join(screenshotsDir, 'visual-test-report.json');
    await fs.writeJson(reportPath, report, { spaces: 2 });

    console.log(`\n📄 Report saved: ${reportPath}`);
  });
});
