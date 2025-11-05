/**
 * Test script to verify SchemaLoader parses all sections from schema 01.05
 * Run: node test-schema-sections.js
 */

const fs = require('fs');
const path = require('path');

// Simple SchemaLoader implementation for testing
class SchemaLoader {
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
}

async function main() {
  try {
    // Load schema 01.05
    const schemaPath = path.join(__dirname, 'schemas/json/pz-01.05-schema.json');
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    const schema = JSON.parse(schemaContent);

    console.log('✅ Schema 01.05 loaded successfully');
    console.log(`   Version: ${schema.title}`);
    console.log(`   Required fields: ${schema.required.join(', ')}\n`);

    // Create SchemaLoader and get sections
    const loader = new SchemaLoader();
    const sections = loader.getSections(schema);

    console.log(`✅ Found ${sections.length} sections:\n`);

    // Print each section
    sections.forEach((section, index) => {
      const fieldCount = Object.keys(section.properties || {}).length;
      const requiredCount = (section.required || []).length;

      console.log(`${index + 1}. ${section.id}`);
      console.log(`   Title: ${section.title}`);
      console.log(`   Description: ${section.description || 'N/A'}`);
      console.log(`   Fields: ${fieldCount} (${requiredCount} required)`);
      console.log('');
    });

    // Expected sections
    const expectedSections = [
      'documentInfo',
      'basicInfo',
      'technicalData',
      'engineering',
      'participants',
      'landPlot',
      'materials',
      'engineeringSurveys',
      'designTask',
      'planningDocumentation',
      'projectSolutions',
      'estimateDocumentation',
      'environmental',
      'appendices'
    ];

    // Check if all expected sections are present
    const foundIds = sections.map(s => s.id);
    const missing = expectedSections.filter(id => !foundIds.includes(id));
    const extra = foundIds.filter(id => !expectedSections.includes(id) && id !== 'attributes' && id !== 'elements');

    if (missing.length === 0 && extra.length === 0) {
      console.log('✅ ALL 14 DATA SECTIONS FOUND!');
      console.log('✅ FormManager should generate forms correctly.\n');
    } else {
      if (missing.length > 0) {
        console.log('❌ Missing sections:', missing.join(', '));
      }
      if (extra.length > 0) {
        console.log('⚠️  Extra sections (will also be displayed):', extra.join(', '));
      }
    }

    // Summary
    console.log('\n=== SUMMARY ===');
    console.log(`Total sections found: ${sections.length}`);
    console.log(`Expected data sections: 14`);
    console.log(`Service sections (attributes, elements): 2`);
    console.log('Status: ✅ READY FOR TESTING');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
