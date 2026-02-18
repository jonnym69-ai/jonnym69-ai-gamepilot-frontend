// Discord Integration Client - Now uses canonical UserIntegration model
// This client provides Discord API integration with canonical UserIntegration support

import { UserIntegration } from '@gamepilot/shared/models/integration'
import { IntegrationAdapter } from '../adapters/integrationAdapter'

/**
 * Get Discord profile and convert to canonical UserIntegration
 * Now returns canonical UserIntegration
 */
export async function getDiscordProfile(userId?: string): Promise<any> {
  console.log('🎮 Fetching Discord profile for canonical integration...')
  
  // This is a mock implementation
  // In a real implementation, you would:
  // 1. Get Discord API key from environment variables
  // 2. Make HTTP request to Discord API
  // 3. Parse and return the response
  
  const mockProfile = {
    id: '123456789012345678',
    username: 'GamePilotUser',
    discriminator: '1234',
    avatar: 'abcdef123456',
    bot: false,
    mfaEnabled: false,
    verified: true,
    email: 'user@example.com',
    flags: 0,
    premiumType: 0,
    publicFlags: 0,
    avatarDecoration: undefined,
    banner: undefined,
    accentColor: 5814783,
    globalName: 'GamePilot User',
    avatarUrl: 'https://cdn.discordapp.com/avatars/123456789012345678/abcdef123456.png',
    bannerUrl: undefined
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  console.log('✅ Discord profile fetched, ready for canonical conversion')
  return mockProfile
}

/**
 * Get Discord profile as canonical UserIntegration
 * New function that returns the canonical UserIntegration model
 */
export async function getDiscordIntegration(userId: string, authData?: {
  accessToken?: string
  refreshToken?: string
  expiresAt?: Date
  scopes?: string[]
}): Promise<UserIntegration> {
  console.log('🔄 Converting Discord profile to canonical UserIntegration for user:', userId)
  
  try {
    // Get the Discord profile
    const discordProfile = await getDiscordProfile(userId)
    
    // Convert to canonical UserIntegration using the adapter
    const canonicalIntegration = IntegrationAdapter.fromConnectionData(
      'discord',
      userId,
      discordProfile.id,
      discordProfile.username,
      authData || {}
    )
    
    // Add Discord-specific metadata
    canonicalIntegration.metadata!.discord = {
      id: discordProfile.id,
      username: discordProfile.username,
      discriminator: discordProfile.discriminator,
      avatar: discordProfile.avatar,
      bot: discordProfile.bot,
      verified: discordProfile.verified,
      email: discordProfile.email,
      flags: discordProfile.flags,
      premiumType: discordProfile.premiumType,
      globalName: discordProfile.globalName,
      avatarUrl: discordProfile.avatarUrl,
      bannerUrl: discordProfile.bannerUrl,
      accentColor: discordProfile.accentColor
    }
    
    console.log('✅ Discord profile converted to canonical UserIntegration:', canonicalIntegration.id)
    return canonicalIntegration
    
  } catch (error) {
    console.error('❌ Failed to convert Discord profile to canonical UserIntegration:', error)
    throw new Error(`Discord integration conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Migrate legacy Discord integration to canonical UserIntegration
 * Used when upgrading existing Discord integrations to the new model
 */
export function migrateLegacyDiscordIntegration(
  legacyProfile: any,
  userId: string,
  additionalData?: {
    accessToken?: string
    refreshToken?: string
    expiresAt?: Date
    scopes?: string[]
  }
): UserIntegration {
  console.log('🔄 Migrating legacy Discord integration to canonical UserIntegration')
  console.log('   Legacy Discord ID:', legacyProfile.id)
  console.log('   Target User ID:', userId)
  
  // Use the adapter to convert legacy data to canonical format
  const canonicalIntegration = IntegrationAdapter.fromConnectionData(
    'discord',
    userId,
    legacyProfile.id,
    legacyProfile.username,
    additionalData || {}
  )
  
  // Add Discord-specific metadata
  canonicalIntegration.metadata!.discord = {
    id: legacyProfile.id,
    username: legacyProfile.username,
    discriminator: legacyProfile.discriminator,
    avatar: legacyProfile.avatar,
    bot: legacyProfile.bot,
    verified: legacyProfile.verified,
    email: legacyProfile.email,
    flags: legacyProfile.flags,
    premiumType: legacyProfile.premiumType,
    globalName: legacyProfile.globalName,
    avatarUrl: legacyProfile.avatarUrl,
    bannerUrl: legacyProfile.bannerUrl,
    accentColor: legacyProfile.accentColor
  }
  
  console.log('✅ Legacy Discord integration migrated to canonical format')
  return canonicalIntegration
}

/**
 * Update Discord integration tokens
 * Uses canonical UserIntegration model for token management
 */
export function updateDiscordTokens(
  integration: UserIntegration,
  tokenData: {
    accessToken: string
    refreshToken?: string
    expiresAt: Date
  }
): UserIntegration {
  console.log('🔄 Updating Discord integration tokens for:', integration.id)
  
  // Use the adapter to update tokens
  const updatedIntegration = IntegrationAdapter.updateTokens(integration, tokenData)
  
  console.log('✅ Discord integration tokens updated')
  return updatedIntegration
}

/**
 * Update Discord integration status
 * Uses canonical UserIntegration model for status management
 */
export function updateDiscordStatus(
  integration: UserIntegration,
  status: 'active' | 'error' | 'expired' | 'revoked',
  errorCount?: number
): UserIntegration {
  console.log('🔄 Updating Discord integration status for:', integration.id)
  console.log('   New status:', status)
  
  // Use the adapter to update status
  const updatedIntegration = IntegrationAdapter.updateStatus(integration, status, errorCount)
  
  console.log('✅ Discord integration status updated')
  return updatedIntegration
}

/**
 * Validate Discord integration
 * Uses canonical UserIntegration model for validation
 */
export function validateDiscordIntegration(integration: UserIntegration): {
  isValid: boolean
  errors: string[]
} {
  console.log('🔍 Validating Discord integration:', integration.id)
  
  // Use the adapter for validation
  const validation = IntegrationAdapter.validateForAuth(integration)
  
  // Additional Discord-specific validation
  const discordSpecificErrors: string[] = []
  
  if (integration.platform !== 'discord') {
    discordSpecificErrors.push('Integration platform is not Discord')
  }
  
  if (!integration.externalUserId) {
    discordSpecificErrors.push('Discord ID is missing')
  }
  
  if (!integration.metadata?.discord) {
    discordSpecificErrors.push('Discord metadata is missing')
  }
  
  const allErrors = [...validation.errors, ...discordSpecificErrors]
  const isValid = allErrors.length === 0
  
  console.log('✅ Discord integration validation completed:', isValid ? 'VALID' : 'INVALID')
  if (!isValid) {
    console.log('   Errors:', allErrors)
  }
  
  return { isValid, errors: allErrors }
}

/**
 * Get Discord guilds for user
 * Uses canonical UserIntegration model for user context
 */
export async function getDiscordGuilds(userId: string): Promise<any[]> {
  console.log('🏛️ Getting Discord guilds for user:', userId)
  
  // Mock guild data - in production this would fetch from Discord API
  const mockGuilds = [
    {
      id: '123456789012345678',
      name: 'GamePilot Community',
      icon: 'https://cdn.discordapp.com/icons/123456789012345678/abcdef123456.png',
      owner: false,
      permissions: '8',
      features: ['COMMUNITY', 'NEWS', 'WELCOME_SCREEN_ENABLED']
    },
    {
      id: '987654321098765432',
      name: 'Gaming Hub',
      icon: 'https://cdn.discordapp.com/icons/987654321098765432/fedcba654321.png',
      owner: false,
      permissions: '68608',
      features: ['COMMUNITY', 'NEWS']
    }
  ]
  
  console.log('✅ Retrieved', mockGuilds.length, 'Discord guilds')
  return mockGuilds
}

/**
 * Get Discord user activity
 * Uses canonical UserIntegration model for user context
 */
export async function getDiscordActivity(userId: string): Promise<any[]> {
  console.log('📊 Getting Discord activity for user:', userId)
  
  // Mock activity data - in production this would fetch from Discord API
  const mockActivity = [
    {
      id: '123456789012345678',
      name: 'Playing Cyberpunk 2077',
      type: 0, // Playing
      timestamps: {
        start: new Date(Date.now() - 3600000),
        end: null
      },
      application_id: '123456789012345678',
      details: 'Night City',
      state: 'In the middle of a mission',
      emoji: null,
      party: null,
      assets: {
        large_image: 'cyberpunk2077',
        large_text: 'Cyberpunk 2077'
      },
      secrets: null,
      instance: true,
      flags: 0
    }
  ]
  
  console.log('✅ Retrieved Discord activity for user')
  return mockActivity
}
