import { useState, useCallback } from 'react'
import { ENHANCED_MOODS, type EnhancedMoodId } from '@gamepilot/static-data'
import { EnhancedMoodFilter, type MoodFilterContext } from '@gamepilot/identity-engine'

/**
 * Test hook for enhanced mood system integration
 * This demonstrates how to use the enhanced mood system in the frontend
 */

export interface TestMoodState {
  primaryMood?: EnhancedMoodId
  secondaryMood?: EnhancedMoodId
  intensity: number
  recommendations: any[]
  isLoading: boolean
  error?: string
}

export function useTestEnhancedMoodSystem() {
  const [state, setState] = useState<TestMoodState>({
    intensity: 0.8,
    recommendations: [],
    isLoading: false
  })

  // Mock game data for testing
  const mockGames = [
    {
      id: 'game-1',
      title: 'Stardew Valley',
      coverImage: '/covers/stardew-valley.jpg',
      genres: [{ id: 'casual', name: 'Casual', description: 'Relaxing and easy-to-play games', icon: '🌱', color: 'green', tags: ['relaxing', 'family-friendly'] }, { id: 'simulation', name: 'Simulation', description: 'Games that simulate real-world activities', icon: '🏗️', color: 'blue', tags: ['realistic', 'detailed'] }],
      subgenres: [],
      platforms: [{ id: 'pc', name: 'PC', code: 'pc' as any, isConnected: false }],
      emotionalTags: [],
      playStatus: 'playing' as const,
      addedAt: new Date(),
      isFavorite: false,
      releaseYear: 2016,
      tags: ['relaxing', 'creative', 'building'],
      hoursPlayed: 45,
      moods: ['relaxed', 'creative']
    },
    {
      id: 'game-2', 
      title: 'Counter-Strike 2',
      coverImage: '/covers/cs2.jpg',
      genres: [{ id: 'action', name: 'Action', description: 'Fast-paced and exciting gameplay', icon: '⚔️', color: 'red', tags: ['fast-paced', 'exciting'] }, { id: 'multiplayer', name: 'Multiplayer', description: 'Games that support multiple players', icon: '👥', color: 'blue', tags: ['social', 'competitive'] }],
      subgenres: [],
      platforms: [{ id: 'pc', name: 'PC', code: 'pc' as any, isConnected: false }],
      emotionalTags: [],
      playStatus: 'playing' as const,
      addedAt: new Date(),
      isFavorite: false,
      releaseYear: 2023,
      tags: ['competitive', 'intense', 'team-based'],
      hoursPlayed: 120,
      moods: ['competitive', 'intense']
    },
    {
      id: 'game-3',
      title: 'Civilization VI',
      coverImage: '/covers/civ6.jpg',
      genres: [{ id: 'strategy', name: 'Strategy', description: 'Games that require strategic thinking', icon: '♟️', color: 'purple', tags: ['tactical', 'thoughtful'] }],
      subgenres: [],
      platforms: [{ id: 'pc', name: 'PC', code: 'pc' as any, isConnected: false }],
      emotionalTags: [],
      playStatus: 'playing' as const,
      addedAt: new Date(),
      isFavorite: false,
      releaseYear: 2016,
      tags: ['strategic', 'complex', 'challenging'],
      hoursPlayed: 200,
      moods: ['strategic', 'focused']
    },
    {
      id: 'game-4',
      title: 'The Witcher 3',
      coverImage: '/covers/witcher3.jpg',
      genres: [{ id: 'rpg', name: 'RPG', description: 'Role-playing games with character progression', icon: '🗡️', color: 'blue', tags: ['story-driven', 'character'] }, { id: 'adventure', name: 'Adventure', description: 'Games focused on exploration and discovery', icon: '🗺️', color: 'green', tags: ['exploration', 'discovery'] }],
      subgenres: [],
      platforms: [{ id: 'pc', name: 'PC', code: 'pc' as any, isConnected: false }, { id: 'console', name: 'Console', code: 'console' as any, isConnected: false }],
      emotionalTags: [],
      playStatus: 'playing' as const,
      addedAt: new Date(),
      isFavorite: false,
      releaseYear: 2015,
      tags: ['story-driven', 'immersive', 'exploration'],
      hoursPlayed: 80,
      moods: ['immersive', 'adventurous']
    },
    {
      id: 'game-5',
      title: 'Minecraft',
      coverImage: '/covers/minecraft.jpg',
      genres: [{ id: 'creative', name: 'Creative', description: 'Games that allow creative expression', icon: '🎨', color: 'orange', tags: ['creativity', 'building'] }, { id: 'adventure', name: 'Adventure', description: 'Games focused on exploration and discovery', icon: '🗺️', color: 'green', tags: ['exploration', 'discovery'] }],
      subgenres: [],
      platforms: [{ id: 'pc', name: 'PC', code: 'pc' as any, isConnected: false }, { id: 'console', name: 'Console', code: 'console' as any, isConnected: false }, { id: 'mobile', name: 'Mobile', code: 'mobile' as any, isConnected: false }],
      emotionalTags: [],
      playStatus: 'playing' as const,
      addedAt: new Date(),
      isFavorite: false,
      releaseYear: 2011,
      tags: ['creative', 'building', 'exploration'],
      hoursPlayed: 150,
      moods: ['creative', 'relaxed']
    }
  ]

  const selectMood = useCallback((primaryMood: EnhancedMoodId, secondaryMood?: EnhancedMoodId) => {
    setState(prev => ({ ...prev, primaryMood, secondaryMood, isLoading: true, error: undefined }))
    
    try {
      // Create mood context
      const moodContext: MoodFilterContext = {
        primaryMood,
        secondaryMood,
        intensity: state.intensity,
        userGenreAffinity: {
          'casual': 0.8,
          'strategy': 0.7,
          'rpg': 0.6,
          'action': 0.5
        },
        timeAvailable: 60,
        socialContext: 'any',
        platform: 'pc'
      }

      // Get mood-filtered recommendations
      const moodResults = EnhancedMoodFilter.filterByMood(mockGames, moodContext)
      
      setState(prev => ({
        ...prev,
        recommendations: moodResults.games.map(game => ({
          ...game,
          moodScore: moodResults.scores[game.id],
          reasoning: moodResults.reasoning[game.id],
          moodInfluence: moodResults.moodInfluence[game.id]
        })),
        isLoading: false
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        isLoading: false
      }))
    }
  }, [state.intensity, mockGames])

  const setIntensity = useCallback((intensity: number) => {
    setState(prev => ({ ...prev, intensity }))
    
    // Re-run recommendations if mood is selected
    if (state.primaryMood) {
      selectMood(state.primaryMood, state.secondaryMood)
    }
  }, [state.primaryMood, state.secondaryMood, selectMood])

  const clearMood = useCallback(() => {
    setState({
      intensity: 0.8,
      recommendations: [],
      isLoading: false
    })
  }, [])

  // Get mood info for display
  const getPrimaryMoodInfo = () => {
    return state.primaryMood ? ENHANCED_MOODS.find(m => m.id === state.primaryMood) : undefined
  }

  const getSecondaryMoodInfo = () => {
    return state.secondaryMood ? ENHANCED_MOODS.find(m => m.id === state.secondaryMood) : undefined
  }

  // Test specific mood combinations
  const testPresetCombination = useCallback((preset: string) => {
    const presets = {
      'relaxed-creative': { primary: 'low-energy' as EnhancedMoodId, secondary: 'creative' as EnhancedMoodId },
      'intense-competitive': { primary: 'high-energy' as EnhancedMoodId, secondary: 'competitive' as EnhancedMoodId },
      'strategic-immersive': { primary: 'deep-focus' as EnhancedMoodId, secondary: 'immersive' as EnhancedMoodId },
      'social-energetic': { primary: 'social' as EnhancedMoodId, secondary: 'high-energy' as EnhancedMoodId }
    }
    
    const combination = presets[preset as keyof typeof presets]
    if (combination) {
      selectMood(combination.primary, combination.secondary)
    }
  }, [selectMood])

  return {
    // State
    ...state,
    
    // Actions
    selectMood,
    setIntensity,
    clearMood,
    testPresetCombination,
    
    // Computed
    primaryMoodInfo: getPrimaryMoodInfo(),
    secondaryMoodInfo: getSecondaryMoodInfo(),
    availableMoods: ENHANCED_MOODS,
    totalGames: mockGames.length
  }
}

// Add to window for testing
declare global {
  interface Window {
    testEnhancedMoodSystem: () => void
    moodSystemTest: ReturnType<typeof useTestEnhancedMoodSystem>
  }
}

// Initialize test function
if (typeof window !== 'undefined') {
  window.testEnhancedMoodSystem = () => {
    console.log('🧪 Enhanced Mood System Test Initialized')
    console.log('Available commands:')
    console.log('- moodSystemTest.selectMood("low-energy", "creative")')
    console.log('- moodSystemTest.testPresetCombination("relaxed-creative")')
    console.log('- moodSystemTest.setIntensity(0.9)')
    console.log('- moodSystemTest.clearMood()')
    console.log('- moodSystemTest.primaryMoodInfo')
    console.log('- moodSystemTest.recommendations')
  }
}
