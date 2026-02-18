import React, { useState, useMemo } from 'react'
import type { Game } from '@gamepilot/types'
import { MOODS, type MoodId } from '@gamepilot/static-data'

interface MoodRecommendationProps {
  games: Game[]
  userMoodProfile: any
  currentMood?: MoodId
}

interface Recommendation {
  game: Game
  score: number
  reason: string
  type: 'mood-based' | 'playstyle-aware' | 'genre-affinity' | 'trending'
  confidence: number
}

export const MoodRecommendationEngine: React.FC<MoodRecommendationProps> = ({ 
  games, 
  currentMood 
}) => {
  const [isLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateRecommendations = useMemo((): Recommendation[] => {
    if (!games || games.length === 0) return []

    const recommendations: Recommendation[] = []

    if (currentMood) {
      const moodData = MOODS.find(m => m.id === currentMood)
      if (moodData) {
        const moodBasedGames = games.filter(game => {
          const gameMoods = moodData.associatedGenres || []
          return game.genres?.some(genre => 
            gameMoods.some(moodGenre => 
              genre.name.toLowerCase().includes(moodGenre.toLowerCase())
            )
          )
        })

        moodBasedGames.slice(0, 5).forEach(game => {
          recommendations.push({
            game,
            score: 85,
            reason: `Matches your ${currentMood} mood`,
            type: 'mood-based',
            confidence: 0.8
          })
        })
      }
    }

    return recommendations
  }, [games, currentMood])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker flex items-center justify-center">
        <div className="text-white text-xl">Generating personalized recommendations...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker flex items-center justify-center">
        <div className="glass-morphism rounded-xl p-8 max-w-md w-full border border-red-500/30">
          <div className="text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-2xl font-bold text-white mb-4">Recommendation Error</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="px-6 py-2 bg-gaming-primary text-white rounded-lg hover:bg-gaming-primary/80"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="glass-morphism rounded-xl border border-white/10 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Mood-Based Recommendations</h2>
        <div className="text-sm text-gray-400 mb-6">
          Games that match your current mood: {currentMood || 'No mood selected'}
        </div>
        
        {generateRecommendations.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎮</div>
            <p className="text-gray-400">No recommendations available</p>
            <p className="text-sm text-gray-500 mt-2">Select a mood to get personalized game suggestions</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generateRecommendations.map((rec) => (
              <div key={rec.game.id} className="glass-morphism rounded-lg p-4 border border-white/10 hover:border-gaming-primary/50 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    {rec.game.coverImage ? (
                      <img 
                        src={rec.game.coverImage} 
                        alt={rec.game.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl">🎮</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-1">{rec.game.title}</h3>
                    <p className="text-gray-400 text-sm mb-2">{rec.reason}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{rec.type}</span>
                      <span className="text-xs font-medium text-gaming-primary">
                        {Math.round(rec.confidence * 100)}% match
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
