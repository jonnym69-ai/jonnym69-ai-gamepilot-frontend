import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLibraryStore } from '../../../stores/useLibraryStore'
import { emulatorService } from '../../../services/emulatorService'
import { emulatorLauncher } from '../../../services/emulatorLauncher'
import { useToast } from '../../../components/ui/ToastProvider'
import type { Game } from '@gamepilot/types'
import { MOODS, type MoodId } from '@gamepilot/static-data'
import { getMoodOptions } from '../../../utils/libraryAnalyzer'
import { MASTER_MOODS, getMasterMood } from '../../../constants/masterMoods'
import { formatMoodWithEmoji } from '../../../utils/moodDisplay'
import { GameTrailer } from '../../../components/library/GameTrailer'
import { detectGameTrailer } from '../../../services/youtubeService'
import './GameDetailsLayout.css'

// Import persona components
import { PersonaSummaryBar } from '../../../components/persona'
import { useGamePersona } from '../../../hooks/persona'

interface GameDetailsLayoutProps {
  game: Game
}

export const GameDetailsLayout: React.FC<GameDetailsLayoutProps> = ({ game }) => {
  const navigate = useNavigate()
  const { games, actions } = useLibraryStore()
  const { showSuccess, showError, showWarning, showInfo } = useToast()
  const [isDetectingTrailer, setIsDetectingTrailer] = useState(false)

  // Generate better header image URL from Steam app ID
  const getHeaderImageUrl = (game: Game) => {
    if (game.coverImage) {
      // Convert library image to header image
      const appId = game.appId || game.id?.split('_')[1]
      if (appId) {
        return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`
      }
    }
    return game.coverImage
  }

  // Get persona for this specific game
  const persona = useGamePersona(game.id)

  // Calculate persona compatibility score
  const getPersonaCompatibility = (game: Game, persona: any) => {
    if (!persona) return null

    const gameMoods = game.moods || []
    const personaTraits = persona.traits || {}

    // Simple compatibility calculation based on mood overlap
    let compatibilityScore = 50 // Base score
    let matchingTraits = []

    // Check mood alignment
    gameMoods.forEach(mood => {
      if (personaTraits.preferredMoods?.includes(mood.toLowerCase())) {
        compatibilityScore += 15
        matchingTraits.push(`Mood: ${mood}`)
      }
    })

    // Check playtime alignment
    const hoursPlayed = game.hoursPlayed || 0
    if (personaTraits.avgSessionLength) {
      const expectedLength = personaTraits.avgSessionLength
      if (Math.abs(hoursPlayed - expectedLength) < 5) {
        compatibilityScore += 10
        matchingTraits.push('Session Length')
      }
    }

    // Cap at 100
    compatibilityScore = Math.min(100, compatibilityScore)

    return {
      score: compatibilityScore,
      level: compatibilityScore >= 80 ? 'Perfect Match' :
             compatibilityScore >= 60 ? 'Great Fit' :
             compatibilityScore >= 40 ? 'Decent Match' : 'Learning Experience',
      traits: matchingTraits.slice(0, 3)
    }
  }

  const personaCompatibility = getPersonaCompatibility(game, persona)

  // Calculate gaming personality insights
  const getGamingPersonalityInsights = (game: Game, persona: any) => {
    const insights = []
    const hoursPlayed = game.hoursPlayed || 0
    const sessions = game.localSessionCount || 0

    // Play style analysis
    if (hoursPlayed > 50) {
      insights.push({
        icon: '🏆',
        title: 'Dedicated Player',
        description: 'You\'ve invested significant time in this game, showing commitment to deep experiences.'
      })
    } else if (hoursPlayed > 20) {
      insights.push({
        icon: '🎯',
        title: 'Focused Gamer',
        description: 'You prefer quality gaming sessions over casual play.'
      })
    } else {
      insights.push({
        icon: '⚡',
        title: 'Casual Explorer',
        description: 'You enjoy trying new games and discovering different experiences.'
      })
    }

    // Session pattern analysis
    if (sessions > 0 && hoursPlayed > 0) {
      const avgSessionLength = hoursPlayed / sessions
      if (avgSessionLength > 3) {
        insights.push({
          icon: '🕐',
          title: 'Marathon Gamer',
          description: 'Your sessions are typically long and immersive.'
        })
      } else if (avgSessionLength < 1) {
        insights.push({
          icon: '⚡',
          title: 'Quick Sessions',
          description: 'You prefer shorter, focused gaming bursts.'
        })
      }
    }

    // Mood alignment insights
    const gameMoods = game.moods || []
    if (gameMoods.some(mood => ['competitive', 'intense', 'action-packed'].includes(mood.toLowerCase()))) {
      insights.push({
        icon: '🔥',
        title: 'Adrenaline Seeker',
        description: 'You\'re drawn to high-energy, competitive gaming experiences.'
      })
    }

    if (gameMoods.some(mood => ['creative', 'sandbox', 'building'].includes(mood.toLowerCase()))) {
      insights.push({
        icon: '🎨',
        title: 'Creative Builder',
        description: 'You enjoy games that allow self-expression and world-building.'
      })
    }

    return insights.slice(0, 3) // Limit to 3 insights
  }

  const personalityInsights = getGamingPersonalityInsights(game, persona)

  // Calculate achievement progress (mock data for now)
  const getAchievementProgress = (game: Game) => {
    // Mock achievement data - in real implementation, this would come from Steam API
    const totalAchievements = Math.floor(Math.random() * 50) + 10
    const unlockedAchievements = Math.floor(totalAchievements * (Math.random() * 0.8))
    const completionRate = Math.round((unlockedAchievements / totalAchievements) * 100)

    // Mock recent achievements
    const recentAchievements = [
      { name: 'First Steps', description: 'Complete the tutorial', unlocked: true, rarity: 'Common' },
      { name: 'Explorer', description: 'Discover 10 locations', unlocked: true, rarity: 'Uncommon' },
      { name: 'Master Player', description: 'Reach max level', unlocked: completionRate > 50, rarity: 'Rare' },
      { name: 'Legend', description: 'Complete all challenges', unlocked: completionRate > 80, rarity: 'Epic' }
    ].filter(achievement => achievement.unlocked)

    return {
      total: totalAchievements,
      unlocked: unlockedAchievements,
      completionRate,
      recent: recentAchievements.slice(-3)
    }
  }

  const achievementProgress = getAchievementProgress(game)

  // Calculate personal gaming records
  const getGamingRecords = (game: Game) => {
    const hoursPlayed = game.hoursPlayed || 0
    const sessions = game.localSessionCount || 0

    if (hoursPlayed === 0 || sessions === 0) {
      return null
    }

    // Mock records - in real implementation, these would be calculated from session data
    const avgSessionLength = hoursPlayed / sessions
    const estimatedLongestSession = Math.max(avgSessionLength * 1.5, avgSessionLength + 2)
    const estimatedBestStreak = Math.min(Math.floor(sessions * 0.3), 7)

    const records = [
      {
        icon: '⏱️',
        title: 'Longest Session',
        value: `${Math.round(estimatedLongestSession * 10) / 10}h`,
        description: 'Your longest continuous play session'
      },
      {
        icon: '🔥',
        title: 'Best Streak',
        value: `${estimatedBestStreak} days`,
        description: 'Most consecutive days played'
      },
      {
        icon: '📊',
        title: 'Average Session',
        value: `${Math.round(avgSessionLength * 10) / 10}h`,
        description: 'Typical play session length'
      },
      {
        icon: '🎯',
        title: 'Total Sessions',
        value: sessions.toString(),
        description: 'Number of times you\'ve played'
      }
    ]

    return records
  }

  const gamingRecords = getGamingRecords(game)

  // Calculate mood-based session analysis
  const getMoodSessionAnalysis = (game: Game, persona: any) => {
    const sessions = game.localSessionCount || 0
    const hoursPlayed = game.hoursPlayed || 0

    if (sessions === 0) return null

    // Mock session data - in real implementation, this would come from session tracking
    const avgSessionLength = hoursPlayed / sessions
    const sessionsPerWeek = Math.min(sessions / 4, 7) // Estimate over 4 weeks

    const moodPatterns = []

    // Analyze when they play based on game type
    const gameMoods = game.moods || []

    if (gameMoods.some(mood => ['relaxing', 'chill', 'creative'].includes(mood.toLowerCase()))) {
      moodPatterns.push({
        mood: 'Relaxed',
        trigger: 'Unwinding after work',
        time: 'Evening sessions',
        frequency: 'Regular evening play',
        icon: '😌'
      })
    }

    if (gameMoods.some(mood => ['competitive', 'intense', 'action-packed'].includes(mood.toLowerCase()))) {
      moodPatterns.push({
        mood: 'Energetic',
        trigger: 'High-energy moments',
        time: 'Weekend afternoons',
        frequency: 'Intensive weekend sessions',
        icon: '⚡'
      })
    }

    if (gameMoods.some(mood => ['story-rich', 'atmospheric', 'nostalgic'].includes(mood.toLowerCase()))) {
      moodPatterns.push({
        mood: 'Reflective',
        trigger: 'Contemplative moods',
        time: 'Quiet weekend evenings',
        frequency: 'Longer, immersive sessions',
        icon: '🤔'
      })
    }

    if (gameMoods.some(mood => ['social', 'multiplayer', 'party'].includes(mood.toLowerCase()))) {
      moodPatterns.push({
        mood: 'Social',
        trigger: 'When friends are online',
        time: 'Evenings and weekends',
        frequency: 'Group gaming sessions',
        icon: '👥'
      })
    }

    // Default pattern if no specific moods
    if (moodPatterns.length === 0) {
      moodPatterns.push({
        mood: 'Exploratory',
        trigger: 'Curiosity and discovery',
        time: 'Flexible timing',
        frequency: 'Casual exploration sessions',
        icon: '🔍'
      })
    }

    return {
      patterns: moodPatterns.slice(0, 2), // Limit to 2 patterns
      sessionStats: {
        totalSessions: sessions,
        avgLength: avgSessionLength,
        weeklyFrequency: sessionsPerWeek,
        preferredTime: moodPatterns[0]?.time || 'Flexible'
      }
    }
  }

  const moodAnalysis = getMoodSessionAnalysis(game, persona)

  const headerImageUrl = getHeaderImageUrl(game)

  const handlePlayNow = async () => {
    // Show loading toast
    showInfo('Launching Game: Starting ' + game.title + '...', {
      autoClose: 2000
    })

    const platform = game.platforms?.[0]?.code

    // Check if this is an emulator game
    if (platform && emulatorService.isEmulatorPlatform(platform)) {
      try {
        const result = await emulatorLauncher.launchGame(game, { fullscreen: true })
        if (result.success) {
          showSuccess('Game Launched! ' + game.title + ' is now running', {
            autoClose: 3000
          })
          // Update game status to playing
          actions.updateGameStatus(game.id, 'playing')
        } else {
          showError('Launch Failed: ' + (result.error || 'Failed to launch emulator game'), {
            autoClose: 5000
          })
        }
      } catch (error) {
        showError('Launch Error: An error occurred while launching the game', {
          autoClose: 5000
        })
      }
    } else {
      // Steam/other platform launch logic - use direct Steam URL as fallback
      if (game.appId) {
        console.log('🎮 Launching Steam game with appId:', game.appId)

        // Direct Steam URL launch
        const steamUrl = `steam://rungameid/${game.appId}`
        console.log('🚀 Direct Steam URL:', steamUrl)

        try {
          window.location.href = steamUrl

          // Check if launch was successful (simple heuristic)
          setTimeout(() => {
            const isStillOnPage = document.visibilityState === 'visible'
            if (isStillOnPage) {
              showWarning('Launch Failed: Steam may not be installed or running. Please check Steam is available.', {
                autoClose: 5000
              })
            } else {
              showSuccess('Steam Launch Initiated: Opening ' + game.title + ' via Steam...', {
                autoClose: 3000
              })
              // Update game status to playing
              actions.updateGameStatus(game.id, 'playing')
            }
          }, 3000)
        } catch (error) {
          console.error('Failed to launch game:', error)
          showError('Launch Error: Could not execute launch command', {
            autoClose: 5000
          })
        }
      } else {
        console.warn('No appId found for game:', game.title)
        showWarning('Launch Not Available: This game cannot be launched automatically. App ID not found.', {
          autoClose: 4000
        })
      }
    }
  }

  const handleMarkCompleted = () => {
    actions.updateGameStatus(game.id, 'completed')
    showSuccess('Game Completed: ' + game.title + ' marked as completed', {
      autoClose: 3000
    })
  }

  const handleMarkAsBacklog = () => {
    // Check if game already has backlog tag
    const currentTags = game.tags || []
    const hasBacklogTag = currentTags.includes('Backlog')

    if (hasBacklogTag) {
      // Remove backlog tag
      const updatedTags = currentTags.filter(tag => tag !== 'Backlog')
      actions.updateGame(game.id, { tags: updatedTags })
      showSuccess('Backlog tag removed from ' + game.title, {
        autoClose: 3000
      })
    } else {
      // Add backlog tag
      const updatedTags = [...currentTags, 'Backlog']
      actions.updateGame(game.id, { tags: updatedTags })
      showSuccess('Backlog tag added to ' + game.title, {
        autoClose: 3000
      })
    }
  }

  const formatPlaytime = (hours?: number) => {
    if (!hours) return '0h'
    const wholeHours = Math.floor(hours)
    const minutes = Math.round((hours - wholeHours) * 60)
    return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString()
  }

  // Auto-detect trailer function
  const handleAutoDetectTrailer = async () => {
    if (isDetectingTrailer) return

    setIsDetectingTrailer(true)
    try {
      const trailerUrl = await detectGameTrailer(game)
      if (trailerUrl) {
        actions.updateGame(game.id, { trailerUrl })
        showSuccess('Trailer detected and added automatically!')
      } else {
        showInfo('No trailer found. You can add one manually.')
      }
    } catch (error) {
      showError('Failed to detect trailer. Please try adding manually.')
    } finally {
      setIsDetectingTrailer(false)
    }
  }

  // Get enhanced moods for game using master mood system
  const gameMoods = game.moods || []
  const gameMoodData = gameMoods.slice(0, 3).map(mood => {
    const masterMoodId = getMasterMood(mood.toLowerCase())
    const masterMood = MASTER_MOODS.find(m => m.id === masterMoodId)
    return {
      id: mood,
      name: masterMood?.name || mood,
      emoji: masterMood?.emoji || '🎮',
      masterMood: masterMoodId
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker">
      {/* Cinematic Hero Section with Enhanced Header */}
      <div className="relative h-96 overflow-hidden hero-section">
        {/* Background placeholder to prevent flashing */}
        <div className="absolute inset-0 bg-gradient-to-br from-gaming-primary via-gaming-secondary to-gaming-accent" />

        {/* Background Image with Smooth Loading */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          {/* Game Cover Image with Better Sizing */}
          {headerImageUrl && (
            <img 
              src={headerImageUrl} 
              alt={game?.title}
              className="w-full h-full object-cover object-center game-header-image"
              onError={(e) => {
                console.error('❌ Header image failed to load:', headerImageUrl)
                // Fallback to gradient background
                e.currentTarget.style.display = 'none'
              }}
            />
          )}
        </motion.div>

        {/* Enhanced overlay layers for better image visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-transparent to-blue-900/30" />

        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-gaming-primary/20 via-transparent to-gaming-accent/20"
          animate={{
            background: [
              "linear-gradient(to bottom right, rgba(59, 130, 246, 0.2), transparent, rgba(34, 197, 94, 0.2))",
              "linear-gradient(to bottom right, rgba(34, 197, 94, 0.2), transparent, rgba(168, 85, 247, 0.2))"
            ]
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />

        {/* Animated Particles - Simplified */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/10 rounded-full"
              initial={{
                x: Math.random() * 100 + '%',
                y: Math.random() * 100 + '%',
                scale: 0
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 0.5, 0]
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <div className="flex items-end justify-between">
              <div className="flex-1">
                {/* Mood/Persona Context */}
                {persona && (
                  <motion.div
                    className="mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="px-3 py-1 bg-gaming-primary/20 border border-gaming-primary/30 rounded-full text-gaming-primary text-xs font-medium backdrop-blur-sm">
                        🧠 {persona?.traits?.archetypeId || 'Explorer'}
                      </div>
                      {personaCompatibility && (
                        <div className={`px-3 py-1 border rounded-full text-xs font-medium backdrop-blur-sm ${
                          personaCompatibility.score >= 80 ? 'bg-green-500/20 border-green-400/30 text-green-300' :
                          personaCompatibility.score >= 60 ? 'bg-blue-500/20 border-blue-400/30 text-blue-300' :
                          personaCompatibility.score >= 40 ? 'bg-yellow-500/20 border-yellow-400/30 text-yellow-300' :
                          'bg-gray-500/20 border-gray-400/30 text-gray-300'
                        }`}>
                          {personaCompatibility.score}% {personaCompatibility.level}
                        </div>
                      )}
                    </div>
                    {personaCompatibility && personaCompatibility.traits.length > 0 && (
                      <div className="text-xs text-gray-300">
                        Matches: {personaCompatibility.traits.join(' • ')}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Era Badge */}
                <motion.div
                  className="mb-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 text-xs font-medium backdrop-blur-sm">
                    {game?.releaseYear ? `From ${game.releaseYear}` : 'Classic Era'}
                  </span>
                </motion.div>

                {/* Title and Platform */}
                <motion.h1
                  className="text-5xl font-bold text-white drop-shadow-2xl mb-2"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {game?.title}
                </motion.h1>
                <motion.div
                  className="flex items-center gap-4 text-white/80 text-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <span>{game?.platforms?.map(platform => platform.name).join(' • ') || 'Unknown Platform'}</span>
                  {game?.hoursPlayed && (
                    <span className="flex items-center gap-1">
                      <span>⏱️</span>
                      {Math.floor(game.hoursPlayed)}h played
                    </span>
                  )}
                </motion.div>
              </div>

              {/* Launch Button */}
              <motion.button
                onClick={handlePlayNow}
                className="px-8 py-4 bg-gradient-to-r from-gaming-primary to-gaming-secondary text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-gaming-accent/50 flex items-center gap-3 backdrop-blur-sm border border-white/20 game-action-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <span className="text-2xl">▶️</span>
                <span>Launch Game</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Game Trailer Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="container mx-auto px-4 py-8"
      >
        <GameTrailer
          game={game}
          onTrailerUpdate={(trailerUrl) => {
            // Update game with trailer URL
            actions.updateGame(game.id, { trailerUrl })
          }}
          onAutoDetect={handleAutoDetectTrailer}
          isDetecting={isDetectingTrailer}
        />
      </motion.div>

      {/* Enhanced Navigation Bar */}
      <motion.div
        className="bg-gaming-dark/80 backdrop-blur-xl border-b border-gaming-primary/20 sticky top-0 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/library')}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gaming-primary to-gaming-secondary text-white rounded-xl font-bold transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-gaming-accent/50"
            >
              <span className="text-xl">←</span>
              <span>Back to Library</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content Layout */}
      <div className="container mx-auto px-4 py-8 content-section">
        {/* Enhanced Actions Toolbar */}
        <motion.div
          className="glass-morphism rounded-xl p-6 mb-8 border border-gaming-primary/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <div className="flex items-center justify-between">
            {/* Enhanced Quick Stats */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gaming-primary/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">⏱️</span>
                </div>
                <div>
                  <div className="text-white font-bold text-lg">{formatPlaytime(game.hoursPlayed)}</div>
                  <div className="text-gray-400 text-sm">Total Playtime</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gaming-accent/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🎮</span>
                </div>
                <div>
                  <div className="text-white font-bold text-lg">{game.localSessionCount || 0}</div>
                  <div className="text-gray-400 text-sm">Sessions</div>
                </div>
              </div>
              {game.lastLocalPlayedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-xl">📅</span>
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">{formatDate(game.lastLocalPlayedAt)}</div>
                    <div className="text-gray-400 text-sm">Last Played</div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkCompleted}
                className="p-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl transition-all group relative border border-green-500/30"
                title="Mark as Completed"
              >
                <span className="text-xl">✅</span>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gaming-dark text-green-400 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-green-500/30">
                  Mark as Completed
                </div>
              </button>
              <button
                onClick={handleMarkAsBacklog}
                className="p-3 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-xl transition-all group relative border border-yellow-500/30"
                title={game.tags?.includes('Backlog') ? 'Remove from Backlog' : 'Mark as Backlog'}
              >
                <span className="text-xl">{game.tags?.includes('Backlog') ? '✓' : '📋'}</span>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gaming-dark text-yellow-400 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-yellow-500/30">
                  {game.tags?.includes('Backlog') ? 'Remove from Backlog' : 'Mark as Backlog'}
                </div>
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Game Info (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Identity + Mood Layer */}
            <div className="glass-morphism rounded-xl p-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-2xl">🎭</span>
                Identity & Mood
              </h2>

              <div className="space-y-6">
                {/* Enhanced Mood Tags */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-2xl">🎭</span>
                    Game Moods
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {gameMoodData.length > 0 ? (
                      gameMoodData.map((mood, index) => (
                        <motion.div
                          key={mood.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium backdrop-blur-sm border transition-all duration-300 hover:scale-105 ${
                            mood.masterMood === 'adrenaline' ? 'bg-red-500/20 border-red-400/50 text-red-200' :
                            mood.masterMood === 'brain-power' ? 'bg-blue-500/20 border-blue-400/50 text-blue-200' :
                            mood.masterMood === 'zen' ? 'bg-green-500/20 border-green-400/50 text-green-200' :
                            mood.masterMood === 'story' ? 'bg-purple-500/20 border-purple-400/50 text-purple-200' :
                            mood.masterMood === 'social' ? 'bg-teal-500/20 border-teal-400/50 text-teal-200' :
                            mood.masterMood === 'creative' ? 'bg-yellow-500/20 border-yellow-400/50 text-yellow-200' :
                            mood.masterMood === 'nostalgic' ? 'bg-amber-500/20 border-amber-400/50 text-amber-200' :
                            mood.masterMood === 'scary' ? 'bg-gray-600/20 border-gray-500/50 text-gray-200' :
                            'bg-gray-500/20 border-gray-400/50 text-gray-200'
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            <span className="text-base">{mood.emoji}</span>
                            <span>{mood.name}</span>
                          </span>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-gray-400 italic">
                        <span className="text-2xl mr-2">🤔</span>
                        No mood tags assigned yet
                      </div>
                    )}
                  </div>
                </div>

                {/* Gaming Personality Insights */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-2xl">🧠</span>
                    Your Gaming Personality
                  </h3>
                  {personalityInsights.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {personalityInsights.map((insight, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gradient-to-br from-gaming-primary/10 to-gaming-secondary/10 border border-gaming-primary/20 rounded-lg p-4 hover:border-gaming-primary/40 transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-2xl">{insight.icon}</div>
                            <div>
                              <h4 className="font-semibold text-white mb-1">{insight.title}</h4>
                              <p className="text-gray-300 text-sm leading-relaxed">{insight.description}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400 italic text-center py-8">
                      <span className="text-4xl mb-2 block">🤔</span>
                      Play more to unlock your gaming personality insights!
                    </div>
                  )}
                </div>

                {/* Mood-Based Session Analysis */}
                {moodAnalysis && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">🎭</span>
                      Your Play Patterns
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {moodAnalysis.patterns.map((pattern, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6"
                        >
                          <div className="flex items-start gap-4">
                            <div className="text-4xl">{pattern.icon}</div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-white mb-2">{pattern.mood} Sessions</h4>
                              <p className="text-gray-300 text-sm mb-2">{pattern.trigger}</p>
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-400">When:</span>
                                  <span className="text-purple-300">{pattern.time}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-400">How often:</span>
                                  <span className="text-purple-300">{pattern.frequency}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {/* Session Stats */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-blue-500/10 to-teal-500/10 border border-blue-500/20 rounded-lg p-6"
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">📊</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white mb-2">Session Insights</h4>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Total sessions:</span>
                                <span className="text-blue-300">{moodAnalysis.sessionStats.totalSessions}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Avg length:</span>
                                <span className="text-blue-300">{Math.round(moodAnalysis.sessionStats.avgLength * 10) / 10}h</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Weekly play:</span>
                                <span className="text-blue-300">{Math.round(moodAnalysis.sessionStats.weeklyFrequency)} sessions</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Best time:</span>
                                <span className="text-blue-300">{moodAnalysis.sessionStats.preferredTime}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Achievement Progress */}
            <div className="glass-morphism rounded-xl p-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-2xl">🏆</span>
                Achievement Progress
              </h2>

              <div className="space-y-6">
                {/* Overall Progress */}
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white">Completion Rate</h3>
                      <p className="text-gray-400 text-sm">
                        {achievementProgress.unlocked} of {achievementProgress.total} achievements unlocked
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gaming-primary">{achievementProgress.completionRate}%</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                    <motion.div
                      className="bg-gradient-to-r from-gaming-primary to-gaming-secondary h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${achievementProgress.completionRate}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0%</span>
                    <span>{achievementProgress.completionRate}% Complete</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Recent Achievements */}
                {achievementProgress.recent.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Recent Achievements</h3>
                    <div className="space-y-3">
                      {achievementProgress.recent.map((achievement, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-4 bg-gray-800/30 rounded-lg p-4 border border-gray-700/30"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                            <span className="text-xl">🏆</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">{achievement.name}</h4>
                            <p className="text-gray-300 text-sm">{achievement.description}</p>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            achievement.rarity === 'Common' ? 'bg-gray-500/20 text-gray-300' :
                            achievement.rarity === 'Uncommon' ? 'bg-green-500/20 text-green-300' :
                            achievement.rarity === 'Rare' ? 'bg-blue-500/20 text-blue-300' :
                            'bg-purple-500/20 text-purple-300'
                          }`}>
                            {achievement.rarity}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Personal Gaming Records */}
            {gamingRecords && (
              <div className="glass-morphism rounded-xl p-8">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-2xl">📈</span>
                  Your Gaming Records
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {gamingRecords.map((record, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-br from-gaming-secondary/10 to-gaming-accent/10 border border-gaming-secondary/20 rounded-lg p-6 text-center hover:border-gaming-secondary/40 transition-all"
                    >
                      <div className="text-3xl mb-2">{record.icon}</div>
                      <div className="text-2xl font-bold text-white mb-1">{record.value}</div>
                      <div className="text-sm font-semibold text-gaming-secondary mb-2">{record.title}</div>
                      <div className="text-xs text-gray-400">{record.description}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Cover Art */}
              <div className="flex justify-center">
                <div className="relative w-64 h-96 rounded-xl overflow-hidden cinematic-shadow">
                  <img
                    src={game.coverImage || 'https://via.placeholder.com/300x400/8b5cf6/ffffff?text=Game+Cover'}
                    alt={game.title}
                    className="w-full h-full object-cover game-cover-image"
                    onError={(e) => {
                      console.error('❌ Cover art failed to load:', game.coverImage)
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              </div>

              {/* Game Info */}
              <div className="space-y-6">
                {/* Title & Status */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-white truncate flex-1 mr-4">{game.title}</h3>
                    <PersonaSummaryBar persona={persona} />
                  </div>

                  {/* Play Status Badge */}
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                      game.playStatus === 'playing' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                      game.playStatus === 'completed' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      game.playStatus === 'backlog' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                      'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                    }`}>
                      {game.playStatus === 'playing' && '▶️ Currently Playing'}
                      {game.playStatus === 'completed' && '✅ Completed'}
                      {game.playStatus === 'backlog' && '📋 In Backlog'}
                      {game.playStatus === 'paused' && '⏸️ Paused'}
                      {game.playStatus === 'abandoned' && '🚫 Abandoned'}
                      {!game.playStatus && '📝 Not Started'}
                    </span>
                  </div>
                </div>

                {/* Game Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gaming-accent">🎮</span>
                      <span className="text-gray-300 truncate">
                        {game.platforms?.map(platform => platform.name).join(' • ') || 'Unknown Platform'}
                      </span>
                    </div>

                    {game.releaseYear && (
                      <div className="flex items-center gap-2">
                        <span className="text-gaming-accent">📅</span>
                        <span className="text-gray-300 whitespace-nowrap">Released {game.releaseYear}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {game.hoursPlayed && (
                      <div className="flex items-center gap-2">
                        <span className="text-gaming-accent">⏱️</span>
                        <span className="text-gray-300 whitespace-nowrap">{formatPlaytime(game.hoursPlayed)} played</span>
                      </div>
                    )}

                    {game.lastLocalPlayedAt && (
                      <div className="flex items-center gap-2">
                        <span className="text-gaming-accent">🕐</span>
                        <span className="text-gray-300 whitespace-nowrap">Last played {formatDate(game.lastLocalPlayedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Genres & Tags */}
                <div>
                  <h4 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span>🏷️</span>
                    Genres & Tags
                  </h4>
                  <div className="space-y-3">
                    {game.genres && game.genres.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Genres</p>
                        <div className="flex flex-wrap gap-2">
                          {game.genres.map((genre, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gaming-primary/20 text-gaming-primary text-xs rounded-full border border-gaming-primary/30 whitespace-nowrap"
                            >
                              {genre.description || genre.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {game.tags && game.tags.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {game.tags.slice(0, 8).map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full border border-gray-600/30 whitespace-nowrap"
                            >
                              {tag}
                            </span>
                          ))}
                          {game.tags.length > 8 && (
                            <span className="px-3 py-1 bg-gray-600/50 text-gray-400 text-xs rounded-full whitespace-nowrap">
                              +{game.tags.length - 8} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {game.description && (
              <div className="mt-8 p-6 bg-gray-800/30 rounded-xl border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span>📖</span>
                  About This Game
                </h3>
                <p className="text-gray-300 leading-relaxed text-lg">
                  {game.description}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Enhanced Stats & History (1/3 width) */}
          <div className="lg:col-span-1 space-y-8">
            {/* Enhanced Stats & History */}
            <div className="glass-morphism rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-2xl">📊</span>
                Stats & History
              </h2>

              <div className="space-y-4">
                {/* Enhanced Playtime Stats */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-300 text-sm">Total Playtime</span>
                    <span className="text-white font-bold text-lg">
                      {formatPlaytime(game.hoursPlayed)}
                    </span>
                  </div>
                  {game.lastLocalPlayedAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm">Last Played</span>
                      <span className="text-gray-400 text-sm">
                        {formatDate(game.lastLocalPlayedAt)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Sessions Stats */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Total Sessions</span>
                    <span className="text-white font-bold text-lg">
                      {game.localSessionCount || 0}
                    </span>
                  </div>
                </div>

                {/* Sessions Timeline */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Sessions</h3>
                  <div className="space-y-3">
                    {game.lastLocalPlayedAt && (
                      <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div>
                          <div className="text-gray-300 text-sm font-medium">
                            {formatDate(game.lastLocalPlayedAt)}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {formatPlaytime(game.hoursPlayed)} session
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <div>
                        <div className="text-gray-300 text-sm font-medium">First played</div>
                        <div className="text-gray-400 text-xs">Added to library</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameDetailsLayout
