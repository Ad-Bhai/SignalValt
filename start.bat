@echo off
echo =====================================================================
echo  🛰️  SIGNALVAULT - Real-Time Data Reliability Platform
echo =====================================================================
echo.

cd /d "%~dp0"

echo Starting FastAPI Backend on http://localhost:8000 ...
start "SignalVault Backend" cmd /k ".\venv\Scripts\activate.bat && set PYTHONPATH=. && python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

echo Starting Vite React Dashboard on http://localhost:5173 ...
start "SignalVault Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo =====================================================================
echo  Platform services launching!
echo  - API and WebSockets: http://localhost:8000
echo  - Interactive Dashboard: http://localhost:5173
echo  - API Documentation (Swagger): http://localhost:8000/docs
echo =====================================================================
