export interface ErrorContext {
  userId?: string
  sessionId?: string
  requestId?: string
  userAgent?: string
  ip?: string
  url?: string
  method?: string
  statusCode?: number
  timestamp: number
  environment: string
  version: string
  type?: string
  severity?: string
  tags?: string[]
  extra?: Record<string, any>
}

export interface ErrorInfo {
  message: string
  stack?: string
  type: string
  severity: 'error' | 'warning' | 'info' | 'debug'
  context: ErrorContext
  tags: string[]
  extra?: Record<string, any>
}

export interface ErrorReport {
  id: string
  error: ErrorInfo
  occurrences: number
  firstSeen: number
  lastSeen: number
  resolved: boolean
  assignedTo?: string
  comments: ErrorComment[]
}

export interface ErrorComment {
  id: string
  author: string
  message: string
  timestamp: number
  internal: boolean
}

export interface ErrorStats {
  totalErrors: number
  errorsByType: Record<string, number>
  errorsBySeverity: Record<string, number>
  errorsByUrl: Record<string, number>
  errorsByUser: Record<string, number>
  recentErrors: ErrorInfo[]
  resolvedErrors: number
  unresolvedErrors: number
}

export class ErrorTracker {
  private errors: Map<string, ErrorReport> = new Map()
  private stats: ErrorStats = {
    totalErrors: 0,
    errorsByType: {},
    errorsBySeverity: {},
    errorsByUrl: {},
    errorsByUser: {},
    recentErrors: [],
    resolvedErrors: 0,
    unresolvedErrors: 0
  }
  private maxErrors: number = 10000
  private maxRecentErrors: number = 100

  constructor() {
    this.setupGlobalErrorHandlers()
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.captureError(error, {
        type: 'uncaughtException',
        severity: 'error',
        tags: ['critical', 'uncaught'],
        timestamp: Date.now(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
      })
    })

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.captureError(new Error(`Unhandled Promise Rejection: ${reason}`), {
        type: 'unhandledRejection',
        severity: 'error',
        tags: ['critical', 'promise'],
        timestamp: Date.now(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        extra: { reason, promise }
      })
    })
  }

  /**
   * Capture an error
   */
  captureError(error: Error | string, context: Partial<ErrorContext> = {}): string {
    const errorInfo: ErrorInfo = this.createErrorInfo(error, context)
    const errorId = this.generateErrorId(errorInfo)
    
    // Update or create error report
    const existingReport = this.errors.get(errorId)
    if (existingReport) {
      existingReport.occurrences++
      existingReport.lastSeen = Date.now()
    } else {
      const report: ErrorReport = {
        id: errorId,
        error: errorInfo,
        occurrences: 1,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        resolved: false,
        comments: []
      }
      this.errors.set(errorId, report)
    }
    
    // Update statistics
    this.updateStats(errorInfo)
    
    // Clean up old errors
    this.cleanupOldErrors()
    
    return errorId
  }

  /**
   * Create error info from error or string
   */
  private createErrorInfo(error: Error | string, context: Partial<ErrorContext>): ErrorInfo {
    const isError = error instanceof Error
    const message = isError ? error.message : error
    const stack = isError ? error.stack : undefined
    
    return {
      message,
      stack,
      type: isError ? error.constructor.name : 'Error',
      severity: 'error',
      context: {
        timestamp: Date.now(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        ...context
      },
      tags: [],
      extra: {}
    }
  }

  /**
   * Generate error ID
   */
  private generateErrorId(errorInfo: ErrorInfo): string {
    const base = `${errorInfo.type}-${errorInfo.message}-${errorInfo.context.url || 'unknown'}`
    return Buffer.from(base).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16)
  }

  /**
   * Update error statistics
   */
  private updateStats(errorInfo: ErrorInfo): void {
    this.stats.totalErrors++
    
    // Update by type
    this.stats.errorsByType[errorInfo.type] = (this.stats.errorsByType[errorInfo.type] || 0) + 1
    
    // Update by severity
    this.stats.errorsBySeverity[errorInfo.severity] = (this.stats.errorsBySeverity[errorInfo.severity] || 0) + 1
    
    // Update by URL
    if (errorInfo.context.url) {
      this.stats.errorsByUrl[errorInfo.context.url] = (this.stats.errorsByUrl[errorInfo.context.url] || 0) + 1
    }
    
    // Update by user
    if (errorInfo.context.userId) {
      this.stats.errorsByUser[errorInfo.context.userId] = (this.stats.errorsByUser[errorInfo.context.userId] || 0) + 1
    }
    
    // Update recent errors
    this.stats.recentErrors.unshift(errorInfo)
    if (this.stats.recentErrors.length > this.maxRecentErrors) {
      this.stats.recentErrors = this.stats.recentErrors.slice(0, this.maxRecentErrors)
    }
    
    // Update resolved/unresolved counts
    this.stats.unresolvedErrors = Array.from(this.errors.values()).filter(report => !report.resolved).length
    this.stats.resolvedErrors = Array.from(this.errors.values()).filter(report => report.resolved).length
  }

  /**
   * Clean up old errors
   */
  private cleanupOldErrors(): void {
    if (this.errors.size > this.maxErrors) {
      const sortedErrors = Array.from(this.errors.entries())
        .sort((a, b) => b[1].lastSeen - a[1].lastSeen)
      
      // Keep only the most recent errors
      const toKeep = sortedErrors.slice(0, this.maxErrors)
      this.errors = new Map(toKeep)
    }
  }

  /**
   * Get error by ID
   */
  getError(errorId: string): ErrorReport | undefined {
    return this.errors.get(errorId)
  }

  /**
   * Get all errors
   */
  getAllErrors(): ErrorReport[] {
    return Array.from(this.errors.values())
      .sort((a, b) => b.lastSeen - a.lastSeen)
  }

  /**
   * Get errors by status
   */
  getErrorsByStatus(resolved: boolean): ErrorReport[] {
    return Array.from(this.errors.values())
      .filter(report => report.resolved === resolved)
      .sort((a, b) => b.lastSeen - a.lastSeen)
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: string): ErrorReport[] {
    return Array.from(this.errors.values())
      .filter(report => report.error.severity === severity)
      .sort((a, b) => b.lastSeen - a.lastSeen)
  }

  /**
   * Get error statistics
   */
  getStats(): ErrorStats {
    return { ...this.stats }
  }

  /**
   * Resolve an error
   */
  resolveError(errorId: string, resolvedBy?: string): boolean {
    const report = this.errors.get(errorId)
    if (!report) return false
    
    report.resolved = true
    report.assignedTo = resolvedBy
    
    // Update statistics
    this.stats.unresolvedErrors--
    this.stats.resolvedErrors++
    
    return true
  }

  /**
   * Add comment to error
   */
  addComment(errorId: string, author: string, message: string, internal: boolean = false): boolean {
    const report = this.errors.get(errorId)
    if (!report) return false
    
    const comment: ErrorComment = {
      id: this.generateId(),
      author,
      message,
      timestamp: Date.now(),
      internal
    }
    
    report.comments.push(comment)
    return true
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  /**
   * Get errors for dashboard
   */
  getDashboardData(): {
    summary: {
      total: number
      resolved: number
      unresolved: number
      critical: number
      recent: number
    }
    topErrors: Array<{
      id: string
      message: string
      type: string
      occurrences: number
      lastSeen: number
      resolved: boolean
    }>
    recentErrors: ErrorInfo[]
    stats: {
      byType: Record<string, number>
      bySeverity: Record<string, number>
      byUrl: Record<string, number>
    }
  } {
    const criticalErrors = this.getErrorsBySeverity('error')
    
    return {
      summary: {
        total: this.stats.totalErrors,
        resolved: this.stats.resolvedErrors,
        unresolved: this.stats.unresolvedErrors,
        critical: criticalErrors.length,
        recent: this.stats.recentErrors.length
      },
      topErrors: this.getAllErrors()
        .slice(0, 10)
        .map(report => ({
          id: report.id,
          message: report.error.message,
          type: report.error.type,
          occurrences: report.occurrences,
          lastSeen: report.lastSeen,
          resolved: report.resolved
        })),
      recentErrors: this.stats.recentErrors.slice(0, 20),
      stats: {
        byType: this.stats.errorsByType,
        bySeverity: this.stats.errorsBySeverity,
        byUrl: this.stats.errorsByUrl
      }
    }
  }

  /**
   * Export errors for backup
   */
  exportErrors(): {
    errors: Array<ErrorReport>
    stats: ErrorStats
    exportedAt: number
  } {
    return {
      errors: this.getAllErrors(),
      stats: this.getStats(),
      exportedAt: Date.now()
    }
  }

  /**
   * Import errors from backup
   */
  importErrors(data: { errors: Array<ErrorReport>; stats: ErrorStats }): void {
    this.errors = new Map(data.errors.map(report => [report.id, report]))
    this.stats = data.stats
  }

  /**
   * Clear all errors
   */
  clearAllErrors(): void {
    this.errors.clear()
    this.stats = {
      totalErrors: 0,
      errorsByType: {},
      errorsBySeverity: {},
      errorsByUrl: {},
      errorsByUser: {},
      recentErrors: [],
      resolvedErrors: 0,
      unresolvedErrors: 0
    }
  }

  /**
   * Get error trends
   */
  getErrorTrends(hours: number = 24): Array<{
    hour: number
    errors: number
    resolved: number
  }> {
    const now = Date.now()
    const hourMs = 60 * 60 * 1000
    const trends: Array<{ hour: number; errors: number; resolved: number }> = []
    
    for (let i = 0; i < hours; i++) {
      const hourStart = now - (i + 1) * hourMs
      const hourEnd = now - i * hourMs
      
      const errors = Array.from(this.errors.values()).filter(report => 
        report.firstSeen >= hourStart && report.firstSeen < hourEnd
      ).length
      
      const resolved = Array.from(this.errors.values()).filter(report => 
        report.resolved && report.lastSeen >= hourStart && report.lastSeen < hourEnd
      ).length
      
      trends.unshift({
        hour: i,
        errors,
        resolved
      })
    }
    
    return trends
  }
}

// Express middleware for error tracking
export function errorTrackingMiddleware(tracker: ErrorTracker) {
  return (error: Error, req: any, res: any, next: any) => {
    const context: ErrorContext = {
      userId: req.user?.id,
      sessionId: req.session?.id,
      requestId: req.id,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      url: req.url,
      method: req.method,
      statusCode: res.statusCode,
      timestamp: Date.now(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    }
    
    tracker.captureError(error, context)
    next(error)
  }
}

// Async error wrapper
export function trackAsyncErrors(tracker: ErrorTracker) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value
    
    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args)
      } catch (error) {
        tracker.captureError(error as Error, {
          type: 'asyncError',
          severity: 'error',
          tags: ['async', 'function'],
          timestamp: Date.now(),
          environment: process.env.NODE_ENV || 'development',
          version: process.env.npm_package_version || '1.0.0',
          extra: { functionName: propertyKey, args }
        })
        throw error
      }
    }
    
    return descriptor
  }
}

// Singleton instance
export const errorTracker = new ErrorTracker()
