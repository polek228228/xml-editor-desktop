/**
 * @file xml-validator.js
 * @description XML validator for validating XML against Ministry XSD schemas
 * @module XMLValidator
 */

const libxmljs = require('libxmljs2');
const fs = require('fs');
const path = require('path');

/**
 * XML Validator class for validating generated XML against XSD schemas
 * Supports Ministry of Construction schemas (versions 01.03, 01.04, 01.05)
 */
class XMLValidator {
  constructor() {
    /** @type {Map<string, string>} Cache for loaded XSD schemas */
    this.schemaCache = new Map();

    /** @type {string} Base path for schema files */
    this.schemasPath = path.join(__dirname, '../schemas/ministry');

    console.log('[XMLValidator] Initialized with schemas path:', this.schemasPath);
  }

  /**
   * Get schema file path for a given schema version
   * @param {string} schemaVersion - Schema version (e.g., '01.03', '01.04', '01.05')
   * @returns {string} Full path to XSD schema file
   * @throws {Error} If schema version is not supported
   * @private
   */
  getSchemaPath(schemaVersion) {
    const schemaMap = {
      '01.03': path.join(this.schemasPath, 'expertise-01.03/conclusion-01-03.xsd'),
      '01.04': path.join(this.schemasPath, 'pz-01.05/explanatorynote-01-05.xsd'), // Use 01.05 for 01.04
      '01.05': path.join(this.schemasPath, 'pz-01.05/explanatorynote-01-05.xsd')
    };

    const schemaPath = schemaMap[schemaVersion];

    if (!schemaPath) {
      throw new Error(`Unsupported schema version: ${schemaVersion}. Supported versions: 01.03, 01.04, 01.05`);
    }

    console.log(`[XMLValidator] Schema path for version ${schemaVersion}:`, schemaPath);
    return schemaPath;
  }

  /**
   * Load XSD schema from file
   * Uses caching to avoid re-reading the same schema
   * @param {string} schemaVersion - Schema version
   * @returns {string} XSD schema content
   * @throws {Error} If schema file cannot be read
   * @private
   */
  loadSchema(schemaVersion) {
    // Check cache first
    if (this.schemaCache.has(schemaVersion)) {
      console.log(`[XMLValidator] Using cached schema for version ${schemaVersion}`);
      return this.schemaCache.get(schemaVersion);
    }

    const schemaPath = this.getSchemaPath(schemaVersion);

    // Verify schema file exists
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }

    console.log(`[XMLValidator] Loading schema from file: ${schemaPath}`);

    try {
      const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

      // Cache the schema
      this.schemaCache.set(schemaVersion, schemaContent);

      console.log(`[XMLValidator] Schema loaded successfully (${schemaContent.length} bytes)`);
      return schemaContent;
    } catch (error) {
      throw new Error(`Failed to load schema file ${schemaPath}: ${error.message}`);
    }
  }

  /**
   * Validate XML content against XSD schema
   * @param {string} xmlContent - XML content to validate
   * @param {string} schemaVersion - Schema version (e.g., '01.03', '01.04', '01.05')
   * @returns {Object} Validation result
   * @returns {boolean} result.valid - Whether the XML is valid
   * @returns {Array<Object>} result.errors - Array of validation errors
   * @returns {string} result.schemaVersion - Schema version used for validation
   */
  validateXML(xmlContent, schemaVersion) {
    console.log(`[XMLValidator] Starting validation for schema version: ${schemaVersion}`);
    console.log(`[XMLValidator] XML content length: ${xmlContent?.length || 0} bytes`);

    // Input validation
    if (!xmlContent || typeof xmlContent !== 'string') {
      return {
        valid: false,
        errors: [{
          type: 'input_error',
          message: 'XML content is required and must be a string',
          line: null,
          column: null
        }],
        schemaVersion
      };
    }

    if (!schemaVersion || typeof schemaVersion !== 'string') {
      return {
        valid: false,
        errors: [{
          type: 'input_error',
          message: 'Schema version is required and must be a string',
          line: null,
          column: null
        }],
        schemaVersion: null
      };
    }

    try {
      // Load XSD schema
      const schemaContent = this.loadSchema(schemaVersion);

      // Parse XSD schema
      console.log('[XMLValidator] Parsing XSD schema...');
      let xsdDoc;
      try {
        xsdDoc = libxmljs.parseXml(schemaContent);
      } catch (error) {
        console.error('[XMLValidator] XSD schema parsing error:', error);
        return {
          valid: false,
          errors: [{
            type: 'schema_error',
            message: `Failed to parse XSD schema: ${error.message}`,
            line: error.line || null,
            column: error.column || null
          }],
          schemaVersion
        };
      }

      // Parse XML document
      console.log('[XMLValidator] Parsing XML document...');
      let xmlDoc;
      try {
        xmlDoc = libxmljs.parseXml(xmlContent);
      } catch (error) {
        console.error('[XMLValidator] XML parsing error:', error);
        return {
          valid: false,
          errors: [{
            type: 'xml_parse_error',
            message: `Failed to parse XML: ${error.message}`,
            line: error.line || null,
            column: error.column || null
          }],
          schemaVersion
        };
      }

      // Validate XML against XSD
      console.log('[XMLValidator] Validating XML against XSD schema...');
      const isValid = xmlDoc.validate(xsdDoc);

      if (isValid) {
        console.log('[XMLValidator] Validation successful - XML is valid');
        return {
          valid: true,
          errors: [],
          schemaVersion
        };
      } else {
        // Collect validation errors
        const validationErrors = xmlDoc.validationErrors.map(err => ({
          type: 'validation_error',
          message: err.message || 'Unknown validation error',
          line: err.line || null,
          column: err.column || null,
          level: err.level || 'error'
        }));

        console.error('[XMLValidator] Validation failed with errors:', validationErrors.length);
        validationErrors.forEach((err, idx) => {
          console.error(`  Error ${idx + 1}:`, err.message);
        });

        return {
          valid: false,
          errors: validationErrors,
          schemaVersion
        };
      }

    } catch (error) {
      console.error('[XMLValidator] Validation error:', error);

      return {
        valid: false,
        errors: [{
          type: 'validator_error',
          message: `Validation process failed: ${error.message}`,
          line: null,
          column: null,
          stack: error.stack
        }],
        schemaVersion
      };
    }
  }

  /**
   * Clear schema cache (useful for testing or reloading schemas)
   */
  clearCache() {
    console.log('[XMLValidator] Clearing schema cache');
    this.schemaCache.clear();
  }
}

// Export singleton instance
module.exports = new XMLValidator();
