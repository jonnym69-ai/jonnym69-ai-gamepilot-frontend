// Platform constants for GamePilot

export const PLATFORMS = {
  STEAM: 'steam' as const,
  XBOX: 'xbox' as const,
  PLAYSTATION: 'playstation' as const,
  NINTENDO: 'nintendo' as const,
  EPIC: 'epic' as const,
  GOG: 'gog' as const,
  OTHER: 'other' as const,
} as const

export const PLAY_STATUS = {
  UNPLAYED: 'unplayed' as const,
  PLAYING: 'playing' as const,
  COMPLETED: 'completed' as const,
  PAUSED: 'paused' as const,
  ABANDONED: 'abandoned' as const,
} as const

export const TAG_CATEGORIES = {
  MEMORY: 'memory' as const,
  FEELING: 'feeling' as const,
  OCCASION: 'occasion' as const,
  SOCIAL: 'social' as const,
} as const

export const SESSION_TYPES = {
  MAIN: 'main' as const,
  BREAK: 'break' as const,
  SOCIAL: 'social' as const,
  ACHIEVEMENT: 'achievement' as const,
} as const

export const INTEGRATION_TYPES = {
  YOUTUBE: 'youtube' as const,
  DISCORD: 'discord' as const,
  SPOTIFY: 'spotify' as const,
  TWITCH: 'twitch' as const,
} as const

export const PRIVACY_LEVELS = {
  PUBLIC: 'public' as const,
  FRIENDS: 'friends' as const,
  PRIVATE: 'private' as const,
} as const

export const SOCIAL_PREFERENCES = {
  SOLO: 'solo' as const,
  COOP: 'coop' as const,
  COMPETITIVE: 'competitive' as const,
  ANY: 'any' as const,
} as const

export const TIME_OF_DAY = {
  MORNING: 'morning' as const,
  AFTERNOON: 'afternoon' as const,
  EVENING: 'evening' as const,
  NIGHT: 'night' as const,
} as const

// Default moods for the platform
export const DEFAULT_MOODS = [
  {
    id: 'energetic',
    name: 'Energetic',
    color: '#FF6B6B',
    gradient: '#FF8E53',
    icon: '⚡',
    energyLevel: 9,
    socialPreference: 'any' as const,
    timeOfDay: ['morning', 'afternoon'] as const,
    description: 'Ready for high-energy gaming sessions',
  },
  {
    id: 'relaxed',
    name: 'Relaxed',
    color: '#4ECDC4',
    gradient: '#44A08D',
    icon: '🌊',
    energyLevel: 3,
    socialPreference: 'solo' as const,
    timeOfDay: ['evening', 'night'] as const,
    description: 'Looking for calm, low-stress gaming',
  },
  {
    id: 'focused',
    name: 'Focused',
    color: '#95E77E',
    gradient: '#56AB2F',
    icon: '🎯',
    energyLevel: 7,
    socialPreference: 'solo' as const,
    timeOfDay: ['morning', 'afternoon'] as const,
    description: 'Ready for deep, immersive gameplay',
  },
  {
    id: 'social',
    name: 'Social',
    color: '#FFE66D',
    gradient: '#F7971E',
    icon: '👥',
    energyLevel: 6,
    socialPreference: 'coop' as const,
    timeOfDay: ['afternoon', 'evening'] as const,
    description: 'Looking to play with friends',
  },
  {
    id: 'nostalgic',
    name: 'Nostalgic',
    color: '#C9B1FF',
    gradient: '#8E2DE2',
    icon: '🕰️',
    energyLevel: 4,
    socialPreference: 'solo' as const,
    timeOfDay: ['evening', 'night'] as const,
    description: 'In the mood for classic favorites',
  },
] as const

// Default emotional tags
export const DEFAULT_EMOTIONAL_TAGS = [
  {
    id: 'childhood-favorite',
    name: 'Childhood Favorite',
    color: '#FFB6C1',
    icon: '🧸',
    category: 'memory' as const,
    description: 'Games from my childhood',
  },
  {
    id: 'comfort-game',
    name: 'Comfort Game',
    color: '#98D8C8',
    icon: '🛋️',
    category: 'feeling' as const,
    description: 'Games I return to for comfort',
  },
  {
    id: 'rainy-day',
    name: 'Rainy Day',
    color: '#6C5CE7',
    icon: '🌧️',
    category: 'occasion' as const,
    description: 'Perfect for rainy weather',
  },
  {
    id: 'late-night',
    name: 'Late Night',
    color: '#2C3E50',
    icon: '🌙',
    category: 'occasion' as const,
    description: 'Great for late night sessions',
  },
  {
    id: 'friend-favorite',
    name: 'Friend Favorite',
    color: '#E17055',
    icon: '👫',
    category: 'social' as const,
    description: 'Games loved by my friends',
  },
] as const

// API endpoints
export const API_ENDPOINTS = {
  GAMES: '/api/games',
  USERS: '/api/users',
  PLATFORMS: '/api/platforms',
  MOODS: '/api/moods',
  EMOTIONAL_TAGS: '/api/emotional-tags',
  PLAY_HISTORY: '/api/play-history',
  ACHIEVEMENTS: '/api/achievements',
  INTEGRATIONS: '/api/integrations',
  ACTIVITIES: '/api/activities',
} as const

// Validation rules
export const VALIDATION_RULES = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  GAME_TITLE_MAX_LENGTH: 200,
  GAME_DESCRIPTION_MAX_LENGTH: 2000,
  TAG_NAME_MAX_LENGTH: 50,
  NOTES_MAX_LENGTH: 1000,
  BIO_MAX_LENGTH: 500,
  RATING_MIN: 1,
  RATING_MAX: 10,
  ENERGY_LEVEL_MIN: 1,
  ENERGY_LEVEL_MAX: 10,
} as const
