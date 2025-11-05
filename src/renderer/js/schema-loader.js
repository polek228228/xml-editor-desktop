/**
 * @file schema-loader.js
 * @description Schema loader for JSON schemas
 * @module renderer/schema-loader
 */

/**
 * Schema loader class
 * Loads and parses JSON schemas for form generation
 */
class SchemaLoader {
  constructor() {
    /** @type {Object.<string, Object>} Cached schemas */
    this.schemas = {};

    /** @type {string} Base path for schemas */
    this.basePath = '../schemas/json';
  }

  /**
   * Load schema by version
   * @param {string} version - Schema version (e.g., '01.05')
   * @returns {Promise<Object>} - Loaded schema object
   */
  async loadSchema(version) {
    if (!version) {
      throw new Error('Schema version is required');
    }

    // Check cache first
    if (this.schemas[version]) {
      console.log(`Schema ${version} loaded from cache`);
      return this.schemas[version];
    }

    try {
      let schema;

      if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.loadSchemaFile === 'function') {
        schema = await window.electronAPI.loadSchemaFile(version);
      } else {
        schema = await this._fetchSchemaFallback(version);
      }

      this.validateSchemaStructure(schema);
      this.schemas[version] = schema;

      console.log(`Schema ${version} loaded successfully`);
      return schema;
    } catch (error) {
      console.error(`Error loading schema ${version}:`, error);
      throw error;
    }
  }

  /**
   * Fetch schema via fetch API (development fallback)
   * @private
   * @param {string} version
   * @returns {Promise<Object>}
   */
  async _fetchSchemaFallback(version) {
    const schemaPath = `${this.basePath}/pz-${version}-schema.json`;
    const response = await fetch(schemaPath);

    if (!response.ok) {
      throw new Error(`Failed to load schema: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Validate schema structure
   * @private
   * @param {Object} schema - Schema to validate
   * @throws {Error} If schema is invalid
   */
  validateSchemaStructure(schema) {
    if (!schema || typeof schema !== 'object') {
      throw new Error('Schema must be an object');
    }

    if (!schema.$schema) {
      throw new Error('Schema must have $schema property');
    }

    if (!schema.version) {
      throw new Error('Schema must have version property');
    }

    if (!schema.properties || typeof schema.properties !== 'object') {
      throw new Error('Schema must have properties object');
    }

    console.log(`Schema structure validated: version ${schema.version}`);
  }

  /**
   * Get all sections from schema
   * @param {Object} schema - Schema object
   * @returns {Array<Object>} - Array of section objects
   */
  getSections(schema) {
    if (!schema || !schema.properties) {
      return [];
    }

    const sections = [];

    for (const [key, value] of Object.entries(schema.properties)) {
      if (value.type === 'object') {
        sections.push({
          id: key,
          title: value.title || key,
          description: value.description || '',
          properties: value.properties || {},
          required: value.required || []
        });
      }
    }

    return sections;
  }

  /**
   * Get fields for a specific section
   * @param {Object} section - Section object
   * @returns {Array<Object>} - Array of field definitions
   */
  getFieldsForSection(section) {
    if (!section || !section.properties) {
      return [];
    }

    const fields = [];

    for (const [key, value] of Object.entries(section.properties)) {
      fields.push(this.parseFieldDefinition(key, value, section.required));
    }

    return fields;
  }

  /**
   * Parse field definition from schema
   * @private
   * @param {string} key - Field key
   * @param {Object} definition - Field definition from schema
   * @param {Array<string>} requiredFields - Array of required field names
   * @returns {Object} - Parsed field object
   */
  parseFieldDefinition(key, definition, requiredFields = []) {
    // Ensure requiredFields is an array
    const required = Array.isArray(requiredFields) ? requiredFields : [];

    const field = {
      id: key,
      name: key,
      label: definition.title || key,
      type: this.getFieldType(definition),
      value: definition.default || '',
      required: required.includes(key),
      validation: definition.validation || null,
      pattern: definition.pattern || null,
      format: definition.format || null,
      minLength: definition.minLength || null,
      maxLength: definition.maxLength || null,
      minimum: definition.minimum !== undefined ? definition.minimum : null,
      maximum: definition.maximum !== undefined ? definition.maximum : null,
      enum: definition.enum || null,
      properties: definition.properties || null,
      fieldType: definition.fieldType || null
    };

    return field;
  }

  /**
   * Determine field type from schema definition
   * @private
   * @param {Object} definition - Field definition
   * @returns {string} - Field type (text, number, email, select, etc.)
   */
  getFieldType(definition) {
    // Rich text fields
    if (definition.fieldType === 'richtext') {
      return 'richtext';
    }

    // Enum fields become select
    if (definition.enum && Array.isArray(definition.enum)) {
      return 'select';
    }

    // Object fields are nested
    if (definition.type === 'object') {
      return 'object';
    }

    // Boolean fields
    if (definition.type === 'boolean') {
      return 'checkbox';
    }

    // Email format
    if (definition.format === 'email') {
      return 'email';
    }

    // Number/integer fields
    if (definition.type === 'number' || definition.type === 'integer') {
      return 'number';
    }

    // Date fields
    if (definition.format === 'date') {
      return 'date';
    }

    // Textarea for long text
    if (definition.maxLength && definition.maxLength > 500) {
      return 'textarea';
    }

    // Default to text
    return 'text';
  }

  /**
   * Get required fields for schema
   * @param {Object} schema - Schema object
   * @returns {Array<string>} - Array of required field paths
   */
  getRequiredFields(schema) {
    const required = [];

    if (!schema || !schema.properties) {
      return required;
    }

    for (const [sectionKey, section] of Object.entries(schema.properties)) {
      if (section.required && Array.isArray(section.required)) {
        section.required.forEach(fieldKey => {
          required.push(`${sectionKey}.${fieldKey}`);
        });
      }

      // Check nested required fields
      if (section.properties) {
        for (const [fieldKey, field] of Object.entries(section.properties)) {
          if (field.type === 'object' && field.required) {
            field.required.forEach(nestedKey => {
              required.push(`${sectionKey}.${fieldKey}.${nestedKey}`);
            });
          }
        }
      }
    }

    return required;
  }

  /**
   * Get validation rules for field
   * @param {Object} field - Field definition
   * @returns {Object} - Validation rules object
   */
  getValidationRules(field) {
    const rules = {
      required: field.required || false,
      type: field.type,
      pattern: field.pattern || null,
      format: field.format || null,
      minLength: field.minLength || null,
      maxLength: field.maxLength || null,
      minimum: field.minimum !== null ? field.minimum : null,
      maximum: field.maximum !== null ? field.maximum : null,
      validation: field.validation || null
    };

    return rules;
  }

  /**
   * Clear schema cache
   * @param {string} [version] - Specific version to clear, or all if not specified
   */
  clearCache(version) {
    if (version) {
      delete this.schemas[version];
      console.log(`Schema cache cleared for version ${version}`);
    } else {
      this.schemas = {};
      console.log('All schema caches cleared');
    }
  }

  /**
   * Get available schema versions
   * @returns {Array<string>} - Array of available versions
   */
  getAvailableVersions() {
    return ['01.03', '01.04', '01.05'];
  }

  /**
   * Preload all schemas
   * @returns {Promise<void>}
   */
  async preloadAll() {
    const versions = this.getAvailableVersions();

    try {
      await Promise.all(
        versions.map(version => this.loadSchema(version))
      );
      console.log('All schemas preloaded successfully');
    } catch (error) {
      console.error('Error preloading schemas:', error);
    }
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SchemaLoader;
}
