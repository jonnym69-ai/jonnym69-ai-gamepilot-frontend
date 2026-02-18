import React from 'react'

interface LibraryToolbarProps {
  gamesCount: number
  onAddGame: () => void
  onImportSteam: () => void
  onAddReview: () => void
  onToggleBulkSelect: () => void
  isBulkSelectMode: boolean
  onSelectAll: () => void
  onDeselectAll: () => void
  selectedCount: number
  totalCount: number
  onDeleteSelected: () => void
  onGenerateTestGames?: () => void
  onShowStats?: () => void
  onShowRecommendations?: () => void
  hasGames: boolean
  persona?: any
}

export const LibraryToolbar: React.FC<LibraryToolbarProps & { persona?: any }> = ({
  gamesCount,
  onAddGame,
  onImportSteam,
  onAddReview,
  onToggleBulkSelect,
  isBulkSelectMode,
  onSelectAll,
  onDeselectAll,
  selectedCount,
  totalCount,
  onDeleteSelected,
  onGenerateTestGames,
  onShowStats,
  onShowRecommendations,
  hasGames,
  persona
}) => {
  return (
    <div className="glass-morphism rounded-2xl p-5 mb-8 border border-gray-700/30 shadow-xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Side - Title, Stats & Persona Bento */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent tracking-tight">
              Library
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-3 text-gray-400 text-sm font-medium">
              <span className="px-2 py-0.5 bg-gray-800/80 rounded-md border border-gray-700/50">{gamesCount} Games</span>
              {isBulkSelectMode && (
                <>
                  <span className="text-gray-600">•</span>
                  <span className="text-gaming-accent">
                    {selectedCount} selected
                  </span>
                </>
              )}
            </div>
          </div>
          
          {persona && (
            <div className="hidden lg:block h-12 w-px bg-gray-700/50 mx-2" />
          )}
          
          {persona && (
            <div className="hidden lg:flex items-center px-4 py-2 bg-gray-800/40 rounded-xl border border-gray-700/30 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Persona Pulse</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-gaming-primary animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.5)]`} />
                    <span className="text-xs text-gray-300 font-semibold">{persona.traits?.archetypeId || 'Analyzer'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Action Buttons Grouped */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2">
          {/* Bulk Operations Controls */}
          {isBulkSelectMode ? (
            <div className="flex gap-2">
              <button
                onClick={onToggleBulkSelect}
                className="px-4 py-3 bg-gray-700 text-gray-300 font-medium rounded-lg hover:bg-gray-600 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={selectedCount === totalCount ? onDeselectAll : onSelectAll}
                className="px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200"
              >
                {selectedCount === totalCount ? 'Deselect All' : 'Select All'}
              </button>
              {selectedCount > 0 && (
                <button
                  onClick={onDeleteSelected}
                  className="px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all duration-200"
                >
                  Delete ({selectedCount})
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {/* Primary Actions */}
              <button
                onClick={onAddGame}
                className="px-6 py-3 bg-gradient-to-r from-gaming-primary to-gaming-secondary text-white font-medium rounded-lg hover:opacity-90 hover:shadow-lg hover:shadow-gaming-primary/30 transition-all duration-200"
              >
                Add Game
              </button>
              
              <button
                onClick={onImportSteam}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:opacity-90 hover:shadow-lg hover:shadow-blue-600/30 transition-all duration-200 flex items-center gap-2"
              >
                🎮 Import Steam
              </button>

              <button
                onClick={onAddReview}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:opacity-90 hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-200 flex items-center gap-2"
              >
                ⭐ Add Review
              </button>

              {/* Stats Dashboard Button */}
              {onShowStats && (
                <button
                  onClick={onShowStats}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-medium rounded-lg hover:opacity-90 hover:shadow-lg hover:shadow-indigo-600/30 transition-all duration-200 flex items-center gap-2"
                >
                  📊 Stats Dashboard
                </button>
              )}

              {/* Recommendations Button */}
              {onShowRecommendations && (
                <button
                  onClick={onShowRecommendations}
                  className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-medium rounded-lg hover:opacity-90 hover:shadow-lg hover:shadow-pink-600/30 transition-all duration-200 flex items-center gap-2"
                >
                  🧠 Recommendations
                </button>
              )}

              {/* Bulk Select Toggle */}
              <button
                onClick={onToggleBulkSelect}
                className="px-4 py-3 bg-gray-700 text-gray-300 font-medium rounded-lg hover:bg-gray-600 transition-all duration-200"
              >
                Select
              </button>

              {/* Test Games Button (only when library is empty) */}
              {!hasGames && onGenerateTestGames && (
                <button
                  onClick={onGenerateTestGames}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:opacity-90 hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-200 flex items-center gap-2"
                >
                  🧪 Generate Test Library
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
