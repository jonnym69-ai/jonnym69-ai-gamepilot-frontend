import { MoodId } from '@gamepilot/static-data'
import { GENRE_TO_MOOD_MAPPING } from './steamGenreMapping'
import { assignSmartMoodsSync } from './smartMoodAssigner'

// ============================================================================
// CANONICAL LISTS - Aligned with your 16-mood UI
// ============================================================================

export const CANONICAL_MOODS: string[] = [
  'intense', 'strategic', 'relaxing', 'creative', 
  'high-energy', 'atmospheric', 'challenging', 'story-rich', 
  'competitive', 'social', 'experimental', 'mindful', 
  'nostalgic', 'gritty', 'surreal', 'action-packed',
  'scary'
]

export const CANONICAL_GENRES = [
  'all-genres', 'action', 'adventure', 'casual', 'fps', 'horror', 'indie', 
  'moba', 'multiplayer', 'platformer', 'puzzle', 'rpg', 'racing', 
  'roguelike', 'simulation', 'sports', 'strategy'
]

// ============================================================================
// MOOD NORMALIZATION
// ============================================================================

export function normalizeMoodToCanonical(input: any): string {
  if (!input) return 'relaxing' // Safe default
  
  if (Array.isArray(input)) return normalizeMoodToCanonical(input[0])

  if (typeof input === 'object') {
    const candidate = input.moodId ?? input.id ?? input.name ?? input.label
    if (candidate) return normalizeMoodToCanonical(candidate)
    return 'relaxing'
  }
  
  const moodStr = String(input).toLowerCase().trim().replace(' ', '-')
  
  // Direct check against our locked list
  if (CANONICAL_MOODS.includes(moodStr)) {
    return moodStr
  }
  
  // Smart Translator (Legacy Mappings)
  const legacyMappings: Record<string, string> = {
    'calm': 'relaxing',
    'chill': 'relaxing',
    'peaceful': 'relaxing',
    'zen': 'relaxing',
    'create': 'creative',
    'building': 'creative',
    'tactical': 'strategic',
    'planning': 'strategic',
    'immersive': 'atmospheric',
    'difficult': 'challenging',
    'hard': 'challenging',
    'fast-paced': 'high-energy',
    'adrenaline': 'high-energy',
    'narrative': 'story-rich',
    'pvp': 'competitive',
    'versus': 'competitive',
    'multiplayer': 'social',
    'co-op': 'social',
    'retro': 'nostalgic',
    'classic': 'nostalgic',
    'action': 'intense',
    'intense': 'intense',
    'strategic': 'strategic',
    'relaxing': 'relaxing',
    'creative': 'creative',
    'high-energy': 'high-energy',
    'atmospheric': 'atmospheric',
    'challenging': 'challenging',
    'story-rich': 'story-rich',
    'competitive': 'competitive',
    'social': 'social',
    'experimental': 'experimental',
    'mindful': 'mindful',
    'nostalgic': 'nostalgic',
    'gritty': 'gritty',
    'surreal': 'surreal',
    'action-packed': 'action-packed'
  }
  
  return legacyMappings[moodStr] || moodStr
}

export function normalizeTimeKey(time: string): string {
  if (!time) return '60'
  const t = time.toLowerCase()
  if (t === 'short' || t === '15' || t === '30') return '30'
  if (t === 'medium' || t === '60' || t === '90') return '60'
  if (t === 'long' || t === '120' || t === '180') return '120'
  return t.replace(/\D/g, '') || '60'
}

// ============================================================================
// GAME OBJECT NORMALIZATION
// ============================================================================

export function normalizeGameObject(game: any): any {
  if (!game || typeof game !== 'object') return game
  
  const normalized = { ...game }
  
  // 1. Normalize IDs
  normalized.id = normalized.id ? String(normalized.id).replace(/\D/g, '') : ''
  
  // 2. SMART MOOD ASSIGNMENT - SAFELY RE-ENABLED WITH ADDITIVE LOGIC
  try {
    // Try the smart mood assigner first (synchronous version)
    const smartMoods = assignSmartMoodsSync(normalized);
    if (smartMoods && smartMoods.length > 0) {
      console.log(`🧠 Smart moods assigned to "${game.title}":`, smartMoods);
      console.log(`🔍 OLD MOODS: ${game.moods} → NEW MOODS: ${smartMoods}`);
      normalized.moods = smartMoods;
    } else {
      // Fallback to basic normalization
      console.log(`⚠️ Smart mood assigner failed for "${game.title}", using fallback`);
      normalized.moods = normalizeMoodsBasic(normalized);
    }
  } catch (error: any) {
    console.error(`❌ Error in smart mood assignment for "${game.title}":`, error);
    normalized.moods = normalizeMoodsBasic(normalized);
  }
  
  // 3. ENHANCE GENRES WITH TITLE DETECTION
  try {
    const title = (normalized.title || '').toLowerCase();
    const description = (normalized.description || '').toLowerCase();
    const existingGenres = Array.isArray(normalized.genres) ? normalized.genres.map((g: any) => normalizeGenre(g)) : [];
    const additionalGenres: string[] = [];
    
    // Genre detection from title keywords (expanded)
    const titleGenreKeywords: Record<string, string[]> = {
      'action': ['shoot', 'kill', 'war', 'battle', 'combat', 'fight', 'strike', 'call', 'duty', 'assassin', 'hitman', 'gun', 'weapon', 'battlefield', 'cod', 'counter', 'strike'],
      'adventure': ['tomb', 'raider', 'uncharted', 'journey', 'explor', 'island', 'legend', 'zelda', 'link', 'treasure', 'quest', 'adventure', 'mysterious', 'discover'],
      'rpg': ['rpg', 'role', 'fantasy', 'dragon', 'quest', 'dungeon', 'magic', 'wizard', 'final', 'fantasy', 'skyrim', 'the', 'witcher', 'divinity', 'baldur', 'gate', 'pathfinder'],
      'strategy': ['command', 'empire', 'civilization', 'total', 'war', 'age', 'starcraft', 'company', 'conquer', 'tactics', 'strategy', 'chess', 'turn', 'based'],
      'simulation': ['sim', 'tycoon', 'city', 'builder', 'manager', 'railroad', 'zoo', 'hospital', 'theme', 'park', 'farming', 'simulator', 'construction', 'management'],
      'sports': ['football', 'soccer', 'nba', 'fifa', 'madden', 'nfl', 'basketball', 'racing', 'drive', 'need', 'speed', 'tennis', 'golf', 'wrestling', 'boxing', 'hockey'],
      'puzzle': ['puzzle', 'match', 'candy', 'saga', 'tetris', 'sudoku', 'crossword', 'word', 'block', 'jewel', 'gem', 'brain', 'logic'],
      'horror': ['dead', 'resident', 'evil', 'silent', 'hill', 'outlast', 'fear', 'scary', 'dark', 'zombie', 'ghost', 'haunted', 'survival', 'horror'],
      'racing': ['racing', 'drive', 'speed', 'need', 'forza', 'gran', 'turismo', 'kart', 'motorcycle', 'rally', 'track', 'car'],
      'indie': [],
      'fps': ['fps', 'first', 'person', 'shooter', 'arena', 'quake', 'doom', 'halo', 'destiny', 'overwatch'],
      'platformer': ['platform', 'jump', 'mario', 'sonic', 'megaman', 'crash', 'bandicoot', 'super', 'meat', 'boy'],
      'roguelike': ['roguelike', 'rogue', 'dungeon', 'crawler', 'random', 'procedural', 'perma', 'death', 'binding', 'slay'],
      'survival': ['survival', 'craft', 'minecraft', 'ark', 'rust', 'dayz', '7', 'days', 'the', 'forest', 'wilderness']
    };
    
    for (const [genre, keywords] of Object.entries(titleGenreKeywords)) {
      if (keywords.some(keyword => title.includes(keyword) || description.includes(keyword))) {
        if (!existingGenres.includes(genre)) {
          additionalGenres.push(genre);
        }
      }
    }
    
    if (additionalGenres.length > 0) {
      normalized.genres = [...existingGenres, ...additionalGenres.slice(0, 2)]; // Limit to 2 additional genres
      console.log(`🎭 Enhanced genres for "${game.title}": Added ${additionalGenres.join(', ')}`);
    }
  } catch (error: any) {
    console.error(`❌ Error in genre enhancement for "${game.title}":`, error);
  }
  
  return normalized;
}

// Helper function for basic mood normalization (fallback)
function normalizeMoodsBasic(game: any): string[] {
  // 2. Normalize Moods (basic version)
  if (game.moods) {
    const rawMoods = Array.isArray(game.moods) ? game.moods : [game.moods]
    return rawMoods
      .map((m: any) => normalizeMoodToCanonical(m))
      .filter((m: any, index: number, self: any[]) => m && self.indexOf(m) === index) // Unique values only
  }

  // 3. Fallback: If game has no moods, look at genres
  if (!game.moods || game.moods.length === 0) {
    const inferred = new Set<string>()
    const genres = Array.isArray(game.genres) ? game.genres : []
    
    genres.forEach((g: any) => {
      const gId = (typeof g === 'string' ? g : g.id || '').toLowerCase()
      const mapped = GENRE_TO_MOOD_MAPPING[gId] || []
      mapped.forEach(m => inferred.add(normalizeMoodToCanonical(m)))
    })
    
    return Array.from(inferred)
  }
  
  return game.moods || [];
}

export function normalizeGamesArray(games: any[]): any[] {
  if (!Array.isArray(games)) return []
  return games.map(game => normalizeGameObject(game))
}

// Legacy compatibility exports
export const normalizeMood = normalizeMoodToCanonical
export const normalizeGenre = (input: any) => String(input).toLowerCase().trim()