@echo off
echo Starting GamePilot Services...

REM Start Ollama server
node simple-ollama.js

REM Start GamePilot frontend  
npm run dev

echo Both services are now running!
echo Ollama API: http://localhost:11435/api/generate
echo GamePilot: http://localhost:3002
pause
