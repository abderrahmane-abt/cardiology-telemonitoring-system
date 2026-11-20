@echo off
title CardioPulse-ESP32 Clinical Monitor
color 0B

echo ================================================================
echo   [CardioPulse-ESP32] Telemonitoring System (ICU Obsidian)
echo   Faculte de Medecine & CHU - Moniteur Clinique Temps Reel
echo ================================================================
echo.

cd /d "%~dp0"

:: 1. Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is not installed or not in your system PATH!
    echo.
    echo Please download and install Node.js 20 LTS from:
    echo https://nodejs.org/
    echo.
    echo (Make sure to check "Add to PATH" during installation)
    echo After installing, restart this script.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js detected:
node -v

:: 2. Check npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] npm is not installed or not in PATH!
    pause
    exit /b 1
)

:: 3. Install dependencies if node_modules is missing
if not exist "node_modules\" (
    color 0E
    echo.
    echo [SETUP] Installing project dependencies (npm install)...
    echo This only happens once on first startup. Please wait...
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [ERROR] npm install failed. Please check your internet connection.
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed successfully.
    color 0B
)

echo.
echo ================================================================
echo   Starting local dev server at http://localhost:5173 ...
echo   Opening default web browser in 3 seconds...
echo   Press Ctrl+C in this terminal window to stop the server.
echo ================================================================
echo.

:: 4. Open default web browser in background after short delay
start /b cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:5173"

:: 5. Launch Vite development server
call npm run dev

pause
