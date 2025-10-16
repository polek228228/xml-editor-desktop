/**
 * @file 00-master-full-check.e2e.js
 * @description A comprehensive E2E test for all implemented features (Weeks 1-4).
 */

const { test, expect } = require('@playwright/test');
const { launchElectronApp, closeElectronApp } = require('../e2e/helpers/electron-app');
const path = require('path');

test.describe('Master Full Check (Weeks 1-4)', () => {
  let app;
  let window;

  // Set a generous timeout for the entire suite.
  test.setTimeout(150000);

  test.beforeAll(async () => {
    // Clean the database once before all tests in this file to ensure a fresh state.
    const { execSync } = require('child_process');
    const dbPath = path.join(process.env.HOME, 'Library/Application Support/xml-editor-desktop/xmleditor.db');
    console.log(`Cleaning database at: ${dbPath}`);
    execSync(`rm -f "${dbPath}"`);
  });

  test.beforeEach(async () => {
    ({ app, window } = await launchElectronApp());
    await window.waitForTimeout(2000); // Wait for app to initialize
  });

  test.afterEach(async () => {
    await closeElectronApp(app);
  });

  // Test Group 1: Backend and Module System (Week 4)
  test.describe('Part 1: Backend & Module System Verification', () => {
    test('should list all seeded modules from the database', async () => {
      console.log('Running: Module Listing Test');
      const result = await window.evaluate(() => window.electronAPI.listModules({ type: 'all' }));
      expect(result.success).toBe(true);
      expect(result.modules).toBeDefined();
      expect(result.modules.length).toBe(6);
      console.log(`✅ Verified: 6 modules are seeded in the database.`);
    });

    test('should correctly perform the module lifecycle (install, activate, deactivate, uninstall)', async () => {
      console.log('Running: Module Lifecycle Test');
      const moduleId = 'pz-01.05';

      // 1. Install
      await window.evaluate((id) => window.electronAPI.installModule(id), moduleId);
      let moduleState = await window.evaluate((id) => window.electronAPI.getModule(id), moduleId);
      expect(moduleState.module.is_installed).toBe(1);

      // 2. Activate
      await window.evaluate((id) => window.electronAPI.activateModule(id), moduleId);
      moduleState = await window.evaluate((id) => window.electronAPI.getModule(id), moduleId);
      expect(moduleState.module.is_active).toBe(1);

      // 3. Deactivate
      await window.evaluate((id) => window.electronAPI.deactivateModule(id), moduleId);
      moduleState = await window.evaluate((id) => window.electronAPI.getModule(id), moduleId);
      expect(moduleState.module.is_active).toBe(0);

      // 4. Uninstall
      await window.evaluate((id) => window.electronAPI.uninstallModule(id), moduleId);
      moduleState = await window.evaluate((id) => window.electronAPI.getModule(id), moduleId);
      expect(moduleState.module.is_installed).toBe(0);
      console.log(`✅ Verified: Module lifecycle for '${moduleId}' works correctly.`);
    });
  });

  // Test Group 2: Full User Workflow (Weeks 1-3)
  test.describe('Part 2: UI Workflow Verification', () => {
    test('should complete the full user workflow', async () => {
      // STEP 1: Start on Welcome Screen
      console.log('Running: UI Workflow - Step 1: Welcome Screen');
      await expect(window.locator('#welcome-screen')).toBeVisible();
      await expect(window.locator('#editor-screen')).toBeHidden();

      // STEP 2: Create New Document
      console.log('Running: UI Workflow - Step 2: Create Document');
      await window.locator('#new-document').click();
      await expect(window.locator('#editor-screen')).toBeVisible();
      await expect(window.locator('#context-toolbar')).toBeVisible();

      // STEP 3: Fill Metadata and generate form
      console.log('Running: UI Workflow - Step 3: Fill Metadata');
      await window.locator('#document-title').fill('Мастер-Тест Документ');
      await window.locator('#schema-version-select').selectOption('01.05');
      await expect(window.locator('#editor-form .accordion')).toBeVisible({ timeout: 10000 });

      // STEP 4: Fill Form
      console.log('Running: UI Workflow - Step 4: Fill Form');
      await window.locator('#generalInfo-projectName').fill('Мастер-Тест Объект');

      // STEP 5: Save Document
      console.log('Running: UI Workflow - Step 5: Save Document');
      await window.locator('#save-document').click();
      const saveToast = window.locator('.toast--success:has-text("Документ сохранен")');
      await expect(saveToast).toBeVisible();
      await saveToast.waitFor({ state: 'hidden', timeout: 5000 });

      // STEP 6: Validate (expect errors as form is incomplete)
      console.log('Running: UI Workflow - Step 6: Validate XML');
      await window.locator('#validate-xml').click();
      const validationPanel = window.locator('.validation-panel--error');
      await expect(validationPanel).toBeVisible();
      await validationPanel.locator('.validation-panel__btn-close').click();
      await expect(validationPanel).toBeHidden();

      // STEP 7: Save as Template
      console.log('Running: UI Workflow - Step 7: Save as Template');
      await window.locator('#save-as-template').click();
      const templateDialog = window.locator('.template-dialog');
      await expect(templateDialog).toBeVisible();
      await templateDialog.locator('#template-name').fill('Мастер-Шаблон');
      await templateDialog.locator('.template-dialog__btn-save').click();
      const templateToast = window.locator('.toast--success:has-text("Шаблон \'Мастер-Шаблон\' успешно создан")');
      await expect(templateToast).toBeVisible();
      await expect(templateDialog).toBeHidden();

      console.log('✅ Verified: Full UI workflow completed successfully.');
    });
  });
});
