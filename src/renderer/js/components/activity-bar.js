/**
 * @file activity-bar.js
 * @description Activity Bar - левая панель с иконками сервисов (как в VSCode)
 *
 * Features:
 * - Узкая панель (48px) слева от sidebar
 * - Иконки активных сервисов
 * - Индикаторы уведомлений
 * - Переключение sidebar sections
 */

class ActivityBar {
  constructor() {
    /**
     * Активные элементы Activity Bar
     * @type {Array<Object>}
     */
    this.items = [];

    /**
     * Текущий активный элемент
     * @type {string|null}
     */
    this.activeItem = null;

    /**
     * DOM элемент Activity Bar
     * @type {HTMLElement|null}
     */
    this.element = null;

    console.log('[ActivityBar] Initialized');
  }

  /**
   * Инициализация Activity Bar
   */
  init() {
    console.log('[ActivityBar] Creating Activity Bar...');

    // Создание элемента
    this.element = document.createElement('div');
    this.element.className = 'activity-bar';
    this.element.setAttribute('role', 'navigation');
    this.element.setAttribute('aria-label', 'Activity Bar');

    // Добавление базовых элементов
    this._addDefaultItems();

    // Вставка в DOM (перед sidebar)
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.parentNode) {
      sidebar.parentNode.insertBefore(this.element, sidebar);
    }

    // Обработчики событий
    this._attachEventListeners();

    console.log('[ActivityBar] Activity Bar created');
  }

  /**
   * Добавление базовых элементов
   * @private
   */
  _addDefaultItems() {
    const defaultItems = [
      {
        id: 'home',
        icon: '🏠',
        title: 'Главная',
        target: 'home',
        order: 1
      },
      {
        id: 'documents',
        icon: '📄',
        title: 'Документы',
        target: 'documents',
        order: 2
      },
      {
        id: 'services',
        icon: '🔧',
        title: 'Сервисы',
        target: 'services',
        order: 3
      },
      {
        id: 'settings',
        icon: '⚙️',
        title: 'Настройки',
        target: 'settings',
        order: 99
      }
    ];

    defaultItems.forEach(item => this.addItem(item));

    // Установка первого элемента как активного
    if (defaultItems.length > 0) {
      this.setActive(defaultItems[0].id);
    }
  }

  /**
   * Добавление нового элемента
   *
   * @param {Object} item - Объект элемента
   * @param {string} item.id - ID элемента
   * @param {string} item.icon - Иконка (emoji или SVG)
   * @param {string} item.title - Название
   * @param {string} item.target - Целевая секция sidebar
   * @param {number} item.order - Порядок отображения
   * @param {number} item.badge - Счетчик уведомлений (опционально)
   */
  addItem(item) {
    // Проверка что элемент еще не добавлен
    if (this.items.find(i => i.id === item.id)) {
      console.warn(`[ActivityBar] Item already exists: ${item.id}`);
      return;
    }

    // Добавление в массив
    this.items.push(item);

    // Сортировка по order
    this.items.sort((a, b) => a.order - b.order);

    // Рендеринг
    this._render();

    console.log('[ActivityBar] Item added:', item.id);
  }

  /**
   * Удаление элемента
   *
   * @param {string} itemId - ID элемента
   */
  removeItem(itemId) {
    const index = this.items.findIndex(i => i.id === itemId);

    if (index === -1) {
      console.warn(`[ActivityBar] Item not found: ${itemId}`);
      return;
    }

    this.items.splice(index, 1);
    this._render();

    console.log('[ActivityBar] Item removed:', itemId);
  }

  /**
   * Установка активного элемента
   *
   * @param {string} itemId - ID элемента
   */
  setActive(itemId) {
    if (this.activeItem === itemId) {
      return;
    }

    this.activeItem = itemId;
    this._render();

    // Эмит события для других компонентов
    window.eventBus?.emit('activitybar:change', { itemId });

    console.log('[ActivityBar] Active item changed:', itemId);
  }

  /**
   * Обновление badge для элемента
   *
   * @param {string} itemId - ID элемента
   * @param {number} count - Количество уведомлений
   */
  setBadge(itemId, count) {
    const item = this.items.find(i => i.id === itemId);

    if (!item) {
      console.warn(`[ActivityBar] Item not found: ${itemId}`);
      return;
    }

    item.badge = count;
    this._render();
  }

  /**
   * Рендеринг Activity Bar
   * @private
   */
  _render() {
    if (!this.element) return;

    // Очистка
    this.element.innerHTML = '';

    // Создание элементов
    this.items.forEach(item => {
      const itemEl = document.createElement('button');
      itemEl.className = 'activity-bar__item';
      itemEl.setAttribute('data-item-id', item.id);
      itemEl.setAttribute('title', item.title);
      itemEl.setAttribute('aria-label', item.title);

      // Активный элемент
      if (item.id === this.activeItem) {
        itemEl.classList.add('activity-bar__item--active');
      }

      // Иконка
      const iconEl = document.createElement('span');
      iconEl.className = 'activity-bar__item-icon';
      iconEl.textContent = item.icon;
      itemEl.appendChild(iconEl);

      // Badge (если есть)
      if (item.badge && item.badge > 0) {
        const badgeEl = document.createElement('span');
        badgeEl.className = 'activity-bar__item-badge';
        badgeEl.textContent = item.badge > 99 ? '99+' : item.badge;
        itemEl.appendChild(badgeEl);
      }

      this.element.appendChild(itemEl);
    });
  }

  /**
   * Обработчики событий
   * @private
   */
  _attachEventListeners() {
    if (!this.element) return;

    // Клик по элементу
    this.element.addEventListener('click', (e) => {
      const itemEl = e.target.closest('.activity-bar__item');
      if (!itemEl) return;

      const itemId = itemEl.getAttribute('data-item-id');
      if (!itemId) return;

      const item = this.items.find(i => i.id === itemId);
      if (!item) return;

      // Установка активного
      this.setActive(itemId);

      // Переключение sidebar секции
      if (item.target) {
        this._switchSidebarSection(item.target);
      }

      // Переключение app-nav (если нужно)
      this._switchAppNav(item.target);
    });
  }

  /**
   * Переключение секции sidebar
   * @private
   */
  _switchSidebarSection(section) {
    // Скрыть все секции
    document.querySelectorAll('.sidebar__section').forEach(el => {
      el.style.display = 'none';
      el.classList.remove('sidebar__section--active');
    });

    // Показать нужную секцию
    const targetSection = document.getElementById(`sidebar-${section}`);
    if (targetSection) {
      targetSection.style.display = 'block';
      targetSection.classList.add('sidebar__section--active');
    }
  }

  /**
   * Переключение app-nav
   * @private
   */
  _switchAppNav(section) {
    // Убрать активный класс со всех
    document.querySelectorAll('.app-nav__item').forEach(el => {
      el.classList.remove('app-nav__item--active');
    });

    // Добавить активный класс к нужному
    const targetNav = document.querySelector(`.app-nav__item[data-section="${section}"]`);
    if (targetNav) {
      targetNav.classList.add('app-nav__item--active');
    }

    // ========== ВАЖНО: ПЕРЕКЛЮЧЕНИЕ КОНТЕНТА ==========
    // Скрыть все content views
    const homeDashboard = document.getElementById('home-dashboard');
    const serviceStore = document.getElementById('service-store');
    const editorScreen = document.getElementById('editor-screen');
    const contextToolbar = document.getElementById('context-toolbar');

    if (homeDashboard) homeDashboard.style.display = 'none';
    if (serviceStore) serviceStore.style.display = 'none';
    if (editorScreen) editorScreen.style.display = 'none';
    if (contextToolbar) contextToolbar.classList.remove('context-toolbar--visible');

    // Показать только активную секцию
    if (section === 'home' && homeDashboard) {
      homeDashboard.style.display = 'block';
    } else if (section === 'services' && serviceStore) {
      serviceStore.style.display = 'block';
    } else if (section === 'documents' && editorScreen) {
      editorScreen.style.display = 'block';
    }
  }

  /**
   * Показать Activity Bar
   */
  show() {
    if (this.element) {
      this.element.style.display = 'flex';
    }
  }

  /**
   * Скрыть Activity Bar
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

    this.items = [];
    this.activeItem = null;
    this.element = null;

    console.log('[ActivityBar] Destroyed');
  }
}

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ActivityBar;
}

if (typeof window !== 'undefined') {
  window.ActivityBar = ActivityBar;
}
