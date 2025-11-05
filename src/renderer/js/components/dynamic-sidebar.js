/**
 * @file dynamic-sidebar.js
 * @description Dynamic Sidebar - контекстная боковая панель
 *
 * Features:
 * - Динамическое содержимое в зависимости от активной секции
 * - Управление категориями сервисов
 * - Поиск и фильтрация
 * - Статистика и быстрые действия
 */

class DynamicSidebar {
  constructor() {
    /**
     * Текущая активная секция
     * @type {string}
     */
    this.activeSection = 'home';

    /**
     * DOM элемент sidebar
     * @type {HTMLElement|null}
     */
    this.element = null;

    /**
     * Секции sidebar
     * @type {Map<string, HTMLElement>}
     */
    this.sections = new Map();

    console.log('[DynamicSidebar] Initialized');
  }

  /**
   * Инициализация Dynamic Sidebar
   */
  init() {
    console.log('[DynamicSidebar] Initializing...');

    this.element = document.getElementById('sidebar');

    if (!this.element) {
      console.error('[DynamicSidebar] Sidebar element not found');
      return;
    }

    // Загрузка существующих секций
    this._loadSections();

    // Обработчики событий
    this._attachEventListeners();

    // Показать home секцию по умолчанию
    this.showSection('home');

    // Принудительно свернуть все категории в Services при инициализации
    const serviceCategories = document.querySelectorAll('#sidebar-services .sidebar__category');
    serviceCategories.forEach(category => {
      category.classList.remove('sidebar__category--open');
    });

    console.log('[DynamicSidebar] Initialized with sections:', Array.from(this.sections.keys()));
  }

  /**
   * Загрузка существующих секций
   * @private
   */
  _loadSections() {
    const sectionElements = this.element.querySelectorAll('.sidebar__section');

    sectionElements.forEach(el => {
      // Извлечение имени секции из ID (sidebar-home -> home)
      const sectionName = el.id.replace('sidebar-', '');
      this.sections.set(sectionName, el);
    });
  }

  /**
   * Показать секцию
   *
   * @param {string} sectionName - Имя секции ('home', 'documents', 'services', 'settings')
   */
  showSection(sectionName) {
    if (!this.sections.has(sectionName)) {
      console.warn(`[DynamicSidebar] Section not found: ${sectionName}`);
      return;
    }

    // Скрыть все секции
    this.sections.forEach((el, name) => {
      el.style.display = 'none';
    });

    // Показать нужную секцию
    const targetSection = this.sections.get(sectionName);
    targetSection.style.display = 'block';

    this.activeSection = sectionName;

    console.log('[DynamicSidebar] Section shown:', sectionName);

    // Эмит события
    window.eventBus?.emit('sidebar:changed', { section: sectionName });
  }

  /**
   * Обработчики событий
   * @private
   */
  _attachEventListeners() {
    // Слушать события от Activity Bar
    window.eventBus?.on('activitybar:change', ({ itemId }) => {
      this.showSection(itemId);
    });

    // Кнопки в sidebar-home
    this._attachHomeSectionListeners();

    // Кнопки в sidebar-documents
    this._attachDocumentsSectionListeners();

    // Категории в sidebar-services
    this._attachServicesSectionListeners();

    // Настройки в sidebar-settings
    this._attachSettingsSectionListeners();
  }

  /**
   * Обработчики для Home секции
   * @private
   */
  _attachHomeSectionListeners() {
    // Быстрые действия
    const quickNewDoc = document.getElementById('quick-new-document');
    const quickOpenDoc = document.getElementById('quick-open-document');

    if (quickNewDoc) {
      quickNewDoc.addEventListener('click', () => {
        window.eventBus?.emit('document:new');
      });
    }

    if (quickOpenDoc) {
      quickOpenDoc.addEventListener('click', () => {
        window.eventBus?.emit('document:open');
      });
    }

    // Список последних документов
    const recentList = document.getElementById('home-recent-documents');
    if (recentList) {
      recentList.addEventListener('click', (e) => {
        const docItem = e.target.closest('.sidebar__list-item');
        if (docItem) {
          const docId = docItem.getAttribute('data-document-id');
          if (docId) {
            window.eventBus?.emit('document:load', { documentId: docId });
          }
        }
      });
    }
  }

  /**
   * Обработчики для Documents секции
   * @private
   */
  _attachDocumentsSectionListeners() {
    // Кнопки действий
    const newDoc = document.getElementById('new-document');
    const openDoc = document.getElementById('open-document');

    if (newDoc) {
      newDoc.addEventListener('click', () => {
        window.eventBus?.emit('document:new');
      });
    }

    if (openDoc) {
      openDoc.addEventListener('click', () => {
        window.eventBus?.emit('document:open');
      });
    }

    // Поиск документов
    const searchInput = document.getElementById('document-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this._filterDocuments(e.target.value);
      });
    }

    // Фильтры
    const filters = document.querySelectorAll('#sidebar-documents .sidebar__filter');
    filters.forEach(filter => {
      filter.addEventListener('click', () => {
        // Убрать активный класс со всех
        filters.forEach(f => f.classList.remove('sidebar__filter--active'));
        // Добавить активный класс
        filter.classList.add('sidebar__filter--active');

        const filterType = filter.getAttribute('data-filter');
        this._applyDocumentFilter(filterType);
      });
    });
  }

  /**
   * Обработчики для Services секции
   * @private
   */
  _attachServicesSectionListeners() {
    // Категории (аккордеон) — делегирование для надёжности
    const servicesSection = document.getElementById('sidebar-services');
    if (servicesSection) {
      servicesSection.addEventListener('click', (e) => {
        const header = e.target.closest('.sidebar__category-header');
        if (!header || !servicesSection.contains(header)) return;

        // Найти родительский элемент .sidebar__category
        const category = header.closest('.sidebar__category');
        if (!category) return;

        const categoryList = header.nextElementSibling;
        if (categoryList && categoryList.classList.contains('sidebar__category-list')) {
          // Переключить класс --open на родительском элементе
          const isOpen = category.classList.contains('sidebar__category--open');

          if (isOpen) {
            // Закрыть категорию
            category.classList.remove('sidebar__category--open');
            categoryList.style.display = 'none'; // Явно скрываем
          } else {
            // Открыть категорию
            category.classList.add('sidebar__category--open');
            categoryList.style.display = 'block'; // Явно показываем
          }

          console.log('[DynamicSidebar] Category toggled:', header.getAttribute('data-category'), 'open:', !isOpen);
        }
      });
    }

    // Клик по сервису
    const serviceItems = document.querySelectorAll('#sidebar-services .sidebar__category-item');

    serviceItems.forEach(item => {
      item.addEventListener('click', () => {
        const serviceId = item.getAttribute('data-service');
        const hasBadge = item.querySelector('.sidebar__category-item-badge');

        if (hasBadge) {
          // Премиум сервис - показать уведомление
          window.xmlEditorApp?.showToast('Этот сервис доступен в Pro версии', 'info');
        } else {
          // Открыть сервис
          window.eventBus?.emit('service:open', { serviceId });
        }
      });
    });

    // Фильтры сервисов
    const filters = document.querySelectorAll('#sidebar-services .sidebar__filter');
    filters.forEach(filter => {
      filter.addEventListener('click', () => {
        // Скроллим фильтр в видимую область
        filter.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        filters.forEach(f => f.classList.remove('sidebar__filter--active'));
        filter.classList.add('sidebar__filter--active');

        const filterType = filter.getAttribute('data-filter');
        this._applyServiceFilter(filterType);
      });
    });
  }

  /**
   * Обработчики для Settings секции
   * @private
   */
  _attachSettingsSectionListeners() {
    const settingsItems = document.querySelectorAll('#sidebar-settings .sidebar__list-item');

    settingsItems.forEach(item => {
      item.addEventListener('click', () => {
        // Убрать активный класс со всех
        settingsItems.forEach(i => i.classList.remove('sidebar__list-item--active'));
        // Добавить активный класс
        item.classList.add('sidebar__list-item--active');

        const settingsType = item.getAttribute('data-settings');
        window.eventBus?.emit('settings:show', { type: settingsType });
      });
    });
  }

  /**
   * Фильтрация документов по поисковому запросу
   * @private
   */
  _filterDocuments(query) {
    const documentsList = document.getElementById('documents-list');
    if (!documentsList) return;

    const items = documentsList.querySelectorAll('.sidebar__list-item');

    items.forEach(item => {
      const title = item.textContent.toLowerCase();
      const matches = title.includes(query.toLowerCase());

      item.style.display = matches ? 'flex' : 'none';
    });
  }

  /**
   * Применение фильтра к документам
   * @private
   */
  _applyDocumentFilter(filterType) {
    console.log('[DynamicSidebar] Applying document filter:', filterType);

    window.eventBus?.emit('documents:filter', { filterType });

    // TODO: Реализовать логику фильтрации
  }

  /**
   * Применение фильтра к сервисам
   * @private
   */
  _applyServiceFilter(filterType) {
    console.log('[DynamicSidebar] Applying service filter:', filterType);

    const categories = document.querySelectorAll('#sidebar-services .sidebar__category');

    categories.forEach(category => {
      const items = category.querySelectorAll('.sidebar__category-item');
      let visibleCount = 0;

      items.forEach(item => {
        const hasBadge = item.querySelector('.sidebar__category-item-badge');

        let visible = true;

        if (filterType === 'installed') {
          visible = !hasBadge; // Показать только установленные (без Pro badge)
        } else if (filterType === 'available') {
          visible = hasBadge; // Показать только доступные для установки (с Pro badge)
        }

        item.style.display = visible ? 'flex' : 'none';

        if (visible) visibleCount++;
      });

      // Скрыть категорию если нет видимых элементов
      category.style.display = visibleCount > 0 ? 'block' : 'none';
    });
  }

  /**
   * Обновление статистики в Home секции
   *
   * @param {Object} stats - Статистика
   * @param {number} stats.documents - Количество документов
   * @param {number} stats.templates - Количество шаблонов
   */
  updateStatistics(stats) {
    const statDocs = document.getElementById('stat-documents');
    const statTemplates = document.getElementById('stat-templates');

    if (statDocs && stats.documents !== undefined) {
      statDocs.textContent = stats.documents;
    }

    if (statTemplates && stats.templates !== undefined) {
      statTemplates.textContent = stats.templates;
    }
  }

  /**
   * Обновление списка последних документов
   *
   * @param {Array<Object>} documents - Массив документов
   */
  updateRecentDocuments(documents) {
    const recentList = document.getElementById('home-recent-documents');
    if (!recentList) return;

    // Очистка
    recentList.innerHTML = '';

    if (documents.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'sidebar__empty';
      empty.innerHTML = '<p>Нет документов</p>';
      recentList.appendChild(empty);
      return;
    }

    // Создание элементов
    documents.slice(0, 5).forEach(doc => {
      const item = document.createElement('button');
      item.className = 'sidebar__list-item';
      item.setAttribute('data-document-id', doc.id);

      const icon = document.createElement('span');
      icon.className = 'sidebar__list-icon';
      icon.textContent = '📄';

      const text = document.createElement('span');
      text.className = 'sidebar__list-text';
      text.textContent = doc.title || 'Без названия';

      item.appendChild(icon);
      item.appendChild(text);
      recentList.appendChild(item);
    });
  }

  /**
   * Показать sidebar
   */
  show() {
    if (this.element) {
      this.element.style.display = 'block';
    }
  }

  /**
   * Скрыть sidebar
   */
  hide() {
    if (this.element) {
      this.element.style.display = 'none';
    }
  }
}

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DynamicSidebar;
}

if (typeof window !== 'undefined') {
  window.DynamicSidebar = DynamicSidebar;
}
