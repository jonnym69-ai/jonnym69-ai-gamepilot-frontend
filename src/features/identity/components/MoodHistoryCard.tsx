import React from 'react'
import { useCurrentMood } from '../../../hooks/useCurrentMood'
import { usePersonaSnapshot } from '../../../hooks/persona/usePersonaSnapshot'
import { useLibraryStore } from '../../../stores/useLibraryStore'

// Simple Card component to replace UI package dependency
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`glass-morphism rounded-xl p-6 cursor-pointer hover:bg-white/15 transition-colors ${className}`}>
    {children}
  </div>
)

export const MoodHistoryCard: React.FC = () => {
  const currentMood = useCurrentMood()
  const personaSnapshot = usePersonaSnapshot()
  const { games } = useLibraryStore()

  // Generate mood history from persona engine and game data
  const getMoodHistory = () => {
    const recentGames = games
      .filter(game => game.lastPlayed)
      .sort((a, b) => new Date(b.lastPlayed!).getTime() - new Date(a.lastPlayed!).getTime())
      .slice(0, 7)

    // Map games to mood states using persona engine insights
    return recentGames.map((game, index) => {
      // Determine mood based on game genre and tags
      let mood = 'Neutral'
      
      // Helper function to extract genre names
      const getGenreName = (genre: any) => {
        if (typeof genre === 'string') return genre.toLowerCase()
        if (genre && typeof genre === 'object' && genre.name) return genre.name.toLowerCase()
        return ''
      }
      
      // Helper function to extract tag names
      const getTagName = (tag: any) => {
        if (typeof tag === 'string') return tag.toLowerCase()
        if (tag && typeof tag === 'object' && tag.name) return tag.name.toLowerCase()
        return ''
      }
      
      const genreNames = game.genres?.map(getGenreName) || []
      const tagNames = game.tags?.map(getTagName) || []
      
      if (genreNames.some(g => g.includes('action')) || tagNames.some(t => t.includes('competitive'))) {
        mood = 'Competitive'
      } else if (genreNames.some(g => g.includes('puzzle')) || tagNames.some(t => t.includes('relaxing'))) {
        mood = 'Relaxed'
      } else if (genreNames.some(g => g.includes('sandbox')) || tagNames.some(t => t.includes('creative'))) {
        mood = 'Creative'
      } else if (genreNames.some(g => g.includes('rpg'))) {
        mood = 'Immersive'
      }

      // Calculate intensity based on playtime and completion
      const intensity = game.hoursPlayed ? Math.min(5, Math.max(1, Math.floor(game.hoursPlayed / 10) + 1)) : 3

      return {
        id: `mood-${index}`,
        mood,
        intensity,
        timestamp: game.lastPlayed!,
        gameTitle: game.title,
        confidence: personaSnapshot?.confidence || 0.7
      }
    })
  }

  const moodHistory = getMoodHistory()

  const getMoodEmoji = (mood: string) => {
    switch (mood.toLowerCase()) {
      case 'competitive': return '🏆'
      case 'relaxed': return '😌'
      case 'creative': return '🎨'
      case 'immersive': return '�'
      case 'neutral': return '😐'
      default: return '😊'
    }
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Unknown time'
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      if (isNaN(dateObj.getTime())) {
        return 'Invalid date'
      }
      
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj)
    } catch (error) {
      console.warn('Date formatting error:', error, 'Input:', date)
      return 'Invalid date'
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">😊</span>
          <h3 className="text-xl font-bold text-white">Mood History</h3>
        </div>

        {/* Current Mood */}
        {currentMood && (
          <div className="p-3 bg-gradient-to-r from-gaming-primary to-gaming-secondary/20 rounded-lg border border-gaming-primary/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Current Mood</span>
              <span className="text-gaming-accent font-semibold capitalize">
                {currentMood.moodId}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getMoodEmoji(currentMood.moodId)}</span>
              <div className="flex-1">
                <div className="text-xs text-gray-400">Intensity</div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-full ${
                        i < currentMood.intensity ? 'bg-gaming-accent' : 'bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mood History */}
        <div className="space-y-2">
          <div className="text-gray-300 text-sm">Recent Moods</div>
          {moodHistory.length > 0 ? (
            moodHistory.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getMoodEmoji(entry.mood)}</span>
                  <div>
                    <div className="text-sm text-white capitalize">{entry.mood}</div>
                    <div className="text-xs text-gray-400">{entry.gameTitle}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">{formatDate(entry.timestamp)}</div>
                  <div className="text-xs text-gaming-accent">Intensity {entry.intensity}/5</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-4">
              <span className="text-2xl">📊</span>
              <p className="text-sm mt-2">No mood history available</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
