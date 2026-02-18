import { UserMoodCustomizations, MoodCustomization } from '../types/preferences'

const PREFERENCES_KEY = 'gamepilot_user_preferences'

export interface UserPreferences {
  moodCustomizations: UserMoodCustomizations
  theme: 'dark' | 'light' | 'auto'
  language: string
}

const DEFAULT_PREFERENCES: UserPreferences = {
  moodCustomizations: {},
  theme: 'dark',
  language: 'en'
}

export function getUserPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...DEFAULT_PREFERENCES, ...parsed }
    }
  } catch (error) {
    console.warn('Failed to load user preferences:', error)
  }
  return DEFAULT_PREFERENCES
}

export function saveUserPreferences(preferences: Partial<UserPreferences>): void {
  try {
    const current = getUserPreferences()
    const updated = { ...current, ...preferences }
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated))
  } catch (error) {
    console.warn('Failed to save user preferences:', error)
  }
}

export function getMoodCustomizations(): UserMoodCustomizations {
  return getUserPreferences().moodCustomizations
}

export function saveMoodCustomization(moodId: string, customization: MoodCustomization): void {
  const current = getUserPreferences()
  const updatedCustomizations = {
    ...current.moodCustomizations,
    [moodId]: customization
  }
  saveUserPreferences({ moodCustomizations: updatedCustomizations })
}

export function removeMoodCustomization(moodId: string): void {
  const current = getUserPreferences()
  const { [moodId]: removed, ...rest } = current.moodCustomizations
  saveUserPreferences({ moodCustomizations: rest })
}

export function resetAllMoodCustomizations(): void {
  saveUserPreferences({ moodCustomizations: {} })
}
