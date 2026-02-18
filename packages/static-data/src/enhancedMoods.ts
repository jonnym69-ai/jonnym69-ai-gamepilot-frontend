// Enhanced Mood System - User-Selectable Moods
// 
// These moods are distinct from genres and represent emotional/mental states
// that influence game preferences and recommendation scoring.

export interface Mood {
  id: string
  name: string
  description: string
  emoji: string
  icon: string // Required icon property
  color: string // Tailwind gradient class
  intensity: number // Numeric intensity for compatibility
  associatedGenres: string[]
}

/**
 * Enhanced Mood System - User-Selectable Moods
 * 
 * These moods are distinct from genres and represent emotional/mental states
 * that influence game preferences and recommendation scoring.
 */

export interface EnhancedMood extends Mood {
  // Core mood properties
  energyLevel: number        // 1-10 scale (1=low energy, 10=high energy)
  socialRequirement: number  // 1-10 scale (1=solo, 10=multiplayer preferred)
  cognitiveLoad: number      // 1-10 scale (1=relaxed, 10=intense focus required)
  timeCommitment: number     // 1-10 scale (1=quick sessions, 10=deep engagement)
  
  // Recommendation influence factors
  genreWeights: Record<string, number>  // How much this mood prefers each genre
  tagWeights: Record<string, number>    // How much this mood prefers certain tags
  platformBias: Record<string, number> // Platform preferences for this mood
  
  // Hybrid mood combinations
  compatibleMoods: string[]   // Moods that work well combined with this one
  conflictingMoods: string[] // Moods that don't combine well
  
  // Behavioral signals
  sessionPatterns: {
    preferredSessionLength: number    // minutes
    likelihoodOfMultiplayer: number   // 0-1
    toleranceForDifficulty: number    // 0-1
    desireForNovelty: number          // 0-1
  }
}

export const ENHANCED_MOODS: readonly EnhancedMood[] = [
  {
    // Low-Energy: Relaxed, minimal cognitive load
    id: 'low-energy',
    name: 'Low-Energy',
    description: 'Relaxed gaming with minimal mental effort',
    emoji: '🌊',
    icon: '🛋️',
    color: 'from-blue-400 to-cyan-500',
    intensity: 2,
    associatedGenres: ['casual', 'puzzle', 'simulation'],
    
    energyLevel: 2,
    socialRequirement: 3,
    cognitiveLoad: 2,
    timeCommitment: 3,
    
    genreWeights: {
      'casual': 0.9,
      'puzzle': 0.8,
      'simulation': 0.7,
      'strategy': 0.3,
      'action': 0.2
    },
    
    tagWeights: {
      'relaxing': 0.9,
      'meditative': 0.8,
      'cozy': 0.8,
      'intense': 0.1,
      'competitive': 0.1
    },
    
    platformBias: {
      'pc': 0.7,
      'mobile': 0.9,
      'console': 0.6
    },
    
    compatibleMoods: ['creative', 'exploratory'],
    conflictingMoods: ['competitive', 'high-energy'],
    
    sessionPatterns: {
      preferredSessionLength: 20,
      likelihoodOfMultiplayer: 0.2,
      toleranceForDifficulty: 0.3,
      desireForNovelty: 0.4
    }
  },
  
  {
    // High-Energy: Excited, stimulated
    id: 'high-energy',
    name: 'High-Energy',
    description: 'Exciting, stimulating gameplay experiences',
    emoji: '⚡',
    icon: '🚀',
    color: 'from-yellow-500 to-orange-600',
    intensity: 9,
    associatedGenres: ['action', 'racing', 'platformer'],
    
    energyLevel: 9,
    socialRequirement: 6,
    cognitiveLoad: 7,
    timeCommitment: 6,
    
    genreWeights: {
      'action': 0.9,
      'racing': 0.8,
      'sports': 0.7,
      'puzzle': 0.2,
      'simulation': 0.3
    },
    
    tagWeights: {
      'intense': 0.9,
      'fast-paced': 0.8,
      'exciting': 0.8,
      'relaxing': 0.1,
      'meditative': 0.1
    },
    
    platformBias: {
      'pc': 0.8,
      'console': 0.9,
      'mobile': 0.5
    },
    
    compatibleMoods: ['competitive', 'social'],
    conflictingMoods: ['low-energy', 'focused'],
    
    sessionPatterns: {
      preferredSessionLength: 45,
      likelihoodOfMultiplayer: 0.7,
      toleranceForDifficulty: 0.6,
      desireForNovelty: 0.7
    }
  },
  
  {
    // Deep-Focus: Strategic, analytical
    id: 'deep-focus',
    name: 'Deep-Focus',
    description: 'Strategic thinking and deep concentration',
    emoji: '🎯',
    icon: '🧠',
    color: 'from-indigo-500 to-purple-600',
    intensity: 7,
    associatedGenres: ['strategy', 'puzzle', 'rpg'],
    
    energyLevel: 5,
    socialRequirement: 2,
    cognitiveLoad: 9,
    timeCommitment: 8,
    
    genreWeights: {
      'strategy': 0.9,
      'puzzle': 0.8,
      'rpg': 0.7,
      'action': 0.3,
      'casual': 0.2
    },
    
    tagWeights: {
      'strategic': 0.9,
      'challenging': 0.8,
      'complex': 0.7,
      'simple': 0.2,
      'casual': 0.2
    },
    
    platformBias: {
      'pc': 0.9,
      'console': 0.6,
      'mobile': 0.3
    },
    
    compatibleMoods: ['immersive', 'exploratory'],
    conflictingMoods: ['high-energy', 'social'],
    
    sessionPatterns: {
      preferredSessionLength: 90,
      likelihoodOfMultiplayer: 0.1,
      toleranceForDifficulty: 0.9,
      desireForNovelty: 0.5
    }
  },
  
  {
    // Social: Connected, collaborative
    id: 'social',
    name: 'Social',
    description: 'Playing and connecting with others',
    emoji: '🤝',
    icon: '👥',
    color: 'from-teal-500 to-cyan-600',
    intensity: 5,
    associatedGenres: ['multiplayer', 'sports', 'casual'],
    
    energyLevel: 6,
    socialRequirement: 9,
    cognitiveLoad: 5,
    timeCommitment: 6,
    
    genreWeights: {
      'multiplayer': 0.9,
      'sports': 0.7,
      'casual': 0.6,
      'strategy': 0.5,
      'puzzle': 0.3
    },
    
    tagWeights: {
      'multiplayer': 0.9,
      'cooperative': 0.8,
      'team-based': 0.8,
      'single-player': 0.2,
      'solo': 0.2
    },
    
    platformBias: {
      'pc': 0.8,
      'console': 0.9,
      'mobile': 0.6
    },
    
    compatibleMoods: ['high-energy', 'competitive'],
    conflictingMoods: ['deep-focus', 'low-energy'],
    
    sessionPatterns: {
      preferredSessionLength: 60,
      likelihoodOfMultiplayer: 0.9,
      toleranceForDifficulty: 0.5,
      desireForNovelty: 0.6
    }
  },
  
  {
    // Creative: Building, expressing
    id: 'creative',
    name: 'Creative',
    description: 'Building and expressing creativity',
    emoji: '🎨',
    icon: '🎭',
    color: 'from-green-500 to-emerald-600',
    intensity: 6,
    associatedGenres: ['simulation', 'casual', 'puzzle'],
    
    energyLevel: 5,
    socialRequirement: 4,
    cognitiveLoad: 6,
    timeCommitment: 7,
    
    genreWeights: {
      'simulation': 0.9,
      'casual': 0.7,
      'puzzle': 0.6,
      'action': 0.3,
      'strategy': 0.5
    },
    
    tagWeights: {
      'creative': 0.9,
      'building': 0.8,
      'customization': 0.8,
      'destructive': 0.2,
      'competitive': 0.3
    },
    
    platformBias: {
      'pc': 0.9,
      'console': 0.5,
      'mobile': 0.4
    },
    
    compatibleMoods: ['low-energy', 'exploratory'],
    conflictingMoods: ['competitive', 'high-energy'],
    
    sessionPatterns: {
      preferredSessionLength: 75,
      likelihoodOfMultiplayer: 0.3,
      toleranceForDifficulty: 0.4,
      desireForNovelty: 0.8
    }
  },
  
  {
    // Exploratory: Discovery-driven
    id: 'exploratory',
    name: 'Exploratory',
    description: 'Discovering new worlds and secrets',
    emoji: '🗺️',
    icon: '🧭',
    color: 'from-green-500 to-teal-600',
    intensity: 5,
    associatedGenres: ['adventure', 'rpg', 'simulation'],
    
    energyLevel: 6,
    socialRequirement: 5,
    cognitiveLoad: 5,
    timeCommitment: 7,
    
    genreWeights: {
      'adventure': 0.9,
      'rpg': 0.8,
      'simulation': 0.6,
      'action': 0.5,
      'puzzle': 0.4
    },
    
    tagWeights: {
      'exploration': 0.9,
      'discovery': 0.8,
      'open-world': 0.8,
      'linear': 0.2,
      'structured': 0.3
    },
    
    platformBias: {
      'pc': 0.8,
      'console': 0.8,
      'mobile': 0.5
    },
    
    compatibleMoods: ['immersive', 'creative'],
    conflictingMoods: ['competitive'],
    
    sessionPatterns: {
      preferredSessionLength: 80,
      likelihoodOfMultiplayer: 0.4,
      toleranceForDifficulty: 0.5,
      desireForNovelty: 0.9
    }
  },
  
  {
    // Competitive: Achievement-focused
    id: 'competitive',
    name: 'Competitive',
    description: 'Challenge-seeking and achievement-focused',
    emoji: '🏆',
    icon: '⚔️',
    color: 'from-red-500 to-orange-600',
    intensity: 8,
    associatedGenres: ['action', 'sports', 'multiplayer'],
    
    energyLevel: 8,
    socialRequirement: 7,
    cognitiveLoad: 7,
    timeCommitment: 6,
    
    genreWeights: {
      'action': 0.8,
      'sports': 0.8,
      'multiplayer': 0.9,
      'casual': 0.2,
      'simulation': 0.3
    },
    
    tagWeights: {
      'competitive': 0.9,
      'challenging': 0.8,
      'skill-based': 0.8,
      'casual': 0.1,
      'relaxing': 0.1
    },
    
    platformBias: {
      'pc': 0.9,
      'console': 0.8,
      'mobile': 0.4
    },
    
    compatibleMoods: ['high-energy', 'social'],
    conflictingMoods: ['low-energy', 'creative'],
    
    sessionPatterns: {
      preferredSessionLength: 50,
      likelihoodOfMultiplayer: 0.8,
      toleranceForDifficulty: 0.8,
      desireForNovelty: 0.4
    }
  },
  
  {
    // Immersive: Story-driven, atmospheric
    id: 'immersive',
    name: 'Immersive',
    description: 'Story-driven and atmospheric experiences',
    emoji: '📖',
    icon: '🎭',
    color: 'from-purple-500 to-pink-600',
    intensity: 5,
    associatedGenres: ['rpg', 'adventure'],
    
    energyLevel: 4,
    socialRequirement: 2,
    cognitiveLoad: 6,
    timeCommitment: 9,
    
    genreWeights: {
      'rpg': 0.9,
      'adventure': 0.8,
      'story': 0.9,
      'action': 0.4,
      'puzzle': 0.5
    },
    
    tagWeights: {
      'story-driven': 0.9,
      'atmospheric': 0.8,
      'immersive': 0.8,
      'arcade': 0.2,
      'casual': 0.3
    },
    
    platformBias: {
      'pc': 0.8,
      'console': 0.9,
      'mobile': 0.3
    },
    
    compatibleMoods: ['deep-focus', 'exploratory'],
    conflictingMoods: ['high-energy', 'social'],
    
    sessionPatterns: {
      preferredSessionLength: 120,
      likelihoodOfMultiplayer: 0.1,
      toleranceForDifficulty: 0.6,
      desireForNovelty: 0.7
    }
  }
] as const

export type EnhancedMoodId = typeof ENHANCED_MOODS[number]['id']

/**
 * Hybrid mood combinations for sophisticated recommendations
 */
export interface MoodCombination {
  primaryMood: EnhancedMoodId
  secondaryMood?: EnhancedMoodId
  intensity: number        // 0-1 scale of combination strength
  context: string         // User's context for this combination
}

/**
 * Pre-defined mood combinations that work well together
 */
export const MOOD_COMBINATIONS: readonly MoodCombination[] = [
  {
    primaryMood: 'low-energy',
    secondaryMood: 'creative',
    intensity: 0.8,
    context: 'Relaxed building and creativity'
  },
  {
    primaryMood: 'high-energy',
    secondaryMood: 'competitive',
    intensity: 0.9,
    context: 'Intense competitive gameplay'
  },
  {
    primaryMood: 'deep-focus',
    secondaryMood: 'immersive',
    intensity: 0.8,
    context: 'Deep strategic immersion'
  },
  {
    primaryMood: 'social',
    secondaryMood: 'high-energy',
    intensity: 0.7,
    context: 'Energetic social gaming'
  },
  {
    primaryMood: 'exploratory',
    secondaryMood: 'immersive',
    intensity: 0.8,
    context: 'Deep world exploration'
  },
  {
    primaryMood: 'creative',
    secondaryMood: 'low-energy',
    intensity: 0.7,
    context: 'Casual creative expression'
  },
  {
    primaryMood: 'competitive',
    secondaryMood: 'social',
    intensity: 0.8,
    context: 'Team-based competition'
  },
  {
    primaryMood: 'immersive',
    secondaryMood: 'deep-focus',
    intensity: 0.9,
    context: 'Story-driven concentration'
  }
] as const
