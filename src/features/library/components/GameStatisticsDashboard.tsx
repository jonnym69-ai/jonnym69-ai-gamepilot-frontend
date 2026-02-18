import React, { useState, useMemo } from 'react'
import type { Game, PlayStatus } from '@gamepilot/types'
import { PageErrorBoundary } from '../../components/ErrorBoundary'
import { Loading } from '../../components/Loading'

interface GameStatisticsDashboardProps {
  games: Game[]
  onClose?: () => void
}

interface Statistics {
  totalGames: number
  totalPlaytime: number
  averagePlaytime: number
  completionRate: number
  favoriteCount: number
  recentlyPlayed: number
  genreDistribution: Record<string, number>
  platformDistribution: Record<string, number>
  statusDistribution: Record<PlayStatus, number>
  ratingDistribution: Record<number, number>
  playtimeByGenre: Record<string, number>
  monthlyPlaytime: Record<string, number>
  topRatedGames: Game[]
  mostPlayedGames: Game[]
  recentlyAddedGames: Game[]
}

export const GameStatisticsDashboard: React.FC<GameStatisticsDashboardProps> = ({ 
  games, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'genres' | 'platforms' | 'timeline'>('overview')
  const [timeRange, setTimeRange] = useState<'all' | 'year' | 'month' | 'week'>('all')

  const statistics = useMemo((): Statistics => {
    const now = new Date()
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)

    const filterGamesByTime = (games: Game[]) => {
      switch (timeRange) {
        case 'year':
          return games.filter(game => game.addedAt >= oneYearAgo)
        case 'month':
          return games.filter(game => game.addedAt >= oneMonthAgo)
        case 'week':
          return games.filter(game => game.addedAt >= oneWeekAgo)
        default:
          return games
      }
    }

    const filteredGames = filterGamesByTime(games)
    
    // Basic statistics
    const totalGames = filteredGames.length
    const totalPlaytime = filteredGames.reduce((sum, game) => sum + (game.hoursPlayed || 0), 0)
    const averagePlaytime = totalGames > 0 ? totalPlaytime / totalGames : 0
    const completedGames = filteredGames.filter(game => game.playStatus === 'completed').length
    const completionRate = totalGames > 0 ? (completedGames / totalGames) * 100 : 0
    const favoriteCount = filteredGames.filter(game => game.isFavorite).length
    const recentlyPlayed = filteredGames.filter(game => 
      game.lastPlayed && (now.getTime() - game.lastPlayed.getTime()) < 7 * 24 * 60 * 60 * 1000
    ).length

    // Genre distribution
    const genreDistribution: Record<string, number> = {}
    filteredGames.forEach(game => {
      game.genres?.forEach(genre => {
        genreDistribution[genre.name] = (genreDistribution[genre.name] || 0) + 1
      })
    })

    // Platform distribution
    const platformDistribution: Record<string, number> = {}
    filteredGames.forEach(game => {
      game.platforms?.forEach(platform => {
        platformDistribution[platform.name || platform] = (platformDistribution[platform.name || platform] || 0) + 1
      })
    })

    // Status distribution
    const statusDistribution: Record<PlayStatus, number> = {
      unplayed: 0,
      playing: 0,
      completed: 0,
      paused: 0,
      abandoned: 0,
      backlog: 0
    }
    filteredGames.forEach(game => {
      statusDistribution[game.playStatus] = (statusDistribution[game.playStatus] || 0) + 1
    })

    // Rating distribution
    const ratingDistribution: Record<number, number> = {}
    filteredGames.forEach(game => {
      if (game.userRating) {
        const rating = Math.floor(game.userRating)
        ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1
      }
    })

    // Playtime by genre
    const playtimeByGenre: Record<string, number> = {}
    filteredGames.forEach(game => {
      if (game.hoursPlayed && game.genres) {
        game.genres.forEach(genre => {
          playtimeByGenre[genre.name] = (playtimeByGenre[genre.name] || 0) + game.hoursPlayed
        })
      }
    })

    // Monthly playtime (mock data for now)
    const monthlyPlaytime: Record<string, number> = {}
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    months.forEach(month => {
      monthlyPlaytime[month] = Math.random() * 100 + 20 // Mock data
    })

    // Top rated games
    const topRatedGames = filteredGames
      .filter(game => game.userRating && game.userRating >= 4)
      .sort((a, b) => (b.userRating || 0) - (a.userRating || 0))
      .slice(0, 5)

    // Most played games
    const mostPlayedGames = filteredGames
      .filter(game => game.hoursPlayed && game.hoursPlayed > 0)
      .sort((a, b) => (b.hoursPlayed || 0) - (a.hoursPlayed || 0))
      .slice(0, 5)

    // Recently added games
    const recentlyAddedGames = filteredGames
      .sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime())
      .slice(0, 5)

    return {
      totalGames,
      totalPlaytime,
      averagePlaytime,
      completionRate,
      favoriteCount,
      recentlyPlayed,
      genreDistribution,
      platformDistribution,
      statusDistribution,
      ratingDistribution,
      playtimeByGenre,
      monthlyPlaytime,
      topRatedGames,
      mostPlayedGames,
      recentlyAddedGames
    }
  }, [games, timeRange])

  const formatHours = (hours: number): string => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`
    } else if (hours < 24) {
      return `${hours.toFixed(1)}h`
    } else {
      const days = Math.floor(hours / 24)
      const remainingHours = hours % 24
      return `${days}d ${remainingHours.toFixed(0)}h`
    }
  }

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Total Games</span>
          <span className="text-2xl">🎮</span>
        </div>
        <div className="text-2xl font-bold text-white">{statistics.totalGames}</div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Total Playtime</span>
          <span className="text-2xl">⏱️</span>
        </div>
        <div className="text-2xl font-bold text-white">{formatHours(statistics.totalPlaytime)}</div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Completion Rate</span>
          <span className="text-2xl">✅</span>
        </div>
        <div className="text-2xl font-bold text-white">{statistics.completionRate.toFixed(1)}%</div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Favorites</span>
          <span className="text-2xl">⭐</span>
        </div>
        <div className="text-2xl font-bold text-white">{statistics.favoriteCount}</div>
      </div>
    </div>
  )

  const renderGenres = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Genre Distribution</h3>
        <div className="space-y-2">
          {Object.entries(statistics.genreDistribution)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([genre, count]) => (
              <div key={genre} className="flex items-center justify-between">
                <span className="text-gray-300">{genre}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(count / statistics.totalGames) * 100}%` }}
                    />
                  </div>
                  <span className="text-gray-400 text-sm w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Playtime by Genre</h3>
        <div className="space-y-2">
          {Object.entries(statistics.playtimeByGenre)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([genre, hours]) => (
              <div key={genre} className="flex items-center justify-between">
                <span className="text-gray-300">{genre}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(hours / statistics.totalPlaytime) * 100}%` }}
                    />
                  </div>
                  <span className="text-gray-400 text-sm w-16 text-right">{formatHours(hours)}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )

  const renderPlatforms = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Platform Distribution</h3>
        <div className="space-y-2">
          {Object.entries(statistics.platformDistribution)
            .sort(([,a], [,b]) => b - a)
            .map(([platform, count]) => (
              <div key={platform} className="flex items-center justify-between">
                <span className="text-gray-300">{platform}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${(count / statistics.totalGames) * 100}%` }}
                    />
                  </div>
                  <span className="text-gray-400 text-sm w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Status Distribution</h3>
        <div className="space-y-2">
          {Object.entries(statistics.statusDistribution).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between">
              <span className="text-gray-300 capitalize">{status}</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${(count / statistics.totalGames) * 100}%` }}
                  />
                </div>
                <span className="text-gray-400 text-sm w-12 text-right">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderTimeline = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Top Rated Games</h3>
        <div className="space-y-2">
          {statistics.topRatedGames.map((game, index) => (
            <div key={game.id} className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 w-6">#{index + 1}</span>
                <div>
                  <div className="text-white font-medium">{game.title}</div>
                  <div className="text-gray-400 text-sm">
                    {game.genres?.slice(0, 2).map(g => g.name).join(', ')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">⭐</span>
                <span className="text-white font-medium">{game.userRating?.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Most Played Games</h3>
        <div className="space-y-2">
          {statistics.mostPlayedGames.map((game, index) => (
            <div key={game.id} className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 w-6">#{index + 1}</span>
                <div>
                  <div className="text-white font-medium">{game.title}</div>
                  <div className="text-gray-400 text-sm">
                    {game.genres?.slice(0, 2).map(g => g.name).join(', ')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">⏱️</span>
                <span className="text-white font-medium">{formatHours(game.hoursPlayed || 0)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Game Statistics Dashboard</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-gray-400">Time Range:</span>
          <div className="flex gap-2">
            {(['all', 'year', 'month', 'week'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-gray-700">
          {(['overview', 'genres', 'platforms', 'timeline'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'genres' && renderGenres()}
          {activeTab === 'platforms' && renderPlatforms()}
          {activeTab === 'timeline' && renderTimeline()}
        </div>
      </div>
    </div>
  )
}
