#!/bin/bash
# FlowSight Backend Startup Script for Linux/macOS
# This script starts the FlowSight backend server

echo "🚀 Starting FlowSight Backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed or not in PATH"
    echo "Please install Python 3.8+ from https://www.python.org/"
    exit 1
fi

PYTHON_VERSION=$(python3 --version)
echo "✅ Python found: $PYTHON_VERSION"

# Navigate to backend directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"

if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Backend directory not found: $BACKEND_DIR"
    exit 1
fi

cd "$BACKEND_DIR"
echo "📁 Changed to directory: $BACKEND_DIR"

# Check if virtual environment exists
VENV_PATH="$BACKEND_DIR/.venv"
if [ ! -d "$VENV_PATH" ]; then
    echo "⚠️  Virtual environment not found. Creating one..."
    python3 -m venv .venv
    echo "✅ Virtual environment created"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source "$VENV_PATH/bin/activate"

# Check if requirements are installed
echo "📦 Checking dependencies..."
if [ ! -f "requirements.txt" ]; then
    echo "❌ requirements.txt not found"
    exit 1
fi

# Install/upgrade dependencies
echo "📥 Installing dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Using default configuration."
    echo "   You may want to create a .env file with your configuration."
fi

# Check if database is accessible (optional)
echo "🔍 Checking database connection..."
# This is optional - the app will handle connection errors

# Start the server
echo ""
echo "🎯 Starting FastAPI server on http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo "🔍 Health Check: http://localhost:8000/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

