import { GameSession, GameRecommendation } from './types';
import { mlRecommendationEngine } from './mlRecommendations';
import { neuralMoodAnalyzer } from './neuralMoodAnalysis';
import type { Game } from '@gamepilot/types';

/**
 * Predictive Game Suggestions System
 * Uses behavioral patterns and ML models to predict what games users will want to play next
 */

export interface BehaviorPattern {
  userId: string;
  timePatterns: TimePattern[];
  sessionLengthPatterns: SessionLengthPattern[];
  genreSequences: GenreSequence[];
  moodTransitions: MoodTransition[];
  devicePatterns: DevicePattern[];
}

export interface TimePattern {
  hour: number;
  dayOfWeek: number;
  preferredGenres: string[];
  averageSessionLength: number;
  likelihood: number;
}

export interface SessionLengthPattern {
  duration: number; // in minutes
  preferredGenres: string[];
  completionRate: number;
  mood: string;
}

export interface GenreSequence {
  sequence: string[];
  frequency: number;
  averageTransitionTime: number;
  commonNextGenres: string[];
}

export interface MoodTransition {
  fromMood: string;
  toMood: string;
  triggerGames: string[];
  averageTime: number;
  probability: number;
}

export interface DevicePattern {
  device: string;
  preferredGenres: string[];
  averageSessionLength: number;
  timeOfDay: number[];
}

export interface PredictiveContext {
  currentTime: Date;
  availableTime?: number; // minutes
  currentMood?: string;
  recentSessions: GameSession[];
  device?: string;
  socialContext?: 'solo' | 'coop' | 'pvp';
  energyLevel?: number; // 0-100
}

export interface PredictiveSuggestion {
  game: Game;
  confidence: number; // 0-1
  reasoning: string[];
  predictedSatisfaction: number; // 0-1
  estimatedPlaytime: number;
  fitScore: {
    time: number;
    mood: number;
    energy: number;
    social: number;
    sequence: number;
  };
  alternatives: Game[];
}

export interface PredictiveInsight {
  type: 'pattern' | 'anomaly' | 'trend' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  suggestions: string[];
}

export class PredictiveSuggestionEngine {
  private behaviorPatterns: Map<string, BehaviorPattern> = new Map();
  private predictionCache: Map<string, PredictiveSuggestion[]> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes

  /**
   * Generate predictive game suggestions based on user behavior
   */
  async generateSuggestions(
    userId: string,
    candidateGames: Game[],
    context: PredictiveContext
  ): Promise<PredictiveSuggestion[]> {
    const cacheKey = this.generateCacheKey(userId, context);
    const cached = this.predictionCache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached)) {
      return cached;
    }

    const behaviorPattern = this.behaviorPatterns.get(userId);
    if (!behaviorPattern) {
      return this.fallbackSuggestions(candidateGames, context);
    }

    const suggestions: PredictiveSuggestion[] = [];

    for (const game of candidateGames) {
      const suggestion = await this.evaluateGameForContext(game, context, behaviorPattern);
      if (suggestion.confidence > 0.3) {
        suggestions.push(suggestion);
      }
    }

    const sortedSuggestions = suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);

    this.predictionCache.set(cacheKey, sortedSuggestions);
    return sortedSuggestions;
  }

  /**
   * Analyze user behavior patterns
   */
  analyzeBehaviorPatterns(userId: string, sessions: GameSession[]): void {
    const pattern: BehaviorPattern = {
      userId,
      timePatterns: this.extractTimePatterns(sessions),
      sessionLengthPatterns: this.extractSessionLengthPatterns(sessions),
      genreSequences: this.extractGenreSequences(sessions),
      moodTransitions: this.extractMoodTransitions(sessions),
      devicePatterns: this.extractDevicePatterns(sessions)
    };

    this.behaviorPatterns.set(userId, pattern);
  }

  /**
   * Get predictive insights about user behavior
   */
  getPredictiveInsights(userId: string): PredictiveInsight[] {
    const pattern = this.behaviorPatterns.get(userId);
    if (!pattern) {
      return [];
    }

    const insights: PredictiveInsight[] = [];

    // Time-based insights
    const peakHours = this.findPeakGamingHours(pattern.timePatterns);
    if (peakHours.length > 0) {
      insights.push({
        type: 'pattern',
        title: 'Peak Gaming Time Detected',
        description: `You're most active around ${peakHours.join(' and ')} o'clock`,
        confidence: 0.8,
        actionable: true,
        suggestions: ['Schedule important gaming sessions during these times', 'Set reminders for game events']
      });
    }

    // Genre sequence insights
    const commonSequences = pattern.genreSequences
      .filter(seq => seq.frequency > 0.3)
      .slice(0, 3);
    
    if (commonSequences.length > 0) {
      insights.push({
        type: 'pattern',
        title: 'Gaming Flow Patterns',
        description: `You often follow specific genre sequences in your gaming sessions`,
        confidence: 0.7,
        actionable: true,
        suggestions: ['Embrace your natural gaming flow', 'Try games that fit these sequences']
      });
    }

    // Mood transition insights
    const positiveTransitions = pattern.moodTransitions
      .filter(t => this.isPositiveTransition(t.fromMood, t.toMood));
    
    if (positiveTransitions.length > 0) {
      insights.push({
        type: 'recommendation',
        title: 'Mood Enhancement Opportunities',
        description: 'Certain games help improve your mood during gaming',
        confidence: 0.6,
        actionable: true,
        suggestions: ['Keep these mood-boosting games accessible', 'Use them when feeling down']
      });
    }

    // Anomaly detection
    const anomalies = this.detectAnomalies(pattern);
    insights.push(...anomalies);

    return insights;
  }

  /**
   * Predict next likely game in sequence
   */
  predictNextGame(
    userId: string,
    recentSessions: GameSession[]
  ): {
    game: Game | null;
    confidence: number;
    reasoning: string;
  } {
    const pattern = this.behaviorPatterns.get(userId);
    if (!pattern || recentSessions.length === 0) {
      return {
        game: null,
        confidence: 0,
        reasoning: 'Insufficient data for prediction'
      };
    }

    const recentGenres = recentSessions.slice(0, 3).map(s => s.game.genres[0]?.id || '').filter(Boolean);
    const matchingSequences = pattern.genreSequences.filter(seq =>
      this.sequenceMatches(recentGenres, seq.sequence)
    );

    if (matchingSequences.length === 0) {
      return {
        game: null,
        confidence: 0,
        reasoning: 'No matching patterns found'
      };
    }

    const bestSequence = matchingSequences.sort((a, b) => b.frequency - a.frequency)[0];
    const nextGenre = bestSequence.commonNextGenres[0];

    return {
      game: null, // Would need game database to find actual game
      confidence: bestSequence.frequency,
      reasoning: `Based on your pattern of playing ${recentGenres.join(' → ')}`
    };
  }

  /**
   * Update behavior patterns with new session data
   */
  updateBehaviorPatterns(userId: string, newSession: GameSession): void {
    let pattern = this.behaviorPatterns.get(userId);
    if (!pattern) {
      pattern = {
        userId,
        timePatterns: [],
        sessionLengthPatterns: [],
        genreSequences: [],
        moodTransitions: [],
        devicePatterns: []
      };
      this.behaviorPatterns.set(userId, pattern);
    }

    // Update time patterns
    this.updateTimePatterns(pattern, newSession);
    
    // Update session length patterns
    this.updateSessionLengthPatterns(pattern, newSession);
    
    // Update genre sequences
    this.updateGenreSequences(pattern, newSession);
    
    // Update mood transitions
    this.updateMoodTransitions(pattern, newSession);
    
    // Update device patterns
    this.updateDevicePatterns(pattern, newSession);

    // Clear cache for this user
    this.clearUserCache(userId);
  }

  private async evaluateGameForContext(
    game: Game,
    context: PredictiveContext,
    pattern: BehaviorPattern
  ): Promise<PredictiveSuggestion> {
    const fitScore = {
      time: this.calculateTimeFit(game, context, pattern),
      mood: this.calculateMoodFit(game, context, pattern),
      energy: this.calculateEnergyFit(game, context, pattern),
      social: this.calculateSocialFit(game, context, pattern),
      sequence: this.calculateSequenceFit(game, context, pattern)
    };

    const confidence = Object.values(fitScore).reduce((sum, score) => sum + score, 0) / 5;
    const predictedSatisfaction = this.predictSatisfaction(game, context, pattern);
    const estimatedPlaytime = this.estimatePlaytime(game, pattern);

    return {
      game,
      confidence,
      reasoning: this.generateReasoning(game, context, fitScore),
      predictedSatisfaction,
      estimatedPlaytime,
      fitScore,
      alternatives: [] // Would be populated with similar games
    };
  }

  private calculateTimeFit(
    game: Game,
    context: PredictiveContext,
    pattern: BehaviorPattern
  ): number {
    const currentHour = context.currentTime.getHours();
    const currentDay = context.currentTime.getDay();
    
    const matchingPatterns = pattern.timePatterns.filter(p =>
      Math.abs(p.hour - currentHour) <= 2 && p.dayOfWeek === currentDay
    );

    if (matchingPatterns.length === 0) return 0.5;

    const genreMatch = matchingPatterns.some(p =>
      p.preferredGenres.some(genre => game.genres.some(g => g.id === genre))
    );

    return genreMatch ? 0.9 : 0.6;
  }

  private calculateMoodFit(
    game: Game,
    context: PredictiveContext,
    pattern: BehaviorPattern
  ): number {
    if (!context.currentMood) return 0.5;

    const moodTransitions = pattern.moodTransitions.filter(t =>
      t.fromMood === context.currentMood
    );

    if (moodTransitions.length === 0) return 0.5;

    const gameInTransitions = moodTransitions.some(t =>
      t.triggerGames.includes(game.id)
    );

    return gameInTransitions ? 0.9 : 0.4;
  }

  private calculateEnergyFit(
    game: Game,
    context: PredictiveContext,
    pattern: BehaviorPattern
  ): number {
    if (!context.energyLevel) return 0.5;

    const gameIntensity = this.estimateGameIntensity(game);
    const energyMatch = 1 - Math.abs(context.energyLevel / 100 - gameIntensity);

    return energyMatch;
  }

  private calculateSocialFit(
    game: Game,
    context: PredictiveContext,
    pattern: BehaviorPattern
  ): number {
    if (!context.socialContext) return 0.5;

    const gameSocialness = this.estimateGameSocialness(game);
    
    const socialFit = context.socialContext === 'solo' ? 
      1 - gameSocialness : gameSocialness;

    return socialFit;
  }

  private calculateSequenceFit(
    game: Game,
    context: PredictiveContext,
    pattern: BehaviorPattern
  ): number {
    const recentGenres = context.recentSessions
      .slice(0, 3)
      .map(s => s.game.genres[0]?.id || '')
      .filter(Boolean);

    if (recentGenres.length === 0) return 0.5;

    const matchingSequences = pattern.genreSequences.filter(seq =>
      this.sequenceMatches(recentGenres, seq.sequence)
    );

    if (matchingSequences.length === 0) return 0.3;

    const gameInSequence = matchingSequences.some(seq =>
      seq.commonNextGenres.includes(game.genres[0]?.id || '')
    );

    return gameInSequence ? 0.9 : 0.5;
  }

  private predictSatisfaction(
    game: Game,
    context: PredictiveContext,
    pattern: BehaviorPattern
  ): number {
    // Use ML recommendation engine for satisfaction prediction
    const mlScore = mlRecommendationEngine.predictRating(
      pattern.userId,
      game.id
    );

    // Adjust based on context
    let contextMultiplier = 1;
    
    if (context.availableTime) {
      const estimatedTime = this.estimatePlaytime(game, pattern);
      contextMultiplier *= Math.min(1, context.availableTime / estimatedTime);
    }

    return Math.min(1, mlScore * contextMultiplier);
  }

  private estimatePlaytime(game: Game, pattern: BehaviorPattern): number {
    const gameGenre = game.genres[0]?.id;
    if (!gameGenre) return 60; // Default 1 hour

    const genreSessions = pattern.sessionLengthPatterns.filter(p =>
      p.preferredGenres.includes(gameGenre)
    );

    if (genreSessions.length === 0) return 60;

    return genreSessions.reduce((sum, p) => sum + p.duration, 0) / genreSessions.length;
  }

  private estimateGameIntensity(game: Game): number {
    const intensityMap: Record<string, number> = {
      'action': 0.8,
      'racing': 0.7,
      'sports': 0.6,
      'rpg': 0.5,
      'strategy': 0.4,
      'adventure': 0.3,
      'puzzle': 0.2,
      'simulation': 0.3
    };

    const gameGenre = game.genres[0]?.id;
    return gameGenre ? (intensityMap[gameGenre] || 0.5) : 0.5;
  }

  private estimateGameSocialness(game: Game): number {
    const socialMap: Record<string, number> = {
      'sports': 0.9,
      'racing': 0.8,
      'action': 0.7,
      'rpg': 0.6,
      'strategy': 0.5,
      'adventure': 0.4,
      'puzzle': 0.2,
      'simulation': 0.3
    };

    const gameGenre = game.genres[0]?.id;
    return gameGenre ? (socialMap[gameGenre] || 0.5) : 0.5;
  }

  private generateReasoning(
    game: Game,
    context: PredictiveContext,
    fitScore: PredictiveSuggestion['fitScore']
  ): string[] {
    const reasoning = [];

    if (fitScore.time > 0.7) {
      reasoning.push('Perfect timing for this game');
    }
    if (fitScore.mood > 0.7) {
      reasoning.push('Matches your current mood');
    }
    if (fitScore.energy > 0.7) {
      reasoning.push('Energy level aligns with game intensity');
    }
    if (fitScore.social > 0.7) {
      reasoning.push('Fits your social context');
    }
    if (fitScore.sequence > 0.7) {
      reasoning.push('Follows your natural gaming flow');
    }

    return reasoning;
  }

  private fallbackSuggestions(
    candidateGames: Game[],
    context: PredictiveContext
  ): PredictiveSuggestion[] {
    return candidateGames.slice(0, 5).map(game => ({
      game,
      confidence: 0.5,
      reasoning: ['General recommendation'],
      predictedSatisfaction: 0.5,
      estimatedPlaytime: 60,
      fitScore: {
        time: 0.5,
        mood: 0.5,
        energy: 0.5,
        social: 0.5,
        sequence: 0.5
      },
      alternatives: []
    }));
  }

  private extractTimePatterns(sessions: GameSession[]): TimePattern[] {
    const patterns: TimePattern[] = [];
    
    for (const session of sessions) {
      const hour = session.startTime.getHours();
      const dayOfWeek = session.startTime.getDay();
      
      let existingPattern = patterns.find(p => p.hour === hour && p.dayOfWeek === dayOfWeek);
      
      if (!existingPattern) {
        existingPattern = {
          hour,
          dayOfWeek,
          preferredGenres: [],
          averageSessionLength: 0,
          likelihood: 0
        };
        patterns.push(existingPattern);
      }

      existingPattern.likelihood += 1 / sessions.length;
      existingPattern.averageSessionLength += (session.duration || 0) / sessions.length;
      
      const genre = session.game.genres[0]?.id;
      if (genre && !existingPattern.preferredGenres.includes(genre)) {
        existingPattern.preferredGenres.push(genre);
      }
    }

    return patterns;
  }

  private extractSessionLengthPatterns(sessions: GameSession[]): SessionLengthPattern[] {
    const patterns: SessionLengthPattern[] = [];
    
    for (const session of sessions) {
      const duration = session.duration || 60;
      const genre = session.game.genres[0]?.id;
      
      let existingPattern = patterns.find(p => 
        Math.abs(p.duration - duration) < 30 && p.mood === session.mood
      );
      
      if (!existingPattern) {
        existingPattern = {
          duration,
          preferredGenres: [],
          completionRate: 0,
          mood: session.mood
        };
        patterns.push(existingPattern);
      }

      if (genre && !existingPattern.preferredGenres.includes(genre)) {
        existingPattern.preferredGenres.push(genre);
      }
      
      existingPattern.completionRate += (session.completed ? 1 : 0) / sessions.length;
    }

    return patterns;
  }

  private extractGenreSequences(sessions: GameSession[]): GenreSequence[] {
    const sequences: GenreSequence[] = [];
    const maxSequenceLength = 3;
    
    for (let i = 0; i < sessions.length - maxSequenceLength; i++) {
      const sequence = sessions.slice(i, i + maxSequenceLength)
        .map(s => s.game.genres[0]?.id || '')
        .filter(Boolean);
      
      if (sequence.length < 2) continue;
      
      let existingSequence = sequences.find(seq =>
        this.sequenceMatches(sequence, seq.sequence)
      );
      
      if (!existingSequence) {
        existingSequence = {
          sequence,
          frequency: 0,
          averageTransitionTime: 0,
          commonNextGenres: []
        };
        sequences.push(existingSequence);
      }

      existingSequence.frequency += 1 / sessions.length;
      
      const nextSession = sessions[i + maxSequenceLength];
      if (nextSession) {
        const nextGenre = nextSession.game.genres[0]?.id;
        if (nextGenre && !existingSequence.commonNextGenres.includes(nextGenre)) {
          existingSequence.commonNextGenres.push(nextGenre);
        }
      }
    }

    return sequences;
  }

  private extractMoodTransitions(sessions: GameSession[]): MoodTransition[] {
    const transitions: MoodTransition[] = [];
    
    for (let i = 1; i < sessions.length; i++) {
      const prevSession = sessions[i - 1];
      const currSession = sessions[i];
      
      let existingTransition = transitions.find(t =>
        t.fromMood === prevSession.mood && t.toMood === currSession.mood
      );
      
      if (!existingTransition) {
        existingTransition = {
          fromMood: prevSession.mood,
          toMood: currSession.mood,
          triggerGames: [],
          averageTime: 0,
          probability: 0
        };
        transitions.push(existingTransition);
      }

      existingTransition.probability += 1 / sessions.length;
      
      if (!existingTransition.triggerGames.includes(currSession.gameId)) {
        existingTransition.triggerGames.push(currSession.gameId);
      }
      
      const timeDiff = (currSession.startTime.getTime() - (prevSession.endTime?.getTime() || 0)) / (1000 * 60);
      existingTransition.averageTime += timeDiff / sessions.length;
    }

    return transitions;
  }

  private extractDevicePatterns(sessions: GameSession[]): DevicePattern[] {
    const patterns: DevicePattern[] = [];
    
    for (const session of sessions) {
      const device = session.platform;
      
      let existingPattern = patterns.find(p => p.device === device);
      
      if (!existingPattern) {
        existingPattern = {
          device,
          preferredGenres: [],
          averageSessionLength: 0,
          timeOfDay: []
        };
        patterns.push(existingPattern);
      }

      existingPattern.averageSessionLength += (session.duration || 0) / sessions.length;
      existingPattern.timeOfDay.push(session.startTime.getHours());
      
      const genre = session.game.genres[0]?.id;
      if (genre && !existingPattern.preferredGenres.includes(genre)) {
        existingPattern.preferredGenres.push(genre);
      }
    }

    return patterns;
  }

  private sequenceMatches(recent: string[], sequence: string[]): boolean {
    if (recent.length < sequence.length) return false;
    
    for (let i = 0; i <= recent.length - sequence.length; i++) {
      let matches = true;
      for (let j = 0; j < sequence.length; j++) {
        if (recent[i + j] !== sequence[j]) {
          matches = false;
          break;
        }
      }
      if (matches) return true;
    }
    
    return false;
  }

  private isPositiveTransition(fromMood: string, toMood: string): boolean {
    const positiveMoods = ['energetic', 'focused', 'creative'];
    const negativeMoods = ['frustrated', 'bored', 'tired'];
    
    return negativeMoods.includes(fromMood) && positiveMoods.includes(toMood);
  }

  private findPeakGamingHours(patterns: TimePattern[]): number[] {
    const hourlyFrequency = new Array(24).fill(0);
    
    for (const pattern of patterns) {
      hourlyFrequency[pattern.hour] += pattern.likelihood;
    }
    
    const maxFrequency = Math.max(...hourlyFrequency);
    const threshold = maxFrequency * 0.7;
    
    return hourlyFrequency
      .map((freq, hour) => ({ hour, frequency: freq }))
      .filter(({ frequency }) => frequency >= threshold)
      .map(({ hour }) => hour);
  }

  private detectAnomalies(pattern: BehaviorPattern): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];
    
    // Detect unusual gaming times
    const unusualHours = pattern.timePatterns.filter(p => p.likelihood < 0.05);
    if (unusualHours.length > 0) {
      insights.push({
        type: 'anomaly',
        title: 'Unusual Gaming Pattern Detected',
        description: 'Some gaming sessions occur at unusual times',
        confidence: 0.6,
        actionable: false,
        suggestions: ['Monitor if this pattern continues', 'Consider if it affects sleep']
      });
    }
    
    return insights;
  }

  private updateTimePatterns(pattern: BehaviorPattern, newSession: GameSession): void {
    const hour = newSession.startTime.getHours();
    const dayOfWeek = newSession.startTime.getDay();
    
    let existingPattern = pattern.timePatterns.find(p => p.hour === hour && p.dayOfWeek === dayOfWeek);
    
    if (!existingPattern) {
      existingPattern = {
        hour,
        dayOfWeek,
        preferredGenres: [],
        averageSessionLength: 0,
        likelihood: 0
      };
      pattern.timePatterns.push(existingPattern);
    }

    existingPattern.likelihood = Math.min(1, existingPattern.likelihood + 0.01);
  }

  private updateSessionLengthPatterns(pattern: BehaviorPattern, newSession: GameSession): void {
    const duration = newSession.duration || 60;
    
    let existingPattern = pattern.sessionLengthPatterns.find(p =>
      Math.abs(p.duration - duration) < 30 && p.mood === newSession.mood
    );
    
    if (!existingPattern) {
      existingPattern = {
        duration,
        preferredGenres: [],
        completionRate: 0,
        mood: newSession.mood
      };
      pattern.sessionLengthPatterns.push(existingPattern);
    }
  }

  private updateGenreSequences(pattern: BehaviorPattern, newSession: GameSession): void {
    // Implementation for updating genre sequences with new session
    // This would involve finding and updating relevant sequences
  }

  private updateMoodTransitions(pattern: BehaviorPattern, newSession: GameSession): void {
    // Implementation for updating mood transitions with new session
    // This would involve finding and updating relevant transitions
  }

  private updateDevicePatterns(pattern: BehaviorPattern, newSession: GameSession): void {
    // Implementation for updating device patterns with new session
    // This would involve finding and updating relevant device patterns
  }

  private generateCacheKey(userId: string, context: PredictiveContext): string {
    return `${userId}-${context.currentTime.getTime()}-${context.currentMood || 'none'}-${context.device || 'none'}`;
  }

  private isCacheValid(cached: PredictiveSuggestion[]): boolean {
    return cached.length > 0; // Simplified - would check timestamp in real implementation
  }

  private clearUserCache(userId: string): void {
    const keysToDelete = [];
    for (const [key] of this.predictionCache) {
      if (key.startsWith(userId)) {
        keysToDelete.push(key);
      }
    }
    
    for (const key of keysToDelete) {
      this.predictionCache.delete(key);
    }
  }
}

// Singleton instance for the application
export const predictiveSuggestionEngine = new PredictiveSuggestionEngine();
