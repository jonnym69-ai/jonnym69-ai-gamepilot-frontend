import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { useAuthStore } from './authStore'
import { supabase } from '../utils/supabase'

export type SubscriptionTier = 'free' | 'premium'

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  currency: string
  interval: 'month' | 'year'
  features: string[]
  popular?: boolean
}

export interface UserSubscription {
  tier: SubscriptionTier
  planId?: string
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
  trialEnd?: string
}

interface SubscriptionState {
  subscription: UserSubscription
  isLoading: boolean
  plans: SubscriptionPlan[]
  
  // Actions
  setSubscription: (subscription: UserSubscription) => void
  setLoading: (loading: boolean) => void
  upgradeToPremium: (planId: string) => Promise<void>
  cancelSubscription: () => Promise<void>
  checkSubscriptionStatus: () => Promise<void>
  getPlans: () => SubscriptionPlan[]
  isPremium: () => boolean
  canUseFeature: (feature: string) => boolean
  trackFeatureUsage: (feature: string) => Promise<boolean>
  getRemainingUsage: (feature: string) => Promise<number>
}

const defaultSubscription: UserSubscription = {
  tier: 'free',
  status: 'active'
}

const globalPlans: SubscriptionPlan[] = [
  {
    id: 'premium-monthly-gbp',
    name: 'Premium Monthly',
    price: 7.99,
    currency: 'GBP',
    interval: 'month',
    features: [
      'Unlimited RAWG API calls',
      'Advanced analytics dashboard',
      'AI-powered recommendations',
      'Custom themes & profiles',
      'Cloud sync & backup',
      'Priority support',
      'Early access to features'
    ]
  },
  {
    id: 'premium-yearly-gbp',
    name: 'Premium Yearly',
    price: 79.99,
    currency: 'GBP',
    interval: 'year',
    features: [
      'Everything in monthly',
      '2 months free',
      'Exclusive yearly badges',
      'Beta feature access'
    ],
    popular: true
  }
]

// Feature limits for free users
const FEATURE_LIMITS = {
  'rawg-api-calls': 50, // per day
  'recommendations': 10, // per day
  'analytics-depth': 'basic', // 'basic' or 'advanced'
  'themes': 'limited', // 'limited' or 'unlimited'
  'export': false, // boolean
  'cloud-sync': false // boolean
}

export const useSubscriptionStore = create<SubscriptionState>()(
  devtools(
    persist(
      (set, get) => ({
        subscription: defaultSubscription,
        isLoading: false,
        plans: globalPlans,

        setSubscription: (subscription) => set({ subscription }),

        setLoading: (loading: boolean) => set({ isLoading: loading }),

        upgradeToPremium: async (planId: string) => {
          set({ isLoading: true })
          try {
            const user = useAuthStore.getState().user
            if (!user) throw new Error('Not authenticated')

            // Create Stripe checkout session via Supabase Edge Function
            const { data, error } = await supabase.functions.invoke('create-checkout-session', {
              body: { planId, userId: user.id }
            })

            if (error) throw error

            // Redirect to Stripe checkout
            window.location.href = data.url
          } catch (error) {
            console.error('Upgrade failed:', error)
            set({ isLoading: false })
            throw error
          }
        },

        cancelSubscription: async () => {
          set({ isLoading: true })
          try {
            const user = useAuthStore.getState().user
            if (!user) throw new Error('Not authenticated')

            const { error } = await supabase.functions.invoke('cancel-subscription', {
              body: { userId: user.id }
            })

            if (error) throw error

            // Update local state
            set(state => ({
              subscription: { ...state.subscription, cancelAtPeriodEnd: true },
              isLoading: false
            }))
          } catch (error) {
            console.error('Cancel failed:', error)
            set({ isLoading: false })
            throw error
          }
        },

        checkSubscriptionStatus: async () => {
          try {
            const user = useAuthStore.getState().user
            if (!user) return

            // Get subscription from profile
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('subscription_tier, subscription_status, subscription_end_date')
              .eq('id', user.id)
              .single()

            if (error) {
              console.error('Subscription check error:', error)
              return
            }

            const subscription: UserSubscription = {
              tier: profile.subscription_tier as SubscriptionTier || 'free',
              status: profile.subscription_status as any || 'active',
              currentPeriodEnd: profile.subscription_end_date || undefined
            }

            set({ subscription })
          } catch (error) {
            console.error('Subscription status check failed:', error)
          }
        },

        getPlans: () => get().plans,

        isPremium: () => {
          const { subscription } = get()
          return subscription.tier === 'premium' && subscription.status === 'active'
        },

        canUseFeature: (feature: string) => {
          const { isPremium } = get()

          if (isPremium()) return true

          // Define free tier limitations
          const freeFeatures = [
            'library-management',
            'basic-mood-analysis',
            'standard-recommendations',
            'continue-playing',
            'basic-profile-customization',
            'basic-analytics',
            'steam-integration'
          ]

          return freeFeatures.includes(feature)
        },

        trackFeatureUsage: async (feature: string) => {
          const user = useAuthStore.getState().user
          if (!user) return false

          const { isPremium } = get()
          if (isPremium()) return true // Premium users have unlimited usage

          try {
            if (feature === 'rawg-api-calls') {
              // Check and increment API call count
              const { data, error } = await supabase.rpc('can_make_api_call', {
                user_id: user.id
              })

              if (error) {
                console.error('API call check error:', error)
                return false
              }

              if (data) {
                // Increment the counter
                await supabase.rpc('increment_api_calls', {
                  user_id: user.id
                })
                return true
              }

              return false
            }

            // For other features, we could implement similar tracking
            // For now, return true for non-API features
            return true
          } catch (error) {
            console.error('Feature usage tracking error:', error)
            return false
          }
        },

        getRemainingUsage: async (feature: string) => {
          const user = useAuthStore.getState().user
          if (!user) return 0

          const { isPremium } = get()
          if (isPremium()) return -1 // Unlimited

          try {
            if (feature === 'rawg-api-calls') {
              const { data: profile } = await supabase
                .from('profiles')
                .select('rawg_api_calls_today')
                .eq('id', user.id)
                .single()

              const used = profile?.rawg_api_calls_today || 0
              return Math.max(0, FEATURE_LIMITS['rawg-api-calls'] - used)
            }

            return 0
          } catch (error) {
            console.error('Usage check error:', error)
            return 0
          }
        }
      }),
      {
        name: 'subscription-store',
        partialize: (state) => ({ subscription: state.subscription })
      }
    )
  )
)

// Auto-check subscription status when auth state changes
if (typeof window !== 'undefined') {
  useAuthStore.subscribe((state) => {
    if (state.user) {
      useSubscriptionStore.getState().checkSubscriptionStatus()
    } else {
      useSubscriptionStore.setState({
        subscription: defaultSubscription
      })
    }
  })
}
