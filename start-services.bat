@echo off
echo Starting GamePilot Services...
echo.
echo Starting Ollama AI Server on port 11435...
start /B node simple-ollama.js
echo.
echo Ollama server started in background
echo.
echo Starting GamePilot Frontend on port 3002...
cd apps\web
start /B npx vite --port 3002 --host
echo.
echo Both services are now running!
echo.
echo Ollama API: http://localhost:11435/api/generate
echo GamePilot: http://localhost:3002
echo.
echo Press Ctrl+C to stop all services
pause
