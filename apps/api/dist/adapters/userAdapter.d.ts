import { User } from '@gamepilot/shared';
type AuthUser = any;
/**
 * Adapter for converting between canonical User and legacy AuthUser models
 * Provides non-destructive migration path for authentication services
 */
export declare class UserAdapter {
    /**
     * Convert canonical User to legacy AuthUser
     * Used when authentication services need to return legacy format
     */
    static canonicalToAuthUser(canonical: User): AuthUser;
    /**
     * Convert legacy AuthUser to canonical User (basic fields only)
     * Used when creating new users from authentication
     */
    static authUserToCanonical(authUser: AuthUser, additionalData?: Partial<User>): User;
    /**
     * Create canonical User from registration data
     * Used during user registration process
     */
    static fromRegistrationData(authUser: AuthUser, registrationData?: {
        displayName?: string;
        avatar?: string;
        bio?: string;
        location?: string;
        website?: string;
        timezone?: string;
    }): User;
    /**
     * Validate that a canonical User can be converted to AuthUser
     * Ensures required fields are present for authentication
     */
    static validateForAuth(user: User): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Create a safe public profile from canonical User
     * Used for public user data exposure
     */
    static toPublicProfile(user: User): Omit<User, 'email' | 'integrations' | 'social.friends' | 'social.blockedUsers'>;
    /**
     * Update canonical User from legacy AuthUser changes
     * Used when authentication data changes
     */
    static updateFromAuthUser(canonical: User, authUser: AuthUser): User;
    /**
     * Extract authentication-relevant data from canonical User
     * Used for JWT token generation
     */
    static extractAuthData(user: User): AuthUser;
    /**
     * Check if user has completed onboarding
     * Based on canonical User profile completeness
     */
    static hasCompletedOnboarding(user: User): boolean;
    /**
     * Get user's authentication status
     * Based on canonical User integration status
     */
    static getAuthStatus(user: User): {
        isAuthenticated: boolean;
        hasIntegrations: boolean;
        lastActive: Date | null;
        isOnboarded: boolean;
    };
}
/**
 * Type guard to check if an object is a valid AuthUser
 */
export declare function isAuthUser(obj: any): obj is AuthUser;
/**
 * Type guard to check if an object is a valid canonical User
 */
export declare function isCanonicalUser(obj: any): obj is User;
/**
 * Helper function to safely convert with fallback
 */
export declare function safeCanonicalToAuthUser(user: User | null | undefined): AuthUser | null;
/**
 * Helper function to safely convert with fallback
 */
export declare function safeAuthUserToCanonical(authUser: AuthUser | null | undefined): User | null;
export {};
//# sourceMappingURL=userAdapter.d.ts.map