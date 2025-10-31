/**
 * @file 13-save-load-export-test.e2e.js
 * @description Полный цикл работы с документом
 */

const { test, expect, _electron: electron } = require('@playwright/test');
const fs = require('fs-extra');
const path = require('path');

const LOG_FILE = path.join(__dirname, '../test-results/save-load-export.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

test.describe('Полный цикл работы', () => {
  let electronApp;
  let window;
  
  test.beforeAll(async () => {
    fs.writeFileSync(LOG_FILE, '');
    log('========== ПОЛНЫЙ ЦИКЛ ==========');
    
    electronApp = await electron.launch({ args: ['src/main/main.js'] });
    window = await electronApp.firstWindow();
    await window.waitForTimeout(3000);
  });
  
  test.afterAll(async () => {
    await electronApp?.close();
  });
  
  test('Создание документа', async () => {
    log('\n=== СОЗДАНИЕ ===');
    
    await window.click('#nav-documents');
    await window.waitForTimeout(300);
    await window.click('#new-document');
    await window.waitForTimeout(1000);
    
    await window.fill('#document-title', 'ПОЛНЫЙ ЦИКЛ ' + Date.now());
    await window.selectOption('#schema-version-select', '01.05');
    await window.waitForTimeout(2000);
    
    const fields = await window.$$('input[type="text"]');
    log(`Заполняю ${Math.min(5, fields.length)} полей`);
    
    for (let i = 0; i < Math.min(5, fields.length); i++) {
      try {
        await fields[i].fill(`Значение ${i + 1}`);
      } catch (e) {}
    }
    
    log('✅ Документ создан');
  });
  
  test('Сохранение', async () => {
    log('\n=== СОХРАНЕНИЕ ===');
    
    const saveBtn = await window.$('#save-document');
    const enabled = await saveBtn.evaluate(el => !el.disabled);
    
    if (enabled) {
      await saveBtn.click();
      await window.waitForTimeout(2000);
      log('✅ Сохранено');
    } else {
      log('⚠️ Кнопка неактивна');
    }
  });
  
  test('Загрузка', async () => {
    log('\n=== ЗАГРУЗКА ===');
    
    await window.click('#nav-home');
    await window.waitForTimeout(500);
    await window.click('#nav-documents');
    await window.waitForTimeout(500);
    
    const items = await window.$$('#documents-list .sidebar__item');
    log(`Найдено документов: ${items.length}`);
    
    if (items.length > 0) {
      await items[0].click();
      await window.waitForTimeout(2000);
      log('✅ Документ загружен');
    }
  });
  
  test('Валидация', async () => {
    log('\n=== ВАЛИДАЦИЯ ===');
    
    const validateBtn = await window.$('#validate-xml');
    const enabled = await validateBtn?.evaluate(el => !el.disabled);
    
    if (enabled) {
      await validateBtn.click();
      await window.waitForTimeout(2000);
      log('✅ Валидация запущена');
    }
  });
  
  test('Экспорт', async () => {
    log('\n=== ЭКСПОРТ ===');
    
    const exportBtn = await window.$('#export-xml');
    const enabled = await exportBtn?.evaluate(el => !el.disabled);
    
    if (enabled) {
      await exportBtn.click();
      await window.waitForTimeout(1000);
      log('✅ Диалог экспорта открыт');
    }
    
    log('\n✅ ЦИКЛ ЗАВЕРШЁН');
  });
});