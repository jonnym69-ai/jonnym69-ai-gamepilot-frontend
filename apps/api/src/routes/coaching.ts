import { Router } from 'express'
import { authenticateToken } from '../auth/authService'
import { databaseService } from '../services/database'
import { ollamaService } from '../services/ollamaService'

const router = Router()

// Apply authentication to all coaching routes
router.use(authenticateToken)

/**
 * GET /api/coaching/goals - Get user's gaming goals
 */
router.get('/goals', async (req, res) => {
  try {
    const userId = (req as any).user.id

    if (!databaseService.db) {
      return res.status(500).json({ error: 'Database not available' })
    }

    const goals = await databaseService.db.all(
      'SELECT * FROM user_goals WHERE user_id = ? ORDER BY priority DESC, created_at DESC',
      [userId]
    )

    res.json({ goals })
  } catch (error) {
    console.error('Error fetching goals:', error)
    res.status(500).json({ error: 'Failed to fetch goals' })
  }
})

/**
 * POST /api/coaching/goals - Create a new gaming goal
 */
router.post('/goals', async (req, res) => {
  try {
    const userId = (req as any).user.id
    const { goalType, title, description, targetValue, priority, deadline } = req.body

    if (!title || !goalType) {
      return res.status(400).json({ error: 'Goal type and title are required' })
    }

    const goalId = `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    if (!databaseService.db) {
      return res.status(500).json({ error: 'Database not available' })
    }

    await databaseService.db.run(
      `INSERT INTO user_goals (
        id, user_id, goal_type, title, description, target_value, priority, deadline, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        goalId,
        userId,
        goalType,
        title,
        description || null,
        targetValue || null,
        priority || 'medium',
        deadline ? new Date(deadline).toISOString() : null,
        new Date().toISOString(),
        new Date().toISOString()
      ]
    )

    // Fetch the created goal
    const goal = await databaseService.db.get('SELECT * FROM user_goals WHERE id = ?', [goalId])

    res.status(201).json({ goal })
  } catch (error) {
    console.error('Error creating goal:', error)
    res.status(500).json({ error: 'Failed to create goal' })
  }
})

/**
 * PUT /api/coaching/goals/:goalId - Update a goal
 */
router.put('/goals/:goalId', async (req, res) => {
  try {
    const userId = (req as any).user.id
    const { goalId } = req.params
    const updates = req.body

    if (!databaseService.db) {
      return res.status(500).json({ error: 'Database not available' })
    }

    // Verify ownership
    const existingGoal = await databaseService.db.get(
      'SELECT * FROM user_goals WHERE id = ? AND user_id = ?',
      [goalId, userId]
    )

    if (!existingGoal) {
      return res.status(404).json({ error: 'Goal not found' })
    }

    const updateFields = []
    const updateValues = []

    if (updates.title !== undefined) {
      updateFields.push('title = ?')
      updateValues.push(updates.title)
    }
    if (updates.description !== undefined) {
      updateFields.push('description = ?')
      updateValues.push(updates.description)
    }
    if (updates.targetValue !== undefined) {
      updateFields.push('target_value = ?')
      updateValues.push(updates.targetValue)
    }
    if (updates.currentValue !== undefined) {
      updateFields.push('current_value = ?')
      updateValues.push(updates.currentValue)
    }
    if (updates.priority !== undefined) {
      updateFields.push('priority = ?')
      updateValues.push(updates.priority)
    }
    if (updates.status !== undefined) {
      updateFields.push('status = ?')
      updateValues.push(updates.status)
      if (updates.status === 'completed') {
        updateFields.push('completed_at = ?')
        updateValues.push(new Date().toISOString())
      }
    }
    if (updates.deadline !== undefined) {
      updateFields.push('deadline = ?')
      updateValues.push(updates.deadline ? new Date(updates.deadline).toISOString() : null)
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid updates provided' })
    }

    updateFields.push('updated_at = ?')
    updateValues.push(new Date().toISOString())
    updateValues.push(goalId)

    await databaseService.db.run(
      `UPDATE user_goals SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    )

    const updatedGoal = await databaseService.db.get('SELECT * FROM user_goals WHERE id = ?', [goalId])

    res.json({ goal: updatedGoal })
  } catch (error) {
    console.error('Error updating goal:', error)
    res.status(500).json({ error: 'Failed to update goal' })
  }
})

/**
 * DELETE /api/coaching/goals/:goalId - Delete a goal
 */
router.delete('/goals/:goalId', async (req, res) => {
  try {
    const userId = (req as any).user.id
    const { goalId } = req.params

    if (!databaseService.db) {
      return res.status(500).json({ error: 'Database not available' })
    }

    // Verify ownership
    const goal = await databaseService.db.get(
      'SELECT * FROM user_goals WHERE id = ? AND user_id = ?',
      [goalId, userId]
    )

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' })
    }

    await databaseService.db.run('DELETE FROM user_goals WHERE id = ?', [goalId])

    res.json({ message: 'Goal deleted successfully' })
  } catch (error) {
    console.error('Error deleting goal:', error)
    res.status(500).json({ error: 'Failed to delete goal' })
  }
})

/**
 * POST /api/coaching/weekly-plan - Generate a personalized weekly play plan
 */
router.post('/weekly-plan', async (req, res) => {
  try {
    const userId = (req as any).user.id
    const { availableTime, preferredGenres } = req.body

    if (!databaseService.db) {
      return res.status(500).json({ error: 'Database not available' })
    }

    // Gather user context for AI
    const goals = await databaseService.db.all(
      'SELECT goal_type, title, description, priority FROM user_goals WHERE user_id = ? AND status = ? ORDER BY priority DESC',
      [userId, 'active']
    )

    // Get recent mood history (last 7 days)
    const moodHistory = await databaseService.db.all(
      'SELECT currentMood as mood, lastActive as timestamp FROM users WHERE id = ?',
      [userId]
    )

    // Get recent gaming sessions (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentSessions = await databaseService.db.all(`
      SELECT
        gs.gameId,
        g.title as gameName,
        g.genres,
        g.difficulty,
        COUNT(gs.id) as sessions,
        MAX(gs.endedAt) as lastPlayed
      FROM game_sessions gs
      JOIN games g ON gs.gameId = g.id
      WHERE gs.userId = ? AND gs.startedAt > ?
      GROUP BY gs.gameId, g.title, g.genres, g.difficulty
      ORDER BY sessions DESC
      LIMIT 10
    `, [userId, thirtyDaysAgo.toISOString()])

    // Get current streak from gaming profile
    const userProfile = await databaseService.db.get('SELECT gaming_profile FROM users WHERE id = ?', [userId])
    const gamingProfile = userProfile?.gaming_profile ? JSON.parse(userProfile.gaming_profile) : {}
    const currentStreak = gamingProfile.currentStreak || 0

    const userContext = {
      goals,
      moodHistory: moodHistory.map(m => ({ mood: m.mood, timestamp: m.timestamp })),
      recentGames: recentSessions.map(s => ({
        gameId: s.gameId,
        gameName: s.gameName,
        genres: s.genres ? JSON.parse(s.genres) : [],
        difficulty: s.difficulty || 'moderate',
        sessions: s.sessions,
        lastPlayed: s.lastPlayed
      })),
      availableTime: availableTime || 10, // default 10 hours/week
      preferredGenres,
      currentStreak
    }

    // Generate the plan using AI
    const plan = await ollamaService.generateWeeklyPlayPlan(userContext)

    // Save the plan to database
    const planId = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start of week (Sunday)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6) // End of week (Saturday)

    await databaseService.db.run(`
      INSERT INTO weekly_play_plans (
        id, user_id, week_start, week_end, theme, recommendations, goals_alignment,
        mood_focus, generated_at, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      planId,
      userId,
      weekStart.toISOString(),
      weekEnd.toISOString(),
      plan.theme,
      JSON.stringify(plan.recommendations),
      JSON.stringify(plan.goalsAlignment),
      JSON.stringify({ tips: plan.weeklyTips }),
      new Date().toISOString(),
      1
    ])

    res.json({ plan: { ...plan, id: planId } })
  } catch (error) {
    console.error('Error generating weekly plan:', error)
    res.status(500).json({ error: 'Failed to generate weekly plan' })
  }
})

/**
 * GET /api/coaching/weekly-plan - Get current active weekly plan
 */
router.get('/weekly-plan', async (req, res) => {
  try {
    const userId = (req as any).user.id

    if (!databaseService.db) {
      return res.status(500).json({ error: 'Database not available' })
    }

    const plan = await databaseService.db.get(
      'SELECT * FROM weekly_play_plans WHERE user_id = ? AND is_active = 1 ORDER BY generated_at DESC LIMIT 1',
      [userId]
    )

    if (!plan) {
      return res.json({ plan: null })
    }

    // Parse JSON fields
    const parsedPlan = {
      ...plan,
      recommendations: JSON.parse(plan.recommendations),
      goalsAlignment: JSON.parse(plan.goals_alignment),
      moodFocus: JSON.parse(plan.mood_focus)
    }

    res.json({ plan: parsedPlan })
  } catch (error) {
    console.error('Error fetching weekly plan:', error)
    res.status(500).json({ error: 'Failed to fetch weekly plan' })
  }
})

/**
 * POST /api/coaching/goal-recommendations - Get AI recommendations for a specific goal
 */
router.post('/goal-recommendations', async (req, res) => {
  try {
    const userId = (req as any).user.id
    const { goalId } = req.body

    if (!goalId) {
      return res.status(400).json({ error: 'Goal ID is required' })
    }

    if (!databaseService.db) {
      return res.status(500).json({ error: 'Database not available' })
    }

    // Get the goal
    const goal = await databaseService.db.get(
      'SELECT * FROM user_goals WHERE id = ? AND user_id = ?',
      [goalId, userId]
    )

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' })
    }

    // Get user's owned games
    const ownedGames = await databaseService.db.all(`
      SELECT game_id as gameId, game_name as gameName, genres, difficulty
      FROM user_game_library
      WHERE user_id = ? AND ownership_status = ?
    `, [userId, 'owned'])

    // Get recent activity
    const recentActivity = await databaseService.db.all(`
      SELECT gameId, COUNT(*) as sessions, SUM(duration) as totalTime
      FROM game_sessions
      WHERE userId = ? AND startedAt > datetime('now', '-30 days')
      GROUP BY gameId
    `, [userId])

    // Get mood profile
    const userProfile = await databaseService.db.get('SELECT gaming_profile FROM users WHERE id = ?', [userId])
    const gamingProfile = userProfile?.gaming_profile ? JSON.parse(userProfile.gaming_profile) : {}
    const moodProfile = gamingProfile.moodProfile || { currentMood: 'neutral', preferredMoods: [] }

    const userContext = {
      ownedGames: ownedGames.map(g => ({
        gameId: g.gameId,
        gameName: g.gameName,
        genres: g.genres || [],
        difficulty: g.difficulty || 'moderate'
      })),
      recentActivity: recentActivity.map(a => ({
        gameId: a.gameId,
        sessions: a.sessions,
        totalTime: Math.round(a.totalTime || 0)
      })),
      moodProfile,
      availableTime: 90 // Default 90 minutes per session
    }

    const goalData = {
      type: goal.goal_type,
      title: goal.title,
      description: goal.description,
      currentProgress: goal.current_value,
      targetValue: goal.target_value
    }

    const recommendations = await ollamaService.getGoalBasedRecommendations(goalData, userContext)

    // Log this coaching session
    const sessionId = `coaching_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await databaseService.db.run(`
      INSERT INTO coaching_sessions (
        id, user_id, session_type, content, ai_model, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      sessionId,
      userId,
      'goal_checkin',
      JSON.stringify({
        goal: goalData,
        recommendations: recommendations.coachingAdvice,
        motivation: recommendations.motivationalMessage
      }),
      ollamaService.getModel(),
      new Date().toISOString()
    ])

    res.json({ recommendations })
  } catch (error) {
    console.error('Error getting goal recommendations:', error)
    res.status(500).json({ error: 'Failed to get goal recommendations' })
  }
})

export default router
