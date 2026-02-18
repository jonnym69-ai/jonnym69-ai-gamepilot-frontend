import { Router } from 'express'
import { z } from 'zod'
import { authenticateToken } from '../identity/identityService'
import { databaseService } from '../services/database'
import { MoodPersonaService } from '../services/moodPersonaService'
import { SimpleMoodPersonaService } from '../services/simpleMoodPersonaService'
import { MoodPersonaIntegration, type UserAction } from '@gamepilot/identity-engine'
import { ObservabilityService } from '../services/observabilityService'
import type { EnhancedMoodId } from '@gamepilot/static-data'
import type { MoodSuggestionContext } from '@gamepilot/identity-engine'

const router = Router()
const moodPersonaService = new MoodPersonaService((databaseService as any).db)
const simpleMoodPersonaService = new SimpleMoodPersonaService()
const moodPersonaIntegration = new MoodPersonaIntegration()
const observabilityService = new ObservabilityService((databaseService as any).db)

// Validation schemas
const MoodSelectionSchema = z.object({
  primaryMood: z.string(),
  secondaryMood: z.string().optional(),
  intensity: z.number().min(0).max(1),
  sessionId: z.string().optional(),
  context: z.object({
    timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']),
    dayOfWeek: z.number().min(0).max(6),
    trigger: z.enum(['manual', 'suggested', 'auto']),
    previousMood: z.string().optional(),
    sessionLength: z.number().optional()
  }),
  outcomes: z.object({
    gamesRecommended: z.number(),
    gamesLaunched: z.number(),
    averageSessionDuration: z.number().optional(),
    userRating: z.number().min(1).max(5).optional(),
    ignoredRecommendations: z.number()
  })
})

const UserActionSchema = z.object({
  type: z.enum(['launch', 'ignore', 'rate', 'switch_mood', 'session_complete']),
  gameId: z.string().optional(),
  gameTitle: z.string().optional(),
  moodContext: z.object({
    primaryMood: z.string(),
    secondaryMood: z.string().optional()
  }).optional(),
  sessionId: z.string().optional(),
  metadata: z.object({
    sessionDuration: z.number().optional(),
    rating: z.number().min(1).max(5).optional(),
    reason: z.string().optional(),
    previousMood: z.string().optional()
  })
})

const RecommendationEventSchema = z.object({
  moodContext: z.object({
    primaryMood: z.string(),
    secondaryMood: z.string().optional(),
    intensity: z.number()
  }),
  recommendedGames: z.array(z.object({
    gameId: z.string(),
    name: z.string(),
    score: z.number(),
    reasoning: z.array(z.string())
  })),
  clickedGameId: z.string().optional(),
  successFlag: z.boolean().optional(),
  sessionId: z.string().optional(),
  metadata: z.record(z.any()).optional()
})

const MoodPredictionSchema = z.object({
  predictedMood: z.string(),
  confidence: z.number().min(0).max(1),
  reasoning: z.array(z.string()),
  contextualFactors: z.array(z.string()),
  successProbability: z.number().min(0).max(1),
  sessionId: z.string().optional()
})

/**
 * POST /api/mood/selection
 * Log a mood selection event
 */
router.post('/selection', authenticateToken, async (req, res) => {
  const startTime = Date.now()
  const userId = (req as any).authenticatedUser.id
  
  try {
    const validatedData = MoodSelectionSchema.parse(req.body)

    // Create mood selection record
    const moodSelection = await moodPersonaService.createMoodSelection({
      userId,
      primaryMood: validatedData.primaryMood as EnhancedMoodId,
      secondaryMood: validatedData.secondaryMood as EnhancedMoodId,
      intensity: validatedData.intensity,
      sessionId: validatedData.sessionId,
      timestamp: new Date(),
      context: validatedData.context,
      outcomes: validatedData.outcomes
    })

    // Process with persona integration
    const enhancedIdentity = await moodPersonaIntegration.processMoodSelection(userId, moodSelection)

    // Update persona profile
    const existingProfile = await moodPersonaService.getPersonaProfile(userId)
    if (existingProfile) {
      await moodPersonaService.updatePersonaProfile(userId, {
        genreWeights: enhancedIdentity.dynamicMoodWeights[moodSelection.primaryMood]?.genreWeights || existingProfile.genreWeights,
        tagWeights: enhancedIdentity.dynamicMoodWeights[moodSelection.primaryMood]?.tagWeights || existingProfile.tagWeights,
        moodAffinity: enhancedIdentity.dynamicMoodWeights[moodSelection.primaryMood] ? {
          ...existingProfile.moodAffinity,
          [moodSelection.primaryMood]: enhancedIdentity.dynamicMoodWeights[moodSelection.primaryMood].confidence
        } : existingProfile.moodAffinity,
        confidence: enhancedIdentity.dynamicMoodWeights[moodSelection.primaryMood]?.confidence || existingProfile.confidence,
        sampleSize: enhancedIdentity.dynamicMoodWeights[moodSelection.primaryMood]?.sampleSize || existingProfile.sampleSize
      })
    }

    const duration = Date.now() - startTime
    await observabilityService.logPerformance('mood_selection', duration, true, userId, {
      primaryMood: validatedData.primaryMood,
      hasSecondaryMood: !!validatedData.secondaryMood,
      intensity: validatedData.intensity
    })

    res.json({
      success: true,
      data: {
        moodSelection,
        personaUpdated: !!existingProfile
      }
    })

  } catch (error) {
    const duration = Date.now() - startTime
    await observabilityService.logPerformance('mood_selection', duration, false, userId)
    await observabilityService.logError('mood_selection', error as Error, userId, {
      body: req.body
    })
    
    console.error('❌ Failed to log mood selection:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to log mood selection'
    })
  }
})

/**
 * GET /api/mood/selections
 * Get mood selection history for user
 */
router.get('/selections', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).authenticatedUser.id
    const limit = parseInt(req.query.limit as string) || 50

    const selections = await moodPersonaService.getMoodSelections(userId, limit)

    res.json({
      success: true,
      data: selections
    })
  } catch (error) {
    console.error('Error getting mood selections:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get mood selections'
    })
  }
})

/**
 * POST /api/mood/action
 * Log a user action for learning
 */
router.post('/action', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).authenticatedUser.id
    const validatedData = UserActionSchema.parse(req.body)

    // Create user action record
    const userAction = await moodPersonaService.createUserAction({
      userId,
      type: validatedData.type,
      gameId: validatedData.gameId,
      gameTitle: validatedData.gameTitle,
      moodContext: validatedData.moodContext,
      timestamp: new Date(),
      sessionId: validatedData.sessionId,
      metadata: validatedData.metadata
    }) as UserAction

    // Learn from user action
    await moodPersonaIntegration.learnFromUserAction(userId, userAction)

    res.json({
      success: true,
      data: userAction
    })
  } catch (error) {
    console.error('Error logging user action:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to log user action'
    })
  }
})

/**
 * GET /api/mood/actions
 * Get user action history
 */
router.get('/actions', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).authenticatedUser.id
    const limit = parseInt(req.query.limit as string) || 100
    const type = req.query.type as string

    const actions = type 
      ? await moodPersonaService.getUserActionsByType(userId, type as any, limit)
      : await moodPersonaService.getUserActions(userId, limit)

    res.json({
      success: true,
      data: actions
    })
  } catch (error) {
    console.error('Error getting user actions:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get user actions'
    })
  }
})

/**
 * POST /api/mood/recommendation
 * Log a recommendation event
 */
router.post('/recommendation', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).authenticatedUser.id
    const validatedData = RecommendationEventSchema.parse(req.body)

    const recommendationEvent = await moodPersonaService.createRecommendationEvent({
      userId,
      moodContext: validatedData.moodContext,
      recommendedGames: validatedData.recommendedGames,
      clickedGameId: validatedData.clickedGameId,
      successFlag: validatedData.successFlag,
      timestamp: new Date(),
      sessionId: validatedData.sessionId,
      metadata: validatedData.metadata
    })

    res.json({
      success: true,
      data: recommendationEvent
    })
  } catch (error) {
    console.error('Error logging recommendation event:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to log recommendation event'
    })
  }
})

/**
 * GET /api/mood/recommendations
 * Get recommendation history
 */
router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).authenticatedUser.id
    const limit = parseInt(req.query.limit as string) || 50

    const recommendations = await moodPersonaService.getRecommendationEvents(userId, limit)

    res.json({
      success: true,
      data: recommendations
    })
  } catch (error) {
    console.error('Error getting recommendations:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get recommendations'
    })
  }
})

/**
 * POST /api/mood/prediction
 * Log a mood prediction
 */
router.post('/prediction', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).authenticatedUser.id
    const validatedData = MoodPredictionSchema.parse(req.body)

    const moodPrediction = await moodPersonaService.createMoodPrediction({
      userId,
      predictedMood: validatedData.predictedMood as EnhancedMoodId,
      confidence: validatedData.confidence,
      reasoning: validatedData.reasoning,
      contextualFactors: validatedData.contextualFactors,
      successProbability: validatedData.successProbability,
      timestamp: new Date(),
      sessionId: validatedData.sessionId
    })

    res.json({
      success: true,
      data: moodPrediction
    })
  } catch (error) {
    console.error('Error logging mood prediction:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to log mood prediction'
    })
  }
})

/**

/**
 * GET /api/mood/predictions
 * Get mood prediction history
 */
router.get('/predictions', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).authenticatedUser.id
    const limit = parseInt(req.query.limit as string) || 50

    const predictions = await moodPersonaService.getMoodPredictions(userId, limit)

    res.json({
      success: true,
      data: predictions
    })
  } catch (error) {
    console.error('Error getting mood predictions:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get mood predictions'
    })
  }
})

/**
 * GET /api/mood/persona
 * Get user's persona profile
 */
router.get('/persona', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).authenticatedUser.id

    let profile = await moodPersonaService.getPersonaProfile(userId)
    
    // Create default profile if none exists
    if (!profile) {
      profile = await moodPersonaService.createPersonaProfile({
        userId,
        genreWeights: {},
        tagWeights: {},
        moodAffinity: {},
        sessionPatterns: {
          dailyRhythms: {},
          weeklyPatterns: {},
          contextualTriggers: {}
        },
        hybridSuccess: {},
        platformBiases: {},
        timePreferences: {
          morning: 0.5,
          afternoon: 0.5,
          evening: 0.5,
          night: 0.5
        },
        confidence: 0.1,
        sampleSize: 0,
        version: '2.0.0',
        lastUpdated: new Date()
      })
    }

    res.json({
      success: true,
      data: profile
    })
  } catch (error) {
    console.error('Error getting persona profile:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get persona profile'
    })
  }
})

/**
 * PUT /api/mood/persona
 * Update user's persona profile
 */
router.put('/persona', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).authenticatedUser.id
    const updates = req.body

    const profile = await moodPersonaService.updatePersonaProfile(userId, updates)

    res.json({
      success: true,
      data: profile
    })
  } catch (error) {
    console.error('Error updating persona profile:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update persona profile'
    })
  }
})

/**
 * GET /api/mood/patterns
 * Get mood patterns for user
 */
router.get('/patterns', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).authenticatedUser.id
    const patternType = req.query.type as string

    const patterns = await moodPersonaService.getMoodPatterns(userId, patternType as any)

    res.json({
      success: true,
      data: patterns
    })
  } catch (error) {
    console.error('Error getting mood patterns:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get mood patterns'
    })
  }
})

/**
 * GET /api/mood/analytics
 * Get mood analytics and metrics
 */
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).authenticatedUser.id
    const days = parseInt(req.query.days as string) || 30

    const [moodStats, recommendationSuccess, predictionAccuracy] = await Promise.all([
      moodPersonaService.getMoodSelectionStats(userId, days),
      moodPersonaService.getRecommendationSuccessRate(userId, days),
      moodPersonaService.getMoodPredictionAccuracy(userId, days)
    ])

    res.json({
      success: true,
      data: {
        moodStats,
        recommendationSuccess,
        predictionAccuracy,
        period: `${days} days`
      }
    })
  } catch (error) {
    console.error('Error getting mood analytics:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get mood analytics'
    })
  }
})

export default router
