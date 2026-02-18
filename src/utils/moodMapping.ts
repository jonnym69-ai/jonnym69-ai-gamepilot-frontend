import { MoodId } from '@gamepilot/static-data';

/**
 * Simple mood mapping utility for GameCard component
 * Maps game data to mood information for display
 */

export function deriveMoodFromGame(game: any): MoodId {
  if (!game) return 'chill' as MoodId;
  
  // Check for mood in game object
  if (game.mood && typeof game.mood === 'string') {
    const moodStr = game.mood.toLowerCase();
    if (['chill', 'competitive', 'story', 'creative', 'social', 'focused', 'energetic', 'exploratory'].includes(moodStr)) {
      return moodStr as MoodId;
    }
  }
  
  // Check for moods array
  if (game.moods && Array.isArray(game.moods)) {
    const validMoods = game.moods.filter((mood: any) => 
      typeof mood === 'string' && 
      ['chill', 'competitive', 'story', 'creative', 'social', 'focused', 'energetic', 'exploratory'].includes(mood.toLowerCase())
    );
    
    if (validMoods.length > 0) {
      return validMoods[0] as MoodId;
    }
  }
  
  // Default fallback
  return 'chill' as MoodId;
}
