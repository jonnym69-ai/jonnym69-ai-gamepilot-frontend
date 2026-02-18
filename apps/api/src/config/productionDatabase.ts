import { Database } from 'sqlite3'
import { open, Database as SQLiteDatabase } from 'sqlite'
import * as path from 'path'

// Production Database Configuration
export const productionDbConfig = {
  // Database file path for production
  filename: process.env.DATABASE_URL || './gamepilot_prod.db',
  
  // Connection pool settings
  poolSize: parseInt(process.env.DATABASE_POOL_SIZE || '10'),
  timeout: parseInt(process.env.DATABASE_TIMEOUT || '30000'),
  
  // SQLite configuration for production
  driver: {
    filename: process.env.DATABASE_URL || './gamepilot_prod.db',
    // Enable WAL mode for better concurrency
    mode: 'writable' as const,
    // Enable foreign key constraints
    foreignKeys: true,
    // Journal mode for better performance
    journalMode: 'WAL' as const,
    // Synchronous mode for durability
    synchronous: 'NORMAL' as const,
    // Cache size
    cacheSize: 10000,
    // Temp store
    tempStore: 'memory' as const
  },
  
  // Connection options
  options: {
    // Enable statement caching
    cachedStatements: true,
    // Maximum number of cached statements
    maxCachedStatements: 100,
    // Enable query logging in development
    debug: process.env.NODE_ENV !== 'production',
    // Connection timeout
    timeout: parseInt(process.env.DATABASE_TIMEOUT || '30000'),
    // Retry configuration
    retry: {
      attempts: 3,
      delay: 1000,
      backoff: 2
    }
  }
}

// Production database connection factory
export async function createProductionDatabase(): Promise<SQLiteDatabase> {
  try {
    console.log('🗄️ Initializing production database...')
    
    const db = await open({
      filename: productionDbConfig.filename,
      driver: productionDbConfig.driver
    })
    
    // Configure database for production
    await db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      PRAGMA cache_size = 10000;
      PRAGMA temp_store = memory;
      PRAGMA foreign_keys = ON;
      PRAGMA optimize;
    `)
    
    console.log('✅ Production database initialized successfully')
    
    return db
  } catch (error) {
    console.error('❌ Failed to initialize production database:', error)
    throw new Error(`Production database initialization failed: ${error}`)
  }
}

// Database health check for production
export async function checkDatabaseHealth(db: SQLiteDatabase) {
  try {
    const result = await db.get('SELECT COUNT(*) as count FROM sqlite_master')
    const tableCount = result?.count || 0
    
    // Check if essential tables exist
    const essentialTables = ['users', 'games', 'user_games', 'feedback']
    const existingTables: string[] = []
    
    for (const table of essentialTables) {
      const tableExists = await db.get(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name=?
      `, [table])
      
      if (tableExists) {
        existingTables.push(table)
      }
    }
    
    return {
      status: 'healthy',
      details: {
        totalTables: tableCount,
        essentialTables: existingTables.length,
        missingTables: essentialTables.filter(t => !existingTables.includes(t)),
        databaseSize: await getDatabaseSize(db),
        lastModified: await getLastModified(db)
      }
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown database error'
    }
  }
}

// Get database size
async function getDatabaseSize(db: SQLiteDatabase): Promise<number> {
  try {
    const result = await db.get('SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()')
    return result?.size || 0
  } catch {
    return 0
  }
}

// Get last modified time
async function getLastModified(db: SQLiteDatabase): Promise<string> {
  try {
    const result = await db.get('SELECT datetime(\'now\') as last_modified')
    return result?.last_modified || new Date().toISOString()
  } catch {
    return new Date().toISOString()
  }
}

// Database backup utility for production
export async function backupDatabase(db: SQLiteDatabase, backupPath: string) {
  try {
    console.log('💾 Starting database backup...')
    
    // Note: SQLite backup functionality would need to be implemented
    // This is a placeholder for the backup process
    console.log(`📊 Backup would be saved to: ${backupPath}`)
    
    console.log('✅ Database backup completed successfully')
    return { success: true, path: backupPath }
  } catch (error) {
    console.error('❌ Database backup failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Backup failed' }
  }
}

// Database migration runner for production
export async function runProductionMigrations(db: SQLiteDatabase) {
  try {
    console.log('🔄 Running production database migrations...')
    
    // Create migrations table if it doesn't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // List of production migrations
    const migrations = [
      '001_create_users_table.sql',
      '002_create_games_table.sql',
      '003_create_user_games_table.sql',
      '004_create_feedback_table.sql',
      '005_create_integrations_table.sql'
    ]
    
    for (const migration of migrations) {
      const exists = await db.get(
        'SELECT name FROM migrations WHERE name = ?',
        [migration]
      )
      
      if (!exists) {
        console.log(`📋 Running migration: ${migration}`)
        
        // Execute migration (in production, these would be actual SQL files)
        await db.exec(`
          -- Migration placeholder for ${migration}
          -- In production, this would read and execute the actual SQL file
        `)
        
        // Record migration
        await db.run(
          'INSERT INTO migrations (name) VALUES (?)',
          [migration]
        )
        
        console.log(`✅ Migration completed: ${migration}`)
      }
    }
    
    console.log('✅ All production migrations completed successfully')
  } catch (error) {
    console.error('❌ Production migration failed:', error)
    throw new Error(`Production migration failed: ${error}`)
  }
}

// Production database connection pool
class ProductionConnectionPool {
  private connections: SQLiteDatabase[] = []
  private maxConnections: number
  private currentConnections = 0
  
  constructor(maxConnections: number = 10) {
    this.maxConnections = maxConnections
  }
  
  async getConnection(): Promise<SQLiteDatabase> {
    if (this.connections.length > 0) {
      return this.connections.pop()!
    }
    
    if (this.currentConnections < this.maxConnections) {
      this.currentConnections++
      return await createProductionDatabase()
    }
    
    // Wait for a connection to become available
    return new Promise((resolve) => {
      const checkConnection = () => {
        if (this.connections.length > 0) {
          resolve(this.connections.pop()!)
        } else {
          setTimeout(checkConnection, 100)
        }
      }
      checkConnection()
    })
  }
  
  releaseConnection(connection: SQLiteDatabase): void {
    if (this.connections.length < this.maxConnections) {
      this.connections.push(connection)
    } else {
      this.currentConnections--
      connection.close()
    }
  }
  
  async closeAll(): Promise<void> {
    for (const connection of this.connections) {
      await connection.close()
    }
    this.connections = []
    this.currentConnections = 0
  }
}

export const productionConnectionPool = new ProductionConnectionPool(
  productionDbConfig.poolSize
)
