// Static genre data for GamePilot platform

export interface GenreData {
  id: string
  name: string
  description: string
  color: string
  icon: string
  category: 'core' | 'hybrid' | 'niche' | 'retro' | 'esports' | 'indie'
  subgenres: SubgenreData[]
}

export interface SubgenreData {
  id: string
  name: string
  description: string
  color?: string
  icon?: string
}

// Core Genres
export const CORE_GENRES: GenreData[] = [
  {
    id: 'action',
    name: 'Action',
    description: 'Fast-paced games emphasizing physical challenges, reflexes, and combat',
    color: '#FF6B6B',
    icon: '⚔️',
    category: 'core',
    subgenres: [
      { id: 'fps', name: 'First-Person Shooter (FPS)', description: 'Shooting games from first-person perspective' },
      { id: 'tps', name: 'Third-Person Shooter (TPS)', description: 'Shooting games from third-person perspective' },
      { id: 'beat-em-up', name: 'Beat \'Em Up', description: 'Combat games against multiple enemies' },
      { id: 'hack-slash', name: 'Hack and Slash', description: 'Melee combat focused action games' },
      { id: 'stealth', name: 'Stealth', description: 'Games emphasizing avoidance and silent takedowns' },
      { id: 'action-adventure', name: 'Action-Adventure', description: 'Combination of action and exploration' },
      { id: 'platformer', name: 'Platformer', description: 'Games focused on jumping and platform navigation' },
      { id: 'run-gun', name: 'Run and Gun', description: 'Fast-paced side-scrolling shooters' },
      { id: 'twin-stick', name: 'Twin-Stick Shooter', description: 'Dual-analog control shooters' }
    ]
  },
  {
    id: 'adventure',
    name: 'Adventure',
    description: 'Games focused on exploration, puzzle-solving, and narrative',
    color: '#4ECDC4',
    icon: '🗺️',
    category: 'core',
    subgenres: [
      { id: 'point-click', name: 'Point-and-Click', description: 'Mouse-driven adventure games' },
      { id: 'text-adventure', name: 'Text Adventure', description: 'Text-based interactive fiction' },
      { id: 'visual-novel', name: 'Visual Novel', description: 'Story-driven games with static visuals' },
      { id: 'interactive-fiction', name: 'Interactive Fiction', description: 'Text-based narrative games' },
      { id: 'escape-room', name: 'Escape Room', description: 'Puzzle room escape games' },
      { id: 'walking-simulator', name: 'Walking Simulator', description: 'Exploration-focused narrative games' },
      { id: 'exploration', name: 'Exploration', description: 'Games emphasizing discovery and traversal' },
      { id: 'narrative-adventure', name: 'Narrative Adventure', description: 'Story-heavy exploration games' }
    ]
  },
  {
    id: 'rpg',
    name: 'Role-Playing (RPG)',
    description: 'Games featuring character progression, stats, and immersive storytelling',
    color: '#95E77E',
    icon: '🎭',
    category: 'core',
    subgenres: [
      { id: 'action-rpg', name: 'Action RPG (ARPG)', description: 'RPGs with real-time combat' },
      { id: 'turn-based-rpg', name: 'Turn-Based RPG', description: 'RPGs with tactical turn-based combat' },
      { id: 'mmorpg', name: 'MMORPG', description: 'Massively multiplayer online RPGs' },
      { id: 'western-rpg', name: 'Western RPG', description: 'Western-style RPGs with player choice' },
      { id: 'jrpg', name: 'Japanese RPG (JRPG)', description: 'Japanese-style RPGs with linear stories' },
      { id: 'tactical-rpg', name: 'Tactical RPG', description: 'Grid-based strategy RPGs' },
      { id: 'roguelike', name: 'Roguelike/Roguelite', description: 'Procedurally generated dungeon crawlers' },
      { id: 'dungeon-crawler', name: 'Dungeon Crawler', description: 'First-person dungeon exploration RPGs' },
      { id: 'monster-taming', name: 'Monster Taming', description: 'RPGs focused on collecting creatures' },
      { id: 'party-based-rpg', name: 'Party-Based RPG', description: 'RPGs managing multiple party members' }
    ]
  },
  {
    id: 'strategy',
    name: 'Strategy',
    description: 'Games requiring planning, resource management, and tactical thinking',
    color: '#FFE66D',
    icon: '♟️',
    category: 'core',
    subgenres: [
      { id: 'rts', name: 'Real-Time Strategy (RTS)', description: 'Real-time strategic warfare games' },
      { id: 'turn-based-strategy', name: 'Turn-Based Strategy', description: 'Strategic games with turn-based gameplay' },
      { id: 'tower-defense', name: 'Tower Defense', description: 'Strategic base defense games' },
      { id: 'grand-strategy', name: 'Grand Strategy', description: 'Large-scale strategy games' },
      { id: '4x', name: '4X', description: 'Explore, Expand, Exploit, Exterminate games' },
      { id: 'moba', name: 'MOBA', description: 'Multiplayer Online Battle Arena games' },
      { id: 'auto-chess', name: 'Auto Chess/Auto Battler', description: 'Auto-battling strategy games' },
      { id: 'wargame', name: 'Wargame', description: 'Military simulation strategy games' },
      { id: 'city-builder', name: 'City Builder', description: 'Urban development strategy games' }
    ]
  },
  {
    id: 'simulation',
    name: 'Simulation',
    description: 'Games that simulate real-world activities or systems',
    color: '#A8E6CF',
    icon: '🏗️',
    category: 'core',
    subgenres: [
      { id: 'life-sim', name: 'Life Simulation', description: 'Games simulating daily life activities' },
      { id: 'farming-sim', name: 'Farming Sim', description: 'Agricultural simulation games' },
      { id: 'dating-sim', name: 'Dating Sim', description: 'Romantic relationship simulation games' },
      { id: 'business-sim', name: 'Business Sim', description: 'Corporate/tycoon simulation games' },
      { id: 'vehicle-sim', name: 'Vehicle Simulation', description: 'Realistic vehicle operation games' },
      { id: 'flight-sim', name: 'Flight Sim', description: 'Aviation simulation games' },
      { id: 'medical-sim', name: 'Medical Sim', description: 'Healthcare simulation games' },
      { id: 'sports-management', name: 'Sports Management', description: 'Team management simulation games' },
      { id: 'colony-sim', name: 'Colony Sim', description: 'Settlement building games' },
      { id: 'god-game', name: 'God Game', description: 'Games playing as a deity' }
    ]
  },
  {
    id: 'sports',
    name: 'Sports',
    description: 'Games based on real-world sports and athletic competitions',
    color: '#FFB6C1',
    icon: '⚽',
    category: 'core',
    subgenres: [
      { id: 'traditional-sports', name: 'Traditional Sports', description: 'Mainstream sports simulations (FIFA, NBA, Madden)' },
      { id: 'extreme-sports', name: 'Extreme Sports', description: 'Alternative and extreme sports games' },
      { id: 'racing', name: 'Racing', description: 'Vehicle racing competitions' },
      { id: 'fighting-games', name: 'Fighting Games', description: 'One-on-one combat sports games' },
      { id: 'golf', name: 'Golf', description: 'Golf simulation games' },
      { id: 'tennis', name: 'Tennis/Racquet Sports', description: 'Racquet sports simulations' },
      { id: 'olympic-sports', name: 'Olympic Sports', description: 'Multi-event Olympic games' },
      { id: 'fishing-hunting', name: 'Fishing/Hunting', description: 'Outdoor sports simulations' },
      { id: 'sports-management', name: 'Sports Management', description: 'Team strategy and management games' }
    ]
  },
  {
    id: 'puzzle',
    name: 'Puzzle',
    description: 'Games focused on problem-solving, logic, and critical thinking',
    color: '#C9B1FF',
    icon: '🧩',
    category: 'core',
    subgenres: [
      { id: 'match-3', name: 'Match-3', description: 'Tile-matching puzzle games' },
      { id: 'block-puzzle', name: 'Block Puzzle', description: 'Block manipulation puzzle games' },
      { id: 'hidden-object', name: 'Hidden Object', description: 'Object finding puzzle games' },
      { id: 'physics-puzzle', name: 'Physics Puzzle', description: 'Physics-based puzzle games' },
      { id: 'logic-puzzle', name: 'Logic Puzzle', description: 'Deduction and reasoning puzzles' },
      { id: 'word-puzzle', name: 'Word Puzzle', description: 'Language and word games' },
      { id: 'number-puzzle', name: 'Number Puzzle', description: 'Mathematical and numerical puzzles' },
      { id: 'pattern-recognition', name: 'Pattern Recognition', description: 'Pattern identification games' },
      { id: 'escape-puzzle', name: 'Escape Puzzle', description: 'Room and environment escape puzzles' },
      { id: 'spatial-puzzle', name: 'Spatial Puzzle', description: '3D space manipulation puzzles' }
    ]
  }
]

// Hybrid Genres
export const HYBRID_GENRES: GenreData[] = [
  {
    id: 'action-adventure',
    name: 'Action-Adventure',
    description: 'Games combining action elements with exploration and narrative',
    color: '#FF8E53',
    icon: '🗡️',
    category: 'hybrid',
    subgenres: [
      { id: 'zelda-like', name: 'Zelda-like', description: 'Inspired by Zelda formula' },
      { id: 'metroidvania', name: 'Metroidvania', description: '2D exploration with ability gating' },
      { id: 'souls-like', name: 'Souls-like', description: 'Challenging action with deep mechanics' },
      { id: 'open-world-action', name: 'Open World Action', description: 'Large-scale action environments' },
      { id: 'survival-action', name: 'Survival Action', description: 'Action games with survival mechanics' }
    ]
  },
  {
    id: 'rpg-adventure',
    name: 'RPG-Adventure',
    description: 'Games blending RPG mechanics with adventure elements',
    color: '#56AB2F',
    icon: '📖',
    category: 'hybrid',
    subgenres: [
      { id: 'story-rich-rpg', name: 'Story-Rich RPGs', description: 'Narrative-focused RPGs' },
      { id: 'choice-driven-rpg', name: 'Choice-Driven RPGs', description: 'RPGs with meaningful choices' },
      { id: 'interactive-story-rpg', name: 'Interactive Story RPGs', description: 'RPGs with branching narratives' }
    ]
  },
  {
    id: 'strategy-rpg',
    name: 'Strategy-RPG',
    description: 'Games combining strategic gameplay with RPG progression',
    color: '#F7971E',
    icon: '⚔️',
    category: 'hybrid',
    subgenres: [
      { id: 'tactical-rpg', name: 'Tactical RPGs', description: 'Grid-based tactical combat' },
      { id: 'grid-based-rpg', name: 'Grid-Based Strategy RPGs', description: 'Grid positioning strategy' },
      { id: 'card-battle-rpg', name: 'Card Battle RPGs', description: 'Card-based combat systems' },
      { id: 'auto-chess-rpg', name: 'Auto Chess RPGs', description: 'Auto-battling with RPG elements' }
    ]
  },
  {
    id: 'simulation-strategy',
    name: 'Simulation-Strategy',
    description: 'Games mixing simulation mechanics with strategic elements',
    color: '#8E2DE2',
    icon: '🏰',
    category: 'hybrid',
    subgenres: [
      { id: 'base-building-combat', name: 'Base Building with Combat', description: 'Base defense with strategy' },
      { id: 'colony-management-strategy', name: 'Colony Management with Strategy', description: 'Colony sims with warfare' },
      { id: 'resource-management-warfare', name: 'Resource Management Warfare', description: 'Economic warfare games' },
      { id: 'economic-warfare', name: 'Economic Warfare', description: 'Business competition warfare' }
    ]
  },
  {
    id: 'puzzle-adventure',
    name: 'Puzzle-Adventure',
    description: 'Games combining puzzle-solving with adventure exploration',
    color: '#C9B1FF',
    icon: '🧩',
    category: 'hybrid',
    subgenres: [
      { id: 'portal-style', name: 'Portal-style Games', description: 'Physics puzzle adventure games' },
      { id: 'environmental-puzzle', name: 'Environmental Puzzle Games', description: 'World manipulation puzzles' },
      { id: 'narrative-puzzle', name: 'Narrative Puzzle Games', description: 'Story-driven puzzle games' },
      { id: 'escape-room-adventure', name: 'Escape Room Adventures', description: 'Adventure escape games' }
    ]
  }
]

// Niche Genres
export const NICHE_GENRES: GenreData[] = [
  {
    id: 'educational',
    name: 'Educational',
    description: 'Games designed for learning and skill development',
    color: '#4ECDC4',
    icon: '📚',
    category: 'niche',
    subgenres: [
      { id: 'edutainment', name: 'Edutainment', description: 'Educational entertainment games' },
      { id: 'language-learning', name: 'Language Learning', description: 'Games for language acquisition' },
      { id: 'math-games', name: 'Math Games', description: 'Mathematical learning games' },
      { id: 'history-games', name: 'History Games', description: 'Historical education games' },
      { id: 'science-games', name: 'Science Games', description: 'Science education games' },
      { id: 'coding-games', name: 'Coding Games', description: 'Programming education games' }
    ]
  },
  {
    id: 'music-rhythm',
    name: 'Music & Rhythm',
    description: 'Games centered around music, rhythm, and timing',
    color: '#FF6B9D',
    icon: '🎵',
    category: 'niche',
    subgenres: [
      { id: 'rhythm-games', name: 'Rhythm Games', description: 'Timing-based music games' },
      { id: 'music-creation', name: 'Music Creation', description: 'Music composition tools' },
      { id: 'dance-games', name: 'Dance Games', description: 'Physical dance rhythm games' },
      { id: 'karaoke-games', name: 'Karaoke Games', description: 'Singing and vocal games' },
      { id: 'instrument-simulation', name: 'Instrument Simulation', description: 'Virtual instrument playing' }
    ]
  },
  {
    id: 'party-games',
    name: 'Party Games',
    description: 'Multiplayer games designed for social gatherings',
    color: '#FFB6C1',
    icon: '🎉',
    category: 'niche',
    subgenres: [
      { id: 'local-multiplayer', name: 'Local Multiplayer', description: 'Same-screen multiplayer games' },
      { id: 'mini-game-collections', name: 'Mini-Game Collections', description: 'Collections of small games' },
      { id: 'family-games', name: 'Family Games', description: 'All-ages appropriate games' },
      { id: 'social-deduction', name: 'Social Deduction', description: 'Games of deception and deduction' },
      { id: 'board-game-adaptations', name: 'Board Game Adaptations', description: 'Digital board games' }
    ]
  },
  {
    id: 'fitness-health',
    name: 'Fitness & Health',
    description: 'Games promoting physical activity and wellness',
    color: '#95E77E',
    icon: '💪',
    category: 'niche',
    subgenres: [
      { id: 'exergaming', name: 'Exergaming', description: 'Exercise gaming' },
      { id: 'yoga-meditation', name: 'Yoga/Meditation', description: 'Mindfulness and stretching games' },
      { id: 'dance-fitness', name: 'Dance Fitness', description: 'Dance-based exercise games' },
      { id: 'sports-training', name: 'Sports Training', description: 'Skill development games' },
      { id: 'health-tracking', name: 'Health Tracking', description: 'Wellness monitoring games' }
    ]
  },
  {
    id: 'art-creativity',
    name: 'Art & Creativity',
    description: 'Games focused on creative expression and art creation',
    color: '#C9B1FF',
    icon: '🎨',
    category: 'niche',
    subgenres: [
      { id: 'drawing-games', name: 'Drawing Games', description: 'Digital art creation games' },
      { id: 'animation-tools', name: 'Animation Tools', description: 'Animation creation software' },
      { id: 'game-development-tools', name: 'Game Development Tools', description: 'Game creation tools' },
      { id: 'music-creation', name: 'Music Creation', description: 'Music production tools' },
      { id: '3d-modeling-games', name: '3D Modeling Games', description: '3D art creation games' }
    ]
  },
  {
    id: 'horror',
    name: 'Horror',
    description: 'Games designed to evoke fear and suspense',
    color: '#2C3E50',
    icon: '👻',
    category: 'niche',
    subgenres: [
      { id: 'survival-horror', name: 'Survival Horror', description: 'Resource management horror games' },
      { id: 'psychological-horror', name: 'Psychological Horror', description: 'Mental horror and mind games' },
      { id: 'jump-scare', name: 'Jump Scare', description: 'Startle-based horror games' },
      { id: 'cosmic-horror', name: 'Cosmic Horror', description: 'Lovecraftian horror games' },
      { id: 'body-horror', name: 'Body Horror', description: 'Physical transformation horror' },
      { id: 'found-footage', name: 'Found Footage', description: 'Mock documentary horror games' }
    ]
  }
]

// Retro Genres
export const RETRO_GENRES: GenreData[] = [
  {
    id: 'arcade-classics',
    name: 'Arcade Classics',
    description: 'Classic arcade-style games from the golden age',
    color: '#FF8C42',
    icon: '🕹️',
    category: 'retro',
    subgenres: [
      { id: 'classic-arcade', name: 'Classic Arcade', description: 'Original arcade cabinet games' },
      { id: 'retro-shooters', name: 'Retro Shooters', description: 'Classic arcade shooters' },
      { id: 'classic-platformers', name: 'Classic Platformers', description: 'Early platform games' },
      { id: 'retro-racing', name: 'Retro Racing', description: 'Classic arcade racing games' },
      { id: 'arcade-sports', name: 'Arcade Sports', description: 'Simplified arcade sports games' }
    ]
  },
  {
    id: '8-bit-16-bit-era',
    name: '8-bit/16-bit Era',
    description: 'Games from the 8-bit and 16-bit console generations',
    color: '#FFD93D',
    icon: '🎮',
    category: 'retro',
    subgenres: [
      { id: 'nes-style', name: 'NES-style Games', description: 'Nintendo Entertainment System style' },
      { id: 'snes-style', name: 'SNES-style Games', description: 'Super Nintendo style' },
      { id: 'sega-genesis-style', name: 'Sega Genesis Style', description: 'Sega Genesis style' },
      { id: 'game-boy-style', name: 'Game Boy Style', description: 'Nintendo Game Boy style' },
      { id: 'classic-rpgs', name: 'Classic RPGs', description: 'Early console RPGs' }
    ]
  },
  {
    id: 'early-3d-era',
    name: 'Early 3D Era',
    description: 'Games from the transition to 3D graphics',
    color: '#6C5CE7',
    icon: '🎯',
    category: 'retro',
    subgenres: [
      { id: 'playstation-1-style', name: 'PlayStation 1 Style', description: 'Early 3D PlayStation games' },
      { id: 'n64-style', name: 'N64 Style', description: 'Nintendo 64 style games' },
      { id: 'early-3d-platformers', name: 'Early 3D Platformers', description: 'First 3D platform games' },
      { id: 'classic-3d-racing', name: 'Classic 3D Racing', description: 'Early 3D racing games' },
      { id: 'retro-fps', name: 'Retro FPS', description: 'Early first-person shooters' }
    ]
  },
  {
    id: 'dos-pc-classics',
    name: 'DOS/PC Classics',
    description: 'Classic PC games from the DOS era',
    color: '#95A5A6',
    icon: '💻',
    category: 'retro',
    subgenres: [
      { id: 'point-click-adventures', name: 'Point-and-Click Adventures', description: 'Classic PC adventure games' },
      { id: 'classic-pc-rpgs', name: 'Classic PC RPGs', description: 'Early computer RPGs' },
      { id: 'early-strategy-games', name: 'Early Strategy Games', description: 'Classic PC strategy games' },
      { id: 'dos-platformers', name: 'DOS Platformers', description: 'Early PC platform games' },
      { id: 'retro-simulations', name: 'Retro Simulations', description: 'Early PC simulation games' }
    ]
  }
]

// Esports Genres
export const ESPORTS_GENRES: GenreData[] = [
  {
    id: 'fighting-games-esports',
    name: 'Fighting Games',
    description: 'Competitive fighting games with tournament scenes',
    color: '#E74C3C',
    icon: '🥊',
    category: 'esports',
    subgenres: [
      { id: '2d-fighting', name: '2D Fighting', description: 'Traditional 2D fighting games' },
      { id: '3d-fighting', name: '3D Fighting', description: 'Modern 3D fighting games' },
      { id: 'anime-fighters', name: 'Anime Fighters', description: 'Manga-style fighting games' },
      { id: 'platform-fighters', name: 'Platform Fighters', description: 'Platform-based fighting games' },
      { id: 'tag-team-fighters', name: 'Tag Team Fighters', description: 'Team-based fighting games' }
    ]
  },
  {
    id: 'competitive-fps',
    name: 'First-Person Shooters (Competitive)',
    description: 'Competitive FPS games with professional scenes',
    color: '#FF6B6B',
    icon: '🔫',
    category: 'esports',
    subgenres: [
      { id: 'arena-shooters', name: 'Arena Shooters', description: 'Arena-style competitive FPS' },
      { id: 'tactical-shooters', name: 'Tactical Shooters', description: 'Strategic competitive FPS' },
      { id: 'battle-royale', name: 'Battle Royale', description: 'Large-scale survival shooters' },
      { id: 'hero-shooters', name: 'Hero Shooters', description: 'Character-based FPS games' },
      { id: 'class-based-shooters', name: 'Class-Based Shooters', description: 'Role-based competitive FPS' }
    ]
  },
  {
    id: 'moba-arts',
    name: 'MOBA & ARTS',
    description: 'Multiplayer Online Battle Arena and Action Real-Time Strategy',
    color: '#9B59B6',
    icon: '⚔️',
    category: 'esports',
    subgenres: [
      { id: 'traditional-moba', name: 'Traditional MOBA', description: 'Classic 5v5 MOBA games' },
      { id: 'auto-battlers', name: 'Auto Battlers', description: 'Auto-battling strategy games' },
      { id: 'tower-defense-mobas', name: 'Tower Defense MOBAs', description: 'Tower defense competitive games' },
      { id: 'hero-brawlers', name: 'Hero Brawlers', description: 'Character-based brawlers' },
      { id: 'team-strategy-games', name: 'Team Strategy Games', description: 'Team-based strategy games' }
    ]
  },
  {
    id: 'real-time-strategy-esports',
    name: 'Real-Time Strategy (Esports)',
    description: 'Competitive RTS games with professional leagues',
    color: '#F39C12',
    icon: '⚡',
    category: 'esports',
    subgenres: [
      { id: 'competitive-rts', name: 'Competitive RTS', description: 'Professional RTS games' },
      { id: '1v1-rts', name: '1v1 RTS', description: 'Dueling RTS games' },
      { id: 'team-rts', name: 'Team RTS', description: 'Team-based RTS games' },
      { id: 'asymmetric-rts', name: 'Asymmetric RTS', description: 'Unbalanced team RTS games' },
      { id: 'tower-defense-esports', name: 'Tower Defense Esports', description: 'Competitive tower defense' }
    ]
  },
  {
    id: 'sports-games-esports',
    name: 'Sports Games (Esports)',
    description: 'Competitive sports games with professional scenes',
    color: '#27AE60',
    icon: '🏆',
    category: 'esports',
    subgenres: [
      { id: 'fifa-ea-sports-fc', name: 'FIFA/EA Sports FC', description: 'Competitive football games' },
      { id: 'nba-2k', name: 'NBA 2K', description: 'Competitive basketball games' },
      { id: 'rocket-league', name: 'Rocket League', description: 'Car-based soccer games' },
      { id: 'competitive-racing', name: 'Competitive Racing', description: 'Professional racing games' },
      { id: 'fighting-game-tournaments', name: 'Fighting Game Tournaments', description: 'Competitive fighting circuits' }
    ]
  },
  {
    id: 'card-strategy-games-esports',
    name: 'Card & Strategy Games (Esports)',
    description: 'Competitive card and strategy games',
    color: '#8E44AD',
    icon: '🃏',
    category: 'esports',
    subgenres: [
      { id: 'digital-card-games', name: 'Digital Card Games', description: 'Online card battle games' },
      { id: 'auto-chess-esports', name: 'Auto Chess Esports', description: 'Competitive auto chess' },
      { id: 'collectible-card-games', name: 'Collectible Card Games', description: 'Digital CCGs' },
      { id: 'deck-builders', name: 'Deck Builders', description: 'Deck building strategy games' },
      { id: 'strategy-card-games', name: 'Strategy Card Games', description: 'Strategic card games' }
    ]
  }
]

// Indie-Specific Genres
export const INDIE_GENRES: GenreData[] = [
  {
    id: 'experimental',
    name: 'Experimental',
    description: 'Innovative games pushing boundaries of the medium',
    color: '#E91E63',
    icon: '🧪',
    category: 'indie',
    subgenres: [
      { id: 'art-games', name: 'Art Games', description: 'Games as artistic expression' },
      { id: 'interactive-experiences', name: 'Interactive Experiences', description: 'Non-traditional interactive media' },
      { id: 'abstract-games', name: 'Abstract Games', description: 'Non-representational games' },
      { id: 'conceptual-games', name: 'Conceptual Games', description: 'Idea-driven experiences' },
      { id: 'avant-garde-games', name: 'Avant-Garde Games', description: 'Cutting-edge experimental games' }
    ]
  },
  {
    id: 'short-form',
    name: 'Short Form',
    description: 'Brief, focused gaming experiences',
    color: '#F39C12',
    icon: '⏱️',
    category: 'indie',
    subgenres: [
      { id: 'micro-games', name: 'Micro Games', description: 'Very short gameplay experiences' },
      { id: 'game-jam-entries', name: 'Game Jam Entries', description: 'Rapidly developed games' },
      { id: 'mini-experiences', name: 'Mini Experiences', description: 'Small, focused games' },
      { id: 'one-screen-games', name: 'One-Screen Games', description: 'Single-screen puzzle games' },
      { id: 'speedrun-games', name: 'Speedrun Games', description: 'Games designed for speedrunning' }
    ]
  },
  {
    id: 'narrative-focus',
    name: 'Narrative Focus',
    description: 'Games prioritizing storytelling and emotional impact',
    color: '#9B59B6',
    icon: '📖',
    category: 'indie',
    subgenres: [
      { id: 'interactive-stories', name: 'Interactive Stories', description: 'Story-driven interactive media' },
      { id: 'emotional-experiences', name: 'Emotional Experiences', description: 'Feeling-focused narrative games' },
      { id: 'personal-stories', name: 'Personal Stories', description: 'Autobiographical or personal games' },
      { id: 'documentary-games', name: 'Documentary Games', description: 'Non-fiction interactive documentaries' },
      { id: 'poetry-games', name: 'Poetry Games', description: 'Poetic and literary games' }
    ]
  },
  {
    id: 'unique-mechanics',
    name: 'Unique Mechanics',
    description: 'Games built around innovative gameplay concepts',
    color: '#3498DB',
    icon: '⚙️',
    category: 'indie',
    subgenres: [
      { id: 'physics-based-puzzles', name: 'Physics-Based Puzzles', description: 'Innovative physics puzzle games' },
      { id: 'time-manipulation', name: 'Time Manipulation', description: 'Games with time control mechanics' },
      { id: 'perspective-shifts', name: 'Perspective Shifts', description: 'Games with changing viewpoints' },
      { id: 'gravity-games', name: 'Gravity Games', description: 'Games with gravity manipulation' },
      { id: 'color-pattern-games', name: 'Color/Pattern Games', description: 'Games based on color mechanics' }
    ]
  },
  {
    id: 'atmospheric',
    name: 'Atmospheric',
    description: 'Games emphasizing mood, environment, and atmosphere',
    color: '#2C3E50',
    icon: '🌫',
    category: 'indie',
    subgenres: [
      { id: 'ambient-games', name: 'Ambient Games', description: 'Environment-focused experiences' },
      { id: 'meditation-games', name: 'Meditation Games', description: 'Mindfulness and relaxation games' },
      { id: 'relaxation-games', name: 'Relaxation Games', description: 'Stress-relief experiences' },
      { id: 'visual-novels-indie', name: 'Visual Novels', description: 'Indie visual storytelling' },
      { id: 'walking-simulators-indie', name: 'Walking Simulators', description: 'Atmospheric exploration games' }
    ]
  }
]

// Combined genre taxonomy
export const ALL_GENRES = [
  ...CORE_GENRES,
  ...HYBRID_GENRES,
  ...NICHE_GENRES,
  ...RETRO_GENRES,
  ...ESPORTS_GENRES,
  ...INDIE_GENRES
]

// Export helper functions
export const getGenreById = (id: string): GenreData | undefined => {
  return ALL_GENRES.find(genre => genre.id === id)
}

export const getSubgenreById = (genreId: string, subgenreId: string): SubgenreData | undefined => {
  const genre = getGenreById(genreId)
  return genre?.subgenres.find(subgenre => subgenre.id === subgenreId)
}

export const getGenresByCategory = (category: GenreData['category']): GenreData[] => {
  return ALL_GENRES.filter(genre => genre.category === category)
}

export const searchGenres = (query: string): GenreData[] => {
  const lowercaseQuery = query.toLowerCase()
  return ALL_GENRES.filter(genre => 
    genre.name.toLowerCase().includes(lowercaseQuery) ||
    genre.description.toLowerCase().includes(lowercaseQuery) ||
    genre.subgenres.some(subgenre => subgenre.name.toLowerCase().includes(lowercaseQuery))
  )
}

export const getPopularGenres = (): GenreData[] => {
  return [
    getGenreById('action')!,
    getGenreById('rpg')!,
    getGenreById('strategy')!,
    getGenreById('sports')!,
    getGenreById('puzzle')!
  ].filter(Boolean)
}
