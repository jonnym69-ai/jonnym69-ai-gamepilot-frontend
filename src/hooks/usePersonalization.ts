import { useState, useEffect } from 'react'

interface Avatar {
  emoji: string
  name: string
  level: number
  experience: number
  colors: string[]
}

interface CustomTheme {
  primary: string
  secondary: string
  accent: string
  background: string
}

export const usePersonalization = () => {
  const [customTheme, setCustomTheme] = useState<CustomTheme>({
    primary: 'purple',
    secondary: 'blue',
    accent: 'pink',
    background: 'dark'
  })

  const [avatar, setAvatar] = useState<Avatar>({
    emoji: '🎮',
    name: 'GamePilot',
    level: 1,
    experience: 0,
    colors: ['purple', 'blue']
  })

  useEffect(() => {
    const savedTheme = localStorage.getItem('customTheme')
    const savedAvatar = localStorage.getItem('avatar')
    
    if (savedTheme) setCustomTheme(JSON.parse(savedTheme))
    if (savedAvatar) setAvatar(JSON.parse(savedAvatar))
  }, [])

  const updateAvatar = (updates: Partial<Avatar>) => {
    const newAvatar = { ...avatar, ...updates }
    setAvatar(newAvatar)
    localStorage.setItem('avatar', JSON.stringify(newAvatar))
  }

  return {
    customTheme,
    avatar,
    setCustomTheme,
    updateAvatar
  }
}
