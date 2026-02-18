import React from 'react'

interface ParsedWishlistItem {
  appId: number
  name: string
  capsuleImage: string
  price?: {
    currency: string
    initial: number
    final: number
    discount_percent: number
    initial_formatted: string
    final_formatted: string
  }
  releaseDate: string
  tags: string[]
  isFree: boolean
}

interface WishlistRowProps {
  games: ParsedWishlistItem[]
}

export const WishlistRow: React.FC<WishlistRowProps> = ({ games }) => {
  const displayGames = games.slice(0, 10) // Show up to 10 games

  if (displayGames.length === 0) {
    return (
      <div className="glass-morphism rounded-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="text-2xl">❤️</span>
          Steam Wishlist
        </h2>
        <div className="text-center py-12">
          <div className="text-gray-400 text-xl mb-4">💝</div>
          <p className="text-gray-300 mb-2">Your wishlist is empty</p>
          <p className="text-gray-400 text-sm">
            Add games to your Steam wishlist to see them here
          </p>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="glass-morphism rounded-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-2xl">❤️</span>
          Steam Wishlist
        </h2>
        <div className="text-gray-400 text-sm">
          {displayGames.length} {displayGames.length === 1 ? 'game' : 'games'}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-4 pb-4">
          {displayGames.map((game) => (
            <div
              key={game.appId}
              className="flex-shrink-0 w-48 bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700/50 hover:border-gaming-accent/50 transition-all duration-200 hover:scale-105 cursor-pointer"
            >
              {/* Game Cover */}
              <div className="relative h-32">
                <img
                  src={game.capsuleImage}
                  alt={game.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Discount Badge */}
                {game.price && game.price.discount_percent > 0 && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 rounded text-white text-xs font-bold">
                    -{game.price.discount_percent}%
                  </div>
                )}
                
                {/* Free Badge */}
                {game.isFree && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 rounded text-white text-xs font-bold">
                    FREE
                  </div>
                )}
              </div>

              {/* Game Info */}
              <div className="p-3">
                <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                  {game.name}
                </h3>

                {/* Price */}
                <div className="mb-2">
                  {game.isFree ? (
                    <span className="text-green-400 font-bold text-sm">Free to Play</span>
                  ) : game.price ? (
                    <div className="flex items-center gap-2">
                      {game.price.discount_percent > 0 && (
                        <span className="text-gray-400 line-through text-xs">
                          {game.price.currency} {(game.price.initial / 100).toFixed(2)}
                        </span>
                      )}
                      <span className="text-white font-bold text-sm">
                        {game.price.currency} {(game.price.final / 100).toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">Price not available</span>
                  )}
                </div>

                {/* Release Date */}
                <div className="text-gray-400 text-xs">
                  {formatDate(game.releaseDate)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View More */}
      {games.length > 10 && (
        <div className="text-center mt-4">
          <button className="px-4 py-2 bg-gaming-accent hover:bg-gaming-primary text-white rounded-lg text-sm font-medium transition-colors">
            View {games.length - 10} more games
          </button>
        </div>
      )}
    </div>
  )
}
