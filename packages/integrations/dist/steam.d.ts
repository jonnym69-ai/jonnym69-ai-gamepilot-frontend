export interface SteamGame {
    appId: number;
    name: string;
    steamId: string;
    playtimeForever: number;
    playtimeWindows: number;
    playtimeMac: number;
    playtimeLinux: number;
    imgIconUrl: string;
    imgLogoUrl: string;
    hasCommunityVisibleStats: boolean;
    playtimeLastTwoWeeks: number;
    playtimeAtLastUpdate: Date;
    headerImage: string;
    shortDescription: string;
    supportedLanguages: string[];
    developers: string[];
    publishers: string[];
    genres: string[];
    categories: string[];
    releaseDate: Date;
    metacriticScore?: number;
    recommendations: number;
    isFree: boolean;
    priceOverview?: {
        currency: string;
        initial: number;
        final: number;
        discountPercent: number;
        individual: number;
    };
    platforms: string[];
}
export interface SteamPlayerSummary {
    steamId: string;
    personaName: string;
    profileUrl: string;
    avatar: string;
    realName: string;
    primaryClanId?: string;
    timeCreated: Date;
    lastLogoff: Date;
    gameCount: number;
    gameServerIp?: string;
    gameServerPort?: number;
}
export interface SteamRecentlyPlayedGame {
    appId: number;
    name: string;
    playtime2weeks: number;
    playtimeForever: number;
    imgIconUrl: string;
    lastPlayed: Date;
}
export interface SteamGameDetails {
    steamId: string;
    name: string;
    description: string;
    aboutTheGame: string;
    shortDescription: string;
    supportedLanguages: string[];
    reviews: string;
    headerImage: string;
    website?: string;
    developers: string[];
    publishers: string[];
    genres: string[];
    categories: string[];
    releaseDate: Date;
    platforms: string[];
    metacritic: {
        score: number;
        url: string;
    };
    recommendations: number;
    priceOverview: {
        currency: string;
        initial: number;
        final: number;
        discountPercent: number;
        individual: number;
    };
    screenshots: Array<{
        url: string;
        thumbnail: string;
        id: number;
        pathThumbnail: string;
        pathFull: string;
    }>;
    movies: Array<{
        id: number;
        name: string;
        thumbnail: string;
        webm: {
            '480': string;
            max: string;
        };
        mp4: {
            '480': string;
            max: string;
        };
        highlight: boolean;
    }>;
    dlc: Array<{
        id: number;
        type: string;
        name: string;
        priceOverview: {
            currency: string;
            initial: number;
            final: number;
            discountPercent: number;
            individual: number;
        };
    }>;
    requirements: {
        minimum: string;
        recommended: string;
    };
}
export declare class SteamIntegration {
    private apiKey;
    private baseUrl;
    private apiUrl;
    private maxResultsPerPage;
    constructor(apiKey?: string);
    /**
     * Get games owned by a Steam user
     * Free tier - requires user's Steam ID
     */
    getOwnedGames(steamId: string): Promise<SteamGame[]>;
    /**
     * Get recently played games for a Steam user
     */
    getRecentlyPlayed(steamId: string): Promise<SteamRecentlyPlayedGame[]>;
    /**
     * Get detailed information about a specific game
     */
    getGameDetails(appId: number): Promise<SteamGameDetails | null>;
    /**
     * Get player summary for a Steam user
     */
    getPlayerSummary(steamId: string): Promise<SteamPlayerSummary | null>;
    /**
     * Transform owned games API response
     */
    private transformOwnedGamesResponse;
    /**
     * Transform recently played games response
     */
    private transformRecentlyPlayedResponse;
    /**
     * Transform game details response
     */
    private transformGameDetailsResponse;
    /**
     * Transform player summary response
     */
    private transformPlayerSummaryResponse;
    /**
     * Get mock owned games for testing
     */
    private getMockOwnedGames;
    /**
     * Get mock recently played games
     */
    private getMockRecentlyPlayedGames;
    /**
     * Get mock player summary
     */
    private getMockPlayerSummary;
    /**
     * Check if Steam API is available
     */
    isApiAvailable(): boolean;
    /**
     * Get mock game details for testing
     */
    private getMockGameDetails;
    /**
     * Get API info
     */
    getApiInfo(): {
        available: boolean;
        maxResultsPerPage: number;
        rateLimits: {
            requestsPerMinute: number;
            requestsPerDay: number;
        };
    };
}
