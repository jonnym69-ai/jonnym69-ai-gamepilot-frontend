import { UserIntegration } from '@gamepilot/shared/models/integration';
/**
 * Get Discord profile and convert to canonical UserIntegration
 * Now returns canonical UserIntegration
 */
export declare function getDiscordProfile(userId?: string): Promise<any>;
/**
 * Get Discord profile as canonical UserIntegration
 * New function that returns the canonical UserIntegration model
 */
export declare function getDiscordIntegration(userId: string, authData?: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
    scopes?: string[];
}): Promise<UserIntegration>;
/**
 * Migrate legacy Discord integration to canonical UserIntegration
 * Used when upgrading existing Discord integrations to the new model
 */
export declare function migrateLegacyDiscordIntegration(legacyProfile: any, userId: string, additionalData?: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
    scopes?: string[];
}): UserIntegration;
/**
 * Update Discord integration tokens
 * Uses canonical UserIntegration model for token management
 */
export declare function updateDiscordTokens(integration: UserIntegration, tokenData: {
    accessToken: string;
    refreshToken?: string;
    expiresAt: Date;
}): UserIntegration;
/**
 * Update Discord integration status
 * Uses canonical UserIntegration model for status management
 */
export declare function updateDiscordStatus(integration: UserIntegration, status: 'active' | 'error' | 'expired' | 'revoked', errorCount?: number): UserIntegration;
/**
 * Validate Discord integration
 * Uses canonical UserIntegration model for validation
 */
export declare function validateDiscordIntegration(integration: UserIntegration): {
    isValid: boolean;
    errors: string[];
};
/**
 * Get Discord guilds for user
 * Uses canonical UserIntegration model for user context
 */
export declare function getDiscordGuilds(userId: string): Promise<any[]>;
/**
 * Get Discord user activity
 * Uses canonical UserIntegration model for user context
 */
export declare function getDiscordActivity(userId: string): Promise<any[]>;
//# sourceMappingURL=discordClient.d.ts.map