# Исправление путей к файлам

## Проблема
При запуске приложения возникали ошибки `ERR_FILE_NOT_FOUND` при загрузке JSON схем и маппингов.

## Причина
Неправильные относительные пути в `schema-loader.js` и `xml-generator.js`.

**Структура файлов:**
```
src/
├── renderer/
│   ├── index.html
│   └── js/
│       ├── schema-loader.js  ← отсюда загружаются файлы
│       └── xml-generator.js   ← отсюда загружаются файлы
└── schemas/
    ├── json/                  ← сюда нужно попасть
    │   ├── pz-01.03-schema.json
    │   ├── pz-01.04-schema.json
    │   └── pz-01.05-schema.json
    └── mappings/              ← сюда нужно попасть
        ├── explanatory-note-01.03-mapping.json
        ├── explanatory-note-01.04-mapping.json
        └── explanatory-note-01.05-mapping.json
```

**Путь из `src/renderer/js/` до `src/schemas/json/`:**
```
src/renderer/js/ → ../../schemas/json/
```

## Решение

### 1. Исправлен `schema-loader.js`

**Было:**
```javascript
this.basePath = './src/schemas/json';
```

**Стало:**
```javascript
this.basePath = '../../schemas/json';
```

**Почему:**
- Из `src/renderer/js/schema-loader.js`
- `..` → `src/renderer/`
- `../..` → `src/`
- `../../schemas/json` → `src/schemas/json/` ✅

### 2. Исправлен `xml-generator.js`

**Было:**
```javascript
const response = await fetch(`./src/schemas/mappings/explanatory-note-${schemaVersion}-mapping.json`);
```

**Стало:**
```javascript
const response = await fetch(`../../schemas/mappings/explanatory-note-${schemaVersion}-mapping.json`);
```

**Почему:**
- Из `src/renderer/js/xml-generator.js`
- `../../schemas/mappings` → `src/schemas/mappings/` ✅

## Проверка

После исправлений должны загружаться:
- ✅ `pz-01.03-schema.json`
- ✅ `pz-01.04-schema.json`
- ✅ `pz-01.05-schema.json`
- ✅ `explanatory-note-01.03-mapping.json`
- ✅ `explanatory-note-01.04-mapping.json`
- ✅ `explanatory-note-01.05-mapping.json`

## Тестирование

1. Запустить `npm run dev`
2. Открыть DevTools Console
3. Создать новый документ
4. Выбрать схему 01.03/01.04/01.05
5. **Ожидаемый результат:** Форма генерируется, нет ошибок 404

---

**Дата исправления:** 2 октября 2025
**Файлы изменены:** 2 (schema-loader.js, xml-generator.js)
**Статус:** ✅ ИСПРАВЛЕНО
