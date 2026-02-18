"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabasePool = void 0;
exports.getDatabasePool = getDatabasePool;
exports.withDatabase = withDatabase;
exports.checkDatabaseHealth = checkDatabaseHealth;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const errorLogger_1 = require("../logging/errorLogger");
class DatabaseConnection {
    constructor(connectionId) {
        this.db = null;
        this.inUse = false;
        this.connectionId = connectionId;
        this.lastUsed = new Date();
        this.createdAt = new Date();
    }
    async initialize(config) {
        try {
            this.db = new better_sqlite3_1.default(config.filename);
            // Configure connection settings
            if (config.busyTimeout) {
                this.db.busyTimeout(config.busyTimeout);
            }
            // Enable foreign keys
            if (config.enableForeignKeys !== false) {
                this.db.pragma('foreign_keys = ON');
            }
            // Enable WAL mode for better concurrency
            if (config.enableWAL !== false) {
                this.db.pragma('journal_mode = WAL');
            }
            // Set journal mode if specified
            if (config.journalMode) {
                this.db.pragma(`journal_mode = ${config.journalMode}`);
            }
            // Set synchronous mode
            if (config.synchronous) {
                this.db.pragma(`synchronous = ${config.synchronous}`);
            }
            // Set cache size
            if (config.cacheSize) {
                this.db.pragma(`cache_size = ${config.cacheSize}`);
            }
            // Optimize for performance
            this.db.pragma('temp_store = MEMORY');
            this.db.pragma('mmap_size = 268435456'); // 256MB
            (0, errorLogger_1.logInfo)(`Database connection ${this.connectionId} initialized`, undefined, {
                connectionId: this.connectionId,
                filename: config.filename
            });
        }
        catch (error) {
            (0, errorLogger_1.logError)(`Failed to initialize database connection ${this.connectionId}`, error, undefined, {
                connectionId: this.connectionId,
                filename: config.filename
            });
            throw error;
        }
    }
    getConnection() {
        if (!this.db) {
            throw new Error(`Database connection ${this.connectionId} not initialized`);
        }
        if (!this.inUse) {
            this.inUse = true;
            this.lastUsed = new Date();
            return this.db;
        }
        throw new Error(`Database connection ${this.connectionId} is already in use`);
    }
    releaseConnection() {
        this.inUse = false;
        this.lastUsed = new Date();
    }
    isIdle() {
        return !this.inUse && (Date.now() - this.lastUsed.getTime()) > 30000; // 30 seconds
    }
    isExpired() {
        return (Date.now() - this.createdAt.getTime()) > 300000; // 5 minutes
    }
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
            (0, errorLogger_1.logInfo)(`Database connection ${this.connectionId} closed`, undefined, {
                connectionId: this.connectionId
            });
        }
    }
    getMetrics() {
        return {
            connectionId: this.connectionId,
            inUse: this.inUse,
            createdAt: this.createdAt,
            lastUsed: this.lastUsed,
            age: Date.now() - this.createdAt.getTime()
        };
    }
}
class DatabasePool {
    constructor(config) {
        this.connections = [];
        this.connectionErrors = 0;
        this.totalConnectionTime = 0;
        this.connectionCount = 0;
        this.lastConnectionTime = new Date();
        this.config = config;
        this.maxConnections = config.maxConnections || 10;
    }
    async getConnection() {
        const startTime = Date.now();
        try {
            // Try to get an existing idle connection
            for (const connection of this.connections) {
                if (!connection.inUse && !connection.isExpired()) {
                    const db = connection.getConnection();
                    this.updateConnectionMetrics(startTime);
                    return db;
                }
            }
            // Create new connection if under limit
            if (this.connections.length < this.maxConnections) {
                const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const connection = new DatabaseConnection(connectionId);
                await connection.initialize(this.config);
                this.connections.push(connection);
                const db = connection.getConnection();
                this.updateConnectionMetrics(startTime);
                (0, errorLogger_1.logInfo)(`Created new database connection ${connectionId}`, undefined, {
                    connectionId,
                    totalConnections: String(this.connections.length)
                });
                return db;
            }
            // Wait for an available connection (simple retry logic)
            return await this.waitForConnection(startTime);
        }
        catch (error) {
            this.connectionErrors++;
            (0, errorLogger_1.logError)('Failed to get database connection', error, undefined, {
                totalConnections: String(this.connections.length),
                connectionErrors: String(this.connectionErrors)
            });
            throw error;
        }
    }
    async waitForConnection(startTime) {
        const maxWaitTime = 5000; // 5 seconds
        const retryInterval = 100; // 100ms
        let attempts = 0;
        const maxAttempts = maxWaitTime / retryInterval;
        while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, retryInterval));
            for (const connection of this.connections) {
                if (!connection.inUse && !connection.isExpired()) {
                    const db = connection.getConnection();
                    this.updateConnectionMetrics(startTime);
                    return db;
                }
            }
            attempts++;
        }
        throw new Error('Database connection timeout: No available connections');
    }
    releaseConnection(db) {
        for (const connection of this.connections) {
            try {
                connection.getConnection(); // This will throw if not the right connection
                connection.releaseConnection();
                return;
            }
            catch {
                // Not the right connection, continue
            }
        }
    }
    updateConnectionMetrics(startTime) {
        const connectionTime = Date.now() - startTime;
        this.totalConnectionTime += connectionTime;
        this.connectionCount++;
        this.lastConnectionTime = new Date();
    }
    async cleanup() {
        const expiredConnections = this.connections.filter(conn => conn.isExpired());
        for (const connection of expiredConnections) {
            connection.close();
            const index = this.connections.indexOf(connection);
            if (index > -1) {
                this.connections.splice(index, 1);
            }
        }
        if (expiredConnections.length > 0) {
            (0, errorLogger_1.logInfo)(`Cleaned up ${expiredConnections.length} expired database connections`, undefined, {
                remainingConnections: String(this.connections.length)
            });
        }
    }
    getMetrics() {
        const activeConnections = this.connections.filter(conn => conn.inUse).length;
        const idleConnections = this.connections.filter(conn => !conn.inUse).length;
        const averageConnectionTime = this.connectionCount > 0 ? this.totalConnectionTime / this.connectionCount : 0;
        return {
            totalConnections: this.connections.length,
            activeConnections,
            idleConnections,
            connectionErrors: this.connectionErrors,
            averageConnectionTime,
            lastConnectionTime: this.lastConnectionTime
        };
    }
    async closeAll() {
        for (const connection of this.connections) {
            connection.close();
        }
        this.connections = [];
        (0, errorLogger_1.logInfo)('All database connections closed', undefined, {
            totalConnections: String(this.connections.length)
        });
    }
    // Health check for the pool
    async healthCheck() {
        const metrics = this.getMetrics();
        const issues = [];
        // Check for connection errors
        if (metrics.connectionErrors > 10) {
            issues.push('High number of connection errors');
        }
        // Check for no available connections
        if (metrics.totalConnections === 0) {
            issues.push('No database connections available');
        }
        // Check for all connections in use
        if (metrics.activeConnections === metrics.totalConnections && metrics.totalConnections > 0) {
            issues.push('All connections are currently in use');
        }
        // Check average connection time
        if (metrics.averageConnectionTime > 1000) {
            issues.push('Slow connection establishment');
        }
        // Check last connection time
        const timeSinceLastConnection = Date.now() - metrics.lastConnectionTime.getTime();
        if (timeSinceLastConnection > 300000) { // 5 minutes
            issues.push('No recent database activity');
        }
        let status = 'healthy';
        if (issues.length === 0) {
            status = 'healthy';
        }
        else if (issues.length <= 2) {
            status = 'degraded';
        }
        else {
            status = 'unhealthy';
        }
        return {
            status,
            details: {
                ...metrics,
                issues
            }
        };
    }
}
exports.DatabasePool = DatabasePool;
// Singleton database pool instance
let databasePool = null;
function getDatabasePool() {
    if (!databasePool) {
        const config = {
            filename: process.env.DATABASE_URL || './database.sqlite',
            maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
            busyTimeout: parseInt(process.env.DB_BUSY_TIMEOUT || '30000'),
            enableForeignKeys: true,
            enableWAL: true,
            journalMode: 'WAL',
            synchronous: 'NORMAL',
            cacheSize: parseInt(process.env.DB_CACHE_SIZE || '10000')
        };
        databasePool = new DatabasePool(config);
        // Set up periodic cleanup
        setInterval(() => {
            databasePool?.cleanup().catch(error => {
                (0, errorLogger_1.logError)('Database pool cleanup failed', error);
            });
        }, 60000); // Every minute
    }
    return databasePool;
}
async function withDatabase(operation, maxRetries = 3) {
    const pool = getDatabasePool();
    let lastError = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        let db = null;
        try {
            db = await pool.getConnection();
            const result = operation(db);
            pool.releaseConnection(db);
            return result;
        }
        catch (error) {
            lastError = error;
            if (db) {
                pool.releaseConnection(db);
            }
            // Don't retry on certain errors
            if (error instanceof Error && (error.message.includes('SQLITE_CONSTRAINT') ||
                error.message.includes('UNIQUE constraint failed') ||
                error.message.includes('NOT NULL constraint failed'))) {
                throw error;
            }
            // Log retry attempt
            if (attempt < maxRetries) {
                (0, errorLogger_1.logWarning)(`Database operation failed, retrying (${attempt}/${maxRetries})`, undefined, {
                    error: error.message,
                    attempt: String(attempt),
                    maxRetries: String(maxRetries)
                });
                // Exponential backoff
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    (0, errorLogger_1.logError)('Database operation failed after all retries', lastError || new Error('Unknown error'), undefined, {
        maxRetries: String(maxRetries),
        finalAttempt: String(maxRetries),
        error: lastError?.message || 'Unknown error'
    });
    throw lastError;
}
// Database health check wrapper
async function checkDatabaseHealth() {
    const pool = getDatabasePool();
    try {
        // Test basic database operation
        await withDatabase(async (db) => {
            db.prepare('SELECT 1').get();
        });
        // Get pool health
        const poolHealth = await pool.healthCheck();
        return {
            status: poolHealth.status,
            details: {
                ...poolHealth.details,
                basicOperation: 'success'
            }
        };
    }
    catch (error) {
        return {
            status: 'unhealthy',
            details: {
                basicOperation: 'failed',
                error: error.message,
                poolMetrics: pool.getMetrics()
            }
        };
    }
}
//# sourceMappingURL=databasePool.js.map