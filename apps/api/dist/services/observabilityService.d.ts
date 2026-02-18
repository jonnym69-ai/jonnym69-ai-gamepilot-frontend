import { Database } from 'sqlite';
/**
 * Performance metrics for mood-persona operations
 */
export interface PerformanceMetrics {
    operation: string;
    duration: number;
    success: boolean;
    timestamp: Date;
    userId?: string;
    metadata?: Record<string, any>;
}
/**
 * System health metrics
 */
export interface SystemHealthMetrics {
    database: {
        connected: boolean;
        responseTime: number;
        tableCounts: Record<string, number>;
        lastMigration: string;
    };
    moodPersona: {
        totalUsers: number;
        activeUsers24h: number;
        moodSelections24h: number;
        userActions24h: number;
        recommendationEvents24h: number;
        avgResponseTime: number;
        successRate: number;
    };
    performance: {
        avgMoodSelectionTime: number;
        avgRecommendationTime: number;
        avgPersonaUpdateTime: number;
        slowQueries: Array<{
            query: string;
            avgDuration: number;
            count: number;
        }>;
    };
    errors: {
        last24h: number;
        lastHour: number;
        criticalErrors: Array<{
            timestamp: Date;
            operation: string;
            error: string;
            userId?: string;
        }>;
    };
}
/**
 * Structured logging service for mood-persona operations
 */
export declare class ObservabilityService {
    private db;
    private performanceMetrics;
    private slowQueryThreshold;
    private maxMetricsHistory;
    constructor(db: Database);
    /**
     * Initialize observability tables for metrics and logs
     */
    private initializeObservabilityTables;
    /**
     * Log performance metrics for an operation
     */
    logPerformance(operation: string, duration: number, success: boolean, userId?: string, metadata?: Record<string, any>): Promise<void>;
    /**
     * Log error with structured information
     */
    logError(operation: string, error: Error, userId?: string, metadata?: Record<string, any>, severity?: 'error' | 'warning' | 'critical'): Promise<void>;
    /**
     * Get performance statistics for an operation
     */
    getPerformanceStats(operation: string, hours?: number): Promise<{
        avgDuration: number;
        minDuration: number;
        maxDuration: number;
        successRate: number;
        totalOperations: number;
        slowOperations: number;
    }>;
    /**
     * Get error statistics
     */
    getErrorStats(hours?: number): Promise<{
        totalErrors: number;
        criticalErrors: number;
        errorsByOperation: Record<string, number>;
        errorsByHour: Record<string, number>;
        recentErrors: Array<{
            timestamp: Date;
            operation: string;
            error: string;
            severity: string;
        }>;
    }>;
    /**
     * Get slow queries analysis
     */
    getSlowQueries(hours?: number): Promise<Array<{
        operation: string;
        avgDuration: number;
        maxDuration: number;
        count: number;
        totalDuration: number;
        query: string;
    }>>;
    /**
     * Capture system health snapshot
     */
    captureSystemHealth(): Promise<SystemHealthMetrics>;
    /**
     * Get table counts for database health
     */
    private getTableCounts;
    /**
     * Get mood-persona specific metrics
     */
    private getMoodPersonaMetrics;
    /**
     * Get performance overview
     */
    private getPerformanceOverview;
    /**
     * Clean up old metrics and logs
     */
    cleanupOldData(daysToKeep?: number): Promise<void>;
    /**
     * Get recent system health snapshots
     */
    getRecentHealthSnapshots(hours?: number): Promise<Array<{
        timestamp: Date;
        metrics: SystemHealthMetrics;
    }>>;
}
//# sourceMappingURL=observabilityService.d.ts.map