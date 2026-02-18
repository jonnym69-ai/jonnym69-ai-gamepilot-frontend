#!/usr/bin/env tsx

/**
 * Simple database seed with sample games
 */

import dotenv from 'dotenv'
import { databaseService } from '../src/services/database'

// Load environment variables
dotenv.config()

async function simpleSeed() {
  try {
    console.log('🎮 Simple database seeding...')
    
    // Initialize database
    await databaseService.initialize()
    
    // Simple game with proper genres
    const simpleGame = {
      title: 'Counter-Strike 2',
      description: 'Counter-Strike 2 is a multiplayer first-person shooter.',
      coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/730/header.jpg',
      appId: 730,
      genres: [
        { id: 'action', name: 'Action', color: '#FF6B6B', subgenres: [] },
        { id: 'fps', name: 'FPS', color: '#4ECDC4', subgenres: [] }
      ],
      platforms: [
        { id: 'steam', name: 'Steam', code: 'steam', isConnected: true }
      ],
      moods: ['competitive-drive', 'adrenaline'],
      emotionalTags: ['competitive', 'tactical'],
      playStatus: 'playing' as const,
      hoursPlayed: 245,
      userRating: 4,
      globalRating: 4.5,
      lastPlayed: new Date('2024-02-08T20:00:00Z'),
      isFavorite: true,
      notes: 'Competitive FPS with friends',
      tags: ['fps', 'multiplayer', 'competitive'], // Add missing tags field
      releaseYear: 2023,
      addedAt: new Date('2024-01-15T10:30:00Z')
    }
    
    console.log('💾 Saving game:', simpleGame.title)
    console.log('🎮 Genres:', simpleGame.genres.map(g => g.name).join(', '))
    
    // Save just one game to test
    const savedGame = await databaseService.createGame(simpleGame)
    
    if (savedGame) {
      console.log('✅ Successfully saved game:', savedGame.title)
      console.log('🆔 Game ID:', savedGame.id)
      console.log('🎮 Genres in database:', savedGame.genres?.map((g: any) => g.name).join(', ') || 'none')
    } else {
      console.log('❌ Failed to save game')
    }
    
    console.log('🎮 Simple seeding completed!')
    
  } catch (error) {
    console.error('❌ Simple seeding failed:', error)
    process.exit(1)
  }
}

// Run the simple seeding
simpleSeed()
