import React from 'react';

interface PersonalInsightsProps {
  bestGamingTime: string;
  preferredSessionLength: number;
  topRecommendedMoods: string[];
  getMoodEmoji: (mood: string) => string;
  onInsightClick?: (type: 'time' | 'session' | 'moods') => void;
}

export const PersonalInsights: React.FC<PersonalInsightsProps> = ({
  bestGamingTime,
  preferredSessionLength,
  topRecommendedMoods,
  getMoodEmoji,
  onInsightClick
}) => {
  return (
    <div className="glass-morphism-dark rounded-xl p-8 border border-white/5 shadow-cinematic relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gaming-primary/5 via-transparent to-transparent pointer-events-none" />
      <h3 className="text-xl font-gaming font-semibold text-white mb-8 uppercase tracking-widest flex items-center gap-3">
        Personal Insights
        <span className="flex-1 h-[1px] bg-white/10" />
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
        <div 
          className="group cursor-pointer transition-all duration-300 p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10"
          onClick={() => onInsightClick?.('time')}
        >
          <h4 className="text-gaming-primary font-gaming text-xs uppercase tracking-widest mb-3 opacity-80 group-hover:opacity-100 transition-opacity">Optimal Window</h4>
          <p className="text-2xl font-bold text-white capitalize mb-1 group-hover:text-gaming-secondary transition-colors">{bestGamingTime}</p>
          <p className="text-white/40 text-sm leading-relaxed">Performance peaks during these hours.</p>
          <div className="mt-2 text-xs text-gaming-accent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Tap for deeper insight
          </div>
        </div>
        <div 
          className="group cursor-pointer hover:transform hover:-translate-y-1 transition-all duration-300"
          onClick={() => onInsightClick?.('session')}
        >
          <h4 className="text-gaming-primary font-medium mb-2">Preferred Session Length</h4>
          <p className="text-white">{preferredSessionLength} minutes</p>
          <p className="text-gray-400 text-sm">Your optimal gaming session duration</p>
          <div className="mt-2 text-xs text-gaming-accent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Tap for deeper insight
          </div>
        </div>
        <div 
          className="group cursor-pointer hover:transform hover:-translate-y-1 transition-all duration-300"
          onClick={() => onInsightClick?.('moods')}
        >
          <h4 className="text-gaming-primary font-medium mb-2">Top Recommendation Moods</h4>
          <div className="flex gap-2">
            {topRecommendedMoods.map((mood) => (
              <span key={mood} className="px-3 py-1 bg-gaming-primary/20 text-gaming-primary rounded-full text-sm capitalize">
                {getMoodEmoji(mood)} {mood}
              </span>
            ))}
          </div>
          <p className="text-gray-400 text-sm mt-2">Moods that work best for you</p>
          <div className="mt-2 text-xs text-gaming-accent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Tap for deeper insight
          </div>
        </div>
      </div>
    </div>
  );
};
