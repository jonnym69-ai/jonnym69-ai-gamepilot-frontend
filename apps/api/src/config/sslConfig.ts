import https from 'https'
import fs from 'fs/promises'
import path from 'path'

// SSL/HTTPS Configuration for Production
export const sslConfig = {
  certPath: process.env.SSL_CERT_PATH || './certificates/server.crt',
  keyPath: process.env.SSL_KEY_PATH || './certificates/server.key',
  caPath: process.env.SSL_CA_PATH || './certificates/ca.crt',
  
  options: {
    allowHTTP1: true,
    minVersion: 'TLSv1.2',
    honorCipherOrder: true
  }
}

// SSL Certificate validation
export async function validateSSLCertificates() {
  try {
    console.log('🔒 Validating SSL certificates...')
    
    const certExists = await fileExists(sslConfig.certPath)
    const keyExists = await fileExists(sslConfig.keyPath)
    
    if (!certExists) {
      throw new Error(`SSL certificate not found at ${sslConfig.certPath}`)
    }
    
    if (!keyExists) {
      throw new Error(`SSL private key not found at ${sslConfig.keyPath}`)
    }
    
    const cert = await fs.readFile(sslConfig.certPath, 'utf8')
    const key = await fs.readFile(sslConfig.keyPath, 'utf8')
    
    if (!cert.includes('BEGIN CERTIFICATE')) {
      throw new Error('Invalid SSL certificate format')
    }
    
    if (!key.includes('BEGIN PRIVATE KEY')) {
      throw new Error('Invalid SSL private key format')
    }
    
    console.log('✅ SSL certificates validated successfully')
    
    return { cert, key }
  } catch (error) {
    console.error('❌ SSL certificate validation failed:', error)
    throw new Error(`SSL certificate validation failed: ${error}`)
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

// Create HTTPS server
export function createHTTPSServer(app: any, options: https.ServerOptions = {}) {
  return https.createServer(options, app)
}
