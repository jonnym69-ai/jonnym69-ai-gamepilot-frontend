import React, { useState } from 'react'
import type { Game } from '@gamepilot/types'
import { getWeightedRandomGame } from '../utils/homeHelpers'
import { LazyImage } from '../../../components/LazyImage'

interface SurpriseMeProps {
  games: Game[]
  onLaunchGame: (gameId: string) => void
}

export const SurpriseMeSection: React.FC<SurpriseMeProps> = ({ games, onLaunchGame }) => {
  const [surprisedGame, setSurprisedGame] = useState<Game | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)

  const handleSurpriseMe = () => {
    setIsSpinning(true)
    setSurprisedGame(null)
    
    // Add a small delay for dramatic effect
    setTimeout(() => {
      const game = getWeightedRandomGame(games)
      setSurprisedGame(game)
      setIsSpinning(false)
    }, 800)
  }

  const handlePlayNow = () => {
    if (surprisedGame) {
      if (surprisedGame.appId) {
        onLaunchGame(surprisedGame.appId.toString())
      } else {
        console.warn('No appId found for game:', surprisedGame.title)
      }
    }
  }

  const handleSpinAgain = () => {
    handleSurpriseMe()
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-2xl">🎲</span>
          Surprise Me
        </h2>
        <div className="text-sm text-gray-400">
          {games.length} games available
        </div>
      </div>

      {!surprisedGame ? (
        // Initial state - show the big button
        <div className="glass-morphism rounded-xl p-12 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Can't decide what to play?
            </h3>
            <p className="text-gray-300">
              Let us pick the perfect game from your library based on your play history and preferences.
            </p>
          </div>
          
          <button
            onClick={handleSurpriseMe}
            disabled={isSpinning || games.length === 0}
            className="px-8 py-4 bg-gradient-to-r from-gaming-primary to-gaming-secondary text-white rounded-lg font-semibold text-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSpinning ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">🎲</span>
                Picking your game...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>🎲</span>
                Surprise Me
              </span>
            )}
          </button>
          
          {games.length === 0 && (
            <p className="text-sm text-gray-400 mt-4">
              Import some games first to get surprised!
            </p>
          )}
        </div>
      ) : (
        // Game revealed state
        <div className="glass-morphism rounded-xl overflow-hidden">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Game Cover - Much smaller, stacked on mobile */}
            <div className="w-32 h-32 flex-shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-gaming-primary/20 to-gaming-secondary/20">
              {surprisedGame.coverImage ? (
                <LazyImage
                  src={surprisedGame.coverImage}
                  alt={surprisedGame.title}
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-3xl text-gray-500">🎮</div>
                </div>
              )}
            </div>
            
            {/* Game Info - Takes most of the space */}
            <div className="flex-1 p-6 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-white mb-2">
                {surprisedGame.title}
              </h3>
              
              {surprisedGame.genres && surprisedGame.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {surprisedGame.genres.slice(0, 3).map(genre => (
                    <span
                      key={genre.id}
                      className="px-2 py-1 bg-gaming-accent/20 rounded text-xs text-gaming-accent"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="space-y-2 mb-6 text-gray-300">
                {surprisedGame.hoursPlayed && (
                  <p>⏱️ {Math.floor(surprisedGame.hoursPlayed)}h played</p>
                )}
                {surprisedGame.localSessionCount && (
                  <p>🎮 {surprisedGame.localSessionCount} sessions</p>
                )}
                {surprisedGame.playStatus && (
                  <p>📊 Status: {surprisedGame.playStatus}</p>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handlePlayNow}
                  className="px-6 py-3 bg-gradient-to-r from-gaming-primary to-gaming-secondary text-white rounded-lg font-semibold hover:opacity-90 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <span>▶️</span>
                    Play Now
                  </span>
                </button>
                
                <button
                  onClick={handleSpinAgain}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <span>🎲</span>
                    Spin Again
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
