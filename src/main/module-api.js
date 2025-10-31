/**
 * @file module-api.js
 * @description Module API - Secure interface for modules to interact with the application
 * @module module-api
 */

const { EventEmitter } = require('events');

/**
 * ModuleAPI provides a secure, sandboxed interface for modules to interact with
 * the application without direct access to internal components.
 *
 * This API exposes:
 * - Document management (CRUD operations)
 * - Form schema registration
 * - XML generation and validation
 * - Event system (pub/sub)
 * - UI component registration
 * - Storage access (sandboxed)
 */
class ModuleAPI extends EventEmitter {
  /**
   * @param {XMLEditorApplication} app - Main application instance
   * @param {Object} permissions - Module permissions configuration
   */
  constructor(app, permissions = {}) {
    super();

    this.app = app;
    this.storage = app.storage;
    this.moduleRegistry = app.moduleRegistry;

    /**
     * Module permissions (sandboxing)
     * @type {Object}
     */
    this.permissions = {
      storage: permissions.storage !== false, // Default: true
      ui: permissions.ui !== false, // Default: true
      xml: permissions.xml !== false, // Default: true
      events: permissions.events !== false, // Default: true
      ...permissions
    };

    /**
     * Registered document types
     * @type {Map<string, Object>}
     */
    this.documentTypes = new Map();

    /**
     * Registered form fields
     * @type {Map<string, Function>}
     */
    this.formFields = new Map();

    /**
     * Registered commands
     * @type {Map<string, Function>}
     */
    this.commands = new Map();

    console.log('[ModuleAPI] Module API initialized with permissions:', this.permissions);
  }

  // ============================================
  // DOCUMENT TYPE REGISTRATION
  // ============================================

  /**
   * Register a new document type (e.g., "pz-01.05", "expertise-01.03")
   *
   * @param {string} typeId - Unique document type identifier
   * @param {Object} config - Document type configuration
   * @param {string} config.name - Display name
   * @param {string} config.schemaPath - Path to JSON schema file
   * @param {Object} config.xmlMapping - JSON-to-XML mapping rules
   * @param {string} [config.icon] - Icon name
   * @returns {boolean} - Success status
   *
   * @example
   * api.registerDocumentType('pz-01.05', {
   *   name: 'Пояснительная записка v01.05',
   *   schemaPath: 'schemas/json/pz-01.05-schema.json',
   *   xmlMapping: { ... },
   *   icon: 'file-text'
   * });
   */
  registerDocumentType(typeId, config) {
    this._checkPermission('ui');

    if (!typeId || !config || !config.name || !config.schemaPath) {
      throw new Error('Invalid document type configuration: typeId, name, and schemaPath are required');
    }

    if (this.documentTypes.has(typeId)) {
      console.warn(`[ModuleAPI] Document type already registered: ${typeId}, overwriting`);
    }

    this.documentTypes.set(typeId, {
      id: typeId,
      name: config.name,
      schemaPath: config.schemaPath,
      xmlMapping: config.xmlMapping || {},
      icon: config.icon || 'file-text',
      registeredAt: new Date().toISOString()
    });

    console.log(`[ModuleAPI] Registered document type: ${typeId} (${config.name})`);
    this.emit('documentType:registered', { typeId, config });

    return true;
  }

  /**
   * Unregister a document type
   * @param {string} typeId - Document type identifier
   * @returns {boolean} - Success status
   */
  unregisterDocumentType(typeId) {
    this._checkPermission('ui');

    if (!this.documentTypes.has(typeId)) {
      console.warn(`[ModuleAPI] Document type not found: ${typeId}`);
      return false;
    }

    this.documentTypes.delete(typeId);
    console.log(`[ModuleAPI] Unregistered document type: ${typeId}`);
    this.emit('documentType:unregistered', { typeId });

    return true;
  }

  /**
   * Get registered document type
   * @param {string} typeId - Document type identifier
   * @returns {Object|undefined} - Document type config or undefined
   */
  getDocumentType(typeId) {
    return this.documentTypes.get(typeId);
  }

  /**
   * List all registered document types
   * @returns {Array<Object>} - Array of document type configs
   */
  listDocumentTypes() {
    return Array.from(this.documentTypes.values());
  }

  // ============================================
  // FORM FIELD REGISTRATION
  // ============================================

  /**
   * Register a custom form field component
   *
   * @param {string} fieldType - Field type identifier (e.g., "richtext", "repeater")
   * @param {Function} renderFunction - Function that renders the field
   * @returns {boolean} - Success status
   *
   * @example
   * api.registerFormField('richtext', (fieldConfig, value) => {
   *   // Return HTML for the field
   *   return `<div class="richtext-field">...</div>`;
   * });
   */
  registerFormField(fieldType, renderFunction) {
    this._checkPermission('ui');

    if (!fieldType || typeof renderFunction !== 'function') {
      throw new Error('Invalid form field registration: fieldType and renderFunction are required');
    }

    if (this.formFields.has(fieldType)) {
      console.warn(`[ModuleAPI] Form field already registered: ${fieldType}, overwriting`);
    }

    this.formFields.set(fieldType, renderFunction);
    console.log(`[ModuleAPI] Registered form field: ${fieldType}`);
    this.emit('formField:registered', { fieldType });

    return true;
  }

  /**
   * Unregister a form field
   * @param {string} fieldType - Field type identifier
   * @returns {boolean} - Success status
   */
  unregisterFormField(fieldType) {
    this._checkPermission('ui');

    if (!this.formFields.has(fieldType)) {
      console.warn(`[ModuleAPI] Form field not found: ${fieldType}`);
      return false;
    }

    this.formFields.delete(fieldType);
    console.log(`[ModuleAPI] Unregistered form field: ${fieldType}`);
    this.emit('formField:unregistered', { fieldType });

    return true;
  }

  /**
   * Get form field renderer
   * @param {string} fieldType - Field type identifier
   * @returns {Function|undefined} - Render function or undefined
   */
  getFormField(fieldType) {
    return this.formFields.get(fieldType);
  }

  // ============================================
  // STORAGE OPERATIONS
  // ============================================

  /**
   * Create a new document
   * @param {Object} data - Document data
   * @param {string} data.title - Document title
   * @param {string} data.schema_version - Schema version
   * @param {Object} data.content - Document content
   * @returns {Promise<number>} - Document ID
   */
  async createDocument(data) {
    this._checkPermission('storage');
    return await this.storage.createDocument(data);
  }

  /**
   * Load a document by ID
   * @param {number} documentId - Document ID
   * @returns {Promise<Object|undefined>} - Document or undefined
   */
  async loadDocument(documentId) {
    this._checkPermission('storage');
    return await this.storage.getDocument(documentId);
  }

  /**
   * Save document changes
   * @param {number} documentId - Document ID
   * @param {Object} data - Updated document data
   * @returns {Promise<void>}
   */
  async saveDocument(documentId, data) {
    this._checkPermission('storage');
    return await this.storage.updateDocument(documentId, data);
  }

  /**
   * Delete a document
   * @param {number} documentId - Document ID
   * @returns {Promise<void>}
   */
  async deleteDocument(documentId) {
    this._checkPermission('storage');
    return await this.storage.deleteDocument(documentId);
  }

  /**
   * List all documents
   * @param {Object} [options] - Query options
   * @returns {Promise<Array<Object>>} - Array of documents
   */
  async listDocuments(options = {}) {
    this._checkPermission('storage');
    return await this.storage.listDocuments(options);
  }

  // ============================================
  // XML OPERATIONS
  // ============================================

  /**
   * Generate XML from document data
   * @param {Object} data - Document data
   * @param {string} schemaVersion - Schema version
   * @returns {Promise<string>} - Generated XML
   */
  async generateXML(data, schemaVersion) {
    this._checkPermission('xml');

    // TODO: Call XMLGenerator from renderer process via IPC
    // For now, this is a placeholder
    throw new Error('XML generation not yet implemented in Module API');
  }

  /**
   * Validate XML against XSD schema
   * @param {string} xml - XML content
   * @param {string} schemaPath - Path to XSD schema
   * @returns {Promise<Object>} - Validation result { valid, errors }
   */
  async validateXML(xml, schemaPath) {
    this._checkPermission('xml');

    // TODO: Call XSD validator
    // For now, this is a placeholder
    throw new Error('XML validation not yet implemented in Module API');
  }

  // ============================================
  // COMMAND REGISTRATION
  // ============================================

  /**
   * Register a command that can be invoked by the user
   *
   * @param {string} commandId - Unique command identifier
   * @param {Function} handler - Command handler function
   * @param {Object} [config] - Command configuration
   * @param {string} [config.label] - Display label
   * @param {string} [config.description] - Description
   * @param {string} [config.icon] - Icon name
   * @returns {boolean} - Success status
   *
   * @example
   * api.registerCommand('export:pdf', async (context) => {
   *   // Export document to PDF
   * }, {
   *   label: 'Export to PDF',
   *   description: 'Export document as PDF file',
   *   icon: 'file-pdf'
   * });
   */
  registerCommand(commandId, handler, config = {}) {
    this._checkPermission('ui');

    if (!commandId || typeof handler !== 'function') {
      throw new Error('Invalid command registration: commandId and handler are required');
    }

    if (this.commands.has(commandId)) {
      console.warn(`[ModuleAPI] Command already registered: ${commandId}, overwriting`);
    }

    this.commands.set(commandId, {
      id: commandId,
      handler,
      label: config.label || commandId,
      description: config.description || '',
      icon: config.icon || 'command',
      registeredAt: new Date().toISOString()
    });

    console.log(`[ModuleAPI] Registered command: ${commandId}`);
    this.emit('command:registered', { commandId, config });

    return true;
  }

  /**
   * Unregister a command
   * @param {string} commandId - Command identifier
   * @returns {boolean} - Success status
   */
  unregisterCommand(commandId) {
    this._checkPermission('ui');

    if (!this.commands.has(commandId)) {
      console.warn(`[ModuleAPI] Command not found: ${commandId}`);
      return false;
    }

    this.commands.delete(commandId);
    console.log(`[ModuleAPI] Unregistered command: ${commandId}`);
    this.emit('command:unregistered', { commandId });

    return true;
  }

  /**
   * Execute a command
   * @param {string} commandId - Command identifier
   * @param {Object} context - Command execution context
   * @returns {Promise<any>} - Command result
   */
  async executeCommand(commandId, context = {}) {
    const command = this.commands.get(commandId);

    if (!command) {
      throw new Error(`Command not found: ${commandId}`);
    }

    console.log(`[ModuleAPI] Executing command: ${commandId}`);
    return await command.handler(context);
  }

  /**
   * List all registered commands
   * @returns {Array<Object>} - Array of command configs
   */
  listCommands() {
    return Array.from(this.commands.values()).map(cmd => ({
      id: cmd.id,
      label: cmd.label,
      description: cmd.description,
      icon: cmd.icon
    }));
  }

  // ============================================
  // EVENT SYSTEM
  // ============================================

  /**
   * Subscribe to application events
   * Inherited from EventEmitter: on(), once(), off(), emit()
   *
   * Available events:
   * - document:created
   * - document:loaded
   * - document:saved
   * - document:deleted
   * - documentType:registered
   * - formField:registered
   * - command:registered
   *
   * @example
   * api.on('document:saved', (data) => {
   *   console.log('Document saved:', data.documentId);
   * });
   */

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Check if module has permission for an operation
   * @param {string} permission - Permission name
   * @private
   */
  _checkPermission(permission) {
    if (!this.permissions[permission]) {
      throw new Error(`Permission denied: ${permission}`);
    }
  }

  /**
   * Get module metadata
   * @param {string} moduleId - Module ID
   * @returns {Promise<Object|undefined>} - Module metadata
   */
  async getModuleMetadata(moduleId) {
    return await this.moduleRegistry.get(moduleId);
  }

  /**
   * Log message from module
   * @param {string} moduleId - Module ID
   * @param {string} level - Log level (info, warn, error)
   * @param {string} message - Log message
   */
  log(moduleId, level, message) {
    const prefix = `[Module:${moduleId}]`;

    switch (level) {
      case 'error':
        console.error(prefix, message);
        break;
      case 'warn':
        console.warn(prefix, message);
        break;
      default:
        console.log(prefix, message);
    }
  }
}

module.exports = ModuleAPI;
