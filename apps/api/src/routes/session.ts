import { Router, Request, Response } from 'express'
import { databaseService } from '../services/database'
import { getSession } from '../auth/sessionStore'

const router = Router()

/**
 * GET /me
 * Get current user from session token
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    // Get session token from Authorization header or query parameter
    const sessionToken = req.headers.authorization?.replace('Bearer ', '') || 
                       req.query.token as string ||
                       (req as any).session?.sessionToken

    if (!sessionToken) {
      return res.status(401).json({
        error: 'No session token provided',
        message: 'Authentication required'
      })
    }

    // Validate session
    const session = await getSession(sessionToken)
    if (!session) {
      return res.status(401).json({
        error: 'Invalid or expired session',
        message: 'Please login again'
      })
    }

    // Get user from database
    const user = await databaseService.getUserById(session.userId)
    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        message: 'Please login again'
      })
    }

    console.log('👤 Session validated for user:', user.id)
    res.json({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        // Steam fields are stored as custom fields or in integrations
        steamId: (user as any).steamId,
        personaName: (user as any).personaName
      }
    })
  } catch (error) {
    console.error('❌ Failed to get current user:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get current user'
    })
  }
})

export default router
