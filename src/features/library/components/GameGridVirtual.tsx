import { VirtualScroll, useContainerHeight } from '../../../components/VirtualScroll'
import { GameCard } from './GameCard'
import type { Game } from '@gamepilot/types'

interface GameGridVirtualProps {
  games: Game[]
  isBulkSelectMode: boolean
  selectedGames: Set<string>
  onSelectGame: (game: Game, selected: boolean) => void
  onEditGame: (game: Game) => void
  onDeleteGame: (game: Game) => void
  onReorderGame?: (fromIndex: number, toIndex: number) => void
  isDraggable?: boolean
  className?: string
  launchingGameId?: string | null
  onLaunchGame?: (gameId: string) => void
  onLaunch?: (game: Game) => void
}

export function GameGridVirtual({
  games,
  isBulkSelectMode,
  selectedGames,
  onSelectGame,
  onEditGame,
  onDeleteGame,
  onReorderGame,
  isDraggable = false,
  className = '',
  launchingGameId = null,
  onLaunchGame,
  onLaunch
}: GameGridVirtualProps) {
  const { containerHeight, containerRef } = useContainerHeight(600)

  // Calculate grid layout based on screen size
  const getGridColumns = () => {
    if (typeof window === 'undefined') return 3 // Default for SSR
    const width = window.innerWidth
    if (width >= 1536) return 4 // 2xl
    if (width >= 1024) return 3 // lg
    if (width >= 640) return 2 // sm
    return 1 // mobile
  }

  const columns = getGridColumns()
  const itemHeight = 552 // Updated card height (520px) + gap (32px)
  const gap = 32 // Gap between items (tailwind gap-8)

  // Group games into rows
  const rows = []
  for (let i = 0; i < games.length; i += columns) {
    rows.push(games.slice(i, i + columns))
  }

  const renderRow = (row: Game[], rowIndex: number) => {
    return (
      <div
        className="grid gap-8"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap: `${gap}px`
        }}
      >
        {row.map((game, colIndex) => (
          <GameCard
            key={game.id}
            game={game}
                        isSelectable={isBulkSelectMode}
            isSelected={selectedGames.has(game.id)}
            onSelect={onSelectGame}
            onEdit={onEditGame}
            onDelete={onDeleteGame}
                        onLaunch={onLaunch}
                                  />
        ))}
        {/* Fill empty slots to maintain grid layout */}
        {row.length < columns && Array.from({ length: columns - row.length }).map((_, emptyIndex) => (
          <div key={`empty-${rowIndex}-${emptyIndex}`} className="w-full" />
        ))}
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div ref={containerRef} className="w-full">
        <div className="glass-morphism rounded-2xl p-12 text-center border border-gray-700/30">
          <div className="text-7xl mb-6 animate-float">🎮</div>
          <h3 className="text-2xl font-bold text-white mb-3">No games found</h3>
          <p className="text-gray-400 mb-8 text-base max-w-md mx-auto">
            Try adjusting your search terms or filters
          </p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      <VirtualScroll
        items={rows}
        itemHeight={itemHeight}
        containerHeight={containerHeight}
        renderItem={renderRow}
        overscan={2}
        className="w-full"
      />
    </div>
  )
}
