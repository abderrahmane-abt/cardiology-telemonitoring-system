# CardioPulse-ESP32 1-Click Launch Script (Windows PowerShell)
$Host.UI.RawUI.WindowTitle = "CardioPulse-ESP32 Clinical Monitor"

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  🫀 CardioPulse-ESP32 Telemonitoring System (ICU Obsidian)" -ForegroundColor Cyan
Write-Host "  Faculté de Médecine & CHU - Moniteur Clinique Temps Réel" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot

# 1. Verify Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "Please download and install Node.js 20 LTS from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "After installation, close and reopen PowerShell." -ForegroundColor Yellow
    Read-Host "Press Enter to exit..."
    exit 1
}

$nodeVersion = node -v
Write-Host "[OK] Node.js detected: $nodeVersion" -ForegroundColor Green

# 2. Check dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "[SETUP] First time setup: Installing npm packages..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] npm install encountered an error." -ForegroundColor Red
        Read-Host "Press Enter to exit..."
        exit 1
    }
    Write-Host "[OK] Dependencies installed." -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Launching Vite local server on http://localhost:5173 ..." -ForegroundColor Green
Write-Host "Opening web browser automatically in 3 seconds..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server at any time." -ForegroundColor Yellow
Write-Host ""

# Background job to open browser after short delay
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 3
    Start-Process "http://localhost:5173"
} | Out-Null

# Run Vite dev server
npm run dev
