import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateGameRecommendations, RecommendationResult } from '../../utils/recommendationEngine';
import { useLibraryStore } from "../../stores/useLibraryStore";
import { MASTER_MOODS } from '../../constants/masterMoods';
import { launchGame } from '../../utils/gameLauncher';

// Session length types
type SessionLength = 'short' | 'medium' | 'long';

// Simple toast implementation
const useToast = () => ({
  showSuccess: (message: string) => console.log('Success:', message),
  showError: (message: string) => console.log('Error:', message),
  showInfo: (message: string) => console.log('Info:', message)
});

// Simple tooltip implementation for game launcher
const showTooltip = (message: string) => {
  console.log('Tooltip:', message);
  // Could implement a proper toast/notification here
};

export const FindYourPerfectPlay: React.FC = () => {
  const { games, actions } = useLibraryStore();
  const { showSuccess, showError } = useToast();
  
  const [selectedMasterMood, setSelectedMasterMood] = useState<string>('adrenaline');
  const [selectedTime, setSelectedTime] = useState<SessionLength>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
  const [allRecommendations, setAllRecommendations] = useState<RecommendationResult[]>([]);

  const [normalizedGames, setNormalizedGames] = useState<any[]>([]);

  // 1. Normalize games data
  useEffect(() => {
    const normalizeData = async () => {
      if (!games || games.length === 0) {
        setNormalizedGames([]);
        return;
      }
      const { normalizeGamesArray } = await import('../../utils/dataPipelineNormalizer')
      const normalized = normalizeGamesArray(games || []);
      setNormalizedGames(normalized);
    };
    
    normalizeData();
  }, [games]);

  // 2. Debug logging
  useEffect(() => {
    console.log('🎯 Grid Verification:', { 
      total: normalizedGames.length, 
      masterMoods: MASTER_MOODS.length 
    });
  }, [normalizedGames]);

  // 3. Handle recommendation generation
  const handleFindPerfectPlay = async () => {
    if (!normalizedGames.length) {
      showError('No games available in your library');
      return;
    }

    setIsGenerating(true);
    setShowResult(false);

    try {
      console.log('🔍 Starting recommendation analysis...');
      
      const results = await calculateGameRecommendations({
        masterMood: selectedMasterMood,
        timeAvailable: selectedTime,
        preferredGenre: 'all', // Always use 'all' since we removed genre selection
        games: normalizedGames
      });

      console.log('🔍 Recommendation results:', results.length, 'games found');
      
      if (results && results.length > 0) {
        // Shuffle and take top 3 for variety
        const shuffled = [...results].sort(() => Math.random() - 0.5);
        const top3 = shuffled.slice(0, 3);
        const selected = top3[0];
        
        setAllRecommendations(top3);
        setRecommendation(selected);
        setShowResult(true);
        
        showSuccess('Perfect match found!');
        console.log('🎯 Selected recommendation:', selected.game.title);
      } else {
        showError('No games match your criteria');
      }
    } catch (error) {
      console.error('Recommendation failed:', error);
      showError('Failed to generate recommendations');
    } finally {
      setIsGenerating(false);
    }
  };

  // 4. Handle "Get Different" functionality
  const handleGetDifferent = () => {
    if (allRecommendations.length > 1) {
      // Remove current recommendation and shuffle the rest
      const remaining = allRecommendations.filter(r => r !== recommendation);
      const shuffled = [...remaining].sort(() => Math.random() - 0.5);
      const next = shuffled[0];
      
      setRecommendation(next || allRecommendations[0]);
    } else {
      // Generate new recommendations if we don't have alternatives
      handleFindPerfectPlay();
    }
  };

  return (
    <div className="min-h-screen bg-gaming-dark text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-black text-white mb-4 tracking-tighter"
        >
          🎯 FIND YOUR PERFECT PLAY
        </motion.h1>
        <p className="text-gray-400 text-lg">Neural analysis of your {normalizedGames.length} games.</p>
      </motion.div>

      <div className="max-w-6xl mx-auto">
        <div className="space-y-12">
          
          {/* MOOD SELECTION */}
          <div>
            <h3 className="text-gray-500 font-bold text-sm uppercase tracking-widest mb-6">1. Pick Your Vibe</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {MASTER_MOODS.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMasterMood(mood.id)}
                  className={`p-4 rounded-xl font-black text-sm transition-all flex flex-col items-center justify-center min-h-[80px] ${
                    selectedMasterMood === mood.id
                      ? 'bg-gradient-to-br from-gaming-primary to-gaming-secondary text-white shadow-2xl border-2 border-gaming-primary/50 transform scale-105'
                      : 'bg-gray-900/40 border-gray-800 hover:border-white/20 hover:bg-white/10 hover:text-black'
                  }`}
                >
                  <span className="text-2xl mb-1">{mood.emoji}</span>
                  <span className="text-[8px] font-black uppercase tracking-tighter leading-tight">{mood.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* TIME SELECTION */}
          <div>
            <h3 className="text-gray-500 font-bold text-sm uppercase tracking-widest mb-6">2. How Much Time?</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'short', name: 'Quick', time: '15-30 min', emoji: '⚡' },
                { id: 'medium', name: 'Session', time: '1-2 hours', emoji: '🎮' },
                { id: 'long', name: 'Deep Dive', time: '3+ hours', emoji: '🌙' }
              ].map((time) => (
                <button
                  key={time.id}
                  onClick={() => setSelectedTime(time.id as SessionLength)}
                  className={`p-4 rounded-xl font-black text-sm transition-all flex flex-col items-center justify-center ${
                    selectedTime === time.id
                      ? 'bg-gradient-to-br from-gaming-primary to-gaming-secondary text-white shadow-2xl border-2 border-gaming-primary/50 transform scale-105'
                      : 'bg-gray-900/40 border-gray-800 hover:border-white/20 hover:bg-white/10 hover:text-black'
                  }`}
                >
                  <span className="text-2xl mb-1">{time.emoji}</span>
                  <span className="text-[10px] font-black uppercase tracking-tighter">{time.name}</span>
                  <span className="text-[8px] text-gray-400 mt-1">{time.time}</span>
                </button>
              ))}
            </div>
          </div>

          {/* GENERATE BUTTON */}
          <div className="flex justify-center">
            <button
              onClick={handleFindPerfectPlay}
              disabled={isGenerating || normalizedGames.length === 0}
              className="px-12 py-6 bg-gradient-to-r from-gaming-primary to-gaming-accent text-white font-black text-xl rounded-2xl shadow-2xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-30 uppercase tracking-tighter"
            >
              {isGenerating ? 'Analyzing Neural Patterns...' : 'Generate Top Pick'}
            </button>
          </div>
        </div>
      </div>

      {/* RESULTS AREA */}
      <AnimatePresence mode="wait">
        {showResult && recommendation && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mt-16 bg-gradient-to-br from-gray-900 to-black border-2 border-gaming-primary/50 rounded-[2.5rem] p-10 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gaming-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gaming-accent/10 rounded-full blur-3xl group-hover:scale-150 transition-transform" />
            
            <div className="relative z-10">
              <div className="flex items-start gap-8">
                {/* Game Image */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-40 bg-gradient-to-br from-gaming-primary/20 to-gaming-accent/20 rounded-xl overflow-hidden border-2 border-gaming-primary/30">
                    {recommendation.game.coverImage ? (
                      <img 
                        src={recommendation.game.coverImage} 
                        alt={recommendation.game.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        🎮
                      </div>
                    )}
                  </div>
                </div>

                {/* Game Info */}
                <div className="flex-1">
                  <h2 className="text-3xl font-black mb-2 bg-gradient-to-r from-gaming-primary to-gaming-accent bg-clip-text text-transparent">
                    {recommendation.game.title}
                  </h2>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-3 py-1 bg-gaming-primary/20 border border-gaming-primary/50 rounded-full text-xs font-black uppercase">
                      {selectedMasterMood}
                    </span>
                    <span className="px-3 py-1 bg-gaming-accent/20 border border-gaming-accent/50 rounded-full text-xs font-black uppercase">
                      {selectedTime}
                    </span>
                    <span className="text-gaming-primary font-black">
                      Score: {Math.round(recommendation.score * 100)}%
                    </span>
                  </div>

                  <p className="text-gray-300 mb-6">
                    {recommendation.reasoning}
                  </p>

                  {/* Game Details */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {recommendation.game.genres && recommendation.game.genres.length > 0 && (
                      <div>
                        <span className="text-gray-500 text-xs uppercase">Genres</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {recommendation.game.genres.slice(0, 3).map((genre: any, i: number) => {
                            let genreName = 'Unknown';
                            if (typeof genre === 'string') {
                              genreName = genre;
                            } else if (genre?.name) {
                              genreName = genre.name;
                            } else if (genre?.id) {
                              genreName = genre.id;
                            }
                            return (
                              <span key={i} className="text-xs bg-gray-800 px-2 py-1 rounded">
                                {genreName}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {recommendation.game.moods && recommendation.game.moods.length > 0 && (
                      <div>
                        <span className="text-gray-500 text-xs uppercase">Moods</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {recommendation.game.moods.slice(0, 3).map((mood: string, i: number) => (
                            <span key={i} className="text-xs bg-gray-800 px-2 py-1 rounded">
                              {mood}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => launchGame(recommendation.game)}
                      className="px-6 py-3 bg-gaming-primary text-white font-black rounded-xl hover:brightness-110 transition-all"
                    >
                      🎮 Play Now
                    </button>
                    
                    {allRecommendations.length > 1 && (
                      <button
                        onClick={handleGetDifferent}
                        className="px-6 py-3 bg-gray-800 text-white font-black rounded-xl hover:bg-gray-700 transition-all"
                      >
                        🔄 Get Different
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FindYourPerfectPlay;
