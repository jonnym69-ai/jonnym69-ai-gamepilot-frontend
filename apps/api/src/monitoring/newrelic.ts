// New Relic Performance Monitoring Configuration
// Note: newrelic package should be installed in production
// import * as newrelic from 'newrelic'
// import { Agent, Config } from 'newrelic/types'

// Type definitions for development (when newrelic is not available)
type MockAgent = {
  recordMetric: (name: string, value: number, unit?: string) => void
  incrementMetric: (name: string, value?: number) => void
  noticeError: (error: Error, context?: Record<string, any>) => void
  startTransaction: (name: string, type: string) => any
}

const mockAgent: MockAgent = {
  recordMetric: () => {},
  incrementMetric: () => {},
  noticeError: () => {},
  startTransaction: () => ({ end: () => {} })
}

// New Relic Configuration for GamePilot Production
export const newrelicConfig = {
  app_name: 'GamePilot',
  license_key: process.env.NEW_RELIC_LICENSE_KEY || '',
  logging: {
    enabled: true,
    level: 'info',
    filepath: '/var/log/gamepilot/newrelic.log'
  },
  distributed_tracing: {
    enabled: true
  },
  browser_monitoring: {
    enabled: true
  },
  slow_sql: {
    enabled: true,
    max_samples: 10
  },
  transaction_tracer: {
    enabled: true,
    transaction_threshold: 0.5, // 500ms
    record_sql: 'obfuscated'
  },
  error_collector: {
    enabled: true,
    capture_source_map: true
  }
}

// Initialize New Relic if license key is provided
// Note: This will only work in production with newrelic package installed
if (process.env.NEW_RELIC_LICENSE_KEY && process.env.NODE_ENV === 'production') {
  try {
    // @ts-ignore - newrelic is only available in production
    if ((globalThis as any).newrelic) {
      // @ts-ignore
      (globalThis as any).newrelic.start(newrelicConfig)
      console.log('📊 New Relic monitoring initialized')
    }
  } catch (error) {
    console.warn('⚠️ Failed to initialize New Relic:', error)
  }
}

// Custom New Relic monitoring utilities
export class NewRelicMonitor {
  private agent: MockAgent

  constructor() {
    // Use mock agent in development, real agent in production
    // @ts-ignore - newrelic is only available in production
    this.agent = (typeof globalThis !== 'undefined' && (globalThis as any).newrelic?.agent) || mockAgent
  }

  // Track custom metrics
  trackCustomMetric(name: string, value: number, unit?: string): void {
    this.agent.recordMetric(name, value, unit)
  }

  // Track API response time
  trackApiResponse(endpoint: string, duration: number): void {
    this.agent.recordMetric(`Custom/ApiResponse/${endpoint}`, duration, 'seconds')
  }

  // Track database query performance
  trackDatabaseQuery(query: string, duration: number): void {
    this.agent.recordMetric(`Custom/DatabaseQuery/${query}`, duration, 'seconds')
  }

  // Track cache performance
  trackCacheHit(key: string, hit: boolean): void {
    this.agent.incrementMetric(`Custom/Cache/${key}`, hit ? 1 : 0)
  }

  // Track user actions
  trackUserAction(action: string, userId?: string): void {
    const metricName = userId ? `Custom/UserAction/${userId}/${action}` : `Custom/UserAction/${action}`
    this.agent.incrementMetric(metricName)
  }

  // Track game operations
  trackGameOperation(operation: string, gameId?: string): void {
    const metricName = gameId ? `Custom/GameOperation/${gameId}/${operation}` : `Custom/GameOperation/${operation}`
    this.agent.incrementMetric(metricName)
  }

  // Track integration performance
  trackIntegrationPerformance(platform: string, operation: string, duration: number): void {
    this.agent.recordMetric(`Custom/Integration/${platform}/${operation}`, duration, 'seconds')
  }

  // Track mood engine performance
  trackMoodEnginePerformance(operation: string, duration: number): void {
    this.agent.recordMetric(`Custom/MoodEngine/${operation}`, duration, 'seconds')
  }

  // Track recommendation performance
  trackRecommendationPerformance(duration: number, count: number): void {
    this.agent.recordMetric('Custom/Recommendation/Duration', duration, 'seconds')
    this.agent.recordMetric('Custom/Recommendation/Count', count, 'count')
  }

  // Track search performance
  trackSearchPerformance(query: string, duration: number, results: number): void {
    this.agent.recordMetric(`Custom/Search/${query}`, duration, 'seconds')
    this.agent.recordMetric('Custom/Search/Results', results, 'count')
  }

  // Track file upload performance
  trackFileUpload(fileSize: number, duration: number): void {
    this.agent.recordMetric('Custom/FileUpload/Size', fileSize, 'bytes')
    this.agent.recordMetric('Custom/FileUpload/Duration', duration, 'seconds')
  }

  // Track WebSocket connections
  trackWebSocketConnection(action: 'connect' | 'disconnect' | 'error'): void {
    this.agent.incrementMetric(`Custom/WebSocket/${action}`)
  }

  // Track background jobs
  trackBackgroundJob(jobName: string, duration: number, success: boolean): void {
    this.agent.recordMetric(`Custom/BackgroundJob/${jobName}`, duration, 'seconds')
    this.agent.incrementMetric(`Custom/BackgroundJob/${jobName}/${success ? 'success' : 'failure'}`)
  }

  // Track memory usage
  trackMemoryUsage(heapUsed: number, heapTotal: number): void {
    this.agent.recordMetric('Custom/Memory/HeapUsed', heapUsed, 'bytes')
    this.agent.recordMetric('Custom/Memory/HeapTotal', heapTotal, 'bytes')
  }

  // Track CPU usage
  trackCPUUsage(usage: number): void {
    this.agent.recordMetric('Custom/CPU/Usage', usage, 'percent')
  }

  // Track active users
  trackActiveUsers(count: number): void {
    this.agent.recordMetric('Custom/Users/Active', count, 'count')
  }

  // Track concurrent requests
  trackConcurrentRequests(count: number): void {
    this.agent.recordMetric('Custom/Requests/Concurrent', count, 'count')
  }

  // Track error rates
  trackErrorRate(rate: number): void {
    this.agent.recordMetric('Custom/ErrorRate', rate, 'percent')
  }

  // Track response times
  trackResponseTime(p50: number, p95: number, p99: number): void {
    this.agent.recordMetric('Custom/ResponseTime/P50', p50, 'seconds')
    this.agent.recordMetric('Custom/ResponseTime/P95', p95, 'seconds')
    this.agent.recordMetric('Custom/ResponseTime/P99', p99, 'seconds')
  }

  // Track throughput
  trackThroughput(requestsPerSecond: number): void {
    this.agent.recordMetric('Custom/Throughput', requestsPerSecond, 'requests/second')
  }

  // Custom error tracking
  trackError(error: Error, context?: Record<string, any>): void {
    this.agent.noticeError(error, context)
  }

  // Custom transaction tracking
  startTransaction(name: string, type: string): any {
    return this.agent.startTransaction(name, type)
  }

  endTransaction(transaction: any, error?: Error): void {
    if (error) {
      transaction.end({ error })
    } else {
      transaction.end()
    }
  }

  // Add custom attributes to transaction
  addTransactionAttribute(transaction: any, key: string, value: any): void {
    transaction.addCustomAttribute(key, value)
  }

  // Track database connection pool metrics
  trackDatabasePoolMetrics(pool: {
    total: number
    idle: number
    active: number
    waiting: number
  }): void {
    this.agent.recordMetric('Custom/DatabasePool/Total', pool.total, 'count')
    this.agent.recordMetric('Custom/DatabasePool/Idle', pool.idle, 'count')
    this.agent.recordMetric('Custom/DatabasePool/Active', pool.active, 'count')
    this.agent.recordMetric('Custom/DatabasePool/Waiting', pool.waiting, 'count')
  }

  // Track Redis connection metrics
  trackRedisMetrics(metrics: {
    connected: number
    disconnected: number
    memory: number
    commands: number
    hits: number
    misses: number
  }): void {
    this.agent.recordMetric('Custom/Redis/Connected', metrics.connected, 'count')
    this.agent.recordMetric('Custom/Redis/Disconnected', metrics.disconnected, 'count')
    this.agent.recordMetric('Custom/Redis/Memory', metrics.memory, 'bytes')
    this.agent.recordMetric('Custom/Redis/Commands', metrics.commands, 'count')
    this.agent.recordMetric('Custom/Redis/Hits', metrics.hits, 'count')
    this.agent.recordMetric('Custom/Redis/Misses', metrics.misses, 'count')
  }

  // Track WebSocket metrics
  trackWebSocketMetrics(metrics: {
    connections: number
    messages: number
    errors: number
    bytesReceived: number
    bytesSent: number
  }): void {
    this.agent.recordMetric('Custom/WebSocket/Connections', metrics.connections, 'count')
    this.agent.recordMetric('Custom/WebSocket/Messages', metrics.messages, 'count')
    this.agent.recordMetric('Custom/WebSocket/Errors', metrics.errors, 'count')
    this.agent.recordMetric('Custom/WebSocket/BytesReceived', metrics.bytesReceived, 'bytes')
    this.agent.recordMetric('Custom/WebSocket/BytesSent', metrics.bytesSent, 'bytes')
  }

  // Track integration metrics
  trackIntegrationMetrics(platform: string, metrics: {
    requests: number
    errors: number
    responseTime: number
    cacheHits: number
    cacheMisses: number
  }): void {
    this.agent.recordMetric(`Custom/Integration/${platform}/Requests`, metrics.requests, 'count')
    this.agent.recordMetric(`Custom/Integration/${platform}/Errors`, metrics.errors, 'count')
    this.agent.recordMetric(`Custom/Integration/${platform}/ResponseTime`, metrics.responseTime, 'seconds')
    this.agent.recordMetric(`Custom/Integration/${platform}/CacheHits`, metrics.cacheHits, 'count')
    this.agent.recordMetric(`Custom/Integration/${platform}/CacheMisses`, metrics.cacheMisses, 'count')
  }

  // Track user engagement metrics
  trackUserEngagement(metrics: {
    activeUsers: number
    pageViews: number
    sessionDuration: number
    bounceRate: number
    retentionRate: number
  }): void {
    this.agent.recordMetric('Custom/UserEngagement/ActiveUsers', metrics.activeUsers, 'count')
    this.agent.recordMetric('Custom/UserEngagement/PageViews', metrics.pageViews, 'count')
    this.agent.recordMetric('Custom/UserEngagement/SessionDuration', metrics.sessionDuration, 'seconds')
    this.agent.recordMetric('Custom/UserEngagement/BounceRate', metrics.bounceRate, 'percent')
    this.agent.recordMetric('Custom/UserEngagement/RetentionRate', metrics.retentionRate, 'percent')
  }

  // Track game library metrics
  trackGameLibraryMetrics(metrics: {
    totalGames: number
    addedGames: number
    removedGames: number
    playedGames: number
    completedGames: number
    averageRating: number
  }): void {
    this.agent.recordMetric('Custom/GameLibrary/Total', metrics.totalGames, 'count')
    this.agent.recordMetric('Custom/GameLibrary/Added', metrics.addedGames, 'count')
    this.agent.recordMetric('Custom/GameLibrary/Removed', metrics.removedGames, 'count')
    this.agent.recordMetric('Custom/GameLibrary/Played', metrics.playedGames, 'count')
    this.agent.recordMetric('Custom/GameLibrary/Completed', metrics.completedGames, 'count')
    this.agent.recordMetric('Custom/GameLibrary/AverageRating', metrics.averageRating, 'rating')
  }

  // Track mood engine metrics
  trackMoodEngineMetrics(metrics: {
    moodAnalyses: number
    recommendations: number
    accuracy: number
    processingTime: number
    cacheHitRate: number
  }): void {
    this.agent.recordMetric('Custom/MoodEngine/Analyses', metrics.moodAnalyses, 'count')
    this.agent.recordMetric('Custom/MoodEngine/Recommendations', metrics.recommendations, 'count')
    this.agent.recordMetric('Custom/MoodEngine/Accuracy', metrics.accuracy, 'percent')
    this.agent.recordMetric('Custom/MoodEngine/ProcessingTime', metrics.processingTime, 'seconds')
    this.agent.recordMetric('Custom/MoodEngine/CacheHitRate', metrics.cacheHitRate, 'percent')
  }

  // Track performance alerts
  trackPerformanceAlert(alert: {
    type: 'slow_response' | 'high_error_rate' | 'memory_usage' | 'cpu_usage'
    threshold: number
    currentValue: number
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
  }): void {
    this.agent.noticeError(new Error(`Performance Alert: ${alert.type}`), {
      type: alert.type,
      threshold: alert.threshold,
      currentValue: alert.currentValue,
      severity: alert.severity,
      message: alert.message
    })
  }

  // Track business metrics
  trackBusinessMetrics(metrics: {
    newUsers: number
    returningUsers: number
    premiumUsers: number
    totalRevenue: number
    averageRevenuePerUser: number
  }): void {
    this.agent.recordMetric('Custom/Business/NewUsers', metrics.newUsers, 'count')
    this.agent.recordMetric('Custom/Business/ReturningUsers', metrics.returningUsers, 'count')
    this.agent.recordMetric('Custom/Business/PremiumUsers', metrics.premiumUsers, 'count')
    this.agent.recordMetric('Custom/Business/TotalRevenue', metrics.totalRevenue, 'dollars')
    this.agent.recordMetric('Custom/Business/AverageRevenuePerUser', metrics.averageRevenuePerUser, 'dollars')
  }
}

// Export singleton instance
export const newRelicMonitor = new NewRelicMonitor()

// Export default for easy import
export default newRelicMonitor
