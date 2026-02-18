"use strict";
// Type Guards - Runtime type checking for canonical and legacy models
// These functions provide safe type checking for model conversions
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCanonicalUser = isCanonicalUser;
exports.isCanonicalIntegration = isCanonicalIntegration;
exports.isLegacyAuthUser = isLegacyAuthUser;
exports.isLegacySteamProfile = isLegacySteamProfile;
exports.isMoodVector = isMoodVector;
exports.isBehavioralSignal = isBehavioralSignal;
exports.isNormalizedFeatures = isNormalizedFeatures;
exports.hasCanonicalUserStructure = hasCanonicalUserStructure;
exports.hasCanonicalIntegrationStructure = hasCanonicalIntegrationStructure;
exports.hasLegacyAuthUserStructure = hasLegacyAuthUserStructure;
exports.hasLegacySteamProfileStructure = hasLegacySteamProfileStructure;
exports.hasMoodAnalysisStructure = hasMoodAnalysisStructure;
exports.isGame = isGame;
exports.isSteamGame = isSteamGame;
exports.getModelType = getModelType;
exports.canConvertToCanonicalUser = canConvertToCanonicalUser;
exports.canConvertToCanonicalIntegration = canConvertToCanonicalIntegration;
exports.isSteamRelated = isSteamRelated;
exports.isAuthRelated = isAuthRelated;
exports.isMoodAnalysisRelated = isMoodAnalysisRelated;
exports.debugType = debugType;
/**
 * Type guard to check if an object is a valid canonical User
 */
function isCanonicalUser(obj) {
    return obj &&
        typeof obj.id === 'string' &&
        typeof obj.username === 'string' &&
        typeof obj.email === 'string' &&
        typeof obj.displayName === 'string' &&
        obj.gamingProfile &&
        obj.integrations &&
        obj.privacy &&
        obj.preferences &&
        obj.social;
}
/**
 * Type guard to check if an object is a valid canonical UserIntegration
 */
function isCanonicalIntegration(obj) {
    return obj &&
        typeof obj.id === 'string' &&
        typeof obj.userId === 'string' &&
        typeof obj.platform === 'string' &&
        typeof obj.externalUserId === 'string' &&
        typeof obj.externalUsername === 'string' &&
        obj.status &&
        obj.syncConfig &&
        obj.permissions;
}
/**
 * Type guard to check if an object is a valid legacy AuthUser
 */
function isLegacyAuthUser(obj) {
    return obj &&
        typeof obj.id === 'string' &&
        typeof obj.username === 'string' &&
        typeof obj.email === 'string';
}
/**
 * Type guard to check if an object is a valid legacy SteamProfile
 */
function isLegacySteamProfile(obj) {
    return obj &&
        typeof obj.steamId === 'string' &&
        typeof obj.personaName === 'string' &&
        typeof obj.profileUrl === 'string' &&
        typeof obj.avatar === 'string' &&
        typeof obj.avatarMedium === 'string' &&
        typeof obj.avatarFull === 'string';
}
/**
 * Type guard to check if an object is a valid MoodVector
 */
function isMoodVector(obj) {
    return obj &&
        typeof obj.calm === 'number' &&
        typeof obj.competitive === 'number' &&
        typeof obj.curious === 'number' &&
        typeof obj.social === 'number' &&
        typeof obj.focused === 'number';
}
/**
 * Type guard to check if an object is a valid BehavioralSignal
 */
function isBehavioralSignal(obj) {
    return obj &&
        obj.timestamp instanceof Date &&
        typeof obj.source === 'string' &&
        typeof obj.data === 'object' &&
        typeof obj.weight === 'number';
}
/**
 * Type guard to check if an object is a valid NormalizedFeatures
 */
function isNormalizedFeatures(obj) {
    return obj &&
        typeof obj.engagementVolatility === 'number' &&
        typeof obj.challengeSeeking === 'number' &&
        typeof obj.socialOpenness === 'number' &&
        typeof obj.explorationBias === 'number' &&
        typeof obj.focusStability === 'number';
}
/**
 * Type guard to check if an object has canonical User structure
 */
function hasCanonicalUserStructure(obj) {
    return obj &&
        typeof obj === 'object' &&
        'gamingProfile' in obj &&
        'integrations' in obj &&
        'privacy' in obj &&
        'preferences' in obj &&
        'social' in obj;
}
/**
 * Type guard to check if an object has canonical Integration structure
 */
function hasCanonicalIntegrationStructure(obj) {
    return obj &&
        typeof obj === 'object' &&
        'platform' in obj &&
        'externalUserId' in obj &&
        'status' in obj &&
        'syncConfig' in obj &&
        'permissions' in obj;
}
/**
 * Type guard to check if an object has legacy AuthUser structure
 */
function hasLegacyAuthUserStructure(obj) {
    return obj &&
        typeof obj === 'object' &&
        'id' in obj &&
        'username' in obj &&
        'email' in obj;
}
/**
 * Type guard to check if an object has legacy SteamProfile structure
 */
function hasLegacySteamProfileStructure(obj) {
    return obj &&
        typeof obj === 'object' &&
        'steamId' in obj &&
        'personaName' in obj &&
        'profileUrl' in obj &&
        'avatar' in obj;
}
/**
 * Type guard to check if an object has mood analysis structure
 */
function hasMoodAnalysisStructure(obj) {
    return obj &&
        typeof obj === 'object' &&
        ('moodVector' in obj || 'calm' in obj); // Check for either canonical or legacy mood vector
}
/**
 * Type guard to check if an object is a game (for games route)
 */
function isGame(obj) {
    return obj &&
        typeof obj === 'object' &&
        (typeof obj.id === 'string' || typeof obj.appId === 'string') &&
        (typeof obj.title === 'string' || typeof obj.name === 'string');
}
/**
 * Type guard to check if an object is a Steam game (for steam integration)
 */
function isSteamGame(obj) {
    return obj &&
        typeof obj === 'object' &&
        typeof obj.appId === 'number' &&
        typeof obj.name === 'string' &&
        typeof obj.steamId === 'string' &&
        typeof obj.playtimeForever === 'number';
}
/**
 * Helper function to safely determine model type
 */
function getModelType(obj) {
    if (isCanonicalUser(obj))
        return 'canonical-user';
    if (isCanonicalIntegration(obj))
        return 'canonical-integration';
    if (isLegacyAuthUser(obj))
        return 'legacy-auth-user';
    if (isLegacySteamProfile(obj))
        return 'legacy-steam-profile';
    if (isMoodVector(obj))
        return 'mood-vector';
    if (isBehavioralSignal(obj))
        return 'behavioral-signal';
    if (isNormalizedFeatures(obj))
        return 'normalized-features';
    return 'unknown';
}
/**
 * Helper function to check if object can be converted to canonical User
 */
function canConvertToCanonicalUser(obj) {
    return hasLegacyAuthUserStructure(obj) || hasCanonicalUserStructure(obj);
}
/**
 * Helper function to check if object can be converted to canonical UserIntegration
 */
function canConvertToCanonicalIntegration(obj) {
    return hasLegacySteamProfileStructure(obj) || hasCanonicalIntegrationStructure(obj);
}
/**
 * Helper function to check if object is Steam-related
 */
function isSteamRelated(obj) {
    return isLegacySteamProfile(obj) ||
        (isCanonicalIntegration(obj) && obj.platform === 'steam') ||
        (typeof obj === 'object' && 'steamId' in obj);
}
/**
 * Helper function to check if object is authentication-related
 */
function isAuthRelated(obj) {
    return isLegacyAuthUser(obj) ||
        isCanonicalUser(obj) ||
        (typeof obj === 'object' && ('token' in obj || 'accessToken' in obj));
}
/**
 * Helper function to check if object is mood-analysis related
 */
function isMoodAnalysisRelated(obj) {
    return isMoodVector(obj) ||
        isBehavioralSignal(obj) ||
        isNormalizedFeatures(obj) ||
        hasMoodAnalysisStructure(obj);
}
/**
 * Runtime type checker for debugging
 */
function debugType(obj, label) {
    const type = getModelType(obj);
    const structure = {
        hasCanonicalUser: hasCanonicalUserStructure(obj),
        hasCanonicalIntegration: hasCanonicalIntegrationStructure(obj),
        hasLegacyAuthUser: hasLegacyAuthUserStructure(obj),
        hasLegacySteamProfile: hasLegacySteamProfileStructure(obj),
        hasMoodAnalysis: hasMoodAnalysisStructure(obj)
    };
    console.log(`${label || 'Type Check'}:`, {
        type,
        structure,
        keys: Object.keys(obj),
        sample: JSON.stringify(obj).substring(0, 200) + '...'
    });
}
//# sourceMappingURL=typeGuards.js.map