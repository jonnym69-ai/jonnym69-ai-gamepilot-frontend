// Re-export canonical types from packages
export type { Game, Genre, Platform, EmotionalTag, PlayStatus } from '@gamepilot/types'

// Legacy interfaces for backward compatibility during migration
export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: Date;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

export interface GameSession {
  id: string;
  gameId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  mood?: string;
  notes?: string;
}

export interface Activity {
  id: string;
  type: 'achievement' | 'session' | 'status_change' | 'game_added';
  gameId?: string;
  gameTitle?: string;
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * @deprecated Use canonical User.preferences from @gamepilot/shared/models/user instead
 * This interface is replaced by the canonical User.preferences
 */
export interface UserPreferences {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    achievements: boolean;
    gameRecommendations: boolean;
    friendActivity: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    activitySharing: boolean;
  };
  gaming: {
    preferredGenres: string[];
    playtimeGoal: number; // hours per week
  };
}
