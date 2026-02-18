export interface RetryConfig {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    retryableErrors: string[];
}
/**
 * Execute a database operation with retry logic for transient failures
 */
export declare function withDatabaseRetry<T>(operation: () => T, config?: Partial<RetryConfig>): Promise<T>;
/**
 * Enhanced database health check with read/write tests
 */
export declare function performDatabaseHealthCheck(db: any): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: {
        connected: boolean;
        readTest: 'success' | 'failed';
        writeTest: 'success' | 'failed';
        migrationStatus: 'up_to_date' | 'outdated' | 'unknown';
        error?: string;
        issues: string[];
    };
}>;
/**
 * Safe database operation wrapper with error handling
 */
export declare function safeDatabaseOperation<T>(operation: () => T, operationName: string, context?: Record<string, any>): Promise<T>;
/**
 * Batch database operations with transaction support
 */
export declare function withTransaction<T>(db: any, operations: () => T, operationName?: string): Promise<T>;
/**
 * Database connection validator
 */
export declare function validateDatabaseConnection(db: any): {
    isValid: boolean;
    error?: string;
};
//# sourceMappingURL=databaseRetry.d.ts.map