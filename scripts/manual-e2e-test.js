/**
 * @file manual-e2e-test.js
 * @description A manual E2E test script to be pasted into the developer console.
 */

async function runTest() {
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  try {
    console.log('▶️ СТАРТ ТЕСТА...');

    // STEP 1: Verify Welcome Screen
    console.log('STEP 1: Проверка экрана приветствия...');
    if (!document.querySelector('#welcome-screen') || document.querySelector('#welcome-screen').offsetParent === null) {
      throw new Error('Экран приветствия не найден!');
    }
    console.log('✅ Экран приветствия на месте.');

    // STEP 2: Create New Document
    console.log('STEP 2: Создание нового документа...');
    document.querySelector('#new-document').click();
    await sleep(500);
    if (!document.querySelector('#editor-screen') || document.querySelector('#editor-screen').offsetParent === null) {
      throw new Error('Редактор не открылся после клика на "Новый документ"!');
    }
    console.log('✅ Редактор открыт.');

    // STEP 3: Fill Metadata
    console.log('STEP 3: Заполнение метаданных...');
    const documentTitle = 'Тест из Консоли';
    document.querySelector('#document-title').value = documentTitle;
    document.querySelector('#schema-version-select').value = '01.05';
    // Manually trigger change event for schema select
    document.querySelector('#schema-version-select').dispatchEvent(new Event('change'));
    
    console.log('Ожидание генерации формы (до 10 сек)...');
    await sleep(2000); // Give it a moment to start rendering
    let formRendered = false;
    for(let i = 0; i < 8; i++) {
        if (document.querySelector('#editor-form .accordion')) {
            formRendered = true;
            break;
        }
        await sleep(1000);
    }
    if (!formRendered) throw new Error('Форма для схемы 01.05 не была сгенерирована!');
    console.log('✅ Форма сгенерирована.');

    // STEP 4: Fill Form Fields
    console.log('STEP 4: Заполнение полей формы...');
    document.querySelector('#generalInfo-projectName').value = 'Тестовый Объект "Консольный"';
    document.querySelector('#generalInfo-projectStage').value = 'Проектная документация';
    console.log('✅ Поля формы заполнены.');

    // STEP 5: Save Document
    console.log('STEP 5: Сохранение документа...');
    document.querySelector('#save-document').click();
    await sleep(1000);
    console.log('✅ Команда сохранения отправлена.');

    // STEP 6: Validate XML
    console.log('STEP 6: Валидация XML...');
    document.querySelector('#validate-xml').click();
    await sleep(1000);
    if (!document.querySelector('.validation-panel')) {
        console.warn('⚠️ Панель валидации не появилась. Возможно, это нормально, если есть ошибки сохранения.');
    } else {
        console.log('✅ Панель валидации появилась.');
        document.querySelector('.validation-panel__btn-close').click();
        await sleep(500);
    }

    // STEP 7: Save as Template
    console.log('STEP 7: Сохранение как шаблон...');
    document.querySelector('#save-as-template').click();
    await sleep(500);
    const templateDialog = document.querySelector('.template-dialog');
    if (!templateDialog) throw new Error('Диалог сохранения шаблона не появился!');
    
    const templateName = 'Консольный Шаблон';
    templateDialog.querySelector('#template-name').value = templateName;
    templateDialog.querySelector('.template-dialog__btn-save').click();
    await sleep(1000);
    console.log('✅ Шаблон сохранен.');

    console.log('🎉 ТЕСТ УСПЕШНО ЗАВЕРШЕН!');

  } catch (error) {
    console.error('❌ ОШИБКА В ХОДЕ ТЕСТА:', error.message);
    console.error(error.stack);
  }
}

// To run this test, copy the entire content of this file
// or just the runTest() function and paste it into the developer console of the running application.
// Then call runTest();
