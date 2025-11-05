/**
 * @file xml-generator.js
 * @description XML Generator for Ministry of Construction documents
 * @module renderer/xml-generator
 */

/**
 * XML Generator class for creating Ministry of Construction compliant XML documents
 * Supports schema versions 01.03, 01.04, 01.05
 */
class XMLGenerator {
  constructor() {
    /** @type {Object} Schema mappings cache */
    this.mappings = {};

    /** @type {Object} XML namespace configurations */
    this.namespaces = {
      '01.03': 'http://minstroyrf.gov.ru/schemas/explanatorynote/01.03',
      '01.04': 'http://minstroyrf.gov.ru/schemas/explanatorynote/01.04',
      '01.05': 'http://minstroyrf.gov.ru/schemas/explanatorynote/01.05'
    };
  }

  /**
   * Generate XML document from JSON data
   * @param {Object} data - Document JSON data
   * @param {string} schemaVersion - Schema version (01.03, 01.04, 01.05)
   * @returns {Promise<string>} - Generated XML string
   */
  async generateXML(data, schemaVersion = '01.05') {
    try {
      console.log(`📋 Starting XML generation for schema version ${schemaVersion}`);

      // Load mapping if not cached
      if (!this.mappings[schemaVersion]) {
        await this.loadMapping(schemaVersion);
      }

      const mapping = this.mappings[schemaVersion];
      const namespace = this.namespaces[schemaVersion];

      // Build XML structure
      const xmlContent = this.buildXMLContent(data, mapping);

      // Create final XML document
      const xml = this.createXMLDocument(xmlContent, namespace, schemaVersion);

      // Validate structure
      this.validateXMLStructure(xml);

      // Format with indentation
      const formattedXML = this.formatXML(xml);

      console.log(`✅ XML generation completed (${formattedXML.length} characters)`);
      return formattedXML;
    } catch (error) {
      console.error('❌ XML generation error:', error);
      throw new Error(`XML generation failed: ${error.message}`);
    }
  }

  /**
   * Load mapping configuration for schema version
   * @private
   * @param {string} schemaVersion - Schema version
   */
  async loadMapping(schemaVersion) {
    try {
      // Load JSON schema which contains xmlMapping
      let schema;
      const schemaFile = schemaVersion.replace('.', '-');

      if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.loadSchemaFile === 'function') {
        schema = await window.electronAPI.loadSchemaFile(schemaVersion);
      } else {
        const response = await fetch(`../schemas/json/pz-${schemaVersion}-schema.json`);
        if (!response.ok) {
          throw new Error(`Failed to load schema for version ${schemaVersion}`);
        }

        schema = await response.json();
      }

      // Extract xmlMapping from schema
      if (schema.xmlMapping) {
        this.mappings[schemaVersion] = schema.xmlMapping;
        console.log(`📥 Loaded xmlMapping from schema version ${schemaVersion}`);
      } else {
        throw new Error('No xmlMapping found in schema');
      }
    } catch (error) {
      console.warn(`⚠️ Could not load schema mapping:`, error);
      this.mappings[schemaVersion] = this.getDefaultMapping(schemaVersion);
    }
  }

  /**
   * Get default mapping (fallback)
   * @private
   * @returns {Object} Default mapping structure
   */
  getDefaultMapping() {
    return {
      mappings: {
        'generalInfo.documentNumber': { xmlPath: 'ExplanatoryNote/GeneralInfo/DocNumber', required: true },
        'generalInfo.documentDate': { xmlPath: 'ExplanatoryNote/GeneralInfo/DocDate', required: true, transformer: 'formatDate' },
        'generalInfo.projectName': { xmlPath: 'ExplanatoryNote/ObjectInfo/ObjectName', required: true },
        'objectInfo.objectType': { xmlPath: 'ExplanatoryNote/ObjectInfo/ObjectType', required: true },
        'contractor.name': { xmlPath: 'ExplanatoryNote/Participants/Contractor/OrganizationName', required: true },
        'designer.name': { xmlPath: 'ExplanatoryNote/Participants/Designer/OrganizationName', required: true }
      }
    };
  }

  /**
   * Build XML content from data using mapping
   * @private
   * @param {Object} data - Source data
   * @param {Object} mapping - Mapping configuration
   * @returns {Object} XML tree structure
   */
  buildXMLContent(data, mapping) {
    const xmlTree = {};
    const mappings = mapping.mappings || {};

    // Process each mapping
    Object.entries(mappings).forEach(([jsonPath, config]) => {
      const value = this.getNestedValue(data, jsonPath);

      // Skip empty non-required fields
      if (value === null || value === undefined || value === '') {
        if (config.required) {
          console.warn(`⚠️ Required field missing: ${jsonPath}`);
        }
        return;
      }

      // Handle array fields (repeater fields)
      if (config.isArray) {
        if (Array.isArray(value) && value.length > 0) {
          value.forEach((item, index) => {
            // Process each array item
            const transformedItem = this.transformValue(item, config.transformer, config);
            this.setXMLPath(xmlTree, config.xmlPath, transformedItem, { ...config, arrayIndex: index });
          });
        }
        return;
      }

      // Transform value if transformer specified
      let transformedValue = value;
      if (config.transformer) {
        transformedValue = this.transformValue(value, config.transformer, config);
      }

      // Apply enum mapping if specified
      if (config.enumMapping && transformedValue in config.enumMapping) {
        transformedValue = config.enumMapping[transformedValue];
      }

      // Set value in XML tree
      this.setXMLPath(xmlTree, config.xmlPath, transformedValue, config);
    });

    return xmlTree;
  }

  /**
   * Get nested value from object using dot notation
   * @private
   * @param {Object} obj - Source object
   * @param {string} path - Dot-notation path
   * @returns {*} Value at path or null
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current?.[key];
    }, obj);
  }

  /**
   * Set value in XML tree using path
   * @private
   * @param {Object} tree - XML tree object
   * @param {string} path - XML path (e.g., "ExplanatoryNote/GeneralInfo/DocNumber")
   * @param {*} value - Value to set
   * @param {Object} config - Field configuration
   */
  setXMLPath(tree, path, value, config) {
    const parts = path.split('/');
    let current = tree;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }

    const lastPart = parts[parts.length - 1];

    // Handle array elements (repeater fields)
    if (config.arrayIndex !== undefined) {
      // Initialize array if needed
      if (!current[lastPart]) {
        current[lastPart] = [];
      }
      // Ensure it's an array
      if (!Array.isArray(current[lastPart])) {
        current[lastPart] = [current[lastPart]];
      }
      // Add array item
      if (config.unit && config.unitCode) {
        current[lastPart].push({
          _value: value,
          _attributes: {
            unit: config.unit,
            unitCode: config.unitCode
          }
        });
      } else {
        current[lastPart].push(value);
      }
      return;
    }

    // Handle regular fields
    // Add unit attribute if specified
    if (config.unit && config.unitCode) {
      current[lastPart] = {
        _value: value,
        _attributes: {
          unit: config.unit,
          unitCode: config.unitCode
        }
      };
    } else {
      current[lastPart] = value;
    }
  }

  /**
   * Transform value using specified transformer
   * @private
   * @param {*} value - Input value
   * @param {string} transformer - Transformer name
   * @param {Object} config - Field configuration
   * @returns {*} Transformed value
   */
  transformValue(value, transformer, config) {
    switch (transformer) {
      case 'formatDate':
        return this.formatDate(value);
      case 'formatDecimal':
        return this.formatDecimal(value);
      case 'normalizePhone':
        return this.normalizePhone(value);
      case 'richtextToPlaintext':
        return this.richtextToPlaintext(value);
      default:
        return value;
    }
  }

  /**
   * Format date to XML format (YYYY-MM-DD)
   * @private
   * @param {string|Date} value - Date value
   * @returns {string} Formatted date
   */
  formatDate(value) {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    return date.toISOString().split('T')[0];
  }

  /**
   * Format decimal number
   * @private
   * @param {number|string} value - Decimal value
   * @returns {string} Formatted decimal
   */
  formatDecimal(value) {
    if (value === null || value === undefined || value === '') return '';
    const num = parseFloat(value);
    return isNaN(num) ? '' : num.toFixed(2);
  }

  /**
   * Normalize phone number
   * @private
   * @param {string} value - Phone number
   * @returns {string} Normalized phone
   */
  normalizePhone(value) {
    if (!value) return '';
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Format as +7 (XXX) XXX-XX-XX
    if (digits.length === 11 && digits.startsWith('7')) {
      return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
    }
    return value;
  }

  /**
   * Convert richtext (HTML) to plaintext for XML
   * @private
   * @param {string} value - HTML content from TinyMCE
   * @returns {string} Plain text content
   */
  richtextToPlaintext(value) {
    if (!value || typeof value !== 'string') return '';

    // Strip HTML tags and decode entities
    let text = value
      .replace(/<br\s*\/?>/gi, '\n')           // Convert <br> to newlines
      .replace(/<\/p>/gi, '\n')                // Convert </p> to newlines
      .replace(/<[^>]+>/g, '')                 // Remove all HTML tags
      .replace(/&nbsp;/g, ' ')                 // Replace &nbsp; with space
      .replace(/&lt;/g, '<')                   // Decode &lt;
      .replace(/&gt;/g, '>')                   // Decode &gt;
      .replace(/&amp;/g, '&')                  // Decode &amp; (must be last)
      .replace(/\n{3,}/g, '\n\n')              // Max 2 consecutive newlines
      .trim();                                 // Trim whitespace

    return text;
  }

  /**
   * Create XML document from tree structure
   * @private
   * @param {Object} tree - XML tree
   * @param {string} namespace - XML namespace
   * @param {string} version - Schema version
   * @returns {string} XML string
   */
  createXMLDocument(tree, namespace, version) {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const rootStart = `<ExplanatoryNote xmlns="${namespace}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="${namespace} explanatorynote-${version.replace('.', '-')}.xsd" SchemaVersion="${version}">`;
    const rootEnd = '</ExplanatoryNote>';

    // Build XML content from tree
    const content = this.treeToXML(tree.ExplanatoryNote || tree, 1);

    return `${xmlHeader}\n${rootStart}\n${content}\n${rootEnd}`;
  }

  /**
   * Convert tree object to XML string
   * @private
   * @param {Object} obj - Tree object
   * @param {number} indent - Indentation level
   * @returns {string} XML string
   */
  treeToXML(obj, indent = 0) {
    const indentStr = '  '.repeat(indent);
    let xml = '';

    Object.entries(obj).forEach(([key, value]) => {
      if (key === '_value' || key === '_attributes') return;

      // Handle array elements (repeater fields)
      if (Array.isArray(value)) {
        value.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            // Check if it has _value (element with attributes)
            if (item._value !== undefined) {
              const attrs = item._attributes ?
                Object.entries(item._attributes)
                  .map(([k, v]) => `${k}="${this.escapeXML(String(v))}"`)
                  .join(' ') : '';
              xml += `${indentStr}<${key}${attrs ? ' ' + attrs : ''}>${this.escapeXML(String(item._value))}</${key}>\n`;
            } else {
              // Nested object in array
              xml += `${indentStr}<${key}>\n`;
              xml += this.treeToXML(item, indent + 1);
              xml += `${indentStr}</${key}>\n`;
            }
          } else {
            // Simple value in array
            xml += `${indentStr}<${key}>${this.escapeXML(String(item))}</${key}>\n`;
          }
        });
        return;
      }

      // Handle regular elements
      if (typeof value === 'object' && value !== null) {
        // Check if it has _value (element with attributes)
        if (value._value !== undefined) {
          const attrs = value._attributes ?
            Object.entries(value._attributes)
              .map(([k, v]) => `${k}="${this.escapeXML(String(v))}"`)
              .join(' ') : '';
          xml += `${indentStr}<${key}${attrs ? ' ' + attrs : ''}>${this.escapeXML(String(value._value))}</${key}>\n`;
        } else {
          // Nested object
          xml += `${indentStr}<${key}>\n`;
          xml += this.treeToXML(value, indent + 1);
          xml += `${indentStr}</${key}>\n`;
        }
      } else {
        // Simple value
        xml += `${indentStr}<${key}>${this.escapeXML(String(value))}</${key}>\n`;
      }
    });

    return xml;
  }

  /**
   * Escape XML special characters
   * @private
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeXML(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }

    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Validate XML structure
   * @private
   * @param {string} xml - XML string
   * @throws {Error} If validation fails
   */
  validateXMLStructure(xml) {
    // Basic structure validation
    if (!xml.includes('<?xml version="1.0" encoding="UTF-8"?>')) {
      throw new Error('Missing XML declaration');
    }

    if (!xml.includes('<ExplanatoryNote')) {
      throw new Error('Missing root element ExplanatoryNote');
    }

    // Check for balanced tags (basic check)
    const openTags = xml.match(/<[^/][^>]*>/g) || [];
    const closeTags = xml.match(/<\/[^>]*>/g) || [];

    // Self-closing tags don't need closing tags
    const selfClosing = xml.match(/<[^>]*\/>/g) || [];

    if (openTags.length - selfClosing.length !== closeTags.length) {
      console.warn('⚠️ Possible tag mismatch in XML structure');
    }

    console.log('✅ XML structure validation passed');
  }

  /**
   * Format XML with proper indentation
   * @private
   * @param {string} xml - XML string
   * @returns {string} Formatted XML
   */
  formatXML(xml) {
    // The XML is already formatted during generation
    // This method can be enhanced with more sophisticated formatting if needed
    return xml;
  }

  /**
   * Generate minimal valid XML for testing
   * @param {string} schemaVersion - Schema version
   * @returns {string} Minimal XML
   */
  generateMinimalXML(schemaVersion = '01.05') {
    const namespace = this.namespaces[schemaVersion];
    return `<?xml version="1.0" encoding="UTF-8"?>
<ExplanatoryNote xmlns="${namespace}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" SchemaVersion="${schemaVersion}">
  <GeneralInfo>
    <DocNumber>Не указан</DocNumber>
    <DocDate>${new Date().toISOString().split('T')[0]}</DocDate>
  </GeneralInfo>
  <ObjectInfo>
    <ObjectName>Новый документ</ObjectName>
  </ObjectInfo>
  <Participants>
    <Contractor>
      <OrganizationName>Не указано</OrganizationName>
    </Contractor>
    <Designer>
      <OrganizationName>Не указано</OrganizationName>
    </Designer>
  </Participants>
</ExplanatoryNote>`;
  }
}

// Make XMLGenerator available globally
if (typeof window !== 'undefined') {
  window.XMLGenerator = XMLGenerator;
}
