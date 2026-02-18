import React from 'react'
import { motion } from 'framer-motion'
import { useSubscriptionStore } from '../../stores/subscriptionStore'
import { Crown, Star, Check } from 'lucide-react'

export const PremiumStatus: React.FC = () => {
  const { subscription, isPremium } = useSubscriptionStore()

  if (!isPremium()) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-sm font-semibold"
    >
      <Crown className="w-4 h-4" />
      <span>Premium</span>
    </motion.div>
  )
}

export const PremiumIndicator: React.FC<{
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}> = ({ showText = true, size = 'md' }) => {
  const { isPremium } = useSubscriptionStore()

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  if (!isPremium()) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, rotate: -180 }}
      animate={{ opacity: 1, rotate: 0 }}
      transition={{ type: "spring", duration: 0.5 }}
      className="inline-flex items-center gap-2"
    >
      <div className={`p-1 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full`}>
        <Star className={`${sizeClasses[size]} text-white`} />
      </div>
      {showText && (
        <span className="text-yellow-400 font-semibold text-sm">Premium</span>
      )}
    </motion.div>
  )
}

// Subscription status card
export const SubscriptionCard: React.FC = () => {
  const { subscription, plans, cancelSubscription, isLoading, isPremium } = useSubscriptionStore()

  const currentPlan = plans.find(plan => plan.id === subscription.planId)
  
  if (!isPremium()) {
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {currentPlan?.name || 'Premium'}
            </h3>
            <p className="text-gray-400 text-sm">
              {subscription.status === 'trialing' ? 'Trial Active' : 'Active'}
            </p>
          </div>
        </div>
        
        <PremiumIndicator showText={false} size="lg" />
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Plan</span>
          <span className="text-white font-medium">
            {currentPlan?.currency === 'GBP' ? '£' : currentPlan?.currency}{currentPlan?.price}/{currentPlan?.interval}
          </span>
        </div>
        
        {subscription.currentPeriodEnd && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Next billing</span>
            <span className="text-white font-medium">
              {formatDate(subscription.currentPeriodEnd)}
            </span>
          </div>
        )}
        
        {subscription.cancelAtPeriodEnd && (
          <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-sm">
              Your subscription will cancel on {formatDate(subscription.currentPeriodEnd || '')}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-medium">All Premium Features Active</span>
          </div>
          <p className="text-gray-300 text-sm">
            Enjoy unlimited RAWG API calls, advanced analytics, and more!
          </p>
        </div>

        {!subscription.cancelAtPeriodEnd && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={cancelSubscription}
            disabled={isLoading}
            className="w-full py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Cancel Subscription'}
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
