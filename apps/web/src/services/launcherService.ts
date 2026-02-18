import { toast } from '../components/Toast'
import { apiFetch } from '../config/api'

// Import toast provider for proper messages
let toastProvider: any = null
const setToastProvider = (provider: any) => {
  toastProvider = provider
}
export { setToastProvider }

export interface LaunchResponse {
  success: boolean
  data?: {
    launchUrl?: string
    launchMethod: 'steam' | 'local' | 'manual'
    sessionId: string
    game: {
      id: string
      title: string
      platforms: Array<{ code: string; name: string }>
    }
  }
  message?: string
  error?: string
}

export interface SessionEndResponse {
  success: boolean
  data?: {
    sessionId: string
    gameId: string
    duration: number
    durationMinutes: number
    durationHours: number
    endedAt: string
  }
  message?: string
  error?: string
}

class LauncherService {
  constructor() {
    // No baseUrl needed - using centralized apiFetch
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token')
    return {
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  async launchGame(gameId: string, platformCode?: string): Promise<LaunchResponse> {
    try {
      // Try backend launcher first
      const response = await apiFetch('api/launcher/launch', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ gameId, platformCode })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      // If we have a launch URL, execute it
      if (result.data?.launchUrl) {
        try {
          window.location.href = result.data.launchUrl
          
          // Check if launch was successful (simple heuristic)
          setTimeout(() => {
            const isStillOnPage = document.visibilityState === 'visible'
            if (isStillOnPage) {
              toast.warning(
                'Launch Failed', 
                result.data?.launchMethod === 'steam' 
                  ? 'Steam may not be installed or running. Please check Steam is available.'
                  : 'Failed to launch game. Please check the game executable path.'
              )
            }
          }, 3000)
        } catch (error) {
          console.error('Failed to launch game:', error)
          toast.error('Launch Failed', 'Could not execute launch command')
          return { ...result, success: false }
        }
      }

      toast.success(result.message || 'Game launched successfully')
      return result

    } catch (error) {
      console.error('Launch service error:', error)
      
      // FALLBACK: Try direct Steam launch if backend is unavailable
      console.log('🔧 DEBUG: Launch error caught:', (error as Error).message)
      if (error instanceof Error && (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED') || error.message.includes('NetworkError'))) {
        console.log('🔧 Backend unavailable, trying direct Steam launch fallback')
        return this.launchSteamDirect(gameId)
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error('Launch Failed', errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  // Direct Steam launch fallback (when backend is unavailable)
  private async launchSteamDirect(gameId: string): Promise<LaunchResponse> {
    try {
      // Find the game in the store to get Steam app ID
      const { useLibraryStore } = await import('../stores/useLibraryStore')
      const store = useLibraryStore.getState()
      
      console.log('🔧 DEBUG: Store games count:', store.games.length)
      console.log('🔧 DEBUG: Looking for gameId:', gameId)
      console.log('🔧 DEBUG: Sample game IDs:', store.games.slice(0, 5).map(g => ({ id: g.id, appId: g.appId, title: g.title })))
      
      const game = store.games.find((g: any) => g.id === gameId || g.appId?.toString() === gameId)
      
      if (!game) {
        console.log('🔧 DEBUG: Game not found, trying all games...')
        store.games.forEach((g: any, index: number) => {
          if (index < 5) {
            console.log(`🔧 DEBUG: Game ${index}: id=${g.id}, appId=${g.appId}, title=${g.title}`)
          }
        })
        
        return {
          success: false,
          error: 'Game not found in library'
        }
      }

      // Get Steam app ID
      const steamAppId = game.appId
      if (!steamAppId) {
        return {
          success: false,
          error: 'Steam App ID not found for this game'
        }
      }

      // Create Steam launch URL
      const steamUrl = `steam://rungameid/${steamAppId}`
      
      console.log('🔧 Launching Steam directly:', steamUrl)
      
      // Try to launch Steam
      try {
        window.location.href = steamUrl
        
        // Show success message using proper toast provider if available
        if (toastProvider && toastProvider.showSuccess) {
          toastProvider.showSuccess(`Steam Launch Initiated: Opening ${game.title} via Steam...`, {
            autoClose: 3000
          })
        } else {
          toast.success('Opening Steam...', 'Game should launch shortly')
        }
        
        return {
          success: true,
          data: {
            launchUrl: steamUrl,
            launchMethod: 'steam' as const,
            sessionId: 'direct-launch',
            game: {
              id: game.id,
              title: game.title,
              platforms: game.platforms || []
            }
          }
        }
      } catch (error) {
        console.error('Failed to launch Steam directly:', error)
        return {
          success: false,
          error: 'Failed to launch Steam. Please ensure Steam is installed and running.'
        }
      }
    } catch (error) {
      console.error('Direct Steam launch error:', error)
      return {
        success: false,
        error: 'Direct launch failed'
      }
    }
  }

  async endSession(sessionId?: string, gameId?: string): Promise<SessionEndResponse> {
    try {
      const response = await apiFetch('api/launcher/session/end', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ sessionId, gameId })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const durationMinutes = result.data?.durationMinutes || 0
      const durationHours = result.data?.durationHours || 0
      
      let message = 'Session ended successfully'
      if (durationMinutes > 0) {
        if (durationHours >= 1) {
          message = `Session ended: ${durationHours}h ${durationMinutes % 60}m played`
        } else {
          message = `Session ended: ${durationMinutes} minutes played`
        }
      }

      toast.success(message)
      return result

    } catch (error) {
      console.error('End session error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error('Session Error', errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  async getActiveSessions(): Promise<any> {
    try {
      const response = await apiFetch('api/launcher/session/active', {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return result

    } catch (error) {
      console.error('Get active sessions error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async getSessionHistory(gameId?: string, limit = 50): Promise<any> {
    try {
      const params = new URLSearchParams({ limit: limit.toString() })
      if (gameId) params.append('gameId', gameId)

      const response = await apiFetch(`api/launcher/session/history?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return result

    } catch (error) {
      console.error('Get session history error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Helper method to check if Steam is available
  async checkSteamAvailability(): Promise<boolean> {
    try {
      // Try to launch a minimal Steam URL to check if Steam is installed
      const testUrl = 'steam://'
      const testWindow = window.open(testUrl, '_blank', 'width=1,height=1')
      
      if (testWindow) {
        testWindow.close()
        return true
      }
      
      return false
    } catch (error) {
      return false
    }
  }

  // Helper method to get platform-specific launch info
  getLaunchInfo(game: any): { canLaunch: boolean; method: 'steam' | 'local' | 'manual'; url?: string } {
    // Check for Steam game
    const steamPlatform = game.platforms?.find((p: any) => p.code === 'steam')
    if (steamPlatform && game.appId) {
      return {
        canLaunch: true,
        method: 'steam',
        url: `steam://rungameid/${game.appId}`
      }
    }

    // Check for local game with executable path
    if (game.executablePath) {
      return {
        canLaunch: true,
        method: 'local',
        url: `file://${game.executablePath}`
      }
    }

    // Manual launch only
    return {
      canLaunch: true,
      method: 'manual'
    }
  }
}

export const launcherService = new LauncherService()
