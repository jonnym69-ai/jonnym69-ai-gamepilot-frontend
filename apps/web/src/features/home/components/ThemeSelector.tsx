import React, { useState, useEffect } from 'react'
import { themes, getThemeById, getSavedTheme, saveThemePreference, applyTheme } from '../utils/themeUtils'
import type { Theme } from '../utils/themeUtils'

interface ThemeSelectorProps {
  onThemeChange?: (theme: Theme) => void
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onThemeChange }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(getThemeById(getSavedTheme()))

  useEffect(() => {
    // Apply saved theme on mount
    applyTheme(currentTheme.id)
  }, [])

  const handleThemeSelect = (themeId: string) => {
    const theme = getThemeById(themeId)
    if (theme) {
      setCurrentTheme(theme)
      applyTheme(theme.id)
      saveThemePreference(theme.id)
      onThemeChange?.(theme)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-white text-sm">Theme:</span>
      <select
        value={currentTheme.id}
        onChange={(e) => handleThemeSelect(e.target.value)}
        className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-gaming-accent focus:outline-none text-sm"
      >
        {themes.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.name}
          </option>
        ))}
      </select>
      <div 
        className="w-6 h-6 rounded-full border-2 border-gray-700"
        style={{ 
          background: `linear-gradient(135deg, ${currentTheme.primary})`,
          borderColor: currentTheme.accent 
        }}
      />
    </div>
  )
}
