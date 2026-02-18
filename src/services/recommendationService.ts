import type { Game } from '@gamepilot/types'

export interface RecommendationScore {
  gameId: string
  totalScore: number
  breakdown: {
    moodMatch: number
    genreFit: number
    timeAlignment: number
    descriptionMatch: number
  }
  reasoning: RecommendationReasoning
}

export interface RecommendationReasoning {
  primary: string
  secondary: string[]
  confidence: 'high' | 'medium' | 'low'
  timeFit: string
  moodAlignment: string
}

export interface RecommendationParams {
  mood: string
  timeBucket: 'short' | 'medium' | 'long'
  games: Game[]
}

class RecommendationService {
  private static instance: RecommendationService
  
  public static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService()
    }
    return RecommendationService.instance
  }

  constructor() {
    console.log('🧠 RecommendationService aligned with 16 Locked Moods')
  }

  private getConfidence(total: number): RecommendationReasoning['confidence'] {
    if (total >= 75) return 'high'
    if (total >= 45) return 'medium'
    return 'low'
  }

  private buildReasoning(params: {
    totalScore: number
    mood: string
    timeBucket: 'short' | 'medium' | 'long'
  }): RecommendationReasoning {
    const confidence = this.getConfidence(params.totalScore)

    const primaryByConfidence: Record<typeof confidence, string> = {
      high: '🎯 Perfect match for your current mood',
      medium: '🎮 Good fit for how you\'re feeling',
      low: '🤔 Worth considering for today',
    }

    const moodAlignmentByMood: Record<string, string> = {
      'intense': '🔥 High-stakes action to get your heart racing',
      'strategic': '🧠 Deep tactical gameplay for your analytical side',
      'relaxing': '🌿 A peaceful escape to help you unwind',
      'creative': '🎨 Tools and worlds to express your imagination',
      'high-energy': '⚡ Fast-paced excitement and adrenaline',
      'atmospheric': '🌌 Immersive worlds with incredible vibes',
      'challenging': '🏔️ A rewarding test of your genuine skill',
      'story-rich': '📖 A deep narrative that will stick with you',
      'competitive': '⚔️ Sharpen your edge against the competition',
      'social': '👥 Great for connecting and playing together',
      'experimental': '🧪 Something unique and outside the box',
      'mindful': '🧘 Thoughtful gameplay for a focused state',
      'nostalgic': '🕹️ Classic feels and timeless charm',
      'gritty': '💀 Raw, grounded, and uncompromising',
      'surreal': '🌀 A trip through the weird and wonderful',
      'action-packed': '💥 Non-stop thrills from start to finish',
      'default': '🎮 Solid match for your current vibe',
    }

    const timeFitByBucket: Record<typeof params.timeBucket, string> = {
      short: '⏱️ Perfect for a quick gaming window',
      medium: '⏰ Great for a focused session where you still make progress',
      long: '🕒 Ideal for a longer, more immersive session',
    }

    return {
      primary: primaryByConfidence[confidence],
      secondary: [
        moodAlignmentByMood[params.mood] ?? moodAlignmentByMood.default,
        timeFitByBucket[params.timeBucket],
      ],
      confidence,
      timeFit: timeFitByBucket[params.timeBucket],
      moodAlignment: moodAlignmentByMood[params.mood] ?? moodAlignmentByMood.default,
    }
  }

  private calculateMoodMatch(game: Game, userMood: string): number {
    const gameMoods = (game.moods || []).map(m => (m || '').toLowerCase())
    const target = (userMood || '').toLowerCase()
    
    if (!target) return 5
    if (gameMoods.includes(target)) return 40
    
    const moodCompatibility: Record<string, string[]> = {
      'intense': ['action-packed', 'high-energy', 'gritty', 'challenging'],
      'relaxing': ['mindful', 'creative', 'atmospheric'],
      'strategic': ['challenging', 'experimental', 'mindful'],
      'story-rich': ['atmospheric', 'nostalgic', 'surreal'],
      'social': ['competitive', 'high-energy'],
      'action-packed': ['intense', 'high-energy', 'competitive']
    }
    
    const compatible = moodCompatibility[target] || []
    if (gameMoods.some(m => compatible.includes(m))) return 25
    
    return 5
  }

  private calculateGenreFit(game: Game, userMood: string): number {
    // FIX: Added safe checks for genre objects to prevent toLowerCase() crashes
    const gameGenres = game.genres?.map((g: any) => {
        if (typeof g === 'string') return g.toLowerCase();
        return (g?.id || g?.name || '').toString().toLowerCase();
    }).filter(Boolean) || []
    
    const moodGenrePreferences: Record<string, Record<string, number>> = {
      'intense': { 'action': 30, 'fps': 30, 'roguelike': 25 },
      'strategic': { 'strategy': 30, 'puzzle': 25, 'simulation': 20 },
      'relaxing': { 'casual': 30, 'simulation': 25, 'adventure': 20 },
      'story-rich': { 'rpg': 30, 'adventure': 30, 'indie': 20 },
      'competitive': { 'multiplayer': 30, 'sports': 25, 'racing': 25 },
      'creative': { 'simulation': 30, 'indie': 25 }
    }
    
    const targetMood = (userMood || '').toLowerCase();
    const preferences = moodGenrePreferences[targetMood] || {}
    const scores = gameGenres.map(genre => preferences[genre] || 10)
    
    return scores.length > 0 ? Math.max(...scores) : 10
  }

  private calculateTimeAlignment(game: Game, timeBucket: 'short' | 'medium' | 'long'): number {
    const sessionTime = (game as any).sessionTime || (game as any).averageSessionTime || '60'
    const minutes = parseInt(sessionTime.toString().replace(/\D/g, '')) || 60
    
    if (timeBucket === 'short' && minutes <= 30) return 20
    if (timeBucket === 'medium' && minutes > 30 && minutes <= 90) return 20
    if (timeBucket === 'long' && minutes > 90) return 20
    
    return 10
  }

  private calculateDescriptionMatch(game: Game, userMood: string): number {
    const text = `${game.title || ''} ${game.description || ''} ${(game as any).steamData?.short_description || ''}`.toLowerCase()
    const targetMood = (userMood || '').toLowerCase()

    const moodKeywords: Record<string, string[]> = {
      'intense': ['fast', 'hardcore', 'combat', 'survival', 'brutal'],
      'relaxing': ['chill', 'peaceful', 'calm', 'relax', 'cozy'],
      'strategic': ['tactical', 'plan', 'think', 'turn-based', 'logic'],
      'story-rich': ['narrative', 'dialogue', 'choices', 'characters', 'lore'],
      'atmospheric': ['immersive', 'beautiful', 'vibe', 'scary', 'dark'],
      'challenging': ['difficult', 'mastery', 'skill', 'souls-like', 'hard']
    }
    
    const keywords = moodKeywords[targetMood] || []
    const matches = keywords.filter(word => text.includes(word)).length
    
    return Math.min(matches * 3, 10)
  }

  generateRecommendations(params: RecommendationParams): RecommendationScore[] {
    if (!params.games || params.games.length === 0) return []
    // Safety check for mood
    const safeMood = params.mood || 'relaxing';

    const scores = params.games.map(game => {
      const moodMatch = this.calculateMoodMatch(game, safeMood)
      const genreFit = this.calculateGenreFit(game, safeMood)
      const timeAlignment = this.calculateTimeAlignment(game, params.timeBucket)
      const descriptionMatch = this.calculateDescriptionMatch(game, safeMood)
      
      const totalScore = moodMatch + genreFit + timeAlignment + descriptionMatch
      
      return {
        gameId: game.id,
        totalScore,
        breakdown: { moodMatch, genreFit, timeAlignment, descriptionMatch },
        reasoning: this.buildReasoning({
          totalScore,
          mood: safeMood.toLowerCase(),
          timeBucket: params.timeBucket
        })
      }
    })
    
    return scores.sort((a, b) => b.totalScore - a.totalScore)
  }

  getTopRecommendations(params: RecommendationParams, limit: number = 10): RecommendationScore[] {
    return this.generateRecommendations(params).slice(0, limit)
  }
}

export const recommendationService = RecommendationService.getInstance()