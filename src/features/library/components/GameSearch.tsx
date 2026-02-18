import React, { useState } from 'react'

interface GameSearchProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  onSortChange?: (sort: string) => void
  totalCount?: number
  filteredCount?: number
}

interface SortOption {
  field: string
  label: string
  icon: string
}

export const GameSearch: React.FC<GameSearchProps> = ({ 
  searchTerm, 
  onSearchChange, 
  onSortChange,
  totalCount = 0,
  filteredCount = 0
}) => {
  const [sortBy, setSortBy] = useState('title')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [isFocused, setIsFocused] = useState(false)

  const sortOptions: SortOption[] = [
    { field: 'title', label: 'Title', icon: '📝' },
    { field: 'releaseDate', label: 'Release Date', icon: '📅' },
    { field: 'playtime', label: 'Playtime', icon: '⏱️' },
    { field: 'rating', label: 'Rating', icon: '⭐' },
    { field: 'lastPlayed', label: 'Last Played', icon: '🎮' }
  ]

  const handleSortFieldChange = (field: string) => {
    if (sortBy === field) {
      // Toggle direction if same field
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc'
      setSortDirection(newDirection)
      onSortChange?.(`${field}-${newDirection}`)
    } else {
      // Change field and reset to asc
      setSortBy(field)
      setSortDirection('asc')
      onSortChange?.(`${field}-asc`)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearchChange(searchTerm)
  }

  const handleClearSearch = () => {
    onSearchChange('')
  }

  const sortOption = {
    field: sortBy,
    direction: sortDirection
  }

  return (
    <div className="glass-morphism rounded-xl p-6 cinematic-shadow">
      <h3 className="text-lg font-semibold text-white mb-6">Search Games</h3>
      
      <form onSubmit={handleSearchSubmit} className="mb-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search games..."
              className={`
                w-full px-4 py-2 pr-10 bg-gray-800/50 border border-gray-600 rounded-lg
                text-white placeholder-gray-400 transition-all duration-200
                focus:outline-none focus:border-gaming-accent focus:bg-gray-800/70
                ${isFocused ? 'ring-2 ring-gaming-accent/20' : ''}
              `}
            />
            
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <span className="text-lg">✕</span>
              </button>
            )}
          </div>
        </div>
        
        <div className="mt-2 text-sm text-gray-400">
          Press <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Ctrl+K</kbd> to focus search
        </div>
      </form>

      {/* Sort Controls */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-300">Sort by:</span>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {sortOptions.map((option: SortOption) => (
            <button
              key={option.field}
              onClick={() => handleSortFieldChange(option.field)}
              className={`
                px-3 py-2 text-sm rounded-lg transition-all duration-200 flex items-center gap-2
                ${sortOption.field === option.field
                  ? 'bg-gradient-to-r from-gaming-primary to-gaming-secondary text-white'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }
              `}
            >
              <span>{option.icon}</span>
              <span className="truncate">{option.label}</span>
              {sortOption.field === option.field && (
                <span className="ml-auto">
                  {sortOption.direction === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Results Summary */}
      {(totalCount > 0 || searchTerm) && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-400">
              {filteredCount === totalCount ? (
                <span>Showing all {totalCount.toLocaleString()} games</span>
              ) : (
                <span>
                  Showing {filteredCount.toLocaleString()} of {totalCount.toLocaleString()} games
                </span>
              )}
            </div>
            
            {searchTerm && (
              <div className="text-accent-400">
                Searching for "<span className="text-white">{searchTerm}</span>"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
