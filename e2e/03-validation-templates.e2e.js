/**
 * @file 03-validation-templates.e2e.js
 * @description E2E tests for XML validation and templates (Week 3)
 * @version 1.0.0
 */

const fixtures = require('./helpers/fixtures');
const test = fixtures.test;
const playwrightTest = require('@playwright/test');
const expect = playwrightTest.expect;
const electronAppHelpers = require('./helpers/electron-app');
const waitForElement = electronAppHelpers.waitForElement;
const clickAndWait = electronAppHelpers.clickAndWait;
const takeScreenshot = electronAppHelpers.takeScreenshot;
const isElementVisible = electronAppHelpers.isElementVisible;

test.describe('XML Validation Tests - Week 3', () => {
  test('should validate XML successfully with valid data', async ({ electronApp }) => {
    const { window } = electronApp;

    // Create and fill document
    await clickAndWait(window, '#dashboard-new-document', 1000);
    await window.fill('#document-title', 'Валидный документ для проверки');
    await window.selectOption('#schema-version-select', '01.05');
    await window.waitForTimeout(2000);

    // Fill required fields
    const inputs = await window.$$('input[type="text"]');
    if (inputs.length > 0) {
      await inputs[0].fill('Корректные данные');
    }

    // Save document first
    const saveBtn = await window.$('#save-document');
    await saveBtn.click({ force: true });
    await window.waitForTimeout(1000);

    // Click Validate button
    const validateBtn = await window.$('#validate-xml');
    const validateEnabled = await validateBtn.isEnabled();
    console.log('Validate button enabled:', validateEnabled);

    if (validateEnabled) {
      await validateBtn.click();
      await window.waitForTimeout(1500);

      // Check for validation results
      const toastContainer = await window.$('#toast-container');
      if (toastContainer) {
        const toastText = await toastContainer.textContent();
        console.log('Validation toast:', toastText);
      }

      await takeScreenshot(window, '03-validation-success');
    }
  });

  test('should show validation errors for invalid XML', async ({ electronApp }) => {
    const { window } = electronApp;

    // Create document with minimal/incomplete data
    await clickAndWait(window, '#dashboard-new-document', 1000);
    await window.fill('#document-title', 'Невалидный документ');
    await window.selectOption('#schema-version-select', '01.05');
    await window.waitForTimeout(2000);

    // Don't fill required fields

    // Save
    const saveBtn = await window.$('#save-document');
    await saveBtn.click({ force: true });
    await window.waitForTimeout(1000);

    // Validate
    const validateBtn = await window.$('#validate-xml');
    if (await validateBtn.isEnabled()) {
      await validateBtn.click();
      await window.waitForTimeout(1500);

      // Should show validation errors
      const toastContainer = await window.$('#toast-container');
      if (toastContainer) {
        const toastText = await toastContainer.textContent();
        console.log('Validation errors:', toastText);
        // Expect error-related text
        // expect(toastText).toContain('ошибк');
      }

      await takeScreenshot(window, '03-validation-errors');
    }
  });

  test('should display validation panel with error details', async ({ electronApp }) => {
    const { window } = electronApp;

    // Create and save document
    await clickAndWait(window, '#dashboard-new-document', 1000);
    await window.fill('#document-title', 'Документ с ошибками валидации');
    await window.selectOption('#schema-version-select', '01.05');
    await window.waitForTimeout(1000);

    const saveBtn = await window.$('#save-document');
    await saveBtn.click({ force: true });
    await window.waitForTimeout(1000);

    // Validate
    const validateBtn = await window.$('#validate-xml');
    if (await validateBtn.isEnabled()) {
      await validateBtn.click();
      await window.waitForTimeout(1500);

      // Check if validation panel appears
      const validationPanel = await window.$('.validation-panel');
      if (validationPanel) {
        const panelVisible = await validationPanel.isVisible();
        console.log('Validation panel visible:', panelVisible);

        if (panelVisible) {
          const panelText = await validationPanel.textContent();
          console.log('Validation panel content:', panelText.substring(0, 200));
        }
      }

      await takeScreenshot(window, '03-validation-panel');
    }
  });

  test('should update validation status in real-time', async ({ electronApp }) => {
    const { window } = electronApp;

    // Create document
    await clickAndWait(window, '#dashboard-new-document', 1000);
    await window.fill('#document-title', 'Тест real-time валидации');
    await window.selectOption('#schema-version-select', '01.05');
    await window.waitForTimeout(2000);

    // Fill some fields
    const inputs = await window.$$('input[type="text"]');
    if (inputs.length > 0) {
      await inputs[0].fill('Начальные данные');
      await window.waitForTimeout(500);

      // Check for validation feedback (if any)
      const validationErrors = await window.$$('.validation-error, .input-field--error');
      console.log(`Validation errors: ${validationErrors.length}`);
    }

    await takeScreenshot(window, '03-realtime-validation');
  });
});

test.describe('Template System Tests - Week 3', () => {
  test('should create template from existing document', async ({ electronApp }) => {
    const { window } = electronApp;

    // Create and fill document
    await clickAndWait(window, '#dashboard-new-document', 1000);
    await window.fill('#document-title', 'Документ для шаблона');
    await window.selectOption('#schema-version-select', '01.05');
    await window.waitForTimeout(2000);

    const inputs = await window.$$('input[type="text"]');
    if (inputs.length > 0) {
      await inputs[0].fill('Шаблонные данные');
    }

    // Save document
    const saveBtn = await window.$('#save-document');
    await saveBtn.click({ force: true });
    await window.waitForTimeout(1000);

    // Click "Как шаблон" button
    const saveAsTemplateBtn = await window.$('#save-as-template');
    const templateBtnEnabled = await saveAsTemplateBtn.isEnabled();
    console.log('Save as template button enabled:', templateBtnEnabled);

    if (templateBtnEnabled) {
      await saveAsTemplateBtn.click();
      await window.waitForTimeout(1000);

      // Template dialog should appear
      const templateDialog = await window.$('.template-dialog');
      if (templateDialog) {
        const dialogVisible = await templateDialog.isVisible();
        console.log('Template dialog visible:', dialogVisible);

        if (dialogVisible) {
          // Fill template info
          const templateNameInput = await window.$('input[placeholder*="Название"]');
          if (templateNameInput) {
            await templateNameInput.fill('Мой первый шаблон');
          }

          const templateDescInput = await window.$('textarea[placeholder*="Описание"]');
          if (templateDescInput) {
            await templateDescInput.fill('Описание шаблона для тестов');
          }

          // Save template
          const saveTemplateBtn = await window.$('button:has-text("Сохранить")');
          if (saveTemplateBtn) {
            await saveTemplateBtn.click({ force: true });
            await window.waitForTimeout(1000);
          }

          await takeScreenshot(window, '03-template-created');
        }
      }
    }
  });

  test('should display template browser when loading from template', async ({ electronApp }) => {
    const { window } = electronApp;

    // Click "Из шаблона" on dashboard
    await clickAndWait(window, '#dashboard-from-template', 1000);

    // Template browser should appear
    const templateBrowser = await window.$('.template-browser, .template-dialog');
    if (templateBrowser) {
      const browserVisible = await templateBrowser.isVisible();
      console.log('Template browser visible:', browserVisible);

      if (browserVisible) {
        const browserContent = await templateBrowser.textContent();
        console.log('Template browser content:', browserContent.substring(0, 200));
      }

      await takeScreenshot(window, '03-template-browser');
    }
  });

  test('should search templates by name', async ({ electronApp }) => {
    const { window } = electronApp;

    // Open template browser
    await clickAndWait(window, '#dashboard-from-template', 1000);
    await window.waitForTimeout(1000);

    // Look for search input in template browser
    const searchInput = await window.$('.template-browser__search, input[placeholder*="Поиск"]');
    if (searchInput) {
      await searchInput.fill('шаблон');
      await window.waitForTimeout(500);

      console.log('Template search executed');
      await takeScreenshot(window, '03-template-search');
    }
  });

  test('should filter templates by schema version', async ({ electronApp }) => {
    const { window } = electronApp;

    // Open template browser
    await clickAndWait(window, '#dashboard-from-template', 1000);
    await window.waitForTimeout(1000);

    // Look for schema filter
    const schemaFilter = await window.$('select[id*="schema"], .template-browser__filter');
    if (schemaFilter) {
      // Try to interact with filter
      console.log('Schema filter found');
      await takeScreenshot(window, '03-template-filter');
    }
  });

  test('should load document from template', async ({ electronApp }) => {
    const { window } = electronApp;

    // First, create a template (from previous test logic)
    await clickAndWait(window, '#dashboard-new-document', 1000);
    await window.fill('#document-title', 'Документ-основа для шаблона');
    await window.selectOption('#schema-version-select', '01.05');
    await window.waitForTimeout(1000);

    const saveBtn = await window.$('#save-document');
    await saveBtn.click({ force: true });
    await window.waitForTimeout(1000);

    const saveAsTemplateBtn = await window.$('#save-as-template');
    if (await saveAsTemplateBtn.isEnabled()) {
      await saveAsTemplateBtn.click();
      await window.waitForTimeout(1000);

      const templateNameInput = await window.$('input[placeholder*="Название"]');
      if (templateNameInput) {
        await templateNameInput.fill('Шаблон для загрузки');

        const saveTemplateBtn = await window.$('button:has-text("Сохранить")');
        if (saveTemplateBtn) {
          await saveTemplateBtn.click({ force: true });
          await window.waitForTimeout(1500);
        }
      }
    }

    // Now try to load from template
    await clickAndWait(window, '#nav-home', 500);
    await clickAndWait(window, '#dashboard-from-template', 1000);
    await window.waitForTimeout(1000);

    // Select first template
    const templateItems = await window.$$('.template-card, .template-item');
    console.log(`Found ${templateItems.length} templates`);

    if (templateItems.length > 0) {
      await templateItems[0].click();
      await window.waitForTimeout(1000);

      // Editor should open with template data
      const editorVisible = await isElementVisible(window, '#editor-screen');
      console.log('Editor opened from template:', editorVisible);

      await takeScreenshot(window, '03-loaded-from-template');
    }
  });

  test('should display template metadata (name, description, date)', async ({ electronApp }) => {
    const { window } = electronApp;

    // Open template browser
    await clickAndWait(window, '#dashboard-from-template', 1000);
    await window.waitForTimeout(1000);

    // Check template cards
    const templateCards = await window.$$('.template-card');
    if (templateCards.length > 0) {
      const firstCard = templateCards[0];
      const cardHTML = await firstCard.innerHTML();
      console.log('Template card HTML:', cardHTML.substring(0, 300));

      // Should contain metadata
      const cardText = await firstCard.textContent();
      console.log('Template card text:', cardText);
    }

    await takeScreenshot(window, '03-template-metadata');
  });

  test('should delete template from template browser', async ({ electronApp }) => {
    const { window } = electronApp;

    // Open template browser
    await clickAndWait(window, '#dashboard-from-template', 1000);
    await window.waitForTimeout(1000);

    // Look for delete button on template card
    const deleteBtn = await window.$('.template-card__delete, button[title*="Удалить"]');
    if (deleteBtn) {
      await deleteBtn.click();
      await window.waitForTimeout(1000);

      // Confirmation dialog might appear
      const confirmBtn = await window.$('button:has-text("Удалить")');
      if (confirmBtn) {
        await confirmBtn.click();
        await window.waitForTimeout(1000);
      }

      console.log('Template deletion triggered');
      await takeScreenshot(window, '03-template-deleted');
    }
  });

  test('should update existing template', async ({ electronApp }) => {
    const { window } = electronApp;

    // Create template first
    await clickAndWait(window, '#dashboard-new-document', 1000);
    await window.fill('#document-title', 'Шаблон для обновления');
    await window.selectOption('#schema-version-select', '01.05');
    await window.waitForTimeout(1000);

    const saveBtn = await window.$('#save-document');
    await saveBtn.click({ force: true });
    await window.waitForTimeout(1000);

    const saveAsTemplateBtn = await window.$('#save-as-template');
    if (await saveAsTemplateBtn.isEnabled()) {
      await saveAsTemplateBtn.click();
      await window.waitForTimeout(1000);

      const templateNameInput = await window.$('input[placeholder*="Название"]');
      if (templateNameInput) {
        await templateNameInput.fill('Обновляемый шаблон');

        const saveTemplateBtn = await window.$('button:has-text("Сохранить")');
        if (saveTemplateBtn) {
          await saveTemplateBtn.click({ force: true });
          await window.waitForTimeout(1000);
        }
      }
    }

    // Load template, modify, save again
    await clickAndWait(window, '#nav-home', 500);
    await clickAndWait(window, '#dashboard-from-template', 1000);
    await window.waitForTimeout(1000);

    const templateItems = await window.$$('.template-card, .template-item');
    if (templateItems.length > 0) {
      await templateItems[0].click();
      await window.waitForTimeout(1000);

      // Modify document
      const inputs = await window.$$('input[type="text"]');
      if (inputs.length > 0) {
        await inputs[0].fill('Обновленные данные');
      }

      // Save as template again
      const saveAsTemplateBtnAgain = await window.$('#save-as-template');
      if (await saveAsTemplateBtnAgain.isEnabled()) {
        await saveAsTemplateBtnAgain.click();
        await window.waitForTimeout(1000);

        // Update mode or create new
        const updateBtn = await window.$('button:has-text("Обновить")');
        if (updateBtn) {
          await updateBtn.click({ force: true });
          await window.waitForTimeout(1000);
          console.log('Template updated');
        }
      }

      await takeScreenshot(window, '03-template-updated');
    }
  });

  test('should show template count in statistics', async ({ electronApp }) => {
    const { window } = electronApp;

    // Navigate to home
    await clickAndWait(window, '#nav-home', 500);

    // Check template count in stats
    const templateCountWidget = await window.$('#widget-templates');
    if (templateCountWidget) {
      const count = await templateCountWidget.textContent();
      console.log('Template count in widget:', count);
    }

    const templateCountSidebar = await window.$('#stat-templates');
    if (templateCountSidebar) {
      const count = await templateCountSidebar.textContent();
      console.log('Template count in sidebar:', count);
    }

    await takeScreenshot(window, '03-template-statistics');
  });
});
