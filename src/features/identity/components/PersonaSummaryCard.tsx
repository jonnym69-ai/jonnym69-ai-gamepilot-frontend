import React from 'react'
import { usePersonaSnapshot } from '../../../hooks/persona/usePersonaSnapshot'
import { useLibraryStore } from '../../../stores/useLibraryStore'

// Simple Card component to replace UI package dependency
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`glass-morphism rounded-xl p-6 cursor-pointer hover:bg-white/15 transition-colors ${className}`}>
    {children}
  </div>
)

export const PersonaSummaryCard: React.FC = () => {
  const personaSnapshot = usePersonaSnapshot()
  const { games } = useLibraryStore()

  // Extract top genres from games
  const getTopGenres = () => {
    const genreCount: Record<string, number> = {}
    games.forEach(game => {
      game.genres?.forEach(genre => {
        const genreName = typeof genre === 'string' ? genre : genre.name || genre.description || 'Unknown'
        genreCount[genreName] = (genreCount[genreName] || 0) + 1
      })
    })
    return Object.entries(genreCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([name]) => name)
  }

  if (!personaSnapshot) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">👤</div>
          <p>Loading persona data...</p>
        </div>
      </Card>
    )
  }

  const topGenres = getTopGenres()

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🎯</span>
          <h3 className="text-xl font-bold text-white">Persona Summary</h3>
        </div>

        {/* Current Mood */}
        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
          <span className="text-gray-300">Current Mood</span>
          <span className="text-gaming-accent font-semibold capitalize">
            {personaSnapshot.mood?.moodId || 'Unknown'}
          </span>
        </div>

        {/* Archetype */}
        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
          <span className="text-gray-300">Archetype</span>
          <span className="text-gaming-accent font-semibold capitalize">
            {personaSnapshot.traits.archetypeId}
          </span>
        </div>

        {/* Top Genres */}
        <div className="p-3 bg-gray-800/50 rounded-lg">
          <div className="text-gray-300 mb-2">Top Genres</div>
          <div className="flex flex-wrap gap-2">
            {topGenres.map((genre: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-gaming-accent/20 rounded-full text-xs text-gaming-accent border border-gaming-accent/30"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>

        {/* Key Traits */}
        <div className="p-3 bg-gray-800/50 rounded-lg">
          <div className="text-gray-300 mb-2">Key Traits</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-gaming-primary">🎮</span>
              <span className="text-sm text-gray-200">
                {personaSnapshot.traits.intensity} Intensity
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gaming-primary">⏱️</span>
              <span className="text-sm text-gray-200">
                {personaSnapshot.traits.pacing} Pacing
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gaming-primary">👥</span>
              <span className="text-sm text-gray-200">
                {personaSnapshot.traits.socialStyle} Style
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
