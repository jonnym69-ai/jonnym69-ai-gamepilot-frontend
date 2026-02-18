import React from 'react'
import type { MoodState } from '../../../../../packages/identity-engine/src/persona'

interface PersonaMoodPulseProps {
  mood: MoodState | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Mood tone color mapping for visual indicators
 */
const MOOD_TONE_COLORS: Record<string, string> = {
  Calm: 'bg-blue-500',
  Hyped: 'bg-yellow-500',
  Competitive: 'bg-red-500',
  Reflective: 'bg-purple-500',
  Comfort: 'bg-green-500'
}

const SIZE_CLASSES = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4'
}

const PULSE_RING_SIZES = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8'
}

/**
 * Get tone color based on mood ID
 */
function getToneColor(moodId: string): string {
  // Map mood IDs to tones
  const moodToTone: Record<string, keyof typeof MOOD_TONE_COLORS> = {
    'chill': 'Calm',
    'story': 'Calm',
    'creative': 'Calm',
    'energetic': 'Hyped',
    'social': 'Hyped',
    'exploratory': 'Hyped',
    'competitive': 'Competitive',
    'focused': 'Competitive',
    'nostalgic': 'Reflective',
    'melancholic': 'Reflective',
    'cozy': 'Comfort',
    'relaxed': 'Comfort'
  }
  
  const tone = moodToTone[moodId] || 'Comfort'
  return MOOD_TONE_COLORS[tone]
}

/**
 * PersonaMoodPulse - Animated mood indicator with pulse effect
 * Displays current mood as a colored dot with animated pulse ring
 */
export const PersonaMoodPulse: React.FC<PersonaMoodPulseProps> = ({
  mood,
  size = 'md',
  className = ''
}) => {
  const colorClass = mood ? getToneColor(mood.moodId) : 'bg-gray-400'
  const sizeClass = SIZE_CLASSES[size]
  const pulseSizeClass = PULSE_RING_SIZES[size]
  
  return (
    <div className={`relative ${className}`}>
      {/* Pulse ring animation - REMOVED for accessibility */}
      {/* Removed dangerous flashing animation */}
      
      {/* Core mood dot */}
      <div
        className={`
          relative z-10
          ${colorClass}
          ${sizeClass}
          rounded-full
          shadow-md
          transition-colors duration-300
        `}
        title={mood ? `${mood.moodId} (Intensity: ${mood.intensity})` : 'No mood data'}
      />
      
      {/* Intensity indicator for higher intensity moods - NO FLASHING */}
      {mood && mood.intensity >= 7 && (
        <div
          className={`
            absolute top-0 right-0
            w-1.5 h-1.5
            bg-white
            rounded-full
          `}
        />
      )}
    </div>
  )
}
