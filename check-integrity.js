#!/usr/bin/env node

/**
 * @file check-integrity.js
 * @description Integrity checker for XML Editor Desktop
 * Validates all files and configurations
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function pass(message) {
  passedTests++;
  totalTests++;
  log(`✅ ${message}`, 'green');
}

function fail(message) {
  failedTests++;
  totalTests++;
  log(`❌ ${message}`, 'red');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function header(message) {
  log(`\n${'='.repeat(60)}`, 'yellow');
  log(`  ${message}`, 'yellow');
  log(`${'='.repeat(60)}`, 'yellow');
}

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    pass(`${description} exists`);
    return true;
  } else {
    fail(`${description} is MISSING: ${filePath}`);
    return false;
  }
}

function checkJSONValid(filePath, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
    pass(`${description} is valid JSON`);
    return true;
  } catch (error) {
    fail(`${description} has invalid JSON: ${error.message}`);
    return false;
  }
}

function checkJSValid(filePath, description) {
  try {
    const { execSync } = require('child_process');
    execSync(`node --check "${filePath}"`, { stdio: 'pipe' });
    pass(`${description} has valid syntax`);
    return true;
  } catch (error) {
    fail(`${description} has syntax errors`);
    return false;
  }
}

// ==================== MAIN CHECKS ====================

header('XML EDITOR DESKTOP - INTEGRITY CHECK');
info('Starting integrity verification...\n');

// 1. Check main files
header('1. CORE FILES CHECK');

const coreFiles = [
  { path: 'package.json', desc: 'package.json' },
  { path: 'src/main/main.js', desc: 'Main process' },
  { path: 'src/preload/preload.js', desc: 'Preload script' },
  { path: 'src/renderer/index.html', desc: 'Main HTML' },
  { path: 'src/renderer/css/main.css', desc: 'Main CSS' }
];

coreFiles.forEach(file => {
  checkFileExists(file.path, file.desc);
});

// 2. Check renderer JavaScript files
header('2. RENDERER JAVASCRIPT FILES');

const jsFiles = [
  { path: 'src/renderer/js/app.js', desc: 'XMLEditorApp' },
  { path: 'src/renderer/js/form-manager.js', desc: 'FormManager' },
  { path: 'src/renderer/js/schema-loader.js', desc: 'SchemaLoader' },
  { path: 'src/renderer/js/xml-generator.js', desc: 'XMLGenerator' },
  { path: 'src/renderer/js/validators.js', desc: 'Validators' },
  { path: 'src/renderer/js/rich-text-editor.js', desc: 'RichTextEditor' },
  { path: 'src/renderer/js/components/accordion.js', desc: 'Accordion component' },
  { path: 'src/renderer/js/components/input-field.js', desc: 'InputField component' },
  { path: 'src/renderer/js/components/document-selector.js', desc: 'DocumentSelector component' }
];

jsFiles.forEach(file => {
  if (checkFileExists(file.path, file.desc)) {
    checkJSValid(file.path, file.desc);
  }
});

// 3. Check JSON schema files
header('3. JSON SCHEMA FILES');

const schemaFiles = [
  { path: 'src/schemas/json/pz-01.03-schema.json', desc: 'Schema v01.03', version: '01.03' },
  { path: 'src/schemas/json/pz-01.04-schema.json', desc: 'Schema v01.04', version: '01.04' },
  { path: 'src/schemas/json/pz-01.05-schema.json', desc: 'Schema v01.05', version: '01.05' }
];

schemaFiles.forEach(file => {
  if (checkFileExists(file.path, file.desc)) {
    if (checkJSONValid(file.path, file.desc)) {
      // Check version property
      const schema = JSON.parse(fs.readFileSync(file.path, 'utf8'));
      if (schema.version === file.version) {
        pass(`${file.desc} has correct version property`);
      } else {
        fail(`${file.desc} version mismatch: expected ${file.version}, got ${schema.version}`);
      }
    }
  }
});

// 4. Check mapping files
header('4. XML MAPPING FILES');

const mappingFiles = [
  { path: 'src/schemas/mappings/explanatory-note-01.03-mapping.json', desc: 'Mapping v01.03', version: '01.03' },
  { path: 'src/schemas/mappings/explanatory-note-01.04-mapping.json', desc: 'Mapping v01.04', version: '01.04' },
  { path: 'src/schemas/mappings/explanatory-note-01.05-mapping.json', desc: 'Mapping v01.05', version: '01.05' }
];

mappingFiles.forEach(file => {
  if (checkFileExists(file.path, file.desc)) {
    if (checkJSONValid(file.path, file.desc)) {
      // Check version property
      const mapping = JSON.parse(fs.readFileSync(file.path, 'utf8'));
      if (mapping.version === file.version) {
        pass(`${file.desc} has correct version property`);
      } else {
        fail(`${file.desc} version mismatch: expected ${file.version}, got ${mapping.version}`);
      }

      // Check mappings property
      if (mapping.mappings && typeof mapping.mappings === 'object') {
        pass(`${file.desc} has mappings object`);
      } else {
        fail(`${file.desc} missing mappings object`);
      }
    }
  }
});

// 5. Check critical paths in xml-generator.js
header('5. CRITICAL CODE CHECKS');

const xmlGeneratorPath = 'src/renderer/js/xml-generator.js';
if (fs.existsSync(xmlGeneratorPath)) {
  const content = fs.readFileSync(xmlGeneratorPath, 'utf8');

  // Check for correct fetch path (should start with ./ not /)
  if (content.includes('fetch(`./src/schemas/mappings/')) {
    pass('xml-generator.js uses correct relative path for fetch');
  } else if (content.includes('fetch(`/src/schemas/mappings/')) {
    fail('xml-generator.js uses INCORRECT absolute path (should be ./src/...)');
  } else {
    fail('xml-generator.js fetch path not found or has different format');
  }

  // Check for XMLGenerator class
  if (content.includes('class XMLGenerator')) {
    pass('XMLGenerator class is defined');
  } else {
    fail('XMLGenerator class is NOT defined');
  }

  // Check for generateXML method
  if (content.includes('async generateXML(')) {
    pass('generateXML method is defined');
  } else {
    fail('generateXML method is NOT defined');
  }
}

// 6. Check IPC handlers in main.js
header('6. IPC HANDLERS CHECK');

const mainJsPath = 'src/main/main.js';
if (fs.existsSync(mainJsPath)) {
  const content = fs.readFileSync(mainJsPath, 'utf8');

  const requiredHandlers = [
    'document:create',
    'document:save',
    'document:load',
    'document:list',
    'document:delete',
    'document:autosave',
    'settings:get',
    'settings:set',
    'dialog:show-save',
    'dialog:show-open',
    'template:create',
    'template:list',
    'template:delete',
    'file:write-xml'
  ];

  requiredHandlers.forEach(handler => {
    if (content.includes(`ipcMain.handle('${handler}'`)) {
      pass(`IPC handler '${handler}' is registered`);
    } else {
      fail(`IPC handler '${handler}' is MISSING`);
    }
  });
}

// 7. Check preload API exposure
header('7. PRELOAD API CHECK');

const preloadPath = 'src/preload/preload.js';
if (fs.existsSync(preloadPath)) {
  const content = fs.readFileSync(preloadPath, 'utf8');

  if (content.includes('contextBridge.exposeInMainWorld(\'electronAPI\'')) {
    pass('electronAPI is exposed to renderer');
  } else {
    fail('electronAPI is NOT exposed to renderer');
  }

  const apiMethods = [
    'createDocument',
    'saveDocument',
    'loadDocument',
    'listDocuments',
    'deleteDocument',
    'autosaveDocument',
    'getSetting',
    'setSetting',
    'showSaveDialog',
    'showOpenDialog',
    'createTemplate',
    'listTemplates',
    'deleteTemplate',
    'writeXMLFile'
  ];

  apiMethods.forEach(method => {
    if (content.includes(`${method}:`)) {
      pass(`API method '${method}' is exposed`);
    } else {
      fail(`API method '${method}' is MISSING`);
    }
  });
}

// 8. Check HTML script loading order
header('8. HTML SCRIPT LOADING ORDER');

const htmlPath = 'src/renderer/index.html';
if (fs.existsSync(htmlPath)) {
  const content = fs.readFileSync(htmlPath, 'utf8');

  const scriptOrder = [
    'accordion.js',
    'input-field.js',
    'document-selector.js',
    'validators.js',
    'schema-loader.js',
    'rich-text-editor.js',
    'form-manager.js',
    'xml-generator.js',
    'app.js'
  ];

  let lastIndex = -1;
  let orderCorrect = true;

  scriptOrder.forEach(script => {
    const index = content.indexOf(script);
    if (index === -1) {
      fail(`Script '${script}' not found in HTML`);
      orderCorrect = false;
    } else if (index > lastIndex) {
      lastIndex = index;
    } else {
      fail(`Script '${script}' is out of order in HTML`);
      orderCorrect = false;
    }
  });

  if (orderCorrect) {
    pass('All scripts are loaded in correct order');
  }
}

// ==================== FINAL REPORT ====================

header('FINAL REPORT');

log(`\nTotal tests: ${totalTests}`);
log(`Passed: ${passedTests}`, passedTests === totalTests ? 'green' : 'yellow');
log(`Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'green');

const successRate = ((passedTests / totalTests) * 100).toFixed(1);
log(`Success rate: ${successRate}%`, successRate === '100.0' ? 'green' : 'yellow');

if (failedTests === 0) {
  log('\n🎉 ALL CHECKS PASSED! The application is ready to run.', 'green');
  process.exit(0);
} else {
  log(`\n⚠️  ${failedTests} check(s) failed. Please fix the issues above.`, 'red');
  process.exit(1);
}
