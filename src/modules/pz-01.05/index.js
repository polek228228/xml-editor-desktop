/**
 * @file index.js
 * @description Entry point for the Explanatory Note v01.05 module
 * @module modules/pz-01.05
 */

const BaseModule = require('../base-module');
const path = require('path');
const fs = require('fs-extra');

/**
 * Module for handling Explanatory Note v01.05 documents
 */
class ExplanatoryNoteModule extends BaseModule {
  constructor(metadata, api) {
    super(metadata, api);

    /**
     * Loaded JSON schema
     * @type {Object|null}
     */
    this.schema = null;

    /**
     * XML mapping rules
     * @type {Object|null}
     */
    this.xmlMapping = null;
  }

  /**
   * Activate the module
   * @override
   */
  async activate() {
    await super.activate();

    try {
      console.log(`[${this.metadata.name}] Activating module...`);

      // Load JSON schema
      await this._loadSchema();

      // Register document type with the system
      this._registerDocumentType();

      // Register custom form fields (if any)
      // this._registerFormFields();

      // Register commands (if any)
      // this._registerCommands();

      console.log(`[${this.metadata.name}] Module activated successfully`);
    } catch (error) {
      console.error(`[${this.metadata.name}] Failed to activate:`, error);
      throw error;
    }
  }

  /**
   * Deactivate the module
   * @override
   */
  async deactivate() {
    await super.deactivate();

    try {
      console.log(`[${this.metadata.name}] Deactivating module...`);

      // Unregister document type
      if (this.api) {
        this.api.unregisterDocumentType(this.metadata.id);
      }

      // Clear cached data
      this.schema = null;
      this.xmlMapping = null;

      console.log(`[${this.metadata.name}] Module deactivated successfully`);
    } catch (error) {
      console.error(`[${this.metadata.name}] Failed to deactivate:`, error);
      throw error;
    }
  }

  /**
   * Load JSON schema from file
   * @private
   */
  async _loadSchema() {
    if (!this.metadata.schema_path) {
      console.warn(`[${this.metadata.name}] No schema_path specified in metadata`);
      return;
    }

    const schemaPath = path.resolve(this.metadata.schema_path);

    if (!await fs.pathExists(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }

    try {
      const schemaContent = await fs.readFile(schemaPath, 'utf-8');
      this.schema = JSON.parse(schemaContent);

      // Extract XML mapping if present
      if (this.schema.xmlMapping) {
        this.xmlMapping = this.schema.xmlMapping;
        delete this.schema.xmlMapping; // Remove from schema object
      }

      console.log(`[${this.metadata.name}] Schema loaded successfully from ${schemaPath}`);
    } catch (error) {
      throw new Error(`Failed to load schema: ${error.message}`);
    }
  }

  /**
   * Register document type with Module API
   * @private
   */
  _registerDocumentType() {
    if (!this.api) {
      console.warn(`[${this.metadata.name}] No API available, cannot register document type`);
      return;
    }

    if (!this.schema) {
      throw new Error('Schema not loaded, cannot register document type');
    }

    const config = {
      name: this.metadata.name,
      schemaPath: this.metadata.schema_path,
      xmlMapping: this.xmlMapping || {},
      icon: this.metadata.icon || 'file-text'
    };

    this.api.registerDocumentType(this.metadata.id, config);

    console.log(`[${this.metadata.name}] Document type registered: ${this.metadata.id}`);
  }

  /**
   * Get JSON schema
   * @returns {Object|null} - JSON schema or null
   */
  getSchema() {
    return this.schema;
  }

  /**
   * Get XML mapping rules
   * @returns {Object|null} - XML mapping or null
   */
  getXMLMapping() {
    return this.xmlMapping;
  }

  /**
   * Validate document data against schema
   * @param {Object} data - Document data to validate
   * @returns {Object} - Validation result { valid: boolean, errors: Array }
   */
  validateData(data) {
    if (!this.schema) {
      return {
        valid: false,
        errors: ['Schema not loaded']
      };
    }

    // TODO: Implement JSON schema validation
    // For now, return basic validation
    const errors = [];

    if (!data) {
      errors.push('Data is empty');
    }

    // Check required fields from schema
    if (this.schema.required) {
      for (const field of this.schema.required) {
        if (!data[field]) {
          errors.push(`Required field missing: ${field}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = ExplanatoryNoteModule;