// Theme and background customization system
export interface Theme {
  id: string
  name: string
  background: string
  primary: string
  secondary: string
  accent: string
}

export const themes: Theme[] = [
  {
    id: 'gaming-dark',
    name: 'Gaming Dark',
    background: 'bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker',
    primary: 'from-gaming-primary to-gaming-secondary',
    secondary: 'from-gaming-accent to-gaming-primary',
    accent: 'gaming-accent'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    background: 'bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900',
    primary: 'from-purple-400 to-pink-600',
    secondary: 'from-indigo-400 to-purple-600',
    accent: 'purple-400'
  },
  {
    id: 'retro-gaming',
    name: 'Retro Gaming',
    background: 'bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900',
    primary: 'from-green-400 to-emerald-600',
    secondary: 'from-teal-400 to-green-600',
    accent: 'emerald-400'
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    background: 'bg-gradient-to-br from-blue-900 via-cyan-900 to-blue-900',
    primary: 'from-blue-400 to-cyan-600',
    secondary: 'from-cyan-400 to-blue-600',
    accent: 'cyan-400'
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    background: 'bg-gradient-to-br from-orange-900 via-red-900 to-yellow-900',
    primary: 'from-orange-400 to-red-600',
    secondary: 'from-red-400 to-orange-600',
    accent: 'orange-400'
  }
]

export const getThemeById = (id: string): Theme => {
  return themes.find(theme => theme.id === id) || themes[0]
}

export const saveThemePreference = (themeId: string) => {
  localStorage.setItem('gamepilot-theme', themeId)
}

export const getSavedTheme = (): string => {
  return localStorage.getItem('gamepilot-theme') || 'gaming-dark'
}

export const applyTheme = (themeId: string) => {
  const theme = getThemeById(themeId)
  if (!theme) return
  
  // Remove existing theme classes
  document.body.className = document.body.className.replace(/bg-gradient-to-br from-\S+ via-\S+ to-\S+/g, '')
  
  // Apply new theme
  document.body.className += ` ${theme.background}`
  
  // Update CSS variables
  const root = document.documentElement
  root.style.setProperty('--primary-gradient', theme.primary)
  root.style.setProperty('--secondary-gradient', theme.secondary)
  root.style.setProperty('--accent-color', theme.accent)
}
