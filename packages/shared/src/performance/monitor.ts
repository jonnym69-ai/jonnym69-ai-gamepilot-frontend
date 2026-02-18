import { performance } from 'perf_hooks'

export interface PerformanceMetrics {
  timestamp: number
  requestDuration: number
  memoryUsage: NodeJS.MemoryUsage
  cpuUsage: NodeJS.CpuUsage
  heapUsed: number
  heapTotal: number
  external: number
  arrayBuffers: number
}

export interface RequestMetrics {
  method: string
  url: string
  statusCode: number
  duration: number
  timestamp: number
  userAgent?: string
  ip?: string
  userId?: string
}

export interface BusinessMetrics {
  activeUsers: number
  totalGames: number
  totalSessions: number
  averageSessionDuration: number
  recommendationsGenerated: number
  moodAnalysisCount: number
  apiCalls: number
  errorRate: number
  cacheHitRate: number
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private requestMetrics: RequestMetrics[] = []
  private businessMetrics: BusinessMetrics = {
    activeUsers: 0,
    totalGames: 0,
    totalSessions: 0,
    averageSessionDuration: 0,
    recommendationsGenerated: 0,
    moodAnalysisCount: 0,
    apiCalls: 0,
    errorRate: 0,
    cacheHitRate: 0
  }
  private startTime: number = Date.now()

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    this.startTime = Date.now()
    this.collectMetrics()
    
    // Collect metrics every 30 seconds
    setInterval(() => {
      this.collectMetrics()
    }, 30000)
  }

  /**
   * Collect system performance metrics
   */
  private collectMetrics(): void {
    const memUsage = process.memoryUsage()
    const cpuUsage = process.cpuUsage()
    
    const metrics: PerformanceMetrics = {
      timestamp: Date.now(),
      requestDuration: 0,
      memoryUsage: memUsage,
      cpuUsage,
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      arrayBuffers: memUsage.arrayBuffers
    }
    
    this.metrics.push(metrics)
    
    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }
  }

  /**
   * Record request metrics
   */
  recordRequest(request: RequestMetrics): void {
    this.requestMetrics.push(request)
    
    // Update business metrics
    this.businessMetrics.apiCalls++
    
    if (request.statusCode >= 400) {
      this.businessMetrics.errorRate = this.calculateErrorRate()
    }
    
    // Keep only last 10000 request metrics
    if (this.requestMetrics.length > 10000) {
      this.requestMetrics = this.requestMetrics.slice(-10000)
    }
  }

  /**
   * Update business metrics
   */
  updateBusinessMetrics(metrics: Partial<BusinessMetrics>): void {
    Object.assign(this.businessMetrics, metrics)
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics(): PerformanceMetrics {
    const memUsage = process.memoryUsage()
    const cpuUsage = process.cpuUsage()
    
    return {
      timestamp: Date.now(),
      requestDuration: 0,
      memoryUsage: memUsage,
      cpuUsage,
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      arrayBuffers: memUsage.arrayBuffers
    }
  }

  /**
   * Get metrics for Prometheus
   */
  getPrometheusMetrics(): string {
    const current = this.getCurrentMetrics()
    const uptime = Date.now() - this.startTime
    
    let metrics = ''
    
    // Memory metrics
    metrics += `# HELP gamepilot_memory_used_bytes Memory used in bytes\n`
    metrics += `# TYPE gamepilot_memory_used_bytes gauge\n`
    metrics += `gamepilot_memory_used_bytes ${current.heapUsed}\n\n`
    
    metrics += `# HELP gamepilot_memory_total_bytes Total memory in bytes\n`
    metrics += `# TYPE gamepilot_memory_total_bytes gauge\n`
    metrics += `gamepilot_memory_total_bytes ${current.heapTotal}\n\n`
    
    // CPU metrics
    metrics += `# HELP gamepilot_cpu_usage_seconds_total CPU usage in seconds\n`
    metrics += `# TYPE gamepilot_cpu_usage_seconds_total counter\n`
    metrics += `gamepilot_cpu_usage_seconds_total ${current.cpuUsage.user}\n\n`
    
    // Uptime metrics
    metrics += `# HELP gamepilot_uptime_seconds Uptime in seconds\n`
    metrics += `# TYPE gamepilot_uptime_seconds gauge\n`
    metrics += `gamepilot_uptime_seconds ${uptime / 1000}\n\n`
    
    // Business metrics
    metrics += `# HELP gamepilot_active_users Number of active users\n`
    metrics += `# TYPE gamepilot_active_users gauge\n`
    metrics += `gamepilot_active_users ${this.businessMetrics.activeUsers}\n\n`
    
    metrics += `# HELP gamepilot_total_games Total number of games\n`
    metrics += `# TYPE gamepilot_total_games gauge\n`
    metrics += `gamepilot_total_games ${this.businessMetrics.totalGames}\n\n`
    
    metrics += `# HELP gamepilot_api_calls_total Total API calls\n`
    metrics += `# TYPE gamepilot_api_calls_total counter\n`
    metrics += `gamepilot_api_calls_total ${this.businessMetrics.apiCalls}\n\n`
    
    metrics += `# HELP gamepilot_error_rate Error rate percentage\n`
    metrics += `# TYPE gamepilot_error_rate gauge\n`
    metrics += `gamepilot_error_rate ${this.businessMetrics.errorRate}\n\n`
    
    metrics += `# HELP gamepilot_cache_hit_rate Cache hit rate percentage\n`
    metrics += `# TYPE gamepilot_cache_hit_rate gauge\n`
    metrics += `gamepilot_cache_hit_rate ${this.businessMetrics.cacheHitRate}\n\n`
    
    // Request duration metrics
    const avgDuration = this.getAverageRequestDuration()
    metrics += `# HELP gamepilot_request_duration_seconds Average request duration\n`
    metrics += `# TYPE gamepilot_request_duration_seconds gauge\n`
    metrics += `gamepilot_request_duration_seconds ${avgDuration}\n\n`
    
    return metrics
  }

  /**
   * Calculate error rate
   */
  private calculateErrorRate(): number {
    if (this.requestMetrics.length === 0) return 0
    
    const errorCount = this.requestMetrics.filter(req => req.statusCode >= 400).length
    return (errorCount / this.requestMetrics.length) * 100
  }

  /**
   * Get average request duration
   */
  private getAverageRequestDuration(): number {
    if (this.requestMetrics.length === 0) return 0
    
    const totalDuration = this.requestMetrics.reduce((sum, req) => sum + req.duration, 0)
    return totalDuration / this.requestMetrics.length
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    uptime: number
    memoryUsage: NodeJS.MemoryUsage
    averageRequestDuration: number
    errorRate: number
    totalRequests: number
    activeUsers: number
  } {
    const uptime = Date.now() - this.startTime
    const memoryUsage = process.memoryUsage()
    const averageRequestDuration = this.getAverageRequestDuration()
    const errorRate = this.calculateErrorRate()
    const totalRequests = this.requestMetrics.length
    
    return {
      uptime,
      memoryUsage,
      averageRequestDuration,
      errorRate,
      totalRequests,
      activeUsers: this.businessMetrics.activeUsers
    }
  }

  /**
   * Check if performance is healthy
   */
  isHealthy(): boolean {
    const summary = this.getPerformanceSummary()
    
    // Check memory usage (should be less than 1GB)
    if (summary.memoryUsage.heapUsed > 1024 * 1024 * 1024) {
      return false
    }
    
    // Check error rate (should be less than 5%)
    if (summary.errorRate > 5) {
      return false
    }
    
    // Check average request duration (should be less than 2 seconds)
    if (summary.averageRequestDuration > 2000) {
      return false
    }
    
    return true
  }

  /**
   * Get performance alerts
   */
  getPerformanceAlerts(): string[] {
    const alerts: string[] = []
    const summary = this.getPerformanceSummary()
    
    // Memory alerts
    if (summary.memoryUsage.heapUsed > 800 * 1024 * 1024) {
      alerts.push('High memory usage detected')
    }
    
    if (summary.memoryUsage.heapUsed > 1024 * 1024 * 1024) {
      alerts.push('Critical memory usage - immediate attention required')
    }
    
    // Error rate alerts
    if (summary.errorRate > 5) {
      alerts.push('High error rate detected')
    }
    
    if (summary.errorRate > 10) {
      alerts.push('Critical error rate - immediate attention required')
    }
    
    // Response time alerts
    if (summary.averageRequestDuration > 2000) {
      alerts.push('Slow response times detected')
    }
    
    if (summary.averageRequestDuration > 5000) {
      alerts.push('Critical response times - immediate attention required')
    }
    
    return alerts
  }

  /**
   * Export metrics for external monitoring
   */
  exportMetrics(): {
    performance: PerformanceMetrics[]
    requests: RequestMetrics[]
    business: BusinessMetrics
    summary: any
  } {
    return {
      performance: this.metrics,
      requests: this.requestMetrics,
      business: this.businessMetrics,
      summary: this.getPerformanceSummary()
    }
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = []
    this.requestMetrics = []
    this.businessMetrics = {
      activeUsers: 0,
      totalGames: 0,
      totalSessions: 0,
      averageSessionDuration: 0,
      recommendationsGenerated: 0,
      moodAnalysisCount: 0,
      apiCalls: 0,
      errorRate: 0,
      cacheHitRate: 0
    }
    this.startTime = Date.now()
  }
}

// Express middleware for performance monitoring
export function performanceMiddleware(monitor: PerformanceMonitor) {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now()
    
    res.on('finish', () => {
      const duration = Date.now() - startTime
      
      const requestMetrics: RequestMetrics = {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        timestamp: startTime,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        userId: req.user?.id
      }
      
      monitor.recordRequest(requestMetrics)
    })
    
    next()
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()
