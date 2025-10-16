/**
 * @file context-toolbar.js
 * @description Context Toolbar - панель инструментов в зависимости от контекста
 *
 * Features:
 * - Условное отображение в зависимости от открытого документа
 * - Управление названием и версией схемы
 * - Кнопки действий (сохранить, экспорт, валидация)
 * - Состояние кнопок (enabled/disabled)
 */

class ContextToolbar {
  constructor() {
    /**
     * DOM элемент toolbar
     * @type {HTMLElement|null}
     */
    this.element = null;

    /**
     * Текущий открытый документ
     * @type {Object|null}
     */
    this.currentDocument = null;

    /**
     * Кнопки toolbar
     * @type {Object}
     */
    this.buttons = {};

    /**
     * Inputs toolbar
     * @type {Object}
     */
    this.inputs = {};

    console.log('[ContextToolbar] Initialized');
  }

  /**
   * Инициализация Context Toolbar
   */
  init() {
    console.log('[ContextToolbar] Initializing...');

    this.element = document.getElementById('context-toolbar');

    if (!this.element) {
      console.error('[ContextToolbar] Toolbar element not found');
      return;
    }

    // Загрузка элементов управления
    this._loadControls();

    // Обработчики событий
    this._attachEventListeners();

    // Скрыть toolbar по умолчанию (пока нет открытого документа)
    this.hide();

    console.log('[ContextToolbar] Initialized');
  }

  /**
   * Загрузка элементов управления
   * @private
   */
  _loadControls() {
    // Inputs
    this.inputs.title = document.getElementById('document-title');
    this.inputs.schemaVersion = document.getElementById('schema-version-select');

    // Buttons
    this.buttons.save = document.getElementById('save-document');
    this.buttons.saveAsTemplate = document.getElementById('save-as-template');
    this.buttons.validate = document.getElementById('validate-xml');
    this.buttons.export = document.getElementById('export-xml');
  }

  /**
   * Обработчики событий
   * @private
   */
  _attachEventListeners() {
    // Title input
    if (this.inputs.title) {
      this.inputs.title.addEventListener('input', (e) => {
        this._onTitleChange(e.target.value);
      });

      this.inputs.title.addEventListener('blur', (e) => {
        this._onTitleBlur(e.target.value);
      });
    }

    // Schema version select
    if (this.inputs.schemaVersion) {
      this.inputs.schemaVersion.addEventListener('change', (e) => {
        this._onSchemaVersionChange(e.target.value);
      });
    }

    // Save button
    if (this.buttons.save) {
      this.buttons.save.addEventListener('click', () => {
        window.eventBus?.emit('document:save');
      });
    }

    // Save as template button
    if (this.buttons.saveAsTemplate) {
      this.buttons.saveAsTemplate.addEventListener('click', () => {
        window.eventBus?.emit('template:create');
      });
    }

    // Validate button
    if (this.buttons.validate) {
      this.buttons.validate.addEventListener('click', () => {
        window.eventBus?.emit('document:validate');
      });
    }

    // Export button
    if (this.buttons.export) {
      this.buttons.export.addEventListener('click', () => {
        window.eventBus?.emit('document:export');
      });
    }

    // Слушать события от Tab Bar
    window.eventBus?.on('tab:changed', ({ tabId }) => {
      this._onTabChanged(tabId);
    });

    window.eventBus?.on('tab:closed', ({ tabId }) => {
      this._onTabClosed(tabId);
    });

    window.eventBus?.on('tab:closedAll', () => {
      this._onAllTabsClosed();
    });
  }

  /**
   * Установка документа
   *
   * @param {Object} document - Объект документа
   * @param {string} document.id - ID документа
   * @param {string} document.title - Название
   * @param {string} document.schema_version - Версия схемы
   * @param {Object} document.content - Содержимое
   */
  setDocument(document) {
    this.currentDocument = document;

    // Установка значений
    if (this.inputs.title) {
      this.inputs.title.value = document.title || '';
    }

    if (this.inputs.schemaVersion) {
      this.inputs.schemaVersion.value = document.schema_version || '';
    }

    // Включение кнопок
    this.enableAllButtons();

    // Показать toolbar
    this.show();

    console.log('[ContextToolbar] Document set:', document.id);
  }

  /**
   * Очистка toolbar
   */
  clearDocument() {
    this.currentDocument = null;

    // Очистка значений
    if (this.inputs.title) {
      this.inputs.title.value = '';
    }

    if (this.inputs.schemaVersion) {
      this.inputs.schemaVersion.value = '';
    }

    // Отключение кнопок
    this.disableAllButtons();

    // Скрыть toolbar
    this.hide();

    console.log('[ContextToolbar] Document cleared');
  }

  /**
   * Включение всех кнопок
   */
  enableAllButtons() {
    Object.values(this.buttons).forEach(btn => {
      if (btn) btn.disabled = false;
    });
  }

  /**
   * Отключение всех кнопок
   */
  disableAllButtons() {
    Object.values(this.buttons).forEach(btn => {
      if (btn) btn.disabled = true;
    });
  }

  /**
   * Включение конкретной кнопки
   *
   * @param {string} buttonName - Имя кнопки ('save', 'saveAsTemplate', 'validate', 'export')
   */
  enableButton(buttonName) {
    const btn = this.buttons[buttonName];
    if (btn) {
      btn.disabled = false;
    }
  }

  /**
   * Отключение конкретной кнопки
   *
   * @param {string} buttonName - Имя кнопки
   */
  disableButton(buttonName) {
    const btn = this.buttons[buttonName];
    if (btn) {
      btn.disabled = true;
    }
  }

  /**
   * Обработчик изменения названия
   * @private
   */
  _onTitleChange(value) {
    if (!this.currentDocument) return;

    // Эмит события для автосохранения
    window.eventBus?.emit('document:titleChanged', {
      documentId: this.currentDocument.id,
      title: value
    });
  }

  /**
   * Обработчик потери фокуса названия
   * @private
   */
  _onTitleBlur(value) {
    if (!this.currentDocument) return;

    // Обновление вкладки
    if (window.tabBar) {
      window.tabBar.updateTab(this.currentDocument.id, { title: value });
    }

    console.log('[ContextToolbar] Title updated:', value);
  }

  /**
   * Обработчик изменения версии схемы
   * @private
   */
  _onSchemaVersionChange(value) {
    if (!this.currentDocument) return;

    window.eventBus?.emit('document:schemaVersionChanged', {
      documentId: this.currentDocument.id,
      schemaVersion: value
    });

    console.log('[ContextToolbar] Schema version changed:', value);
  }

  /**
   * Обработчик переключения вкладки
   * @private
   */
  _onTabChanged(tabId) {
    // Загрузить данные вкладки
    const tab = window.tabBar?.getTab(tabId);

    if (tab && tab.type === 'document') {
      // TODO: Загрузить документ из хранилища
      // Пока заглушка
      this.setDocument({
        id: tabId,
        title: tab.title,
        schema_version: '01.05',
        content: {}
      });
    } else {
      this.clearDocument();
    }
  }

  /**
   * Обработчик закрытия вкладки
   * @private
   */
  _onTabClosed(tabId) {
    if (this.currentDocument && this.currentDocument.id === tabId) {
      this.clearDocument();
    }
  }

  /**
   * Обработчик закрытия всех вкладок
   * @private
   */
  _onAllTabsClosed() {
    this.clearDocument();
  }

  /**
   * Получение текущих значений
   *
   * @returns {Object} Объект с текущими значениями
   */
  getValues() {
    return {
      title: this.inputs.title?.value || '',
      schemaVersion: this.inputs.schemaVersion?.value || ''
    };
  }

  /**
   * Показать toolbar
   */
  show() {
    if (this.element) {
      this.element.style.display = 'flex';
    }
  }

  /**
   * Скрыть toolbar
   */
  hide() {
    if (this.element) {
      this.element.style.display = 'none';
    }
  }
}

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContextToolbar;
}

if (typeof window !== 'undefined') {
  window.ContextToolbar = ContextToolbar;
}
