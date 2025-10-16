# XML Editor Desktop — Краткая сводка проекта

**Дата:** 1 октября 2025
**Статус:** MVP готов, требует завершения PDF/Build/Tests

---

## Что это?

**Desktop-приложение (Electron)** для создания XML пояснительных записок по стандартам Минстроя России. Клон xmlonline.ru с улучшениями для offline работы.

---

## Технологии

- **Electron** — multi-process (main + renderer + preload)
- **SQLite3** — локальное хранилище
- **Vanilla JS** — без фреймворков
- **BEM** — CSS методология

---

## Что работает ✅

| Компонент | Статус |
|-----------|--------|
| Main Process (main.js) | ✅ |
| Storage Manager (SQLite) | ✅ |
| Template Manager | ✅ |
| XML Generator | ✅ |
| Preload Bridge (IPC) | ✅ |
| XMLEditorApp (UI) | ✅ |
| FormManager (формы) | ✅ |
| UI компоненты | ✅ |
| Система шаблонов | ✅ |
| Автосохранение (30с) | ✅ |
| База данных (4 миграции) | ✅ |
| JSON схемы (01.03/04/05) | ✅ |

---

## Что требует завершения ⏳

1. **PDF генерация** — XSLT трансформация (критично для MVP)
2. **Build pipeline** — electron-builder для .exe/.dmg
3. **XSD валидация** — валидация XML против официальных схем
4. **Unit тесты** — покрытие основных компонентов
5. **Импорт XML** — загрузка существующих XML файлов

---

## Структура проекта

```
xmlPZ/
├── src/
│   ├── main/           # Main process (Node.js)
│   ├── renderer/       # UI (HTML/CSS/JS)
│   ├── preload/        # IPC bridge
│   ├── schemas/        # JSON/XSD schemas
│   ├── templates/      # XML/UI templates
│   └── database/       # SQLite migrations
├── data/               # SQLite DB
├── logs/               # Electron logs
├── docs/               # Documentation
├── agents/             # AI agents (14 шт)
├── analysis/           # xmlonline.ru analysis
└── concept/            # Project concept
```

---

## Как запустить

```bash
# Установка
npm install

# Разработка (с логами)
npm run dev

# Разработка (простой)
npm run dev:simple

# Production
npm start
```

---

## Ключевые файлы для разработки

**Прочитать ОБЯЗАТЕЛЬНО:**
- `CLAUDE.md` — инструкции для Claude Code + критичные паттерны
- `docs/ARCHITECTURE.md` — архитектура приложения
- `CONVERSATION_HISTORY_ANALYSIS.md` — полная история разработки

**Код:**
- `src/main/main.js` — XMLEditorApplication
- `src/main/storage-manager.js` — StorageManager
- `src/renderer/js/app.js` — XMLEditorApp
- `src/renderer/js/form-manager.js` — FormManager
- `src/preload/preload.js` — IPC bridge

---

## Критичные паттерны (НЕ НАРУШАТЬ!)

### 1. UI Cleanup
```javascript
// ВСЕГДА вызывать перед открытием документов
window.xmlEditorApp.cleanupUI();
```

### 2. StorageManager методы
```javascript
// ❌ НЕПРАВИЛЬНО
await this.db.all(sql, params);

// ✅ ПРАВИЛЬНО
await this.storage.allQuery(sql, params);
await this.storage.getQuery(sql, params);
await this.storage.runQuery(sql, params);
```

### 3. schema_version в шаблонах
```javascript
// ВСЕГДА включать schema_version
const templateData = {
  name: data.name,
  schema_version: data.schema_version, // ОБЯЗАТЕЛЬНО!
  content: data.content
};
```

### 4. Не перекрывать document
```javascript
// ❌ БАГ
const document = await api.loadDocument(id);
const button = document.querySelector('.btn'); // ERROR!

// ✅ ОК
const doc = await api.loadDocument(id);
const button = window.document.querySelector('.btn');
```

---

## База данных

**Таблицы:**
- `documents` — документы (title, schema_version, content, xml_content)
- `autosaves` — автосохранения
- `settings` — настройки приложения
- `templates` — шаблоны (name, description, schema_version, content, category, tags)
- `document_history` — история версий

**Миграции:**
- `001_init.sql` — базовые таблицы
- `002_autosave.sql` — автосохранения
- `003_add_templates.sql` — система шаблонов
- `004_add_template_metadata.sql` — метаданные (category, tags)

---

## IPC каналы

**Document:**
- `document:create` — создать документ
- `document:save` — сохранить документ
- `document:load` — загрузить документ
- `document:autosave` — автосохранение

**Template:**
- `template:list` — список шаблонов
- `template:create` — создать шаблон
- `template:get` — получить шаблон
- `template:update` — обновить шаблон
- `template:delete` — удалить шаблон

**Settings:**
- `settings:get` — получить настройку
- `settings:set` — установить настройку

**Dialog:**
- `dialog:show-save` — диалог сохранения
- `dialog:show-open` — диалог открытия

---

## AI Агенты (14 шт)

**Core:**
- Debugger
- Code Reviewer
- Refactorer

**Design:**
- UI Designer
- UX Analyst

**Quality:**
- Tester
- Security
- Performance

**Content:**
- Documenter

**Helper:**
- Prompt Optimizer
- Task Splitter

**Advanced:**
- Code Generator
- Architecture Validator
- Auto Tester
- Ollama Consultant

---

## XML Схемы Минстроя

**Версии:**
- **01.03** — устаревшая (до 29 марта 2025)
- **01.04** — переходная (до 29 марта 2025)
- **01.05** — текущая (обязательна с 29 марта 2025)

**Валидация (4 уровня):**
1. Client-side (реал-тайм UI)
2. JSON Schema
3. XML XSD
4. Business Logic

---

## Следующие шаги

### Критично (1-2 дня)
1. Реализовать PDF генерацию (XSLT)
2. Настроить electron-builder
3. Добавить XSD валидацию

### Важно (1 неделя)
4. Unit тесты
5. Импорт XML
6. UI настроек
7. Error handling

### Желательно (2-4 недели)
8. E2E тесты
9. Business logic validation
10. История версий
11. Performance оптимизация
12. Accessibility

---

## Статистика

- **Диалогов:** 13 файлов (~22 MB)
- **Период:** 25 сентября - 1 октября 2025 (7 дней)
- **Код:** ~6700 строк (JS/HTML/CSS/SQL/JSON)
- **Документация:** 30+ MD файлов (~50,000 слов)
- **Время разработки:** ~50 часов

---

## Полезные ссылки

- **Минстрой XML:** https://minstroyrf.gov.ru/tim/xml-skhemy/
- **xmlonline.ru:** http://xmlonline.ru/poyasnitelnaya-zapiska-v-xml
- **Electron Docs:** https://www.electronjs.org/docs
- **SQLite Docs:** https://www.sqlite.org/docs.html

---

## Проблемы? Читай:

1. `CLAUDE.md` — критичные паттерны и исправления
2. `CONVERSATION_HISTORY_ANALYSIS.md` — полная история и решения
3. `docs/ARCHITECTURE.md` — архитектура
4. `logs/electron.log` — логи ошибок

---

**Создано:** 1 октября 2025
**Версия:** 1.0
**Проект готов к продолжению разработки!** 🚀
