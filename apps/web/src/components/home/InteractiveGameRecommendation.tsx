import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { MOODS, type MoodId } from '@gamepilot/static-data';
import { launchGame } from '../../utils/launchGame';
import { useToast } from '../../components/ui/ToastProvider';
import { calculateGameRecommendations, type RecommendationResult } from '../../utils/recommendationEngine';
import { getMoodOptions, getGenreOptions, getTimeOptions } from '../../utils/libraryAnalyzer';

interface GameRecommendation {
  game: any;
  score: number;
  reasoning: string;
  moodMatch: number;
  genreMatch: number;
}

interface QuestionState {
  currentStep: 0 | 1 | 2 | 3;
  mood: MoodId | null;
  timeAvailable: string | null;
  preferredGenre: string | null;
  recommendations: RecommendationResult[];
}


export function InteractiveGameRecommendation() {
  const { games } = useLibraryStore();
  const toast = useToast();
  
  // Generate dynamic options based on library
  const moodOptions = useMemo(() => getMoodOptions(games || []), [games]);
  const genreOptions = useMemo(() => getGenreOptions(games || []), [games]);
  const timeOptions = useMemo(() => getTimeOptions(games || []), [games]);
  
  const [questionState, setQuestionState] = useState<QuestionState>({
    currentStep: 0,
    mood: null,
    timeAvailable: null,
    preferredGenre: null,
    recommendations: []
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const calculateRecommendations = () => {
    if (!questionState.mood || !questionState.timeAvailable || !questionState.preferredGenre || !games) {
      return [];
    }

    return calculateGameRecommendations({
      games,
      mood: questionState.mood,
      preferredGenre: questionState.preferredGenre,
      timeAvailable: questionState.timeAvailable
    }).slice(0, 3);
  };

  const handleMoodSelect = (mood: MoodId) => {
    setQuestionState(prev => ({ ...prev, mood, currentStep: 1 }));
  };

  const handleTimeSelect = (time: string) => {
    setQuestionState(prev => ({ ...prev, timeAvailable: time, currentStep: 2 }));
  };

  const handleGenreSelect = (genre: string) => {
    setQuestionState(prev => ({ ...prev, preferredGenre: genre, currentStep: 3 }));
  };

  const generateRecommendations = async () => {
    setIsGenerating(true);
    
    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const recommendations = calculateRecommendations();
    setQuestionState(prev => ({ ...prev, recommendations }));
    setIsGenerating(false);
  };

  const handleLaunchGame = async (game: any) => {
    try {
      let steamAppId: number | null = null;
      
      if (game.appId && typeof game.appId === 'number') {
        steamAppId = game.appId;
      } else if ((game as any).steamUrl) {
        const match = (game as any).steamUrl.match(/\/app\/(\d+)/);
        if (match) {
          steamAppId = parseInt(match[1]);
        }
      } else if (/^\d+$/.test(game.id)) {
        steamAppId = parseInt(game.id);
      }

      if (steamAppId) {
        await launchGame(steamAppId);
        toast.showSuccess(`${game.title} launched successfully!`);
      } else {
        toast.showInfo(`Game: ${game.title}\n\nThis game doesn't have a Steam App ID configured.`);
      }
    } catch (error) {
      console.error('Error launching game:', error);
      toast.showError(`Failed to launch ${game.title}.`);
    }
  };

  const resetQuestions = () => {
    setQuestionState({
      currentStep: 0,
      mood: null,
      timeAvailable: null,
      preferredGenre: null,
      recommendations: []
    });
  };

  return (
    <div className="glass-morphism rounded-xl p-8 border border-white/10 relative overflow-hidden">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-gaming font-bold text-white mb-2 flex items-center justify-center gap-3"
        >
          <span className="text-4xl">🎯</span>
          Find Your Perfect Game
        </motion.h2>
        <p className="text-gray-300 text-lg">
          Answer a few questions for personalized recommendations
        </p>
      </div>

      {/* Question Steps */}
      <AnimatePresence mode="wait">
        {questionState.currentStep === 0 && (
          <motion.div
            key="mood"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-6">What's your current mood?</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {moodOptions.map((mood) => (
                  <motion.button
                    key={mood.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleMoodSelect(mood.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      questionState.mood === mood.value
                        ? 'border-gaming-primary bg-gaming-primary/20 shadow-lg shadow-gaming-primary/25'
                        : 'border-white/20 bg-white/5 hover:border-gaming-primary/50 hover:bg-gaming-primary/10'
                    }`}
                  >
                    <div className="text-3xl mb-2">{mood.icon}</div>
                    <div className="text-white font-medium">{mood.label}</div>
                    <div className="text-xs text-white/60 mt-1">{mood.count} games</div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {questionState.currentStep === 1 && (
          <motion.div
            key="time"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-6">How much time do you have?</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {timeOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTimeSelect(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      questionState.timeAvailable === option.value
                        ? 'border-gaming-secondary bg-gaming-secondary/20 shadow-lg shadow-gaming-secondary/25'
                        : 'border-white/20 bg-white/5 hover:border-gaming-secondary/50 hover:bg-gaming-secondary/10'
                    }`}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <div className="text-white font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-white/60 mt-1">{option.count} games</div>
                    <div className="text-xs text-white/40 mt-1 text-center italic">{option.sessionMood}</div>
                    <div className="text-xs text-white/30 mt-1 text-center">{option.description}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {questionState.currentStep === 2 && (
          <motion.div
            key="genre"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-6">What genre do you prefer?</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {genreOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleGenreSelect(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 bg-gradient-to-br ${option.color} ${
                      questionState.preferredGenre === option.value
                        ? 'border-purple-500 shadow-lg shadow-purple-500/25'
                        : 'border-white/20 hover:border-purple-500/50 hover:opacity-90'
                    }`}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <div className="text-white font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-white/60 mt-1">{option.count} games</div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {questionState.currentStep === 3 && (
          <motion.div
            key="generating"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-6">Ready to find your perfect game?</h3>
              
              {!isGenerating && questionState.recommendations.length === 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={generateRecommendations}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <span className="flex items-center gap-2">
                    <span>🎮</span>
                    Find My Perfect Game
                  </span>
                </motion.button>
              )}

              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <div className="inline-flex items-center gap-3">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-white text-lg">Analyzing your preferences...</span>
                  </div>
                </motion.div>
              )}

              {questionState.recommendations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {questionState.recommendations.map((rec, index) => (
                      <motion.div
                        key={rec.game.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-morphism rounded-xl p-4 border border-white/10 hover:border-gaming-primary/50 transition-all duration-300"
                      >
                        <div className="relative mb-4">
                          {rec.game.coverImage ? (
                            <img
                              src={rec.game.coverImage}
                              alt={rec.game.title}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-32 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
                              <span className="text-4xl">🎮</span>
                            </div>
                          )}
                          
                          {/* Match Score Badge */}
                          <div className="absolute top-2 right-2 bg-gaming-primary text-white text-xs px-2 py-1 rounded-full font-bold">
                            {Math.round(rec.score * 100)}% Match
                          </div>
                        </div>
                        
                        <h4 className="text-white font-semibold mb-2">{rec.game.title}</h4>
                        <p className="text-gray-300 text-sm mb-4">{rec.reasoning}</p>
                        
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleLaunchGame(rec.game)}
                            className="flex-1 px-4 py-2 bg-gaming-primary text-white rounded-lg font-medium hover:bg-gaming-primary/80 transition-colors"
                          >
                            🚀 Play Now
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    onClick={resetQuestions}
                    className="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
                  >
                    Start Over
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Indicator */}
      <div className="flex justify-center gap-2 mt-8">
        {[0, 1, 2, 3].map((step) => (
          <div
            key={step}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              questionState.currentStep >= step
                ? 'bg-gaming-primary'
                : 'bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
