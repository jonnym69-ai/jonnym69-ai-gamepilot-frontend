import React, { useState, useEffect } from 'react'
import { UserPlaystyle, PLAYSTYLES, type PlaystyleIndicator } from '../types'
import { LocalStorageService } from '../services/localStorage'

interface PlaystyleIndicatorProps {
  onPlaystyleUpdate?: (playstyle: UserPlaystyle) => void
}

export const PlaystyleIndicatorComponent: React.FC<PlaystyleIndicatorProps> = ({ onPlaystyleUpdate }) => {
  const localStorageService = new LocalStorageService()
  const [playstyle, setPlaystyle] = useState<UserPlaystyle | null>(null)
  const [editForm, setEditForm] = useState<Partial<UserPlaystyle>>({})
  const [customPlaystyles, setCustomPlaystyles] = useState<PlaystyleIndicator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddPlaystyle, setShowAddPlaystyle] = useState(false)
  const [newPlaystyle, setNewPlaystyle] = useState<Partial<PlaystyleIndicator>>({
    id: '',
    name: '',
    description: '',
    icon: '🎮',
    color: 'from-gray-500 to-gray-600',
    traits: []
  })

  useEffect(() => {
    const loadPlaystyle = () => {
      const userPlaystyle = localStorageService.getUserPlaystyle()
      if (userPlaystyle) {
        setPlaystyle(userPlaystyle)
        setEditForm(userPlaystyle)
        setCustomPlaystyles(userPlaystyle.customPlaystyles || [])
      } else {
        // Initialize with default data
        const defaultPlaystyle = localStorageService.initializeDefaultData().playstyle
        setPlaystyle(defaultPlaystyle)
        setEditForm(defaultPlaystyle)
        setCustomPlaystyles(defaultPlaystyle.customPlaystyles || [])
      }
      setIsLoading(false)
    }

    loadPlaystyle()
  }, [])

  const handleSave = () => {
    if (!playstyle) return

    const updatedPlaystyle = {
      ...playstyle,
      ...editForm,
      preferences: { ...playstyle.preferences, ...editForm.preferences },
      customPlaystyles
    }
    localStorageService.setUserPlaystyle(updatedPlaystyle)
    setPlaystyle(updatedPlaystyle)
    setShowAddPlaystyle(false)
    onPlaystyleUpdate?.(updatedPlaystyle)
  }

  const handleReset = () => {
    const defaultPlaystyle = localStorageService.initializeDefaultData().playstyle
    setEditForm(defaultPlaystyle)
    localStorageService.setUserPlaystyle(defaultPlaystyle)
  }

  const handlePrimaryPlaystyleChange = (playstyleId: string) => {
    const allPlaystyles = [...PLAYSTYLES, ...customPlaystyles]
    const selectedPlaystyle = allPlaystyles.find(p => p.id === playstyleId)
    if (selectedPlaystyle) {
      setEditForm(prev => ({
        ...prev,
        primary: selectedPlaystyle
      }))
    }
  }

  const handleSecondaryPlaystyleChange = (playstyleId: string) => {
    if (playstyleId === 'none') {
      setEditForm(prev => ({
        ...prev,
        secondary: undefined
      }))
    } else {
      const allPlaystyles = [...PLAYSTYLES, ...customPlaystyles]
      const selectedPlaystyle = allPlaystyles.find(p => p.id === playstyleId)
      if (selectedPlaystyle) {
        setEditForm(prev => ({
          ...prev,
          secondary: selectedPlaystyle
        }))
      }
    }
  }

  const handleAddCustomPlaystyle = () => {
    if (!newPlaystyle.name?.trim()) return
    
    const customPlaystyle: PlaystyleIndicator = {
      id: `custom-${Date.now()}`,
      name: newPlaystyle.name.trim(),
      description: newPlaystyle.description || '',
      icon: newPlaystyle.icon || '🎮',
      color: newPlaystyle.color || 'from-gray-500 to-gray-600',
      traits: newPlaystyle.traits || []
    }
    
    const updatedCustomPlaystyles = [...customPlaystyles, customPlaystyle]
    setCustomPlaystyles(updatedCustomPlaystyles)
    setNewPlaystyle({
      id: '',
      name: '',
      description: '',
      icon: '🎮',
      color: 'from-gray-500 to-gray-600',
      traits: []
    })
    setShowAddPlaystyle(false)
  }

  const handlePreferenceChange = (key: string, value: any) => {
    setEditForm((prev: any) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }))
  }

  const handleRemoveCustomPlaystyle = (playstyleId: string) => {
    const updatedCustomPlaystyles = customPlaystyles.filter(ps => ps.id !== playstyleId)
    setCustomPlaystyles(updatedCustomPlaystyles)
  }

  const handleTraitToggle = (trait: string) => {
    const currentTraits = editForm.traits || playstyle?.traits || []
    const updatedTraits = currentTraits.includes(trait)
      ? currentTraits.filter((t: string) => t !== trait)
      : [...currentTraits, trait]
    
    setEditForm((prev: any) => ({
      ...prev,
      traits: updatedTraits
    }))
  }

  if (isLoading) {
    return (
      <div className="glass-morphism rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-xl mx-auto mb-4 flex items-center justify-center">
          <span className="text-3xl">🎯</span>
        </div>
        <p className="text-gray-400">Loading playstyle...</p>
      </div>
    )
  }

  if (!playstyle) {
    return (
      <div className="glass-morphism rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-xl mx-auto mb-4 flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>
        <p className="text-gray-400">Unable to load playstyle</p>
      </div>
    )
  }

  return (
    <div className="glass-morphism rounded-xl p-6 cinematic-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
          <span>🎯</span>
          Playstyle Profile
        </h2>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            title="Reset playstyle to default"
            aria-label="Reset playstyle to default"
          >
            Reset to Default
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-gradient-to-r from-gaming-primary to-gaming-secondary text-white rounded-lg hover:opacity-90 transition-opacity"
            title="Save playstyle changes"
            aria-label="Save playstyle changes"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Primary Playstyle Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Primary Playstyle</h3>
          <div className="grid grid-cols-2 gap-3">
            {[...PLAYSTYLES, ...customPlaystyles].map((style) => {
              const isCustom = customPlaystyles.find(ps => ps.id === style.id)
              return (
                <button
                  key={style.id}
                  onClick={() => handlePrimaryPlaystyleChange(style.id)}
                  className={`
                    relative group cursor-pointer transition-all duration-300 transform
                    ${editForm.primary?.id === style.id
                      ? 'scale-105 ring-2 ring-gaming-accent'
                      : 'scale-100 hover:scale-102'
                    }
                  `}
                  title={`Select ${style.name} as primary playstyle`}
                  aria-label={`Select ${style.name} as primary playstyle`}
                >
                  {isCustom && (
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveCustomPlaystyle(style.id)
                        }}
                        className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-700"
                        title={`Remove custom playstyle ${style.name}`}
                        aria-label={`Remove custom playstyle ${style.name}`}
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center text-xl
                      bg-gradient-to-r ${style.color}
                    `}>
                      {style.icon}
                    </div>
                    <span className="text-white font-medium">
                      {style.name}
                      {isCustom && (
                        <span className="ml-1 text-xs text-gaming-accent">Custom</span>
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{style.description}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Secondary Playstyle Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Secondary Playstyle (Optional)</h3>
          <div className="space-y-3">
            <button
              onClick={() => handleSecondaryPlaystyleChange('none')}
              className={`
                w-full p-3 rounded-lg border-2 transition-all duration-200 text-left
                ${!editForm.secondary
                  ? 'border-gaming-accent bg-gaming-accent/10'
                  : 'border-gray-700 hover:border-gray-600'
                }
              `}
              title="Select no secondary playstyle"
              aria-label="Select no secondary playstyle"
            >
              <span className="text-gray-400">No secondary playstyle</span>
            </button>
            {[...PLAYSTYLES, ...customPlaystyles]
              .filter(style => style.id !== editForm.primary?.id)
              .map((style) => {
                const isCustom = customPlaystyles.find(ps => ps.id === style.id)
                return (
                  <button
                    key={style.id}
                    onClick={() => handleSecondaryPlaystyleChange(style.id)}
                    className={`
                      w-full p-3 rounded-lg border-2 transition-all duration-200 text-left relative
                      ${editForm.secondary?.id === style.id
                        ? 'border-gaming-accent bg-gaming-accent/10'
                        : 'border-gray-700 hover:border-gray-600'
                      }
                    `}
                    title={`Select ${style.name} as secondary playstyle`}
                    aria-label={`Select ${style.name} as secondary playstyle`}
                  >
                    {isCustom && (
                      <div className="absolute top-2 right-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveCustomPlaystyle(style.id)
                          }}
                          className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-700"
                          title={`Remove custom playstyle ${style.name}`}
                          aria-label={`Remove custom playstyle ${style.name}`}
                        >
                          ×
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center text-sm
                        bg-gradient-to-r ${style.color}
                      `}>
                        {style.icon}
                      </div>
                      <div>
                        <span className="text-white font-medium">
                          {style.name}
                          {isCustom && (
                            <span className="ml-1 text-xs text-gaming-accent">Custom</span>
                          )}
                        </span>
                        <p className="text-xs text-gray-400">{style.description}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
          </div>
        </div>
      </div>

      {/* Playstyle Preferences */}
      <div className="mt-8 space-y-6">
        <h3 className="text-lg font-medium text-white">Gaming Preferences</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Session Length */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Session Length
            </label>
            <select
              value={editForm.preferences?.sessionLength || 'medium'}
              onChange={(e) => handlePreferenceChange('sessionLength', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-gaming-accent focus:outline-none"
            >
              <option value="short">⚡ Short (0-30 min)</option>
              <option value="medium">⏱️ Medium (30-90 min)</option>
              <option value="long">🕐 Long (90+ min)</option>
            </select>
          </div>

          {/* Difficulty Preference */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Difficulty Preference
            </label>
            <select
              value={editForm.preferences?.difficulty || 'normal'}
              onChange={(e) => handlePreferenceChange('difficulty', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-gaming-accent focus:outline-none"
            >
              <option value="casual">😌 Casual</option>
              <option value="normal">🎯 Normal</option>
              <option value="hard">💪 Hard</option>
              <option value="expert">🔥 Expert</option>
            </select>
          </div>

          {/* Social Preference */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Social Preference
            </label>
            <select
              value={editForm.preferences?.socialPreference || 'solo'}
              onChange={(e) => handlePreferenceChange('socialPreference', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-gaming-accent focus:outline-none"
            >
              <option value="solo">👤 Solo</option>
              <option value="cooperative">🤝 Cooperative</option>
              <option value="competitive">⚔️ Competitive</option>
            </select>
          </div>
        </div>

        {/* Focus Sliders */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-300">Focus Areas</h4>
          
          {/* Story Focus */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-300">Story Focus</label>
              <span className="text-sm text-white">{editForm.preferences?.storyFocus || 70}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={editForm.preferences?.storyFocus || 70}
              onChange={(e) => handlePreferenceChange('storyFocus', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gaming-accent"
            />
          </div>

          {/* Graphics Focus */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-300">Graphics Focus</label>
              <span className="text-sm text-white">{editForm.preferences?.graphicsFocus || 60}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={editForm.preferences?.graphicsFocus || 60}
              onChange={(e) => handlePreferenceChange('graphicsFocus', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gaming-accent"
            />
          </div>

          {/* Gameplay Focus */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-300">Gameplay Focus</label>
              <span className="text-sm text-white">{editForm.preferences?.gameplayFocus || 80}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={editForm.preferences?.gameplayFocus || 80}
              onChange={(e) => handlePreferenceChange('gameplayFocus', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gaming-accent"
            />
          </div>
        </div>

        {/* Personality Traits */}
        <div>
          <h4 className="text-md font-medium text-gray-300 mb-3">Personality Traits</h4>
          <div className="flex flex-wrap gap-2">
            {editForm.primary?.traits?.map((trait: string) => (
              <button
                key={trait}
                onClick={() => handleTraitToggle(trait)}
                className={`
                  px-3 py-1 rounded-full text-sm transition-all duration-200
                  ${(editForm.traits || []).includes(trait)
                    ? 'bg-gradient-to-r from-gaming-primary to-gaming-secondary text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }
                `}
              >
                {trait}
              </button>
            ))}
            {editForm.secondary?.traits?.map((trait: string) => (
              <button
                key={trait}
                onClick={() => handleTraitToggle(trait)}
                className={`
                  px-3 py-1 rounded-full text-sm transition-all duration-200
                  ${(editForm.traits || []).includes(trait)
                    ? 'bg-gradient-to-r from-gaming-primary to-gaming-secondary text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }
                `}
              >
                {trait}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Select traits that describe your gaming personality
          </p>
        </div>
      </div>

      {/* Playstyle Summary */}
      <div className="mt-8 p-4 bg-gray-800/30 rounded-lg">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Your Playstyle Profile</h4>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-2">
            <div className={`
              w-10 h-10 rounded-lg flex items-center justify-center
              bg-gradient-to-r ${editForm.primary?.color}
            `}>
              {editForm.primary?.icon}
            </div>
            <span className="text-white font-medium">{editForm.primary?.name}</span>
          </div>
          {editForm.secondary && (
            <>
              <span className="text-gray-500">+</span>
              <div className="flex items-center gap-2">
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  bg-gradient-to-r ${editForm.secondary.color}
                `}>
                  {editForm.secondary.icon}
                </div>
                <span className="text-white font-medium">{editForm.secondary.name}</span>
              </div>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {(editForm.traits || []).map((trait: string) => (
            <span
              key={trait}
              className="px-2 py-1 bg-gaming-primary/20 text-gaming-primary rounded text-xs"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>

      {/* Custom Playstyle Management Section */}
      <div className="mt-8 border-t border-gray-700 pt-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Custom Playstyles</h3>
          <button
            type="button"
            onClick={() => setShowAddPlaystyle(true)}
            className="px-4 py-2 bg-gaming-accent text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            + Add Custom Playstyle
          </button>
        </div>

        {/* Add Custom Playstyle Form */}
        {showAddPlaystyle && (
          <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h4 className="text-sm font-medium text-white mb-3">Add New Custom Playstyle</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={newPlaystyle.name}
                onChange={(e) => setNewPlaystyle({ ...newPlaystyle, name: e.target.value })}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                placeholder="Playstyle name"
              />
              <input
                type="text"
                value={newPlaystyle.description}
                onChange={(e) => setNewPlaystyle({ ...newPlaystyle, description: e.target.value })}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                placeholder="Description"
              />
              <input
                type="text"
                value={newPlaystyle.icon}
                onChange={(e) => setNewPlaystyle({ ...newPlaystyle, icon: e.target.value })}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                placeholder="Emoji"
                maxLength={2}
              />
              <select
                value={newPlaystyle.color}
                onChange={(e) => setNewPlaystyle({ ...newPlaystyle, color: e.target.value })}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
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
                value={newPlaystyle.traits?.join(', ') || ''}
                onChange={(e) => setNewPlaystyle({ 
                  ...newPlaystyle, 
                  traits: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                })}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm md:col-span-2"
                placeholder="Traits (comma-separated)"
              />
            </div>
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddPlaystyle(false)
                  setNewPlaystyle({
                    id: '',
                    name: '',
                    description: '',
                    icon: '🎮',
                    color: 'from-gray-500 to-gray-600',
                    traits: []
                  })
                }}
                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCustomPlaystyle}
                disabled={!newPlaystyle.name?.trim()}
                className="px-3 py-1 bg-gaming-accent text-white rounded hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
              >
                Add Playstyle
              </button>
            </div>
          </div>
        )}

        {/* Custom Playstyles List */}
        {customPlaystyles.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-medium text-white mb-3">Your Custom Playstyles</h4>
            <div className="space-y-2">
              {customPlaystyles.map((playstyle) => (
                <div key={playstyle.id} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    bg-gradient-to-r ${playstyle.color}
                  `}>
                    {playstyle.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">{playstyle.name}</div>
                    <div className="text-xs text-gray-400">{playstyle.description}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      // Edit functionality can be implemented later
                    }}
                    className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomPlaystyle(playstyle.id)}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
