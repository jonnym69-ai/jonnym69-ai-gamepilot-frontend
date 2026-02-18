// Steam Integration Client - Now uses canonical UserIntegration model
// This client provides Steam API integration with canonical UserIntegration support

import { UserIntegration } from '@gamepilot/shared/models/integration'
import { SteamProfile } from '@gamepilot/shared/models/steamProfile'
import { IntegrationAdapter } from '../adapters/integrationAdapter'

/**
 * Get Steam profile and convert to canonical UserIntegration
 * Now returns canonical UserIntegration
 */
export async function getSteamProfile(userId?: string): Promise<SteamProfile> {
  console.log('🎮 Fetching Steam profile for canonical integration...')
  
  // This is a mock implementation
  // In a real implementation, you would:
  // 1. Get Steam API key from environment variables
  // 2. Make HTTP request to Steam Web API
  // 3. Parse and return the response
  
  const mockProfile = {
    steamId: '76561198000000000',
    personaName: 'GamePilot User',
    profileUrl: 'https://steamcommunity.com/profiles/76561198000000000',
    avatar: 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
    avatarMedium: 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg',
    avatarFull: 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
    personaState: 1, // Online
    personaStateFlags: 0,
    gameExtraInfo: 'Cyberpunk 2077',
    gameId: '1091500'
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  console.log('✅ Steam profile fetched, ready for canonical conversion')
  return mockProfile
}

/**
 * Get Steam profile as canonical UserIntegration
 * New function that returns the canonical UserIntegration model
 */
export async function getSteamIntegration(userId: string, authData?: {
  accessToken?: string
  refreshToken?: string
  expiresAt?: Date
  scopes?: string[]
}): Promise<UserIntegration> {
  console.log('🔄 Converting Steam profile to canonical UserIntegration for user:', userId)
  
  try {
    // Get the Steam profile
    const steamProfile = await getSteamProfile(userId)
    
    // Convert to canonical UserIntegration using the adapter
    const canonicalIntegration = IntegrationAdapter.steamProfileToIntegration(
      steamProfile,
      userId,
      authData
    )
    
    console.log('✅ Steam profile converted to canonical UserIntegration:', canonicalIntegration.id)
    return canonicalIntegration
    
  } catch (error) {
    console.error('❌ Failed to convert Steam profile to canonical UserIntegration:', error)
    throw new Error(`Steam integration conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Migrate legacy Steam integration to canonical UserIntegration
 * Used when upgrading existing Steam integrations to the new model
 */
export function migrateLegacySteamIntegration(
  legacyProfile: any,
  userId: string,
  additionalData?: {
    accessToken?: string
    refreshToken?: string
    expiresAt?: Date
    scopes?: string[]
  }
): UserIntegration {
  console.log('🔄 Migrating legacy Steam integration to canonical UserIntegration')
  console.log('   Legacy Steam ID:', legacyProfile.steamId)
  console.log('   Target User ID:', userId)
  
  // Use the adapter to convert legacy data to canonical format
  const canonicalIntegration = IntegrationAdapter.steamProfileToIntegration(
    legacyProfile,
    userId,
    additionalData
  )
  
  console.log('✅ Legacy Steam integration migrated to canonical format')
  return canonicalIntegration
}

/**
 * Update Steam integration tokens
 * Uses canonical UserIntegration model for token management
 */
export function updateSteamTokens(
  integration: UserIntegration,
  tokenData: {
    accessToken: string
    refreshToken?: string
    expiresAt: Date
  }
): UserIntegration {
  console.log('🔄 Updating Steam integration tokens for:', integration.id)
  
  // Use the adapter to update tokens
  const updatedIntegration = IntegrationAdapter.updateTokens(integration, tokenData)
  
  console.log('✅ Steam integration tokens updated')
  return updatedIntegration
}

/**
 * Update Steam integration status
 * Uses canonical UserIntegration model for status management
 */
export function updateSteamStatus(
  integration: UserIntegration,
  status: 'active' | 'error' | 'expired' | 'revoked',
  errorCount?: number
): UserIntegration {
  console.log('🔄 Updating Steam integration status for:', integration.id)
  console.log('   New status:', status)
  
  // Use the adapter to update status
  const updatedIntegration = IntegrationAdapter.updateStatus(integration, status, errorCount)
  
  console.log('✅ Steam integration status updated')
  return updatedIntegration
}

/**
 * Validate Steam integration
 * Uses canonical UserIntegration model for validation
 */
export function validateSteamIntegration(integration: UserIntegration): {
  isValid: boolean
  errors: string[]
} {
  console.log('🔍 Validating Steam integration:', integration.id)
  
  // Use the adapter for validation
  const validation = IntegrationAdapter.validateForAuth(integration)
  
  // Additional Steam-specific validation
  const steamSpecificErrors: string[] = []
  
  if (integration.platform !== 'steam') {
    steamSpecificErrors.push('Integration platform is not Steam')
  }
  
  if (!integration.externalUserId) {
    steamSpecificErrors.push('Steam ID is missing')
  }
  
  if (!integration.metadata?.steam) {
    steamSpecificErrors.push('Steam metadata is missing')
  }
  
  const allErrors = [...validation.errors, ...steamSpecificErrors]
  const isValid = allErrors.length === 0
  
  console.log('✅ Steam integration validation completed:', isValid ? 'VALID' : 'INVALID')
  if (!isValid) {
    console.log('   Errors:', allErrors)
  }
  
  return { isValid, errors: allErrors }
}
