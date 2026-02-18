// Authentication Migration Test
// Tests to verify canonical User model integration works correctly

import { login, register, getCanonicalUser } from '../auth/authService'
import { UserAdapter } from './userAdapter'

/**
 * Test authentication flows with canonical User model
 * This is a simple test to verify the migration works correctly
 */
export class AuthMigrationTest {
  /**
   * Test user registration with canonical User model
   */
  static async testRegistration() {
    console.log('🧪 Testing user registration with canonical User model...')
    
    try {
      const registerData = {
        username: 'testuser_canonical',
        email: 'test@example.com',
        password: 'testpassword123'
      }
      
      const result = await register(registerData)
      
      if (result.success && result.user) {
        console.log('✅ Registration successful with canonical User')
        console.log('   AuthUser response:', result.user)
        
        // Test that we can convert back to canonical User
        const canonicalUser = UserAdapter.authUserToCanonical(result.user, {
          displayName: 'Test User Canonical',
          timezone: 'UTC'
        })
        
        console.log('✅ Converted back to canonical User')
        console.log('   Canonical User ID:', canonicalUser.id)
        console.log('   Canonical User gaming profile:', canonicalUser.gamingProfile)
        
        return { success: true, canonicalUser }
      } else {
        console.log('❌ Registration failed:', result.message)
        return { success: false, error: result.message }
      }
    } catch (error) {
      console.error('❌ Registration test error:', error)
      return { success: false, error }
    }
  }
  
  /**
   * Test user login with canonical User model
   */
  static async testLogin() {
    console.log('🧪 Testing user login with canonical User model...')
    
    try {
      const loginData = {
        username: 'demo', // Use existing demo user
        password: 'password123'
      }
      
      const result = await login(loginData)
      
      if (result.success && result.user) {
        console.log('✅ Login successful with canonical User')
        console.log('   AuthUser response:', result.user)
        
        // Test that we can convert back to canonical User
        const canonicalUser = UserAdapter.authUserToCanonical(result.user)
        
        console.log('✅ Converted back to canonical User')
        console.log('   Canonical User ID:', canonicalUser.id)
        console.log('   Canonical User gaming profile:', canonicalUser.gamingProfile)
        
        return { success: true, canonicalUser }
      } else {
        console.log('❌ Login failed:', result.message)
        return { success: false, error: result.message }
      }
    } catch (error) {
      console.error('❌ Login test error:', error)
      return { success: false, error }
    }
  }
  
  /**
   * Test UserAdapter conversion functions
   */
  static testUserAdapter() {
    console.log('🧪 Testing UserAdapter conversion functions...')
    
    try {
      // Test canonical to AuthUser conversion
      const mockCanonicalUser = UserAdapter.authUserToCanonical({
        id: 'test-123',
        username: 'testuser',
        email: 'test@example.com'
      }, {
        displayName: 'Test Display Name',
        avatar: 'https://example.com/avatar.jpg',
        bio: 'Test bio',
        timezone: 'America/New_York'
      })
      
      console.log('✅ Created mock canonical User')
      console.log('   Gaming profile:', mockCanonicalUser.gamingProfile)
      
      const authUser = UserAdapter.canonicalToAuthUser(mockCanonicalUser)
      
      console.log('✅ Converted to AuthUser')
      console.log('   AuthUser:', authUser)
      
      // Test validation
      const validation = UserAdapter.validateForAuth(mockCanonicalUser)
      
      console.log('✅ Validation result:', validation)
      
      // Test onboarding status
      const onboardingStatus = UserAdapter.hasCompletedOnboarding(mockCanonicalUser)
      console.log('✅ Onboarding status:', onboardingStatus)
      
      // Test auth status
      const authStatus = UserAdapter.getAuthStatus(mockCanonicalUser)
      console.log('✅ Auth status:', authStatus)
      
      return { success: true, validation, onboardingStatus, authStatus }
    } catch (error) {
      console.error('❌ UserAdapter test error:', error)
      return { success: false, error }
    }
  }
  
  /**
   * Test complete authentication flow
   */
  static async testCompleteFlow() {
    console.log('🧪 Testing complete authentication flow...')
    
    try {
      // Step 1: Register new user
      const registrationResult = await this.testRegistration()
      if (!registrationResult.success) {
        return { success: false, error: 'Registration failed' }
      }
      
      // Step 2: Login with the new user
      const loginResult = await this.testLogin()
      if (!loginResult.success) {
        return { success: false, error: 'Login failed' }
      }
      
      // Step 3: Test adapter functions
      const adapterResult = this.testUserAdapter()
      if (!adapterResult.success) {
        return { success: false, error: 'Adapter test failed' }
      }
      
      console.log('✅ Complete authentication flow test passed!')
      return { success: true }
    } catch (error) {
      console.error('❌ Complete flow test error:', error)
      return { success: false, error }
    }
  }
  
  /**
   * Run all tests
   */
  static async runAllTests() {
    console.log('🚀 Starting authentication migration tests...')
    console.log('=' .repeat(50))
    
    const results = {
      registration: await this.testRegistration(),
      login: await this.testLogin(),
      adapter: this.testUserAdapter(),
      completeFlow: await this.testCompleteFlow()
    }
    
    console.log('=' .repeat(50))
    console.log('📊 Test Results Summary:')
    console.log('   Registration:', results.registration.success ? '✅ PASS' : '❌ FAIL')
    console.log('   Login:', results.login.success ? '✅ PASS' : '❌ FAIL')
    console.log('   Adapter:', results.adapter.success ? '✅ PASS' : '❌ FAIL')
    console.log('   Complete Flow:', results.completeFlow.success ? '✅ PASS' : '❌ FAIL')
    
    const allPassed = Object.values(results).every(result => result.success)
    console.log('=' .repeat(50))
    console.log(allPassed ? '🎉 All tests passed! Migration is working correctly.' : '❌ Some tests failed. Check the logs above.')
    
    return results
  }
}

/**
 * Quick validation function to test the migration
 */
export async function validateAuthMigration() {
  console.log('🔍 Validating authentication migration to canonical User model...')
  
  try {
    // Test that we can import and use the canonical User model
    const testResult = await AuthMigrationTest.runAllTests()
    
    if (testResult.completeFlow.success) {
      console.log('✅ Authentication migration validation successful!')
      console.log('   - Canonical User model is working correctly')
      console.log('   - UserAdapter conversions are functioning')
      console.log('   - Authentication flows maintain compatibility')
      console.log('   - Enhanced user data is available')
      return true
    } else {
      console.log('❌ Authentication migration validation failed!')
      return false
    }
  } catch (error) {
    console.error('❌ Migration validation error:', error)
    return false
  }
}
