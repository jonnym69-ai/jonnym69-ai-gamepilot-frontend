import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Clock, Heart } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../utils/supabase';
import EmotionalInputCollector, { EmotionalProfile } from './EmotionalInputCollector';
import GamingCoachResponse, { CoachingRecommendation } from './GamingCoachResponse';
import { getPersonalizedRecommendation, getAlternativeRecommendations, ScoredGame, getAIEnhancedRecommendation } from '../../utils/gameRecommendationAlgorithm';

type CoachStep = 'welcome' | 'collecting' | 'analyzing' | 'recommendation' | 'session-started';

interface GamingCoachProps {
  onClose?: () => void;
  initialStep?: CoachStep;
}

const GamingCoach: React.FC<GamingCoachProps> = ({
  onClose,
  initialStep = 'welcome'
}) => {
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<CoachStep>(initialStep);
  const [emotionalProfile, setEmotionalProfile] = useState<EmotionalProfile | null>(null);
  const [recommendation, setRecommendation] = useState<CoachingRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ownedGamesData, setOwnedGamesData] = useState<Array<{gameId: string, gameName: string, genres: string[], difficulty: string}>>([]);
  const [recentGames, setRecentGames] = useState<string[]>([]);
  const [playHistory, setPlayHistory] = useState<Array<{gameId: string, sessions: number, lastPlayed: Date}>>([]);
  const [recentSessions, setRecentSessions] = useState<Array<{difficulty: string, duration: number, frustration: number}>>([]);
  const [useAI, setUseAI] = useState(false);

  // Load user's gaming data on mount
  useEffect(() => {
    if (user) {
      loadUserGamingData();
    }
  }, [user]);

  const loadUserGamingData = async () => {
    if (!user) return;

    try {
      // Load user's actual game library (owned games)
      const { data: libraryData, error: libraryError } = await supabase
        .from('user_game_library')
        .select('game_id, game_name, genres, difficulty, ownership_status')
        .eq('user_id', user.id)
        .eq('ownership_status', 'owned'); // Only get actually owned games

      if (libraryError) {
        console.error('Error loading game library:', libraryError);
        setOwnedGamesData([]);
      } else {
        const ownedGamesObjects = (libraryData || []).map(game => ({
          gameId: game.game_id,
          gameName: game.game_name,
          genres: game.genres || [],
          difficulty: game.difficulty || 'moderate'
        }));
        setOwnedGamesData(ownedGamesObjects);
        console.log('📚 Loaded user library:', ownedGamesObjects.length, 'owned games');
      }

      // Load gaming sessions for play history and recent activity
      const { data: sessions } = await supabase
        .from('gaming_sessions')
        .select('game_id, game_name, started_at, ended_at, session_length')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(50);

      if (sessions) {
        // Extract recent games (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentGamesData = sessions
          .filter(s => new Date(s.started_at) > sevenDaysAgo)
          .map(s => s.game_id);

        setRecentGames([...new Set(recentGamesData)]);

        // Build play history
        const historyMap = new Map<string, {sessions: number, lastPlayed: Date}>();
        sessions.forEach(session => {
          const existing = historyMap.get(session.game_id);
          if (existing) {
            existing.sessions += 1;
            if (new Date(session.started_at) > existing.lastPlayed) {
              existing.lastPlayed = new Date(session.started_at);
            }
          } else {
            historyMap.set(session.game_id, {
              sessions: 1,
              lastPlayed: new Date(session.started_at)
            });
          }
        });

        const history = Array.from(historyMap.entries()).map(([gameId, data]) => ({
          gameId,
          sessions: data.sessions,
          lastPlayed: data.lastPlayed
        }));

        setPlayHistory(history);

        // Build recent sessions data for burnout calculation
        const recentSessionsData = sessions
          .slice(0, 10)
          .map(session => ({
            difficulty: 'moderate', // We'll enhance this later with actual difficulty data
            duration: session.session_length || 60,
            frustration: 5 // Default neutral; enhance with actual feedback
          }));

        setRecentSessions(recentSessionsData);
      }

    } catch (error) {
      console.error('Error loading user gaming data:', error);
      // Set empty defaults on error
      setOwnedGamesData([]);
      setRecentGames([]);
      setPlayHistory([]);
      setRecentSessions([]);
    }
  };

  const handleEmotionalProfileSubmit = async (profile: EmotionalProfile) => {
    setEmotionalProfile(profile);
    setCurrentStep('analyzing');
    setIsLoading(true);

    try {
      // Get personalized recommendation using the algorithm (with optional AI enhancement)
      const scoredGame = useAI
        ? await getAIEnhancedRecommendation(
            profile,
            ownedGamesData.map(g => g.gameId), // Extract game IDs for algorithm
            ownedGamesData, // Pass full game data for AI
            recentGames,
            playHistory,
            recentSessions,
            true // use AI
          )
        : getPersonalizedRecommendation(
            profile,
            ownedGamesData.map(g => g.gameId), // Extract game IDs for algorithm
            recentGames,
            playHistory,
            recentSessions
          );

      if (scoredGame) {
        // Get alternative recommendations
        const alternatives = getAlternativeRecommendations(
          profile,
          scoredGame,
          3,
          ownedGamesData.map(g => g.gameId), // Extract game IDs
          recentGames,
          playHistory,
          recentSessions
        );

        // Save emotional profile to database
        const { data: profileData, error: profileError } = await supabase
          .from('emotional_profiles')
          .insert({
            user_id: user?.id,
            energy_level: profile.energyLevel,
            cognitive_load: profile.cognitiveLoad,
            tolerance_level: profile.toleranceLevel,
            social_appetite: profile.socialAppetite,
            emotional_needs: profile.emotionalNeeds,
            available_time: profile.availableTime,
            session_type: profile.sessionType
          })
          .select()
          .single();

        if (profileError) {
          console.error('Error saving emotional profile:', profileError);
        }

        // Generate coaching insights
        const coachingInsights = generateCoachingInsights(profile, scoredGame);

        // Create recommendation object
        const recommendationData: CoachingRecommendation = {
          gameId: scoredGame.gameId,
          gameName: scoredGame.gameName,
          reasoning: scoredGame.reasoning,
          emotionalMatch: generateEmotionalMatchDescription(profile, scoredGame),
          timeFit: generateTimeFitDescription(profile, scoredGame),
          confidence: Math.round(scoredGame.matchScore.totalScore * 100),
          alternativeGames: alternatives.slice(0, 3).map(alt => ({
            gameId: alt.gameId,
            gameName: alt.gameName,
            briefReason: alt.reasoning.substring(0, 100) + '...'
          })),
          coachingInsights,
          estimatedDuration: generateDurationEstimate(profile, scoredGame),
          difficultyLevel: scoredGame.difficulty,
          moodAlignment: generateMoodAlignment(profile, scoredGame)
        };

        setRecommendation(recommendationData);
        setCurrentStep('recommendation');

      } else {
        // No recommendation found - this shouldn't happen with our algorithm
        console.error('No recommendation generated');
        setCurrentStep('welcome');
      }

    } catch (error) {
      console.error('Error generating recommendation:', error);
      setCurrentStep('welcome');
    } finally {
      setIsLoading(false);
    }
  };

  const generateCoachingInsights = (profile: EmotionalProfile, game: ScoredGame): string[] => {
    const insights: string[] = [];

    const energyLevel = profile.energyLevel <= 3 ? 'low' : profile.energyLevel <= 7 ? 'moderate' : 'high';
    const primaryNeed = profile.emotionalNeeds[0];

    if (energyLevel === 'low' && primaryNeed === 'comfort') {
      insights.push("Perfect for winding down - this game respects your current energy level");
    }

    if (primaryNeed === 'mastery' && energyLevel === 'high') {
      insights.push("Great for channeling your motivation into meaningful progress");
    }

    if (profile.socialAppetite === 'solo' && game.pacing < 5) {
      insights.push("Ideal solo experience with gentle, contemplative pacing");
    }

    insights.push(`Based on ${playHistory.length} games in your history`);
    insights.push("Recommendation adapts to your recent gaming patterns");

    return insights.slice(0, 3); // Max 3 insights
  };

  const generateEmotionalMatchDescription = (profile: EmotionalProfile, game: ScoredGame): string => {
    const primaryNeed = profile.emotionalNeeds[0];
    const needAlignment = game[`${primaryNeed}Alignment` as keyof ScoredGame] as number;

    if (needAlignment >= 8) return `Excellent ${primaryNeed} alignment (${needAlignment}/10)`;
    if (needAlignment >= 6) return `Good ${primaryNeed} alignment (${needAlignment}/10)`;
    return `Moderate ${primaryNeed} alignment (${needAlignment}/10)`;
  };

  const generateTimeFitDescription = (profile: EmotionalProfile, game: ScoredGame): string => {
    const timeToFun = game.timeToFun;
    const available = profile.availableTime;

    if (timeToFun <= available * 0.25) return "Quick to engage - perfect for your time frame";
    if (timeToFun <= available * 0.5) return "Gets fun quickly within your available time";
    if (timeToFun <= available) return "Builds to fun within your session length";
    return "May take time to get engaging, but worth it";
  };

  const generateDurationEstimate = (profile: EmotionalProfile, game: ScoredGame): string => {
    const baseTime = game.avgPlaytime;

    if (profile.sessionType === 'quick') return `${Math.min(45, baseTime)} minutes`;
    if (profile.sessionType === 'focused') return `${Math.min(120, baseTime)} minutes`;
    if (profile.sessionType === 'immersive') return `${Math.min(300, baseTime)} minutes`;
    return `${baseTime}+ minutes`;
  };

  const generateMoodAlignment = (profile: EmotionalProfile, game: ScoredGame): string => {
    const energyMatch = Math.abs(game.pacing - profile.energyLevel) <= 2;
    const cognitiveMatch = Math.abs(game.mechanicalComplexity - profile.cognitiveLoad) <= 2;

    if (energyMatch && cognitiveMatch) return "Excellent mood alignment";
    if (energyMatch || cognitiveMatch) return "Good mood alignment";
    return "Moderate mood alignment";
  };

  const handleAcceptRecommendation = async (gameId: string, gameName: string) => {
    if (!emotionalProfile || !recommendation || !user) return;

    try {
      // Save coaching session to database
      const { error } = await supabase
        .from('coaching_sessions')
        .insert({
          user_id: user.id,
          emotional_profile_id: null, // We'll set this after creating the profile record
          recommended_game_id: gameId,
          recommended_game_name: gameName,
          emotional_match_score: recommendation.confidence / 100,
          time_fit_score: 0.8, // We'll calculate this properly later
          availability_score: ownedGamesData.some(g => g.gameId === gameId) ? 1.0 : 0.6,
          novelty_score: 0.7, // Default for now
          burnout_risk_score: 0.9, // Default for now
          total_score: recommendation.confidence / 100
        });

      if (error) {
        console.error('Error saving coaching session:', error);
      }

      setCurrentStep('session-started');
    } catch (error) {
      console.error('Error accepting recommendation:', error);
    }
  };

  const handleTryAlternative = (gameId: string, gameName: string) => {
    // For now, just accept the alternative
    handleAcceptRecommendation(gameId, gameName);
  };

  const handleStartSession = () => {
    // Mark session as started
    setCurrentStep('session-started');
  };

  const handleGetNewRecommendation = () => {
    setCurrentStep('welcome');
    setEmotionalProfile(null);
    setRecommendation(null);
  };

  const renderWelcome = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6"
    >
      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto">
        <Brain size={32} className="text-white" />
      </div>

      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Your Gaming Coach</h1>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Tell me how you're feeling today, and I'll recommend the perfect game from your library that matches your emotional state, available time, and what you need right now.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <Heart className="w-8 h-8 text-pink-400 mx-auto mb-2" />
          <h3 className="text-white font-medium mb-1">Emotional Intelligence</h3>
          <p className="text-slate-400 text-sm">Understands your mood, energy, and needs</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <Clock className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <h3 className="text-white font-medium mb-1">Time-Aware</h3>
          <p className="text-slate-400 text-sm">Matches games to your available time</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <Sparkles className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <h3 className="text-white font-medium mb-1">Personalized</h3>
          <p className="text-slate-400 text-sm">Learns from your gaming history</p>
        </div>
      </div>

      {/* AI Enhancement Toggle */}
      <div className="max-w-md mx-auto bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-5 h-5 text-purple-400" />
            <div>
              <h4 className="text-white font-medium">AI-Powered Insights</h4>
              <p className="text-slate-400 text-sm">Get enhanced recommendations with AI reasoning</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
              className="sr-only peer"
              aria-label="Enable AI-powered gaming recommendations"
            />
            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>

      <button
        onClick={() => setCurrentStep('collecting')}
        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white font-medium text-lg transition-all transform hover:scale-105"
      >
        Get My Perfect Game Recommendation
      </button>

      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-300 text-sm mt-4"
        >
          Maybe Later
        </button>
      )}
    </motion.div>
  );

  const renderAnalyzing = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center space-y-6"
    >
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Analyzing Your Gaming Profile</h2>
        <p className="text-slate-300">Processing your emotional state, gaming history, and preferences...</p>
      </div>
    </motion.div>
  );

  const renderSessionStarted = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6"
    >
      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
        <Sparkles size={32} className="text-white" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Enjoy Your Gaming Session!</h2>
        <p className="text-slate-300 mb-4">
          After your session, come back and let me know how it went. Your feedback helps me give you even better recommendations next time.
        </p>
        <button
          onClick={handleGetNewRecommendation}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
        >
          Get Another Recommendation
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {currentStep === 'welcome' && (
            <motion.div
              key="welcome"
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderWelcome()}
            </motion.div>
          )}

          {currentStep === 'collecting' && (
            <motion.div
              key="collecting"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <EmotionalInputCollector
                onSubmit={handleEmotionalProfileSubmit}
                onCancel={() => setCurrentStep('welcome')}
                isLoading={isLoading}
              />
            </motion.div>
          )}

          {currentStep === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderAnalyzing()}
            </motion.div>
          )}

          {currentStep === 'recommendation' && recommendation && (
            <motion.div
              key="recommendation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <GamingCoachResponse
                recommendation={recommendation}
                onAcceptRecommendation={handleAcceptRecommendation}
                onTryAlternative={handleTryAlternative}
                onStartSession={handleStartSession}
                onGetNewRecommendation={handleGetNewRecommendation}
                isLoading={isLoading}
              />
            </motion.div>
          )}

          {currentStep === 'session-started' && (
            <motion.div
              key="session-started"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderSessionStarted()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GamingCoach;
