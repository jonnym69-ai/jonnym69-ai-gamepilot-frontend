import { Game, Genre, Recommendation } from '@gamepilot/types';
import { GENRES, MOODS } from '@gamepilot/static-data';
import { GameSession, PlayerIdentity, UserMood, GameRecommendation } from './types';

/**
 * Machine Learning Recommendation Engine
 * Uses collaborative filtering and content-based filtering for advanced recommendations
 */

export interface MLModelConfig {
  collaborativeWeight: number; // Weight for collaborative filtering
  contentBasedWeight: number; // Weight for content-based filtering
  moodWeight: number; // Weight for mood-based recommendations
  playstyleWeight: number; // Weight for playstyle-based recommendations
  minDataPoints: number; // Minimum data points for reliable predictions
}

export interface UserBehaviorProfile {
  userId: string;
  totalPlaytime: number;
  averageSessionLength: number;
  preferredGenres: Map<string, number>;
  moodPatterns: Map<string, number>;
  difficultyPreference: number; // 0-1 scale
  socialPreference: number; // 0-1 scale
  completionRate: number; // 0-1 scale
  lastActive: Date;
}

export interface GameFeatureVector {
  gameId: string;
  genreVector: number[]; // One-hot encoded genres
  moodVector: number[]; // Mood compatibility scores
  difficultyScore: number;
  socialScore: number;
  playtimeEstimate: number;
  popularityScore: number;
  criticScore: number;
  userScore: number;
}

export class MLRecommendationEngine {
  private config: MLModelConfig;
  private userProfiles: Map<string, UserBehaviorProfile> = new Map();
  private gameFeatures: Map<string, GameFeatureVector> = new Map();
  private userGameMatrix: Map<string, Map<string, number>> = new Map();

  constructor(config: MLModelConfig = {
    collaborativeWeight: 0.4,
    contentBasedWeight: 0.3,
    moodWeight: 0.2,
    playstyleWeight: 0.1,
    minDataPoints: 5
  }) {
    this.config = config;
  }

  /**
   * Initialize the ML engine with game data and user history
   */
  async initialize(games: Game[], userSessions: GameSession[]): Promise<void> {
    this.buildGameFeatures(games);
    this.buildUserProfiles(userSessions);
    this.buildUserGameMatrix(userSessions);
  }

  /**
   * Generate personalized recommendations using ML models
   */
  async generateRecommendations(
    userId: string,
    candidateGames: Game[],
    count: number = 10
  ): Promise<GameRecommendation[]> {
    const userProfile = this.userProfiles.get(userId);
    if (!userProfile || userProfile.totalPlaytime < this.config.minDataPoints) {
      // Fallback to rule-based recommendations for new users
      return this.fallbackRecommendations(candidateGames, count);
    }

    const recommendations: GameRecommendation[] = [];

    for (const game of candidateGames) {
      const gameFeature = this.gameFeatures.get(game.id);
      if (!gameFeature) continue;

      const collaborativeScore = this.calculateCollaborativeScore(userId, game.id);
      const contentBasedScore = this.calculateContentBasedScore(userProfile, gameFeature);
      const moodScore = this.calculateMoodScore(userProfile, gameFeature);
      const playstyleScore = this.calculatePlaystyleScore(userProfile, gameFeature);

      // Weighted combination of different recommendation strategies
      const finalScore = 
        collaborativeScore * this.config.collaborativeWeight +
        contentBasedScore * this.config.contentBasedWeight +
        moodScore * this.config.moodWeight +
        playstyleScore * this.config.playstyleWeight;

      recommendations.push({
        gameId: game.id,
        name: game.title,
        genre: game.genres[0]?.name || 'Unknown',
        score: finalScore,
        reasons: [this.generateRecommendationReason(
          collaborativeScore,
          contentBasedScore,
          moodScore,
          playstyleScore,
          game
        )],
        moodMatch: moodScore,
        playstyleMatch: playstyleScore,
        socialMatch: this.calculateSocialScore(userProfile, gameFeature),
        estimatedPlaytime: gameFeature.playtimeEstimate,
        difficulty: this.getDifficultyLevel(gameFeature.difficultyScore),
        tags: game.tags || []
      });
    }

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }

  /**
   * Update user profile with new gaming session data
   */
  updateUserProfile(userId: string, session: GameSession): void {
    let profile = this.userProfiles.get(userId);
    if (!profile) {
      profile = this.createDefaultProfile(userId);
      this.userProfiles.set(userId, profile);
    }

    // Update playtime metrics
    profile.totalPlaytime += session.duration || 0;
    profile.averageSessionLength = 
      (profile.averageSessionLength + (session.duration || 0)) / 2;

    // Update genre preferences
    if (session.game.genres) {
      for (const genre of session.game.genres) {
        const current = profile.preferredGenres.get(genre.id) || 0;
        profile.preferredGenres.set(genre.id, current + (session.duration || 0));
      }
    }

    // Update mood patterns
    if (session.mood && session.duration) {
      const current = profile.moodPatterns.get(session.mood) || 0;
      profile.moodPatterns.set(session.mood, current + session.duration);
    }

    // Update user-game matrix
    const userRatings = this.userGameMatrix.get(userId) || new Map();
    userRatings.set(session.game.id, session.rating || 0.5);
    this.userGameMatrix.set(userId, userRatings);

    profile.lastActive = new Date();
  }

  /**
   * Predict user rating for a game they haven't played
   */
  predictRating(userId: string, gameId: string): number {
    const userProfile = this.userProfiles.get(userId);
    const gameFeature = this.gameFeatures.get(gameId);
    
    if (!userProfile || !gameFeature) {
      return 0.5; // Neutral rating
    }

    const contentBasedScore = this.calculateContentBasedScore(userProfile, gameFeature);
    const moodScore = this.calculateMoodScore(userProfile, gameFeature);
    const playstyleScore = this.calculatePlaystyleScore(userProfile, gameFeature);

    return Math.min(1, Math.max(0, 
      contentBasedScore * 0.4 + moodScore * 0.3 + playstyleScore * 0.3
    ));
  }

  private buildGameFeatures(games: Game[]): void {
    for (const game of games) {
      const featureVector: GameFeatureVector = {
        gameId: game.id,
        genreVector: this.encodeGenres(game.genres || []),
        moodVector: this.calculateMoodVector(game),
        difficultyScore: this.estimateDifficulty(game),
        socialScore: this.estimateSocialScore(game),
        playtimeEstimate: (game as any).averagePlaytime || 0,
        popularityScore: (game as any).popularity || 0,
        criticScore: (game as any).criticScore || 0,
        userScore: (game as any).userScore || 0
      };
      this.gameFeatures.set(game.id, featureVector);
    }
  }

  private buildUserProfiles(sessions: GameSession[]): void {
    const userSessions = new Map<string, GameSession[]>();
    
    for (const session of sessions) {
      const userId = session.userId || 'default';
      const userSessionList = userSessions.get(userId) || [];
      userSessionList.push(session);
      userSessions.set(userId, userSessionList);
    }

    for (const [userId, userSessionList] of userSessions) {
      const profile = this.createDefaultProfile(userId);
      
      for (const session of userSessionList) {
        profile.totalPlaytime += session.duration || 0;
        
        if (session.game.genres) {
          for (const genre of session.game.genres) {
            const current = profile.preferredGenres.get(genre.id) || 0;
            profile.preferredGenres.set(genre.id, current + (session.duration || 0));
          }
        }

        if (session.mood) {
          const current = profile.moodPatterns.get(session.mood) || 0;
          profile.moodPatterns.set(session.mood, current + (session.duration || 0));
        }
      }

      if (userSessionList.length > 0) {
        profile.averageSessionLength = 
          userSessionList.reduce((sum, s) => sum + (s.duration || 0), 0) / userSessionList.length;
      }

      this.userProfiles.set(userId, profile);
    }
  }

  private buildUserGameMatrix(sessions: GameSession[]): void {
    for (const session of sessions) {
      const userId = session.userId || 'default';
      const userRatings = this.userGameMatrix.get(userId) || new Map();
      userRatings.set(session.game.id, session.rating || 0.5);
      this.userGameMatrix.set(userId, userRatings);
    }
  }

  private calculateCollaborativeScore(userId: string, gameId: string): number {
    const userRatings = this.userGameMatrix.get(userId);
    if (!userRatings) return 0;

    // Find similar users who rated this game
    let weightedSum = 0;
    let similaritySum = 0;

    for (const [otherUserId, otherRatings] of this.userGameMatrix) {
      if (otherUserId === userId) continue;
      
      const otherRating = otherRatings.get(gameId);
      if (!otherRating) continue;

      const similarity = this.calculateUserSimilarity(userId, otherUserId);
      weightedSum += similarity * otherRating;
      similaritySum += Math.abs(similarity);
    }

    return similaritySum > 0 ? weightedSum / similaritySum : 0;
  }

  private calculateUserSimilarity(userId1: string, userId2: string): number {
    const ratings1 = this.userGameMatrix.get(userId1) || new Map();
    const ratings2 = this.userGameMatrix.get(userId2) || new Map();

    const commonGames = Array.from(ratings1.keys()).filter(gameId => 
      ratings2.has(gameId)
    );

    if (commonGames.length === 0) return 0;

    // Pearson correlation coefficient
    const mean1 = this.calculateMean(ratings1, commonGames);
    const mean2 = this.calculateMean(ratings2, commonGames);

    let numerator = 0;
    let denominator1 = 0;
    let denominator2 = 0;

    for (const gameId of commonGames) {
      const diff1 = (ratings1.get(gameId) || 0) - mean1;
      const diff2 = (ratings2.get(gameId) || 0) - mean2;
      
      numerator += diff1 * diff2;
      denominator1 += diff1 * diff1;
      denominator2 += diff2 * diff2;
    }

    const denominator = Math.sqrt(denominator1 * denominator2);
    return denominator > 0 ? numerator / denominator : 0;
  }

  private calculateContentBasedScore(
    profile: UserBehaviorProfile, 
    gameFeature: GameFeatureVector
  ): number {
    let score = 0;
    let totalWeight = 0;

    // Genre compatibility
    for (const [genre, preference] of profile.preferredGenres) {
      const genreIndex = GENRES.findIndex(g => g.id === genre);
      if (genreIndex >= 0 && genreIndex < gameFeature.genreVector.length) {
        score += gameFeature.genreVector[genreIndex] * preference;
        totalWeight += preference;
      }
    }

    return totalWeight > 0 ? score / totalWeight : 0;
  }

  private calculateMoodScore(
    profile: UserBehaviorProfile, 
    gameFeature: GameFeatureVector
  ): number {
    let score = 0;
    let totalWeight = 0;

    for (const [mood, preference] of profile.moodPatterns) {
      const moodIndex = MOODS.findIndex(m => m.id === mood);
      if (moodIndex >= 0 && moodIndex < gameFeature.moodVector.length) {
        score += gameFeature.moodVector[moodIndex] * preference;
        totalWeight += preference;
      }
    }

    return totalWeight > 0 ? score / totalWeight : 0;
  }

  private calculatePlaystyleScore(
    profile: UserBehaviorProfile, 
    gameFeature: GameFeatureVector
  ): number {
    // Match difficulty preference
    const difficultyMatch = 1 - Math.abs(profile.difficultyPreference - gameFeature.difficultyScore);
    
    // Match social preference
    const socialMatch = 1 - Math.abs(profile.socialPreference - gameFeature.socialScore);

    return (difficultyMatch + socialMatch) / 2;
  }

  private generateRecommendationReason(
    collaborativeScore: number,
    contentBasedScore: number,
    moodScore: number,
    playstyleScore: number,
    game: Game
  ): string {
    const reasons = [];
    
    if (collaborativeScore > 0.7) {
      reasons.push("Players with similar tastes loved this game");
    }
    if (contentBasedScore > 0.7) {
      reasons.push("Matches your favorite genres");
    }
    if (moodScore > 0.7) {
      reasons.push("Perfect for your current mood");
    }
    if (playstyleScore > 0.7) {
      reasons.push("Fits your playstyle perfectly");
    }

    return reasons.length > 0 ? reasons.join(". ") : "Recommended for you";
  }

  private fallbackRecommendations(games: Game[], count: number): GameRecommendation[] {
    return games
      .slice(0, count)
      .map(game => ({
        gameId: game.id,
        name: game.title,
        genre: game.genres[0]?.name || 'Unknown',
        score: Math.random() * 0.5 + 0.5, // Random score between 0.5 and 1.0
        reasons: ["Popular game you might enjoy"],
        moodMatch: 0.5,
        playstyleMatch: 0.5,
        socialMatch: 0.5,
        estimatedPlaytime: 0,
        difficulty: 'Medium',
        tags: game.tags || []
      }));
  }

  private createDefaultProfile(userId: string): UserBehaviorProfile {
    return {
      userId,
      totalPlaytime: 0,
      averageSessionLength: 0,
      preferredGenres: new Map(),
      moodPatterns: new Map(),
      difficultyPreference: 0.5,
      socialPreference: 0.5,
      completionRate: 0.5,
      lastActive: new Date()
    };
  }

  private encodeGenres(genres: Genre[]): number[] {
    const vector = new Array(GENRES.length).fill(0);
    for (const genre of genres) {
      const index = GENRES.findIndex(g => g.id === genre.id);
      if (index >= 0) {
        vector[index] = 1;
      }
    }
    return vector;
  }

  private calculateMoodVector(game: Game): number[] {
    const vector = new Array(MOODS.length).fill(0);
    
    // Simple mood mapping based on game properties
    if (game.genres) {
      for (const genre of game.genres) {
        // This would be enhanced with actual mood mapping logic
        const moodMappings: Record<string, number[]> = {
          'action': [0.8, 0.2, 0.1, 0.3, 0.6, 0.1, 0.2, 0.1],
          'adventure': [0.3, 0.7, 0.4, 0.8, 0.2, 0.3, 0.5, 0.2],
          'rpg': [0.2, 0.8, 0.3, 0.9, 0.1, 0.4, 0.7, 0.3],
          'strategy': [0.1, 0.3, 0.8, 0.4, 0.2, 0.9, 0.3, 0.2],
          'puzzle': [0.1, 0.2, 0.9, 0.3, 0.1, 0.7, 0.2, 0.1],
          'simulation': [0.2, 0.4, 0.6, 0.5, 0.3, 0.5, 0.4, 0.2],
          'sports': [0.7, 0.3, 0.2, 0.4, 0.8, 0.2, 0.3, 0.1],
          'racing': [0.8, 0.2, 0.1, 0.3, 0.7, 0.1, 0.2, 0.1]
        };

        for (const genre of game.genres) {
          const mapping = moodMappings[genre.id.toLowerCase()];
          if (mapping) {
            for (let i = 0; i < Math.min(mapping.length, vector.length); i++) {
              vector[i] = Math.max(vector[i], mapping[i]);
            }
          }
        }
      }
    }

    return vector;
  }

  private estimateDifficulty(game: Game): number {
    // Simple difficulty estimation based on game properties
    let difficulty = 0.5;
    
    if (game.genres) {
      const difficultyMap: Record<string, number> = {
        'action': 0.6,
        'adventure': 0.4,
        'rpg': 0.7,
        'strategy': 0.8,
        'puzzle': 0.9,
        'simulation': 0.5,
        'sports': 0.4,
        'racing': 0.5
      };

      for (const genre of game.genres) {
        const genreDifficulty = difficultyMap[genre.id.toLowerCase()];
        if (genreDifficulty) {
          difficulty = Math.max(difficulty, genreDifficulty);
        }
      }
    }

    return difficulty;
  }

  private estimateSocialScore(game: Game): number {
    // Estimate social nature of the game
    let socialScore = 0.3;
    
    if (game.genres) {
      const socialMap: Record<string, number> = {
        'action': 0.7,
        'adventure': 0.4,
        'rpg': 0.8,
        'strategy': 0.6,
        'puzzle': 0.2,
        'simulation': 0.3,
        'sports': 0.9,
        'racing': 0.6
      };

      for (const genre of game.genres) {
        const genreSocial = socialMap[genre.id.toLowerCase()];
        if (genreSocial) {
          socialScore = Math.max(socialScore, genreSocial);
        }
      }
    }

    return socialScore;
  }

  private calculateMean(ratings: Map<string, number>, keys: string[]): number {
    const values = keys.map(key => ratings.get(key) || 0);
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateSocialScore(profile: UserBehaviorProfile, gameFeature: GameFeatureVector): number {
    return gameFeature.socialScore;
  }

  private getDifficultyLevel(score: number): string {
    if (score < 0.3) return 'Easy';
    if (score < 0.7) return 'Medium';
    return 'Hard';
  }
}

// Singleton instance for the application
export const mlRecommendationEngine = new MLRecommendationEngine();
