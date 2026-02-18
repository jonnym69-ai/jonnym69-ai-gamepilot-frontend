import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PriceInfo } from '../services/steamStore'

interface PriceStore {
  priceCache: Record<number, PriceInfo>
  lastUpdated: Date | null
  actions: {
    setPrice: (appId: number, price: PriceInfo) => void
    setPrices: (batch: Record<number, PriceInfo>) => void
    clearCache: () => void
  }
}

export const usePriceStore = create<PriceStore>()(
  persist(
    (set) => ({
      priceCache: {},
      lastUpdated: null,
      
      actions: {
        setPrice: (appId: number, price: PriceInfo) => {
          set((state) => ({
            priceCache: { ...state.priceCache, [appId]: price },
            lastUpdated: new Date()
          }))
        },
        
        setPrices: (batch: Record<number, PriceInfo>) => {
          set((state) => ({
            priceCache: { ...state.priceCache, ...batch },
            lastUpdated: new Date()
          }))
        },
        
        clearCache: () => {
          set({ priceCache: {}, lastUpdated: null })
        }
      }
    }),
    {
      name: 'price-storage',
      partialize: (state) => ({
        priceCache: state.priceCache,
        lastUpdated: state.lastUpdated
      })
    }
  )
)
