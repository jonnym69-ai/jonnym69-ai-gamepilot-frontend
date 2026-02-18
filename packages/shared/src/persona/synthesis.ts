// Persona Synthesis Layer
// Functions for building persona signals and traits from raw data

import type { IdentityCore } from './identityCore'

/**
 * Build persona signals from raw Steam data
 * Real computation logic for persona signal generation
 */
export function buildPersonaSignals(raw: IdentityCore["raw"]): IdentityCore["signals"] {
  const { games, sessions } = raw.steam
  
  // Calculate genre affinity based on playtime
  const genreAffinity: Record<string, number> = {}
  games.forEach(game => {
    const playtime = game.hoursPlayed || game.totalPlaytime || 1
    if (game.genres && Array.isArray(game.genres)) {
      game.genres.forEach(genre => {
        const genreName = typeof genre === 'string' ? genre : genre.name
        if (genreName) {
          genreAffinity[genreName] = (genreAffinity[genreName] || 0) + playtime
        }
      })
    }
  })

  // Calculate completion rate from achievements
  const achievementCounts = games.map(game => game.achievements?.total || 0).filter(count => count > 0)
  const completedAchievements = games.filter(game => (game.achievements?.unlocked || 0) > 0).length
  const totalAchievements = achievementCounts.reduce((sum, count) => sum + count, 0)
  const completionRate = totalAchievements > 0 ? completedAchievements / games.length : 0

  // Calculate session pattern (average session length)
  const sessionPattern = sessions.length > 0 
    ? sessions.reduce((sum, session) => sum + session.duration, 0) / sessions.length 
    : 0

  // Calculate playtime distribution (sorted descending)
  const playtimeValues = games.map(game => game.hoursPlayed || game.totalPlaytime || 0).sort((a, b) => b - a)

  // Calculate multiplayer ratio
  const multiplayerGames = games.filter(game => 
    game.emotionalTags && game.emotionalTags.some((tag: any) => 
      typeof tag === 'string' ? tag.toLowerCase().includes('multiplayer') : 
      tag.name?.toLowerCase().includes('multiplayer') || false
    )
  ).length
  const multiplayerRatio = games.length > 0 ? multiplayerGames / games.length : 0

  return {
    genreAffinity,
    completionRate,
    sessionPattern,
    playtimeDistribution: playtimeValues,
    multiplayerRatio
  }
}

/**
 * Build persona traits from computed signals
 * Real scoring logic for personality trait computation
 */
export function buildPersonaTraits(signals: IdentityCore["signals"]): IdentityCore["traits"] {
  const { genreAffinity, completionRate, sessionPattern, playtimeDistribution, multiplayerRatio } = signals
  
  // Explorer: High when many genres with small-to-medium values
  const numberOfGenresPlayed = Object.keys(genreAffinity).length
  const explorer = Math.min(numberOfGenresPlayed / 10, 1)
  
  // Specialist: High when dominated by 1-2 genres
  const genreValues = Object.values(genreAffinity)
  const totalPlaytime = genreValues.reduce((sum, value) => sum + value, 0)
  const topGenrePlaytime = genreValues.length > 0 ? Math.max(...genreValues) : 0
  const specialist = totalPlaytime > 0 ? topGenrePlaytime / totalPlaytime : 0
  
  // Competitor: High when multiplayer ratio is high
  const competitor = Math.max(0, Math.min(multiplayerRatio, 1))
  
  // Completionist: High when completion rate is high
  const completionist = Math.max(0, Math.min(completionRate, 1))
  
  // Strategist: High when average session length is long (3 hours = max)
  const strategist = Math.max(0, Math.min(sessionPattern / 180, 1))
  
  // Adventurer: High when playtime distribution shows long-tail exploration
  const lowPlaytimeThreshold = 5 // 5 hours or less considered "low playtime"
  const numberOfGamesWithLowPlaytime = playtimeDistribution.filter(playtime => playtime <= lowPlaytimeThreshold).length
  const totalGames = playtimeDistribution.length
  const adventurer = totalGames > 0 ? numberOfGamesWithLowPlaytime / totalGames : 0
  
  return {
    explorer: Math.max(0, Math.min(explorer, 1)),
    specialist: Math.max(0, Math.min(specialist, 1)),
    competitor: Math.max(0, Math.min(competitor, 1)),
    completionist: Math.max(0, Math.min(completionist, 1)),
    strategist: Math.max(0, Math.min(strategist, 1)),
    adventurer: Math.max(0, Math.min(adventurer, 1))
  }
}
