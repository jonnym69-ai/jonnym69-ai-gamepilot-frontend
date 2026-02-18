"use strict";
// Adapter Index - Central export point for all adapter layers
// This provides a single entry point for backend migration adapters
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdapterRegistry = void 0;
const userAdapter_1 = require("./userAdapter");
const integrationAdapter_1 = require("./integrationAdapter");
const moodAnalysisAdapter_1 = require("./moodAnalysisAdapter");
/**
 * Adapter Registry - Central management for all adapters
 * Provides unified interface for model conversions
 */
class AdapterRegistry {
    /**
     * Get all adapters for a given user
     */
    static getUserAdapters(user) {
        return {
            user: userAdapter_1.UserAdapter,
            integration: integrationAdapter_1.IntegrationAdapter,
            mood: moodAnalysisAdapter_1.MoodAnalysisAdapter
        };
    }
    /**
     * Convert canonical user to all legacy formats
     */
    static canonicalToAllLegacy(user) {
        return {
            authUser: userAdapter_1.UserAdapter.canonicalToAuthUser(user),
            moodVector: moodAnalysisAdapter_1.MoodAnalysisAdapter.userToMoodVector(user),
            behavioralSignals: moodAnalysisAdapter_1.MoodAnalysisAdapter.userToBehavioralSignals(user),
            normalizedFeatures: moodAnalysisAdapter_1.MoodAnalysisAdapter.userToNormalizedFeatures(user)
        };
    }
    /**
     * Validate user data across all adapters
     */
    static validateUser(user) {
        return {
            auth: userAdapter_1.UserAdapter.validateForAuth(user),
            // Add more validations as needed
        };
    }
    /**
     * Get user status across all systems
     */
    static getUserStatus(user) {
        return {
            auth: userAdapter_1.UserAdapter.getAuthStatus(user),
            integrations: user.integrations.map((integration) => ({
                platform: integration.platform,
                health: integrationAdapter_1.IntegrationAdapter.getHealthStatus(integration),
                needsRefresh: integrationAdapter_1.IntegrationAdapter.needsTokenRefresh(integration)
            })),
            mood: {
                currentVector: moodAnalysisAdapter_1.MoodAnalysisAdapter.userToMoodVector(user),
                signalCount: moodAnalysisAdapter_1.MoodAnalysisAdapter.userToBehavioralSignals(user).length,
                features: moodAnalysisAdapter_1.MoodAnalysisAdapter.userToNormalizedFeatures(user)
            }
        };
    }
}
exports.AdapterRegistry = AdapterRegistry;
//# sourceMappingURL=index.js.map