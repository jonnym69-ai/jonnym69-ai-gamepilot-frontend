/**
 * Data Pipeline Normalizer
 * * Processes raw Steam API responses and normalizes them for our database schema
 * Handles genre mapping, mood assignment, and data validation
 */

import { GENRES } from '@gamepilot/static-data'
import { EnhancedMoodId } from '@gamepilot/static-data'
import { PlatformCode } from '@gamepilot/shared'

// --- 1. Interfaces ---
interface SteamApiGame {
  appid: number
  name: string
  playtime_forever: number
  img_icon_url: string
  img_logo_url: string
  has_community_visible_stats: boolean
  genres?: Array<{
    id: string | number
    description: string
  }>
  platforms?: {
    windows: boolean
    mac: boolean
    linux: boolean
  }
  release_date?: {
    date: string
  }
  rtime_last_played?: number
  detailed_description?: string
  short_description?: string
}

export interface NormalizedGame {
  id: string
  title: string
  description?: string
  coverImage?: string
  appId?: number
  genres: Array<{
    id: string
    name: string
    color: string
    subgenres?: any 
  }>
  platforms: Array<{
    id: string
    name: string
    code: string
    isConnected: boolean
  }>
  moods: EnhancedMoodId[]
  emotionalTags: string[]
  playStatus: 'unplayed' | 'playing' | 'completed' | 'paused' | 'abandoned'
  hoursPlayed: number
  userRating?: number
  globalRating?: number
  lastPlayed?: Date
  isFavorite: boolean
  notes?: string
  releaseYear?: number
  addedAt: Date
}

// --- 2. Named Exports (These fix the SyntaxError) ---

export const CANONICAL_GENRES = [
  'Action', 'RPG', 'Strategy', 'Adventure', 'Simulation', 
  'Puzzle', 'Sports', 'Racing', 'Horror', 'Indie', 'FPS', 'Multiplayer'
];

export const CANONICAL_MOODS = [
  'intense', 'strategic', 'relaxing', 'creative', 'high-energy', 
  'atmospheric', 'challenging', 'story-rich', 'competitive', 'social', 
  'experimental', 'mindful', 'nostalgic', 'gritty', 'surreal', 'action-packed'
];

export function normalizeTimeKey(time: string): string {
  if (!time) return '60';
  const t = time.toLowerCase();
  if (t === 'short' || t === '15' || t === '30') return '30';
  if (t === 'medium' || t === '60' || t === '90') return '60';
  if (t === 'long' || t === '120' || t === '180') return '120';
  return t.replace(/\D/g, '') || '60';
}

export function normalizeMood(mood: string): EnhancedMoodId {
  return (mood || '').toLowerCase() as EnhancedMoodId;
}

export function normalizeGenre(genre: string): string {
  if (!genre) return '';
  return genre.toLowerCase().trim();
}

export function normalizeGamesArray(games: any[]): any[] {
  if (!Array.isArray(games)) return [];
  return games.map(g => ({
    ...g,
    moods: Array.isArray(g.moods) ? g.moods : [],
    genres: Array.isArray(g.genres) ? g.genres : []
  }));
}

// --- 3. Steam API Logic ---

export function normalizeSteamGames(steamGames: SteamApiGame[]): NormalizedGame[] {
  return steamGames.map(game => ({
    id: `steam-${game.appid}`,
    title: game.name || 'Unknown Game',
    description: game.detailed_description || game.short_description || '',
    coverImage: game.img_icon_url || game.img_logo_url || '',
    appId: game.appid,
    genres: normalizeGenres(game),
    platforms: normalizePlatforms(game),
    moods: [],
    emotionalTags: [],
    playStatus: 'unplayed',
    hoursPlayed: Math.floor((game.playtime_forever || 0) / 60),
    userRating: 0,
    globalRating: 0,
    lastPlayed: game.rtime_last_played ? new Date(game.rtime_last_played * 1000) : undefined,
    isFavorite: false,
    notes: '',
    releaseYear: game.release_date?.date ? new Date(game.release_date.date).getFullYear() : undefined,
    addedAt: new Date()
  }))
}

export function normalizeGenres(game: SteamApiGame): NormalizedGame['genres'] {
  if (!game.genres || !Array.isArray(game.genres)) return [];
  return game.genres.map((genre: any) => {
    let genreId: string;
    let genreName: string;
    if (typeof genre.id === 'number') {
      genreId = genre.id.toString();
      genreName = getGenreNameById(genreId) || `Genre ${genreId}`;
    } else {
      genreName = genre.description || genre.name || 'Unknown Genre';
      genreId = genreName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    }
    return { id: genreId, name: genreName, color: getGenreColor(genreName), subgenres: [] };
  })
}

function getGenreColor(genreName: string): string {
  const genre = GENRES.find(g => g.id === genreName);
  return genre?.color || '#6B728';
}

function getGenreNameById(genreId: string): string | undefined {
  const genreIdMap: Record<string, string> = {
    '0': 'action', '1': 'strategy', '2': 'rpg', '3': 'simulation',
    '4': 'sports', '5': 'racing', '6': 'adventure', '7': 'indie'
  };
  return genreIdMap[genreId];
}

export function normalizePlatforms(game: SteamApiGame): NormalizedGame['platforms'] {
  return [{
    id: 'steam',
    name: 'Steam',
    code: PlatformCode.STEAM,
    isConnected: true
  }];
}

// --- 4. Default Export (for backward compatibility) ---
export default {
  normalizeSteamGames,
  normalizeGenres,
  normalizePlatforms,
  normalizeTimeKey,
  normalizeMood,
  normalizeGenre,
  normalizeGamesArray,
  CANONICAL_GENRES,
  CANONICAL_MOODS
};