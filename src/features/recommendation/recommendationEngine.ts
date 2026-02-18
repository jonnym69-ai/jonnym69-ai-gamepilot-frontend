import type { PersonaSnapshot } from '../../../../../packages/identity-engine/src/persona'
import type { RawPlayerSignals } from '../../../../../packages/identity-engine/src/persona'
import type { Game } from '@gamepilot/types'
import { rawgService } from '../../services/rawgService'

// Helper function to convert library games to recommendation engine format
function convertLibraryGamesToRecommendationFormat(libraryGames: Game[]): typeof GAME_METADATA {
  if (!libraryGames || libraryGames.length === 0) {
    return GAME_METADATA // Fallback to static metadata
  }

  return libraryGames.map(game => ({
    id: game.id,
    name: game.title,
    coverImage: game.coverImage,
    steamUrl: game.appId ? `https://store.steampowered.com/app/${game.appId}` : '',
    price: "Owned", // Since it's in the library
    genres: game.genres?.map(g => g.name) || [],
    moodTags: game.moods || [],
    difficulty: "Normal",
    playstyleTags: game.tags || [],
    narrativeStyle: "medium",
    sessionSuitability: "flexible"
  }))
}

// Static game metadata for recommendation pool (fallback when library is empty)
const GAME_METADATA = [
  {
    id: 'bg3',
    name: "Baldur's Gate 3",
    coverImage: "https://cdn.akamai.steamstatic.com/steam/apps/1086940/library_600x900.jpg",
    steamUrl: "https://store.steampowered.com/app/1086940",
    price: "$59.99",
    genres: ["RPG", "Adventure", "Strategy"],
    moodTags: ["immersive", "strategic", "social", "creative"],
    difficulty: "Normal",
    playstyleTags: ["story-driven", "strategic", "social"],
    narrativeStyle: "deep",
    sessionSuitability: "long"
  },
  {
    id: 'cyberpunk',
    name: "Cyberpunk 2077",
    coverImage: "https://cdn.akamai.steamstatic.com/steam/apps/1091500/library_600x900.jpg",
    steamUrl: "https://store.steampowered.com/app/1091500",
    price: "$29.99",
    genres: ["RPG", "Action", "Open World"],
    moodTags: ["energetic", "immersive", "competitive", "creative"],
    difficulty: "Normal",
    playstyleTags: ["explorer", "competitive", "story-driven"],
    narrativeStyle: "deep",
    sessionSuitability: "medium"
  },
  {
    id: 'stardew',
    name: "Stardew Valley",
    coverImage: "https://cdn.akamai.steamstatic.com/steam/apps/413150/library_600x900.jpg",
    steamUrl: "https://store.steampowered.com/app/413150",
    price: "$14.99",
    genres: ["Simulation", "RPG", "Farming"],
    moodTags: ["chill", "creative", "social", "relaxed"],
    difficulty: "Relaxed",
    playstyleTags: ["casual", "creative", "social"],
    narrativeStyle: "light",
    sessionSuitability: "short"
  },
  {
    id: 'hades',
    name: "Hades",
    coverImage: "https://cdn.akamai.steamstatic.com/steam/apps/1145360/library_600x900.jpg",
    steamUrl: "https://store.steampowered.com/app/1145360",
    price: "$24.99",
    genres: ["Roguelike", "Action", "Indie"],
    moodTags: ["energetic", "competitive", "focused", "challenging"],
    difficulty: "Hard",
    playstyleTags: ["competitive", "achiever", "focused"],
    narrativeStyle: "moderate",
    sessionSuitability: "short"
  },
  {
    id: 'disco',
    name: "Disco Elysium",
    coverImage: "https://cdn.akamai.steamstatic.com/steam/apps/646920/library_600x900.jpg",
    steamUrl: "https://store.steampowered.com/app/646920",
    price: "$19.99",
    genres: ["RPG", "Indie", "Turn-Based"],
    moodTags: ["creative", "immersive", "thoughtful", "relaxed"],
    difficulty: "Normal",
    playstyleTags: ["story-driven", "explorer", "creative"],
    narrativeStyle: "deep",
    sessionSuitability: "medium"
  },
  {
    id: 'vampire',
    name: "Vampire Survivors",
    coverImage: "https://cdn.akamai.steamstatic.com/steam/apps/1794680/library_600x900.jpg",
    steamUrl: "https://store.steampowered.com/app/1794680",
    price: "$4.99",
    genres: ["Action", "Roguelike", "Survival"],
    moodTags: ["energetic", "competitive", "focused", "addictive"],
    difficulty: "Normal",
    playstyleTags: ["competitive", "achiever", "focused"],
    narrativeStyle: "minimal",
    sessionSuitability: "short"
  },
  {
    id: 'elden',
    name: "Elden Ring",
    coverImage: "https://cdn.akamai.steamstatic.com/steam/apps/1245620/library_600x900.jpg",
    steamUrl: "https://store.steampowered.com/app/1245620",
    price: "$59.99",
    genres: ["RPG", "Action", "Open World"],
    moodTags: ["challenging", "immersive", "focused", "competitive"],
    difficulty: "Brutal",
    playstyleTags: ["explorer", "achiever", "competitive"],
    narrativeStyle: "moderate",
    sessionSuitability: "long"
  },
  {
    id: 'hollow',
    name: "Hollow Knight",
    coverImage: "https://cdn.akamai.steamstatic.com/steam/apps/367520/library_600x900.jpg",
    steamUrl: "https://store.steampowered.com/app/367520",
    price: "$14.99",
    genres: ["Metroidvania", "Action", "Indie"],
    moodTags: ["challenging", "focused", "immersive", "exploratory"],
    difficulty: "Hard",
    playstyleTags: ["explorer", "achiever", "focused"],
    narrativeStyle: "light",
    sessionSuitability: "medium"
  },
  {
    id: 'slay',
    name: "Slay the Spire",
    coverImage: "https://cdn.akamai.steamstatic.com/steam/apps/646570/library_600x900.jpg",
    steamUrl: "https://store.steampowered.com/app/646570",
    price: "$16.99",
    genres: ["Roguelike", "Strategy", "Card Game"],
    moodTags: ["strategic", "thoughtful", "competitive", "challenging"],
    difficulty: "Hard",
    playstyleTags: ["strategic", "competitive", "focused"],
    narrativeStyle: "minimal",
    sessionSuitability: "short"
  },
  {
    id: 'minecraft',
    name: "Minecraft",
    coverImage: "https://cdn.akamai.steamstatic.com/steam/apps/239140/library_600x900.jpg",
    steamUrl: "https://www.minecraft.net",
    price: "$29.99",
    genres: ["Sandbox", "Survival", "Creative"],
    moodTags: ["creative", "relaxed", "social", "exploratory"],
    difficulty: "Relaxed",
    playstyleTags: ["creative", "explorer", "social", "casual"],
    narrativeStyle: "minimal",
    sessionSuitability: "flexible"
  }
]

export interface RecommendationResult {
  game: typeof GAME_METADATA[0]
  explanation: string
  score: number
}

/**
 * Extract raw signals from persona snapshot for recommendation scoring
 */
function extractRawSignals(_persona: PersonaSnapshot): RawPlayerSignals {
  // Since PersonaSnapshot doesn't directly expose raw signals, we need to 
  // reconstruct them from the traits or use a different approach
  // For now, we'll create a fallback signals object based on available data
  
  // This is a simplified approach - in a real implementation, 
  // we'd want to either store the raw signals in the snapshot
  // or have a way to reconstruct them from the traits
  
  return {
    playtimeByGenre: {}, // Would need to be passed separately or stored
    averageSessionLengthMinutes: 60, // Default fallback
    sessionsPerWeek: 3, // Default fallback
    difficultyPreference: "Normal", // Default fallback
    multiplayerRatio: 0.4, // Default fallback
    lateNightRatio: 0.2, // Default fallback
    completionRate: 0.5 // Default fallback
  }
}

// Enhanced recommendation engine with RAWG API integration
export async function getRAWGEnhancedRecommendations(
  targetMood: string,
  libraryGames: Game[] = [],
  limit: number = 10
): Promise<RecommendationResult[]> {
  try {
    // Search for games with mood-relevant tags
    const moodTags = getMoodTagsForTarget(targetMood)
    console.log(`🎯 Searching RAWG for mood: ${targetMood} with tags:`, moodTags)
    
    // Get games from RAWG API
    const rawgResults = await rawgService.searchGamesByMood(moodTags, 1, limit)
    
    // Convert RAWG results to recommendation format
    const recommendations: RecommendationResult[] = []
    
    for (const rawgGame of rawgResults.results) {
      const score = calculateRAWGMoodScore(rawgGame, targetMood)
      const explanation = generateRAWGExplanation(rawgGame, targetMood, score)
      
      recommendations.push({
        game: {
          id: `rawg-${rawgGame.id}`,
          name: rawgGame.name,
          coverImage: rawgGame.background_image || '',
          steamUrl: '', // Would need Steam ID mapping
          price: "Unknown", // RAWG doesn't provide pricing
          genres: rawgGame.genres.map(g => g.name),
          moodTags: extractMoodsFromRAWGGame(rawgGame),
          difficulty: inferDifficultyFromRating(rawgGame.rating),
          playstyleTags: rawgGame.tags.slice(0, 5).map(t => t.name),
          narrativeStyle: inferNarrativeStyle(rawgGame),
          sessionSuitability: inferSessionSuitability(rawgGame)
        },
        explanation,
        score
      })
    }
    
    // Sort by score and return top results
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
    
  } catch (error) {
    console.warn('RAWG recommendation search failed, falling back to local recommendations:', error)
    return getFallbackRecommendations(targetMood, libraryGames, limit)
  }
}

// Enhanced mood-based recommendation that combines local and RAWG data
export async function getHybridRecommendations(
  personaProfile: PersonaSnapshot | null,
  libraryGames: Game[] = [],
  targetMood?: string,
  limit: number = 5
): Promise<RecommendationResult[]> {
  const recommendations: RecommendationResult[] = []
  
  // 1. Get local recommendations (existing logic)
  const localRec = getPersonalisedRecommendation(personaProfile, libraryGames)
  recommendations.push(localRec)
  
  // 2. Get RAWG-enhanced recommendations if target mood is specified
  if (targetMood) {
    try {
      const rawgRecs = await getRAWGEnhancedRecommendations(targetMood, libraryGames, limit)
      recommendations.push(...rawgRecs)
    } catch (error) {
      console.warn('RAWG recommendations failed, using only local:', error)
    }
  }
  
  // 3. Remove duplicates and sort by score
  const uniqueRecs = recommendations.filter((rec, index, self) => 
    index === self.findIndex(r => r.game.name === rec.game.name)
  )
  
  return uniqueRecs
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

// Helper functions for RAWG integration
function getMoodTagsForTarget(targetMood: string): string[] {
  const moodToTags: Record<string, string[]> = {
    'relaxing': ['relaxing', 'casual', 'peaceful', 'meditative'],
    'intense': ['intense', 'action', 'fast-paced', 'thrilling'],
    'strategic': ['strategy', 'tactical', 'turn-based', 'puzzle'],
    'creative': ['creative', 'building', 'sandbox', 'crafting'],
    'social': ['multiplayer', 'co-op', 'online', 'party'],
    'atmospheric': ['atmospheric', 'immersive', 'exploration', 'beautiful'],
    'challenging': ['difficult', 'hardcore', 'challenging', 'brutal'],
    'story-rich': ['story rich', 'narrative', 'rpg', 'adventure'],
    'nostalgic': ['retro', 'classic', 'pixel', 'old-school']
  }
  
  return moodToTags[targetMood] || ['atmospheric']
}

function calculateRAWGMoodScore(rawgGame: any, targetMood: string): number {
  let score = 50 // Base score
  
  // Genre matching
  const genres = rawgGame.genres.map((g: any) => g.name.toLowerCase())
  const genreBonus = getGenreMoodBonus(genres, targetMood)
  score += genreBonus
  
  // Tag matching
  const tags = rawgGame.tags.map((t: any) => t.name.toLowerCase())
  const tagBonus = getTagMoodBonus(tags, targetMood)
  score += tagBonus
  
  // Rating bonus (higher rated games get bonus for challenging moods)
  if (targetMood === 'challenging' && rawgGame.rating > 4.0) {
    score += 15
  }
  
  // Description keyword matching
  const description = (rawgGame.description_raw || rawgGame.description || '').toLowerCase()
  const descBonus = getDescriptionMoodBonus(description, targetMood)
  score += descBonus
  
  return Math.min(score, 100) // Cap at 100
}

function getGenreMoodBonus(genres: string[], targetMood: string): number {
  const genreMoodMap: Record<string, Record<string, number>> = {
    'relaxing': {
      'simulation': 20, 'puzzle': 15, 'casual': 25, 'indie': 10
    },
    'intense': {
      'action': 25, 'shooter': 20, 'fighting': 15, 'racing': 15
    },
    'strategic': {
      'strategy': 25, 'rpg': 15, 'puzzle': 20, 'adventure': 10
    },
    'creative': {
      'simulation': 20, 'indie': 15, 'sandbox': 25, 'adventure': 10
    },
    'social': {
      'multiplayer': 25, 'mmorpg': 20, 'party': 15, 'sports': 10
    }
  }
  
  const moodMap = genreMoodMap[targetMood]
  if (!moodMap) return 0
  
  return genres.reduce((bonus, genre) => {
    return bonus + (moodMap[genre] || 0)
  }, 0)
}

function getTagMoodBonus(tags: string[], targetMood: string): number {
  const tagMoodMap: Record<string, Record<string, number>> = {
    'relaxing': {
      'relaxing': 20, 'casual': 15, 'peaceful': 25, 'meditative': 20
    },
    'intense': {
      'intense': 25, 'action': 20, 'fast-paced': 15, 'thrilling': 15
    },
    'strategic': {
      'strategy': 25, 'tactical': 20, 'turn-based': 15, 'puzzle': 15
    },
    'creative': {
      'creative': 25, 'building': 20, 'sandbox': 20, 'crafting': 15
    },
    'social': {
      'multiplayer': 25, 'co-op': 20, 'online': 15, 'party': 15
    }
  }
  
  const moodMap = tagMoodMap[targetMood]
  if (!moodMap) return 0
  
  return tags.reduce((bonus, tag) => {
    return bonus + (moodMap[tag] || 0)
  }, 0)
}

function getDescriptionMoodBonus(description: string, targetMood: string): number {
  const moodKeywords: Record<string, string[]> = {
    'relaxing': ['relax', 'calm', 'peaceful', 'zen', 'chill'],
    'intense': ['intense', 'action', 'fast', 'thrill', 'adrenaline'],
    'strategic': ['strategy', 'tactical', 'plan', 'command', 'think'],
    'creative': ['create', 'build', 'design', 'craft', 'imagine'],
    'social': ['multiplayer', 'friends', 'team', 'community', 'online']
  }
  
  const keywords = moodKeywords[targetMood] || []
  const matches = keywords.filter(keyword => description.includes(keyword))
  
  return matches.length * 5 // 5 points per keyword match
}

function generateRAWGExplanation(rawgGame: any, targetMood: string, score: number): string {
  const reasons: string[] = []
  
  if (score > 80) {
    reasons.push(`Perfect match for your ${targetMood} mood`)
  } else if (score > 60) {
    reasons.push(`Great choice for ${targetMood} gaming`)
  } else {
    reasons.push(`Good option for ${targetMood} mood`)
  }
  
  // Add specific reasons based on game attributes
  if (rawgGame.rating > 4.0) {
    reasons.push('Highly rated by players')
  }
  
  const genres = rawgGame.genres.slice(0, 2).map((g: any) => g.name).join(' & ')
  if (genres) {
    reasons.push(`${genres} gameplay`)
  }
  
  return reasons.join(' • ')
}

function extractMoodsFromRAWGGame(rawgGame: any): string[] {
  const moods: string[] = []
  
  // Extract from genres
  rawgGame.genres.forEach((genre: any) => {
    const genreMoods = getMoodsFromGenre(genre.name.toLowerCase())
    moods.push(...genreMoods)
  })
  
  // Extract from tags
  rawgGame.tags.forEach((tag: any) => {
    const tagMoods = getMoodsFromTag(tag.name.toLowerCase())
    moods.push(...tagMoods)
  })
  
  return [...new Set(moods)].slice(0, 4)
}

function getMoodsFromGenre(genre: string): string[] {
  const genreToMood: Record<string, string[]> = {
    'action': ['intense', 'action-packed'],
    'strategy': ['strategic', 'challenging'],
    'rpg': ['story-rich', 'immersive'],
    'simulation': ['creative', 'relaxing'],
    'puzzle': ['strategic', 'mindful'],
    'adventure': ['exploratory', 'story-rich'],
    'sports': ['competitive', 'energetic'],
    'racing': ['intense', 'competitive']
  }
  
  return genreToMood[genre] || []
}

function getMoodsFromTag(tag: string): string[] {
  const tagToMood: Record<string, string> = {
    'atmospheric': 'atmospheric',
    'relaxing': 'relaxing',
    'intense': 'intense',
    'strategic': 'strategic',
    'creative': 'creative',
    'multiplayer': 'social',
    'co-op': 'social',
    'difficult': 'challenging',
    'story rich': 'story-rich'
  }
  
  const mood = tagToMood[tag]
  return mood ? [mood] : []
}

function inferDifficultyFromRating(rating: number): string {
  if (rating > 4.0) return 'Hard'
  if (rating > 3.0) return 'Normal'
  return 'Relaxed'
}

function inferNarrativeStyle(rawgGame: any): string {
  const genres = rawgGame.genres.map((g: any) => g.name.toLowerCase())
  
  if (genres.includes('rpg') || genres.includes('adventure')) return 'deep'
  if (genres.includes('puzzle') || genres.includes('strategy')) return 'moderate'
  return 'minimal'
}

function inferSessionSuitability(rawgGame: any): string {
  const genres = rawgGame.genres.map((g: any) => g.name.toLowerCase())
  
  if (genres.includes('puzzle') || genres.includes('casual')) return 'short'
  if (genres.includes('rpg') || genres.includes('strategy')) return 'long'
  return 'medium'
}

function getFallbackRecommendations(targetMood: string, libraryGames: Game[], limit: number): RecommendationResult[] {
  // Return basic recommendations from static pool
  const fallbackGame = GAME_METADATA[Math.floor(Math.random() * Math.min(3, GAME_METADATA.length))]
  
  return [{
    game: fallbackGame,
    explanation: `Based on ${targetMood} mood preferences`,
    score: 60
  }]
}

/**
 * Enhanced "What Should I Buy" Recommendation Engine
 * Uses play history, finds hidden gems, and provides diverse recommendations
 */
export function getEnhancedPurchaseRecommendations(
  personaProfile: PersonaSnapshot | null,
  libraryGames: Game[] = [],
  preferences: {
    includeHiddenGems?: boolean
    maxPopularity?: number // 0-100, lower = more hidden gems
    excludeOwned?: boolean
  } = {}
): RecommendationResult[] {
  const { includeHiddenGems = true, maxPopularity = 70, excludeOwned = true } = preferences
  
  console.log('🛒 Enhanced Purchase Recommendations - Preferences:', preferences)
  console.log('🎮 Library size:', libraryGames.length)
  
  // Get owned game IDs to exclude
  const ownedIds = new Set(libraryGames.map(g => g.id))
  
  // Get recommendations from multiple sources
  const recommendations: RecommendationResult[] = []
  
  // 1. Get RAWG games with hidden gem filtering
  const getRAWGHiddenGems = async () => {
    try {
      // Search for games with lower popularity/ratings but high quality
      const searchQueries = [
        'indie',
        'hidden gem', 
        'underrated',
        'cult classic',
        'sleeper hit'
      ]
      
      const allGames = []
      for (const query of searchQueries) {
        const response = await rawgService.searchGames(query, 20)
        allGames.push(...response.results) // Use .results property
      }
      
      // Filter and score for hidden gems
      const hiddenGems = allGames
        .filter(game => {
          // Exclude owned games
          if (excludeOwned && ownedIds.has(game.id.toString())) return false
          
          // Filter by popularity (lower ratings = more hidden)
          const rating = game.rating || 0
          const popularityScore = (rating / 5) * 100 // Convert to 0-100 scale
          
          return includeHiddenGems ? popularityScore <= maxPopularity : true
        })
        .map(game => ({
          ...game,
          hiddenGemScore: calculateHiddenGemScore(game),
          personalMatchScore: calculatePersonalMatchScore(game, personaProfile, libraryGames)
        }))
        .sort((a, b) => (b.hiddenGemScore + b.personalMatchScore) - (a.hiddenGemScore + a.personalMatchScore))
        .slice(0, 10)
      
      console.log(`💎 Found ${hiddenGems.length} hidden gems`)
      return hiddenGems.map(game => ({
        game: {
          id: game.id.toString(),
          name: game.name,
          coverImage: game.background_image, // RAWG uses background_image
          steamUrl: `https://store.steampowered.com/app/${game.id}`,
          price: "Check Store", // RAWG doesn't provide price
          genres: game.genres?.map(g => g.name) || [], // RAWG genres have name property
          moodTags: [], // Will be populated by mood assigner
          difficulty: "Normal",
          playstyleTags: [], // Will be populated by mood assigner
          narrativeStyle: "medium",
          sessionSuitability: "flexible"
        },
        explanation: generateHiddenGemExplanation(game, personaProfile),
        score: game.hiddenGemScore + game.personalMatchScore
      }))
      
    } catch (error) {
      console.error('❌ Error fetching hidden gems:', error)
      return []
    }
  }
  
  // 2. Get play-history-based recommendations
  const getPlayHistoryRecommendations = () => {
    if (!personaProfile || libraryGames.length === 0) return []
    
    const signals = extractRawSignals(personaProfile)
    const mostPlayedGenres = Object.entries(signals.playtimeByGenre)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([genre]) => genre)
    
    console.log('🎯 Most played genres:', mostPlayedGenres)
    
    // Find similar games to most played
    const similarGames = libraryGames
      .filter(game => game.genres?.some(g => mostPlayedGenres.includes(g.name)))
      .slice(0, 5)
    
    return similarGames.map(game => ({
      game: {
        id: game.id,
        name: game.title,
        coverImage: game.coverImage,
        steamUrl: game.appId ? `https://store.steampowered.com/app/${game.appId}` : '',
        price: "Owned",
        genres: game.genres?.map(g => g.name) || [],
        moodTags: game.moods || [],
        difficulty: "Normal",
        playstyleTags: game.tags || [],
        narrativeStyle: "medium",
        sessionSuitability: "flexible"
      },
      explanation: `Based on your love for ${mostPlayedGenres.join(' & ')} games`,
      score: 85
    }))
  }
  
  return [
    ...getPlayHistoryRecommendations(),
    // ...getRAWGHiddenGems() // This would be async, need to handle differently
  ]
}

// Helper functions for hidden gem scoring
function calculateHiddenGemScore(game: any): number {
  let score = 50
  
  // Lower rating = more hidden (but not too low)
  const rating = game.rating || 0
  if (rating >= 3.5 && rating <= 4.2) score += 20 // Sweet spot for hidden gems
  else if (rating < 3.5) score -= 10 // Too low quality
  
  // Lower playtime = more hidden
  const playtime = game.playtime || 0
  if (playtime < 50) score += 15
  else if (playtime > 200) score -= 15
  
  // Indie games are more likely to be hidden gems
  if (game.genres?.includes('indie')) score += 10
  
  return Math.max(0, Math.min(100, score))
}

function calculatePersonalMatchScore(game: any, personaProfile: PersonaSnapshot | null, libraryGames: Game[]): number {
  if (!personaProfile) return 30
  
  let score = 30
  
  // Genre matching
  const signals = extractRawSignals(personaProfile)
  const gameGenres = game.genres || []
  
  for (const genre of gameGenres) {
    if (signals.playtimeByGenre[genre]) {
      score += Math.min(20, signals.playtimeByGenre[genre] / 10)
    }
  }
  
  // Mood matching
  const gameMoods = game.moodTags || []
  // Use genre preferences as a proxy for mood preferences
  const preferredGenres = Object.keys(signals.playtimeByGenre)
  
  for (const mood of gameMoods) {
    // Simple mood-genre mapping for basic matching
    if ((mood === 'intense' && preferredGenres.includes('action')) ||
        (mood === 'strategic' && preferredGenres.includes('strategy')) ||
        (mood === 'creative' && preferredGenres.includes('simulation')) ||
        (mood === 'social' && signals.multiplayerRatio > 0.5)) {
      score += 10
    }
  }
  
  return Math.max(0, Math.min(100, score))
}

function generateHiddenGemExplanation(game: any, personaProfile: PersonaSnapshot | null): string {
  const reasons = []
  
  if (game.rating && game.rating >= 3.5 && game.rating <= 4.2) {
    reasons.push("critically acclaimed but underappreciated")
  }
  
  if (game.genres?.includes('indie')) {
    reasons.push("unique indie experience")
  }
  
  if (game.playtime && game.playtime < 50) {
    reasons.push("hidden gem waiting to be discovered")
  }
  
  if (personaProfile) {
    const signals = extractRawSignals(personaProfile)
    const topGenre = Object.entries(signals.playtimeByGenre)
      .sort(([,a], [,b]) => b - a)[0]?.[0]
    
    if (topGenre && game.genres?.includes(topGenre)) {
      reasons.push(`matches your love for ${topGenre} games`)
    }
  }
  
  return reasons.length > 0 
    ? reasons.join(" • ")
    : "A unique game that deserves more attention"
}
export function getPersonalisedRecommendation(
  personaProfile: PersonaSnapshot | null,
  libraryGames: Game[] = [],
  rawSignals?: RawPlayerSignals,
  refreshIndex: number = 0
): RecommendationResult {
  // Convert library games to recommendation engine format
  const gameMetadata = convertLibraryGamesToRecommendationFormat(libraryGames)
  
  // Fallback if no persona profile
  if (!personaProfile) {
    const popularGame = gameMetadata[Math.floor(Math.random() * Math.min(3, gameMetadata.length))] // Top 3 popular games or available games
    return {
      game: popularGame,
      explanation: "Based on general trends and popularity",
      score: 50
    }
  }

  // Use provided raw signals or extract from persona
  const signals = rawSignals || extractRawSignals(personaProfile)

  // Score each game based on persona factors
  const scoredGames = gameMetadata.map(game => {
    let score = 0
    const reasons: string[] = []

    // 1. Genre affinity match (30 points)
    const genreMatch = calculateGenreAffinity(game.genres, signals.playtimeByGenre)
    score += genreMatch.points
    if (genreMatch.points > 0) {
      reasons.push(genreMatch.reason)
    }

    // 2. Mood match (25 points)
    const moodMatch = calculateMoodMatch(game.moodTags, signals)
    score += moodMatch.points
    if (moodMatch.points > 0) {
      reasons.push(moodMatch.reason)
    }

    // 3. Archetype match (20 points)
    const archetypeMatch = calculateArchetypeMatch(game.playstyleTags, personaProfile.traits.archetypeId)
    score += archetypeMatch.points
    if (archetypeMatch.points > 0) {
      reasons.push(archetypeMatch.reason)
    }

    // 4. Challenge tolerance match (15 points)
    const challengeMatch = calculateChallengeMatch(game.difficulty, signals.difficultyPreference)
    score += challengeMatch.points
    if (challengeMatch.points > 0) {
      reasons.push(challengeMatch.reason)
    }

    // 5. Session pattern match (10 points)
    const sessionMatch = calculateSessionMatch(game.sessionSuitability, signals.averageSessionLengthMinutes)
    score += sessionMatch.points
    if (sessionMatch.points > 0) {
      reasons.push(sessionMatch.reason)
    }

    return {
      ...game,
      score,
      reasons
    }
  })

  // Sort by score and return different games based on refreshIndex
  scoredGames.sort((a, b) => b.score - a.score)
  
  // Use refreshIndex to get different games from the top recommendations
  const gameIndex = Math.min(refreshIndex, scoredGames.length - 1)
  const selectedGame = scoredGames[gameIndex]

  if (!selectedGame || selectedGame.score === 0) {
    // No good matches, return popular game with variety
    const fallbackIndex = refreshIndex % gameMetadata.length
    const fallbackGame = gameMetadata[fallbackIndex]
    return {
      game: fallbackGame,
      explanation: "Based on general trends and popularity",
      score: 50
    }
  }

  // Generate explanation from reasons
  const explanation = selectedGame.reasons.length > 0 
    ? selectedGame.reasons.slice(0, 3).join(" • ")
    : "This game matches your gaming preferences"

  return {
    game: {
      id: selectedGame.id,
      name: selectedGame.name,
      coverImage: selectedGame.coverImage,
      steamUrl: selectedGame.steamUrl,
      price: selectedGame.price,
      genres: selectedGame.genres,
      moodTags: selectedGame.moodTags,
      difficulty: selectedGame.difficulty,
      playstyleTags: selectedGame.playstyleTags,
      narrativeStyle: selectedGame.narrativeStyle,
      sessionSuitability: selectedGame.sessionSuitability
    },
    explanation,
    score: selectedGame.score
  }
}

// Scoring helper functions
function calculateGenreAffinity(gameGenres: string[], playtimeByGenre: Record<string, number>) {
  let points = 0
  let bestMatch = ""

  gameGenres.forEach(genre => {
    if (!genre) return;
    const normalizedGenre = genre.toLowerCase()
    if (playtimeByGenre[normalizedGenre]) {
      const playtime = playtimeByGenre[normalizedGenre]
      if (playtime > 50) {
        points += 30
        bestMatch = genre
      } else if (playtime > 20) {
        points += 20
        bestMatch = genre
      } else if (playtime > 5) {
        points += 10
        bestMatch = genre
      }
    }
  })

  return {
    points,
    reason: points > 0 ? `You love ${bestMatch} games` : ""
  }
}

function calculateMoodMatch(gameMoods: string[], signals: RawPlayerSignals) {
  let points = 0
  let reason = ""

  // Match based on play patterns
  if (gameMoods.includes("energetic") && signals.sessionsPerWeek > 5) {
    points += 15
    reason = "Matches your energetic gaming style"
  }
  
  if (gameMoods.includes("relaxed") && signals.sessionsPerWeek <= 3) {
    points += 15
    reason = "Perfect for your relaxed gaming pace"
  }

  if (gameMoods.includes("focused") && signals.averageSessionLengthMinutes > 90) {
    points += 10
    reason = "Great for your focused gaming sessions"
  }

  if (gameMoods.includes("social") && signals.multiplayerRatio > 0.5) {
    points += 10
    reason = "Matches your social gaming preferences"
  }

  return { points, reason }
}

function calculateArchetypeMatch(gamePlaystyles: string[], archetypeId: string) {
  let points = 0
  let reason = ""

  // Match playstyles with archetype
  if (archetypeId === "Specialist" && gamePlaystyles.includes("achiever")) {
    points += 20
    reason = "Perfect for your achievement-oriented playstyle"
  }

  if (archetypeId === "Socialite" && gamePlaystyles.includes("social")) {
    points += 20
    reason = "Great for your social gaming preferences"
  }

  if (archetypeId === "Casual" && gamePlaystyles.includes("casual")) {
    points += 15
    reason = "Matches your casual gaming style"
  }

  return { points, reason }
}

function calculateChallengeMatch(gameDifficulty: string, personaDifficulty: string) {
  const difficultyLevels = ["Relaxed", "Normal", "Hard", "Brutal"]
  const gameIndex = difficultyLevels.indexOf(gameDifficulty)
  const personaIndex = difficultyLevels.indexOf(personaDifficulty)

  const difference = Math.abs(gameIndex - personaIndex)
  
  if (difference === 0) {
    return { points: 15, reason: "Perfect difficulty match for your skill level" }
  } else if (difference === 1) {
    return { points: 8, reason: "Good difficulty match for you" }
  } else {
    return { points: 0, reason: "" }
  }
}

function calculateSessionMatch(gameSession: string, averageMinutes: number) {
  let points = 0
  let reason = ""

  if (gameSession === "short" && averageMinutes <= 60) {
    points = 10
    reason = "Perfect for your quick gaming sessions"
  } else if (gameSession === "medium" && averageMinutes > 60 && averageMinutes <= 120) {
    points = 10
    reason = "Great for your medium gaming sessions"
  } else if (gameSession === "long" && averageMinutes > 120) {
    points = 10
    reason = "Perfect for your long gaming sessions"
  } else if (gameSession === "flexible") {
    points = 5
    reason = "Flexible gaming that fits your schedule"
  }

  return { points, reason }
}
