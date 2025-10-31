/**
 * УЛЬТРА-ГЛУБОКИЙ АНАЛИЗ LAYOUT
 * Проверяет АБСОЛЮТНО ВСЁ:
 * - DOM структуру
 * - CSS computed styles
 * - Scroll behaviors
 * - Z-index stacking
 * - Performance
 * - Accessibility
 * - Responsive design
 * - Animations/transitions
 * - Overflow issues
 * - Layout thrashing
 */

console.clear();
console.log('%c🔬 === УЛЬТРА-ГЛУБОКИЙ АНАЛИЗ === 🔬', 'color: #3b82f6; font-size: 18px; font-weight: bold');
console.log('');

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function getComputedStyleProps(el, props) {
  if (!el) return null;
  const computed = getComputedStyle(el);
  const result = {};
  props.forEach(prop => {
    result[prop] = computed[prop];
  });
  return result;
}

function isVisible(el) {
  if (!el) return false;
  const style = getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  return style.display !== 'none' &&
         style.visibility !== 'hidden' &&
         style.opacity !== '0' &&
         rect.width > 0 &&
         rect.height > 0;
}

function isInViewport(el) {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return (
    rect.top < window.innerHeight &&
    rect.bottom > 0 &&
    rect.left < window.innerWidth &&
    rect.right > 0
  );
}

function measurePerformance(fn, label) {
  const start = performance.now();
  fn();
  const end = performance.now();
  return { label, duration: (end - start).toFixed(2) + 'ms' };
}

// ============================================================
// 1. DOM TREE ANALYSIS
// ============================================================
console.log('%c📊 1. АНАЛИЗ DOM ДЕРЕВА', 'color: #10b981; font-weight: bold; font-size: 14px');
console.log('');

const domStats = {
  totalElements: document.getElementsByTagName('*').length,
  divs: document.getElementsByTagName('div').length,
  fixedElements: 0,
  absoluteElements: 0,
  stickyElements: 0,
  hiddenElements: 0,
  overflowElements: 0
};

Array.from(document.getElementsByTagName('*')).forEach(el => {
  const style = getComputedStyle(el);
  if (style.position === 'fixed') domStats.fixedElements++;
  if (style.position === 'absolute') domStats.absoluteElements++;
  if (style.position === 'sticky') domStats.stickyElements++;
  if (style.display === 'none' || style.visibility === 'hidden') domStats.hiddenElements++;
  if (style.overflow === 'auto' || style.overflow === 'scroll' ||
      style.overflowY === 'auto' || style.overflowY === 'scroll') domStats.overflowElements++;
});

console.table(domStats);

// ============================================================
// 2. FIXED/ABSOLUTE ELEMENTS AUDIT
// ============================================================
console.log('%c📌 2. AUDIT POSITIONED ЭЛЕМЕНТОВ', 'color: #10b981; font-weight: bold; font-size: 14px');
console.log('');

const positionedElements = [];
Array.from(document.getElementsByTagName('*')).forEach(el => {
  const style = getComputedStyle(el);
  if (style.position === 'fixed' || style.position === 'absolute' || style.position === 'sticky') {
    const rect = el.getBoundingClientRect();
    positionedElements.push({
      element: el.className || el.tagName.toLowerCase(),
      position: style.position,
      top: style.top,
      bottom: style.bottom,
      left: style.left,
      right: style.right,
      zIndex: style.zIndex || 'auto',
      width: Math.round(rect.width) + 'px',
      height: Math.round(rect.height) + 'px',
      visible: isVisible(el),
      inViewport: isInViewport(el)
    });
  }
});

console.log('Найдено positioned элементов:', positionedElements.length);
console.table(positionedElements);

// Check for potential overlaps
console.log('%c⚠️ Проверка OVERLAPS:', 'color: #f59e0b; font-weight: bold');
const overlaps = [];
for (let i = 0; i < positionedElements.length; i++) {
  for (let j = i + 1; j < positionedElements.length; j++) {
    const el1 = positionedElements[i];
    const el2 = positionedElements[j];
    if (el1.zIndex === el2.zIndex && el1.position === el2.position) {
      overlaps.push(`${el1.element} и ${el2.element} имеют одинаковый z-index: ${el1.zIndex}`);
    }
  }
}
if (overlaps.length > 0) {
  console.warn('Найдены потенциальные overlaps:');
  overlaps.forEach(o => console.warn('  -', o));
} else {
  console.log('✅ Overlaps не найдено');
}

// ============================================================
// 3. Z-INDEX COMPLETE STACK
// ============================================================
console.log('');
console.log('%c🎨 3. ПОЛНАЯ Z-INDEX КАРТА', 'color: #10b981; font-weight: bold; font-size: 14px');
console.log('');

const zIndexMap = new Map();
Array.from(document.getElementsByTagName('*')).forEach(el => {
  const style = getComputedStyle(el);
  const zIndex = style.zIndex;
  if (zIndex !== 'auto') {
    const className = el.className || el.tagName.toLowerCase();
    const zVal = parseInt(zIndex) || 0;
    if (!zIndexMap.has(zVal)) {
      zIndexMap.set(zVal, []);
    }
    zIndexMap.get(zVal).push({
      element: className,
      position: style.position,
      visible: isVisible(el)
    });
  }
});

const sortedZIndex = Array.from(zIndexMap.entries()).sort((a, b) => b[0] - a[0]);
console.log('Z-Index Stack (от верхнего к нижнему):');
sortedZIndex.forEach(([zIndex, elements]) => {
  console.log(`\nz-index: ${zIndex}`);
  elements.forEach(el => {
    console.log(`  - ${el.element} (${el.position}) ${el.visible ? '✅' : '❌ hidden'}`);
  });
});

// Check for z-index issues
console.log('%c⚠️ Проверка Z-INDEX проблем:', 'color: #f59e0b; font-weight: bold');
const zIndexIssues = [];
if (sortedZIndex.length > 0) {
  const gaps = [];
  for (let i = 0; i < sortedZIndex.length - 1; i++) {
    const diff = sortedZIndex[i][0] - sortedZIndex[i + 1][0];
    if (diff > 100) {
      gaps.push(`Большой gap: ${sortedZIndex[i][0]} → ${sortedZIndex[i + 1][0]} (${diff})`);
    }
  }
  if (gaps.length > 0) {
    console.warn('Найдены большие gaps в z-index:');
    gaps.forEach(g => console.warn('  -', g));
  } else {
    console.log('✅ Z-index gaps в пределах нормы');
  }
}

// ============================================================
// 4. SCROLL CONTAINERS DEEP DIVE
// ============================================================
console.log('');
console.log('%c📜 4. ГЛУБОКИЙ АНАЛИЗ SCROLL', 'color: #10b981; font-weight: bold; font-size: 14px');
console.log('');

const scrollContainers = [];
Array.from(document.getElementsByTagName('*')).forEach(el => {
  const style = getComputedStyle(el);
  const hasScroll = (style.overflow === 'auto' || style.overflow === 'scroll' ||
                     style.overflowY === 'auto' || style.overflowY === 'scroll' ||
                     style.overflowX === 'auto' || style.overflowX === 'scroll');

  if (hasScroll) {
    const isScrollable = el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
    scrollContainers.push({
      element: el.className || el.tagName.toLowerCase(),
      overflow: style.overflow,
      overflowY: style.overflowY,
      overflowX: style.overflowX,
      scrollHeight: el.scrollHeight + 'px',
      clientHeight: el.clientHeight + 'px',
      scrollWidth: el.scrollWidth + 'px',
      clientWidth: el.clientWidth + 'px',
      isScrollable: isScrollable ? '✅ Yes' : '❌ No',
      currentScroll: Math.round(el.scrollTop) + 'px'
    });
  }
});

console.log('Найдено scroll containers:', scrollContainers.length);
console.table(scrollContainers);

// Check for nested scroll containers (can cause UX issues)
console.log('%c⚠️ Проверка NESTED SCROLLING:', 'color: #f59e0b; font-weight: bold');
const nestedScrolls = [];
scrollContainers.forEach(container => {
  const el = Array.from(document.getElementsByTagName('*')).find(
    e => (e.className || e.tagName.toLowerCase()) === container.element
  );
  if (el) {
    let parent = el.parentElement;
    while (parent) {
      const style = getComputedStyle(parent);
      if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
        nestedScrolls.push(`${container.element} внутри ${parent.className || parent.tagName.toLowerCase()}`);
        break;
      }
      parent = parent.parentElement;
    }
  }
});
if (nestedScrolls.length > 0) {
  console.warn('Найден nested scrolling:');
  nestedScrolls.forEach(n => console.warn('  -', n));
} else {
  console.log('✅ Nested scrolling не найден');
}

// ============================================================
// 5. PADDING/MARGIN AUDIT
// ============================================================
console.log('');
console.log('%c📏 5. AUDIT PADDING & MARGINS', 'color: #10b981; font-weight: bold; font-size: 14px');
console.log('');

const paddingMarginData = [];
const selectors = [
  '.content',
  '.content__wrapper',
  '.home-dashboard',
  '.service-store',
  '.editor',
  '.editor__content',
  '.sidebar',
  '.app-nav',
  '.footer',
  '.context-toolbar'
];

selectors.forEach(selector => {
  const el = document.querySelector(selector);
  if (el) {
    const style = getComputedStyle(el);
    paddingMarginData.push({
      element: selector,
      paddingTop: style.paddingTop,
      paddingBottom: style.paddingBottom,
      paddingLeft: style.paddingLeft,
      paddingRight: style.paddingRight,
      marginTop: style.marginTop,
      marginBottom: style.marginBottom,
      marginLeft: style.marginLeft,
      marginRight: style.marginRight
    });
  }
});

console.table(paddingMarginData);

// Check for excessive padding/margin
console.log('%c⚠️ Проверка EXCESSIVE PADDING/MARGIN:', 'color: #f59e0b; font-weight: bold');
const excessive = [];
paddingMarginData.forEach(item => {
  Object.keys(item).forEach(key => {
    if (key !== 'element' && item[key]) {
      const val = parseInt(item[key]);
      if (val > 150) {
        excessive.push(`${item.element}: ${key} = ${item[key]} (слишком большой?)`);
      }
    }
  });
});
if (excessive.length > 0) {
  console.warn('Найдены большие padding/margin:');
  excessive.forEach(e => console.warn('  -', e));
} else {
  console.log('✅ Все padding/margin в пределах нормы');
}

// ============================================================
// 6. VIEWPORT BOUNDARIES CHECK
// ============================================================
console.log('');
console.log('%c🖼️ 6. ПРОВЕРКА VIEWPORT BOUNDARIES', 'color: #10b981; font-weight: bold; font-size: 14px');
console.log('');

const viewportIssues = [];
Array.from(document.getElementsByTagName('*')).forEach(el => {
  if (isVisible(el)) {
    const rect = el.getBoundingClientRect();
    const className = el.className || el.tagName.toLowerCase();

    // Check if element extends beyond viewport
    if (rect.right > window.innerWidth) {
      viewportIssues.push({
        element: className,
        issue: 'Выходит за правую границу',
        right: Math.round(rect.right) + 'px',
        viewport: window.innerWidth + 'px',
        overflow: Math.round(rect.right - window.innerWidth) + 'px'
      });
    }
    if (rect.bottom > window.innerHeight + el.scrollTop) {
      // Only flag if it's a fixed element
      const style = getComputedStyle(el);
      if (style.position === 'fixed') {
        viewportIssues.push({
          element: className,
          issue: 'Fixed элемент выходит за нижнюю границу',
          bottom: Math.round(rect.bottom) + 'px',
          viewport: window.innerHeight + 'px',
          overflow: Math.round(rect.bottom - window.innerHeight) + 'px'
        });
      }
    }
  }
});

if (viewportIssues.length > 0) {
  console.warn('Найдены элементы выходящие за viewport:');
  console.table(viewportIssues);
} else {
  console.log('✅ Все элементы в пределах viewport');
}

// ============================================================
// 7. FLEXBOX/GRID LAYOUT AUDIT
// ============================================================
console.log('');
console.log('%c📐 7. AUDIT FLEXBOX & GRID', 'color: #10b981; font-weight: bold; font-size: 14px');
console.log('');

const layoutContainers = [];
Array.from(document.getElementsByTagName('*')).forEach(el => {
  const style = getComputedStyle(el);
  if (style.display === 'flex' || style.display === 'inline-flex') {
    layoutContainers.push({
      element: el.className || el.tagName.toLowerCase(),
      type: 'flexbox',
      flexDirection: style.flexDirection,
      justifyContent: style.justifyContent,
      alignItems: style.alignItems,
      flexWrap: style.flexWrap,
      gap: style.gap,
      children: el.children.length
    });
  }
  if (style.display === 'grid' || style.display === 'inline-grid') {
    layoutContainers.push({
      element: el.className || el.tagName.toLowerCase(),
      type: 'grid',
      gridTemplateColumns: style.gridTemplateColumns,
      gridTemplateRows: style.gridTemplateRows,
      gap: style.gap,
      children: el.children.length
    });
  }
});

console.log('Найдено flex/grid containers:', layoutContainers.length);
console.table(layoutContainers);

// ============================================================
// 8. ANIMATIONS & TRANSITIONS
// ============================================================
console.log('');
console.log('%c🎬 8. АНАЛИЗ ANIMATIONS & TRANSITIONS', 'color: #10b981; font-weight: bold; font-size: 14px');
console.log('');

const animatedElements = [];
Array.from(document.getElementsByTagName('*')).forEach(el => {
  const style = getComputedStyle(el);
  if (style.transition !== 'all 0s ease 0s' && style.transition !== '') {
    animatedElements.push({
      element: el.className || el.tagName.toLowerCase(),
      transition: style.transition.substring(0, 80),
      willChange: style.willChange
    });
  }
  if (style.animationName !== 'none') {
    animatedElements.push({
      element: el.className || el.tagName.toLowerCase(),
      animation: style.animationName,
      duration: style.animationDuration,
      willChange: style.willChange
    });
  }
});

console.log('Найдено элементов с animations/transitions:', animatedElements.length);
if (animatedElements.length > 0) {
  console.table(animatedElements.slice(0, 20)); // Show first 20
}

// Check for performance issues
console.log('%c⚠️ Проверка PERFORMANCE ISSUES:', 'color: #f59e0b; font-weight: bold');
const perfIssues = [];
animatedElements.forEach(item => {
  if (item.transition && item.transition.includes('all')) {
    perfIssues.push(`${item.element}: transition: all (может быть медленным)`);
  }
  if (!item.willChange || item.willChange === 'auto') {
    if (item.transition && (item.transition.includes('transform') || item.transition.includes('opacity'))) {
      perfIssues.push(`${item.element}: нет will-change для transition`);
    }
  }
});
if (perfIssues.length > 0) {
  console.warn('Найдены потенциальные performance issues:');
  perfIssues.forEach(p => console.warn('  -', p));
} else {
  console.log('✅ Performance issues не найдено');
}

// ============================================================
// 9. CSS VARIABLES AUDIT
// ============================================================
console.log('');
console.log('%c🎨 9. AUDIT CSS ПЕРЕМЕННЫХ', 'color: #10b981; font-weight: bold; font-size: 14px');
console.log('');

const root = document.documentElement;
const rootStyles = getComputedStyle(root);
const cssVars = {};

// Get all CSS variables
Array.from(document.styleSheets).forEach(sheet => {
  try {
    Array.from(sheet.cssRules).forEach(rule => {
      if (rule.selectorText === ':root') {
        Array.from(rule.style).forEach(prop => {
          if (prop.startsWith('--')) {
            cssVars[prop] = rootStyles.getPropertyValue(prop).trim();
          }
        });
      }
    });
  } catch (e) {
    // Cross-origin stylesheet
  }
});

console.log('Найдено CSS переменных:', Object.keys(cssVars).length);
console.log('Layout переменные:');
Object.keys(cssVars).filter(k => k.includes('layout')).forEach(key => {
  console.log(`  ${key}: ${cssVars[key]}`);
});

console.log('Spacing переменные:');
Object.keys(cssVars).filter(k => k.includes('space')).forEach(key => {
  console.log(`  ${key}: ${cssVars[key]}`);
});

// ============================================================
// 10. MEMORY & PERFORMANCE
// ============================================================
console.log('');
console.log('%c⚡ 10. MEMORY & PERFORMANCE', 'color: #10b981; font-weight: bold; font-size: 14px');
console.log('');

const perfMetrics = [];

// Measure different operations
perfMetrics.push(measurePerformance(() => {
  document.querySelectorAll('*');
}, 'querySelectorAll(*)'));

perfMetrics.push(measurePerformance(() => {
  Array.from(document.getElementsByTagName('div')).forEach(el => getComputedStyle(el));
}, 'getComputedStyle() на всех div'));

perfMetrics.push(measurePerformance(() => {
  Array.from(document.getElementsByTagName('*')).forEach(el => el.getBoundingClientRect());
}, 'getBoundingClientRect() на всех элементах'));

console.table(perfMetrics);

// Check memory usage (if available)
if (performance.memory) {
  console.log('Memory Usage:');
  console.log(`  Used: ${(performance.memory.usedJSHeapSize / 1048576).toFixed(2)} MB`);
  console.log(`  Total: ${(performance.memory.totalJSHeapSize / 1048576).toFixed(2)} MB`);
  console.log(`  Limit: ${(performance.memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`);
}

// ============================================================
// 11. ACCESSIBILITY CHECK
// ============================================================
console.log('');
console.log('%c♿ 11. ACCESSIBILITY AUDIT', 'color: #10b981; font-weight: bold; font-size: 14px');
console.log('');

const a11yIssues = [];

// Check fixed elements have proper focus handling
positionedElements.filter(el => el.position === 'fixed').forEach(item => {
  const el = Array.from(document.getElementsByTagName('*')).find(
    e => (e.className || e.tagName.toLowerCase()) === item.element
  );
  if (el) {
    const tabIndex = el.getAttribute('tabindex');
    if (!tabIndex && el.tagName.toLowerCase() !== 'footer' && el.tagName.toLowerCase() !== 'header') {
      a11yIssues.push(`${item.element}: Fixed элемент без tabindex`);
    }
  }
});

// Check for aria-labels on navigation
const navElements = document.querySelectorAll('nav, [role="navigation"]');
navElements.forEach(nav => {
  const ariaLabel = nav.getAttribute('aria-label');
  if (!ariaLabel) {
    a11yIssues.push(`${nav.className || nav.tagName.toLowerCase()}: Navigation без aria-label`);
  }
});

// Check for hidden elements that might trap focus
Array.from(document.getElementsByTagName('*')).forEach(el => {
  const style = getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden') {
    if (el.querySelectorAll('button, a, input, select, textarea').length > 0) {
      a11yIssues.push(`${el.className || el.tagName.toLowerCase()}: Скрытый элемент содержит focusable элементы`);
    }
  }
});

if (a11yIssues.length > 0) {
  console.warn('Найдены accessibility issues:');
  a11yIssues.forEach(a => console.warn('  -', a));
} else {
  console.log('✅ Критичных accessibility issues не найдено');
}

// ============================================================
// 12. RESPONSIVE DESIGN CHECK
// ============================================================
console.log('');
console.log('%c📱 12. RESPONSIVE DESIGN CHECK', 'color: #10b981; font-weight: bold; font-size: 14px');
console.log('');

console.log('Current viewport:', window.innerWidth + 'x' + window.innerHeight);

// Check for hardcoded widths
const hardcodedWidths = [];
selectors.forEach(selector => {
  const el = document.querySelector(selector);
  if (el) {
    const style = getComputedStyle(el);
    if (style.width && !style.width.includes('%') && !style.width.includes('auto') &&
        !style.width.includes('calc') && !style.width.includes('var')) {
      hardcodedWidths.push(`${selector}: width = ${style.width}`);
    }
  }
});

if (hardcodedWidths.length > 0) {
  console.warn('Найдены hardcoded widths:');
  hardcodedWidths.forEach(h => console.warn('  -', h));
} else {
  console.log('✅ Hardcoded widths не найдено');
}

// Check for media queries
let mediaQueryCount = 0;
Array.from(document.styleSheets).forEach(sheet => {
  try {
    Array.from(sheet.cssRules).forEach(rule => {
      if (rule instanceof CSSMediaRule) {
        mediaQueryCount++;
      }
    });
  } catch (e) {
    // Cross-origin
  }
});
console.log(`Найдено media queries: ${mediaQueryCount}`);

// ============================================================
// 13. LAYOUT SHIFT DETECTION
// ============================================================
console.log('');
console.log('%c🔄 13. LAYOUT SHIFT DETECTION', 'color: #10b981; font-weight: bold; font-size: 14px');
console.log('');

// Check for elements without explicit dimensions that might cause layout shift
const layoutShiftRisk = [];
Array.from(document.querySelectorAll('img, iframe, video')).forEach(el => {
  const style = getComputedStyle(el);
  if (!el.hasAttribute('width') && !el.hasAttribute('height') &&
      style.width === 'auto' && style.height === 'auto') {
    layoutShiftRisk.push(`${el.tagName.toLowerCase()}: Нет explicit dimensions (может вызвать layout shift)`);
  }
});

if (layoutShiftRisk.length > 0) {
  console.warn('Найдены элементы с риском layout shift:');
  layoutShiftRisk.forEach(l => console.warn('  -', l));
} else {
  console.log('✅ Риск layout shift минимален');
}

// ============================================================
// 14. CRITICAL ISSUES SUMMARY
// ============================================================
console.log('');
console.log('%c🚨 14. КРИТИЧНЫЕ ПРОБЛЕМЫ (SUMMARY)', 'color: #ef4444; font-weight: bold; font-size: 16px');
console.log('');

const criticalIssues = [];

// Gather all critical issues
if (overlaps.length > 0) criticalIssues.push(...overlaps);
if (nestedScrolls.length > 0) criticalIssues.push('⚠️ Nested scrolling detected');
if (excessive.length > 0) criticalIssues.push('⚠️ Excessive padding/margin detected');
if (viewportIssues.length > 0) criticalIssues.push('⚠️ Elements extending beyond viewport');
if (perfIssues.length > 0) criticalIssues.push('⚠️ Performance issues with animations');
if (a11yIssues.length > 0) criticalIssues.push('⚠️ Accessibility issues detected');
if (layoutShiftRisk.length > 0) criticalIssues.push('⚠️ Layout shift risk detected');

if (criticalIssues.length > 0) {
  console.warn('%c❌ НАЙДЕНО КРИТИЧНЫХ ПРОБЛЕМ: ' + criticalIssues.length, 'color: #ef4444; font-weight: bold');
  criticalIssues.forEach((issue, i) => {
    console.warn(`${i + 1}. ${issue}`);
  });
} else {
  console.log('%c✅ КРИТИЧНЫХ ПРОБЛЕМ НЕ НАЙДЕНО!', 'color: #10b981; font-weight: bold; font-size: 16px');
}

// ============================================================
// 15. RECOMMENDATIONS
// ============================================================
console.log('');
console.log('%c💡 15. РЕКОМЕНДАЦИИ', 'color: #3b82f6; font-weight: bold; font-size: 16px');
console.log('');

const recommendations = [];

// Based on findings
if (mediaQueryCount === 0) {
  recommendations.push('Добавить media queries для responsive design');
}
if (layoutContainers.filter(c => !c.gap || c.gap === '0px').length > 0) {
  recommendations.push('Использовать gap вместо margin для flex/grid containers');
}
if (animatedElements.filter(a => !a.willChange || a.willChange === 'auto').length > 10) {
  recommendations.push('Добавить will-change для анимируемых элементов');
}
if (domStats.totalElements > 1000) {
  recommendations.push('Оптимизировать DOM tree (> 1000 элементов)');
}

if (recommendations.length > 0) {
  console.log('Рекомендации для улучшения:');
  recommendations.forEach((rec, i) => {
    console.log(`${i + 1}. ${rec}`);
  });
} else {
  console.log('✅ Приложение в отличном состоянии!');
}

// ============================================================
// FINAL SCORE
// ============================================================
console.log('');
console.log('%c🎯 ФИНАЛЬНАЯ ОЦЕНКА', 'color: #3b82f6; font-weight: bold; font-size: 18px');
console.log('');

const score = {
  dom: domStats.totalElements < 1000 ? 10 : 5,
  positioning: overlaps.length === 0 ? 10 : 5,
  scrolling: nestedScrolls.length === 0 ? 10 : 5,
  spacing: excessive.length === 0 ? 10 : 5,
  viewport: viewportIssues.length === 0 ? 10 : 5,
  performance: perfIssues.length < 5 ? 10 : 5,
  accessibility: a11yIssues.length === 0 ? 10 : 5,
  responsive: mediaQueryCount > 0 ? 10 : 5
};

const totalScore = Object.values(score).reduce((a, b) => a + b, 0);
const maxScore = Object.keys(score).length * 10;
const percentage = Math.round((totalScore / maxScore) * 100);

console.log('Оценка по категориям:');
console.table(score);
console.log('');
console.log(`%cОбщая оценка: ${totalScore}/${maxScore} (${percentage}%)`,
  `color: ${percentage > 80 ? '#10b981' : percentage > 60 ? '#f59e0b' : '#ef4444'}; font-weight: bold; font-size: 20px`);

if (percentage > 90) {
  console.log('%c🎉 ОТЛИЧНО! Layout в идеальном состоянии!', 'color: #10b981; font-weight: bold');
} else if (percentage > 70) {
  console.log('%c👍 ХОРОШО! Есть небольшие улучшения', 'color: #f59e0b; font-weight: bold');
} else {
  console.log('%c⚠️ ТРЕБУЕТСЯ РАБОТА! Найдены критичные проблемы', 'color: #ef4444; font-weight: bold');
}

console.log('');
console.log('%c🔬 === АНАЛИЗ ЗАВЕРШЕН === 🔬', 'color: #3b82f6; font-size: 18px; font-weight: bold');
console.log('');
console.log('💡 Для детального просмотра конкретной категории, смотри таблицы выше');
