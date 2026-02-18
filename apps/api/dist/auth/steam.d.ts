import { User } from '@gamepilot/shared';
/**
 * Generate Steam OpenID authentication URL
 */
export declare function generateSteamAuthUrl(): string;
/**
 * Verify Steam OpenID response
 */
export declare function verifySteamResponse(query: any): Promise<{
    steamId: string;
    valid: boolean;
}>;
/**
 * Fetch Steam user profile data
 */
export declare function fetchSteamUserProfile(steamId: string): Promise<{
    personaName: string;
    avatar: string;
    realName?: string;
} | null>;
/**
 * Fetch user's Steam games library
 */
export declare function fetchSteamGames(steamId: string): Promise<any[]>;
/**
 * Fetch user's recently played Steam games
 */
export declare function fetchSteamRecentlyPlayedGames(steamId: string): Promise<any[]>;
/**
 * Create or update user with Steam data
 */
export declare function createOrUpdateSteamUser(steamId: string, profileData: {
    personaName: string;
    avatar: string;
    realName?: string;
}): Promise<User>;
//# sourceMappingURL=steam.d.ts.map