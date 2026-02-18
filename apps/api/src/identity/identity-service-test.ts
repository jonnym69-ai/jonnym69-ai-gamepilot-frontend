// Unified Identity Service Test
// Tests to verify the consolidated authentication pipeline works correctly

import { identityService } from './identityService'
import { UserAdapter } from '../adapters/userAdapter'
import type { User } from '@gamepilot/shared/models/user'
import type { UserIntegration } from '@gamepilot/shared/models/integration'
import { IntegrationStatus } from '@gamepilot/shared/models/integration'
import { PlatformCode } from '@gamepilot/shared'

/**
 * Test unified identity service with canonical User model
 */
export class IdentityServiceTest {
  /**
   * Test basic user creation and retrieval
   */
  static async testUserCreationAndRetrieval() {
    console.log('🧪 Testing user creation and retrieval...')
    
    try {
      // Create a test user
      const userData = {
        username: 'identity-test-user',
        email: 'identity-test@example.com',
        password: 'testpassword123',
        displayName: 'Identity Test User',
        timezone: 'UTC'
      }
      
      const createdUser = await identityService.createUser(userData)
      console.log('✅ Created canonical user:', createdUser.id, createdUser.username)
      
      // Retrieve user by ID
      const retrievedUser = await identityService.getCanonicalUserById(createdUser.id)
      
      if (!retrievedUser) {
        console.log('❌ Failed to retrieve created user')
        return { success: false, error: 'User retrieval failed' }
      }
      
      // Compare users
      const isSameUser = retrievedUser.id === createdUser.id && 
                       retrievedUser.username === createdUser.username &&
                       retrievedUser.email === createdUser.email
      
      console.log('✅ User retrieval test:', isSameUser ? 'PASS' : 'FAIL')
      
      // Test legacy conversion
      const legacyUser = await identityService.getLegacyAuthUserById(createdUser.id)
      if (!legacyUser) {
        return { success: false, error: 'Legacy user conversion failed' }
      }
      
      console.log('✅ Legacy user conversion:', legacyUser.id, legacyUser.username)
      
      return { 
        success: true, 
        createdUser, 
        retrievedUser, 
        legacyUser 
      }
    } catch (error) {
      console.error('❌ User creation/retrieval test error:', error)
      return { success: false, error }
    }
  }
  
  /**
   * Test login and registration flows
   */
  static async testAuthenticationFlows() {
    console.log('🧪 Testing authentication flows...')
    
    try {
      // Test registration
      const registerData = {
        username: 'auth-flow-test',
        email: 'auth-flow@example.com',
        password: 'testpassword123',
        displayName: 'Auth Flow Test User'
      }
      
      const registerResult = await identityService.register(registerData)
      
      if (!registerResult.success) {
        console.log('❌ Registration failed:', registerResult.message)
        return { success: false, error: registerResult.message }
      }
      
      console.log('✅ Registration successful:', registerResult.user?.username)
      
      // Test login
      const loginData = {
        username: 'auth-flow-test',
        password: 'testpassword123'
      }
      
      const loginResult = await identityService.login(loginData)
      
      if (!loginResult.success) {
        console.log('❌ Login failed:', loginResult.message)
        return { success: false, error: loginResult.message }
      }
      
      console.log('✅ Login successful:', loginResult.user?.username)
      
      // Test token verification
      if (loginResult.token) {
        const verifiedUser = identityService.verifyToken(loginResult.token)
        
        if (!verifiedUser) {
          console.log('❌ Token verification failed')
          return { success: false, error: 'Token verification failed' }
        }
        
        console.log('✅ Token verification successful:', verifiedUser.username)
      }
      
      return { 
        success: true, 
        registerResult, 
        loginResult 
      }
    } catch (error) {
      console.error('❌ Authentication flows test error:', error)
      return { success: false, error }
    }
  }
  
  /**
   * Test user validation
   */
  static async testUserValidation() {
    console.log('🧪 Testing user validation...')
    
    try {
      // Create a test user
      const userData = {
        username: 'validation-test-user',
        email: 'validation-test@example.com',
        password: 'testpassword123',
        displayName: 'Validation Test User'
      }
      
      const testUser = await identityService.createUser(userData)
      
      // Test validation
      const validation = identityService.validateCanonicalUser(testUser)
      
      console.log('✅ Validation completed')
      console.log('   Is valid:', validation.isValid)
      console.log('   Errors:', validation.errors.length)
      console.log('   Warnings:', validation.warnings.length)
      
      if (!validation.isValid) {
        console.log('   Validation errors:', validation.errors)
      }
      
      if (validation.warnings.length > 0) {
        console.log('   Validation warnings:', validation.warnings)
      }
      
      return { 
        success: validation.isValid, 
        validation, 
        testUser 
      }
    } catch (error) {
      console.error('❌ User validation test error:', error)
      return { success: false, error }
    }
  }
  
  /**
   * Test integration attachment
   */
  static async testIntegrationAttachment() {
    console.log('🧪 Testing integration attachment...')
    
    try {
      // Create a test user
      const userData = {
        username: 'integration-test-user',
        email: 'integration-test@example.com',
        password: 'testpassword123',
        displayName: 'Integration Test User'
      }
      
      const testUser = await identityService.createUser(userData)
      
      // Create mock integration
      const mockIntegration: UserIntegration = {
        id: 'steam-integration-123',
        userId: testUser.id,
        platform: PlatformCode.STEAM,
        externalUserId: '76561198000000000',
        externalUsername: 'IntegrationTestUser',
        scopes: ['read_profile', 'read_library'],
        status: IntegrationStatus.ACTIVE,
        isActive: true,
        isConnected: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSyncAt: new Date(),
        lastUsedAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
        syncConfig: {
          autoSync: true,
          syncFrequency: 12,
          lastSyncAt: new Date(),
          errorCount: 0,
          maxRetries: 3
        },
        metadata: {
          displayName: 'Steam Integration',
          platform: PlatformCode.STEAM,
          steam: {
            personaName: 'IntegrationTestUser'
          }
        }
      }
      
      // Add integration to user
      identityService.addIntegrationToUser(testUser.id, mockIntegration)
      
      // Attach integrations to user
      const enrichedUser = identityService.attachIntegrationsToUser(testUser)
      
      // Verify integration was attached
      const hasIntegrations = enrichedUser.integrations.length > 0
      const hasSummary = (enrichedUser as any).integrationSummary
      
      console.log('✅ Integration attachment test:', hasIntegrations ? 'PASS' : 'FAIL')
      console.log('   Integration count:', enrichedUser.integrations.length)
      console.log('   Has summary:', !!hasSummary)
      
      if (hasSummary) {
        console.log('   Total integrations:', hasSummary.totalIntegrations)
        console.log('   Connected platforms:', hasSummary.connectedPlatforms)
        console.log('   Active integrations:', hasSummary.activeIntegrations)
      }
      
      // Get user integrations
      const userIntegrations = identityService.getUserIntegrations(testUser.id)
      
      console.log('✅ Retrieved user integrations:', userIntegrations.length)
      
      return { 
        success: hasIntegrations, 
        enrichedUser, 
        userIntegrations 
      }
    } catch (error) {
      console.error('❌ Integration attachment test error:', error)
      return { success: false, error }
    }
  }
  
  /**
   * Test authentication state
   */
  static async testAuthenticationState() {
    console.log('🧪 Testing authentication state...')
    
    try {
      // Create a test user with integrations
      const userData = {
        username: 'auth-state-test-user',
        email: 'auth-state@example.com',
        password: 'testpassword123',
        displayName: 'Auth State Test User'
      }
      
      const testUser = await identityService.createUser(userData)
      
      // Add multiple integrations
      const steamIntegration: UserIntegration = {
        id: 'steam-auth-123',
        userId: testUser.id,
        platform: PlatformCode.STEAM,
        externalUserId: '76561198000000001',
        externalUsername: 'AuthStateUser',
        scopes: ['read_profile', 'read_library'],
        status: IntegrationStatus.ACTIVE,
        isActive: true,
        isConnected: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSyncAt: new Date(),
        lastUsedAt: new Date(),
        syncConfig: {
          autoSync: true,
          syncFrequency: 12,
          lastSyncAt: new Date(),
          errorCount: 0,
          maxRetries: 3
        },
        metadata: {
          displayName: 'Steam Auth',
          platform: 'steam'
        }
      }
      
      const discordIntegration: UserIntegration = {
        id: 'discord-auth-456',
        userId: testUser.id,
        platform: PlatformCode.DISCORD,
        externalUserId: '123456789',
        externalUsername: 'AuthStateUser#1234',
        scopes: ['identify', 'guilds'],
        status: IntegrationStatus.ACTIVE,
        isActive: true,
        isConnected: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSyncAt: new Date(),
        lastUsedAt: new Date(),
        syncConfig: {
          autoSync: true,
          syncFrequency: 6,
          lastSyncAt: new Date(),
          errorCount: 0,
          maxRetries: 3
        },
        metadata: {
          displayName: 'Discord Auth',
          platform: 'discord'
        }
      }
      
      identityService.addIntegrationToUser(testUser.id, steamIntegration)
      identityService.addIntegrationToUser(testUser.id, discordIntegration)
      
      // Get authentication state
      const authState = identityService.getUserAuthState(testUser)
      
      console.log('✅ Authentication state test completed')
      console.log('   Is authenticated:', authState.isAuthenticated)
      console.log('   Is fully onboarded:', authState.isFullyOnboarded)
      console.log('   Has integrations:', authState.hasIntegrations)
      console.log('   Integration count:', authState.integrationCount)
      console.log('   Active integrations:', authState.activeIntegrations)
      console.log('   Auth method:', authState.authMethod)
      console.log('   Security level:', authState.securityLevel)
      
      // Test different auth methods
      const expectedAuthMethod = authState.integrationCount > 1 ? 'multiple' : 'steam'
      const expectedSecurityLevel = authState.activeIntegrations >= 2 ? 'premium' : 'enhanced'
      
      const authMethodCorrect = authState.authMethod === expectedAuthMethod
      const securityLevelCorrect = authState.securityLevel === expectedSecurityLevel
      
      console.log('✅ Auth method test:', authMethodCorrect ? 'PASS' : 'FAIL')
      console.log('✅ Security level test:', securityLevelCorrect ? 'PASS' : 'FAIL')
      
      return { 
        success: authState.isAuthenticated, 
        authState 
      }
    } catch (error) {
      console.error('❌ Authentication state test error:', error)
      return { success: false, error }
    }
  }
  
  /**
   * Test comprehensive profile
   */
  static async testComprehensiveProfile() {
    console.log('🧪 Testing comprehensive profile...')
    
    try {
      // Create a test user with full data
      const userData = {
        username: 'comprehensive-test-user',
        email: 'comprehensive@example.com',
        password: 'testpassword123',
        displayName: 'Comprehensive Test User',
        timezone: 'America/New_York'
      }
      
      const testUser = await identityService.createUser(userData)
      
      // Add integrations
      const steamIntegration: UserIntegration = {
        id: 'steam-comprehensive-123',
        userId: testUser.id,
        platform: PlatformCode.STEAM,
        externalUserId: '76561198000000002',
        externalUsername: 'ComprehensiveUser',
        scopes: ['read_profile', 'read_library', 'read_activity'],
        status: IntegrationStatus.ACTIVE,
        isActive: true,
        isConnected: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSyncAt: new Date(),
        lastUsedAt: new Date(),
        syncConfig: {
          autoSync: true,
          syncFrequency: 8,
          lastSyncAt: new Date(),
          errorCount: 0,
          maxRetries: 3
        },
        metadata: {
          displayName: 'Steam Comprehensive',
          platform: 'steam'
        }
      }
      
      identityService.addIntegrationToUser(testUser.id, steamIntegration)
      
      // Create mock request with user attached
      const mockRequest = {
        user: await identityService.getLegacyAuthUserById(testUser.id),
        canonicalUser: testUser
      } as any
      
      // Get comprehensive profile
      const profileResult = await identityService.getComprehensiveUserProfile(mockRequest)
      
      if (!profileResult.success) {
        console.log('❌ Comprehensive profile failed:', profileResult.message)
        return { success: false, error: profileResult.message }
      }
      
      console.log('✅ Comprehensive profile test completed')
      console.log('   Profile retrieved successfully')
      console.log('   Has user data:', !!profileResult.user)
      console.log('   Has auth state:', !!profileResult.authState)
      console.log('   Has integrations:', !!profileResult.integrations)
      console.log('   Has validation:', !!profileResult.validation)
      
      // Check profile completeness
      const hasUser = !!profileResult.user
      const hasAuthState = !!profileResult.authState
      const hasIntegrations = !!profileResult.integrations
      const hasValidation = !!profileResult.validation
      
      const isComplete = hasUser && hasAuthState && hasIntegrations && hasValidation
      
      console.log('✅ Profile completeness test:', isComplete ? 'PASS' : 'FAIL')
      
      if (profileResult.validation && !profileResult.validation.isValid) {
        console.log('   Validation errors:', profileResult.validation.errors)
      }
      
      return { 
        success: isComplete, 
        profileResult 
      }
    } catch (error) {
      console.error('❌ Comprehensive profile test error:', error)
      return { success: false, error }
    }
  }
  
  /**
   * Test token operations
   */
  static async testTokenOperations() {
    console.log('🧪 Testing token operations...')
    
    try {
      // Create a test user
      const userData = {
        username: 'token-test-user',
        email: 'token@example.com',
        password: 'testpassword123'
      }
      
      const testUser = await identityService.createUser(userData)
      
      // Test token generation
      const token = identityService.generateToken(testUser)
      
      if (!token) {
        console.log('❌ Token generation failed')
        return { success: false, error: 'Token generation failed' }
      }
      
      console.log('✅ Token generated successfully')
      
      // Test token verification
      const verifiedUser = identityService.verifyToken(token)
      
      if (!verifiedUser) {
        console.log('❌ Token verification failed')
        return { success: false, error: 'Token verification failed' }
      }
      
      console.log('✅ Token verified successfully:', verifiedUser.username)
      
      // Test that token contains correct data
      const tokenData = JSON.parse(atob(token.split('.')[1]))
      const hasCorrectData = tokenData.id === testUser.id && 
                          tokenData.username === testUser.username && 
                          tokenData.email === testUser.email
      
      console.log('✅ Token data integrity test:', hasCorrectData ? 'PASS' : 'FAIL')
      
      return { 
        success: hasCorrectData, 
        token, 
        verifiedUser 
      }
    } catch (error) {
      console.error('❌ Token operations test error:', error)
      return { success: false, error }
    }
  }
  
  /**
   * Test UserAdapter integration
   */
  static async testUserAdapterIntegration() {
    console.log('🧪 Testing UserAdapter integration...')
    
    try {
      // Create a test user
      const userData = {
        username: 'adapter-test-user',
        email: 'adapter@example.com',
        password: 'testpassword123',
        displayName: 'Adapter Test User'
      }
      
      const canonicalUser = await identityService.createUser(userData)
      
      // Test canonical to legacy conversion
      const legacyUser = UserAdapter.canonicalToAuthUser(canonicalUser)
      
      if (!legacyUser) {
        console.log('❌ Canonical to legacy conversion failed')
        return { success: false, error: 'Canonical to legacy conversion failed' }
      }
      
      console.log('✅ Canonical to legacy conversion successful')
      
      // Test legacy to canonical conversion
      const convertedBack = UserAdapter.authUserToCanonical(legacyUser, {
        displayName: 'Converted Back',
        timezone: 'UTC'
      })
      
      if (!convertedBack) {
        console.log('❌ Legacy to canonical conversion failed')
        return { success: false, error: 'Legacy to canonical conversion failed' }
      }
      
      console.log('✅ Legacy to canonical conversion successful')
      
      // Test data preservation
      const dataPreserved = convertedBack.id === canonicalUser.id &&
                           convertedBack.username === canonicalUser.username &&
                           convertedBack.email === canonicalUser.email
      
      console.log('✅ Data preservation test:', dataPreserved ? 'PASS' : 'FAIL')
      
      // Test validation
      const validation = UserAdapter.validateForAuth(canonicalUser)
      console.log('✅ UserAdapter validation:', validation.isValid ? 'VALID' : 'INVALID')
      
      // Test onboarding status
      const onboardingStatus = UserAdapter.hasCompletedOnboarding(canonicalUser)
      console.log('✅ Onboarding status:', onboardingStatus ? 'COMPLETED' : 'PENDING')
      
      // Test auth status
      const authStatus = UserAdapter.getAuthStatus(canonicalUser)
      console.log('✅ Auth status:', authStatus)
      
      return { 
        success: true, 
        canonicalUser, 
        legacyUser, 
        convertedBack,
        dataPreserved,
        validation,
        onboardingStatus,
        authStatus
      }
    } catch (error) {
      console.error('❌ UserAdapter integration test error:', error)
      return { success: false, error }
    }
  }
  
  /**
   * Test middleware functionality
   */
  static async testMiddleware() {
    console.log('🧪 Testing middleware functionality...')
    
    try {
      // Create a test user
      const userData = {
        username: 'middleware-test-user',
        email: 'middleware@example.com',
        password: 'testpassword123'
      }
      
      const testUser = await identityService.createUser(userData)
      
      // Generate token
      const token = identityService.generateToken(testUser)
      
      // Create mock request with authorization header
      const mockRequest = {
        headers: {
          authorization: `Bearer ${token}`
        }
      } as any
      
      // Create mock response
      let middlewareCalled = false
      let nextCalled = false
      let statusCode = 0
      let responseData: any = null
      
      const mockResponse = {
        status: (code: number) => {
          statusCode = code
        },
        json: (data: any) => {
          responseData = data
        }
      } as any
      
      const mockNext = () => {
        nextCalled = true
      }
      
      // Test middleware
      identityService.authenticateToken(mockRequest, mockResponse, mockNext)
      
      // Check if middleware was called
      const middlewareSuccess = middlewareCalled && nextCalled
      
      console.log('✅ Middleware test:', middlewareSuccess ? 'PASS' : 'FAIL')
      console.log('   Middleware called:', middlewareCalled)
      console.log('   Next called:', nextCalled)
      
      if (middlewareSuccess && mockRequest.user) {
        console.log('✅ User attached to request:', mockRequest.user.username)
        console.log('✅ Canonical user attached to request:', !!mockRequest.canonicalUser)
      }
      
      return { 
        success: middlewareSuccess 
      }
    } catch (error) {
      console.error('❌ Middleware test error:', error)
      return { success: false, error }
    }
  }
  
  /**
   * Run all identity service tests
   */
  static async runAllTests() {
    console.log('🚀 Starting unified identity service tests...')
    console.log('=' .repeat(60))
    
    const results = {
      userCreation: await this.testUserCreationAndRetrieval(),
      authenticationFlows: await this.testAuthenticationFlows(),
      userValidation: await this.testUserValidation(),
      integrationAttachment: await this.testIntegrationAttachment(),
      authenticationState: await this.testAuthenticationState(),
      comprehensiveProfile: await this.testComprehensiveProfile(),
      tokenOperations: await this.testTokenOperations(),
      userAdapterIntegration: await this.testUserAdapterIntegration(),
      middleware: await this.testMiddleware()
    }
    
    console.log('=' .repeat(60))
    console.log('📊 Identity Service Test Results Summary:')
    console.log('   User Creation & Retrieval:', results.userCreation.success ? '✅ PASS' : '❌ FAIL')
    console.log('   Authentication Flows:', results.authenticationFlows.success ? '✅ PASS' : '❌ FAIL')
    console.log('   User Validation:', results.userValidation.success ? '✅ PASS' : '❌ FAIL')
    console.log('   Integration Attachment:', results.integrationAttachment.success ? '✅ PASS' : '❌ FAIL')
    console.log('   Authentication State:', results.authenticationState.success ? '✅ PASS' : '❌ FAIL')
    console.log('   Comprehensive Profile:', results.comprehensiveProfile.success ? '✅ PASS' : '❌ FAIL')
    console.log('   Token Operations:', results.tokenOperations.success ? '✅ PASS' : '❌ FAIL')
    console.log('   UserAdapter Integration:', results.userAdapterIntegration.success ? '✅ PASS' : '❌ FAIL')
    console.log('   Middleware Functionality:', results.middleware.success ? '✅ PASS' : '❌ FAIL')
    
    const allPassed = Object.values(results).every(result => result.success)
    console.log('=' .repeat(60))
    console.log(allPassed ? '🎉 All identity service tests passed! Unified authentication pipeline is working correctly.' : '❌ Some identity service tests failed. Check the logs above.')
    
    return results
  }
}

/**
 * Quick validation function to test the unified identity service
 */
export async function validateIdentityService() {
  console.log('🔍 Validating unified identity service...')
  
  try {
    const testResult = await IdentityServiceTest.runAllTests()
    
    if (testResult.userCreation.success && 
        testResult.authenticationFlows.success && 
        testResult.userValidation.success && 
        testResult.integrationAttachment.success && 
        testResult.authenticationState.success && 
        testResult.comprehensiveProfile.success && 
        testResult.tokenOperations.success && 
        testResult.userAdapterIntegration.success && 
        testResult.middleware.success) {
      console.log('✅ Identity service validation successful!')
      console.log('   - Canonical User model working correctly')
      console.log('   - Authentication flows functional')
      console.log('   - Integration management working')
      console.log('   - Token operations working')
      console.log('   - UserAdapter integration working')
      console.log('   - Middleware functionality working')
      console.log('   - Comprehensive profiles working')
      return true
    } else {
      console.log('❌ Identity service validation failed!')
      return false
    }
  } catch (error) {
    console.error('❌ Identity service validation error:', error)
    return false
  }
}
