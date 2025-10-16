/**
 * @file app.js
 * @description Main application class for XML Editor Desktop
 * @module renderer/app
 */

/**
 * Main application class for renderer process
 * Manages UI state, document operations, and user interactions
 */
class XMLEditorApp {
  constructor() {
    /** @type {Object|null} Internal current document storage */
    this._currentDocument = null;

    /** @type {number|null} Autosave interval ID */
    this.autosaveInterval = null;

    /** @type {FormManager|null} Form manager instance */
    this.formManager = null;

    /** @type {SchemaLoader} Schema loader instance */
    this.schemaLoader = new SchemaLoader();

    /** @type {NavigationController} Navigation controller instance */
    this.navigation = null;

    /** @type {Object} UI elements cache */
    this.ui = {
      welcomeScreen: null,
      editorScreen: null,
      contextToolbar: null,
      documentTitle: null,
      schemaSelect: null,
      editorForm: null,
      documentsList: null,
      schemaVersion: null,
      validationStatus: null,
      lastSaved: null,
      footerStatus: null,
      loadingOverlay: null,
      toastContainer: null
    };

    this.init();
  }

  /**
   * Initialize application
   * @private
   */
  async init() {
    this.cacheUIElements();
    this.disableDocumentControls(); // Disable controls on startup
    this.initNavigation();
    await this.initPluginSystem(); // Initialize plugin system first
    await this.initUIComponents(); // Week 3-4: Activity Bar, Tab Bar, Service Store
    this.setupEventListeners();
    this.setupMenuListeners();
    this.loadRecentDocuments();

    console.log('XMLEditorApp initialized successfully');
  }

  /**
   * Initialize Plugin System
   * @private
   */
  async initPluginSystem() {
    console.log('🔌 Initializing Plugin System...');

    // Initialize managers
    window.tabManager = new TabManager();
    window.workspaceManager = new WorkspaceManager();
    window.lifecycleManager = new LifecycleManager();

    // Initialize lifecycle manager
    await window.lifecycleManager.initialize();

    // Auto-activate hello-world service (demo)
    const helloManifest = {
      id: 'hello-world',
      name: 'Hello World Service',
      version: '1.0.0',
      entry: '../services/hello-world/index.js',
      permissions: ['ui.tabs', 'ui.dialog', 'commands.register', 'storage.global']
    };

    try {
      await window.lifecycleManager.install(helloManifest);
      await window.lifecycleManager.activate('hello-world');
      console.log('✅ Plugin System initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Plugin System:', error);
    }
  }

  /**
   * Initialize navigation controller
   * @private
   */
  initNavigation() {
    this.navigation = new NavigationController();

    // Listen to navigation changes
    document.addEventListener('navigation:change', (e) => {
      console.log('Navigation changed to:', e.detail.section);
    });
  }

  /**
   * Initialize UI Components (Week 3-4)
   * @private
   */
  async initUIComponents() {
    console.log('🎨 Initializing UI Components...');

    // Activity Bar
    this.activityBar = new ActivityBar();
    this.activityBar.init();
    window.activityBar = this.activityBar; // Global access

    // Tab Bar
    this.tabBar = new TabBar();
    this.tabBar.init();
    window.tabBar = this.tabBar; // Global access

    // Dynamic Sidebar
    this.dynamicSidebar = new DynamicSidebar();
    this.dynamicSidebar.init();
    window.dynamicSidebar = this.dynamicSidebar; // Global access

    // Context Toolbar
    this.contextToolbar = new ContextToolbar();
    this.contextToolbar.init();
    window.contextToolbar = this.contextToolbar; // Global access

    // Service Store
    this.serviceStore = new ServiceStore();
    await this.serviceStore.init();
    window.serviceStore = this.serviceStore; // Global access

    // Setup component event listeners
    this._setupUIComponentEvents();

    console.log('✅ UI Components initialized');
  }

  /**
   * Setup event listeners for UI components
   * @private
   */
  _setupUIComponentEvents() {
    // Tab Bar events
    window.eventBus?.on('tab:changed', ({ tabId }) => {
      console.log('Tab changed:', tabId);
      // TODO: Load document content
    });

    window.eventBus?.on('tab:closed', ({ tabId }) => {
      console.log('Tab closed:', tabId);
      // TODO: Cleanup document
    });

    // Sidebar events
    window.eventBus?.on('sidebar:changed', ({ section }) => {
      console.log('Sidebar section changed:', section);
    });

    // Document events
    window.eventBus?.on('document:new', () => {
      console.log('New document requested');
      // TODO: Implement newDocument method
      this.showToast('Функция "Создать документ" в разработке', 'info');
    });

    window.eventBus?.on('document:open', () => {
      console.log('Open document requested');
      // TODO: Implement openDocument method
      this.showToast('Функция "Открыть документ" в разработке', 'info');
    });

    window.eventBus?.on('document:save', () => {
      console.log('Save document requested');
      // TODO: Implement saveDocument method
      this.showToast('Функция "Сохранить документ" в разработке', 'info');
    });

    window.eventBus?.on('document:export', () => {
      console.log('Export document requested');
      // TODO: Implement exportXML method
      this.showToast('Функция "Экспорт XML" в разработке', 'info');
    });

    window.eventBus?.on('document:validate', () => {
      console.log('Validate document requested');
      // TODO: Implement validateDocument method
      this.showToast('Функция "Валидация" в разработке', 'info');
    });

    window.eventBus?.on('template:create', () => {
      console.log('Create template requested');
      // TODO: Implement saveAsTemplate method
      this.showToast('Функция "Сохранить как шаблон" в разработке', 'info');
    });

    window.eventBus?.on('service:open', ({ serviceId }) => {
      console.log('Open service requested:', serviceId);
      // TODO: Open service in tab
      this.showToast(`Открытие сервиса: ${serviceId}`, 'info');
    });

    window.eventBus?.on('settings:show', ({ type }) => {
      console.log('Show settings requested:', type);
      // TODO: Show settings panel
      this.showToast(`Настройки: ${type}`, 'info');
    });
  }

  /**
   * Get current document
   * @returns {Object|null} Current document
   */
  get currentDocument() {
    return this._currentDocument;
  }

  /**
   * Set current document and update UI state accordingly
   * @param {Object|null} value - Document to set
   */
  set currentDocument(value) {
    this._currentDocument = value;

    // Update UI state based on document presence
    if (value === null) {
      this.disableDocumentControls();
    } else {
      this.enableDocumentControls();
    }
  }

  /**
   * Cache UI elements for performance
   * @private
   */
  cacheUIElements() {
    this.ui.homeDashboard = document.getElementById('home-dashboard');
    this.ui.editorScreen = document.getElementById('editor-screen');
    this.ui.contextToolbar = document.getElementById('context-toolbar');
    this.ui.documentTitle = document.getElementById('document-title');
    this.ui.schemaSelect = document.getElementById('schema-version-select');
    this.ui.editorForm = document.getElementById('editor-form');
    this.ui.documentsList = document.getElementById('documents-list');
    this.ui.homeRecentDocuments = document.getElementById('home-recent-documents');
    this.ui.footerStatus = document.getElementById('footer-status');
    this.ui.loadingOverlay = document.getElementById('loading-overlay');
    this.ui.toastContainer = document.getElementById('toast-container');
    this.ui.statDocuments = document.getElementById('stat-documents');
    this.ui.statTemplates = document.getElementById('stat-templates');
    this.ui.widgetDocuments = document.getElementById('widget-documents');
    this.ui.widgetTemplates = document.getElementById('widget-templates');
  }

  /**
   * Setup event listeners
   * @private
   */
  setupEventListeners() {
    // Header buttons
    document.getElementById('new-document')?.addEventListener('click', () => {
      this.createNewDocument();
    });

    document.getElementById('open-document')?.addEventListener('click', () => {
      this.openDocument();
    });

    document.getElementById('save-document')?.addEventListener('click', () => {
      this.saveDocument();
    });

    document.getElementById('load-from-template')?.addEventListener('click', () => {
      this.loadFromTemplate();
    });

    document.getElementById('load-from-template-sidebar')?.addEventListener('click', () => {
      this.loadFromTemplate();
    });

    document.getElementById('save-as-template')?.addEventListener('click', () => {
      this.saveAsTemplate();
    });

    document.getElementById('validate-xml')?.addEventListener('click', () => {
      this.validateXML();
    });

    document.getElementById('export-xml')?.addEventListener('click', () => {
      this.exportXML();
    });

    // Schema version select
    this.ui.schemaSelect?.addEventListener('change', (e) => {
      this.onSchemaVersionChange(e.target.value);
    });

    // Document title input
    this.ui.documentTitle?.addEventListener('input', (e) => {
      if (this.currentDocument) {
        this.currentDocument.title = e.target.value;
      }
    });

    // Sidebar navigation menu
    document.getElementById('nav-validate')?.addEventListener('click', () => {
      this.validateXML();
    });

    document.getElementById('nav-templates')?.addEventListener('click', () => {
      this.loadFromTemplate();
    });

    document.getElementById('nav-pdf')?.addEventListener('click', () => {
      this.showToast('Генерация PDF будет доступна в Week 5-6', 'info');
    });

    document.getElementById('nav-history')?.addEventListener('click', () => {
      this.showToast('История версий будет доступна в Week 7-8', 'info');
    });

    document.getElementById('nav-modules')?.addEventListener('click', () => {
      this.showToast('Управление модулями будет доступно в Week 4', 'info');
    });

    document.getElementById('nav-settings')?.addEventListener('click', () => {
      this.showToast('Настройки будут доступны в будущих версиях', 'info');
    });
  }

  /**
   * Setup menu event listeners
   * @private
   */
  setupMenuListeners() {
    // Файл
    window.electronAPI?.onMenuEvent('menu:new-document', () => {
      this.createNewDocument();
    });

    window.electronAPI?.onMenuEvent('menu:open-document', () => {
      this.openDocument();
    });

    window.electronAPI?.onMenuEvent('menu:save-document', () => {
      this.saveDocument();
    });

    window.electronAPI?.onMenuEvent('menu:export-xml', () => {
      this.exportXML();
    });

    // Шаблоны
    window.electronAPI?.onMenuEvent('menu:load-template', () => {
      this.loadFromTemplate();
    });

    window.electronAPI?.onMenuEvent('menu:save-template', () => {
      this.saveAsTemplate();
    });

    window.electronAPI?.onMenuEvent('menu:manage-templates', () => {
      this.showToast('Управление шаблонами будет доступно в будущих версиях', 'info');
    });

    // Инструменты
    window.electronAPI?.onMenuEvent('menu:validate-xml', () => {
      this.validateXML();
    });

    window.electronAPI?.onMenuEvent('menu:generate-pdf', () => {
      this.showToast('Генерация PDF будет доступна в Week 5-6', 'info');
    });

    window.electronAPI?.onMenuEvent('menu:version-history', () => {
      this.showToast('История версий будет доступна в Week 7-8', 'info');
    });

    window.electronAPI?.onMenuEvent('menu:import-xml', () => {
      this.showToast('Импорт XML будет доступен в Week 7-8', 'info');
    });

    window.electronAPI?.onMenuEvent('menu:preview-document', () => {
      this.showToast('Предпросмотр документа будет доступен в будущих версиях', 'info');
    });

    // Модули
    window.electronAPI?.onMenuEvent('menu:manage-modules', () => {
      this.showToast('Управление модулями будет доступно в Week 4', 'info');
    });

    window.electronAPI?.onMenuEvent('menu:install-module', () => {
      this.showToast('Установка модулей будет доступна в Week 4', 'info');
    });

    window.electronAPI?.onMenuEvent('menu:update-modules', () => {
      this.showToast('Обновление модулей будет доступно в Week 4', 'info');
    });

    // Настройки
    window.electronAPI?.onMenuEvent('menu:settings-general', () => {
      this.showToast('Настройки будут доступны в будущих версиях', 'info');
    });

    window.electronAPI?.onMenuEvent('menu:settings-paths', () => {
      this.showToast('Настройки путей будут доступны в будущих версиях', 'info');
    });

    window.electronAPI?.onMenuEvent('menu:settings-autosave', () => {
      this.showToast('Настройки автосохранения будут доступны в будущих версиях', 'info');
    });

    window.electronAPI?.onMenuEvent('menu:settings-reset', () => {
      this.showToast('Сброс настроек будет доступен в будущих версиях', 'info');
    });

    // Справка
    window.electronAPI?.onMenuEvent('menu:help-docs', () => {
      this.showToast('Документация будет доступна в будущих версиях', 'info');
    });

    window.electronAPI?.onMenuEvent('menu:help-shortcuts', () => {
      this.showAboutShortcuts();
    });

    window.electronAPI?.onMenuEvent('menu:about', () => {
      this.showAboutDialog();
    });
  }

  /**
   * Load recent documents list
   * @private
   */
  async loadRecentDocuments() {
    try {
      const result = await window.electronAPI.listDocuments();

      if (result.success && result.documents.length > 0) {
        this.renderDocumentsList(result.documents);
      }
    } catch (error) {
      console.error('Error loading recent documents:', error);
    }
  }

  /**
   * Render documents list in sidebar
   * @private
   * @param {Array} documents - Array of documents
   */
  renderDocumentsList(documents) {
    if (!this.ui.documentsList) return;

    if (documents.length === 0) {
      this.ui.documentsList.innerHTML = `
        <div class="sidebar__empty">
          <p>Нет документов</p>
        </div>
      `;

      // Also update home sidebar
      if (this.ui.homeRecentDocuments) {
        this.ui.homeRecentDocuments.innerHTML = `
          <div class="sidebar__empty">
            <p>Нет документов</p>
          </div>
        `;
      }
      return;
    }

    const html = documents.slice(0, 10).map(doc => `
      <div class="sidebar__item" data-document-id="${doc.id}">
        <div class="sidebar__item-title">${doc.title}</div>
        <div class="sidebar__item-meta">
          Схема: ${doc.schema_version} | ${this.formatDate(doc.updated_at)}
        </div>
      </div>
    `).join('');

    this.ui.documentsList.innerHTML = html;

    // Also update home sidebar recent documents
    if (this.ui.homeRecentDocuments) {
      this.ui.homeRecentDocuments.innerHTML = html;

      // Add click handlers to home sidebar items
      this.ui.homeRecentDocuments.querySelectorAll('.sidebar__item').forEach(item => {
        item.addEventListener('click', () => {
          const docId = parseInt(item.dataset.documentId);
          this.loadDocument(docId);
        });
      });
    }

    // Add click handlers to documents sidebar
    this.ui.documentsList.querySelectorAll('.sidebar__item').forEach(item => {
      item.addEventListener('click', () => {
        const docId = parseInt(item.dataset.documentId);
        this.loadDocument(docId);
      });
    });
  }

  /**
   * Create new document
   */
  async createNewDocument() {
    this.showEditorScreen();

    // Use internal property to avoid triggering enable/disable logic
    this._currentDocument = {
      id: null,
      title: '',
      schema_version: '',
      content: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Keep controls disabled until document has schema and title
    this.disableDocumentControls();

    this.ui.documentTitle.value = '';
    this.ui.schemaSelect.value = '';
    this.ui.editorForm.innerHTML = `
      <div class="editor__placeholder">
        <p>Выберите версию схемы для начала работы</p>
      </div>
    `;

    this.updateSidebar();
    this.showToast('Создан новый документ', 'info');
  }

  /**
   * Open existing document
   */
  async openDocument() {
    try {
      const result = await window.electronAPI.listDocuments();

      if (!result.success) {
        this.showToast('Ошибка загрузки списка документов', 'error');
        return;
      }

      const documents = result.documents || [];

      if (documents.length === 0) {
        this.showToast('Нет сохраненных документов', 'info');
        return;
      }

      // Show document selection dialog
      const selector = new DocumentSelector({
        documents: documents,
        onSelect: (documentId) => {
          this.loadDocument(documentId);
        },
        onCancel: () => {
          // Dialog closed, no action needed
        }
      });

      selector.show();
    } catch (error) {
      console.error('Error opening document:', error);
      this.showToast('Ошибка при открытии документа', 'error');
    }
  }

  /**
   * Load document by ID
   * @param {number} documentId - Document ID
   */
  async loadDocument(documentId) {
    try {
      this.showLoading();

      const result = await window.electronAPI.loadDocument(documentId);

      if (!result.success) {
        this.showToast('Ошибка загрузки документа', 'error');
        return;
      }

      // Set document using internal property first
      this._currentDocument = result.document;

      // Show editor screen (switches to documents section if needed)
      this.showEditorScreen();

      // Fill UI with document data
      this.ui.documentTitle.value = this.currentDocument.title;
      this.ui.schemaSelect.value = this.currentDocument.schema_version;

      // Load form with schema and data
      await this.onSchemaVersionChange(this.currentDocument.schema_version);

      this.updateSidebar();
      this.startAutosave();

      this.showToast('Документ загружен', 'success');
    } catch (error) {
      console.error('Error loading document:', error);
      this.showToast('Ошибка при загрузке документа', 'error');
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Save current document
   */
  async saveDocument() {
    if (!this.currentDocument) {
      this.showToast('Нет открытого документа для сохранения', 'warning');
      return;
    }

    try {
      this.showLoading();

      // Collect form data if form manager exists
      if (this.formManager) {
        // Validate form before saving
        if (!this.formManager.validateForm()) {
          this.showToast('Исправьте ошибки в форме перед сохранением', 'warning');
          this.hideLoading();
          return;
        }

        this.currentDocument.content = this.formManager.collectFormData();
      }

      const data = {
        title: this.currentDocument.title || 'Без названия',
        schema_version: this.currentDocument.schema_version,
        content: this.currentDocument.content
      };

      let result;

      if (this.currentDocument.id) {
        // Update existing document
        result = await window.electronAPI.saveDocument({
          id: this.currentDocument.id,
          ...data
        });
      } else {
        // Create new document
        result = await window.electronAPI.createDocument(data);

        if (result.success) {
          this.currentDocument.id = result.id;
        }
      }

      if (result.success) {
        this.currentDocument.updated_at = new Date().toISOString();
        this.updateSidebar();
        this.loadRecentDocuments();
        this.showToast('Документ сохранен', 'success');
      } else {
        this.showToast('Ошибка сохранения документа', 'error');
      }
    } catch (error) {
      console.error('Error saving document:', error);
      this.showToast('Ошибка при сохранении документа', 'error');
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Load document from template
   */
  async loadFromTemplate() {
    try {
      const schemaVersion = this.currentDocument?.schema_version || null;

      const browser = new TemplateBrowser({
        schemaVersion,
        onSelect: async (template) => {
          try {
            this.showLoading();

            // Parse template content
            const content = JSON.parse(template.content);

            // Create new document from template
            const result = await window.electronAPI.createDocument({
              title: `Из шаблона: ${template.name}`,
              schema_version: template.schema_version,
              content: content
            });

            if (result.success) {
              // Load the new document
              await this.loadDocument(result.id);
              this.showToast(`Документ создан из шаблона "${template.name}"`, 'success');
            } else {
              this.showToast('Ошибка создания документа', 'error');
            }

            this.hideLoading();
          } catch (error) {
            this.hideLoading();
            console.error('Error loading from template:', error);
            this.showToast('Ошибка при загрузке шаблона', 'error');
          }
        }
      });

      browser.show();
    } catch (error) {
      console.error('Error opening template browser:', error);
      this.showToast('Ошибка при открытии списка шаблонов', 'error');
    }
  }

  /**
   * Save current document as template
   */
  async saveAsTemplate() {
    if (!this.currentDocument) {
      this.showToast('Нет открытого документа для сохранения', 'warning');
      return;
    }

    try {
      // Собираем данные формы
      const formData = this.formManager.collectFormData();

      const dialog = new TemplateDialog({
        mode: 'create',
        documentData: {
          content: formData,
          schema_version: this.currentDocument.schema_version
        },
        onSave: (template) => {
          this.showToast(`Шаблон "${template.name}" успешно создан`, 'success');
          // Update sidebar/dashboard statistics
          this.updateStatistics();
        }
      });

      dialog.show();
    } catch (error) {
      console.error('Error saving as template:', error);
      this.showToast('Ошибка при создании шаблона', 'error');
    }
  }

  /**
   * Validate XML without exporting
   */
  async validateXML() {
    if (!this.currentDocument) {
      this.showToast('Нет открытого документа для проверки', 'warning');
      return;
    }

    try {
      this.showLoading();

      // Generate XML using XMLGenerator
      const xmlGenerator = new XMLGenerator();
      const xmlContent = await xmlGenerator.generateXML(
        this.currentDocument.content,
        this.currentDocument.schema_version
      );

      // Validate XML against XSD schema
      console.log('🔍 Validating XML against XSD schema...');
      const validationResult = await window.electronAPI.validateXML(
        xmlContent,
        this.currentDocument.schema_version
      );

      this.hideLoading();

      if (validationResult.success) {
        // Show validation panel with results
        const panel = new ValidationPanel({
          errors: validationResult.errors || [],
          onClose: () => {
            console.log('Validation panel closed');
          }
        });
        panel.show();
      } else {
        this.showToast('Ошибка при валидации XML', 'error');
        console.error('Validation error:', validationResult.error);
      }

    } catch (error) {
      this.hideLoading();
      this.showToast('Ошибка при валидации XML', 'error');
      console.error('Error validating XML:', error);
    }
  }

  /**
   * Export document to XML
   */
  async exportXML() {
    if (!this.currentDocument) {
      this.showToast('Нет открытого документа для экспорта', 'warning');
      return;
    }

    try {
      this.showLoading();

      // Show save dialog
      const result = await window.electronAPI.showSaveDialog({
        title: 'Экспорт в XML',
        defaultPath: `${this.currentDocument.title || 'document'}.xml`,
        filters: [
          { name: 'XML Files', extensions: ['xml'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (result.canceled || !result.filePath) {
        this.hideLoading();
        return;
      }

      // Generate XML using XMLGenerator
      const xmlGenerator = new XMLGenerator();
      const xmlContent = await xmlGenerator.generateXML(
        this.currentDocument.content,
        this.currentDocument.schema_version
      );

      // Validate XML against XSD schema
      console.log('🔍 Validating XML against XSD schema...');
      const validationResult = await window.electronAPI.validateXML(
        xmlContent,
        this.currentDocument.schema_version
      );

      let isValid = false;
      if (validationResult.success && validationResult.valid) {
        console.log('✅ XML validation passed');
        isValid = true;
      } else {
        console.warn('⚠️ XML validation failed:', validationResult.errors);

        // Show validation errors to user
        const errorMessages = validationResult.errors
          .slice(0, 3) // Show max 3 errors
          .map(err => `  • ${err.message} (строка ${err.line})`)
          .join('\n');

        const shouldContinue = confirm(
          `XML не прошел валидацию по схеме Минстроя:\n\n${errorMessages}\n\n` +
          `Всего ошибок: ${validationResult.errors.length}\n\n` +
          `Продолжить экспорт невалидного XML?`
        );

        if (!shouldContinue) {
          this.hideLoading();
          this.showToast('Экспорт отменен', 'warning');
          return;
        }
      }

      // Write XML to file
      const writeResult = await window.electronAPI.writeXMLFile(result.filePath, xmlContent);

      this.hideLoading();

      if (writeResult.success) {
        // Save XML content to document
        await window.electronAPI.saveDocument({
          id: this.currentDocument.id,
          xml_content: xmlContent,
          is_valid: isValid
        });

        const validationStatus = isValid ? '✅ валиден' : '⚠️ с ошибками валидации';
        this.showToast(`XML экспортирован (${validationStatus}): ${result.filePath}`, isValid ? 'success' : 'warning');
        console.log('✅ XML exported successfully:', result.filePath);
      } else {
        throw new Error(writeResult.error || 'Failed to write XML file');
      }
    } catch (error) {
      this.hideLoading();
      console.error('Error exporting XML:', error);
      this.showToast(`Ошибка при экспорте XML: ${error.message}`, 'error');
    }
  }

  /**
   * Handle schema version change
   * @private
   * @param {string} version - Schema version
   */
  async onSchemaVersionChange(version) {
    if (!version || !this.currentDocument) return;

    try {
      this.showLoading();

      // Update current document
      this.currentDocument.schema_version = version;

      // Load schema
      const schema = await this.schemaLoader.loadSchema(version);

      // Destroy existing form manager
      if (this.formManager) {
        this.formManager.destroy();
        this.formManager = null;
      }

      // Create new form manager
      this.formManager = new FormManager({
        container: this.ui.editorForm,
        schema: schema,
        data: this.currentDocument.content || {},
        onChange: (data) => {
          this.currentDocument.content = data;
          this.currentDocument.updated_at = new Date().toISOString();
        }
      });

      // Generate form from schema
      await this.formManager.generateFormFromSchema();

      // Attach validation
      this.formManager.attachValidation();

      // Populate form if we have existing data
      if (this.currentDocument.content && Object.keys(this.currentDocument.content).length > 0) {
        this.formManager.populateForm(this.currentDocument.content);
      }

      this.updateSidebar();
      this.enableDocumentControls();
      this.startAutosave();

      this.showToast(`Форма для схемы ${version} загружена`, 'success');
    } catch (error) {
      console.error('Error loading schema:', error);
      this.showToast('Ошибка загрузки схемы', 'error');
      this.ui.editorForm.innerHTML = `
        <div class="editor__error">
          <p>Ошибка загрузки схемы ${version}</p>
          <p style="margin-top: 1rem; font-size: 0.875rem;">${error.message}</p>
        </div>
      `;
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Start autosave interval
   * @private
   */
  startAutosave() {
    this.stopAutosave();

    this.autosaveInterval = setInterval(async () => {
      if (this.currentDocument && this.currentDocument.id) {
        try {
          await window.electronAPI.autosaveDocument({
            document_id: this.currentDocument.id,
            content: this.currentDocument.content
          });
          console.log('Autosave completed');
        } catch (error) {
          console.error('Autosave error:', error);
        }
      }
    }, 30000); // 30 seconds
  }

  /**
   * Stop autosave interval
   * @private
   */
  stopAutosave() {
    if (this.autosaveInterval) {
      clearInterval(this.autosaveInterval);
      this.autosaveInterval = null;
    }
  }

  /**
   * Show editor screen
   * @private
   */
  showEditorScreen() {
    // Switch to documents section FIRST
    const navDocuments = document.querySelector('.app-nav__item[data-section="documents"]');
    if (navDocuments && !navDocuments.classList.contains('app-nav__item--active')) {
      navDocuments.click();

      // Use setTimeout to ensure navigation handlers complete before showing editor
      // Increased to 150ms to handle slower navigation events
      setTimeout(() => {
        this._displayEditor();
      }, 150);
    } else {
      // Already on documents section
      this._displayEditor();
    }
  }

  /**
   * Internal method to display editor components
   * @private
   */
  _displayEditor() {
    // Hide home dashboard
    if (this.ui.homeDashboard) {
      this.ui.homeDashboard.style.display = 'none';
    }

    // Hide service store
    const serviceStore = document.getElementById('service-store');
    if (serviceStore) {
      serviceStore.style.display = 'none';
    }

    // Show editor and context toolbar
    this.ui.editorScreen.style.display = 'block';
    this.ui.contextToolbar.style.display = 'flex';
  }

  /**
   * Enable document controls
   * @private
   */
  enableDocumentControls() {
    document.getElementById('save-document')?.removeAttribute('disabled');
    document.getElementById('save-as-template')?.removeAttribute('disabled');
    document.getElementById('load-from-template')?.removeAttribute('disabled');
    document.getElementById('validate-xml')?.removeAttribute('disabled');
    document.getElementById('export-xml')?.removeAttribute('disabled');
  }

  /**
   * Disable document controls
   * @private
   */
  disableDocumentControls() {
    document.getElementById('save-document')?.setAttribute('disabled', 'disabled');
    document.getElementById('save-as-template')?.setAttribute('disabled', 'disabled');
    document.getElementById('validate-xml')?.setAttribute('disabled', 'disabled');
    document.getElementById('export-xml')?.setAttribute('disabled', 'disabled');
  }

  /**
   * Update sidebar information
   * @private
   */
  updateSidebar() {
    // Update statistics in sidebars
    this.updateStatistics();
  }

  /**
   * Update statistics across the UI
   * @private
   */
  async updateStatistics() {
    try {
      // Get document count
      const docsResult = await window.electronAPI.listDocuments();
      const docCount = docsResult.success ? docsResult.documents.length : 0;

      // Get template count
      const templatesResult = await window.electronAPI.listTemplates();
      const templateCount = templatesResult.success ? templatesResult.templates.length : 0;

      // Update sidebar stats
      if (this.ui.statDocuments) {
        this.ui.statDocuments.textContent = docCount;
      }
      if (this.ui.statTemplates) {
        this.ui.statTemplates.textContent = templateCount;
      }

      // Update dashboard widgets
      if (this.ui.widgetDocuments) {
        this.ui.widgetDocuments.textContent = docCount;
      }
      if (this.ui.widgetTemplates) {
        this.ui.widgetTemplates.textContent = templateCount;
      }
    } catch (error) {
      console.error('Error updating statistics:', error);
    }
  }

  /**
   * Show loading overlay
   * @private
   */
  showLoading() {
    this.ui.loadingOverlay.style.display = 'flex';
  }

  /**
   * Hide loading overlay
   * @private
   */
  hideLoading() {
    this.ui.loadingOverlay.style.display = 'none';
  }

  /**
   * Show toast notification
   * @param {string} message - Toast message
   * @param {string} type - Toast type (success, error, warning, info)
   */
  showToast(message, type = 'info') {
    const icons = {
      success: '✓',
      error: '✗',
      warning: '⚠',
      info: 'ℹ'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <span class="toast__icon">${icons[type]}</span>
      <div class="toast__content">
        <div class="toast__message">${message}</div>
      </div>
    `;

    this.ui.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  /**
   * Show about dialog
   * @private
   */
  showAboutDialog() {
    this.showToast('XML Editor Desktop v1.1.0 - Week 3 Complete', 'info');
  }

  /**
   * Show keyboard shortcuts dialog
   * @private
   */
  showAboutShortcuts() {
    const shortcuts = `
📋 Горячие клавиши:

Документы:
• Cmd/Ctrl+N - Новый документ
• Cmd/Ctrl+O - Открыть документ
• Cmd/Ctrl+S - Сохранить
• Cmd/Ctrl+E - Экспорт XML

Шаблоны:
• Cmd/Ctrl+T - Из шаблона
• Cmd/Ctrl+Shift+S - Сохранить как шаблон

Инструменты:
• Cmd/Ctrl+Shift+V - Проверить XML
• Cmd/Ctrl+P - Генерация PDF (Week 5-6)
• Cmd/Ctrl+H - История версий (Week 7-8)
• Cmd/Ctrl+I - Импорт XML (Week 7-8)

Общие:
• F1 - Документация
• Cmd/Ctrl+, - Настройки (Future)
• ESC - Закрыть диалоги
    `;

    alert(shortcuts);
  }

  /**
   * Format date to readable string
   * @private
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    // Less than 1 minute
    if (diff < 60000) {
      return 'только что';
    }

    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} мин назад`;
    }

    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} ч назад`;
    }

    // Format as date
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Cleanup UI (remove overlays and modals)
   */
  cleanupUI() {
    // Remove template dialogs
    document.querySelectorAll('.template-dialog__overlay, .modal-overlay, .template-dialog').forEach(el => {
      el.remove();
    });

    // Restore body
    document.body.style.overflow = '';
    document.body.style.pointerEvents = '';
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.xmlEditorApp = new XMLEditorApp();
  });
} else {
  window.xmlEditorApp = new XMLEditorApp();
}
