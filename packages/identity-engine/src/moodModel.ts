// Simple moods export for build compatibility
export const GAMING_MOODS = [
  {
    id: 'neutral',
    name: 'Neutral',
    description: 'Balanced gaming mood',
    color: '#6B7280',
    icon: '😊',
    energyLevel: 5,
    socialPreference: 'flexible',
    timeOfDay: ['morning', 'afternoon', 'evening', 'night'],
    genreAffinities: [],
    category: 'vibe'
  }
]

// Import UserMood from types to avoid duplication
import type { UserMood } from './types'

// Export Mood interface for compatibility
export interface Mood {
  id: string
  name: string
  description: string
  color: string
  icon: string
  energyLevel: number
  socialPreference: 'solo' | 'cooperative' | 'competitive' | 'flexible'
  timeOfDay: ('morning' | 'afternoon' | 'evening' | 'night')[]
  genreAffinities: string[]
  category: 'energy' | 'exploration' | 'challenge' | 'social' | 'creative' | 'immersion' | 'action' | 'vibe'
}

// Export MoodModel as alias for Mood for backward compatibility
export type { Mood as MoodModel }

// Mood Trend Analysis Interfaces
export interface MoodTrend {
  moodId: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  changeRate: number; // -1 to 1, rate of change
  confidence: number; // 0-1, confidence in trend
  timeframe: 'week' | 'month' | 'quarter';
}

export interface MoodTrendAnalysis {
  trends: MoodTrend[];
  dominantTrend: MoodTrend;
  volatility: number; // 0-1, how much moods are changing
  lastAnalyzed: Date;
}

/**
 * Calculate mood trends from user mood history
 */
export function calculateMoodTrend(
  moodHistory: UserMood[],
  timeframe: 'week' | 'month' | 'quarter' = 'month'
): MoodTrendAnalysis {
  // Group moods by ID for trend calculation
  const moodGroups = moodHistory.reduce((groups, mood) => {
    if (!groups[mood.id]) {
      groups[mood.id] = [];
    }
    groups[mood.id].push(mood);
    return groups;
  }, {} as Record<string, UserMood[]>);

  // Calculate trends for each mood
  const trends: MoodTrend[] = Object.entries(moodGroups).map(([moodId, moods]) => {
    const sortedMoods = moods.sort((a: UserMood, b: UserMood) => 
      (a.lastExperienced?.getTime() || 0) - (b.lastExperienced?.getTime() || 0)
    );

    if (sortedMoods.length < 2) {
      return {
        moodId,
        trend: 'stable',
        changeRate: 0,
        confidence: 0,
        timeframe
      };
    }

    // Calculate trend based on preference changes
    const firstPref = sortedMoods[0].preference;
    const lastPref = sortedMoods[sortedMoods.length - 1].preference;
    const changeRate = (lastPref - firstPref) / 100;

    let trend: 'increasing' | 'decreasing' | 'stable';
    if (Math.abs(changeRate) < 0.1) {
      trend = 'stable';
    } else if (changeRate > 0) {
      trend = 'increasing';
    } else {
      trend = 'decreasing';
    }

    // Calculate confidence based on data points and consistency
    const confidence = Math.min(1, sortedMoods.length / 5) * (1 - Math.abs(changeRate - 0.5));

    return {
      moodId,
      trend,
      changeRate,
      confidence,
      timeframe
    };
  });

  // Find dominant trend (highest confidence * absolute change rate)
  const dominantTrend = trends.reduce((dominant, current) => {
    const dominantScore = dominant.confidence * Math.abs(dominant.changeRate);
    const currentScore = current.confidence * Math.abs(current.changeRate);
    return currentScore > dominantScore ? current : dominant;
  }, trends[0] || {
    moodId: '',
    trend: 'stable',
    changeRate: 0,
    confidence: 0,
    timeframe
  });

  // Calculate volatility (standard deviation of change rates)
  const changeRates = trends.map(t => t.changeRate);
  const avgChangeRate = changeRates.reduce((sum, rate) => sum + rate, 0) / changeRates.length;
  const variance = changeRates.reduce((sum, rate) => sum + Math.pow(rate - avgChangeRate, 2), 0) / changeRates.length;
  const volatility = Math.sqrt(variance);

  return {
    trends,
    dominantTrend,
    volatility: Math.min(1, volatility * 2), // Normalize to 0-1
    lastAnalyzed: new Date()
  };
}

// Export mood forecasting analysis
export { 
  type MoodForecast,
  type MoodForecastingResult,
  calculateMoodForecast 
} from './mood/moodForecast'

// Export session resonance tracking
export {
  type SessionResonance,
  type SessionResonanceAnalysis,
  calculateSessionResonance,
  analyzeSessionResonance
} from './mood/sessionResonance'
