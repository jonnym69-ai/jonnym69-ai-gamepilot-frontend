// GamePilot Persona Engine - Public API
// Clean re-exports for persona functionality (Legacy + Enhanced)

// Core persona snapshot API
export { 
  buildPersonaSnapshot,
  createMinimalPersonaSnapshot,
  isHighConfidenceSnapshot,
  getSnapshotSummary,
  type PersonaSnapshotInput,
  type PersonaSnapshot
} from './personaSnapshot'

// Trait extraction
export {
  derivePersonaTraits,
  type RawPlayerSignals
} from './traitExtractor'

// Mood integration
export {
  mapMoodToPersonaContext,
  createMoodState,
  isMoodRecent,
  getMoodIntensityCategory,
  type MoodState,
  type PersonaMoodContext
} from './personaMoodMapping'

// Narrative generation
export {
  buildPersonaNarrative,
  getNarrativeStyle,
  type NarrativeTone,
  type PersonaNarrativeInput,
  type PersonaNarrativeOutput
} from './personaNarrative'

// Enhanced persona engine (safe integration)
export {
  // Safe integration layer
  personaEngine,
  buildPersonaSnapshotSafe,
  recordMoodEventSafe,
  startSessionSafe,
  endSessionSafe,
  recordFeedbackSafe,
  getPersonaEngineStatus,
  isEnhancedPersonaSnapshot,
  getEnhancedInsights,
  migrateLegacyMoodData,
  ENABLE_ENHANCED_PERSONA,
  type UnifiedPersonaEngine
} from './safePersonaIntegration'

// Import EnhancedPersonaSnapshot type from the enhanced engine
export type { EnhancedPersonaSnapshot } from './enhancedPersona'

// React hooks for enhanced features
export {
  usePersonaEngine,
  usePersonaSnapshot,
  useSessionTracking,
  useEnhancedPersonaDetection,
  usePersonaEngineFull,
  type UsePersonaEngineReturn,
  type UsePersonaSnapshotReturn,
  type UseSessionTrackingReturn
} from './personaHooks'

// Enhanced persona engine (direct access - use with caution)
export {
  EnhancedPersonaEngine,
  createEnhancedPersonaEngine,
  type EnhancedPersonaConfig,
  DEFAULT_ENHANCED_CONFIG
} from './enhancedPersonaIntegration'

export {
  // Enhanced data models
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

// Re-export persona traits from static-data for convenience
export {
  type PersonaArchetypeId,
  type PersonaIntensity,
  type PersonaPacing,
  type PersonaRiskProfile,
  type PersonaSocialStyle,
  type PersonaTraits,
  type PersonaTraitUnion
} from '../../../static-data/src/persona/personaTraits'
