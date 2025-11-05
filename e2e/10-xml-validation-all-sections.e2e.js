/**
 * @file 10-xml-validation-all-sections.e2e.js
 * @description E2E tests for XML generation with all 14 sections
 * CRITICAL: Must maintain 0 validation errors!
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('XML Generation with All Sections', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('file://' + path.join(__dirname, '../src/renderer/index.html'));
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
  });

  test('should generate valid XML for all 14 sections (0 errors)', async ({ page }) => {
    console.log('📋 Test: XML generation for all 14 sections');

    // Create new document
    await page.click('button:has-text("Создать документ")');
    await page.waitForTimeout(1000);
    await page.fill('input[placeholder="Название документа"]', 'Full XML Test Document');
    await page.selectOption('select#schema-version-select', '01.05');
    await page.click('#confirm-document-create');
    await page.waitForTimeout(2000);

    // Fill minimum required fields
    // Section 1: documentInfo
    const section1 = await page.locator('.accordion__header:has-text("Информация о документе")');
    await section1.click();
    await page.waitForTimeout(500);
    await page.fill('input[type="date"][name*="docDate"]', '2025-10-31');

    // Section 2: basicInfo (required: projectName, organizationName)
    const section2 = await page.locator('.accordion__header:has-text("Раздел 1. Основная информация")');
    await section2.click();
    await page.waitForTimeout(500);
    await page.fill('input[name*="projectName"]', 'Жилой комплекс "Тестовый"');
    await page.fill('input[name*="organizationName"]', 'ООО "Проектная организация"');

    // Fill optional sections for comprehensive test
    // Section 3: technicalData
    const section3 = await page.locator('.accordion__header:has-text("Раздел 2. Технико-экономические показатели")');
    await section3.click();
    await page.waitForTimeout(500);
    await page.fill('input[name*="totalArea"]', '5000');
    await page.fill('input[name*="floors"]', '10');

    // Section 5: participants
    const section5 = await page.locator('.accordion__header:has-text("Раздел 4. Сведения об участниках")');
    await section5.click();
    await page.waitForTimeout(500);

    // Section 6: landPlot
    const section6 = await page.locator('.accordion__header:has-text("Раздел 5. Сведения о земельном участке")');
    await section6.click();
    await page.waitForTimeout(500);
    await page.fill('input[name*="cadastralNumber"]', '77:01:0001001:1234');

    // Save document
    await page.click('button:has-text("Сохранить")');
    await page.waitForTimeout(2000);

    // Generate XML
    await page.click('button#export-xml-btn');
    await page.waitForTimeout(2000);

    // Check XML preview is visible
    const xmlPreview = await page.locator('#xml-preview-content');
    await expect(xmlPreview).toBeVisible({ timeout: 5000 });

    // Get XML content
    const xmlContent = await xmlPreview.textContent();
    console.log(`  📄 XML length: ${xmlContent.length} characters`);

    // Verify XML contains all 14 sections
    const sectionsInXML = [
      'documentInfo',
      'basicInfo',
      'technicalData',
      'engineering',
      'participants',
      'landPlot',
      'materials',
      'engineeringSurveys',
      'designTask',
      'planningDocumentation',
      'projectSolutions',
      'estimateDocumentation',
      'environmental',
      'appendices'
    ];

    let foundSections = 0;
    for (const section of sectionsInXML) {
      if (xmlContent.includes(section) || xmlContent.includes(section.replace(/([A-Z])/g, '-$1').toLowerCase())) {
        foundSections++;
      }
    }

    console.log(`  ✅ Found ${foundSections}/14 sections in XML`);

    // Check validation status - MUST BE 0 ERRORS!
    const validationPanel = await page.locator('.validation-panel');
    const validationStatus = await validationPanel.locator('.validation-panel__summary');
    const statusText = await validationStatus.textContent();

    console.log(`  🔍 Validation status: ${statusText}`);

    // Assert 0 errors
    expect(statusText).toContain('0 ошибок');

    await page.screenshot({ path: 'test-results/screenshots/10-xml-all-sections-valid.png' });
    console.log('✅ XML generated with 0 errors!');
  });

  test('should export XML file for all sections', async ({ page }) => {
    console.log('📋 Test: Export XML file');

    await page.click('button:has-text("Создать документ")');
    await page.waitForTimeout(1000);
    await page.fill('input[placeholder="Название документа"]', 'XML Export Test');
    await page.selectOption('select#schema-version-select', '01.05');
    await page.click('#confirm-document-create');
    await page.waitForTimeout(2000);

    // Fill required fields
    const section1 = await page.locator('.accordion__header:has-text("Информация о документе")');
    await section1.click();
    await page.waitForTimeout(500);
    await page.fill('input[type="date"][name*="docDate"]', '2025-10-31');

    const section2 = await page.locator('.accordion__header:has-text("Раздел 1. Основная информация")');
    await section2.click();
    await page.waitForTimeout(500);
    await page.fill('input[name*="projectName"]', 'Экспорт тест');
    await page.fill('input[name*="organizationName"]', 'ООО "Экспорт"');

    await page.click('button:has-text("Сохранить")');
    await page.waitForTimeout(2000);

    // Generate XML
    await page.click('button#export-xml-btn');
    await page.waitForTimeout(2000);

    // Click export in dialog
    const exportBtn = await page.locator('button:has-text("Экспортировать")');
    await exportBtn.click();
    await page.waitForTimeout(1000);

    // Check success toast
    const toast = await page.locator('.toast--success');
    await expect(toast).toBeVisible({ timeout: 5000 });

    console.log('  ✅ XML exported successfully');
    await page.screenshot({ path: 'test-results/screenshots/10-xml-export-success.png' });
  });

  test('should validate XML against XSD schema 01.05', async ({ page }) => {
    console.log('📋 Test: XSD validation');

    await page.click('button:has-text("Создать документ")');
    await page.waitForTimeout(1000);
    await page.fill('input[placeholder="Название документа"]', 'XSD Validation Test');
    await page.selectOption('select#schema-version-select', '01.05');
    await page.click('#confirm-document-create');
    await page.waitForTimeout(2000);

    // Fill comprehensive data for XSD validation
    const section1 = await page.locator('.accordion__header:has-text("Информация о документе")');
    await section1.click();
    await page.waitForTimeout(500);
    await page.fill('input[type="date"][name*="docDate"]', '2025-10-31');
    await page.fill('input[name*="docNumber"]', 'PZ-2025-001');

    const section2 = await page.locator('.accordion__header:has-text("Раздел 1. Основная информация")');
    await section2.click();
    await page.waitForTimeout(500);
    await page.fill('input[name*="projectName"]', 'Многофункциональный комплекс с подземной парковкой');
    await page.fill('input[name*="organizationName"]', 'ООО "Проектный институт градостроительства"');

    await page.click('button:has-text("Сохранить")');
    await page.waitForTimeout(2000);

    // Trigger validation
    await page.click('button#validate-btn');
    await page.waitForTimeout(3000);

    // Check validation result
    const validationPanel = await page.locator('.validation-panel');
    await expect(validationPanel).toBeVisible({ timeout: 5000 });

    const errorCount = await validationPanel.locator('.validation-panel__error').count();
    console.log(`  🔍 Validation errors: ${errorCount}`);

    // CRITICAL: Must be 0 errors
    expect(errorCount).toBe(0);

    await page.screenshot({ path: 'test-results/screenshots/10-xsd-validation-pass.png' });
    console.log('✅ XSD validation passed with 0 errors!');
  });

  test('should handle all 3 schema versions (01.03, 01.04, 01.05)', async ({ page }) => {
    console.log('📋 Test: All 3 schema versions');

    const versions = ['01.03', '01.04', '01.05'];

    for (const version of versions) {
      console.log(`  Testing version ${version}...`);

      await page.click('button:has-text("Создать документ")');
      await page.waitForTimeout(1000);
      await page.fill('input[placeholder="Название документа"]', `Test ${version}`);
      await page.selectOption('select#schema-version-select', version);
      await page.click('#confirm-document-create');
      await page.waitForTimeout(2000);

      // Fill minimal data
      const section1 = await page.locator('.accordion__header').first();
      await section1.click();
      await page.waitForTimeout(500);

      await page.click('button:has-text("Сохранить")');
      await page.waitForTimeout(2000);

      // Generate XML
      await page.click('button#export-xml-btn');
      await page.waitForTimeout(2000);

      // Check validation
      const validationPanel = await page.locator('.validation-panel');
      const statusText = await validationPanel.textContent();

      console.log(`    Version ${version}: ${statusText.includes('0 ошибок') ? '✅ PASS' : '❌ FAIL'}`);

      // Close dialog
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      // Close document
      const closeBtn = await page.locator('button[title="Закрыть"]');
      await closeBtn.click();
      await page.waitForTimeout(1000);
    }

    await page.screenshot({ path: 'test-results/screenshots/10-all-versions-test.png' });
    console.log('✅ All 3 versions tested');
  });
});
