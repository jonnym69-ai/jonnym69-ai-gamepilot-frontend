"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const authService_1 = require("../auth/authService");
const database_1 = require("../services/database");
const integrationsCatalog_1 = require("../data/integrationsCatalog");
const router = (0, express_1.Router)();
// GET /api/integrations/catalog - Get all available integrations
router.get('/catalog', async (req, res) => {
    try {
        res.json({
            success: true,
            data: integrationsCatalog_1.INTEGRATIONS_CATALOG
        });
    }
    catch (error) {
        console.error('Error fetching integrations catalog:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch integrations catalog',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});
// GET /api/integrations/user - Get user's integrations
router.get('/user', authService_1.authenticateToken, async (req, res) => {
    try {
        const currentUser = (0, authService_1.getCurrentUser)(req);
        if (!currentUser) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        const userIntegrations = await database_1.databaseService.getUserIntegrations(currentUser.id);
        // Transform to simple format for frontend
        const integrationStatuses = userIntegrations.reduce((acc, integration) => {
            acc[integration.platform] = {
                id: integration.id,
                connected: integration.isConnected,
                connectedAt: integration.createdAt,
                lastSync: integration.lastSyncAt
            };
            return acc;
        }, {});
        res.json({
            success: true,
            data: integrationStatuses
        });
    }
    catch (error) {
        console.error('Error fetching user integrations:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user integrations',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});
// POST /api/integrations/connect - Connect an integration
router.post('/connect', authService_1.authenticateToken, async (req, res) => {
    try {
        const currentUser = (0, authService_1.getCurrentUser)(req);
        if (!currentUser) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        const connectSchema = zod_1.z.object({
            platformId: zod_1.z.string().min(1)
        });
        const { platformId } = connectSchema.parse(req.body);
        // Check if platform exists in catalog
        const platform = integrationsCatalog_1.INTEGRATIONS_CATALOG.find(p => p.id === platformId);
        if (!platform) {
            return res.status(400).json({
                success: false,
                error: 'Invalid platform',
                message: `Platform '${platformId}' is not supported`
            });
        }
        // Check if already connected
        const existingIntegration = await database_1.databaseService.getUserIntegration(currentUser.id, platformId);
        if (existingIntegration && existingIntegration.isConnected) {
            return res.status(400).json({
                success: false,
                error: 'Already connected',
                message: `Platform '${platform.name}' is already connected`
            });
        }
        // Create new integration entry (in inactive state - real OAuth flow would activate it)
        const integrationId = `integration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await database_1.databaseService.createUserIntegration({
            id: integrationId,
            userId: currentUser.id,
            platform: platformId, // This would need proper PlatformCode mapping
            externalUserId: '', // Would be filled during OAuth flow
            externalUsername: '', // Would be filled during OAuth flow
        });
        res.json({
            success: true,
            message: `Integration '${platform.name}' initiated. Please complete the OAuth flow.`,
            data: {
                integrationId,
                platform: platform,
                nextStep: 'oauth' // In real implementation, this would redirect to OAuth
            }
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.errors
            });
        }
        console.error('Error connecting integration:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to connect integration',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});
// POST /api/integrations/disconnect - Disconnect an integration
router.post('/disconnect', authService_1.authenticateToken, async (req, res) => {
    try {
        const currentUser = (0, authService_1.getCurrentUser)(req);
        if (!currentUser) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        const disconnectSchema = zod_1.z.object({
            platformId: zod_1.z.string().min(1)
        });
        const { platformId } = disconnectSchema.parse(req.body);
        // Check if platform exists in catalog
        const platform = integrationsCatalog_1.INTEGRATIONS_CATALOG.find(p => p.id === platformId);
        if (!platform) {
            return res.status(400).json({
                success: false,
                error: 'Invalid platform',
                message: `Platform '${platformId}' is not supported`
            });
        }
        // Find and delete the integration
        const integration = await database_1.databaseService.getUserIntegration(currentUser.id, platformId);
        if (!integration) {
            return res.status(404).json({
                success: false,
                error: 'Not found',
                message: `Platform '${platform.name}' is not connected`
            });
        }
        await database_1.databaseService.deleteIntegration(integration.id);
        res.json({
            success: true,
            message: `Successfully disconnected from '${platform.name}'`
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.errors
            });
        }
        console.error('Error disconnecting integration:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to disconnect integration',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});
exports.default = router;
//# sourceMappingURL=integrations.js.map