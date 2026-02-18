import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/authStore'
import { useLibraryStore } from '../../stores/useLibraryStore'
import type { Game } from '@gamepilot/types'
import { createApiUrl } from '../../config/api'

// Import new components
import { PageErrorBoundary } from '../../components/ErrorBoundary'
import { Loading, CardSkeleton } from '../../components/Loading'
import { ThemeToggle } from '../../components/ThemeToggle'

// Import existing components to reuse
import { RecentlyPlayedSection } from './components/RecentlyPlayedSection'
import { SurpriseMeSection } from './components/SurpriseMeSection'
import { WhatShouldIBuySection } from './components/WhatShouldIBuySection'

// Mock data for recently played (will be replaced with real Steam data)
const mockRecentlyPlayed: Game[] = [
  {
    id: '1',
    title: 'Cyberpunk 2077',
    coverImage: createApiUrl('/placeholder/cover/cyberpunk.jpg'),
    playStatus: 'playing' as const,
    hoursPlayed: 45.5,
    lastPlayed: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    addedAt: new Date(),
    isFavorite: false,
    genres: [],
    moods: [],
    platforms: [],
    emotionalTags: [],
    releaseYear: 2020
  },
  {
    id: '2', 
    title: 'Baldur\'s Gate 3',
    coverImage: createApiUrl('/placeholder/cover/baldurs3.jpg'),
    playStatus: 'completed' as const,
    hoursPlayed: 120.3,
    lastPlayed: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    addedAt: new Date(),
    isFavorite: true,
    genres: [],
    moods: [],
    platforms: [],
    emotionalTags: [],
    releaseYear: 2023
  },
  {
    id: '3',
    title: 'Helldivers 2',
    coverImage: createApiUrl('/placeholder/cover/helldivers2.jpg'),
    playStatus: 'paused' as const,
    hoursPlayed: 25.7,
    lastPlayed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    addedAt: new Date(),
    isFavorite: false,
    genres: [],
    moods: [],
    platforms: [],
    emotionalTags: [],
    releaseYear: 2024
  }
]

// Mock recommendations (static logic for v1)
const mockRecommendations = [
  {
    id: '4',
    title: 'Elden Ring',
    reason: 'Based on your love for challenging RPGs',
    confidence: 0.92,
    coverImage: createApiUrl('/placeholder/cover/eldenring.jpg'),
    genres: ['RPG', 'Action'],
    mood: 'strategic'
  },
  {
    id: '5',
    title: 'Hades',
    reason: 'Perfect for your competitive gaming sessions',
    confidence: 0.88,
    coverImage: createApiUrl('/placeholder/cover/hades.jpg'), 
    genres: ['Roguelike', 'Action'],
    mood: 'competitive'
  },
  {
    id: '6',
    title: 'Stardew Valley',
    reason: 'Great for relaxing gaming sessions',
    confidence: 0.85,
    coverImage: createApiUrl('/placeholder/cover/stardew.jpg'),
    genres: ['Simulation', 'Casual'],
    mood: 'relaxed'
  }
]

export const HomeHub: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  // Get library data
  const { games } = useLibraryStore(state => state)

  // Simulate loading and data fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500) // Simulate API call

    return () => clearTimeout(timer)
  }, [])

  // Handle game launching
  const handleLaunchGame = (gameId: string) => {
    const game = games?.find(g => g.id === gameId)
    if (game) {
      console.log(`🎮 Launching game: ${game.title}`)
      // In a real implementation, this would launch the game
      // For now, just navigate to game detail
      navigate(`/game/${gameId}`)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <PageErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker">
          <div className="container mx-auto px-4 py-8">
            <Loading message="Loading your Home Hub..." size="xl" />
            
            {/* Loading skeleton for preview */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </PageErrorBoundary>
    )
  }

  return (
    <PageErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker">
        {/* Welcome Header */}
        <header className="relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-gaming-primary/20 via-gaming-secondary/10 to-transparent"></div>
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
          
          <div className="relative z-10 container mx-auto px-4 py-8">
            <div className="glass-morphism rounded-2xl p-8 border border-white/10 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                {/* User Welcome */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {user?.username ? (
                      <img 
                        src={user.username} 
                        alt={user.username}
                        className="w-16 h-16 rounded-full border-2 border-gaming-primary/50 object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-gaming-primary to-gaming-secondary rounded-full flex items-center justify-center">
                        <span className="text-white text-xl font-bold">
                          {user?.username?.charAt(0)?.toUpperCase() || 'G'}
                        </span>
                      </div>
                    )}
                    
                    {/* Online indicator */}
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                      Welcome back, {user?.username || 'Gamer'}!
                    </h1>
                    <p className="text-gray-300 text-sm sm:text-base">
                      Ready to continue your gaming journey?
                    </p>
                  </div>
                </div>

                {/* Theme Toggle */}
                <ThemeToggle size="md" />
              </div>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-gaming-primary">{games?.length || 0}</div>
                    <div className="text-gray-400 text-sm">Games</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gaming-secondary">0</div>
                    <div className="text-gray-400 text-sm">Hours Played</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-400">5</div>
                    <div className="text-gray-400 text-sm">Achievements</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-400">3</div>
                    <div className="text-gray-400 text-sm">New Games</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Recently Played Section */}
            <div className="lg:col-span-2">
              <div className="glass-morphism rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>🎮</span>
                    Recently Played
                  </h2>
                  <button
                    onClick={() => navigate('/library')}
                    className="text-gaming-primary hover:text-gaming-primary/80 transition-colors text-sm font-medium"
                  >
                    View All →
                  </button>
                </div>
                
                <RecentlyPlayedSection 
                  games={mockRecentlyPlayed} 
                  onLaunchGame={handleLaunchGame}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Quick Links to Integrations */}
              <div className="glass-morphism rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span>🔗</span>
                  Quick Links
                </h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/integrations')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xl">🎮</span>
                      <span>Steam</span>
                    </span>
                    <span className="text-blue-200 group-hover:text-white transition-colors">Connect →</span>
                  </button>
                  
                  <button
                    onClick={() => navigate('/integrations')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xl">💬</span>
                      <span>Discord</span>
                    </span>
                    <span className="text-indigo-200 group-hover:text-white transition-colors">Connect →</span>
                  </button>
                  
                  <button
                    onClick={() => navigate('/integrations')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xl">📺</span>
                      <span>YouTube</span>
                    </span>
                    <span className="text-red-200 group-hover:text-white transition-colors">Connect →</span>
                  </button>
                  
                  <button
                    onClick={() => navigate('/integrations')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xl">📺</span>
                      <span>Twitch</span>
                    </span>
                    <span className="text-purple-200 group-hover:text-white transition-colors">Connect →</span>
                  </button>
                </div>
              </div>

              {/* Recommendations Section */}
              <div className="glass-morphism rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span>🎯</span>
                  Recommended for You
                </h3>
                
                <div className="space-y-4">
                  {mockRecommendations.map((game) => (
                    <div 
                      key={game.id}
                      className="flex items-start space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/game/${game.id}`)}
                    >
                      <div className="w-12 h-16 bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                        <img 
                          src={game.coverImage} 
                          alt={game.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = createApiUrl('/placeholder/cover/default.jpg')
                          }}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium mb-1 group-hover:text-gaming-primary transition-colors">
                          {game.title}
                        </h4>
                        <p className="text-gray-400 text-sm mb-2">
                          {game.reason}
                        </p>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 bg-gaming-primary/20 text-gaming-primary rounded-full">
                            {game.confidence}% match
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full">
                            {game.mood}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => navigate('/discover')}
                  className="w-full mt-4 px-4 py-2 bg-gaming-accent text-white rounded-lg hover:bg-gaming-accent/80 transition-colors"
                >
                  Discover More Games →
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Section - Surprise Me & What Should I Buy */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SurpriseMeSection games={games || []} onLaunchGame={handleLaunchGame} />
            <WhatShouldIBuySection games={games || []} />
          </div>
        </main>
      </div>
    </PageErrorBoundary>
  )
}
