import type { UserPlaystyle, PlaystyleIndicator, GameSession } from './types';
export declare class PlaystyleModel {
    private playstyleDefinitions;
    /**
     * Compute playstyle based on gaming sessions
     */
    computePlaystyle(sessions: GameSession[]): UserPlaystyle;
    /**
     * Extract personality traits from gaming sessions
     */
    private extractTraitsFromSessions;
    /**
     * Find best matching playstyle based on traits
     */
    private findBestMatchingPlaystyle;
    /**
     * Find secondary playstyle (different from primary)
     */
    private findSecondaryPlaystyle;
    /**
     * Calculate how well a playstyle matches given traits
     */
    private calculatePlaystyleMatch;
    /**
     * Compute gaming preferences from sessions
     */
    private computePreferences;
    /**
     * Get default playstyle for new users
     */
    private getDefaultPlaystyle;
    /**
     * Get default preferences
     */
    private getDefaultPreferences;
    /**
     * Get all available playstyle definitions
     */
    getPlaystyleDefinitions(): PlaystyleIndicator[];
}
export declare const PLAYSTYLE_ARCHETYPES: {
    explorer: {
        name: string;
        description: string;
        icon: string;
        color: string;
        recommendation: string;
    };
    achiever: {
        name: string;
        description: string;
        icon: string;
        color: string;
        recommendation: string;
    };
    social: {
        name: string;
        description: string;
        icon: string;
        color: string;
        recommendation: string;
    };
    strategist: {
        name: string;
        description: string;
        icon: string;
        color: string;
        recommendation: string;
    };
    casual: {
        name: string;
        description: string;
        icon: string;
        color: string;
        recommendation: string;
    };
    competitive: {
        name: string;
        description: string;
        icon: string;
        color: string;
        recommendation: string;
    };
};
export interface PlaystyleScores {
    explorer: number;
    achiever: number;
    social: number;
    strategist: number;
    casual: number;
    competitive: number;
}
export declare const calculatePlaystyleScores: (games?: any[]) => PlaystyleScores;
export declare const getPlaystyleInsights: () => string[];
