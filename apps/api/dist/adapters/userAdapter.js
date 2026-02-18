"use strict";
// User Adapter - Non-destructive mapping between legacy and canonical User models
// This adapter provides bidirectional conversion without breaking existing functionality
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAdapter = void 0;
exports.isAuthUser = isAuthUser;
exports.isCanonicalUser = isCanonicalUser;
exports.safeCanonicalToAuthUser = safeCanonicalToAuthUser;
exports.safeAuthUserToCanonical = safeAuthUserToCanonical;
/**
 * Adapter for converting between canonical User and legacy AuthUser models
 * Provides non-destructive migration path for authentication services
 */
class UserAdapter {
    /**
     * Convert canonical User to legacy AuthUser
     * Used when authentication services need to return legacy format
     */
    static canonicalToAuthUser(canonical) {
        return {
            id: canonical.id,
            username: canonical.username,
            email: canonical.email
        };
    }
    /**
     * Convert legacy AuthUser to canonical User (basic fields only)
     * Used when creating new users from authentication
     */
    static authUserToCanonical(authUser, additionalData) {
        const now = new Date();
        return {
            // Basic user info from AuthUser
            id: authUser.id,
            email: authUser.email,
            username: authUser.username,
            displayName: additionalData?.displayName || authUser.username,
            avatar: additionalData?.avatar,
            bio: additionalData?.bio,
            location: additionalData?.location,
            website: additionalData?.website,
            timezone: additionalData?.timezone || 'UTC',
            // Timestamps
            createdAt: additionalData?.createdAt || now,
            updatedAt: additionalData?.updatedAt || now,
            lastActive: additionalData?.lastActive,
            // Gaming profile (defaults for new users)
            gamingProfile: additionalData?.gamingProfile || {
                primaryPlatforms: [],
                genreAffinities: {},
                playstyleArchetypes: [],
                moodProfile: {
                    moodHistory: [],
                    moodTriggers: [],
                    moodPreferences: {}
                },
                totalPlaytime: 0,
                gamesPlayed: 0,
                gamesCompleted: 0,
                achievementsCount: 0,
                averageRating: 0,
                currentStreak: 0,
                longestStreak: 0,
                favoriteGames: []
            },
            // Integrations (empty for new users)
            integrations: additionalData?.integrations || [],
            // Privacy settings (defaults)
            privacy: additionalData?.privacy || {
                profileVisibility: 'private',
                sharePlaytime: false,
                shareAchievements: false,
                shareGameLibrary: false,
                allowFriendRequests: true,
                showOnlineStatus: false
            },
            // User preferences (defaults)
            preferences: additionalData?.preferences || {
                theme: 'dark',
                language: 'en',
                notifications: {
                    email: true,
                    push: true,
                    achievements: true,
                    recommendations: true,
                    friendActivity: true,
                    platformUpdates: false
                },
                display: {
                    compactMode: false,
                    showGameCovers: true,
                    animateTransitions: true,
                    showRatings: true
                }
            },
            // Social features (defaults)
            social: additionalData?.social || {
                friends: [],
                blockedUsers: [],
                favoriteGenres: [],
                customTags: []
            },
            // Custom fields
            customFields: additionalData?.customFields
        };
    }
    /**
     * Create canonical User from registration data
     * Used during user registration process
     */
    static fromRegistrationData(authUser, registrationData) {
        return this.authUserToCanonical(authUser, {
            displayName: registrationData?.displayName,
            avatar: registrationData?.avatar,
            bio: registrationData?.bio,
            location: registrationData?.location,
            website: registrationData?.website,
            timezone: registrationData?.timezone
        });
    }
    /**
     * Validate that a canonical User can be converted to AuthUser
     * Ensures required fields are present for authentication
     */
    static validateForAuth(user) {
        const errors = [];
        if (!user.id)
            errors.push('User ID is required');
        if (!user.username)
            errors.push('Username is required');
        if (!user.email)
            errors.push('Email is required');
        // Validate email format
        if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
            errors.push('Invalid email format');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Create a safe public profile from canonical User
     * Used for public user data exposure
     */
    static toPublicProfile(user) {
        return {
            ...user,
            // Remove sensitive data
            social: {
                ...user.social,
                friends: [], // Remove friends list for privacy
                blockedUsers: [] // Remove blocked users for privacy
            }
        };
    }
    /**
     * Update canonical User from legacy AuthUser changes
     * Used when authentication data changes
     */
    static updateFromAuthUser(canonical, authUser) {
        return {
            ...canonical,
            id: authUser.id, // Allow ID changes for migration scenarios
            username: authUser.username,
            email: authUser.email,
            updatedAt: new Date()
        };
    }
    /**
     * Extract authentication-relevant data from canonical User
     * Used for JWT token generation
     */
    static extractAuthData(user) {
        return this.canonicalToAuthUser(user);
    }
    /**
     * Check if user has completed onboarding
     * Based on canonical User profile completeness
     */
    static hasCompletedOnboarding(user) {
        return !!(user.displayName &&
            user.displayName !== user.username && // Has custom display name
            user.avatar && // Has uploaded avatar
            user.gamingProfile.primaryPlatforms.length > 0 // Has connected at least one platform
        );
    }
    /**
     * Get user's authentication status
     * Based on canonical User integration status
     */
    static getAuthStatus(user) {
        return {
            isAuthenticated: true, // If we have a User object, they're authenticated
            hasIntegrations: user.integrations.length > 0,
            lastActive: user.lastActive || null,
            isOnboarded: this.hasCompletedOnboarding(user)
        };
    }
}
exports.UserAdapter = UserAdapter;
/**
 * Type guard to check if an object is a valid AuthUser
 */
function isAuthUser(obj) {
    return obj &&
        typeof obj.id === 'string' &&
        typeof obj.username === 'string' &&
        typeof obj.email === 'string';
}
/**
 * Type guard to check if an object is a valid canonical User
 */
function isCanonicalUser(obj) {
    return obj &&
        typeof obj.id === 'string' &&
        typeof obj.username === 'string' &&
        typeof obj.email === 'string' &&
        typeof obj.displayName === 'string' &&
        obj.gamingProfile &&
        obj.integrations &&
        obj.privacy &&
        obj.preferences &&
        obj.social;
}
/**
 * Helper function to safely convert with fallback
 */
function safeCanonicalToAuthUser(user) {
    if (!user)
        return null;
    const validation = UserAdapter.validateForAuth(user);
    if (!validation.isValid) {
        console.warn('Invalid user data for AuthUser conversion:', validation.errors);
        return null;
    }
    return UserAdapter.canonicalToAuthUser(user);
}
/**
 * Helper function to safely convert with fallback
 */
function safeAuthUserToCanonical(authUser) {
    if (!authUser)
        return null;
    try {
        return UserAdapter.authUserToCanonical(authUser);
    }
    catch (error) {
        console.error('Error converting AuthUser to canonical:', error);
        return null;
    }
}
//# sourceMappingURL=userAdapter.js.map