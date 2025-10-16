# UI Architecture Documentation

## Overview

The XML Editor Desktop application features a **3-level navigation architecture** designed for scalability and modularity. The system supports unlimited service expansion through intelligent categorization, lazy loading, and a service marketplace model.

**Implementation Date:** October 2025
**Version:** 2.0.0
**Status:** 🎯 Planned Architecture

---

## Architecture Principles

### Design Goals

1. **Scalability:** Support up to 1 million services through categorization and virtualization
2. **Modularity:** Each service is an independent, installable module
3. **Discoverability:** Easy navigation and search across all services
4. **Performance:** Lazy loading and virtual scrolling for instant responsiveness
5. **Monetization:** Built-in service marketplace with licensing

### Key Components

```
UI Architecture
├── App Navigation (60px height)
│   ├── Главная (Home/Dashboard)
│   ├── Документы (Documents)
│   ├── Сервисы (Services)
│   └── Настройки (Settings)
├── Dynamic Sidebar (240px width)
│   ├── Section-specific navigation
│   ├── Categorized lists
│   └── Search & filters
├── Main Content Area (flexible)
│   ├── Dashboard view
│   ├── Document editor
│   ├── Service store
│   └── Settings panels
└── Context Toolbar (48px height)
    └── Document-specific actions (shown only when document is open)
```

---

## Layout Structure

### ASCII Layout Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  App Navigation (60px)                                          │
│  [🏠 Главная]  [📄 Документы]  [🔧 Сервисы]  [⚙️ Настройки]   │
├─────────────┬───────────────────────────────────────────────────┤
│             │                                                     │
│  Dynamic    │  Main Content Area                                 │
│  Sidebar    │                                                     │
│  (240px)    │  Dashboard / Editor / Store / Settings             │
│             │                                                     │
│  Section    │                                                     │
│  specific   │                                                     │
│  navigation │                                                     │
│             │                                                     │
│  Categories │                                                     │
│  Search     │                                                     │
│  Filters    │                                                     │
│             │                                                     │
├─────────────┴───────────────────────────────────────────────────┤
│  Context Toolbar (48px) - Shown only when document is open      │
│  [💾 Save] [📤 Export] [✅ Validate] [📋 Copy] [🗑️ Delete]      │
└─────────────────────────────────────────────────────────────────┘
```

### Responsive Behavior

| Viewport Width | Sidebar | Main Content | Context Toolbar |
|----------------|---------|--------------|-----------------|
| > 1400px | 240px fixed | Flexible | Full width |
| 1024-1400px | 200px fixed | Flexible | Full width |
| 768-1024px | Collapsible overlay | Full width | Full width |
| < 768px | Hidden (hamburger menu) | Full width | Scrollable |

---

## Level 1: App Navigation

### Purpose
Top-level navigation defining the four main application sections.

### Structure

```html
<nav class="app-nav">
  <div class="app-nav__container">
    <a href="#home" class="app-nav__item app-nav__item--active">
      <span class="app-nav__icon">🏠</span>
      <span class="app-nav__label">Главная</span>
    </a>
    <a href="#documents" class="app-nav__item">
      <span class="app-nav__icon">📄</span>
      <span class="app-nav__label">Документы</span>
    </a>
    <a href="#services" class="app-nav__item">
      <span class="app-nav__icon">🔧</span>
      <span class="app-nav__label">Сервисы</span>
    </a>
    <a href="#settings" class="app-nav__item">
      <span class="app-nav__icon">⚙️</span>
      <span class="app-nav__label">Настройки</span>
    </a>
  </div>
</nav>
```

### CSS Classes (BEM)

```css
.app-nav {
  height: 60px;
  background-color: var(--color-bg-dark);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
}

.app-nav__container {
  display: flex;
  gap: var(--spacing-md);
  padding: 0 var(--spacing-lg);
  width: 100%;
}

.app-nav__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  transition: background-color 0.2s;
  cursor: pointer;
  text-decoration: none;
  color: var(--color-text-secondary);
}

.app-nav__item:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text);
}

.app-nav__item--active {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.app-nav__icon {
  font-size: 20px;
}

.app-nav__label {
  font-weight: 500;
  font-size: var(--font-size-md);
}
```

### Navigation Sections

#### 1. Главная (Home/Dashboard)
**Purpose:** Application overview, recent documents, statistics

**Sidebar Content:**
- Quick actions
- Recent documents list
- Statistics widgets
- Activity feed

**Main Content:**
- Dashboard widgets
- Quick start guide
- News and updates
- Resource usage

#### 2. Документы (Documents)
**Purpose:** Document management and editing

**Sidebar Content:**
- All documents list
- Filter by schema version
- Filter by status
- Search documents
- Templates

**Main Content:**
- Document editor (when document open)
- Document grid/list view
- Document details

#### 3. Сервисы (Services)
**Purpose:** Service marketplace and installed services

**Sidebar Content:**
- Категории (Categories)
  - Документы (Documents)
  - Утилиты (Utilities)
  - Интеграции (Integrations)
- Установленные (Installed)
- Доступные (Available)
- Search & filters

**Main Content:**
- Service store grid
- Service details
- Installation progress
- Service settings

#### 4. Настройки (Settings)
**Purpose:** Application configuration

**Sidebar Content:**
- Общие (General)
- Внешний вид (Appearance)
- Интеграции (Integrations)
- Безопасность (Security)
- О программе (About)

**Main Content:**
- Settings panels
- Configuration forms
- License management

---

## Level 2: Dynamic Sidebar

### Purpose
Section-specific navigation that changes based on active App Nav section.

### Structure

```html
<aside class="dynamic-sidebar">
  <div class="dynamic-sidebar__header">
    <h2 class="dynamic-sidebar__title">Документы</h2>
    <button class="dynamic-sidebar__collapse">
      <span class="icon">⮜</span>
    </button>
  </div>

  <div class="dynamic-sidebar__search">
    <input type="text"
           class="dynamic-sidebar__search-input"
           placeholder="Поиск...">
  </div>

  <nav class="dynamic-sidebar__nav">
    <!-- Section-specific content -->
  </nav>
</aside>
```

### Sidebar Variants

#### Documents Sidebar

```html
<nav class="dynamic-sidebar__nav">
  <div class="sidebar-section">
    <h3 class="sidebar-section__title">Фильтры</h3>
    <div class="sidebar-filters">
      <button class="sidebar-filter sidebar-filter--active">
        Все документы (42)
      </button>
      <button class="sidebar-filter">
        ПЗ 01.05 (15)
      </button>
      <button class="sidebar-filter">
        ПЗ 01.04 (12)
      </button>
      <button class="sidebar-filter">
        Черновики (8)
      </button>
    </div>
  </div>

  <div class="sidebar-section">
    <h3 class="sidebar-section__title">Последние документы</h3>
    <ul class="sidebar-list">
      <li class="sidebar-list__item sidebar-list__item--active">
        <div class="sidebar-list__icon">📄</div>
        <div class="sidebar-list__content">
          <div class="sidebar-list__title">Жилой комплекс "Заря"</div>
          <div class="sidebar-list__meta">ПЗ 01.05 • 15 мин назад</div>
        </div>
      </li>
      <!-- More items... -->
    </ul>
  </div>
</nav>
```

#### Services Sidebar

```html
<nav class="dynamic-sidebar__nav">
  <div class="sidebar-section">
    <h3 class="sidebar-section__title">Категории</h3>

    <div class="sidebar-category">
      <button class="sidebar-category__header">
        <span class="sidebar-category__icon">📄</span>
        <span class="sidebar-category__title">Документы</span>
        <span class="sidebar-category__count">12</span>
        <span class="sidebar-category__toggle">▼</span>
      </button>
      <ul class="sidebar-category__list">
        <li class="sidebar-category__item">
          <span class="sidebar-category__item-icon">✅</span>
          <span class="sidebar-category__item-title">ПЗ 01.05</span>
        </li>
        <li class="sidebar-category__item">
          <span class="sidebar-category__item-icon">🔒</span>
          <span class="sidebar-category__item-title">Экспертиза</span>
          <span class="sidebar-category__item-badge">Pro</span>
        </li>
        <!-- More items... -->
      </ul>
    </div>

    <div class="sidebar-category">
      <button class="sidebar-category__header">
        <span class="sidebar-category__icon">🔧</span>
        <span class="sidebar-category__title">Утилиты</span>
        <span class="sidebar-category__count">6</span>
        <span class="sidebar-category__toggle">▼</span>
      </button>
      <!-- Category items... -->
    </div>

    <div class="sidebar-category">
      <button class="sidebar-category__header">
        <span class="sidebar-category__icon">🔌</span>
        <span class="sidebar-category__title">Интеграции</span>
        <span class="sidebar-category__count">5</span>
        <span class="sidebar-category__toggle">▼</span>
      </button>
      <!-- Category items... -->
    </div>
  </div>

  <div class="sidebar-section">
    <h3 class="sidebar-section__title">Быстрые фильтры</h3>
    <div class="sidebar-filters">
      <button class="sidebar-filter">Установленные</button>
      <button class="sidebar-filter">Доступные</button>
      <button class="sidebar-filter">Обновления</button>
    </div>
  </div>
</nav>
```

### CSS Classes

```css
.dynamic-sidebar {
  width: 240px;
  background-color: var(--color-bg);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dynamic-sidebar__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.dynamic-sidebar__title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin: 0;
}

.dynamic-sidebar__search {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.dynamic-sidebar__search-input {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
}

.dynamic-sidebar__nav {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
}

.sidebar-section {
  margin-bottom: var(--spacing-lg);
}

.sidebar-section__title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-sm) 0;
}

.sidebar-category {
  margin-bottom: var(--spacing-sm);
}

.sidebar-category__header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: var(--spacing-sm);
  background: none;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background-color 0.2s;
}

.sidebar-category__header:hover {
  background-color: var(--color-bg-hover);
}

.sidebar-category__count {
  margin-left: auto;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.sidebar-category__list {
  list-style: none;
  padding: 0;
  margin: var(--spacing-xs) 0 0 var(--spacing-lg);
}

.sidebar-category__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  cursor: pointer;
  border-radius: var(--border-radius);
  transition: background-color 0.2s;
}

.sidebar-category__item:hover {
  background-color: var(--color-bg-hover);
}

.sidebar-category__item-badge {
  margin-left: auto;
  padding: 2px 6px;
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  font-size: 10px;
  border-radius: 3px;
}
```

---

## Level 3: Main Content Area

### Purpose
Primary workspace area that displays section-specific content.

### Content Types

#### 1. Dashboard View

```html
<main class="main-content">
  <div class="dashboard">
    <header class="dashboard__header">
      <h1 class="dashboard__title">Добро пожаловать в XML Editor</h1>
      <p class="dashboard__subtitle">Создавайте профессиональные пояснительные записки</p>
    </header>

    <div class="dashboard__quick-actions">
      <button class="quick-action-card">
        <span class="quick-action-card__icon">➕</span>
        <span class="quick-action-card__title">Создать документ</span>
        <span class="quick-action-card__desc">Новая пояснительная записка</span>
      </button>
      <button class="quick-action-card">
        <span class="quick-action-card__icon">📂</span>
        <span class="quick-action-card__title">Открыть документ</span>
        <span class="quick-action-card__desc">Продолжить работу</span>
      </button>
      <button class="quick-action-card">
        <span class="quick-action-card__icon">🎨</span>
        <span class="quick-action-card__title">Из шаблона</span>
        <span class="quick-action-card__desc">Использовать шаблон</span>
      </button>
    </div>

    <div class="dashboard__widgets">
      <div class="widget">
        <h3 class="widget__title">Статистика</h3>
        <div class="widget__content">
          <div class="stat-item">
            <span class="stat-item__value">42</span>
            <span class="stat-item__label">Документов</span>
          </div>
          <div class="stat-item">
            <span class="stat-item__value">15</span>
            <span class="stat-item__label">Шаблонов</span>
          </div>
        </div>
      </div>

      <div class="widget">
        <h3 class="widget__title">Последняя активность</h3>
        <ul class="activity-list">
          <li class="activity-list__item">
            <span class="activity-list__icon">📄</span>
            <span class="activity-list__text">Изменён документ "ЖК Заря"</span>
            <span class="activity-list__time">5 минут назад</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</main>
```

#### 2. Document Editor View

```html
<main class="main-content">
  <div class="document-editor">
    <header class="document-editor__header">
      <div class="document-editor__breadcrumb">
        <span>Документы</span>
        <span class="breadcrumb-separator">›</span>
        <span>Жилой комплекс "Заря"</span>
      </div>
      <div class="document-editor__meta">
        <span class="meta-badge">ПЗ 01.05</span>
        <span class="meta-status meta-status--draft">Черновик</span>
        <span class="meta-time">Изменено 5 минут назад</span>
      </div>
    </header>

    <div class="document-editor__content">
      <!-- Form rendered by FormManager -->
      <div id="editor-form"></div>
    </div>
  </div>
</main>
```

#### 3. Service Store View

```html
<main class="main-content">
  <div class="service-store">
    <header class="service-store__header">
      <h1 class="service-store__title">Магазин сервисов</h1>
      <div class="service-store__filters">
        <button class="filter-pill filter-pill--active">Все</button>
        <button class="filter-pill">Установленные</button>
        <button class="filter-pill">Популярные</button>
        <button class="filter-pill">Новинки</button>
      </div>
    </header>

    <div class="service-store__featured">
      <div class="featured-banner">
        <h2>Пакет "Профессионал"</h2>
        <p>12 сервисов со скидкой 30%</p>
        <button class="btn btn--primary">Подробнее</button>
      </div>
    </div>

    <div class="service-store__grid">
      <div class="service-card">
        <div class="service-card__header">
          <span class="service-card__icon">📋</span>
          <span class="service-card__status service-card__status--installed">✅</span>
        </div>
        <h3 class="service-card__title">Пояснительная записка 01.05</h3>
        <p class="service-card__description">
          Создание ПЗ по актуальной схеме Минстроя
        </p>
        <div class="service-card__footer">
          <span class="service-card__price">Бесплатно</span>
          <button class="service-card__action" disabled>Установлено</button>
        </div>
      </div>

      <div class="service-card">
        <div class="service-card__header">
          <span class="service-card__icon">🔍</span>
          <span class="service-card__badge service-card__badge--pro">Pro</span>
        </div>
        <h3 class="service-card__title">Государственная экспертиза</h3>
        <p class="service-card__description">
          Автоматическая проверка по требованиям экспертизы
        </p>
        <div class="service-card__footer">
          <span class="service-card__price">2 990 ₽</span>
          <button class="service-card__action service-card__action--buy">Купить</button>
        </div>
        <div class="service-card__rating">
          <span class="rating">⭐⭐⭐⭐⭐</span>
          <span class="rating-count">(128 отзывов)</span>
        </div>
      </div>

      <!-- More service cards... -->
    </div>
  </div>
</main>
```

### CSS Classes

```css
.main-content {
  flex: 1;
  overflow-y: auto;
  background-color: var(--color-bg-light);
  padding: var(--spacing-xl);
}

.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard__header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.dashboard__quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.quick-action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-xl);
  background-color: var(--color-bg);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: all 0.3s;
}

.quick-action-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.service-store__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.service-card {
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  transition: all 0.3s;
}

.service-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

.service-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.service-card__icon {
  font-size: 32px;
}

.service-card__status--installed {
  font-size: 20px;
}

.service-card__badge--pro {
  padding: 4px 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: 4px;
}

.service-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.service-card__price {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-primary);
}

.service-card__action {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background-color 0.2s;
}

.service-card__action:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.service-card__action:disabled {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  cursor: not-allowed;
}
```

---

## Context Toolbar (Level 4)

### Purpose
Document-specific actions shown ONLY when a document is open in the editor.

### Structure

```html
<div class="context-toolbar" style="display: none;">
  <div class="context-toolbar__container">
    <div class="context-toolbar__group">
      <button class="context-toolbar__button" id="save-document">
        <span class="context-toolbar__icon">💾</span>
        <span class="context-toolbar__label">Сохранить</span>
      </button>
      <button class="context-toolbar__button" id="save-as-template">
        <span class="context-toolbar__icon">🎨</span>
        <span class="context-toolbar__label">Как шаблон</span>
      </button>
    </div>

    <div class="context-toolbar__group">
      <button class="context-toolbar__button" id="export-xml">
        <span class="context-toolbar__icon">📤</span>
        <span class="context-toolbar__label">Экспорт XML</span>
      </button>
      <button class="context-toolbar__button" id="export-pdf">
        <span class="context-toolbar__icon">📄</span>
        <span class="context-toolbar__label">Экспорт PDF</span>
      </button>
    </div>

    <div class="context-toolbar__group">
      <button class="context-toolbar__button" id="validate-document">
        <span class="context-toolbar__icon">✅</span>
        <span class="context-toolbar__label">Проверить</span>
      </button>
    </div>

    <div class="context-toolbar__group context-toolbar__group--right">
      <button class="context-toolbar__button context-toolbar__button--danger"
              id="delete-document">
        <span class="context-toolbar__icon">🗑️</span>
        <span class="context-toolbar__label">Удалить</span>
      </button>
      <button class="context-toolbar__button" id="close-document">
        <span class="context-toolbar__icon">✖️</span>
        <span class="context-toolbar__label">Закрыть</span>
      </button>
    </div>
  </div>
</div>
```

### Visibility Logic

```javascript
class UIStateManager {
  showContextToolbar() {
    const toolbar = document.querySelector('.context-toolbar');
    toolbar.style.display = 'block';
    this.adjustMainContentPadding(true);
  }

  hideContextToolbar() {
    const toolbar = document.querySelector('.context-toolbar');
    toolbar.style.display = 'none';
    this.adjustMainContentPadding(false);
  }

  adjustMainContentPadding(hasToolbar) {
    const mainContent = document.querySelector('.main-content');
    mainContent.style.paddingBottom = hasToolbar ? '60px' : '0';
  }
}
```

### CSS Classes

```css
.context-toolbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 48px;
  background-color: var(--color-bg);
  border-top: 1px solid var(--color-border);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: none; /* Hidden by default */
}

.context-toolbar__container {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  height: 100%;
  padding: 0 var(--spacing-lg);
}

.context-toolbar__group {
  display: flex;
  gap: var(--spacing-sm);
  padding-right: var(--spacing-md);
  border-right: 1px solid var(--color-border);
}

.context-toolbar__group:last-child {
  border-right: none;
}

.context-toolbar__group--right {
  margin-left: auto;
}

.context-toolbar__button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s;
}

.context-toolbar__button:hover {
  background-color: var(--color-bg-hover);
  border-color: var(--color-primary);
}

.context-toolbar__button--danger:hover {
  background-color: var(--color-danger-light);
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.context-toolbar__icon {
  font-size: 18px;
}

.context-toolbar__label {
  font-size: var(--font-size-sm);
  font-weight: 500;
}
```

---

## Navigation State Management

### State Machine

```
App State Transitions:

┌─────────────┐
│   Initial   │
│  (Landing)  │
└──────┬──────┘
       │
       ├──[Navigate to Главная]──► Dashboard View
       │                           ├─ Sidebar: Quick Actions
       │                           ├─ Main: Dashboard
       │                           └─ Context Toolbar: Hidden
       │
       ├──[Navigate to Документы]─► Documents View
       │                            ├─ Sidebar: Documents List
       │                            ├─ Main: Document Grid
       │                            └─ Context Toolbar: Hidden
       │
       │   [Select Document]
       │          │
       │          └──────────────► Document Editor View
       │                           ├─ Sidebar: Documents List (active item)
       │                           ├─ Main: Form Editor
       │                           └─ Context Toolbar: Visible
       │
       ├──[Navigate to Сервисы]───► Services View
       │                            ├─ Sidebar: Categories
       │                            ├─ Main: Service Store
       │                            └─ Context Toolbar: Hidden
       │
       └──[Navigate to Настройки]─► Settings View
                                    ├─ Sidebar: Settings Categories
                                    ├─ Main: Settings Panels
                                    └─ Context Toolbar: Hidden
```

### JavaScript State Manager

```javascript
class AppNavigationManager {
  constructor() {
    this.currentSection = 'home';
    this.documentOpen = false;
    this.activeDocumentId = null;
  }

  navigateToSection(section) {
    this.currentSection = section;
    this.documentOpen = false;
    this.activeDocumentId = null;

    this.updateAppNav(section);
    this.updateSidebar(section);
    this.updateMainContent(section);
    this.hideContextToolbar();
  }

  openDocument(documentId) {
    this.documentOpen = true;
    this.activeDocumentId = documentId;
    this.currentSection = 'documents';

    this.updateSidebarActiveItem(documentId);
    this.showDocumentEditor(documentId);
    this.showContextToolbar();
  }

  closeDocument() {
    this.documentOpen = false;
    this.activeDocumentId = null;

    this.hideContextToolbar();
    this.showDocumentGrid();
  }

  updateAppNav(section) {
    document.querySelectorAll('.app-nav__item').forEach(item => {
      item.classList.remove('app-nav__item--active');
    });
    document.querySelector(`[href="#${section}"]`)
            .classList.add('app-nav__item--active');
  }

  updateSidebar(section) {
    const sidebar = document.querySelector('.dynamic-sidebar__nav');

    switch(section) {
      case 'home':
        sidebar.innerHTML = this.generateHomeSidebar();
        break;
      case 'documents':
        sidebar.innerHTML = this.generateDocumentsSidebar();
        break;
      case 'services':
        sidebar.innerHTML = this.generateServicesSidebar();
        break;
      case 'settings':
        sidebar.innerHTML = this.generateSettingsSidebar();
        break;
    }
  }

  updateMainContent(section) {
    const mainContent = document.querySelector('.main-content');

    switch(section) {
      case 'home':
        mainContent.innerHTML = this.generateDashboard();
        break;
      case 'documents':
        mainContent.innerHTML = this.generateDocumentGrid();
        break;
      case 'services':
        mainContent.innerHTML = this.generateServiceStore();
        break;
      case 'settings':
        mainContent.innerHTML = this.generateSettings();
        break;
    }
  }

  showContextToolbar() {
    document.querySelector('.context-toolbar').style.display = 'block';
    document.querySelector('.main-content').style.paddingBottom = '60px';
  }

  hideContextToolbar() {
    document.querySelector('.context-toolbar').style.display = 'none';
    document.querySelector('.main-content').style.paddingBottom = '0';
  }
}
```

---

## Scalability Architecture

### Service Categorization System

#### Category Hierarchy

```
Services (Root)
├── Документы (Documents) - ~12 modules
│   ├── Пояснительные записки
│   │   ├── ПЗ 01.05 ✅
│   │   ├── ПЗ 01.04 ✅
│   │   └── ПЗ 01.03 ✅
│   ├── Экспертная документация
│   │   ├── Государственная экспертиза 🔒
│   │   └── Негосударственная экспертиза 🔒
│   ├── Сметная документация
│   │   ├── Смета (локальная) 🔒
│   │   ├── Смета (сводная) 🔒
│   │   └── Смета (объектная) 🔒
│   ├── Разрешительная документация
│   │   ├── Разрешение на строительство 🔒
│   │   └── Разрешение на ввод в эксплуатацию 🔒
│   └── Планы и схемы
│       ├── Генплан 🔒
│       ├── План эвакуации 🔒
│       └── Схемы инженерных сетей 🔒
│
├── Утилиты (Utilities) - ~6 modules
│   ├── Реестр документов 🔒
│   ├── Конвертер форматов ✅
│   ├── Валидатор XML ✅
│   ├── Генератор PDF ✅
│   ├── Чек-листы проверки 🔒
│   └── AI-помощник архитектора 🔒
│
└── Интеграции (Integrations) - ~5+ modules
    ├── Dadata API 🔒
    ├── ГИСОГД интеграция 🔒
    ├── AutoCAD connector 🔒
    ├── Облачное хранилище ✅
    └── E-mail уведомления ✅

Legend:
✅ - Installed (free or purchased)
🔒 - Available for purchase
```

### Search and Filter System

#### Filter Options

```javascript
const serviceFilters = {
  // Category filters
  categories: [
    { id: 'documents', label: 'Документы', count: 12 },
    { id: 'utilities', label: 'Утилиты', count: 6 },
    { id: 'integrations', label: 'Интеграции', count: 5 }
  ],

  // Status filters
  status: [
    { id: 'installed', label: 'Установленные', count: 7 },
    { id: 'available', label: 'Доступные', count: 16 },
    { id: 'updates', label: 'Обновления', count: 2 }
  ],

  // Price filters
  price: [
    { id: 'free', label: 'Бесплатные', count: 5 },
    { id: 'paid', label: 'Платные', count: 18 }
  ],

  // Rating filters
  rating: [
    { id: '5stars', label: '5 звёзд', count: 8 },
    { id: '4plus', label: '4+ звезды', count: 15 }
  ],

  // Sort options
  sort: [
    { id: 'popular', label: 'Популярные' },
    { id: 'newest', label: 'Новинки' },
    { id: 'price-asc', label: 'Цена: по возрастанию' },
    { id: 'price-desc', label: 'Цена: по убыванию' },
    { id: 'name', label: 'По алфавиту' }
  ]
};
```

#### Search Implementation

```javascript
class ServiceSearchEngine {
  constructor(services) {
    this.services = services;
    this.index = this.buildSearchIndex();
  }

  buildSearchIndex() {
    // Create inverted index for fast search
    const index = {};

    this.services.forEach(service => {
      const tokens = this.tokenize(
        `${service.title} ${service.description} ${service.tags.join(' ')}`
      );

      tokens.forEach(token => {
        if (!index[token]) {
          index[token] = [];
        }
        index[token].push(service.id);
      });
    });

    return index;
  }

  tokenize(text) {
    return text.toLowerCase()
               .replace(/[^\wа-яё\s]/g, '')
               .split(/\s+/)
               .filter(t => t.length > 2);
  }

  search(query, filters = {}) {
    const tokens = this.tokenize(query);
    let results = [];

    if (tokens.length === 0 && Object.keys(filters).length === 0) {
      return this.services;
    }

    // Find services matching search tokens
    if (tokens.length > 0) {
      const serviceIds = new Set();
      tokens.forEach(token => {
        if (this.index[token]) {
          this.index[token].forEach(id => serviceIds.add(id));
        }
      });

      results = Array.from(serviceIds).map(id =>
        this.services.find(s => s.id === id)
      );
    } else {
      results = [...this.services];
    }

    // Apply filters
    results = this.applyFilters(results, filters);

    // Apply sorting
    if (filters.sort) {
      results = this.sortResults(results, filters.sort);
    }

    return results;
  }

  applyFilters(results, filters) {
    if (filters.category) {
      results = results.filter(s => s.category === filters.category);
    }

    if (filters.status === 'installed') {
      results = results.filter(s => s.installed);
    }

    if (filters.price === 'free') {
      results = results.filter(s => s.price === 0);
    }

    if (filters.rating) {
      const minRating = parseInt(filters.rating);
      results = results.filter(s => s.rating >= minRating);
    }

    return results;
  }

  sortResults(results, sortType) {
    switch(sortType) {
      case 'popular':
        return results.sort((a, b) => b.downloads - a.downloads);
      case 'newest':
        return results.sort((a, b) => b.releaseDate - a.releaseDate);
      case 'price-asc':
        return results.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return results.sort((a, b) => b.price - a.price);
      case 'name':
        return results.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return results;
    }
  }
}
```

### Virtual Scrolling for Performance

#### Implementation for Large Lists

```javascript
class VirtualScrollList {
  constructor(container, items, renderItem) {
    this.container = container;
    this.items = items;
    this.renderItem = renderItem;

    this.itemHeight = 80; // Fixed item height in pixels
    this.visibleCount = Math.ceil(container.clientHeight / this.itemHeight);
    this.bufferSize = 5; // Extra items to render above/below

    this.scrollTop = 0;
    this.init();
  }

  init() {
    // Create viewport container
    this.viewport = document.createElement('div');
    this.viewport.style.height = `${this.items.length * this.itemHeight}px`;
    this.viewport.style.position = 'relative';

    // Create content container
    this.content = document.createElement('div');
    this.content.style.position = 'absolute';
    this.content.style.top = '0';
    this.content.style.left = '0';
    this.content.style.right = '0';

    this.viewport.appendChild(this.content);
    this.container.appendChild(this.viewport);

    // Attach scroll listener
    this.container.addEventListener('scroll', () => {
      this.scrollTop = this.container.scrollTop;
      this.render();
    });

    // Initial render
    this.render();
  }

  render() {
    const startIndex = Math.max(
      0,
      Math.floor(this.scrollTop / this.itemHeight) - this.bufferSize
    );

    const endIndex = Math.min(
      this.items.length,
      startIndex + this.visibleCount + (this.bufferSize * 2)
    );

    const visibleItems = this.items.slice(startIndex, endIndex);

    // Clear content
    this.content.innerHTML = '';

    // Position content
    this.content.style.transform = `translateY(${startIndex * this.itemHeight}px)`;

    // Render visible items
    visibleItems.forEach((item, index) => {
      const element = this.renderItem(item, startIndex + index);
      this.content.appendChild(element);
    });
  }

  updateItems(newItems) {
    this.items = newItems;
    this.viewport.style.height = `${this.items.length * this.itemHeight}px`;
    this.render();
  }
}

// Usage example
const serviceList = new VirtualScrollList(
  document.querySelector('.service-list'),
  services,
  (service, index) => {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.innerHTML = `
      <h3>${service.title}</h3>
      <p>${service.description}</p>
      <button>Install</button>
    `;
    return card;
  }
);
```

### Lazy Loading Modules

#### Dynamic Service Loading

```javascript
class ServiceModuleLoader {
  constructor() {
    this.loadedModules = new Map();
    this.moduleCache = new Map();
  }

  async loadService(serviceId) {
    // Check cache first
    if (this.moduleCache.has(serviceId)) {
      return this.moduleCache.get(serviceId);
    }

    try {
      // Load module manifest
      const manifest = await this.fetchServiceManifest(serviceId);

      // Load module code
      const module = await import(`./services/${serviceId}/main.js`);

      // Initialize service
      const service = new module.default(manifest);
      await service.initialize();

      // Cache and return
      this.moduleCache.set(serviceId, service);
      this.loadedModules.set(serviceId, service);

      return service;
    } catch (error) {
      console.error(`Failed to load service ${serviceId}:`, error);
      throw error;
    }
  }

  async fetchServiceManifest(serviceId) {
    const response = await fetch(`/api/services/${serviceId}/manifest.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch manifest for ${serviceId}`);
    }
    return response.json();
  }

  unloadService(serviceId) {
    const service = this.loadedModules.get(serviceId);
    if (service && service.cleanup) {
      service.cleanup();
    }
    this.loadedModules.delete(serviceId);
    // Keep in cache for faster reload
  }

  isServiceLoaded(serviceId) {
    return this.loadedModules.has(serviceId);
  }
}
```

---

## Service Store Concepts

### Service Card States

```
Service States:

┌─────────────────┐
│    Available    │ - Not installed, can be installed
│   (🔒 Locked)   │
└────────┬────────┘
         │
         │ [User clicks "Install/Buy"]
         ▼
┌─────────────────┐
│   Installing    │ - Download and installation in progress
│  (⏳ Loading)   │
└────────┬────────┘
         │
         │ [Installation complete]
         ▼
┌─────────────────┐
│    Installed    │ - Service ready to use
│  (✅ Checkmark) │
└────────┬────────┘
         │
         │ [Update available]
         ▼
┌─────────────────┐
│ Update Available│ - New version available
│   (🔄 Refresh)  │
└────────┬────────┘
         │
         │ [User updates]
         └───────► Installing state
```

### Pricing Models

#### Service Pricing Examples

| Service | Type | Price | License | Notes |
|---------|------|-------|---------|-------|
| ПЗ 01.05 | Free | 0 ₽ | Unlimited | Core feature |
| Конвертер форматов | Free | 0 ₽ | Unlimited | Utility |
| Экспертиза | Paid | 2 990 ₽ | Per-project | Professional feature |
| Сметная документация | Paid | 4 990 ₽ | Annual | Business feature |
| ГИСОГД интеграция | Paid | 1 490 ₽ | Monthly | API integration |
| AI-помощник | Premium | 990 ₽/мес | Subscription | Advanced AI features |

#### Package Bundles

```javascript
const packageBundles = [
  {
    id: 'starter',
    name: 'Пакет "Старт"',
    description: 'Базовые инструменты для небольших проектов',
    services: ['pz-01.05', 'converter', 'validator'],
    price: 0,
    discount: 0,
    badge: 'Бесплатно'
  },
  {
    id: 'professional',
    name: 'Пакет "Профессионал"',
    description: '12 сервисов для профессиональной работы',
    services: [
      'pz-01.05', 'expertise', 'smeta-local', 'smeta-summary',
      'genplan', 'evacuation-plan', 'registry', 'converter',
      'validator', 'pdf-generator', 'checklists', 'dadata'
    ],
    originalPrice: 25000,
    price: 17500,
    discount: 30,
    badge: 'Популярный'
  },
  {
    id: 'enterprise',
    name: 'Пакет "Предприятие"',
    description: 'Все сервисы + приоритетная поддержка',
    services: 'all',
    originalPrice: 50000,
    price: 35000,
    discount: 30,
    badge: 'Лучшее предложение'
  }
];
```

### Service Installation Flow

```javascript
class ServiceInstaller {
  async installService(serviceId) {
    try {
      // 1. Show installation progress
      this.showInstallProgress(serviceId);

      // 2. Check license
      const hasLicense = await this.checkLicense(serviceId);
      if (!hasLicense) {
        return this.promptPurchase(serviceId);
      }

      // 3. Download service package
      await this.downloadServicePackage(serviceId, (progress) => {
        this.updateProgress(serviceId, 'download', progress);
      });

      // 4. Verify package integrity
      await this.verifyPackage(serviceId);
      this.updateProgress(serviceId, 'verify', 100);

      // 5. Install service files
      await this.installServiceFiles(serviceId);
      this.updateProgress(serviceId, 'install', 100);

      // 6. Register service in database
      await this.registerService(serviceId);

      // 7. Initialize service
      await this.moduleLoader.loadService(serviceId);

      // 8. Complete installation
      this.showInstallComplete(serviceId);

      // 9. Update UI
      this.updateServiceCard(serviceId, 'installed');

    } catch (error) {
      this.showInstallError(serviceId, error);
      throw error;
    }
  }

  showInstallProgress(serviceId) {
    const card = document.querySelector(`[data-service-id="${serviceId}"]`);
    const progressBar = document.createElement('div');
    progressBar.className = 'service-card__progress';
    progressBar.innerHTML = `
      <div class="progress-bar">
        <div class="progress-bar__fill" style="width: 0%"></div>
      </div>
      <div class="progress-label">Установка...</div>
    `;
    card.appendChild(progressBar);
  }

  updateProgress(serviceId, stage, percent) {
    const card = document.querySelector(`[data-service-id="${serviceId}"]`);
    const fill = card.querySelector('.progress-bar__fill');
    const label = card.querySelector('.progress-label');

    fill.style.width = `${percent}%`;

    const labels = {
      download: 'Загрузка...',
      verify: 'Проверка...',
      install: 'Установка...'
    };

    label.textContent = `${labels[stage]} ${percent}%`;
  }
}
```

---

## Accessibility & UX Patterns

### Keyboard Navigation

```javascript
class KeyboardNavigationManager {
  constructor() {
    this.focusableSelectors = [
      '.app-nav__item',
      '.sidebar-category__item',
      '.service-card',
      '.context-toolbar__button'
    ].join(', ');

    this.attachKeyboardListeners();
  }

  attachKeyboardListeners() {
    document.addEventListener('keydown', (e) => {
      // Tab navigation
      if (e.key === 'Tab') {
        this.handleTabNavigation(e);
      }

      // Arrow key navigation in lists
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        this.handleArrowNavigation(e);
      }

      // Escape to close modals/overlays
      if (e.key === 'Escape') {
        this.handleEscape();
      }

      // Ctrl/Cmd + shortcuts
      if (e.ctrlKey || e.metaKey) {
        this.handleShortcuts(e);
      }
    });
  }

  handleShortcuts(e) {
    const shortcuts = {
      's': () => this.saveDocument(),          // Ctrl+S
      'n': () => this.createNewDocument(),     // Ctrl+N
      'o': () => this.openDocument(),          // Ctrl+O
      'f': () => this.focusSearch(),           // Ctrl+F
      'e': () => this.exportDocument(),        // Ctrl+E
      'w': () => this.closeDocument()          // Ctrl+W
    };

    if (shortcuts[e.key]) {
      e.preventDefault();
      shortcuts[e.key]();
    }
  }
}
```

### Loading States & Skeletons

```html
<!-- Service Card Skeleton -->
<div class="service-card service-card--skeleton">
  <div class="skeleton skeleton--circle"></div>
  <div class="skeleton skeleton--text"></div>
  <div class="skeleton skeleton--text skeleton--text-short"></div>
  <div class="skeleton skeleton--button"></div>
</div>
```

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-bg-secondary) 25%,
    var(--color-bg-hover) 50%,
    var(--color-bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: var(--border-radius);
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton--circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.skeleton--text {
  height: 16px;
  margin: var(--spacing-sm) 0;
}

.skeleton--text-short {
  width: 60%;
}

.skeleton--button {
  height: 36px;
  width: 100px;
}
```

---

## Performance Optimization

### Bundle Size Optimization

```javascript
// services-manifest.json - Metadata only, loaded upfront
{
  "services": [
    {
      "id": "pz-01.05",
      "title": "ПЗ 01.05",
      "category": "documents",
      "installed": true,
      "size": "2.3 MB",
      "version": "1.0.0"
    }
    // ... thousands more
  ]
}

// Individual service code loaded on-demand
// /services/pz-01.05/main.js - Loaded only when service is activated
```

### Caching Strategy

```javascript
class ServiceCacheManager {
  constructor() {
    this.memoryCache = new Map(); // In-memory cache
    this.storageCache = 'serviceCache'; // IndexedDB cache
  }

  async get(key) {
    // Check memory first
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }

    // Check IndexedDB
    const cached = await this.getFromStorage(key);
    if (cached && !this.isExpired(cached)) {
      this.memoryCache.set(key, cached.data);
      return cached.data;
    }

    return null;
  }

  async set(key, data, ttl = 3600000) { // 1 hour default
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      ttl
    };

    // Store in memory
    this.memoryCache.set(key, data);

    // Store in IndexedDB
    await this.saveToStorage(key, cacheEntry);
  }

  isExpired(cacheEntry) {
    return Date.now() - cacheEntry.timestamp > cacheEntry.ttl;
  }

  async clearExpired() {
    const keys = await this.getAllKeys();
    for (const key of keys) {
      const entry = await this.getFromStorage(key);
      if (entry && this.isExpired(entry)) {
        await this.removeFromStorage(key);
      }
    }
  }
}
```

---

## Migration from Current UI

### Current State (Single Page)

```
Current Layout:
┌───────────────────────────────────────────────────────┐
│  Header                                                │
├───────────────────────────────────────────────────────┤
│                                                         │
│  Document Editor (always visible)                      │
│                                                         │
│  - Schema selector                                     │
│  - Form fields                                         │
│  - Save/Export buttons                                 │
│                                                         │
└───────────────────────────────────────────────────────┘
```

### New State (3-Level Navigation)

```
New Layout:
┌───────────────────────────────────────────────────────┐
│  App Navigation (multi-section)                        │
├────────────┬──────────────────────────────────────────┤
│  Sidebar   │  Main Content (dynamic)                   │
│  (dynamic) │                                            │
│            │  - Dashboard when no document open        │
│            │  - Document editor when document open     │
└────────────┴──────────────────────────────────────────┘
```

### Migration Steps

1. **Phase 1: Add App Nav**
   - Create top navigation bar
   - Keep existing content as "Documents" section
   - Add empty Dashboard, Services, Settings sections

2. **Phase 2: Add Sidebar**
   - Create dynamic sidebar component
   - Populate Documents sidebar with document list
   - Integrate with existing document management

3. **Phase 3: Context Toolbar**
   - Move document actions to context toolbar
   - Show/hide based on document state
   - Keep functionality identical

4. **Phase 4: Dashboard**
   - Create dashboard view
   - Add quick actions
   - Add statistics widgets

5. **Phase 5: Services**
   - Implement service store UI
   - Add service categorization
   - Create installation system

6. **Phase 6: Settings**
   - Move settings to dedicated section
   - Create settings panels
   - Add preferences management

---

## Testing Strategy

### Unit Tests

```javascript
describe('AppNavigationManager', () => {
  it('should navigate to sections correctly', () => {
    const nav = new AppNavigationManager();
    nav.navigateToSection('services');
    expect(nav.currentSection).toBe('services');
  });

  it('should show context toolbar when document opens', () => {
    const nav = new AppNavigationManager();
    nav.openDocument('doc-123');
    const toolbar = document.querySelector('.context-toolbar');
    expect(toolbar.style.display).toBe('block');
  });

  it('should hide context toolbar when document closes', () => {
    const nav = new AppNavigationManager();
    nav.openDocument('doc-123');
    nav.closeDocument();
    const toolbar = document.querySelector('.context-toolbar');
    expect(toolbar.style.display).toBe('none');
  });
});
```

### Integration Tests

```javascript
describe('Service Installation', () => {
  it('should install service and update UI', async () => {
    const installer = new ServiceInstaller();
    await installer.installService('test-service');

    const card = document.querySelector('[data-service-id="test-service"]');
    expect(card.classList.contains('service-card--installed')).toBe(true);
  });
});
```

### E2E Tests

```javascript
describe('User Navigation Flow', () => {
  it('should navigate from dashboard to document editor', async () => {
    // 1. Start on dashboard
    await page.goto('http://localhost:3000');
    expect(await page.title()).toBe('XML Editor Desktop');

    // 2. Click "Documents" nav item
    await page.click('.app-nav__item[href="#documents"]');
    await page.waitForSelector('.document-grid');

    // 3. Click a document
    await page.click('.document-card:first-child');
    await page.waitForSelector('.document-editor');

    // 4. Verify context toolbar is visible
    const toolbar = await page.$('.context-toolbar');
    const isVisible = await toolbar.isIntersectingViewport();
    expect(isVisible).toBe(true);
  });
});
```

---

## Future Enhancements

### Phase 1 (Q1 2026)
- [ ] Complete migration to 3-level architecture
- [ ] Implement service store with 5 paid services
- [ ] Add virtual scrolling for document lists
- [ ] Implement keyboard shortcuts
- [ ] Add loading skeletons

### Phase 2 (Q2 2026)
- [ ] Advanced search with fuzzy matching
- [ ] Service recommendations based on usage
- [ ] Collaborative features (multi-user editing)
- [ ] Advanced analytics dashboard
- [ ] Mobile-responsive layout

### Phase 3 (Q3 2026)
- [ ] Plugin marketplace for third-party services
- [ ] Custom themes and UI customization
- [ ] Advanced workflow automation
- [ ] AI-powered suggestions
- [ ] Cloud sync and backup

---

## Troubleshooting

### Common Issues

#### Sidebar not updating when section changes
**Problem:** Sidebar shows wrong content

**Solution:**
1. Check `AppNavigationManager.updateSidebar()` is called
2. Verify section name matches switch cases
3. Check for JavaScript errors in console

#### Context toolbar not appearing
**Problem:** Toolbar stays hidden when document opens

**Solution:**
1. Verify `openDocument()` method calls `showContextToolbar()`
2. Check CSS `display` property is not overridden
3. Ensure `.context-toolbar` element exists in HTML

#### Service cards not loading
**Problem:** Empty service store grid

**Solution:**
1. Check service manifest loaded successfully
2. Verify `generateServiceStore()` returns valid HTML
3. Check network tab for failed API requests
4. Verify virtual scrolling initialization

---

## API Reference

### AppNavigationManager

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `navigateToSection()` | section: string | void | Navigate to app section |
| `openDocument()` | documentId: string | void | Open document in editor |
| `closeDocument()` | - | void | Close current document |
| `updateSidebar()` | section: string | void | Update sidebar content |
| `showContextToolbar()` | - | void | Display context toolbar |
| `hideContextToolbar()` | - | void | Hide context toolbar |

### ServiceSearchEngine

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `search()` | query: string, filters: object | Array | Search services |
| `applyFilters()` | results: Array, filters: object | Array | Filter results |
| `sortResults()` | results: Array, sortType: string | Array | Sort results |

### VirtualScrollList

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `render()` | - | void | Render visible items |
| `updateItems()` | newItems: Array | void | Update item list |

### ServiceInstaller

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `installService()` | serviceId: string | Promise<void> | Install service |
| `uninstallService()` | serviceId: string | Promise<void> | Uninstall service |
| `updateService()` | serviceId: string | Promise<void> | Update service |

---

## Changelog

### v2.0.0 (2025-10-03) - Planned
- 🎯 New 3-level navigation architecture
- 🎯 Dynamic sidebar system
- 🎯 Service store with marketplace
- 🎯 Context toolbar for documents
- 🎯 Virtual scrolling for scalability
- 🎯 Advanced search and filtering
- 🎯 Modular service system

---

**Document Version:** 2.0.0
**Last Updated:** 2025-10-03
**Author:** XML Editor Desktop Team
**Status:** Architecture Design Document
