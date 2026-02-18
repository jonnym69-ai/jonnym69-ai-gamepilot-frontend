import { MoodId } from '@gamepilot/static-data';
import { normalizeMood, normalizeGenre, normalizeTimeKey } from './dataPipelineNormalizer';
import { getRefinedMoods, MOOD_TO_GENRE_MAPPING } from './moodGenreMapping';
import { assignSmartMoods } from './smartMoodAssigner';
import { getMasterMood } from '../constants/masterMoods';

export interface GameRecommendationOptions {
  masterMood: string;
  timeAvailable: string;
  preferredGenre: string;
  games: any[];
}

export interface RecommendationResult {
  game: any;
  score: number;
  reasoning: string;
  moodMatch: number;
  genreMatch: number;
  timeScore: number;
}

/**
 * CORE ENGINE: Safely calculates recommendations even with messy API data.
 */
export async function calculateGameRecommendations(options: GameRecommendationOptions): Promise<RecommendationResult[]> {
  const { masterMood, timeAvailable, preferredGenre, games } = options;
  
  if (!games || !Array.isArray(games)) return [];

  const safePrefGenre = (preferredGenre || 'all').toLowerCase();

  const safeTime = String(timeAvailable || 'medium').toLowerCase();

  const allResults = await Promise.all(
    games.map(async (game: any) => {
      if (!game) return null;

      // 1. ULTRA-SAFE GENRE EXTRACTION
      let gameGenres: string[] = [];
      const rawGenres = game.genres || game.tags || [];
      
      if (Array.isArray(rawGenres)) {
        gameGenres = rawGenres.map((g: any) => {
          if (!g) return '';
          // Handle { id: "Action", description: "..." } vs "Action"
          const val = typeof g === 'string' ? g : (g.name || g.id || g.description || '');
          return String(val).toLowerCase();
        }).filter(Boolean);
      }

      // 2. SMART MOOD EXTRACTION - Use comprehensive mood assignment
      let gameMoods: string[] = [];
      
      // First try existing moods, then use smart assigner if needed
      if (game.moods && Array.isArray(game.moods) && game.moods.length > 0) {
        gameMoods = game.moods.map((m: any) => String(m || '').toLowerCase());
      } else {
        // Use smart mood assigner for games without proper moods
        gameMoods = await assignSmartMoods(game);
      }

      // 3. MASTER MOOD MATCHING - Check if game matches any sub-moods of the selected master mood
      const masterMoodSubMoods: Record<string, string[]> = {
        'adrenaline': ['intense', 'competitive', 'high-energy', 'action-packed'],
        'brain-power': ['strategic', 'puzzle', 'thinking', 'tactical'],
        'zen': ['relaxing', 'cozy', 'atmospheric', 'wholesome'],
        'story': ['narrative', 'story-rich', 'immersive', 'adventure'],
        'social': ['multiplayer', 'cooperative', 'party', 'team-based'],
        'creative': ['building', 'crafting', 'sandbox', 'artistic'],
        'nostalgic': ['retro', 'classic', 'remastered', 'throwback']
      };

      const selectedLower = String(masterMood || '').toLowerCase().trim();
      const mappedSubMoods = (masterMoodSubMoods[masterMood] || []).map(m => String(m).toLowerCase().trim());
      const allowedSubMoods = [selectedLower, ...mappedSubMoods];

      const hasMoodMatch = gameMoods.some((m: any) => {
        const gameMood = String(m || '')
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/_+/g, '-');
        return allowedSubMoods.includes(gameMood);
      }) || (selectedLower === 'scary' && gameGenres.includes('horror'));

      // DEBUG: Log mood matching for troubleshooting
      if (game.title && game.title.includes('Stronghold')) {
        console.log('🔍 DEBUG Stronghold Moods:', {
          gameTitle: game.title,
          rawMoods: game.moods,
          refinedMoods: gameMoods,
          masterMood: masterMood,
          allowedSubMoods: allowedSubMoods,
          hasMoodMatch: hasMoodMatch
        });
      }

      // 4. GENRE MATCHING
      const hasGenreMatch = safePrefGenre === 'all' || 
                            gameGenres.some(g => g === safePrefGenre || safePrefGenre === g);

      // 5. TIME-BASED SCORING - Actually use the time selection
      let timeScore = 1; // Default score
      if (timeAvailable === 'short') {
        // Prefer games that can be played quickly (casual, puzzle, indie)
        const quickGenres = ['puzzle', 'casual', 'indie', 'hidden object', 'match-3'];
        const hasQuickGenre = gameGenres.some(g => quickGenres.includes(g));
        timeScore = hasQuickGenre ? 1.2 : 0.8;
      } else if (timeAvailable === 'long') {
        // Prefer games for longer sessions (rpg, strategy, adventure)
        const longGenres = ['rpg', 'strategy', 'adventure', 'simulation', 'mmorpg'];
        const hasLongGenre = gameGenres.some(g => longGenres.includes(g));
        timeScore = hasLongGenre ? 1.2 : 0.8;
      }
      // medium time gets default 1.0 score

      // Boost mood weight significantly, penalize genre bias
      const moodScore = hasMoodMatch ? 0.55 : 0.05;
      const genreScore = hasGenreMatch ? 0.12 : 0.04;
      const timeBonus = timeScore * 0.12;

      const hoursPlayed = Number((game as any).hoursPlayed ?? (game as any).totalPlaytime ?? 0) || 0;
      const playStatus = String((game as any).playStatus || '').toLowerCase();

      const isUnplayed = hoursPlayed === 0 || playStatus === 'unplayed';
      const isBacklog = playStatus === 'backlog';

      const noveltyBoost = isUnplayed ? 0.12 : isBacklog ? 0.06 : 0;
      const familiarityBoost = hoursPlayed > 20 ? 0.10 : hoursPlayed > 5 ? 0.06 : hoursPlayed > 0 ? 0.03 : 0;

      const lastPlayedRaw = (game as any).lastPlayed;
      const lastPlayedDate = lastPlayedRaw ? new Date(lastPlayedRaw) : null;
      const daysSinceLastPlayed = lastPlayedDate && !isNaN(lastPlayedDate.getTime())
        ? (Date.now() - lastPlayedDate.getTime()) / (1000 * 60 * 60 * 24)
        : null;

      const recencyBoost = daysSinceLastPlayed !== null && safeTime === 'short'
        ? (daysSinceLastPlayed <= 7 ? 0.06 : daysSinceLastPlayed <= 30 ? 0.03 : 0)
        : 0;

      const normalizedMoods = gameMoods.map(m => String(m).toLowerCase());
      const isExperimentalHeavy = normalizedMoods.length > 0 && normalizedMoods.every(m => ['experimental', 'creative', 'relaxing', 'strategic', 'high-energy'].includes(m));
      const experimentalPenalty = normalizedMoods.includes('experimental') && !hasMoodMatch ? -0.05 : 0;

      const overTaggedPenalty = gameMoods.length > 4 ? -0.10 : 0;
      const lowSignalPenalty = isExperimentalHeavy && !hasMoodMatch ? -0.08 : 0;

      const totalScore = moodScore + genreScore + timeBonus + noveltyBoost + familiarityBoost + recencyBoost + experimentalPenalty + overTaggedPenalty + lowSignalPenalty;

      return {
        game,
        score: totalScore,
        reasoning: hasMoodMatch
          ? `Perfect for your ${masterMood} mood.`
          : isUnplayed
            ? `A new pick that still fits your vibe.`
            : `A solid match for your session.`,
        moodMatch: hasMoodMatch ? 1 : 0,
        genreMatch: hasGenreMatch ? 1 : 0,
        timeScore: 1
      };
    })
  );

  // Filter out null results and sort
  const filteredResults = allResults
    .filter((res: any): res is RecommendationResult => res !== null)
    .filter((res: any) => res.moodMatch > 0);

  const topResults = filteredResults
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 60);

  const recentPicksKey = 'gp_recent_picks';
  const getRecentPicks = (): string[] => {
    try {
      const stored = localStorage.getItem(recentPicksKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };
  const updateRecentPicks = (newPickId: string) => {
    try {
      const recent = getRecentPicks();
      const updated = [newPickId, ...recent.filter(id => id !== newPickId)].slice(0, 5);
      localStorage.setItem(recentPicksKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const recentPicks = getRecentPicks();

  const lastPickKey = `gp_last_perfect_play_${String(masterMood || 'any')}_${safeTime}`;
  const lastPickedId = (() => {
    try {
      return localStorage.getItem(lastPickKey) || '';
    } catch {
      return '';
    }
  })();

  const ranked = [...topResults];
  const bestPick = ranked.find(r => 
    String(r.game?.id || '') !== lastPickedId && !recentPicks.includes(String(r.game?.id || ''))
  ) || ranked[0];

  const usedTitles = new Set<string>();
  const usedGenres = new Set<string>();
  const usedMoodKeys = new Set<string>();

  const accept = (res: RecommendationResult) => {
    const title = String(res.game?.title || '').toLowerCase();
    const mainGenre = String(res.game?.genres?.[0]?.name || res.game?.genres?.[0] || '').toLowerCase();
    const moods = Array.isArray(res.game?.moods) ? res.game.moods : [];
    const moodKey = moods.slice(0, 2).map((m: any) => String(m).toLowerCase()).sort().join('|');

    if (!title) return false;
    if (usedTitles.has(title)) return false;
    if (mainGenre && usedGenres.has(mainGenre)) return false;
    if (moodKey && usedMoodKeys.has(moodKey)) return false;

    usedTitles.add(title);
    if (mainGenre) usedGenres.add(mainGenre);
    if (moodKey) usedMoodKeys.add(moodKey);
    return true;
  };

  const picks: RecommendationResult[] = [];
  if (bestPick && accept(bestPick)) {
    picks.push(bestPick);
  }

  const explorationRate = safeTime === 'short' ? 0.30 : safeTime === 'long' ? 0.45 : 0.38;
  const explorationCount = Math.max(1, Math.round(5 * explorationRate));
  const exploitationCount = 5 - explorationCount;

  const exploitationPool = ranked.slice(0, 25);
  const explorationPool = ranked.slice(25);

  for (const res of exploitationPool) {
    if (picks.length >= exploitationCount) break;
    if (String(res.game?.id || '') === String(bestPick?.game?.id || '')) continue;
    if (String(res.game?.id || '') === lastPickedId) continue;
    if (recentPicks.includes(String(res.game?.id || ''))) continue;
    if (accept(res)) picks.push(res);
  }

  for (const res of explorationPool) {
    if (picks.length >= 5) break;
    if (String(res.game?.id || '') === lastPickedId) continue;
    if (recentPicks.includes(String(res.game?.id || ''))) continue;
    if (accept(res)) picks.push(res);
  }

  while (picks.length < 5 && ranked.length > 0) {
    const next = ranked[picks.length] || ranked[ranked.length - 1];
    if (next && String(next.game?.id || '') !== lastPickedId && !recentPicks.includes(String(next.game?.id || '')) && accept(next)) {
      picks.push(next);
    } else {
      break;
    }
  }

  const finalResults = picks.slice(0, 5);

  try {
    if (finalResults[0]?.game?.id) {
      localStorage.setItem(lastPickKey, String(finalResults[0].game.id));
      updateRecentPicks(String(finalResults[0].game.id));
    }
  } catch {
    // ignore
  }

  // DEBUG: Log top 3 recommendations to see what's being selected
  console.log('🔍 DEBUG Top Recommendations:', {
    masterMood: masterMood,
    totalResults: filteredResults.length,
    top3: finalResults.slice(0, 3).map((r: any) => ({
      title: r.game.title,
      score: r.score,
      moodMatch: r.moodMatch,
      genreMatch: r.genreMatch,
      moodCount: r.game.moods?.length || 0
    }))
  });

  return finalResults;
}

/**
 * PERSONA ENGINE: The function that was causing your toLowerCase() crash.
 * Fixed with safety checks on every line.
 */
export function getPersonalisedRecommendation(games: any[], persona: any): RecommendationResult | null {
  if (!games || games.length === 0) return null;

  try {
    const scored = games.map(game => {
      if (!game) return { game, score: 0 };
      
      let score = 0;
      const gameGenres = Array.isArray(game.genres) ? game.genres : [];
      
      // Safety check for persona.topGenres
      if (persona?.topGenres && Array.isArray(persona.topGenres)) {
        persona.topGenres.forEach((pref: any) => {
          const safePref = String(pref || '').toLowerCase();
          gameGenres.forEach((g: any) => {
            const gName = String(typeof g === 'string' ? g : (g.name || g.id || '')).toLowerCase();
            if (gName === safePref) score += 10;
          });
        });
      }

      return { game, score };
    });

    const top = scored.sort((a, b) => b.score - a.score)[0];
    
    return {
      game: top.game,
      score: top.score,
      reasoning: "Based on your play style.",
      moodMatch: 1,
      genreMatch: 1,
      timeScore: 1
    };
  } catch (err) {
    console.error("Persona match failed, falling back", err);
    return { game: games[0], score: 1, reasoning: "Recommended for you", moodMatch: 1, genreMatch: 1, timeScore: 1 };
  }
}

// Keep your existing exports at the bottom
export default {
  calculateGameRecommendations,
  getPersonalisedRecommendation
};