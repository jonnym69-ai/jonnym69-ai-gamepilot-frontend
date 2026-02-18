import { GAME_DESIGN_PATTERNS, GameDesignPattern, getGameById } from '../data/gameDesignPatterns';
import { EmotionalProfile } from '../components/premium/EmotionalInputCollector';

// Dynamic import for Ollama service (only load when needed)
let ollamaService: any = null;
const loadOllamaService = async () => {
  if (!ollamaService) {
    try {
      // This will be handled by the backend API call
      ollamaService = true; // Placeholder - actual AI calls will go through API
    } catch (error) {
      console.warn('Ollama service not available:', error);
      ollamaService = false;
    }
  }
  return ollamaService;
};

export interface MatchScore {
  emotionalScore: number;
  timeFitScore: number;
  availabilityScore: number;
  noveltyScore: number;
  burnoutRiskScore: number;
  totalScore: number;
}

export interface ScoredGame extends GameDesignPattern {
  matchScore: MatchScore;
  reasoning: string;
}

// Emotional need to alignment mapping
const EMOTIONAL_MAPPINGS = {
  comfort: 'comfortAlignment',
  escape: 'escapeAlignment',
  mastery: 'masteryAlignment',
  chaos: 'chaosAlignment',
  novelty: 'noveltyAlignment',
  story_flow: 'storyFlowAlignment'
} as const;

// Energy level descriptors for coaching language
const ENERGY_LEVELS = {
  low: { range: [1, 3], descriptor: 'low energy', pacing: 'gentle' },
  moderate: { range: [4, 7], descriptor: 'moderate energy', pacing: 'balanced' },
  high: { range: [8, 10], descriptor: 'high energy', pacing: 'fast-paced' }
};

const COGNITIVE_LEVELS = {
  low: { range: [1, 3], descriptor: 'overwhelmed', complexity: 'simple' },
  moderate: { range: [4, 7], descriptor: 'focused', complexity: 'moderate' },
  high: { range: [8, 10], descriptor: 'sharp', complexity: 'complex' }
};

const TOLERANCE_LEVELS = {
  low: { range: [1, 3], descriptor: 'gentle', friction: 'easy' },
  moderate: { range: [4, 7], descriptor: 'balanced', friction: 'moderate' },
  high: { range: [8, 10], descriptor: 'challenging', friction: 'hard' }
};

/**
 * Calculate emotional match score for a game
 */
function calculateEmotionalMatch(
  emotionalProfile: EmotionalProfile,
  gamePattern: GameDesignPattern
): number {
  let totalScore = 0;
  let totalWeight = 0;

  // Map emotional needs to game alignments
  emotionalProfile.emotionalNeeds.forEach(need => {
    const alignmentKey = EMOTIONAL_MAPPINGS[need as keyof typeof EMOTIONAL_MAPPINGS];
    if (alignmentKey) {
      const alignmentScore = gamePattern[alignmentKey as keyof GameDesignPattern] as number;
      totalScore += alignmentScore * 10; // Convert to 0-100 scale
      totalWeight += 10;
    }
  });

  // Factor in energy level preferences
  const energyPreference = getEnergyPreference(emotionalProfile.energyLevel);
  const energyMatch = Math.abs(gamePattern.pacing - energyPreference.targetPacing);
  const energyPenalty = energyMatch * 2; // Penalty for mismatch
  totalScore += Math.max(0, 100 - energyPenalty);
  totalWeight += 20;

  // Factor in cognitive load tolerance
  const cognitivePreference = getCognitivePreference(emotionalProfile.cognitiveLoad);
  const cognitiveMatch = Math.abs(gamePattern.mechanicalComplexity - cognitivePreference.targetComplexity);
  const cognitivePenalty = cognitiveMatch * 3;
  totalScore += Math.max(0, 100 - cognitivePenalty);
  totalWeight += 20;

  // Factor in tolerance for challenge
  const tolerancePreference = getTolerancePreference(emotionalProfile.toleranceLevel);
  const toleranceMatch = Math.abs(gamePattern.frictionLevel - tolerancePreference.targetFriction);
  const tolerancePenalty = toleranceMatch * 2.5;
  totalScore += Math.max(0, 100 - tolerancePenalty);
  totalWeight += 20;

  return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) / 100 : 0;
}

/**
 * Calculate time fit score
 */
function calculateTimeFit(
  availableTime: number,
  gamePattern: GameDesignPattern,
  sessionType: string
): number {
  const timeToFun = gamePattern.timeToFun;
  const avgPlaytime = gamePattern.avgPlaytime;

  // Quick sessions need fast time-to-fun
  if (sessionType === 'quick' && availableTime <= 45) {
    if (timeToFun <= 15) return 1.0;
    if (timeToFun <= 30) return 0.7;
    return 0.3;
  }

  // Focused sessions (1-2 hours)
  if (sessionType === 'focused' && availableTime <= 120) {
    if (timeToFun <= availableTime / 3) return 1.0;
    if (timeToFun <= availableTime / 2) return 0.8;
    return 0.5;
  }

  // Immersive sessions (3+ hours)
  if (sessionType === 'immersive') {
    if (timeToFun <= 45) return 1.0;
    if (timeToFun <= 90) return 0.8;
    return 0.6;
  }

  // Marathon sessions
  if (sessionType === 'marathon') {
    return 0.9; // Long sessions are flexible
  }

  // Default calculation
  if (timeToFun <= availableTime * 0.3) return 1.0;
  if (timeToFun <= availableTime * 0.5) return 0.8;
  if (timeToFun <= availableTime) return 0.6;
  return 0.3;
}

/**
 * Calculate availability score (do they own it?)
 */
function calculateAvailability(
  gameId: string,
  ownedGames: string[] = []
): number {
  return ownedGames.includes(gameId) ? 1.0 : 0.6;
}

/**
 * Calculate novelty vs familiarity score
 */
function calculateNovelty(
  gameId: string,
  recentGames: string[] = [],
  playHistory: Array<{gameId: string, sessions: number, lastPlayed: Date}> = []
): number {
  const recentPlay = recentGames.includes(gameId);
  const historyEntry = playHistory.find(h => h.gameId === gameId);

  if (!historyEntry) return 0.8; // New game - good novelty
  if (recentPlay) return 0.3; // Recently played - low novelty
  if (historyEntry.sessions > 10) return 0.4; // Overplayed - low novelty
  if (historyEntry.sessions > 5) return 0.6; // Moderately played
  return 0.7; // Lightly played - good balance
}

/**
 * Calculate burnout risk score
 */
function calculateBurnoutRisk(
  gamePattern: GameDesignPattern,
  recentSessions: Array<{difficulty: string, duration: number, frustration: number}> = []
): number {
  // If recently played high-friction games, prefer lower friction
  const recentHighFriction = recentSessions.filter(s =>
    s.difficulty === 'hard' && s.frustration > 7
  ).length;

  if (recentHighFriction > 2 && gamePattern.frictionLevel > 7) {
    return 0.3; // High burnout risk
  }

  if (recentHighFriction > 0 && gamePattern.frictionLevel > 5) {
    return 0.6; // Moderate burnout risk
  }

  // If recently played low-stimulation games, prefer higher stimulation
  const recentLowStim = recentSessions.filter(s =>
    s.frustration < 3 && s.duration > 120
  ).length;

  if (recentLowStim > 3 && gamePattern.sensoryIntensity < 5) {
    return 0.4; // Risk of boredom
  }

  return 0.9; // Low burnout risk
}

/**
 * Get energy level preferences
 */
function getEnergyPreference(energyLevel: number) {
  if (energyLevel <= 3) return { descriptor: 'low energy', targetPacing: 3 };
  if (energyLevel <= 7) return { descriptor: 'moderate energy', targetPacing: 6 };
  return { descriptor: 'high energy', targetPacing: 8 };
}

/**
 * Get cognitive load preferences
 */
function getCognitivePreference(cognitiveLoad: number) {
  if (cognitiveLoad <= 3) return { descriptor: 'overwhelmed', targetComplexity: 3 };
  if (cognitiveLoad <= 7) return { descriptor: 'focused', targetComplexity: 6 };
  return { descriptor: 'sharp', targetComplexity: 8 };
}

/**
 * Get tolerance preferences
 */
function getTolerancePreference(toleranceLevel: number) {
  if (toleranceLevel <= 3) return { descriptor: 'gentle', targetFriction: 3 };
  if (toleranceLevel <= 7) return { descriptor: 'balanced', targetFriction: 6 };
  return { descriptor: 'challenging', targetFriction: 8 };
}

/**
 * Generate personalized reasoning
 */
function generateReasoning(
  emotionalProfile: EmotionalProfile,
  gamePattern: GameDesignPattern,
  scores: MatchScore
): string {
  const energyPref = getEnergyPreference(emotionalProfile.energyLevel);
  const cognitivePref = getCognitivePreference(emotionalProfile.cognitiveLoad);
  const tolerancePref = getTolerancePreference(emotionalProfile.toleranceLevel);

  const primaryNeed = emotionalProfile.emotionalNeeds[0];
  const needAlignment = EMOTIONAL_MAPPINGS[primaryNeed as keyof typeof EMOTIONAL_MAPPINGS];
  const alignmentScore = gamePattern[needAlignment as keyof GameDesignPattern] as number;

  // Convert numeric energy level to category
  const energyLevelCategory = emotionalProfile.energyLevel <= 3 ? 'low' : emotionalProfile.energyLevel <= 7 ? 'moderate' : 'high';

  let reasoning = `I see you're feeling ${energyPref.descriptor} and craving ${primaryNeed}. `;

  if (scores.emotionalScore > 0.8) {
    reasoning += `${gamePattern.gameName} is perfect for this - it delivers the ${primaryNeed} you need with ${energyPref.targetPacing} pacing that matches your current energy level.`;
  } else if (scores.emotionalScore > 0.6) {
    reasoning += `${gamePattern.gameName} should work well - it provides good ${primaryNeed} with ${tolerancePref.targetFriction} challenge that won't overwhelm you.`;
  } else {
    reasoning += `${gamePattern.gameName} might be a good fit despite some mismatches - the ${primaryNeed} elements are strong even if the pacing isn't perfect.`;
  }

  if (energyLevelCategory === 'low' && primaryNeed === 'comfort') {
    reasoning += " Perfect for winding down - this game respects your current energy level";
  }

  if (primaryNeed === 'mastery' && energyLevelCategory === 'high') {
    reasoning += " Great for channeling your motivation into meaningful progress";
  }

  if (emotionalProfile.socialAppetite === 'solo' && energyPref.targetPacing < 6) {
    reasoning += " Ideal solo experience with gentle, contemplative pacing";
  }

  return reasoning;
}

/**
 * AI-enhanced personalized recommendation using Ollama
 */
export async function getAIEnhancedRecommendation(
  emotionalProfile: EmotionalProfile,
  ownedGames: string[] = [],
  ownedGamesData: Array<{gameId: string, gameName: string, genres: string[], difficulty: string}> = [],
  recentGames: string[] = [],
  playHistory: Array<{gameId: string, sessions: number, lastPlayed: Date}> = [],
  recentSessions: Array<{difficulty: string, duration: number, frustration: number}> = [],
  useAI: boolean = true
): Promise<ScoredGame | null> {
  // Start with rule-based recommendation as foundation
  const ruleBasedRecommendation = getPersonalizedRecommendation(
    emotionalProfile,
    ownedGames,
    recentGames,
    playHistory,
    recentSessions
  );

  if (!useAI || !ruleBasedRecommendation) {
    return ruleBasedRecommendation;
  }

  try {
    // Prepare owned games data for AI
    const ownedGamesData = ownedGames
      .map(gameId => {
        const gamePattern = GAME_DESIGN_PATTERNS.find(g => g.gameId === gameId);
        return gamePattern ? {
          gameId: gamePattern.gameId,
          gameName: gamePattern.gameName,
          genres: gamePattern.genres,
          difficulty: gamePattern.difficulty
        } : null;
      })
      .filter(Boolean) as Array<{gameId: string, gameName: string, genres: string[], difficulty: string}>;

    // Call AI service (this will go through backend API)
    const aiResponse = await fetch('/api/ai/gaming-coach/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emotionalProfile,
        ownedGames: ownedGamesData,
        recentGames,
        availableTime: emotionalProfile.availableTime || 60
      })
    });

    if (!aiResponse.ok) {
      console.warn('AI recommendation failed, falling back to rule-based');
      return ruleBasedRecommendation;
    }

    const aiRecommendation = await aiResponse.json();

    // If AI found a better recommendation from library, use it
    if (aiRecommendation && aiRecommendation.gameName) {
      const aiGamePattern = GAME_DESIGN_PATTERNS.find(g =>
        g.gameName.toLowerCase() === aiRecommendation.gameName.toLowerCase()
      );

      if (aiGamePattern && ownedGames.includes(aiGamePattern.gameId)) {
        // Recalculate scores for AI-recommended game
        const emotionalScore = calculateEmotionalMatch(emotionalProfile, aiGamePattern);
        const timeFitScore = calculateTimeFit(emotionalProfile.availableTime, aiGamePattern, emotionalProfile.sessionType);
        const availabilityScore = calculateAvailability(aiGamePattern.gameId, ownedGames);
        const noveltyScore = calculateNovelty(aiGamePattern.gameId, recentGames, playHistory);
        const burnoutRiskScore = calculateBurnoutRisk(aiGamePattern, recentSessions);

        const aiEnhancedScore: MatchScore = {
          emotionalScore,
          timeFitScore,
          availabilityScore,
          noveltyScore,
          burnoutRiskScore,
          totalScore: aiRecommendation.confidence || 0.8
        };

        return {
          ...aiGamePattern,
          matchScore: aiEnhancedScore,
          reasoning: aiRecommendation.reasoning || generateReasoning(emotionalProfile, aiGamePattern, aiEnhancedScore)
        };
      }
    }

    // If AI didn't find a better match, enhance the reasoning of the rule-based recommendation
    try {
      const adviceResponse = await fetch('/api/ai/gaming-coach/advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentMood: emotionalProfile.emotionalNeeds[0] || 'balanced',
          recentSession: recentSessions[recentSessions.length - 1],
          goals: emotionalProfile.emotionalNeeds,
          constraints: [`${emotionalProfile.availableTime || 60} minutes available`]
        })
      });

      if (adviceResponse.ok) {
        const adviceData = await adviceResponse.json();
        if (adviceData.advice) {
          // Enhance the reasoning with AI insights
          ruleBasedRecommendation.reasoning += `\n\n💡 AI Insight: ${adviceData.advice}`;
        }
      }
    } catch (adviceError) {
      console.warn('AI advice enhancement failed:', adviceError);
    }

    return ruleBasedRecommendation;

  } catch (error) {
    console.warn('AI enhancement failed, using rule-based recommendation:', error);
    return ruleBasedRecommendation;
  }
}

/**
 * Main recommendation algorithm - now prioritizes library games
 */
export function getPersonalizedRecommendation(
  emotionalProfile: EmotionalProfile,
  ownedGames: string[] = [],
  recentGames: string[] = [],
  playHistory: Array<{gameId: string, sessions: number, lastPlayed: Date}> = [],
  recentSessions: Array<{difficulty: string, duration: number, frustration: number}> = []
): ScoredGame | null {
  let bestGame: ScoredGame | null = null;
  let bestScore = 0;

  // Filter to only games in user's library, or include some popular games if library is empty/small
  let candidateGames = GAME_DESIGN_PATTERNS;

  if (ownedGames.length > 0) {
    // If user has owned games, prioritize them heavily
    const ownedGamePatterns = GAME_DESIGN_PATTERNS.filter(game =>
      ownedGames.includes(game.gameId)
    );

    if (ownedGamePatterns.length > 0) {
      candidateGames = ownedGamePatterns;
    } else {
      // If no owned games match our patterns, still recommend from owned games but with lower confidence
      // For now, we'll work with the patterns we have - in production you'd expand the game database
      candidateGames = GAME_DESIGN_PATTERNS;
    }
  }

  for (const gamePattern of candidateGames) {
    // Calculate all scoring factors
    const emotionalScore = calculateEmotionalMatch(emotionalProfile, gamePattern);
    const timeFitScore = calculateTimeFit(emotionalProfile.availableTime, gamePattern, emotionalProfile.sessionType);
    const availabilityScore = calculateAvailability(gamePattern.gameId, ownedGames);
    const noveltyScore = calculateNovelty(gamePattern.gameId, recentGames, playHistory);
    const burnoutRiskScore = calculateBurnoutRisk(gamePattern, recentSessions);

    // Heavily weight availability for library-only recommendations
    const libraryWeight = ownedGames.length > 0 ? 0.35 : 0.15; // Much higher weight for owned games
    const emotionalWeight = ownedGames.length > 0 ? 0.35 : 0.4; // Adjust emotional weight accordingly

    // Weighted total score
    const totalScore = (
      emotionalScore * emotionalWeight +  // Emotional match
      timeFitScore * 0.25 +               // Time fit
      availabilityScore * libraryWeight + // Library availability (heavily weighted)
      noveltyScore * 0.03 +               // Reduced novelty weight
      burnoutRiskScore * 0.02            // Reduced burnout weight
    );

    const matchScore: MatchScore = {
      emotionalScore,
      timeFitScore,
      availabilityScore,
      noveltyScore,
      burnoutRiskScore,
      totalScore
    };

    const reasoning = generateReasoning(emotionalProfile, gamePattern, matchScore);

    const scoredGame: ScoredGame = {
      ...gamePattern,
      matchScore,
      reasoning
    };

    if (totalScore > bestScore) {
      bestGame = scoredGame;
      bestScore = totalScore;
    }
  }

  return bestGame;
}

/**
 * Get alternative recommendations - now prioritizes library games
 */
export function getAlternativeRecommendations(
  emotionalProfile: EmotionalProfile,
  primaryGame: ScoredGame,
  count: number = 3,
  ownedGames: string[] = [],
  recentGames: string[] = [],
  playHistory: Array<{gameId: string, sessions: number, lastPlayed: Date}> = [],
  recentSessions: Array<{difficulty: string, duration: number, frustration: number}> = []
): ScoredGame[] {
  const alternatives: ScoredGame[] = [];

  // Filter to only games in user's library for alternatives too
  let candidateGames = GAME_DESIGN_PATTERNS;

  if (ownedGames.length > 0) {
    const ownedGamePatterns = GAME_DESIGN_PATTERNS.filter(game =>
      ownedGames.includes(game.gameId) && game.gameId !== primaryGame.gameId
    );

    if (ownedGamePatterns.length > 0) {
      candidateGames = ownedGamePatterns;
    }
  }

  for (const gamePattern of candidateGames) {
    if (gamePattern.gameId === primaryGame.gameId) continue;

    const emotionalScore = calculateEmotionalMatch(emotionalProfile, gamePattern);
    const timeFitScore = calculateTimeFit(emotionalProfile.availableTime, gamePattern, emotionalProfile.sessionType);
    const availabilityScore = calculateAvailability(gamePattern.gameId, ownedGames);
    const noveltyScore = calculateNovelty(gamePattern.gameId, recentGames, playHistory);
    const burnoutRiskScore = calculateBurnoutRisk(gamePattern, recentSessions);

    // Use same weighting as main recommendation
    const libraryWeight = ownedGames.length > 0 ? 0.35 : 0.15;
    const emotionalWeight = ownedGames.length > 0 ? 0.35 : 0.4;

    const totalScore = (
      emotionalScore * emotionalWeight +
      timeFitScore * 0.25 +
      availabilityScore * libraryWeight +
      noveltyScore * 0.03 +
      burnoutRiskScore * 0.02
    );

    if (totalScore > 0.6) { // Only include reasonably good matches
      const matchScore: MatchScore = {
        emotionalScore,
        timeFitScore,
        availabilityScore,
        noveltyScore,
        burnoutRiskScore,
        totalScore
      };

      const reasoning = generateReasoning(emotionalProfile, gamePattern, matchScore);

      alternatives.push({
        ...gamePattern,
        matchScore,
        reasoning
      });
    }
  }

  // Sort by score and return top alternatives
  return alternatives
    .sort((a, b) => b.matchScore.totalScore - a.matchScore.totalScore)
    .slice(0, count);
}
