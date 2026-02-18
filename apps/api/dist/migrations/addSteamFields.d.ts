import { User } from '@gamepilot/shared';
/**
 * Migration to add Steam authentication fields to users table
 */
export declare function addSteamFieldsToUsers(): Promise<void>;
/**
 * Get user by Steam ID
 */
export declare function getUserBySteamId(steamId: string): Promise<User | null>;
/**
 * Update user with Steam profile data
 */
export declare function updateUserWithSteamData(userId: string, steamData: {
    steamId: string;
    personaName: string;
    avatar: string;
}): Promise<void>;
//# sourceMappingURL=addSteamFields.d.ts.map