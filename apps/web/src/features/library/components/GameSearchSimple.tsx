import React, { useState } from 'react'

interface GameSearchProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  onSortChange?: (sort: string) => void
}

export const GameSearch: React.FC<GameSearchProps> = ({ searchTerm, onSearchChange, onSortChange }) => {
  const [sortBy, setSortBy] = useState('title')

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    onSortChange?.(sort)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearchChange(searchTerm)
  }

  return (
    <div className="glass-morphism rounded-xl p-6 cinematic-shadow">
      <h3 className="text-lg font-semibold text-white mb-6">Search Games</h3>
      
      <form onSubmit={handleSearchSubmit} className="mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search games..."
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gaming-primary/50"
          />
          
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gaming-primary/50"
          >
            <option value="title">Title</option>
            <option value="rating">Rating</option>
            <option value="playtime">Playtime</option>
            <option value="lastPlayed">Last Played</option>
          </select>
          
          <button
            type="submit"
            className="px-4 py-2 bg-gaming-primary text-white rounded-lg hover:bg-gaming-secondary transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      <div className="text-sm text-gray-400">
        {searchTerm && (
          <p>Searching for: <span className="text-white font-medium">{searchTerm}</span></p>
        )}
      </div>
    </div>
  )
}
