import React, { useState, useEffect } from 'react'
import { UserMood as UserMoodType, MOODS } from '../types'
import { LocalStorageService } from '../services/localStorage'
import { getAllMoodDisplays, getMoodDisplay } from '../../../utils/moodDisplay'
import { saveMoodCustomization, removeMoodCustomization } from '../../../utils/preferences'
import { MASTER_MOODS } from '../../../constants/masterMoods'

interface MoodSelectorProps {
  onMoodsUpdate?: (moods: UserMoodType[]) => void
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({ onMoodsUpdate }) => {
  const [userMoods, setUserMoods] = useState<UserMoodType[]>([])
  const [customMoods, setCustomMoods] = useState<UserMoodType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddMood, setShowAddMood] = useState(false)
  const [editingMood, setEditingMood] = useState<string | null>(null)
  // Mood customization state
  const [customizingMood, setCustomizingMood] = useState<string | null>(null)
  const [customNames, setCustomNames] = useState<Record<string, string>>({})
  const [customEmojis, setCustomEmojis] = useState<Record<string, string>>({})
  const [customDescriptions, setCustomDescriptions] = useState<Record<string, string>>({})

  const localStorageService = new LocalStorageService()
  const [newMood, setNewMood] = useState<{
    id: string
    name: string
    emoji: string
    color: string
    frequency: number
    preference: number
    associatedGenres: string[]
  }>({
    id: '',
    name: '',
    emoji: '😊',
    color: 'from-gray-500 to-gray-600',
    frequency: 1,
    preference: 0,
    associatedGenres: []
  })

  useEffect(() => {
    const loadMoods = () => {
      const savedMoods = localStorageService.getUserMoods()
      setUserMoods(savedMoods)
      
      // Load custom moods (those not in predefined MOODS)
      const custom = savedMoods.filter(mood => 
        !MOODS.find(predefined => predefined.id === mood.id)
      )
      setCustomMoods(custom.map(m => ({ 
        id: m.id, 
        name: m.name, 
        emoji: m.emoji, 
        color: m.color, 
        frequency: m.frequency || 1, 
        preference: m.preference || 0,
        associatedGenres: m.associatedGenres || []
      })))
      
      setIsLoading(false)
    }

    loadMoods()
  }, [])

  const handleMoodToggle = (moodId: string) => {
    let updatedMoods: UserMoodType[] = [...userMoods]
    
    const existingMood = userMoods.find(m => m.id === moodId)
    
    if (existingMood) {
      // Remove mood
      updatedMoods = userMoods.filter(m => m.id !== moodId)
    } else {
      // Add mood with default preference
      const moodTemplate = [...MOODS].find(m => m.id === moodId)
      if (moodTemplate) {
        const newMood: UserMoodType = {
          ...moodTemplate,
          preference: 50, // Default preference
          frequency: 1 // Default frequency
        }
        updatedMoods = [...userMoods, newMood]
      } else {
        updatedMoods = userMoods
      }
    }
    
    setUserMoods(updatedMoods)
    localStorageService.setUserMoods(updatedMoods)
    localStorageService.setUserMoods(updatedMoods)
    localStorageService.setUserMoods(updatedMoods)
    localStorageService.setUserMoods(updatedMoods)
    localStorageService.setUserMoods(updatedMoods)
    onMoodsUpdate?.(updatedMoods)
  }

  const handleAddCustomMood = () => {
    if (!newMood.name?.trim()) return
    
        const newMoodObj: UserMoodType = {
          id: `custom-${Date.now()}`,
          name: newMood.name.trim(),
          emoji: newMood.emoji || '😊',
          color: newMood.color || 'from-gray-500 to-gray-600',
          frequency: 1,
          preference: 0,
          associatedGenres: newMood.associatedGenres || []
        }
    
    setCustomMoods([...customMoods, newMoodObj])
    setNewMood({ id: '', name: '', emoji: '😊', color: 'from-gray-500 to-gray-600', frequency: 1, preference: 0, associatedGenres: [] })
    setShowAddMood(false)
    setUserMoods([...userMoods, newMoodObj])
    localStorageService.setUserMoods([...userMoods, newMoodObj])
  }

  const handleUpdateCustomMood = (moodId: string, updates: Partial<UserMoodType>) => {
    setCustomMoods(customMoods.map(m => 
      m.id === moodId ? { ...m, ...updates } : m
    ))
    
    // Also update in userMoods if it's selected
    setUserMoods(userMoods.map(m => 
      m.id === moodId ? { ...m, ...updates } : m
    ))
    localStorageService.setUserMoods(userMoods)
    localStorageService.setUserMoods(userMoods)
    localStorageService.setUserMoods(userMoods)
    localStorageService.setUserMoods(userMoods)
    localStorageService.setUserMoods(userMoods)
    onMoodsUpdate?.(userMoods)
  }

  const handleRemoveCustomMood = (moodId: string) => {
    setCustomMoods(customMoods.filter(m => m.id !== moodId))
    
    // Also remove from userMoods if it's selected
    const updatedUserMoods = userMoods.filter(m => m.id !== moodId)
    setUserMoods(updatedUserMoods)
    localStorageService.setUserMoods(updatedUserMoods)
    localStorageService.setUserMoods(updatedUserMoods)
    localStorageService.setUserMoods(updatedUserMoods)
    localStorageService.setUserMoods(updatedUserMoods)
    onMoodsUpdate?.(updatedUserMoods)
  }

  const handleReorderMoods = (fromIndex: number, toIndex: number) => {
    const reordered = [...userMoods]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, moved)
    
    setUserMoods(reordered)
    localStorageService.setUserMoods(reordered)
    onMoodsUpdate?.(reordered)
  }

  const handlePreferenceChange = (moodId: string, preference: number) => {
    const updatedMoods = userMoods.map(mood =>
      mood.id === moodId ? { ...mood, preference } : mood
    )
    
    setUserMoods(updatedMoods)
    localStorageService.setUserMoods(updatedMoods)
    onMoodsUpdate?.(updatedMoods)
  }

  const handleFrequencyChange = (moodId: string, frequency: number) => {
    const updatedMoods = userMoods.map(mood =>
      mood.id === moodId ? { ...mood, frequency } : mood
    )
    
    setUserMoods(updatedMoods)
    localStorageService.setUserMoods(updatedMoods)
    onMoodsUpdate?.(updatedMoods)
  }

  // Mood customization functions
  const startCustomizing = (moodId: string) => {
    const display = getMoodDisplay(moodId)
    setCustomNames(prev => ({ ...prev, [moodId]: display.name }))
    setCustomEmojis(prev => ({ ...prev, [moodId]: display.emoji }))
    setCustomDescriptions(prev => ({ ...prev, [moodId]: display.description }))
    setCustomizingMood(moodId)
  }

  const saveCustomization = (moodId: string) => {
    const customName = customNames[moodId]?.trim()
    const customEmoji = customEmojis[moodId]?.trim()
    const customDescription = customDescriptions[moodId]?.trim()

    if (customName || customEmoji || customDescription) {
      saveMoodCustomization(moodId, {
        ...(customName && { name: customName }),
        ...(customEmoji && { emoji: customEmoji }),
        ...(customDescription && { description: customDescription })
      })
    }
    setCustomizingMood(null)
  }

  const cancelCustomizing = (moodId: string) => {
    setCustomNames(prev => {
      const { [moodId]: removed, ...rest } = prev
      return rest
    })
    setCustomEmojis(prev => {
      const { [moodId]: removed, ...rest } = prev
      return rest
    })
    setCustomDescriptions(prev => {
      const { [moodId]: removed, ...rest } = prev
      return rest
    })
    setCustomizingMood(null)
  }

  const resetMoodToDefault = (moodId: string) => {
    removeMoodCustomization(moodId)
    cancelCustomizing(moodId)
  }

  const resetAllCustomizations = () => {
    if (confirm('Are you sure you want to reset all mood customizations to defaults?')) {
      MASTER_MOODS.forEach(mood => {
        removeMoodCustomization(mood.id)
      })
      setCustomNames({})
      setCustomEmojis({})
      setCustomDescriptions({})
      setCustomizingMood(null)
    }
  }

  const getPreferenceColor = (preference: number) => {
    if (preference >= 80) return 'from-purple-500 to-pink-600'
    if (preference >= 60) return 'from-blue-500 to-cyan-600'
    if (preference >= 40) return 'from-green-500 to-teal-600'
    return 'from-gray-500 to-gray-600'
  }

  const getPreferenceLabel = (preference: number) => {
    if (preference >= 80) return 'Love'
    if (preference >= 60) return 'Like'
    if (preference >= 40) return 'Sometimes'
    return 'Rarely'
  }

  const getFrequencyLabel = (frequency: number) => {
    if (frequency >= 5) return 'Very Often'
    if (frequency >= 3) return 'Often'
    if (frequency >= 1) return 'Sometimes'
    return 'Rarely'
  }

  if (isLoading) {
    return (
      <div className="glass-morphism rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-xl mx-auto mb-4 flex items-center justify-center">
          <span className="text-3xl">😊</span>
        </div>
        <p className="text-gray-400">Loading moods...</p>
      </div>
    )
  }

  return (
    <div className="glass-morphism rounded-xl p-6 cinematic-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
          <span>😊</span>
          Gaming Moods
        </h2>
        <div className="text-sm text-gray-400">
          {userMoods.length} selected
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
        <p className="text-sm text-gray-300">
          Select the moods you experience while gaming. This helps us recommend games that match your emotional state.
        </p>
      </div>

      {/* Mood Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...MOODS, ...customMoods].map((mood) => {
          const userMood = userMoods.find(m => m.id === mood.id)
          const isSelected = !!userMood
          const preference = userMood?.preference || 0
          const frequency = userMood?.frequency || 0
          const isCustom = customMoods.find(m => m.id === mood.id)

          return (
            <div
              key={mood.id}
              className={`
                relative group cursor-pointer transition-all duration-300 transform
                ${isSelected ? 'scale-105' : 'scale-100'}
                ${isSelected ? 'ring-2 ring-gaming-accent' : ''}
              `}
              onClick={() => handleMoodToggle(mood.id)}
            >
              <div className={`
                glass-morphism rounded-lg p-4 border-2 transition-all duration-200
                ${isSelected 
                  ? 'border-gaming-accent bg-gaming-accent/10' 
                  : 'border-gray-700 hover:border-gray-600'
                }
              `}>
                {/* Mood Emoji */}
                <div className={`
                  w-16 h-16 rounded-xl mx-auto mb-3 flex items-center justify-center text-3xl
                  bg-gradient-to-r ${isSelected ? getPreferenceColor(preference) : mood.color}
                `}>
                  {mood.emoji}
                </div>

                {/* Mood Name */}
                <h3 className="text-white font-medium text-sm text-center mb-2">
                  {mood.name}
                  {isCustom && (
                    <span className="ml-1 text-xs text-gaming-accent">Custom</span>
                  )}
                </h3>

                {/* Controls (only show when selected) */}
                {isSelected && (
                  <div className="mt-3 space-y-3">
                    {/* Preference Slider */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
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
                          handlePreferenceChange(mood.id, parseInt(e.target.value))
                        }}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gaming-accent"
                        aria-label={`Preference level for ${mood.name} mood`}
                        title={`Preference level for ${mood.name} mood`}
                        style={{
                          background: `linear-gradient(to right, ${getPreferenceColor(preference).replace('from-', '').replace(' to-', ', ')}) 0%, ${getPreferenceColor(preference).replace('from-', '').replace(' to-', ', ')} ${preference}%, #374151 ${preference}%, #374151 100%)`
                        }}
                      />
                    </div>

                    {/* Frequency Selector */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400">Frequency</span>
                        <span className="text-gray-300">
                          {getFrequencyLabel(frequency)}
                        </span>
                      </div>
                      <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFrequencyChange(mood.id, level)
                        }}
                        className={`
                          flex-1 h-6 rounded text-xs font-medium transition-colors
                          ${frequency >= level
                            ? 'bg-gradient-to-r from-gaming-primary to-gaming-secondary text-white'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                          }
                        `}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Selection Indicator */}
            <div className="absolute top-2 right-2 flex gap-1">
              {isSelected ? (
                <div className="w-6 h-6 bg-gaming-accent rounded-full flex items-center justify-center text-white text-xs">
                  ✓
                </div>
              ) : (
                <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-gray-400 text-xs">
                  +
                </div>
              )}
              {/* Customize button - only show for selected moods */}
              {isSelected && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    startCustomizing(mood.id)
                  }}
                  className="w-6 h-6 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  title={`Customize ${mood.name} display`}
                >
                  🎨
                </button>
              )}
            </div>

            {/* Custom Mood Actions */}
            {isCustom && (
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingMood(mood.id)
                  }}
                  className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs mr-1"
                >
                  ✏️
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveCustomMood(mood.id)
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

  {/* Mood Customization Section */}
  {customizingMood && (
    <div className="mt-8 border-t border-gray-700 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-3">
          <span>🎨</span>
          Customize Mood Display
        </h3>
        <button
          onClick={resetAllCustomizations}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
        >
          Reset All
        </button>
      </div>

      <div className="space-y-4">
        {(() => {
          const mood = getAllMoodDisplays().find(m => m.id === customizingMood)
          if (!mood) return null

          return (
            <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl">{mood.emoji}</span>
                <div>
                  <h4 className="text-lg font-medium text-white">{mood.name}</h4>
                  <p className="text-sm text-gray-400">{mood.description}</p>
                  {mood.isCustom && <span className="text-xs text-gaming-primary">(Custom)</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={customNames[customizingMood] || ''}
                    onChange={(e) => setCustomNames(prev => ({ ...prev, [customizingMood]: e.target.value }))}
                    placeholder={MASTER_MOODS.find(m => m.id === customizingMood)?.name}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-gaming-accent focus:outline-none"
                    maxLength={30}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Emoji
                  </label>
                  <input
                    type="text"
                    value={customEmojis[customizingMood] || ''}
                    onChange={(e) => setCustomEmojis(prev => ({ ...prev, [customizingMood]: e.target.value }))}
                    placeholder={MASTER_MOODS.find(m => m.id === customizingMood)?.emoji}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-gaming-accent focus:outline-none"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={customDescriptions[customizingMood] || ''}
                    onChange={(e) => setCustomDescriptions(prev => ({ ...prev, [customizingMood]: e.target.value }))}
                    placeholder={MASTER_MOODS.find(m => m.id === customizingMood)?.description}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-gaming-accent focus:outline-none"
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => saveCustomization(customizingMood)}
                  className="px-4 py-2 bg-gaming-primary hover:bg-gaming-primary/80 text-white rounded-lg transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => cancelCustomizing(customizingMood)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => resetMoodToDefault(customizingMood)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors ml-auto"
                >
                  Reset to Default
                </button>
              </div>
            </div>
          )
        })()}
      </div>

      <div className="mt-4 p-3 bg-gaming-surface/50 border border-gaming-border rounded-lg">
        <p className="text-sm text-gaming-text-muted">
          💡 <strong>Tip:</strong> Customize mood names and emojis to make them more personal to you!
          The underlying mood categories remain the same - only the display changes.
        </p>
      </div>
    </div>
  )}

  {/* Custom Mood Management Section */}
  <div className="mt-8 border-t border-gray-700 pt-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-semibold text-white">Custom Moods</h3>
      <button
        type="button"
        onClick={() => setShowAddMood(true)}
        className="px-4 py-2 bg-gaming-accent text-white rounded-lg hover:opacity-90 transition-opacity"
      >
        + Add Custom Mood
      </button>
    </div>

    {/* Add Custom Mood Form */}
    {showAddMood && (
      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <h4 className="text-sm font-medium text-white mb-3">Add New Custom Mood</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <input
            type="text"
            value={newMood.name}
            onChange={(e) => setNewMood({ ...newMood, name: e.target.value })}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            placeholder="Mood name"
            aria-label="New mood name"
            title="Enter name for new custom mood"
          />
          <input
            type="text"
            value={newMood.emoji}
            onChange={(e) => setNewMood({ ...newMood, emoji: e.target.value })}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            placeholder="Emoji"
            maxLength={2}
            aria-label="New mood emoji"
            title="Enter emoji for new custom mood"
          />
          <select
            value={newMood.color}
            onChange={(e) => setNewMood({ ...newMood, color: e.target.value })}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            aria-label="New mood color"
          >
            <option value="from-gray-500 to-gray-600">Gray</option>
            <option value="from-red-500 to-rose-600">Red</option>
            <option value="from-orange-500 to-amber-600">Orange</option>
            <option value="from-yellow-500 to-lime-600">Yellow</option>
            <option value="from-green-500 to-emerald-600">Green</option>
            <option value="from-blue-500 to-indigo-600">Blue</option>
            <option value="from-purple-500 to-pink-600">Purple</option>
            <option value="from-teal-500 to-cyan-600">Teal</option>
          </select>
          <input
            type="text"
            value={newMood.associatedGenres.join(', ')}
            onChange={(e) => setNewMood({ 
              ...newMood, 
              associatedGenres: e.target.value.split(',').map(g => g.trim()).filter(g => g)
            })}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm lg:col-span-3"
            placeholder="Associated genres (comma separated)"
            aria-label="Associated genres for new mood"
            title="Enter associated genres for new custom mood"
          />
        </div>
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={() => {
              setShowAddMood(false)
              setNewMood({ id: '', name: '', emoji: '😊', color: 'from-gray-500 to-gray-600', frequency: 1, preference: 0, associatedGenres: [] })
            }}
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAddCustomMood}
            disabled={!newMood.name?.trim()}
            className="px-3 py-1 bg-gaming-accent text-white rounded hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
          >
            Add Mood
          </button>
        </div>
      </div>
    )}

    {/* Edit Custom Mood Form */}
    {editingMood && (
      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <h4 className="text-sm font-medium text-white mb-3">Edit Custom Mood</h4>
        {(() => {
          const mood = customMoods.find(m => m.id === editingMood)
          if (!mood) return null
          
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <input
                type="text"
                value={mood.name}
                onChange={(e) => handleUpdateCustomMood(mood.id, { name: e.target.value })}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                placeholder="Mood name"
                aria-label={`Edit mood name for ${mood.name}`}
                title={`Edit mood name for ${mood.name}`}
              />
              <input
                type="text"
                value={mood.emoji}
                onChange={(e) => handleUpdateCustomMood(mood.id, { emoji: e.target.value })}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                placeholder="Emoji"
                maxLength={2}
                aria-label={`Edit mood emoji for ${mood.name}`}
                title={`Edit mood emoji for ${mood.name}`}
              />
              <select
                value={mood.color}
                onChange={(e) => handleUpdateCustomMood(mood.id, { color: e.target.value })}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                aria-label={`Edit color for ${mood.name} mood`}
              >
                <option value="from-gray-500 to-gray-600">Gray</option>
                <option value="from-red-500 to-rose-600">Red</option>
                <option value="from-orange-500 to-amber-600">Orange</option>
                <option value="from-yellow-500 to-lime-600">Yellow</option>
                <option value="from-green-500 to-emerald-600">Green</option>
                <option value="from-blue-500 to-indigo-600">Blue</option>
                <option value="from-purple-500 to-pink-600">Purple</option>
                <option value="from-teal-500 to-cyan-600">Teal</option>
              </select>
              <input
                type="text"
                value={mood.associatedGenres.join(', ')}
                onChange={(e) => handleUpdateCustomMood(mood.id, { 
                  associatedGenres: e.target.value.split(',').map(g => g.trim()).filter(Boolean)
                })}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm lg:col-span-3"
                placeholder="Associated genres (comma-separated)"
                aria-label={`Edit associated genres for ${mood.name}`}
                title={`Edit associated genres for ${mood.name}`}
              />
            </div>
          )
        })()}
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={() => setEditingMood(null)}
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
          >
            Done
          </button>
        </div>
      </div>
    )}

    {/* Selected Moods Reordering */}
    {userMoods.length > 1 && (
      <div className="mb-6">
        <h4 className="text-lg font-medium text-white mb-3">Reorder Selected Moods</h4>
        <div className="space-y-2">
          {userMoods.map((mood, index) => (
            <div key={mood.id} className="flex items-center gap-2 p-3 bg-gray-800/30 rounded-lg">
              <span className="text-2xl">{mood.emoji}</span>
              <span className="text-white font-medium flex-1">{mood.name}</span>
              <div className="flex gap-1">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleReorderMoods(index, index - 1)}
                    className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 text-xs"
                  >
                    ↑
                  </button>
                )}
                {index < userMoods.length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleReorderMoods(index, index + 1)}
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

  {/* Mood Profile Summary */}
  {userMoods.length > 0 && (
    <div className="mt-6 p-4 bg-gray-800/30 rounded-lg">
      <h3 className="text-sm font-medium text-gray-300 mb-3">Your Mood Profile</h3>
      
      {/* Top Moods */}
      <div className="flex flex-wrap gap-2 mb-3">
        {userMoods
          .sort((a, b) => (b.preference * b.frequency) - (a.preference * a.frequency))
          .slice(0, 5)
          .map((mood) => (
            <span
              key={mood.id}
              className={`
                px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1
                bg-gradient-to-r ${getPreferenceColor(mood.preference)} text-white
              `}
            >
              <span>{mood.emoji}</span>
              {mood.name}
            </span>
          ))}
      </div>

      {/* Mood Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="text-center">
          <div className="text-gray-400">Most Frequent</div>
          <div className="text-white font-medium">
            {userMoods.reduce((max, mood) => mood.frequency > max.frequency ? mood : max).emoji} {
              userMoods.reduce((max, mood) => mood.frequency > max.frequency ? mood : max).name
            }
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Highest Preference</div>
          <div className="text-white font-medium">
            {userMoods.reduce((max, mood) => mood.preference > max.preference ? mood : max).emoji} {
              userMoods.reduce((max, mood) => mood.preference > max.preference ? mood : max).name
            }
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Avg Preference</div>
          <div className="text-white font-medium">
            {Math.round(userMoods.reduce((sum, mood) => sum + mood.preference, 0) / userMoods.length)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Total Moods</div>
          <div className="text-white font-medium">{userMoods.length}</div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Your mood preferences help us suggest the perfect games for how you're feeling
      </p>
    </div>
  )}

  {/* Empty State */}
  {userMoods.length === 0 && (
    <div className="text-center py-8">
      <p className="text-gray-400">
        No moods selected yet. Click on moods above to tell us how you like to feel while gaming.
      </p>
    </div>
  )}
</div>
)
}
