"use strict";
// GamePilot Enhanced Persona Engine - Main Exports
// Safe, additive improvements to the existing Persona Engine
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMoodIntensityCategory = exports.isMoodRecent = exports.createMoodState = exports.mapMoodToPersonaContext = exports.getSnapshotSummary = exports.isHighConfidenceSnapshot = exports.createMinimalPersonaSnapshot = exports.buildPersonaSnapshot = exports.demigrateMoodHistory = exports.migrateMoodHistory = exports.validateMoodEvent = exports.userMoodEntryToMoodEvent = exports.moodEventToUserMoodEntry = exports.getSessionMoodDelta = exports.getCompoundMoodSuggestions = exports.getTemporalMoodPatterns = exports.recordRecommendationFeedback = exports.recordSessionEnd = exports.recordSessionStart = exports.recordMoodEvent = exports.DEFAULT_ENHANCED_CONFIG = exports.createEnhancedPersonaEngine = exports.EnhancedPersonaEngine = void 0;
// Core enhanced engine
var enhancedPersonaIntegration_1 = require("./enhancedPersonaIntegration");
Object.defineProperty(exports, "EnhancedPersonaEngine", { enumerable: true, get: function () { return enhancedPersonaIntegration_1.EnhancedPersonaEngine; } });
Object.defineProperty(exports, "createEnhancedPersonaEngine", { enumerable: true, get: function () { return enhancedPersonaIntegration_1.createEnhancedPersonaEngine; } });
Object.defineProperty(exports, "DEFAULT_ENHANCED_CONFIG", { enumerable: true, get: function () { return enhancedPersonaIntegration_1.DEFAULT_ENHANCED_CONFIG; } });
// Enhanced data models and functions
var enhancedPersonaEngine_1 = require("./enhancedPersonaEngine");
// Recording functions
Object.defineProperty(exports, "recordMoodEvent", { enumerable: true, get: function () { return enhancedPersonaEngine_1.recordMoodEvent; } });
Object.defineProperty(exports, "recordSessionStart", { enumerable: true, get: function () { return enhancedPersonaEngine_1.recordSessionStart; } });
Object.defineProperty(exports, "recordSessionEnd", { enumerable: true, get: function () { return enhancedPersonaEngine_1.recordSessionEnd; } });
Object.defineProperty(exports, "recordRecommendationFeedback", { enumerable: true, get: function () { return enhancedPersonaEngine_1.recordRecommendationFeedback; } });
// Analysis functions
Object.defineProperty(exports, "getTemporalMoodPatterns", { enumerable: true, get: function () { return enhancedPersonaEngine_1.getTemporalMoodPatterns; } });
Object.defineProperty(exports, "getCompoundMoodSuggestions", { enumerable: true, get: function () { return enhancedPersonaEngine_1.getCompoundMoodSuggestions; } });
Object.defineProperty(exports, "getSessionMoodDelta", { enumerable: true, get: function () { return enhancedPersonaEngine_1.getSessionMoodDelta; } });
// Utility functions
Object.defineProperty(exports, "moodEventToUserMoodEntry", { enumerable: true, get: function () { return enhancedPersonaEngine_1.moodEventToUserMoodEntry; } });
Object.defineProperty(exports, "userMoodEntryToMoodEvent", { enumerable: true, get: function () { return enhancedPersonaEngine_1.userMoodEntryToMoodEvent; } });
Object.defineProperty(exports, "validateMoodEvent", { enumerable: true, get: function () { return enhancedPersonaEngine_1.validateMoodEvent; } });
// Migration helpers
Object.defineProperty(exports, "migrateMoodHistory", { enumerable: true, get: function () { return enhancedPersonaEngine_1.migrateMoodHistory; } });
Object.defineProperty(exports, "demigrateMoodHistory", { enumerable: true, get: function () { return enhancedPersonaEngine_1.demigrateMoodHistory; } });
// Re-export existing persona engine for convenience
var personaSnapshot_1 = require("./personaSnapshot");
Object.defineProperty(exports, "buildPersonaSnapshot", { enumerable: true, get: function () { return personaSnapshot_1.buildPersonaSnapshot; } });
Object.defineProperty(exports, "createMinimalPersonaSnapshot", { enumerable: true, get: function () { return personaSnapshot_1.createMinimalPersonaSnapshot; } });
Object.defineProperty(exports, "isHighConfidenceSnapshot", { enumerable: true, get: function () { return personaSnapshot_1.isHighConfidenceSnapshot; } });
Object.defineProperty(exports, "getSnapshotSummary", { enumerable: true, get: function () { return personaSnapshot_1.getSnapshotSummary; } });
var personaMoodMapping_1 = require("./personaMoodMapping");
Object.defineProperty(exports, "mapMoodToPersonaContext", { enumerable: true, get: function () { return personaMoodMapping_1.mapMoodToPersonaContext; } });
Object.defineProperty(exports, "createMoodState", { enumerable: true, get: function () { return personaMoodMapping_1.createMoodState; } });
Object.defineProperty(exports, "isMoodRecent", { enumerable: true, get: function () { return personaMoodMapping_1.isMoodRecent; } });
Object.defineProperty(exports, "getMoodIntensityCategory", { enumerable: true, get: function () { return personaMoodMapping_1.getMoodIntensityCategory; } });
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
