/**
 * @file 99-full-scenario-current.e2e.js
 * @description A realistic E2E scenario for the current state of the application.
 */

const { test, expect } = require('@playwright/test');
const { launchElectronApp, closeElectronApp } = require('./helpers/electron-app');
const path = require('path');

test.describe('Current Full E2E Scenario', () => {
  let app;
  let window;

  // Increase the timeout for this test suite as it performs many actions.
  test.setTimeout(120000);

  test.beforeEach(async () => {
    // Clean the database before each run to ensure a fresh state
    const { execSync } = require('child_process');
    const dbPath = path.join(process.env.HOME, 'Library/Application Support/xml-editor-desktop/xmleditor.db');
    execSync(`rm -f "${dbPath}"`);
    
    ({ app, window } = await launchElectronApp());
    await window.waitForTimeout(2000); // Wait for app to initialize
  });

  test.afterEach(async () => {
    await window.waitForTimeout(500);
    await closeElectronApp(app);
  });

  test('Full workflow: Create -> Fill -> Save -> Validate -> Template', async () => {
    // STEP 1: Verify Welcome Screen
    console.log('STEP 1: Verifying welcome screen...');
    await expect(window.locator('#welcome-screen')).toBeVisible();
    await expect(window.locator('#editor-screen')).toBeHidden();

    // STEP 2: Create New Document
    console.log('STEP 2: Creating new document...');
    await window.locator('#new-document').click();
    await expect(window.locator('#editor-screen')).toBeVisible();
    await expect(window.locator('#welcome-screen')).toBeHidden();
    await expect(window.locator('#context-toolbar')).toBeVisible();

    // STEP 3: Fill Metadata
    console.log('STEP 3: Filling document metadata...');
    const documentTitle = 'E2E Текущий Сценарий';
    await window.locator('#document-title').fill(documentTitle);
    await window.locator('#schema-version-select').selectOption('01.05');
    
    // Wait for the form to be generated
    await expect(window.locator('#editor-form .accordion')).toBeVisible({ timeout: 10000 });
    console.log('Form for schema 01.05 has been rendered.');

    // STEP 4: Fill Form Fields
    console.log('STEP 4: Filling form fields...');
    // Use a more specific selector to avoid ambiguity
    await window.locator('#generalInfo-projectName').fill('Тестовый Объект "Радуга"');
    await window.locator('#generalInfo-projectStage').selectOption('Проектная документация');

    // STEP 5: Save Document
    console.log('STEP 5: Saving document...');
    await window.locator('#save-document').click();
    const saveToast = window.locator('.toast--success:has-text("Документ сохранен")');
    await expect(saveToast).toBeVisible();
    await saveToast.waitFor({ state: 'hidden', timeout: 5000 }); // Wait for toast to disappear

    // STEP 6: Validate XML
    console.log('STEP 6: Validating XML...');
    await window.locator('#validate-xml').click();
    const validationPanel = window.locator('.validation-panel');
    await expect(validationPanel).toBeVisible();
    // Because the form is not fully filled, we expect errors
    await expect(validationPanel.locator('.validation-panel--error')).toBeVisible();
    console.log('Validation panel with errors appeared as expected.');
    await validationPanel.locator('.validation-panel__btn-close').click();
    await expect(validationPanel).toBeHidden();

    // STEP 7: Save as Template
    console.log('STEP 7: Saving document as a template...');
    await window.locator('#save-as-template').click();
    const templateDialog = window.locator('.template-dialog');
    await expect(templateDialog).toBeVisible();
    
    const templateName = 'Мой E2E Шаблон';
    await templateDialog.locator('#template-name').fill(templateName);
    await templateDialog.locator('.template-dialog__btn-save').click();
    
    const templateToast = window.locator('.toast--success:has-text("Шаблон \'Мой E2E Шаблон\' успешно создан")');
    await expect(templateToast).toBeVisible();
    await expect(templateDialog).toBeHidden();
    await templateToast.waitFor({ state: 'hidden', timeout: 5000 });

    // STEP 8: Load from Template
    console.log('STEP 8: Loading a new document from the template...');
    await window.locator('#load-from-template').click();
    const templateBrowser = window.locator('.template-browser');
    await expect(templateBrowser).toBeVisible();
    
    // Find and click the created template
    const templateItem = templateBrowser.locator(`.template-browser__item:has-text("${templateName}")`);
    await expect(templateItem).toBeVisible();
    await templateItem.click();

    await expect(templateBrowser).toBeHidden();
    await expect(window.locator('#editor-screen')).toBeVisible();

    // Verify that a new document is loaded with data from the template
    await expect(window.locator('#document-title')).toHaveValue(`Из шаблона: ${templateName}`);
    await expect(window.locator('#generalInfo-projectName')).toHaveValue('Тестовый Объект "Радуга"');
    console.log('Successfully created a new document from the template.');

    console.log('✅ Current E2E scenario completed successfully!');
  });
});
