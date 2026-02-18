import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ParsedWishlistItem {
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

interface WishlistStore {
  wishlist: ParsedWishlistItem[]
  lastSync: Date | null
  actions: {
    setWishlist: (games: ParsedWishlistItem[]) => void
    clearWishlist: () => void
    setLastSync: (date: Date | null) => void
  }
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set) => ({
      wishlist: [],
      lastSync: null,
      
      actions: {
        setWishlist: (games: ParsedWishlistItem[]) => {
          set({ wishlist: games })
        },
        
        clearWishlist: () => {
          set({ wishlist: [], lastSync: null })
        },
        
        setLastSync: (date: Date | null) => {
          set({ lastSync: date })
        }
      }
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({
        wishlist: state.wishlist,
        lastSync: state.lastSync
      })
    }
  )
)
