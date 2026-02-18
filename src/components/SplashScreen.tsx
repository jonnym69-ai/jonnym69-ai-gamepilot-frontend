import React, { useEffect } from 'react'
import { motion } from 'framer-motion'

interface SplashScreenProps {
  onComplete: () => void
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    // Auto-complete after animation duration
    const timer = setTimeout(() => {
      onComplete()
    }, 1800) // 1.8 seconds total duration

    return () => clearTimeout(timer)
  }, [onComplete])

  // Animation variants for the logo
  const logoVariants = {
    initial: {
      x: '-100vw', // Start from left side
      opacity: 0,
      scale: 0.8
    },
    slide: {
      x: 0, // Move to center
      opacity: 1,
      scale: 1,
      transition: {
        x: {
          type: 'spring',
          stiffness: 100,
          damping: 20,
          duration: 0.8
        },
        opacity: {
          duration: 0.6
        },
        scale: {
          type: 'spring',
          stiffness: 200,
          damping: 15,
          duration: 0.4
        }
      }
    },
    settle: {
      scale: 1.1,
      transition: {
        scale: {
          type: 'spring',
          stiffness: 300,
          damping: 10,
          duration: 0.3
        }
      }
    },
    fadeOut: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.5,
        ease: 'easeInOut'
      }
    }
  }

  // Background animation
  const backgroundVariants = {
    initial: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    },
    fadeOut: {
      opacity: 0,
      transition: {
        duration: 0.4,
        ease: 'easeInOut'
      }
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker"
      variants={backgroundVariants}
      initial="initial"
      animate="visible"
      exit="fadeOut"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-gaming-primary rounded-full blur-3xl opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gaming-secondary rounded-full blur-3xl opacity-20"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1.5
          }}
        />
      </div>

      {/* Main logo container */}
      <motion.div
        className="relative z-10 flex flex-col items-center space-y-6"
        variants={logoVariants}
        initial="initial"
        animate="slide"
        exit="fadeOut"
      >
        {/* Logo with animation sequence */}
        <motion.div
          className="relative"
          variants={logoVariants}
          animate={['slide', 'settle']}
        >
          {/* Glow effect behind logo */}
          <motion.div
            className="absolute inset-0 w-32 h-32 md:w-40 md:h-40 bg-gaming-primary rounded-full blur-2xl opacity-30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          
          {/* GamePilot Logo PNG */}
          <motion.img
            src="/logo/a 3_4 angled disc lo.png"
            alt="GamePilot"
            className="relative w-32 h-32 md:w-40 md:h-40 object-contain filter drop-shadow-2xl"
            animate={{
              rotate: [0, 2, -2, 0],
              y: [0, -5, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </motion.div>

        {/* GamePilot text with typewriter effect */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <motion.h1
            className="text-4xl md:text-6xl font-gaming font-bold bg-gradient-to-r from-gaming-primary to-gaming-secondary bg-clip-text text-transparent"
            initial={{ width: 0 }}
            animate={{ width: 'auto' }}
            transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
          >
            GamePilot
          </motion.h1>
          
          <motion.p
            className="text-lg md:text-xl text-gray-300 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.4 }}
          >
            Your Gaming Journey Starts Here
          </motion.p>
        </motion.div>

        {/* Loading indicator */}
        <motion.div
          className="flex space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.3 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-gaming-primary rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut'
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Skip button for accessibility */}
      <motion.button
        className="absolute bottom-8 right-8 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.3 }}
        onClick={onComplete}
      >
        Skip →
      </motion.button>
    </motion.div>
  )
}

export default SplashScreen
