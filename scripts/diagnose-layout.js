/**
 * ДИАГНОСТИКА LAYOUT - Запустить в консоли браузера (DevTools)
 * Показывает реальные computed styles для всех layout элементов
 */

console.log('🔍 === ДИАГНОСТИКА LAYOUT === 🔍\n');

// CSS переменные из :root
const root = document.documentElement;
const styles = getComputedStyle(root);

console.log('📊 CSS ПЕРЕМЕННЫЕ:');
console.log('--layout-activity-bar-width:', styles.getPropertyValue('--layout-activity-bar-width').trim());
console.log('--layout-sidebar-width:', styles.getPropertyValue('--layout-sidebar-width').trim());
console.log('--layout-sidebar-margin-left:', styles.getPropertyValue('--layout-sidebar-margin-left').trim());
console.log('--layout-content-gap:', styles.getPropertyValue('--layout-content-gap').trim());
console.log('--layout-sidebar-left:', styles.getPropertyValue('--layout-sidebar-left').trim());
console.log('--layout-content-start:', styles.getPropertyValue('--layout-content-start').trim());
console.log('\n');

// Activity Bar
const activityBar = document.querySelector('.activity-bar');
if (activityBar) {
  const abs = getComputedStyle(activityBar);
  console.log('🎯 ACTIVITY BAR:');
  console.log('  width:', abs.width);
  console.log('  left:', abs.left);
  console.log('  display:', abs.display);
  console.log('  position:', abs.position);
} else {
  console.log('❌ Activity Bar не найден (создается динамически?)');
}
console.log('\n');

// Sidebar
const sidebar = document.querySelector('.sidebar');
if (sidebar) {
  const sbs = getComputedStyle(sidebar);
  console.log('📂 SIDEBAR:');
  console.log('  width:', sbs.width);
  console.log('  left:', sbs.left);
  console.log('  margin-left:', sbs.marginLeft);
  console.log('  display:', sbs.display);
  console.log('  position:', sbs.position);
} else {
  console.log('❌ Sidebar не найден');
}
console.log('\n');

// Home Dashboard
const homeDashboard = document.querySelector('.home-dashboard');
if (homeDashboard) {
  const hds = getComputedStyle(homeDashboard);
  console.log('🏠 HOME DASHBOARD:');
  console.log('  margin-left:', hds.marginLeft);
  console.log('  margin-right:', hds.marginRight);
  console.log('  padding-left:', hds.paddingLeft);
  console.log('  width:', hds.width);
  console.log('  max-width:', hds.maxWidth);
  console.log('  display:', hds.display);
} else {
  console.log('❌ Home Dashboard не найден');
}
console.log('\n');

// Service Store
const serviceStore = document.querySelector('.service-store');
if (serviceStore) {
  const sss = getComputedStyle(serviceStore);
  console.log('🔧 SERVICE STORE:');
  console.log('  margin-left:', sss.marginLeft);
  console.log('  margin-right:', sss.marginRight);
  console.log('  padding-left:', sss.paddingLeft);
  console.log('  width:', sss.width);
  console.log('  max-width:', sss.maxWidth);
  console.log('  display:', sss.display);
} else {
  console.log('❌ Service Store не найден или скрыт');
}
console.log('\n');

// Content
const content = document.querySelector('.content');
if (content) {
  const cs = getComputedStyle(content);
  console.log('📄 CONTENT:');
  console.log('  margin-left:', cs.marginLeft);
  console.log('  display:', cs.display);
} else {
  console.log('❌ Content не найден');
}
console.log('\n');

// Вычисления
console.log('🧮 РАСЧЁТЫ:');
if (sidebar && homeDashboard) {
  const sidebarRect = sidebar.getBoundingClientRect();
  const dashboardRect = homeDashboard.getBoundingClientRect();

  console.log('Sidebar right edge:', sidebarRect.right + 'px');
  console.log('Dashboard left edge:', dashboardRect.left + 'px');
  console.log('GAP between:', (dashboardRect.left - sidebarRect.right) + 'px');
  console.log('\n');
}

// Проверка inline стилей
console.log('💉 INLINE СТИЛИ:');
['.activity-bar', '.sidebar', '.home-dashboard', '.service-store', '.content'].forEach(selector => {
  const el = document.querySelector(selector);
  if (el && el.style.cssText) {
    console.log(selector + ':', el.style.cssText);
  }
});

console.log('\n🔍 === ДИАГНОСТИКА ЗАВЕРШЕНА === 🔍');
console.log('\n💡 СОВЕТ: Если значения не совпадают с ожидаемыми:');
console.log('1. Hard Refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Win)');
console.log('2. Clear Cache: DevTools → Network → Disable cache');
console.log('3. Проверь порядок загрузки CSS файлов');
