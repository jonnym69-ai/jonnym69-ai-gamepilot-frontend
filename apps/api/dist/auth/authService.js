"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.authenticateToken = authenticateToken;
exports.login = login;
exports.register = register;
exports.getCurrentUser = getCurrentUser;
exports.getCanonicalUser = getCanonicalUser;
exports.refreshToken = refreshToken;
exports.initializeAuth = initializeAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../services/database");
// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';
/**
 * Hash password using bcrypt
 */
async function hashPassword(password) {
    const saltRounds = 12;
    return await bcryptjs_1.default.hash(password, saltRounds);
}
/**
 * Compare password with hash
 */
async function comparePassword(password, hash) {
    return await bcryptjs_1.default.compare(password, hash);
}
/**
 * Generate JWT token
 * Now uses canonical User model
 */
function generateToken(user) {
    return jsonwebtoken_1.default.sign({
        id: user.id,
        username: user.username,
        email: user.email
    }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
/**
 * Verify JWT token
 * Returns canonical User model
 */
function verifyToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        console.log('🔐 JWT token verified for user:', decoded.username);
        // Convert JWT payload back to canonical User
        return {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email,
            displayName: decoded.username,
            avatar: '',
            bio: '',
            location: '',
            timezone: 'UTC',
            createdAt: new Date(),
            updatedAt: new Date(),
            lastActive: new Date(),
            gamingProfile: {
                primaryPlatforms: [],
                genreAffinities: {},
                playstyleArchetypes: [],
                moodProfile: {
                    currentMood: 'neutral',
                    moodHistory: [],
                    moodTriggers: [],
                    moodPreferences: {}
                },
                totalPlaytime: 0,
                gamesPlayed: 0,
                gamesCompleted: 0,
                achievementsCount: 0,
                averageRating: 0,
                currentStreak: 0,
                longestStreak: 0,
                favoriteGames: []
            },
            integrations: [],
            privacy: {
                profileVisibility: 'public',
                sharePlaytime: true,
                shareAchievements: true,
                shareGameLibrary: false,
                allowFriendRequests: true,
                showOnlineStatus: true
            },
            preferences: {
                theme: 'dark',
                language: 'en',
                notifications: {
                    email: true,
                    push: true,
                    achievements: true,
                    recommendations: true,
                    friendActivity: true,
                    platformUpdates: false
                },
                display: {
                    compactMode: false,
                    showGameCovers: true,
                    animateTransitions: true,
                    showRatings: true
                }
            },
            social: {
                friends: [],
                blockedUsers: [],
                favoriteGenres: [],
                customTags: []
            }
        };
    }
    catch (error) {
        console.error('❌ JWT token verification failed:', error);
        return null;
    }
}
/**
 * Authentication middleware
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        res.status(401).json({
            error: 'Access denied',
            message: 'No token provided'
        });
        return;
    }
    try {
        const decoded = verifyToken(token);
        if (!decoded) {
            res.status(401).json({
                error: 'Invalid token',
                message: 'Token is not valid'
            });
            return;
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({
            error: 'Token verification failed',
            message: 'Failed to authenticate token'
        });
    }
}
/**
 * Password storage using database
 */
class PasswordStorage {
    async setPassword(userId, password) {
        const hashedPassword = await hashPassword(password);
        await database_1.databaseService.setPassword(userId, hashedPassword);
    }
    async validatePassword(userId, password) {
        return await database_1.databaseService.validatePassword(userId, password, comparePassword);
    }
}
const passwordStorage = new PasswordStorage();
/**
 * Initialize database with demo user if needed
 */
async function ensureDemoUser() {
    try {
        // Check if demo user exists
        const existingUser = await database_1.databaseService.getUserByUsername('demo');
        if (!existingUser) {
            console.log('👤 Creating demo user in database');
            // Create demo user
            const demoUser = await database_1.databaseService.createUser({
                username: 'demo',
                email: 'demo@example.com',
                displayName: 'Demo User',
                avatar: '',
                bio: 'Demo user for GamePilot platform',
                location: 'Demo City',
                timezone: 'UTC',
                lastActive: new Date(),
                gamingProfile: {
                    primaryPlatforms: [],
                    genreAffinities: {},
                    playstyleArchetypes: [],
                    moodProfile: {
                        currentMood: 'neutral',
                        moodHistory: [],
                        moodTriggers: [],
                        moodPreferences: {}
                    },
                    totalPlaytime: 0,
                    gamesPlayed: 0,
                    gamesCompleted: 0,
                    achievementsCount: 0,
                    averageRating: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                    favoriteGames: []
                },
                integrations: [],
                privacy: {
                    profileVisibility: 'public',
                    sharePlaytime: true,
                    shareAchievements: true,
                    shareGameLibrary: false,
                    allowFriendRequests: true,
                    showOnlineStatus: true
                },
                preferences: {
                    theme: 'dark',
                    language: 'en',
                    notifications: {
                        email: true,
                        push: true,
                        achievements: true,
                        recommendations: true,
                        friendActivity: true,
                        platformUpdates: false
                    },
                    display: {
                        compactMode: false,
                        showGameCovers: true,
                        animateTransitions: true,
                        showRatings: true
                    }
                },
                social: {
                    friends: [],
                    blockedUsers: [],
                    favoriteGenres: [],
                    customTags: []
                }
            });
            // Set password for demo user
            await passwordStorage.setPassword(demoUser.id, 'password123');
            console.log('✅ Demo user created successfully:', demoUser.id);
        }
    }
    catch (error) {
        console.error('❌ Failed to ensure demo user:', error);
    }
}
/**
 * Login service
 * Now operates on canonical User and returns canonical User
 */
async function login(loginData) {
    try {
        console.log('🔐 Login attempt for username:', loginData.username);
        // Find canonical user in database
        const canonicalUser = await database_1.databaseService.getUserByUsername(loginData.username);
        if (!canonicalUser) {
            console.log('❌ User not found:', loginData.username);
            return {
                success: false,
                message: 'Invalid username or password'
            };
        }
        const isValidPassword = await passwordStorage.validatePassword(canonicalUser.id, loginData.password);
        if (!isValidPassword) {
            console.log('❌ Invalid password for user:', canonicalUser.username);
            return {
                success: false,
                message: 'Invalid username or password'
            };
        }
        // Generate token using canonical User
        const token = generateToken(canonicalUser);
        console.log('✅ Login successful for canonical user:', canonicalUser.id);
        return {
            success: true,
            user: canonicalUser,
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
 * Register service
 * Now creates canonical User and returns canonical User
 */
async function register(registerData) {
    try {
        console.log('👤 Registration attempt for:', registerData.username, registerData.email);
        // Check if user already exists (using database lookup)
        const existingUser = await database_1.databaseService.getUserByUsername(registerData.username);
        const existingEmail = await database_1.databaseService.getUserByEmail(registerData.email);
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
        // Create canonical user in database
        const canonicalUser = await database_1.databaseService.createUser({
            username: registerData.username,
            email: registerData.email,
            displayName: registerData.username, // Default to username
            timezone: 'UTC', // Default timezone
            avatar: '',
            bio: '',
            location: '',
            lastActive: new Date(),
            gamingProfile: {
                primaryPlatforms: [],
                genreAffinities: {},
                playstyleArchetypes: [],
                moodProfile: {
                    currentMood: 'neutral',
                    moodHistory: [],
                    moodTriggers: [],
                    moodPreferences: {}
                },
                totalPlaytime: 0,
                gamesPlayed: 0,
                gamesCompleted: 0,
                achievementsCount: 0,
                averageRating: 0,
                currentStreak: 0,
                longestStreak: 0,
                favoriteGames: []
            },
            integrations: [],
            privacy: {
                profileVisibility: 'public',
                sharePlaytime: true,
                shareAchievements: true,
                shareGameLibrary: false,
                allowFriendRequests: true,
                showOnlineStatus: true
            },
            preferences: {
                theme: 'dark',
                language: 'en',
                notifications: {
                    email: true,
                    push: true,
                    achievements: true,
                    recommendations: true,
                    friendActivity: true,
                    platformUpdates: false
                },
                display: {
                    compactMode: false,
                    showGameCovers: true,
                    animateTransitions: true,
                    showRatings: true
                }
            },
            social: {
                friends: [],
                blockedUsers: [],
                favoriteGenres: [],
                customTags: []
            }
        });
        // Set password for new user
        await passwordStorage.setPassword(canonicalUser.id, registerData.password);
        // Generate token using canonical User
        const token = generateToken(canonicalUser);
        console.log('✅ Registration successful for canonical user:', canonicalUser.id);
        return {
            success: true,
            user: canonicalUser,
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
 * Get current user from request
 * Returns canonical User
 */
function getCurrentUser(req) {
    const user = req.user || null;
    if (user) {
        console.log('👤 Retrieved current user from request:', user.username);
    }
    return user;
}
/**
 * Get canonical user from request (alias for getCurrentUser)
 */
function getCanonicalUser(req) {
    return getCurrentUser(req);
}
/**
 * Refresh token
 * Now works with canonical User
 */
async function refreshToken(req) {
    try {
        const currentUser = getCurrentUser(req);
        if (!currentUser) {
            console.log('❌ No authenticated user found for token refresh');
            return {
                success: false,
                message: 'No authenticated user found'
            };
        }
        const newToken = generateToken(currentUser);
        console.log('🔄 Token refreshed for canonical user:', currentUser.id);
        return {
            success: true,
            user: currentUser,
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
 * Initialize authentication service
 */
async function initializeAuth() {
    console.log('🔐 Initializing authentication service');
    // Initialize database
    await database_1.databaseService.initialize();
    // Ensure demo user exists
    await ensureDemoUser();
    console.log('✅ Authentication service initialized successfully');
}
//# sourceMappingURL=authService.js.map