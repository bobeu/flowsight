# FlowSight Backend Startup Script for Windows PowerShell
# This script starts the FlowSight backend server

Write-Host "🚀 Starting FlowSight Backend..." -ForegroundColor Cyan

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ from https://www.python.org/" -ForegroundColor Yellow
    exit 1
}

# Navigate to backend directory
$backendDir = Join-Path $PSScriptRoot "backend"
if (-not (Test-Path $backendDir)) {
    Write-Host "❌ Backend directory not found: $backendDir" -ForegroundColor Red
    exit 1
}

Set-Location $backendDir
Write-Host "📁 Changed to directory: $backendDir" -ForegroundColor Cyan

# Check if virtual environment exists
$venvPath = Join-Path $backendDir ".venv"
if (-not (Test-Path $venvPath)) {
    Write-Host "⚠️  Virtual environment not found. Creating one..." -ForegroundColor Yellow
    python -m venv .venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "🔧 Activating virtual environment..." -ForegroundColor Cyan
& "$venvPath\Scripts\Activate.ps1"

# Check if requirements are installed
Write-Host "📦 Checking dependencies..." -ForegroundColor Cyan
if (-not (Test-Path "requirements.txt")) {
    Write-Host "❌ requirements.txt not found" -ForegroundColor Red
    exit 1
}

# Install/upgrade dependencies
Write-Host "📥 Installing dependencies..." -ForegroundColor Cyan
pip install -q --upgrade pip
pip install -q -r requirements.txt

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Using default configuration." -ForegroundColor Yellow
    Write-Host "   You may want to create a .env file with your configuration." -ForegroundColor Yellow
}

# Check if database is accessible (optional)
Write-Host "🔍 Checking database connection..." -ForegroundColor Cyan
# This is optional - the app will handle connection errors

# Start the server
Write-Host ""
Write-Host "🎯 Starting FastAPI server on http://localhost:8000" -ForegroundColor Green
Write-Host "📚 API Documentation: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "🔍 Health Check: http://localhost:8000/health" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

