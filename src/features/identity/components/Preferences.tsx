import React, { useState, useEffect } from 'react'
import { UserPreferences as UserPreferencesType, CustomPreferenceItem } from '../types'
import { LocalStorageService } from '../services/localStorage'

interface PreferencesProps {
  onPreferencesUpdate?: (preferences: UserPreferencesType) => void
}

export const Preferences: React.FC<PreferencesProps> = ({ onPreferencesUpdate }) => {
  const localStorageService = new LocalStorageService()
  const [preferences, setPreferences] = useState<UserPreferencesType | null>(null)
  const [editForm, setEditForm] = useState<Partial<UserPreferencesType>>({})
  const [customItems, setCustomItems] = useState<CustomPreferenceItem[]>([])
  const [showAddCustomItem, setShowAddCustomItem] = useState(false)
  const [newCustomItem, setNewCustomItem] = useState<Partial<CustomPreferenceItem>>({
    name: '',
    value: '',
    type: 'text',
    category: 'general',
    order: 0,
    isPublic: false,
    options: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPreferences = () => {
      const userPreferences = localStorageService.getUserPreferences()
      if (userPreferences) {
        setPreferences(userPreferences)
        setEditForm(userPreferences)
        setCustomItems(userPreferences.customItems || [])
      } else {
        // Initialize with default data
        const defaultPreferences = localStorageService.initializeDefaultData().preferences
        setPreferences(defaultPreferences)
        setEditForm(defaultPreferences)
        setCustomItems(defaultPreferences.customItems || [])
      }
      setIsLoading(false)
    }

    loadPreferences()
  }, [])

  const handleSave = () => {
    if (!preferences) return

    const updatedPreferences = {
      ...preferences,
      ...editForm,
      notifications: { ...preferences.notifications, ...editForm.notifications },
      privacy: { ...preferences.privacy, ...editForm.privacy },
      display: { ...preferences.display, ...editForm.display },
      customItems
    }
    localStorageService.setUserPreferences(updatedPreferences)
    setPreferences(updatedPreferences)
    setShowAddCustomItem(false)
    onPreferencesUpdate?.(updatedPreferences)
  }

  const handleReset = () => {
    const defaultPreferences = localStorageService.initializeDefaultData().preferences
    setEditForm(defaultPreferences)
  }

  const handleInputChange = (section: keyof UserPreferencesType, field: string, value: any) => {
    if (section === 'notifications' || section === 'privacy' || section === 'display') {
      setEditForm(prev => ({
        ...prev,
        [section]: {
          ...(prev[section] as any),
          [field]: value
        }
      }))
    } else {
      setEditForm(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleAddCustomItem = () => {
    if (!newCustomItem.name?.trim()) return
    
    const item: CustomPreferenceItem = {
      id: `custom-${Date.now()}`,
      name: newCustomItem.name.trim(),
      value: newCustomItem.type === 'boolean' ? false : (newCustomItem.value || ''),
      type: newCustomItem.type || 'text',
      category: newCustomItem.category || 'general',
      order: customItems.length,
      isPublic: newCustomItem.isPublic || false,
      options: newCustomItem.options || []
    }
    
    setCustomItems([...customItems, item])
    setNewCustomItem({
      name: '',
      value: '',
      type: 'text',
      category: 'general',
      order: 0,
      isPublic: false,
      options: []
    })
    setShowAddCustomItem(false)
  }

  const handleUpdateCustomItem = (itemId: string, updates: Partial<CustomPreferenceItem>) => {
    setCustomItems(customItems.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ))
  }

  const handleRemoveCustomItem = (itemId: string) => {
    setCustomItems(customItems.filter(item => item.id !== itemId))
  }

  const handleReorderCustomItems = (fromIndex: number, toIndex: number) => {
    const reordered = [...customItems]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, moved)
    
    // Update order values
    const updated = reordered.map((item, index) => ({ ...item, order: index }))
    setCustomItems(updated)
  }

  const getCustomItemsByCategory = (category: CustomPreferenceItem['category']) => {
    return customItems
      .filter(item => item.category === category)
      .sort((a, b) => a.order - b.order)
  }

  if (isLoading) {
    return (
      <div className="glass-morphism rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-xl mx-auto mb-4 flex items-center justify-center">
          <span className="text-3xl">⚙️</span>
        </div>
        <p className="text-gray-400">Loading preferences...</p>
      </div>
    )
  }

  if (!preferences) {
    return (
      <div className="glass-morphism rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-xl mx-auto mb-4 flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>
        <p className="text-gray-400">Unable to load preferences</p>
      </div>
    )
  }

  return (
    <div className="glass-morphism rounded-xl p-6 cinematic-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
          <span>⚙️</span>
          Preferences
        </h2>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Reset to Default
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-gradient-to-r from-gaming-primary to-gaming-secondary text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white mb-4">General</h3>
          
          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Theme
            </label>
            <select
              value={editForm.theme || 'dark'}
              onChange={(e) => handleInputChange('theme', 'theme', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-gaming-accent focus:outline-none"
            >
              <option value="dark">🌙 Dark</option>
              <option value="light">☀️ Light</option>
              <option value="auto">🔄 Auto</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Language
            </label>
            <select
              value={editForm.language || 'en'}
              onChange={(e) => handleInputChange('language', 'language', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-gaming-accent focus:outline-none"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
            </select>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Timezone
            </label>
            <select
              value={editForm.timezone || 'UTC'}
              onChange={(e) => handleInputChange('timezone', 'timezone', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-gaming-accent focus:outline-none"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>
        </div>

        {/* Display Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white mb-4">Display</h3>
          
          {/* Compact Mode */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={editForm.display?.compactMode || false}
              onChange={(e) => handleInputChange('display', 'compactMode', e.target.checked)}
              className="w-4 h-4 text-gaming-accent bg-gray-800 border-gray-600 rounded focus:ring-gaming-accent"
            />
            <div>
              <span className="text-sm text-gray-300">Compact Mode</span>
              <p className="text-xs text-gray-500">Show more content in less space</p>
            </div>
          </label>

          {/* Show Game Covers */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={editForm.display?.showGameCovers !== false}
              onChange={(e) => handleInputChange('display', 'showGameCovers', e.target.checked)}
              className="w-4 h-4 text-gaming-accent bg-gray-800 border-gray-600 rounded focus:ring-gaming-accent"
            />
            <div>
              <span className="text-sm text-gray-300">Show Game Covers</span>
              <p className="text-xs text-gray-500">Display game cover images</p>
            </div>
          </label>

          {/* Animate Transitions */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={editForm.display?.animateTransitions !== false}
              onChange={(e) => handleInputChange('display', 'animateTransitions', e.target.checked)}
              className="w-4 h-4 text-gaming-accent bg-gray-800 border-gray-600 rounded focus:ring-gaming-accent"
            />
            <div>
              <span className="text-sm text-gray-300">Animate Transitions</span>
              <p className="text-xs text-gray-500">Enable smooth animations</p>
            </div>
          </label>

          {/* Show Ratings */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={editForm.display?.showRatings !== false}
              onChange={(e) => handleInputChange('display', 'showRatings', e.target.checked)}
              className="w-4 h-4 text-gaming-accent bg-gray-800 border-gray-600 rounded focus:ring-gaming-accent"
            />
            <div>
              <span className="text-sm text-gray-300">Show Ratings</span>
              <p className="text-xs text-gray-500">Display game ratings</p>
            </div>
          </label>
        </div>

        {/* Notification Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white mb-4">Notifications</h3>
          
          {/* Email Notifications */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={editForm.notifications?.email !== false}
              onChange={(e) => handleInputChange('notifications', 'email', e.target.checked)}
              className="w-4 h-4 text-gaming-accent bg-gray-800 border-gray-600 rounded focus:ring-gaming-accent"
            />
            <div>
              <span className="text-sm text-gray-300">Email Notifications</span>
              <p className="text-xs text-gray-500">Receive updates via email</p>
            </div>
          </label>

          {/* Push Notifications */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={editForm.notifications?.push !== false}
              onChange={(e) => handleInputChange('notifications', 'push', e.target.checked)}
              className="w-4 h-4 text-gaming-accent bg-gray-800 border-gray-600 rounded focus:ring-gaming-accent"
            />
            <div>
              <span className="text-sm text-gray-300">Push Notifications</span>
              <p className="text-xs text-gray-500">Browser push notifications</p>
            </div>
          </label>

          {/* Achievement Notifications */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={editForm.notifications?.achievements !== false}
              onChange={(e) => handleInputChange('notifications', 'achievements', e.target.checked)}
              className="w-4 h-4 text-gaming-accent bg-gray-800 border-gray-600 rounded focus:ring-gaming-accent"
            />
            <div>
              <span className="text-sm text-gray-300">Achievement Alerts</span>
              <p className="text-xs text-gray-500">Notify about new achievements</p>
            </div>
          </label>

          {/* Recommendation Notifications */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={editForm.notifications?.recommendations !== false}
              onChange={(e) => handleInputChange('notifications', 'recommendations', e.target.checked)}
              className="w-4 h-4 text-gaming-accent bg-gray-800 border-gray-600 rounded focus:ring-gaming-accent"
            />
            <div>
              <span className="text-sm text-gray-300">Recommendations</span>
              <p className="text-xs text-gray-500">Get personalized game suggestions</p>
            </div>
          </label>

          {/* Friend Activity */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={editForm.notifications?.friendActivity || false}
              onChange={(e) => handleInputChange('notifications', 'friendActivity', e.target.checked)}
              className="w-4 h-4 text-gaming-accent bg-gray-800 border-gray-600 rounded focus:ring-gaming-accent"
            />
            <div>
              <span className="text-sm text-gray-300">Friend Activity</span>
              <p className="text-xs text-gray-500">Updates about friends' gaming</p>
            </div>
          </label>
        </div>

        {/* Privacy Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white mb-4">Privacy</h3>
          
          {/* Profile Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Profile Visibility
            </label>
            <select
              value={editForm.privacy?.profileVisibility || 'private'}
              onChange={(e) => handleInputChange('privacy', 'profileVisibility', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-gaming-accent focus:outline-none"
            >
              <option value="public">🌍 Public</option>
              <option value="friends">👥 Friends Only</option>
              <option value="private">🔒 Private</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Control who can see your profile
            </p>
          </div>

          {/* Show Playtime */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={editForm.privacy?.showPlaytime !== false}
              onChange={(e) => handleInputChange('privacy', 'showPlaytime', e.target.checked)}
              className="w-4 h-4 text-gaming-accent bg-gray-800 border-gray-600 rounded focus:ring-gaming-accent"
            />
            <div>
              <span className="text-sm text-gray-300">Show Playtime</span>
              <p className="text-xs text-gray-500">Display your total playtime</p>
            </div>
          </label>

          {/* Show Achievements */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={editForm.privacy?.showAchievements !== false}
              onChange={(e) => handleInputChange('privacy', 'showAchievements', e.target.checked)}
              className="w-4 h-4 text-gaming-accent bg-gray-800 border-gray-600 rounded focus:ring-gaming-accent"
            />
            <div>
              <span className="text-sm text-gray-300">Show Achievements</span>
              <p className="text-xs text-gray-500">Display your achievements</p>
            </div>
          </label>

          {/* Show Game Library */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={editForm.privacy?.showGameLibrary || false}
              onChange={(e) => handleInputChange('privacy', 'showGameLibrary', e.target.checked)}
              className="w-4 h-4 text-gaming-accent bg-gray-800 border-gray-600 rounded focus:ring-gaming-accent"
            />
            <div>
              <span className="text-sm text-gray-300">Show Game Library</span>
              <p className="text-xs text-gray-500">Display your game collection</p>
            </div>
          </label>

          {/* Custom Privacy Items */}
          {getCustomItemsByCategory('privacy').map((item, index) => (
            <div key={item.id} className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
              <input
                type="text"
                value={item.name}
                onChange={(e) => handleUpdateCustomItem(item.id, { name: e.target.value })}
                className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                placeholder="Preference name"
              />
              {item.type === 'boolean' ? (
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={item.value as boolean}
                    onChange={(e) => handleUpdateCustomItem(item.id, { value: e.target.checked })}
                    className="w-4 h-4"
                  />
                </label>
              ) : item.type === 'select' ? (
                <select
                  value={item.value as string}
                  onChange={(e) => handleUpdateCustomItem(item.id, { value: e.target.value })}
                  className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                >
                  {item.options?.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={item.type}
                  value={item.value as string}
                  onChange={(e) => handleUpdateCustomItem(item.id, { value: e.target.value })}
                  className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm w-32"
                  placeholder="Value"
                />
              )}
              <div className="flex gap-1">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleReorderCustomItems(
                      customItems.findIndex(i => i.id === item.id),
                      customItems.findIndex(i => i.id === item.id) - 1
                    )}
                    className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 text-xs"
                  >
                    ↑
                  </button>
                )}
                {index < getCustomItemsByCategory('privacy').length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleReorderCustomItems(
                      customItems.findIndex(i => i.id === item.id),
                      customItems.findIndex(i => i.id === item.id) + 1
                    )}
                    className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 text-xs"
                  >
                    ↓
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveCustomItem(item.id)}
                  className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Preferences Section */}
      <div className="mt-8 border-t border-gray-700 pt-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Custom Preferences</h3>
          <button
            type="button"
            onClick={() => setShowAddCustomItem(true)}
            className="px-4 py-2 bg-gaming-accent text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            + Add Custom Preference
          </button>
        </div>

        {/* Add Custom Item Form */}
        {showAddCustomItem && (
          <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h4 className="text-sm font-medium text-white mb-3">Add New Custom Preference</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <input
                type="text"
                value={newCustomItem.name || ''}
                onChange={(e) => setNewCustomItem({ ...newCustomItem, name: e.target.value })}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                placeholder="Preference name"
              />
              <select
                value={newCustomItem.type || 'text'}
                onChange={(e) => setNewCustomItem({ ...newCustomItem, type: e.target.value as CustomPreferenceItem['type'] })}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="select">Select</option>
              </select>
              <select
                value={newCustomItem.category || 'general'}
                onChange={(e) => setNewCustomItem({ ...newCustomItem, category: e.target.value as CustomPreferenceItem['category'] })}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              >
                <option value="general">General</option>
                <option value="display">Display</option>
                <option value="notifications">Notifications</option>
                <option value="privacy">Privacy</option>
              </select>
              {newCustomItem.type === 'select' && (
                <input
                  type="text"
                  value={newCustomItem.options?.join(', ') || ''}
                  onChange={(e) => setNewCustomItem({ 
                    ...newCustomItem, 
                    options: e.target.value.split(',').map(opt => opt.trim()).filter(Boolean)
                  })}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm md:col-span-2 lg:col-span-3"
                  placeholder="Options (comma-separated)"
                />
              )}
              {newCustomItem.type !== 'boolean' && (
                <input
                  type={newCustomItem.type === 'number' ? 'number' : 'text'}
                  value={newCustomItem.value as string || ''}
                  onChange={(e) => setNewCustomItem({ ...newCustomItem, value: newCustomItem.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value })}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  placeholder="Default value"
                />
              )}
            </div>
            <div className="flex items-center gap-4 mt-3">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={newCustomItem.isPublic || false}
                  onChange={(e) => setNewCustomItem({ ...newCustomItem, isPublic: e.target.checked })}
                  className="w-4 h-4"
                />
                Public
              </label>
              <div className="flex gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCustomItem(false)
                    setNewCustomItem({ name: '', value: '', type: 'text', category: 'general', order: 0, isPublic: false, options: [] })
                  }}
                  className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCustomItem}
                  disabled={!newCustomItem.name?.trim()}
                  className="px-3 py-1 bg-gaming-accent text-white rounded hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
                >
                  Add Preference
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Items by Category */}
        {(['general', 'display', 'notifications', 'privacy'] as const).map(category => {
          const items = getCustomItemsByCategory(category)
          if (items.length === 0) return null
          
          return (
            <div key={category} className="mb-6">
              <h4 className="text-lg font-medium text-white mb-3 capitalize">{category} Custom Preferences</h4>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-300">{item.name}</label>
                      <div className="mt-1">
                        {item.type === 'boolean' ? (
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={item.value as boolean}
                              onChange={(e) => handleUpdateCustomItem(item.id, { value: e.target.checked })}
                              className="w-4 h-4"
                            />
                            <span className="text-sm text-white">
                              {item.value ? 'Enabled' : 'Disabled'}
                            </span>
                          </label>
                        ) : item.type === 'select' ? (
                          <select
                            value={item.value as string}
                            onChange={(e) => handleUpdateCustomItem(item.id, { value: e.target.value })}
                            className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                          >
                            {item.options?.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={item.type}
                            value={item.value as string}
                            onChange={(e) => handleUpdateCustomItem(item.id, { value: e.target.value })}
                            className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm w-full"
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.isPublic && (
                        <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                          Public
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomItem(item.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
