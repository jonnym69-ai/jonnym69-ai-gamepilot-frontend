import React, { useState, useEffect } from 'react'
import { UserProfile as UserProfileType, UserPreferences as UserPreferencesType, UserGenre as UserGenreType, UserMood as UserMoodType, UserPlaystyle as UserPlaystyleType } from './types'
import { useLibraryPersona } from '../../hooks/persona'
import { useMoodRecommendations } from '../../hooks/useMoodRecommendations'
import { useLibraryStore } from '../../stores/useLibraryStore'
import { UserProfile } from './components/UserProfile'
import { Preferences } from './components/Preferences'
import { GenreSelector } from './components/GenreSelector'
import { MoodSelector } from './components/MoodSelector'
import { PlaystyleIndicatorComponent as PlaystyleIndicator } from './components/PlaystyleIndicator'
import { LocalStorageService } from './services/localStorage'

const localStorageService = new LocalStorageService()

export const Identity: React.FC = () => {
  const { intelligence, actions, games } = useLibraryStore()
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'genres' | 'moods' | 'playstyle'>('profile')
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null)
  const [userPreferences, setUserPreferences] = useState<UserPreferencesType | null>(null)
  const [userGenres, setUserGenres] = useState<UserGenreType[]>([])
  const [userMoods, setUserMoods] = useState<UserMoodType[]>([])
  const [userPlaystyle, setUserPlaystyle] = useState<UserPlaystyleType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Get persona and mood data
  const persona = useLibraryPersona()
  const { primaryMood, hasRecommendations } = useMoodRecommendations({ games })

  useEffect(() => {
    const loadUserData = () => {
      // Load profile from localStorage (keep existing behavior)
      const identity = localStorageService.initializeDefaultData()
      setUserProfile(identity.profile)
      setUserPreferences(identity.preferences)
      setUserPlaystyle(identity.playstyle)
      
      // Load genres and moods from intelligence store
      setUserGenres((intelligence.preferredGenres as string[]).map(id => ({ 
        id, 
        name: id ? id.charAt(0).toUpperCase() + id.slice(1) : 'Unknown',
        preference: 75 // Default preference value
      })))
      setUserMoods((intelligence.preferredMoods as string[]).map(id => ({ 
        id, 
        name: id ? id.charAt(0).toUpperCase() + id.slice(1) : 'Unknown',
        emoji: '😊', // Default emoji
        color: '#3b82f6', // Default color
        frequency: 3, // Default frequency
        preference: 75, // Default preference value
        associatedGenres: [] // Default associated genres
      })))
      
      setIsLoading(false)
    }

    loadUserData()
  }, [intelligence.preferredGenres, intelligence.preferredMoods])

  const handleProfileUpdate = (profile: UserProfileType) => {
    setUserProfile(profile)
  }

  const handlePreferencesUpdate = (preferences: UserPreferencesType) => {
    setUserPreferences(preferences)
  }

  const handleGenresUpdate = (genres: UserGenreType[]) => {
    setUserGenres(genres)
    // Update the intelligence store with genre preferences
    actions.setPreferredGenres(genres.map(g => g.id))
  }

  const handleMoodsUpdate = (moods: UserMoodType[]) => {
    setUserMoods(moods)
    // Update the intelligence store with mood preferences
    actions.setPreferredMoods(moods.map(m => m.id))
  }

  const handlePlaystyleUpdate = (playstyle: UserPlaystyleType) => {
    setUserPlaystyle(playstyle)
    // Update the intelligence store with session style preference
    actions.setPreferredSessionStyle(playstyle.preferences.sessionLength)
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'genres', label: 'Genres', icon: '🎭' },
    { id: 'moods', label: 'Moods', icon: '😊' },
    { id: 'playstyle', label: 'Playstyle', icon: '🎯' }
  ] as const

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">👤</span>
          </div>
          <p className="text-gray-400">Loading your identity...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Hero Section with Personalization */}
        <header className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold font-gaming bg-gradient-to-r from-gaming-primary to-gaming-accent to-gaming-secondary bg-clip-text text-transparent mb-2">
                Gaming Identity
              </h1>
              <p className="text-gray-300">
                Your unified profile across all gaming platforms
              </p>
              
              {/* Smart Integration Hints */}
              <div className="flex items-center gap-4 mt-4 text-sm">
                <a href="/customisation" className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors">
                  <span>🎨</span>
                  <span>Customize Appearance</span>
                </a>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400">Personalize themes, colors, and presets</span>
              </div>
              
              {/* Current Mood Status */}
              {hasRecommendations && primaryMood && (
                <div className="mt-4 pt-4 border-t border-purple-500/30">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">Current Mood:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">😊</span>
                      <span className="text-white font-medium">{primaryMood}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Achievement and Stats Summary */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">0</div>
                <div className="text-xs text-gray-400">Achievements</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">0</div>
                <div className="text-xs text-gray-400">Snapshots</div>
              </div>
              <button
                className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 flex items-center gap-2"
              >
                <span>🏆</span>
                View Achievements
              </button>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 p-1 glass-morphism rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                  ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-gaming-primary to-gaming-secondary text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'profile' && (
            <UserProfile onProfileUpdate={handleProfileUpdate} />
          )}

          {activeTab === 'preferences' && (
            <Preferences onPreferencesUpdate={handlePreferencesUpdate} />
          )}

          {activeTab === 'genres' && (
            <GenreSelector onGenresUpdate={handleGenresUpdate} />
          )}

          {activeTab === 'moods' && (
            <MoodSelector onMoodsUpdate={handleMoodsUpdate} />
          )}

          {activeTab === 'playstyle' && (
            <PlaystyleIndicator onPlaystyleUpdate={handlePlaystyleUpdate} />
          )}
        </div>

        {/* Identity Summary */}
        <div className="mt-12 glass-morphism rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
            <span>📊</span>
            Identity Summary
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Profile Summary */}
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
              <h3 className="text-white font-medium mb-1">{userProfile?.displayName}</h3>
              <p className="text-sm text-gray-400">@{userProfile?.username}</p>
            </div>

            {/* Genres Summary */}
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-xl">🎭</span>
              </div>
              <h3 className="text-white font-medium mb-1">{userGenres.length} Genres</h3>
              <p className="text-sm text-gray-400">
                {userGenres.length > 0 ? userGenres[0].name : 'None selected'}
              </p>
            </div>

            {/* Moods Summary */}
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-xl">😊</span>
              </div>
              <h3 className="text-white font-medium mb-1">{userMoods.length} Moods</h3>
              <p className="text-sm text-gray-400">
                {userMoods.length > 0 ? userMoods[0].name : 'None selected'}
              </p>
            </div>

            {/* Playstyle Summary */}
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-xl">🎯</span>
              </div>
              <h3 className="text-white font-medium mb-1">{userPlaystyle?.primary.name}</h3>
              <p className="text-sm text-gray-400">
                {userPlaystyle?.secondary?.name || 'No secondary'}
              </p>
            </div>
          </div>

          {/* Completion Status */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Profile Completion</span>
              <span className="text-sm text-white">
                {Math.round((
                  (userProfile?.displayName ? 20 : 0) +
                  (userGenres.length > 0 ? 20 : 0) +
                  (userMoods.length > 0 ? 20 : 0) +
                  (userPlaystyle?.primary ? 20 : 0) +
                  (userPreferences ? 20 : 0)
                ))}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-gaming-primary to-gaming-secondary h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    (userProfile?.displayName ? 20 : 0) +
                    (userGenres.length > 0 ? 20 : 0) +
                    (userMoods.length > 0 ? 20 : 0) +
                    (userPlaystyle?.primary ? 20 : 0) +
                    (userPreferences ? 20 : 0)
                  }%`
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Complete your profile to get better recommendations and a more personalized experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
