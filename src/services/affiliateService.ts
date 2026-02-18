export interface AffiliateLink {
  store: string
  label: string
  url: string
  commission: string
  color: string
  icon: string
}

export interface PurchaseOption {
  steam: {
    url: string
    price: number
    originalPrice?: number
    discountPercent?: number
  }
  affiliates: AffiliateLink[]
}

export class AffiliateService {
  // Affiliate program configurations
  private static readonly AFFILIATES = {
    humbleBundle: {
      name: 'Humble Bundle',
      label: 'Humble',
      commission: '5-10%',
      color: 'from-orange-500 to-red-500',
      icon: '🎁',
      baseUrl: 'https://www.humblebundle.com/store/search',
      // Note: Actual affiliate links require affiliate ID
      placeholderUrl: 'https://www.humblebundle.com/store'
    },
    fanatical: {
      name: 'Fanatical',
      label: 'Fanatical',
      commission: '3-8%',
      color: 'from-purple-500 to-pink-500',
      icon: '🎯',
      baseUrl: 'https://www.fanatical.com',
      placeholderUrl: 'https://www.fanatical.com'
    },
    greenManGaming: {
      name: 'Green Man Gaming',
      label: 'GMG',
      commission: '2-6%',
      color: 'from-green-500 to-teal-500',
      icon: '🌿',
      baseUrl: 'https://www.greenmangaming.com',
      placeholderUrl: 'https://www.greenmangaming.com'
    },
    gog: {
      name: 'GOG',
      label: 'GOG',
      commission: '5%',
      color: 'from-blue-500 to-cyan-500',
      icon: '🎮',
      baseUrl: 'https://www.gog.com',
      placeholderUrl: 'https://www.gog.com'
    },
    epic: {
      name: 'Epic Games Store',
      label: 'Epic',
      commission: '5%',
      color: 'from-gray-500 to-gray-600',
      icon: '⚡',
      baseUrl: 'https://www.epicgames.com/store',
      placeholderUrl: 'https://www.epicgames.com/store'
    }
  }

  /**
   * Generate affiliate links for a game
   */
  static generateAffiliateLinks(gameTitle: string, steamAppId: number): AffiliateLink[] {
    const links: AffiliateLink[] = []

    // For now, we'll generate direct links to stores
    // These can be upgraded to actual affiliate links once affiliate IDs are obtained

    // Humble Bundle - often has the game or similar titles
    links.push({
      store: 'humbleBundle',
      label: this.AFFILIATES.humbleBundle.label,
      url: `${this.AFFILIATES.humbleBundle.baseUrl}?search=${encodeURIComponent(gameTitle)}`,
      commission: this.AFFILIATES.humbleBundle.commission,
      color: this.AFFILIATES.humbleBundle.color,
      icon: this.AFFILIATES.humbleBundle.icon
    })

    // Fanatical - good for deals
    links.push({
      store: 'fanatical',
      label: this.AFFILIATES.fanatical.label,
      url: `${this.AFFILIATES.fanatical.baseUrl}/en/search?search=${encodeURIComponent(gameTitle)}`,
      commission: this.AFFILIATES.fanatical.commission,
      color: this.AFFILIATES.fanatical.color,
      icon: this.AFFILIATES.fanatical.icon
    })

    // Green Man Gaming - Steam keys and deals
    links.push({
      store: 'greenManGaming',
      label: this.AFFILIATES.greenManGaming.label,
      url: `${this.AFFILIATES.greenManGaming.baseUrl}/search?query=${encodeURIComponent(gameTitle)}`,
      commission: this.AFFILIATES.greenManGaming.commission,
      color: this.AFFILIATES.greenManGaming.color,
      icon: this.AFFILIATES.greenManGaming.icon
    })

    // GOG - DRM-free versions
    links.push({
      store: 'gog',
      label: this.AFFILIATES.gog.label,
      url: `${this.AFFILIATES.gog.baseUrl}/en/games?query=${encodeURIComponent(gameTitle)}`,
      commission: this.AFFILIATES.gog.commission,
      color: this.AFFILIATES.gog.color,
      icon: this.AFFILIATES.gog.icon
    })

    // Epic Games - if the game is available there
    links.push({
      store: 'epic',
      label: this.AFFILIATES.epic.label,
      url: `${this.AFFILIATES.epic.baseUrl}/en-US/browse?q=${encodeURIComponent(gameTitle)}`,
      commission: this.AFFILIATES.epic.commission,
      color: this.AFFILIATES.epic.color,
      icon: this.AFFILIATES.epic.icon
    })

    return links
  }

  /**
   * Get purchase options for a game (Steam + affiliates)
   */
  static getPurchaseOptions(gameTitle: string, steamAppId: number, steamPrice: number, steamOriginalPrice?: number, steamDiscountPercent?: number): PurchaseOption {
    return {
      steam: {
        url: `https://store.steampowered.com/app/${steamAppId}`,
        price: steamPrice,
        originalPrice: steamOriginalPrice,
        discountPercent: steamDiscountPercent
      },
      affiliates: this.generateAffiliateLinks(gameTitle, steamAppId)
    }
  }

  /**
   * Check if affiliate links are configured (for future affiliate ID support)
   */
  static hasAffiliateIds(): boolean {
    // This will return true when actual affiliate IDs are configured
    // For now, we just provide direct store links
    return false
  }

  /**
   * Get affiliate status message for display
   */
  static getAffiliateStatusMessage(): string {
    if (this.hasAffiliateIds()) {
      return "💰 Affiliate links active - earn commission on purchases!"
    }
    return "🔗 Direct store links - sign up for affiliates to earn commission"
  }
}
