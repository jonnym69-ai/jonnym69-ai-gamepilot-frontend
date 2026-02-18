import { useMemo } from 'react'
import { buildPersonaSnapshot, type PersonaSnapshot } from '../../../../../packages/identity-engine/src/persona'
import { useLibraryStore } from '../../stores/useLibraryStore'
import { useCurrentMood } from '../useCurrentMood'

/**
 * Game-specific persona hook that computes persona snapshot for a single game
 * Provides game-specific persona insights and recommendations
 */
export function useGamePersona(gameId: string): PersonaSnapshot {
  const { games, intelligence } = useLibraryStore()
  const moodEntry = useCurrentMood()

  return useMemo(() => {
    try {
      // Find the specific game
      const game = games.find(g => g.id === gameId)
      
      if (!game) {
        console.warn(`Game ${gameId} not found in library`)
        return buildPersonaSnapshot({
          signals: createGameFallbackSignals(),
          moodEntry
        })
      }

      // Derive RawPlayerSignals from single game data
      const rawSignals = deriveGamePlayerSignals(game)
      
      // Build persona snapshot with real mood data
      return buildPersonaSnapshot({
        signals: rawSignals,
        moodEntry
      })
    } catch (error) {
      console.warn(`Game persona calculation failed for ${gameId}, using fallback:`, error)
      
      // Fallback to minimal persona snapshot
      return buildPersonaSnapshot({
        signals: createGameFallbackSignals(),
        moodEntry
      })
    }
  }, [games, intelligence, gameId, moodEntry])
}

/**
 * Derives RawPlayerSignals from single game data
 */
function deriveGamePlayerSignals(game: any) {
  // Calculate playtime by genre for this specific game
  const playtimeByGenre: Record<string, number> = {}
  const hours = game.hoursPlayed || 0
  
  if (hours > 0) {
    // Use all available genre data for this game
    const allGenres = [
      ...(game.genres || []),
      ...(game.subgenres || [])
    ]
    
    allGenres.forEach((genre: string) => {
      playtimeByGenre[genre] = hours
    })
  }

  // Game-specific session length (shorter for single game focus)
  const averageSessionLengthMinutes = 45

  // Game-specific sessions per week (lower for single game)
  const sessionsPerWeek = 1

  // Determine if this specific game is multiplayer
  const isMultiplayer = game.tags?.some((tag: string) => 
    tag.toLowerCase().includes('multiplayer') || 
    tag.toLowerCase().includes('co-op') ||
    tag.toLowerCase().includes('pvp') ||
    tag.toLowerCase().includes('online')
  ) || game.genres?.some((genre: string) =>
    genre.toLowerCase().includes('multiplayer') ||
    genre.toLowerCase().includes('mmorpg')
  )

  const multiplayerRatio = isMultiplayer ? 1.0 : 0.0

  // Game-specific completion rate based on game status
  let completionRate = 0.3 // Default for single game
  
  if (game.playStatus === 'completed') {
    completionRate = 1.0
  } else if (game.playStatus === 'playing') {
    completionRate = 0.5
  } else if (game.playStatus === 'backlog') {
    completionRate = 0.1
  }

  // Estimate difficulty from game tags and genres
  let difficultyPreference: "Relaxed" | "Normal" | "Hard" | "Brutal" = "Normal"
  
  const difficultTags = game.tags?.filter((tag: string) =>
    tag.toLowerCase().includes('hard') ||
    tag.toLowerCase().includes('difficult') ||
    tag.toLowerCase().includes('challenging') ||
    tag.toLowerCase().includes('brutal')
  )
  
  const difficultGenres = game.genres?.filter((genre: string) =>
    genre.toLowerCase().includes('roguelike') ||
    genre.toLowerCase().includes('souls') ||
    genre.toLowerCase().includes('hardcore')
  )
  
  if (difficultTags.length > 0 || difficultGenres.length > 0) {
    difficultyPreference = "Hard"
  }
  
  const casualTags = game.tags?.filter((tag: string) =>
    tag.toLowerCase().includes('casual') ||
    tag.toLowerCase().includes('relaxed') ||
    tag.toLowerCase().includes('easy')
  )
  
  const casualGenres = game.genres?.filter((genre: string) =>
    genre.toLowerCase().includes('casual') ||
    genre.toLowerCase().includes('puzzle') ||
    genre.toLowerCase().includes('simulation')
  )
  
  if (casualTags.length > 0 || casualGenres.length > 0) {
    difficultyPreference = "Relaxed"
  }

  return {
    playtimeByGenre,
    averageSessionLengthMinutes,
    sessionsPerWeek,
    difficultyPreference,
    multiplayerRatio,
    lateNightRatio: 0.2, // Default - no session timing data yet
    completionRate
  }
}

/**
 * Creates game-specific fallback signals
 */
function createGameFallbackSignals() {
  return {
    playtimeByGenre: {},
    averageSessionLengthMinutes: 60,
    sessionsPerWeek: 1,
    difficultyPreference: 'Normal' as const,
    multiplayerRatio: 0.5,
    lateNightRatio: 0.2,
    completionRate: 0.5
  }
}
