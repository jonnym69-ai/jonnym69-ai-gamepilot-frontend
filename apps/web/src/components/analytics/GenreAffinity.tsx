import React from 'react';

interface GenreAffinityProps {
  genreAffinity: Record<string, number>;
  mostPlayedMood: string;
  onGenreClick?: (genre: string, affinity: number) => void;
}

export const GenreAffinity: React.FC<GenreAffinityProps> = ({
  genreAffinity,
  mostPlayedMood,
  onGenreClick
}) => {
  return (
    <div className="glass-morphism rounded-xl p-6 border border-white/10 hover:shadow-cinematic transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-32 h-32 bg-gaming-secondary/5 blur-[60px] rounded-full" />
      <h3 className="text-xl font-gaming font-semibold text-white mb-8 flex items-center gap-3 uppercase tracking-tight relative z-10">
        Genre Affinity
        <span className="h-[1px] w-12 bg-white/20" />
        <span className="text-[10px] text-white/40 font-sans tracking-widest uppercase">Preference Mapping</span>
      </h3>
      <div className="space-y-4">
        {Object.entries(genreAffinity)
          .sort(([,a], [,b]) => b - a)
          .map(([genre, affinity], index) => (
            <div 
              key={genre} 
              className="flex items-center gap-4 group cursor-pointer hover:bg-white/5 rounded-lg p-2 transition-all duration-200"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => onGenreClick?.(genre, affinity)}
              title={`You play this most when you're ${mostPlayedMood}`}
            >
              <div className="w-24">
                <span className="text-white capitalize group-hover:text-gaming-primary transition-colors duration-200">{genre}</span>
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-700 rounded-full h-4 relative overflow-hidden">
                  <div
                    className="h-4 rounded-full bg-gradient-to-r from-gaming-primary to-gaming-accent transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${affinity * 100}%`,
                      animationDelay: `${index * 150}ms`
                    }}
                  />
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-white font-medium group-hover:scale-105 transition-transform duration-200 inline-block">{Math.round(affinity * 100)}%</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
