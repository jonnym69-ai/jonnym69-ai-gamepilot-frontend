"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const youtubeClient_1 = require("../youtube/youtubeClient");
const integrationAdapter_1 = require("../adapters/integrationAdapter");
const identityService_1 = require("../identity/identityService");
const shared_1 = require("@gamepilot/shared");
const router = (0, express_1.Router)();
// Mock storage for user integrations (in production, this would be a database)
const userIntegrations = new Map();
// GET /api/youtube/profile
// Now supports both legacy and canonical UserIntegration responses
router.get('/profile', async (req, res) => {
    try {
        console.log('🎥 GET /api/youtube/profile - YouTube profile requested');
        // Check if user is authenticated for enhanced response
        const authUser = req.user;
        let canonicalUser = null;
        if (authUser) {
            canonicalUser = await (0, identityService_1.getCanonicalUser)(req);
        }
        // Get the YouTube profile (legacy format for compatibility)
        const profile = await (0, youtubeClient_1.getYouTubeProfile)();
        // If user is authenticated, also return canonical integration data
        if (canonicalUser) {
            console.log('🔄 Converting to canonical UserIntegration for authenticated user');
            // Get or create canonical integration
            let userIntegration = userIntegrations.get(canonicalUser.id)?.find(i => i.platform === 'youtube');
            if (!userIntegration) {
                // Create new canonical integration
                userIntegration = await (0, youtubeClient_1.getYouTubeIntegration)(canonicalUser.id);
                // Store the integration
                const existingIntegrations = userIntegrations.get(canonicalUser.id) || [];
                existingIntegrations.push(userIntegration);
                userIntegrations.set(canonicalUser.id, existingIntegrations);
                console.log('✅ Created new canonical YouTube integration for user:', canonicalUser.id);
            }
            else {
                console.log('✅ Found existing canonical YouTube integration for user:', canonicalUser.id);
            }
            // Return enhanced response with both legacy and canonical data
            return res.json({
                // Legacy profile data for backward compatibility
                legacy: profile,
                // Canonical integration data
                canonical: {
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
                },
                // Integration health status
                health: integrationAdapter_1.IntegrationAdapter.getHealthStatus(userIntegration),
                // Token refresh status
                needsRefresh: integrationAdapter_1.IntegrationAdapter.needsTokenRefresh(userIntegration)
            });
        }
        // Return legacy profile only for unauthenticated requests
        console.log('📄 Returning legacy YouTube profile for unauthenticated request');
        res.json(profile);
    }
    catch (error) {
        console.error('❌ Error fetching YouTube profile:', error);
        res.status(500).json({
            error: 'Failed to fetch YouTube profile',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// POST /api/youtube/connect
// New endpoint for connecting YouTube accounts using canonical UserIntegration
router.post('/connect', identityService_1.authenticateToken, async (req, res) => {
    try {
        console.log('🔗 POST /api/youtube/connect - YouTube connection requested');
        const canonicalUser = await (0, identityService_1.getCanonicalUser)(req);
        if (!canonicalUser) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'User must be authenticated to connect YouTube account'
            });
        }
        const { channelId, accessToken, refreshToken, expiresAt, scopes } = req.body;
        if (!channelId) {
            return res.status(400).json({
                error: 'Missing YouTube channel ID',
                message: 'YouTube channel ID is required for connection'
            });
        }
        console.log('🔄 Connecting YouTube account for user:', canonicalUser.id);
        console.log('   YouTube channel ID:', channelId);
        // Create canonical UserIntegration
        const youtubeIntegration = await (0, youtubeClient_1.getYouTubeIntegration)(canonicalUser.id, {
            accessToken,
            refreshToken,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
            scopes: scopes || []
        });
        // Validate the integration
        const validation = (0, youtubeClient_1.validateYouTubeIntegration)(youtubeIntegration);
        if (!validation.isValid) {
            console.log('❌ YouTube integration validation failed:', validation.errors);
            return res.status(400).json({
                error: 'Invalid YouTube integration',
                message: validation.errors.join(', ')
            });
        }
        // Store the integration
        const existingIntegrations = userIntegrations.get(canonicalUser.id) || [];
        // Remove existing YouTube integration if any
        const filteredIntegrations = existingIntegrations.filter(i => i.platform !== 'youtube');
        filteredIntegrations.push(youtubeIntegration);
        userIntegrations.set(canonicalUser.id, filteredIntegrations);
        console.log('✅ YouTube account connected successfully');
        console.log('   Integration ID:', youtubeIntegration.id);
        res.status(201).json({
            success: true,
            message: 'YouTube account connected successfully',
            integration: {
                id: youtubeIntegration.id,
                platform: youtubeIntegration.platform,
                externalUserId: youtubeIntegration.externalUserId,
                externalUsername: youtubeIntegration.externalUsername,
                status: youtubeIntegration.status,
                isActive: youtubeIntegration.isActive,
                isConnected: youtubeIntegration.isConnected,
                createdAt: youtubeIntegration.createdAt,
                lastSyncAt: youtubeIntegration.lastSyncAt,
                metadata: youtubeIntegration.metadata
            }
        });
    }
    catch (error) {
        console.error('❌ Error connecting YouTube account:', error);
        res.status(500).json({
            error: 'Failed to connect YouTube account',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// GET /api/youtube/videos
// Get YouTube videos for authenticated user
router.get('/videos', identityService_1.authenticateToken, async (req, res) => {
    try {
        console.log('🎥 GET /api/youtube/videos - YouTube videos requested');
        const canonicalUser = await (0, identityService_1.getCanonicalUser)(req);
        if (!canonicalUser) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'User must be authenticated to access YouTube videos'
            });
        }
        // Check if user has YouTube integration
        const userIntegration = userIntegrations.get(canonicalUser.id)?.find(i => i.platform === shared_1.PlatformCode.YOUTUBE);
        if (!userIntegration || !userIntegration.isActive) {
            console.log('❌ No active YouTube integration found');
            return res.status(403).json({
                error: 'YouTube integration required',
                message: 'Please connect your YouTube account first'
            });
        }
        const { maxResults = 10 } = req.query;
        console.log('🔄 Fetching YouTube videos for user:', canonicalUser.id);
        console.log('   Max results:', maxResults);
        // Get YouTube videos
        const videos = await (0, youtubeClient_1.getYouTubeVideos)(canonicalUser.id, parseInt(maxResults));
        // Update last sync time
        const updatedIntegration = (0, youtubeClient_1.updateYouTubeStatus)(userIntegration, 'active');
        // Update stored integration
        const integrations = userIntegrations.get(canonicalUser.id) || [];
        const integrationIndex = integrations.findIndex(i => i.id === updatedIntegration.id);
        if (integrationIndex !== -1) {
            integrations[integrationIndex] = updatedIntegration;
            userIntegrations.set(canonicalUser.id, integrations);
        }
        console.log('✅ Retrieved', videos.length, 'YouTube videos');
        res.json({
            success: true,
            videos,
            integration: {
                id: updatedIntegration.id,
                status: updatedIntegration.status,
                lastSyncAt: updatedIntegration.lastSyncAt,
                scopes: updatedIntegration.scopes
            }
        });
    }
    catch (error) {
        console.error('❌ Error fetching YouTube videos:', error);
        res.status(500).json({
            error: 'Failed to fetch YouTube videos',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// GET /api/youtube/search
// Search YouTube videos for gaming content
router.get('/search', identityService_1.authenticateToken, async (req, res) => {
    try {
        console.log('🔍 GET /api/youtube/search - YouTube search requested');
        const canonicalUser = await (0, identityService_1.getCanonicalUser)(req);
        if (!canonicalUser) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'User must be authenticated to search YouTube videos'
            });
        }
        // Check if user has YouTube integration
        const userIntegration = userIntegrations.get(canonicalUser.id)?.find(i => i.platform === shared_1.PlatformCode.YOUTUBE);
        if (!userIntegration || !userIntegration.isActive) {
            console.log('❌ No active YouTube integration found');
            return res.status(403).json({
                error: 'YouTube integration required',
                message: 'Please connect your YouTube account first'
            });
        }
        const { q: query, maxResults = 10 } = req.query;
        if (!query) {
            return res.status(400).json({
                error: 'Missing query parameter',
                message: 'Search query is required'
            });
        }
        console.log('🔄 Searching YouTube videos for user:', canonicalUser.id);
        console.log('   Query:', query);
        console.log('   Max results:', maxResults);
        // Search YouTube videos
        const searchResults = await (0, youtubeClient_1.searchYouTubeVideos)(canonicalUser.id, query, parseInt(maxResults));
        console.log('✅ Search returned', searchResults.length, 'results');
        res.json({
            success: true,
            query,
            results: searchResults,
            integration: {
                id: userIntegration.id,
                status: userIntegration.status,
                lastSyncAt: userIntegration.lastSyncAt,
                scopes: userIntegration.scopes
            }
        });
    }
    catch (error) {
        console.error('❌ Error searching YouTube videos:', error);
        res.status(500).json({
            error: 'Failed to search YouTube videos',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// POST /api/youtube/refresh
// Refresh YouTube integration tokens using canonical UserIntegration
router.post('/refresh', identityService_1.authenticateToken, async (req, res) => {
    try {
        console.log('🔄 POST /api/youtube/refresh - YouTube token refresh requested');
        const canonicalUser = await (0, identityService_1.getCanonicalUser)(req);
        if (!canonicalUser) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'User must be authenticated to refresh YouTube tokens'
            });
        }
        const { accessToken, refreshToken, expiresAt } = req.body;
        if (!accessToken) {
            return res.status(400).json({
                error: 'Missing access token',
                message: 'Access token is required for refresh'
            });
        }
        // Get user's YouTube integration
        const userIntegrationsList = userIntegrations.get(canonicalUser.id) || [];
        const youtubeIntegration = userIntegrationsList.find(i => i.platform === 'youtube');
        if (!youtubeIntegration) {
            return res.status(404).json({
                error: 'YouTube integration not found',
                message: 'User does not have a connected YouTube account'
            });
        }
        console.log('🔄 Refreshing tokens for YouTube integration:', youtubeIntegration.id);
        // Update tokens using canonical model
        const updatedIntegration = (0, youtubeClient_1.updateYouTubeTokens)(youtubeIntegration, {
            accessToken,
            refreshToken,
            expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 3600000) // Default 1 hour
        });
        // Update stored integration
        const integrationIndex = userIntegrationsList.findIndex(i => i.id === updatedIntegration.id);
        if (integrationIndex !== -1) {
            userIntegrationsList[integrationIndex] = updatedIntegration;
            userIntegrations.set(canonicalUser.id, userIntegrationsList);
        }
        console.log('✅ YouTube tokens refreshed successfully');
        res.json({
            success: true,
            message: 'YouTube tokens refreshed successfully',
            integration: {
                id: updatedIntegration.id,
                status: updatedIntegration.status,
                expiresAt: updatedIntegration.expiresAt,
                lastSyncAt: updatedIntegration.lastSyncAt,
                needsRefresh: integrationAdapter_1.IntegrationAdapter.needsTokenRefresh(updatedIntegration)
            }
        });
    }
    catch (error) {
        console.error('❌ Error refreshing YouTube tokens:', error);
        res.status(500).json({
            error: 'Failed to refresh YouTube tokens',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// POST /api/youtube/status
// Update YouTube integration status using canonical UserIntegration
router.post('/status', identityService_1.authenticateToken, async (req, res) => {
    try {
        console.log('🔄 POST /api/youtube/status - YouTube status update requested');
        const canonicalUser = await (0, identityService_1.getCanonicalUser)(req);
        if (!canonicalUser) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'User must be authenticated to update YouTube status'
            });
        }
        const { status, errorCount } = req.body;
        if (!status || !['active', 'error', 'expired', 'revoked'].includes(status)) {
            return res.status(400).json({
                error: 'Invalid status',
                message: 'Status must be one of: active, error, expired, revoked'
            });
        }
        // Get user's YouTube integration
        const userIntegrationsList = userIntegrations.get(canonicalUser.id) || [];
        const youtubeIntegration = userIntegrationsList.find(i => i.platform === 'youtube');
        if (!youtubeIntegration) {
            return res.status(404).json({
                error: 'YouTube integration not found',
                message: 'User does not have a connected YouTube account'
            });
        }
        console.log('🔄 Updating YouTube integration status to:', status);
        // Update status using canonical model
        const updatedIntegration = (0, youtubeClient_1.updateYouTubeStatus)(youtubeIntegration, status, errorCount);
        // Update stored integration
        const integrationIndex = userIntegrationsList.findIndex(i => i.id === updatedIntegration.id);
        if (integrationIndex !== -1) {
            userIntegrationsList[integrationIndex] = updatedIntegration;
            userIntegrations.set(canonicalUser.id, userIntegrationsList);
        }
        console.log('✅ YouTube integration status updated successfully');
        res.json({
            success: true,
            message: 'YouTube integration status updated successfully',
            integration: {
                id: updatedIntegration.id,
                status: updatedIntegration.status,
                isActive: updatedIntegration.isActive,
                isConnected: updatedIntegration.isConnected,
                lastSyncAt: updatedIntegration.lastSyncAt,
                health: integrationAdapter_1.IntegrationAdapter.getHealthStatus(updatedIntegration)
            }
        });
    }
    catch (error) {
        console.error('❌ Error updating YouTube status:', error);
        res.status(500).json({
            error: 'Failed to update YouTube status',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// DELETE /api/youtube/disconnect
// Disconnect YouTube account using canonical UserIntegration
router.delete('/disconnect', identityService_1.authenticateToken, async (req, res) => {
    try {
        console.log('🔌 DELETE /api/youtube/disconnect - YouTube disconnection requested');
        const canonicalUser = await (0, identityService_1.getCanonicalUser)(req);
        if (!canonicalUser) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'User must be authenticated to disconnect YouTube account'
            });
        }
        // Get user's YouTube integration
        const userIntegrationsList = userIntegrations.get(canonicalUser.id) || [];
        const youtubeIntegration = userIntegrationsList.find(i => i.platform === 'youtube');
        if (!youtubeIntegration) {
            return res.status(404).json({
                error: 'YouTube integration not found',
                message: 'User does not have a connected YouTube account'
            });
        }
        console.log('🔌 Disconnecting YouTube integration:', youtubeIntegration.id);
        // Remove YouTube integration from user's integrations
        const filteredIntegrations = userIntegrationsList.filter(i => i.platform !== 'youtube');
        userIntegrations.set(canonicalUser.id, filteredIntegrations);
        console.log('✅ YouTube account disconnected successfully');
        res.json({
            success: true,
            message: 'YouTube account disconnected successfully',
            disconnectedIntegration: {
                id: youtubeIntegration.id,
                platform: youtubeIntegration.platform,
                externalUserId: youtubeIntegration.externalUserId,
                externalUsername: youtubeIntegration.externalUsername
            }
        });
    }
    catch (error) {
        console.error('❌ Error disconnecting YouTube account:', error);
        res.status(500).json({
            error: 'Failed to disconnect YouTube account',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=youtube.js.map