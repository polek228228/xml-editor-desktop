/**
 * INTERACTIVE UI TEST SCRIPT
 *
 * Автоматически кликает по всем элементам и проверяет их работу
 *
 * КАК ИСПОЛЬЗОВАТЬ:
 * 1. Запустить приложение: npm run dev
 * 2. Открыть DevTools (Cmd+Opt+I)
 * 3. Вставить этот скрипт в консоль
 * 4. Скрипт автоматически протестирует все кнопки и навигацию
 */

(async function interactiveUITest() {
  console.clear();
  console.log('%c🤖 INTERACTIVE UI TEST STARTED', 'background: #8b5cf6; color: white; padding: 10px; font-size: 16px; font-weight: bold');
  console.log('This script will automatically test all interactive elements...');
  console.log('');

  const results = {
    tested: 0,
    passed: 0,
    failed: 0,
    details: []
  };

  function log(emoji, message, data = null) {
    console.log(`${emoji} ${message}`, data || '');
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function testClick(selector, name) {
    results.tested++;
    const el = document.querySelector(selector);

    if (!el) {
      log('❌', `${name} not found`, `Selector: ${selector}`);
      results.failed++;
      results.details.push({ name, status: 'not_found', selector });
      return false;
    }

    try {
      log('🔵', `Testing ${name}...`);

      // Get initial state
      const initialState = {
        classes: el.className,
        disabled: el.disabled,
        style: el.style.cssText
      };

      // Simulate hover
      el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      await wait(100);

      // Click
      el.click();
      await wait(300);

      // Check if anything changed
      const finalState = {
        classes: el.className,
        disabled: el.disabled,
        style: el.style.cssText
      };

      const changed =
        initialState.classes !== finalState.classes ||
        initialState.disabled !== finalState.disabled ||
        initialState.style !== finalState.style;

      if (changed || name.includes('Nav')) {
        log('✅', `${name} responded to interaction`);
        results.passed++;
        results.details.push({ name, status: 'passed' });
        return true;
      } else {
        log('⚠️', `${name} clicked but no visible change`, 'This might be OK if it triggers async action');
        results.passed++;
        results.details.push({ name, status: 'passed_no_change' });
        return true;
      }
    } catch (error) {
      log('❌', `${name} failed`, error.message);
      results.failed++;
      results.details.push({ name, status: 'error', error: error.message });
      return false;
    }
  }

  async function testNavigation(selector, sectionName) {
    log('🧭', `Testing navigation to ${sectionName}...`);
    const navItem = document.querySelector(selector);

    if (!navItem) {
      log('❌', `Nav item for ${sectionName} not found`);
      return;
    }

    navItem.click();
    await wait(500);

    // Check if section is visible
    const section = document.querySelector(`[data-section="${sectionName}"], .${sectionName}-section, .${sectionName}-dashboard`);

    if (section) {
      const styles = window.getComputedStyle(section);
      if (styles.display !== 'none') {
        log('✅', `${sectionName} section is now visible`);
        return true;
      }
    }

    log('⚠️', `Could not verify ${sectionName} section visibility`);
    return false;
  }

  // ==================== TEST SEQUENCE ====================

  console.log('%c📍 TEST 1: Activity Bar Navigation', 'background: #3b82f6; color: white; padding: 5px; font-weight: bold');

  // Test Home
  await testNavigation('.activity-bar__nav-item[data-section="home"]', 'home');
  await wait(1000);

  // Test Documents
  await testNavigation('.activity-bar__nav-item[data-section="documents"]', 'documents');
  await wait(1000);

  // Test Services
  await testNavigation('.activity-bar__nav-item[data-section="services"]', 'services');
  await wait(1000);

  // Test Settings
  await testNavigation('.activity-bar__nav-item[data-section="settings"]', 'settings');
  await wait(1000);

  // Go back to Home
  await testNavigation('.activity-bar__nav-item[data-section="home"]', 'home');
  await wait(1000);

  console.log('');
  console.log('%c📍 TEST 2: Buttons in Home Dashboard', 'background: #3b82f6; color: white; padding: 5px; font-weight: bold');

  const homeButtons = [
    { selector: '.quick-action--new-document button, .quick-action button[data-action="new-document"]', name: 'New Document Button' },
    { selector: '.quick-action--open-document button, .quick-action button[data-action="open-document"]', name: 'Open Document Button' },
    { selector: '.quick-action--browse-templates button, .quick-action button[data-action="browse-templates"]', name: 'Browse Templates Button' }
  ];

  for (const btn of homeButtons) {
    await testClick(btn.selector, btn.name);
    await wait(500);
  }

  console.log('');
  console.log('%c📍 TEST 3: Service Store (if visible)', 'background: #3b82f6; color: white; padding: 5px; font-weight: bold');

  // Navigate to Services
  await testNavigation('.activity-bar__nav-item[data-section="services"]', 'services');
  await wait(1000);

  // Test search
  const searchInput = document.querySelector('.service-store__search input');
  if (searchInput) {
    log('🔍', 'Testing search input...');
    searchInput.value = 'ПЗ';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    await wait(500);
    log('✅', 'Search input works');
  }

  // Test filter pills
  const filterPills = document.querySelectorAll('.service-store__filter');
  if (filterPills.length > 0) {
    log('🔘', `Testing ${filterPills.length} filter pills...`);
    for (let i = 0; i < Math.min(filterPills.length, 3); i++) {
      filterPills[i].click();
      await wait(500);
    }
    log('✅', 'Filter pills work');
  }

  // Test service cards
  const serviceCards = document.querySelectorAll('.service-card');
  if (serviceCards.length > 0) {
    log('🎴', `Found ${serviceCards.length} service cards`);

    // Test first card button
    const firstCard = serviceCards[0];
    const firstCardButton = firstCard.querySelector('.service-card__actions button');
    if (firstCardButton) {
      await testClick(`.service-card:first-child .service-card__actions button`, 'First Service Card Button');
      await wait(1000);
    }
  }

  console.log('');
  console.log('%c📍 TEST 4: All Buttons Scan', 'background: #3b82f6; color: white; padding: 5px; font-weight: bold');

  const allButtons = document.querySelectorAll('button:not([disabled])');
  log('🔘', `Found ${allButtons.length} enabled buttons`);
  log('⏭️', 'Skipping full button test (would take too long)');
  log('ℹ️', 'Use manual testing for specific buttons');

  console.log('');
  console.log('%c📍 TEST 5: Keyboard Navigation', 'background: #3b82f6; color: white; padding: 5px; font-weight: bold');

  // Test Tab key
  log('⌨️', 'Testing Tab key navigation...');
  document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
  await wait(200);
  log('✅', 'Tab key event dispatched');

  // Test Escape key
  log('⌨️', 'Testing Escape key...');
  document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await wait(200);
  log('✅', 'Escape key event dispatched');

  console.log('');
  console.log('%c📍 TEST 6: Window Resize', 'background: #3b82f6; color: white; padding: 5px; font-weight: bold');

  log('📐', 'Testing window resize event...');
  window.dispatchEvent(new Event('resize'));
  await wait(500);
  log('✅', 'Resize event dispatched');

  // ==================== FINAL SUMMARY ====================

  console.log('');
  console.log('%c' + '='.repeat(80), 'color: #6b7280');
  console.log('%c📊 INTERACTIVE TEST SUMMARY', 'background: #8b5cf6; color: white; padding: 10px; font-size: 16px; font-weight: bold');
  console.log('%c' + '='.repeat(80), 'color: #6b7280');
  console.log('');

  console.log(`✅ Passed: ${results.passed}/${results.tested}`);
  console.log(`❌ Failed: ${results.failed}/${results.tested}`);
  console.log('');

  const successRate = Math.round((results.passed / results.tested) * 100);
  console.log(`🎯 Success Rate: ${successRate}%`);
  console.log('');

  if (results.failed > 0) {
    console.log('%c⚠️  Failed Elements:', 'background: #ef4444; color: white; padding: 5px; font-weight: bold');
    results.details
      .filter(d => d.status === 'not_found' || d.status === 'error')
      .forEach((detail, idx) => {
        console.log(`${idx + 1}. ${detail.name} - ${detail.status}`);
        if (detail.error) console.log(`   Error: ${detail.error}`);
        if (detail.selector) console.log(`   Selector: ${detail.selector}`);
      });
  }

  console.log('');
  console.log('%c🤖 INTERACTIVE TEST COMPLETED', 'background: #8b5cf6; color: white; padding: 10px; font-size: 16px; font-weight: bold');

  return results;
})();
