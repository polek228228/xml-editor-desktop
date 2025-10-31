@echo off
REM Build script for Windows

echo ================================
echo XML Editor Desktop - Windows Build
echo ================================
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
