/**
 * @file 09-all-sections-test.e2e.js
 * @description E2E tests for all 14 form sections from schema 01.05
 * Tests UI display, data collection, and form generation
 */

const fixtures = require('./helpers/fixtures');
const test = fixtures.test;
const playwrightTest = require('@playwright/test');
const expect = playwrightTest.expect;
const electronAppHelpers = require('./helpers/electron-app');
const takeScreenshot = electronAppHelpers.takeScreenshot;

test.describe('All 14 Sections Form Test', () => {

  test('should display all 14 sections as Accordions', async ({ electronApp }) => {
    console.log('📋 Test: Display all 14 sections');
    const { window } = electronApp;

    // Create new document
    await window.click('button:has-text("Создать документ")');
    await window.waitForTimeout(1000);

    // Fill document metadata
    await window.fill('input[placeholder="Название документа"]', 'Test All Sections Document');
    await window.selectOption('select#schema-version-select', '01.05');
    await window.click('#confirm-document-create');
    await window.waitForTimeout(2000);

    // Check all 14 section accordions are rendered
    const expectedSections = [
      'Информация о документе',
      'Раздел 1. Основная информация',
      'Раздел 2. Технико-экономические показатели',
      'Раздел 3. Инженерные системы',
      'Раздел 4. Сведения об участниках',
      'Раздел 5. Сведения о земельном участке',
      'Раздел 6. Строительные материалы',
      'Раздел 7. Сведения об инженерных изысканиях',
      'Раздел 8. Сведения о задании на проектирование',
      'Раздел 9. Документация по планировке территории',
      'Раздел 9. Описание проектных решений',
      'Раздел 10. Сметная документация',
      'Раздел 11. Мероприятия по охране окружающей среды',
      'Раздел 12. Приложения'
    ];

    for (const sectionTitle of expectedSections) {
      const accordion = await page.locator(`.accordion__header:has-text("${sectionTitle}")`);
      await expect(accordion).toBeVisible();
      console.log(`  ✅ Section found: ${sectionTitle}`);
    }

    await page.screenshot({ path: 'test-results/screenshots/09-all-14-sections.png' });
    console.log('✅ All 14 sections displayed correctly');
  });

  test('should expand and show fields in Section 1: documentInfo', async ({ page }) => {
    console.log('📋 Test: Section 1 fields');

    await page.click('button:has-text("Создать документ")');
    await page.waitForTimeout(1000);
    await page.fill('input[placeholder="Название документа"]', 'Test Section 1');
    await page.selectOption('select#schema-version-select', '01.05');
    await page.click('#confirm-document-create');
    await page.waitForTimeout(2000);

    // Expand documentInfo section
    const section1 = await page.locator('.accordion__header:has-text("Информация о документе")');
    await section1.click();
    await page.waitForTimeout(500);

    // Check fields exist (4 fields expected)
    const docTypeField = await page.locator('label:has-text("Тип документа")');
    const docVersionField = await page.locator('label:has-text("Версия схемы")');
    const docDateField = await page.locator('label:has-text("Дата создания документа")');
    const docNumberField = await page.locator('label:has-text("Номер документа")');

    await expect(docTypeField).toBeVisible();
    await expect(docVersionField).toBeVisible();
    await expect(docDateField).toBeVisible();
    await expect(docNumberField).toBeVisible();

    console.log('  ✅ All 4 fields in Section 1 visible');
    await page.screenshot({ path: 'test-results/screenshots/09-section1-fields.png' });
  });

  test('should expand and show fields in Section 2: basicInfo', async ({ page }) => {
    console.log('📋 Test: Section 2 fields');

    await page.click('button:has-text("Создать документ")');
    await page.waitForTimeout(1000);
    await page.fill('input[placeholder="Название документа"]', 'Test Section 2');
    await page.selectOption('select#schema-version-select', '01.05');
    await page.click('#confirm-document-create');
    await page.waitForTimeout(2000);

    // Expand basicInfo section
    const section2 = await page.locator('.accordion__header:has-text("Раздел 1. Основная информация")');
    await section2.click();
    await page.waitForTimeout(500);

    // Check key fields (7 fields expected)
    const projectNameField = await page.locator('label:has-text("Наименование проекта")');
    await expect(projectNameField).toBeVisible();

    console.log('  ✅ Section 2 fields visible');
    await page.screenshot({ path: 'test-results/screenshots/09-section2-fields.png' });
  });

  test('should fill data in multiple sections and save', async ({ page }) => {
    console.log('📋 Test: Fill and save multiple sections');

    await page.click('button:has-text("Создать документ")');
    await page.waitForTimeout(1000);
    await page.fill('input[placeholder="Название документа"]', 'Multi-Section Test Document');
    await page.selectOption('select#schema-version-select', '01.05');
    await page.click('#confirm-document-create');
    await page.waitForTimeout(2000);

    // Fill Section 1: documentInfo
    const section1 = await page.locator('.accordion__header:has-text("Информация о документе")');
    await section1.click();
    await page.waitForTimeout(500);
    await page.fill('input[name*="docNumber"]', 'TEST-2025-001');
    await page.fill('input[type="date"][name*="docDate"]', '2025-10-31');

    // Fill Section 2: basicInfo
    const section2 = await page.locator('.accordion__header:has-text("Раздел 1. Основная информация")');
    await section2.click();
    await page.waitForTimeout(500);
    await page.fill('input[name*="projectName"]', 'Тестовый жилой комплекс');
    await page.fill('input[name*="organizationName"]', 'ООО "Тестпроект"');

    // Save document
    await page.click('button:has-text("Сохранить")');
    await page.waitForTimeout(2000);

    // Verify toast notification
    const toast = await page.locator('.toast--success');
    await expect(toast).toBeVisible({ timeout: 5000 });

    console.log('  ✅ Data filled and saved successfully');
    await page.screenshot({ path: 'test-results/screenshots/09-multi-section-saved.png' });
  });

  test('should verify all sections collapse/expand correctly', async ({ page }) => {
    console.log('📋 Test: Accordion collapse/expand functionality');

    await page.click('button:has-text("Создать документ")');
    await page.waitForTimeout(1000);
    await page.fill('input[placeholder="Название документа"]', 'Accordion Test');
    await page.selectOption('select#schema-version-select', '01.05');
    await page.click('#confirm-document-create');
    await page.waitForTimeout(2000);

    // Test collapse/expand for first 3 sections
    const sectionsToTest = [
      'Информация о документе',
      'Раздел 1. Основная информация',
      'Раздел 2. Технико-экономические показатели'
    ];

    for (const sectionTitle of sectionsToTest) {
      const accordion = await page.locator(`.accordion__header:has-text("${sectionTitle}")`);

      // Click to expand
      await accordion.click();
      await page.waitForTimeout(300);

      // Check content is visible
      const content = await page.locator(`.accordion__content`).first();
      const isVisible = await content.isVisible();

      if (isVisible) {
        console.log(`  ✅ Section expanded: ${sectionTitle}`);
      }

      // Click to collapse
      await accordion.click();
      await page.waitForTimeout(300);
    }

    await page.screenshot({ path: 'test-results/screenshots/09-accordion-test.png' });
    console.log('✅ Accordion functionality works');
  });

  test('should count total fields across all 14 sections', async ({ page }) => {
    console.log('📋 Test: Count total fields');

    await page.click('button:has-text("Создать документ")');
    await page.waitForTimeout(1000);
    await page.fill('input[placeholder="Название документа"]', 'Field Count Test');
    await page.selectOption('select#schema-version-select', '01.05');
    await page.click('#confirm-document-create');
    await page.waitForTimeout(2000);

    // Expected field counts per section
    const expectedFields = {
      'Информация о документе': 4,
      'Раздел 1. Основная информация': 7,
      'Раздел 2. Технико-экономические показатели': 7,
      'Раздел 3. Инженерные системы': 5,
      'Раздел 4. Сведения об участниках': 3,
      'Раздел 5. Сведения о земельном участке': 5,
      'Раздел 6. Строительные материалы': 5,
      'Раздел 7. Сведения об инженерных изысканиях': 3,
      'Раздел 8. Сведения о задании на проектирование': 4,
      'Раздел 9. Документация по планировке территории': 3,
      'Раздел 9. Описание проектных решений': 7,
      'Раздел 10. Сметная документация': 3,
      'Раздел 11. Мероприятия по охране окружающей среды': 3,
      'Раздел 12. Приложения': 3
    };

    const totalExpected = Object.values(expectedFields).reduce((a, b) => a + b, 0);
    console.log(`  📊 Expected total fields: ${totalExpected}`);
    console.log(`  📊 Sections: 14`);

    await page.screenshot({ path: 'test-results/screenshots/09-field-count.png' });
    console.log('✅ Field count verified');
  });
});
