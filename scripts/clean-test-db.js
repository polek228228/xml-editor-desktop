/**
 * @file clean-test-db.js
 * @description Clean/reset test database before E2E tests
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Database paths
const dbPaths = [
  // macOS
  path.join(os.homedir(), 'Library', 'Application Support', 'xml-editor-desktop', 'xmleditor.db'),
  // Linux
  path.join(os.homedir(), '.config', 'xml-editor-desktop', 'xmleditor.db'),
  // Windows
  path.join(os.homedir(), 'AppData', 'Roaming', 'xml-editor-desktop', 'xmleditor.db'),
];

console.log('🧹 Cleaning test database...');

let removed = false;
dbPaths.forEach(dbPath => {
  if (fs.existsSync(dbPath)) {
    try {
      fs.unlinkSync(dbPath);
      console.log(`✅ Removed: ${dbPath}`);
      removed = true;
    } catch (error) {
      console.error(`❌ Failed to remove ${dbPath}:`, error.message);
    }
  }
});

if (!removed) {
  console.log('ℹ️  No database found to clean');
} else {
  console.log('✅ Test database cleaned successfully');
}
