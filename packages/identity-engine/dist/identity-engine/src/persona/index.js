"use strict";
// GamePilot Persona Engine - Public API
// Clean re-exports for persona functionality (Legacy + Enhanced)
Object.defineProperty(exports, "__esModule", { value: true });
exports.demigrateMoodHistory = exports.migrateMoodHistory = exports.validateMoodEvent = exports.userMoodEntryToMoodEvent = exports.moodEventToUserMoodEntry = exports.getSessionMoodDelta = exports.getCompoundMoodSuggestions = exports.getTemporalMoodPatterns = exports.recordRecommendationFeedback = exports.recordSessionEnd = exports.recordSessionStart = exports.recordMoodEvent = exports.DEFAULT_ENHANCED_CONFIG = exports.createEnhancedPersonaEngine = exports.EnhancedPersonaEngine = exports.usePersonaEngineFull = exports.useEnhancedPersonaDetection = exports.useSessionTracking = exports.usePersonaSnapshot = exports.usePersonaEngine = exports.ENABLE_ENHANCED_PERSONA = exports.migrateLegacyMoodData = exports.getEnhancedInsights = exports.isEnhancedPersonaSnapshot = exports.getPersonaEngineStatus = exports.recordFeedbackSafe = exports.endSessionSafe = exports.startSessionSafe = exports.recordMoodEventSafe = exports.buildPersonaSnapshotSafe = exports.personaEngine = exports.getNarrativeStyle = exports.buildPersonaNarrative = exports.getMoodIntensityCategory = exports.isMoodRecent = exports.createMoodState = exports.mapMoodToPersonaContext = exports.derivePersonaTraits = exports.getSnapshotSummary = exports.isHighConfidenceSnapshot = exports.createMinimalPersonaSnapshot = exports.buildPersonaSnapshot = void 0;
// Core persona snapshot API
var personaSnapshot_1 = require("./personaSnapshot");
Object.defineProperty(exports, "buildPersonaSnapshot", { enumerable: true, get: function () { return personaSnapshot_1.buildPersonaSnapshot; } });
Object.defineProperty(exports, "createMinimalPersonaSnapshot", { enumerable: true, get: function () { return personaSnapshot_1.createMinimalPersonaSnapshot; } });
Object.defineProperty(exports, "isHighConfidenceSnapshot", { enumerable: true, get: function () { return personaSnapshot_1.isHighConfidenceSnapshot; } });
Object.defineProperty(exports, "getSnapshotSummary", { enumerable: true, get: function () { return personaSnapshot_1.getSnapshotSummary; } });
// Trait extraction
var traitExtractor_1 = require("./traitExtractor");
Object.defineProperty(exports, "derivePersonaTraits", { enumerable: true, get: function () { return traitExtractor_1.derivePersonaTraits; } });
// Mood integration
var personaMoodMapping_1 = require("./personaMoodMapping");
Object.defineProperty(exports, "mapMoodToPersonaContext", { enumerable: true, get: function () { return personaMoodMapping_1.mapMoodToPersonaContext; } });
Object.defineProperty(exports, "createMoodState", { enumerable: true, get: function () { return personaMoodMapping_1.createMoodState; } });
Object.defineProperty(exports, "isMoodRecent", { enumerable: true, get: function () { return personaMoodMapping_1.isMoodRecent; } });
Object.defineProperty(exports, "getMoodIntensityCategory", { enumerable: true, get: function () { return personaMoodMapping_1.getMoodIntensityCategory; } });
// Narrative generation
var personaNarrative_1 = require("./personaNarrative");
Object.defineProperty(exports, "buildPersonaNarrative", { enumerable: true, get: function () { return personaNarrative_1.buildPersonaNarrative; } });
Object.defineProperty(exports, "getNarrativeStyle", { enumerable: true, get: function () { return personaNarrative_1.getNarrativeStyle; } });
// Enhanced persona engine (safe integration)
var safePersonaIntegration_1 = require("./safePersonaIntegration");
// Safe integration layer
Object.defineProperty(exports, "personaEngine", { enumerable: true, get: function () { return safePersonaIntegration_1.personaEngine; } });
Object.defineProperty(exports, "buildPersonaSnapshotSafe", { enumerable: true, get: function () { return safePersonaIntegration_1.buildPersonaSnapshotSafe; } });
Object.defineProperty(exports, "recordMoodEventSafe", { enumerable: true, get: function () { return safePersonaIntegration_1.recordMoodEventSafe; } });
Object.defineProperty(exports, "startSessionSafe", { enumerable: true, get: function () { return safePersonaIntegration_1.startSessionSafe; } });
Object.defineProperty(exports, "endSessionSafe", { enumerable: true, get: function () { return safePersonaIntegration_1.endSessionSafe; } });
Object.defineProperty(exports, "recordFeedbackSafe", { enumerable: true, get: function () { return safePersonaIntegration_1.recordFeedbackSafe; } });
Object.defineProperty(exports, "getPersonaEngineStatus", { enumerable: true, get: function () { return safePersonaIntegration_1.getPersonaEngineStatus; } });
Object.defineProperty(exports, "isEnhancedPersonaSnapshot", { enumerable: true, get: function () { return safePersonaIntegration_1.isEnhancedPersonaSnapshot; } });
Object.defineProperty(exports, "getEnhancedInsights", { enumerable: true, get: function () { return safePersonaIntegration_1.getEnhancedInsights; } });
Object.defineProperty(exports, "migrateLegacyMoodData", { enumerable: true, get: function () { return safePersonaIntegration_1.migrateLegacyMoodData; } });
Object.defineProperty(exports, "ENABLE_ENHANCED_PERSONA", { enumerable: true, get: function () { return safePersonaIntegration_1.ENABLE_ENHANCED_PERSONA; } });
// React hooks for enhanced features
var personaHooks_1 = require("./personaHooks");
Object.defineProperty(exports, "usePersonaEngine", { enumerable: true, get: function () { return personaHooks_1.usePersonaEngine; } });
Object.defineProperty(exports, "usePersonaSnapshot", { enumerable: true, get: function () { return personaHooks_1.usePersonaSnapshot; } });
Object.defineProperty(exports, "useSessionTracking", { enumerable: true, get: function () { return personaHooks_1.useSessionTracking; } });
Object.defineProperty(exports, "useEnhancedPersonaDetection", { enumerable: true, get: function () { return personaHooks_1.useEnhancedPersonaDetection; } });
Object.defineProperty(exports, "usePersonaEngineFull", { enumerable: true, get: function () { return personaHooks_1.usePersonaEngineFull; } });
// Enhanced persona engine (direct access - use with caution)
var enhancedPersonaIntegration_1 = require("./enhancedPersonaIntegration");
Object.defineProperty(exports, "EnhancedPersonaEngine", { enumerable: true, get: function () { return enhancedPersonaIntegration_1.EnhancedPersonaEngine; } });
Object.defineProperty(exports, "createEnhancedPersonaEngine", { enumerable: true, get: function () { return enhancedPersonaIntegration_1.createEnhancedPersonaEngine; } });
Object.defineProperty(exports, "DEFAULT_ENHANCED_CONFIG", { enumerable: true, get: function () { return enhancedPersonaIntegration_1.DEFAULT_ENHANCED_CONFIG; } });
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
