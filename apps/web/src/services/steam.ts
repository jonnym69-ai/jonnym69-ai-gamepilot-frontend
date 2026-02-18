import type { SteamProfile } from '@shared/models/steamProfile'
import type { SteamGame as CanonicalSteamGame } from '@gamepilot/integrations'
import { apiFetch } from '../config/api'

export interface SteamGame extends Omit<CanonicalSteamGame, 'steamId' | 'appId'> {
  appId: string
  playtimeLastTwoWeeks: number
  lastPlayed?: string
}

export interface SteamLibrary {
  steamId: string
  gameCount: number
  games: SteamGame[]
}

export interface FeaturedGame {
  id: string
  name: string
  appId: string
  headerImage: string
  shortDescription: string
  genres: string[]
  releaseDate: string
  priceOverview: {
    final: number
    original: number
    discountPercent: number
    currency: string
  }
  platforms: string[]
}

export async function getSteamProfile(): Promise<SteamProfile> {
  const response = await apiFetch('api/steam/profile')
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Steam profile: ${response.status} ${response.statusText}`)
  }
  
  return response.json()
}

export async function getSteamLibrary(steamId: string): Promise<SteamLibrary> {
  const response = await apiFetch(`api/steam/library/${steamId}`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Steam library: ${response.status} ${response.statusText}`)
  }
  
  return response.json()
}

export async function getFeaturedGames(): Promise<FeaturedGame[]> {
  const response = await apiFetch('api/steam/featured')
  
  if (!response.ok) {
    throw new Error(`Failed to fetch featured games: ${response.status} ${response.statusText}`)
  }
  
  return response.json()
}

// Transform Steam library data to our Game interface
export function transformSteamLibrary(steamLibrary: SteamLibrary) {
  return steamLibrary.games.map(game => ({
    id: game.appId,
    title: game.name,
    platforms: ['Steam'],
    status: game.playtimeForever > 0 ? 'playing' : 'unplayed',
    playtime: Math.floor(game.playtimeForever / 60), // Convert minutes to hours
    coverImage: game.imgLogoUrl,
    launcherId: game.appId,
    tags: [], // Steam doesn't provide tags in library API
    description: '',
    developer: '',
    publisher: '',
    releaseYear: new Date().getFullYear(),
    userRating: 0,
    globalRating: 0,
    lastPlayed: game.lastPlayed ? new Date(game.lastPlayed) : undefined
  }))
}
