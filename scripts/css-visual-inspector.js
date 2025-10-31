/**
 * CSS VISUAL INSPECTOR
 *
 * Создает визуальную карту всех UI элементов с подсветкой проблем
 *
 * КАК ИСПОЛЬЗОВАТЬ:
 * 1. Запустить приложение: npm run dev
 * 2. Открыть DevTools (Cmd+Opt+I)
 * 3. Вставить этот скрипт в консоль
 * 4. Все элементы будут подсвечены цветами:
 *    - Зеленый = OK
 *    - Желтый = Предупреждение
 *    - Красный = Ошибка
 */

(function cssVisualInspector() {
  console.clear();
  console.log('%c🎨 CSS VISUAL INSPECTOR', 'background: #ec4899; color: white; padding: 10px; font-size: 18px; font-weight: bold');
  console.log('');

  // Remove existing overlays
  document.querySelectorAll('.css-inspector-overlay').forEach(el => el.remove());

  const results = {
    good: [],
    warnings: [],
    errors: []
  };

  function addOverlay(element, color, label) {
    const rect = element.getBoundingClientRect();
    const overlay = document.createElement('div');
    overlay.className = 'css-inspector-overlay';
    overlay.style.cssText = `
      position: fixed;
      left: ${rect.left}px;
      top: ${rect.top}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      border: 2px solid ${color};
      background: ${color}22;
      pointer-events: none;
      z-index: 999999;
      font-size: 10px;
      color: ${color};
      padding: 2px;
      box-sizing: border-box;
    `;

    const labelEl = document.createElement('div');
    labelEl.textContent = label;
    labelEl.style.cssText = `
      background: ${color};
      color: white;
      padding: 2px 4px;
      font-weight: bold;
      display: inline-block;
      font-size: 9px;
    `;
    overlay.appendChild(labelEl);

    document.body.appendChild(overlay);
  }

  function inspect(selector, name, checks) {
    const element = document.querySelector(selector);
    if (!element) {
      console.log(`⚪ SKIP: ${name} - element not found`);
      return;
    }

    const styles = window.getComputedStyle(element);
    const issues = [];

    // Run checks
    checks.forEach(check => {
      const result = check.test(styles, element);
      if (!result.pass) {
        issues.push(result.message);
      }
    });

    if (issues.length === 0) {
      console.log(`%c✅ OK: ${name}`, 'color: #10b981');
      addOverlay(element, '#10b981', '✓ OK');
      results.good.push(name);
    } else if (issues.every(i => i.includes('warning'))) {
      console.warn(`⚠️  WARN: ${name}`, issues);
      addOverlay(element, '#f59e0b', '⚠ Warning');
      results.warnings.push({ name, issues });
    } else {
      console.error(`❌ ERROR: ${name}`, issues);
      addOverlay(element, '#ef4444', '✗ Error');
      results.errors.push({ name, issues });
    }
  }

  // ==================== CHECKS ====================

  const borderRadiusCheck = (min, max) => ({
    test: (styles) => {
      const br = parseInt(styles.borderRadius);
      if (br === 0) return { pass: true };
      return {
        pass: br >= min && br <= max,
        message: `Border-radius ${br}px outside range ${min}-${max}px (warning)`
      };
    }
  });

  const spacingCheck = (property, min, max) => ({
    test: (styles) => {
      const value = parseInt(styles[property]);
      return {
        pass: value >= min && value <= max,
        message: `${property} ${value}px outside range ${min}-${max}px (warning)`
      };
    }
  });

  const shadowCheck = {
    test: (styles) => {
      const shadow = styles.boxShadow;
      return {
        pass: shadow && shadow !== 'none',
        message: 'Missing box-shadow (warning)'
      };
    }
  };

  const backdropFilterCheck = {
    test: (styles) => {
      const filter = styles.backdropFilter;
      return {
        pass: filter && filter.includes('blur'),
        message: 'Missing backdrop-filter blur (error)'
      };
    }
  };

  const transitionCheck = {
    test: (styles) => {
      const transition = styles.transition;
      return {
        pass: transition && transition !== 'none' && !transition.includes('all 0s'),
        message: 'Missing CSS transitions (warning)'
      };
    }
  };

  const widthCheck = (expected) => ({
    test: (styles) => {
      const width = styles.width;
      return {
        pass: width === expected,
        message: `Width ${width} !== ${expected} (error)`
      };
    }
  });

  // ==================== RUN INSPECTIONS ====================

  console.log('%c🔍 Starting visual inspection...', 'font-weight: bold');
  console.log('');

  // Activity Bar
  inspect('.activity-bar', 'Activity Bar', [
    widthCheck('48px'),
    { test: (styles) => ({ pass: styles.position === 'fixed', message: 'Position not fixed (error)' }) }
  ]);

  // Sidebar
  inspect('.sidebar', 'Sidebar', [
    widthCheck('220px'),
    backdropFilterCheck,
    { test: (styles) => ({ pass: styles.position === 'fixed', message: 'Position not fixed (error)' }) }
  ]);

  // Service Cards
  const cards = document.querySelectorAll('.service-card');
  cards.forEach((card, idx) => {
    const styles = window.getComputedStyle(card);
    const br = parseInt(styles.borderRadius);
    const shadow = styles.boxShadow;
    const padding = parseInt(styles.padding);

    const issues = [];
    if (br < 16 || br > 24) issues.push(`border-radius ${br}px (warning)`);
    if (!shadow || shadow === 'none') issues.push('no box-shadow (warning)');
    if (padding < 16 || padding > 32) issues.push(`padding ${padding}px (warning)`);

    if (issues.length === 0) {
      addOverlay(card, '#10b981', `Card ${idx + 1} ✓`);
    } else {
      addOverlay(card, '#f59e0b', `Card ${idx + 1} ⚠`);
      console.warn(`⚠️  Service Card ${idx + 1}:`, issues);
    }
  });

  // Buttons
  const buttons = document.querySelectorAll('button:not([disabled])');
  buttons.forEach((btn, idx) => {
    const styles = window.getComputedStyle(btn);
    const br = parseInt(styles.borderRadius);
    const transition = styles.transition;

    const issues = [];
    if (br < 8 || br > 24) issues.push(`border-radius ${br}px (warning)`);
    if (!transition || transition === 'none') issues.push('no transitions (warning)');

    if (issues.length === 0 && idx < 5) {
      addOverlay(btn, '#10b981', `Btn ${idx + 1} ✓`);
    } else if (issues.length > 0 && idx < 5) {
      addOverlay(btn, '#f59e0b', `Btn ${idx + 1} ⚠`);
    }
  });

  // Context Toolbar
  inspect('.context-toolbar', 'Context Toolbar', [
    backdropFilterCheck,
    borderRadiusCheck(16, 24),
    shadowCheck
  ]);

  // Activity Bar Nav Items
  const navItems = document.querySelectorAll('.activity-bar__nav-item');
  navItems.forEach((item, idx) => {
    const styles = window.getComputedStyle(item);
    const transition = styles.transition;

    if (transition && transition !== 'none') {
      addOverlay(item, '#10b981', `Nav ${idx + 1} ✓`);
    } else {
      addOverlay(item, '#f59e0b', `Nav ${idx + 1} ⚠`);
    }
  });

  // ==================== SPACING ANALYSIS ====================

  console.log('');
  console.log('%c📏 Spacing Analysis', 'background: #3b82f6; color: white; padding: 5px; font-weight: bold');

  const activityBar = document.querySelector('.activity-bar');
  const sidebar = document.querySelector('.sidebar');
  const content = document.querySelector('.content');

  if (activityBar && sidebar && content) {
    const abRect = activityBar.getBoundingClientRect();
    const sidebarRect = sidebar.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();

    console.log('Activity Bar:', {
      width: `${abRect.width}px`,
      position: `${abRect.left}px from left`
    });

    console.log('Sidebar:', {
      width: `${sidebarRect.width}px`,
      position: `${sidebarRect.left}px from left`,
      gap: `${sidebarRect.left - abRect.right}px from Activity Bar`
    });

    console.log('Content:', {
      marginLeft: window.getComputedStyle(content).marginLeft,
      position: `${contentRect.left}px from left`,
      gap: `${contentRect.left - sidebarRect.right}px from Sidebar`
    });

    // Draw spacing lines
    const spacingLine1 = document.createElement('div');
    spacingLine1.className = 'css-inspector-overlay';
    spacingLine1.style.cssText = `
      position: fixed;
      left: ${abRect.right}px;
      top: 50%;
      width: ${sidebarRect.left - abRect.right}px;
      height: 2px;
      background: #ec4899;
      z-index: 999999;
    `;
    document.body.appendChild(spacingLine1);

    const spacingLine2 = document.createElement('div');
    spacingLine2.className = 'css-inspector-overlay';
    spacingLine2.style.cssText = `
      position: fixed;
      left: ${sidebarRect.right}px;
      top: 50%;
      width: ${contentRect.left - sidebarRect.right}px;
      height: 2px;
      background: #ec4899;
      z-index: 999999;
    `;
    document.body.appendChild(spacingLine2);
  }

  // ==================== COLOR ANALYSIS ====================

  console.log('');
  console.log('%c🎨 Color Analysis', 'background: #3b82f6; color: white; padding: 5px; font-weight: bold');

  const elementsToCheck = [
    { selector: '.activity-bar', name: 'Activity Bar' },
    { selector: '.sidebar', name: 'Sidebar' },
    { selector: '.btn--primary', name: 'Primary Button' },
    { selector: '.service-card', name: 'Service Card' }
  ];

  elementsToCheck.forEach(({ selector, name }) => {
    const el = document.querySelector(selector);
    if (el) {
      const styles = window.getComputedStyle(el);
      console.log(`${name}:`, {
        background: styles.backgroundColor,
        color: styles.color,
        border: styles.borderColor
      });
    }
  });

  // ==================== SUMMARY ====================

  console.log('');
  console.log('%c' + '='.repeat(80), 'color: #6b7280');
  console.log('%c📊 VISUAL INSPECTION SUMMARY', 'background: #ec4899; color: white; padding: 10px; font-size: 16px; font-weight: bold');
  console.log('%c' + '='.repeat(80), 'color: #6b7280');
  console.log('');

  console.log(`%c✅ Good: ${results.good.length}`, 'color: #10b981; font-weight: bold');
  console.log(`%c⚠️  Warnings: ${results.warnings.length}`, 'color: #f59e0b; font-weight: bold');
  console.log(`%c❌ Errors: ${results.errors.length}`, 'color: #ef4444; font-weight: bold');
  console.log('');

  if (results.errors.length > 0) {
    console.log('%cCritical Errors:', 'background: #ef4444; color: white; padding: 5px');
    results.errors.forEach(err => {
      console.log(`  • ${err.name}`);
      err.issues.forEach(issue => console.log(`    - ${issue}`));
    });
  }

  console.log('');
  console.log('%cInspection overlays are now visible on the page!', 'background: #ec4899; color: white; padding: 10px');
  console.log('Run this to remove overlays: document.querySelectorAll(".css-inspector-overlay").forEach(el => el.remove())');
  console.log('');

  return results;
})();
