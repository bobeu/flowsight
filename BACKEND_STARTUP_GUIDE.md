# FlowSight Backend Startup Guide

This guide explains how to start the FlowSight backend server.

## Prerequisites

- **Python 3.8+** installed on your system
- **pip** (Python package manager)
- **PostgreSQL** (optional, for production - mock data is used in development)
- **Redis** (optional, for caching - not required for MVP)

## Quick Start

### Option 1: Using Startup Scripts (Recommended)

#### Windows (PowerShell)
```powershell
cd flowsight
.\backend\start_backend.ps1
```

#### Linux/macOS (Bash)
```bash
cd flowsight
chmod +x backend/start_backend.sh
./backend/start_backend.sh
```

### Option 2: Manual Setup

#### Step 1: Navigate to Backend Directory
```powershell
# Windows
cd flowsight\backend

# Linux/macOS
cd flowsight/backend
```

#### Step 2: Create Virtual Environment (if not exists)
```powershell
# Windows
python -m venv .venv

# Linux/macOS
python3 -m venv .venv
```

#### Step 3: Activate Virtual Environment
```powershell
# Windows PowerShell
.venv\Scripts\Activate.ps1

# Windows CMD
.venv\Scripts\activate.bat

# Linux/macOS
source .venv/bin/activate
```

#### Step 4: Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### Step 5: Start the Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Using Docker (Alternative)

If you prefer using Docker:

```powershell
cd flowsight
docker-compose up backend
```

This will start the backend along with PostgreSQL and Redis.

## Verification

Once the server is running, you can verify it's working by:

1. **Health Check:**
   ```powershell
   # PowerShell
   Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing
   
   # Linux/macOS
   curl http://localhost:8000/health
   ```

2. **API Root:**
   ```powershell
   # PowerShell
   Invoke-WebRequest -Uri "http://localhost:8000/" -UseBasicParsing
   
   # Linux/macOS
   curl http://localhost:8000/
   ```

3. **API Documentation:**
   Open your browser and navigate to:
   - **Swagger UI:** http://localhost:8000/docs
   - **ReDoc:** http://localhost:8000/redoc

## Configuration

### Environment Variables

Create a `.env` file in the `backend` directory (optional):

```env
# Database
DATABASE_URL=postgresql://flowsight:flowsight_password@localhost:5432/flowsight_db

# Redis
REDIS_URL=redis://localhost:6379/0

# Environment
ENVIRONMENT=development
DEBUG=True

# CORS (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# API Keys (optional for MVP - mock data is used)
GLASSNODE_API_KEY=
CRYPTOQUANT_API_KEY=
ETHERSCAN_API_KEY=
BINANCE_API_KEY=
BINANCE_SECRET_KEY=
```

**Note:** The backend will use default values if `.env` is not provided.

## Troubleshooting

### Port Already in Use

If port 8000 is already in use:

1. **Find the process using port 8000:**
   ```powershell
   # Windows
   netstat -ano | findstr :8000
   
   # Linux/macOS
   lsof -i :8000
   ```

2. **Kill the process** or use a different port:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
   ```

3. **Update frontend API URL** if you change the port:
   - Update `NEXT_PUBLIC_API_URL` in `docker-compose.yml` or `.env`

### Database Connection Errors

If you see database connection errors:

- **For Development:** The backend will use mock data if the database is unavailable
- **For Production:** Ensure PostgreSQL is running and accessible
- Check `DATABASE_URL` in your `.env` file

### Module Not Found Errors

If you see "ModuleNotFoundError":

1. Ensure virtual environment is activated
2. Reinstall dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### CORS Errors

If the frontend can't connect due to CORS:

1. Check `ALLOWED_ORIGINS` in backend configuration
2. Ensure frontend URL is included (default: `http://localhost:3000`)
3. Restart the backend server after changing CORS settings

## API Endpoints

Once running, the following endpoints are available:

- `GET /` - API root and status
- `GET /health` - Health check
- `GET /docs` - Swagger UI documentation
- `GET /redoc` - ReDoc documentation
- `GET /api/v1/lsp/current?asset=BTC` - Current LSP score
- `GET /api/v1/lsp/history?asset=BTC&hours=24` - LSP history
- `GET /api/v1/whales/top?limit=10` - Top whale wallets
- `GET /api/v1/whales/{address}` - Whale details
- `GET /api/v1/transactions/recent?limit=50` - Recent transactions
- `GET /api/v1/transactions/alerts?hours=24&min_amount=1000000` - Whale alerts
- `WS /api/v1/ws/{room}` - WebSocket for real-time updates

## Next Steps

1. **Start the frontend** (in a separate terminal):
   ```powershell
   cd flowsight\frontend
   npm run dev
   ```

2. **Check connection status** in the frontend header - it should show "Backend Connected"

3. **View the API documentation** at http://localhost:8000/docs

## Support

For issues or questions:
- Check the logs in the terminal where the backend is running
- Review the API documentation at `/docs`
- Check `BACKEND_FRONTEND_CONNECTION_ANALYSIS.md` for connection troubleshooting

