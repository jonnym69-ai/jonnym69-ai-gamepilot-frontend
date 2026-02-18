/**
 * Test the complete end-to-end pipeline
 * Frontend → API → Database → Persona Engine → Frontend
 */
export declare class PipelineTester {
    private moodPersonaService;
    private moodPersonaIntegration;
    private testUserId;
    constructor();
    testCompletePipeline(): Promise<{
        success: boolean;
        results: any[];
        issues: string[];
    }>;
    private testDatabaseTables;
    private testMoodSelectionFlow;
    private testUserActionTracking;
    private testPersonaProfileUpdates;
    private testMoodSuggestions;
    private testPersonalizedRecommendations;
}
export declare function runPipelineTest(): Promise<{
    success: boolean;
    results: any[];
    issues: string[];
}>;
//# sourceMappingURL=testPipeline.d.ts.map