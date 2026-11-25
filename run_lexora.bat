@echo off
echo ===================================================
echo   Starting LEXORA Legal Intelligence Platform...
echo ===================================================
echo.
echo 1. Starting Backend API on http://127.0.0.1:8000 ...
start "LEXORA Backend API" cmd /k "set PYTHONPATH=backend && .\venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload"

echo 2. Waiting 3 seconds for backend initialization...
timeout /t 3 >nul

echo 3. Starting Frontend Web Application on http://localhost:3000 ...
start "LEXORA Frontend Web App" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo   LEXORA is launching!
echo   Frontend: http://localhost:3000
echo   Backend Docs: http://127.0.0.1:8000/docs
echo ===================================================
