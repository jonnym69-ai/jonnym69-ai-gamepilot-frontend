import React, { useState, useMemo } from 'react'
import type { Game } from '@gamepilot/types'

interface GenreAffinity {
  genre: string
  affinity: number
  playtime: number
  rating: number
  frequency: number
  lastPlayed: Date | null
  trend: 'increasing' | 'decreasing' | 'stable'
}

interface GenreInsight {
  genre: string
  affinity: number
  description: string
  recommendation: string
  icon: string
  color: string
}

interface GenreAffinityProps {
  games: Game[]
  userMoodProfile: any
}

export const GenreAffinityLearning: React.FC<GenreAffinityProps> = ({ games }) => {
  const [isLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate genre affinity based on user behavior
  const calculateGenreAffinity = useMemo((): GenreAffinity[] => {
    if (!games || games.length === 0) return []

    const genreMap: Record<string, GenreAffinity> = {}

    games.forEach(game => {
      game.genres?.forEach(genre => {
        const genreName = genre.name
        
        if (!genreMap[genreName]) {
          genreMap[genreName] = {
            genre: genreName,
            affinity: 0,
            playtime: 0,
            rating: 0,
            frequency: 0,
            lastPlayed: null,
            trend: 'stable'
          }
        }

        // Update affinity based on playtime
        if (game.hoursPlayed) {
          genreMap[genreName].playtime += game.hoursPlayed
          genreMap[genreName].affinity += Math.min(game.hoursPlayed / 10, 5) // Cap at 5 points per 10 hours
        }

        // Update affinity based on rating
        if (game.userRating) {
          genreMap[genreName].rating += game.userRating
          genreMap[genreName].affinity += (game.userRating - 3) * 2 // Rating bonus/penalty
        }

        // Update frequency
        genreMap[genreName].frequency += 1

        // Update last played
        if (game.lastPlayed && (!genreMap[genreName].lastPlayed || game.lastPlayed > genreMap[genreName].lastPlayed)) {
          genreMap[genreName].lastPlayed = game.lastPlayed
        }
      })
    })

    // Calculate trends
    Object.values(genreMap).forEach(affinity => {
      const recentGames = games.filter(game => 
        game.genres?.some(g => g.name === affinity.genre) && 
        game.lastPlayed && 
        game.lastPlayed > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      )

      const olderGames = games.filter(game => 
        game.genres?.some(g => g.name === affinity.genre) && 
        game.lastPlayed && 
        game.lastPlayed < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      )

      if (recentGames.length > olderGames.length) {
        affinity.trend = 'increasing'
      } else if (recentGames.length < olderGames.length) {
        affinity.trend = 'decreasing'
      } else {
        affinity.trend = 'stable'
      }
    })

    return Object.values(genreMap).sort((a, b) => b.affinity - a.affinity)
  }, [games])

  // Get genre insights
  const getGenreInsights = useMemo((): GenreInsight[] => {
    const insights: GenreInsight[] = []
    const affinities = calculateGenreAffinity

    if (affinities.length === 0) return insights

    // Top genres
    const topGenres = affinities.slice(0, 3)
    topGenres.forEach((affinity: GenreAffinity, index: number) => {
      insights.push({
        genre: affinity.genre,
        affinity: Math.round(affinity.affinity),
        description: `Your #${index + 1} favorite genre with ${Math.round(affinity.affinity)} affinity score`,
        recommendation: `Continue exploring ${affinity.genre} games`,
        icon: '🎯',
        color: '#10B981'
      })
    })

    // Hidden gems (high affinity, low playtime)
    const hiddenGems = affinities.filter(affinity => 
      affinity.affinity > 15 && affinity.playtime < 5
    ).slice(0, 2)

    hiddenGems.forEach(gem => {
      insights.push({
        genre: gem.genre,
        affinity: Math.round(gem.affinity),
        description: `Undiscovered ${gem.genre} gem with high affinity`,
        recommendation: `Try this ${gem.genre} game you haven't played much`,
        icon: '💎',
        color: '#8B5CF6'
      })
    })

    // Trending genres
    const trendingGenres = affinities.filter(affinity => affinity.trend === 'increasing').slice(0, 2)
    trendingGenres.forEach(trend => {
      insights.push({
        genre: trend.genre,
        affinity: Math.round(trend.affinity),
        description: `Trending ${trend.genre} in your library`,
        recommendation: `Explore more ${trend.genre} games`,
        icon: '🔥',
        color: '#F59E0B'
      })
    })

    return insights
  }, [calculateGenreAffinity])

  // Get genre statistics
  const getGenreStatistics = () => {
    const affinities = calculateGenreAffinity
    
    if (affinities.length === 0) {
      return {
        uniqueGenres: 0,
        averageAffinity: 0,
        averagePlaytime: 0,
        averageRating: 0,
        totalGames: games.length
      }
    }

    return {
      uniqueGenres: affinities.length,
      averageAffinity: Math.round(affinities.reduce((sum, a) => sum + a.affinity, 0) / affinities.length),
      averagePlaytime: Math.round(affinities.reduce((sum, a) => sum + a.playtime, 0) / affinities.length),
      averageRating: Math.round(affinities.reduce((sum, a) => sum + a.rating, 0) / affinities.length),
      totalGames: games.length
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker flex items-center justify-center">
        <div className="text-white text-xl">Analyzing your genre preferences...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker flex items-center justify-center">
        <div className="glass-morphism rounded-xl p-8 max-w-md w-full border border-red-500/30">
          <div className="text-center">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold text-white mb-4">Genre Analysis Error</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="px-6 py-2 bg-gaming-primary text-white rounded-lg hover:bg-gaming-primary/80"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="glass-morphism rounded-xl border border-white/10 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Your Genre Affinity</h2>
          <div className="text-sm text-gray-400">
            Learning from your gaming behavior and preferences
          </div>
        </div>

        {/* Genre Affinity Chart */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Genre Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {calculateGenreAffinity.slice(0, 9).map((affinity, index) => (
              <div key={affinity.genre} className="glass-morphism rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl font-bold text-white">{index + 1}</div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{affinity.genre}</div>
                      <div className="text-sm text-gray-400">
                        {affinity.frequency} games • {Math.round(affinity.playtime)}h played
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold" style={{ color: '#10B981' }}>
                      {Math.round(affinity.affinity)}
                    </div>
                  </div>
                </div>
                
                {/* Affinity Bar */}
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-full bg-gradient-to-r from-transparent to-currentMoodDisplay.color rounded-full"
                    style={{ width: `${Math.min(affinity.affinity, 100)}%` }}
                  />
                </div>
                
                {/* Trend Indicator */}
                <div className="flex items-center justify-between mt-2">
                  <div className="text-sm text-gray-400">Trend</div>
                  <div className="text-sm">
                    {affinity.trend === 'increasing' && '📈 Increasing'}
                    {affinity.trend === 'decreasing' && '📉 Decreasing'}
                    {affinity.trend === 'stable' && '📊 Stable'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Genre Insights */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Gaming Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getGenreInsights.map((insight, index) => (
              <div key={index} className="glass-morphism rounded-lg p-4 border border-white/10">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{insight.icon}</div>
                  <div className="flex-1">
                    <div className="text-white font-medium mb-1">{insight.description}</div>
                    <div className="text-sm text-gray-400 mb-2">{insight.recommendation}</div>
                    <div className="text-xs text-gray-500">
                      Affinity: {insight.affinity} • {insight.genre}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="glass-morphism rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Detailed Analysis</h3>
          <div className="text-sm text-gray-400 mb-4">
            Based on your {games.length} games in library
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{calculateGenreAffinity.length}</div>
              <div className="text-sm text-gray-400">Unique Genres</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {getGenreStatistics().averageAffinity}
              </div>
              <div className="text-sm text-gray-400">Avg Affinity</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {getGenreStatistics().averagePlaytime}
              </div>
              <div className="text-sm text-gray-400">Avg Hours</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {getGenreStatistics().averageRating}
              </div>
              <div className="text-sm text-gray-400">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>
  )
}
