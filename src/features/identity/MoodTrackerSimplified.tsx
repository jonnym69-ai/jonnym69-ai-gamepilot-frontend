import React, { useState, useEffect, useCallback } from 'react'
import type { Game } from '@gamepilot/types'
import { type UserMood, type GameSession } from '@gamepilot/identity-engine'
import { MOODS, type MoodId } from '@gamepilot/static-data'
import { PageErrorBoundary } from '../../components/ErrorBoundary'
import { Loading } from '../../components/Loading'

interface MoodTrackerProps {
  games: Game[]
  onGameSessionStart?: (gameId: string, sessionData: any) => void
  onGameSessionEnd?: (gameId: string, sessionData: any) => void
}

interface UserMoodProfile {
  currentMood: MoodId
  moodHistory: UserMood[]
  dominantMood: MoodId
  lastUpdated: Date
}

export const MoodTracker: React.FC<MoodTrackerProps> = ({ 
  games, 
  onGameSessionEnd 
}) => {
  const [activeSessions, setActiveSessions] = useState<GameSession[]>([])
  const [userMoodProfile, setUserMoodProfile] = useState<UserMoodProfile | null>(null)
  const [isLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize mood profile with mock data
  useEffect(() => {
    try {
      // Mock user moods for now - TODO: Connect to real mood engine
      const userMoods: UserMood[] = [
        {
          id: 'chill',
          preference: 80,
          frequency: 4,
          lastExperienced: new Date(),
          triggers: ['relaxing', 'casual'],
          associatedGenres: ['puzzle', 'simulation']
        }
      ]
      const profile: UserMoodProfile = {
        currentMood: 'chill',
        moodHistory: userMoods,
        dominantMood: 'chill',
        lastUpdated: new Date()
      }
      setUserMoodProfile(profile)
    } catch (err) {
      console.error('Failed to initialize mood profile:', err)
      setError('Failed to initialize mood tracking')
    }
  }, [])

  
  // End game session
  const endGameSession = useCallback((sessionId: string) => {
    const sessionIndex = activeSessions.findIndex(s => s.id === sessionId)
    if (sessionIndex === -1) return

    const session = activeSessions[sessionIndex]
    if (!session) return

    const endTime = new Date()
    const duration = session.startTime ? (endTime.getTime() - session.startTime.getTime()) / 1000 / 60 : 0

    const updatedSession = {
      ...session,
      endTime,
      duration
    }

    setActiveSessions(prev => 
      prev.map((s, index) => 
        index === sessionIndex ? updatedSession : s
      )
    )

    // Update mood model with completed session
    const gameSession: GameSession = {
      id: session.id,
      gameId: session.gameId,
      gameName: 'Game', // Placeholder
      game: {} as Game, // Placeholder
      genre: 'unknown', // Placeholder
      startTime: session.startTime || new Date(),
      endTime: new Date(),
      duration: duration,
      mood: session.mood || 'chill',
      intensity: session.intensity || 5,
      tags: [],
      platform: 'unknown',
      rating: 3
    }

    // Mock mood preference update - TODO: Connect to real mood engine
    const updatedMoods = [...(userMoodProfile?.moodHistory || [])]

    if (updatedMoods) {
      setUserMoodProfile(prev => prev ? {
        ...prev,
        moodHistory: updatedMoods,
        lastUpdated: new Date()
      } : null)
    }

    onGameSessionEnd?.(session.gameId, {
      gameId: session.gameId,
      startTime: session.startTime,
      endTime,
      duration,
      intensity: session.intensity,
      mood: session.mood
    })
  }, [activeSessions, userMoodProfile, onGameSessionEnd])

  // Get mood display data
  const getMoodDisplay = (moodId: MoodId) => {
    const moodData = MOODS.find(m => m.id === moodId)
    return {
      name: moodData?.name || 'Unknown',
      color: moodData?.color || '#6B7280',
      icon: moodData?.icon || '🎮',
      description: moodData?.description || 'No description available'
    }
  }

  // Get current mood with fallback
  const currentMoodDisplay = userMoodProfile?.currentMood 
    ? getMoodDisplay(userMoodProfile.currentMood)
    : getMoodDisplay('chill')

  if (isLoading) {
    return (
      <PageErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker flex items-center justify-center">
          <Loading message="Initializing mood tracking..." size="xl" />
        </div>
      </PageErrorBoundary>
    )
  }

  if (error) {
    return (
      <PageErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker flex items-center justify-center">
          <div className="glass-morphism rounded-xl p-8 max-w-md w-full border border-red-500/30">
            <div className="text-center">
              <div className="text-6xl mb-4">🧠</div>
              <h2 className="text-2xl font-bold text-white mb-4">Mood Tracking Error</h2>
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
      </PageErrorBoundary>
    )
  }

  return (
    <PageErrorBoundary>
      <div className="space-y-6">
        {/* Current Mood Display */}
        <div className="glass-morphism rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Current Gaming Mood</h2>
            <div className="flex items-center space-x-4">
              <div className="text-6xl">{currentMoodDisplay.icon}</div>
              <div>
                <div className="text-xl font-bold text-white">{currentMoodDisplay.name}</div>
                <div className="text-sm text-gray-400 capitalize">{currentMoodDisplay.description}</div>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              Based on your recent gaming sessions
            </div>
          </div>

          {/* Mood Distribution */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Mood Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.values(MOODS).map((mood) => (
                <div key={mood.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{mood.icon}</div>
                    <div>
                      <div className="text-white font-medium">{mood.name}</div>
                      <div className="text-sm text-gray-400">{mood.description}</div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-400">0%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Active Gaming Sessions</h3>
          <div className="space-y-2">
            {activeSessions.slice(-5).map((session) => {
              const game = games.find(g => g.id === session.gameId)
              const moodDisplay = getMoodDisplay(session.mood)
              const duration = session.duration ? Math.round(session.duration / 60) : 0
              
              return (
                <div key={session.id} className="glass-morphism rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-700 rounded flex-shrink-0 overflow-hidden">
                        {game?.coverImage ? (
                          <img 
                              src={game.coverImage} 
                              alt={game.title}
                              className="w-full h-full object-cover"
                            />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-lg">🎮</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div>
                          <div className="text-white font-medium">{game?.title || 'Unknown Game'}</div>
                          <div className="text-sm text-gray-400">
                            {moodDisplay.icon} {moodDisplay.name.toLowerCase()} mood
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">{duration}h {duration > 1 ? 'hours' : 'hour'}</div>
                      <button
                        onClick={() => endGameSession(session.id)}
                        className="ml-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        End Session
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </PageErrorBoundary>
  )
}
