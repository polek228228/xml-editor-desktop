# Form System Documentation

## Overview

The Form System is a comprehensive solution for dynamically generating, validating, and managing forms in the XML Editor Desktop application. It supports Russian Ministry of Construction XML schemas (versions 01.03, 01.04, 01.05) with full validation and rich text editing capabilities.

**Implementation Date:** October 2025
**Version:** 1.0.0
**Status:** ✅ Completed (Week 2)

---

## Architecture

### Component Overview

```
Form System
├── JSON Schema (pz-01.05-schema.json)
│   └── 12 sections with field definitions
├── SchemaLoader (schema-loader.js)
│   └── Loads and parses JSON schemas
├── Validators (validators.js)
│   └── INN, OGRN, SNILS, cadastral, etc.
├── FormManager (form-manager.js)
│   └── Form generation, validation, data handling
└── RichTextEditor (rich-text-editor.js)
    └── TinyMCE wrapper for rich text fields
```

### Dependencies

- **TinyMCE 6**: Rich text editing (loaded via CDN)
- **Accordion Component**: Collapsible sections (Week 1)
- **InputField Component**: Basic input fields (Week 1)
- **Validators Module**: Field validation logic

---

## JSON Schema Structure

### Location
`/src/schemas/json/pz-01.05-schema.json`

### Schema Sections (12 total)

1. **generalInfo** - Общие сведения
2. **siteInfo** - Сведения о земельном участке
3. **climaticConditions** - Климатические условия
4. **architecturalSolutions** - Архитектурные решения
5. **constructiveSolutions** - Конструктивные решения
6. **engineeringSystems** - Инженерное оборудование
7. **fireProtection** - Пожарная безопасность
8. **accessibility** - Доступность для инвалидов
9. **energyEfficiency** - Энергоэффективность
10. **environmentalProtection** - Охрана окружающей среды
11. **technicalSolutions** - Технические решения
12. **economicIndicators** - Технико-экономические показатели

### Field Types Supported

| Type | HTML Element | Validation | Notes |
|------|-------------|------------|-------|
| `text` | `<input type="text">` | Pattern, length | Standard text input |
| `number` | `<input type="number">` | Min/max range | Integer or decimal |
| `email` | `<input type="email">` | Email format | RFC 5322 validation |
| `date` | `<input type="date">` | Date format | ISO 8601 format |
| `textarea` | `<textarea>` | Length | Multi-line text |
| `select` | `<select>` | Enum values | Dropdown selection |
| `checkbox` | `<input type="checkbox">` | Boolean | True/false values |
| `richtext` | TinyMCE editor | Length | Rich HTML content |
| `object` | Nested fields | Recursive | Grouped fields |

### Example Schema Section

```json
{
  "generalInfo": {
    "title": "1. Общие сведения",
    "type": "object",
    "required": ["projectName", "projectType", "customerInfo"],
    "properties": {
      "projectName": {
        "type": "string",
        "title": "Наименование объекта капитального строительства",
        "minLength": 1,
        "maxLength": 1000
      },
      "customerInfo": {
        "type": "object",
        "title": "Сведения о заказчике",
        "required": ["name", "inn"],
        "properties": {
          "inn": {
            "type": "string",
            "title": "ИНН",
            "pattern": "^[0-9]{10,12}$",
            "validation": "inn"
          }
        }
      }
    }
  }
}
```

---

## SchemaLoader Class

### Purpose
Loads and parses JSON schemas, extracting sections and field definitions for form generation.

### Location
`/src/renderer/js/schema-loader.js`

### Key Methods

#### `loadSchema(version)`
Loads a schema by version number.

```javascript
const loader = new SchemaLoader();
const schema = await loader.loadSchema('01.05');
```

**Parameters:**
- `version` (string): Schema version ('01.03', '01.04', '01.05')

**Returns:** Promise<Object> - Loaded schema

**Features:**
- Automatic caching
- Schema structure validation
- Error handling

#### `getSections(schema)`
Extracts all sections from a schema.

```javascript
const sections = loader.getSections(schema);
// Returns array of section objects with id, title, properties, required
```

#### `getFieldsForSection(section)`
Gets all fields for a specific section.

```javascript
const fields = loader.getFieldsForSection(section);
// Returns array of field definition objects
```

#### `parseFieldDefinition(key, definition, requiredFields)`
Parses a field definition from schema into a normalized field object.

**Field Object Structure:**
```javascript
{
  id: 'fieldId',
  name: 'fieldName',
  label: 'Field Label',
  type: 'text',
  value: '',
  required: false,
  validation: 'inn',
  pattern: '^[0-9]+$',
  minLength: 1,
  maxLength: 100,
  minimum: 0,
  maximum: 999,
  enum: ['option1', 'option2']
}
```

---

## Validators Module

### Purpose
Comprehensive validation functions for Russian-specific and standard field types.

### Location
`/src/renderer/js/validators.js`

### Supported Validators

#### 1. INN Validation
**10-digit (legal entities)** and **12-digit (individuals)** with checksum validation.

```javascript
Validators.inn('7707083893'); // null (valid)
Validators.inn('1234567890'); // Error message
```

**Algorithm:**
- 10-digit: Single checksum using coefficients [2,4,10,3,5,9,4,6,8]
- 12-digit: Two checksums with different coefficient sets

#### 2. OGRN Validation
**13-digit (legal entities)** and **15-digit (OGRNIP for entrepreneurs)**.

```javascript
Validators.ogrn('1027700132195'); // null (valid)
```

**Algorithm:**
- 13-digit: Base (first 12 digits) mod 11, checksum in 13th digit
- 15-digit: Base (first 14 digits) mod 13, checksum in 15th digit

#### 3. SNILS Validation
**11-digit** with checksum validation.

```javascript
Validators.snils('11223344595'); // null (valid)
```

**Format:** XXX-XXX-XXX YY (formatting optional)

**Algorithm:**
- Sum = Σ(digit[i] × (9-i)) for i=0 to 8
- Special rules for sum = 100 or 101
- Otherwise: checksum = sum mod 101

#### 4. Cadastral Number Validation
Format: **XX:XX:XXXXXXX:XXXX**

```javascript
Validators.cadastral('77:01:0001000:1234'); // null (valid)
```

#### 5. Standard Validators

| Validator | Purpose | Example |
|-----------|---------|---------|
| `required()` | Non-empty value | Any field |
| `email()` | Email format | `user@example.com` |
| `phone()` | Phone (10-15 digits) | `+79991234567` |
| `date()` | Valid date | `2025-10-02` |
| `numberRange()` | Min/max validation | `0-999` |
| `stringLength()` | Length validation | `1-100 chars` |
| `pattern()` | Regex validation | Custom patterns |

### Usage Examples

#### Single Validation
```javascript
const error = Validators.validate(value, 'inn');
if (error) {
  console.error(error); // "Неверная контрольная сумма ИНН"
}
```

#### Multiple Validations
```javascript
const rules = [
  { type: 'required' },
  { type: 'stringLength', options: { minLength: 10, maxLength: 12 } },
  { type: 'inn' }
];
const errors = Validators.validateMultiple(value, rules);
```

### Formatting Utilities

```javascript
// Format for display
Validators.formatSnils('11223344595'); // "112-233-445 95"
Validators.formatPhone('79991234567'); // "+7 (999) 123-45-67"
```

---

## FormManager Class

### Purpose
Core form generation and data management system. Converts JSON schemas into interactive forms with validation.

### Location
`/src/renderer/js/form-manager.js`

### Constructor

```javascript
const formManager = new FormManager({
  container: document.getElementById('editor-form'),
  schema: loadedSchema,
  data: existingData || {},
  onChange: (data) => {
    console.log('Form data changed:', data);
  }
});
```

**Options:**
- `container` (HTMLElement): Form container element
- `schema` (Object): JSON Schema object
- `data` (Object): Initial form data
- `onChange` (Function): Callback for data changes

### Key Methods

#### `generateFormFromSchema()`
Generates the complete form from the loaded schema.

```javascript
await formManager.generateFormFromSchema();
```

**Process:**
1. Clears existing form
2. Extracts sections from schema
3. Creates Accordion for each section
4. Generates fields within each section
5. Initializes TinyMCE editors for rich text fields

#### `attachValidation()`
Attaches validation event listeners to all form fields.

```javascript
formManager.attachValidation();
```

**Events Bound:**
- `input`: Real-time data updates
- `change`: Select/checkbox changes
- `blur`: Field validation trigger

#### `collectFormData()`
Collects all form data into a structured object.

```javascript
const data = formManager.collectFormData();
// Returns object matching schema structure
```

**Returns:**
```javascript
{
  generalInfo: {
    projectName: "...",
    customerInfo: {
      name: "...",
      inn: "7707083893"
    }
  },
  siteInfo: { ... },
  // ... other sections
}
```

#### `populateForm(data)`
Fills the form with existing data.

```javascript
formManager.populateForm(savedData);
```

**Features:**
- Handles nested objects
- Updates rich text editors
- Preserves field types (checkbox, number, etc.)

#### `validateForm()`
Validates all form fields.

```javascript
const isValid = formManager.validateForm();
if (!isValid) {
  const errors = formManager.getErrors();
  console.log('Validation errors:', errors);
}
```

**Returns:** `true` if all fields valid, `false` otherwise

#### `validateField(fieldId)`
Validates a single field.

```javascript
const isValid = formManager.validateField('generalInfo-projectName');
```

**Validation Rules Applied:**
1. Required check
2. Custom validation (INN, OGRN, etc.)
3. Pattern matching
4. Number range
5. String length

### Field Generation Methods

#### Nested Object Fields
```javascript
// Schema with nested object
{
  customerInfo: {
    type: "object",
    properties: {
      name: { type: "string" },
      inn: { type: "string", validation: "inn" }
    }
  }
}

// Generates grouped fields with visual container
```

#### Rich Text Fields
```javascript
// Schema with rich text
{
  description: {
    type: "string",
    fieldType: "richtext",
    maxLength: 5000
  }
}

// Generates TinyMCE editor
```

### Data Management

#### Internal Data Structure
Form data is stored as a nested object matching the schema structure:

```javascript
{
  sectionId: {
    fieldId: value,
    nestedObject: {
      nestedField: value
    }
  }
}
```

#### Path-based Access
Fields are accessed using dot notation paths:

```javascript
// Field ID: generalInfo-customerInfo-inn
// Data path: generalInfo.customerInfo.inn
const value = formManager.getFieldValue('generalInfo.customerInfo.inn');
```

---

## RichTextEditor Class

### Purpose
TinyMCE wrapper for rich text editing with Russian localization.

### Location
`/src/renderer/js/rich-text-editor.js`

### Constructor

```javascript
const editor = new RichTextEditor({
  element: textareaElement,
  onChange: (content) => {
    console.log('Content changed:', content);
  },
  config: {} // Optional TinyMCE config overrides
});

await editor.init();
```

### TinyMCE Configuration

#### Default Settings
```javascript
{
  language: 'ru',
  height: 300,
  min_height: 200,
  max_height: 600,
  menubar: false,

  toolbar: 'undo redo | blocks | bold italic underline | ' +
           'alignleft aligncenter alignright | bullist numlist',

  plugins: ['lists', 'link', 'autolink', 'autoresize',
            'searchreplace', 'wordcount'],

  block_formats: 'Параграф=p; Заголовок 1=h1; ...'
}
```

#### Content Styling
Custom CSS ensures consistent appearance:
- Font: System font stack
- Size: 14px base
- Line height: 1.6
- Proper heading hierarchy

### Key Methods

#### `getContent()`
Returns HTML content from editor.

```javascript
const html = editor.getContent();
```

#### `setContent(content)`
Sets HTML content in editor.

```javascript
editor.setContent('<p>Initial content</p>');
```

#### `getPlainText()`
Returns plain text (HTML stripped).

```javascript
const text = editor.getPlainText();
```

#### `getWordCount()` / `getCharacterCount()`
Get content statistics.

```javascript
const words = editor.getWordCount();
const chars = editor.getCharacterCount();
```

#### `disable()` / `enable()`
Toggle editor state.

```javascript
editor.disable(); // Read-only mode
editor.enable();  // Edit mode
```

#### `destroy()`
Cleanup and remove editor.

```javascript
editor.destroy();
```

### Static Methods

```javascript
// Check if TinyMCE is loaded
RichTextEditor.isLoaded(); // true/false

// Get TinyMCE version
RichTextEditor.getVersion(); // "6.0"

// Remove all editors
RichTextEditor.removeAll();
```

---

## Integration with XMLEditorApp

### App.js Integration Points

#### 1. Initialization
```javascript
class XMLEditorApp {
  constructor() {
    this.formManager = null;
    this.schemaLoader = new SchemaLoader();
  }
}
```

#### 2. Schema Change Handler
```javascript
async onSchemaVersionChange(version) {
  // Load schema
  const schema = await this.schemaLoader.loadSchema(version);

  // Destroy existing form
  if (this.formManager) {
    this.formManager.destroy();
  }

  // Create new form
  this.formManager = new FormManager({
    container: this.ui.editorForm,
    schema: schema,
    data: this.currentDocument.content || {},
    onChange: (data) => {
      this.currentDocument.content = data;
    }
  });

  // Generate and populate
  await this.formManager.generateFormFromSchema();
  this.formManager.attachValidation();

  if (this.currentDocument.content) {
    this.formManager.populateForm(this.currentDocument.content);
  }
}
```

#### 3. Save Document
```javascript
async saveDocument() {
  // Validate before save
  if (!this.formManager.validateForm()) {
    this.showToast('Исправьте ошибки в форме', 'warning');
    return;
  }

  // Collect data
  this.currentDocument.content = this.formManager.collectFormData();

  // Save to database
  await window.electronAPI.saveDocument({
    id: this.currentDocument.id,
    title: this.currentDocument.title,
    schema_version: this.currentDocument.schema_version,
    content: this.currentDocument.content
  });
}
```

---

## CSS Styling

### Form Field Groups
```css
.input-field__group {
  padding: var(--spacing-lg);
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius);
}

.input-field__group-title {
  font-weight: 600;
  border-bottom: 2px solid var(--color-primary);
}
```

### Rich Text Editor
```css
.input-field__richtext {
  margin-top: var(--spacing-sm);
}

.tox-tinymce {
  border-radius: var(--border-radius);
}

.tox .tox-toolbar {
  background-color: var(--color-bg) !important;
}
```

### Error States
```css
.input-field--error .input-field__input {
  border-color: var(--color-danger);
}

.input-field__error {
  color: var(--color-danger);
  font-size: var(--font-size-xs);
}
```

---

## Security Considerations

### Content Security Policy
Updated CSP to allow TinyMCE CDN:

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' https://cdn.tiny.cloud;
               style-src 'self' 'unsafe-inline' https://cdn.tiny.cloud;
               font-src 'self' https://cdn.tiny.cloud data:;
               img-src 'self' data: https://cdn.tiny.cloud;">
```

### XSS Prevention
- TinyMCE sanitizes HTML input
- Pattern validation prevents malicious patterns
- Entity encoding for special characters

### Data Validation
- Server-side validation required (not just client-side)
- INN/OGRN checksums prevent fake numbers
- Pattern matching catches format errors

---

## Performance Optimization

### Schema Caching
Schemas are cached after first load:
```javascript
if (this.schemas[version]) {
  return this.schemas[version]; // Return cached
}
```

### Lazy Editor Initialization
TinyMCE editors initialized only when sections are expanded.

### Debounced Updates
Form changes trigger `onChange` callback, suitable for debouncing:
```javascript
const debouncedSave = debounce(() => {
  this.saveDocument();
}, 1000);

onChange: (data) => {
  this.currentDocument.content = data;
  debouncedSave();
}
```

---

## Error Handling

### Schema Loading Errors
```javascript
try {
  const schema = await loader.loadSchema(version);
} catch (error) {
  console.error('Schema load failed:', error);
  // Show error UI
}
```

### Validation Errors
```javascript
const errors = formManager.getErrors();
// { 'generalInfo-inn': 'Неверная контрольная сумма ИНН' }
```

### TinyMCE Errors
```javascript
if (!RichTextEditor.isLoaded()) {
  console.error('TinyMCE not loaded');
  return;
}
```

---

## Testing Recommendations

### Unit Tests

#### Validators
```javascript
describe('INN Validator', () => {
  it('should validate 10-digit INN', () => {
    expect(Validators.inn('7707083893')).toBeNull();
    expect(Validators.inn('1234567890')).toBeTruthy();
  });
});
```

#### SchemaLoader
```javascript
describe('SchemaLoader', () => {
  it('should load schema', async () => {
    const schema = await loader.loadSchema('01.05');
    expect(schema.version).toBe('01.05');
  });
});
```

### Integration Tests

#### Form Generation
```javascript
it('should generate form from schema', async () => {
  const container = document.createElement('div');
  const fm = new FormManager({ container, schema });
  await fm.generateFormFromSchema();
  expect(container.children.length).toBeGreaterThan(0);
});
```

#### Data Collection
```javascript
it('should collect form data', () => {
  formManager.populateForm(testData);
  const collected = formManager.collectFormData();
  expect(collected).toEqual(testData);
});
```

### E2E Tests

1. Open application
2. Create new document
3. Select schema version
4. Fill form fields
5. Validate form
6. Save document
7. Reload document
8. Verify data preserved

---

## Known Limitations

### Current Version (1.0.0)

1. **TinyMCE CDN Dependency**
   - Requires internet connection for first load
   - **Future:** Bundle TinyMCE locally

2. **No Offline Russian Language**
   - Russian UI requires CDN access
   - **Future:** Bundle language pack

3. **Limited Custom Validation**
   - Only predefined validators
   - **Future:** Schema-level custom validators

4. **No Field Dependencies**
   - Can't hide/show fields based on other values
   - **Future:** Conditional field rendering

5. **No Autocomplete**
   - No suggestions for common values
   - **Future:** Autocomplete for frequently used data

---

## Future Enhancements

### Phase 1 (Next Sprint)
- [ ] Bundle TinyMCE locally
- [ ] Add field-level help tooltips
- [ ] Implement field dependencies
- [ ] Add autocomplete for common fields

### Phase 2
- [ ] Custom validation functions in schema
- [ ] Multi-file upload support
- [ ] Image embedding in rich text
- [ ] Form templates library

### Phase 3
- [ ] Collaborative editing
- [ ] Version comparison
- [ ] Import from other formats
- [ ] Advanced reporting

---

## Troubleshooting

### TinyMCE Not Loading
**Problem:** Rich text fields show as plain textareas

**Solutions:**
1. Check internet connection
2. Verify CSP allows cdn.tiny.cloud
3. Check browser console for errors
4. Ensure TinyMCE script loaded before form-manager.js

### Validation Not Working
**Problem:** Invalid data passes validation

**Solutions:**
1. Verify `attachValidation()` called after form generation
2. Check field has `data-validation` attribute
3. Ensure Validators module loaded
4. Check browser console for errors

### Form Data Not Saving
**Problem:** Changes lost after reload

**Solutions:**
1. Verify `onChange` callback updating `currentDocument.content`
2. Check `collectFormData()` returns correct structure
3. Ensure database save successful
4. Verify autosave interval running

### Schema Load Failure
**Problem:** Form doesn't generate

**Solutions:**
1. Verify schema file exists at correct path
2. Check schema JSON is valid
3. Ensure schema has required properties ($schema, version, properties)
4. Check network tab for 404 errors

---

## API Reference Summary

### SchemaLoader
| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `loadSchema()` | version | Promise<Object> | Load schema by version |
| `getSections()` | schema | Array | Get all sections |
| `getFieldsForSection()` | section | Array | Get section fields |
| `clearCache()` | version? | void | Clear schema cache |

### Validators
| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `inn()` | value | string\|null | Validate INN |
| `ogrn()` | value | string\|null | Validate OGRN |
| `snils()` | value | string\|null | Validate SNILS |
| `cadastral()` | value | string\|null | Validate cadastral |
| `email()` | value | string\|null | Validate email |
| `validate()` | value, type, options | string\|null | Generic validator |

### FormManager
| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `generateFormFromSchema()` | - | Promise<void> | Generate form |
| `attachValidation()` | - | void | Attach validators |
| `collectFormData()` | - | Object | Collect form data |
| `populateForm()` | data | void | Fill form |
| `validateForm()` | - | boolean | Validate all fields |
| `validateField()` | fieldId | boolean | Validate one field |
| `destroy()` | - | void | Cleanup |

### RichTextEditor
| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `init()` | - | Promise<void> | Initialize editor |
| `getContent()` | - | string | Get HTML content |
| `setContent()` | content | void | Set content |
| `getPlainText()` | - | string | Get plain text |
| `destroy()` | - | void | Destroy editor |

---

## Changelog

### v1.0.0 (2025-10-02)
- ✅ Initial implementation
- ✅ JSON Schema for PZ 01.05 (12 sections)
- ✅ SchemaLoader with caching
- ✅ Comprehensive validators (INN, OGRN, SNILS, cadastral)
- ✅ FormManager with dynamic generation
- ✅ RichTextEditor (TinyMCE wrapper)
- ✅ Integration with XMLEditorApp
- ✅ CSS styling and theming
- ✅ Documentation

---

## Support

For issues or questions:
1. Check this documentation
2. Review code comments
3. Check browser console for errors
4. Verify all dependencies loaded
5. Test with minimal example

---

**Document Version:** 1.0.0
**Last Updated:** 2025-10-02
**Author:** XML Editor Desktop Team
