// MASTER MOODS - 8 broad categories for better UX

export const MASTER_MOODS = [
  {
    id: 'adrenaline',
    name: 'Adrenaline',
    emoji: '⚡',
    description: 'High-energy action and competition',
    subMoods: ['intense', 'competitive', 'high-energy', 'action-packed']
  },
  {
    id: 'brain-power',
    name: 'Brain Power',
    emoji: '🧠',
    description: 'Strategic thinking and complex challenges',
    subMoods: ['strategic', 'challenging', 'mindful']
  },
  {
    id: 'zen',
    name: 'Zen',
    emoji: '🧘',
    description: 'Relaxed and peaceful experiences',
    subMoods: ['relaxing', 'atmospheric', 'mindful']
  },
  {
    id: 'story',
    name: 'Story',
    emoji: '📚',
    description: 'Narrative and immersive adventures',
    subMoods: ['story-rich', 'atmospheric', 'challenging']
  },
  {
    id: 'social',
    name: 'Social',
    emoji: '👥',
    description: 'Multiplayer and cooperative play',
    subMoods: ['social', 'competitive', 'cooperative']
  },
  {
    id: 'creative',
    name: 'Creative',
    emoji: '🎨',
    description: 'Building, crafting, and artistic expression',
    subMoods: ['creative', 'experimental', 'artistic']
  },
  {
    id: 'nostalgic',
    name: 'Nostalgic',
    emoji: '🕹',
    description: 'Classic games and retro memories',
    subMoods: ['nostalgic', 'retro']
  },
  {
    id: 'scary',
    name: 'Scary',
    emoji: '👻',
    description: 'Terrifying and suspenseful experiences',
    subMoods: ['horror', 'scary', 'terrifying']
  }
];

// Map each specific mood to its master mood
export const MOOD_TO_MASTER_MAP: Record<string, string> = {
  // Adrenaline sub-moods
  'intense': 'adrenaline',
  'competitive': 'adrenaline',
  'high-energy': 'adrenaline',
  'action-packed': 'adrenaline',
  
  // Brain Power sub-moods
  'strategic': 'brain-power',
  'challenging': 'brain-power',
  'mindful': 'brain-power',
  
  // Zen sub-moods
  'relaxing': 'zen',
  'atmospheric': 'zen',
  
  // Story sub-moods
  'story-rich': 'story',
  
  // Social sub-moods
  'social': 'social',
  'cooperative': 'social',
  
  // Creative sub-moods
  'creative': 'creative',
  'experimental': 'creative',
  'artistic': 'creative',
  
  // Nostalgic sub-moods
  'nostalgic': 'nostalgic',
  'retro': 'nostalgic',

  // Scary sub-moods
  'horror': 'scary',
  'scary': 'scary',
  'terrifying': 'scary'
};

// Helper function to get master mood for a specific mood
export function getMasterMood(specificMood: string): string {
  return MOOD_TO_MASTER_MAP[specificMood] || specificMood;
}
