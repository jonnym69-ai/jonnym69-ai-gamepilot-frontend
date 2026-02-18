import React from 'react'
import { useLibraryStore } from '../../stores/useLibraryStore'
import { MOODS, type MoodId } from '@gamepilot/static-data'

/**
 * Debug component for mood filtering
 * Shows current mood state and game counts
 */
export function MoodFilterDebug() {
  const { games } = useLibraryStore()

  if (!games || games.length === 0) {
    return (
      <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50">
        <div className="font-bold mb-2">🔍 Mood Filter Debug</div>
        <div>No games loaded</div>
      </div>
    )
  }

  // Count games by mood
  const moodCounts = games.reduce((acc, game) => {
    const gameMoods = Array.isArray((game as any).moods) ? (game as any).moods : [(game as any).mood]
    
    gameMoods.forEach((mood: any) => {
      if (mood && typeof mood === 'string') {
        const moodKey = mood as MoodId
        acc[moodKey] = (acc[moodKey] || 0) + 1
      }
    })
    
    return acc
  }, {} as Record<MoodId, number>)

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50 max-w-xs">
      <div className="font-bold mb-2">🔍 Mood Filter Debug</div>
      <div className="space-y-1">
        <div>Total Games: {games.length}</div>
        {Object.entries(moodCounts).map(([mood, count]) => (
          <div key={mood} className="flex justify-between">
            <span>{mood}:</span>
            <span>{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
