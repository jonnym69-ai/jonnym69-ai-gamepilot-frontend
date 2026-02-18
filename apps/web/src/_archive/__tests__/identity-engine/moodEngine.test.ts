// Unit tests for Mood Engine
import { MoodEngine } from '../../../packages/identity-engine/src/moodModel'

describe('MoodEngine', () => {
  let moodEngine: MoodEngine

  beforeEach(() => {
    moodEngine = new MoodEngine()
  })

  describe('constructor', () => {
    it('should initialize with default mood weights', () => {
      const engine = new MoodEngine()
      expect(engine).toBeDefined()
    })

    it('should initialize with custom mood weights', () => {
      const customWeights = {
        competitive: 0.8,
        relaxed: 0.6,
        focused: 0.7,
        social: 0.5,
        creative: 0.9,
        adventurous: 0.6,
        strategic: 0.7,
        neutral: 0.5
      }
      const engine = new MoodEngine(customWeights)
      expect(engine).toBeDefined()
    })
  })

  describe('analyzeMood', () => {
    it('should analyze mood from game session', () => {
      const gameSession = {
        gameId: 'game-1',
        duration: 120, // 2 hours
        genre: 'action',
        playerActions: ['kill', 'win', 'complete'],
        difficulty: 'hard',
        multiplayer: false,
        completionRate: 100,
        achievements: ['first_win', 'speed_run']
      }

      const result = moodEngine.analyzeMood(gameSession)
      expect(result).toBeDefined()
      expect(typeof result.mood).toBe('string')
      expect(typeof result.confidence).toBe('number')
      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    })

    it('should return competitive mood for action games with wins', () => {
      const gameSession = {
        gameId: 'game-1',
        duration: 60,
        genre: 'action',
        playerActions: ['kill', 'win', 'compete'],
        difficulty: 'hard',
        multiplayer: true,
        completionRate: 75,
        achievements: ['champion']
      }

      const result = moodEngine.analyzeMood(gameSession)
      expect(result.mood).toBe('competitive')
      expect(result.confidence).toBeGreaterThan(0.5)
    })

    it('should return relaxed mood for casual games', () => {
      const gameSession = {
        gameId: 'game-2',
        duration: 30,
        genre: 'puzzle',
        playerActions: ['solve', 'explore'],
        difficulty: 'easy',
        multiplayer: false,
        completionRate: 50,
        achievements: []
      }

      const result = moodEngine.analyzeMood(gameSession)
      expect(result.mood).toBe('relaxed')
      expect(result.confidence).toBeGreaterThan(0.3)
    })

    it('should return focused mood for strategy games', () => {
      const gameSession = {
        gameId: 'game-3',
        duration: 180, // 3 hours
        genre: 'strategy',
        playerActions: ['plan', 'execute', 'optimize'],
        difficulty: 'medium',
        multiplayer: false,
        completionRate: 25,
        achievements: ['thinker']
      }

      const result = moodEngine.analyzeMood(gameSession)
      expect(result.mood).toBe('focused')
      expect(result.confidence).toBeGreaterThan(0.4)
    })

    it('should return social mood for multiplayer games', () => {
      const gameSession = {
        gameId: 'game-4',
        duration: 90,
        genre: 'social',
        playerActions: ['chat', 'team', 'cooperate'],
        difficulty: 'easy',
        multiplayer: true,
        completionRate: 80,
        achievements: ['team_player']
      }

      const result = moodEngine.analyzeMood(gameSession)
      expect(result.mood).toBe('social')
      expect(result.confidence).toBeGreaterThan(0.5)
    })

    it('should return creative mood for sandbox games', () => {
      const gameSession = {
        gameId: 'game-5',
        duration: 150,
        genre: 'simulation',
        playerActions: ['build', 'design', 'create'],
        difficulty: 'medium',
        multiplayer: false,
        completionRate: 10,
        achievements: ['creator']
      }

      const result = moodEngine.analyzeMood(gameSession)
      expect(result.mood).toBe('creative')
      expect(result.confidence).toBeGreaterThan(0.4)
    })

    it('should return adventurous mood for exploration games', () => {
      const gameSession = {
        gameId: 'game-6',
        duration: 200,
        genre: 'adventure',
        playerActions: ['explore', 'discover', 'travel'],
        difficulty: 'medium',
        multiplayer: false,
        completionRate: 30,
        achievements: ['explorer']
      }

      const result = moodEngine.analyzeMood(gameSession)
      expect(result.mood).toBe('adventurous')
      expect(result.confidence).toBeGreaterThan(0.4)
    })

    it('should return strategic mood for complex games', () => {
      const gameSession = {
        gameId: 'game-7',
        duration: 240, // 4 hours
        genre: 'rpg',
        playerActions: ['plan', 'strategize', 'optimize'],
        difficulty: 'hard',
        multiplayer: false,
        completionRate: 15,
        achievements: ['strategist']
      }

      const result = moodEngine.analyzeMood(gameSession)
      expect(result.mood).toBe('strategic')
      expect(result.confidence).toBeGreaterThan(0.3)
    })

    it('should return neutral mood for unclear patterns', () => {
      const gameSession = {
        gameId: 'game-8',
        duration: 45,
        genre: 'casual',
        playerActions: ['play', 'wait', 'idle'],
        difficulty: 'easy',
        multiplayer: false,
        completionRate: 20,
        achievements: []
      }

      const result = moodEngine.analyzeMood(gameSession)
      expect(result.mood).toBe('neutral')
      expect(result.confidence).toBeLessThan(0.5)
    })

    it('should handle edge case with minimal data', () => {
      const gameSession = {
        gameId: 'game-9',
        duration: 1,
        genre: 'unknown',
        playerActions: [],
        difficulty: 'unknown',
        multiplayer: false,
        completionRate: 0,
        achievements: []
      }

      const result = moodEngine.analyzeMood(gameSession)
      expect(result).toBeDefined()
      expect(typeof result.mood).toBe('string')
      expect(typeof result.confidence).toBe('number')
    })

    it('should handle edge case with maximum values', () => {
      const gameSession = {
        gameId: 'game-10',
        duration: 999999,
        genre: 'action',
        playerActions: ['kill', 'win', 'compete', 'dominate'],
        difficulty: 'extreme',
        multiplayer: true,
        completionRate: 100,
        achievements: ['god_mode', 'unbeatable']
      }

      const result = moodEngine.analyzeMood(gameSession)
      expect(result).toBeDefined()
      expect(result.confidence).toBeGreaterThan(0.8)
    })
  })

  describe('getMoodHistory', () => {
    it('should return empty history initially', () => {
      const history = moodEngine.getMoodHistory()
      expect(history).toEqual([])
    })

    it('should return mood history after analysis', () => {
      const gameSession = {
        gameId: 'game-1',
        duration: 60,
        genre: 'action',
        playerActions: ['kill', 'win'],
        difficulty: 'medium',
        multiplayer: false,
        completionRate: 80,
        achievements: []
      }

      moodEngine.analyzeMood(gameSession)
      const history = moodEngine.getMoodHistory()
      expect(history).toHaveLength(1)
      expect(history[0]).toHaveProperty('mood')
      expect(history[0]).toHaveProperty('confidence')
      expect(history[0]).toHaveProperty('timestamp')
      expect(history[0]).toHaveProperty('gameSession')
    })

    it('should accumulate mood history over multiple analyses', () => {
      const gameSession1 = {
        gameId: 'game-1',
        duration: 60,
        genre: 'action',
        playerActions: ['kill', 'win'],
        difficulty: 'medium',
        multiplayer: false,
        completionRate: 80,
        achievements: []
      }

      const gameSession2 = {
        gameId: 'game-2',
        duration: 30,
        genre: 'puzzle',
        playerActions: ['solve'],
        difficulty: 'easy',
        multiplayer: false,
        completionRate: 50,
        achievements: []
      }

      moodEngine.analyzeMood(gameSession1)
      moodEngine.analyzeMood(gameSession2)
      
      const history = moodEngine.getMoodHistory()
      expect(history).toHaveLength(2)
      expect(history[0].mood).toBe('competitive')
      expect(history[1].mood).toBe('relaxed')
    })
  })

  describe('getMoodStats', () => {
    it('should return empty stats initially', () => {
      const stats = moodEngine.getMoodStats()
      expect(Object.keys(stats)).toHaveLength(0)
    })

    it('should return mood stats after analysis', () => {
      const gameSession = {
        gameId: 'game-1',
        duration: 60,
        genre: 'action',
        playerActions: ['kill', 'win'],
        difficulty: 'medium',
        multiplayer: false,
        completionRate: 80,
        achievements: []
      }

      moodEngine.analyzeMood(gameSession)
      const stats = moodEngine.getMoodStats()
      expect(Object.keys(stats)).toContain('competitive')
      expect(stats['competitive']).toBe(1)
    })

    it('should accumulate mood stats over multiple analyses', () => {
      const gameSession1 = {
        gameId: 'game-1',
        duration: 60,
        genre: 'action',
        playerActions: ['kill', 'win'],
        difficulty: 'medium',
        multiplayer: false,
        completionRate: 80,
        achievements: []
      }

      const gameSession2 = {
        gameId: 'game-2',
        duration: 60,
        genre: 'action',
        playerActions: ['kill', 'win'],
        difficulty: 'medium',
        multiplayer: false,
        completionRate: 80,
        achievements: []
      }

      moodEngine.analyzeMood(gameSession1)
      moodEngine.analyzeMood(gameSession2)
      
      const stats = moodEngine.getMoodStats()
      expect(stats['competitive']).toBe(2)
    })

    it('should track multiple different moods', () => {
      const gameSession1 = {
        gameId: 'game-1',
        duration: 60,
        genre: 'action',
        playerActions: ['kill', 'win'],
        difficulty: 'medium',
        multiplayer: false,
        completionRate: 80,
        achievements: []
      }

      const gameSession2 = {
        gameId: 'game-2',
        duration: 30,
        genre: 'puzzle',
        playerActions: ['solve'],
        difficulty: 'easy',
        multiplayer: false,
        completionRate: 50,
        achievements: []
      }

      moodEngine.analyzeMood(gameSession1)
      moodEngine.analyzeMood(gameSession2)
      
      const stats = moodEngine.getMoodStats()
      expect(stats['competitive']).toBe(1)
      expect(stats['relaxed']).toBe(1)
    })
  })

  describe('clearHistory', () => {
    it('should clear mood history', () => {
      const gameSession = {
        gameId: 'game-1',
        duration: 60,
        genre: 'action',
        playerActions: ['kill', 'win'],
        difficulty: 'medium',
        multiplayer: false,
        completionRate: 80,
        achievements: []
      }

      moodEngine.analyzeMood(gameSession)
      expect(moodEngine.getMoodHistory()).toHaveLength(1)
      
      moodEngine.clearHistory()
      expect(moodEngine.getMoodHistory()).toHaveLength(0)
    })

    it('should clear mood stats', () => {
      const gameSession = {
        gameId: 'game-1',
        duration: 60,
        genre: 'action',
        playerActions: ['kill', 'win'],
        difficulty: 'medium',
        multiplayer: false,
        completionRate: 80,
        achievements: []
      }

      moodEngine.analyzeMood(gameSession)
      expect(Object.keys(moodEngine.getMoodStats())).toHaveLength(1)
      
      moodEngine.clearHistory()
      expect(Object.keys(moodEngine.getMoodStats())).toHaveLength(0)
    })
  })

  describe('getDominantMood', () => {
    it('should return null for empty history', () => {
      const dominantMood = moodEngine.getDominantMood()
      expect(dominantMood).toBeNull()
    })

    it('should return dominant mood from history', () => {
      const gameSession1 = {
        gameId: 'game-1',
        duration: 60,
        genre: 'action',
        playerActions: ['kill', 'win'],
        difficulty: 'medium',
        multiplayer: false,
        completionRate: 80,
        achievements: []
      }

      const gameSession2 = {
        gameId: 'game-2',
        duration: 60,
        genre: 'action',
        playerActions: ['kill', 'win'],
        difficulty: 'medium',
        multiplayer: false,
        completionRate: 80,
        achievements: []
      }

      const gameSession3 = {
        gameId: 'game-3',
        duration: 30,
        genre: 'puzzle',
        playerActions: ['solve'],
        difficulty: 'easy',
        multiplayer: false,
        completionRate: 50,
        achievements: []
      }

      moodEngine.analyzeMood(gameSession1)
      moodEngine.analyzeMood(gameSession2)
      moodEngine.analyzeMood(gameSession3)
      
      const dominantMood = moodEngine.getDominantMood()
      expect(dominantMood).toBe('competitive')
    })

    it('should return null when there is a tie', () => {
      const gameSession1 = {
        gameId: 'game-1',
        duration: 60,
        genre: 'action',
        playerActions: ['kill', 'win'],
        difficulty: 'medium',
        multiplayer: false,
        completionRate: 80,
        achievements: []
      }

      const gameSession2 = {
        gameId: 'game-2',
        duration: 30,
        genre: 'puzzle',
        playerActions: ['solve'],
        difficulty: 'easy',
        multiplayer: false,
        completionRate: 50,
        achievements: []
      }

      moodEngine.analyzeMood(gameSession1)
      moodEngine.analyzeMood(gameSession2)
      
      const dominantMood = moodEngine.getDominantMood()
      expect(dominantMood).toBeNull()
    })
  })
})
