"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSessionToken = generateSessionToken;
exports.createSession = createSession;
exports.getSession = getSession;
exports.deleteSession = deleteSession;
exports.deleteAllUserSessions = deleteAllUserSessions;
exports.cleanupExpiredSessions = cleanupExpiredSessions;
exports.getUserSessionCount = getUserSessionCount;
exports.validateSession = validateSession;
exports.createFallbackSession = createFallbackSession;
exports.getFallbackSession = getFallbackSession;
exports.deleteFallbackSession = deleteFallbackSession;
const crypto_1 = __importDefault(require("crypto"));
const database_1 = require("../services/database");
/**
 * Generate a secure session token
 */
function generateSessionToken() {
    return crypto_1.default.randomBytes(32).toString('hex');
}
/**
 * Create a new session with database persistence
 */
async function createSession(userId, userAgent, ipAddress) {
    const sessionToken = generateSessionToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const sessionData = {
        token: sessionToken,
        userId,
        createdAt: now,
        expiresAt,
        lastAccessed: now,
        userAgent,
        ipAddress
    };
    try {
        // Store session in database for persistence
        await database_1.databaseService.createSession(sessionData);
        // Clean up expired sessions
        await cleanupExpiredSessions();
        console.log('🔐 Session created and persisted for user:', userId);
        return sessionToken;
    }
    catch (error) {
        console.error('❌ Failed to create session:', error);
        throw new Error('Session creation failed');
    }
}
/**
 * Get session by token with database lookup
 */
async function getSession(sessionToken, userAgent, ipAddress) {
    try {
        const session = await database_1.databaseService.getSession(sessionToken);
        if (!session) {
            return null;
        }
        if (session.expiresAt < new Date()) {
            await deleteSession(sessionToken);
            return null;
        }
        // Update last accessed time
        session.lastAccessed = new Date();
        if (userAgent)
            session.userAgent = userAgent;
        if (ipAddress)
            session.ipAddress = ipAddress;
        await database_1.databaseService.updateSession(session);
        return session;
    }
    catch (error) {
        console.error('❌ Failed to get session:', error);
        return null;
    }
}
/**
 * Delete session from database
 */
async function deleteSession(sessionToken) {
    try {
        const deleted = await database_1.databaseService.deleteSession(sessionToken);
        if (deleted) {
            console.log('🗑️ Session deleted from database:', sessionToken);
        }
        return deleted;
    }
    catch (error) {
        console.error('❌ Failed to delete session:', error);
        return false;
    }
}
/**
 * Delete all sessions for a user (for logout all devices)
 */
async function deleteAllUserSessions(userId) {
    try {
        const deletedCount = await database_1.databaseService.deleteAllUserSessions(userId);
        console.log(`🗑️ Deleted ${deletedCount} sessions for user:`, userId);
        return deletedCount;
    }
    catch (error) {
        console.error('❌ Failed to delete all user sessions:', error);
        return 0;
    }
}
/**
 * Clean up expired sessions from database
 */
async function cleanupExpiredSessions() {
    try {
        const deletedCount = await database_1.databaseService.deleteExpiredSessions();
        if (deletedCount > 0) {
            console.log(`🧹 Cleaned up ${deletedCount} expired sessions`);
        }
        return deletedCount;
    }
    catch (error) {
        console.error('❌ Failed to cleanup expired sessions:', error);
        return 0;
    }
}
/**
 * Get active sessions count for a user
 */
async function getUserSessionCount(userId) {
    try {
        return await database_1.databaseService.getUserSessionCount(userId);
    }
    catch (error) {
        console.error('❌ Failed to get user session count:', error);
        return 0;
    }
}
/**
 * Validate session and return user ID
 */
async function validateSession(sessionToken, userAgent, ipAddress) {
    const session = await getSession(sessionToken, userAgent, ipAddress);
    return session ? session.userId : null;
}
// Legacy in-memory session store for fallback (development only)
const fallbackSessionStore = new Map();
/**
 * Fallback session creation for development (when database is not available)
 */
function createFallbackSession(userId) {
    const sessionToken = generateSessionToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    fallbackSessionStore.set(sessionToken, {
        userId,
        createdAt: now,
        expiresAt
    });
    console.log('🔐 Fallback session created for user:', userId);
    return sessionToken;
}
/**
 * Fallback session retrieval for development
 */
function getFallbackSession(sessionToken) {
    const session = fallbackSessionStore.get(sessionToken);
    if (!session) {
        return null;
    }
    if (session.expiresAt < new Date()) {
        fallbackSessionStore.delete(sessionToken);
        return null;
    }
    return session;
}
/**
 * Fallback session deletion for development
 */
function deleteFallbackSession(sessionToken) {
    const deleted = fallbackSessionStore.delete(sessionToken);
    if (deleted) {
        console.log('🗑️ Fallback session deleted:', sessionToken);
    }
    return deleted;
}
//# sourceMappingURL=sessionStore.js.map