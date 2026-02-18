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
exports.databaseService = exports.DatabaseService = void 0;
const sqlite3 = __importStar(require("sqlite3"));
const sqlite_1 = require("sqlite");
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const databaseRetry_1 = require("./databaseRetry");
const shared_1 = require("@gamepilot/shared");
const addMoodPersonaTables_1 = require("../migrations/addMoodPersonaTables");
class DatabaseService {
    constructor(dbPath) {
        this.db = null;
        this.migrations = [];
        this.dbPath = dbPath || path.join(process.cwd(), 'gamepilot.db');
        // Register migrations
        this.registerMigrations();
    }
    registerMigrations() {
        // Migration 1: Add enhanced user fields for mood tracking and persona data
        this.migrations.push({
            id: '001_add_enhanced_user_fields',
            version: '1.0.0',
            description: 'Add enhanced user fields for mood tracking, play patterns, and persona data',
            up: async (db) => {
                console.log('🔄 Running migration 001: Add enhanced user fields');
                // Add new columns to users table
                const columnsToAdd = [
                    'website TEXT',
                    'personaData TEXT',
                    'currentMood TEXT',
                    'moodHistory TEXT',
                    'moodPreferences TEXT',
                    'playPatterns TEXT',
                    'averageSessionLength REAL DEFAULT 0',
                    'preferredPlaytimes TEXT',
                    'customFields TEXT'
                ];
                for (const column of columnsToAdd) {
                    try {
                        await db.run(`ALTER TABLE users ADD COLUMN ${column}`);
                        console.log(`✅ Added column: ${column}`);
                    }
                    catch (error) {
                        // Column might already exist, ignore error
                        console.log(`ℹ️ Column already exists or failed to add: ${column}`);
                    }
                }
            },
            down: async (db) => {
                // Note: SQLite doesn't support dropping columns easily
                // This would require recreating the table
                console.log('⚠️ Migration rollback not implemented for SQLite');
            }
        });
        // Migration 2: Add user preferences and privacy defaults
        this.migrations.push({
            id: '002_add_user_defaults',
            version: '1.0.1',
            description: 'Add default user preferences and privacy settings',
            up: async (db) => {
                console.log('🔄 Running migration 002: Add user defaults');
                // Update existing users with default preferences
                await db.run(`
          UPDATE users 
          SET preferences = COALESCE(preferences, '{"theme":"dark","language":"en","notifications":{"email":true,"push":true,"achievements":true,"recommendations":true,"friendActivity":true,"platformUpdates":true},"display":{"compactMode":false,"showGameCovers":true,"animateTransitions":true,"showRatings":true}}'),
              privacy = COALESCE(privacy, '{"profileVisibility":"public","sharePlaytime":true,"shareAchievements":true,"shareGameLibrary":true,"allowFriendRequests":true,"showOnlineStatus":true}'),
              gamingProfile = COALESCE(gamingProfile, '{"primaryPlatforms":[],"genreAffinities":{},"playstyleArchetypes":[],"moodProfile":{"currentMood":"neutral","moodHistory":[],"moodTriggers":[],"moodPreferences":{}},"totalPlaytime":0,"gamesPlayed":0,"gamesCompleted":0,"achievementsCount":0,"averageRating":0,"currentStreak":0,"longestStreak":0,"favoriteGames":[]}'),
              social = COALESCE(social, '{"friends":[],"blockedUsers":[],"favoriteGenres":[],"customTags":[]}')
          WHERE preferences IS NULL OR privacy IS NULL OR gamingProfile IS NULL OR social IS NULL
        `);
                console.log('✅ Updated existing users with default preferences');
            },
            down: async (db) => {
                console.log('⚠️ Migration rollback not implemented for user defaults');
            }
        });
        // Migration 3: Add mood-persona tracking tables
        this.migrations.push({
            id: '003_add_mood_persona_tables',
            version: '2.0.0',
            description: 'Add comprehensive mood-persona tracking tables for adaptive learning',
            up: async (db) => {
                console.log('🔄 Running migration 003: Add mood-persona tracking tables');
                await (0, addMoodPersonaTables_1.addMoodPersonaTables)();
                console.log('✅ Mood-persona tables created');
                // Initialize persona profiles for existing users
                await (0, addMoodPersonaTables_1.initializePersonaProfiles)();
                console.log('✅ Persona profiles initialized for existing users');
            },
            down: async (db) => {
                console.log('⚠️ Migration rollback not implemented for mood-persona tables');
            }
        });
    }
    async runMigrations() {
        if (!this.db)
            throw new Error('Database not initialized');
        // Create migrations table if it doesn't exist
        await this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id TEXT PRIMARY KEY,
        version TEXT NOT NULL,
        description TEXT,
        appliedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // Get applied migrations
        const appliedMigrations = await this.db.all('SELECT id FROM migrations');
        const appliedIds = new Set(appliedMigrations.map((row) => row.id));
        // Run pending migrations
        for (const migration of this.migrations) {
            if (!appliedIds.has(migration.id)) {
                console.log(`🔄 Running migration: ${migration.id} - ${migration.description}`);
                try {
                    await migration.up(this.db);
                    // Record migration
                    await this.db.run('INSERT INTO migrations (id, version, description) VALUES (?, ?, ?)', [migration.id, migration.version, migration.description]);
                    console.log(`✅ Migration completed: ${migration.id}`);
                }
                catch (error) {
                    console.error(`❌ Migration failed: ${migration.id}`, error);
                    throw error;
                }
            }
        }
    }
    async initialize() {
        try {
            // Ensure database directory exists
            const dbDir = path.dirname(this.dbPath);
            await fs.mkdir(dbDir, { recursive: true });
            // Open database connection
            this.db = await (0, sqlite_1.open)({
                filename: this.dbPath,
                driver: sqlite3.Database
            });
            console.log('🗄️ Database initialized at:', this.dbPath);
            // Create tables
            await this.createTables();
            // Run migrations
            await this.runMigrations();
            console.log('✅ Database initialization and migrations completed successfully');
        }
        catch (error) {
            console.error('❌ Database initialization failed:', error);
            throw error;
        }
    }
    async createTables() {
        if (!this.db)
            throw new Error('Database not initialized');
        // Users table - Enhanced for mood tracking, play patterns, and persona data
        await this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        displayName TEXT,
        avatar TEXT,
        bio TEXT,
        location TEXT,
        website TEXT,
        timezone TEXT DEFAULT 'UTC',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        lastActive DATETIME,
        
        -- Enhanced Gaming Profile
        gamingProfile TEXT, -- JSON with mood tracking, play patterns, persona data
        
        -- Platform Integrations
        integrations TEXT, -- JSON array
        
        -- Privacy Settings
        privacy TEXT, -- JSON
        
        -- User Preferences
        preferences TEXT, -- JSON
        
        -- Social Features
        social TEXT, -- JSON
        
        -- Persona Data (for AI recommendations)
        personaData TEXT, -- JSON with persona traits, mood history, play patterns
        
        -- Mood Tracking
        currentMood TEXT,
        moodHistory TEXT, -- JSON array of mood entries
        moodPreferences TEXT, -- JSON object with mood preferences
        
        -- Play Patterns
        playPatterns TEXT, -- JSON with session patterns, genre preferences
        averageSessionLength REAL DEFAULT 0,
        preferredPlaytimes TEXT, -- JSON array of preferred play times
        
        -- Custom Fields for extensibility
        customFields TEXT -- JSON array
      )
    `);
        // User integrations table
        await this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_integrations (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        platform TEXT NOT NULL,
        externalUserId TEXT NOT NULL,
        externalUsername TEXT,
        accessToken TEXT,
        refreshToken TEXT,
        expiresAt DATETIME,
        scopes TEXT, -- JSON array
        status TEXT NOT NULL,
        isActive BOOLEAN DEFAULT 0,
        isConnected BOOLEAN DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        lastSyncAt DATETIME,
        lastUsedAt DATETIME,
        metadata TEXT, -- JSON
        syncConfig TEXT, -- JSON
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(userId, platform)
      )
    `);
        // Games table
        await this.db.exec(`
      CREATE TABLE IF NOT EXISTS games (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        backgroundImages TEXT, -- JSON array
        coverImage TEXT,
        releaseDate DATETIME,
        developer TEXT,
        publisher TEXT,
        genres TEXT, -- JSON array
        subgenres TEXT, -- JSON array
        platforms TEXT, -- JSON array
        emotionalTags TEXT, -- JSON array
        userRating INTEGER,
        globalRating REAL,
        playStatus TEXT,
        hoursPlayed REAL,
        lastPlayed DATETIME,
        addedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        isFavorite BOOLEAN DEFAULT 0,
        tags TEXT, -- JSON array for user-defined tags
        moods TEXT, -- JSON array
        playHistory TEXT, -- JSON array
        releaseYear INTEGER,
        achievements TEXT, -- JSON
        totalPlaytime REAL,
        averageRating REAL,
        completionPercentage REAL,
        appId INTEGER -- Steam AppID for launching
      )
    `);
        // Add appId column if it doesn't exist (for existing databases)
        try {
            await this.db.run(`ALTER TABLE games ADD COLUMN appId INTEGER`);
        }
        catch (error) {
            // Column might already exist, ignore error
        }
        // Add tags column if it doesn't exist (for existing databases)
        try {
            await this.db.run(`ALTER TABLE games ADD COLUMN tags TEXT`);
        }
        catch (error) {
            // Column might already exist, ignore error
        }
        // User games junction table
        await this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_games (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        gameId TEXT NOT NULL,
        playStatus TEXT NOT NULL,
        hoursPlayed REAL DEFAULT 0,
        lastPlayed DATETIME,
        addedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        isFavorite BOOLEAN DEFAULT 0,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (gameId) REFERENCES games (id) ON DELETE CASCADE,
        UNIQUE(userId, gameId)
      )
    `);
        // Sessions table for persistent session management
        await this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        createdAt DATETIME NOT NULL,
        expiresAt DATETIME NOT NULL,
        lastAccessed DATETIME NOT NULL,
        userAgent TEXT,
        ipAddress TEXT,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      )
    `);
        // Game sessions table for tracking gameplay sessions
        await this.db.exec(`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        gameId TEXT NOT NULL,
        startedAt DATETIME NOT NULL,
        endedAt DATETIME,
        duration INTEGER,
        platformCode TEXT,
        launchMethod TEXT DEFAULT 'manual',
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (gameId) REFERENCES games (id) ON DELETE CASCADE
      )
    `);
        // Passwords table for secure password storage
        await this.db.exec(`
      CREATE TABLE IF NOT EXISTS passwords (
        userId TEXT PRIMARY KEY,
        passwordHash TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      )
    `);
        // Personas table for AI-driven persona management
        await this.db.exec(`
      CREATE TABLE IF NOT EXISTS personas (
        userId TEXT PRIMARY KEY,
        traits TEXT NOT NULL, -- JSON with PersonaTraits
        currentMood TEXT NOT NULL,
        currentIntent TEXT NOT NULL,
        moodIntensity REAL NOT NULL,
        patterns TEXT NOT NULL, -- JSON with BehavioralPatterns
        history TEXT NOT NULL, -- JSON with PersonaHistory
        signals TEXT NOT NULL, -- JSON with computed signals
        confidence REAL NOT NULL,
        dataPoints INTEGER NOT NULL,
        lastAnalysisDate DATETIME NOT NULL,
        recommendationContext TEXT NOT NULL, -- JSON with recommendation context
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      )
    `);
        // Create indexes for better performance
        await this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_user_integrations_user_id ON user_integrations(userId);
      CREATE INDEX IF NOT EXISTS idx_user_integrations_platform ON user_integrations(platform);
      CREATE INDEX IF NOT EXISTS idx_user_integrations_status ON user_integrations(status);
      CREATE INDEX IF NOT EXISTS idx_games_title ON games(title);
      CREATE INDEX IF NOT EXISTS idx_games_genres ON games(genres);
      CREATE INDEX IF NOT EXISTS idx_user_games_user_id ON user_games(userId);
      CREATE INDEX IF NOT EXISTS idx_user_games_game_id ON user_games(gameId);
      CREATE INDEX IF NOT EXISTS idx_user_games_status ON user_games(playStatus);
      CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(userId);
      CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expiresAt);
      CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(userId);
      CREATE INDEX IF NOT EXISTS idx_game_sessions_game_id ON game_sessions(gameId);
      CREATE INDEX IF NOT EXISTS idx_game_sessions_is_active ON game_sessions(isActive);
      CREATE INDEX IF NOT EXISTS idx_personas_user_id ON personas(userId);
      CREATE INDEX IF NOT EXISTS idx_personas_updated ON personas(lastUpdated);
    `);
        // User events table for insights
        await this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_events (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        payload TEXT, -- JSON
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        url TEXT,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      )
    `);
        await this.db.exec(`CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON user_events(userId)`);
    }
    // User operations
    async createUser(user, password) {
        if (!this.db)
            throw new Error('Database not initialized');
        const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        const userToInsert = {
            ...user,
            id,
            createdAt: new Date(now),
            updatedAt: new Date(now)
        };
        // Set default values for enhanced fields if not provided
        const defaultGamingProfile = {
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
        };
        const defaultPrivacy = {
            profileVisibility: 'public',
            sharePlaytime: true,
            shareAchievements: true,
            shareGameLibrary: true,
            allowFriendRequests: true,
            showOnlineStatus: true
        };
        const defaultPreferences = {
            theme: 'dark',
            language: 'en',
            notifications: {
                email: true,
                push: true,
                achievements: true,
                recommendations: true,
                friendActivity: true,
                platformUpdates: true
            },
            display: {
                compactMode: false,
                showGameCovers: true,
                animateTransitions: true,
                showRatings: true,
                accentColor: '#3b82f6',
                backgroundMode: 'gradient',
                animationLevel: 'medium',
                density: 'comfortable',
                lightingMode: 'none',
                borderRadius: 12,
                borderWidth: 1,
                shadowIntensity: 50,
                glassOpacity: 80,
                fontFamily: 'inter',
                fontSize: 'base',
                fontWeight: 400,
                animationStyle: 'smooth',
                hoverEffects: true,
                loadingAnimations: true,
                soundTheme: 'minimal',
                soundEnabled: false,
                volume: 50
            },
            perPageCustomisation: {}
        };
        const defaultSocial = {
            friends: [],
            blockedUsers: [],
            favoriteGenres: [],
            customTags: []
        };
        await this.db.run(`INSERT INTO users (
        id, username, email, displayName, avatar, bio, location, website, timezone,
        createdAt, updatedAt, lastActive, gamingProfile, integrations,
        privacy, preferences, social, personaData, currentMood, moodHistory,
        moodPreferences, playPatterns, averageSessionLength, preferredPlaytimes,
        customFields
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            userToInsert.id,
            userToInsert.username,
            userToInsert.email,
            userToInsert.displayName || userToInsert.username,
            userToInsert.avatar || null,
            userToInsert.bio || null,
            userToInsert.location || null,
            userToInsert.website || null,
            userToInsert.timezone || 'UTC',
            now,
            now,
            userToInsert.lastActive?.toISOString() || null,
            JSON.stringify(userToInsert.gamingProfile || defaultGamingProfile),
            JSON.stringify(userToInsert.integrations || []),
            JSON.stringify(userToInsert.privacy || defaultPrivacy),
            JSON.stringify(userToInsert.preferences || defaultPreferences),
            JSON.stringify(userToInsert.social || defaultSocial),
            JSON.stringify({
                traits: [],
                moodHistory: [],
                playPatterns: [],
                preferences: {}
            }), // Default persona data
            userToInsert.gamingProfile?.moodProfile?.currentMood || 'neutral',
            JSON.stringify(userToInsert.gamingProfile?.moodProfile?.moodHistory || []),
            JSON.stringify(userToInsert.gamingProfile?.moodProfile?.moodPreferences || {}),
            JSON.stringify({}), // Default play patterns
            0, // Default average session length
            JSON.stringify([]), // Default preferred playtimes
            JSON.stringify(userToInsert.customFields || [])
        ]);
        // Store password if provided
        if (password) {
            await this.setPassword(userToInsert.id, password);
        }
        return userToInsert;
    }
    async getUserById(id) {
        if (!this.db)
            throw new Error('Database not initialized');
        const row = await this.db.get('SELECT * FROM users WHERE id = ?', [id]);
        if (!row)
            return null;
        return this.mapRowToUser(row);
    }
    async getUserByUsername(username) {
        if (!this.db)
            throw new Error('Database not initialized');
        const row = await this.db.get('SELECT * FROM users WHERE username = ?', [username]);
        if (!row)
            return null;
        return this.mapRowToUser(row);
    }
    async getUserByEmail(email) {
        if (!this.db)
            throw new Error('Database not initialized');
        const row = await this.db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (!row)
            return null;
        return this.mapRowToUser(row);
    }
    async updateUser(id, updates) {
        if (!this.db)
            throw new Error('Database not initialized');
        const current = await this.getUserById(id);
        if (!current)
            throw new Error('User not found');
        const updated = {
            ...current,
            ...updates,
            updatedAt: new Date()
        };
        await this.db.run(`UPDATE users SET 
        username = ?, email = ?, displayName = ?, avatar = ?, bio = ?, 
        location = ?, timezone = ?, updatedAt = ?, lastActive = ?,
        gamingProfile = ?, integrations = ?, privacy = ?, preferences = ?, social = ?
      WHERE id = ?`, [
            updated.username,
            updated.email,
            updated.displayName,
            updated.avatar,
            updated.bio,
            updated.location,
            updated.timezone,
            updated.updatedAt.toISOString(),
            updated.lastActive?.toISOString(),
            JSON.stringify(updated.gamingProfile),
            JSON.stringify(updated.integrations),
            JSON.stringify(updated.privacy),
            JSON.stringify(updated.preferences),
            JSON.stringify(updated.social),
            id
        ]);
        return updated;
    }
    // Integration operations
    async createIntegration(integration) {
        if (!this.db)
            throw new Error('Database not initialized');
        const id = `integration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        const integrationToInsert = {
            ...integration,
            id,
            createdAt: new Date(now),
            updatedAt: new Date(now)
        };
        await this.db.run(`INSERT INTO user_integrations (
        id, userId, platform, externalUserId, externalUsername,
        accessToken, refreshToken, expiresAt, scopes, status,
        isActive, isConnected, createdAt, updatedAt, lastSyncAt,
        lastUsedAt, metadata, syncConfig
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            integrationToInsert.id,
            integrationToInsert.userId,
            integrationToInsert.platform,
            integrationToInsert.externalUserId,
            integrationToInsert.externalUsername,
            integrationToInsert.accessToken,
            integrationToInsert.refreshToken,
            integrationToInsert.expiresAt?.toISOString(),
            JSON.stringify(integrationToInsert.scopes),
            integrationToInsert.status,
            integrationToInsert.isActive ? 1 : 0,
            integrationToInsert.isConnected ? 1 : 0,
            integrationToInsert.createdAt.toISOString(),
            integrationToInsert.updatedAt.toISOString(),
            integrationToInsert.lastSyncAt?.toISOString(),
            integrationToInsert.lastUsedAt?.toISOString(),
            JSON.stringify(integrationToInsert.metadata),
            JSON.stringify(integrationToInsert.syncConfig)
        ]);
        return integrationToInsert;
    }
    async getUserIntegrations(userId) {
        if (!this.db)
            throw new Error('Database not initialized');
        const rows = await this.db.all('SELECT * FROM user_integrations WHERE userId = ? ORDER BY createdAt DESC', [userId]);
        return rows.map(row => this.mapRowToIntegration(row));
    }
    async getIntegration(userId, platform) {
        if (!this.db)
            throw new Error('Database not initialized');
        const row = await this.db.get('SELECT * FROM user_integrations WHERE userId = ? AND platform = ?', [userId, platform]);
        if (!row)
            return null;
        return this.mapRowToIntegration(row);
    }
    async updateIntegration(id, updates) {
        if (!this.db)
            throw new Error('Database not initialized');
        const current = await this.getIntegrationById(id);
        if (!current)
            throw new Error('Integration not found');
        const updated = {
            ...current,
            ...updates,
            updatedAt: new Date()
        };
        await this.db.run(`UPDATE user_integrations SET 
        externalUserId = ?, externalUsername = ?, accessToken = ?, refreshToken = ?,
        expiresAt = ?, scopes = ?, status = ?, isActive = ?, isConnected = ?,
        updatedAt = ?, lastSyncAt = ?, lastUsedAt = ?, metadata = ?, syncConfig = ?
      WHERE id = ?`, [
            updated.externalUserId,
            updated.externalUsername,
            updated.accessToken,
            updated.refreshToken,
            updated.expiresAt?.toISOString(),
            JSON.stringify(updated.scopes),
            updated.status,
            updated.isActive ? 1 : 0,
            updated.isConnected ? 1 : 0,
            updated.updatedAt.toISOString(),
            updated.lastSyncAt?.toISOString(),
            updated.lastUsedAt?.toISOString(),
            JSON.stringify(updated.metadata),
            JSON.stringify(updated.syncConfig),
            id
        ]);
        return updated;
    }
    async deleteIntegration(id) {
        if (!this.db)
            throw new Error('Database not initialized');
        await this.db.run('DELETE FROM user_integrations WHERE id = ?', [id]);
    }
    async getUserIntegration(userId, platform) {
        if (!this.db)
            throw new Error('Database not initialized');
        const row = await this.db.get('SELECT * FROM user_integrations WHERE userId = ? AND platform = ?', [userId, platform]);
        if (!row)
            return null;
        return this.mapRowToIntegration(row);
    }
    async createUserIntegration(integration) {
        if (!this.db)
            throw new Error('Database not initialized');
        const now = new Date().toISOString();
        const integrationToInsert = {
            id: integration.id,
            userId: integration.userId,
            platform: integration.platform,
            externalUserId: integration.externalUserId,
            externalUsername: integration.externalUsername || '',
            accessToken: undefined,
            refreshToken: undefined,
            expiresAt: undefined,
            scopes: [],
            status: shared_1.IntegrationStatus.INACTIVE,
            isActive: false,
            isConnected: false,
            createdAt: new Date(now),
            updatedAt: new Date(now),
            lastSyncAt: undefined,
            lastUsedAt: undefined,
            metadata: {},
            syncConfig: {
                autoSync: true,
                syncFrequency: 12,
                errorCount: 0,
                maxRetries: 3
            }
        };
        await this.db.run(`INSERT INTO user_integrations (
        id, userId, platform, externalUserId, externalUsername,
        accessToken, refreshToken, expiresAt, scopes, status,
        isActive, isConnected, createdAt, updatedAt, lastSyncAt,
        lastUsedAt, metadata, syncConfig
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            integrationToInsert.id,
            integrationToInsert.userId,
            integrationToInsert.platform,
            integrationToInsert.externalUserId,
            integrationToInsert.externalUsername,
            integrationToInsert.accessToken,
            integrationToInsert.refreshToken,
            integrationToInsert.expiresAt?.toISOString(),
            JSON.stringify(integrationToInsert.scopes),
            integrationToInsert.status,
            integrationToInsert.isActive ? 1 : 0,
            integrationToInsert.isConnected ? 1 : 0,
            integrationToInsert.createdAt.toISOString(),
            integrationToInsert.updatedAt.toISOString(),
            integrationToInsert.lastSyncAt?.toISOString(),
            integrationToInsert.lastUsedAt?.toISOString(),
            JSON.stringify(integrationToInsert.metadata),
            JSON.stringify(integrationToInsert.syncConfig)
        ]);
        return integrationToInsert;
    }
    // Game operations
    async createGame(game) {
        if (!this.db)
            throw new Error('Database not initialized');
        const id = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        const gameToInsert = {
            ...game,
            id,
            addedAt: new Date(now)
        };
        await this.db.run(`INSERT INTO games (
        id, title, description, backgroundImages, coverImage, releaseDate,
        developer, publisher, genres, subgenres, platforms, emotionalTags,
        userRating, globalRating, playStatus, hoursPlayed, lastPlayed,
        addedAt, notes, isFavorite, moods, playHistory, releaseYear,
        achievements, totalPlaytime, averageRating, completionPercentage, appId, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            gameToInsert.id,
            gameToInsert.title,
            gameToInsert.description,
            JSON.stringify(gameToInsert.backgroundImages),
            gameToInsert.coverImage,
            gameToInsert.releaseDate?.toISOString(),
            gameToInsert.developer,
            gameToInsert.publisher,
            JSON.stringify(gameToInsert.genres),
            JSON.stringify(gameToInsert.subgenres),
            JSON.stringify(gameToInsert.platforms),
            JSON.stringify(gameToInsert.emotionalTags),
            gameToInsert.userRating,
            gameToInsert.globalRating,
            gameToInsert.playStatus,
            gameToInsert.hoursPlayed,
            gameToInsert.lastPlayed?.toISOString(),
            gameToInsert.addedAt.toISOString(),
            gameToInsert.notes,
            gameToInsert.isFavorite ? 1 : 0,
            JSON.stringify(gameToInsert.moods),
            JSON.stringify(gameToInsert.playHistory),
            gameToInsert.releaseYear,
            JSON.stringify(gameToInsert.achievements),
            gameToInsert.totalPlaytime,
            gameToInsert.averageRating,
            gameToInsert.completionPercentage,
            gameToInsert.appId || null,
            JSON.stringify(gameToInsert.tags || [])
        ]);
        return gameToInsert;
    }
    async getUserGames(userId) {
        if (!this.db)
            throw new Error('Database not initialized');
        const rows = await this.db.all(`SELECT g.* FROM games g
       INNER JOIN user_games ug ON g.id = ug.gameId
       WHERE ug.userId = ?
       ORDER BY ug.addedAt DESC`, [userId]);
        return rows.map(row => this.mapRowToGame(row));
    }
    async getAllGames() {
        if (!this.db)
            throw new Error('Database not initialized');
        const rows = await this.db.all(`SELECT * FROM games ORDER BY addedAt DESC`);
        return rows.map(row => this.mapRowToGame(row));
    }
    async migrateEmotionalTagsToMoods() {
        if (!this.db)
            throw new Error('Database not initialized');
        // Get all games with empty moods but non-empty emotionalTags
        const rows = await this.db.all(`SELECT id, emotionalTags FROM games 
       WHERE (moods IS NULL OR moods = '[]' OR moods = '') 
       AND (emotionalTags IS NOT NULL AND emotionalTags != '[]' AND emotionalTags != '')`);
        let updatedCount = 0;
        for (const row of rows) {
            try {
                const emotionalTags = JSON.parse(row.emotionalTags || '[]');
                if (Array.isArray(emotionalTags) && emotionalTags.length > 0) {
                    // Convert emotionalTags (strings or objects) to MoodId strings
                    const moods = emotionalTags.map(tag => {
                        if (typeof tag === 'string') {
                            return tag;
                        }
                        else if (tag && typeof tag === 'object' && tag.name) {
                            return tag.name;
                        }
                        return tag;
                    }).filter(Boolean);
                    await this.db.run(`UPDATE games SET moods = ? WHERE id = ?`, [JSON.stringify(moods), row.id]);
                    updatedCount++;
                }
            }
            catch (error) {
                console.error(`Error migrating game ${row.id}:`, error);
            }
        }
        console.log(`🔧 Database: Migrated ${updatedCount} games from emotionalTags to moods`);
        return updatedCount;
    }
    async getGameById(id) {
        if (!this.db)
            throw new Error('Database not initialized');
        const row = await this.db.get('SELECT * FROM games WHERE id = ?', [id]);
        if (!row)
            return null;
        return this.mapRowToGame(row);
    }
    async getGameByAppId(appId) {
        if (!this.db)
            throw new Error('Database not initialized');
        const row = await this.db.get('SELECT * FROM games WHERE appId = ?', [appId]);
        if (!row)
            return null;
        return this.mapRowToGame(row);
    }
    async getGameByTitle(title) {
        if (!this.db)
            throw new Error('Database not initialized');
        const row = await this.db.get('SELECT * FROM games WHERE title = ?', [title]);
        if (!row)
            return null;
        return this.mapRowToGame(row);
    }
    async updateGame(id, updates) {
        if (!this.db)
            throw new Error('Database not initialized');
        const current = await this.getGameById(id);
        if (!current)
            throw new Error('Game not found');
        const updated = {
            ...current,
            ...updates
        };
        await this.db.run(`UPDATE games SET 
        title = ?, description = ?, backgroundImages = ?, coverImage = ?, 
        releaseDate = ?, developer = ?, publisher = ?, genres = ?, 
        subgenres = ?, platforms = ?, emotionalTags = ?, userRating = ?, 
        globalRating = ?, playStatus = ?, hoursPlayed = ?, lastPlayed = ?,
        notes = ?, isFavorite = ?, moods = ?, playHistory = ?, 
        releaseYear = ?, achievements = ?, totalPlaytime = ?, 
        averageRating = ?, completionPercentage = ?, appId = ?
      WHERE id = ?`, [
            updated.title,
            updated.description,
            JSON.stringify(updated.backgroundImages),
            updated.coverImage,
            updated.releaseDate?.toISOString(),
            updated.developer,
            updated.publisher,
            JSON.stringify(updated.genres),
            JSON.stringify(updated.subgenres),
            JSON.stringify(updated.platforms),
            JSON.stringify(updated.emotionalTags),
            updated.userRating,
            updated.globalRating,
            updated.playStatus,
            updated.hoursPlayed,
            updated.lastPlayed?.toISOString(),
            updated.notes,
            updated.isFavorite ? 1 : 0,
            JSON.stringify(updated.moods),
            JSON.stringify(updated.playHistory),
            updated.releaseYear,
            JSON.stringify(updated.achievements),
            updated.totalPlaytime,
            updated.averageRating,
            updated.completionPercentage,
            updated.appId || null,
            id
        ]);
        return updated;
    }
    async deleteGame(id) {
        if (!this.db)
            throw new Error('Database not initialized');
        // Delete from user_games junction table first (foreign key constraint)
        await this.db.run('DELETE FROM user_games WHERE gameId = ?', [id]);
        // Then delete the game
        const result = await this.db.run('DELETE FROM games WHERE id = ?', [id]);
        return (result.changes || 0) > 0;
    }
    /**
     * Delete user and all associated data (GDPR compliant cleanup)
     * Budget-friendly: Uses SQLite cascading and manual cleanup
     */
    async deleteUser(id) {
        if (!this.db)
            throw new Error('Database not initialized');
        console.log(`🗑️ Database: Deleting user ${id} and all associated data`);
        try {
            // Use a transaction for atomic deletion
            await this.db.run('BEGIN TRANSACTION');
            // Delete from all tables (SQLite ON DELETE CASCADE handles some, but let's be explicit)
            await this.db.run('DELETE FROM user_integrations WHERE userId = ?', [id]);
            await this.db.run('DELETE FROM user_games WHERE userId = ?', [id]);
            await this.db.run('DELETE FROM game_sessions WHERE userId = ?', [id]);
            await this.db.run('DELETE FROM personas WHERE userId = ?', [id]);
            await this.db.run('DELETE FROM sessions WHERE userId = ?', [id]);
            await this.db.run('DELETE FROM passwords WHERE userId = ?', [id]);
            // Finally delete the user record
            const result = await this.db.run('DELETE FROM users WHERE id = ?', [id]);
            await this.db.run('COMMIT');
            const success = (result.changes || 0) > 0;
            if (success) {
                console.log(`✅ Database: User ${id} deleted successfully`);
            }
            return success;
        }
        catch (error) {
            await this.db.run('ROLLBACK');
            console.error(`❌ Database: Failed to delete user ${id}:`, error);
            throw error;
        }
    }
    async addUserGame(userId, gameId, gameData = {}) {
        if (!this.db)
            throw new Error('Database not initialized');
        const id = `user_game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await this.db.run(`INSERT OR REPLACE INTO user_games (
        id, userId, gameId, playStatus, hoursPlayed, lastPlayed, notes, isFavorite
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
            id,
            userId,
            gameId,
            gameData.playStatus || 'unplayed',
            gameData.hoursPlayed || 0,
            gameData.lastPlayed?.toISOString(),
            gameData.notes,
            gameData.isFavorite ? 1 : 0
        ]);
    }
    // Helper methods
    mapRowToUser(row) {
        return {
            id: row.id,
            username: row.username,
            email: row.email,
            displayName: row.displayName,
            avatar: row.avatar,
            bio: row.bio,
            location: row.location,
            timezone: row.timezone,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
            lastActive: row.lastActive ? new Date(row.lastActive) : undefined,
            gamingProfile: JSON.parse(row.gamingProfile || '{}'),
            integrations: JSON.parse(row.integrations || '[]'),
            privacy: JSON.parse(row.privacy || '{}'),
            preferences: JSON.parse(row.preferences || '{}'),
            social: JSON.parse(row.social || '{}')
        };
    }
    mapRowToIntegration(row) {
        return {
            id: row.id,
            userId: row.userId,
            platform: row.platform,
            externalUserId: row.externalUserId,
            externalUsername: row.externalUsername,
            accessToken: row.accessToken,
            refreshToken: row.refreshToken,
            expiresAt: row.expiresAt ? new Date(row.expiresAt) : undefined,
            scopes: JSON.parse(row.scopes || '[]'),
            status: row.status,
            isActive: Boolean(row.isActive),
            isConnected: Boolean(row.isConnected),
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
            lastSyncAt: row.lastSyncAt ? new Date(row.lastSyncAt) : undefined,
            lastUsedAt: row.lastUsedAt ? new Date(row.lastUsedAt) : undefined,
            metadata: JSON.parse(row.metadata || '{}'),
            syncConfig: JSON.parse(row.syncConfig || '{}')
        };
    }
    mapRowToGame(row) {
        const game = {
            id: row.id,
            title: row.title,
            description: row.description,
            backgroundImages: JSON.parse(row.backgroundImages || '[]'),
            coverImage: row.coverImage,
            releaseDate: row.releaseDate ? new Date(row.releaseDate) : undefined,
            developer: row.developer,
            publisher: row.publisher,
            genres: JSON.parse(row.genres || '[]'),
            subgenres: JSON.parse(row.subgenres || '[]'),
            platforms: JSON.parse(row.platforms || '[]'),
            emotionalTags: JSON.parse(row.emotionalTags || '[]'),
            userRating: row.userRating,
            globalRating: row.globalRating,
            playStatus: row.playStatus,
            hoursPlayed: row.hoursPlayed,
            lastPlayed: row.lastPlayed ? new Date(row.lastPlayed) : undefined,
            addedAt: new Date(row.addedAt),
            notes: row.notes,
            isFavorite: Boolean(row.isFavorite),
            tags: JSON.parse(row.tags || '[]'),
            moods: JSON.parse(row.moods || '[]'),
            playHistory: JSON.parse(row.playHistory || '[]'),
            releaseYear: row.releaseYear,
            achievements: JSON.parse(row.achievements || '{}'),
            totalPlaytime: row.totalPlaytime,
            averageRating: row.averageRating,
            completionPercentage: row.completionPercentage
        };
        // Add appId if it exists
        if (row.appId) {
            game.appId = row.appId;
        }
        return game;
    }
    async getIntegrationById(id) {
        if (!this.db)
            throw new Error('Database not initialized');
        const row = await this.db.get('SELECT * FROM user_integrations WHERE id = ?', [id]);
        if (!row)
            return null;
        return this.mapRowToIntegration(row);
    }
    // Database health check
    async healthCheck() {
        try {
            if (!this.db) {
                return {
                    status: 'unhealthy',
                    details: {
                        connected: false,
                        tablesExist: false,
                        migrationsUpToDate: false,
                        readTest: 'failed',
                        writeTest: 'failed',
                        error: 'Database not initialized',
                        issues: ['Database not initialized']
                    }
                };
            }
            // Use enhanced health check
            const enhancedCheck = await (0, databaseRetry_1.performDatabaseHealthCheck)(this.db);
            // Check if essential tables exist
            const tables = await this.db.all(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name IN ('users', 'games', 'sessions')
      `);
            const tablesExist = tables.length >= 3;
            // Check if migrations are up to date
            const latestMigration = this.migrations[this.migrations.length - 1];
            const migrationRecord = await this.db.get('SELECT * FROM migrations WHERE id = ?', [latestMigration.id]);
            const migrationsUpToDate = !!migrationRecord;
            const status = enhancedCheck.status === 'healthy' && tablesExist && migrationsUpToDate ? 'healthy' : 'unhealthy';
            return {
                status,
                details: {
                    connected: enhancedCheck.details.connected,
                    tablesExist,
                    migrationsUpToDate,
                    readTest: enhancedCheck.details.readTest,
                    writeTest: enhancedCheck.details.writeTest,
                    error: enhancedCheck.details.error,
                    issues: [...enhancedCheck.details.issues]
                }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                details: {
                    connected: false,
                    tablesExist: false,
                    migrationsUpToDate: false,
                    readTest: 'failed',
                    writeTest: 'failed',
                    error: error.message,
                    issues: [error.message]
                }
            };
        }
    }
    // Generic query method
    async runQuery(sql, params = []) {
        if (!this.db)
            throw new Error('Database not initialized');
        const result = await this.db.run(sql, params);
        return { changes: result.changes || 0 };
    }
    // Generic query all method
    async getAll(sql, params = []) {
        if (!this.db)
            throw new Error('Database not initialized');
        return await this.db.all(sql, params);
    }
    // Session management methods
    async createSession(sessionData) {
        if (!this.db)
            throw new Error('Database not initialized');
        await this.db.run(`INSERT INTO sessions (
        token, userId, createdAt, expiresAt, lastAccessed, userAgent, ipAddress
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            sessionData.token,
            sessionData.userId,
            sessionData.createdAt.toISOString(),
            sessionData.expiresAt.toISOString(),
            sessionData.lastAccessed.toISOString(),
            sessionData.userAgent,
            sessionData.ipAddress
        ]);
    }
    async getSession(token) {
        if (!this.db)
            throw new Error('Database not initialized');
        const row = await this.db.get('SELECT * FROM sessions WHERE token = ?', [token]);
        if (!row)
            return null;
        return {
            token: row.token,
            userId: row.userId,
            createdAt: new Date(row.createdAt),
            expiresAt: new Date(row.expiresAt),
            lastAccessed: new Date(row.lastAccessed),
            userAgent: row.userAgent,
            ipAddress: row.ipAddress
        };
    }
    async updateSession(sessionData) {
        if (!this.db)
            throw new Error('Database not initialized');
        await this.db.run(`UPDATE sessions SET lastAccessed = ?, userAgent = ?, ipAddress = ? 
       WHERE token = ? AND userId = ?`, [
            sessionData.lastAccessed.toISOString(),
            sessionData.userAgent,
            sessionData.ipAddress,
            sessionData.token,
            sessionData.userId
        ]);
    }
    async deleteSession(token) {
        if (!this.db)
            throw new Error('Database not initialized');
        const result = await this.db.run('DELETE FROM sessions WHERE token = ?', [token]);
        return (result.changes || 0) > 0;
    }
    async deleteAllUserSessions(userId) {
        if (!this.db)
            throw new Error('Database not initialized');
        const result = await this.db.run('DELETE FROM sessions WHERE userId = ?', [userId]);
        return result.changes || 0;
    }
    async deleteExpiredSessions() {
        if (!this.db)
            throw new Error('Database not initialized');
        const result = await this.db.run('DELETE FROM sessions WHERE expiresAt < ?', [new Date().toISOString()]);
        return result.changes || 0;
    }
    async getUserSessionCount(userId) {
        if (!this.db)
            throw new Error('Database not initialized');
        const row = await this.db.get('SELECT COUNT(*) as count FROM sessions WHERE userId = ? AND expiresAt > ?', [userId, new Date().toISOString()]);
        return row?.count || 0;
    }
    // Game session operations
    async createGameSession(sessionData) {
        if (!this.db)
            throw new Error('Database not initialized');
        const id = `game_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await this.db.run(`INSERT INTO game_sessions (
        id, userId, gameId, startedAt, platformCode, launchMethod, isActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            id,
            sessionData.userId,
            sessionData.gameId,
            sessionData.startedAt.toISOString(),
            sessionData.platformCode,
            sessionData.launchMethod || 'manual',
            sessionData.isActive !== false ? 1 : 0
        ]);
        return {
            id,
            gameId: sessionData.gameId,
            userId: sessionData.userId,
            startedAt: sessionData.startedAt
        };
    }
    async getGameSession(sessionId) {
        if (!this.db)
            throw new Error('Database not initialized');
        const row = await this.db.get('SELECT * FROM game_sessions WHERE id = ?', [sessionId]);
        if (!row)
            return null;
        return {
            id: row.id,
            userId: row.userId,
            gameId: row.gameId,
            startedAt: new Date(row.startedAt),
            endedAt: row.endedAt ? new Date(row.endedAt) : undefined,
            duration: row.duration,
            platformCode: row.platformCode,
            launchMethod: row.launchMethod,
            isActive: Boolean(row.isActive)
        };
    }
    async getActiveGameSessions(userId, gameId) {
        if (!this.db)
            throw new Error('Database not initialized');
        let query = 'SELECT * FROM game_sessions WHERE userId = ? AND isActive = 1';
        const params = [userId];
        if (gameId) {
            query += ' AND gameId = ?';
            params.push(gameId);
        }
        query += ' ORDER BY startedAt DESC';
        const rows = await this.db.all(query, params);
        return rows.map(row => ({
            id: row.id,
            userId: row.userId,
            gameId: row.gameId,
            startedAt: new Date(row.startedAt),
            platformCode: row.platformCode,
            launchMethod: row.launchMethod,
            isActive: Boolean(row.isActive)
        }));
    }
    async endGameSession(sessionId, endedAt, duration) {
        if (!this.db)
            throw new Error('Database not initialized');
        await this.db.run('UPDATE game_sessions SET endedAt = ?, duration = ?, isActive = 0 WHERE id = ?', [endedAt.toISOString(), duration, sessionId]);
    }
    async getGameSessionHistory(userId, gameId, limit = 50, offset = 0) {
        if (!this.db)
            throw new Error('Database not initialized');
        let query = 'SELECT * FROM game_sessions WHERE userId = ?';
        const params = [userId];
        if (gameId) {
            query += ' AND gameId = ?';
            params.push(gameId);
        }
        query += ' ORDER BY startedAt DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);
        const rows = await this.db.all(query, params);
        return rows.map(row => ({
            id: row.id,
            userId: row.userId,
            gameId: row.gameId,
            startedAt: new Date(row.startedAt),
            endedAt: row.endedAt ? new Date(row.endedAt) : undefined,
            duration: row.duration,
            platformCode: row.platformCode,
            launchMethod: row.launchMethod,
            isActive: Boolean(row.isActive)
        }));
    }
    // Password operations
    async setPassword(userId, passwordHash) {
        if (!this.db)
            throw new Error('Database not initialized');
        await this.db.run(`
      INSERT OR REPLACE INTO passwords (userId, passwordHash, updatedAt)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `, [userId, passwordHash]);
    }
    async getPassword(userId) {
        if (!this.db)
            throw new Error('Database not initialized');
        const row = await this.db.get('SELECT passwordHash FROM passwords WHERE userId = ?', [userId]);
        return row ? row.passwordHash : null;
    }
    async validatePassword(userId, password, compareFn) {
        if (!this.db)
            throw new Error('Database not initialized');
        const passwordHash = await this.getPassword(userId);
        if (!passwordHash)
            return false;
        return await compareFn(password, passwordHash);
    }
    async deletePassword(userId) {
        if (!this.db)
            throw new Error('Database not initialized');
        await this.db.run('DELETE FROM passwords WHERE userId = ?', [userId]);
    }
    // Persona Database Methods
    /**
     * Get user persona from database
     */
    async getPersona(userId) {
        if (!this.db)
            throw new Error('Database not initialized');
        const row = await this.db.get('SELECT * FROM personas WHERE userId = ?', [userId]);
        if (!row)
            return null;
        // Parse JSON fields
        return {
            ...row,
            traits: JSON.parse(row.traits || '{}'),
            patterns: JSON.parse(row.patterns || '{}'),
            history: JSON.parse(row.history || '{}'),
            signals: JSON.parse(row.signals || '{}'),
            recommendationContext: JSON.parse(row.recommendationContext || '{}'),
            createdAt: new Date(row.createdAt),
            lastUpdated: new Date(row.lastUpdated),
            lastAnalysisDate: new Date(row.lastAnalysisDate)
        };
    }
    /**
     * Create new persona in database
     */
    async createPersona(userId, persona) {
        if (!this.db)
            throw new Error('Database not initialized');
        await this.db.run(`
      INSERT INTO personas (
        userId, traits, currentMood, currentIntent, moodIntensity,
        patterns, history, signals, confidence, dataPoints, lastAnalysisDate,
        recommendationContext, createdAt, lastUpdated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            userId,
            JSON.stringify(persona.traits),
            persona.currentMood,
            persona.currentIntent,
            persona.moodIntensity,
            JSON.stringify(persona.patterns),
            JSON.stringify(persona.history),
            JSON.stringify(persona.signals),
            persona.confidence,
            persona.dataPoints,
            persona.lastAnalysisDate.toISOString(),
            JSON.stringify(persona.recommendationContext),
            persona.createdAt.toISOString(),
            persona.lastUpdated.toISOString()
        ]);
    }
    /**
     * Update existing persona in database
     */
    async updatePersona(userId, persona) {
        if (!this.db)
            throw new Error('Database not initialized');
        await this.db.run(`
      UPDATE personas SET
        traits = ?, currentMood = ?, currentIntent = ?, moodIntensity = ?,
        patterns = ?, history = ?, signals = ?, confidence = ?, dataPoints = ?,
        lastAnalysisDate = ?, recommendationContext = ?, lastUpdated = ?
      WHERE userId = ?
    `, [
            JSON.stringify(persona.traits),
            persona.currentMood,
            persona.currentIntent,
            persona.moodIntensity,
            JSON.stringify(persona.patterns),
            JSON.stringify(persona.history),
            JSON.stringify(persona.signals),
            persona.confidence,
            persona.dataPoints,
            persona.lastAnalysisDate.toISOString(),
            JSON.stringify(persona.recommendationContext),
            persona.lastUpdated.toISOString(),
            userId
        ]);
    }
    /**
     * Delete persona from database
     */
    async deletePersona(userId) {
        if (!this.db)
            throw new Error('Database not initialized');
        await this.db.run('DELETE FROM personas WHERE userId = ?', [userId]);
    }
    /**
     * Get all personas (for admin/debugging)
     */
    async getAllPersonas() {
        if (!this.db)
            throw new Error('Database not initialized');
        const rows = await this.db.all('SELECT * FROM personas ORDER BY lastUpdated DESC');
        return rows.map(row => ({
            ...row,
            traits: JSON.parse(row.traits || '{}'),
            patterns: JSON.parse(row.patterns || '{}'),
            history: JSON.parse(row.history || '{}'),
            signals: JSON.parse(row.signals || '{}'),
            recommendationContext: JSON.parse(row.recommendationContext || '{}'),
            createdAt: new Date(row.createdAt),
            lastUpdated: new Date(row.lastUpdated),
            lastAnalysisDate: new Date(row.lastAnalysisDate)
        }));
    }
    async close() {
        if (this.db) {
            await this.db.close();
            this.db = null;
            console.log('🗄️ Database connection closed');
        }
    }
}
exports.DatabaseService = DatabaseService;
// Singleton instance
exports.databaseService = new DatabaseService();
//# sourceMappingURL=database.js.map