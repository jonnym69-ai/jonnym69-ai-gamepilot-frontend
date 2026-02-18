import React, { useState, useCallback, useMemo, useRef } from 'react'
import { useDebounce } from '../../../hooks/useDebounce'
import type { Game } from '@gamepilot/types'

interface SearchCache {
  [key: string]: {
    results: Game[]
    timestamp: number
  }
}

interface EnhancedSearchManagerProps {
  games: Game[]
  onSearchResults: (results: Game[], searchTerm: string) => void
  children: (searchProps: {
    searchTerm: string
    setSearchTerm: (term: string) => void
    isSearching: boolean
    resultCount: number
  }) => React.ReactNode
}

export const EnhancedSearchManager: React.FC<EnhancedSearchManagerProps> = ({
  games,
  onSearchResults,
  children
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const searchCache = useRef<SearchCache>({})
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  // Debounced search term for performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Advanced search algorithm with multiple strategies
  const performSearch = useCallback((term: string, gameList: Game[]): Game[] => {
    if (!term.trim()) return gameList

    const searchLower = term.toLowerCase()
    const searchTerms = term.toLowerCase().split(/\s+/).filter(t => t.length > 0)

    return gameList.filter(game => {
      // Title matching (highest priority)
      const titleMatch = searchTerms.every(term => 
        game.title.toLowerCase().includes(term)
      )

      // Genre matching
      const genreMatch = searchTerms.some(term => 
        game.genres?.some(genre => {
          const genreName = typeof genre === 'string' ? genre : genre.name || ''
          return genreName.toLowerCase().includes(term)
        })
      )

      // Platform matching
      const platformMatch = searchTerms.some(term =>
        game.platforms?.some(platform =>
          (platform.name || '').toLowerCase().includes(term)
        )
      )

      // Tag matching
      const tagMatch = searchTerms.some(term =>
        game.tags?.some(tag =>
          (tag || '').toLowerCase().includes(term)
        )
      )

      // Description matching (lower priority)
      const descriptionMatch = searchTerms.some(term =>
        game.description?.toLowerCase().includes(term)
      )

      // Return true if any match type succeeds
      return titleMatch || genreMatch || platformMatch || tagMatch || descriptionMatch
    }).sort((a, b) => {
      // Sort by relevance: exact title matches first, then partial matches
      const aExact = a.title.toLowerCase() === searchLower
      const bExact = b.title.toLowerCase() === searchLower
      
      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1
      
      // Then by title starts with
      const aStarts = a.title.toLowerCase().startsWith(searchLower)
      const bStarts = b.title.toLowerCase().startsWith(searchLower)
      
      if (aStarts && !bStarts) return -1
      if (!aStarts && bStarts) return 1
      
      // Finally alphabetical
      return a.title.localeCompare(b.title)
    })
  }, [])

  // Check cache first
  const getCachedResults = useCallback((term: string): Game[] | null => {
    const cached = searchCache.current[term]
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.results
    }
    return null
  }, [])

  // Store results in cache
  const setCachedResults = useCallback((term: string, results: Game[]): void => {
    searchCache.current[term] = {
      results,
      timestamp: Date.now()
    }
  }, [])

  // Clean old cache entries
  const cleanCache = useCallback(() => {
    const now = Date.now()
    Object.keys(searchCache.current).forEach(key => {
      if (now - searchCache.current[key].timestamp > CACHE_DURATION) {
        delete searchCache.current[key]
      }
    })
  }, [])

  // Perform search when debounced term changes
  React.useEffect(() => {
    if (debouncedSearchTerm === searchTerm) return // Prevent double execution

    setIsSearching(true)

    // Check cache first
    const cachedResults = getCachedResults(debouncedSearchTerm)
    if (cachedResults) {
      onSearchResults(cachedResults, debouncedSearchTerm)
      setIsSearching(false)
      return
    }

    // Perform search
    const results = performSearch(debouncedSearchTerm, games)
    
    // Cache results
    setCachedResults(debouncedSearchTerm, results)
    
    // Clean old cache entries periodically
    if (Math.random() < 0.1) { // 10% chance to clean cache
      cleanCache()
    }

    // Return results with small delay for perceived performance
    const timeoutId = setTimeout(() => {
      onSearchResults(results, debouncedSearchTerm)
      setIsSearching(false)
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [debouncedSearchTerm, searchTerm, games, performSearch, getCachedResults, setCachedResults, cleanCache, onSearchResults])

  // Memoized search props
  const searchProps = useMemo(() => ({
    searchTerm,
    setSearchTerm,
    isSearching,
    resultCount: games.length
  }), [searchTerm, isSearching, games.length])

  return (
    <>
      {children(searchProps)}
      
      {/* Search Performance Indicator (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 left-4 bg-black/80 backdrop-blur-sm text-white p-2 rounded-lg text-xs font-mono border border-gray-700/50 z-40">
          <div>Search: {isSearching ? '🔍' : '✅'}</div>
          <div>Cache: {Object.keys(searchCache.current).length}</div>
          <div>Term: "{debouncedSearchTerm}"</div>
        </div>
      )}
    </>
  )
}

// Search analytics hook
export const useSearchAnalytics = () => {
  const searchHistory = useRef<Array<{ term: string; timestamp: number; resultCount: number }>>([])

  const trackSearch = useCallback((term: string, resultCount: number) => {
    if (term.trim()) {
      searchHistory.current.push({
        term,
        timestamp: Date.now(),
        resultCount
      })
      
      // Keep only last 50 searches
      if (searchHistory.current.length > 50) {
        searchHistory.current = searchHistory.current.slice(-50)
      }
    }
  }, [])

  const getPopularSearches = useCallback(() => {
    const termCounts = searchHistory.current.reduce((acc, search) => {
      acc[search.term] = (acc[search.term] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(termCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([term, count]) => ({ term, count }))
  }, [])

  const getRecentSearches = useCallback(() => {
    return searchHistory.current
      .slice(-10)
      .reverse()
      .map(search => search.term)
  }, [])

  return {
    trackSearch,
    getPopularSearches,
    getRecentSearches,
    searchHistory: searchHistory.current
  }
}
