import React from 'react'
import { cn } from '../utils/cn'

export interface MoodBarProps {
  currentMood?: string
  moods: Array<{
    id: string
    name: string
    emoji: string
    color: string
    intensity: number
    active?: boolean
  }>
  onMoodChange?: (moodId: string) => void
  className?: string
  variant?: 'compact' | 'full' | 'minimal'
}

export const MoodBar: React.FC<MoodBarProps> = ({
  currentMood,
  moods,
  onMoodChange,
  className,
  variant = 'full'
}) => {
  const getVariantClasses = () => {
    const variantClasses = {
      compact: 'p-2 gap-2',
      full: 'p-4 gap-3',
      minimal: 'p-1 gap-1'
    }
    return variantClasses[variant]
  }

  const getMoodButtonClasses = (mood: any, isActive: boolean) => {
    const baseClasses = 'relative flex items-center justify-center rounded-lg transition-all duration-300'
    
    const sizeClasses = {
      compact: 'w-10 h-10 text-sm',
      full: 'w-14 h-14 text-xl',
      minimal: 'w-8 h-8 text-xs'
    }
    
    const activeClasses = isActive
      ? 'ring-2 ring-gaming-accent bg-gaming-accent/20 scale-110'
      : 'hover:bg-gray-700 hover:scale-105'
    
    return cn(
      baseClasses,
      sizeClasses[variant],
      activeClasses,
      mood.color
    )
  }

  const getIntensityIndicator = (intensity: number) => {
    if (variant === 'minimal') return null
    
    const intensityLevels = Math.ceil(intensity / 20) // 1-5 levels
    return (
      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
        {Array.from({ length: intensityLevels }).map((_, i) => (
          <div
            key={i}
            className="w-1 h-1 bg-gaming-accent rounded-full"
          />
        ))}
      </div>
    )
  }

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center', getVariantClasses(), className)}>
        {moods.map((mood) => (
          <button
            key={mood.id}
            onClick={() => onMoodChange?.(mood.id)}
            className={getMoodButtonClasses(mood, mood.id === currentMood)}
            title={mood.name}
          >
            <span>{mood.emoji}</span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('glass-morphism rounded-xl', getVariantClasses(), className)}>
      {/* Current mood display */}
      {variant === 'full' && currentMood && (
        <div className="text-center mb-3">
          <p className="text-xs text-gray-400 mb-1">Current Mood</p>
          <div className="flex items-center justify-center gap-2">
            {(() => {
              const current = moods.find(m => m.id === currentMood)
              return current ? (
                <>
                  <span className="text-2xl">{current.emoji}</span>
                  <span className="text-white font-medium">{current.name}</span>
                </>
              ) : null
            })()}
          </div>
        </div>
      )}

      {/* Mood selection */}
      <div className="flex items-center justify-center flex-wrap">
        {moods.map((mood) => (
          <button
            key={mood.id}
            onClick={() => onMoodChange?.(mood.id)}
            className={getMoodButtonClasses(mood, mood.id === currentMood)}
            title={mood.name}
          >
            <span>{mood.emoji}</span>
            {getIntensityIndicator(mood.intensity)}
          </button>
        ))}
      </div>

      {/* Mood descriptions */}
      {variant === 'full' && (
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-400">
            {(() => {
              const current = moods.find(m => m.id === currentMood)
              return current ? current.name : 'Select your current gaming mood'
            })()}
          </p>
        </div>
      )}
    </div>
  )
}
