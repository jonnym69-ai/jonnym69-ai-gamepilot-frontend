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

interface SimpleRecommendationEngineProps {
  games: Game[]
  userGames: Game[]
  currentMood?: string
  onRecommendationSelect?: (game: Game, reason: string) => void
  className?: string
}

export const SimpleRecommendationEngine: React.FC<SimpleRecommendationEngineProps> = ({
  games,
  userGames,
  currentMood,
  onRecommendationSelect,
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Analyze user play patterns
  const analyzeUserPatterns = useCallback(() => {
    const playedGames = userGames.filter(game => game.hoursPlayed && game.hoursPlayed > 0)
    const completedGames = userGames.filter(game => game.playStatus === 'completed')
    
    // Calculate preferred genres by playtime
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

    // Completion rate
    const completionRate = userGames.length > 0 
      ? (completedGames.length / userGames.length) * 100 
      : 0

    return {
      preferredGenres,
      completionRate,
      playtimeByGenre,
      avgSessionLength: playedGames.length > 0 
        ? playedGames.reduce((sum, game) => sum + (game.hoursPlayed || 0), 0) / playedGames.length
        : 0
    }
  }, [userGames])

  // Mood-based recommendations
  const getMoodRecommendations = useCallback((mood: string): RecommendationScore[] => {
    const moodData = MOODS.find(m => m.name.toLowerCase() === mood.toLowerCase())
    if (!moodData) return []

    return games
      .filter(game => !userGames.some(ug => ug.id === game.id))
      .map(game => {
        let score = 0
        const reasons: string[] = []

        // Check if game matches mood through associated genres
        const gameGenres = game.genres?.map(g => typeof g === 'string' ? g : g.name || '') || []
        const moodGenreMatch = gameGenres.some(genre => 
          moodData.associatedGenres.includes(genre.toLowerCase())
        )

        if (moodGenreMatch) {
          score += 50
          reasons.push(`Perfect mood match for ${mood}`)
        }

        // Check intensity matching using playtime as proxy
        const estimatedPlaytime = game.hoursPlayed || 20 // Default 20 hours
        const intensityDiff = Math.abs(estimatedPlaytime - moodData.intensity * 10)
        
        if (intensityDiff <= 15) {
          score += 25
          reasons.push('Playtime matches your mood')
        }

        // Bonus for completed games (as quality indicator)
        if (game.playStatus === 'completed') {
          score += 15
          reasons.push('Quality game worth completing')
        }

        return {
          gameId: game.id,
          score: Math.min(score, 100),
          reasons,
          confidence: moodGenreMatch ? 0.8 : 0.6,
          category: 'mood-match' as const
        }
      })
      .filter(rec => rec.score > 30)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
  }, [games, userGames])

  // Similar games recommendations
  const getSimilarGamesRecommendations = useCallback((): RecommendationScore[] => {
    const recommendations: RecommendationScore[] = []

    userGames.forEach(userGame => {
      if (userGame.playStatus !== 'completed' && userGame.playStatus !== 'playing') return

      // Find similar games
      const similarGames = games
        .filter(game => !userGames.some(ug => ug.id === game.id))
        .map(game => {
          let similarity = 0
          const reasons: string[] = []

          // Genre similarity
          const userGenres = userGame.genres?.map(g => typeof g === 'string' ? g : g.name || '') || []
          const gameGenres = game.genres?.map(g => typeof g === 'string' ? g : g.name || '') || []
          const commonGenres = userGenres.filter(g => gameGenres.includes(g))
          
          if (commonGenres.length > 0) {
            similarity += (commonGenres.length / Math.max(userGenres.length, gameGenres.length)) * 50
            reasons.push(`Similar genres: ${commonGenres.join(', ')}`)
          }

          // Platform similarity
          const userPlatforms = userGame.platforms?.map(p => p.name) || []
          const gamePlatforms = game.platforms?.map(p => p.name) || []
          const commonPlatforms = userPlatforms.filter(p => gamePlatforms.includes(p))
          
          if (commonPlatforms.length > 0) {
            similarity += 20
            reasons.push('Available on your platforms')
          }

          // Tag similarity
          const userTags = userGame.tags || []
          const gameTags = game.tags || []
          const commonTags = userTags.filter(t => gameTags.includes(t))
          
          if (commonTags.length > 0) {
            similarity += (commonTags.length / Math.max(userTags.length, gameTags.length)) * 30
            reasons.push(`Similar tags: ${commonTags.join(', ')}`)
          }

          return {
            gameId: game.id,
            score: Math.min(similarity, 100),
            reasons,
            confidence: 0.7,
            category: 'similar-games' as const
          }
        })
        .filter(rec => rec.score > 30)

      recommendations.push(...similarGames)
    })

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
  }, [games, userGames])

  // Play pattern recommendations
  const getPlayPatternRecommendations = useCallback((userPattern: any): RecommendationScore[] => {
    return games
      .filter(game => !userGames.some(ug => ug.id === game.id))
      .map(game => {
        let score = 0
        const reasons: string[] = []

        // Genre affinity scoring
        game.genres?.forEach(genre => {
          const genreName = typeof genre === 'string' ? genre : genre.name || ''
          const genreScore = userPattern.playtimeByGenre[genreName] || 0
          if (genreScore > 0) {
            score += Math.min(genreScore / 10, 40)
            reasons.push(`You love ${genreName} games`)
          }
        })

        // Completion rate matching
        if (userPattern.completionRate > 70) {
          // User completes games, recommend games they're likely to finish
          if (game.playStatus === 'completed') {
            score += 20
            reasons.push('Quality game - you finish what you start')
          }
        } else if (userPattern.completionRate < 30) {
          // User doesn't complete games, recommend shorter games
          if (game.hoursPlayed && game.hoursPlayed < 15) {
            score += 15
            reasons.push('Shorter game - perfect for your play style')
          }
        }

        // Session length matching
        if (userPattern.avgSessionLength > 0) {
          const gamePlaytime = game.hoursPlayed || 20
          const playtimeDiff = Math.abs(userPattern.avgSessionLength - gamePlaytime)
          
          if (playtimeDiff < 5) {
            score += 15
            reasons.push('Matches your average session length')
          }
        }

        return {
          gameId: game.id,
          score: Math.min(score, 100),
          reasons,
          confidence: 0.75,
          category: 'play-pattern' as const
        }
      })
      .filter(rec => rec.score > 25)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
  }, [games, userGames])

  // Generate all recommendations
  const generateRecommendations = useCallback((): RecommendationScore[] => {
    setIsAnalyzing(true)
    
    const userPattern = analyzeUserPatterns()
    let allRecommendations: RecommendationScore[] = []

    // Generate different types of recommendations
    if (currentMood) {
      allRecommendations.push(...getMoodRecommendations(currentMood))
    }
    
    allRecommendations.push(...getSimilarGamesRecommendations())
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

    setTimeout(() => setIsAnalyzing(false), 500) // Simulate processing time
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
