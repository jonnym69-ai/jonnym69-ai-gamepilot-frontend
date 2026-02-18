import { useState, useCallback, useMemo } from 'react'
import { MOODS, type MoodId } from '@gamepilot/static-data'
import type { Game } from '../types'

interface NewMoodRecommendationState {
  primaryMood?: MoodId
  secondaryMood?: MoodId
  intensity: number
  recommendations: Game[]
  isLoading: boolean
  error?: string
  hasRecommendations: boolean
}

interface UseNewMoodRecommendationsProps {
  games: Game[]
  onRecommendationsChange?: (recommendations: Game[]) => void
}

/**
 * New unified mood recommendation system
 * Replaces the old useMoodRecommendations hook
 */
export function useNewMoodRecommendations({ games, onRecommendationsChange }: UseNewMoodRecommendationsProps) {
  const [state, setState] = useState<NewMoodRecommendationState>({
    intensity: 50,
    recommendations: [],
    isLoading: false,
    hasRecommendations: false
  })

  // Filter games by mood
  const getMoodRecommendations = useCallback((primaryMood: MoodId, secondaryMood?: MoodId) => {
    if (!games || games.length === 0) return []

    const filtered = games.filter(game => {
      // Check for both mood and moods properties
      const gameMoods = Array.isArray((game as any).moods) ? (game as any).moods : [(game as any).mood]
      
      // Check primary mood
      const hasPrimaryMood = gameMoods.some(mood => mood === primaryMood)
      if (!hasPrimaryMood) return false
      
      // Check secondary mood if provided
      if (secondaryMood) {
        const hasSecondaryMood = gameMoods.some(mood => mood === secondaryMood)
        return hasSecondaryMood
      }
      
      return true
    })

    return filtered.slice(0, 12) // Limit to 12 recommendations
  }, [games])

  const selectMood = useCallback((primaryMood: MoodId, secondaryMood?: MoodId) => {
    setState(prev => ({ ...prev, isLoading: true }))
    
    try {
      const recommendations = getMoodRecommendations(primaryMood, secondaryMood)
      setState({
        primaryMood,
        secondaryMood,
        intensity: 50,
        recommendations,
        isLoading: false,
        hasRecommendations: recommendations.length > 0
      })
      
      onRecommendationsChange?.(recommendations)
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
    }
  }, [getMoodRecommendations, onRecommendationsChange])

  const clearMood = useCallback(() => {
    setState({
      intensity: 50,
      recommendations: [],
      isLoading: false,
      hasRecommendations: false
    })
    onRecommendationsChange?.([])
  }, [onRecommendationsChange])

  const setIntensity = useCallback((intensity: number) => {
    setState(prev => ({ ...prev, intensity }))
  }, [])

  return {
    ...state,
    selectMood,
    clearMood,
    setIntensity,
    hasMoodRecommendations: state.hasRecommendations
  }
}
