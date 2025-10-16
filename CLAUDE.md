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

# Build (placeholder - to be configured)
npm run build

# Testing
npm test                      # Run basic app test
npm run test:init            # Initialize test database
npm run test:e2e             # Run all E2E tests (Playwright)
npm run test:e2e:smoke       # Quick smoke tests (~2 min)
npm run test:e2e:ui          # UI navigation tests
npm run test:e2e:docs        # Document-related tests
npm run test:e2e:templates   # Template & validation tests
npm run test:report          # Generate test report

# Lint (placeholder - to be configured)
npm run lint
```

Note: Build and lint commands are placeholder implementations. Testing infrastructure is fully operational with Playwright E2E tests.

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

## Development Status (Updated: 2025-10-16)

### Completed ✅

**Infrastructure (Week 1-2)**
- ✅ Electron architecture with security configuration
- ✅ Main process with IPC handlers
- ✅ Renderer process structure
- ✅ StorageManager for SQLite operations
- ✅ Database migrations (templates, history)
- ✅ Form System with validation
- ✅ Document autosave (30s intervals)
- ✅ XML generation and export
- ✅ Template system (Browser + Dialog)
- ✅ Toast notification system

**UI/UX Architecture (Week 3-4, Oct 2025)**
- ✅ **3-Level Navigation Architecture** (App Nav → Sidebar → Content)
- ✅ **Activity Bar** (vertical icon bar)
- ✅ **Tab Bar** (document tabs with dirty indicators)
- ✅ **Dynamic Sidebar** (4 sections: Home, Documents, Services, Settings)
- ✅ **Service Store** (marketplace UI with cards, filters, search)
- ✅ **Context Toolbar** (conditional bottom toolbar) - CSS completed Oct 16
- ✅ **Transitions & Animations** (fade-in, hover effects, modal animations) - Added Oct 16
- ✅ **Responsive Design** foundation

**Documentation & AI Agents**
- ✅ **17 AI Agents v2.1** (including Ollama integration)
- ✅ **UI Architecture docs** (docs/UI_ARCHITECTURE.md)
- ✅ **Updated agent contexts** (UI-DESIGNER v2.1, UX-ANALYST v2.1)
- ✅ **91 documentation files**

**Testing Infrastructure**
- ✅ **Playwright E2E tests** (11 test suites)
- ✅ **Test automation** (smoke, docs, templates, UI, modules)
- ✅ **Basic app test** (database, schemas, XSD validation)

**Version Control**
- ✅ **Git repository initialized** (Oct 16, 2025)
- ✅ **First commit** (569d0b6, 258 files)

### In Progress 🔄
- UI polish and refinements
- Module system (Week 5 - scheduled)
- PDF generation via XSLT transformation

### Planned ⏳
- Week 5+: Module ПЗ v01.05 implementation
- Advanced XML validation with business rules
- Document versioning and history UI
- XML import functionality
- Build and deployment pipeline
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

## Testing the Application

### Quick Start
```bash
# 1. Install dependencies (if not already done)
npm install

# 2. Run basic tests
npm test

# 3. Start the application in dev mode
npm run dev

# 4. Run E2E smoke tests (quick validation)
npm run test:e2e:smoke
```

### Manual UI Testing Checklist

**3-Level Navigation (Priority 1)**
1. ✅ App Nav (top bar) switches between Home/Documents/Services/Settings
2. ✅ Sidebar content changes when App Nav item is clicked
3. ✅ Service cards appear in Service Store with hover effects
4. ✅ Context Toolbar appears only when document is open

**Animations & Transitions (Priority 2)**
1. ✅ Content areas fade in smoothly when switching sections
2. ✅ Service cards have enhanced hover shadow effect
3. ✅ Modal dialogs slide up with animation
4. ✅ Tab bar tabs lift slightly on hover

**Document Operations (Core Features)**
1. ✅ Create new document → fills form → saves to database
2. ✅ Load existing document from list
3. ✅ Autosave triggers every 30 seconds
4. ✅ XML generation and export works
5. ✅ Validation panel shows errors

### Automated E2E Tests

Run specific test suites:
```bash
# UI navigation tests (3-level architecture)
npm run test:e2e:ui

# Document CRUD operations
npm run test:e2e:docs

# Template system
npm run test:e2e:templates

# Full test suite (10-15 minutes)
npm run test:e2e

# Generate HTML report
npm run test:report
```

Test results are saved to:
- `test-results/screenshots/` - Visual snapshots
- `test-results/html-report/` - Interactive HTML report
- `test-results/test-results.json` - Raw test data

### Debugging UI Issues

**CSS not loading?**
- Check `src/renderer/css/main.css` exists
- Verify `<link rel="stylesheet" href="css/main.css">` in `index.html`
- Open DevTools (Ctrl/Cmd+Shift+I) and check Console for errors

**Animations not working?**
- Check browser supports CSS animations (all modern browsers do)
- Verify `@keyframes` are defined in main.css (lines 2785+)
- Check elements have correct CSS classes (`.content-area`, `.service-card`, etc.)

**Context Toolbar not appearing?**
- Toolbar only appears when document is open
- Check `context-toolbar--visible` class is added via JavaScript
- Verify `display: flex` is applied when visible

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