import { useEffect, useCallback, useState } from 'react';
import UserProgressService, { type UserProgressEvent, type UserAnalytics, type Achievement, type UserTitle } from '../services/userProgressService';

// Hook for tracking user progress events
export function useUserProgress() {
  const progressService = UserProgressService.getInstance();

  const trackEvent = useCallback((event: Omit<UserProgressEvent, 'timestamp'>) => {
    progressService.trackEvent(event);
  }, [progressService]);

  const getAnalytics = useCallback((): UserAnalytics => {
    return progressService.getAnalytics();
  }, [progressService]);

  const getAchievements = useCallback((): Achievement[] => {
    return progressService.getAchievements();
  }, [progressService]);

  const getTitles = useCallback((): UserTitle[] => {
    return progressService.getTitles();
  }, [progressService]);

  const equipTitle = useCallback((titleId: string) => {
    progressService.equipTitle(titleId);
  }, [progressService]);

  // Initialize on mount
  useEffect(() => {
    // Get current user ID (you might need to adjust this based on your auth system)
    const userId = localStorage.getItem('gamepilot_user_id') || 'default_user';
    progressService.initialize(userId);
  }, []);

  return {
    trackEvent,
    getAnalytics,
    getAchievements,
    getTitles,
    equipTitle
  };
}

// Hook for session tracking
export function useSessionTracking() {
  const { trackEvent } = useUserProgress();

  const startSession = useCallback((gameId: string, gameTitle: string, mood?: string, genre?: string, recommendationType?: string) => {
    const sessionId = crypto.randomUUID();
    trackEvent({
      type: 'session_start',
      data: {
        sessionId,
        gameId,
        gameTitle,
        mood,
        genre,
        recommendationType
      }
    });
    return sessionId;
  }, [trackEvent]);

  const endSession = useCallback((sessionId: string, duration: number) => {
    trackEvent({
      type: 'session_end',
      data: {
        sessionId,
        duration
      }
    });
  }, [trackEvent]);

  const launchGame = useCallback((gameId: string, gameTitle: string) => {
    trackEvent({
      type: 'game_launched',
      data: {
        gameId,
        gameTitle
      }
    });
  }, [trackEvent]);

  return {
    startSession,
    endSession,
    launchGame
  };
}

// Hook for recommendation tracking
export function useRecommendationTracking() {
  const { trackEvent } = useUserProgress();

  const trackRecommendation = useCallback((mood: string, genre: string, timeAvailable: string, recommendationType: string = 'interactive') => {
    trackEvent({
      type: 'recommendation_used',
      data: {
        mood,
        genre,
        timeAvailable,
        recommendationType
      }
    });
  }, [trackEvent]);

  const trackMoodSelection = useCallback((mood: string) => {
    trackEvent({
      type: 'mood_selected',
      data: { mood }
    });
  }, [trackEvent]);

  const trackGenreSelection = useCallback((genre: string) => {
    trackEvent({
      type: 'genre_selected',
      data: { genre }
    });
  }, [trackEvent]);

  const trackTimeSelection = useCallback((time: string) => {
    trackEvent({
      type: 'time_selected',
      data: { time }
    });
  }, [trackEvent]);

  return {
    trackRecommendation,
    trackMoodSelection,
    trackGenreSelection,
    trackTimeSelection
  };
}

// Hook for achievements and titles
export function useAchievements() {
  const { getAchievements } = useUserProgress();
  return getAchievements();
}

export function useTitles() {
  const { getTitles, equipTitle } = useUserProgress();
  return { getTitles, equipTitle };
}
export function useRealtimeAnalytics() {
  const { getAnalytics } = useUserProgress();
  const [analytics, setAnalytics] = useState(getAnalytics());

  // Subscribe to progress changes
  useEffect(() => {
    const unsubscribe = UserProgressService.getInstance().subscribe(() => {
      setAnalytics(getAnalytics());
    });

    return unsubscribe;
  }, [getAnalytics]);

  // Update analytics every 30 seconds for real-time feel
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalytics(getAnalytics());
    }, 30000);

    return () => clearInterval(interval);
  }, [getAnalytics]);

  return analytics;
}
