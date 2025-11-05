@echo off
chcp 65001 > nul
title XML Editor Desktop - Smart Installer
color 0A

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║          XML Editor Desktop - SMART INSTALLER v3.0           ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

REM Check Node.js
echo [1/4] Проверка Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo ❌ Node.js НЕ УСТАНОВЛЕН!
    echo.
    echo 📥 Автоматическая установка Node.js:
    echo.
    echo    Открываю страницу загрузки...
    start https://nodejs.org/dist/v18.20.5/node-v18.20.5-x64.msi
    echo.
    echo    1. Скачайте и установите Node.js
    echo    2. Перезапустите этот скрипт
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js найден
node --version

REM Check npm
echo.
echo [2/4] Проверка npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo ❌ npm не найден!
    pause
    exit /b 1
)
echo ✅ npm найден
npm --version

REM Install dependencies
echo.
echo [3/4] Установка зависимостей...
echo.
echo ⏳ Это может занять 3-10 минут при первом запуске...
echo    Не закрывайте окно!
echo.

npm install --production --legacy-peer-deps --no-audit --no-fund
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo ❌ Ошибка установки зависимостей!
    echo.
    echo Попробуйте:
    echo  1. Проверить интернет-соединение
    echo  2. Отключить VPN
    echo  3. Запустить от имени администратора
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Зависимости установлены!

REM Initialize database
echo.
echo [4/4] Инициализация базы данных...
node init-database.js
if %errorlevel% neq 0 (
    echo ⚠️  База данных уже существует (это нормально)
) else (
    echo ✅ База данных создана
)

REM Create desktop shortcut helper
echo.
echo 📝 Создание ярлыка...
echo Set oWS = WScript.CreateObject("WScript.Shell") > "%temp%\shortcut.vbs"
echo sLinkFile = "%USERPROFILE%\Desktop\XML Editor Desktop.lnk" >> "%temp%\shortcut.vbs"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%temp%\shortcut.vbs"
echo oLink.TargetPath = "%cd%\START-WINDOWS.bat" >> "%temp%\shortcut.vbs"
echo oLink.WorkingDirectory = "%cd%" >> "%temp%\shortcut.vbs"
echo oLink.IconLocation = "%cd%\build\icon.png" >> "%temp%\shortcut.vbs"
echo oLink.Description = "XML Editor Desktop" >> "%temp%\shortcut.vbs"
echo oLink.Save >> "%temp%\shortcut.vbs"
cscript //nologo "%temp%\shortcut.vbs"
del "%temp%\shortcut.vbs"

echo ✅ Ярлык создан на рабочем столе

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                  ✅ УСТАНОВКА ЗАВЕРШЕНА!                      ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo 🚀 Запуск приложения...
echo.

REM Start the application
npm start

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo ❌ Ошибка запуска приложения!
    echo.
    echo Проверьте логи в папке logs/
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Приложение запущено успешно!
echo.
echo 💡 Совет: В следующий раз запускайте через ярлык на рабочем столе
echo           или файл START-WINDOWS.bat
echo.
pause
