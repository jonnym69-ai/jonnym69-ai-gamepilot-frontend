import { MoodPersonaService } from '../services/moodPersonaService'
import { MoodPersonaIntegration } from '@gamepilot/identity-engine'
import { databaseService } from '../services/database'
import { addMoodPersonaTables, initializePersonaProfiles } from '../migrations/addMoodPersonaTables'
import type { EnhancedMoodId } from '@gamepilot/static-data'

/**
 * End-to-end validation test for mood-persona system
 * Tests the complete data flow: Frontend → API → Database → Persona Engine → Frontend
 */
export class MoodPersonaValidator {
  private moodPersonaService: MoodPersonaService
  private moodPersonaIntegration: MoodPersonaIntegration
  private testUserId: string

  constructor() {
    this.moodPersonaService = new MoodPersonaService((databaseService as any).db)
    this.moodPersonaIntegration = new MoodPersonaIntegration()
    this.testUserId = 'test-user-validation'
  }

  /**
   * Run complete end-to-end validation
   */
  async runValidation(): Promise<{
    success: boolean
    results: ValidationResult[]
    issues: string[]
    recommendations: string[]
  }> {
    const results: ValidationResult[] = []
    const issues: string[] = []
    const recommendations: string[] = []

    console.log('🔍 Starting Mood-Persona System Validation...')

    try {
      // 1. Test database setup
      const dbResult = await this.testDatabaseSetup()
      results.push(dbResult)
      if (!dbResult.success) {
        issues.push('Database setup failed')
        recommendations.push('Run mood-persona migration before testing')
      }

      // 2. Test mood selection flow
      const moodSelectionResult = await this.testMoodSelectionFlow()
      results.push(moodSelectionResult)
      if (!moodSelectionResult.success) {
        issues.push('Mood selection flow has issues')
      }

      // 3. Test user action tracking
      const userActionResult = await this.testUserActionTracking()
      results.push(userActionResult)
      if (!userActionResult.success) {
        issues.push('User action tracking has issues')
      }

      // 4. Test recommendation events
      const recommendationResult = await this.testRecommendationEvents()
      results.push(recommendationResult)
      if (!recommendationResult.success) {
        issues.push('Recommendation event tracking has issues')
      }

      // 5. Test persona profile updates
      const personaResult = await this.testPersonaProfileUpdates()
      results.push(personaResult)
      if (!personaResult.success) {
        issues.push('Persona profile updates have issues')
      }

      // 6. Test learning analytics
      const analyticsResult = await this.testLearningAnalytics()
      results.push(analyticsResult)
      if (!analyticsResult.success) {
        issues.push('Learning analytics have issues')
      }

      // 7. Test data consistency
      const consistencyResult = await this.testDataConsistency()
      results.push(consistencyResult)
      if (!consistencyResult.success) {
        issues.push('Data consistency issues detected')
      }

      // Generate recommendations based on findings
      recommendations.push(...this.generateRecommendations(results, issues))

      const success = issues.length === 0

      console.log('\n📊 Validation Results:')
      console.log(`✅ Success: ${success}`)
      console.log(`📋 Tests Run: ${results.length}`)
      console.log(`⚠️ Issues Found: ${issues.length}`)
      console.log(`💡 Recommendations: ${recommendations.length}`)

      return {
        success,
        results,
        issues,
        recommendations
      }

    } catch (error) {
      console.error('❌ Validation failed with error:', error)
      return {
        success: false,
        results,
        issues: ['Validation failed with unexpected error'],
        recommendations: ['Check error logs and retry validation']
      }
    }
  }

  /**
   * Test 1: Database Setup
   */
  private async testDatabaseSetup(): Promise<ValidationResult> {
    try {
      console.log('\n1️⃣ Testing Database Setup...')

      // Check if mood-persona tables exist
      const db = (databaseService as any).db
      if (!db) {
        return {
          test: 'Database Setup',
          success: false,
          details: 'Database not initialized',
          data: null
        }
      }

      // Check if mood_selections table exists
      const moodSelectionsTable = await db.get(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='mood_selections'
      `)

      if (!moodSelectionsTable) {
        return {
          test: 'Database Setup',
          success: false,
          details: 'Mood-persona tables not created - run migration first',
          data: { missingTables: ['mood_selections', 'persona_profile', 'user_actions'] }
        }
      }

      return {
        test: 'Database Setup',
        success: true,
        details: 'Database and tables properly initialized',
        data: { tablesExist: true }
      }

    } catch (error) {
      return {
        test: 'Database Setup',
        success: false,
        details: `Database setup failed: ${error}`,
        data: null
      }
    }
  }

  /**
   * Test 2: Mood Selection Flow
   */
  private async testMoodSelectionFlow(): Promise<ValidationResult> {
    try {
      console.log('\n2️⃣ Testing Mood Selection Flow...')

      // Create test mood selection
      const moodSelection = await this.moodPersonaService.createMoodSelection({
        userId: this.testUserId,
        primaryMood: 'energetic' as EnhancedMoodId,
        secondaryMood: 'competitive' as EnhancedMoodId,
        intensity: 0.8,
        timestamp: new Date(),
        context: {
          timeOfDay: 'afternoon',
          dayOfWeek: 2,
          trigger: 'manual'
        },
        outcomes: {
          gamesRecommended: 10,
          gamesLaunched: 3,
          ignoredRecommendations: 2
        }
      })

      // Process with persona integration
      const enhancedIdentity = await this.moodPersonaIntegration.processMoodSelection(
        this.testUserId,
        moodSelection
      )

      // Check if persona profile was updated
      const profile = await this.moodPersonaService.getPersonaProfile(this.testUserId)

      const success = moodSelection && enhancedIdentity && profile
      const details = success 
        ? 'Mood selection successfully processed and persona updated'
        : 'Mood selection flow failed at some point'

      return {
        test: 'Mood Selection Flow',
        success: !!success,
        details,
        data: {
          moodSelectionId: moodSelection?.id,
          personaUpdated: !!profile,
          enhancedIdentityGenerated: !!enhancedIdentity
        }
      }

    } catch (error) {
      return {
        test: 'Mood Selection Flow',
        success: false,
        details: `Mood selection flow failed: ${error}`,
        data: null
      }
    }
  }

  /**
   * Test 3: User Action Tracking
   */
  private async testUserActionTracking(): Promise<ValidationResult> {
    try {
      console.log('\n3️⃣ Testing User Action Tracking...')

      // Create test user action
      const userAction = await this.moodPersonaService.createUserAction({
        userId: this.testUserId,
        type: 'launch',
        gameId: 'test-game-123',
        gameTitle: 'Test Game',
        moodContext: {
          primaryMood: 'energetic' as EnhancedMoodId,
          secondaryMood: 'competitive' as EnhancedMoodId
        },
        timestamp: new Date(),
        metadata: {
          sessionDuration: 45,
          rating: 4
        }
      })

      // Learn from user action
      await this.moodPersonaIntegration.learnFromUserAction(this.testUserId, userAction as any)

      // Verify action was stored
      const actions = await this.moodPersonaService.getUserActions(this.testUserId, 10)

      const success = userAction && actions.length > 0
      const details = success 
        ? 'User action successfully tracked and processed'
        : 'User action tracking failed'

      return {
        test: 'User Action Tracking',
        success,
        details,
        data: {
          actionId: userAction?.id,
          totalActions: actions.length,
          actionProcessed: true
        }
      }

    } catch (error) {
      return {
        test: 'User Action Tracking',
        success: false,
        details: `User action tracking failed: ${error}`,
        data: null
      }
    }
  }

  /**
   * Test 4: Recommendation Events
   */
  private async testRecommendationEvents(): Promise<ValidationResult> {
    try {
      console.log('\n4️⃣ Testing Recommendation Events...')

      // Create test recommendation event
      const recommendationEvent = await this.moodPersonaService.createRecommendationEvent({
        userId: this.testUserId,
        moodContext: {
          primaryMood: 'energetic' as EnhancedMoodId,
          secondaryMood: 'competitive' as EnhancedMoodId,
          intensity: 0.8
        },
        recommendedGames: [
          {
            gameId: 'game-1',
            name: 'Action Game 1',
            score: 85,
            reasoning: ['High energy', 'Competitive']
          },
          {
            gameId: 'game-2',
            name: 'Action Game 2',
            score: 78,
            reasoning: ['Fast-paced', 'Multiplayer']
          }
        ],
        clickedGameId: 'game-1',
        successFlag: true,
        timestamp: new Date()
      })

      // Verify event was stored
      const events = await this.moodPersonaService.getRecommendationEvents(this.testUserId, 10)

      const success = recommendationEvent && events.length > 0
      const details = success 
        ? 'Recommendation event successfully logged'
        : 'Recommendation event logging failed'

      return {
        test: 'Recommendation Events',
        success,
        details,
        data: {
          eventId: recommendationEvent?.id,
          totalEvents: events.length,
          successRate: events.filter(e => e.successFlag).length / events.length
        }
      }

    } catch (error) {
      return {
        test: 'Recommendation Events',
        success: false,
        details: `Recommendation event tracking failed: ${error}`,
        data: null
      }
    }
  }

  /**
   * Test 5: Persona Profile Updates
   */
  private async testPersonaProfileUpdates(): Promise<ValidationResult> {
    try {
      console.log('\n5️⃣ Testing Persona Profile Updates...')

      // Get current profile
      const currentProfile = await this.moodPersonaService.getPersonaProfile(this.testUserId)

      if (!currentProfile) {
        // Create profile if it doesn't exist
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
        })

        return {
          test: 'Persona Profile Updates',
          success: true,
          details: 'Persona profile created successfully',
          data: { profileId: newProfile.id, created: true }
        }
      }

      // Update profile
      const updatedProfile = await this.moodPersonaService.updatePersonaProfile(this.testUserId, {
        confidence: 0.5,
        sampleSize: 10,
        genreWeights: { ...currentProfile.genreWeights, puzzle: 0.7 }
      })

      const success = updatedProfile && updatedProfile.confidence > currentProfile.confidence
      const details = success 
        ? 'Persona profile successfully updated'
        : 'Persona profile update failed'

      return {
        test: 'Persona Profile Updates',
        success,
        details,
        data: {
          profileId: updatedProfile?.id,
          confidenceIncreased: updatedProfile?.confidence > currentProfile.confidence,
          sampleSizeIncreased: updatedProfile?.sampleSize > currentProfile.sampleSize
        }
      }

    } catch (error) {
      return {
        test: 'Persona Profile Updates',
        success: false,
        details: `Persona profile update failed: ${error}`,
        data: null
      }
    }
  }

  /**
   * Test 6: Learning Analytics
   */
  private async testLearningAnalytics(): Promise<ValidationResult> {
    try {
      console.log('\n6️⃣ Testing Learning Analytics...')

      // Get mood selection stats
      const moodStats = await this.moodPersonaService.getMoodSelectionStats(this.testUserId, 30)

      // Get recommendation success rate
      const recommendationSuccess = await this.moodPersonaService.getRecommendationSuccessRate(this.testUserId, 30)

      // Get mood prediction accuracy
      const predictionAccuracy = await this.moodPersonaService.getMoodPredictionAccuracy(this.testUserId, 30)

      const success = moodStats && recommendationSuccess >= 0 && predictionAccuracy >= 0
      const details = success 
        ? 'Learning analytics working correctly'
        : 'Learning analytics have issues'

      return {
        test: 'Learning Analytics',
        success,
        details,
        data: {
          moodStatsCount: Object.keys(moodStats).length,
          recommendationSuccessRate: recommendationSuccess,
          predictionAccuracy: predictionAccuracy
        }
      }

    } catch (error) {
      return {
        test: 'Learning Analytics',
        success: false,
        details: `Learning analytics failed: ${error}`,
        data: null
      }
    }
  }

  /**
   * Test 7: Data Consistency
   */
  private async testDataConsistency(): Promise<ValidationResult> {
    try {
      console.log('\n7️⃣ Testing Data Consistency...')

      // Get mood selections
      const moodSelections = await this.moodPersonaService.getMoodSelections(this.testUserId, 10)

      // Get user actions
      const userActions = await this.moodPersonaService.getUserActions(this.testUserId, 10)

      // Get persona profile
      const personaProfile = await this.moodPersonaService.getPersonaProfile(this.testUserId)

      // Check consistency
      const issues: string[] = []

      if (moodSelections.length > 0 && !personaProfile) {
        issues.push('Mood selections exist but no persona profile')
      }

      if (userActions.length > 0 && moodSelections.length === 0) {
        issues.push('User actions exist but no mood selections')
      }

      // Check if mood selections have proper context
      moodSelections.forEach(selection => {
        if (!selection.context || !selection.outcomes) {
          issues.push(`Mood selection ${selection.id} missing context or outcomes`)
        }
      })

      const success = issues.length === 0
      const details = success 
        ? 'Data consistency verified'
        : `Data consistency issues: ${issues.join(', ')}`

      return {
        test: 'Data Consistency',
        success,
        details,
        data: {
          moodSelectionsCount: moodSelections.length,
          userActionsCount: userActions.length,
          hasPersonaProfile: !!personaProfile,
          consistencyIssues: issues
        }
      }

    } catch (error) {
      return {
        test: 'Data Consistency',
        success: false,
        details: `Data consistency check failed: ${error}`,
        data: null
      }
    }
  }

  /**
   * Generate recommendations based on validation results
   */
  private generateRecommendations(results: ValidationResult[], issues: string[]): string[] {
    const recommendations: string[] = []

    // Check for common issues
    const failedTests = results.filter(r => !r.success)
    const testNames = failedTests.map(r => r.test)

    if (testNames.includes('Database Setup')) {
      recommendations.push('HIGH PRIORITY: Run mood-persona migration: addMoodPersonaTables()')
    }

    if (testNames.includes('Mood Selection Flow')) {
      recommendations.push('HIGH PRIORITY: Fix mood selection API integration and persona processing')
    }

    if (testNames.includes('User Action Tracking')) {
      recommendations.push('MEDIUM PRIORITY: Verify user action API endpoints and learning integration')
    }

    if (testNames.includes('Recommendation Events')) {
      recommendations.push('MEDIUM PRIORITY: Fix recommendation event logging and performance tracking')
    }

    if (testNames.includes('Persona Profile Updates')) {
      recommendations.push('MEDIUM PRIORITY: Verify persona profile CRUD operations')
    }

    if (testNames.includes('Learning Analytics')) {
      recommendations.push('LOW PRIORITY: Fix analytics aggregation methods')
    }

    if (testNames.includes('Data Consistency')) {
      recommendations.push('HIGH PRIORITY: Fix data consistency issues between tables')
    }

    // General recommendations
    if (issues.length > 0) {
      recommendations.push('Implement comprehensive error handling and logging')
      recommendations.push('Add database transaction support for complex operations')
      recommendations.push('Implement data validation at API and database levels')
    }

    if (failedTests.length > 3) {
      recommendations.push('Consider running integration tests in sequence to identify root cause')
    }

    return recommendations
  }
}

interface ValidationResult {
  test: string
  success: boolean
  details: string
  data: any
}

// Export for use in testing
export default MoodPersonaValidator
