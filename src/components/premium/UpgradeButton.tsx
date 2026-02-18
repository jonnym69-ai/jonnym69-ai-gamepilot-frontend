import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, Sparkles } from 'lucide-react'
import { useSubscriptionStore } from '../../stores/subscriptionStore'
import { PremiumUpgradeModal } from './PremiumUpgradeModal'

interface UpgradeButtonProps {
  variant?: 'primary' | 'secondary' | 'subtle'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  showIcon?: boolean
  text?: string
  feature?: string
  className?: string
}

export const UpgradeButton: React.FC<UpgradeButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  showIcon = true,
  text,
  feature,
  className = ''
}) => {
  const { isPremium } = useSubscriptionStore()
  const [showModal, setShowModal] = useState(false)

  if (isPremium()) {
    return null
  }

  const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all'
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-800 text-yellow-400 border border-yellow-500/30 hover:bg-gray-700 hover:border-yellow-500/50',
    subtle: 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10'
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  const widthClass = fullWidth ? 'w-full' : ''

  const buttonText = text || (
    variant === 'subtle' ? 'Upgrade to Premium' : 'Upgrade Now'
  )

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowModal(true)}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      >
        {showIcon && (
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Crown className="w-4 h-4" />
          </motion.div>
        )}
        {buttonText}
        {variant === 'primary' && <Sparkles className="w-4 h-4" />}
      </motion.button>

      <PremiumUpgradeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        feature={feature}
      />
    </>
  )
}

// Floating upgrade CTA
export const FloatingUpgradeCTA: React.FC<{
  feature?: string
  message?: string
}> = ({ feature, message = 'Unlock Premium features!' }) => {
  const { isPremium } = useSubscriptionStore()
  const [showModal, setShowModal] = useState(false)

  if (isPremium()) {
    return null
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl cursor-pointer flex items-center gap-2"
        >
          <Crown className="w-4 h-4" />
          <span className="font-semibold text-sm">{message}</span>
          <Sparkles className="w-4 h-4" />
        </motion.div>
      </motion.div>

      <PremiumUpgradeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        feature={feature}
      />
    </>
  )
}

// Premium banner for sections
export const PremiumBanner: React.FC<{
  title: string
  description: string
  feature?: string
  compact?: boolean
}> = ({ title, description, feature, compact = false }) => {
  const { isPremium } = useSubscriptionStore()
  const [showModal, setShowModal] = useState(false)

  if (isPremium()) {
    return null
  }

  if (compact) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-yellow-400" />
            <div>
              <h4 className="text-white font-semibold">{title}</h4>
              <p className="text-gray-400 text-sm">{description}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal(true)}
            className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-sm font-semibold hover:bg-yellow-600"
          >
            Upgrade
          </motion.button>
        </motion.div>

        <PremiumUpgradeModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          feature={feature}
        />
      </>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
              <p className="text-gray-400">{description}</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600"
          >
            Upgrade to Premium
          </motion.button>
        </div>
      </motion.div>

      <PremiumUpgradeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        feature={feature}
      />
    </>
  )
}
