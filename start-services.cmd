@echo off
echo Starting GamePilot Services...

REM Start Ollama server
start /B node simple-ollama.js

REM Wait for Ollama to start
timeout /t 3 >nul

REM Start GamePilot frontend  
start /B npm run dev

REM Both services running
echo Ollama API: http://localhost:11435/api/generate
echo GamePilot: http://localhost:3002
echo.
echo Press Ctrl+C to stop all services
pause
