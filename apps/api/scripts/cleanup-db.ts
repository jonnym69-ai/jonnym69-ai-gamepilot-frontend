#!/usr/bin/env tsx

/**
 * Clean up test data from the database
 */

import { databaseService } from '../src/services/database'

async function cleanupTestData() {
  try {
    console.log('🧹 Cleaning up test data...')
    
    // Initialize the database service first
    await databaseService.initialize()
    
    // Delete test games that were polluting the library
    const testGameIds = ['test-game-123', '252490', '105600', '292100', '322330', '236850', '440900', '274190']
    
    for (const gameId of testGameIds) {
      try {
        await databaseService.deleteGame(gameId)
        console.log(`🗑️ Deleted test game: ${gameId}`)
      } catch (error) {
        console.error(`❌ Failed to delete game ${gameId}:`, error)
      }
    }
    
    console.log('✅ Test data cleanup completed')
    
  } catch (error) {
    console.error('❌ Failed to cleanup test data:', error)
    process.exit(1)
  }
}

cleanupTestData()
