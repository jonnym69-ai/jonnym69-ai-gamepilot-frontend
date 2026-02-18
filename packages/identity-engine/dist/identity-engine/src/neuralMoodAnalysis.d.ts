import { GameSession } from './types';
/**
 * Neural Mood Analysis System
 * Uses neural network patterns to analyze and predict user moods from gaming behavior
 */
export interface MoodPattern {
    moodId: string;
    confidence: number;
    triggers: string[];
    timePatterns: TimePattern[];
    gameAssociations: string[];
    intensity: number;
}
export interface TimePattern {
    hour: number;
    dayOfWeek: number;
    likelihood: number;
}
export interface MoodTransition {
    fromMood: string;
    toMood: string;
    probability: number;
    commonTriggers: string[];
    averageTransitionTime: number;
}
export interface NeuralMoodConfig {
    learningRate: number;
    momentum: number;
    hiddenLayers: number[];
    activationFunction: 'relu' | 'sigmoid' | 'tanh';
    batchSize: number;
    epochs: number;
}
export interface MoodPrediction {
    predictedMood: string;
    confidence: number;
    factors: {
        timeOfDay: number;
        recentGames: number;
        sessionLength: number;
        dayOfWeek: number;
    };
    reasoning: string[];
}
export declare class NeuralMoodAnalyzer {
    private config;
    private moodPatterns;
    private transitions;
    private neuralWeights;
    private isTrained;
    constructor(config?: NeuralMoodConfig);
    /**
     * Analyze gaming sessions to extract mood patterns
     */
    analyzeSessions(sessions: GameSession[]): Promise<void>;
    /**
     * Predict current mood based on recent activity
     */
    predictCurrentMood(recentSessions: GameSession[], currentTime?: Date): MoodPrediction;
    /**
     * Get mood recommendations based on current state
     */
    getMoodRecommendations(currentMood: string, targetMood?: string): {
        suggestedGames: string[];
        activities: string[];
        transitionPath?: string[];
    };
    /**
     * Update mood patterns with new session data
     */
    updatePatterns(newSession: GameSession): void;
    /**
     * Get mood insights and analytics
     */
    getMoodInsights(): {
        totalPatterns: number;
        mostCommonMood: string;
        moodStability: number;
        peakTimes: {
            mood: string;
            hour: number;
        }[];
        recommendations: string[];
    };
    private initializeNeuralNetwork;
    private extractMoodPatterns;
    private analyzeTransitions;
    private trainNeuralNetwork;
    private prepareTrainingData;
    private extractFeatures;
    private createOutputVector;
    private forwardPass;
    private activate;
    private softmax;
    private argmax;
    private hashGameId;
    private createMoodPattern;
    private extractTimePatterns;
    private updateTimePattern;
    private fallbackPrediction;
    private calculateFeatureContributions;
    private generateReasoning;
    private getMoodActivities;
    private findOptimalTransition;
    private findTransitionPath;
    private calculateMoodStability;
    private calculatePeakTimes;
    private generateInsightRecommendations;
    private createBatches;
    private processBatch;
}
export declare const neuralMoodAnalyzer: NeuralMoodAnalyzer;
