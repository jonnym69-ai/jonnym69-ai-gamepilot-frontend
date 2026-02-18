import React, { useState } from 'react'
import type { Game } from '@gamepilot/types'
import { PageErrorBoundary } from '../../../components/ErrorBoundary'
import { Loading } from '../../../components/Loading'

interface DeleteGameModalProps {
  isOpen: boolean
  onClose: () => void
  game: Game | null
  onDeleteGame: (gameId: string) => void
}

export const DeleteGameModal: React.FC<DeleteGameModalProps> = ({ isOpen, onClose, game, onDeleteGame }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmationText, setConfirmationText] = useState('')

  const handleConfirm = async () => {
    if (!game) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      await onDeleteGame(game.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete game')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmationText(e.target.value)
  }

  if (!isOpen || !game) return null

  return (
    <PageErrorBoundary>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="glass-morphism rounded-xl border border-white/10 max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Delete Game</h2>
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

            {/* Game Info */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                {game.coverImage ? (
                  <img 
                    src={game.coverImage} 
                    alt={game.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-2xl">🎮</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white mb-1">{game.title}</h3>
                <p className="text-sm text-gray-400">
                  {game.genres?.map(g => g.name).join(', ') || 'No genres'}
                </p>
                {game.hoursPlayed && (
                  <p className="text-sm text-gray-400">
                    {game.hoursPlayed} hours played
                  </p>
                )}
              </div>
            </div>

            {/* Warning Message */}
            <div className="glass-morphism rounded-lg p-4 border border-yellow-500/30 mb-6">
              <div className="flex items-start space-x-3">
                <span className="text-2xl text-yellow-400">⚠️</span>
                <div>
                  <p className="text-yellow-400 font-medium mb-2">This action cannot be undone!</p>
                  <p className="text-sm text-gray-300 mb-3">
                    All game data, including playtime, ratings, and notes will be permanently deleted.
                  </p>
                </div>
              </div>
            </div>

            {/* Confirmation Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type <span className="text-gaming-primary font-bold">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmationText}
                onChange={handleConfirmationChange}
                placeholder="Type DELETE to confirm"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gaming-primary/50"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading || confirmationText !== 'DELETE'}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loading message="" size="sm" />
                    Deleting...
                  </>
                ) : (
                  <>
                    🗑️
                    Delete Game
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
