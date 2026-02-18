export interface SessionData {
    token: string;
    userId: string;
    createdAt: Date;
    expiresAt: Date;
    lastAccessed: Date;
    userAgent?: string;
    ipAddress?: string;
}
/**
 * Generate a secure session token
 */
export declare function generateSessionToken(): string;
/**
 * Create a new session with database persistence
 */
export declare function createSession(userId: string, userAgent?: string, ipAddress?: string): Promise<string>;
/**
 * Get session by token with database lookup
 */
export declare function getSession(sessionToken: string, userAgent?: string, ipAddress?: string): Promise<SessionData | null>;
/**
 * Delete session from database
 */
export declare function deleteSession(sessionToken: string): Promise<boolean>;
/**
 * Delete all sessions for a user (for logout all devices)
 */
export declare function deleteAllUserSessions(userId: string): Promise<number>;
/**
 * Clean up expired sessions from database
 */
export declare function cleanupExpiredSessions(): Promise<number>;
/**
 * Get active sessions count for a user
 */
export declare function getUserSessionCount(userId: string): Promise<number>;
/**
 * Validate session and return user ID
 */
export declare function validateSession(sessionToken: string, userAgent?: string, ipAddress?: string): Promise<string | null>;
/**
 * Fallback session creation for development (when database is not available)
 */
export declare function createFallbackSession(userId: string): string;
/**
 * Fallback session retrieval for development
 */
export declare function getFallbackSession(sessionToken: string): {
    userId: string;
    createdAt: Date;
    expiresAt: Date;
} | null;
/**
 * Fallback session deletion for development
 */
export declare function deleteFallbackSession(sessionToken: string): boolean;
//# sourceMappingURL=sessionStore.d.ts.map