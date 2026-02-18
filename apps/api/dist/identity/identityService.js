"use strict";
// Unified Identity Service - Consolidates all backend authentication logic
// This service provides a unified interface for canonical User operations
// while maintaining backward compatibility with legacy AuthUser
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
exports.deleteUserAccount = exports.getCanonicalUser = exports.getCurrentUser = exports.refreshToken = exports.register = exports.login = exports.authenticateToken = exports.identityService = exports.IdentityService = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const bcrypt = __importStar(require("bcryptjs"));
const userAdapter_1 = require("../adapters/userAdapter");
const database_1 = require("../services/database");
const sessionService_1 = require("../services/sessionService");
// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';
// Validate JWT secret in production
if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'your-secret-key-change-in-production') {
    throw new Error('JWT_SECRET must be set in production environment');
}
if (JWT_SECRET.length < 32) {
    console.warn('WARNING: JWT_SECRET should be at least 32 characters long for security');
}
console.log('🔑 IdentityService initialized with secure JWT configuration');
/**
 * Unified Identity Service - Central authentication and user management
 * Provides canonical User operations while maintaining legacy compatibility
 */
class IdentityService {
    constructor() {
        // Mock integrations storage (in production, this would be a database)
        this.userIntegrations = new Map();
        console.log('🔑 IdentityService initialized with database-backed authentication');
    }
    /**
     * Hash password using bcrypt
     */
    async hashPassword(password) {
        const saltRounds = 12;
        return await bcrypt.hash(password, saltRounds);
    }
    /**
     * Compare password with hash
     */
    async comparePassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }
    /**
     * Generate JWT token
     * Now uses canonical User internally
     */
    generateToken(user) {
        console.log('🔑 Generating token for user:', user.username);
        console.log('🔑 Using JWT_SECRET:', JWT_SECRET.substring(0, 10) + '...');
        const token = jwt.sign({
            id: user.id,
            username: user.username,
            email: user.email
        }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        console.log('🔑 Generated token:', token.substring(0, 50) + '...');
        return token;
    }
    /**
     * Verify JWT token
     * Returns AuthUser for backward compatibility but internally works with canonical User
     */
    verifyToken(token) {
        try {
            console.log('🔍 Verifying token:', token.substring(0, 50) + '...');
            console.log('🔍 Using JWT_SECRET:', JWT_SECRET.substring(0, 10) + '...');
            const decoded = jwt.verify(token, JWT_SECRET);
            console.log('🔐 JWT token verified for user:', decoded.username);
            return decoded;
        }
        catch (error) {
            console.error('❌ Token verification failed:', error);
            console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error');
            return null;
        }
    }
    /**
     * Authenticate token middleware with session validation
     * Enhanced to use SessionService for persistent session management
     */
    async authenticateToken(req, res, next) {
        try {
            // Get token from Authorization header
            const authHeader = req.headers.authorization;
            const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
            if (!token) {
                console.log('❌ No token provided in Authorization header');
                res.status(401).json({
                    error: 'No token provided',
                    message: 'Authorization token is required'
                });
                return;
            }
            // Verify JWT token
            const decoded = this.verifyToken(token);
            if (!decoded) {
                console.log('❌ Invalid token provided');
                res.status(401).json({
                    error: 'Invalid token',
                    message: 'Token is invalid or expired'
                });
                return;
            }
            // Validate session with SessionService
            const sessionData = await sessionService_1.sessionService.validateSession(token);
            if (!sessionData) {
                console.log('❌ Invalid session');
                res.status(401).json({
                    error: 'Invalid session',
                    message: 'Session is invalid or expired'
                });
                return;
            }
            console.log('✅ Session validated for user:', sessionData.userId);
            // Get user data for the session
            const userResult = await this.getCanonicalUserById(sessionData.userId);
            if (!userResult) {
                console.log('❌ User not found for session:', sessionData.userId);
                res.status(401).json({
                    error: 'User not found',
                    message: 'User associated with session not found'
                });
                return;
            }
            // Attach user data to request
            const authUserData = {
                id: userResult.id,
                username: userResult.username,
                email: userResult.email
            };
            Object.assign(req, { authenticatedUser: authUserData });
            Object.assign(req, { canonicalUserData: userResult });
            Object.assign(req, { sessionData: sessionData });
            console.log('✅ Authentication successful for user:', userResult.username);
            next();
        }
        catch (error) {
            console.error('❌ Authentication error:', error);
            res.status(401).json({
                error: 'Authentication failed',
                message: 'Invalid authentication'
            });
        }
    }
    /**
     * Get canonical User from request
     * New unified method to access the full canonical User model
     */
    async getCanonicalUserFromRequest(req) {
        // First try to get the canonical user that was attached by middleware
        const canonicalUser = req.canonicalUserData;
        if (canonicalUser) {
            return canonicalUser;
        }
        // Fallback: get legacy AuthUser and convert to canonical
        const authUser = req.authenticatedUser;
        if (authUser) {
            return await this.getCanonicalUserById(authUser.id);
        }
        return null;
    }
    /**
     * Get canonical User by ID
     * Now uses the database instead of in-memory array
     */
    async getCanonicalUserById(userId) {
        console.log('🔍 Looking up canonical user by ID:', userId);
        try {
            const user = await database_1.databaseService.getUserById(userId);
            if (user) {
                console.log('✅ Found canonical user:', user.id, user.username);
            }
            else {
                console.log('❌ Canonical user not found:', userId);
            }
            return user;
        }
        catch (error) {
            console.error('❌ Error looking up user:', error);
            return null;
        }
    }
    /**
     * Get legacy AuthUser by ID
     * Maintained for backward compatibility
     */
    async getLegacyAuthUserById(userId) {
        const canonicalUser = await this.getCanonicalUserById(userId);
        return canonicalUser ? userAdapter_1.UserAdapter.canonicalToAuthUser(canonicalUser) : null;
    }
    /**
     * Validate canonical User
     * Comprehensive validation of canonical User model
     */
    validateCanonicalUser(user) {
        console.log('🔍 Validating canonical user:', user.id);
        const errors = [];
        const warnings = [];
        // Basic validation
        if (!user.id || user.id.trim() === '') {
            errors.push('User ID is required');
        }
        if (!user.username || user.username.trim() === '') {
            errors.push('Username is required');
        }
        if (!user.email || user.email.trim() === '') {
            errors.push('Email is required');
        }
        if (!user.email.includes('@')) {
            errors.push('Email format is invalid');
        }
        // Optional field validation
        if (user.displayName && user.displayName.length > 100) {
            warnings.push('Display name is very long');
        }
        if (user.bio && user.bio.length > 500) {
            warnings.push('Bio is very long');
        }
        // Integration validation
        if (user.integrations && !Array.isArray(user.integrations)) {
            errors.push('Integrations should be an array');
        }
        // Privacy validation
        if (!user.privacy) {
            errors.push('Privacy settings are required');
        }
        // Preferences validation
        if (!user.preferences) {
            errors.push('User preferences are required');
        }
        // Social validation
        if (!user.social) {
            errors.push('Social profile is required');
        }
        const isValid = errors.length === 0;
        console.log('✅ Canonical user validation completed:', isValid ? 'VALID' : 'INVALID');
        if (errors.length > 0) {
            console.log('   Errors:', errors);
        }
        if (warnings.length > 0) {
            console.log('   Warnings:', warnings);
        }
        return { isValid, errors, warnings };
    }
    /**
     * Attach integrations to canonical User
     * Enriches user with their connected platform integrations
     */
    attachIntegrationsToUser(user) {
        console.log('🔗 Attaching integrations to canonical user:', user.id);
        const userIntegrations = this.userIntegrations.get(user.id) || [];
        // Create enriched user with integrations
        const enrichedUser = {
            ...user,
            integrations: userIntegrations,
            // Add integration summary
            integrationSummary: {
                totalIntegrations: userIntegrations.length,
                connectedPlatforms: userIntegrations.map(i => i.platform),
                activeIntegrations: userIntegrations.filter(i => i.isActive).length,
                lastSyncTimes: userIntegrations.map(i => ({ platform: i.platform, lastSyncAt: i.lastSyncAt }))
            }
        };
        console.log('✅ Attached', userIntegrations.length, 'integrations to user');
        return enrichedUser;
    }
    /**
     * Get user authentication state
     * Comprehensive authentication and integration status
     */
    getUserAuthState(user) {
        const userIntegrations = this.userIntegrations.get(user.id) || [];
        const activeIntegrations = userIntegrations.filter(i => i.isActive);
        let authMethod = 'email';
        if (activeIntegrations.length > 0) {
            authMethod = activeIntegrations.length === 1 ?
                activeIntegrations[0].platform : 'multiple';
        }
        let securityLevel = 'basic';
        if (activeIntegrations.length > 0) {
            securityLevel = 'enhanced';
        }
        if (activeIntegrations.length >= 2) {
            securityLevel = 'premium';
        }
        return {
            isAuthenticated: true,
            isFullyOnboarded: userAdapter_1.UserAdapter.hasCompletedOnboarding(user),
            hasIntegrations: userIntegrations.length > 0,
            integrationCount: userIntegrations.length,
            activeIntegrations: activeIntegrations.length,
            lastActive: user.lastActive || null,
            authMethod,
            securityLevel
        };
    }
    /**
     * Find canonical user by username
     */
    async findByUsername(username) {
        console.log('🔍 Finding canonical user by username:', username);
        try {
            const user = await database_1.databaseService.getUserByUsername(username);
            if (user) {
                console.log('✅ Found canonical user:', user.id, user.username);
            }
            else {
                console.log('❌ Canonical user not found:', username);
            }
            return user;
        }
        catch (error) {
            console.error('❌ Error finding user by username:', error);
            return null;
        }
    }
    /**
     * Find canonical user by email
     */
    async findByEmail(email) {
        console.log('🔍 Finding canonical user by email:', email);
        try {
            const user = await database_1.databaseService.getUserByEmail(email);
            if (user) {
                console.log('✅ Found canonical user:', user.id, user.email);
            }
            else {
                console.log('❌ Canonical user not found:', email);
            }
            return user;
        }
        catch (error) {
            console.error('❌ Error finding user by email:', error);
            return null;
        }
    }
    /**
     * Validate password for user
     */
    async validatePassword(userId, password) {
        try {
            console.log('🔐 Validating password for user:', userId);
            const isValid = await database_1.databaseService.validatePassword(userId, password, this.comparePassword.bind(this));
            console.log('✅ Password validation result:', isValid);
            return isValid;
        }
        catch (error) {
            console.error('❌ Error validating password:', error);
            return false;
        }
    }
    /**
     * Set password for existing user (for Steam users who want to add email login)
     */
    async setPassword(userId, password) {
        try {
            console.log('🔐 Setting password for user:', userId);
            // Check if user exists
            const user = await this.getCanonicalUserById(userId);
            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }
            // Hash and store password in database
            const hashedPassword = await this.hashPassword(password);
            await database_1.databaseService.setPassword(userId, hashedPassword);
            console.log('✅ Password set successfully for user:', user.username);
            return {
                success: true,
                message: 'Password set successfully'
            };
        }
        catch (error) {
            console.error('❌ Error setting password:', error);
            return {
                success: false,
                message: 'Failed to set password'
            };
        }
    }
    /**
     * Create new canonical user
     */
    async createUser(userData) {
        console.log('👤 Creating new canonical user');
        // Create canonical User from registration data
        const canonicalUser = userAdapter_1.UserAdapter.fromRegistrationData({
            id: Date.now().toString(),
            username: userData.username,
            email: userData.email,
        }, {
            displayName: userData.displayName || userData.username,
            timezone: userData.timezone || 'UTC'
        });
        // Save user to database
        const savedUser = await database_1.databaseService.createUser(canonicalUser);
        const hashedPassword = await this.hashPassword(userData.password);
        await database_1.databaseService.setPassword(savedUser.id, hashedPassword);
        console.log('✅ Created canonical user:', savedUser.id, savedUser.username);
        return savedUser;
    }
    /**
     * User login with canonical User internally
     */
    async login(loginData) {
        try {
            console.log('🔐 Login attempt for username:', loginData.username);
            // Find canonical user by username first
            let canonicalUser = await this.findByUsername(loginData.username);
            // If not found by username, try email
            if (!canonicalUser) {
                console.log('🔍 User not found by username, trying email lookup...');
                canonicalUser = await this.findByEmail(loginData.username);
            }
            if (!canonicalUser) {
                console.log('❌ User not found:', loginData.username);
                return {
                    success: false,
                    message: 'Invalid username or password'
                };
            }
            const isValidPassword = await this.validatePassword(canonicalUser.id, loginData.password);
            if (!isValidPassword) {
                console.log('❌ Invalid password for user:', canonicalUser.username);
                // Check if user exists but has no password (Steam user)
                const passwordHash = await database_1.databaseService.getPassword(canonicalUser.id);
                if (!passwordHash) {
                    console.log('🔐 User has no password set. This might be a Steam-only account.');
                    console.log('💡 Steam users need to set a password first to enable email login.');
                }
                return {
                    success: false,
                    message: 'Invalid password. If you signed up via Steam, please set a password first.',
                    user: undefined,
                    canonicalUser: undefined,
                    token: undefined
                };
            }
            // Generate token using canonical User
            const token = this.generateToken(canonicalUser);
            // Convert to AuthUser for response compatibility
            const authUser = userAdapter_1.UserAdapter.canonicalToAuthUser(canonicalUser);
            console.log('✅ Login successful for canonical user:', canonicalUser.id);
            return {
                success: true,
                user: authUser,
                canonicalUser,
                token,
                message: 'Login successful'
            };
        }
        catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: 'Login failed due to server error'
            };
        }
    }
    /**
     * User registration with canonical User internally
     */
    async register(registerData) {
        try {
            console.log('👤 Registration attempt for:', registerData.username, registerData.email);
            // Check if user already exists (using canonical User lookup)
            const existingUser = await this.findByUsername(registerData.username);
            const existingEmail = await this.findByEmail(registerData.email);
            if (existingUser) {
                console.log('❌ Username already exists:', registerData.username);
                return {
                    success: false,
                    message: 'Username already exists'
                };
            }
            if (existingEmail) {
                console.log('❌ Email already exists:', registerData.email);
                return {
                    success: false,
                    message: 'Email already exists'
                };
            }
            // Create canonical user
            const canonicalUser = await this.createUser(registerData);
            // Generate token using canonical User
            const token = this.generateToken(canonicalUser);
            // Convert to AuthUser for response compatibility
            const authUser = userAdapter_1.UserAdapter.canonicalToAuthUser(canonicalUser);
            console.log('✅ Registration successful for canonical user:', canonicalUser.id);
            return {
                success: true,
                user: authUser,
                canonicalUser,
                token,
                message: 'Registration successful'
            };
        }
        catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: 'Registration failed due to server error'
            };
        }
    }
    /**
     * Refresh token with canonical User internally
     */
    async refreshToken(req) {
        try {
            const currentUser = await this.getCanonicalUserFromRequest(req);
            if (!currentUser) {
                console.log('❌ No authenticated user found for token refresh');
                return {
                    success: false,
                    message: 'No authenticated user found'
                };
            }
            // Generate new token using canonical User
            const newToken = this.generateToken(currentUser);
            // Convert to AuthUser for response compatibility
            const authUser = userAdapter_1.UserAdapter.canonicalToAuthUser(currentUser);
            console.log('🔄 Token refreshed for canonical user:', currentUser.id);
            return {
                success: true,
                user: authUser,
                canonicalUser: currentUser,
                token: newToken,
                message: 'Token refreshed successfully'
            };
        }
        catch (error) {
            console.error('Token refresh error:', error);
            return {
                success: false,
                message: 'Token refresh failed'
            };
        }
    }
    /**
     * Add integration to user
     */
    addIntegrationToUser(userId, integration) {
        console.log('🔗 Adding integration to user:', userId, integration.platform);
        const userIntegrations = this.userIntegrations.get(userId) || [];
        // Remove existing integration for the same platform
        const filteredIntegrations = userIntegrations.filter(i => i.platform !== integration.platform);
        filteredIntegrations.push(integration);
        this.userIntegrations.set(userId, filteredIntegrations);
        console.log('✅ Integration added successfully');
    }
    /**
     * Remove integration from user
     */
    removeIntegrationFromUser(userId, platform) {
        console.log('🔌 Removing integration from user:', userId, platform);
        const userIntegrations = this.userIntegrations.get(userId) || [];
        const filteredIntegrations = userIntegrations.filter(i => i.platform !== platform);
        this.userIntegrations.set(userId, filteredIntegrations);
        console.log('✅ Integration removed successfully');
    }
    /**
     * Get user integrations
     */
    getUserIntegrations(userId) {
        return this.userIntegrations.get(userId) || [];
    }
    /**
     * Update canonical user
     */
    async updateUser(userId, updates) {
        console.log('🔄 Updating canonical user:', userId);
        try {
            const updatedUser = await database_1.databaseService.updateUser(userId, updates);
            console.log('✅ User updated successfully');
            return updatedUser;
        }
        catch (error) {
            console.log('❌ User not found for update:', userId);
            return null;
        }
    }
    /**
     * Get current user from request (legacy compatibility)
     */
    getCurrentUser(req) {
        const authUser = req.authenticatedUser || null;
        if (authUser) {
            console.log('👤 Retrieved current user from request:', authUser.username);
        }
        return authUser;
    }
    /**
     * Get comprehensive user profile
     * Returns enriched user data with all available information
     */
    async getComprehensiveUserProfile(req) {
        try {
            const canonicalUser = await this.getCanonicalUserFromRequest(req);
            if (!canonicalUser) {
                return {
                    success: false,
                    message: 'No authenticated user found'
                };
            }
            // Enrich user with integrations
            const enrichedUser = this.attachIntegrationsToUser(canonicalUser);
            // Get auth state
            const authState = this.getUserAuthState(enrichedUser);
            // Validate user
            const validation = this.validateCanonicalUser(enrichedUser);
            // Get legacy auth user
            const authUser = userAdapter_1.UserAdapter.canonicalToAuthUser(enrichedUser);
            // Get integrations
            const integrations = this.getUserIntegrations(canonicalUser.id);
            console.log('✅ Comprehensive profile retrieved for user:', canonicalUser.username);
            return {
                success: true,
                user: enrichedUser,
                authUser,
                authState,
                integrations,
                validation
            };
        }
        catch (error) {
            console.error('Error getting comprehensive profile:', error);
            return {
                success: false,
                message: 'Failed to retrieve user profile'
            };
        }
    }
    /**
     * Delete user account and all associated data
     * Requires password verification for security
     */
    async deleteUserAccount(userId, password) {
        try {
            console.log('🗑️ Starting account deletion process for user:', userId);
            // Find the user in database
            const user = await database_1.databaseService.getUserById(userId);
            if (!user) {
                console.log('❌ User not found for deletion:', userId);
                return {
                    success: false,
                    message: 'User not found'
                };
            }
            // Verify password for security
            const storedPassword = await database_1.databaseService.getPassword(userId);
            if (!storedPassword) {
                console.log('❌ No password found for user:', userId);
                return {
                    success: false,
                    message: 'Invalid password. Account deletion requires correct password.'
                };
            }
            const isValidPassword = await this.comparePassword(password, storedPassword);
            if (!isValidPassword) {
                console.log('❌ Invalid password for account deletion:', userId);
                return {
                    success: false,
                    message: 'Invalid password. Account deletion requires correct password.'
                };
            }
            // Get user info for logging
            console.log('🔍 Password verified, proceeding with deletion for:', user.username);
            // Delete user integrations
            this.userIntegrations.delete(userId);
            console.log('✅ User integrations deleted');
            // Delete user password from database
            await database_1.databaseService.deletePassword(userId);
            console.log('✅ User password deleted');
            // Real budget-friendly deletion logic
            const success = await database_1.databaseService.deleteUser(userId);
            if (success) {
                console.log('✅ User account and data deleted successfully from database');
                return {
                    success: true,
                    message: 'Account and all associated data deleted successfully'
                };
            }
            else {
                console.error('❌ Failed to delete user from database record');
                return {
                    success: false,
                    message: 'User record deletion failed'
                };
            }
        }
        catch (error) {
            console.error('❌ Error during account deletion:', error);
            return {
                success: false,
                message: 'Failed to delete account due to server error'
            };
        }
    }
}
exports.IdentityService = IdentityService;
// Export singleton instance
exports.identityService = new IdentityService();
// Export legacy functions for backward compatibility
const authenticateToken = (req, res, next) => exports.identityService.authenticateToken(req, res, next);
exports.authenticateToken = authenticateToken;
exports.login = exports.identityService.login.bind(exports.identityService);
exports.register = exports.identityService.register.bind(exports.identityService);
exports.refreshToken = exports.identityService.refreshToken.bind(exports.identityService);
exports.getCurrentUser = exports.identityService.getCurrentUser.bind(exports.identityService);
exports.getCanonicalUser = exports.identityService.getCanonicalUserFromRequest.bind(exports.identityService);
exports.deleteUserAccount = exports.identityService.deleteUserAccount.bind(exports.identityService);
//# sourceMappingURL=identityService.js.map