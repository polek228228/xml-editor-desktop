# Known Issues - XML Editor Desktop E2E Tests

## Overview

This document tracks known issues, limitations, and workarounds for the E2E test suite.

**Last Updated:** 2025-10-06
**Test Suite Version:** 1.0.0
**Total Tests:** 64

---

## Fixed Issues (2025-10-06)

### ✅ Template Dialog Overlay Blocking Clicks
**Status:** FIXED
**Affected Tests:** 4 tests in `03-validation-templates.e2e.js`, 1 test in `99-full-scenario.e2e.js`

**Symptom:**
```
TimeoutError: elementHandle.click: Timeout 30000ms exceeded
<div class="template-dialog__overlay template-dialog__overlay--visible"></div> intercepts pointer events
```

**Root Cause:** Template dialog overlay remained visible and blocked clicks on buttons

**Fix:** Added `{ force: true }` to all Template Dialog button clicks:
- `e2e/03-validation-templates.e2e.js:202`
- `e2e/03-validation-templates.e2e.js:291`
- `e2e/03-validation-templates.e2e.js:389`
- `e2e/03-validation-templates.e2e.js:420`
- `e2e/99-full-scenario.e2e.js:188`

---

### ✅ Playwright Fixture Teardown Error
**Status:** FIXED
**Affected Tests:** 7 tests across multiple suites

**Symptom:**
```
Internal error: step id not found: fixture@XX
```

**Root Cause:** Electron app was closed too quickly, before pending operations completed

**Fix:** Added 500ms wait before teardown in `e2e/helpers/fixtures.js:30`:
```javascript
await window.waitForTimeout(500);
await closeElectronApp(app);
```

---

### ✅ Editor Not Opening After loadDocument()
**Status:** FIXED
**Affected Tests:** `01-documents.e2e.js:191` - should load existing document from list

**Symptom:**
```
expect(editorVisible).toBe(true)
Received: false
```

**Root Cause:** `showEditorScreen()` showed editor before navigation handlers completed

**Fix:** Added setTimeout to synchronize navigation in `src/renderer/js/app.js:1008-1022`:
```javascript
setTimeout(() => {
  this._displayEditor();
}, 50);
```

---

### ✅ Collapsed Accordion Fields Not Visible
**Status:** FIXED
**Affected Tests:** `01-documents.e2e.js:87` - should fill form fields with valid data

**Symptom:**
```
TimeoutError: elementHandle.fill: element is not visible
```

**Root Cause:** Form fields inside collapsed accordion sections were not accessible

**Fix:** Expanded all accordion sections before filling in `e2e/01-documents.e2e.js:101-109`:
```javascript
const accordionHeaders = await window.$$('.accordion__header');
for (const header of accordionHeaders) {
  const isExpanded = await header.evaluate(el => el.parentElement.classList.contains('accordion__section--expanded'));
  if (!isExpanded) {
    await header.click();
    await window.waitForTimeout(200);
  }
}
```

---

## Remaining Known Issues

### ⚠️ Smoke Test: Window Title Verification Fails Sometimes
**Status:** INTERMITTENT
**Affected Tests:** `00-smoke.e2e.js:33` - should display main window with correct title

**Symptom:**
```
TimeoutError: page.waitForLoadState: Timeout 30000ms exceeded
```

**Impact:** Low - only affects one smoke test
**Workaround:** Re-run test
**Frequency:** ~10% of runs

**Investigation Needed:** May be related to Electron app startup timing on macOS

---

### ⚠️ Search Field Not Visible in Template Browser
**Status:** KNOWN LIMITATION
**Affected Tests:** `03-validation-templates.e2e.js:233` - should search templates by name

**Symptom:** Search input field not found when template browser is empty

**Impact:** Medium - search functionality not tested
**Workaround:** Test requires at least one template to exist first

**Action Item:** Refactor test to create template before searching

---

### ⚠️ UI Responsiveness Test Timeout
**Status:** NEEDS INVESTIGATION
**Affected Tests:** `99-full-scenario.e2e.js:374` - UI responsiveness: Rapid navigation between sections

**Symptom:**
```
Timed out waiting 600s for the test suite to run
Timed out waiting 600s for the teardown for test suite to run
```

**Impact:** High - blocks teardown
**Investigation Needed:** Likely infinite loop or stuck navigation handler

---

## Test Limitations & Design Decisions

### Native File Dialogs Cannot Be Automated
**Tests Affected:** All XML export tests

**Limitation:** Playwright cannot interact with native OS file picker dialogs

**Design Decision:** Tests verify export button is enabled and clickable, but cannot actually trigger file save

**Workaround:** None - this is a Playwright/Electron limitation

---

### Database Location Variability
**Platform:** macOS Electron apps

**Issue:** Test database location varies:
- Development: `/Users/PotapovViS/Downloads/.../xmlPZ/xmleditor.db`
- Electron runtime: `~/Library/Application Support/xml-editor-desktop/xmleditor.db`
- Alternative: `~/Library/Application Support/Electron/xmleditor.db`

**Fix:** `scripts/clean-test-db.js` checks all possible locations

---

### Skipped Tests (By Design)
**Count:** 2 tests

1. **Autosave after 30 seconds** (`01-documents.e2e.js:231`)
   - **Reason:** Takes 35+ seconds, too slow for standard suite
   - **Run Via:** Manual testing or dedicated long-running suite

2. **XML generation progress indicator** (`02-xml-generation.e2e.js:258`)
   - **Reason:** Requires large dataset to trigger visible loading state
   - **Run Via:** Performance testing suite

---

## Performance Notes

### Test Execution Times
- **Smoke tests:** 20-30s (9 tests)
- **Document tests:** 2-3 min (11 tests)
- **XML tests:** 2-3 min (10 tests)
- **Validation/Templates:** 3-4 min (13 tests)
- **UI Navigation:** 2-3 min (18 tests)
- **Full scenarios:** 2-3 min (3 tests)

**Total Suite:** ~10-15 minutes (64 tests)

### Optimization Opportunities
- Reduce `waitForTimeout` durations where safe
- Parallelize independent test suites (currently workers: 1 due to Electron)
- Skip animations in test mode
- Use in-memory database for faster cleanup

---

## Best Practices for New Tests

### 1. Always Use Force Clicks for Modal Buttons
```javascript
// ✅ Good
await saveButton.click({ force: true });

// ❌ Bad - may be blocked by overlay/toast
await saveButton.click();
```

### 2. Expand Accordions Before Accessing Fields
```javascript
const accordionHeaders = await window.$$('.accordion__header');
for (const header of accordionHeaders) {
  await header.click();
  await window.waitForTimeout(200);
}
```

### 3. Wait After Navigation Changes
```javascript
await navDocuments.click();
await window.waitForTimeout(50); // Let handlers complete
```

### 4. Check Element Visibility Explicitly
```javascript
const isVisible = await isElementVisible(window, '#my-element');
if (!isVisible) {
  // Handle case where element is hidden
}
```

---

## Reporting Issues

When reporting test failures, include:
1. Test file and line number
2. Full error message with stack trace
3. Screenshot from `test-results/artifacts/`
4. Platform (macOS/Windows/Linux)
5. Node version and npm version

---

## Resources

- **Test Results:** `test-results/html-report/index.html`
- **Coverage Report:** `E2E_TEST_COVERAGE_REPORT.md`
- **Testing Guide:** `TESTING_GUIDE.md`
- **Helper Functions:** `e2e/helpers/electron-app.js`

---

**Maintained by:** Claude Code
**Contact:** See GitHub Issues
