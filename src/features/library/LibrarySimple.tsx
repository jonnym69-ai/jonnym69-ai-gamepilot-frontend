import React, { useState, useMemo } from 'react'
import { useLibraryStore } from "../../stores/useLibraryStore"
import { useToast } from "../../components/ui/ToastProvider"
import { launchGame } from "../../utils/launchGame"
import { GameCard } from './components/GameCard'
import { VirtualizedGameList } from '../../components/VirtualizedGameList'
import { AddGameModal } from './components/AddGameModal'
import { EditGameModal } from './components/EditGameModal'
import { DeleteGameModal } from './components/DeleteGameModal'
import { SteamImportModal } from './components/SteamImportModal'
import { Loading } from '../../components/Loading'
import { EmptyLibraryState } from '../../components/EmptyLibraryState'
import { useDebounce } from '../../hooks/useDebounce'
import type { Game } from '@gamepilot/types'
import { MOODS, GENRES, type MoodId } from '@gamepilot/static-data'
import { SimpleMoodSelector } from '../../components/SimpleMoodSelector'
import { WhatToPlayNowFixed } from '../../components/WhatToPlayNowFixed'
import { getMoodOptions, getGenreOptions } from '../../utils/libraryAnalyzer'
import { 
  detectTimeOfDay, 
  getContextualMatches, 
  type SessionLength,
  type TimeOfDay
} from '../../utils/contextualEngine';

// NEW: Import analytics
import { 
  trackRecommendationInteraction,
  trackFilterInteraction,
  trackContextualInsights
} from '../../utils/analytics';

export const LibrarySimple: React.FC = () => {
  const { games, isLoading, actions } = useLibraryStore()
  const { showSuccess, showError } = useToast()
  
  // User preference for virtual scrolling (default: off for better UX)
  const [useVirtualScrolling, setUseVirtualScrolling] = useState(false)
  
  // Get mood options for recommendations
  const moodOptions = getMoodOptions(games || []);
  const hasMoodRecommendations = moodOptions.some(mood => mood.count > 0);

  const handleMoodSelect = (primaryMood: string, secondaryMood?: string) => {
    setViewMode('mood')
    setShowMoodSelector(false)
  }

  // Basic state
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [selectedSort, setSelectedSort] = useState('title-asc')
  const [viewMode, setViewMode] = useState<'all' | 'mood'>('all')
  const [showMoodSelector, setShowMoodSelector] = useState(false)
  const [showWhatToPlay, setShowWhatToPlay] = useState(false)

  // Get genre options
  const genreOptions = getGenreOptions(games || [])

  // Filter games based on search and genre
  const filteredGames = useMemo(() => {
    let filtered = games || []

    // Search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase()
      filtered = filtered.filter(game =>
        game.title.toLowerCase().includes(searchLower) ||
        game.description?.toLowerCase().includes(searchLower) ||
        game.developer?.toLowerCase().includes(searchLower)
      )
    }

    // Genre filter
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(game =>
        game.genres?.some((genre: any) => {
          const genreName = typeof genre === 'string' ? genre : genre.name || genre.value || ''
          return genreName.toLowerCase() === selectedGenre.toLowerCase()
        })
      )
    }

    return filtered
  }, [games, debouncedSearchTerm, selectedGenre])

  // Sort games
  const sortedGames = useMemo(() => {
    const sorted = [...filteredGames]
    
    switch (selectedSort) {
      case 'title-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title))
      case 'title-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title))
      case 'genre-asc':
        return sorted.sort((a, b) => {
          const genreA = typeof a.genres?.[0] === 'string' ? a.genres[0] : a.genres?.[0]?.name || ''
          const genreB = typeof b.genres?.[0] === 'string' ? b.genres[0] : b.genres?.[0]?.name || ''
          return genreA.localeCompare(genreB)
        })
      case 'playtime-desc':
        return sorted.sort((a, b) => (b.hoursPlayed || 0) - (a.hoursPlayed || 0))
      default:
        return sorted
    }
  }, [filteredGames, selectedSort])

  const handleGameSelect = (game: Game) => {
    trackRecommendationInteraction('contextual', 'clicked', {
      gameId: game.id,
      gameTitle: game.title,
      genres: game.genres,
      source: 'library'
    })
  }

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre)
    trackFilterInteraction('genre_select', 'changed', {
      genre,
      gameCount: filteredGames.filter(g => 
        g.genres?.some((genreItem: any) => {
          const genreName = typeof genreItem === 'string' ? genreItem : genreItem.name || genreItem.value || ''
          return genreName.toLowerCase() === genre.toLowerCase()
        })
      ).length
    })
  }

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort)
    trackFilterInteraction('sort_change', 'changed', { sort: selectedSort })
  }

  const handleSearchChange = (term: string) => {
    setSearchTerm(term)
    if (term) {
      trackFilterInteraction('search', 'changed', { term, resultCount: filteredGames.length })
    }
  }

  const handleAddGame = () => {
    trackFilterInteraction('add_game_modal_open', 'changed', {})
  }

  const handleSteamImport = () => {
    trackFilterInteraction('steam_import_modal_open', 'changed', { action: 'steam_import' })
  }

  const handleMoodSelectorOpen = () => {
    setShowMoodSelector(true)
    trackFilterInteraction('mood_filter', 'changed', { action: 'mood_selector_open' })
  }

  const handleWhatToPlayOpen = () => {
    setShowWhatToPlay(true)
    trackFilterInteraction('what_to_play_open', 'changed', { action: 'what_to_play_open' })
  }

  if (isLoading) {
    return <Loading />
  }

  if (!games || games.length === 0) {
    return <EmptyLibraryState isSearchResult={false} onImportSteam={handleSteamImport} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">My Game Library</h1>
              {hasMoodRecommendations && (
                <button
                  onClick={handleWhatToPlayOpen}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  🎮 What Should I Play?
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleAddGame}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                ➕ Add Game
              </button>
              
              <button
                onClick={handleSteamImport}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                📥 Import from Steam
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Games
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search by title, developer, or description..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Genre Filter */}
            <div className="w-full sm:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Genre
              </label>
              <select
                value={selectedGenre}
                onChange={(e) => handleGenreChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                title="Filter games by genre"
              >
                <option value="all">All Genres ({games.length})</option>
                {genreOptions.map(genre => (
                  <option key={genre.value} value={genre.value}>
                    {genre.label} ({genre.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="w-full sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={selectedSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                title="Sort games by"
              >
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
                <option value="genre-asc">Genre</option>
                <option value="playtime-desc">Most Played</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Game Stats */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">{games.length}</div>
              <div className="text-sm text-blue-700">Total Games</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-900">
                {games.reduce((sum, game) => sum + (game.hoursPlayed || 0), 0)}
              </div>
              <div className="text-sm text-green-700">Hours Played</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-900">{genreOptions.length}</div>
              <div className="text-sm text-purple-700">Genres Available</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-900">{moodOptions.length}</div>
              <div className="text-sm text-orange-700">Moods Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Game List */}
      <div className="flex-1">
        {useVirtualScrolling ? (
          <VirtualizedGameList
            games={sortedGames}
            onGameLaunch={(game) => launchGame(game.appId || 0)}
            onGameSelectToggle={(gameId) => handleGameSelect(games.find(g => g.id === gameId)!)}
            onGameEdit={() => {}}
            onGameDelete={() => {}}
            selectedGames={new Set()}
            isBulkSelectMode={false}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onSelect={(game) => handleGameSelect(game)}
                  onLaunch={(game) => launchGame(game.appId || 0)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showMoodSelector && (
        <SimpleMoodSelector
          onMoodChange={handleMoodSelect}
        />
      )}

      {showWhatToPlay && (
        <WhatToPlayNowFixed onClose={() => setShowWhatToPlay(false)} />
      )}
    </div>
  )
}
