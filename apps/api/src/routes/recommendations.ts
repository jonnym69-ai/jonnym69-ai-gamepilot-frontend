import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { RecommendationService } from '../recommendation/recommendationService'
import { personaService } from '../persona/personaService'
import { authenticateToken } from '../identity/identityService'
import { databaseService } from '../services/database'

const router = Router()
const recommendationService = new RecommendationService()

// Request validation schemas
const recommendationRequestSchema = z.object({
  mood: z.string().optional(),
  intent: z.string().optional(),
  maxRecommendations: z.number().min(1).max(50).default(10),
  excludeRecentlyPlayed: z.boolean().default(true),
  timeAvailable: z.number().min(5).max(480).optional(), // 5 mins to 8 hours
  socialContext: z.enum(['solo', 'co-op', 'pvp']).optional()
})

const personaBasedRecommendationSchema = z.object({
  maxRecommendations: z.number().min(1).max(50).default(10),
  context: z.object({
    timeAvailable: z.number().min(5).max(480).optional(),
    socialContext: z.enum(['solo', 'co-op', 'pvp']).optional(),
    intensity: z.enum(['low', 'medium', 'high']).optional(),
    excludeRecentlyPlayed: z.boolean().default(true)
  }).optional()
})

/**
 * GET /recommendations
 * Get personalized recommendations using current persona state
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).authenticatedUser?.id
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication required'
      })
    }

    const validation = personaBasedRecommendationSchema.safeParse(req.query)
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Invalid query parameters',
        details: validation.error.errors
      })
    }

    // Get user's current persona state
    const personaState = await personaService.getPersonaState(userId)
    if (!personaState) {
      return res.status(404).json({
        error: 'Persona not found',
        message: 'User persona not initialized. Please play some games first.'
      })
    }

    // Get user's game library
    const userGames = await databaseService.getUserGames(userId)
    
    // Get persona-driven recommendations
    const recommendations = await recommendationService.getPersonaBasedRecommendations(
      userId,
      personaState,
      userGames,
      validation.data
    )

    return res.status(200).json({
      success: true,
      data: {
        recommendations: recommendations.recommendations,
        personaState: {
          mood: personaState.mood,
          intent: personaState.intent,
          confidence: personaState.confidence
        },
        generatedAt: recommendations.generatedAt,
        totalGames: recommendations.totalGames
      }
    })

  } catch (error) {
    console.error('Error in GET /recommendations:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate recommendations'
    })
  }
})

/**
 * POST /recommendations/mood
 * Get mood-based recommendations with optional mood override
 */
router.post('/mood', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).authenticatedUser?.id
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication required'
      })
    }

    const validation = recommendationRequestSchema.safeParse(req.body)
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Invalid request body',
        details: validation.error.errors
      })
    }

    const { mood, maxRecommendations, excludeRecentlyPlayed, timeAvailable, socialContext } = validation.data

    // Get user's game library
    const userGames = await databaseService.getUserGames(userId)
    
    // Get mood-based recommendations
    // Create a simple mock forecast result for the mood
    const mockForecastResult: any = {
      primaryForecast: {
        predictedMood: mood || 'chill',
        confidence: 0.8,
        reasoning: `User requested ${mood || 'chill'} mood recommendations`
      },
      alternativeForecasts: [],
      forecastAccuracy: {
        historicalAccuracy: 0.75,
        confidenceInterval: 0.1
      },
      dataQuality: {
        completeness: 0.8,
        freshness: 0.9,
        reliability: 0.85
      },
      generatedAt: new Date()
    };

    const recommendations = await recommendationService.getMoodBasedRecommendations(
      userId,
      mockForecastResult,
      userGames,
      maxRecommendations
    )

    return res.status(200).json({
      success: true,
      data: recommendations
    })

  } catch (error) {
    console.error('Error in POST /recommendations/mood:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate mood-based recommendations'
    })
  }
})

/**
 * GET /recommendations/persona
 * Get current persona state and recommendation context
 */
router.get('/persona', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).authenticatedUser?.id
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication required'
      })
    }

    const personaState = await personaService.getPersonaState(userId)
    if (!personaState) {
      return res.status(404).json({
        error: 'Persona not found',
        message: 'User persona not initialized'
      })
    }

    return res.status(200).json({
      success: true,
      data: {
        mood: personaState.mood,
        intent: personaState.intent,
        confidence: personaState.confidence,
        archetype: personaState.archetype,
        genreAffinities: personaState.genreAffinities,
        sessionLengthPreference: personaState.sessionLengthPreference
      }
    })

  } catch (error) {
    console.error('Error in GET /recommendations/persona:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve persona state'
    })
  }
})

export default router
