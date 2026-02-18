/**
 * Mood Vector Types
 * Defines the structure for mood analysis vectors and related interfaces
 */

export interface MoodVector {
  calm: number;      // 0-1: Relaxed, peaceful state
  competitive: number; // 0-1: Competitive, achievement-oriented
  curious: number;    // 0-1: Exploratory, discovery-oriented
  social: number;      // 0-1: Social, community-oriented
  focused: number;     // 0-1: Focused, concentrated state
}

export interface BehavioralSignal {
  timestamp: Date;
  source: 'session' | 'genre' | 'playtime' | 'platform' | 'integration';
  data: Record<string, any>;
  weight: number; // 0-1: Importance of this signal
}

export interface NormalizedFeatures {
  engagementVolatility: number;    // 0-1: How much engagement varies
  challengeSeeking: number;        // 0-1: Preference for difficult content
  socialOpenness: number;          // 0-1: Tendency toward social gaming
  explorationBias: number;          // 0-1: Preference for new experiences
  focusStability: number;          // 0-1: Consistency of focus
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
  confidence: number;    // 0-1: Confidence in the analysis
  signalCount: number;   // Number of signals used
  lastUpdated: Date;
  features: NormalizedFeatures;
}
