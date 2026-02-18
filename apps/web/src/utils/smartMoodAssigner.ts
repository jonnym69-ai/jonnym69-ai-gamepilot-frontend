// SMART MOOD ASSIGNER - Hybrid Genre Patterns + Ollama AI + RAWG Enhancement

import { rawgService } from '../services/rawgService'

// COMPREHENSIVE GENRE-TO-MOOD PATTERNS
export const GENRE_TO_MOOD_PATTERNS: Record<string, string[]> = {
  // Strategy Games
  'strategy': ['strategic', 'challenging'],
  'rts': ['strategic', 'challenging'],
  'turn-based': ['strategic', 'mindful'],
  '4x': ['strategic', 'creative'],
  'grand strategy': ['strategic', 'challenging'],
  'tower defense': ['strategic'],
  
  // Action games (FIXED - better action mapping)
  'action': ['intense', 'action-packed', 'challenging'],
  'fps': ['intense', 'competitive', 'action-packed'],
  'shooter': ['intense', 'action-packed'],
  'fighting': ['intense', 'challenging', 'competitive'],
  'hack and slash': ['intense', 'action-packed', 'challenging'],
  'beat em up': ['intense', 'action-packed'],
  
  // RPG Games
  'rpg': ['story-rich', 'challenging'],
  'action rpg': ['story-rich', 'intense'],
  'jrpg': ['story-rich', 'atmospheric'],
  'mmorpg': ['social', 'story-rich'],
  'roguelike': ['challenging', 'experimental'],
  'roguelite': ['challenging'],
  
  // Multiplayer & Social Games (TITLE PATTERNS)
  'left 4 dead': ['social', 'cooperative', 'multiplayer'],
  'rocket league': ['social', 'multiplayer', 'competitive'],
  'rust': ['social', 'multiplayer', 'survival'],
  'dayz': ['social', 'multiplayer', 'survival'],
  'apex legends': ['social', 'multiplayer', 'competitive'],
  'pubg': ['social', 'multiplayer', 'battle royale'],
  'fortnite': ['social', 'multiplayer', 'battle royale'],
  'overwatch': ['social', 'multiplayer', 'team-based'],
  'valheim': ['social', 'multiplayer', 'cooperative'],
  'don\'t starve together': ['social', 'multiplayer', 'cooperative'],
  'squad': ['social', 'multiplayer', 'team-based'],
  'hell let loose': ['social', 'multiplayer', 'team-based'],
  'battlebit': ['social', 'multiplayer', 'competitive'],
  'insurgency': ['social', 'multiplayer', 'tactical'],
  'hunt: showdown': ['social', 'multiplayer', 'competitive'],
  'crab game': ['social', 'multiplayer', 'party'],
  'pummel party': ['social', 'multiplayer', 'party'],
  
  // Creative & Building Games (TITLE PATTERNS)
  'terraria': ['creative', 'sandbox', 'building'],
  'minecraft': ['creative', 'sandbox', 'building'],
  'starbound': ['creative', 'sandbox', 'building'],
  'rimworld': ['creative', 'sandbox', 'strategy'],
  'project zomboid': ['creative', 'sandbox', 'survival'],
  'core keeper': ['creative', 'sandbox', 'cooperative'],
  'necesse': ['creative', 'sandbox', 'building'],
  'forager': ['creative', 'sandbox', 'relaxing'],
  'garry\'s mod': ['creative', 'sandbox', 'experimental'],
  'unturned': ['creative', 'sandbox', 'survival'],
  '7 days to die': ['creative', 'sandbox', 'survival'],
  'the forest': ['creative', 'sandbox', 'survival'],
  'stranded deep': ['creative', 'sandbox', 'survival'],
  'green hell': ['creative', 'sandbox', 'survival'],
  'kenshi': ['creative', 'sandbox', 'rpg'],
  
  // Nostalgic & Retro Games (TITLE PATTERNS)
  'command & conquer': ['nostalgic', 'retro', 'strategic'],
  'age of empires': ['nostalgic', 'retro', 'strategic'],
  'company of heroes': ['nostalgic', 'retro', 'strategic'],
  'star wars': ['nostalgic', 'retro', 'story-rich'],
  'batman': ['nostalgic', 'retro', 'action-packed'],
  'fallout': ['nostalgic', 'retro', 'story-rich'],
  'dark souls': ['nostalgic', 'retro', 'challenging'],
  'metal gear solid': ['nostalgic', 'retro', 'story-rich'],
  'resident evil': ['nostalgic', 'retro', 'horror'],
  'mafia': ['nostalgic', 'retro', 'story-rich'],
  'lego': ['nostalgic', 'retro', 'family'],
  'baldur\'s gate': ['nostalgic', 'retro', 'rpg'],
  'witcher': ['nostalgic', 'retro', 'story-rich'],
  'god of war': ['nostalgic', 'retro', 'action-packed'],
  
  // Simulation Games
  'simulation': ['creative', 'relaxing'],
  'management': ['strategic', 'creative'],
  'tycoon': ['creative', 'strategic'],
  'farming': ['relaxing', 'creative'],
  
  // Online & Multiplayer Games (GENRE PATTERNS)
  'multiplayer': ['social', 'multiplayer'],
  'co-op': ['social', 'cooperative'],
  'cooperative': ['social', 'cooperative'],
  'online': ['social', 'multiplayer'],
  'party': ['social', 'party'],
  'team': ['social', 'team-based'],
  'battle royale': ['competitive', 'multiplayer'],
  
  // Creative & Building Games (GENRE PATTERNS)
  'building': ['creative', 'building'],
  'crafting': ['creative', 'crafting'],
  'sandbox': ['creative', 'sandbox'],
  'creative': ['creative', 'artistic'],
  'construction': ['creative', 'building'],
  'design': ['creative', 'artistic'],
  
  // Retro & Nostalgic Games
  'retro': ['nostalgic', 'retro'],
  'classic': ['nostalgic', 'classic'],
  'remastered': ['nostalgic', 'remastered'],
  'throwback': ['nostalgic', 'throwback'],
  '8-bit': ['nostalgic', 'retro'],
  '16-bit': ['nostalgic', 'retro'],
  'pixel': ['nostalgic', 'retro'],
  
  // Puzzle Games
  'puzzle': ['mindful', 'challenging'],
  'hidden object': ['relaxing', 'mindful'],
  'match-3': ['relaxing', 'mindful'],
  'sokoban': ['mindful', 'challenging'],
  
  // Adventure Games
  'adventure': ['story-rich', 'atmospheric'],
  'point and click': ['story-rich', 'mindful'],
  'visual novel': ['story-rich', 'relaxing'],
  'walking simulator': ['atmospheric', 'relaxing'],
  
  // Sports & Racing
  'sports': ['competitive', 'high-energy'],
  'racing': ['high-energy', 'competitive'],
  'football': ['competitive', 'social'],
  'basketball': ['competitive', 'high-energy'],
  'soccer': ['competitive', 'social'],
  'wrestling': ['intense', 'competitive', 'action-packed'],
  
  // Indie & Experimental (reduced priority)
  'indie': ['experimental'],
  'experimental': ['experimental'],
  'family': ['social'],
  'educational': ['mindful', 'creative'],
  'music': ['creative'],
  'rhythm': ['creative', 'high-energy'],
  
  // Horror & Thriller (FIXED - better horror mapping)
  'horror': ['gritty', 'atmospheric', 'challenging'],
  'survival horror': ['challenging', 'gritty', 'intense'],
  'thriller': ['atmospheric', 'intense'],
  
  // Classic & Retro (FIXED - removed relaxing)
  'arcade': ['high-energy', 'nostalgic'],
  
  // Unique Categories
  'dating sim': ['social', 'story-rich'],
  'idle': ['relaxing', 'creative'],
  'clicker': ['relaxing', 'mindful'],
  'text adventure': ['story-rich', 'mindful']
};

// GAME TITLE PATTERNS (for games with misleading genres)
export const TITLE_PATTERNS: Record<string, string[]> = {
  // Multiplayer & Social Games (TITLE PATTERNS)
  'left 4 dead': ['social', 'cooperative', 'multiplayer'],
  'rocket league': ['social', 'multiplayer', 'competitive'],
  'rust': ['social', 'multiplayer', 'survival'],
  'dayz': ['social', 'multiplayer', 'survival'],
  'apex legends': ['social', 'multiplayer', 'competitive'],
  'pubg': ['social', 'multiplayer', 'battle royale'],
  'fortnite': ['social', 'multiplayer', 'battle royale'],
  'overwatch': ['social', 'multiplayer', 'team-based'],
  'valheim': ['social', 'multiplayer', 'cooperative'],
  'don\'t starve together': ['social', 'multiplayer', 'cooperative'],
  'squad': ['social', 'multiplayer', 'team-based'],
  'hell let loose': ['social', 'multiplayer', 'team-based'],
  'battlebit': ['social', 'multiplayer', 'competitive'],
  'insurgency': ['social', 'multiplayer', 'tactical'],
  'hunt: showdown': ['social', 'multiplayer', 'competitive'],
  'crab game': ['social', 'multiplayer', 'party'],
  'pummel party': ['social', 'multiplayer', 'party'],
  
  // Creative & Building Games (TITLE PATTERNS)
  'terraria': ['creative', 'sandbox', 'building'],
  'minecraft': ['creative', 'sandbox', 'building'],
  'starbound': ['creative', 'sandbox', 'building'],
  'rimworld': ['creative', 'sandbox', 'strategy'],
  'project zomboid': ['creative', 'sandbox', 'survival'],
  'core keeper': ['creative', 'sandbox', 'cooperative'],
  'necesse': ['creative', 'sandbox', 'building'],
  'forager': ['creative', 'sandbox', 'relaxing'],
  'garry\'s mod': ['creative', 'sandbox', 'experimental'],
  'unturned': ['creative', 'sandbox', 'survival'],
  '7 days to die': ['creative', 'sandbox', 'survival'],
  'the forest': ['creative', 'sandbox', 'survival'],
  'stranded deep': ['creative', 'sandbox', 'survival'],
  'green hell': ['creative', 'sandbox', 'survival'],
  'kenshi': ['creative', 'sandbox', 'rpg'],
  
  // Nostalgic & Retro Games (TITLE PATTERNS)
  'command & conquer': ['nostalgic', 'retro', 'strategic'],
  'age of empires': ['nostalgic', 'retro', 'strategic'],
  'company of heroes': ['nostalgic', 'retro', 'strategic'],
  'star wars': ['nostalgic', 'retro', 'story-rich'],
  'batman': ['nostalgic', 'retro', 'action-packed'],
  'fallout': ['nostalgic', 'retro', 'story-rich'],
  'dark souls': ['nostalgic', 'retro', 'challenging'],
  'metal gear solid': ['nostalgic', 'retro', 'story-rich'],
  'resident evil': ['nostalgic', 'retro', 'horror'],
  'mafia': ['nostalgic', 'retro', 'story-rich'],
  'lego': ['nostalgic', 'retro', 'family'],
  'baldur\'s gate': ['nostalgic', 'retro', 'rpg'],
  'witcher': ['nostalgic', 'retro', 'story-rich'],
  'god of war': ['nostalgic', 'retro', 'action-packed'],
  
  // Strategy games that might be misclassified
  'civilization': ['strategic', 'challenging'],
  'stronghold': ['strategic'],
  'starcraft': ['strategic', 'competitive'],
  'warcraft': ['strategic', 'social'],
  'total war': ['strategic', 'challenging'],
  'xcom': ['strategic', 'challenging'],
  
  // Action games
  'call of duty': ['intense', 'competitive'],
  'battlefield': ['intense', 'competitive'],
  'doom': ['intense', 'action-packed'],
  'quake': ['intense', 'action-packed'],
  'halo': ['action-packed', 'competitive'],
  
  // Sports & Wrestling Games (FIXED - proper sports/wrestling mapping)
  'wwe': ['intense', 'competitive', 'action-packed'],
  'wrestling': ['intense', 'competitive', 'action-packed'],
  'nba': ['competitive', 'sports'],
  'nfl': ['competitive', 'sports'],
  'fifa': ['competitive', 'sports'],
  'mlb': ['competitive', 'sports'],
  
  // RPG games
  'skyrim': ['story-rich', 'atmospheric'],
  'elden ring': ['challenging', 'atmospheric'],
  'final fantasy': ['story-rich', 'atmospheric'],
  
  // Horror games (FIXED - proper horror mapping)
  'silent hill': ['gritty', 'atmospheric'],
  'amnesia': ['gritty', 'atmospheric'],
  'outlast': ['gritty', 'intense'],
  'dead space': ['gritty', 'intense', 'challenging'],
  
  // Indie favorites
  'hollow knight': ['challenging', 'atmospheric'],
  'celeste': ['challenging'],
  'undertale': ['story-rich', 'experimental'],
  'cuphead': ['challenging', 'nostalgic'],
  'dead cells': ['challenging', 'intense']
};

// Cache for Ollama results to avoid repeated API calls
const moodCache = new Map<string, string[]>();

// Synchronous version for data pipeline (non-async) - ADDITIVE APPROACH
export function assignSmartMoodsSync(game: any): string[] {
  const cacheKey = `${game.title}_${JSON.stringify(game.genres || [])}`;
  
  // TEMPORARILY DISABLE CACHE FOR TESTING - always recompute
  // if (moodCache.has(cacheKey)) {
  //   return moodCache.get(cacheKey)!;
  // }
  
  // Get existing moods from the game
  const existingMoods = Array.isArray(game.moods) ? game.moods : [];
  let newMoods: string[] = [];
  
  // DEBUG: Log game info
  console.log(`🔍 DEBUG: Processing "${game.title}" - Genres:`, game.genres);
  console.log(`🔍 DEBUG: Raw game data:`, {
    title: game.title,
    genres: game.genres,
    steamAppId: game.steamAppId,
    rawGenreData: game.rawGenreData
  });
  
  // 1. Try title patterns first (most specific)
  const titleLower = (game.title || '').toLowerCase();
  for (const [pattern, patternMoods] of Object.entries(TITLE_PATTERNS)) {
    if (titleLower.includes(pattern)) {
      newMoods = [...newMoods, ...patternMoods];
      console.log(`🎯 DEBUG: Title pattern "${pattern}" matched for "${game.title}" - Added moods:`, patternMoods);
    }
  }
  
  // 2. Try genre patterns
  {
    const gameGenresRaw = Array.isArray(game.genres) ? game.genres.map((g: any) => g?.name || g) : [];
    const gameGenres = gameGenresRaw
      .filter(Boolean)
      .map((g: any) => String(g).toLowerCase().trim().replace(/\s+/g, ' '));

    console.log(`🎭 DEBUG: Extracted genres for "${game.title}":`, gameGenresRaw);

    const hasStrongSignalSoFar = newMoods.length > 0;

    for (const genre of gameGenres) {
      if (hasStrongSignalSoFar && (genre === 'indie' || genre === 'experimental')) {
        continue;
      }

      const direct = GENRE_TO_MOOD_PATTERNS[genre];
      if (direct) {
        newMoods = [...newMoods, ...direct];
        console.log(`🎯 DEBUG: Genre "${genre}" matched for "${game.title}" - Added moods:`, direct);
        continue;
      }

      for (const [pattern, patternMoods] of Object.entries(GENRE_TO_MOOD_PATTERNS)) {
        if (genre.includes(pattern)) {
          newMoods = [...newMoods, ...patternMoods];
          console.log(`🎯 DEBUG: Genre pattern "${pattern}" matched for "${game.title}" - Added moods:`, patternMoods);
        }
      }
    }
  }
  
  // 3. Use emotional tags if available
  if (game.emotionalTags) {
    const emotional = Array.isArray(game.emotionalTags) ? game.emotionalTags : [game.emotionalTags];
    const emotionalNormalized = emotional
      .filter(Boolean)
      .map((t: any) => String(t).toLowerCase().trim().replace(/\s+/g, '-'));

    const emotionalCanonicalMap: Record<string, string> = {
      chill: 'relaxing',
      cozy: 'relaxing',
      calm: 'relaxing',
      focused: 'strategic',
      energetic: 'high-energy',
      energy: 'high-energy'
    };

    const emotionalCanonical = emotionalNormalized.map((t: string) => emotionalCanonicalMap[t] || t);

    if (emotionalCanonical.length > 0) {
      newMoods = [...newMoods, ...emotionalCanonical.slice(0, 2)];
    }
  }
  
  // 4. SMART MERGE STRATEGY
  let finalMoods: string[] = [];
  
  // If game has only "relaxing" as single mood, replace it
  if (existingMoods.length === 1 && existingMoods[0] === 'relaxing') {
    finalMoods = newMoods.length > 0 ? newMoods : ['creative'];
  }
  // If game has diverse existing moods, keep them and add new ones
  else if (existingMoods.length > 1) {
    finalMoods = [...existingMoods, ...newMoods];
  }
  // If game has single non-relaxing mood, enhance it
  else if (existingMoods.length === 1) {
    finalMoods = [...existingMoods, ...newMoods];
  }
  // No existing moods, use new ones
  else {
    finalMoods = newMoods.length > 0 ? newMoods : ['creative'];
  }
  
  // 5. Remove duplicates and limit to 4 moods max (increased from 3)
  let uniqueMoods = [...new Set(finalMoods)].slice(0, 4);

  const lowerUnique = uniqueMoods.map(m => String(m).toLowerCase());
  const isOnlyExperimental = lowerUnique.length === 1 && lowerUnique[0] === 'experimental';

  if (isOnlyExperimental) {
    if (game.emotionalTags && Array.isArray(game.emotionalTags) && game.emotionalTags.length > 0) {
      const emotional = game.emotionalTags
        .filter(Boolean)
        .map((t: any) => String(t).toLowerCase().trim().replace(/\s+/g, '-'))
        .slice(0, 2);
      uniqueMoods = [...new Set([...emotional, ...uniqueMoods])].slice(0, 4);
    } else {
      uniqueMoods = ['creative', ...uniqueMoods].slice(0, 4);
    }
  }
  
  // DEBUG: Log final result
  console.log(`🧠 DEBUG: Final moods for "${game.title}":`, uniqueMoods, `(Old: [${existingMoods.join(', ')}] → New: [${newMoods.join(', ')}])`);
  
  // Store in cache (temporarily disabled for testing)
  // moodCache.set(cacheKey, uniqueMoods);
  return uniqueMoods;
}

// Clear cache function for testing/debugging
export function clearMoodCache() {
  moodCache.clear();
  console.log('🧹 Mood cache cleared - games will be re-evaluated');
}

// Force re-evaluation for specific games (testing)
export function forceReevaluateGame(gameTitle: string) {
  // Clear any cache entries for this game
  for (const [key, value] of moodCache.entries()) {
    if (key.toLowerCase().includes(gameTitle.toLowerCase())) {
      moodCache.delete(key);
      console.log(`🔄 Cleared cache for: ${key}`);
    }
  }
}

export async function assignSmartMoods(game: any): Promise<string[]> {
  const cacheKey = `${game.title}_${JSON.stringify(game.genres || [])}`;
  
  // DEBUG: Log what we're working with
  console.log(`🔍 DEBUG MOOD ASSIGNMENT for "${game.title}":`, {
    genres: game.genres,
    existingMoods: game.moods,
    cacheKey
  });
  
  // Check cache first
  if (moodCache.has(cacheKey)) {
    const cachedMoods = moodCache.get(cacheKey)!;
    console.log(`📦 Using cached moods for "${game.title}":`, cachedMoods);
    return cachedMoods;
  }
  
  let moods: string[] = [];
  
  // 1. Try title patterns first (most specific)
  const titleLower = (game.title || '').toLowerCase();
  for (const [pattern, patternMoods] of Object.entries(TITLE_PATTERNS)) {
    if (titleLower.includes(pattern)) {
      moods = [...moods, ...patternMoods];
    }
  }
  
  // 2. Try genre patterns
  const genres = Array.isArray(game.genres) ? game.genres : [];
  for (const genre of genres) {
    const genreName = typeof genre === 'string' ? genre : (genre.name || genre.id || '').toLowerCase();
    
    for (const [pattern, patternMoods] of Object.entries(GENRE_TO_MOOD_PATTERNS)) {
      if (genreName.includes(pattern)) {
        moods = [...moods, ...patternMoods];
      }
    }
  }
  
  // 3. If still no moods, try Ollama AI
  if (moods.length === 0) {
    try {
      moods = await assignMoodsWithOllama(game);
    } catch (error) {
      console.warn('Ollama mood assignment failed, using fallback:', error);
      moods = ['creative']; // Better fallback than relaxing
    }
  }
  
  // 4. Remove duplicates and limit to 3 moods max
  const uniqueMoods = [...new Set(moods)].slice(0, 3);
  
  // 5. Cache the result
  moodCache.set(cacheKey, uniqueMoods);
  
  console.log(`✅ FINAL MOODS for "${game.title}":`, uniqueMoods);
  
  return uniqueMoods.length > 0 ? uniqueMoods : ['creative'];
}

// Enhanced mood assignment with RAWG API integration
export async function assignSmartMoodsWithRAWG(game: any): Promise<string[]> {
  const cacheKey = `${game.title}_${JSON.stringify(game.genres || [])}_rawg`;
  
  // Check cache first
  if (moodCache.has(cacheKey)) {
    const cachedMoods = moodCache.get(cacheKey)!;
    console.log(`📦 Using cached RAWG moods for "${game.title}":`, cachedMoods);
    return cachedMoods;
  }
  
  let moods: string[] = [];
  
  try {
    // 1. Try to get enhanced data from RAWG
    const rawgGame = await rawgService.getGameDetailsByName(game.title);
    
    if (rawgGame) {
      console.log(`🎮 RAWG data found for "${game.title}":`, {
        genres: rawgGame.genres.map(g => g.name),
        tags: rawgGame.tags.slice(0, 5).map(t => t.name),
        rating: rawgGame.rating,
        description: rawgGame.description_raw?.substring(0, 100) + '...'
      });
      
      // 2. Analyze RAWG description for mood keywords
      const descriptionMoods = extractMoodsFromDescription(rawgGame.description_raw || rawgGame.description);
      moods = [...moods, ...descriptionMoods];
      
      // 3. Use RAWG genres (more accurate than Steam)
      const rawgGenres = rawgGame.genres.map(g => g.name.toLowerCase());
      for (const genre of rawgGenres) {
        const genreMoods = GENRE_TO_MOOD_PATTERNS[genre];
        if (genreMoods) {
          moods = [...moods, ...genreMoods];
        }
      }
      
      // 4. Use RAWG tags for mood signals
      const moodRelevantTags = rawgGame.tags
        .map(t => t.name.toLowerCase())
        .filter(tag => isMoodRelevantTag(tag));
      
      const tagMoods = extractMoodsFromTags(moodRelevantTags);
      moods = [...moods, ...tagMoods];
      
      // 5. Consider rating for mood intensity
      if (rawgGame.rating > 4.0) {
        moods = [...moods, 'challenging'];
      } else if (rawgGame.rating < 2.5) {
        moods = [...moods, 'relaxing'];
      }
      
      // 6. Consider ESRB rating for maturity
      if (rawgGame.esrb_rating?.name?.toLowerCase().includes('mature')) {
        moods = [...moods, 'gritty'];
      }
      
      console.log(`🎯 RAWG-enhanced moods for "${game.title}":`, moods);
    } else {
      console.log(`⚠️ No RAWG data found for "${game.title}", falling back to standard analysis`);
      return assignSmartMoodsSync(game);
    }
  } catch (error) {
    console.warn(`RAWG API error for "${game.title}", falling back to standard analysis:`, error);
    return assignSmartMoodsSync(game);
  }
  
  // 7. Remove duplicates and limit to 4 moods max
  const uniqueMoods = [...new Set(moods)].slice(0, 4);
  
  // 8. Ensure we have at least one mood
  if (uniqueMoods.length === 0) {
    uniqueMoods.push('creative');
  }
  
  // 9. Cache the result
  moodCache.set(cacheKey, uniqueMoods);
  
  console.log(`✅ FINAL RAWG-ENHANCED MOODS for "${game.title}":`, uniqueMoods);
  
  return uniqueMoods;
}

// Helper functions for RAWG mood extraction
function extractMoodsFromDescription(description: string): string[] {
  const moods: string[] = [];
  const desc = description.toLowerCase();
  
  // Mood keyword mappings
  const moodKeywords: Record<string, string[]> = {
    'intense': ['intense', 'action-packed', 'fast-paced', 'thrilling', 'adrenaline'],
    'relaxing': ['relaxing', 'calm', 'peaceful', 'meditative', 'zen', 'chill'],
    'strategic': ['strategic', 'tactical', 'planning', 'strategy', 'command'],
    'creative': ['creative', 'build', 'create', 'design', 'craft', 'imagination'],
    'atmospheric': ['atmospheric', 'immersive', 'beautiful', 'stunning', 'ambience'],
    'challenging': ['challenging', 'difficult', 'hard', 'master', 'expert'],
    'story-rich': ['story', 'narrative', 'plot', 'character', 'dialogue', 'cinematic'],
    'social': ['multiplayer', 'co-op', 'friends', 'team', 'community', 'online'],
    'nostalgic': ['retro', 'classic', 'nostalgic', 'old-school', 'vintage'],
    'gritty': ['dark', 'gritty', 'brutal', 'violent', 'mature', 'realistic']
  };
  
  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    if (keywords.some(keyword => desc.includes(keyword))) {
      moods.push(mood);
    }
  }
  
  return moods.slice(0, 2); // Limit description-based moods
}

function extractMoodsFromTags(tags: string[]): string[] {
  const moods: string[] = [];
  
  // Direct tag-to-mood mappings
  const tagToMood: Record<string, string> = {
    'atmospheric': 'atmospheric',
    'relaxing': 'relaxing',
    'co-op': 'social',
    'multiplayer': 'social',
    'competitive': 'competitive',
    'story rich': 'story-rich',
    'difficult': 'challenging',
    'fast-paced': 'intense',
    'creative': 'creative',
    'building': 'creative',
    'strategy': 'strategic',
    'tactical': 'strategic',
    'retro': 'nostalgic',
    'dark': 'gritty',
    'violent': 'gritty',
    'online': 'social'
  };
  
  for (const tag of tags) {
    const mood = tagToMood[tag];
    if (mood && !moods.includes(mood)) {
      moods.push(mood);
    }
  }
  
  return moods.slice(0, 3); // Limit tag-based moods
}

function isMoodRelevantTag(tag: string): boolean {
  const relevantTags = [
    'atmospheric', 'relaxing', 'co-op', 'multiplayer', 'competitive', 
    'story rich', 'difficult', 'fast-paced', 'creative', 'building',
    'strategy', 'tactical', 'retro', 'dark', 'violent', 'online',
    'puzzle', 'exploration', 'survival', 'horror', 'simulation'
  ];
  
  return relevantTags.some(relevant => tag.includes(relevant));
}

async function assignMoodsWithOllama(game: any): Promise<string[]> {
  const prompt = `Analyze this game and assign 2-3 appropriate moods from this list: intense, strategic, relaxing, creative, high-energy, atmospheric, challenging, story-rich, competitive, social, experimental, mindful, nostalgic, gritty, surreal, action-packed.

Game Title: ${game.title}
Description: ${game.description || 'No description available'}
Genres: ${Array.isArray(game.genres) ? game.genres.map((g: any) => typeof g === 'string' ? g : g.name).join(', ') : 'No genres listed'}

Return only the moods as a JSON array, like: ["strategic", "challenging"]`;

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: prompt,
        stream: false,
        format: 'json'
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.status}`);
    }

    const result = await response.json();
    const moods = JSON.parse(result.response);
    
    // Validate moods against our allowed list
    const allowedMoods = ['intense', 'strategic', 'relaxing', 'creative', 'high-energy', 'atmospheric', 'challenging', 'story-rich', 'competitive', 'social', 'experimental', 'mindful', 'nostalgic', 'gritty', 'surreal', 'action-packed'];
    
    return moods.filter((mood: string) => allowedMoods.includes(mood.toLowerCase()));
  } catch (error) {
    console.error('Ollama mood assignment error:', error);
    throw error;
  }
}
