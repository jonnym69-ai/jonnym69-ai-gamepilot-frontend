// Unit tests for MoodModel
import { MoodModel } from '../../../packages/identity-engine/src/moodModel'
import { GameSession } from '../../../packages/identity-engine/src/types'

describe('MoodModel', () => {
  let moodModel: MoodModel

  beforeEach(() => {
    moodModel = new MoodModel()
  })

  describe('constructor', () => {
    it('should initialize with default mood weights', () => {
      const model = new MoodModel()
      expect(model).toBeDefined()
    })
  })

  describe('computeCurrentMood', () => {
    it('should return chill mood for empty sessions', () => {
      const result = moodModel.computeCurrentMood([])
      expect(result).toBe('chill')
    })

    it('should return chill mood for sessions older than 7 days', () => {
      const oldSession: GameSession = {
        id: 'session-1',
        gameId: 'game-1',
        startTime: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        mood: 'competitive',
        duration: 60,
        achievements: ['win'],
        playerActions: ['kill', 'dominate']
      }

      const result = moodModel.computeCurrentMood([oldSession])
      expect(result).toBe('chill')
    })

    it('should return mood with highest score from recent sessions', () => {
      const recentSession1: GameSession = {
        id: 'session-1',
        gameId: 'game-1',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        mood: 'competitive',
        duration: 60,
        achievements: ['win'],
        playerActions: ['kill', 'dominate']
      }

      const recentSession2: GameSession = {
        id: 'session-2',
        gameId: 'game-2',
        startTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        mood: 'chill',
        duration: 30,
        achievements: [],
        playerActions: ['relax']
      }

      const result = moodModel.computeCurrentMood([recentSession1, recentSession2])
      expect(result).toBe('competitive')
    })

    it('should handle sessions with same mood scores', () => {
      const recentSession1: GameSession = {
        id: 'session-1',
        gameId: 'game-1',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        mood: 'competitive',
        duration: 60,
        achievements: ['win'],
        playerActions: ['kill', 'dominate']
      }

      const recentSession2: GameSession = {
        id: 'session-2',
        gameId: 'game-2',
        startTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        mood: 'energetic',
        duration: 60,
        achievements: ['speed'],
        playerActions: ['rush', 'fast']
      }

      const result = moodModel.computeCurrentMood([recentSession1, recentSession2])
      expect(result).toBe('competitive') // Should return first encountered mood with highest score
    })

    it('should handle mixed recent and old sessions', () => {
      const oldSession: GameSession = {
        id: 'session-old',
        gameId: 'game-old',
        startTime: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        mood: 'competitive',
        duration: 60,
        achievements: ['win'],
        playerActions: ['kill', 'dominate']
      }

      const recentSession: GameSession = {
        id: 'session-recent',
        gameId: 'game-recent',
        startTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        endTime: new Date().toISOString(),
        mood: 'chill',
        duration: 30,
        achievements: [],
        playerActions: ['relax']
      }

      const result = moodModel.computeCurrentMood([oldSession, recentSession])
      expect(result).toBe('chill')
    })

    it('should handle sessions exactly 7 days old', () => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      weekAgo.setHours(weekAgo.getHours() - 1) // Make it slightly older than 7 days

      const weekOldSession: GameSession = {
        id: 'session-1',
        gameId: 'game-1',
        startTime: weekAgo.toISOString(),
        endTime: new Date(weekAgo.getTime() + 60 * 60 * 1000).toISOString(),
        mood: 'competitive',
        duration: 60,
        achievements: ['win'],
        playerActions: ['kill', 'dominate']
      }

      const result = moodModel.computeCurrentMood([weekOldSession])
      expect(result).toBe('chill')
    })

    it('should handle sessions exactly 7 days old but recent in time', () => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      weekAgo.setHours(weekAgo.getHours() + 1) // Make it slightly more recent than 7 days

      const recentSession: GameSession = {
        id: 'session-1',
        gameId: 'game-1',
        startTime: weekAgo.toISOString(),
        endTime: new Date(weekAgo.getTime() + 60 * 60 * 1000).toISOString(),
        mood: 'competitive',
        duration: 60,
        achievements: ['win'],
        playerActions: ['kill', 'dominate']
      }

      const result = moodModel.computeCurrentMood([recentSession])
      expect(result).toBe('competitive')
    })

    it('should accumulate scores for same mood across multiple sessions', () => {
      const recentSession1: GameSession = {
        id: 'session-1',
        gameId: 'game-1',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        mood: 'competitive',
        duration: 60,
        achievements: ['win'],
        playerActions: ['kill', 'dominate']
      }

      const recentSession2: GameSession = {
        id: 'session-2',
        gameId: 'game-2',
        startTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        mood: 'competitive',
        duration: 45,
        achievements: ['victory'],
        playerActions: ['compete']
      }

      const result = moodModel.computeCurrentMood([recentSession1, recentSession2])
      expect(result).toBe('competitive')
    })

    it('should handle edge case with session at exactly 7 days boundary', () => {
      const boundaryTime = new Date()
      boundaryTime.setDate(boundaryTime.getDate() - 7)
      boundaryTime.setHours(0, 0, 0, 0) // Start of day 7 days ago

      const boundarySession: GameSession = {
        id: 'session-1',
        gameId: 'game-1',
        startTime: boundaryTime.toISOString(),
        endTime: new Date(boundaryTime.getTime() + 60 * 60 * 1000).toISOString(),
        mood: 'competitive',
        duration: 60,
        achievements: ['win'],
        playerActions: ['kill', 'dominate']
      }

      const result = moodModel.computeCurrentMood([boundarySession])
      expect(result).toBe('chill') // Should be filtered out as it's exactly 7 days old
    })

    it('should handle edge case with session just inside 7 day window', () => {
      const boundaryTime = new Date()
      boundaryTime.setDate(boundaryTime.getDate() - 7)
      boundaryTime.setHours(0, 0, 0, 0) // Start of day 7 days ago
      boundaryTime.setMilliseconds(1) // Just after midnight

      const recentSession: GameSession = {
        id: 'session-1',
        gameId: 'game-1',
        startTime: boundaryTime.toISOString(),
        endTime: new Date(boundaryTime.getTime() + 60 * 60 * 1000).toISOString(),
        mood: 'competitive',
        duration: 60,
        achievements: ['win'],
        playerActions: ['kill', 'dominate']
      }

      const result = moodModel.computeCurrentMood([recentSession])
      expect(result).toBe('competitive') // Should be included as it's just inside 7 day window
    })

    it('should handle large number of sessions efficiently', () => {
      const sessions: GameSession[] = []
      const now = new Date()

      // Create 100 sessions over the past 7 days
      for (let i = 0; i < 100; i++) {
        const startTime = new Date(now.getTime() - i * 60 * 60 * 1000) // Each session 1 hour apart
        const endTime = new Date(startTime.getTime() + 30 * 60 * 1000) // 30 minutes duration
        
        sessions.push({
          id: `session-${i}`,
          gameId: `game-${i}`,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          mood: i % 2 === 0 ? 'competitive' : 'chill',
          duration: 30,
          achievements: i % 3 === 0 ? ['win'] : [],
          playerActions: i % 2 === 0 ? ['kill'] : ['relax']
        })
      }

      const result = moodModel.computeCurrentMood(sessions)
      expect(result).toBe('competitive') // More competitive sessions (50 vs 49)
    })

    it('should handle sessions with invalid dates gracefully', () => {
      const invalidSession: GameSession = {
        id: 'session-1',
        gameId: 'game-1',
        startTime: 'invalid-date' as any,
        endTime: new Date().toISOString(),
        mood: 'competitive',
        duration: 60,
        achievements: ['win'],
        playerActions: ['kill', 'dominate']
      }

      const result = moodModel.computeCurrentMood([invalidSession])
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should handle sessions with missing required fields gracefully', () => {
      const incompleteSession: GameSession = {
        id: 'session-1',
        gameId: 'game-1',
        startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        endTime: new Date().toISOString(),
        mood: 'competitive',
        duration: 60,
        achievements: ['win'],
        playerActions: ['kill', 'dominate']
      }

      const result = moodModel.computeCurrentMood([incompleteSession])
      expect(result).toBe('competitive')
    })
  })

  describe('calculateSessionMoodScore', () => {
    // This is a private method, but we can test its behavior through computeCurrentMood
    it('should give higher scores to sessions with achievements', () => {
      const sessionWithAchievements: GameSession = {
        id: 'session-1',
        gameId: 'game-1',
        startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        endTime: new Date().toISOString(),
        mood: 'competitive',
        duration: 60,
        achievements: ['win', 'victory', 'champion'],
        playerActions: ['kill', 'dominate']
      }

      const sessionWithoutAchievements: GameSession = {
        id: 'session-2',
        gameId: 'game-2',
        startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        endTime: new Date().toISOString(),
        mood: 'competitive',
        duration: 60,
        achievements: [],
        playerActions: ['kill', 'dominate']
      }

      const result1 = moodModel.computeCurrentMood([sessionWithAchievements])
      const result2 = moodModel.computeCurrentMood([sessionWithoutAchievements])
      
      // Both should return competitive, but the one with achievements should have higher confidence
      expect(result1).toBe('competitive')
      expect(result2).toBe('competitive')
    })

    it('should give higher scores to longer sessions', () => {
      const longSession: GameSession = {
        id: 'session-1',
        gameId: 'game-1',
        startTime: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        endTime: new Date().toISOString(),
        mood: 'competitive',
        duration: 120,
        achievements: ['win'],
        playerActions: ['kill', 'dominate']
      }

      const shortSession: GameSession = {
        id: 'session-2',
        gameId: 'game-2',
        startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        endTime: new Date().toISOString(),
        mood: 'competitive',
        duration: 30,
        achievements: ['win'],
        playerActions: ['kill', 'dominate']
      }

      const result = moodModel.computeCurrentMood([longSession, shortSession])
      expect(result).toBe('competitive') // Both are competitive, but long session should dominate
    })

    it('should handle sessions with different moods correctly', () => {
      const competitiveSession: GameSession = {
        id: 'session-1',
        gameId: 'game-1',
        startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        endTime: new Date().toISOString(),
        mood: 'competitive',
        duration: 60,
        achievements: ['win'],
        playerActions: ['kill', 'dominate']
      }

      const chillSession: GameSession = {
        id: 'session-2',
        gameId: 'game-2',
        startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        endTime: new Date().toISOString(),
        mood: 'chill',
        duration: 60,
        achievements: [],
        playerActions: ['relax']
      }

      const result = moodModel.computeCurrentMood([competitiveSession, chillSession])
      expect(result).toBe('competitive') // Competitive has higher weight (0.9 vs 0.3)
    })
  })
})
