// Sentry Error Tracking Configuration
import * as Sentry from '@sentry/node'
import { Integrations } from '@sentry/tracing'
import { CaptureContext, Scope } from '@sentry/types'

// Sentry Configuration for GamePilot Production
export const sentryConfig = {
  dsn: process.env.SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  release: process.env.GAMEPILOT_VERSION || '1.0.0',
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
  profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1'),
  debug: process.env.NODE_ENV === 'development',
  integrations: [
    new Integrations.Http({ tracing: true }),
    new Integrations.Express({ app: undefined }),
    new Integrations.Mongo(),
    new Integrations.Postgres(),
    new Integrations.Redis(),
    new Integrations.Dedupe(),
    new Integrations.InboundFilters(),
    new Integrations.FunctionToString(),
    new Integrations.LinkedErrors(),
    new Integrations.RequestData(),
    new Integrations.Modules(),
    new Integrations.OnUnhandledRejection({ mode: 'warn' }),
    new Integrations.LocalVariables(),
    new Integrations.Console(),
  ],
  beforeSend: (event: Sentry.Event) => {
    // Filter out sensitive information
    if (event.request) {
      // Remove headers that might contain sensitive data
      if (event.request.headers) {
        delete event.request.headers.authorization
        delete event.request.headers.cookie
        delete event.request.headers['x-api-key']
      }
      
      // Remove query parameters that might contain sensitive data
      if (event.request.query_string) {
        const queryString = event.request.query_string as string
        const url = new URL(`http://localhost${queryString}`)
        // Remove sensitive query params
        ['password', 'token', 'key', 'secret', 'auth'].forEach(param => {
          url.searchParams.delete(param)
        })
        event.request.query_string = url.search
      }
    }
    
    // Filter out PII from user data
    if (event.user) {
      delete event.user.email
      delete event.user.ip_address
    }
    
    return event
  },
  ignoreErrors: [
    // Ignore common non-critical errors
    'ResizeObserver loop limit exceeded',
    'Network request failed',
    'AbortError',
    'ChunkLoadError',
    'Loading chunk',
    'Non-Error promise rejection captured',
  ],
  denyUrls: [
    // Ignore errors from third-party scripts
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
    /^moz-extension:\/\//i,
    /^safari-extension:\/\//i,
    /^webapp:\/\//i,
    /cdn\.segment\.com/i,
    /analytics\.google\.com/i,
    /googletagmanager\.com/i,
    /googletagservices\.com/i,
    /google-analytics\.com/i,
    /connect\.facebook\.net/i,
    /platform\.twitter\.com/i,
    /api\.instagram\.com/i,
    /cdn\.jsdelivr\.net/i,
    /cdnjs\.cloudflare\.com/i,
  ]
}

// Initialize Sentry if DSN is provided
if (process.env.SENTRY_DSN && process.env.NODE_ENV === 'production') {
  Sentry.init(sentryConfig)
}

// Custom Sentry error tracking utilities
export class SentryMonitor {
  // Track custom errors
  static trackError(error: Error, context?: CaptureContext): void {
    Sentry.captureException(error, context)
  }

  // Track custom messages
  static trackMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: CaptureContext): void {
    Sentry.captureMessage(message, level, context)
  }

  // Track user context
  static setUser(user: Sentry.User): void {
    Sentry.setUser(user)
  }

  // Clear user context
  static clearUser(): void {
    Sentry.setUser(null)
  }

  // Track tags
  static setTags(tags: Record<string, string>): void {
    Sentry.setTags(tags)
  }

  // Track extra context
  static setExtras(extras: Record<string, any>): void {
    Sentry.setExtras(extras)
  }

  // Track breadcrumbs
  static addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
    Sentry.addBreadcrumb(breadcrumb)
  }

  // Track custom transaction
  static startTransaction(name: string, op: string): Sentry.Transaction {
    return Sentry.startTransaction({
      name,
      op,
      tags: {
        environment: process.env.NODE_ENV || 'development',
        version: process.env.GAMEPILOT_VERSION || '1.0.0'
      }
    })
  }

  // Track API errors
  static trackAPIError(error: Error, endpoint: string, method: string, statusCode?: number, userId?: string): void {
    const context: CaptureContext = {
      tags: {
        endpoint,
        method,
        statusCode: statusCode?.toString() || 'unknown',
        userId: userId || 'anonymous'
      },
      extra: {
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
      }
    }
    
    Sentry.captureException(error, context)
  }

  // Track database errors
  static trackDatabaseError(error: Error, query: string, database: string, userId?: string): void {
    const context: CaptureContext = {
      tags: {
        database,
        query: query.substring(0, 100), // Limit query length
        userId: userId || 'anonymous'
      },
      extra: {
        timestamp: new Date().toISOString(),
        queryLength: query.length
      }
    }
    
    Sentry.captureException(error, context)
  }

  // Track integration errors
  static trackIntegrationError(error: Error, platform: string, operation: string, userId?: string): void {
    const context: CaptureContext = {
      tags: {
        platform,
        operation,
        userId: userId || 'anonymous'
      },
      extra: {
        timestamp: new Date().toISOString(),
        errorType: error.constructor.name
      }
    }
    
    Sentry.captureException(error, context)
  }

  // Track authentication errors
  static trackAuthError(error: Error, authMethod: string, userId?: string): void {
    const context: CaptureContext = {
      tags: {
        authMethod,
        userId: userId || 'anonymous',
        errorType: error.constructor.name
      },
      extra: {
        timestamp: new Date().toISOString(),
        sensitive: true
      }
    }
    
    Sentry.captureException(error, context)
  }

  // Track validation errors
  static trackValidationError(error: Error, field: string, value: any, userId?: string): void {
    const context: CaptureContext = {
      tags: {
        field,
        userId: userId || 'anonymous',
        errorType: 'ValidationError'
      },
      extra: {
        timestamp: new Date().toISOString(),
        valueType: typeof value,
        valueLength: typeof value === 'string' ? value.length : undefined
      }
    }
    
    Sentry.captureException(error, context)
  }

  // Track performance issues
  static trackPerformanceIssue(operation: string, duration: number, threshold: number, userId?: string): void {
    const context: CaptureContext = {
      tags: {
        operation,
        userId: userId || 'anonymous',
        performanceIssue: 'true'
      },
      extra: {
        timestamp: new Date().toISOString(),
        duration,
        threshold,
        exceededBy: duration - threshold
      }
    }
    
    Sentry.captureMessage(
      `Performance issue: ${operation} took ${duration}ms (threshold: ${threshold}ms)`,
      'warning',
      context
    )
  }

  // Track memory issues
  static trackMemoryIssue(heapUsed: number, heapTotal: number, threshold: number, userId?: string): void {
    const usagePercent = (heapUsed / heapTotal) * 100
    
    const context: CaptureContext = {
      tags: {
        userId: userId || 'anonymous',
        memoryIssue: 'true'
      },
      extra: {
        timestamp: new Date().toISOString(),
        heapUsed,
        heapTotal,
        usagePercent,
        threshold,
        exceededBy: usagePercent - threshold
      }
    }
    
    Sentry.captureMessage(
      `Memory issue: ${usagePercent.toFixed(2)}% used (threshold: ${threshold}%)`,
      'warning',
      context
    )
  }

  // Track security issues
  static trackSecurityIssue(issue: string, details: Record<string, any>, userId?: string): void {
    const context: CaptureContext = {
      tags: {
        securityIssue: 'true',
        userId: userId || 'anonymous'
      },
      extra: {
        timestamp: new Date().toISOString(),
        ...details
      }
    }
    
    Sentry.captureMessage(
      `Security issue: ${issue}`,
      'error',
      context
    )
  }

  // Track business logic errors
  static trackBusinessError(error: Error, operation: string, context?: Record<string, any>, userId?: string): void {
    const captureContext: CaptureContext = {
      tags: {
        operation,
        userId: userId || 'anonymous',
        businessError: 'true'
      },
      extra: {
        timestamp: new Date().toISOString(),
        ...context
      }
    }
    
    Sentry.captureException(error, captureContext)
  }

  // Track user feedback
  static trackUserFeedback(feedback: string, rating: number, userId?: string): void {
    const context: CaptureContext = {
      tags: {
        userId: userId || 'anonymous',
        userFeedback: 'true',
        rating: rating.toString()
      },
      extra: {
        timestamp: new Date().toISOString(),
        feedbackLength: feedback.length
      }
    }
    
    Sentry.captureMessage(
      `User feedback: ${rating}/5 - ${feedback.substring(0, 100)}...`,
      'info',
      context
    )
  }

  // Track feature usage
  static trackFeatureUsage(feature: string, action: string, userId?: string): void {
    const context: CaptureContext = {
      tags: {
        feature,
        action,
        userId: userId || 'anonymous',
        featureUsage: 'true'
      },
      extra: {
        timestamp: new Date().toISOString()
      }
    }
    
    Sentry.captureMessage(
      `Feature usage: ${feature} - ${action}`,
      'info',
      context
    )
  }

  // Track A/B test events
  static trackABTest(testName: string, variation: string, userId?: string): void {
    const context: CaptureContext = {
      tags: {
        testName,
        variation,
        userId: userId || 'anonymous',
        abTest: 'true'
      },
      extra: {
        timestamp: new Date().toISOString()
      }
    }
    
    Sentry.captureMessage(
      `A/B test: ${testName} - ${variation}`,
      'info',
      context
    )
  }

  // Track search errors
  static trackSearchError(error: Error, query: string, results?: number, userId?: string): void {
    const context: CaptureContext = {
      tags: {
        query: query.substring(0, 50),
        results: results?.toString() || '0',
        userId: userId || 'anonymous',
        searchError: 'true'
      },
      extra: {
        timestamp: new Date().toISOString(),
        queryLength: query.length
      }
    }
    
    Sentry.captureException(error, context)
  }

  // Track file upload errors
  static trackFileUploadError(error: Error, fileName: string, fileSize: number, userId?: string): void {
    const context: CaptureContext = {
      tags: {
        fileName,
        fileSize: fileSize.toString(),
        userId: userId || 'anonymous',
        fileUploadError: 'true'
      },
      extra: {
        timestamp: new Date().toISOString(),
        fileType: fileName.split('.').pop()
      }
    }
    
    Sentry.captureException(error, context)
  }

  // Track WebSocket errors
  static trackWebSocketError(error: Error, event: string, userId?: string): void {
    const context: CaptureContext = {
      tags: {
        event,
        userId: userId || 'anonymous',
        webSocketError: 'true'
      },
      extra: {
        timestamp: new Date().toISOString(),
        errorType: error.constructor.name
      }
    }
    
    Sentry.captureException(error, context)
  }

  // Track cache errors
  static trackCacheError(error: Error, cacheKey: string, operation: string, userId?: string): void {
    const context: CaptureContext = {
      tags: {
        cacheKey: cacheKey.substring(0, 50),
        operation,
        userId: userId || 'anonymous',
        cacheError: 'true'
      },
      extra: {
        timestamp: new Date().toISOString(),
        keyLength: cacheKey.length
      }
    }
    
    Sentry.captureException(error, context)
  }

  // Track rate limiting errors
  static trackRateLimitError(error: Error, endpoint: string, limit: number, userId?: string): void {
    const context: CaptureContext = {
      tags: {
        endpoint,
        limit: limit.toString(),
        userId: userId || 'anonymous',
        rateLimitError: 'true'
      },
      extra: {
        timestamp: new Date().toISOString(),
        errorType: error.constructor.name
      }
    }
    
    Sentry.captureException(error, context)
  }

  // Track third-party service errors
  static trackThirdPartyError(error: Error, service: string, operation: string, userId?: string): void {
    const context: CaptureContext = {
      tags: {
        service,
        operation,
        userId: userId || 'anonymous',
        thirdPartyError: 'true'
      },
      extra: {
        timestamp: new Date().toISOString(),
        errorType: error.constructor.name
      }
    }
    
    Sentry.captureException(error, context)
  }

  // Track configuration errors
  static trackConfigError(error: Error, configKey: string, environment: string): void {
    const context: CaptureContext = {
      tags: {
        configKey,
        environment,
        configError: 'true'
      },
      extra: {
        timestamp: new Date().toISOString(),
        errorType: error.constructor.name
      }
    }
    
    Sentry.captureException(error, context)
  }

  // Track deployment errors
  static trackDeploymentError(error: Error, version: string, environment: string): void {
    const context: CaptureContext = {
      tags: {
        version,
        environment,
        deploymentError: 'true'
      },
      extra: {
        timestamp: new Date().toISOString(),
        errorType: error.constructor.name
      }
    }
    
    Sentry.captureException(error, context)
  }

  // Get Sentry client for advanced usage
  static getClient(): Sentry.Client | undefined {
    return Sentry.getCurrentHub().getClient()
  }

  // Get current scope
  static getScope(): Scope {
    return Sentry.getCurrentHub().getScope()
  }

  // Flush pending events
  static flush(timeout?: number): Promise<boolean> {
    return Sentry.flush(timeout)
  }

  // Close Sentry client
  static close(timeout?: number): Promise<boolean> {
    return Sentry.close(timeout)
  }
}

// Export default for easy import
export default SentryMonitor
