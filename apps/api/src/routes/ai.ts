import express from 'express';
import { ollamaService } from '../services/ollamaService.js';

const router = express.Router();

/**
 * POST /api/ai/gaming-coach/recommend
 * Get AI-powered gaming coach recommendations
 */
router.post('/recommend', async (req, res) => {
  try {
    const {
      emotionalProfile,
      ownedGames,
      recentGames = [],
      availableTime = 60
    } = req.body;

    if (!emotionalProfile || !ownedGames) {
      return res.status(400).json({
        error: 'Missing required fields: emotionalProfile and ownedGames'
      });
    }

    // Check if Ollama is available
    const health = await ollamaService.isAvailable();
    if (!health) {
      return res.status(503).json({
        error: 'AI service not available',
        fallback: true
      });
    }

    const recommendation = await ollamaService.getGamingCoachRecommendation(
      emotionalProfile,
      ownedGames,
      recentGames,
      availableTime
    );

    if (recommendation) {
      res.json(recommendation);
    } else {
      res.status(404).json({
        error: 'No suitable recommendation found'
      });
    }

  } catch (error) {
    console.error('AI recommendation error:', error);
    res.status(500).json({
      error: 'Failed to get AI recommendation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/ai/gaming-coach/advice
 * Get personalized gaming advice from AI
 */
router.post('/advice', async (req, res) => {
  try {
    const {
      currentMood,
      recentSession,
      goals = [],
      constraints = []
    } = req.body;

    if (!currentMood) {
      return res.status(400).json({
        error: 'Missing required field: currentMood'
      });
    }

    // Check if Ollama is available
    const health = await ollamaService.isAvailable();
    if (!health) {
      return res.status(503).json({
        error: 'AI service not available',
        advice: 'I\'m here to help you make the most of your gaming time. Take it one session at a time.'
      });
    }

    const advice = await ollamaService.getPersonalizedGamingAdvice({
      currentMood,
      recentSession,
      goals,
      constraints
    });

    res.json({ advice });

  } catch (error) {
    console.error('AI advice error:', error);
    res.status(500).json({
      error: 'Failed to get AI advice',
      advice: 'I\'m here to help you make the most of your gaming time. Take it one session at a time.'
    });
  }
});

/**
 * GET /api/ai/health
 * Check AI service health
 */
router.get('/health', async (req, res) => {
  try {
    const isAvailable = await ollamaService.isAvailable();
    const models = await ollamaService.getAvailableModels();

    res.json({
      available: isAvailable,
      models,
      service: 'ollama',
      model: ollamaService.getModel()
    });
  } catch (error) {
    console.error('AI health check error:', error);
    res.status(500).json({
      available: false,
      error: 'Health check failed'
    });
  }
});

export default router;
