import { logError, logWarning, logInfo } from '../logging/errorLogger'

// Database retry configuration
export interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  retryableErrors: string[]
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
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
}

/**
 * Execute a database operation with retry logic for transient failures
 */
export async function withDatabaseRetry<T>(
  operation: () => T,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config }
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      const result = operation()
      return result
    } catch (error) {
      lastError = error as Error
      
      // Check if error is retryable
      const isRetryable = retryConfig.retryableErrors.some(pattern => 
        lastError!.message.toLowerCase().includes(pattern.toLowerCase())
      )
      
      if (!isRetryable || attempt === retryConfig.maxRetries) {
        // Don't retry or this is the last attempt
        break
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        retryConfig.baseDelay * Math.pow(2, attempt - 1),
        retryConfig.maxDelay
      )
      
      logWarning(`Database operation failed, retrying (${attempt}/${retryConfig.maxRetries})`, undefined, {
        error: lastError.message,
        attempt: attempt.toString(),
        maxRetries: retryConfig.maxRetries.toString(),
        delay: delay.toString(),
        retryable: 'true'
      })
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  logError('Database operation failed after all retries', lastError!, undefined, {
    maxRetries: retryConfig.maxRetries.toString(),
    finalAttempt: retryConfig.maxRetries.toString(),
    error: lastError!.message
  })
  
  throw lastError!
}

/**
 * Enhanced database health check with read/write tests
 */
export async function performDatabaseHealthCheck(db: any): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  details: {
    connected: boolean
    readTest: 'success' | 'failed'
    writeTest: 'success' | 'failed'
    migrationStatus: 'up_to_date' | 'outdated' | 'unknown'
    error?: string
    issues: string[]
  }
}> {
  const issues: string[] = []
  let readTest: 'success' | 'failed' = 'failed'
  let writeTest: 'success' | 'failed' = 'failed'
  let migrationStatus: 'up_to_date' | 'outdated' | 'unknown' = 'unknown'
  let error: string | undefined

  try {
    // Test basic connectivity
    if (!db) {
      issues.push('Database connection is null')
      return {
        status: 'unhealthy',
        details: {
          connected: false,
          readTest,
          writeTest,
          migrationStatus,
          issues
        }
      }
    }

    // Test read operation
    try {
      const result = db.prepare('SELECT 1 as test').get()
      if (result && result.test === 1) {
        readTest = 'success'
      } else {
        issues.push('Read test returned unexpected result')
      }
    } catch (readError) {
      issues.push(`Read test failed: ${(readError as Error).message}`)
      error = (readError as Error).message
    }

    // Test write operation (using a temporary table)
    try {
      // Create temporary table for testing
      db.prepare('CREATE TEMP TABLE IF NOT EXISTS health_test (id INTEGER PRIMARY KEY, test_value TEXT)').run()
      
      // Insert test data
      db.prepare('INSERT INTO health_test (test_value) VALUES (?)').run('health_check_test')
      
      // Read back test data
      const testResult = db.prepare('SELECT test_value FROM health_test WHERE test_value = ?').get('health_check_test')
      
      // Clean up
      db.prepare('DELETE FROM health_test WHERE test_value = ?').run('health_check_test')
      
      if (testResult && testResult.test_value === 'health_check_test') {
        writeTest = 'success'
      } else {
        issues.push('Write test verification failed')
      }
    } catch (writeError) {
      issues.push(`Write test failed: ${(writeError as Error).message}`)
      if (!error) error = (writeError as Error).message
    }

    // Check migration status
    try {
      const migrationResult = db.prepare('SELECT COUNT(*) as count FROM migrations').get()
      if (migrationResult && typeof migrationResult.count === 'number') {
        migrationStatus = 'up_to_date'
      } else {
        issues.push('Migration status check failed')
      }
    } catch (migrationError) {
      issues.push(`Migration check failed: ${(migrationError as Error).message}`)
      migrationStatus = 'unknown'
      if (!error) error = (migrationError as Error).message
    }

  } catch (healthError) {
    issues.push(`Health check failed: ${(healthError as Error).message}`)
    error = (healthError as Error).message
  }

  // Determine overall status
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
  
  if (issues.length === 0) {
    status = 'healthy'
  } else if (issues.length <= 2 && readTest === 'success') {
    status = 'degraded'
  } else {
    status = 'unhealthy'
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
  }
}

/**
 * Safe database operation wrapper with error handling
 */
export function safeDatabaseOperation<T>(
  operation: () => T,
  operationName: string,
  context?: Record<string, any>
): Promise<T> {
  return new Promise((resolve, reject) => {
    try {
      const result = operation()
      resolve(result)
    } catch (error) {
      const errorDetails: Record<string, string> = {
        operation: operationName,
        error: (error as Error).message
      }
      
      // Add context as stringified values
      if (context) {
        Object.keys(context).forEach(key => {
          const value = context[key]
          errorDetails[`context_${key}`] = typeof value === 'object' ? JSON.stringify(value) : String(value)
        })
      }
      
      logError(`Database operation failed: ${operationName}`, error as Error, undefined, errorDetails)
      reject(error)
    }
  })
}

/**
 * Batch database operations with transaction support
 */
export async function withTransaction<T>(
  db: any,
  operations: () => T,
  operationName: string = 'transaction'
): Promise<T> {
  return withDatabaseRetry(() => {
    const transaction = db.transaction(() => {
      return operations()
    })
    return transaction()
  }, {
    maxRetries: 5,
    retryableErrors: [
      'SQLITE_BUSY',
      'SQLITE_LOCKED',
      'database is locked',
      'database table is locked'
    ]
  })
}

/**
 * Database connection validator
 */
export function validateDatabaseConnection(db: any): {
  isValid: boolean
  error?: string
} {
  if (!db) {
    return { isValid: false, error: 'Database connection is null' }
  }

  try {
    // Test basic operation
    db.prepare('SELECT 1').get()
    return { isValid: true }
  } catch (error) {
    return { 
      isValid: false, 
      error: (error as Error).message 
    }
  }
}
