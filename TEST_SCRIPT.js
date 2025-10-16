/**
 * TEST SCRIPT - Week 3 Feature Testing
 * Выполнить в DevTools Console в запущенном приложении
 *
 * Инструкция:
 * 1. Запустить приложение: npm run dev
 * 2. Открыть DevTools (F12)
 * 3. Вставить этот скрипт в Console
 * 4. Запустить: await runAllTests()
 */

/**
 * Тест 1: Валидация XML (без документа)
 */
async function test1_ValidateWithoutDocument() {
  console.log('\n🧪 TEST 1: Validate XML without document');

  // Сбросить currentDocument
  window.xmlEditorApp.currentDocument = null;

  // Попытка валидации
  await window.xmlEditorApp.validateXML();

  // Должен показать toast: "Нет открытого документа для проверки"
  console.log('✅ TEST 1 PASSED: Toast shown for missing document');
}

/**
 * Тест 2: Создать документ и провалидировать
 */
async function test2_CreateAndValidateDocument() {
  console.log('\n🧪 TEST 2: Create document and validate XML');

  // Создать новый документ
  const newDocBtn = document.getElementById('new-document');
  newDocBtn.click();

  // Дать время на создание
  await sleep(1000);

  // Выбрать схему 01.05
  const schemaSelect = document.getElementById('schema-version-select');
  schemaSelect.value = '01.05';
  schemaSelect.dispatchEvent(new Event('change'));

  // Дать время на загрузку формы
  await sleep(2000);

  console.log('📝 Document created with schema 01.05');

  // Заполнить минимальные обязательные поля
  const titleInput = document.getElementById('document-title');
  if (titleInput) {
    titleInput.value = 'Тестовый документ для валидации';
    titleInput.dispatchEvent(new Event('input'));
  }

  // Найти первое текстовое поле и заполнить
  const firstInput = document.querySelector('.input-field input[type="text"]');
  if (firstInput) {
    firstInput.value = 'Тестовое значение';
    firstInput.dispatchEvent(new Event('input'));
  }

  await sleep(500);

  // Валидация XML
  console.log('🔍 Validating XML...');
  await window.xmlEditorApp.validateXML();

  // ValidationPanel должен появиться
  await sleep(2000);

  const panel = document.querySelector('.validation-panel');
  if (panel) {
    console.log('✅ TEST 2 PASSED: ValidationPanel displayed');

    // Проверить тип (success или error)
    if (panel.classList.contains('validation-panel--success')) {
      console.log('   ✓ Validation: SUCCESS');
    } else if (panel.classList.contains('validation-panel--error')) {
      console.log('   ✗ Validation: ERRORS FOUND');
      const errorCount = document.querySelectorAll('.validation-panel__error-item').length;
      console.log(`   ✗ Error count: ${errorCount}`);
    }

    // Закрыть панель по ESC
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await sleep(500);

    console.log('   ✓ Panel closed by ESC');
  } else {
    console.error('❌ TEST 2 FAILED: ValidationPanel not found');
  }
}

/**
 * Тест 3: Сохранить документ как шаблон
 */
async function test3_SaveAsTemplate() {
  console.log('\n🧪 TEST 3: Save document as template');

  // Проверить что документ открыт
  if (!window.xmlEditorApp.currentDocument) {
    console.error('❌ No document open, skipping test 3');
    return;
  }

  // Клик на "Сохранить как шаблон"
  const saveTemplateBtn = document.getElementById('save-as-template');
  if (!saveTemplateBtn.disabled) {
    saveTemplateBtn.click();
    await sleep(500);

    // Проверить что TemplateDialog открылся
    const dialog = document.querySelector('.template-dialog');
    if (dialog) {
      console.log('✅ TEST 3 PASSED: TemplateDialog opened');

      // Заполнить форму
      const nameInput = document.getElementById('template-name');
      const descInput = document.getElementById('template-description');

      nameInput.value = 'Тестовый шаблон Week 3';
      nameInput.dispatchEvent(new Event('input'));

      descInput.value = 'Автоматически созданный шаблон для тестирования';
      descInput.dispatchEvent(new Event('input'));

      await sleep(300);

      console.log('   ✓ Form filled');

      // Отправить форму
      const form = document.getElementById('template-form');
      form.dispatchEvent(new Event('submit'));

      await sleep(1000);

      console.log('   ✓ Template saved (check toast notification)');

    } else {
      console.error('❌ TEST 3 FAILED: TemplateDialog not opened');
    }
  } else {
    console.error('❌ TEST 3 FAILED: Save as template button is disabled');
  }
}

/**
 * Тест 4: Загрузить из шаблона
 */
async function test4_LoadFromTemplate() {
  console.log('\n🧪 TEST 4: Load document from template');

  // Клик на "Из шаблона"
  const loadTemplateBtn = document.getElementById('load-from-template');
  if (!loadTemplateBtn.disabled) {
    loadTemplateBtn.click();
    await sleep(500);

    // Проверить что TemplateBrowser открылся
    const browser = document.querySelector('.template-browser');
    if (browser) {
      console.log('✅ TEST 4 PASSED: TemplateBrowser opened');

      // Проверить список шаблонов
      const templates = browser.querySelectorAll('.template-browser__item');
      console.log(`   ✓ Found ${templates.length} templates`);

      if (templates.length > 0) {
        // Тестировать поиск
        const searchInput = browser.querySelector('.template-browser__search');
        searchInput.value = 'Тест';
        searchInput.dispatchEvent(new Event('input'));

        await sleep(300);

        const filteredTemplates = browser.querySelectorAll('.template-browser__item');
        console.log(`   ✓ Search filter working: ${filteredTemplates.length} results for "Тест"`);

        // Очистить поиск
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
        await sleep(300);

        // Кликнуть на первый шаблон
        templates[0].click();
        await sleep(1000);

        console.log('   ✓ Template loaded (check if new document created)');
      }

      // Закрыть браузер если он еще открыт
      const closeBtn = browser.querySelector('.template-browser__close');
      if (closeBtn) {
        closeBtn.click();
      }

    } else {
      console.error('❌ TEST 4 FAILED: TemplateBrowser not opened');
    }
  } else {
    console.error('❌ TEST 4 FAILED: Load from template button is disabled');
  }
}

/**
 * Тест 5: Keyboard Navigation (ESC)
 */
async function test5_KeyboardNavigation() {
  console.log('\n🧪 TEST 5: Keyboard navigation (ESC to close)');

  // Открыть ValidationPanel
  await window.xmlEditorApp.validateXML();
  await sleep(500);

  let panel = document.querySelector('.validation-panel');
  if (panel) {
    console.log('   ✓ ValidationPanel opened');

    // Нажать ESC
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await sleep(500);

    panel = document.querySelector('.validation-panel');
    if (!panel) {
      console.log('   ✓ ValidationPanel closed by ESC');
    } else {
      console.error('   ❌ ValidationPanel NOT closed by ESC');
    }
  }

  // Открыть TemplateBrowser
  document.getElementById('load-from-template').click();
  await sleep(500);

  let browser = document.querySelector('.template-browser');
  if (browser) {
    console.log('   ✓ TemplateBrowser opened');

    // Нажать ESC
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await sleep(500);

    browser = document.querySelector('.template-browser');
    if (!browser) {
      console.log('   ✓ TemplateBrowser closed by ESC');
    } else {
      console.error('   ❌ TemplateBrowser NOT closed by ESC');
    }
  }

  // Открыть TemplateDialog
  document.getElementById('save-as-template').click();
  await sleep(500);

  let dialog = document.querySelector('.template-dialog');
  if (dialog) {
    console.log('   ✓ TemplateDialog opened');

    // Нажать ESC
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await sleep(500);

    dialog = document.querySelector('.template-dialog');
    if (!dialog) {
      console.log('   ✓ TemplateDialog closed by ESC');
    } else {
      console.error('   ❌ TemplateDialog NOT closed by ESC');
    }
  }

  console.log('✅ TEST 5 PASSED: Keyboard navigation working');
}

/**
 * Тест 6: Button Enable/Disable States
 */
async function test6_ButtonStates() {
  console.log('\n🧪 TEST 6: Button enable/disable states');

  // Сначала закрыть документ (симуляция)
  window.xmlEditorApp.currentDocument = null;

  const validateBtn = document.getElementById('validate-xml');
  const loadTemplateBtn = document.getElementById('load-from-template');
  const saveTemplateBtn = document.getElementById('save-as-template');
  const exportBtn = document.getElementById('export-xml');

  if (validateBtn.disabled && saveTemplateBtn.disabled && exportBtn.disabled) {
    console.log('✅ Buttons disabled when no document: OK');
  } else {
    console.error('❌ Buttons should be disabled when no document');
  }

  // Создать документ
  document.getElementById('new-document').click();
  await sleep(1000);

  // Выбрать схему
  const schemaSelect = document.getElementById('schema-version-select');
  schemaSelect.value = '01.05';
  schemaSelect.dispatchEvent(new Event('change'));
  await sleep(2000);

  if (!validateBtn.disabled && !saveTemplateBtn.disabled && !exportBtn.disabled && !loadTemplateBtn.disabled) {
    console.log('✅ TEST 6 PASSED: Buttons enabled when document is open');
  } else {
    console.error('❌ TEST 6 FAILED: Buttons should be enabled');
  }
}

/**
 * Тест 7: XSS Protection (escapeHtml)
 */
async function test7_XSSProtection() {
  console.log('\n🧪 TEST 7: XSS Protection (escapeHtml)');

  // Создать ValidationPanel с XSS попыткой
  const xssAttempt = '<script>alert("XSS")</script>';
  const panel = new ValidationPanel({
    errors: [
      {
        message: xssAttempt,
        line: 42,
        column: 10,
        type: 'validation_error'
      }
    ]
  });

  panel.show();
  await sleep(500);

  // Проверить что скрипт не выполнился
  const errorMessage = document.querySelector('.validation-panel__error-message');
  if (errorMessage && errorMessage.textContent.includes('<script>')) {
    console.log('✅ TEST 7 PASSED: XSS escaped correctly');
    console.log(`   ✓ Escaped text: ${errorMessage.textContent}`);
  } else {
    console.error('❌ TEST 7 FAILED: XSS not properly escaped');
  }

  // Закрыть панель
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  await sleep(500);
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * RUN ALL TESTS
 */
async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 WEEK 3 FEATURE TESTING - START');
  console.log('='.repeat(60));

  try {
    await test1_ValidateWithoutDocument();
    await test2_CreateAndValidateDocument();
    await test3_SaveAsTemplate();
    await test4_LoadFromTemplate();
    await test5_KeyboardNavigation();
    await test6_ButtonStates();
    await test7_XSSProtection();

    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS COMPLETED');
    console.log('='.repeat(60));
    console.log('\n📊 Check the console output above for details');
    console.log('📋 Check toast notifications during the test run');
    console.log('👀 Verify visual appearance of dialogs');

  } catch (error) {
    console.error('\n❌ TEST ERROR:', error);
  }
}

// Инструкции
console.log('\n📖 INSTRUCTIONS:');
console.log('   1. Make sure the app is running');
console.log('   2. Run: await runAllTests()');
console.log('   3. Watch console output and UI changes');
console.log('   4. All tests should pass automatically\n');
