/**
 * @file preload.js
 * @description Secure IPC bridge between main and renderer processes
 * @module preload
 */

const { contextBridge, ipcRenderer } = require('electron');

/**
 * Expose secure API to renderer process
 * All main process communication must go through this bridge
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // ==================== DOCUMENT OPERATIONS ====================

  /**
   * Create new document
   * @param {Object} data - Document data
   * @param {string} data.title - Document title
   * @param {string} data.schema_version - Schema version
   * @param {Object} data.content - Document content
   * @returns {Promise<Object>} - Result with success flag and document ID
   */
  createDocument: (data) => ipcRenderer.invoke('document:create', data),

  /**
   * Save document
   * @param {Object} data - Document data
   * @param {number} data.id - Document ID
   * @param {string} data.title - Document title
   * @param {Object} data.content - Document content
   * @param {string} data.xml_content - Generated XML
   * @param {boolean} data.is_valid - Validation status
   * @returns {Promise<Object>} - Result with success flag
   */
  saveDocument: (data) => ipcRenderer.invoke('document:save', data),

  /**
   * Load document by ID
   * @param {number} documentId - Document ID
   * @returns {Promise<Object>} - Result with success flag and document data
   */
  loadDocument: (documentId) => ipcRenderer.invoke('document:load', documentId),

  /**
   * List all documents
   * @returns {Promise<Object>} - Result with success flag and documents array
   */
  listDocuments: () => ipcRenderer.invoke('document:list'),

  /**
   * Delete document
   * @param {number} documentId - Document ID
   * @returns {Promise<Object>} - Result with success flag
   */
  deleteDocument: (documentId) => ipcRenderer.invoke('document:delete', documentId),

  // ==================== AUTOSAVE OPERATIONS ====================

  /**
   * Create autosave
   * @param {Object} data - Autosave data
   * @param {number} data.document_id - Document ID
   * @param {Object} data.content - Document content
   * @returns {Promise<Object>} - Result with success flag
   */
  autosaveDocument: (data) => ipcRenderer.invoke('document:autosave', data),

  // ==================== SETTINGS OPERATIONS ====================

  /**
   * Get setting value
   * @param {string} key - Setting key
   * @returns {Promise<Object>} - Result with success flag and value
   */
  getSetting: (key) => ipcRenderer.invoke('settings:get', key),

  /**
   * Set setting value
   * @param {string} key - Setting key
   * @param {string} value - Setting value
   * @returns {Promise<Object>} - Result with success flag
   */
  setSetting: (key, value) => ipcRenderer.invoke('settings:set', { key, value }),

  // ==================== DIALOG OPERATIONS ====================

  /**
   * Show save file dialog
   * @param {Object} options - Dialog options
   * @param {string} options.title - Dialog title
   * @param {string} options.defaultPath - Default file path
   * @param {Array} options.filters - File filters
   * @returns {Promise<Object>} - Result with file path
   */
  showSaveDialog: (options) => ipcRenderer.invoke('dialog:show-save', options),

  /**
   * Show open file dialog
   * @param {Object} options - Dialog options
   * @param {string} options.title - Dialog title
   * @param {Array} options.filters - File filters
   * @returns {Promise<Object>} - Result with file paths
   */
  showOpenDialog: (options) => ipcRenderer.invoke('dialog:show-open', options),

  // ==================== TEMPLATE OPERATIONS ====================

  /**
   * Create template
   * @param {Object} data - Template data
   * @param {string} data.name - Template name
   * @param {string} data.description - Template description
   * @param {string} data.schema_version - Schema version
   * @param {Object} data.content - Template content
   * @returns {Promise<Object>} - Result with success flag and template ID
   */
  createTemplate: (data) => ipcRenderer.invoke('template:create', data),

  /**
   * List templates
   * @returns {Promise<Object>} - Result with success flag and templates array
   */
  listTemplates: () => ipcRenderer.invoke('template:list'),

  /**
   * Save template (alias for createTemplate)
   * @param {Object} data - Template data
   * @returns {Promise<Object>} - Result with success flag and template data
   */
  saveTemplate: (data) => ipcRenderer.invoke('template:create', data),

  /**
   * Update template
   * @param {Object} data - Template data with id
   * @returns {Promise<Object>} - Result with success flag
   */
  updateTemplate: (data) => ipcRenderer.invoke('template:update', data),

  /**
   * Delete template
   * @param {number} templateId - Template ID
   * @returns {Promise<Object>} - Result with success flag
   */
  deleteTemplate: (templateId) => ipcRenderer.invoke('template:delete', templateId),

  // ==================== FILE OPERATIONS ====================

  /**
   * Write XML file to disk
   * @param {string} filePath - Target file path
   * @param {string} content - XML content to write
   * @returns {Promise<Object>} - Result with success flag
   */
  writeXMLFile: (filePath, content) => ipcRenderer.invoke('file:write-xml', { filePath, content }),

  // ==================== XML VALIDATION OPERATIONS ====================

  /**
   * Validate XML content against XSD schema
   * @param {string} xmlContent - XML content to validate
   * @param {string} schemaVersion - Schema version (e.g., '01.03', '01.04', '01.05')
   * @returns {Promise<Object>} - Result with validation status and errors
   */
  validateXML: (xmlContent, schemaVersion) => ipcRenderer.invoke('xml:validate', { xmlContent, schemaVersion }),

  // ==================== MODULE OPERATIONS ====================

  /**
   * List all modules
   * @param {Object} options - Query options
   * @param {string} options.type - Filter by type ('all', 'installed', 'available')
   * @param {string} options.category - Filter by category
   * @param {boolean} options.featured_only - Show only featured modules
   * @returns {Promise<Object>} - Result with success flag and modules array
   */
  listModules: (options) => ipcRenderer.invoke('module:list', options),

  /**
   * Get module by ID
   * @param {string} moduleId - Module ID
   * @returns {Promise<Object>} - Result with success flag and module data
   */
  getModule: (moduleId) => ipcRenderer.invoke('module:get', moduleId),

  /**
   * Install module
   * @param {string} moduleId - Module ID
   * @returns {Promise<Object>} - Result with success flag
   */
  installModule: (moduleId) => ipcRenderer.invoke('module:install', moduleId),

  /**
   * Uninstall module
   * @param {string} moduleId - Module ID
   * @returns {Promise<Object>} - Result with success flag
   */
  uninstallModule: (moduleId) => ipcRenderer.invoke('module:uninstall', moduleId),

  /**
   * Activate module
   * @param {string} moduleId - Module ID
   * @returns {Promise<Object>} - Result with success flag
   */
  activateModule: (moduleId) => ipcRenderer.invoke('module:activate', moduleId),

  /**
   * Deactivate module
   * @param {string} moduleId - Module ID
   * @returns {Promise<Object>} - Result with success flag
   */
  deactivateModule: (moduleId) => ipcRenderer.invoke('module:deactivate', moduleId),

  /**
   * Get module statistics
   * @returns {Promise<Object>} - Result with success flag and statistics
   */
  getModuleStatistics: () => ipcRenderer.invoke('module:statistics'),

  // ==================== MENU EVENT LISTENERS ====================

  /**
   * Listen for menu events from main process
   * @param {string} channel - Event channel
   * @param {Function} callback - Event callback
   */
  onMenuEvent: (channel, callback) => {
    const validChannels = [
      // Файл
      'menu:new-document',
      'menu:open-document',
      'menu:save-document',
      'menu:export-xml',
      // Шаблоны
      'menu:load-template',
      'menu:save-template',
      'menu:manage-templates',
      // Инструменты
      'menu:validate-xml',
      'menu:generate-pdf',
      'menu:version-history',
      'menu:import-xml',
      'menu:preview-document',
      // Модули
      'menu:manage-modules',
      'menu:install-module',
      'menu:update-modules',
      // Настройки
      'menu:settings-general',
      'menu:settings-paths',
      'menu:settings-autosave',
      'menu:settings-reset',
      // Справка
      'menu:help-docs',
      'menu:help-shortcuts',
      'menu:about'
    ];

    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },

  /**
   * Remove menu event listener
   * @param {string} channel - Event channel
   * @param {Function} callback - Event callback
   */
  removeMenuListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  }
});

/**
 * Log preload script initialization
 */
console.log('Preload script loaded successfully');
console.log('electronAPI exposed to renderer process');
