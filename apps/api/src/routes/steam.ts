import { Router, Request, Response } from 'express'
import { z } from 'zod'
import axios from 'axios'
import { fetchSteamGames } from '../auth/steam'
import { databaseService } from '../services/database'
import { authenticateToken, getCurrentUser } from '../auth/authService'
import { PlatformCode, PlayStatus } from '@gamepilot/shared'
import { normalizeSteamGames, normalizeGenres, normalizePlatforms } from '../utils/dataPipelineNormalizer'

const router = Router()

interface SteamGame {
  appid: number
  name: string
  playtime_forever: number
  img_icon_url: string
  img_logo_url: string
  has_community_visible_stats: boolean
}

interface SteamGamesResponse {
  response: {
    game_count: number
    games: SteamGame[]
  }
}

/**
 * GET /games?steamId=xxx&apiKey=xxx
 * Get Steam games for a user (legacy endpoint for frontend compatibility)
 */
router.get('/games', async (req: Request, res: Response) => {
  try {
    const { steamId, apiKey } = req.query
    
    if (!steamId) {
      return res.status(400).json({
        error: 'Missing steamId parameter'
      })
    }
    
    console.log(`📚 GET /games?steamId=${steamId} - Fetching Steam library using real Steam API`)
    
    // Use real Steam API to get owned games
    const steamGames = await fetchSteamGames(steamId as string)
    
    console.log(`✅ Retrieved ${steamGames.length} games from Steam API`)
    
    res.json({
      steamId,
      games: steamGames,
      gameCount: steamGames.length,
      source: 'real_steam_api'
    })
    
  } catch (error) {
    console.error('❌ Failed to fetch Steam games:', error)
    res.status(500).json({
      error: 'Failed to fetch Steam games',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * GET /games/v2?steamId=xxx&apiKey=xxx
 * New robust Steam games endpoint with enhanced error handling and validation
 */
router.get('/games/v2', async (req: Request, res: Response) => {
  try {
    const { steamId, apiKey } = req.query

    // Validate required parameters
    if (!steamId || !apiKey) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Both steamId and apiKey are required'
      })
    }

    // Validate steamId format (should be numeric)
    if (typeof steamId !== 'string' || !/^\d{17}$/.test(steamId)) {
      return res.status(400).json({
        error: 'Invalid steamId format',
        message: 'steamId must be a 17-digit Steam ID'
      })
    }

    // Validate apiKey format
    if (typeof apiKey !== 'string' || apiKey.length < 32) {
      return res.status(400).json({
        error: 'Invalid apiKey format',
        message: 'apiKey must be a valid Steam Web API key'
      })
    }

    console.log('🔄 Fetching Steam games for user:', steamId)

    // Call Steam Web API directly with provided apiKey
    const steamApiUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/`
    const params = {
      key: apiKey as string,
      steamid: steamId as string,
      format: 'json',
      include_appinfo: true,
      include_played_free_games: true
    }

    const response = await axios.get<SteamGamesResponse>(steamApiUrl, { params })
    const steamData = response.data

    // Validate Steam API response
    if (!steamData.response || !Array.isArray(steamData.response.games)) {
      return res.status(500).json({
        error: 'Invalid Steam API response',
        message: 'Steam API returned unexpected data format'
      })
    }

    // Transform games using the data pipeline normalizer for proper genre mapping
    const normalizedGames = normalizeSteamGames(steamData.response.games)
    
    // Convert to the format expected by frontend
    const games = normalizedGames.map(game => ({
      appid: game.appId,
      name: game.title,
      playtime_forever: game.hoursPlayed * 60, // Convert back to minutes for Steam API format
      img_icon_url: game.coverImage,
      img_logo_url: game.coverImage,
      has_community_visible_stats: true,
      genres: game.genres, // Include normalized genres
      platforms: game.platforms, // Include normalized platforms
      moods: game.moods, // Include moods (will be populated later)
      emotionalTags: game.emotionalTags, // Include emotional tags (will be populated later)
      playStatus: game.playStatus,
      userRating: game.userRating,
      globalRating: game.globalRating,
      lastPlayed: game.lastPlayed,
      isFavorite: game.isFavorite,
      notes: game.notes,
      releaseYear: game.releaseYear,
      addedAt: game.addedAt
    }))

    console.log(`✅ Successfully fetched ${games.length} games from Steam`)

    res.json({
      success: true,
      data: {
        game_count: steamData.response.game_count,
        games: games
      }
    })

  } catch (error: any) {
    console.error('❌ Steam API error:', error.message)

    // Handle different types of errors
    if (error.response) {
      // Steam API responded with error status
      const status = error.response.status
      const message = error.response.data?.error?.message || 'Steam API error'

      if (status === 403) {
        return res.status(403).json({
          error: 'Steam API authentication failed',
          message: 'Invalid Steam Web API key or insufficient permissions'
        })
      } else if (status === 401) {
        return res.status(401).json({
          error: 'Steam API authentication failed',
          message: 'Invalid Steam Web API key'
        })
      } else if (status === 400) {
        return res.status(400).json({
          error: 'Invalid request to Steam API',
          message: 'Invalid steamId or malformed request'
        })
      } else {
        return res.status(status).json({
          error: 'Steam API error',
          message: message
        })
      }
    } else if (error.request) {
      // Network error - couldn't reach Steam API
      return res.status(503).json({
        error: 'Steam API unavailable',
        message: 'Unable to connect to Steam servers. Please try again later.'
      })
    } else {
      // Other error (programming error, etc.)
      return res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred while fetching Steam games'
      })
    }
  }
})

/**
 * GET /library/:steamId
 * Get Steam library for a user using real Steam API
 */
router.get('/library/:steamId', async (req: Request, res: Response) => {
  try {
    const { steamId } = req.params
    console.log(`📚 GET /library/${steamId} - Fetching Steam library using real Steam API`)
    
    // Use real Steam API to get owned games
    const steamGames = await fetchSteamGames(steamId)
    
    console.log(`✅ Retrieved ${steamGames.length} games from Steam API`)
    
    res.json({
      steamId,
      games: steamGames,
      gameCount: steamGames.length,
      source: 'real_steam_api'
    })
    
  } catch (error) {
    console.error('❌ Failed to fetch Steam library:', error)
    res.status(500).json({
      error: 'Failed to fetch Steam library',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * GET /recently-played
 * Get user's recently played Steam games
 */
router.get('/recently-played', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get user's Steam integration
    const steamIntegration = user.integrations?.find((i: any) => i.platform === 'steam')
    if (!steamIntegration?.externalUserId) {
      return res.status(400).json({
        error: 'No Steam integration found',
        message: 'User must connect their Steam account first'
      })
    }

    console.log('🎮 Fetching recently played games for user:', user.id)

    // Call Steam API directly for recently played games
    const steamApiUrl = `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/`
    const params = {
      key: process.env.STEAM_API_KEY,
      steamid: steamIntegration.externalUserId,
      format: 'json'
    }

    if (!process.env.STEAM_API_KEY) {
      console.warn('⚠️ STEAM_API_KEY not configured')
      return res.status(500).json({
        error: 'Steam API not configured',
        message: 'Server configuration error'
      })
    }

    const response = await axios.get(steamApiUrl, { params })
    const steamData = response.data

    if (!steamData.response || !steamData.response.games) {
      return res.json({ games: [] })
    }

    // Transform Steam data to expected format
    const games = steamData.response.games.map((game: any) => ({
      appid: game.appid,
      name: game.name,
      playtime_forever: game.playtime_forever,
      playtime_2weeks: game.playtime_2weeks || 0,
      img_icon_url: game.img_icon_url,
      img_logo_url: game.img_logo_url,
      playtime_windows_forever: game.playtime_windows_forever || 0,
      playtime_mac_forever: game.playtime_mac_forever || 0,
      playtime_linux_forever: game.playtime_linux_forever || 0,
      last_played: game.rtime_last_played || 0
    }))

    console.log(`✅ Retrieved ${games.length} recently played Steam games`)

    res.json({
      success: true,
      games: games
    })

  } catch (error: any) {
    console.error('❌ Error fetching recently played games:', error.message)

    if (error.response) {
      return res.status(error.response.status).json({
        error: 'Steam API error',
        message: error.response.data?.error || 'Failed to fetch recently played games'
      })
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch recently played games'
    })
  }
})

/**
 * GET /store-details?appids=123,456,789
 * Proxy Steam Store API calls to avoid CSP violations in frontend
 */
router.get('/store-details', async (req: Request, res: Response) => {
  try {
    const { appids } = req.query

    if (!appids || typeof appids !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid appids parameter'
      })
    }

    console.log(`🎮 GET /store-details?appids=${appids} - Proxying Steam Store API`)

    // Call Steam Store API
    const steamUrl = `https://store.steampowered.com/api/appdetails?appids=${appids}&cc=US&l=en`
    const response = await axios.get(steamUrl, {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'GamePilot/1.0'
      }
    })

    console.log(`✅ Successfully proxied Steam Store data for ${appids.split(',').length} games`)

    res.json(response.data)
  } catch (error: any) {
    console.error('❌ Steam Store API proxy error:', error.message)

    if (error.response) {
      // Steam API responded with error
      return res.status(error.response.status).json({
        error: 'Steam Store API error',
        message: error.response.data?.error || 'Failed to fetch game details'
      })
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      return res.status(504).json({
        error: 'Steam Store API timeout',
        message: 'Request to Steam took too long'
      })
    } else {
      // Other error
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to proxy Steam Store API request'
      })
    }
  }
})

export default router
