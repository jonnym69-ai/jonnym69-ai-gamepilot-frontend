/**
 * Free AI Components for GamePilot 1.0
 * Uses only free, open-source libraries (MIT/Apache/BSD)
 * No paid APIs, external LLMs, or cloud services
 */
import type { GameSession, PlayerIdentity, RecommendationContext } from './types';
import { type MoodId, type GenreId } from '@gamepilot/static-data';
export interface MoodAnalysisResult {
    mood: MoodId;
    confidence: number;
    intensity: number;
    triggers: string[];
    reasoning: string;
}
export declare class FreeMoodEngine {
    private moodKeywords;
    private sessionMoodWeights;
    /**
     * Analyze mood from gaming sessions using rule-based classification
     */
    analyzeMood(sessions: GameSession[]): MoodAnalysisResult;
    /**
     * Calculate mood score for a single session
     */
    private calculateSessionMoodScore;
    /**
     * Get mood triggers from session data
     */
    private getSessionMoodTriggers;
    /**
     * Generate reasoning for mood analysis
     */
    private generateMoodReasoning;
}
export interface GameVector {
    id: string;
    name: string;
    vector: number[];
    genres: GenreId[];
    tags: string[];
    difficulty: number;
    socialScore: number;
    estimatedPlaytime: number;
}
export interface RecommendationResult {
    gameId: string;
    name: string;
    score: number;
    reasons: string[];
    moodMatch: number;
    playstyleMatch: number;
    socialMatch: number;
    estimatedPlaytime: number;
    difficulty: string;
    tags: string[];
}
export declare class FreeRecommendationEngine {
    private moodVectors;
    private genreVectors;
    /**
     * Get recommendations using cosine similarity
     */
    getRecommendations(identity: PlayerIdentity, context: RecommendationContext, availableGames: any[]): RecommendationResult[];
    /**
     * Generate mood vectors for similarity calculations
     */
    private generateMoodVectors;
    /**
     * Generate genre vectors for similarity calculations
     */
    private generateGenreVectors;
    /**
     * Create user vector based on identity and context
     */
    private createUserVector;
    /**
     * Create game vector for similarity calculations
     */
    private createGameVector;
    /**
     * Calculate cosine similarity between two vectors
     */
    private calculateCosineSimilarity;
    /**
     * Combine multiple genre vectors
     */
    private combineGenreVectors;
    /**
     * Create tag vector
     */
    private createTagVector;
    /**
     * Create playstyle vector
     */
    private createPlaystyleVector;
    /**
     * Create preference vector
     */
    private createPreferenceVector;
    /**
     * Generate reasons for recommendations
     */
    private generateReasons;
    /**
     * Calculate mood match
     */
    private calculateMoodMatch;
    /**
     * Calculate playstyle match
     */
    private calculatePlaystyleMatch;
    /**
     * Calculate social match
     */
    private calculateSocialMatch;
}
export interface VectorSearchResult {
    id: string;
    score: number;
    metadata: any;
}
export declare class FreeVectorSearch {
    private vectors;
    private metadata;
    /**
     * Add vector to search index
     */
    addVector(id: string, vector: number[], metadata: any): void;
    /**
     * Search for similar vectors
     */
    search(queryVector: number[], topK?: number): VectorSearchResult[];
    /**
     * Calculate cosine similarity
     */
    private calculateCosineSimilarity;
    /**
     * Remove vector from index
     */
    removeVector(id: string): void;
    /**
     * Get vector count
     */
    size(): number;
    /**
     * Clear all vectors
     */
    clear(): void;
}
export interface MoodRecommendationMapping {
    mood: MoodId;
    recommendedGenres: GenreId[];
    recommendedTags: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    socialPreference: boolean;
    reasoning: string;
}
export declare class MoodRecommendationMapper {
    private mappings;
    /**
     * Get mood-based recommendation mapping
     */
    getMapping(mood: MoodId): MoodRecommendationMapping;
    /**
     * Filter games based on mood mapping
     */
    filterGamesByMood(games: any[], mood: MoodId): any[];
    /**
     * Get mood-based game recommendations
     */
    getMoodRecommendations(games: any[], mood: MoodId, limit?: number): any[];
}
export interface SessionAnalysis {
    totalSessions: number;
    totalPlaytime: number;
    averageSessionLength: number;
    preferredGenres: Map<GenreId, number>;
    moodPatterns: Map<MoodId, number>;
    difficultyPreference: number;
    socialPreference: number;
    completionRate: number;
    peakGamingTimes: number[];
    recommendations: string[];
}
export declare class SessionAnalyzer {
    private moodEngine;
    private recommendationMapper;
    constructor();
    /**
     * Analyze gaming sessions and provide insights
     */
    analyzeSessions(sessions: GameSession[]): SessionAnalysis;
    /**
     * Create empty analysis for no data
     */
    private createEmptyAnalysis;
    /**
     * Calculate preferred genres from sessions
     */
    private calculatePreferredGenres;
    /**
     * Calculate mood patterns from sessions
     */
    private calculateMoodPatterns;
    /**
     * Calculate difficulty preference
     */
    private calculateDifficultyPreference;
    /**
     * Calculate social preference
     */
    private calculateSocialPreference;
    /**
     * Calculate completion rate
     */
    private calculateCompletionRate;
    /**
     * Calculate peak gaming times
     */
    private calculatePeakGamingTimes;
    /**
     * Generate recommendations based on analysis
     */
    private generateRecommendations;
}
export declare class FreeAIEngine {
    private moodEngine;
    private recommendationEngine;
    private vectorSearch;
    private moodMapper;
    private sessionAnalyzer;
    constructor();
    /**
     * Analyze mood from sessions
     */
    analyzeMood(sessions: GameSession[]): MoodAnalysisResult;
    /**
     * Get game recommendations
     */
    getRecommendations(identity: PlayerIdentity, context: RecommendationContext, availableGames: any[]): RecommendationResult[];
    /**
     * Search for similar games
     */
    searchSimilarGames(gameVector: number[], topK?: number): VectorSearchResult[];
    /**
     * Get mood-based recommendations
     */
    getMoodRecommendations(games: any[], mood: MoodId, limit?: number): any[];
    /**
     * Analyze gaming sessions
     */
    analyzeSessions(sessions: GameSession[]): SessionAnalysis;
    /**
     * Add game to vector search index
     */
    indexGame(id: string, vector: number[], metadata: any): void;
    /**
     * Get mood mapping
     */
    getMoodMapping(mood: MoodId): MoodRecommendationMapping;
}
