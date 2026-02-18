import { Router } from 'express'
import { z } from 'zod'
import { databaseService } from '../services/database'
import { authenticateToken, getCurrentUser } from '../auth/authService'
import { PlatformCode, PlayStatus } from '@gamepilot/shared'

const router = Router()

// Game creation schema
const createGameSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  genres: z.array(z.object({
    id: z.string(),
    name: z.string(),
    color: z.string(),
    subgenres: z.array(z.any())
  })).optional(),
  platforms: z.array(z.object({
    id: z.string(),
    name: z.string(),
    code: z.nativeEnum(PlatformCode),
    isConnected: z.boolean()
  })),
  playStatus: z.enum(['unplayed', 'playing', 'completed', 'paused', 'abandoned']),
  tags: z.array(z.string()).optional(),
  coverImage: z.string().optional(),
  hoursPlayed: z.number().min(0),
  userRating: z.number().min(0).max(5).optional(),
  achievements: z.object({
    unlocked: z.number(),
    total: z.number()
  }).optional(),
  launcherId: z.string().optional(),
  addedAt: z.date().optional(),
  releaseYear: z.number().min(1950).max(new Date().getFullYear() + 5),
  subgenres: z.array(z.any()).optional(),
  emotionalTags: z.array(z.any()).optional(),
  isFavorite: z.boolean().optional(),
  notes: z.string().optional(),
  globalRating: z.number().min(0).max(5).optional(),
  lastPlayed: z.date().optional(),
  totalPlaytime: z.number().min(0).optional(),
  averageRating: z.number().min(0).max(5).optional(),
  completionPercentage: z.number().min(0).max(100).optional(),
  developer: z.string().optional(),
  publisher: z.string().optional()
})

// GET /api/games/user - Get authenticated user's games
router.get('/user', async (req, res) => {
  try {
    // Try to get user, but allow requests without authentication for development
    let currentUser = null
    try {
      currentUser = getCurrentUser(req)
    } catch (error) {
      console.log('Games: No user authentication, loading all games for development')
    }

    // For development: If no user, load all games from database
    if (!currentUser) {
      console.log('🔍 API: Loading all games for development (no auth)')
      const allGames = await databaseService.getAllGames()
      
      // Debug: Check if moods are loaded from database
      console.log('🔍 API: All games loaded from database:', allGames.length)
      if (allGames.length > 0) {
        console.log('🔍 API: First game moods:', allGames[0].moods)
        console.log('🔍 API: First game emotionalTags:', allGames[0].emotionalTags)
      }
      
      return res.json({
        success: true,
        data: {
          games: allGames,
          total: allGames.length
        }
      })
    }

    // Fetch user's games from database
    const userGames = await databaseService.getUserGames(currentUser.id)
    
    // Debug: Check if moods are loaded from database
    console.log('🔍 API: Games loaded from database:', userGames.length)
    if (userGames.length > 0) {
      console.log('🔍 API: First game moods:', userGames[0].moods)
      console.log('🔍 API: First game emotionalTags:', userGames[0].emotionalTags)
    }
    
    res.json({
      success: true,
      data: {
        games: userGames,
        total: userGames.length
      }
    })
  } catch (error) {
    console.error('Error fetching user games:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch games'
    })
  }
})

// POST /api/games/migrate-moods - Migrate emotionalTags to moods
router.post('/migrate-moods', async (req, res) => {
  try {
    console.log('🔧 API: Starting migration from emotionalTags to moods...')
    const updatedCount = await databaseService.migrateEmotionalTagsToMoods()
    
    res.json({
      success: true,
      message: `Successfully migrated ${updatedCount} games from emotionalTags to moods`,
      updatedCount
    })
  } catch (error) {
    console.error('Error migrating moods:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to migrate moods'
    })
  }
})

// GET /api/games - Get all games with optional filters
router.get('/', async (req, res) => {
  try {
    const { status, platform, tag, search } = req.query
    
    // For now, return empty since we don't have a global games table
    // This could be implemented later if needed for admin features
    // For now, users should use /api/games/user for their own games
    res.json({
      success: true,
      data: {
        games: [],
        total: 0,
        filters: { status, platform, tag, search },
        message: 'Use /api/games/user to get your personal game library'
      }
    })
  } catch (error) {
    console.error('Error fetching games:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch games'
    })
  }
})

// GET /api/games/:id - Get specific game
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // Get game from database
    const game = await databaseService.getGameById(id)
    
    if (!game) {
      return res.status(404).json({ 
        success: false,
        error: 'Game not found'
      })
    }
    
    res.json({
      success: true,
      data: game
    })
  } catch (error) {
    console.error('Error fetching game:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch game'
    })
  }
})

// POST /api/games - Add a new game to user's library
router.post('/', authenticateToken, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req)
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
    }

    const validatedData = createGameSchema.parse(req.body)
    
    // Create game in database with required Game interface properties
    const gameData = {
      title: validatedData.title,
      description: '', // Not in schema, set default
      coverImage: validatedData.coverImage || '',
      developer: '', // Not in schema, set default
      publisher: '', // Not in schema, set default
      genres: validatedData.genres || [], // Use validated data
      subgenres: validatedData.subgenres || [], // Use validated data
      platforms: validatedData.platforms, // Already in correct format
      emotionalTags: validatedData.emotionalTags || [], // Use validated data
      userRating: validatedData.userRating,
      globalRating: validatedData.globalRating || 0,
      playStatus: validatedData.playStatus, // Correct property name
      hoursPlayed: validatedData.hoursPlayed, // Correct property name
      lastPlayed: validatedData.lastPlayed,
      notes: validatedData.notes || '', // Use validated data
      isFavorite: validatedData.isFavorite || false,
      moods: [], // Required by Game interface
      tags: validatedData.tags || [], // Use validated data
      releaseYear: validatedData.releaseYear,
      totalPlaytime: validatedData.totalPlaytime || 0,
      averageRating: validatedData.averageRating,
      completionPercentage: validatedData.completionPercentage,
      achievements: validatedData.achievements || { unlocked: 0, total: 0 },
      playHistory: [] // Required by Game interface
    }
    
    const newGame = await databaseService.createGame(gameData)
    
    // Add game to user's library
    await databaseService.addUserGame(currentUser.id, newGame.id, {
      playStatus: validatedData.playStatus,
      hoursPlayed: validatedData.hoursPlayed,
      notes: validatedData.notes || ''
    })
    
    res.status(201).json({
      success: true,
      data: newGame
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    
    console.error('Error creating game:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create game',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
})

// PUT /api/games/:id - Update a game
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req)
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
    }

    const { id } = req.params
    const updateSchema = createGameSchema.partial()
    const validatedData = updateSchema.parse(req.body)
    
    // Update the game in database
    const updatedGame = await databaseService.updateGame(id, {
      title: validatedData.title,
      description: validatedData.description,
      coverImage: validatedData.coverImage,
      developer: validatedData.developer,
      publisher: validatedData.publisher,
      genres: validatedData.genres,
      subgenres: validatedData.subgenres,
      platforms: validatedData.platforms,
      emotionalTags: validatedData.emotionalTags,
      userRating: validatedData.userRating,
      globalRating: validatedData.globalRating,
      playStatus: validatedData.playStatus,
      hoursPlayed: validatedData.hoursPlayed,
      lastPlayed: validatedData.lastPlayed,
      notes: validatedData.notes,
      isFavorite: validatedData.isFavorite,
      releaseYear: validatedData.releaseYear,
      totalPlaytime: validatedData.totalPlaytime,
      averageRating: validatedData.averageRating,
      completionPercentage: validatedData.completionPercentage,
      achievements: validatedData.achievements
    })
    
    // Also update user game relationship if status/playtime changed
    if (validatedData.playStatus !== undefined || validatedData.hoursPlayed !== undefined) {
      await databaseService.addUserGame(currentUser.id, id, {
        playStatus: validatedData.playStatus,
        hoursPlayed: validatedData.hoursPlayed || 0,
        notes: validatedData.notes || ''
      })
    }
    
    res.json({
      success: true,
      data: updatedGame,
      message: 'Game updated successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    
    console.error('Error updating game:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update game',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
})

// DELETE /api/games/:id - Remove a game from user's library
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req)
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
    }

    const { id } = req.params
    
    // Delete the game from database
    const deleted = await databaseService.deleteGame(id)
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      })
    }
    
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting game:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete game'
    })
  }
})

export default router
