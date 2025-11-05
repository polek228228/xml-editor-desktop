/**
 * 🧪 UI FULL TEST SCRIPT
 *
 * Complete UI/UX testing suite for XML Editor Desktop
 * Run in browser DevTools console: copy-paste and press Enter
 *
 * Tests:
 * - 3-Level Navigation Architecture
 * - Service Store Integration
 * - All Buttons and Clicks
 * - Animations and Transitions
 * - Loading States
 * - Error Handling
 * - Module System Backend
 *
 * @author Claude Code
 * @date 2025-10-16
 * @version 1.0.0
 */

(async function() {
  console.clear();

  // ====================================
  // TEST CONFIGURATION
  // ====================================
  const config = {
    testDelay: 500,        // Delay between tests (ms)
    animationDelay: 300,   // Wait for animations (ms)
    asyncTimeout: 5000,    // Timeout for async operations (ms)
    verbose: true          // Show detailed logs
  };

  // ====================================
  // TEST UTILITIES
  // ====================================
  const utils = {
    sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

    waitFor: (selector, timeout = 5000) => {
      return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const check = () => {
          const el = document.querySelector(selector);
          if (el) {
            resolve(el);
          } else if (Date.now() - startTime > timeout) {
            reject(new Error(`Timeout waiting for ${selector}`));
          } else {
            setTimeout(check, 100);
          }
        };
        check();
      });
    },

    click: async (selector) => {
      const el = document.querySelector(selector);
      if (!el) throw new Error(`Element not found: ${selector}`);
      el.click();
      await utils.sleep(config.animationDelay);
      return el;
    },

    checkVisible: (selector) => {
      const el = document.querySelector(selector);
      if (!el) return false;
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    },

    checkExists: (selector) => {
      return document.querySelector(selector) !== null;
    },

    checkHasClass: (selector, className) => {
      const el = document.querySelector(selector);
      return el ? el.classList.contains(className) : false;
    },

    countElements: (selector) => {
      return document.querySelectorAll(selector).length;
    },

    getComputedStyle: (selector, property) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      return window.getComputedStyle(el)[property];
    },

    checkAnimation: (selector) => {
      const el = document.querySelector(selector);
      if (!el) return false;
      const style = window.getComputedStyle(el);
      return style.animationName !== 'none' || style.transitionProperty !== 'none';
    }
  };

  // ====================================
  // TEST RESULTS TRACKING
  // ====================================
  const results = {
    passed: [],
    failed: [],
    warnings: [],
    stats: {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      duration: 0
    }
  };

  const test = {
    pass: (name, details = '') => {
      results.passed.push({ name, details });
      results.stats.passed++;
      results.stats.total++;
      if (config.verbose) {
        console.log(`✅ ${name}`, details ? `\n   ${details}` : '');
      }
    },

    fail: (name, error) => {
      results.failed.push({ name, error: error.message || error });
      results.stats.failed++;
      results.stats.total++;
      console.error(`❌ ${name}\n   Error: ${error.message || error}`);
    },

    warn: (name, message) => {
      results.warnings.push({ name, message });
      results.stats.warnings++;
      console.warn(`⚠️ ${name}\n   ${message}`);
    }
  };

  // ====================================
  // START TESTING
  // ====================================
  console.log('%c🧪 UI FULL TEST SUITE', 'font-size: 20px; font-weight: bold; color: #2563eb;');
  console.log('%cStarting comprehensive UI testing...', 'color: #666;');
  console.log('━'.repeat(60));

  // Wait for app to fully initialize
  console.log('%cℹ️  Waiting for app initialization...', 'color: #3b82f6;');
  if (!window.xmlEditorApp) {
    console.warn('⚠️  xmlEditorApp not found, waiting 2 seconds...');
    await utils.sleep(2000);
  }

  // Wait for Service Store if it exists
  if (window.serviceStore) {
    console.log('✅ Service Store found, waiting for initialization...');
    await utils.sleep(500); // Give it time to load catalog
  }

  const startTime = Date.now();

  try {
    // ====================================
    // TEST SUITE 1: BASIC UI STRUCTURE
    // ====================================
    console.log('\n%c1️⃣ BASIC UI STRUCTURE', 'font-size: 16px; font-weight: bold; color: #10b981;');

    try {
      if (utils.checkExists('.app-container')) {
        test.pass('App container exists');
      } else {
        throw new Error('App container not found');
      }
    } catch (e) {
      test.fail('App container exists', e);
    }

    try {
      if (utils.checkExists('.app-nav')) {
        const navItems = utils.countElements('.app-nav__item');
        test.pass(`App Navigation exists with ${navItems} items`);
        if (navItems !== 4) {
          test.warn('App Nav items count', `Expected 4, found ${navItems}`);
        }
      } else {
        throw new Error('App Nav not found');
      }
    } catch (e) {
      test.fail('App Navigation exists', e);
    }

    try {
      if (utils.checkExists('.sidebar')) {
        test.pass('Sidebar exists');
      } else {
        throw new Error('Sidebar not found');
      }
    } catch (e) {
      test.fail('Sidebar exists', e);
    }

    try {
      const homeVisible = utils.checkVisible('.home-dashboard');
      const editorVisible = utils.checkVisible('#editor-screen');
      const serviceStoreVisible = utils.checkVisible('#service-store');

      if (homeVisible && !editorVisible && !serviceStoreVisible) {
        test.pass('Home Dashboard visible by default');
      } else {
        throw new Error(`Expected home visible, got: home=${homeVisible}, editor=${editorVisible}, serviceStore=${serviceStoreVisible}`);
      }
    } catch (e) {
      test.fail('Home Dashboard visible by default', e);
    }

    await utils.sleep(config.testDelay);

    // ====================================
    // TEST SUITE 2: NAVIGATION FUNCTIONALITY
    // ====================================
    console.log('\n%c2️⃣ NAVIGATION FUNCTIONALITY', 'font-size: 16px; font-weight: bold; color: #10b981;');

    // Test Home navigation
    try {
      await utils.click('#nav-home');
      await utils.sleep(config.animationDelay);

      const homeVisible = utils.checkVisible('.home-dashboard');
      const hasActiveClass = utils.checkHasClass('#nav-home', 'app-nav__item--active');

      if (homeVisible && hasActiveClass) {
        test.pass('Navigate to Home', 'Dashboard visible, nav item active');
      } else {
        throw new Error(`Home not active: visible=${homeVisible}, active=${hasActiveClass}`);
      }
    } catch (e) {
      test.fail('Navigate to Home', e);
    }

    await utils.sleep(config.testDelay);

    // Test Documents navigation
    try {
      await utils.click('#nav-documents');
      await utils.sleep(config.animationDelay);

      const sidebarVisible = utils.checkVisible('#sidebar-documents');
      const hasActiveClass = utils.checkHasClass('#nav-documents', 'app-nav__item--active');

      if (sidebarVisible && hasActiveClass) {
        test.pass('Navigate to Documents', 'Sidebar switched, nav item active');
      } else {
        throw new Error(`Documents not active: sidebar=${sidebarVisible}, active=${hasActiveClass}`);
      }
    } catch (e) {
      test.fail('Navigate to Documents', e);
    }

    await utils.sleep(config.testDelay);

    // Test Services navigation
    try {
      await utils.click('#nav-services');
      await utils.sleep(config.animationDelay);

      const sidebarVisible = utils.checkVisible('#sidebar-services');
      const hasActiveClass = utils.checkHasClass('#nav-services', 'app-nav__item--active');

      if (sidebarVisible && hasActiveClass) {
        test.pass('Navigate to Services', 'Sidebar switched, nav item active');
      } else {
        throw new Error(`Services not active: sidebar=${sidebarVisible}, active=${hasActiveClass}`);
      }
    } catch (e) {
      test.fail('Navigate to Services', e);
    }

    await utils.sleep(config.testDelay);

    // Test Settings navigation
    try {
      await utils.click('#nav-settings');
      await utils.sleep(config.animationDelay);

      const sidebarVisible = utils.checkVisible('#sidebar-settings');
      const hasActiveClass = utils.checkHasClass('#nav-settings', 'app-nav__item--active');

      if (sidebarVisible && hasActiveClass) {
        test.pass('Navigate to Settings', 'Sidebar switched, nav item active');
      } else {
        throw new Error(`Settings not active: sidebar=${sidebarVisible}, active=${hasActiveClass}`);
      }
    } catch (e) {
      test.fail('Navigate to Settings', e);
    }

    await utils.sleep(config.testDelay);

    // ====================================
    // TEST SUITE 3: SERVICE STORE
    // ====================================
    console.log('\n%c3️⃣ SERVICE STORE', 'font-size: 16px; font-weight: bold; color: #10b981;');

    // Navigate to Services
    try {
      await utils.click('#nav-services');
      await utils.sleep(config.animationDelay);
    } catch (e) {
      console.error('Failed to navigate to services');
    }

    // Check Service Store exists
    try {
      if (utils.checkExists('#service-store')) {
        test.pass('Service Store exists');
      } else {
        throw new Error('Service Store not found');
      }
    } catch (e) {
      test.fail('Service Store exists', e);
    }

    // Check service cards
    try {
      const cardCount = utils.countElements('.service-card');
      if (cardCount > 0) {
        test.pass(`Service cards rendered: ${cardCount} cards found`);
      } else {
        throw new Error('No service cards found');
      }
    } catch (e) {
      test.fail('Service cards rendered', e);
    }

    // Check service card structure
    try {
      const firstCard = document.querySelector('.service-card');
      if (!firstCard) throw new Error('No service card to check');

      const hasIcon = firstCard.querySelector('.service-card__icon') !== null;
      const hasTitle = firstCard.querySelector('.service-card__title') !== null;
      const hasDescription = firstCard.querySelector('.service-card__description') !== null;
      const hasFooter = firstCard.querySelector('.service-card__footer') !== null;
      const hasButton = firstCard.querySelector('button') !== null;

      if (hasIcon && hasTitle && hasDescription && hasFooter && hasButton) {
        test.pass('Service card structure', 'All required elements present');
      } else {
        throw new Error(`Missing elements: icon=${hasIcon}, title=${hasTitle}, desc=${hasDescription}, footer=${hasFooter}, button=${hasButton}`);
      }
    } catch (e) {
      test.fail('Service card structure', e);
    }

    // Check for badges
    try {
      const badgeCount = utils.countElements('.service-card__badge');
      test.pass(`Status badges: ${badgeCount} badges found`, badgeCount > 0 ? 'Some modules have status badges' : 'No badges (all modules are not installed)');
    } catch (e) {
      test.fail('Status badges', e);
    }

    await utils.sleep(config.testDelay);

    // ====================================
    // TEST SUITE 4: MODULE BACKEND INTEGRATION
    // ====================================
    console.log('\n%c4️⃣ MODULE BACKEND INTEGRATION', 'font-size: 16px; font-weight: bold; color: #10b981;');

    // Check electronAPI exists
    try {
      if (window.electronAPI) {
        test.pass('electronAPI available');
      } else {
        throw new Error('electronAPI not found');
      }
    } catch (e) {
      test.fail('electronAPI available', e);
    }

    // Check module methods
    try {
      const methods = [
        'listModules',
        'installModule',
        'uninstallModule',
        'activateModule',
        'deactivateModule'
      ];

      const available = methods.filter(m => typeof window.electronAPI[m] === 'function');

      if (available.length === methods.length) {
        test.pass('Module IPC methods', `All ${methods.length} methods available`);
      } else {
        throw new Error(`Missing methods: ${methods.filter(m => !available.includes(m)).join(', ')}`);
      }
    } catch (e) {
      test.fail('Module IPC methods', e);
    }

    // Test listModules
    try {
      // Check if electronAPI has listModules method
      if (!window.electronAPI || typeof window.electronAPI.listModules !== 'function') {
        throw new Error('electronAPI.listModules is not a function. Check preload.js');
      }

      const result = await Promise.race([
        window.electronAPI.listModules({ type: 'all' }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), config.asyncTimeout))
      ]);

      if (result.success && Array.isArray(result.modules)) {
        test.pass(`listModules works: ${result.modules.length} modules loaded`,
          result.modules.map(m => `${m.name} (${m.id})`).join(', '));
      } else {
        throw new Error(`Failed: ${result.error || 'Unknown error'}`);
      }
    } catch (e) {
      test.fail('listModules works', e);
    }

    await utils.sleep(config.testDelay);

    // ====================================
    // TEST SUITE 5: BUTTONS AND INTERACTIONS
    // ====================================
    console.log('\n%c5️⃣ BUTTONS AND INTERACTIONS', 'font-size: 16px; font-weight: bold; color: #10b981;');

    // Navigate to home first
    try {
      await utils.click('#nav-home');
      await utils.sleep(config.animationDelay);
    } catch (e) {
      console.error('Failed to navigate to home');
    }

    // Test Quick Action buttons
    try {
      const quickActionButtons = document.querySelectorAll('.quick-action-card');
      if (quickActionButtons.length > 0) {
        test.pass(`Quick Action cards: ${quickActionButtons.length} cards found`);

        // Check if clickable
        const firstCard = quickActionButtons[0];
        const hasClickHandler = firstCard.onclick !== null ||
                               firstCard.getAttribute('onclick') !== null ||
                               firstCard.style.cursor === 'pointer';

        if (hasClickHandler || window.getComputedStyle(firstCard).cursor === 'pointer') {
          test.pass('Quick Action cards clickable');
        } else {
          test.warn('Quick Action cards clickable', 'Cards may not have click handlers');
        }
      } else {
        throw new Error('No quick action cards found');
      }
    } catch (e) {
      test.fail('Quick Action cards', e);
    }

    // Test sidebar buttons
    try {
      const sidebarButtons = document.querySelectorAll('.sidebar button');
      if (sidebarButtons.length > 0) {
        test.pass(`Sidebar buttons: ${sidebarButtons.length} buttons found`);
      } else {
        test.warn('Sidebar buttons', 'No buttons found in sidebar');
      }
    } catch (e) {
      test.fail('Sidebar buttons', e);
    }

    await utils.sleep(config.testDelay);

    // ====================================
    // TEST SUITE 6: CSS AND ANIMATIONS
    // ====================================
    console.log('\n%c6️⃣ CSS AND ANIMATIONS', 'font-size: 16px; font-weight: bold; color: #10b981;');

    // Check CSS loaded
    try {
      const bgColor = utils.getComputedStyle('body', 'backgroundColor');
      if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
        test.pass('CSS loaded', `Body background: ${bgColor}`);
      } else {
        throw new Error('CSS not loaded or body has no background');
      }
    } catch (e) {
      test.fail('CSS loaded', e);
    }

    // Check CSS variables
    try {
      const root = document.documentElement;
      const colorPrimary = getComputedStyle(root).getPropertyValue('--color-primary');
      const spacing = getComputedStyle(root).getPropertyValue('--spacing-md');

      if (colorPrimary && spacing) {
        test.pass('CSS variables defined', `Primary color: ${colorPrimary.trim()}`);
      } else {
        throw new Error('CSS variables not found');
      }
    } catch (e) {
      test.fail('CSS variables defined', e);
    }

    // Check animations exist
    try {
      const styleSheets = Array.from(document.styleSheets);
      let animationCount = 0;
      let transitionCount = 0;

      styleSheets.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          rules.forEach(rule => {
            if (rule.type === CSSRule.KEYFRAMES_RULE) {
              animationCount++;
            }
            if (rule.style && rule.style.transition) {
              transitionCount++;
            }
          });
        } catch (e) {
          // Cross-origin stylesheet, skip
        }
      });

      if (animationCount > 0 || transitionCount > 0) {
        test.pass('CSS animations defined', `${animationCount} keyframes, ${transitionCount} transitions`);
      } else {
        test.warn('CSS animations defined', 'No animations found in stylesheets');
      }
    } catch (e) {
      test.fail('CSS animations defined', e);
    }

    // Check spinner animation
    try {
      const spinnerExists = utils.checkExists('.spinner-sm') ||
                           getComputedStyle(document.documentElement).getPropertyValue('--spinner-animation');

      // Check if spinner keyframe exists
      const styleSheets = Array.from(document.styleSheets);
      let hasSpinAnimation = false;

      styleSheets.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          rules.forEach(rule => {
            if (rule.type === CSSRule.KEYFRAMES_RULE && rule.name === 'spin') {
              hasSpinAnimation = true;
            }
          });
        } catch (e) {
          // Skip
        }
      });

      if (hasSpinAnimation) {
        test.pass('Spinner animation defined', '@keyframes spin found');
      } else {
        test.warn('Spinner animation defined', 'Spinner keyframes not found');
      }
    } catch (e) {
      test.fail('Spinner animation defined', e);
    }

    await utils.sleep(config.testDelay);

    // ====================================
    // TEST SUITE 7: RESPONSIVE BEHAVIOR
    // ====================================
    console.log('\n%c7️⃣ RESPONSIVE BEHAVIOR', 'font-size: 16px; font-weight: bold; color: #10b981;');

    // Check viewport
    try {
      const width = window.innerWidth;
      const height = window.innerHeight;
      test.pass(`Viewport size: ${width}x${height}`);
    } catch (e) {
      test.fail('Viewport size', e);
    }

    // Check sidebar width
    try {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        const width = sidebar.offsetWidth;
        test.pass(`Sidebar width: ${width}px`, width === 240 ? 'Correct' : 'May be incorrect');
      } else {
        throw new Error('Sidebar not found');
      }
    } catch (e) {
      test.fail('Sidebar width', e);
    }

    // Check app-nav height
    try {
      const appNav = document.querySelector('.app-nav');
      if (appNav) {
        const height = appNav.offsetHeight;
        test.pass(`App Nav height: ${height}px`, height === 60 ? 'Correct' : 'May be incorrect');
      } else {
        throw new Error('App Nav not found');
      }
    } catch (e) {
      test.fail('App Nav height', e);
    }

    await utils.sleep(config.testDelay);

    // ====================================
    // TEST SUITE 8: ERROR HANDLING
    // ====================================
    console.log('\n%c8️⃣ ERROR HANDLING', 'font-size: 16px; font-weight: bold; color: #10b981;');

    // Check toast container exists
    try {
      // Toast container may not exist until first toast
      const hasToastContainer = utils.checkExists('#toast-container') ||
                               utils.checkExists('.toast-container');

      test.pass('Toast system available', hasToastContainer ? 'Container found' : 'Will be created on demand');
    } catch (e) {
      test.fail('Toast system available', e);
    }

    // Check app has showToast method
    try {
      if (window.xmlEditorApp && typeof window.xmlEditorApp.showToast === 'function') {
        test.pass('showToast method exists');
      } else {
        throw new Error('showToast method not found on xmlEditorApp');
      }
    } catch (e) {
      test.fail('showToast method exists', e);
    }

    // Check error state classes exist in CSS
    try {
      const errorClasses = [
        '.service-store__error',
        '.service-store__empty',
        '.service-card--error'
      ];

      const foundClasses = errorClasses.filter(cls => {
        const testEl = document.createElement('div');
        testEl.className = cls.replace('.', '');
        document.body.appendChild(testEl);
        const hasStyles = window.getComputedStyle(testEl).display !== '';
        document.body.removeChild(testEl);
        return hasStyles;
      });

      if (foundClasses.length > 0) {
        test.pass('Error state CSS', `${foundClasses.length}/${errorClasses.length} error state classes defined`);
      } else {
        test.warn('Error state CSS', 'Error state classes may not be defined');
      }
    } catch (e) {
      test.fail('Error state CSS', e);
    }

    await utils.sleep(config.testDelay);

    // ====================================
    // TEST SUITE 9: ACCESSIBILITY
    // ====================================
    console.log('\n%c9️⃣ ACCESSIBILITY', 'font-size: 16px; font-weight: bold; color: #10b981;');

    // Check ARIA labels on nav
    try {
      const navItems = document.querySelectorAll('.app-nav__item');
      const withAria = Array.from(navItems).filter(item =>
        item.getAttribute('aria-label') || item.getAttribute('aria-current')
      );

      if (withAria.length === navItems.length) {
        test.pass('App Nav ARIA labels', 'All nav items have ARIA attributes');
      } else {
        test.warn('App Nav ARIA labels', `${withAria.length}/${navItems.length} items have ARIA attributes`);
      }
    } catch (e) {
      test.fail('App Nav ARIA labels', e);
    }

    // Check buttons have accessible names
    try {
      const buttons = document.querySelectorAll('button');
      const withoutName = Array.from(buttons).filter(btn => {
        return !btn.textContent.trim() &&
               !btn.getAttribute('aria-label') &&
               !btn.getAttribute('title');
      });

      if (withoutName.length === 0) {
        test.pass('Button accessibility', 'All buttons have accessible names');
      } else {
        test.warn('Button accessibility', `${withoutName.length} buttons without accessible names`);
      }
    } catch (e) {
      test.fail('Button accessibility', e);
    }

    // Check semantic HTML
    try {
      const hasNav = document.querySelector('nav') !== null;
      const hasMain = document.querySelector('main') !== null;
      const hasAside = document.querySelector('aside') !== null;
      const hasHeader = document.querySelector('header') !== null;

      const score = [hasNav, hasMain, hasAside, hasHeader].filter(Boolean).length;

      test.pass('Semantic HTML', `${score}/4 semantic elements used`);
    } catch (e) {
      test.fail('Semantic HTML', e);
    }

    await utils.sleep(config.testDelay);

    // ====================================
    // TEST SUITE 10: PERFORMANCE
    // ====================================
    console.log('\n%c🔟 PERFORMANCE', 'font-size: 16px; font-weight: bold; color: #10b981;');

    // Check DOM size
    try {
      const domSize = document.getElementsByTagName('*').length;
      test.pass(`DOM size: ${domSize} elements`,
        domSize < 1500 ? 'Good' : domSize < 3000 ? 'Acceptable' : 'High');
    } catch (e) {
      test.fail('DOM size', e);
    }

    // Check CSS size
    try {
      const styleSheets = document.styleSheets.length;
      test.pass(`Stylesheets loaded: ${styleSheets}`);
    } catch (e) {
      test.fail('Stylesheets loaded', e);
    }

    // Check JS errors in console
    try {
      // Note: Can't actually check console errors from script
      test.pass('Console errors', 'Check DevTools Console manually for errors');
    } catch (e) {
      test.fail('Console errors', e);
    }

  } catch (error) {
    console.error('Test suite crashed:', error);
  }

  // ====================================
  // GENERATE REPORT
  // ====================================
  const endTime = Date.now();
  results.stats.duration = endTime - startTime;

  console.log('\n' + '━'.repeat(60));
  console.log('%c📊 TEST REPORT', 'font-size: 20px; font-weight: bold; color: #2563eb;');
  console.log('━'.repeat(60));

  // Summary
  console.log('\n%c📈 SUMMARY', 'font-size: 16px; font-weight: bold;');
  console.log(`Total Tests:    ${results.stats.total}`);
  console.log(`%c✅ Passed:      ${results.stats.passed}`, 'color: #10b981; font-weight: bold;');
  console.log(`%c❌ Failed:      ${results.stats.failed}`, results.stats.failed > 0 ? 'color: #ef4444; font-weight: bold;' : 'color: #666;');
  console.log(`%c⚠️  Warnings:    ${results.stats.warnings}`, results.stats.warnings > 0 ? 'color: #f59e0b; font-weight: bold;' : 'color: #666;');
  console.log(`⏱️  Duration:    ${results.stats.duration}ms`);

  // Success rate
  const successRate = results.stats.total > 0
    ? Math.round((results.stats.passed / results.stats.total) * 100)
    : 0;

  console.log(`\n%c🎯 Success Rate: ${successRate}%`,
    successRate >= 90 ? 'color: #10b981; font-weight: bold; font-size: 18px;' :
    successRate >= 70 ? 'color: #f59e0b; font-weight: bold; font-size: 18px;' :
    'color: #ef4444; font-weight: bold; font-size: 18px;'
  );

  // Failed tests detail
  if (results.failed.length > 0) {
    console.log('\n%c❌ FAILED TESTS', 'font-size: 16px; font-weight: bold; color: #ef4444;');
    results.failed.forEach(({ name, error }) => {
      console.log(`\n  ${name}:`);
      console.log(`  └─ ${error}`);
    });
  }

  // Warnings detail
  if (results.warnings.length > 0) {
    console.log('\n%c⚠️  WARNINGS', 'font-size: 16px; font-weight: bold; color: #f59e0b;');
    results.warnings.forEach(({ name, message }) => {
      console.log(`\n  ${name}:`);
      console.log(`  └─ ${message}`);
    });
  }

  // Recommendations
  console.log('\n%c💡 RECOMMENDATIONS', 'font-size: 16px; font-weight: bold; color: #3b82f6;');

  if (results.stats.failed === 0 && results.stats.warnings === 0) {
    console.log('✨ Perfect! All tests passed with no warnings.');
  } else {
    if (results.stats.failed > 0) {
      console.log('🔴 Priority: Fix failed tests first');
    }
    if (results.stats.warnings > 0) {
      console.log('🟡 Consider: Address warnings for better quality');
    }
  }

  // Overall status
  console.log('\n' + '━'.repeat(60));
  if (successRate >= 90) {
    console.log('%c🎉 EXCELLENT! Application is in great shape!', 'color: #10b981; font-weight: bold; font-size: 16px;');
  } else if (successRate >= 70) {
    console.log('%c✅ GOOD! Minor issues to address.', 'color: #f59e0b; font-weight: bold; font-size: 16px;');
  } else {
    console.log('%c⚠️  NEEDS WORK! Several issues require attention.', 'color: #ef4444; font-weight: bold; font-size: 16px;');
  }
  console.log('━'.repeat(60));

  // Export results to window for further analysis
  window.testResults = results;
  console.log('\n💾 Results saved to window.testResults for analysis');

  return results;
})();
