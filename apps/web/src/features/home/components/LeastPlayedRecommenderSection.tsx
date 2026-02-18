import React, { useState, useMemo } from 'react'
import type { Game } from '@gamepilot/types'
import { LazyImage } from '../../../components/LazyImage'
import { getHighQualityGameImage } from '../../../utils/gameImageUtils'

interface LeastPlayedRecommenderProps {
  games: Game[]
  onLaunchGame: (game: any) => void
}

// Calculate neglect score based on multiple factors for better accuracy
const calculateNeglectScore = (game: Game): number => {
  const now = Date.now()

  // Games never played get highest neglect score but should be filtered out
  if (!game.lastPlayed) {
    return 1000
  }

  // Ensure lastPlayed is a Date object
  const lastPlayedDate = game.lastPlayed instanceof Date ? game.lastPlayed : new Date(game.lastPlayed)
  const lastPlayedTime = lastPlayedDate.getTime()
  const daysSincePlayed = (now - lastPlayedTime) / (1000 * 60 * 60 * 24)

  // Games played in last 7 days are not neglected
  if (daysSincePlayed < 7) return 0

  // Games played in last 14 days get low neglect
  if (daysSincePlayed < 14) return 0.1

  const hoursPlayed = game.hoursPlayed || game.totalPlaytime || 0

  // Factor 1: Time since last played (exponential decay)
  const timeFactor = Math.min(daysSincePlayed / 30, 10) // Cap at 10 for very old games

  // Factor 2: Investment level (more hours = less neglect per day)
  const investmentFactor = Math.max(1 - (hoursPlayed / 100), 0.1) // Less neglect for highly invested games

  // Factor 3: Play frequency (how often they play this game)
  const sessions = game.localSessionCount || 1
  const frequencyFactor = hoursPlayed > 0 ? Math.max(1 - (sessions / hoursPlayed), 0.2) : 1

  // Factor 4: Recent acquisition (new games shouldn't be neglected yet)
  const addedAt = game.addedAt?.getTime() || lastPlayedTime
  const daysSinceAdded = (now - addedAt) / (1000 * 60 * 60 * 24)
  const newGameFactor = daysSinceAdded < 30 ? 0.3 : 1 // Reduce neglect for new games

  // Factor 5: Favorite games get less neglect
  const favoriteFactor = game.isFavorite ? 0.5 : 1

  // Combine factors: higher score = more neglected
  const neglectScore = timeFactor * investmentFactor * frequencyFactor * newGameFactor * favoriteFactor

  // Ensure minimum neglect threshold and reasonable maximum
  return Math.max(0.1, Math.min(neglectScore, 50))
}

export const LeastPlayedRecommenderSection: React.FC<LeastPlayedRecommenderProps> = ({
  games,
  onLaunchGame
}) => {
  const [currentGameIndex, setCurrentGameIndex] = useState(0)

  const neglectedGames = useMemo(() => {
    if (!games.length) return []

    // Calculate neglect scores and sort by highest neglect (most forgotten)
    const gamesWithScores = games.map(game => ({
      ...game,
      neglectScore: calculateNeglectScore(game)
    }))

    // Sort by neglect score (highest first) and filter out games played in last 7 days
    return gamesWithScores
      .filter(game => game.neglectScore > 0)
      .sort((a, b) => b.neglectScore - a.neglectScore)
      .slice(0, 10) // Top 10 most neglected
  }, [games])

  const currentGame = neglectedGames[currentGameIndex]

  const handlePlayNow = () => {
    if (currentGame) {
      onLaunchGame(currentGame)
    } else {
      console.warn('No game found for play now action')
    }
  }

  const handleShowAnother = () => {
    if (neglectedGames.length > 1) {
      setCurrentGameIndex((prev) => (prev + 1) % neglectedGames.length)
    }
  }

  const getNeglectReason = (game: Game & { neglectScore: number }) => {
    // Calculate actual days since last played
    const now = Date.now()
    const lastPlayedTime = game.lastPlayed?.getTime() || 0
    const daysSincePlayed = Math.floor((now - lastPlayedTime) / (1000 * 60 * 60 * 24))

    // Provide contextual reasons based on actual time and neglect score
    if (daysSincePlayed > 365) return `Over ${Math.floor(daysSincePlayed / 365)} years since you played`
    if (daysSincePlayed > 180) return "Over 6 months since you played"
    if (daysSincePlayed > 90) return "Over 3 months since you played"
    if (daysSincePlayed > 30) return `Over ${Math.floor(daysSincePlayed / 30)} months since you played`
    if (daysSincePlayed > 14) return "A couple weeks since you played"
    if (daysSincePlayed > 7) return "Over a week since you played"

    // For lower neglect scores, provide more nuanced reasons
    const hoursPlayed = game.hoursPlayed || game.totalPlaytime || 0
    if (hoursPlayed > 50) return "You loved this game - time for a reunion!"
    if (hoursPlayed > 20) return "A game you enjoyed - worth revisiting"
    if (game.isFavorite) return "One of your favorites - let's play again"
    return "It's been a while - time to rediscover this gem"
  }

  if (!neglectedGames.length) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-2xl">🕰️</span>
            Rediscover Forgotten Games
          </h2>
          <div className="text-sm text-gray-400">
            All games recently played
          </div>
        </div>

        <div className="glass-morphism rounded-xl p-12 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Great job staying current!
            </h3>
            <p className="text-gray-300">
              All your games have been played recently. Come back later to rediscover forgotten favorites.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-2xl">🕰️</span>
          Rediscover Forgotten Games
        </h2>
        <div className="text-sm text-gray-400">
          {neglectedGames.length} games waiting
        </div>
      </div>

      <div className="glass-morphism rounded-xl overflow-hidden">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Game Cover - Much smaller, stacked on mobile */}
          <div className="w-32 h-32 flex-shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-orange-500/20 to-red-500/20">
            <LazyImage
              src={getHighQualityGameImage(currentGame)}
              alt={currentGame.title}
              className="w-full h-full"
            />
          </div>

          {/* Game Info - Takes most of the space */}
          <div className="flex-1 p-6 flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-white mb-2">
              {currentGame.title}
            </h3>

            <div className="mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">
                <span>🕰️</span>
                {getNeglectReason(currentGame)}
              </span>
            </div>

            {currentGame.genres && currentGame.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {currentGame.genres.slice(0, 3).map(genre => (
                  <span
                    key={genre.id}
                    className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            <div className="space-y-2 mb-6 text-gray-300">
              {currentGame.hoursPlayed && (
                <p>⏱️ {Math.floor(currentGame.hoursPlayed)}h played</p>
              )}
              {currentGame.localSessionCount && (
                <p>🎮 {currentGame.localSessionCount} sessions</p>
              )}
              {currentGame.playStatus && (
                <p>📊 Status: {currentGame.playStatus}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePlayNow}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all"
              >
                <span className="flex items-center gap-2">
                  <span>▶️</span>
                  Play Now
                </span>
              </button>

              {neglectedGames.length > 1 && (
                <button
                  onClick={handleShowAnother}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <span>🔄</span>
                    Show Another
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
