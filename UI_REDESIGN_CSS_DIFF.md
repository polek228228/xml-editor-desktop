# UI Redesign CSS Changes - Before & After

**Purpose:** Side-by-side comparison of CSS changes for the iOS/macOS-inspired redesign

---

## CSS Variables Comparison

### BEFORE (Current - Utilitarian)

```css
:root {
  /* Colors - Harsh, cold */
  --color-primary: #2563eb;        /* Electric blue */
  --color-primary-dark: #1d4ed8;
  --color-primary-light: #3b82f6;
  --color-secondary: #64748b;      /* Slate gray */
  --color-accent: #10b981;         /* Emerald */
  --color-danger: #ef4444;         /* Red */

  /* Neutrals - Cold gray */
  --color-bg: #f8fafc;             /* Slate 50 */
  --color-bg-secondary: #f1f5f9;   /* Slate 100 */
  --color-surface: #ffffff;        /* Flat white */
  --color-border: #e2e8f0;         /* Barely visible */
  --color-text: #1e293b;           /* Slate 800 */
  --color-text-secondary: #64748b; /* Slate 500 */

  /* Spacing - Cramped */
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */
  --spacing-2xl: 3rem;     /* 48px */

  /* Typography - Generic */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-size-xs: 0.75rem;   /* 12px */
  --font-size-sm: 0.875rem;  /* 14px */
  --font-size-base: 1rem;    /* 16px */
  --font-size-lg: 1.125rem;  /* 18px */
  --font-size-xl: 1.25rem;   /* 20px */
  --font-size-2xl: 1.5rem;   /* 24px */
  --font-size-3xl: 1.875rem; /* 30px */

  /* Borders - Sharp */
  --border-radius: 0.375rem;    /* 6px */
  --border-radius-lg: 0.5rem;   /* 8px */
  --border-width: 1px;

  /* Shadows - Weak */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

  /* Transitions - Abrupt */
  --transition: all 0.2s ease-in-out;
}
```

### AFTER (Redesign - iOS/macOS Inspired)

```css
:root {
  /* ==================== SPACING (More Generous) ==================== */
  --space-1: 4px;      /* 0.25rem */
  --space-2: 8px;      /* 0.5rem */
  --space-3: 12px;     /* 0.75rem - NEW */
  --space-4: 16px;     /* 1rem */
  --space-5: 20px;     /* 1.25rem - NEW */
  --space-6: 24px;     /* 1.5rem */
  --space-8: 32px;     /* 2rem */
  --space-10: 40px;    /* 2.5rem - NEW */
  --space-12: 48px;    /* 3rem */
  --space-16: 64px;    /* 4rem - NEW */
  --space-20: 80px;    /* 5rem - NEW */

  /* ==================== COLORS (Warm, Vibrant) ==================== */

  /* Blue - Softer, more vibrant */
  --blue-50: #eff6ff;
  --blue-100: #dbeafe;
  --blue-500: #3b82f6;     /* Main primary - lighter than before */
  --blue-600: #2563eb;
  --blue-700: #1d4ed8;

  /* Teal - Success */
  --teal-400: #2dd4bf;
  --teal-500: #14b8a6;
  --teal-600: #0d9488;

  /* Rose - Danger (softer than red) */
  --rose-400: #fb7185;
  --rose-500: #f43f5e;
  --rose-600: #e11d48;

  /* Amber - Warning */
  --amber-400: #fbbf24;
  --amber-500: #f59e0b;
  --amber-600: #d97706;

  /* Neutral - Warm gray (not cold slate) */
  --neutral-50: #fafaf9;    /* Warmer than slate-50 */
  --neutral-100: #f5f5f4;
  --neutral-200: #e7e5e4;
  --neutral-300: #d6d3d1;
  --neutral-400: #a8a29e;
  --neutral-600: #57534e;
  --neutral-900: #1c1917;

  /* Semantic Colors */
  --color-primary: var(--blue-500);
  --color-primary-hover: var(--blue-600);
  --color-success: var(--teal-500);
  --color-warning: var(--amber-500);
  --color-danger: var(--rose-500);

  /* Backgrounds - With transparency */
  --color-bg-base: var(--neutral-50);
  --color-bg-elevated: #ffffff;
  --color-surface: rgba(255, 255, 255, 0.8);           /* NEW - Semi-transparent */
  --color-surface-glass: rgba(255, 255, 255, 0.72);    /* NEW - Glassmorphism */
  --color-surface-hover: rgba(255, 255, 255, 0.9);     /* NEW */

  /* Text - Warmer */
  --color-text-primary: var(--neutral-900);
  --color-text-secondary: var(--neutral-600);
  --color-text-tertiary: var(--neutral-400);           /* NEW */
  --color-text-inverse: #ffffff;                       /* NEW */

  /* Borders */
  --color-border: var(--neutral-200);
  --color-border-strong: var(--neutral-300);           /* NEW */
  --color-border-glass: rgba(255, 255, 255, 0.18);     /* NEW - For glass */

  /* ==================== TYPOGRAPHY (SF Pro Display) ==================== */

  /* Font Families */
  --font-display: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;  /* NEW */
  --font-text: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;        /* NEW */
  --font-mono: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace;                          /* NEW */

  /* Font Sizes - iOS scale (15px base instead of 16px) */
  --font-xs: 11px;     /* 0.6875rem - Smaller for captions */
  --font-sm: 13px;     /* 0.8125rem */
  --font-base: 15px;   /* 0.9375rem - iOS default */
  --font-lg: 17px;     /* 1.0625rem */
  --font-xl: 22px;     /* 1.375rem */
  --font-2xl: 28px;    /* 1.75rem */
  --font-3xl: 34px;    /* 2.125rem - Large titles */
  --font-4xl: 48px;    /* 3rem - NEW - Hero text */

  /* Font Weights - Full range */
  --weight-light: 300;       /* NEW */
  --weight-regular: 400;     /* NEW */
  --weight-medium: 500;      /* NEW */
  --weight-semibold: 600;    /* NEW */
  --weight-bold: 700;        /* NEW */

  /* Line Heights */
  --leading-tight: 1.25;     /* NEW */
  --leading-normal: 1.5;     /* NEW */
  --leading-relaxed: 1.75;   /* NEW */

  /* ==================== BORDERS & RADIUS (Rounded) ==================== */

  /* Border Radius - More rounded */
  --radius-xs: 6px;          /* NEW - Small elements */
  --radius-sm: 8px;          /* NEW */
  --radius-md: 12px;         /* Main (was 6px) */
  --radius-lg: 16px;         /* Large (was 8px) */
  --radius-xl: 20px;         /* NEW - Feature cards */
  --radius-2xl: 24px;        /* NEW - Overlays */
  --radius-full: 9999px;     /* NEW - Pills */

  /* ==================== SHADOWS (5-Level Depth System) ==================== */

  /* Level 0: Flat */
  --shadow-none: none;

  /* Level 1: Slightly raised (buttons, inputs) */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04),
               0 1px 1px rgba(0, 0, 0, 0.06);

  /* Level 2: Floating (cards) */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08),
               0 1px 4px rgba(0, 0, 0, 0.08);

  /* Level 3: Elevated (active cards, popovers) */
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.12),
               0 2px 8px rgba(0, 0, 0, 0.08);

  /* Level 4: High elevation (modals) */
  --shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.16),
               0 6px 20px rgba(0, 0, 0, 0.12);

  /* Level 5: Maximum elevation (tooltips) */
  --shadow-xl: 0 20px 64px rgba(0, 0, 0, 0.20),
               0 10px 32px rgba(0, 0, 0, 0.16);

  /* Colored shadows for emphasis - NEW */
  --shadow-primary: 0 4px 16px rgba(59, 130, 246, 0.24);
  --shadow-success: 0 4px 16px rgba(20, 184, 166, 0.24);
  --shadow-danger: 0 4px 16px rgba(244, 63, 94, 0.24);

  /* ==================== ANIMATIONS (Spring Physics) ==================== */

  /* Durations */
  --duration-instant: 100ms;   /* NEW - Micro-interactions */
  --duration-fast: 200ms;      /* Hover states */
  --duration-normal: 300ms;    /* Standard (was 200ms) */
  --duration-slow: 500ms;      /* NEW - Complex animations */
  --duration-slower: 700ms;    /* NEW - Page transitions */

  /* Easing Functions - iOS curves */
  --ease-linear: linear;                              /* NEW */
  --ease-in: cubic-bezier(0.42, 0, 1, 1);            /* NEW */
  --ease-out: cubic-bezier(0, 0, 0.58, 1);           /* NEW */
  --ease-in-out: cubic-bezier(0.42, 0, 0.58, 1);     /* NEW */

  /* Spring physics - NEW */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-emphasized: cubic-bezier(0.05, 0.7, 0.1, 1.0);

  /* ==================== Z-INDEX LAYERS ==================== */
  --z-base: 1;               /* NEW */
  --z-dropdown: 100;         /* NEW */
  --z-sticky: 200;           /* NEW */
  --z-fixed: 300;            /* NEW */
  --z-modal-backdrop: 400;   /* NEW */
  --z-modal: 500;            /* NEW */
  --z-popover: 600;          /* NEW */
  --z-tooltip: 700;          /* NEW */

  /* ==================== BLUR & FILTERS (Glassmorphism) ==================== */
  --blur-sm: blur(4px);      /* NEW */
  --blur-md: blur(12px);     /* NEW */
  --blur-lg: blur(20px);     /* NEW - Main glassmorphism */
  --blur-xl: blur(40px);     /* NEW */

  /* Glassmorphism presets - NEW */
  --glass-light: rgba(255, 255, 255, 0.72);
  --glass-medium: rgba(255, 255, 255, 0.5);
  --glass-dark: rgba(0, 0, 0, 0.5);
}
```

---

## Component Comparisons

### Button Component

#### BEFORE
```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);              /* 8px */
  padding: var(--spacing-sm) var(--spacing-md);  /* 8px 16px */
  font-size: var(--font-size-sm);      /* 14px */
  font-weight: 500;
  border: var(--border-width) solid transparent;
  border-radius: var(--border-radius);  /* 6px - SHARP */
  cursor: pointer;
  transition: var(--transition);        /* 0.2s - FAST */
  background-color: var(--color-surface);
  color: var(--color-text);
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);         /* Weak shadow */
}

.btn:active:not(:disabled) {
  transform: translateY(0);             /* Just vertical */
}

.btn--primary {
  background-color: var(--color-primary);  /* #2563eb - HARSH */
  color: white;
}
```

#### AFTER
```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);                  /* 12px - MORE SPACE */
  padding: var(--space-3) var(--space-6);  /* 12px 24px - ROOMIER */
  font-size: var(--font-base);          /* 15px - iOS default */
  font-weight: var(--weight-semibold);  /* 600 - BOLDER */
  font-family: var(--font-text);        /* SF Pro Text */
  border: none;                         /* No border on primary */
  border-radius: var(--radius-full);    /* 9999px - PILL SHAPE */
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-smooth);  /* 200ms spring */
  background: var(--color-primary);     /* #3b82f6 - SOFTER */
  color: var(--color-text-inverse);
  box-shadow: var(--shadow-xs);         /* Subtle initial shadow */
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);          /* Lift more */
  box-shadow: var(--shadow-md);         /* Stronger shadow */
  background: var(--color-primary-hover);
}

.btn:active:not(:disabled) {
  transform: scale(0.96);               /* SPRING PRESS - NEW */
  box-shadow: var(--shadow-xs);
  transition: transform var(--duration-instant) var(--ease-spring);
}

.btn--primary {
  background: var(--color-primary);
  box-shadow: var(--shadow-primary);    /* Colored shadow - NEW */
}
```

**Key Changes:**
- ✅ Pill shape (`border-radius: 9999px`) instead of 6px
- ✅ Spring press animation (`scale(0.96)`) on active
- ✅ More generous padding (12px 24px vs 8px 16px)
- ✅ Colored shadow for emphasis
- ✅ Softer blue color (#3b82f6)
- ✅ SF Pro Text font

---

### Service Card Component

#### BEFORE
```css
.service-card {
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);  /* 8px - SHARP */
  padding: var(--spacing-lg);              /* 24px */
  transition: all 0.3s;                    /* LINEAR easing */
}

.service-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);  /* OK shadow */
  transform: translateY(-4px);                  /* Just vertical */
}

.service-card__icon {
  font-size: 32px;  /* EMOJI - unprofessional */
}
```

#### AFTER
```css
.service-card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);         /* 16px - ROUNDED */
  padding: var(--space-6);                 /* 24px */
  box-shadow: var(--shadow-sm);            /* Initial depth */
  transition: all var(--duration-normal) var(--ease-smooth);  /* Spring curve */
}

.service-card:hover {
  box-shadow: var(--shadow-lg);            /* MUCH stronger lift */
  transform: translateY(-4px) scale(1.02); /* Lift + grow - NEW */
  border-color: var(--color-primary);      /* Highlight - NEW */
}

.service-card__icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  /* SVG icon instead of emoji */
}

.service-card__icon svg {
  width: 100%;
  height: 100%;
  stroke-width: 2px;                       /* SF Symbols style */
}
```

**Key Changes:**
- ✅ 16px border radius (was 8px)
- ✅ `scale(1.02)` on hover for subtle growth
- ✅ Stronger shadow on hover (`--shadow-lg`)
- ✅ Border color change on hover
- ✅ SVG icons instead of emoji
- ✅ Spring easing curve

---

### Sidebar Component

#### BEFORE
```css
.sidebar {
  position: fixed;
  left: 48px;
  top: 60px;
  bottom: 0;
  width: 240px;
  background-color: var(--color-surface);  /* SOLID white */
  border-right: var(--border-width) solid var(--color-border);
  overflow-y: auto;
  z-index: 50;
}

.sidebar__section {
  padding: var(--spacing-md);  /* 16px - CRAMPED */
}

.sidebar__title {
  font-size: var(--font-size-lg);    /* 18px */
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
}
```

#### AFTER
```css
.sidebar {
  position: fixed;
  left: 48px;
  top: 60px;
  bottom: 0;
  width: 240px;

  /* GLASSMORPHISM - NEW */
  background: var(--color-surface-glass);       /* Semi-transparent */
  backdrop-filter: blur(20px) saturate(180%);  /* Blur + saturation */
  -webkit-backdrop-filter: blur(20px) saturate(180%);  /* Safari */

  border-right: 1px solid var(--color-border-glass);  /* Subtle border */
  box-shadow: var(--shadow-sm);
  overflow-y: auto;
  z-index: var(--z-sticky);

  /* Smooth transitions */
  transition: transform var(--duration-normal) var(--ease-emphasized);
}

.sidebar__section {
  padding: var(--space-6);  /* 24px - MORE SPACE */
  margin-bottom: var(--space-4);
}

.sidebar__title {
  font-size: var(--font-xl);        /* 22px - BIGGER */
  font-weight: var(--weight-bold);  /* 700 - BOLDER */
  font-family: var(--font-display); /* SF Pro Display */
  color: var(--color-text-primary);
  margin-bottom: var(--space-4);
  letter-spacing: -0.02em;          /* Tight tracking - NEW */
}
```

**Key Changes:**
- ✅ Glassmorphism (`backdrop-filter: blur(20px)`)
- ✅ Semi-transparent background
- ✅ More padding (24px vs 16px)
- ✅ Larger title (22px vs 18px)
- ✅ SF Pro Display font
- ✅ Tighter letter spacing
- ✅ Stronger font weight (700 vs 600)

---

### Modal Component

#### BEFORE
```css
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--color-surface);  /* FLAT white */
  border-radius: var(--border-radius-lg);  /* 8px */
  padding: var(--spacing-xl);              /* 32px */
  box-shadow: var(--shadow-lg);
  animation: modalSlideIn 0.2s ease-out;   /* 200ms - TOO FAST */
  z-index: 1000;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translate(-50%, -48%);  /* Just vertical */
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);  /* Solid black */
  z-index: 999;
}
```

#### AFTER
```css
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  /* Glassmorphism - NEW */
  background: var(--color-surface-glass);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);

  border: 1px solid var(--color-border-glass);
  border-radius: var(--radius-xl);         /* 20px - MORE ROUNDED */
  padding: var(--space-8);                 /* 32px */
  box-shadow: var(--shadow-xl);            /* Maximum elevation */

  /* Smooth entrance animation */
  animation: modalEnter var(--duration-slow) var(--ease-emphasized);
  z-index: var(--z-modal);
}

@keyframes modalEnter {
  from {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);  /* Slide + scale - NEW */
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.modal-overlay {
  position: fixed;
  inset: 0;

  /* Glassmorphic overlay - NEW */
  background: rgba(0, 0, 0, 0.3);          /* Lighter */
  backdrop-filter: blur(8px);              /* Blur background */
  -webkit-backdrop-filter: blur(8px);

  animation: fadeIn var(--duration-normal) ease-out;
  z-index: var(--z-modal-backdrop);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**Key Changes:**
- ✅ Glassmorphic modal background
- ✅ 20px border radius (was 8px)
- ✅ Scale animation on enter (`scale(0.96)` → `scale(1)`)
- ✅ Longer animation duration (500ms vs 200ms)
- ✅ Blurred overlay background
- ✅ Lighter overlay (30% vs 50% opacity)
- ✅ Emphasized easing curve

---

## Animation Examples

### Button Press Animation

#### BEFORE
```css
.btn:active:not(:disabled) {
  transform: translateY(0);  /* Just reset position */
}
```

#### AFTER
```css
.btn:active:not(:disabled) {
  /* Spring press - feels tactile */
  transform: scale(0.96);
  box-shadow: var(--shadow-xs);
  transition: transform var(--duration-instant) var(--ease-spring);
}

/* Returns to normal with spring */
.btn:not(:active) {
  transition: all var(--duration-fast) var(--ease-smooth);
}
```

### Card Hover Animation

#### BEFORE
```css
.service-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);          /* Just lift */
  transition: all 0.3s;                 /* Linear */
}
```

#### AFTER
```css
.service-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px) scale(1.02);  /* Lift + subtle grow */
  border-color: var(--color-primary);
  transition: all var(--duration-normal) var(--ease-smooth);
}

/* Smooth return */
.service-card {
  transition: all var(--duration-normal) var(--ease-smooth);
}
```

### Loading Spinner

#### BEFORE
```css
.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--color-primary);  /* #2563eb - harsh */
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

#### AFTER
```css
.loading-spinner {
  border: 3px solid var(--neutral-200);
  border-top-color: var(--color-primary);  /* #3b82f6 - softer */
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 0.8s var(--ease-smooth) infinite;  /* Smooth, faster */
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Alternative: iOS-style activity indicator */
.loading-spinner--ios {
  width: 40px;
  height: 40px;
  position: relative;
}

.loading-spinner--ios::before {
  content: '';
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: var(--color-primary);
  animation: spin 0.8s var(--ease-smooth) infinite;
}
```

---

## Glassmorphism Implementation

### Basic Glassmorphism
```css
/* Standard glass effect */
.glass-panel {
  background: var(--color-surface-glass);    /* rgba(255, 255, 255, 0.72) */
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--color-border-glass);  /* rgba(255, 255, 255, 0.18) */
  box-shadow: var(--shadow-sm);
}

/* Fallback for browsers without backdrop-filter support */
@supports not (backdrop-filter: blur(20px)) {
  .glass-panel {
    background: rgba(255, 255, 255, 0.95);  /* Opaque fallback */
  }
}
```

### Context Toolbar with Glass
```css
.context-toolbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;

  /* Floating glass effect */
  background: var(--color-surface-glass);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);

  border-top: 1px solid var(--color-border-glass);
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.08);  /* Shadow above */

  z-index: var(--z-fixed);
  display: flex;
  align-items: center;
  padding: 0 var(--space-6);
  gap: var(--space-4);
}
```

---

## Migration Checklist

### Phase 1: CSS Variables
- [ ] Replace `:root` variables in `main.css` (lines 8-61)
- [ ] Add new spacing scale (--space-1 through --space-20)
- [ ] Add new color palette (neutral, not slate)
- [ ] Add SF Pro font stack
- [ ] Add new border radius scale
- [ ] Add 5-level shadow system
- [ ] Add spring easing functions
- [ ] Add glassmorphism variables

### Phase 2: Core Components
- [ ] Update `.btn` (pill shape, spring press)
- [ ] Update `.service-card` (16px radius, lift + scale)
- [ ] Update `.sidebar` (glassmorphism)
- [ ] Update `.modal` (glassmorphism, scale animation)
- [ ] Update `.input-field` (floating labels)
- [ ] Update `.app-nav` (pill active states)

### Phase 3: Animations
- [ ] Add spring press to all interactive elements
- [ ] Update hover states (lift + scale)
- [ ] Update modal entrance (slide + scale)
- [ ] Add loading skeletons with shimmer
- [ ] Add success bounce animation
- [ ] Add error shake animation

### Phase 4: Icons
- [ ] Replace emoji icons with SVGs
- [ ] Create icon component system
- [ ] Update all icon usage

### Phase 5: Testing
- [ ] Test glassmorphism fallback in older browsers
- [ ] Test animations at 60fps
- [ ] Verify WCAG AA contrast ratios
- [ ] Test on Windows/macOS
- [ ] Performance audit (no regressions)

---

**Document Version:** 1.0
**Last Updated:** October 16, 2025, 21:00
**Author:** Claude Code
**Purpose:** Technical reference for CSS migration
