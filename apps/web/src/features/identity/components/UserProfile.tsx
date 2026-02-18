import React, { useState, useEffect, useRef } from 'react'
import { UserProfile as UserProfileType, CustomField } from '../types'
import { LocalStorageService } from '../services/localStorage'
import { useLibraryStore } from '../../../stores/useLibraryStore'
import { useProfileStore } from '../../../stores/profileStore'

interface UserProfileProps {
  onProfileUpdate?: (profile: UserProfileType) => void
}

export const UserProfile: React.FC<UserProfileProps> = ({ onProfileUpdate }) => {
  const localStorageService = new LocalStorageService()
  const { games } = useLibraryStore()
  const { updateProfile: updateStoreProfile } = useProfileStore()
  const [profile, setProfile] = useState<UserProfileType | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<UserProfileType>>({})
  const [customFields, setCustomFields] = useState<CustomField[]>([])
  const [showAddCustomField, setShowAddCustomField] = useState(false)
  const [newCustomField, setNewCustomField] = useState<Partial<CustomField>>({
    name: '',
    value: '',
    type: 'text',
    isPublic: false,
    order: 0
  })
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      const maxSize = 5 * 1024 * 1024 // 5MB

      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
        return
      }

      if (file.size > maxSize) {
        alert('Image size must be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setAvatarPreview(result)
        handleInputChange('avatar', result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarRemove = () => {
    setAvatarPreview(null)
    handleInputChange('avatar', null)
  }

  useEffect(() => {
    const loadProfile = () => {
      const userProfile = localStorageService.getUserProfile()
      if (userProfile) {
        setProfile(userProfile)
        setEditForm(userProfile)
        setCustomFields(userProfile.customFields || [])
      } else {
        // Initialize with default data
        const defaultProfile = localStorageService.initializeDefaultData().profile
        setProfile(defaultProfile)
        setEditForm(defaultProfile)
        setCustomFields(defaultProfile.customFields || [])
      }
      setIsLoading(false)
    }

    loadProfile()
  }, [])

  const handleSave = () => {
    if (!profile) return

    const updatedProfile = { ...profile, ...editForm, lastActive: new Date().toISOString(), customFields }
    localStorageService.setUserProfile(updatedProfile)
    setProfile(updatedProfile)
    
    // Also update the profile store so homepage can see changes
    // Only update the greeting-related fields
    updateStoreProfile({
      preferredGreeting: updatedProfile.preferredGreeting,
      greetingPhrases: updatedProfile.greetingPhrases
    })
    
    setIsEditing(false)
    setShowAddCustomField(false)
    onProfileUpdate?.(updatedProfile)
  }

  const handleCancel = () => {
    if (profile) {
      setEditForm(profile)
    }
    setIsEditing(false)
  }

  const handleInputChange = (field: keyof UserProfileType, value: any) => {
    setEditForm((prev: Partial<UserProfileType>) => ({ ...prev, [field]: value }))
  }

  // Greeting phrase handlers
  const updateGreetingPhrase = (index: number, value: string) => {
    const currentPhrases = editForm.greetingPhrases || profile?.greetingPhrases || ['Ready to crush some games?', 'Time to level up!', 'Let the gaming begin!']
    const newPhrases = [...currentPhrases]
    newPhrases[index] = value
    handleInputChange('greetingPhrases', newPhrases)
  }

  const addGreetingPhrase = () => {
    const currentPhrases = editForm.greetingPhrases || profile?.greetingPhrases || ['Ready to crush some games?', 'Time to level up!', 'Let the gaming begin!']
    const newPhrases = [...currentPhrases, '']
    handleInputChange('greetingPhrases', newPhrases)
  }

  const removeGreetingPhrase = (index: number) => {
    const currentPhrases = editForm.greetingPhrases || profile?.greetingPhrases || ['Ready to crush some games?', 'Time to level up!', 'Let the gaming begin!']
    const newPhrases = currentPhrases.filter((_, i) => i !== index)
    handleInputChange('greetingPhrases', newPhrases)
  }

  const handleAddCustomField = () => {
    if (!newCustomField.name?.trim()) return
    
    const field: CustomField = {
      id: `custom-${Date.now()}`,
      name: newCustomField.name.trim(),
      value: newCustomField.value || '',
      type: newCustomField.type || 'text',
      isPublic: newCustomField.isPublic || false,
      order: customFields.length
    }
    
    setCustomFields([...customFields, field])
    setNewCustomField({
      name: '',
      value: '',
      type: 'text',
      isPublic: false,
      order: 0
    })
    setShowAddCustomField(false)
  }

  const handleUpdateCustomField = (fieldId: string, updates: Partial<CustomField>) => {
    setCustomFields(customFields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ))
  }

  const handleRemoveCustomField = (fieldId: string) => {
    setCustomFields(customFields.filter(field => field.id !== fieldId))
  }

  const handleReorderCustomFields = (fromIndex: number, toIndex: number) => {
    const reordered = [...customFields]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, moved)
    
    // Update order values
    const updated = reordered.map((field, index) => ({ ...field, order: index }))
    setCustomFields(updated)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCompletionBadges = () => {
    const badges = []
    
    if (profile?.avatar) badges.push({ name: 'Profile Picture', icon: '📸', color: 'bg-purple-500' })
    if (profile?.bio && profile.bio.length > 10) badges.push({ name: 'Storyteller', icon: '📖', color: 'bg-blue-500' })
    if (profile?.location) badges.push({ name: 'Location Pioneer', icon: '📍', color: 'bg-green-500' })
    if (profile?.website) badges.push({ name: 'Web Wanderer', icon: '🌐', color: 'bg-cyan-500' })
    if (profile?.customFields && profile.customFields.length > 0) badges.push({ name: 'Custom Creator', icon: '🎨', color: 'bg-pink-500' })
    if (games && games.length > 0) badges.push({ name: 'Game Collector', icon: '🎮', color: 'bg-gaming-primary' })
    if (games && games.reduce((total: number, game: any) => total + (game.playtime || 0), 0) > 100) badges.push({ name: 'Gaming Veteran', icon: '🏆', color: 'bg-yellow-500' })
    
    return badges
  }

  const completionPercentage = (() => {
    let score = 0
    if (profile?.displayName) score += 15
    if (profile?.avatar) score += 20
    if (profile?.bio) score += 15
    if (profile?.email) score += 10
    if (profile?.location) score += 10
    if (profile?.website) score += 10
    if (profile?.customFields && profile.customFields.length > 0) score += 10
    if (games && games.length > 0) score += 10
    return Math.min(score, 100)
  })()

  if (isLoading) {
    return (
      <div className="glass-morphism rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-xl mx-auto mb-4 flex items-center justify-center">
          <span className="text-3xl">👤</span>
        </div>
        <p className="text-gray-400">Loading profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="glass-morphism rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-xl mx-auto mb-4 flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>
        <p className="text-gray-400">Unable to load profile</p>
      </div>
    )
  }

  return (
    <div className="glass-morphism rounded-xl p-6 cinematic-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
          <span>👤</span>
          User Profile
        </h2>
        <button
          onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
          className="px-4 py-2 bg-gradient-to-r from-gaming-primary to-gaming-secondary text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Section */}
        <div className="lg:col-span-1">
          <div className="text-center">
            <div className="relative inline-block group">
              <div className="w-32 h-32 bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-full mx-auto mb-4 flex items-center justify-center ring-4 ring-white/20 hover:ring-white/40 transition-all duration-300">
                {(avatarPreview || profile.avatar) ? (
                  <img
                    src={avatarPreview || profile.avatar}
                    alt={profile.displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-5xl">👤</span>
                )}
              </div>
              
              {isEditing && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-8 h-8 bg-gaming-accent rounded-full flex items-center justify-center text-white text-sm hover:bg-gaming-accent/80 transition-colors shadow-lg"
                    title="Upload new avatar"
                  >
                    📷
                  </button>
                  {(avatarPreview || profile.avatar) && (
                    <button 
                      onClick={handleAvatarRemove}
                      className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm hover:bg-red-700 transition-colors shadow-lg"
                      title="Remove avatar"
                    >
                      �️
                    </button>
                  )}
                </div>
              )}
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
                aria-label="Upload profile avatar"
                title="Choose an image file for your profile avatar"
              />
            </div>

            <h3 className="text-xl font-semibold text-white mb-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.displayName || ''}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-center text-white"
                  placeholder="Display Name"
                />
              ) : (
                profile.displayName
              )}
            </h3>

            <p className="text-gray-400 mb-4">
              @{isEditing ? (
                <input
                  type="text"
                  value={editForm.username || ''}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-center text-gray-400"
                  placeholder="username"
                />
              ) : (
                profile.username
              )}
            </p>

            {/* Profile Stats */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Games Owned:</span>
                <div className="flex items-center gap-2">
                  <span className="text-gaming-accent">🎮</span>
                  <span className="text-white font-medium">{games?.length || 0}</span>
                </div>
              </div>
              
              {/* Hours Played - would come from game sessions */}
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Hours Played:</span>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">⏱️</span>
                  <span className="text-white font-medium">
                    {games?.reduce((total: number, game: any) => total + (game.playtime || 0), 0) || 0}h
                  </span>
                </div>
              </div>

              {/* Achievements - placeholder for now */}
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Achievements:</span>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">🏆</span>
                  <span className="text-white font-medium">
                    {games?.reduce((total: number, game: any) => total + (game.achievements?.length || 0), 0) || 0}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Joined:</span>
                  <span className="text-white">{formatDate(profile.joinedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Active:</span>
                  <span className="text-white">{formatDate(profile.lastActive)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Profile:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    profile.isPublic 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {profile.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="lg:col-span-2 space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-gaming-accent focus:outline-none"
                  placeholder="your@email.com"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Bio
                </label>
                <textarea
                  value={editForm.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-gaming-accent focus:outline-none resize-none"
                  placeholder="Tell us about your gaming style..."
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={editForm.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-gaming-accent focus:outline-none"
                  placeholder="City, Country"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={editForm.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-gaming-accent focus:outline-none"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              {/* Greeting Customization */}
              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <span>👋</span>
                  Homepage Greeting
                </h3>
                
                {/* Preferred Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Preferred Name (for homepage greeting)
                  </label>
                  <input
                    type="text"
                    value={editForm.preferredGreeting || ''}
                    onChange={(e) => handleInputChange('preferredGreeting', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-gaming-accent focus:outline-none"
                    placeholder="Gamer, Champion, Legend, etc."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This name will be used in the "Welcome back, [Name]" greeting on your homepage
                  </p>
                </div>

                {/* Greeting Phrases */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Custom Greeting Phrases
                  </label>
                  <div className="space-y-2 mb-3">
                    {(editForm.greetingPhrases || profile?.greetingPhrases || ['Ready to crush some games?', 'Time to level up!', 'Let the gaming begin!']).map((phrase, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={phrase}
                          onChange={(e) => updateGreetingPhrase(index, e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-gaming-accent focus:outline-none text-sm"
                          placeholder="Enter a greeting phrase..."
                        />
                        <button
                          type="button"
                          onClick={() => removeGreetingPhrase(index)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addGreetingPhrase}
                    className="px-4 py-2 bg-gaming-accent text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
                  >
                    + Add Phrase
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    These phrases will appear randomly below your welcome message on the homepage
                  </p>
                </div>
              </div>

              {/* Profile Visibility */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isPublic || false}
                    onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                    className="w-4 h-4 text-gaming-accent bg-gray-800 border-gray-600 rounded focus:ring-gaming-accent"
                  />
                  <span className="text-sm text-gray-300">
                    Make my profile public
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Public profiles can be discovered by other users
                </p>
              </div>

              {/* Custom Fields Section */}
              <div className="border-t border-gray-700 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Custom Fields</h3>
                  <button
                    type="button"
                    onClick={() => setShowAddCustomField(true)}
                    className="px-3 py-1 bg-gaming-accent text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
                  >
                    + Add Field
                  </button>
                </div>

                {/* Existing Custom Fields */}
                {customFields.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {customFields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={field.name}
                            onChange={(e) => handleUpdateCustomField(field.id, { name: e.target.value })}
                            className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                            placeholder="Field name"
                          />
                          {field.type === 'textarea' ? (
                            <textarea
                              value={field.value}
                              onChange={(e) => handleUpdateCustomField(field.id, { value: e.target.value })}
                              className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm resize-none"
                              placeholder="Field value"
                              rows={2}
                            />
                          ) : (
                            <input
                              type={field.type}
                              value={field.value}
                              onChange={(e) => handleUpdateCustomField(field.id, { value: e.target.value })}
                              className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                              placeholder="Field value"
                            />
                          )}
                        </div>
                        <select
                          value={field.type}
                          onChange={(e) => handleUpdateCustomField(field.id, { type: e.target.value as CustomField['type'] })}
                          className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                          aria-label={`Field type for ${field.name}`}
                        >
                          <option value="text">Text</option>
                          <option value="email">Email</option>
                          <option value="url">URL</option>
                          <option value="textarea">Textarea</option>
                        </select>
                        <label className="flex items-center gap-1 text-xs text-gray-300">
                          <input
                            type="checkbox"
                            checked={field.isPublic}
                            onChange={(e) => handleUpdateCustomField(field.id, { isPublic: e.target.checked })}
                            className="w-3 h-3"
                          />
                          Public
                        </label>
                        <div className="flex gap-1">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => handleReorderCustomFields(index, index - 1)}
                              className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 text-xs"
                            >
                              ↑
                            </button>
                          )}
                          {index < customFields.length - 1 && (
                            <button
                              type="button"
                              onClick={() => handleReorderCustomFields(index, index + 1)}
                              className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 text-xs"
                            >
                              ↓
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomField(field.id)}
                            className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Custom Field Form */}
                {showAddCustomField && (
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <h4 className="text-sm font-medium text-white mb-3">Add New Custom Field</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={newCustomField.name || ''}
                        onChange={(e) => setNewCustomField({ ...newCustomField, name: e.target.value })}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                        placeholder="Field name"
                      />
                      {newCustomField.type === 'textarea' ? (
                        <textarea
                          value={newCustomField.value || ''}
                          onChange={(e) => setNewCustomField({ ...newCustomField, value: e.target.value })}
                          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm resize-none"
                          placeholder="Field value"
                          rows={2}
                        />
                      ) : (
                        <input
                          type={newCustomField.type || 'text'}
                          value={newCustomField.value || ''}
                          onChange={(e) => setNewCustomField({ ...newCustomField, value: e.target.value })}
                          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                          placeholder="Field value"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <select
                        value={newCustomField.type || 'text'}
                        onChange={(e) => setNewCustomField({ ...newCustomField, type: e.target.value as CustomField['type'] })}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                        aria-label="New custom field type"
                      >
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="url">URL</option>
                        <option value="textarea">Textarea</option>
                      </select>
                      <label className="flex items-center gap-2 text-sm text-gray-300">
                        <input
                          type="checkbox"
                          checked={newCustomField.isPublic || false}
                          onChange={(e) => setNewCustomField({ ...newCustomField, isPublic: e.target.checked })}
                          className="w-4 h-4"
                        />
                        Public
                      </label>
                      <div className="flex gap-2 ml-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddCustomField(false)
                            setNewCustomField({ name: '', value: '', type: 'text', isPublic: false, order: 0 })
                          }}
                          className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddCustomField}
                          disabled={!newCustomField.name?.trim()}
                          className="px-3 py-1 bg-gaming-accent text-white rounded hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
                        >
                          Add Field
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Save/Cancel Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-gradient-to-r from-gaming-primary to-gaming-secondary text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Email */}
              {profile.email && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-1">Email</h4>
                  <p className="text-white">{profile.email}</p>
                </div>
              )}

              {/* Bio */}
              {profile.bio && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-1">Bio</h4>
                  <p className="text-gray-100 leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {/* Location */}
              {profile.location && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-1">Location</h4>
                  <p className="text-white flex items-center gap-2">
                    <span>📍</span>
                    {profile.location}
                  </p>
                </div>
              )}

              {/* Website */}
              {profile.website && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-1">Website</h4>
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-400 hover:text-accent-300 transition-colors flex items-center gap-2"
                  >
                    <span>🔗</span>
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}

              {/* Custom Fields Display */}
              {profile.customFields && profile.customFields.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Custom Fields</h4>
                  <div className="space-y-2">
                    {profile.customFields
                      .sort((a, b) => a.order - b.order)
                      .map((field) => (
                        <div key={field.id} className="flex items-start gap-2">
                          <h5 className="text-sm font-medium text-white min-w-0">
                            {field.name}:
                          </h5>
                          <div className="flex-1 min-w-0">
                            {field.type === 'url' && field.value ? (
                              <a
                                href={field.value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent-400 hover:text-accent-300 transition-colors break-all"
                              >
                                {field.value}
                              </a>
                            ) : field.type === 'textarea' ? (
                              <p className="text-gray-100 whitespace-pre-wrap break-all">
                                {field.value}
                              </p>
                            ) : field.type === 'email' && field.value ? (
                              <a
                                href={`mailto:${field.value}`}
                                className="text-accent-400 hover:text-accent-300 transition-colors break-all"
                              >
                                {field.value}
                              </a>
                            ) : (
                              <p className="text-gray-100 break-all">
                                {field.value || <span className="text-gray-500">Not set</span>}
                              </p>
                            )}
                          </div>
                          {field.isPublic && (
                            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                              Public
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Profile Badges */}
              {getCompletionBadges().length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <span>🏆</span>
                    Achievements ({getCompletionBadges().length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {getCompletionBadges().map((badge, index) => (
                      <div
                        key={badge.name}
                        className={`${badge.color} text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 shadow-lg hover:scale-105 transition-transform duration-200`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <span className="text-sm">{badge.icon}</span>
                        <span>{badge.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!profile.email && !profile.bio && !profile.location && !profile.website && (!profile.customFields || profile.customFields.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-gray-400">
                    No additional information added yet. Click "Edit Profile" to personalize your profile.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
