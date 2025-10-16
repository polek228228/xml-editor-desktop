# Code Templates

**Назначение:** Шаблоны кода для быстрой генерации через CODE-GENERATOR агента

**Использование:** Замените `{{placeholders}}` на реальные значения

---

## 📁 Структура

```
templates/
├── ui/
│   └── form-component.js          # UI-компонент формы
├── validation/
│   └── json-schema-template.json  # JSON Schema для валидации
├── test/
│   └── unit-test-template.js      # Unit-тест
├── plugin/
│   └── module-structure-template.js # Модульная структура
├── electron/
│   └── ipc-handler.js             # IPC-обработчик
└── database/
    └── crud-manager.js            # CRUD-менеджер
```

---

## 🚀 Примеры использования

### 1. UI Component Template

**Файл:** `ui/form-component.js`

**Placeholders:**
- `{{ComponentName}}` - имя класса компонента (e.g., `TextInputComponent`)
- `{{component-type}}` - тип компонента (e.g., `text`, `select`, `date`)
- `{{input-type}}` - тип input (e.g., `text`, `number`, `email`)

**Пример:**
```javascript
// TextInputComponent заменит {{ComponentName}}
class TextInputComponent {
    constructor(options) {
        // ...
    }
}
```

---

### 2. JSON Schema Template

**Файл:** `validation/json-schema-template.json`

**Placeholders:**
- `{{schema-id}}` - ID схемы (e.g., `document/explanatory-note`)
- `{{SchemaTitle}}` - заголовок схемы
- `{{field-1}}`, `{{field-2}}` - имена полей
- `{{required-field-1}}` - обязательные поля

**Пример:**
```json
{
  "$id": "document/explanatory-note",
  "title": "Explanatory Note Schema"
}
```

---

### 3. Unit Test Template

**Файл:** `test/unit-test-template.js`

**Placeholders:**
- `{{ModuleName}}` - имя тестируемого модуля
- `{{instanceName}}` - имя экземпляра (e.g., `storageManager`)
- `{{method1-name}}` - имя метода для тестирования

**Пример:**
```javascript
describe('StorageManager', () => {
    let storageManager;
    // ...
});
```

---

### 4. Module Structure Template

**Файл:** `plugin/module-structure-template.js`

**Placeholders:**
- `{{ModuleName}}` - имя класса модуля (e.g., `ExplanatoryNoteModule`)
- `{{schemas-dir}}` - директория со схемами
- `{{default-content-object}}` - дефолтное содержимое документа

**Пример:**
```javascript
class ExplanatoryNoteModule {
    constructor(config) {
        this.name = 'explanatory-note-01.05';
        // ...
    }
}
```

---

## 🤖 Как CODE-GENERATOR использует шаблоны

1. **Загружает шаблон** из нужной категории
2. **Заменяет placeholders** на реальные значения
3. **Генерирует файл** в нужной директории

**Пример команды:**
```
USER: "Создай TextInput компонент"

CODE-GENERATOR:
1. Загружает templates/ui/form-component.js
2. Заменяет {{ComponentName}} на TextInputComponent
3. Заменяет {{component-type}} на text
4. Создаёт src/renderer/js/components/text-input.js
```

---

## 📝 Добавление новых шаблонов

Чтобы добавить новый шаблон:

1. Создайте файл в соответствующей категории
2. Используйте `{{placeholders}}` для переменных частей
3. Добавьте описание в этот README
4. Обновите CODE-GENERATOR агента

---

**Версия:** 1.0
**Дата:** 1 октября 2025
**Статус:** ✅ Базовые шаблоны готовы
