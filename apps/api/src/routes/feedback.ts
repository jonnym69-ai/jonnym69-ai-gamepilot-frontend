import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../middleware/errorHandler'
import * as fs from 'fs/promises'
import * as path from 'path'

const router = Router()

// Feedback data schema
const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'general', 'improvement']),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description too long'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  userAgent: z.string(),
  url: z.string(),
  timestamp: z.string(),
  userId: z.string().optional()
})

// Simple file-based feedback storage for beta
const FEEDBACK_FILE = path.join(__dirname, '../../data/feedback.json')

// POST /api/feedback
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('📝 Beta feedback submission received:', req.body.type)
    
    // Validate request body
    const validatedData = feedbackSchema.parse(req.body)
    
    // Create feedback entry
    const feedback = {
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...validatedData,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Ensure data directory exists
    const dataDir = path.dirname(FEEDBACK_FILE)
    try {
      await fs.access(dataDir)
    } catch {
      await fs.mkdir(dataDir, { recursive: true })
    }
    
    // Read existing feedback
    let existingFeedback = []
    try {
      const data = await fs.readFile(FEEDBACK_FILE, 'utf-8')
      existingFeedback = JSON.parse(data)
    } catch {
      // File doesn't exist, start with empty array
    }
    
    // Add new feedback
    existingFeedback.push(feedback)
    
    // Save to file
    await fs.writeFile(FEEDBACK_FILE, JSON.stringify(existingFeedback, null, 2))
    
    console.log('✅ Beta feedback saved successfully:', feedback.id)
    
    // Log feedback for monitoring
    console.log('📊 Beta Feedback Stats:', {
      type: feedback.type,
      hasEmail: !!feedback.email,
      hasUserId: !!feedback.userId,
      timestamp: feedback.timestamp
    })
    
    res.status(201).json({
      success: true,
      message: 'Beta feedback submitted successfully',
      feedbackId: feedback.id
    })
    
  } catch (error) {
    console.error('❌ Beta feedback submission error:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to submit beta feedback',
      message: 'Please try again later'
    })
  }
}))

// GET /api/feedback (admin only - for beta dashboard)
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  try {
    let feedback = []
    try {
      const data = await fs.readFile(FEEDBACK_FILE, 'utf-8')
      feedback = JSON.parse(data)
    } catch {
      // File doesn't exist
    }
    
    // Sort by creation date (newest first)
    feedback.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    res.json({
      success: true,
      data: feedback,
      total: feedback.length
    })
    
  } catch (error) {
    console.error('❌ Error fetching beta feedback:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch beta feedback'
    })
  }
}))

// GET /api/feedback/stats (admin only)
router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  try {
    let feedback = []
    try {
      const data = await fs.readFile(FEEDBACK_FILE, 'utf-8')
      feedback = JSON.parse(data)
    } catch {
      // File doesn't exist
    }
    
    // Calculate stats
    const totalStats = feedback.reduce((acc: any, item: any) => {
      acc[item.type] = (acc[item.type] || 0) + 1
      return acc
    }, {})
    
    const recentFeedback = feedback.filter((item: any) => {
      const createdAt = new Date(item.createdAt)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return createdAt >= thirtyDaysAgo
    })
    
    res.json({
      success: true,
      data: {
        totalStats,
        totalFeedback: feedback.length,
        recentFeedback: recentFeedback.length
      }
    })
    
  } catch (error) {
    console.error('❌ Error fetching beta feedback stats:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch beta feedback stats'
    })
  }
}))

export default router
