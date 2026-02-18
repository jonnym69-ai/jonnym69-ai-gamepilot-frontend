import React, { useEffect, useState, useMemo } from 'react'
import { PlaystyleCard } from '../features/identity/components/PlaystyleCard'
import { MoodHistoryCard } from '../features/identity/components/MoodHistoryCard'
import { GenreBreakdownCard } from '../features/identity/components/GenreBreakdownCard'
import { InsightCards } from '../features/identity/components/InsightCard'
import { TraitCard } from '../features/identity/components/TraitCard'
import { ArchetypeModal } from '../features/identity/components/ArchetypeModal'
import { IdentityAura } from '../features/identity/components/IdentityAura'
import { HybridArchetypeCard } from '../features/identity/components/HybridArchetypeCard'
import { IdentityEvolutionCard } from '../features/identity/components/IdentityEvolutionCard'
import { usePersonaSnapshot } from '../hooks/persona/usePersonaSnapshot'
import { useCurrentMood } from '../hooks/useCurrentMood'
import { EditModeButton } from '../features/customisation/EditModeButton'
import { EditModePanel } from '../features/customisation/EditModePanel'

// Enhanced imports
import { 
  generatePersonaContext, 
  getPersonaContextualMatch,
  detectTimeOfDay,
  type PersonaContext,
  type ContextualMatch,
  type SessionLength,
  type TimeOfDay
} from '../utils/contextualEngine'

import { getTuningSettings } from '../utils/contextualEngine'
import { useLibraryStore } from '../stores/useLibraryStore'
import { generateIdentityNarrative } from '../utils/generateIdentityNarrative'
import { IdentityCardModal } from '../components/IdentityCardModal'
import { IdentityTimeline } from '../components/IdentityTimeline'
import { 
  saveIdentitySnapshot, 
  getIdentityHistory, 
  createIdentitySnapshot, 
  shouldCreateSnapshot,
  deleteIdentitySnapshot,
  type IdentitySnapshot
} from '../utils/identityHistory'
import { 
  evaluateMilestones, 
  detectNewMilestones,
  getUnlockedMilestones,
  type Milestone,
  type MilestoneType
} from '../utils/identityMilestones'
import { MilestoneNotification, useMilestoneNotifications } from '../components/MilestoneNotification'

// Simple achievement system
interface Achievement {
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

const useSimpleAchievements = () => {
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
    }
  ])

  const unlockedAchievements = achievements.filter(a => a.unlockedAt)

  return {
    achievements,
    unlockedAchievements,
    recentAchievements: [],
    checkAchievements: () => {}
  }
}

// Simple personalization
interface Avatar {
  emoji: string
  name: string
  level: number
  experience: number
}

const useSimplePersonalization = () => {
  const [avatar, setAvatar] = useState<Avatar>({
    emoji: '🎮',
    name: 'GamePilot',
    level: 1,
    experience: 0
  })

  return {
    customTheme: { primary: 'purple' },
    avatar,
    setCustomTheme: () => {},
    updateAvatar: setAvatar
  }
}

export const IdentityEnhanced: React.FC = () => {
  const personaSnapshot = usePersonaSnapshot()
  const currentMood = useCurrentMood()
  const [isLoaded, setIsLoaded] = useState(false)
  const [isArchetypeModalOpen, setIsArchetypeModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isCardModalOpen, setIsCardModalOpen] = useState(false)
  const [identityHistory, setIdentityHistory] = useState<IdentitySnapshot[]>([])
  const [isAchievementPanelOpen, setIsAchievementPanelOpen] = useState(false)

  // Enhanced systems
  const milestoneNotifications = useMilestoneNotifications()
  const { customTheme, avatar, updateAvatar } = useSimplePersonalization()
  const { achievements, unlockedAchievements } = useSimpleAchievements()
  const { games } = useLibraryStore()

  // Enhanced persona context
  const personaContext = useMemo(() => {
    if (!games || games.length === 0) return null
    
    try {
      return generatePersonaContext(games)
    } catch (error) {
      console.warn('Failed to generate persona context:', error)
      return null
    }
  }, [games])

  // Identity-defining games
  const identityDefiningGames = useMemo(() => {
    if (!personaContext || !games) return []
    
    try {
      const tuning = getTuningSettings()
      const currentTimeOfDay = detectTimeOfDay()
      
      const matches = games.map(game => {
        const contextualGame = {
          ...game,
          genres: game.genres?.map(g => typeof g === 'string' ? g : g.name) || [],
          moods: game.moods || [],
          sessionLength: (game as any).sessionLength || undefined,
          recommendedTimes: (game as any).recommendedTimes || undefined,
          hoursPlayed: game.hoursPlayed || 0,
          lastPlayed: game.lastPlayed || undefined
        }
        
        return getPersonaContextualMatch(contextualGame, {
          selectedMoods: personaContext.dominantMoods,
          selectedSessionLength: personaContext.preferredSessionLength,
          timeOfDay: currentTimeOfDay,
          personaContext,
          personaWeight: 0.6
        })
      })
      
      return matches.slice(0, 10)
    } catch (error) {
      console.warn('Failed to get identity-defining games:', error)
      return []
    }
  }, [personaContext, games])

  // Analytics insights
  const analyticsInsights = useMemo(() => {
    try {
      const storedStats = localStorage.getItem('analytics_stats')
      return storedStats ? JSON.parse(storedStats) : null
    } catch (error) {
      return null
    }
  }, [])

  // Identity narrative
  const identityNarrative = useMemo(() => {
    try {
      return generateIdentityNarrative({
        personaContext: personaContext || undefined,
        analyticsInsights: analyticsInsights || undefined
      });
    } catch (error) {
      console.warn('Failed to generate identity narrative:', error);
      return "Your gaming journey is uniquely yours, shaped by your choices and experiences.";
    }
  }, [personaContext, analyticsInsights])

  // Load data and check achievements
  useEffect(() => {
    const history = getIdentityHistory()
    setIdentityHistory(history)
    
    const milestones = getUnlockedMilestones()
    
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Check for snapshots
  useEffect(() => {
    if (personaContext && identityDefiningGames && identityNarrative) {
      const lastSnapshot = identityHistory[0]
      if (shouldCreateSnapshot(lastSnapshot?.timestamp)) {
        const snapshot = createIdentitySnapshot(
          personaContext,
          identityDefiningGames,
          identityNarrative.split('.').filter(Boolean).slice(0, 2).join('. ') + '.',
          identityNarrative
        )
        saveIdentitySnapshot(snapshot)
        
        const snapshotWithId = { ...snapshot, id: `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }
        const newMilestones = detectNewMilestones(identityHistory, snapshotWithId)
        if (newMilestones.length > 0) {
          milestoneNotifications.showNotifications(newMilestones)
        }
        
        setIdentityHistory(prev => [{ ...snapshot, id: `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }, ...prev])
      }
    }
  }, [personaContext, identityDefiningGames, identityNarrative, identityHistory])

  // Get archetype theme
  const getArchetypeTheme = (archetypeId: string) => {
    const themes = {
      'Achiever': { primary: 'from-yellow-500 to-amber-600', accent: 'text-yellow-400', bg: 'bg-yellow-500/10' },
      'Explorer': { primary: 'from-purple-500 to-indigo-600', accent: 'text-purple-400', bg: 'bg-purple-500/10' },
      'Socializer': { primary: 'from-blue-500 to-cyan-600', accent: 'text-blue-400', bg: 'bg-blue-500/10' },
      'Competitor': { primary: 'from-red-500 to-orange-600', accent: 'text-red-400', bg: 'bg-red-500/10' },
      'Strategist': { primary: 'from-emerald-500 to-teal-600', accent: 'text-emerald-400', bg: 'bg-emerald-500/10' },
      'Creative': { primary: 'from-pink-500 to-rose-600', accent: 'text-pink-400', bg: 'bg-pink-500/10' },
      'Casual': { primary: 'from-green-500 to-lime-600', accent: 'text-green-400', bg: 'bg-green-500/10' },
      'Specialist': { primary: 'from-indigo-500 to-purple-600', accent: 'text-indigo-400', bg: 'bg-indigo-500/10' }
    }
    return themes[archetypeId as keyof typeof themes] || themes.Explorer
  }

  const currentArchetype = personaSnapshot?.traits.archetypeId || 'Explorer'
  const theme = getArchetypeTheme(currentArchetype)

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker relative overflow-hidden ${
      isEditMode ? 'ring-2 ring-gaming-primary/50 ring-offset-2 ring-offset-gray-900' : ''
    }`}>
      <IdentityAura 
        primaryArchetype={currentArchetype}
        currentMood={currentMood?.moodId}
      />
      
      <div className="container mx-auto px-4 py-8 pointer-events-auto relative z-10">
        {/* Enhanced Hero Section */}
        <header className={`mb-16 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
          <div className="flex items-center justify-between mb-8">
            {/* Avatar and Personalization */}
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg transform transition-all group-hover:scale-110 group-hover:rotate-3">
                  {avatar?.emoji || '🎮'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                  <span className="text-xs">✨</span>
                </div>
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  {avatar?.name || 'GamePilot'}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">Level {avatar?.level || 1}</span>
                  <span className="text-gray-600">•</span>
                  <button className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
                    🎨 Customize Theme
                  </button>
                </div>
              </div>
            </div>

            {/* Achievement and Stats Summary */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{unlockedAchievements.length}</div>
                <div className="text-xs text-gray-400">Achievements</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{identityHistory.length}</div>
                <div className="text-xs text-gray-400">Snapshots</div>
              </div>
              <button
                onClick={() => setIsAchievementPanelOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 flex items-center gap-2"
              >
                <span>🏆</span>
                View Achievements
              </button>
            </div>
          </div>

          {/* Archetype Display */}
          <div className="text-center mb-8">
            <div 
              className={`inline-block ${theme.bg} px-8 py-4 rounded-2xl border border-white/10 backdrop-blur-sm mb-6 cursor-pointer hover:scale-105 transition-transform`}
              onClick={() => setIsArchetypeModalOpen(true)}
            >
              <h1 className={`text-6xl md:text-7xl font-black ${theme.accent} mb-2 tracking-tight`}>
                {currentArchetype.toUpperCase()}
              </h1>
              <div className="text-6xl mb-4">
                {currentArchetype === 'Achiever' ? '🏆' :
                 currentArchetype === 'Explorer' ? '🗺️' :
                 currentArchetype === 'Socializer' ? '👥' :
                 currentArchetype === 'Competitor' ? '⚔️' :
                 currentArchetype === 'Strategist' ? '♟️' :
                 currentArchetype === 'Creative' ? '🎨' :
                 currentArchetype === 'Casual' ? '😌' : '🎯'}
              </div>
              <div className="text-sm text-gray-400">
                Click for detailed analysis
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hybrid Archetype Card */}
          <div className={`mb-12 ${isLoaded ? 'animate-slide-up' : 'opacity-0'} animate-delay-200`}>
            <HybridArchetypeCard theme={theme} />
          </div>

          {/* Enhanced Identity Summary */}
          {personaContext && (
            <div className={`mb-12 ${isLoaded ? 'animate-slide-up' : 'opacity-0'} animate-delay-400`}>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h2 className="text-3xl font-bold text-white mb-6">Your Gaming Identity</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <h3 className="text-gray-400 text-sm mb-2">Dominant Moods</h3>
                    <div className="flex flex-wrap gap-2">
                      {personaContext.dominantMoods.map(mood => (
                        <span key={mood} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                          {mood}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-sm mb-2">Preferred Sessions</h3>
                    <span className="text-white text-lg font-medium capitalize">
                      {personaContext.preferredSessionLength}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-sm mb-2">Peak Times</h3>
                    <div className="flex flex-wrap gap-2">
                      {personaContext.preferredTimesOfDay.map(time => (
                        <span key={time} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm capitalize">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-sm mb-2">Play Patterns</h3>
                    <div className="flex flex-wrap gap-2">
                      {personaContext.recentPlayPatterns.slice(0, 2).map(pattern => (
                        <span key={pattern} className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm capitalize">
                          {pattern}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Your Gaming Story Narrative */}
          <div className={`mb-12 ${isLoaded ? 'animate-slide-up' : 'opacity-0'} animate-delay-450`}>
            <div className="bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-teal-500/20 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-6">Your Gaming Story</h2>
                <div className="max-w-3xl mx-auto">
                  <p className="text-xl text-gray-200 leading-relaxed font-light">
                    {identityNarrative}
                  </p>
                </div>
                
                <div className="mt-8 flex justify-center gap-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <span className="text-2xl">🎭</span>
                    <span>Personalized Narrative</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <span className="text-2xl">📊</span>
                    <span>Data-Driven Insights</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <span className="text-2xl">✨</span>
                    <span>Unique Gaming Identity</span>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => setIsCardModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 flex items-center gap-2"
                  >
                    <span className="text-xl">🎴</span>
                    Generate Shareable Card
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Games That Define You */}
          {identityDefiningGames.length > 0 && (
            <div className={`mb-12 ${isLoaded ? 'animate-slide-up' : 'opacity-0'} animate-delay-500`}>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h2 className="text-3xl font-bold text-white mb-6">Games That Define You</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {identityDefiningGames.slice(0, 9).map((match, index) => (
                    <div key={match.game.id} className="bg-black/20 rounded-lg p-4 border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-white font-medium">{match.game.title}</h3>
                        <span className="text-green-400 text-sm font-mono">
                          {match.score.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {match.game.moods?.slice(0, 3).map(mood => (
                          <span key={mood} className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                            {mood}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Identity Evolution Timeline */}
          <div className={`mb-12 ${isLoaded ? 'animate-slide-up' : 'opacity-0'} animate-delay-800`}>
            <IdentityTimeline
              snapshots={identityHistory}
              onRegenerateCard={() => setIsCardModalOpen(true)}
              onDelete={(snapshotId) => {
                deleteIdentitySnapshot(snapshotId)
                setIdentityHistory(prev => prev.filter(s => s.id !== snapshotId))
              }}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <ArchetypeModal
        isOpen={isArchetypeModalOpen}
        onClose={() => setIsArchetypeModalOpen(false)}
        archetype={{
          id: currentArchetype,
          name: currentArchetype,
          symbol: currentArchetype === 'Achiever' ? '🏆' :
                 currentArchetype === 'Explorer' ? '🗺️' :
                 currentArchetype === 'Socializer' ? '👥' :
                 currentArchetype === 'Competitor' ? '⚔️' :
                 currentArchetype === 'Strategist' ? '♟️' :
                 currentArchetype === 'Creative' ? '🎨' :
                 currentArchetype === 'Casual' ? '😌' : '🎯',
          description: `Your ${currentArchetype} gaming personality`,
          fullDescription: `You are a ${currentArchetype} gamer...`,
          strengths: [],
          weaknesses: [],
          moodTendencies: [],
          recommendedGenres: [],
          signatureTraits: [],
          theme
        }}
      />

      <IdentityCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        personaContext={personaContext || undefined}
        identityNarrative={identityNarrative}
        identityDefiningGames={identityDefiningGames}
      />

      <EditModeButton 
        onClick={() => setIsEditMode(!isEditMode)} 
        isActive={isEditMode} 
      />

      <EditModePanel
        pageId="identity"
        isOpen={isEditMode}
        onClose={() => setIsEditMode(false)}
      />

      <MilestoneNotification
        milestones={milestoneNotifications.notifications}
        isOpen={milestoneNotifications.isNotificationOpen}
        onClose={milestoneNotifications.closeNotifications}
      />
    </div>
  )
}
