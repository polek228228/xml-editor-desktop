/**
 * @file tab-bar.js
 * @description Tab Bar - панель вкладок документов (как в VSCode)
 *
 * Features:
 * - Вкладки открытых документов
 * - Индикатор несохраненных изменений (dirty state)
 * - Drag & drop для переупорядочивания
 * - Кнопка закрытия вкладки
 */

class TabBar {
  constructor() {
    /**
     * Открытые вкладки
     * @type {Array<Object>}
     */
    this.tabs = [];

    /**
     * Активная вкладка
     * @type {string|null}
     */
    this.activeTab = null;

    /**
     * DOM элемент Tab Bar
     * @type {HTMLElement|null}
     */
    this.element = null;

    /**
     * Максимальное количество вкладок
     * @type {number}
     */
    this.maxTabs = 20;

    console.log('[TabBar] Initialized');
  }

  /**
   * Инициализация Tab Bar
   */
  init() {
    console.log('[TabBar] Creating Tab Bar...');

    // Создание элемента
    this.element = document.createElement('div');
    this.element.className = 'tab-bar';
    this.element.setAttribute('role', 'tablist');
    this.element.setAttribute('aria-label', 'Открытые документы');

    // Вставка в DOM (в начало .content)
    const content = document.querySelector('.content');
    const contextToolbar = document.getElementById('context-toolbar');

    if (content) {
      if (contextToolbar) {
        content.insertBefore(this.element, contextToolbar);
      } else {
        content.insertBefore(this.element, content.firstChild);
      }
    }

    // Обработчики событий
    this._attachEventListeners();

    // Скрыть изначально (пока нет вкладок)
    this.hide();

    console.log('[TabBar] Tab Bar created');
  }

  /**
   * Добавление новой вкладки
   *
   * @param {Object} tab - Объект вкладки
   * @param {string} tab.id - Уникальный ID вкладки
   * @param {string} tab.title - Название вкладки
   * @param {string} tab.type - Тип документа ('document', 'service', 'settings')
   * @param {boolean} tab.dirty - Есть несохраненные изменения
   * @param {string} tab.icon - Иконка (опционально)
   * @returns {boolean} true если вкладка добавлена
   */
  addTab(tab) {
    // Проверка лимита
    if (this.tabs.length >= this.maxTabs) {
      console.warn('[TabBar] Maximum tabs reached');
      window.xmlEditorApp?.showToast('Максимальное количество вкладок: ' + this.maxTabs, 'warning');
      return false;
    }

    // Проверка что вкладка еще не открыта
    if (this.tabs.find(t => t.id === tab.id)) {
      console.warn(`[TabBar] Tab already exists: ${tab.id}`);
      this.setActive(tab.id);
      return false;
    }

    // Добавление в массив
    this.tabs.push({
      id: tab.id,
      title: tab.title || 'Без названия',
      type: tab.type || 'document',
      dirty: tab.dirty || false,
      icon: tab.icon || this._getDefaultIcon(tab.type)
    });

    // Показать Tab Bar если скрыт
    if (this.tabs.length > 0) {
      this.show();
    }

    // Рендеринг
    this._render();

    // Установить как активную
    this.setActive(tab.id);

    console.log('[TabBar] Tab added:', tab.id);
    return true;
  }

  /**
   * Удаление вкладки
   *
   * @param {string} tabId - ID вкладки
   * @returns {boolean} true если вкладка удалена
   */
  removeTab(tabId) {
    const index = this.tabs.findIndex(t => t.id === tabId);

    if (index === -1) {
      console.warn(`[TabBar] Tab not found: ${tabId}`);
      return false;
    }

    const tab = this.tabs[index];

    // Проверка на несохраненные изменения
    if (tab.dirty) {
      const confirm = window.confirm(`Документ "${tab.title}" имеет несохраненные изменения. Закрыть?`);
      if (!confirm) {
        return false;
      }
    }

    // Удаление
    this.tabs.splice(index, 1);

    // Переключение на соседнюю вкладку
    if (this.activeTab === tabId) {
      if (this.tabs.length > 0) {
        // Переключиться на предыдущую или следующую
        const newActiveIndex = Math.max(0, index - 1);
        this.setActive(this.tabs[newActiveIndex].id);
      } else {
        this.activeTab = null;
      }
    }

    // Скрыть Tab Bar если нет вкладок
    if (this.tabs.length === 0) {
      this.hide();
    }

    // Рендеринг
    this._render();

    // Эмит события
    window.eventBus?.emit('tab:closed', { tabId });

    console.log('[TabBar] Tab removed:', tabId);
    return true;
  }

  /**
   * Установка активной вкладки
   *
   * @param {string} tabId - ID вкладки
   */
  setActive(tabId) {
    const tab = this.tabs.find(t => t.id === tabId);

    if (!tab) {
      console.warn(`[TabBar] Tab not found: ${tabId}`);
      return;
    }

    if (this.activeTab === tabId) {
      return;
    }

    this.activeTab = tabId;
    this._render();

    // Эмит события
    window.eventBus?.emit('tab:changed', { tabId });

    console.log('[TabBar] Active tab changed:', tabId);
  }

  /**
   * Обновление вкладки
   *
   * @param {string} tabId - ID вкладки
   * @param {Object} updates - Обновления
   */
  updateTab(tabId, updates) {
    const tab = this.tabs.find(t => t.id === tabId);

    if (!tab) {
      console.warn(`[TabBar] Tab not found: ${tabId}`);
      return;
    }

    // Применить обновления
    Object.assign(tab, updates);

    // Рендеринг
    this._render();

    console.log('[TabBar] Tab updated:', tabId);
  }

  /**
   * Установка dirty state для вкладки
   *
   * @param {string} tabId - ID вкладки
   * @param {boolean} dirty - Dirty state
   */
  setDirty(tabId, dirty) {
    this.updateTab(tabId, { dirty });
  }

  /**
   * Получение вкладки по ID
   *
   * @param {string} tabId - ID вкладки
   * @returns {Object|null}
   */
  getTab(tabId) {
    return this.tabs.find(t => t.id === tabId) || null;
  }

  /**
   * Получение активной вкладки
   *
   * @returns {Object|null}
   */
  getActiveTab() {
    if (!this.activeTab) return null;
    return this.getTab(this.activeTab);
  }

  /**
   * Закрытие всех вкладок
   */
  closeAll() {
    // Проверка на несохраненные изменения
    const dirtyTabs = this.tabs.filter(t => t.dirty);

    if (dirtyTabs.length > 0) {
      const confirm = window.confirm(`Есть ${dirtyTabs.length} документов с несохраненными изменениями. Закрыть все?`);
      if (!confirm) {
        return;
      }
    }

    // Закрыть все
    this.tabs = [];
    this.activeTab = null;
    this.hide();
    this._render();

    // Эмит события
    window.eventBus?.emit('tab:closedAll');

    console.log('[TabBar] All tabs closed');
  }

  /**
   * Рендеринг Tab Bar
   * @private
   */
  _render() {
    if (!this.element) return;

    // Очистка
    this.element.innerHTML = '';

    // Контейнер для вкладок
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'tab-bar__tabs';

    // Создание вкладок
    this.tabs.forEach((tab, index) => {
      const tabEl = document.createElement('div');
      tabEl.className = 'tab-bar__tab';
      tabEl.setAttribute('data-tab-id', tab.id);
      tabEl.setAttribute('role', 'tab');
      tabEl.setAttribute('aria-selected', tab.id === this.activeTab ? 'true' : 'false');

      // Активная вкладка
      if (tab.id === this.activeTab) {
        tabEl.classList.add('tab-bar__tab--active');
      }

      // Dirty state
      if (tab.dirty) {
        tabEl.classList.add('tab-bar__tab--dirty');
      }

      // Иконка
      const iconEl = document.createElement('span');
      iconEl.className = 'tab-bar__tab-icon';
      iconEl.textContent = tab.icon;
      tabEl.appendChild(iconEl);

      // Название
      const titleEl = document.createElement('span');
      titleEl.className = 'tab-bar__tab-title';
      titleEl.textContent = tab.title;
      tabEl.appendChild(titleEl);

      // Индикатор dirty
      if (tab.dirty) {
        const dirtyEl = document.createElement('span');
        dirtyEl.className = 'tab-bar__tab-dirty-indicator';
        dirtyEl.textContent = '●';
        tabEl.appendChild(dirtyEl);
      }

      // Кнопка закрытия
      const closeBtn = document.createElement('button');
      closeBtn.className = 'tab-bar__tab-close';
      closeBtn.setAttribute('aria-label', 'Закрыть вкладку');
      closeBtn.textContent = '×';
      tabEl.appendChild(closeBtn);

      tabsContainer.appendChild(tabEl);
    });

    this.element.appendChild(tabsContainer);

    // Кнопка "Закрыть все"
    if (this.tabs.length > 1) {
      const closeAllBtn = document.createElement('button');
      closeAllBtn.className = 'tab-bar__close-all';
      closeAllBtn.setAttribute('aria-label', 'Закрыть все вкладки');
      closeAllBtn.textContent = '✕ Закрыть все';
      this.element.appendChild(closeAllBtn);
    }
  }

  /**
   * Обработчики событий
   * @private
   */
  _attachEventListeners() {
    if (!this.element) return;

    // Делегирование событий
    this.element.addEventListener('click', (e) => {
      // Закрытие вкладки
      if (e.target.classList.contains('tab-bar__tab-close')) {
        e.stopPropagation();
        const tabEl = e.target.closest('.tab-bar__tab');
        if (tabEl) {
          const tabId = tabEl.getAttribute('data-tab-id');
          this.removeTab(tabId);
        }
        return;
      }

      // Закрыть все
      if (e.target.classList.contains('tab-bar__close-all')) {
        this.closeAll();
        return;
      }

      // Клик по вкладке
      const tabEl = e.target.closest('.tab-bar__tab');
      if (tabEl) {
        const tabId = tabEl.getAttribute('data-tab-id');
        this.setActive(tabId);
        return;
      }
    });
  }

  /**
   * Получение иконки по умолчанию для типа
   * @private
   */
  _getDefaultIcon(type) {
    const icons = {
      document: '📄',
      service: '🔧',
      settings: '⚙️',
      default: '📝'
    };

    return icons[type] || icons.default;
  }

  /**
   * Показать Tab Bar
   */
  show() {
    if (this.element) {
      this.element.style.display = 'flex';
    }
  }

  /**
   * Скрыть Tab Bar
   */
  hide() {
    if (this.element) {
      this.element.style.display = 'none';
    }
  }

  /**
   * Уничтожение компонента
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }

    this.tabs = [];
    this.activeTab = null;
    this.element = null;

    console.log('[TabBar] Destroyed');
  }
}

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TabBar;
}

if (typeof window !== 'undefined') {
  window.TabBar = TabBar;
}
