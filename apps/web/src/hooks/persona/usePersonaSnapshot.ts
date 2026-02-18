import { useMemo } from 'react'
import { buildPersonaSnapshot, type PersonaSnapshot } from '../../../../../packages/identity-engine/src/persona'
import { useLibraryStore } from '../../stores/useLibraryStore'
import { useCurrentMood } from '../useCurrentMood'

/**
 * Global persona hook that computes persona snapshot from all library data
 * Uses comprehensive game library data for accurate persona analysis
 */
export function usePersonaSnapshot(): PersonaSnapshot {
  const { games } = useLibraryStore()
  const moodEntry = useCurrentMood()

  return useMemo(() => {
    try {
      // Derive RawPlayerSignals from global library data
      const rawSignals = deriveGlobalPlayerSignals(games)
      
      // Build persona snapshot with real mood data
      return buildPersonaSnapshot({
        signals: rawSignals,
        moodEntry
      })
    } catch (error) {
      console.warn('Persona snapshot calculation failed, using fallback:', error)
      
      // Fallback to minimal persona snapshot
      return buildPersonaSnapshot({
        signals: createFallbackSignals(),
        moodEntry
      })
    }
  }, [games, moodEntry])
}

/**
 * Derives RawPlayerSignals from global library data with enhanced Steam data analysis
 */
function deriveGlobalPlayerSignals(games: any[]) {
  // Calculate playtime by genre with better genre extraction
  const playtimeByGenre = games.reduce((acc, game) => {
    const hours = game.hoursPlayed || 0
    if (hours > 0) {
      // Extract genres from multiple sources
      const genres = [
        ...(game.genres || []),
        ...(game.tags || [])
      ].map(g => typeof g === 'string' ? g : g.name || g.description || '').filter(Boolean)
      
      genres.forEach((genre: string) => {
        const normalizedGenre = genre.toLowerCase()
        acc[normalizedGenre] = (acc[normalizedGenre] || 0) + hours
      })
    }
    return acc
  }, {} as Record<string, number>)

  // Calculate average session length from Steam playtime patterns
  const totalHours = games.reduce((sum, game) => sum + (game.hoursPlayed || 0), 0)
  const recentlyPlayedGames = games.filter(game => 
    game.lastPlayed && 
    new Date(game.lastPlayed).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000 // Last 30 days
  ).length
  
  // Enhanced session calculation based on Steam data
  const averageSessionLengthMinutes = recentlyPlayedGames > 0 
    ? Math.max(30, Math.min(180, (totalHours * 60) / Math.max(1, recentlyPlayedGames * 2))) // 30min-3hr range
    : 60

  // Calculate sessions per week from recent Steam activity
  const sessionsPerWeek = recentlyPlayedGames > 0 
    ? Math.min(14, Math.max(1, Math.round(recentlyPlayedGames / 4))) // Scale with recent activity
    : 3

  // Enhanced multiplayer ratio from Steam tags and platforms
  const multiplayerGames = games.filter(game => {
    const tags = (game.tags || []).map((tag: string) => tag.toLowerCase())
    const hasMultiplayerTag = tags.some((tag: string) => 
      tag.includes('multiplayer') || 
      tag.includes('co-op') ||
      tag.includes('pvp') ||
      tag.includes('online')
    )
    const hasSteamPlatform = game.platforms?.some((p: any) => p.code === 'steam')
    return hasMultiplayerTag || hasSteamPlatform
  }).length
  const multiplayerRatio = games.length > 0 ? multiplayerGames / games.length : 0.3

  // Enhanced completion rate from Steam playStatus
  const completedGames = games.filter(game => game.playStatus === 'completed').length
  const completionRate = games.length > 0 ? completedGames / games.length : 0.5

  // Late night gaming ratio from Steam lastPlayed data
  const lateNightGames = games.filter(game => {
    if (!game.lastPlayed) return false
    const hour = new Date(game.lastPlayed).getHours()
    return hour >= 22 || hour <= 6 // 10 PM - 6 AM
  }).length
  const lateNightRatio = games.length > 0 ? lateNightGames / games.length : 0.2

  // Difficulty preference inferred from game genres and Steam data
  const genres = Object.keys(playtimeByGenre)
  let difficultyPreference: "Relaxed" | "Normal" | "Hard" | "Brutal" = "Normal"
  if (genres.some(g => g.includes('souls') || g.includes('hardcore') || g.includes('brutal'))) {
    difficultyPreference = "Brutal"
  } else if (genres.some(g => g.includes('hard') || g.includes('difficult'))) {
    difficultyPreference = "Hard"
  } else if (genres.some(g => g.includes('casual') || g.includes('puzzle') || g.includes('relaxed'))) {
    difficultyPreference = "Relaxed"
  }

  return {
    playtimeByGenre,
    averageSessionLengthMinutes,
    sessionsPerWeek,
    difficultyPreference,
    multiplayerRatio,
    lateNightRatio,
    completionRate
  }
}

/**
 * Creates fallback signals for error cases
 */
function createFallbackSignals() {
  return {
    playtimeByGenre: {},
    averageSessionLengthMinutes: 60,
    sessionsPerWeek: 2,
    difficultyPreference: 'Normal' as const,
    multiplayerRatio: 0.4,
    lateNightRatio: 0.25,
    completionRate: 0.3
  }
}
