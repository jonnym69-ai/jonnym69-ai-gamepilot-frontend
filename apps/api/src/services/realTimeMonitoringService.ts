import { Server as SocketIOServer } from 'socket.io'
import { createServer } from 'http'
import { Database } from 'sqlite'
import { ObservabilityService } from './observabilityService'
import { AlertingService } from './alertingService'

/**
 * Real-time monitoring service for live dashboard updates
 */
export class RealTimeMonitoringService {
  private io: SocketIOServer
  private observabilityService: ObservabilityService
  private alertingService: AlertingService
  private monitoringInterval: NodeJS.Timeout | null = null
  private connectedClients: Set<string> = new Set()
  private lastHealthMetrics: any = null

  constructor(server: any, db: Database) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        methods: ['GET', 'POST']
      }
    })
    
    this.observabilityService = new ObservabilityService(db)
    this.alertingService = new AlertingService()
    
    this.setupSocketHandlers()
    this.startMonitoring()
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`)
      this.connectedClients.add(socket.id)

      // Send current health metrics on connection
      this.sendHealthUpdate(socket)
      
      // Subscribe to real-time updates
      socket.on('subscribe:health', () => {
        socket.join('health-updates')
        console.log(`📊 Client ${socket.id} subscribed to health updates`)
      })

      socket.on('subscribe:performance', () => {
        socket.join('performance-updates')
        console.log(`📈 Client ${socket.id} subscribed to performance updates`)
      })

      socket.on('subscribe:alerts', () => {
        socket.join('alert-updates')
        console.log(`🚨 Client ${socket.id} subscribed to alert updates`)
      })

      socket.on('subscribe:mood-persona', () => {
        socket.join('mood-persona-updates')
        console.log(`🎭 Client ${socket.id} subscribed to mood-persona updates`)
      })

      // Handle client requests for specific data
      socket.on('request:health', async () => {
        try {
          const health = await this.observabilityService.captureSystemHealth()
          socket.emit('health:update', health)
        } catch (error) {
          socket.emit('error', { message: 'Failed to fetch health data', error: (error as Error).message })
        }
      })

      socket.on('request:performance', async (data: { hours?: number }) => {
        try {
          const hours = data?.hours || 1
          const [moodStats, recommendationStats, personaStats, slowQueries] = await Promise.all([
            this.observabilityService.getPerformanceStats('mood_selection', hours),
            this.observabilityService.getPerformanceStats('recommendation_generate', hours),
            this.observabilityService.getPerformanceStats('persona_update', hours),
            this.observabilityService.getSlowQueries(hours)
          ])

          socket.emit('performance:update', {
            period: `${hours} hours`,
            operations: {
              moodSelection: moodStats,
              recommendation: recommendationStats,
              personaUpdate: personaStats
            },
            slowQueries
          })
        } catch (error) {
          socket.emit('error', { message: 'Failed to fetch performance data', error: (error as Error).message })
        }
      })

      socket.on('request:errors', async (data: { hours?: number }) => {
        try {
          const hours = data?.hours || 1
          const errorStats = await this.observabilityService.getErrorStats(hours)
          socket.emit('errors:update', errorStats)
        } catch (error) {
          socket.emit('error', { message: 'Failed to fetch error data', error: (error as Error).message })
        }
      })

      socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`)
        this.connectedClients.delete(socket.id)
      })
    })
  }

  /**
   * Start real-time monitoring
   */
  private startMonitoring(): void {
    // Health monitoring every 30 seconds
    this.monitoringInterval = setInterval(async () => {
      try {
        const healthMetrics = await this.observabilityService.captureSystemHealth()
        this.lastHealthMetrics = healthMetrics
        
        // Broadcast health updates
        this.io.to('health-updates').emit('health:update', healthMetrics)
        
        // Check for alerts
        await this.checkAlerts(healthMetrics)
        
        // Broadcast performance updates
        await this.broadcastPerformanceUpdates()
        
        // Broadcast mood-persona updates
        await this.broadcastMoodPersonaUpdates()
        
      } catch (error) {
        console.error('❌ Real-time monitoring error:', error)
        this.io.emit('system:error', { message: 'Monitoring error', error: (error as Error).message })
      }
    }, 30000) // Every 30 seconds

    console.log('🔄 Real-time monitoring started')
  }

  /**
   * Check for alert conditions
   */
  private async checkAlerts(healthMetrics: any): Promise<void> {
    const alerts = []

    // Error rate alerts
    if (healthMetrics.errors.last24h > 100) {
      alerts.push({
        type: 'error_rate',
        severity: 'critical',
        message: `High error rate: ${healthMetrics.errors.last24h} errors in last 24h`,
        value: healthMetrics.errors.last24h,
        threshold: 100,
        timestamp: new Date()
      })
    }

    // Response time alerts
    if (healthMetrics.moodPersona.avgResponseTime > 2000) {
      alerts.push({
        type: 'response_time',
        severity: 'warning',
        message: `High response time: ${healthMetrics.moodPersona.avgResponseTime}ms`,
        value: healthMetrics.moodPersona.avgResponseTime,
        threshold: 2000,
        timestamp: new Date()
      })
    }

    // Success rate alerts
    if (healthMetrics.moodPersona.successRate < 0.9) {
      alerts.push({
        type: 'success_rate',
        severity: 'warning',
        message: `Low success rate: ${(healthMetrics.moodPersona.successRate * 100).toFixed(1)}%`,
        value: healthMetrics.moodPersona.successRate,
        threshold: 0.9,
        timestamp: new Date()
      })
    }

    // Critical errors
    if (healthMetrics.errors.criticalErrors.length > 0) {
      alerts.push({
        type: 'critical_error',
        severity: 'critical',
        message: `${healthMetrics.errors.criticalErrors.length} critical errors detected`,
        value: healthMetrics.errors.criticalErrors.length,
        threshold: 0,
        timestamp: new Date()
      })
    }

    // Slow queries
    if (healthMetrics.performance.slowQueries.length > 5) {
      alerts.push({
        type: 'slow_queries',
        severity: 'warning',
        message: `${healthMetrics.performance.slowQueries.length} slow queries detected`,
        value: healthMetrics.performance.slowQueries.length,
        threshold: 5,
        timestamp: new Date()
      })
    }

    // Send alerts
    for (const alert of alerts) {
      await this.alertingService.sendAlert(alert as any)
      this.io.to('alert-updates').emit('alert:new', alert)
    }
  }

  /**
   * Broadcast performance updates
   */
  private async broadcastPerformanceUpdates(): Promise<void> {
    try {
      const [moodStats, recommendationStats, personaStats] = await Promise.all([
        this.observabilityService.getPerformanceStats('mood_selection', 1),
        this.observabilityService.getPerformanceStats('recommendation_generate', 1),
        this.observabilityService.getPerformanceStats('persona_update', 1)
      ])

      const performanceData = {
        timestamp: new Date(),
        operations: {
          moodSelection: moodStats,
          recommendation: recommendationStats,
          personaUpdate: personaStats
        },
        summary: {
          totalOperations: moodStats.totalOperations + recommendationStats.totalOperations + personaStats.totalOperations,
          avgResponseTime: (moodStats.avgDuration + recommendationStats.avgDuration + personaStats.avgDuration) / 3,
          overallSuccessRate: (moodStats.successRate + recommendationStats.successRate + personaStats.successRate) / 3
        }
      }

      this.io.to('performance-updates').emit('performance:update', performanceData)
    } catch (error) {
      console.error('❌ Failed to broadcast performance updates:', error)
    }
  }

  /**
   * Broadcast mood-persona updates
   */
  private async broadcastMoodPersonaUpdates(): Promise<void> {
    try {
      const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString() // Last hour
      
      // Get recent mood selections
      const recentMoodSelections = await (this.observabilityService as any).db.all(`
        SELECT primaryMood, COUNT(*) as count, AVG(intensity) as avgIntensity
        FROM mood_selections 
        WHERE timestamp > ?
        GROUP BY primaryMood
        ORDER BY count DESC
        LIMIT 5
      `, [cutoff])

      // Get recent user actions
      const recentActions = await (this.observabilityService as any).db.all(`
        SELECT type, COUNT(*) as count
        FROM user_actions 
        WHERE timestamp > ?
        GROUP BY type
        ORDER BY count DESC
      `, [cutoff])

      const moodPersonaData = {
        timestamp: new Date(),
        moodPatterns: recentMoodSelections,
        actionPatterns: recentActions,
        activeUsers: await (this.observabilityService as any).db.get(`
          SELECT COUNT(DISTINCT userId) as count 
          FROM mood_selections 
          WHERE timestamp > ?
        `, [cutoff])
      }

      this.io.to('mood-persona-updates').emit('mood-persona:update', moodPersonaData)
    } catch (error) {
      console.error('❌ Failed to broadcast mood-persona updates:', error)
    }
  }

  /**
   * Send health update to specific client
   */
  private async sendHealthUpdate(socket: any): Promise<void> {
    try {
      const health = await this.observabilityService.captureSystemHealth()
      socket.emit('health:update', health)
    } catch (error) {
      socket.emit('error', { message: 'Failed to fetch health data', error: (error as Error).message })
    }
  }

  /**
   * Broadcast system-wide alert
   */
  public broadcastAlert(alert: any): void {
    this.io.emit('alert:broadcast', alert)
    this.io.to('alert-updates').emit('alert:new', alert)
  }

  /**
   * Get connected clients count
   */
  public getConnectedClientsCount(): number {
    return this.connectedClients.size
  }

  /**
   * Get monitoring status
   */
  public getMonitoringStatus(): {
    isActive: boolean
    connectedClients: number
    lastUpdate: Date | null
    uptime: number
  } {
    return {
      isActive: !!this.monitoringInterval,
      connectedClients: this.connectedClients.size,
      lastUpdate: this.lastHealthMetrics ? new Date(this.lastHealthMetrics.timestamp) : null,
      uptime: process.uptime()
    }
  }

  /**
   * Stop monitoring
   */
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
      console.log('⏹️ Real-time monitoring stopped')
    }
  }

  /**
   * Graceful shutdown
   */
  public async shutdown(): Promise<void> {
    console.log('🔄 Shutting down real-time monitoring service...')
    
    this.stopMonitoring()
    
    // Disconnect all clients
    this.io.emit('system:shutdown', { message: 'System shutting down for maintenance' })
    
    // Close socket.io server
    return new Promise((resolve) => {
      this.io.close(() => {
        console.log('✅ Real-time monitoring service shut down')
        resolve()
      })
    })
  }
}
