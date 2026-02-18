import type { MoodId } from '@gamepilot/static-data';
import type { Game } from '@gamepilot/types';
export interface UserMood {
    id: MoodId;
    preference: number;
    frequency: number;
    lastExperienced?: Date;
    triggers?: string[];
    associatedGenres: string[];
}
export interface PlaystyleIndicator {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    traits: string[];
}
export interface UserPlaystyle {
    primary: PlaystyleIndicator;
    secondary?: PlaystyleIndicator;
    preferences: {
        sessionLength: 'short' | 'medium' | 'long';
        difficulty: 'casual' | 'normal' | 'hard' | 'expert';
        socialPreference: 'solo' | 'cooperative' | 'competitive';
        storyFocus: number;
        graphicsFocus: number;
        gameplayFocus: number;
    };
    customPlaystyles?: PlaystyleIndicator[];
    traits: string[];
}
export interface GameSession {
    id: string;
    gameId: string;
    gameName: string;
    game: Game;
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
export interface PlayerIdentity {
    id: string;
    userId: string;
    moods: UserMood[];
    playstyle: UserPlaystyle;
    sessions: GameSession[];
    genreAffinities: Record<string, number>;
    computedMood?: MoodId;
    lastUpdated: Date;
    version: string;
    preferences?: {
        favoriteGenre?: string;
        social?: boolean;
    };
}
export interface RecommendationContext {
    currentMood?: MoodId;
    timeAvailable?: number;
    socialContext?: 'solo' | 'co-op' | 'pvp';
    intensity?: 'low' | 'medium' | 'high';
    platform?: string;
    genres?: string[];
    excludeRecentlyPlayed?: boolean;
}
export interface GameRecommendation {
    gameId: string;
    name: string;
    genre: string;
    score: number;
    reasons: string[];
    moodMatch: number;
    playstyleMatch: number;
    socialMatch: number;
    estimatedPlaytime: number;
    difficulty: string;
    tags: string[];
}
export interface IdentityComputationOptions {
    recentSessionWeight: number;
    moodDecayDays: number;
    minSessionsForComputation: number;
    includeNegativeSessions: boolean;
}
