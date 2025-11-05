/**
 * @file 05-modules.e2e.js
 * @description E2E tests for Module System (Week 4)
 */

const fixtures = require('./helpers/fixtures');
const test = fixtures.test;
const playwrightTest = require('@playwright/test');
const expect = playwrightTest.expect;

test.describe('Module System Tests', () => {

  test('should list all modules', async ({ electronApp }) => {
    const { window } = electronApp;

    const result = await window.evaluate(async () => {
      return await window.electronAPI.listModules({ type: 'all' });
    });

    expect(result.success).toBe(true);
    expect(result.modules).toBeDefined();
    expect(Array.isArray(result.modules)).toBe(true);
    expect(result.modules.length).toBeGreaterThan(0);
  });

  test('should filter modules by installed', async ({ electronApp }) => {
    const { window } = electronApp;

    const result = await window.evaluate(async () => {
      return await window.electronAPI.listModules({ type: 'installed' });
    });

    expect(result.success).toBe(true);
    const allInstalled = result.modules.every(m => m.is_installed === 1);
    expect(allInstalled).toBe(true);
  });

  test('should get module by ID', async ({ electronApp }) => {
    const { window } = electronApp;

    const result = await window.evaluate(async () => {
      return await window.electronAPI.getModule('pz-01.05');
    });

    expect(result.success).toBe(true);
    expect(result.module).toBeDefined();
    expect(result.module.id).toBe('pz-01.05');
  });

  test('should install a module', async ({ electronApp }) => {
    const { window } = electronApp;

    const installResult = await window.evaluate(async () => {
      return await window.electronAPI.installModule('pz-01.05');
    });

    expect(installResult.success).toBe(true);

    const moduleAfter = await window.evaluate(async () => {
      return await window.electronAPI.getModule('pz-01.05');
    });

    expect(moduleAfter.module.is_installed).toBe(1);
  });

  test('should uninstall a module', async ({ electronApp }) => {
    const { window } = electronApp;

    // Install module first
    await window.evaluate(async () => {
      await window.electronAPI.installModule('expertise-01.03');
    });

    const uninstallResult = await window.evaluate(async () => {
      return await window.electronAPI.uninstallModule('expertise-01.03');
    });

    expect(uninstallResult.success).toBe(true);

    const moduleAfter = await window.evaluate(async () => {
      return await window.electronAPI.getModule('expertise-01.03');
    });

    expect(moduleAfter.success).toBe(true);
    expect(moduleAfter.module).toBeDefined();
    expect(moduleAfter.module.is_installed).toBe(0);
  });

  test('should activate a module', async ({ electronApp }) => {
    const { window } = electronApp;

    // Install module first if not already installed
    await window.evaluate(async () => {
      await window.electronAPI.installModule('registry-experts');
    });

    const activateResult = await window.evaluate(async () => {
      return await window.electronAPI.activateModule('registry-experts');
    });

    expect(activateResult.success).toBe(true);

    const moduleAfter = await window.evaluate(async () => {
      return await window.electronAPI.getModule('registry-experts');
    });

    expect(moduleAfter.success).toBe(true);
    expect(moduleAfter.module).toBeDefined();
    expect(moduleAfter.module.is_active).toBe(1);
  });

  test('should get module statistics', async ({ electronApp }) => {
    const { window } = electronApp;

    const result = await window.evaluate(async () => {
      return await window.electronAPI.getModuleStatistics();
    });

    expect(result.success).toBe(true);
    expect(result.statistics).toBeDefined();
    expect(result.statistics.total).toBeGreaterThan(0);
  });

  test('should have 6 test modules registered', async ({ electronApp }) => {
    const { window } = electronApp;

    const result = await window.evaluate(async () => {
      return await window.electronAPI.listModules({ type: 'all' });
    });

    expect(result.success).toBe(true);
    expect(result.modules.length).toBe(6);
  });
});
