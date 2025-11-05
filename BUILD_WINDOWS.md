# Инструкция по сборке для Windows

## ⚠️ ВАЖНО!
Сборка для Windows ДОЛЖНА выполняться на Windows машине!
Нативные модули (sqlite3, libxmljs2) нельзя кросс-компилировать с macOS.

## Требования
- Windows 10/11
- Node.js 18+ установлен
- Git (опционально)
- Visual C++ Build Tools (устанавливаются автоматически через npm)

## Шаги

### 1. Скопировать проект на Windows машину
Скопируйте всю папку `xmlPZ` на Windows компьютер:
```
xmlPZ/
├── src/
├── package.json
├── package-lock.json
├── build-windows.bat
└── все остальные файлы
```

### 2. Запустить автоматическую сборку
Двойной клик на `build-windows.bat`

**ИЛИ** через PowerShell/CMD:
```cmd
build-windows.bat
```

Скрипт автоматически:
- Установит зависимости (`npm install`)
- Соберет приложение (electron-packager)
- Создаст ZIP архив

### 3. Результат
После сборки (~5-10 минут):
```
dist/
├── XML Editor Desktop-win32-x64/
│   └── XML Editor Desktop.exe   ← Запускаемый файл
└── XML-Editor-Desktop-Windows-x64.zip   ← Архив для распространения
```

### 4. Распространение
Отдай пользователям файл:
```
dist/XML-Editor-Desktop-Windows-x64.zip
```

## База данных
База создается автоматически при первом запуске в:
```
C:\Users\ИМЯ_ПОЛЬЗОВАТЕЛЯ\AppData\Roaming\xml-editor-desktop\xmleditor.db
```

## Проблемы

### Ошибка с native модулями
Если ошибка с sqlite3 или libxmljs2:
```bash
npm rebuild
```

### Ошибка сети при скачивании Electron
Попробуйте снова или используйте VPN.
