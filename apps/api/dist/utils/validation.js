"use strict";
// Backend validation utilities for GamePilot API
// Provides comprehensive validation for all authentication and user data
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateIntegrationSchema = exports.connectIntegrationSchema = exports.updatePrivacySchema = exports.updatePreferencesSchema = exports.updateUserRequestSchema = exports.passwordResetConfirmSchema = exports.passwordResetRequestSchema = exports.accountDeletionRequestSchema = exports.registerRequestSchema = exports.loginRequestSchema = void 0;
exports.validateRequest = validateRequest;
exports.validateLoginRequest = validateLoginRequest;
exports.validateRegisterRequest = validateRegisterRequest;
exports.validateAccountDeletionRequest = validateAccountDeletionRequest;
exports.validatePasswordResetRequest = validatePasswordResetRequest;
exports.validatePasswordResetConfirm = validatePasswordResetConfirm;
exports.validateUpdateUserRequest = validateUpdateUserRequest;
exports.validateUpdatePreferencesRequest = validateUpdatePreferencesRequest;
exports.validateUpdatePrivacyRequest = validateUpdatePrivacyRequest;
exports.validateConnectIntegrationRequest = validateConnectIntegrationRequest;
exports.validateUpdateIntegrationRequest = validateUpdateIntegrationRequest;
exports.validateUserObject = validateUserObject;
exports.validateUserIntegrationObject = validateUserIntegrationObject;
exports.sanitizeString = sanitizeString;
exports.sanitizeEmail = sanitizeEmail;
exports.sanitizeUsername = sanitizeUsername;
exports.validateRateLimit = validateRateLimit;
const zod_1 = require("zod");
// Basic validation schemas
const emailSchema = zod_1.z.string().email('Invalid email format');
const passwordSchema = zod_1.z.string().min(6, 'Password must be at least 6 characters long');
const usernameSchema = zod_1.z.string().min(3, 'Username must be at least 3 characters long').max(50, 'Username must be less than 50 characters');
const userIdSchema = zod_1.z.string().uuid('Invalid user ID format');
const platformSchema = zod_1.z.enum(['steam', 'discord', 'youtube', 'twitch', 'spotify']);
// Authentication request schemas
exports.loginRequestSchema = zod_1.z.object({
    username: usernameSchema,
    password: zod_1.z.string().min(1, 'Password is required')
});
exports.registerRequestSchema = zod_1.z.object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    displayName: zod_1.z.string().min(1, 'Display name is required').max(100, 'Display name must be less than 100 characters').optional(),
    timezone: zod_1.z.string().optional()
});
exports.accountDeletionRequestSchema = zod_1.z.object({
    password: zod_1.z.string().min(1, 'Password is required'),
    confirmation: zod_1.z.literal('DELETE', { message: 'Please type "DELETE" to confirm account deletion' })
});
exports.passwordResetRequestSchema = zod_1.z.object({
    email: emailSchema
});
exports.passwordResetConfirmSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Reset token is required'),
    newPassword: passwordSchema
});
// User update schemas
exports.updateUserRequestSchema = zod_1.z.object({
    displayName: zod_1.z.string().min(1, 'Display name is required').max(100, 'Display name must be less than 100 characters').optional(),
    bio: zod_1.z.string().max(500, 'Bio must be less than 500 characters').optional(),
    location: zod_1.z.string().max(100, 'Location must be less than 100 characters').optional(),
    website: zod_1.z.string().url('Invalid website URL').optional(),
    timezone: zod_1.z.string().optional()
});
exports.updatePreferencesSchema = zod_1.z.object({
    theme: zod_1.z.enum(['dark', 'light', 'auto']).optional(),
    language: zod_1.z.string().length(2, 'Language must be a 2-letter code').optional(),
    notifications: zod_1.z.object({
        email: zod_1.z.boolean().optional(),
        push: zod_1.z.boolean().optional(),
        achievements: zod_1.z.boolean().optional(),
        recommendations: zod_1.z.boolean().optional(),
        friendActivity: zod_1.z.boolean().optional(),
        platformUpdates: zod_1.z.boolean().optional()
    }).optional(),
    display: zod_1.z.object({
        compactMode: zod_1.z.boolean().optional(),
        showGameCovers: zod_1.z.boolean().optional(),
        animateTransitions: zod_1.z.boolean().optional(),
        showRatings: zod_1.z.boolean().optional(),
        accentColor: zod_1.z.string().optional(),
        backgroundMode: zod_1.z.enum(['solid', 'gradient', 'image']).optional(),
        backgroundImageUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
        animationLevel: zod_1.z.enum(['low', 'medium', 'high']).optional(),
        density: zod_1.z.enum(['compact', 'comfortable']).optional(),
        lightingMode: zod_1.z.enum(['none', 'mood', 'rgb-sync']).optional(),
        borderRadius: zod_1.z.number().min(0).max(50).optional(),
        borderWidth: zod_1.z.number().min(0).max(10).optional(),
        shadowIntensity: zod_1.z.number().min(0).max(100).optional(),
        glassOpacity: zod_1.z.number().min(0).max(100).optional(),
        fontFamily: zod_1.z.string().optional(),
        fontSize: zod_1.z.string().optional(),
        fontWeight: zod_1.z.number().min(100).max(900).optional(),
        animationStyle: zod_1.z.string().optional(),
        hoverEffects: zod_1.z.boolean().optional(),
        loadingAnimations: zod_1.z.boolean().optional(),
        soundTheme: zod_1.z.string().optional(),
        soundEnabled: zod_1.z.boolean().optional(),
        volume: zod_1.z.number().min(0).max(100).optional()
    }).optional(),
    perPageCustomisation: zod_1.z.record(zod_1.z.any()).optional()
});
exports.updatePrivacySchema = zod_1.z.object({
    profileVisibility: zod_1.z.enum(['public', 'friends', 'private']).optional(),
    sharePlaytime: zod_1.z.boolean().optional(),
    shareAchievements: zod_1.z.boolean().optional(),
    shareGameLibrary: zod_1.z.boolean().optional(),
    allowFriendRequests: zod_1.z.boolean().optional(),
    showOnlineStatus: zod_1.z.boolean().optional()
});
// Integration schemas
exports.connectIntegrationSchema = zod_1.z.object({
    platform: platformSchema,
    accessToken: zod_1.z.string().min(1, 'Access token is required').optional(),
    refreshToken: zod_1.z.string().optional(),
    scopes: zod_1.z.array(zod_1.z.string()).optional()
});
exports.updateIntegrationSchema = zod_1.z.object({
    isActive: zod_1.z.boolean().optional(),
    syncConfig: zod_1.z.object({
        autoSync: zod_1.z.boolean().optional(),
        syncFrequency: zod_1.z.number().min(1, 'Sync frequency must be at least 1 hour').max(168, 'Sync frequency must be less than 168 hours (1 week)').optional()
    }).optional()
});
// Validation utility functions
function validateRequest(schema, data) {
    try {
        const validatedData = schema.parse(data);
        return {
            isValid: true,
            errors: [],
            data: validatedData
        };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const errors = error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code
            }));
            return {
                isValid: false,
                errors
            };
        }
        return {
            isValid: false,
            errors: [{
                    field: 'unknown',
                    message: 'Validation failed',
                    code: 'UNKNOWN_ERROR'
                }]
        };
    }
}
// Specific validation functions for auth endpoints
function validateLoginRequest(data) {
    return validateRequest(exports.loginRequestSchema, data);
}
function validateRegisterRequest(data) {
    return validateRequest(exports.registerRequestSchema, data);
}
function validateAccountDeletionRequest(data) {
    return validateRequest(exports.accountDeletionRequestSchema, data);
}
function validatePasswordResetRequest(data) {
    return validateRequest(exports.passwordResetRequestSchema, data);
}
function validatePasswordResetConfirm(data) {
    return validateRequest(exports.passwordResetConfirmSchema, data);
}
function validateUpdateUserRequest(data) {
    return validateRequest(exports.updateUserRequestSchema, data);
}
function validateUpdatePreferencesRequest(data) {
    return validateRequest(exports.updatePreferencesSchema, data);
}
function validateUpdatePrivacyRequest(data) {
    return validateRequest(exports.updatePrivacySchema, data);
}
function validateConnectIntegrationRequest(data) {
    return validateRequest(exports.connectIntegrationSchema, data);
}
function validateUpdateIntegrationRequest(data) {
    return validateRequest(exports.updateIntegrationSchema, data);
}
// Advanced validation functions
function validateUserObject(user) {
    const errors = [];
    if (!user || typeof user !== 'object') {
        errors.push({ field: 'user', message: 'User object is required', code: 'INVALID_TYPE' });
        return { isValid: false, errors };
    }
    // Basic field validation
    if (typeof user.id !== 'string') {
        errors.push({ field: 'id', message: 'User ID is required', code: 'INVALID_TYPE' });
    }
    if (typeof user.email !== 'string' || !emailSchema.safeParse(user.email).success) {
        errors.push({ field: 'email', message: 'Valid email is required', code: 'INVALID_EMAIL' });
    }
    if (typeof user.username !== 'string' || !usernameSchema.safeParse(user.username).success) {
        errors.push({ field: 'username', message: 'Valid username is required', code: 'INVALID_USERNAME' });
    }
    if (typeof user.displayName !== 'string' || user.displayName.length === 0) {
        errors.push({ field: 'displayName', message: 'Display name is required', code: 'INVALID_DISPLAY_NAME' });
    }
    // Date validation
    if (!(user.createdAt instanceof Date)) {
        errors.push({ field: 'createdAt', message: 'Valid creation date is required', code: 'INVALID_DATE' });
    }
    if (!(user.updatedAt instanceof Date)) {
        errors.push({ field: 'updatedAt', message: 'Valid update date is required', code: 'INVALID_DATE' });
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
function validateUserIntegrationObject(integration) {
    const errors = [];
    if (!integration || typeof integration !== 'object') {
        errors.push({ field: 'integration', message: 'Integration object is required', code: 'INVALID_TYPE' });
        return { isValid: false, errors };
    }
    // Basic field validation
    if (typeof integration.id !== 'string') {
        errors.push({ field: 'id', message: 'Integration ID is required', code: 'INVALID_TYPE' });
    }
    if (typeof integration.userId !== 'string') {
        errors.push({ field: 'userId', message: 'User ID is required', code: 'INVALID_TYPE' });
    }
    if (!platformSchema.safeParse(integration.platform).success) {
        errors.push({ field: 'platform', message: 'Valid platform is required', code: 'INVALID_PLATFORM' });
    }
    if (typeof integration.externalUserId !== 'string') {
        errors.push({ field: 'externalUserId', message: 'External user ID is required', code: 'INVALID_TYPE' });
    }
    // Boolean validation
    if (typeof integration.isConnected !== 'boolean') {
        errors.push({ field: 'isConnected', message: 'Connection status must be boolean', code: 'INVALID_TYPE' });
    }
    if (typeof integration.isActive !== 'boolean') {
        errors.push({ field: 'isActive', message: 'Active status must be boolean', code: 'INVALID_TYPE' });
    }
    // Date validation
    if (!(integration.createdAt instanceof Date)) {
        errors.push({ field: 'createdAt', message: 'Valid creation date is required', code: 'INVALID_DATE' });
    }
    if (!(integration.updatedAt instanceof Date)) {
        errors.push({ field: 'updatedAt', message: 'Valid update date is required', code: 'INVALID_DATE' });
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
// Sanitization functions
function sanitizeString(input, maxLength) {
    if (typeof input !== 'string')
        return '';
    let sanitized = input.trim();
    if (maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }
    // Basic XSS prevention
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    return sanitized;
}
function sanitizeEmail(input) {
    const email = sanitizeString(input, 254).toLowerCase();
    return email;
}
function sanitizeUsername(input) {
    const username = sanitizeString(input, 50);
    // Allow only alphanumeric, underscore, and hyphen
    return username.replace(/[^a-zA-Z0-9_-]/g, '');
}
// Rate limiting validation
function validateRateLimit(identifier, maxRequests, windowMs) {
    // This would typically use Redis or in-memory store
    // For now, return a mock implementation
    return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: new Date(Date.now() + windowMs)
    };
}
//# sourceMappingURL=validation.js.map