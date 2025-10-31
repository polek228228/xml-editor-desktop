# Инструкция по сборке для Windows

## Требования
- Windows 10/11
- Node.js 18+ установлен
- Git (опционально)

## Шаги

### 1. Скопировать проект на Windows машину
Скопируйте всю папку `xmlPZ` на Windows компьютер.

### 2. Установить зависимости
Открыть PowerShell или CMD в папке проекта:
```bash
npm install
```

### 3. Собрать приложение
```bash
npm run build:win
```

**ИЛИ** для быстрой сборки без установщика:
```bash
npx electron-packager . "XML Editor Desktop" --platform=win32 --arch=x64 --out=dist --overwrite
```

### 4. Результат
Приложение будет в папке:
```
dist/XML Editor Desktop-win32-x64/XML Editor Desktop.exe
```

### 5. Создать ZIP для распространения
```bash
cd dist
tar -a -c -f XML-Editor-Desktop-Windows-x64.zip "XML Editor Desktop-win32-x64"
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
