# Отладка Electron приложения XML Editor Desktop

Системная отладка десктопного приложения XML Editor Desktop на Electron.

## Шаги отладки:

### 1. Проверка процессов
```bash
# Проверить запущенные процессы Electron
ps aux | grep electron
ps aux | grep "XML Editor"

# Найти PID главного и renderer процессов
lsof -p <PID>
```

### 2. Проверка логов
```bash
# Посмотреть логи приложения
tail -f logs/electron.log

# Очистить старые логи если нужно
> logs/electron.log
```

### 3. Тестирование IPC каналов
```bash
# Запустить приложение с дополнительным логированием
NODE_ENV=development ELECTRON_ENABLE_LOGGING=true npm run dev
```

### 4. Проверка базы данных
```bash
# Подключиться к SQLite БД
sqlite3 data/xmleditor.db

# Проверить таблицы
.tables

# Проверить последние документы
SELECT * FROM documents ORDER BY created_at DESC LIMIT 5;
```

### 5. Отладка памяти
```bash
# Мониторинг памяти
ps -o pid,ppid,pmem,pcpu,comm -p <electron_pid>
```

## Распространенные проблемы:

### FormManager ошибки:
- ✅ Исправлено: `setupValidation is not a function`
- Проверить: загрузка JSON схем
- Проверить: инициализация валидаторов

### IPC проблемы:
- Контекстная изоляция включена
- Проверить регистрацию обработчиков в main.js
- Валидация в preload.js

### База данных:
- Проверить права доступа к файлу БД
- Убедиться что миграции применены
- Проверить WAL режим

## Инструменты отладки:
- **Electron DevTools**: Ctrl+Shift+I в renderer процессе
- **Chrome DevTools**: для отладки JavaScript
- **SQLite Browser**: для проверки базы данных
- **Activity Monitor**: для мониторинга ресурсов на macOS