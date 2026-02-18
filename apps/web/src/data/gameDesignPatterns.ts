// Game Design Patterns Database
// Maps games to their design characteristics for emotional matching

export interface GameDesignPattern {
  gameId: string;
  gameName: string;

  // Design pattern scores (0-10 scale)
  pacing: number;           // How fast/slow the game flows
  frictionLevel: number;   // Challenge difficulty curve
  narrativeDensity: number; // Story depth/complexity
  mechanicalComplexity: number; // System complexity
  rewardCadence: number;  // How frequently rewards come
  agencyLevel: number;     // Player control/autonomy
  sensoryIntensity: number; // Visual/audio stimulation
  timeToFun: number;       // Minutes to first enjoyable moment

  // Emotional alignments (0-10 scale)
  comfortAlignment: number;
  escapeAlignment: number;
  masteryAlignment: number;
  chaosAlignment: number;
  noveltyAlignment: number;
  storyFlowAlignment: number;

  // Metadata
  genres: string[];
  platforms: string[];
  avgPlaytime: number; // minutes
  difficulty: 'easy' | 'moderate' | 'hard';
}

// Curated database of games with their design patterns
export const GAME_DESIGN_PATTERNS: GameDesignPattern[] = [
  {
    gameId: "hades",
    gameName: "Hades",
    pacing: 8,           // Fast-paced action
    frictionLevel: 7,   // Challenging but fair
    narrativeDensity: 6, // Good story without overwhelming
    mechanicalComplexity: 8, // Deep but learnable systems
    rewardCadence: 9,   // Frequent satisfying wins
    agencyLevel: 9,     // High player control
    sensoryIntensity: 8, // Polished visuals/audio
    timeToFun: 15,      // Quick to enjoyable
    comfortAlignment: 4,
    escapeAlignment: 7,
    masteryAlignment: 9,
    chaosAlignment: 6,
    noveltyAlignment: 5,
    storyFlowAlignment: 6,
    genres: ["Action", "Roguelike", "Indie"],
    platforms: ["PC", "PS4", "PS5", "Switch", "Xbox"],
    avgPlaytime: 120,
    difficulty: "moderate"
  },
  {
    gameId: "stardew_valley",
    gameName: "Stardew Valley",
    pacing: 3,           // Relaxed, self-paced
    frictionLevel: 2,   // Very gentle
    narrativeDensity: 4, // Light story
    mechanicalComplexity: 6, // Systems to learn but forgiving
    rewardCadence: 7,   // Steady progress rewards
    agencyLevel: 8,     // Freedom to play your way
    sensoryIntensity: 4, // Cozy, soft visuals
    timeToFun: 30,      // Takes time to get into
    comfortAlignment: 10,
    escapeAlignment: 8,
    masteryAlignment: 5,
    chaosAlignment: 1,
    noveltyAlignment: 5,
    storyFlowAlignment: 6,
    genres: ["Farming", "RPG", "Indie"],
    platforms: ["PC", "PS4", "PS5", "Switch", "Xbox", "Mobile"],
    avgPlaytime: 240,
    difficulty: "easy"
  },
  {
    gameId: "celeste",
    gameName: "Celeste",
    pacing: 7,           // Fast but controllable
    frictionLevel: 8,   // Challenging platforming
    narrativeDensity: 8, // Deep emotional story
    mechanicalComplexity: 7, // Precise movement systems
    rewardCadence: 8,   // Regular checkpoints and progress
    agencyLevel: 7,     // Good control with learning curve
    sensoryIntensity: 6, // Distinctive pixel art style
    timeToFun: 20,      // Quick to engaging
    comfortAlignment: 3,
    escapeAlignment: 6,
    masteryAlignment: 8,
    chaosAlignment: 4,
    noveltyAlignment: 7,
    storyFlowAlignment: 9,
    genres: ["Platformer", "Indie", "Adventure"],
    platforms: ["PC", "PS4", "PS5", "Switch", "Xbox"],
    avgPlaytime: 180,
    difficulty: "moderate"
  },
  {
    gameId: "hades_2",
    gameName: "Hades II",
    pacing: 8,
    frictionLevel: 7,
    narrativeDensity: 7,
    mechanicalComplexity: 9,
    rewardCadence: 9,
    agencyLevel: 9,
    sensoryIntensity: 8,
    timeToFun: 15,
    comfortAlignment: 4,
    escapeAlignment: 7,
    masteryAlignment: 9,
    chaosAlignment: 6,
    noveltyAlignment: 6,
    storyFlowAlignment: 7,
    genres: ["Action", "Roguelike", "Indie"],
    platforms: ["PC"],
    avgPlaytime: 120,
    difficulty: "moderate"
  },
  {
    gameId: "journey",
    gameName: "Journey",
    pacing: 4,           // Slow, contemplative
    frictionLevel: 3,   // Minimal challenge
    narrativeDensity: 7, // Emotional without words
    mechanicalComplexity: 3, // Simple controls, deep meaning
    rewardCadence: 5,   // Subtle emotional rewards
    agencyLevel: 6,     // Freedom within constraints
    sensoryIntensity: 8, // Breathtaking visuals
    timeToFun: 10,      // Immediately beautiful
    comfortAlignment: 8,
    escapeAlignment: 9,
    masteryAlignment: 3,
    chaosAlignment: 2,
    noveltyAlignment: 8,
    storyFlowAlignment: 10,
    genres: ["Adventure", "Indie", "Art"],
    platforms: ["PC", "PS3", "PS4", "PS5"],
    avgPlaytime: 60,
    difficulty: "easy"
  },
  {
    gameId: "risk_of_rain_2",
    gameName: "Risk of Rain 2",
    pacing: 9,           // Very fast-paced
    frictionLevel: 9,   // Extremely challenging
    narrativeDensity: 3, // Minimal story
    mechanicalComplexity: 8, // Complex item systems
    rewardCadence: 10,  // Constant action and rewards
    agencyLevel: 8,     // High skill expression
    sensoryIntensity: 7, // Intense 3D action
    timeToFun: 5,       // Immediate action
    comfortAlignment: 1,
    escapeAlignment: 8,
    masteryAlignment: 10,
    chaosAlignment: 9,
    noveltyAlignment: 7,
    storyFlowAlignment: 2,
    genres: ["Action", "Third-Person Shooter", "Roguelike"],
    platforms: ["PC", "PS4", "PS5", "Switch", "Xbox"],
    avgPlaytime: 90,
    difficulty: "challenging"
  },
  {
    gameId: "animal_crossing_new_horizons",
    gameName: "Animal Crossing: New Horizons",
    pacing: 2,           // Extremely relaxed
    frictionLevel: 1,   // Almost no challenge
    narrativeDensity: 5, // Light social story
    mechanicalComplexity: 7, // Many systems to explore
    rewardCadence: 6,   // Daily rewards and progression
    agencyLevel: 9,     // Total freedom
    sensoryIntensity: 5, // Bright, cheerful visuals
    timeToFun: 45,      // Takes time to build
    comfortAlignment: 10,
    escapeAlignment: 9,
    masteryAlignment: 4,
    chaosAlignment: 1,
    noveltyAlignment: 6,
    storyFlowAlignment: 7,
    genres: ["Simulation", "Life Sim", "Social"],
    platforms: ["Switch"],
    avgPlaytime: 300,
    difficulty: "easy"
  },
  {
    gameId: "dead_cells",
    gameName: "Dead Cells",
    pacing: 8,
    frictionLevel: 8,
    narrativeDensity: 4,
    mechanicalComplexity: 8,
    rewardCadence: 9,
    agencyLevel: 8,
    sensoryIntensity: 6,
    timeToFun: 10,
    comfortAlignment: 3,
    escapeAlignment: 7,
    masteryAlignment: 9,
    chaosAlignment: 7,
    noveltyAlignment: 8,
    storyFlowAlignment: 4,
    genres: ["Action", "Roguelike", "Indie"],
    platforms: ["PC", "PS4", "PS5", "Switch", "Xbox"],
    avgPlaytime: 60,
    difficulty: "moderate"
  },
  {
    gameId: "tetris_effect",
    gameName: "Tetris Effect",
    pacing: 6,           // Steady but building
    frictionLevel: 6,   // Progressive difficulty
    narrativeDensity: 2, // Minimal story
    mechanicalComplexity: 5, // Classic but enhanced
    rewardCadence: 8,   // Line clear satisfaction
    agencyLevel: 7,     // Good control
    sensoryIntensity: 9, // Mind-bending visuals
    timeToFun: 2,       // Immediate
    comfortAlignment: 7,
    escapeAlignment: 8,
    masteryAlignment: 6,
    chaosAlignment: 5,
    noveltyAlignment: 9,
    storyFlowAlignment: 3,
    genres: ["Puzzle", "Music", "VR"],
    platforms: ["PC", "PS4", "PS5", "Xbox", "Meta Quest"],
    avgPlaytime: 45,
    difficulty: "easy"
  },
  {
    gameId: "spiritfarer",
    gameName: "Spiritfarer",
    pacing: 4,           // Measured pace
    frictionLevel: 4,   // Emotional challenge
    narrativeDensity: 9, // Deep emotional story
    mechanicalComplexity: 7, // Management systems
    rewardCadence: 6,   // Emotional milestones
    agencyLevel: 7,     // Meaningful choices
    sensoryIntensity: 7, // Beautiful watercolor style
    timeToFun: 25,      // Builds gradually
    comfortAlignment: 8,
    escapeAlignment: 6,
    masteryAlignment: 5,
    chaosAlignment: 3,
    noveltyAlignment: 6,
    storyFlowAlignment: 10,
    genres: ["Management", "Adventure", "Indie"],
    platforms: ["PC", "PS4", "PS5", "Switch", "Xbox"],
    avgPlaytime: 180,
    difficulty: "easy"
  }
];

// Helper function to get game by ID
export const getGameById = (gameId: string): GameDesignPattern | undefined => {
  return GAME_DESIGN_PATTERNS.find(game => game.gameId === gameId);
};

// Helper function to search games by criteria
export const searchGames = (criteria: {
  genres?: string[];
  platforms?: string[];
  difficulty?: 'easy' | 'moderate' | 'challenging';
  maxTimeToFun?: number;
}): GameDesignPattern[] => {
  return GAME_DESIGN_PATTERNS.filter(game => {
    if (criteria.genres && !criteria.genres.some(genre => game.genres.includes(genre))) {
      return false;
    }
    if (criteria.platforms && !criteria.platforms.some(platform => game.platforms.includes(platform))) {
      return false;
    }
    if (criteria.difficulty && game.difficulty !== criteria.difficulty) {
      return false;
    }
    if (criteria.maxTimeToFun && game.timeToFun > criteria.maxTimeToFun) {
      return false;
    }
    return true;
  });
};
