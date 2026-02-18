import * as sqlite3 from 'sqlite3'
import { Database, open } from 'sqlite'
import * as path from 'path'
import * as fs from 'fs/promises'
import * as jwt from 'jsonwebtoken'
import type { Request } from 'express'
import { performDatabaseHealthCheck, withDatabaseRetry } from './databaseRetry'
import { User, UserIntegration, IntegrationStatus } from '@gamepilot/shared'
import { Game, PlatformCode } from '@gamepilot/shared'
import { addMoodPersonaTables, initializePersonaProfiles } from '../migrations/addMoodPersonaTables'

// Add PostgreSQL support for production
let pg: any
let Pool: any

// Dynamic import for PostgreSQL to avoid top-level await
const initializePostgres = async () => {
  if (!pg) {
    try {
      // Only load PostgreSQL if available (optional dependency)
      const pgModule = await import('pg')
      pg = pgModule.default
      Pool = pgModule.Pool
    } catch (error) {
      // PostgreSQL not available, will use SQLite
      console.log('📦 PostgreSQL not available, using SQLite')
    }
  }
}

export interface DatabaseSchema {
  users: User
  user_integrations: UserIntegration
  games: Game
  user_games: {
    id: string
    userId: string
    gameId: string
    playStatus: string
    hoursPlayed: number
    lastPlayed: Date
    addedAt: Date
    notes?: string
    isFavorite: boolean
  }
}

export interface Migration {
  id: string
  version: string
  description: string
  up: (db: Database) => Promise<void>
  down: (db: Database) => Promise<void>
}

export class DatabaseService {
  private db: Database | any = null
  private pool: any = null
  private readonly dbPath: string
  private readonly isProduction: boolean
  private readonly migrations: Migration[] = []

  constructor(dbPath?: string) {
    this.dbPath = dbPath || path.join(process.cwd(), 'gamepilot.db')
    this.isProduction = !!(process.env.NODE_ENV === 'production' && process.env.DATABASE_URL?.startsWith('postgresql://'))
    
    // Register migrations
    this.registerMigrations()
  }

  private registerMigrations(): void {
    // Migration 1: Add enhanced user fields for mood tracking and persona data
    this.migrations.push({
      id: '001_add_enhanced_user_fields',
      version: '1.0.0',
      description: 'Add enhanced user fields for mood tracking, play patterns, and persona data',
      up: async (db: Database) => {
        console.log('🔄 Running migration 001: Add enhanced user fields')
        
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
        ]

        for (const column of columnsToAdd) {
          try {
            await db.run(`ALTER TABLE users ADD COLUMN ${column}`)
            console.log(`✅ Added column: ${column}`)
          } catch (error) {
            // Column might already exist, ignore error
            console.log(`ℹ️ Column already exists or failed to add: ${column}`)
          }
        }
      },
      down: async (db: Database) => {
        // Note: SQLite doesn't support dropping columns easily
        // This would require recreating the table
        console.log('⚠️ Migration rollback not implemented for SQLite')
      }
    })

    // Migration 2: Add user preferences and privacy defaults
    this.migrations.push({
      id: '002_add_user_defaults',
      version: '1.0.1',
      description: 'Add default user preferences and privacy settings',
      up: async (db: Database) => {
        console.log('🔄 Running migration 002: Add user defaults')
        
        // Update existing users with default preferences
        await db.run(`
          UPDATE users 
          SET preferences = COALESCE(preferences, '{"theme":"dark","language":"en","notifications":{"email":true,"push":true,"achievements":true,"recommendations":true,"friendActivity":true,"platformUpdates":true},"display":{"compactMode":false,"showGameCovers":true,"animateTransitions":true,"showRatings":true}}'),
              privacy = COALESCE(privacy, '{"profileVisibility":"public","sharePlaytime":true,"shareAchievements":true,"shareGameLibrary":true,"allowFriendRequests":true,"showOnlineStatus":true}'),
              gaming_profile = COALESCE(gaming_profile, '{"primaryPlatforms":[],"genreAffinities":{},"playstyleArchetypes":[],"moodProfile":{"currentMood":"neutral","moodHistory":[],"moodTriggers":[],"moodPreferences":{}},"totalPlaytime":0,"gamesPlayed":0,"gamesCompleted":0,"achievementsCount":0,"averageRating":0,"currentStreak":0,"longestStreak":0,"favoriteGames":[]}'),
              social = COALESCE(social, '{"friends":[],"blockedUsers":[],"favoriteGenres":[],"customTags":[]}')
          WHERE preferences IS NULL OR privacy IS NULL OR gaming_profile IS NULL OR social IS NULL
        `)
        
        console.log('✅ Updated existing users with default preferences')
      },
      down: async (db: Database) => {
        console.log('⚠️ Migration rollback not implemented for user defaults')
      }
    })

    // Migration 4: Add premium coaching features
    this.migrations.push({
      id: '004_add_premium_coaching',
      version: '2.1.0',
      description: 'Add premium coaching features including user goals, weekly plans, and coaching sessions',
      up: async (db: Database) => {
        console.log('🔄 Running migration 004: Add premium coaching features')

        // Create user_goals table for tracking gaming objectives
        await db.exec(`
          CREATE TABLE IF NOT EXISTS user_goals (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            goal_type TEXT NOT NULL CHECK (goal_type IN ('finish_backlog', 'relax_more', 'try_new_genres', 'beat_favorites', 'social_play', 'skill_improvement', 'custom')),
            title TEXT NOT NULL,
            description TEXT,
            target_value INTEGER, -- e.g., number of games to finish
            current_value INTEGER DEFAULT 0,
            status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
            priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
            deadline DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            completed_at DATETIME,
            metadata TEXT, -- JSON for additional goal-specific data
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
          )
        `)

        // Create weekly_play_plans table for AI-generated recommendations
        await db.exec(`
          CREATE TABLE IF NOT EXISTS weekly_play_plans (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            week_start DATETIME NOT NULL,
            week_end DATETIME NOT NULL,
            theme TEXT, -- e.g., "Backlog Blitz", "Relaxation Week"
            recommendations TEXT NOT NULL, -- JSON array of recommended games with reasoning
            goals_alignment TEXT, -- JSON showing how plan aligns with user goals
            mood_focus TEXT, -- JSON with mood considerations
            generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT 1,
            feedback_rating INTEGER, -- 1-5 stars
            feedback_comments TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            UNIQUE(user_id, week_start)
          )
        `)

        // Create coaching_sessions table for tracking interactions
        await db.exec(`
          CREATE TABLE IF NOT EXISTS coaching_sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            session_type TEXT NOT NULL CHECK (session_type IN ('weekly_plan', 'goal_checkin', 'mood_advice', 'recommendation_explanation', 'custom')),
            content TEXT NOT NULL, -- The coaching content/message
            ai_model TEXT, -- Which AI model generated this
            user_feedback TEXT, -- JSON with user reactions
            effectiveness_rating INTEGER, -- How helpful was this coaching
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            read_at DATETIME,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
          )
        `)

        // Create indexes for performance
        await db.exec(`
          CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
          CREATE INDEX IF NOT EXISTS idx_user_goals_status ON user_goals(status);
          CREATE INDEX IF NOT EXISTS idx_user_goals_type ON user_goals(goal_type);
          CREATE INDEX IF NOT EXISTS idx_weekly_play_plans_user_id ON weekly_play_plans(user_id);
          CREATE INDEX IF NOT EXISTS idx_weekly_play_plans_active ON weekly_play_plans(is_active);
          CREATE INDEX IF NOT EXISTS idx_weekly_play_plans_week ON weekly_play_plans(week_start, week_end);
          CREATE INDEX IF NOT EXISTS idx_coaching_sessions_user_id ON coaching_sessions(user_id);
          CREATE INDEX IF NOT EXISTS idx_coaching_sessions_type ON coaching_sessions(session_type);
        `)

        console.log('✅ Premium coaching tables created successfully')
      },
      down: async (db: Database) => {
        console.log('⚠️ Migration rollback not implemented for premium coaching tables')
      }
    })
  }

  private async runMigrations(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    // Create migrations table if it doesn't exist
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id TEXT PRIMARY KEY,
        version TEXT NOT NULL,
        description TEXT,
        appliedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Get applied migrations
    const appliedMigrations = await this.db.all('SELECT id FROM migrations')
    const appliedIds = new Set(appliedMigrations.map((row: any) => row.id))

    // Run pending migrations
    for (const migration of this.migrations) {
      if (!appliedIds.has(migration.id)) {
        console.log(`🔄 Running migration: ${migration.id} - ${migration.description}`)
        
        try {
          await migration.up(this.db)
          
          // Record migration
          await this.db.run(
            'INSERT INTO migrations (id, version, description) VALUES (?, ?, ?)',
            [migration.id, migration.version, migration.description]
          )
          
          console.log(`✅ Migration completed: ${migration.id}`)
        } catch (error) {
          console.error(`❌ Migration failed: ${migration.id}`, error)
          throw error
        }
      }
    }
  }

  async initialize(): Promise<void> {
    try {
      // Initialize PostgreSQL support if needed
      await initializePostgres()

      if (this.isProduction && Pool) {
        // Production: Use PostgreSQL with connection pooling
        console.log('🗄️ Initializing PostgreSQL database connection pool')

        const dbUrl = new URL(process.env.DATABASE_URL!)
        this.pool = new Pool({
          host: dbUrl.hostname,
          port: parseInt(dbUrl.port) || 5432,
          database: dbUrl.pathname.slice(1),
          user: dbUrl.username,
          password: dbUrl.password,
          max: parseInt(process.env.DB_POOL_MAX || '20'), // Maximum connections
          min: parseInt(process.env.DB_POOL_MIN || '2'),  // Minimum connections
          idleTimeoutMillis: 30000, // Close idle connections after 30s
          connectionTimeoutMillis: 2000, // Connection timeout
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        })

        // Test connection
        const client = await this.pool.connect()
        console.log('✅ PostgreSQL connection pool initialized')
        client.release()

        // Run migrations for PostgreSQL
        await this.runMigrationsPostgres()

        // Create tables for PostgreSQL
        await this.createTablesPostgres()

      } else {
        // Development: Use SQLite
        console.log('🗄️ Initializing SQLite database at:', this.dbPath)

        // Ensure database directory exists
        const dbDir = path.dirname(this.dbPath)
        await fs.mkdir(dbDir, { recursive: true })

        // Open database connection
        this.db = await open({
          filename: this.dbPath,
          driver: sqlite3.Database
        })

        console.log('✅ SQLite database initialized')

        // Create tables and run migrations
        await this.createTables()
        await this.runMigrations()
      }

      console.log('✅ Database initialization completed successfully')
    } catch (error) {
      console.error('❌ Database initialization failed:', error)
      throw error
    }
  }

  private async runMigrationsPostgres(): Promise<void> {
    if (!this.pool) throw new Error('PostgreSQL pool not initialized')

    const client = await this.pool.connect()

    try {
      // Create migrations table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id TEXT PRIMARY KEY,
          version TEXT NOT NULL,
          description TEXT,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Get applied migrations
      const result = await client.query('SELECT id FROM migrations')
      const appliedIds = new Set(result.rows.map((row: any) => row.id))

      // Run pending migrations
      for (const migration of this.migrations) {
        if (!appliedIds.has(migration.id)) {
          console.log(`🔄 Running PostgreSQL migration: ${migration.id} - ${migration.description}`)

          try {
            await client.query('BEGIN')

            // For PostgreSQL, we need to adapt the migration functions
            // Most SQLite migrations will work with minor adjustments
            if (migration.up) {
              await this.runPostgresMigration(migration.up, client)
            }

            // Record migration
            await client.query(
              'INSERT INTO migrations (id, version, description) VALUES ($1, $2, $3)',
              [migration.id, migration.version, migration.description]
            )

            await client.query('COMMIT')
            console.log(`✅ PostgreSQL migration completed: ${migration.id}`)
          } catch (error) {
            await client.query('ROLLBACK')
            console.error(`❌ PostgreSQL migration failed: ${migration.id}`, error)
            throw error
          }
        }
      }
    } finally {
      client.release()
    }
  }

  private async runPostgresMigration(migrationFn: (db: any) => Promise<void>, client: any): Promise<void> {
    // Adapt SQLite migration functions for PostgreSQL
    const adaptedDb = {
      exec: async (sql: string) => await client.query(sql),
      run: async (sql: string, params?: any[]) => {
        // Convert SQLite-style placeholders to PostgreSQL
        const pgSql = sql.replace(/\?/g, (match, offset) => `$${offset + 1}`)
        return await client.query(pgSql, params || [])
      },
      get: async (sql: string, params?: any[]) => {
        const pgSql = sql.replace(/\?/g, (match, offset) => `$${offset + 1}`)
        const result = await client.query(pgSql, params || [])
        return result.rows[0] || null
      },
      all: async (sql: string, params?: any[]) => {
        const pgSql = sql.replace(/\?/g, (match, offset) => `$${offset + 1}`)
        const result = await client.query(pgSql, params || [])
        return result.rows
      }
    }

    await migrationFn(adaptedDb)
  }

  private async createTablesPostgres(): Promise<void> {
    console.log('PostgreSQL table creation not yet implemented')
  }

  private async createTables(): Promise<void> {
    if (this.isProduction && this.pool) {
      await this.createTablesPostgres()
      return
    }

    if (!this.db) throw new Error('Database not initialized')

    // Users table - Enhanced for mood tracking, play patterns, and persona data
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        display_name TEXT,
        avatar TEXT,
        bio TEXT,
        location TEXT,
        website TEXT,
        timezone TEXT DEFAULT 'UTC',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP,

        -- Steam API Key (per-user)
        steam_api_key TEXT,

        -- Enhanced Gaming Profile
        gaming_profile JSONB, -- JSON with mood tracking, play patterns, persona data
        
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
    `)

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
    `)

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
    `)

    // Add appId column if it doesn't exist (for existing databases)
    try {
      await this.db.run(`ALTER TABLE games ADD COLUMN appId INTEGER`)
    } catch (error) {
      // Column might already exist, ignore error
    }

    // Add tags column if it doesn't exist (for existing databases)
    try {
      await this.db.run(`ALTER TABLE games ADD COLUMN tags TEXT`)
    } catch (error) {
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
    `)

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
    `)

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
    `)

    // Passwords table for secure password storage
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS passwords (
        userId TEXT PRIMARY KEY,
        passwordHash TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      )
    `)

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
    `)

    // Create indexes for better performance
    await this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_steam_api_key ON users(steam_api_key);
      CREATE INDEX IF NOT EXISTS idx_user_integrations_user_id ON user_integrations(userId);
      CREATE INDEX IF NOT EXISTS idx_user_integrations_platform ON user_integrations(platform);
      CREATE INDEX IF NOT EXISTS idx_user_integrations_status ON user_integrations(status);
      CREATE INDEX IF NOT EXISTS idx_games_title ON games(title);
      CREATE INDEX IF NOT EXISTS idx_games_app_id ON games(appId);
      CREATE INDEX IF NOT EXISTS idx_games_genres ON games(genres);
      CREATE INDEX IF NOT EXISTS idx_games_platforms ON games(platforms);
      CREATE INDEX IF NOT EXISTS idx_games_moods ON games(moods);
      CREATE INDEX IF NOT EXISTS idx_user_games_user_id ON user_games(userId);
      CREATE INDEX IF NOT EXISTS idx_user_games_game_id ON user_games(gameId);
      CREATE INDEX IF NOT EXISTS idx_user_games_status ON user_games(playStatus);
      CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(userId);
      CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expiresAt);
      CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(userId);
      CREATE INDEX IF NOT EXISTS idx_game_sessions_game_id ON game_sessions(gameId);
      CREATE INDEX IF NOT EXISTS idx_game_sessions_is_active ON game_sessions(isActive);
    `)
  }

  async getUserSteamApiKey(userId: string): Promise<string | null> {
    if (this.isProduction && this.pool) {
      const client = await this.pool.connect()
      try {
        const result = await client.query('SELECT steam_api_key FROM users WHERE id = $1', [userId])
        return result.rows[0]?.steam_api_key || null
      } finally {
        client.release()
      }
    } else {
      if (!this.db) throw new Error('Database not initialized')
      const row = await this.db.get('SELECT steam_api_key FROM users WHERE id = ?', [userId])
      return row?.steam_api_key || null
    }
  }

  async setUserSteamApiKey(userId: string, apiKey: string): Promise<void> {
    if (this.isProduction && this.pool) {
      const client = await this.pool.connect()
      try {
        await client.query('UPDATE users SET steam_api_key = $1 WHERE id = $2', [apiKey, userId])
      } finally {
        client.release()
      }
    } else {
      if (!this.db) throw new Error('Database not initialized')
      await this.db.run('UPDATE users SET steam_api_key = ? WHERE id = ?', [apiKey, userId])
    }
  }

  // User operations
  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>, password?: string): Promise<User> {
    if (!this.db) throw new Error('Database not initialized')

    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()

    const userToInsert: User = {
      ...user,
      id,
      createdAt: new Date(now),
      updatedAt: new Date(now)
    }

    // Set default values for enhanced fields if not provided
    const defaultGamingProfile = {
      primaryPlatforms: [],
      genreAffinities: {},
      playstyleArchetypes: [],
      moodProfile: {
        currentMood: 'neutral' as const,
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
    }

    const defaultPrivacy = {
      profileVisibility: 'public' as const,
      sharePlaytime: true,
      shareAchievements: true,
      shareGameLibrary: true,
      allowFriendRequests: true,
      showOnlineStatus: true
    }

    const defaultPreferences = {
      theme: 'dark' as const,
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
    }

    const defaultSocial = {
      friends: [],
      blockedUsers: [],
      favoriteGenres: [],
      customTags: []
    }

    await this.db.run(
      `INSERT INTO users (
        id, username, email, displayName, avatar, bio, location, website, timezone,
        createdAt, updatedAt, lastActive, gamingProfile, integrations,
        privacy, preferences, social, personaData, currentMood, moodHistory,
        moodPreferences, playPatterns, averageSessionLength, preferredPlaytimes,
        customFields
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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
      ]
    )

    // Store password if provided
    if (password) {
      await this.setPassword(userToInsert.id, password)
    }

    return userToInsert
  }

  async getUserById(id: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized')

    const row = await this.db.get('SELECT * FROM users WHERE id = ?', [id])
    if (!row) return null

    return this.mapRowToUser(row)
  }

  async getUserByUsername(username: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized')

    const row = await this.db.get('SELECT * FROM users WHERE username = ?', [username])
    if (!row) return null

    return this.mapRowToUser(row)
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized')

    const row = await this.db.get('SELECT * FROM users WHERE email = ?', [email])
    if (!row) return null

    return this.mapRowToUser(row)
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    if (!this.db) throw new Error('Database not initialized')

    const current = await this.getUserById(id)
    if (!current) throw new Error('User not found')

    const updated: User = {
      ...current,
      ...updates,
      updatedAt: new Date()
    }

    await this.db.run(
      `UPDATE users SET 
        username = ?, email = ?, displayName = ?, avatar = ?, bio = ?, 
        location = ?, timezone = ?, updatedAt = ?, lastActive = ?,
        gamingProfile = ?, integrations = ?, privacy = ?, preferences = ?, social = ?
      WHERE id = ?`,
      [
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
      ]
    )

    return updated
  }

  // Integration operations
  async createIntegration(integration: Omit<UserIntegration, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserIntegration> {
    if (!this.db) throw new Error('Database not initialized')

    const id = `integration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()

    const integrationToInsert: UserIntegration = {
      ...integration,
      id,
      createdAt: new Date(now),
      updatedAt: new Date(now)
    }

    await this.db.run(
      `INSERT INTO user_integrations (
        id, userId, platform, externalUserId, externalUsername,
        accessToken, refreshToken, expiresAt, scopes, status,
        isActive, isConnected, createdAt, updatedAt, lastSyncAt,
        lastUsedAt, metadata, syncConfig
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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
      ]
    )

    return integrationToInsert
  }

  async getUserIntegrations(userId: string): Promise<UserIntegration[]> {
    if (!this.db) throw new Error('Database not initialized')

    const rows = await this.db.all(
      'SELECT * FROM user_integrations WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    )

    return rows.map((row: any) => this.mapRowToIntegration(row))
  }

  async getIntegration(userId: string, platform: PlatformCode): Promise<UserIntegration | null> {
    if (!this.db) throw new Error('Database not initialized')

    const row = await this.db.get(
      'SELECT * FROM user_integrations WHERE userId = ? AND platform = ?',
      [userId, platform]
    )

    if (!row) return null

    return this.mapRowToIntegration(row)
  }

  async updateIntegration(id: string, updates: Partial<UserIntegration>): Promise<UserIntegration> {
    if (!this.db) throw new Error('Database not initialized')

    const current = await this.getIntegrationById(id)
    if (!current) throw new Error('Integration not found')

    const updated: UserIntegration = {
      ...current,
      ...updates,
      updatedAt: new Date()
    }

    await this.db.run(
      `UPDATE user_integrations SET 
        externalUserId = ?, externalUsername = ?, accessToken = ?, refreshToken = ?,
        expiresAt = ?, scopes = ?, status = ?, isActive = ?, isConnected = ?,
        updatedAt = ?, lastSyncAt = ?, lastUsedAt = ?, metadata = ?, syncConfig = ?
      WHERE id = ?`,
      [
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
      ]
    )

    return updated
  }

  async deleteIntegration(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    await this.db.run('DELETE FROM user_integrations WHERE id = ?', [id])
  }

  async getUserIntegration(userId: string, platform: string): Promise<UserIntegration | null> {
    if (!this.db) throw new Error('Database not initialized')

    const row = await this.db.get(
      'SELECT * FROM user_integrations WHERE userId = ? AND platform = ?',
      [userId, platform]
    )

    if (!row) return null

    return this.mapRowToIntegration(row)
  }

  async createUserIntegration(integration: {
    id: string
    userId: string
    platform: string
    externalUserId: string
    externalUsername?: string
  }): Promise<UserIntegration> {
    if (!this.db) throw new Error('Database not initialized')

    const now = new Date().toISOString()

    const integrationToInsert: UserIntegration = {
      id: integration.id,
      userId: integration.userId,
      platform: integration.platform as PlatformCode,
      externalUserId: integration.externalUserId,
      externalUsername: integration.externalUsername || '',
      accessToken: undefined,
      refreshToken: undefined,
      expiresAt: undefined,
      scopes: [],
      status: IntegrationStatus.INACTIVE,
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
    }

    await this.db.run(
      `INSERT INTO user_integrations (
        id, userId, platform, externalUserId, externalUsername,
        accessToken, refreshToken, expiresAt, scopes, status,
        isActive, isConnected, createdAt, updatedAt, lastSyncAt,
        lastUsedAt, metadata, syncConfig
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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
      ]
    )

    return integrationToInsert
  }

  // Game operations
  async createGame(game: Omit<Game, 'id' | 'addedAt'>): Promise<Game> {
    if (!this.db) throw new Error('Database not initialized')

    const id = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()

    const gameToInsert: Game = {
      ...game,
      id,
      addedAt: new Date(now)
    }

    await this.db.run(
      `INSERT INTO games (
        id, title, description, backgroundImages, coverImage, releaseDate,
        developer, publisher, genres, subgenres, platforms, emotionalTags,
        userRating, globalRating, playStatus, hoursPlayed, lastPlayed,
        addedAt, notes, isFavorite, moods, playHistory, releaseYear,
        achievements, totalPlaytime, averageRating, completionPercentage, appId, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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
        (gameToInsert as any).appId || null,
        JSON.stringify(gameToInsert.tags || [])
      ]
    )

    return gameToInsert
  }

  async getUserGames(userId: string): Promise<Game[]> {
    if (!this.db) throw new Error('Database not initialized')

    const rows = await this.db.all(
      `SELECT g.* FROM games g
       INNER JOIN user_games ug ON g.id = ug.gameId
       WHERE ug.userId = ?
       ORDER BY ug.addedAt DESC`,
      [userId]
    )

    return rows.map((row: any) => this.mapRowToGame(row))
  }

  async getAllGames(): Promise<Game[]> {
    if (!this.db) throw new Error('Database not initialized')

    const rows = await this.db.all(
      `SELECT * FROM games ORDER BY addedAt DESC`
    )

    return rows.map((row: any) => this.mapRowToGame(row))
  }

  async migrateEmotionalTagsToMoods(): Promise<number> {
    if (!this.db) throw new Error('Database not initialized')

    // Get all games with empty moods but non-empty emotionalTags
    const rows = await this.db.all(
      `SELECT id, emotionalTags FROM games 
       WHERE (moods IS NULL OR moods = '[]' OR moods = '') 
       AND (emotionalTags IS NOT NULL AND emotionalTags != '[]' AND emotionalTags != '')`
    )

    let updatedCount = 0
    
    for (const row: any of rows) {
      try {
        const emotionalTags = JSON.parse(row.emotionalTags || '[]')
        if (Array.isArray(emotionalTags) && emotionalTags.length > 0) {
          // Convert emotionalTags (strings or objects) to MoodId strings
          const moods = emotionalTags.map(tag => {
            if (typeof tag === 'string') {
              return tag
            } else if (tag && typeof tag === 'object' && tag.name) {
              return tag.name
            }
            return tag
          }).filter(Boolean)

          await this.db.run(
            `UPDATE games SET moods = ? WHERE id = ?`,
            [JSON.stringify(moods), row.id]
          )
          updatedCount++
        }
      } catch (error) {
        console.error(`Error migrating game ${row.id}:`, error)
      }
    }

    console.log(`🔧 Database: Migrated ${updatedCount} games from emotionalTags to moods`)
    return updatedCount
  }

  async getGameById(id: string): Promise<Game | null> {
    if (!this.db) throw new Error('Database not initialized')

    const row = await this.db.get('SELECT * FROM games WHERE id = ?', [id])
    if (!row) return null

    return this.mapRowToGame(row)
  }

  async getGameByAppId(appId: number): Promise<Game | null> {
    if (!this.db) throw new Error('Database not initialized')

    const row = await this.db.get('SELECT * FROM games WHERE appId = ?', [appId])
    if (!row) return null

    return this.mapRowToGame(row)
  }

  async getGameByTitle(title: string): Promise<Game | null> {
    if (!this.db) throw new Error('Database not initialized')

    const row = await this.db.get('SELECT * FROM games WHERE title = ?', [title])
    if (!row) return null

    return this.mapRowToGame(row)
  }

  async updateGame(id: string, updates: Partial<Game>): Promise<Game> {
    if (!this.db) throw new Error('Database not initialized')

    const current = await this.getGameById(id)
    if (!current) throw new Error('Game not found')

    const updated: Game = {
      ...current,
      ...updates
    }

    await this.db.run(
      `UPDATE games SET 
        title = ?, description = ?, backgroundImages = ?, coverImage = ?, 
        releaseDate = ?, developer = ?, publisher = ?, genres = ?, 
        subgenres = ?, platforms = ?, emotionalTags = ?, userRating = ?, 
        globalRating = ?, playStatus = ?, hoursPlayed = ?, lastPlayed = ?,
        notes = ?, isFavorite = ?, moods = ?, playHistory = ?, 
        releaseYear = ?, achievements = ?, totalPlaytime = ?, 
        averageRating = ?, completionPercentage = ?, appId = ?
      WHERE id = ?`,
      [
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
        (updated as any).appId || null,
        id
      ]
    )

    return updated
  }

  async deleteGame(id: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized')

    // Delete from user_games junction table first (foreign key constraint)
    await this.db.run('DELETE FROM user_games WHERE gameId = ?', [id])
    
    // Then delete the game
    const result = await this.db.run('DELETE FROM games WHERE id = ?', [id])
    return (result.changes || 0) > 0
  }

  /**
   * Delete user and all associated data (GDPR compliant cleanup)
   * Budget-friendly: Uses SQLite cascading and manual cleanup
   */
  async deleteUser(id: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized')
    
    console.log(`🗑️ Database: Deleting user ${id} and all associated data`)
    
    try {
      // Use a transaction for atomic deletion
      await this.db.run('BEGIN TRANSACTION')
      
      // Delete from all tables (SQLite ON DELETE CASCADE handles some, but let's be explicit)
      await this.db.run('DELETE FROM user_integrations WHERE userId = ?', [id])
      await this.db.run('DELETE FROM user_games WHERE userId = ?', [id])
      await this.db.run('DELETE FROM game_sessions WHERE userId = ?', [id])
      await this.db.run('DELETE FROM personas WHERE userId = ?', [id])
      await this.db.run('DELETE FROM sessions WHERE userId = ?', [id])
      await this.db.run('DELETE FROM passwords WHERE userId = ?', [id])
      
      // Finally delete the user record
      const result = await this.db.run('DELETE FROM users WHERE id = ?', [id])
      
      await this.db.run('COMMIT')
      
      const success = (result.changes || 0) > 0
      if (success) {
        console.log(`✅ Database: User ${id} deleted successfully`)
      }
      return success
    } catch (error) {
      await this.db.run('ROLLBACK')
      console.error(`❌ Database: Failed to delete user ${id}:`, error)
      throw error
    }
  }

  async addUserGame(userId: string, gameId: string, gameData: Partial<{
    playStatus: string
    hoursPlayed: number
    lastPlayed: Date
    notes: string
    isFavorite: boolean
  }> = {}): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    const id = `user_game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    await this.db.run(
      `INSERT OR REPLACE INTO user_games (
        id, userId, gameId, playStatus, hoursPlayed, lastPlayed, notes, isFavorite
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId,
        gameId,
        gameData.playStatus || 'unplayed',
        gameData.hoursPlayed || 0,
        gameData.lastPlayed?.toISOString(),
        gameData.notes,
        gameData.isFavorite ? 1 : 0
      ]
    )
  }

  // Helper methods
  private mapRowToUser(row: any): User {
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
    }
  }

  private mapRowToIntegration(row: any): UserIntegration {
    return {
      id: row.id,
      userId: row.userId,
      platform: row.platform as PlatformCode,
      externalUserId: row.externalUserId,
      externalUsername: row.externalUsername,
      accessToken: row.accessToken,
      refreshToken: row.refreshToken,
      expiresAt: row.expiresAt ? new Date(row.expiresAt) : undefined,
      scopes: JSON.parse(row.scopes || '[]'),
      status: row.status as IntegrationStatus,
      isActive: Boolean(row.isActive),
      isConnected: Boolean(row.isConnected),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      lastSyncAt: row.lastSyncAt ? new Date(row.lastSyncAt) : undefined,
      lastUsedAt: row.lastUsedAt ? new Date(row.lastUsedAt) : undefined,
      metadata: JSON.parse(row.metadata || '{}'),
      syncConfig: JSON.parse(row.syncConfig || '{}')
    }
  }

  private mapRowToGame(row: any): Game {
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
    }
    
    // Add appId if it exists
    if (row.appId) {
      (game as any).appId = row.appId
    }
    
    return game
  }

  private async getIntegrationById(id: string): Promise<UserIntegration | null> {
    if (!this.db) throw new Error('Database not initialized')

    const row = await this.db.get('SELECT * FROM user_integrations WHERE id = ?', [id])
    if (!row) return null

    return this.mapRowToIntegration(row)
  }

  // Database health check
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy'
    details: {
      connected: boolean
      tablesExist: boolean
      migrationsUpToDate: boolean
      readTest: 'success' | 'failed'
      writeTest: 'success' | 'failed'
      error?: string
      issues: string[]
    }
  }> {
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
        }
      }

      // Use enhanced health check
      const enhancedCheck = await performDatabaseHealthCheck(this.db)
      
      // Check if essential tables exist
      const tables = await this.db.all(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name IN ('users', 'games', 'sessions')
      `)
      
      const tablesExist = tables.length >= 3
      
      // Check if migrations are up to date
      const latestMigration = this.migrations[this.migrations.length - 1]
      const migrationRecord = await this.db.get(
        'SELECT * FROM migrations WHERE id = ?',
        [latestMigration.id]
      )
      
      const migrationsUpToDate = !!migrationRecord

      const status = enhancedCheck.status === 'healthy' && tablesExist && migrationsUpToDate ? 'healthy' : 'unhealthy'
      
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
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          connected: false,
          tablesExist: false,
          migrationsUpToDate: false,
          readTest: 'failed',
          writeTest: 'failed',
          error: (error as Error).message,
          issues: [(error as Error).message]
        }
      }
    }
  }

  // Generic query method
  async runQuery(sql: string, params: any[] = []): Promise<{ changes: number }> {
    if (!this.db) throw new Error('Database not initialized')
    
    const result = await this.db.run(sql, params)
    return { changes: result.changes || 0 }
  }

  // Generic query all method
  async getAll(sql: string, params: any[] = []): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized')
    
    return await this.db.all(sql, params)
  }

  // Session management methods
  async createSession(sessionData: {
    token: string
    userId: string
    createdAt: Date
    expiresAt: Date
    lastAccessed: Date
    userAgent?: string
    ipAddress?: string
  }): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    await this.db.run(
      `INSERT INTO sessions (
        token, userId, createdAt, expiresAt, lastAccessed, userAgent, ipAddress
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        sessionData.token,
        sessionData.userId,
        sessionData.createdAt.toISOString(),
        sessionData.expiresAt.toISOString(),
        sessionData.lastAccessed.toISOString(),
        sessionData.userAgent,
        sessionData.ipAddress
      ]
    )
  }

  async getSession(token: string): Promise<{
    token: string
    userId: string
    createdAt: Date
    expiresAt: Date
    lastAccessed: Date
    userAgent?: string
    ipAddress?: string
  } | null> {
    if (!this.db) throw new Error('Database not initialized')

    const row = await this.db.get('SELECT * FROM sessions WHERE token = ?', [token])
    if (!row) return null

    return {
      token: row.token,
      userId: row.userId,
      createdAt: new Date(row.createdAt),
      expiresAt: new Date(row.expiresAt),
      lastAccessed: new Date(row.lastAccessed),
      userAgent: row.userAgent,
      ipAddress: row.ipAddress
    }
  }

  async updateSession(sessionData: {
    token: string
    userId: string
    lastAccessed: Date
    userAgent?: string
    ipAddress?: string
  }): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    await this.db.run(
      `UPDATE sessions SET lastAccessed = ?, userAgent = ?, ipAddress = ? 
       WHERE token = ? AND userId = ?`,
      [
        sessionData.lastAccessed.toISOString(),
        sessionData.userAgent,
        sessionData.ipAddress,
        sessionData.token,
        sessionData.userId
      ]
    )
  }

  async deleteSession(token: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized')

    const result = await this.db.run('DELETE FROM sessions WHERE token = ?', [token])
    return (result.changes || 0) > 0
  }

  async deleteAllUserSessions(userId: string): Promise<number> {
    if (!this.db) throw new Error('Database not initialized')

    const result = await this.db.run('DELETE FROM sessions WHERE userId = ?', [userId])
    return result.changes || 0
  }

  async deleteExpiredSessions(): Promise<number> {
    if (!this.db) throw new Error('Database not initialized')

    const result = await this.db.run(
      'DELETE FROM sessions WHERE expiresAt < ?',
      [new Date().toISOString()]
    )
    return result.changes || 0
  }

  async getUserSessionCount(userId: string): Promise<number> {
    if (!this.db) throw new Error('Database not initialized')

    const row = await this.db.get(
      'SELECT COUNT(*) as count FROM sessions WHERE userId = ? AND expiresAt > ?',
      [userId, new Date().toISOString()]
    )
    return row?.count || 0
  }

  // Game session operations
  async createGameSession(sessionData: {
    gameId: string
    userId: string
    startedAt: Date
    platformCode?: string
    launchMethod?: string
    isActive?: boolean
  }): Promise<{ id: string; gameId: string; userId: string; startedAt: Date }> {
    if (!this.db) throw new Error('Database not initialized')

    const id = `game_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    await this.db.run(
      `INSERT INTO game_sessions (
        id, userId, gameId, startedAt, platformCode, launchMethod, isActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        sessionData.userId,
        sessionData.gameId,
        sessionData.startedAt.toISOString(),
        sessionData.platformCode,
        sessionData.launchMethod || 'manual',
        sessionData.isActive !== false ? 1 : 0
      ]
    )

    return {
      id,
      gameId: sessionData.gameId,
      userId: sessionData.userId,
      startedAt: sessionData.startedAt
    }
  }

  async getGameSession(sessionId: string): Promise<{
    id: string
    userId: string
    gameId: string
    startedAt: Date
    endedAt?: Date
    duration?: number
    platformCode?: string
    launchMethod?: string
    isActive: boolean
  } | null> {
    if (!this.db) throw new Error('Database not initialized')

    const row = await this.db.get('SELECT * FROM game_sessions WHERE id = ?', [sessionId])
    if (!row) return null

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
    }
  }

  async getActiveGameSessions(userId: string, gameId?: string): Promise<Array<{
    id: string
    userId: string
    gameId: string
    startedAt: Date
    platformCode?: string
    launchMethod?: string
    isActive: boolean
  }>> {
    if (!this.db) throw new Error('Database not initialized')

    let query = 'SELECT * FROM game_sessions WHERE userId = ? AND isActive = 1'
    const params: any[] = [userId]

    if (gameId) {
      query += ' AND gameId = ?'
      params.push(gameId)
    }

    query += ' ORDER BY startedAt DESC'

    const rows = await this.db.all(query, params)
    return rows.map((row: any) => ({
      id: row.id,
      userId: row.userId,
      gameId: row.gameId,
      startedAt: new Date(row.startedAt),
      platformCode: row.platformCode,
      launchMethod: row.launchMethod,
      isActive: Boolean(row.isActive)
    }))
  }

  async endGameSession(sessionId: string, endedAt: Date, duration: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    await this.db.run(
      'UPDATE game_sessions SET endedAt = ?, duration = ?, isActive = 0 WHERE id = ?',
      [endedAt.toISOString(), duration, sessionId]
    )
  }

  async getGameSessionHistory(
    userId: string,
    gameId?: string,
    limit = 50,
    offset = 0
  ): Promise<Array<{
    id: string
    userId: string
    gameId: string
    startedAt: Date
    endedAt?: Date
    duration?: number
    platformCode?: string
    launchMethod?: string
    isActive: boolean
  }>> {
    if (!this.db) throw new Error('Database not initialized')

    let query = 'SELECT * FROM game_sessions WHERE userId = ?'
    const params: any[] = [userId]

    if (gameId) {
      query += ' AND gameId = ?'
      params.push(gameId)
    }

    query += ' ORDER BY startedAt DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const rows = await this.db.all(query, params)
    return rows.map((row: any) => ({
      id: row.id,
      userId: row.userId,
      gameId: row.gameId,
      startedAt: new Date(row.startedAt),
      endedAt: row.endedAt ? new Date(row.endedAt) : undefined,
      duration: row.duration,
      platformCode: row.platformCode,
      launchMethod: row.launchMethod,
      isActive: Boolean(row.isActive)
    }))
  }

  // Password operations
  async setPassword(userId: string, passwordHash: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    await this.db.run(`
      INSERT OR REPLACE INTO passwords (userId, passwordHash, updatedAt)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `, [userId, passwordHash])
  }

  async getPassword(userId: string): Promise<string | null> {
    if (!this.db) throw new Error('Database not initialized')

    const row = await this.db.get('SELECT passwordHash FROM passwords WHERE userId = ?', [userId])
    return row ? row.passwordHash : null
  }

  async validatePassword(userId: string, password: string, compareFn: (password: string, hash: string) => Promise<boolean>): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized')

    const passwordHash = await this.getPassword(userId)
    if (!passwordHash) return false

    return await compareFn(password, passwordHash)
  }

  async deletePassword(userId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    await this.db.run('DELETE FROM passwords WHERE userId = ?', [userId])
  }

  // Persona Database Methods
  
  /**
   * Get user persona from database
   */
  async getPersona(userId: string): Promise<any | null> {
    if (!this.db) throw new Error('Database not initialized')

    const row = await this.db.get('SELECT * FROM personas WHERE userId = ?', [userId])
    if (!row) return null

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
    }
  }

  /**
   * Create new persona in database
   */
  async createPersona(userId: string, persona: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

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
    ])
  }

  /**
   * Update existing persona in database
   */
  async updatePersona(userId: string, persona: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

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
    ])
  }

  /**
   * Delete persona from database
   */
  async deletePersona(userId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    await this.db.run('DELETE FROM personas WHERE userId = ?', [userId])
  }

  /**
   * Get all personas (for admin/debugging)
   */
  async getAllPersonas(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized')

    const rows = await this.db.all('SELECT * FROM personas ORDER BY lastUpdated DESC')
    return rows.map((row: any) => ({
      ...row,
      traits: JSON.parse(row.traits || '{}'),
      patterns: JSON.parse(row.patterns || '{}'),
      history: JSON.parse(row.history || '{}'),
      signals: JSON.parse(row.signals || '{}'),
      recommendationContext: JSON.parse(row.recommendationContext || '{}'),
      createdAt: new Date(row.createdAt),
      lastUpdated: new Date(row.lastUpdated),
      lastAnalysisDate: new Date(row.lastAnalysisDate)
    }))
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close()
      this.db = null
      console.log('🗄️ Database connection closed')
    }
  }
}

// Singleton instance
export const databaseService = new DatabaseService()
