import type { Request } from 'express';
export interface SessionData {
    token: string;
    userId: string;
    createdAt: Date;
    expiresAt: Date;
    lastAccessed: Date;
    userAgent?: string;
    ipAddress?: string;
}
export declare class SessionService {
    /**
     * Create a new session in the database
     */
    createSession(userId: string, userAgent?: string, ipAddress?: string): Promise<SessionData>;
    /**
     * Validate and refresh a session
     */
    validateSession(token: string): Promise<SessionData | null>;
    /**
     * Update session last accessed time
     */
    private updateLastAccessed;
    /**
     * Delete a session
     */
    deleteSession(token: string): Promise<void>;
    /**
     * Delete all sessions for a user
     */
    deleteAllUserSessions(userId: string): Promise<void>;
    /**
     * Clean up expired sessions
     */
    cleanupExpiredSessions(): Promise<number>;
    /**
     * Get active sessions for a user
     */
    getUserSessions(userId: string): Promise<SessionData[]>;
    /**
     * Get session from request
     */
    getSessionFromRequest(req: Request): Promise<SessionData | null>;
}
export declare const sessionService: SessionService;
//# sourceMappingURL=sessionService.d.ts.map