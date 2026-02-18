/**
 * Contextual Recommendation Engine
 * 
 * Centralized logic for mood, time, and session-based game recommendations
 * Used across HomeHub, LibrarySimple, and other features
 */

// Types
export type SessionLength = "short" | "medium" | "long";
export type TimeOfDay = "morning" | "afternoon" | "evening" | "late-night";

export interface ContextualFilters {
  selectedMoods: string[];
  selectedSessionLength: SessionLength | null;
  timeOfDay: TimeOfDay;
}

export interface ContextualGame {
  id: string;
  title: string;
  moods: string[];
  genres: string[];
  hoursPlayed?: number;
  sessionLength?: SessionLength;
  recommendedTimes?: TimeOfDay[];
  lastPlayed?: string | Date;
  [key: string]: any;
}

export interface ContextualMatch {
  game: ContextualGame;
  matchesMood: boolean;
  matchesSession: boolean;
  matchesTimeOfDay: boolean;
  sessionLength: SessionLength;
  recommendedTimes: TimeOfDay[];
  score: number; // Added scoring for persona integration
}

// NEW: Persona Context Interface
export interface PersonaContext {
  dominantMoods: string[];
  preferredSessionLength: SessionLength;
  preferredTimesOfDay: TimeOfDay[];
  recentPlayPatterns: string[];
  moodAffinity: Record<string, number>;
  averageSessionLengthMinutes: number;
  lateNightRatio: number;
  completionRate: number;
  multiplayerRatio: number;
}

// NEW: Enhanced Filters with Persona Context
export interface PersonaContextualFilters extends ContextualFilters {
  personaContext?: PersonaContext;
  personaWeight?: number; // How much to weight persona preferences (0-1)
}

// NEW: Tuning Settings Interface
export interface TuningSettings {
  personaWeight: number;
  moodWeight: number;
  sessionLengthWeight: number;
  timeOfDayWeight: number;
  playPatternWeight: number;
  autoTaggingAggressiveness: number;
}

// NEW: Default tuning settings
const DEFAULT_TUNING: TuningSettings = {
  personaWeight: 0.4,
  moodWeight: 0.3,
  sessionLengthWeight: 0.2,
  timeOfDayWeight: 0.1,
  playPatternWeight: 0.15,
  autoTaggingAggressiveness: 0.5
};

/**
 * Get current tuning settings from localStorage
 */
export const getTuningSettings = (): TuningSettings => {
  try {
    const stored = localStorage.getItem('tuning_settings');
    return stored ? { ...DEFAULT_TUNING, ...JSON.parse(stored) } : DEFAULT_TUNING;
  } catch (error) {
    console.warn('Failed to load tuning settings, using defaults:', error);
    return DEFAULT_TUNING;
  }
};

/**
 * Auto-detect current time of day
 */
export const detectTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "late-night";
};

/**
 * Infer session length from playtime data
 */
export const inferSessionLength = (hoursPlayed: number = 0): SessionLength => {
  if (hoursPlayed < 0.5) return "short";
  if (hoursPlayed <= 2) return "medium";
  return "long";
};

/**
 * Infer recommended times from mood and genre characteristics
 */
export const inferRecommendedTimes = (
  moods: string[] = [],
  genres: string[] = []
): TimeOfDay[] => {
  // Get current tuning settings
  const tuning = getTuningSettings();
  const aggressiveness = tuning.autoTaggingAggressiveness;
  
  const times = new Set<TimeOfDay>();
  
  // Check moods for time preferences
  moods.forEach(mood => {
    const normalizedMood = mood.toLowerCase().trim();
    if (["chill", "cozy", "casual", "puzzle", "relaxed"].includes(normalizedMood)) {
      if (aggressiveness > 0.3) times.add("late-night");
    }
    if (["energetic", "competitive", "focused", "intense"].includes(normalizedMood)) {
      if (aggressiveness > 0.2) times.add("morning");
    }
    if (["creative", "immersive", "story-driven", "exploration"].includes(normalizedMood)) {
      if (aggressiveness > 0.4) {
        times.add("afternoon");
        times.add("evening");
      }
    }
  });
  
  // Check genres for time preferences
  genres.forEach(genre => {
    const normalizedGenre = genre.toLowerCase().trim();
    if (["puzzle", "casual", "simulation"].includes(normalizedGenre)) {
      if (aggressiveness > 0.3) times.add("late-night");
    }
    if (["action", "fps", "competitive"].includes(normalizedGenre)) {
      if (aggressiveness > 0.2) times.add("morning");
    }
    if (["rpg", "adventure", "strategy"].includes(normalizedGenre)) {
      if (aggressiveness > 0.4) {
        times.add("afternoon");
        times.add("evening");
      }
    }
  });
  
  // Default if no characteristics matched
  if (times.size === 0) {
    times.add("evening");
  }
  
  return Array.from(times);
};

/**
 * Normalize game data with contextual information
 */
export const normalizeGameWithContextualData = (game: any): ContextualGame => {
  // Normalize moods
  const normalizedMoods = (game.moods || [])
    .map((m: any) => {
      if (typeof m === "string") return m.toLowerCase().trim();
      if (typeof m === "object" && m && "name" in m && typeof m.name === "string") {
        return m.name.toLowerCase().trim();
      }
      return null;
    })
    .filter((m: string | null): m is string => m !== null);
  
  // Normalize genres
  const normalizedGenres = (game.genres || [])
    .map((g: any) => {
      if (typeof g === "string") return g.toLowerCase().trim();
      if (typeof g === "object" && g && "name" in g && typeof g.name === "string") {
        return g.name.toLowerCase().trim();
      }
      return null;
    })
    .filter((g: string | null): g is string => g !== null);
  
  // Auto-tag contextual data if not already present
  const existingSessionLength = game.sessionLength;
  const existingRecommendedTimes = game.recommendedTimes;
  
  let inferredSessionLength = existingSessionLength || inferSessionLength(game.hoursPlayed);
  let inferredRecommendedTimes = existingRecommendedTimes || inferRecommendedTimes(normalizedMoods, normalizedGenres);
  
  return {
    ...game,
    moods: normalizedMoods,
    genres: normalizedGenres,
    sessionLength: inferredSessionLength,
    recommendedTimes: inferredRecommendedTimes
  };
};

/**
 * Generate persona context from persona data
 */
export const generatePersonaContext = (personaData: any): PersonaContext => {
  // Extract dominant moods from mood affinity
  const moodAffinity = personaData.moodAffinity || {};
  const moodEntries = Object.entries(moodAffinity) as [string, number][];
  const dominantMoods = moodEntries
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([mood]) => mood.toLowerCase());

  // Infer preferred session length from average session length
  const avgMinutes = personaData.averageSessionLengthMinutes || 75;
  let preferredSessionLength: SessionLength = "medium";
  if (avgMinutes < 45) preferredSessionLength = "short";
  else if (avgMinutes > 90) preferredSessionLength = "long";

  // Infer preferred times of day from play patterns
  const preferredTimesOfDay: TimeOfDay[] = [];
  if (personaData.lateNightRatio > 0.3) preferredTimesOfDay.push("late-night");
  if (personaData.multiplayerRatio > 0.5) preferredTimesOfDay.push("afternoon", "evening");
  if (preferredTimesOfDay.length === 0) {
    preferredTimesOfDay.push("evening"); // Default
  }

  // Generate recent play patterns
  const recentPlayPatterns: string[] = [];
  if (personaData.completionRate > 0.7) recentPlayPatterns.push("completionist");
  if (personaData.multiplayerRatio > 0.5) recentPlayPatterns.push("social");
  if (personaData.lateNightRatio > 0.3) recentPlayPatterns.push("night_owl");

  return {
    dominantMoods,
    preferredSessionLength,
    preferredTimesOfDay,
    recentPlayPatterns,
    moodAffinity,
    averageSessionLengthMinutes: avgMinutes,
    lateNightRatio: personaData.lateNightRatio || 0,
    completionRate: personaData.completionRate || 0,
    multiplayerRatio: personaData.multiplayerRatio || 0
  };
};

/**
 * Enhanced contextual matching with persona integration
 */
export const getPersonaContextualMatch = (
  game: ContextualGame,
  filters: PersonaContextualFilters
): ContextualMatch => {
  const { selectedMoods, selectedSessionLength, timeOfDay, personaContext, personaWeight = 0.3 } = filters;
  
  // Get current tuning settings
  const tuning = getTuningSettings();
  
  // Basic contextual matching
  const matchesMood = selectedMoods.length === 0 || 
    selectedMoods.some(mood => game.moods.includes(mood));
  
  const matchesSession = !selectedSessionLength || 
    game.sessionLength === selectedSessionLength;
  
  const matchesTimeOfDay = !game.recommendedTimes || 
    game.recommendedTimes.includes(timeOfDay);

  // Persona-based scoring with tuning
  let personaScore = 0;
  if (personaContext) {
    // Mood affinity scoring
    personaContext.dominantMoods.forEach(mood => {
      if (game.moods.includes(mood)) {
        personaScore += (personaContext.moodAffinity[mood] || 0) * tuning.moodWeight;
      }
    });

    // Session length preference
    if (game.sessionLength === personaContext.preferredSessionLength) {
      personaScore += 25 * tuning.sessionLengthWeight;
    }

    // Time of day preference
    if (game.recommendedTimes?.some(time => personaContext.preferredTimesOfDay.includes(time))) {
      personaScore += 20 * tuning.timeOfDayWeight;
    }

    // Play pattern matching
    personaContext.recentPlayPatterns.forEach((pattern: string) => {
      if (pattern === "completionist" && game.playStatus === 'completed') {
        personaScore += 15 * tuning.playPatternWeight;
      }
      if (pattern === "social" && game.genres?.some(g => 
        g.toLowerCase().includes('multiplayer') || g.toLowerCase().includes('co-op'))) {
        personaScore += 15 * tuning.playPatternWeight;
      }
    });
  }

  // Combined score: basic matching + weighted persona score
  const baseScore = [matchesMood, matchesSession, matchesTimeOfDay].filter(Boolean).length * 25;
  const finalScore = baseScore + (personaScore * (personaWeight || tuning.personaWeight));

  return {
    game,
    matchesMood,
    matchesSession,
    matchesTimeOfDay,
    sessionLength: game.sessionLength || "medium",
    recommendedTimes: game.recommendedTimes || ["evening"],
    score: finalScore
  };
};

/**
 * Enhanced filtering with persona integration
 */
export const matchesPersonaContextualFilters = (
  game: ContextualGame,
  filters: PersonaContextualFilters
): boolean => {
  const match = getPersonaContextualMatch(game, filters);
  return match.score > 0; // Any positive score means it's a match
};

/**
 * Get detailed match information for a game
 */
export const getContextualMatch = (
  game: ContextualGame,
  filters: ContextualFilters
): ContextualMatch => {
  const { selectedMoods, selectedSessionLength, timeOfDay } = filters;
  
  const matchesMood = selectedMoods.length === 0 || 
    selectedMoods.some(mood => game.moods.includes(mood));
  
  const matchesSession = !selectedSessionLength || 
    game.sessionLength === selectedSessionLength;
  
  const matchesTimeOfDay = !game.recommendedTimes || 
    game.recommendedTimes.includes(timeOfDay);
  
  return {
    game,
    matchesMood,
    matchesSession,
    matchesTimeOfDay,
    sessionLength: game.sessionLength || "medium",
    recommendedTimes: game.recommendedTimes || ["evening"],
    score: 0 // Default score for basic contextual matching
  };
};

/**
 * Main function: Get contextual matches from a game library
 */
export const getContextualMatches = (
  library: any[],
  filters: ContextualFilters,
  options: {
    limit?: number;
    includeDetails?: boolean;
  } = {}
): ContextualMatch[] | ContextualGame[] => {
  const { limit = 10, includeDetails = false } = options;
  
  // Normalize all games with contextual data
  const normalizedGames = library.map(normalizeGameWithContextualData);
  
  // Filter games based on contextual criteria
  const filteredGames = normalizedGames.filter(game => 
    matchesPersonaContextualFilters(game, filters as PersonaContextualFilters)
  );
  
  // Sort by relevance (games matching more criteria first)
  filteredGames.sort((a, b) => {
    const aMatch = getContextualMatch(a, filters);
    const bMatch = getContextualMatch(b, filters);
    
    const aScore = [aMatch.matchesMood, aMatch.matchesSession, aMatch.matchesTimeOfDay]
      .filter(Boolean).length;
    const bScore = [bMatch.matchesMood, bMatch.matchesSession, bMatch.matchesTimeOfDay]
      .filter(Boolean).length;
    
    return bScore - aScore;
  });
  
  // Limit results
  const limitedResults = filteredGames.slice(0, limit);
  
  // Return with or without details
  if (includeDetails) {
    return limitedResults.map(game => getContextualMatch(game, filters));
  }
  
  return limitedResults;
};

/**
 * Get current time of day with auto-detection
 */
export const getCurrentTimeOfDay = (): TimeOfDay => {
  return detectTimeOfDay();
};

/**
 * Utility: Safe date handling for sorting
 */
export const getTimeSafe = (date: string | Date | undefined | null): number => {
  if (!date) return 0;
  if (date instanceof Date) return date.getTime();
  if (typeof date === 'string') return new Date(date).getTime();
  return 0;
};

/**
 * Main function: Get persona-enhanced contextual matches from a game library
 */
export const getPersonaContextualMatches = (
  library: any[],
  personaContext: PersonaContext,
  userFilters: ContextualFilters,
  options: {
    limit?: number;
    includeDetails?: boolean;
    personaWeight?: number;
  } = {}
): ContextualMatch[] | ContextualGame[] => {
  const { limit = 10, includeDetails = false, personaWeight = 0.3 } = options;
  
  // Combine persona context with user filters
  const enhancedFilters: PersonaContextualFilters = {
    ...userFilters,
    personaContext,
    personaWeight
  };
  
  // Normalize all games with contextual data
  const normalizedGames = library.map(normalizeGameWithContextualData);
  
  // Filter games based on enhanced contextual criteria
  const filteredGames = normalizedGames.filter(game => 
    matchesPersonaContextualFilters(game, enhancedFilters)
  );
  
  // Sort by persona-enhanced relevance score
  filteredGames.sort((a, b) => {
    const aMatch = getPersonaContextualMatch(a, enhancedFilters);
    const bMatch = getPersonaContextualMatch(b, enhancedFilters);
    return bMatch.score - aMatch.score;
  });
  
  // Limit results
  const limitedResults = filteredGames.slice(0, limit);
  
  // Return with or without details
  if (includeDetails) {
    return limitedResults.map(game => getPersonaContextualMatch(game, enhancedFilters));
  }
  
  return limitedResults;
};

// Export all functions for easy importing
export default {
  detectTimeOfDay,
  inferSessionLength,
  inferRecommendedTimes,
  normalizeGameWithContextualData,
  matchesPersonaContextualFilters,
  getContextualMatch,
  getContextualMatches,
  getPersonaContextualMatches,
  getCurrentTimeOfDay,
  getTimeSafe,
  generatePersonaContext,
  getPersonaContextualMatch
};
