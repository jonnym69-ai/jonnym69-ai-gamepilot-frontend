"use strict";
// Integration Adapter - Non-destructive mapping between legacy and canonical Integration models
// This adapter provides bidirectional conversion without breaking existing functionality
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationAdapter = void 0;
exports.isSteamProfile = isSteamProfile;
exports.isUserIntegration = isUserIntegration;
exports.safeSteamProfileToIntegration = safeSteamProfileToIntegration;
exports.safeIntegrationToSteamProfile = safeIntegrationToSteamProfile;
/**
 * Adapter for converting between canonical UserIntegration and legacy integration models
 * Provides non-destructive migration path for platform integration services
 */
class IntegrationAdapter {
    /**
     * Convert SteamProfile to canonical UserIntegration
     * Used when Steam integration data needs to be stored in canonical format
     */
    static steamProfileToIntegration(steamProfile, userId, additionalData) {
        const now = new Date();
        return {
            id: `steam-${steamProfile.steamId}`,
            userId,
            platform: 'steam', // Using 'steam' as string until added to PlatformCode enum
            externalUserId: steamProfile.steamId,
            externalUsername: steamProfile.personaName,
            accessToken: additionalData?.accessToken,
            refreshToken: additionalData?.refreshToken,
            expiresAt: additionalData?.expiresAt,
            scopes: additionalData?.scopes || [],
            status: 'active', // IntegrationStatus.ACTIVE
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
            },
            syncConfig: {
                autoSync: true,
                syncFrequency: 12, // Steam updates every 12 hours
                lastSyncAt: now,
                errorCount: 0,
                maxRetries: 3
            }
        };
    }
    /**
     * Convert canonical UserIntegration to SteamProfile
     * Used when Steam services need legacy format
     */
    static integrationToSteamProfile(integration) {
        if (integration.platform !== 'steam') {
            return null;
        }
        const steamMetadata = integration.metadata?.steam;
        return {
            steamId: integration.externalUserId,
            personaName: integration.externalUsername || steamMetadata?.personaName || '',
            profileUrl: integration.metadata?.profileUrl || steamMetadata?.profileUrl || '',
            avatar: integration.metadata?.avatar || '',
            avatarMedium: integration.metadata?.avatar || '',
            avatarFull: integration.metadata?.avatar || '',
            personaState: 1, // Online (default)
            personaStateFlags: 0,
            gameServerIp: undefined,
            gameServerPort: undefined,
            gameExtraInfo: steamMetadata?.realName,
            gameId: undefined
        };
    }
    /**
     * Create canonical UserIntegration from connection data
     * Used during OAuth flow completion
     */
    static fromConnectionData(platform, userId, externalUserId, externalUsername, authData, profileData) {
        const now = new Date();
        const baseIntegration = {
            id: `${platform}-${externalUserId}`,
            userId,
            platform: platform,
            externalUserId,
            externalUsername,
            accessToken: authData.accessToken,
            refreshToken: authData.refreshToken,
            expiresAt: authData.expiresAt,
            scopes: authData.scopes || [],
            status: 'active',
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
        };
        // Add platform-specific metadata
        if (platform === 'steam' && profileData) {
            baseIntegration.metadata.steam = profileData;
        }
        else if (platform === 'discord' && profileData) {
            baseIntegration.metadata.discord = profileData;
        }
        else if (platform === 'youtube' && profileData) {
            baseIntegration.metadata.youtube = profileData;
        }
        return baseIntegration;
    }
    /**
     * Update integration status
     * Used when integration state changes
     */
    static updateStatus(integration, status, errorCount) {
        return {
            ...integration,
            status: status,
            isActive: status === 'active',
            isConnected: status === 'active',
            updatedAt: new Date(),
            syncConfig: {
                ...integration.syncConfig,
                errorCount: errorCount || (status === 'error' ? integration.syncConfig.errorCount + 1 : 0),
                lastSyncAt: status === 'active' ? new Date() : integration.syncConfig.lastSyncAt
            }
        };
    }
    /**
     * Update integration tokens
     * Used during token refresh
     */
    static updateTokens(integration, tokenData) {
        return {
            ...integration,
            accessToken: tokenData.accessToken,
            refreshToken: tokenData.refreshToken,
            expiresAt: tokenData.expiresAt,
            status: 'active',
            isActive: true,
            isConnected: true,
            updatedAt: new Date(),
            syncConfig: {
                ...integration.syncConfig,
                errorCount: 0, // Reset error count on successful token update
                lastSyncAt: new Date()
            }
        };
    }
    /**
     * Get platform-specific sync frequency
     */
    static getDefaultSyncFrequency(platform) {
        switch (platform) {
            case 'steam': return 12; // 12 hours
            case 'discord': return 6; // 6 hours
            case 'youtube': return 24; // 24 hours
            case 'twitch': return 1; // 1 hour
            default: return 24; // Default to daily
        }
    }
    /**
     * Get platform-specific capabilities
     */
    static getDefaultCapabilities(platform) {
        switch (platform) {
            case 'steam':
                return [
                    'read_profile',
                    'read_library',
                    'read_activity',
                    'read_achievements',
                    'steam_games',
                    'steam_stats'
                ];
            case 'discord':
                return [
                    'read_profile',
                    'read_activity',
                    'read_friends',
                    'discord_guilds',
                    'discord_channels'
                ];
            case 'youtube':
                return [
                    'read_profile',
                    'youtube_videos',
                    'youtube_channels'
                ];
            case 'twitch':
                return [
                    'read_profile',
                    'twitch_streams',
                    'twitch_channels'
                ];
            default:
                return ['read_profile'];
        }
    }
    /**
     * Get platform-specific permissions
     */
    static getDefaultPermissions(platform) {
        switch (platform) {
            case 'steam':
                return {
                    canReadProfile: true,
                    canReadLibrary: true,
                    canReadActivity: true,
                    canReadFriends: false,
                    canReadAchievements: true
                };
            case 'discord':
                return {
                    canReadProfile: true,
                    canReadLibrary: false,
                    canReadActivity: true,
                    canReadFriends: true,
                    canReadAchievements: false
                };
            case 'youtube':
            case 'twitch':
                return {
                    canReadProfile: true,
                    canReadLibrary: false,
                    canReadActivity: false,
                    canReadFriends: false,
                    canReadAchievements: false
                };
            default:
                return {
                    canReadProfile: true,
                    canReadLibrary: false,
                    canReadActivity: false,
                    canReadFriends: false,
                    canReadAchievements: false
                };
        }
    }
    /**
     * Validate integration for authentication
     */
    static validateForAuth(integration) {
        const errors = [];
        if (!integration.id)
            errors.push('Integration ID is required');
        if (!integration.userId)
            errors.push('User ID is required');
        if (!integration.platform)
            errors.push('Platform is required');
        if (!integration.externalUserId)
            errors.push('External user ID is required');
        // Check if tokens are valid for active integrations
        if (integration.isActive && !integration.accessToken) {
            errors.push('Active integration requires access token');
        }
        // Check if token is expired
        if (integration.expiresAt && integration.expiresAt <= new Date()) {
            errors.push('Access token has expired');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Check if integration needs token refresh
     */
    static needsTokenRefresh(integration) {
        if (!integration.expiresAt)
            return false;
        // Refresh if token expires within the next hour
        const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
        return integration.expiresAt <= oneHourFromNow;
    }
    /**
     * Get integration health status
     */
    static getHealthStatus(integration) {
        const issues = [];
        const now = new Date();
        // Check connection status
        if (!integration.isActive) {
            issues.push('Integration is inactive');
        }
        // Check token validity
        if (integration.expiresAt && integration.expiresAt <= now) {
            issues.push('Token has expired');
        }
        // Check sync errors
        if (integration.syncConfig.errorCount > 0) {
            issues.push(`${integration.syncConfig.errorCount} sync errors`);
        }
        // Check last sync age
        const lastSyncAge = integration.syncConfig.lastSyncAt
            ? now.getTime() - integration.syncConfig.lastSyncAt.getTime()
            : Infinity;
        const maxSyncAge = integration.syncConfig.syncFrequency * 60 * 60 * 1000; // Convert hours to ms
        if (lastSyncAge > maxSyncAge * 2) { // Overdue by 2x the frequency
            issues.push('Sync is overdue');
        }
        return {
            isHealthy: issues.length === 0,
            status: integration.status,
            issues,
            lastSyncAge
        };
    }
    /**
     * Create public-safe integration data
     * Removes sensitive authentication data
     */
    static toPublicIntegration(integration) {
        const { accessToken, refreshToken, scopes, ...publicIntegration } = integration;
        return publicIntegration;
    }
}
exports.IntegrationAdapter = IntegrationAdapter;
/**
 * Type guard to check if an object is a valid SteamProfile
 */
function isSteamProfile(obj) {
    return obj &&
        typeof obj.steamId === 'string' &&
        typeof obj.personaName === 'string' &&
        typeof obj.profileUrl === 'string';
}
/**
 * Type guard to check if an object is a valid UserIntegration
 */
function isUserIntegration(obj) {
    return obj &&
        typeof obj.id === 'string' &&
        typeof obj.userId === 'string' &&
        typeof obj.platform === 'string' &&
        typeof obj.externalUserId === 'string' &&
        obj.status &&
        obj.syncConfig &&
        obj.permissions;
}
/**
 * Helper function to safely convert SteamProfile to UserIntegration
 */
function safeSteamProfileToIntegration(steamProfile, userId, additionalData) {
    if (!steamProfile)
        return null;
    try {
        return IntegrationAdapter.steamProfileToIntegration(steamProfile, userId, additionalData);
    }
    catch (error) {
        console.error('Error converting SteamProfile to UserIntegration:', error);
        return null;
    }
}
/**
 * Helper function to safely convert UserIntegration to SteamProfile
 */
function safeIntegrationToSteamProfile(integration) {
    if (!integration)
        return null;
    try {
        return IntegrationAdapter.integrationToSteamProfile(integration);
    }
    catch (error) {
        console.error('Error converting UserIntegration to SteamProfile:', error);
        return null;
    }
}
//# sourceMappingURL=integrationAdapter.js.map