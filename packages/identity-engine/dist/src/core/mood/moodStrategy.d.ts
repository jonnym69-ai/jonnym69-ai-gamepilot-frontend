import { type MoodId } from '@gamepilot/static-data';
export interface UserMood {
    id: MoodId;
    preference: number;
    frequency: number;
    lastExperienced?: Date;
    triggers?: string[];
    associatedGenres: string[];
}
export interface GameSession {
    id: string;
    gameId: string;
    gameName: string;
    game: any;
    genre: string;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    mood: MoodId;
    intensity: number;
    tags: string[];
    platform: string;
    completed?: boolean;
    difficulty?: 'casual' | 'normal' | 'hard' | 'expert';
    isMultiplayer?: boolean;
    rating?: number;
    userId?: string;
}
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
     * Initialize user mood profile with default moods
     */
    initializeUserMoodProfile(): UserMood[];
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
