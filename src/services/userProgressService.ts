import { useLibraryStore } from '../stores/useLibraryStore';

// User progress event types
export interface UserProgressEvent {
  type: 'session_start' | 'session_end' | 'game_launched' | 'recommendation_used' | 'mood_selected' | 'genre_selected' | 'time_selected' | 'achievement_unlocked' | 'title_unlocked' | 'onboarding_completed';
  timestamp: Date;
  data: any;
  gameId?: string;
  userId?: string;
}

// Achievement definitions
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
  rule: AchievementRule;
}

// Title/Identity definitions
export interface UserTitle {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  unlockedAt?: Date;
  equipped: boolean;
  requirements: TitleRequirement[];
}

// Achievement rule engine
export interface AchievementRule {
  type: 'genre_diversity' | 'session_streak' | 'playtime_total' | 'mood_explorer' | 'feature_usage' | 'onboarding_complete' | 'social_gamer' | 'time_pattern';
  conditions: any;
  check: (userProgress: UserProgressData) => boolean;
}

// Title requirement engine
export interface TitleRequirement {
  type: 'playtime' | 'sessions' | 'genre_focus' | 'time_pattern' | 'achievement_count' | 'special';
  conditions: any;
  check: (userProgress: UserProgressData) => boolean;
}

// User progress data structure
export interface UserProgressData {
  userId: string;
  totalPlaytime: number;
  sessionsPlayed: number;
  lastPlayed: Date | null;
  favoriteGenres: Record<string, number>;
  favoriteMoods: Record<string, number>;
  timePatterns: Record<string, number>; // hour of day -> session count
  achievements: Achievement[];
  titles: UserTitle[];
  equippedTitle: string | null;
  sessionHistory: UserSession[];
  genreDistribution: Record<string, number>;
  moodUsage: Record<string, number>;
  featureUsage: Record<string, number>;
}

// Session tracking
export interface UserSession {
  id: string;
  gameId: string;
  gameTitle: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // minutes
  mood?: string;
  genre?: string;
  recommendationType?: string;
}

// Analytics data
export interface UserAnalytics {
  totalPlaytime: number;
  averageSessionLength: number;
  longestSession: number;
  shortestSession: number;
  sessionsPerDay: number;
  mostPlayedGenre: string;
  mostPlayedMood: string;
  peakGamingHour: number;
  gamesPlayed: number;
  uniqueGenresPlayed: number;
  achievementProgress: number;
  titleProgress: number;
  lastActiveDate: Date | null;
  totalSessions: number;
}

class UserProgressService {
  private static instance: UserProgressService;
  private events: UserProgressEvent[] = [];
  private progressData: UserProgressData | null = null;
  private listeners: Set<() => void> = new Set();

  private constructor() {}

  static getInstance(): UserProgressService {
    if (!UserProgressService.instance) {
      UserProgressService.instance = new UserProgressService();
    }
    return UserProgressService.instance;
  }

  // Initialize progress tracking
  initialize(userId: string): void {
    this.progressData = {
      userId,
      totalPlaytime: 0,
      sessionsPlayed: 0,
      lastPlayed: null,
      favoriteGenres: {},
      favoriteMoods: {},
      timePatterns: {},
      achievements: this.getDefaultAchievements(),
      titles: this.getDefaultTitles(),
      equippedTitle: null,
      sessionHistory: [],
      genreDistribution: {},
      moodUsage: {},
      featureUsage: {}
    };
    this.loadFromStorage();
  }

  // Track user events
  trackEvent(event: Omit<UserProgressEvent, 'timestamp'>): void {
    const fullEvent: UserProgressEvent = {
      ...event,
      timestamp: new Date()
    };
    
    this.events.push(fullEvent);
    this.processEvent(fullEvent);
    this.saveToStorage();
    this.notifyListeners();
  }

  // Process events and update progress
  private processEvent(event: UserProgressEvent): void {
    if (!this.progressData) return;

    switch (event.type) {
      case 'session_start':
        this.handleSessionStart(event.data);
        break;
      case 'session_end':
        this.handleSessionEnd(event.data);
        break;
      case 'game_launched':
        this.handleGameLaunched(event.data);
        break;
      case 'recommendation_used':
        this.handleRecommendationUsed(event.data);
        break;
      case 'mood_selected':
        this.handleMoodSelected(event.data);
        break;
      case 'genre_selected':
        this.handleGenreSelected(event.data);
        break;
      case 'time_selected':
        this.handleTimeSelected(event.data);
        break;
    }
  }

  // Event handlers
  private handleSessionStart(data: any): void {
    const session: UserSession = {
      id: data.sessionId || crypto.randomUUID(),
      gameId: data.gameId,
      gameTitle: data.gameTitle,
      startTime: new Date(),
      mood: data.mood,
      genre: data.genre,
      recommendationType: data.recommendationType
    };
    
    this.progressData.sessionHistory.push(session);
    this.progressData.sessionsPlayed++;
    this.updateFeatureUsage('session_start');
  }

  private handleSessionEnd(data: any): void {
    const sessionIndex = this.progressData.sessionHistory.findIndex(s => s.id === data.sessionId);
    if (sessionIndex !== -1) {
      const session = this.progressData.sessionHistory[sessionIndex];
      session.endTime = new Date();
      session.duration = data.duration || (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60);
      
      this.progressData.totalPlaytime += session.duration;
      this.progressData.lastPlayed = session.endTime;
      this.updateGenreDistribution(session.genre);
      this.updateMoodUsage(session.mood);
      this.updateTimePatterns(session.endTime);
      this.checkAchievements();
      this.checkTitles();
    }
  }

  private handleGameLaunched(data: any): void {
    this.updateFeatureUsage('game_launched');
    this.trackEvent({
      type: 'session_start',
      data: {
        gameId: data.gameId,
        gameTitle: data.gameTitle,
        sessionId: crypto.randomUUID()
      }
    });
  }

  private handleRecommendationUsed(data: any): void {
    this.updateFeatureUsage('recommendation_used');
    this.updateMoodUsage(data.mood);
    this.updateGenreDistribution(data.genre);
  }

  private handleMoodSelected(data: any): void {
    this.progressData.favoriteMoods[data.mood] = (this.progressData.favoriteMoods[data.mood] || 0) + 1;
    this.updateFeatureUsage('mood_selected');
  }

  private handleGenreSelected(data: any): void {
    this.progressData.favoriteGenres[data.genre] = (this.progressData.favoriteGenres[data.genre] || 0) + 1;
    this.updateFeatureUsage('genre_selected');
  }

  private handleTimeSelected(data: any): void {
    this.updateFeatureUsage('time_selected');
  }

  // Update helper methods
  private updateGenreDistribution(genre: string): void {
    if (genre) {
      this.progressData.genreDistribution[genre] = (this.progressData.genreDistribution[genre] || 0) + 1;
    }
  }

  private updateMoodUsage(mood: string): void {
    if (mood) {
      this.progressData.moodUsage[mood] = (this.progressData.moodUsage[mood] || 0) + 1;
    }
  }

  private updateTimePatterns(endTime: Date): void {
    const hour = endTime.getHours();
    this.progressData.timePatterns[hour.toString()] = (this.progressData.timePatterns[hour.toString()] || 0) + 1;
  }

  private updateFeatureUsage(feature: string): void {
    this.progressData.featureUsage[feature] = (this.progressData.featureUsage[feature] || 0) + 1;
  }

  // Achievement checking
  private checkAchievements(): void {
    this.progressData.achievements.forEach(achievement => {
      if (!achievement.unlocked && achievement.rule.check(this.progressData)) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
        this.trackEvent({
          type: 'achievement_unlocked',
          data: { achievementId: achievement.id }
        });
      }
    });
  }

  // Title checking
  private checkTitles(): void {
    this.progressData.titles.forEach(title => {
      if (!title.unlocked) {
        const unlocked = title.requirements.every(req => req.check(this.progressData));
        if (unlocked) {
          title.unlocked = true;
          title.unlockedAt = new Date();
          this.trackEvent({
            type: 'title_unlocked',
            data: { titleId: title.id }
          });
        }
      }
    });
  }

  // Getters for UI components
  getAnalytics(): UserAnalytics {
    if (!this.progressData) return this.getEmptyAnalytics();

    const sessions = this.progressData.sessionHistory.filter(s => s.duration);
    const totalSessions = sessions.length;
    
    return {
      totalPlaytime: this.progressData.totalPlaytime,
      averageSessionLength: totalSessions > 0 ? this.progressData.totalPlaytime / totalSessions : 0,
      longestSession: Math.max(...sessions.map(s => s.duration || 0)),
      shortestSession: Math.min(...sessions.map(s => s.duration || 0)),
      sessionsPerDay: this.calculateSessionsPerDay(),
      mostPlayedGenre: this.getMostPlayed(this.progressData.genreDistribution),
      mostPlayedMood: this.getMostPlayed(this.progressData.moodUsage),
      peakGamingHour: this.getPeakHour(this.progressData.timePatterns),
      gamesPlayed: this.progressData.sessionHistory.length,
      uniqueGenresPlayed: Object.keys(this.progressData.genreDistribution).length,
      achievementProgress: this.progressData.achievements.filter(a => a.unlocked).length,
      titleProgress: this.progressData.titles.filter(t => t.unlocked).length,
      lastActiveDate: this.progressData.lastPlayed,
      totalSessions
    };
  }

  getAchievements(): Achievement[] {
    return this.progressData?.achievements || [];
  }

  getTitles(): UserTitle[] {
    return this.progressData?.titles || [];
  }

  equipTitle(titleId: string): void {
    if (this.progressData) {
      const title = this.progressData.titles.find(t => t.id === titleId);
      if (title && title.unlocked) {
        this.progressData.equippedTitle = titleId;
        this.saveToStorage();
      }
    }
  }

  // Utility methods
  private calculateSessionsPerDay(): number {
    const sessions = this.progressData.sessionHistory.filter(s => s.endTime);
    if (sessions.length === 0) return 0;
    
    const dates = [...new Set(sessions.map(s => s.endTime!.toDateString()))];
    const daysDiff = (new Date().getTime() - Math.min(...sessions.map(s => s.endTime!.getTime()))) / (1000 * 60 * 60 * 24);
    return dates.length / Math.max(1, daysDiff);
  }

  private getMostPlayed(distribution: Record<string, number>): string {
    const entries = Object.entries(distribution);
    return entries.length > 0 ? entries.reduce((a, b) => a[1] > b[1] ? a : b)[0] : '';
  }

  private getPeakHour(patterns: Record<string, number>): number {
    const entries = Object.entries(patterns);
    return entries.length > 0 ? parseInt(entries.reduce((a, b) => a[1] > b[1] ? a : b)[0]) : 0;
  }

  // Default achievements
  private getDefaultAchievements(): Achievement[] {
    return [
      {
        id: 'genre_explorer',
        title: 'Genre Explorer',
        description: 'Play games from 5 different genres',
        icon: '🗺️',
        unlocked: false,
        rule: {
          type: 'genre_diversity',
          conditions: { count: 5 },
          check: (data) => Object.keys(data.genreDistribution).length >= 5
        }
      },
      {
        id: 'session_streak',
        title: 'Consistent Gamer',
        description: 'Play games 3 days in a row',
        icon: '🔥',
        unlocked: false,
        rule: {
          type: 'session_streak',
          conditions: { days: 3 },
          check: (data) => this.checkSessionStreak(data, 3)
        }
      },
      {
        id: 'night_owl',
        title: 'Night Owl',
        description: 'Play 10 sessions after 10 PM',
        icon: '🌙',
        unlocked: false,
        rule: {
          type: 'time_pattern',
          conditions: { hour: 22, count: 10 },
          check: (data) => Object.entries(data.timePatterns).filter(([hour]) => parseInt(hour) >= 22).reduce((sum, [, count]) => sum + count, 0) >= 10
        }
      },
      {
        id: 'mood_master',
        title: 'Mood Master',
        description: 'Try all 8 different moods',
        icon: '😌',
        unlocked: false,
        rule: {
          type: 'mood_explorer',
          conditions: { count: 8 },
          check: (data) => Object.keys(data.moodUsage).length >= 8
        }
      }
    ];
  }

  // Default titles
  private getDefaultTitles(): UserTitle[] {
    return [
      {
        id: 'explorer',
        name: 'Explorer',
        description: 'Unlocked by playing 3 different open-world games',
        icon: '🗺️',
        color: 'from-green-500 to-emerald-500',
        unlocked: false,
        equipped: false,
        requirements: [{
          type: 'genre_focus',
          conditions: { genre: 'open-world', count: 3 },
          check: (data) => (data.genreDistribution['open-world'] || 0) >= 3
        }]
      },
      {
        id: 'strategist',
        name: 'Strategist',
        description: 'Unlocked by playing 10 hours of strategy games',
        icon: '♟️',
        color: 'from-blue-500 to-indigo-500',
        unlocked: false,
        equipped: false,
        requirements: [{
          type: 'playtime',
          conditions: { genre: 'strategy', hours: 600 }, // 10 hours in minutes
          check: (data) => {
            const strategySessions = data.sessionHistory.filter(s => s.genre === 'strategy');
            const strategyPlaytime = strategySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
            return strategyPlaytime >= 600;
          }
        }]
      },
      {
        id: 'night_owl_title',
        name: 'Night Owl',
        description: 'Unlocked by playing most sessions after 10 PM',
        icon: '🌙',
        color: 'from-purple-500 to-pink-500',
        unlocked: false,
        equipped: false,
        requirements: [{
          type: 'time_pattern',
          conditions: { hour: 22, percentage: 50 },
          check: (data) => {
            const nightSessions = Object.entries(data.timePatterns).filter(([hour]) => parseInt(hour) >= 22);
            const totalSessions = Object.values(data.timePatterns).reduce((sum, count) => sum + count, 0);
            return totalSessions > 0 && (nightSessions.reduce((sum, [, count]) => sum + count, 0) / totalSessions) >= 0.5;
          }
        }]
      },
      {
        id: 'achievement_hunter',
        name: 'Achievement Hunter',
        description: 'Unlocked by earning 10 achievements',
        icon: '🏆',
        color: 'from-yellow-500 to-amber-500',
        unlocked: false,
        equipped: false,
        requirements: [{
          type: 'achievement_count',
          conditions: { count: 10 },
          check: (data) => data.achievements.filter(a => a.unlocked).length >= 10
        }]
      }
    ];
  }

  private checkSessionStreak(data: UserProgressData, days: number): boolean {
    if (data.sessionHistory.length === 0) return false;
    
    const sessionDates = [...new Set(data.sessionHistory
      .filter(s => s.endTime)
      .map(s => s.endTime!.toDateString()))];
    
    if (sessionDates.length < days) return false;
    
    // Check if there are sessions on consecutive days
    const sortedDates = sessionDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    let consecutiveDays = 1;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const current = new Date(sortedDates[i]);
      const previous = new Date(sortedDates[i - 1]);
      const dayDiff = (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24);
      
      if (dayDiff <= 1) {
        consecutiveDays++;
      } else {
        break;
      }
    }
    
    return consecutiveDays >= days;
  }

  // Storage methods
  private saveToStorage(): void {
    if (this.progressData) {
      localStorage.setItem('gamepilot_user_progress', JSON.stringify(this.progressData));
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('gamepilot_user_progress');
      if (stored) {
        this.progressData = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load user progress from storage:', error);
    }
  }

  private getEmptyAnalytics(): UserAnalytics {
    return {
      totalPlaytime: 0,
      averageSessionLength: 0,
      longestSession: 0,
      shortestSession: 0,
      sessionsPerDay: 0,
      mostPlayedGenre: '',
      mostPlayedMood: '',
      peakGamingHour: 0,
      gamesPlayed: 0,
      uniqueGenresPlayed: 0,
      achievementProgress: 0,
      titleProgress: 0,
      lastActiveDate: null,
      totalSessions: 0
    };
  }

  // Subscribe to progress changes
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

export default UserProgressService;
