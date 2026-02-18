// Mood Analysis Adapter - Non-destructive mapping between canonical User and mood analysis models
// This adapter provides transformation between canonical User data and legacy mood analysis types

import type { User } from '@gamepilot/shared/models/user'
import type { MoodVector, BehavioralSignal, NormalizedFeatures } from '../mood/types'
import type { PlayHistory, Game, Activity } from '@gamepilot/types'

/**
 * Adapter for converting canonical User data to mood analysis compatible formats
 * Provides non-destructive migration path for mood analysis services
 */

export class MoodAnalysisAdapter {
  /**
   * Convert canonical User gaming profile to MoodVector
   * Used when mood analysis needs user's current mood state
   */
  static userToMoodVector(user: User): MoodVector {
    const moodProfile = user.gamingProfile.moodProfile
    const currentMood = moodProfile.currentMood
    
    // Default neutral mood if no current mood
    if (!currentMood) {
      return {
        calm: 0.5,
        competitive: 0.5,
        curious: 0.5,
        social: 0.5,
        focused: 0.5
      }
    }
    
    // Map mood preferences to mood vector
    const moodPreference = moodProfile.moodPreferences[currentMood]
    if (!moodPreference) {
      return this.getDefaultMoodVector()
    }
    
    // Convert mood preference (0-100) to mood vector (0-1)
    const preference = moodPreference.preference / 100
    
    // Mood-to-vector mapping based on mood characteristics
    return this.mapMoodToVector(currentMood, preference)
  }

  /**
   * Convert canonical User gaming profile to behavioral signals
   * Used when mood analysis needs historical behavior data
   */
  static userToBehavioralSignals(user: User, games: Game[] = [], activities: Activity[] = []): BehavioralSignal[] {
    const signals: BehavioralSignal[] = []
    const now = new Date()
    
    // Generate signals from mood history
    user.gamingProfile.moodProfile.moodHistory.forEach(moodEntry => {
      signals.push({
        timestamp: moodEntry.timestamp,
        source: 'session',
        data: {
          mood: moodEntry.moodId,
          intensity: moodEntry.intensity,
          context: moodEntry.context,
          gameId: moodEntry.gameId
        },
        weight: 0.8
      })
    })
    
    // Generate signals from genre affinities
    Object.entries(user.gamingProfile.genreAffinities).forEach(([genreId, affinity]) => {
      signals.push({
        timestamp: now,
        source: 'genre',
        data: {
          genreId,
          affinity: affinity / 100, // Convert to 0-1 scale
          totalPlaytime: user.gamingProfile.totalPlaytime
        },
        weight: 0.6
      })
    })
    
    // Generate signals from playstyle archetypes
    user.gamingProfile.playstyleArchetypes.forEach(archetype => {
      signals.push({
        timestamp: now,
        source: 'session',
        data: {
          playstyle: archetype.id,
          score: archetype.score / 100, // Convert to 0-1 scale
          traits: archetype.traits
        },
        weight: 0.7
      })
    })
    
    // Generate signals from gaming statistics
    signals.push({
      timestamp: now,
      source: 'playtime',
      data: {
        totalPlaytime: user.gamingProfile.totalPlaytime,
        gamesPlayed: user.gamingProfile.gamesPlayed,
        gamesCompleted: user.gamingProfile.gamesCompleted,
        achievementsCount: user.gamingProfile.achievementsCount,
        averageRating: user.gamingProfile.averageRating
      },
      weight: 0.5
    })
    
    // Generate signals from platform usage
    user.gamingProfile.primaryPlatforms.forEach(platform => {
      signals.push({
        timestamp: now,
        source: 'platform',
        data: {
          platform,
          isPrimary: true,
          integrationCount: user.integrations.filter(i => i.platform === platform).length
        },
        weight: 0.4
      })
    })
    
    // Generate signals from integration activity
    user.integrations.forEach(integration => {
      if (integration.lastSyncAt) {
        signals.push({
          timestamp: integration.lastSyncAt,
          source: 'integration',
          data: {
            platform: integration.platform,
            status: integration.status,
            lastSync: integration.lastSyncAt,
            errorCount: integration.syncConfig.errorCount
          },
          weight: 0.3
        })
      }
    })
    
    return signals
  }

  /**
   * Convert canonical User gaming profile to normalized features
   * Used when mood analysis needs feature extraction input
   */
  static userToNormalizedFeatures(user: User): NormalizedFeatures {
    const gamingProfile = user.gamingProfile
    const moodHistory = gamingProfile.moodProfile.moodHistory
    
    // Calculate engagement volatility from mood intensity variations
    const engagementVolatility = this.calculateEngagementVolatility(moodHistory)
    
    // Calculate challenge seeking from playstyle and achievements
    const challengeSeeking = this.calculateChallengeSeeking(gamingProfile)
    
    // Calculate social openness from platform usage and playstyle
    const socialOpenness = this.calculateSocialOpenness(gamingProfile)
    
    // Calculate exploration bias from genre diversity and playstyle
    const explorationBias = this.calculateExplorationBias(gamingProfile)
    
    // Calculate focus stability from mood consistency
    const focusStability = this.calculateFocusStability(moodHistory)
    
    return {
      engagementVolatility,
      challengeSeeking,
      socialOpenness,
      explorationBias,
      focusStability
    }
  }

  /**
   * Convert mood analysis results back to canonical User format
   * Used when updating user's mood profile with analysis results
   */
  static moodAnalysisToUser(
    user: User, 
    moodVector: MoodVector, 
    confidence: number,
    features: NormalizedFeatures
  ): User {
    // Map mood vector back to mood preferences
    const dominantMood = this.vectorToMood(moodVector)
    
    return {
      ...user,
      gamingProfile: {
        ...user.gamingProfile,
        moodProfile: {
          ...user.gamingProfile.moodProfile,
          currentMood: dominantMood,
          moodHistory: [
            ...user.gamingProfile.moodProfile.moodHistory,
            {
              moodId: dominantMood,
              intensity: this.vectorToIntensity(moodVector),
              timestamp: new Date(),
              context: 'mood_analysis'
            }
          ].slice(-100), // Keep last 100 entries
          moodPreferences: {
            ...user.gamingProfile.moodProfile.moodPreferences,
            [dominantMood]: {
              preference: confidence * 100, // Convert confidence to preference
              frequency: (user.gamingProfile.moodProfile.moodPreferences[dominantMood]?.frequency || 1) + 1,
              lastExperienced: new Date()
            }
          }
        }
      },
      updatedAt: new Date()
    }
  }

  /**
   * Create PlayHistory from canonical User gaming sessions
   * Used when mood analysis needs session data
   */
  static userToPlayHistory(user: User, games: Game[] = []): PlayHistory[] {
    const playHistory: PlayHistory[] = []
    
    // Convert mood history entries to play history
    user.gamingProfile.moodProfile.moodHistory
      .filter(entry => entry.gameId) // Only include entries with games
      .forEach(moodEntry => {
        const game = games.find(g => g.id === moodEntry.gameId)
        if (game) {
          playHistory.push({
            id: `session-${moodEntry.timestamp.getTime()}`,
            userId: user.id,
            gameId: moodEntry.gameId!,
            platform: {
              id: moodEntry.gameId!,
              name: game.title,
              code: 'steam' as any, // Default to steam for now
              logo: game.coverImage,
              isConnected: true,
              userId: user.id
            },
            startTime: new Date(moodEntry.timestamp.getTime() - 60 * 60 * 1000), // Assume 1 hour session
            endTime: moodEntry.timestamp,
            duration: 60, // 1 hour in minutes
            sessionType: this.moodToSessionType(moodEntry.moodId),
            mood: {
              id: moodEntry.moodId,
              name: moodEntry.moodId,
              description: '',
              color: '',
              gradient: '',
              icon: '',
              emoji: '',
              intensity: moodEntry.intensity,
              associatedGenres: [],
              timeOfDay: ['morning', 'afternoon', 'evening', 'night'],
              energyLevel: moodEntry.intensity,
              socialPreference: 'any'
            },
            notes: moodEntry.context,
            achievements: []
          })
        }
      })
    
    return playHistory.sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
  }

  // Helper methods for calculations

  private static getDefaultMoodVector(): MoodVector {
    return {
      calm: 0.5,
      competitive: 0.5,
      curious: 0.5,
      social: 0.5,
      focused: 0.5
    }
  }

  private static mapMoodToVector(moodId: string, preference: number): MoodVector {
    // Mood-to-vector mapping based on mood characteristics
    const mappings: Record<string, Partial<MoodVector>> = {
      'relaxed': { calm: preference, competitive: 1 - preference, focused: preference * 0.7 },
      'energetic': { competitive: preference, social: preference * 0.8, calm: 1 - preference },
      'focused': { focused: preference, calm: preference * 0.8, competitive: preference * 0.6 },
      'creative': { curious: preference, calm: preference * 0.7, social: preference * 0.5 },
      'competitive': { competitive: preference, focused: preference * 0.8, social: preference * 0.6 },
      'social': { social: preference, calm: preference * 0.7, curious: preference * 0.8 },
      'nostalgic': { calm: preference, curious: preference * 0.6, focused: preference * 0.5 },
      'adventurous': { curious: preference, competitive: preference * 0.7, social: preference * 0.6 }
    }
    
    const mapping = mappings[moodId] || {}
    return {
      calm: mapping.calm || 0.5,
      competitive: mapping.competitive || 0.5,
      curious: mapping.curious || 0.5,
      social: mapping.social || 0.5,
      focused: mapping.focused || 0.5
    }
  }

  private static vectorToMood(vector: MoodVector): string {
    // Find dominant mood from vector
    const moods = [
      { id: 'calm', value: vector.calm },
      { id: 'competitive', value: vector.competitive },
      { id: 'curious', value: vector.curious },
      { id: 'social', value: vector.social },
      { id: 'focused', value: vector.focused }
    ]
    
    const dominant = moods.reduce((prev, current) => 
      current.value > prev.value ? current : prev
    )
    
    // Map vector components to mood IDs
    if (dominant.id === 'calm') return 'relaxed'
    if (dominant.id === 'competitive') return 'competitive'
    if (dominant.id === 'curious') return 'adventurous'
    if (dominant.id === 'social') return 'social'
    if (dominant.id === 'focused') return 'focused'
    
    return 'relaxed' // Default
  }

  private static vectorToIntensity(vector: MoodVector): number {
    // Convert vector to intensity (1-10 scale)
    const maxValue = Math.max(vector.calm, vector.competitive, vector.curious, vector.social, vector.focused)
    return Math.round(maxValue * 10)
  }

  private static moodToSessionType(moodId: string): 'main' | 'break' | 'social' | 'achievement' {
    const mappings: Record<string, 'main' | 'break' | 'social' | 'achievement'> = {
      'relaxed': 'break',
      'energetic': 'main',
      'focused': 'main',
      'creative': 'main',
      'competitive': 'main',
      'social': 'social',
      'nostalgic': 'break',
      'adventurous': 'main'
    }
    
    return mappings[moodId] || 'main'
  }

  private static calculateEngagementVolatility(moodHistory: any[]): number {
    if (moodHistory.length < 2) return 0.5
    
    // Calculate variance in mood intensities
    const intensities = moodHistory.map(entry => entry.intensity)
    const mean = intensities.reduce((sum, intensity) => sum + intensity, 0) / intensities.length
    const variance = intensities.reduce((sum, intensity) => sum + Math.pow(intensity - mean, 2), 0) / intensities.length
    
    // Normalize to 0-1 scale
    return Math.min(variance / 25, 1) // Assuming max variance of 25 (intensity range 1-10)
  }

  private static calculateChallengeSeeking(gamingProfile: any): number {
    // Based on achievements, completion rate, and competitive playstyle
    const achievementRatio = gamingProfile.achievementsCount / Math.max(gamingProfile.gamesPlayed, 1)
    const completionRatio = gamingProfile.gamesCompleted / Math.max(gamingProfile.gamesPlayed, 1)
    const competitiveScore = gamingProfile.playstyleArchetypes
      .find((a: any) => a.id === 'competitive')?.score || 0
    
    return Math.min((achievementRatio + completionRatio + competitiveScore / 100) / 3, 1)
  }

  private static calculateSocialOpenness(gamingProfile: any): number {
    // Based on social playstyle, platform diversity, and friend count
    const socialScore = gamingProfile.playstyleArchetypes
      .find((a: any) => a.id === 'socializer')?.score || 0
    const platformDiversity = gamingProfile.primaryPlatforms.length / 5 // Normalize to max 5 platforms
    const friendCount = gamingProfile.social.friends.length / 100 // Normalize to max 100 friends
    
    return Math.min((socialScore / 100 + platformDiversity + friendCount) / 3, 1)
  }

  private static calculateExplorationBias(gamingProfile: any): number {
    // Based on genre diversity, explorer playstyle, and game variety
    const explorerScore = gamingProfile.playstyleArchetypes
      .find((a: any) => a.id === 'explorer')?.score || 0
    const genreDiversity = Object.keys(gamingProfile.genreAffinities).length / 20 // Normalize to max 20 genres
    const gameVariety = gamingProfile.gamesPlayed / 100 // Normalize to max 100 games
    
    return Math.min((explorerScore / 100 + genreDiversity + gameVariety) / 3, 1)
  }

  private static calculateFocusStability(moodHistory: any[]): number {
    if (moodHistory.length < 2) return 0.5
    
    // Calculate mood consistency over time
    const recentMoods = moodHistory.slice(-10) // Last 10 entries
    const moodCounts = recentMoods.reduce((acc, entry) => {
      acc[entry.moodId] = (acc[entry.moodId] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const maxCount = Math.max(...Object.values(moodCounts).map((v: unknown) => typeof v === 'number' ? v : 0))
    const consistency = maxCount / recentMoods.length
    
    return consistency
  }
}

/**
 * Helper function to safely convert User to MoodVector
 */
export function safeUserToMoodVector(user: User | null | undefined): MoodVector | null {
  if (!user) return null
  
  try {
    return MoodAnalysisAdapter.userToMoodVector(user)
  } catch (error) {
    console.error('Error converting User to MoodVector:', error)
    return null
  }
}

/**
 * Helper function to safely convert User to BehavioralSignals
 */
export function safeUserToBehavioralSignals(user: User | null | undefined, games?: Game[], activities?: Activity[]): BehavioralSignal[] {
  if (!user) return []
  
  try {
    return MoodAnalysisAdapter.userToBehavioralSignals(user, games, activities)
  } catch (error) {
    console.error('Error converting User to BehavioralSignals:', error)
    return []
  }
}

/**
 * Helper function to safely convert User to NormalizedFeatures
 */
export function safeUserToNormalizedFeatures(user: User | null | undefined): NormalizedFeatures | null {
  if (!user) return null
  
  try {
    return MoodAnalysisAdapter.userToNormalizedFeatures(user)
  } catch (error) {
    console.error('Error converting User to NormalizedFeatures:', error)
    return null
  }
}
