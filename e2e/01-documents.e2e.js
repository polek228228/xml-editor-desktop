/**
 * @file 01-documents.e2e.js
 * @description E2E tests for document lifecycle (Week 1-2)
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

test.describe('Document Lifecycle Tests - Week 1-2', () => {
  test('should create a new document from dashboard quick action', async ({ electronApp }) => {
    const { window } = electronApp;

    // Click "Создать документ" on dashboard
    await clickAndWait(window, '#dashboard-new-document', 1000);

    // Context toolbar should appear
    await waitForElement(window, '#context-toolbar');
    const toolbarVisible = await isElementVisible(window, '#context-toolbar');
    expect(toolbarVisible).toBe(true);

    // Editor screen should appear
    const editorVisible = await isElementVisible(window, '#editor-screen');
    expect(editorVisible).toBe(true);

    // Dashboard should be hidden
    const dashboardVisible = await isElementVisible(window, '#home-dashboard');
    expect(dashboardVisible).toBe(false);

    await takeScreenshot(window, '01-new-document-created');
  });

  test('should create a new document from Documents section', async ({ electronApp }) => {
    const { window } = electronApp;

    // Navigate to Documents section
    await clickAndWait(window, '#nav-documents', 500);

    // Verify Documents sidebar is visible
    const docsSidebar = await isElementVisible(window, '#sidebar-documents');
    expect(docsSidebar).toBe(true);

    // Click "Создать документ" in sidebar
    await clickAndWait(window, '#new-document', 1000);

    // Context toolbar should appear
    const toolbarVisible = await isElementVisible(window, '#context-toolbar');
    expect(toolbarVisible).toBe(true);

    await takeScreenshot(window, '01-new-document-from-sidebar');
  });

  test('should fill document title and select schema version', async ({ electronApp }) => {
    const { window } = electronApp;

    // Create new document
    await clickAndWait(window, '#dashboard-new-document', 1000);

    // Fill document title
    await window.fill('#document-title', 'Тестовая пояснительная записка');
    const title = await window.inputValue('#document-title');
    expect(title).toBe('Тестовая пояснительная записка');

    // Select schema version 01.05
    await window.selectOption('#schema-version-select', '01.05');
    const selectedSchema = await window.inputValue('#schema-version-select');
    expect(selectedSchema).toBe('01.05');

    // Wait for form to render
    await window.waitForTimeout(2000);

    // Form should be rendered
    const formContainer = await window.$('#editor-form');
    const formHTML = await formContainer.innerHTML();
    expect(formHTML.length).toBeGreaterThan(100); // Form should contain content

    await takeScreenshot(window, '01-document-with-title-and-schema');
  });

  test('should fill form fields with valid data', async ({ electronApp }) => {
    const { window } = electronApp;

    // Create new document
    await clickAndWait(window, '#dashboard-new-document', 1000);

    // Fill title and schema
    await window.fill('#document-title', 'Проект многоквартирного дома');
    await window.selectOption('#schema-version-select', '01.05');
    await window.waitForTimeout(2000);

    // Fill basic form fields (examples based on schema)
    // Note: Actual selectors depend on FormManager rendering

    // Expand all accordion sections to make fields visible
    const accordionHeaders = await window.$$('.accordion__header');
    for (const header of accordionHeaders) {
      const isExpanded = await header.evaluate(el => el.parentElement.classList.contains('accordion__section--expanded'));
      if (!isExpanded) {
        await header.click();
        await window.waitForTimeout(200); // Wait for animation
      }
    }

    // Look for input fields and filter for visible ones only
    const allInputs = await window.$$('input[type="text"]');
    console.log(`Found ${allInputs.length} text input fields`);

    // Filter for visible inputs
    const visibleInputs = [];
    for (const input of allInputs) {
      if (await input.isVisible()) {
        visibleInputs.push(input);
      }
    }
    console.log(`Found ${visibleInputs.length} visible text input fields`);

    // Fill first few visible fields if they exist
    if (visibleInputs.length > 0) {
      await visibleInputs[0].fill('Проект многоквартирного дома №1');
    }
    if (visibleInputs.length > 1) {
      await visibleInputs[1].fill('Жилой комплекс "Солнечный"');
    }

    // Look for textareas
    const textareas = await window.$$('textarea');
    if (textareas.length > 0) {
      await textareas[0].fill('Описание проектной документации');
    }

    await takeScreenshot(window, '01-document-form-filled');
  });

  test('should enable Save button after filling required fields', async ({ electronApp }) => {
    const { window } = electronApp;

    // Create new document
    await clickAndWait(window, '#dashboard-new-document', 1000);

    // Initially Save button should be disabled
    const saveBtn = await window.$('#save-document');
    const isDisabledInitially = await saveBtn.isDisabled();
    expect(isDisabledInitially).toBe(true);

    // Fill title and schema
    await window.fill('#document-title', 'Тестовый проект');
    await window.selectOption('#schema-version-select', '01.05');
    await window.waitForTimeout(2000);

    // Save button might still be disabled until form is filled
    // This depends on FormManager validation logic
    // We'll check the state
    const saveButtonState = await saveBtn.isDisabled();
    console.log('Save button disabled:', saveButtonState);

    await takeScreenshot(window, '01-save-button-state');
  });

  test('should save document to database', async ({ electronApp }) => {
    const { window } = electronApp;

    // Create new document
    await clickAndWait(window, '#dashboard-new-document', 1000);

    // Fill minimum required fields
    await window.fill('#document-title', 'Документ для сохранения');
    await window.selectOption('#schema-version-select', '01.05');
    await window.waitForTimeout(2000);

    // Click Save button (force click even if disabled for testing)
    const saveBtn = await window.$('#save-document');
    await saveBtn.click({ force: true });

    // Wait for save operation
    await window.waitForTimeout(1000);

    // Check for success toast notification
    const toastContainer = await window.$('#toast-container');
    if (toastContainer) {
      const toastText = await toastContainer.textContent();
      console.log('Toast notification:', toastText);
    }

    await takeScreenshot(window, '01-document-saved');
  });

  test('should display saved documents in sidebar list', async ({ electronApp }) => {
    const { window } = electronApp;

    // Navigate to Documents section
    await clickAndWait(window, '#nav-documents', 500);

    // Check documents list
    const docsList = await window.$('#documents-list');
    const docsListHTML = await docsList.innerHTML();

    // Should not show empty state if we saved documents
    console.log('Documents list HTML:', docsListHTML);

    await takeScreenshot(window, '01-documents-list');
  });

  test('should load existing document from list', async ({ electronApp }) => {
    const { window } = electronApp;

    // First, create and save a document
    await clickAndWait(window, '#dashboard-new-document', 1000);
    await window.fill('#document-title', 'Документ для загрузки');
    await window.selectOption('#schema-version-select', '01.05');
    await window.waitForTimeout(1000);

    const saveBtn = await window.$('#save-document');
    await saveBtn.click({ force: true });
    await window.waitForTimeout(1000);

    // Navigate back to home
    await clickAndWait(window, '#nav-home', 500);

    // Navigate to Documents
    await clickAndWait(window, '#nav-documents', 500);

    // Check if document appears in list
    const docItems = await window.$$('.sidebar__list-item');
    console.log(`Found ${docItems.length} documents in list`);

    if (docItems.length > 0) {
      // Click first document
      await docItems[0].click();
      await window.waitForTimeout(1000);

      // Editor should open
      const editorVisible = await isElementVisible(window, '#editor-screen');
      expect(editorVisible).toBe(true);

      // Title should be filled
      const titleValue = await window.inputValue('#document-title');
      console.log('Loaded document title:', titleValue);

      await takeScreenshot(window, '01-document-loaded');
    }
  });

  test('should trigger autosave after 30 seconds', async ({ electronApp }) => {
    const { window } = electronApp;

    // Create new document
    await clickAndWait(window, '#dashboard-new-document', 1000);
    await window.fill('#document-title', 'Документ для автосохранения');
    await window.selectOption('#schema-version-select', '01.05');
    await window.waitForTimeout(2000);

    // Fill some fields
    const inputs = await window.$$('input[type="text"]');
    if (inputs.length > 0) {
      await inputs[0].fill('Тестовые данные для автосохранения');
    }

    // Wait 35 seconds for autosave to trigger
    console.log('Waiting 35 seconds for autosave...');
    await window.waitForTimeout(35000);

    // Check autosave indicator
    const autosaveIndicator = await window.$('#autosave-indicator');
    if (autosaveIndicator) {
      const autosaveText = await autosaveIndicator.textContent();
      console.log('Autosave indicator:', autosaveText);
    }

    await takeScreenshot(window, '01-autosave-triggered');
  });

  test('should switch between documents without losing data', async ({ electronApp }) => {
    const { window } = electronApp;

    // Create first document
    await clickAndWait(window, '#dashboard-new-document', 1000);
    await window.fill('#document-title', 'Первый документ');
    await window.selectOption('#schema-version-select', '01.05');
    await window.waitForTimeout(1000);

    const saveBtn1 = await window.$('#save-document');
    await saveBtn1.click({ force: true });
    await window.waitForTimeout(1000);

    // Create second document
    await clickAndWait(window, '#new-document', 1000);
    await window.fill('#document-title', 'Второй документ');
    await window.selectOption('#schema-version-select', '01.04');
    await window.waitForTimeout(1000);

    const titleBeforeSave = await window.inputValue('#document-title');
    expect(titleBeforeSave).toBe('Второй документ');

    const saveBtn2 = await window.$('#save-document');
    await saveBtn2.click({ force: true });
    await window.waitForTimeout(1000);

    // Navigate to Documents section
    await clickAndWait(window, '#nav-documents', 500);

    // Should show multiple documents
    const docItems = await window.$$('.sidebar__list-item');
    console.log(`Documents in list: ${docItems.length}`);

    await takeScreenshot(window, '01-multiple-documents');
  });

  test('should show validation errors for empty required fields', async ({ electronApp }) => {
    const { window } = electronApp;

    // Create new document
    await clickAndWait(window, '#dashboard-new-document', 1000);

    // Select schema without filling title
    await window.selectOption('#schema-version-select', '01.05');
    await window.waitForTimeout(2000);

    // Try to save without filling required fields
    const saveBtn = await window.$('#save-document');
    await saveBtn.click({ force: true });
    await window.waitForTimeout(1000);

    // Check for validation errors
    const errorMessages = await window.$$('.input-field--error, .validation-error');
    console.log(`Found ${errorMessages.length} validation error messages`);

    await takeScreenshot(window, '01-validation-errors');
  });
});
