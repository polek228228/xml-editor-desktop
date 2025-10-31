/**
 * AUTOMATED UI AUDIT E2E TEST
 *
 * Полностью автоматизированная проверка UI/UX
 * Запускает все скрипты проверки внутри Electron и собирает результаты
 */

const { test, expect, _electron: electron } = require('@playwright/test');
const fs = require('fs-extra');
const path = require('path');

test.describe('Automated UI/UX Audit', () => {
  let electronApp;
  let window;

  test.beforeAll(async () => {
    // Launch Electron
    electronApp = await electron.launch({
      args: ['src/main/main.js'],
      env: {
        ...process.env,
        NODE_ENV: 'test'
      }
    });

    // Get main window
    window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded');
    await window.waitForTimeout(2000); // Wait for app initialization
  });

  test.afterAll(async () => {
    await electronApp.close();
  });

  test('should perform comprehensive UI audit', async () => {
    console.log('🔍 Starting comprehensive UI audit...');

    // Execute comprehensive audit script
    const auditResults = await window.evaluate(() => {
      const results = {
        passed: [],
        warnings: [],
        errors: [],
        info: [],
        domStructure: {},
        measurements: {}
      };

      function pass(message) {
        results.passed.push(message);
      }

      function warn(message, details = '') {
        results.warnings.push({ message, details });
      }

      function fail(message, details = '') {
        results.errors.push({ message, details });
      }

      function info(message, data = null) {
        results.info.push({ message, data });
      }

      // Check basic structure
      const body = document.body;
      const app = document.querySelector('.app');
      const activityBar = document.querySelector('.activity-bar');
      const sidebar = document.querySelector('.sidebar');
      const content = document.querySelector('.content');

      // Store DOM structure info
      results.domStructure = {
        hasBody: !!body,
        hasApp: !!app,
        hasActivityBar: !!activityBar,
        hasSidebar: !!sidebar,
        hasContent: !!content,
        activityBarHTML: activityBar ? activityBar.innerHTML.substring(0, 500) : null,
        sidebarHTML: sidebar ? sidebar.innerHTML.substring(0, 500) : null
      };

      if (body) pass('Body element exists');
      else fail('Body element not found');

      if (app) pass('Main app container exists');
      else fail('Main app container (.app) not found');

      if (activityBar) pass('Activity Bar exists');
      else fail('Activity Bar not found');

      if (sidebar) pass('Sidebar exists');
      else fail('Sidebar not found');

      if (content) pass('Content area exists');
      else fail('Content area not found');

      // Check Activity Bar details
      if (activityBar) {
        const styles = window.getComputedStyle(activityBar);
        results.measurements.activityBarWidth = styles.width;
        results.measurements.activityBarPosition = styles.position;

        // Try different selectors for nav items
        const selectors = [
          '.activity-bar__nav-item',
          '.activity-bar__item',
          '.activity-bar button',
          '.activity-bar a',
          '.activity-bar [data-section]'
        ];

        let navItems = [];
        for (const selector of selectors) {
          const items = document.querySelectorAll(selector);
          if (items.length > 0) {
            navItems = items;
            info(`Found nav items using selector: ${selector}`, items.length);
            break;
          }
        }

        results.domStructure.navItemsCount = navItems.length;
        results.domStructure.navItemsSelector = navItems.length > 0 ?
          Array.from(navItems).map(item => item.className).join(', ') : 'none';

        if (navItems.length === 4) {
          pass('Activity Bar has 4 nav items');
        } else {
          warn(`Activity Bar nav items: expected 4, found ${navItems.length}`);
        }

        // Check for active state
        const activeSelectors = [
          '.activity-bar__nav-item--active',
          '.activity-bar__item--active',
          '.activity-bar [aria-current="page"]',
          '.activity-bar .active'
        ];

        let hasActive = false;
        for (const selector of activeSelectors) {
          if (document.querySelector(selector)) {
            hasActive = true;
            break;
          }
        }

        if (hasActive) pass('Activity Bar has active item');
        else warn('No active item in Activity Bar');
      }

      // Check Sidebar details
      if (sidebar) {
        const styles = window.getComputedStyle(sidebar);
        results.measurements.sidebarWidth = styles.width;
        results.measurements.sidebarPosition = styles.position;
        results.measurements.sidebarBackdropFilter = styles.backdropFilter;

        if (styles.backdropFilter && styles.backdropFilter.includes('blur')) {
          pass('Sidebar has glassmorphism');
        } else {
          warn('Sidebar missing glassmorphism');
        }
      }

      // Check Service Store
      const serviceStore = document.querySelector('.service-store');
      results.domStructure.hasServiceStore = !!serviceStore;

      if (serviceStore) {
        pass('Service Store exists');

        // Try different selectors for cards
        const cardSelectors = [
          '.service-card',
          '.service-item',
          '[class*="service-card"]',
          '.service-store [class*="card"]'
        ];

        let cards = [];
        for (const selector of cardSelectors) {
          const items = document.querySelectorAll(selector);
          if (items.length > 0) {
            cards = items;
            info(`Found service cards using selector: ${selector}`, items.length);
            break;
          }
        }

        results.domStructure.serviceCardsCount = cards.length;

        if (cards.length >= 8) {
          pass(`Service Store has ${cards.length} cards`);
        } else {
          warn(`Service Store cards: expected 8+, found ${cards.length}`);
        }

        // Check search input
        const searchSelectors = [
          '.service-store__search input',
          '.service-store input[type="search"]',
          '.service-store input[placeholder*="оиск"]'
        ];

        let hasSearch = false;
        for (const selector of searchSelectors) {
          if (document.querySelector(selector)) {
            hasSearch = true;
            break;
          }
        }

        if (hasSearch) pass('Service Store has search input');
        else warn('Service Store missing search input');
      }

      // Check buttons
      const buttons = document.querySelectorAll('button');
      results.domStructure.totalButtons = buttons.length;
      info(`Total buttons found: ${buttons.length}`);

      // Check CSS variables
      const rootStyles = getComputedStyle(document.documentElement);
      const cssVars = [
        '--blue-500',
        '--space-4',
        '--shadow-md',
        '--font-base'
      ];

      cssVars.forEach(varName => {
        const value = rootStyles.getPropertyValue(varName);
        if (value) {
          pass(`CSS variable ${varName} defined`);
          results.measurements[varName] = value.trim();
        } else {
          warn(`CSS variable ${varName} not found`);
        }
      });

      // Check electronAPI
      if (window.electronAPI) {
        pass('electronAPI is exposed');
        results.domStructure.hasElectronAPI = true;
        results.domStructure.electronAPIKeys = Object.keys(window.electronAPI).slice(0, 10);
      } else {
        fail('electronAPI not found');
        results.domStructure.hasElectronAPI = false;
      }

      // Calculate health score
      const totalChecks = results.passed.length + results.warnings.length + results.errors.length;
      const healthScore = Math.round((results.passed.length / totalChecks) * 100);
      results.healthScore = healthScore;

      return results;
    });

    // Log results
    console.log('\n📊 AUDIT RESULTS:');
    console.log(`✅ Passed: ${auditResults.passed.length}`);
    console.log(`⚠️  Warnings: ${auditResults.warnings.length}`);
    console.log(`❌ Errors: ${auditResults.errors.length}`);
    console.log(`🎯 Health Score: ${auditResults.healthScore}%`);

    // Log DOM structure
    console.log('\n🏗️  DOM STRUCTURE:');
    console.log(JSON.stringify(auditResults.domStructure, null, 2));

    // Log measurements
    console.log('\n📏 MEASUREMENTS:');
    console.log(JSON.stringify(auditResults.measurements, null, 2));

    // Show errors if any
    if (auditResults.errors.length > 0) {
      console.log('\n🚨 ERRORS:');
      auditResults.errors.forEach((err, idx) => {
        console.log(`${idx + 1}. ${err.message}`);
        if (err.details) console.log(`   ${err.details}`);
      });
    }

    // Show warnings if any
    if (auditResults.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS (first 5):');
      auditResults.warnings.slice(0, 5).forEach((warn, idx) => {
        console.log(`${idx + 1}. ${warn.message}`);
        if (warn.details) console.log(`   ${warn.details}`);
      });
    }

    // Save results to file
    const reportPath = path.join(__dirname, '../test-results/automated-ui-audit-results.json');
    await fs.ensureDir(path.dirname(reportPath));
    await fs.writeJson(reportPath, auditResults, { spaces: 2 });
    console.log(`\n💾 Results saved to: ${reportPath}`);

    // Take screenshot
    await window.screenshot({
      path: path.join(__dirname, '../test-results/screenshots/06-automated-audit.png'),
      fullPage: true
    });

    // Assertions
    expect(auditResults.domStructure.hasBody).toBe(true);
    expect(auditResults.domStructure.hasElectronAPI).toBe(true);
    expect(auditResults.healthScore).toBeGreaterThan(50);

    // Create markdown report
    const markdown = generateMarkdownReport(auditResults);
    const mdPath = path.join(__dirname, '../test-results/AUTOMATED_AUDIT_REPORT.md');
    await fs.writeFile(mdPath, markdown);
    console.log(`📄 Markdown report saved to: ${mdPath}`);
  });

  test('should check specific UI sections', async () => {
    console.log('🎯 Checking specific UI sections...');

    // Navigate to each section and check
    const sections = ['home', 'documents', 'services', 'settings'];
    const results = {};

    for (const section of sections) {
      // Try to navigate
      const navigated = await window.evaluate((sectionName) => {
        // Try different navigation methods
        const selectors = [
          `.activity-bar__nav-item[data-section="${sectionName}"]`,
          `.activity-bar [data-section="${sectionName}"]`,
          `.activity-bar button[data-section="${sectionName}"]`
        ];

        for (const selector of selectors) {
          const button = document.querySelector(selector);
          if (button) {
            button.click();
            return true;
          }
        }

        return false;
      }, section);

      await window.waitForTimeout(500);

      // Check what's visible
      const sectionState = await window.evaluate((sectionName) => {
        const possibleSelectors = [
          `.${sectionName}-dashboard`,
          `.${sectionName}-section`,
          `[data-section="${sectionName}"]`,
          `.content .${sectionName}`
        ];

        for (const selector of possibleSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            const styles = window.getComputedStyle(element);
            if (styles.display !== 'none') {
              return {
                found: true,
                visible: true,
                selector: selector
              };
            }
          }
        }

        return { found: false, visible: false };
      }, section);

      results[section] = {
        navigated,
        ...sectionState
      };

      console.log(`  ${section}: navigated=${navigated}, found=${sectionState.found}, visible=${sectionState.visible}`);
    }

    // Save section results
    const sectionPath = path.join(__dirname, '../test-results/section-check-results.json');
    await fs.writeJson(sectionPath, results, { spaces: 2 });

    // At least one section should be visible
    const visibleSections = Object.values(results).filter(r => r.visible).length;
    expect(visibleSections).toBeGreaterThan(0);
  });
});

function generateMarkdownReport(results) {
  const date = new Date().toISOString().split('T')[0];

  return `# 🤖 Automated UI Audit Report

**Date:** ${date}
**Health Score:** ${results.healthScore}%
**Status:** ${results.healthScore >= 80 ? '✅ EXCELLENT' : results.healthScore >= 60 ? '⚠️ GOOD' : '❌ NEEDS WORK'}

---

## 📊 Summary

- ✅ **Passed:** ${results.passed.length}
- ⚠️  **Warnings:** ${results.warnings.length}
- ❌ **Errors:** ${results.errors.length}

---

## 🏗️ DOM Structure

\`\`\`json
${JSON.stringify(results.domStructure, null, 2)}
\`\`\`

---

## 📏 Measurements

\`\`\`json
${JSON.stringify(results.measurements, null, 2)}
\`\`\`

---

## ✅ Passed Checks

${results.passed.map((p, i) => `${i + 1}. ${p}`).join('\n')}

---

## ⚠️ Warnings

${results.warnings.length > 0 ? results.warnings.map((w, i) => `${i + 1}. ${w.message}${w.details ? `\n   Details: ${w.details}` : ''}`).join('\n') : 'None'}

---

## ❌ Errors

${results.errors.length > 0 ? results.errors.map((e, i) => `${i + 1}. ${e.message}${e.details ? `\n   Details: ${e.details}` : ''}`).join('\n') : 'None'}

---

## 📝 Recommendations

${results.healthScore >= 80 ? '🎉 UI is in excellent condition! Minor polishing recommended.' :
  results.healthScore >= 60 ? '👍 UI is good but needs some improvements. Focus on fixing warnings.' :
  '🚨 UI needs significant work. Address errors first, then warnings.'}

---

**Generated by:** Automated UI Audit E2E Test
**Timestamp:** ${new Date().toISOString()}
`;
}
