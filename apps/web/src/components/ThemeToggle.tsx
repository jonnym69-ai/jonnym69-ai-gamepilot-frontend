import React, { useState, useEffect } from 'react'
import { useCustomisation, useCustomisationActions, type Theme } from '../features/customisation/customisationStore'

interface ThemeToggleProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const { theme } = useCustomisation()
  const { setGlobalSettings } = useCustomisationActions()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.setAttribute('data-theme', systemTheme)
    } else {
      root.setAttribute('data-theme', theme)
    }
  }, [theme, mounted])

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      const root = document.documentElement
      root.setAttribute('data-theme', e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const toggleTheme = () => {
    const themes: Theme[] = ['dark', 'light', 'system']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setGlobalSettings({ theme: themes[nextIndex] })
  }

  const getThemeIcon = (currentTheme: Theme) => {
    switch (currentTheme) {
      case 'dark':
        return '🌙'
      case 'light':
        return '☀️'
      case 'system':
        return '🌓'
      default:
        return '🌙'
    }
  }

  const getThemeLabel = (currentTheme: Theme) => {
    switch (currentTheme) {
      case 'dark':
        return 'Dark Mode'
      case 'light':
        return 'Light Mode'
      case 'system':
        return 'Auto Mode'
      default:
        return 'Dark Mode'
    }
  }

  const sizeClasses = {
    sm: 'p-2 text-sm',
    md: 'p-3 text-base',
    lg: 'p-4 text-lg'
  }

  if (!mounted) {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <div className="w-6 h-6 bg-gray-700 rounded-full animate-pulse"></div>
      </div>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        glass-morphism rounded-lg border border-white/10 
        hover:bg-white/10 transition-all duration-200
        flex items-center space-x-2 group
        ${sizeClasses[size]} ${className}
      `}
      title={`Current: ${getThemeLabel(theme)}. Click to change theme.`}
    >
      <span className="text-xl transition-transform duration-300 group-hover:scale-110">
        {getThemeIcon(theme)}
      </span>
      <span className="text-gray-300 group-hover:text-white transition-colors">
        {getThemeLabel(theme)}
      </span>
    </button>
  )
}

// Hook for using theme
export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const savedTheme = localStorage.getItem('gamepilot-theme') as Theme
    if (savedTheme && ['dark', 'light', 'auto'].includes(savedTheme)) {
      setTheme(savedTheme)
    }
  }, [])

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('gamepilot-theme', newTheme)
    
    const root = document.documentElement
    if (newTheme === 'auto') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.setAttribute('data-theme', systemTheme)
    } else {
      root.setAttribute('data-theme', newTheme)
    }
  }

  return { theme, changeTheme }
}

// Theme provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem('gamepilot-theme') as Theme
    const initialTheme = savedTheme && ['dark', 'light', 'auto'].includes(savedTheme) 
      ? savedTheme 
      : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    
    setTheme(initialTheme)
    
    // Apply theme immediately
    const root = document.documentElement
    if (initialTheme === 'auto') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.setAttribute('data-theme', systemTheme)
    } else {
      root.setAttribute('data-theme', initialTheme)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    
    if (theme === 'auto') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.setAttribute('data-theme', systemTheme)
      
      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        root.setAttribute('data-theme', e.matches ? 'dark' : 'light')
      }
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      root.setAttribute('data-theme', theme)
    }
  }, [theme])

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('gamepilot-theme', newTheme)
  }

  return (
    <div className="theme-provider">
      {React.Children.map(children, child => 
        React.isValidElement(child) 
          ? React.cloneElement(child as React.ReactElement<any>, { theme, changeTheme })
          : child
      )}
    </div>
  )
}
