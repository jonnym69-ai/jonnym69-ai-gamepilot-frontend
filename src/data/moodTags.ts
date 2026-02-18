import type { Mood } from '../types/mood'

// Static mapping of Steam genres to moods
export const GENRE_TO_MOOD_MAPPING: Record<string, Mood[]> = {
  // Action & Fast-Paced
  'Action': ['Fast-Paced' as Mood],
  'Adventure': ['Story'],
  'FPS': ['Fast-Paced' as Mood, 'Competitive'],
  'Shooter': ['Fast-Paced' as Mood, 'Competitive'],
  'Fighting': ['Competitive', 'Fast-Paced' as Mood],
  'Platformer': ['Fast-Paced' as Mood],
  'Hack and Slash': ['Fast-Paced' as Mood],
  'Beat em up': ['Fast-Paced' as Mood],
  
  // RPG & Story
  'RPG': ['Story'],
  'JRPG': ['Story'],
  'CRPG': ['Story'],
  'Action RPG': ['Story', 'Fast-Paced' as Mood],
  'Roguelike': ['Fast-Paced' as Mood],
  'Roguelite': ['Fast-Paced' as Mood],
  'Dungeon Crawler': ['Story'],
  'Open World': ['Story'],
  
  // Strategy & Competitive
  'Strategy': ['Competitive'],
  'Turn-Based Strategy': ['Competitive'],
  'Real-Time Strategy': ['Competitive', 'Fast-Paced' as Mood],
  '4X': ['Competitive'],
  'Grand Strategy': ['Competitive'],
  'Tower Defense': ['Competitive'],
  'Wargame': ['Competitive'],
  
  // Simulation & Chill
  'Simulation': ['Chill'],
  'Life Sim': ['Chill', 'Creative'],
  'Farming Sim': ['Chill', 'Creative'],
  'City Builder': ['Creative', 'Chill'],
  'Management': ['Creative'],
  'Tycoon': ['Creative'],
  'Vehicle Sim': ['Chill'],
  
  // Creative
  'Indie': ['Creative'],
  'Puzzle': ['Creative'],
  'Point & Click': ['Story', 'Creative'],
  'Visual Novel': ['Story'],
  'Adventure Game': ['Story', 'Creative'],
  'Sandbox': ['Creative'],
  'Building': ['Creative'],
  
  // Social
  'Multiplayer': ['Social'],
  'Co-op': ['Social'],
  'MMO': ['Social', 'Competitive'],
  'Party': ['Social'],
  'Family': ['Social'],
  'Casual': ['Chill', 'Social'],
  
  // Dark
  'Horror': ['Dark'],
  'Survival Horror': ['Dark'],
  'Psychological Horror': ['Dark'],
  'Gore': ['Dark'],
  'Dark Fantasy': ['Dark'],
  'Thriller': ['Dark'],
  
  // Sports & Competitive
  'Sports': ['Competitive'],
  'Racing': ['Competitive', 'Fast-Paced' as Mood],
  'Football': ['Competitive'],
  'Basketball': ['Competitive'],
  'Soccer': ['Competitive'],
  
  // Mixed categories
  'Card Game': ['Competitive', 'Creative'],
  'Board Game': ['Competitive', 'Social'],
  'Educational': ['Creative'],
  'Music': ['Creative', 'Chill'],
  'Rhythm': ['Fast-Paced' as Mood, 'Creative']
}

// Helper function to get moods for a genre
export function getMoodsForGenre(genre: string): Mood[] {
  return GENRE_TO_MOOD_MAPPING[genre] || []
}

// Helper function to get all moods for multiple genres
export function getMoodsForGenres(genres: string[]): Mood[] {
  const allMoods: Mood[] = []
  
  genres.forEach(genre => {
    const moods = getMoodsForGenre(genre)
    moods.forEach(mood => {
      if (!allMoods.includes(mood)) {
        allMoods.push(mood)
      }
    })
  })
  
  return allMoods
}
