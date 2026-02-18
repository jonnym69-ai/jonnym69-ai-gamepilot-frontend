import { launcherService } from './launcherService'
import { apiFetch } from '../config/api'
import type { Game } from '@gamepilot/types'

export interface GameSession {
  id: string
  gameId: string
  startedAt: Date
  endedAt?: Date
  duration?: number
  platformCode?: string
  launchMethod: 'steam' | 'local' | 'manual'
  isActive: boolean
}

export interface PersonaMetrics {
  totalPlaytime: number
  sessionCount: number
  averageSessionLength: number
  favoriteGenres: Array<{ genre: string; playtime: number }>
  moodAffinity: Array<{ mood: string; score: number }>
  playstyleIndicators: {
    competitive: number
    exploratory: number
    social: number
    achievement: number
  }
  recentActivity: {
    lastPlayed: Date | null
    streakDays: number
    weeklyGoal: number
    weeklyProgress: number
  }
}

class PersonaEngineService {
  constructor() {
    // No baseUrl needed - using centralized apiFetch
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token')
    
    // Validate token exists and has content
    if (!token || token.trim() === '') {
      console.warn('🔍 No valid token found in localStorage')
      return {}
    }
    
    console.log('🔍 Retrieved token from localStorage:', 'exists')
    console.log('🔍 Token value:', token.substring(0, 20) + '...')
    
    const headers = {
      Authorization: `Bearer ${token}`
    }
    
    console.log('🔍 Final headers:', headers)
    return headers
  }

  // Enhanced launch with persona tracking
  async launchGameWithPersonaTracking(gameId: string, game: Game): Promise<any> {
    try {
      // Log session start for persona engine
      await this.logSessionStart(gameId, game)

      // Launch the game
      const launchResult = await launcherService.launchGame(gameId)

      if (launchResult.success) {
        // Update persona metrics in background
        this.updatePersonaMetrics(gameId, 'session_start').catch(console.error)
      }

      return launchResult
    } catch (error) {
      console.error('Persona launch error:', error)
      throw error
    }
  }

  // Log session end with persona analytics
  async endSessionWithPersonaTracking(sessionId?: string, gameId?: string): Promise<any> {
    try {
      // End the session
      const endResult = await launcherService.endSession(sessionId, gameId)

      if (endResult.success && gameId) {
        // Update persona metrics with session data
        await this.updatePersonaMetrics(gameId, 'session_end', {
          duration: endResult.data?.duration,
          durationMinutes: endResult.data?.durationMinutes
        })
      }

      return endResult
    } catch (error) {
      console.error('Persona session end error:', error)
      throw error
    }
  }

  // Log session start for persona engine
  private async logSessionStart(gameId: string, game: Game): Promise<void> {
    try {
      const sessionData = {
        gameId,
        gameMetadata: {
          title: game.title,
          genres: game.genres,
          tags: game.tags,
          platforms: game.platforms,
          emotionalTags: game.emotionalTags
        },
        context: {
          timeOfDay: new Date().getHours(),
          dayOfWeek: new Date().getDay(),
          previousSessions: await this.getRecentSessionCount(),
          currentMood: await this.getCurrentMood()
        }
      }

      await apiFetch('persona/session/start', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(sessionData)
      })
    } catch (error) {
      console.error('Failed to log session start:', error)
      // Don't throw - persona logging shouldn't break game launching
    }
  }

  // Update persona metrics based on game session
  private async updatePersonaMetrics(
    gameId: string, 
    eventType: 'session_start' | 'session_end',
    data?: { duration?: number; durationMinutes?: number }
  ): Promise<void> {
    try {
      const metricsData = {
        gameId,
        eventType,
        sessionData: data,
        timestamp: new Date().toISOString()
      }

      await apiFetch('persona/metrics/update', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(metricsData)
      })
    } catch (error) {
      console.error('Failed to update persona metrics:', error)
      // Don't throw - persona updates shouldn't break game functionality
    }
  }

  // Get current user mood (could be from mood service or user input)
  private async getCurrentMood(): Promise<string> {
    // This would integrate with the mood service
    // For now, return a default or detected mood
    const hour = new Date().getHours()
    if (hour < 12) return 'energetic'
    if (hour < 17) return 'focused'
    if (hour < 21) return 'social'
    return 'relaxed'
  }

  // Get recent session count for context
  private async getRecentSessionCount(): Promise<number> {
    try {
      const response = await launcherService.getActiveSessions()
      return response.data?.count || 0
    } catch (error) {
      return 0
    }
  }

  // Get comprehensive persona metrics
  async getPersonaMetrics(): Promise<PersonaMetrics> {
    try {
      const response = await apiFetch('persona/metrics', {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return result.data || this.getDefaultMetrics()
    } catch (error) {
      console.error('Failed to get persona metrics:', error)
      return this.getDefaultMetrics()
    }
  }

  // Get personalized game recommendations based on persona
  async getPersonaRecommendations(limit = 10): Promise<Game[]> {
    try {
      const response = await apiFetch(`persona/recommendations?limit=${limit}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return result.data || []
    } catch (error) {
      console.error('Failed to get persona recommendations:', error)
      return []
    }
  }

  // Get mood-based game suggestions
  async getMoodBasedSuggestions(mood: string, limit = 5): Promise<Game[]> {
    try {
      const response = await apiFetch(`persona/mood-suggestions?mood=${mood}&limit=${limit}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return result.data || []
    } catch (error) {
      console.error('Failed to get mood suggestions:', error)
      return []
    }
  }

  // Analyze play patterns and return insights
  async getPlayPatternAnalysis(): Promise<{
    patterns: string[]
    recommendations: string[]
    insights: Array<{ type: string; message: string; priority: 'low' | 'medium' | 'high' }>
  }> {
    try {
      const response = await apiFetch('persona/pattern-analysis', {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return result.data || {
        patterns: [],
        recommendations: [],
        insights: []
      }
    } catch (error) {
      console.error('Failed to get play pattern analysis:', error)
      return {
        patterns: [],
        recommendations: [],
        insights: []
      }
    }
  }

  // Default metrics for fallback
  private getDefaultMetrics(): PersonaMetrics {
    return {
      totalPlaytime: 0,
      sessionCount: 0,
      averageSessionLength: 0,
      favoriteGenres: [],
      moodAffinity: [],
      playstyleIndicators: {
        competitive: 0,
        exploratory: 0,
        social: 0,
        achievement: 0
      },
      recentActivity: {
        lastPlayed: null,
        streakDays: 0,
        weeklyGoal: 10, // 10 hours per week
        weeklyProgress: 0
      }
    }
  }

  // Get session history for analytics
  async getSessionHistory(limit = 50): Promise<GameSession[]> {
    try {
      const response = await launcherService.getSessionHistory(undefined, limit)
      return response.data?.sessions || []
    } catch (error) {
      console.error('Failed to get session history:', error)
      return []
    }
  }

  // Calculate engagement score based on recent activity
  calculateEngagementScore(sessions: GameSession[]): number {
    if (sessions.length === 0) return 0

    const now = new Date()
    const recentSessions = sessions.filter(session => {
      const sessionDate = new Date(session.startedAt)
      const daysDiff = (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
      return daysDiff <= 30 // Last 30 days
    })

    // Score based on frequency and recency
    let score = 0
    recentSessions.forEach(session => {
      const daysDiff = (now.getTime() - new Date(session.startedAt).getTime()) / (1000 * 60 * 60 * 24)
      const recencyMultiplier = Math.max(0, 1 - daysDiff / 30)
      const durationScore = Math.min((session.duration || 0) / 3600, 2) // Max 2 hours per session
      score += recencyMultiplier * durationScore
    })

    return Math.min(score * 10, 100) // Scale to 0-100
  }

  // Initialize new user persona after registration
  async initializeNewUser(userId: string): Promise<void> {
    try {
      console.log('🎭 Initializing persona for new user:', userId)
      
      const response = await apiFetch('persona/initialize', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ userId })
      })

      if (!response.ok) {
        throw new Error(`Failed to initialize persona: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('🎭 Persona initialized successfully:', result)
      
      // Store persona data locally for immediate access
      localStorage.setItem('persona_data', JSON.stringify(result.data))
    } catch (error) {
      console.error('❌ Failed to initialize persona:', error)
      // Don't throw error to prevent blocking registration
      // Use fallback persona data
      this.setFallbackPersona(userId)
    }
  }

  // Load existing user persona after login
  async load(userId: string): Promise<void> {
    try {
      console.log('🎭 Loading persona for user:', userId)
      
      // Use cookie-based auth like other working endpoints - no JWT token for persona
      const response = await apiFetch(`persona`, {
        method: 'GET',
        credentials: 'include'
      })

      console.log('🔍 Persona response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`Failed to load persona: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('🎭 Persona loaded successfully:', result)
      
      // Store persona data locally for immediate access
      localStorage.setItem('persona_data', JSON.stringify(result.data))
    } catch (error) {
      console.error('❌ Failed to load persona:', error)
      // Don't throw error to prevent blocking login
      // Use fallback persona data
      this.setFallbackPersona(userId)
    }
  }

  // Reset persona state after logout
  async reset(): Promise<void> {
    try {
      console.log('🎭 Resetting persona state')
      
      // Clear local persona data
      localStorage.removeItem('persona_data')
      
      // Optionally call backend to reset session
      try {
        await apiFetch('persona/reset', {
          method: 'POST',
          headers: this.getAuthHeaders()
        })
      } catch (backendError) {
        console.warn('Backend persona reset failed, but local state cleared:', backendError)
      }
      
      console.log('🎭 Persona state reset successfully')
    } catch (error) {
      console.error('❌ Failed to reset persona:', error)
      // Still clear local data even if backend fails
      localStorage.removeItem('persona_data')
    }
  }

  // Set fallback persona data for offline/error scenarios
  private setFallbackPersona(userId: string): void {
    const fallbackPersona = {
      userId,
      traits: {
        competitive: 0.5,
        exploratory: 0.5,
        social: 0.5,
        achievement: 0.5
      },
      mood: 'neutral',
      narrativeContext: {
        playstyle: 'balanced',
        preferences: [],
        history: []
      },
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }
    
    localStorage.setItem('persona_data', JSON.stringify(fallbackPersona))
    console.log('🎭 Fallback persona set for user:', userId)
  }

  // Get current persona data from local storage
  getCurrentPersona(): any {
    try {
      const personaData = localStorage.getItem('persona_data')
      if (!personaData || personaData === 'undefined') {
        return null
      }
      return JSON.parse(personaData)
    } catch (error) {
      console.error('❌ Failed to get current persona:', error)
      return null
    }
  }

  // Check if persona is initialized
  isPersonaInitialized(): boolean {
    return !!this.getCurrentPersona()
  }
}

export const personaEngineService = new PersonaEngineService()
