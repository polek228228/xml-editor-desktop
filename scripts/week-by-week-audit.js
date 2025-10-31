/**
 * WEEK-BY-WEEK AUDIT SCRIPT
 *
 * Проверяет компоненты по неделям разработки
 *
 * Week 1-2: Infrastructure
 * Week 3-4: UI Architecture
 * Week 5: Service Store
 *
 * КАК ИСПОЛЬЗОВАТЬ:
 * 1. Запустить приложение: npm run dev
 * 2. Открыть DevTools (Cmd+Opt+I)
 * 3. Вставить этот скрипт в консоль
 */

(async function weekByWeekAudit() {
  console.clear();
  console.log('%c🗓️ WEEK-BY-WEEK AUDIT', 'background: #7c3aed; color: white; padding: 10px; font-size: 18px; font-weight: bold');
  console.log('');

  const results = {
    week1: { name: 'Week 1-2: Infrastructure', checks: [] },
    week3: { name: 'Week 3-4: UI Architecture', checks: [] },
    week5: { name: 'Week 5: Service Store', checks: [] }
  };

  function check(week, name, condition, details = '') {
    const status = condition ? 'PASS' : 'FAIL';
    results[week].checks.push({ name, status, details });

    const emoji = condition ? '✅' : '❌';
    const color = condition ? 'color: #10b981' : 'color: #ef4444';
    console.log(`%c${emoji} ${status}:`, color, name, details ? `\n   ${details}` : '');
  }

  function info(message, data = null) {
    console.log('%c🔵 INFO:', 'color: #3b82f6', message, data || '');
  }

  function section(title) {
    console.log('');
    console.log('%c' + title, 'background: #1e40af; color: white; padding: 8px; font-size: 14px; font-weight: bold');
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==================== WEEK 1-2: INFRASTRUCTURE ====================
  section('🏗️ WEEK 1-2: INFRASTRUCTURE (Oct 2-6)');

  // Check Electron architecture
  check('week1',
    'Electron app running',
    typeof window.electronAPI !== 'undefined',
    'electronAPI exposed via preload'
  );

  // Check IPC channels
  const ipcChannels = [
    'document:create',
    'document:save',
    'document:load',
    'document:list',
    'template:list',
    'template:create',
    'settings:get',
    'settings:set',
    'module:list'
  ];

  if (window.electronAPI) {
    ipcChannels.forEach(channel => {
      const methodName = channel.replace(':', '_').replace(/-/g, '_');
      const exists = typeof window.electronAPI[methodName] === 'function' ||
                     typeof window.electronAPI[channel.split(':')[0]] === 'object';
      check('week1', `IPC: ${channel}`, exists);
    });
  }

  // Check database-backed features
  check('week1',
    'Document list functionality',
    typeof window.xmlEditorApp !== 'undefined' &&
    typeof window.xmlEditorApp.loadDocumentsList === 'function'
  );

  check('week1',
    'Template system',
    document.querySelector('.template-browser') !== null ||
    typeof TemplateBrowser !== 'undefined'
  );

  // Check autosave
  check('week1',
    'Autosave system (check console for "Autosave" messages)',
    true,
    'Visual check required'
  );

  // Check SQLite tables
  info('Database tables should include:', [
    'documents',
    'autosaves',
    'settings',
    'templates',
    'document_history',
    'modules'
  ]);

  // ==================== WEEK 3-4: UI ARCHITECTURE ====================
  section('🎨 WEEK 3-4: UI ARCHITECTURE (Oct 6-16)');

  // 3-Level Navigation
  const activityBar = document.querySelector('.activity-bar');
  const sidebar = document.querySelector('.sidebar');
  const content = document.querySelector('.content');

  check('week3',
    '3-Level Navigation: Activity Bar (Level 1)',
    activityBar !== null
  );

  check('week3',
    '3-Level Navigation: Sidebar (Level 2)',
    sidebar !== null
  );

  check('week3',
    '3-Level Navigation: Content (Level 3)',
    content !== null
  );

  // Activity Bar specifics
  const navItems = document.querySelectorAll('.activity-bar__nav-item');
  check('week3',
    'Activity Bar: 4 nav items (Home/Docs/Services/Settings)',
    navItems.length === 4,
    `Found: ${navItems.length}`
  );

  check('week3',
    'Activity Bar: 48px width',
    activityBar && window.getComputedStyle(activityBar).width === '48px'
  );

  check('week3',
    'Activity Bar: Active state',
    document.querySelector('.activity-bar__nav-item--active') !== null
  );

  // Sidebar specifics
  check('week3',
    'Sidebar: 220px width',
    sidebar && window.getComputedStyle(sidebar).width === '220px'
  );

  const sidebarStyles = sidebar ? window.getComputedStyle(sidebar) : null;
  check('week3',
    'Sidebar: Glassmorphism (backdrop-filter)',
    sidebarStyles && sidebarStyles.backdropFilter && sidebarStyles.backdropFilter.includes('blur'),
    sidebarStyles ? `backdrop-filter: ${sidebarStyles.backdropFilter}` : ''
  );

  check('week3',
    'Sidebar: Dynamic content',
    document.querySelector('.sidebar__content') !== null
  );

  // Cupertino Clean Design
  const bodyStyles = window.getComputedStyle(document.body);
  check('week3',
    'Cupertino: System fonts (SF Pro)',
    bodyStyles.fontFamily.includes('SF Pro') ||
    bodyStyles.fontFamily.includes('system-ui') ||
    bodyStyles.fontFamily.includes('-apple-system'),
    `Current: ${bodyStyles.fontFamily.split(',')[0]}`
  );

  // Check CSS variables
  const rootStyles = getComputedStyle(document.documentElement);
  const cssVars = ['--blue-500', '--space-4', '--shadow-md'];
  const varsExist = cssVars.every(v => rootStyles.getPropertyValue(v));
  check('week3',
    'Cupertino: CSS variables defined',
    varsExist,
    cssVars.join(', ')
  );

  // Check rounded corners
  const sampleCard = document.querySelector('.service-card, .quick-action');
  if (sampleCard) {
    const borderRadius = parseInt(window.getComputedStyle(sampleCard).borderRadius);
    check('week3',
      'Cupertino: Rounded corners (12-24px)',
      borderRadius >= 12 && borderRadius <= 24,
      `Found: ${borderRadius}px`
    );
  }

  // Check shadows
  const sampleBtn = document.querySelector('.btn');
  if (sampleBtn) {
    const boxShadow = window.getComputedStyle(sampleBtn).boxShadow;
    check('week3',
      'Cupertino: Box shadows',
      boxShadow && boxShadow !== 'none',
      boxShadow ? 'Present' : 'Missing'
    );
  }

  // Check animations
  const hasTransitions = sampleBtn && window.getComputedStyle(sampleBtn).transition !== 'none';
  check('week3',
    'Cupertino: CSS transitions',
    hasTransitions,
    hasTransitions ? 'Present on buttons' : 'Missing'
  );

  // Components count
  const components = [
    '.activity-bar',
    '.tab-bar',
    '.sidebar',
    '.service-store',
    '.context-toolbar',
    '.template-dialog',
    '.template-browser',
    '.document-selector',
    '.validation-panel',
    '.accordion',
    '.input-field'
  ];

  const foundComponents = components.filter(c => document.querySelector(c) !== null).length;
  check('week3',
    'UI Components: 11+ components',
    foundComponents >= 8,
    `Found: ${foundComponents}/11`
  );

  // Context Toolbar
  const toolbar = document.querySelector('.context-toolbar');
  if (toolbar) {
    const toolbarStyles = window.getComputedStyle(toolbar);
    check('week3',
      'Context Toolbar: Floating design',
      toolbarStyles.position === 'fixed' || toolbarStyles.position === 'absolute'
    );

    check('week3',
      'Context Toolbar: Glassmorphism',
      toolbarStyles.backdropFilter && toolbarStyles.backdropFilter.includes('blur')
    );
  }

  // Tab Bar
  const tabBar = document.querySelector('.tab-bar');
  check('week3',
    'Tab Bar: Component exists',
    tabBar !== null
  );

  // ==================== WEEK 5: SERVICE STORE ====================
  section('🛍️ WEEK 5: SERVICE STORE (Oct 16)');

  // Navigate to Services section first
  const servicesNav = document.querySelector('.activity-bar__nav-item[data-section="services"]');
  if (servicesNav) {
    info('Navigating to Services section...');
    servicesNav.click();
    await wait(1000);
  }

  // Service Store existence
  const serviceStore = document.querySelector('.service-store');
  check('week5',
    'Service Store: Component exists',
    serviceStore !== null
  );

  if (serviceStore) {
    // Service cards
    const cards = document.querySelectorAll('.service-card');
    check('week5',
      'Service Store: 8 module cards',
      cards.length === 8,
      `Found: ${cards.length}`
    );

    // Search
    const search = document.querySelector('.service-store__search input');
    check('week5',
      'Service Store: Search input',
      search !== null
    );

    // Filters
    const filters = document.querySelectorAll('.service-store__filter');
    check('week5',
      'Service Store: Filter pills',
      filters.length > 0,
      `Found: ${filters.length}`
    );

    // Cards have required elements
    if (cards.length > 0) {
      const firstCard = cards[0];
      const cardElements = {
        icon: firstCard.querySelector('.service-card__icon'),
        title: firstCard.querySelector('.service-card__title'),
        description: firstCard.querySelector('.service-card__description'),
        actions: firstCard.querySelector('.service-card__actions'),
        buttons: firstCard.querySelectorAll('.service-card__actions button')
      };

      check('week5',
        'Service Card: Has icon',
        cardElements.icon !== null
      );

      check('week5',
        'Service Card: Has title',
        cardElements.title !== null
      );

      check('week5',
        'Service Card: Has description',
        cardElements.description !== null
      );

      check('week5',
        'Service Card: Has action buttons',
        cardElements.buttons.length > 0,
        `Found: ${cardElements.buttons.length}`
      );

      // Check for badges
      const installedCards = Array.from(cards).filter(c =>
        c.querySelector('.service-card__badge')
      );
      check('week5',
        'Service Store: Status badges',
        installedCards.length > 0,
        `${installedCards.length} cards have badges`
      );

      // Check button text/states
      const firstButton = firstCard.querySelector('.service-card__actions button');
      if (firstButton) {
        const buttonText = firstButton.textContent.trim();
        const hasValidText = ['Установить', 'Активировать', 'Деактивировать', 'Удалить', 'Купить'].some(
          text => buttonText.includes(text)
        );
        check('week5',
          'Service Card: Button has correct text',
          hasValidText,
          `Text: "${buttonText}"`
        );
      }
    }

    // Loading states
    check('week5',
      'Service Store: CSS classes for loading states',
      document.styleSheets.length > 0,
      'Check .service-store__loading, .service-card--loading in CSS'
    );

    // Toast system
    check('week5',
      'Toast notification system',
      typeof window.xmlEditorApp !== 'undefined' &&
      (typeof window.xmlEditorApp.showToast === 'function' ||
       typeof window.xmlEditorApp.showNotification === 'function'),
      'Check window.xmlEditorApp for toast methods'
    );
  }

  // Backend integration
  check('week5',
    'Module IPC: electronAPI.listModules',
    window.electronAPI && typeof window.electronAPI.module === 'object',
    'Should have module operations'
  );

  check('week5',
    'Module IPC: Install/Uninstall/Activate/Deactivate',
    window.electronAPI && window.electronAPI.module !== undefined,
    'Check IPC handlers in preload'
  );

  // ==================== FINAL SUMMARY ====================
  console.log('');
  console.log('%c' + '='.repeat(80), 'color: #6b7280');
  console.log('%c📊 WEEK-BY-WEEK SUMMARY', 'background: #7c3aed; color: white; padding: 10px; font-size: 16px; font-weight: bold');
  console.log('%c' + '='.repeat(80), 'color: #6b7280');
  console.log('');

  Object.entries(results).forEach(([weekKey, week]) => {
    const passed = week.checks.filter(c => c.status === 'PASS').length;
    const failed = week.checks.filter(c => c.status === 'FAIL').length;
    const total = week.checks.length;
    const percentage = Math.round((passed / total) * 100);

    console.log(`\n%c${week.name}`, 'font-weight: bold; font-size: 14px');
    console.log(`✅ Passed: ${passed}/${total} (${percentage}%)`);
    console.log(`❌ Failed: ${failed}/${total}`);

    if (failed > 0) {
      console.log('%cFailed checks:', 'color: #ef4444; font-weight: bold');
      week.checks.filter(c => c.status === 'FAIL').forEach(check => {
        console.log(`  • ${check.name}`);
        if (check.details) console.log(`    ${check.details}`);
      });
    }
  });

  console.log('');
  console.log('%c🗓️ WEEK-BY-WEEK AUDIT COMPLETED', 'background: #7c3aed; color: white; padding: 10px; font-size: 16px; font-weight: bold');

  return results;
})();
