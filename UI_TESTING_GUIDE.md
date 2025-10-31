# 🧪 UI Testing Guide

**Comprehensive UI testing for XML Editor Desktop**

---

## 🚀 Quick Start

### Method 1: Run in Browser Console (Recommended)

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Open DevTools Console:**
   - Press `F12` or `Cmd+Option+I` (Mac)
   - Switch to "Console" tab

3. **Copy-paste the test script:**
   ```bash
   cat scripts/ui-full-test.js | pbcopy  # macOS
   cat scripts/ui-full-test.js | xclip   # Linux
   ```

4. **Paste in console and press Enter**

5. **Wait for results** (~10 seconds)

---

## 📊 What Gets Tested

### 1️⃣ **Basic UI Structure**
- App container exists
- App Navigation (4 items)
- Sidebar exists
- Home Dashboard visible by default

### 2️⃣ **Navigation Functionality**
- Navigate to Home
- Navigate to Documents
- Navigate to Services
- Navigate to Settings
- Active state updates correctly
- Sidebar switches properly

### 3️⃣ **Service Store**
- Service Store exists
- Service cards rendered
- Card structure (icon, title, description, footer, buttons)
- Status badges (active, installed)

### 4️⃣ **Module Backend Integration**
- electronAPI available
- Module IPC methods (listModules, installModule, etc.)
- listModules works (loads from database)

### 5️⃣ **Buttons and Interactions**
- Quick Action cards
- Sidebar buttons
- Click handlers present

### 6️⃣ **CSS and Animations**
- CSS loaded
- CSS variables defined
- Animations defined (keyframes, transitions)
- Spinner animation exists

### 7️⃣ **Responsive Behavior**
- Viewport size
- Sidebar width (240px)
- App Nav height (60px)

### 8️⃣ **Error Handling**
- Toast system available
- showToast method exists
- Error state CSS classes

### 9️⃣ **Accessibility**
- ARIA labels on nav items
- Buttons have accessible names
- Semantic HTML (nav, main, aside, header)

### 🔟 **Performance**
- DOM size (< 1500 elements = good)
- Stylesheets loaded
- Console errors check

---

## 📈 Understanding Results

### Success Rate

```
🎯 Success Rate: 95%

✅ 90-100%: Excellent
⚠️  70-89%:  Good
❌ <70%:    Needs Work
```

### Test Output

```
✅ Test Passed
   Details or measurements

❌ Test Failed
   Error: What went wrong

⚠️  Test Warning
   Recommendation or note
```

---

## 🔍 Detailed Analysis

After running tests, results are saved to `window.testResults`:

```javascript
// Access in console:
window.testResults

// Structure:
{
  passed: [...],      // Array of passed tests
  failed: [...],      // Array of failed tests
  warnings: [...],    // Array of warnings
  stats: {
    total: 50,
    passed: 47,
    failed: 2,
    warnings: 1,
    duration: 8500
  }
}
```

---

## 🛠️ Troubleshooting

### "electronAPI not found"
**Problem:** App not fully initialized
**Solution:** Wait 2-3 seconds after app opens, then run test

### "Element not found" errors
**Problem:** Navigation or timing issue
**Solution:** Test script waits for animations, but you can increase delays:
```javascript
// In ui-full-test.js, line 20:
const config = {
  testDelay: 1000,        // Increase this (default: 500)
  animationDelay: 500,    // Increase this (default: 300)
  asyncTimeout: 10000     // Increase this (default: 5000)
};
```

### Many CSS-related warnings
**Problem:** CSS not fully loaded
**Solution:** Refresh app, wait for full load, then run test

---

## 📋 Manual Testing Checklist

Use this in addition to automated tests:

### Visual Inspection
- [ ] Fonts render correctly (no missing glyphs)
- [ ] Colors match design (primary blue #2563eb)
- [ ] Spacing looks consistent (8px grid)
- [ ] Icons display properly (emojis visible)

### Interactions
- [ ] Hover states work (buttons, cards)
- [ ] Click feedback immediate (< 16ms)
- [ ] Animations smooth (60fps)
- [ ] Modals center correctly

### Service Store
- [ ] Search filters services
- [ ] Filter pills work (All, Installed, Free, Pro)
- [ ] Install button → shows spinner
- [ ] Toast notification appears
- [ ] Badge updates after install

### Edge Cases
- [ ] Fast clicking doesn't break UI
- [ ] Rapid navigation works
- [ ] Back/forward browser buttons (N/A for Electron)
- [ ] Window resize maintains layout

### Browser Compatibility
- [ ] Electron (primary target) ✅
- [ ] Chrome DevTools
- [ ] Safari DevTools (Mac only)

---

## 🎯 Success Criteria

### Production Ready
- **Success Rate:** ≥ 95%
- **Failed Tests:** 0
- **Warnings:** ≤ 2
- **Duration:** < 15 seconds

### Acceptable for Development
- **Success Rate:** ≥ 85%
- **Failed Tests:** ≤ 3
- **Warnings:** ≤ 5
- **Duration:** < 30 seconds

### Needs Work
- **Success Rate:** < 85%
- **Failed Tests:** > 3
- **Warnings:** > 5

---

## 📚 Advanced Usage

### Run Specific Test Suite

Modify the script to skip suites:

```javascript
// Comment out suites you don't want:

// TEST SUITE 1: BASIC UI STRUCTURE
// console.log('\n%c1️⃣ BASIC UI STRUCTURE', ...);
// ... commented out ...

// TEST SUITE 2: NAVIGATION FUNCTIONALITY
console.log('\n%c2️⃣ NAVIGATION FUNCTIONALITY', ...);
// ... keep this ...
```

### Add Custom Tests

Add your own tests to the script:

```javascript
// TEST SUITE 11: CUSTOM TESTS
console.log('\n%c1️⃣1️⃣ MY CUSTOM TESTS', ...);

try {
  // Your test logic
  if (myCondition) {
    test.pass('My test name', 'Additional details');
  } else {
    throw new Error('Test failed because...');
  }
} catch (e) {
  test.fail('My test name', e);
}
```

### Export Results

```javascript
// After test completes:

// Export to JSON
const json = JSON.stringify(window.testResults, null, 2);
console.log(json);

// Copy to clipboard (if supported)
navigator.clipboard.writeText(json);

// Download as file (manual copy-paste)
console.save = function(data, filename) {
  // Implementation varies by environment
  // For Electron, use electronAPI
};
```

---

## 🔄 Continuous Testing

### Automated Testing Workflow

```bash
# 1. Start app
npm run dev

# 2. Run automated E2E tests
npm run test:e2e:smoke

# 3. Open app manually

# 4. Run UI full test script in console

# 5. Check results

# 6. Fix issues

# 7. Repeat
```

### Regression Testing

Before every commit:
1. Run `npm run test:e2e:smoke` (automated)
2. Run UI full test script (manual)
3. Check success rate ≥ 95%
4. Commit if passing

---

## 🐛 Known Limitations

### What Script CAN'T Test

1. **Visual Appearance**
   - Colors exact match
   - Font rendering quality
   - Image loading

2. **User Experience**
   - Subjective "feels smooth"
   - Aesthetic quality
   - User satisfaction

3. **Performance Under Load**
   - 1000+ service cards
   - Slow network
   - Low memory

4. **Browser Compatibility**
   - Only tests current environment
   - Not cross-browser

5. **Security**
   - XSS vulnerabilities
   - CSRF protection
   - Input sanitization

### Manual Testing Required For

- Visual regression testing
- Accessibility with screen readers
- Performance profiling
- Security audits
- User acceptance testing (UAT)

---

## 📞 Support

### If Tests Fail Unexpectedly

1. **Check Console** for JavaScript errors
2. **Refresh App** and try again
3. **Check CLAUDE.md** for known issues
4. **Report Issue** with test results

### Reporting Issues

Include:
1. Test script output (copy from console)
2. `window.testResults` JSON
3. Screenshot of app state
4. Steps to reproduce

---

## ✅ Checklist: Before Production

- [ ] UI full test: 95%+ success rate
- [ ] E2E tests: All passing
- [ ] Manual testing: Checklist complete
- [ ] No console errors
- [ ] Performance acceptable (< 3s load time)
- [ ] Accessibility audit passed
- [ ] Cross-platform tested (Mac/Windows/Linux)

---

**Version:** 1.0.0
**Last Updated:** October 16, 2025
**Author:** Claude Code
