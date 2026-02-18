/**
 * Lightweight Analytics Utility
 * 
 * Simple event tracking for contextual and persona recommendations
 * Currently logs to console with [Analytics] prefix for easy filtering
 * Can be swapped with real backend analytics later
 */

// Analytics configuration
export interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
}

let config: AnalyticsConfig = {
  enabled: true,
  debug: true
};

/**
 * Configure analytics behavior
 */
export const configureAnalytics = (newConfig: Partial<AnalyticsConfig>) => {
  config = { ...config, ...newConfig };
};

/**
 * Track an analytics event
 */
export const trackEvent = (name: string, payload?: Record<string, any>): void => {
  if (!config.enabled) return;
  
  try {
    const event = {
      name,
      payload: payload || {},
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    if (config.debug) {
      console.log('[Analytics]', event);
    }
    
    // NEW: Store events in localStorage for dashboard
    const storedEvents = localStorage.getItem('analytics_events');
    const events = storedEvents ? JSON.parse(storedEvents) : [];
    events.push(event);
    
    // Keep only last 1000 events to prevent localStorage overflow
    if (events.length > 1000) {
      events.splice(0, events.length - 1000);
    }
    
    localStorage.setItem('analytics_events', JSON.stringify(events));
    
    // NEW: Update aggregated stats
    updateAggregatedStats(event);
    
    // TODO: Send to real analytics backend when ready
    // await sendToAnalyticsBackend(event);
    
  } catch (error) {
    // Fail silently - analytics should never break the app
    if (config.debug) {
      console.warn('[Analytics] Failed to track event:', error);
    }
  }
};

/**
 * Update aggregated statistics for dashboard
 */
const updateAggregatedStats = (event: any): void => {
  try {
    const storedStats = localStorage.getItem('analytics_stats');
    const stats = storedStats ? JSON.parse(storedStats) : {
      contextualShown: 0,
      personaShown: 0,
      contextualClicked: 0,
      personaClicked: 0,
      sessionLengthUsage: {},
      moodUsage: {},
      timeOfDayUsage: {},
      personaEffectiveness: {}
    };

    // Update counters
    if (event.name === 'contextual_rec_shown') {
      stats.contextualShown++;
    } else if (event.name === 'persona_rec_shown') {
      stats.personaShown++;
    } else if (event.name === 'contextual_rec_clicked') {
      stats.contextualClicked++;
    } else if (event.name === 'persona_rec_clicked') {
      stats.personaClicked++;
    }

    // Update session length usage
    if (event.name === 'filter_session_length_changed' && event.payload.selectedSessionLength) {
      const sessionLength = event.payload.selectedSessionLength;
      stats.sessionLengthUsage[sessionLength] = (stats.sessionLengthUsage[sessionLength] || 0) + 1;
    }

    // Update mood usage
    if (event.name === 'filter_moods_changed' && event.payload.selectedMoods) {
      event.payload.selectedMoods.forEach((mood: string) => {
        stats.moodUsage[mood] = (stats.moodUsage[mood] || 0) + 1;
      });
    }

    // Update time of day usage
    if (event.name === 'contextual_insights' && event.payload.timeOfDay) {
      const timeOfDay = event.payload.timeOfDay;
      stats.timeOfDayUsage[timeOfDay] = (stats.timeOfDayUsage[timeOfDay] || 0) + 1;
    }

    // Update persona effectiveness
    if (event.name === 'persona_rec_clicked' && event.payload.gameId) {
      const gameId = event.payload.gameId;
      if (!stats.personaEffectiveness[gameId]) {
        stats.personaEffectiveness[gameId] = { impressions: 0, clicks: 0 };
      }
      stats.personaEffectiveness[gameId].clicks++;
    }

    if (event.name === 'persona_rec_shown') {
      // This is a bit tricky since we don't have game IDs in the shown event
      // For now, we'll track total impressions and let the dashboard calculate effectiveness
    }

    localStorage.setItem('analytics_stats', JSON.stringify(stats));
  } catch (error) {
    if (config.debug) {
      console.warn('[Analytics] Failed to update aggregated stats:', error);
    }
  }
};

/**
 * Track user interaction with recommendations
 */
export const trackRecommendationInteraction = (
  type: 'contextual' | 'persona',
  action: 'shown' | 'clicked',
  data: {
    gameId?: string;
    count?: number;
    timeOfDay?: string;
    selectedSessionLength?: string;
    selectedMoods?: string[];
    selectedMoodsCount?: number;
    dominantMoods?: string[];
    preferredSessionLength?: string;
    preferredTimesOfDay?: string[];
    personaWeight?: number;
    gameTitle?: string;
    genres?: any;
    source?: string;
  }
): void => {
  trackEvent(`${type}_rec_${action}`, {
    recommendationType: type,
    action,
    ...data
  });
};

/**
 * Track filter interactions
 */
export const trackFilterInteraction = (
  filterType: 'session_length' | 'moods' | 'search' | 'add_game_modal_open' | 'steam_import_modal_open' | 'mood_selector_open' | 'what_to_play_open' | 'genre_select' | 'mood_filter' | 'sort_change',
  action: 'changed' | 'cleared',
  data: {
    selectedSessionLength?: string;
    selectedMoodsCount?: number;
    selectedMoods?: string[];
    term?: string;
    resultCount?: number;
    genre?: string;
    gameCount?: number;
    sort?: string;
    action?: string;
  }
): void => {
  trackEvent(`filter_${filterType}_${action}`, {
    filterType,
    action,
    ...data
  });
};

/**
 * Track persona insights
 */
export const trackPersonaInsights = (
  personaContext: any,
  recommendationCount: number
): void => {
  trackEvent('persona_insights', {
    dominantMoods: personaContext.dominantMoods,
    preferredSessionLength: personaContext.preferredSessionLength,
    preferredTimesOfDay: personaContext.preferredTimesOfDay,
    recentPlayPatterns: personaContext.recentPlayPatterns,
    recommendationCount
  });
};

/**
 * Track contextual insights
 */
export const trackContextualInsights = (
  timeOfDay: string,
  selectedSessionLength: string | null,
  selectedMoods: string[],
  recommendationCount: number
): void => {
  trackEvent('contextual_insights', {
    timeOfDay,
    selectedSessionLength,
    selectedMoodsCount: selectedMoods.length,
    selectedMoods,
    recommendationCount
  });
};

// Export default configuration for easy access
export default {
  trackEvent,
  trackRecommendationInteraction,
  trackFilterInteraction,
  trackPersonaInsights,
  trackContextualInsights,
  configureAnalytics
};
