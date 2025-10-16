/**
 * @file validation-panel.js
 * @description Validation panel component for displaying XML validation results
 * @module ValidationPanel
 */

/**
 * ValidationPanel - показывает результаты валидации XML
 *
 * @example
 * const panel = new ValidationPanel({
 *   errors: [{ message: 'Error 1', line: 42, column: 10 }],
 *   onClose: () => console.log('Panel closed')
 * });
 * panel.show();
 */
class ValidationPanel {
  /**
   * @param {Object} options - Configuration options
   * @param {Array<Object>} options.errors - Array of validation errors
   * @param {Function} options.onClose - Callback when panel is closed
   */
  constructor(options = {}) {
    this.errors = options.errors || [];
    this.onClose = options.onClose || (() => {});
    this.panel = null;
    this.overlay = null;
  }

  /**
   * Show validation panel
   */
  show() {
    this.render();
    this.attachEvents();

    // Анимация появления
    setTimeout(() => {
      this.overlay?.classList.add('validation-panel__overlay--visible');
      this.panel?.classList.add('validation-panel--visible');
    }, 10);
  }

  /**
   * Hide and remove validation panel
   */
  hide() {
    this.panel?.classList.remove('validation-panel--visible');
    this.overlay?.classList.remove('validation-panel__overlay--visible');

    setTimeout(() => {
      this.cleanup();
      this.onClose();
    }, 300);
  }

  /**
   * Render validation panel HTML
   * @private
   */
  render() {
    // Создаем overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'validation-panel__overlay';

    // Создаем panel
    this.panel = document.createElement('div');
    this.panel.className = 'validation-panel';

    const isValid = this.errors.length === 0;
    const statusClass = isValid ? 'validation-panel--success' : 'validation-panel--error';
    this.panel.classList.add(statusClass);

    this.panel.innerHTML = `
      <div class="validation-panel__header">
        <h3 class="validation-panel__title">
          ${isValid ? '✓ XML валиден' : '✗ Ошибки валидации'}
        </h3>
        <button class="validation-panel__close" aria-label="Закрыть">×</button>
      </div>
      <div class="validation-panel__content">
        ${this.renderContent(isValid)}
      </div>
      <div class="validation-panel__footer">
        <button class="btn btn--secondary validation-panel__btn-close">Закрыть</button>
      </div>
    `;

    document.body.appendChild(this.overlay);
    document.body.appendChild(this.panel);
  }

  /**
   * Render panel content based on validation result
   * @param {boolean} isValid - Whether validation passed
   * @returns {string} HTML content
   * @private
   */
  renderContent(isValid) {
    if (isValid) {
      return `
        <div class="validation-panel__success-message">
          <div class="validation-panel__success-icon">✓</div>
          <p>XML документ соответствует схеме Минстроя РФ</p>
          <p class="validation-panel__success-details">
            Все обязательные поля заполнены корректно.
            Документ готов к экспорту.
          </p>
        </div>
      `;
    }

    return `
      <div class="validation-panel__error-summary">
        <strong>Найдено ошибок:</strong> ${this.errors.length}
      </div>
      <div class="validation-panel__errors">
        ${this.errors.map((error, index) => this.renderError(error, index)).join('')}
      </div>
    `;
  }

  /**
   * Render single validation error
   * @param {Object} error - Validation error
   * @param {number} index - Error index
   * @returns {string} HTML for error item
   * @private
   */
  renderError(error, index) {
    const location = error.line ?
      `Строка ${error.line}${error.column ? `, колонка ${error.column}` : ''}` :
      'Позиция неизвестна';

    const errorType = this.getErrorTypeLabel(error.type);

    return `
      <div class="validation-panel__error-item">
        <div class="validation-panel__error-number">${index + 1}</div>
        <div class="validation-panel__error-details">
          <div class="validation-panel__error-type">${errorType}</div>
          <div class="validation-panel__error-message">${this.escapeHtml(error.message)}</div>
          <div class="validation-panel__error-location">${location}</div>
        </div>
      </div>
    `;
  }

  /**
   * Get human-readable error type label
   * @param {string} type - Error type
   * @returns {string} Label
   * @private
   */
  getErrorTypeLabel(type) {
    const labels = {
      'validation_error': 'Ошибка валидации',
      'xml_parse_error': 'Ошибка парсинга XML',
      'schema_error': 'Ошибка схемы XSD',
      'input_error': 'Ошибка входных данных',
      'validator_error': 'Ошибка валидатора'
    };

    return labels[type] || 'Неизвестная ошибка';
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
   * Attach event listeners
   * @private
   */
  attachEvents() {
    // Закрытие по клику на overlay
    this.overlay?.addEventListener('click', () => this.hide());

    // Закрытие по кнопке X
    const closeBtn = this.panel?.querySelector('.validation-panel__close');
    closeBtn?.addEventListener('click', () => this.hide());

    // Закрытие по кнопке "Закрыть"
    const footerBtn = this.panel?.querySelector('.validation-panel__btn-close');
    footerBtn?.addEventListener('click', () => this.hide());

    // Закрытие по ESC
    this.escapeHandler = (e) => {
      if (e.key === 'Escape') {
        this.hide();
      }
    };
    document.addEventListener('keydown', this.escapeHandler);
  }

  /**
   * Clean up DOM and event listeners
   * @private
   */
  cleanup() {
    document.removeEventListener('keydown', this.escapeHandler);
    this.overlay?.remove();
    this.panel?.remove();
    this.overlay = null;
    this.panel = null;
  }
}

// Export для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ValidationPanel;
}
