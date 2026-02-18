"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Simple test route to verify Steam auth is working
router.get('/test', (req, res) => {
    console.log('🧪 Steam auth test route hit');
    res.json({
        message: 'Steam auth is working',
        timestamp: new Date().toISOString(),
        env: {
            STEAM_API_KEY: process.env.STEAM_API_KEY ? 'SET' : 'NOT SET',
            NODE_ENV: process.env.NODE_ENV
        }
    });
});
exports.default = router;
