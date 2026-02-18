// MOOD TO GENRE MAPPINGS
// Maps each mood to its most relevant genres for better filtering

export const MOOD_TO_GENRE_MAPPING: Record<string, string[]> = {
  'intense': ['action', 'fps', 'fighting', 'racing'],
  'strategic': ['strategy', 'puzzle', 'simulation', 'rts'],
  'relaxing': ['casual', 'simulation', 'puzzle', 'adventure'],
  'creative': ['sandbox', 'building', 'rpg', 'indie'],
  'high-energy': ['action', 'sports', 'racing', 'arcade'],
  'atmospheric': ['adventure', 'horror', 'mystery', 'indie'],
  'challenging': ['roguelike', 'platformer', 'strategy', 'rpg'],
  'story-rich': ['rpg', 'adventure', 'visual-novel', 'narrative'],
  'competitive': ['multiplayer', 'fps', 'moba', 'fighting'],
  'social': ['multiplayer', 'co-op', 'mmorpg', 'party'],
  'experimental': ['indie', 'art', 'simulation', 'puzzle'],
  'mindful': ['puzzle', 'simulation', 'zen', 'meditation'],
  'nostalgic': ['retro', 'classic', 'arcade', 'remake'],
  'gritty': ['action', 'horror', 'survival', 'crime'],
  'surreal': ['indie', 'art', 'puzzle', 'adventure'],
  'action-packed': ['action', 'shooter', 'adventure', 'combat']
};

// REFINED GAME MOOD ASSIGNMENTS
// More specific mood assignments to reduce overlap

export const REFINED_GAME_MOODS: Record<string, string[]> = {
  // Strategy games should primarily be 'strategic', not also 'intense' and 'challenging'
  'Stronghold Crusader': ['strategic'],
  'Civilization': ['strategic'],
  'StarCraft': ['strategic', 'competitive'],
  
  // Action games can be 'intense' or 'action-packed' but not both
  'DOOM': ['intense'],
  'Call of Duty': ['action-packed'],
  'Halo': ['action-packed'],
  
  // Relaxing games
  'Stardew Valley': ['relaxing', 'creative'],
  'Animal Crossing': ['relaxing', 'social'],
  'Minecraft': ['creative', 'relaxing'],
  
  // Challenging games
  'Dark Souls': ['challenging'],
  'Celeste': ['challenging'],
  'Hollow Knight': ['challenging'],
  
  // Add more as needed...
};

// Helper function to get refined moods for a game
export function getRefinedMoods(gameTitle: string, existingMoods: string[]): string[] {
  // Check if we have a specific mood assignment for this game
  const refinedMoods = REFINED_GAME_MOODS[gameTitle];
  if (refinedMoods) {
    return refinedMoods;
  }
  
  // Otherwise, return the most dominant mood (first one) to reduce overlap
  return existingMoods.length > 0 ? [existingMoods[0]] : ['relaxing'];
}
