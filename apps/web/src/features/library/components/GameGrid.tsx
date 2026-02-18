import React from 'react'
import type { Game } from '@gamepilot/types'
import { GameCard } from './GameCard'

interface GameGridProps {
  games: Game[]
  loading?: boolean
  emptyMessage?: string
  onGameClick?: (game: Game) => void
  selectedGames?: string[]
  capsuleImages?: Record<string, string>
}

export const GameGrid: React.FC<GameGridProps> = ({
  games,
  loading = false,
  emptyMessage = 'No games found',
  onGameClick,
  selectedGames = [],
  capsuleImages = {}
}) => {
  const isSelected = (gameId: string) => selectedGames.includes(gameId)

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-gaming-accent border-t-transparent animate-spin rounded-full"></div>
            <span className="text-gaming-accent">Loading games...</span>
          </div>
        ) : games.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 bg-gray-800 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">🎮</span>
            </div>
            <p className="text-gray-400">{emptyMessage}</p>
          </div>
        ) : (
          games.map((game) => (
            <div
              key={game.id}
              className={`relative group cursor-pointer transition-all duration-200 ${isSelected(game.id) ? 'ring-2 ring-gaming-accent' : ''}`}
              onClick={() => onGameClick?.(game)}
            >
              <GameCard game={game} isSelected={isSelected(game.id)} capsuleImage={capsuleImages[game.id] || (game as any).capsuleImage || (game as any).headerImage || (game as any).smallHeaderImage} />
            </div>
          ))
        )}
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div className="glass-morphism rounded-xl p-12 text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-lg mx-auto mb-4 flex items-center justify-center">
          <span className="text-4xl">🎮</span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{emptyMessage}</h3>
        <p className="text-gray-400">
          Try adjusting your filters or search terms to find games.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {games.map((game) => (
        <div
          key={game.id}
          className={`relative group cursor-pointer transition-all duration-200 ${isSelected(game.id) ? 'ring-2 ring-gaming-accent' : ''}`}
          onClick={() => onGameClick?.(game)}
        >
          <GameCard game={game} isSelected={isSelected(game.id)} />
        </div>
      ))}
    </div>
  )
}
