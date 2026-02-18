import type { Database as SQLiteDatabase } from 'better-sqlite3';
export interface DatabaseConfig {
    filename: string;
    maxConnections?: number;
    busyTimeout?: number;
    enableForeignKeys?: boolean;
    enableWAL?: boolean;
    journalMode?: 'DELETE' | 'TRUNCATE' | 'PERSIST' | 'MEMORY' | 'WAL' | 'OFF';
    synchronous?: 'OFF' | 'NORMAL' | 'FULL' | 'EXTRA';
    cacheSize?: number;
}
export interface ConnectionMetrics {
    totalConnections: number;
    activeConnections: number;
    idleConnections: number;
    connectionErrors: number;
    averageConnectionTime: number;
    lastConnectionTime: Date;
}
export declare class DatabasePool {
    private connections;
    private config;
    private maxConnections;
    private connectionErrors;
    private totalConnectionTime;
    private connectionCount;
    private lastConnectionTime;
    constructor(config: DatabaseConfig);
    getConnection(): Promise<SQLiteDatabase>;
    private waitForConnection;
    releaseConnection(db: SQLiteDatabase): void;
    private updateConnectionMetrics;
    cleanup(): Promise<void>;
    getMetrics(): ConnectionMetrics;
    closeAll(): Promise<void>;
    healthCheck(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        details: {
            totalConnections: number;
            activeConnections: number;
            idleConnections: number;
            connectionErrors: number;
            averageConnectionTime: number;
            lastConnectionTime: Date;
            issues: string[];
        };
    }>;
}
export declare function getDatabasePool(): DatabasePool;
export declare function withDatabase<T>(operation: (db: SQLiteDatabase) => T, maxRetries?: number): Promise<T>;
export declare function checkDatabaseHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: any;
}>;
//# sourceMappingURL=databasePool.d.ts.map