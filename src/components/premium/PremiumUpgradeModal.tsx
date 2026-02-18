import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSubscriptionStore, SubscriptionPlan } from '../../stores/subscriptionStore'
import { X, Check, Crown, Star, Zap, Shield, Cloud, Target } from 'lucide-react'

interface PremiumUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  feature?: string
}

export const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({ 
  isOpen, 
  onClose, 
  feature 
}) => {
  const { plans, upgradeToPremium, isLoading } = useSubscriptionStore()
  const [selectedPlan, setSelectedPlan] = useState<string>('')

  const handleUpgrade = async (planId: string) => {
    try {
      await upgradeToPremium(planId)
    } catch (error) {
      console.error('Upgrade failed:', error)
    }
  }

  const getFeatureIcon = (feature: string) => {
    const icons: Record<string, React.ReactNode> = {
      'unlimited-api': <Zap className="w-5 h-5" />,
      'advanced-analytics': <Target className="w-5 h-5" />,
      'ai-recommendations': <Star className="w-5 h-5" />,
      'custom-themes': <Crown className="w-5 h-5" />,
      'cloud-sync': <Cloud className="w-5 h-5" />,
      'priority-support': <Shield className="w-5 h-5" />
    }
    return icons[feature] || <Star className="w-5 h-5" />
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-8 border-b border-gray-700">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-700 transition-colors"
                title="Close premium upgrade modal"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Upgrade to GamePilot Premium
                </h2>
                <p className="text-gray-400 text-lg">
                  Unlock the full potential of your gaming experience
                </p>
                {feature && (
                  <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-400 text-sm">
                      🚀 This feature requires Premium access
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Plans */}
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
                {plans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    whileHover={{ scale: 1.02 }}
                    className={`relative bg-gray-800/50 rounded-xl p-6 border-2 transition-all cursor-pointer ${
                      plan.popular 
                        ? 'border-yellow-500 shadow-lg shadow-yellow-500/20' 
                        : 'border-gray-600 hover:border-gray-500'
                    } ${selectedPlan === plan.id ? 'ring-2 ring-yellow-500' : ''}`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                          MOST POPULAR
                        </div>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold text-white">
                          {plan.currency === 'GBP' ? '£' : plan.currency === 'EUR' ? '€' : '$'}
                          {plan.price}
                        </span>
                        <span className="text-gray-400 ml-2">/{plan.interval}</span>
                      </div>
                      {plan.interval === 'year' && (
                        <p className="text-green-400 text-sm mt-1">Save 20% vs monthly</p>
                      )}
                    </div>

                    <div className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isLoading}
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                        plan.popular
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600'
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        'Upgrade Now'
                      )}
                    </motion.button>
                  </motion.div>
                ))}
              </div>

              {/* Feature Comparison */}
              <div className="mt-12">
                <h3 className="text-2xl font-bold text-white text-center mb-8">
                  What's included in Premium?
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">✨ Premium Features</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        <span className="text-gray-300">Unlimited RAWG API calls</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-blue-400" />
                        <span className="text-gray-300">Advanced analytics dashboard</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-purple-400" />
                        <span className="text-gray-300">AI-powered recommendations</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Crown className="w-5 h-5 text-orange-400" />
                        <span className="text-gray-300">Custom themes & profiles</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Cloud className="w-5 h-5 text-cyan-400" />
                        <span className="text-gray-300">Cloud sync & backup</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-green-400" />
                        <span className="text-gray-300">Priority support</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">🎮 Gaming Benefits</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        <span className="text-gray-300">Discover hidden gems tailored to you</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                        <span className="text-gray-300">Track detailed gaming patterns</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full" />
                        <span className="text-gray-300">Get mood-based game suggestions</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-400 rounded-full" />
                        <span className="text-gray-300">Sync library across devices</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                        <span className="text-gray-300">Export your gaming data</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                        <span className="text-gray-300">Early access to new features</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-12 pt-8 border-t border-gray-700">
                <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400 text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Secure payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="w-4 h-4" />
                    <span>Cancel anytime</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    <span>30-day guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
