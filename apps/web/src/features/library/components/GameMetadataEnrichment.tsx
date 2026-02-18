import React, { useState, useCallback } from 'react'
import type { Game } from '@gamepilot/types'
import { PageErrorBoundary } from '../../../components/ErrorBoundary'
import { Loading } from '../../../components/Loading'

interface GameMetadataEnrichmentProps {
  isOpen: boolean
  onClose: () => void
  game: Game | null
  onUpdateGame: (gameId: string, updates: Partial<Game>) => void
}

export const GameMetadataEnrichment: React.FC<GameMetadataEnrichmentProps> = ({ 
  isOpen, 
  onClose, 
  game, 
  onUpdateGame 
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'cover' | 'description' | 'screenshots'>('cover')
  
  const [formData, setFormData] = useState({
    coverImage: '',
    description: '',
    screenshots: [] as string[],
    developer: '',
    publisher: '',
    releaseDate: '',
    backgroundImages: [] as string[]
  })

  // Initialize form when game changes
  React.useEffect(() => {
    if (game) {
      setFormData({
        coverImage: game.coverImage || '',
        description: game.description || '',
        screenshots: game.backgroundImages?.slice(0, 4) || [],
        developer: game.developer || '',
        publisher: game.publisher || '',
        releaseDate: game.releaseDate ? new Date(game.releaseDate).toISOString().split('T')[0] : '',
        backgroundImages: game.backgroundImages || []
      })
    }
  }, [game])

  const handleSave = async () => {
    if (!game) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const updates: Partial<Game> = {
        coverImage: formData.coverImage || undefined,
        description: formData.description || undefined,
        backgroundImages: formData.backgroundImages.length > 0 ? formData.backgroundImages : undefined,
        developer: formData.developer || undefined,
        publisher: formData.publisher || undefined,
        releaseDate: formData.releaseDate ? new Date(formData.releaseDate) : undefined
      }

      await onUpdateGame(game.id, updates)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update game metadata')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUrlChange = useCallback((url: string) => {
    setFormData(prev => ({ ...prev, coverImage: url }))
  }, [])

  const handleImageUrlInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, coverImage: e.target.value }))
  }, [])

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, description: e.target.value }))
  }, [])

  const handleScreenshotAdd = useCallback(() => {
    const url = prompt('Enter screenshot URL:')
    if (url) {
      setFormData(prev => ({ 
        ...prev, 
        screenshots: [...prev.screenshots, url].slice(0, 10) 
      }))
    }
  }, [])

  const handleScreenshotRemove = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index)
    }))
  }, [])

  const handleDeveloperChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, developer: e.target.value }))
  }, [])

  const handlePublisherChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, publisher: e.target.value }))
  }, [])

  const handleReleaseDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, releaseDate: e.target.value }))
  }, [])

  const handleBackgroundImageAdd = useCallback(() => {
    const url = prompt('Enter background image URL:')
    if (url) {
      setFormData(prev => ({ 
        ...prev, 
        backgroundImages: [...prev.backgroundImages, url].slice(0, 5) 
      }))
    }
  }, [])

  const handleBackgroundImageRemove = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      backgroundImages: prev.backgroundImages.filter((_, i) => i !== index)
    }))
  }, [])

  if (!isOpen || !game) return null

  return (
    <PageErrorBoundary>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="glass-morphism rounded-xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Enhance Game Metadata</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10">
            {['cover', 'description', 'screenshots'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-gaming-primary border-b-2 border-gaming-primary'
                    : 'text-gray-400 hover:text-white border-b-2 border-transparent'
                }`}
              >
                {tab === 'cover' && '🖼️ Cover'}
                {tab === 'description' && '📝 Description'}
                {tab === 'screenshots' && '📸 Screenshots'}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="glass-morphism rounded-lg p-4 border border-red-500/30 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Cover Tab */}
            {activeTab === 'cover' && (
              <div className="space-y-6">
                {/* Current Cover */}
                <div>
                  <h4 className="text-white font-medium mb-3">Current Cover Image</h4>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 h-32 bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                      {game.coverImage ? (
                        <img 
                          src={game.coverImage} 
                          alt={game.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl">🎮</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <input
                        type="url"
                        value={formData.coverImage}
                        onChange={handleImageUrlInputChange}
                        placeholder="Enter cover image URL"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gaming-primary/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Cover Suggestions */}
                <div>
                  <h4 className="text-white font-medium mb-3">Quick Cover Sources</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={() => handleImageUrlChange(`https://cdn.akamai.steamstatic.com/steam/apps/${game.appId}/header.jpg`)}
                      className="p-3 glass-morphism rounded-lg border border-white/10 hover:border-gaming-primary/50 transition-colors text-left"
                    >
                      <div>
                        <div className="text-white font-medium">Steam Header</div>
                        <div className="text-xs text-gray-400">Official Steam store image</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handleImageUrlChange(`https://cdn.akamai.steamstatic.com/steam/apps/${game.appId}/library_600x900.jpg`)}
                      className="p-3 glass-morphism rounded-lg border border-white/10 hover:border-gaming-primary/50 transition-colors text-left"
                    >
                      <div>
                        <div className="text-white font-medium">Steam Library</div>
                        <div className="text-xs text-gray-400">600x900 library image</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-white font-medium mb-3">Game Description</h4>
                  <textarea
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    rows={6}
                    placeholder="Enter a detailed description of the game..."
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gaming-primary/50 resize-none"
                  />
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Developer</label>
                    <input
                      type="text"
                      value={formData.developer}
                      onChange={handleDeveloperChange}
                      placeholder="Game developer"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gaming-primary/50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Publisher</label>
                    <input
                      type="text"
                      value={formData.publisher}
                      onChange={handlePublisherChange}
                      placeholder="Game publisher"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gaming-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Release Date</label>
                  <input
                    type="date"
                    value={formData.releaseDate}
                    onChange={handleReleaseDateChange}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gaming-primary/50"
                  />
                </div>
              </div>
            )}

            {/* Screenshots Tab */}
            {activeTab === 'screenshots' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-white font-medium mb-3">Game Screenshots</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.screenshots.map((screenshot, index) => (
                      <div key={index} className="relative group">
                        <div className="w-full h-24 bg-gray-700 rounded-lg overflow-hidden">
                          <img 
                            src={screenshot} 
                            alt={`Screenshot ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <button
                          onClick={() => handleScreenshotRemove(index)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    
                    {formData.screenshots.length < 10 && (
                      <button
                        onClick={handleScreenshotAdd}
                        className="w-full h-24 bg-white/10 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center text-gray-400 hover:border-gaming-primary/50 hover:text-gaming-primary transition-colors"
                      >
                        <span className="text-2xl">+</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Background Images */}
                <div>
                  <h4 className="text-white font-medium mb-3">Background Images</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.backgroundImages.map((bgImage, index) => (
                      <div key={index} className="relative group">
                        <div className="w-full h-24 bg-gray-700 rounded-lg overflow-hidden">
                          <img 
                            src={bgImage} 
                            alt={`Background ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <button
                          onClick={() => handleBackgroundImageRemove(index)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    
                    {formData.backgroundImages.length < 5 && (
                      <button
                        onClick={handleBackgroundImageAdd}
                        className="w-full h-24 bg-white/10 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center text-gray-400 hover:border-gaming-primary/50 hover:text-gaming-primary transition-colors"
                      >
                        <span className="text-2xl">+</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
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
        </div>
      </div>
    </PageErrorBoundary>
  )
}
