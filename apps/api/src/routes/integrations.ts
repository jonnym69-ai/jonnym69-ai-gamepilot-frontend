import { Router } from 'express'
import { z } from 'zod'
import { authenticateToken, getCurrentUser } from '../auth/authService'
import { databaseService } from '../services/database'
import { INTEGRATIONS_CATALOG } from '../data/integrationsCatalog'

const router = Router()

// GET /api/integrations/catalog - Get all available integrations
router.get('/catalog', async (req, res) => {
  try {
    res.json({
      success: true,
      data: INTEGRATIONS_CATALOG
    })
  } catch (error) {
    console.error('Error fetching integrations catalog:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch integrations catalog',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
})

// GET /api/integrations/user - Get user's integrations
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req)
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
    }

    const userIntegrations = await databaseService.getUserIntegrations(currentUser.id)
    
    // Transform to simple format for frontend
    const integrationStatuses = userIntegrations.reduce((acc, integration) => {
      acc[integration.platform] = {
        id: integration.id,
        connected: integration.isConnected,
        connectedAt: integration.createdAt,
        lastSync: integration.lastSyncAt
      }
      return acc
    }, {} as Record<string, any>)

    res.json({
      success: true,
      data: integrationStatuses
    })
  } catch (error) {
    console.error('Error fetching user integrations:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user integrations',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
})

// POST /api/integrations/connect - Connect an integration
router.post('/connect', authenticateToken, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req)
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
    }

    const connectSchema = z.object({
      platformId: z.string().min(1)
    })

    const { platformId } = connectSchema.parse(req.body)

    // Check if platform exists in catalog
    const platform = INTEGRATIONS_CATALOG.find(p => p.id === platformId)
    if (!platform) {
      return res.status(400).json({
        success: false,
        error: 'Invalid platform',
        message: `Platform '${platformId}' is not supported`
      })
    }

    // Check if already connected
    const existingIntegration = await databaseService.getUserIntegration(currentUser.id, platformId)
    if (existingIntegration && existingIntegration.isConnected) {
      return res.status(400).json({
        success: false,
        error: 'Already connected',
        message: `Platform '${platform.name}' is already connected`
      })
    }

    // Create new integration entry (in inactive state - real OAuth flow would activate it)
    const integrationId = `integration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    await databaseService.createUserIntegration({
      id: integrationId,
      userId: currentUser.id,
      platform: platformId as any, // This would need proper PlatformCode mapping
      externalUserId: '', // Would be filled during OAuth flow
      externalUsername: '', // Would be filled during OAuth flow
    })

    res.json({
      success: true,
      message: `Integration '${platform.name}' initiated. Please complete the OAuth flow.`,
      data: {
        integrationId,
        platform: platform,
        nextStep: 'oauth' // In real implementation, this would redirect to OAuth
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    
    console.error('Error connecting integration:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to connect integration',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
})

// POST /api/integrations/disconnect - Disconnect an integration
router.post('/disconnect', authenticateToken, async (req, res) => {
  try {
    const currentUser = getCurrentUser(req)
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
    }

    const disconnectSchema = z.object({
      platformId: z.string().min(1)
    })

    const { platformId } = disconnectSchema.parse(req.body)

    // Check if platform exists in catalog
    const platform = INTEGRATIONS_CATALOG.find(p => p.id === platformId)
    if (!platform) {
      return res.status(400).json({
        success: false,
        error: 'Invalid platform',
        message: `Platform '${platformId}' is not supported`
      })
    }

    // Find and delete the integration
    const integration = await databaseService.getUserIntegration(currentUser.id, platformId)
    if (!integration) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: `Platform '${platform.name}' is not connected`
      })
    }

    await databaseService.deleteIntegration(integration.id)

    res.json({
      success: true,
      message: `Successfully disconnected from '${platform.name}'`
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    
    console.error('Error disconnecting integration:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to disconnect integration',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
})

export default router
