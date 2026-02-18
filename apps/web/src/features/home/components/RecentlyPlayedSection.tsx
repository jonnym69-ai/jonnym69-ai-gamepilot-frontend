import React from 'react'
import type { Game } from '@gamepilot/types'
import { getRecentlyPlayedGames } from '../utils/homeHelpers'

interface RecentlyPlayedProps {
  games: Game[]
  onLaunchGame: (gameId: string) => void
}

export const RecentlyPlayedSection: React.FC<RecentlyPlayedProps> = ({ games, onLaunchGame }) => {
  const recentGames = getRecentlyPlayedGames(games, 8)

  const formatLastPlayed = (game: Game) => {
    const lastPlayed = game.lastLocalPlayedAt || game.lastPlayed
    if (!lastPlayed) return 'Never'
    
    const date = new Date(lastPlayed)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else {
      return 'Just now'
    }
  }

  if (recentGames.length === 0) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-2xl">⏰</span>
            Recently Played
          </h2>
        </div>
        
        <div className="glass-morphism rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">🎮</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No recent games
          </h3>
          <p className="text-gray-300">
            Start playing some games to see them here!
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-2xl">⏰</span>
          Recently Played
        </h2>
        <div className="text-sm text-gray-400">
          {recentGames.length} games
        </div>
      </div>

      <div className="glass-morphism rounded-xl p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {recentGames.map((game) => (
            <div
              key={game.id}
              className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800/70 transition-all cursor-pointer group"
              onClick={() => {
  if (game.appId) {
    onLaunchGame(game.appId.toString())
  } else {
    console.warn('No appId found for game:', game.title)
  }
}}
            >
              {/* Game Cover */}
              <div className="w-full h-32 overflow-hidden rounded-md bg-gradient-to-br from-gaming-primary/20 to-gaming-secondary/20 mb-2">
                {game.coverImage ? (
                  <img
                    src={game.coverImage}
                    alt={game.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-2xl text-gray-500">🎮</div>
                  </div>
                )}
              </div>

              {/* Game Info */}
              <div className="space-y-1">
                <h4 className="font-medium text-white text-sm line-clamp-1 group-hover:text-gaming-accent transition-colors">
                  {game.title}
                </h4>
                
                <div className="text-xs text-gray-400">
                  {formatLastPlayed(game)}
                </div>

                {game.hoursPlayed && (
                  <div className="text-xs text-gray-300">
                    ⏱️ {Math.floor(game.hoursPlayed)}h
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (game.appId) {
                      onLaunchGame(game.appId.toString())
                    } else {
                      console.warn('No appId found for game:', game.title)
                    }
                  }}
                  className="w-full mt-2 px-2 py-1 bg-gaming-accent text-white rounded text-xs font-medium hover:bg-gaming-accent/80 transition-colors"
                >
                  Play
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
