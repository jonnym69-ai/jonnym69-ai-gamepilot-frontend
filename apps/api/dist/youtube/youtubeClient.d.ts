import { UserIntegration } from '@gamepilot/shared/models/integration';
/**
 * Get YouTube profile and convert to canonical UserIntegration
 * Now returns canonical UserIntegration
 */
export declare function getYouTubeProfile(userId?: string): Promise<any>;
/**
 * Get YouTube profile as canonical UserIntegration
 * New function that returns the canonical UserIntegration model
 */
export declare function getYouTubeIntegration(userId: string, authData?: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
    scopes?: string[];
}): Promise<UserIntegration>;
/**
 * Migrate legacy YouTube integration to canonical UserIntegration
 * Used when upgrading existing YouTube integrations to the new model
 */
export declare function migrateLegacyYouTubeIntegration(legacyProfile: any, userId: string, additionalData?: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
    scopes?: string[];
}): UserIntegration;
/**
 * Update YouTube integration tokens
 * Uses canonical UserIntegration model for token management
 */
export declare function updateYouTubeTokens(integration: UserIntegration, tokenData: {
    accessToken: string;
    refreshToken?: string;
    expiresAt: Date;
}): UserIntegration;
/**
 * Update YouTube integration status
 * Uses canonical UserIntegration model for status management
 */
export declare function updateYouTubeStatus(integration: UserIntegration, status: 'active' | 'error' | 'expired' | 'revoked', errorCount?: number): UserIntegration;
/**
 * Validate YouTube integration
 * Uses canonical UserIntegration model for validation
 */
export declare function validateYouTubeIntegration(integration: UserIntegration): {
    isValid: boolean;
    errors: string[];
};
/**
 * Get YouTube videos for user
 * Uses canonical UserIntegration model for user context
 */
export declare function getYouTubeVideos(userId: string, maxResults?: number): Promise<any[]>;
/**
 * Search YouTube videos for gaming content
 * Uses canonical UserIntegration model for user context
 */
export declare function searchYouTubeVideos(userId: string, query: string, maxResults?: number): Promise<any[]>;
//# sourceMappingURL=youtubeClient.d.ts.map