import type { PlayerIdentity, GameSession, IdentityComputationOptions } from './types';
export declare class IdentityEngine {
    private moodModel;
    private playstyleModel;
    private recommendationEngine;
    constructor();
    /**
     * Compute player identity from gaming history
     */
    computeIdentity(userId: string, sessions: GameSession[], options?: Partial<IdentityComputationOptions>): PlayerIdentity;
    /**
     * Update identity with new gaming session
     */
    updateIdentity(identity: PlayerIdentity, newSession: GameSession): PlayerIdentity;
    /**
     * Get current mood from identity
     */
    getCurrentMood(identity: PlayerIdentity): string | undefined;
    /**
     * Update mood preference
     */
    updateMoodPreference(identity: PlayerIdentity, moodId: string, preference: number): PlayerIdentity;
    /**
     * Get playstyle from identity
     */
    getPlaystyle(identity: PlayerIdentity): import("./types").UserPlaystyle;
    /**
     * Get recommendations for identity
     */
    getRecommendations(identity: PlayerIdentity, context: any, availableGames: any[]): import("./types").GameRecommendation[];
    /**
     * Filter sessions based on computation options
     */
    private filterRelevantSessions;
    /**
     * Compute mood preferences from sessions
     */
    private computeMoodPreferences;
    /**
     * Compute genre affinities from sessions
     */
    private computeGenreAffinities;
    /**
     * Create default identity for new users
     */
    private createDefaultIdentity;
}
