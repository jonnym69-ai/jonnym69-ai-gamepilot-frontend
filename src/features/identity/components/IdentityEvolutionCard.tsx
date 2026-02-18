import React, { useState } from 'react'
import { usePersonaSnapshot } from '../../../hooks/persona/usePersonaSnapshot'
import { useLibraryStore } from '../../../stores/useLibraryStore'

interface IdentityEvolutionCardProps {
  theme: {
    primary: string
    accent: string
    bg: string
  }
}

export const IdentityEvolutionCard: React.FC<IdentityEvolutionCardProps> = ({ theme }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const personaSnapshot = usePersonaSnapshot()
  const { games } = useLibraryStore()

  // Generate real mood trend from recent games
  const getMoodTrend = () => {
    const recentGames = games
      .filter(game => game.lastPlayed)
      .sort((a, b) => new Date(a.lastPlayed!).getTime() - new Date(b.lastPlayed!).getTime())
      .slice(-7) // Last 7 days

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const today = new Date().getDay()
    
    return days.map((day, index) => {
      const dayGames = recentGames.filter(game => {
        const gameDay = new Date(game.lastPlayed!).getDay()
        return gameDay === (today - index + 7) % 7
      })

      // Calculate mood intensity based on games played that day
      const avgPlaytime = dayGames.reduce((sum, game) => sum + (game.hoursPlayed || 0), 0) / Math.max(1, dayGames.length)
      const intensity = Math.min(100, Math.max(20, avgPlaytime * 10 + (dayGames.length * 15)))
      
      // Determine mood based on game types
      let mood = 'Focused'
      
      // Helper function to extract tag names
      const getTagName = (tag: any) => {
        if (typeof tag === 'string') return tag.toLowerCase()
        if (tag && typeof tag === 'object' && tag.name) return tag.name.toLowerCase()
        return ''
      }
      
      // Helper function to extract genre names
      const getGenreName = (genre: any) => {
        if (typeof genre === 'string') return genre.toLowerCase()
        if (genre && typeof genre === 'object' && genre.name) return genre.name.toLowerCase()
        return ''
      }
      
      const tagNames = dayGames.flatMap(g => g.tags?.map(getTagName) || [])
      const genreNames = dayGames.flatMap(g => g.genres?.map(getGenreName) || [])
      
      if (tagNames.some(t => t.includes('competitive'))) {
        mood = 'Energetic'
      } else if (genreNames.some(g => g.includes('creative'))) {
        mood = 'Creative'
      } else if (genreNames.some(g => g.includes('puzzle'))) {
        mood = 'Chill'
      }

      return { day, mood, value: Math.round(intensity) }
    })
  }

  // Generate real genre drift from persona data
  const getGenreDrift = () => {
    const recentGames = games.filter(game => game.lastPlayed).slice(-20)
    const olderGames = games.filter(game => game.lastPlayed).slice(0, -20)
    
    const calculateGenreDistribution = (gameList: any[]) => {
      const distribution: Record<string, number> = {}
      gameList.forEach(game => {
        game.genres?.forEach((genre: any) => {
          const genreName = typeof genre === 'string' ? genre : genre.name
          distribution[genreName] = (distribution[genreName] || 0) + 1
        })
      })
      return distribution
    }

    const recentDist = calculateGenreDistribution(recentGames)
    const olderDist = calculateGenreDistribution(olderGames)
    const totalRecent = Object.values(recentDist).reduce((a, b) => a + b, 0) || 1
    const totalOlder = Object.values(olderDist).reduce((a, b) => a + b, 0) || 1

    // Get top 5 genres and calculate drift
    const allGenres = new Set([...Object.keys(recentDist), ...Object.keys(olderDist)])
    const genreDrift = Array.from(allGenres).slice(0, 5).map(genre => ({
      genre,
      current: Math.round((recentDist[genre] || 0) / totalRecent * 100),
      previous: Math.round((olderDist[genre] || 0) / totalOlder * 100)
    }))

    return genreDrift
  }

  // Calculate playstyle stability from persona confidence
  const playstyleStability = Math.round((personaSnapshot?.confidence || 0.7) * 100)

  const moodTrend = getMoodTrend()
  const genreDrift = getGenreDrift()

  const getMoodColor = (mood: string) => {
    const colors: Record<string, string> = {
      'Focused': 'bg-blue-500',
      'Energetic': 'bg-orange-500',
      'Creative': 'bg-purple-500',
      'Chill': 'bg-green-500'
    }
    return colors[mood] || 'bg-gray-500'
  }

  return (
    <div className={`glass-morphism rounded-xl p-6 border border-white/10 hover:bg-white/5 transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📈</span>
          <h3 className="text-xl font-bold text-white">Identity Evolution</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gaming-accent hover:text-white transition-colors text-sm"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {/* Collapsed View */}
      {!isExpanded && (
        <div className="space-y-4">
          {/* Mood Trend Summary */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Mood Trend (7 days)</span>
              <span className="text-sm text-gaming-accent">↑ 12%</span>
            </div>
            <div className="flex gap-1">
              {moodTrend.slice(-5).map((day, index) => (
                <div key={index} className="flex-1 text-center">
                  <div className="text-xs text-gray-400">{day.day}</div>
                  <div className={`h-2 rounded-full ${getMoodColor(day.mood)} mt-1`} 
                       style={{ width: `${day.value}%` }} />
                </div>
              ))}
            </div>
          </div>

          {/* Genre Drift Summary */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Genre Preferences</span>
              <span className="text-sm text-gaming-accent">Stable</span>
            </div>
            <div className="space-y-1">
              {genreDrift.slice(0, 3).map((genre, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{genre.genre}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{genre.previous}%</span>
                    <span className="text-gaming-accent">→</span>
                    <span className="text-white">{genre.current}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Playstyle Stability */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Playstyle Stability</span>
              <span className="text-sm text-gaming-accent">{playstyleStability}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full bg-gradient-to-r ${theme.primary} transition-all duration-500`}
                style={{ width: `${playstyleStability}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="space-y-6">
          {/* Detailed Mood Trend */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Mood Evolution (Last 7 Days)</h4>
            <div className="space-y-2">
              {moodTrend.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-300 w-8">{day.day}</span>
                    <span className="text-sm text-white">{day.mood}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getMoodColor(day.mood)} transition-all duration-300`}
                        style={{ width: `${day.value}%` }}
                      />
                    </div>
                    <span className="text-sm text-gaming-accent w-10 text-right">{day.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Genre Drift */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Genre Preference Drift</h4>
            <div className="space-y-3">
              {genreDrift.map((genre, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{genre.genre}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Previous: {genre.previous}%</span>
                      <span className="text-xs text-gaming-accent">Current: {genre.current}%</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <div className="flex-1 bg-gray-700 rounded-full h-1">
                      <div 
                        className="h-1 rounded-full bg-gray-500"
                        style={{ width: `${genre.previous}%` }}
                      />
                    </div>
                    <div className="flex-1 bg-gray-700 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full bg-gradient-to-r ${theme.primary}`}
                        style={{ width: `${genre.current}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Playstyle Stability Analysis */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Playstyle Consistency</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Stability Score</span>
                <span className="text-lg font-bold text-gaming-accent">{playstyleStability}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full bg-gradient-to-r ${theme.primary} transition-all duration-500`}
                  style={{ width: `${playstyleStability}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">
                {playstyleStability >= 80 ? 'Very consistent playstyle patterns' :
                 playstyleStability >= 60 ? 'Moderately consistent with some variation' :
                 'Highly variable playstyle preferences'}
              </p>
            </div>
          </div>

          {/* View Evolution Button */}
          <div className="pt-4 border-t border-white/10">
            <button 
              className={`w-full bg-gradient-to-r ${theme.primary} text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity`}
              onClick={() => console.log('View full evolution timeline')}
            >
              View Full Evolution Timeline
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
