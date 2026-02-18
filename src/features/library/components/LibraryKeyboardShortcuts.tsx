import React from 'react'
import { useKeyboardShortcuts } from '../../../hooks/useKeyboardShortcuts'

interface LibraryKeyboardShortcutsProps {
  onSearchFocus: () => void
  onAddGame: () => void
  onImportSteam: () => void
  onToggleStats: () => void
  onSelectAll: () => void
  onDeselectAll: () => void
  onDeleteSelected: () => void
  onToggleBulkSelect: () => void
  selectedCount: number
  isBulkSelectMode: boolean
}

export const LibraryKeyboardShortcuts: React.FC<LibraryKeyboardShortcutsProps> = ({
  onSearchFocus,
  onAddGame,
  onImportSteam,
  onToggleStats,
  onSelectAll,
  onDeselectAll,
  onDeleteSelected,
  onToggleBulkSelect,
  selectedCount,
  isBulkSelectMode
}) => {
  // Define keyboard shortcuts
  const shortcuts = [
    // Search
    {
      key: '/',
      description: 'Focus search',
      action: () => onSearchFocus()
    },
    // Add game
    {
      key: 'n',
      ctrlKey: true,
      description: 'Add new game',
      action: () => onAddGame()
    },
    // Import Steam
    {
      key: 'i',
      ctrlKey: true,
      description: 'Import Steam games',
      action: () => onImportSteam()
    },
    // Toggle Stats
    {
      key: 'd',
      ctrlKey: true,
      description: 'Toggle stats dashboard',
      action: () => onToggleStats()
    },
    // Bulk select
    {
      key: 'a',
      ctrlKey: true,
      description: 'Select all (or toggle bulk select)',
      action: () => {
        if (isBulkSelectMode) {
          onSelectAll()
        } else {
          onToggleBulkSelect()
        }
      }
    },
    // Deselect all
    {
      key: 'Escape',
      description: 'Deselect all / Exit bulk select',
      action: () => {
        if (isBulkSelectMode) {
          onDeselectAll()
        }
      }
    },
    // Delete selected
    {
      key: 'Delete',
      description: 'Delete selected games',
      action: () => {
        if (isBulkSelectMode && selectedCount > 0) {
          onDeleteSelected()
        }
      }
    },
    // Help
    {
      key: '?',
      description: 'Show keyboard shortcuts',
      action: () => {
        // Toggle help modal or show shortcuts
        console.log('Show keyboard shortcuts help')
      }
    }
  ]

  useKeyboardShortcuts(shortcuts)

  return null // This component doesn't render anything, just handles shortcuts
}

// Help modal component for shortcuts
export const KeyboardShortcutsHelp: React.FC<{
  isOpen: boolean
  onClose: () => void
}> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  const shortcuts = [
    { key: '/', description: 'Focus search' },
    { key: 'Ctrl + N', description: 'Add new game' },
    { key: 'Ctrl + I', description: 'Import Steam games' },
    { key: 'Ctrl + D', description: 'Toggle stats dashboard' },
    { key: 'Ctrl + A', description: 'Select all / Toggle bulk select' },
    { key: 'Escape', description: 'Deselect all / Exit bulk select' },
    { key: 'Delete', description: 'Delete selected games' },
    { key: '?', description: 'Show this help' }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700/50 shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>
        
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <kbd className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm font-mono text-gray-200">
                  {shortcut.key}
                </kbd>
                <span className="text-gray-300">{shortcut.description}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-700/50">
          <p className="text-sm text-gray-400 text-center">
            Press <kbd className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs">?</kbd> anytime to show this help
          </p>
        </div>
      </div>
    </div>
  )
}
