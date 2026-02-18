import React from 'react'
import type { Game } from '@gamepilot/types'
import { launchGame } from '../../utils/launchGame'

interface ContinuePlayingProps {
  games: Game[]
}

export const ContinuePlaying: React.FC<ContinuePlayingProps> = ({ games }) => {
  // Get last 5 games sorted by playtime
  const recentGames = games
    .sort((a, b) => (b.hoursPlayed || 0) - (a.hoursPlayed || 0))
    .slice(0, 5)

  const handleLaunch = (game: Game) => {
    // Extract appId from game.id (Steam games use format "steam-{appId}")
    const appIdMatch = game.id?.toString().match(/^steam-(\d+)$/)
    const appId = appIdMatch ? parseInt(appIdMatch[1], 10) : null
    
    if (appId) {
      launchGame(appId)
    } else {
      console.warn('No valid appId found for game:', game.title)
    }
  }

  if (recentGames.length === 0) {
    return (
      <div className="glass-morphism rounded-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="text-2xl">▶️</span>
          Continue Playing
        </h2>
        <div className="text-center py-12">
          <div className="text-gray-400 text-xl mb-4">🎮</div>
          <p className="text-gray-300">No games in your library yet</p>
          <p className="text-gray-400 text-sm mt-2">Import your Steam games to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-morphism rounded-xl p-8">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <span className="text-2xl">▶️</span>
        Continue Playing
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {recentGames.map((game, index) => (
          <div 
            key={game.id} 
            className="group cursor-pointer transform transition-all hover:scale-105 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="relative overflow-hidden rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-gaming-accent/50">
              {/* Game Cover */}
              <div className="aspect-video relative">
                <img 
                  src={game.coverImage || 'https://via.placeholder.com/300x400/1e3a8a/ffffff?text=Game'} 
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Playtime Badge */}
                <div className="absolute top-2 right-2 px-2 py-1 bg-gaming-accent/90 rounded text-xs text-white font-medium">
                  {game.hoursPlayed ? `${Math.floor(game.hoursPlayed)}h` : 'New'}
                </div>
              </div>
              
              {/* Game Info */}
              <div className="p-4">
                <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">{game.title}</h3>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400 text-xs">
                    {game.platforms?.[0]?.name || 'Unknown Platform'}
                  </span>
                  <span className="text-gaming-accent text-xs font-medium">
                    {game.playStatus}
                  </span>
                </div>
                
                {/* Play Button */}
                <button
                  onClick={() => handleLaunch(game)}
                  className="w-full px-3 py-2 bg-gradient-to-r from-gaming-primary to-gaming-secondary text-white rounded text-xs font-medium transition-all transform hover:scale-105 flex items-center justify-center gap-1"
                >
                  <span>▶️</span>
                  Play
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
