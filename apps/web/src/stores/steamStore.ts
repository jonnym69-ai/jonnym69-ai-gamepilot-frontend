import { create } from 'zustand'

interface SteamStore {
  recentlyPlayed: any[]
  loading: boolean
  error: string | null
}

export const useSteamStore = create<SteamStore>((set) => ({
  recentlyPlayed: [],
  loading: false,
  error: null,
  
  setRecentlyPlayed: (recentlyPlayed: any[]) => set({ recentlyPlayed }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
}))
