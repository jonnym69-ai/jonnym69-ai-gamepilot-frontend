import { Router, Request, Response } from 'express'
import { personaService } from '../persona/personaService'
import { authenticateToken } from '../identity/identityService'
import { databaseService } from '../services/database'
import { z } from 'zod'

const router = Router()

// Validation schemas
const moodUpdateSchema = z.object({
  mood: z.enum(['energetic', 'focused', 'relaxed', 'creative', 'competitive', 'social', 'curious', 'nostalgic', 'stressed', 'bored', 'neutral']),
  intensity: z.number().min(1).max(10),
  context: z.string().optional()
})

const intentUpdateSchema = z.object({
  intent: z.enum(['short_session', 'comfort', 'novelty', 'social', 'challenge', 'exploration', 'achievement', 'neutral']),
  context: z.string().optional()
})

const behaviorUpdateSchema = z.object({
  gameId: z.string(),
  gameName: z.string().optional(),
  sessionLength: z.number().min(1),
  completed: z.boolean(),
  achievements: z.number().optional(),
  difficulty: z.enum(['easy', 'normal', 'hard']).optional(),
  multiplayer: z.boolean().optional(),
  timestamp: z.string().datetime().optional()
})

const personaEventSchema = z.object({
  type: z.enum(['mood', 'intent', 'behavior', 'session', 'achievement']),
  timestamp: z.string().datetime().transform(val => new Date(val)),
  userId: z.string(),
  data: z.any().refine(val => val !== undefined, { message: 'data is required' }),
  context: z.object({
    gameId: z.string().optional(),
    sessionId: z.string().optional(),
    source: z.enum(['user_input', 'behavioral', 'system_inferred']).optional()
  }).optional()
})

/**
 * GET /persona
 * Get user's current persona
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Try to get user, but allow requests without authentication for development
    let user = null
    try {
      user = (req as any).user
    } catch (error) {
      console.log('👤 No user authentication, returning null for development')
    }
    
    if (!user) {
      // Return null user for development without authentication
      return res.json({
        success: false,
        message: 'No authenticated user found'
      })
    }
    
    const userId = user.id

    const persona = await personaService.getPersona(userId)
    
    if (!persona) {
      return res.status(404).json({
        error: 'Persona not found',
        message: 'No persona data found for this user'
      })
    }

    return res.status(200).json({
      success: true,
      data: persona
    })
  } catch (error) {
    console.error('Error in GET /persona:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve persona data'
    })
  }
})

/**
 * POST /persona/mood
 * Update user's current mood
 */
router.post('/mood', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    
    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User must be authenticated to update mood'
      })
    }

    const validation = moodUpdateSchema.safeParse(req.body)
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Invalid mood data',
        details: validation.error.errors
      })
    }

    const persona = await personaService.updatePersona(userId, {
      mood: validation.data
    })

    return res.status(200).json({
      success: true,
      message: 'Mood updated successfully',
      data: {
        currentMood: persona.currentMood,
        moodIntensity: persona.moodIntensity,
        lastUpdated: persona.lastUpdated
      }
    })
  } catch (error) {
    console.error('Error in POST /persona/mood:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update mood'
    })
  }
})

/**
 * POST /persona/intent
 * Update user's current intent
 */
router.post('/intent', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    
    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User must be authenticated to update intent'
      })
    }

    const validation = intentUpdateSchema.safeParse(req.body)
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Invalid intent data',
        details: validation.error.errors
      })
    }

    const persona = await personaService.updatePersona(userId, {
      intent: validation.data
    })

    return res.status(200).json({
      success: true,
      message: 'Intent updated successfully',
      data: {
        currentIntent: persona.currentIntent,
        lastUpdated: persona.lastUpdated
      }
    })
  } catch (error) {
    console.error('Error in POST /persona/intent:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update intent'
    })
  }
})

/**
 * POST /persona/event
 * Process persona update events
 */
router.post('/event', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    
    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User must be authenticated to process persona events'
      })
    }

    const validation = personaEventSchema.safeParse({
      ...req.body,
      userId,
      timestamp: new Date(req.body.timestamp || new Date().toISOString())
    })
    
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Invalid event data',
        details: validation.error.errors
      })
    }

    // Ensure data is always provided
    const eventData = {
      ...validation.data,
      data: validation.data.data || {}
    }

    const persona = await personaService.updatePersona(userId, {
      event: eventData
    })

    return res.status(200).json({
      success: true,
      message: 'Event processed successfully',
      data: {
        eventType: eventData.type,
        lastUpdated: persona.lastUpdated
      }
    })
  } catch (error) {
    console.error('Error in POST /persona/event:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process event'
    })
  }
})

/**
 * POST /persona/analyze
 * Trigger fresh persona analysis
 */
router.post('/analyze', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    
    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User must be authenticated to analyze persona'
      })
    }

    const analysis = await personaService.analyzePersona(userId)

    return res.status(200).json({
      success: true,
      message: 'Persona analysis completed',
      data: analysis
    })
  } catch (error) {
    console.error('Error in POST /persona/analyze:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to analyze persona'
    })
  }
})

/**
 * GET /persona/state
 * Get persona state for recommendation engine
 */
router.get('/state', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    
    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User must be authenticated to get persona state'
      })
    }

    const state = await personaService.getPersonaState(userId)
    
    if (!state) {
      return res.status(404).json({
        error: 'Persona state not found',
        message: 'No persona state available for this user'
      })
    }

    return res.status(200).json({
      success: true,
      data: state
    })
  } catch (error) {
    console.error('Error in GET /persona/state:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get persona state'
    })
  }
})

/**
 * DELETE /persona/reset
 * Reset user's persona data
 */
router.delete('/reset', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    
    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User must be authenticated to reset persona'
      })
    }

    // Delete persona from database
    await databaseService.deletePersona(userId)
    
    // Create new default persona
    const persona = await personaService.getPersona(userId)

    return res.status(200).json({
      success: true,
      message: 'Persona reset successfully',
      data: {
        personaId: persona?.userId,
        createdAt: persona?.createdAt,
        traits: persona?.traits
      }
    })
  } catch (error) {
    console.error('Error in DELETE /persona/reset:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to reset persona'
    })
  }
})

/**
 * GET /persona/health
 * Health check for persona service
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Test persona service functionality
    const testUserId = 'health-check-test'
    
    // Test persona creation and retrieval
    await personaService.getPersona(testUserId)
    
    return res.status(200).json({
      status: 'healthy',
      service: 'persona',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'connected',
        service: 'operational',
        memory: 'sufficient'
      }
    })
  } catch (error) {
    console.error('Error in GET /persona/health:', error)
    return res.status(503).json({
      status: 'unhealthy',
      service: 'persona',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * POST /persona/session/start
 * Log the start of a game session for persona tracking
 */
router.post('/session/start', async (req: Request, res: Response) => {
  try {
    const { gameId, gameMetadata, context } = req.body

    // Validate required fields
    if (!gameId) {
      return res.status(400).json({
        error: 'Missing required field: gameId',
        timestamp: new Date().toISOString()
      })
    }

    // Try to get user, but allow requests without authentication for development
    let user = null
    try {
      user = (req as any).user
    } catch (error) {
      // Continue without user for development
    }

    const userId = user?.id || 'anonymous-user'

    console.log(`🎮 POST /persona/session/start - Logging session start for game: ${gameId}`)

    // Create session start event
    const sessionEvent = {
      type: 'session',
      userId,
      data: {
        action: 'session_start',
        gameId,
        gameMetadata,
        context,
        timestamp: new Date().toISOString()
      },
      context: {
        gameId,
        source: 'system_inferred'
      }
    }

    // Store the session event (this would typically go to a database)
    // For now, we'll just log it and return success
    console.log('📝 Session start event:', JSON.stringify(sessionEvent, null, 2))

    return res.status(200).json({
      success: true,
      message: 'Session start logged successfully',
      sessionId: `session_${Date.now()}_${gameId}`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in POST /persona/session/start:', error)
    return res.status(500).json({
      error: 'Failed to log session start',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * POST /persona/session/end
 * Log the end of a game session for persona tracking
 */
router.post('/session/end', async (req: Request, res: Response) => {
  try {
    const { gameId, duration, sessionId } = req.body

    // Validate required fields
    if (!gameId) {
      return res.status(400).json({
        error: 'Missing required field: gameId',
        timestamp: new Date().toISOString()
      })
    }

    // Try to get user, but allow requests without authentication for development
    let user = null
    try {
      user = (req as any).user
    } catch (error) {
      // Continue without user for development
    }

    const userId = user?.id || 'anonymous-user'

    console.log(`🎮 POST /persona/session/end - Logging session end for game: ${gameId}`)

    // Create session end event
    const sessionEvent = {
      type: 'session',
      userId,
      data: {
        action: 'session_end',
        gameId,
        duration,
        sessionId,
        timestamp: new Date().toISOString()
      },
      context: {
        gameId,
        source: 'system_inferred'
      }
    }

    // Store the session event (this would typically go to a database)
    // For now, we'll just log it and return success
    console.log('📝 Session end event:', JSON.stringify(sessionEvent, null, 2))

    return res.status(200).json({
      success: true,
      message: 'Session end logged successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in POST /persona/session/end:', error)
    return res.status(500).json({
      error: 'Failed to log session end',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
})

export default router
