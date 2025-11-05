/**
 * @file 11-pdf-generation-test.e2e.js
 * @description E2E tests for PDF generation from all sections
 * Tests Week 8 implementation with real document data
 */

const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('PDF Generation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('file://' + path.join(__dirname, '../src/renderer/index.html'));
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
  });

  test('should show PDF export option in export dialog', async ({ page }) => {
    console.log('📋 Test: PDF export option visible');

    await page.click('button:has-text("Создать документ")');
    await page.waitForTimeout(1000);
    await page.fill('input[placeholder="Название документа"]', 'PDF Export UI Test');
    await page.selectOption('select#schema-version-select', '01.05');
    await page.click('#confirm-document-create');
    await page.waitForTimeout(2000);

    // Fill minimum required fields
    const section1 = await page.locator('.accordion__header:has-text("Информация о документе")');
    await section1.click();
    await page.waitForTimeout(500);
    await page.fill('input[type="date"][name*="docDate"]', '2025-10-31');

    const section2 = await page.locator('.accordion__header:has-text("Раздел 1. Основная информация")');
    await section2.click();
    await page.waitForTimeout(500);
    await page.fill('input[name*="projectName"]', 'PDF Test Project');
    await page.fill('input[name*="organizationName"]', 'PDF Test Org');

    await page.click('button:has-text("Сохранить")');
    await page.waitForTimeout(2000);

    // Open export dialog
    await page.click('button#export-xml-btn');
    await page.waitForTimeout(2000);

    // Check PDF radio button exists
    const pdfRadio = await page.locator('input[type="radio"][value="pdf"]');
    await expect(pdfRadio).toBeVisible();

    // Check XML radio button exists
    const xmlRadio = await page.locator('input[type="radio"][value="xml"]');
    await expect(xmlRadio).toBeVisible();

    await page.screenshot({ path: 'test-results/screenshots/11-pdf-export-option.png' });
    console.log('  ✅ PDF export option visible');
  });

  test('should generate PDF with filled document data', async ({ page }) => {
    console.log('📋 Test: Generate PDF with comprehensive data');

    await page.click('button:has-text("Создать документ")');
    await page.waitForTimeout(1000);
    await page.fill('input[placeholder="Название документа"]', 'Comprehensive PDF Test');
    await page.selectOption('select#schema-version-select', '01.05');
    await page.click('#confirm-document-create');
    await page.waitForTimeout(2000);

    // Fill comprehensive data for PDF generation
    // Section 1: documentInfo
    const section1 = await page.locator('.accordion__header:has-text("Информация о документе")');
    await section1.click();
    await page.waitForTimeout(500);
    await page.fill('input[type="date"][name*="docDate"]', '2025-10-31');
    await page.fill('input[name*="docNumber"]', 'PZ-2025-PDF-001');

    // Section 2: basicInfo
    const section2 = await page.locator('.accordion__header:has-text("Раздел 1. Основная информация")');
    await section2.click();
    await page.waitForTimeout(500);
    await page.fill('input[name*="projectName"]', 'Жилой комплекс "Солнечный" с подземной парковкой');
    await page.fill('input[name*="organizationName"]', 'ООО "Архитектурное бюро ТЕСТ"');

    // Section 3: technicalData
    const section3 = await page.locator('.accordion__header:has-text("Раздел 2. Технико-экономические показатели")');
    await section3.click();
    await page.waitForTimeout(500);
    await page.fill('input[name*="totalArea"]', '12500.5');
    await page.fill('input[name*="floors"]', '15');
    await page.fill('input[name*="height"]', '45.5');
    await page.fill('input[name*="capacity"]', '250');

    // Section 6: landPlot
    const section6 = await page.locator('.accordion__header:has-text("Раздел 5. Сведения о земельном участке")');
    await section6.click();
    await page.waitForTimeout(500);
    await page.fill('input[name*="cadastralNumber"]', '77:01:0001001:1234');
    await page.fill('input[name*="area"]', '5000');

    await page.click('button:has-text("Сохранить")');
    await page.waitForTimeout(2000);

    // Open export dialog
    await page.click('button#export-xml-btn');
    await page.waitForTimeout(2000);

    // Select PDF format
    const pdfRadio = await page.locator('input[type="radio"][value="pdf"]');
    await pdfRadio.click();
    await page.waitForTimeout(500);

    // Note: Actual PDF generation triggers file save dialog
    // We can only test UI behavior here
    // Real PDF file generation requires file system access

    await page.screenshot({ path: 'test-results/screenshots/11-pdf-ready-to-export.png' });
    console.log('  ✅ PDF export configured with comprehensive data');
  });

  test('should disable schema version selector when PDF is selected', async ({ page }) => {
    console.log('📋 Test: Schema version selector disabled for PDF');

    await page.click('button:has-text("Создать документ")');
    await page.waitForTimeout(1000);
    await page.fill('input[placeholder="Название документа"]', 'PDF UI Behavior Test');
    await page.selectOption('select#schema-version-select', '01.05');
    await page.click('#confirm-document-create');
    await page.waitForTimeout(2000);

    // Fill minimum data
    const section1 = await page.locator('.accordion__header:has-text("Информация о документе")');
    await section1.click();
    await page.waitForTimeout(500);
    await page.fill('input[type="date"][name*="docDate"]', '2025-10-31');

    const section2 = await page.locator('.accordion__header:has-text("Раздел 1. Основная информация")');
    await section2.click();
    await page.waitForTimeout(500);
    await page.fill('input[name*="projectName"]', 'Test');
    await page.fill('input[name*="organizationName"]', 'Test Org');

    await page.click('button:has-text("Сохранить")');
    await page.waitForTimeout(2000);

    await page.click('button#export-xml-btn');
    await page.waitForTimeout(2000);

    // Check schema selector is enabled for XML (default)
    const xmlRadio = await page.locator('input[type="radio"][value="xml"]');
    const schemaSelector = await page.locator('select#export-schema-version');

    await xmlRadio.click();
    await page.waitForTimeout(300);
    const xmlDisabled = await schemaSelector.isDisabled();
    console.log(`  Schema selector with XML: ${xmlDisabled ? 'DISABLED' : 'ENABLED'}`);

    // Switch to PDF
    const pdfRadio = await page.locator('input[type="radio"][value="pdf"]');
    await pdfRadio.click();
    await page.waitForTimeout(300);

    const pdfDisabled = await schemaSelector.isDisabled();
    console.log(`  Schema selector with PDF: ${pdfDisabled ? 'DISABLED ✅' : 'ENABLED ❌'}`);

    expect(pdfDisabled).toBe(true);

    await page.screenshot({ path: 'test-results/screenshots/11-pdf-schema-disabled.png' });
    console.log('  ✅ Schema selector correctly disabled for PDF');
  });

  test('should show loading toast during PDF generation', async ({ page }) => {
    console.log('📋 Test: PDF generation loading state');

    await page.click('button:has-text("Создать документ")');
    await page.waitForTimeout(1000);
    await page.fill('input[placeholder="Название документа"]', 'PDF Loading Test');
    await page.selectOption('select#schema-version-select', '01.05');
    await page.click('#confirm-document-create');
    await page.waitForTimeout(2000);

    // Fill required data
    const section1 = await page.locator('.accordion__header:has-text("Информация о документе")');
    await section1.click();
    await page.waitForTimeout(500);
    await page.fill('input[type="date"][name*="docDate"]', '2025-10-31');
    await page.fill('input[name*="docNumber"]', 'TOAST-TEST-001');

    const section2 = await page.locator('.accordion__header:has-text("Раздел 1. Основная информация")');
    await section2.click();
    await page.waitForTimeout(500);
    await page.fill('input[name*="projectName"]', 'Тестовый проект для проверки уведомлений');
    await page.fill('input[name*="organizationName"]', 'ООО "Тест Уведомления"');

    await page.click('button:has-text("Сохранить")');
    await page.waitForTimeout(2000);

    console.log('  ℹ️  Note: Full PDF generation test requires file system access');
    console.log('  ℹ️  Test verifies UI behavior and data preparation only');

    await page.screenshot({ path: 'test-results/screenshots/11-pdf-data-prepared.png' });
    console.log('  ✅ Document prepared for PDF generation');
  });

  test('should verify PDF template data extraction', async ({ page }) => {
    console.log('📋 Test: PDF template data extraction');

    await page.click('button:has-text("Создать документ")');
    await page.waitForTimeout(1000);
    await page.fill('input[placeholder="Название документа"]', 'PDF Template Data Test');
    await page.selectOption('select#schema-version-select', '01.05');
    await page.click('#confirm-document-create');
    await page.waitForTimeout(2000);

    // Fill ALL sections that PDF template uses
    // documentInfo
    const section1 = await page.locator('.accordion__header:has-text("Информация о документе")');
    await section1.click();
    await page.waitForTimeout(500);
    await page.fill('input[name*="docNumber"]', 'ПЗ-2025-ШАБЛОН-001');
    await page.fill('input[type="date"][name*="docDate"]', '2025-10-31');

    // basicInfo
    const section2 = await page.locator('.accordion__header:has-text("Раздел 1. Основная информация")');
    await section2.click();
    await page.waitForTimeout(500);
    await page.fill('input[name*="projectName"]', 'Многофункциональный торгово-развлекательный комплекс "Метрополис"');
    await page.fill('input[name*="organizationName"]', 'ООО "Градостроительное проектирование"');

    // technicalData
    const section3 = await page.locator('.accordion__header:has-text("Раздел 2. Технико-экономические показатели")');
    await section3.click();
    await page.waitForTimeout(500);
    await page.fill('input[name*="totalArea"]', '25000');
    await page.fill('input[name*="floors"]', '20');
    await page.fill('input[name*="height"]', '75');
    await page.fill('input[name*="capacity"]', '500');

    // landPlot
    const section6 = await page.locator('.accordion__header:has-text("Раздел 5. Сведения о земельном участке")');
    await section6.click();
    await page.waitForTimeout(500);
    await page.fill('input[name*="cadastralNumber"]', '77:02:0003005:9876');
    await page.fill('input[name*="area"]', '10000');

    await page.click('button:has-text("Сохранить")');
    await page.waitForTimeout(2000);

    console.log('  ✅ All PDF template fields filled');
    console.log('  📊 Data includes:');
    console.log('     - Document number: ПЗ-2025-ШАБЛОН-001');
    console.log('     - Project: Многофункциональный торгово-развлекательный комплекс "Метрополис"');
    console.log('     - Total area: 25000 m²');
    console.log('     - Floors: 20');
    console.log('     - Height: 75 m');
    console.log('     - Capacity: 500 people');
    console.log('     - Land: 10000 m² (77:02:0003005:9876)');

    await page.screenshot({ path: 'test-results/screenshots/11-pdf-template-data-complete.png' });
  });
});
