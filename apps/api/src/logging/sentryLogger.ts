import * as Sentry from '@sentry/node'
import { Request, Response } from 'express'

export interface SentryConfig {
  dsn: string
  environment: string
  release?: string
  tracesSampleRate?: number
}

export class SentryLogger {
  private static instance: SentryLogger
  private isInitialized = false

  private constructor() {}

  static getInstance(): SentryLogger {
    if (!SentryLogger.instance) {
      SentryLogger.instance = new SentryLogger()
    }
    return SentryLogger.instance
  }

  initialize(config: SentryConfig): void {
    if (this.isInitialized) {
      return
    }

    if (!config.dsn) {
      console.warn('Sentry DSN not provided, skipping initialization')
      return
    }

    Sentry.init({
      dsn: config.dsn,
      environment: config.environment || process.env.NODE_ENV || 'development',
      release: config.release || process.env.npm_package_version || '1.0.0',
      tracesSampleRate: config.tracesSampleRate || 0.1,
      beforeSend(event) {
        // Filter out certain errors in development
        if (process.env.NODE_ENV === 'development') {
          // Don't send certain errors in development
          if (event.exception?.values?.[0]?.value?.includes('EADDRINUSE')) {
            return null
          }
        }
        
        return event
      },
    })

    this.isInitialized = true
    console.log('✅ Sentry initialized')
  }

  captureException(error: Error, context?: {
    request?: Request
    userId?: string
    details?: Record<string, any>
  }): void {
    if (!this.isInitialized) {
      console.error('Sentry not initialized, falling back to console:', error)
      return
    }

    const scope = new Sentry.Scope()

    // Add request context
    if (context?.request) {
      scope.setUser({
        id: context.userId || 'anonymous',
        ip: context.request.ip,
        userAgent: context.request.get('User-Agent')
      })

      scope.setTags({
        method: context.request.method,
        url: context.request.url,
        requestId: (context.request as any).requestId || 'unknown'
      })

      scope.setExtra('headers', context.request.headers)
      scope.setExtra('query', context.request.query)
      scope.setExtra('params', context.request.params)
    }

    // Add custom details
    if (context?.details) {
      Object.keys(context.details).forEach(key => {
        scope.setExtra(key, context.details![key])
      })
    }

    Sentry.captureException(error)
  }

  captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: {
    request?: Request
    userId?: string
    details?: Record<string, any>
  }): void {
    if (!this.isInitialized) {
      console.log(`Sentry not initialized, falling back to console: [${level}] ${message}`)
      return
    }

    Sentry.captureMessage(message, level)
  }

  // Performance monitoring
  startTransaction(name: string, op: string = 'http'): Sentry.Span | null {
    if (!this.isInitialized) {
      return null
    }

    return Sentry.startSpan({
      name,
      op,
    }, () => null) || null
  }

  // User tracking
  setUser(user: { id: string; email?: string; username?: string }): void {
    if (!this.isInitialized) {
      return
    }

    Sentry.setUser(user)
  }

  // Tagging
  setTags(tags: Record<string, string>): void {
    if (!this.isInitialized) {
      return
    }

    Sentry.setTags(tags)
  }

  // Breadcrumbs
  addBreadcrumb(breadcrumb: {
    message?: string
    category?: string
    level?: Sentry.SeverityLevel
    data?: Record<string, any>
  }): void {
    if (!this.isInitialized) {
      return
    }

    Sentry.addBreadcrumb(breadcrumb)
  }

  // Health check
  healthCheck(): { initialized: boolean; dsnConfigured: boolean } {
    return {
      initialized: this.isInitialized,
      dsnConfigured: !!process.env.SENTRY_DSN
    }
  }
}

export default SentryLogger
