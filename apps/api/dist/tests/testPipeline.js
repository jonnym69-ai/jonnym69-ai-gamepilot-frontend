"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineTester = void 0;
exports.runPipelineTest = runPipelineTest;
const moodPersonaService_1 = require("../services/moodPersonaService");
const identity_engine_1 = require("@gamepilot/identity-engine");
const database_1 = require("../services/database");
/**
 * Test the complete end-to-end pipeline
 * Frontend → API → Database → Persona Engine → Frontend
 */
class PipelineTester {
    constructor() {
        this.moodPersonaService = new moodPersonaService_1.MoodPersonaService(database_1.databaseService.db);
        this.moodPersonaIntegration = new identity_engine_1.MoodPersonaIntegration();
        this.testUserId = 'test-pipeline-user';
    }
    async testCompletePipeline() {
        const results = [];
        const issues = [];
        console.log('🧪 Testing Complete Mood-Persona Pipeline...');
        try {
            // Test 1: Database Tables Exist
            console.log('\n1️⃣ Testing Database Tables...');
            const dbTest = await this.testDatabaseTables();
            results.push(dbTest);
            if (!dbTest.success)
                issues.push('Database tables missing');
            // Test 2: Mood Selection Flow
            console.log('\n2️⃣ Testing Mood Selection Flow...');
            const moodTest = await this.testMoodSelectionFlow();
            results.push(moodTest);
            if (!moodTest.success)
                issues.push('Mood selection flow failed');
            // Test 3: User Action Tracking
            console.log('\n3️⃣ Testing User Action Tracking...');
            const actionTest = await this.testUserActionTracking();
            results.push(actionTest);
            if (!actionTest.success)
                issues.push('User action tracking failed');
            // Test 4: Persona Profile Updates
            console.log('\n4️⃣ Testing Persona Profile Updates...');
            const personaTest = await this.testPersonaProfileUpdates();
            results.push(personaTest);
            if (!personaTest.success)
                issues.push('Persona profile updates failed');
            // Test 5: Mood Suggestions
            console.log('\n5️⃣ Testing Mood Suggestions...');
            const suggestionsTest = await this.testMoodSuggestions();
            results.push(suggestionsTest);
            if (!suggestionsTest.success)
                issues.push('Mood suggestions failed');
            // Test 6: Personalized Recommendations
            console.log('\n6️⃣ Testing Personalized Recommendations...');
            const recommendationsTest = await this.testPersonalizedRecommendations();
            results.push(recommendationsTest);
            if (!recommendationsTest.success)
                issues.push('Personalized recommendations failed');
            const success = issues.length === 0;
            console.log('\n📊 Pipeline Test Results:');
            console.log(`✅ Success: ${success}`);
            console.log(`📋 Tests Run: ${results.length}`);
            console.log(`⚠️ Issues: ${issues.length}`);
            if (issues.length > 0) {
                console.log('\n❌ Issues Found:');
                issues.forEach((issue, index) => {
                    console.log(`  ${index + 1}. ${issue}`);
                });
            }
            return { success, results, issues };
        }
        catch (error) {
            console.error('❌ Pipeline test failed:', error);
            return { success: false, results, issues: ['Pipeline test failed with error'] };
        }
    }
    async testDatabaseTables() {
        try {
            const db = database_1.databaseService.db;
            const tables = await db.all(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name IN ('mood_selections', 'persona_profile', 'user_actions', 'recommendation_events', 'mood_predictions', 'mood_patterns', 'learning_metrics')
      `);
            const expectedTables = ['mood_selections', 'persona_profile', 'user_actions', 'recommendation_events', 'mood_predictions', 'mood_patterns', 'learning_metrics'];
            const existingTables = tables.map((row) => row.name);
            const missingTables = expectedTables.filter(table => !existingTables.includes(table));
            return {
                test: 'Database Tables',
                success: missingTables.length === 0,
                details: missingTables.length === 0
                    ? 'All mood-persona tables exist'
                    : `Missing tables: ${missingTables.join(', ')}`,
                data: { existingTables, missingTables }
            };
        }
        catch (error) {
            return {
                test: 'Database Tables',
                success: false,
                details: `Database check failed: ${error}`,
                data: null
            };
        }
    }
    async testMoodSelectionFlow() {
        try {
            // Create mood selection
            const moodSelection = await this.moodPersonaService.createMoodSelection({
                userId: this.testUserId,
                primaryMood: 'energetic',
                secondaryMood: 'competitive',
                intensity: 0.8,
                timestamp: new Date(),
                context: {
                    timeOfDay: 'afternoon',
                    dayOfWeek: 2,
                    trigger: 'manual'
                },
                outcomes: {
                    gamesRecommended: 5,
                    gamesLaunched: 2,
                    ignoredRecommendations: 1
                }
            });
            // Process with persona integration
            const enhancedIdentity = await this.moodPersonaIntegration.processMoodSelection(this.testUserId, moodSelection);
            // Check if profile was updated
            const profile = await this.moodPersonaService.getPersonaProfile(this.testUserId);
            return {
                test: 'Mood Selection Flow',
                success: !!(moodSelection && enhancedIdentity && profile),
                details: 'Mood selection processed and persona updated',
                data: { moodSelectionId: moodSelection?.id, hasProfile: !!profile }
            };
        }
        catch (error) {
            return {
                test: 'Mood Selection Flow',
                success: false,
                details: `Mood selection flow failed: ${error}`,
                data: null
            };
        }
    }
    async testUserActionTracking() {
        try {
            const userAction = await this.moodPersonaService.createUserAction({
                userId: this.testUserId,
                type: 'launch',
                gameId: 'test-game-123',
                gameTitle: 'Test Game',
                moodContext: {
                    primaryMood: 'energetic',
                    secondaryMood: 'competitive'
                },
                timestamp: new Date(),
                metadata: {
                    sessionDuration: 30,
                    rating: 4
                }
            });
            await this.moodPersonaIntegration.learnFromUserAction(this.testUserId, userAction);
            const actions = await this.moodPersonaService.getUserActions(this.testUserId, 10);
            return {
                test: 'User Action Tracking',
                success: !!(userAction && actions.length > 0),
                details: 'User action tracked and processed',
                data: { actionId: userAction?.id, totalActions: actions.length }
            };
        }
        catch (error) {
            return {
                test: 'User Action Tracking',
                success: false,
                details: `User action tracking failed: ${error}`,
                data: null
            };
        }
    }
    async testPersonaProfileUpdates() {
        try {
            const profile = await this.moodPersonaService.getPersonaProfile(this.testUserId);
            if (!profile) {
                // Create profile
                const newProfile = await this.moodPersonaService.createPersonaProfile({
                    userId: this.testUserId,
                    genreWeights: { action: 0.8, strategy: 0.6 },
                    tagWeights: { competitive: 0.9, fast_paced: 0.7 },
                    moodAffinity: { energetic: 0.8, focused: 0.6 },
                    sessionPatterns: {
                        dailyRhythms: {},
                        weeklyPatterns: {},
                        contextualTriggers: {}
                    },
                    hybridSuccess: {},
                    platformBiases: { steam: 0.8 },
                    timePreferences: {
                        morning: 0.5,
                        afternoon: 0.7,
                        evening: 0.6,
                        night: 0.4
                    },
                    confidence: 0.3,
                    sampleSize: 5,
                    version: '2.0.0',
                    lastUpdated: new Date()
                });
                return {
                    test: 'Persona Profile Updates',
                    success: true,
                    details: 'Persona profile created successfully',
                    data: { profileId: newProfile.id, created: true }
                };
            }
            // Update profile
            const updatedProfile = await this.moodPersonaService.updatePersonaProfile(this.testUserId, {
                confidence: 0.6,
                sampleSize: 15,
                genreWeights: { ...profile.genreWeights, puzzle: 0.7 }
            });
            return {
                test: 'Persona Profile Updates',
                success: !!(updatedProfile && updatedProfile.confidence > profile.confidence),
                details: 'Persona profile updated successfully',
                data: {
                    profileId: updatedProfile?.id,
                    confidenceIncreased: updatedProfile?.confidence > profile.confidence
                }
            };
        }
        catch (error) {
            return {
                test: 'Persona Profile Updates',
                success: false,
                details: `Persona profile update failed: ${error}`,
                data: null
            };
        }
    }
    async testMoodSuggestions() {
        try {
            const suggestions = await this.moodPersonaIntegration.generateMoodSuggestions(this.testUserId, {
                currentTime: new Date(),
                socialContext: 'solo'
            });
            return {
                test: 'Mood Suggestions',
                success: Array.isArray(suggestions) && suggestions.length > 0,
                details: 'Mood suggestions generated successfully',
                data: { suggestionsCount: suggestions.length, firstSuggestion: suggestions[0] }
            };
        }
        catch (error) {
            return {
                test: 'Mood Suggestions',
                success: false,
                details: `Mood suggestions failed: ${error}`,
                data: null
            };
        }
    }
    async testPersonalizedRecommendations() {
        try {
            const profile = await this.moodPersonaService.getPersonaProfile(this.testUserId);
            if (!profile) {
                return {
                    test: 'Personalized Recommendations',
                    success: false,
                    details: 'No persona profile found for recommendations',
                    data: null
                };
            }
            const recommendations = await this.moodPersonaIntegration.generatePersonalizedRecommendations(profile, 'energetic', {
                availableGames: [],
                limit: 5
            }, []);
            return {
                test: 'Personalized Recommendations',
                success: Array.isArray(recommendations),
                details: 'Personalized recommendations generated successfully',
                data: { recommendationsCount: recommendations?.length || 0 }
            };
        }
        catch (error) {
            return {
                test: 'Personalized Recommendations',
                success: false,
                details: `Personalized recommendations failed: ${error}`,
                data: null
            };
        }
    }
}
exports.PipelineTester = PipelineTester;
// Test runner
async function runPipelineTest() {
    console.log('🚀 Starting GamePilot Mood-Persona Pipeline Test');
    console.log('='.repeat(60));
    try {
        // Initialize database
        await database_1.databaseService.initialize();
        console.log('✅ Database initialized');
        // Run pipeline test
        const tester = new PipelineTester();
        const results = await tester.testCompletePipeline();
        console.log('\n' + '='.repeat(60));
        console.log('📊 PIPELINE TEST RESULTS');
        console.log('='.repeat(60));
        console.log(`\n🎯 Overall Success: ${results.success ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`📋 Tests Run: ${results.results.length}`);
        console.log(`⚠️ Issues: ${results.issues.length}`);
        // Show detailed results
        console.log('\n📋 Detailed Results:');
        results.results.forEach(result => {
            console.log(`  ${result.success ? '✅' : '❌'} ${result.test}: ${result.details}`);
        });
        if (results.issues.length > 0) {
            console.log('\n⚠️ Issues to Fix:');
            results.issues.forEach((issue, index) => {
                console.log(`  ${index + 1}. ${issue}`);
            });
        }
        return results;
    }
    catch (error) {
        console.error('❌ Pipeline test failed:', error);
        throw error;
    }
}
// Run test if this file is executed directly
if (require.main === module) {
    runPipelineTest()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}
//# sourceMappingURL=testPipeline.js.map