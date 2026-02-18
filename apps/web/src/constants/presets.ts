import { AvatarPreset, GamingPreset } from '../types/profile'

export const AVATAR_PRESETS: AvatarPreset[] = [
  // Gamer Category
  {
    id: 'pro-gamer',
    name: 'Pro Gamer',
    url: '/avatars/pro-gamer.png',
    category: 'gamer'
  },
  {
    id: 'casual-player',
    name: 'Casual Player', 
    url: '/avatars/casual-player.png',
    category: 'gamer'
  },
  {
    id: 'speedrunner',
    name: 'Speedrunner',
    url: '/avatars/speedrunner.png',
    category: 'gamer'
  },
  {
    id: 'completionist',
    name: 'Completionist',
    url: '/avatars/completionist.png',
    category: 'gamer',
    unlockRequirement: {
      type: 'games',
      value: 10
    }
  },
  
  // Character Category
  {
    id: 'ninja',
    name: 'Shadow Ninja',
    url: '/avatars/ninja.png',
    category: 'character',
    unlockRequirement: {
      type: 'hours',
      value: 50
    }
  },
  {
    id: 'wizard',
    name: 'Arcane Wizard',
    url: '/avatars/wizard.png',
    category: 'character',
    unlockRequirement: {
      type: 'hours',
      value: 100
    }
  },
  {
    id: 'cyber-warrior',
    name: 'Cyber Warrior',
    url: '/avatars/cyber-warrior.png',
    category: 'character',
    unlockRequirement: {
      type: 'hours',
      value: 200
    }
  },
  
  // Abstract Category
  {
    id: 'neon-cube',
    name: 'Neon Cube',
    url: '/avatars/neon-cube.png',
    category: 'abstract'
  },
  {
    id: 'pixel-hero',
    name: 'Pixel Hero',
    url: '/avatars/pixel-hero.png',
    category: 'abstract'
  },
  {
    id: 'glitch-core',
    name: 'Glitch Core',
    url: '/avatars/glitch-core.png',
    category: 'abstract',
    unlockRequirement: {
      type: 'hours',
      value: 25
    }
  },
  
  // Achievement Category
  {
    id: 'veteran',
    name: 'Veteran',
    url: '/avatars/veteran.png',
    category: 'achievement',
    unlockRequirement: {
      type: 'hours',
      value: 500
    }
  },
  {
    id: 'legendary',
    name: 'Legendary',
    url: '/avatars/legendary.png',
    category: 'achievement',
    unlockRequirement: {
      type: 'hours',
      value: 1000
    }
  },
  {
    id: 'mythic',
    name: 'Mythic',
    url: '/avatars/mythic.png',
    category: 'achievement',
    unlockRequirement: {
      type: 'hours',
      value: 2000
    }
  }
]

export const GAMING_PRESETS: GamingPreset[] = [
  {
    id: 'pro-gamer',
    name: '⚡ Pro Gamer',
    description: 'Optimized for competitive gaming with minimal distractions',
    icon: '⚡',
    theme: 'dark',
    accentColor: '#ff0000',
    animationLevel: 'low',
    soundTheme: 'minimal',
    backgroundMode: 'solid',
    componentStyle: 'solid',
    isDefault: true
  },
  {
    id: 'casual-explorer',
    name: '🌍 Casual Explorer',
    description: 'Relaxed and friendly for comfortable gaming sessions',
    icon: '🌍',
    theme: 'light',
    accentColor: '#00ff00',
    animationLevel: 'medium',
    soundTheme: 'nature',
    backgroundMode: 'gradient',
    componentStyle: 'glass-morphism',
    isDefault: true
  },
  {
    id: 'horror-fan',
    name: '👻 Horror Fan',
    description: 'Dark and atmospheric for horror and suspense games',
    icon: '👻',
    theme: 'dark',
    accentColor: '#800080',
    animationLevel: 'high',
    soundTheme: 'epic',
    backgroundMode: 'gradient',
    componentStyle: 'neon',
    isDefault: true
  },
  {
    id: 'retro-master',
    name: '🕹️ Retro Master',
    description: 'Classic gaming vibes with retro aesthetics',
    icon: '🕹️',
    theme: 'dark',
    accentColor: '#ffaa00',
    animationLevel: 'medium',
    soundTheme: 'retro',
    backgroundMode: 'solid',
    componentStyle: 'outline',
    isDefault: true
  },
  {
    id: 'zen-gamer',
    name: '🧘 Zen Gamer',
    description: 'Peaceful and calming for relaxed gaming experiences',
    icon: '🧘',
    theme: 'light',
    accentColor: '#00ffff',
    animationLevel: 'low',
    soundTheme: 'nature',
    backgroundMode: 'gradient',
    componentStyle: 'minimal',
    isDefault: true
  },
  {
    id: 'cyberpunk',
    name: '🌆 Cyberpunk',
    description: 'Futuristic and high-tech for sci-fi gaming',
    icon: '🌆',
    theme: 'dark',
    accentColor: '#00ff00',
    animationLevel: 'high',
    soundTheme: 'cyberpunk',
    backgroundMode: 'gradient',
    componentStyle: 'neon',
    unlockRequirement: {
      type: 'hours',
      value: 25
    }
  },
  {
    id: 'fantasy-adventurer',
    name: '🗡️ Fantasy Adventurer',
    description: 'Magical and immersive for RPG and fantasy games',
    icon: '🗡️',
    theme: 'dark',
    accentColor: '#ffa500',
    animationLevel: 'medium',
    soundTheme: 'epic',
    backgroundMode: 'gradient',
    componentStyle: 'glass-morphism',
    unlockRequirement: {
      type: 'hours',
      value: 50
    }
  },
  {
    id: 'speed-demon',
    name: '🏎️ Speed Demon',
    description: 'Fast and energetic for racing and action games',
    icon: '🏎️',
    theme: 'dark',
    accentColor: '#ff4500',
    animationLevel: 'high',
    soundTheme: 'minimal',
    backgroundMode: 'solid',
    componentStyle: 'solid',
    unlockRequirement: {
      type: 'mood',
      value: 'adrenaline'
    }
  },
  {
    id: 'puzzle-master',
    name: '🧩 Puzzle Master',
    description: 'Clean and focused for puzzle and strategy games',
    icon: '🧩',
    theme: 'light',
    accentColor: '#4169e1',
    animationLevel: 'low',
    soundTheme: 'minimal',
    backgroundMode: 'solid',
    componentStyle: 'minimal',
    unlockRequirement: {
      type: 'mood',
      value: 'brain-power'
    }
  },
  {
    id: 'social-butterfly',
    name: '🦋 Social Butterfly',
    description: 'Colorful and friendly for social and multiplayer games',
    icon: '🦋',
    theme: 'light',
    accentColor: '#ff69b4',
    animationLevel: 'medium',
    soundTheme: 'nature',
    backgroundMode: 'gradient',
    componentStyle: 'glass-morphism',
    unlockRequirement: {
      type: 'mood',
      value: 'social'
    }
  }
]

export function getUnlockedPresets(userStats: {
  totalHoursPlayed: number
  gamesCompleted: number
  favoriteMoods: string[]
}): GamingPreset[] {
  return GAMING_PRESETS.filter(preset => {
    if (preset.isDefault) return true
    
    if (!preset.unlockRequirement) return true
    
    const { type, value } = preset.unlockRequirement
    
    switch (type) {
      case 'hours':
        return userStats.totalHoursPlayed >= (value as number)
      case 'games':
        return userStats.gamesCompleted >= (value as number)
      case 'mood':
        return userStats.favoriteMoods.includes(value as string)
      default:
        return false
    }
  })
}

export function getUnlockedAvatars(userStats: {
  totalHoursPlayed: number
  gamesCompleted: number
}): AvatarPreset[] {
  return AVATAR_PRESETS.filter(preset => {
    if (!preset.unlockRequirement) return true
    
    const { type, value } = preset.unlockRequirement
    
    switch (type) {
      case 'hours':
        return userStats.totalHoursPlayed >= (value as number)
      case 'games':
        return userStats.gamesCompleted >= (value as number)
      default:
        return false
    }
  })
}
