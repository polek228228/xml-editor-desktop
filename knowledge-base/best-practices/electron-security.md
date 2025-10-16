# Electron Security Best Practices (2024-2025)

## Обязательные настройки

```javascript
const mainWindow = new BrowserWindow({
  width: 1200,
  height: 800,
  webPreferences: {
    // ✅ ОБЯЗАТЕЛЬНО
    nodeIntegration: false,        // Нет Node.js в renderer
    contextIsolation: true,        // Изоляция контекста
    sandbox: true,                 // Sandboxing
    
    // ✅ Preload script
    preload: path.join(__dirname, '../preload/preload.js'),
    
    // ✅ Дополнительная безопасность
    enableRemoteModule: false,     // Отключён remote (deprecated)
    webSecurity: true,             // Web security включена
    allowRunningInsecureContent: false
  }
});
```

## IPC Security

### ❌ ОПАСНО
```javascript
// Renderer может выполнить ЛЮБОЙ код
ipcMain.handle('execute', (event, code) => {
  eval(code);  // НИКОГДА ТАК НЕ ДЕЛАЙ!
});
```

### ✅ БЕЗОПАСНО
```javascript
// Только определённые операции
ipcMain.handle('document:save', async (event, document) => {
  // Валидация входных данных
  if (!document || !document.id) {
    throw new Error('Invalid document');
  }
  
  // Только разрешённые операции
  return await documentManager.save(document);
});
```

## Content Security Policy

```javascript
// В main.js
mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': [
        "default-src 'self'; " +
        "script-src 'self'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data:;"
      ]
    }
  });
});
```

## Навигация

### Проверка URL
```javascript
mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
  const parsedUrl = new URL(navigationUrl);
  
  // Разрешаем только file:// протокол
  if (parsedUrl.origin !== 'file://') {
    event.preventDefault();
    console.warn('Blocked navigation to:', navigationUrl);
  }
});
```

## Источники
- Electron.js Security (2024)
- OWASP Electron Security Checklist
- Electron Best Practices (официальная документация)
