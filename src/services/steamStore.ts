export interface SteamAppDetails {
  success: boolean
  data: {
    type: string
    name: string
    steam_appid: number
    capsule_image: string
    header_image: string
    small_header_image: string
    required_age: number
    is_free: boolean
    controller_support: string
    dlc: boolean
    detailed_description: string
    about_the_game: string
    short_description: string
    supported_languages: string
    website: string
    pc_requirements: {
      minimum: string[]
      recommended: string[]
    }
    mac_requirements: {
      minimum: string[]
      recommended: string[]
    }
    linux_requirements: {
      minimum: string[]
      recommended: string[]
    }
    legal_notice: string
    developers: string[]
    publishers: string[]
    price_overview?: {
      currency: string
      initial: number
      final: number
      discount_percent: number
      initial_formatted: string
      final_formatted: string
    }
    platforms: {
      windows: boolean
      mac: boolean
      linux: boolean
    }
    metacritic?: {
      score: number
      url: string
    }
    categories: Array<{
      id: number
      description: string
    }>
    genres: Array<{
      id: string
      description: string
    }>
    screenshots: Array<{
      id: number
      path_thumbnail: string
      path_full: string
    }>
    movies: Array<{
      id: number
      name: string
      thumbnail: string
      webm: {
        '480': string
        max: string
      }
      mp4: {
        '480': string
        max: string
      }
    }>
    achievements?: {
      total: number
      highlighted: Array<{
        name: string
        path: string
      }>
    }
    release_date: {
      coming_soon: boolean
      date: string
    }
    support_info: {
      url: string
      email: string
    }
    background: string
    content_descriptors: {
      ids: number[]
      notes: string
    }
  }
}

export interface PriceInfo {
  currency: string
  initial: number
  final: number
  discount_percent: number
  isFree: boolean
}

export interface SteamStoreData {
  success: boolean
  data: {
    type: string
    name: string
    steam_appid: number
    required_age: number
    is_free: boolean
    controller_support: string
    dlc: boolean
    detailed_description: string
    about_the_game: string
    short_description: string
    supported_languages: string
    header_image: string
    website: string
    pc_requirements: {
      minimum: string[]
      recommended: string[]
    }
    mac_requirements: {
      minimum: string[]
      recommended: string[]
    }
    linux_requirements: {
      minimum: string[]
      recommended: string[]
    }
    legal_notice: string
    developers: string[]
    publishers: string[]
    price_overview?: {
      currency: string
      initial: number
      final: number
      discount_percent: number
      initial_formatted: string
      final_formatted: string
    }
    platforms: {
      windows: boolean
      mac: boolean
      linux: boolean
    }
    metacritic?: {
      score: number
      url: string
    }
    categories: Array<{
      id: number
      description: string
    }>
    genres: Array<{
      id: string
      description: string
    }>
    screenshots: Array<{
      id: number
      path_thumbnail: string
      path_full: string
    }>
    movies: Array<{
      id: number
      name: string
      thumbnail: string
      webm: {
        '480': string
        max: string
      }
      mp4: {
        '480': string
        max: string
      }
    }>
    achievements?: {
      total: number
      highlighted: Array<{
        name: string
        path: string
      }>
    }
    release_date: {
      coming_soon: boolean
      date: string
    }
    support_info: {
      url: string
      email: string
    }
    background: string
    content_descriptors: {
      ids: number[]
      notes: string
    }
  }
}

export function parsePriceInfo(storeData: SteamStoreData): PriceInfo | undefined {
  if (!storeData?.data?.price_overview) {
    return undefined
  }

  const priceOverview = storeData.data.price_overview
  
  return {
    currency: priceOverview.currency,
    initial: priceOverview.initial,
    final: priceOverview.final,
    discount_percent: priceOverview.discount_percent,
    isFree: storeData.data.is_free
  }
}

export async function fetchSteamAppDetails(appId: number): Promise<SteamAppDetails | null> {
  try {
    const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data[appId] || !data[appId].success) {
      throw new Error(`Failed to fetch app details for app ${appId}`)
    }

    return data[appId] as SteamAppDetails
  } catch (error) {
    console.warn(`Failed to fetch Steam app details for app ${appId}:`, error)
    return null
  }
}

export async function fetchSteamStoreData(appId: number): Promise<SteamStoreData | null> {
  try {
    const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data[appId] || !data[appId].success) {
      throw new Error(`Failed to fetch store data for app ${appId}`)
    }

    return data[appId] as SteamStoreData
  } catch (error) {
    console.warn(`Failed to fetch Steam store data for app ${appId}:`, error)
    return null
  }
}
