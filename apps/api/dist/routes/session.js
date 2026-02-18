"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../services/database");
const sessionStore_1 = require("../auth/sessionStore");
const router = (0, express_1.Router)();
/**
 * GET /me
 * Get current user from session token
 */
router.get('/me', async (req, res) => {
    try {
        // Get session token from Authorization header or query parameter
        const sessionToken = req.headers.authorization?.replace('Bearer ', '') ||
            req.query.token ||
            req.session?.sessionToken;
        if (!sessionToken) {
            return res.status(401).json({
                error: 'No session token provided',
                message: 'Authentication required'
            });
        }
        // Validate session
        const session = await (0, sessionStore_1.getSession)(sessionToken);
        if (!session) {
            return res.status(401).json({
                error: 'Invalid or expired session',
                message: 'Please login again'
            });
        }
        // Get user from database
        const user = await database_1.databaseService.getUserById(session.userId);
        if (!user) {
            return res.status(401).json({
                error: 'User not found',
                message: 'Please login again'
            });
        }
        console.log('👤 Session validated for user:', user.id);
        res.json({
            user: {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                avatar: user.avatar,
                // Steam fields are stored as custom fields or in integrations
                steamId: user.steamId,
                personaName: user.personaName
            }
        });
    }
    catch (error) {
        console.error('❌ Failed to get current user:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to get current user'
        });
    }
});
exports.default = router;
//# sourceMappingURL=session.js.map