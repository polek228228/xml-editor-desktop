const SchemaLoader = require('../src/renderer/js/schema-loader.js');

const createSampleSchema = () => ({
  $schema: 'http://json-schema.org/draft-07/schema#',
  version: '01.05',
  properties: {
    generalInfo: {
      type: 'object',
      title: 'General Info',
      required: ['docNumber', 'docDate'],
      properties: {
        docNumber: {
          type: 'string',
          title: 'Doc Number'
        },
        docDate: {
          type: 'string',
          format: 'date',
          title: 'Doc Date'
        },
        projectDescription: {
          type: 'string',
          maxLength: 1000,
          title: 'Description'
        },
        contractor: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string'
            },
            inn: {
              type: 'string',
              pattern: '^\\\d{10}$'
            }
          }
        }
      }
    },
    technicalData: {
      type: 'object',
      required: ['totalArea'],
      properties: {
        totalArea: {
          type: 'number',
          minimum: 0
        },
        functionsClass: {
          enum: ['Жилое', 'Производственное']
        }
      }
    }
  }
});

describe('SchemaLoader', () => {
  let loader;
  let sampleSchema;

  beforeEach(() => {
    jest.resetModules();
    loader = new SchemaLoader();
    sampleSchema = createSampleSchema();
  });

  afterEach(() => {
    delete global.window;
  });

  test('loadSchema should use electron API when available and cache result', async () => {
    const electronAPI = {
      loadSchemaFile: jest.fn().mockResolvedValue(sampleSchema)
    };

    global.window = { electronAPI };

    const first = await loader.loadSchema('01.05');
    const second = await loader.loadSchema('01.05');

    expect(first).toEqual(sampleSchema);
    expect(second).toEqual(sampleSchema);
    expect(electronAPI.loadSchemaFile).toHaveBeenCalledTimes(1);
  });

  test('loadSchema should fallback to fetch when electron API not present', async () => {
    const response = {
      ok: true,
      json: jest.fn().mockResolvedValue(sampleSchema)
    };

    global.fetch.mockResolvedValue(response);

    const schema = await loader.loadSchema('01.05');

    expect(schema.version).toBe('01.05');
    expect(global.fetch).toHaveBeenCalledWith('../schemas/json/pz-01.05-schema.json');
  });

  test('validateSchemaStructure should throw on invalid schema', () => {
    expect(() => loader.validateSchemaStructure(null)).toThrow('Schema must be an object');
    expect(() => loader.validateSchemaStructure({ $schema: true })).toThrow('Schema must have version property');
    expect(() => loader.validateSchemaStructure({ $schema: true, version: '01.05' })).toThrow('Schema must have properties object');
  });

  test('getSections should return section metadata', () => {
    const sections = loader.getSections(sampleSchema);

    expect(sections).toHaveLength(2);
    expect(sections[0]).toMatchObject({ id: 'generalInfo', title: 'General Info' });
    expect(sections[1].required).toEqual(['totalArea']);
  });

  test('getFieldsForSection should parse field definitions with required info', () => {
    const sections = loader.getSections(sampleSchema);
    const generalInfoSection = sections[0];

    const fields = loader.getFieldsForSection(generalInfoSection);

    const fieldIds = fields.map(field => field.id);
    expect(fieldIds).toEqual(['docNumber', 'docDate', 'projectDescription', 'contractor']);

    const docDateField = fields.find(field => field.id === 'docDate');
    expect(docDateField.type).toBe('date');
    expect(docDateField.required).toBe(true);

    const contractorField = fields.find(field => field.id === 'contractor');
    expect(contractorField.type).toBe('object');
  });

  test('getRequiredFields should flatten nested required paths', () => {
    const requiredFields = loader.getRequiredFields(sampleSchema);

    expect(requiredFields).toContain('generalInfo.docNumber');
    expect(requiredFields).toContain('generalInfo.contractor.name');
    expect(requiredFields).toContain('technicalData.totalArea');
  });

  test('getFieldType should map schema definition to UI field type', () => {
    expect(loader.getFieldType({ fieldType: 'richtext' })).toBe('richtext');
    expect(loader.getFieldType({ enum: ['A', 'B'] })).toBe('select');
    expect(loader.getFieldType({ type: 'boolean' })).toBe('checkbox');
    expect(loader.getFieldType({ type: 'number' })).toBe('number');
    expect(loader.getFieldType({ format: 'email' })).toBe('email');
    expect(loader.getFieldType({ format: 'date' })).toBe('date');
    expect(loader.getFieldType({ maxLength: 600 })).toBe('textarea');
    expect(loader.getFieldType({})).toBe('text');
  });

  test('clearCache should invalidate cached schemas', async () => {
    global.window = {
      electronAPI: {
        loadSchemaFile: jest.fn().mockResolvedValue(sampleSchema)
      }
    };

    await loader.loadSchema('01.05');
    loader.clearCache('01.05');

    expect(loader.schemas['01.05']).toBeUndefined();
  });
});
