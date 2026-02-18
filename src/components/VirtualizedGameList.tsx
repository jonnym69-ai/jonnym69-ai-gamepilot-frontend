import React, { useMemo, useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Game } from '@gamepilot/types';
import { GameCard } from '../features/library/components/GameCard';

interface VirtualizedGameListProps {
  games: Game[];
  onGameLaunch: (game: Game) => void;
  onGameEdit: (gameId: string, updates: Partial<Game>) => void;
  onGameDelete: (game: Game) => void;
  selectedGames: Set<string>;
  onGameSelectToggle: (gameId: string) => void;
  isBulkSelectMode: boolean;
  recommendationScores?: any[]; // Add recommendation scores
}

const ROW_HEIGHT = 320; // Increased significantly to prevent overlap during hover transforms

export const VirtualizedGameList: React.FC<VirtualizedGameListProps> = ({
  games,
  onGameLaunch,
  onGameEdit,
  onGameDelete,
  selectedGames,
  onGameSelectToggle,
  isBulkSelectMode,
  recommendationScores
}) => {
  // Group games into rows of 3 for better layout
  const gameRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < games.length; i += 3) {
      rows.push(games.slice(i, i + 3));
    }
    return rows;
  }, [games]);

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: gameRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5, // Render 5 extra rows for smooth scrolling
  });

  const GameRow = useCallback(({ rowIndex, gameRow }: { rowIndex: number; gameRow: Game[] }) => {
    return (
      <div className="flex gap-4 p-2">
        {gameRow.map((game) => {
          // Find recommendation score for this game
          const recommendationScore = recommendationScores?.find(score => score.gameId === game.id)
          
          return (
            <div key={game.id} className="flex-1 min-w-0">
              <GameCard
                game={game}
                onSelect={() => onGameSelectToggle(game.id)}
                onLaunch={() => onGameLaunch(game)}
                onEdit={() => onGameEdit(game.id, {})}
                onDelete={() => onGameDelete(game)}
                isSelectable={isBulkSelectMode}
                isSelected={selectedGames.has(game.id)}
                recommendationScore={recommendationScore}
              />
            </div>
          )
        })}
        {/* Fill empty slots for consistent layout */}
        {gameRow.length < 3 && (
          <>
            {Array.from({ length: 3 - gameRow.length }).map((_, emptyIndex) => (
              <div key={`empty-${rowIndex}-${emptyIndex}`} className="flex-1" />
            ))}
          </>
        )}
      </div>
    );
  }, [
    onGameLaunch,
    onGameEdit,
    onGameDelete,
    selectedGames,
    onGameSelectToggle,
    isBulkSelectMode,
    games, // Add games dependency to prevent stale data
    recommendationScores // Add recommendationScores dependency
  ]);

  return (
    <div className="virtualized-game-list">
      <div
        ref={parentRef}
        className="h-[700px] overflow-auto"
        style={{
          contain: 'strict',
        }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => (
            <div
              key={virtualItem.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <GameRow
                rowIndex={virtualItem.index}
                gameRow={gameRows[virtualItem.index]}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
