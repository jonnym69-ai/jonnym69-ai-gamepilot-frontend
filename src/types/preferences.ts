export interface MoodCustomization {
  name?: string
  emoji?: string
  description?: string
}

export interface UserMoodCustomizations {
  [moodId: string]: MoodCustomization
}

export interface UserPreferences {
  moodCustomizations: UserMoodCustomizations
  theme: 'dark' | 'light' | 'auto'
  language: string
}
