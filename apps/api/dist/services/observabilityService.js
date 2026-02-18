"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservabilityService = void 0;
/**
 * Structured logging service for mood-persona operations
 */
class ObservabilityService {
    constructor(db) {
        this.performanceMetrics = new Map();
        this.slowQueryThreshold = 1000; // 1 second
        this.maxMetricsHistory = 1000;
        this.db = db;
        this.initializeObservabilityTables();
    }
    /**
     * Initialize observability tables for metrics and logs
     */
    async initializeObservabilityTables() {
        // Performance metrics table
        await this.db.exec(`
      CREATE TABLE IF NOT EXISTS performance_metrics (
        id TEXT PRIMARY KEY,
        operation TEXT NOT NULL,
        duration INTEGER NOT NULL,
        success BOOLEAN NOT NULL,
        timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        userId TEXT,
        metadata TEXT, -- JSON
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // Error logs table
        await this.db.exec(`
      CREATE TABLE IF NOT EXISTS error_logs (
        id TEXT PRIMARY KEY,
        operation TEXT NOT NULL,
        error TEXT NOT NULL,
        stackTrace TEXT,
        timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        userId TEXT,
        metadata TEXT, -- JSON
        severity TEXT DEFAULT 'error',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // System health snapshot table
        await this.db.exec(`
      CREATE TABLE IF NOT EXISTS system_health_snapshots (
        id TEXT PRIMARY KEY,
        timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        metrics TEXT NOT NULL, -- JSON with SystemHealthMetrics
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // Create indexes for performance
        await this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_performance_metrics_operation ON performance_metrics(operation);
      CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
      CREATE INDEX IF NOT EXISTS idx_performance_metrics_userId ON performance_metrics(userId);
      CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_error_logs_operation ON error_logs(operation);
      CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
      CREATE INDEX IF NOT EXISTS idx_system_health_timestamp ON system_health_snapshots(timestamp);
    `);
        console.log('✅ Observability tables initialized');
    }
    /**
     * Log performance metrics for an operation
     */
    async logPerformance(operation, duration, success, userId, metadata) {
        const id = `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await this.db.run(`
      INSERT INTO performance_metrics (
        id, operation, duration, success, timestamp, userId, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
            id,
            operation,
            duration,
            success ? 1 : 0,
            new Date().toISOString(),
            userId,
            JSON.stringify(metadata || {})
        ]);
        // Update in-memory metrics for quick access
        if (!this.performanceMetrics.has(operation)) {
            this.performanceMetrics.set(operation, []);
        }
        const metrics = this.performanceMetrics.get(operation);
        metrics.push({
            operation,
            duration,
            success,
            timestamp: new Date(),
            userId,
            metadata
        });
        // Keep only recent metrics in memory
        if (metrics.length > this.maxMetricsHistory) {
            metrics.splice(0, metrics.length - this.maxMetricsHistory);
        }
        // Log slow operations
        if (duration > this.slowQueryThreshold) {
            console.warn(`🐌 Slow operation detected: ${operation} took ${duration}ms`);
        }
    }
    /**
     * Log error with structured information
     */
    async logError(operation, error, userId, metadata, severity = 'error') {
        const id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await this.db.run(`
      INSERT INTO error_logs (
        id, operation, error, stackTrace, timestamp, userId, metadata, severity
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            id,
            operation,
            error.message,
            error.stack,
            new Date().toISOString(),
            userId,
            JSON.stringify(metadata || {}),
            severity
        ]);
        // Log critical errors to console
        if (severity === 'critical') {
            console.error(`🚨 CRITICAL ERROR in ${operation}:`, error.message);
        }
        else {
            console.error(`❌ Error in ${operation}:`, error.message);
        }
    }
    /**
     * Get performance statistics for an operation
     */
    async getPerformanceStats(operation, hours = 24) {
        const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
        const row = await this.db.get(`
      SELECT 
        AVG(duration) as avgDuration,
        MIN(duration) as minDuration,
        MAX(duration) as maxDuration,
        AVG(CASE WHEN success = 1 THEN 1.0 ELSE 0.0 END) as successRate,
        COUNT(*) as totalOperations,
        COUNT(CASE WHEN duration > ? THEN 1 END) as slowOperations
      FROM performance_metrics 
      WHERE operation = ? AND timestamp > ?
    `, [operation, this.slowQueryThreshold, cutoff]);
        return {
            avgDuration: row?.avgDuration || 0,
            minDuration: row?.minDuration || 0,
            maxDuration: row?.maxDuration || 0,
            successRate: row?.successRate || 0,
            totalOperations: row?.totalOperations || 0,
            slowOperations: row?.slowOperations || 0
        };
    }
    /**
     * Get error statistics
     */
    async getErrorStats(hours = 24) {
        const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
        // Total errors by severity
        const totalRow = await this.db.get(`
      SELECT COUNT(*) as total, 
             SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical
      FROM error_logs 
      WHERE timestamp > ?
    `, [cutoff]);
        // Errors by operation
        const operationRows = await this.db.all(`
      SELECT operation, COUNT(*) as count
      FROM error_logs 
      WHERE timestamp > ?
      GROUP BY operation
      ORDER BY count DESC
    `, [cutoff]);
        // Errors by hour
        const hourRows = await this.db.all(`
      SELECT strftime('%H', timestamp) as hour, COUNT(*) as count
      FROM error_logs 
      WHERE timestamp > ?
      GROUP BY strftime('%H', timestamp)
      ORDER BY hour
    `, [cutoff]);
        // Recent errors
        const recentRows = await this.db.all(`
      SELECT timestamp, operation, error, severity
      FROM error_logs 
      WHERE timestamp > ?
      ORDER BY timestamp DESC
      LIMIT 10
    `, [cutoff]);
        const errorStats = {
            totalErrors: totalRow?.total || 0,
            criticalErrors: totalRow?.critical || 0,
            errorsByOperation: operationRows.reduce((acc, row) => {
                acc[row.operation] = row.count;
                return acc;
            }, {}),
            errorsByHour: hourRows.reduce((acc, row) => {
                acc[row.hour] = row.count;
                return acc;
            }, {}),
            recentErrors: recentRows.map(row => ({
                timestamp: new Date(row.timestamp),
                operation: row.operation,
                error: row.error,
                severity: row.severity
            }))
        };
        return errorStats;
    }
    /**
     * Get slow queries analysis
     */
    async getSlowQueries(hours = 24) {
        const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
        const rows = await this.db.all(`
      SELECT 
        operation,
        AVG(duration) as avgDuration,
        MAX(duration) as maxDuration,
        COUNT(*) as count,
        SUM(duration) as totalDuration
      FROM performance_metrics 
      WHERE duration > ? AND timestamp > ?
      GROUP BY operation
      ORDER BY avgDuration DESC
    `, [this.slowQueryThreshold, cutoff]);
        return rows.map(row => ({
            operation: row.operation,
            avgDuration: row.avgDuration,
            maxDuration: row.maxDuration,
            count: row.count,
            totalDuration: row.totalDuration,
            query: `SELECT * FROM ${row.operation} WHERE timestamp > ?`
        }));
    }
    /**
     * Capture system health snapshot
     */
    async captureSystemHealth() {
        const now = new Date();
        // Database health
        const dbStart = Date.now();
        const tableCounts = await this.getTableCounts();
        const dbResponseTime = Date.now() - dbStart;
        // Mood-Persona metrics
        const moodPersonaMetrics = await this.getMoodPersonaMetrics();
        // Performance metrics
        const performanceMetrics = await this.getPerformanceOverview();
        // Error metrics
        const errorMetrics = await this.getErrorStats(24);
        const healthMetrics = {
            database: {
                connected: true,
                responseTime: dbResponseTime,
                tableCounts,
                lastMigration: '003_add_mood_persona_tables'
            },
            moodPersona: {
                totalUsers: moodPersonaMetrics.totalUsers,
                activeUsers24h: moodPersonaMetrics.activeUsers24h,
                moodSelections24h: moodPersonaMetrics.moodSelections24h,
                userActions24h: moodPersonaMetrics.userActions24h,
                recommendationEvents24h: moodPersonaMetrics.recommendationEvents24h,
                avgResponseTime: performanceMetrics.avgResponseTime,
                successRate: performanceMetrics.successRate
            },
            performance: {
                avgMoodSelectionTime: performanceMetrics.avgMoodSelectionTime,
                avgRecommendationTime: performanceMetrics.avgRecommendationTime,
                avgPersonaUpdateTime: performanceMetrics.avgPersonaUpdateTime,
                slowQueries: await this.getSlowQueries()
            },
            errors: {
                last24h: errorMetrics.totalErrors,
                lastHour: (await this.getErrorStats(1)).totalErrors,
                criticalErrors: errorMetrics.recentErrors.filter(e => e.severity === 'critical').map(e => ({
                    timestamp: e.timestamp,
                    operation: e.operation,
                    error: e.error,
                    userId: undefined
                }))
            }
        };
        // Store snapshot
        const id = `health_${now.getTime()}_${Math.random().toString(36).substr(2, 9)}`;
        await this.db.run(`
      INSERT INTO system_health_snapshots (id, timestamp, metrics)
      VALUES (?, ?, ?)
    `, [id, now.toISOString(), JSON.stringify(healthMetrics)]);
        return healthMetrics;
    }
    /**
     * Get table counts for database health
     */
    async getTableCounts() {
        const tables = [
            'users', 'user_integrations', 'games', 'user_games', 'sessions',
            'game_sessions', 'passwords', 'personas',
            'mood_selections', 'persona_profile', 'user_actions',
            'recommendation_events', 'mood_predictions', 'mood_patterns', 'learning_metrics',
            'performance_metrics', 'error_logs', 'system_health_snapshots'
        ];
        const counts = {};
        for (const table of tables) {
            try {
                const row = await this.db.get(`SELECT COUNT(*) as count FROM ${table}`);
                counts[table] = row?.count || 0;
            }
            catch (error) {
                console.warn(`Could not get count for table ${table}:`, error);
                counts[table] = 0;
            }
        }
        return counts;
    }
    /**
     * Get mood-persona specific metrics
     */
    async getMoodPersonaMetrics() {
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const [users, moodSelections, userActions, recommendationEvents] = await Promise.all([
            this.db.get('SELECT COUNT(*) as count FROM users'),
            this.db.get('SELECT COUNT(*) as count FROM mood_selections WHERE timestamp > ?', [cutoff]),
            this.db.get('SELECT COUNT(*) as count FROM user_actions WHERE timestamp > ?', [cutoff]),
            this.db.get('SELECT COUNT(*) as count FROM recommendation_events WHERE timestamp > ?', [cutoff])
        ]);
        // Active users = users with mood selections in last 24h
        const activeUsers = await this.db.get(`
      SELECT COUNT(DISTINCT userId) as count 
      FROM mood_selections 
      WHERE timestamp > ?
    `, [cutoff]);
        return {
            totalUsers: users?.count || 0,
            activeUsers24h: activeUsers?.count || 0,
            moodSelections24h: moodSelections?.count || 0,
            userActions24h: userActions?.count || 0,
            recommendationEvents24h: recommendationEvents?.count || 0
        };
    }
    /**
     * Get performance overview
     */
    async getPerformanceOverview() {
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const [moodSelectionStats, recommendationStats, personaUpdateStats] = await Promise.all([
            this.getPerformanceStats('mood_selection'),
            this.getPerformanceStats('recommendation_generate'),
            this.getPerformanceStats('persona_update')
        ]);
        const allStats = [
            moodSelectionStats,
            recommendationStats,
            personaUpdateStats
        ].filter(stat => stat.totalOperations > 0);
        const avgResponseTime = allStats.length > 0
            ? allStats.reduce((sum, stat) => sum + stat.avgDuration, 0) / allStats.length
            : 0;
        const successRate = allStats.length > 0
            ? allStats.reduce((sum, stat) => sum + stat.successRate, 0) / allStats.length
            : 0;
        return {
            avgResponseTime,
            successRate,
            avgMoodSelectionTime: moodSelectionStats.avgDuration,
            avgRecommendationTime: recommendationStats.avgDuration,
            avgPersonaUpdateTime: personaUpdateStats.avgDuration
        };
    }
    /**
     * Clean up old metrics and logs
     */
    async cleanupOldData(daysToKeep = 30) {
        const cutoff = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000).toISOString();
        const [metricsDeleted, logsDeleted, healthDeleted] = await Promise.all([
            this.db.run('DELETE FROM performance_metrics WHERE timestamp < ?', [cutoff]),
            this.db.run('DELETE FROM error_logs WHERE timestamp < ?', [cutoff]),
            this.db.run('DELETE FROM system_health_snapshots WHERE timestamp < ?', [cutoff])
        ]);
        console.log(`🧹 Cleaned up old data: ${metricsDeleted} metrics, ${logsDeleted} logs, ${healthDeleted} health snapshots`);
    }
    /**
     * Get recent system health snapshots
     */
    async getRecentHealthSnapshots(hours = 24) {
        const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
        const rows = await this.db.all(`
      SELECT timestamp, metrics
      FROM system_health_snapshots
      WHERE timestamp > ?
      ORDER BY timestamp DESC
      LIMIT 100
    `, [cutoff]);
        return rows.map(row => ({
            timestamp: new Date(row.timestamp),
            metrics: JSON.parse(row.metrics)
        }));
    }
}
exports.ObservabilityService = ObservabilityService;
//# sourceMappingURL=observabilityService.js.map