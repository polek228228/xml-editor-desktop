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

    if (!this.elements.container) {
      console.error('[ServiceStore] Container not found');
      return;
    }

    // Загрузка каталога
    await this.loadCatalog();

    // Рендеринг
    this.render();

    // Обработчики событий
    this._attachEventListeners();

    console.log('[ServiceStore] Initialized with', this.catalog.length, 'services');
  }

  /**
   * Загрузка каталога сервисов
   */
  async loadCatalog() {
    try {
      // Загрузка из JSON файла
      const response = await fetch('../data/service-catalog.json');
      const data = await response.json();

      this.catalog = data.services || [];
      this.categories = data.categories || {};

      // Синхронизация с установленными сервисами
      await this._syncWithInstalled();

      console.log('[ServiceStore] Catalog loaded:', this.catalog.length, 'services');
    } catch (error) {
      console.error('[ServiceStore] Failed to load catalog:', error);
      this.catalog = [];
    }
  }

  /**
   * Синхронизация с установленными сервисами
   * @private
   */
  async _syncWithInstalled() {
    if (!window.lifecycleManager) {
      console.warn('[ServiceStore] LifecycleManager not available');
      return;
    }

    // Получить список установленных сервисов
    const installedServices = window.lifecycleManager.getAllServicesWithStates();

    // Обновить статусы в каталоге
    this.catalog.forEach(service => {
      const installed = installedServices.find(s => s.id === service.id);

      if (installed) {
        service.installed = true;
        service.active = installed.state === 'active';
      }
    });
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

    // Заголовок
    const title = document.createElement('h3');
    title.className = 'service-card__title';
    title.textContent = service.name;
    card.appendChild(title);

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

    // Кнопка действия
    const button = document.createElement('button');
    button.className = 'btn btn--sm';

    if (service.active) {
      button.classList.add('btn--success');
      button.textContent = 'Активен';
      button.disabled = true;
    } else if (service.installed) {
      button.classList.add('btn--primary');
      button.textContent = 'Активировать';
      button.setAttribute('data-action', 'activate');
    } else {
      if (service.license === 'free') {
        button.classList.add('btn--primary');
        button.textContent = 'Установить';
        button.setAttribute('data-action', 'install');
      } else {
        button.classList.add('btn--accent');
        button.innerHTML = '💳 Купить';
        button.setAttribute('data-action', 'buy');
      }
    }

    footer.appendChild(button);
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
    this.elements.filters.forEach(filter => {
      filter.addEventListener('click', () => {
        // Убрать активный класс со всех
        this.elements.filters.forEach(f => f.classList.remove('service-store__filter--active'));
        // Добавить активный класс
        filter.classList.add('service-store__filter--active');

        this.currentFilter = filter.getAttribute('data-filter');
        this.render();
      });
    });

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
    if (!window.lifecycleManager) {
      throw new Error('LifecycleManager not available');
    }

    console.log('[ServiceStore] Installing service:', service.id);

    // Создание манифеста
    const manifest = {
      id: service.id,
      name: service.name,
      version: service.version,
      entry: service.main,
      permissions: service.permissions || []
    };

    // Установка через LifecycleManager
    await window.lifecycleManager.install(manifest);

    // Обновление статуса
    service.installed = true;

    // Перерендеринг
    this.render();

    // Уведомление
    window.xmlEditorApp?.showToast(`Сервис "${service.name}" установлен`, 'success');

    console.log('[ServiceStore] Service installed:', service.id);
  }

  /**
   * Активация сервиса
   */
  async activateService(service) {
    if (!window.lifecycleManager) {
      throw new Error('LifecycleManager not available');
    }

    console.log('[ServiceStore] Activating service:', service.id);

    // Активация через LifecycleManager
    await window.lifecycleManager.activate(service.id);

    // Обновление статуса
    service.active = true;

    // Перерендеринг
    this.render();

    // Уведомление
    window.xmlEditorApp?.showToast(`Сервис "${service.name}" активирован`, 'success');

    console.log('[ServiceStore] Service activated:', service.id);
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
