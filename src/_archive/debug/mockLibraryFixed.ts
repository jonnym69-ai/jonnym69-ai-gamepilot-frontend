import type { Game, PlayStatus } from '@gamepilot/types'

/**
 * Fixed synthetic game library for persona stress-testing
 * Uses proper mood names that match MOODS data
 */
export const mockLibraryGames: Game[] = [
  // Soulslike - High Difficulty, Single Player
  {
    id: 'dark-souls-remastered',
    title: 'Dark Souls Remastered',
    description: 'The acclaimed dark fantasy action RPG returns. Master brutal combat and intricate level design.',
    coverImage: 'https://via.placeholder.com/300x400/8B0000/FFFFFF?text=Dark+Souls',
    releaseDate: new Date('2018-05-25'),
    developer: 'FromSoftware',
    publisher: 'Bandai Namco Entertainment',
    genres: ['action', 'rpg'] as any,
    moods: ['competitive'],
    platforms: [{ id: 'steam', name: 'Steam', code: 'steam' as any, isConnected: true }],
    emotionalTags: ['Competitive', 'Focused'] as any,
    tags: ['soulslike', 'dark-fantasy'],
    playStatus: 'completed' as PlayStatus,
    hoursPlayed: 127,
    lastPlayed: new Date('2024-01-15'),
    addedAt: new Date('2023-06-10'),
    isFavorite: true,
    releaseYear: 2018,
    achievements: { unlocked: 42, total: 43 }
  },

  // Roguelike - High Difficulty, Single Player
  {
    id: 'hades',
    title: 'Hades',
    description: 'Defy the god of the dead as you hack and slash out of the Underworld in this rogue-like dungeon crawler.',
    coverImage: 'https://via.placeholder.com/300x400/8B4513/FFFFFF?text=Hades',
    releaseDate: new Date('2020-09-17'),
    developer: 'Supergiant Games',
    publisher: 'Supergiant Games',
    genres: ['action', 'roguelike'] as any,
    moods: ['competitive'],
    platforms: [{ id: 'steam', name: 'Steam', code: 'steam' as any, isConnected: true }],
    emotionalTags: ['Competitive', 'Energetic'] as any,
    tags: ['roguelike', 'procedural'],
    playStatus: 'playing' as PlayStatus,
    hoursPlayed: 89,
    lastPlayed: new Date('2024-01-20'),
    addedAt: new Date('2023-08-15'),
    isFavorite: true,
    releaseYear: 2020,
    achievements: { unlocked: 38, total: 50 }
  },

  // Casual Puzzle - Low Difficulty, Single Player
  {
    id: 'portal-2',
    title: 'Portal 2',
    description: 'The highly anticipated sequel to 2007\'s Game of the Year, Portal 2 is a hilariously mind-bending adventure.',
    coverImage: 'https://via.placeholder.com/300x400/FF6B35/FFFFFF?text=Portal+2',
    releaseDate: new Date('2011-04-19'),
    developer: 'Valve',
    publisher: 'Valve',
    genres: ['puzzle', 'platformer'] as any,
    moods: ['chill'],
    platforms: [{ id: 'steam', name: 'Steam', code: 'steam' as any, isConnected: true }],
    emotionalTags: ['Chill', 'Creative'] as any,
    tags: ['physics-puzzle', 'comedy'],
    playStatus: 'completed' as PlayStatus,
    hoursPlayed: 12,
    lastPlayed: new Date('2023-12-01'),
    addedAt: new Date('2023-05-20'),
    isFavorite: false,
    releaseYear: 2011,
    achievements: { unlocked: 50, total: 50 }
  }
]
