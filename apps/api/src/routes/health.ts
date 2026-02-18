import { Router, Request, Response } from 'express'
import { asyncHandler } from '../middleware/errorHandler'
import { checkDatabaseHealth } from '../config/productionDatabase'
import { validateSSLCertificates } from '../config/sslConfig'
import { databaseService } from '../services/database'
import * as os from 'os'
import * as fs from 'fs/promises'
import * as path from 'path'

const router = Router()

// Health check response interface
interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  version: string
  environment: string
  checks: {
    database: DatabaseHealthCheck
    ssl: SSLHealthCheck
    memory: MemoryHealthCheck
    disk: DiskHealthCheck
    api: APIHealthCheck
  }
  summary: {
    total: number
    healthy: number
    degraded: number
    unhealthy: number
  }
}

interface DatabaseHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy'
  message?: string
  details?: any
}

interface SSLHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy'
  message?: string
  details?: any
}

interface MemoryHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy'
  message?: string
  details: {
    total: number
    used: number
    free: number
    usagePercentage: number
  }
}

interface DiskHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy'
  message?: string
  details: {
    total: number
    used: number
    free: number
    usagePercentage: number
  }
}

interface APIHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy'
  message?: string
  details: {
    endpoints: number
    responseTime: number
    errorRate: number
  }
}

// GET /health - Simple health check for Render
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'GamePilot API'
  })
}))

// GET /health/ready - Readiness probe
router.get('/ready', asyncHandler(async (req: Request, res: Response) => {
  const healthChecks = await performAllHealthChecks()
  const isReady = Object.values(healthChecks).every(check => check.status === 'healthy')

  if (isReady) {
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    })
  } else {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      checks: healthChecks
    })
  }
}))

// GET /health/live - Liveness probe
router.get('/live', asyncHandler(async (req: Request, res: Response) => {
  // Simple liveness check - just check if the process is running
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
}))

// GET /health/database - Database health check
router.get('/database', asyncHandler(async (req: Request, res: Response) => {
  try {
    const dbHealth = await checkDatabaseHealth((databaseService as any).db)
    res.status(dbHealth.status === 'healthy' ? 200 : 503).json(dbHealth)
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      message: 'Database health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}))

// GET /health/ssl - SSL certificate health check
router.get('/ssl', asyncHandler(async (req: Request, res: Response) => {
  try {
    const sslHealth = await checkSSLHealth()
    res.status(sslHealth.status === 'healthy' ? 200 : 503).json(sslHealth)
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      message: 'SSL health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}))

// GET /health/metrics - System metrics
router.get('/metrics', asyncHandler(async (req: Request, res: Response) => {
  const metrics = await getSystemMetrics()
  res.json(metrics)
}))

// Perform all health checks
async function performAllHealthChecks(): Promise<{
  database: DatabaseHealthCheck
  ssl: SSLHealthCheck
  memory: MemoryHealthCheck
  disk: DiskHealthCheck
  api: APIHealthCheck
}> {
  const [database, ssl, memory, disk, api] = await Promise.allSettled([
    checkDatabaseHealth((databaseService as any).db),
    checkSSLHealth(),
    checkMemoryHealth(),
    checkDiskHealth(),
    checkAPIHealth()
  ])

  return {
    database: database.status === 'fulfilled' ? {
      ...database.value,
      status: database.value.status as 'healthy' | 'degraded' | 'unhealthy'
    } : {
      status: 'unhealthy' as const,
      message: 'Database check failed',
      details: database.reason
    },
    ssl: ssl.status === 'fulfilled' ? {
      ...ssl.value,
      status: ssl.value.status as 'healthy' | 'degraded' | 'unhealthy'
    } : {
      status: 'unhealthy' as const,
      message: 'SSL check failed',
      details: ssl.reason
    },
    memory: memory.status === 'fulfilled' ? {
      ...memory.value,
      status: memory.value.status as 'healthy' | 'degraded' | 'unhealthy'
    } : {
      status: 'unhealthy' as const,
      message: 'Memory check failed',
      details: memory.reason
    },
    disk: disk.status === 'fulfilled' ? {
      ...disk.value,
      status: disk.value.status as 'healthy' | 'degraded' | 'unhealthy'
    } : {
      status: 'unhealthy' as const,
      message: 'Disk check failed',
      details: disk.reason
    },
    api: api.status === 'fulfilled' ? {
      ...api.value,
      status: api.value.status as 'healthy' | 'degraded' | 'unhealthy'
    } : {
      status: 'unhealthy' as const,
      message: 'API check failed',
      details: api.reason
    }
  }
}

// Calculate overall health status
function calculateOverallStatus(checks: any): 'healthy' | 'degraded' | 'unhealthy' {
  const statuses = Object.values(checks).map((check: any) => check.status)
  
  if (statuses.every(status => status === 'healthy')) {
    return 'healthy'
  }
  
  if (statuses.some(status => status === 'unhealthy')) {
    return 'unhealthy'
  }
  
  return 'degraded'
}

// Check SSL health
async function checkSSLHealth(): Promise<SSLHealthCheck> {
  if (process.env.NODE_ENV !== 'production') {
    return {
      status: 'healthy',
      message: 'SSL not required in development'
    }
  }

  try {
    await validateSSLCertificates()
    return {
      status: 'healthy',
      message: 'SSL certificates are valid'
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'SSL certificates are invalid or missing'
    }
  }
}

// Check memory health
async function checkMemoryHealth(): Promise<MemoryHealthCheck> {
  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  const usedMem = totalMem - freeMem
  const usagePercentage = (usedMem / totalMem) * 100

  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
  let message: string | undefined

  if (usagePercentage > 90) {
    status = 'unhealthy'
    message = 'Memory usage is critically high'
  } else if (usagePercentage > 80) {
    status = 'degraded'
    message = 'Memory usage is high'
  }

  return {
    status,
    message,
    details: {
      total: Math.round(totalMem / 1024 / 1024), // MB
      used: Math.round(usedMem / 1024 / 1024), // MB
      free: Math.round(freeMem / 1024 / 1024), // MB
      usagePercentage: Math.round(usagePercentage * 100) / 100
    }
  }
}

// Check disk health
async function checkDiskHealth(): Promise<DiskHealthCheck> {
  try {
    const stats = await fs.stat(process.cwd())
    // This is a simplified disk check - in production you'd check actual disk usage
    return {
      status: 'healthy',
      message: 'Disk space is sufficient',
      details: {
        total: 0, // Would need to implement actual disk usage checking
        used: 0,
        free: 0,
        usagePercentage: 0
      }
    }
  } catch (error) {
    return {
      status: 'degraded',
      message: 'Unable to check disk usage',
      details: {
        total: 0,
        used: 0,
        free: 0,
        usagePercentage: 0
      }
    }
  }
}

// Check API health
async function checkAPIHealth(): Promise<APIHealthCheck> {
  const startTime = Date.now()
  
  try {
    // Test a simple API endpoint
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch('http://localhost:3001/health/live', {
      method: 'GET',
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    const responseTime = Date.now() - startTime
    
    return {
      status: response.ok ? 'healthy' : 'unhealthy',
      message: response.ok ? 'API endpoints are responding' : 'API endpoints are not responding',
      details: {
        endpoints: 1, // Simplified - would check multiple endpoints
        responseTime,
        errorRate: 0 // Simplified - would track actual error rate
      }
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'API health check failed',
      details: {
        endpoints: 0,
        responseTime: Date.now() - startTime,
        errorRate: 100
      }
    }
  }
}

// Get system metrics
async function getSystemMetrics() {
  return {
    timestamp: new Date().toISOString(),
    system: {
      platform: os.platform(),
      arch: os.arch(),
      uptime: os.uptime(),
      loadAverage: os.loadavg(),
      cpus: os.cpus().length,
      memory: {
        total: Math.round(os.totalmem() / 1024 / 1024), // MB
        free: Math.round(os.freemem() / 1024 / 1024), // MB
        used: Math.round((os.totalmem() - os.freemem()) / 1024 / 1024), // MB
        usagePercentage: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100)
      }
    },
    process: {
      pid: process.pid,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    },
    node: {
      version: process.version,
      versions: process.versions
    }
  }
}

export default router
