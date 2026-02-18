import React, { useState } from 'react'
import { MOODS, GENRES } from '@gamepilot/static-data'

interface EnhancedFilterBarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedMood: string
  onMoodChange: (mood: string) => void
  selectedGenre: string
  onGenreChange: (genre: string) => void
  selectedSort: string
  onSortChange: (sort: string) => void
  totalGames: number
  filteredGames: number
  onClearFilters: () => void
  availableMoods?: string[]
  availableGenres?: string[]
}

export const EnhancedFilterBar: React.FC<EnhancedFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedMood,
  onMoodChange,
  selectedGenre,
  onGenreChange,
  selectedSort,
  onSortChange,
  totalGames,
  filteredGames,
  onClearFilters,
  availableMoods = [],
  availableGenres = []
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const hasActiveFilters = searchTerm || selectedMood !== 'all' || selectedGenre !== 'all' || selectedSort !== 'title-asc'

  const getMoodIcon = (moodId: string) => {
    const mood = MOODS.find(m => m.id === moodId)
    return mood?.emoji || '🎮'
  }

  const getGenreColor = (genreId: string) => {
    const genre = GENRES.find(g => g.id === genreId)
    return genre?.color || 'from-gray-600 to-gray-700'
  }

  return (
    <div className="glass-morphism rounded-xl p-4 border border-gray-700/30 backdrop-blur-md">
      {/* Main Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        {/* Search */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-lg">🔍</span>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search games, genres, tags..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gaming-primary/50 focus:border-gaming-primary/50 transition-all"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 flex-wrap">
          {/* Mood Filter */}
          <div className="relative">
            <select
              value={selectedMood}
              onChange={(e) => onMoodChange(e.target.value)}
              className="appearance-none bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-gaming-primary/50 focus:border-gaming-primary/50 transition-all cursor-pointer hover:bg-gray-700/50"
            >
              <option value="all">🎭 Any Mood</option>
              {availableMoods.length > 0 ? (
                availableMoods.map(mood => (
                  <option key={mood} value={mood}>
                    {getMoodIcon(mood)} {mood.charAt(0).toUpperCase() + mood.slice(1)}
                  </option>
                ))
              ) : (
                MOODS.slice(0, 6).map(mood => (
                  <option key={mood.id} value={mood.id}>
                    {mood.emoji} {mood.name}
                  </option>
                ))
              )}
            </select>
            <div className="absolute inset-y-0 right-0 pr-2 pointer-events-none flex items-center">
              <span className="text-gray-400 text-xs">▼</span>
            </div>
          </div>

          {/* Genre Filter */}
          <div className="relative">
            <select
              value={selectedGenre}
              onChange={(e) => onGenreChange(e.target.value)}
              className="appearance-none bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-gaming-primary/50 focus:border-gaming-primary/50 transition-all cursor-pointer hover:bg-gray-700/50"
            >
              <option value="all">🎮 Any Genre</option>
              {availableGenres.length > 0 ? (
                availableGenres.map(genre => (
                  <option key={genre} value={genre}>
                    🎯 {genre.charAt(0).toUpperCase() + genre.slice(1)}
                  </option>
                ))
              ) : (
                GENRES.slice(0, 8).map(genre => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))
              )}
            </select>
            <div className="absolute inset-y-0 right-0 pr-2 pointer-events-none flex items-center">
              <span className="text-gray-400 text-xs">▼</span>
            </div>
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={selectedSort}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-gaming-primary/50 focus:border-gaming-primary/50 transition-all cursor-pointer hover:bg-gray-700/50"
            >
              <option value="title-asc">A-Z</option>
              <option value="title-desc">Z-A</option>
              <option value="playtime-desc">Most Played</option>
              <option value="playtime-asc">Least Played</option>
              <option value="recently-added">Newest</option>
              <option value="last-played">Recently Played</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-2 pointer-events-none flex items-center">
              <span className="text-gray-400 text-xs">▼</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="px-3 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-all text-sm font-medium"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-3 py-2 bg-gaming-primary/20 text-gaming-primary rounded-lg hover:bg-gaming-primary/30 transition-all text-sm font-medium"
          >
            {showAdvanced ? 'Simple' : 'Advanced'}
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mt-3 pt-3 border-t border-gray-700/30">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing <span className="text-white font-medium">{filteredGames}</span> of{' '}
            <span className="text-white font-medium">{totalGames}</span> games
            {filteredGames !== totalGames && (
              <span className="text-gaming-primary ml-2">
                ({Math.round((filteredGames / totalGames) * 100)}% filtered)
              </span>
            )}
          </div>
          
          {/* Active Filter Pills */}
          {hasActiveFilters && (
            <div className="flex gap-2 flex-wrap">
              {searchTerm && (
                <div className="px-2 py-1 bg-gaming-primary/20 text-gaming-primary rounded text-xs font-medium">
                  🔍 {searchTerm}
                </div>
              )}
              {selectedMood !== 'all' && (
                <div className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs font-medium">
                  {getMoodIcon(selectedMood)} {MOODS.find(m => m.id === selectedMood)?.name}
                </div>
              )}
              {selectedGenre !== 'all' && (
                <div className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs font-medium">
                  🎮 {GENRES.find(g => g.id === selectedGenre)?.name}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-700/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mood Categories */}
            <div>
              <h4 className="text-sm font-medium text-white mb-3">Mood Categories</h4>
              <div className="space-y-2">
                {['chill', 'competitive', 'story', 'creative'].map(moodId => (
                  <button
                    key={moodId}
                    onClick={() => onMoodChange(moodId)}
                    className={`w-full text-left px-3 py-2 rounded-lg border transition-all text-sm ${
                      selectedMood === moodId
                        ? 'bg-gaming-primary/20 border-gaming-primary/50 text-gaming-primary'
                        : 'bg-gray-800/30 border-gray-700/30 text-gray-300 hover:bg-gray-700/30 hover:border-gray-600/50'
                    }`}
                  >
                    <span className="mr-2">{getMoodIcon(moodId)}</span>
                    {MOODS.find(m => m.id === moodId)?.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Genres */}
            <div>
              <h4 className="text-sm font-medium text-white mb-3">Popular Genres</h4>
              <div className="space-y-2">
                {['action', 'rpg', 'adventure', 'strategy', 'simulation', 'indie'].map(genreId => (
                  <button
                    key={genreId}
                    onClick={() => onGenreChange(genreId)}
                    className={`w-full text-left px-3 py-2 rounded-lg border transition-all text-sm ${
                      selectedGenre === genreId
                        ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                        : 'bg-gray-800/30 border-gray-700/30 text-gray-300 hover:bg-gray-700/30 hover:border-gray-600/50'
                    }`}
                  >
                    <span className="mr-2">🎮</span>
                    {GENRES.find(g => g.id === genreId)?.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <h4 className="text-sm font-medium text-white mb-3">Sort Options</h4>
              <div className="space-y-2">
                {[
                  { value: 'title-asc', label: 'Alphabetical (A-Z)', icon: '🔤' },
                  { value: 'playtime-desc', label: 'Most Played', icon: '⏰' },
                  { value: 'recently-added', label: 'Newest Added', icon: '✨' },
                  { value: 'last-played', label: 'Recently Played', icon: '🕒' },
                  { value: 'recommended', label: 'Recommended', icon: '⭐' },
                ].map(sort => (
                  <button
                    key={sort.value}
                    onClick={() => onSortChange(sort.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg border transition-all text-sm ${
                      selectedSort === sort.value
                        ? 'bg-green-600/20 border-green-500/50 text-green-300'
                        : 'bg-gray-800/30 border-gray-700/30 text-gray-300 hover:bg-gray-700/30 hover:border-gray-600/50'
                    }`}
                  >
                    <span className="mr-2">{sort.icon}</span>
                    {sort.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
