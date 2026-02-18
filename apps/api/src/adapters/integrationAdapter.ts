// Integration Adapter - Non-destructive mapping between legacy and canonical Integration models
// This adapter provides bidirectional conversion without breaking existing functionality

import type { UserIntegration } from '@gamepilot/shared/models/integration'
import type { SteamProfile } from '@gamepilot/shared/models/steamProfile'

// Extended interfaces for type safety
interface SteamMetadata {
  personaName?: string
  realName?: string
  country?: string
  timeCreated?: Date
  gameCount?: number
  profileUrl?: string
}

interface ExtendedIntegrationMetadata {
  displayName?: string
  profileUrl?: string
  avatar?: string
  steam?: SteamMetadata
  discord?: any
  youtube?: any
  [key: string]: any
}

/**
 * Adapter for converting between canonical UserIntegration and legacy integration models
 * Provides non-destructive migration path for platform integration services
 */

export class IntegrationAdapter {
  /**
   * Convert SteamProfile to canonical UserIntegration
   * Used when Steam integration data needs to be stored in canonical format
   */
  static steamProfileToIntegration(
    steamProfile: SteamProfile, 
    userId: string,
    additionalData?: {
      accessToken?: string
      refreshToken?: string
      expiresAt?: Date
      scopes?: string[]
    }
  ): UserIntegration {
    const now = new Date()
    
    return {
      id: `steam-${steamProfile.steamId}`,
      userId,
      platform: 'steam' as any, // Using 'steam' as string until added to PlatformCode enum
      externalUserId: steamProfile.steamId,
      externalUsername: steamProfile.personaName,
      accessToken: additionalData?.accessToken,
      refreshToken: additionalData?.refreshToken,
      expiresAt: additionalData?.expiresAt,
      scopes: additionalData?.scopes || [],
      status: 'active' as any, // IntegrationStatus.ACTIVE
      isActive: true,
      isConnected: true,
      createdAt: now,
      updatedAt: now,
      lastSyncAt: now,
      lastUsedAt: now,
      metadata: {
        displayName: steamProfile.personaName,
        profileUrl: steamProfile.profileUrl,
        avatar: steamProfile.avatarFull,
        steam: {
          personaName: steamProfile.personaName,
          realName: steamProfile.gameExtraInfo,
          profileUrl: steamProfile.profileUrl
        }
      } as ExtendedIntegrationMetadata,
      syncConfig: {
        autoSync: true,
        syncFrequency: 12, // Steam updates every 12 hours
        lastSyncAt: now,
        errorCount: 0,
        maxRetries: 3
      }
    }
  }

  /**
   * Convert canonical UserIntegration to SteamProfile
   * Used when Steam services need legacy format
   */
  static integrationToSteamProfile(integration: UserIntegration): SteamProfile | null {
    if (integration.platform !== 'steam') {
      return null
    }

    const steamMetadata = (integration.metadata as ExtendedIntegrationMetadata)?.steam
    
    return {
      steamId: integration.externalUserId,
      personaName: integration.externalUsername || steamMetadata?.personaName || '',
      profileUrl: (integration.metadata as ExtendedIntegrationMetadata)?.profileUrl || steamMetadata?.profileUrl || '',
      avatar: (integration.metadata as ExtendedIntegrationMetadata)?.avatar || '',
      avatarMedium: (integration.metadata as ExtendedIntegrationMetadata)?.avatar || '',
      avatarFull: (integration.metadata as ExtendedIntegrationMetadata)?.avatar || '',
      personaState: 1, // Online (default)
      personaStateFlags: 0,
      gameServerIp: undefined,
      gameServerPort: undefined,
      gameExtraInfo: steamMetadata?.realName,
      gameId: undefined
    }
  }

  /**
   * Create canonical UserIntegration from connection data
   * Used during OAuth flow completion
   */
  static fromConnectionData(
    platform: string,
    userId: string,
    externalUserId: string,
    externalUsername: string,
    authData: {
      accessToken?: string
      refreshToken?: string
      expiresAt?: Date
      scopes?: string[]
    },
    profileData?: Record<string, any>
  ): UserIntegration {
    const now = new Date()
    
    const baseIntegration: UserIntegration = {
      id: `${platform}-${externalUserId}`,
      userId,
      platform: platform as any,
      externalUserId,
      externalUsername,
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken,
      expiresAt: authData.expiresAt,
      scopes: authData.scopes || [],
      status: 'active' as any,
      isActive: true,
      isConnected: true,
      createdAt: now,
      updatedAt: now,
      lastSyncAt: now,
      lastUsedAt: now,
      metadata: {
        displayName: externalUsername,
        profileUrl: profileData?.profileUrl,
        avatar: profileData?.avatar,
        ...profileData
      },
      syncConfig: {
        autoSync: true,
        syncFrequency: this.getDefaultSyncFrequency(platform),
        lastSyncAt: now,
        errorCount: 0,
        maxRetries: 3
      }
    }

    // Add platform-specific metadata
    if (platform === 'steam' && profileData) {
      baseIntegration.metadata!.steam = profileData
    } else if (platform === 'discord' && profileData) {
      baseIntegration.metadata!.discord = profileData
    } else if (platform === 'youtube' && profileData) {
      baseIntegration.metadata!.youtube = profileData
    }

    return baseIntegration
  }

  /**
   * Update integration status
   * Used when integration state changes
   */
  static updateStatus(
    integration: UserIntegration, 
    status: 'active' | 'error' | 'expired' | 'revoked',
    errorCount?: number
  ): UserIntegration {
    return {
      ...integration,
      status: status as any,
      isActive: status === 'active',
      isConnected: status === 'active',
      updatedAt: new Date(),
      syncConfig: {
        ...integration.syncConfig,
        errorCount: errorCount || (status === 'error' ? integration.syncConfig.errorCount + 1 : 0),
        lastSyncAt: status === 'active' ? new Date() : integration.syncConfig.lastSyncAt
      }
    }
  }

  /**
   * Update integration tokens
   * Used during token refresh
   */
  static updateTokens(
    integration: UserIntegration,
    tokenData: {
      accessToken: string
      refreshToken?: string
      expiresAt: Date
    }
  ): UserIntegration {
    return {
      ...integration,
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      expiresAt: tokenData.expiresAt,
      status: 'active' as any,
      isActive: true,
      isConnected: true,
      updatedAt: new Date(),
      syncConfig: {
        ...integration.syncConfig,
        errorCount: 0, // Reset error count on successful token update
        lastSyncAt: new Date()
      }
    }
  }

  /**
   * Get platform-specific sync frequency
   */
  private static getDefaultSyncFrequency(platform: string): number {
    switch (platform) {
      case 'steam': return 12 // 12 hours
      case 'discord': return 6 // 6 hours
      case 'youtube': return 24 // 24 hours
      case 'twitch': return 1 // 1 hour
      default: return 24 // Default to daily
    }
  }

  /**
   * Get platform-specific capabilities
   */
  private static getDefaultCapabilities(platform: string): any[] {
    switch (platform) {
      case 'steam':
        return [
          'read_profile' as any,
          'read_library' as any,
          'read_activity' as any,
          'read_achievements' as any,
          'steam_games' as any,
          'steam_stats' as any
        ]
      case 'discord':
        return [
          'read_profile' as any,
          'read_activity' as any,
          'read_friends' as any,
          'discord_guilds' as any,
          'discord_channels' as any
        ]
      case 'youtube':
        return [
          'read_profile' as any,
          'youtube_videos' as any,
          'youtube_channels' as any
        ]
      case 'twitch':
        return [
          'read_profile' as any,
          'twitch_streams' as any,
          'twitch_channels' as any
        ]
      default:
        return ['read_profile' as any]
    }
  }

  /**
   * Get platform-specific permissions
   */
  private static getDefaultPermissions(platform: string) {
    switch (platform) {
      case 'steam':
        return {
          canReadProfile: true,
          canReadLibrary: true,
          canReadActivity: true,
          canReadFriends: false,
          canReadAchievements: true
        }
      case 'discord':
        return {
          canReadProfile: true,
          canReadLibrary: false,
          canReadActivity: true,
          canReadFriends: true,
          canReadAchievements: false
        }
      case 'youtube':
      case 'twitch':
        return {
          canReadProfile: true,
          canReadLibrary: false,
          canReadActivity: false,
          canReadFriends: false,
          canReadAchievements: false
        }
      default:
        return {
          canReadProfile: true,
          canReadLibrary: false,
          canReadActivity: false,
          canReadFriends: false,
          canReadAchievements: false
        }
    }
  }

  /**
   * Validate integration for authentication
   */
  static validateForAuth(integration: UserIntegration): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!integration.id) errors.push('Integration ID is required')
    if (!integration.userId) errors.push('User ID is required')
    if (!integration.platform) errors.push('Platform is required')
    if (!integration.externalUserId) errors.push('External user ID is required')
    
    // Check if tokens are valid for active integrations
    if (integration.isActive && !integration.accessToken) {
      errors.push('Active integration requires access token')
    }
    
    // Check if token is expired
    if (integration.expiresAt && integration.expiresAt <= new Date()) {
      errors.push('Access token has expired')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Check if integration needs token refresh
   */
  static needsTokenRefresh(integration: UserIntegration): boolean {
    if (!integration.expiresAt) return false
    
    // Refresh if token expires within the next hour
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000)
    return integration.expiresAt <= oneHourFromNow
  }

  /**
   * Get integration health status
   */
  static getHealthStatus(integration: UserIntegration): {
    isHealthy: boolean
    status: string
    issues: string[]
    lastSyncAge: number
  } {
    const issues: string[] = []
    const now = new Date()
    
    // Check connection status
    if (!integration.isActive) {
      issues.push('Integration is inactive')
    }
    
    // Check token validity
    if (integration.expiresAt && integration.expiresAt <= now) {
      issues.push('Token has expired')
    }
    
    // Check sync errors
    if (integration.syncConfig.errorCount > 0) {
      issues.push(`${integration.syncConfig.errorCount} sync errors`)
    }
    
    // Check last sync age
    const lastSyncAge = integration.syncConfig.lastSyncAt 
      ? now.getTime() - integration.syncConfig.lastSyncAt.getTime()
      : Infinity
    
    const maxSyncAge = integration.syncConfig.syncFrequency * 60 * 60 * 1000 // Convert hours to ms
    if (lastSyncAge > maxSyncAge * 2) { // Overdue by 2x the frequency
      issues.push('Sync is overdue')
    }
    
    return {
      isHealthy: issues.length === 0,
      status: integration.status,
      issues,
      lastSyncAge
    }
  }

  /**
   * Create public-safe integration data
   * Removes sensitive authentication data
   */
  static toPublicIntegration(integration: UserIntegration): Omit<UserIntegration, 'accessToken' | 'refreshToken' | 'scopes'> {
    const { accessToken, refreshToken, scopes, ...publicIntegration } = integration
    return publicIntegration
  }
}

/**
 * Type guard to check if an object is a valid SteamProfile
 */
export function isSteamProfile(obj: any): obj is SteamProfile {
  return obj && 
         typeof obj.steamId === 'string' && 
         typeof obj.personaName === 'string' && 
         typeof obj.profileUrl === 'string'
}

/**
 * Type guard to check if an object is a valid UserIntegration
 */
export function isUserIntegration(obj: any): obj is UserIntegration {
  return obj && 
         typeof obj.id === 'string' && 
         typeof obj.userId === 'string' && 
         typeof obj.platform === 'string' &&
         typeof obj.externalUserId === 'string' &&
         obj.status &&
         obj.syncConfig &&
         obj.permissions
}

/**
 * Helper function to safely convert SteamProfile to UserIntegration
 */
export function safeSteamProfileToIntegration(
  steamProfile: SteamProfile | null | undefined,
  userId: string,
  additionalData?: {
    accessToken?: string
    refreshToken?: string
    expiresAt?: Date
    scopes?: string[]
  }
): UserIntegration | null {
  if (!steamProfile) return null
  
  try {
    return IntegrationAdapter.steamProfileToIntegration(steamProfile, userId, additionalData)
  } catch (error) {
    console.error('Error converting SteamProfile to UserIntegration:', error)
    return null
  }
}

/**
 * Helper function to safely convert UserIntegration to SteamProfile
 */
export function safeIntegrationToSteamProfile(integration: UserIntegration | null | undefined): SteamProfile | null {
  if (!integration) return null
  
  try {
    return IntegrationAdapter.integrationToSteamProfile(integration)
  } catch (error) {
    console.error('Error converting UserIntegration to SteamProfile:', error)
    return null
  }
}
