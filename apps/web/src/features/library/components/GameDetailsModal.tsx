import React from 'react'
import type { Game } from '@gamepilot/types'

interface GameDetailsModalProps {
  game: Game | null
  onClose: () => void
  onLaunchGame: (appId: number) => void
}

export const GameDetailsModal: React.FC<GameDetailsModalProps> = ({ 
  game, 
  onClose, 
  onLaunchGame 
}) => {
  if (!game) return null

  const handlePlayNow = () => {
    if (game.appId) {
      onLaunchGame(game.appId)
      onClose()
    } else {
      console.warn('No appId found for game:', game.title)
    }
  }

  const formatPlaytime = (hours?: number) => {
    if (!hours) return '0h'
    const wholeHours = Math.floor(hours)
    const minutes = Math.round((hours - wholeHours) * 60)
    return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative">
          {/* Cover Image */}
          <div className="aspect-video w-full bg-gradient-to-br from-gaming-primary/20 to-gaming-secondary/20">
            {game.coverImage ? (
              <img
                src={game.coverImage}
                alt={game.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-6xl text-gray-500">🎮</div>
              </div>
            )}
          </div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title and Basic Info */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">{game.title}</h2>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
              {game.developer && (
                <span>Developer: {game.developer}</span>
              )}
              {game.releaseDate && (
                <span>Released: {new Date(game.releaseDate).getFullYear()}</span>
              )}
              {game.hoursPlayed && (
                <span>Playtime: {formatPlaytime(game.hoursPlayed)}</span>
              )}
            </div>
          </div>

          {/* Status and Actions */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                game.playStatus === 'playing' ? 'bg-green-500' :
                game.playStatus === 'completed' ? 'bg-blue-500' :
                game.playStatus === 'backlog' ? 'bg-yellow-500' :
                'bg-gray-500'
              }`} />
              <span className="text-white capitalize">{game.playStatus || 'Unknown'}</span>
            </div>
            
            <button
              onClick={handlePlayNow}
              className="px-6 py-2 bg-gradient-to-r from-gaming-primary to-gaming-secondary text-white rounded-lg font-semibold hover:opacity-90 transition-all"
            >
              ▶️ Play Now
            </button>
          </div>

          {/* Genres */}
          {game.genres && game.genres.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {game.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-gaming-accent/20 rounded-full text-gaming-accent text-sm"
                  >
                    {genre.name || genre.description}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {game.tags && game.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {game.tags.slice(0, 10).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-700 rounded text-gray-300 text-sm"
                  >
                    {tag}
                  </span>
                ))}
                {game.tags.length > 10 && (
                  <span className="px-3 py-1 bg-gray-700 rounded text-gray-400 text-sm">
                    +{game.tags.length - 10} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {game.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
              <p className="text-gray-300 leading-relaxed">{game.description}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {game.hoursPlayed && (
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">{formatPlaytime(game.hoursPlayed)}</div>
                <div className="text-sm text-gray-400">Total Playtime</div>
              </div>
            )}
            
            {game.localSessionCount && (
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">{game.localSessionCount}</div>
                <div className="text-sm text-gray-400">Sessions</div>
              </div>
            )}
            
            {game.localSessionMinutes && (
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">{Math.floor(game.localSessionMinutes / 60)}h</div>
                <div className="text-sm text-gray-400">Local Time</div>
              </div>
            )}
            
            {game.userRating && (
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">⭐ {game.userRating}</div>
                <div className="text-sm text-gray-400">Your Rating</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
