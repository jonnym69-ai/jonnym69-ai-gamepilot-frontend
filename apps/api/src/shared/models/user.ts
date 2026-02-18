// Canonical User model for GamePilot platform
// This model unifies all User interfaces across the monorepo

import type { PlatformCode } from '../types'
import type { GenreId, MoodId } from '@gamepilot/static-data'

// Import UserIntegration from the integration module
import type { UserIntegration } from './integration'

// Core User interface - the canonical model
export interface User {
  // Basic user information
  id: string
  email: string
  username: string
  displayName: string
  avatar?: string
  bio?: string
  location?: string
  website?: string
  timezone: string
  
  // Extended fields for Settings integration
  birthday?: string
  discordTag?: string
  steamProfile?: string
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  lastActive?: Date
  
  // Gaming Identity Profile
  gamingProfile: {
    // Platform preferences
    primaryPlatforms: PlatformCode[]
    
    // Genre preferences with affinity scores
    genreAffinities: Record<GenreId, number> // 0-100 scale
    
    // Playstyle archetypes
    playstyleArchetypes: PlaystyleArchetype[]
    
    // Mood profile
    moodProfile: MoodProfile
    
    // Gaming statistics
    totalPlaytime: number
    gamesPlayed: number
    gamesCompleted: number
    achievementsCount: number
    averageRating: number
    
    // Current state
    currentStreak: number
    longestStreak: number
    favoriteGames: string[] // Game IDs
  }
  
  // Platform Integrations
  integrations: UserIntegration[]
  
  // Privacy & Preferences
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private'
    sharePlaytime: boolean
    shareAchievements: boolean
    shareGameLibrary: boolean
    allowFriendRequests: boolean
    showOnlineStatus: boolean
  }
  
  // User Preferences
  preferences: {
    theme: 'dark' | 'light' | 'auto'
    language: string
    notifications: {
      email: boolean
      push: boolean
      achievements: boolean
      recommendations: boolean
      friendActivity: boolean
      platformUpdates: boolean
    }
    display: {
      compactMode: boolean
      showGameCovers: boolean
      animateTransitions: boolean
      showRatings: boolean
    }
  }
  
  // Social Features
  social: {
    friends: string[] // User IDs
    blockedUsers: string[]
    favoriteGenres: GenreId[]
    customTags: string[]
  }
  
  // Custom fields for extensibility
  customFields?: CustomField[]
}

// Supporting interfaces for the canonical User model

export interface PlaystyleArchetype {
  id: string
  name: string
  description: string
  icon: string
  color: string // Tailwind gradient class
  traits: string[]
  score: number // 0-100 how strongly this fits the user
}

export interface MoodProfile {
  currentMood?: MoodId
  moodHistory: UserMoodEntry[]
  moodTriggers: string[]
  moodPreferences: Record<MoodId, {
    preference: number // 0-100 how much user likes this mood
    frequency: number // 1-5 how often they experience this mood
    lastExperienced?: Date
  }>
}

export interface UserMoodEntry {
  moodId: MoodId
  intensity: number // 1-10 scale
  timestamp: Date
  context?: string
  gameId?: string
}

export interface CustomField {
  id: string
  name: string
  value: string
  type: 'text' | 'email' | 'url' | 'textarea'
  isPublic: boolean
  order: number
}

// Enums for type safety

export enum PlaystyleArchetypeType {
  EXPLORER = 'explorer',
  ACHIEVER = 'achiever',
  STORYTELLER = 'storyteller',
  COMPETITOR = 'competitor',
  CREATOR = 'creator',
  SOCIALIZER = 'socializer'
}

export enum MoodType {
  NEUTRAL = 'neutral',
  COMPETITIVE = 'competitive',
  RELAXED = 'relaxed',
  FOCUSED = 'focused',
  SOCIAL = 'social',
  CREATIVE = 'creative',
  ADVENTUROUS = 'adventurous',
  STRATEGIC = 'strategic'
}

// Utility types for common operations

export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastActive' | 'gamingProfile' | 'integrations'> & {
  gamingProfile: Partial<User['gamingProfile']>
  integrations: UserIntegration[]
}

export type UpdateUserInput = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>

export type PublicUserProfile = Pick<User, 'id' | 'username' | 'displayName' | 'avatar' | 'bio' | 'gamingProfile'> & {
  gamingProfile: Pick<User['gamingProfile'], 'primaryPlatforms' | 'genreAffinities' | 'playstyleArchetypes' | 'totalPlaytime' | 'gamesPlayed' | 'achievementsCount'>
}

// Type guards and utilities

export function isValidUser(user: any): user is User {
  return (
    user &&
    typeof user.id === 'string' &&
    typeof user.email === 'string' &&
    typeof user.username === 'string' &&
    typeof user.displayName === 'string' &&
    typeof user.timezone === 'string' &&
    user.createdAt instanceof Date &&
    user.updatedAt instanceof Date &&
    isValidGamingProfile(user.gamingProfile) &&
    Array.isArray(user.integrations) &&
    isValidPrivacySettings(user.privacy) &&
    isValidPreferences(user.preferences) &&
    isValidSocialSettings(user.social)
  )
}

export function isValidGamingProfile(profile: any): boolean {
  return (
    profile &&
    Array.isArray(profile.primaryPlatforms) &&
    typeof profile.genreAffinities === 'object' &&
    Array.isArray(profile.playstyleArchetypes) &&
    profile.moodProfile &&
    typeof profile.totalPlaytime === 'number' &&
    typeof profile.gamesPlayed === 'number' &&
    typeof profile.gamesCompleted === 'number' &&
    typeof profile.achievementsCount === 'number' &&
    typeof profile.averageRating === 'number' &&
    typeof profile.currentStreak === 'number' &&
    typeof profile.longestStreak === 'number' &&
    Array.isArray(profile.favoriteGames)
  )
}

export function isValidPrivacySettings(privacy: any): boolean {
  return (
    privacy &&
    ['public', 'friends', 'private'].includes(privacy.profileVisibility) &&
    typeof privacy.sharePlaytime === 'boolean' &&
    typeof privacy.shareAchievements === 'boolean' &&
    typeof privacy.shareGameLibrary === 'boolean' &&
    typeof privacy.allowFriendRequests === 'boolean' &&
    typeof privacy.showOnlineStatus === 'boolean'
  )
}

export function isValidPreferences(preferences: any): boolean {
  return (
    preferences &&
    ['dark', 'light', 'auto'].includes(preferences.theme) &&
    typeof preferences.language === 'string' &&
    preferences.notifications &&
    typeof preferences.notifications.email === 'boolean' &&
    typeof preferences.notifications.push === 'boolean' &&
    typeof preferences.notifications.achievements === 'boolean' &&
    typeof preferences.notifications.recommendations === 'boolean' &&
    typeof preferences.notifications.friendActivity === 'boolean' &&
    typeof preferences.notifications.platformUpdates === 'boolean' &&
    preferences.display &&
    typeof preferences.display.compactMode === 'boolean' &&
    typeof preferences.display.showGameCovers === 'boolean' &&
    typeof preferences.display.animateTransitions === 'boolean' &&
    typeof preferences.display.showRatings === 'boolean'
  )
}

export function isValidSocialSettings(social: any): boolean {
  return (
    social &&
    Array.isArray(social.friends) &&
    Array.isArray(social.blockedUsers) &&
    Array.isArray(social.favoriteGenres) &&
    Array.isArray(social.customTags)
  )
}

export function isValidPlaystyleArchetype(archetype: any): boolean {
  return (
    archetype &&
    typeof archetype.id === 'string' &&
    typeof archetype.name === 'string' &&
    typeof archetype.description === 'string' &&
    typeof archetype.icon === 'string' &&
    typeof archetype.color === 'string' &&
    Array.isArray(archetype.traits) &&
    typeof archetype.score === 'number' &&
    archetype.score >= 0 && archetype.score <= 100
  )
}

export function isValidMoodProfile(moodProfile: any): boolean {
  return (
    moodProfile &&
    Array.isArray(moodProfile.moodHistory) &&
    Array.isArray(moodProfile.moodTriggers) &&
    typeof moodProfile.moodPreferences === 'object'
  )
}

export function isValidUserMoodEntry(entry: any): boolean {
  return (
    entry &&
    typeof entry.moodId === 'string' &&
    typeof entry.intensity === 'number' &&
    entry.intensity >= 1 && entry.intensity <= 10 &&
    entry.timestamp instanceof Date &&
    (typeof entry.context === 'string' || entry.context === undefined) &&
    (typeof entry.gameId === 'string' || entry.gameId === undefined)
  )
}

export function createDefaultUser(userData: {
  id: string
  email: string
  username: string
  displayName?: string
  timezone?: string
}): User {
  return {
    id: userData.id,
    email: userData.email,
    username: userData.username,
    displayName: userData.displayName || userData.username,
    timezone: userData.timezone || 'UTC',
    createdAt: new Date(),
    updatedAt: new Date(),
    gamingProfile: {
      primaryPlatforms: [],
      genreAffinities: {},
      playstyleArchetypes: [],
      moodProfile: {
        currentMood: undefined,
        moodHistory: [],
        moodTriggers: [],
        moodPreferences: {}
      },
      totalPlaytime: 0,
      gamesPlayed: 0,
      gamesCompleted: 0,
      achievementsCount: 0,
      averageRating: 0,
      currentStreak: 0,
      longestStreak: 0,
      favoriteGames: []
    },
    integrations: [],
    privacy: {
      profileVisibility: 'public',
      sharePlaytime: true,
      shareAchievements: true,
      shareGameLibrary: false,
      allowFriendRequests: true,
      showOnlineStatus: true
    },
    preferences: {
      theme: 'dark',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        achievements: true,
        recommendations: true,
        friendActivity: true,
        platformUpdates: false
      },
      display: {
        compactMode: false,
        showGameCovers: true,
        animateTransitions: true,
        showRatings: true
      }
    },
    social: {
      friends: [],
      blockedUsers: [],
      favoriteGenres: [],
      customTags: []
    }
  }
}
