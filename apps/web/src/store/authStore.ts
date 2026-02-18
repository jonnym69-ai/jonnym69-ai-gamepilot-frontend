import { create } from 'zustand';
import { persist } from 'zustand/middleware'
import type { User } from '@gamepilot/shared'
import { personaEngineService } from '../services/personaEngineService'
import { apiFetch } from '../config/api'

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  persona: any | null; // Add persona state
}

interface AuthActions {
  // Authentication
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, displayName?: string) => Promise<void>;
  loginWithSteam: () => void;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
  
  // State management
  clearError: () => void;
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  initializeAuth: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updatePreferences: (updates: Partial<User['preferences']>) => Promise<void>;
  updatePrivacy: (updates: Partial<User['privacy']>) => Promise<void>;
  
  // Persona management
  getPersona: () => any | null;
  refreshPersona: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      persona: null, // Add persona state to store

      // Email/Password login
      login: async (username: string, password: string) => {
        // Prevent multiple simultaneous login attempts
        const currentState = get();
        if (currentState.isLoading) {
          return;
        }

        // Prevent login with empty credentials
        if (!username || !password) {
          return;
        }

        try {
          set({ isLoading: true, error: null });

          console.log('🔍 Sending login request:', { username, passwordLength: password.length });

          const apiUrl = `${(import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001'}/api/auth/login`;
          console.log('🌐 EXACT LOGIN URL:', apiUrl);

          const response = await apiFetch('auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
          });

          console.log('🔍 Login response status:', response.status);
          const result = await response.json();
          console.log('🔍 Login response data:', result);

          if (response.ok && result.success) {
            // Store auth token if provided
            if (result.token) {
              localStorage.setItem('auth_token', result.token);
              console.log('🔑 Auth token stored');
            }
            
            // Use user data directly from login response instead of calling fetchCurrentUser
            const canonicalUser: User = {
              id: result.user.id,
              username: result.user.username,
              email: result.user.email,
              displayName: result.user.displayName || result.user.username,
              avatar: result.user.avatar || '',
              bio: result.user.bio || '',
              location: result.user.location || '',
              website: result.user.website || '',
              birthday: result.user.birthday || '',
              discordTag: result.user.discordTag || '',
              steamProfile: result.user.steamProfile || '',
              timezone: result.user.timezone || 'UTC',
              createdAt: new Date(result.user.createdAt),
              updatedAt: new Date(),
              lastActive: new Date(result.user.lastActive),
              gamingProfile: {
                primaryPlatforms: result.user.gamingProfile?.primaryPlatforms || [],
                genreAffinities: {},
                playstyleArchetypes: [],
                moodProfile: {
                  currentMood: result.user.gamingProfile?.moodProfile?.currentMood || 'neutral',
                  moodHistory: [],
                  moodTriggers: [],
                  moodPreferences: {}
                },
                totalPlaytime: result.user.gamingProfile?.totalPlaytime || 0,
                gamesPlayed: result.user.gamingProfile?.gamesPlayed || 0,
                gamesCompleted: result.user.gamingProfile?.gamesCompleted || 0,
                achievementsCount: result.user.gamingProfile?.achievementsCount || 0,
                averageRating: result.user.gamingProfile?.averageRating || 0,
                currentStreak: result.user.gamingProfile?.currentStreak || 0,
                longestStreak: result.user.gamingProfile?.longestStreak || 0,
                favoriteGames: result.user.gamingProfile?.favoriteGames || []
              },
              integrations: result.user.integrations || [],
              privacy: {
                profileVisibility: 'public',
                sharePlaytime: true,
                shareAchievements: true,
                shareGameLibrary: true,
                allowFriendRequests: true,
                showOnlineStatus: true
              },
              preferences: {
                theme: 'dark',
                language: 'en',
                notifications: {
                  email: true,
                  push: true,
                  achievements: true,
                  recommendations: true,
                  friendActivity: true,
                  platformUpdates: true
                },
                display: {
                  compactMode: false,
                  showGameCovers: true,
                  animateTransitions: true,
                  showRatings: true
                }
              },
              social: {
                friends: [],
                blockedUsers: [],
                favoriteGenres: [],
                customTags: []
              }
            };
            
            set({
              user: canonicalUser,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            // Load persona for existing user
            if (canonicalUser.id) {
              await personaEngineService.load(canonicalUser.id);
              const persona = personaEngineService.getCurrentPersona();
              set({ persona });
            }
            
            // Reset loading state on success
            set({ isLoading: false, error: null });
          } else {
            throw new Error(result.message || 'Invalid username or password');
          }
        } catch (error) {
          console.error('❌ Login error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({
            error: errorMessage,
            isLoading: false,
          });
          // Don't throw error to prevent infinite loops in calling components
          // Return a resolved promise to prevent unhandled promise rejections
          return Promise.resolve();
        }
      },

      // Email/Password registration
      register: async (username: string, email: string, password: string, displayName?: string) => {
        // Prevent multiple simultaneous registration attempts
        const currentState = get();
        if (currentState.isLoading) {
          return;
        }

        try {
          set({ isLoading: true, error: null });

          const response = await apiFetch('auth/register', {
            method: 'POST',
            body: JSON.stringify({ 
              username, 
              email, 
              password,
              displayName: displayName || username
            }),
          });

          const result = await response.json();

          if (response.ok && result.success) {
            // Get token from cookie and fetch user profile
            await get().fetchCurrentUser();
            
            // Initialize persona for new user
            const currentUser = get().user;
            if (currentUser?.id) {
              await personaEngineService.initializeNewUser(currentUser.id);
              const persona = personaEngineService.getCurrentPersona();
              set({ persona });
            }
            
            // Reset loading state on success
            set({ isLoading: false, error: null });
          } else {
            throw new Error(result.message || 'Registration failed');
          }
        } catch (error) {
          console.error('❌ Registration error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Registration failed';
          set({
            error: errorMessage,
            isLoading: false,
          });
          // Don't throw error to prevent infinite loops in calling components
          // Return a resolved promise to prevent unhandled promise rejections
          return Promise.resolve();
        }
      },

      // Steam login
      loginWithSteam: () => {
        // Redirect to Steam authentication endpoint
        window.location.href = `${(import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001'}/auth/steam`;
      },

      logout: async () => {
        try {
          set({ isLoading: true, error: null });

          // Call logout endpoint
          const response = await apiFetch('auth/logout', {
            method: 'GET',
          });

          if (response.ok) {
            // Reset persona state before clearing auth state
            await personaEngineService.reset();
            
            // Clear local state
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
              persona: null, // Clear persona state
            });
          } else {
            throw new Error(`Logout failed: ${response.status} ${response.statusText}`);
          }
        } catch (error) {
          console.error('❌ Logout error:', error);
          set({
            error: error instanceof Error ? error.message : 'Logout failed',
            isLoading: false,
          });
        }
      },

      fetchCurrentUser: async () => {
        try {
          set({ isLoading: true, error: null });

          console.log('🔍 Fetching current user...');

          // Don't check localStorage for sessionToken since we're using HTTP-only cookies
          const response = await apiFetch('auth/me', {
            method: 'GET',
          });

          console.log('🔍 Fetch user response status:', response.status);
          const result = await response.json();
          console.log('🔍 Fetch user response data:', result);

          if (response.ok) {
            if (result.success && result.data) {
              // Convert enhanced user data to canonical User format
              const canonicalUser: User = {
                id: result.data.id,
                username: result.data.username,
                email: result.data.email,
                displayName: result.data.displayName || result.data.username,
                avatar: result.data.avatar || '',
                bio: result.data.bio || '',
                location: result.data.location || '',
                timezone: result.data.timezone || 'UTC',
                createdAt: new Date(result.data.createdAt),
                updatedAt: new Date(),
                lastActive: new Date(result.data.lastActive),
                gamingProfile: {
                  primaryPlatforms: result.data.gamingProfile?.primaryPlatforms || [],
                  genreAffinities: {},
                  playstyleArchetypes: [],
                  moodProfile: {
                    currentMood: result.data.gamingProfile?.currentMood || 'neutral',
                    moodHistory: [],
                    moodTriggers: [],
                    moodPreferences: {}
                  },
                  totalPlaytime: result.data.gamingProfile?.totalPlaytime || 0,
                  gamesPlayed: result.data.gamingProfile?.gamesPlayed || 0,
                  gamesCompleted: 0,
                  achievementsCount: result.data.gamingProfile?.achievementsCount || 0,
                  averageRating: 0,
                  currentStreak: 0,
                  longestStreak: 0,
                  favoriteGames: []
                },
                integrations: result.data.integrations || [],
                privacy: {
                  profileVisibility: 'public',
                  sharePlaytime: true,
                  shareAchievements: true,
                  shareGameLibrary: true,
                  allowFriendRequests: true,
                  showOnlineStatus: true
                },
                preferences: {
                  theme: 'dark',
                  language: 'en',
                  notifications: {
                    email: true,
                    push: true,
                    achievements: true,
                    recommendations: true,
                    friendActivity: true,
                    platformUpdates: true
                  },
                  display: {
                    compactMode: false,
                    showGameCovers: true,
                    animateTransitions: true,
                    showRatings: true
                  }
                },
                social: {
                  friends: [],
                  blockedUsers: [],
                  favoriteGenres: [],
                  customTags: []
                }
              };
              
              set({
                user: canonicalUser,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
            } else {
              // Clear auth state if no user data
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
              });
            }
          } else if (response.status === 401) {
            // User is not authenticated - this is normal, not an error
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error(`Failed to fetch current user: ${response.status} ${response.statusText}`);
          }
        } catch (error) {
          console.error('❌ Fetch current user error:', error);
          // Don't set error state for network issues, just clear loading state
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null, // Clear error to prevent infinite loops
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setUser: (user: User | null) => {
        set({ user });
      },

      setAuthenticated: (isAuthenticated: boolean) => {
        set({ isAuthenticated });
      },

      initializeAuth: () => {
        get().fetchCurrentUser();
      },

      updateProfile: async (updates: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser) return;

        try {
          set({ isLoading: true });
          const response = await apiFetch('auth/profile', {
            method: 'PUT',
            body: JSON.stringify(updates),
          });

          if (!response.ok) throw new Error('Failed to update profile');
          
          const result = await response.json();
          if (result.success) {
            set({ user: { ...currentUser, ...updates, ...result.data } });
          }
        } catch (error) {
          console.error('❌ Update profile error:', error);
          set({ error: error instanceof Error ? error.message : 'Update failed' });
        } finally {
          set({ isLoading: false });
        }
      },

      updatePreferences: async (updates: Partial<User['preferences']>) => {
        const currentUser = get().user;
        if (!currentUser) return;

        try {
          set({ isLoading: true });
          const response = await apiFetch('auth/preferences', {
            method: 'PUT',
            body: JSON.stringify(updates),
          });

          if (!response.ok) throw new Error('Failed to update preferences');
          
          const result = await response.json();
          if (result.success) {
            set({ 
              user: { 
                ...currentUser, 
                preferences: { ...currentUser.preferences, ...updates } 
              } 
            });
          }
        } catch (error) {
          console.error('❌ Update preferences error:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      updatePrivacy: async (updates: Partial<User['privacy']>) => {
        const currentUser = get().user;
        if (!currentUser) return;

        try {
          set({ isLoading: true });
          const response = await apiFetch('auth/privacy', {
            method: 'PUT',
            body: JSON.stringify(updates),
          });

          if (!response.ok) throw new Error('Failed to update privacy');
          
          const result = await response.json();
          if (result.success) {
            set({ 
              user: { 
                ...currentUser, 
                privacy: { ...currentUser.privacy, ...updates } 
              } 
            });
          }
        } catch (error) {
          console.error('❌ Update privacy error:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      // Persona management methods
      getPersona: () => {
        return personaEngineService.getCurrentPersona();
      },

      refreshPersona: async () => {
        try {
          const currentUser = get().user;
          if (currentUser?.id) {
            await personaEngineService.load(currentUser.id);
            const persona = personaEngineService.getCurrentPersona();
            set({ persona });
          }
        } catch (error) {
          console.error('❌ Failed to refresh persona:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors
export const useAuth = () => {
  const auth = useAuthStore();
  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    login: auth.login,
    register: auth.register,
    loginWithSteam: auth.loginWithSteam,
    logout: auth.logout,
    fetchCurrentUser: auth.fetchCurrentUser,
    clearError: auth.clearError,
    setUser: auth.setUser,
    setAuthenticated: auth.setAuthenticated,
    initializeAuth: auth.initializeAuth,
    updateProfile: auth.updateProfile,
  };
};
