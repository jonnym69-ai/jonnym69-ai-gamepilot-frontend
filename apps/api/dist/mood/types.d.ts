/**
 * Mood Vector Types
 * Defines the structure for mood analysis vectors and related interfaces
 */
export interface MoodVector {
    calm: number;
    competitive: number;
    curious: number;
    social: number;
    focused: number;
}
export interface BehavioralSignal {
    timestamp: Date;
    source: 'session' | 'genre' | 'playtime' | 'platform' | 'integration';
    data: Record<string, any>;
    weight: number;
}
export interface NormalizedFeatures {
    engagementVolatility: number;
    challengeSeeking: number;
    socialOpenness: number;
    explorationBias: number;
    focusStability: number;
}
export interface MoodInferenceWeights {
    engagementVolatility: number;
    challengeSeeking: number;
    socialOpenness: number;
    explorationBias: number;
    focusStability: number;
}
export interface MoodAnalysisResult {
    moodVector: MoodVector;
    confidence: number;
    signalCount: number;
    lastUpdated: Date;
    features: NormalizedFeatures;
}
//# sourceMappingURL=types.d.ts.map