#!/usr/bin/env tsx

/**
 * Initialize the database and create a test user
 */

import { databaseService } from '../src/services/database'
import { hashPassword } from '../src/auth/authService'

async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database...')
    
    // Initialize the database service
    await databaseService.initialize()
    
    console.log('✅ Database initialized successfully')
    
    // Create test user
    await createTestUser()
    
  } catch (error) {
    console.error('❌ Failed to initialize database:', error)
    process.exit(1)
  }
}

async function createTestUser() {
  try {
    console.log('🔧 Creating test user for authentication...')
    
    const hashedPassword = await hashPassword('password123')
    
    const user = await databaseService.createUser({
      username: 'testuser123', // Changed to avoid username constraint
      email: 'testuser@example.com', // Changed to avoid email constraint
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
    
  } catch (error) {
    console.error('❌ Failed to create test user:', error)
    process.exit(1)
  }
}

// Run the initialization
initializeDatabase()
