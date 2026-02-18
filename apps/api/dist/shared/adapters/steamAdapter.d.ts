import { Game } from '../types';
/**
 * Steam-to-Canonical Game Adapter
 * Maps Steam API data to our canonical Game interface
 */
export interface SteamGameRaw {
    appid: number;
    name: string;
    playtime_forever: number;
    img_icon_url?: string;
    img_logo_url?: string;
    has_community_visible_stats?: boolean;
    rtime_last_played?: number;
    shortDescription?: string;
    backgroundImages?: string[];
    developer?: string;
    publisher?: string;
    metacriticScore?: number;
    categories?: Array<{
        id: number;
        description: string;
    }>;
    genres?: Array<{
        id: string;
        description: string;
    }>;
    releaseDate?: string;
    releaseYear?: number;
    lastPlayed?: string;
    achievements?: {
        unlocked: number;
        total: number;
    };
}
export declare class SteamAdapter {
    /**
     * Convert Steam game data to canonical Game interface
     */
    static toCanonicalGame(steamGame: SteamGameRaw): Game;
    /**
     * Convert array of Steam games to canonical Games
     */
    static toCanonicalGames(steamGames: SteamGameRaw[]): Game[];
    /**
     * Determine play status based on playtime
     */
    private static determinePlayStatus;
    /**
     * Extract and normalize genres from Steam data
     */
    private static extractGenres;
    /**
     * Normalize Steam genre to our canonical genre
     */
    private static normalizeGenre;
    /**
     * Convert Steam category to genre
     */
    private static categoryToGenre;
    /**
     * Extract platforms from Steam data
     */
    private static extractPlatforms;
    /**
     * Extract tags for mood analysis
     */
    private static extractTags;
    /**
     * Extract genres from game title using pattern matching
     */
    private static extractGenresFromTitle;
    /**
     * Generate cover image URL with fallbacks
     */
    private static generateCoverImage;
    /**
     * Validate Steam game data
     */
    static validateSteamGame(game: SteamGameRaw): boolean;
    /**
     * Filter out invalid Steam games
     */
    static filterValidGames(games: SteamGameRaw[]): SteamGameRaw[];
}
//# sourceMappingURL=steamAdapter.d.ts.map