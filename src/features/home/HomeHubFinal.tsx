import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { useGamePilotStore } from '../../stores/useGamePilotStore';
import { useProfileStore } from '../../stores/profileStore';
import { useToast } from '../../components/ui/ToastProvider';
import { launchGame } from '../../utils/launchGame';
import { SteamStorefrontService } from '../../services/steamStorefrontService';
import { generatePersonaContext, detectTimeOfDay, PersonaContext } from '../../utils/contextualEngine';
import { usePersonaRealtime } from '../../hooks/usePersonaRealtime';
import { usePersonaSnapshot } from '../../hooks/persona';
import { usePersonaRecommendation } from '../../hooks/usePersonaRecommendation';
import { normalizeGamesArray } from '../../utils/dataPipelineNormalizer';
import { FindYourPerfectPlay } from '../../components/home/FindYourPerfectPlay';
import { SurpriseMeSection } from './components/SurpriseMeSection';
import { LeastPlayedRecommenderSection } from './components/LeastPlayedRecommenderSection';
import { EnhancedPurchaseRecommendations } from './components/EnhancedPurchaseRecommendations';
// import { PremiumFeatureGate, PremiumBanner, UpgradeButton, PremiumStatus } from '../../components/premium';

const HomeHubFinal: React.FC = () => {
  const navigate = useNavigate();
  const { user, persona } = useAuthStore();
  const { games, actions } = useLibraryStore();
  const { integrations } = useGamePilotStore();
  const { profile } = useProfileStore();
  const { showSuccess, showError } = useToast();

  // Get real-time persona updates
  const realtimePersona = usePersonaRealtime();
  
  // Get persona snapshot for fallback/computed data
  const personaSnapshot = usePersonaSnapshot();
  
  // Get persona-driven recommendation
  const personaRecommendation = usePersonaRecommendation();
  
  // Use real-time persona as primary source, fallback to auth store, then snapshot
  const currentPersona = realtimePersona.persona || persona || personaSnapshot;

  // Steam recently played games
  const [steamRecentlyPlayed, setSteamRecentlyPlayed] = useState<any[]>([])

  // Fetch Steam recently played games when user is authenticated
  useEffect(() => {
    const fetchSteamRecentlyPlayed = async () => {
      if (user?.integrations?.some((i: any) => i.platform === 'steam')) {
        try {
          // Get user's Steam ID from integrations
          const steamIntegration = user.integrations.find((i: any) => i.platform === 'steam')
          if (steamIntegration?.externalUserId) {
            const steamGames = await SteamStorefrontService.getRecentlyPlayedSteamGames(steamIntegration.externalUserId)
            setSteamRecentlyPlayed(steamGames)
            console.log('🎮 Loaded Steam recently played games:', steamGames.length)
          }
        } catch (error) {
          console.warn('Failed to fetch Steam recently played games:', error)
        }
      }
    }

    if (user) {
      fetchSteamRecentlyPlayed()
    }
  }, [user]);

  // Normalize games data
  const normalizedGames = useMemo(() => {
    return normalizeGamesArray(games || []);
  }, [games]);

  // Generate persona context for analytics
  const personaContext: PersonaContext | null = useMemo(() => {
    if (!currentPersona || !currentPersona.signals) return null;
    
    try {
      return generatePersonaContext(currentPersona.signals);
    } catch (error) {
      console.warn('Failed to generate persona context:', error);
      return null;
    }
  }, [currentPersona]);

  // Game handlers
  const handleLaunchGame = async (game: any) => {
    if (!game?.id || !game?.title) {
      showError('Invalid game data');
      return;
    }

    try {
      showSuccess(`Launching ${game.title}...`);
      
      // Update lastPlayed for this game
      actions.updateGame(game.id, { 
        ...game, 
        lastPlayed: new Date().toISOString(),
        lastPlayedAt: Date.now()
      });
      
      if (game.appId) {
        await launchGame(game.appId);
        showSuccess(`${game.title} launched successfully!`);
      } else {
        showError(`No launch ID available for ${game.title}`);
      }
    } catch (error) {
      showError(`Failed to launch ${game.title}`);
    }
  };

  const handleStatusChange = (gameId: string, newStatus: string) => {
    actions.updateGameStatus(gameId, newStatus as any);
  };

  const handleEditGame = (game: any) => {
    navigate(`/library/game/${game.id}`);
  };

  const handleDeleteGame = (gameId: string) => {
    actions.deleteGame(gameId);
  };

  // Helper function to calculate gaming streak
  const calculateGamingStreak = (games: any[]) => {
    const today = new Date();
    let streak = 0;
    
    // Check consecutive days with gaming activity
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toDateString();
      
      // Check if any game was played on this date
      const hasActivity = games.some(game => {
        if (!game.lastPlayed) return false;
        const gameDate = new Date(game.lastPlayed).toDateString();
        return gameDate === dateStr;
      });
      
      if (hasActivity) {
        streak++;
      } else if (i > 0) { // Allow first day to have no activity (today)
        break;
      }
    }
    
    return streak;
  };

  // Helper function to generate micro-insights
  const generateMicroInsight = (games: any[], dominantMood: string, topGenre: string, totalHours: number) => {
    const insights = [];
    
    // Time-based insights
    const recentGames = games.filter(game => {
      if (!game.lastPlayed) return false;
      const daysSincePlayed = (Date.now() - new Date(game.lastPlayed).getTime()) / (1000 * 60 * 60 * 24);
      return daysSincePlayed <= 7;
    });
    
    if (recentGames.length > 0) {
      insights.push(`${recentGames.length} games played this week`);
    }
    
    // Genre-based insights
    if (topGenre && dominantMood) {
      insights.push(`Love ${topGenre} games for ${dominantMood} vibes`);
    }
    
    // Hours-based insights
    if (totalHours > 100) {
      insights.push(`Dedicated gamer with ${totalHours}+ hours`);
    } else if (totalHours > 50) {
      insights.push(`${totalHours} hours of adventure`);
    } else {
      insights.push(`Growing library with ${totalHours} hours played`);
    }
    
    // Mood-based insights
    if (dominantMood === 'intense') {
      insights.push('Thrill-seeking gamer');
    } else if (dominantMood === 'relaxing') {
      insights.push('Casual gaming enthusiast');
    } else if (dominantMood === 'strategic') {
      insights.push('Tactical mastermind');
    }
    
    return insights[0] || 'Ready for new gaming adventures';
  };

  // Calculate real analytics data
  const analyticsData = useMemo(() => {
    if (!normalizedGames.length) return null;

    // Calculate dominant mood from real game moods
    const moodCounts: Record<string, number> = {};
    normalizedGames.forEach((game: any) => {
      const moods = game.moods || [];
      moods.forEach((mood: string) => {
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      });
    });
    
    const dominantMood = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'balanced';

    // Calculate top genre from real game genres
    const genreCounts: Record<string, number> = {};
    normalizedGames.forEach((game: any) => {
      const genres = game.genres || [];
      genres.forEach((genre: any) => {
        const genreName = typeof genre === 'string' ? genre : genre.name;
        if (genreName) {
          genreCounts[genreName.toLowerCase()] = (genreCounts[genreName.toLowerCase()] || 0) + 1;
        }
      });
    });
    
    const topGenreEntry = Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)[0];
    const topGenre = topGenreEntry ? topGenreEntry[0] : 'action';

    // Calculate real total hours from game data
    const totalHours = normalizedGames.reduce((total: number, game: any) => {
      return total + (game.playtime || 0);
    }, 0);

    // Calculate current gaming streak
    const currentStreak = calculateGamingStreak(normalizedGames);

    // Generate real micro-insight
    const microInsight = generateMicroInsight(normalizedGames, dominantMood, topGenre, totalHours);

    return {
      dominantMood,
      topGenre,
      totalHours,
      currentStreak,
      microInsight
    };
  }, [normalizedGames, personaContext]);

  // Get last played game for "Continue Playing" - prioritize Steam data over local data
  const lastPlayedGame = useMemo(() => {
    // First, try to get the most recently played game from Steam data
    if (steamRecentlyPlayed.length > 0) {
      const mostRecentSteamGame = steamRecentlyPlayed[0] // Steam API returns games sorted by most recent

      // Try to match with local game library
      const localGameMatch = normalizedGames.find(game =>
        game.appId === mostRecentSteamGame.appid ||
        game.title.toLowerCase().includes(mostRecentSteamGame.name.toLowerCase())
      )

      if (localGameMatch) {
        console.log('🎮 Using Steam recently played game:', mostRecentSteamGame.name)
        return {
          ...localGameMatch,
          // Override local timestamps with Steam data
          lastPlayed: new Date(mostRecentSteamGame.last_played * 1000), // Steam uses Unix timestamp
          hoursPlayed: mostRecentSteamGame.playtime_forever / 60, // Convert minutes to hours
          totalPlaytime: mostRecentSteamGame.playtime_forever / 60
        }
      }
    }

    // Fallback to local game data if no Steam data or no match found
    console.log('🎮 Using local game data for last played game')
    const sortedGames = [...normalizedGames].sort((a, b) => {
      const aTime = a.lastPlayedAt || (a.lastPlayed ? new Date(a.lastPlayed).getTime() : 0);
      const bTime = b.lastPlayedAt || (b.lastPlayed ? new Date(b.lastPlayed).getTime() : 0);
      return bTime - aTime; // Most recent first
    });

    return sortedGames[0]; // Return the most recently played game
  }, [normalizedGames, steamRecentlyPlayed]);

  // Get achievements (mock data)
  const achievements = useMemo(() => [
    { id: 'streak', title: '5-Day Streak', icon: '🔥', color: 'bg-orange-500' },
    { id: 'mood', title: 'Mood Explorer', icon: '🎭', color: 'bg-purple-500' },
    { id: 'genre', title: 'Genre Master', icon: '🎮', color: 'bg-blue-500' }
  ], []);

  // Helper functions for personalized greeting
  const getDisplayName = () => {
    // Try to get preferred greeting from profile first, then fallback to display name, username, or 'Gamer'
    return profile?.preferredGreeting || user?.displayName || user?.username || 'Gamer'
  }

  // Memoize the greeting phrase to prevent constant re-calculation
  const greetingPhrase = useMemo(() => {
    // Get custom greeting phrases from profile or use defaults
    const phrases = profile?.greetingPhrases || [
      'Ready to crush some games?',
      'Time to level up!',
      'Let the gaming begin!',
      'Ready for an adventure?',
      'Let\'s make gaming history!'
    ]
    
    // Use a stable random selection based on current date (changes daily, not every render)
    const today = new Date().toDateString()
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const index = seed % phrases.length
    
    return phrases[index]
  }, [profile?.greetingPhrases]) // Only recalculate when phrases change

  return (
    <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none" />
      <div className="relative z-10 px-8 py-8">
        
        {/* CINEMATIC USER INTRO */}
        <motion.section className="text-center mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Welcome back, {getDisplayName()} 🎮
            </h1>
            {/* <PremiumStatus /> */} {/* Temporarily disabled for YouTube promotion */}
          </div>
          <p className="text-xl text-gray-300">{greetingPhrase}</p>
        </motion.section>

        {/* PREMIUM BANNER - Temporarily disabled for YouTube promotion */}
        {/*
        <PremiumBanner
          title="🚀 Unlock Advanced Analytics"
          description="Get detailed gaming patterns, AI recommendations, and unlimited RAWG API calls with Premium"
          feature="advanced-analytics"
        />
        */}

        {/* IDENTITY & MOOD ANALYTICS STRIP */}
        {analyticsData && (
          <motion.section className="mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
              <div className="gaming-card rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">🎮</div>
                <div className="text-sm text-gray-400">Gaming Style</div>
                <div className="text-lg font-semibold text-white capitalize">{analyticsData.dominantMood}</div>
              </div>
              <div className="gaming-card rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">🎯</div>
                <div className="text-sm text-gray-400">Top Genre</div>
                <div className="text-lg font-semibold text-white capitalize">{analyticsData.topGenre.charAt(0).toUpperCase() + analyticsData.topGenre.slice(1)}</div>
              </div>
              <div className="gaming-card rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">🔥</div>
                <div className="text-sm text-gray-400">Current Streak</div>
                <div className="text-lg font-semibold text-white">{analyticsData.currentStreak} days</div>
              </div>
              <div className="gaming-card rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">⏱️</div>
                <div className="text-sm text-gray-400">Total Hours</div>
                <div className="text-lg font-semibold text-white">{analyticsData.totalHours}h</div>
              </div>
              <div className="gaming-card rounded-xl p-4 text-center md:col-span-1 col-span-2">
                <div className="text-2xl mb-2">💡</div>
                <div className="text-sm text-gray-400">Micro-Insight</div>
                <div className="text-sm font-semibold text-white">{analyticsData.microInsight}</div>
              </div>
            </div>
          </motion.section>
        )}

        {/* HERO: FIND YOUR PERFECT PLAY */}
        <motion.section className="mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <FindYourPerfectPlay />
        </motion.section>

        {/* LEAST PLAYED RECOMMENDER */}
        <motion.section className="mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <LeastPlayedRecommenderSection games={normalizedGames} onLaunchGame={handleLaunchGame} />
        </motion.section>

        {/* SUPPORTING MODULES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="gaming-card rounded-xl p-6 border border-green-500/30">
              <h3 className="text-lg font-gaming font-semibold text-white mb-6 uppercase tracking-wider flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Surprise Me
              </h3>
              <SurpriseMeSection games={normalizedGames} onLaunchGame={handleLaunchGame} />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="gaming-card rounded-xl p-6 border border-blue-500/30">
              <h3 className="text-lg font-gaming font-semibold text-white mb-6 uppercase tracking-wider flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                What Should I Buy Next?
              </h3>
              <EnhancedPurchaseRecommendations 
                libraryGames={normalizedGames}
                personaProfile={currentPersona}
              />
            </div>
          </motion.div>
          {lastPlayedGame && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="gaming-card rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-lg font-gaming font-semibold text-white mb-6 uppercase tracking-wider flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  Continue Playing
                </h3>
                <div className="flex gap-4 items-center">
                  {lastPlayedGame.coverImage ? (
                    <img src={lastPlayedGame.coverImage} alt={lastPlayedGame.title} className="w-20 h-24 rounded-lg object-cover shadow-lg" />
                  ) : (
                    <div className="w-20 h-24 bg-gray-700 rounded-lg flex items-center justify-center">
                      <span className="text-3xl">🎮</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-white mb-2">{lastPlayedGame.title}</h4>
                    <div className="text-sm text-gray-400 mb-4">
                      {lastPlayedGame.genres?.slice(0, 2).map((genre: any) => (
                        <span key={typeof genre === 'string' ? genre : genre.name} className="inline-block bg-gray-600 px-2 py-1 rounded mr-2 mb-1">
                          {typeof genre === 'string' ? genre : genre.name}
                        </span>
                      ))}
                    </div>
                    <button onClick={() => handleLaunchGame(lastPlayedGame)} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all">
                      <span className="mr-2">▶️</span>
                      Resume Session
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* ACHIEVEMENTS */}
        <motion.section className="mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-gaming font-semibold text-white mb-6 uppercase tracking-wider text-center">Recent Achievements</h3>
            <div className="grid grid-cols-3 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div key={achievement.id} className="gaming-card rounded-xl p-6 text-center border border-white/10" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                  <div className={`w-16 h-16 ${achievement.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-2xl">{achievement.icon}</span>
                  </div>
                  <div className="text-sm font-semibold text-white">{achievement.title}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default HomeHubFinal;
