import { useState } from 'react'
import { useWishlistStore } from '../stores/wishlistStore'
import { fetchSteamWishlist } from '../services/steamWishlist'

export const useWishlist = () => {
  const { wishlist, lastSync, actions } = useWishlistStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const syncWishlist = async (steamId: string): Promise<void> => {
    if (!steamId) {
      setError('Steam ID is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const wishlistData = await fetchSteamWishlist(steamId)
      actions.setWishlist(wishlistData)
      actions.setLastSync(new Date())
    } catch (err) {
      setError('Failed to sync wishlist')
      console.error('Wishlist sync error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const clearWishlist = () => {
    actions.clearWishlist()
    setError(null)
  }

  return {
    wishlist,
    isLoading,
    error,
    lastSync,
    syncWishlist,
    clearWishlist
  }
}
