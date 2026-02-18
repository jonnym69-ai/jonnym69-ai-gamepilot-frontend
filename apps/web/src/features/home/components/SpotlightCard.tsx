import React, { useState } from 'react'
import { SpotlightItem } from '../types'

interface SpotlightCardProps {
  spotlight: SpotlightItem
  onClick?: () => void
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  spotlight,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-500 to-orange-500'
      case 'epic': return 'from-purple-500 to-pink-500'
      case 'rare': return 'from-blue-500 to-cyan-500'
      case 'common': return 'from-gray-500 to-gray-600'
      default: return 'from-gaming-primary to-gaming-secondary'
    }
  }

  const getRarityBorder = (rarity?: string) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-500/50'
      case 'epic': return 'border-purple-500/50'
      case 'rare': return 'border-blue-500/50'
      case 'common': return 'border-gray-500/50'
      default: return 'border-gaming-primary/50'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'game': return '🎮'
      case 'achievement': return '🏆'
      case 'milestone': return '🎯'
      case 'recommendation': return '✨'
      default: return '🌟'
    }
  }

  const getTypeGradient = (type: string) => {
    switch (type) {
      case 'game': return 'from-gaming-primary to-gaming-secondary'
      case 'achievement': return 'from-yellow-500 to-orange-500'
      case 'milestone': return 'from-green-500 to-blue-500'
      case 'recommendation': return 'from-purple-500 to-pink-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <div
      className={`
        relative group cursor-pointer transition-all duration-300 transform
        ${isHovered ? 'scale-105 -translate-y-2' : 'scale-100 translate-y-0'}
      `}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`
        glass-morphism rounded-xl overflow-hidden cinematic-shadow
        border-2 ${getRarityBorder(spotlight.metadata?.rarity)}
        ${isHovered ? 'ring-2 ring-white/20' : ''}
      `}>
        {/* Background Image or Gradient */}
        <div className="relative h-48 bg-gradient-to-br">
          {spotlight.image ? (
            <img
              src={spotlight.image}
              alt={spotlight.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${getRarityColor(spotlight.metadata?.rarity)}`} />
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Type Badge */}
          <div className="absolute top-3 left-3">
            <div className={`
              px-3 py-1 rounded-full text-xs font-semibold text-white
              bg-gradient-to-r ${getTypeGradient(spotlight.type)}
            `}>
              <span className="mr-1">{getTypeIcon(spotlight.type)}</span>
              {spotlight.type.charAt(0).toUpperCase() + spotlight.type.slice(1)}
            </div>
          </div>

          {/* Rarity Badge */}
          {spotlight.metadata?.rarity && (
            <div className="absolute top-3 right-3">
              <div className={`
                px-3 py-1 rounded-full text-xs font-semibold text-white
                bg-gradient-to-r ${getRarityColor(spotlight.metadata.rarity)}
              `}>
                {spotlight.metadata.rarity.charAt(0).toUpperCase() + spotlight.metadata.rarity.slice(1)}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gaming-accent transition-colors">
              {spotlight.title}
            </h3>
            <p className="text-sm text-gray-200 line-clamp-2">
              {spotlight.description}
            </p>
          </div>
        </div>

        {/* Metadata Section */}
        <div className="p-4 bg-gray-900/50">
          {/* Game Info */}
          {spotlight.game && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded overflow-hidden bg-gray-800">
                {spotlight.game.coverImage ? (
                  <img
                    src={spotlight.game.coverImage}
                    alt={spotlight.game.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xs">🎮</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {spotlight.game.title}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {spotlight.game.developer || 'Unknown Developer'}
                </p>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3 text-gray-400">
              {spotlight.metadata?.achievementCount && (
                <span className="flex items-center gap-1">
                  <span>🏆</span>
                  {spotlight.metadata.achievementCount}
                </span>
              )}
              {spotlight.metadata?.playtime && (
                <span className="flex items-center gap-1">
                  <span>⏱️</span>
                  {spotlight.metadata.playtime}h
                </span>
              )}
            </div>
            
            <button className="text-accent-400 hover:text-accent-300 transition-colors font-medium">
              View →
            </button>
          </div>
        </div>
      </div>

      {/* Glow effect on hover */}
      {isHovered && (
        <div className={`
          absolute inset-0 rounded-xl bg-gradient-to-r opacity-20 blur-xl -z-10
          ${getRarityColor(spotlight.metadata?.rarity)}
        `} />
      )}
    </div>
  )
}

interface SpotlightGridProps {
  spotlights: SpotlightItem[]
  onSpotlightClick?: (spotlight: SpotlightItem) => void
  maxItems?: number
}

export const SpotlightGrid: React.FC<SpotlightGridProps> = ({
  spotlights,
  onSpotlightClick,
  maxItems = 3
}) => {
  const displaySpotlights = spotlights.slice(0, maxItems)

  if (spotlights.length === 0) {
    return (
      <div className="glass-morphism rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-xl mx-auto mb-4 flex items-center justify-center">
          <span className="text-3xl">🌟</span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Spotlight Items</h3>
        <p className="text-gray-400">
          Your achievements and milestones will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-lg flex items-center justify-center">
          <span className="text-xl">🌟</span>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Spotlight</h2>
          <p className="text-sm text-gray-400">Featured achievements and milestones</p>
        </div>
      </div>

      {/* Spotlight Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displaySpotlights.map((spotlight) => (
          <SpotlightCard
            key={spotlight.id}
            spotlight={spotlight}
            onClick={() => onSpotlightClick?.(spotlight)}
          />
        ))}
      </div>

      {/* View All */}
      {spotlights.length > maxItems && (
        <div className="text-center">
          <button className="text-accent-400 hover:text-accent-300 transition-colors font-medium">
            View All Spotlight Items ({spotlights.length})
          </button>
        </div>
      )}
    </div>
  )
}
