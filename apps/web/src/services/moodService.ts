import axios from 'axios'

// Type definitions for mood API responses
export interface MoodForecastResponse {
  primaryForecast: {
    predictedMood: string
    confidence: number
    reasoning: string
  }
  alternativeForecasts: Array<{
    mood: string
    confidence: number
    reasoning: string
  }>
  forecastPeriod: string
  generatedAt: string
}

export interface MoodResonanceResponse {
  moodAccuracy: Record<string, number>
  confidenceAdjustments: Record<string, number>
  sessionPatterns: Record<string, {
    avgDuration: number
    avgEngagement: number
  }>
  insights: {
    strongestPredictions: string[]
    weakestPredictions: string[]
    optimalSessionLength: Record<string, number>
    engagementPatterns: Record<string, number>
  }
}

export interface MoodRecommendationsResponse {
  recommendations: Array<{
    gameId: string
    gameTitle: string
    score: number
    reasoning: string
    moodAlignment: number
    genreMatch: number
    confidence: number
  }>
  moodToGenreMapping: Record<string, string[]>
  trendingMoods: string[]
  generatedAt: string
}

// API service class
export class MoodService {
  private baseUrl: string
  private isDevelopment: boolean

  constructor() {
    // Use different URLs for development vs production
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      this.baseUrl = 'http://localhost:3000/api'; // Development
    } else {
      this.baseUrl = import.meta.env.VITE_API_URL || 'https://api.gamepilot.app/api'; // Production
    }
    
    // Development mode flag
    this.isDevelopment = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  }

  // Get mood forecast for a user
  async getMoodForecast(userId: string): Promise<MoodForecastResponse> {
    // Always use fallback data since mood endpoints don't exist on backend yet
    console.log('🎭 Using fallback mood forecast data (API endpoints not implemented)')
    
    return {
      primaryForecast: {
        predictedMood: 'chill',
        confidence: 0.85,
        reasoning: 'Fallback forecast - mood API endpoints not yet implemented'
      },
      alternativeForecasts: [
        { mood: 'creative', confidence: 0.75, reasoning: 'Alternative based on genre preferences' },
        { mood: 'focused', confidence: 0.65, reasoning: 'Alternative based on session patterns' }
      ],
      forecastPeriod: 'next_week',
      generatedAt: new Date().toISOString()
    };
  }

  // Get mood resonance data for a user
  async getMoodResonance(userId: string): Promise<MoodResonanceResponse> {
    // Always use fallback data since mood endpoints don't exist on backend yet
    console.log('🎭 Using fallback mood resonance data (API endpoints not implemented)')
    
    return {
      moodAccuracy: {
        chill: 0.9,
        energetic: 0.7,
        competitive: 0.8,
        social: 0.6,
        creative: 0.95,
        focused: 0.75,
        story: 0.8,
        exploratory: 0.85
      },
      confidenceAdjustments: {
        chill: 0.9,
        energetic: 0.7,
        competitive: 0.8,
        social: 0.6,
        creative: 0.95,
        focused: 0.75,
        story: 0.8,
        exploratory: 0.85
      },
      sessionPatterns: {
        chill: { avgDuration: 45, avgEngagement: 80 },
        energetic: { avgDuration: 60, avgEngagement: 90 },
        competitive: { avgDuration: 75, avgEngagement: 95 },
        social: { avgDuration: 90, avgEngagement: 85 },
        creative: { avgDuration: 120, avgEngagement: 75 },
        focused: { avgDuration: 90, avgEngagement: 88 },
        story: { avgDuration: 150, avgEngagement: 82 },
        exploratory: { avgDuration: 120, avgEngagement: 78 }
      },
      insights: {
        strongestPredictions: ['creative', 'chill', 'exploratory'],
        weakestPredictions: ['social', 'energetic', 'focused'],
        optimalSessionLength: {
          chill: 45,
          energetic: 60,
          competitive: 75,
          social: 90,
          creative: 120,
          focused: 90,
          story: 150,
          exploratory: 120
        },
        engagementPatterns: {
          chill: 80,
          energetic: 90,
          competitive: 95,
          social: 85,
          creative: 75,
          focused: 88,
          story: 82,
          exploratory: 78
        }
      }
    };
  }

  // Get mood-based recommendations for a user
  async getMoodRecommendations(userId: string): Promise<MoodRecommendationsResponse> {
    // Always use fallback data since mood endpoints don't exist on backend yet
    console.log('🎭 Using fallback mood recommendations data (API endpoints not implemented)')
    
    return {
      recommendations: [
        {
          gameId: 'game1',
          gameTitle: 'Zen Puzzle Master',
          score: 0.95,
          reasoning: 'Perfect match for current chill mood',
          moodAlignment: 0.9,
          genreMatch: 0.95,
          confidence: 0.85
        }
      ],
      moodToGenreMapping: {
        chill: ['puzzle', 'casual', 'simulation', 'strategy', 'adventure'],
        energetic: ['action', 'shooter', 'racing', 'sports', 'platformer'],
        competitive: ['action', 'shooter', 'strategy', 'fighting', 'racing'],
        social: ['multiplayer', 'party', 'mmorpg', 'co-op', 'simulation'],
        creative: ['sandbox', 'building', 'puzzle', 'simulation', 'adventure'],
        focused: ['strategy', 'puzzle', 'rpg', 'turn-based', 'card'],
        story: ['rpg', 'adventure', 'visual-novel', 'interactive-movie', 'simulation'],
        exploratory: ['adventure', 'open-world', 'sandbox', 'survival', 'simulation']
      },
      trendingMoods: ['competitive', 'social', 'creative'],
      generatedAt: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const moodService = new MoodService()
