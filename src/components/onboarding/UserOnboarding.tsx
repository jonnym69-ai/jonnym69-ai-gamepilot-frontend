import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

interface OnboardingStep {
  id: string
  title: string
  description: string
  component: React.ComponentType<any>
  completed: boolean
  skipped: boolean
}

interface OnboardingData {
  preferredGenres: string[]
  gamingPlatforms: string[]
  playstyle: string
  gamingFrequency: string
  notifications: boolean
  privacy: {
    analytics: boolean
    recommendations: boolean
    social: boolean
  }
}

export const UserOnboarding: React.FC = () => {
  const navigate = useNavigate()
  const { user, updateProfile } = useAuthStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    preferredGenres: [],
    gamingPlatforms: [],
    playstyle: '',
    gamingFrequency: '',
    notifications: true,
    privacy: {
      analytics: true,
      recommendations: true,
      social: false
    }
  })
  const [isLoading, setIsLoading] = useState(false)

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to GamePilot!',
      description: 'Your personal gaming identity platform',
      component: WelcomeStep,
      completed: false,
      skipped: false
    },
    {
      id: 'genres',
      title: 'Choose Your Favorite Genres',
      description: 'Help us understand your gaming preferences',
      component: GenreSelectionStep,
      completed: false,
      skipped: false
    },
    {
      id: 'platforms',
      title: 'Connect Your Gaming Platforms',
      description: 'Import your game library from your favorite platforms',
      component: PlatformSelectionStep,
      completed: false,
      skipped: false
    },
    {
      id: 'playstyle',
      title: 'What\'s Your Gaming Style?',
      description: 'Discover your unique gaming personality',
      component: PlaystyleStep,
      completed: false,
      skipped: false
    },
    {
      id: 'frequency',
      title: 'How Often Do You Game?',
      description: 'Set your gaming frequency for better recommendations',
      component: FrequencyStep,
      completed: false,
      skipped: false
    },
    {
      id: 'privacy',
      title: 'Privacy & Notifications',
      description: 'Control your data and notification preferences',
      component: PrivacyStep,
      completed: false,
      skipped: false
    },
    {
      id: 'complete',
      title: 'All Set!',
      description: 'Your personalized gaming experience awaits',
      component: CompleteStep,
      completed: false,
      skipped: false
    }
  ]

  useEffect(() => {
    // Check if user has already completed onboarding
    if (user?.onboardingCompleted) {
      navigate('/home')
    }
  }, [user, navigate])

  const handleNext = async () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      await completeOnboarding()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    const updatedSteps = [...onboardingSteps]
    updatedSteps[currentStep].skipped = true
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
    }
  }

  const completeOnboarding = async () => {
    setIsLoading(true)
    try {
      await updateProfile({
        onboardingCompleted: true,
        preferences: {
          favoriteGenres: onboardingData.preferredGenres || [],
          moodPreferences: onboardingData.gamingPlatforms || [],
          notifications: onboardingData.notifications
        }
      })
      navigate('/home')
    } catch (error) {
      console.error('Error completing onboarding:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }))
  }

  const CurrentStepComponent = onboardingSteps[currentStep].component

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-2xl font-bold">GamePilot Setup</h2>
            <span className="text-white text-sm opacity-75">
              Step {currentStep + 1} of {onboardingSteps.length}
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {onboardingSteps[currentStep].title}
            </h1>
            <p className="text-white/80">
              {onboardingSteps[currentStep].description}
            </p>
          </div>

          <CurrentStepComponent
            data={onboardingData}
            updateData={updateOnboardingData}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSkip={handleSkip}
            isLoading={isLoading}
            isFirstStep={currentStep === 0}
            isLastStep={currentStep === onboardingSteps.length - 1}
          />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center mt-6 space-x-2">
          {onboardingSteps.map((step, index) => (
            <div
              key={step.id}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? 'bg-white'
                  : index < currentStep
                  ? 'bg-white/50'
                  : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Welcome Step Component
const WelcomeStep: React.FC<{
  data: OnboardingData
  updateData: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
  onSkip: () => void
  isLoading: boolean
  isFirstStep: boolean
  isLastStep: boolean
}> = ({ onNext, onSkip, isLoading }) => {
  return (
    <div className="text-center">
      <div className="mb-8">
        <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
          <span className="text-6xl">🎮</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Welcome to GamePilot!
        </h2>
        <p className="text-white/80 max-w-md mx-auto">
          GamePilot is your personal gaming identity platform that helps you discover, organize, 
          and connect your gaming experiences across multiple platforms.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-3xl mb-2">🎯</div>
          <h3 className="font-semibold text-white mb-2">Personalized Recommendations</h3>
          <p className="text-white/70 text-sm">
            Get game recommendations based on your mood and playstyle
          </p>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-3xl mb-2">📚</div>
          <h3 className="font-semibold text-white mb-2">Unified Library</h3>
          <p className="text-white/70 text-sm">
            Organize games from Steam, Epic, and more in one place
          </p>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-3xl mb-2">🤖</div>
          <h3 className="font-semibold text-white mb-2">AI-Powered Insights</h3>
          <p className="text-white/70 text-sm">
            Discover your gaming personality and patterns
          </p>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={onSkip}
          className="px-6 py-3 text-white/70 hover:text-white transition-colors"
        >
          Skip Setup
        </button>
        <button
          onClick={onNext}
          disabled={isLoading}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Get Started'}
        </button>
      </div>
    </div>
  )
}

// Genre Selection Step Component
const GenreSelectionStep: React.FC<{
  data: OnboardingData
  updateData: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
  onSkip: () => void
  isLoading: boolean
  isFirstStep: boolean
  isLastStep: boolean
}> = ({ data, updateData, onNext, onPrevious, onSkip, isLoading }) => {
  const genres = [
    { id: 'action', name: 'Action', emoji: '⚔️' },
    { id: 'adventure', name: 'Adventure', emoji: '🗺️' },
    { id: 'rpg', name: 'RPG', emoji: '🎭' },
    { id: 'strategy', name: 'Strategy', emoji: '♟️' },
    { id: 'puzzle', name: 'Puzzle', emoji: '🧩' },
    { id: 'simulation', name: 'Simulation', emoji: '🏗️' },
    { id: 'sports', name: 'Sports', emoji: '⚽' },
    { id: 'racing', name: 'Racing', emoji: '🏎️' },
    { id: 'horror', name: 'Horror', emoji: '👻' },
    { id: 'comedy', name: 'Comedy', emoji: '😄' },
    { id: 'drama', name: 'Drama', emoji: '🎬' },
    { id: 'fantasy', name: 'Fantasy', emoji: '🧙‍♂️' }
  ]

  const toggleGenre = (genreId: string) => {
    const newGenres = data.preferredGenres.includes(genreId)
      ? data.preferredGenres.filter(id => id !== genreId)
      : [...data.preferredGenres, genreId]
    updateData({ preferredGenres: newGenres })
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-white/80 text-center">
          Select your favorite genres (choose at least 3)
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {genres.map(genre => (
          <button
            key={genre.id}
            onClick={() => toggleGenre(genre.id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              data.preferredGenres.includes(genre.id)
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-white/20 bg-white/10 hover:border-white/40'
            }`}
          >
            <div className="text-3xl mb-2">{genre.emoji}</div>
            <div className="text-white font-medium">{genre.name}</div>
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          className="px-6 py-3 text-white/70 hover:text-white transition-colors"
        >
          Previous
        </button>
        <div className="space-x-4">
          <button
            onClick={onSkip}
            className="px-6 py-3 text-white/70 hover:text-white transition-colors"
          >
            Skip
          </button>
          <button
            onClick={onNext}
            disabled={isLoading || data.preferredGenres.length < 3}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Platform Selection Step Component
const PlatformSelectionStep: React.FC<{
  data: OnboardingData
  updateData: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
  onSkip: () => void
  isLoading: boolean
  isFirstStep: boolean
  isLastStep: boolean
}> = ({ data, updateData, onNext, onPrevious, onSkip, isLoading }) => {
  const platforms = [
    { id: 'steam', name: 'Steam', emoji: '🎮' },
    { id: 'epic', name: 'Epic Games', emoji: '🎯' },
    { id: 'gog', name: 'GOG', emoji: '🎲' },
    { id: 'xbox', name: 'Xbox', emoji: '🎮' },
    { id: 'playstation', name: 'PlayStation', emoji: '🎮' },
    { id: 'nintendo', name: 'Nintendo', emoji: '🎮' }
  ]

  const togglePlatform = (platformId: string) => {
    const newPlatforms = data.gamingPlatforms.includes(platformId)
      ? data.gamingPlatforms.filter(id => id !== platformId)
      : [...data.gamingPlatforms, platformId]
    updateData({ gamingPlatforms: newPlatforms })
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-white/80 text-center">
          Select the gaming platforms you use
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {platforms.map(platform => (
          <button
            key={platform.id}
            onClick={() => togglePlatform(platform.id)}
            className={`p-6 rounded-lg border-2 transition-all ${
              data.gamingPlatforms.includes(platform.id)
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-white/20 bg-white/10 hover:border-white/40'
            }`}
          >
            <div className="text-4xl mb-2">{platform.emoji}</div>
            <div className="text-white font-medium">{platform.name}</div>
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          className="px-6 py-3 text-white/70 hover:text-white transition-colors"
        >
          Previous
        </button>
        <div className="space-x-4">
          <button
            onClick={onSkip}
            className="px-6 py-3 text-white/70 hover:text-white transition-colors"
          >
            Skip
          </button>
          <button
            onClick={onNext}
            disabled={isLoading}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Playstyle Step Component
const PlaystyleStep: React.FC<{
  data: OnboardingData
  updateData: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
  onSkip: () => void
  isLoading: boolean
  isFirstStep: boolean
  isLastStep: boolean
}> = ({ data, updateData, onNext, onPrevious, onSkip, isLoading }) => {
  const playstyles = [
    { id: 'competitive', name: 'Competitive', description: 'Love challenges and winning' },
    { id: 'explorer', name: 'Explorer', description: 'Discover new worlds and secrets' },
    { id: 'story-driven', name: 'Story-driven', description: 'Immerse in narratives' },
    { id: 'creative', name: 'Creative', description: 'Build and create' },
    { id: 'social', name: 'Social', description: 'Play with friends' },
    { id: 'casual', name: 'Casual', description: 'Relax and have fun' }
  ]

  return (
    <div>
      <div className="mb-6">
        <p className="text-white/80 text-center">
          What type of gamer are you?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {playstyles.map(playstyle => (
          <button
            key={playstyle.id}
            onClick={() => updateData({ playstyle: playstyle.id })}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              data.playstyle === playstyle.id
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-white/20 bg-white/10 hover:border-white/40'
            }`}
          >
            <div className="font-semibold text-white mb-1">{playstyle.name}</div>
            <div className="text-white/70 text-sm">{playstyle.description}</div>
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          className="px-6 py-3 text-white/70 hover:text-white transition-colors"
        >
          Previous
        </button>
        <div className="space-x-4">
          <button
            onClick={onSkip}
            className="px-6 py-3 text-white/70 hover:text-white transition-colors"
          >
            Skip
          </button>
          <button
            onClick={onNext}
            disabled={isLoading || !data.playstyle}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Frequency Step Component
const FrequencyStep: React.FC<{
  data: OnboardingData
  updateData: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
  onSkip: () => void
  isLoading: boolean
  isFirstStep: boolean
  isLastStep: boolean
}> = ({ data, updateData, onNext, onPrevious, onSkip, isLoading }) => {
  const frequencies = [
    { id: 'daily', name: 'Daily', description: 'Every day' },
    { id: 'weekly', name: 'Weekly', description: 'A few times a week' },
    { id: 'biweekly', name: 'Bi-weekly', description: 'Once or twice a week' },
    { id: 'monthly', name: 'Monthly', description: 'A few times a month' },
    { id: 'occasionally', name: 'Occasionally', description: 'Rarely' }
  ]

  return (
    <div>
      <div className="mb-6">
        <p className="text-white/80 text-center">
          How often do you play games?
        </p>
      </div>

      <div className="space-y-3 mb-8">
        {frequencies.map(frequency => (
          <button
            key={frequency.id}
            onClick={() => updateData({ gamingFrequency: frequency.id })}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              data.gamingFrequency === frequency.id
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-white/20 bg-white/10 hover:border-white/40'
            }`}
          >
            <div className="font-semibold text-white">{frequency.name}</div>
            <div className="text-white/70 text-sm">{frequency.description}</div>
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          className="px-6 py-3 text-white/70 hover:text-white transition-colors"
        >
          Previous
        </button>
        <div className="space-x-4">
          <button
            onClick={onSkip}
            className="px-6 py-3 text-white/70 hover:text-white transition-colors"
          >
            Skip
          </button>
          <button
            onClick={onNext}
            disabled={isLoading || !data.gamingFrequency}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Privacy Step Component
const PrivacyStep: React.FC<{
  data: OnboardingData
  updateData: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
  onSkip: () => void
  isLoading: boolean
  isFirstStep: boolean
  isLastStep: boolean
}> = ({ data, updateData, onNext, onPrevious, onSkip, isLoading }) => {
  return (
    <div>
      <div className="mb-6">
        <p className="text-white/80 text-center">
          Customize your privacy and notification preferences
        </p>
      </div>

      <div className="space-y-6 mb-8">
        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-white">Analytics</h3>
              <p className="text-white/70 text-sm">Help us improve GamePilot with usage data</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.privacy.analytics}
                onChange={(e) => updateData({ 
                  privacy: { ...data.privacy, analytics: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-white">Recommendations</h3>
              <p className="text-white/70 text-sm">Get personalized game recommendations</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.privacy.recommendations}
                onChange={(e) => updateData({ 
                  privacy: { ...data.privacy, recommendations: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-white">Social Features</h3>
              <p className="text-white/70 text-sm">Connect with friends and share achievements</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.privacy.social}
                onChange={(e) => updateData({ 
                  privacy: { ...data.privacy, social: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-white">Email Notifications</h3>
              <p className="text-white/70 text-sm">Receive updates about your games</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.notifications}
                onChange={(e) => updateData({ notifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          className="px-6 py-3 text-white/70 hover:text-white transition-colors"
        >
          Previous
        </button>
        <div className="space-x-4">
          <button
            onClick={onSkip}
            className="px-6 py-3 text-white/70 hover:text-white transition-colors"
          >
            Skip
          </button>
          <button
            onClick={onNext}
            disabled={isLoading}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Complete Setup'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Complete Step Component
const CompleteStep: React.FC<{
  data: OnboardingData
  updateData: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
  onSkip: () => void
  isLoading: boolean
  isFirstStep: boolean
  isLastStep: boolean
}> = ({ onNext, isLoading }) => {
  return (
    <div className="text-center">
      <div className="mb-8">
        <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
          <span className="text-6xl">🎉</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">
          You're All Set!
        </h2>
        <p className="text-white/80 max-w-md mx-auto">
          Your personalized GamePilot experience is ready. Let's start exploring your gaming identity!
        </p>
      </div>

      <div className="bg-white/10 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-white mb-4">What's Next?</h3>
        <div className="space-y-3 text-left">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🎮</span>
            <span className="text-white/80">Explore your personalized game recommendations</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📚</span>
            <span className="text-white/80">Organize your game library</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🤖</span>
            <span className="text-white/80">Discover your gaming personality</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🎯</span>
            <span className="text-white/80">Connect your gaming platforms</span>
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={isLoading}
        className="px-12 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50 text-lg font-semibold"
      >
        {isLoading ? 'Loading...' : 'Start Your Journey'}
      </button>
    </div>
  )
}

export default UserOnboarding
