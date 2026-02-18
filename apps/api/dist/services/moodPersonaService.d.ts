import { Database } from 'sqlite';
import type { MoodSelection, PersonaProfile, UserAction, RecommendationEvent, MoodPrediction, MoodPattern, LearningMetrics } from '../models/moodPersona';
import type { EnhancedMoodId } from '@gamepilot/static-data';
/**
 * Service for managing mood and persona data persistence
 */
export declare class MoodPersonaService {
    private db;
    constructor(db: Database);
    createMoodSelection(moodSelection: Omit<MoodSelection, 'id' | 'createdAt'>): Promise<MoodSelection>;
    getMoodSelections(userId: string, limit?: number): Promise<MoodSelection[]>;
    getRecentMoodSelections(userId: string, hours?: number): Promise<MoodSelection[]>;
    getPersonaProfile(userId: string): Promise<PersonaProfile | null>;
    createPersonaProfile(profile: Omit<PersonaProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<PersonaProfile>;
    updatePersonaProfile(userId: string, updates: Partial<PersonaProfile>): Promise<PersonaProfile>;
    createUserAction(action: Omit<UserAction, 'id' | 'createdAt'>): Promise<UserAction>;
    getUserActions(userId: string, limit?: number): Promise<UserAction[]>;
    getUserActionsByType(userId: string, type: UserAction['type'], limit?: number): Promise<UserAction[]>;
    createRecommendationEvent(event: Omit<RecommendationEvent, 'id' | 'createdAt'>): Promise<RecommendationEvent>;
    getRecommendationEvents(userId: string, limit?: number): Promise<RecommendationEvent[]>;
    createMoodPrediction(prediction: Omit<MoodPrediction, 'id' | 'createdAt'>): Promise<MoodPrediction>;
    getMoodPredictions(userId: string, limit?: number): Promise<MoodPrediction[]>;
    updateMoodPrediction(id: string, updates: {
        acceptedFlag?: boolean;
    }): Promise<void>;
    upsertMoodPattern(pattern: Omit<MoodPattern, 'id' | 'createdAt' | 'updatedAt'>): Promise<MoodPattern>;
    getMoodPatterns(userId: string, patternType?: MoodPattern['patternType']): Promise<MoodPattern[]>;
    createLearningMetrics(metrics: Omit<LearningMetrics, 'id' | 'createdAt'>): Promise<LearningMetrics>;
    getLearningMetrics(userId: string, metricType?: LearningMetrics['metricType'], period?: LearningMetrics['period'], limit?: number): Promise<LearningMetrics[]>;
    getMoodSelectionStats(userId: string, days?: number): Promise<Record<EnhancedMoodId, {
        count: number;
        avgIntensity: number;
        successRate: number;
    }>>;
    getRecommendationSuccessRate(userId: string, days?: number): Promise<number>;
    getMoodPredictionAccuracy(userId: string, days?: number): Promise<number>;
}
//# sourceMappingURL=moodPersonaService.d.ts.map