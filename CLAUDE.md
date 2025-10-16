# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**XML Editor Desktop** is an Electron-based desktop application that clones the functionality of xmlonline.ru for creating XML explanatory notes. The application works offline and supports Russian Ministry of Construction XML schemas (versions 01.03, 01.04, 01.05).

## Development Commands

### Core Commands
```bash
# Install dependencies
npm install

# Development mode with logging
npm run dev

# Development mode (simple)
npm run dev:simple

# Production mode
npm start

# Build (placeholder)
npm run build

# Test (placeholder)
npm run test

# Lint (placeholder)
npm run lint
```

Note: Build, test, and lint commands are currently placeholder implementations and need to be configured.

## Architecture Overview

### Multi-Process Electron Architecture
- **Main Process** (`src/main/main.js`) - Application lifecycle, window management, database operations
- **Renderer Process** (`src/renderer/`) - UI logic in sandboxed environment
- **Preload Script** (`src/preload/preload.js`) - Secure IPC bridge between processes

### Key Security Configuration
```javascript
webPreferences: {
    nodeIntegration: false,     // No Node.js in renderer
    contextIsolation: true,     // Context isolation enabled
    sandbox: true,              // Renderer sandboxing
    preload: path.join(__dirname, '../preload/preload.js')
}
```

### Database Layer
- **SQLite 3** with `StorageManager` class handling all database operations
- Main tables: `documents`, `autosaves`, `settings`, `templates`, `document_history`
- Documents store JSON content + generated XML with validation status

### Core Classes
- **XMLEditorApplication** (`src/main/main.js`) - Main process controller
- **StorageManager** (`src/main/storage-manager.js`) - Database operations
- **XMLEditorApp** (`src/renderer/js/app.js`) - Main UI application class
- **FormManager** (`src/renderer/js/form-manager.js`) - Form handling logic

## IPC Communication Channels

### Document Operations
- `document:create` - Create new document
- `document:save` - Save document to database
- `document:load` - Load existing document
- `document:autosave` - Periodic autosave (every 30 seconds)

### Settings Management
- `settings:get` - Retrieve application setting
- `settings:set` - Update application setting

### Dialog Operations
- `dialog:show-save` - Show save file dialog
- `dialog:show-open` - Show open file dialog

## XML Schema Support

### Supported Versions
- **01.03** - Legacy schema (deprecated March 2025)
- **01.04** - Transitional schema (until March 2025)
- **01.05** - Current schema (from March 2025)

### Validation System (4 levels)
1. **Client-side** - Real-time UI validation
2. **Schema validation** - JSON schema validation
3. **XML validation** - XSD schema validation against Ministry standards
4. **Business logic** - Custom business rule validation

## File Structure

```
src/
├── main/                    # Main process
│   ├── main.js             # Entry point & XMLEditorApplication class
│   └── storage-manager.js   # SQLite database operations
├── renderer/               # UI process
│   ├── index.html          # Main HTML page
│   ├── css/main.css        # Styles (BEM methodology)
│   └── js/
│       ├── app.js          # XMLEditorApp class
│       └── form-manager.js # Form handling
├── preload/                # Security bridge
│   └── preload.js          # IPC API exposure
├── schemas/                # XSD schemas from Ministry of Construction
├── templates/              # XSLT templates for PDF generation
└── database/               # SQLite schemas and migrations
```

## Development Status (Updated: 2025-10-03)

### Completed ✅
- ✅ Basic Electron architecture with security configuration
- ✅ Main process with IPC handlers
- ✅ Renderer process structure
- ✅ StorageManager for SQLite operations
- ✅ Base UI HTML/CSS structure
- ✅ XMLEditorApp class foundation
- ✅ FormManager with full form rendering and validation
- ✅ UI components (Accordion, InputField)
- ✅ Document autosave functionality (30s intervals)
- ✅ **Template system (TemplateManager + TemplateBrowser + TemplateDialog)**
- ✅ **Database migrations for templates (migration 3 & 4)**
- ✅ **XML generation and export**
- ✅ **Document loading/saving system**
- ✅ **Universal UI cleanup system (cleanupUI method)**
- ✅ **Toast notification system**
- ✅ **NEW: 3-Level Navigation Architecture (Oct 2025)**
- ✅ **NEW: Scalable UI for millions of services**
- ✅ **NEW: UI Architecture documentation (docs/UI_ARCHITECTURE.md)**
- ✅ **NEW: Updated agent contexts (UI-DESIGNER v2.1, UX-ANALYST v2.1)**

### In Progress 🔄
- **NEW: App Nav implementation (4-section navigation)**
- **NEW: Dynamic Sidebar with categories**
- **NEW: Service Store (marketplace UI)**
- **NEW: Context Toolbar (conditional display)**
- PDF generation via XSLT transformation
- Comprehensive testing
- Build and deployment pipeline

### Planned ⏳
- Advanced XML validation with business rules
- Document versioning and history
- XML import functionality
- User settings and preferences
- Performance optimizations
- **NEW: Service installation system**
- **NEW: Search and filters for services**
- **NEW: Personalization (favorites, hidden services)**

## Technical Requirements

- Node.js 18+
- npm 9+
- Electron 27+
- SQLite 3

## Code Conventions

- **CSS**: BEM methodology (`block__element--modifier`)
- **JavaScript**: Vanilla JS (no frameworks), ES6+ features
- **Security**: All renderer-main communication via IPC only
- **Database**: StorageManager abstraction for all SQLite operations

## Important Fixes & Patterns

### UI Cleanup Pattern
Always use `window.xmlEditorApp.cleanupUI()` to remove modal dialogs and overlays:
- Automatically called when opening documents
- Should be called after template/dialog operations
- Removes `.template-dialog__overlay`, `.modal-overlay`, `.template-dialog`
- Restores body overflow and pointer-events

### Template System Integration
```javascript
// FormManager: Save document as template
document.getElementById('save-as-template').addEventListener('click', () => {
    const dialog = new TemplateDialog({
        mode: 'createFromDocument',
        document: {
            id, title, schema_version, content
        },
        onSuccess: (template) => {
            // Show notification
            // Call cleanupUI after 300ms
        }
    });
});
```

### Critical Bug Fixes Applied
1. **schema_version** - Always include in template creation (`template-dialog.js`)
2. **document.querySelector conflict** - Use `window.document` or rename variable (`form-manager.js`)
3. **UI cleanup** - Remove overlays after modal operations (`app.js`)
4. **StorageManager methods** - Use `allQuery()`, `getQuery()`, `runQuery()` not `.all()`, `.get()`, `.run()`

## Important Files for Development

### UI Development
- `src/renderer/js/app.js` - Main application class (**includes cleanupUI()**)
- `src/renderer/js/form-manager.js` - Form handling and validation
- `src/renderer/js/components/template-dialog.js` - Template creation dialog
- `src/renderer/js/components/template-browser.js` - Template selection UI
- `src/renderer/index.html` - HTML structure
- `src/renderer/css/main.css` - Styling

### Backend Development
- `src/main/main.js` - Main process logic with IPC handlers
- `src/main/storage-manager.js` - Database layer (use allQuery/getQuery/runQuery)
- `src/main/template-manager.js` - Template CRUD operations
- `src/preload/preload.js` - IPC bridge

### Documentation
- `docs/ARCHITECTURE.md` - Detailed technical architecture
- `docs/MAIN-APP.md` - XMLEditorApp class details
- `docs/DATABASE.md` - Database schema documentation
- `Для Клауда при первом старте.md` - Detailed Russian documentation

## Special Considerations

1. **Security First**: All renderer-main communication must go through the preload script
2. **Offline Operation**: Application must work without internet connectivity
3. **Ministry Compliance**: XML output must strictly conform to Russian Ministry of Construction schemas
4. **Performance**: Implement lazy loading and caching for large XML documents
5. **Autosave**: Implement 30-second autosave intervals for data protection

## Known Limitations (Updated: 2025-10-16)

### Module System (Week 4 - Not Yet Implemented)
The module system is currently **disabled** and will be properly implemented in Week 4.

**What's disabled:**
- `module:*` IPC handlers in main.js (commented out)
- Module-related methods in preload.js (commented out)
- `modules` database table (migration 004 removed)
- Service Store integration (UI exists but non-functional)

**Reason:**
Previous implementation by Gemini AI was incomplete and not integrated. Code was removed for clean reimplementation. See `GEMINI_AUDIT_REPORT.md` for full details.

**Timeline:**
Week 4 will implement proper module system with:
- ModuleRegistry and PluginLoader
- Database migration for modules table
- Service installation flow
- IPC handlers reactivation