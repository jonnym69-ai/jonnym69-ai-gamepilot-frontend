import React, { useState } from 'react'
import type { Game } from '@gamepilot/types'
import { PlatformCode } from '@gamepilot/types'
import { GOGGameSearchComponent } from './GOGGameSearch'
import { GOGAPI } from '../../../services/gogApi'
import { useToast } from '../../../components/ui/ToastProvider'
import { ErrorBoundaryWrapper } from '../../../components/ErrorBoundaryWrapper'
import { MultiSelectDropdown } from '../../../components/MultiSelectDropdown'
import { TagsDropdown } from '../../../components/TagsDropdown'
import { GENRES, MOODS } from '@gamepilot/static-data'

interface AddGameModalProps {
  isOpen: boolean
  onClose: () => void
  onAddGame: (game: Omit<Game, 'id'>) => void
}

export const AddGameModal: React.FC<AddGameModalProps> = ({ isOpen, onClose, onAddGame }) => {
  const { showSuccess, showError } = useToast()
  const [formData, setFormData] = useState({
    title: '',
    genres: [] as string[],
    moods: [] as string[],
    tags: [] as string[],
    platforms: [] as PlatformCode[],
    playStatus: 'backlog' as const,
    status: 'backlog' as const,
    coverImage: '',
    launcherId: ''
  })

  const [selectedPlatform, setSelectedPlatform] = useState<'manual' | 'steam' | 'gog'>('manual')

  const handleGOGGameSelect = (gogGame: any) => {
    const convertedGame = GOGAPI.convertGOGGameToGame(gogGame)
    setFormData({
      title: convertedGame.title || '',
      genres: convertedGame.genres?.map((g: any) => g.name) || [],
      moods: [],
      platforms: convertedGame.platforms || [],
      playStatus: 'backlog',
      status: 'backlog',
      tags: convertedGame.tags || [],
      coverImage: convertedGame.coverImage || '',
      launcherId: convertedGame.launcherId || ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const newGame: Omit<Game, 'id'> = {
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
          name: code.charAt(0).toUpperCase() + code.slice(1),
          code,
          isConnected: false
        })),
        playStatus: formData.playStatus,
        tags: formData.tags,
        coverImage: formData.coverImage || '',
        hoursPlayed: 0,
        userRating: undefined,
        achievements: { unlocked: 0, total: 0 },
        launcherId: formData.launcherId || undefined,
        addedAt: new Date(),
        releaseYear: new Date().getFullYear(),
        emotionalTags: formData.moods.map(mood => mood as any),
        moods: formData.moods as any[], // Add moods field with MoodId[]
        isFavorite: false,
        notes: '',
        globalRating: undefined,
        lastPlayed: undefined,
        totalPlaytime: 0,
        averageRating: undefined,
        completionPercentage: undefined
      }

      console.log('🎮 Adding game:', newGame)

      // Call the onAddGame callback to update local state
      onAddGame(newGame)
      showSuccess(`"${newGame.title}" added to your library`)
      onClose()

    } catch (error) {
      console.error('❌ Failed to add game:', error)
      // Show error toast to user
      showError('Failed to add game. Please try again.')
    }
  }

  const handlePlatformToggle = (platform: PlatformCode) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }))
  }

  if (!isOpen) return null

  return (
    <ErrorBoundaryWrapper>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="glass-morphism rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto cinematic-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Add New Game</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Add From Platform</label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value as 'manual' | 'steam' | 'gog')}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-gaming-accent focus:outline-none"
                  aria-label="Select platform to add game from"
                >
                  <option value="manual">📝 Manual Entry</option>
                  <option value="steam">🎮 Steam Search</option>
                  <option value="gog">🎯 GOG Search</option>
                </select>
              </div>

              {selectedPlatform === 'gog' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Search GOG Games</label>
                  <GOGGameSearchComponent 
                    onGameSelect={handleGOGGameSelect}
                    placeholder="Search GOG catalog..."
                  />
                </div>
              )}

              {selectedPlatform === 'steam' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Search Steam Games</label>
                  <div className="text-gray-400 text-sm p-3 bg-gray-800 rounded-lg">
                    Steam search coming soon! Use Steam Import for full library access.
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-gaming-accent focus:outline-none"
                  placeholder="Enter game title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Genres</label>
                <MultiSelectDropdown
                  options={GENRES.map(g => g.name)}
                  selected={formData.genres}
                  onChange={(genres) => setFormData(prev => ({ ...prev, genres }))}
                  placeholder="Select genres..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Moods</label>
                <div className="space-y-2">
                  {MOODS.map((mood) => (
                    <label key={mood.id} className="flex items-center space-x-2 text-gray-300 cursor-pointer hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.moods.includes(mood.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ ...prev, moods: [...prev.moods, mood.id] }))
                          } else {
                            setFormData(prev => ({ ...prev, moods: prev.moods.filter(m => m !== mood.id) }))
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

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Platforms</label>
                <div className="grid grid-cols-2 gap-2">
                  {['steam', 'epic', 'gog'].map((platform) => (
                    <label key={platform} className="flex items-center space-x-2 text-gray-300">
                      <input
                        type="checkbox"
                        checked={formData.platforms.includes(platform as PlatformCode)}
                        onChange={() => handlePlatformToggle(platform as PlatformCode)}
                        className="rounded border-gray-600 bg-gray-700 text-gaming-primary focus:ring-gaming-primary"
                      />
                      <span className="text-sm capitalize">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-gaming-accent focus:outline-none"
                  aria-label="Select game status"
                >
                  <option value="backlog">📚 Backlog</option>
                  <option value="playing">🎮 Playing</option>
                  <option value="completed">✅ Completed</option>
                  <option value="abandoned">🚫 Abandoned</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Launcher ID</label>
                <input
                  type="text"
                  value={formData.launcherId}
                  onChange={(e) => setFormData(prev => ({ ...prev, launcherId: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-gaming-accent focus:outline-none"
                  placeholder="Steam App ID, Epic Catalog ID, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                <TagsDropdown
                  selected={formData.tags}
                  onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
                  placeholder="Select or add tags..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Cover Image URL</label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-gaming-accent focus:outline-none"
                  placeholder="https://example.com/cover.jpg"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-gaming-primary to-gaming-secondary text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Add Game
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ErrorBoundaryWrapper>
  )
}
