import { BehavioralSignal, NormalizedFeatures } from './types';
/**
 * Feature Extraction Module
 * Converts raw signals into normalized features for mood analysis
 */
export declare class FeatureExtractor {
    private readonly featureWeights;
    /**
     * Extract normalized features from behavioral signals
     */
    extractFeatures(signals: BehavioralSignal[]): NormalizedFeatures;
    /**
     * Calculate engagement volatility based on session patterns
     */
    private calculateEngagementVolatility;
    /**
     * Calculate challenge seeking preference
     */
    private calculateChallengeSeeking;
    /**
     * Calculate social openness from session and integration signals
     */
    private calculateSocialOpenness;
    /**
     * Calculate exploration bias from genre and platform signals
     */
    private calculateExplorationBias;
    /**
     * Calculate focus stability from session and playtime patterns
     */
    private calculateFocusStability;
    /**
     * Get default features when no signals are available
     */
    private getDefaultFeatures;
    /**
     * Get feature importance weights
     */
    getFeatureWeights(): NormalizedFeatures;
    /**
     * Calculate feature confidence based on signal quality and quantity
     */
    calculateFeatureConfidence(signals: BehavioralSignal[]): {
        overall: number;
        byFeature: Record<keyof NormalizedFeatures, number>;
    };
    /**
     * Validate extracted features
     */
    validateFeatures(features: NormalizedFeatures): {
        isValid: boolean;
        issues: string[];
    };
}
//# sourceMappingURL=featureExtraction.d.ts.map