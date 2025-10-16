/**
 * @file verify-modules.js
 * @description A script to directly query the database and verify that modules were seeded. 
 */

const path = require('path');
const StorageManager = require('../src/main/storage-manager');

// This is a simplified way to get the app data path for this script.
// In the actual app, Electron's app.getPath('userData') is used.
const userDataPath = process.env.HOME + '/Library/Application Support/xml-editor-desktop';
const dbPath = path.join(userDataPath, 'xmleditor.db');

async function verify() {
  console.log(`Connecting to database at: ${dbPath}`);
  const storage = new StorageManager(dbPath);

  try {
    // We need to initialize storage to run migrations and open the DB.
    await storage.initialize();

    console.log('\nQuerying for modules in the database...');
    const modules = await storage.listModules();

    if (modules && modules.length > 0) {
      console.log(`\n✅ SUCCESS: Found ${modules.length} modules in the database!`);
      console.log('--------------------------------------------------');
      modules.forEach(m => {
        console.log(`- ID: ${m.id}, Name: ${m.name}, Installed: ${m.is_installed}`);
      });
      console.log('--------------------------------------------------');
      console.log('\nThis confirms that the module seeding process from Week 4 was successful.');
    } else {
      console.error('❌ FAILURE: No modules found in the database.');
    }

  } catch (error) {
    console.error('❌ An error occurred during verification:', error);
  } finally {
    if (storage) {
      await storage.close();
      console.log('\nDatabase connection closed.');
    }
  }
}

verify();
