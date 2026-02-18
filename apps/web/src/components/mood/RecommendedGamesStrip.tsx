import React from 'react';
import { useNavigate } from 'react-router-dom';

interface RecommendedGame {
  id: string;
  title: string;
  coverImage?: string;
  reason: string;
  moodAlignment: number;
  genreMatch: number;
}

interface RecommendedGamesStripProps {
  games: RecommendedGame[];
  loading?: boolean;
  onGameSelect?: (game: RecommendedGame) => void;
  onQuickPlay?: (game: RecommendedGame) => void;
}

export const RecommendedGamesStrip: React.FC<RecommendedGamesStripProps> = ({
  games,
  loading = false,
  onGameSelect,
  onQuickPlay
}) => {
  const navigate = useNavigate();

  const handleGameClick = (game: RecommendedGame) => {
    if (onGameSelect) {
      onGameSelect(game);
    } else {
      // Navigate to library with game selected
      navigate(`/library?game=${game.id}`);
    }
  };

  const handleQuickPlay = (e: React.MouseEvent, game: RecommendedGame) => {
    e.stopPropagation();
    if (onQuickPlay) {
      onQuickPlay(game);
    } else {
      // Navigate to library with game selected for now (game details page may not exist)
      navigate(`/library?game=${game.id}`);
    }
  };

  if (loading) {
    return (
      <div className="glass-morphism rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Recommended Games</h3>
        <div className="flex gap-4 overflow-x-auto">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex-shrink-0 w-32 h-40 bg-gray-700/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="glass-morphism rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Recommended Games</h3>
        <p className="text-gray-400 text-sm">No recommendations available</p>
      </div>
    );
  }

  return (
    <div className="glass-morphism rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Recommended Games</h3>
        <button 
          onClick={() => navigate('/library')}
          className="text-sm text-gaming-primary hover:text-gaming-accent transition-colors"
        >
          View All →
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {games.map((game) => (
          <div key={game.id} className="flex-shrink-0 w-40">
            <div 
              className="bg-gray-800/50 rounded-lg overflow-hidden border border-white/10 hover:border-gaming-primary/50 transition-all duration-200 cursor-pointer group"
              onClick={() => handleGameClick(game)}
            >
              {game.coverImage ? (
                <img 
                  src={game.coverImage} 
                  alt={game.title}
                  className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-24 bg-gradient-to-br from-gaming-primary/20 to-gaming-accent/20 flex items-center justify-center group-hover:from-gaming-primary/30 group-hover:to-gaming-accent/30 transition-all duration-200">
                  <span className="text-3xl">🎮</span>
                </div>
              )}
              <div className="p-3">
                <h4 className="text-sm font-medium text-white truncate group-hover:text-gaming-primary transition-colors">
                  {game.title}
                </h4>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{game.reason}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs px-2 py-1 bg-gaming-primary/20 rounded text-gaming-primary">
                    {Math.round(game.moodAlignment * 100)}%
                  </span>
                  <span className="text-xs px-2 py-1 bg-gaming-accent/20 rounded text-gaming-accent">
                    {Math.round(game.genreMatch * 100)}%
                  </span>
                </div>
                <button
                  onClick={(e) => handleQuickPlay(e, game)}
                  className="mt-2 w-full px-2 py-1 bg-gaming-primary text-white text-xs rounded hover:bg-gaming-accent transition-colors"
                >
                  Quick Play
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
