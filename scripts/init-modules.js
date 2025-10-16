/**
 * @file init-modules.js
 * @description Initialize test modules in database
 */

const path = require('path');
const { app } = require('electron');
const StorageManager = require('../src/main/storage-manager');

// For script execution, set app path manually
const userDataPath = path.join(__dirname, '../');
const dbPath = path.join(userDataPath, 'xmleditor.db');

console.log('Initializing test modules...');
console.log('Database path:', dbPath);

const storageManager = new StorageManager(dbPath);

const testModules = [
  {
    id: 'pz-01.05',
    name: 'Пояснительная записка v01.05',
    description: 'Создание пояснительных записок по стандарту Минстроя РФ версии 01.05 (действует с марта 2025)',
    version: '1.0.0',
    type: 'document',
    category: 'Документы',
    icon: '📄',
    price: 5990,
    is_installed: false,
    is_active: false,
    is_featured: true,
    rating: 4.8,
    downloads: 1247,
    schema_path: 'schemas/json/pz-01.05.json',
    module_path: 'modules/pz-01.05/index.js'
  },
  {
    id: 'pz-01.04',
    name: 'Пояснительная записка v01.04',
    description: 'Создание пояснительных записок по стандарту Минстроя РФ версии 01.04 (переходный период до марта 2025)',
    version: '1.0.0',
    type: 'document',
    category: 'Документы',
    icon: '📄',
    price: 3990,
    is_installed: false,
    is_active: false,
    is_featured: false,
    rating: 4.5,
    downloads: 892,
    schema_path: 'schemas/json/pz-01.04.json',
    module_path: 'modules/pz-01.04/index.js'
  },
  {
    id: 'pz-01.03',
    name: 'Пояснительная записка v01.03',
    description: 'Создание пояснительных записок по стандарту Минстроя РФ версии 01.03 (устаревшая, до марта 2025)',
    version: '1.0.0',
    type: 'document',
    category: 'Документы',
    icon: '📄',
    price: 1990,
    is_installed: false,
    is_active: false,
    is_featured: false,
    rating: 4.2,
    downloads: 2341,
    schema_path: 'schemas/json/pz-01.03.json',
    module_path: 'modules/pz-01.03/index.js'
  },
  {
    id: 'xml-validator',
    name: 'XML Валидатор',
    description: 'Проверка XML документов на соответствие XSD схемам Минстроя РФ',
    version: '1.0.0',
    type: 'tool',
    category: 'Инструменты',
    icon: '✅',
    price: 0,
    is_installed: true,
    is_active: true,
    is_featured: true,
    rating: 4.9,
    downloads: 5621,
    schema_path: null,
    module_path: 'modules/xml-validator/index.js'
  },
  {
    id: 'pdf-generator',
    name: 'PDF Генератор',
    description: 'Генерация PDF документов из XML с помощью XSLT трансформации',
    version: '1.0.0',
    type: 'tool',
    category: 'Инструменты',
    icon: '📑',
    price: 2990,
    is_installed: false,
    is_active: false,
    is_featured: true,
    rating: 4.7,
    downloads: 1876,
    schema_path: null,
    module_path: 'modules/pdf-generator/index.js'
  },
  {
    id: 'template-manager',
    name: 'Менеджер шаблонов',
    description: 'Создание, редактирование и управление шаблонами документов',
    version: '1.0.0',
    type: 'tool',
    category: 'Инструменты',
    icon: '📋',
    price: 0,
    is_installed: true,
    is_active: true,
    is_featured: false,
    rating: 4.6,
    downloads: 3204,
    schema_path: null,
    module_path: 'modules/template-manager/index.js'
  },
  {
    id: 'import-export',
    name: 'Импорт/Экспорт',
    description: 'Импорт и экспорт документов в различных форматах (XML, JSON, DOCX)',
    version: '1.0.0',
    type: 'integration',
    category: 'Интеграции',
    icon: '🔄',
    price: 1990,
    is_installed: false,
    is_active: false,
    is_featured: false,
    rating: 4.4,
    downloads: 987,
    schema_path: null,
    module_path: 'modules/import-export/index.js'
  },
  {
    id: 'cloud-sync',
    name: 'Облачная синхронизация',
    description: 'Синхронизация документов с облачными хранилищами (Google Drive, Yandex.Disk)',
    version: '1.0.0',
    type: 'integration',
    category: 'Интеграции',
    icon: '☁️',
    price: 4990,
    is_installed: false,
    is_active: false,
    is_featured: true,
    rating: 4.3,
    downloads: 651,
    schema_path: null,
    module_path: 'modules/cloud-sync/index.js'
  }
];

async function initModules() {
  try {
    // Initialize database (runs migrations)
    await storageManager.initialize();
    console.log('✅ Database initialized');

    for (const module of testModules) {
      await storageManager.registerModule(module);
      console.log(`✅ Registered module: ${module.id}`);
    }

    const stats = await storageManager.getModuleStatistics();
    console.log('\n📊 Module Statistics:');
    console.log(`  Total modules: ${stats.total}`);
    console.log(`  Installed: ${stats.installed}`);
    console.log(`  Active: ${stats.active}`);
    console.log(`  Featured: ${stats.featured}`);

    console.log('\n✅ Done! Test modules initialized successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing modules:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

initModules();
