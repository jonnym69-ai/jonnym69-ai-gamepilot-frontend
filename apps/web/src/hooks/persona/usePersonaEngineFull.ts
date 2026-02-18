// GamePilot Enhanced Persona Engine - Full Hook (Simplified)
// Combined hook for most common persona engine use cases
// Provides safe access to both legacy and enhanced features

import { useState, useEffect, useCallback } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export interface UsePersonaEngineFullReturn {
  // Core persona engine
  buildSnapshot: (input: any) => any
  recordMood: (moodId: string, intensity: number, moodTags?: string[], context?: string, gameId?: string) => void
  
  // Snapshot data
  snapshot: any
  isSnapshotLoading: boolean
  snapshotError: string | null
  enhancedInsights: {
    temporalInsights?: any
    sessionInsights?: any
    compoundMoods?: any
  } | null
  refreshSnapshot: () => void
  
  // Session tracking
  activeSessionId: string | null
  isTracking: boolean
  startSession: (gameId?: string, preMood?: any) => string | null
  endSession: (postMood?: any) => any
  getSessionHistory: () => any[]
  
  // Feature detection
  isEnhanced: boolean
  engineStatus: any
  features: {
    temporalPatterns: boolean
    sessionTracking: boolean
    compoundMoods: boolean
    feedbackLoop: boolean
  }
}

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * Combined hook for most common persona engine use cases
 * Provides snapshot, session tracking, and feature detection
 * Safe integration with both legacy and enhanced engines
 */
export function usePersonaEngineFull(input?: any, options?: {
  autoRefreshSnapshot?: boolean
  snapshotRefreshInterval?: number
}): UsePersonaEngineFullReturn {
  const [snapshot, setSnapshot] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [_activeSessionId, _setActiveSessionId] = useState<string | null>(null)
  const [_isTracking, _setIsTracking] = useState(false)

  // Enhanced engine status (currently disabled)
  const isEnhanced = false
  const engineStatus = {
    enhanced: false,
    engine: 'legacy' as const,
    features: {
      temporalPatterns: false,
      sessionTracking: false,
      compoundMoods: false,
      feedbackLoop: false
    }
  }

  // Build snapshot data (using legacy engine)
  const buildSnapshotData = useCallback(async () => {
    if (!input) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      // For now, just return the input as mock snapshot
      // This would normally call buildPersonaSnapshotSafe(input)
      const result = { input, timestamp: new Date() }
      setSnapshot(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to build persona snapshot')
      console.error('Persona snapshot error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [input])

  // Initial build
  useEffect(() => {
    if (input) {
      buildSnapshotData()
    }
  }, [input, buildSnapshotData])

  // Auto-refresh if enabled
  useEffect(() => {
    if (!options?.autoRefreshSnapshot) return

    const interval = setInterval(buildSnapshotData, options?.snapshotRefreshInterval || 60000)
    return () => clearInterval(interval)
  }, [options?.autoRefreshSnapshot, options?.snapshotRefreshInterval, buildSnapshotData])

  // Safe wrapper functions (no-op for now)
  const recordMood = useCallback((
    moodId: string, 
    intensity: number, 
    moodTags?: string[], 
    context?: string, 
    gameId?: string
  ) => {
    // No-op for now - would call recordMoodEventSafe
    console.log('Record mood:', { moodId, intensity, moodTags, context, gameId })
  }, [])

  const startSession = useCallback((gameId?: string, preMood?: any) => {
    // No-op for now - would call startSessionSafe
    console.log('Start session:', { gameId, preMood })
    return null
  }, [])

  const endSession = useCallback((postMood?: any) => {
    // No-op for now - would call endSessionSafe
    console.log('End session:', { postMood })
    return null
  }, [])

  const getSessionHistory = useCallback(() => {
    // No-op for now - would return actual session history
    return []
  }, [])

  // Extract enhanced insights (null for now)
  const enhancedInsights = null

  return {
    // Core persona engine
    buildSnapshot: buildSnapshotData,
    recordMood,
    
    // Snapshot data
    snapshot,
    isSnapshotLoading: isLoading,
    snapshotError: error,
    enhancedInsights,
    refreshSnapshot: buildSnapshotData,
    
    // Session tracking
    activeSessionId: _activeSessionId,
    isTracking: _isTracking,
    startSession,
    endSession,
    getSessionHistory,
    
    // Feature detection
    isEnhanced,
    engineStatus,
    features: engineStatus.features
  }
}

export default usePersonaEngineFull
