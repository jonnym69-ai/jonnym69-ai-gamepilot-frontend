const { spawn } = require('child_process');
const path = require('path');

console.log('Starting GamePilot Services...');

// Start Ollama server
const ollamaProcess = spawn('node', ['simple-ollama.js'], {
  stdio: 'inherit',
  detached: true
});

ollamaProcess.on('error', (err) => {
  console.error('Failed to start Ollama:', err.message);
});

ollamaProcess.on('close', (code) => {
  console.log(`Ollama process exited with code ${code}`);
});

// Wait a moment for Ollama to start
setTimeout(() => {
  console.log('Ollama server started in background');
  
  // Start GamePilot frontend
  const gamepilotProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    detached: true
  });

  gamepilotProcess.on('error', (err) => {
    console.error('Failed to start GamePilot:', err.message);
  });

  console.log('Both services are now running!');
  console.log('Ollama API: http://localhost:11435/api/generate');
  console.log('GamePilot: http://localhost:3002');
  console.log('Press Ctrl+C to stop all services');
}, 3000);
