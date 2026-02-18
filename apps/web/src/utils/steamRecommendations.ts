import { MoodId } from '@gamepilot/static-data';
import { GENRE_TO_MOOD_MAPPING } from './steamGenreMapping';

/**
 * Steam recommendation utilities
 * Provides Steam-specific recommendation logic for games NOT in user library
 */

export interface SteamRecommendationOptions {
  games: any[]; // User's existing library to exclude
  userMood?: MoodId;
  timeAvailable?: string;
  category?: 'top_rated' | 'underrated' | 'hidden_gems';
}

// Curated list of high-quality/popular Steam games across different genres/moods
// These serve as the "external" pool since we don't have a live global Steam search API here
const EXTERNAL_STEAM_POOL = [
  { id: '1091500', title: 'Cyberpunk 2077', genres: ['rpg', 'action'], globalRating: 85, popularity: 95, description: 'An open-world, action-adventure story set in Night City.' },
  { id: '1145360', title: 'Hades', genres: ['action', 'roguelike'], globalRating: 98, popularity: 80, description: 'Defy the god of the dead as you hack and slash out of the Underworld.' },
  { id: '1245620', title: 'Elden Ring', genres: ['rpg', 'action'], globalRating: 95, popularity: 90, description: 'Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.' },
  { id: '646570', title: 'Slay the Spire', genres: ['roguelike', 'strategy'], globalRating: 97, popularity: 70, description: 'A fusion of card games and roguelikes.' },
  { id: '413150', title: 'Stardew Valley', genres: ['simulation', 'rpg'], globalRating: 98, popularity: 85, description: 'You have inherited your grandfather\'s old farm plot in Stardew Valley.' },
  { id: '219150', title: 'Hotline Miami', genres: ['action', 'indie'], globalRating: 97, popularity: 60, description: 'A high-octane action game overflowing with raw brutality.' },
  { id: '268910', title: 'Cuphead', genres: ['action', 'platformer'], globalRating: 96, popularity: 75, description: 'A classic run and gun action game heavily focused on boss battles.' },
  { id: '105600', title: 'Terraria', genres: ['action', 'adventure', 'indie'], globalRating: 98, popularity: 85, description: 'Dig, Fight, Explore, Build!' },
  { id: '367520', title: 'Hollow Knight', genres: ['action', 'adventure', 'indie'], globalRating: 97, popularity: 70, description: 'Forge your own path in Hollow Knight! An epic action adventure.' },
  { id: '292030', title: 'The Witcher 3: Wild Hunt', genres: ['rpg', 'adventure'], globalRating: 98, popularity: 95, description: 'Become a monster slayer for hire and embark on an epic journey.' },
  { id: '400', title: 'Portal', genres: ['puzzle', 'action'], globalRating: 98, popularity: 90, description: 'A series of first and third person puzzles.' },
  { id: '620', title: 'Portal 2', genres: ['puzzle', 'action'], globalRating: 98, popularity: 90, description: 'The sequel to the award-winning Portal.' },
  { id: '250900', title: 'The Binding of Isaac: Rebirth', genres: ['action', 'roguelike'], globalRating: 97, popularity: 75, description: 'A randomly generated action RPG shooter with heavy RPG elements.' },
  { id: '311210', title: 'Call of Duty: Black Ops III', genres: ['fps', 'multiplayer'], globalRating: 80, popularity: 85, description: 'A dark, gritty future where a new breed of Black Ops soldier emerges.' },
  { id: '271590', title: 'Grand Theft Auto V', genres: ['action', 'adventure'], globalRating: 95, popularity: 98, description: 'When a young street hustler, a retired bank robber and a terrifying psychopath find themselves entangled.' },
  { id: '1174180', title: 'Red Dead Redemption 2', genres: ['action', 'adventure'], globalRating: 97, popularity: 95, description: 'Arthur Morgan and the Van der Linde gang are outlaws on the run.' },
  { id: '1938090', title: 'Call of Duty: Modern Warfare II', genres: ['action', 'fps'], globalRating: 82, popularity: 90, description: 'Task Force 141 makes its diplomatic return.' },
  { id: '550', title: 'Left 4 Dead 2', genres: ['action', 'fps', 'multiplayer'], globalRating: 97, popularity: 95, description: 'Set in the zombie apocalypse.' },
  { id: '230410', title: 'Warframe', genres: ['action', 'rpg', 'multiplayer'], globalRating: 91, popularity: 80, description: 'Ninjas Play Free.' },
  { id: '570', title: 'Dota 2', genres: ['moba', 'multiplayer'], globalRating: 82, popularity: 85, description: 'Every day, millions of players worldwide enter battle as one of over a hundred Dota heroes.' },
  { id: '730', title: 'Counter-Strike 2', genres: ['fps', 'multiplayer'], globalRating: 88, popularity: 90, description: 'The next installment in the legendary Counter-Strike series.' },
  { id: '578080', title: 'PUBG: BATTLEGROUNDS', genres: ['action', 'multiplayer'], globalRating: 57, popularity: 80, description: 'Land, loot, and outlast your opponents.' }
];

function safeStringArray(input: any): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(v => String(v)).filter(Boolean);
  return [String(input)].filter(Boolean);
}

function normalizeToken(input: any): string {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/_+/g, '-');
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function buildTasteProfile(ownedGames: any[]) {
  const moodWeights: Record<string, number> = {};
  const genreWeights: Record<string, number> = {};

  for (const g of ownedGames) {
    const hours = Number(g?.hoursPlayed ?? g?.totalPlaytime ?? 0) || 0;
    const weight = clamp(1 + hours / 10, 1, 6);

    const moods = safeStringArray(g?.moods).map(normalizeToken);
    const genresRaw = Array.isArray(g?.genres) ? g.genres : [];
    const genres = genresRaw
      .map((x: any) => (typeof x === 'string' ? x : (x?.id || x?.name || '')))
      .filter(Boolean)
      .map(normalizeToken);

    for (const m of moods) {
      moodWeights[m] = (moodWeights[m] || 0) + weight;
    }
    for (const ge of genres) {
      genreWeights[ge] = (genreWeights[ge] || 0) + weight;
    }
  }

  const topMoods = Object.entries(moodWeights)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([m]) => m);

  const topGenres = Object.entries(genreWeights)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([g]) => g);

  return { topMoods, topGenres, moodWeights, genreWeights };
}

export function getSteamRecommendations(options: SteamRecommendationOptions): {
  games: any[];
  totalFound: number;
  genresSearched: any[];
} {
  const { games: ownedGames, userMood, timeAvailable, category } = options;
  
  // 1. Get IDs of games already in library
  const ownedIds = new Set(ownedGames.map(g => String(g.id || g.appId || '')));
  
  // 2. Filter external pool for games NOT in library
  let availablePool = EXTERNAL_STEAM_POOL.filter(game => !ownedIds.has(game.id));
  
  // 3. Apply category filtering
  if (category) {
    switch (category) {
      case 'top_rated':
        availablePool = availablePool
          .sort((a, b) => (b.globalRating || 0) - (a.globalRating || 0))
          .slice(0, 20);
        break;
      case 'underrated':
        availablePool = availablePool
          .filter(game => (game.globalRating || 0) >= 85 && (game.popularity || 0) <= 40)
          .sort((a, b) => (b.globalRating || 0) - (a.globalRating || 0))
          .slice(0, 15);
        break;
      case 'hidden_gems':
        availablePool = availablePool
          .filter(game => (game.popularity || 0) <= 30)
          .sort((a, b) => (b.globalRating || 0) - (a.globalRating || 0))
          .slice(0, 15);
        break;
    }
  }
  
  // 4. Map genres to moods for the pool
  const poolWithMoods = availablePool.map(game => {
    const moods = new Set<string>();
    game.genres.forEach(genre => {
      const genreMoods = GENRE_TO_MOOD_MAPPING[genre.toLowerCase()] || [];
      genreMoods.forEach(m => moods.add(m));
    });
    return { ...game, moods: Array.from(moods) };
  });

  const profile = buildTasteProfile(ownedGames);
  const selectedMoodToken = userMood ? normalizeToken(userMood) : '';

  const safeTime = String(timeAvailable || 'medium').toLowerCase();
  const explorationRate = safeTime === 'short' ? 0.35 : safeTime === 'long' ? 0.50 : 0.42;

  const scored = poolWithMoods.map((game: any) => {
    const gameMoods = safeStringArray(game.moods).map(normalizeToken);
    const gameGenres = safeStringArray(game.genres).map(normalizeToken);

    const moodMatch = selectedMoodToken
      ? (gameMoods.includes(selectedMoodToken) ? 1 : 0)
      : 0;

    const profileMoodOverlap = gameMoods.reduce((acc, m) => acc + (profile.moodWeights[m] || 0), 0);
    const profileGenreOverlap = gameGenres.reduce((acc, g) => acc + (profile.genreWeights[g] || 0), 0);

    const normalizedRating = clamp((Number(game.globalRating) || 0) / 100, 0, 1);

    const baseRelevance = (
      (moodMatch ? 0.55 : 0) +
      clamp(profileMoodOverlap / 25, 0, 0.25) +
      clamp(profileGenreOverlap / 25, 0, 0.20) +
      normalizedRating * 0.20
    );

    const isIndie = gameGenres.includes('indie');
    const isLowerVisibility = (Number(game.globalRating) || 0) > 0 && (Number(game.globalRating) || 0) < 90;
    const discoveryBoost = isIndie && isLowerVisibility ? 0.08 : isIndie ? 0.04 : 0;

    const finalScore = baseRelevance + discoveryBoost;

    return {
      ...game,
      _score: finalScore,
      _reasons: {
        moodMatch,
        baseRelevance,
        discoveryBoost
      }
    };
  });

  const byRelevance = [...scored].sort((a, b) => (b._score || 0) - (a._score || 0));
  const explorationCount = Math.max(2, Math.round(10 * explorationRate));
  const exploitationCount = 10 - explorationCount;

  const exploitation = byRelevance.slice(0, 25).slice(0, exploitationCount);
  const explorationPool = byRelevance.slice(25);
  const exploration = [...explorationPool].sort(() => Math.random() - 0.5).slice(0, explorationCount);

  const mixed = [...exploitation, ...exploration];

  const seenTitles = new Set<string>();
  const deduped = mixed.filter(g => {
    const t = String(g.title || '').toLowerCase();
    if (!t || seenTitles.has(t)) return false;
    seenTitles.add(t);
    return true;
  });

  const filteredGames = selectedMoodToken
    ? (deduped.some(g => safeStringArray(g.moods).map(normalizeToken).includes(selectedMoodToken))
        ? deduped.filter(g => safeStringArray(g.moods).map(normalizeToken).includes(selectedMoodToken))
        : deduped)
    : deduped;
  
  // 5. Transform to canonical game objects for the UI
  const recommendations = filteredGames.map(game => {
    const reasons = [`Highly rated: ${game.globalRating}% on Steam`];
    if (selectedMoodToken && safeStringArray(game.moods).map(normalizeToken).includes(selectedMoodToken)) {
      reasons.unshift(`Matches your ${selectedMoodToken} mood`);
    }
    if (game._reasons?.discoveryBoost) {
      reasons.push('Discovery pick: boosting smaller/indie gems');
    }
    
    return {
      id: game.id,
      appId: game.id,
      title: game.title,
      name: game.title,
      description: game.description,
      globalRating: game.globalRating,
      genres: game.genres,
      moods: game.moods,
      reasons: reasons.slice(0, 2),
      coverImage: `https://cdn.akamai.steamstatic.com/steam/apps/${game.id}/capsule_616x353.jpg`,
      headerImage: `https://cdn.akamai.steamstatic.com/steam/apps/${game.id}/header.jpg`
    };
  });

  const shuffled = [...recommendations].sort(() => Math.random() - 0.5);

  // Extract unique genres for metadata
  const genresFound = [...new Set(shuffled.flatMap(g => g.genres))].map(name => ({
    id: name.toLowerCase(),
    name: name
  }));

  return {
    games: shuffled.slice(0, 10),
    totalFound: shuffled.length,
    genresSearched: genresFound
  };
}
