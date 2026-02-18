// Platform-specific Game extensions for GamePilot platform
// These interfaces extend the canonical Game model with platform-specific features

import type { Game } from '../index'
import { PLATFORMS } from '../constants/platform'

// ============================================================================
// STEAM-SPECIFIC GAME EXTENSIONS
// ============================================================================

/**
 * Steam-specific game properties
 * Extends the canonical Game model with Steam launcher functionality
 */
export interface SteamGame extends Game {
  // Steam launcher identification
  appId: number // Steam App ID for launching games
  launcherId: string // Steam launcher identifier
  
  // Local session tracking (Steam launcher specific)
  lastLocalPlayedAt?: string | null
  localSessionMinutes?: number
  localSessionCount?: number
  
  // Steam-specific metadata
  steamFeatures?: {
    achievements: boolean
    cloudSaves: boolean
    tradingCards: boolean
    workshop: boolean
    multiplayer: boolean
    controllerSupport: boolean
  }
  
  // Steam store data
  steamStoreData?: {
    price?: number
    discount?: number
    metacriticScore?: number
    recommendations?: number
    categories?: string[]
    tags?: string[]
  }
}

// ============================================================================
// PLATFORM GAME TYPE UNION
// ============================================================================

/**
 * Union type for all platform-specific game extensions
 * Use this when you need to handle games from multiple platforms
 */
export type PlatformGame = SteamGame // Add more platforms as needed

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if a game is a Steam game
 */
export function isSteamGame(game: Game): game is SteamGame {
  return 'appId' in game && typeof game.appId === 'number'
}

/**
 * Get platform-specific game type
 */
export function getPlatformGame(game: Game, platformCode: string): PlatformGame {
  switch (platformCode) {
    case PLATFORMS.STEAM:
      if (!isSteamGame(game)) {
        throw new Error(`Game ${game.id} is not a Steam game`)
      }
      return game as SteamGame
    default:
      return game as PlatformGame
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert canonical Game to SteamGame with default Steam properties
 */
export function toSteamGame(game: Game, steamData: Partial<SteamGame> = {}): SteamGame {
  return {
    ...game,
    appId: steamData.appId || 0,
    launcherId: steamData.launcherId || `steam-${game.id}`,
    lastLocalPlayedAt: steamData.lastLocalPlayedAt || null,
    localSessionMinutes: steamData.localSessionMinutes || 0,
    localSessionCount: steamData.localSessionCount || 0,
    steamFeatures: steamData.steamFeatures || {
      achievements: false,
      cloudSaves: false,
      tradingCards: false,
      workshop: false,
      multiplayer: false,
      controllerSupport: false
    },
    steamStoreData: steamData.steamStoreData
  }
}

/**
 * Extract canonical Game from platform-specific game
 */
export function toCanonicalGame(platformGame: PlatformGame): Game {
  // Create a copy without platform-specific properties
  const { appId, launcherId, lastLocalPlayedAt, localSessionMinutes, localSessionCount, steamFeatures, steamStoreData, ...canonicalGame } = platformGame
  return canonicalGame
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const STEAM_GAME_DEFAULTS: Partial<SteamGame> = {
  appId: 0,
  launcherId: '',
  lastLocalPlayedAt: null,
  localSessionMinutes: 0,
  localSessionCount: 0,
  steamFeatures: {
    achievements: false,
    cloudSaves: false,
    tradingCards: false,
    workshop: false,
    multiplayer: false,
    controllerSupport: false
  }
}
