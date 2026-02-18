import React from 'react';
import { useNavigate } from 'react-router-dom';

interface MoodForecastCardProps {
  predictedMood: string;
  confidence: number;
  trend: 'rising' | 'stable' | 'declining';
  reasoning?: string;
  onMoodClick?: (mood: string) => void;
}

export const MoodForecastCard: React.FC<MoodForecastCardProps> = ({
  predictedMood = 'neutral',
  confidence = 0.5,
  trend = 'stable',
  reasoning = '',
  onMoodClick
}) => {
  // Defensive checks first
  if (!predictedMood) {
    return null;
  }

  const navigate = useNavigate();

  const getTrendIcon = () => {
    switch (trend) {
      case 'rising': return '📈';
      case 'stable': return '➡️';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  const getConfidenceColor = () => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const handleMoodClick = () => {
    if (onMoodClick && predictedMood) {
      onMoodClick(predictedMood);
    } else if (predictedMood) {
      // Navigate to library with mood filter
      navigate(`/library?mood=${predictedMood}`);
    }
  };

  return (
    <div className="glass-morphism rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Mood Forecast</h3>
        <span className="text-2xl">{getTrendIcon()}</span>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={handleMoodClick}
            className="text-2xl font-bold text-white capitalize hover:text-gaming-primary transition-colors cursor-pointer group"
            title={`Filter library by ${predictedMood} mood`}
          >
            {predictedMood}
            <span className="ml-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              🔍
            </span>
          </button>
          <div className="text-right">
            <div className={`text-sm font-medium ${getConfidenceColor()}`}>
              {Math.round(confidence * 100)}%
            </div>
            <div className="text-xs text-gray-400">confidence</div>
          </div>
        </div>
        
        {reasoning && (
          <div className="pt-3 border-t border-white/10">
            <p className="text-sm text-gray-300">{reasoning}</p>
          </div>
        )}

        <div className="pt-3 border-t border-white/10">
          <button
            onClick={handleMoodClick}
            className="w-full px-3 py-2 bg-gaming-primary/20 text-gaming-primary rounded-lg hover:bg-gaming-primary/30 transition-colors text-sm font-medium"
          >
            View {predictedMood || 'Neutral'} Games →
          </button>
        </div>
      </div>
    </div>
  );
};
