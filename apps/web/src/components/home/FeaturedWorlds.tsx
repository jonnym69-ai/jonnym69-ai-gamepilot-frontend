import React from 'react'
import { useFeaturedGames } from '../../hooks/useFeaturedGames'
import { launchGame } from '../../utils/launchGame'

export const FeaturedWorlds: React.FC = () => {
  const featuredGames = useFeaturedGames(6)

  const handleLaunch = (game: any) => {
    // Extract appId from game.id (Steam games use format "steam-{appId}")
    const appIdMatch = game.id?.toString().match(/^steam-(\d+)$/)
    const appId = appIdMatch ? parseInt(appIdMatch[1], 10) : null
    
    if (appId) {
      launchGame(appId)
    } else {
      console.warn('No valid appId found for game:', game.title)
    }
  }

  if (featuredGames.length === 0) {
    return (
      <div className="glass-morphism rounded-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="text-2xl">🌍</span>
          Your Worlds
        </h2>
        <div className="text-center py-12">
          <div className="text-gray-400 text-xl mb-4">🎮</div>
          <p className="text-gray-300">No featured games yet</p>
          <p className="text-gray-400 text-sm mt-2">Add games to your library to see them here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-morphism rounded-xl p-8">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <span className="text-2xl">🌍</span>
        Your Worlds
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredGames.map((game, index) => (
          <div 
            key={game.id} 
            className="group cursor-pointer transform transition-all hover:scale-105 animate-fade-in"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-gaming-accent/50">
              {/* Game Cover with Overlay */}
              <div className="aspect-video relative">
                <img 
                  src={game.coverImage || 'https://via.placeholder.com/400x225/1e3a8a/ffffff?text=Game+World'} 
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                {/* Floating Elements */}
                <div className="absolute top-3 left-3 px-3 py-1 bg-gaming-accent/90 rounded-full">
                  <span className="text-white text-xs font-bold">⭐ Featured</span>
                </div>
                
                {/* Playtime Badge */}
                {game.hoursPlayed && game.hoursPlayed > 0 && (
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 rounded text-xs text-white font-medium">
                    {Math.floor(game.hoursPlayed)}h played
                  </div>
                )}
              </div>
              
              {/* Game Details */}
              <div className="p-6">
                <h3 className="text-white font-bold text-lg mb-3 group-hover:text-gaming-accent transition-colors">
                  {game.title}
                </h3>
                
                {/* Game Stats */}
                <div className="space-y-2">
                  {game.genres && game.genres.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {game.genres.slice(0, 3).map((genre, idx) => (
                        <span 
                          key={idx} 
                          className="px-2 py-1 bg-gaming-primary/20 rounded text-xs text-gaming-primary"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {game.releaseYear || 'Unknown Year'}
                    </span>
                    <span className="text-gaming-accent font-medium">
                      {game.playStatus}
                    </span>
                  </div>
                </div>
                
                {/* Action Button */}
                <button 
                  onClick={() => handleLaunch(game)}
                  className="w-full mt-4 px-4 py-2 bg-gaming-accent hover:bg-gaming-primary text-white rounded-lg font-medium transition-colors transform hover:scale-105 flex items-center justify-center gap-2"
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
