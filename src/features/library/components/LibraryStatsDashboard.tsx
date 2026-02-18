import React from 'react'
import { useLibraryStore } from '../../../stores/useLibraryStore'

interface LibraryStatsDashboardProps {
  className?: string
}

export const LibraryStatsDashboard: React.FC<LibraryStatsDashboardProps> = ({ className = '' }) => {
  const { games } = useLibraryStore()

  // Calculate stats
  const totalGames = games.length
  const steamGames = games.filter(game => game.appId && game.appId > 0).length
  const completedGames = games.filter(game => game.playStatus === 'completed').length
  const totalPlaytime = games.reduce((sum, game) => sum + (game.hoursPlayed || 0), 0)
  
  // Genre distribution
  const genreCounts = games.reduce((acc, game) => {
    if (game.genres && game.genres.length > 0) {
      const genre = typeof game.genres[0] === 'string' ? game.genres[0] : game.genres[0].name
      acc[genre] = (acc[genre] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)
  
  const topGenres = Object.entries(genreCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)

  // Recent activity (using id as fallback for sorting)
  const recentlyAdded = games
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 5)

  const formatPlaytime = (hours: number) => {
    if (hours < 1) return '< 1h'
    if (hours < 24) return `${Math.floor(hours)}h`
    if (hours < 168) return `${Math.floor(hours / 24)}d`
    return `${Math.floor(hours / 168)}w`
  }

  return (
    <div className={`glass-morphism rounded-2xl p-6 border border-gray-700/30 shadow-2xl backdrop-blur-md ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-600 rounded-full"></div>
        <h2 className="text-xl font-bold text-white">📊 Library Stats</h2>
        <div className="ml-auto text-sm text-gray-400">Your gaming overview</div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700/30">
          <div className="text-3xl font-bold text-white mb-1">{totalGames}</div>
          <div className="text-sm text-gray-400">Total Games</div>
        </div>
        
        <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700/30">
          <div className="text-3xl font-bold text-green-400 mb-1">{steamGames}</div>
          <div className="text-sm text-gray-400">Steam Games</div>
        </div>
        
        <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700/30">
          <div className="text-3xl font-bold text-blue-400 mb-1">{completedGames}</div>
          <div className="text-sm text-gray-400">Completed</div>
        </div>
        
        <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700/30">
          <div className="text-3xl font-bold text-purple-400 mb-1">{formatPlaytime(totalPlaytime)}</div>
          <div className="text-sm text-gray-400">Total Playtime</div>
        </div>
      </div>

      {/* Top Genres */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">🎮 Top Genres</h3>
        <div className="flex gap-3 flex-wrap">
          {topGenres.map(([genre, count]) => (
            <div key={genre} className="px-3 py-1 bg-gray-800/50 rounded-lg border border-gray-700/30">
              <span className="text-white text-sm font-medium">{genre}</span>
              <span className="text-gray-400 text-xs ml-2">({count})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">🕒 Recently Added</h3>
        <div className="space-y-2">
          {recentlyAdded.slice(0, 3).map((game) => (
            <div key={game.id} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/20 hover:bg-gray-800/50 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                {game.coverImage ? (
                  <img 
                    src={game.coverImage} 
                    alt={game.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xl">🎮</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium line-clamp-1">{game.title}</div>
                <div className="text-gray-400 text-xs">
                  {game.genres && game.genres.length > 0 && (
                    typeof game.genres[0] === 'string' ? game.genres[0] : game.genres[0].name
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">
                  {game.playStatus && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      game.playStatus === 'completed' ? 'bg-green-600/30 text-green-300' :
                      game.playStatus === 'playing' ? 'bg-blue-600/30 text-blue-300' :
                      game.playStatus === 'backlog' ? 'bg-yellow-600/30 text-yellow-300' :
                      'bg-gray-600/30 text-gray-300'
                    }`}>
                      {game.playStatus}
                    </span>
                  )}
                </div>
                {game.hoursPlayed && game.hoursPlayed > 0 && (
                  <div className="text-xs text-gray-400 mt-1">
                    {formatPlaytime(game.hoursPlayed)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
