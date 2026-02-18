"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withDatabaseRetry = withDatabaseRetry;
exports.performDatabaseHealthCheck = performDatabaseHealthCheck;
exports.safeDatabaseOperation = safeDatabaseOperation;
exports.withTransaction = withTransaction;
exports.validateDatabaseConnection = validateDatabaseConnection;
const errorLogger_1 = require("../logging/errorLogger");
const DEFAULT_RETRY_CONFIG = {
    maxRetries: 3,
    baseDelay: 100,
    maxDelay: 5000,
    retryableErrors: [
        'SQLITE_BUSY',
        'SQLITE_LOCKED',
        'database is locked',
        'database table is locked',
        'disk I/O error',
        'attempt to write a readonly database'
    ]
};
/**
 * Execute a database operation with retry logic for transient failures
 */
async function withDatabaseRetry(operation, config = {}) {
    const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
    let lastError = null;
    for (let attempt = 1; attempt <= retryConfig.maxRetries; attempt++) {
        try {
            const result = operation();
            return result;
        }
        catch (error) {
            lastError = error;
            // Check if error is retryable
            const isRetryable = retryConfig.retryableErrors.some(pattern => lastError.message.toLowerCase().includes(pattern.toLowerCase()));
            if (!isRetryable || attempt === retryConfig.maxRetries) {
                // Don't retry or this is the last attempt
                break;
            }
            // Calculate delay with exponential backoff
            const delay = Math.min(retryConfig.baseDelay * Math.pow(2, attempt - 1), retryConfig.maxDelay);
            (0, errorLogger_1.logWarning)(`Database operation failed, retrying (${attempt}/${retryConfig.maxRetries})`, undefined, {
                error: lastError.message,
                attempt: attempt.toString(),
                maxRetries: retryConfig.maxRetries.toString(),
                delay: delay.toString(),
                retryable: 'true'
            });
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    (0, errorLogger_1.logError)('Database operation failed after all retries', lastError, undefined, {
        maxRetries: retryConfig.maxRetries.toString(),
        finalAttempt: retryConfig.maxRetries.toString(),
        error: lastError.message
    });
    throw lastError;
}
/**
 * Enhanced database health check with read/write tests
 */
async function performDatabaseHealthCheck(db) {
    const issues = [];
    let readTest = 'failed';
    let writeTest = 'failed';
    let migrationStatus = 'unknown';
    let error;
    try {
        // Test basic connectivity
        if (!db) {
            issues.push('Database connection is null');
            return {
                status: 'unhealthy',
                details: {
                    connected: false,
                    readTest,
                    writeTest,
                    migrationStatus,
                    issues
                }
            };
        }
        // Test read operation
        try {
            const result = db.prepare('SELECT 1 as test').get();
            if (result && result.test === 1) {
                readTest = 'success';
            }
            else {
                issues.push('Read test returned unexpected result');
            }
        }
        catch (readError) {
            issues.push(`Read test failed: ${readError.message}`);
            error = readError.message;
        }
        // Test write operation (using a temporary table)
        try {
            // Create temporary table for testing
            db.prepare('CREATE TEMP TABLE IF NOT EXISTS health_test (id INTEGER PRIMARY KEY, test_value TEXT)').run();
            // Insert test data
            db.prepare('INSERT INTO health_test (test_value) VALUES (?)').run('health_check_test');
            // Read back test data
            const testResult = db.prepare('SELECT test_value FROM health_test WHERE test_value = ?').get('health_check_test');
            // Clean up
            db.prepare('DELETE FROM health_test WHERE test_value = ?').run('health_check_test');
            if (testResult && testResult.test_value === 'health_check_test') {
                writeTest = 'success';
            }
            else {
                issues.push('Write test verification failed');
            }
        }
        catch (writeError) {
            issues.push(`Write test failed: ${writeError.message}`);
            if (!error)
                error = writeError.message;
        }
        // Check migration status
        try {
            const migrationResult = db.prepare('SELECT COUNT(*) as count FROM migrations').get();
            if (migrationResult && typeof migrationResult.count === 'number') {
                migrationStatus = 'up_to_date';
            }
            else {
                issues.push('Migration status check failed');
            }
        }
        catch (migrationError) {
            issues.push(`Migration check failed: ${migrationError.message}`);
            migrationStatus = 'unknown';
            if (!error)
                error = migrationError.message;
        }
    }
    catch (healthError) {
        issues.push(`Health check failed: ${healthError.message}`);
        error = healthError.message;
    }
    // Determine overall status
    let status = 'healthy';
    if (issues.length === 0) {
        status = 'healthy';
    }
    else if (issues.length <= 2 && readTest === 'success') {
        status = 'degraded';
    }
    else {
        status = 'unhealthy';
    }
    return {
        status,
        details: {
            connected: !!db,
            readTest,
            writeTest,
            migrationStatus,
            error,
            issues
        }
    };
}
/**
 * Safe database operation wrapper with error handling
 */
function safeDatabaseOperation(operation, operationName, context) {
    return new Promise((resolve, reject) => {
        try {
            const result = operation();
            resolve(result);
        }
        catch (error) {
            const errorDetails = {
                operation: operationName,
                error: error.message
            };
            // Add context as stringified values
            if (context) {
                Object.keys(context).forEach(key => {
                    const value = context[key];
                    errorDetails[`context_${key}`] = typeof value === 'object' ? JSON.stringify(value) : String(value);
                });
            }
            (0, errorLogger_1.logError)(`Database operation failed: ${operationName}`, error, undefined, errorDetails);
            reject(error);
        }
    });
}
/**
 * Batch database operations with transaction support
 */
async function withTransaction(db, operations, operationName = 'transaction') {
    return withDatabaseRetry(() => {
        const transaction = db.transaction(() => {
            return operations();
        });
        return transaction();
    }, {
        maxRetries: 5,
        retryableErrors: [
            'SQLITE_BUSY',
            'SQLITE_LOCKED',
            'database is locked',
            'database table is locked'
        ]
    });
}
/**
 * Database connection validator
 */
function validateDatabaseConnection(db) {
    if (!db) {
        return { isValid: false, error: 'Database connection is null' };
    }
    try {
        // Test basic operation
        db.prepare('SELECT 1').get();
        return { isValid: true };
    }
    catch (error) {
        return {
            isValid: false,
            error: error.message
        };
    }
}
//# sourceMappingURL=databaseRetry.js.map