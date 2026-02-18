import type { Game } from '../index';
/**
 * Steam-specific game properties
 * Extends the canonical Game model with Steam launcher functionality
 */
export interface SteamGame extends Game {
    appId: number;
    launcherId: string;
    lastLocalPlayedAt?: string | null;
    localSessionMinutes?: number;
    localSessionCount?: number;
    steamFeatures?: {
        achievements: boolean;
        cloudSaves: boolean;
        tradingCards: boolean;
        workshop: boolean;
        multiplayer: boolean;
        controllerSupport: boolean;
    };
    steamStoreData?: {
        price?: number;
        discount?: number;
        metacriticScore?: number;
        recommendations?: number;
        categories?: string[];
        tags?: string[];
    };
}
/**
 * Union type for all platform-specific game extensions
 * Use this when you need to handle games from multiple platforms
 */
export type PlatformGame = SteamGame;
/**
 * Type guard to check if a game is a Steam game
 */
export declare function isSteamGame(game: Game): game is SteamGame;
/**
 * Get platform-specific game type
 */
export declare function getPlatformGame(game: Game, platformCode: string): PlatformGame;
/**
 * Convert canonical Game to SteamGame with default Steam properties
 */
export declare function toSteamGame(game: Game, steamData?: Partial<SteamGame>): SteamGame;
/**
 * Extract canonical Game from platform-specific game
 */
export declare function toCanonicalGame(platformGame: PlatformGame): Game;
export declare const STEAM_GAME_DEFAULTS: Partial<SteamGame>;
//# sourceMappingURL=gameExtensions.d.ts.map