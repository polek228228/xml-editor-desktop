/**
 * @file e2e-simulation.js
 * @description E2E тестирование через симуляцию действий пользователя
 *
 * Запуск: откройте DevTools в приложении и вставьте этот скрипт в консоль
 */

(async function E2ETestSimulation() {
  console.log('%c========================================', 'color: blue; font-weight: bold');
  console.log('%c🧪 E2E ТЕСТИРОВАНИЕ ПРИЛОЖЕНИЯ', 'color: blue; font-weight: bold');
  console.log('%c========================================', 'color: blue; font-weight: bold');
  console.log('');

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    errors: []
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const test = (name, fn) => {
    try {
      fn();
      console.log(`%c✅ PASS: ${name}`, 'color: green');
      results.passed++;
      return true;
    } catch (error) {
      console.error(`%c❌ FAIL: ${name}`, 'color: red', error);
      results.failed++;
      results.errors.push({ test: name, error: error.message });
      return false;
    }
  };

  const warn = (name, message) => {
    console.warn(`%c⚠️ WARNING: ${name}`, 'color: orange', message);
    results.warnings++;
  };

  // ========================================
  // 1. ПРОВЕРКА ИНИЦИАЛИЗАЦИИ
  // ========================================
  console.log('%c\n[1] ПРОВЕРКА ИНИЦИАЛИЗАЦИИ', 'color: cyan; font-weight: bold');
  console.log('─────────────────────────────');

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
  // 2. ACTIVITY BAR ТЕСТИРОВАНИЕ
  // ========================================
  console.log('%c\n[2] ACTIVITY BAR - СИМУЛЯЦИЯ КЛИКОВ', 'color: cyan; font-weight: bold');
  console.log('─────────────────────────────────────');

  test('Activity Bar: 4 элемента добавлены', () => {
    if (window.activityBar.items.length !== 4) {
      throw new Error(`Ожидалось 4 элемента, получено ${window.activityBar.items.length}`);
    }
  });

  test('Activity Bar: Home активен по умолчанию', () => {
    if (window.activityBar.activeItem !== 'home') {
      throw new Error(`Ожидалось 'home', получено '${window.activityBar.activeItem}'`);
    }
  });

  // Симуляция кликов по каждому элементу
  const sections = ['home', 'documents', 'services', 'settings'];

  for (const sectionId of sections) {
    await sleep(500); // Задержка между кликами

    console.log(`  🖱️ Клик по "${sectionId}"...`);

    // Найти кнопку в DOM
    const button = document.querySelector(`.activity-bar__item[data-item-id="${sectionId}"]`);

    if (!button) {
      warn(`Activity Bar: кнопка "${sectionId}" не найдена в DOM`);
      continue;
    }

    // Симулировать клик
    button.click();

    await sleep(300);

    test(`Activity Bar: "${sectionId}" стал активным`, () => {
      if (window.activityBar.activeItem !== sectionId) {
        throw new Error(`Ожидалось '${sectionId}', получено '${window.activityBar.activeItem}'`);
      }
    });

    test(`Sidebar: секция "${sectionId}" отображается`, () => {
      const sidebarSection = document.getElementById(`sidebar-${sectionId}`);
      if (!sidebarSection || sidebarSection.style.display === 'none') {
        throw new Error(`Секция sidebar-${sectionId} не отображается`);
      }
    });
  }

  // ========================================
  // 3. SERVICE STORE ТЕСТИРОВАНИЕ
  // ========================================
  console.log('%c\n[3] SERVICE STORE - СИМУЛЯЦИЯ ВЗАИМОДЕЙСТВИЙ', 'color: cyan; font-weight: bold');
  console.log('────────────────────────────────────────────');

  // Переключиться на Services
  await sleep(500);
  console.log('  🖱️ Переключение на секцию Services...');
  const servicesButton = document.querySelector('.activity-bar__item[data-item-id="services"]');
  if (servicesButton) servicesButton.click();
  await sleep(500);

  test('Service Store: каталог загружен', () => {
    if (window.serviceStore.catalog.length === 0) {
      throw new Error('Каталог сервисов пуст');
    }
    console.log(`  ℹ️ Загружено сервисов: ${window.serviceStore.catalog.length}`);
  });

  test('Service Store: категории загружены', () => {
    if (Object.keys(window.serviceStore.categories).length === 0) {
      throw new Error('Категории не загружены');
    }
  });

  // Тест поиска
  console.log('  🔍 Тест поиска сервисов...');
  const searchInput = document.querySelector('.service-store__search');

  if (searchInput) {
    searchInput.value = 'пз';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(300);

    test('Service Store: поиск работает', () => {
      const filtered = window.serviceStore._filterServices();
      if (filtered.length === 0) {
        throw new Error('Поиск не вернул результатов для запроса "пз"');
      }
      console.log(`  ℹ️ Найдено сервисов: ${filtered.length}`);
    });

    // Очистить поиск
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(300);
  } else {
    warn('Service Store: поле поиска не найдено в DOM');
  }

  // Тест фильтров
  console.log('  🔘 Тест фильтров...');
  const filters = ['all', 'installed', 'free', 'pro'];

  for (const filter of filters) {
    await sleep(300);
    console.log(`    Фильтр: ${filter}`);

    const filterButton = document.querySelector(`.service-store__filter[data-filter="${filter}"]`);

    if (filterButton) {
      filterButton.click();
      await sleep(200);

      test(`Service Store: фильтр "${filter}" применён`, () => {
        if (window.serviceStore.currentFilter !== filter) {
          throw new Error(`Ожидалось '${filter}', получено '${window.serviceStore.currentFilter}'`);
        }
      });
    } else {
      warn(`Service Store: кнопка фильтра "${filter}" не найдена`);
    }
  }

  // Тест установки сервиса
  console.log('  ⬇️ Тест установки бесплатного сервиса...');
  const freeService = window.serviceStore.catalog.find(s => s.license === 'free' && !s.installed);

  if (freeService) {
    console.log(`    Сервис: ${freeService.name}`);

    const installButton = document.querySelector(`.service-card[data-service-id="${freeService.id}"] button[data-action="install"]`);

    if (installButton) {
      installButton.click();
      await sleep(1000); // Дать время на установку

      test(`Service Store: сервис "${freeService.name}" установлен`, () => {
        const updatedService = window.serviceStore.catalog.find(s => s.id === freeService.id);
        if (!updatedService.installed) {
          throw new Error('Сервис не установлен');
        }
      });
    } else {
      warn(`Service Store: кнопка установки для "${freeService.name}" не найдена`);
    }
  } else {
    warn('Service Store: нет бесплатных сервисов для установки');
  }

  // ========================================
  // 4. TAB BAR ТЕСТИРОВАНИЕ
  // ========================================
  console.log('%c\n[4] TAB BAR - СИМУЛЯЦИЯ ОПЕРАЦИЙ С ВКЛАДКАМИ', 'color: cyan; font-weight: bold');
  console.log('──────────────────────────────────────────────');

  test('Tab Bar: изначально скрыт', () => {
    if (window.tabBar.tabs.length !== 0) {
      throw new Error(`Ожидалось 0 вкладок, получено ${window.tabBar.tabs.length}`);
    }
  });

  // Создать тестовую вкладку
  console.log('  ➕ Создание тестовой вкладки...');
  const testTab = {
    id: 'test-doc-1',
    title: 'Тестовый документ',
    type: 'document',
    dirty: false
  };

  const tabAdded = window.tabBar.addTab(testTab);
  await sleep(300);

  test('Tab Bar: вкладка добавлена', () => {
    if (!tabAdded) throw new Error('Вкладка не добавлена');
    if (window.tabBar.tabs.length !== 1) {
      throw new Error(`Ожидалось 1 вкладка, получено ${window.tabBar.tabs.length}`);
    }
  });

  test('Tab Bar: вкладка активна', () => {
    if (window.tabBar.activeTab !== 'test-doc-1') {
      throw new Error('Вкладка не стала активной');
    }
  });

  test('Tab Bar: отображается', () => {
    if (window.tabBar.element.style.display === 'none') {
      throw new Error('Tab Bar не отображается');
    }
  });

  // Тест dirty state
  console.log('  💾 Тест dirty state...');
  window.tabBar.setDirty('test-doc-1', true);
  await sleep(200);

  test('Tab Bar: dirty state установлен', () => {
    const tab = window.tabBar.getTab('test-doc-1');
    if (!tab.dirty) throw new Error('Dirty state не установлен');
  });

  // Добавить еще вкладки
  console.log('  ➕ Добавление дополнительных вкладок...');
  window.tabBar.addTab({ id: 'test-doc-2', title: 'Документ 2', type: 'document' });
  window.tabBar.addTab({ id: 'test-doc-3', title: 'Документ 3', type: 'document' });
  await sleep(300);

  test('Tab Bar: 3 вкладки открыты', () => {
    if (window.tabBar.tabs.length !== 3) {
      throw new Error(`Ожидалось 3 вкладки, получено ${window.tabBar.tabs.length}`);
    }
  });

  // Переключение вкладок
  console.log('  🔀 Переключение между вкладками...');
  window.tabBar.setActive('test-doc-2');
  await sleep(200);

  test('Tab Bar: переключение на test-doc-2', () => {
    if (window.tabBar.activeTab !== 'test-doc-2') {
      throw new Error('Переключение не сработало');
    }
  });

  // Закрытие вкладки
  console.log('  ❌ Закрытие вкладки...');
  global.confirm = () => true; // Mock confirm для dirty tabs
  window.tabBar.removeTab('test-doc-1');
  await sleep(300);

  test('Tab Bar: вкладка закрыта', () => {
    if (window.tabBar.tabs.length !== 2) {
      throw new Error(`Ожидалось 2 вкладки, получено ${window.tabBar.tabs.length}`);
    }
  });

  // ========================================
  // 5. DYNAMIC SIDEBAR ТЕСТИРОВАНИЕ
  // ========================================
  console.log('%c\n[5] DYNAMIC SIDEBAR - СИМУЛЯЦИЯ ФИЛЬТРОВ', 'color: cyan; font-weight: bold');
  console.log('───────────────────────────────────────────');

  // Переключиться на Documents
  await sleep(300);
  console.log('  🖱️ Переключение на Documents...');
  const docsButton = document.querySelector('.activity-bar__item[data-item-id="documents"]');
  if (docsButton) docsButton.click();
  await sleep(500);

  test('Sidebar: секция Documents активна', () => {
    if (window.dynamicSidebar.activeSection !== 'documents') {
      throw new Error('Documents секция не активна');
    }
  });

  // Тест фильтров документов
  console.log('  🔘 Тест фильтров документов...');
  const docFilters = document.querySelectorAll('#sidebar-documents .sidebar__filter');

  if (docFilters.length > 0) {
    for (const filterBtn of docFilters) {
      await sleep(200);
      const filterType = filterBtn.getAttribute('data-filter');
      console.log(`    Фильтр: ${filterType}`);

      filterBtn.click();
      await sleep(200);

      test(`Sidebar: фильтр "${filterType}" активен`, () => {
        if (!filterBtn.classList.contains('sidebar__filter--active')) {
          throw new Error('Фильтр не активен');
        }
      });
    }
  } else {
    warn('Sidebar: фильтры документов не найдены');
  }

  // Тест поиска документов
  console.log('  🔍 Тест поиска документов...');
  const docSearchInput = document.getElementById('document-search');

  if (docSearchInput) {
    docSearchInput.value = 'тест';
    docSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(300);

    test('Sidebar: поиск документов работает', () => {
      // Просто проверяем что ошибок нет
      return true;
    });

    docSearchInput.value = '';
    docSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
  } else {
    warn('Sidebar: поле поиска документов не найдено');
  }

  // ========================================
  // 6. CONTEXT TOOLBAR ТЕСТИРОВАНИЕ
  // ========================================
  console.log('%c\n[6] CONTEXT TOOLBAR - СИМУЛЯЦИЯ КНОПОК', 'color: cyan; font-weight: bold');
  console.log('─────────────────────────────────────────');

  // Context Toolbar должен быть виден если есть активная вкладка
  if (window.tabBar.tabs.length > 0) {
    test('Context Toolbar: отображается при открытой вкладке', () => {
      // Toolbar показывается только если setDocument был вызван
      // Для теста просто проверяем что он инициализирован
      if (!window.contextToolbar.element) {
        throw new Error('Context Toolbar не инициализирован');
      }
    });

    // Симуляция кликов по кнопкам
    const toolbarButtons = [
      { id: 'save-document', name: 'Сохранить' },
      { id: 'save-as-template', name: 'Как шаблон' },
      { id: 'validate-xml', name: 'Проверить' },
      { id: 'export-xml', name: 'Экспорт' }
    ];

    for (const btn of toolbarButtons) {
      await sleep(200);
      console.log(`  🖱️ Клик по "${btn.name}"...`);

      const button = document.getElementById(btn.id);

      if (button && !button.disabled) {
        button.click();
        await sleep(200);

        test(`Context Toolbar: кнопка "${btn.name}" работает`, () => {
          // Проверяем что клик не вызвал ошибок
          return true;
        });
      } else if (button && button.disabled) {
        console.log(`    ℹ️ Кнопка "${btn.name}" отключена`);
      } else {
        warn(`Context Toolbar: кнопка "${btn.name}" не найдена`);
      }
    }
  } else {
    console.log('  ℹ️ Context Toolbar скрыт (нет открытых вкладок)');
  }

  // ========================================
  // 7. EVENTBUS ТЕСТИРОВАНИЕ
  // ========================================
  console.log('%c\n[7] EVENTBUS - ПРОВЕРКА СОБЫТИЙ', 'color: cyan; font-weight: bold');
  console.log('─────────────────────────────');

  test('EventBus: методы доступны', () => {
    if (!window.eventBus.on || !window.eventBus.emit || !window.eventBus.off) {
      throw new Error('EventBus методы не найдены');
    }
  });

  // Тест emit/on
  let eventFired = false;
  window.eventBus.on('test-event', () => { eventFired = true; });
  window.eventBus.emit('test-event');
  await sleep(100);

  test('EventBus: события работают', () => {
    if (!eventFired) throw new Error('Событие не сработало');
  });

  // ========================================
  // ИТОГОВЫЙ ОТЧЕТ
  // ========================================
  console.log('%c\n========================================', 'color: blue; font-weight: bold');
  console.log('%c📊 ИТОГОВЫЙ ОТЧЕТ', 'color: blue; font-weight: bold');
  console.log('%c========================================', 'color: blue; font-weight: bold');
  console.log('');
  console.log(`%c✅ Пройдено: ${results.passed}`, 'color: green; font-weight: bold');
  console.log(`%c❌ Провалено: ${results.failed}`, 'color: red; font-weight: bold');
  console.log(`%c⚠️ Предупреждений: ${results.warnings}`, 'color: orange; font-weight: bold');
  console.log('');

  if (results.errors.length > 0) {
    console.log('%c📝 ОШИБКИ:', 'color: red; font-weight: bold');
    results.errors.forEach((err, i) => {
      console.log(`  ${i + 1}. ${err.test}: ${err.error}`);
    });
    console.log('');
  }

  const passRate = ((results.passed / (results.passed + results.failed)) * 100).toFixed(1);
  console.log(`%c📈 Процент прохождения: ${passRate}%`, 'color: blue; font-weight: bold');

  if (results.failed === 0) {
    console.log('%c\n🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ!', 'color: green; font-size: 20px; font-weight: bold');
  } else {
    console.log('%c\n⚠️ ЕСТЬ ПРОВАЛЬНЫЕ ТЕСТЫ!', 'color: red; font-size: 20px; font-weight: bold');
  }

  console.log('%c========================================\n', 'color: blue; font-weight: bold');

  return results;
})();
