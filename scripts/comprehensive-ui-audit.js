/**
 * COMPREHENSIVE UI/UX AUDIT SCRIPT
 *
 * Проверяет все UI элементы, расположение, spacing, кнопки, анимации
 *
 * КАК ИСПОЛЬЗОВАТЬ:
 * 1. Запустить приложение: npm run dev
 * 2. Открыть DevTools (Cmd+Opt+I)
 * 3. Вставить этот скрипт в консоль
 * 4. Результаты будут выведены в консоль с цветами
 */

(async function comprehensiveUIAudit() {
  console.clear();
  console.log('%c🔍 COMPREHENSIVE UI/UX AUDIT STARTED', 'background: #3b82f6; color: white; padding: 10px; font-size: 16px; font-weight: bold');
  console.log('');

  const results = {
    passed: [],
    warnings: [],
    errors: [],
    info: []
  };

  // ==================== HELPER FUNCTIONS ====================

  function pass(message) {
    results.passed.push(message);
    console.log('%c✅ PASS:', 'color: #10b981; font-weight: bold', message);
  }

  function warn(message, details = '') {
    results.warnings.push({ message, details });
    console.warn('%c⚠️  WARN:', 'color: #f59e0b; font-weight: bold', message, details);
  }

  function fail(message, details = '') {
    results.errors.push({ message, details });
    console.error('%c❌ FAIL:', 'color: #ef4444; font-weight: bold', message, details);
  }

  function info(message, data = null) {
    results.info.push({ message, data });
    console.log('%c🔵 INFO:', 'color: #3b82f6; font-weight: bold', message, data || '');
  }

  function getComputedStyle(selector) {
    const el = document.querySelector(selector);
    return el ? window.getComputedStyle(el) : null;
  }

  function checkElement(selector, name) {
    const el = document.querySelector(selector);
    if (el) {
      pass(`${name} exists`);
      return el;
    } else {
      fail(`${name} not found`, `Selector: ${selector}`);
      return null;
    }
  }

  function checkVisible(selector, name) {
    const el = document.querySelector(selector);
    if (el) {
      const styles = window.getComputedStyle(el);
      const isVisible = styles.display !== 'none' && styles.visibility !== 'hidden' && styles.opacity !== '0';
      if (isVisible) {
        pass(`${name} is visible`);
        return true;
      } else {
        warn(`${name} exists but not visible`, `display: ${styles.display}, visibility: ${styles.visibility}, opacity: ${styles.opacity}`);
        return false;
      }
    } else {
      fail(`${name} not found for visibility check`, `Selector: ${selector}`);
      return false;
    }
  }

  function measureSpacing(selector1, selector2, expectedGap, label) {
    const el1 = document.querySelector(selector1);
    const el2 = document.querySelector(selector2);

    if (!el1 || !el2) {
      warn(`Cannot measure spacing for ${label}`, 'One or both elements not found');
      return;
    }

    const rect1 = el1.getBoundingClientRect();
    const rect2 = el2.getBoundingClientRect();
    const actualGap = rect2.left - rect1.right;

    if (Math.abs(actualGap - expectedGap) <= 2) {
      pass(`${label} spacing correct (${actualGap}px ≈ ${expectedGap}px)`);
    } else {
      warn(`${label} spacing incorrect`, `Expected: ${expectedGap}px, Actual: ${actualGap}px, Diff: ${Math.abs(actualGap - expectedGap)}px`);
    }
  }

  function checkCSS(selector, property, expectedValue, name) {
    const el = document.querySelector(selector);
    if (!el) {
      fail(`${name} element not found`, `Selector: ${selector}`);
      return;
    }

    const styles = window.getComputedStyle(el);
    const actualValue = styles[property];

    if (actualValue === expectedValue || (typeof expectedValue === 'string' && actualValue.includes(expectedValue))) {
      pass(`${name} ${property} is correct (${actualValue})`);
    } else {
      warn(`${name} ${property} mismatch`, `Expected: ${expectedValue}, Actual: ${actualValue}`);
    }
  }

  // ==================== SECTION 1: BASIC STRUCTURE ====================
  console.log('');
  console.log('%c📦 SECTION 1: BASIC STRUCTURE', 'background: #1e40af; color: white; padding: 8px; font-size: 14px; font-weight: bold');

  checkElement('body', 'Body element');
  checkElement('.app', 'Main app container');
  checkElement('.activity-bar', 'Activity Bar');
  checkElement('.sidebar', 'Sidebar');
  checkElement('.content', 'Content area');

  // Check body overflow
  const bodyStyles = window.getComputedStyle(document.body);
  if (bodyStyles.overflow === 'hidden') {
    pass('Body overflow is hidden (prevents scrolling)');
  } else {
    warn('Body overflow not hidden', `Current: ${bodyStyles.overflow}`);
  }

  // ==================== SECTION 2: ACTIVITY BAR ====================
  console.log('');
  console.log('%c🎯 SECTION 2: ACTIVITY BAR (Level 1 Navigation)', 'background: #1e40af; color: white; padding: 8px; font-size: 14px; font-weight: bold');

  const activityBar = checkElement('.activity-bar', 'Activity Bar');
  if (activityBar) {
    checkCSS('.activity-bar', 'width', '48px', 'Activity Bar');
    checkCSS('.activity-bar', 'position', 'fixed', 'Activity Bar');

    // Check nav items
    const navItems = document.querySelectorAll('.activity-bar__nav-item');
    info(`Activity Bar items count: ${navItems.length}`, `Expected: 4 (Home, Documents, Services, Settings)`);

    if (navItems.length === 4) {
      pass('Activity Bar has correct number of items (4)');
    } else {
      fail('Activity Bar items count incorrect', `Expected: 4, Found: ${navItems.length}`);
    }

    // Check active state
    const activeItem = document.querySelector('.activity-bar__nav-item--active');
    if (activeItem) {
      pass('Activity Bar has active item');
      info('Active section:', activeItem.getAttribute('data-section') || 'unknown');
    } else {
      warn('No active item in Activity Bar');
    }

    // Check icons
    navItems.forEach((item, index) => {
      const icon = item.querySelector('.activity-bar__icon');
      if (icon) {
        pass(`Nav item ${index + 1} has icon`);
      } else {
        fail(`Nav item ${index + 1} missing icon`);
      }
    });
  }

  // ==================== SECTION 3: SIDEBAR ====================
  console.log('');
  console.log('%c🪟 SECTION 3: SIDEBAR (Level 2 Navigation)', 'background: #1e40af; color: white; padding: 8px; font-size: 14px; font-weight: bold');

  const sidebar = checkElement('.sidebar', 'Sidebar');
  if (sidebar) {
    checkCSS('.sidebar', 'width', '220px', 'Sidebar');
    checkCSS('.sidebar', 'position', 'fixed', 'Sidebar');

    // Check glassmorphism
    const sidebarStyles = window.getComputedStyle(sidebar);
    if (sidebarStyles.backdropFilter && sidebarStyles.backdropFilter.includes('blur')) {
      pass('Sidebar has glassmorphism (backdrop-filter: blur)');
      info('Backdrop filter:', sidebarStyles.backdropFilter);
    } else {
      warn('Sidebar missing glassmorphism effect', `backdrop-filter: ${sidebarStyles.backdropFilter}`);
    }

    // Check sidebar content
    checkVisible('.sidebar__content', 'Sidebar content');

    // Check for home sidebar sections
    const quickActions = document.querySelector('.home-sidebar__quick-actions');
    const recentDocs = document.querySelector('.home-sidebar__recent-documents');
    const stats = document.querySelector('.home-sidebar__statistics');

    if (quickActions || recentDocs || stats) {
      info('Home sidebar sections found:', {
        quickActions: !!quickActions,
        recentDocs: !!recentDocs,
        stats: !!stats
      });
    }
  }

  // ==================== SECTION 4: SPACING & LAYOUT ====================
  console.log('');
  console.log('%c📏 SECTION 4: SPACING & LAYOUT', 'background: #1e40af; color: white; padding: 8px; font-size: 14px; font-weight: bold');

  // Check Activity Bar → Sidebar spacing
  measureSpacing('.activity-bar', '.sidebar', 0, 'Activity Bar → Sidebar');

  // Check Sidebar → Content spacing
  const sidebar2 = document.querySelector('.sidebar');
  const content = document.querySelector('.content');
  if (sidebar2 && content) {
    const sidebarRect = sidebar2.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();
    const contentMargin = parseInt(window.getComputedStyle(content).marginLeft);

    info('Layout measurements:', {
      activityBarWidth: '48px',
      sidebarWidth: `${sidebarRect.width}px`,
      contentMarginLeft: `${contentMargin}px`,
      expectedContentMargin: '268px (48 + 220)',
      gap: `${contentRect.left - sidebarRect.right}px`
    });

    // Expected: 48px (Activity Bar) + 220px (Sidebar) = 268px
    if (Math.abs(contentMargin - 268) <= 5) {
      pass('Content margin-left is correct (~268px)');
    } else {
      warn('Content margin-left incorrect', `Expected: ~268px, Actual: ${contentMargin}px`);
    }
  }

  // ==================== SECTION 5: CONTENT AREA ====================
  console.log('');
  console.log('%c📄 SECTION 5: CONTENT AREA (Level 3)', 'background: #1e40af; color: white; padding: 8px; font-size: 14px; font-weight: bold');

  checkElement('.content', 'Content area');
  checkElement('.content-area', 'Content area wrapper');

  // Check which section is visible
  const sections = {
    home: document.querySelector('.home-dashboard'),
    documents: document.querySelector('.documents-section'),
    services: document.querySelector('.service-store'),
    settings: document.querySelector('.settings-section')
  };

  info('Content sections state:', {
    home: sections.home ? (window.getComputedStyle(sections.home).display !== 'none' ? 'visible' : 'hidden') : 'not found',
    documents: sections.documents ? (window.getComputedStyle(sections.documents).display !== 'none' ? 'visible' : 'hidden') : 'not found',
    services: sections.services ? (window.getComputedStyle(sections.services).display !== 'none' ? 'visible' : 'hidden') : 'not found',
    settings: sections.settings ? (window.getComputedStyle(sections.settings).display !== 'none' ? 'visible' : 'hidden') : 'not found'
  });

  // ==================== SECTION 6: BUTTONS ====================
  console.log('');
  console.log('%c🔘 SECTION 6: BUTTONS', 'background: #1e40af; color: white; padding: 8px; font-size: 14px; font-weight: bold');

  const buttons = document.querySelectorAll('button, .btn');
  info(`Total buttons found: ${buttons.length}`);

  let buttonTests = { primary: 0, secondary: 0, danger: 0, disabled: 0, other: 0 };

  buttons.forEach((btn, index) => {
    const classes = btn.className;
    if (classes.includes('btn--primary')) buttonTests.primary++;
    else if (classes.includes('btn--secondary')) buttonTests.secondary++;
    else if (classes.includes('btn--danger')) buttonTests.danger++;
    else if (btn.disabled || classes.includes('btn--disabled')) buttonTests.disabled++;
    else buttonTests.other++;

    // Check border-radius
    const styles = window.getComputedStyle(btn);
    const borderRadius = parseInt(styles.borderRadius);
    if (borderRadius >= 12 && borderRadius <= 24) {
      // OK, within Cupertino range
    } else if (borderRadius > 0) {
      warn(`Button ${index + 1} border-radius outside range`, `Expected: 12-24px, Actual: ${borderRadius}px`);
    }
  });

  info('Button types breakdown:', buttonTests);

  // ==================== SECTION 7: SERVICE STORE ====================
  console.log('');
  console.log('%c🛍️ SECTION 7: SERVICE STORE', 'background: #1e40af; color: white; padding: 8px; font-size: 14px; font-weight: bold');

  const serviceStore = document.querySelector('.service-store');
  if (serviceStore) {
    pass('Service Store exists');

    // Check service cards
    const cards = document.querySelectorAll('.service-card');
    info(`Service cards found: ${cards.length}`, `Expected: 8 modules`);

    if (cards.length > 0) {
      // Check first card in detail
      const firstCard = cards[0];
      const cardStyles = window.getComputedStyle(firstCard);

      info('First service card styles:', {
        borderRadius: cardStyles.borderRadius,
        boxShadow: cardStyles.boxShadow ? 'present' : 'none',
        padding: cardStyles.padding,
        backgroundColor: cardStyles.backgroundColor
      });

      // Check card has required elements
      const cardElements = {
        icon: firstCard.querySelector('.service-card__icon'),
        title: firstCard.querySelector('.service-card__title'),
        description: firstCard.querySelector('.service-card__description'),
        actions: firstCard.querySelector('.service-card__actions'),
        badge: firstCard.querySelector('.service-card__badge')
      };

      Object.entries(cardElements).forEach(([name, el]) => {
        if (el) {
          pass(`Service card has ${name}`);
        } else {
          warn(`Service card missing ${name}`);
        }
      });

      // Check for badges
      cards.forEach((card, idx) => {
        const badge = card.querySelector('.service-card__badge');
        if (badge) {
          const badgeText = badge.textContent.trim();
          info(`Card ${idx + 1} badge:`, badgeText);
        }
      });
    }

    // Check search input
    const searchInput = document.querySelector('.service-store__search input');
    if (searchInput) {
      pass('Service Store has search input');
    } else {
      warn('Service Store missing search input');
    }

    // Check filters
    const filters = document.querySelectorAll('.service-store__filter');
    if (filters.length > 0) {
      pass(`Service Store has ${filters.length} filter pills`);
    } else {
      warn('Service Store missing filter pills');
    }
  } else {
    info('Service Store not visible (might be in different section)');
  }

  // ==================== SECTION 8: ANIMATIONS & TRANSITIONS ====================
  console.log('');
  console.log('%c🎪 SECTION 8: ANIMATIONS & TRANSITIONS', 'background: #1e40af; color: white; padding: 8px; font-size: 14px; font-weight: bold');

  // Check for CSS animations
  const styles = Array.from(document.styleSheets)
    .flatMap(sheet => {
      try {
        return Array.from(sheet.cssRules || []);
      } catch (e) {
        return [];
      }
    });

  const keyframes = styles.filter(rule => rule.type === CSSRule.KEYFRAMES_RULE);
  info(`CSS @keyframes found: ${keyframes.length}`);

  if (keyframes.length > 0) {
    pass(`CSS animations defined (${keyframes.length} keyframes)`);
    const animationNames = keyframes.map(kf => kf.name).slice(0, 10);
    info('Animation names (first 10):', animationNames);
  } else {
    warn('No CSS @keyframes animations found');
  }

  // Check transition on buttons
  const sampleBtn = document.querySelector('.btn');
  if (sampleBtn) {
    const btnStyles = window.getComputedStyle(sampleBtn);
    if (btnStyles.transition && btnStyles.transition !== 'none' && btnStyles.transition !== 'all 0s ease 0s') {
      pass('Buttons have CSS transitions');
      info('Button transition:', btnStyles.transition);
    } else {
      warn('Buttons missing CSS transitions', `Current: ${btnStyles.transition}`);
    }
  }

  // ==================== SECTION 9: TYPOGRAPHY ====================
  console.log('');
  console.log('%c🔤 SECTION 9: TYPOGRAPHY', 'background: #1e40af; color: white; padding: 8px; font-size: 14px; font-weight: bold');

  const bodyFont = bodyStyles.fontFamily;
  info('Body font-family:', bodyFont);

  if (bodyFont.includes('SF Pro') || bodyFont.includes('system-ui') || bodyFont.includes('-apple-system')) {
    pass('Body uses system fonts (SF Pro / system-ui)');
  } else {
    warn('Body not using recommended system fonts', `Current: ${bodyFont}`);
  }

  const bodyFontSize = bodyStyles.fontSize;
  info('Body font-size:', bodyFontSize);

  // ==================== SECTION 10: COLORS ====================
  console.log('');
  console.log('%c🎨 SECTION 10: COLORS & CSS VARIABLES', 'background: #1e40af; color: white; padding: 8px; font-size: 14px; font-weight: bold');

  const rootStyles = getComputedStyle(':root');
  const cssVars = [
    '--blue-500',
    '--teal-500',
    '--rose-500',
    '--amber-500',
    '--space-4',
    '--shadow-md',
    '--font-base'
  ];

  cssVars.forEach(varName => {
    if (rootStyles) {
      const value = rootStyles.getPropertyValue(varName);
      if (value) {
        pass(`CSS variable ${varName} is defined`);
        info(`${varName}:`, value.trim());
      } else {
        warn(`CSS variable ${varName} not found`);
      }
    }
  });

  // ==================== SECTION 11: CONTEXT TOOLBAR ====================
  console.log('');
  console.log('%c🔧 SECTION 11: CONTEXT TOOLBAR', 'background: #1e40af; color: white; padding: 8px; font-size: 14px; font-weight: bold');

  const toolbar = document.querySelector('.context-toolbar');
  if (toolbar) {
    const toolbarStyles = window.getComputedStyle(toolbar);
    const isVisible = toolbarStyles.display !== 'none';

    if (isVisible) {
      pass('Context Toolbar is visible');

      // Check glassmorphism
      if (toolbarStyles.backdropFilter && toolbarStyles.backdropFilter.includes('blur')) {
        pass('Context Toolbar has glassmorphism');
      } else {
        warn('Context Toolbar missing glassmorphism');
      }

      // Check buttons
      const toolbarButtons = toolbar.querySelectorAll('button');
      info(`Context Toolbar buttons: ${toolbarButtons.length}`);
    } else {
      info('Context Toolbar hidden (appears only when document is open)');
    }
  } else {
    info('Context Toolbar not found (might not be initialized yet)');
  }

  // ==================== SECTION 12: TAB BAR ====================
  console.log('');
  console.log('%c📑 SECTION 12: TAB BAR', 'background: #1e40af; color: white; padding: 8px; font-size: 14px; font-weight: bold');

  const tabBar = document.querySelector('.tab-bar');
  if (tabBar) {
    const tabBarStyles = window.getComputedStyle(tabBar);
    const isVisible = tabBarStyles.display !== 'none';

    if (isVisible) {
      pass('Tab Bar is visible');
      const tabs = tabBar.querySelectorAll('.tab-bar__tab');
      info(`Open tabs: ${tabs.length}`);

      if (tabs.length > 0) {
        const activeTab = tabBar.querySelector('.tab-bar__tab--active');
        if (activeTab) {
          pass('Tab Bar has active tab');
        } else {
          warn('Tab Bar has tabs but no active tab');
        }
      }
    } else {
      info('Tab Bar hidden (no documents open)');
    }
  } else {
    info('Tab Bar not found');
  }

  // ==================== SECTION 13: RESPONSIVE DESIGN ====================
  console.log('');
  console.log('%c📱 SECTION 13: RESPONSIVE DESIGN', 'background: #1e40af; color: white; padding: 8px; font-size: 14px; font-weight: bold');

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  info('Viewport size:', `${viewportWidth}x${viewportHeight}`);

  if (viewportWidth < 1024) {
    warn('Viewport width below recommended minimum', `Current: ${viewportWidth}px, Recommended: 1024px+`);
  } else {
    pass(`Viewport width OK (${viewportWidth}px)`);
  }

  // ==================== SECTION 14: ACCESSIBILITY ====================
  console.log('');
  console.log('%c♿ SECTION 14: ACCESSIBILITY', 'background: #1e40af; color: white; padding: 8px; font-size: 14px; font-weight: bold');

  // Check for alt text on icons/images
  const images = document.querySelectorAll('img');
  let imagesWithoutAlt = 0;
  images.forEach(img => {
    if (!img.alt) imagesWithoutAlt++;
  });

  if (images.length > 0) {
    if (imagesWithoutAlt === 0) {
      pass(`All ${images.length} images have alt text`);
    } else {
      warn(`${imagesWithoutAlt} out of ${images.length} images missing alt text`);
    }
  }

  // Check button labels
  const buttonsWithoutLabel = Array.from(buttons).filter(btn => {
    return !btn.textContent.trim() && !btn.getAttribute('aria-label');
  });

  if (buttonsWithoutLabel.length > 0) {
    warn(`${buttonsWithoutLabel.length} buttons without text or aria-label`);
  } else {
    pass('All buttons have labels or aria-labels');
  }

  // ==================== SECTION 15: CONSOLE ERRORS ====================
  console.log('');
  console.log('%c🐛 SECTION 15: CONSOLE ERRORS CHECK', 'background: #1e40af; color: white; padding: 8px; font-size: 14px; font-weight: bold');

  info('Check the console for any JavaScript errors or warnings');
  info('Red errors indicate bugs that need fixing');

  // ==================== FINAL SUMMARY ====================
  console.log('');
  console.log('%c' + '='.repeat(80), 'color: #6b7280');
  console.log('%c📊 AUDIT SUMMARY', 'background: #059669; color: white; padding: 10px; font-size: 16px; font-weight: bold');
  console.log('%c' + '='.repeat(80), 'color: #6b7280');
  console.log('');

  console.log('%c✅ PASSED:', 'color: #10b981; font-weight: bold; font-size: 14px', results.passed.length);
  console.log('%c⚠️  WARNINGS:', 'color: #f59e0b; font-weight: bold; font-size: 14px', results.warnings.length);
  console.log('%c❌ ERRORS:', 'color: #ef4444; font-weight: bold; font-size: 14px', results.errors.length);
  console.log('%c🔵 INFO:', 'color: #3b82f6; font-weight: bold; font-size: 14px', results.info.length);
  console.log('');

  if (results.errors.length > 0) {
    console.log('%c🚨 CRITICAL ERRORS:', 'background: #ef4444; color: white; padding: 5px; font-weight: bold');
    results.errors.forEach((err, idx) => {
      console.log(`${idx + 1}. ${err.message}`);
      if (err.details) console.log(`   Details: ${err.details}`);
    });
    console.log('');
  }

  if (results.warnings.length > 0) {
    console.log('%c⚠️  WARNINGS TO ADDRESS:', 'background: #f59e0b; color: white; padding: 5px; font-weight: bold');
    results.warnings.slice(0, 10).forEach((warn, idx) => {
      console.log(`${idx + 1}. ${warn.message}`);
      if (warn.details) console.log(`   Details: ${warn.details}`);
    });
    if (results.warnings.length > 10) {
      console.log(`... and ${results.warnings.length - 10} more warnings`);
    }
    console.log('');
  }

  // Health score
  const totalChecks = results.passed.length + results.warnings.length + results.errors.length;
  const healthScore = Math.round((results.passed.length / totalChecks) * 100);

  console.log('%c' + '='.repeat(80), 'color: #6b7280');
  console.log('%c🎯 UI HEALTH SCORE:', 'font-size: 18px; font-weight: bold', `${healthScore}%`);
  console.log('%c' + '='.repeat(80), 'color: #6b7280');
  console.log('');

  if (healthScore >= 90) {
    console.log('%c🎉 EXCELLENT! UI is in great shape!', 'background: #10b981; color: white; padding: 10px; font-size: 14px');
  } else if (healthScore >= 75) {
    console.log('%c👍 GOOD! Some minor issues to address.', 'background: #3b82f6; color: white; padding: 10px; font-size: 14px');
  } else if (healthScore >= 60) {
    console.log('%c⚠️  NEEDS WORK! Several issues found.', 'background: #f59e0b; color: white; padding: 10px; font-size: 14px');
  } else {
    console.log('%c🚨 CRITICAL! Many issues need fixing!', 'background: #ef4444; color: white; padding: 10px; font-size: 14px');
  }

  console.log('');
  console.log('%c🔍 AUDIT COMPLETED', 'background: #3b82f6; color: white; padding: 10px; font-size: 16px; font-weight: bold');

  // Return results for programmatic access
  return {
    summary: {
      passed: results.passed.length,
      warnings: results.warnings.length,
      errors: results.errors.length,
      info: results.info.length,
      healthScore
    },
    details: results
  };
})();
