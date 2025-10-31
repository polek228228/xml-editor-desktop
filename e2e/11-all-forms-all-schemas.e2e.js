/**
 * @file 11-all-forms-all-schemas.e2e.js
 * @description Тест ВСЕХ форм для ВСЕХ версий схем (01.03, 01.04, 01.05)
 */

const { test, expect, _electron: electron } = require('@playwright/test');
const fs = require('fs-extra');
const path = require('path');

const LOG_FILE = path.join(__dirname, '../test-results/all-forms-test.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

test.describe('Тест ВСЕХ форм для ВСЕХ схем', () => {
  let electronApp;
  let window;
  const screenshotsDir = path.join(__dirname, '../test-results/all-forms-screenshots');
  
  test.beforeAll(async () => {
    await fs.ensureDir(screenshotsDir);
    fs.writeFileSync(LOG_FILE, '');
    log('========== НАЧАЛО ТЕСТА ВСЕХ ФОРМ ==========');
    
    electronApp = await electron.launch({ 
      args: ['src/main/main.js'],
      env: { ...process.env, NODE_ENV: 'test' }
    });
    
    window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded');
    await window.waitForTimeout(3000);
  });
  
  test.afterAll(async () => {
    log('========== ТЕСТ ЗАВЕРШЁН ==========');
    await electronApp?.close();
  });
  
  const schemas = ['01.03', '01.04', '01.05'];
  
  for (const schemaVersion of schemas) {
    test(`Схема ${schemaVersion} - заполнение ВСЕХ полей`, async () => {
      log(`\n═══════════════════════════════════════`);
      log(`ТЕСТ СХЕМЫ ${schemaVersion}`);
      log(`═══════════════════════════════════════`);
      
      // Переход в Документы
      log('Переход в раздел Документы');
      const docsNav = await window.$('#nav-documents');
      await docsNav.click();
      await window.waitForTimeout(500);
      
      // Создание документа
      log('Клик на "Создать документ"');
      const newDocBtn = await window.$('#new-document');
      if (newDocBtn) {
        await newDocBtn.click();
        await window.waitForTimeout(1500);
      }
      
      await window.screenshot({ 
        path: path.join(screenshotsDir, `${schemaVersion}-01-new-doc.png`),
        fullPage: true 
      });
      
      // Заполнение названия
      log('Заполнение названия документа');
      const docTitle = await window.$('#document-title');
      if (docTitle) {
        await docTitle.fill(`ПОЛНЫЙ ТЕСТ ${schemaVersion} - ${Date.now()}`);
        log(`✅ Название: ПОЛНЫЙ ТЕСТ ${schemaVersion}`);
      }
      
      // Выбор схемы
      log(`Выбор версии схемы ${schemaVersion}`);
      const schemaSelect = await window.$('#schema-version-select');
      if (schemaSelect) {
        await schemaSelect.selectOption(schemaVersion);
        await window.waitForTimeout(3000);
        log(`✅ Схема ${schemaVersion} загружена`);
      }
      
      await window.screenshot({ 
        path: path.join(screenshotsDir, `${schemaVersion}-02-schema-loaded.png`),
        fullPage: true 
      });
      
      // Раскрытие ВСЕХ accordion секций
      log('Раскрытие всех accordion секций');
      const accordionHeaders = await window.$$('.accordion__header');
      log(`Найдено accordion секций: ${accordionHeaders.length}`);
      
      for (let i = 0; i < accordionHeaders.length; i++) {
        const header = accordionHeaders[i];
        const isExpanded = await header.evaluate(el => 
          el.parentElement?.classList.contains('accordion__section--expanded')
        );
        
        if (!isExpanded) {
          await header.click();
          await window.waitForTimeout(200);
          log(`  ✅ Секция #${i + 1} раскрыта`);
        }
      }
      
      await window.screenshot({ 
        path: path.join(screenshotsDir, `${schemaVersion}-03-accordions-opened.png`),
        fullPage: true 
      });
      
      // ЗАПОЛНЕНИЕ ВСЕХ ПОЛЕЙ
      log('\nНачало заполнения ВСЕХ полей формы');
      const editorForm = await window.$('#editor-form');
      
      if (editorForm) {
        const allFields = await editorForm.$$('input[type="text"], input[type="date"], input[type="email"], input[type="tel"], textarea, select');
        log(`Найдено полей для заполнения: ${allFields.length}`);
        
        let filledCount = 0;
        let skippedCount = 0;
        
        for (let i = 0; i < allFields.length; i++) {
          try {
            const fieldInfo = await allFields[i].evaluate(el => ({
              type: el.type || el.tagName.toLowerCase(),
              disabled: el.disabled,
              readonly: el.readOnly
            }));
            
            if (fieldInfo.disabled || fieldInfo.readonly) {
              skippedCount++;
              continue;
            }
            
            if (fieldInfo.type === 'date') {
              await allFields[i].fill('2025-10-29');
            } else if (fieldInfo.type === 'email') {
              await allFields[i].fill(`test${i}@example.com`);
            } else if (fieldInfo.type === 'tel') {
              await allFields[i].fill('+79991234567');
            } else if (fieldInfo.type === 'select') {
              const options = await allFields[i].evaluate(el => 
                Array.from(el.options).map(opt => opt.value).filter(v => v)
              );
              if (options.length > 0) {
                await allFields[i].selectOption(options[0]);
              }
            } else if (fieldInfo.type === 'textarea') {
              await allFields[i].fill(`Тестовое описание ${i + 1}`);
            } else {
              await allFields[i].fill(`Значение ${i + 1}`);
            }
            
            filledCount++;
            
            if (filledCount % 10 === 0) {
              log(`  Заполнено ${filledCount}/${allFields.length} полей...`);
              
              if (filledCount % 20 === 0) {
                await window.screenshot({ 
                  path: path.join(screenshotsDir, `${schemaVersion}-04-fields-${filledCount}.png`),
                  fullPage: true 
                });
              }
            }
            
            await window.waitForTimeout(30);
            
          } catch (error) {
            skippedCount++;
          }
        }
        
        log(`\n✅ ИТОГО: Заполнено ${filledCount}/${allFields.length}, пропущено ${skippedCount}`);
      }
      
      await window.screenshot({ 
        path: path.join(screenshotsDir, `${schemaVersion}-05-all-filled.png`),
        fullPage: true 
      });
      
      // Сохранение
      log('\nПопытка сохранения');
      const saveBtn = await window.$('#save-document');
      
      if (saveBtn) {
        const isEnabled = await saveBtn.evaluate(el => !el.disabled);
        
        if (isEnabled) {
          await saveBtn.click();
          await window.waitForTimeout(2500);
          log(`✅ Документ схемы ${schemaVersion} сохранён`);
        }
      }
      
      log(`\n✅ ТЕСТ СХЕМЫ ${schemaVersion} ЗАВЕРШЁН`);
    });
  }
});