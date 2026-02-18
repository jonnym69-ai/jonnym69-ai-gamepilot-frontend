import { UnifiedPersona, PersonaState, PersonaUpdateRequest, PersonaAnalysisResult, PersonaUpdateEvent } from './personaModel';
/**
 * Persona Service - Manages user personas with real-time updates
 */
export declare class PersonaService {
    private static instance;
    static getInstance(): PersonaService;
    constructor();
    /**
     * Get user's current persona
     */
    getPersona(userId: string): Promise<UnifiedPersona | null>;
    /**
     * Update persona with new data
     */
    updatePersona(userId: string, update: PersonaUpdateRequest): Promise<UnifiedPersona>;
    /**
     * Generate persona state for recommendation engine
     */
    getPersonaState(userId: string): Promise<PersonaState | null>;
    /**
     * Analyze persona with latest data
     */
    analyzePersona(userId: string): Promise<PersonaAnalysisResult>;
    /**
     * Process persona update events
     */
    processPersonaEvent(persona: UnifiedPersona, event: PersonaUpdateEvent): Promise<UnifiedPersona>;
    private createDefaultPersona;
    private shouldRefreshPersona;
    private refreshPersona;
    private mapDatabasePersona;
    private updateMood;
    private updateIntent;
    private updateBehavioralPatterns;
    private recomputePersona;
    private buildPersonaState;
    /**
     * Fetch all gaming data for a user to power the Identity Engine
     */
    private getUserGamingData;
    /**
     * Map raw Identity Engine traits to User-facing Persona traits
     */
    private mapIdentityTraitsToPersonaTraits;
    /**
     * Infer current mood based on recent gaming activity
     */
    private inferCurrentMood;
    /**
     * Infer current intent based on traits and mood signals
     */
    private inferCurrentIntent;
    /**
     * Calculate mood intensity (1-10)
     */
    private calculateMoodIntensity;
    /**
     * Extract behavioral patterns from historical gaming data
     */
    private extractBehavioralPatterns;
    private buildPersonaHistory;
    /**
     * Extract mood signals from user gaming data
     */
    private extractMoodSignals;
    private countDataPoints;
    private buildRecommendationContext;
    private buildRecommendationContextFromPatterns;
    private generatePersonaInsights;
    private getDefaultBehavioralPatterns;
    private getDefaultPersonaHistory;
    private getDefaultSignals;
    private getDefaultRecommendationContext;
    private mapDifficultyToScale;
    private mapSocialToScale;
    private calculateDataFreshness;
}
export declare const personaService: PersonaService;
//# sourceMappingURL=personaService.d.ts.map