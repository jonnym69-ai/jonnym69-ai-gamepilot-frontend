import { useMemo } from 'react'
import { useLibraryStore } from '../stores/useLibraryStore'
import type { Game } from '@gamepilot/types'

export const useFeaturedGames = (count: number = 6): Game[] => {
  const games = useLibraryStore(state => state.games)

  return useMemo(() => {
    if (games.length === 0) {
      return []
    }

    // Sort by playtime (hoursPlayed) and get top games
    const sortedByPlaytime = [...games]
      .sort((a, b) => (b.hoursPlayed || 0) - (a.hoursPlayed || 0))
      .slice(0, count)

    // If we have games with playtime, use them
    if (sortedByPlaytime.length > 0 && sortedByPlaytime[0].hoursPlayed && sortedByPlaytime[0].hoursPlayed > 0) {
      return sortedByPlaytime
    }

    // Fallback: random selection if no playtime data
    const shuffled = [...games].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }, [games, count])
}
