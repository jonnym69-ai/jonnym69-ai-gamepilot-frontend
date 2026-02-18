import React, { useEffect, useState } from 'react'
import { useSteamRecommendations } from '../../hooks/useSteamRecommendations'
import { useLibraryStore } from '../../stores/useLibraryStore'
import type { Game } from '../../types'

/**
 * Enhanced WhatToBuy component with Steam recommendations
 * SAFE: Complete isolation from mood system
 */

interface EnhancedWhatToBuyProps {
  userMood?: string
  personaTraits?: any
  className?: string
}

export const EnhancedWhatToBuy: React.FC<EnhancedWhatToBuyProps> = ({ 
  userMood,
  personaTraits,
  className = ''
}) => {
  const { games } = useLibraryStore()
  
  const [currentCategory, setCurrentCategory] = useState<'top_rated' | 'underrated' | 'hidden_gems'>('top_rated')
  
  const {
    recommendations,
    isLoading,
    error,
    lastRefresh,
    refreshRecommendations,
    clearRecommendations,
    hasRecommendations,
    recommendationCount
  } = useSteamRecommendations({ 
    games, 
    limit: 25,
    category: currentCategory
  })

  const [selectedGame, setSelectedGame] = useState<Game | null>(null)

  // Auto-select first game when recommendations load
  useEffect(() => {
    if (recommendations.games.length > 0 && !selectedGame) {
      setSelectedGame(recommendations.games[0])
    }
  }, [recommendations.games, selectedGame])

  const handleCategoryChange = async (category: 'top_rated' | 'underrated' | 'hidden_gems') => {
    setCurrentCategory(category)
    setSelectedGame(null) // Reset selection
    await refreshRecommendations()
  }

  const handleRefresh = async () => {
    await refreshRecommendations()
    // Select a random game from new recommendations
    if (recommendations.games.length > 0) {
      const randomIndex = Math.floor(Math.random() * recommendations.games.length)
      setSelectedGame(recommendations.games[randomIndex])
    }
  }

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game)
  }

  const handleBuyGame = (game: Game) => {
    const steamUrl = `https://store.steampowered.com/app/${game.appId || game.id}`
    window.open(steamUrl, '_blank')
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    const appId = img.dataset.appId
    
    // Try different Steam image URLs as fallbacks
    const fallbackUrls = [
      `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/capsule_616x353.jpg`,
      `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`
    ]
    
    const currentSrc = img.getAttribute('src')
    const currentIndex = fallbackUrls.findIndex(url => url === currentSrc)
    
    if (currentIndex < fallbackUrls.length - 1) {
      img.src = fallbackUrls[currentIndex + 1]
    } else {
      // Final fallback - show emoji placeholder
      img.style.display = 'none'
      if (img.parentElement) {
        img.parentElement.innerHTML = '<span class="text-3xl">🎮</span>'
      }
    }
  }

  const getGenreColor = (genre: string) => {
    const colors: Record<string, string> = {
      'Action': 'text-red-400',
      'Adventure': 'text-green-400',
      'RPG': 'text-purple-400',
      'Strategy': 'text-blue-400',
      'Simulation': 'text-yellow-400',
      'Sports': 'text-orange-400',
      'Racing': 'text-pink-400',
      'Puzzle': 'text-indigo-400',
      'Platformer': 'text-teal-400',
      'FPS': 'text-red-500'
    }
    return colors[genre] || 'text-gray-400'
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    if (score >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  if (error) {
    return (
      <div className={`glass-morphism rounded-xl p-8 ${className}`}>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="text-2xl">🛒</span>
          What Should I Buy Next?
        </h2>
        
        <div className="text-center py-12">
          <div className="text-gray-400 text-xl mb-4">
            ⚠️
          </div>
          <p className="text-gray-300 mb-4">
            Unable to load Steam recommendations
          </p>
          <p className="text-gray-400 text-sm mb-4">
            {error}
          </p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gaming-primary text-white rounded-lg hover:bg-gaming-primary/80 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!hasRecommendations && !isLoading) {
    return (
      <div className={`glass-morphism rounded-xl p-8 ${className}`}>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="text-2xl">🛒</span>
          What Should I Buy Next?
        </h2>
        
        {/* Context Info */}
        {(userMood || personaTraits) && (
          <div className="mb-6 p-4 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Current Context:</span>
              <div className="flex items-center gap-2">
                {userMood && (
                  <span className="text-gaming-primary font-bold">
                    Free
                  </span>
                )}
                {personaTraits && (
                  <span className="text-gaming-primary text-sm">
                    {personaTraits.archetypeId}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="text-center py-12">
          <div className="text-gray-400 text-xl mb-4">
            🎮
          </div>
          <p className="text-gray-300 mb-4">
            No Steam recommendations available
          </p>
          <p className="text-gray-400 text-sm mb-4">
            Add more games to your library to get personalized recommendations
          </p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gaming-primary text-white rounded-lg hover:bg-gaming-primary/80 transition-colors"
          >
            Load Recommendations
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`glass-morphism rounded-xl p-8 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-2xl">🛒</span>
          What Should I Buy Next?
        </h2>
        <div className="flex items-center gap-2">
          {lastRefresh && (
            <span className="text-white/40 text-xs">
              {recommendationCount} games • {new Date(lastRefresh).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-3 py-1 bg-gaming-primary/20 text-gaming-primary rounded-lg hover:bg-gaming-primary/30 transition-colors disabled:opacity-50 text-sm"
          >
            {isLoading ? '🔄' : '🔄'} Refresh
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-6">
        <div className="flex bg-white/5 rounded-lg p-1">
          {[
            { id: 'top_rated' as const, label: '⭐ Top Rated', desc: 'Highest rated games on Steam' },
            { id: 'underrated' as const, label: '💎 Underrated', desc: 'High quality, low popularity' },
            { id: 'hidden_gems' as const, label: '💍 Hidden Gems', desc: 'Under-the-radar discoveries' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleCategoryChange(tab.id)}
              disabled={isLoading}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all text-sm ${
                currentCategory === tab.id
                  ? 'bg-gaming-primary text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              } disabled:opacity-50`}
              title={tab.desc}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Context Info */}
      {(userMood || personaTraits) && (
        <div className="mb-6 p-4 bg-white/5 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Recommendations based on:</span>
            <div className="flex items-center gap-2">
              {recommendations.genresSearched.map(genre => (
                <span key={genre.id} className={`text-sm ${getGenreColor(genre.name)}`}>
                  {genre.name}
                </span>
              ))}
            </div>
          </div>
          <p className="text-white/60 text-xs">
            Found {recommendations.totalFound} games
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-xl mb-4 animate-spin">
            🔄
          </div>
          <p className="text-gray-300">
            Finding Steam recommendations...
          </p>
        </div>
      ) : selectedGame ? (
        <>
          {/* Selected Game Details */}
          <div className="bg-white/5 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              {/* Game Cover Image */}
              <div className="w-32 h-32 bg-gaming-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                {selectedGame.coverImage ? (
                  <img 
                    src={selectedGame.coverImage} 
                    alt={selectedGame.title}
                    className="w-full h-full object-cover"
                    data-app-id={selectedGame.id}
                    onError={handleImageError}
                  />
                ) : (
                  <span className="text-3xl">🎮</span>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  {selectedGame.title}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`font-bold ${getScoreColor(selectedGame.globalRating || 0)}`}>
                    {selectedGame.globalRating ? `${selectedGame.globalRating}% Match` : 'N/A'}
                  </span>
                  <span className="text-white/40">•</span>
                  <span className="text-white/60 text-sm">
                    {selectedGame.genres?.slice(0, 2).join(', ') || 'Various'}
                  </span>
                </div>
                
                {selectedGame.description && (
                  <p className="text-white/70 text-sm leading-relaxed mb-3 line-clamp-3">
                    {selectedGame.description}
                  </p>
                )}
                
                {/* Release Date */}
                <div className="flex items-center gap-4 text-sm text-white/60 mb-3">
                  <span>Steam</span>
                  {selectedGame.releaseDate && (
                    <>
                      <span>•</span>
                      <span>{new Date(selectedGame.releaseDate).getFullYear()}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Other Recommendations */}
          {recommendations.games.length > 1 && (
            <div className="mb-6">
              <h4 className="text-white/60 text-sm mb-3">Other suggestions:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {recommendations.games
                  .filter(game => game.id !== selectedGame.id)
                  .slice(0, 4)
                  .map(game => (
                    <button
                      key={game.id}
                      onClick={() => handleGameSelect(game)}
                      className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-medium ${getScoreColor(game.globalRating || 0)}`}>
                          Score: {game.globalRating || 'N/A'}
                        </span>
                        <span className="text-white/60 text-xs truncate">
                          {game.genres[0]?.name || 'Various'}
                        </span>
                      </div>
                      <div className="text-white text-sm font-medium truncate">
                        {game.title}
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button 
              onClick={() => handleBuyGame(selectedGame)}
              className="flex-1 px-4 py-3 bg-gaming-accent hover:bg-gaming-primary text-white rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>🛒</span>
              Buy on Steam
            </button>
            <button 
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {isLoading ? '🔄' : '🔄'} New Suggestion
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}
