# E2E Testing Documentation
## XML Editor Desktop - Playwright Electron Tests

**Framework:** Playwright 1.55.1
**Target:** Electron 27+ Application
**Test Count:** 64 tests across 5 suites

---

## Quick Start

```bash
# Install dependencies (if not already installed)
npm install

# Clean test database before running
npm run test:init

# Run all E2E tests
npm run test:e2e

# Run in headed mode (see the app while testing)
npm run test:e2e:headed

# Run specific test file
npm run test:e2e -- e2e/00-smoke.e2e.js

# Debug mode with Playwright Inspector
npm run test:e2e:debug

# View HTML test report
npm run test:e2e:report
```

---

## Test Structure

```
e2e/
├── helpers/
│   ├── electron-app.js      # Electron-specific helpers
│   └── fixtures.js          # Playwright fixtures
├── 00-smoke.e2e.js          # Smoke tests (9 tests)
├── 01-documents.e2e.js      # Document lifecycle (11 tests)
├── 02-xml-generation.e2e.js # XML generation & export (10 tests)
├── 03-validation-templates.e2e.js # Validation & templates (13 tests)
├── 04-ui-navigation.e2e.js  # UI & navigation (18 tests)
└── 99-full-scenario.e2e.js  # Complete E2E scenarios (3 tests)
```

---

## Test Suites

### 00-smoke.e2e.js - Smoke Tests
**Purpose:** Verify basic app functionality
**Tests:** 9
**Coverage:**
- App launch and initialization
- Main window display
- Navigation bar presence
- Sidebar visibility
- Dashboard display
- Quick actions
- Initial editor/toolbar states

**Run:** `npm run test:e2e -- e2e/00-smoke.e2e.js`

---

### 01-documents.e2e.js - Document Lifecycle
**Purpose:** Test document CRUD operations
**Tests:** 11
**Coverage:**
- Create document (from dashboard/sidebar)
- Fill document title and schema
- Fill form fields
- Save document to database
- Load existing document
- Autosave mechanism (30s)
- Switch between multiple documents
- Validation errors for empty fields

**Run:** `npm run test:e2e -- e2e/01-documents.e2e.js`

**Key Test:**
```javascript
test('should trigger autosave after 30 seconds', async ({ electronApp }) => {
  // Creates document, waits 35s, verifies autosave triggered
});
```

---

### 02-xml-generation.e2e.js - XML Generation & Export
**Purpose:** Test XML generation engine
**Tests:** 10
**Coverage:**
- Generate XML from form data
- Enable/disable Export button
- Export XML to disk
- Validate XML structure
- Handle different schema versions (01.03, 01.04, 01.05)
- Preserve XML after document reload
- Progress indicators
- Russian character encoding
- Export cancellation handling

**Run:** `npm run test:e2e -- e2e/02-xml-generation.e2e.js`

**Key Test:**
```javascript
test('should handle different schema versions', async ({ electronApp }) => {
  // Tests all 3 schemas: 01.03, 01.04, 01.05
});
```

---

### 03-validation-templates.e2e.js - Validation & Templates
**Purpose:** Test validation and template systems
**Tests:** 13 (4 validation + 9 template)
**Coverage:**

**Validation:**
- Validate XML successfully
- Show validation errors
- Display validation panel
- Real-time validation feedback

**Templates:**
- Create template from document
- Template browser display
- Search templates
- Filter by schema version
- Load document from template
- Template metadata display
- Delete template
- Update existing template
- Template statistics

**Run:** `npm run test:e2e -- e2e/03-validation-templates.e2e.js`

**Key Test:**
```javascript
test('should create template from existing document', async ({ electronApp }) => {
  // Create doc → Save as template → Verify template created
});
```

---

### 04-ui-navigation.e2e.js - UI & Navigation (Week 4)
**Purpose:** Test 3-level navigation architecture
**Tests:** 18
**Coverage:**

**Navigation (5 tests):**
- Switch between App Nav sections (Home/Documents/Services/Settings)
- Display correct sidebar content
- Expand/collapse categories
- Hide editor when switching sections
- Context toolbar conditional display

**Service Store (8 tests):**
- Display Service Store
- Filter services (all/installed/available)
- Search services
- Service categories (Documents/Utilities/Integrations)
- Service cards with metadata
- Featured services section
- Service category items
- Service badges (Pro/Free/Installed)

**Settings (2 tests):**
- Settings section display
- Switch between settings categories

**Statistics (3 tests):**
- Document/template counts
- Recent documents list
- Activity list

**Run:** `npm run test:e2e -- e2e/04-ui-navigation.e2e.js`

**Key Test:**
```javascript
test('should switch between App Nav sections', async ({ electronApp }) => {
  // Tests all 4 sections, verifies sidebar switches correctly
});
```

---

### 99-full-scenario.e2e.js - Complete E2E Scenarios
**Purpose:** Full workflow integration tests
**Tests:** 3
**Coverage:**

**Test 1: Full Workflow (12 steps)**
1. Create new document
2. Fill metadata (title, schema)
3. Fill form fields
4. Save document
5. Validate XML
6. Prepare to export
7. Save as template
8. Navigate to Documents section
9. Load from template
10. Verify statistics
11. Explore Service Store
12. Check Settings

**Test 2: Stress Test**
- Rapidly create 5 documents
- Verify all saved correctly

**Test 3: UI Responsiveness**
- Rapid navigation through all sections (3 iterations)
- Verify UI remains stable

**Run:** `npm run test:e2e -- e2e/99-full-scenario.e2e.js`

**Key Test:**
```javascript
test('Full workflow: Create → Fill → Save → Validate → Export → Template',
  async ({ electronApp }) => {
    // 12-step complete workflow with verification at each stage
});
```

---

## Helper Functions

### electron-app.js

```javascript
// Launch Electron app in test mode
const { app, window } = await launchElectronApp();

// Wait for element to appear
await waitForElement(window, '.my-element');

// Click element and wait
await clickAndWait(window, '#my-button', 1000);

// Check if element is visible
const visible = await isElementVisible(window, '#my-element');

// Take screenshot for debugging
await takeScreenshot(window, 'my-screenshot-name');

// Get app information
const appInfo = await getAppInfo(app);

// Close app cleanly
await closeElectronApp(app);
```

### fixtures.js

```javascript
// Automatic fixture usage
test('my test', async ({ electronApp }) => {
  const { app, window } = electronApp;
  // App automatically launched before test
  // App automatically closed after test
});
```

---

## Configuration (playwright.config.js)

```javascript
{
  testDir: './e2e',
  timeout: 5 * 60 * 1000,        // 5 minutes per test
  workers: 1,                    // Sequential execution (Electron requirement)
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/test-results.json' }],
    ['list']
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  }
}
```

---

## Test Environment

Each test runs with:
- **Fresh Electron app instance** (via fixture)
- **Clean database** (run `npm run test:init` first)
- **Test mode enabled** (`NODE_ENV=test`, `TEST_MODE=true`)
- **Default window size** (1280x720)

---

## Debugging Tests

### Visual Debugging (Headed Mode)
```bash
npm run test:e2e:headed
```
Opens visible Electron window, watch tests execute in real-time.

### Playwright Inspector
```bash
npm run test:e2e:debug
```
Step through tests line-by-line with Playwright's debugger.

### Screenshots
Automatically captured:
- On test failure
- At checkpoint calls: `await takeScreenshot(window, 'name')`

Location: `test-results/artifacts/`

### Videos
Automatically recorded on failure.
Location: `test-results/artifacts/`

### Console Logs
Tests log important events:
```javascript
console.log('Found 19 text input fields');
console.log('Validation result:', toastText);
```

---

## Best Practices

### 1. Use Fixtures
```javascript
// Good
test('my test', async ({ electronApp }) => {
  const { window } = electronApp;
});

// Bad - manual lifecycle management
test('my test', async () => {
  const app = await launchElectronApp();
  // ... test code
  await closeElectronApp(app);
});
```

### 2. Wait for Elements
```javascript
// Good
await waitForElement(window, '.my-element');
await window.$('.my-element');

// Bad - race condition
await window.$('.my-element'); // Might not be ready yet
```

### 3. Use Helper Functions
```javascript
// Good
await clickAndWait(window, '#button', 1000);

// Bad
await window.click('#button');
await window.waitForTimeout(1000);
```

### 4. Take Screenshots at Key Points
```javascript
await takeScreenshot(window, '01-step-completed');
```
Helps debug failures even when test passes.

### 5. Clean Database Before Tests
```bash
npm run test:init  # Always run before E2E tests
```

---

## Common Patterns

### Test Document Creation
```javascript
test('should create document', async ({ electronApp }) => {
  const { window } = electronApp;

  await clickAndWait(window, '#dashboard-new-document', 1000);
  await window.fill('#document-title', 'My Document');
  await window.selectOption('#schema-version-select', '01.05');
  await window.waitForTimeout(2000); // Wait for form render

  const saveBtn = await window.$('#save-document');
  await saveBtn.click({ force: true });
  await window.waitForTimeout(1000);

  await takeScreenshot(window, 'document-created');
});
```

### Test Navigation
```javascript
test('should navigate to section', async ({ electronApp }) => {
  const { window } = electronApp;

  await clickAndWait(window, '#nav-documents', 500);

  const sidebarVisible = await isElementVisible(window, '#sidebar-documents');
  expect(sidebarVisible).toBe(true);

  await takeScreenshot(window, 'documents-section');
});
```

### Test Form Filling
```javascript
test('should fill form fields', async ({ electronApp }) => {
  const { window } = electronApp;

  // Create document first
  await clickAndWait(window, '#dashboard-new-document', 1000);
  await window.selectOption('#schema-version-select', '01.05');
  await window.waitForTimeout(2000);

  // Fill inputs
  const inputs = await window.$$('input[type="text"]');
  if (inputs.length > 0) {
    await inputs[0].fill('Test data');
  }

  await takeScreenshot(window, 'form-filled');
});
```

---

## Troubleshooting

### Issue: Tests fail with "element not visible"
**Solution:** Increase wait time or use `waitForElement()`
```javascript
await window.waitForTimeout(2000); // Wait for form render
await waitForElement(window, '.my-element');
```

### Issue: Tests fail with "element not found"
**Solution:** Check selector, ensure element exists in DOM
```javascript
// Debug: log all matching elements
const elements = await window.$$('.my-class');
console.log(`Found ${elements.length} elements`);
```

### Issue: Database state persists between tests
**Solution:** Run test:init before each test suite
```bash
npm run test:init && npm run test:e2e
```

### Issue: Tests timeout
**Solution:** Increase timeout in playwright.config.js or use `force: true`
```javascript
await saveBtn.click({ force: true }); // Skip actionability checks
```

### Issue: Can't see what's happening
**Solution:** Use headed mode
```bash
npm run test:e2e:headed
```

---

## Test Results

### HTML Report
```bash
npm run test:e2e:report
```
Opens interactive HTML report in browser.

### JSON Report
Location: `test-results/test-results.json`
Parsable for CI/CD integration.

### Console Output
Real-time test execution feedback with pass/fail counts.

---

## CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:init
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: test-results
          path: test-results/
```

---

## Writing New Tests

### Template
```javascript
/**
 * @file my-new-test.e2e.js
 * @description E2E tests for new feature
 */

const fixtures = require('./helpers/fixtures');
const test = fixtures.test;
const playwrightTest = require('@playwright/test');
const expect = playwrightTest.expect;
const electronAppHelpers = require('./helpers/electron-app');
const waitForElement = electronAppHelpers.waitForElement;
const clickAndWait = electronAppHelpers.clickAndWait;
const takeScreenshot = electronAppHelpers.takeScreenshot;
const isElementVisible = electronAppHelpers.isElementVisible;

test.describe('My New Feature Tests', () => {
  test('should do something', async ({ electronApp }) => {
    const { window } = electronApp;

    // Test logic here
    await clickAndWait(window, '#my-button', 1000);

    const result = await isElementVisible(window, '#my-result');
    expect(result).toBe(true);

    await takeScreenshot(window, 'my-test-complete');
  });
});
```

---

## Resources

- **Playwright Docs:** https://playwright.dev/
- **Playwright Electron:** https://playwright.dev/docs/api/class-electron
- **Test Results:** `test-results/html-report/index.html`
- **Coverage Report:** `E2E_TEST_COVERAGE_REPORT.md`

---

**Last Updated:** 2025-10-06
**Maintained by:** XML Editor Desktop Team
**Version:** 1.0.0
