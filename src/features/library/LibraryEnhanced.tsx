import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { MASTER_MOODS } from '../../constants/masterMoods';
import {
  GameSearch,
  AddGameModal,
  SteamImportModal,
  GameDetailsModal,
  GameCard
} from './components';
import type { Game } from '@gamepilot/types';
import { normalizeGamesArray } from '../../utils/dataPipelineNormalizer';
import { recommendationService } from '../../services/recommendationService';
import { clearMoodCache } from '../../utils/smartMoodAssigner';
import { GameGridSkeleton, LibraryHeaderSkeleton } from '../../components/skeletons/SkeletonLoaders';

// Master Mood Dictionary: Broadens the net for better filtering
const MASTER_MOOD_MAP: Record<string, string[]> = {
  'adrenaline': ['intense', 'competitive', 'high-energy', 'action-packed'],
  'brain-power': ['strategic', 'puzzle', 'thinking', 'tactical'],
  'zen': ['relaxing', 'cozy', 'atmospheric', 'wholesome'],
  'story': ['narrative', 'story-rich', 'immersive', 'adventure'],
  'social': ['multiplayer', 'cooperative', 'party', 'team-based'],
  'creative': ['building', 'crafting', 'sandbox', 'artistic'],
  'nostalgic': ['retro', 'classic', 'remastered', 'throwback'],
  'scary': ['horror', 'scary', 'terrifying']
};

export const Library: React.FC = () => {
  const { games, actions, intelligence, setIntelligenceState } = useLibraryStore();

  // Loading state for games
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  
  // Load library when user is authenticated
  useEffect(() => {
    // Load games for development (with or without authentication)
    console.log('🎮 Loading library...')
    actions.loadGames()
  }, [actions])

  // Set loading to false when games are loaded
  useEffect(() => {
    if (games !== null) { // games can be empty array, so check for null
      setIsLoadingGames(false)
    }
  }, [games])

  // Clear mood cache on component mount to ensure fresh mood assignments
  useEffect(() => {
    console.log('🧹 Library component mounted - clearing mood cache...');
    clearMoodCache();
    // Force complete re-evaluation by clearing all mood assignments in games
    if (games && games.length > 0) {
      console.log('🔄 Forcing re-evaluation of all game moods...');
      games.forEach((game: any) => {
        if (game.moods && Array.isArray(game.moods)) {
          // Clear cached moods from game objects
          delete game.moods;
        }
      });
    }
  }, [games]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [showBulkOperations, setShowBulkOperations] = useState(false);
  const [isAddGameModalOpen, setIsAddGameModalOpen] = useState(false);
  const [isSteamImportModalOpen, setIsSteamImportModalOpen] = useState(false);

  // 1. Normalize Data
  const normalizedGames = useMemo(() => {
    console.log('🔍 DEBUG: Raw games count:', games?.length || 0);
    const normalized = games?.length ? normalizeGamesArray(games) : [];
    console.log('🔍 DEBUG: Normalized games count:', normalized.length);
    
    // Test if smart mood assigner is working
    if (normalized.length > 0) {
      console.log('🔍 DEBUG: Testing mood assignment on first game...');
      const firstGame = normalized[0];
      console.log('🔍 DEBUG: First game before mood assignment:', {
        title: firstGame.title,
        currentMoods: firstGame.moods,
        genres: firstGame.genres
      });
    }
    
    return normalized;
  }, [games]);

  // 2. Filter & Sort Engine
  const processedGames = useMemo(() => {
    let result = [...normalizedGames];

    // MOOD DISTRIBUTION ANALYSIS
    console.log('📊 MOOD DISTRIBUTION ANALYSIS:');
    const moodCounts: Record<string, number> = {};
    const genreCounts: Record<string, number> = {};
    
    result.forEach((game: any) => {
      // Count moods
      const gameMoods = Array.isArray(game.moods) ? game.moods : [];
      gameMoods.forEach((mood: string) => {
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      });
      
      // Count genres
      const gameGenres = Array.isArray(game.genres) ? game.genres.map((g: any) => g.name || g) : [];
      gameGenres.forEach((genre: string) => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    });
    
    console.log('🎭 Mood Distribution:', moodCounts);
    console.log('🎮 Genre Distribution:', genreCounts);
    console.log('📈 Total Games:', result.length);

    // Search filter
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter((game: any) => 
        game.title?.toLowerCase().includes(term)
      );
    }

    // Master Mood filter logic
    if (intelligence.selectedMasterMood) {
      console.log(`🔍 DEBUG: Filtering for ${intelligence.selectedMasterMood}`);
      console.log(`🔍 DEBUG: Allowed sub-moods:`, MASTER_MOOD_MAP[intelligence.selectedMasterMood]);
      
      result = result.filter((game: any) => {
        const gameMoods = Array.isArray(game.moods) ? game.moods : [];
        const selectedLower = String(intelligence.selectedMasterMood).toLowerCase();
        const mappedSubMoods = (MASTER_MOOD_MAP[intelligence.selectedMasterMood] || []).map(m => String(m).toLowerCase());
        const allowedSubMoods = [selectedLower, ...mappedSubMoods];
        const hasMatch = gameMoods.some((m: string) => allowedSubMoods.includes(String(m).toLowerCase()));
        
        if (intelligence.selectedMasterMood === 'social' || intelligence.selectedMasterMood === 'creative' || intelligence.selectedMasterMood === 'nostalgic') {
          console.log(`🔍 DEBUG: Game "${game.title}" - Moods: [${gameMoods.join(', ')}] - Match: ${hasMatch}`);
        }
        
        return hasMatch;
      });
      
      console.log(`🔍 DEBUG: Filtered from ${normalizedGames.length} to ${result.length} games for ${intelligence.selectedMasterMood}`);
    }

    // Sorting logic
    result.sort((a: any, b: any) => {
      switch (intelligence.selectedSorting) {
        case 'rating': return (b.globalRating || 0) - (a.globalRating || 0);
        case 'playtime': return (b.hoursPlayed || 0) - (a.hoursPlayed || 0);
        case 'title':
        default: return (a.title || '').localeCompare(b.title || '');
      }
    });

    return result;
  }, [normalizedGames, searchTerm, intelligence.selectedMasterMood, intelligence.selectedSorting]);

  const handleGameSelectToggle = (gameId: string) => {
    setSelectedGames(prev => prev.includes(gameId) ? prev.filter(id => id !== gameId) : [...prev, gameId]);
  };

  return (
    <div className="min-h-screen bg-gaming-dark text-white">
      <div className="container mx-auto px-6 py-12">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <motion.h1 
              className="text-5xl font-gaming font-bold bg-gradient-to-r from-gaming-primary to-gaming-accent bg-clip-text text-transparent mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              Your Library
            </motion.h1>
            <p className="text-gray-400 text-lg max-w-xl">Managed collection with normalized intelligence.</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setIsSteamImportModalOpen(true)} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex items-center gap-3">
              <span>🔗</span> Import Steam
            </button>
            <button onClick={() => setIsAddGameModalOpen(true)} className="px-6 py-3 bg-gaming-primary text-white rounded-xl shadow-lg font-bold">
              + Add Game
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-3 space-y-8">
            <div className="gaming-card rounded-2xl p-6 border border-white/5 sticky top-24 bg-gray-900/50 backdrop-blur-md">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="text-gaming-primary text-lg">🧠</span> Intelligence
              </h3>
              
              {/* Master Mood Filters */}
              <div className="space-y-4 mb-8">
                <label className="text-xs font-bold text-gray-400 uppercase">Mood</label>
                <div className="grid grid-cols-2 gap-2">
                  {MASTER_MOODS.map((mood) => (
                    <button
                      key={mood.id}
                      onClick={() => setIntelligenceState({ 
                        ...intelligence, 
                        selectedMasterMood: intelligence.selectedMasterMood === mood.id ? '' : mood.id 
                      })}
                      className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase transition-all border ${
                        intelligence.selectedMasterMood === mood.id 
                          ? 'bg-gaming-primary/20 border-gaming-primary text-gaming-primary' 
                          : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-4xl mb-2">{mood.emoji}</span>
                      <span className="text-[10px] font-black uppercase tracking-tighter">{mood.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setIntelligenceState({ 
                  selectedMasterMood: '', 
                  selectedSorting: 'title' 
                })}
                className="w-full py-3 text-xs font-bold text-gray-500 hover:text-white transition-colors"
              >
                Reset Filters
              </button>
              
              <button
                onClick={() => {
                  clearMoodCache();
                  window.location.reload();
                }}
                className="w-full mt-2 py-3 text-xs font-bold text-gaming-primary hover:text-white transition-colors border border-gaming-primary/20 rounded"
              >
                🧹 Clear Mood Cache
              </button>
            </div>
          </aside>

          {/* Main Grid Area */}
          <main className="lg:col-span-9 space-y-6">
            <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="relative w-full md:w-96">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
                  <input
                    type="text"
                    placeholder="Search collection..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-900 rounded-xl border border-white/10 focus:ring-2 focus:ring-gaming-primary/50 outline-none"
                  />
                </div>
                
                <select
                  value={intelligence.selectedSorting}
                  onChange={(e) => setIntelligenceState({ ...intelligence, selectedSorting: e.target.value })}
                  className="bg-gray-900 text-sm font-bold text-gray-300 border border-white/10 rounded-lg px-4 py-3 outline-none"
                  title="Sort games by"
                >
                  <option value="title">Alphabetical</option>
                  <option value="rating">Top Rated</option>
                  <option value="playtime">Most Played</option>
                </select>
              </div>
            </div>

            {/* Game List Grid */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 min-h-[500px]">
              {isLoadingGames ? (
                <GameGridSkeleton count={12} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {processedGames.map((game, index) => (
                    <GameCard
                      key={`${game.id || game.title}-${index}`}
                      game={game}
                      onSelect={() => handleGameSelectToggle(game.id)}
                      onLaunch={(game) => {
                        if (game.appId) {
                          actions.launchGame(game.appId.toString())
                        } else {
                          console.warn('No appId found for game:', game.title)
                        }
                      }}
                    />
                  ))}
                </div>
              )}

              {!isLoadingGames && processedGames.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <span className="text-4xl mb-4">🎮</span>
                  <p>No games match these criteria.</p>
                </div>
              )}
            </div>
          </main>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {isAddGameModalOpen && (
            <AddGameModal isOpen={isAddGameModalOpen} onClose={() => setIsAddGameModalOpen(false)} onAddGame={(newGame: any) => {
              actions.setGames([...games, { ...newGame, id: crypto.randomUUID() }]);
              setIsAddGameModalOpen(false);
            }} />
          )}
          {isSteamImportModalOpen && (
            <SteamImportModal isOpen={isSteamImportModalOpen} onClose={() => setIsSteamImportModalOpen(false)} onImportGames={(imported: any[]) => {
              actions.setGames([...games, ...imported]);
              setIsSteamImportModalOpen(false);
            }} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Library;
