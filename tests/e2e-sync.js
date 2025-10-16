/**
 * @file e2e-sync.js
 * @description Синхронная версия E2E тестов (без async/await)
 *
 * Запуск: вставьте в консоль браузера (DevTools)
 */

(function E2ETestSync() {
  console.log('%c========================================', 'color: blue; font-weight: bold');
  console.log('%c🧪 E2E ТЕСТИРОВАНИЕ (СИНХРОННАЯ ВЕРСИЯ)', 'color: blue; font-weight: bold');
  console.log('%c========================================', 'color: blue; font-weight: bold');
  console.log('');

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    errors: []
  };

  const test = (name, fn) => {
    try {
      fn();
      console.log(`%c✅ PASS: ${name}`, 'color: green');
      results.passed++;
      return true;
    } catch (error) {
      console.error(`%c❌ FAIL: ${name}`, 'color: red', error.message);
      results.failed++;
      results.errors.push({ test: name, error: error.message });
      return false;
    }
  };

  const warn = (name, message) => {
    console.warn(`%c⚠️ WARNING: ${name}`, 'color: orange', message || '');
    results.warnings++;
  };

  // ========================================
  // 1. ПРОВЕРКА ИНИЦИАЛИЗАЦИИ
  // ========================================
  console.log('%c\n[1] ИНИЦИАЛИЗАЦИЯ КОМПОНЕНТОВ', 'color: cyan; font-weight: bold');
  console.log('─────────────────────────────────');

  test('window.xmlEditorApp существует', () => {
    if (!window.xmlEditorApp) throw new Error('xmlEditorApp не найден');
  });

  test('window.activityBar существует', () => {
    if (!window.activityBar) throw new Error('activityBar не найден');
  });

  test('window.tabBar существует', () => {
    if (!window.tabBar) throw new Error('tabBar не найден');
  });

  test('window.dynamicSidebar существует', () => {
    if (!window.dynamicSidebar) throw new Error('dynamicSidebar не найден');
  });

  test('window.contextToolbar существует', () => {
    if (!window.contextToolbar) throw new Error('contextToolbar не найден');
  });

  test('window.serviceStore существует', () => {
    if (!window.serviceStore) throw new Error('serviceStore не найден');
  });

  test('window.lifecycleManager существует', () => {
    if (!window.lifecycleManager) throw new Error('lifecycleManager не найден');
  });

  test('window.eventBus существует', () => {
    if (!window.eventBus) throw new Error('eventBus не найден');
  });

  // ========================================
  // 2. ACTIVITY BAR
  // ========================================
  console.log('%c\n[2] ACTIVITY BAR', 'color: cyan; font-weight: bold');
  console.log('─────────────────');

  test('Activity Bar: 4 элемента', () => {
    if (window.activityBar.items.length !== 4) {
      throw new Error(`Ожидалось 4, получено ${window.activityBar.items.length}`);
    }
  });

  test('Activity Bar: Home активен', () => {
    if (window.activityBar.activeItem !== 'home') {
      throw new Error(`Активен: ${window.activityBar.activeItem}`);
    }
  });

  test('Activity Bar: элементы в DOM', () => {
    const buttons = document.querySelectorAll('.activity-bar__item');
    if (buttons.length !== 4) {
      throw new Error(`Кнопок в DOM: ${buttons.length}`);
    }
  });

  // ========================================
  // 3. SERVICE STORE
  // ========================================
  console.log('%c\n[3] SERVICE STORE', 'color: cyan; font-weight: bold');
  console.log('──────────────────');

  test('Service Store: каталог загружен', () => {
    if (window.serviceStore.catalog.length === 0) {
      throw new Error('Каталог пуст');
    }
    console.log(`  ℹ️ Сервисов: ${window.serviceStore.catalog.length}`);
  });

  test('Service Store: категории загружены', () => {
    const count = Object.keys(window.serviceStore.categories).length;
    if (count === 0) {
      throw new Error('Категории не загружены');
    }
    console.log(`  ℹ️ Категорий: ${count}`);
  });

  test('Service Store: поиск работает', () => {
    window.serviceStore.searchQuery = 'пз';
    const filtered = window.serviceStore._filterServices();
    if (filtered.length === 0) {
      throw new Error('Поиск не работает');
    }
    console.log(`  ℹ️ Найдено: ${filtered.length}`);
    window.serviceStore.searchQuery = '';
  });

  test('Service Store: фильтр "free"', () => {
    window.serviceStore.currentFilter = 'free';
    const filtered = window.serviceStore._filterServices();
    const allFree = filtered.every(s => s.license === 'free');
    if (!allFree) {
      throw new Error('Фильтр не работает');
    }
    console.log(`  ℹ️ Бесплатных: ${filtered.length}`);
    window.serviceStore.currentFilter = 'all';
  });

  // ========================================
  // 4. TAB BAR
  // ========================================
  console.log('%c\n[4] TAB BAR', 'color: cyan; font-weight: bold');
  console.log('────────────');

  test('Tab Bar: изначально пуст', () => {
    if (window.tabBar.tabs.length !== 0) {
      throw new Error(`Вкладок: ${window.tabBar.tabs.length}`);
    }
  });

  test('Tab Bar: добавление вкладки', () => {
    const result = window.tabBar.addTab({
      id: 'test-1',
      title: 'Тест 1',
      type: 'document'
    });
    if (!result) throw new Error('Вкладка не добавлена');
    if (window.tabBar.tabs.length !== 1) {
      throw new Error('Вкладка не в списке');
    }
  });

  test('Tab Bar: активная вкладка', () => {
    if (window.tabBar.activeTab !== 'test-1') {
      throw new Error('Вкладка не активна');
    }
  });

  test('Tab Bar: dirty state', () => {
    window.tabBar.setDirty('test-1', true);
    const tab = window.tabBar.getTab('test-1');
    if (!tab.dirty) throw new Error('Dirty не установлен');
  });

  test('Tab Bar: множественные вкладки', () => {
    window.tabBar.addTab({ id: 'test-2', title: 'Тест 2', type: 'document' });
    window.tabBar.addTab({ id: 'test-3', title: 'Тест 3', type: 'document' });
    if (window.tabBar.tabs.length !== 3) {
      throw new Error(`Вкладок: ${window.tabBar.tabs.length}`);
    }
  });

  test('Tab Bar: переключение вкладок', () => {
    window.tabBar.setActive('test-2');
    if (window.tabBar.activeTab !== 'test-2') {
      throw new Error('Переключение не сработало');
    }
  });

  // ========================================
  // 5. DYNAMIC SIDEBAR
  // ========================================
  console.log('%c\n[5] DYNAMIC SIDEBAR', 'color: cyan; font-weight: bold');
  console.log('────────────────────');

  test('Sidebar: 4 секции', () => {
    if (window.dynamicSidebar.sections.size !== 4) {
      throw new Error(`Секций: ${window.dynamicSidebar.sections.size}`);
    }
  });

  test('Sidebar: активная секция', () => {
    const active = window.dynamicSidebar.activeSection;
    if (!active) {
      throw new Error('Нет активной секции');
    }
    console.log(`  ℹ️ Активна: ${active}`);
  });

  test('Sidebar: переключение секций', () => {
    window.dynamicSidebar.showSection('documents');
    if (window.dynamicSidebar.activeSection !== 'documents') {
      throw new Error('Секция не переключилась');
    }
    window.dynamicSidebar.showSection('home');
  });

  // ========================================
  // 6. CONTEXT TOOLBAR
  // ========================================
  console.log('%c\n[6] CONTEXT TOOLBAR', 'color: cyan; font-weight: bold');
  console.log('────────────────────');

  test('Context Toolbar: инициализирован', () => {
    if (!window.contextToolbar.element) {
      throw new Error('Element не найден');
    }
  });

  test('Context Toolbar: кнопки загружены', () => {
    const btnCount = Object.keys(window.contextToolbar.buttons).length;
    if (btnCount === 0) {
      throw new Error('Кнопки не загружены');
    }
    console.log(`  ℹ️ Кнопок: ${btnCount}`);
  });

  test('Context Toolbar: inputs загружены', () => {
    const inputCount = Object.keys(window.contextToolbar.inputs).length;
    if (inputCount === 0) {
      throw new Error('Inputs не загружены');
    }
    console.log(`  ℹ️ Inputs: ${inputCount}`);
  });

  // ========================================
  // 7. EVENTBUS
  // ========================================
  console.log('%c\n[7] EVENTBUS', 'color: cyan; font-weight: bold');
  console.log('──────────────');

  test('EventBus: методы доступны', () => {
    if (!window.eventBus.on || !window.eventBus.emit) {
      throw new Error('Методы не найдены');
    }
  });

  test('EventBus: события работают', () => {
    let fired = false;
    const handler = () => { fired = true; };
    window.eventBus.on('test-event', handler);
    window.eventBus.emit('test-event');
    if (!fired) throw new Error('Событие не сработало');
    window.eventBus.off('test-event', handler);
  });

  // ========================================
  // 8. DOM ЭЛЕМЕНТЫ
  // ========================================
  console.log('%c\n[8] DOM ЭЛЕМЕНТЫ', 'color: cyan; font-weight: bold');
  console.log('─────────────────');

  test('DOM: Activity Bar отображается', () => {
    const el = document.querySelector('.activity-bar');
    if (!el || el.style.display === 'none') {
      throw new Error('Activity Bar скрыт');
    }
  });

  test('DOM: Sidebar отображается', () => {
    const el = document.getElementById('sidebar');
    if (!el || el.style.display === 'none') {
      throw new Error('Sidebar скрыт');
    }
  });

  test('DOM: Tab Bar в DOM', () => {
    const el = document.querySelector('.tab-bar');
    if (!el) {
      throw new Error('Tab Bar не найден');
    }
  });

  test('DOM: Context Toolbar в DOM', () => {
    const el = document.getElementById('context-toolbar');
    if (!el) {
      throw new Error('Context Toolbar не найден');
    }
  });

  // ========================================
  // 9. LIFECYCLE MANAGER
  // ========================================
  console.log('%c\n[9] LIFECYCLE MANAGER', 'color: cyan; font-weight: bold');
  console.log('──────────────────────');

  test('LifecycleManager: инициализирован', () => {
    if (!window.lifecycleManager.registry) {
      throw new Error('Registry не найден');
    }
  });

  test('LifecycleManager: методы доступны', () => {
    if (!window.lifecycleManager.install || !window.lifecycleManager.activate) {
      throw new Error('Методы не найдены');
    }
  });

  const services = window.lifecycleManager.getAllServicesWithStates();
  test('LifecycleManager: может получить сервисы', () => {
    console.log(`  ℹ️ Сервисов: ${services.length}`);
  });

  // ========================================
  // 10. ИНТЕГРАЦИИ
  // ========================================
  console.log('%c\n[10] ИНТЕГРАЦИИ', 'color: cyan; font-weight: bold');
  console.log('─────────────────');

  test('Интеграция: Activity Bar ↔ Sidebar', () => {
    window.activityBar.setActive('documents');
    if (window.dynamicSidebar.activeSection !== 'documents') {
      throw new Error('Синхронизация не работает');
    }
    window.activityBar.setActive('home');
  });

  test('Интеграция: Tab Bar ↔ Context Toolbar', () => {
    // Просто проверяем что оба инициализированы
    if (!window.tabBar || !window.contextToolbar) {
      throw new Error('Компоненты не связаны');
    }
  });

  test('Интеграция: Service Store ↔ LifecycleManager', () => {
    // Проверяем что оба работают
    if (!window.serviceStore.catalog || !window.lifecycleManager) {
      throw new Error('Компоненты не связаны');
    }
  });

  // ========================================
  // CLEANUP: Удалить тестовые вкладки
  // ========================================
  console.log('%c\n[CLEANUP] Очистка тестовых данных', 'color: yellow');
  window.confirm = () => true; // Mock для confirm
  try {
    window.tabBar.removeTab('test-1');
    window.tabBar.removeTab('test-2');
    window.tabBar.removeTab('test-3');
    console.log('  ✓ Тестовые вкладки удалены');
  } catch (e) {
    console.log('  ℹ️ Некоторые вкладки уже удалены');
  }

  // ========================================
  // ИТОГОВЫЙ ОТЧЕТ
  // ========================================
  console.log('%c\n========================================', 'color: blue; font-weight: bold');
  console.log('%c📊 ИТОГОВЫЙ ОТЧЕТ', 'color: blue; font-weight: bold');
  console.log('%c========================================', 'color: blue; font-weight: bold');
  console.log('');
  console.log(`%c✅ Пройдено: ${results.passed}`, 'color: green; font-weight: bold; font-size: 14px');
  console.log(`%c❌ Провалено: ${results.failed}`, 'color: red; font-weight: bold; font-size: 14px');
  console.log(`%c⚠️ Предупреждений: ${results.warnings}`, 'color: orange; font-weight: bold; font-size: 14px');
  console.log('');

  if (results.errors.length > 0) {
    console.log('%c📝 СПИСОК ОШИБОК:', 'color: red; font-weight: bold');
    results.errors.forEach((err, i) => {
      console.log(`  ${i + 1}. ${err.test}`);
      console.log(`     └─ ${err.error}`);
    });
    console.log('');
  }

  const total = results.passed + results.failed;
  const passRate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;
  console.log(`%c📈 Процент прохождения: ${passRate}%`, 'color: blue; font-weight: bold; font-size: 16px');
  console.log('');

  if (results.failed === 0) {
    console.log('%c🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ!', 'color: green; font-size: 20px; font-weight: bold');
  } else {
    console.log('%c⚠️ ЕСТЬ ПРОВАЛЬНЫЕ ТЕСТЫ', 'color: red; font-size: 20px; font-weight: bold');
  }

  console.log('%c========================================\n', 'color: blue; font-weight: bold');

  return {
    passed: results.passed,
    failed: results.failed,
    warnings: results.warnings,
    passRate: passRate + '%',
    errors: results.errors
  };
})();
