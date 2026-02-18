import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SectionSkeleton } from '../../components/ui/SectionSkeleton'
import { useGamePilotStore } from '../../stores/useGamePilotStore'
import { useLibraryStore } from '../../stores/useLibraryStore'
import { useLibraryPersona } from '../../hooks/persona'
import { useNewMoodRecommendations } from '../../hooks/useNewMoodRecommendations'
import { SurpriseMeSection } from './components/SurpriseMeSection'
import { WhatShouldIBuySection } from './components/WhatShouldIBuySection'
import { RecentlyPlayedSection } from './components/RecentlyPlayedSection'
import { DebugPanel } from './components/DebugPanel'
import { SimpleMoodSelector } from '../../components/SimpleMoodSelector'

export const HomeHub: React.FC = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // NEW: Contextual filtering state
  const [selectedSessionLength, setSelectedSessionLength] = useState<"short" | "medium" | "long" | null>(null)
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "afternoon" | "evening" | "late-night">("morning")
  const [selectedMoods, setSelectedMoods] = useState<string[]>([])
  
  // Auto-detect time of day
  useEffect(() => {
    const detectTimeOfDay = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) return "morning";
      if (hour >= 12 && hour < 17) return "afternoon";
      if (hour >= 17 && hour < 22) return "evening";
      return "late-night";
    };

    setTimeOfDay(detectTimeOfDay());
    const interval = setInterval(detectTimeOfDay, 60000);
    return () => clearInterval(interval);
  }, []);
  
  // Get mood/persona data
  const persona = useLibraryPersona()
  const {
    primaryMood,
    secondaryMood,
    intensity,
    recommendations: moodRecommendations,
    isLoading: moodRecommendationsLoading,
    error: moodRecommendationsError,
    selectMood,
    clearMood,
    setIntensity,
    hasRecommendations
  } = useNewMoodRecommendations({
    games: [],
    onRecommendationsChange: (recs) => {
      console.log('HomeHub mood recommendations updated:', recs.length);
    }
  });
  
  // Try to access the store safely
  let games: any[] = []
  let store: any = null
  let totalPlaytime = 0
  let currentSession = null
  
  try {
    const storeData = useLibraryStore(state => state)
    games = storeData?.games || []
    store = storeData
    currentSession = storeData?.currentSession || null
    const { getTotalPlaytime } = useGamePilotStore()
    totalPlaytime = getTotalPlaytime()
  } catch (err) {
    console.error('Store access error:', err)
    setError('Failed to access store')
  }

  // Set loading to false after component mounts
  useEffect(() => {
    try {
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 100)
      
      return () => clearTimeout(timer)
    } catch (err) {
      console.error('HomeHub initialization error:', err)
      setError('Failed to initialize HomeHub')
      setIsLoading(false)
    }
  }, [])

  // Handle game launching
  const handleLaunchGame = (gameId: string) => {
    try {
      const storeData = useLibraryStore.getState()
      const game = storeData?.games?.find(g => g.id === gameId)
      
      if (game && game.appId) {
        storeData?.actions?.launchGame(game.appId)
      } else {
        console.error('Game not found or no appId:', gameId)
      }
    } catch (err) {
      console.error('Failed to launch game:', err)
    }
  }

  // NEW: Contextual recommendations logic
  const contextualRecommendations = React.useMemo(() => {
    if (!games.length) return []
    
    // Normalize games with contextual data (same logic as LibrarySimple)
    const normalizedGames = games.map(game => {
      const normalizedMoods = (game.moods || [])
        .map((m: any) => {
          if (typeof m === "string") return m.toLowerCase().trim();
          if (typeof m === "object" && m && "name" in m && typeof m.name === "string") return m.name.toLowerCase().trim();
          return null;
        })
        .filter((m: string | null): m is string => m !== null);
      
      // Auto-tag contextual data
      const existingSessionLength = (game as any).sessionLength;
      const existingRecommendedTimes = (game as any).recommendedTimes;
      
      let inferredSessionLength = existingSessionLength;
      let inferredRecommendedTimes = existingRecommendedTimes;
      
      if (!inferredSessionLength) {
        const playtime = game.hoursPlayed || 0;
        if (playtime < 0.5) inferredSessionLength = "short";
        else if (playtime <= 2) inferredSessionLength = "medium";
        else inferredSessionLength = "long";
      }
      
      if (!inferredRecommendedTimes || inferredRecommendedTimes.length === 0) {
        const times = new Set<string>();
        normalizedMoods.forEach((mood: string) => {
          if (["chill", "cozy", "casual", "puzzle", "relaxed"].includes(mood)) times.add("late-night");
          if (["energetic", "competitive", "focused", "intense"].includes(mood)) times.add("morning");
          if (["creative", "immersive", "story-driven", "exploration"].includes(mood)) {
            times.add("afternoon");
            times.add("evening");
          }
        });
        if (times.size === 0) times.add("evening");
        inferredRecommendedTimes = Array.from(times);
      }
      
      return {
        ...game,
        moods: normalizedMoods,
        sessionLength: inferredSessionLength || "medium",
        recommendedTimes: inferredRecommendedTimes || ["evening"]
      };
    });
    
    // Filter games based on contextual criteria
    const filtered = normalizedGames.filter(game => {
      const matchesMood = selectedMoods.length === 0 || 
        selectedMoods.some(mood => game.moods.includes(mood));
      
      const matchesSession = !selectedSessionLength || 
        game.sessionLength === selectedSessionLength;
      
      const matchesTimeOfDay = !game.recommendedTimes || 
        game.recommendedTimes.includes(timeOfDay);
      
      return matchesMood && matchesSession && matchesTimeOfDay;
    });
    
    console.log('Contextual recommendations:', {
      timeOfDay,
      selectedSessionLength,
      selectedMoods,
      totalGames: games.length,
      filteredCount: filtered.length,
      topGames: filtered.slice(0, 5).map(g => g.title)
    });
    
    return filtered.slice(0, 10);
  }, [games, selectedMoods, selectedSessionLength, timeOfDay]);

  // Error boundary fallback
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-gaming-accent text-white rounded-lg hover:bg-gaming-accent/80"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  // Only show loading skeleton if explicitly loading
  if (isLoading) {
    return <SectionSkeleton />
  }

  // Main HomeHub layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-gaming bg-gradient-to-r from-gaming-primary to-gaming-secondary bg-clip-text text-transparent mb-4">
            GamePilot
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Your intelligent gaming companion
          </p>
          
          {/* Mood & Persona Display */}
          <div className="mb-8 flex flex-col items-center gap-4">
            {/* Mood Selector */}
            <div className="flex items-center gap-4">
              <SimpleMoodSelector
                onMoodChange={(primaryMood, secondaryMood) => {
                  selectMood(primaryMood, secondaryMood)
                }}
                variant="compact"
              />
              {hasRecommendations && primaryMood && (
                <div className="text-sm text-gray-400">
                  {moodRecommendations.length} recommendations ready
                </div>
              )}
            </div>
            
            {/* Persona Display */}
            {persona && (
              <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-lg px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🎮</div>
                  <div>
                    <div className="text-white font-medium">
                      {persona.traits?.archetypeId} Playstyle
                    </div>
                    <div className="text-xs text-gray-300">
                      {Math.round((persona.confidence || 0) * 100)}% confidence • {persona.traits?.intensity} intensity
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/library')}
              className="px-6 py-3 bg-gaming-accent text-white rounded-lg font-semibold hover:bg-gaming-accent/80 transition-all"
            >
              📚 View Library
            </button>
            <button
              onClick={() => navigate('/identity')}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
            >
              👤 Gaming Identity
            </button>
          </div>
        </header>

        {/* Mood Recommendations */}
        {hasRecommendations && primaryMood && (
          <div className="mb-12">
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <span>😊</span>
                    {primaryMood} Recommendations
                    {secondaryMood && (
                      <span className="text-purple-400">+ 😊 {secondaryMood}</span>
                    )}
                  </h2>
                  <p className="text-gray-300">
                    Personalized game suggestions for your current mood
                  </p>
                </div>
                <button
                  onClick={() => clearMood()}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                >
                  Clear Mood
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {moodRecommendations.slice(0, 8).map(game => (
                  <div
                    key={game.id}
                    onClick={() => handleLaunchGame(game.id)}
                    className="group cursor-pointer transition-all duration-300 hover:scale-105"
                  >
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                      {game.coverImage ? (
                        <img
                          src={game.coverImage}
                          alt={game.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-lg flex items-center justify-center">
                            <span className="text-xl">🎮</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h4 className="text-white font-medium text-sm truncate mb-1">{game.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-300">
                            {game.hoursPlayed && (
                              <span>⏱️ {game.hoursPlayed}h</span>
                            )}
                            {game.userRating && (
                              <span>⭐ {game.userRating}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-white text-sm font-medium mt-2 truncate group-hover:text-gaming-accent transition-colors">
                      {game.title}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* NEW: Contextual Recommendations */}
        <section className="contextual-recommendations mb-12">
          <div className="bg-gradient-to-r from-blue-900/30 to-green-900/30 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <span>🎯</span>
                  Games Perfect for Right Now
                </h2>
                <p className="text-gray-300">
                  Based on your mood, available time, and the current time of day ({timeOfDay})
                </p>
              </div>
            </div>
            
            {/* Session Length Controls */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-300 mb-2">How long do you have?</h4>
              <div className="flex flex-wrap gap-2">
                {["short", "medium", "long"].map(length => (
                  <button
                    key={length}
                    className={`px-3 py-1 rounded-lg text-sm transition-all ${
                      selectedSessionLength === length 
                        ? "bg-blue-600 text-white border border-blue-500" 
                        : "bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600"
                    }`}
                    onClick={() => setSelectedSessionLength(length as "short" | "medium" | "long")}
                  >
                    {length === "short" && "15–30 min"}
                    {length === "medium" && "1–2 hours"}
                    {length === "long" && "2+ hours"}
                  </button>
                ))}
                {selectedSessionLength && (
                  <button
                    onClick={() => setSelectedSessionLength(null)}
                    className="px-3 py-1 rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            
            {/* Contextual Games Grid */}
            {contextualRecommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {contextualRecommendations.map(game => (
                  <div
                    key={game.id}
                    onClick={() => handleLaunchGame(game.id)}
                    className="group cursor-pointer transition-all duration-300 hover:scale-105"
                  >
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                      {game.coverImage ? (
                        <img
                          src={game.coverImage}
                          alt={game.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                            <span className="text-xl">🎮</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Overlay with contextual info */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h4 className="text-white font-medium text-sm truncate mb-1">{game.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-300">
                            <span>⏱️ {(game as any).sessionLength}</span>
                            <span>🕐 {timeOfDay}</span>
                            {game.hoursPlayed && (
                              <span>📊 {game.hoursPlayed}h</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-white text-sm font-medium mt-2 truncate group-hover:text-blue-400 transition-colors">
                      {game.title}
                    </h3>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <span className="text-4xl">🎯</span>
                </div>
                <h3 className="text-white font-medium mb-2">No perfect matches found</h3>
                <p className="text-gray-400 text-sm">
                  Try adjusting your session length or browse your full library
                </p>
                <button
                  onClick={() => navigate('/library')}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors"
                >
                  Browse Library
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Surprise Me - Hero Section */}
        <SurpriseMeSection games={games} onLaunchGame={handleLaunchGame} />

        {/* What Should I Buy? */}
        <WhatShouldIBuySection games={games} />

        {/* Recently Played */}
        <RecentlyPlayedSection games={games} onLaunchGame={handleLaunchGame} />

        {/* Debug Panel */}
        <DebugPanel 
          games={games} 
          store={store} 
          totalPlaytime={totalPlaytime}
          currentSession={currentSession}
        />
      </div>
    </div>
  )
}
