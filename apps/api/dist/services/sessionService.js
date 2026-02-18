"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionService = exports.SessionService = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const database_1 = require("./database");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
// Validate JWT secret in production
if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'your-secret-key-change-in-production') {
    throw new Error('CRITICAL: JWT_SECRET must be set in production environment');
}
if (JWT_SECRET.length < 32) {
    console.warn('WARNING: JWT_SECRET should be at least 32 characters long for security');
}
class SessionService {
    /**
     * Create a new session in the database
     */
    async createSession(userId, userAgent, ipAddress) {
        const token = jwt.sign({
            id: userId,
            type: 'session'
        }, JWT_SECRET, { expiresIn: '7d' });
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
        const sessionData = {
            token,
            userId,
            createdAt: now,
            expiresAt,
            lastAccessed: now,
            userAgent,
            ipAddress
        };
        // Store session in database
        await database_1.databaseService.createSession(sessionData);
        console.log('✅ Session created for user:', userId);
        return sessionData;
    }
    /**
     * Validate and refresh a session
     */
    async validateSession(token) {
        try {
            // Verify JWT token
            const decoded = jwt.verify(token, JWT_SECRET);
            if (decoded.type !== 'session') {
                return null;
            }
            // Check if session exists in database and is not expired
            const session = await database_1.databaseService.getSession(token);
            if (!session) {
                console.log('❌ Session not found in database');
                return null;
            }
            const now = new Date();
            const expiresAt = new Date(session.expiresAt);
            if (now > expiresAt) {
                console.log('❌ Session expired');
                await this.deleteSession(token);
                return null;
            }
            // Update last accessed time
            await this.updateLastAccessed(token);
            return {
                token: session.token,
                userId: session.userId,
                createdAt: session.createdAt,
                expiresAt: session.expiresAt,
                lastAccessed: session.lastAccessed,
                userAgent: session.userAgent,
                ipAddress: session.ipAddress
            };
        }
        catch (error) {
            console.error('❌ Session validation error:', error);
            return null;
        }
    }
    /**
     * Update session last accessed time
     */
    async updateLastAccessed(token) {
        const session = await database_1.databaseService.getSession(token);
        if (session) {
            await database_1.databaseService.updateSession({
                ...session,
                lastAccessed: new Date()
            });
        }
    }
    /**
     * Delete a session
     */
    async deleteSession(token) {
        await database_1.databaseService.deleteSession(token);
        console.log('🗑️ Session deleted');
    }
    /**
     * Delete all sessions for a user
     */
    async deleteAllUserSessions(userId) {
        await database_1.databaseService.deleteAllUserSessions(userId);
        console.log('🗑️ All sessions deleted for user:', userId);
    }
    /**
     * Clean up expired sessions
     */
    async cleanupExpiredSessions() {
        const deletedCount = await database_1.databaseService.deleteExpiredSessions();
        if (deletedCount > 0) {
            console.log('🧹 Cleaned up expired sessions:', deletedCount);
        }
        return deletedCount;
    }
    /**
     * Get active sessions for a user
     */
    async getUserSessions(userId) {
        // Use getAll to query sessions directly
        const sessions = await database_1.databaseService.getAll('SELECT * FROM sessions WHERE userId = ? AND expiresAt > ? ORDER BY lastAccessed DESC', [userId, new Date().toISOString()]);
        return sessions.map(session => ({
            token: session.token,
            userId: session.userId,
            createdAt: new Date(session.createdAt),
            expiresAt: new Date(session.expiresAt),
            lastAccessed: new Date(session.lastAccessed),
            userAgent: session.userAgent,
            ipAddress: session.ipAddress
        }));
    }
    /**
     * Get session from request
     */
    async getSessionFromRequest(req) {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        // Also check for token in cookie
        const cookieToken = req.cookies?.token;
        const authToken = token || cookieToken;
        if (!authToken) {
            return null;
        }
        return await this.validateSession(authToken);
    }
}
exports.SessionService = SessionService;
// Export singleton instance
exports.sessionService = new SessionService();
//# sourceMappingURL=sessionService.js.map