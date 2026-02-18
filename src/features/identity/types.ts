// Identity Types - Now using canonical models from shared package
// This file contains only frontend-specific extensions and constants

// ============================================================================
// FRONTEND-SPECIFIC EXTENSIONS (Not in canonical model)
// ============================================================================

export interface CustomField {
  id: string
  name: string
  value: string
  type: 'text' | 'email' | 'url' | 'textarea'
  isPublic: boolean
  order: number
}

export interface CustomPreferenceItem {
  id: string
  name: string
  value: string | boolean | number
  type: 'text' | 'number' | 'boolean' | 'select'
  options?: string[] // for select type
  category: 'general' | 'display' | 'notifications' | 'privacy'
  order: number
  isPublic: boolean
}

// ============================================================================
// DEPRECATED DUPLICATE INTERFACES (Replaced by canonical models)
// ============================================================================

/**
 * @deprecated Use canonical User from @gamepilot/shared/models/user instead
 * This interface is replaced by the canonical User model
 */
export interface UserProfile {
  id: string
  username: string
  displayName: string
  email?: string
  avatar?: string
  bio?: string
  location?: string
  website?: string
  joinedAt: string
  lastActive: string
  isPublic: boolean
  level: number
  experience: number
  customFields?: CustomField[]
  // Greeting customization
  preferredGreeting?: string
  greetingPhrases?: string[]
}

/**
 * @deprecated Use canonical User.preferences from @gamepilot/shared/models/user instead
 * This interface is replaced by the canonical User.preferences
 */
export interface UserPreferences {
  theme: 'dark' | 'light' | 'auto'
  language: string
  timezone: string
  notifications: {
    email: boolean
    push: boolean
    achievements: boolean
    recommendations: boolean
    friendActivity: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private'
    showPlaytime: boolean
    showAchievements: boolean
    showGameLibrary: boolean
  }
  display: {
    compactMode: boolean
    showGameCovers: boolean
    animateTransitions: boolean
    showRatings: boolean
  }
  customItems?: CustomPreferenceItem[]
  profileVisibility: "public" | "friends" | "private"
  showPlaytime: boolean
  showAchievements: boolean
  showGameLibrary: boolean
}

/**
 * @deprecated Use canonical PlaystyleArchetype from @gamepilot/shared/models/user instead
 * This interface is replaced by the canonical PlaystyleArchetype
 */
export interface PlaystyleIndicator {
  id: string
  name: string
  description: string
  icon: string
  color: string
  traits: string[]
}

/**
 * @deprecated Use canonical User.gamingProfile.playstyleArchetypes from @gamepilot/shared/models/user instead
 * This interface is replaced by canonical playstyle data
 */
export interface UserPlaystyle {
  primary: PlaystyleIndicator
  secondary?: PlaystyleIndicator
  traits: string[]
  preferences: {
    sessionLength: 'short' | 'medium' | 'long'
    difficulty: 'casual' | 'normal' | 'hard' | 'expert'
    socialPreference: 'solo' | 'cooperative' | 'competitive'
    storyFocus: number // 0-100 scale
    graphicsFocus: number // 0-100 scale
    gameplayFocus: number // 0-100 scale
  }
  customPlaystyles?: PlaystyleIndicator[] // User-defined playstyles
}

/**
 * @deprecated Use canonical User.gamingProfile.genreAffinities from @gamepilot/shared/models/user instead
 * This interface is replaced by canonical genre affinity data
 */
export interface UserGenre {
  id: string
  name: string
  preference: number // 0-100 scale
  tags?: string[]
}

/**
 * @deprecated Use canonical User.gamingProfile.moodProfile from @gamepilot/shared/models/user instead
 * This interface is replaced by canonical MoodProfile
 */
export interface UserMood {
  id: string
  name: string
  emoji: string
  color: string
  frequency: number // How often user plays games in this mood (1-5 scale)
  preference: number // 0-100 scale
  associatedGenres: string[]
}

/**
 * @deprecated Use canonical User.gamingProfile from @gamepilot/shared/models/user instead
 * This interface is replaced by canonical gaming profile data
 */
export interface UserStats {
  totalPlaytime: number
  gamesPlayed: number
  gamesCompleted: number
  achievementsUnlocked: number
  averageRating: number
  favoriteGenres: string[]
  favoriteMoods: string[]
  currentStreak: number
  longestStreak: number
}

/**
 * @deprecated Use canonical User from @gamepilot/shared/models/user instead
 * This interface is replaced by the canonical User model
 */
export interface UserIdentity {
  profile: UserProfile
  preferences: UserPreferences
  playstyle: UserPlaystyle
  favoriteGenres: UserGenre[]
  favoriteMoods: UserMood[]
  stats: UserStats
  connectedPlatforms: string[]
  customTags: string[]
}

// ============================================================================
// FRONTEND CONSTANTS (Keep - these are UI-specific)
// ============================================================================

export const PLAYSTYLES: PlaystyleIndicator[] = [
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Loves discovering new worlds and secrets',
    icon: '🗺️',
    color: 'from-green-500 to-emerald-600',
    traits: ['curious', 'thorough', 'patient']
  },
  {
    id: 'achiever',
    name: 'Achiever',
    description: 'Driven by completing challenges and earning rewards',
    icon: '🏆',
    color: 'from-yellow-500 to-orange-600',
    traits: ['competitive', 'dedicated', 'goal-oriented']
  },
  {
    id: 'storyteller',
    name: 'Storyteller',
    description: 'Values narrative and emotional experiences',
    icon: '📚',
    color: 'from-purple-500 to-pink-600',
    traits: ['imaginative', 'empathetic', 'reflective']
  },
  {
    id: 'competitor',
    name: 'Competitor',
    description: 'Thrives on challenge and competition',
    icon: '⚔️',
    color: 'from-red-500 to-rose-600',
    traits: ['aggressive', 'strategic', 'focused']
  },
  {
    id: 'creator',
    name: 'Creator',
    description: 'Enjoys building, customizing, and expressing creativity',
    icon: '🎨',
    color: 'from-blue-500 to-indigo-600',
    traits: ['creative', 'innovative', 'expressive']
  },
  {
    id: 'socializer',
    name: 'Socializer',
    description: 'Values community and multiplayer experiences',
    icon: '👥',
    color: 'from-teal-500 to-cyan-600',
    traits: ['outgoing', 'cooperative', 'friendly']
  }
]

export const GENRES: Omit<UserGenre, 'preference'>[] = [
  { id: 'action', name: 'Action', tags: ['fast-paced', 'exciting'] },
  { id: 'adventure', name: 'Adventure', tags: ['exploration', 'story'] },
  { id: 'rpg', name: 'RPG', tags: ['character progression', 'story'] },
  { id: 'strategy', name: 'Strategy', tags: ['tactical', 'planning'] },
  { id: 'simulation', name: 'Simulation', tags: ['realistic', 'detailed'] },
  { id: 'sports', name: 'Sports', tags: ['competitive', 'athletic'] },
  { id: 'racing', name: 'Racing', tags: ['speed', 'competition'] },
  { id: 'puzzle', name: 'Puzzle', tags: ['brain-teaser', 'logic'] },
  { id: 'platformer', name: 'Platformer', tags: ['precision', 'jumping'] },
  { id: 'fps', name: 'FPS', tags: ['shooting', 'first-person'] },
  { id: 'moba', name: 'MOBA', tags: ['team-based', 'competitive'] },
  { id: 'roguelike', name: 'Roguelike', tags: ['procedural', 'challenging'] },
  { id: 'horror', name: 'Horror', tags: ['scary', 'suspenseful'] },
  { id: 'indie', name: 'Indie', tags: ['unique', 'creative'] },
  { id: 'casual', name: 'Casual', tags: ['relaxing', 'accessible'] }
]

export const MOODS: Omit<UserMood, 'frequency' | 'preference'>[] = [
  {
    id: 'relaxed',
    name: 'Relaxed',
    emoji: '😌',
    color: 'from-green-500 to-teal-500',
    associatedGenres: ['simulation', 'puzzle', 'casual']
  },
  {
    id: 'energetic',
    name: 'Energetic',
    emoji: '⚡',
    color: 'from-yellow-500 to-orange-500',
    associatedGenres: ['action', 'racing', 'sports']
  },
  {
    id: 'focused',
    name: 'Focused',
    emoji: '🎯',
    color: 'from-blue-500 to-indigo-500',
    associatedGenres: ['strategy', 'puzzle', 'rpg']
  },
  {
    id: 'creative',
    name: 'Creative',
    emoji: '🎨',
    color: 'from-purple-500 to-pink-500',
    associatedGenres: ['simulation', 'indie', 'adventure']
  },
  {
    id: 'competitive',
    name: 'Competitive',
    emoji: '🏆',
    color: 'from-red-500 to-rose-500',
    associatedGenres: ['fps', 'moba', 'sports', 'fighting']
  },
  {
    id: 'social',
    name: 'Social',
    emoji: '👥',
    color: 'from-cyan-500 to-blue-500',
    associatedGenres: ['moba', 'mmorpg', 'party']
  },
  {
    id: 'nostalgic',
    name: 'Nostalgic',
    emoji: '📻',
    color: 'from-amber-500 to-yellow-500',
    associatedGenres: ['retro', 'platformer', 'indie']
  },
  {
    id: 'adventurous',
    name: 'Adventurous',
    emoji: '🗺️',
    color: 'from-emerald-500 to-green-500',
    associatedGenres: ['adventure', 'rpg', 'exploration']
  }
]
