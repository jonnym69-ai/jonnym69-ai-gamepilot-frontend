// GamePilot Enhanced Persona Engine - React Hooks
// Safe React integration for enhanced persona features

import { useState, useEffect, useCallback } from 'react'
import { 
  personaEngine, 
  buildPersonaSnapshotSafe, 
  recordMoodEventSafe, 
  startSessionSafe, 
  endSessionSafe, 
  recordFeedbackSafe,
  getPersonaEngineStatus,
  isEnhancedPersonaSnapshot,
  getEnhancedInsights,
  ENABLE_ENHANCED_PERSONA
} from './safePersonaIntegration'

// ============================================================================
// TYPES FOR HOOKS
// ============================================================================

export interface UsePersonaEngineReturn {
  // Core functionality
  buildSnapshot: (input: any) => any
  recordMood: (moodId: string, intensity: number, moodTags?: string[], context?: string, gameId?: string) => void
  
  // Enhanced features (only available if enabled)
  startSession: (gameId?: string, preMood?: any) => string | null
  endSession: (sessionId: string, postMood?: any) => any
  recordFeedback: (recommendationId: string, moodAtTime: any, feedback: 'matched' | 'partial' | 'missed' | 'skip', gameId?: string, confidence?: number) => void
  
  // Status and data
  isEnhanced: boolean
  engineStatus: any
  moodHistory: any[]
  sessionHistory: any[]
  feedbackHistory: any[]
}

export interface UsePersonaSnapshotReturn {
  snapshot: any
  isLoading: boolean
  error: string | null
  isEnhanced: boolean
  enhancedInsights: {
    temporalInsights?: any
    sessionInsights?: any
    compoundMoods?: any
  } | null
  refresh: () => void
}

export interface UseSessionTrackingReturn {
  activeSessionId: string | null
  isTracking: boolean
  startSession: (gameId?: string, preMood?: any) => string | null
  endSession: (postMood?: any) => any
  getSessionHistory: () => any[]
}

// ============================================================================
// MAIN PERSONA ENGINE HOOK
// ============================================================================

/**
 * Main hook for accessing persona engine functionality
 * Provides safe access to both legacy and enhanced features
 */
export function usePersonaEngine(): UsePersonaEngineReturn {
  const [engineStatus, setEngineStatus] = useState(getPersonaEngineStatus())
  const [moodHistory, setMoodHistory] = useState<any[]>([])
  const [sessionHistory, setSessionHistory] = useState<any[]>([])
  const [feedbackHistory, setFeedbackHistory] = useState<any[]>([])

  // Update status on mount and when feature flag changes
  useEffect(() => {
    setEngineStatus(getPersonaEngineStatus())
  }, [])

  // Refresh data periodically
  const refreshData = useCallback(() => {
    setMoodHistory(personaEngine.getMoodHistory() || [])
    setSessionHistory(personaEngine.getSessionHistory() || [])
    setFeedbackHistory(personaEngine.getFeedbackHistory() || [])
  }, [])

  // Auto-refresh data every 30 seconds if enhanced engine is active
  useEffect(() => {
    if (!ENABLE_ENHANCED_PERSONA) return

    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [refreshData])

  // Initial data load
  useEffect(() => {
    refreshData()
  }, [refreshData])

  // Safe wrapper functions
  const buildSnapshot = useCallback((input: any) => {
    return buildPersonaSnapshotSafe(input)
  }, [])

  const recordMood = useCallback((
    moodId: string, 
    intensity: number, 
    moodTags?: string[], 
    context?: string, 
    gameId?: string
  ) => {
    recordMoodEventSafe(moodId, intensity, moodTags, context, gameId)
    refreshData() // Update local state
  }, [refreshData])

  const startSession = useCallback((gameId?: string, preMood?: any) => {
    const sessionId = startSessionSafe(gameId, preMood)
    refreshData() // Update local state
    return sessionId
  }, [refreshData])

  const endSession = useCallback((sessionId: string, postMood?: any) => {
    const session = endSessionSafe(sessionId, postMood)
    refreshData() // Update local state
    return session
  }, [refreshData])

  const recordFeedback = useCallback((
    recommendationId: string, 
    moodAtTime: any, 
    feedback: 'matched' | 'partial' | 'missed' | 'skip', 
    gameId?: string, 
    confidence?: number
  ) => {
    recordFeedbackSafe(recommendationId, moodAtTime, feedback, gameId, confidence)
    refreshData() // Update local state
  }, [refreshData])

  return {
    buildSnapshot,
    recordMood,
    startSession,
    endSession,
    recordFeedback,
    isEnhanced: engineStatus.enhanced,
    engineStatus,
    moodHistory,
    sessionHistory,
    feedbackHistory
  }
}

// ============================================================================
// PERSONA SNAPSHOT HOOK
// ============================================================================

/**
 * Hook for building and managing persona snapshots
 * Provides loading states and error handling
 */
export function usePersonaSnapshot(input: any, options?: {
  autoRefresh?: boolean
  refreshInterval?: number
}): UsePersonaSnapshotReturn {
  const [snapshot, setSnapshot] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const buildSnapshotData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = buildPersonaSnapshotSafe(input)
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
    if (!options?.autoRefresh || !ENABLE_ENHANCED_PERSONA) return

    const interval = setInterval(buildSnapshotData, options.refreshInterval || 60000)
    return () => clearInterval(interval)
  }, [options?.autoRefresh, options?.refreshInterval, buildSnapshotData])

  // Extract enhanced insights
  const enhancedInsights = getEnhancedInsights(snapshot)
  const isEnhanced = isEnhancedPersonaSnapshot(snapshot)

  return {
    snapshot,
    isLoading,
    error,
    isEnhanced,
    enhancedInsights,
    refresh: buildSnapshotData
  }
}

// ============================================================================
// SESSION TRACKING HOOK
// ============================================================================

/**
 * Hook for managing gaming sessions
 * Provides session lifecycle management
 */
export function useSessionTracking(): UseSessionTrackingReturn {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const { recordMood, sessionHistory } = usePersonaEngine()

  const startSession = useCallback((gameId?: string, preMood?: any) => {
    if (!ENABLE_ENHANCED_PERSONA) {
      console.warn('Enhanced persona engine disabled, session tracking not available')
      return null
    }

    const sessionId = startSessionSafe(gameId, preMood)
    if (sessionId) {
      setActiveSessionId(sessionId)
      setIsTracking(true)
      
      // Record pre-session mood if provided
      if (preMood) {
        recordMood(preMood.moodId, preMood.intensity, preMood.moodTags, 'Pre-session mood', gameId)
      }
    }
    
    return sessionId
  }, [recordMood])

  const endSession = useCallback((postMood?: any) => {
    if (!activeSessionId || !ENABLE_ENHANCED_PERSONA) {
      return null
    }

    const session = endSessionSafe(activeSessionId, postMood)
    
    // Record post-session mood if provided
    if (postMood) {
      recordMood(postMood.moodId, postMood.intensity, postMood.moodTags, 'Post-session mood')
    }
    
    setActiveSessionId(null)
    setIsTracking(false)
    
    return session
  }, [activeSessionId, recordMood])

  const getSessionHistory = useCallback(() => {
    return sessionHistory || []
  }, [sessionHistory])

  return {
    activeSessionId,
    isTracking,
    startSession,
    endSession,
    getSessionHistory
  }
}

// ============================================================================
// FEATURE DETECTION HOOK
// ============================================================================

/**
 * Hook for detecting enhanced persona engine availability
 * Useful for conditional UI rendering
 */
export function useEnhancedPersonaDetection() {
  const [isEnhanced, setIsEnhanced] = useState(ENABLE_ENHANCED_PERSONA)
  const [engineStatus, setEngineStatus] = useState<any>(null)

  useEffect(() => {
    setIsEnhanced(ENABLE_ENHANCED_PERSONA)
    setEngineStatus(getPersonaEngineStatus())
  }, [])

  return {
    isEnhanced,
    engineStatus,
    features: engineStatus?.features || {
      temporalPatterns: false,
      sessionTracking: false,
      compoundMoods: false,
      feedbackLoop: false
    }
  }
}

// ============================================================================
// CONVENIENCE COMBINED HOOK
// ============================================================================

/**
 * Combined hook for most common persona engine use cases
 * Provides snapshot, session tracking, and feature detection
 */
export function usePersonaEngineFull(input?: any, options?: {
  autoRefreshSnapshot?: boolean
  snapshotRefreshInterval?: number
}) {
  const personaEngine = usePersonaEngine()
  const snapshot = usePersonaSnapshot(input, {
    autoRefresh: options?.autoRefreshSnapshot,
    refreshInterval: options?.snapshotRefreshInterval
  })
  const sessionTracking = useSessionTracking()
  const featureDetection = useEnhancedPersonaDetection()

  return {
    // Core persona engine
    ...personaEngine,
    
    // Snapshot data
    snapshot: snapshot.snapshot,
    isSnapshotLoading: snapshot.isLoading,
    snapshotError: snapshot.error,
    enhancedInsights: snapshot.enhancedInsights,
    refreshSnapshot: snapshot.refresh,
    
    // Session tracking
    ...sessionTracking,
    
    // Feature detection
    ...featureDetection
  }
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
USAGE EXAMPLES:

1. BASIC PERSONA ENGINE USAGE:
   const { buildSnapshot, recordMood, isEnhanced } = usePersonaEngine()
   
   // Build snapshot (works with both engines)
   const snapshot = buildSnapshot(inputData)
   
   // Record mood (only works if enhanced engine enabled)
   recordMood('energetic', 8, ['creative'], 'After work')

2. SNAPSHOT WITH AUTO-REFRESH:
   const { snapshot, isLoading, enhancedInsights, refresh } = usePersonaSnapshot(input, {
     autoRefresh: true,
     refreshInterval: 30000
   })

3. SESSION TRACKING:
   const { startSession, endSession, isTracking, activeSessionId } = useSessionTracking()
   
   // Start session
   const sessionId = startSession('game-123', preMood)
   
   // End session
   endSession(postMood)

4. FEATURE DETECTION:
   const { isEnhanced, features } = useEnhancedPersonaDetection()
   
   if (isEnhanced && features.temporalPatterns) {
     // Show enhanced features
   }

5. FULL COMBINED USAGE:
   const { 
     buildSnapshot, 
     snapshot, 
     enhancedInsights,
     startSession, 
     endSession,
     isEnhanced,
     features 
   } = usePersonaEngineFull(input, {
     autoRefreshSnapshot: true,
     snapshotRefreshInterval: 60000
   })

SAFETY FEATURES:
✅ All hooks gracefully fallback when enhanced engine disabled
✅ No errors thrown when enhanced features unavailable
✅ Automatic data refresh with configurable intervals
✅ Loading states and error handling throughout
✅ Memory efficient with proper cleanup

PERFORMANCE:
✅ Memoized callbacks prevent unnecessary re-renders
✅ Configurable refresh intervals
✅ Efficient data updates with local state
✅ Proper cleanup of intervals and subscriptions

*/
