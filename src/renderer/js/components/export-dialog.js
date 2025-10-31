/**
 * @file export-dialog.js
 * @description Export document dialog component (XML/PDF)
 * @module ExportDialog
 */

/**
 * ExportDialog - диалог экспорта документа в XML или PDF
 *
 * @example
 * const dialog = new ExportDialog({
 *   document: { id, title, content, schema_version },
 *   onExport: (format, version) => console.log('Export:', format, version)
 * });
 * dialog.show();
 */
class ExportDialog {
  /**
   * @param {Object} options - Configuration options
   * @param {Object} options.document - Document data to export
   * @param {Function} options.onExport - Callback when export is triggered (format, schemaVersion)
   * @param {Function} options.onCancel - Callback when dialog is cancelled
   */
  constructor(options = {}) {
    this.document = options.document || null;
    this.onExport = options.onExport || (() => {});
    this.onCancel = options.onCancel || (() => {});

    this.dialog = null;
    this.overlay = null;
    this.xmlPreview = '';
    this.validationErrors = [];
    this.selectedFormat = 'xml'; // 'xml' or 'pdf'
    this.selectedVersion = this.document?.schema_version || '01.05';

    // XMLGenerator instance for preview
    this.xmlGenerator = new XMLGenerator();
  }

  /**
   * Show export dialog
   */
  async show() {
    // Generate XML preview
    await this.generatePreview();

    this.render();
    this.attachEvents();

    // Анимация появления
    setTimeout(() => {
      this.overlay?.classList.add('export-dialog__overlay--visible');
      this.dialog?.classList.add('export-dialog--visible');
    }, 10);
  }

  /**
   * Hide and remove export dialog
   */
  hide() {
    this.dialog?.classList.remove('export-dialog--visible');
    this.overlay?.classList.remove('export-dialog__overlay--visible');

    setTimeout(() => {
      this.cleanup();
    }, 300);
  }

  /**
   * Generate XML preview
   * @private
   */
  async generatePreview() {
    try {
      console.log('📋 Generating XML preview for export dialog...');

      if (!this.document || !this.document.content) {
        throw new Error('No document content to export');
      }

      // Parse content if it's a string
      const content = typeof this.document.content === 'string'
        ? JSON.parse(this.document.content)
        : this.document.content;

      // Generate XML
      this.xmlPreview = await this.xmlGenerator.generateXML(content, this.selectedVersion);

      console.log(`✅ XML preview generated (${this.xmlPreview.length} characters)`);

      // Validate (basic check)
      this.validationErrors = this.validateXML(this.xmlPreview);

    } catch (error) {
      console.error('❌ XML preview generation failed:', error);
      this.xmlPreview = `<!-- Error generating XML preview: ${error.message} -->`;
      this.validationErrors = [{ message: error.message, type: 'error' }];
    }
  }

  /**
   * Validate XML (basic validation)
   * @private
   * @param {string} xml - XML string
   * @returns {Array} Array of validation errors
   */
  validateXML(xml) {
    const errors = [];

    // Basic checks
    if (!xml || xml.trim() === '') {
      errors.push({ message: 'XML is empty', type: 'error' });
      return errors;
    }

    if (!xml.includes('<?xml version="1.0" encoding="UTF-8"?>')) {
      errors.push({ message: 'Missing XML declaration', type: 'warning' });
    }

    if (!xml.includes('<ExplanatoryNote')) {
      errors.push({ message: 'Missing root element ExplanatoryNote', type: 'error' });
    }

    // Check for balanced tags (basic)
    const openTags = (xml.match(/<[^/][^>]*>/g) || []).length;
    const closeTags = (xml.match(/<\/[^>]*>/g) || []).length;
    const selfClosing = (xml.match(/<[^>]*\/>/g) || []).length;

    if (openTags - selfClosing !== closeTags) {
      errors.push({ message: 'Possible tag mismatch detected', type: 'warning' });
    }

    return errors;
  }

  /**
   * Render export dialog HTML
   * @private
   */
  render() {
    // Создаем overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'export-dialog__overlay';

    // Создаем dialog
    this.dialog = document.createElement('div');
    this.dialog.className = 'export-dialog';

    const hasErrors = this.validationErrors.filter(e => e.type === 'error').length > 0;
    const hasWarnings = this.validationErrors.filter(e => e.type === 'warning').length > 0;

    this.dialog.innerHTML = `
      <div class="export-dialog__header">
        <h2 class="export-dialog__title">Экспорт документа</h2>
        <button class="export-dialog__close" aria-label="Close dialog">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div class="export-dialog__body">
        <!-- Document Info -->
        <div class="export-dialog__section">
          <div class="export-dialog__doc-info">
            <span class="export-dialog__doc-title">${this.escapeHTML(this.document?.title || 'Без названия')}</span>
            <span class="export-dialog__doc-meta">Схема: ${this.selectedVersion}</span>
          </div>
        </div>

        <!-- Format Selection -->
        <div class="export-dialog__section">
          <label class="export-dialog__label">Формат экспорта</label>
          <div class="export-dialog__radio-group">
            <label class="export-dialog__radio">
              <input type="radio" name="export-format" value="xml" ${this.selectedFormat === 'xml' ? 'checked' : ''}>
              <span class="export-dialog__radio-label">
                <svg class="export-dialog__radio-icon" width="20" height="20" viewBox="0 0 20 20">
                  <path d="M4 4h12v12H4z" fill="none" stroke="currentColor" stroke-width="2"/>
                  <path d="M7 7l3 3-3 3M10 13h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                XML
              </span>
              <span class="export-dialog__radio-description">Экспорт в формате XML для загрузки в системы Минстроя</span>
            </label>
            <label class="export-dialog__radio">
              <input type="radio" name="export-format" value="pdf" ${this.selectedFormat === 'pdf' ? 'checked' : ''}>
              <span class="export-dialog__radio-label">
                <svg class="export-dialog__radio-icon" width="20" height="20" viewBox="0 0 20 20">
                  <path d="M4 4h12v12H4z" fill="none" stroke="currentColor" stroke-width="2"/>
                  <path d="M7 10h6M7 13h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                PDF
              </span>
              <span class="export-dialog__radio-description">Экспорт в PDF для печати и отправки</span>
            </label>
          </div>
        </div>

        <!-- Schema Version Selection -->
        <div class="export-dialog__section">
          <label class="export-dialog__label" for="export-schema-version">Версия схемы</label>
          <select
            id="export-schema-version"
            class="export-dialog__select"
            ${this.selectedFormat === 'pdf' ? 'disabled' : ''}
          >
            <option value="01.03" ${this.selectedVersion === '01.03' ? 'selected' : ''}>
              01.03 (deprecated с 01.08.2023)
            </option>
            <option value="01.04" ${this.selectedVersion === '01.04' ? 'selected' : ''}>
              01.04 (переходная версия, до 01.03.2025)
            </option>
            <option value="01.05" ${this.selectedVersion === '01.05' ? 'selected' : ''}>
              01.05 (актуальная с 29.03.2025) — рекомендуется
            </option>
          </select>
          <span class="export-dialog__hint">
            ${this.selectedFormat === 'pdf' ? 'Для PDF используется текущая версия схемы документа' : 'Выберите версию схемы для экспорта XML'}
          </span>
        </div>

        <!-- Validation Results -->
        ${this.validationErrors.length > 0 ? `
          <div class="export-dialog__section">
            <div class="export-dialog__validation ${hasErrors ? 'export-dialog__validation--error' : 'export-dialog__validation--warning'}">
              <div class="export-dialog__validation-header">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  ${hasErrors
                    ? '<path d="M10 6v5m0 3v.01M10 18a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
                    : '<path d="M10 6v5m0 3v.01M10 18a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
                  }
                </svg>
                <span>${hasErrors ? 'Обнаружены ошибки' : 'Предупреждения'}</span>
              </div>
              <ul class="export-dialog__validation-list">
                ${this.validationErrors.map(err => `
                  <li class="export-dialog__validation-item export-dialog__validation-item--${err.type}">
                    ${this.escapeHTML(err.message)}
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>
        ` : ''}

        <!-- XML Preview -->
        <div class="export-dialog__section">
          <label class="export-dialog__label">Предпросмотр XML</label>
          <textarea
            class="export-dialog__preview"
            readonly
            rows="12"
          >${this.escapeHTML(this.xmlPreview)}</textarea>
          <span class="export-dialog__hint">
            Размер: ${(this.xmlPreview.length / 1024).toFixed(1)} КБ
          </span>
        </div>
      </div>

      <div class="export-dialog__footer">
        <button class="export-dialog__button export-dialog__button--secondary" data-action="cancel">
          Отмена
        </button>
        <button
          class="export-dialog__button export-dialog__button--primary"
          data-action="export"
          ${hasErrors ? 'disabled' : ''}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 11V3M8 11l3-3M8 11L5 8M2 13h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Экспортировать
        </button>
      </div>
    `;

    document.body.appendChild(this.overlay);
    document.body.appendChild(this.dialog);

    // Disable body scroll
    document.body.style.overflow = 'hidden';
  }

  /**
   * Attach event listeners
   * @private
   */
  attachEvents() {
    // Close button
    const closeBtn = this.dialog.querySelector('.export-dialog__close');
    closeBtn?.addEventListener('click', () => this.handleCancel());

    // Overlay click (close)
    this.overlay?.addEventListener('click', () => this.handleCancel());

    // Dialog click (prevent close)
    this.dialog?.addEventListener('click', (e) => e.stopPropagation());

    // Format change
    const formatRadios = this.dialog.querySelectorAll('input[name="export-format"]');
    formatRadios.forEach(radio => {
      radio.addEventListener('change', (e) => this.handleFormatChange(e.target.value));
    });

    // Version change
    const versionSelect = this.dialog.querySelector('#export-schema-version');
    versionSelect?.addEventListener('change', (e) => this.handleVersionChange(e.target.value));

    // Cancel button
    const cancelBtn = this.dialog.querySelector('[data-action="cancel"]');
    cancelBtn?.addEventListener('click', () => this.handleCancel());

    // Export button
    const exportBtn = this.dialog.querySelector('[data-action="export"]');
    exportBtn?.addEventListener('click', () => this.handleExport());

    // Escape key
    this.handleEscape = (e) => {
      if (e.key === 'Escape') {
        this.handleCancel();
      }
    };
    document.addEventListener('keydown', this.handleEscape);
  }

  /**
   * Handle format change
   * @private
   */
  async handleFormatChange(format) {
    this.selectedFormat = format;
    console.log('📋 Format changed to:', format);

    // Disable version select for PDF
    const versionSelect = this.dialog.querySelector('#export-schema-version');
    if (versionSelect) {
      versionSelect.disabled = (format === 'pdf');
    }

    // Update hint
    const hint = this.dialog.querySelector('.export-dialog__hint');
    if (hint) {
      hint.textContent = format === 'pdf'
        ? 'Для PDF используется текущая версия схемы документа'
        : 'Выберите версию схемы для экспорта XML';
    }
  }

  /**
   * Handle version change
   * @private
   */
  async handleVersionChange(version) {
    console.log('📋 Version changed to:', version);
    this.selectedVersion = version;

    // Regenerate preview with new version
    await this.generatePreview();

    // Update preview textarea
    const previewTextarea = this.dialog.querySelector('.export-dialog__preview');
    if (previewTextarea) {
      previewTextarea.value = this.xmlPreview;
    }

    // Update size hint
    const sizeHint = this.dialog.querySelector('.export-dialog__hint:last-of-type');
    if (sizeHint) {
      sizeHint.textContent = `Размер: ${(this.xmlPreview.length / 1024).toFixed(1)} КБ`;
    }

    // Update validation
    const validationSection = this.dialog.querySelector('.export-dialog__validation');
    if (validationSection) {
      validationSection.remove();
    }

    if (this.validationErrors.length > 0) {
      const hasErrors = this.validationErrors.filter(e => e.type === 'error').length > 0;
      const bodyEl = this.dialog.querySelector('.export-dialog__body');
      const validationHTML = `
        <div class="export-dialog__section">
          <div class="export-dialog__validation ${hasErrors ? 'export-dialog__validation--error' : 'export-dialog__validation--warning'}">
            <div class="export-dialog__validation-header">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 6v5m0 3v.01M10 18a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span>${hasErrors ? 'Обнаружены ошибки' : 'Предупреждения'}</span>
            </div>
            <ul class="export-dialog__validation-list">
              ${this.validationErrors.map(err => `
                <li class="export-dialog__validation-item export-dialog__validation-item--${err.type}">
                  ${this.escapeHTML(err.message)}
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      `;

      const previewSection = bodyEl.querySelector('.export-dialog__section:last-child');
      previewSection?.insertAdjacentHTML('beforebegin', validationHTML);
    }

    // Update export button state
    const exportBtn = this.dialog.querySelector('[data-action="export"]');
    const hasErrors = this.validationErrors.filter(e => e.type === 'error').length > 0;
    if (exportBtn) {
      exportBtn.disabled = hasErrors;
    }
  }

  /**
   * Handle cancel
   * @private
   */
  handleCancel() {
    this.hide();
    this.onCancel();
  }

  /**
   * Handle export
   * @private
   */
  handleExport() {
    console.log('📤 Export triggered:', this.selectedFormat, this.selectedVersion);

    this.hide();

    // Call export callback
    this.onExport(this.selectedFormat, this.selectedVersion, this.xmlPreview);
  }

  /**
   * Cleanup dialog
   * @private
   */
  cleanup() {
    // Remove event listeners
    document.removeEventListener('keydown', this.handleEscape);

    // Remove elements
    this.overlay?.remove();
    this.dialog?.remove();

    // Restore body scroll
    document.body.style.overflow = '';

    console.log('🧹 Export dialog cleaned up');
  }

  /**
   * Escape HTML special characters
   * @private
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHTML(text) {
    if (!text || typeof text !== 'string') return '';

    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Make ExportDialog available globally
if (typeof window !== 'undefined') {
  window.ExportDialog = ExportDialog;
}
