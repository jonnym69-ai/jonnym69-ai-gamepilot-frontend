import { UserIdentity, UserProfile, UserPreferences, UserPlaystyle, UserGenre, UserMood, UserStats } from '../types'

const STORAGE_KEYS = {
  USER_IDENTITY: 'gamepilot-user-identity',
  USER_PROFILE: 'gamepilot-user-profile',
  USER_PREFERENCES: 'gamepilot-user-preferences',
  USER_PLAYSTYLE: 'gamepilot-user-playstyle',
  USER_GENRES: 'gamepilot-user-genres',
  USER_MOODS: 'gamepilot-user-moods',
  USER_STATS: 'gamepilot-user-stats'
} as const

export class LocalStorageService {
  // Generic methods
  private get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Error reading from localStorage for key ${key}:`, error)
      return null
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error writing to localStorage for key ${key}:`, error)
    }
  }

  private remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing from localStorage for key ${key}:`, error)
    }
  }

  // User Identity methods
  getUserIdentity(): UserIdentity | null {
    return this.get<UserIdentity>(STORAGE_KEYS.USER_IDENTITY)
  }

  setUserIdentity(identity: UserIdentity): void {
    this.set(STORAGE_KEYS.USER_IDENTITY, identity)
  }

  // User Profile methods
  getUserProfile(): UserProfile | null {
    return this.get<UserProfile>(STORAGE_KEYS.USER_PROFILE)
  }

  setUserProfile(profile: UserProfile): void {
    this.set(STORAGE_KEYS.USER_PROFILE, profile)
  }

  // User Preferences methods
  getUserPreferences(): UserPreferences | null {
    return this.get<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES)
  }

  setUserPreferences(preferences: UserPreferences): void {
    this.set(STORAGE_KEYS.USER_PREFERENCES, preferences)
  }

  // User Playstyle methods
  getUserPlaystyle(): UserPlaystyle | null {
    return this.get<UserPlaystyle>(STORAGE_KEYS.USER_PLAYSTYLE)
  }

  setUserPlaystyle(playstyle: UserPlaystyle): void {
    this.set(STORAGE_KEYS.USER_PLAYSTYLE, playstyle)
  }

  // User Genres methods
  getUserGenres(): UserGenre[] {
    return this.get<UserGenre[]>(STORAGE_KEYS.USER_GENRES) || []
  }

  setUserGenres(genres: UserGenre[]): void {
    this.set(STORAGE_KEYS.USER_GENRES, genres)
  }

  // User Moods methods
  getUserMoods(): UserMood[] {
    return this.get<UserMood[]>(STORAGE_KEYS.USER_MOODS) || []
  }

  setUserMoods(moods: UserMood[]): void {
    this.set(STORAGE_KEYS.USER_MOODS, moods)
  }

  // User Stats methods
  getUserStats(): UserStats | null {
    return this.get<UserStats>(STORAGE_KEYS.USER_STATS)
  }

  setUserStats(stats: UserStats): void {
    this.set(STORAGE_KEYS.USER_STATS, stats)
  }

  // Initialize default data for new users
  initializeDefaultData(): UserIdentity {
    const defaultIdentity: UserIdentity = {
      profile: {
        id: `user-${Date.now()}`,
        username: `gamer_${Math.floor(Math.random() * 10000)}`,
        displayName: 'New Gamer',
        avatar: '',
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        bio: 'Passionate gamer with diverse interests',
        isPublic: false,
        level: 1,
        experience: 0
      },
      preferences: {
        theme: 'dark',
        language: 'en',
        timezone: 'UTC',
        notifications: {
          email: true,
          push: true,
          achievements: true,
          recommendations: true,
          friendActivity: false
        },
        privacy: {
          profileVisibility: 'private',
          showPlaytime: true,
          showAchievements: true,
          showGameLibrary: false
        },
        display: {
          compactMode: false,
          showGameCovers: true,
          animateTransitions: true,
          showRatings: true
        },
        profileVisibility: 'private',
        showPlaytime: true,
        showAchievements: true,
        showGameLibrary: false
      },
      playstyle: {
        primary: {
          id: 'casual',
          name: 'Casual',
          description: 'Relaxed gaming experience',
          icon: '🎮',
          color: '#4CAF50',
          traits: ['relaxed', 'exploratory']
        },
        traits: ['relaxed', 'exploratory'],
        preferences: {
          sessionLength: 'short',
          difficulty: 'casual',
          socialPreference: 'solo',
          storyFocus: 50,
          graphicsFocus: 50,
          gameplayFocus: 50
        }
      },
      favoriteGenres: [],
      favoriteMoods: [],
      stats: {
        totalPlaytime: 0,
        gamesPlayed: 0,
        gamesCompleted: 0,
        achievementsUnlocked: 0,
        averageRating: 0,
        favoriteGenres: [],
        favoriteMoods: [],
        currentStreak: 0,
        longestStreak: 0
      },
      connectedPlatforms: [],
      customTags: []
    }

    // Save default data if nothing exists
    if (!this.get<UserIdentity>(STORAGE_KEYS.USER_IDENTITY)) {
      this.set(STORAGE_KEYS.USER_IDENTITY, defaultIdentity)
    }

    return this.get<UserIdentity>(STORAGE_KEYS.USER_IDENTITY) || defaultIdentity
  }

  // Utility methods
  clearAllUserData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      this.remove(key)
    })
  }

  // Export/Import functionality
  exportUserData(): string | null {
    const identity = this.getUserIdentity()
    if (!identity) return null
    
    try {
      return JSON.stringify(identity, null, 2)
    } catch (error) {
      console.error('Error exporting user data:', error)
      return null
    }
  }

  importUserData(jsonData: string): boolean {
    try {
      const identity = JSON.parse(jsonData)
      if (identity && typeof identity === 'object') {
        this.setUserIdentity(identity)
        return true
      }
      return false
    } catch (error) {
      console.error('Error importing user data:', error)
      return false
    }
  }

  // Enhanced preference updates
  updateUserPreferences(updates: Partial<UserPreferences>): UserPreferences | null {
    const currentPrefs = this.getUserPreferences()
    if (!currentPrefs) return null
    
    const updatedPrefs = {
      ...currentPrefs,
      ...updates
    }
    
    this.setUserPreferences(updatedPrefs)
    return updatedPrefs
  }

  // Enhanced playstyle updates
  updateUserPlaystyle(updates: Partial<UserPlaystyle>): UserPlaystyle | null {
    const currentPlaystyle = this.getUserPlaystyle()
    if (!currentPlaystyle) return null
    
    const updatedPlaystyle = {
      ...currentPlaystyle,
      ...updates
    }
    
    this.setUserPlaystyle(updatedPlaystyle)
    return updatedPlaystyle
  }

  // Enhanced genre management
  updateUserGenre(genreId: string, updates: Partial<UserGenre>): UserGenre[] | null {
    const currentGenres = this.getUserGenres()
    const genreIndex = currentGenres.findIndex(g => g.id === genreId)
    
    if (genreIndex >= 0) {
      const updatedGenres = [...currentGenres]
      updatedGenres[genreIndex] = { ...updatedGenres[genreIndex], ...updates }
      this.setUserGenres(updatedGenres)
      return updatedGenres
    }
    
    return currentGenres
  }

  // Enhanced mood management
  updateUserMood(moodId: string, updates: Partial<UserMood>): UserMood[] | null {
    const currentMoods = this.getUserMoods()
    const moodIndex = currentMoods.findIndex(m => m.id === moodId)
    
    if (moodIndex >= 0) {
      const updatedMoods = [...currentMoods]
      updatedMoods[moodIndex] = { ...updatedMoods[moodIndex], ...updates }
      this.setUserMoods(updatedMoods)
      return updatedMoods
    }
    
    return currentMoods
  }

  // Enhanced stats management
  updateUserStats(updates: Partial<UserStats>): UserStats | null {
    const currentStats = this.getUserStats()
    if (!currentStats) return null
    
    const updatedStats = {
      ...currentStats,
      ...updates
    }
    
    this.setUserStats(updatedStats)
    return updatedStats
  }
}
