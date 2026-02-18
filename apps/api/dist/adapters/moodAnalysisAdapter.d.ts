import type { User } from '@gamepilot/shared/models/user';
import type { MoodVector, BehavioralSignal, NormalizedFeatures } from '../mood/types';
import type { PlayHistory, Game, Activity } from '@gamepilot/types';
/**
 * Adapter for converting canonical User data to mood analysis compatible formats
 * Provides non-destructive migration path for mood analysis services
 */
export declare class MoodAnalysisAdapter {
    /**
     * Convert canonical User gaming profile to MoodVector
     * Used when mood analysis needs user's current mood state
     */
    static userToMoodVector(user: User): MoodVector;
    /**
     * Convert canonical User gaming profile to behavioral signals
     * Used when mood analysis needs historical behavior data
     */
    static userToBehavioralSignals(user: User, games?: Game[], activities?: Activity[]): BehavioralSignal[];
    /**
     * Convert canonical User gaming profile to normalized features
     * Used when mood analysis needs feature extraction input
     */
    static userToNormalizedFeatures(user: User): NormalizedFeatures;
    /**
     * Convert mood analysis results back to canonical User format
     * Used when updating user's mood profile with analysis results
     */
    static moodAnalysisToUser(user: User, moodVector: MoodVector, confidence: number, features: NormalizedFeatures): User;
    /**
     * Create PlayHistory from canonical User gaming sessions
     * Used when mood analysis needs session data
     */
    static userToPlayHistory(user: User, games?: Game[]): PlayHistory[];
    private static getDefaultMoodVector;
    private static mapMoodToVector;
    private static vectorToMood;
    private static vectorToIntensity;
    private static moodToSessionType;
    private static calculateEngagementVolatility;
    private static calculateChallengeSeeking;
    private static calculateSocialOpenness;
    private static calculateExplorationBias;
    private static calculateFocusStability;
}
/**
 * Helper function to safely convert User to MoodVector
 */
export declare function safeUserToMoodVector(user: User | null | undefined): MoodVector | null;
/**
 * Helper function to safely convert User to BehavioralSignals
 */
export declare function safeUserToBehavioralSignals(user: User | null | undefined, games?: Game[], activities?: Activity[]): BehavioralSignal[];
/**
 * Helper function to safely convert User to NormalizedFeatures
 */
export declare function safeUserToNormalizedFeatures(user: User | null | undefined): NormalizedFeatures | null;
//# sourceMappingURL=moodAnalysisAdapter.d.ts.map