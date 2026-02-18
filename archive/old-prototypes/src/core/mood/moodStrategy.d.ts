import type { UserMood, GameSession } from '@gamepilot/identity-engine';
import { type MoodId } from '@gamepilot/static-data';
export interface Mood {
    id: string;
    name: string;
    emoji: string;
    color: string;
    description: string;
    intensity: number;
}
export interface GameMoodMapping {
    gameId: string;
    moodId: string;
    score: number;
    reasons: string[];
}
export declare class MoodStrategy {
    /**
     * Compute current mood based on recent gaming sessions
     */
    computeCurrentMood(sessions: GameSession[]): MoodId;
    /**
     * Calculate mood score for a single session
     */
    private calculateSessionMoodScore;
    /**
     * Calculate recency multiplier - more recent sessions have higher impact
     */
    private calculateRecencyMultiplier;
    /**
     * Update mood preferences based on new session
     */
    updateMoodPreferences(currentMoods: UserMood[], newSession: GameSession): UserMood[];
    /**
     * Get mood recommendations based on current state
     */
    getMoodRecommendations(currentMoods: UserMood[], timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'): MoodId[];
    /**
     * Map games to moods based on their genres and tags
     */
    mapGamesToMoods(games: any[]): GameMoodMapping[];
    /**
     * Get mood recommendations for a specific mood
     */
    getMoodRecommendationsForTarget(games: any[], targetMoodId: string, limit?: number): any[];
    /**
     * Get all available moods
     */
    getMoods(): Mood[];
    /**
     * Get genre to mood mapping for recommendations
     */
    private getGenreMoodMapping;
}
export declare const moodStrategy: MoodStrategy;
//# sourceMappingURL=moodStrategy.d.ts.map