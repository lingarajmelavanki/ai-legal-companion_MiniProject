Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Starting LEXORA Legal Intelligence Platform...  " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan

$env:PYTHONPATH = "backend"

# Start Backend
Write-Host "`n1. Launching Backend API on http://127.0.0.1:8000 ..." -ForegroundColor Yellow
$backendProc = Start-Process -FilePath ".\venv\Scripts\uvicorn.exe" -ArgumentList "app.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload" -PassThru

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "2. Launching Frontend Web App on http://localhost:3000 ..." -ForegroundColor Yellow
$frontendProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd frontend && npm run dev" -PassThru

Write-Host "`nLEXORA successfully started!" -ForegroundColor Green
Write-Host "  Frontend:     http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend Docs: http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host "`nPress any key to stop both services..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Stop-Process -Id $backendProc.Id -Force -ErrorAction SilentlyContinue
Stop-Process -Id $frontendProc.Id -Force -ErrorAction SilentlyContinue
Write-Host "Services stopped cleanly." -ForegroundColor Red
