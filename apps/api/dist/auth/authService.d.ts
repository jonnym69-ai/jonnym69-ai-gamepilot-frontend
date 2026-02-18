import { Request, Response } from 'express';
import { User } from '@gamepilot/shared';
export interface LoginRequest {
    username: string;
    password: string;
}
export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}
export interface AuthResponse {
    success: boolean;
    user?: User;
    token?: string;
    message?: string;
}
/**
 * Hash password using bcrypt
 */
export declare function hashPassword(password: string): Promise<string>;
/**
 * Compare password with hash
 */
export declare function comparePassword(password: string, hash: string): Promise<boolean>;
/**
 * Generate JWT token
 * Now uses canonical User model
 */
export declare function generateToken(user: User): string;
/**
 * Verify JWT token
 * Returns canonical User model
 */
export declare function verifyToken(token: string): User | null;
/**
 * Authentication middleware
 */
export declare function authenticateToken(req: Request, res: Response, next: Function): void;
/**
 * Login service
 * Now operates on canonical User and returns canonical User
 */
export declare function login(loginData: LoginRequest): Promise<AuthResponse>;
/**
 * Register service
 * Now creates canonical User and returns canonical User
 */
export declare function register(registerData: RegisterRequest): Promise<AuthResponse>;
/**
 * Get current user from request
 * Returns canonical User
 */
export declare function getCurrentUser(req: Request): User | null;
/**
 * Get canonical user from request (alias for getCurrentUser)
 */
export declare function getCanonicalUser(req: Request): User | null;
/**
 * Refresh token
 * Now works with canonical User
 */
export declare function refreshToken(req: Request): Promise<AuthResponse>;
/**
 * Initialize authentication service
 */
export declare function initializeAuth(): Promise<void>;
//# sourceMappingURL=authService.d.ts.map