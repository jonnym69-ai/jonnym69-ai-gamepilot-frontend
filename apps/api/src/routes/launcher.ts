import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { databaseService } from '../services/database'
import { authenticateToken, getCurrentUser } from '../auth/authService'
import { PlatformCode } from '@gamepilot/shared'
import { PLATFORMS } from '@gamepilot/shared'

const router = Router()

// Game upsert schema
const upsertGameSchema = z.object({
  appId: z.union([z.number(), z.null()]).optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  coverImage: z.union([z.string(), z.null()]).optional(),
  genres: z.array(z.any()).optional(),
  subgenres: z.array(z.any()).optional(),
  platforms: z.array(z.any()).optional(),
  emotionalTags: z.array(z.any()).optional(),
  playStatus: z.union([z.string(), z.null()]).optional(),
  hoursPlayed: z.union([z.number(), z.null()]).optional(),
  addedAt: z.union([z.string().datetime(), z.null()]).optional(),
  isFavorite: z.union([z.boolean(), z.null()]).optional(),
  tags: z.array(z.string()).optional(),
  releaseYear: z.union([z.number(), z.null()]).optional()
})

// Launch game request schema
const launchGameSchema = z.object({
  gameId: z.string().min(1),
  platformCode: z.nativeEnum(PlatformCode).optional()
})

// Session logging schema
const logSessionSchema = z.object({
  gameId: z.string().min(1),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().optional(),
  duration: z.number().min(0).optional(),
  platformCode: z.nativeEnum(PlatformCode).optional(),
  launchMethod: z.enum(['steam', 'local', 'manual']).default('manual')
})

/**
 * POST /api/launcher/upsert-games
 * Upsert multiple games (create if missing, update if exists)
 */
router.post('/upsert-games', async (req: Request, res: Response) => {
  try {
    // Try to get user, but allow requests without authentication for development
    let user = null
    try {
      user = await getCurrentUser(req)
    } catch (error) {
      console.log('Launcher: No user authentication, proceeding without user context')
    }

    const games = req.body
    if (!Array.isArray(games)) {
      return res.status(400).json({
        success: false,
        error: 'Request body must be an array of games'
      })
    }

    const upsertedGames = []
    
    for (const gameData of games) {
      const validatedData = upsertGameSchema.parse(gameData)
      
      // Check if game exists by appId or title
      let existingGame = null
      if (validatedData.appId) {
        existingGame = await databaseService.getGameByAppId(validatedData.appId)
      }
      
      if (!existingGame) {
        existingGame = await databaseService.getGameByTitle(validatedData.title)
      }

      const gameToSave = {
        ...validatedData,
        id: existingGame?.id || crypto.randomUUID(),
        addedAt: existingGame?.addedAt ? new Date(existingGame.addedAt) : new Date(validatedData.addedAt || Date.now()),
        moods: existingGame?.moods || [],
        playHistory: existingGame?.playHistory || [],
        playStatus: (validatedData.playStatus as any) || existingGame?.playStatus || 'backlog',
        coverImage: validatedData.coverImage || existingGame?.coverImage || '',
        genres: validatedData.genres || existingGame?.genres || [],
        subgenres: validatedData.subgenres || existingGame?.subgenres || [],
        platforms: validatedData.platforms || existingGame?.platforms || [],
        emotionalTags: validatedData.emotionalTags || existingGame?.emotionalTags || [],
        releaseYear: validatedData.releaseYear || existingGame?.releaseYear || new Date().getFullYear(),
        isFavorite: validatedData.isFavorite !== undefined ? validatedData.isFavorite : (existingGame?.isFavorite || false),
        tags: validatedData.tags ?? existingGame?.tags ?? [],
        appId: validatedData.appId || (existingGame as any)?.appId
      }

      if (existingGame) {
        // Update existing game
        await databaseService.updateGame(existingGame.id, gameToSave)
        upsertedGames.push({ ...gameToSave, id: existingGame.id })
      } else {
        // Create new game
        const createdGame = await databaseService.createGame(gameToSave)
        upsertedGames.push(createdGame)
      }

      // Add to user's library if user is authenticated
      if (user) {
        await databaseService.addUserGame(user.id, gameToSave.id, {
          playStatus: validatedData.playStatus || 'backlog',
          hoursPlayed: validatedData.hoursPlayed || 0,
          lastPlayed: new Date(),
          isFavorite: validatedData.isFavorite || false
        })
      }
    }

    res.json({
      success: true,
      data: {
        games: upsertedGames,
        count: upsertedGames.length
      },
      message: `Successfully upserted ${upsertedGames.length} games`
    })

  } catch (error) {
    console.error('Error upserting games:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to upsert games',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
})

/**
 * POST /api/launcher/launch
 * Launch a game and start tracking session
 */
router.post('/launch', async (req: Request, res: Response) => {
  try {
    // Try to get user, but allow requests without authentication for development
    let user = null
    try {
      user = await getCurrentUser(req)
    } catch (error) {
      // No authentication or invalid token - continue without user context
      console.log('Launcher: No user authentication, proceeding without user context')
    }

    const { gameId, platformCode } = launchGameSchema.parse(req.body)

    console.log('🔧 Backend Launcher - Received gameId:', gameId)
    console.log('🔧 Backend Launcher - Received platformCode:', platformCode)

    // Get game from database - try by ID first, then by appId for Steam games
    let game = await databaseService.getGameById(gameId)
    console.log('🔧 Backend Launcher - Game found by ID:', !!game)
    
    // If not found by ID, try to find by appId (for Steam games)
    if (!game && !isNaN(Number(gameId))) {
      console.log('🔧 Backend Launcher - Searching by appId:', Number(gameId))
      // Try different user IDs to find the games
      const possibleUserIds = ['development-user', 'user-123', 'default-user']
      
      for (const userId of possibleUserIds) {
        try {
          const userGames = await databaseService.getUserGames(userId)
          game = userGames.find((g: any) => g.appId === Number(gameId)) || null
          if (game) {
            console.log('🔧 Backend Launcher - Found game for user:', userId)
            break
          }
        } catch (error) {
          console.log('🔧 Backend Launcher - Failed to get games for user:', userId)
        }
      }
      
      console.log('🔧 Backend Launcher - Game found by appId:', !!game)
    }
    
    if (!game) {
      console.error('🔧 Backend Launcher - Game not found!')
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      })
    }

    console.log('🔧 Backend Launcher - Found game:', game.title)
    console.log('🔧 Backend Launcher - Game appId:', (game as any).appId)

    // Check if user has this game in their library (only if user is authenticated)
    if (user) {
      const userGames = await databaseService.getUserGames(user.id)
      const userGame = userGames.find(ug => ug.id === gameId)
      if (!userGame) {
        return res.status(403).json({
          success: false,
          error: 'Game not found in your library'
        })
      }
    }

    // Determine launch method and URL
    let launchUrl: string | null = null
    let launchMethod: 'steam' | 'local' | 'manual' = 'manual'

    console.log('🔧 Backend Launcher - Game platforms:', game.platforms)
    console.log('🔧 Backend Launcher - Game appId:', (game as any).appId)

    // Check for Steam game
    const steamPlatform = game.platforms.find(p => p.code === PlatformCode.STEAM)
    console.log('🔧 Backend Launcher - Steam platform found:', !!steamPlatform)
    
    if (steamPlatform && (game as any).appId) {
      launchUrl = `steam://rungameid/${(game as any).appId}`
      launchMethod = 'steam'
      console.log('🔧 Backend Launcher - Steam URL generated:', launchUrl)
    }
    // Check for local game with executable path
    else if ((game as any).executablePath) {
      launchUrl = `file://${(game as any).executablePath}`
      launchMethod = 'local'
      console.log('🔧 Backend Launcher - Local URL generated:', launchUrl)
    } else {
      console.log('🔧 Backend Launcher - No launch method available')
    }

    // Log session start (only if user is authenticated)
    let session = null
    if (user) {
      const sessionData = {
        gameId,
        userId: user.id,
        startedAt: new Date(),
        platformCode: platformCode || steamPlatform?.code || PLATFORMS.OTHER,
        launchMethod,
        isActive: true
      }

      session = await databaseService.createGameSession(sessionData)

      // Update user game relationship
      await databaseService.addUserGame(user.id, gameId, {
        playStatus: 'playing',
        lastPlayed: new Date()
      })
    }

    // Update game's last played time
    await databaseService.updateGame(gameId, {
      lastPlayed: new Date(),
      playStatus: 'playing'
    })

    res.json({
      success: true,
      data: {
        launchUrl,
        launchMethod,
        sessionId: session?.id || 'temp-session',
        game: {
          id: game.id,
          title: game.title,
          platforms: game.platforms
        }
      },
      message: launchUrl 
        ? `Launching ${game.title} via ${launchMethod}...`
        : `Game ${game.title} ready for manual launch`
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }

    console.error('Error launching game:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to launch game',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
})

/**
 * POST /api/launcher/session/end
 * End a game session and log playtime
 */
router.post('/session/end', authenticateToken, async (req: Request, res: Response) => {
  try {
    const currentUser = getCurrentUser(req)
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
    }

    const { sessionId, gameId } = req.body

    if (!sessionId && !gameId) {
      return res.status(400).json({
        success: false,
        error: 'Either sessionId or gameId is required'
      })
    }

    // Find active session
    let session
    if (sessionId) {
      session = await databaseService.getGameSession(sessionId)
    } else {
      // Find active session for this game and user
      const activeSessions = await databaseService.getActiveGameSessions(currentUser.id, gameId)
      session = activeSessions[0]
    }

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'No active session found'
      })
    }

    // Verify session belongs to current user
    if (session.userId !== currentUser.id) {
      return res.status(403).json({
        success: false,
        error: 'Session does not belong to current user'
      })
    }

    // Calculate duration
    const endedAt = new Date()
    const duration = Math.floor((endedAt.getTime() - new Date(session.startedAt).getTime()) / 1000) // seconds

    // End the session
    await databaseService.endGameSession(session.id, endedAt, duration)

    // Update game playtime
    const game = await databaseService.getGameById(session.gameId)
    if (game) {
      const additionalHours = duration / 3600
      await databaseService.updateGame(session.gameId, {
        hoursPlayed: (game.hoursPlayed || 0) + additionalHours,
        lastPlayed: endedAt
      })

      // Update user game relationship
      const currentUserGames = await databaseService.getUserGames(currentUser.id)
      const existingUserGame = currentUserGames.find(ug => ug.id === session.gameId)
      
      await databaseService.addUserGame(currentUser.id, session.gameId, {
        hoursPlayed: (existingUserGame?.hoursPlayed || 0) + additionalHours,
        lastPlayed: endedAt
      })
    }

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        gameId: session.gameId,
        duration,
        durationMinutes: Math.floor(duration / 60),
        durationHours: Math.floor(duration / 3600 * 100) / 100,
        endedAt
      },
      message: 'Session ended successfully'
    })

  } catch (error) {
    console.error('Error ending session:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to end session',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
})

/**
 * GET /api/launcher/session/active
 * Get active game sessions for current user
 */
router.get('/session/active', async (req: Request, res: Response) => {
  try {
    // Try to get user, but allow requests without authentication for development
    let user = null
    try {
      user = await getCurrentUser(req)
    } catch (error) {
      // No authentication - return empty sessions
      return res.json({
        success: true,
        data: {
          sessions: []
        }
      })
    }

    const activeSessions = await databaseService.getActiveGameSessions(user?.id || 'anonymous')
    
    res.json({
      success: true,
      data: {
        sessions: activeSessions
      }
    })

  } catch (error) {
    console.error('Error getting active sessions:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get active sessions',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
})

/**
 * GET /api/launcher/session/history
 * Get session history for a game or all games
 */
router.get('/session/history', authenticateToken, async (req: Request, res: Response) => {
  try {
    const currentUser = getCurrentUser(req)
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
    }

    const { gameId, limit = 50, offset = 0 } = req.query

    const sessions = await databaseService.getGameSessionHistory(
      currentUser.id,
      gameId as string,
      Number(limit),
      Number(offset)
    )

    res.json({
      success: true,
      data: {
        sessions,
        count: sessions.length,
        gameId: gameId || 'all'
      }
    })

  } catch (error) {
    console.error('Error fetching session history:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch session history',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
})

export default router
