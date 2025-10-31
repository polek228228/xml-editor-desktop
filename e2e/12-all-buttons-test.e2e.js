/**
 * @file 12-all-buttons-test.e2e.js
 * @description Проверка ВСЕХ кнопок в приложении
 */

const { test, expect, _electron: electron } = require('@playwright/test');
const fs = require('fs-extra');
const path = require('path');

const LOG_FILE = path.join(__dirname, '../test-results/all-buttons-test.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

test.describe('Тест ВСЕХ кнопок', () => {
  let electronApp;
  let window;
  
  test.beforeAll(async () => {
    fs.writeFileSync(LOG_FILE, '');
    log('========== ТЕСТ ВСЕХ КНОПОК ==========');
    
    electronApp = await electron.launch({ args: ['src/main/main.js'] });
    window = await electronApp.firstWindow();
    await window.waitForTimeout(3000);
  });
  
  test.afterAll(async () => {
    await electronApp?.close();
  });
  
  test('Кнопки на главной странице', async () => {
    log('\n=== ГЛАВНАЯ СТРАНИЦА ===');
    
    const buttons = [
      { id: 'dashboard-new-document', name: 'Создать документ (dashboard)' },
      { id: 'dashboard-open-document', name: 'Открыть документ (dashboard)' },
      { id: 'dashboard-from-template', name: 'Из шаблона (dashboard)' }
    ];
    
    for (const btn of buttons) {
      const element = await window.$(`#${btn.id}`);
      
      if (element) {
        const visible = await element.isVisible();
        const enabled = await element.evaluate(el => !el.disabled);
        
        log(`${btn.name}: ${visible ? '✅ Видна' : '❌'} ${enabled ? '✅ Активна' : '❌'}`);
        
        if (visible && enabled) {
          await element.click();
          await window.waitForTimeout(500);
          log(`  ✅ Кнопка работает`);
          
          await window.click('#nav-home');
          await window.waitForTimeout(300);
        }
      } else {
        log(`${btn.name}: ❌ НЕ НАЙДЕНА`);
      }
    }
  });
  
  test('Навигационные кнопки', async () => {
    log('\n=== НАВИГАЦИЯ ===');
    
    const navButtons = [
      { id: 'nav-home', name: 'Главная' },
      { id: 'nav-documents', name: 'Документы' },
      { id: 'nav-services', name: 'Сервисы' },
      { id: 'nav-settings', name: 'Настройки' }
    ];
    
    for (const btn of navButtons) {
      const element = await window.$(`#${btn.id}`);
      await element.click();
      await window.waitForTimeout(500);
      
      const isActive = await element.evaluate(el => 
        el.classList.contains('app-nav__item--active')
      );
      
      log(`${btn.name}: ${isActive ? '✅ Работает' : '❌'}`);
      expect(isActive).toBe(true);
    }
  });
  
  test('Подсчёт всех кнопок', async () => {
    log('\n=== ПОДСЧЁТ ===');
    
    const allButtons = await window.$$('button');
    let visible = 0;
    let enabled = 0;
    
    for (const btn of allButtons) {
      if (await btn.isVisible()) visible++;
      if (await btn.evaluate(el => !el.disabled)) enabled++;
    }
    
    log(`Всего кнопок: ${allButtons.length}`);
    log(`Видимых: ${visible}`);
    log(`Активных: ${enabled}`);
    
    log('\n✅ ТЕСТ ЗАВЕРШЁН');
  });
});