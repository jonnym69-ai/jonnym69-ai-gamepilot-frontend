import { Database } from 'sqlite'
import * as jwt from 'jsonwebtoken'
import type { Request } from 'express'
import { databaseService } from './database'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Validate JWT secret in production
if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'your-secret-key-change-in-production') {
  throw new Error('CRITICAL: JWT_SECRET must be set in production environment')
}

if (JWT_SECRET.length < 32) {
  console.warn('WARNING: JWT_SECRET should be at least 32 characters long for security')
}

export interface SessionData {
  token: string
  userId: string
  createdAt: Date
  expiresAt: Date
  lastAccessed: Date
  userAgent?: string
  ipAddress?: string
}

export class SessionService {
  /**
   * Create a new session in the database
   */
  async createSession(
    userId: string, 
    userAgent?: string, 
    ipAddress?: string
  ): Promise<SessionData> {
    const token = jwt.sign(
      { 
        id: userId,
        type: 'session'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    const now = new Date()
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const sessionData: SessionData = {
      token,
      userId,
      createdAt: now,
      expiresAt,
      lastAccessed: now,
      userAgent,
      ipAddress
    }

    // Store session in database
    await databaseService.createSession(sessionData)

    console.log('✅ Session created for user:', userId)
    return sessionData
  }

  /**
   * Validate and refresh a session
   */
  async validateSession(token: string): Promise<SessionData | null> {
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as any
      if (decoded.type !== 'session') {
        return null
      }

      // Check if session exists in database and is not expired
      const session = await databaseService.getSession(token)
      if (!session) {
        console.log('❌ Session not found in database')
        return null
      }

      const now = new Date()
      const expiresAt = new Date(session.expiresAt)

      if (now > expiresAt) {
        console.log('❌ Session expired')
        await this.deleteSession(token)
        return null
      }

      // Update last accessed time
      await this.updateLastAccessed(token)

      return {
        token: session.token,
        userId: session.userId,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        lastAccessed: session.lastAccessed,
        userAgent: session.userAgent,
        ipAddress: session.ipAddress
      }
    } catch (error) {
      console.error('❌ Session validation error:', error)
      return null
    }
  }

  /**
   * Update session last accessed time
   */
  private async updateLastAccessed(token: string): Promise<void> {
    const session = await databaseService.getSession(token)
    if (session) {
      await databaseService.updateSession({
        ...session,
        lastAccessed: new Date()
      })
    }
  }

  /**
   * Delete a session
   */
  async deleteSession(token: string): Promise<void> {
    await databaseService.deleteSession(token)
    console.log('🗑️ Session deleted')
  }

  /**
   * Delete all sessions for a user
   */
  async deleteAllUserSessions(userId: string): Promise<void> {
    await databaseService.deleteAllUserSessions(userId)
    console.log('🗑️ All sessions deleted for user:', userId)
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    const deletedCount = await databaseService.deleteExpiredSessions()
    
    if (deletedCount > 0) {
      console.log('🧹 Cleaned up expired sessions:', deletedCount)
    }
    
    return deletedCount
  }

  /**
   * Get active sessions for a user
   */
  async getUserSessions(userId: string): Promise<SessionData[]> {
    // Use getAll to query sessions directly
    const sessions = await databaseService.getAll(
      'SELECT * FROM sessions WHERE userId = ? AND expiresAt > ? ORDER BY lastAccessed DESC',
      [userId, new Date().toISOString()]
    )

    return sessions.map(session => ({
      token: session.token,
      userId: session.userId,
      createdAt: new Date(session.createdAt),
      expiresAt: new Date(session.expiresAt),
      lastAccessed: new Date(session.lastAccessed),
      userAgent: session.userAgent,
      ipAddress: session.ipAddress
    }))
  }

  /**
   * Get session from request
   */
  async getSessionFromRequest(req: Request): Promise<SessionData | null> {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN
    
    // Also check for token in cookie
    const cookieToken = req.cookies?.token
    const authToken = token || cookieToken

    if (!authToken) {
      return null
    }

    return await this.validateSession(authToken)
  }
}

// Export singleton instance
export const sessionService = new SessionService()
