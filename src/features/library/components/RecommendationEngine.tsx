import React, { useMemo, useCallback, useState } from 'react'
import type { Game } from '@gamepilot/types'
import { MOODS } from '@gamepilot/static-data'

interface RecommendationScore {
  gameId: string
  score: number
  reasons: string[]
  confidence: number
  category: 'mood-match' | 'similar-games' | 'play-pattern' | 'genre-affinity' | 'trending'
}

interface UserPlayPattern {
  avgSessionLength: number
  preferredGenres: string[]
  moodPreferences: Record<string, number>
  completionRate: number
  playtimeByGenre: Record<string, number>
  lastPlayedGenres: string[]
  timeOfDayPatterns: Record<string, string[]>
}

interface RecommendationEngineProps {
  games: Game[]
  userGames: Game[]
  currentMood?: string
  onRecommendationSelect?: (game: Game, reason: string) => void
  className?: string
}

export const RecommendationEngine: React.FC<RecommendationEngineProps> = ({
  games,
  userGames,
  currentMood,
  onRecommendationSelect,
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Analyze user play patterns
  const analyzeUserPatterns = useCallback((): UserPlayPattern => {
    const playedGames = userGames.filter(game => game.hoursPlayed && game.hoursPlayed > 0)
    const completedGames = userGames.filter(game => game.playStatus === 'completed')
    
    // Calculate average session length (simplified)
    const avgSessionLength = playedGames.length > 0 
      ? playedGames.reduce((sum, game) => sum + (game.hoursPlayed || 0), 0) / playedGames.length
      : 0

    // Preferred genres by playtime
    const playtimeByGenre: Record<string, number> = {}
    playedGames.forEach(game => {
      game.genres?.forEach(genre => {
        const genreName = typeof genre === 'string' ? genre : genre.name || 'Unknown'
        playtimeByGenre[genreName] = (playtimeByGenre[genreName] || 0) + (game.hoursPlayed || 0)
      })
    })

    const preferredGenres = Object.entries(playtimeByGenre)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([genre]) => genre)

    // Mood preferences from emotional tags
    const moodPreferences: Record<string, number> = {}
    userGames.forEach(game => {
      game.emotionalTags?.forEach(tag => {
        const tagName = typeof tag === 'string' ? tag : tag.name || 'Unknown'
        moodPreferences[tagName] = (moodPreferences[tagName] || 0) + 1
      })
    })

    // Completion rate
    const completionRate = userGames.length > 0 
      ? (completedGames.length / userGames.length) * 100 
      : 0

    // Recently played genres
    const recentGames = userGames
      .filter(game => game.lastPlayed)
      .sort((a, b) => new Date(b.lastPlayed!).getTime() - new Date(a.lastPlayed!).getTime())
      .slice(0, 10)

    const lastPlayedGenres = recentGames.flatMap(game => 
      game.genres?.map(genre => typeof genre === 'string' ? genre : genre.name || 'Unknown') || []
    ).filter((genre, index, arr) => arr.indexOf(genre) === index)

    return {
      avgSessionLength,
      preferredGenres,
      moodPreferences,
      completionRate,
      playtimeByGenre,
      lastPlayedGenres,
      timeOfDayPatterns: {} // Initialize empty for now
    }
  }, [userGames])

  // Mood-based recommendations
  const getMoodRecommendations = useCallback((mood: string, _userPattern: UserPlayPattern): RecommendationScore[] => {
    const moodData = MOODS.find(m => m.name.toLowerCase() === mood.toLowerCase())
    if (!moodData) return []

    const recommendations: RecommendationScore[] = games
      .filter(game => !userGames.some(ug => ug.id === game.id)) // Exclude owned games
      .map(game => {
        let score = 0
        const reasons: string[] = []

        // Check if game matches mood through genre association
        const genreMatch = game.genres?.some(genre => {
          const genreName = typeof genre === 'string' ? genre : genre.name || ''
          return moodData.associatedGenres.includes(genreName)
        })

        if (genreMatch) {
          score += 40
          reasons.push(`Genre fits your ${mood} mood`)
        }

        // Check if game has suitable playtime for mood intensity
        const avgPlaytime = game.averagePlaytime || 20 // Default 20 hours
        if (moodData.intensity <= 3 && avgPlaytime < 15) {
          score += 15
          reasons.push('Quick game perfect for relaxed mood')
        } else if (moodData.intensity >= 7 && avgPlaytime > 25) {
          score += 15
          reasons.push('Deep game for focused gaming')
        }

        const result: RecommendationScore = {
          gameId: game.id,
          score: Math.min(score, 100),
          reasons,
          confidence: genreMatch ? 0.8 : 0.6,
          category: 'mood-match'
        }
        return result
      })
      .filter(rec => rec.score > 20)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
    
    return recommendations
  }, [games, userGames])

  // Similar games recommendations
  const getSimilarGamesRecommendations = useCallback((_userPattern: UserPlayPattern): RecommendationScore[] => {
    const recommendations: RecommendationScore[] = []

    userGames.forEach(userGame => {
      if (userGame.playStatus !== 'completed' && userGame.playStatus !== 'playing') return

      // Find similar games
      const similarGames: RecommendationScore[] = games
        .filter(game => !userGames.some(ug => ug.id === game.id))
        .map(game => {
          let similarity = 0
          const reasons: string[] = []

          // Genre similarity
          const userGenres = userGame.genres?.map(g => typeof g === 'string' ? g : g.name || '') || []
          const gameGenres = game.genres?.map(g => typeof g === 'string' ? g : g.name || '') || []
          const commonGenres = userGenres.filter(g => gameGenres.includes(g))
          
          if (commonGenres.length > 0) {
            similarity += (commonGenres.length / Math.max(userGenres.length, gameGenres.length)) * 40
            reasons.push(`Similar genres: ${commonGenres.join(', ')}`)
          }

          // Tag similarity
          const userTags = userGame.tags || []
          const gameTags = game.tags || []
          const commonTags = userTags.filter(tag => gameTags.includes(tag))
          
          if (commonTags.length > 0) {
            similarity += (commonTags.length / Math.max(userTags.length, gameTags.length)) * 20
            reasons.push(`Similar tags: ${commonTags.join(', ')}`)
          }

          // Playtime similarity
          const userPlaytime = userGame.hoursPlayed || 0
          const gameAvgPlaytime = game.averagePlaytime || 20
          const playtimeDiff = Math.abs(userPlaytime - gameAvgPlaytime)
          
          if (playtimeDiff < 10) {
            similarity += 10
            reasons.push('Similar playtime to your preferences')
          }

          const result: RecommendationScore = {
            gameId: game.id,
            score: Math.min(similarity, 100),
            reasons,
            confidence: 0.7,
            category: 'similar-games'
          }
          return result
        })
        .filter(rec => rec.score > 30)

      recommendations.push(...similarGames)
    })

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
  }, [games, userGames])

  // Play pattern recommendations
  const getPlayPatternRecommendations = useCallback((userPattern: UserPlayPattern): RecommendationScore[] => {
    const recommendations: RecommendationScore[] = games
      .filter(game => !userGames.some(ug => ug.id === game.id))
      .map(game => {
        let score = 0
        const reasons: string[] = []

        // Genre affinity scoring
        game.genres?.forEach(genre => {
          const genreName = typeof genre === 'string' ? genre : genre.name || ''
          const genreScore = userPattern.playtimeByGenre[genreName] || 0
          if (genreScore > 0) {
            score += Math.min(genreScore / 10, 30)
            reasons.push(`You love ${genreName} games`)
          }
        })

        // Completion rate matching
        if (userPattern.completionRate > 70) {
          // User completes games, recommend games with good completion rates
          if (game.completionRate && game.completionRate > 70) {
            score += 20
            reasons.push('High completion rate - you finish what you start')
          }
        } else if (userPattern.completionRate < 30) {
          // User doesn't complete games, recommend shorter games
          if (game.averagePlaytime && game.averagePlaytime < 20) {
            score += 15
            reasons.push('Shorter game - perfect for your play style')
          }
        }

        // Session length matching
        if (userPattern.avgSessionLength > 0) {
          const gameAvgPlaytime = game.averagePlaytime || 20
          const sessionDiff = Math.abs(userPattern.avgSessionLength - gameAvgPlaytime)
          
          if (sessionDiff < 5) {
            score += 15
            reasons.push('Matches your average session length')
          }
        }

        const result: RecommendationScore = {
          gameId: game.id,
          score: Math.min(score, 100),
          reasons,
          confidence: 0.75,
          category: 'play-pattern'
        }
        return result
      })
      .filter(rec => rec.score > 25)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
    
    return recommendations
  }, [games, userGames])

  // Generate all recommendations
  const generateRecommendations = useCallback((): RecommendationScore[] => {
    setIsAnalyzing(true)
    
    const userPattern = analyzeUserPatterns()
    let allRecommendations: RecommendationScore[] = []

    // Generate different types of recommendations
    if (currentMood) {
      allRecommendations.push(...getMoodRecommendations(currentMood, userPattern))
    }
    
    allRecommendations.push(...getSimilarGamesRecommendations(userPattern))
    allRecommendations.push(...getPlayPatternRecommendations(userPattern))

    // Remove duplicates and sort by score
    const uniqueRecommendations = allRecommendations.reduce((acc, rec) => {
      const existing = acc.find(r => r.gameId === rec.gameId)
      if (existing) {
        // Combine scores and reasons
        existing.score = Math.min(existing.score + rec.score * 0.3, 100)
        existing.reasons.push(...rec.reasons)
        existing.confidence = Math.max(existing.confidence, rec.confidence)
      } else {
        acc.push(rec)
      }
      return acc
    }, [] as RecommendationScore[])

    const finalRecommendations = uniqueRecommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)

    setIsAnalyzing(false)
    return finalRecommendations
  }, [analyzeUserPatterns, currentMood, getMoodRecommendations, getSimilarGamesRecommendations, getPlayPatternRecommendations])

  const recommendations = useMemo(() => generateRecommendations(), [generateRecommendations])

  // Filter recommendations by category
  const filteredRecommendations = useMemo(() => {
    if (selectedCategory === 'all') return recommendations
    return recommendations.filter(rec => rec.category === selectedCategory)
  }, [recommendations, selectedCategory])

  // Get game by ID
  const getGameById = useCallback((gameId: string): Game | undefined => {
    return games.find(game => game.id === gameId)
  }, [games])

  const categories = [
    { id: 'all', label: 'All Recommendations', icon: '✨' },
    { id: 'mood-match', label: 'Mood Matches', icon: '🎭' },
    { id: 'similar-games', label: 'Similar Games', icon: '🎮' },
    { id: 'play-pattern', label: 'Play Patterns', icon: '📊' }
  ]

  if (recommendations.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-6xl mb-4">🤔</div>
        <h3 className="text-xl font-bold text-white mb-2">No recommendations yet</h3>
        <p className="text-gray-400">Add more games to your library to get personalized recommendations!</p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Recommended for You</h2>
          <p className="text-gray-400">
            {currentMood ? `Games perfect for your ${currentMood} mood` : 'Based on your gaming patterns'}
          </p>
        </div>
        {isAnalyzing && (
          <div className="text-gaming-primary animate-pulse">
            Analyzing your patterns...
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedCategory === category.id
                ? 'bg-gaming-primary text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span className="mr-2">{category.icon}</span>
            {category.label}
          </button>
        ))}
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRecommendations.map((recommendation) => {
          const game = getGameById(recommendation.gameId)
          if (!game) return null

          return (
            <RecommendationCard
              key={recommendation.gameId}
              game={game}
              recommendation={recommendation}
              onSelect={() => onRecommendationSelect?.(game, recommendation.reasons[0])}
            />
          )
        })}
      </div>
    </div>
  )
}

// Recommendation Card Component
const RecommendationCard: React.FC<{
  game: Game
  recommendation: RecommendationScore
  onSelect: () => void
}> = ({ game, recommendation, onSelect }) => {
  const confidenceColor = recommendation.confidence > 0.8 ? 'text-green-400' : 
                         recommendation.confidence > 0.6 ? 'text-yellow-400' : 'text-orange-400'

  return (
    <div 
      onClick={onSelect}
      className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gaming-primary/50 transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-gaming-primary/20 group"
    >
      {/* Game Cover */}
      <div className="relative mb-3 rounded-lg overflow-hidden">
        {game.coverImage ? (
          <img 
            src={game.coverImage} 
            alt={game.title}
            className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-32 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
            <span className="text-3xl">🎮</span>
          </div>
        )}
        
        {/* Score Badge */}
        <div className="absolute top-2 right-2 bg-gaming-primary/90 backdrop-blur-sm px-2 py-1 rounded-lg">
          <span className="text-white font-bold text-sm">{Math.round(recommendation.score)}%</span>
        </div>
      </div>

      {/* Game Info */}
      <div className="space-y-2">
        <h3 className="font-bold text-white group-hover:text-gaming-primary transition-colors line-clamp-1">
          {game.title}
        </h3>
        
        {/* Genres */}
        <div className="flex flex-wrap gap-1">
          {game.genres?.slice(0, 2).map((genre, index) => (
            <span key={index} className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
              {typeof genre === 'string' ? genre : genre.name}
            </span>
          ))}
        </div>

        {/* Recommendation Reasons */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${confidenceColor}`}>
              {Math.round(recommendation.confidence * 100)}% match
            </span>
            <span className="text-xs text-gray-500">
              {recommendation.category.replace('-', ' ')}
            </span>
          </div>
          <p className="text-xs text-gray-400 line-clamp-2">
            {recommendation.reasons[0]}
          </p>
        </div>
      </div>
    </div>
  )
}
