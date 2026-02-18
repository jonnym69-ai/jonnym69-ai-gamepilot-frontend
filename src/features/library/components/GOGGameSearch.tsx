import React, { useState, useEffect } from 'react'
import type { GOGGame } from '../../../services/gogApi'
import { GOGGameSearch } from '../../../services/gogApi'

interface GOGGameSearchProps {
  onGameSelect: (game: GOGGame) => void
  placeholder?: string
}

export const GOGGameSearchComponent: React.FC<GOGGameSearchProps> = ({ 
  onGameSelect, 
  placeholder = "Search GOG games..." 
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<GOGGame[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    const handleSearch = async () => {
      if (searchTerm.trim().length < 2) {
        setSearchResults([])
        setIsDropdownOpen(false)
        return
      }

      setIsLoading(true)
      try {
        const results = await GOGGameSearch.searchWithCache(searchTerm)
        setSearchResults(results.slice(0, 8)) // Limit to 8 results
        setIsDropdownOpen(true)
      } catch (error) {
        console.error('GOG search error:', error)
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(handleSearch, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  const handleGameClick = (game: GOGGame) => {
    onGameSelect(game)
    setSearchTerm('')
    setSearchResults([])
    setIsDropdownOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false)
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm.trim().length >= 2 && setIsDropdownOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-gaming-accent focus:outline-none"
          placeholder={placeholder}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gaming-accent"></div>
          </div>
        )}
      </div>

      {isDropdownOpen && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {searchResults.map((game) => (
            <div
              key={game.id}
              onClick={() => handleGameClick(game)}
              className="flex items-center gap-3 p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
            >
              <img
                src={game.image}
                alt={game.title}
                className="w-12 h-12 rounded object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/48x48/8b5cf6/ffffff?text=GOG'
                }}
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate">{game.title}</h4>
                <p className="text-gray-400 text-sm truncate">
                  {game.genres.slice(0, 2).join(', ')}
                </p>
              </div>
              <div className="text-right">
                <div className="text-gaming-accent text-sm font-medium">
                  {game.price === '0' ? 'Free' : `$${game.price}`}
                </div>
                <div className="text-gray-500 text-xs">
                  {game.platforms.slice(0, 2).join(', ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isDropdownOpen && searchTerm.trim().length >= 2 && searchResults.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4">
          <p className="text-gray-400 text-center">No GOG games found for "{searchTerm}"</p>
        </div>
      )}
    </div>
  )
}
