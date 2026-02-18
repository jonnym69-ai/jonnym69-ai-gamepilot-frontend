"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const identityService_1 = require("../identity/identityService");
const userAdapter_1 = require("../adapters/userAdapter");
const validation_1 = require("../utils/validation");
const schemas_1 = require("../validation/schemas");
const sessionService_1 = require("../services/sessionService");
const router = (0, express_1.Router)();
/**
 * POST /auth/set-password
 * Set password for existing user (for Steam users)
 */
router.post('/set-password', async (req, res) => {
    try {
        console.log('🔐 POST /auth/set-password - Set password request received');
        const { userId, password } = req.body;
        if (!userId || !password) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'User ID and password are required'
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Password must be at least 6 characters long'
            });
        }
        const result = await identityService_1.identityService.setPassword(userId, password);
        return res.status(result.success ? 200 : 400).json(result);
    }
    catch (error) {
        console.error('❌ Set password error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to set password',
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
});
/**
 * POST /auth/login
 * User login endpoint
 * Now uses unified identity service with canonical User internally
 */
router.post('/login', (0, schemas_1.validateBody)(schemas_1.loginSchema), async (req, res) => {
    try {
        console.log('🔐 POST /auth/login - Login request received');
        const loginData = req.body;
        console.log('🔍 Processing login for user:', loginData.username);
        const result = await identityService_1.identityService.login(loginData);
        if (result.success && result.user) {
            // Create session in database
            try {
                const sessionData = await sessionService_1.sessionService.createSession(result.user.id, req.get('User-Agent') || 'unknown', req.ip || 'unknown');
                // Use the token from the session
                const sessionToken = sessionData.token;
                // Set HTTP-only cookie
                res.cookie('token', sessionToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
                });
                console.log('✅ Login successful, session created for user:', result.user.username);
            }
            catch (sessionError) {
                console.warn('Failed to create session:', sessionError);
                // Fallback to token-based auth
                res.cookie('token', result.token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
                });
                console.log('✅ Login successful, token set for user:', result.user.username);
            }
        }
        else {
            console.log('❌ Login failed:', result.message);
        }
        return res.status(result.success ? 200 : 401).json(result);
    }
    catch (error) {
        console.error('❌ Login error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        // Ensure we always return valid JSON
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Login failed',
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
});
/**
 * POST /auth/register
 * User registration endpoint
 * Now creates canonical User internally via unified identity service
 */
router.post('/register', (0, schemas_1.validateBody)(schemas_1.registerSchema), async (req, res) => {
    try {
        console.log('👤 POST /auth/register - Registration request received');
        const registerData = req.body;
        console.log('🔍 Processing registration for user:', registerData.username, registerData.email);
        const result = await identityService_1.identityService.register(registerData);
        if (result.success && result.user) {
            // Create session in database
            try {
                const sessionData = await sessionService_1.sessionService.createSession(result.user.id, req.get('User-Agent') || 'unknown', req.ip || 'unknown');
                // Use the token from the session
                const sessionToken = sessionData.token;
                // Set HTTP-only cookie
                res.cookie('token', sessionToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
                });
                console.log('✅ Registration successful, session created for user:', result.user.username);
            }
            catch (sessionError) {
                console.warn('Failed to create session:', sessionError);
                // Fallback to token-based auth
                res.cookie('token', result.token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
                });
                console.log('✅ Registration successful, token set for user:', result.user.username);
            }
        }
        else {
            console.log('❌ Registration failed:', result.message);
        }
        return res.status(result.success ? 201 : 400).json(result);
    }
    catch (error) {
        console.error('❌ Registration error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        // Ensure we always return valid JSON
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Registration failed',
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
});
/**
 * POST /auth/refresh
 * Refresh JWT token
 * Now works with canonical User internally via unified identity service
 */
router.post('/refresh', identityService_1.authenticateToken, async (req, res) => {
    try {
        console.log('🔄 POST /auth/refresh - Token refresh request received');
        // Get token from request
        const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }
        // Validate session
        const sessionData = await sessionService_1.sessionService.validateSession(token);
        if (!sessionData) {
            console.log('❌ Session validation failed');
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired session'
            });
        }
        // Get user data for the session
        const result = await identityService_1.identityService.getComprehensiveUserProfile(req);
        if (result.success && result.user) {
            // Session is already validated and refreshed by validateSession
            // The same token can be used, but we update the cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            console.log('✅ Session refreshed for user:', result.user.username);
            return res.status(200).json({
                success: true,
                user: result.user,
                token // Return the same token since session was refreshed
            });
        }
        else {
            console.log('❌ Failed to get user profile during refresh');
            return res.status(401).json({
                success: false,
                message: 'Failed to refresh session'
            });
        }
    }
    catch (error) {
        console.error('Token refresh error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Token refresh failed'
        });
    }
});
/**
 * GET /auth/logout
 * Logout user and clear authentication
 */
router.get('/logout', async (req, res) => {
    try {
        console.log('🚪 GET /auth/logout - Logout request received');
        // Get token from cookie or header
        const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
        // Clean up session if token exists
        if (token) {
            try {
                await sessionService_1.sessionService.deleteSession(token);
                console.log('✅ Session deleted from database');
            }
            catch (sessionError) {
                console.warn('Failed to delete session:', sessionError);
                // Continue anyway - still clear cookie
            }
        }
        // Clear the authentication cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        console.log('✅ User logged out successfully, cookie cleared');
        // Always return JSON response - let frontend handle navigation
        res.json({
            success: true,
            message: 'Logout successful'
        });
    }
    catch (error) {
        console.error('❌ Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed'
        });
    }
});
// Note: Steam authentication endpoints are handled in steamAuth.ts
/**
 * GET /auth/me
 * Get current authenticated user info
 * Now uses comprehensive profile from unified identity service
 */
router.get('/me', async (req, res) => {
    try {
        console.log('👤 GET /auth/me - Current user info requested');
        // Try to get user, but allow requests without authentication for development
        let user = null;
        try {
            user = req.user;
        }
        catch (error) {
            console.log('👤 No user authentication, returning null for development');
        }
        if (!user) {
            // Return null user for development without authentication
            return res.json({
                success: false,
                message: 'No authenticated user'
            });
        }
        // Check if identityService is available
        if (!identityService_1.identityService) {
            console.error('❌ identityService is not available');
            return res.status(500).json({
                error: 'Internal server error',
                message: 'Identity service not available'
            });
        }
        // Use the comprehensive profile method from unified identity service
        console.log('👤 Calling getComprehensiveUserProfile...');
        const result = await identityService_1.identityService.getComprehensiveUserProfile(req);
        console.log('👤 getComprehensiveUserProfile result:', result);
        if (!result.success) {
            console.log('❌ Failed to get user profile:', result.message);
            return res.status(401).json({
                error: 'Not authenticated',
                message: result.message || 'No valid authentication token found'
            });
        }
        console.log('✅ Retrieved comprehensive profile for user:', result.user?.username);
        // Return enhanced user data with canonical information
        return res.status(200).json({
            success: true,
            data: {
                // Legacy fields for compatibility
                id: result.user.id,
                username: result.user.username,
                email: result.user.email,
                // Enhanced canonical data (new fields)
                displayName: result.user.displayName,
                avatar: result.user.avatar,
                bio: result.user.bio,
                location: result.user.location,
                timezone: result.user.timezone,
                createdAt: result.user.createdAt,
                lastActive: result.user.lastActive,
                // Gaming profile summary
                gamingProfile: {
                    totalPlaytime: result.user.gamingProfile.totalPlaytime,
                    gamesPlayed: result.user.gamingProfile.gamesPlayed,
                    achievementsCount: result.user.gamingProfile.achievementsCount,
                    primaryPlatforms: result.user.gamingProfile.primaryPlatforms,
                    currentMood: result.user.gamingProfile.moodProfile.currentMood
                },
                // Integration status and summary
                integrations: result.integrations || [],
                integrationSummary: result.user.integrationSummary || {
                    totalIntegrations: 0,
                    connectedPlatforms: [],
                    activeIntegrations: 0,
                    lastSyncTimes: []
                },
                // Authentication state
                authState: result.authState,
                // Validation status
                validation: result.validation
            }
        });
    }
    catch (error) {
        console.error('❌ Get user info error:', error);
        console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        // Ensure we always return valid JSON
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve user information',
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
});
/**
 * GET /auth/verify
 * Verify if token is valid
 * Now provides enhanced canonical user information when available
 */
router.get('/verify', identityService_1.authenticateToken, async (req, res) => {
    try {
        console.log('🔐 GET /auth/verify - Token verification requested');
        const authUser = req.user;
        // Get canonical user for enhanced verification
        const canonicalUser = await (0, identityService_1.getCanonicalUser)(req);
        const response = {
            success: true,
            valid: !!authUser,
            user: authUser ? {
                id: authUser.id,
                username: authUser.username,
                email: authUser.email
            } : null
        };
        // Add canonical user info if available
        if (canonicalUser) {
            console.log('✅ Token valid for canonical user:', canonicalUser.username);
            response.canonicalUser = {
                id: canonicalUser.id,
                username: canonicalUser.username,
                displayName: canonicalUser.displayName,
                avatar: canonicalUser.avatar,
                isOnboarded: userAdapter_1.UserAdapter.hasCompletedOnboarding(canonicalUser),
                integrationCount: canonicalUser.integrations.length,
                lastActive: canonicalUser.lastActive
            };
        }
        else {
            console.log('❌ Token invalid or canonical user not found');
        }
        return res.status(200).json(response);
    }
    catch (error) {
        console.error('Token verification error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Token verification failed'
        });
    }
});
/**
 * DELETE /auth/account
 * Delete user account and all associated data
 * Requires authentication and password confirmation
 */
router.delete('/account', identityService_1.authenticateToken, async (req, res) => {
    try {
        console.log('🗑️ DELETE /auth/account - Account deletion request received');
        const authUser = req.user;
        // Validate request data
        const validation = (0, validation_1.validateAccountDeletionRequest)(req.body);
        if (!validation.isValid) {
            console.log('❌ Account deletion validation failed:', validation.errors);
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Invalid input data',
                details: validation.errors
            });
        }
        const { password, confirmation } = validation.data;
        // Get canonical user for comprehensive deletion
        const canonicalUser = await (0, identityService_1.getCanonicalUser)(req);
        if (!canonicalUser) {
            console.log('❌ Account deletion failed: user not found');
            return res.status(404).json({
                error: 'User not found',
                message: 'Unable to locate user account for deletion'
            });
        }
        console.log('🔍 Processing account deletion for user:', canonicalUser.username);
        // Use identity service for secure account deletion
        const result = await (0, identityService_1.deleteUserAccount)(authUser.id, password);
        if (result.success) {
            console.log('✅ Account deletion successful for user:', canonicalUser.username);
            // Clear authentication cookie
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });
            return res.status(200).json({
                success: true,
                message: 'Account deleted successfully'
            });
        }
        else {
            console.log('❌ Account deletion failed:', result.message);
            return res.status(400).json({
                error: 'Account deletion failed',
                message: result.message || 'Failed to delete account'
            });
        }
    }
    catch (error) {
        console.error('Account deletion error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Account deletion failed due to server error'
        });
    }
});
/**
 * PUT /auth/profile
 * Update user profile information
 */
router.put('/profile', identityService_1.authenticateToken, async (req, res) => {
    try {
        console.log('📝 PUT /auth/profile - Profile update request received');
        const authUser = req.user;
        // Validate request data
        const validation = (0, validation_1.validateUpdateUserRequest)(req.body);
        if (!validation.isValid) {
            console.log('❌ Profile update validation failed:', validation.errors);
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Invalid input data',
                details: validation.errors
            });
        }
        const updateData = validation.data;
        // Get canonical user
        const canonicalUser = await (0, identityService_1.getCanonicalUser)(req);
        if (!canonicalUser) {
            console.log('❌ Profile update failed: user not found');
            return res.status(404).json({
                error: 'User not found',
                message: 'Unable to locate user account for update'
            });
        }
        console.log('🔍 Updating profile for user:', canonicalUser.username);
        // Update user via identity service
        const updatedUser = await identityService_1.identityService.updateUser(authUser.id, updateData);
        if (!updatedUser) {
            console.log('❌ Profile update failed: update service returned null');
            return res.status(500).json({
                error: 'Update failed',
                message: 'Unable to update user profile'
            });
        }
        console.log('✅ Profile updated successfully for user:', canonicalUser.username);
        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                id: updatedUser.id,
                username: updatedUser.username,
                displayName: updatedUser.displayName,
                bio: updatedUser.bio,
                location: updatedUser.location,
                website: updatedUser.website,
                timezone: updatedUser.timezone,
                updatedAt: updatedUser.updatedAt
            }
        });
    }
    catch (error) {
        console.error('Profile update error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Profile update failed due to server error'
        });
    }
});
/**
 * PUT /auth/preferences
 * Update user preferences
 */
router.put('/preferences', identityService_1.authenticateToken, async (req, res) => {
    try {
        console.log('⚙️ PUT /auth/preferences - Preferences update request received');
        const authUser = req.user;
        // Validate request data
        const validation = (0, validation_1.validateUpdatePreferencesRequest)(req.body);
        if (!validation.isValid) {
            console.log('❌ Preferences update validation failed:', validation.errors);
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Invalid input data',
                details: validation.errors
            });
        }
        const preferencesData = validation.data;
        // Get canonical user
        const canonicalUser = await (0, identityService_1.getCanonicalUser)(req);
        if (!canonicalUser) {
            console.log('❌ Preferences update failed: user not found');
            return res.status(404).json({
                error: 'User not found',
                message: 'Unable to locate user account for update'
            });
        }
        console.log('🔍 Updating preferences for user:', canonicalUser.username);
        // Merge with existing preferences
        const updatedPreferences = {
            ...canonicalUser.preferences,
            ...preferencesData
        };
        // Update user via identity service
        const updatedUser = await identityService_1.identityService.updateUser(authUser.id, {
            preferences: updatedPreferences
        });
        if (!updatedUser) {
            console.log('❌ Preferences update failed: update service returned null');
            return res.status(500).json({
                error: 'Update failed',
                message: 'Unable to update user preferences'
            });
        }
        console.log('✅ Preferences updated successfully for user:', canonicalUser.username);
        return res.status(200).json({
            success: true,
            message: 'Preferences updated successfully',
            data: updatedUser.preferences
        });
    }
    catch (error) {
        console.error('Preferences update error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Preferences update failed due to server error'
        });
    }
});
/**
 * PUT /auth/privacy
 * Update user privacy settings
 */
router.put('/privacy', identityService_1.authenticateToken, async (req, res) => {
    try {
        console.log('🔒 PUT /auth/privacy - Privacy settings update request received');
        const authUser = req.user;
        // Validate request data
        const validation = (0, validation_1.validateUpdatePrivacyRequest)(req.body);
        if (!validation.isValid) {
            console.log('❌ Privacy update validation failed:', validation.errors);
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Invalid input data',
                details: validation.errors
            });
        }
        const privacyData = validation.data;
        // Get canonical user
        const canonicalUser = await (0, identityService_1.getCanonicalUser)(req);
        if (!canonicalUser) {
            console.log('❌ Privacy update failed: user not found');
            return res.status(404).json({
                error: 'User not found',
                message: 'Unable to locate user account for update'
            });
        }
        console.log('🔍 Updating privacy settings for user:', canonicalUser.username);
        // Merge with existing privacy settings
        const updatedPrivacy = {
            ...canonicalUser.privacy,
            ...privacyData
        };
        // Update user via identity service
        const updatedUser = await identityService_1.identityService.updateUser(authUser.id, {
            privacy: updatedPrivacy
        });
        if (!updatedUser) {
            console.log('❌ Privacy update failed: update service returned null');
            return res.status(500).json({
                error: 'Update failed',
                message: 'Unable to update privacy settings'
            });
        }
        console.log('✅ Privacy settings updated successfully for user:', canonicalUser.username);
        return res.status(200).json({
            success: true,
            message: 'Privacy settings updated successfully',
            data: updatedUser.privacy
        });
    }
    catch (error) {
        console.error('Privacy update error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Privacy settings update failed due to server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map