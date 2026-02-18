import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MOODS, type MoodId } from '@gamepilot/static-data'

/**
 * Simplified Mood Selector for GamePilot UI
 * This component can be easily integrated into the existing interface
 */

interface SimpleMoodSelectorProps {
  onMoodChange?: (mood: MoodId, secondaryMood?: MoodId) => void
  className?: string
  variant?: 'compact' | 'full'
}

export function SimpleMoodSelector({ onMoodChange, className = '', variant = 'compact' }: SimpleMoodSelectorProps) {
  const [primaryMood, setPrimaryMood] = useState<MoodId | null>(null)
  const [secondaryMood, setSecondaryMood] = useState<MoodId | null>(null)
  const [showSecondary, setShowSecondary] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handlePrimaryMoodSelect = useCallback((moodId: MoodId) => {
    setPrimaryMood(moodId)
    
    // Reset secondary if it conflicts (basic compatibility check)
    if (secondaryMood) {
      const primary = MOODS.find(m => m.id === moodId)
      // Simple conflict check for basic moods
      if (primary && ((primary.id === 'competitive' && secondaryMood === 'chill') || 
          (primary.id === 'chill' && secondaryMood === 'competitive'))) {
        setSecondaryMood(null)
        setShowSecondary(false)
      }
    }
    
    // Call parent callback
    if (onMoodChange) {
      onMoodChange(moodId, secondaryMood || undefined)
    }
  }, [secondaryMood, onMoodChange])

  const handleSecondaryMoodSelect = useCallback((moodId: MoodId) => {
    if (!primaryMood) return
    
    // Simple compatibility check for basic moods
    const primary = MOODS.find(m => m.id === primaryMood)
    if (primary && !((primary.id === 'competitive' && moodId === 'chill') || 
                    (primary.id === 'chill' && moodId === 'competitive'))) {
      setSecondaryMood(moodId)
      
      if (onMoodChange) {
        onMoodChange(primaryMood, moodId)
      }
    }
  }, [primaryMood, onMoodChange])

  const clearMoods = useCallback(() => {
    setPrimaryMood(null)
    setSecondaryMood(null)
    setShowSecondary(false)
    
    if (onMoodChange) {
      onMoodChange('', undefined)
    }
  }, [onMoodChange])

  const getMoodButtonClasses = (mood: any, isActive: boolean, isSecondary: boolean = false) => {
    const baseClasses = 'relative flex flex-col items-center justify-center rounded-xl transition-all duration-300 cursor-pointer overflow-hidden group'
    
    const sizeClasses = variant === 'compact' 
      ? 'w-14 h-14 text-sm p-2' 
      : 'w-20 h-20 text-base p-3'
    
    // Enhanced visual states with mood-specific colors
    const getMoodSpecificStyles = (moodId: string) => {
      switch (moodId) {
        case 'competitive':
          return isActive
            ? 'bg-gradient-to-br from-red-600 to-orange-600 shadow-red-500/50 shadow-lg scale-110 border-2 border-red-400'
            : 'bg-gradient-to-br from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 border-2 border-red-500/30 hover:border-red-400/50'
        case 'chill':
          return isActive
            ? 'bg-gradient-to-br from-blue-600 to-cyan-600 shadow-blue-500/50 shadow-lg scale-110 border-2 border-blue-400'
            : 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border-2 border-blue-500/30 hover:border-blue-400/50'
        case 'story':
          return isActive
            ? 'bg-gradient-to-br from-purple-600 to-pink-600 shadow-purple-500/50 shadow-lg scale-110 border-2 border-purple-400'
            : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border-2 border-purple-500/30 hover:border-purple-400/50'
        case 'creative':
          return isActive
            ? 'bg-gradient-to-br from-green-600 to-emerald-600 shadow-green-500/50 shadow-lg scale-110 border-2 border-green-400'
            : 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border-2 border-green-500/30 hover:border-green-400/50'
        case 'social':
          return isActive
            ? 'bg-gradient-to-br from-teal-600 to-cyan-600 shadow-teal-500/50 shadow-lg scale-110 border-2 border-teal-400'
            : 'bg-gradient-to-br from-teal-500/20 to-cyan-500/20 hover:from-teal-500/30 hover:to-cyan-500/30 border-2 border-teal-500/30 hover:border-teal-400/50'
        case 'focused':
          return isActive
            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 shadow-indigo-500/50 shadow-lg scale-110 border-2 border-indigo-400'
            : 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border-2 border-indigo-500/30 hover:border-indigo-400/50'
        case 'energetic':
          return isActive
            ? 'bg-gradient-to-br from-yellow-600 to-orange-600 shadow-yellow-500/50 shadow-lg scale-110 border-2 border-yellow-400'
            : 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border-2 border-yellow-500/30 hover:border-yellow-400/50'
        case 'exploratory':
          return isActive
            ? 'bg-gradient-to-br from-emerald-600 to-teal-600 shadow-emerald-500/50 shadow-lg scale-110 border-2 border-emerald-400'
            : 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border-2 border-emerald-500/30 hover:border-emerald-400/50'
        default:
          return isActive
            ? 'bg-gradient-to-br from-gray-600 to-slate-600 shadow-gray-500/50 shadow-lg scale-110 border-2 border-gray-400'
            : 'bg-gradient-to-br from-gray-500/20 to-slate-500/20 hover:from-gray-500/30 hover:to-slate-500/30 border-2 border-gray-500/30 hover:border-gray-400/50'
      }
    }
    
    const activeClasses = getMoodSpecificStyles(mood.id)
    
    return `${baseClasses} ${sizeClasses} ${activeClasses}`
  }

  const primaryMoodData = primaryMood ? MOODS.find(m => m.id === primaryMood) : undefined
  const secondaryMoodData = secondaryMood ? MOODS.find(m => m.id === secondaryMood) : undefined

  if (variant === 'compact') {
    return (
      <div className={`glass-morphism rounded-xl p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">How are you feeling?</h3>
          {(primaryMood || secondaryMood) && (
            <button
              onClick={clearMoods}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        
        {/* Primary Mood Selection */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {MOODS.map((mood, index) => (
            <motion.button
              key={mood.id}
              onClick={() => handlePrimaryMoodSelect(mood.id)}
              className={getMoodButtonClasses(mood, mood.id === primaryMood)}
              title={mood.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative z-10">
                <span className="text-2xl mb-1 block">{mood.emoji}</span>
                <span className="text-xs text-white font-bold drop-shadow-lg">{mood.name}</span>
              </div>
              {mood.id === primaryMood && (
                <motion.div
                  className="absolute inset-0 bg-white/20 rounded-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.3, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Secondary Mood (if primary selected) */}
        {primaryMood && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Add secondary mood?</span>
              <button
                onClick={() => setShowSecondary(!showSecondary)}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                {showSecondary ? 'Hide' : 'Show'}
              </button>
            </div>
            
            {showSecondary && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-4 gap-3"
              >
                {MOODS
                  .filter(mood => mood.id !== primaryMood)
                  .map((mood, index) => (
                    <motion.button
                      key={mood.id}
                      onClick={() => handleSecondaryMoodSelect(mood.id)}
                      className={getMoodButtonClasses(mood, mood.id === secondaryMood, true)}
                      title={mood.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="relative z-10">
                        <span className="text-xl mb-1 block">{mood.emoji}</span>
                        <span className="text-xs text-white font-bold drop-shadow-lg">{mood.name}</span>
                      </div>
                      {mood.id === secondaryMood && (
                        <motion.div
                          className="absolute inset-0 bg-white/20 rounded-xl"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.3, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.button>
                  ))}
              </motion.div>
            )}
          </div>
        )}

        {/* Current Selection Display */}
        {(primaryMoodData || secondaryMoodData) && (
          <div className="mt-3 p-2 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-2">
              {primaryMoodData && (
                <>
                  <span className="text-lg">{primaryMoodData.emoji}</span>
                  <span className="text-sm text-white">{primaryMoodData.name}</span>
                </>
              )}
              {secondaryMoodData && (
                <>
                  <span className="text-gray-400">+</span>
                  <span className="text-lg">{secondaryMoodData.emoji}</span>
                  <span className="text-sm text-white">{secondaryMoodData.name}</span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {primaryMoodData?.description}
              {secondaryMoodData && ` + ${secondaryMoodData.description}`}
            </p>
          </div>
        )}
      </div>
    )
  }

  // Full variant
  return (
    <div className={`glass-morphism rounded-2xl p-6 ${className}`}>
      <h2 className="text-xl font-bold text-white mb-4">Select Your Gaming Mood</h2>
      <p className="text-gray-400 text-sm mb-6">
        Choose how you're feeling to get personalized game recommendations
      </p>

      {/* Primary Mood Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Primary Mood</h3>
        <div className="grid grid-cols-4 gap-3">
          {MOODS.map((mood) => (
            <button
              key={mood.id}
              onClick={() => handlePrimaryMoodSelect(mood.id)}
              className={getMoodButtonClasses(mood, mood.id === primaryMood)}
              title={mood.name}
            >
              <span className="text-2xl mb-1">{mood.emoji}</span>
              <span className="text-xs text-white font-medium">{mood.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Mood */}
      {primaryMood && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">Secondary Mood (Optional)</h3>
            <button
              onClick={() => setShowSecondary(!showSecondary)}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              {showSecondary ? 'Hide' : 'Add Secondary Mood'}
            </button>
          </div>
          
          {showSecondary && (
            <div className="grid grid-cols-4 gap-3">
              {MOODS
                .filter(mood => mood.id !== primaryMood)
                .map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => handleSecondaryMoodSelect(mood.id)}
                    className={getMoodButtonClasses(mood, mood.id === secondaryMood, true)}
                    title={mood.name}
                  >
                    <span className="text-2xl mb-1">{mood.emoji}</span>
                    <span className="text-xs text-white font-medium">{mood.name}</span>
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Current Selection */}
      {(primaryMoodData || secondaryMoodData) && (
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-2">Current Selection</h3>
          <div className="flex items-center gap-4 mb-2">
            {primaryMoodData && (
              <div className="flex items-center gap-2">
                <span className="text-2xl">{primaryMoodData.emoji}</span>
                <span className="text-white font-medium">{primaryMoodData.name}</span>
              </div>
            )}
            {secondaryMoodData && (
              <>
                <span className="text-gray-400">+</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{secondaryMoodData.emoji}</span>
                  <span className="text-white font-medium">{secondaryMoodData.name}</span>
                </div>
              </>
            )}
            <button
              onClick={clearMoods}
              className="ml-auto text-sm text-gray-400 hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
          <p className="text-sm text-gray-400">
            {primaryMoodData?.description}
            {secondaryMoodData && ` + ${secondaryMoodData.description}`}
          </p>
        </div>
      )}
    </div>
  )
}
