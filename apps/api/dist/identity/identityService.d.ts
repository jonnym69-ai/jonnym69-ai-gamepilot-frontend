import { Request, Response } from 'express';
import type { User as IUser } from '@gamepilot/shared/models/user';
import type { UserIntegration } from '@gamepilot/shared/models/integration';
export interface LegacyAuthUser {
    id: string;
    username: string;
    email: string;
}
export interface LoginRequest {
    username: string;
    password: string;
}
export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    displayName?: string;
    timezone?: string;
}
/**
 * Unified Identity Service - Central authentication and user management
 * Provides canonical User operations while maintaining legacy compatibility
 */
export declare class IdentityService {
    constructor();
    private userIntegrations;
    /**
     * Hash password using bcrypt
     */
    hashPassword(password: string): Promise<string>;
    /**
     * Compare password with hash
     */
    comparePassword(password: string, hash: string): Promise<boolean>;
    /**
     * Generate JWT token
     * Now uses canonical User internally
     */
    generateToken(user: LegacyAuthUser): string;
    /**
     * Verify JWT token
     * Returns AuthUser for backward compatibility but internally works with canonical User
     */
    verifyToken(token: string): LegacyAuthUser | null;
    /**
     * Authenticate token middleware with session validation
     * Enhanced to use SessionService for persistent session management
     */
    authenticateToken(req: Request, res: Response, next: Function): Promise<void>;
    /**
     * Get canonical User from request
     * New unified method to access the full canonical User model
     */
    getCanonicalUserFromRequest(req: Request): Promise<IUser | null>;
    /**
     * Get canonical User by ID
     * Now uses the database instead of in-memory array
     */
    getCanonicalUserById(userId: string): Promise<IUser | null>;
    /**
     * Get legacy AuthUser by ID
     * Maintained for backward compatibility
     */
    getLegacyAuthUserById(userId: string): Promise<LegacyAuthUser | null>;
    /**
     * Validate canonical User
     * Comprehensive validation of canonical User model
     */
    validateCanonicalUser(user: IUser): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    };
    /**
     * Attach integrations to canonical User
     * Enriches user with their connected platform integrations
     */
    attachIntegrationsToUser(user: IUser): IUser;
    /**
     * Get user authentication state
     * Comprehensive authentication and integration status
     */
    getUserAuthState(user: IUser): {
        isAuthenticated: boolean;
        isFullyOnboarded: boolean;
        hasIntegrations: boolean;
        integrationCount: number;
        activeIntegrations: number;
        lastActive: Date | null;
        authMethod: 'email' | 'steam' | 'discord' | 'youtube' | 'multiple';
        securityLevel: 'basic' | 'enhanced' | 'premium';
    };
    /**
     * Find canonical user by username
     */
    findByUsername(username: string): Promise<IUser | null>;
    /**
     * Find canonical user by email
     */
    findByEmail(email: string): Promise<IUser | null>;
    /**
     * Validate password for user
     */
    validatePassword(userId: string, password: string): Promise<boolean>;
    /**
     * Set password for existing user (for Steam users who want to add email login)
     */
    setPassword(userId: string, password: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Create new canonical user
     */
    createUser(userData: {
        username: string;
        email: string;
        password: string;
        displayName?: string;
        timezone?: string;
    }): Promise<IUser>;
    /**
     * User login with canonical User internally
     */
    login(loginData: {
        username: string;
        password: string;
    }): Promise<{
        success: boolean;
        user?: LegacyAuthUser;
        canonicalUser?: IUser;
        token?: string;
        message?: string;
    }>;
    /**
     * User registration with canonical User internally
     */
    register(registerData: {
        username: string;
        email: string;
        password: string;
        displayName?: string;
        timezone?: string;
    }): Promise<{
        success: boolean;
        user?: LegacyAuthUser;
        canonicalUser?: IUser;
        token?: string;
        message?: string;
    }>;
    /**
     * Refresh token with canonical User internally
     */
    refreshToken(req: Request): Promise<{
        success: boolean;
        user?: LegacyAuthUser;
        canonicalUser?: IUser;
        token?: string;
        message?: string;
    }>;
    /**
     * Add integration to user
     */
    addIntegrationToUser(userId: string, integration: UserIntegration): void;
    /**
     * Remove integration from user
     */
    removeIntegrationFromUser(userId: string, platform: string): void;
    /**
     * Get user integrations
     */
    getUserIntegrations(userId: string): UserIntegration[];
    /**
     * Update canonical user
     */
    updateUser(userId: string, updates: Partial<IUser>): Promise<IUser | null>;
    /**
     * Get current user from request (legacy compatibility)
     */
    getCurrentUser(req: Request): LegacyAuthUser | null;
    /**
     * Get comprehensive user profile
     * Returns enriched user data with all available information
     */
    getComprehensiveUserProfile(req: Request): Promise<{
        success: boolean;
        user?: IUser;
        authUser?: LegacyAuthUser;
        authState?: ReturnType<IdentityService['getUserAuthState']>;
        integrations?: UserIntegration[];
        validation?: ReturnType<IdentityService['validateCanonicalUser']>;
        message?: string;
    }>;
    /**
     * Delete user account and all associated data
     * Requires password verification for security
     */
    deleteUserAccount(userId: string, password: string): Promise<{
        success: boolean;
        message?: string;
    }>;
}
export declare const identityService: IdentityService;
export declare const authenticateToken: (req: Request, res: Response, next: Function) => Promise<void>;
export declare const login: (loginData: {
    username: string;
    password: string;
}) => Promise<{
    success: boolean;
    user?: LegacyAuthUser;
    canonicalUser?: IUser;
    token?: string;
    message?: string;
}>;
export declare const register: (registerData: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
    timezone?: string;
}) => Promise<{
    success: boolean;
    user?: LegacyAuthUser;
    canonicalUser?: IUser;
    token?: string;
    message?: string;
}>;
export declare const refreshToken: (req: Request) => Promise<{
    success: boolean;
    user?: LegacyAuthUser;
    canonicalUser?: IUser;
    token?: string;
    message?: string;
}>;
export declare const getCurrentUser: (req: Request) => LegacyAuthUser | null;
export declare const getCanonicalUser: (req: Request) => Promise<IUser | null>;
export declare const deleteUserAccount: (userId: string, password: string) => Promise<{
    success: boolean;
    message?: string;
}>;
//# sourceMappingURL=identityService.d.ts.map