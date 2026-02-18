// Import canonical Game interface from packages/types
import type { Game as CanonicalGame } from '@gamepilot/types';

// Re-export canonical Game for compatibility
export type Game = CanonicalGame;

// Frontend-specific interfaces
export interface MoodSection {
  id: string
  name: string
  emoji: string
  color: string
  description: string
  games: Game[]
}

export interface SpotlightItem {
  id: string
  type: 'game' | 'achievement' | 'milestone' | 'recommendation'
  title: string
  description: string
  image?: string
  game?: Game
  metadata?: {
    achievementCount?: number
    playtime?: number
    rarity?: 'common' | 'rare' | 'epic' | 'legendary'
  }
}

export interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  gradient: string
  action: () => void
}

export interface Recommendation {
  id: string
  game: Game
  reason: string
  confidence: number
  type: 'genre' | 'mood' | 'similar' | 'trending'
  price?: string
  genre?: string
  platform?: string
  coverImage?: string
}

export interface HomeData {
  recentlyPlayed: Game[]
  moodSections: MoodSection[]
  spotlightItems: SpotlightItem[]
  quickActions: QuickAction[]
  recommendations: Recommendation[]
}
