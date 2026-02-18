import { MoodService } from './moodService'
import { RecommendationService } from '../recommendation/recommendationService'
import { Game } from '@gamepilot/types'
import { UserMood } from '@gamepilot/identity-engine'

/**
 * Mock Data for Testing
 */

// Mock mood history - calm, stable user
export const calmHistory: UserMood[] = [
  {
    id: 'chill',
    preference: 75,
    frequency: 4,
    lastExperienced: new Date('2024-01-15'),
    associatedGenres: ['puzzle', 'simulation', 'casual']
  },
  {
    id: 'chill',
    preference: 78,
    frequency: 5,
    lastExperienced: new Date('2024-01-10'),
    associatedGenres: ['puzzle', 'simulation', 'casual']
  },
  {
    id: 'chill',
    preference: 80,
    frequency: 4,
    lastExperienced: new Date('2024-01-05'),
    associatedGenres: ['puzzle', 'simulation', 'casual']
  },
  {
    id: 'story',
    preference: 65,
    frequency: 2,
    lastExperienced: new Date('2024-01-03'),
    associatedGenres: ['rpg', 'adventure']
  }
]

// Mock mood history - volatile, changing user
export const volatileHistory: UserMood[] = [
  {
    id: 'competitive',
    preference: 85,
    frequency: 3,
    lastExperienced: new Date('2024-01-15'),
    associatedGenres: ['action', 'shooter', 'sports']
  },
  {
    id: 'energetic',
    preference: 70,
    frequency: 2,
    lastExperienced: new Date('2024-01-12'),
    associatedGenres: ['action', 'platformer', 'racing']
  },
  {
    id: 'chill',
    preference: 45,
    frequency: 1,
    lastExperienced: new Date('2024-01-08'),
    associatedGenres: ['puzzle', 'casual']
  },
  {
    id: 'focused',
    preference: 60,
    frequency: 2,
    lastExperienced: new Date('2024-01-05'),
    associatedGenres: ['strategy', 'puzzle']
  },
  {
    id: 'social',
    preference: 75,
    frequency: 3,
    lastExperienced: new Date('2024-01-02'),
    associatedGenres: ['multiplayer', 'co-op']
  }
]

// Comprehensive mock mood history
export const mockMoodHistory: UserMood[] = [
  ...calmHistory,
  ...volatileHistory,
  {
    id: 'creative',
    preference: 55,
    frequency: 2,
    lastExperienced: new Date('2024-01-18'),
    associatedGenres: ['sandbox', 'building', 'crafting']
  },
  {
    id: 'exploratory',
    preference: 70,
    frequency: 3,
    lastExperienced: new Date('2024-01-20'),
    associatedGenres: ['open-world', 'adventure', 'survival']
  }
]

// Mock game library
export const mockGames: Game[] = [
  {
    id: 'game1',
    title: 'Zen Puzzle Master',
    genres: ['puzzle' as any, 'casual' as any],
    tags: ['relaxing', 'peaceful', 'zen'],
    platforms: ['Steam' as any],
    releaseDate: new Date('2023-01-15'),
    developer: 'Calm Games Studio',
    description: 'A peaceful puzzle experience',
    coverImage: '',
    subgenres: [],
    emotionalTags: [],
    playStatus: 'unplayed' as any,
    addedAt: new Date('2023-01-15'),
    isFavorite: false,
    releaseYear: 2023
  },
  {
    id: 'game2',
    title: 'Battle Arena Pro',
    genres: ['action' as any, 'shooter' as any],
    tags: ['competitive', 'pvp', 'fast-paced'],
    platforms: ['Steam' as any],
    releaseDate: new Date('2023-03-20'),
    developer: 'Action Studios',
    description: 'Intense competitive shooter',
    coverImage: '',
    subgenres: [],
    emotionalTags: [],
    playStatus: 'unplayed' as any,
    addedAt: new Date('2023-03-20'),
    isFavorite: false,
    releaseYear: 2023
  },
  {
    id: 'game3',
    title: 'Creative Builder',
    genres: ['sandbox' as any, 'building' as any],
    tags: ['creative', 'building', 'crafting'],
    platforms: ['Steam' as any],
    releaseDate: new Date('2023-02-10'),
    developer: 'Creative Minds',
    description: 'Build and create your own world',
    coverImage: '',
    subgenres: [],
    emotionalTags: [],
    playStatus: 'unplayed' as any,
    addedAt: new Date('2023-02-10'),
    isFavorite: false,
    releaseYear: 2023
  },
  {
    id: 'game4',
    title: 'Epic Quest RPG',
    genres: ['rpg' as any, 'adventure' as any],
    tags: ['story-rich', 'narrative', 'cinematic'],
    platforms: ['Steam' as any],
    releaseDate: new Date('2023-05-15'),
    developer: 'Story Games',
    description: 'An epic story-driven adventure',
    coverImage: '',
    subgenres: [],
    emotionalTags: [],
    playStatus: 'unplayed' as any,
    addedAt: new Date('2023-05-15'),
    isFavorite: false,
    releaseYear: 2023
  },
  {
    id: 'game5',
    title: 'Strategic Mind',
    genres: ['strategy' as any, 'puzzle' as any],
    tags: ['strategic', 'tactical', 'deep'],
    platforms: ['Steam' as any],
    releaseDate: new Date('2023-04-08'),
    developer: 'Strategy Plus',
    description: 'Deep strategic gameplay',
    coverImage: '',
    subgenres: [],
    emotionalTags: [],
    playStatus: 'unplayed' as any,
    addedAt: new Date('2023-04-08'),
    isFavorite: false,
    releaseYear: 2023
  },
  {
    id: 'game6',
    title: 'Open World Explorer',
    genres: ['open-world' as any, 'adventure' as any],
    tags: ['exploration', 'discovery', 'adventure'],
    platforms: ['Steam' as any],
    releaseDate: new Date('2023-06-20'),
    developer: 'Explorer Studios',
    description: 'Vast world to explore',
    coverImage: '',
    subgenres: [],
    emotionalTags: [],
    playStatus: 'unplayed' as any,
    addedAt: new Date('2023-06-20'),
    isFavorite: false,
    releaseYear: 2023
  },
  {
    id: 'game7',
    title: 'Social Hub',
    genres: ['multiplayer' as any, 'party' as any],
    tags: ['multiplayer', 'co-op', 'online'],
    platforms: ['Steam' as any],
    releaseDate: new Date('2023-07-12'),
    developer: 'Social Games',
    description: 'Connect with friends online',
    coverImage: '',
    subgenres: [],
    emotionalTags: [],
    playStatus: 'unplayed' as any,
    addedAt: new Date('2023-07-12'),
    isFavorite: false,
    releaseYear: 2023
  },
  {
    id: 'game8',
    title: 'Racing Champions',
    genres: ['racing' as any, 'sports' as any],
    tags: ['fast-paced', 'competitive', 'thrilling'],
    platforms: ['Steam' as any],
    releaseDate: new Date('2023-08-25'),
    developer: 'Speed Studios',
    description: 'High-speed racing action',
    coverImage: '',
    subgenres: [],
    emotionalTags: [],
    playStatus: 'unplayed' as any,
    addedAt: new Date('2023-08-25'),
    isFavorite: false,
    releaseYear: 2023
  }
]

/**
 * Test Scenarios
 */

async function scenario1() {
  console.log('\n🧘 SCENARIO 1: Calm, Stable User')
  console.log('Testing mood analysis for a user with consistent chill preferences')
  
  try {
    const moodService = new MoodService()
    
    // Test mood trend analysis
    console.log('\n📊 Analyzing mood trends...')
    const trendResult = await moodService.analyzeMoodTrends('user-calm', 'month')
    console.log('Trend Analysis Result:', JSON.stringify(trendResult, null, 2))
    
    // Test mood forecasting
    console.log('\n🔮 Generating mood forecast...')
    const forecastResult = await moodService.analyzeMoodForecast('user-calm', 'next_month')
    console.log('Forecast Result:', JSON.stringify(forecastResult, null, 2))
    
    // Test recommendations
    console.log('\n🎮 Generating game recommendations...')
    const recommendationService = new RecommendationService()
    const recommendations = await recommendationService.getMoodBasedRecommendations(
      'user-calm',
      forecastResult,
      mockGames,
      5
    )
    console.log('Recommendations:', JSON.stringify(recommendations, null, 2))
    
    console.log('\n✅ Scenario 1 completed successfully')
    
  } catch (error) {
    console.error('❌ Scenario 1 failed:', error)
  }
}

async function scenario2() {
  console.log('\n⚡ SCENARIO 2: Volatile, Changing User')
  console.log('Testing mood analysis for a user with diverse and changing mood patterns')
  
  try {
    const moodService = new MoodService()
    
    // Test mood trend analysis
    console.log('\n📊 Analyzing mood trends...')
    const trendResult = await moodService.analyzeMoodTrends('user-volatile', 'month')
    console.log('Trend Analysis Result:', JSON.stringify(trendResult, null, 2))
    
    // Test mood forecasting
    console.log('\n🔮 Generating mood forecast...')
    const forecastResult = await moodService.analyzeMoodForecast('user-volatile', 'next_month')
    console.log('Forecast Result:', JSON.stringify(forecastResult, null, 2))
    
    // Test recommendations
    console.log('\n🎮 Generating game recommendations...')
    const recommendationService = new RecommendationService()
    const recommendations = await recommendationService.getMoodBasedRecommendations(
      'user-volatile',
      forecastResult,
      mockGames,
      5
    )
    console.log('Recommendations:', JSON.stringify(recommendations, null, 2))
    
    console.log('\n✅ Scenario 2 completed successfully')
    
  } catch (error) {
    console.error('❌ Scenario 2 failed:', error)
  }
}

async function scenario3() {
  console.log('\n🎯 SCENARIO 3: Comprehensive Mood Analysis')
  console.log('Testing with full mood history and diverse game library')
  
  try {
    const moodService = new MoodService()
    
    // Test mood trend analysis with comprehensive data
    console.log('\n📊 Analyzing comprehensive mood trends...')
    const trendResult = await moodService.analyzeMoodTrends('user-comprehensive', 'quarter')
    console.log('Trend Analysis Result:', JSON.stringify(trendResult, null, 2))
    
    // Test mood forecasting
    console.log('\n🔮 Generating comprehensive mood forecast...')
    const forecastResult = await moodService.analyzeMoodForecast('user-comprehensive', 'next_month')
    console.log('Forecast Result:', JSON.stringify(forecastResult, null, 2))
    
    // Test recommendations with full game library
    console.log('\n🎮 Generating comprehensive game recommendations...')
    const recommendationService = new RecommendationService()
    const recommendations = await recommendationService.getMoodBasedRecommendations(
      'user-comprehensive',
      forecastResult,
      mockGames,
      8
    )
    console.log('Recommendations:', JSON.stringify(recommendations, null, 2))
    
    // Test personalized recommendations
    console.log('\n🌟 Testing personalized recommendations...')
    const personalizedRecs = await recommendationService.getPersonalizedRecommendations(
      'user-comprehensive',
      'next_month',
      5
    )
    console.log('Personalized Recommendations:', JSON.stringify(personalizedRecs, null, 2))
    
    console.log('\n✅ Scenario 3 completed successfully')
    
  } catch (error) {
    console.error('❌ Scenario 3 failed:', error)
  }
}

/**
 * Main Test Runner
 */
async function main() {
  console.log('🚀 Starting Mood Analysis & Recommendation System Tests')
  console.log('=' .repeat(60))
  
  try {
    // Run all three scenarios
    await scenario1()
    await scenario2()
    await scenario3()
    
    console.log('\n🎉 All test scenarios completed!')
    console.log('=' .repeat(60))
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error)
  }
}

// Export for potential external use
export {
  scenario1,
  scenario2,
  scenario3,
  main
}

// Auto-run if this file is executed directly
if (require.main === module) {
  main().catch(console.error)
}
