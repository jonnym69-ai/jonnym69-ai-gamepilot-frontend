import { DatabaseService } from '../src/services/database'
import { normalizeSteamGames } from '../src/utils/dataPipelineNormalizer'

async function testSteamGenreMapping() {
  const databaseService = new DatabaseService()
  await databaseService.initialize()
  
  console.log('🎮 Testing Steam genre mapping with real CS:GO data...')
  
  // Hardcoded CS:GO data from Steam API
  const csGoData = [{
    appid: 730,
    name: 'Counter-Strike: Global Offensive',
    playtime_forever: 0,
    has_community_visible_stats: true,
    img_icon_url: 'dfd77463dd4f2446424354356a5a5a5a5a5a5a5a',
    img_logo_url: '6b97b0b6c0b9b0b6c0b9b0b6c0b9b0b6c0b9b0b6',
    has_additional_videos: false,
    is_free: false,
    genres: [
      { id: 'Action', description: 'Action game' },
      { id: 'FPS', description: 'First-person shooter' },
      { id: 'Multiplayer', description: 'Multiplayer game' }
    ]
  }]
  
  console.log('🔍 Normalizing CS:GO with genres:', csGoData[0].genres)
  
  // Normalize the game data
  const normalizedGames = normalizeSteamGames(csGoData)
  
  console.log(`🔧 Normalized ${normalizedGames.length} games`)
  
  if (normalizedGames.length > 0) {
    const game = normalizedGames[0]
    console.log('🎮 Game:', game.title)
    console.log('🎭 Genres:', game.genres?.map(g => typeof g === 'string' ? g : g.name) || [])
    console.log('😊 Moods:', game.moods || [])
    
    // Save to database
    try {
      const gameData = {
        title: game.title,
        description: game.description || '',
        backgroundImages: [],
        coverImage: null,
        releaseDate: null,
        developer: null,
        publisher: null,
        genres: game.genres || [],
        subgenres: [],
        platforms: game.platforms || [],
        emotionalTags: game.emotionalTags || [],
        userRating: 0,
        globalRating: 4.5,
        playStatus: 'unplayed',
        hoursPlayed: 0,
        lastPlayed: null,
        notes: '',
        isFavorite: false,
        tags: [],
        moods: game.moods || [],
        playHistory: [],
        releaseYear: 2012,
        achievements: [],
        totalPlaytime: 0,
        averageRating: 0,
        completionPercentage: 0,
        appId: game.appId
      }
      
      console.log('🔍 Game data fields count:', Object.keys(gameData).length)
      console.log('🔍 Game data fields:', Object.keys(gameData))
      
      await databaseService.createGame(gameData)
      
      console.log('✅ CS:GO saved to database with proper genres!')
    } catch (error) {
      console.error('❌ Failed to save CS:GO:', error)
    }
  }
}

testSteamGenreMapping().catch(console.error)
