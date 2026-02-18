import { UserAdapter } from './userAdapter';
import { IntegrationAdapter } from './integrationAdapter';
import { MoodAnalysisAdapter } from './moodAnalysisAdapter';
import type { User } from '@gamepilot/shared/models/user';
export type { User } from '@gamepilot/shared/models/user';
export type { UserIntegration } from '@gamepilot/shared/models/integration';
export type { MoodVector, BehavioralSignal, NormalizedFeatures } from '../mood/types';
/**
 * Adapter Registry - Central management for all adapters
 * Provides unified interface for model conversions
 */
export declare class AdapterRegistry {
    /**
     * Get all adapters for a given user
     */
    static getUserAdapters(user: User): {
        user: typeof UserAdapter;
        integration: typeof IntegrationAdapter;
        mood: typeof MoodAnalysisAdapter;
    };
    /**
     * Convert canonical user to all legacy formats
     */
    static canonicalToAllLegacy(user: User): {
        authUser: any;
        moodVector: import("../mood/types").MoodVector;
        behavioralSignals: import("../mood/types").BehavioralSignal[];
        normalizedFeatures: import("../mood/types").NormalizedFeatures;
    };
    /**
     * Validate user data across all adapters
     */
    static validateUser(user: User): {
        auth: {
            isValid: boolean;
            errors: string[];
        };
    };
    /**
     * Get user status across all systems
     */
    static getUserStatus(user: User): {
        auth: {
            isAuthenticated: boolean;
            hasIntegrations: boolean;
            lastActive: Date | null;
            isOnboarded: boolean;
        };
        integrations: {
            platform: any;
            health: {
                isHealthy: boolean;
                status: string;
                issues: string[];
                lastSyncAge: number;
            };
            needsRefresh: boolean;
        }[];
        mood: {
            currentVector: import("../mood/types").MoodVector;
            signalCount: number;
            features: import("../mood/types").NormalizedFeatures;
        };
    };
}
//# sourceMappingURL=index.d.ts.map