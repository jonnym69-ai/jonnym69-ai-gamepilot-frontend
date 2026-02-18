// Static mood data for GamePilot platform

export interface MoodData {
  id: string
  name: string
  description: string
  color: string
  gradient?: string
  icon: string
  energyLevel: number // 1-10 scale
  socialPreference: 'solo' | 'cooperative' | 'competitive' | 'flexible'
  timeOfDay: ('morning' | 'afternoon' | 'evening' | 'night')[]
  genreAffinities: string[] // Genre IDs that match this mood
  category: 'energy' | 'exploration' | 'challenge' | 'social' | 'creative' | 'immersion' | 'action' | 'vibe'
}

// Core Gaming Moods
export const GAMING_MOODS: MoodData[] = [
  // Energy & Focus Moods
  {
    id: 'chill',
    name: 'Chill',
    description: 'Relaxed, low-stress gaming with minimal pressure',
    color: '#4ECDC4',
    gradient: '#44A08D',
    icon: '🌊',
    energyLevel: 2,
    socialPreference: 'solo',
    timeOfDay: ['evening', 'night'],
    genreAffinities: ['simulation', 'puzzle', 'adventure'],
    category: 'energy'
  },
  {
    id: 'focused',
    name: 'Focused',
    description: 'Deep concentration, ready for complex challenges',
    color: '#95E77E',
    gradient: '#56AB2F',
    icon: '🎯',
    energyLevel: 7,
    socialPreference: 'solo',
    timeOfDay: ['morning', 'afternoon'],
    genreAffinities: ['strategy', 'puzzle', 'rpg'],
    category: 'energy'
  },
  {
    id: 'energetic',
    name: 'Energetic',
    description: 'High energy, fast-paced action and excitement',
    color: '#FF6B6B',
    gradient: '#FF8E53',
    icon: '⚡',
    energyLevel: 9,
    socialPreference: 'flexible',
    timeOfDay: ['morning', 'afternoon'],
    genreAffinities: ['action', 'sports', 'racing'],
    category: 'energy'
  },
  {
    id: 'lazy',
    name: 'Lazy',
    description: 'Low effort, casual gaming while winding down',
    color: '#95A5A6',
    gradient: '#7F8C8D',
    icon: '😌',
    energyLevel: 1,
    socialPreference: 'solo',
    timeOfDay: ['evening', 'night'],
    genreAffinities: ['simulation', 'puzzle', 'adventure'],
    category: 'energy'
  },
  {
    id: 'intense',
    name: 'Intense',
    description: 'Maximum focus, competitive mindset engaged',
    color: '#E74C3C',
    gradient: '#C0392B',
    icon: '🔥',
    energyLevel: 10,
    socialPreference: 'competitive',
    timeOfDay: ['afternoon', 'evening'],
    genreAffinities: ['action', 'fighting-games-esports', 'competitive-fps'],
    category: 'energy'
  },

  // Exploration & Discovery Moods
  {
    id: 'explore',
    name: 'Explore',
    description: 'Curiosity-driven, want to discover new worlds',
    color: '#3498DB',
    gradient: '#2980B9',
    icon: '🗺️',
    energyLevel: 6,
    socialPreference: 'solo',
    timeOfDay: ['afternoon', 'evening'],
    genreAffinities: ['adventure', 'action-adventure', 'open-world-action'],
    category: 'exploration'
  },
  {
    id: 'wander',
    name: 'Wander',
    description: 'Aimless exploration, no particular goal',
    color: '#9B59B6',
    gradient: '#8E44AD',
    icon: '🚶',
    energyLevel: 3,
    socialPreference: 'solo',
    timeOfDay: ['evening', 'night'],
    genreAffinities: ['adventure', 'simulation', 'walking-simulator-indie'],
    category: 'exploration'
  },
  {
    id: 'investigate',
    name: 'Investigate',
    description: 'Detective mindset, solving mysteries',
    color: '#2C3E50',
    gradient: '#1A252F',
    icon: '🔍',
    energyLevel: 7,
    socialPreference: 'solo',
    timeOfDay: ['afternoon', 'evening'],
    genreAffinities: ['adventure', 'puzzle', 'horror'],
    category: 'exploration'
  },
  {
    id: 'adventure',
    name: 'Adventure',
    description: 'Ready for epic journeys and quests',
    color: '#F39C12',
    gradient: '#E67E22',
    icon: '🗡️',
    energyLevel: 8,
    socialPreference: 'flexible',
    timeOfDay: ['morning', 'afternoon'],
    genreAffinities: ['rpg', 'action-adventure', 'rpg-adventure'],
    category: 'exploration'
  },
  {
    id: 'curious',
    name: 'Curious',
    description: 'Experimental, trying new things',
    color: '#E91E63',
    gradient: '#C13515',
    icon: '🤔',
    energyLevel: 5,
    socialPreference: 'flexible',
    timeOfDay: ['afternoon', 'evening'],
    genreAffinities: ['experimental', 'short-form', 'unique-mechanics'],
    category: 'exploration'
  },

  // Challenge & Achievement Moods
  {
    id: 'grind',
    name: 'Grind',
    description: 'Repetitive tasks for progression/loot',
    color: '#FF9800',
    gradient: '#F57C00',
    icon: '⚙️',
    energyLevel: 6,
    socialPreference: 'solo',
    timeOfDay: ['afternoon', 'evening'],
    genreAffinities: ['rpg', 'mmorpg', 'action-rpg'],
    category: 'challenge'
  },
  {
    id: 'sweat',
    name: 'Sweat',
    description: 'High difficulty, challenging gameplay',
    color: '#DC143C',
    gradient: '#B71C1C',
    icon: '💪',
    energyLevel: 9,
    socialPreference: 'solo',
    timeOfDay: ['afternoon', 'evening'],
    genreAffinities: ['souls-like', 'roguelike', 'competitive-fps'],
    category: 'challenge'
  },
  {
    id: 'persevere',
    name: 'Persevere',
    description: 'Overcoming obstacles, determined mindset',
    color: '#795548',
    gradient: '#5D4037',
    icon: '💪',
    energyLevel: 8,
    socialPreference: 'solo',
    timeOfDay: ['afternoon', 'evening'],
    genreAffinities: ['roguelike', 'dungeon-crawler', 'survival-horror'],
    category: 'challenge'
  },
  {
    id: 'master',
    name: 'Master',
    description: 'Skill refinement, perfecting techniques',
    color: '#607D8B',
    gradient: '#455A64',
    icon: '🏆',
    energyLevel: 7,
    socialPreference: 'flexible',
    timeOfDay: ['morning', 'afternoon'],
    genreAffinities: ['fighting-games-esports', 'competitive-racing', 'sports-games-esports'],
    category: 'challenge'
  },
  {
    id: 'conquer',
    name: 'Conquer',
    description: 'Dominating challenges, victory-focused',
    color: '#D32F2F',
    gradient: '#B71C1C',
    icon: '👑',
    energyLevel: 10,
    socialPreference: 'competitive',
    timeOfDay: ['afternoon', 'evening'],
    genreAffinities: ['strategy', 'real-time-strategy-esports', 'moba-arts'],
    category: 'challenge'
  },

  // Social & Competitive Moods
  {
    id: 'compete',
    name: 'Compete',
    description: 'Direct player vs player competition',
    color: '#E74C3C',
    gradient: '#C0392B',
    icon: '🥊',
    energyLevel: 9,
    socialPreference: 'competitive',
    timeOfDay: ['afternoon', 'evening'],
    genreAffinities: ['fighting-games-esports', 'sports-games-esports', 'competitive-fps'],
    category: 'social'
  },
  {
    id: 'cooperate',
    name: 'Cooperate',
    description: 'Team-based gameplay, helping others',
    color: '#27AE60',
    gradient: '#229954',
    icon: '🤝',
    energyLevel: 6,
    socialPreference: 'cooperative',
    timeOfDay: ['afternoon', 'evening'],
    genreAffinities: ['moba-arts', 'team-rts', 'party-games'],
    category: 'social'
  },
  {
    id: 'social',
    name: 'Social',
    description: 'Playing with friends, community focus',
    color: '#F39C12',
    gradient: '#E67E22',
    icon: '👥',
    energyLevel: 5,
    socialPreference: 'flexible',
    timeOfDay: ['afternoon', 'evening'],
    genreAffinities: ['party-games', 'music-rhythm', 'local-multiplayer'],
    category: 'social'
  },
  {
    id: 'lead',
    name: 'Lead',
    description: 'Taking charge, guiding team to victory',
    color: '#9C27B0',
    gradient: '#7B1FA2',
    icon: '👑',
    energyLevel: 8,
    socialPreference: 'cooperative',
    timeOfDay: ['afternoon', 'evening'],
    genreAffinities: ['moba-arts', 'real-time-strategy-esports', 'team-strategy-games'],
    category: 'social'
  },
  {
    id: 'support',
    name: 'Support',
    description: 'Assisting others, enabling team success',
    color: '#00BCD4',
    gradient: '#0288D1',
    icon: '🛡️',
    energyLevel: 5,
    socialPreference: 'cooperative',
    timeOfDay: ['afternoon', 'evening'],
    genreAffinities: ['moba-arts', 'team-rts', 'healing-games'],
    category: 'social'
  },

  // Creative & Problem-Solving Moods
  {
    id: 'solve',
    name: 'Solve',
    description: 'Puzzle-solving, critical thinking engaged',
    color: '#2196F3',
    gradient: '#1976D2',
    icon: '🧠',
    energyLevel: 7,
    socialPreference: 'solo',
    timeOfDay: ['morning', 'afternoon'],
    genreAffinities: ['puzzle', 'strategy', 'puzzle-adventure'],
    category: 'creative'
  },
  {
    id: 'create',
    name: 'Create',
    description: 'Building, designing, or making content',
    color: '#4CAF50',
    gradient: '#388E3C',
    icon: '🛠️',
    energyLevel: 6,
    socialPreference: 'flexible',
    timeOfDay: ['morning', 'afternoon'],
    genreAffinities: ['simulation', 'art-creativity', 'game-development-tools'],
    category: 'creative'
  },
  {
    id: 'experiment',
    name: 'Experiment',
    description: 'Trying new strategies, unconventional approaches',
    color: '#FF9800',
    gradient: '#F57C00',
    icon: '🧪',
    energyLevel: 5,
    socialPreference: 'flexible',
    timeOfDay: ['afternoon', 'evening'],
    genreAffinities: ['experimental', 'unique-mechanics', 'strategy-rpg'],
    category: 'creative'
  },
  {
    id: 'optimize',
    name: 'Optimize',
    description: 'Efficiency-focused, finding best methods',
    color: '#795548',
    gradient: '#5D4037',
    icon: '📊',
    energyLevel: 6,
    socialPreference: 'solo',
    timeOfDay: ['morning', 'afternoon'],
    genreAffinities: ['strategy', 'simulation-strategy', 'auto-chess'],
    category: 'creative'
  },
  {
    id: 'innovate',
    name: 'Innovate',
    description: 'Breaking meta, finding new solutions',
    color: '#9C27B0',
    gradient: '#7B1FA2',
    icon: '💡',
    energyLevel: 7,
    socialPreference: 'flexible',
    timeOfDay: ['afternoon', 'evening'],
    genreAffinities: ['experimental', 'unique-mechanics', 'card-strategy-games-esports'],
    category: 'creative'
  },

  // Immersion & Escapism Moods
  {
    id: 'immerse',
    name: 'Immerse',
    description: 'Deep story engagement, role-playing',
    color: '#673AB7',
    gradient: '#512DA8',
    icon: '🎭',
    energyLevel: 6,
    socialPreference: 'solo',
    timeOfDay: ['evening', 'night'],
    genreAffinities: ['rpg', 'rpg-adventure', 'narrative-focus'],
    category: 'immersion'
  },
  {
    id: 'escape',
    name: 'Escape',
    description: 'Mental break from reality, stress relief',
    color: '#3F51B5',
    gradient: '#283593',
    icon: '🌙',
    energyLevel: 3,
    socialPreference: 'solo',
    timeOfDay: ['evening', 'night'],
    genreAffinities: ['simulation', 'atmospheric', 'relaxation-games'],
    category: 'immersion'
  },
  {
    id: 'dream',
    name: 'Dream',
    description: 'Fantastical, imaginative gameplay',
    color: '#E91E63',
    gradient: '#C13515',
    icon: '✨',
    energyLevel: 4,
    socialPreference: 'solo',
    timeOfDay: ['evening', 'night'],
    genreAffinities: ['atmospheric', 'narrative-focus', 'art-games'],
    category: 'immersion'
  },
  {
    id: 'nostalgic',
    name: 'Nostalgic',
    description: 'Revisiting familiar, comforting experiences',
    color: '#795548',
    gradient: '#5D4037',
    icon: '🕰️',
    energyLevel: 4,
    socialPreference: 'flexible',
    timeOfDay: ['evening', 'night'],
    genreAffinities: ['retro', '8-bit-16-bit-era', 'arcade-classics'],
    category: 'immersion'
  },
  {
    id: 'zen',
    name: 'Zen',
    description: 'Meditative, flow state gaming',
    color: '#009688',
    gradient: '#00796B',
    icon: '🧘',
    energyLevel: 2,
    socialPreference: 'solo',
    timeOfDay: ['evening', 'night'],
    genreAffinities: ['puzzle', 'atmospheric', 'meditation-games'],
    category: 'immersion'
  },

  // Action & Destruction Moods
  {
    id: 'destroy',
    name: 'Destroy',
    description: 'Chaos, demolition, explosive gameplay',
    color: '#D32F2F',
    gradient: '#B71C1C',
    icon: '💥',
    energyLevel: 10,
    socialPreference: 'flexible',
    timeOfDay: ['afternoon', 'evening'],
    genreAffinities: ['action', 'competitive-fps', 'arena-shooters'],
    category: 'action'
  },
  {
    id: 'dominate',
    name: 'Dominate',
    description: 'Power fantasy, overwhelming force',
    color: '#FF5722',
    gradient: '#E64A19',
    icon: '👹',
    energyLevel: 10,
    socialPreference: 'competitive',
    timeOfDay: ['afternoon', 'evening'],
    genreAffinities: ['action', 'competitive-fps', 'battle-royale'],
    category: 'action'
  },
  {
    id: 'hunt',
    name: 'Hunt',
    description: 'Predator mindset, tracking and capturing',
    color: '#FF6F00',
    gradient: '#E65100',
    icon: '🎯',
    energyLevel: 8,
    socialPreference: 'solo',
    timeOfDay: ['afternoon', 'evening'],
    genreAffinities: ['action', 'stealth', 'survival-action'],
    category: 'action'
  },
  {
    id: 'rage',
    name: 'Rage',
    description: 'Cathartic release, aggressive gameplay',
    color: '#B71C1C',
    gradient: '#8B0000',
    icon: '😡',
    energyLevel: 9,
    socialPreference: 'solo',
    timeOfDay: ['evening', 'night'],
    genreAffinities: ['action', 'fighting-games-esports', 'horror'],
    category: 'action'
  },
  {
    id: 'unleash',
    name: 'Unleash',
    description: 'Full power expression, no limits',
    color: '#9C27B0',
    gradient: '#7B1FA2',
    icon: '⚡',
    energyLevel: 10,
    socialPreference: 'flexible',
    timeOfDay: ['afternoon', 'evening'],
    genreAffinities: ['action', 'hack-slash', 'beat-em-up'],
    category: 'action'
  },

  // Vibe & Atmosphere Moods
  {
    id: 'vibe',
    name: 'Vibe',
    description: 'Atmosphere-focused, mood matching',
    color: '#9C27B0',
    gradient: '#7B1FA2',
    icon: '🎵',
    energyLevel: 5,
    socialPreference: 'flexible',
    timeOfDay: ['afternoon', 'evening'],
    genreAffinities: ['music-rhythm', 'atmospheric', 'narrative-focus'],
    category: 'vibe'
  },
  {
    id: 'chillax',
    name: 'Chillax',
    description: 'Ultra-relaxed, almost meditative',
    color: '#4ECDC4',
    gradient: '#44A08D',
    icon: '🌊',
    energyLevel: 1,
    socialPreference: 'solo',
    timeOfDay: ['evening', 'night'],
    genreAffinities: ['simulation', 'meditation-games', 'relaxation-games'],
    category: 'vibe'
  },
  {
    id: 'hype',
    name: 'Hype',
    description: 'Excited, anticipating action or rewards',
    color: '#FF9800',
    gradient: '#F57C00',
    icon: '🎉',
    energyLevel: 8,
    socialPreference: 'flexible',
    timeOfDay: ['morning', 'afternoon'],
    genreAffinities: ['action', 'sports', 'competitive-fps'],
    category: 'vibe'
  },
  {
    id: 'cozy',
    name: 'Cozy',
    description: 'Comfortable, warm, safe gaming space',
    color: '#FFB74D',
    gradient: '#FF9800',
    icon: '🏠',
    energyLevel: 2,
    socialPreference: 'solo',
    timeOfDay: ['evening', 'night'],
    genreAffinities: ['simulation', 'life-sim', 'farming-sim'],
    category: 'vibe'
  },
  {
    id: 'mysterious',
    name: 'Mysterious',
    description: 'Enigmatic, uncovering secrets',
    color: '#424242',
    gradient: '#212121',
    icon: '🔮',
    energyLevel: 6,
    socialPreference: 'solo',
    timeOfDay: ['evening', 'night'],
    genreAffinities: ['horror', 'psychological-horror', 'found-footage'],
    category: 'vibe'
  }
]

// Export helper functions
export const getMoodById = (id: string): MoodData | undefined => {
  return GAMING_MOODS.find(mood => mood.id === id)
}

export const getMoodsByCategory = (category: MoodData['category']): MoodData[] => {
  return GAMING_MOODS.filter(mood => mood.category === category)
}

export const getMoodsByEnergyLevel = (minLevel: number, maxLevel: number): MoodData[] => {
  return GAMING_MOODS.filter(mood => mood.energyLevel >= minLevel && mood.energyLevel <= maxLevel)
}

export const getMoodsBySocialPreference = (preference: MoodData['socialPreference']): MoodData[] => {
  return GAMING_MOODS.filter(mood => mood.socialPreference === preference)
}

export const getMoodsByTimeOfDay = (timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'): MoodData[] => {
  return GAMING_MOODS.filter(mood => mood.timeOfDay.includes(timeOfDay))
}

export const searchMoods = (query: string): MoodData[] => {
  const lowercaseQuery = query.toLowerCase()
  return GAMING_MOODS.filter(mood => 
    mood.name.toLowerCase().includes(lowercaseQuery) ||
    mood.description.toLowerCase().includes(lowercaseQuery)
  )
}

export const getPopularMoods = (): MoodData[] => {
  return [
    getMoodById('chill')!,
    getMoodById('focused')!,
    getMoodById('energetic')!,
    getMoodById('explore')!,
    getMoodById('compete')!,
    getMoodById('immerse')!
  ].filter(Boolean)
}

export const getMoodRecommendations = (currentMood: string, context?: {
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night'
  energyLevel?: number
  socialContext?: 'solo' | 'cooperative' | 'competitive'
}): MoodData[] => {
  const mood = getMoodById(currentMood)
  if (!mood) return []

  let recommendations = GAMING_MOODS.filter(m => {
    if (m.id === currentMood) return false
    
    if (context?.timeOfDay && !m.timeOfDay.includes(context.timeOfDay)) return false
    
    if (context?.energyLevel && Math.abs(m.energyLevel - context.energyLevel) > 2) return false
    
    if (context?.socialContext && m.socialPreference !== 'flexible' && m.socialPreference !== context.socialContext) return false
    
    return true
  })

  return recommendations.sort((a, b) => {
    const aSimilarity = Math.abs(a.energyLevel - mood.energyLevel)
    const bSimilarity = Math.abs(b.energyLevel - mood.energyLevel)
    return aSimilarity - bSimilarity
  }).slice(0, 5)
}
