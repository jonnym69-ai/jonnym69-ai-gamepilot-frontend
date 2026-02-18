import { Game } from '@gamepilot/types';
import { GameSession, GameRecommendation } from './types';
/**
 * Machine Learning Recommendation Engine
 * Uses collaborative filtering and content-based filtering for advanced recommendations
 */
export interface MLModelConfig {
    collaborativeWeight: number;
    contentBasedWeight: number;
    moodWeight: number;
    playstyleWeight: number;
    minDataPoints: number;
}
export interface UserBehaviorProfile {
    userId: string;
    totalPlaytime: number;
    averageSessionLength: number;
    preferredGenres: Map<string, number>;
    moodPatterns: Map<string, number>;
    difficultyPreference: number;
    socialPreference: number;
    completionRate: number;
    lastActive: Date;
}
export interface GameFeatureVector {
    gameId: string;
    genreVector: number[];
    moodVector: number[];
    difficultyScore: number;
    socialScore: number;
    playtimeEstimate: number;
    popularityScore: number;
    criticScore: number;
    userScore: number;
}
export declare class MLRecommendationEngine {
    private config;
    private userProfiles;
    private gameFeatures;
    private userGameMatrix;
    constructor(config?: MLModelConfig);
    /**
     * Initialize the ML engine with game data and user history
     */
    initialize(games: Game[], userSessions: GameSession[]): Promise<void>;
    /**
     * Generate personalized recommendations using ML models
     */
    generateRecommendations(userId: string, candidateGames: Game[], count?: number): Promise<GameRecommendation[]>;
    /**
     * Update user profile with new gaming session data
     */
    updateUserProfile(userId: string, session: GameSession): void;
    /**
     * Predict user rating for a game they haven't played
     */
    predictRating(userId: string, gameId: string): number;
    private buildGameFeatures;
    private buildUserProfiles;
    private buildUserGameMatrix;
    private calculateCollaborativeScore;
    private calculateUserSimilarity;
    private calculateContentBasedScore;
    private calculateMoodScore;
    private calculatePlaystyleScore;
    private generateRecommendationReason;
    private fallbackRecommendations;
    private createDefaultProfile;
    private encodeGenres;
    private calculateMoodVector;
    private estimateDifficulty;
    private estimateSocialScore;
    private calculateMean;
    private calculateSocialScore;
    private getDifficultyLevel;
}
export declare const mlRecommendationEngine: MLRecommendationEngine;
