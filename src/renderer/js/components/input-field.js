/**
 * @file input-field.js
 * @description Input field component for forms
 * @module components/input-field
 */

/**
 * Input field component class
 * Creates form input fields with validation support
 */
class InputField {
  /**
   * @param {Object} options - Input field options
   * @param {string} options.id - Unique field ID
   * @param {string} options.name - Field name
   * @param {string} options.label - Field label
   * @param {string} options.type - Input type (text, number, email, date, textarea, select)
   * @param {string} options.value - Initial value
   * @param {string} options.placeholder - Placeholder text
   * @param {boolean} options.required - Is field required
   * @param {string} options.helpText - Help text
   * @param {Array} options.options - Options for select type
   * @param {Function} options.onChange - Change event handler
   * @param {Function} options.onValidate - Custom validation function
   */
  constructor(options) {
    this.id = options.id;
    this.name = options.name;
    this.label = options.label;
    this.type = options.type || 'text';
    this.value = options.value || '';
    this.placeholder = options.placeholder || '';
    this.required = options.required || false;
    this.helpText = options.helpText || '';
    this.options = options.options || [];
    this.onChange = options.onChange || (() => {});
    this.onValidate = options.onValidate || null;

    this.element = null;
    this.inputElement = null;
    this.errorElement = null;
    this.errors = [];

    this.render();
  }

  /**
   * Render input field HTML
   * @private
   */
  render() {
    const fieldHTML = `
      <div class="input-field" data-field-id="${this.id}">
        <label class="input-field__label ${this.required ? 'input-field__label--required' : ''}" for="${this.id}">
          ${this.label}
        </label>
        ${this.renderInput()}
        ${this.helpText ? `<span class="input-field__help">${this.helpText}</span>` : ''}
        <span class="input-field__error" style="display: none;"></span>
      </div>
    `;

    const template = document.createElement('div');
    template.innerHTML = fieldHTML.trim();
    this.element = template.firstChild;

    this.inputElement = this.element.querySelector(`#${this.id}`);
    this.errorElement = this.element.querySelector('.input-field__error');

    this.setupEventListeners();
  }

  /**
   * Render input element based on type
   * @private
   * @returns {string} HTML for input element
   */
  renderInput() {
    switch (this.type) {
      case 'textarea':
        return `
          <textarea
            id="${this.id}"
            name="${this.name}"
            class="input-field__textarea"
            placeholder="${this.placeholder}"
            ${this.required ? 'required' : ''}
          >${this.value}</textarea>
        `;

      case 'select':
        return `
          <select
            id="${this.id}"
            name="${this.name}"
            class="input-field__select"
            ${this.required ? 'required' : ''}
          >
            <option value="">Выберите значение</option>
            ${this.options.map(opt => `
              <option value="${opt.value}" ${opt.value === this.value ? 'selected' : ''}>
                ${opt.label}
              </option>
            `).join('')}
          </select>
        `;

      case 'date':
      case 'email':
      case 'number':
      case 'text':
      default:
        return `
          <input
            type="${this.type}"
            id="${this.id}"
            name="${this.name}"
            class="input-field__input"
            value="${this.value}"
            placeholder="${this.placeholder}"
            ${this.required ? 'required' : ''}
          />
        `;
    }
  }

  /**
   * Setup event listeners
   * @private
   */
  setupEventListeners() {
    // Input change event
    this.inputElement.addEventListener('input', (e) => {
      this.value = e.target.value;
      this.clearError();
      this.onChange(this.name, this.value);
    });

    // Blur event for validation
    this.inputElement.addEventListener('blur', () => {
      this.validate();
    });
  }

  /**
   * Validate field value
   * @returns {boolean} - True if valid, false otherwise
   */
  validate() {
    this.errors = [];

    // Required validation
    if (this.required && !this.value.trim()) {
      this.errors.push('Это поле обязательно для заполнения');
    }

    // Email validation
    if (this.type === 'email' && this.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.value)) {
        this.errors.push('Введите корректный email адрес');
      }
    }

    // Number validation
    if (this.type === 'number' && this.value.trim()) {
      if (isNaN(this.value)) {
        this.errors.push('Введите корректное число');
      }
    }

    // Custom validation
    if (this.onValidate) {
      const customError = this.onValidate(this.value);
      if (customError) {
        this.errors.push(customError);
      }
    }

    if (this.errors.length > 0) {
      this.showError(this.errors[0]);
      return false;
    }

    this.clearError();
    return true;
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    this.element.classList.add('input-field--error');
    this.errorElement.textContent = message;
    this.errorElement.style.display = 'block';
  }

  /**
   * Clear error message
   */
  clearError() {
    this.element.classList.remove('input-field--error');
    this.errorElement.textContent = '';
    this.errorElement.style.display = 'none';
    this.errors = [];
  }

  /**
   * Get field value
   * @returns {string}
   */
  getValue() {
    return this.value;
  }

  /**
   * Set field value
   * @param {string} value - New value
   */
  setValue(value) {
    this.value = value;
    if (this.inputElement) {
      this.inputElement.value = value;
    }
  }

  /**
   * Disable field
   */
  disable() {
    if (this.inputElement) {
      this.inputElement.disabled = true;
    }
  }

  /**
   * Enable field
   */
  enable() {
    if (this.inputElement) {
      this.inputElement.disabled = false;
    }
  }

  /**
   * Get field DOM element
   * @returns {HTMLElement}
   */
  getElement() {
    return this.element;
  }

  /**
   * Destroy field and remove event listeners
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
    this.inputElement = null;
    this.errorElement = null;
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InputField;
}
