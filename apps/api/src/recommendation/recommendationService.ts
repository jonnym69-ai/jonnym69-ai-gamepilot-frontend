import { MoodForecastingResult } from '@gamepilot/identity-engine'
import { Game } from '@gamepilot/types'
import { generateMoodBasedRecommendations, type MoodBasedRecommendationResult } from '@gamepilot/identity-engine'
import { RecommendationEngine } from '@gamepilot/identity-engine'
import type { PersonaState } from '../persona/personaModel'

/**
 * Recommendation Service
 * Provides mood-based game recommendations using forecasting data
 */

export class RecommendationService {
  private recommendationEngine: RecommendationEngine

  constructor() {
    this.recommendationEngine = new RecommendationEngine()
  }
  /**
   * Get mood-based game recommendations for a user
   */
  async getMoodBasedRecommendations(
    userId: string,
    forecastResult: MoodForecastingResult,
    userGames: Game[] = [],
    maxRecommendations: number = 10
  ): Promise<MoodBasedRecommendationResult> {
    try {
      // If no games provided, get user's game library
      if (userGames.length === 0) {
        userGames = await this.getUserGameLibrary(userId);
      }
      
      // Generate recommendations using identity engine
      const recommendations = generateMoodBasedRecommendations(
        forecastResult,
        userGames,
        maxRecommendations
      );
      
      return recommendations;
    } catch (error) {
      console.error('Failed to generate mood-based recommendations:', error);
      throw new Error('Recommendation generation failed');
    }
  }

  /**
   * Get personalized recommendations combining mood forecast with user preferences
   */
  async getPersonalizedRecommendations(
    userId: string,
    forecastPeriod: 'next_week' | 'next_month' | 'next_quarter' = 'next_month',
    maxRecommendations: number = 10
  ): Promise<MoodBasedRecommendationResult> {
    try {
      // This would integrate with the mood service to get forecast
      // For now, return empty result as placeholder
      return {
        recommendations: [],
        predictedMood: 'chill',
        confidence: 0,
        totalGames: 0,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Failed to get personalized recommendations:', error);
      throw new Error('Personalized recommendation failed');
    }
  }

  /**
   * Helper method to get user's game library
   */
  private async getUserGameLibrary(userId: string): Promise<Game[]> {
    // Implementation would retrieve user's games from database
    // For now, return empty array as placeholder
    return [];
  }

  /**
   * Get persona-driven recommendations
   */
  async getPersonaBasedRecommendations(
    userId: string,
    personaState: PersonaState,
    userGames: Game[] = [],
    options: {
      maxRecommendations: number
      context?: {
        timeAvailable?: number
        socialContext?: 'solo' | 'co-op' | 'pvp'
        intensity?: 'low' | 'medium' | 'high'
        excludeRecentlyPlayed?: boolean
      }
    } = { maxRecommendations: 10 }
  ): Promise<{
    recommendations: any[]
    generatedAt: Date
    totalGames: number
  }> {
    try {
      // If no games provided, get user's game library
      if (userGames.length === 0) {
        userGames = await this.getUserGameLibrary(userId);
      }

      // Build recommendation context from persona state
      const recommendationContext = {
        currentMood: personaState.mood,
        timeAvailable: options.context?.timeAvailable || personaState.sessionLengthPreference,
        socialContext: options.context?.socialContext || 'solo',
        intensity: options.context?.intensity || 'medium',
        excludeRecentlyPlayed: options.context?.excludeRecentlyPlayed || true,
        genres: Object.keys(personaState.genreAffinities).filter(genre => personaState.genreAffinities[genre] > 0.5)
      };

      // Create mock player identity from persona state
      const playerIdentity = {
        id: userId,
        userId,
        moods: [], // Would be populated from persona history
        playstyle: {
          primary: {
            id: personaState.archetype,
            name: personaState.archetype,
            description: '',
            icon: '',
            color: '',
            traits: []
          },
          preferences: {
            sessionLength: (personaState.sessionLengthPreference > 60 ? 'long' : personaState.sessionLengthPreference > 30 ? 'medium' : 'short') as 'short' | 'medium' | 'long',
            difficulty: (personaState.difficultyPreference > 0.75 ? 'expert' : personaState.difficultyPreference > 0.5 ? 'hard' : personaState.difficultyPreference > 0.25 ? 'normal' : 'casual') as 'casual' | 'normal' | 'hard' | 'expert',
            socialPreference: (personaState.socialPreference > 0.66 ? 'competitive' : personaState.socialPreference > 0.33 ? 'cooperative' : 'solo') as 'solo' | 'cooperative' | 'competitive',
            storyFocus: 50, // Default
            graphicsFocus: 50, // Default
            gameplayFocus: 50 // Default
          },
          traits: []
        },
        sessions: [], // Would be populated from persona history
        genreAffinities: personaState.genreAffinities,
        lastUpdated: new Date(),
        version: '1.0'
      };

      // Get recommendations using the enhanced engine
      const recommendations = this.recommendationEngine.getRecommendations(
        playerIdentity,
        recommendationContext,
        userGames
      );

      // Enhance recommendations with persona-specific explanations
      const enhancedRecommendations = recommendations.map(rec => ({
        ...rec,
        personaExplanation: this.generatePersonaExplanation(rec, personaState),
        intentMatch: this.calculateIntentMatch(rec, personaState),
        behaviorMatch: this.calculateBehaviorMatch(rec, personaState)
      }));

      return {
        recommendations: enhancedRecommendations.slice(0, options.maxRecommendations),
        generatedAt: new Date(),
        totalGames: userGames.length
      };
    } catch (error) {
      console.error('Failed to generate persona-based recommendations:', error);
      throw new Error('Persona-based recommendation generation failed');
    }
  }

  /**
   * Generate persona-specific explanation for recommendations
   */
  private generatePersonaExplanation(recommendation: any, personaState: PersonaState): string[] {
    const explanations: string[] = [];

    // Mood-based explanations
    if (recommendation.moodMatch > 70) {
      explanations.push(`Perfect match for your ${personaState.mood} mood`);
    }

    // Intent-based explanations
    if (personaState.intent === 'short_session' && recommendation.estimatedPlaytime <= 30) {
      explanations.push('Great for a quick gaming session');
    } else if (personaState.intent === 'social' && recommendation.tags?.includes('multiplayer')) {
      explanations.push('Perfect for social gaming');
    } else if (personaState.intent === 'challenge' && recommendation.difficulty === 'hard') {
      explanations.push('Will satisfy your desire for a challenge');
    }

    // Genre affinity explanations
    const genreAffinity = personaState.genreAffinities[recommendation.genre] || 0;
    if (genreAffinity > 0.7) {
      explanations.push(`You highly enjoy ${recommendation.genre} games`);
    }

    return explanations.slice(0, 2); // Max 2 explanations
  }

  /**
   * Calculate how well recommendation matches user's intent
   */
  private calculateIntentMatch(recommendation: any, personaState: PersonaState): number {
    let score = 50; // Base score

    switch (personaState.intent) {
      case 'short_session':
        if (recommendation.estimatedPlaytime <= 30) score += 30;
        else if (recommendation.estimatedPlaytime <= 60) score += 15;
        else score -= 20;
        break;
      case 'comfort':
        if (recommendation.tags?.includes('relaxing') || recommendation.tags?.includes('casual')) score += 25;
        if (personaState.recentGames.includes(recommendation.gameId)) score += 15;
        break;
      case 'novelty':
        if (!personaState.recentGames.includes(recommendation.gameId)) score += 20;
        if (recommendation.tags?.includes('innovative') || recommendation.tags?.includes('unique')) score += 15;
        break;
      case 'social':
        if (recommendation.tags?.includes('multiplayer') || recommendation.tags?.includes('co-op')) score += 30;
        break;
      case 'challenge':
        if (recommendation.difficulty === 'hard' || recommendation.difficulty === 'expert') score += 25;
        if (recommendation.tags?.includes('competitive')) score += 15;
        break;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate how well recommendation matches user's behavioral patterns
   */
  private calculateBehaviorMatch(recommendation: any, personaState: PersonaState): number {
    let score = 50; // Base score

    // Session length preference
    const timeDiff = Math.abs(recommendation.estimatedPlaytime - personaState.sessionLengthPreference);
    if (timeDiff <= 15) score += 20;
    else if (timeDiff <= 30) score += 10;
    else score -= 10;

    // Genre affinity
    const genreAffinity = personaState.genreAffinities[recommendation.genre] || 0;
    score += (genreAffinity - 0.5) * 40; // Scale affinity to -20 to +20

    // Social preference
    const isMultiplayer = recommendation.tags?.includes('multiplayer');
    if (isMultiplayer && personaState.socialPreference > 0.66) score += 15;
    if (!isMultiplayer && personaState.socialPreference < 0.33) score += 15;

    return Math.max(0, Math.min(100, score));
  }
}
