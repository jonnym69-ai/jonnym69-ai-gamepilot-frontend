// Unit tests for Free AI Components
import { 
  MoodEngine, 
  RecommendationEngine, 
  VectorSearch, 
  MoodRecommendationMapper, 
  SessionAnalyzer 
} from '../../../packages/identity-engine/src/freeAIComponents'

describe('Free AI Components', () => {
  describe('MoodEngine', () => {
    let moodEngine: MoodEngine

    beforeEach(() => {
      moodEngine = new MoodEngine()
    })

    describe('analyzeMood', () => {
      it('should analyze mood from player actions', () => {
        const playerActions = ['kill', 'win', 'explore', 'socialize']
        const result = moodEngine.analyzeMood(playerActions)
        expect(result).toBeDefined()
        expect(result.mood).toBeDefined()
        expect(result.confidence).toBeGreaterThanOrEqual(0)
        expect(result.confidence).toBeLessThanOrEqual(1)
      })

      it('should return competitive mood for aggressive actions', () => {
        const playerActions = ['kill', 'attack', 'dominate', 'destroy']
        const result = moodEngine.analyzeMood(playerActions)
        expect(result.mood).toBe('competitive')
        expect(result.confidence).toBeGreaterThan(0.7)
      })

      it('should return relaxed mood for peaceful actions', () => {
        const playerActions = ['explore', 'relax', 'observe', 'meditate']
        const result = moodEngine.analyzeMood(playerActions)
        expect(result.mood).toBe('relaxed')
        expect(result.confidence).toBeGreaterThan(0.5)
      })

      it('should return creative mood for artistic actions', () => {
        const playerActions = ['create', 'build', 'design', 'paint']
        const result = moodEngine.analyzeMood(playerActions)
        expect(result.mood).toBe('creative')
        expect(result.confidence).toBeGreaterThan(0.4)
      })

      it('should return social mood for cooperative actions', () => {
        const playerActions = ['team', 'chat', 'help', 'share']
        const result = moodEngine.analyzeMood(playerActions)
        expect(result.mood).toBe('social')
        expect(result.confidence).toBeGreaterThan(0.5)
      })

      it('should return focused mood for strategic actions', () => {
        const playerActions = ['plan', 'strategize', 'calculate', 'optimize']
        const result = moodEngine.analyzeMood(playerActions)
        expect(result.mood).toBe('focused')
        expect(result.confidence).toBeGreaterThan(0.6)
      })

      it('should return energetic mood for active actions', () => {
        const playerActions = ['run', 'jump', 'dash', 'rush']
        const result = moodEngine.analyzeMood(playerActions)
        expect(result.mood).toBe('energetic')
        expect(result.confidence).toBeGreaterThan(0.7)
      })

      it('should return neutral mood for mixed actions', () => {
        const playerActions = ['walk', 'wait', 'idle', 'observe']
        const result = moodEngine.analyzeMood(playerActions)
        expect(result.mood).toBe('neutral')
        expect(result.confidence).toBeLessThan(0.5)
      })

      it('should handle empty actions array', () => {
        const playerActions: string[] = []
        const result = moodEngine.analyzeMood(playerActions)
        expect(result.mood).toBe('neutral')
        expect(result.confidence).toBe(0)
      })

      it('should handle null actions', () => {
        const result = moodEngine.analyzeMood(null as any)
        expect(result.mood).toBe('neutral')
        expect(result.confidence).toBe(0)
      })
    })

    describe('getMoodHistory', () => {
      it('should return empty history initially', () => {
        const history = moodEngine.getMoodHistory()
        expect(history).toEqual([])
      })

      it('should accumulate mood history', () => {
        moodEngine.analyzeMood(['kill', 'win'])
        moodEngine.analyzeMood(['explore', 'relax'])
        
        const history = moodEngine.getMoodHistory()
        expect(history).toHaveLength(2)
        expect(history[0].mood).toBe('competitive')
        expect(history[1].mood).toBe('relaxed')
        expect(history[0].confidence).toBeGreaterThan(0.7)
        expect(history[1].confidence).toBeGreaterThan(0.5)
      })

      it('should limit history size', () => {
        // Add many mood analyses
        for (let i = 0; i < 150; i++) {
          moodEngine.analyzeMood(['kill', 'win'])
        }
        
        const history = moodEngine.getMoodHistory()
        expect(history.length).toBeLessThanOrEqual(100) // Assuming max 100 entries
      })
    })

    describe('clearHistory', () => {
      it('should clear mood history', () => {
        moodEngine.analyzeMood(['kill', 'win'])
        expect(moodEngine.getMoodHistory()).toHaveLength(1)
        
        moodEngine.clearHistory()
        expect(moodEngine.getMoodHistory()).toHaveLength(0)
      })
    })
  })

  describe('RecommendationEngine', () => {
    let recommendationEngine: RecommendationEngine
    let mockGames: any[]

    beforeEach(() => {
      recommendationEngine = new RecommendationEngine()
      mockGames = [
        {
          id: 'game-1',
          title: 'Action Game 1',
          genre: 'action',
          tags: ['action', 'shooter', 'multiplayer'],
          features: ['multiplayer', 'online', 'competitive'],
          rating: 4.5,
          popularity: 1000,
          platform: 'steam'
        },
        {
          'id': 'game-2',
          title: 'Puzzle Game 2',
          genre: 'puzzle',
          tags: ['puzzle', 'casual', 'singleplayer'],
          features: ['singleplayer', 'offline', 'relaxing'],
          rating: 4.2,
          popularity: 500,
          platform: 'steam'
        },
        {
          'id': 'game-3',
          'title': 'RPG Game 3',
          'genre': 'rpg',
          'tags': ['rpg', 'story', 'adventure'],
          'features': ['story', 'character', 'exploration'],
          'rating': 4.8,
          'popularity': 800,
          'platform': 'steam'
        }
      ]
    })

    describe('getRecommendations', () => {
      it('should return recommendations for user profile', () => {
        const userProfile = {
          id: 'user-1',
          preferences: {
            genres: ['action', 'rpg'],
            platforms: ['steam'],
            playstyle: 'competitive',
            moodHistory: ['competitive', 'focused']
          },
          gameHistory: ['game-1', 'game-3']
        }

        const recommendations = recommendationEngine.getRecommendations(userProfile, mockGames)
        expect(Array.isArray(recommendations)).toBe(true)
        expect(recommendations.length).toBeGreaterThan(0)
        expect(recommendations[0]).toHaveProperty('game')
        expect(recommendations[0]).toHaveProperty('score')
        expect(recommendations[0]).toHaveProperty('reason')
      })

      it('should prioritize games based on user preferences', () => {
        const userProfile = {
          id: 'user-1',
          preferences: {
            genres: ['action'],
            platforms: ['steam'],
            playstyle: 'competitive',
            moodHistory: ['competitive']
          },
          gameHistory: []
        }

        const recommendations = recommendationEngine.getRecommendations(userProfile, mockGames)
        expect(recommendations[0].game.genre).toBe('action')
        expect(recommendations[0].score).toBeGreaterThan(0.7)
      })

      it('should return empty array for empty games list', () => {
        const userProfile = {
          id: 'user-1',
          preferences: {
            genres: ['action'],
            platforms: ['steam'],
            playstyle: 'competitive',
            moodHistory: ['competitive']
          },
          gameHistory: []
        }

        const recommendations = recommendationEngine.getRecommendations(userProfile, [])
        expect(recommendations).toEqual([])
      })

      it('should handle user with no preferences', () => {
        const userProfile = {
          id: 'user-1',
          preferences: {
            genres: [],
            platforms: [],
            playstyle: 'casual',
            moodHistory: ['neutral']
          },
          gameHistory: []
        }

        const recommendations = recommendationEngine.getRecommendations(userProfile, mockGames)
        expect(Array.isArray(recommendations)).toBe(true)
        expect(recommendations.length).toBeGreaterThan(0)
      })
    })

    describe('calculateSimilarity', () => {
      it('should calculate similarity between games', () => {
        const game1 = {
          id: 'game-1',
          genre: 'action',
          tags: ['action', 'shooter'],
          features: ['multiplayer', 'online'],
          rating: 4.5,
          popularity: 1000
        }

        const game2 = {
          id: 'game-2',
          genre: 'action',
          tags: ['action', 'shooter'],
          features: ['multiplayer', 'online'],
          rating: 4.2,
          popularity: 900
        }

        const similarity = recommendationEngine.calculateSimilarity(game1, game2)
        expect(similarity).toBeGreaterThan(0.8)
      })

      it('should return 0 for completely different games', () => {
        const game1 = {
          id: 'game-1',
          genre: 'action',
          tags: ['action', 'shooter'],
          features: ['multiplayer', 'online'],
          rating: 4.5,
          popularity: 1000
        }

        const game2 = {
          id: 'game-2',
          genre: 'puzzle',
          tags: ['puzzle', 'casual'],
          features: ['singleplayer', 'offline'],
          rating: 4.2,
          popularity: 500
        }

        const similarity = recommendationEngine.calculateSimilarity(game1, game2)
        expect(similarity).toBeLessThan(0.3)
      })

      it('should handle games with missing properties', () => {
        const game1 = {
          id: 'game-1',
          genre: 'action',
          tags: ['action'],
          features: ['multiplayer'],
          rating: 4.5,
          popularity: 1000
        }

        const game2 = {
          id: 'game-2',
          genre: 'action',
          tags: ['action'],
          features: ['multiplayer'],
          rating: 4.2,
          popularity: 900
        }

        const similarity = recommendationEngine.calculateSimilarity(game1, game2)
        expect(similarity).toBeGreaterThan(0.8)
      })
    })
  })

  describe('VectorSearch', () => {
    let vectorSearch: VectorSearch
    let mockGames: any[]

    beforeEach(() => {
      vectorSearch = new VectorSearch()
      mockGames = [
        {
          id: 'game-1',
          title: 'Action Game 1',
          genre: 'action',
          tags: ['action', 'shooter', 'multiplayer'],
          features: ['multiplayer', 'online', 'competitive'],
          rating: 4.5,
          popularity: 1000,
          platform: 'steam'
        },
        {
          'id': 'game-2',
          title: 'Puzzle Game 2',
          genre: 'puzzle',
          tags: ['puzzle', 'casual', 'singleplayer'],
          features: ['singleplayer', 'offline', 'relaxing'],
          rating: 4.2,
          popularity: 500,
          platform: 'steam'
        }
      ]
    })

    describe('indexGames', () => {
      it('should index games for vector search', () => {
        vectorSearch.indexGames(mockGames)
        expect(vectorSearch.getIndexedGames()).toHaveLength(2)
        expect(vectorSearch.getIndexedGames()[0].id).toBe('game-1')
        expect(vectorSearch.getIndexedGames()[1].id).toBe('game-2')
      })

      it('should create vector embeddings for games', () => {
        vectorSearch.indexGames(mockGames)
        const embeddings = vectorSearch.getEmbeddings()
        expect(embeddings).toHaveLength(2)
        expect(typeof embeddings[0]).toBe('object')
        expect(embeddings[0]).toHaveProperty('id')
        expect(embeddings[0]).toHaveProperty('vector')
        expect(Array.isArray(embeddings[0].vector)).toBe(true)
      })
    })

    describe('search', () => {
      beforeEach(() => {
        vectorSearch.indexGames(mockGames)
      })

      it('should return similar games for search query', () => {
        const query = 'action shooter multiplayer'
        const results = vectorSearch.search(query, 5)
        expect(Array.isArray(results)).toBe(true)
        expect(results.length).toBeLessThanOrEqual(5)
        expect(results[0]).toHaveProperty('game')
        expect(results[0]).toHaveProperty('similarity')
        expect(results[0].similarity).toBeGreaterThan(0.5)
      })

      it('should return empty array for no results', () => {
        const query = 'nonexistent game'
        const results = vectorSearch.search(query, 5)
        expect(results).toEqual([])
      })

      it('should limit results by limit parameter', () => {
        const query = 'action'
        const results = vectorSearch.search(query, 2)
        expect(results.length).toBeLessThanOrEqual(2)
      })

      it('should return results sorted by similarity', () => {
        const query = 'action'
        const results = vectorSearch.search(query, 10)
        if (results.length > 1) {
          for (let i = 0; i < results.length - 1; i++) {
            expect(results[i].similarity).toBeGreaterThanOrEqual(results[i + 1].similarity)
          }
        }
      })
    })
  })

  describe('MoodRecommendationMapper', () => {
    let moodMapper: MoodRecommendationMapper

    beforeEach(() => {
      moodMapper = new MoodRecommendationMapper()
    })

    describe('getRecommendationsByMood', () => {
      it('should return action games for competitive mood', () => {
        const mockGames = [
          {
            id: 'game-1',
            title: 'Action Game 1',
            genre: 'action',
            tags: ['action', 'shooter'],
            features: ['competitive', 'multiplayer'],
            rating: 4.5
          },
          {
            id: 'game-2',
            title: 'Puzzle Game 2',
            genre: 'puzzle',
            tags: ['puzzle', 'casual'],
            features: ['relaxing', 'singleplayer'],
            rating: 4.2
          }
        ]

        const recommendations = moodMapper.getRecommendationsByMood('competitive', mockGames)
        expect(recommendations).toHaveLength(1)
        expect(recommendations[0].id).toBe('game-1')
        expect(recommendations[0].genre).toBe('action')
      })

      it('should return puzzle games for relaxed mood', () => {
        const mockGames = [
          {
            id: 'game-1',
            title: 'Action Game 1',
            genre: 'action',
            tags: ['action', 'shooter'],
            features: ['competitive', 'multiplayer'],
            rating: 4.5
          },
          {
            id: 'game-2',
            title: 'Puzzle Game 2',
            genre: 'puzzle',
            tags: ['puzzle', 'casual'],
            features: ['relaxing', 'singleplayer'],
            rating: 4.2
          }
        ]

        const recommendations = moodMapper.getRecommendationsByMood('relaxed', mockGames)
        expect(recommendations).toHaveLength(1)
        expect(recommendations[0].id).toBe('game-2')
        expect(recommendations[0].genre).toBe('puzzle')
      })

      it('should return creative games for creative mood', () => {
        const mockGames = [
          {
            id: 'game-1',
            title: 'Action Game 1',
            genre: 'action',
            tags: ['action', 'shooter'],
            features: ['competitive', 'multiplayer'],
            rating: 4.5
          },
          {
            id: 'game-2',
            title: 'Creative Game 2',
            genre: 'simulation',
            tags: ['creative', 'build', 'design'],
            features: ['creative', 'sandbox'],
            rating: 4.2
          }
        ]

        const recommendations = moodMapper.getRecommendationsByMood('creative', mockGames)
        expect(recommendations).toHaveLength(1)
        expect(recommendations[0].id).toBe('game-2')
        expect(recommendations[0].genre).toBe('simulation')
      })

      it('should return social games for social mood', () => {
        const mockGames = [
          {
            id: 'game-1',
            title: 'Action Game 1',
            genre: 'action',
            tags: ['action', 'shooter'],
            features: ['competitive', 'multiplayer'],
            rating: 4.5
          },
          {
            id: 'game-2',
            title: 'Social Game 2',
            genre: 'social',
            tags: ['social', 'cooperative', 'multiplayer'],
            features: ['social', 'team'],
            rating: 4.2
          }
        ]

        const recommendations = moodMapper.getRecommendationsByMood('social', mockGames)
        expect(recommendations).toHaveLength(1)
        expect(recommendations[0].id).toBe('game-2')
        expect(recommendations[0].genre).toBe('social')
      })

      it('should return empty array for unknown mood', () => {
        const mockGames = [
          {
            id: 'game-1',
            title: 'Action Game 1',
            genre: 'action',
            tags: ['action', 'shooter'],
            features: ['competitive', 'multiplayer'],
            rating: 4.5
          }
        ]

        const recommendations = moodMapper.getRecommendationsByMood('unknown', mockGames)
        expect(recommendations).toEqual([])
      })

      it('should return empty array for empty games list', () => {
        const recommendations = moodMapper.getRecommendationsByMood('competitive', [])
        expect(recommendations).toEqual([])
      })
    })

    describe('getMoodForGenre', () => {
      it('should return competitive for action genre', () => {
        const mood = moodMapper.getMoodForGenre('action')
        expect(mood).toBe('competitive')
      })

      it('should return relaxed for puzzle genre', () => {
        const mood = moodMapper.getMoodForGenre('puzzle')
        expect(mood).toBe('relaxed')
      })

      it('should return creative for simulation genre', () => {
        const mood = moodMapper.getMoodForGenre('simulation')
        expect(mood).toBe('creative')
      })

      it('should return social for social genre', () => {
        const mood = moodMapper.getMoodForGenre('social')
        expect(mood).toBe('social')
      })

      it('return neutral for unknown genre', () => {
        const mood = moodMapper.getMoodForGenre('unknown')
        expect(mood).toBe('neutral')
      })
    })
  })

  describe('SessionAnalyzer', () => {
    let sessionAnalyzer: SessionAnalyzer

    beforeEach(() => {
      sessionAnalyzer = new SessionAnalyzer()
    })

    describe('analyzeSession', () => {
      it('should analyze gaming session', () => {
        const session = {
          gameId: 'game-1',
          startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          endTime: new Date().toISOString(),
          duration: 60,
          achievements: ['win', 'first_play', 'speed_run'],
          playerActions: ['kill', 'explore', 'complete'],
          mood: 'competitive',
          completionRate: 85,
          difficulty: 'medium'
        }

        const analysis = sessionAnalyzer.analyzeSession(session)
        expect(analysis).toBeDefined()
        expect(analysis).toHaveProperty('engagement')
        expect(analysis).toHaveProperty('skillLevel')
        expect(analysis).toHaveProperty('performance')
        expect(analysis).toHaveProperty('moodTrend')
        expect(analysis).toHaveProperty('recommendations')
      })

      it('should calculate high engagement for active sessions', () => {
        const session = {
          gameId: 'game-1',
          startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          endTime: new Date().toISOString(),
          duration: 30,
          achievements: ['win', 'achievement'],
          playerActions: ['play', 'interact'],
          mood: 'focused',
          completionRate: 100,
          difficulty: 'easy'
        }

        const analysis = sessionAnalyzer.analyzeSession(session)
        expect(analysis.engagement).toBeGreaterThan(0.8)
      })

      it('should calculate low engagement for idle sessions', () => {
        const session = {
          gameId: 'game-1',
          startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          duration: 30,
          achievements: [],
          playerActions: ['idle', 'wait'],
          mood: 'bored',
          completionRate: 10,
          difficulty: 'easy'
        }

        const analysis = sessionAnalyzer.analyzeSession(session)
        expect(analysis.engagement).toBeLessThan(0.3)
      })

      it('should calculate high skill level for difficult games', () => {
        const session = {
          gameId: 'game-1',
          startTime: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
          endTime: new Date().toISOString(),
          duration: 120,
          achievements: ['master', 'perfectionist'],
          playerActions: ['strategize', 'optimize'],
          mood: 'focused',
          completionRate: 95,
          difficulty: 'hard'
        }

        const analysis = sessionAnalyzer.analyzeSession(session)
        expect(analysis.skillLevel).toBeGreaterThan(0.8)
      })

      it('should calculate low skill level for easy games', () => {
        const session = {
          gameId: 'game-1',
          startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          endTime: new Date().toISOString(),
          duration: 30,
          achievements: [],
          playerActions: ['tutorial', 'help'],
          mood: 'confused',
          completionRate: 25,
          difficulty: 'easy'
        }

        const analysis = sessionAnalyzer.generateRecommendations(session)
        expect(analysis.skillLevel).toBeLessThan(0.3)
      })

      it('should generate recommendations based on session performance', () => {
        const session = {
          gameId: 'game-1',
          startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          endTime: new Date().toISOString(),
          duration: 60,
          achievements: ['win', 'achievement'],
          playerActions: ['kill', 'explore'],
          mood: 'competitive',
          completionRate: 85,
          difficulty: 'medium'
        }

        const recommendations = sessionAnalyzer.generateRecommendations(session)
        expect(Array.isArray(recommendations)).toBe(true)
        expect(recommendations[0]).toHaveProperty('gameId')
        expect(recommendations[0]).toHaveProperty('reason')
        expect(recommendations[0].reason).toContain('competitive')
      })

      it('should handle incomplete session data', () => {
        const session = {
          gameId: 'game-1',
          startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          endTime: new Date().toISOString(),
          duration: 60,
          achievements: [],
          playerActions: [],
          mood: 'neutral',
          completionRate: 0,
          difficulty: 'medium'
        }

        const analysis = sessionAnalyzer.analyzeSession(session)
        expect(analysis).toBeDefined()
        expect(analysis.engagement).toBe(0)
        expect(analysis.skillLevel).toBe(0.5) // Default middle value
      })
    })

    describe('analyzeMultipleSessions', () => {
      it('should analyze multiple gaming sessions', () => {
        const sessions = [
          {
            gameId: 'game-1',
            startTime: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            duration: 60,
            achievements: ['win', 'achievement'],
            playerActions: ['kill', 'explore'],
            mood: 'competitive',
            completionRate: 85,
            difficulty: 'medium'
          },
          {
            gameId: 'game-2',
            startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            endTime: new Date().toISOString(),
            duration: 60,
            achievements: [],
            playerActions: ['relax', 'explore'],
            mood: 'relaxed',
            completionRate: 50,
            difficulty: 'easy'
          }
        ]

        const analysis = sessionAnalyzer.analyzeMultipleSessions(sessions)
        expect(analysis).toBeDefined()
        expect(analysis).toHaveProperty('totalSessions')
        expect(analysis).toHaveProperty('averageSessionDuration')
        expect(analysis).toHaveProperty('overallEngagement')
        expect(analysis).toHaveProperty('dominantMood')
        expect(analysis).toHaveProperty('recommendations')
      })

      it('should calculate average session duration', () => {
        const sessions = [
          { duration: 30 },
          { duration: 60 },
          { duration: 90 }
        ]

        const analysis = sessionAnalyzer.analyzeMultipleSessions(sessions)
        expect(analysis.averageSessionDuration).toBe(60)
      })

      it('should identify dominant mood from sessions', () => {
        const sessions = [
          { mood: 'competitive', duration: 60 },
          { mood: 'competitive', duration: 45 },
          { mood: 'relaxed', duration: 30 }
        ]

        const analysis = sessionAnalyzer.analyzeMultipleSessions(sessions)
        expect(analysis.dominantMood).toBe('competitive')
      })

      it('should handle empty sessions array', () => {
        const analysis = sessionAnalyzer.analyzeMultipleSessions([])
        expect(analysis.totalSessions).toBe(0)
        expect(analysis.averageSessionDuration).toBe(0)
        expect(analysis.overallEngagement).toBe(0)
        expect(analysis.dominantMood).toBe('neutral')
      })
    })
  })
})
