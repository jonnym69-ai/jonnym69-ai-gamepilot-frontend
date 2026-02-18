import React from 'react';

interface MoodDistributionProps {
  moodDistribution: Record<string, number>;
  totalTrends: number;
  getMoodEmoji: (mood: string) => string;
  getMoodColor: (mood: string) => string;
  onMoodClick?: (mood: string, count: number, percentage: number) => void;
}

export const MoodDistribution: React.FC<MoodDistributionProps> = ({
  moodDistribution,
  totalTrends,
  getMoodEmoji,
  getMoodColor,
  onMoodClick
}) => {
  // Calculate total count from the distribution itself to ensure percentages are correct (max 100%)
  const totalCount = Object.values(moodDistribution).reduce((sum, count) => sum + count, 0) || 1;

  return (
    <div className="glass-morphism rounded-xl p-6 border border-white/10 hover:shadow-cinematic transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gaming-primary/5 blur-[60px] rounded-full" />
      <h3 className="text-xl font-gaming font-semibold text-white mb-8 flex items-center gap-3 uppercase tracking-tight relative z-10">
        Mood Distribution
        <span className="h-[1px] w-12 bg-white/20" />
        <span className="text-[10px] text-white/40 font-sans tracking-widest uppercase">Emotional Analysis</span>
      </h3>
      <div className="space-y-4">
        {Object.entries(moodDistribution)
          .sort(([,a], [,b]) => b - a)
          .map(([mood, count], index) => {
            const percentage = (count / totalCount) * 100;
            return (
              <div 
                key={mood} 
                className="flex items-center gap-4 group cursor-pointer hover:bg-white/5 rounded-lg p-2 transition-all duration-200"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => onMoodClick?.(mood, count, percentage)}
              >
                <div className="flex items-center gap-2 w-24">
                  <span className="text-xl group-hover:scale-110 transition-transform duration-200">{getMoodEmoji(mood)}</span>
                  <span className="text-white capitalize group-hover:text-gaming-primary transition-colors duration-200">{mood}</span>
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-700 rounded-full h-4 relative overflow-hidden">
                    <div
                      className={`h-4 rounded-full ${getMoodColor(mood)} transition-all duration-1000 ease-out`}
                      style={{ 
                        width: `${percentage}%`,
                        animationDelay: `${index * 150}ms`
                      }}
                    />
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-white font-medium group-hover:scale-105 transition-transform duration-200 inline-block">{count}</span>
                  <span className="text-gray-400 text-sm ml-2">({Math.round(percentage)}%)</span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
