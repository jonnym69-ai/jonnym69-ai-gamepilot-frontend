import { Router, Request, Response } from 'express'
import { getDiscordProfile, getDiscordIntegration, migrateLegacyDiscordIntegration, updateDiscordTokens, updateDiscordStatus, validateDiscordIntegration, getDiscordGuilds, getDiscordActivity } from '../discord/discordClient'
import { IntegrationAdapter } from '../adapters/integrationAdapter'
import { authenticateToken, getCanonicalUser } from '../identity/identityService'
import { databaseService } from '../services/database'
import type { UserIntegration } from '@gamepilot/shared/models/integration'

const router = Router()

// GET /api/discord/profile
// Now supports both legacy and canonical UserIntegration responses
router.get('/profile', async (req: Request, res: Response) => {
  try {
    console.log('🎮 GET /api/discord/profile - Discord profile requested')
    
    // Check if user is authenticated for enhanced response
    const authUser = (req as any).user
    let canonicalUser = null
    
    if (authUser) {
      canonicalUser = await getCanonicalUser(req)
    }
    
    // Get the Discord profile (legacy format for compatibility)
    const profile = await getDiscordProfile()
    
    // If user is authenticated, also return canonical integration data
    if (canonicalUser) {
      console.log('🔄 Converting to canonical UserIntegration for authenticated user')
      
      // Get canonical integration from REAL database
      let userIntegration = await databaseService.getIntegration(canonicalUser.id, 'discord' as any)
      
      if (!userIntegration) {
        // Create new canonical integration placeholder
        userIntegration = await getDiscordIntegration(canonicalUser.id)
        
        // Save to database
        await databaseService.createIntegration(userIntegration)
        
        console.log('✅ Created new canonical Discord integration in DB for user:', canonicalUser.id)
      } else {
        console.log('✅ Found existing canonical Discord integration in DB for user:', canonicalUser.id)
      }
      
      // Return enhanced response with both legacy and canonical data
      return res.json({
        // Legacy profile data for backward compatibility
        legacy: profile,
        
        // Canonical integration data
        canonical: userIntegration ? {
          id: userIntegration.id,
          platform: userIntegration.platform,
          externalUserId: userIntegration.externalUserId,
          externalUsername: userIntegration.externalUsername,
          status: userIntegration.status,
          isActive: userIntegration.isActive,
          isConnected: userIntegration.isConnected,
          createdAt: userIntegration.createdAt,
          lastSyncAt: userIntegration.lastSyncAt,
          metadata: userIntegration.metadata,
          scopes: userIntegration.scopes
        } : null,
        
        // Integration health status
        health: userIntegration ? IntegrationAdapter.getHealthStatus(userIntegration) : null,
        
        // Token refresh status
        needsRefresh: userIntegration ? IntegrationAdapter.needsTokenRefresh(userIntegration) : null
      })
    }
    
    // Return legacy profile only for unauthenticated requests
    console.log('📄 Returning legacy Discord profile for unauthenticated request')
    res.json(profile)
    
  } catch (error) {
    console.error('❌ Error fetching Discord profile:', error)
    res.status(500).json({ 
      error: 'Failed to fetch Discord profile',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// POST /api/discord/connect
// New endpoint for connecting Discord accounts using canonical UserIntegration
router.post('/connect', authenticateToken, async (req: Request, res: Response) => {
  try {
    console.log('🔗 POST /api/discord/connect - Discord connection requested')
    
    const canonicalUser = await getCanonicalUser(req)
    if (!canonicalUser) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User must be authenticated to connect Discord account'
      })
    }
    
    const { discordId, accessToken, refreshToken, expiresAt, scopes } = req.body
    
    if (!discordId) {
      return res.status(400).json({
        error: 'Missing Discord ID',
        message: 'Discord ID is required for connection'
      })
    }
    
    console.log('🔄 Connecting Discord account for user:', canonicalUser.id)
    console.log('   Discord ID:', discordId)
    
    // Create canonical UserIntegration
    const discordIntegration = await getDiscordIntegration(canonicalUser.id, {
      accessToken,
      refreshToken,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      scopes: scopes || []
    })
    
    // Validate the integration
    const validation = validateDiscordIntegration(discordIntegration)
    if (!validation.isValid) {
      console.log('❌ Discord integration validation failed:', validation.errors)
      return res.status(400).json({
        error: 'Invalid Discord integration',
        message: validation.errors.join(', ')
      })
    }
    
    // Save to real database
    const existing = await databaseService.getIntegration(canonicalUser.id, 'discord' as any)
    if (existing) {
      await databaseService.updateIntegration(existing.id, discordIntegration)
    } else {
      await databaseService.createIntegration(discordIntegration)
    }
    
    console.log('✅ Discord account connected successfully')
    console.log('   Integration ID:', discordIntegration.id)
    
    res.status(201).json({
      success: true,
      message: 'Discord account connected successfully',
      integration: {
        id: discordIntegration.id,
        platform: discordIntegration.platform,
        externalUserId: discordIntegration.externalUserId,
        externalUsername: discordIntegration.externalUsername,
        status: discordIntegration.status,
        isActive: discordIntegration.isActive,
        isConnected: discordIntegration.isConnected,
        createdAt: discordIntegration.createdAt,
        lastSyncAt: discordIntegration.lastSyncAt,
        metadata: discordIntegration.metadata
      }
    })
    
  } catch (error) {
    console.error('❌ Error connecting Discord account:', error)
    res.status(500).json({ 
      error: 'Failed to connect Discord account',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// GET /api/discord/guilds
// Get Discord guilds for authenticated user
router.get('/guilds', authenticateToken, async (req: Request, res: Response) => {
  try {
    console.log('🏛️ GET /api/discord/guilds - Discord guilds requested')
    
    const canonicalUser = await getCanonicalUser(req)
    if (!canonicalUser) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User must be authenticated to access Discord guilds'
      })
    }
    
    // Check if user has Discord integration
    const userIntegrationsList = await databaseService.getUserIntegrations(canonicalUser.id)
    const userIntegration = userIntegrationsList.find((i: UserIntegration) => i.platform === 'discord')
    
    if (!userIntegration || !userIntegration.isActive) {
      console.log('❌ No active Discord integration found')
      return res.status(403).json({
        error: 'Discord integration required',
        message: 'Please connect your Discord account first'
      })
    }
    
    console.log('🔄 Fetching Discord guilds for user:', canonicalUser.id)
    
    // Get Discord guilds
    const guilds = await getDiscordGuilds(canonicalUser.id)
    
    // Update last sync time
    const updatedIntegration = updateDiscordStatus(userIntegration, 'active')
    
    // Update stored integration
    const integrations = await databaseService.getUserIntegrations(canonicalUser.id)
    const integrationIndex = integrations.findIndex((i: UserIntegration) => i.id === updatedIntegration.id)
    if (integrationIndex !== -1) {
      integrations[integrationIndex] = updatedIntegration
      await databaseService.updateIntegration(updatedIntegration.id, updatedIntegration)
    }
    
    console.log('✅ Retrieved', guilds.length, 'Discord guilds')
    
    res.json({
      success: true,
      guilds,
      integration: {
        id: updatedIntegration.id,
        status: updatedIntegration.status,
        lastSyncAt: updatedIntegration.lastSyncAt,
        scopes: updatedIntegration.scopes
      }
    })
    
  } catch (error) {
    console.error('❌ Error fetching Discord guilds:', error)
    res.status(500).json({ 
      error: 'Failed to fetch Discord guilds',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// GET /api/discord/activity
// Get Discord activity for authenticated user
router.get('/activity', authenticateToken, async (req: Request, res: Response) => {
  try {
    console.log('📊 GET /api/discord/activity - Discord activity requested')
    
    const canonicalUser = await getCanonicalUser(req)
    if (!canonicalUser) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User must be authenticated to access Discord activity'
      })
    }
    
    // Check if user has Discord integration
    const userIntegrationsList = await databaseService.getUserIntegrations(canonicalUser.id)
    const userIntegration = userIntegrationsList.find((i: UserIntegration) => i.platform === 'discord')
    
    if (!userIntegration || !userIntegration.isActive) {
      console.log('❌ No active Discord integration found')
      return res.status(403).json({
        error: 'Discord integration required',
        message: 'Please connect your Discord account first'
      })
    }
    
    console.log('🔄 Fetching Discord activity for user:', canonicalUser.id)
    
    // Get Discord activity
    const activity = await getDiscordActivity(canonicalUser.id)
    
    console.log('✅ Retrieved Discord activity for user')
    
    res.json({
      success: true,
      activity,
      integration: {
        id: userIntegration.id,
        status: userIntegration.status,
        lastSyncAt: userIntegration.lastSyncAt,
        scopes: userIntegration.scopes
      }
    })
    
  } catch (error) {
    console.error('❌ Error fetching Discord activity:', error)
    res.status(500).json({ 
      error: 'Failed to fetch Discord activity',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// POST /api/discord/refresh
// Refresh Discord integration tokens using canonical UserIntegration
router.post('/refresh', authenticateToken, async (req: Request, res: Response) => {
  try {
    console.log('🔄 POST /api/discord/refresh - Discord token refresh requested')
    
    const canonicalUser = await getCanonicalUser(req)
    if (!canonicalUser) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User must be authenticated to refresh Discord tokens'
      })
    }
    
    const { accessToken, refreshToken, expiresAt } = req.body
    
    if (!accessToken) {
      return res.status(400).json({
        error: 'Missing access token',
        message: 'Access token is required for refresh'
      })
    }
    
    // Get user's Discord integration
    const userIntegrationsList = await databaseService.getUserIntegrations(canonicalUser.id) || []
    const discordIntegration = userIntegrationsList.find((i: UserIntegration) => i.platform === 'discord')
    
    if (!discordIntegration) {
      return res.status(404).json({
        error: 'Discord integration not found',
        message: 'User does not have a connected Discord account'
      })
    }
    
    console.log('🔄 Refreshing tokens for Discord integration:', discordIntegration.id)
    
    // Update tokens using canonical model
    const updatedIntegration = updateDiscordTokens(discordIntegration, {
      accessToken,
      refreshToken,
      expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 3600000) // Default 1 hour
    })
    
    // Update stored integration
    const integrationIndex = userIntegrationsList.findIndex((i: UserIntegration) => i.id === updatedIntegration.id)
    if (integrationIndex !== -1) {
      userIntegrationsList[integrationIndex] = updatedIntegration
      await databaseService.updateIntegration(updatedIntegration.id, updatedIntegration)
    }
    
    console.log('✅ Discord tokens refreshed successfully')
    
    res.json({
      success: true,
      message: 'Discord tokens refreshed successfully',
      integration: {
        id: updatedIntegration.id,
        status: updatedIntegration.status,
        expiresAt: updatedIntegration.expiresAt,
        lastSyncAt: updatedIntegration.lastSyncAt,
        needsRefresh: IntegrationAdapter.needsTokenRefresh(updatedIntegration)
      }
    })
    
  } catch (error) {
    console.error('❌ Error refreshing Discord tokens:', error)
    res.status(500).json({ 
      error: 'Failed to refresh Discord tokens',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// POST /api/discord/status
// Update Discord integration status using canonical UserIntegration
router.post('/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    console.log('🔄 POST /api/discord/status - Discord status update requested')
    
    const canonicalUser = await getCanonicalUser(req)
    if (!canonicalUser) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User must be authenticated to update Discord status'
      })
    }
    
    const { status, errorCount } = req.body
    
    if (!status || !['active', 'error', 'expired', 'revoked'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Status must be one of: active, error, expired, revoked'
      })
    }
    
    // Get user's Discord integration
    const userIntegrationsList = await databaseService.getUserIntegrations(canonicalUser.id) || []
    const discordIntegration = userIntegrationsList.find((i: UserIntegration) => i.platform === 'discord')
    
    if (!discordIntegration) {
      return res.status(404).json({
        error: 'Discord integration not found',
        message: 'User does not have a connected Discord account'
      })
    }
    
    console.log('🔄 Updating Discord integration status to:', status)
    
    // Update status using canonical model
    const updatedIntegration = updateDiscordStatus(discordIntegration, status as any, errorCount)
    
    // Update stored integration
    const integrationIndex = userIntegrationsList.findIndex((i: UserIntegration) => i.id === updatedIntegration.id)
    if (integrationIndex !== -1) {
      userIntegrationsList[integrationIndex] = updatedIntegration
      await databaseService.updateIntegration(updatedIntegration.id, updatedIntegration)
    }
    
    console.log('✅ Discord integration status updated successfully')
    
    res.json({
      success: true,
      message: 'Discord integration status updated successfully',
      integration: {
        id: updatedIntegration.id,
        status: updatedIntegration.status,
        isActive: updatedIntegration.isActive,
        isConnected: updatedIntegration.isConnected,
        lastSyncAt: updatedIntegration.lastSyncAt,
        health: IntegrationAdapter.getHealthStatus(updatedIntegration)
      }
    })
    
  } catch (error) {
    console.error('❌ Error updating Discord status:', error)
    res.status(500).json({ 
      error: 'Failed to update Discord status',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// DELETE /api/discord/disconnect
// Disconnect Discord account using canonical UserIntegration
router.delete('/disconnect', authenticateToken, async (req: Request, res: Response) => {
  try {
    console.log('🔌 DELETE /api/discord/disconnect - Discord disconnection requested')
    
    const canonicalUser = await getCanonicalUser(req)
    if (!canonicalUser) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User must be authenticated to disconnect Discord account'
      })
    }
    
    // Get user's Discord integration
    const userIntegrationsList = await databaseService.getUserIntegrations(canonicalUser.id) || []
    const discordIntegration = userIntegrationsList.find((i: UserIntegration) => i.platform === 'discord')
    
    if (!discordIntegration) {
      return res.status(404).json({
        error: 'Discord integration not found',
        message: 'User does not have a connected Discord account'
      })
    }
    
    console.log('🔌 Disconnecting Discord integration:', discordIntegration.id)
    
    // Remove Discord integration from user's integrations
    await databaseService.deleteIntegration(discordIntegration.id)
    
    console.log('✅ Discord account disconnected successfully')
    
    res.json({
      success: true,
      message: 'Discord account disconnected successfully',
      disconnectedIntegration: {
        id: discordIntegration.id,
        platform: discordIntegration.platform,
        externalUserId: discordIntegration.externalUserId,
        externalUsername: discordIntegration.externalUsername
      }
    })
    
  } catch (error) {
    console.error('❌ Error disconnecting Discord account:', error)
    res.status(500).json({ 
      error: 'Failed to disconnect Discord account',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router
