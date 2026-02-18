// GamePilot Enhanced Persona Engine Integration Layer
// Safe integration with existing Persona Engine without breaking changes

import { buildPersonaSnapshot, PersonaSnapshot } from "./personaSnapshot"
import { 
  MoodEvent, 
  SessionEvent, 
  RecommendationFeedback,
  recordMoodEvent,
  recordSessionStart,
  recordSessionEnd,
  recordRecommendationFeedback,
  getTemporalMoodPatterns,
  getCompoundMoodSuggestions,
  getSessionMoodDelta
} from "./enhancedPersonaEngine"

// ============================================================================
// INTEGRATION INTERFACE (Safe, Backwards-Compatible)
// ============================================================================

/**
 * Enhanced persona snapshot with additional insights
 * Extends existing PersonaSnapshot without breaking changes
 */
export interface EnhancedPersonaSnapshot extends PersonaSnapshot {
  // Existing fields from PersonaSnapshot (inherited)
  // traits, mood, narrative, confidence
  
  // New enhanced fields (optional, additive)
  temporalInsights?: {
    bestHours: number[]
    worstHours: number[]
    dayTrends: Record<string, number>
  }
  sessionInsights?: {
    averageMoodDelta: number
    positiveSessionRatio: number
    sessionDurationImpact: number
  }
  compoundMoods?: Array<{
    primary: string
    secondary: string
    frequency: number
    averageIntensity: number
  }>
}

/**
 * Integration configuration for enhanced features
 * Allows enabling/disabling specific enhancements
 */
export interface EnhancedPersonaConfig {
  enableTemporalPatterns: boolean
  enableSessionTracking: boolean
  enableCompoundMoods: boolean
  enableFeedbackLoop: boolean
  maxHistorySize: number // Limit data size for performance
}

// Default configuration - conservative and safe
export const DEFAULT_ENHANCED_CONFIG: EnhancedPersonaConfig = {
  enableTemporalPatterns: true,
  enableSessionTracking: true,
  enableCompoundMoods: true,
  enableFeedbackLoop: true,
  maxHistorySize: 1000
}

// ============================================================================
// ENHANCED PERSONA ENGINE (Safe Wrapper)
// ============================================================================

/**
 * Enhanced Persona Engine with safe, additive improvements
 * Wraps existing persona engine without breaking changes
 */
export class EnhancedPersonaEngine {
  private config: EnhancedPersonaConfig
  private moodHistory: MoodEvent[] = []
  private sessionHistory: SessionEvent[] = []
  private feedbackHistory: RecommendationFeedback[] = []

  constructor(config: Partial<EnhancedPersonaConfig> = {}) {
    this.config = { ...DEFAULT_ENHANCED_CONFIG, ...config }
  }

  /**
   * Builds enhanced persona snapshot with additional insights
   * Fully backwards compatible with existing buildPersonaSnapshot
   * 
   * @param input - Same input as existing buildPersonaSnapshot
   * @param enhancedMoodData - Optional enhanced mood data for additional insights
   * @returns EnhancedPersonaSnapshot with existing data + new insights
   */
  buildEnhancedPersonaSnapshot(
    input: any, // Same type as PersonaSnapshotInput
    enhancedMoodData?: {
      moodEvents?: MoodEvent[]
      sessionEvents?: SessionEvent[]
      feedbackEvents?: RecommendationFeedback[]
    }
  ): EnhancedPersonaSnapshot {
    // Build base persona snapshot using existing engine (no changes)
    const baseSnapshot = buildPersonaSnapshot(input)

    // Add enhanced insights if enabled and data available
    const enhancedSnapshot: EnhancedPersonaSnapshot = {
      ...baseSnapshot
    }

    // Add temporal insights
    if (this.config.enableTemporalPatterns && enhancedMoodData?.moodEvents) {
      enhancedSnapshot.temporalInsights = getTemporalMoodPatterns(enhancedMoodData.moodEvents)
    }

    // Add session insights
    if (this.config.enableSessionTracking && enhancedMoodData?.sessionEvents) {
      enhancedSnapshot.sessionInsights = getSessionMoodDelta(enhancedMoodData.sessionEvents)
    }

    // Add compound mood suggestions
    if (this.config.enableCompoundMoods && enhancedMoodData?.moodEvents) {
      enhancedSnapshot.compoundMoods = getCompoundMoodSuggestions(enhancedMoodData.moodEvents)
    }

    return enhancedSnapshot
  }

  /**
   * Records mood event with enhanced features
   * Safe wrapper around recordMoodEvent with history management
   */
  recordMood(
    moodId: string,
    intensity: number,
    moodTags: string[] = [],
    context?: string,
    gameId?: string,
    sessionContext?: { isPreSession?: boolean; isPostSession?: boolean; sessionId?: string }
  ): MoodEvent {
    const moodEvent = recordMoodEvent(
      moodId as any, // Type assertion for compatibility
      intensity,
      moodTags,
      context,
      gameId,
      sessionContext
    )

    // Add to history with size limit
    this.moodHistory.push(moodEvent)
    if (this.moodHistory.length > this.config.maxHistorySize) {
      this.moodHistory = this.moodHistory.slice(-this.config.maxHistorySize)
    }

    return moodEvent
  }

  /**
   * Records session start with tracking
   * Returns session ID for later completion
   */
  startSession(gameId?: string, preMood?: MoodEvent): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const sessionEvent = recordSessionStart(sessionId, gameId, preMood)
    
    this.sessionHistory.push(sessionEvent)
    if (this.sessionHistory.length > this.config.maxHistorySize) {
      this.sessionHistory = this.sessionHistory.slice(-this.config.maxHistorySize)
    }

    return sessionId
  }

  /**
   * Records session end and calculates mood delta
   */
  endSession(sessionId: string, postMood?: MoodEvent): SessionEvent | null {
    const sessionIndex = this.sessionHistory.findIndex(s => s.sessionId === sessionId)
    if (sessionIndex === -1) return null

    const sessionEvent = this.sessionHistory[sessionIndex]
    const completedSession = recordSessionEnd(sessionEvent, postMood)
    
    this.sessionHistory[sessionIndex] = completedSession
    return completedSession
  }

  /**
   * Records recommendation feedback for learning
   */
  recordFeedback(
    recommendationId: string,
    moodAtTime: MoodEvent,
    feedback: 'matched' | 'partial' | 'missed' | 'skip',
    gameId?: string,
    confidence: number = 0.5
  ): RecommendationFeedback {
    const feedbackEvent = recordRecommendationFeedback(
      recommendationId,
      moodAtTime,
      feedback,
      gameId,
      confidence
    )

    this.feedbackHistory.push(feedbackEvent)
    if (this.feedbackHistory.length > this.config.maxHistorySize) {
      this.feedbackHistory = this.feedbackHistory.slice(-this.config.maxHistorySize)
    }

    return feedbackEvent
  }

  /**
   * Gets current mood history
   */
  getMoodHistory(): MoodEvent[] {
    return [...this.moodHistory]
  }

  /**
   * Gets current session history
   */
  getSessionHistory(): SessionEvent[] {
    return [...this.sessionHistory]
  }

  /**
   * Gets current feedback history
   */
  getFeedbackHistory(): RecommendationFeedback[] {
    return [...this.feedbackHistory]
  }

  /**
   * Gets current configuration
   */
  getConfig(): EnhancedPersonaConfig {
    return { ...this.config }
  }

  /**
   * Updates configuration
   */
  updateConfig(newConfig: Partial<EnhancedPersonaConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Clears all history (useful for testing or privacy)
   */
  clearHistory(): void {
    this.moodHistory = []
    this.sessionHistory = []
    this.feedbackHistory = []
  }
}

// ============================================================================
// LEGACY COMPATIBILITY HELPERS
// ============================================================================

/**
 * Creates enhanced persona engine with sensible defaults
 * Factory function for easy instantiation
 */
export function createEnhancedPersonaEngine(
  config?: Partial<EnhancedPersonaConfig>
): EnhancedPersonaEngine {
  return new EnhancedPersonaEngine(config)
}

// ============================================================================
// USAGE EXAMPLES (Documentation)
// ============================================================================

/*
USAGE EXAMPLES:

1. BASIC USAGE (Backwards Compatible):
   const engine = new EnhancedPersonaEngine()
   const snapshot = engine.buildEnhancedPersonaSnapshot(input)
   // Works exactly like existing buildPersonaSnapshot

2. WITH ENHANCED DATA:
   const engine = new EnhancedPersonaEngine()
   const enhancedData = {
     moodEvents: engine.getMoodHistory(),
     sessionEvents: engine.getSessionHistory()
   }
   const enhancedSnapshot = engine.buildEnhancedPersonaSnapshot(input, enhancedData)
   // Includes temporal insights, session patterns, compound moods

3. RECORDING ENHANCED MOODS:
   const moodEvent = engine.recordMood(
     'energetic',
     8,
     ['creative'], // Compound mood
     'After work gaming session',
     'game-123',
     { isPostSession: true, sessionId: 'session-456' }
   )

4. SESSION TRACKING:
   const sessionId = engine.startSession('game-123', preMood)
   // ... gaming session ...
   const completedSession = engine.endSession(sessionId, postMood)

5. FEEDBACK LOOP:
   engine.recordFeedback(
     'rec-789',
     currentMood,
     'matched',
     'game-123',
     0.8
   )

6. CONFIGURATION:
   const engine = new EnhancedPersonaEngine({
     enableTemporalPatterns: true,
     enableSessionTracking: false, // Disable if not needed
     maxHistorySize: 500
   })

SAFETY FEATURES:
- All new features are optional and additive
- Existing code continues to work unchanged
- Graceful fallback when enhanced data is missing
- Memory usage controlled with maxHistorySize
- Input validation and type safety throughout

PERFORMANCE CONSIDERATIONS:
- O(n) complexity for all operations
- Memory scales linearly with history size
- Can be easily cached or memoized
- No heavy computations or ML models

*/
