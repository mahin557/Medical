@echo off
echo.
echo  MedDx - Clinical Diagnosis Assistant (Local / Free)
echo ======================================================
echo  Powered by Ollama + llama3.1:8b  --  No API costs
echo.

REM Check Ollama installed
where ollama >nul 2>&1
if errorlevel 1 (
    echo [!] Ollama not installed.
    echo     Download from: https://ollama.com
    echo     Install it, then re-run this script.
    pause
    start https://ollama.com
    exit /b
)

REM Pull model if not present
echo [1] Checking model llama3.1:8b ...
ollama list | findstr "llama3.1" >nul 2>&1
if errorlevel 1 (
    echo [!] Downloading llama3.1:8b (~4.7 GB, one-time only)...
    ollama pull llama3.1:8b
)

REM Start Ollama in background
echo [2] Starting Ollama...
start /b ollama serve >nul 2>&1

REM Install backend deps
echo [3] Installing backend dependencies...
cd backend
pip install -r requirements.txt -q
cd ..

REM Start backend
echo [4] Starting backend (port 8000)...
start "MedDx Backend" cmd /k "cd backend && uvicorn main:app --reload --port 8000"

timeout /t 3 /nobreak >nul

REM Install and start frontend
echo [5] Starting frontend (port 5173)...
start "MedDx Frontend" cmd /k "cd frontend && npm install --silent && npm run dev"

echo.
echo  Done! Opening browser in 5 seconds...
echo  App:     http://localhost:5173
echo  API:     http://localhost:8000
echo  Health:  http://localhost:8000/health
echo.
timeout /t 5 /nobreak >nul
start http://localhost:5173
