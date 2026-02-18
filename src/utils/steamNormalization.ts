import { MoodId } from '@gamepilot/static-data';
import { normalizeMood, normalizeGenre, CANONICAL_GENRES, CANONICAL_MOODS } from './dataPipelineNormalizer';

// Validation functions
export const isValidGenre = (genre: string): boolean => {
  return CANONICAL_GENRES.includes(genre);
};

export const isValidMood = (mood: string): boolean => {
  return CANONICAL_MOODS.includes(mood);
};

// ===== STEAM GENRE TO CANONICAL GENRE MAPPING =====
export const STEAM_TO_CANONICAL_GENRE: Record<string, string> = {
  // Direct mappings
  'Action': 'action',
  'Adventure': 'adventure',
  'RPG': 'rpg',
  'Strategy': 'strategy',
  'Simulation': 'simulation',
  'Sports': 'sports',
  'Racing': 'racing',
  'Indie': 'indie',
  'Casual': 'casual',
  'Massively Multiplayer': 'multiplayer',
  'Family': 'casual', // Map to casual
  'Board Games': 'puzzle', // Map to puzzle
  'Educational': 'puzzle', // Map to puzzle
  'Free to Play': 'casual', // Map to casual
  'Early Access': 'indie', // Map to indie
  'Animation & Modeling': 'simulation', // Map to simulation
  'Design & Illustration': 'creative', // Map to creative (treat as mood)
  'Accounting': 'simulation', // Map to simulation
  'Audio Production': 'casual', // Map to casual
  'Video Production': 'casual', // Map to casual
  'Utilities': 'casual', // Map to casual
  'Web Publishing': 'casual', // Map to casual
  'Game Development': 'casual', // Map to casual
  'Movie': 'casual', // Map to casual
  'Documentary': 'casual', // Map to casual
  'Software': 'casual', // Map to casual
  'Tutorial': 'casual', // Map to casual
  
  // Genre variants
  'Shooter': 'fps',
  'Platformer': 'platformer',
  'Puzzle': 'puzzle',
  'Horror': 'horror',
  'MOBA': 'moba',
  'Roguelike': 'roguelike',
  'Fighting': 'action',
  'Real-Time Strategy': 'strategy',
  'Turn-Based Strategy': 'strategy',
  '4X': 'strategy',
  'Grand Strategy': 'strategy',
  'Tactical': 'strategy',
  'Point & Click': 'puzzle',
  'Hidden Object': 'puzzle',
  'Visual Novel': 'rpg',
  'Dating Sim': 'simulation',
  'Card Game': 'puzzle',
  'Board Game': 'puzzle'
};

// ===== STEAM TAG TO CANONICAL GENRE MAPPING =====
export const STEAM_TAG_TO_CANONICAL_GENRE: Record<string, string> = {
  'Action': 'action',
  'Adventure': 'adventure',
  'RPG': 'rpg',
  'Strategy': 'strategy',
  'Simulation': 'simulation',
  'Sports': 'sports',
  'Racing': 'racing',
  'Indie': 'indie',
  'Casual': 'casual',
  'Multiplayer': 'multiplayer',
  'Shooter': 'fps',
  'Platformer': 'platformer',
  'Puzzle': 'puzzle',
  'Horror': 'horror',
  'MOBA': 'moba',
  'Roguelike': 'roguelike',
  'Fighting': 'action',
  'Open World': 'adventure',
  'Survival': 'horror',
  'Crafting': 'simulation',
  'Building': 'simulation',
  'Sandbox': 'simulation',
  'Exploration': 'adventure',
  'Fantasy': 'rpg',
  'Sci-fi': 'rpg',
  'Comedy': 'casual',
  'Drama': 'rpg',
  'Mystery': 'adventure',
  'Thriller': 'horror',
  'Stealth': 'action',
  'Hack and Slash': 'action',
  'Beat \'em up': 'action',
  'Metroidvania': 'platformer',
  'Souls-like': 'rpg',
  'Dungeon Crawler': 'rpg',
  'Tower Defense': 'strategy',
  'Real-Time Tactics': 'strategy',
  'Turn-Based Tactics': 'strategy',
  'Wargame': 'strategy',
  'Management': 'simulation',
  'Tycoon': 'simulation',
  'Business Sim': 'simulation',
  'Life Sim': 'simulation',
  'Farming Sim': 'simulation',
  'Dating Sim': 'simulation',
  'Card Game': 'puzzle',
  'Tabletop': 'puzzle',
  'Party': 'casual',
  'Family Friendly': 'casual',
  'Education': 'puzzle',
  'Trivia': 'puzzle',
  'Music': 'casual',
  'Rhythm': 'casual',
  'Fitness': 'sports',
  'Driving': 'racing',
  'Flight': 'simulation',
  'Space': 'simulation',
  'Naval': 'simulation',
  'Military': 'action',
  'Historical': 'strategy',
  'Mythology': 'rpg',
  'Pirate': 'adventure',
  'Western': 'action',
  'Martial Arts': 'action',
  'Superhero': 'action',
  'Cyberpunk': 'rpg',
  'Post-apocalyptic': 'horror',
  'Zombie': 'horror',
  'Vampire': 'horror',
  'Werewolf': 'horror',
  'Gothic': 'horror',
  'Lovecraftian': 'horror',
  'Co-op': 'multiplayer',
  'Local Co-op': 'multiplayer',
  'Online Co-op': 'multiplayer',
  'PvP': 'multiplayer',
  'PvE': 'casual',
  'Singleplayer': 'casual',
  'MMO': 'multiplayer',
  'MMORPG': 'multiplayer',
  'Online': 'multiplayer',
  'Lan': 'multiplayer',
  'Split Screen': 'multiplayer',
  'Shared Screen': 'multiplayer',
  'Local Multiplayer': 'multiplayer',
  'Asymmetric Multiplayer': 'multiplayer'
};

// ===== STEAM CATEGORY TO CANONICAL MOOD MAPPING =====
export const STEAM_CATEGORY_TO_CANONICAL_MOOD: Record<string, MoodId> = {
  'Single-player': 'chill',
  'Multi-player': 'social',
  'Co-op': 'social',
  'Online Co-op': 'social',
  'LAN Co-op': 'social',
  'Local Co-op': 'social',
  'Shared/Split Screen': 'social',
  'Cross-Platform Multiplayer': 'social',
  'MMO': 'social',
  'Captions available': 'chill',
  'Commentary available': 'social',
  'Stats': 'competitive',
  'Achievements': 'competitive',
  'Steam Leaderboards': 'competitive',
  'Trading Cards': 'social',
  'Partial Controller Support': 'casual',
  'Full controller support': 'chill',
  'VR Support': 'energetic',
  'Remote Play Together': 'social',
  'Remote Play on TV': 'social',
  'Remote Play on Phone': 'social',
  'Remote Play on Tablet': 'social'
};

// ===== MAIN NORMALIZATION FUNCTIONS =====

/**
 * Normalize Steam genres to canonical genres
 */
export const normalizeSteamGenre = (steamGenre: string): string => {
  const normalized = STEAM_TO_CANONICAL_GENRE[steamGenre];
  if (normalized) return normalized;
  
  // Fallback to general normalization
  return normalizeGenre(steamGenre);
};

/**
 * Normalize Steam tags to canonical genres
 */
export const normalizeSteamTag = (steamTag: string): string => {
  const normalized = STEAM_TAG_TO_CANONICAL_GENRE[steamTag];
  if (normalized) return normalized;
  
  // Fallback to general normalization
  return normalizeGenre(steamTag);
};

/**
 * Normalize Steam categories to canonical moods
 */
export const normalizeSteamCategory = (steamCategory: string): MoodId => {
  const normalized = STEAM_CATEGORY_TO_CANONICAL_MOOD[steamCategory];
  if (normalized) return normalized;
  
  // Fallback to general normalization
  return normalizeMood(steamCategory);
};

/**
 * Process Steam game data through canonical normalization
 */
export const processSteamGameCanonical = (steamGame: any, steamDetails?: any) => {
  // Normalize genres
  const rawGenres = steamDetails?.genres?.map((g: any) => 
    typeof g === 'string' ? g : g.description || g.name
  ) || [];
  
  const canonicalGenres = rawGenres
    .map(normalizeSteamGenre)
    .filter(isValidGenre);
  
  // Normalize moods from categories
  const rawCategories = steamDetails?.categories?.map((c: any) => 
    typeof c === 'string' ? c : c.description || c.name
  ) || [];
  
  const canonicalMoods = rawCategories
    .map(normalizeSteamCategory)
    .filter(isValidMood);
  
  // Normalize tags as additional genres
  const rawTags = steamDetails?.tags?.map((t: any) => 
    typeof t === 'string' ? t : t.description || t.name
  ) || [];
  
  const additionalGenres = rawTags
    .map(normalizeSteamTag)
    .filter(isValidGenre)
    .slice(0, 5); // Limit to avoid spam
  
  // Ensure at least one canonical genre and mood
  const finalGenres = canonicalGenres.length > 0 
    ? [...new Set([...canonicalGenres, ...additionalGenres])]
    : ['action']; // Default fallback
  
  const finalMoods = canonicalMoods.length > 0
    ? canonicalMoods
    : ['chill']; // Default fallback
  
  return {
    appId: steamGame.appid,
    title: steamGame.name,
    description: steamDetails?.short_description || steamDetails?.about_the_game || '',
    coverImage: `https://cdn.akamai.steamstatic.com/steam/apps/${steamGame.appid}/library_600x900.jpg`,
    genres: finalGenres,
    moods: finalMoods,
    tags: [...finalGenres, ...finalMoods, 'steam-imported'],
    playtime: steamGame.playtime_forever || 0
  };
};
