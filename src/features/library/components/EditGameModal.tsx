import React, { useState, useEffect } from 'react'
import type { Game } from '@gamepilot/types'
import { PlatformCode } from '@gamepilot/types'
import { PageErrorBoundary } from '../../../components/ErrorBoundary'
import { Loading } from '../../../components/Loading'
import { MultiSelectDropdown } from '../../../components/MultiSelectDropdown'
import { TagsDropdown } from '../../../components/TagsDropdown'
import { GENRES, MOODS } from '@gamepilot/static-data'

interface EditGameModalProps {
  isOpen: boolean
  onClose: () => void
  game: Game | null
  onUpdateGame: (gameId: string, updates: Partial<Game>) => void
}

export const EditGameModal: React.FC<EditGameModalProps> = ({ isOpen, onClose, game, onUpdateGame }) => {
  const [formData, setFormData] = useState({
    title: '',
    genres: [] as string[],
    moods: [] as string[],
    tags: [] as string[],
    platforms: [] as PlatformCode[],
    playStatus: 'unplayed',
    hoursPlayed: 0,
    userRating: undefined,
    notes: '',
    coverImage: '',
    launcherId: '',
    isFavorite: false,
    totalPlaytime: undefined,
    averageRating: undefined,
    completionPercentage: undefined
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Populate form when game changes
  useEffect(() => {
    if (game) {
      setFormData({
        title: game.title || '',
        genres: game.genres?.map((g: any) => g.name) || [],
        moods: game.moods || [], // Use game.moods directly as MoodId[]
        platforms: game.platforms?.map(p => p.code) || [],
        playStatus: game.playStatus || 'unplayed',
        tags: game.tags || [],
        hoursPlayed: game.hoursPlayed || 0,
        userRating: (game as any).userRating || undefined,
        notes: game.notes || '',
        coverImage: game.coverImage || '',
        launcherId: game.launcherId || '',
        isFavorite: game.isFavorite || false,
        totalPlaytime: (game as any).totalPlaytime || undefined,
        averageRating: (game as any).averageRating || undefined,
        completionPercentage: (game as any).completionPercentage || undefined
      })
    }
  }, [game])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!game) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const updates: Partial<Game> = {
        title: formData.title,
        genres: formData.genres.map(name => ({
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name,
          description: `${name} games`,
          icon: '🎮',
          color: '#' + Math.floor(Math.random()*16777215).toString(16),
          tags: [name.toLowerCase()]
        })),
        platforms: formData.platforms.map(code => ({
          id: code,
          name: code,
          code,
          isConnected: false
        })),
        playStatus: formData.playStatus as any,
        tags: formData.tags,
        hoursPlayed: formData.hoursPlayed,
        userRating: formData.userRating || 0,
        notes: formData.notes,
        isFavorite: formData.isFavorite,
        emotionalTags: formData.moods.map(mood => mood as any),
        moods: formData.moods as any[] // Add moods field with MoodId[]
      }

      await onUpdateGame(game.id, updates)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update game')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isOpen || !game) return null

  return (
    <PageErrorBoundary>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="glass-morphism rounded-xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Edit Game</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="glass-morphism rounded-lg p-4 border border-red-500/30">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gaming-primary/50"
                placeholder="Enter game title"
                required
              />
            </div>

            {/* Genres */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Genres
              </label>
              <MultiSelectDropdown
                options={GENRES.map(g => g.name)}
                selected={formData.genres}
                onChange={(genres) => handleInputChange('genres', genres)}
                placeholder="Select genres..."
              />
            </div>

            {/* Moods */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Moods
              </label>
              <div className="space-y-2">
                {MOODS.map((mood) => (
                  <label key={mood.id} className="flex items-center space-x-2 text-gray-300 cursor-pointer hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.moods.includes(mood.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleInputChange('moods', [...formData.moods, mood.id])
                        } else {
                          handleInputChange('moods', formData.moods.filter(m => m !== mood.id))
                        }
                      }}
                      className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span>{mood.name}</span>
                    <span className="text-gray-500 text-sm">{mood.emoji}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Platforms */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Platforms
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['steam', 'epic', 'gog', 'manual'].map((platform) => (
                  <label key={platform} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.platforms.includes(platform as PlatformCode)}
                      onChange={(e) => {
                        const platforms = e.target.checked 
                          ? [...formData.platforms, platform as PlatformCode]
                          : formData.platforms.filter(p => p !== platform)
                        handleInputChange('platforms', platforms)
                      }}
                      className="rounded border-white/20 bg-white/10 text-gaming-primary focus:ring-gaming-primary/50"
                    />
                    <span className="text-sm text-gray-300 capitalize">{platform}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Play Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Play Status
              </label>
              <select
                value={formData.playStatus}
                onChange={(e) => handleInputChange('playStatus', e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gaming-primary/50"
                aria-label="Select game play status"
              >
                <option value="unplayed">Unplayed</option>
                <option value="playing">Playing</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
                <option value="abandoned">Abandoned</option>
              </select>
            </div>

            {/* Hours Played */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hours Played
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.hoursPlayed}
                onChange={(e) => handleInputChange('hoursPlayed', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gaming-primary/50"
                placeholder="0"
              />
            </div>

            {/* User Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Rating
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleInputChange('userRating', rating)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.userRating && formData.userRating >= rating
                        ? 'border-gaming-primary bg-gaming-primary text-white'
                        : 'border-white/20 bg-white/10 text-gray-400 hover:border-gaming-primary/50'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags
              </label>
              <TagsDropdown
                selected={formData.tags}
                onChange={(tags) => handleInputChange('tags', tags)}
                placeholder="Select or add tags..."
              />
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cover Image URL
              </label>
              <input
                type="url"
                value={formData.coverImage}
                onChange={(e) => handleInputChange('coverImage', e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gaming-primary/50"
                placeholder="https://example.com/cover.jpg"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gaming-primary/50 resize-none"
                placeholder="Your thoughts about this game..."
              />
            </div>

            {/* Favorite */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isFavorite"
                checked={formData.isFavorite}
                onChange={(e) => handleInputChange('isFavorite', e.target.checked)}
                className="rounded border-white/20 bg-white/10 text-gaming-primary focus:ring-gaming-primary/50"
              />
              <label htmlFor="isFavorite" className="text-sm text-gray-300 cursor-pointer">
                Mark as Favorite
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.title.trim()}
                className="px-6 py-2 bg-gaming-primary text-white rounded-lg hover:bg-gaming-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loading message="" size="sm" />
                    Saving...
                  </>
                ) : (
                  <>
                    💾
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageErrorBoundary>
  )
}
