import React from 'react'
import { Game } from '../types'

interface RecentlyPlayedProps {
  games: Game[]
  onGameClick?: (game: Game) => void
  maxItems?: number
}

export const RecentlyPlayed: React.FC<RecentlyPlayedProps> = ({
  games,
  onGameClick,
  maxItems = 6
}) => {
  const displayGames = games.slice(0, maxItems)

  const formatLastPlayed = (dateString?: string) => {
    if (!dateString) return 'Never'
    
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
    return date.toLocaleDateString()
  }

  if (games.length === 0) {
    return (
      <div className="glass-morphism rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-xl mx-auto mb-4 flex items-center justify-center">
          <span className="text-3xl">🕐</span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Recent Games</h3>
        <p className="text-gray-400">
          Start playing games to see your recent activity here.
        </p>
      </div>
    )
  }

  return (
    <div className="glass-morphism rounded-xl p-6 cinematic-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-lg flex items-center justify-center">
            <span className="text-xl">🕐</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Recently Played</h2>
            <p className="text-sm text-gray-400">Jump back into your recent adventures</p>
          </div>
        </div>
        
        {games.length > maxItems && (
          <button className="text-accent-400 hover:text-accent-300 transition-colors text-sm font-medium">
            View All ({games.length})
          </button>
        )}
      </div>

      {/* Games List */}
      <div className="space-y-4">
        {displayGames.map((game, index) => (
          <div
            key={game.id}
            onClick={() => onGameClick?.(game)}
            className="group flex items-center gap-4 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-all duration-200 cursor-pointer"
            style={{
              animationDelay: `${index * 50}ms`
            }}
          >
            {/* Game Cover */}
            <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800 flex-shrink-0">
              {game.coverImage ? (
                <img
                  src={game.coverImage}
                  alt={game.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl">🎮</span>
                </div>
              )}
              
              {/* Status indicator */}
              {game.playStatus && (
                <div className="absolute top-1 right-1">
                  <span className={`
                    w-2 h-2 rounded-full block
                    ${game.playStatus === 'playing' ? 'bg-green-500' : ''}
                    ${game.playStatus === 'completed' ? 'bg-blue-500' : ''}
                    ${game.playStatus === 'backlog' ? 'bg-yellow-500' : ''}
                    ${game.playStatus === 'abandoned' ? 'bg-red-500' : ''}
                  `} />
                </div>
              )}
            </div>

            {/* Game Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium group-hover:text-gaming-accent transition-colors truncate">
                {game.title}
              </h3>
              <p className="text-sm text-gray-400 truncate">
                {game.developer || 'Unknown Developer'}
              </p>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span>📅 {formatLastPlayed(game.lastPlayed?.toISOString())}</span>
                {game.hoursPlayed && <span>⏱️ {game.hoursPlayed}h</span>}
                {game.userRating && <span>⭐ {game.userRating}</span>}
              </div>
            </div>

            {/* Platform Icons */}
            <div className="flex gap-2">
              {game.platforms?.slice(0, 2).map((platform) => (
                <span
                  key={platform.name}
                  className="px-2 py-1 bg-gaming-primary/20 text-gaming-primary rounded text-xs"
                >
                  {platform.name}
                </span>
              ))}
            </div>

            {/* Play Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                // Handle play action
              }}
              className="w-10 h-10 bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-lg flex items-center justify-center text-white hover:opacity-90 transition-opacity opacity-0 group-hover:opacity-100"
            >
              ▶️
            </button>
          </div>
        ))}
      </div>

      {/* Continue Playing Section */}
      {games.some(game => game.playStatus === 'playing') && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Continue Playing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {games
              .filter(game => game.playStatus === 'playing')
              .slice(0, 2)
              .map((game) => (
                <div
                  key={game.id}
                  onClick={() => onGameClick?.(game)}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 cursor-pointer hover:border-green-500/40 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800">
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
                  <div className="flex-1">
                    <h4 className="text-white font-medium text-sm truncate">{game.title}</h4>
                    <p className="text-xs text-gray-400">
                      {game.hoursPlayed ? `${game.hoursPlayed}h played` : 'Just started'}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                    ▶
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
