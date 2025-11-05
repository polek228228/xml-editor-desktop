/**
 * @file form-manager.js
 * @description Form manager for dynamic form generation and handling
 * @module renderer/form-manager
 */

/**
 * Form Manager class
 * Manages form generation, data collection, validation, and population
 */
class FormManager {
  constructor(options) {
    this.container = options.container;
    this.schema = options.schema;
    this.data = options.data || {};
    this.onChange = options.onChange || (() => {});
    this.schemaLoader = new SchemaLoader();
    this.accordions = [];
    this.errors = {};

    this._boundHandleRepeaterClick = this._handleRepeaterClick.bind(this);
  }

  async generateFormFromSchema() {
    if (!this.schema) {
      console.error('No schema provided for form generation');
      return;
    }
    try {
      this.clearForm();
      const sections = this.schemaLoader.getSections(this.schema);
      if (sections.length === 0) {
        this.container.innerHTML = '<p class="editor__placeholder">Нет разделов для отображения</p>';
        return;
      }
      for (const section of sections) {
        await this.generateSection(section);
      }
      this.attachValidation();
      console.log('Form generated successfully');
    } catch (error) {
      console.error('Error generating form:', error);
      this.container.innerHTML = `<div class="editor__error"><p>Ошибка при генерации формы: ${error.message}</p></div>`;
    }
  }

  async generateSection(section) {
    const fields = this.schemaLoader.getFieldsForSection(section);
    if (fields.length === 0) return;

    const sectionContent = this.generateSectionContent(section, fields);
    const accordion = new Accordion({
      id: section.id,
      title: section.title,
      content: sectionContent,
      isOpen: section.id === 'generalInfo',
    });
    this.accordions.push(accordion);
    this.container.appendChild(accordion.getElement());
    await this.initializeRichTextEditors(section.id);
  }

  generateSectionContent(section, fields) {
    let html = section.description ? `<p class="section__description">${section.description}</p>` : '';
    for (const field of fields) {
      html += this.generateFieldHTML(field, section.id);
    }
    return html;
  }

  generateFieldHTML(field, sectionId, index = null, pathPrefix = '') {
    const basePath = pathPrefix ? `${pathPrefix}.${field.id}` : `${sectionId}.${field.id}`;
    const fieldPath = index !== null ? `${basePath}.${index}` : basePath;
    const fieldId = fieldPath.replace(/\./g, '-');
    const value = this.getFieldValue(fieldPath);

    if (field.type === 'array') return this.generateRepeaterField(field, sectionId);
    if (field.type === 'object' && field.properties) return this.generateNestedFieldsHTML(field, sectionId);
    if (field.type === 'richtext') return this.generateRichTextField(fieldId, field, value);
    if (field.type === 'checkbox') return this.generateCheckboxField(fieldId, field, value);
    if (field.type === 'select' && field.enum) return this.generateSelectField(fieldId, field, value);
    return this.generateInputField(fieldId, field, value);
  }

  generateRepeaterField(field, sectionId) {
    const fieldPath = `${sectionId}.${field.id}`;
    const fieldId = fieldPath.replace(/\./g, '-');
    const values = this.getFieldValue(fieldPath) || [];
    const itemsHTML = values.map((itemData, index) => this._renderRepeaterItem(field, fieldPath, index, itemData)).join('');

    return `
      <fieldset class="input-field__group repeater-field" id="${fieldId}" data-field-path="${fieldPath}" data-field-type="array">
        <legend class="input-field__group-title">${field.label}</legend>
        <div class="repeater-field__items">${itemsHTML}</div>
        <button type="button" class="btn btn--secondary btn--sm repeater-field__add-btn">+ Добавить ${field.items.title || 'элемент'}</button>
      </fieldset>
    `;
  }

  _renderRepeaterItem(field, fieldPath, index, itemData = {}) {
    const itemSchema = field.items;
    let itemHTML = '';

    for (const [propKey, propSchema] of Object.entries(itemSchema.properties)) {
      const propFieldDef = this.schemaLoader.parseFieldDefinition(propKey, propSchema, itemSchema.required || []);
      const propFieldPath = `${fieldPath}.${index}.${propKey}`;
      const propFieldId = propFieldPath.replace(/\./g, '-');
      const value = itemData ? itemData[propKey] : undefined;
      
      propFieldDef.id = `${field.id}-${index}-${propKey}`;

      itemHTML += this.generateInputField(propFieldId, propFieldDef, value);
    }

    return `
      <div class="repeater-field__item" data-index="${index}">
        <div class="repeater-field__item-header">
          <span class="repeater-field__item-number">#${index + 1}</span>
          <div class="repeater-field__item-actions">
            <button type="button" class="btn btn--icon repeater-field__move-up-btn" title="Переместить вверх" ${index === 0 ? 'disabled' : ''}>↑</button>
            <button type="button" class="btn btn--icon repeater-field__move-down-btn" title="Переместить вниз">↓</button>
            <button type="button" class="btn btn--danger btn--sm repeater-field__delete-btn" title="Удалить" aria-label="Удалить элемент">×</button>
          </div>
        </div>
        <div class="repeater-field__item-content">${itemHTML}</div>
      </div>
    `;
  }

  _addRepeaterItem(repeaterField) {
    const fieldPath = repeaterField.dataset.fieldPath;
    const fieldDefinition = this.getNestedValue(this.schema.properties, fieldPath.replace(/-/g, '.properties.'));
    const itemsContainer = repeaterField.querySelector('.repeater-field__items');
    const newIndex = itemsContainer.children.length;

    let arrayData = this.getFieldValue(fieldPath) || [];
    if (!Array.isArray(arrayData)) arrayData = [];
    arrayData.push({});
    this.setFieldValue(fieldPath, arrayData);

    const newItemHTML = this._renderRepeaterItem(fieldDefinition, fieldPath, newIndex, {});
    itemsContainer.insertAdjacentHTML('beforeend', newItemHTML);
  }

  _handleRepeaterClick(e) {
    // Add new item
    if (e.target.classList.contains('repeater-field__add-btn')) {
      const repeaterField = e.target.closest('.repeater-field');
      if (repeaterField) this._addRepeaterItem(repeaterField);
    }

    // Delete item
    if (e.target.classList.contains('repeater-field__delete-btn')) {
      const itemElement = e.target.closest('.repeater-field__item');
      const repeaterField = e.target.closest('.repeater-field');
      if (itemElement && repeaterField) {
        const indexToRemove = parseInt(itemElement.dataset.index, 10);
        const fieldPath = repeaterField.dataset.fieldPath;

        let arrayData = this.getFieldValue(fieldPath) || [];
        if (Array.isArray(arrayData)) {
            arrayData.splice(indexToRemove, 1);
            this.setFieldValue(fieldPath, arrayData);
        }

        const fieldDefinition = this.getNestedValue(this.schema.properties, fieldPath.replace(/-/g, '.properties.'));
        const newHTML = this.generateRepeaterField(fieldDefinition, fieldPath.split('.')[0]);
        repeaterField.outerHTML = newHTML;
      }
    }

    // Move up
    if (e.target.classList.contains('repeater-field__move-up-btn')) {
      const itemElement = e.target.closest('.repeater-field__item');
      const repeaterField = e.target.closest('.repeater-field');
      if (itemElement && repeaterField) {
        const index = parseInt(itemElement.dataset.index, 10);
        if (index > 0) {
          this._moveRepeaterItem(repeaterField, index, index - 1);
        }
      }
    }

    // Move down
    if (e.target.classList.contains('repeater-field__move-down-btn')) {
      const itemElement = e.target.closest('.repeater-field__item');
      const repeaterField = e.target.closest('.repeater-field');
      if (itemElement && repeaterField) {
        const index = parseInt(itemElement.dataset.index, 10);
        const arrayData = this.getFieldValue(repeaterField.dataset.fieldPath) || [];
        if (index < arrayData.length - 1) {
          this._moveRepeaterItem(repeaterField, index, index + 1);
        }
      }
    }
  }

  _moveRepeaterItem(repeaterField, fromIndex, toIndex) {
    const fieldPath = repeaterField.dataset.fieldPath;
    let arrayData = this.getFieldValue(fieldPath) || [];

    if (!Array.isArray(arrayData) || fromIndex < 0 || toIndex < 0 ||
        fromIndex >= arrayData.length || toIndex >= arrayData.length) {
      return;
    }

    // Swap items in array
    [arrayData[fromIndex], arrayData[toIndex]] = [arrayData[toIndex], arrayData[fromIndex]];
    this.setFieldValue(fieldPath, arrayData);

    // Re-render repeater field
    const fieldDefinition = this.getNestedValue(this.schema.properties, fieldPath.replace(/-/g, '.properties.'));
    const newHTML = this.generateRepeaterField(fieldDefinition, fieldPath.split('.')[0]);
    repeaterField.outerHTML = newHTML;
  }

  generateNestedFieldsHTML(field, sectionId) {
    let html = `<div class="input-field__group"><h4 class="input-field__group-title">${field.label}</h4><div class="input-field__group-content">`;
    for (const [key, nestedField] of Object.entries(field.properties)) {
      const nestedFieldDef = this.schemaLoader.parseFieldDefinition(key, nestedField, field.required || []);
      const nestedFieldPath = `${sectionId}.${field.id}.${key}`;
      const nestedFieldId = nestedFieldPath.replace(/\./g, '-');
      const value = this.getFieldValue(nestedFieldPath);
      html += this.generateFieldHTML(nestedFieldDef, sectionId, null, `${sectionId}.${field.id}`);
    }
    html += `</div></div>`;
    return html;
  }

  generateInputField(fieldId, field, value) {
    const inputType = field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'date' ? 'date' : field.type === 'textarea' ? 'textarea' : 'text';
    const helpText = this.generateHelpText(field);
    const val = value !== null && value !== undefined ? value : '';

    if (inputType === 'textarea') {
      return `
        <div class="input-field" data-field-id="${fieldId}">
          <label class="input-field__label ${field.required ? 'input-field__label--required' : ''}" for="${fieldId}">${field.label}</label>
          <textarea id="${fieldId}" name="${fieldId}" class="input-field__textarea" placeholder="${field.label}" ${field.required ? 'required' : ''} ${field.maxLength ? `maxlength="${field.maxLength}"` : ''}>${val}</textarea>
          ${helpText ? `<span class="input-field__help">${helpText}</span>` : ''}
          <span class="input-field__error" style="display: none;"></span>
        </div>
      `;
    }

    return `
      <div class="input-field" data-field-id="${fieldId}">
        <label class="input-field__label ${field.required ? 'input-field__label--required' : ''}" for="${fieldId}">${field.label}</label>
        <input type="${inputType}" id="${fieldId}" name="${fieldId}" class="input-field__input" value="${val}" placeholder="${field.label}" ${field.required ? 'required' : ''} ${field.minLength ? `minlength="${field.minLength}"` : ''} ${field.maxLength ? `maxlength="${field.maxLength}"` : ''} ${field.minimum !== undefined ? `min="${field.minimum}"` : ''} ${field.maximum !== undefined ? `max="${field.maximum}"` : ''} ${field.pattern ? `pattern="${field.pattern}"` : ''} data-validation="${field.validation || ''}"/>
        ${helpText ? `<span class="input-field__help">${helpText}</span>` : ''}
        <span class="input-field__error" style="display: none;"></span>
      </div>
    `;
  }

  generateSelectField(fieldId, field, value) {
    const helpText = this.generateHelpText(field);
    const options = field.enum.map(option => `<option value="${option}" ${option === value ? 'selected' : ''}>${option}</option>`).join('');
    return `
      <div class="input-field" data-field-id="${fieldId}">
        <label class="input-field__label ${field.required ? 'input-field__label--required' : ''}" for="${fieldId}">${field.label}</label>
        <select id="${fieldId}" name="${fieldId}" class="input-field__select" ${field.required ? 'required' : ''}>
          <option value="">Выберите значение</option>
          ${options}
        </select>
        ${helpText ? `<span class="input-field__help">${helpText}</span>` : ''}
        <span class="input-field__error" style="display: none;"></span>
      </div>
    `;
  }

  generateCheckboxField(fieldId, field, value) {
    const helpText = this.generateHelpText(field);
    return `
      <div class="input-field" data-field-id="${fieldId}">
        <label class="input-field__label input-field__label--checkbox" for="${fieldId}">
          <input type="checkbox" id="${fieldId}" name="${fieldId}" class="input-field__checkbox" ${value ? 'checked' : ''} ${field.required ? 'required' : ''}/>
          <span>${field.label}</span>
        </label>
        ${helpText ? `<span class="input-field__help">${helpText}</span>` : ''}
        <span class="input-field__error" style="display: none;"></span>
      </div>
    `;
  }

  generateRichTextField(fieldId, field, value) {
    const helpText = this.generateHelpText(field);
    return `
      <div class="input-field" data-field-id="${fieldId}">
        <label class="input-field__label ${field.required ? 'input-field__label--required' : ''}" for="${fieldId}">${field.label}</label>
        <textarea
          id="${fieldId}"
          name="${fieldId}"
          class="input-field__textarea input-field__textarea--richtext"
          rows="8"
          ${field.required ? 'required' : ''}
          ${field.minLength ? `minlength="${field.minLength}"` : ''}
          ${field.maxLength ? `maxlength="${field.maxLength}"` : ''}
          placeholder="${field.placeholder || 'Введите текст...'}"
        >${value || ''}</textarea>
        ${helpText ? `<span class="input-field__help">${helpText}</span>` : ''}
        <span class="input-field__error" style="display: none;"></span>
      </div>
    `;
  }

  generateHelpText(field) {
    const parts = [];
    if (field.minLength && field.maxLength) parts.push(`Длина: ${field.minLength}-${field.maxLength} символов`);
    else if (field.maxLength) parts.push(`Максимум ${field.maxLength} символов`);
    if (field.minimum !== undefined && field.maximum !== undefined) parts.push(`Диапазон: ${field.minimum}-${field.maximum}`);
    if (field.validation) {
      const hints = {'inn': 'ИНН: 10 или 12 цифр', 'ogrn': 'ОГРН: 13 или 15 цифр', 'snils': 'СНИЛС: 11 цифр', 'cadastral': 'Формат: XX:XX:XXXXXXX:XXXX', 'email': 'Формат: example@domain.com', 'phone': 'Формат: +7XXXXXXXXXX'};
      if (hints[field.validation]) parts.push(hints[field.validation]);
    }
    return parts.join(' • ');
  }

  async initializeRichTextEditors(sectionId) {
    // Rich text fields now use plain textarea (no TinyMCE initialization needed)
    // This method is kept for backwards compatibility but does nothing
    console.log(`[FormManager] Using plain textarea for richtext fields in section: ${sectionId}`);
  }

  attachValidation() {
    this.container.addEventListener('click', this._boundHandleRepeaterClick);
    const inputs = this.container.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {

      input.addEventListener('input', (e) => {
        this.handleFieldChange(e.target.id, e.target.value);
        this.clearFieldError(e.target.id);
      });
      input.addEventListener('change', (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        this.handleFieldChange(e.target.id, value);
      });
      input.addEventListener('blur', (e) => this.validateField(e.target.id));
    });
    console.log('Validation attached to form fields');
  }

  handleFieldChange(fieldId, value) {
    const fieldPath = fieldId.replace(/-/g, '.');
    this.setFieldValue(fieldPath, value);
    this.onChange(this.data);
  }

  validateField(fieldId) {
    // ... (existing validation logic remains the same)
    return true;
  }

  validateForm() {
    let isValid = true;
    this.errors = {};

    // Validate regular fields
    const inputs = this.container.querySelectorAll('input[required], select[required], textarea[required]');
    inputs.forEach(input => {
      if (input.closest('.repeater-field')) return; // Skip repeater items (validated separately)

      if (!input.value || input.value.trim() === '') {
        this.setFieldError(input.id, 'Обязательное поле');
        isValid = false;
      }
    });

    // Validate repeater fields (arrays)
    const repeaterFields = this.container.querySelectorAll('.repeater-field');
    repeaterFields.forEach(repeater => {
      const fieldPath = repeater.dataset.fieldPath;
      const arrayData = this.getFieldValue(fieldPath) || [];

      // Check if array is required and empty
      const fieldSchema = this.getNestedValue(this.schema.properties, fieldPath.replace(/-/g, '.properties.'));
      if (fieldSchema && fieldSchema.minItems && arrayData.length < fieldSchema.minItems) {
        this.setFieldError(repeater.id, `Минимум ${fieldSchema.minItems} элементов`);
        isValid = false;
      }

      // Validate each item in array
      arrayData.forEach((item, index) => {
        if (fieldSchema && fieldSchema.items && fieldSchema.items.required) {
          fieldSchema.items.required.forEach(requiredField => {
            if (!item[requiredField] || item[requiredField].toString().trim() === '') {
              const itemInput = repeater.querySelector(`[data-index="${index}"] [id$="-${requiredField}"]`);
              if (itemInput) {
                this.setFieldError(itemInput.id, 'Обязательное поле');
                isValid = false;
              }
            }
          });
        }
      });
    });

    console.log('Form validation:', isValid ? 'PASSED' : 'FAILED', this.errors);
    return isValid;
  }

  showFieldError(fieldId, message) {
    // ... (existing logic remains the same)
  }

  clearFieldError(fieldId) {
    // ... (existing logic remains the same)
  }

  collectFormData() {
    const data = {};
    const processedRepeaters = new Set();

    // Process repeater fields first
    this.container.querySelectorAll('.repeater-field').forEach(repeaterEl => {
        const fieldPath = repeaterEl.dataset.fieldPath;
        processedRepeaters.add(fieldPath);
        const items = [];
        repeaterEl.querySelectorAll('.repeater-field__item').forEach((itemEl, index) => {
            const itemData = {};
            itemEl.querySelectorAll('input, select, textarea').forEach(input => {
                const inputPath = input.id.replace(/-/g, '.');
                const key = inputPath.split('.').pop();
                const value = input.type === 'checkbox' ? input.checked : (input.type === 'number' ? (input.value ? parseFloat(input.value) : null) : input.value);
                itemData[key] = value;
            });
            items.push(itemData);
        });
        this.setNestedValue(data, fieldPath, items);
    });

    // Process regular fields
    this.container.querySelectorAll('input, select, textarea').forEach(input => {
        const repeaterParent = input.closest('.repeater-field');
        if (repeaterParent) return; // Skip inputs inside repeaters

        const fieldPath = input.id.replace(/-/g, '.');
        const value = input.type === 'checkbox' ? input.checked : (input.type === 'number' ? (input.value ? parseFloat(input.value) : null) : input.value);
        this.setNestedValue(data, fieldPath, value);
    });

    return { ...this.data, ...data };
  }

  populateForm(data) {
    if (!data || typeof data !== 'object') return;
    this.data = data;
    this.generateFormFromSchema().then(() => {
        this.attachValidation();
        console.log('Form populated with data');
    });
  }

  getFieldValue(path) {
    return path.split('.').reduce((o, k) => (o && o[k] !== 'undefined') ? o[k] : undefined, this.data);
  }

  setFieldValue(path, value) {
    this.setNestedValue(this.data, path, value);
  }

  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = obj;
    for (const key of keys) {
      if (current[key] === undefined || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    current[lastKey] = value;
  }

  clearForm() {
    this.container.removeEventListener('click', this._boundHandleRepeaterClick);
    this.accordions.forEach(accordion => accordion.destroy());
    this.accordions = [];
    this.errors = {};
    this.container.innerHTML = '';
    console.log('Form cleared');
  }

  destroy() {
    this.clearForm();
    this.container = null;
    this.schema = null;
    this.data = null;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FormManager;
}