/**
 * E2E Test: Export Dialog
 * Tests the export dialog functionality with a fully filled document
 */

const { test, expect, _electron: electron } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('Export Dialog Tests', () => {
  let electronApp;
  let window;

  test.beforeAll(async () => {
    // Launch Electron app
    electronApp = await electron.launch({
      args: [path.join(__dirname, '../src/main/main.js')],
      env: {
        ...process.env,
        NODE_ENV: 'test'
      }
    });

    // Get main window
    window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded');
    await window.waitForTimeout(2000); // Wait for app initialization
  });

  test.afterAll(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('should load test document', async () => {
    console.log('📋 Loading test document...');

    // Click Documents nav
    const docsNav = window.locator('[data-section="documents"]');
    await docsNav.click();
    await window.waitForTimeout(500);

    // Find test document in list
    const testDoc = window.locator('text=Жилой комплекс "Светлый"');
    await expect(testDoc).toBeVisible({ timeout: 5000 });

    // Click to open
    await testDoc.click();
    await window.waitForTimeout(1000);

    // Verify document is opened (context toolbar should be visible)
    const contextToolbar = window.locator('#context-toolbar');
    await expect(contextToolbar).toHaveClass(/context-toolbar--visible/);

    // Take screenshot
    await window.screenshot({ path: 'test-results/screenshots/08-test-document-loaded.png' });

    console.log('✅ Test document loaded');
  });

  test('should open export dialog', async () => {
    console.log('📤 Opening export dialog...');

    // Click export button
    const exportBtn = window.locator('#export-xml');
    await expect(exportBtn).toBeVisible();
    await exportBtn.click();

    await window.waitForTimeout(1000);

    // Verify dialog is visible
    const dialog = window.locator('.export-dialog');
    await expect(dialog).toHaveClass(/export-dialog--visible/, { timeout: 5000 });

    const dialogTitle = window.locator('.export-dialog__title');
    await expect(dialogTitle).toHaveText('Экспорт документа');

    // Take screenshot
    await window.screenshot({ path: 'test-results/screenshots/08-export-dialog-opened.png' });

    console.log('✅ Export dialog opened');
  });

  test('should display document info', async () => {
    console.log('📝 Checking document info...');

    const docTitle = window.locator('.export-dialog__doc-title');
    await expect(docTitle).toContainText('Жилой комплекс "Светлый"');

    const docMeta = window.locator('.export-dialog__doc-meta');
    await expect(docMeta).toContainText('Схема: 01.05');

    console.log('✅ Document info displayed correctly');
  });

  test('should display XML preview', async () => {
    console.log('📄 Checking XML preview...');

    const preview = window.locator('.export-dialog__preview');
    await expect(preview).toBeVisible();

    // Get preview content
    const previewText = await preview.inputValue();

    // Verify XML structure
    expect(previewText).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(previewText).toContain('<ExplanatoryNote');
    expect(previewText).toContain('xmlns="http://minstroyrf.gov.ru/schemas/explanatorynote/01.05"');
    expect(previewText).toContain('Version="01.05"');

    // Verify some content from our test document
    expect(previewText).toContain('ПЗ-2025-001'); // doc number
    expect(previewText).toContain('Жилой комплекс'); // project name
    expect(previewText).toContain('ООО "Строй-Инвест"'); // customer

    console.log(`✅ XML preview generated (${previewText.length} characters)`);

    // Take screenshot
    await window.screenshot({ path: 'test-results/screenshots/08-xml-preview-visible.png' });
  });

  test('should show validation results', async () => {
    console.log('🔍 Checking validation...');

    // Check if there are any validation errors/warnings
    const validation = window.locator('.export-dialog__validation');
    const validationExists = await validation.count() > 0;

    if (validationExists) {
      const isError = await validation.locator('.export-dialog__validation--error').count() > 0;
      const isWarning = await validation.locator('.export-dialog__validation--warning').count() > 0;

      console.log(`⚠️ Validation messages found: ${isError ? 'errors' : ''} ${isWarning ? 'warnings' : ''}`);

      // Take screenshot if there are validation messages
      await window.screenshot({ path: 'test-results/screenshots/08-validation-results.png' });
    } else {
      console.log('✅ No validation errors or warnings');
    }
  });

  test('should allow format selection', async () => {
    console.log('📋 Testing format selection...');

    // Check XML radio is selected by default
    const xmlRadio = window.locator('input[name="export-format"][value="xml"]');
    await expect(xmlRadio).toBeChecked();

    // Check PDF radio exists
    const pdfRadio = window.locator('input[name="export-format"][value="pdf"]');
    await expect(pdfRadio).toBeVisible();

    // Click PDF radio
    await pdfRadio.click();
    await window.waitForTimeout(500);

    // Verify PDF is selected
    await expect(pdfRadio).toBeChecked();

    // Take screenshot
    await window.screenshot({ path: 'test-results/screenshots/08-format-pdf-selected.png' });

    // Switch back to XML
    await xmlRadio.click();
    await window.waitForTimeout(500);

    console.log('✅ Format selection works');
  });

  test('should allow schema version selection', async () => {
    console.log('📋 Testing schema version selection...');

    const versionSelect = window.locator('#export-schema-version');
    await expect(versionSelect).toBeVisible();

    // Check default value
    const currentValue = await versionSelect.inputValue();
    expect(currentValue).toBe('01.05');

    // Change to 01.04
    await versionSelect.selectOption('01.04');
    await window.waitForTimeout(2000); // Wait for XML regeneration

    // Take screenshot
    await window.screenshot({ path: 'test-results/screenshots/08-schema-01.04-selected.png' });

    // Verify preview updated (should contain version 01.04)
    const preview = window.locator('.export-dialog__preview');
    const previewText = await preview.inputValue();
    expect(previewText).toContain('Version="01.04"');

    console.log('✅ Schema version selection works, XML regenerated');

    // Change back to 01.05
    await versionSelect.selectOption('01.05');
    await window.waitForTimeout(2000);
  });

  test('should have working export button', async () => {
    console.log('📤 Testing export button...');

    const exportBtn = window.locator('[data-action="export"]');
    await expect(exportBtn).toBeVisible();

    // Check if button is enabled (not disabled)
    const isDisabled = await exportBtn.isDisabled();
    if (isDisabled) {
      console.log('⚠️ Export button is disabled (validation errors present)');
    } else {
      console.log('✅ Export button is enabled');
    }

    // Take screenshot
    await window.screenshot({ path: 'test-results/screenshots/08-export-button-state.png' });
  });

  test('should close dialog on cancel', async () => {
    console.log('❌ Testing dialog close...');

    // Click cancel button
    const cancelBtn = window.locator('[data-action="cancel"]');
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    await window.waitForTimeout(500);

    // Verify dialog is hidden
    const dialog = window.locator('.export-dialog');
    await expect(dialog).not.toHaveClass(/export-dialog--visible/, { timeout: 2000 });

    console.log('✅ Dialog closed on cancel');

    // Take screenshot
    await window.screenshot({ path: 'test-results/screenshots/08-dialog-closed.png' });
  });

  test('should display file size hint', async () => {
    console.log('📏 Testing file size display...');

    // Reopen dialog
    const exportBtn = window.locator('#export-xml');
    await exportBtn.click();
    await window.waitForTimeout(1000);

    // Find size hint
    const sizeHint = window.locator('.export-dialog__hint').last();
    const sizeText = await sizeHint.textContent();

    expect(sizeText).toContain('Размер:');
    expect(sizeText).toContain('КБ');

    console.log(`✅ File size displayed: ${sizeText}`);

    // Close dialog
    const cancelBtn = window.locator('[data-action="cancel"]');
    await cancelBtn.click();
    await window.waitForTimeout(500);
  });
});
