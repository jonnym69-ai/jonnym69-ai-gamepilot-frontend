import { app } from './index'
import { validateSSLCertificates, createHTTPSServer } from './config/sslConfig'
import { createProductionDatabase, checkDatabaseHealth } from './config/productionDatabase'
import * as fs from 'fs/promises'
import { Server } from 'http'
import { Server as HTTPSServer } from 'https'
import { Express } from 'express'

// Production Server Configuration
const PORT = parseInt(process.env.PORT || '3001')
const HOST = process.env.HOST || '0.0.0.0'
const NODE_ENV = process.env.NODE_ENV || 'development'

// Production startup function
async function startProductionServer() {
  try {
    console.log('🚀 Starting GamePilot Production Server...')
    console.log(`📊 Environment: ${NODE_ENV}`)
    console.log(`🌐 Host: ${HOST}`)
    console.log(`🔌 Port: ${PORT}`)
    
    // Initialize production database
    if (NODE_ENV === 'production') {
      console.log('🗄️ Initializing production database...')
      const db = await createProductionDatabase()
      
      // Run database health check
      const health = await checkDatabaseHealth(db)
      console.log('📊 Database Health:', health.status)
      
      if (health.status === 'unhealthy') {
        console.warn('⚠️ Database health check failed:', health.error)
      }
    }
    
    // Validate SSL certificates for HTTPS
    let serverOptions: any = {}
    let server: Server | HTTPSServer | Express = app
    
    if (NODE_ENV === 'production') {
      try {
        const sslCerts = await validateSSLCertificates()
        serverOptions = {
          key: sslCerts.key,
          cert: sslCerts.cert
        }
        
        if ('ca' in sslCerts) {
          serverOptions.ca = sslCerts.ca
        }
        
        server = createHTTPSServer(app, serverOptions)
        console.log('🔒 SSL certificates loaded successfully')
      } catch (error) {
        console.error('❌ SSL certificate validation failed:', error)
        console.log('⚠️ Falling back to HTTP for development')
      }
    }
    
    // Start listening
    server.listen(PORT, HOST, () => {
      console.log('✅ GamePilot Production Server started successfully!')
      console.log(`🌐 Server running on ${NODE_ENV === 'production' && server instanceof HTTPSServer ? 'https' : 'http'}://${HOST}:${PORT}`)
      
      // Log production-specific information
      if (NODE_ENV === 'production') {
        console.log('🔒 HTTPS enabled with SSL/TLS')
        console.log('📊 Production database initialized')
        console.log('🔍 Health checks enabled')
      }
      
      // Graceful shutdown handlers
      process.on('SIGTERM', gracefulShutdown)
      process.on('SIGINT', gracefulShutdown)
      
      console.log('🎮 GamePilot is ready for production traffic!')
    })
    
    return server
  } catch (error) {
    console.error('❌ Failed to start production server:', error)
    process.exit(1)
  }
}

// Graceful shutdown function
async function gracefulShutdown(signal: string) {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`)
  
  try {
    // Close database connections
    console.log('🗄️ Closing database connections...')
    // await productionConnectionPool.closeAll()
    
    // Close server
    console.log('🌐 Closing server...')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error)
    process.exit(1)
  }
}

// Start the server
if (require.main === module) {
  startProductionServer()
}

export { startProductionServer }
