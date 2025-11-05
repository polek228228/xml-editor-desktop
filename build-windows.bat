@echo off
REM Build script for Windows

echo ================================
echo XML Editor Desktop - Windows Build
echo ================================
echo.

REM Check if Node.js is installed
where npm >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERROR: Node.js не установлен!
    echo.
    echo Пожалуйста, установите Node.js:
    echo https://nodejs.org/en/download/
    echo.
    echo Выберите "Windows Installer (.msi)" 64-bit
    echo После установки перезапустите этот скрипт.
    echo.
    pause
    exit /b 1
)

echo Node.js найден:
call node --version
echo npm найден:
call npm --version
echo.

echo [1/3] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)
echo.

echo [2/3] Building application...
call npx electron-packager . "XML Editor Desktop" --platform=win32 --arch=x64 --out=dist --overwrite
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo.

echo [3/3] Creating ZIP...
cd dist
tar -a -c -f XML-Editor-Desktop-Windows-x64.zip "XML Editor Desktop-win32-x64"
cd ..
echo.

echo ================================
echo BUILD COMPLETE!
echo ================================
echo Location: dist\XML Editor Desktop-win32-x64\
echo ZIP: dist\XML-Editor-Desktop-Windows-x64.zip
echo.
pause
