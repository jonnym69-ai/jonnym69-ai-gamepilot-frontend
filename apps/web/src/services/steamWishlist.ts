    export interface SteamWishlistItem {
  appid: number
  name: string
  capsule_image: string
  header_image: string
  small_header_image: string
  price_overview?: {
    currency: string
    initial: number
    final: number
    discount_percent: number
    initial_formatted: string
    final_formatted: string
  }
  release_date: string
  tags: string[]
  type: string
  is_free_game: boolean
}

export interface ParsedWishlistItem {
  appId: number
  name: string
  capsuleImage: string
  price?: {
    currency: string
    initial: number
    final: number
    discount_percent: number
    initial_formatted: string
    final_formatted: string
  }
  releaseDate: string
  tags: string[]
  isFree: boolean
}

export async function fetchSteamWishlist(steamId: string): Promise<ParsedWishlistItem[]> {
  try {
    const response = await fetch(`https://store.steampowered.com/wishlist/profiles/${steamId}/wishlistdata/`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // Check if wishlist is empty or private
    if (!data || Object.keys(data).length === 0) {
      return []
    }

    // Parse the wishlist data object
    const wishlistItems: ParsedWishlistItem[] = []
    
    Object.entries(data as Record<string, SteamWishlistItem>).forEach(([, item]) => {
      if (item && item.name && item.appid) {
        const parsedItem: ParsedWishlistItem = {
          appId: item.appid,
          name: item.name,
          capsuleImage: item.capsule_image || item.small_header_image || item.header_image,
          price: item.price_overview ? {
            currency: item.price_overview.currency,
            initial: item.price_overview.initial,
            final: item.price_overview.final,
            discount_percent: item.price_overview.discount_percent,
            initial_formatted: item.price_overview.initial_formatted,
            final_formatted: item.price_overview.final_formatted
          } : undefined,
          releaseDate: item.release_date,
          tags: item.tags || [],
          isFree: item.is_free_game || false
        }
        wishlistItems.push(parsedItem)
      }
    })

    return wishlistItems
  } catch (error) {
    console.warn(`Failed to fetch Steam wishlist for user ${steamId}:`, error)
    
    // Check if it's a private wishlist (common error)
    if (error instanceof Error && error.message.includes('403')) {
      console.info('Steam wishlist is private or not accessible')
    }
    
    return []
  }
}
