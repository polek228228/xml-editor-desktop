/**
 * ГЛУБОКАЯ ДИАГНОСТИКА LAYOUT - Запустить в консоли браузера
 * Находит все проблемы с positioning, scrolling, padding, overflow
 */

console.log('🔍 === ГЛУБОКАЯ ДИАГНОСТИКА LAYOUT === 🔍\n');

const elements = {
  body: document.body,
  appContainer: document.querySelector('.app-container'),
  appNav: document.querySelector('.app-nav'),
  sidebar: document.querySelector('.sidebar'),
  content: document.querySelector('.content'),
  contentWrapper: document.querySelector('.content__wrapper'),
  homeDashboard: document.querySelector('.home-dashboard'),
  serviceStore: document.querySelector('.service-store'),
  editor: document.querySelector('.editor'),
  contextToolbar: document.querySelector('.context-toolbar'),
  footer: document.querySelector('.footer')
};

// Функция для получения computed styles
function getStyles(el, props) {
  if (!el) return null;
  const computed = getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  const result = { rect };
  props.forEach(prop => {
    result[prop] = computed[prop];
  });
  return result;
}

// ========================================
// 1. СТРУКТУРА ДОКУМЕНТА
// ========================================
console.log('📐 1. СТРУКТУРА ДОКУМЕНТА\n');

console.log('body:');
console.log('  display:', elements.body.style.display || getComputedStyle(elements.body).display);
console.log('  height:', getComputedStyle(elements.body).height);
console.log('  overflow:', getComputedStyle(elements.body).overflow);

if (elements.appContainer) {
  const s = getComputedStyle(elements.appContainer);
  console.log('\napp-container:');
  console.log('  display:', s.display);
  console.log('  height:', s.height);
  console.log('  flex-direction:', s.flexDirection);
  console.log('  children:', elements.appContainer.children.length);
  console.log('  children list:');
  Array.from(elements.appContainer.children).forEach(child => {
    console.log('    -', child.tagName.toLowerCase() + '.' + child.className.split(' ')[0]);
  });
}

console.log('\nfooter:');
if (elements.footer) {
  const s = getComputedStyle(elements.footer);
  console.log('  position:', s.position);
  console.log('  parent:', elements.footer.parentElement.className || elements.footer.parentElement.tagName);
  console.log('  ⚠️  Footer СНАРУЖИ app-container?', !elements.appContainer.contains(elements.footer));
} else {
  console.log('  ❌ Footer не найден');
}

// ========================================
// 2. PADDING-BOTTOM ПРОБЛЕМЫ
// ========================================
console.log('\n\n📏 2. PADDING-BOTTOM (DOUBLE PADDING ПРОБЛЕМА)\n');

const contentPadding = elements.content ? getComputedStyle(elements.content).paddingBottom : null;
const dashboardPadding = elements.homeDashboard ? getComputedStyle(elements.homeDashboard).paddingBottom : null;
const storePadding = elements.serviceStore ? getComputedStyle(elements.serviceStore).paddingBottom : null;

console.log('content padding-bottom:', contentPadding);
console.log('home-dashboard padding-bottom:', dashboardPadding);
console.log('service-store padding-bottom:', storePadding);

if (contentPadding && dashboardPadding) {
  const totalPadding = parseInt(contentPadding) + parseInt(dashboardPadding);
  console.log('\n⚠️  TOTAL PADDING СНИЗУ:', totalPadding + 'px');
  if (totalPadding > 100) {
    console.log('❌ ПРОБЛЕМА: Двойной padding! Должен быть только в child views, НЕ в .content');
  }
}

// ========================================
// 3. CONTEXT-TOOLBAR ПОЗИЦИОНИРОВАНИЕ
// ========================================
console.log('\n\n🔧 3. CONTEXT-TOOLBAR\n');

if (elements.contextToolbar) {
  const s = getComputedStyle(elements.contextToolbar);
  const rect = elements.contextToolbar.getBoundingClientRect();
  console.log('position:', s.position);
  console.log('bottom:', s.bottom);
  console.log('left:', s.left);
  console.log('right:', s.right);
  console.log('height:', s.height);
  console.log('z-index:', s.zIndex);
  console.log('display:', s.display);
  console.log('transform:', s.transform);
  console.log('opacity:', s.opacity);
  console.log('\nВизуальная позиция:');
  console.log('  top:', Math.round(rect.top) + 'px');
  console.log('  bottom:', Math.round(rect.bottom) + 'px');
  console.log('  visible:', rect.bottom > 0 && rect.top < window.innerHeight);

  if (s.display === 'none') {
    console.log('\n⚠️  Toolbar скрыт (display: none)');
  } else if (s.opacity === '0') {
    console.log('\n⚠️  Toolbar невидим (opacity: 0) - нужен .context-toolbar--visible класс');
  }
} else {
  console.log('❌ Context toolbar не найден (id="context-toolbar")');
}

// ========================================
// 4. FOOTER ПОЗИЦИОНИРОВАНИЕ
// ========================================
console.log('\n\n👟 4. FOOTER ПОЗИЦИОНИРОВАНИЕ\n');

if (elements.footer) {
  const s = getComputedStyle(elements.footer);
  const rect = elements.footer.getBoundingClientRect();
  console.log('position:', s.position);
  console.log('bottom:', s.bottom);
  console.log('z-index:', s.zIndex);
  console.log('height:', s.height);
  console.log('flex-shrink:', s.flexShrink);
  console.log('\nВизуальная позиция:');
  console.log('  top:', Math.round(rect.top) + 'px');
  console.log('  bottom:', Math.round(rect.bottom) + 'px');
  console.log('  visible:', rect.bottom > 0 && rect.top < window.innerHeight);

  if (s.position !== 'fixed' && s.position !== 'absolute') {
    console.log('\n⚠️  Footer в нормальном flow (position: static/relative)');
    console.log('⚠️  Может быть проблема если контент длинный');
  }
}

// ========================================
// 5. SCROLLING AREAS
// ========================================
console.log('\n\n📜 5. SCROLLING AREAS\n');

const scrollableElements = [
  { name: 'body', el: elements.body },
  { name: 'app-container', el: elements.appContainer },
  { name: 'content', el: elements.content },
  { name: 'content__wrapper', el: elements.contentWrapper },
  { name: 'sidebar__section', el: document.querySelector('.sidebar__section--active') || document.querySelector('.sidebar__section') }
];

scrollableElements.forEach(({ name, el }) => {
  if (!el) {
    console.log(name + ': ❌ не найден');
    return;
  }
  const s = getComputedStyle(el);
  const isScrollable = el.scrollHeight > el.clientHeight;
  console.log(name + ':');
  console.log('  overflow-y:', s.overflowY);
  console.log('  scrollHeight:', el.scrollHeight + 'px');
  console.log('  clientHeight:', el.clientHeight + 'px');
  console.log('  scrollable:', isScrollable ? '✅' : '❌');
  console.log('');
});

// ========================================
// 6. Z-INDEX STACK
// ========================================
console.log('\n🎨 6. Z-INDEX STACK\n');

const zIndexElements = [
  { name: 'sidebar', el: elements.sidebar },
  { name: 'context-toolbar', el: elements.contextToolbar },
  { name: 'footer', el: elements.footer },
  { name: 'modals', el: document.querySelector('.modal-overlay') },
  { name: 'loading-overlay', el: document.querySelector('.loading-overlay') }
];

zIndexElements
  .map(({ name, el }) => ({
    name,
    zIndex: el ? parseInt(getComputedStyle(el).zIndex) || 0 : null
  }))
  .filter(item => item.zIndex !== null)
  .sort((a, b) => b.zIndex - a.zIndex)
  .forEach(({ name, zIndex }) => {
    console.log(name.padEnd(20), 'z-index:', zIndex);
  });

// ========================================
// 7. SIDEBAR & CONTENT GAP
// ========================================
console.log('\n\n↔️  7. SIDEBAR & CONTENT GAP\n');

if (elements.sidebar && elements.homeDashboard) {
  const sidebarRect = elements.sidebar.getBoundingClientRect();
  const dashboardRect = elements.homeDashboard.getBoundingClientRect();
  const gap = Math.round(dashboardRect.left - sidebarRect.right);

  console.log('Sidebar right edge:', Math.round(sidebarRect.right) + 'px');
  console.log('Dashboard left edge:', Math.round(dashboardRect.left) + 'px');
  console.log('GAP:', gap + 'px');

  if (gap < 0) {
    console.log('❌ OVERLAP! Dashboard заезжает на sidebar');
  } else if (gap > 20) {
    console.log('⚠️  Слишком большой gap (> 20px)');
  } else {
    console.log('✅ Gap в пределах нормы');
  }
}

// ========================================
// 8. VIEWPORT & BOUNDARIES
// ========================================
console.log('\n\n🖼️  8. VIEWPORT & BOUNDARIES\n');

console.log('window.innerHeight:', window.innerHeight + 'px');
console.log('window.innerWidth:', window.innerWidth + 'px');
console.log('document.body.scrollHeight:', document.body.scrollHeight + 'px');
console.log('document.body.clientHeight:', document.body.clientHeight + 'px');

if (elements.footer) {
  const footerRect = elements.footer.getBoundingClientRect();
  const footerBeyondViewport = footerRect.bottom > window.innerHeight;
  console.log('\nFooter bottom:', Math.round(footerRect.bottom) + 'px');
  console.log('Footer beyond viewport:', footerBeyondViewport ? '⚠️  ДА (нужна прокрутка)' : '✅ НЕТ');
}

if (elements.contextToolbar) {
  const toolbarRect = elements.contextToolbar.getBoundingClientRect();
  console.log('\nContext-toolbar bottom:', Math.round(toolbarRect.bottom) + 'px');
  console.log('Toolbar visible:', toolbarRect.bottom <= window.innerHeight ? '✅ ДА' : '⚠️  НЕТ');
}

// ========================================
// 9. CSS ПЕРЕМЕННЫЕ
// ========================================
console.log('\n\n🎨 9. CSS ПЕРЕМЕННЫЕ (LAYOUT)\n');

const root = document.documentElement;
const rootStyles = getComputedStyle(root);

const layoutVars = [
  '--layout-activity-bar-width',
  '--layout-sidebar-width',
  '--layout-sidebar-margin-left',
  '--layout-content-gap',
  '--layout-sidebar-left',
  '--layout-content-start'
];

layoutVars.forEach(varName => {
  const value = rootStyles.getPropertyValue(varName).trim();
  console.log(varName + ':', value || '❌ НЕ ЗАДАНА');
});

// ========================================
// 10. ПРОБЛЕМЫ И РЕКОМЕНДАЦИИ
// ========================================
console.log('\n\n🚨 10. НАЙДЕННЫЕ ПРОБЛЕМЫ\n');

const issues = [];

// Check double padding
if (contentPadding && dashboardPadding && (parseInt(contentPadding) + parseInt(dashboardPadding) > 100)) {
  issues.push('❌ DOUBLE PADDING: .content и .home-dashboard оба имеют padding-bottom → ' +
    (parseInt(contentPadding) + parseInt(dashboardPadding)) + 'px total');
}

// Check footer position
if (elements.footer && elements.appContainer && !elements.appContainer.contains(elements.footer)) {
  issues.push('❌ FOOTER СНАРУЖИ: .footer вне .app-container → может вызвать проблемы с layout');
}

// Check footer positioning
if (elements.footer && getComputedStyle(elements.footer).position === 'static') {
  issues.push('⚠️  FOOTER NOT FIXED: footer в нормальном flow → может быть скрыт под контентом');
}

// Check toolbar visibility
if (elements.contextToolbar && getComputedStyle(elements.contextToolbar).opacity === '0') {
  issues.push('ℹ️  TOOLBAR HIDDEN: context-toolbar opacity: 0 (нужен .context-toolbar--visible класс)');
}

// Check sidebar bottom gap
if (elements.sidebar && elements.footer) {
  const sidebarBottom = parseInt(getComputedStyle(elements.sidebar).bottom);
  const footerHeight = elements.footer.getBoundingClientRect().height;
  if (sidebarBottom < footerHeight) {
    issues.push('⚠️  SIDEBAR OVERLAP: sidebar bottom (' + sidebarBottom + 'px) меньше footer height (' + Math.round(footerHeight) + 'px)');
  }
}

// Check content wrapper scrolling
if (elements.contentWrapper) {
  const isScrollable = elements.contentWrapper.scrollHeight > elements.contentWrapper.clientHeight;
  if (!isScrollable && elements.contentWrapper.children.length > 0) {
    issues.push('ℹ️  CONTENT NOT SCROLLABLE: content__wrapper не scrollable (контент помещается)');
  }
}

if (issues.length === 0) {
  console.log('✅ Критических проблем не найдено!');
} else {
  issues.forEach((issue, i) => {
    console.log((i + 1) + '. ' + issue);
  });
}

// ========================================
// 11. РЕКОМЕНДАЦИИ
// ========================================
console.log('\n\n💡 11. РЕКОМЕНДАЦИИ ПО ИСПРАВЛЕНИЮ\n');

const recommendations = [];

if (contentPadding && parseInt(contentPadding) > 0) {
  recommendations.push({
    problem: 'Double padding в .content',
    fix: 'Удалить padding-bottom из .content, оставить только в .home-dashboard/.service-store',
    css: '.content { padding-bottom: 0; }'
  });
}

if (elements.footer && !elements.appContainer.contains(elements.footer)) {
  recommendations.push({
    problem: 'Footer снаружи app-container',
    fix: 'Переместить <footer> внутрь <div class="app-container">',
    html: '<div class="app-container">\n  ...\n  <footer class="footer">...</footer>\n</div>'
  });
}

if (elements.footer && getComputedStyle(elements.footer).position !== 'fixed') {
  recommendations.push({
    problem: 'Footer не фиксированный',
    fix: 'Сделать footer position: fixed для постоянной видимости',
    css: '.footer { position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; }'
  });
}

if (recommendations.length > 0) {
  recommendations.forEach((rec, i) => {
    console.log((i + 1) + '. ' + rec.problem);
    console.log('   FIX:', rec.fix);
    if (rec.css) console.log('   CSS:', rec.css);
    if (rec.html) console.log('   HTML:', rec.html);
    console.log('');
  });
} else {
  console.log('✅ Layout выглядит хорошо!');
}

console.log('\n🔍 === ДИАГНОСТИКА ЗАВЕРШЕНА === 🔍');
console.log('\n💡 Если нашлись проблемы, примени исправления из раздела "РЕКОМЕНДАЦИИ"');
