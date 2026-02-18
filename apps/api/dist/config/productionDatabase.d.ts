import { Database as SQLiteDatabase } from 'sqlite';
export declare const productionDbConfig: {
    filename: string;
    poolSize: number;
    timeout: number;
    driver: {
        filename: string;
        mode: "writable";
        foreignKeys: boolean;
        journalMode: "WAL";
        synchronous: "NORMAL";
        cacheSize: number;
        tempStore: "memory";
    };
    options: {
        cachedStatements: boolean;
        maxCachedStatements: number;
        debug: boolean;
        timeout: number;
        retry: {
            attempts: number;
            delay: number;
            backoff: number;
        };
    };
};
export declare function createProductionDatabase(): Promise<SQLiteDatabase>;
export declare function checkDatabaseHealth(db: SQLiteDatabase): Promise<{
    status: string;
    details: {
        totalTables: any;
        essentialTables: number;
        missingTables: string[];
        databaseSize: number;
        lastModified: string;
    };
    error?: undefined;
} | {
    status: string;
    error: string;
    details?: undefined;
}>;
export declare function backupDatabase(db: SQLiteDatabase, backupPath: string): Promise<{
    success: boolean;
    path: string;
    error?: undefined;
} | {
    success: boolean;
    error: string;
    path?: undefined;
}>;
export declare function runProductionMigrations(db: SQLiteDatabase): Promise<void>;
declare class ProductionConnectionPool {
    private connections;
    private maxConnections;
    private currentConnections;
    constructor(maxConnections?: number);
    getConnection(): Promise<SQLiteDatabase>;
    releaseConnection(connection: SQLiteDatabase): void;
    closeAll(): Promise<void>;
}
export declare const productionConnectionPool: ProductionConnectionPool;
export {};
//# sourceMappingURL=productionDatabase.d.ts.map