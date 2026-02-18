// Steam Web API Service
import type { SteamGame } from '@gamepilot/integrations'
import { apiFetch } from '../config/api'

interface SteamApiGame {
  appid: number
  name: string
  playtime_forever: number
  img_icon_url: string
  img_logo_url: string
  has_community_visible_stats: boolean
  playtime_windows_forever: number
  playtime_mac_forever: number
  playtime_linux_forever: number
}

interface SteamGamesV2Response {
  success: boolean
  data: {
    game_count: number
    games: SteamApiGame[]
  }
}

export class SteamAPI {
  private static readonly BASE_APP_URL = 'https://store.steampowered.com/api/appdetails/'

  static async getOwnedGames(steamId: string, apiKey: string): Promise<SteamApiGame[]> {
    try {
      // Use new v2 endpoint with apiFetch - include /api prefix
      const url = `api/steam/games/v2?steamId=${encodeURIComponent(steamId)}&apiKey=${encodeURIComponent(apiKey)}`
      console.log('🔍 SteamAPI: Fetching from URL:', url)
      
      const response = await apiFetch(url)
      console.log('🔍 SteamAPI: Response status:', response.status)
      console.log('🔍 SteamAPI: Response ok:', response.ok)
      
      if (!response.ok) {
        console.error('🔍 SteamAPI: Backend API Error:', response.status, response.statusText)
        return []
      }
      
      const data: SteamGamesV2Response = await response.json()
      console.log('🔍 SteamAPI: Raw response data:', data)
      
      // New v2 endpoint returns {success: true, data: {game_count, games: [...]}}
      if (data.success && data.data && Array.isArray(data.data.games)) {
        console.log('🔍 SteamAPI: Games found:', data.data.games.length)
        return data.data.games.filter(game => game.name && game.appid)
      }
      
      console.log('🔍 SteamAPI: No games in response or invalid format')
      return []
    } catch (error) {
      console.error('🔍 SteamAPI: Steam API Error:', error)
      return []
    }
  }

  static async getGameDetails(appId: string): Promise<any> {
    try {
      const url = `${this.BASE_APP_URL}?appids=${appId}&format=json`
      const response = await fetch(url)
      const data = await response.json()
      return data[appId]?.data
    } catch (error) {
      console.error('Steam App Details Error:', error)
      return null
    }
  }

  static transformSteamApiGame(apiGame: SteamApiGame): SteamGame {
    return {
      appId: apiGame.appid,
      name: apiGame.name,
      steamId: '', // Will be filled by caller
      playtimeForever: apiGame.playtime_forever,
      playtimeWindows: apiGame.playtime_windows_forever,
      playtimeMac: apiGame.playtime_mac_forever,
      playtimeLinux: apiGame.playtime_linux_forever,
      imgIconUrl: apiGame.img_icon_url,
      imgLogoUrl: apiGame.img_logo_url,
      hasCommunityVisibleStats: apiGame.has_community_visible_stats,
      playtimeLastTwoWeeks: 0, // Not available in this API response
      playtimeAtLastUpdate: new Date(),
      headerImage: '',
      shortDescription: '',
      supportedLanguages: [],
      developers: [],
      publishers: [],
      genres: [],
      categories: [],
      releaseDate: new Date(),
      metacriticScore: undefined,
      recommendations: 0,
      isFree: false,
      priceOverview: undefined,
      platforms: []
    }
  }

  static convertSteamGameToGame(steamGame: SteamGame): Omit<any, 'id'> {
    return {
      title: steamGame.name,
      launcherId: steamGame.appId.toString(),
      platforms: ['STEAM'],
      status: 'backlog',
      playtime: Math.floor(steamGame.playtimeForever / 60), // Convert minutes to hours
      coverImage: steamGame.imgLogoUrl || steamGame.imgIconUrl,
      genres: [], // Would need additional API call for genres
      tags: [],
      achievements: { unlocked: 0, total: 0 }
    }
  }
}

// Steam ID extraction utilities
export class SteamUtils {
  static extractSteamIdFromProfileUrl(url: string): string | null {
    const match = url.match(/steamcommunity\.com\/profiles\/(\d+)/)
    return match ? match[1] : null
  }

  static extractSteamIdFromCustomUrl(url: string): string | null {
    const match = url.match(/steamcommunity\.com\/id\/([^\/]+)/)
    return match ? match[1] : null
  }

  static getSteamLoginUrl(): string {
    const returnUrl = encodeURIComponent(window.location.origin + '/auth/steam/callback')
    return `https://steamcommunity.com/openid/login?openid.claimed_id=id&openid.identity=https%3A%2F%2Fsteamcommunity.com%2Fopenid%2Flogin&openid.return_to=${returnUrl}&openid.realm=https%3A%2F%2Fsteamcommunity.com%2Fopenid%2Flogin&openid.mode=checkid_setup`
  }
}
