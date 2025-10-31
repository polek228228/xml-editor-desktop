# 🐛 Bugfix: Plugin System References Removed

**Date:** October 16, 2025, 19:00
**Status:** ✅ FIXED
**Priority:** HIGH (App wouldn't start)

---

## 🚨 Problem

App crashed on startup with errors:

```
GET file://.../src/core/plugin-system/event-bus.js net::ERR_FILE_NOT_FOUND
GET file://.../src/core/plugin-system/command-registry.js net::ERR_FILE_NOT_FOUND
GET file://.../src/core/state/tab-manager.js net::ERR_FILE_NOT_FOUND
...

app.js:73 Uncaught (in promise) ReferenceError: TabManager is not defined
    at XMLEditorApp.initPluginSystem (app.js:73:29)
```

**Root Cause:**
These files were removed during Gemini code cleanup (Week 4), but references remained in:
- `index.html` (script tags)
- `app.js` (initPluginSystem method)

---

## ✅ Solution

### 1. Commented Out Script Tags in index.html

**File:** `src/renderer/index.html` (lines 513-527)

**Before:**
```html
<!-- Plugin System Core -->
<script src="../core/plugin-system/event-bus.js"></script>
<script src="../core/plugin-system/command-registry.js"></script>
...
```

**After:**
```html
<!-- Plugin System Core - DISABLED until Week 6 -->
<!-- These files were removed during Gemini code cleanup -->
<!-- Will be reimplemented in Week 6 with ModuleRegistry and PluginLoader -->
<!--
<script src="../core/plugin-system/event-bus.js"></script>
<script src="../core/plugin-system/command-registry.js"></script>
...
-->
```

---

### 2. Disabled initPluginSystem in app.js

**File:** `src/renderer/js/app.js` (lines 52-115)

**Change 1: Commented out call**
```javascript
// Line 56 (in init method)
// await this.initPluginSystem(); // DISABLED - Will be reimplemented in Week 6
```

**Change 2: Added early return in method**
```javascript
async initPluginSystem() {
  console.log('🔌 Plugin System initialization skipped (Week 6)');

  // Placeholder - will be implemented in Week 6
  // For now, Service Store handles module database operations
  // Actual module loading will come later

  return; // Early return - rest of code is commented out

  /* OLD CODE - REMOVED
  ...
  */
}
```

---

## 📋 Files Removed (During Gemini Cleanup)

These files no longer exist in the codebase:

```
src/core/plugin-system/
├── event-bus.js
├── command-registry.js
├── plugin-api.js
├── service-registry.js
└── lifecycle-manager.js

src/core/state/
├── workspace-manager.js
└── tab-manager.js

src/core/auth/
└── auth-dialog.js
```

**Reason:** Incomplete/non-functional Gemini implementation (see GEMINI_AUDIT_REPORT.md)

---

## 🧪 Testing

### Before Fix
```
❌ App crashes on startup
❌ TabManager is not defined
❌ 8 files ERR_FILE_NOT_FOUND
```

### After Fix
```bash
npm run dev
# App starts successfully ✅
# No console errors related to plugin system ✅
# Service Store works ✅

npm run test:e2e:smoke
# 9/9 tests passing ✅
```

---

## 📝 Notes

**Why not delete the code entirely?**
- Keeping it commented for Week 6 reference
- Shows what was attempted before
- Explains why plugin system is "disabled"

**When will plugin system be enabled?**
- Week 6: Module Loading System
- Will be reimplemented properly with:
  - ModuleRegistry class
  - PluginLoader class
  - Module API
  - Sandboxing/permissions

**Does Service Store still work?**
- YES! ✅
- Service Store only uses IPC handlers (module:list, module:install, etc.)
- Those are in main.js and work perfectly
- Module loading (actually running the module code) will come in Week 6

---

## ✅ Impact

**Before:**
- ❌ App crashed on startup
- ❌ Couldn't test Service Store
- ❌ Development blocked

**After:**
- ✅ App starts cleanly
- ✅ Service Store fully functional
- ✅ Ready for Week 6 development

---

**Status:** ✅ FIXED
**Time to Fix:** 15 minutes
**Regression Risk:** Low (proper comments explain future implementation)
