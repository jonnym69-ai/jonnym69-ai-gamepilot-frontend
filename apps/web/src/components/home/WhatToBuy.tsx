import React, { useState } from 'react'
import type { RecommendationResult } from '../../features/recommendation/recommendationEngine'
import { MOODS, type MoodId } from '@gamepilot/static-data'

interface WhatToBuyProps {
  recommendedGame: RecommendationResult | null
  onRefresh?: () => void
  userMood?: string
  personaTraits?: any
}

export const WhatToBuy: React.FC<WhatToBuyProps> = ({ 
  recommendedGame, 
  onRefresh,
  userMood,
  personaTraits
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800))
    onRefresh?.()
    setIsRefreshing(false)
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    
    // Map game IDs to Steam app IDs
    const steamAppIds: Record<string, string> = {
      'bg3': '1086940',
      'cyberpunk': '1091500', 
      'stardew': '413150',
      'hades': '1145360',
      'disco': '646920',
      'vampire': '1794680',
      'elden': '1245620',
      'hollow': '367520',
      'slay': '646570',
      'minecraft': '239140'
    }
    
    const gameId = steamAppIds[recommendedGame?.game.id || ''] || recommendedGame?.game.id || 'default'
    
    // Try different image URLs as fallbacks
    const fallbackUrls = [
      `https://cdn.akamai.steamstatic.com/steam/apps/${gameId}/header.jpg`,
      `https://cdn.akamai.steamstatic.com/steam/apps/${gameId}/capsule_616x353.jpg`,
      `https://cdn.akamai.steamstatic.com/steam/apps/${gameId}/capsule_184x69.jpg`
    ]
    
    // Try the next fallback URL
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

  const handleBuyGame = () => {
    if (recommendedGame?.game.steamUrl) {
      window.open(recommendedGame.game.steamUrl, '_blank')
    }
  }

  const getMoodEmoji = (mood: string) => {
    const moodData = MOODS.find(m => m.id === mood)
    return moodData?.emoji || '🎮'
  }

  const getMoodColor = (mood: string) => {
    const colors: Record<string, string> = {
      chill: 'text-blue-400',
      competitive: 'text-red-400',
      story: 'text-purple-400',
      creative: 'text-green-400',
      social: 'text-pink-400',
      focused: 'text-yellow-400'
    }
    return colors[mood] || 'text-gray-400'
  }

  if (!recommendedGame) {
    return (
      <div className="glass-morphism rounded-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="text-2xl">🛒</span>
          What Should I Buy Next?
        </h2>
        
        {/* Mood/Persona Context */}
        {(userMood || personaTraits) && (
          <div className="mb-6 p-4 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Current Context:</span>
              <div className="flex items-center gap-2">
                {userMood && (
                  <span className={`flex items-center gap-1 ${getMoodColor(userMood)}`}>
                    <span>{getMoodEmoji(userMood)}</span>
                    <span className="text-sm capitalize">{userMood}</span>
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
            No recommendations available
          </p>
          <p className="text-gray-400 text-sm mb-4">
            Add more games to your library to get personalized recommendations
          </p>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-gaming-primary text-white rounded-lg hover:bg-gaming-primary/80 transition-colors disabled:opacity-50"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-morphism rounded-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-2xl">🛒</span>
          What Should I Buy Next?
        </h2>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-3 py-1 bg-gaming-primary/20 text-gaming-primary rounded-lg hover:bg-gaming-primary/30 transition-colors disabled:opacity-50 text-sm"
        >
          {isRefreshing ? '🔄' : '🔄'} Refresh
        </button>
      </div>

      {/* Recommendation Context */}
      <div className="mb-6 p-4 bg-white/5 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-sm">Recommended because:</span>
          <div className="flex items-center gap-2">
            {userMood && (
              <span className={`flex items-center gap-1 ${getMoodColor(userMood)}`}>
                <span>{getMoodEmoji(userMood)}</span>
                <span className="text-sm capitalize">{userMood}</span>
              </span>
            )}
            {personaTraits && (
              <span className="text-gaming-primary text-sm">
                {personaTraits.archetypeId}
              </span>
            )}
          </div>
        </div>
        <p className="text-white/80 text-sm">{recommendedGame.explanation}</p>
      </div>

      {/* Game Recommendation */}
      <div className="bg-white/5 rounded-lg p-6">
        <div className="flex items-start gap-4">
          {/* Game Cover Image */}
          <div className="w-32 h-32 bg-gaming-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
            {recommendedGame.game.coverImage ? (
              <img 
                src={recommendedGame.game.coverImage} 
                alt={recommendedGame.game.name}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            ) : (
              <span className="text-3xl">🎮</span>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{recommendedGame.game.name}</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gaming-accent font-bold">
                {Math.round(recommendedGame.score)}% Match
              </span>
              <span className="text-white/40">•</span>
              <span className="text-white/60 text-sm">
                {recommendedGame.game.genres?.slice(0, 2).join(', ') || 'Various'}
              </span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-3">
              {recommendedGame.explanation}
            </p>
            
            {/* Price and Platform */}
            <div className="flex items-center gap-4 text-sm text-white/60 mb-3">
              {recommendedGame.game.price && (
                <span className="text-gaming-accent font-semibold">
                  {recommendedGame.game.price}
                </span>
              )}
              <span>•</span>
              <span>Steam</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-3">
        <button 
          onClick={handleBuyGame}
          className="flex-1 px-4 py-3 bg-gaming-accent hover:bg-gaming-primary text-white rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <span>🛒</span>
          Buy on Steam
        </button>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
        >
          {isRefreshing ? '🔄' : '🔄'} New Suggestion
        </button>
      </div>
    </div>
  )
}
