const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 11435;

// Middleware
app.use(cors());
app.use(express.json());

// Simple Ollama API
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Mock Ollama response for now
    const mockResponse = {
      mood: prompt.includes('relaxed') ? 'relaxed' : 'intense',
      energyLevel: 'medium',
      playStyle: 'casual',
      sessionLength: 'medium',
      socialPreference: 'solo',
      complexityPreference: 'moderate'
    };

    // Mock recommendations based on mood
    let recommendations = [];
    
    if (prompt.includes('relaxed')) {
      recommendations = [
        { gameTitle: 'Stardew Valley', reason: 'Perfect relaxing farming game', confidence: 0.9, moodFit: 0.95, energyFit: 0.8 },
        { gameTitle: 'Animal Crossing', reason: 'Peaceful social simulation', confidence: 0.85, moodFit: 0.9, energyFit: 0.7 },
        { gameTitle: 'Minecraft', reason: 'Creative building game', confidence: 0.8, moodFit: 0.8, energyFit: 0.6 }
      ];
    } else if (prompt.includes('intense')) {
      recommendations = [
        { gameTitle: 'DOOM Eternal', reason: 'Fast-paced action game', confidence: 0.95, moodFit: 0.9, energyFit: 0.9 },
        { gameTitle: 'Call of Duty', reason: 'Competitive shooter', confidence: 0.9, moodFit: 0.85, energyFit: 0.8 },
        { gameTitle: 'Dark Souls', reason: 'Challenging action game', confidence: 0.9, moodFit: 0.8, energyFit: 0.9 }
      ];
    } else {
      recommendations = [
        { gameTitle: 'Portal 2', reason: 'Puzzle-solving adventure', confidence: 0.8, moodFit: 0.7, energyFit: 0.7 }
      ];
    }

    res.json(recommendations);
  } catch (error) {
    console.error('Ollama API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'Simple Ollama API is running',
    endpoints: {
      'POST /api/generate': 'Generate game recommendations based on mood'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🤖 Simple Ollama API server running on port ${PORT}`);
  console.log(`📡 GamePilot can now use: http://localhost:${PORT}/api/generate`);
});

// Auto-start Ollama if not running
const { spawn } = require('child_process');
spawn('ollama serve', { stdio: 'inherit', detached: true })
  .on('error', (err) => {
    console.error('Failed to start Ollama:', err.message);
  })
  .on('close', (code) => {
    console.log(`Ollama process exited with code ${code}`);
  });
