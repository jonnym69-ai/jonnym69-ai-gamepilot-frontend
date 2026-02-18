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
const express_1 = require("express");
const zod_1 = require("zod");
const errorHandler_1 = require("../middleware/errorHandler");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const router = (0, express_1.Router)();
// Feedback data schema
const feedbackSchema = zod_1.z.object({
    type: zod_1.z.enum(['bug', 'feature', 'general', 'improvement']),
    title: zod_1.z.string().min(1, 'Title is required').max(200, 'Title too long'),
    description: zod_1.z.string().min(1, 'Description is required').max(2000, 'Description too long'),
    email: zod_1.z.string().email('Invalid email').optional().or(zod_1.z.literal('')),
    userAgent: zod_1.z.string(),
    url: zod_1.z.string(),
    timestamp: zod_1.z.string(),
    userId: zod_1.z.string().optional()
});
// Simple file-based feedback storage for beta
const FEEDBACK_FILE = path.join(__dirname, '../../data/feedback.json');
// POST /api/feedback
router.post('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        console.log('📝 Beta feedback submission received:', req.body.type);
        // Validate request body
        const validatedData = feedbackSchema.parse(req.body);
        // Create feedback entry
        const feedback = {
            id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...validatedData,
            status: 'new',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        // Ensure data directory exists
        const dataDir = path.dirname(FEEDBACK_FILE);
        try {
            await fs.access(dataDir);
        }
        catch {
            await fs.mkdir(dataDir, { recursive: true });
        }
        // Read existing feedback
        let existingFeedback = [];
        try {
            const data = await fs.readFile(FEEDBACK_FILE, 'utf-8');
            existingFeedback = JSON.parse(data);
        }
        catch {
            // File doesn't exist, start with empty array
        }
        // Add new feedback
        existingFeedback.push(feedback);
        // Save to file
        await fs.writeFile(FEEDBACK_FILE, JSON.stringify(existingFeedback, null, 2));
        console.log('✅ Beta feedback saved successfully:', feedback.id);
        // Log feedback for monitoring
        console.log('📊 Beta Feedback Stats:', {
            type: feedback.type,
            hasEmail: !!feedback.email,
            hasUserId: !!feedback.userId,
            timestamp: feedback.timestamp
        });
        res.status(201).json({
            success: true,
            message: 'Beta feedback submitted successfully',
            feedbackId: feedback.id
        });
    }
    catch (error) {
        console.error('❌ Beta feedback submission error:', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to submit beta feedback',
            message: 'Please try again later'
        });
    }
}));
// GET /api/feedback (admin only - for beta dashboard)
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        let feedback = [];
        try {
            const data = await fs.readFile(FEEDBACK_FILE, 'utf-8');
            feedback = JSON.parse(data);
        }
        catch {
            // File doesn't exist
        }
        // Sort by creation date (newest first)
        feedback.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        res.json({
            success: true,
            data: feedback,
            total: feedback.length
        });
    }
    catch (error) {
        console.error('❌ Error fetching beta feedback:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch beta feedback'
        });
    }
}));
// GET /api/feedback/stats (admin only)
router.get('/stats', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        let feedback = [];
        try {
            const data = await fs.readFile(FEEDBACK_FILE, 'utf-8');
            feedback = JSON.parse(data);
        }
        catch {
            // File doesn't exist
        }
        // Calculate stats
        const totalStats = feedback.reduce((acc, item) => {
            acc[item.type] = (acc[item.type] || 0) + 1;
            return acc;
        }, {});
        const recentFeedback = feedback.filter((item) => {
            const createdAt = new Date(item.createdAt);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return createdAt >= thirtyDaysAgo;
        });
        res.json({
            success: true,
            data: {
                totalStats,
                totalFeedback: feedback.length,
                recentFeedback: recentFeedback.length
            }
        });
    }
    catch (error) {
        console.error('❌ Error fetching beta feedback stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch beta feedback stats'
        });
    }
}));
exports.default = router;
//# sourceMappingURL=feedback.js.map