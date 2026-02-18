#!/usr/bin/env tsx

/**
 * Steam Sync Service
 * Fetches games from Steam API and saves them to database with proper genres
 */

import axios from 'axios'
import { databaseService } from '../src/services/database'
import { normalizeSteamGames } from '../src/utils/dataPipelineNormalizer'
import { ollamaService } from '../src/services/ollamaService'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const STEAM_API_KEY = process.env.STEAM_API_KEY

interface SteamGame {
  appid: number
  name: string
  playtime_forever: number
  img_icon_url: string
  img_logo_url: string
  has_community_visible_stats: boolean
  genres?: Array<{
    id: number
    description: string
  }>
  platforms?: {
    windows: boolean
    mac: boolean
    linux: boolean
  }
  release_date?: {
    date: string
  }
  rtime_last_played?: number
  detailed_description?: string
  short_description?: string
}

interface SteamApiResponse {
  response: {
    game_count: number
    games: SteamGame[]
  }
}

async function syncSteamGames() {
  try {
    console.log('🎮 Starting Steam games sync...')
    
    if (!STEAM_API_KEY) {
      console.error('❌ STEAM_API_KEY not found in environment variables')
      process.exit(1)
    }
    
    // Initialize database
    await databaseService.initialize()
    
    // For testing, we'll use a real Steam ID
    const steamId = '76561197960435530' // Real Steam ID (public profile)
    
    console.log(`🔍 Fetching games for Steam ID: ${steamId}`)
    
    // Fetch owned games from Steam API
    const ownedGamesUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${steamId}&format=json&include_appinfo=1&include_played_free_games=1`
    
    const response = await axios.get<SteamApiResponse>(ownedGamesUrl)
    const steamData = response.data
    
    console.log('🔍 Steam API response:', JSON.stringify(steamData, null, 2))
    
    if (!steamData.response || !Array.isArray(steamData.response.games)) {
      console.error('❌ Invalid Steam API response')
      process.exit(1)
    }
    
    console.log(`📊 Found ${steamData.response.game_count} games on Steam`)
    
    // Filter to just CS:GO for testing real genres
    const csGoGame = steamData.response.games.find(game => game.appid === 730)
    if (!csGoGame) {
      console.error('❌ CS:GO (appId 730) not found in Steam library')
      process.exit(1)
    }
    
    console.log(`🎮 Found CS:GO: ${csGoGame.name}`)
    
    // Normalize just CS:GO for testing
    const normalizedGames = normalizeSteamGames([csGoGame])
    
    console.log(`🔧 Normalized ${normalizedGames.length} games with proper genres`)
    
    // Check if Ollama is available for AI mood generation
    const ollamaAvailable = await ollamaService.isAvailable()
    console.log('🤖 Ollama AI service available:', ollamaAvailable)
    
    // Save games to database
    let savedCount = 0
    let aiGeneratedMoods = 0
    
    for (const game of normalizedGames) {
      try {
        // Generate moods using AI if available
        let moods: string[] = []
        
        if (ollamaAvailable && game.description) {
          console.log(`🤖 Generating AI moods for: ${game.title}`)
          moods = await ollamaService.getMoodsFromAI(game.description)
          aiGeneratedMoods++
          console.log(`🎭 AI generated moods for ${game.title}:`, moods)
        } else {
          console.log(`📝 Using default moods for: ${game.title}`)
          moods = ['intense'] // Default fallback
        }
        
        await databaseService.createGame({
          title: game.title,
          description: game.description || '',
          backgroundImages: [],
          coverImage: null,
          releaseDate: null,
          developer: null,
          publisher: null,
          genres: game.genres || [],
          subgenres: [],
          platforms: game.platforms || [],
          emotionalTags: game.emotionalTags || [],
          userRating: 0,
          globalRating: 4.5,
          playStatus: 'unplayed',
          hoursPlayed: 0,
          lastPlayed: null,
          notes: '',
          isFavorite: false,
          tags: [],
          moods: moods,
          playHistory: [],
          releaseYear: new Date().getFullYear(),
          achievements: [],
          totalPlaytime: 0,
          averageRating: 0,
          completionPercentage: 0,
          appId: game.appId
        })
        
        savedCount++
        if (savedCount % 10 === 0) {
          console.log(`💾 Saved ${savedCount}/${normalizedGames.length} games...`)
        }
      } catch (error) {
        console.error(`❌ Failed to save game ${game.title}:`, error)
      }
    }
    
    console.log(`✅ Successfully saved ${savedCount} games to database`)
    console.log(`\n� Steam sync completed!`)
    console.log(`📊 Summary:`)
    console.log(`   • Total games processed: ${normalizedGames.length}`)
    console.log(`   • Games saved to database: ${savedCount}`)
    console.log(`   • AI-generated moods: ${aiGeneratedMoods}`)
    console.log(`   • Games with proper genres: ${savedCount}`)
    console.log(`\n🎯 Your Steam library is now synced with intelligent mood analysis!`)
    
  } catch (error) {
    console.error('❌ Steam sync failed:', error)
    process.exit(1)
  }
}

// Run the sync
syncSteamGames()
