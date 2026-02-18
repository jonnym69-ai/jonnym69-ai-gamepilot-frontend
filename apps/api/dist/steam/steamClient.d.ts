import { UserIntegration } from '@gamepilot/shared/models/integration';
import { SteamProfile } from '@gamepilot/shared/models/steamProfile';
/**
 * Get Steam profile and convert to canonical UserIntegration
 * Now returns canonical UserIntegration
 */
export declare function getSteamProfile(userId?: string): Promise<SteamProfile>;
/**
 * Get Steam profile as canonical UserIntegration
 * New function that returns the canonical UserIntegration model
 */
export declare function getSteamIntegration(userId: string, authData?: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
    scopes?: string[];
}): Promise<UserIntegration>;
/**
 * Migrate legacy Steam integration to canonical UserIntegration
 * Used when upgrading existing Steam integrations to the new model
 */
export declare function migrateLegacySteamIntegration(legacyProfile: any, userId: string, additionalData?: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
    scopes?: string[];
}): UserIntegration;
/**
 * Update Steam integration tokens
 * Uses canonical UserIntegration model for token management
 */
export declare function updateSteamTokens(integration: UserIntegration, tokenData: {
    accessToken: string;
    refreshToken?: string;
    expiresAt: Date;
}): UserIntegration;
/**
 * Update Steam integration status
 * Uses canonical UserIntegration model for status management
 */
export declare function updateSteamStatus(integration: UserIntegration, status: 'active' | 'error' | 'expired' | 'revoked', errorCount?: number): UserIntegration;
/**
 * Validate Steam integration
 * Uses canonical UserIntegration model for validation
 */
export declare function validateSteamIntegration(integration: UserIntegration): {
    isValid: boolean;
    errors: string[];
};
//# sourceMappingURL=steamClient.d.ts.map