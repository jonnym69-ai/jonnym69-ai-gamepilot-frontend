/**
 * End-to-end validation test for mood-persona system
 * Tests the complete data flow: Frontend → API → Database → Persona Engine → Frontend
 */
export declare class MoodPersonaValidator {
    private moodPersonaService;
    private moodPersonaIntegration;
    private testUserId;
    constructor();
    /**
     * Run complete end-to-end validation
     */
    runValidation(): Promise<{
        success: boolean;
        results: ValidationResult[];
        issues: string[];
        recommendations: string[];
    }>;
    /**
     * Test 1: Database Setup
     */
    private testDatabaseSetup;
    /**
     * Test 2: Mood Selection Flow
     */
    private testMoodSelectionFlow;
    /**
     * Test 3: User Action Tracking
     */
    private testUserActionTracking;
    /**
     * Test 4: Recommendation Events
     */
    private testRecommendationEvents;
    /**
     * Test 5: Persona Profile Updates
     */
    private testPersonaProfileUpdates;
    /**
     * Test 6: Learning Analytics
     */
    private testLearningAnalytics;
    /**
     * Test 7: Data Consistency
     */
    private testDataConsistency;
    /**
     * Generate recommendations based on validation results
     */
    private generateRecommendations;
}
interface ValidationResult {
    test: string;
    success: boolean;
    details: string;
    data: any;
}
export default MoodPersonaValidator;
//# sourceMappingURL=moodPersonaValidation.d.ts.map