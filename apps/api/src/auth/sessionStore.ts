import crypto from 'crypto'
import { databaseService } from '../services/database'

// Session interface for database storage
export interface SessionData {
  token: string
  userId: string
  createdAt: Date
  expiresAt: Date
  lastAccessed: Date
  userAgent?: string
  ipAddress?: string
}

/**
 * Generate a secure session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Create a new session with database persistence
 */
export async function createSession(userId: string, userAgent?: string, ipAddress?: string): Promise<string> {
  const sessionToken = generateSessionToken()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
  
  const sessionData: SessionData = {
    token: sessionToken,
    userId,
    createdAt: now,
    expiresAt,
    lastAccessed: now,
    userAgent,
    ipAddress
  }
  
  try {
    // Store session in database for persistence
    await databaseService.createSession(sessionData)
    
    // Clean up expired sessions
    await cleanupExpiredSessions()
    
    console.log('🔐 Session created and persisted for user:', userId)
    return sessionToken
  } catch (error) {
    console.error('❌ Failed to create session:', error)
    throw new Error('Session creation failed')
  }
}

/**
 * Get session by token with database lookup
 */
export async function getSession(sessionToken: string, userAgent?: string, ipAddress?: string): Promise<SessionData | null> {
  try {
    const session = await databaseService.getSession(sessionToken)
    
    if (!session) {
      return null
    }
    
    if (session.expiresAt < new Date()) {
      await deleteSession(sessionToken)
      return null
    }
    
    // Update last accessed time
    session.lastAccessed = new Date()
    if (userAgent) session.userAgent = userAgent
    if (ipAddress) session.ipAddress = ipAddress
    
    await databaseService.updateSession(session)
    
    return session
  } catch (error) {
    console.error('❌ Failed to get session:', error)
    return null
  }
}

/**
 * Delete session from database
 */
export async function deleteSession(sessionToken: string): Promise<boolean> {
  try {
    const deleted = await databaseService.deleteSession(sessionToken)
    if (deleted) {
      console.log('🗑️ Session deleted from database:', sessionToken)
    }
    return deleted
  } catch (error) {
    console.error('❌ Failed to delete session:', error)
    return false
  }
}

/**
 * Delete all sessions for a user (for logout all devices)
 */
export async function deleteAllUserSessions(userId: string): Promise<number> {
  try {
    const deletedCount = await databaseService.deleteAllUserSessions(userId)
    console.log(`🗑️ Deleted ${deletedCount} sessions for user:`, userId)
    return deletedCount
  } catch (error) {
    console.error('❌ Failed to delete all user sessions:', error)
    return 0
  }
}

/**
 * Clean up expired sessions from database
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const deletedCount = await databaseService.deleteExpiredSessions()
    if (deletedCount > 0) {
      console.log(`🧹 Cleaned up ${deletedCount} expired sessions`)
    }
    return deletedCount
  } catch (error) {
    console.error('❌ Failed to cleanup expired sessions:', error)
    return 0
  }
}

/**
 * Get active sessions count for a user
 */
export async function getUserSessionCount(userId: string): Promise<number> {
  try {
    return await databaseService.getUserSessionCount(userId)
  } catch (error) {
    console.error('❌ Failed to get user session count:', error)
    return 0
  }
}

/**
 * Validate session and return user ID
 */
export async function validateSession(sessionToken: string, userAgent?: string, ipAddress?: string): Promise<string | null> {
  const session = await getSession(sessionToken, userAgent, ipAddress)
  return session ? session.userId : null
}

// Legacy in-memory session store for fallback (development only)
const fallbackSessionStore = new Map<string, { userId: string; createdAt: Date; expiresAt: Date }>()

/**
 * Fallback session creation for development (when database is not available)
 */
export function createFallbackSession(userId: string): string {
  const sessionToken = generateSessionToken()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
  
  fallbackSessionStore.set(sessionToken, {
    userId,
    createdAt: now,
    expiresAt
  })
  
  console.log('🔐 Fallback session created for user:', userId)
  return sessionToken
}

/**
 * Fallback session retrieval for development
 */
export function getFallbackSession(sessionToken: string): { userId: string; createdAt: Date; expiresAt: Date } | null {
  const session = fallbackSessionStore.get(sessionToken)
  
  if (!session) {
    return null
  }
  
  if (session.expiresAt < new Date()) {
    fallbackSessionStore.delete(sessionToken)
    return null
  }
  
  return session
}

/**
 * Fallback session deletion for development
 */
export function deleteFallbackSession(sessionToken: string): boolean {
  const deleted = fallbackSessionStore.delete(sessionToken)
  if (deleted) {
    console.log('🗑️ Fallback session deleted:', sessionToken)
  }
  return deleted
}
