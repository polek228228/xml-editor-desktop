# Week 1: Infrastructure Setup - Complete

## Overview

Complete Electron-based infrastructure for XML Editor Desktop application with secure multi-process architecture, SQLite database, and modern UI components.

## Project Structure

```
src/
├── main/                           # Main process (Node.js)
│   ├── main.js                    # Entry point & XMLEditorApplication class
│   ├── storage-manager.js         # SQLite database manager
│   └── database/
│       ├── migrations/
│       │   ├── 001-initial.sql   # Documents, autosaves, settings
│       │   ├── 002-templates.sql # Templates table
│       │   └── 003-history.sql   # Document history
│       └── schema.sql             # Complete database schema
├── renderer/                       # UI process (sandboxed)
│   ├── index.html                 # Main HTML page
│   ├── css/
│   │   └── main.css              # BEM styles with CSS variables
│   └── js/
│       ├── app.js                # XMLEditorApp main class
│       └── components/
│           ├── accordion.js      # Collapsible sections
│           └── input-field.js    # Form input fields
└── preload/                        # Security bridge
    └── preload.js                 # IPC API exposure
```

## Architecture Components

### 1. Main Process (`src/main/main.js`)

**XMLEditorApplication Class:**
- Electron lifecycle management (ready, activate, close)
- Window creation with security configuration
- IPC handlers for all operations
- Application menu (Файл, Правка, Вид, Справка)

**Security Configuration:**
```javascript
webPreferences: {
  nodeIntegration: false,
  contextIsolation: true,
  sandbox: true,
  preload: path.join(__dirname, '../preload/preload.js')
}
```

**IPC Handlers:**
- `document:create` - Create new document
- `document:save` - Save document
- `document:load` - Load document by ID
- `document:list` - List all documents
- `document:delete` - Delete document
- `document:autosave` - Create autosave
- `settings:get/set` - Settings management
- `template:create/list/delete` - Template operations
- `dialog:show-save/open` - File dialogs

### 2. Storage Manager (`src/main/storage-manager.js`)

**StorageManager Class:**
- SQLite3 database abstraction
- Automatic migrations system
- CRUD operations for all entities

**Database Methods:**
- `allQuery(sql, params)` - Multiple rows
- `getQuery(sql, params)` - Single row
- `runQuery(sql, params)` - INSERT/UPDATE/DELETE

**Entity Operations:**
- Documents: create, get, update, delete, list
- Autosaves: create, getLatest, list (max 10 per document)
- Settings: get, set, delete
- Templates: create, get, update, delete, list
- History: createEntry, list

### 3. Preload Script (`src/preload/preload.js`)

**Exposed API (`window.electronAPI`):**
```javascript
// Documents
createDocument(data)
saveDocument(data)
loadDocument(id)
listDocuments()
deleteDocument(id)
autosaveDocument(data)

// Settings
getSetting(key)
setSetting(key, value)

// Dialogs
showSaveDialog(options)
showOpenDialog(options)

// Templates
createTemplate(data)
listTemplates()
deleteTemplate(id)

// Menu events
onMenuEvent(channel, callback)
removeMenuListener(channel, callback)
```

### 4. Renderer Process (`src/renderer/`)

**XMLEditorApp Class (`app.js`):**
- UI state management
- Document operations
- Autosave (30 seconds interval)
- Toast notifications
- Loading overlay
- Menu integration

**UI Components:**
- **Accordion** (`accordion.js`) - Collapsible sections
  - Open/close animations
  - Keyboard support (Enter, Space)
  - Dynamic content updates

- **InputField** (`input-field.js`) - Form inputs
  - Types: text, number, email, date, textarea, select
  - Validation (required, email, number, custom)
  - Error display
  - Help text

**CSS Architecture (`main.css`):**
- BEM methodology
- CSS variables for theming
- Responsive design
- Professional color scheme
- Smooth animations
- Custom scrollbar

### 5. Database Schema

**Tables:**

1. **documents**
   - id, title, schema_version, content (JSON), xml_content
   - is_valid, created_at, updated_at

2. **autosaves**
   - id, document_id, content (JSON), created_at
   - Foreign key: document_id → documents(id) CASCADE

3. **settings**
   - key (PRIMARY), value, updated_at

4. **templates**
   - id, name, description, schema_version, content (JSON), created_at

5. **document_history**
   - id, document_id, title, content, xml_content, is_valid, created_at
   - Foreign key: document_id → documents(id) CASCADE

6. **migrations**
   - id, name (UNIQUE), executed_at

**Indexes:**
- autosaves: document_id, created_at
- templates: schema_version
- document_history: document_id, created_at

## Features Implemented

### ✅ Core Infrastructure
- [x] Electron multi-process architecture
- [x] Security configuration (contextIsolation, sandbox)
- [x] IPC communication bridge
- [x] SQLite database with migrations
- [x] StorageManager abstraction

### ✅ UI Components
- [x] Responsive layout (header, sidebar, content, footer)
- [x] Welcome screen
- [x] Document editor screen
- [x] Accordion component
- [x] InputField component
- [x] Toast notifications
- [x] Loading overlay

### ✅ Document Operations
- [x] Create new document
- [x] Save document
- [x] Load document
- [x] List documents (sidebar)
- [x] Delete document
- [x] Autosave (30s interval)

### ✅ Template System
- [x] Create template
- [x] List templates
- [x] Delete template

### ✅ Settings Management
- [x] Get setting
- [x] Set setting
- [x] Delete setting

### ✅ File Dialogs
- [x] Save dialog (export XML)
- [x] Open dialog (import)

### ✅ Application Menu
- [x] Файл (Новый, Открыть, Сохранить, Экспорт, Выход)
- [x] Правка (Undo, Redo, Cut, Copy, Paste, Select All)
- [x] Вид (Reload, DevTools, Zoom, Fullscreen)
- [x] Справка (О программе)

## Running the Application

### Development Mode (with logging)
```bash
npm run dev
```

### Development Mode (simple)
```bash
npm run dev:simple
```

### Production Mode
```bash
npm start
```

## Database Location

**Production:**
```
~/Library/Application Support/xml-editor-desktop/xmleditor.db (macOS)
%APPDATA%/xml-editor-desktop/xmleditor.db (Windows)
~/.config/xml-editor-desktop/xmleditor.db (Linux)
```

**Development:**
```
electron/xml-editor-desktop/xmleditor.db
```

## Code Standards

### JavaScript
- ES6+ features
- JSDoc comments for all classes and methods
- Error handling in all async operations
- Vanilla JS (no frameworks)

### CSS
- BEM methodology (`block__element--modifier`)
- CSS variables for theming
- Mobile-first approach
- Smooth transitions (200ms ease-in-out)

### Security
- ✅ nodeIntegration: false
- ✅ contextIsolation: true
- ✅ sandbox: true
- ✅ All IPC through preload script
- ✅ Input validation
- ✅ SQL injection prevention (parameterized queries)

## Critical Patterns

### 1. IPC Communication
```javascript
// Renderer → Main
const result = await window.electronAPI.saveDocument(data);

// Main → Renderer (menu)
mainWindow.webContents.send('menu:save-document');
```

### 2. Database Operations
```javascript
// CORRECT (use StorageManager methods)
await storage.allQuery(sql, params);
await storage.getQuery(sql, params);
await storage.runQuery(sql, params);

// WRONG (don't use db directly)
db.all(sql, params); // ❌
```

### 3. Error Handling
```javascript
try {
  const result = await window.electronAPI.someOperation();
  if (result.success) {
    // Success path
  } else {
    // Handle error from result.error
  }
} catch (error) {
  // Handle exception
  console.error('Operation failed:', error);
}
```

### 4. UI Cleanup
```javascript
// Always cleanup modals/overlays
window.xmlEditorApp.cleanupUI();
```

## Next Steps (Week 2+)

### Planned Features
- [ ] Form rendering from JSON schemas
- [ ] XML generation with XSD validation
- [ ] PDF export via XSLT
- [ ] Template browser UI
- [ ] Document import
- [ ] Advanced validation rules
- [ ] User preferences
- [ ] Performance optimizations

## Testing

```bash
# Install dependencies
npm install

# Run application
npm run dev

# Test features:
# 1. Create new document
# 2. Select schema version
# 3. Save document
# 4. Load from sidebar
# 5. Check autosave (every 30s)
# 6. Export XML dialog
```

## Dependencies

- `electron`: ^27.0.0 - Desktop application framework
- `sqlite3`: ^5.1.6 - Database
- `fs-extra`: ^11.0.0 - File system utilities
- `uuid`: ^9.0.1 - Unique identifiers

## Important Notes

1. **Security First**: All renderer-main communication goes through preload script
2. **Offline Operation**: Application works without internet
3. **Ministry Compliance**: XML must conform to МинСтрой РФ schemas
4. **Data Protection**: Autosave every 30 seconds
5. **Performance**: Lazy loading for large documents

## Troubleshooting

### Database locked error
- Close all instances of the application
- Delete `xmleditor.db` and restart

### IPC errors
- Check preload script is loading correctly
- Verify contextBridge is exposing API
- Check IPC handler names match

### UI not updating
- Check event listeners are attached
- Verify DOM elements exist before accessing
- Use browser DevTools (View → Toggle DevTools)

---

**Infrastructure Setup Complete: 2025-10-02**
