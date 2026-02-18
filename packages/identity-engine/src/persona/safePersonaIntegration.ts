// GamePilot Enhanced Persona Engine - Safe Integration Layer
// Plugs enhanced persona engine into existing system without breaking changes

import { buildPersonaSnapshot, PersonaSnapshot } from "./personaSnapshot"
import { createEnhancedPersonaEngine, EnhancedPersonaEngine, type EnhancedPersonaSnapshot } from "./enhancedPersona"

// ============================================================================
// FEATURE FLAG (Safe Toggle)
// ============================================================================

/**
 * Feature flag for enhanced persona engine
 * Set to false for safety, true to enable enhanced features
 * Can be controlled via environment variables or runtime config
 */
export const ENABLE_ENHANCED_PERSONA = typeof process !== 'undefined' && process.env?.ENABLE_ENHANCED_PERSONA === 'true' || false

// ============================================================================
// SAFE INTEGRATION WRAPPER
// ============================================================================

/**
 * Unified persona engine interface
 * Provides consistent API regardless of which engine is active
 */
export interface UnifiedPersonaEngine {
  buildSnapshot(input: any): PersonaSnapshot | EnhancedPersonaSnapshot
  recordMood?(moodId: string, intensity: number, moodTags?: string[], context?: string, gameId?: string): void
  startSession?(gameId?: string, preMood?: any): string | null
  endSession?(sessionId: string, postMood?: any): any
  recordFeedback?(recommendationId: string, moodAtTime: any, feedback: string, gameId?: string, confidence?: number): void
  getMoodHistory?(): any[]
  getSessionHistory?(): any[]
  getFeedbackHistory?(): any[]
}

/**
 * Safe persona engine wrapper
 * Chooses between existing and enhanced engines based on feature flag
 * Ensures 100% backwards compatibility
 */
class SafePersonaEngineWrapper implements UnifiedPersonaEngine {
  private enhancedEngine: EnhancedPersonaEngine | null = null
  private isEnabled: boolean

  constructor() {
    this.isEnabled = ENABLE_ENHANCED_PERSONA
    
    // Only initialize enhanced engine if flag is enabled
    if (this.isEnabled) {
      try {
        this.enhancedEngine = createEnhancedPersonaEngine({
          enableTemporalPatterns: true,
          enableSessionTracking: true,
          enableCompoundMoods: true,
          enableFeedbackLoop: true,
          maxHistorySize: 1000
        })
        console.log('🚀 Enhanced Persona Engine enabled')
      } catch (error) {
        console.warn('⚠️ Failed to initialize Enhanced Persona Engine, falling back to legacy:', error)
        this.isEnabled = false
        this.enhancedEngine = null
      }
    } else {
      // Legacy mode - no enhanced features available
    }
  }

  /**
   * Builds persona snapshot using appropriate engine
   * Enhanced engine provides additional insights when enabled
   * Legacy engine provides standard snapshot when disabled
   */
  buildSnapshot(input: any): PersonaSnapshot | EnhancedPersonaSnapshot {
    try {
      if (this.isEnabled && this.enhancedEngine) {
        // Use enhanced engine with additional data
        const enhancedData = {
          moodEvents: this.enhancedEngine.getMoodHistory(),
          sessionEvents: this.enhancedEngine.getSessionHistory(),
          feedbackEvents: this.enhancedEngine.getFeedbackHistory()
        }
        
        return this.enhancedEngine.buildEnhancedPersonaSnapshot(input, enhancedData)
      } else {
        // Use legacy engine (existing behavior)
        return buildPersonaSnapshot(input)
      }
    } catch (error) {
      console.warn('⚠️ Enhanced snapshot build failed, falling back to legacy:', error)
      // Always fall back to legacy engine on error
      return buildPersonaSnapshot(input)
    }
  }

  /**
   * Records mood event with enhanced features if enabled
   * No-op if enhanced engine is disabled
   */
  recordMood(
    moodId: string, 
    intensity: number, 
    moodTags?: string[], 
    context?: string, 
    gameId?: string
  ): void {
    if (this.isEnabled && this.enhancedEngine) {
      try {
        this.enhancedEngine.recordMood(moodId, intensity, moodTags, context, gameId)
      } catch (error) {
        console.warn('⚠️ Failed to record enhanced mood:', error)
      }
    }
    // No-op if disabled - maintains backwards compatibility
  }

  /**
   * Starts session tracking if enhanced engine enabled
   * Returns session ID if tracking, null if disabled
   */
  startSession(gameId?: string, preMood?: any): string | null {
    if (this.isEnabled && this.enhancedEngine) {
      try {
        return this.enhancedEngine.startSession(gameId, preMood)
      } catch (error) {
        console.warn('⚠️ Failed to start session tracking:', error)
        return null
      }
    }
    return null
  }

  /**
   * Ends session tracking if enhanced engine enabled
   * Returns session data if tracking, null if disabled
   */
  endSession(sessionId: string, postMood?: any): any {
    if (this.isEnabled && this.enhancedEngine) {
      try {
        return this.enhancedEngine.endSession(sessionId, postMood)
      } catch (error) {
        console.warn('⚠️ Failed to end session tracking:', error)
        return null
      }
    }
    return null
  }

  /**
   * Records recommendation feedback if enhanced engine enabled
   * No-op if disabled
   */
  recordFeedback(
    recommendationId: string, 
    moodAtTime: any, 
    feedback: 'matched' | 'partial' | 'missed' | 'skip', 
    gameId?: string, 
    confidence?: number
  ): void {
    if (this.isEnabled && this.enhancedEngine) {
      try {
        this.enhancedEngine.recordFeedback(recommendationId, moodAtTime, feedback, gameId, confidence)
      } catch (error) {
        console.warn('⚠️ Failed to record feedback:', error)
      }
    }
    // No-op if disabled
  }

  /**
   * Gets mood history if enhanced engine enabled
   * Returns empty array if disabled
   */
  getMoodHistory(): any[] {
    if (this.isEnabled && this.enhancedEngine) {
      try {
        return this.enhancedEngine.getMoodHistory()
      } catch (error) {
        console.warn('⚠️ Failed to get mood history:', error)
        return []
      }
    }
    return []
  }

  /**
   * Gets session history if enhanced engine enabled
   * Returns empty array if disabled
   */
  getSessionHistory(): any[] {
    if (this.isEnabled && this.enhancedEngine) {
      try {
        return this.enhancedEngine.getSessionHistory()
      } catch (error) {
        console.warn('⚠️ Failed to get session history:', error)
        return []
      }
    }
    return []
  }

  /**
   * Gets feedback history if enhanced engine enabled
   * Returns empty array if disabled
   */
  getFeedbackHistory(): any[] {
    if (this.isEnabled && this.enhancedEngine) {
      try {
        return this.enhancedEngine.getFeedbackHistory()
      } catch (error) {
        console.warn('⚠️ Failed to get feedback history:', error)
        return []
      }
    }
    return []
  }

  /**
   * Gets current engine status
   * Useful for debugging and feature detection
   */
  getEngineStatus(): {
    enhanced: boolean
    engine: 'legacy' | 'enhanced'
    features: {
      temporalPatterns: boolean
      sessionTracking: boolean
      compoundMoods: boolean
      feedbackLoop: boolean
    }
  } {
    if (this.isEnabled && this.enhancedEngine) {
      const config = this.enhancedEngine.getConfig()
      return {
        enhanced: true,
        engine: 'enhanced',
        features: {
          temporalPatterns: config.enableTemporalPatterns,
          sessionTracking: config.enableSessionTracking,
          compoundMoods: config.enableCompoundMoods,
          feedbackLoop: config.enableFeedbackLoop
        }
      }
    } else {
      return {
        enhanced: false,
        engine: 'legacy',
        features: {
          temporalPatterns: false,
          sessionTracking: false,
          compoundMoods: false,
          feedbackLoop: false
        }
      }
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE (Safe Global Access)
// ============================================================================

/**
 * Global persona engine instance
 * Provides consistent access across the application
 */
export const personaEngine = new SafePersonaEngineWrapper()

// ============================================================================
// CONVENIENCE FUNCTIONS (Safe API)
// ============================================================================

/**
 * Builds persona snapshot using safe engine
 * Drop-in replacement for existing buildPersonaSnapshot calls
 */
export function buildPersonaSnapshotSafe(input: any): PersonaSnapshot | EnhancedPersonaSnapshot {
  return personaEngine.buildSnapshot(input)
}

/**
 * Records mood event safely
 * Only records if enhanced engine is enabled
 */
export function recordMoodEventSafe(
  moodId: string, 
  intensity: number, 
  moodTags?: string[], 
  context?: string, 
  gameId?: string
): void {
  personaEngine.recordMood(moodId, intensity, moodTags, context, gameId)
}

/**
 * Starts session tracking safely
 * Returns session ID if enhanced engine enabled
 */
export function startSessionSafe(gameId?: string, preMood?: any): string | null {
  return personaEngine.startSession(gameId, preMood)
}

/**
 * Ends session tracking safely
 * Returns session data if enhanced engine enabled
 */
export function endSessionSafe(sessionId: string, postMood?: any): any {
  return personaEngine.endSession(sessionId, postMood)
}

/**
 * Records recommendation feedback safely
 * Only records if enhanced engine is enabled
 */
export function recordFeedbackSafe(
  recommendationId: string, 
  moodAtTime: any, 
  feedback: 'matched' | 'partial' | 'missed' | 'skip', 
  gameId?: string, 
  confidence?: number
): void {
  personaEngine.recordFeedback(recommendationId, moodAtTime, feedback, gameId, confidence)
}

/**
 * Gets engine status for debugging
 * Useful for feature detection and troubleshooting
 */
export function getPersonaEngineStatus(): {
  enhanced: boolean
  engine: 'legacy' | 'enhanced'
  features: {
    temporalPatterns: boolean
    sessionTracking: boolean
    compoundMoods: boolean
    feedbackLoop: boolean
  }
} {
  return personaEngine.getEngineStatus()
}

// ============================================================================
// TYPE GUARDS (Safe Type Checking)
// ============================================================================

/**
 * Type guard to check if snapshot is enhanced
 * Allows safe access to enhanced features
 */
export function isEnhancedPersonaSnapshot(snapshot: any): snapshot is EnhancedPersonaSnapshot {
  return snapshot && 
         typeof snapshot === 'object' &&
         'temporalInsights' in snapshot &&
         'sessionInsights' in snapshot &&
         'compoundMoods' in snapshot
}

/**
 * Gets enhanced insights safely
 * Returns null if not enhanced or data missing
 */
export function getEnhancedInsights(snapshot: any): {
  temporalInsights?: any
  sessionInsights?: any
  compoundMoods?: any
} | null {
  if (isEnhancedPersonaSnapshot(snapshot)) {
    return {
      temporalInsights: snapshot.temporalInsights,
      sessionInsights: snapshot.sessionInsights,
      compoundMoods: snapshot.compoundMoods
    }
  }
  return null
}

// ============================================================================
// MIGRATION HELPERS (Safe Data Migration)
// ============================================================================

/**
 * Migrates legacy mood data to enhanced format
 * Only runs if enhanced engine is enabled
 */
export function migrateLegacyMoodData(legacyMoods: any[]): boolean {
  if (!ENABLE_ENHANCED_PERSONA) {
    console.log('⚠️ Enhanced engine disabled, skipping migration')
    return false
  }

  try {
    legacyMoods.forEach(mood => {
      recordMoodEventSafe(mood.moodId, mood.intensity, [], mood.context, mood.gameId)
    })
    console.log(`✅ Migrated ${legacyMoods.length} legacy mood entries`)
    return true
  } catch (error) {
    console.error('❌ Failed to migrate legacy mood data:', error)
    return false
  }
}

// ============================================================================
// INTEGRATION NOTES
// ============================================================================

/*
SAFE INTEGRATION GUIDE:

1. FEATURE FLAG CONTROL:
   - Set ENABLE_ENHANCED_PERSONA=true to enable enhanced features
   - Set ENABLE_ENHANCED_PERSONA=false (default) to use legacy engine
   - Can be controlled via environment variables

2. BACKWARDS COMPATIBILITY:
   - All existing code continues to work unchanged
   - Enhanced features are completely optional
   - Graceful fallback on any error

3. USAGE PATTERNS:
   // Replace existing calls:
   buildPersonaSnapshot(input) → buildPersonaSnapshotSafe(input)
   
   // Add enhanced features (optional):
   recordMoodEventSafe('energetic', 8, ['creative'])
   const sessionId = startSessionSafe('game-123')
   endSessionSafe(sessionId, postMood)

4. TYPE SAFETY:
   - Use isEnhancedPersonaSnapshot() to check for enhanced data
   - Use getEnhancedInsights() for safe access to enhanced fields
   - All enhanced fields are optional and undefined-safe

5. ERROR HANDLING:
   - All enhanced functions have try-catch blocks
   - Automatic fallback to legacy behavior on errors
   - Console warnings for debugging (no exceptions thrown)

6. PERFORMANCE:
   - Enhanced engine only initializes if flag is enabled
   - Memory usage controlled with configurable limits
   - No performance impact when disabled

7. TESTING:
   - Can test both engines by toggling the feature flag
   - Mock functions available for unit testing
   - Legacy behavior preserved for regression testing

8. FUTURE EXPANSION:
   - New enhanced features can be added safely
   - Feature flag provides safe deployment strategy
   - Migration helpers for data upgrades

*/
