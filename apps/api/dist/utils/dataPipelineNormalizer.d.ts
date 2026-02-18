/**
 * Data Pipeline Normalizer
 * * Processes raw Steam API responses and normalizes them for our database schema
 * Handles genre mapping, mood assignment, and data validation
 */
import { EnhancedMoodId } from '@gamepilot/static-data';
interface SteamApiGame {
    appid: number;
    name: string;
    playtime_forever: number;
    img_icon_url: string;
    img_logo_url: string;
    has_community_visible_stats: boolean;
    genres?: Array<{
        id: string | number;
        description: string;
    }>;
    platforms?: {
        windows: boolean;
        mac: boolean;
        linux: boolean;
    };
    release_date?: {
        date: string;
    };
    rtime_last_played?: number;
    detailed_description?: string;
    short_description?: string;
}
export interface NormalizedGame {
    id: string;
    title: string;
    description?: string;
    coverImage?: string;
    appId?: number;
    genres: Array<{
        id: string;
        name: string;
        color: string;
        subgenres?: any;
    }>;
    platforms: Array<{
        id: string;
        name: string;
        code: string;
        isConnected: boolean;
    }>;
    moods: EnhancedMoodId[];
    emotionalTags: string[];
    playStatus: 'unplayed' | 'playing' | 'completed' | 'paused' | 'abandoned';
    hoursPlayed: number;
    userRating?: number;
    globalRating?: number;
    lastPlayed?: Date;
    isFavorite: boolean;
    notes?: string;
    releaseYear?: number;
    addedAt: Date;
}
export declare const CANONICAL_GENRES: string[];
export declare const CANONICAL_MOODS: string[];
export declare function normalizeTimeKey(time: string): string;
export declare function normalizeMood(mood: string): EnhancedMoodId;
export declare function normalizeGenre(genre: string): string;
export declare function normalizeGamesArray(games: any[]): any[];
export declare function normalizeSteamGames(steamGames: SteamApiGame[]): NormalizedGame[];
export declare function normalizeGenres(game: SteamApiGame): NormalizedGame['genres'];
export declare function normalizePlatforms(game: SteamApiGame): NormalizedGame['platforms'];
declare const _default: {
    normalizeSteamGames: typeof normalizeSteamGames;
    normalizeGenres: typeof normalizeGenres;
    normalizePlatforms: typeof normalizePlatforms;
    normalizeTimeKey: typeof normalizeTimeKey;
    normalizeMood: typeof normalizeMood;
    normalizeGenre: typeof normalizeGenre;
    normalizeGamesArray: typeof normalizeGamesArray;
    CANONICAL_GENRES: string[];
    CANONICAL_MOODS: string[];
};
export default _default;
//# sourceMappingURL=dataPipelineNormalizer.d.ts.map