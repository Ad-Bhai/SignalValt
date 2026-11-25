Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host " 🛰️  SIGNALVAULT - Real-Time Data Reliability Platform" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = $PSScriptRoot

Write-Host "Starting FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootPath'; `$env:PYTHONPATH='.'; .\venv\Scripts\Activate.ps1; python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

Write-Host "Starting Vite React Dashboard on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootPath\frontend'; npm run dev"

Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Green
Write-Host " Platform running!" -ForegroundColor Green
Write-Host " - Web UI:       http://localhost:5173" -ForegroundColor White
Write-Host " - REST API:     http://localhost:8000" -ForegroundColor White
Write-Host " - Swagger Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "=====================================================================" -ForegroundColor Green
