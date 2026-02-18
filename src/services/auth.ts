// Unified authentication service for GamePilot integrations

import { apiFetch } from '../config/api'

export interface AuthToken {
  accessToken: string
  refreshToken?: string
  expiresAt?: Date
  scope?: string
}

export interface PlatformAuth {
  steam?: {
    apiKey?: string
    steamId?: string
    personaName?: string
  }
  discord?: {
    botToken?: string
    userToken?: string
    userId?: string
    username?: string
    avatar?: string
  }
  youtube?: {
    apiKey?: string
    channelId?: string
    channelTitle?: string
  }
}

export interface AuthState {
  isAuthenticated: boolean
  platform: string
  user: {
    id?: string
    username?: string
    avatar?: string
    displayName?: string
  }
  tokens: AuthToken
  lastSync?: Date
  error?: string
}

export class AuthService {
  private static instance: AuthService
  private authStates: Map<string, AuthState> = new Map()

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  // Steam Authentication
  async authenticateSteam(apiKey: string): Promise<AuthState> {
    try {
      // Validate API key by making a test request
      const response = await apiFetch(`api/steam/profile?apiKey=${apiKey}`)
      
      if (!response.ok) {
        throw new Error('Invalid Steam API key')
      }

      const profile = await response.json()
      
      const authState: AuthState = {
        isAuthenticated: true,
        platform: 'steam',
        user: {
          id: profile.steamId,
          username: profile.personaName,
          avatar: profile.avatarFull,
          displayName: profile.personaName
        },
        tokens: {
          accessToken: apiKey,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
        },
        lastSync: new Date()
      }

      this.authStates.set('steam', authState)
      this.saveToLocalStorage()
      
      return authState
    } catch (error) {
      const authState: AuthState = {
        isAuthenticated: false,
        platform: 'steam',
        user: {},
        tokens: { accessToken: '' },
        error: error instanceof Error ? error.message : 'Steam authentication failed'
      }
      
      this.authStates.set('steam', authState)
      throw error
    }
  }

  // Discord Authentication
  async authenticateDiscord(botToken?: string, userToken?: string): Promise<AuthState> {
    try {
      const token = botToken || userToken
      
      if (!token) {
        throw new Error('Discord token is required')
      }

      // Validate token by fetching user info
      const response = await apiFetch('api/discord/user', {
        method: 'POST',
        body: JSON.stringify({ botToken }),
      });

      if (!response.ok) {
        throw new Error('Invalid Discord token')
      }

      const user = await response.json()
      
      const authState: AuthState = {
        isAuthenticated: true,
        platform: 'discord',
        user: {
          id: user.id,
          username: user.username,
          avatar: user.avatar,
          displayName: user.global_name || user.username
        },
        tokens: {
          accessToken: token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        },
        lastSync: new Date()
      }

      this.authStates.set('discord', authState)
      this.saveToLocalStorage()
      
      return authState
    } catch (error) {
      const authState: AuthState = {
        isAuthenticated: false,
        platform: 'discord',
        user: {},
        tokens: { accessToken: '' },
        error: error instanceof Error ? error.message : 'Discord authentication failed'
      }
      
      this.authStates.set('discord', authState)
      throw error
    }
  }

  // YouTube Authentication
  async authenticateYouTube(apiKey: string): Promise<AuthState> {
    try {
      // Validate API key by making a test request
      const response = await apiFetch(`api/youtube/test?apiKey=${apiKey}`)
      
      if (!response.ok) {
        throw new Error('Invalid YouTube API key')
      }

      const authState: AuthState = {
        isAuthenticated: true,
        platform: 'youtube',
        user: {
          id: 'youtube-user',
          username: 'YouTube API',
          displayName: 'YouTube Content Access'
        },
        tokens: {
          accessToken: apiKey,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
        },
        lastSync: new Date()
      }

      this.authStates.set('youtube', authState)
      this.saveToLocalStorage()
      
      return authState
    } catch (error) {
      const authState: AuthState = {
        isAuthenticated: false,
        platform: 'youtube',
        user: {},
        tokens: { accessToken: '' },
        error: error instanceof Error ? error.message : 'YouTube authentication failed'
      }
      
      this.authStates.set('youtube', authState)
      throw error
    }
  }

  // Get authentication state for a platform
  getAuthState(platform: string): AuthState | undefined {
    return this.authStates.get(platform)
  }

  // Get all authentication states
  getAllAuthStates(): Map<string, AuthState> {
    return new Map(this.authStates)
  }

  // Check if any platform is authenticated
  hasAnyAuth(): boolean {
    return Array.from(this.authStates.values()).some(state => state.isAuthenticated)
  }

  // Refresh authentication token
  async refreshToken(platform: string): Promise<AuthState> {
    const currentState = this.authStates.get(platform)
    
    if (!currentState || !currentState.isAuthenticated) {
      throw new Error(`No authenticated session found for ${platform}`)
    }

    // For most integrations, tokens don't expire (API keys)
    // For OAuth tokens, implement refresh logic here
    return currentState
  }

  // Logout from a platform
  logout(platform: string): void {
    this.authStates.delete(platform)
    this.saveToLocalStorage()
  }

  // Logout from all platforms
  logoutAll(): void {
    this.authStates.clear()
    this.saveToLocalStorage()
  }

  // Save authentication states to localStorage
  private saveToLocalStorage(): void {
    try {
      const states = Object.fromEntries(this.authStates)
      localStorage.setItem('gamepilot-auth', JSON.stringify(states))
    } catch (error) {
      console.warn('Failed to save auth states to localStorage:', error)
    }
  }

  // Load authentication states from localStorage
  loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('gamepilot-auth')
      if (stored) {
        const states = JSON.parse(stored)
        
        // Convert dates back to Date objects
        Object.entries(states).forEach(([platform, state]: [string, any]) => {
          if (state.tokens?.expiresAt) {
            state.tokens.expiresAt = new Date(state.tokens.expiresAt)
          }
          if (state.lastSync) {
            state.lastSync = new Date(state.lastSync)
          }
          this.authStates.set(platform, state as AuthState)
        })
      }
    } catch (error) {
      console.warn('Failed to load auth states from localStorage:', error)
    }
  }

  // Check if token is expired
  isTokenExpired(platform: string): boolean {
    const state = this.authStates.get(platform)
    if (!state || !state.tokens.expiresAt) {
      return false
    }
    
    return new Date() > state.tokens.expiresAt
  }

  // Get platform-specific configuration
  getPlatformConfig(platform: string): PlatformAuth {
    const state = this.authStates.get(platform)
    
    switch (platform) {
      case 'steam':
        return {
          steam: {
            apiKey: state?.tokens.accessToken,
            steamId: state?.user.id,
            personaName: state?.user.username
          }
        }
      case 'discord':
        return {
          discord: {
            userToken: state?.tokens.accessToken,
            userId: state?.user.id,
            username: state?.user.username,
            avatar: state?.user.avatar
          }
        }
      case 'youtube':
        return {
          youtube: {
            apiKey: state?.tokens.accessToken
          }
        }
      default:
        return {}
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance()
