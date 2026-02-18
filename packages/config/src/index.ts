// Configuration and environment variables for GamePilot

export interface GamePilotConfig {
  api: {
    baseUrl: string
    timeout: number
  }
  integrations: {
    youtube: {
      apiKey?: string
      enabled: boolean
      maxResults: number
    }
    discord: {
      botToken?: string
      userToken?: string
      enabled: boolean
    }
    steam: {
      apiKey?: string
      enabled: boolean
      baseUrl: string
    }
  }
  features: {
    recommendations: {
      enabled: boolean
      maxRecommendations: number
    }
    identity: {
      enabled: boolean
      moodTracking: boolean
    }
    social: {
      enabled: boolean
      activityFeed: boolean
    }
  }
  ui: {
    theme: 'dark' | 'light' | 'auto'
    animations: boolean
    reducedMotion: boolean
  }
}

// Default configuration
export const defaultConfig: GamePilotConfig = {
  api: {
    baseUrl: process.env.VITE_API_BASE_URL || 'http://localhost:3001',
    timeout: 10000
  },
  integrations: {
    youtube: {
      apiKey: process.env.VITE_YOUTUBE_API_KEY,
      enabled: !!process.env.VITE_YOUTUBE_API_KEY,
      maxResults: 20
    },
    discord: {
      botToken: process.env.VITE_DISCORD_BOT_TOKEN,
      userToken: process.env.VITE_DISCORD_USER_TOKEN,
      enabled: !!(process.env.VITE_DISCORD_BOT_TOKEN || process.env.VITE_DISCORD_USER_TOKEN)
    },
    steam: {
      apiKey: process.env.VITE_STEAM_API_KEY,
      enabled: !!process.env.VITE_STEAM_API_KEY,
      baseUrl: 'https://api.steampowered.com'
    }
  },
  features: {
    recommendations: {
      enabled: true,
      maxRecommendations: 10
    },
    identity: {
      enabled: true,
      moodTracking: true
    },
    social: {
      enabled: true,
      activityFeed: true
    }
  },
  ui: {
    theme: 'dark',
    animations: true,
    reducedMotion: false
  }
}

// Environment-specific configurations
export const getEnvironmentConfig = (): GamePilotConfig => {
  const env = process.env.NODE_ENV || 'development'
  
  if (env === 'production') {
    return {
      ...defaultConfig,
      api: {
        baseUrl: process.env.VITE_API_BASE_URL || 'https://api.gamepilot.dev',
        timeout: 15000
      }
    }
  }
  
  if (env === 'test') {
    return {
      ...defaultConfig,
      api: {
        baseUrl: 'http://localhost:3001',
        timeout: 5000
      },
      features: {
        recommendations: { enabled: false, maxRecommendations: 0 },
        identity: { enabled: false, moodTracking: false },
        social: { enabled: false, activityFeed: false }
      }
    }
  }
  
  return defaultConfig
}

// Configuration validation
export const validateConfig = (config: Partial<GamePilotConfig>): string[] => {
  const errors: string[] = []
  
  if (config.api?.baseUrl && !isValidUrl(config.api.baseUrl)) {
    errors.push('Invalid API base URL')
  }
  
  if (config.integrations?.youtube?.enabled && !config.integrations.youtube.apiKey) {
    errors.push('YouTube integration enabled but API key missing')
  }
  
  if (config.integrations?.steam?.enabled && !config.integrations.steam.apiKey) {
    errors.push('Steam integration enabled but API key missing')
  }
  
  return errors
}

// Helper function to validate URLs
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Export singleton configuration instance
export const config = getEnvironmentConfig()
