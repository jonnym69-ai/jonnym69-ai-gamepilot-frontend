import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../ui/ToastProvider'
import { motion, AnimatePresence } from 'framer-motion'

// Sound effects
const playSound = (type: 'click' | 'success' | 'transition' | 'complete') => {
  try {
    const audio = new Audio()
    
    switch(type) {
      case 'click':
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSw'
        break
      case 'success':
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSw'
        break
      case 'transition':
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSw'
        break
      case 'complete':
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSw'
        break
    }
    
    audio.volume = 0.3
    audio.play().catch(() => {
      // Ignore audio errors (some browsers block autoplay)
    })
  } catch (error) {
    // Ignore sound errors
  }
}

interface BetaOnboardingProps {
  onComplete: () => void
  skipOnboarding: boolean
}

export const BetaOnboarding: React.FC<BetaOnboardingProps> = ({ onComplete, skipOnboarding }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const navigate = useNavigate()
  const toast = useToast()

  // Play transition sound when step changes
  useEffect(() => {
    if (currentStep > 0) {
      playSound('transition')
    }
  }, [currentStep])

  const onboardingSteps = [
    {
      id: 'welcome',
      title: 'Welcome to GamePilot Beta! 🎮',
      description: 'Thank you for joining our beta program! You\'re among the first to experience the future of game discovery.',
      content: (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="text-8xl mb-6"
          >
            🚀
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-white mb-4"
          >
            Welcome to GamePilot Beta!
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-300 mb-6"
          >
            Thank you for joining our beta program! You're among the first to experience the future of game discovery.
          </motion.p>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400"
          >
            GamePilot uses AI to understand your gaming mood and recommend the perfect games from your library.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm"
          >
            <h4 className="text-blue-400 font-semibold mb-4 text-lg">✨ Beta Features:</h4>
            <div className="grid grid-cols-2 gap-3 text-left">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center space-x-2"
              >
                <span className="text-2xl">🎮</span>
                <span className="text-gray-300">Steam library integration</span>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center space-x-2"
              >
                <span className="text-2xl">🎭</span>
                <span className="text-gray-300">Mood-based recommendations</span>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="flex items-center space-x-2"
              >
                <span className="text-2xl">📊</span>
                <span className="text-gray-300">Gaming analytics dashboard</span>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="flex items-center space-x-2"
              >
                <span className="text-2xl">🔗</span>
                <span className="text-gray-300">Multi-platform support</span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )
    },
    {
      id: 'steam-integration',
      title: 'Connect Your Steam Library 🎮',
      description: 'Import your Steam games to get personalized recommendations based on your gaming mood.',
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-5xl mb-4">🎮</div>
            <p className="text-gray-300 mb-4">
              Connect your Steam account to import your game library and unlock personalized recommendations.
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Why connect Steam?</h4>
            <ul className="text-sm space-y-2 text-gray-300">
              <li>• Import your entire game library automatically</li>
              <li>• Get mood-based game recommendations</li>
              <li>• Track your gaming habits and patterns</li>
              <li>• Discover hidden gems in your collection</li>
            </ul>
          </div>
          <button
            onClick={() => {
              playSound('click')
              navigate('/library')
              toast.showInfo('Click "Import Steam" in your library to connect!')
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Connect Steam Library
          </button>
        </div>
      )
    },
    {
      id: 'mood-recommendations',
      title: 'Discover Games by Mood 🎭',
      description: 'Tell us how you feel and we\'ll recommend the perfect games for your current mood.',
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-5xl mb-4">🎭</div>
            <p className="text-gray-300 mb-4">
              Our AI analyzes your gaming preferences and current mood to suggest the perfect games.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { mood: 'Chill', emoji: '😌', color: 'bg-green-600' },
              { mood: 'Competitive', emoji: '🔥', color: 'bg-red-600' },
              { mood: 'Story', emoji: '📚', color: 'bg-purple-600' },
              { mood: 'Creative', emoji: '🎨', color: 'bg-yellow-600' }
            ].map(({ mood, emoji, color }) => (
              <div key={mood} className={`${color} rounded-lg p-3 text-center`}>
                <div className="text-2xl mb-1">{emoji}</div>
                <div className="text-sm font-semibold">{mood}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              playSound('click')
              navigate('/recommendations')
            }}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Try Mood Recommendations
          </button>
        </div>
      )
    },
    {
      id: 'feedback',
      title: 'Help Us Improve! 📝',
      description: 'Your feedback is crucial for shaping the future of GamePilot.',
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-5xl mb-4">💬</div>
            <p className="text-gray-300 mb-4">
              As a beta tester, your feedback helps us build the best game discovery platform.
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Ways to provide feedback:</h4>
            <ul className="text-sm space-y-2 text-gray-300">
              <li>• Use the in-app feedback button</li>
              <li>• Report bugs and issues</li>
              <li>• Suggest new features</li>
              <li>• Share your experience on social media</li>
            </ul>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                toast.showInfo('Feedback button will be available in the app!')
              }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Give Feedback
            </button>
            <button
              onClick={() => window.open('https://github.com/gamepilot/gamepilot/issues', '_blank')}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Report Bug
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'support',
      title: 'Support & Follow Us 🚀',
      description: 'Help us grow GamePilot and stay connected with our community!',
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-5xl mb-4">💜</div>
            <p className="text-gray-300 mb-4">
              Support our development and follow our journey as we build the ultimate game discovery platform!
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-4">Support Our Development</h4>
            <div className="grid grid-cols-1 gap-3 mb-4">
              <button
                onClick={() => {
                  playSound('click')
                  window.open('https://patreon.com/GamePilot?utm_medium=unknown&utm_source=join_link&utm_campaign=creatorshare_creator&utm_content=copyLink', '_blank')
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <span className="text-xl">🧡</span>
                <span>Support on Patreon</span>
              </button>
              <button
                onClick={() => {
                  playSound('click')
                  window.open('https://www.crowdfunder.co.uk/p/qr/VlDoA4dy?utm_campaign=sharemodal&utm_medium=referral&utm_source=shortlink', '_blank')
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <span className="text-xl">💰</span>
                <span>Back on Crowdfundr</span>
              </button>
            </div>
            <h4 className="text-white font-semibold mb-3">Follow Our Journey</h4>
            <div className="space-y-2">
              <button
                onClick={() => {
                  playSound('click')
                  window.open('https://youtube.com/@gamepilot-dev?si=lhi91Ro2rz0eDbV5', '_blank')
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <span className="text-xl">📺</span>
                <span>Subscribe on YouTube</span>
              </button>
            </div>
          </div>
          <div className="text-center text-sm text-gray-400 mt-4">
            <p>Every support helps us build better features and reach more gamers! 🎮</p>
          </div>
        </div>
      )
    },
    {
      id: 'complete',
      title: 'You\'re All Set! 🎉',
      description: 'Welcome to the GamePilot beta. Let\'s discover some amazing games!',
      content: (
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-white mb-2">Beta Setup Complete!</h3>
          <p className="text-gray-300 mb-6">
            You're now ready to explore GamePilot. Here are some quick actions to get you started:
          </p>
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => navigate('/library')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              📚 View My Library
            </button>
            <button
              onClick={() => navigate('/recommendations')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              🎭 Get Recommendations
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              📊 View Analytics
            </button>
          </div>
          <div className="mt-6 p-4 bg-yellow-900/30 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-sm">
              <strong>Beta Tip:</strong> Check back regularly for new features and improvements!
            </p>
          </div>
        </div>
      )
    }
  ]

  useEffect(() => {
    if (skipOnboarding) {
      onComplete()
      return
    }
  }, [skipOnboarding, onComplete])

  const handleNext = () => {
    const currentStepId = onboardingSteps[currentStep].id
    if (!completedSteps.includes(currentStepId)) {
      setCompletedSteps([...completedSteps, currentStepId])
    }

    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      playSound('complete')
      onComplete()
      toast.showSuccess('Steam account connected successfully!')
    }
  }

  const handlePrevious = () => {
    playSound('click')
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    playSound('click')
    onComplete()
    toast.showInfo('Onboarding skipped. You can always access it later!')
  }

  if (skipOnboarding) {
    return null
  }

  const currentStepData = onboardingSteps[currentStep]
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-black flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Progress Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-white">GamePilot Setup</h1>
            <span className="text-gray-400">Step {currentStep + 1} of {onboardingSteps.length}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
          {/* Step Indicators */}
          <div className="flex justify-between mt-4">
            {onboardingSteps.map((step, index) => (
              <motion.div
                key={step.id}
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className={`w-3 h-3 rounded-full mb-2 transition-colors ${
                    index <= currentStep 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                      : 'bg-gray-600'
                  }`}
                />
                <span className={`text-xs ${
                  index === currentStep ? 'text-white font-semibold' : 'text-gray-500'
                }`}>
                  {step.title.split(' ')[0]}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">
              Step {currentStep + 1} of {onboardingSteps.length}
            </span>
            <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 shadow-2xl"
          >
            {/* Step Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl font-bold text-white mb-2">{currentStepData.title}</h2>
              <p className="text-gray-400">{currentStepData.description}</p>
            </motion.div>

            {/* Step Content */}
            <div className="mb-8">
              {currentStepData.content}
            </div>

            {/* Navigation Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-between items-center"
            >
              <div className="flex gap-3">
                {currentStep > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePrevious}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    ← Previous
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSkip}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Skip Setup
                </motion.button>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all shadow-lg"
              >
                {currentStep === onboardingSteps.length - 1 ? '🎉 Get Started' : 'Next Step →'}
              </motion.button>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Beta Badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-900/30 border border-yellow-500/30 rounded-full">
            <span className="text-yellow-400 text-sm font-semibold">BETA</span>
            <span className="text-yellow-400 text-sm">v1.0</span>
          </div>
        </div>
      </div>
    </div>
  )
}
