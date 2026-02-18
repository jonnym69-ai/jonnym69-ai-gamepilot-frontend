import React, { useState, useCallback } from 'react'
import type { Game, PlayStatus } from '@gamepilot/types'
import { PageErrorBoundary } from '../../../components/ErrorBoundary'

interface QuickStatusManagerProps {
  games: Game[]
  selectedGames: string[]
  onUpdateMultipleGames: (gameIds: string[], updates: Partial<Game>) => void
}

export const QuickStatusManager: React.FC<QuickStatusManagerProps> = ({ 
  games, 
  selectedGames, 
  onUpdateMultipleGames 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<PlayStatus>('unplayed')

  const selectedGamesData = selectedGames.map(id => games.find(game => game.id === id)).filter(Boolean) as Game[]

  const statusOptions: { value: PlayStatus; label: string; icon: string; color: string }[] = [
    { value: 'unplayed', label: 'Unplayed', icon: '🎮', color: 'bg-gray-600' },
    { value: 'playing', label: 'Playing', icon: '🎯', color: 'bg-green-600' },
    { value: 'completed', label: 'Completed', icon: '✅', color: 'bg-blue-600' },
    { value: 'paused', label: 'Paused', icon: '⏸️', color: 'bg-yellow-600' },
    { value: 'abandoned', label: 'Abandoned', icon: '🗑️', color: 'bg-red-600' }
  ]

  const handleApplyStatus = useCallback(async () => {
    if (selectedGames.length === 0) return
    
    try {
      await onUpdateMultipleGames(selectedGames, { playStatus: selectedStatus })
      setIsOpen(false)
    } catch (err) {
      console.error('Failed to update game status:', err)
    }
  }, [selectedGames, selectedStatus, onUpdateMultipleGames])

  if (!isOpen) return null

  return (
    <PageErrorBoundary>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="glass-morphism rounded-xl border border-white/10 max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">
              Update Status ({selectedGames.length} games)
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Selected Games Preview */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Selected Games</h3>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {selectedGamesData.map(game => (
                  <div key={game.id} className="flex items-center space-x-3 p-2 glass-morphism rounded-lg border border-white/10">
                    <div className="w-8 h-8 bg-gray-700 rounded flex-shrink-0 overflow-hidden">
                      {game.coverImage ? (
                        <img 
                          src={game.coverImage} 
                          alt={game.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xs">🎮</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{game.title}</p>
                      <p className="text-xs text-gray-400">
                        Current: {game.playStatus || 'unplayed'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Select New Status</h3>
              <div className="grid grid-cols-2 gap-3">
                {statusOptions.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setSelectedStatus(status.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedStatus === status.value
                        ? `${status.color} text-white`
                        : 'bg-white/10 text-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{status.icon}</span>
                      <span className="text-sm font-medium">{status.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Status Preview */}
            <div className="glass-morphism rounded-lg p-4 border-white/10">
              <h4 className="text-white font-medium mb-2">Preview</h4>
              <div className="flex items-center space-x-3">
                {statusOptions.find(s => s.value === selectedStatus) && (
                  <>
                    <div className={`w-8 h-8 rounded-full ${statusOptions.find(s => s.value === selectedStatus)?.color || 'bg-gray-600'}`}></div>
                    <div>
                      <p className="text-white font-medium">
                        {statusOptions.find(s => s.value === selectedStatus)?.label}
                      </p>
                      <p className="text-sm text-gray-400">
                        {selectedGames.length} games will be updated to this status
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyStatus}
                disabled={selectedGames.length === 0}
                className="px-6 py-2 bg-gaming-primary text-white rounded-lg hover:bg-gaming-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                ⚡
                Apply Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageErrorBoundary>
  )
}
