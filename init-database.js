#!/usr/bin/env node
/**
 * @file init-database.js
 * @description Initialize database for testing purposes
 * @version 1.0.0
 */

const path = require('path');
const StorageManager = require('./src/main/storage-manager');

const DB_PATH = path.join(__dirname, 'xmleditor.db');

async function initializeDatabase() {
  console.log('🗄️  Initializing database...');
  console.log(`📁 Database path: ${DB_PATH}`);

  const storage = new StorageManager(DB_PATH);

  try {
    await storage.initialize();
    console.log('✅ Database initialized successfully!');
    console.log('');
    console.log('Tables created:');
    console.log('  - documents');
    console.log('  - autosaves');
    console.log('  - settings');
    console.log('  - templates');
    console.log('  - document_history');
    console.log('');
    console.log('You can now run: node test-app.js');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await storage.close();
  }
}

if (require.main === module) {
  initializeDatabase();
}
