"use strict";
// Canonical UserIntegration model for GamePilot platform
// This model unifies all Integration interfaces across the monorepo
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationStatus = void 0;
exports.isValidUserIntegration = isValidUserIntegration;
exports.isValidSyncConfig = isValidSyncConfig;
exports.isValidSteamIntegrationMetadata = isValidSteamIntegrationMetadata;
exports.isValidDiscordIntegrationMetadata = isValidDiscordIntegrationMetadata;
exports.isValidYouTubeIntegrationMetadata = isValidYouTubeIntegrationMetadata;
exports.createDefaultUserIntegration = createDefaultUserIntegration;
exports.validateUserIntegration = validateUserIntegration;
exports.isIntegrationActive = isIntegrationActive;
exports.isIntegrationExpired = isIntegrationExpired;
exports.isIntegrationHealthy = isIntegrationHealthy;
// Integration status enum
var IntegrationStatus;
(function (IntegrationStatus) {
    IntegrationStatus["ACTIVE"] = "active";
    IntegrationStatus["INACTIVE"] = "inactive";
    IntegrationStatus["DISCONNECTED"] = "disconnected";
    IntegrationStatus["EXPIRED"] = "expired";
    IntegrationStatus["ERROR"] = "error";
})(IntegrationStatus || (exports.IntegrationStatus = IntegrationStatus = {}));
// Type guards and utilities
function isValidUserIntegration(integration) {
    return (integration &&
        typeof integration.id === 'string' &&
        typeof integration.userId === 'string' &&
        typeof integration.platform === 'string' &&
        typeof integration.externalUserId === 'string' &&
        (typeof integration.externalUsername === 'string' || integration.externalUsername === undefined) &&
        typeof integration.isConnected === 'boolean' &&
        typeof integration.isActive === 'boolean' &&
        typeof integration.status === 'string' &&
        Object.values(IntegrationStatus).includes(integration.status) &&
        integration.createdAt instanceof Date &&
        integration.updatedAt instanceof Date &&
        Array.isArray(integration.scopes) &&
        isValidSyncConfig(integration.syncConfig) &&
        (integration.expiresAt === undefined || integration.expiresAt instanceof Date) &&
        (integration.lastSyncAt === undefined || integration.lastSyncAt instanceof Date) &&
        (integration.lastUsedAt === undefined || integration.lastUsedAt instanceof Date) &&
        (integration.metadata === undefined || typeof integration.metadata === 'object'));
}
function isValidSyncConfig(config) {
    return (config &&
        typeof config.autoSync === 'boolean' &&
        typeof config.syncFrequency === 'number' &&
        config.syncFrequency > 0 &&
        typeof config.errorCount === 'number' &&
        config.errorCount >= 0 &&
        typeof config.maxRetries === 'number' &&
        config.maxRetries >= 0 &&
        (config.lastSyncAt === undefined || config.lastSyncAt instanceof Date));
}
function isValidSteamIntegrationMetadata(metadata) {
    return (metadata &&
        typeof metadata.steamId === 'string' &&
        typeof metadata.personaName === 'string' &&
        typeof metadata.profileUrl === 'string' &&
        typeof metadata.avatar === 'string' &&
        typeof metadata.personaState === 'number' &&
        (metadata.gameExtraInfo === undefined || typeof metadata.gameExtraInfo === 'string') &&
        (metadata.gameId === undefined || typeof metadata.gameId === 'string'));
}
function isValidDiscordIntegrationMetadata(metadata) {
    return (metadata &&
        typeof metadata.id === 'string' &&
        typeof metadata.username === 'string' &&
        typeof metadata.discriminator === 'string' &&
        typeof metadata.avatar === 'string' &&
        typeof metadata.bot === 'boolean' &&
        typeof metadata.verified === 'boolean' &&
        (metadata.email === undefined || typeof metadata.email === 'string') &&
        typeof metadata.flags === 'number' &&
        (metadata.premiumType === undefined || typeof metadata.premiumType === 'number') &&
        (metadata.globalName === undefined || typeof metadata.globalName === 'string') &&
        (metadata.avatarUrl === undefined || typeof metadata.avatarUrl === 'string') &&
        (metadata.bannerUrl === undefined || typeof metadata.bannerUrl === 'string') &&
        (metadata.accentColor === undefined || typeof metadata.accentColor === 'number'));
}
function isValidYouTubeIntegrationMetadata(metadata) {
    return (metadata &&
        typeof metadata.channelTitle === 'string' &&
        typeof metadata.subscriberCount === 'number' &&
        metadata.subscriberCount >= 0 &&
        typeof metadata.videoCount === 'number' &&
        metadata.videoCount >= 0 &&
        typeof metadata.viewCount === 'number' &&
        metadata.viewCount >= 0 &&
        metadata.publishedAt instanceof Date);
}
function createDefaultUserIntegration(userData) {
    return {
        id: userData.id,
        userId: userData.userId,
        platform: userData.platform,
        externalUserId: userData.externalUserId,
        externalUsername: userData.externalUsername,
        scopes: [],
        status: IntegrationStatus.INACTIVE,
        isActive: false,
        isConnected: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        syncConfig: {
            autoSync: true,
            syncFrequency: 12,
            errorCount: 0,
            maxRetries: 3
        }
    };
}
function validateUserIntegration(integration) {
    const errors = [];
    const warnings = [];
    if (!integration.id)
        errors.push('Integration ID is required');
    if (!integration.userId)
        errors.push('User ID is required');
    if (!integration.platform)
        errors.push('Platform is required');
    if (!integration.externalUserId)
        errors.push('External user ID is required');
    if (integration.isConnected && !integration.accessToken) {
        warnings.push('Connected integration has no access token');
    }
    if (integration.expiresAt && integration.expiresAt < new Date()) {
        errors.push('Access token has expired');
    }
    if (integration.syncConfig.errorCount > 5) {
        warnings.push('High error count detected');
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}
// Integration status helpers
function isIntegrationActive(integration) {
    return integration.isConnected && integration.status === IntegrationStatus.ACTIVE;
}
function isIntegrationExpired(integration) {
    return integration.status === IntegrationStatus.EXPIRED ||
        (!!(integration.expiresAt && integration.expiresAt < new Date()));
}
function isIntegrationHealthy(integration) {
    return isIntegrationActive(integration) &&
        !isIntegrationExpired(integration) &&
        integration.syncConfig.errorCount < 3;
}
//# sourceMappingURL=integration.js.map