export interface UserProfile {
  displayName: string
  avatar: {
    type: 'preset' | 'upload' | 'generated'
    url?: string
    presetId?: string
  }
  banner: string
  bio: string
  favoriteMoods: string[]
  gamingLevel: string
  totalHoursPlayed: number
  gamesCompleted: number
  favoriteGenres: string[]
  joinDate: string
  lastActive: string
  // Greeting customization
  preferredGreeting?: string
  greetingPhrases?: string[]
}

export interface AvatarPreset {
  id: string
  name: string
  url: string
  category: 'gamer' | 'character' | 'abstract' | 'achievement'
  unlockRequirement?: {
    type: 'hours' | 'games' | 'achievement'
    value: number
  }
}

export interface GamingPreset {
  id: string
  name: string
  description: string
  icon: string
  theme: 'dark' | 'light' | 'system' | 'auto'
  accentColor: string
  animationLevel: 'low' | 'medium' | 'high'
  soundTheme: 'cyberpunk' | 'retro' | 'minimal' | 'epic' | 'nature'
  backgroundMode: 'solid' | 'gradient' | 'image'
  componentStyle: 'glass-morphism' | 'solid' | 'outline' | 'neon' | 'minimal'
  unlockRequirement?: {
    type: 'hours' | 'games' | 'mood' | 'level'
    value: number | string
  }
  isDefault?: boolean
}
