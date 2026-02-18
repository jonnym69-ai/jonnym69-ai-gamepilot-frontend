import React, { useState, useEffect } from 'react'
import { UserGenre as UserGenreType, GENRES } from '../types'
import { LocalStorageService } from '../services/localStorage'

interface GenreSelectorProps {
  onGenresUpdate?: (genres: UserGenreType[]) => void
}

export const GenreSelector: React.FC<GenreSelectorProps> = ({ onGenresUpdate }) => {
  const [userGenres, setUserGenres] = useState<UserGenreType[]>([])
  const [customGenres, setCustomGenres] = useState<Omit<UserGenreType, 'preference'>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddGenre, setShowAddGenre] = useState(false)
  const [editingGenre, setEditingGenre] = useState<string | null>(null)

  const localStorageService = new LocalStorageService()
  const [newGenre, setNewGenre] = useState<Partial<Omit<UserGenreType, 'preference'>>>({
    id: '',
    name: '',
    tags: []
  })

  useEffect(() => {
    const loadGenres = () => {
      const savedGenres = localStorageService.getUserGenres()
      setUserGenres(savedGenres)
      
      // Load custom genres (those not in predefined GENRES)
      const custom = savedGenres.filter(genre => 
        !GENRES.find(predefined => predefined.id === genre.id)
      )
      setCustomGenres(custom.map(g => ({ id: g.id, name: g.name, tags: g.tags })))
      
      setIsLoading(false)
    }

    loadGenres()
  }, [])

  const handleGenreToggle = (genreId: string) => {
    let updatedGenres: UserGenreType[] = [...userGenres]
    
    const existingGenre = userGenres.find(g => g.id === genreId)
    
    if (existingGenre) {
      // Remove genre
      updatedGenres = userGenres.filter(g => g.id !== genreId)
    } else {
      // Add genre with default preference
      const genreTemplate = [...GENRES].find(g => g.id === genreId)
      if (genreTemplate) {
        const newGenre: UserGenreType = {
          ...genreTemplate,
          preference: 50 // Default preference
        }
        updatedGenres = [...userGenres, newGenre]
      } else {
        updatedGenres = userGenres
      }
    }
    
    setUserGenres(updatedGenres)
    localStorageService.setUserGenres(updatedGenres)
    onGenresUpdate?.(updatedGenres)
  }

  const handleAddCustomGenre = () => {
    if (!newGenre.name?.trim()) return
    
    const genre: Omit<UserGenreType, 'preference'> = {
      id: `custom-${Date.now()}`,
      name: newGenre.name.trim(),
      tags: newGenre.tags || []
    }
    
    setCustomGenres([...customGenres, genre])
    setNewGenre({ id: '', name: '', tags: [] })
    setShowAddGenre(false)
  }

  const handleUpdateCustomGenre = (genreId: string, updates: Partial<Omit<UserGenreType, 'preference'>>) => {
    setCustomGenres(customGenres.map(genre => 
      genre.id === genreId ? { ...genre, ...updates } : genre
    ))
    
    // Also update in userGenres if it's selected
    setUserGenres(userGenres.map(genre => 
      genre.id === genreId ? { ...genre, ...updates } : genre
    ))
  }

  const handleRemoveCustomGenre = (genreId: string) => {
    setCustomGenres(customGenres.filter(genre => genre.id !== genreId))
    
    // Also remove from userGenres if it's selected
    const updatedUserGenres = userGenres.filter(g => g.id !== genreId)
    setUserGenres(updatedUserGenres)
    localStorageService.setUserGenres(updatedUserGenres)
    onGenresUpdate?.(updatedUserGenres)
  }

  const handleReorderGenres = (fromIndex: number, toIndex: number) => {
    const reordered = [...userGenres]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, moved)
    
    setUserGenres(reordered)
    localStorageService.setUserGenres(reordered)
    onGenresUpdate?.(reordered)
  }

  const handlePreferenceChange = (genreId: string, preference: number) => {
    const updatedGenres = userGenres.map(genre =>
      genre.id === genreId ? { ...genre, preference } : genre
    )
    
    setUserGenres(updatedGenres)
    localStorageService.setUserGenres(updatedGenres)
    onGenresUpdate?.(updatedGenres)
  }

  const getPreferenceColor = (preference: number) => {
    if (preference >= 80) return 'from-green-500 to-emerald-600'
    if (preference >= 60) return 'from-blue-500 to-cyan-600'
    if (preference >= 40) return 'from-yellow-500 to-orange-600'
    return 'from-gray-500 to-gray-600'
  }

  const getPreferenceLabel = (preference: number) => {
    if (preference >= 80) return 'Love'
    if (preference >= 60) return 'Like'
    if (preference >= 40) return 'Neutral'
    return 'Dislike'
  }

  if (isLoading) {
    return (
      <div className="glass-morphism rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-xl mx-auto mb-4 flex items-center justify-center">
          <span className="text-3xl">🎭</span>
        </div>
        <p className="text-gray-400">Loading genres...</p>
      </div>
    )
  }

  return (
    <div className="glass-morphism rounded-xl p-6 cinematic-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
          <span>🎭</span>
          Favorite Genres
        </h2>
        <div className="text-sm text-gray-400">
          {userGenres.length} selected
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
        <p className="text-sm text-gray-300">
          Select your favorite game genres and rate your preference level. This helps us provide better recommendations.
        </p>
      </div>

      {/* Genre Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...GENRES, ...customGenres].map((genre) => {
          const userGenre = userGenres.find(g => g.id === genre.id)
          const isSelected = !!userGenre
          const preference = userGenre?.preference || 0
          const isCustom = customGenres.find(g => g.id === genre.id)

          return (
            <div
              key={genre.id}
              className={`
                relative group cursor-pointer transition-all duration-300 transform
                ${isSelected ? 'scale-105' : 'scale-100'}
                ${isSelected ? 'ring-2 ring-gaming-accent' : ''}
              `}
              onClick={() => handleGenreToggle(genre.id)}
            >
              <div className={`
                glass-morphism rounded-lg p-4 border-2 transition-all duration-200
                ${isSelected 
                  ? 'border-gaming-accent bg-gaming-accent/10' 
                  : 'border-gray-700 hover:border-gray-600'
                }
              `}>
                {/* Genre Icon/Emoji */}
                <div className={`
                  w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center text-2xl
                  bg-gradient-to-r ${isSelected ? getPreferenceColor(preference) : 'from-gray-500 to-gray-600'}
                `}>
                  {genre.id === 'action' && '⚔️'}
                  {genre.id === 'adventure' && '🗺️'}
                  {genre.id === 'rpg' && '🐉'}
                  {genre.id === 'strategy' && '♟️'}
                  {genre.id === 'simulation' && '🏗️'}
                  {genre.id === 'sports' && '⚽'}
                  {genre.id === 'racing' && '🏎️'}
                  {genre.id === 'puzzle' && '🧩'}
                  {genre.id === 'platformer' && '🦘'}
                  {genre.id === 'fps' && '🔫'}
                  {genre.id === 'moba' && '👥'}
                  {genre.id === 'roguelike' && '🎲'}
                  {genre.id === 'horror' && '👻'}
                  {genre.id === 'indie' && '🎨'}
                  {genre.id === 'casual' && '😊'}
                  {isCustom && '🎮'}
                </div>

                {/* Genre Name */}
                <h3 className="text-white font-medium text-sm text-center mb-2">
                  {genre.name}
                  {isCustom && (
                    <span className="ml-1 text-xs text-gaming-accent">Custom</span>
                  )}
                </h3>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 justify-center mb-3">
                  {genre.tags?.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-gray-700/50 text-gray-300 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Preference Slider (only show when selected) */}
                {isSelected && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Preference</span>
                      <span className={`font-medium ${getPreferenceColor(preference).split(' ')[0].replace('from-', 'text-')}`}>
                        {getPreferenceLabel(preference)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="10"
                      value={preference}
                      onChange={(e) => {
                        e.stopPropagation()
                        handlePreferenceChange(genre.id, parseInt(e.target.value))
                      }}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gaming-accent"
                      aria-label={`Preference level for ${genre.name} genre`}
                      title={`Preference level for ${genre.name} genre`}
                      style={{
                        background: `linear-gradient(to right, ${getPreferenceColor(preference).replace('from-', '').replace(' to-', ', ')}) 0%, ${getPreferenceColor(preference).replace('from-', '').replace(' to-', ', ')} ${preference}%, #374151 ${preference}%, #374151 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0</span>
                      <span>{preference}</span>
                      <span>100</span>
                    </div>
                  </div>
                )}

                {/* Selection Indicator */}
                <div className="absolute top-2 right-2">
                  {isSelected ? (
                    <div className="w-6 h-6 bg-gaming-accent rounded-full flex items-center justify-center text-white text-xs">
                      ✓
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-gray-400 text-xs">
                      +
                    </div>
                  )}
                </div>

                {/* Custom Genre Actions */}
                {isCustom && (
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingGenre(genre.id)
                      }}
                      className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs mr-1"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveCustomGenre(genre.id)
                      }}
                      className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* Glow effect when selected */}
              {isSelected && (
                <div className={`
                  absolute inset-0 rounded-lg bg-gradient-to-r ${getPreferenceColor(preference)}
                  opacity-20 blur-xl -z-10
                `} />
              )}
            </div>
          )
        })}
      </div>

      {/* Custom Genre Management Section */}
      <div className="mt-8 border-t border-gray-700 pt-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Custom Genres</h3>
          <button
            type="button"
            onClick={() => setShowAddGenre(true)}
            className="px-4 py-2 bg-gaming-accent text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            + Add Custom Genre
          </button>
        </div>

        {/* Add Custom Genre Form */}
        {showAddGenre && (
          <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h4 className="text-sm font-medium text-white mb-3">Add New Custom Genre</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={newGenre.name || ''}
                onChange={(e) => setNewGenre({ ...newGenre, name: e.target.value })}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                placeholder="Genre name"
                aria-label="New genre name"
                title="Enter name for new custom genre"
              />
              <input
                type="text"
                value={newGenre.tags?.join(', ') || ''}
                onChange={(e) => setNewGenre({ 
                  ...newGenre, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                })}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                placeholder="Tags (comma-separated)"
                aria-label="Tags for new genre"
                title="Enter tags for new custom genre"
              />
            </div>
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddGenre(false)
                  setNewGenre({ id: '', name: '', tags: [] })
                }}
                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCustomGenre}
                disabled={!newGenre.name?.trim()}
                className="px-3 py-1 bg-gaming-accent text-white rounded hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
              >
                Add Genre
              </button>
            </div>
          </div>
        )}

        {/* Edit Custom Genre Form */}
        {editingGenre && (
          <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h4 className="text-sm font-medium text-white mb-3">Edit Custom Genre</h4>
            {(() => {
              const genre = customGenres.find(g => g.id === editingGenre)
              if (!genre) return null
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={genre.name}
                    onChange={(e) => handleUpdateCustomGenre(genre.id, { name: e.target.value })}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    placeholder="Genre name"
                    aria-label={`Edit genre name for ${genre.name}`}
                    title={`Edit genre name for ${genre.name}`}
                  />
                  <input
                    type="text"
                    value={genre.tags?.join(', ') || ''}
                    onChange={(e) => handleUpdateCustomGenre(genre.id, { 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    })}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    placeholder="Tags (comma-separated)"
                    aria-label={`Edit tags for ${genre.name}`}
                    title={`Edit tags for ${genre.name}`}
                  />
                </div>
              )
            })()}
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => setEditingGenre(null)}
                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Selected Genres Reordering */}
        {userGenres.length > 1 && (
          <div className="mb-6">
            <h4 className="text-lg font-medium text-white mb-3">Reorder Selected Genres</h4>
            <div className="space-y-2">
              {userGenres.map((genre, index) => (
                <div key={genre.id} className="flex items-center gap-2 p-3 bg-gray-800/30 rounded-lg">
                  <span className="text-white font-medium flex-1">{genre.name}</span>
                  <div className="flex gap-1">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => handleReorderGenres(index, index - 1)}
                        className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 text-xs"
                      >
                        ↑
                      </button>
                    )}
                    {index < userGenres.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleReorderGenres(index, index + 1)}
                        className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 text-xs"
                      >
                        ↓
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      {userGenres.length > 0 && (
        <div className="mt-6 p-4 bg-gray-800/30 rounded-lg">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Your Genre Profile</h3>
          <div className="flex flex-wrap gap-2">
            {userGenres
              .sort((a, b) => b.preference - a.preference)
              .slice(0, 5)
              .map((genre) => (
                <span
                  key={genre.id}
                  className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    bg-gradient-to-r ${getPreferenceColor(genre.preference)} text-white
                  `}
                >
                  {genre.name} ({genre.preference}%)
                </span>
              ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Top genres influence your recommendations the most
          </p>
        </div>
      )}

      {/* Empty State */}
      {userGenres.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">
            No genres selected yet. Click on genres above to build your gaming profile.
          </p>
        </div>
      )}
    </div>
  )
}
