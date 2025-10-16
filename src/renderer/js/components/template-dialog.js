/**
 * @file template-dialog.js
 * @description Template creation/editing dialog component
 * @module TemplateDialog
 */

/**
 * TemplateDialog - диалог создания/редактирования шаблона
 *
 * @example
 * const dialog = new TemplateDialog({
 *   mode: 'create',
 *   documentData: { content, schema_version },
 *   onSave: (template) => console.log('Saved:', template)
 * });
 * dialog.show();
 */
class TemplateDialog {
  /**
   * @param {Object} options - Configuration options
   * @param {string} options.mode - 'create' or 'edit'
   * @param {Object} options.template - Template data (for edit mode)
   * @param {Object} options.documentData - Document data (for create mode)
   * @param {Function} options.onSave - Callback when template is saved
   * @param {Function} options.onCancel - Callback when dialog is cancelled
   */
  constructor(options = {}) {
    this.mode = options.mode || 'create';
    this.template = options.template || null;
    this.documentData = options.documentData || null;
    this.onSave = options.onSave || (() => {});
    this.onCancel = options.onCancel || (() => {});

    this.dialog = null;
    this.overlay = null;
  }

  /**
   * Show template dialog
   */
  show() {
    this.render();
    this.attachEvents();

    // Анимация появления
    setTimeout(() => {
      this.overlay?.classList.add('template-dialog__overlay--visible');
      this.dialog?.classList.add('template-dialog--visible');
    }, 10);
  }

  /**
   * Hide and remove template dialog
   */
  hide() {
    this.dialog?.classList.remove('template-dialog--visible');
    this.overlay?.classList.remove('template-dialog__overlay--visible');

    setTimeout(() => {
      this.cleanup();
    }, 300);
  }

  /**
   * Render template dialog HTML
   * @private
   */
  render() {
    // Создаем overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'template-dialog__overlay';

    // Создаем dialog
    this.dialog = document.createElement('div');
    this.dialog.className = 'template-dialog';

    const title = this.mode === 'create' ? 'Сохранить как шаблон' : 'Редактировать шаблон';
    const name = this.template?.name || '';
    const description = this.template?.description || '';
    const schemaVersion = this.template?.schema_version || this.documentData?.schema_version || '';

    this.dialog.innerHTML = `
      <div class="template-dialog__header">
        <h3 class="template-dialog__title">${title}</h3>
        <button class="template-dialog__close" aria-label="Закрыть">×</button>
      </div>

      <div class="template-dialog__content">
        <form class="template-dialog__form" id="template-form">
          <div class="template-dialog__field">
            <label for="template-name" class="template-dialog__label">
              Название шаблона <span class="template-dialog__required">*</span>
            </label>
            <input
              type="text"
              id="template-name"
              class="template-dialog__input"
              placeholder="Например: Типовая ПЗ для жилого дома"
              value="${this.escapeHtml(name)}"
              required
            >
          </div>

          <div class="template-dialog__field">
            <label for="template-description" class="template-dialog__label">
              Описание
            </label>
            <textarea
              id="template-description"
              class="template-dialog__textarea"
              placeholder="Краткое описание шаблона (необязательно)"
              rows="3"
            >${this.escapeHtml(description)}</textarea>
          </div>

          <div class="template-dialog__field">
            <label class="template-dialog__label">
              Версия схемы
            </label>
            <div class="template-dialog__version-display">
              ${schemaVersion}
            </div>
          </div>

          ${this.mode === 'create' ? `
            <div class="template-dialog__info">
              <svg class="template-dialog__info-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <span>Шаблон будет создан на основе текущего документа</span>
            </div>
          ` : ''}
        </form>
      </div>

      <div class="template-dialog__footer">
        <button type="button" class="btn btn--secondary template-dialog__btn-cancel">Отмена</button>
        <button type="submit" form="template-form" class="btn btn--primary template-dialog__btn-save">
          ${this.mode === 'create' ? 'Создать шаблон' : 'Сохранить изменения'}
        </button>
      </div>
    `;

    document.body.appendChild(this.overlay);
    document.body.appendChild(this.dialog);
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   * @private
   */
  escapeHtml(text) {
    if (!text) return '';
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
    this.overlay?.addEventListener('click', () => {
      this.onCancel();
      this.hide();
    });

    // Закрытие по кнопке X
    const closeBtn = this.dialog?.querySelector('.template-dialog__close');
    closeBtn?.addEventListener('click', () => {
      this.onCancel();
      this.hide();
    });

    // Кнопка "Отмена"
    const cancelBtn = this.dialog?.querySelector('.template-dialog__btn-cancel');
    cancelBtn?.addEventListener('click', () => {
      this.onCancel();
      this.hide();
    });

    // Обработка формы
    const form = this.dialog?.querySelector('#template-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Фокус на поле названия
    const nameInput = this.dialog?.querySelector('#template-name');
    nameInput?.focus();
    nameInput?.select();

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
   * Handle form submission
   * @private
   */
  async handleSubmit() {
    const nameInput = this.dialog?.querySelector('#template-name');
    const descriptionInput = this.dialog?.querySelector('#template-description');

    const name = nameInput?.value.trim();
    const description = descriptionInput?.value.trim();

    // Валидация
    if (!name) {
      nameInput?.focus();
      this.showFieldError(nameInput, 'Введите название шаблона');
      return;
    }

    try {
      // Показываем загрузку
      const saveBtn = this.dialog?.querySelector('.template-dialog__btn-save');
      const originalText = saveBtn?.textContent;
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Сохранение...';
      }

      let result;

      if (this.mode === 'create') {
        // Создание нового шаблона
        result = await window.electronAPI.saveTemplate({
          name,
          description,
          schema_version: this.documentData.schema_version,
          content: JSON.stringify(this.documentData.content)
        });
      } else {
        // Обновление существующего шаблона
        result = await window.electronAPI.updateTemplate({
          id: this.template.id,
          name,
          description
        });
      }

      if (result.success) {
        this.onSave(result.template || { name, description });
        this.hide();
      } else {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = originalText;
        }
        this.showError('Ошибка сохранения: ' + (result.error || 'Неизвестная ошибка'));
      }

    } catch (error) {
      console.error('Error saving template:', error);
      this.showError('Ошибка при сохранении шаблона');
    }
  }

  /**
   * Show field error
   * @param {HTMLElement} field - Input field
   * @param {string} message - Error message
   * @private
   */
  showFieldError(field, message) {
    field?.classList.add('template-dialog__input--error');

    // Удалить существующее сообщение об ошибке
    const existingError = field?.parentElement?.querySelector('.template-dialog__error');
    existingError?.remove();

    // Добавить новое сообщение
    const errorDiv = document.createElement('div');
    errorDiv.className = 'template-dialog__error';
    errorDiv.textContent = message;
    field?.parentElement?.appendChild(errorDiv);

    // Убрать ошибку при вводе
    field?.addEventListener('input', () => {
      field.classList.remove('template-dialog__input--error');
      errorDiv.remove();
    }, { once: true });
  }

  /**
   * Show general error message
   * @param {string} message - Error message
   * @private
   */
  showError(message) {
    // Показать toast или alert
    if (window.xmlEditorApp && window.xmlEditorApp.showToast) {
      window.xmlEditorApp.showToast(message, 'error');
    } else {
      alert(message);
    }
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
  module.exports = TemplateDialog;
}
