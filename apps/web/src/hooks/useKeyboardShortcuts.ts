import { useEffect, useCallback, useState } from 'react'

type KeyboardShortcut = {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  action: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when user is typing in input fields
    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return
    }

    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatches = shortcut.key.toLowerCase() === event.key.toLowerCase()
      const ctrlMatches = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey
      const shiftMatches = shortcut.shiftKey ? event.shiftKey : !event.shiftKey
      const altMatches = shortcut.altKey ? event.altKey : !event.altKey

      return keyMatches && ctrlMatches && shiftMatches && altMatches
    })

    if (matchingShortcut) {
      event.preventDefault()
      matchingShortcut.action()
    }
  }, [shortcuts])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

/**
 * Predefined keyboard shortcuts for the library
 */
export const createLibraryShortcuts = ({
  onSelectAll,
  onDeselectAll,
  onDeleteSelected,
  onFocusSearch,
  onAddGame,
  onImportSteam,
  onEscape
}: {
  onSelectAll: () => void
  onDeselectAll: () => void
  onDeleteSelected: () => void
  onFocusSearch: () => void
  onAddGame: () => void
  onImportSteam: () => void
  onEscape: () => void
}): KeyboardShortcut[] => [
  {
    key: 'a',
    ctrlKey: true,
    action: onSelectAll,
    description: 'Select all games'
  },
  {
    key: 'd',
    ctrlKey: true,
    action: onDeselectAll,
    description: 'Deselect all games'
  },
  {
    key: 'Delete',
    action: onDeleteSelected,
    description: 'Delete selected games'
  },
  {
    key: 'f',
    ctrlKey: true,
    action: onFocusSearch,
    description: 'Focus search bar'
  },
  {
    key: 'n',
    ctrlKey: true,
    action: onAddGame,
    description: 'Add new game'
  },
  {
    key: 'i',
    ctrlKey: true,
    action: onImportSteam,
    description: 'Import Steam library'
  },
  {
    key: 'Escape',
    action: onEscape,
    description: 'Cancel current action'
  }
]

/**
 * Hook to display keyboard shortcuts help
 */
export function useKeyboardHelp() {
  const [showHelp, setShowHelp] = useState(false)

  const toggleHelp = useCallback(() => {
    setShowHelp((prev: boolean) => !prev)
  }, [])

  // Add help shortcut
  useKeyboardShortcuts([
    {
      key: '?',
      action: toggleHelp,
      description: 'Show keyboard shortcuts'
    }
  ])

  return { showHelp, toggleHelp }
}
