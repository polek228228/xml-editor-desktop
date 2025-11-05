/**
 * @file document-dialog.js
 * @description Document creation dialog component
 * @module DocumentDialog
 */

/**
 * DocumentDialog - диалог создания нового документа
 *
 * @example
 * const dialog = new DocumentDialog({
 *   onSuccess: (document) => console.log('Created:', document)
 * });
 * dialog.show();
 */
class DocumentDialog {
  /**
   * @param {Object} options - Configuration options
   * @param {Function} options.onSuccess - Callback when document is created
   * @param {Function} options.onCancel - Callback when dialog is cancelled
   */
  constructor(options = {}) {
    this.onSuccess = options.onSuccess || (() => {});
    this.onCancel = options.onCancel || (() => {});

    this.dialog = null;
    this.overlay = null;
  }

  /**
   * Show document creation dialog
   */
  show() {
    this.render();
    this.attachEvents();

    // Анимация появления
    setTimeout(() => {
      this.overlay?.classList.add('template-dialog__overlay--visible');
      this.dialog?.classList.add('template-dialog--visible');

      // Фокус на поле названия
      const titleInput = this.dialog?.querySelector('#document-title-input');
      titleInput?.focus();
    }, 10);
  }

  /**
   * Hide and remove dialog
   */
  hide() {
    this.dialog?.classList.remove('template-dialog--visible');
    this.overlay?.classList.remove('template-dialog__overlay--visible');

    setTimeout(() => {
      this.cleanup();
    }, 300);
  }

  /**
   * Render dialog HTML
   * @private
   */
  render() {
    // Создаем overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'template-dialog__overlay';

    // Создаем dialog
    this.dialog = document.createElement('div');
    this.dialog.className = 'template-dialog';

    this.dialog.innerHTML = `
      <div class="template-dialog__header">
        <h3 class="template-dialog__title">Создать новый документ</h3>
        <button class="template-dialog__close" aria-label="Закрыть">×</button>
      </div>

      <div class="template-dialog__content">
        <form class="template-dialog__form" id="document-create-form">
          <div class="template-dialog__field">
            <label for="document-title-input" class="template-dialog__label">
              Название документа <span class="template-dialog__required">*</span>
            </label>
            <input
              type="text"
              id="document-title-input"
              class="template-dialog__input"
              placeholder="Название документа"
              required
              autofocus
            >
          </div>

          <div class="template-dialog__field">
            <label for="schema-version-select" class="template-dialog__label">
              Версия схемы <span class="template-dialog__required">*</span>
            </label>
            <select
              id="schema-version-select"
              class="template-dialog__select"
              required
            >
              <option value="">Выберите версию схемы</option>
              <option value="01.03">ПЗ 01.03 (устаревшая)</option>
              <option value="01.04">ПЗ 01.04 (переходная)</option>
              <option value="01.05">ПЗ 01.05 (актуальная)</option>
            </select>
          </div>
        </form>
      </div>

      <div class="template-dialog__footer">
        <button type="button" class="btn btn--secondary" id="cancel-document-create">
          Отмена
        </button>
        <button type="submit" form="document-create-form" class="btn btn--primary" id="confirm-document-create">
          Создать
        </button>
      </div>
    `;

    // Добавляем в DOM
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.dialog);
  }

  /**
   * Attach event handlers
   * @private
   */
  attachEvents() {
    // Close button
    const closeBtn = this.dialog?.querySelector('.template-dialog__close');
    closeBtn?.addEventListener('click', () => this.handleCancel());

    // Cancel button
    const cancelBtn = this.dialog?.querySelector('#cancel-document-create');
    cancelBtn?.addEventListener('click', () => this.handleCancel());

    // Overlay click
    this.overlay?.addEventListener('click', () => this.handleCancel());

    // Form submit
    const form = this.dialog?.querySelector('#document-create-form');
    form?.addEventListener('submit', (e) => this.handleSubmit(e));

    // ESC key
    this.escHandler = (e) => {
      if (e.key === 'Escape') {
        this.handleCancel();
      }
    };
    document.addEventListener('keydown', this.escHandler);
  }

  /**
   * Handle form submission
   * @private
   */
  async handleSubmit(e) {
    e.preventDefault();

    const titleInput = this.dialog?.querySelector('#document-title-input');
    const schemaSelect = this.dialog?.querySelector('#schema-version-select');

    const title = titleInput?.value.trim();
    const schema_version = schemaSelect?.value;

    if (!title || !schema_version) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      // Создаем документ через IPC
      const result = await window.electronAPI.createDocument({
        title,
        schema_version,
        content: {}
      });

      if (result.success) {
        this.hide();
        this.onSuccess({
          id: result.id,
          title,
          schema_version,
          content: {}
        });
      } else {
        throw new Error(result.error || 'Неизвестная ошибка');
      }
    } catch (error) {
      console.error('Error creating document:', error);
      alert(`Ошибка при создании документа: ${error.message}`);
    }
  }

  /**
   * Handle cancel action
   * @private
   */
  handleCancel() {
    this.hide();
    this.onCancel();
  }

  /**
   * Clean up dialog DOM and events
   * @private
   */
  cleanup() {
    // Remove ESC handler
    if (this.escHandler) {
      document.removeEventListener('keydown', this.escHandler);
    }

    // Remove DOM elements
    this.dialog?.remove();
    this.overlay?.remove();

    this.dialog = null;
    this.overlay = null;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DocumentDialog;
}
