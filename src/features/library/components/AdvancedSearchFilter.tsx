import React, { useState, useCallback, useMemo } from 'react'
import type { Game, PlayStatus, PlatformCode } from '@gamepilot/types'
import { PageErrorBoundary } from '../../../components/ErrorBoundary'

interface AdvancedSearchFilterProps {
  games: Game[]
  onFiltersChange: (filters: AdvancedFilters) => void
  onSearchChange: (searchTerm: string) => void
}

interface AdvancedFilters {
  searchTerm: string
  genres: string[]
  platforms: PlatformCode[]
  playStatus: PlayStatus[]
  tags: string[]
  ratingRange: [number, number]
  playtimeRange: [number, number]
  dateRange: {
    start: Date | null
    end: Date | null
  }
  sortBy: 'title' | 'rating' | 'playtime' | 'lastPlayed' | 'dateAdded' | 'genre'
  sortOrder: 'asc' | 'desc'
}

export const AdvancedSearchFilter: React.FC<AdvancedSearchFilterProps> = ({ 
  games, 
  onFiltersChange, 
  onSearchChange 
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<AdvancedFilters>({
    searchTerm: '',
    genres: [],
    platforms: [],
    playStatus: [],
    tags: [],
    ratingRange: [0, 5],
    playtimeRange: [0, 1000],
    dateRange: {
      start: null,
      end: null
    },
    sortBy: 'title',
    sortOrder: 'asc'
  })

  // Get unique values from games
  const uniqueGenres = useMemo(() => {
    const genres = new Set<string>()
    games.forEach(game => {
      game.genres?.forEach(genre => {
        genres.add(genre.name)
      })
    })
    return Array.from(genres).sort()
  }, [games])

  const uniquePlatforms = useMemo(() => {
    const platforms = new Set<PlatformCode>()
    games.forEach(game => {
      game.platforms?.forEach(platform => {
        platforms.add(platform.code)
      })
    })
    return Array.from(platforms).sort()
  }, [games])

  
  // Apply filters to games
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      // Search filter
      if (filters.searchTerm && !game.title.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false
      }

      // Genre filter
      if (filters.genres.length > 0) {
        const gameGenres = game.genres?.map(g => g.name) || []
        const hasMatchingGenre = filters.genres.some(genre => gameGenres.includes(genre))
        if (!hasMatchingGenre) return false
      }

      // Platform filter
      if (filters.platforms.length > 0) {
        const gamePlatforms = game.platforms?.map(p => p.code) || []
        const hasMatchingPlatform = filters.platforms.some(platform => gamePlatforms.includes(platform))
        if (!hasMatchingPlatform) return false
      }

      // Play status filter
      if (filters.playStatus.length > 0 && !filters.playStatus.includes(game.playStatus)) {
        return false
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const gameTags = game.tags || []
        const hasMatchingTag = filters.tags.some(tag => gameTags.includes(tag))
        if (!hasMatchingTag) return false
      }

      // Rating filter
      const rating = game.userRating || 0
      if (rating < filters.ratingRange[0] || rating > filters.ratingRange[1]) {
        return false
      }

      // Playtime filter
      const playtime = game.hoursPlayed || 0
      if (playtime < filters.playtimeRange[0] || playtime > filters.playtimeRange[1]) {
        return false
      }

      // Date range filter
      if (filters.dateRange.start && game.addedAt < filters.dateRange.start) {
        return false
      }
      if (filters.dateRange.end && game.addedAt > filters.dateRange.end) {
        return false
      }

      return true
    })
  }, [games, filters])

  // Sort filtered games
  const sortedGames = useMemo(() => {
    const sorted = [...filteredGames]
    
    switch (filters.sortBy) {
      case 'title':
        return sorted.sort((a, b) => {
          const comparison = a.title.localeCompare(b.title)
          return filters.sortOrder === 'desc' ? -comparison : comparison
        })
      case 'rating':
        return sorted.sort((a, b) => {
          const ratingA = a.userRating || 0
          const ratingB = b.userRating || 0
          const comparison = ratingA - ratingB
          return filters.sortOrder === 'desc' ? -comparison : comparison
        })
      case 'playtime':
        return sorted.sort((a, b) => {
          const playtimeA = a.hoursPlayed || 0
          const playtimeB = b.hoursPlayed || 0
          const comparison = playtimeA - playtimeB
          return filters.sortOrder === 'desc' ? -comparison : comparison
        })
      case 'lastPlayed':
        return sorted.sort((a, b) => {
          const dateA = a.lastPlayed?.getTime() || 0
          const dateB = b.lastPlayed?.getTime() || 0
          const comparison = dateA - dateB
          return filters.sortOrder === 'desc' ? -comparison : comparison
        })
      case 'dateAdded':
        return sorted.sort((a, b) => {
          const dateA = a.addedAt.getTime()
          const dateB = b.addedAt.getTime()
          const comparison = dateA - dateB
          return filters.sortOrder === 'desc' ? -comparison : comparison
        })
      case 'genre':
        return sorted.sort((a, b) => {
          const genreA = a.genres?.[0]?.name || ''
          const genreB = b.genres?.[0]?.name || ''
          const comparison = genreA.localeCompare(genreB)
          return filters.sortOrder === 'desc' ? -comparison : comparison
        })
      default:
        return sorted
    }
  }, [filteredGames, filters.sortBy, filters.sortOrder])

  const handleFilterChange = useCallback((newFilters: Partial<AdvancedFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }, [filters, onFiltersChange])

  const handleSearchChange = useCallback((searchTerm: string) => {
    handleFilterChange({ searchTerm })
    onSearchChange(searchTerm)
  }, [handleFilterChange, onSearchChange])

  const clearFilters = useCallback(() => {
    const defaultFilters: AdvancedFilters = {
      searchTerm: '',
      genres: [],
      platforms: [],
      playStatus: [],
      tags: [],
      ratingRange: [0, 5],
      playtimeRange: [0, 1000],
      dateRange: {
        start: null,
        end: null
      },
      sortBy: 'title',
      sortOrder: 'asc'
    }
    setFilters(defaultFilters)
    onFiltersChange(defaultFilters)
    onSearchChange('')
  }, [setFilters, onFiltersChange, onSearchChange])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.searchTerm) count++
    if (filters.genres.length > 0) count++
    if (filters.platforms.length > 0) count++
    if (filters.playStatus.length > 0) count++
    if (filters.tags.length > 0) count++
    if (filters.ratingRange[0] > 0 || filters.ratingRange[1] < 5) count++
    if (filters.playtimeRange[0] > 0 || filters.playtimeRange[1] < 1000) count++
    if (filters.dateRange.start || filters.dateRange.end) count++
    return count
  }, [filters])

  return (
    <PageErrorBoundary>
      <div className="glass-morphism rounded-xl border border-white/10 p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search games by title..."
              className="w-full px-4 py-3 pl-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gaming-primary/50"
            />
            <span className="absolute left-3 top-1/2 text-gray-400">🔍</span>
          </div>
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors mb-4"
        >
          <span className="text-sm font-medium text-white">
            {isExpanded ? 'Hide Filters' : 'Show Filters'}
            {activeFilterCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-gaming-primary text-white text-xs rounded-full">
                {activeFilterCount}
              </span>
            )}
          </span>
          <span className="text-gray-400">
            {isExpanded ? '▲' : '▼'}
          </span>
        </button>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="space-y-6 animate-in">
            {/* Genre Filter */}
            <div>
              <h4 className="text-white font-medium mb-3">Genres</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                {uniqueGenres.map(genre => (
                  <label key={genre} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.genres.includes(genre)}
                      onChange={(e) => {
                        const genres = e.target.checked
                          ? [...filters.genres, genre]
                          : filters.genres.filter(g => g !== genre)
                        handleFilterChange({ genres })
                      }}
                      className="rounded border-white/20 bg-white/10 text-gaming-primary focus:ring-gaming-primary/50"
                    />
                    <span className="text-sm text-gray-300">{genre}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Platform Filter */}
            <div>
              <h4 className="text-white font-medium mb-3">Platforms</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {uniquePlatforms.map(platform => (
                  <label key={platform} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.platforms.includes(platform)}
                      onChange={(e) => {
                        const platforms = e.target.checked
                          ? [...filters.platforms, platform]
                          : filters.platforms.filter(p => p !== platform)
                        handleFilterChange({ platforms })
                      }}
                      className="rounded border-white/20 bg-white/10 text-gaming-primary focus:ring-gaming-primary/50"
                    />
                    <span className="text-sm text-gray-300 capitalize">{platform}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Play Status Filter */}
            <div>
              <h4 className="text-white font-medium mb-3">Play Status</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {(['unplayed', 'playing', 'completed', 'paused', 'abandoned'] as PlayStatus[]).map(status => (
                  <label key={status} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.playStatus.includes(status)}
                      onChange={(e) => {
                        const playStatus = e.target.checked
                          ? [...filters.playStatus, status]
                          : filters.playStatus.filter(s => s !== status)
                        handleFilterChange({ playStatus })
                      }}
                      className="rounded border-white/20 bg-white/10 text-gaming-primary focus:ring-gaming-primary/50"
                    />
                    <span className="text-sm text-gray-300 capitalize">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating Range */}
            <div>
              <h4 className="text-white font-medium mb-3">Rating Range</h4>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={filters.ratingRange[0]}
                  onChange={(e) => handleFilterChange({ 
                    ratingRange: [parseInt(e.target.value) || 0, filters.ratingRange[1]]
                  })}
                  placeholder="Min rating"
                  aria-label="Minimum rating"
                  className="w-20 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gaming-primary/50"
                />
                <span className="text-gray-300">to</span>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={filters.ratingRange[1]}
                  onChange={(e) => handleFilterChange({ 
                    ratingRange: [filters.ratingRange[0], parseInt(e.target.value) || 5]
                  })}
                  placeholder="Max rating"
                  aria-label="Maximum rating"
                  className="w-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-gaming-accent focus:outline-none"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <h4 className="text-white font-medium mb-3">Sort By</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Sort Field</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
                    aria-label="Sort games by"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gaming-primary/50"
                  >
                    <option value="title">Title</option>
                    <option value="rating">Rating</option>
                    <option value="playtime">Playtime</option>
                    <option value="lastPlayed">Last Played</option>
                    <option value="dateAdded">Date Added</option>
                    <option value="genre">Genre</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Order</label>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange({ sortOrder: e.target.value as any })}
                    aria-label="Sort order"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gaming-primary/50"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <span className="text-sm text-gray-400">
                {sortedGames.length} of {games.length} games
              </span>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </PageErrorBoundary>
  )
}
