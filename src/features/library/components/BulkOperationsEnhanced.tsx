import React, { useState, useCallback } from 'react'
import type { Game } from '@gamepilot/types'
import { PageErrorBoundary } from '../../../components/ErrorBoundary'
import { Loading } from '../../../components/Loading'

interface BulkOperationsProps {
  isOpen: boolean
  onClose: () => void
  selectedGames: string[]
  games: Game[]
  onUpdateMultipleGames: (gameIds: string[], updates: Partial<Game>) => void
  onDeleteMultipleGames: (gameIds: string[]) => void
}

type BulkAction = 'status' | 'favorite' | 'delete' | 'tags' | 'platforms'

export const BulkOperations: React.FC<BulkOperationsProps> = ({ 
  isOpen, 
  onClose, 
  selectedGames, 
  games, 
  onUpdateMultipleGames, 
  onDeleteMultipleGames 
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAction, setSelectedAction] = useState<BulkAction>('status')
  const [actionData, setActionData] = useState({
    status: 'unplayed',
    isFavorite: false,
    tags: '',
    platforms: [] as string[]
  })

  const selectedGamesData = selectedGames.map(id => games.find(game => game.id === id)).filter(Boolean) as Game[]

  const handleBulkAction = useCallback(async () => {
    if (selectedGames.length === 0) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      switch (selectedAction) {
        case 'status':
          await onUpdateMultipleGames(selectedGames, { playStatus: actionData.status as any })
          break
        case 'favorite':
          await onUpdateMultipleGames(selectedGames, { isFavorite: actionData.isFavorite })
          break
        case 'delete':
          await onDeleteMultipleGames(selectedGames)
          break
        case 'tags':
          await onUpdateMultipleGames(selectedGames, { 
            tags: actionData.tags.split(',').map(t => t.trim()).filter(t => t)
          })
          break
        case 'platforms':
          await onUpdateMultipleGames(selectedGames, {
            platforms: actionData.platforms.map(code => ({
              id: code,
              name: code,
              code: code as any,
              isConnected: false
            }))
          })
          break
      }
      
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform bulk operation')
    } finally {
      setIsLoading(false)
    }
  }, [selectedGames, selectedAction, actionData, onUpdateMultipleGames, onDeleteMultipleGames])

  if (!isOpen) return null

  return (
    <PageErrorBoundary>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="glass-morphism rounded-xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">
              Bulk Operations ({selectedGames.length} games)
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="glass-morphism rounded-lg p-4 border border-red-500/30 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

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
                        {game.genres?.map(g => g.name).slice(0, 2).join(', ') || 'No genres'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Select Action</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <button
                  onClick={() => setSelectedAction('status')}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedAction === 'status'
                      ? 'border-gaming-primary bg-gaming-primary/20 text-gaming-primary'
                      : 'border-white/20 bg-white/10 text-gray-300 hover:border-gaming-primary/50'
                  }`}
                >
                  <span className="text-sm font-medium">🎮 Change Status</span>
                </button>
                
                <button
                  onClick={() => setSelectedAction('favorite')}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedAction === 'favorite'
                      ? 'border-gaming-primary bg-gaming-primary/20 text-gaming-primary'
                      : 'border-white/20 bg-white/10 text-gray-300 hover:border-gaming-primary/50'
                  }`}
                >
                  <span className="text-sm font-medium">⭐ Toggle Favorite</span>
                </button>
                
                <button
                  onClick={() => setSelectedAction('tags')}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedAction === 'tags'
                      ? 'border-gaming-primary bg-gaming-primary/20 text-gaming-primary'
                      : 'border-white/20 bg-white/10 text-gray-300 hover:border-gaming-primary/50'
                  }`}
                >
                  <span className="text-sm font-medium">🏷️ Add Tags</span>
                </button>
                
                <button
                  onClick={() => setSelectedAction('platforms')}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedAction === 'platforms'
                      ? 'border-gaming-primary bg-gaming-primary/20 text-gaming-primary'
                      : 'border-white/20 bg-white/10 text-gray-300 hover:border-gaming-primary/50'
                  }`}
                >
                  <span className="text-sm font-medium">💻 Set Platforms</span>
                </button>
                
                <button
                  onClick={() => setSelectedAction('delete')}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedAction === 'delete'
                      ? 'border-red-500 bg-red-500/20 text-red-400'
                      : 'border-white/20 bg-white/10 text-gray-300 hover:border-red-500/50'
                  }`}
                >
                  <span className="text-sm font-medium">🗑️ Delete Games</span>
                </button>
              </div>
            </div>

            {/* Action Configuration */}
            {selectedAction === 'status' && (
              <div className="glass-morphism rounded-lg p-4 border border-white/10">
                <h4 className="text-white font-medium mb-3">Set Play Status</h4>
                <select
                  value={actionData.status}
                  onChange={(e) => setActionData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gaming-primary/50"
                >
                  <option value="unplayed">Unplayed</option>
                  <option value="playing">Playing</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                  <option value="abandoned">Abandoned</option>
                </select>
              </div>
            )}

            {selectedAction === 'favorite' && (
              <div className="glass-morphism rounded-lg p-4 border border-white/10">
                <h4 className="text-white font-medium mb-3">Toggle Favorite Status</h4>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={actionData.isFavorite}
                    onChange={(e) => setActionData(prev => ({ ...prev, isFavorite: e.target.checked }))}
                    className="rounded border-white/20 bg-white/10 text-gaming-primary focus:ring-gaming-primary/50"
                  />
                  <span className="text-sm text-gray-300">
                    Mark as {actionData.isFavorite ? 'Favorite' : 'Not Favorite'}
                  </span>
                </label>
              </div>
            )}

            {selectedAction === 'tags' && (
              <div className="glass-morphism rounded-lg p-4 border border-white/10">
                <h4 className="text-white font-medium mb-3">Add Tags</h4>
                <input
                  type="text"
                  value={actionData.tags}
                  onChange={(e) => setActionData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Enter tags (comma separated)"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gaming-primary/50"
                />
              </div>
            )}

            {selectedAction === 'platforms' && (
              <div className="glass-morphism rounded-lg p-4 border border-white/10">
                <h4 className="text-white font-medium mb-3">Set Platforms</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['steam', 'epic', 'gog', 'manual'].map((platform) => (
                    <label key={platform} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={actionData.platforms.includes(platform)}
                        onChange={(e) => {
                          const platforms = e.target.checked 
                            ? [...actionData.platforms, platform]
                            : actionData.platforms.filter(p => p !== platform)
                          setActionData(prev => ({ ...prev, platforms }))
                        }}
                        className="rounded border-white/20 bg-white/10 text-gaming-primary focus:ring-gaming-primary/50"
                      />
                      <span className="text-sm text-gray-300 capitalize">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {selectedAction === 'delete' && (
              <div className="glass-morphism rounded-lg p-4 border border-red-500/30">
                <h4 className="text-red-400 font-medium mb-3">⚠️ Delete Confirmation</h4>
                <p className="text-gray-300 mb-4">
                  This will permanently delete {selectedGames.length} game(s) and all associated data.
                  This action cannot be undone!
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAction}
                disabled={isLoading || selectedGames.length === 0 || (selectedAction === 'delete' && selectedGames.length > 10)}
                className="px-6 py-2 bg-gaming-primary text-white rounded-lg hover:bg-gaming-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loading message="" size="sm" />
                    Processing...
                  </>
                ) : (
                  <>
                    {selectedAction === 'delete' ? '🗑️ Delete' : '⚡ Apply'}
                    {selectedAction === 'delete' ? `${selectedGames.length} Games` : 'to Selected'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageErrorBoundary>
  )
}
