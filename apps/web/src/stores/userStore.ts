import { create } from 'zustand'

interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

interface UserStore {
  user: User | null
  loading: boolean
  error: string | null
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  loading: false,
  error: null,
  
  setUser: (user: User | null) => set({ user, loading: false, error: null }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
}))
