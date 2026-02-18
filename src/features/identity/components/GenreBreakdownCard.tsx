import React from 'react'
import { useLibraryStore } from '../../../stores/useLibraryStore'

// Simple Card component to replace UI package dependency
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`glass-morphism rounded-xl p-6 cursor-pointer hover:bg-white/15 transition-colors ${className}`}>
    {children}
  </div>
)

export const GenreBreakdownCard: React.FC = () => {
  const { games } = useLibraryStore()

  // Calculate genre breakdown from games
  const getGenreBreakdown = () => {
    const genreCount: Record<string, number> = {}
    let totalHours = 0

    games.forEach(game => {
      const hours = game.hoursPlayed || 0
      totalHours += hours
      
      game.genres?.forEach(genre => {
        const genreName = typeof genre === 'string' ? genre : genre.name || genre.description || 'Unknown'
        genreCount[genreName] = (genreCount[genreName] || 0) + hours
      })
    })

    // Convert to array and calculate percentages
    const breakdown = Object.entries(genreCount)
      .map(([name, hours]) => ({
        name,
        hours,
        percentage: totalHours > 0 ? (hours / totalHours) * 100 : 0,
        gameCount: games.filter(game => 
          game.genres?.some(g => {
            const gName = typeof g === 'string' ? g : g.name || g.description || ''
            return gName === name
          })
        ).length
      }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5)

    return breakdown
  }

  const genreBreakdown = getGenreBreakdown()

  const getGenreColor = (index: number) => {
    const colors = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-teal-500',
      'from-yellow-500 to-orange-500',
      'from-red-500 to-pink-500'
    ]
    return colors[index % colors.length]
  }

  const formatHours = (hours: number) => {
    if (hours < 1) return '< 1h'
    if (hours < 24) return `${Math.floor(hours)}h`
    if (hours < 24 * 7) return `${Math.floor(hours / 24)}d`
    return `${Math.floor(hours / (24 * 7))}w`
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🎭</span>
          <h3 className="text-xl font-bold text-white">Genre Breakdown</h3>
        </div>

        {genreBreakdown.length > 0 ? (
          <div className="space-y-3">
            {genreBreakdown.map((genre, index) => (
              <div key={genre.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getGenreColor(index)}`} />
                    <span className="text-white font-medium">{genre.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-gaming-accent font-semibold">
                      {genre.percentage.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400">
                      {genre.gameCount} games • {formatHours(genre.hours)}
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${getGenreColor(index)} transition-all duration-1000 ease-out`}
                    style={{ width: `${genre.percentage}%` }}
                  >
                    <div className="h-full bg-white/20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <span className="text-4xl">🎭</span>
            <p className="text-sm mt-2">No genre data available</p>
            <p className="text-xs text-gray-500 mt-1">
              Add games to your library to see genre breakdown
            </p>
          </div>
        )}

        {/* Summary Stats */}
        {genreBreakdown.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gaming-accent">
                  {genreBreakdown.length}
                </div>
                <div className="text-xs text-gray-400">Genres</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gaming-accent">
                  {games.length}
                </div>
                <div className="text-xs text-gray-400">Games</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gaming-accent">
                  {formatHours(games.reduce((sum, game) => sum + (game.hoursPlayed || 0), 0))}
                </div>
                <div className="text-xs text-gray-400">Total Hours</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
