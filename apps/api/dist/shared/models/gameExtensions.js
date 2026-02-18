"use strict";
// Platform-specific Game extensions for GamePilot platform
// These interfaces extend the canonical Game model with platform-specific features
Object.defineProperty(exports, "__esModule", { value: true });
exports.STEAM_GAME_DEFAULTS = void 0;
exports.isSteamGame = isSteamGame;
exports.getPlatformGame = getPlatformGame;
exports.toSteamGame = toSteamGame;
exports.toCanonicalGame = toCanonicalGame;
const platform_1 = require("../constants/platform");
// ============================================================================
// TYPE GUARDS
// ============================================================================
/**
 * Type guard to check if a game is a Steam game
 */
function isSteamGame(game) {
    return 'appId' in game && typeof game.appId === 'number';
}
/**
 * Get platform-specific game type
 */
function getPlatformGame(game, platformCode) {
    switch (platformCode) {
        case platform_1.PLATFORMS.STEAM:
            if (!isSteamGame(game)) {
                throw new Error(`Game ${game.id} is not a Steam game`);
            }
            return game;
        default:
            return game;
    }
}
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
/**
 * Convert canonical Game to SteamGame with default Steam properties
 */
function toSteamGame(game, steamData = {}) {
    return {
        ...game,
        appId: steamData.appId || 0,
        launcherId: steamData.launcherId || `steam-${game.id}`,
        lastLocalPlayedAt: steamData.lastLocalPlayedAt || null,
        localSessionMinutes: steamData.localSessionMinutes || 0,
        localSessionCount: steamData.localSessionCount || 0,
        steamFeatures: steamData.steamFeatures || {
            achievements: false,
            cloudSaves: false,
            tradingCards: false,
            workshop: false,
            multiplayer: false,
            controllerSupport: false
        },
        steamStoreData: steamData.steamStoreData
    };
}
/**
 * Extract canonical Game from platform-specific game
 */
function toCanonicalGame(platformGame) {
    // Create a copy without platform-specific properties
    const { appId, launcherId, lastLocalPlayedAt, localSessionMinutes, localSessionCount, steamFeatures, steamStoreData, ...canonicalGame } = platformGame;
    return canonicalGame;
}
// ============================================================================
// CONSTANTS
// ============================================================================
exports.STEAM_GAME_DEFAULTS = {
    appId: 0,
    launcherId: '',
    lastLocalPlayedAt: null,
    localSessionMinutes: 0,
    localSessionCount: 0,
    steamFeatures: {
        achievements: false,
        cloudSaves: false,
        tradingCards: false,
        workshop: false,
        multiplayer: false,
        controllerSupport: false
    }
};
//# sourceMappingURL=gameExtensions.js.map