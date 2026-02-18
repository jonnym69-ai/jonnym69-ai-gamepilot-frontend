import { Request, Response } from 'express'

// Simple error logger interface (Sentry will be added later)
interface ErrorContext {
  userId?: string
  requestId?: string
  method?: string
  url?: string
  userAgent?: string
  ip?: string
  timestamp: string
  level: 'error' | 'warning' | 'info' | 'debug'
}

interface LogEntry {
  message: string
  error?: Error
  context: ErrorContext
  tags?: Record<string, string>
  extra?: Record<string, any>
}

class ErrorLogger {
  private static instance: ErrorLogger
  private isProduction = process.env.NODE_ENV === 'production'

  private constructor() {}

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger()
    }
    return ErrorLogger.instance
  }

  private createContext(req?: Request): Partial<ErrorContext> {
    const context: Partial<ErrorContext> = {
      timestamp: new Date().toISOString(),
      level: 'error'
    }

    if (req) {
      context.method = req.method
      context.url = req.url
      context.userAgent = req.get('User-Agent')
      context.ip = req.ip || req.connection.remoteAddress
      context.requestId = req.headers['x-request-id'] as string || this.generateRequestId()
      
      // Try to extract user info from request
      if ((req as any).user) {
        context.userId = (req as any).user.id
      }
    }

    return context
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private formatLogEntry(entry: LogEntry): string {
    const { message, error, context, tags, extra } = entry
    
    let logMessage = `[${context.timestamp}] ${context.level?.toUpperCase()} - ${message}`
    
    if (context.userId) logMessage += ` (User: ${context.userId})`
    if (context.method && context.url) logMessage += ` (${context.method} ${context.url})`
    if (context.ip) logMessage += ` [IP: ${context.ip}]`
    
    if (error) {
      logMessage += `\nError: ${error.message}`
      if (error.stack && !this.isProduction) {
        logMessage += `\nStack: ${error.stack}`
      }
    }

    if (tags && Object.keys(tags).length > 0) {
      logMessage += `\nTags: ${JSON.stringify(tags)}`
    }

    if (extra && Object.keys(extra).length > 0) {
      logMessage += `\nExtra: ${JSON.stringify(extra)}`
    }

    return logMessage
  }

  private log(entry: LogEntry): void {
    const formattedMessage = this.formatLogEntry(entry)
    
    // Log to console (will be replaced by Sentry in production)
    switch (entry.context.level) {
      case 'error':
        console.error(formattedMessage)
        break
      case 'warning':
        console.warn(formattedMessage)
        break
      case 'info':
        console.info(formattedMessage)
        break
      case 'debug':
        if (!this.isProduction) {
          console.debug(formattedMessage)
        }
        break
      default:
        console.log(formattedMessage)
    }

    // TODO: Send to Sentry when configured
    // this.sendToSentry(entry)
  }

  logError(message: string, error?: Error, req?: Request, tags?: Record<string, string>, extra?: Record<string, any>): void {
    const context = this.createContext(req)
    this.log({
      message,
      error,
      context: context as ErrorContext,
      tags,
      extra
    })
  }

  logWarning(message: string, req?: Request, tags?: Record<string, string>, extra?: Record<string, any>): void {
    const context = this.createContext(req)
    context.level = 'warning'
    this.log({
      message,
      context: context as ErrorContext,
      tags,
      extra
    })
  }

  logInfo(message: string, req?: Request, tags?: Record<string, string>, extra?: Record<string, any>): void {
    const context = this.createContext(req)
    context.level = 'info'
    this.log({
      message,
      context: context as ErrorContext,
      tags,
      extra
    })
  }

  logDebug(message: string, req?: Request, tags?: Record<string, string>, extra?: Record<string, any>): void {
    const context = this.createContext(req)
    context.level = 'debug'
    this.log({
      message,
      context: context as ErrorContext,
      tags,
      extra
    })
  }

  // Security-specific logging
  logSecurityEvent(message: string, req: Request, severity: 'low' | 'medium' | 'high' = 'medium', details?: Record<string, any>): void {
    const tags = {
      security: 'true',
      severity
    }

    const extra = {
      ...details,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      timestamp: new Date().toISOString()
    }

    this.logWarning(`SECURITY: ${message}`, req, tags, extra)
  }

  // Performance logging
  logPerformance(message: string, duration: number, req?: Request, details?: Record<string, any>): void {
    const tags = {
      performance: 'true'
    }

    const extra = {
      duration,
      ...details
    }

    if (duration > 1000) {
      this.logWarning(`SLOW: ${message} (${duration}ms)`, req, tags, extra)
    } else {
      this.logInfo(`PERF: ${message} (${duration}ms)`, req, tags, extra)
    }
  }

  // Database error logging
  logDatabaseError(message: string, error: Error, query?: string, params?: any[]): void {
    const tags = {
      database: 'true',
      error: 'true'
    }

    const extra = {
      query,
      params: params ? JSON.stringify(params) : undefined
    }

    this.logError(`DATABASE: ${message}`, error, undefined, tags, extra)
  }

  // Authentication error logging
  logAuthError(message: string, error: Error, req: Request, userId?: string): void {
    const tags = {
      auth: 'true',
      error: 'true'
    }

    const extra: Record<string, any> = {
      authMethod: this.getAuthMethod(req),
      loginAttempt: this.isLoginAttempt(req)
    }

    if (userId) {
      extra.userId = userId
    }

    this.logError(`AUTH: ${message}`, error, req, tags, extra)
  }

  private getAuthMethod(req: Request): string {
    const authHeader = req.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) return 'jwt'
    if (req.cookies.token) return 'cookie'
    return 'none'
  }

  private isLoginAttempt(req: Request): boolean {
    return req.url?.includes('/login') || req.url?.includes('/register')
  }

  // TODO: Add Sentry integration
  /*
  private async sendToSentry(entry: LogEntry): Promise<void> {
    if (!process.env.SENTRY_DSN) return

    try {
      // Sentry integration code here
      // await Sentry.captureException(entry.error, {
      //   tags: entry.tags,
      //   extra: entry.extra,
      //   user: entry.context.userId ? { id: entry.context.userId } : undefined
      // })
    } catch (sentryError) {
      console.error('Failed to send error to Sentry:', sentryError)
    }
  }
  */
}

export const errorLogger = ErrorLogger.getInstance()

// Export convenience functions
export const logError = (message: string, error?: Error, req?: Request, tags?: Record<string, string>, extra?: Record<string, any>) => {
  errorLogger.logError(message, error, req, tags, extra)
}

export const logWarning = (message: string, req?: Request, tags?: Record<string, string>, extra?: Record<string, any>) => {
  errorLogger.logWarning(message, req, tags, extra)
}

export const logInfo = (message: string, req?: Request, tags?: Record<string, string>, extra?: Record<string, any>) => {
  errorLogger.logInfo(message, req, tags, extra)
}

export const logSecurityEvent = (message: string, req: Request, severity?: 'low' | 'medium' | 'high', details?: Record<string, any>) => {
  errorLogger.logSecurityEvent(message, req, severity, details)
}

export const logPerformance = (message: string, duration: number, req?: Request, details?: Record<string, any>) => {
  errorLogger.logPerformance(message, duration, req, details)
}

export const logDatabaseError = (message: string, error: Error, query?: string, params?: any[]) => {
  errorLogger.logDatabaseError(message, error, query, params)
}

export const logAuthError = (message: string, error: Error, req: Request, userId?: string) => {
  errorLogger.logAuthError(message, error, req, userId)
}
