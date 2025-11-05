/**
 * @file template-browser.js
 * @description Template browser component for selecting document templates
 * @module TemplateBrowser
 */

/**
 * TemplateBrowser - диалог выбора шаблона документа
 *
 * @example
 * const browser = new TemplateBrowser({
 *   schemaVersion: '01.05',
 *   onSelect: (template) => console.log('Selected:', template)
 * });
 * browser.show();
 */
class TemplateBrowser {
  /**
   * @param {Object} options - Configuration options
   * @param {string} options.schemaVersion - Schema version filter (optional)
   * @param {Function} options.onSelect - Callback when template is selected
   * @param {Function} options.onCancel - Callback when dialog is cancelled
   */
  constructor(options = {}) {
    this.schemaVersion = options.schemaVersion || null;
    this.onSelect = options.onSelect || (() => {});
    this.onCancel = options.onCancel || (() => {});

    this.dialog = null;
    this.overlay = null;
    this.templates = [];
    this.filteredTemplates = [];
    this.searchQuery = '';
  }

  /**
   * Show template browser
   */
  async show() {
    await this.loadTemplates();
    this.render();
    this.attachEvents();

    // Анимация появления
    setTimeout(() => {
      this.overlay?.classList.add('template-browser__overlay--visible');
      this.dialog?.classList.add('template-browser--visible');
    }, 10);
  }

  /**
   * Hide and remove template browser
   */
  hide() {
    // Снять видимость классов
    this.dialog?.classList.remove('template-browser--visible');
    this.overlay?.classList.remove('template-browser__overlay--visible');

    // Немедленно отключить перехват событий оверлеем, чтобы не блокировать клики по UI
    if (this.overlay) {
      this.overlay.style.pointerEvents = 'none';
      this.overlay.style.opacity = '0';
    }

    // Ускоренная очистка, чтобы не мешать e2e-навигации
    setTimeout(() => {
      this.cleanup();
    }, 50);
  }

  /**
   * Load templates from database
   * @private
   */
  async loadTemplates() {
    try {
      const result = await window.electronAPI.listTemplates();

      if (result.success) {
        this.templates = result.templates || [];

        // Фильтрация по версии схемы если указана
        if (this.schemaVersion) {
          this.filteredTemplates = this.templates.filter(
            t => t.schema_version === this.schemaVersion
          );
        } else {
          this.filteredTemplates = [...this.templates];
        }

        console.log(`Loaded ${this.filteredTemplates.length} templates`);
      } else {
        console.error('Failed to load templates:', result.error);
        this.templates = [];
        this.filteredTemplates = [];
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      this.templates = [];
      this.filteredTemplates = [];
    }
  }

  /**
   * Render template browser HTML
   * @private
   */
  render() {
    // Создаем overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'template-browser__overlay';
    this.overlay.style.zIndex = '9998';

    // Создаем dialog
    this.dialog = document.createElement('div');
    this.dialog.className = 'template-browser';
    // Явно показать диалог (на случай, если CSS скрывает по умолчанию)
    this.dialog.style.display = 'block';
    this.dialog.style.zIndex = '9999';

    this.dialog.innerHTML = `
      <div class="template-browser__header">
        <h3 class="template-browser__title">Выбор шаблона</h3>
        <button class="template-browser__close" aria-label="Закрыть">×</button>
      </div>

      <div class="template-browser__toolbar">
        <input
          type="text"
          class="template-browser__search"
          placeholder="Поиск по названию..."
          value="${this.searchQuery}"
        >
        ${this.schemaVersion ? `
          <div class="template-browser__filter">
            <span class="template-browser__filter-label">Версия:</span>
            <span class="template-browser__filter-value">${this.schemaVersion}</span>
          </div>
        ` : ''}
      </div>

      <div class="template-browser__content">
        ${this.renderTemplateList()}
      </div>

      <div class="template-browser__footer">
        <button class="btn btn--secondary template-browser__btn-cancel">Отмена</button>
      </div>
    `;

    document.body.appendChild(this.overlay);
    document.body.appendChild(this.dialog);
  }

  /**
   * Render template list
   * @returns {string} HTML for template list
   * @private
   */
  renderTemplateList() {
    if (this.filteredTemplates.length === 0) {
      return `
        <div class="template-browser__empty">
          <p>Нет доступных шаблонов</p>
          ${this.schemaVersion ? `<p class="template-browser__empty-hint">для версии ${this.schemaVersion}</p>` : ''}
        </div>
      `;
    }

    return `
      <div class="template-browser__list">
        ${this.filteredTemplates.map(template => this.renderTemplateItem(template)).join('')}
      </div>
    `;
  }

  /**
   * Render single template item
   * @param {Object} template - Template data
   * @returns {string} HTML for template item
   * @private
   */
  renderTemplateItem(template) {
    const createdDate = new Date(template.created_at);
    const formattedDate = this.formatDate(createdDate);

    return `
      <div class="template-browser__item" data-template-id="${template.id}">
        <div class="template-browser__item-header">
          <h4 class="template-browser__item-name">${this.escapeHtml(template.name)}</h4>
          <span class="template-browser__item-version">${template.schema_version}</span>
        </div>
        ${template.description ? `
          <p class="template-browser__item-description">${this.escapeHtml(template.description)}</p>
        ` : ''}
        <div class="template-browser__item-footer">
          <span class="template-browser__item-date">📅 ${formattedDate}</span>
        </div>
      </div>
    `;
  }

  /**
   * Format date for display
   * @param {Date} date - Date object
   * @returns {string} Formatted date
   * @private
   */
  formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Сегодня';
    if (days === 1) return 'Вчера';
    if (days < 7) return `${days} дн. назад`;

    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   * @private
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Filter templates by search query
   * @private
   */
  filterTemplates() {
    if (!this.searchQuery.trim()) {
      this.filteredTemplates = this.schemaVersion ?
        this.templates.filter(t => t.schema_version === this.schemaVersion) :
        [...this.templates];
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredTemplates = this.templates.filter(template => {
        const matchesSearch =
          template.name.toLowerCase().includes(query) ||
          (template.description && template.description.toLowerCase().includes(query));

        const matchesVersion = !this.schemaVersion || template.schema_version === this.schemaVersion;

        return matchesSearch && matchesVersion;
      });
    }

    // Перерендерить список
    const contentDiv = this.dialog?.querySelector('.template-browser__content');
    if (contentDiv) {
      contentDiv.innerHTML = this.renderTemplateList();
      this.attachItemEvents();
    }
  }

  /**
   * Attach event listeners
   * @private
   */
  attachEvents() {
    // Закрытие по клику на overlay
    this.overlay?.addEventListener('click', () => {
      this.onCancel();
      this.hide();
    });

    // Закрытие по кнопке X
    const closeBtn = this.dialog?.querySelector('.template-browser__close');
    closeBtn?.addEventListener('click', () => {
      this.onCancel();
      this.hide();
    });

    // Кнопка "Отмена"
    const cancelBtn = this.dialog?.querySelector('.template-browser__btn-cancel');
    cancelBtn?.addEventListener('click', () => {
      this.onCancel();
      this.hide();
    });

    // Поиск
    const searchInput = this.dialog?.querySelector('.template-browser__search');
    searchInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.filterTemplates();
    });

    // Фокус на поле поиска
    searchInput?.focus();

    // События на элементы списка
    this.attachItemEvents();

    // Закрытие по ESC
    this.escapeHandler = (e) => {
      if (e.key === 'Escape') {
        this.onCancel();
        this.hide();
      }
    };
    document.addEventListener('keydown', this.escapeHandler);
  }

  /**
   * Attach events to template items
   * @private
   */
  attachItemEvents() {
    const items = this.dialog?.querySelectorAll('.template-browser__item');
    items?.forEach(item => {
      item.addEventListener('click', () => {
        const templateId = parseInt(item.dataset.templateId);
        const template = this.templates.find(t => t.id === templateId);

        if (template) {
          this.onSelect(template);
          this.hide();
        }
      });
    });
  }

  /**
   * Clean up DOM and event listeners
   * @private
   */
  cleanup() {
    document.removeEventListener('keydown', this.escapeHandler);
    this.overlay?.remove();
    this.dialog?.remove();
    this.overlay = null;
    this.dialog = null;
  }
}

// Export для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TemplateBrowser;
}
