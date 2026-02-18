import { useState, useCallback, useEffect } from 'react'
import { ENHANCED_MOODS, type EnhancedMoodId } from '@gamepilot/static-data'
import type { Game } from '../types'

// Define types locally until identity-engine exports are fixed
interface MoodSelectionEvent {
  id: string
  userId: string
  primaryMood: EnhancedMoodId
  secondaryMood?: EnhancedMoodId
  intensity: number
  timestamp: Date
  context: {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
    dayOfWeek: number
    trigger: 'manual' | 'suggested' | 'auto'
    previousMood?: EnhancedMoodId
    sessionLength?: number
  }
  outcomes: {
    gamesRecommended: number
    gamesLaunched: number
    averageSessionDuration?: number
    userRating?: number
    ignoredRecommendations: number
  }
}

interface UserAction {
  id: string
  userId: string
  type: 'launch' | 'ignore' | 'view' | 'wishlist' | 'rate' | 'switch_mood' | 'session_complete'
  gameId?: string
  gameTitle?: string
  moodContext?: {
    primaryMood: EnhancedMoodId
    secondaryMood?: EnhancedMoodId
  }
  timestamp: Date
  sessionId?: string
  metadata: {
    sessionDuration?: number
    rating?: number
    reason?: string
    previousMood?: EnhancedMoodId
  }
}

interface MoodSuggestion {
  moodId: EnhancedMoodId
  confidence: number
  reasoning: string
  contextualFactors: string[]
  successProbability: number
}

interface MoodSuggestionContext {
  currentTime: Date
  recentSessions?: any[]
  previousMood?: EnhancedMoodId
  availableTime?: number
  socialContext?: 'solo' | 'co-op' | 'pvp'
}

/**
 * Enhanced mood system hook with persona integration and API persistence
 * Provides learning capabilities and adaptive recommendations
 */
interface EnhancedMoodState {
  primaryMood?: EnhancedMoodId
  secondaryMood?: EnhancedMoodId
  intensity: number
  recommendations: Game[]
  isLoading: boolean
  error?: string
  moodHistory: MoodSelectionEvent[]
  suggestions: MoodSuggestion[]
  dynamicWeights: any
  learningMetrics: {
    predictionAccuracy: number
    userSatisfactionScore: number
    adaptationRate: number
  }
}

interface UseEnhancedMoodSystemProps {
  games: Game[]
  userId: string
  onRecommendationsChange?: (recommendations: Game[]) => void
}

export function useEnhancedMoodSystem({ 
  games, 
  userId,
  onRecommendationsChange 
}: UseEnhancedMoodSystemProps) {
  const [state, setState] = useState<EnhancedMoodState>({
    intensity: 0.8,
    recommendations: [],
    isLoading: false,
    moodHistory: [],
    suggestions: [],
    dynamicWeights: {},
    learningMetrics: {
      predictionAccuracy: 0.5,
      userSatisfactionScore: 0.7,
      adaptationRate: 0.1
    }
  })

  // Track mood selection with learning and API persistence
  const selectMoodWithLearning = useCallback(async (
    primaryMood: EnhancedMoodId,
    secondaryMood?: EnhancedMoodId
  ): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }))
    
    try {
      // Validate mood compatibility
      const primary = ENHANCED_MOODS.find(m => m.id === primaryMood)
      if (!primary) {
        throw new Error(`Primary mood not found: ${primaryMood}`)
      }

      if (secondaryMood) {
        const isConflicting = primary.conflictingMoods.includes(secondaryMood)
        if (isConflicting) {
          throw new Error(`Moods conflict: ${primary.name} + ${secondaryMood}`)
        }
      }

      // Create mood selection event
      const moodEvent: MoodSelectionEvent = {
        id: `mood-${Date.now()}-${Math.random()}`,
        userId,
        primaryMood,
        secondaryMood,
        intensity: state.intensity,
        timestamp: new Date(),
        context: {
          timeOfDay: getTimeOfDay(new Date()),
          dayOfWeek: new Date().getDay(),
          trigger: 'manual',
          previousMood: state.primaryMood
        },
        outcomes: {
          gamesRecommended: 0,
          gamesLaunched: 0,
          ignoredRecommendations: 0
        }
      }

      // Send to backend API for persistence and processing
      await sendMoodSelectionToAPI(moodEvent)

      // Generate recommendations with learned weights
      const recommendations = await getPersonalizedRecommendations(
        primaryMood,
        secondaryMood
      )

      // Update local state
      setState(prev => ({
        ...prev,
        primaryMood,
        secondaryMood,
        recommendations,
        isLoading: false,
        moodHistory: [...prev.moodHistory, moodEvent]
      }))

      onRecommendationsChange?.(recommendations)

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to select mood',
        isLoading: false
      }))
    }
  }, [userId, state.intensity, state.primaryMood, onRecommendationsChange])

  // Get personalized mood suggestions from API
  const getMoodSuggestions = useCallback(async (
    context?: Partial<MoodSuggestionContext>
  ): Promise<MoodSuggestion[]> => {
    try {
      const suggestionContext: MoodSuggestionContext = {
        currentTime: new Date(),
        ...context
      }

      const suggestions = await fetchMoodSuggestionsFromAPI(userId, suggestionContext)
      setState(prev => ({ ...prev, suggestions }))
      return suggestions

    } catch (error) {
      console.error('Failed to get mood suggestions:', error)
      return []
    }
  }, [userId])

  // Track user actions for learning with API persistence
  const trackUserAction = useCallback(async (
    action: Omit<UserAction, 'id' | 'userId' | 'timestamp'>
  ): Promise<void> => {
    try {
      const userAction: UserAction = {
        id: `action-${Date.now()}-${Math.random()}`,
        userId,
        timestamp: new Date(),
        moodContext: state.primaryMood ? {
          primaryMood: state.primaryMood,
          secondaryMood: state.secondaryMood
        } : undefined,
        ...action
      }

      // Send to backend API for persistence and learning
      await sendUserActionToAPI(userAction)

      // Update local state if this affects current mood selection
      if (action.type === 'launch' && state.moodHistory.length > 0) {
        const lastMoodEvent = state.moodHistory[state.moodHistory.length - 1]
        if (lastMoodEvent) {
          lastMoodEvent.outcomes.gamesLaunched++
          if (action.metadata?.sessionDuration) {
            lastMoodEvent.outcomes.averageSessionDuration = action.metadata.sessionDuration
          }
          if (action.metadata?.rating) {
            lastMoodEvent.outcomes.userRating = action.metadata.rating
          }
        }
      }

    } catch (error) {
      console.error('Failed to track user action:', error)
    }
  }, [userId, state.primaryMood, state.secondaryMood, state.moodHistory])

  // Get recommendations with learned weights from API
  const getPersonalizedRecommendations = useCallback(async (
    mood: EnhancedMoodId,
    secondaryMood?: EnhancedMoodId
  ): Promise<Game[]> => {
    try {
      const recommendations = await generatePersonalizedRecommendationsFromAPI(mood, secondaryMood)
      return recommendations

    } catch (error) {
      console.error('Failed to get personalized recommendations:', error)
      return []
    }
  }, [])

  // Load mood history and suggestions from API on mount
  useEffect(() => {
    const loadMoodData = async () => {
      try {
        const [history, suggestions, metrics] = await Promise.all([
          fetchMoodHistoryFromAPI(userId),
          getMoodSuggestions(),
          fetchLearningMetricsFromAPI(userId)
        ])

        setState(prev => ({
          ...prev,
          moodHistory: history,
          suggestions,
          learningMetrics: metrics
        }))

      } catch (error) {
        console.error('Failed to load mood data:', error)
      }
    }

    loadMoodData()
  }, [userId])

  return {
    // State
    primaryMood: state.primaryMood,
    secondaryMood: state.secondaryMood,
    intensity: state.intensity,
    recommendations: state.recommendations,
    isLoading: state.isLoading,
    error: state.error,
    moodHistory: state.moodHistory,
    suggestions: state.suggestions,
    dynamicWeights: state.dynamicWeights,
    learningMetrics: state.learningMetrics,

    // Actions
    selectMoodWithLearning,
    getMoodSuggestions,
    trackUserAction,
    getPersonalizedRecommendations,

    // Utilities
    clearMood: () => setState(prev => ({ 
      ...prev, 
      primaryMood: undefined, 
      secondaryMood: undefined,
      recommendations: []
    })),
    setIntensity: (intensity: number) => setState(prev => ({ ...prev, intensity }))
  }
}

// API functions for backend integration

async function sendMoodSelectionToAPI(moodEvent: MoodSelectionEvent): Promise<void> {
  const response = await fetch('/api/mood/selection', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(moodEvent)
  })

  if (!response.ok) {
    throw new Error('Failed to save mood selection')
  }

  return response.json()
}

async function sendUserActionToAPI(userAction: UserAction): Promise<void> {
  const response = await fetch('/api/mood/action', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(userAction)
  })

  if (!response.ok) {
    throw new Error('Failed to save user action')
  }

  return response.json()
}

async function fetchMoodHistoryFromAPI(userId: string): Promise<MoodSelectionEvent[]> {
  const response = await fetch(`/api/mood/selections?limit=100`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch mood history')
  }

  const result = await response.json()
  return result.data || []
}

async function fetchMoodSuggestionsFromAPI(
  userId: string,
  context: MoodSuggestionContext
): Promise<MoodSuggestion[]> {
  try {
    const params = new URLSearchParams({
      timeOfDay: context.currentTime.getHours() < 12 ? 'morning' : 
               context.currentTime.getHours() < 18 ? 'afternoon' : 
               context.currentTime.getHours() < 22 ? 'evening' : 'night',
      socialContext: context.socialContext || 'solo'
    })

    if (context.availableTime) {
      params.append('availableTime', context.availableTime.toString())
    }

    const response = await fetch(`/api/mood/suggestions?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch mood suggestions: ${response.statusText}`)
    }

    const result = await response.json()
    return result.data || []
  } catch (error) {
    console.error('Error fetching mood suggestions:', error)
    // Return fallback suggestions if API fails
    return [
      {
        moodId: 'energetic',
        confidence: 0.6,
        reasoning: 'Default suggestion based on common patterns',
        contextualFactors: ['fallback'],
        successProbability: 0.5
      }
    ]
  }
}

async function fetchLearningMetricsFromAPI(userId: string): Promise<{
  predictionAccuracy: number
  userSatisfactionScore: number
  adaptationRate: number
}> {
  const response = await fetch(`/api/mood/analytics?days=30`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch learning metrics')
  }

  const result = await response.json()
  const analytics = result.data

  return {
    predictionAccuracy: analytics.predictionAccuracy || 0.5,
    userSatisfactionScore: analytics.recommendationSuccess || 0.7,
    adaptationRate: 0.15 // Placeholder
  }
}

async function generatePersonalizedRecommendationsFromAPI(
  primaryMood: EnhancedMoodId,
  secondaryMood?: EnhancedMoodId
): Promise<Game[]> {
  try {
    const response = await fetch('/api/mood/recommendations/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        primaryMood,
        secondaryMood,
        limit: 10
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to generate recommendations: ${response.statusText}`)
    }

    const result = await response.json()
    return result.data || []
  } catch (error) {
    console.error('Error generating personalized recommendations:', error)
    // Return empty array if API fails
    return []
  }
}

function getTimeOfDay(date: Date): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = date.getHours()
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 22) return 'evening'
  return 'night'
}
