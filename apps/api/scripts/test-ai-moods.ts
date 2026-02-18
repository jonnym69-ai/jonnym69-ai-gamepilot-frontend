import { DatabaseService } from '../src/services/database'
import { ollamaService } from '../src/services/ollamaService'

async function testAIMoodGeneration() {
  const databaseService = new DatabaseService()
  await databaseService.initialize()
  
  console.log('🎮 Testing AI mood generation with database insertion...')
  
  // Test CS:GO with AI-generated moods
  const gameDescription = "Counter-Strike: Global Offensive (CS:GO) is a multiplayer first-person shooter game featuring two teams of terrorists and counter-terrorists competing to complete objectives like planting/defusing bombs or rescuing hostages. The game requires strategic teamwork, precise aiming, and quick reflexes in intense competitive matches."
  
  console.log('📝 Game Description:', gameDescription.substring(0, 100) + '...')
  
  // Generate moods using AI
  const aiMoods = await ollamaService.getMoodsFromAI(gameDescription)
  console.log('🎭 AI-generated moods:', aiMoods)
  
  // Create game with AI moods
  try {
    const gameData = {
      title: 'Counter-Strike: Global Offensive',
      description: gameDescription,
      backgroundImages: [],
      coverImage: null,
      releaseDate: null,
      developer: null,
      publisher: null,
      genres: [
        { id: 'Action', description: 'Action game' },
        { id: 'FPS', description: 'First-person shooter' },
        { id: 'Multiplayer', description: 'Multiplayer game' }
      ],
      subgenres: [],
      platforms: [],
      emotionalTags: [],
      userRating: 0,
      globalRating: 4.5,
      playStatus: 'unplayed',
      hoursPlayed: 0,
      lastPlayed: null,
      notes: '',
      isFavorite: false,
      tags: [],
      moods: aiMoods,
      playHistory: [],
      releaseYear: 2012,
      achievements: [],
      totalPlaytime: 0,
      averageRating: 0,
      completionPercentage: 0,
      appId: 730
    }
    
    console.log('💾 Saving game with AI moods to database...')
    const savedGame = await databaseService.createGame(gameData)
    
    console.log('✅ Game saved successfully with AI moods!')
    console.log('🎮 Game:', savedGame.title)
    console.log('🎭 AI Moods:', aiMoods)
    console.log('🎯 This kills the pathetic manual filters!')
    
  } catch (error) {
    console.error('❌ Failed to save game:', error)
  }
}

testAIMoodGeneration().catch(console.error)
