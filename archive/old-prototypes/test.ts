import { Router, Request, Response } from 'express'

const router = Router()

// Simple test route to verify Steam auth is working
router.get('/test', (req: Request, res: Response) => {
  console.log('🧪 Steam auth test route hit')
  res.json({ 
    message: 'Steam auth is working',
    timestamp: new Date().toISOString(),
    env: {
      STEAM_API_KEY: process.env.STEAM_API_KEY ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV
    }
  })
})

export default router
