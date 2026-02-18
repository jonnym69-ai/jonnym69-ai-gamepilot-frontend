import React from 'react';
import { useLibraryPersona } from '../../hooks/persona';
import { useMoodRecommendations } from '../../hooks/useMoodRecommendations';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { SummaryCard } from './SummaryCard';
import { MoodDistribution } from './MoodDistribution';
import { GenreAffinity } from './GenreAffinity';
import { PersonalInsights } from './PersonalInsights';

interface MoodAnalyticsData {
  moodTrends: {
    date: string;
    mood: string;
    confidence: number;
    sessionLength: number;
  }[];
  gamingPatterns: {
    totalPlaytime: number;
    averageSessionLength: number;
    mostPlayedMood: string;
    moodDistribution: Record<string, number>;
  };
  recommendationMetrics: {
    totalRecommendations: number;
    acceptedRecommendations: number;
    successRate: number;
    topRecommendedMoods: string[];
  };
  userInsights: {
    bestGamingTime: string;
    preferredSessionLength: number;
    moodStability: number;
    genreAffinity: Record<string, number>;
  };
}

interface MoodAnalyticsPageProps {
  analyticsData: MoodAnalyticsData;
  getMoodEmoji: (mood: string) => string;
  getMoodColor: (mood: string) => string;
  AnimatedNumber: React.FC<{ value: number; suffix?: string; duration?: number }>;
  onCardClick?: (cardType: string, data: any) => void;
  onMoodClick?: (mood: string, count: number, percentage: number) => void;
  onGenreClick?: (genre: string, affinity: number) => void;
  onInsightClick?: (type: 'time' | 'session' | 'moods') => void;
}

export const MoodAnalyticsPage: React.FC<MoodAnalyticsPageProps> = ({
  analyticsData,
  getMoodEmoji,
  getMoodColor,
  AnimatedNumber,
  onCardClick,
  onMoodClick,
  onGenreClick,
  onInsightClick
}) => {
  // Get persona data for enhanced analytics
  const persona = useLibraryPersona();
  const { games } = useLibraryStore();
  const { primaryMoodInfo, hasRecommendations } = useMoodRecommendations({ games });
  
  return (
    <div className="space-y-8">
      {/* Persona Insights Card */}
      {persona && (
        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <SummaryCard
            title="Gaming Persona"
            icon="🎮"
            value={persona.traits?.archetypeId || 'Unknown'}
            subtitle={`${persona.traits?.intensity} intensity • ${Math.round((persona.confidence || 0) * 100)}% confidence`}
            progress={(persona.confidence || 0) * 100}
            progressColor="from-purple-500 to-pink-500"
            onClick={() => onCardClick?.('persona', persona)}
          >
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="text-center">
                <div className="text-gray-400">Pacing</div>
                <div className="text-white font-medium">{persona.traits?.pacing}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Social</div>
                <div className="text-white font-medium">{persona.traits?.socialStyle}</div>
              </div>
            </div>
          </SummaryCard>
        </div>
      )}
      
      {/* Current Mood Status */}
      {hasRecommendations && primaryMoodInfo && (
        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <SummaryCard
            title="Current Mood"
            icon={primaryMoodInfo.emoji}
            value={primaryMoodInfo.name}
            subtitle="Active mood state"
            progress={75}
            progressColor={primaryMoodInfo.color?.replace('from-', 'from-').replace(' to-', ' to-') || 'from-blue-500 to-cyan-500'}
            onClick={() => onCardClick?.('currentMood', primaryMoodInfo)}
          />
        </div>
      )}
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
        <SummaryCard
          title="Total Playtime"
          icon="⏱️"
          value={<AnimatedNumber value={Math.round(analyticsData.gamingPatterns.totalPlaytime)} suffix="h" />}
          subtitle={<><AnimatedNumber value={Math.round(analyticsData.gamingPatterns.averageSessionLength)} suffix="min" /> avg session</>}
          progress={Math.min((analyticsData.gamingPatterns.totalPlaytime / 100) * 100, 100)}
          onClick={() => onCardClick?.('totalPlaytime', analyticsData.gamingPatterns)}
        />

        <SummaryCard
          title="Favorite Mood"
          icon={getMoodEmoji(analyticsData.gamingPatterns.mostPlayedMood)}
          value={analyticsData.gamingPatterns.mostPlayedMood}
          subtitle={<><AnimatedNumber value={analyticsData.gamingPatterns.moodDistribution[analyticsData.gamingPatterns.mostPlayedMood]} /> sessions</>}
          onClick={() => onCardClick?.('favoriteMood', analyticsData.gamingPatterns)}
        >
          {/* Circular indicator */}
          <div className="mt-4 relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 bg-gray-700/50 rounded-full"></div>
            <div 
              className={`absolute inset-0 ${getMoodColor(analyticsData.gamingPatterns.mostPlayedMood)} rounded-full transition-all duration-500`}
              style={{ 
                clipPath: `polygon(50% 50%, 50% 0%, ${50 + (analyticsData.gamingPatterns.moodDistribution[analyticsData.gamingPatterns.mostPlayedMood] / analyticsData.moodTrends.length) * 100}% 0%, 50% 50%)` 
              }}
            ></div>
          </div>
        </SummaryCard>

        <SummaryCard
          title="Recommendation Success"
          icon="🎯"
          value={<AnimatedNumber value={analyticsData.recommendationMetrics.successRate} suffix="%" />}
          subtitle={<><AnimatedNumber value={analyticsData.recommendationMetrics.acceptedRecommendations} /> of <AnimatedNumber value={analyticsData.recommendationMetrics.totalRecommendations} /> accepted</>}
          progress={analyticsData.recommendationMetrics.successRate}
          progressColor="from-green-500 to-emerald-500"
          onClick={() => onCardClick?.('recommendationSuccess', analyticsData.recommendationMetrics)}
        />

        <SummaryCard
          title="Mood Stability"
          icon="📊"
          value={<AnimatedNumber value={Math.round(analyticsData.userInsights.moodStability * 100)} suffix="%" />}
          subtitle="Consistent mood patterns"
          progress={analyticsData.userInsights.moodStability * 100}
          progressColor="from-blue-500 to-purple-500"
          onClick={() => onCardClick?.('moodStability', analyticsData.userInsights)}
        >
          {/* Stability indicator */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 bg-gray-700/50 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: `${analyticsData.userInsights.moodStability * 100}%` }}
              />
            </div>
            <div className={`w-2 h-2 rounded-full ${analyticsData.userInsights.moodStability > 0.7 ? 'bg-green-500' : analyticsData.userInsights.moodStability > 0.4 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
          </div>
        </SummaryCard>
      </div>

      {/* Mood Distribution and Genre Affinity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
        <MoodDistribution
          moodDistribution={analyticsData.gamingPatterns.moodDistribution}
          totalTrends={analyticsData.moodTrends.length}
          getMoodEmoji={getMoodEmoji}
          getMoodColor={getMoodColor}
          onMoodClick={onMoodClick}
        />
        <GenreAffinity
          genreAffinity={analyticsData.userInsights.genreAffinity}
          mostPlayedMood={analyticsData.gamingPatterns.mostPlayedMood}
          onGenreClick={onGenreClick}
        />
      </div>

      {/* Personal Insights */}
      <div className="animate-fade-in-up" style={{ animationDelay: '1.0s' }}>
        <PersonalInsights
          bestGamingTime={analyticsData.userInsights.bestGamingTime}
          preferredSessionLength={analyticsData.userInsights.preferredSessionLength}
          topRecommendedMoods={analyticsData.recommendationMetrics.topRecommendedMoods}
          getMoodEmoji={getMoodEmoji}
          onInsightClick={onInsightClick}
        />
      </div>
    </div>
  );
};
