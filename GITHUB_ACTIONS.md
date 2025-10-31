# GitHub Actions - Автоматическая сборка

## Что делает
GitHub Actions автоматически собирает приложение для macOS и Windows на серверах GitHub.

## Настройка (один раз)

### 1. Инициализировать Git репозиторий (если еще не сделано)
```bash
git init
git add .
git commit -m "Initial commit"
```

### 2. Создать репозиторий на GitHub
1. Зайти на github.com
2. Нажать "New repository"
3. Назвать, например: `xml-editor-desktop`
4. НЕ создавать README, .gitignore (уже есть)

### 3. Подключить локальный репозиторий к GitHub
```bash
git remote add origin https://github.com/ВАШ_USERNAME/xml-editor-desktop.git
git branch -M main
git push -u origin main
```

## Как собрать приложение

### Вариант 1: Автоматическая сборка при push
Просто сделать коммит и push:
```bash
git add .
git commit -m "Update app"
git push
```

GitHub автоматически соберет обе версии (macOS + Windows).

### Вариант 2: Ручной запуск
1. Зайти на github.com в свой репозиторий
2. Перейти на вкладку "Actions"
3. Выбрать "Build Electron App"
4. Нажать "Run workflow" → "Run workflow"

### Вариант 3: Релиз с тегом
```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub создаст Release с обоими файлами автоматически!

## Где скачать результаты

### После push или ручного запуска:
1. Зайти в репозиторий на GitHub
2. Вкладка "Actions"
3. Кликнуть на последний workflow run
4. Прокрутить вниз до "Artifacts"
5. Скачать:
   - `macos-arm64` → XML-Editor-Desktop-macOS-arm64.zip
   - `windows-x64` → XML-Editor-Desktop-Windows-x64.zip

### При релизе с тегом:
1. Вкладка "Releases" в репозитории
2. Скачать файлы из последнего релиза

## Преимущества
- ✅ Не нужна Windows машина
- ✅ Сборка на чистой системе GitHub
- ✅ Автоматическая сборка обеих версий
- ✅ Бесплатно (2000 минут в месяц)
- ✅ Можно дать ссылку другим для скачивания

## Время сборки
- macOS: ~3-5 минут
- Windows: ~3-5 минут
- Итого: ~8-10 минут

## Проблемы

### "Workflow not found"
Убедитесь что файл `.github/workflows/build.yml` закоммичен и запушен.

### "Node modules failed"
GitHub автоматически установит зависимости. Если ошибка - проверьте `package.json`.

### "Permission denied"
В настройках репозитория:
Settings → Actions → General → Workflow permissions → "Read and write permissions"
