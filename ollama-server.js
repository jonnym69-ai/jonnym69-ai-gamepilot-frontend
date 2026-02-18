const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = 11434;

// Middleware
app.use(cors());
app.use(express.json());

// Import the Ollama API
const { OllamaApi } = require(path.join(__dirname, 'apps', 'web', 'src', 'services', 'ollamaApi.cjs'));

const ollamaApi = new OllamaApi();

// API Routes
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await ollamaApi.generateResponse(prompt);
    res.json(result);
  } catch (error) {
    console.error('Ollama API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'Ollama API is running',
    endpoints: {
      'POST /api/generate': 'Generate responses using Ollama AI'
    }
  });
});

// Start Ollama server
app.listen(PORT, () => {
  console.log(`🤖 Ollama API server running on port ${PORT}`);
  console.log(`📡 GamePilot can now use: http://localhost:${PORT}/api/generate`);
});

// Auto-start Ollama if not running
spawn('ollama serve', { stdio: 'inherit', detached: true })
  .on('error', (err) => {
    console.error('Failed to start Ollama:', err.message);
  })
  .on('close', (code) => {
    console.log(`Ollama process exited with code ${code}`);
  });
