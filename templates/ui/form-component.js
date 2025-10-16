/**
 * UI Component Template - Form Component
 *
 * Шаблон для создания переиспользуемых UI-компонентов формы
 * Используется CODE-GENERATOR агентом для быстрой генерации компонентов
 *
 * @example
 * const textInput = new TextInputComponent({
 *   name: 'objectName',
 *   label: 'Наименование объекта',
 *   required: true
 * });
 */

class {{ComponentName}} {
    /**
     * @param {Object} options - Опции компонента
     * @param {string} options.name - Имя поля (для формы)
     * @param {string} options.label - Текст метки
     * @param {boolean} [options.required=false] - Обязательное поле
     * @param {string} [options.placeholder=''] - Placeholder
     * @param {string} [options.value=''] - Начальное значение
     * @param {Function} [options.validator] - Функция валидации
     * @param {Function} [options.onChange] - Callback при изменении
     */
    constructor(options) {
        this.name = options.name;
        this.label = options.label;
        this.required = options.required || false;
        this.placeholder = options.placeholder || '';
        this.value = options.value || '';
        this.validator = options.validator || null;
        this.onChange = options.onChange || null;

        this.element = null;
        this.errors = [];
    }

    /**
     * Рендеринг компонента
     * @returns {HTMLElement}
     */
    render() {
        const wrapper = document.createElement('div');
        wrapper.className = 'form-field form-field--{{component-type}}';

        // Метка
        const label = document.createElement('label');
        label.className = 'form-field__label';
        label.htmlFor = this.name;
        label.textContent = this.label;
        if (this.required) {
            label.classList.add('form-field__label--required');
        }

        // Основной элемент (input, select, textarea, etc.)
        this.element = this._createElement();

        // Контейнер ошибок
        const errorContainer = document.createElement('div');
        errorContainer.className = 'form-field__errors';
        errorContainer.id = `${this.name}-errors`;

        wrapper.appendChild(label);
        wrapper.appendChild(this.element);
        wrapper.appendChild(errorContainer);

        return wrapper;
    }

    /**
     * Создание основного элемента (переопределяется в наследниках)
     * @private
     */
    _createElement() {
        const input = document.createElement('input');
        input.type = '{{input-type}}';
        input.id = this.name;
        input.name = this.name;
        input.className = 'form-field__input';
        input.value = this.value;
        input.placeholder = this.placeholder;
        input.required = this.required;

        // Event listeners
        input.addEventListener('input', (e) => this._handleChange(e));
        input.addEventListener('blur', () => this.validate());

        return input;
    }

    /**
     * Обработчик изменения значения
     * @private
     */
    _handleChange(event) {
        this.value = event.target.value;

        if (this.onChange) {
            this.onChange(this.value);
        }
    }

    /**
     * Валидация поля
     * @returns {boolean}
     */
    validate() {
        this.errors = [];

        // Проверка обязательности
        if (this.required && !this.value.trim()) {
            this.errors.push(`Поле "${this.label}" обязательно для заполнения`);
        }

        // Кастомная валидация
        if (this.validator && this.value.trim()) {
            const validationResult = this.validator(this.value);
            if (validationResult !== true) {
                this.errors.push(validationResult);
            }
        }

        this._renderErrors();
        return this.errors.length === 0;
    }

    /**
     * Отображение ошибок
     * @private
     */
    _renderErrors() {
        const errorContainer = document.getElementById(`${this.name}-errors`);
        if (!errorContainer) return;

        errorContainer.innerHTML = '';

        if (this.errors.length > 0) {
            this.element.classList.add('form-field__input--error');
            this.errors.forEach(error => {
                const errorElement = document.createElement('div');
                errorElement.className = 'form-field__error';
                errorElement.textContent = error;
                errorContainer.appendChild(errorElement);
            });
        } else {
            this.element.classList.remove('form-field__input--error');
        }
    }

    /**
     * Получить значение
     * @returns {*}
     */
    getValue() {
        return this.value;
    }

    /**
     * Установить значение
     * @param {*} value
     */
    setValue(value) {
        this.value = value;
        if (this.element) {
            this.element.value = value;
        }
    }

    /**
     * Очистить поле
     */
    clear() {
        this.setValue('');
        this.errors = [];
        this._renderErrors();
    }

    /**
     * Отключить/включить поле
     * @param {boolean} disabled
     */
    setDisabled(disabled) {
        if (this.element) {
            this.element.disabled = disabled;
        }
    }
}

// Export для использования в приложении
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {{ComponentName}};
}
