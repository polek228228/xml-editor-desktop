# SQLite Optimization Best Practices (2024-2025)

## MUST DO (критичные настройки)

### 1. WAL Mode
```sql
PRAGMA journal_mode = WAL;
```
**Результат:** 10x быстрее записи, можно читать во время записи

### 2. Cache Size
```sql
PRAGMA cache_size = -64000;  -- 64MB cache
```
**Результат:** Меньше обращений к диску

### 3. Synchronous Mode
```sql
PRAGMA synchronous = NORMAL;  -- Безопасно для desktop
```
**Результат:** Быстрее записи без риска

### 4. Temp Store
```sql
PRAGMA temp_store = MEMORY;
```
**Результат:** Быстрее сортировки и группировки

## Bulk Operations

### Транзакции для массовых вставок
```javascript
// ❌ ПЛОХО (медленно)
for (const item of items) {
  await db.run('INSERT ...', item);
}
// Скорость: 85 inserts/sec

// ✅ ХОРОШО (быстро)
await db.run('BEGIN TRANSACTION');
try {
  for (const item of items) {
    await db.run('INSERT ...', item);
  }
  await db.run('COMMIT');
} catch (error) {
  await db.run('ROLLBACK');
  throw error;
}
// Скорость: 96,000 inserts/sec (в 1000 раз!)
```

## Индексы

### Когда создавать
```sql
-- Создавай индексы ПОСЛЕ bulk insert
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_created ON documents(createdAt);

-- Для часто используемых WHERE/ORDER BY
CREATE INDEX idx_documents_user_date ON documents(userId, createdAt DESC);
```

### Covering Indexes
```sql
-- Если часто делаешь: SELECT id, title FROM documents WHERE type = ?
CREATE INDEX idx_documents_type_covering ON documents(type, id, title);
-- SELECT будет мгновенным (всё в индексе)
```

## Анализ производительности

### ANALYZE
```sql
-- Обновляет статистику для оптимизатора
ANALYZE;
```
Запускай после bulk операций или изменения структуры.

### EXPLAIN QUERY PLAN
```sql
EXPLAIN QUERY PLAN SELECT * FROM documents WHERE type = ?;
```
Показывает, использует ли запрос индексы.

## Источники
- PowerSync: SQLite Optimizations (2024)
- SQLite.org: Performance Tuning
- phiresky: SQLite Performance (2024)
