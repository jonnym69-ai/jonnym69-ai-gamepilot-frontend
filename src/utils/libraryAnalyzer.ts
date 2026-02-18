import { MoodId } from '@gamepilot/static-data';
import { filterByGenre } from '../stores/useLibraryStore';
import { normalizeMood, normalizeGenre, CANONICAL_MOODS, CANONICAL_GENRES } from './dataPipelineNormalizer';
import { MASTER_MOODS } from '../constants/masterMoods';

export interface LibraryAnalysis {
  availableMoods: MoodId[];
  availableGenres: string[];
  timeOptions: Array<{
    value: string;
    label: string;
    icon: string;
    count: number;
    sessionMood: string;
    description: string;
    energyLevel: string;
    genreTags: string[];
    emotionalTags: string[];
  }>;
  genreDistribution: Record<string, number>;
  moodDistribution: Record<MoodId, number>;
}

// Time bucket definitions as play-session moods
export const TIME_MAPPINGS = {
  '15': {
    sessionMood: 'micro-burst',
    label: '15 minutes',
    icon: '⚡',
    description: 'Quick dopamine hits, instant fun',
    energyLevel: 'high-energy',
    genreTags: ['roguelite', 'arcade', 'shooter', 'puzzle', 'platformer', 'racing'],
    emotionalTags: ['energetic', 'chaotic', 'quick-win', 'low-friction']
  },
  '30': {
    sessionMood: 'warm-up session',
    label: '30 minutes',
    icon: '🔥',
    description: 'Enough time to get into flow, not deep narrative',
    energyLevel: 'medium-high',
    genreTags: ['action', 'adventure', 'indie', 'racing', 'survival'],
    emotionalTags: ['focused', 'light-commitment', 'satisfying-progress']
  },
  '60': {
    sessionMood: 'proper session',
    label: '1 hour',
    icon: '🎯',
    description: 'The sweet spot for most players',
    energyLevel: 'balanced',
    genreTags: ['rpg', 'story', 'tactical', 'strategy', 'co-op'],
    emotionalTags: ['immersive', 'narrative', 'strategic', 'medium-commitment']
  },
  '120': {
    sessionMood: 'deep dive',
    label: '2 hours',
    icon: '🌊',
    description: 'Time to get lost in game world',
    energyLevel: 'deep-focus',
    genreTags: ['open-world', 'rpg', 'base-building', 'management', 'souls-like'],
    emotionalTags: ['immersive', 'thoughtful', 'long-form-progression', 'high-focus']
  },
  '180+': {
    sessionMood: 'full immersion',
    label: '3+ hours',
    icon: '🌙',
    description: 'Settling in for the long haul',
    energyLevel: 'deep-immersion',
    genreTags: ['massive-rpg', 'open-world', 'grand-strategy', 'survival-crafting', 'high-cognitive-load'],
    emotionalTags: ['committed', 'absorbed', 'high-focus', 'escapist']
  }
};

/**
 * Analyzes the user's library to extract dynamic options for recommendations
 */
export function analyzeLibrary(games: any[]): LibraryAnalysis {
  if (!games || games.length === 0) {
    return {
      availableMoods: [],
      availableGenres: [],
      timeOptions: [],
      genreDistribution: {},
      moodDistribution: {}
    };
  }

  // Extract all unique moods from library
  const allMoods = new Set<MoodId>();
  const moodCounts: Record<MoodId, number> = {} as any;
  
  // Extract all unique genres from library
  const allGenres = new Set<string>();
  const genreCounts: Record<string, number> = {};
  
  // Calculate session times for time options
  const sessionTimes: number[] = [];

  games.forEach(game => {
    // Extract moods with normalization
    const gameMoods = Array.isArray((game as any).moods) ? (game as any).moods.map(normalizeMood) : [];
    gameMoods.forEach((mood: MoodId) => {
      allMoods.add(mood);
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });

    // Enhanced genre extraction with fallback detection
    const gameGenres = Array.isArray((game as any).genres) 
      ? (game as any).genres.map((g: any) => typeof g === 'string' ? normalizeGenre(g) : normalizeGenre(g.name || g.id)).filter(Boolean)
      : (game as any).genre ? [normalizeGenre((game as any).genre)]
      : (game as any).tags ? (game as any).tags.filter((tag: any) => {
          // Filter out mood tags and keep genre-like tags
          if (typeof tag === 'string') {
            const lowerTag = tag.toLowerCase();
            const moodTags = ['chill', 'competitive', 'creative', 'energetic', 'story', 'social', 'focused', 'exploratory'];
            const genreKeywords = ['action', 'adventure', 'rpg', 'strategy', 'simulation', 'sports', 'racing', 'indie', 'puzzle', 'platformer', 'shooter', 'horror', 'roguelike', 'moba', 'casual'];
            return !moodTags.includes(lowerTag) && genreKeywords.some(keyword => lowerTag.includes(keyword));
          }
          if (typeof tag === 'object' && tag.name) {
            const lowerTag = tag.name.toLowerCase();
            const moodTags = ['chill', 'competitive', 'creative', 'energetic', 'story', 'social', 'focused', 'exploratory'];
            const genreKeywords = ['action', 'adventure', 'rpg', 'strategy', 'simulation', 'sports', 'racing', 'indie', 'puzzle', 'platformer', 'shooter', 'horror', 'roguelike', 'moba', 'casual'];
            return !moodTags.includes(lowerTag) && genreKeywords.some(keyword => lowerTag.includes(keyword));
          }
          return false;
        }).map((tag: any) => typeof tag === 'string' ? normalizeGenre(tag) : normalizeGenre(tag.name)).filter(Boolean)
      : [];
    
    // If no genres found, try to detect from title and description
    if (gameGenres.length === 0) {
      const title = (game as any).title?.toLowerCase() || '';
      const description = (game as any).description?.toLowerCase() || '';
      
      // Genre detection from title keywords
      const titleGenreKeywords: Record<string, string[]> = {
        'rpg': ['rpg', 'role', 'fantasy', 'dragon', 'quest', 'dungeon', 'magic', 'wizard', 'final'],
        'action': ['shoot', 'kill', 'war', 'battle', 'combat', 'fight', 'strike', 'call', 'duty', 'assassin', 'hitman'],
        'adventure': ['tomb', 'raider', 'uncharted', 'journey', 'explor', 'island', 'legend', 'zelda'],
        'strategy': ['command', 'empire', 'civilization', 'total', 'war', 'age', 'starcraft', 'company'],
        'simulation': ['sim', 'tycoon', 'city', 'builder', 'manager', 'railroad', 'zoo', 'hospital', 'theme'],
        'sports': ['football', 'soccer', 'nba', 'fifa', 'madden', 'nfl', 'basketball', 'racing', 'drive', 'need', 'speed'],
        'puzzle': ['puzzle', 'match', 'candy', 'saga', 'tetris', 'sudoku', 'crossword', 'word'],
        'horror': ['dead', 'resident', 'evil', 'silent', 'hill', 'outlast', 'fear', 'scary', 'dark'],
        'racing': ['racing', 'drive', 'speed', 'need', 'forza', 'gran', 'turismo', 'kart', 'motorcycle'],
        'indie': ['indie', 'pixel', 'retro', '8-bit', '16-bit', 'art', 'style', 'unique']
      };
      
      for (const [genre, keywords] of Object.entries(titleGenreKeywords)) {
        if (keywords.some(keyword => title.includes(keyword) || description.includes(keyword))) {
          gameGenres.push(normalizeGenre(genre));
          break; // Only add first matching genre to avoid duplicates
        }
      }
    }
    
    // Add normalized genres to set
    gameGenres.forEach((genre: string) => {
      allGenres.add(genre);
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });

    // Calculate session time estimates
    if ((game as any).hoursPlayed) {
      const avgSessionTime = Math.max(15, (game as any).hoursPlayed * 60 / 10);
      sessionTimes.push(avgSessionTime);
    }
  });

  // Generate intelligent time options based on session moods
  const timeOptions = Object.entries(TIME_MAPPINGS).map(([timeValue, mapping]) => ({
    value: timeValue + (timeValue === '180' ? '+' : ''),
    label: mapping.label,
    icon: mapping.icon,
    count: sessionTimes.filter(time => time <= parseInt(timeValue)).length,
    sessionMood: mapping.sessionMood,
    description: mapping.description,
    energyLevel: mapping.energyLevel,
    genreTags: mapping.genreTags,
    emotionalTags: mapping.emotionalTags
  }));

  // Sort genres by popularity
  const sortedGenres = Array.from(allGenres).sort((a, b) => 
    (genreCounts[b] || 0) - (genreCounts[a] || 0)
  );

  // Sort moods by popularity
  const sortedMoods = Array.from(allMoods).sort((a, b) => 
    (moodCounts[b] || 0) - (moodCounts[a] || 0)
  );

  return {
    availableMoods: sortedMoods,
    availableGenres: sortedGenres,
    timeOptions,
    genreDistribution: genreCounts,
    moodDistribution: moodCounts
  };
}

/**
 * Get enhanced genre options with counts for UI - uses canonical genre list
 */
export function getGenreOptions(games: any[]): Array<{
  value: string;
  label: string;
  icon: string;
  color: string;
  count: number;
}> {
  // Use canonical genre list from normalization module
  const canonicalGenres = CANONICAL_GENRES;
  
  const genreIcons: Record<string, string> = {
    'all-genres': '🎮',
    'action': '⚔️',
    'adventure': '🗺️',
    'puzzle': '🧩',
    'strategy': '♟️',
    'rpg': '🎭',
    'role-playing': '🎭',
    'simulation': '🏗️',
    'sports': '⚽',
    'racing': '🏎️',
    'indie': '🎨',
    'shooter': '🔫',
    'fps': '🔫',
    'platformer': '🏃',
    'horror': '👻',
    'survival': '🏝️',
    'moba': '⚔️',
    'multiplayer': '👥',
    'casual': '😌',
    'roguelike': '🔄'
  };

  const genreColors: Record<string, string> = {
    'all-genres': 'from-purple-500 to-pink-500',
    'action': 'from-red-500 to-orange-500',
    'adventure': 'from-green-500 to-emerald-500',
    'puzzle': 'from-purple-500 to-pink-500',
    'strategy': 'from-blue-500 to-indigo-500',
    'rpg': 'from-yellow-500 to-amber-500',
    'role-playing': 'from-yellow-500 to-amber-500',
    'simulation': 'from-teal-500 to-cyan-500',
    'sports': 'from-orange-500 to-red-500',
    'racing': 'from-gray-500 to-slate-500',
    'indie': 'from-pink-500 to-rose-500',
    'shooter': 'from-red-600 to-orange-600',
    'fps': 'from-red-600 to-orange-600',
    'platformer': 'from-green-600 to-emerald-600',
    'horror': 'from-gray-800 to-black',
    'survival': 'from-brown-600 to-orange-800',
    'moba': 'from-purple-600 to-indigo-600',
    'multiplayer': 'from-blue-600 to-cyan-600',
    'casual': 'from-green-500 to-teal-500',
    'roguelike': 'from-orange-600 to-red-700'
  };

  // Count games for each genre
  const genreCounts: Record<string, number> = {};
  canonicalGenres.forEach(genre => {
    genreCounts[genre] = 0;
  });
  
  games.forEach(game => {
    if (game.genres && Array.isArray(game.genres)) {
      game.genres.forEach((genre: any) => {
        const genreId = typeof genre === 'string' ? normalizeGenre(genre) : normalizeGenre(genre.id || genre.name);
        if (genreCounts[genreId] !== undefined) {
          genreCounts[genreId]++;
        }
      });
    }
  });

  return canonicalGenres.map(genre => ({
    value: genre,
    label: genre === 'all-genres' ? 'All Genres' : genre.charAt(0).toUpperCase() + genre.slice(1),
    icon: genreIcons[genre.toLowerCase()] || '🎮',
    color: genreColors[genre.toLowerCase()] || 'from-gray-500 to-gray-600',
    count: genreCounts[genre] || 0
  }));
}

/**
 * Get enhanced mood options with counts for UI - uses master mood list for consistency
 */
export function getMoodOptions(games: any[]): Array<{
  value: MoodId;
  label: string;
  icon: string;
  count: number;
}> {
  // Use master mood list for consistency with home page
  const masterMoods = MASTER_MOODS;
  
  // Count games for each master mood by checking if they have any sub-moods
  const moodCounts: Record<string, number> = {};
  masterMoods.forEach(masterMood => {
    moodCounts[masterMood.id] = 0;
  });
  
  games.forEach(game => {
    if (game.moods && Array.isArray(game.moods)) {
      const gameMoods = game.moods.map((mood: any) => normalizeMood(mood));
      
      masterMoods.forEach(masterMood => {
        const hasSubMood = masterMood.subMoods.some(subMood => gameMoods.includes(subMood));
        if (hasSubMood) {
          moodCounts[masterMood.id]++;
        }
      });
    }
  });
  
  return masterMoods.map(masterMood => ({
    value: masterMood.id as MoodId,
    label: masterMood.name,
    icon: masterMood.emoji,
    count: moodCounts[masterMood.id] || 0
  }));
}

/**
 * Get enhanced time options based on actual library session data
 */
export function getTimeOptions(games: any[]): Array<{
  value: string;
  label: string;
  icon: string;
  count: number;
}> {
  const analysis = analyzeLibrary(games);
  return analysis.timeOptions;
}
