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
import { MASTER_MOODS, getMasterMood } from '../constants/masterMoods'
import { formatMoodWithEmoji } from '../utils/moodDisplay'

// NEW: Import enhanced persona and contextual engines
import { 
  generatePersonaContext, 
  getPersonaContextualMatch,
  detectTimeOfDay,
  type PersonaContext,
  type ContextualMatch,
  type SessionLength,
  type TimeOfDay
} from '../utils/contextualEngine'

// NEW: Import analytics for insights
import { getTuningSettings } from '../utils/contextualEngine'

// NEW: Import library store for game data
import { useLibraryStore } from '../stores/useLibraryStore'

// NEW: Import narrative generation utility
import { generateIdentityNarrative } from '../utils/generateIdentityNarrative'

// NEW: Import shareable card components
import { IdentityCardModal } from '../components/IdentityCardModal'

// NEW: Import identity history components
import { IdentityTimeline } from '../components/IdentityTimeline'
import { 
  saveIdentitySnapshot, 
  getIdentityHistory, 
  createIdentitySnapshot, 
  shouldCreateSnapshot,
  deleteIdentitySnapshot,
  type IdentitySnapshot
} from '../utils/identityHistory'

// NEW: Import milestone components
import { 
  evaluateMilestones, 
  detectNewMilestones,
  getUnlockedMilestones,
  type Milestone,
  type MilestoneType
} from '../utils/identityMilestones'
import { MilestoneNotification, useMilestoneNotifications } from '../components/MilestoneNotification'

// NEW: Import personalization system
import { usePersonalization } from '../hooks/usePersonalization'

// NEW: Import achievement system
import { AchievementSystem } from '../components/AchievementSystem'
import { AchievementNotification } from '../components/AchievementNotification'
import { useAchievements, Achievement } from '../hooks/useAchievements'

// NEW: Import enhanced animations
import { useMicroInteractions } from '../hooks/useMicroInteractions'

export const Identity: React.FC = () => {
  const personaSnapshot = usePersonaSnapshot()
  const currentMood = useCurrentMood()
  const [isLoaded, setIsLoaded] = useState(false)
  const [isArchetypeModalOpen, setIsArchetypeModalOpen] = useState(false)
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false)

  // NEW: Share card modal state
  const [isCardModalOpen, setIsCardModalOpen] = useState(false)

  // NEW: Identity history state
  const [identityHistory, setIdentityHistory] = useState<IdentitySnapshot[]>([])

  // NEW: Milestone notification system
  const milestoneNotifications = useMilestoneNotifications()
  const { 
    isNotificationOpen, 
    showNotifications, 
    closeNotifications 
  } = milestoneNotifications

  // NEW: Milestone state
  const [unlockedMilestones, setUnlockedMilestones] = useState<Milestone[]>([])

  // NEW: Personalization state
  const { customTheme, avatar, setCustomTheme, updateAvatar } = usePersonalization()

  // NEW: Achievement system state
  const { achievements, unlockedAchievements, recentAchievements, checkAchievements } = useAchievements()
  const [isAchievementPanelOpen, setIsAchievementPanelOpen] = useState(false)

  // NEW: Micro-interactions state
  const { triggerInteraction, playHoverEffect, playClickEffect } = useMicroInteractions()

  // NEW: Load identity history and milestones on mount
  useEffect(() => {
    const history = getIdentityHistory()
    setIdentityHistory(history)
    
    const milestones = getUnlockedMilestones()
    setUnlockedMilestones(milestones)
  }, [])

  // NEW: Listen for milestone events
  useEffect(() => {
    const handleMilestoneUpdate = (event: CustomEvent) => {
      const { milestones } = event.detail;
      setUnlockedMilestones(milestones)
    }

    window.addEventListener('milestones-updated', handleMilestoneUpdate as EventListener)
    return () => {
      window.removeEventListener('milestones-updated', handleMilestoneUpdate as EventListener)
    }
  }, [])

  // NEW: Get library data for persona analysis
  const { games } = useLibraryStore()

  // NEW: Generate enhanced persona context
  const personaContext = useMemo(() => {
    if (!games || games.length === 0) return null
    
    try {
      return generatePersonaContext(games)
    } catch (error) {
      console.warn('Failed to generate persona context:', error)
      return null
    }
  }, [games])

  // NEW: Get identity-defining games using enhanced contextual matching
  const identityDefiningGames = useMemo(() => {
    if (!personaContext || !games) return []
    
    try {
      const tuning = getTuningSettings()
      const currentTimeOfDay = detectTimeOfDay()
      
      // Use high persona weight for identity-defining games
      const matches = games.map(game => {
        // Convert Game to ContextualGame format
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
          personaWeight: 0.6 // High weight for identity-defining games
        })
      })
      
      return matches.slice(0, 10) // Top 10 identity-defining games
    } catch (error) {
      console.warn('Failed to get identity-defining games:', error)
      return []
    }
  }, [personaContext, games])

  // NEW: Get analytics insights
  const analyticsInsights = useMemo(() => {
    try {
      const storedStats = localStorage.getItem('analytics_stats')
      return storedStats ? JSON.parse(storedStats) : null
    } catch (error) {
      return null
    }
  }, [])

  // NEW: Generate identity narrative
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

  // NEW: Check if we should create a snapshot (weekly trigger)
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
        
        // Check for new milestones
        const snapshotWithId = { ...snapshot, id: `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }
        const newMilestones = detectNewMilestones(identityHistory, snapshotWithId)
        if (newMilestones.length > 0) {
          showNotifications(newMilestones)
        }
        
        setIdentityHistory(prev => [{ ...snapshot, id: `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }, ...prev])
      }
    }
  }, [personaContext, identityDefiningGames, identityNarrative, identityHistory])

  // NEW: Enhanced animations and interactions
  useEffect(() => {
    // Trigger entrance animations
    const timer = setTimeout(() => setIsLoaded(true), 100)
    
    // Check for new achievements
    if (personaContext && identityDefiningGames) {
      checkAchievements({
        personaContext,
        games: identityDefiningGames,
        analytics: analyticsInsights,
        milestones: unlockedMilestones
      })
    }
    
    return () => clearTimeout(timer)
  }, [personaContext, identityDefiningGames, analyticsInsights, unlockedMilestones])

  // Get archetype theme colors
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

  const getArchetypeSymbol = (archetypeId: string) => {
    const symbols = {
      'Achiever': '🏆',
      'Explorer': '🗺️',
      'Socializer': '👥',
      'Competitor': '⚔️',
      'Strategist': '♟️',
      'Creative': '🎨',
      'Casual': '😌',
      'Specialist': '🎯'
    }
    return symbols[archetypeId as keyof typeof symbols] || '🎮'
  }

  const getArchetypeDetails = (archetypeId: string) => {
    const details = {
      'Achiever': {
        fullDescription: 'You are driven by goals, achievements, and the thrill of completion. Every challenge is an opportunity to prove your worth and climb higher.',
        strengths: ['Goal-oriented mindset', 'High motivation', 'Persistent determination', 'Strategic thinking'],
        weaknesses: ['May over-extend', 'Can be too competitive', 'Sometimes misses the journey', 'Perfectionist tendencies'],
        moodTendencies: ['⚡ Adrenaline', '🧠 Brain Power', '🎯 Focus'],
        recommendedGenres: ['RPG', 'Action', 'Platformer', 'Sports'],
        signatureTraits: ['Completionist', 'Perfectionist', 'Competitive', 'Goal-driven']
      },
      'Explorer': {
        fullDescription: 'You are driven by curiosity and the desire to discover new worlds. Every uncharted territory calls to your adventurous spirit.',
        strengths: ['Curiosity-driven', 'Adaptable', 'Open-minded', 'Detail-oriented'],
        weaknesses: ['Can get distracted', 'May not finish', 'Overly curious', 'Risk-taking'],
        moodTendencies: ['📚 Story', '🌍 Explorer', '🧘 Zen'],
        recommendedGenres: ['Open World', 'Adventure', 'Exploration', 'Survival'],
        signatureTraits: ['Curious', 'Adventurous', 'Detail-oriented', 'Open-minded']
      },
      'Socializer': {
        fullDescription: 'You thrive on connections and shared experiences. Gaming is your way to build communities and forge lasting friendships.',
        strengths: ['Empathetic', 'Team player', 'Communication skills', 'Community builder'],
        weaknesses: ['May avoid solo content', 'Too accommodating', 'Social pressure', 'Distraction-prone'],
        moodTendencies: ['👥 Social', '🧘 Zen', '📚 Story'],
        recommendedGenres: ['MMO', 'Co-op', 'Social', 'Party Games'],
        signatureTraits: ['Empathetic', 'Collaborative', 'Social', 'Community-focused']
      },
      'Competitor': {
        fullDescription: 'You live for the thrill of victory and the challenge of opposition. Every match is a chance to prove your superiority.',
        strengths: ['Competitive drive', 'Quick thinking', 'Strategic mind', 'Performance under pressure'],
        weaknesses: ['Can be ruthless', 'Poor sportsmanship', 'Overly aggressive', 'Burnout risk'],
        moodTendencies: ['⚡ Adrenaline', '🧠 Brain Power', '👻 Scary'],
        recommendedGenres: ['FPS', 'MOBA', 'Fighting', 'Sports'],
        signatureTraits: ['Competitive', 'Strategic', 'Intense', 'Victory-driven']
      },
      'Strategist': {
        fullDescription: 'You see the bigger picture and excel at planning. Every game is a puzzle to be solved with perfect precision.',
        strengths: ['Analytical thinking', 'Planning skills', 'Pattern recognition', 'Patience'],
        weaknesses: ['Analysis paralysis', 'Over-planning', 'Slow adaptation', 'Perfectionism'],
        moodTendencies: ['🧠 Brain Power', '🧘 Zen', '🎨 Creative'],
        recommendedGenres: ['Strategy', 'Turn-based', 'Puzzle', 'Management'],
        signatureTraits: ['Analytical', 'Strategic', 'Methodical', 'Patient']
      },
      'Creative': {
        fullDescription: 'You express yourself through creation and imagination. Every game is a canvas for your artistic vision.',
        strengths: ['Creativity', 'Innovation', 'Expression', 'Imagination'],
        weaknesses: ['Lack of focus', 'Perfectionism', 'Over-ambitious', 'Procrastination'],
        moodTendencies: ['🎨 Creative', '🧘 Zen', '📚 Story'],
        recommendedGenres: ['Sandbox', 'Building', 'Art', 'Simulation'],
        signatureTraits: ['Creative', 'Innovative', 'Expressive', 'Imaginative']
      },
      'Casual': {
        fullDescription: 'You seek balance and enjoyment in gaming. Every session should be relaxing and stress-free.',
        strengths: ['Balanced approach', 'Stress management', 'Consistency', 'Enjoyment-focused'],
        weaknesses: ['Lack of challenge', 'Slow progress', 'Comfort zone', 'Limited growth'],
        moodTendencies: ['🧘 Zen', '📚 Story', '🕹 Nostalgic'],
        recommendedGenres: ['Casual', 'Puzzle', 'Simulation', 'Story'],
        signatureTraits: ['Balanced', 'Relaxed', 'Consistent', 'Enjoyment-focused']
      },
      'Specialist': {
        fullDescription: 'You dedicate yourself to mastering specific genres or games. Excellence is your only acceptable standard.',
        strengths: ['Expertise', 'Dedication', 'Mastery', 'Deep knowledge'],
        weaknesses: ['Narrow focus', 'Resistance to change', 'Perfectionism', 'Burnout risk'],
        moodTendencies: ['🧠 Brain Power', '⚡ Adrenaline', '🎯 Focus'],
        recommendedGenres: ['Specialized', 'Complex', 'Deep', 'Niche'],
        signatureTraits: ['Specialized', 'Dedicated', 'Expert', 'Mastery-focused']
      }
    }
    return details[archetypeId as keyof typeof details] || details.Explorer
  }

  const currentArchetype = personaSnapshot?.traits.archetypeId || 'Explorer'
  const theme = getArchetypeTheme(currentArchetype)

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker relative overflow-hidden ${
      isEditMode ? 'ring-2 ring-gaming-primary/50 ring-offset-2 ring-offset-gray-900' : ''
    }`}>
      {/* Identity Aura Background */}
      <IdentityAura 
        primaryArchetype={currentArchetype}
        currentMood={currentMood?.moodId}
      />
      
      <div className="container mx-auto px-4 py-8 pointer-events-auto relative z-10">
        {/* Enhanced Hero Section with Personalization */}
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
                  <button
                    className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
                  >
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
        </header>

        {/* Identity Overview */}
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Core Profile Section */}
          <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 ${isLoaded ? 'animate-slide-up' : 'opacity-0'} animate-delay-200`}>
            <div className="lg:col-span-2">
              <HybridArchetypeCard theme={theme} />
            </div>
            <div className="space-y-4">
              <TraitCard 
                icon="⚡" 
                label="Intensity" 
                value={personaSnapshot?.traits.intensity || 'Medium'}
                description="Energy and engagement level"
                theme={theme}
              />
              <TraitCard 
                icon="⏱️" 
                label="Pacing" 
                value={personaSnapshot?.traits.pacing || 'Flow'}
                description="Session duration preference"
                theme={theme}
              />
              <TraitCard 
                icon="🎯" 
                label="Challenge" 
                value={personaSnapshot?.traits.riskProfile || 'Balanced'}
                description="Risk tolerance level"
                theme={theme}
              />
            </div>
          </div>

          {/* NEW: Enhanced Identity Summary */}
          {personaContext && (
            <div className={`mb-12 ${isLoaded ? 'animate-slide-up' : 'opacity-0'} animate-delay-400`}>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h2 className="text-3xl font-bold text-white mb-6">Your Gaming Identity</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <h3 className="text-gray-400 text-sm mb-2">Dominant Moods</h3>
                    <div className="flex flex-wrap gap-2">
                      {personaContext.dominantMoods.map(mood => {
                        const masterMoodId = getMasterMood(mood.toLowerCase())
                        return (
                          <span key={mood} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                            {formatMoodWithEmoji(masterMoodId)}
                          </span>
                        )
                      })}
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

          {/* NEW: Your Gaming Story Narrative */}
          <div className={`mb-12 ${isLoaded ? 'animate-slide-up' : 'opacity-0'} animate-delay-450`}>
            <div className="bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-teal-500/20 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-6">Your Gaming Story</h2>
                <div className="max-w-3xl mx-auto">
                  <p className="text-xl text-gray-200 leading-relaxed font-light">
                    {identityNarrative}
                  </p>
                </div>
                
                {/* Narrative embellishments */}
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
                
                {/* NEW: Share Card Button */}
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => {
                      setIsCardModalOpen(true)
                      // Save snapshot when generating card
                      if (personaContext && identityDefiningGames && identityNarrative) {
                        const snapshot = createIdentitySnapshot(
                          personaContext,
                          identityDefiningGames,
                          identityNarrative.split('.').filter(Boolean).slice(0, 2).join('. ') + '.',
                          identityNarrative
                        )
                        saveIdentitySnapshot(snapshot)
                        setIdentityHistory(prev => [{ ...snapshot, id: `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }, ...prev])
                      }
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 flex items-center gap-2"
                  >
                    <span className="text-xl">🎴</span>
                    Generate Shareable Card
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* NEW: Games That Define You */}
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
                        {match.game.moods?.slice(0, 3).map(mood => {
                          const masterMoodId = getMasterMood(mood.toLowerCase())
                          return (
                            <span key={mood} className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                              {formatMoodWithEmoji(masterMoodId)}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* NEW: How You Play */}
          {analyticsInsights && (
            <div className={`mb-12 ${isLoaded ? 'animate-slide-up' : 'opacity-0'} animate-delay-600`}>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h2 className="text-3xl font-bold text-white mb-6">How You Play</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Time-of-Day Engagement */}
                  <div>
                    <h3 className="text-gray-400 text-sm mb-3">Time-of-Day Engagement</h3>
                    <div className="space-y-2">
                      {Object.entries(analyticsInsights.timeOfDayUsage || {}).map(([time, count]) => (
                        <div key={time} className="flex items-center justify-between">
                          <span className="text-gray-300 text-sm capitalize">{time}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-700 rounded-full h-2">
                              <div 
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${Math.max(10, (Number(count) / Math.max(...Object.values(analyticsInsights.timeOfDayUsage || {}).map(Number))) * 100)}%` }}
                              />
                            </div>
                            <span className="text-gray-400 text-xs w-8">{Number(count)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Session Length Distribution */}
                  <div>
                    <h3 className="text-gray-400 text-sm mb-3">Session Length Distribution</h3>
                    <div className="space-y-2">
                      {Object.entries(analyticsInsights.sessionLengthUsage || {}).map(([length, count]) => (
                        <div key={length} className="flex items-center justify-between">
                          <span className="text-gray-300 text-sm capitalize">{length}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-700 rounded-full h-2">
                              <div 
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${Math.max(10, (Number(count) / Math.max(...Object.values(analyticsInsights.sessionLengthUsage || {}).map(Number))) * 100)}%` }}
                              />
                            </div>
                            <span className="text-gray-400 text-xs w-8">{Number(count)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mood Selection History */}
                  <div>
                    <h3 className="text-gray-400 text-sm mb-3">Top Moods</h3>
                    <div className="space-y-2">
                      {Object.entries(analyticsInsights.moodUsage || {})
                        .sort(([,a], [,b]) => Number(b) - Number(a))
                        .slice(0, 5)
                        .map(([mood, count]) => (
                          <div key={mood} className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm">{mood}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-700 rounded-full h-2">
                                <div 
                                  className="h-full bg-purple-500 rounded-full"
                                  style={{ width: `${Math.max(10, (Number(count) / Math.max(...Object.values(analyticsInsights.moodUsage || {}).map(Number))) * 100)}%` }}
                                />
                              </div>
                              <span className="text-gray-400 text-xs w-8">{Number(count)}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NEW: Your Recent Behavior */}
          {personaContext && (
            <div className={`mb-12 ${isLoaded ? 'animate-slide-up' : 'opacity-0'} animate-delay-700`}>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h2 className="text-3xl font-bold text-white mb-6">Your Recent Behavior</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <h3 className="text-gray-400 text-sm mb-2">Average Session</h3>
                    <span className="text-white text-lg font-medium">
                      {Math.round(personaContext.averageSessionLengthMinutes)} min
                    </span>
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-sm mb-2">Night Owl Ratio</h3>
                    <span className="text-white text-lg font-medium">
                      {Math.round(personaContext.lateNightRatio * 100)}%
                    </span>
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-sm mb-2">Completion Rate</h3>
                    <span className="text-white text-lg font-medium">
                      {Math.round(personaContext.completionRate * 100)}%
                    </span>
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-sm mb-2">Social Gaming</h3>
                    <span className="text-white text-lg font-medium">
                      {Math.round(personaContext.multiplayerRatio * 100)}%
                    </span>
                  </div>
                </div>
                
                {/* Mood Affinity Changes */}
                <div className="mt-6">
                  <h3 className="text-gray-400 text-sm mb-3">Mood Affinity</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(personaContext.moodAffinity)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 8)
                      .map(([mood, affinity]) => (
                        <span key={mood} className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                          {mood}: {(affinity * 100).toFixed(0)}%
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Identity Evolution Timeline */}
          <div className={`mb-12 ${isLoaded ? 'animate-slide-up' : 'opacity-0'} animate-delay-800`}>
            <IdentityTimeline
              snapshots={identityHistory}
              onRegenerateCard={(snapshot) => {
                // Create temporary persona context and games from snapshot
                const tempPersonaContext = {
                  dominantMoods: snapshot.dominantMoods,
                  preferredSessionLength: snapshot.preferredSessionLength as any,
                  preferredTimesOfDay: snapshot.preferredTimesOfDay as any,
                  recentPlayPatterns: snapshot.recentPlayPatterns,
                  moodAffinity: {},
                  averageSessionLengthMinutes: snapshot.averageSessionLengthMinutes,
                  lateNightRatio: 0,
                  completionRate: snapshot.completionRate,
                  multiplayerRatio: snapshot.multiplayerRatio
                }

                const tempGames = snapshot.topIdentityGames.map(game => ({
                  id: game.id,
                  title: game.title,
                  moods: [],
                  genres: [],
                  hoursPlayed: 0,
                  sessionLength: snapshot.preferredSessionLength as any,
                  recommendedTimes: snapshot.preferredTimesOfDay as any,
                  score: game.score
                }))

                // Open card modal with snapshot data
                setIsCardModalOpen(true)
              }}
              onDelete={(snapshotId) => {
                deleteIdentitySnapshot(snapshotId)
                setIdentityHistory(prev => prev.filter(s => s.id !== snapshotId))
              }}
            />
          </div>

          {/* Detailed Insights Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={`${isLoaded ? 'animate-slide-up' : 'opacity-0'} animate-delay-300`}>
              <MoodHistoryCard />
            </div>
            <div className={`${isLoaded ? 'animate-slide-up' : 'opacity-0'} animate-delay-400`}>
              <GenreBreakdownCard />
            </div>
            <div className="md:col-span-2">
               <InsightCards />
            </div>
          </div>
        </div>
      </div>

      {/* Archetype Modal */}
      <ArchetypeModal
        isOpen={isArchetypeModalOpen}
        onClose={() => setIsArchetypeModalOpen(false)}
        archetype={{
          id: currentArchetype,
          name: currentArchetype,
          symbol: getArchetypeSymbol(currentArchetype),
          description: getArchetypeDetails(currentArchetype).fullDescription,
          fullDescription: getArchetypeDetails(currentArchetype).fullDescription,
          strengths: getArchetypeDetails(currentArchetype).strengths,
          weaknesses: getArchetypeDetails(currentArchetype).weaknesses,
          moodTendencies: getArchetypeDetails(currentArchetype).moodTendencies,
          recommendedGenres: getArchetypeDetails(currentArchetype).recommendedGenres,
          signatureTraits: getArchetypeDetails(currentArchetype).signatureTraits,
          theme
        }}
      />
      {/* Edit Mode Panel */}
      <EditModePanel
        pageId="identity"
        isOpen={isEditMode}
        onClose={() => setIsEditMode(false)}
      />

      {/* NEW: Shareable Card Modal */}
      <IdentityCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        personaContext={personaContext || undefined}
        identityNarrative={identityNarrative}
        identityDefiningGames={identityDefiningGames}
      />

      {/* NEW: Milestone Notification */}
      <MilestoneNotification
        milestones={milestoneNotifications.notifications}
        isOpen={milestoneNotifications.isNotificationOpen}
        onClose={milestoneNotifications.closeNotifications}
      />

      {/* NEW: Achievement System */}
      <AchievementSystem
        achievements={achievements}
        unlockedAchievements={unlockedAchievements}
        isOpen={isAchievementPanelOpen}
        onClose={() => setIsAchievementPanelOpen(false)}
      />

      {/* NEW: Achievement Notification */}
      <AchievementNotification
        achievements={recentAchievements}
        isOpen={milestoneNotifications.isNotificationOpen && recentAchievements.length > 0}
        onClose={milestoneNotifications.closeNotifications}
      />
    </div>
  )
}

// Add custom animations
const style = document.createElement('style')
style.textContent = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fade-in {
    animation: fade-in 0.8s ease-out forwards;
  }
  
  .animate-slide-up {
    animation: slide-up 0.6s ease-out forwards;
    opacity: 0;
  }
`
document.head.appendChild(style)
