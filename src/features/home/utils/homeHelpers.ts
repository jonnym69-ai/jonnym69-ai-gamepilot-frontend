import type { Game } from '@gamepilot/types'

// Helper function to get weighted random game for "Surprise Me"
export const getWeightedRandomGame = (games: Game[]): Game | null => {
  if (games.length === 0) return null

  const now = Date.now()
  const weights = games.map(game => {
    let weight = 1 // Base weight

    // Prefer games not played recently
    if (game.lastLocalPlayedAt) {
      const daysSinceLastPlayed = (now - new Date(game.lastLocalPlayedAt).getTime()) / (1000 * 60 * 60 * 24)
      weight += daysSinceLastPlayed * 2 // More weight for longer time since last play
    }

    // Prefer games with low session count
    const sessionCount = game.localSessionCount || 0
    if (sessionCount === 0) {
      weight += 10 // Strong preference for unplayed games
    } else if (sessionCount < 5) {
      weight += 5 // Moderate preference for rarely played games
    }

    // Slight preference for games with decent playtime but not completed
    const hoursPlayed = game.hoursPlayed || 0
    if (hoursPlayed > 1 && hoursPlayed < 20 && game.playStatus !== 'completed') {
      weight += 3
    }

    return { game, weight }
  })

  // Weighted random selection
  const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0)
  let random = Math.random() * totalWeight
  
  for (const { game, weight } of weights) {
    random -= weight
    if (random <= 0) {
      return game
    }
  }

  return weights[0].game // Fallback
}

// Helper function to get recently played games
export const getRecentlyPlayedGames = (games: Game[], limit: number = 8): Game[] => {
  return games
    .filter(game => game.lastLocalPlayedAt || game.lastPlayed)
    .sort((a, b) => {
      const dateA = new Date(a.lastLocalPlayedAt || a.lastPlayed || 0)
      const dateB = new Date(b.lastLocalPlayedAt || b.lastPlayed || 0)
      return dateB.getTime() - dateA.getTime()
    })
    .slice(0, limit)
}

// Mock store recommendations for "What Should I Buy?"
export interface StoreRecommendation {
  id: string
  title: string
  genre: string
  description: string
  reason: string
  image: string
  price?: string
  rating?: number
}

export const getMockStoreRecommendations = (userGames: Game[]): StoreRecommendation[] => {
  // Analyze user's library
  const userGenres = userGames.flatMap(game => game.genres?.map(g => g.name) || [])
  const genreCounts = userGenres.reduce((acc, genre) => {
    acc[genre] = (acc[genre] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const favoriteGenres = Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([genre]) => genre)

  // Mock recommendations based on user preferences
  const recommendations: StoreRecommendation[] = [
    {
      id: 'rec-1',
      title: 'Baldur\'s Gate 3',
      genre: 'RPG',
      description: 'Epic party-based RPG with deep storytelling and tactical combat.',
      reason: `Because you like ${favoriteGenres[0] || 'RPG'} games`,
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg',
      price: '$59.99',
      rating: 4.8
    },
    {
      id: 'rec-2',
      title: 'Hades',
      genre: 'Roguelike',
      description: 'Fast-paced action roguelike with beautiful art and compelling story.',
      reason: `Because you enjoy ${favoriteGenres[1] || 'action'} games`,
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/header.jpg',
      price: '$24.99',
      rating: 4.7
    },
    {
      id: 'rec-3',
      title: 'Stardew Valley',
      genre: 'Simulation',
      description: 'Charming farming simulation with deep gameplay and community.',
      reason: `Based on your interest in ${favoriteGenres[2] || 'relaxing'} games`,
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg',
      price: '$14.99',
      rating: 4.6
    },
    {
      id: 'rec-4',
      title: 'Disco Elysium',
      genre: 'RPG',
      description: 'Revolutionary detective RPG with unique dialogue system.',
      reason: 'Perfect match for your story-rich preferences',
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/632470/header.jpg',
      price: '$39.99',
      rating: 4.9
    },
    {
      id: 'rec-5',
      title: 'Celeste',
      genre: 'Platformer',
      description: 'Challenging platformer with beautiful pixel art and emotional story.',
      reason: 'Great for quick, satisfying gaming sessions',
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/504230/header.jpg',
      price: '$19.99',
      rating: 4.5
    }
  ]

  return recommendations.slice(0, 5) // Return top 5 recommendations
}
