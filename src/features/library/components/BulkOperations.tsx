import React, { useState } from 'react'
import { useLibraryStore } from '../../../stores/useLibraryStore'

interface BulkOperationsProps {
  selectedGames: string[]
  onSelectionChange: (selectedGames: string[]) => void
}

export const BulkOperations: React.FC<BulkOperationsProps> = ({
  selectedGames,
  onSelectionChange
}) => {
  const { actions } = useLibraryStore()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleBulkStatusUpdate = (status: 'playing' | 'completed' | 'backlog' | 'abandoned') => {
    if (selectedGames.length === 0) return
    
    setIsProcessing(true)
    actions.bulkUpdateStatus(selectedGames, status)
    
    setTimeout(() => {
      setIsProcessing(false)
      onSelectionChange([])
    }, 1000)
  }

  const handleBulkAddToCategory = (category: string) => {
    if (selectedGames.length === 0) return
    
    setIsProcessing(true)
    actions.bulkAddToCategory(selectedGames, category)
    
    setTimeout(() => {
      setIsProcessing(false)
      onSelectionChange([])
    }, 1000)
  }

  const handleBulkDelete = () => {
    if (selectedGames.length === 0) return
    
    if (confirm(`Are you sure you want to delete ${selectedGames.length} game(s)?`)) {
      setIsProcessing(true)
      actions.bulkDelete(selectedGames)
      
      setTimeout(() => {
        setIsProcessing(false)
        onSelectionChange([])
      }, 1000)
    }
  }

  const handleExport = () => {
    setIsProcessing(true)
    actions.bulkExport()
    
    setTimeout(() => {
      setIsProcessing(false)
    }, 500)
  }

  return (
    <div className="glass-morphism rounded-xl p-6 cinematic-shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-lg flex items-center justify-center">
            <span className="text-xl">⚡</span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Bulk Operations</h3>
            <p className="text-sm text-gray-400">
              {selectedGames.length} game{selectedGames.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        </div>
        
        {selectedGames.length > 0 && (
          <button
            onClick={() => onSelectionChange([])}
            className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Clear Selection
          </button>
        )}
      </div>

      {selectedGames.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Updates */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Update Status</h4>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkStatusUpdate('playing')}
                disabled={isProcessing}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                🎮 Set Playing
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('completed')}
                disabled={isProcessing}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                ✅ Set Completed
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkStatusUpdate('backlog')}
                disabled={isProcessing}
                className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
              >
                📋 Set Backlog
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('abandoned')}
                disabled={isProcessing}
                className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                ❌ Set Abandoned
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Add to Category</h4>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAddToCategory('favorites')}
                disabled={isProcessing}
                className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                ⭐ Favorites
              </button>
              <button
                onClick={() => handleBulkAddToCategory('hidden')}
                disabled={isProcessing}
                className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                👁️ Hidden
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Actions</h4>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                disabled={isProcessing}
                className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                🗑️ Delete
              </button>
              <button
                onClick={handleExport}
                disabled={isProcessing}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                📤 Export
              </button>
            </div>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-gaming-primary/20 rounded-lg">
            <div className="w-4 h-4 border-2 border-gaming-accent border-t-transparent animate-spin rounded-full"></div>
            <span className="text-gaming-accent">Processing...</span>
          </div>
        </div>
      )}
    </div>
  )
}
