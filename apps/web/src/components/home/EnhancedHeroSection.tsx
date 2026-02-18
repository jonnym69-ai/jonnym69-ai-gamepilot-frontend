import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

interface EnhancedHeroSectionProps {
  user?: any
  games?: any[]
  currentPersona?: any
}

export const EnhancedHeroSection: React.FC<EnhancedHeroSectionProps> = ({
  user,
  games = [],
  currentPersona
}) => {
  const gameCount = games?.length || 0
  const displayName = user?.displayName || user?.username || 'Gamer'

  return (
    <motion.section 
      className="relative mb-8 overflow-hidden rounded-2xl gaming-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Enhanced animated background */}
      <div className="absolute inset-0 gaming-gradient-subtle">
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 bg-gaming-primary/30 rounded-full blur-3xl neon-glow"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-40 h-40 bg-gaming-secondary/30 rounded-full blur-3xl neon-glow"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 p-8 lg:p-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          {/* Welcome Message */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-6 lg:mb-0"
          >
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 neon-text">
              Welcome back, <span className="text-gaming-accent">{displayName}</span>
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Ready to discover your perfect gaming experience?
            </p>
            
            {/* Mood Display */}
            {currentPersona?.mood && typeof currentPersona.mood === 'string' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-enhanced border border-gaming-accent/30"
              >
                <div className={`w-3 h-3 rounded-full mood-${currentPersona.mood.toLowerCase()}`} />
                <span className="text-white font-medium capitalize">
                  {currentPersona.mood} Mood
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="glass-enhanced rounded-xl p-4 text-center hover-lift"
            >
              <div className="text-3xl font-bold text-gaming-primary mb-1">
                {gameCount}
              </div>
              <div className="text-sm text-gray-300">
                Games in Library
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="glass-enhanced rounded-xl p-4 text-center hover-lift"
            >
              <div className="text-3xl font-bold text-gaming-accent mb-1">
                {currentPersona?.level || 1}
              </div>
              <div className="text-sm text-gray-300">
                Player Level
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="glass-enhanced rounded-xl p-4 text-center hover-lift lg:col-span-1 col-span-2"
            >
              <Link
                to="/library"
                className="gaming-button inline-block w-full text-center"
              >
                Browse Library
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-8 flex flex-wrap gap-4"
        >
          <Link
            to="/mood-selector"
            className="gaming-button hover-scale"
          >
            🎯 Find Your Mood
          </Link>
          <Link
            to="/integrations"
            className="glass-enhanced px-6 py-3 rounded-xl text-white hover-lift transition-all duration-300"
          >
            🛤️ Connect Steam
          </Link>
          <Link
            to="/recommendations"
            className="glass-enhanced px-6 py-3 rounded-xl text-white hover-lift transition-all duration-300"
          >
            🎮 Discover Games
          </Link>
        </motion.div>
      </div>
    </motion.section>
  )
}
