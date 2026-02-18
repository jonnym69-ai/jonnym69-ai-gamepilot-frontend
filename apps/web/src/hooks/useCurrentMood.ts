import { useState, useEffect } from 'react'
import { moodService } from '../services/moodService'
import { realMoodEngine, type SteamMoodProfile } from '../services/realMoodEngine'
import { useLibraryStore } from '../stores/useLibraryStore'

// Type for mood entry that matches persona expectations
export interface CurrentMoodEntry {
  moodId: string
  intensity: number
  timestamp: Date
  confidence: number
  source: 'fallback' | 'steam-data' | 'api'
}

/**
 * Hook to get current mood data for persona integration
 * Uses real Steam data when available, falls back to API service
 */
export function useCurrentMood(): CurrentMoodEntry | null {
  const [currentMood, setCurrentMood] = useState<CurrentMoodEntry | null>(null)
  const { games } = useLibraryStore()

  useEffect(() => {
    const computeCurrentMood = async () => {
      try {
        // Try to compute mood from Steam library data first
        if (games && games.length > 0) {
          const moodProfile: SteamMoodProfile = realMoodEngine.computeMoodProfile(games)
          
          const moodEntry: CurrentMoodEntry = {
            moodId: moodProfile.primaryMood,
            intensity: Math.round(moodProfile.moodScores[moodProfile.primaryMood] * 10),
            timestamp: moodProfile.lastComputed,
            confidence: 0.85, // High confidence with real data
            source: 'steam-data'
          }
          
          setCurrentMood(moodEntry)
          return
        }

        // Fallback to API service if no Steam data
        const userId = 'current-user' // In real app, this would come from auth
        const forecast = await moodService.getMoodForecast(userId)
        
        if (forecast?.primaryForecast?.predictedMood) {
          const moodEntry: CurrentMoodEntry = {
            moodId: forecast.primaryForecast.predictedMood,
            intensity: Math.round(forecast.primaryForecast.confidence * 10),
            timestamp: new Date(forecast.generatedAt || Date.now()),
            confidence: forecast.primaryForecast.confidence,
            source: 'api'
          }
          
          setCurrentMood(moodEntry)
        } else {
          // Final fallback
          setCurrentMood({
            moodId: 'zen',
            intensity: 5,
            timestamp: new Date(),
            confidence: 0.5,
            source: 'fallback'
          })
        }
      } catch (error) {
        // Silent error handling to avoid console spam
        
        // Fallback to zen mood
        setCurrentMood({
          moodId: 'zen',
          intensity: 5,
          timestamp: new Date(),
          confidence: 0.5,
          source: 'fallback'
        })
      }
    }

    computeCurrentMood()
    
    // Set up periodic refresh (every 5 minutes)
    const interval = setInterval(computeCurrentMood, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [games]) // Recompute when games change

  return currentMood
}

/**
 * Hook to get full mood profile from Steam data
 */
export function useMoodProfile(): SteamMoodProfile | null {
  const [moodProfile, setMoodProfile] = useState<SteamMoodProfile | null>(null)
  const { games } = useLibraryStore()

  useEffect(() => {
    if (games && games.length > 0) {
      const profile = realMoodEngine.computeMoodProfile(games)
      setMoodProfile(profile)
    }
  }, [games])

  return moodProfile
}

/**
 * Hook to get mood-based recommendations
 */
export function useMoodRecommendations(count: number = 10) {
  const [recommendations, setRecommendations] = useState<any[]>([])
  const { games } = useLibraryStore()
  const moodProfile = useMoodProfile()

  useEffect(() => {
    if (games && games.length > 0 && moodProfile) {
      const recs = realMoodEngine.getMoodRecommendations(games, moodProfile, count)
      setRecommendations(recs)
    }
  }, [games, moodProfile, count])

  return recommendations
}
