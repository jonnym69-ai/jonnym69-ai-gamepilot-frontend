import { MoodForecastingResult } from './moodForecast'
import { UserMood } from '../types'

/**
 * Session Resonance Tracking Interfaces
 */

export interface SessionResonance {
  sessionId: string;
  userId: string;
  predictedMood: string;
  actualMood: string;
  resonanceScore: number; // 0-1, how well prediction matched reality
  confidenceDelta: number; // Difference between predicted confidence and actual accuracy
  sessionData: {
    duration: number; // minutes
    engagement: number; // 0-100, engagement level
    satisfaction: number; // 0-100, user satisfaction
    gameIds: string[]; // Games played during session
  };
  factors: {
    moodAlignment: number; // How well mood matched game choice
    durationFit: number; // Whether session length matched mood expectations
    engagementCorrelation: number; // Engagement vs mood alignment
  };
  timestamp: Date;
}

export interface SessionResonanceAnalysis {
  totalSessions: number;
  averageResonance: number;
  moodAccuracy: Record<string, number>; // Accuracy per mood
  improvementTrend: 'improving' | 'stable' | 'declining';
  insights: {
    strongestPredictions: string[]; // Moods with best prediction accuracy
    weakestPredictions: string[]; // Moods needing improvement
    optimalSessionLength: Record<string, number>; // Ideal session length per mood
    engagementPatterns: Record<string, number>; // Engagement levels per mood
  };
  lastUpdated: Date;
}

/**
 * Calculate session resonance based on predicted vs actual mood
 */
export function calculateSessionResonance(
  sessionId: string,
  userId: string,
  forecastResult: MoodForecastingResult,
  actualMood: string,
  sessionData: {
    duration: number;
    engagement: number;
    satisfaction: number;
    gameIds: string[];
  }
): SessionResonance {
  // Calculate base resonance score
  const moodMatch = forecastResult.primaryForecast.predictedMood === actualMood ? 1 : 0;
  const confidenceAlignment = forecastResult.primaryForecast.confidence;
  
  // Calculate resonance score (0-1)
  const resonanceScore = moodMatch * 0.7 + confidenceAlignment * 0.3;
  
  // Calculate confidence delta
  const actualAccuracy = moodMatch ? 1 : 0;
  const confidenceDelta = Math.abs(forecastResult.primaryForecast.confidence - actualAccuracy);
  
  // Calculate contributing factors
  const moodAlignment = calculateMoodAlignment(forecastResult.primaryForecast.predictedMood, actualMood, sessionData.gameIds);
  const durationFit = calculateDurationFit(forecastResult.primaryForecast.predictedMood, sessionData.duration);
  const engagementCorrelation = calculateEngagementCorrelation(moodAlignment, sessionData.engagement);
  
  return {
    sessionId,
    userId,
    predictedMood: forecastResult.primaryForecast.predictedMood,
    actualMood,
    resonanceScore,
    confidenceDelta,
    sessionData,
    factors: {
      moodAlignment,
      durationFit,
      engagementCorrelation
    },
    timestamp: new Date()
  };
}

/**
 * Analyze session resonance patterns over time
 */
export function analyzeSessionResonance(
  resonanceData: SessionResonance[]
): SessionResonanceAnalysis {
  if (resonanceData.length === 0) {
    return {
      totalSessions: 0,
      averageResonance: 0,
      moodAccuracy: {},
      improvementTrend: 'stable',
      insights: {
        strongestPredictions: [],
        weakestPredictions: [],
        optimalSessionLength: {},
        engagementPatterns: {}
      },
      lastUpdated: new Date()
    };
  }
  
  // Calculate average resonance
  const averageResonance = resonanceData.reduce((sum, session) => sum + session.resonanceScore, 0) / resonanceData.length;
  
  // Calculate mood accuracy per mood
  const moodAccuracy: Record<string, number> = {};
  const moodGroups: Record<string, SessionResonance[]> = {};
  
  resonanceData.forEach(session => {
    if (!moodGroups[session.predictedMood]) {
      moodGroups[session.predictedMood] = [];
    }
    moodGroups[session.predictedMood].push(session);
  });
  
  Object.entries(moodGroups).forEach(([mood, sessions]) => {
    const accuracy = sessions.reduce((sum, session) => sum + session.resonanceScore, 0) / sessions.length;
    moodAccuracy[mood] = accuracy;
  });
  
  // Determine improvement trend
  const improvementTrend = calculateImprovementTrend(resonanceData);
  
  // Generate insights
  const insights = generateResonanceInsights(moodGroups, resonanceData);
  
  return {
    totalSessions: resonanceData.length,
    averageResonance,
    moodAccuracy,
    improvementTrend,
    insights,
    lastUpdated: new Date()
  };
}

/**
 * Calculate how well mood matched game selection
 */
function calculateMoodAlignment(predictedMood: string, actualMood: string, gameIds: string[]): number {
  if (predictedMood === actualMood) {
    return 1.0; // Perfect alignment
  }
  
  // Check if moods are compatible (similar categories)
  const compatibleMoods: Record<string, string[]> = {
    'chill': ['creative', 'story', 'exploratory'],
    'competitive': ['energetic', 'focused', 'social'],
    'energetic': ['competitive', 'social', 'focused'],
    'focused': ['competitive', 'strategic', 'puzzle'],
    'social': ['energetic', 'competitive', 'chill'],
    'creative': ['chill', 'story', 'exploratory'],
    'story': ['chill', 'creative', 'exploratory'],
    'exploratory': ['creative', 'story', 'chill']
  };
  
  return compatibleMoods[predictedMood]?.includes(actualMood) ? 0.5 : 0;
}

/**
 * Calculate if session duration matches mood expectations
 */
function calculateDurationFit(mood: string, duration: number): number {
  // Optimal session lengths per mood (in minutes)
  const optimalLengths: Record<string, { min: number; max: number; ideal: number }> = {
    'chill': { min: 15, max: 90, ideal: 45 },
    'competitive': { min: 20, max: 120, ideal: 60 },
    'energetic': { min: 15, max: 90, ideal: 45 },
    'focused': { min: 30, max: 180, ideal: 90 },
    'social': { min: 30, max: 150, ideal: 75 },
    'creative': { min: 45, max: 240, ideal: 120 },
    'story': { min: 60, max: 300, ideal: 150 },
    'exploratory': { min: 45, max: 240, ideal: 120 }
  };
  
  const optimal = optimalLengths[mood];
  if (!optimal) return 0.5; // Default if mood not found
  
  if (duration >= optimal.min && duration <= optimal.max) {
    // Within optimal range - calculate how close to ideal
    const deviation = Math.abs(duration - optimal.ideal);
    const maxDeviation = Math.max(optimal.ideal - optimal.min, optimal.max - optimal.ideal);
    return Math.max(0, 1 - (deviation / maxDeviation));
  }
  
  // Outside optimal range
  return 0.2;
}

/**
 * Calculate correlation between mood alignment and engagement
 */
function calculateEngagementCorrelation(moodAlignment: number, engagement: number): number {
  // Higher mood alignment should correlate with higher engagement
  const expectedEngagement = 50 + (moodAlignment * 50); // 50-100 expected range
  const correlation = 1 - Math.abs(engagement - expectedEngagement) / 50;
  return Math.max(0, Math.min(1, correlation));
}

/**
 * Determine if predictions are improving over time
 */
function calculateImprovementTrend(resonanceData: SessionResonance[]): 'improving' | 'stable' | 'declining' {
  if (resonanceData.length < 5) return 'stable';
  
  // Sort by timestamp
  const sortedData = resonanceData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  // Compare recent vs older performance
  const recentSessions = sortedData.slice(-5); // Last 5 sessions
  const olderSessions = sortedData.slice(-10, -5); // 5 sessions before that
  
  if (olderSessions.length === 0) return 'stable';
  
  const recentAvg = recentSessions.reduce((sum, s) => sum + s.resonanceScore, 0) / recentSessions.length;
  const olderAvg = olderSessions.reduce((sum, s) => sum + s.resonanceScore, 0) / olderSessions.length;
  
  const improvement = recentAvg - olderAvg;
  
  if (improvement > 0.1) return 'improving';
  if (improvement < -0.1) return 'declining';
  return 'stable';
}

/**
 * Generate insights from resonance data
 */
function generateResonanceInsights(
  moodGroups: Record<string, SessionResonance[]>,
  allSessions: SessionResonance[]
): SessionResonanceAnalysis['insights'] {
  // Find strongest and weakest predictions
  const moodAccuracies: Record<string, number> = {};
  
  Object.entries(moodGroups).forEach(([mood, sessions]) => {
    const accuracy = sessions.reduce((sum, session) => sum + session.resonanceScore, 0) / sessions.length;
    moodAccuracies[mood] = accuracy;
  });
  
  const sortedMoods = Object.entries(moodAccuracies).sort(([,a], [,b]) => b - a);
  
  // Calculate optimal session lengths per mood
  const optimalSessionLength: Record<string, number> = {};
  
  Object.entries(moodGroups).forEach(([mood, sessions]) => {
    const durations = sessions.map(s => s.sessionData.duration);
    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    optimalSessionLength[mood] = Math.round(avgDuration);
  });
  
  // Calculate engagement patterns per mood
  const engagementPatterns: Record<string, number> = {};
  
  Object.entries(moodGroups).forEach(([mood, sessions]) => {
    const engagements = sessions.map(s => s.sessionData.engagement);
    const avgEngagement = engagements.reduce((sum, e) => sum + e, 0) / engagements.length;
    engagementPatterns[mood] = Math.round(avgEngagement);
  });
  
  return {
    strongestPredictions: sortedMoods.slice(0, 3).map(([mood]) => mood),
    weakestPredictions: sortedMoods.slice(-3).map(([mood]) => mood),
    optimalSessionLength,
    engagementPatterns
  };
}
