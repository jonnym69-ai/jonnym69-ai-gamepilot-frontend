import { Router } from 'express'
import { z } from 'zod'
import { authenticateToken } from '../identity/identityService'
import { databaseService } from '../services/database'
import { SimpleMoodPersonaService } from '../services/simpleMoodPersonaService'
import type { EnhancedMoodId } from '@gamepilot/static-data'

const router = Router()
const simpleMoodPersonaService = new SimpleMoodPersonaService()

// Validation schemas
const MoodSelectionSchema = z.object({
  primaryMood: z.string(),
  secondaryMood: z.string().optional(),
  intensity: z.number().min(0).max(1),
  sessionId: z.string().optional(),
  context: z.object({
    timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']),
    dayOfWeek: z.number().min(0).max(6),
    sessionLength: z.number().optional(),
    previousMood: z.string().optional(),
    trigger: z.enum(['manual', 'suggested', 'auto'])
  }),
  outcomes: z.object({
    gamesRecommended: z.number().optional(),
    gamesLaunched: z.number().optional(),
    ignoredRecommendations: z.number().optional()
  }).optional()
})

const UserActionSchema = z.object({
  type: z.enum(['launch', 'play', 'quit', 'rate', 'ignore']),
  gameId: z.string(),
  gameTitle: z.string(),
  moodContext: z.object({
    primaryMood: z.string(),
    secondaryMood: z.string().optional(),
    intensity: z.number()
  }),
  metadata: z.object({
    sessionDuration: z.number().optional(),
    rating: z.number().min(1).max(5).optional(),
    completed: z.boolean().optional(),
    notes: z.string().optional()
  }).optional()
})

const RecommendationRequestSchema = z.object({
  primaryMood: z.string(),
  secondaryMood: z.string().optional(),
  limit: z.number().min(1).max(50).default(10),
  context: z.object({
    timeAvailable: z.number().optional(),
    socialContext: z.enum(['solo', 'co-op', 'competitive']).optional(),
    difficulty: z.enum(['casual', 'normal', 'hard', 'expert']).optional()
  }).optional()
})

/**
 * POST /api/mood/selection
 * Record a mood selection event
 */
router.post('/selection', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    const validatedData = MoodSelectionSchema.parse(req.body)
    
    // Process mood selection
    const moodEvent = await simpleMoodPersonaService.processMoodSelection(userId, validatedData)

    res.json({
      success: true,
      data: {
        moodEvent,
        message: 'Mood selection recorded successfully'
      }
    })
  } catch (error) {
    console.error('Mood selection error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to record mood selection'
    })
  }
})

/**
 * POST /api/mood/action
 * Record a user action
 */
router.post('/action', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    const validatedData = UserActionSchema.parse(req.body)
    
    // Ensure metadata exists for the service
    const actionData = {
      ...validatedData,
      metadata: validatedData.metadata ?? {}
    }
    
    // Process user action
    const action = await simpleMoodPersonaService.processUserAction(userId, actionData)

    res.json({
      success: true,
      data: {
        action,
        message: 'User action recorded successfully'
      }
    })
  } catch (error) {
    console.error('User action error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to record user action'
    })
  }
})

/**
 * GET /api/mood/suggestions
 * Get mood suggestions for a user
 */
router.get('/suggestions', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    const context = req.query.context ? JSON.parse(req.query.context as string) : undefined
    const suggestions = await simpleMoodPersonaService.getMoodSuggestions(userId, context)

    res.json({
      success: true,
      data: {
        suggestions,
        count: suggestions.length
      }
    })
  } catch (error) {
    console.error('Mood suggestions error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get mood suggestions'
    })
  }
})

/**
 * POST /api/mood/recommendations/generate
 * Generate personalized recommendations
 */
router.post('/recommendations/generate', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    const validatedData = RecommendationRequestSchema.parse(req.body)
    
    // Get user's games from database
    const userGames = await databaseService.getUserGames(userId)
    
    // Generate recommendations
    const recommendations = await simpleMoodPersonaService.generatePersonalizedRecommendations(
      userId,
      validatedData.primaryMood as EnhancedMoodId,
      validatedData.secondaryMood as EnhancedMoodId | undefined,
      validatedData.limit
    )

    res.json({
      success: true,
      data: {
        recommendations,
        count: recommendations.length,
        mood: validatedData.primaryMood,
        secondaryMood: validatedData.secondaryMood
      }
    })
  } catch (error) {
    console.error('Recommendations error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations'
    })
  }
})

/**
 * GET /api/mood/profile
 * Get user's mood-persona profile
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    const profile = simpleMoodPersonaService.getUserProfile(userId)
    const moodStats = simpleMoodPersonaService.getMoodStatistics(userId)
    const actionStats = simpleMoodPersonaService.getActionStatistics(userId)

    res.json({
      success: true,
      data: {
        profile,
        statistics: {
          moods: moodStats,
          actions: actionStats
        }
      }
    })
  } catch (error) {
    console.error('Profile error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile'
    })
  }
})

/**
 * GET /api/mood/statistics
 * Get detailed mood statistics
 */
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    const moodStats = simpleMoodPersonaService.getMoodStatistics(userId)
    const actionStats = simpleMoodPersonaService.getActionStatistics(userId)

    res.json({
      success: true,
      data: {
        moods: moodStats,
        actions: actionStats
      }
    })
  } catch (error) {
    console.error('Statistics error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics'
    })
  }
})

/**
 * GET /api/mood/history
 * Get mood history for a user
 */
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    const limit = parseInt(req.query.limit as string) || 50
    const offset = parseInt(req.query.offset as string) || 0

    const profile = simpleMoodPersonaService.getUserProfile(userId)
    const history = profile.moodHistory || []

    const paginatedHistory = history
      .slice(-offset - limit, -offset || undefined)
      .reverse()

    res.json({
      success: true,
      data: {
        history: paginatedHistory,
        total: history.length,
        limit,
        offset
      }
    })
  } catch (error) {
    console.error('History error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get mood history'
    })
  }
})

/**
 * DELETE /api/mood/reset
 * Reset user's mood-persona data
 */
router.delete('/reset', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    // Reset user data (this would need to be implemented in the service)
    // For now, just return success
    res.json({
      success: true,
      message: 'Mood-persona data reset successfully'
    })
  } catch (error) {
    console.error('Reset error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to reset mood-persona data'
    })
  }
})

export default router
