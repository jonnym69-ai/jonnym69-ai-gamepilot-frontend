import React, { useState, useCallback } from 'react'
import { ENHANCED_MOODS, type EnhancedMood, type EnhancedMoodId, MOOD_COMBINATIONS } from '@gamepilot/static-data'
import { EnhancedMoodFilter, type MoodFilterContext } from '@gamepilot/identity-engine'
import { cn } from '../utils/cn'

export interface EnhancedMoodSelectorProps {
  onMoodChange?: (context: MoodFilterContext) => void
  initialMood?: EnhancedMoodId
  initialSecondaryMood?: EnhancedMoodId
  showCombinations?: boolean
  variant?: 'compact' | 'full' | 'minimal'
  className?: string
  enableHybridMode?: boolean
}

export const EnhancedMoodSelector: React.FC<EnhancedMoodSelectorProps> = ({
  onMoodChange,
  initialMood,
  initialSecondaryMood,
  showCombinations = true,
  variant = 'full',
  className,
  enableHybridMode = true
}) => {
  const [primaryMood, setPrimaryMood] = useState<EnhancedMoodId | undefined>(initialMood)
  const [secondaryMood, setSecondaryMood] = useState<EnhancedMoodId | undefined>(initialSecondaryMood)
  const [intensity, setIntensity] = useState(0.8)
  const [showSecondary, setShowSecondary] = useState(!!initialSecondaryMood)
  const [recommendedCombinations, setRecommendedCombinations] = useState<typeof MOOD_COMBINATIONS>([])

  const handlePrimaryMoodSelect = useCallback((moodId: EnhancedMoodId) => {
    setPrimaryMood(moodId)
    
    // Update recommended combinations
    const combinations = EnhancedMoodFilter.getRecommendedCombinations(moodId)
    setRecommendedCombinations(combinations)
    
    // Reset secondary mood if it conflicts
    if (secondaryMood) {
      const isValid = EnhancedMoodFilter.validateCombination(moodId, secondaryMood)
      if (!isValid) {
        setSecondaryMood(undefined)
        setShowSecondary(false)
      }
    }
    
    // Trigger change callback
    if (onMoodChange && moodId) {
      const context: MoodFilterContext = {
        primaryMood: moodId,
        secondaryMood: secondaryMood,
        intensity
      }
      onMoodChange(context)
    }
  }, [secondaryMood, intensity, onMoodChange])

  const handleSecondaryMoodSelect = useCallback((moodId: EnhancedMoodId) => {
    if (!primaryMood) return
    
    // Validate combination
    const isValid = EnhancedMoodFilter.validateCombination(primaryMood, moodId)
    if (!isValid) return
    
    setSecondaryMood(moodId)
    
    // Trigger change callback
    if (onMoodChange) {
      const context: MoodFilterContext = {
        primaryMood,
        secondaryMood: moodId,
        intensity
      }
      onMoodChange(context)
    }
  }, [primaryMood, intensity, onMoodChange])

  const handleIntensityChange = useCallback((newIntensity: number) => {
    setIntensity(newIntensity)
    
    // Trigger change callback
    if (onMoodChange && primaryMood) {
      const context: MoodFilterContext = {
        primaryMood,
        secondaryMood,
        intensity: newIntensity
      }
      onMoodChange(context)
    }
  }, [primaryMood, secondaryMood, onMoodChange])

  const handleCombinationSelect = useCallback((combination: typeof MOOD_COMBINATIONS[0]) => {
    setPrimaryMood(combination.primaryMood)
    setSecondaryMood(combination.secondaryMood)
    setIntensity(combination.intensity)
    setShowSecondary(!!combination.secondaryMood)
    
    if (onMoodChange) {
      const context: MoodFilterContext = {
        primaryMood: combination.primaryMood,
        secondaryMood: combination.secondaryMood,
        intensity: combination.intensity
      }
      onMoodChange(context)
    }
  }, [onMoodChange])

  const getMoodButtonClasses = (mood: EnhancedMood, isActive: boolean, isSecondary: boolean = false) => {
    const baseClasses = 'relative flex flex-col items-center justify-center rounded-xl transition-all duration-300 cursor-pointer'
    
    const sizeClasses = variant === 'compact' 
      ? 'w-16 h-16 text-sm p-2' 
      : variant === 'minimal' 
        ? 'w-12 h-12 text-xs p-1'
        : 'w-20 h-20 text-base p-3'
    
    const activeClasses = isActive
      ? isSecondary 
        ? 'ring-2 ring-purple-500 bg-purple-500/20 scale-110 border-2 border-purple-400'
        : 'ring-2 ring-gaming-accent bg-gaming-accent/20 scale-110 border-2 border-gaming-accent'
      : 'hover:bg-gray-700/50 hover:scale-105 border-2 border-transparent'
    
    return cn(baseClasses, sizeClasses, activeClasses, mood.color)
  }

  const getEnergyIndicator = (energyLevel: number) => {
    const filledBars = Math.ceil(energyLevel / 2)
    return (
      <div className="flex gap-0.5 mt-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-1 h-3 rounded-full',
              i < filledBars ? 'bg-white/80' : 'bg-white/20'
            )}
          />
        ))}
      </div>
    )
  }

  const getSocialIndicator = (socialRequirement: number) => {
    if (variant === 'minimal') return null
    
    const icons = ['👤', '👥', '👨‍👩‍👧‍👦']
    const iconIndex = Math.min(Math.floor(socialRequirement / 3), 2)
    return (
      <div className="text-xs mt-1">
        {icons[iconIndex]}
      </div>
    )
  }

  const primaryMoodData = primaryMood ? ENHANCED_MOODS.find(m => m.id === primaryMood) : undefined
  const secondaryMoodData = secondaryMood ? ENHANCED_MOODS.find(m => m.id === secondaryMood) : undefined

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {ENHANCED_MOODS.map((mood) => (
          <button
            key={mood.id}
            onClick={() => handlePrimaryMoodSelect(mood.id)}
            className={getMoodButtonClasses(mood, mood.id === primaryMood)}
            title={mood.name}
          >
            <span className="text-lg">{mood.emoji}</span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('glass-morphism rounded-2xl p-6 space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">Select Your Gaming Mood</h3>
        <p className="text-gray-400 text-sm">
          Choose how you're feeling to get personalized game recommendations
        </p>
      </div>

      {/* Primary Mood Selection */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Primary Mood</h4>
        <div className="grid grid-cols-4 gap-3">
          {ENHANCED_MOODS.map((mood) => (
            <button
              key={mood.id}
              onClick={() => handlePrimaryMoodSelect(mood.id)}
              className={getMoodButtonClasses(mood, mood.id === primaryMood)}
              title={mood.name}
            >
              <span className="text-2xl mb-1">{mood.emoji}</span>
              <span className="text-xs text-white font-medium">{mood.name}</span>
              {getEnergyIndicator(mood.energyLevel)}
              {getSocialIndicator(mood.socialRequirement)}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Mood (Hybrid Mode) */}
      {enableHybridMode && primaryMood && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">
              Secondary Mood {secondaryMood && '(Optional)'}
            </h4>
            <button
              onClick={() => setShowSecondary(!showSecondary)}
              className="text-sm text-gaming-accent hover:text-gaming-accent/80 transition-colors"
            >
              {showSecondary ? 'Hide' : 'Add'} Secondary Mood
            </button>
          </div>
          
          {showSecondary && (
            <div className="grid grid-cols-4 gap-3">
              {ENHANCED_MOODS
                .filter(mood => mood.id !== primaryMood)
                .filter(mood => !primaryMoodData?.conflictingMoods.includes(mood.id))
                .map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => handleSecondaryMoodSelect(mood.id)}
                    className={getMoodButtonClasses(mood, mood.id === secondaryMood, true)}
                    title={mood.name}
                    disabled={primaryMoodData?.conflictingMoods.includes(mood.id)}
                  >
                    <span className="text-2xl mb-1">{mood.emoji}</span>
                    <span className="text-xs text-white font-medium">{mood.name}</span>
                    {getEnergyIndicator(mood.energyLevel)}
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Intensity Slider */}
      {primaryMood && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-semibold text-white">Mood Intensity</h4>
            <span className="text-sm text-gray-400">{Math.round(intensity * 100)}%</span>
          </div>
          <div className="relative">
            <label htmlFor="mood-intensity-slider" className="sr-only">
              Mood Intensity Slider - Adjust how strongly your mood should influence recommendations
            </label>
            <input
              id="mood-intensity-slider"
              type="range"
              min="0"
              max="100"
              value={intensity * 100}
              onChange={(e) => handleIntensityChange(parseInt(e.target.value) / 100)}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              aria-label="Mood Intensity - Adjust how strongly your mood should influence recommendations"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(intensity * 100)}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Subtle</span>
            <span>Moderate</span>
            <span>Strong</span>
          </div>
        </div>
      )}

      {/* Recommended Combinations */}
      {showCombinations && primaryMood && recommendedCombinations.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Recommended Combinations</h4>
          <div className="space-y-2">
            {recommendedCombinations.slice(0, 3).map((combo, index) => {
              const primary = ENHANCED_MOODS.find(m => m.id === combo.primaryMood)
              const secondary = combo.secondaryMood ? ENHANCED_MOODS.find(m => m.id === combo.secondaryMood) : null
              
              return (
                <button
                  key={index}
                  onClick={() => handleCombinationSelect(combo)}
                  className={cn(
                    'w-full p-3 rounded-lg border-2 transition-all duration-300',
                    'bg-gray-800/50 hover:bg-gray-700/50 border-gray-600 hover:border-gaming-accent',
                    'flex items-center justify-between'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{primary?.emoji}</span>
                    {secondary && <span className="text-xl">+ {secondary.emoji}</span>}
                    <span className="text-white font-medium">
                      {primary?.name}
                      {secondary && ` + ${secondary.name}`}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">{combo.context}</div>
                    <div className="text-xs text-gaming-accent">
                      {Math.round(combo.intensity * 100)}% match
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Current Selection Summary */}
      {primaryMoodData && (
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-2">Current Selection</h4>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{primaryMoodData.emoji}</span>
              <span className="text-white font-medium">{primaryMoodData.name}</span>
            </div>
            {secondaryMoodData && (
              <>
                <span className="text-gray-400">+</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{secondaryMoodData.emoji}</span>
                  <span className="text-white font-medium">{secondaryMoodData.name}</span>
                </div>
              </>
            )}
            <div className="ml-auto text-sm text-gray-400">
              {Math.round(intensity * 100)}% intensity
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            {primaryMoodData.description}
            {secondaryMoodData && ` + ${secondaryMoodData.description}`}
          </p>
        </div>
      )}
    </div>
  )
}
