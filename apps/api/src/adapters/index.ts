// Adapter Index - Central export point for all adapter layers
// This provides a single entry point for backend migration adapters

import { UserAdapter, isAuthUser, isCanonicalUser, safeCanonicalToAuthUser, safeAuthUserToCanonical } from './userAdapter'
import { IntegrationAdapter, isSteamProfile, isUserIntegration, safeSteamProfileToIntegration, safeIntegrationToSteamProfile } from './integrationAdapter'
import { MoodAnalysisAdapter, safeUserToMoodVector, safeUserToBehavioralSignals, safeUserToNormalizedFeatures } from './moodAnalysisAdapter'
import type { User } from '@gamepilot/shared/models/user'

// Re-export types for convenience
export type { User } from '@gamepilot/shared/models/user'
export type { UserIntegration } from '@gamepilot/shared/models/integration'
export type { MoodVector, BehavioralSignal, NormalizedFeatures } from '../mood/types'

/**
 * Adapter Registry - Central management for all adapters
 * Provides unified interface for model conversions
 */
export class AdapterRegistry {
  /**
   * Get all adapters for a given user
   */
  static getUserAdapters(user: User) {
    return {
      user: UserAdapter,
      integration: IntegrationAdapter,
      mood: MoodAnalysisAdapter
    }
  }

  /**
   * Convert canonical user to all legacy formats
   */
  static canonicalToAllLegacy(user: User) {
    return {
      authUser: UserAdapter.canonicalToAuthUser(user),
      moodVector: MoodAnalysisAdapter.userToMoodVector(user),
      behavioralSignals: MoodAnalysisAdapter.userToBehavioralSignals(user),
      normalizedFeatures: MoodAnalysisAdapter.userToNormalizedFeatures(user)
    }
  }

  /**
   * Validate user data across all adapters
   */
  static validateUser(user: User) {
    return {
      auth: UserAdapter.validateForAuth(user),
      // Add more validations as needed
    }
  }

  /**
   * Get user status across all systems
   */
  static getUserStatus(user: User) {
    return {
      auth: UserAdapter.getAuthStatus(user),
      integrations: user.integrations.map((integration: any) => ({
        platform: integration.platform,
        health: IntegrationAdapter.getHealthStatus(integration),
        needsRefresh: IntegrationAdapter.needsTokenRefresh(integration)
      })),
      mood: {
        currentVector: MoodAnalysisAdapter.userToMoodVector(user),
        signalCount: MoodAnalysisAdapter.userToBehavioralSignals(user).length,
        features: MoodAnalysisAdapter.userToNormalizedFeatures(user)
      }
    }
  }
}
