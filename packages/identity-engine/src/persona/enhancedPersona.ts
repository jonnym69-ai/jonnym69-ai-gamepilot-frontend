// GamePilot Enhanced Persona Engine - Main Exports
// Safe, additive improvements to the existing Persona Engine

// Core enhanced engine
export {
  EnhancedPersonaEngine,
  createEnhancedPersonaEngine,
  type EnhancedPersonaSnapshot,
  type EnhancedPersonaConfig,
  DEFAULT_ENHANCED_CONFIG
} from './enhancedPersonaIntegration'

// Enhanced data models and functions
export {
  // Data models
  type MoodEvent,
  type SessionEvent,
  type RecommendationFeedback,
  type MoodPatternInsights,
  
  // Recording functions
  recordMoodEvent,
  recordSessionStart,
  recordSessionEnd,
  recordRecommendationFeedback,
  
  // Analysis functions
  getTemporalMoodPatterns,
  getCompoundMoodSuggestions,
  getSessionMoodDelta,
  
  // Utility functions
  moodEventToUserMoodEntry,
  userMoodEntryToMoodEvent,
  validateMoodEvent,
  
  // Migration helpers
  migrateMoodHistory,
  demigrateMoodHistory
} from './enhancedPersonaEngine'

// Re-export existing persona engine for convenience
export {
  buildPersonaSnapshot,
  createMinimalPersonaSnapshot,
  isHighConfidenceSnapshot,
  getSnapshotSummary,
  type PersonaSnapshot,
  type PersonaSnapshotInput
} from './personaSnapshot'

export {
  mapMoodToPersonaContext,
  createMoodState,
  isMoodRecent,
  getMoodIntensityCategory,
  type MoodState,
  type PersonaMoodContext
} from './personaMoodMapping'

// ============================================================================
// QUICK START GUIDE
// ============================================================================

/*
QUICK START:

1. BASIC USAGE (Drop-in replacement):
   import { createEnhancedPersonaEngine } from '@gamepilot/identity-engine'
   
   const engine = createEnhancedPersonaEngine()
   const snapshot = engine.buildEnhancedPersonaSnapshot(input)
   // Works exactly like existing persona engine + new insights

2. ENHANCED MOOD TRACKING:
   const moodEvent = engine.recordMood(
     'energetic',
     8,
     ['creative'], // Compound mood support
     'After work session',
     'game-123'
   )

3. SESSION ANALYSIS:
   const sessionId = engine.startSession('game-123', preMood)
   // ... gaming ...
   const session = engine.endSession(sessionId, postMood)

4. FEEDBACK LOOP:
   engine.recordFeedback('rec-123', currentMood, 'matched', 'game-123', 0.8)

5. TEMPORAL INSIGHTS:
   const patterns = getTemporalMoodPatterns(engine.getMoodHistory())
   console.log('Best gaming hours:', patterns.bestHours)

SAFETY GUARANTEES:
✅ No breaking changes to existing code
✅ All new features are optional and additive
✅ Graceful fallback when enhanced data is missing
✅ Memory usage controlled with configurable limits
✅ Input validation and type safety throughout
✅ Backwards compatibility with existing UserMoodEntry data

PERFORMANCE:
✅ O(n) complexity for all operations
✅ Linear memory scaling with configurable limits
✅ No heavy ML or complex computations
✅ Can be easily cached or memoized if needed

INTEGRATION:
✅ Works with existing persona pipeline unchanged
✅ Enhanced data can be migrated from legacy formats
✅ Existing UI components continue to work
✅ New insights are optional and additive

*/
