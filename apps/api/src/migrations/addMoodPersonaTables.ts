import { databaseService } from '../services/database'

/**
 * Migration to add comprehensive mood and persona tracking tables
 * for the adaptive mood-persona integration system
 */
export async function addMoodPersonaTables(): Promise<void> {
  try {
    console.log('🔄 Adding mood and persona tracking tables...')
    
    // Get the database instance directly for raw SQL execution
    const db = (databaseService as any).db
    if (!db) throw new Error('Database not initialized')
    
    // 1. mood_selections table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS mood_selections (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        primaryMood TEXT NOT NULL,
        secondaryMood TEXT,
        intensity REAL NOT NULL DEFAULT 0.8,
        sessionId TEXT,
        timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        context TEXT NOT NULL, -- JSON with timeOfDay, dayOfWeek, trigger, etc.
        outcomes TEXT NOT NULL, -- JSON with gamesRecommended, gamesLaunched, etc.
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      )
    `)
    console.log('✅ Created mood_selections table')

    // 2. persona_profile table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS persona_profile (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL UNIQUE,
        genreWeights TEXT NOT NULL, -- JSON with genre -> weight mapping
        tagWeights TEXT NOT NULL, -- JSON with tag -> weight mapping
        moodAffinity TEXT NOT NULL, -- JSON with mood -> affinity mapping
        sessionPatterns TEXT NOT NULL, -- JSON with session patterns
        hybridSuccess TEXT NOT NULL, -- JSON with hybrid mood success rates
        platformBiases TEXT NOT NULL, -- JSON with platform preferences
        timePreferences TEXT NOT NULL, -- JSON with time-of-day preferences
        confidence REAL NOT NULL DEFAULT 0.1,
        sampleSize INTEGER NOT NULL DEFAULT 0,
        lastUpdated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        version TEXT NOT NULL DEFAULT '2.0.0',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      )
    `)
    console.log('✅ Created persona_profile table')

    // 3. user_actions table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS user_actions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('launch', 'ignore', 'view', 'wishlist', 'rate', 'switch_mood', 'session_complete')),
        gameId TEXT,
        gameTitle TEXT,
        moodContext TEXT, -- JSON with primaryMood, secondaryMood at time of action
        timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        sessionId TEXT,
        metadata TEXT, -- JSON with sessionDuration, rating, reason, etc.
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      )
    `)
    console.log('✅ Created user_actions table')

    // 4. recommendation_events table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS recommendation_events (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        moodContext TEXT NOT NULL, -- JSON with primaryMood, secondaryMood, intensity
        recommendedGames TEXT NOT NULL, -- JSON with game recommendations and scores
        clickedGameId TEXT,
        successFlag BOOLEAN,
        timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        sessionId TEXT,
        metadata TEXT, -- JSON with additional context
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      )
    `)
    console.log('✅ Created recommendation_events table')

    // 5. mood_predictions table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS mood_predictions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        predictedMood TEXT NOT NULL,
        confidence REAL NOT NULL,
        reasoning TEXT, -- JSON with reasoning factors
        contextualFactors TEXT, -- JSON with time, context, etc.
        successProbability REAL NOT NULL,
        acceptedFlag BOOLEAN,
        timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        sessionId TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      )
    `)
    console.log('✅ Created mood_predictions table')

    // 6. mood_patterns table (for pattern analysis)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS mood_patterns (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        patternType TEXT NOT NULL CHECK (patternType IN ('daily_rhythm', 'weekly_pattern', 'contextual_trigger')),
        patternKey TEXT NOT NULL, -- time of day, day of week, context
        moodId TEXT NOT NULL,
        frequency INTEGER NOT NULL DEFAULT 1,
        successRate REAL NOT NULL DEFAULT 0.0,
        lastSeen DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        confidence REAL NOT NULL DEFAULT 0.1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(userId, patternType, patternKey, moodId)
      )
    `)
    console.log('✅ Created mood_patterns table')

    // 7. learning_metrics table (for tracking system performance)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS learning_metrics (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        metricType TEXT NOT NULL CHECK (metricType IN ('prediction_accuracy', 'user_satisfaction', 'adaptation_rate', 'recommendation_success')),
        metricValue REAL NOT NULL,
        period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
        timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT, -- JSON with additional context
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      )
    `)
    console.log('✅ Created learning_metrics table')

    // Create indexes for performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_mood_selections_user_id ON mood_selections(userId)',
      'CREATE INDEX IF NOT EXISTS idx_mood_selections_timestamp ON mood_selections(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_mood_selections_primary_mood ON mood_selections(primaryMood)',
      'CREATE INDEX IF NOT EXISTS idx_persona_profile_user_id ON persona_profile(userId)',
      'CREATE INDEX IF NOT EXISTS idx_persona_profile_updated ON persona_profile(lastUpdated)',
      'CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON user_actions(userId)',
      'CREATE INDEX IF NOT EXISTS idx_user_actions_timestamp ON user_actions(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_user_actions_type ON user_actions(type)',
      'CREATE INDEX IF NOT EXISTS idx_user_actions_game_id ON user_actions(gameId)',
      'CREATE INDEX IF NOT EXISTS idx_recommendation_events_user_id ON recommendation_events(userId)',
      'CREATE INDEX IF NOT EXISTS idx_recommendation_events_timestamp ON recommendation_events(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_mood_predictions_user_id ON mood_predictions(userId)',
      'CREATE INDEX IF NOT EXISTS idx_mood_predictions_timestamp ON mood_predictions(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_mood_patterns_user_id ON mood_patterns(userId)',
      'CREATE INDEX IF NOT EXISTS idx_mood_patterns_type ON mood_patterns(patternType)',
      'CREATE INDEX IF NOT EXISTS idx_learning_metrics_user_id ON learning_metrics(userId)',
      'CREATE INDEX IF NOT EXISTS idx_learning_metrics_timestamp ON learning_metrics(timestamp)'
    ]

    for (const indexSql of indexes) {
      await db.exec(indexSql)
    }
    console.log('✅ Created indexes for mood and persona tables')

    console.log('✅ Mood and persona tracking tables added successfully')
  } catch (error) {
    console.error('❌ Failed to add mood and persona tables:', error)
    throw error
  }
}

/**
 * Initialize default persona profile for existing users
 */
export async function initializePersonaProfiles(): Promise<void> {
  try {
    console.log('🔄 Initializing persona profiles for existing users...')
    
    const db = (databaseService as any).db
    if (!db) throw new Error('Database not initialized')
    
    // Get all users without persona profiles
    const users = await db.all(`
      SELECT u.id FROM users u 
      LEFT JOIN persona_profile pp ON u.id = pp.userId 
      WHERE pp.userId IS NULL
    `)
    
    for (const user of users) {
      const defaultProfile = {
        genreWeights: {},
        tagWeights: {},
        moodAffinity: {},
        sessionPatterns: {
          dailyRhythms: {},
          weeklyPatterns: {},
          contextualTriggers: {}
        },
        hybridSuccess: {},
        platformBiases: {},
        timePreferences: {
          morning: 0.5,
          afternoon: 0.5,
          evening: 0.5,
          night: 0.5
        },
        confidence: 0.1,
        sampleSize: 0,
        version: '2.0.0'
      }
      
      await db.run(`
        INSERT INTO persona_profile (
          id, userId, genreWeights, tagWeights, moodAffinity, 
          sessionPatterns, hybridSuccess, platformBiases, 
          timePreferences, confidence, sampleSize, version
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        `persona_${user.id}_${Date.now()}`,
        user.id,
        JSON.stringify(defaultProfile.genreWeights),
        JSON.stringify(defaultProfile.tagWeights),
        JSON.stringify(defaultProfile.moodAffinity),
        JSON.stringify(defaultProfile.sessionPatterns),
        JSON.stringify(defaultProfile.hybridSuccess),
        JSON.stringify(defaultProfile.platformBiases),
        JSON.stringify(defaultProfile.timePreferences),
        defaultProfile.confidence,
        defaultProfile.sampleSize,
        defaultProfile.version
      ])
    }
    
    console.log(`✅ Initialized persona profiles for ${users.length} users`)
  } catch (error) {
    console.error('❌ Failed to initialize persona profiles:', error)
    throw error
  }
}
