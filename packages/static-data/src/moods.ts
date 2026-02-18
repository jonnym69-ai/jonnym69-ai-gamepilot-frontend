export interface Mood {
  id: string
  name: string
  description: string
  emoji: string
  icon: string // Required icon property
  color: string // Tailwind gradient class
  intensity: number // Numeric intensity for compatibility
  associatedGenres: string[]
}

export const MOODS: readonly Mood[] = [
  {
    id: 'Intense',
    name: 'Intense',
    description: 'High-pressure, competitive, fast-paced gameplay',
    emoji: '🔥',
    icon: '⚡',
    color: 'from-red-500 to-orange-600',
    intensity: 9,
    associatedGenres: ['action', 'fps', 'multiplayer']
  },
  {
    id: 'Strategic',
    name: 'Strategic',
    description: 'Requires planning, tactics, careful decision-making',
    emoji: '🧠',
    icon: '♟️',
    color: 'from-blue-500 to-indigo-600',
    intensity: 7,
    associatedGenres: ['strategy', 'puzzle', 'rpg']
  },
  {
    id: 'Relaxing',
    name: 'Relaxing',
    description: 'Low-stress, peaceful, zen-like gameplay',
    emoji: '😌',
    icon: '🌊',
    color: 'from-blue-400 to-cyan-500',
    intensity: 2,
    associatedGenres: ['casual', 'simulation', 'puzzle']
  },
  {
    id: 'Creative',
    name: 'Creative',
    description: 'Building, crafting, expression, customization',
    emoji: '🎨',
    icon: '🎭',
    color: 'from-green-500 to-emerald-600',
    intensity: 6,
    associatedGenres: ['simulation', 'casual', 'puzzle']
  },
  {
    id: 'High-Energy',
    name: 'High-Energy',
    description: 'Action-packed, exciting, adrenaline-fueled',
    emoji: '⚡',
    icon: '🚀',
    color: 'from-yellow-500 to-amber-600',
    intensity: 8,
    associatedGenres: ['action', 'racing', 'sports']
  },
  {
    id: 'Atmospheric',
    name: 'Atmospheric',
    description: 'Immersive world-building, exploration, mood-setting',
    emoji: '🌫',
    icon: '🌠',
    color: 'from-gray-500 to-slate-600',
    intensity: 4,
    associatedGenres: ['adventure', 'horror', 'rpg']
  },
  {
    id: 'Challenging',
    name: 'Challenging',
    description: 'Difficult, requires skill, punishing gameplay',
    emoji: '🏆',
    icon: '⚔️',
    color: 'from-purple-500 to-pink-600',
    intensity: 8,
    associatedGenres: ['strategy', 'action', 'rpg']
  },
  {
    id: 'Story-Rich',
    name: 'Story-Rich',
    description: 'Narrative-driven, plot-heavy, story-focused',
    emoji: '📚',
    icon: '📖',
    color: 'from-indigo-500 to-purple-600',
    intensity: 6,
    associatedGenres: ['rpg', 'adventure', 'narrative']
  },
  {
    id: 'Competitive',
    name: 'Competitive',
    description: 'Competition-focused, achievement-driven, versus play',
    emoji: '🏆',
    icon: '🔥',
    color: 'from-red-500 to-orange-600',
    intensity: 9,
    associatedGenres: ['action', 'sports', 'multiplayer']
  },
  {
    id: 'Social',
    name: 'Social',
    description: 'Multiplayer, community, cooperative gameplay',
    emoji: '👥',
    icon: '🤝',
    color: 'from-teal-500 to-cyan-600',
    intensity: 5,
    associatedGenres: ['multiplayer', 'casual', 'party']
  },
  {
    id: 'Experimental',
    name: 'Experimental',
    description: 'Innovative, boundary-pushing, unique mechanics',
    emoji: '🧪',
    icon: '⚗️',
    color: 'from-pink-500 to-rose-600',
    intensity: 7,
    associatedGenres: ['indie', 'puzzle', 'simulation']
  },
  {
    id: 'Mindful',
    name: 'Mindful',
    description: 'Thoughtful, deliberate, contemplative gameplay',
    emoji: '🧘',
    icon: '🧠',
    color: 'from-purple-500 to-indigo-600',
    intensity: 3,
    associatedGenres: ['puzzle', 'strategy', 'meditation']
  },
  {
    id: 'Nostalgic',
    name: 'Nostalgic',
    description: 'Retro-inspired, classic, timeless appeal',
    emoji: '🕰',
    icon: '🎮',
    color: 'from-amber-500 to-yellow-600',
    intensity: 4,
    associatedGenres: ['retro', 'classic', 'arcade']
  },
  {
    id: 'Gritty',
    name: 'Gritty',
    description: 'Tough, demanding, perseverance-testing',
    emoji: '💪',
    icon: '🛡️',
    color: 'from-gray-500 to-slate-600',
    intensity: 8,
    associatedGenres: ['strategy', 'survival', 'hardcore']
  },
  {
    id: 'Surreal',
    name: 'Surreal',
    description: 'Dream-like, abstract, mind-bending',
    emoji: '🌌',
    icon: '🎭',
    color: 'from-purple-500 to-pink-600',
    intensity: 7,
    associatedGenres: ['puzzle', 'art', 'experimental']
  },
  {
    id: 'Action-Packed',
    name: 'Action-Packed',
    description: 'Non-stop action, constant excitement, thrilling',
    emoji: '⚡',
    icon: '🚀',
    color: 'from-red-500 to-orange-600',
    intensity: 10,
    associatedGenres: ['action', 'shooter', 'adventure']
  },
  {
    id: 'Dark',
    name: 'Dark',
    description: 'Mature themes, horror elements, intense atmosphere',
    emoji: '🌑',
    icon: '💀',
    color: 'from-black to-gray-600',
    intensity: 8,
    associatedGenres: ['horror', 'action', 'adventure']
  },
  {
    id: 'Humorous',
    name: 'Humorous',
    description: 'Comedic, lighthearted, entertaining gameplay',
    emoji: '😂',
    icon: '🤣',
    color: 'from-yellow-500 to-orange-600',
    intensity: 4,
    associatedGenres: ['comedy', 'casual', 'party']
  },
  {
    id: 'Educational',
    name: 'Educational',
    description: 'Learning-focused, informative, skill-building',
    emoji: '📚',
    icon: '🎓',
    color: 'from-blue-500 to-indigo-600',
    intensity: 5,
    associatedGenres: ['educational', 'puzzle', 'strategy']
  },
  {
    id: 'Retro',
    name: 'Retro',
    description: 'Classic gameplay, nostalgic feel, old-school charm',
    emoji: '🕹️',
    icon: '👾',
    color: 'from-green-500 to-emerald-600',
    intensity: 6,
    associatedGenres: ['retro', 'classic', 'arcade']
  },
  {
    id: 'Open-World',
    name: 'Open-World',
    description: 'Exploration-focused, sandbox gameplay, freedom',
    emoji: '🌐',
    icon: '🗺️',
    color: 'from-blue-500 to-indigo-600',
    intensity: 7,
    associatedGenres: ['open-world', 'adventure', 'rpg']
  },
  {
    id: 'Cooperative',
    name: 'Cooperative',
    description: 'Multiplayer, teamwork, cooperative gameplay',
    emoji: '👫',
    icon: '🤝',
    color: 'from-teal-500 to-cyan-600',
    intensity: 5,
    associatedGenres: ['multiplayer', 'cooperative', 'party']
  },
  {
    id: 'Fast-Paced',
    name: 'Fast-Paced',
    description: 'Quick reflexes, rapid action, thrilling gameplay',
    emoji: '⚡',
    icon: '🏎️',
    color: 'from-red-500 to-orange-600',
    intensity: 9,
    associatedGenres: ['action', 'racing', 'sports']
  },
  {
    id: 'Immersive',
    name: 'Immersive',
    description: 'Engaging storyline, interactive gameplay, immersive atmosphere',
    emoji: '📺',
    icon: '🎬',
    color: 'from-purple-500 to-pink-600',
    intensity: 8,
    associatedGenres: ['adventure', 'rpg', 'narrative']
  },
  {
    id: 'Casual',
    name: 'Casual',
    description: 'Easy to play, relaxing, laid-back gameplay',
    emoji: '😊',
    icon: '👌',
    color: 'from-green-500 to-emerald-600',
    intensity: 3,
    associatedGenres: ['casual', 'puzzle', 'simulation']
  },
  {
    id: 'Scary',
    name: 'Scary',
    description: 'Horror-filled, terrifying, spine-chilling gameplay',
    emoji: '😱',
    icon: '👻',
    color: 'from-gray-900 to-black',
    intensity: 10,
    associatedGenres: ['horror', 'survival', 'thriller']
  }
] as const

export type MoodId = typeof MOODS[number]['id']
export type MoodIntensity = typeof MOODS[number]['intensity']
