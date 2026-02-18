// Export all types and classes
export * from './types'
export * from './moodModel'
export * from './playstyleModel'
export * from './recommendations'
export * from './computeIdentity'
export * from './moodFilterPipeline'
export * from './enhancedRecommendations'

// Export mood forecasting analysis
export { 
  type MoodForecast,
  type MoodForecastingResult,
  calculateMoodForecast 
} from './mood/moodForecast'

// Export mood-based game recommendations
export {
  type MoodGameRecommendation,
  type MoodBasedRecommendationResult,
  generateMoodBasedRecommendations
} from './recommendation/moodGameRecommendations'

// Export free AI components
export * from './freeAIComponents'

// Export mood-persona integration
export {
  MoodPersonaIntegration,
  type MoodSelectionEvent,
  type UserAction,
  type MoodSuggestion,
  type MoodSuggestionContext,
  type DynamicMoodWeights,
  type EnhancedPlayerIdentity
} from './moodPersonaIntegration'

// Main exports
export { IdentityEngine } from './computeIdentity'
export { MoodModel } from './moodModel'
export { 
  PlaystyleModel, 
  PLAYSTYLE_ARCHETYPES, 
  calculatePlaystyleScores, 
  getPlaystyleInsights,
  type PlaystyleScores 
} from './playstyleModel'
export { RecommendationEngine } from './recommendations'

// Free AI Engine exports
export { 
  FreeAIEngine,
  FreeMoodEngine,
  FreeRecommendationEngine,
  FreeVectorSearch,
  MoodRecommendationMapper,
  SessionAnalyzer
} from './freeAIComponents'
