import React, { useState } from 'react'
import { MoodSection, Game } from '../types'

interface MoodSectionProps {
  moodSection: MoodSection
  onGameClick?: (game: Game) => void
}

export const MoodSectionComponent: React.FC<MoodSectionProps> = ({
  moodSection,
  onGameClick
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="glass-morphism rounded-xl p-6 mb-6 cinematic-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center text-2xl
            ${moodSection.color}
          `}>
            {moodSection.emoji}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{moodSection.name}</h2>
            <p className="text-sm text-gray-400">{moodSection.description}</p>
          </div>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white transition-colors text-lg"
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {/* Games Grid */}
      <div className={`
        grid gap-4 transition-all duration-300
        ${isExpanded ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}
      `}>
        {(isExpanded ? moodSection.games : moodSection.games.slice(0, 5)).map((game) => (
          <div
            key={game.id}
            onClick={() => onGameClick?.(game)}
            className="group cursor-pointer transition-all duration-300 hover:scale-105"
          >
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
              {game.coverImage ? (
                <img
                  src={game.coverImage}
                  alt={game.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-lg flex items-center justify-center">
                    <span className="text-xl">🎮</span>
                  </div>
                </div>
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h4 className="text-white font-medium text-sm truncate mb-1">{game.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    {game.hoursPlayed && (
                      <span>⏱️ {game.hoursPlayed}h</span>
                    )}
                    {game.userRating && (
                      <span>⭐ {game.userRating}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status indicator */}
              {game.playStatus && (
                <div className="absolute top-2 right-2">
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${game.playStatus === 'playing' ? 'bg-green-500/80 text-white' : ''}
                    ${game.playStatus === 'completed' ? 'bg-blue-500/80 text-white' : ''}
                    ${game.playStatus === 'backlog' ? 'bg-yellow-500/80 text-white' : ''}
                    ${game.playStatus === 'abandoned' ? 'bg-red-500/80 text-white' : ''}
                  `}>
                    {game.playStatus}
                  </span>
                </div>
              )}
            </div>
            
            <h3 className="text-white text-sm font-medium mt-2 truncate group-hover:text-gaming-accent transition-colors">
              {game.title}
            </h3>
          </div>
        ))}
      </div>

      {/* Show More/Less */}
      {moodSection.games.length > 5 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-accent-400 hover:text-accent-300 transition-colors text-sm font-medium"
          >
            {isExpanded ? `Show Less` : `Show ${moodSection.games.length - 5} More`}
          </button>
        </div>
      )}

      {/* Empty State */}
      {moodSection.games.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-800 rounded-xl mx-auto mb-3 flex items-center justify-center">
            <span className="text-2xl opacity-50">{moodSection.emoji}</span>
          </div>
          <p className="text-gray-400">No games in this mood yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Start tagging games with emotions to see them here
          </p>
        </div>
      )}
    </div>
  )
}
