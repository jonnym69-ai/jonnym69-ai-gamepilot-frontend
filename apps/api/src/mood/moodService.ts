import { MoodVector, MoodAnalysisResult } from './types';
import { SignalCollector } from './signalCollection';
import { FeatureExtractor } from './featureExtraction';
import { MoodInference } from './moodInference';
import { PlayHistory, Game, Activity } from '@gamepilot/types';
import { calculateMoodForecast, type MoodForecastingResult, calculateMoodTrend, type MoodTrendAnalysis } from '@gamepilot/identity-engine';
import { SessionResonanceService } from './sessionResonanceService';

/**
 * Main Mood Analysis Service
 * Coordinates signal collection, feature extraction, and mood inference
 */

export class MoodService {
  private signalCollector: SignalCollector;
  private featureExtractor: FeatureExtractor;
  private moodInference: MoodInference;
  private sessionResonanceService: SessionResonanceService;

  constructor() {
    this.signalCollector = new SignalCollector();
    this.featureExtractor = new FeatureExtractor();
    this.moodInference = new MoodInference();
    this.sessionResonanceService = new SessionResonanceService();
  }

  /**
   * Analyze mood for a user based on their gaming history
   */
  async analyzeUserMood(
    userId: string,
    sessions: PlayHistory[],
    games: Game[],
    activities: Activity[] = []
  ): Promise<MoodAnalysisResult> {
    try {
      // Step 1: Collect behavioral signals from existing data sources
      const sessionSignals = this.signalCollector.collectFromSessionHistory(sessions, games);
      const genreSignals = this.signalCollector.collectFromGenreTransitions(sessions, games);
      const playtimeSignals = this.signalCollector.collectFromPlaytimePatterns(sessions);
      const platformSignals = this.signalCollector.collectFromPlatformSwitching(sessions);
      const integrationSignals = this.signalCollector.collectFromIntegrationActivity(activities);

      // Combine all signals
      const allSignals = [
        ...sessionSignals,
        ...genreSignals,
        ...playtimeSignals,
        ...platformSignals,
        ...integrationSignals
      ];

      // Step 2: Extract normalized features from signals
      const features = this.featureExtractor.extractFeatures(allSignals);

      // Step 3: Infer mood vector using weighted heuristics
      const moodVector = this.moodInference.inferMood(features);

      // Step 4: Calculate confidence in the analysis
      const confidence = this.moodInference.getInferenceConfidence(features, moodVector);

      // Step 5: Store signals for future analysis
      allSignals.forEach(signal => this.signalCollector.addSignal(signal));

      return {
        moodVector,
        confidence,
        signalCount: allSignals.length,
        lastUpdated: new Date(),
        features
      };
    } catch (error) {
      console.error('Error analyzing user mood:', error);
      throw new Error(`Mood analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get current mood vector for a user
   */
  async getCurrentMood(userId: string): Promise<MoodAnalysisResult | null> {
    try {
      // This would typically fetch from database
      // For now, return a default neutral mood
      const defaultMood: MoodAnalysisResult = {
        moodVector: {
          calm: 0.5,
          competitive: 0.5,
          curious: 0.5,
          social: 0.5,
          focused: 0.5
        },
        confidence: 0.3,
        signalCount: 0,
        lastUpdated: new Date(),
        features: {
          engagementVolatility: 0.5,
          challengeSeeking: 0.5,
          socialOpenness: 0.5,
          explorationBias: 0.5,
          focusStability: 0.5
        }
      };

      return defaultMood;
    } catch (error) {
      console.error('Error getting current mood:', error);
      return null;
    }
  }

  /**
   * Update mood analysis with new session data
   */
  async updateMoodAnalysis(
    userId: string,
    newSession: PlayHistory,
    games: Game[]
  ): Promise<void> {
    try {
      // Collect signals from new session
      const sessionSignals = this.signalCollector.collectFromSessionHistory([newSession], games);
      
      // Add to signal collection
      sessionSignals.forEach(signal => this.signalCollector.addSignal(signal));

      console.log(`Updated mood analysis for user ${userId} with new session`);
    } catch (error) {
      console.error('Error updating mood analysis:', error);
      throw new Error(`Mood analysis update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get mood analysis statistics
   */
  getMoodAnalysisStats(userId: string): {
    totalSignals: number;
    signalsBySource: Record<string, number>;
    averageConfidence: number;
    lastAnalysis: Date | null;
  } {
    const signalStats = this.signalCollector.getSignalStats();
    
    return {
      totalSignals: signalStats.totalSignals,
      signalsBySource: signalStats.signalsBySource,
      averageConfidence: signalStats.averageWeight,
      lastAnalysis: signalStats.newestSignal
    };
  }

  /**
   * Validate mood analysis result
   */
  validateMoodAnalysis(result: MoodAnalysisResult): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Validate mood vector
    const moodValidation = this.moodInference.validateMoodVector(result.moodVector);
    issues.push(...moodValidation.issues);

    // Validate features
    const featureValidation = this.featureExtractor.validateFeatures(result.features);
    issues.push(...featureValidation.issues);

    // Validate confidence
    if (result.confidence < 0 || result.confidence > 1) {
      issues.push(`Confidence out of range: ${result.confidence}`);
    }

    // Validate signal count
    if (result.signalCount < 0) {
      issues.push(`Invalid signal count: ${result.signalCount}`);
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Get mood description and recommendations
   */
  getMoodInsights(moodVector: MoodVector): {
    dominant: string;
    description: string;
    traits: string[];
    recommendations: string[];
    confidence: number;
  } {
    const dominant = this.moodInference.getDominantMood(moodVector);
    const description = this.moodInference.getMoodDescription(moodVector);

    return {
      dominant: description.primary,
      description: description.description,
      traits: description.traits,
      recommendations: description.recommendations,
      confidence: dominant.confidence
    };
  }

  /**
   * Reset mood analysis data for a user
   */
  resetUserMoodData(userId: string): void {
    this.signalCollector.clearSignals();
    console.log(`Reset mood analysis data for user ${userId}`);
  }

  /**
   * Export mood analysis data
   */
  exportMoodData(userId: string): {
    signals: any[];
    features: any;
    moodVector: any;
    timestamp: string;
  } | null {
    try {
      const signalStats = this.signalCollector.getSignalStats();
      
      return {
        signals: Array.isArray(signalStats) ? signalStats : [signalStats], // Ensure it's an array
        features: this.featureExtractor.getFeatureWeights(),
        moodVector: this.moodInference.getCurrentWeights(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error exporting mood data:', error);
      return null;
    }
  }

  /**
   * Health check for the mood analysis service
   */
  healthCheck(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: {
      signalCollector: boolean;
      featureExtractor: boolean;
      moodInference: boolean;
    };
    timestamp: string;
  } {
    const checks = {
      signalCollector: this.signalCollector !== null,
      featureExtractor: this.featureExtractor !== null,
      moodInference: this.moodInference !== null
    };

    const allHealthy = Object.values(checks).every(check => check);
    const status = allHealthy ? 'healthy' : 
                  Object.values(checks).some(check => check) ? 'degraded' : 'unhealthy';

    return {
      status,
      checks,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Analyze mood trends over time for a user
   */
  async analyzeMoodTrends(
    userId: string,
    timeframe: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<MoodTrendAnalysis> {
    try {
      // Get user's mood history from existing analysis results
      const moodHistory = await this.getUserMoodHistory(userId, timeframe);
      
      // Use identity engine to calculate trends
      const trendAnalysis = calculateMoodTrend(moodHistory, timeframe);
      
      return trendAnalysis;
    } catch (error) {
      console.error('Failed to analyze mood trends:', error);
      throw new Error('Mood trend analysis failed');
    }
  }

  /**
   * Helper method to get user mood history
   */
  private async getUserMoodHistory(
    userId: string, 
    timeframe: 'week' | 'month' | 'quarter'
  ) {
    // Implementation will retrieve mood history from database
    // For now, return empty array as placeholder
    return [];
  }

  /**
   * Record a gaming session and calculate resonance
   */
  async recordSessionResonance(
    userId: string,
    sessionId: string,
    sessionData: {
      duration: number;
      engagement: number;
      satisfaction: number;
      gameIds: string[];
    },
    actualMood: string
  ) {
    try {
      // Get the forecast that was used for this session
      const forecastResult = await this.analyzeMoodForecast(userId, 'next_month');
      
      // Record resonance
      const resonance = await this.sessionResonanceService.recordSessionResonance(
        userId,
        sessionId,
        forecastResult,
        sessionData,
        actualMood
      );
      
      return resonance;
    } catch (error) {
      console.error('Failed to record session resonance:', error);
      throw new Error('Session resonance recording failed');
    }
  }

  /**
   * Get user's resonance analysis
   */
  async getUserResonanceAnalysis(userId: string) {
    try {
      const analysis = await this.sessionResonanceService.getUserResonanceAnalysis(userId);
      return analysis;
    } catch (error) {
      console.error('Failed to get user resonance analysis:', error);
      throw new Error('Resonance analysis failed');
    }
  }

  /**
   * Get system-wide resonance analysis
   */
  async getSystemResonanceAnalysis() {
    try {
      const analysis = await this.sessionResonanceService.getSystemResonanceAnalysis();
      return analysis;
    } catch (error) {
      console.error('Failed to get system resonance analysis:', error);
      throw new Error('System resonance analysis failed');
    }
  }

  /**
   * Get resonance data to improve forecasting
   */
  async getResonanceDataForForecasting(userId: string) {
    try {
      const data = await this.sessionResonanceService.getResonanceDataForForecasting(userId);
      return data;
    } catch (error) {
      console.error('Failed to get resonance data for forecasting:', error);
      throw new Error('Failed to retrieve forecasting data');
    }
  }

  /**
   * Get recent resonance sessions
   */
  async getRecentResonanceSessions(userId: string, limit: number = 10) {
    try {
      const sessions = await this.sessionResonanceService.getRecentResonanceSessions(userId, limit);
      return sessions;
    } catch (error) {
      console.error('Failed to get recent resonance sessions:', error);
      throw new Error('Failed to retrieve recent sessions');
    }
  }

  /**
   * Generate mood forecasts based on historical trends
   */
  async analyzeMoodForecast(
    userId: string,
    forecastPeriod: 'next_week' | 'next_month' | 'next_quarter' = 'next_month'
  ): Promise<MoodForecastingResult> {
    try {
      // Get existing trend analysis
      const trendAnalysis = await this.analyzeMoodTrends(userId, 'month');
      
      // Get historical mood data
      const historicalData = await this.getUserMoodHistory(userId, 'quarter');
      
      // Generate forecast using identity engine
      const forecastResult = calculateMoodForecast(trendAnalysis, historicalData, forecastPeriod);
      
      return forecastResult;
    } catch (error) {
      console.error('Failed to generate mood forecast:', error);
      throw new Error('Mood forecasting failed');
    }
  }
}
