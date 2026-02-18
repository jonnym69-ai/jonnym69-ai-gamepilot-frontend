#!/usr/bin/env tsx

/**
 * Seed database with sample games that have proper genres
 */

import dotenv from 'dotenv'
import { databaseService } from '../src/services/database'

// Load environment variables
dotenv.config()

async function seedGames() {
  try {
    console.log('🎮 Seeding database with sample games...')
    
    // Initialize database
    await databaseService.initialize()
    
    // Sample games with proper genres
    const sampleGames = [
      {
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
        releaseYear: 2023,
        addedAt: new Date('2024-01-15T10:30:00Z')
      },
      {
        title: 'Stardew Valley',
        description: 'You\'ve inherited your grandfather\'s old farm plot in Stardew Valley.',
        coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/413150/header.jpg',
        appId: 413150,
        genres: [
          { id: 'simulation', name: 'Simulation', color: '#95E1D3', subgenres: [] },
          { id: 'rpg', name: 'RPG', color: '#A8E6CF', subgenres: [] },
          { id: 'indie', name: 'Indie', color: '#FFD93D', subgenres: [] }
        ],
        platforms: [
          { id: 'steam', name: 'Steam', code: 'steam', isConnected: true }
        ],
        moods: ['cozy', 'creative-flow', 'calming'],
        emotionalTags: ['relaxing', 'creative'],
        playStatus: 'completed' as const,
        hoursPlayed: 156,
        userRating: 5,
        globalRating: 4.8,
        lastPlayed: new Date('2024-02-05T18:30:00Z'),
        isFavorite: true,
        notes: 'Perfect cozy farming game',
        releaseYear: 2016,
        addedAt: new Date('2024-01-10T14:20:00Z')
      },
      {
        title: 'Hades',
        description: 'Defy the god of the dead as you hack and slash out of the Underworld.',
        coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1145360/header.jpg',
        appId: 1145360,
        genres: [
          { id: 'action', name: 'Action', color: '#FF6B6B', subgenres: [] },
          { id: 'roguelike', name: 'Roguelike', color: '#9B59B6', subgenres: [] },
          { id: 'indie', name: 'Indie', color: '#FFD93D', subgenres: [] }
        ],
        platforms: [
          { id: 'steam', name: 'Steam', code: 'steam', isConnected: true }
        ],
        moods: ['adrenaline', 'strategic-depth', 'deep-dive'],
        emotionalTags: ['challenging', 'rewarding'],
        playStatus: 'playing' as const,
        hoursPlayed: 89,
        userRating: 5,
        globalRating: 4.7,
        lastPlayed: new Date('2024-02-09T22:15:00Z'),
        isFavorite: false,
        notes: 'Great roguelike with amazing story',
        releaseYear: 2020,
        addedAt: new Date('2024-01-20T16:45:00Z')
      },
      {
        title: 'Civilization VI',
        description: 'Civilization VI offers new ways to interact with your world.',
        coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/289070/header.jpg',
        appId: 289070,
        genres: [
          { id: 'strategy', name: 'Strategy', color: '#3498DB', subgenres: [] },
          { id: 'simulation', name: 'Simulation', color: '#95E1D3', subgenres: [] }
        ],
        platforms: [
          { id: 'steam', name: 'Steam', code: 'steam', isConnected: true }
        ],
        moods: ['strategic-depth', 'tactical-mindset', 'deep-dive'],
        emotionalTags: ['intellectual', 'complex'],
        playStatus: 'paused' as const,
        hoursPlayed: 312,
        userRating: 4,
        globalRating: 4.3,
        lastPlayed: new Date('2024-02-03T19:45:00Z'),
        isFavorite: true,
        notes: 'Deep strategy game, takes time to learn',
        releaseYear: 2016,
        addedAt: new Date('2024-01-05T11:30:00Z')
      },
      {
        title: 'Portal 2',
        description: 'Portal 2 draws from the award-winning formula of innovative gameplay.',
        coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/620/header.jpg',
        appId: 620,
        genres: [
          { id: 'puzzle', name: 'Puzzle', color: '#E74C3C', subgenres: [] },
          { id: 'adventure', name: 'Adventure', color: '#F39C12', subgenres: [] }
        ],
        platforms: [
          { id: 'steam', name: 'Steam', code: 'steam', isConnected: true }
        ],
        moods: ['brain-tickle', 'immersive', 'atmospheric'],
        emotionalTags: ['clever', 'mind-bending'],
        playStatus: 'completed' as const,
        hoursPlayed: 12,
        userRating: 5,
        globalRating: 4.9,
        lastPlayed: new Date('2024-01-28T21:30:00Z'),
        isFavorite: true,
        notes: 'Brilliant puzzle game with great story',
        releaseYear: 2011,
        addedAt: new Date('2024-01-08T09:15:00Z')
      }
    ]
    
    // Save games to database
    let savedCount = 0
    for (const game of sampleGames) {
      try {
        await databaseService.createGame({
          title: game.title,
          description: game.description,
          coverImage: game.coverImage,
          appId: game.appId,
          genres: game.genres,
          platforms: game.platforms,
          moods: game.moods,
          emotionalTags: game.emotionalTags,
          playStatus: game.playStatus,
          hoursPlayed: game.hoursPlayed,
          userRating: game.userRating,
          globalRating: game.globalRating,
          lastPlayed: game.lastPlayed,
          isFavorite: game.isFavorite,
          notes: game.notes,
          releaseYear: game.releaseYear,
          addedAt: game.addedAt,
          backgroundImages: [],
          developer: null,
          publisher: null,
          subgenres: [],
          playHistory: [],
          achievements: null,
          totalPlaytime: game.hoursPlayed,
          averageRating: 0,
          completionPercentage: 0
        })
        
        savedCount++
        console.log(`💾 Saved game: ${game.title} (${game.genres.map(g => g.name).join(', ')})`)
      } catch (error) {
        console.error(`❌ Failed to save game ${game.title}:`, error)
      }
    }
    
    console.log(`✅ Successfully saved ${savedCount} games to database`)
    console.log(`🎮 Database seeding completed!`)
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error)
    process.exit(1)
  }
}

// Run the seeding
seedGames()
