/**
 * @file service-store.js
 * @description Service Store - магазин сервисов и модулей
 *
 * Features:
 * - Каталог доступных сервисов
 * - Установка/удаление сервисов
 * - Активация/деактивация сервисов
 * - Поиск и фильтрация
 * - Интеграция с LifecycleManager
 */

class ServiceStore {
  constructor() {
    /**
     * Каталог сервисов
     * @type {Array<Object>}
     */
    this.catalog = [];

    /**
     * Категории
     * @type {Object}
     */
    this.categories = {};

    /**
     * Текущий фильтр
     * @type {string}
     */
    this.currentFilter = 'all';

    /**
     * Поисковый запрос
     * @type {string}
     */
    this.searchQuery = '';

    /**
     * DOM элементы
     * @type {Object}
     */
    this.elements = {};

    console.log('[ServiceStore] Initialized');
  }

  /**
   * Инициализация Service Store
   */
  async init() {
    console.log('[ServiceStore] Initializing...');

    // Кэширование DOM элементов
    this.elements.container = document.getElementById('service-store');
    this.elements.featuredGrid = document.querySelector('.service-store__featured .service-store__grid');
    this.elements.allGrid = document.querySelector('.service-store__all .service-store__grid');
    this.elements.searchInput = document.querySelector('.service-store__search');
    this.elements.filters = document.querySelectorAll('.service-store__filter');

    console.log('[ServiceStore] Elements found:', {
      container: !!this.elements.container,
      featuredGrid: !!this.elements.featuredGrid,
      allGrid: !!this.elements.allGrid,
      searchInput: !!this.elements.searchInput,
      filters: this.elements.filters.length
    });

    if (!this.elements.container) {
      console.error('[ServiceStore] Container #service-store not found in DOM');
      return;
    }

    // Загрузка каталога
    await this.loadCatalog();

    // Рендеринг
    this.render();

    // Обработчики событий
    this._attachEventListeners();

    // Гарантировать кликабельность фильтров (не перекрыты элементами сверху)
    if (this.elements.filters) {
      this.elements.filters.forEach((f) => {
        const parent = f.parentElement;
        if (parent && !parent.style.zIndex) parent.style.zIndex = '1';
      });
    }

    console.log('[ServiceStore] Initialized with', this.catalog.length, 'services');
  }

  /**
   * Загрузка каталога сервисов
   */
  async loadCatalog() {
    try {
      console.log('[ServiceStore] Loading catalog from backend...');

      // Show loading state
      this._showLoadingState();

      // Load modules from backend via IPC
      const result = await window.electronAPI.listModules({ type: 'all' });

      if (!result.success) {
        throw new Error(result.error || 'Failed to load modules');
      }

      // Map modules to service format
      this.catalog = this._mapModulesToServices(result.modules || []);

      // Extract categories from modules
      this._buildCategories();

      console.log('[ServiceStore] Catalog loaded:', this.catalog.length, 'services');

      // Hide loading state
      this._hideLoadingState();

    } catch (error) {
      console.error('[ServiceStore] Failed to load catalog:', error);
      this.catalog = [];

      // Hide loading state and show error
      this._hideLoadingState();
      this._showErrorState(error.message);
    }
  }

  /**
   * Map backend modules to service store format
   * @private
   */
  _mapModulesToServices(modules) {
    return modules.map(module => ({
      id: module.id,
      name: module.name,
      description: module.description || 'Нет описания',
      version: module.version,
      category: module.category,
      type: module.type,
      icon: module.icon || '📦',
      price: module.price || 0,
      license: module.price > 0 ? 'pro' : 'free',
      installed: Boolean(module.is_installed),
      active: Boolean(module.is_active),
      featured: Boolean(module.is_featured),
      rating: module.rating || 0,
      downloads: module.downloads || 0,
      tags: this._generateTagsFromModule(module)
    }));
  }

  /**
   * Generate tags from module metadata
   * @private
   */
  _generateTagsFromModule(module) {
    const tags = [];

    if (module.type) {
      const typeLabels = {
        'document': 'Документ',
        'form': 'Форма',
        'tool': 'Инструмент',
        'integration': 'Интеграция'
      };
      tags.push(typeLabels[module.type] || module.type);
    }

    if (module.category) {
      tags.push(module.category);
    }

    return tags;
  }

  /**
   * Build categories object from modules
   * @private
   */
  _buildCategories() {
    const categoryMap = {};
    const categoryIcons = {
      'documents': { name: 'Документы', icon: '📄', order: 1 },
      'forms': { name: 'Формы', icon: '📝', order: 2 },
      'tools': { name: 'Инструменты', icon: '🛠️', order: 3 },
      'integrations': { name: 'Интеграции', icon: '🔌', order: 4 }
    };

    this.catalog.forEach(service => {
      if (service.category && !categoryMap[service.category]) {
        const categoryInfo = categoryIcons[service.category] || {
          name: service.category,
          icon: '📦',
          order: 999
        };
        categoryMap[service.category] = categoryInfo;
      }
    });

    this.categories = categoryMap;
  }

  /**
   * Рендеринг каталога
   */
  render() {
    // Фильтрация сервисов
    const filteredServices = this._filterServices();

    // Рендеринг featured сервисов
    const featuredServices = filteredServices.filter(s => s.featured);
    this._renderServiceGrid(this.elements.featuredGrid, featuredServices);

    // Рендеринг всех сервисов по категориям
    this._renderAllServices(filteredServices);
  }

  /**
   * Рендеринг сетки сервисов
   * @private
   */
  _renderServiceGrid(container, services) {
    if (!container) return;

    // Очистка
    container.innerHTML = '';

    if (services.length === 0) {
      container.innerHTML = '<div class="service-store__empty">Сервисы не найдены</div>';
      return;
    }

    // Создание карточек
    services.forEach(service => {
      const card = this._createServiceCard(service);
      container.appendChild(card);
    });
  }

  /**
   * Создание карточки сервиса
   * @private
   */
  _createServiceCard(service) {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.setAttribute('data-service-id', service.id);

    // Иконка
    const icon = document.createElement('div');
    icon.className = 'service-card__icon';
    icon.textContent = service.icon || '📦';
    card.appendChild(icon);

    // Заголовок с бэйджем статуса
    const titleContainer = document.createElement('div');
    titleContainer.style.display = 'flex';
    titleContainer.style.alignItems = 'center';
    titleContainer.style.gap = '8px';

    const title = document.createElement('h3');
    title.className = 'service-card__title';
    title.textContent = service.name;
    titleContainer.appendChild(title);

    // Бэйдж статуса
    if (service.active) {
      const badge = document.createElement('span');
      badge.className = 'service-card__badge service-card__badge--active';
      badge.textContent = '✓ Активен';
      badge.style.cssText = 'padding: 2px 8px; border-radius: 4px; font-size: 11px; background: #10b981; color: white;';
      titleContainer.appendChild(badge);
    } else if (service.installed) {
      const badge = document.createElement('span');
      badge.className = 'service-card__badge service-card__badge--installed';
      badge.textContent = 'Установлен';
      badge.style.cssText = 'padding: 2px 8px; border-radius: 4px; font-size: 11px; background: #6b7280; color: white;';
      titleContainer.appendChild(badge);
    }

    card.appendChild(titleContainer);

    // Описание
    const desc = document.createElement('p');
    desc.className = 'service-card__description';
    desc.textContent = service.description;
    card.appendChild(desc);

    // Теги
    if (service.tags && service.tags.length > 0) {
      const tagsContainer = document.createElement('div');
      tagsContainer.className = 'service-card__tags';

      service.tags.slice(0, 3).forEach(tag => {
        const tagEl = document.createElement('span');
        tagEl.className = 'service-card__tag';
        tagEl.textContent = tag;
        tagsContainer.appendChild(tagEl);
      });

      card.appendChild(tagsContainer);
    }

    // Футер (цена + кнопка)
    const footer = document.createElement('div');
    footer.className = 'service-card__footer';

    // Цена
    const price = document.createElement('div');
    price.className = 'service-card__price';

    if (service.license === 'free') {
      price.textContent = 'Бесплатно';
      price.classList.add('service-card__price--free');
    } else if (service.license === 'pro') {
      price.innerHTML = `<span class="service-card__price-badge">Pro</span> ${service.price} ₽`;
    } else if (service.license === 'enterprise') {
      price.innerHTML = `<span class="service-card__price-badge service-card__price-badge--enterprise">Enterprise</span> ${service.price} ₽`;
    }

    footer.appendChild(price);

    // Кнопки действия
    if (service.active) {
      // Active module: Show Deactivate and Uninstall buttons
      const deactivateBtn = document.createElement('button');
      deactivateBtn.className = 'btn btn--sm btn--secondary';
      deactivateBtn.textContent = 'Деактивировать';
      deactivateBtn.setAttribute('data-action', 'deactivate');
      footer.appendChild(deactivateBtn);

      const uninstallBtn = document.createElement('button');
      uninstallBtn.className = 'btn btn--sm btn--danger';
      uninstallBtn.textContent = 'Удалить';
      uninstallBtn.setAttribute('data-action', 'uninstall');
      footer.appendChild(uninstallBtn);

    } else if (service.installed) {
      // Installed but not active: Show Activate and Uninstall buttons
      const activateBtn = document.createElement('button');
      activateBtn.className = 'btn btn--sm btn--primary';
      activateBtn.textContent = 'Активировать';
      activateBtn.setAttribute('data-action', 'activate');
      footer.appendChild(activateBtn);

      const uninstallBtn = document.createElement('button');
      uninstallBtn.className = 'btn btn--sm btn--secondary';
      uninstallBtn.textContent = 'Удалить';
      uninstallBtn.setAttribute('data-action', 'uninstall');
      footer.appendChild(uninstallBtn);

    } else {
      // Not installed: Show Install or Buy button
      const button = document.createElement('button');
      button.className = 'btn btn--sm';

      if (service.license === 'free') {
        button.classList.add('btn--primary');
        button.textContent = 'Установить';
        button.setAttribute('data-action', 'install');
      } else {
        button.classList.add('btn--accent');
        button.textContent = '💳 Купить';
        button.setAttribute('data-action', 'buy');
      }

      footer.appendChild(button);
    }

    card.appendChild(footer);

    return card;
  }

  /**
   * Рендеринг всех сервисов по категориям
   * @private
   */
  _renderAllServices(services) {
    if (!this.elements.allGrid) return;

    // Группировка по категориям
    const servicesByCategory = {};

    services.forEach(service => {
      if (!servicesByCategory[service.category]) {
        servicesByCategory[service.category] = [];
      }
      servicesByCategory[service.category].push(service);
    });

    // Очистка
    this.elements.allGrid.innerHTML = '';

    // Сортировка категорий по order
    const sortedCategories = Object.keys(servicesByCategory).sort((a, b) => {
      const orderA = this.categories[a]?.order || 999;
      const orderB = this.categories[b]?.order || 999;
      return orderA - orderB;
    });

    // Рендеринг по категориям
    sortedCategories.forEach(categoryId => {
      const category = this.categories[categoryId];
      const categoryServices = servicesByCategory[categoryId];

      // Заголовок категории
      const categoryHeader = document.createElement('div');
      categoryHeader.className = 'service-store__category-header';

      const categoryIcon = document.createElement('span');
      categoryIcon.className = 'service-store__category-icon';
      categoryIcon.textContent = category?.icon || '📦';

      const categoryTitle = document.createElement('h3');
      categoryTitle.className = 'service-store__category-title';
      categoryTitle.textContent = category?.name || categoryId;

      const categoryCount = document.createElement('span');
      categoryCount.className = 'service-store__category-count';
      categoryCount.textContent = categoryServices.length;

      categoryHeader.appendChild(categoryIcon);
      categoryHeader.appendChild(categoryTitle);
      categoryHeader.appendChild(categoryCount);

      this.elements.allGrid.appendChild(categoryHeader);

      // Сетка сервисов категории
      const categoryGrid = document.createElement('div');
      categoryGrid.className = 'service-store__grid';

      categoryServices.forEach(service => {
        const card = this._createServiceCard(service);
        categoryGrid.appendChild(card);
      });

      this.elements.allGrid.appendChild(categoryGrid);
    });
  }

  /**
   * Фильтрация сервисов
   * @private
   */
  _filterServices() {
    let filtered = [...this.catalog];

    // Поиск
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(service => {
        return (
          service.name.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query) ||
          service.tags?.some(tag => tag.toLowerCase().includes(query))
        );
      });
    }

    // Фильтр
    if (this.currentFilter !== 'all') {
      if (this.currentFilter === 'installed') {
        filtered = filtered.filter(s => s.installed);
      } else if (this.currentFilter === 'free') {
        filtered = filtered.filter(s => s.license === 'free');
      } else if (this.currentFilter === 'pro') {
        filtered = filtered.filter(s => s.license === 'pro' || s.license === 'enterprise');
      }
    }

    return filtered;
  }

  /**
   * Обработчики событий
   * @private
   */
  _attachEventListeners() {
    // Поиск
    if (this.elements.searchInput) {
      this.elements.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.render();
      });
    }

    // Фильтры
    // Делегирование кликов по фильтрам, чтобы исключить перекрытия
    const header = this.elements.container?.querySelector('.service-store__header');
    if (header) {
      header.addEventListener('click', (e) => {
        const filter = e.target.closest('.service-store__filter');
        if (!filter) return;

        // Убедиться, что фильтры видимы пользователю
        header.scrollIntoView({ block: 'start', behavior: 'instant' });

        // Убрать активный класс со всех
        this.elements.filters.forEach(f => f.classList.remove('service-store__filter--active'));
        // Добавить активный класс
        filter.classList.add('service-store__filter--active');

        this.currentFilter = filter.getAttribute('data-filter');
        this.render();
      });
    }

    // Клик по карточкам (делегирование)
    if (this.elements.container) {
      this.elements.container.addEventListener('click', async (e) => {
        const button = e.target.closest('button[data-action]');
        if (!button) return;

        const card = button.closest('.service-card');
        if (!card) return;

        const serviceId = card.getAttribute('data-service-id');
        const action = button.getAttribute('data-action');

        await this._handleServiceAction(serviceId, action);
      });
    }
  }

  /**
   * Обработка действий с сервисом
   * @private
   */
  async _handleServiceAction(serviceId, action) {
    const service = this.catalog.find(s => s.id === serviceId);
    if (!service) return;

    console.log(`[ServiceStore] Action "${action}" on service:`, serviceId);

    try {
      if (action === 'install') {
        await this.installService(service);
      } else if (action === 'activate') {
        await this.activateService(service);
      } else if (action === 'deactivate') {
        await this.deactivateService(service);
      } else if (action === 'uninstall') {
        await this.uninstallService(service);
      } else if (action === 'buy') {
        this.showPurchaseDialog(service);
      }
    } catch (error) {
      console.error('[ServiceStore] Action failed:', error);
      window.xmlEditorApp?.showToast(`Ошибка: ${error.message}`, 'error');
    }
  }

  /**
   * Установка сервиса
   */
  async installService(service) {
    console.log('[ServiceStore] Installing service:', service.id);

    // Find button and show loading state
    const button = document.querySelector(`[data-service-id="${service.id}"] button[data-action="install"]`);
    const originalText = button?.textContent;

    try {
      // Show loading state
      if (button) {
        button.disabled = true;
        button.innerHTML = '<span class="spinner-sm"></span> Установка...';
      }

      // Install via IPC
      const result = await window.electronAPI.installModule(service.id);

      if (!result.success) {
        throw new Error(result.error || 'Installation failed');
      }

      // Reload catalog to sync status
      await this.loadCatalog();

      // Re-render
      this.render();

      // Show success notification
      window.xmlEditorApp?.showToast(`Модуль "${service.name}" успешно установлен`, 'success');

      console.log('[ServiceStore] Service installed:', service.id);

    } catch (error) {
      console.error('[ServiceStore] Installation failed:', error);

      // Restore button state
      if (button) {
        button.disabled = false;
        button.textContent = originalText || 'Установить';
      }

      // Show error notification
      window.xmlEditorApp?.showToast(`Ошибка установки: ${error.message}`, 'error');

      throw error;
    }
  }

  /**
   * Активация сервиса
   */
  async activateService(service) {
    console.log('[ServiceStore] Activating service:', service.id);

    // Find button and show loading state
    const button = document.querySelector(`[data-service-id="${service.id}"] button[data-action="activate"]`);
    const originalText = button?.textContent;

    try {
      // Show loading state
      if (button) {
        button.disabled = true;
        button.innerHTML = '<span class="spinner-sm"></span> Активация...';
      }

      // Activate via IPC
      const result = await window.electronAPI.activateModule(service.id);

      if (!result.success) {
        throw new Error(result.error || 'Activation failed');
      }

      // Reload catalog to sync status
      await this.loadCatalog();

      // Re-render
      this.render();

      // Show success notification
      window.xmlEditorApp?.showToast(`Модуль "${service.name}" успешно активирован`, 'success');

      console.log('[ServiceStore] Service activated:', service.id);

    } catch (error) {
      console.error('[ServiceStore] Activation failed:', error);

      // Restore button state
      if (button) {
        button.disabled = false;
        button.textContent = originalText || 'Активировать';
      }

      // Show error notification
      window.xmlEditorApp?.showToast(`Ошибка активации: ${error.message}`, 'error');

      throw error;
    }
  }

  /**
   * Деактивация сервиса
   */
  async deactivateService(service) {
    console.log('[ServiceStore] Deactivating service:', service.id);

    // Find button and show loading state
    const button = document.querySelector(`[data-service-id="${service.id}"] button[data-action="deactivate"]`);
    const originalText = button?.textContent;

    try {
      // Show loading state
      if (button) {
        button.disabled = true;
        button.innerHTML = '<span class="spinner-sm"></span> Деактивация...';
      }

      // Deactivate via IPC
      const result = await window.electronAPI.deactivateModule(service.id);

      if (!result.success) {
        throw new Error(result.error || 'Deactivation failed');
      }

      // Reload catalog to sync status
      await this.loadCatalog();

      // Re-render
      this.render();

      // Show success notification
      window.xmlEditorApp?.showToast(`Модуль "${service.name}" успешно деактивирован`, 'success');

      console.log('[ServiceStore] Service deactivated:', service.id);

    } catch (error) {
      console.error('[ServiceStore] Deactivation failed:', error);

      // Restore button state
      if (button) {
        button.disabled = false;
        button.textContent = originalText || 'Деактивировать';
      }

      // Show error notification
      window.xmlEditorApp?.showToast(`Ошибка деактивации: ${error.message}`, 'error');

      throw error;
    }
  }

  /**
   * Удаление сервиса
   */
  async uninstallService(service) {
    console.log('[ServiceStore] Uninstalling service:', service.id);

    // Confirmation dialog
    const confirmed = confirm(`Вы уверены, что хотите удалить модуль "${service.name}"?`);
    if (!confirmed) {
      console.log('[ServiceStore] Uninstall cancelled by user');
      return;
    }

    // Find button and show loading state
    const button = document.querySelector(`[data-service-id="${service.id}"] button[data-action="uninstall"]`);
    const originalText = button?.textContent;

    try {
      // Show loading state
      if (button) {
        button.disabled = true;
        button.innerHTML = '<span class="spinner-sm"></span> Удаление...';
      }

      // Uninstall via IPC
      const result = await window.electronAPI.uninstallModule(service.id);

      if (!result.success) {
        throw new Error(result.error || 'Uninstallation failed');
      }

      // Reload catalog to sync status
      await this.loadCatalog();

      // Re-render
      this.render();

      // Show success notification
      window.xmlEditorApp?.showToast(`Модуль "${service.name}" успешно удален`, 'success');

      console.log('[ServiceStore] Service uninstalled:', service.id);

    } catch (error) {
      console.error('[ServiceStore] Uninstallation failed:', error);

      // Restore button state
      if (button) {
        button.disabled = false;
        button.textContent = originalText || 'Удалить';
      }

      // Show error notification
      window.xmlEditorApp?.showToast(`Ошибка удаления: ${error.message}`, 'error');

      throw error;
    }
  }

  /**
   * Показать диалог покупки
   */
  showPurchaseDialog(service) {
    console.log('[ServiceStore] Show purchase dialog for:', service.id);

    // TODO: Реализовать диалог покупки
    window.xmlEditorApp?.showToast(
      `Покупка сервисов будет доступна в следующих версиях.\n\nСервис: ${service.name}\nЦена: ${service.price} ₽`,
      'info'
    );
  }

  /**
   * Show loading state
   * @private
   */
  _showLoadingState() {
    if (this.elements.featuredGrid) {
      this.elements.featuredGrid.innerHTML = '<div class="service-store__loading">Загрузка сервисов...</div>';
    }
    if (this.elements.allGrid) {
      this.elements.allGrid.innerHTML = '<div class="service-store__loading">Загрузка сервисов...</div>';
    }
  }

  /**
   * Hide loading state
   * @private
   */
  _hideLoadingState() {
    // Loading state will be replaced by render()
  }

  /**
   * Show error state
   * @private
   */
  _showErrorState(message) {
    const errorHtml = `
      <div class="service-store__error">
        <div class="service-store__error-icon">⚠️</div>
        <div class="service-store__error-message">
          Ошибка загрузки каталога: ${message}
        </div>
        <button class="btn btn--primary" onclick="window.serviceStore?.loadCatalog()">
          Повторить попытку
        </button>
      </div>
    `;

    if (this.elements.featuredGrid) {
      this.elements.featuredGrid.innerHTML = errorHtml;
    }
    if (this.elements.allGrid) {
      this.elements.allGrid.innerHTML = '';
    }
  }

  /**
   * Показать Service Store
   */
  show() {
    if (this.elements.container) {
      this.elements.container.style.display = 'block';
    }
  }

  /**
   * Скрыть Service Store
   */
  hide() {
    if (this.elements.container) {
      this.elements.container.style.display = 'none';
    }
  }
}

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ServiceStore;
}

if (typeof window !== 'undefined') {
  window.ServiceStore = ServiceStore;
}
