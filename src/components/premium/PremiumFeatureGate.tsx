import React from 'react'
import { motion } from 'framer-motion'
import { useSubscriptionStore } from '../../stores/subscriptionStore'
import { Crown, Lock } from 'lucide-react'
import { PremiumUpgradeModal } from './PremiumUpgradeModal'

interface PremiumFeatureGateProps {
  feature: string
  children: React.ReactNode
  fallback?: React.ReactNode
  showUpgradePrompt?: boolean
}

export const PremiumFeatureGate: React.FC<PremiumFeatureGateProps> = ({
  feature,
  children,
  fallback,
  showUpgradePrompt = true
}) => {
  const { canUseFeature, isPremium } = useSubscriptionStore()
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false)

  const canUse = canUseFeature(feature)

  if (canUse) {
    return <>{children}</>
  }

  if (fallback && !showUpgradePrompt) {
    return <>{fallback}</>
  }

  // Default premium prompt
  const defaultFallback = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6 text-center"
    >
      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
        <Crown className="w-6 h-6 text-white" />
      </div>
      
      <h3 className="text-lg font-semibold text-white mb-2">
        Premium Feature
      </h3>
      
      <p className="text-gray-400 mb-4">
        This feature is available for Premium members only
      </p>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowUpgradeModal(true)}
        className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all"
      >
        Upgrade to Premium
      </motion.button>
    </motion.div>
  )

  return (
    <>
      {fallback || defaultFallback}
      <PremiumUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={feature}
      />
    </>
  )
}

// Compact version for inline use
export const PremiumLock: React.FC<{
  feature: string
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
}> = ({ feature, onClick, size = 'md' }) => {
  const { canUseFeature } = useSubscriptionStore()
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false)

  if (canUseFeature(feature)) {
    return null
  }

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      setShowUpgradeModal(true)
    }
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        className={`inline-flex items-center justify-center ${sizeClasses[size]} bg-yellow-500/20 text-yellow-400 rounded-full hover:bg-yellow-500/30 transition-colors`}
        title="Premium feature - upgrade to unlock"
      >
        <Lock className={sizeClasses[size]} />
      </motion.button>
      
      <PremiumUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={feature}
      />
    </>
  )
}

// Premium badge component
export const PremiumBadge: React.FC<{
  children: React.ReactNode
  showLock?: boolean
}> = ({ children, showLock = false }) => {
  const { isPremium } = useSubscriptionStore()

  if (!isPremium && showLock) {
    return (
      <div className="relative inline-block">
        {children}
        <div className="absolute -top-1 -right-1">
          <PremiumLock feature="premium" size="sm" />
        </div>
      </div>
    )
  }

  return <>{children}</>
}
