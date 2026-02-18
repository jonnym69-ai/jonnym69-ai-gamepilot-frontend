import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Star, Clock, Target, Heart } from 'lucide-react';

export interface CoachingRecommendation {
  gameId: string;
  gameName: string;
  reasoning: string;
  emotionalMatch: string;
  timeFit: string;
  confidence: number;
  alternativeGames?: Array<{
    gameId: string;
    gameName: string;
    briefReason: string;
  }>;
  coachingInsights: string[];
  estimatedDuration: string;
  difficultyLevel: 'easy' | 'moderate' | 'challenging' | 'hard';
  moodAlignment: string;
}

interface GamingCoachResponseProps {
  recommendation: CoachingRecommendation;
  onAcceptRecommendation: (gameId: string, gameName: string) => void;
  onTryAlternative: (gameId: string, gameName: string) => void;
  onStartSession: () => void;
  onGetNewRecommendation: () => void;
  isLoading?: boolean;
}

const GamingCoachResponse: React.FC<GamingCoachResponseProps> = ({
  recommendation,
  onAcceptRecommendation,
  onTryAlternative,
  onStartSession,
  onGetNewRecommendation,
  isLoading = false
}) => {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'moderate': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'challenging': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const getConfidenceStars = (confidence: number) => {
    const stars = [];
    const fullStars = Math.floor(confidence / 20); // 20% per star
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          className={`${
            i < fullStars
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-slate-600'
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Main Recommendation Card */}
      <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-slate-700/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Target size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Your Gaming Coach Says...</h3>
                <p className="text-slate-300 text-sm">Personalized recommendation based on your current state</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getConfidenceStars(recommendation.confidence)}
              <span className="text-sm text-slate-300 ml-2">{recommendation.confidence}% match</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Primary Recommendation */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block"
            >
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                Tonight, you should play...
              </h2>
              <div className="text-4xl font-black text-white mb-4">
                {recommendation.gameName}
              </div>
              <div className="flex items-center justify-center gap-4 text-slate-300">
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{recommendation.estimatedDuration}</span>
                </div>
                <div className={`px-3 py-1 rounded-full border text-xs font-medium ${getDifficultyColor(recommendation.difficultyLevel)}`}>
                  {recommendation.difficultyLevel}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Coaching Reasoning */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
          >
            <div className="flex items-start gap-3">
              <Heart size={20} className="text-pink-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Why This Game?</h4>
                <p className="text-slate-200 leading-relaxed">{recommendation.reasoning}</p>
              </div>
            </div>
          </motion.div>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
              <h5 className="text-sm font-medium text-slate-200 mb-2 flex items-center gap-2">
                <Target size={16} className="text-blue-400" />
                Emotional Match
              </h5>
              <p className="text-slate-300 text-sm">{recommendation.emotionalMatch}</p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
              <h5 className="text-sm font-medium text-slate-200 mb-2 flex items-center gap-2">
                <Clock size={16} className="text-green-400" />
                Time Fit
              </h5>
              <p className="text-slate-300 text-sm">{recommendation.timeFit}</p>
            </div>
          </div>

          {/* Coaching Insights */}
          {recommendation.coachingInsights.length > 0 && (
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/20">
              <h5 className="text-sm font-medium text-slate-200 mb-3 flex items-center gap-2">
                <Heart size={16} className="text-pink-400" />
                Coaching Insights
              </h5>
              <ul className="space-y-2">
                {recommendation.coachingInsights.map((insight, index) => (
                  <li key={index} className="text-slate-300 text-sm flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-slate-800/50 border-t border-slate-700/50 px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onAcceptRecommendation(recommendation.gameId, recommendation.gameName)}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all font-medium flex items-center justify-center gap-2"
            >
              <Star size={18} />
              This Sounds Perfect!
            </button>
            <button
              onClick={onStartSession}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all font-medium flex items-center justify-center gap-2"
            >
              <ExternalLink size={18} />
              Start Playing Now
            </button>
          </div>
        </div>
      </div>

      {/* Alternative Recommendations */}
      {recommendation.alternativeGames && recommendation.alternativeGames.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl p-6"
        >
          <h4 className="text-lg font-semibold text-white mb-4">Alternative Options</h4>
          <div className="space-y-3">
            {recommendation.alternativeGames.map((alt, index) => (
              <button
                key={alt.gameId}
                onClick={() => onTryAlternative(alt.gameId, alt.gameName)}
                disabled={isLoading}
                className="w-full text-left p-4 bg-slate-800/50 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium group-hover:text-blue-300 transition-colors">
                      {alt.gameName}
                    </div>
                    <div className="text-slate-400 text-sm mt-1">{alt.briefReason}</div>
                  </div>
                  <ExternalLink size={16} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Get New Recommendation */}
      <div className="text-center">
        <button
          onClick={onGetNewRecommendation}
          disabled={isLoading}
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 rounded-lg transition-colors text-sm"
        >
          Not feeling these? Get a different recommendation
        </button>
      </div>
    </motion.div>
  );
};

export default GamingCoachResponse;
