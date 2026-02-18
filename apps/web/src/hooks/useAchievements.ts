import { useState, useEffect } from 'react'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt?: Date
  progress: number
  maxProgress: number
  category: 'gaming' | 'social' | 'exploration' | 'mastery'
}

interface AchievementContext {
  personaContext?: any
  games?: any[]
  analytics?: any
  milestones?: any[]
}

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first_snapshot',
      title: 'Identity Found',
      description: 'Create your first identity snapshot',
      icon: '📸',
      rarity: 'common',
      progress: 0,
      maxProgress: 1,
      category: 'gaming'
    },
    {
      id: 'explorer_10',
      title: 'Curious Explorer',
      description: 'Play 10 different games',
      icon: '🗺️',
      rarity: 'rare',
      progress: 0,
      maxProgress: 10,
      category: 'exploration'
    },
    {
      id: 'night_owl',
      title: 'Night Owl',
      description: 'Play 50% of sessions after 10 PM',
      icon: '🦉',
      rarity: 'epic',
      progress: 0,
      maxProgress: 50,
      category: 'gaming'
    },
    {
      id: 'mood_master',
      title: 'Mood Connoisseur',
      description: 'Try all 8 mood states',
      icon: '🎭',
      rarity: 'legendary',
      progress: 0,
      maxProgress: 8,
      category: 'mastery'
    }
  ])

  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    const savedAchievements = localStorage.getItem('achievements')
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements))
    }
  }, [])

  const checkAchievements = (context: AchievementContext) => {
    const updatedAchievements = achievements.map(achievement => {
      let newProgress = achievement.progress

      switch (achievement.id) {
        case 'first_snapshot':
          if (context.milestones && context.milestones.length > 0) {
            newProgress = Math.min(1, achievement.progress + 1)
          }
          break
        case 'explorer_10':
          if (context.games && context.games.length >= 10) {
            newProgress = Math.min(10, context.games.length)
          }
          break
        case 'night_owl':
          if (context.analytics?.nightOwlRatio) {
            newProgress = Math.min(50, Math.floor(context.analytics.nightOwlRatio * 100))
          }
          break
        case 'mood_master':
          if (context.personaContext?.dominantMoods) {
            newProgress = Math.min(8, context.personaContext.dominantMoods.length)
          }
          break
      }

      const isUnlocked = newProgress >= achievement.maxProgress && !achievement.unlockedAt
      
      return {
        ...achievement,
        progress: newProgress,
        unlockedAt: isUnlocked ? new Date() : achievement.unlockedAt
      }
    })

    const newUnlocks = updatedAchievements.filter(
      (a, index) => a.unlockedAt && !achievements[index].unlockedAt
    )

    if (newUnlocks.length > 0) {
      setRecentAchievements(newUnlocks)
      setTimeout(() => setRecentAchievements([]), 5000)
    }

    setAchievements(updatedAchievements)
    localStorage.setItem('achievements', JSON.stringify(updatedAchievements))
  }

  const unlockedAchievements = achievements.filter(a => a.unlockedAt)

  return {
    achievements,
    unlockedAchievements,
    recentAchievements,
    checkAchievements
  }
}
