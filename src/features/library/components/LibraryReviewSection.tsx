import React from 'react'
import { useLibraryStore } from '../../../stores/useLibraryStore'

interface LibraryReviewSectionProps {
  className?: string
}

export const LibraryReviewSection: React.FC<LibraryReviewSectionProps> = ({ className = '' }) => {
  const { games } = useLibraryStore()

  // Calculate review metrics
  const totalGames = games.length
  const recentlyPlayed = games
    .filter(game => game.lastPlayed && typeof game.lastPlayed === 'number')
    .sort((a, b) => (b.lastPlayed?.getTime() || 0) - (a.lastPlayed?.getTime() || 0))
    .slice(0, 3)

  const mostPlayedGames = games
    .filter(game => game.hoursPlayed && game.hoursPlayed > 0)
    .sort((a, b) => b.hoursPlayed! - a.hoursPlayed!)
    .slice(0, 3)

  const completedGames = games.filter(game => game.playStatus === 'completed')

  // Get games that need attention
  const backlogGames = games.filter(game => game.playStatus === 'backlog')
  const unplayedGames = games.filter(game => game.playStatus === 'unplayed')

  const formatLastPlayed = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return 'Just now'
  }

  const formatPlaytime = (hours: number) => {
    if (hours < 1) return '< 1h'
    if (hours < 24) return `${Math.floor(hours)}h`
    if (hours < 168) return `${Math.floor(hours / 24)}d`
    return `${Math.floor(hours / 168)}w`
  }

  const getRecommendation = (game: any) => {
    // Simple recommendation based on play status
    if (game.playStatus === 'unplayed') return 'New adventure awaits'
    if (game.playStatus === 'backlog') return 'Time to explore'
    if (game.playStatus === 'playing') return 'Continue your journey'
    if (game.playStatus === 'completed') return 'Ready for replay'
    return 'Ready to play'
  }

  return (
    <div className={`glass-morphism rounded-2xl p-6 border border-gray-700/30 shadow-2xl backdrop-blur-md ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
        <h2 className="text-xl font-bold text-white">📝 Library Review</h2>
        <div className="ml-auto text-sm text-gray-400">Your gaming insights</div>
      </div>

      {/* Review Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700/30">
          <div className="text-2xl font-bold text-green-400 mb-2">{completedGames.length}</div>
          <div className="text-sm text-gray-400 mb-1">Completed Games</div>
          <div className="text-xs text-gray-500">
            {totalGames > 0 ? Math.round((completedGames.length / totalGames) * 100) : 0}% completion rate
          </div>
        </div>
        
        <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700/30">
          <div className="text-2xl font-bold text-yellow-400 mb-2">{backlogGames.length}</div>
          <div className="text-sm text-gray-400 mb-1">In Backlog</div>
          <div className="text-xs text-gray-500">Ready to explore</div>
        </div>
        
        <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700/30">
          <div className="text-2xl font-bold text-blue-400 mb-2">{unplayedGames.length}</div>
          <div className="text-sm text-gray-400 mb-1">Unplayed</div>
          <div className="text-xs text-gray-500">New discoveries</div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">🎯 Quick Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mostPlayedGames.slice(0, 3).map((game) => (
            <div key={game.id} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/20 hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                  {game.coverImage ? (
                    <img 
                      src={game.coverImage} 
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-lg">🎮</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium line-clamp-1">{game.title}</div>
                  <div className="text-xs text-gray-400">
                    {formatPlaytime(game.hoursPlayed || 0)} played
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-300 italic">
                {getRecommendation(game)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">🕒 Recent Activity</h3>
        <div className="space-y-2">
          {recentlyPlayed.slice(0, 3).map((game) => (
            <div key={game.id} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/20 hover:bg-gray-800/50 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                {game.coverImage ? (
                  <img 
                    src={game.coverImage} 
                    alt={game.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-lg">🎮</span>
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
                <div className="text-xs text-gray-500 mt-1">
                  Last played {formatLastPlayed(game.lastPlayed?.getTime())}
                </div>
              </div>
              <div className="text-right">
                {game.hoursPlayed && game.hoursPlayed > 0 && (
                  <div className="text-xs text-gray-400">
                    {Math.floor(game.hoursPlayed)}h total
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Items */}
      <div className="pt-4 border-t border-gray-700/30">
        <div className="flex gap-3 justify-center">
          <button className="px-4 py-2 bg-gaming-primary/20 text-gaming-primary rounded-lg hover:bg-gaming-primary/30 transition-all duration-200 text-sm font-medium">
            🎮 Browse Library
          </button>
          <button className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-all duration-200 text-sm font-medium">
            📊 View Stats
          </button>
          <button className="px-4 py-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-all duration-200 text-sm font-medium">
            🎯 Get Recommendations
          </button>
        </div>
      </div>
    </div>
  )
}
