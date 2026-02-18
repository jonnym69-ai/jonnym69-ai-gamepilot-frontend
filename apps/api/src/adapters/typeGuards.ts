// Type Guards - Runtime type checking for canonical and legacy models
// These functions provide safe type checking for model conversions

import type { User } from '@gamepilot/shared/models/user'
import type { UserIntegration } from '@gamepilot/shared/models/integration'
import type { SteamProfile } from '@gamepilot/shared/models/steamProfile'
import type { MoodVector, BehavioralSignal, NormalizedFeatures } from '../mood/types'

// Type alias for AuthUser since it's not exported
type AuthUser = any

/**
 * Type guard to check if an object is a valid canonical User
 */
export function isCanonicalUser(obj: any): obj is User {
  return obj && 
         typeof obj.id === 'string' && 
         typeof obj.username === 'string' && 
         typeof obj.email === 'string' &&
         typeof obj.displayName === 'string' &&
         obj.gamingProfile &&
         obj.integrations &&
         obj.privacy &&
         obj.preferences &&
         obj.social
}

/**
 * Type guard to check if an object is a valid canonical UserIntegration
 */
export function isCanonicalIntegration(obj: any): obj is UserIntegration {
  return obj && 
         typeof obj.id === 'string' && 
         typeof obj.userId === 'string' && 
         typeof obj.platform === 'string' &&
         typeof obj.externalUserId === 'string' &&
         typeof obj.externalUsername === 'string' &&
         obj.status &&
         obj.syncConfig &&
         obj.permissions
}

/**
 * Type guard to check if an object is a valid legacy AuthUser
 */
export function isLegacyAuthUser(obj: any): obj is AuthUser {
  return obj && 
         typeof obj.id === 'string' && 
         typeof obj.username === 'string' && 
         typeof obj.email === 'string'
}

/**
 * Type guard to check if an object is a valid legacy SteamProfile
 */
export function isLegacySteamProfile(obj: any): obj is SteamProfile {
  return obj && 
         typeof obj.steamId === 'string' && 
         typeof obj.personaName === 'string' && 
         typeof obj.profileUrl === 'string' &&
         typeof obj.avatar === 'string' &&
         typeof obj.avatarMedium === 'string' &&
         typeof obj.avatarFull === 'string'
}

/**
 * Type guard to check if an object is a valid MoodVector
 */
export function isMoodVector(obj: any): obj is MoodVector {
  return obj && 
         typeof obj.calm === 'number' && 
         typeof obj.competitive === 'number' && 
         typeof obj.curious === 'number' &&
         typeof obj.social === 'number' &&
         typeof obj.focused === 'number'
}

/**
 * Type guard to check if an object is a valid BehavioralSignal
 */
export function isBehavioralSignal(obj: any): obj is BehavioralSignal {
  return obj && 
         obj.timestamp instanceof Date && 
         typeof obj.source === 'string' &&
         typeof obj.data === 'object' &&
         typeof obj.weight === 'number'
}

/**
 * Type guard to check if an object is a valid NormalizedFeatures
 */
export function isNormalizedFeatures(obj: any): obj is NormalizedFeatures {
  return obj && 
         typeof obj.engagementVolatility === 'number' && 
         typeof obj.challengeSeeking === 'number' && 
         typeof obj.socialOpenness === 'number' &&
         typeof obj.explorationBias === 'number' &&
         typeof obj.focusStability === 'number'
}

/**
 * Type guard to check if an object has canonical User structure
 */
export function hasCanonicalUserStructure(obj: any): boolean {
  return obj && 
         typeof obj === 'object' &&
         'gamingProfile' in obj &&
         'integrations' in obj &&
         'privacy' in obj &&
         'preferences' in obj &&
         'social' in obj
}

/**
 * Type guard to check if an object has canonical Integration structure
 */
export function hasCanonicalIntegrationStructure(obj: any): boolean {
  return obj && 
         typeof obj === 'object' &&
         'platform' in obj &&
         'externalUserId' in obj &&
         'status' in obj &&
         'syncConfig' in obj &&
         'permissions' in obj
}

/**
 * Type guard to check if an object has legacy AuthUser structure
 */
export function hasLegacyAuthUserStructure(obj: any): boolean {
  return obj && 
         typeof obj === 'object' &&
         'id' in obj &&
         'username' in obj &&
         'email' in obj
}

/**
 * Type guard to check if an object has legacy SteamProfile structure
 */
export function hasLegacySteamProfileStructure(obj: any): boolean {
  return obj && 
         typeof obj === 'object' &&
         'steamId' in obj &&
         'personaName' in obj &&
         'profileUrl' in obj &&
         'avatar' in obj
}

/**
 * Type guard to check if an object has mood analysis structure
 */
export function hasMoodAnalysisStructure(obj: any): boolean {
  return obj && 
         typeof obj === 'object' &&
         ('moodVector' in obj || 'calm' in obj) // Check for either canonical or legacy mood vector
}

/**
 * Type guard to check if an object is a game (for games route)
 */
export function isGame(obj: any): obj is {
  id: string;
  title?: string;
  name?: string;
  platforms?: string[];
  status?: string;
  playtime?: number;
  coverImage?: string;
  launcherId?: string;
  tags?: string[];
} {
  return obj && 
         typeof obj === 'object' &&
         (typeof obj.id === 'string' || typeof obj.appId === 'string') &&
         (typeof obj.title === 'string' || typeof obj.name === 'string')
}

/**
 * Type guard to check if an object is a Steam game (for steam integration)
 */
export function isSteamGame(obj: any): obj is {
  appId: number;
  name: string;
  steamId: string;
  playtimeForever: number;
  imgIconUrl: string;
  hasCommunityVisibleStats: boolean;
} {
  return obj && 
         typeof obj === 'object' &&
         typeof obj.appId === 'number' &&
         typeof obj.name === 'string' &&
         typeof obj.steamId === 'string' &&
         typeof obj.playtimeForever === 'number'
}

/**
 * Helper function to safely determine model type
 */
export function getModelType(obj: any): 'canonical-user' | 'canonical-integration' | 'legacy-auth-user' | 'legacy-steam-profile' | 'mood-vector' | 'behavioral-signal' | 'normalized-features' | 'unknown' {
  if (isCanonicalUser(obj)) return 'canonical-user'
  if (isCanonicalIntegration(obj)) return 'canonical-integration'
  if (isLegacyAuthUser(obj)) return 'legacy-auth-user'
  if (isLegacySteamProfile(obj)) return 'legacy-steam-profile'
  if (isMoodVector(obj)) return 'mood-vector'
  if (isBehavioralSignal(obj)) return 'behavioral-signal'
  if (isNormalizedFeatures(obj)) return 'normalized-features'
  return 'unknown'
}

/**
 * Helper function to check if object can be converted to canonical User
 */
export function canConvertToCanonicalUser(obj: any): boolean {
  return hasLegacyAuthUserStructure(obj) || hasCanonicalUserStructure(obj)
}

/**
 * Helper function to check if object can be converted to canonical UserIntegration
 */
export function canConvertToCanonicalIntegration(obj: any): boolean {
  return hasLegacySteamProfileStructure(obj) || hasCanonicalIntegrationStructure(obj)
}

/**
 * Helper function to check if object is Steam-related
 */
export function isSteamRelated(obj: any): boolean {
  return isLegacySteamProfile(obj) || 
         (isCanonicalIntegration(obj) && obj.platform === 'steam') ||
         (typeof obj === 'object' && 'steamId' in obj)
}

/**
 * Helper function to check if object is authentication-related
 */
export function isAuthRelated(obj: any): boolean {
  return isLegacyAuthUser(obj) || 
         isCanonicalUser(obj) ||
         (typeof obj === 'object' && ('token' in obj || 'accessToken' in obj))
}

/**
 * Helper function to check if object is mood-analysis related
 */
export function isMoodAnalysisRelated(obj: any): boolean {
  return isMoodVector(obj) || 
         isBehavioralSignal(obj) || 
         isNormalizedFeatures(obj) ||
         hasMoodAnalysisStructure(obj)
}

/**
 * Runtime type checker for debugging
 */
export function debugType(obj: any, label?: string): void {
  const type = getModelType(obj)
  const structure = {
    hasCanonicalUser: hasCanonicalUserStructure(obj),
    hasCanonicalIntegration: hasCanonicalIntegrationStructure(obj),
    hasLegacyAuthUser: hasLegacyAuthUserStructure(obj),
    hasLegacySteamProfile: hasLegacySteamProfileStructure(obj),
    hasMoodAnalysis: hasMoodAnalysisStructure(obj)
  }
  
  console.log(`${label || 'Type Check'}:`, {
    type,
    structure,
    keys: Object.keys(obj),
    sample: JSON.stringify(obj).substring(0, 200) + '...'
  })
}
