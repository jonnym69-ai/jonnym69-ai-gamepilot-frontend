import { MoodVector, NormalizedFeatures, MoodInferenceWeights } from './types';
/**
 * Mood Inference Module
 * Uses weighted heuristics to infer mood vectors from normalized features
 */
export declare class MoodInference {
    private readonly defaultWeights;
    private readonly moodMappings;
    /**
     * Infer mood vector from normalized features using weighted heuristics
     */
    inferMood(features: NormalizedFeatures, customWeights?: Partial<MoodInferenceWeights>): MoodVector;
    /**
     * Get confidence level for the mood inference
     */
    getInferenceConfidence(features: NormalizedFeatures, moodVector: MoodVector): number;
    /**
     * Get dominant mood from mood vector
     */
    getDominantMood(moodVector: MoodVector): {
        mood: keyof MoodVector;
        confidence: number;
        secondaryMood?: keyof MoodVector;
        secondaryConfidence?: number;
    };
    /**
     * Get mood description based on mood vector
     */
    getMoodDescription(moodVector: MoodVector): {
        primary: string;
        description: string;
        traits: string[];
        recommendations: string[];
    };
    /**
     * Adjust mood inference weights based on user feedback
     */
    adjustWeights(currentWeights: MoodInferenceWeights, feedback: {
        predictedMood: keyof MoodVector;
        actualMood: keyof MoodVector;
        confidence: number;
    }): MoodInferenceWeights;
    /**
     * Sigmoid activation function for normalization
     */
    private sigmoid;
    /**
     * Calculate mood ambiguity (how mixed the mood signals are)
     */
    private calculateMoodAmbiguity;
    /**
     * Calculate feature consistency (how stable the input features are)
     */
    private calculateFeatureConsistency;
    /**
     * Get current inference weights
     */
    getCurrentWeights(): MoodInferenceWeights;
    /**
     * Validate mood vector
     */
    validateMoodVector(moodVector: MoodVector): {
        isValid: boolean;
        issues: string[];
    };
}
//# sourceMappingURL=moodInference.d.ts.map