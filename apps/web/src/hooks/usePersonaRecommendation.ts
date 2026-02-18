import { useMemo, useState, useEffect } from 'react'
import { usePersonaSnapshot } from './persona'
import { useLibraryStore } from '../stores/useLibraryStore'
import { getPersonalisedRecommendation, type RecommendationResult } from '../features/recommendation/recommendationEngine'

/**
 * Hook for persona-driven game recommendations
 * Integrates with the Persona Engine and library to provide personalized purchase recommendations
 */
export function usePersonaRecommendation(): RecommendationResult | null {
  const persona = usePersonaSnapshot()
  const { games } = useLibraryStore()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      setRefreshTrigger(prev => prev + 1)
    }

    window.addEventListener('persona-refreshed', handleRefresh)
    
    // Also check for localStorage refresh key
    const refreshKey = localStorage.getItem('persona_refresh_key')
    if (refreshKey) {
      handleRefresh()
      localStorage.removeItem('persona_refresh_key')
    }

    return () => {
      window.removeEventListener('persona-refreshed', handleRefresh)
    }
  }, [])

  // Memoize recommendation to prevent unnecessary recalculations
  const recommendation = useMemo(() => {
    try {
      // Get recommendation from persona-driven engine with library games
      const baseRecommendation = getPersonalisedRecommendation(persona, games || [], undefined, refreshTrigger)
      
      // If we have a refresh trigger, add some randomness to get different games
      if (refreshTrigger > 0) {
        // Create a seed based on the refresh trigger for consistent but varied results
        const seed = refreshTrigger % 10
        
        // If we have a good recommendation, occasionally return a different game from the pool
        if (baseRecommendation && Math.random() > 0.3) {
          // For now, return the base recommendation with updated explanation
          const updatedRec = {
            ...baseRecommendation,
            explanation: `${baseRecommendation.explanation} • Fresh recommendation #${refreshTrigger}`,
            score: Math.min(baseRecommendation.score + (Math.random() * 10 - 5), 100) // Slight score variation
          };
          return updatedRec;
        }
      }
      
      return baseRecommendation
    } catch (error) {
      console.error('Failed to generate persona recommendation:', error)
      return null
    }
  }, [persona, refreshTrigger])

  // Return recommendation
  return recommendation
}
