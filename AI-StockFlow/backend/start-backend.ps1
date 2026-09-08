# start-backend.ps1
# Run this script to start the AI StockFlow backend
# Usage: .\start-backend.ps1

$env:DATABASE_URL = "sqlite:///./stockflow_demo.db"
$env:JWT_SECRET = "demo-secret-key-32-chars-minimum-x"
$env:AUTO_CREATE_SCHEMA = "true"
$env:SEED_DEMO_DATA = "true"
$env:REDIS_URL = "redis://localhost:6379/0"

Write-Host "Starting AI StockFlow Backend..." -ForegroundColor Green
Write-Host "API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""

py -3.12 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
