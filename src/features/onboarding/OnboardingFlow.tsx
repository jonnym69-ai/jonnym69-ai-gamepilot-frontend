// User Onboarding Flow for GamePilot
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

interface OnboardingStep {
  id: string
  title: string
  description: string
  component: React.ComponentType<any>
  completed: boolean
  skipped: boolean
}

interface OnboardingData {
  displayName: string
  bio: string
  favoriteGenres: string[]
  favoritePlatforms: string[]
  playstylePreferences: string[]
  privacySettings: {
    profileVisibility: 'public' | 'friends' | 'private'
    sharePlaytime: boolean
    shareAchievements: boolean
    shareGameLibrary: boolean
  }
  integrations: {
    steam: boolean
    discord: boolean
    youtube: boolean
  }
}

const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    displayName: '',
    bio: '',
    favoriteGenres: [],
    favoritePlatforms: [],
    playstylePreferences: [],
    privacySettings: {
      profileVisibility: 'friends',
      sharePlaytime: true,
      shareAchievements: true,
      shareGameLibrary: false
    },
    integrations: {
      steam: false,
      discord: false,
      youtube: false
    }
  })

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to GamePilot!',
      description: 'Let\'s get you set up with your personalized gaming experience.',
      component: WelcomeStep,
      completed: false,
      skipped: false
    },
    {
      id: 'profile',
      title: 'Create Your Profile',
      description: 'Tell us a bit about yourself to personalize your experience.',
      component: ProfileStep,
      completed: false,
      skipped: false
    },
    {
      id: 'preferences',
      title: 'Gaming Preferences',
      description: 'Help us understand your gaming style and preferences.',
      component: PreferencesStep,
      completed: false,
      skipped: false
    },
    {
      id: 'privacy',
      title: 'Privacy Settings',
      description: 'Control how your information is shared and displayed.',
      component: PrivacyStep,
      completed: false,
      skipped: false
    },
    {
      id: 'integrations',
      title: 'Connect Your Accounts',
      description: 'Link your gaming accounts for a complete experience.',
      component: IntegrationsStep,
      completed: false,
      skipped: false
    },
    {
      id: 'complete',
      title: 'All Set!',
      description: 'You\'re ready to start your gaming journey with GamePilot.',
      component: CompleteStep,
      completed: false,
      skipped: false
    }
  ]

  const currentStepData = steps[currentStep]

  const handleNext = (data?: Partial<OnboardingData>) => {
    if (data) {
      setOnboardingData(prev => ({ ...prev, ...data }))
    }
    
    // Mark current step as completed
    steps[currentStep].completed = true
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete onboarding
      completeOnboarding()
    }
  }

  const handleSkip = () => {
    steps[currentStep].skipped = true
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeOnboarding = () => {
    // Save onboarding data to user profile
    // This would typically make an API call
    console.log('Onboarding completed:', onboardingData)
    
    // Navigate to dashboard
    navigate('/dashboard')
  }

  const CurrentStepComponent = currentStepData.component

  return (
    <div className="min-h-screen bg-gaming-darker relative overflow-hidden flex items-center justify-center p-6">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gaming-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gaming-secondary/10 rounded-full blur-[120px] animate-pulse-slow animate-delay-1000" />
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-gaming text-xs uppercase tracking-widest opacity-60">
              Phase {currentStep + 1} <span className="mx-2">/</span> {steps.length}
            </h2>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-white/40 hover:text-gaming-primary transition-colors text-xs font-gaming uppercase tracking-wider"
            >
              Skip Sequence
            </button>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
            <div
              className="bg-gradient-gaming h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(139,92,246,0.4)]"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <Card className="glass-morphism-dark border-white/10 p-10 shadow-cinematic-epic animate-fade-in-up">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-gaming font-bold text-white mb-3 tracking-tight">
              {currentStepData.title}
            </h1>
            <p className="text-white/50 max-w-lg mx-auto leading-relaxed">
              {currentStepData.description}
            </p>
          </div>

          <CurrentStepComponent
            data={onboardingData}
            onNext={handleNext}
            onSkip={handleSkip}
            onBack={handleBack}
            isLastStep={currentStep === steps.length - 1}
            isFirstStep={currentStep === 0}
          />
        </Card>
      </div>
    </div>
  )
}

// Welcome Step Component
const WelcomeStep: React.FC<{
  data: OnboardingData
  onNext: (data?: Partial<OnboardingData>) => void
  onBack: () => void
  isLastStep: boolean
  isFirstStep: boolean
}> = ({ onNext }) => {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="mb-12">
        <div className="w-24 h-24 bg-gradient-gaming rounded-2xl mx-auto mb-6 flex items-center justify-center rotate-3 shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:rotate-0 transition-transform duration-500">
          <span className="text-white text-4xl drop-shadow-lg">🎮</span>
        </div>
        <h2 className="text-3xl font-gaming font-bold text-white mb-4 tracking-tight">
          Initiating Sequence
        </h2>
        <p className="text-white/40 text-lg leading-relaxed">
          Your personal gaming companion is ready to optimize your universe.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="text-center group">
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:bg-gaming-primary/20 group-hover:border-gaming-primary/40 transition-all duration-300">
            <span className="text-2xl group-hover:scale-110 transition-transform">🎯</span>
          </div>
          <h3 className="text-white font-gaming text-xs uppercase tracking-wider mb-2">Neural Link</h3>
          <p className="text-white/30 text-xs leading-relaxed">
            Recommendations aligned with your biological mood.
          </p>
        </div>
        <div className="text-center group">
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:bg-gaming-secondary/20 group-hover:border-gaming-secondary/40 transition-all duration-300">
            <span className="text-2xl group-hover:scale-110 transition-transform">📊</span>
          </div>
          <h3 className="text-white font-gaming text-xs uppercase tracking-wider mb-2">Telemetry</h3>
          <p className="text-white/30 text-xs leading-relaxed">
            Real-time tracking of your achievements and habits.
          </p>
        </div>
        <div className="text-center group">
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:bg-gaming-accent/20 group-hover:border-gaming-accent/40 transition-all duration-300">
            <span className="text-2xl group-hover:scale-110 transition-transform">🌟</span>
          </div>
          <h3 className="text-white font-gaming text-xs uppercase tracking-wider mb-2">Nexus</h3>
          <p className="text-white/30 text-xs leading-relaxed">
            Unify your platforms into a single command center.
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={() => onNext()}
          className="bg-gradient-gaming text-white px-10 py-4 font-gaming uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transform hover:-translate-y-1 transition-all"
        >
          Begin Initialization
        </Button>
      </div>
    </div>
  )
}

// Profile Step Component
const ProfileStep: React.FC<{
  data: OnboardingData
  onNext: (data?: Partial<OnboardingData>) => void
  onSkip: () => void
  onBack: () => void
  isLastStep: boolean
  isFirstStep: boolean
}> = ({ data, onNext, onSkip, onBack }) => {
  const [displayName, setDisplayName] = useState(data.displayName)
  const [bio, setBio] = useState(data.bio)

  const handleSubmit = () => {
    onNext({ displayName, bio })
  }

  return (
    <div>
      <div className="space-y-6">
        <div>
          <label className="block text-white/50 font-gaming text-xs uppercase tracking-widest mb-3">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How should we call you?"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-gaming-primary/50 focus:bg-white/10 transition-all"
            maxLength={50}
          />
        </div>

        <div>
          <label className="block text-white/50 font-gaming text-xs uppercase tracking-widest mb-3">
            Bio (Optional)
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-gaming-primary/50 focus:bg-white/10 transition-all resize-none"
            rows={4}
            maxLength={200}
          />
        </div>

        <div className="text-white/60 text-sm">
          <p>This information will be displayed on your profile and used to personalize your experience.</p>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button
          onClick={onBack}
          variant="secondary"
          className="text-white"
        >
          Back
        </Button>
        <div className="flex gap-4">
          <Button
            onClick={onSkip}
            variant="secondary"
            className="text-white"
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

// Preferences Step Component
const PreferencesStep: React.FC<{
  data: OnboardingData
  onNext: (data?: Partial<OnboardingData>) => void
  onSkip: () => void
  onBack: () => void
  isLastStep: boolean
  isFirstStep: boolean
}> = ({ data, onNext, onSkip, onBack }) => {
  const [favoriteGenres, setFavoriteGenres] = useState(data.favoriteGenres)
  const [favoritePlatforms, setFavoritePlatforms] = useState(data.favoritePlatforms)
  const [playstylePreferences, setPlaystylePreferences] = useState(data.playstylePreferences)

  const genres = [
    'Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 'Sports', 'Racing', 'Puzzle',
    'Horror', 'Sci-Fi', 'Fantasy', 'Indie', 'Multiplayer', 'Single Player', 'Co-op'
  ]

  const platforms = [
    'Steam', 'Epic Games', 'GOG', 'Origin', 'Xbox', 'PlayStation', 'Nintendo Switch', 'Mobile'
  ]

  const playstyles = [
    'Competitive', 'Casual', 'Story-driven', 'Exploration', 'Creative', 'Social', 'Achievement Hunter', 'Completionist'
  ]

  const handleGenreToggle = (genre: string) => {
    setFavoriteGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  const handlePlatformToggle = (platform: string) => {
    setFavoritePlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  const handlePlaystyleToggle = (playstyle: string) => {
    setPlaystylePreferences(prev => 
      prev.includes(playstyle) 
        ? prev.filter(p => p !== playstyle)
        : [...prev, playstyle]
    )
  }

  const handleSubmit = () => {
    onNext({ favoriteGenres, favoritePlatforms, playstylePreferences })
  }

  return (
    <div>
      <div className="space-y-8">
        <div>
          <h3 className="text-white/50 font-gaming text-xs uppercase tracking-widest mb-5">Primary Genres</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => handleGenreToggle(genre)}
          className={`px-3 py-2 rounded-lg border transition-all duration-300 font-medium text-sm ${
                  favoriteGenres.includes(genre)
                    ? 'bg-gaming-primary/30 border-gaming-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-white/50 font-gaming text-xs uppercase tracking-widest mb-5">Hardware Platforms</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {platforms.map(platform => (
              <button
                key={platform}
                onClick={() => handlePlatformToggle(platform)}
          className={`px-3 py-2 rounded-lg border transition-all duration-300 font-medium text-sm ${
                  favoritePlatforms.includes(platform)
                    ? 'bg-gaming-secondary/30 border-gaming-secondary text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-white/50 font-gaming text-xs uppercase tracking-widest mb-5">Behavioral Profiles</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {playstyles.map(playstyle => (
              <button
                key={playstyle}
                onClick={() => handlePlaystyleToggle(playstyle)}
          className={`px-3 py-2 rounded-lg border transition-all duration-300 font-medium text-sm ${
                  playstylePreferences.includes(playstyle)
                    ? 'bg-gaming-primary/30 border-gaming-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                {playstyle}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button
          onClick={onBack}
          variant="secondary"
          className="text-white"
        >
          Back
        </Button>
        <div className="flex gap-4">
          <Button
            onClick={onSkip}
            variant="secondary"
            className="text-white"
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

// Privacy Step Component
const PrivacyStep: React.FC<{
  data: OnboardingData
  onNext: (data?: Partial<OnboardingData>) => void
  onSkip: () => void
  onBack: () => void
  isLastStep: boolean
  isFirstStep: boolean
}> = ({ data, onNext, onSkip, onBack }) => {
  const [privacySettings, setPrivacySettings] = useState(data.privacySettings)

  const handleSettingChange = (key: keyof typeof privacySettings, value: any) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = () => {
    onNext({ privacySettings })
  }

  return (
    <div>
      <div className="space-y-6">
        <div>
          <h3 className="text-white/50 font-gaming text-xs uppercase tracking-widest mb-5">Visibility Protocol</h3>
          <div className="space-y-4">
            {(['public', 'friends', 'private'] as const).map((mode) => (
              <label 
                key={mode}
                className={`flex items-center p-4 rounded-xl border transition-all cursor-pointer group ${
                  privacySettings.profileVisibility === mode 
                    ? 'bg-gaming-primary/10 border-gaming-primary/40 text-white shadow-[0_0_15px_rgba(139,92,246,0.1)]' 
                    : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/10'
                }`}
              >
                <div className="relative flex items-center justify-center mr-4">
                  <input
                    type="radio"
                    name="visibility"
                    value={mode}
                    checked={privacySettings.profileVisibility === mode}
                    onChange={() => handleSettingChange('profileVisibility', mode)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                    privacySettings.profileVisibility === mode ? 'border-gaming-primary bg-gaming-primary scale-110' : 'border-white/20'
                  }`}>
                    {privacySettings.profileVisibility === mode && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-gaming text-xs uppercase tracking-wider mb-0.5 capitalize">{mode}</span>
                  <span className="text-[10px] opacity-60">
                    {mode === 'public' ? 'Full broadcast - visible to all users' : 
                     mode === 'friends' ? 'Encrypted - visible to squad only' : 
                     'Ghost mode - hidden from all telemetry'}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Sharing Preferences</h3>
          <div className="space-y-3">
            <label className="flex items-center text-white">
              <input
                type="checkbox"
                checked={privacySettings.sharePlaytime}
                onChange={(e) => handleSettingChange('sharePlaytime', e.target.checked)}
                className="mr-3"
              />
              <span>Share playtime statistics</span>
            </label>
            <label className="flex items-center text-white">
              <input
                type="checkbox"
                checked={privacySettings.shareAchievements}
                onChange={(e) => handleSettingChange('shareAchievements', e.target.checked)}
                className="mr-3"
              />
              <span>Share achievements</span>
            </label>
            <label className="flex items-center text-white">
              <input
                type="checkbox"
                checked={privacySettings.shareGameLibrary}
                onChange={(e) => handleSettingChange('shareGameLibrary', e.target.checked)}
                className="mr-3"
              />
              <span>Share game library</span>
            </label>
          </div>
        </div>

        <div className="text-white/60 text-sm">
          <p>You can always change these settings later in your profile preferences.</p>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button
          onClick={onBack}
          variant="secondary"
          className="text-white"
        >
          Back
        </Button>
        <div className="flex gap-4">
          <Button
            onClick={onSkip}
            variant="secondary"
            className="text-white"
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

// Integrations Step Component
const IntegrationsStep: React.FC<{
  data: OnboardingData
  onNext: (data?: Partial<OnboardingData>) => void
  onSkip: () => void
  onBack: () => void
  isLastStep: boolean
  isFirstStep: boolean
}> = ({ data, onNext, onSkip, onBack }) => {
  const [integrations, setIntegrations] = useState(data.integrations)

  const handleIntegrationToggle = (platform: keyof typeof integrations) => {
    setIntegrations(prev => ({ ...prev, [platform]: !prev[platform] }))
  }

  const handleSubmit = () => {
    onNext({ integrations })
  }

  const integrationInfo = [
    {
      key: 'steam' as keyof typeof integrations,
      name: 'Steam',
      description: 'Connect your Steam account to import your game library and playtime',
      icon: '🎮',
      color: 'blue'
    },
    {
      key: 'discord' as keyof typeof integrations,
      name: 'Discord',
      description: 'Connect Discord to see your gaming activity and join communities',
      icon: '💬',
      color: 'purple'
    },
    {
      key: 'youtube' as keyof typeof integrations,
      name: 'YouTube',
      description: 'Connect YouTube to discover gaming content and creators',
      icon: '📺',
      color: 'red'
    }
  ]

  return (
    <div>
      <div className="space-y-6">
        <div className="text-white/70 mb-6">
          <p>Connect your gaming accounts to get the most out of GamePilot. You can always connect or disconnect accounts later.</p>
        </div>

        {integrationInfo.map(integration => (
          <div key={integration.key} className="glass-morphism-dark border-white/5 rounded-xl p-6 hover:border-white/10 transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-5">
                <div className="text-4xl filter group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] transition-all duration-500">{integration.icon}</div>
                <div>
                  <h3 className="text-white font-gaming text-sm uppercase tracking-wider mb-1">{integration.name}</h3>
                  <p className="text-white/30 text-xs leading-relaxed max-w-sm">{integration.description}</p>
                </div>
              </div>
              <button
                onClick={() => handleIntegrationToggle(integration.key)}
                className={`px-5 py-2.5 rounded-lg border font-gaming text-[10px] uppercase tracking-widest transition-all duration-300 ${
                  integrations[integration.key]
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                {integrations[integration.key] ? 'Synchronized' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <Button
          onClick={onBack}
          variant="secondary"
          className="text-white"
        >
          Back
        </Button>
        <div className="flex gap-4">
          <Button
            onClick={onSkip}
            variant="secondary"
            className="text-white"
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white"
          >
            Complete Setup
          </Button>
        </div>
      </div>
    </div>
  )
}

// Complete Step Component
const CompleteStep: React.FC<{
  data: OnboardingData
  onNext: (data?: Partial<OnboardingData>) => void
  onSkip: () => void
  onBack: () => void
  isLastStep: boolean
  isFirstStep: boolean
}> = ({ onNext }) => {
  return (
    <div className="text-center">
      <div className="mb-8">
        <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl mx-auto mb-6 flex items-center justify-center rotate-3 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
          <span className="text-white text-4xl">🚀</span>
        </div>
        <h2 className="text-3xl font-gaming font-bold text-white mb-4 tracking-tight uppercase">
          System Operational
        </h2>
        <p className="text-white/40 text-lg leading-relaxed">
          Your profile is synced. Welcome to the cockpit, Pilot.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🎮</span>
          </div>
          <h3 className="text-white font-gaming text-xs uppercase tracking-wider mb-2">Discovery</h3>
          <p className="text-white/30 text-xs leading-relaxed">
            Neural filters are active. Discover your next world.
          </p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-white font-gaming text-xs uppercase tracking-wider mb-2">Analytics</h3>
          <p className="text-white/30 text-xs leading-relaxed">
            Telemetry is syncing. Track your evolution.
          </p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🌟</span>
          </div>
          <h3 className="text-white font-gaming text-xs uppercase tracking-wider mb-2">Legacy</h3>
          <p className="text-white/30 text-xs leading-relaxed">
            Connect your friends and build your gaming history.
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={() => onNext()}
          className="bg-gradient-gaming text-white px-10 py-4 font-gaming uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(139,92,246,0.4)] transform hover:-translate-y-1 transition-all"
        >
          Enter Dashboard
        </Button>
      </div>
    </div>
  )
}

export default OnboardingFlow
