/**
 * Fixed WhatToPlayNow Component
 * 
 * Uses the new unified canonical recommendation system
 */

import React, { useState, useEffect } from 'react';
import { useLibraryStore } from '../stores/useLibraryStore';
import { calculateGameRecommendations } from '../utils/recommendationEngine';
import { getMoodOptions } from '../utils/libraryAnalyzer';
import { MoodId } from '@gamepilot/static-data';
import { detectTimeOfDay } from '../utils/contextualEngine';

interface WhatToPlayNowProps {
  onClose?: () => void;
  className?: string;
}

interface GameRecommendation {
  game: any;
  score: number;
  reasoning: string;
}

export const WhatToPlayNowFixed: React.FC<WhatToPlayNowProps> = ({ 
  onClose, 
  className = '' 
}) => {
  const { games } = useLibraryStore();
  const [recommendations, setRecommendations] = useState<GameRecommendation[]>([]);
  const [selectedMood, setSelectedMood] = useState<MoodId>('chill');
  const [timeAvailable, setTimeAvailable] = useState<string>('60');
  const [preferredGenre, setPreferredGenre] = useState<string>('all-genres');
  const [isLoading, setIsLoading] = useState(false);

  // Get canonical mood options
  const moodOptions = getMoodOptions(games);

  useEffect(() => {
    if (games.length > 0) {
      setIsLoading(true);
      
      // Use the new unified recommendation engine
      const gameRecommendations = calculateGameRecommendations({
        mood: selectedMood,
        timeAvailable: timeAvailable,
        preferredGenre: preferredGenre,
        games: games
      });

      // Transform to expected format
      const transformedRecommendations = gameRecommendations.map(rec => ({
        game: rec.game,
        score: rec.score,
        reasoning: rec.reasoning
      }));

      setRecommendations(transformedRecommendations);
      setIsLoading(false);
    }
  }, [games, selectedMood, timeAvailable, preferredGenre]);

  const handleMoodSelect = (mood: MoodId) => {
    setSelectedMood(mood);
  };

  const handleTimeSelect = (time: string) => {
    setTimeAvailable(time);
  };

  const handleGenreSelect = (genre: string) => {
    setPreferredGenre(genre);
  };

  const handleGameSelect = (game: any) => {
    // Track selection
    console.log(`Selected game: ${game.title}`);
    if (onClose) {
      onClose();
    }
  };

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Finding perfect games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">What Should I Play Now?</h2>
        
        {/* Mood Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Current Mood</label>
          <div className="grid grid-cols-4 gap-2">
            {moodOptions.map(mood => (
              <button
                key={mood.value}
                onClick={() => handleMoodSelect(mood.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedMood === mood.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{mood.icon}</div>
                <div className="text-sm font-medium">{mood.label}</div>
                <div className="text-xs text-gray-500">({mood.count})</div>
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Time Available</label>
          <select
            value={timeAvailable}
            onChange={(e) => handleTimeSelect(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
            <option value="180">3 hours</option>
            <option value="180+">3+ hours</option>
          </select>
        </div>

        {/* Genre Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Preferred Genre</label>
          <select
            value={preferredGenre}
            onChange={(e) => handleGenreSelect(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="all-genres">All Genres</option>
            <option value="action">Action</option>
            <option value="adventure">Adventure</option>
            <option value="casual">Casual</option>
            <option value="fps">FPS</option>
            <option value="horror">Horror</option>
            <option value="indie">Indie</option>
            <option value="moba">MOBA</option>
            <option value="multiplayer">Multiplayer</option>
            <option value="platformer">Platformer</option>
            <option value="puzzle">Puzzle</option>
            <option value="rpg">RPG</option>
            <option value="racing">Racing</option>
            <option value="roguelike">Roguelike</option>
            <option value="simulation">Simulation</option>
            <option value="sports">Sports</option>
            <option value="strategy">Strategy</option>
          </select>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-3">Recommended Games</h3>
          {recommendations.map((rec, index) => (
            <div
              key={rec.game.id || index}
              onClick={() => handleGameSelect(rec.game)}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
            >
              <div className="flex items-start space-x-4">
                <img
                  src={rec.game.coverImage || rec.game.cover}
                  alt={rec.game.title}
                  className="w-16 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{rec.game.title}</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {rec.game.genres?.slice(0, 3).map((genre: string) => (
                      <span
                        key={genre}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <div className="font-medium">Why this game:</div>
                    <div>{rec.reasoning}</div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Match Score: {Math.round(rec.score)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {recommendations.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <div className="text-gray-500">No games found matching your criteria.</div>
          <div className="text-sm text-gray-400 mt-2">
            Try adjusting your mood, time, or genre preferences.
          </div>
        </div>
      )}
    </div>
  );
};
