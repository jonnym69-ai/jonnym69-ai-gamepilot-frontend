import React, { useState, useMemo } from 'react'
import { getMockStoreRecommendations } from '../utils/homeHelpers'

interface WhatShouldIBuyProps {
  games: any[]
}

export const WhatShouldIBuySection: React.FC<WhatShouldIBuyProps> = ({ games }) => {
  const [showUnreleasedOnly, setShowUnreleasedOnly] = useState(false)

  const recommendations = useMemo(() => {
    const baseRecommendations = getMockStoreRecommendations(games)

    if (!showUnreleasedOnly) {
      return baseRecommendations
    }

    // Filter for unreleased games (games with future release dates)
    return baseRecommendations.filter(rec => {
      // Mock unreleased games - in real implementation, check against actual release dates
      // For now, randomly mark some games as unreleased for demonstration
      return Math.random() > 0.7 // ~30% of games shown as unreleased
    }).map(rec => ({
      ...rec,
      title: `${rec.title} (Coming Soon)`,
      price: 'TBA',
      reason: `${rec.reason} • Pre-order now!`
    }))
  }, [games, showUnreleasedOnly])

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-2xl">🛒</span>
          What Should I Buy?
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowUnreleasedOnly(!showUnreleasedOnly)}
            className={`text-sm px-3 py-1 rounded-full transition-all ${
              showUnreleasedOnly
                ? 'bg-gaming-accent text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            {showUnreleasedOnly ? '🎯 Show Released Games' : '🚀 Show Unreleased Only'}
          </button>
          <div className="text-sm text-gray-400">
            Based on your library
          </div>
        </div>
      </div>

      <div className="glass-morphism rounded-xl p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-300 text-sm">
              {showUnreleasedOnly
                ? '🎯 Discover upcoming games worth pre-ordering!'
                : 'Coming Soon: Real Store Integration'
              }
            </p>
            {showUnreleasedOnly && (
              <span className="text-xs text-gaming-accent bg-gaming-accent/10 px-2 py-1 rounded-full">
                Pre-order Special
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec) => {
            // Generate Steam URL - in real implementation, this would use actual Steam app IDs
            const steamUrl = `https://store.steampowered.com/app/${rec.id}/`

            return (
              <div
                key={`${rec.id}-${showUnreleasedOnly ? 'unreleased' : 'released'}`}
                onClick={() => window.open(steamUrl, '_blank')}
                className={`bg-gray-800/50 rounded-lg overflow-hidden hover:bg-gray-800/70 transition-all cursor-pointer hover:scale-[1.02] hover:shadow-lg ${
                  showUnreleasedOnly ? 'ring-2 ring-gaming-accent/30 hover:ring-gaming-accent/50' : ''
                }`}
              >
                {/* Header Image - 16:9 aspect ratio with consistent sizing */}
                <div className="aspect-video w-full overflow-hidden rounded-t-md relative">
                  {rec.image ? (
                    <img
                      src={rec.image}
                      alt={rec.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                  ) : null}
                  <div className="hidden w-full h-full flex items-center justify-center bg-gradient-to-br from-gaming-primary/20 to-gaming-secondary/20 text-4xl text-gray-500">
                    🎮
                  </div>
                  {showUnreleasedOnly && (
                    <div className="absolute top-2 right-2 bg-gaming-accent text-white text-xs px-2 py-1 rounded-full font-medium">
                      Coming Soon
                    </div>
                  )}
                </div>

                {/* Game Info */}
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-white">
                    {rec.title}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="px-2 py-1 bg-gaming-accent/20 rounded text-gaming-accent">
                      {rec.genre}
                    </span>
                    {rec.rating && (
                      <span>⭐ {rec.rating}</span>
                    )}
                    {showUnreleasedOnly && (
                      <span className="px-2 py-1 bg-blue-500/20 rounded text-blue-400">
                        Pre-order
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-300 line-clamp-2">
                    {rec.description}
                  </p>

                  <div className="text-sm text-gaming-accent font-medium">
                    {rec.reason}
                  </div>

                  {rec.price && (
                    <div className="text-lg font-bold text-white">
                      {rec.price}
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(steamUrl, '_blank')
                    }}
                    className={`w-full px-3 py-2 rounded text-sm font-medium transition-all hover:scale-[1.02] ${
                      showUnreleasedOnly
                        ? 'bg-gaming-accent/20 text-gaming-accent border border-gaming-accent/30 hover:bg-gaming-accent/30'
                        : 'bg-gaming-primary/20 text-gaming-primary border border-gaming-primary/30 hover:bg-gaming-primary/30'
                    }`}
                  >
                    {showUnreleasedOnly ? '🎯 View on Steam' : '🛒 View on Steam'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            {showUnreleasedOnly
              ? '🚀 Be the first to play these upcoming titles! Pre-order notifications coming soon.'
              : '🚀 Store integration coming soon! These recommendations will be linked to real purchase options.'
            }
          </p>
        </div>
      </div>
    </section>
  )
}
