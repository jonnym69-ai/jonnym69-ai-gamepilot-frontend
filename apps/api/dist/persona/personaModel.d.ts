import type { PersonaTraits, PersonaArchetypeId } from '@gamepilot/static-data';
import type { IdentityCore } from '@gamepilot/shared';
/**
 * Current intent states for gaming sessions
 */
export type PersonaIntent = 'short_session' | 'comfort' | 'novelty' | 'social' | 'challenge' | 'exploration' | 'achievement' | 'neutral';
/**
 * Dynamic mood states affecting recommendations
 */
export type PersonaMood = 'energetic' | 'focused' | 'relaxed' | 'creative' | 'competitive' | 'social' | 'curious' | 'nostalgic' | 'stressed' | 'bored' | 'neutral';
/**
 * Behavioral pattern tracking
 */
export interface BehavioralPatterns {
    recentGames: {
        gameId: string;
        gameName: string;
        sessionCount: number;
        totalPlaytime: number;
        lastPlayed: Date;
        averageSessionLength: number;
        completionRate: number;
    }[];
    sessionPatterns: {
        averageLength: number;
        preferredTimes: number[];
        sessionsPerWeek: number;
        lateNightRatio: number;
        weekendRatio: number;
    };
    abandonedGames: {
        gameId: string;
        abandonedAt: Date;
        playtimeBeforeAbandonment: number;
        lastSessionLength: number;
        reason?: 'difficulty' | 'boredom' | 'time' | 'technical' | 'other';
    }[];
    completionPatterns: {
        gamesCompleted: number;
        averageCompletionRate: number;
        preferredCompletionTypes: ('main_story' | 'full_completion' | 'achievements')[];
        achievementHunting: boolean;
    };
}
/**
 * Historical tracking for persona evolution
 */
export interface PersonaHistory {
    moodHistory: {
        mood: PersonaMood;
        intensity: number;
        timestamp: Date;
        context?: string;
        gameId?: string;
    }[];
    intentHistory: {
        intent: PersonaIntent;
        timestamp: Date;
        success: boolean;
        gameId?: string;
    }[];
    traitEvolution: {
        date: Date;
        traits: PersonaTraits;
        confidence: number;
        triggerEvent?: string;
    }[];
}
/**
 * Complete unified persona model
 */
export interface UnifiedPersona {
    userId: string;
    createdAt: Date;
    lastUpdated: Date;
    traits: PersonaTraits;
    currentMood: PersonaMood;
    currentIntent: PersonaIntent;
    moodIntensity: number;
    patterns: BehavioralPatterns;
    history: PersonaHistory;
    signals: IdentityCore['signals'];
    confidence: number;
    dataPoints: number;
    lastAnalysisDate: Date;
    recommendationContext: {
        preferredGenres: string[];
        avoidedGenres: string[];
        sessionLengthPreference: 'short' | 'medium' | 'long';
        difficultyPreference: 'easy' | 'normal' | 'hard' | 'adaptive';
        socialPreference: 'solo' | 'coop' | 'competitive' | 'any';
    };
}
/**
 * Persona update events
 */
export interface PersonaUpdateEvent {
    type: 'mood' | 'intent' | 'behavior' | 'session' | 'achievement';
    timestamp: Date;
    userId: string;
    data: any;
    context?: {
        gameId?: string;
        sessionId?: string;
        source?: 'user_input' | 'behavioral' | 'system_inferred';
    };
}
/**
 * Persona state for recommendation engine
 * Simplified output for recommendation scoring
 */
export interface PersonaState {
    userId: string;
    archetype: PersonaArchetypeId;
    mood: PersonaMood;
    intent: PersonaIntent;
    sessionLengthPreference: number;
    genreAffinities: Record<string, number>;
    difficultyPreference: number;
    socialPreference: number;
    timeOfDay: number;
    dayOfWeek: number;
    recentGames: string[];
    confidence: number;
    dataFreshness: number;
}
/**
 * Persona update request
 */
export interface PersonaUpdateRequest {
    mood?: {
        mood: PersonaMood;
        intensity: number;
        context?: string;
    };
    intent?: {
        intent: PersonaIntent;
        context?: string;
    };
    behavior?: {
        gameId: string;
        sessionLength: number;
        completed: boolean;
        achievements?: number;
        difficulty?: 'easy' | 'normal' | 'hard';
        multiplayer?: boolean;
        timestamp: Date;
    };
    event?: PersonaUpdateEvent;
}
/**
 * Persona analysis result
 */
export interface PersonaAnalysisResult {
    persona: UnifiedPersona;
    state: PersonaState;
    insights: {
        dominantTraits: string[];
        behaviorPatterns: string[];
        recommendations: string[];
        confidence: number;
    };
    metadata: {
        analysisDate: Date;
        dataPointsUsed: number;
        computationTime: number;
    };
}
//# sourceMappingURL=personaModel.d.ts.map