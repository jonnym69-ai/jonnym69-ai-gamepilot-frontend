import { useState } from 'react'
import { SimpleMoodSelector } from '../components/SimpleMoodSelector'
import { useMoodRecommendations } from '../hooks/useMoodRecommendations'
import type { Game } from '../types'

/**
 * Example: Enhanced Library with Mood Integration
 * Shows how to add the mood system to the existing library view
 */

export function EnhancedLibraryExample({ games }: { games: Game[] }) {
  const [showMoodSelector, setShowMoodSelector] = useState(false)
  const [currentView, setCurrentView] = useState<'all' | 'mood'>('all')

  const {
    selectMood,
    clearMood,
    primaryMoodInfo,
    secondaryMoodInfo,
    recommendations,
    isLoading,
    recommendationCount
  } = useMoodRecommendations({
    games,
    onRecommendationsChange: (recs: Game[]) => {
      console.log('Mood recommendations updated:', recs.length)
    }
  })

  const handleMoodSelect = (primaryMood: string, secondaryMood?: string) => {
    selectMood(primaryMood, secondaryMood)
    setCurrentView('mood')
    setShowMoodSelector(false)
  }

  const displayGames = currentView === 'mood' ? recommendations : games

  return (
    <div className="space-y-6">
      {/* Header with Mood Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {currentView === 'mood' ? 'Mood-Based Recommendations' : 'Game Library'}
          </h1>
          <p className="text-gray-400">
            {currentView === 'mood' 
              ? `${recommendationCount} games matching your mood`
              : `${games.length} games in your library`
            }
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowMoodSelector(!showMoodSelector)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'mood' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {showMoodSelector ? 'Hide Mood' : 'Select Mood'}
          </button>
          
          {currentView === 'mood' && (
            <button
              onClick={() => {
                clearMood()
                setCurrentView('all')
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              Show All Games
            </button>
          )}
        </div>
      </div>

      {/* Current Mood Selection Display */}
      {currentView === 'mood' && (primaryMoodInfo || secondaryMoodInfo) && (
        <div className="glass-morphism rounded-xl p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {primaryMoodInfo && (
                <>
                  <span className="text-2xl">{primaryMoodInfo.emoji}</span>
                  <span className="text-white font-medium">{primaryMoodInfo.name}</span>
                </>
              )}
              {secondaryMoodInfo && (
                <>
                  <span className="text-gray-400">+</span>
                  <span className="text-2xl">{secondaryMoodInfo.emoji}</span>
                  <span className="text-white font-medium">{secondaryMoodInfo.name}</span>
                </>
              )}
            </div>
            
            <div className="ml-auto text-sm text-gray-400">
              {recommendationCount} recommendations
            </div>
          </div>
          
          <p className="text-sm text-gray-400 mt-2">
            {primaryMoodInfo?.description}
            {secondaryMoodInfo && ` + ${secondaryMoodInfo.description}`}
          </p>
        </div>
      )}

      {/* Mood Selector */}
      {showMoodSelector && (
        <SimpleMoodSelector
          onMoodChange={handleMoodSelect}
          variant="full"
        />
      )}

      {/* Loading State */}
      {isLoading && currentView === 'mood' && (
        <div className="text-center py-8">
          <div className="text-gray-400">Finding games that match your mood...</div>
        </div>
      )}

      {/* Games Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayGames.map((game) => (
            <div key={game.id} className="glass-morphism rounded-lg p-4 hover:scale-105 transition-transform">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-white">{game.title}</h3>
              </div>
              
              <div className="flex gap-2 mb-2">
                {game.genres?.slice(0, 2).map((genre: any) => (
                  <span 
                    key={typeof genre === 'string' ? genre : genre.id}
                    className="px-2 py-1 bg-gray-700 rounded text-xs"
                  >
                    {typeof genre === 'string' ? genre : genre.name}
                  </span>
                ))}
              </div>
              
              <div className="flex gap-2 mb-3">
                {game.tags?.slice(0, 3).map((tag: any) => (
                  <span 
                    key={typeof tag === 'string' ? tag : tag.id}
                    className="px-2 py-1 bg-gray-600 rounded text-xs"
                  >
                    {typeof tag === 'string' ? tag : tag.name}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>{game.hoursPlayed || 0} hours played</span>
                <span>{game.platforms?.length || 0} platforms</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty States */}
      {!isLoading && displayGames.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">
            {currentView === 'mood' 
              ? 'No games match your mood selection' 
              : 'No games in your library'
            }
          </div>
          {currentView === 'mood' && (
            <button
              onClick={() => setShowMoodSelector(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
            >
              Try a Different Mood
            </button>
          )}
        </div>
      )}
    </div>
  )
}
