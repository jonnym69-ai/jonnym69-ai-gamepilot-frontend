#!/usr/bin/env tsx

/**
 * Create a test user in the database for authentication testing
 */

import { databaseService } from '../src/services/database'
import { hashPassword } from '../src/auth/authService'

async function createTestUser() {
  try {
    console.log('🔧 Creating test user for authentication...')
    
    const hashedPassword = await hashPassword('password123')
    
    const user = await databaseService.createUser({
      username: 'testuser',
      email: 'test@example.com',
      displayName: 'Test User',
      password: hashedPassword,
      avatar: '',
      bio: 'Test user for authentication',
      location: '',
      website: '',
      timezone: 'UTC',
      gamingProfile: {},
      integrations: [],
      privacy: {},
      preferences: {},
      social: {},
      personaData: {},
      currentMood: 'chill',
      moodHistory: '[]',
      moodPreferences: {},
      playPatterns: {},
      averageSessionLength: 0,
      preferredPlaytimes: '[]',
      customFields: '[]'
    })
    
    console.log('✅ Test user created:', user.id)
    console.log('📋 Username: testuser')
    console.log('📋 Email: test@example.com')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Failed to create test user:', error)
    process.exit(1)
  }
}

createTestUser()
