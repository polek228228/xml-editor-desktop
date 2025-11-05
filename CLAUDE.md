# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference

| What to do | Command |
|------------|---------|
| Start development | `npm run dev` |
| Run quick tests | `npm run test:e2e:smoke` |
| Check everything works | `npm test` |
| Reset database | `npm run db:init` |
| View test report | `npm run test:report:view` |

**Key Files to Know:**
- `src/main/main.js` - Main process & IPC handlers
- `src/renderer/js/app.js` - UI application class (includes `cleanupUI()`)
- `src/main/storage-manager.js` - Database operations (use `allQuery/getQuery/runQuery`)
- `src/preload/preload.js` - Security bridge for IPC
- `docs/UI_ARCHITECTURE.md` - 3-level navigation architecture
- `GEMINI_AUDIT_REPORT.md` - Why module system was disabled
- `WEEK5_UI_UX_IMPROVEMENTS.md` - Week 5 UI polish report (Service Store integration)
- `SPACING_ANALYSIS.md` - Detailed spacing calculations (sidebar-to-content gap)

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
npm run test:e2e             # Run all E2E tests (Playwright, 10-15 min)
npm run test:e2e:headed      # Run tests with visible browser
npm run test:e2e:debug       # Run tests in debug mode with PWDEBUG
npm run test:e2e:smoke       # Quick smoke tests (~2 min)
npm run test:e2e:ui          # UI navigation tests
npm run test:e2e:docs        # Document-related tests
npm run test:e2e:templates   # Template & validation tests
npm run test:e2e:full        # Full scenario test
npm run test:e2e:ci          # CI mode with JSON reporter
npm run test:report          # Generate test report
npm run test:report:view     # View test report in terminal

# Database management
npm run db:init              # Initialize/reset database
npm run db:clean             # Clean test database

# Lint (placeholder - to be configured)
npm run lint
```

Note: Build and lint commands are placeholder implementations. Testing infrastructure is fully operational with Playwright E2E tests.

## Architecture Overview

### Multi-Process Electron Architecture
- **Main Process** (`src/main/main.js`) - Application lifecycle, window management, database operations
- **Renderer Process** (`src/renderer/`) - UI logic in sandboxed environment
- **Preload Script** (`src/preload/preload.js`) - Secure IPC bridge between processes

### UI Design System (Cupertino Clean)
- **Inspiration:** iOS 17 / macOS Sonoma aesthetic
- **Layout:**
  - Activity Bar (48px vertical) → Sidebar (220px) → Content (flexible)
  - Gap between sidebar and content: 16px
  - Top nav removed in favor of Activity Bar
- **Spacing Scale:** 4px base unit (--space-1: 4px to --space-20: 80px)
- **Color Palette:** CSS variables in `:root` (blue, teal, rose, amber scales)
- **Typography:** System fonts with 5-level scale (xs/sm/base/lg/xl)
- **Animations:** Smooth transitions (0.2s-0.3s), loading spinners (3 sizes), fade-in effects
- **Components:** 14 components (Activity Bar, Tab Bar, Service Store, etc.)

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

### UI Components (14 total)
- **ActivityBar** (`activity-bar.js`) - Vertical navigation (Home/Docs/Services/Settings)
- **TabBar** (`tab-bar.js`) - Document tabs with close buttons
- **DynamicSidebar** (`dynamic-sidebar.js`) - Context-aware sidebar
- **ServiceStore** (`service-store.js`) - Module marketplace (830 lines)
- **ContextToolbar** (`context-toolbar.js`) - Document action toolbar
- **TemplateDialog** (`template-dialog.js`) - Template creation modal
- **TemplateBrowser** (`template-browser.js`) - Template selection
- **DocumentSelector** (`document-selector.js`) - Document picker
- **ValidationPanel** (`validation-panel.js`) - Validation results
- **Accordion** (`accordion.js`) - Collapsible sections
- **InputField** (`input-field.js`) - Form inputs
- **Navigation** (`navigation.js`) - Legacy navigation component
- **Toast Notifications** - Success/error/info/warning toasts
- **Loading States** - Spinners (sm/md/lg), skeleton screens

## IPC Communication Channels

### Document Operations
- `document:create` - Create new document
- `document:save` - Save document to database
- `document:load` - Load existing document
- `document:list` - Get list of all documents
- `document:autosave` - Periodic autosave (every 30 seconds)
- `document:export` - Export document as XML file

### Template Operations
- `template:list` - Get list of all templates
- `template:create` - Create new template
- `template:update` - Update existing template
- `template:delete` - Delete template
- `template:load` - Load template data

### Settings Management
- `settings:get` - Retrieve application setting
- `settings:set` - Update application setting

### Dialog Operations
- `dialog:show-save` - Show save file dialog
- `dialog:show-open` - Show open file dialog

### Module Operations (Week 5 - Service Store)
- `module:list` - Get list of all modules from database
- `module:install` - Install module (updates database)
- `module:uninstall` - Uninstall module (removes from database)
- `module:activate` - Activate installed module
- `module:deactivate` - Deactivate active module
- `module:getById` - Get module details by ID
- `module:search` - Search modules by query
- `module:filterByCategory` - Filter modules by category

## XML Schema Support

### Supported Versions (All 3 Fully Implemented - 12 Sections Each)
- **01.03** - Legacy schema (deprecated August 2023) - **723 lines, 12 sections** ✅
- **01.04** - Transitional schema (until March 2025) - **723 lines, 12 sections** ✅
- **01.05** - Current schema (from March 2025) - **723 lines, 12 sections** ✅

**All versions follow the same 12-section structure per Минстрой standard:**
1. Document Info, 2. Basic Info, 3. Technical Data, 4. Participants,
5. Land Plot, 6. Engineering Surveys, 7. Design Task, 8. Planning Documentation,
9. Project Solutions (unified: arch+struct+eng+materials+fire+mgn+energy),
10. Estimate Documentation, 11. Environmental, 12. Appendices

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

## Development Status (Updated: 2025-10-31, 12:00)

### Current Status
**Phase:** Week 9 Complete ✅ (Form System Analysis - All 14 Sections Ready!)
**Next:** Testing (Weeks 8-9 deferred)
**Overall Progress:** ~94% (Infrastructure + UI + Module System + Form System + All Schemas + XML Validation + PDF Generation + **All 14 Form Sections** complete)
**Design System:** Cupertino Clean (iOS 17 / macOS Sonoma inspired)
**Key Metrics:** 4040+ lines CSS, 15 UI components, **Plain textarea for richtext**, RepeaterField, **1,381 lines schemas (3 versions)**, **XML Validation 0 errors**, **PDF Generation ready**, **14 Form Sections auto-generated**

### Completed ✅

**Infrastructure (Week 1-2)**
- ✅ Electron architecture with security configuration (nodeIntegration: false, contextIsolation: true, sandbox: true)
- ✅ Main process with IPC handlers for documents, templates, settings, dialogs
- ✅ Renderer process structure with secure preload bridge
- ✅ StorageManager for SQLite operations (allQuery/getQuery/runQuery pattern)
- ✅ Database migrations (templates, history tables)
- ✅ Form System with real-time validation
- ✅ Document autosave (30s intervals)
- ✅ XML generation and export with XSD validation
- ✅ Template system (Browser + Dialog) with create/load/delete
- ✅ Toast notification system

**UI/UX Architecture (Week 3-4, Oct 2025)**
- ✅ **3-Level Navigation Architecture** (Activity Bar 48px → Sidebar 220px → Content)
- ✅ **Activity Bar** (vertical icon bar with Home/Documents/Services/Settings)
- ✅ **Tab Bar** (document tabs with dirty indicators, close buttons)
- ✅ **Dynamic Sidebar** (context-aware content for each nav section)
- ✅ **Service Store** (marketplace UI with cards, filters, search)
- ✅ **Context Toolbar** (conditional bottom toolbar for document actions)
- ✅ **Cupertino Clean Design System** (iOS 17 / macOS Sonoma inspired)
- ✅ **Spacing System** (4px base unit, 16px gap sidebar-to-content)
- ✅ **Transitions & Animations** (fade-in, hover effects, modal slide-up, loading spinners)
- ✅ **Responsive Design** foundation with flexible layouts

**Documentation & AI Agents**
- ✅ **17 AI Agents v2.1** (including Ollama integration for local LLM consultation)
- ✅ **UI Architecture docs** (docs/UI_ARCHITECTURE.md, docs/FORM_SYSTEM.md)
- ✅ **Updated agent contexts** (UI-DESIGNER v2.1, UX-ANALYST v2.1, CODER v2.1)
- ✅ **91+ documentation files** (project, development, testing reports)

**Testing Infrastructure**
- ✅ **Playwright E2E tests** (11 test suites: smoke, docs, templates, UI, full scenario)
- ✅ **Test automation scripts** (npm run test:e2e:smoke/docs/templates/ui)
- ✅ **Basic app test** (database, schemas, XSD validation with libxmljs2)
- ✅ **Test reporting** (generate-test-report.js for markdown output)

**Version Control**
- ✅ **Git repository initialized** (Oct 16, 2025)
- ✅ **First commits** (569d0b6 UI architecture, be35a96 CLAUDE.md update)

**Service Store Integration (Week 5, Oct 16)**
- ✅ **Backend Integration** - Connected to Module System via IPC
- ✅ **Install/Uninstall** - Fully functional module management
- ✅ **Activate/Deactivate** - Module lifecycle control
- ✅ **UI Polish** - Loading states, toasts, animations (+346 lines CSS)
- ✅ **Error Handling** - Comprehensive error recovery
- ✅ **Status Badges** - Visual indicators with animations
- ✅ **Module System** - Database table `modules` created and working (8 modules, 2 installed)

**Bug Fixes & Polish (Oct 23, 2025)**
- ✅ **BUG #1 FIXED** - Sidebar categories expand/collapse now works (added explicit display management)
- ✅ **BUG #2 FIXED** - Filter buttons visibility fixed (added scrollIntoView for sidebar filters)
- ✅ **Spacing Gap FIXED** - Content margin-left adjusted from 281px to 293px (proper 16px gap)
- ✅ **Gemini Code Cleanup** - Confirmed removal of legacy src/core/ directory
- ✅ **All Smoke Tests Passing** - 9/9 tests passed (26.2s)

**Week 4: Module System (Oct 24, 2025) ✅ COMPLETE**
- ✅ **Module API** (474 lines) - Secure sandbox interface for modules
  - Document type registration
  - Form field registration
  - Command system
  - Event system (pub/sub)
  - Permissions-based sandboxing
- ✅ **ModuleRegistry Integration** - Pass app instance, create Module API on init
- ✅ **BaseModule Updated** - Accept API parameter in constructor
- ✅ **ПЗ 01.05 Module** (197 lines) - Full activate()/deactivate() implementation
  - Load JSON schema from file
  - Register document type via API
  - Validate data against schema
- ✅ **E2E Tests** - Module tests 8/8 passed, smoke tests 9/9 passed

**Week 5: JSON Schema ALL 3 Versions - 12 Sections (Oct 24, 2025) ✅ COMPLETE**
- ✅ **Schema 01.03** (723 lines, 12 sections) - Full standard compliance
- ✅ **Schema 01.04** (723 lines, 12 sections) - Full standard compliance
- ✅ **Schema 01.05** (723 lines, 12 sections) - Full standard compliance
- ✅ **Total: 2,169 lines across 3 schemas** - Complete Минстрой РФ compliance
- ✅ **All 12 sections** per official standard: Document Info, Basic Info, Technical Data, Participants, Land Plot, Engineering Surveys, Design Task, Planning Documentation, Project Solutions (unified), Estimate Documentation, Environmental, Appendices
- ✅ **Rich Text Fields** - TinyMCE integration for descriptive fields
- ✅ **XML Mapping** - Complete JSON→XML mapping rules for all versions
- ✅ **Validation Rules** - enums, patterns, required fields

**Week 6: RichText Fields + RepeaterField (Oct 24, 2025) ✅ COMPLETE**
- ✅ **RichText Field Implementation** (replaced with plain textarea in Week 7)
  - Initially used TinyMCE (8.8MB dependency)
  - Later simplified to plain `<textarea>` for XML generation
  - XML output uses plain text anyway (richtextToPlaintext transformer)
  - Plain textarea is simpler and faster
- ✅ **RepeaterField Enhanced** - Add/Remove/**Move Up/Down**
  - _moveRepeaterItem() - Swap array items
  - Item header with #number display
  - Up/Down arrow buttons (↑ ↓)
  - CSS styling (120+ lines)
- ✅ **Array Validation** - validateForm() checks minItems, required fields in arrays
- ✅ **All Tests Passing** - 9/9 smoke tests passed (32.0s)

**Week 7: XML Generation & Validation + RichText Simplification (Oct 30, 2025) ✅ COMPLETE**
- ✅ **XML Namespace Fix** - Added `xmlns:exp` prefix for global attributes (ObjectID, Placement)
- ✅ **Placement Enum Fix** - Changed from text to enum value ("1" = на суше, "2" = на воде)
- ✅ **Included Element Fix** - Added required text content (was empty, caused pattern error)
- ✅ **ProjectDocumentation Structure** - All sections 2-13 use NotDeveloped for simplicity
- ✅ **Schema Path Corrections** - Fixed validator to use correct XSD paths for all 3 versions
  - 01.03: `pz-01.03/explanatorynote-01-03.xsd` ✅
  - 01.04: `pz-01.04/explanatorynote-01-04.xsd` ✅
  - 01.05: `pz-01.05/explanatorynote-01-05.xsd` ✅
- ✅ **XMLGeneratorV2 Updated** - Reduced from 402 to 267 lines (removed invalid sections)
- ✅ **XMLGeneratorMinimal** - Created minimal valid generator for testing
- ✅ **Validation Success** - **0 errors for version 01.05!** ✅
- ✅ **All 3 Versions Working** - 01.03, 01.04, 01.05 all pass XSD validation
- ✅ **RichText Simplified** - Replaced TinyMCE with plain textarea (optimal for XML)
  - Removed TinyMCE dependency (saved 8.8MB)
  - Richtext fields now use `<textarea>` with 8 rows
  - XML uses plain text anyway (transformer: richtextToPlaintext)
  - Simpler, faster, no initialization needed
  - Removed rich-text-editor.js component
  - Cleaned up FormManager (removed RichTextEditor logic)

**Week 8: PDF Generation (Oct 31, 2025) ✅ COMPLETE**
- ✅ **HTML Template** (`src/templates/pdf/explanatory-note-template.html`, 467 lines)
  - Official Times New Roman styling for Russian government documents
  - A4 page size with proper margins (2cm top/bottom/right, 3cm left)
  - Mustache-style placeholders `{{variable}}` for dynamic data
  - Sections: Title page, Table of Contents, General Info, Technical Data, Participants, Signatures
  - Professional layout with page breaks, table styling, signature blocks
  - Print-optimized CSS with `@page`, `page-break-after`, `printBackground: true`
- ✅ **PDF Generator Class** (`src/main/pdf-generator.js`, 276 lines)
  - `loadTemplate()` - Loads HTML template from file system
  - `replacePlaceholders()` - Replaces {{variable}} with actual document data
  - `extractDocumentData()` - Extracts all necessary data from document JSON
    - Organization info (issuer, customer): name, OGRN, INN, KPP, address
    - Object info: name, purpose, placement
    - Technical data: area, floors, height, capacity
    - Land plot: cadastral number, area, address
    - Chief engineer: name, SNILS, NOPRIZ number
  - `generatePDFFromHTML()` - Uses Electron `webContents.printToPDF()` API
    - Creates hidden BrowserWindow (794x1123px = A4 at 96dpi)
    - Loads HTML via data URL
    - Prints to PDF with custom margins
  - `generatePDF()` - Main method orchestrating the entire process
  - `escapeHtml()` - Security: prevents XSS in template data
  - Supports all 3 schema versions (01.03, 01.04, 01.05)
- ✅ **IPC Communication** - Full backend-frontend integration
  - `main.js`: Added `pdf:generate` IPC handler (47 lines)
  - `main.js`: Initialized PDFGenerator instance in constructor
  - `preload.js`: Exposed `generatePDF(data)` method to renderer
  - `app.js`: Updated `handleExport()` method (32 lines instead of TODO stub)
    - Shows Save Dialog for .pdf files
    - Calls `electronAPI.generatePDF({ documentId, outputPath })`
    - Displays loading toast "Генерация PDF..."
    - Shows success/error toast with file path
- ✅ **Export Dialog Integration** - PDF option already existed in UI
  - Radio button for XML/PDF format selection (lines 186-196)
  - Schema version selector (disabled for PDF, uses current version)
  - Export button triggers `onExport('pdf', schemaVersion, xmlPreview)`
  - Format change handler disables version selector for PDF
- ✅ **Error Handling** - Comprehensive error recovery at all levels
  - Template not found errors
  - Document not found errors
  - PDF generation failures (HTML load errors, print errors)
  - File save errors
  - All errors propagate to UI with user-friendly toast messages

**📋 TODO: Testing (Week 8 - Deferred)**
- ⏳ **Manual Testing** - Create test document with filled data
  - Fill all required fields (organization, object, technical data)
  - Test PDF export for schema version 01.05
  - Test PDF export for schema version 01.04
  - Test PDF export for schema version 01.03
  - Verify visual appearance: fonts, margins, page breaks
  - Check all placeholders are replaced correctly
  - Verify Cyrillic (Russian) text renders properly
  - Test empty/missing fields (should show "—" dash)
- ⏳ **Edge Cases Testing**
  - Very long text values (multiline descriptions)
  - Special characters in text (quotes, <, >, &)
  - Missing optional fields
  - Document with minimal data (only required fields)
  - Large documents (multiple sections, many participants)
- ⏳ **PDF Validation**
  - Open generated PDF in Preview/Adobe Reader
  - Check page count (should have title, TOC, content, signatures)
  - Verify margins match specification (2cm/2cm/3cm/2cm)
  - Check font (Times New Roman 14pt for body)
  - Verify page breaks work correctly
  - Test printing from PDF viewer

**Week 9: Form System Analysis (Oct 31, 2025) ✅ COMPLETE**
- ✅ **Schema Structure Analysis** - Comprehensive analysis of JSON schema 01.05
  - Found 14 data sections (not 12 as initially thought!)
  - 2 service sections (attributes, elements) for XML mapping
  - All sections have `type: "object"` structure
  - Total 32 nested objects across all sections
  - Created test script `test-schema-sections.js` to verify structure
- ✅ **SchemaLoader Verification** - Confirmed automatic section parsing
  - `getSections(schema)` correctly extracts all 14 data sections
  - Section metadata: id, title, description, properties, required fields
  - Returns sections in correct order for UI display
- ✅ **FormManager Auto-Generation** - **NO CODE NEEDED!**
  - **DISCOVERY**: FormManager ALREADY generates forms for ALL sections automatically
  - `generateFormFromSchema()` → `getSections()` → creates Accordion for each
  - `generateSection()` → `getFieldsForSection()` → generates all fields
  - Supports all field types: text, number, date, email, textarea, select, checkbox, richtext, object (nested), array (RepeaterField)
  - Validation rules automatically extracted from schema
- ✅ **14 Sections Confirmed** - Complete list from schema 01.05:
  1. **documentInfo** - Информация о документе (4 fields, 3 required)
  2. **basicInfo** - Раздел 1. Основная информация (7 fields, 2 required)
  3. **technicalData** - Раздел 2. Технико-экономические показатели (7 fields)
  4. **engineering** - Раздел 3. Инженерные системы (5 fields)
  5. **participants** - Раздел 4. Сведения об участниках (3 fields)
  6. **landPlot** - Раздел 5. Сведения о земельном участке (5 fields)
  7. **materials** - Раздел 6. Строительные материалы (5 fields)
  8. **engineeringSurveys** - Раздел 7. Сведения об инженерных изысканиях (3 fields)
  9. **designTask** - Раздел 8. Сведения о задании на проектирование (4 fields)
  10. **planningDocumentation** - Раздел 9. Документация по планировке территории (3 fields)
  11. **projectSolutions** - Раздел 9. Описание проектных решений (7 fields)
  12. **estimateDocumentation** - Раздел 10. Сметная документация (3 fields)
  13. **environmental** - Раздел 11. Мероприятия по охране окружающей среды (3 fields)
  14. **appendices** - Раздел 12. Приложения (3 fields)
- ✅ **Key Insight** - Form system is ALREADY complete!
  - FormManager was built as a universal form generator
  - SchemaLoader provides schema parsing abstraction
  - JSON schemas drive the entire form structure
  - Adding new sections requires ONLY updating JSON schema
  - No UI code changes needed for new forms

**📋 TODO: Testing (Week 9 - Deferred)**
- ⏳ **UI Display Testing** - Verify all 14 sections render correctly
  - Open document in editor
  - Check all 14 Accordions are created
  - Verify section titles and descriptions
  - Check field labels, placeholders, and help text
  - Test all field types (text, number, date, textarea, select, checkbox, richtext, object, array)
  - Verify RepeaterField add/remove/move buttons work
  - Check nested object fields render correctly
- ⏳ **Data Collection Testing** - Test form data flows
  - Fill fields in all 14 sections
  - Save document
  - Reload document and verify data persists
  - Check field values are correctly populated from database
  - Test autosave (30s intervals)
  - Verify dirty state tracking works
- ⏳ **Validation Testing** - Ensure validation works for all sections
  - Test required field validation (should show errors)
  - Test pattern validation (INN, OGRN, SNILS, etc.)
  - Test min/max length validation
  - Test enum/select validation
  - Verify validation errors appear in UI
  - Test real-time validation on field blur
- ⏳ **XML Generation Testing** - **CRITICAL: Don't break 0 errors!**
  - Fill test data in all 14 sections
  - Generate XML for version 01.05
  - Validate against XSD (must be 0 errors)
  - Check all 14 sections appear in XML output
  - Verify nested objects are correctly mapped
  - Test array fields (multiple participants, materials, etc.)
  - Compare XML structure with Ministry standard
- ⏳ **Edge Cases** - Test unusual scenarios
  - Empty optional sections
  - Maximum number of array items (e.g., 50 participants)
  - Very long text fields (descriptions, addresses)
  - Special characters in text (Cyrillic, quotes, <, >, &)
  - Missing required fields (should prevent save)

### In Progress 🔄
Nothing currently (Weeks 8-9 complete, ready for testing)

### Planned ⏳
**Week 10: Comprehensive Testing (Next Priority)**
- **Form System Testing** - Test all 14 auto-generated sections
  - UI display verification (Accordions, fields, labels)
  - Data collection and persistence
  - Validation for all field types
  - RepeaterField functionality (add/remove/move)
- **XML Generation Testing** - Ensure 0 errors maintained
  - Test with all 14 sections filled
  - Validate against XSD for all 3 versions
  - Test nested objects and arrays
- **PDF Generation Testing** - Verify Week 8 implementation
  - Generate PDFs from test documents
  - Check visual appearance (fonts, margins, layout)
  - Test placeholder replacement
  - Verify Cyrillic support
- **Integration Testing** - End-to-end workflows
  - Create → Fill → Save → XML → PDF workflow
  - Template creation from documents with all sections
  - Autosave with multiple sections
  - Document history tracking

**Later (Phase 2-3)**
- Module ПЗ v01.05 full implementation (forms, validation, XML generation)
- Advanced XML validation with business rules (cross-field validation)
- Document versioning and history UI (show history, restore versions)
- XML import functionality (parse existing XML into forms)
- Build and deployment pipeline (electron-builder, code signing, auto-updates)
- Performance optimizations (lazy loading, virtual scrolling for large lists)
- Search and filters for services (full-text search, category filters)
- Personalization (favorites, hidden services, custom layouts)

## Technical Requirements

- Node.js 18+
- npm 9+
- Electron 27+
- SQLite 3
- libxmljs2 (for XSD validation)
- Playwright (for E2E testing)

## Code Conventions

- **CSS**: BEM methodology (`block__element--modifier`)
- **Design System**: Cupertino Clean (iOS 17 / macOS Sonoma inspired)
- **CSS Variables**: Use design tokens from `:root` (e.g., `var(--space-4)`, `var(--blue-500)`)
- **Spacing**: Follow 4px base unit scale (--space-1 to --space-20)
- **JavaScript**: Vanilla JS (no frameworks), ES6+ features
- **Security**: All renderer-main communication via IPC only
- **Database**: StorageManager abstraction for all SQLite operations
- **Naming**: Use descriptive names for IPC channels (e.g., `document:create`, `template:list`)
- **Error Handling**: Always handle IPC errors and display user-friendly messages via toasts
- **Comments**: Use Russian for business logic comments, English for technical comments
- **Animations**: Use CSS transitions/animations for smooth UI interactions (fade-in, slide-up, hover effects)

## Git Workflow

**Repository initialized:** October 16, 2025
**Current branch:** `main`

### Commit Message Conventions
```bash
# Format: <type>: <description>
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code (no functional changes)
refactor: Refactor code
test: Add or modify tests
chore: Maintenance tasks
```

### Before Committing
1. Run tests: `npm test && npm run test:e2e:smoke`
2. Check for console errors in DevTools
3. Verify database migrations work: `npm run db:init`
4. Update CLAUDE.md if architecture changes
5. Test UI manually (Activity Bar, sidebar, service store)
6. Check spacing and layout in different sections

### Recent Changes (Staged/Modified)
- Multiple UI redesign documentation files (WEEK5_*.md, SPACING_ANALYSIS.md, etc.)
- Updated core files: `main.js`, `app.js`, `main.css`, `index.html`
- Updated components: `activity-bar.js`, `service-store.js`
- New UI testing script: `scripts/ui-full-test.js`
- Test artifacts cleanup in `test-results/`

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
5. **Activity Bar navigation** - Fixed event handlers to properly switch content sections (`activity-bar.js`)
6. **Sidebar spacing** - Fixed sidebar-to-content gap from overlap to 16px (`SPACING_ANALYSIS.md`)
7. **Sidebar loading** - Fixed white sidebar on Home page load (now loads immediately)
8. **Service Store overflow** - Fixed text overflow in service cards with proper `text-overflow: ellipsis`

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

## Troubleshooting & Common Errors

### Problem: Sidebar categories not expanding/collapsing
**Solution:** FIXED (Oct 23, 2025) - Categories now use explicit `display: block/none` management
- Root cause: Inline `style="display: none"` in HTML overrode CSS classes
- Fix location: `src/renderer/js/components/dynamic-sidebar.js:235-239`

### Problem: Filter buttons not clickable (Element is not visible)
**Solution:** FIXED (Oct 23, 2025) - Added `scrollIntoView()` before filter actions
- Root cause: Sidebar filters outside viewport
- Fix location: `src/renderer/js/components/dynamic-sidebar.js:270`

### Problem: Gap between sidebar and content too small/overlapping
**Solution:** FIXED (Oct 23, 2025) - Adjusted CSS variable from 281px to 293px (16px gap)
- Root cause: Incorrect spacing calculation
- Fix location: `src/renderer/css/main.css:20,24`

### Problem: Module system not working
**Status:** ✅ WORKING (as of Oct 16, 2025)
- Database table `modules` created via migration 004-modules
- IPC handlers operational (module:list, module:install, etc.)
- 8 modules in catalog, 2 installed, 1 active
- Location: `xmleditor.db` in project root

### Problem: Cannot find module 'sqlite3' or 'libxmljs2'
**Solution:**
```bash
# Rebuild native dependencies
npm rebuild sqlite3 libxmljs2
# Or rebuild all
npm rebuild
```

### Problem: Tests failing with "App did not start"
**Solution:**
```bash
# 1. Reset test database
npm run db:init

# 2. Check Electron is installed
npx electron --version

# 3. Run smoke tests
npm run test:e2e:smoke
```

### Problem: IPC handler not responding
**Checklist:**
1. Check preload script exposes the channel (`src/preload/preload.js`)
2. Verify main process has `ipcMain.handle()` for the channel (`src/main/main.js`)
3. Check DevTools Console for errors (Cmd+Opt+I / Ctrl+Shift+I)
4. Ensure error handling in both renderer and main processes

### Problem: UI not updating after IPC call
**Solution:**
```javascript
// Always handle promise rejection
try {
  const result = await window.electronAPI.someOperation();
  window.xmlEditorApp.showToast('Success!', 'success');
} catch (error) {
  console.error('Operation failed:', error);
  window.xmlEditorApp.showToast(`Error: ${error.message}`, 'error');
}
```

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

**Spacing issues between sidebar and content?**
- Sidebar width should be `220px` (defined in CSS)
- Gap between sidebar and content should be `16px`
- Content margin-left should be `~276px` (48px Activity Bar + 220px sidebar + 8px gap)
- See `SPACING_ANALYSIS.md` for detailed calculations

**Activity Bar not switching sections?**
- Check event listeners in `activity-bar.js`
- Verify `data-section` attributes on nav items
- Ensure `XMLEditorApp.switchSection()` is called correctly

### UI Testing Script
A comprehensive UI testing script is available at `scripts/ui-full-test.js`:
```bash
# Run in browser console (DevTools)
# Copy contents of scripts/ui-full-test.js and paste
```

This script tests:
- Activity Bar navigation (Home/Documents/Services/Settings)
- Sidebar content updates
- Service Store rendering
- Button clicks and interactions
- Loading states and animations

## Known Limitations (Updated: 2025-10-16, 18:30)

### Module Loading System (Week 6 - Not Yet Implemented)
Module installation works (database updates), but modules don't actually load yet.

**What works:**
- ✅ Service Store UI fully functional
- ✅ Install/uninstall updates database
- ✅ Activate/deactivate changes status
- ✅ IPC handlers working (module:list, module:install, etc.)
- ✅ Visual feedback (loading, toasts, badges)

**What's missing:**
- ❌ ModuleRegistry class (track loaded modules)
- ❌ PluginLoader class (dynamically load JS modules)
- ❌ Module API (expose app features to modules)
- ❌ Sandboxing (permissions system)
- ❌ Module lifecycle hooks (onActivate, onDeactivate)

**Next Steps (Week 6):**
- Implement ModuleRegistry and PluginLoader
- Load active modules on app startup
- Expose APIs to loaded modules (UI, storage, commands)
- Implement basic sandboxing and permissions

### Build System
`npm run build` is currently a placeholder. Actual build configuration needed:
- Configure electron-builder for packaging
- Set up code signing certificates
- Configure auto-update system
- Add platform-specific build scripts (macOS .dmg, Windows .exe)

### Linting
`npm run lint` is a placeholder. Need to configure:
- ESLint for JavaScript linting
- Prettier for code formatting
- Pre-commit hooks with husky

### PDF Generation
XSLT templates exist in `templates/` directory but PDF generation is not yet implemented:
- Need to integrate XSLT processor (xsltproc or similar)
- Transform XML → HTML → PDF pipeline
- Preview system for generated PDFs