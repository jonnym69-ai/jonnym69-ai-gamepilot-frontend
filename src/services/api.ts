import { Game, Activity, UserPreferences } from '../types';
import type { Game as SharedGame } from '@gamepilot/types';
import { toast } from '../components/Toast';

// API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
};

// Exponential backoff helper
const getRetryDelay = (attempt: number) => {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt - 1);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
};

// Retry wrapper with exponential backoff
const withRetry = async <T>(
  fn: () => Promise<T>,
  operation: string,
  customMaxRetries?: number
): Promise<T> => {
  const maxRetries = customMaxRetries || RETRY_CONFIG.maxRetries;
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on authentication errors or 4xx status codes
      if (error instanceof Error && (
        error.message.includes('Not authenticated') ||
        error.message.includes('401') ||
        error.message.includes('403') ||
        error.message.includes('404')
      )) {
        throw error;
      }

      if (attempt === maxRetries) {
        console.error(`Failed after ${maxRetries} attempts for ${operation}:`, error);
        throw new Error(`Failed to ${operation} after ${maxRetries} attempts: ${lastError.message}`);
      }

      const delay = getRetryDelay(attempt);
      console.warn(`Attempt ${attempt} failed for ${operation}, retrying in ${delay}ms:`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

// MoodVector interface locally defined to avoid import issues
interface MoodVector {
  calm: number;
  competitive: number;
  curious: number;
  social: number;
  focused: number;
}

/**
 * API response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  user?: T;
  token?: string;
}

/**
 * Authentication service
 */
export class AuthService {
  static async login(_username: string, _password: string) {
    console.warn('⚠️ Legacy AuthService.login() called - this should not be used. Use authStore.login() instead.');
    // Temporarily disabled to prevent conflicts with authStore
    return null;
  }

  static async register(username: string, email: string, password: string) {
    return withRetry(async () => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: any = await response.json();

      if (result.success && (result.user || result.data?.user) && (result.token || result.data?.token)) {
        const user = result.user || result.data.user;
        const token = result.token || result.data.token;
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        toast.success('Account created!', `Welcome to GamePilot, ${user.username}!`);
        return {
          user,
          token
        };
      } else {
        throw new Error(result.message || 'Registration failed');
      }
    }, 'register', 2).catch(error => {
      toast.error('Registration failed', error.message);
      throw error;
    });
  }

  static logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    toast.info('Logged out successfully');
  }

  static getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static getToken() {
    const token = localStorage.getItem('auth_token');
    // Don't throw error, just return null for missing token
    // This prevents errors in services that check for authentication
    return token;
  }

  static isAuthenticated() {
    return !!this.getToken();
  }
}

/**
 * Games service
 */
export class GamesService {
  static async getUserGames(): Promise<Game[]> {
    return withRetry(async () => {
      const token = AuthService.getToken();
      if (!token) {
        // Return empty array instead of throwing error
        console.warn('User not authenticated, returning empty games list');
        return [];
      }

      const response = await fetch(`${API_BASE_URL}/games/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<{ games: Game[], total: number }> = await response.json();
      
      if (result.success && result.data) {
        return result.data.games;
      } else {
        throw new Error(result.message || 'Failed to fetch games');
      }
    }, 'fetch user games').catch(error => {
      console.warn('Failed to load your game library:', error.message);
      return []; // Return empty array instead of throwing error
    });
  }

  static async addGame(game: Partial<Game>): Promise<Game> {
    return withRetry(async () => {
      const token = AuthService.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/games`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(game),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<Game> = await response.json();
      
      if (result.success && result.data) {
        toast.success('Game added to your library', result.data.title);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to add game');
      }
    }, 'add game').catch(error => {
      toast.error('Failed to add game', error.message);
      throw error;
    });
  }

  static async updateGame(gameId: string, updates: Partial<Game>): Promise<Game> {
    return withRetry(async () => {
      const token = AuthService.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/games/${gameId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<Game> = await response.json();
      
      if (result.success && result.data) {
        toast.success('Game updated successfully', result.data.title);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to update game');
      }
    }, 'update game').catch(error => {
      toast.error('Failed to update game', error.message);
      throw error;
    });
  }

  static async deleteGame(gameId: string): Promise<void> {
    return withRetry(async () => {
      const token = AuthService.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/games/${gameId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<void> = await response.json();
      
      if (result.success) {
        toast.success('Game removed from your library');
      } else {
        throw new Error(result.message || 'Failed to delete game');
      }
    }, 'delete game').catch(error => {
      toast.error('Failed to delete game', error.message);
      throw error;
    });
  }
}

/**
 * Mood analysis service
 */
export class MoodService {
  static async getCurrentMood(): Promise<{
    moodVector: MoodVector;
    confidence: number;
    insights: any;
  }> {
    try {
      const token = AuthService.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/mood`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const result: ApiResponse<{
        moodVector: MoodVector;
        confidence: number;
        insights: any;
      }> = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch mood analysis');
      }
    } catch (error) {
      console.error('Error fetching mood analysis:', error);
      throw error;
    }
  }

  static async updateMood(sessionData: any): Promise<void> {
    try {
      const token = AuthService.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/mood/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionData }),
        credentials: 'include',
      });

      const result: ApiResponse<void> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update mood analysis');
      }
    } catch (error) {
      console.error('Error updating mood analysis:', error);
      throw error;
    }
  }
}

/**
 * Steam integration service with caching and retry logic
 */
export class SteamService {
  // Cache configuration
  private static CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
  private static RATE_LIMIT_DELAY = 1000 // 1 second between requests
  
  // Cache storage
  private static cache = new Map<string, { data: any; timestamp: number }>()
  
  // Rate limiting
  private static lastRequestTime = 0

  private static isRateLimited(): boolean {
    const now = Date.now()
    if (now - this.lastRequestTime < this.RATE_LIMIT_DELAY) {
      return true
    }
    this.lastRequestTime = now
    return false
  }

  private static getCachedData(key: string): any | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }
    return null
  }

  private static setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  private static clearCache(): void {
    this.cache.clear()
  }

  static async connectSteam(steamId: string): Promise<void> {
    return withRetry(async () => {
      if (this.isRateLimited()) {
        throw new Error('Rate limit exceeded. Please wait before trying again.')
      }

      const token = AuthService.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/steam/connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ steamId }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<void> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to connect Steam account');
      }

      // Clear cache when connecting new account
      this.clearCache();
      
      toast.success('Steam account connected', 'Your Steam library will be synced automatically');
    }, 'connect Steam', 2).catch(error => {
      toast.error('Failed to connect Steam', error.message);
      throw error;
    });
  }

  static async getSteamLibrary(): Promise<any[]> {
    return withRetry(async () => {
      if (this.isRateLimited()) {
        throw new Error('Rate limit exceeded. Please wait before trying again.')
      }

      // Check cache first
      const cacheKey = 'steam_library';
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        console.log('📦 Using cached Steam library data');
        return cachedData;
      }

      const token = AuthService.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/steam/library`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Steam API rate limit exceeded. Please try again later.');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<any[]> = await response.json();
      
      if (result.success && result.data) {
        // Cache the successful response
        this.setCachedData(cacheKey, result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch Steam library');
      }
    }, 'fetch Steam library', 3).catch(error => {
      // Graceful degradation - return cached data if available
      const cachedData = this.getCachedData('steam_library');
      if (cachedData) {
        toast.warning('Using cached data', 'Steam API unavailable, showing cached library');
        console.warn('🔄 Falling back to cached Steam library data');
        return cachedData;
      }
      
      toast.error('Failed to fetch Steam library', error.message);
      throw error;
    });
  }

  static async getSteamGameDetails(appId: number): Promise<any> {
    return withRetry(async () => {
      if (this.isRateLimited()) {
        throw new Error('Rate limit exceeded. Please wait before trying again.');
      }

      // Check cache first
      const cacheKey = `steam_game_${appId}`;
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        console.log(`📦 Using cached game data for app ${appId}`);
        return cachedData;
      }

      const token = AuthService.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/steam/game/${appId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Game with App ID ${appId} not found on Steam`);
        }
        if (response.status === 429) {
          throw new Error('Steam API rate limit exceeded. Please try again later.');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<any> = await response.json();
      
      if (result.success && result.data) {
        // Cache the successful response
        this.setCachedData(cacheKey, result.data);
        return result.data;
      } else {
        throw new Error(result.message || `Failed to fetch game details for App ID ${appId}`);
      }
    }, `fetch game details for ${appId}`, 2).catch(error => {
      // Graceful degradation - return cached data if available
      const cachedData = this.getCachedData(`steam_game_${appId}`);
      if (cachedData) {
        toast.warning('Using cached data', `Steam API unavailable, showing cached data for game ${appId}`);
        console.warn(`🔄 Falling back to cached game data for app ${appId}`);
        return cachedData;
      }
      
      toast.error('Failed to fetch game details', error.message);
      throw error;
    });
  }

  // Utility methods for cache management
  static clearSteamCache(): void {
    this.clearCache();
    toast.info('Cache cleared', 'Steam API cache has been cleared');
  }

  static getCacheInfo(): { size: number; keys: string[]; oldestEntry?: string; newestEntry?: string } {
    const keys = Array.from(this.cache.keys());
    const size = this.cache.size;
    
    if (size === 0) {
      return { size: 0, keys: [] };
    }

    const entries = Array.from(this.cache.entries());
    const sortedEntries = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    return {
      size,
      keys,
      oldestEntry: sortedEntries[0]?.[0],
      newestEntry: sortedEntries[sortedEntries.length - 1]?.[0]
    };
  }
}

/**
 * User preferences service
 */
export class PreferencesService {
  static async getUserPreferences(): Promise<UserPreferences> {
    try {
      const token = AuthService.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/user/preferences`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const result: ApiResponse<UserPreferences> = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch user preferences');
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      throw error;
    }
  }

  static async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const token = AuthService.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/user/preferences`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
        credentials: 'include',
      });

      const result: ApiResponse<UserPreferences> = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to update user preferences');
      }
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }
}

/**
 * Activity service
 */
export class ActivityService {
  static async getUserActivity(): Promise<Activity[]> {
    try {
      const token = AuthService.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/user/activity`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const result: ApiResponse<Activity[]> = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch user activity');
      }
    } catch (error) {
      console.error('Error fetching user activity:', error);
      throw error;
    }
  }
}

/**
 * Home service
 */
export class HomeService {
  static async getHome(): Promise<{
    user: { id: string; username: string; email: string };
    libraryCount: number;
    recentGames: SharedGame[];
    integrations: {
      steam: boolean;
      discord: boolean;
      youtube: boolean;
      twitch: boolean;
    };
  }> {
    try {
      return await ApiClient.request('/home');
    } catch (error) {
      console.error('Error fetching home data:', error);
      throw error;
    }
  }
}

/**
 * Generic API request helper
 */
export class ApiClient {
  static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const token = AuthService.getToken();
      const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        credentials: 'include',
      });

      const result: ApiResponse<T> = await response.json();
      
      if (result.success && result.data !== undefined) {
        return result.data;
      } else {
        throw new Error(result.message || 'API request failed');
      }
    } catch (error) {
      console.error(`API request error for ${endpoint}:`, error);
      throw error;
    }
  }
}
