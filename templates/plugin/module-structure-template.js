/**
 * Module Structure Template
 *
 * Шаблон для создания модульных плагинов
 * Используется для расширения приложения новыми типами документов
 *
 * @example
 * const pzModule = new DocumentModule({
 *   name: 'explanatory-note-01.05',
 *   version: '1.0.0',
 *   schemaVersion: '01.05'
 * });
 */

class {{ModuleName}} {
    /**
     * @param {Object} config - Конфигурация модуля
     * @param {string} config.name - Имя модуля
     * @param {string} config.version - Версия модуля
     * @param {string} config.schemaVersion - Версия XML-схемы
     * @param {Object} [config.dependencies] - Зависимости модуля
     */
    constructor(config) {
        this.name = config.name;
        this.version = config.version;
        this.schemaVersion = config.schemaVersion;
        this.dependencies = config.dependencies || {};

        this.state = 'uninitialized'; // uninitialized, initialized, active, error
        this.formSchema = null;
        this.xmlGenerator = null;
        this.validator = null;
    }

    /**
     * Lifecycle: Инициализация модуля
     * Вызывается при регистрации модуля в приложении
     */
    async init() {
        console.log(`[${this.name}] Initializing module v${this.version}...`);

        try {
            // 1. Загрузка JSON-схемы для формы
            this.formSchema = await this._loadFormSchema();

            // 2. Загрузка XSD-схемы для валидации
            const xsdSchema = await this._loadXSDSchema();
            this.validator = new XMLValidator(xsdSchema);

            // 3. Инициализация генератора XML
            this.xmlGenerator = new XMLGenerator({
                schema: this.formSchema,
                version: this.schemaVersion
            });

            // 4. Регистрация обработчиков событий
            this._registerEventHandlers();

            this.state = 'initialized';
            console.log(`[${this.name}] Module initialized successfully`);

            return true;
        } catch (error) {
            this.state = 'error';
            console.error(`[${this.name}] Initialization failed:`, error);
            throw error;
        }
    }

    /**
     * Lifecycle: Активация модуля
     * Вызывается когда пользователь начинает работать с этим типом документа
     */
    async activate() {
        if (this.state !== 'initialized') {
            throw new Error(`Module ${this.name} is not initialized`);
        }

        console.log(`[${this.name}] Activating module...`);

        // Подготовка UI, загрузка ресурсов и т.д.
        await this._prepareResources();

        this.state = 'active';
        this.emit('activated');
    }

    /**
     * Lifecycle: Деактивация модуля
     * Вызывается когда пользователь переключается на другой тип документа
     */
    async deactivate() {
        console.log(`[${this.name}] Deactivating module...`);

        // Очистка ресурсов
        await this._cleanup();

        this.state = 'initialized';
        this.emit('deactivated');
    }

    /**
     * Lifecycle: Уничтожение модуля
     * Вызывается при выгрузке модуля из приложения
     */
    async destroy() {
        console.log(`[${this.name}] Destroying module...`);

        if (this.state === 'active') {
            await this.deactivate();
        }

        // Полная очистка
        this.formSchema = null;
        this.xmlGenerator = null;
        this.validator = null;

        this.state = 'uninitialized';
        this.emit('destroyed');
    }

    /**
     * Создание нового документа
     * @returns {Object} Пустой документ с дефолтными значениями
     */
    createDocument() {
        return {
            id: this._generateId(),
            type: this.name,
            version: this.schemaVersion,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            content: this._getDefaultContent()
        };
    }

    /**
     * Рендеринг формы для редактирования документа
     * @param {HTMLElement} container - Контейнер для формы
     * @param {Object} document - Документ для редактирования
     * @returns {FormManager}
     */
    renderForm(container, document) {
        if (!this.formSchema) {
            throw new Error('Form schema is not loaded');
        }

        const formManager = new FormManager({
            schema: this.formSchema,
            container: container,
            data: document.content
        });

        formManager.render();

        // Подписка на изменения
        formManager.on('change', (data) => {
            document.content = data;
            document.modified = new Date().toISOString();
            this.emit('document-changed', document);
        });

        return formManager;
    }

    /**
     * Валидация документа
     * @param {Object} document - Документ для валидации
     * @returns {Object} { valid: boolean, errors: Array }
     */
    async validate(document) {
        const errors = [];

        // 1. Валидация по JSON-схеме
        const jsonErrors = this._validateJSON(document.content);
        errors.push(...jsonErrors);

        // 2. Генерация XML и валидация по XSD
        if (errors.length === 0) {
            const xml = await this.generateXML(document);
            const xsdErrors = await this.validator.validate(xml);
            errors.push(...xsdErrors);
        }

        // 3. Бизнес-правила (кастомная валидация)
        const businessErrors = await this._validateBusinessRules(document);
        errors.push(...businessErrors);

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Генерация XML из документа
     * @param {Object} document - Документ
     * @returns {string} XML-строка
     */
    async generateXML(document) {
        if (!this.xmlGenerator) {
            throw new Error('XML generator is not initialized');
        }

        return await this.xmlGenerator.generate(document.content);
    }

    /**
     * Экспорт документа в файл
     * @param {Object} document - Документ
     * @param {string} format - Формат ('xml', 'pdf', 'json')
     * @returns {string} Путь к файлу
     */
    async export(document, format = 'xml') {
        switch (format) {
            case 'xml':
                return await this._exportXML(document);

            case 'pdf':
                return await this._exportPDF(document);

            case 'json':
                return await this._exportJSON(document);

            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    /**
     * Импорт документа из файла
     * @param {string} filePath - Путь к файлу
     * @param {string} format - Формат ('xml', 'json')
     * @returns {Object} Документ
     */
    async import(filePath, format = 'xml') {
        switch (format) {
            case 'xml':
                return await this._importXML(filePath);

            case 'json':
                return await this._importJSON(filePath);

            default:
                throw new Error(`Unsupported import format: ${format}`);
        }
    }

    /**
     * Получение метаданных модуля
     * @returns {Object}
     */
    getMetadata() {
        return {
            name: this.name,
            version: this.version,
            schemaVersion: this.schemaVersion,
            state: this.state,
            dependencies: this.dependencies,
            features: {
                export: ['xml', 'pdf', 'json'],
                import: ['xml', 'json'],
                validation: true,
                templates: true
            }
        };
    }

    // ============================================================
    // PRIVATE METHODS
    // ============================================================

    /**
     * Загрузка JSON-схемы формы
     * @private
     */
    async _loadFormSchema() {
        const schemaPath = `{{schemas-dir}}/${this.name}/form-schema.json`;
        const response = await fetch(schemaPath);
        return await response.json();
    }

    /**
     * Загрузка XSD-схемы
     * @private
     */
    async _loadXSDSchema() {
        const schemaPath = `{{schemas-dir}}/${this.name}/schema.xsd`;
        // Загрузка через IPC в Electron
        return await window.electronAPI.loadSchema(schemaPath);
    }

    /**
     * Регистрация обработчиков событий
     * @private
     */
    _registerEventHandlers() {
        // Пример: автосохранение каждые 30 секунд
        this.on('document-changed', (document) => {
            clearTimeout(this._autosaveTimer);
            this._autosaveTimer = setTimeout(() => {
                this.emit('autosave', document);
            }, 30000);
        });
    }

    /**
     * Подготовка ресурсов
     * @private
     */
    async _prepareResources() {
        // Загрузка CSS, шрифтов, справочников и т.д.
    }

    /**
     * Очистка ресурсов
     * @private
     */
    async _cleanup() {
        clearTimeout(this._autosaveTimer);
        // Другая очистка
    }

    /**
     * Генерация уникального ID
     * @private
     */
    _generateId() {
        return `${this.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Получение дефолтного содержимого документа
     * @private
     */
    _getDefaultContent() {
        return {{default-content-object}};
    }

    /**
     * Валидация по JSON-схеме
     * @private
     */
    _validateJSON(content) {
        // Реализация валидации
        return [];
    }

    /**
     * Валидация бизнес-правил
     * @private
     */
    async _validateBusinessRules(document) {
        // Кастомные проверки специфичные для типа документа
        return [];
    }

    /**
     * Экспорт в XML
     * @private
     */
    async _exportXML(document) {
        const xml = await this.generateXML(document);
        const fileName = `${document.id}.xml`;
        const filePath = await window.electronAPI.saveFile(fileName, xml);
        return filePath;
    }

    /**
     * Экспорт в PDF
     * @private
     */
    async _exportPDF(document) {
        // Генерация PDF через XSLT трансформацию
        const xml = await this.generateXML(document);
        const pdfPath = await window.electronAPI.generatePDF(xml, this.schemaVersion);
        return pdfPath;
    }

    /**
     * Экспорт в JSON
     * @private
     */
    async _exportJSON(document) {
        const json = JSON.stringify(document, null, 2);
        const fileName = `${document.id}.json`;
        const filePath = await window.electronAPI.saveFile(fileName, json);
        return filePath;
    }

    /**
     * Импорт из XML
     * @private
     */
    async _importXML(filePath) {
        const xml = await window.electronAPI.readFile(filePath);
        const content = await this.xmlGenerator.parse(xml);

        return this.createDocument();
        // TODO: заполнить content из распарсенного XML
    }

    /**
     * Импорт из JSON
     * @private
     */
    async _importJSON(filePath) {
        const json = await window.electronAPI.readFile(filePath);
        return JSON.parse(json);
    }

    /**
     * Event Emitter functionality
     */
    emit(eventName, ...args) {
        if (!this._events) this._events = {};
        if (!this._events[eventName]) return;

        this._events[eventName].forEach(handler => handler(...args));
    }

    on(eventName, handler) {
        if (!this._events) this._events = {};
        if (!this._events[eventName]) this._events[eventName] = [];

        this._events[eventName].push(handler);
    }

    off(eventName, handler) {
        if (!this._events || !this._events[eventName]) return;

        this._events[eventName] = this._events[eventName].filter(h => h !== handler);
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {{ModuleName}};
}
