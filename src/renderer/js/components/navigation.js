/**
 * @file navigation.js
 * @description Navigation Bar Controller - управление главной навигацией
 */

class NavigationController {
  constructor() {
    this.currentSection = 'home';
    this.navItems = null;
    this.sidebarSections = null;

    this.init();
  }

  /**
   * Инициализация навигации
   */
  init() {
    this.navItems = document.querySelectorAll('.app-nav__item');
    this.sidebarSections = {
      home: document.getElementById('sidebar-home'),
      documents: document.getElementById('sidebar-documents'),
      services: document.getElementById('sidebar-services'),
      settings: document.getElementById('sidebar-settings')
    };

    // Обработчики уже добавлены в inline script в index.html
    // Этот класс нужен только для программного управления навигацией

    console.log('NavigationController initialized (passive mode)');
  }

  /**
   * Переключение между разделами
   * @param {string} sectionName - Название раздела
   */
  switchSection(sectionName) {
    if (this.currentSection === sectionName) return;

    // Обновляем активный пункт в navbar
    this.navItems.forEach(item => {
      if (item.dataset.section === sectionName) {
        item.classList.add('app-nav__item--active');
      } else {
        item.classList.remove('app-nav__item--active');
      }
    });

    // Скрываем все sidebar секции
    Object.values(this.sidebarSections).forEach(section => {
      if (section) {
        section.style.display = 'none';
      }
    });

    // Показываем нужную секцию
    const targetSection = this.sidebarSections[sectionName];
    if (targetSection) {
      targetSection.style.display = 'block';
    }

    this.currentSection = sectionName;

    // Emit событие для app.js
    const event = new CustomEvent('navigation:change', {
      detail: { section: sectionName }
    });
    document.dispatchEvent(event);
  }

  /**
   * Получить текущую секцию
   * @returns {string}
   */
  getCurrentSection() {
    return this.currentSection;
  }

  /**
   * Активировать пункт навигации (когда функция станет доступна)
   * @param {string} sectionName - Название раздела
   */
  enableSection(sectionName) {
    this.navItems.forEach(item => {
      if (item.dataset.section === sectionName) {
        item.disabled = false;
        item.classList.remove('app-nav__item--disabled');
      }
    });
  }

  /**
   * Деактивировать пункт навигации
   * @param {string} sectionName - Название раздела
   */
  disableSection(sectionName) {
    this.navItems.forEach(item => {
      if (item.dataset.section === sectionName) {
        item.disabled = true;
        item.classList.add('app-nav__item--disabled');
      }
    });
  }
}

// Export для использования в app.js
window.NavigationController = NavigationController;
