import { apiFetch } from '../config/api'

class GameApiService {
  constructor() {
    // No baseUrl needed - using centralized apiFetch
  }

  private getAuthHeaders() {
    return {
      'Accept': 'application/json'
    }
  }

  private async makeRequest(url: string, options: RequestInit = {}) {
    const response = await apiFetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  async getUserGames(): Promise<{ success: boolean; data?: { games: any[]; total: number }; error?: string }> {
    try {
      return await this.makeRequest('api/games/user')
    } catch (error) {
      console.error('GameApiService: getUserGames error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async upsertGames(games: any[]): Promise<{ success: boolean; data?: { games: any[]; count: number }; error?: string }> {
    try {
      return await this.makeRequest('api/games/bulk', {
        method: 'POST',
        body: JSON.stringify({ games })
      })
    } catch (error) {
      console.error('GameApiService: upsertGames error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async launchGame(gameId: string, platformCode?: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      return await this.makeRequest('api/launcher/launch', {
        method: 'POST',
        body: JSON.stringify({ gameId, platformCode })
      })
    } catch (error) {
      console.error('GameApiService: launchGame error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async endSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.makeRequest('api/launcher/end-session', {
        method: 'POST',
        body: JSON.stringify({ sessionId })
      })
    } catch (error) {
      console.error('GameApiService: endSession error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

export const gameApiService = new GameApiService()
