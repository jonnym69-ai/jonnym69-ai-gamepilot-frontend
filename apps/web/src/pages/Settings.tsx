import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle'
import { EmulatorConfig } from '../components/EmulatorConfig'
import { emulatorLauncher } from '../services/emulatorLauncher'
import type { EmulatorConfig as EmulatorConfigType } from '../services/emulatorService'
import { useIntegrations, useIntegrationsActions } from '../features/integrations/integrationsStore'
import { useCustomisation, useCustomisationActions } from '../features/customisation/customisationStore'
import { useAuthStore } from '../store/authStore'
import { useLibraryPersona } from '../hooks/persona'
import { useMoodRecommendations } from '../hooks/useMoodRecommendations'
import { useLibraryStore } from '../stores/useLibraryStore'
import type { User } from '@gamepilot/shared'

interface SteamApiKeyState {
  hasApiKey: boolean
  maskedKey: string | null
  isLoading: boolean
  error: string | null
}

interface GeneralSettings {
  language: string
  timezone: string
  dateFormat: string
  autoSync: boolean
  syncInterval: number
}

interface APISettings {
  youtubeApiKey: string
  discordBotToken: string
  discordUserToken: string
  steamApiKey: string
}

interface NotificationSettings {
  achievements: boolean
  friendActivity: boolean
  gameUpdates: boolean
  news: boolean
  discordMessages: boolean
  youtubeNotifications: boolean
}

interface PrivacySettings {
  profilePublic: boolean
  showPlaytime: boolean
  shareAchievements: boolean
  dataCollection: boolean
  analyticsEnabled: boolean
}

export const Settings: React.FC = () => {
  const navigate = useNavigate()
  
  // Tab state
  const [activeTab, setActiveTab] = useState('general')
  
  // Get persona and mood data
  const persona = useLibraryPersona()
  const { games } = useLibraryStore()
  const { primaryMood, hasRecommendations } = useMoodRecommendations({ games })
  
  // Use customisation store for appearance settings
  const customisation = useCustomisation()
  const { setGlobalSettings } = useCustomisationActions()
  
  // Use integrations store
  const integrations = useIntegrations()
  const { loadIntegrationsFromServer, syncIntegrationsToServer, setIntegration, connectSteam, disconnectSteam, connectDiscord, disconnectDiscord } = useIntegrationsActions()
  
  // Auth store - single source of truth for user data
  const { user, isAuthenticated, isLoading: authLoading, updateProfile: updateAuthProfile } = useAuthStore()
  
  // Local state for settings (non-profile related)
  const [general, setGeneral] = useState<GeneralSettings>({
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    autoSync: true,
    syncInterval: 30
  })
  
  // Profile editing state with validation
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState<Partial<User>>({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    birthday: user?.birthday || '',
    discordTag: user?.discordTag || '',
    steamProfile: user?.steamProfile || ''
  })
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({})
  
  // Birthday celebration state
  const [showBirthdayCelebration, setShowBirthdayCelebration] = useState(false)
  
  const [apiKeys, setApiKeys] = useState<APISettings>({
    youtubeApiKey: '',
    discordBotToken: '',
    discordUserToken: '',
    steamApiKey: ''
  })
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    achievements: true,
    friendActivity: true,
    gameUpdates: false,
    news: false,
    discordMessages: true,
    youtubeNotifications: false
  })
  
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profilePublic: true,
    showPlaytime: true,
    shareAchievements: false,
    dataCollection: true,
    analyticsEnabled: true
  })
  
  const [emulators, setEmulators] = useState<EmulatorConfigType[]>([])
  const [showEmulatorConfig, setShowEmulatorConfig] = useState(false)
  const [testingApiKey, setTestingApiKey] = useState<string>('')

  // Steam API key state
  const [steamApiKeyState, setSteamApiKeyState] = useState<SteamApiKeyState>({
    hasApiKey: false,
    maskedKey: null,
    isLoading: false,
    error: null
  })

  // Load integrations from server on mount
  useEffect(() => {
    loadIntegrationsFromServer()
  }, [loadIntegrationsFromServer])

  // Load user's Steam API key on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadSteamApiKey()
    }
  }, [isAuthenticated])

  const loadSteamApiKey = async () => {
    try {
      setSteamApiKeyState(prev => ({ ...prev, isLoading: true, error: null }))

      const response = await fetch('/api/auth/steam-api-key', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setSteamApiKeyState({
          hasApiKey: data.hasApiKey,
          maskedKey: data.maskedKey,
          isLoading: false,
          error: null
        })
      } else {
        throw new Error('Failed to load Steam API key')
      }
    } catch (error) {
      setSteamApiKeyState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load Steam API key'
      }))
    }
  }

  const saveSteamApiKey = async (apiKey: string) => {
    try {
      setSteamApiKeyState(prev => ({ ...prev, isLoading: true, error: null }))

      const response = await fetch('/api/auth/steam-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ apiKey })
      })

      if (response.ok) {
        const data = await response.json()
        setSteamApiKeyState({
          hasApiKey: true,
          maskedKey: data.maskedKey,
          isLoading: false,
          error: null
        })
        alert('✅ Steam API key saved successfully!')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save API key')
      }
    } catch (error: any) {
      setSteamApiKeyState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to save Steam API key'
      }))
    }
  }

  const removeSteamApiKey = async () => {
    try {
      setSteamApiKeyState(prev => ({ ...prev, isLoading: true, error: null }))

      const response = await fetch('/api/auth/steam-api-key', {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        setSteamApiKeyState({
          hasApiKey: false,
          maskedKey: null,
          isLoading: false,
          error: null
        })
        alert('✅ Steam API key removed successfully!')
      } else {
        throw new Error('Failed to remove API key')
      }
    } catch (error: any) {
      setSteamApiKeyState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to remove Steam API key'
      }))
    }
  }

  const handleSaveSteamApiKey = async () => {
    const apiKey = prompt('Enter your Steam Web API Key (32 characters):')
    if (!apiKey) return

    if (apiKey.length !== 32) {
      alert('Steam API key must be exactly 32 characters long')
      return
    }

    await saveSteamApiKey(apiKey)
  }

  // Check for birthday on component mount
  useEffect(() => {
    const checkBirthday = () => {
      if (!user?.birthday) return
      
      const today = new Date()
      const birthday = new Date(user.birthday)
      
      // Check if today is the user's birthday
      if (today.getMonth() === birthday.getMonth() && today.getDate() === birthday.getDate()) {
        setShowBirthdayCelebration(true)
        
        // Auto-hide celebration after 10 seconds
        setTimeout(() => {
          setShowBirthdayCelebration(false)
        }, 10000)
      }
    }
    
    checkBirthday()
  }, [user?.birthday])

  // Initialize emulator launcher with saved configs
  useEffect(() => {
    if (emulators.length > 0) {
      emulatorLauncher.setConfigs(emulators)
    }
  }, [emulators])

  const updateIntegration = async (platform: string, enabled: boolean) => {
    try {
      if (platform === 'steam' && enabled) {
        await connectSteam()
      } else if (platform === 'steam' && !enabled) {
        await disconnectSteam()
      } else if (platform === 'discord' && enabled) {
        await connectDiscord()
      } else if (platform === 'discord' && !enabled) {
        await disconnectDiscord()
      } else if (platform === 'youtube' && enabled) {
        // Connect YouTube integration
        setIntegration('youtubeConnected', true)
        console.log('🎬 YouTube integration enabled!')
        alert('🎬 YouTube integration enabled!\n\nYou can now access YouTube gaming content and recommendations.')
      } else if (platform === 'youtube' && !enabled) {
        // Disconnect YouTube integration
        setIntegration('youtubeConnected', false)
        console.log('📺 YouTube integration disabled!')
        alert('📺 YouTube integration disabled.\n\nYou can re-enable it anytime from the Integrations page.')
      } else if (platform === 'gog' && enabled) {
        window.open('https://gog.com', '_blank')
        alert('🎯 GOG integration coming soon!\n\nGOG opened in a new tab.')
      } else if (platform === 'epic' && enabled) {
        window.open('https://epicgames.com', '_blank')
        alert('🚀 Epic Games integration coming soon!\n\nEpic Games opened in a new tab.')
      }
      
      await syncIntegrationsToServer()
    } catch (error) {
      console.error(`Failed to ${enabled ? 'connect' : 'disconnect'} ${platform}:`, error)
    }
  }

  const updateGeneral = (key: keyof GeneralSettings, value: any) => {
    setGeneral(prev => ({ ...prev, [key]: value }))
  }

  const updateNotification = (type: keyof NotificationSettings, enabled: boolean) => {
    setNotifications((prev: NotificationSettings) => ({ ...prev, [type]: enabled }))
  }

  const updatePrivacy = (setting: keyof PrivacySettings, enabled: boolean) => {
    setPrivacy(prev => ({ ...prev, [setting]: enabled }))
  }

  const updateApiKey = (key: keyof APISettings, value: string) => {
    setApiKeys(prev => ({ ...prev, [key]: value }))
  }

  const updateProfile = (field: keyof Partial<User>, value: string) => {
    setProfileForm(prev => ({ ...prev, [field]: value }))
  }

  const saveProfile = async () => {
    if (!isAuthenticated || !user) {
      // Show error message for non-authenticated users
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse'
      notification.textContent = '❌ Profile editing requires an account. Please login first.'
      document.body.appendChild(notification)
      
      setTimeout(() => {
        notification.remove()
      }, 5000)
      return
    }

    // Validate form
    const errors: Record<string, string> = {}
    
    if (!profileForm.username?.trim()) {
      errors.username = 'Username is required'
    } else if (profileForm.username.length < 3) {
      errors.username = 'Username must be at least 3 characters'
    }
    
    if (!profileForm.email?.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    if (profileForm.discordTag && !/^.{3,32}#\d{4}$/.test(profileForm.discordTag)) {
      errors.discordTag = 'Discord tag must be in format: Username#1234'
    }
    
    if (profileForm.website && !/^https?:\/\/.+/.test(profileForm.website)) {
      errors.website = 'Website must start with http:// or https://'
    }

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors)
      return
    }

    try {
      setIsSavingProfile(true)
      setProfileErrors({})
      
      // Update profile via auth store
      await updateAuthProfile(profileForm)
      setIsEditingProfile(false)
      
      // Show success message with animation
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce'
      notification.innerHTML = '✅ Profile updated successfully!'
      document.body.appendChild(notification)
      
      setTimeout(() => {
        notification.classList.add('animate-pulse')
        setTimeout(() => {
          notification.remove()
        }, 2000)
      }, 1000)
    } catch (error) {
      console.error('Failed to update profile:', error)
      
      // Show error message with animation
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-shake'
      notification.innerHTML = '❌ Failed to update profile. Please try again.'
      document.body.appendChild(notification)
      
      setTimeout(() => {
        notification.remove()
      }, 5000)
    } finally {
      setIsSavingProfile(false)
    }
  }

  const cancelEditProfile = () => {
    // Reset form to current user data
    setProfileForm({
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
      location: user?.location || '',
      website: user?.website || '',
      birthday: user?.birthday || '',
      discordTag: user?.discordTag || '',
      steamProfile: user?.steamProfile || ''
    })
    setIsEditingProfile(false)
  }

  const testApiKey = async (platform: string) => {
    setTestingApiKey(platform)
    
    // Simulate API key testing
    setTimeout(() => {
      const isValid = platform === 'youtube' && apiKeys.youtubeApiKey.length > 10
      if (isValid) {
        alert(`✅ ${platform} API key is valid!`)
      } else {
        alert(`❌ ${platform} API key appears to be invalid or missing.`)
      }
      setTestingApiKey('')
    }, 1500)
  }

  const handleEmulatorConfigSave = (configs: EmulatorConfigType[]) => {
    setEmulators(configs)
    emulatorLauncher.setConfigs(configs)
  }

  const openEmulatorConfig = () => {
    setShowEmulatorConfig(true)
  }

  const closeEmulatorConfig = () => {
    setShowEmulatorConfig(false)
  }

  const tabs = [
    { id: 'general', label: '⚙️ General', icon: '⚙️' },
    { id: 'mood-persona', label: '🎭 Mood & Persona', icon: '🎭' },
    { id: 'integrations', label: '🔗 Integrations', icon: '🔗' },
    { id: 'api-keys', label: '🔑 API Keys', icon: '🔑' },
    { id: 'notifications', label: '🔔 Notifications', icon: '🔔' },
    { id: 'privacy', label: '🔒 Privacy', icon: '🔒' },
    { id: 'emulators', label: '🎮 Emulators', icon: '🎮' },
    { id: 'account', label: '👤 Account', icon: '👤' }
  ]

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-5xl font-gaming bg-gradient-to-r from-gaming-primary to-gaming-secondary bg-clip-text text-transparent mb-2">
                  Settings
                </h1>
                <p className="text-gray-300 text-lg">
                  Customize your GamePilot experience
                </p>
              </div>
              
              {/* Header Controls */}
              <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">Theme:</span>
                  <ThemeToggle size="sm" />
                </div>
                
                {/* Layout Density */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">Layout:</span>
                  <div className="flex gap-2">
                    {(['compact', 'comfortable'] as const).map((density) => (
                      <button
                        key={density}
                        onClick={() => setGlobalSettings({ density })}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                          customisation.density === density
                            ? 'bg-gaming-primary text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {density === 'compact' && '📱'}
                        {density === 'comfortable' && '🖥️'}
                        {density.charAt(0).toUpperCase() + density.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Customisation Button */}
                <button
                  onClick={() => navigate('/customisation')}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium flex items-center gap-2 shadow-lg"
                >
                  <span>🎨</span>
                  <span>Customisation</span>
                </button>
              </div>
            </div>
          </header>

          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gaming-primary text-white shadow-lg shadow-gaming-primary/25'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="max-w-4xl mx-auto">
            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-8">
                {/* Authentication Check */}
                {!isAuthenticated && (
                  <div className="glass-morphism rounded-xl p-8">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🔒</div>
                      <h3 className="text-2xl font-bold text-white mb-4">Authentication Required</h3>
                      <p className="text-gray-300 mb-6">
                        Please login to access and manage your account settings.
                      </p>
                      <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-3 bg-gaming-primary text-white rounded-lg hover:bg-gaming-primary/80 transition-colors font-medium"
                      >
                        Login to Account
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Account Settings (only show when authenticated) */}
                {isAuthenticated && user && (
                  <div className="space-y-8">
                    {/* Profile Header */}
                    <div className="glass-morphism rounded-xl p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-6">
                          {/* Avatar Section */}
                          <div className="relative group">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gaming-primary to-gaming-secondary flex items-center justify-center text-4xl text-white font-bold shadow-2xl">
                              {user?.username?.charAt(0).toUpperCase() || 'G'}
                            </div>
                            <button 
                              title="Change profile picture"
                              className="absolute bottom-0 right-0 w-10 h-10 bg-gaming-primary rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              aria-label="Change profile picture"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </button>
                          </div>
                          
                          {/* Basic Info */}
                          <div>
                            <h2 className="text-3xl font-bold text-white mb-2">{user?.username || 'Guest'}</h2>
                            <p className="text-gray-400 text-lg mb-1">{user?.email || 'No email'}</p>
                            <p className="text-gray-300 italic">"{user?.bio || 'No bio set'}"</p>
                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                              <span>🎮 Member since {new Date(user?.createdAt || '').toLocaleDateString()}</span>
                              <span>•</span>
                              <span>🕐 Last active {new Date(user?.lastActive || '').toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Edit Button */}
                        {!isEditingProfile && (
                          <button
                            onClick={() => setIsEditingProfile(true)}
                            className="px-6 py-3 bg-gaming-primary text-white rounded-lg hover:bg-gaming-primary/80 transition-colors font-medium flex items-center gap-2 shadow-lg"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Profile
                          </button>
                        )}
                      </div>

                      {/* Edit Profile Form */}
                      {isEditingProfile && (
                        <div className="mt-6 pt-6 border-t border-gray-700">
                          <h3 className="text-xl font-bold text-white mb-4">Edit Profile Information</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-gray-400 text-sm mb-1 block">Username</label>
                              <input
                                type="text"
                                value={profileForm.username}
                                onChange={(e) => {
                                  updateProfile('username', e.target.value)
                                  setProfileErrors(prev => {
                                    const newErrors = { ...prev }
                                    delete newErrors.username
                                    return newErrors
                                  })
                                }}
                                className={`w-full px-4 py-2 bg-gray-800 text-white rounded-lg border focus:outline-none transition-colors ${
                                  profileErrors.username 
                                    ? 'border-red-500 focus:border-red-600' 
                                    : 'border-gray-700 focus:border-gaming-primary'
                                }`}
                                placeholder="Enter username"
                              />
                              {profileErrors.username && (
                                <p className="text-red-400 text-sm mt-1">{profileErrors.username}</p>
                              )}
                            </div>
                            
                            <div>
                              <label className="text-gray-400 text-sm mb-1 block">Email</label>
                              <input
                                type="email"
                                value={profileForm.email}
                                onChange={(e) => {
                                  updateProfile('email', e.target.value)
                                  setProfileErrors(prev => {
                                    const newErrors = { ...prev }
                                    delete newErrors.email
                                    return newErrors
                                  })
                                }}
                                className={`w-full px-4 py-2 bg-gray-800 text-white rounded-lg border focus:outline-none transition-colors ${
                                  profileErrors.email 
                                    ? 'border-red-500 focus:border-red-600' 
                                    : 'border-gray-700 focus:border-gaming-primary'
                                }`}
                                placeholder="Enter email address"
                              />
                              {profileErrors.email && (
                                <p className="text-red-400 text-sm mt-1">{profileErrors.email}</p>
                              )}
                            </div>
                            
                            <div className="md:col-span-2">
                              <label className="text-gray-400 text-sm mb-1 block">Bio</label>
                              <textarea
                                value={profileForm.bio}
                                onChange={(e) => updateProfile('bio', e.target.value)}
                                rows={3}
                                placeholder="Tell us about your gaming journey..."
                                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-gaming-primary focus:outline-none resize-none transition-colors"
                              />
                            </div>
                            
                            <div>
                              <label className="text-gray-400 text-sm mb-1 block">Location</label>
                              <input
                                type="text"
                                value={profileForm.location}
                                onChange={(e) => updateProfile('location', e.target.value)}
                                placeholder="City, Country"
                                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-gaming-primary focus:outline-none transition-colors"
                              />
                            </div>
                            
                            <div>
                              <label className="text-gray-400 text-sm mb-1 block">Website</label>
                              <input
                                type="url"
                                value={profileForm.website}
                                onChange={(e) => {
                                  updateProfile('website', e.target.value)
                                  setProfileErrors(prev => {
                                    const newErrors = { ...prev }
                                    delete newErrors.website
                                    return newErrors
                                  })
                                }}
                                placeholder="https://yourwebsite.com"
                                className={`w-full px-4 py-2 bg-gray-800 text-white rounded-lg border focus:outline-none transition-colors ${
                                  profileErrors.website 
                                    ? 'border-red-500 focus:border-red-600' 
                                    : 'border-gray-700 focus:border-gaming-primary'
                                }`}
                              />
                              {profileErrors.website && (
                                <p className="text-red-400 text-sm mt-1">{profileErrors.website}</p>
                              )}
                            </div>
                            
                            <div>
                              <label className="text-gray-400 text-sm mb-1 block">Birthday</label>
                              <input
                                type="date"
                                value={profileForm.birthday}
                                onChange={(e) => updateProfile('birthday', e.target.value)}
                                placeholder="Select your birthday"
                                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-gaming-primary focus:outline-none transition-colors"
                              />
                            </div>
                            
                            <div>
                              <label className="text-gray-400 text-sm mb-1 block">Discord Tag</label>
                              <input
                                type="text"
                                value={profileForm.discordTag}
                                onChange={(e) => {
                                  updateProfile('discordTag', e.target.value)
                                  setProfileErrors(prev => {
                                    const newErrors = { ...prev }
                                    delete newErrors.discordTag
                                    return newErrors
                                  })
                                }}
                                placeholder="Username#1234"
                                className={`w-full px-4 py-2 bg-gray-800 text-white rounded-lg border focus:outline-none transition-colors ${
                                  profileErrors.discordTag 
                                    ? 'border-red-500 focus:border-red-600' 
                                    : 'border-gray-700 focus:border-gaming-primary'
                                }`}
                              />
                              {profileErrors.discordTag && (
                                <p className="text-red-400 text-sm mt-1">{profileErrors.discordTag}</p>
                              )}
                            </div>
                            
                            <div>
                              <label className="text-gray-400 text-sm mb-1 block">Steam Profile</label>
                              <input
                                type="text"
                                value={profileForm.steamProfile}
                                onChange={(e) => updateProfile('steamProfile', e.target.value)}
                                placeholder="SteamID64 or custom URL"
                                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-gaming-primary focus:outline-none transition-colors"
                              />
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-4 mt-6">
                            <button
                              onClick={saveProfile}
                              disabled={isSavingProfile}
                              className="px-6 py-3 bg-gaming-primary text-white rounded-lg hover:bg-gaming-primary/80 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isSavingProfile ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Save Changes
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => setIsEditingProfile(false)}
                              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Profile Stats */}
                    <div className="glass-morphism rounded-xl p-8">
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span>📊</span> Gaming Statistics
                      </h3>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gaming-primary mb-1">
                            {user?.gamingProfile?.gamesPlayed || 0}
                          </div>
                          <div className="text-gray-400 text-sm">Games Played</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gaming-secondary mb-1">
                            {user?.gamingProfile?.gamesCompleted || 0}
                          </div>
                          <div className="text-gray-400 text-sm">Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-400 mb-1">
                            {Math.floor((user?.gamingProfile?.totalPlaytime || 0) / 60)}h
                          </div>
                          <div className="text-gray-400 text-sm">Playtime</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-yellow-400 mb-1">
                            {user?.gamingProfile?.achievementsCount || 0}
                          </div>
                          <div className="text-gray-400 text-sm">Achievements</div>
                        </div>
                      </div>
                    </div>

                    {/* Connected Accounts */}
                    <div className="glass-morphism rounded-xl p-8">
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span>🔗</span> Connected Accounts
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold">S</span>
                            </div>
                            <div>
                              <div className="text-white font-medium">Steam</div>
                              <div className="text-gray-400 text-sm">
                                {user?.steamProfile ? `Connected: ${user.steamProfile}` : 'Not connected'}
                              </div>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm">
                            {user?.steamProfile ? 'Disconnect' : 'Connect'}
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold">D</span>
                            </div>
                            <div>
                              <div className="text-white font-medium">Discord</div>
                              <div className="text-gray-400 text-sm">
                                {user?.discordTag ? `Connected: ${user.discordTag}` : 'Not connected'}
                              </div>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm">
                            {user?.discordTag ? 'Disconnect' : 'Connect'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-8">
                <div className="glass-morphism rounded-xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="text-2xl">⚙️</span>
                    General Settings
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Language */}
                    <div>
                      <label htmlFor="language-select" className="text-white text-lg font-medium mb-3 block">Language</label>
                      <select 
                        id="language-select"
                        value={general.language}
                        onChange={(e) => updateGeneral('language', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-gaming-primary focus:outline-none"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="ja">日本語</option>
                        <option value="zh">中文</option>
                        <option value="ko">한국어</option>
                      </select>
                      <p className="text-gray-400 text-sm mt-2">Choose your preferred language for the interface</p>
                    </div>

                    {/* Timezone */}
                    <div>
                      <label htmlFor="timezone-select" className="text-white text-lg font-medium mb-3 block">Timezone</label>
                      <select 
                        id="timezone-select"
                        value={general.timezone}
                        onChange={(e) => updateGeneral('timezone', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-gaming-primary focus:outline-none"
                      >
                        <option value="UTC">UTC</option>
                        <option value="EST">Eastern Time (UTC-5)</option>
                        <option value="PST">Pacific Time (UTC-8)</option>
                        <option value="CST">Central Time (UTC-6)</option>
                        <option value="MST">Mountain Time (UTC-7)</option>
                        <option value="GMT">Greenwich Mean Time</option>
                        <option value="CET">Central European Time</option>
                        <option value="JST">Japan Standard Time</option>
                      </select>
                      <p className="text-gray-400 text-sm mt-2">Set your local timezone for accurate timestamps</p>
                    </div>

                    {/* Date Format */}
                    <div>
                      <label htmlFor="date-format-select" className="text-white text-lg font-medium mb-3 block">Date Format</label>
                      <select 
                        id="date-format-select"
                        value={general.dateFormat}
                        onChange={(e) => updateGeneral('dateFormat', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-gaming-primary focus:outline-none"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                      </select>
                      <p className="text-gray-400 text-sm mt-2">Preferred date display format</p>
                    </div>

                    {/* Auto Sync */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white text-lg font-medium">Auto Sync</div>
                        <span className="text-gray-400 text-sm">Automatically sync data with connected platforms</span>
                      </div>
                      <button
                        onClick={() => updateGeneral('autoSync', !general.autoSync)}
                        aria-label={`Toggle auto sync ${general.autoSync ? 'off' : 'on'}`}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          general.autoSync ? 'bg-gaming-accent' : 'bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                          general.autoSync ? 'translate-x-6' : 'translate-x-1'
                        }`}></span>
                      </button>
                    </div>

                    {/* Sync Interval */}
                    {general.autoSync && (
                      <div>
                        <label htmlFor="sync-interval-select" className="text-white text-lg font-medium mb-3 block">Sync Interval</label>
                        <select 
                          id="sync-interval-select"
                          value={general.syncInterval}
                          onChange={(e) => updateGeneral('syncInterval', parseInt(e.target.value))}
                          className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-gaming-primary focus:outline-none"
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={180}>3 hours</option>
                          <option value={360}>6 hours</option>
                          <option value={720}>12 hours</option>
                          <option value={1440}>24 hours</option>
                        </select>
                        <p className="text-gray-400 text-sm mt-2">How often to sync with connected platforms</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* System Information */}
                <div className="glass-morphism rounded-xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="text-xl">💻</span>
                    System Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="text-gray-400 text-sm mb-1">Application Version</div>
                      <div className="text-white font-medium">GamePilot v1.0.0</div>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="text-gray-400 text-sm mb-1">Browser</div>
                      <div className="text-white font-medium">{navigator.userAgent.split(' ')[0]}</div>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="text-gray-400 text-sm mb-1">Platform</div>
                      <div className="text-white font-medium">{navigator.platform}</div>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="text-gray-400 text-sm mb-1">Screen Resolution</div>
                      <div className="text-white font-medium">{window.screen.width}x{window.screen.height}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mood & Persona Tab */}
            {activeTab === 'mood-persona' && (
              <div className="space-y-8">
                <div className="glass-morphism rounded-xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="text-2xl">🎭</span>
                    Mood & Persona Settings
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Persona Display */}
                    {persona && (
                      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Current Gaming Persona</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-400 mb-1">Archetype</div>
                            <div className="text-white font-medium text-lg">{persona.traits?.archetypeId}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400 mb-1">Confidence</div>
                            <div className="text-white font-medium text-lg">{Math.round((persona.confidence || 0) * 100)}%</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400 mb-1">Intensity</div>
                            <div className="text-white font-medium text-lg">{persona.traits?.intensity}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400 mb-1">Pacing</div>
                            <div className="text-white font-medium text-lg">{persona.traits?.pacing}</div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 mt-4">
                          Your persona is calculated based on your gaming patterns and preferences.
                        </p>
                      </div>
                    )}
                    
                    {/* Current Mood Status */}
                    {hasRecommendations && primaryMood && (
                      <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-500/30 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Current Mood State</h3>
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">😊</span>
                          <div>
                            <div className="text-white font-medium text-lg">{primaryMood}</div>
                            <div className="text-sm text-gray-400">Active mood for recommendations</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Mood & Persona Preferences */}
                    <div className="bg-gray-800/50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">Auto-select Mood</div>
                            <div className="text-sm text-gray-400">Automatically set mood based on time and patterns</div>
                          </div>
                          <button className="px-4 py-2 bg-gaming-accent text-white rounded-lg hover:bg-gaming-accent/80 transition-colors">
                            Enable
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">Persona Recalibration</div>
                            <div className="text-sm text-gray-400">Recalculate persona based on recent activity</div>
                          </div>
                          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                            Recalculate
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* API Keys Tab */}
            {activeTab === 'api-keys' && (
              <div className="glass-morphism rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-2xl">🔑</span>
                  API Keys
                </h2>
                
                <div className="mb-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">🔐 Security Notice</h3>
                  <p className="text-gray-300 text-sm">
                    API keys are sensitive information. They are stored locally in your browser and never sent to our servers.
                  </p>
                </div>
                
                <div className="space-y-6">
                  {/* YouTube API Key */}
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-medium">📺 YouTube</span>
                        <span className="text-gray-400 text-sm">
                          Gaming content and videos
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {apiKeys.youtubeApiKey && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                        <button
                          onClick={() => testApiKey('youtube')}
                          disabled={testingApiKey === 'youtube'}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {testingApiKey === 'youtube' ? 'Testing...' : 'Test'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <input
                        id="youtube-api-key"
                        type="password"
                        value={apiKeys.youtubeApiKey}
                        onChange={(e) => updateApiKey('youtubeApiKey', e.target.value)}
                        placeholder="Enter YouTube API Key"
                        className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-gaming-primary focus:outline-none"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          Get your API key from Google Cloud Console
                        </span>
                        <button
                          onClick={() => window.open('https://console.cloud.google.com/apis/credentials', '_blank')}
                          className="text-xs text-blue-400 hover:text-blue-300 underline"
                        >
                          Get API Key
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Discord Bot Token */}
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-medium">💬 Discord Bot</span>
                        <span className="text-gray-400 text-sm">
                          Bot token for server management
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {apiKeys.discordBotToken && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                        <button
                          onClick={() => testApiKey('discord')}
                          disabled={testingApiKey === 'discord'}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {testingApiKey === 'discord' ? 'Testing...' : 'Test'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <input
                        id="discord-bot-token"
                        type="password"
                        value={apiKeys.discordBotToken}
                        onChange={(e) => updateApiKey('discordBotToken', e.target.value)}
                        placeholder="Enter Discord Bot Token"
                      />

                      {steamApiKeyState.error && (
                        <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                          <p className="text-red-400 text-sm">❌ {steamApiKeyState.error}</p>
                        </div>
                      )}

                      {steamApiKeyState.hasApiKey ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-gray-300 font-mono text-sm">
                                {steamApiKeyState.maskedKey || '****'}
                              </span>
                              <span className="text-green-400 text-sm">✅ Configured</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={handleSaveSteamApiKey}
                                disabled={steamApiKeyState.isLoading}
                                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
                              >
                                Update
                              </button>
                              <button
                                onClick={removeSteamApiKey}
                                disabled={steamApiKeyState.isLoading}
                                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                          <p className="text-gray-400 text-sm">
                            Your Steam API key is securely stored and used only for your game library access.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-600">
                            <div className="flex-1">
                              <p className="text-gray-300 text-sm mb-2">
                                No Steam API key configured. Get your free API key from Steam to import your games.
                              </p>
                              <div className="flex items-center gap-4">
                                <button
                                  onClick={handleSaveSteamApiKey}
                                  disabled={steamApiKeyState.isLoading}
                                  className="px-4 py-2 bg-gaming-primary text-white rounded-lg hover:bg-gaming-primary/80 transition-colors font-medium disabled:opacity-50"
                                >
                                  {steamApiKeyState.isLoading ? 'Saving...' : 'Add API Key'}
                                </button>
                                <button
                                  onClick={() => window.open('https://steamcommunity.com/dev/apikey', '_blank')}
                                  className="text-blue-400 hover:text-blue-300 underline text-sm"
                                >
                                  Get API Key from Steam →
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                            <h4 className="text-blue-400 font-medium mb-2">🎮 Why do I need a Steam API key?</h4>
                            <ul className="text-gray-300 text-sm space-y-1">
                              <li>• Import your Steam game library with images and details</li>
                              <li>• View game achievements and playtime statistics</li>
                              <li>• Access Steam Store information and pricing</li>
                              <li>• Enable game launching and session tracking</li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Other API Keys Section */}
                    <div className="p-6 bg-gray-800/50 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-4">Other Integrations</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-white font-medium">📺 YouTube API</span>
                            <span className="text-gray-400 text-sm">
                              Gaming videos and trailers
                            </span>
                          </div>
                          <span className="text-yellow-400 text-sm">Coming Soon</span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-white font-medium">💬 Discord API</span>
                            <span className="text-gray-400 text-sm">
                              Rich presence and communities
                            </span>
                          </div>
                          <span className="text-yellow-400 text-sm">Coming Soon</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
              <div className="glass-morphism rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-2xl">🔗</span>
                  Integrations
                </h2>
                
                <div className="mb-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">🔗 Platform Connections</h3>
                  <p className="text-gray-300 text-sm">
                    Connect your gaming platforms to sync data and enhance your experience.
                  </p>
                </div>
                
                <div className="space-y-4">
                  {/* Steam Integration */}
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-medium">🎮 Steam</span>
                        <span className="text-gray-400 text-sm">
                          Game library and achievements
                        </span>
                      </div>
                      <button
                        onClick={() => updateIntegration('steam', !integrations.steamConnected)}
                        aria-label={`Toggle Steam integration ${integrations.steamConnected ? 'off' : 'on'}`}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          integrations.steamConnected ? 'bg-gaming-accent' : 'bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                          integrations.steamConnected ? 'translate-x-6' : 'translate-x-1'
                        }`}></span>
                      </button>
                    </div>
                    
                    {integrations.steamConnected && (
                      <div className="mt-3 p-3 bg-gray-900/50 rounded-lg">
                        <div className="text-sm text-gray-300">
                          ✅ Connected as {integrations.steamUsername || 'User'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Other Integrations */}
                  {(['discord', 'youtube', 'gog', 'epic', 'twitch', 'reddit', 'twitter', 'spotify'] as const).map((platform) => {
                    const isConnected = platform === 'discord' ? integrations.discordConnected :
                                       platform === 'youtube' ? integrations.youtubeConnected :
                                       platform === 'gog' ? integrations.gogConnected :
                                       platform === 'epic' ? integrations.epicConnected :
                                       platform === 'twitch' ? false :
                                       platform === 'reddit' ? false :
                                       platform === 'twitter' ? false :
                                       platform === 'spotify' ? false : false
                    
                    return (
                      <div key={platform} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-white font-medium capitalize">
                            {platform === 'discord' && '💬 Discord'}
                            {platform === 'youtube' && '📺 YouTube'}
                            {platform === 'gog' && '🎯 GOG'}
                            {platform === 'epic' && '🚀 Epic Games'}
                            {platform === 'twitch' && '🎬 Twitch'}
                            {platform === 'reddit' && '🤖 Reddit'}
                            {platform === 'twitter' && '🐦 Twitter/X'}
                            {platform === 'spotify' && '🎵 Spotify'}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {platform === 'discord' && 'Rich presence and chat'}
                            {platform === 'youtube' && 'Game videos and trailers'}
                            {platform === 'gog' && 'GOG galaxy integration'}
                            {platform === 'epic' && 'Epic games store'}
                            {platform === 'twitch' && 'Live streaming platform'}
                            {platform === 'reddit' && 'Gaming discussions'}
                            {platform === 'twitter' && 'Gaming news and updates'}
                            {platform === 'spotify' && 'Music and playlists'}
                          </span>
                        </div>
                        <button
                          onClick={() => updateIntegration(platform, !isConnected)}
                          aria-label={`Toggle ${platform} integration ${isConnected ? 'off' : 'on'}`}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            isConnected ? 'bg-gaming-accent' : 'bg-gray-600'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                            isConnected ? 'translate-x-6' : 'translate-x-1'
                          }`}></span>
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-8">
                <div className="glass-morphism rounded-xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="text-2xl">🔔</span>
                    Notification Preferences
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Gaming Notifications */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span>🎮</span>
                        Gaming Notifications
                      </h3>
                      <div className="space-y-4">
                        {(['achievements', 'friendActivity', 'gameUpdates'] as const).map((type) => (
                          <div key={type} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                            <div>
                              <div className="text-white font-medium">
                                {type === 'achievements' && '🏆 Achievement Unlocked'}
                                {type === 'friendActivity' && '👥 Friend Activity'}
                                {type === 'gameUpdates' && '📰 Game Updates'}
                              </div>
                              <span className="text-gray-400 text-sm">
                                {type === 'achievements' && 'Get notified when you unlock new achievements'}
                                {type === 'friendActivity' && 'See when friends come online or start playing'}
                                {type === 'gameUpdates' && 'Updates about your games and DLC'}
                              </span>
                            </div>
                            <button
                              onClick={() => updateNotification(type as keyof typeof notifications, !notifications[type])}
                              aria-label={`Toggle ${type} notifications ${notifications[type] ? 'off' : 'on'}`}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                notifications[type] ? 'bg-gaming-accent' : 'bg-gray-600'
                              }`}
                            >
                              <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                                notifications[type] ? 'translate-x-6' : 'translate-x-1'
                              }`}></span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Platform Notifications */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span>🌐</span>
                        Platform Notifications
                      </h3>
                      <div className="space-y-4">
                        {(['discordMessages', 'youtubeNotifications'] as const).map((type) => (
                          <div key={type} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                            <div>
                              <div className="text-white font-medium">
                                {type === 'discordMessages' && '💬 Discord Messages'}
                                {type === 'youtubeNotifications' && '📺 YouTube Notifications'}
                              </div>
                              <span className="text-gray-400 text-sm">
                                {type === 'discordMessages' && 'Receive Discord message notifications'}
                                {type === 'youtubeNotifications' && 'YouTube video recommendations and updates'}
                              </span>
                            </div>
                            <button
                              onClick={() => updateNotification(type as keyof typeof notifications, !notifications[type])}
                              aria-label={`Toggle ${type} notifications ${notifications[type] ? 'off' : 'on'}`}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                notifications[type] ? 'bg-gaming-accent' : 'bg-gray-600'
                              }`}
                            >
                              <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                                notifications[type] ? 'translate-x-6' : 'translate-x-1'
                              }`}></span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* General Notifications */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span>📢</span>
                        General Notifications
                      </h3>
                      <div className="space-y-4">
                        {(['news'] as const).map((type) => (
                          <div key={type} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                            <div>
                              <div className="text-white font-medium">
                                {type === 'news' && '📰 Gaming News'}
                              </div>
                              <span className="text-gray-400 text-sm">
                                {type === 'news' && 'Latest gaming news and updates'}
                              </span>
                            </div>
                            <button
                              onClick={() => updateNotification(type as keyof typeof notifications, !notifications[type])}
                              aria-label={`Toggle ${type} notifications ${notifications[type] ? 'off' : 'on'}`}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                notifications[type] ? 'bg-gaming-accent' : 'bg-gray-600'
                              }`}
                            >
                              <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                                notifications[type] ? 'translate-x-6' : 'translate-x-1'
                              }`}></span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-8">
                <div className="glass-morphism rounded-xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="text-2xl">🔒</span>
                    Privacy Settings
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Profile Privacy */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span>👤</span>
                        Profile Privacy
                      </h3>
                      <div className="space-y-4">
                        {(['profilePublic', 'showPlaytime', 'shareAchievements'] as const).map((setting) => (
                          <div key={setting} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                            <div>
                              <div className="text-white font-medium">
                                {setting === 'profilePublic' && '🌍 Public Profile'}
                                {setting === 'showPlaytime' && '⏱️ Show Playtime'}
                                {setting === 'shareAchievements' && '🏆 Share Achievements'}
                              </div>
                              <span className="text-gray-400 text-sm">
                                {setting === 'profilePublic' && 'Make profile visible to other users'}
                                {setting === 'showPlaytime' && 'Display total playtime on profile'}
                                {setting === 'shareAchievements' && 'Share achievements on social media'}
                              </span>
                            </div>
                            <button
                              onClick={() => updatePrivacy(setting as keyof typeof privacy, !privacy[setting])}
                              aria-label={`Toggle ${setting} ${privacy[setting] ? 'off' : 'on'}`}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                privacy[setting] ? 'bg-gaming-accent' : 'bg-gray-600'
                              }`}
                            >
                              <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                                privacy[setting] ? 'translate-x-6' : 'translate-x-1'
                              }`}></span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Data & Analytics */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span>📊</span>
                        Data & Analytics
                      </h3>
                      <div className="space-y-4">
                        {(['dataCollection', 'analyticsEnabled'] as const).map((setting) => (
                          <div key={setting} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                            <div>
                              <div className="text-white font-medium">
                                {setting === 'dataCollection' && '📊 Data Collection'}
                                {setting === 'analyticsEnabled' && '📈 Analytics'}
                              </div>
                              <span className="text-gray-400 text-sm">
                                {setting === 'dataCollection' && 'Allow data collection for improvements'}
                                {setting === 'analyticsEnabled' && 'Help improve GamePilot with usage analytics'}
                              </span>
                            </div>
                            <button
                              onClick={() => updatePrivacy(setting as keyof typeof privacy, !privacy[setting])}
                              aria-label={`Toggle ${setting} ${privacy[setting] ? 'off' : 'on'}`}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                privacy[setting] ? 'bg-gaming-accent' : 'bg-gray-600'
                              }`}
                            >
                              <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                                privacy[setting] ? 'translate-x-6' : 'translate-x-1'
                              }`}></span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Emulators Tab */}
            {activeTab === 'emulators' && (
              <div className="glass-morphism rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-2xl">🎮</span>
                  Emulator Configuration
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-medium">
                        🎮 Retro Gaming Support
                      </span>
                      <span className="text-gray-400 text-sm">
                        Configure emulators for retro game libraries
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        emulators.length > 0 
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                          : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                      }`}>
                        {emulators.length} configured
                      </span>
                      <button
                        onClick={openEmulatorConfig}
                        className="px-4 py-2 bg-gaming-primary text-white rounded-lg hover:bg-gaming-primary/80 transition-colors font-medium flex items-center gap-2"
                      >
                        <span>⚙️</span>
                        <span>Configure</span>
                      </button>
                    </div>
                  </div>

                  {emulators.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-white mb-3">Configured Emulators</h3>
                      {emulators.map((config) => (
                        <div key={config.platform} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-white font-medium">{config.name}</span>
                            <span className="text-gray-400 text-sm">
                              {config.supportedSystems.join(', ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              config.executablePath ? 'bg-green-500' : 'bg-yellow-500'
                            }`}></span>
                            <span className="text-gray-400 text-sm">
                              {config.executablePath ? 'Ready' : 'Needs path'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-8">
            <button
              onClick={() => {
                setGeneral({
                  language: 'en',
                  timezone: 'UTC',
                  dateFormat: 'MM/DD/YYYY',
                  autoSync: true,
                  syncInterval: 30
                })
                setNotifications({
                  achievements: true,
                  friendActivity: true,
                  gameUpdates: false,
                  news: false,
                  discordMessages: true,
                  youtubeNotifications: false
                })
                setPrivacy({
                  profilePublic: true,
                  showPlaytime: true,
                  shareAchievements: false,
                  dataCollection: true,
                  analyticsEnabled: true
                })
              }}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              🔄 Reset to Defaults
            </button>
          </div>
        </div>
      </div>

      {/* Birthday Celebration */}
      {showBirthdayCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative z-10 text-center animate-bounce">
            <div className="text-6xl mb-4">🎂</div>
            <div className="text-4xl font-bold text-white mb-2">
              Happy Birthday, {user?.username || 'Gamer'}!
            </div>
            <div className="text-xl text-gray-300 mb-4">
              🎉🎈🎊
            </div>
            <div className="text-lg text-gaming-accent">
              Wishing you an amazing day filled with gaming adventures!
            </div>
            <div className="mt-6 flex justify-center gap-2">
              <span className="text-2xl animate-pulse">🎮</span>
              <span className="text-2xl animate-pulse delay-100">🎯</span>
              <span className="text-2xl animate-pulse delay-200">🏆</span>
              <span className="text-2xl animate-pulse delay-300">🌟</span>
            </div>
          </div>
        </div>
      )}

      {/* Emulator Configuration Modal */}
      <EmulatorConfig
        isOpen={showEmulatorConfig}
        onClose={closeEmulatorConfig}
        onSave={handleEmulatorConfigSave}
      />
    </>
  )
}

