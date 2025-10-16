# Testing Guide - XML Editor Desktop

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Clean database and run tests
npm run test:init && npm run test:e2e

# 3. View results
npm run test:e2e:report
```

---

## Test Commands

### Running Tests

```bash
# Run all E2E tests (64 tests)
npm run test:e2e

# Run with visible browser
npm run test:e2e:headed

# Debug mode with Playwright Inspector
npm run test:e2e:debug

# Run specific test suites
npm run test:e2e:smoke      # 9 smoke tests
npm run test:e2e:docs       # 21 document/XML tests
npm run test:e2e:templates  # 13 validation/template tests
npm run test:e2e:ui         # 18 UI/navigation tests
npm run test:e2e:full       # 3 complete E2E scenarios
```

### Reports

```bash
# Generate test report
npm run test:report

# View report
npm run test:report:view

# View HTML report in browser
npm run test:e2e:report
```

### Database

```bash
# Clean test database
npm run db:clean

# Initialize database
npm run db:init

# Clean and init (before tests)
npm run test:init
```

---

## Test Structure

```
e2e/
├── helpers/
│   ├── electron-app.js      # Electron helpers
│   └── fixtures.js          # Test fixtures
├── 00-smoke.e2e.js          # 9 smoke tests
├── 01-documents.e2e.js      # 11 document tests
├── 02-xml-generation.e2e.js # 10 XML tests
├── 03-validation-templates.e2e.js # 13 validation/template tests
├── 04-ui-navigation.e2e.js  # 18 UI tests
└── 99-full-scenario.e2e.js  # 3 E2E scenarios
```

**Total: 64 tests**

---

## CI/CD

### GitHub Actions

Tests run automatically on:
- Push to `main` or `develop`
- Pull requests
- Manual workflow dispatch

See: `.github/workflows/e2e-tests.yml`

### Local CI simulation

```bash
npm run test:e2e:ci
```

---

## Test Coverage

### Week 1-2: Infrastructure & Documents
- ✅ Document CRUD operations
- ✅ Form rendering and validation
- ✅ Schema selection (01.03, 01.04, 01.05)
- ✅ XML generation
- ✅ XML export
- ✅ Autosave mechanism

### Week 3: Validation & Templates
- ✅ XML validation (success/errors)
- ✅ Template creation from document
- ✅ Template browser
- ✅ Template search/filter
- ✅ Load document from template

### Week 4: UI Architecture
- ✅ 3-level navigation
- ✅ Dynamic sidebar
- ✅ Service Store
- ✅ Context toolbar
- ✅ Statistics & activity

---

## Debugging

### Visual Debugging

```bash
# Watch tests run with visible window
npm run test:e2e:headed
```

### Step-by-Step Debugging

```bash
# Use Playwright Inspector
npm run test:e2e:debug
```

### Check Screenshots

Failed tests automatically capture:
- Screenshots: `test-results/artifacts/*.png`
- Videos: `test-results/artifacts/*.webm`

### View Test Logs

```bash
# HTML report with full logs
npm run test:e2e:report
```

---

## Writing New Tests

### Template

```javascript
const fixtures = require('./helpers/fixtures');
const test = fixtures.test;
const playwrightTest = require('@playwright/test');
const expect = playwrightTest.expect;
const electronAppHelpers = require('./helpers/electron-app');
const { waitForElement, clickAndWait, takeScreenshot } = electronAppHelpers;

test.describe('My Feature Tests', () => {
  test('should do something', async ({ electronApp }) => {
    const { window } = electronApp;

    await clickAndWait(window, '#my-button', 1000);
    await takeScreenshot(window, 'my-feature-test');

    const result = await window.textContent('#result');
    expect(result).toContain('expected text');
  });
});
```

### Best Practices

1. **Use fixtures** - automatic app lifecycle
2. **Wait for elements** - use `waitForElement()`
3. **Take screenshots** - helps debug failures
4. **Clean database** - run `npm run test:init` first
5. **Describe clearly** - good test names

---

## Troubleshooting

### Tests fail with "element not found"

**Solution:** Add wait time or use `waitForElement()`
```javascript
await waitForElement(window, '.my-element');
```

### Database state persists

**Solution:** Clean database before tests
```bash
npm run test:init && npm run test:e2e
```

### Tests timeout

**Solution:** Increase timeout in `playwright.config.js`
```javascript
timeout: 5 * 60 * 1000, // 5 minutes
```

### Can't see what's happening

**Solution:** Run in headed mode
```bash
npm run test:e2e:headed
```

---

## Performance

### Test Execution Times

- **Smoke tests:** ~20-30s (9 tests)
- **Document tests:** ~2-3min (21 tests)
- **Full suite:** ~10-15min (64 tests)

### Optimization Tips

1. Run smoke tests first for quick feedback
2. Use `--grep` to run specific tests
3. Parallel workers disabled (Electron requirement)
4. Database cleanup adds ~1s overhead

---

## Reports & Metrics

### Test Report

```bash
npm run test:report
```

Generates `E2E_TEST_REPORT.md` with:
- Pass/fail statistics
- Suite breakdown
- Failed tests analysis
- Recommendations

### Coverage Report

See: `E2E_TEST_COVERAGE_REPORT.md`

Contains:
- Feature coverage by week
- Known issues
- Test suite details
- CI/CD readiness

---

## Current Status

✅ **64 tests implemented**
✅ **Critical bugs fixed**
✅ **CI/CD ready**
✅ **Comprehensive documentation**

**Next Steps:**
1. Achieve 100% pass rate
2. Add visual regression tests
3. Integrate accessibility testing
4. Set up performance benchmarks

---

## Resources

- **Playwright Docs:** https://playwright.dev/
- **Test Results:** `test-results/html-report/index.html`
- **Coverage Report:** `E2E_TEST_COVERAGE_REPORT.md`
- **Helper Functions:** `e2e/helpers/electron-app.js`

---

**Last Updated:** 2025-10-06
**Version:** 1.0.0
