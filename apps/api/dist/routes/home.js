"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authService_1 = require("../auth/authService");
const database_1 = require("../services/database");
const router = (0, express_1.Router)();
// GET /api/home - Get home page data for authenticated user
router.get('/', authService_1.authenticateToken, async (req, res) => {
    try {
        const currentUser = (0, authService_1.getCurrentUser)(req);
        if (!currentUser) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        // Get user's games from database
        const userGames = await database_1.databaseService.getUserGames(currentUser.id);
        // Get recent games (last 3)
        const recentGames = userGames.slice(-3).reverse();
        // Get integration statuses (for now, return false for all)
        // This would be implemented when we have integration tracking
        const integrations = {
            steam: false,
            discord: false,
            youtube: false,
            twitch: false
        };
        res.json({
            success: true,
            data: {
                user: currentUser,
                libraryCount: userGames.length,
                recentGames,
                integrations
            }
        });
    }
    catch (error) {
        console.error('Error fetching home data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch home data',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});
exports.default = router;
//# sourceMappingURL=home.js.map