import { useState, useCallback } from 'react'
import { ENHANCED_MOODS, type EnhancedMoodId } from '@gamepilot/static-data'
import type { Game } from '../types'

/**
 * @deprecated This hook uses the old mood system
 * Use useNewMoodRecommendations instead for the unified mood system
 */

interface MoodRecommendationState {
  primaryMood?: EnhancedMoodId
  secondaryMood?: EnhancedMoodId
  intensity: number
  recommendations: Game[]
  isLoading: boolean
  error?: string
}

interface UseMoodRecommendationsProps {
  games: Game[]
  onRecommendationsChange?: (recommendations: Game[]) => void
}

/**
 * @deprecated Old mood recommendation system
 * This is kept for backward compatibility but should not be used
 * Use useNewMoodRecommendations instead
 */
export function useMoodRecommendations({ games, onRecommendationsChange }: UseMoodRecommendationsProps) {
  const [state, setState] = useState<MoodRecommendationState>({
    intensity: 0.8,
    recommendations: [],
    isLoading: false
  })

  const selectMood = useCallback(async (primaryMood: EnhancedMoodId, secondaryMood?: EnhancedMoodId) => {
    console.warn('useMoodRecommendations is deprecated. Use useNewMoodRecommendations instead.')
    
    // Return empty recommendations for backward compatibility
    setState(prev => ({
      ...prev,
      primaryMood,
      secondaryMood,
      recommendations: [],
      isLoading: false
    }))
    
    onRecommendationsChange?.([])
  }, [onRecommendationsChange])

  const clearMood = useCallback(() => {
    setState(prev => ({
      ...prev,
      primaryMood: undefined,
      secondaryMood: undefined,
      recommendations: []
    }))
    onRecommendationsChange?.([])
  }, [onRecommendationsChange])

  const setIntensity = useCallback((intensity: number) => {
    setState(prev => ({ ...prev, intensity }))
  }, [])

  return {
    // State
    primaryMood: state.primaryMood,
    secondaryMood: state.secondaryMood,
    intensity: state.intensity,
    recommendations: state.recommendations,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    selectMood,
    clearMood,
    setIntensity,
    
    // Computed
    hasRecommendations: state.recommendations.length > 0
  }
}
