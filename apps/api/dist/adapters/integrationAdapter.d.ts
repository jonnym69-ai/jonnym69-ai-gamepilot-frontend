import type { UserIntegration } from '@gamepilot/shared/models/integration';
import type { SteamProfile } from '@gamepilot/shared/models/steamProfile';
/**
 * Adapter for converting between canonical UserIntegration and legacy integration models
 * Provides non-destructive migration path for platform integration services
 */
export declare class IntegrationAdapter {
    /**
     * Convert SteamProfile to canonical UserIntegration
     * Used when Steam integration data needs to be stored in canonical format
     */
    static steamProfileToIntegration(steamProfile: SteamProfile, userId: string, additionalData?: {
        accessToken?: string;
        refreshToken?: string;
        expiresAt?: Date;
        scopes?: string[];
    }): UserIntegration;
    /**
     * Convert canonical UserIntegration to SteamProfile
     * Used when Steam services need legacy format
     */
    static integrationToSteamProfile(integration: UserIntegration): SteamProfile | null;
    /**
     * Create canonical UserIntegration from connection data
     * Used during OAuth flow completion
     */
    static fromConnectionData(platform: string, userId: string, externalUserId: string, externalUsername: string, authData: {
        accessToken?: string;
        refreshToken?: string;
        expiresAt?: Date;
        scopes?: string[];
    }, profileData?: Record<string, any>): UserIntegration;
    /**
     * Update integration status
     * Used when integration state changes
     */
    static updateStatus(integration: UserIntegration, status: 'active' | 'error' | 'expired' | 'revoked', errorCount?: number): UserIntegration;
    /**
     * Update integration tokens
     * Used during token refresh
     */
    static updateTokens(integration: UserIntegration, tokenData: {
        accessToken: string;
        refreshToken?: string;
        expiresAt: Date;
    }): UserIntegration;
    /**
     * Get platform-specific sync frequency
     */
    private static getDefaultSyncFrequency;
    /**
     * Get platform-specific capabilities
     */
    private static getDefaultCapabilities;
    /**
     * Get platform-specific permissions
     */
    private static getDefaultPermissions;
    /**
     * Validate integration for authentication
     */
    static validateForAuth(integration: UserIntegration): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Check if integration needs token refresh
     */
    static needsTokenRefresh(integration: UserIntegration): boolean;
    /**
     * Get integration health status
     */
    static getHealthStatus(integration: UserIntegration): {
        isHealthy: boolean;
        status: string;
        issues: string[];
        lastSyncAge: number;
    };
    /**
     * Create public-safe integration data
     * Removes sensitive authentication data
     */
    static toPublicIntegration(integration: UserIntegration): Omit<UserIntegration, 'accessToken' | 'refreshToken' | 'scopes'>;
}
/**
 * Type guard to check if an object is a valid SteamProfile
 */
export declare function isSteamProfile(obj: any): obj is SteamProfile;
/**
 * Type guard to check if an object is a valid UserIntegration
 */
export declare function isUserIntegration(obj: any): obj is UserIntegration;
/**
 * Helper function to safely convert SteamProfile to UserIntegration
 */
export declare function safeSteamProfileToIntegration(steamProfile: SteamProfile | null | undefined, userId: string, additionalData?: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
    scopes?: string[];
}): UserIntegration | null;
/**
 * Helper function to safely convert UserIntegration to SteamProfile
 */
export declare function safeIntegrationToSteamProfile(integration: UserIntegration | null | undefined): SteamProfile | null;
//# sourceMappingURL=integrationAdapter.d.ts.map