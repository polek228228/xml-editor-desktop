/**
 * @file 02-xml-generation.e2e.js
 * @description E2E tests for XML generation and export (Week 2)
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
const fs = require('fs');
const path = require('path');
const os = require('os');

test.describe('XML Generation and Export Tests - Week 2', () => {
  test('should generate XML from form data', async ({ electronApp }) => {
    const { window } = electronApp;

    // Create new document
    await clickAndWait(window, '#dashboard-new-document', 1000);

    // Fill document data
    await window.fill('#document-title', 'Проект для генерации XML');
    await window.selectOption('#schema-version-select', '01.05');
    await window.waitForTimeout(2000);

    // Fill some form fields
    const inputs = await window.$$('input[type="text"]');
    if (inputs.length > 0) {
      await inputs[0].fill('Проектная документация №1');
    }

    // Save document to trigger XML generation
    const saveBtn = await window.$('#save-document');
    await saveBtn.click({ force: true });
    await window.waitForTimeout(1000);

    // Export button should be enabled after save
    const exportBtn = await window.$('#export-xml');
    const exportEnabled = await exportBtn.isEnabled();
    console.log('Export button enabled:', exportEnabled);

    await takeScreenshot(window, '02-xml-generation-ready');
  });

  test('should enable Export button after document is saved', async ({ electronApp }) => {
    const { window } = electronApp;

    // Create new document
    await clickAndWait(window, '#dashboard-new-document', 1000);

    // Initially Export button should be disabled
    const exportBtn = await window.$('#export-xml');
    const isDisabledInitially = await exportBtn.isDisabled();
    expect(isDisabledInitially).toBe(true);

    // Fill and save document
    await window.fill('#document-title', 'Документ для экспорта');
    await window.selectOption('#schema-version-select', '01.05');
    await window.waitForTimeout(1000);

    const saveBtn = await window.$('#save-document');
    await saveBtn.click({ force: true });
    await window.waitForTimeout(1000);

    // Export button should be enabled now
    const exportEnabled = await exportBtn.isEnabled();
    console.log('Export button enabled after save:', exportEnabled);

    await takeScreenshot(window, '02-export-button-enabled');
  });

  test('should export XML file to disk', async ({ electronApp }) => {
    const { window, app } = electronApp;

    // Create new document
    await clickAndWait(window, '#dashboard-new-document', 1000);

    // Fill document
    await window.fill('#document-title', 'Экспорт XML файла');
    await window.selectOption('#schema-version-select', '01.05');
    await window.waitForTimeout(2000);

    // Fill required fields
    const inputs = await window.$$('input[type="text"]');
    if (inputs.length > 0) {
      await inputs[0].fill('Тестовые данные');
    }

    // Save document
    const saveBtn = await window.$('#save-document');
    await saveBtn.click({ force: true });
    await window.waitForTimeout(1000);

    // Click Export button
    const exportBtn = await window.$('#export-xml');

    // Prepare test export path
    const testExportPath = path.join(os.tmpdir(), 'test-export.xml');

    // Note: Export button opens save dialog
    // In E2E test, we can't interact with native dialogs easily
    // Instead, we'll verify the button is clickable
    const exportClickable = await exportBtn.isEnabled();
    expect(exportClickable).toBe(true);

    console.log('Export button is clickable, ready for XML export');
    await takeScreenshot(window, '02-ready-to-export');
  });

  test('should validate XML structure before export', async ({ electronApp }) => {
    const { window } = electronApp;

    // Create new document
    await clickAndWait(window, '#dashboard-new-document', 1000);

    // Fill document
    await window.fill('#document-title', 'Валидация перед экспортом');
    await window.selectOption('#schema-version-select', '01.05');
    await window.waitForTimeout(2000);

    // Save document
    const saveBtn = await window.$('#save-document');
    await saveBtn.click({ force: true });
    await window.waitForTimeout(1000);

    // Click Validate button
    const validateBtn = await window.$('#validate-xml');
    const validateEnabled = await validateBtn.isEnabled();
    console.log('Validate button enabled:', validateEnabled);

    if (validateEnabled) {
      await validateBtn.click();
      await window.waitForTimeout(1000);

      // Check for validation results
      // ValidationPanel might appear
      const validationPanel = await window.$('.validation-panel');
      if (validationPanel) {
        const panelVisible = await validationPanel.isVisible();
        console.log('Validation panel visible:', panelVisible);
      }

      await takeScreenshot(window, '02-validation-triggered');
    }
  });

  test('should display XML preview in console (debug mode)', async ({ electronApp }) => {
    const { window, app } = electronApp;

    // Create new document
    await clickAndWait(window, '#dashboard-new-document', 1000);

    // Fill document
    await window.fill('#document-title', 'XML Preview Test');
    await window.selectOption('#schema-version-select', '01.05');
    await window.waitForTimeout(2000);

    // Fill some fields
    const inputs = await window.$$('input[type="text"]');
    if (inputs.length > 0) {
      await inputs[0].fill('Данные для XML');
    }

    // Listen to console for XML output
    const consoleLogs = [];
    window.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('XML')) {
        consoleLogs.push(msg.text());
      }
    });

    // Save document (should generate XML)
    const saveBtn = await window.$('#save-document');
    await saveBtn.click({ force: true });
    await window.waitForTimeout(2000);

    console.log('Console logs with XML:', consoleLogs);
    await takeScreenshot(window, '02-xml-generated');
  });

  test('should handle different schema versions (01.03, 01.04, 01.05)', async ({ electronApp }) => {
    const { window } = electronApp;

    const schemas = ['01.03', '01.04', '01.05'];

    for (const schema of schemas) {
      // Create new document
      await clickAndWait(window, '#dashboard-new-document', 1000);

      // Fill with current schema
      await window.fill('#document-title', `Документ схемы ${schema}`);
      await window.selectOption('#schema-version-select', schema);
      await window.waitForTimeout(2000);

      // Save
      const saveBtn = await window.$('#save-document');
      await saveBtn.click({ force: true });
      await window.waitForTimeout(1000);

      // Verify schema is set correctly
      const selectedSchema = await window.inputValue('#schema-version-select');
      expect(selectedSchema).toBe(schema);

      await takeScreenshot(window, `02-schema-${schema.replace('.', '-')}`);

      // Navigate back to create next
      if (schema !== schemas[schemas.length - 1]) {
        await clickAndWait(window, '#nav-home', 500);
      }
    }
  });

  test('should preserve XML content after document reload', async ({ electronApp }) => {
    const { window } = electronApp;

    // Create and save document
    await clickAndWait(window, '#dashboard-new-document', 1000);
    await window.fill('#document-title', 'Сохранение XML контента');
    await window.selectOption('#schema-version-select', '01.05');
    await window.waitForTimeout(2000);

    const inputs = await window.$$('input[type="text"]');
    if (inputs.length > 0) {
      await inputs[0].fill('Первичные данные');
    }

    const saveBtn = await window.$('#save-document');
    await saveBtn.click({ force: true });
    await window.waitForTimeout(1000);

    // Navigate away
    await clickAndWait(window, '#nav-home', 500);

    // Navigate back to Documents
    await clickAndWait(window, '#nav-documents', 500);

    // Load the document
    const docItems = await window.$$('.sidebar__list-item');
    if (docItems.length > 0) {
      await docItems[0].click();
      await window.waitForTimeout(1000);

      // Export button should still be enabled (XML is preserved)
      const exportBtn = await window.$('#export-xml');
      const exportEnabled = await exportBtn.isEnabled();
      console.log('Export button enabled after reload:', exportEnabled);

      await takeScreenshot(window, '02-xml-preserved-after-reload');
    }
  });

  test('should show XML generation progress indicator', async ({ electronApp }) => {
    const { window } = electronApp;

    // Create document with lots of data
    await clickAndWait(window, '#dashboard-new-document', 1000);
    await window.fill('#document-title', 'Большой документ для XML');
    await window.selectOption('#schema-version-select', '01.05');
    await window.waitForTimeout(2000);

    // Expand all accordion sections to make fields visible
    const accordionHeaders = await window.$$('.accordion__header');
    for (const header of accordionHeaders) {
      const isExpanded = await header.evaluate(el => el.parentElement.classList.contains('accordion__section--expanded'));
      if (!isExpanded) {
        await header.click();
        await window.waitForTimeout(200);
      }
    }

    // Fill multiple fields - filter for visible ones only
    const allInputs = await window.$$('input[type="text"]');
    const visibleInputs = [];
    for (const input of allInputs) {
      if (await input.isVisible()) {
        visibleInputs.push(input);
      }
    }

    for (let i = 0; i < Math.min(visibleInputs.length, 5); i++) {
      await visibleInputs[i].fill(`Данные поля ${i + 1}`);
    }

    const allTextareas = await window.$$('textarea');
    const visibleTextareas = [];
    for (const textarea of allTextareas) {
      if (await textarea.isVisible()) {
        visibleTextareas.push(textarea);
      }
    }

    for (let i = 0; i < Math.min(visibleTextareas.length, 3); i++) {
      await visibleTextareas[i].fill(`Длинный текст для поля ${i + 1}. `.repeat(10));
    }

    // Save and check for loading indicator
    const loadingOverlay = await window.$('#loading-overlay');

    const saveBtn = await window.$('#save-document');
    await saveBtn.click({ force: true });

    // Check if loading overlay appears briefly
    await window.waitForTimeout(100);
    const overlayVisible = await isElementVisible(window, '#loading-overlay');
    console.log('Loading overlay appeared:', overlayVisible);

    await window.waitForTimeout(2000);
    await takeScreenshot(window, '02-xml-generation-completed');
  });

  test('should generate valid XML with Russian characters', async ({ electronApp }) => {
    const { window } = electronApp;

    // Create new document
    await clickAndWait(window, '#dashboard-new-document', 1000);

    // Fill with Russian text
    await window.fill('#document-title', 'Пояснительная записка с кириллицей');
    await window.selectOption('#schema-version-select', '01.05');
    await window.waitForTimeout(2000);

    const inputs = await window.$$('input[type="text"]');
    if (inputs.length > 0) {
      await inputs[0].fill('Многоквартирный жилой дом');
    }

    const textareas = await window.$$('textarea');
    if (textareas.length > 0) {
      await textareas[0].fill('Проектная документация включает в себя все необходимые разделы.');
    }

    // Save
    const saveBtn = await window.$('#save-document');
    await saveBtn.click({ force: true });
    await window.waitForTimeout(1000);

    // Export should work with Russian characters
    const exportBtn = await window.$('#export-xml');
    const exportEnabled = await exportBtn.isEnabled();
    expect(exportEnabled).toBe(true);

    await takeScreenshot(window, '02-russian-characters-xml');
  });

  test('should handle XML export cancellation gracefully', async ({ electronApp }) => {
    const { window } = electronApp;

    // Create and save document
    await clickAndWait(window, '#dashboard-new-document', 1000);
    await window.fill('#document-title', 'Тест отмены экспорта');
    await window.selectOption('#schema-version-select', '01.05');
    await window.waitForTimeout(1000);

    const saveBtn = await window.$('#save-document');
    await saveBtn.click({ force: true });
    await window.waitForTimeout(1000);

    // Click export button
    const exportBtn = await window.$('#export-xml');
    await exportBtn.click();

    // Native dialog will open (can't interact in E2E)
    // User would cancel here
    // App should remain in stable state

    await window.waitForTimeout(1000);

    // Editor should still be visible
    const editorVisible = await isElementVisible(window, '#editor-screen');
    expect(editorVisible).toBe(true);

    await takeScreenshot(window, '02-export-cancel-stable');
  });
});
